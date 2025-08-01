import { beforeEach, describe, expect, it } from 'vitest'
import { LRUCache, TemplateCache } from '@/utils/cache'

describe('templateCache', () => {
  let cache: TemplateCache

  beforeEach(() => {
    cache = new TemplateCache()
  })

  describe('基础操作', () => {
    it('应该能设置和获取缓存', () => {
      const key = 'test-key'
      const value = { test: 'data' }

      cache.set(key, value)
      expect(cache.get(key)).toEqual(value)
    })

    it('应该能检查缓存是否存在', () => {
      const key = 'test-key'
      const value = { test: 'data' }

      expect(cache.has(key)).toBe(false)
      cache.set(key, value)
      expect(cache.has(key)).toBe(true)
    })

    it('应该能删除缓存', () => {
      const key = 'test-key'
      const value = { test: 'data' }

      cache.set(key, value)
      expect(cache.has(key)).toBe(true)

      cache.delete(key)
      expect(cache.has(key)).toBe(false)
    })

    it('应该能清空所有缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      expect(cache.size).toBe(2)

      cache.clear()
      expect(cache.size).toBe(0)
    })

    it('应该返回正确的缓存大小', () => {
      expect(cache.size).toBe(0)

      cache.set('key1', 'value1')
      expect(cache.size).toBe(1)

      cache.set('key2', 'value2')
      expect(cache.size).toBe(2)
    })
  })

  describe('tTL 功能', () => {
    it('应该支持 TTL 过期', async () => {
      const key = 'ttl-key'
      const value = { test: 'data' }
      const ttl = 100 // 100ms

      cache.set(key, value, ttl)
      expect(cache.get(key)).toEqual(value)

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(cache.get(key)).toBeUndefined()
    })

    it('应该在获取时检查过期', () => {
      const key = 'expired-key'
      const value = { test: 'data' }

      // 设置已过期的缓存
      cache.set(key, value, -1)
      expect(cache.get(key)).toBeUndefined()
    })
  })

  describe('统计信息', () => {
    it('应该记录命中和未命中统计', () => {
      const key = 'stats-key'
      const value = { test: 'data' }

      // 初始统计
      const initialStats = cache.getStats()
      expect(initialStats.hits).toBe(0)
      expect(initialStats.misses).toBe(0)

      // 未命中
      cache.get(key)
      let stats = cache.getStats()
      expect(stats.misses).toBe(1)

      // 设置并命中
      cache.set(key, value)
      cache.get(key)
      stats = cache.getStats()
      expect(stats.hits).toBe(1)
    })

    it('应该能重置统计信息', () => {
      cache.set('key1', 'value1')
      cache.get('key1')
      cache.get('nonexistent')

      let stats = cache.getStats()
      expect(stats.hits).toBeGreaterThan(0)
      expect(stats.misses).toBeGreaterThan(0)

      cache.resetStats()
      stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
    })
  })
})

describe('lRUCache', () => {
  let cache: LRUCache<string, string>

  beforeEach(() => {
    cache = new LRUCache<string, string>(3) // 最大容量为 3
  })

  describe('lRU 淘汰策略', () => {
    it('应该在超出容量时淘汰最久未使用的项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      expect(cache.size).toBe(3)
      expect(cache.has('key1')).toBe(true)

      // 添加第四个项，应该淘汰 key1
      cache.set('key4', 'value4')

      expect(cache.size).toBe(3)
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key4')).toBe(true)
    })

    it('应该在访问时更新使用顺序', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 访问 key1，使其成为最近使用的
      cache.get('key1')

      // 添加新项，应该淘汰 key2（最久未使用）
      cache.set('key4', 'value4')

      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
      expect(cache.has('key3')).toBe(true)
      expect(cache.has('key4')).toBe(true)
    })
  })

  describe('基础操作', () => {
    it('应该正确设置和获取值', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('应该返回正确的大小', () => {
      expect(cache.size).toBe(0)

      cache.set('key1', 'value1')
      expect(cache.size).toBe(1)

      cache.set('key2', 'value2')
      expect(cache.size).toBe(2)
    })

    it('应该能删除指定项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      expect(cache.size).toBe(2)

      cache.delete('key1')
      expect(cache.size).toBe(1)
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
    })

    it('应该能清空所有项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      expect(cache.size).toBe(2)

      cache.clear()
      expect(cache.size).toBe(0)
    })
  })
})
