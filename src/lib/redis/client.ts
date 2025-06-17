// Redis客户端 - 暂时禁用以解决构建问题
// TODO: 重新启用Redis功能在API路由中

// 客户端安全的缓存接口（目前不执行实际操作）
export const cache = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(key: string): Promise<null> {
    // TODO: 通过API路由实现缓存
    return null;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    // TODO: 通过API路由实现缓存
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async del(key: string): Promise<void> {
    // TODO: 通过API路由实现缓存  
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async invalidatePattern(pattern: string): Promise<void> {
    // TODO: 通过API路由实现缓存
  }
}; 