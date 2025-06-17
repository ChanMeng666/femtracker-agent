import { createClient } from 'redis'

const redis = createClient({
  url: process.env.REDIS_URL
})

redis.on('error', (err) => console.log('Redis Client Error', err))

// Connect to Redis
if (!redis.isOpen) {
  redis.connect().catch(console.error)
}

export { redis }

// Utility functions for caching
export const cache = {
  async get(key: string) {
    try {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  },

  async set(key: string, value: unknown, ttl: number = 3600) {
    try {
      await redis.setEx(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  },

  async del(key: string) {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  },

  async invalidatePattern(pattern: string) {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(keys)
      }
    } catch (error) {
      console.error('Cache invalidate error:', error)
    }
  }
} 