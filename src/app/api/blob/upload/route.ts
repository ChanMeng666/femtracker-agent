import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 文件类型验证schema
const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  access: z.enum(['public', 'private']).default('public'),
  folder: z.string().optional(),
});

// 支持的文件类型
const ALLOWED_FILE_TYPES = {
  // 图片文件
  'image/jpeg': { extension: 'jpg', maxSize: 10 * 1024 * 1024 }, // 10MB
  'image/png': { extension: 'png', maxSize: 10 * 1024 * 1024 },
  'image/gif': { extension: 'gif', maxSize: 5 * 1024 * 1024 },
  'image/webp': { extension: 'webp', maxSize: 10 * 1024 * 1024 },
  
  // 文档文件
  'application/json': { extension: 'json', maxSize: 50 * 1024 * 1024 }, // 50MB for data exports
  'text/csv': { extension: 'csv', maxSize: 50 * 1024 * 1024 },
  'application/pdf': { extension: 'pdf', maxSize: 20 * 1024 * 1024 },
  
  // 其他
  'text/plain': { extension: 'txt', maxSize: 10 * 1024 * 1024 },
};

export async function POST(request: NextRequest) {
  try {
    // 验证认证状态 (这里可以添加JWT验证)
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 解析metadata
    let parsedMetadata;
    try {
      parsedMetadata = uploadSchema.parse(JSON.parse(metadata || '{}'));
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

    // 验证文件类型
    const fileTypeInfo = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
    if (!fileTypeInfo) {
      return NextResponse.json({ 
        error: 'Unsupported file type',
        supportedTypes: Object.keys(ALLOWED_FILE_TYPES)
      }, { status: 400 });
    }

    // 验证文件大小
    if (file.size > fileTypeInfo.maxSize) {
      return NextResponse.json({ 
        error: 'File too large',
        maxSize: fileTypeInfo.maxSize,
        actualSize: file.size
      }, { status: 400 });
    }

    // 生成文件路径
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFilename = parsedMetadata.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = parsedMetadata.folder || 'uploads';
    const pathname = `${folder}/${timestamp}-${sanitizedFilename}`;

    // 上传到Vercel Blob
    const blob = await put(pathname, file, {
      access: parsedMetadata.access as 'public',
      contentType: file.type,
    });

    // 返回成功响应
    return NextResponse.json({
      success: true,
      blob: {
        url: blob.url,
        pathname: blob.pathname,
        size: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      },
      metadata: parsedMetadata,
    });

  } catch (error) {
    console.error('Blob upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET方法用于获取上传的文件列表（可选功能）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'uploads';
    
    // 这里可以实现文件列表功能
    // 注意：Vercel Blob目前不支持列表操作，所以我们需要在数据库中维护文件记录
    
    return NextResponse.json({
      message: 'File listing not implemented yet',
      suggestion: 'Use database to track uploaded files',
      requestedFolder: folder
    });

  } catch (error) {
    console.error('Blob list error:', error);
    return NextResponse.json({ 
      error: 'Failed to list files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 