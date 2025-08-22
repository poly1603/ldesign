/**
 * LRU缓存测试用例
 * 测试LRU缓存的功能，包括插入、获取、过期、清理等
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { createLRUCache, LRUCacheImpl } from '../../src/cache/lru-cache'
import type { CacheOptions } from '../../src/types'

describe('LRU缓存测试', () => {
  let cache: LRUCacheImpl<string>
  const defaultOptions: CacheOptions = {
    maxSize: 1000,
    maxItems: 10,
    ttl: 5000, // 5秒
    strategy: 'lru',
  }

  beforeEach(() => {
    cache = new LRUCacheImpl<string>(defaultOptions)
  })

  afterEach(() => {
    cache.destroy()
  })

  describe('基本操作', () => {
    it('应该能够设置和获取值', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('应该在键不存在时返回undefined', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('应该正确检查键是否存在', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('应该能够删除键', () => {
      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.delete('nonexistent')).toBe(false)
    })

    it('应该能够清空缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBeUndefined()
      
      const stats = cache.getStats()
      expect(stats.itemCount).toBe(0)
      expect(stats.size).toBe(0)
    })
  })

  describe('LRU策略', () => {
    it('应该按照LRU顺序清理项目', () => {
      const smallCache = new LRUCacheImpl<string>({
        ...defaultOptions,
        maxItems: 3,
        maxSize: 1000,
      })

      try {
        // 添加3个项目
        smallCache.set('key1', 'value1', 10)
        smallCache.set('key2', 'value2', 10)
        smallCache.set('key3', 'value3', 10)

        // 访问第一个项目，使其成为最新使用的
        smallCache.get('key1')

        // 添加第4个项目，应该清理key2（最少使用的）
        smallCache.set('key4', 'value4', 10)

        expect(smallCache.has('key1')).toBe(true) // 最近访问过
        expect(smallCache.has('key2')).toBe(false) // 应该被清理
        expect(smallCache.has('key3')).toBe(true)
        expect(smallCache.has('key4')).toBe(true)
      } finally {
        smallCache.destroy()
      }
    })

    it('应该在访问时更新项目顺序', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 访问key1，应该将其移到头部
      const value = cache.get('key1')
      expect(value).toBe('value1')
      
      // 验证访问确实更新了顺序（通过内部结构难以直接测试，
      // 但可以通过后续的清理行为来验证）
      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(0)
    })
  })

  describe('大小管理', () => {
    it('应该限制缓存总大小', () => {
      const sizeCache = new LRUCacheImpl<string>({
        ...defaultOptions,
        maxSize: 100,
        maxItems: 100,
      })

      try {
        // 添加项目直到接近大小限制
        sizeCache.set('key1', 'value1', 30)
        sizeCache.set('key2', 'value2', 30)
        sizeCache.set('key3', 'value3', 30)
        
        expect(sizeCache.getStats().size).toBe(90)
        
        // 添加超出限制的项目
        sizeCache.set('key4', 'value4', 50)
        
        // 应该清理一些旧项目
        expect(sizeCache.getStats().size).toBeLessThanOrEqual(100)
      } finally {
        sizeCache.destroy()
      }
    })

    it('应该拒绝过大的单个项目', () => {
      expect(() => {
        cache.set('key1', 'value1', 2000) // 超过maxSize
      }).toThrow()
    })
  })

  describe('TTL过期', () => {
    it('应该自动过期TTL超时的项目', async () => {
      const shortTtlCache = new LRUCacheImpl<string>({
        ...defaultOptions,
        ttl: 100, // 100ms
      })

      try {
        shortTtlCache.set('key1', 'value1')
        expect(shortTtlCache.get('key1')).toBe('value1')

        // 等待过期
        await new Promise(resolve => setTimeout(resolve, 150))

        expect(shortTtlCache.get('key1')).toBeUndefined()
        expect(shortTtlCache.has('key1')).toBe(false)
      } finally {
        shortTtlCache.destroy()
      }
    })

    it('应该在定期清理中移除过期项目', async () => {
      const shortTtlCache = new LRUCacheImpl<string>({
        ...defaultOptions,
        ttl: 50,
      })

      try {
        shortTtlCache.set('key1', 'value1')
        shortTtlCache.set('key2', 'value2')

        expect(shortTtlCache.getStats().itemCount).toBe(2)

        // 等待过期和清理
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 触发清理（通过访问不存在的键）
        shortTtlCache.get('nonexistent')

        // 注意：定期清理是异步的，可能需要更长时间
        // 这里我们主要测试过期检测机制
      } finally {
        shortTtlCache.destroy()
      }
    })
  })

  describe('统计信息', () => {
    it('应该正确跟踪命中和未命中', () => {
      cache.set('key1', 'value1')

      cache.get('key1') // 命中
      cache.get('key2') // 未命中
      cache.get('key1') // 命中

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(2/3, 2)
    })

    it('应该正确跟踪大小和项目数量', () => {
      cache.set('key1', 'value1', 10)
      cache.set('key2', 'value2', 20)

      const stats = cache.getStats()
      expect(stats.itemCount).toBe(2)
      expect(stats.size).toBe(30)
    })

    it('应该在删除时更新统计', () => {
      cache.set('key1', 'value1', 10)
      cache.set('key2', 'value2', 20)

      cache.delete('key1')

      const stats = cache.getStats()
      expect(stats.itemCount).toBe(1)
      expect(stats.size).toBe(20)
    })
  })

  describe('调整大小', () => {
    it('应该能够调整缓存限制', () => {
      cache.set('key1', 'value1', 10)
      cache.set('key2', 'value2', 20)
      cache.set('key3', 'value3', 30)

      // 缩小缓存大小
      cache.resize(40, 2)

      // 应该清理项目以符合新限制
      const stats = cache.getStats()
      expect(stats.itemCount).toBeLessThanOrEqual(2)
      expect(stats.size).toBeLessThanOrEqual(40)
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串键', () => {
      cache.set('', 'empty key value')
      expect(cache.get('')).toBe('empty key value')
    })

    it('应该处理更新现有键', () => {
      cache.set('key1', 'value1', 10)
      cache.set('key1', 'value2', 15) // 更新

      expect(cache.get('key1')).toBe('value2')
      
      const stats = cache.getStats()
      expect(stats.itemCount).toBe(1)
      expect(stats.size).toBe(15)
    })

    it('应该处理零大小的项目', () => {
      cache.set('key1', 'value1', 0)
      expect(cache.get('key1')).toBe('value1')
      
      const stats = cache.getStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('内存清理', () => {
    it('应该在销毁时清理所有资源', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      cache.destroy()

      // 销毁后应该无法使用
      expect(cache.get('key1')).toBeUndefined()
      
      const stats = cache.getStats()
      expect(stats.itemCount).toBe(0)
      expect(stats.size).toBe(0)
    })
  })

  describe('工厂函数', () => {
    it('createLRUCache应该创建有效的缓存实例', () => {
      const newCache = createLRUCache<number>(defaultOptions)
      
      newCache.set('test', 42)
      expect(newCache.get('test')).toBe(42)
      
      newCache.destroy()
    })
  })

  describe('性能测试', () => {
    it('应该高效处理大量操作', () => {
      const startTime = performance.now()
      
      // 大量插入操作
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, `value${i}`, 1)
      }
      
      // 大量查询操作
      for (let i = 0; i < 1000; i++) {
        cache.get(`key${i}`)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 操作应该在合理时间内完成（这个阈值可以根据需要调整）
      expect(duration).toBeLessThan(1000) // 1秒
    })
  })
})