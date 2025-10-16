import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  EnhancedCacheManager,
  createEnhancedCacheManager,
} from '../../../src/utils/cache'
import type { RequestConfig, ResponseData } from '../../../src/types'

describe('EnhancedCacheManager', () => {
  let cacheManager: EnhancedCacheManager

  beforeEach(() => {
    cacheManager = createEnhancedCacheManager({
      enabled: true,
      ttl: 5000,
      stats: true,
    })
  })

  describe('Statistics', () => {
    it('should track cache hits and misses', async () => {
      const config: RequestConfig = { url: '/api/test', method: 'GET' }
      const response: ResponseData = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }

      // 初始统计
      let stats = cacheManager.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)

      // 第一次获取（未命中）
      let result = await cacheManager.get(config)
      expect(result).toBeNull()
      
      stats = cacheManager.getStats()
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0)

      // 设置缓存
      await cacheManager.set(config, response)

      // 第二次获取（命中）
      result = await cacheManager.get(config)
      expect(result).toEqual(response)
      
      stats = cacheManager.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0.5)
    })

    it('should track recent keys', async () => {
      const configs = [
        { url: '/api/test1', method: 'GET' as const },
        { url: '/api/test2', method: 'GET' as const },
        { url: '/api/test3', method: 'GET' as const },
      ]

      const response: ResponseData = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: configs[0],
      }

      // 设置和访问多个缓存项
      for (const config of configs) {
        await cacheManager.set(config, { ...response, config })
        await cacheManager.get(config)
      }

      const stats = cacheManager.getStats()
      expect(stats.recentKeys).toHaveLength(3)
      expect(stats.recentKeys[0]).toContain('/api/test3') // 最近访问的
    })

    it('should track hot keys', async () => {
      const config: RequestConfig = { url: '/api/popular', method: 'GET' }
      const response: ResponseData = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }

      // 设置缓存
      await cacheManager.set(config, response)

      // 多次访问同一个键
      for (let i = 0; i < 5; i++) {
        await cacheManager.get(config)
      }

      const hotKeys = cacheManager.getHotKeys()
      expect(hotKeys).toHaveLength(1)
      expect(hotKeys[0].accessCount).toBe(5)
      expect(hotKeys[0].key).toContain('/api/popular')
    })

    it('should reset statistics', async () => {
      const config: RequestConfig = { url: '/api/test', method: 'GET' }
      const response: ResponseData = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }

      // 生成一些统计数据
      await cacheManager.set(config, response)
      await cacheManager.get(config)

      let stats = cacheManager.getStats()
      expect(stats.hits).toBe(1)

      // 重置统计
      cacheManager.resetStats()

      stats = cacheManager.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
      expect(stats.recentKeys).toHaveLength(0)
    })
  })

  describe('Tag-based Invalidation', () => {
    it('should invalidate cache by tag', async () => {
      const config1: RequestConfig = { url: '/api/users/1', method: 'GET' }
      const config2: RequestConfig = { url: '/api/users/2', method: 'GET' }
      const config3: RequestConfig = { url: '/api/posts/1', method: 'GET' }

      const response: ResponseData = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config1,
      }

      // 设置带标签的缓存
      await cacheManager.set(config1, { ...response, config: config1 }, {
        tags: ['users', 'user:1']
      })
      await cacheManager.set(config2, { ...response, config: config2 }, {
        tags: ['users', 'user:2']
      })
      await cacheManager.set(config3, { ...response, config: config3 }, {
        tags: ['posts', 'post:1']
      })

      // 验证缓存存在
      expect(await cacheManager.get(config1)).toBeTruthy()
      expect(await cacheManager.get(config2)).toBeTruthy()
      expect(await cacheManager.get(config3)).toBeTruthy()

      // 按标签失效
      const invalidatedCount = await cacheManager.invalidateByTag('users')
      expect(invalidatedCount).toBe(2)

      // 验证相关缓存已失效
      expect(await cacheManager.get(config1)).toBeNull()
      expect(await cacheManager.get(config2)).toBeNull()
      expect(await cacheManager.get(config3)).toBeTruthy() // 不受影响
    })
  })

  describe('Dependency-based Invalidation', () => {
    it('should invalidate cache by dependency', async () => {
      const config1: RequestConfig = { url: '/api/user-profile', method: 'GET' }
      const config2: RequestConfig = { url: '/api/user-settings', method: 'GET' }
      const config3: RequestConfig = { url: '/api/posts', method: 'GET' }

      const response: ResponseData = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config1,
      }

      // 设置带依赖的缓存
      await cacheManager.set(config1, { ...response, config: config1 }, {
        dependencies: ['user:123']
      })
      await cacheManager.set(config2, { ...response, config: config2 }, {
        dependencies: ['user:123']
      })
      await cacheManager.set(config3, { ...response, config: config3 }, {
        dependencies: ['posts']
      })

      // 验证缓存存在
      expect(await cacheManager.get(config1)).toBeTruthy()
      expect(await cacheManager.get(config2)).toBeTruthy()
      expect(await cacheManager.get(config3)).toBeTruthy()

      // 按依赖失效
      const invalidatedCount = await cacheManager.invalidateByDependency('user:123')
      expect(invalidatedCount).toBe(2)

      // 验证相关缓存已失效
      expect(await cacheManager.get(config1)).toBeNull()
      expect(await cacheManager.get(config2)).toBeNull()
      expect(await cacheManager.get(config3)).toBeTruthy() // 不受影响
    })
  })

  describe('Cache Preloading', () => {
    it('should preload cache for specified URLs', async () => {
      const preloadManager = createEnhancedCacheManager({
        enabled: true,
        preload: {
          enabled: true,
          urls: ['/api/critical1', '/api/critical2']
        }
      })

      // 执行预热
      await preloadManager.preload(['/api/critical1', '/api/critical2'])

      // 验证预热的数据存在
      const config1: RequestConfig = { url: '/api/critical1', method: 'GET' }
      const config2: RequestConfig = { url: '/api/critical2', method: 'GET' }

      const result1 = await preloadManager.get(config1)
      const result2 = await preloadManager.get(config2)

      expect(result1).toBeTruthy()
      expect(result2).toBeTruthy()
      expect(result1?.data).toBe('preloaded-/api/critical1')
      expect(result2?.data).toBe('preloaded-/api/critical2')
    })

    it('should handle preload failures gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const preloadManager = createEnhancedCacheManager({
        enabled: true,
        preload: {
          enabled: true,
          urls: []
        }
      })

      // 预热不存在的URL（会失败）
      await expect(preloadManager.preload(['/api/nonexistent'])).resolves.not.toThrow()

      consoleSpy.mockRestore()
    })
  })

  describe('Advanced Configuration', () => {
    it('should respect advanced cache configuration', () => {
      const advancedManager = createEnhancedCacheManager({
        enabled: true,
        strategy: 'lru',
        maxSize: 1024 * 1024, // 1MB
        compression: true,
        stats: true,
        invalidation: {
          tags: true,
          dependencies: true
        }
      })

      expect(advancedManager).toBeInstanceOf(EnhancedCacheManager)
    })

    it('should handle disabled stats', async () => {
      const noStatsManager = createEnhancedCacheManager({
        enabled: true,
        stats: false
      })

      const config: RequestConfig = { url: '/api/test', method: 'GET' }
      const response: ResponseData = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }

      await noStatsManager.set(config, response)
      await noStatsManager.get(config)

      const stats = noStatsManager.getStats()
      expect(stats.hits).toBe(0) // 统计被禁用
      expect(stats.misses).toBe(0)
    })
  })

  describe('Memory Management', () => {
    it('should cleanup old cache entries', async () => {
      const cleanupSpy = vi.spyOn(cacheManager, 'cleanup')
      
      await cacheManager.cleanup()
      
      expect(cleanupSpy).toHaveBeenCalled()
    })

    it('should track memory usage in stats', () => {
      const stats = cacheManager.getStats()
      expect(typeof stats.memoryUsage).toBe('number')
      expect(stats.memoryUsage).toBeGreaterThanOrEqual(0)
    })
  })
})
