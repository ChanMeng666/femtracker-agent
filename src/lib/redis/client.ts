// Redis客户端 - 通过API路由实现缓存功能
// 客户端安全的缓存接口，通过API路由与Redis交互

export const cache = {
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      // 增加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      const response = await fetch(`/api/cache?key=${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        console.warn('Cache get failed, continuing without cache:', await response.text());
        return null; // 降级处理：缓存失败时返回null，不影响主流程
      }

      const result = await response.json();
      return result.data as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Cache get timeout, continuing without cache');
      } else {
        console.warn('Cache get error, continuing without cache:', error);
      }
      return null; // 容错处理：任何缓存错误都不应影响主流程
    }
  },

  async set(key: string, value: unknown, ttl: number = 3600): Promise<boolean> {
    try {
      // 增加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value, ttl }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Cache set failed, continuing without cache:', await response.text());
        return false; // 降级处理：缓存失败不影响主流程
      }

      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Cache set timeout, continuing without cache');
      } else {
        console.warn('Cache set error, continuing without cache:', error);
      }
      return false; // 容错处理：任何缓存错误都不应影响主流程
    }
  },

  async del(key: string): Promise<boolean> {
    try {
      // 增加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      const response = await fetch(`/api/cache?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Cache delete failed, continuing without cache:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Cache delete timeout, continuing without cache');
      } else {
        console.warn('Cache delete error, continuing without cache:', error);
      }
      return false;
    }
  },

  async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      // 增加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      const response = await fetch(`/api/cache?pattern=${encodeURIComponent(pattern)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Cache pattern delete failed, continuing without cache:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Cache pattern delete timeout, continuing without cache');
      } else {
        console.warn('Cache pattern delete error, continuing without cache:', error);
      }
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