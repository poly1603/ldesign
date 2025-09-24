/**
 * 缓存管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CacheManager } from '../src/utils/CacheManager'
import type { CacheConfig } from '../src/types'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

describe('CacheManager', () => {
  let cacheManager: CacheManager
  let config: CacheConfig

  beforeEach(() => {
    config = {
      enabled: true,
      ttl: 1000,
      maxSize: 10,
      storage: 'memory',
    }
    cacheManager = new CacheManager(config)
    
    // 清理 mock
    vi.clearAllMocks()
    localStorageMock.length = 0
    sessionStorageMock.length = 0
  })

  afterEach(() => {
    cacheManager.clear()
  })

  describe('内存缓存', () => {
    it('应该正确设置和获取缓存', () => {
      const data = { test: 'value' }
      cacheManager.set('test-key', data)
      
      const result = cacheManager.get('test-key')
      expect(result).toEqual(data)
    })

    it('应该在禁用时不缓存数据', () => {
      const disabledCache = new CacheManager({
        ...config,
        enabled: false,
      })
      
      disabledCache.set('test-key', { test: 'value' })
      expect(disabledCache.get('test-key')).toBeNull()
    })

    it('应该正确处理TTL过期', async () => {
      const shortTTLCache = new CacheManager({
        ...config,
        ttl: 50,
      })
      
      shortTTLCache.set('test-key', { test: 'value' })
      expect(shortTTLCache.get('test-key')).toEqual({ test: 'value' })
      
      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(shortTTLCache.get('test-key')).toBeNull()
    })

    it('应该支持自定义TTL', async () => {
      cacheManager.set('test-key', { test: 'value' }, 50)
      expect(cacheManager.get('test-key')).toEqual({ test: 'value' })
      
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(cacheManager.get('test-key')).toBeNull()
    })
  })

  describe('localStorage 缓存', () => {
    beforeEach(() => {
      cacheManager = new CacheManager({
        ...config,
        storage: 'localStorage',
      })
    })

    it('应该使用 localStorage 存储数据', () => {
      const data = { test: 'value' }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        data,
        expireTime: Date.now() + 10000,
      }))
      
      cacheManager.set('test-key', data)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringContaining('test-key'),
        expect.stringContaining('"test":"value"')
      )
      
      const result = cacheManager.get('test-key')
      expect(result).toEqual(data)
    })

    it('应该处理 localStorage 错误', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      // 不应该抛出错误
      expect(() => {
        cacheManager.set('test-key', { test: 'value' })
      }).not.toThrow()
    })

    it('应该处理损坏的 JSON 数据', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')
      
      const result = cacheManager.get('test-key')
      expect(result).toBeNull()
    })
  })

  describe('sessionStorage 缓存', () => {
    beforeEach(() => {
      cacheManager = new CacheManager({
        ...config,
        storage: 'sessionStorage',
      })
    })

    it('应该使用 sessionStorage 存储数据', () => {
      const data = { test: 'value' }
      
      sessionStorageMock.getItem.mockReturnValue(JSON.stringify({
        data,
        expireTime: Date.now() + 10000,
      }))
      
      cacheManager.set('test-key', data)
      
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringContaining('test-key'),
        expect.stringContaining('"test":"value"')
      )
      
      const result = cacheManager.get('test-key')
      expect(result).toEqual(data)
    })
  })

  describe('缓存操作', () => {
    it('应该正确删除缓存项', () => {
      cacheManager.set('test-key', { test: 'value' })
      expect(cacheManager.get('test-key')).toEqual({ test: 'value' })
      
      cacheManager.remove('test-key')
      expect(cacheManager.get('test-key')).toBeNull()
    })

    it('应该正确清空所有缓存', () => {
      cacheManager.set('key1', { test: 'value1' })
      cacheManager.set('key2', { test: 'value2' })
      
      cacheManager.clear()
      
      expect(cacheManager.get('key1')).toBeNull()
      expect(cacheManager.get('key2')).toBeNull()
    })

    it('应该正确检查缓存是否存在', () => {
      expect(cacheManager.has('test-key')).toBe(false)
      
      cacheManager.set('test-key', { test: 'value' })
      expect(cacheManager.has('test-key')).toBe(true)
    })

    it('应该正确获取所有缓存键', () => {
      cacheManager.set('key1', { test: 'value1' })
      cacheManager.set('key2', { test: 'value2' })
      
      const keys = cacheManager.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toHaveLength(2)
    })
  })

  describe('统计信息', () => {
    it('应该正确统计缓存信息', () => {
      cacheManager.set('key1', { test: 'value1' })
      cacheManager.set('key2', { test: 'value2' })
      
      // 命中
      cacheManager.get('key1')
      cacheManager.get('key1')
      
      // 未命中
      cacheManager.get('nonexistent')
      
      const stats = cacheManager.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.totalItems).toBe(2)
      expect(stats.size).toBeGreaterThan(0) // 字符串大小应该大于0
      expect(stats.hitRate).toBeCloseTo(0.67, 2)
    })

    it('应该正确重置统计信息', () => {
      cacheManager.set('key1', { test: 'value1' })
      cacheManager.get('key1')
      cacheManager.get('nonexistent')

      let stats = cacheManager.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)

      // 清除缓存会重置统计信息
      cacheManager.clear()

      stats = cacheManager.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理复杂对象', () => {
      const complexData = {
        string: 'test',
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        nested: {
          prop: 'value',
        },
        date: new Date().toISOString(),
      }
      
      cacheManager.set('complex', complexData)
      const result = cacheManager.get('complex')
      
      expect(result).toEqual(complexData)
    })

    it('应该处理null和undefined值', () => {
      cacheManager.set('null', null)
      cacheManager.set('undefined', undefined)
      
      expect(cacheManager.get('null')).toBeNull()
      expect(cacheManager.get('undefined')).toBeUndefined()
    })

    it('应该处理空字符串键', () => {
      cacheManager.set('', { test: 'empty-key' })
      expect(cacheManager.get('')).toEqual({ test: 'empty-key' })
    })
  })
})
