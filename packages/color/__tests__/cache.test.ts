/**
 * 缓存系统测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CacheImpl, createCache, createLRUCache, LRUCacheImpl } from '../src/utils/cache'

describe('cacheImpl', () => {
  let cache: CacheImpl<string, number>

  beforeEach(() => {
    cache = new CacheImpl()
  })

  describe('基本操作', () => {
    it('应该设置和获取值', () => {
      cache.set('key1', 100)
      expect(cache.get('key1')).toBe(100)
    })

    it('应该检查键是否存在', () => {
      cache.set('key1', 100)
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
    })

    it('应该删除键值对', () => {
      cache.set('key1', 100)
      expect(cache.delete('key1')).toBe(true)
      expect(cache.has('key1')).toBe(false)
      expect(cache.delete('key1')).toBe(false) // 已删除的键
    })

    it('应该清空缓存', () => {
      cache.set('key1', 100)
      cache.set('key2', 200)
      cache.clear()

      expect(cache.size).toBe(0)
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(false)
    })

    it('应该返回正确的大小', () => {
      expect(cache.size).toBe(0)
      cache.set('key1', 100)
      expect(cache.size).toBe(1)
      cache.set('key2', 200)
      expect(cache.size).toBe(2)
      cache.delete('key1')
      expect(cache.size).toBe(1)
    })
  })

  describe('可迭代性', () => {
    beforeEach(() => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
    })

    it('应该支持for...of循环', () => {
      const entries = []
      for (const entry of cache) {
        entries.push(entry)
      }

      expect(entries).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('应该返回键的迭代器', () => {
      const keys = Array.from(cache.keys())
      expect(keys).toEqual(['a', 'b', 'c'])
    })

    it('应该返回值的迭代器', () => {
      const values = Array.from(cache.values())
      expect(values).toEqual([1, 2, 3])
    })

    it('应该返回条目的迭代器', () => {
      const entries = Array.from(cache.entries())
      expect(entries).toEqual([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    })

    it('应该支持forEach', () => {
      const mockCallback = vi.fn()
      cache.forEach(mockCallback)

      expect(mockCallback).toHaveBeenCalledTimes(3)
      expect(mockCallback).toHaveBeenCalledWith(1, 'a', cache)
      expect(mockCallback).toHaveBeenCalledWith(2, 'b', cache)
      expect(mockCallback).toHaveBeenCalledWith(3, 'c', cache)
    })
  })

  describe('初始数据', () => {
    it('应该支持从Map初始化', () => {
      const initialData = new Map([
        ['x', 10],
        ['y', 20],
      ])
      const cache = new CacheImpl(initialData)

      expect(cache.get('x')).toBe(10)
      expect(cache.get('y')).toBe(20)
      expect(cache.size).toBe(2)
    })

    it('应该支持从可迭代对象初始化', () => {
      const initialData = [['x', 10], ['y', 20]] as [string, number][]
      const cache = new CacheImpl(initialData)

      expect(cache.get('x')).toBe(10)
      expect(cache.get('y')).toBe(20)
      expect(cache.size).toBe(2)
    })
  })
})

describe('lRUCacheImpl', () => {
  let cache: LRUCacheImpl<string, number>

  beforeEach(() => {
    cache = new LRUCacheImpl(3) // 最大容量3
  })

  describe('lRU逻辑', () => {
    it('应该根据容量限制驱逐项目', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      expect(cache.size).toBe(3)

      // 添加第四个项目，应该驱逐最老的
      cache.set('d', 4)
      expect(cache.size).toBe(3)
      expect(cache.has('a')).toBe(false) // 'a'被驱逐
      expect(cache.has('d')).toBe(true)
    })

    it('访问应该更新使用顺序', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 访问'a'使其变为最近使用
      cache.get('a')

      // 添加新项目
      cache.set('d', 4)

      // 'b'应该被驱逐，因为它是最近最少使用的
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('设置已存在的键应该更新使用顺序', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 更新'a'的值，应该移动到最近使用
      cache.set('a', 10)

      cache.set('d', 4)

      // 'b'应该被驱逐
      expect(cache.has('a')).toBe(true)
      expect(cache.get('a')).toBe(10)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('has方法应该更新使用顺序', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 使用has检查'a'
      cache.has('a')

      cache.set('d', 4)

      // 'b'应该被驱逐
      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('tTL功能', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该支持TTL过期', () => {
      cache.set('a', 1, 1000) // 1秒TTL

      expect(cache.has('a')).toBe(true)

      // 前进时间但未过期
      vi.advanceTimersByTime(500)
      expect(cache.has('a')).toBe(true)

      // 前进时间超过TTL
      vi.advanceTimersByTime(600)
      expect(cache.has('a')).toBe(false)
    })

    it('获取过期项目应该返回undefined', () => {
      cache.set('a', 1, 1000)

      vi.advanceTimersByTime(1100)
      expect(cache.get('a')).toBeUndefined()
    })

    it('应该在检查时清理过期项目', () => {
      cache.set('a', 1, 1000)
      cache.set('b', 2) // 无TTL

      expect(cache.size).toBe(2)

      vi.advanceTimersByTime(1100)

      // 访问任何方法都应该触发清理
      cache.has('b')

      expect(cache.size).toBe(1)
      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
    })
  })

  describe('统计功能', () => {
    it('应该跟踪命中和未命中', () => {
      cache.set('a', 1)

      // 命中
      cache.get('a')
      cache.get('a')

      // 未命中
      cache.get('b')
      cache.get('c')

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(2)
      expect(stats.hitRate).toBe(0.5)
    })

    it('应该重置统计信息', () => {
      cache.set('a', 1)
      cache.get('a')
      cache.get('b')

      expect(cache.getStats().hits).toBe(1)
      expect(cache.getStats().misses).toBe(1)

      cache.resetStats()

      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
    })
  })

  describe('迭代器', () => {
    it('应该按Map的插入顺序迭代', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 访问'a'使其重新插入到最后
      cache.get('a')

      const entries = Array.from(cache.entries())
      // 访问后'a'应该在最后（最近插入）
      expect(entries[entries.length - 1]).toEqual(['a', 1])
    })
  })

  describe('边界情况', () => {
    it('应该处理容量为0的情况', () => {
      const zeroCache = new LRUCacheImpl(0)
      zeroCache.set('a', 1)

      expect(zeroCache.has('a')).toBe(false)
      expect(zeroCache.size).toBe(0)
    })

    it('应该处理容量为1的情况', () => {
      const singleCache = new LRUCacheImpl(1)
      singleCache.set('a', 1)
      singleCache.set('b', 2)

      expect(singleCache.has('a')).toBe(false)
      expect(singleCache.has('b')).toBe(true)
      expect(singleCache.size).toBe(1)
    })

    it('应该处理负容量', () => {
      expect(() => new LRUCacheImpl(-1)).toThrow('Cache capacity must be non-negative')
    })
  })
})

describe('工厂函数', () => {
  it('createCache应该创建基本缓存', () => {
    const cache = createCache<string, number>()
    expect(cache).toBeInstanceOf(CacheImpl)

    cache.set('test', 123)
    expect(cache.get('test')).toBe(123)
  })

  it('createCache应该支持初始数据', () => {
    const initialData = new Map([['a', 1], ['b', 2]])
    const cache = createCache(initialData)

    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBe(2)
    expect(cache.size).toBe(2)
  })

  it('createLRUCache应该创建LRU缓存', () => {
    const cache = createLRUCache<string, number>(2)
    expect(cache).toBeInstanceOf(LRUCacheImpl)

    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3) // 应该驱逐'a'

    expect(cache.has('a')).toBe(false)
    expect(cache.has('b')).toBe(true)
    expect(cache.has('c')).toBe(true)
  })

  it('createLRUCache应该支持初始数据', () => {
    const initialData = [['a', 1], ['b', 2]] as [string, number][]
    const cache = createLRUCache(3, initialData)

    expect(cache.get('a')).toBe(1)
    expect(cache.get('b')).toBe(2)
    expect(cache.size).toBe(2)
  })
})

describe('复杂场景', () => {
  describe('并发访问模拟', () => {
    it('应该处理快速连续的操作', () => {
      const cache = createLRUCache<string, number>(5)

      // 模拟快速连续的设置操作
      for (let i = 0; i < 10; i++) {
        cache.set(`key${i}`, i)
      }

      expect(cache.size).toBe(5) // 只保留最后5个
      expect(cache.has('key0')).toBe(false) // 前面的被驱逐
      expect(cache.has('key9')).toBe(true) // 最后的被保留
    })

    it('应该正确处理重复设置相同键', () => {
      const cache = createLRUCache<string, number>(3)

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 重复设置'a'，应该更新值并移到前面
      cache.set('a', 10)

      // 添加新项目
      cache.set('d', 4)

      // 'b'应该被驱逐，因为它是最旧的未被访问的
      expect(cache.has('a')).toBe(true)
      expect(cache.get('a')).toBe(10)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('tTL和LRU组合', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该同时应用TTL和LRU逻辑', () => {
      const cache = createLRUCache<string, number>(2)

      cache.set('a', 1, 1000) // 1秒TTL
      cache.set('b', 2) // 无TTL

      // 添加第三个项目，应该驱逐'a'
      cache.set('c', 3)

      expect(cache.has('a')).toBe(false) // 被LRU驱逐
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
    })

    it('过期项目不应该影响LRU驱逐', () => {
      const cache = createLRUCache<string, number>(2)

      cache.set('a', 1, 500) // 短TTL
      cache.set('b', 2)

      // 等待'a'过期
      vi.advanceTimersByTime(600)

      // 添加新项目，过期的'a'不应该影响驱逐逻辑
      cache.set('c', 3)

      expect(cache.has('a')).toBe(false) // 过期
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.size).toBe(2)
    })
  })

  describe('性能特性', () => {
    it('大量操作应该保持性能', () => {
      const cache = createLRUCache<string, number>(1000)
      const start = performance.now()

      // 添加大量项目
      for (let i = 0; i < 5000; i++) {
        cache.set(`key${i}`, i)
      }

      // 随机访问
      for (let i = 0; i < 1000; i++) {
        const key = `key${Math.floor(Math.random() * 5000)}`
        cache.get(key)
      }

      const end = performance.now()

      expect(end - start).toBeLessThan(1000) // 应该在1000ms内完成（调整为更合理的阈值）
      expect(cache.size).toBe(1000) // 保持容量限制
    })
  })

  describe('内存管理', () => {
    it('清理应该释放所有引用', () => {
      const cache = createLRUCache<string, any>(10)

      // 添加一些复杂对象
      for (let i = 0; i < 5; i++) {
        cache.set(`key${i}`, { value: i, data: Array.from({ length: 100 }).fill(i) })
      }

      expect(cache.size).toBe(5)

      cache.clear()

      expect(cache.size).toBe(0)
      // 验证迭代器也被清理
      expect(Array.from(cache.keys())).toEqual([])
    })
  })
})

describe('类型安全', () => {
  it('应该保持类型安全', () => {
    const stringCache = createCache<string, string>()
    const numberCache = createLRUCache<number, boolean>(10)

    stringCache.set('hello', 'world')
    numberCache.set(42, true)

    // TypeScript类型检查确保以下操作是类型安全的
    expect(stringCache.get('hello')).toBe('world')
    expect(numberCache.get(42)).toBe(true)
  })

  it('应该正确处理undefined值', () => {
    const cache = createCache<string, number | undefined>()

    cache.set('key', undefined)

    expect(cache.has('key')).toBe(true)
    expect(cache.get('key')).toBeUndefined()
  })
})
