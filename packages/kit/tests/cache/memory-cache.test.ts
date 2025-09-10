/**
 * MemoryCache 测试
 */


import { vi } from 'vitest'
import { MemoryCache } from '../../src/cache/memory-cache'

describe('memoryCache', () => {
  let cache: MemoryCache

  beforeEach(() => {
    cache = new MemoryCache({
      maxSize: 100,
      defaultTTL: 3600,
      strategy: 'lru',
    })
  })

  afterEach(async () => {
    await cache.destroy()
  })

  describe('基本操作', () => {
    it('应该设置和获取缓存�?, async () => {
      await cache.set('key1', 'value1')
      const value = await cache.get('key1')
      expect(value).toBe('value1')
    })

    it('应该返回undefined对于不存在的�?, async () => {
      const value = await cache.get('nonexistent')
      expect(value).toBeUndefined()
    })

    it('应该检查键是否存在', async () => {
      await cache.set('key1', 'value1')

      expect(await cache.has('key1')).toBe(true)
      expect(await cache.has('nonexistent')).toBe(false)
    })

    it('应该删除缓存�?, async () => {
      await cache.set('key1', 'value1')
      expect(await cache.has('key1')).toBe(true)

      const deleted = await cache.delete('key1')
      expect(deleted).toBe(true)
      expect(await cache.has('key1')).toBe(false)
    })

    it('应该清空所有缓�?, async () => {
      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')

      await cache.clear()

      expect(await cache.has('key1')).toBe(false)
      expect(await cache.has('key2')).toBe(false)
    })
  })

  describe('tTL (生存时间)', () => {
    it('应该在TTL过期后删除项�?, async () => {
      await cache.set('key1', 'value1', 0.1) // 100ms TTL

      expect(await cache.get('key1')).toBe('value1')

      await global.testUtils.sleep(150)

      expect(await cache.get('key1')).toBeUndefined()
    })

    it('应该设置和获取TTL', async () => {
      await cache.set('key1', 'value1', 10)

      const ttl = await cache.ttl('key1')
      expect(ttl).toBeGreaterThan(0)
      expect(ttl).toBeLessThanOrEqual(10)
    })

    it('应该更新过期时间', async () => {
      await cache.set('key1', 'value1', 1)

      const updated = await cache.expire('key1', 10)
      expect(updated).toBe(true)

      const ttl = await cache.ttl('key1')
      expect(ttl).toBeGreaterThan(1)
    })

    it('应该返回-1对于没有TTL的键', async () => {
      await cache.set('key1', 'value1') // 无TTL

      const ttl = await cache.ttl('key1')
      expect(ttl).toBe(-1)
    })
  })

  describe('批量操作', () => {
    it('应该批量获取�?, async () => {
      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')
      await cache.set('key3', 'value3')

      const results = await cache.mget(['key1', 'key2', 'nonexistent'])

      expect(results.get('key1')).toBe('value1')
      expect(results.get('key2')).toBe('value2')
      expect(results.has('nonexistent')).toBe(false)
    })

    it('应该批量设置�?, async () => {
      const entries = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3'],
      ])

      await cache.mset(entries, 10)

      expect(await cache.get('key1')).toBe('value1')
      expect(await cache.get('key2')).toBe('value2')
      expect(await cache.get('key3')).toBe('value3')
    })

    it('应该批量删除�?, async () => {
      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')
      await cache.set('key3', 'value3')

      const deleted = await cache.mdel(['key1', 'key3', 'nonexistent'])

      expect(deleted).toBe(2)
      expect(await cache.has('key1')).toBe(false)
      expect(await cache.has('key2')).toBe(true)
      expect(await cache.has('key3')).toBe(false)
    })
  })

  describe('键管�?, () => {
    it('应该获取所有键', async () => {
      await cache.set('user:1', 'data1')
      await cache.set('user:2', 'data2')
      await cache.set('product:1', 'data3')

      const keys = await cache.keys()

      expect(keys).toHaveLength(3)
      expect(keys).toContain('user:1')
      expect(keys).toContain('user:2')
      expect(keys).toContain('product:1')
    })

    it('应该按模式过滤键', async () => {
      await cache.set('user:1', 'data1')
      await cache.set('user:2', 'data2')
      await cache.set('product:1', 'data3')

      const userKeys = await cache.keys('user:*')

      expect(userKeys).toHaveLength(2)
      expect(userKeys).toContain('user:1')
      expect(userKeys).toContain('user:2')
    })
  })

  describe('驱逐策�?, () => {
    beforeEach(() => {
      cache = new MemoryCache({
        maxSize: 3,
        strategy: 'lru',
      })
    })

    it('应该使用LRU策略驱逐项�?, async () => {
      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')
      await cache.set('key3', 'value3')

      // 访问key1使其成为最近使用的
      await cache.get('key1')

      // 添加新项目应该驱逐key2（最少最近使用的�?      await cache.set('key4', 'value4')

      expect(await cache.has('key1')).toBe(true)
      expect(await cache.has('key2')).toBe(false)
      expect(await cache.has('key3')).toBe(true)
      expect(await cache.has('key4')).toBe(true)
    })

    it('应该使用FIFO策略驱逐项�?, async () => {
      cache = new MemoryCache({
        maxSize: 3,
        strategy: 'fifo',
      })

      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')
      await cache.set('key3', 'value3')

      // 添加新项目应该驱逐key1（最先进入的�?      await cache.set('key4', 'value4')

      expect(await cache.has('key1')).toBe(false)
      expect(await cache.has('key2')).toBe(true)
      expect(await cache.has('key3')).toBe(true)
      expect(await cache.has('key4')).toBe(true)
    })
  })

  describe('统计信息', () => {
    it('应该跟踪命中和未命中', async () => {
      await cache.set('key1', 'value1')

      // 命中
      await cache.get('key1')
      await cache.get('key1')

      // 未命�?      await cache.get('nonexistent')

      const stats = await cache.getStats()

      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(2 / 3)
    })

    it('应该跟踪键的数量', async () => {
      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')

      const stats = await cache.getStats()

      expect(stats.keys).toBe(2)
      expect(stats.size).toBe(2)
    })

    it('应该重置统计信息', async () => {
      await cache.set('key1', 'value1')
      await cache.get('key1')
      await cache.get('nonexistent')

      cache.resetStats()

      const stats = await cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })

  describe('事件', () => {
    it('应该发出hit事件', async () => {
      const hitSpy = vi.fn()
      cache.on('hit', hitSpy)

      await cache.set('key1', 'value1')
      await cache.get('key1')

      expect(hitSpy).toHaveBeenCalledWith('key1')
    })

    it('应该发出miss事件', async () => {
      const missSpy = vi.fn()
      cache.on('miss', missSpy)

      await cache.get('nonexistent')

      expect(missSpy).toHaveBeenCalledWith('nonexistent')
    })

    it('应该发出set事件', async () => {
      const setSpy = vi.fn()
      cache.on('set', setSpy)

      await cache.set('key1', 'value1')

      expect(setSpy).toHaveBeenCalledWith('key1', 'value1')
    })

    it('应该发出delete事件', async () => {
      const deleteSpy = vi.fn()
      cache.on('delete', deleteSpy)

      await cache.set('key1', 'value1')
      await cache.delete('key1')

      expect(deleteSpy).toHaveBeenCalledWith('key1')
    })

    it('应该发出expired事件', async () => {
      const expiredSpy = vi.fn()
      cache.on('expired', expiredSpy)

      await cache.set('key1', 'value1', 0.1) // 100ms TTL

      await global.testUtils.sleep(150)
      await cache.get('key1') // 触发过期检�?
      expect(expiredSpy).toHaveBeenCalledWith('key1')
    })
  })

  describe('数据类型', () => {
    it('应该存储不同类型的数�?, async () => {
      const testData = {
        string: 'hello',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { name: 'test', value: 123 },
        null: null,
        undefined,
      }

      for (const [key, value] of Object.entries(testData)) {
        await cache.set(key, value)
        const retrieved = await cache.get(key)
        expect(retrieved).toEqual(value)
      }
    })

    it('应该保持对象引用的独立�?, async () => {
      const original = { count: 0 }
      await cache.set('object', original)

      original.count = 1

      const retrieved = await cache.get('object')
      expect(retrieved).toEqual({ count: 0 })
    })
  })

  describe('内存管理', () => {
    it('应该估算内存使用�?, async () => {
      const stats1 = await cache.getStats()
      const initialMemory = stats1.memory

      await cache.set('key1', 'a'.repeat(1000))
      await cache.set('key2', 'b'.repeat(1000))

      const stats2 = await cache.getStats()
      expect(stats2.memory).toBeGreaterThan(initialMemory)
    })

    it('应该在内存压力下驱逐项�?, async () => {
      cache = new MemoryCache({
        maxSize: 1000,
        maxMemory: 1024, // 1KB
      })

      // 添加大量数据直到触发内存限制
      for (let i = 0; i < 100; i++) {
        await cache.set(`key${i}`, 'x'.repeat(100))
      }

      const stats = await cache.getStats()
      expect(stats.keys).toBeLessThan(100) // 应该有一些项目被驱�?    })
  })
})



