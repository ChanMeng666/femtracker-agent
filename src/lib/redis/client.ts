// Redis客户端 - 通过API路由实现缓存功能
// 客户端安全的缓存接口，通过API路由与Redis交互

const cache = {
  // Improved get method with fallback
  get: async <T = any>(key: string): Promise<T | null> => {
    try {
      const response = await fetch(`/api/cache?key=${encodeURIComponent(key)}`);
      
      if (response.status === 404) {
        // Cache miss is normal, return null
        return null;
      }
      
      if (!response.ok) {
        console.warn(`Cache GET failed for key ${key}: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.warn('Cache get error, continuing without cache:', error);
      return null;
    }
  },

  // Improved set method with error handling
  set: async <T = any>(key: string, value: T, ttl: number = 3600): Promise<boolean> => {
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value, ttl }),
      });

      if (!response.ok) {
        console.warn(`Cache SET failed for key ${key}: ${response.status}`);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Cache set error, continuing without cache:', error);
      return false;
    }
  },

  // Improved delete method
  del: async (pattern: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/cache?pattern=${encodeURIComponent(pattern)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.warn(`Cache DELETE failed for pattern ${pattern}: ${response.status}`);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Cache delete error, continuing without cache:', error);
      return false;
    }
  },

  // For backward compatibility - alias for del
  invalidatePattern: async (pattern: string): Promise<boolean> => {
    return cache.del(pattern);
  },

  // User-specific cache key generator
  userKey: (userId: string, suffix: string): string => {
    return `user:${userId}:${suffix}`;
  },

  // 辅助方法：生成健康数据缓存键
  healthKey: (userId: string, type: string, timeRange?: string) => 
    `health:${userId}:${type}${timeRange ? `:${timeRange}` : ''}`,
};

export { cache }; 