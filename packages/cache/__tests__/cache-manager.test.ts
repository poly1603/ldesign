import type { CacheOptions } from '../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CacheManager } from '../src/core/cache-manager'

// Mock DOM APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  },
  writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  },
  writable: true,
})

Object.defineProperty(document, 'cookie', {
  value: '',
  writable: true,
})

describe('cacheManager', () => {
  let cacheManager: CacheManager

  beforeEach(async () => {
    // 重置 mocks
    vi.clearAllMocks()

    // 创建新的缓存管理器实例
    const options: CacheOptions = {
      defaultEngine: 'memory',
      debug: true,
      strategy: {
        enabled: false, // 禁用智能策略以便测试
      },
    }
    cacheManager = new CacheManager(options)

    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  afterEach(async () => {
    await cacheManager.destroy()
  })

  describe('基础功能', () => {
    it('应该能够设置和获取缓存项', async () => {
      const key = 'test-key'
      const value = 'test-value'

      await cacheManager.set(key, value)
      const result = await cacheManager.get(key)

      expect(result).toBe(value)
    })

    it('应该能够设置和获取复杂对象', async () => {
      const key = 'test-object'
      const value = {
        name: '测试对象',
        count: 42,
        items: ['a', 'b', 'c'],
        nested: {
          prop: true,
        },
      }

      await cacheManager.set(key, value)
      const result = await cacheManager.get(key)

      expect(result).toEqual(value)
    })

    it('应该能够删除缓存项', async () => {
      const key = 'test-remove'
      const value = 'to-be-removed'

      await cacheManager.set(key, value)
      expect(await cacheManager.get(key)).toBe(value)

      await cacheManager.remove(key)
      expect(await cacheManager.get(key)).toBeNull()
    })

    it('应该能够检查键是否存在', async () => {
      const key = 'test-exists'
      const value = 'exists'

      expect(await cacheManager.has(key)).toBe(false)

      await cacheManager.set(key, value)
      expect(await cacheManager.has(key)).toBe(true)

      await cacheManager.remove(key)
      expect(await cacheManager.has(key)).toBe(false)
    })

    it('应该能够清空所有缓存', async () => {
      await cacheManager.set('key1', 'value1')
      await cacheManager.set('key2', 'value2')

      expect(await cacheManager.has('key1')).toBe(true)
      expect(await cacheManager.has('key2')).toBe(true)

      await cacheManager.clear()

      expect(await cacheManager.has('key1')).toBe(false)
      expect(await cacheManager.has('key2')).toBe(false)
    })
  })

  describe('tTL 功能', () => {
    it('应该支持过期时间', async () => {
      const key = 'test-ttl'
      const value = 'expires-soon'
      const ttl = 100 // 100ms

      await cacheManager.set(key, value, { ttl })
      expect(await cacheManager.get(key)).toBe(value)

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(await cacheManager.get(key)).toBeNull()
    })
  })

  describe('统计功能', () => {
    it('应该能够获取缓存统计信息', async () => {
      await cacheManager.set('stats-test-1', 'value1')
      await cacheManager.set('stats-test-2', { data: 'value2' })

      const stats = await cacheManager.getStats()

      expect(stats).toBeDefined()
      expect(stats.totalItems).toBeGreaterThan(0)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.engines).toBeDefined()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的存储引擎', async () => {
      await expect(
        cacheManager.set('test', 'value', { engine: 'invalid' as any }),
      ).rejects.toThrow()
    })

    it('应该处理序列化错误', async () => {
      const circularObj: any = {}
      circularObj.self = circularObj

      await expect(cacheManager.set('circular', circularObj)).rejects.toThrow()
    })
  })
})
