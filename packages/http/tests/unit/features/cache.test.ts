import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withCache } from '../../../src/features/cache'
import type { RequestConfig, ResponseData } from '../../../src/types'

describe('Cache Feature', () => {
  let mockNext: ReturnType<typeof vi.fn>
  let mockConfig: RequestConfig
  let mockResponse: ResponseData

  beforeEach(() => {
    mockNext = vi.fn()
    mockConfig = {
      url: '/api/test',
      method: 'GET',
    }
    mockResponse = {
      data: { message: 'test data' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: mockConfig,
    }
    mockNext.mockResolvedValue(mockResponse)
  })

  describe('Basic Caching', () => {
    it('should cache GET requests by default', async () => {
      const cacheFeature = withCache()
      
      // 第一次请求
      const result1 = await cacheFeature(mockConfig, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(result1).toEqual(mockResponse)

      // 第二次请求（应该从缓存返回）
      const result2 = await cacheFeature(mockConfig, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1) // 仍然只调用一次
      expect(result2).toEqual(mockResponse)
    })

    it('should not cache POST requests by default', async () => {
      const cacheFeature = withCache()
      const postConfig = { ...mockConfig, method: 'POST' as const }
      
      // 第一次请求
      await cacheFeature(postConfig, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)

      // 第二次请求（应该重新发起请求）
      await cacheFeature(postConfig, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2)
    })

    it('should respect cache configuration', async () => {
      const cacheFeature = withCache({
        enabled: true,
        ttl: 1000,
        methods: ['GET', 'POST'],
      })
      
      const postConfig = { ...mockConfig, method: 'POST' as const }
      
      // POST 请求现在应该被缓存
      await cacheFeature(postConfig, mockNext)
      await cacheFeature(postConfig, mockNext)
      
      expect(mockNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('Cache TTL', () => {
    it('should expire cache after TTL', async () => {
      const cacheFeature = withCache({
        enabled: true,
        ttl: 100, // 100ms TTL
      })
      
      // 第一次请求
      await cacheFeature(mockConfig, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)

      // 立即第二次请求（应该从缓存返回）
      await cacheFeature(mockConfig, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)

      // 等待 TTL 过期
      await new Promise(resolve => setTimeout(resolve, 150))

      // 第三次请求（缓存已过期，应该重新发起请求）
      await cacheFeature(mockConfig, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2)
    })

    it('should handle zero TTL (no caching)', async () => {
      const cacheFeature = withCache({
        enabled: true,
        ttl: 0,
      })
      
      // 每次请求都应该重新发起
      await cacheFeature(mockConfig, mockNext)
      await cacheFeature(mockConfig, mockNext)
      
      expect(mockNext).toHaveBeenCalledTimes(2)
    })
  })

  describe('Cache Key Generation', () => {
    it('should generate different keys for different URLs', async () => {
      const cacheFeature = withCache()
      
      const config1 = { ...mockConfig, url: '/api/test1' }
      const config2 = { ...mockConfig, url: '/api/test2' }
      
      await cacheFeature(config1, mockNext)
      await cacheFeature(config2, mockNext)
      
      // 不同的 URL 应该生成不同的缓存键，所以都会发起请求
      expect(mockNext).toHaveBeenCalledTimes(2)
    })

    it('should generate different keys for different methods', async () => {
      const cacheFeature = withCache({
        enabled: true,
        methods: ['GET', 'POST'],
      })
      
      const getConfig = { ...mockConfig, method: 'GET' as const }
      const postConfig = { ...mockConfig, method: 'POST' as const }
      
      await cacheFeature(getConfig, mockNext)
      await cacheFeature(postConfig, mockNext)
      
      // 不同的方法应该生成不同的缓存键
      expect(mockNext).toHaveBeenCalledTimes(2)
    })

    it('should generate different keys for different params', async () => {
      const cacheFeature = withCache()
      
      const config1 = { ...mockConfig, params: { page: 1 } }
      const config2 = { ...mockConfig, params: { page: 2 } }
      
      await cacheFeature(config1, mockNext)
      await cacheFeature(config2, mockNext)
      
      // 不同的参数应该生成不同的缓存键
      expect(mockNext).toHaveBeenCalledTimes(2)
    })

    it('should use custom key generator', async () => {
      const customKeyGenerator = vi.fn((config: RequestConfig) => `custom-${config.url}`)
      
      const cacheFeature = withCache({
        enabled: true,
        keyGenerator: customKeyGenerator,
      })
      
      await cacheFeature(mockConfig, mockNext)
      
      expect(customKeyGenerator).toHaveBeenCalledWith(mockConfig)
    })
  })

  describe('Cache Storage', () => {
    it('should use custom storage', async () => {
      const customStorage = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn().mockResolvedValue(undefined),
        has: vi.fn().mockResolvedValue(false),
      }
      
      const cacheFeature = withCache({
        enabled: true,
        storage: customStorage,
      })
      
      await cacheFeature(mockConfig, mockNext)
      
      expect(customStorage.get).toHaveBeenCalled()
      expect(customStorage.set).toHaveBeenCalled()
    })

    it('should handle storage errors gracefully', async () => {
      const faultyStorage = {
        get: vi.fn().mockRejectedValue(new Error('Storage error')),
        set: vi.fn().mockRejectedValue(new Error('Storage error')),
        delete: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn().mockResolvedValue(undefined),
        has: vi.fn().mockResolvedValue(false),
      }
      
      const cacheFeature = withCache({
        enabled: true,
        storage: faultyStorage,
      })
      
      // 应该不抛出错误，而是继续执行请求
      const result = await cacheFeature(mockConfig, mockNext)
      expect(result).toEqual(mockResponse)
      expect(mockNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('Cache Control', () => {
    it('should respect request-level cache disable', async () => {
      const cacheFeature = withCache({
        enabled: true,
      })
      
      const noCacheConfig = {
        ...mockConfig,
        cache: { enabled: false },
      }
      
      // 两次请求都应该发起，因为缓存被禁用
      await cacheFeature(noCacheConfig, mockNext)
      await cacheFeature(noCacheConfig, mockNext)
      
      expect(mockNext).toHaveBeenCalledTimes(2)
    })

    it('should respect request-level TTL override', async () => {
      const cacheFeature = withCache({
        enabled: true,
        ttl: 5000, // 默认 5 秒
      })
      
      const shortTtlConfig = {
        ...mockConfig,
        cache: { ttl: 50 }, // 覆盖为 50ms
      }
      
      await cacheFeature(shortTtlConfig, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(1)

      // 等待短 TTL 过期
      await new Promise(resolve => setTimeout(resolve, 100))

      await cacheFeature(shortTtlConfig, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2) // 缓存已过期
    })
  })

  describe('Disabled Cache', () => {
    it('should not cache when disabled', async () => {
      const cacheFeature = withCache({
        enabled: false,
      })
      
      // 每次请求都应该重新发起
      await cacheFeature(mockConfig, mockNext)
      await cacheFeature(mockConfig, mockNext)
      
      expect(mockNext).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling', () => {
    it('should not cache error responses', async () => {
      const errorResponse = new Error('Request failed')
      mockNext.mockRejectedValueOnce(errorResponse)
      mockNext.mockResolvedValueOnce(mockResponse)
      
      const cacheFeature = withCache()
      
      // 第一次请求失败
      await expect(cacheFeature(mockConfig, mockNext)).rejects.toThrow('Request failed')
      
      // 第二次请求应该重新发起（错误不应该被缓存）
      const result = await cacheFeature(mockConfig, mockNext)
      expect(result).toEqual(mockResponse)
      expect(mockNext).toHaveBeenCalledTimes(2)
    })

    it('should handle cache retrieval errors', async () => {
      const faultyStorage = {
        get: vi.fn().mockRejectedValue(new Error('Cache read error')),
        set: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn().mockResolvedValue(undefined),
        has: vi.fn().mockResolvedValue(false),
      }
      
      const cacheFeature = withCache({
        enabled: true,
        storage: faultyStorage,
      })
      
      // 应该继续执行请求，不受缓存错误影响
      const result = await cacheFeature(mockConfig, mockNext)
      expect(result).toEqual(mockResponse)
      expect(mockNext).toHaveBeenCalledTimes(1)
    })
  })
})
