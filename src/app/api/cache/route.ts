import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

// Redis客户端配置
const getRedisClient = async () => {
  // 如果没有配置Redis URL，直接返回错误
  if (!process.env.REDIS_URL) {
    throw new Error('Redis URL not configured');
  }

  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 10000, // 10秒连接超时
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

    // 检查Redis是否可用
    if (!process.env.REDIS_URL) {
      console.warn('Redis not configured, returning cache miss');
      return NextResponse.json({ data: null }, { status: 404 });
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
    console.warn('Redis GET error, treating as cache miss:', error);
    // 不返回500错误，而是返回404（缓存未命中）
    // 这样应用程序可以继续正常工作而不依赖Redis
    return NextResponse.json({ data: null }, { status: 404 });
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

    // 检查Redis是否可用
    if (!process.env.REDIS_URL) {
      console.warn('Redis not configured, cache set ignored');
      return NextResponse.json({ 
        success: true,
        message: 'Cache disabled - operation ignored'
      });
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
    console.warn('Redis SET error, ignoring cache operation:', error);
    // 不返回错误，而是返回成功
    // 这样应用程序可以继续正常工作而不依赖Redis
    return NextResponse.json({ 
      success: true,
      message: 'Cache operation failed but ignored'
    });
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

    // 检查Redis是否可用
    if (!process.env.REDIS_URL) {
      console.warn('Redis not configured, cache delete ignored');
      return NextResponse.json({ 
        success: true,
        deletedCount: 0,
        message: 'Cache disabled - delete ignored'
      });
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
    console.warn('Redis DELETE error, ignoring cache operation:', error);
    // 不返回错误，而是返回成功
    return NextResponse.json({ 
      success: true,
      deletedCount: 0,
      message: 'Cache delete failed but ignored'
    });
  }
} 