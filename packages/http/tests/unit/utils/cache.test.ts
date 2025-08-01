import type { RequestConfig } from '@/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CacheManager, MemoryCacheStorage } from '@/utils/cache'
import { createMockResponse, delay } from '../../setup'

describe('memoryCacheStorage', () => {
  let storage: MemoryCacheStorage

  beforeEach(() => {
    storage = new MemoryCacheStorage()
  })

  describe('get/set', () => {
    it('should store and retrieve data', async () => {
      const data = { test: 'value' }
      await storage.set('key1', data)

      const retrieved = await storage.get('key1')
      expect(retrieved).toEqual(data)
    })

    it('should return null for non-existent key', async () => {
      const result = await storage.get('non-existent')
      expect(result).toBeNull()
    })

    it('should handle TTL expiration', async () => {
      const data = { test: 'value' }
      await storage.set('key1', data, 50) // 50ms TTL

      // 立即获取应该成功
      let result = await storage.get('key1')
      expect(result).toEqual(data)

      // 等待过期
      await delay(60)

      // 过期后应该返回 null
      result = await storage.get('key1')
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('should delete stored data', async () => {
      await storage.set('key1', { test: 'value' })
      await storage.delete('key1')

      const result = await storage.get('key1')
      expect(result).toBeNull()
    })

    it('should handle deleting non-existent key', async () => {
      await storage.delete('non-existent')
      // Should not throw
    })
  })

  describe('clear', () => {
    it('should clear all data', async () => {
      await storage.set('key1', { test: 'value1' })
      await storage.set('key2', { test: 'value2' })

      await storage.clear()

      expect(await storage.get('key1')).toBeNull()
      expect(await storage.get('key2')).toBeNull()
      expect(storage.size()).toBe(0)
    })
  })

  describe('utility methods', () => {
    it('should return correct size', async () => {
      expect(storage.size()).toBe(0)

      await storage.set('key1', { test: 'value1' })
      expect(storage.size()).toBe(1)

      await storage.set('key2', { test: 'value2' })
      expect(storage.size()).toBe(2)

      await storage.delete('key1')
      expect(storage.size()).toBe(1)
    })

    it('should return all keys', async () => {
      await storage.set('key1', { test: 'value1' })
      await storage.set('key2', { test: 'value2' })

      const keys = storage.keys()
      expect(keys).toEqual(['key1', 'key2'])
    })
  })
})

describe('cacheManager', () => {
  let cacheManager: CacheManager
  let mockStorage: MemoryCacheStorage

  beforeEach(() => {
    mockStorage = new MemoryCacheStorage()
    cacheManager = new CacheManager({
      enabled: true,
      ttl: 300000,
      storage: mockStorage,
    })
  })

  describe('get/set', () => {
    it('should cache successful GET responses', async () => {
      const config: RequestConfig = { url: '/users', method: 'GET' }
      const response = createMockResponse({ users: [] }, 200)

      await cacheManager.set(config, response)
      const cached = await cacheManager.get(config)

      expect(cached).toEqual(response)
    })

    it('should not cache non-GET requests', async () => {
      const config: RequestConfig = { url: '/users', method: 'POST' }
      const response = createMockResponse({ success: true }, 201)

      await cacheManager.set(config, response)
      const cached = await cacheManager.get(config)

      expect(cached).toBeNull()
    })

    it('should not cache error responses', async () => {
      const config: RequestConfig = { url: '/users', method: 'GET' }
      const response = createMockResponse({ error: 'Not found' }, 404)

      await cacheManager.set(config, response)
      const cached = await cacheManager.get(config)

      expect(cached).toBeNull()
    })

    it('should return null when caching is disabled', async () => {
      cacheManager.updateConfig({ enabled: false })

      const config: RequestConfig = { url: '/users', method: 'GET' }
      const response = createMockResponse({ users: [] }, 200)

      await cacheManager.set(config, response)
      const cached = await cacheManager.get(config)

      expect(cached).toBeNull()
    })
  })

  describe('key generation', () => {
    it('should generate different keys for different URLs', async () => {
      const config1: RequestConfig = { url: '/users', method: 'GET' }
      const config2: RequestConfig = { url: '/posts', method: 'GET' }

      const response1 = createMockResponse({ users: [] })
      const response2 = createMockResponse({ posts: [] })

      await cacheManager.set(config1, response1)
      await cacheManager.set(config2, response2)

      const cached1 = await cacheManager.get(config1)
      const cached2 = await cacheManager.get(config2)

      expect(cached1).toEqual(response1)
      expect(cached2).toEqual(response2)
    })

    it('should generate different keys for different params', async () => {
      const config1: RequestConfig = {
        url: '/users',
        method: 'GET',
        params: { page: 1 },
      }
      const config2: RequestConfig = {
        url: '/users',
        method: 'GET',
        params: { page: 2 },
      }

      const response1 = createMockResponse({ users: [], page: 1 })
      const response2 = createMockResponse({ users: [], page: 2 })

      await cacheManager.set(config1, response1)
      await cacheManager.set(config2, response2)

      const cached1 = await cacheManager.get(config1)
      const cached2 = await cacheManager.get(config2)

      expect(cached1).toEqual(response1)
      expect(cached2).toEqual(response2)
    })

    it('should use custom key generator', async () => {
      const customKeyGenerator = vi.fn(config => `custom-${config.url}`)
      cacheManager.updateConfig({ keyGenerator: customKeyGenerator })

      const config: RequestConfig = { url: '/users', method: 'GET' }
      const response = createMockResponse({ users: [] })

      await cacheManager.set(config, response)

      expect(customKeyGenerator).toHaveBeenCalledWith(config)
    })
  })

  describe('delete', () => {
    it('should delete cached response', async () => {
      const config: RequestConfig = { url: '/users', method: 'GET' }
      const response = createMockResponse({ users: [] })

      await cacheManager.set(config, response)
      await cacheManager.delete(config)

      const cached = await cacheManager.get(config)
      expect(cached).toBeNull()
    })
  })

  describe('clear', () => {
    it('should clear all cached responses', async () => {
      const config1: RequestConfig = { url: '/users', method: 'GET' }
      const config2: RequestConfig = { url: '/posts', method: 'GET' }

      await cacheManager.set(config1, createMockResponse({ users: [] }))
      await cacheManager.set(config2, createMockResponse({ posts: [] }))

      await cacheManager.clear()

      expect(await cacheManager.get(config1)).toBeNull()
      expect(await cacheManager.get(config2)).toBeNull()
    })
  })

  describe('config management', () => {
    it('should update config', () => {
      const newConfig = { enabled: false, ttl: 600000 }
      cacheManager.updateConfig(newConfig)

      const config = cacheManager.getConfig()
      expect(config.enabled).toBe(false)
      expect(config.ttl).toBe(600000)
    })

    it('should get current config', () => {
      const config = cacheManager.getConfig()
      expect(config).toHaveProperty('enabled')
      expect(config).toHaveProperty('ttl')
      expect(config).toHaveProperty('keyGenerator')
      expect(config).toHaveProperty('storage')
    })
  })
})
