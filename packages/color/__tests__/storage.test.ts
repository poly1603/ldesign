/**
 * 存储系统测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CookieStorage,
  createLRUCache,
  createStorage,
  defaultCache,
  defaultStorage,
  LocalStorage,
  LRUCacheImpl,
  MemoryStorage,
  NoStorage,
  SessionStorage,
} from '../src/core/storage'

// Mock DOM for all tests
function createMockDocument() {
  return {
    cookie: '',
    head: {
      innerHTML: '',
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  }
}

let originalDocument: any
beforeEach(() => {
  originalDocument = globalThis.document
  globalThis.document = createMockDocument() as any
})

afterEach(() => {
  globalThis.document = originalDocument
})

describe('存储实现', () => {
  describe('memoryStorage', () => {
    let storage: MemoryStorage

    beforeEach(() => {
      storage = new MemoryStorage()
    })

    it('应该存储和获取数据', () => {
      storage.setItem('key1', 'value1')
      expect(storage.getItem('key1')).toBe('value1')
    })

    it('应该返回null对于不存在的key', () => {
      expect(storage.getItem('nonexistent')).toBeNull()
    })

    it('应该删除数据', () => {
      storage.setItem('key1', 'value1')
      storage.removeItem('key1')
      expect(storage.getItem('key1')).toBeNull()
    })

    it('应该清空所有数据', () => {
      storage.setItem('key1', 'value1')
      storage.setItem('key2', 'value2')
      storage.clear()
      expect(storage.getItem('key1')).toBeNull()
      expect(storage.getItem('key2')).toBeNull()
    })
  })

  describe('noStorage', () => {
    let storage: NoStorage

    beforeEach(() => {
      storage = new NoStorage()
    })

    it('应该总是返回null', () => {
      storage.setItem('key1', 'value1')
      expect(storage.getItem('key1')).toBeNull()
    })

    it('应该安全地处理所有操作', () => {
      expect(() => {
        storage.setItem('key', 'value')
        storage.removeItem('key')
        storage.clear()
      }).not.toThrow()
    })
  })

  describe('localStorage', () => {
    let storage: LocalStorage
    let mockLocalStorage: any

    beforeEach(() => {
      // Mock localStorage
      mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      }

      Object.defineProperty(globalThis, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      })

      storage = new LocalStorage()
    })

    it('应该委托给localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('test-value')

      storage.setItem('key1', 'value1')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key1', 'value1')

      const value = storage.getItem('key1')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('key1')
      expect(value).toBe('test-value')

      storage.removeItem('key1')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key1')

      storage.clear()
      expect(mockLocalStorage.clear).toHaveBeenCalled()
    })

    it('应该处理localStorage不可用的情况', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      expect(() => storage.setItem('key', 'value')).not.toThrow()
    })
  })

  describe('sessionStorage', () => {
    let storage: SessionStorage
    let mockSessionStorage: any

    beforeEach(() => {
      mockSessionStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      }

      Object.defineProperty(globalThis, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      })

      storage = new SessionStorage()
    })

    it('应该委托给sessionStorage', () => {
      mockSessionStorage.getItem.mockReturnValue('test-value')

      storage.setItem('key1', 'value1')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('key1', 'value1')

      const value = storage.getItem('key1')
      expect(value).toBe('test-value')
    })
  })

  describe('cookieStorage', () => {
    let storage: CookieStorage
    let mockDocument: any

    beforeEach(() => {
      mockDocument = {
        cookie: '',
      }

      Object.defineProperty(globalThis, 'document', {
        value: mockDocument,
        writable: true,
        configurable: true,
      })

      storage = new CookieStorage()
    })

    it('应该存储和获取cookie', () => {
      // 模拟设置cookie后的状态
      mockDocument.cookie = 'test-key=test-value; path=/'

      const value = storage.getItem('test-key')
      expect(value).toBe('test-value')
    })

    it('应该处理document不可用的情况', () => {
      const originalDocument = globalThis.document

      // 先保存原始的storage实例
      const _workingStorage = new CookieStorage()

      // 然后设置document为undefined
      Object.defineProperty(globalThis, 'document', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      // 创建新的storage实例来测试错误处理
      const brokenStorage = new CookieStorage()

      expect(() => {
        brokenStorage.setItem('key', 'value')
        brokenStorage.getItem('key')
        brokenStorage.removeItem('key')
        brokenStorage.clear()
      }).not.toThrow()

      // 恢复原始的document
      Object.defineProperty(globalThis, 'document', {
        value: originalDocument,
        writable: true,
        configurable: true,
      })
    })
  })
})

describe('lRU缓存', () => {
  describe('lRUCacheImpl', () => {
    let cache: LRUCacheImpl<string>

    beforeEach(() => {
      cache = new LRUCacheImpl<string>({ maxSize: 3 })
    })

    it('应该存储和获取数据', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.size()).toBe(1)
    })

    it('应该在超过最大大小时删除最久未访问的项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      cache.set('key4', 'value4') // 应该删除key1

      expect(cache.size()).toBe(3)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key4')).toBe('value4')
    })

    it('应该支持TTL过期', async () => {
      cache.set('key1', 'value1', 1) // 1ms TTL

      expect(cache.get('key1')).toBe('value1')

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 2))

      expect(cache.get('key1')).toBeUndefined()
    })

    it('应该更新访问时间', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      // 访问key1来更新其访问时间
      cache.get('key1')

      cache.set('key3', 'value3')
      cache.set('key4', 'value4') // 应该删除key2而不是key1

      expect(cache.get('key1')).toBe('value1') // 应该仍然存在
      expect(cache.get('key2')).toBeUndefined() // 应该被删除
    })

    it('应该检查项是否存在', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('应该删除项', () => {
      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.delete('nonexistent')).toBe(false)
    })

    it('应该清空缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.size()).toBe(0)
    })

    it('应该清理过期项', async () => {
      cache.set('key1', 'value1', 1) // 1ms TTL
      cache.set('key2', 'value2', 1000) // 1s TTL

      // 等待第一个过期
      await new Promise(resolve => setTimeout(resolve, 2))

      cache.cleanup()

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe('value2')
    })

    it('应该获取统计信息', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      const stats = cache.getStats()
      expect(stats.size).toBe(2)
      expect(stats.maxSize).toBe(3)
      expect(stats.hitRate).toBeDefined()
    })
  })
})

describe('工厂函数', () => {
  it('createStorage应该返回正确的存储类型', () => {
    expect(createStorage('memory')).toBeInstanceOf(MemoryStorage)
    expect(createStorage('none')).toBeInstanceOf(NoStorage)
    expect(createStorage('cookie')).toBeInstanceOf(CookieStorage)
  })

  it('createLRUCache应该返回缓存实例', () => {
    const cache = createLRUCache<string>({ maxSize: 10 })
    expect(cache).toBeDefined()
    expect(cache.size()).toBe(0)
  })

  it('默认实例应该可用', () => {
    expect(defaultStorage).toBeInstanceOf(LocalStorage)
    expect(defaultCache).toBeInstanceOf(LRUCacheImpl)
  })
})
