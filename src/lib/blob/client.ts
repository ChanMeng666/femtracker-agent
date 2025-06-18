// Vercel Blob客户端工具
// 提供简化的文件上传和管理接口

export interface BlobUploadOptions {
  folder?: string;
  access?: 'public' | 'private';
  filename?: string;
}

export interface BlobUploadResult {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

export interface BlobUploadResponse {
  success: boolean;
  blob?: BlobUploadResult;
  error?: string;
  details?: string;
}

export class BlobClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * 上传文件到Vercel Blob
   */
  async upload(
    file: File,
    options: BlobUploadOptions = {}
  ): Promise<BlobUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const metadata = {
        filename: options.filename || file.name,
        contentType: file.type,
        access: options.access || 'public',
        folder: options.folder,
      };
      
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch(`${this.baseUrl}/api/blob/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Upload failed',
          details: result.details,
        };
      }

      return {
        success: true,
        blob: result.blob,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 上传用户头像
   */
  async uploadAvatar(file: File, userId: string): Promise<BlobUploadResponse> {
    return this.upload(file, {
      folder: 'avatars',
      filename: `${userId}.${file.type.split('/')[1]}`,
      access: 'public',
    });
  }

  /**
   * 上传数据导出文件
   */
  async uploadDataExport(
    data: Record<string, unknown> | Record<string, unknown>[],
    userId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<BlobUploadResponse> {
    try {
      let content: string;
      let mimeType: string;
      let filename: string;

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        filename = `health-data-export-${new Date().toISOString().split('T')[0]}.json`;
      } else {
        // CSV format - 简化实现
        content = this.convertToCSV(data);
        mimeType = 'text/csv';
        filename = `health-data-export-${new Date().toISOString().split('T')[0]}.csv`;
      }

      const blob = new Blob([content], { type: mimeType });
      const file = new File([blob], filename, { type: mimeType });

      return this.upload(file, {
        folder: 'exports',
        filename,
        access: 'private',
      });
    } catch (error) {
      return {
        success: false,
        error: 'Export creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 上传图表图片
   */
  async uploadChart(
    imageBlob: Blob,
    chartType: string,
    userId: string
  ): Promise<BlobUploadResponse> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${userId}-${chartType}-chart-${timestamp}.png`;
    const file = new File([imageBlob], filename, { type: 'image/png' });

    return this.upload(file, {
      folder: 'charts',
      filename,
      access: 'private',
    });
  }

  /**
   * 获取文件的公共URL（如果文件是public的话）
   */
  getPublicUrl(pathname: string): string {
    // Vercel Blob会自动提供公共URL
    return `https://blob.vercel-storage.com/${pathname}`;
  }

  /**
   * 简化的CSV转换（基础实现）
   */
  private convertToCSV(data: Record<string, unknown> | Record<string, unknown>[]): string {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]);
      const csvHeaders = headers.join(',');
      
      const csvRows = data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (Array.isArray(value)) {
            return `"${value.join(';')}"`;
          }
          return `"${value}"`;
        }).join(',')
      );
      
      return [csvHeaders, ...csvRows].join('\n');
    }
    
    // 如果不是数组，转换为简单的key-value CSV
    const entries = Object.entries(data);
    return entries.map(([key, value]) => `"${key}","${value}"`).join('\n');
  }

  /**
   * 验证文件类型
   */
  static isValidFileType(file: File): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/json',
      'text/csv',
      'application/pdf',
      'text/plain',
    ];
    
    return allowedTypes.includes(file.type);
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 默认实例
export const blobClient = new BlobClient(); 