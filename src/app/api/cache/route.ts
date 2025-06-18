import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

// Redis客户端配置
const getRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      connectTimeout: 60000,
    },
  });

  if (!client.isOpen) {
    await client.connect();
  }
  
  return client;
};

// GET: 获取缓存数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    const client = await getRedisClient();
    const value = await client.get(key);
    
    await client.disconnect();

    if (value === null) {
      return NextResponse.json({ data: null }, { status: 404 });
    }

    return NextResponse.json({ 
      data: JSON.parse(value),
      key 
    });

  } catch (error) {
    console.error('Redis GET error:', error);
    return NextResponse.json({ 
      error: 'Cache get failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST: 设置缓存数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, ttl = 3600 } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ 
        error: 'Key and value are required' 
      }, { status: 400 });
    }

    const client = await getRedisClient();
    
    // 设置带TTL的缓存
    await client.setEx(key, ttl, JSON.stringify(value));
    
    await client.disconnect();

    return NextResponse.json({ 
      success: true,
      key,
      ttl,
      message: 'Cache set successfully'
    });

  } catch (error) {
    console.error('Redis SET error:', error);
    return NextResponse.json({ 
      error: 'Cache set failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: 删除缓存数据
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const pattern = searchParams.get('pattern');

    if (!key && !pattern) {
      return NextResponse.json({ 
        error: 'Key or pattern is required' 
      }, { status: 400 });
    }

    const client = await getRedisClient();
    
    let deletedCount = 0;
    
    if (pattern) {
      // 删除匹配模式的所有key
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        deletedCount = await client.del(keys);
      }
    } else if (key) {
      // 删除单个key
      deletedCount = await client.del(key);
    }
    
    await client.disconnect();

    return NextResponse.json({ 
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} cache entries`
    });

  } catch (error) {
    console.error('Redis DELETE error:', error);
    return NextResponse.json({ 
      error: 'Cache delete failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 