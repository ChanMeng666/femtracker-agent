// Redis客户端 - 通过API路由实现缓存功能
// 客户端安全的缓存接口，通过API路由与Redis交互

export const cache = {
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const response = await fetch(`/api/cache?key=${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        console.error('Cache get failed:', await response.text());
        return null;
      }

      const result = await response.json();
      return result.data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key: string, value: unknown, ttl: number = 3600): Promise<boolean> {
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value, ttl }),
      });

      if (!response.ok) {
        console.error('Cache set failed:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/cache?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Cache delete failed:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/cache?pattern=${encodeURIComponent(pattern)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Cache pattern delete failed:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Cache pattern delete error:', error);
      return false;
    }
  },

  // 辅助方法：生成带用户ID的缓存键
  userKey(userId: string, suffix: string): string {
    return `user:${userId}:${suffix}`;
  },

  // 辅助方法：生成健康数据缓存键
  healthKey(userId: string, dataType: string, timeRange?: string): string {
    const base = `health:${userId}:${dataType}`;
    return timeRange ? `${base}:${timeRange}` : base;
  }
}; 