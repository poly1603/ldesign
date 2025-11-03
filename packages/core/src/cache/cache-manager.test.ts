/**
 * CacheManager 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createCacheManager } from './cache-manager'

describe('CacheManager', () => {
  describe('基础操作', () => {
    it('应该能够设置和获取缓存', () => {
      const cache = createCacheManager()
      cache.set('key', 'value')
      expect(cache.get('key')).toBe('value')
    })

    it('应该能够检查缓存是否存在', () => {
      const cache = createCacheManager()
      cache.set('key', 'value')
      expect(cache.has('key')).toBe(true)
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('应该能够删除缓存', () => {
      const cache = createCacheManager()
      cache.set('key', 'value')
      expect(cache.delete('key')).toBe(true)
      expect(cache.has('key')).toBe(false)
      expect(cache.delete('nonexistent')).toBe(false)
    })

    it('应该能够清空所有缓存', () => {
      const cache = createCacheManager()
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.size()).toBe(0)
    })

    it('应该能够获取缓存大小', () => {
      const cache = createCacheManager()
      expect(cache.size()).toBe(0)
      cache.set('key1', 'value1')
      expect(cache.size()).toBe(1)
      cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)
    })

    it('应该能够获取所有缓存键', () => {
      const cache = createCacheManager()
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      const keys = cache.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys.length).toBe(2)
    })
  })

  describe('TTL 过期', () => {
    it('应该在 TTL 到期后删除缓存', async () => {
      const cache = createCacheManager()
      cache.set('key', 'value', 100) // 100ms TTL
      expect(cache.has('key')).toBe(true)

      await new Promise(resolve => setTimeout(resolve, 150))

      expect(cache.has('key')).toBe(false)
      expect(cache.get('key')).toBeUndefined()
    })

    it('应该支持永久缓存（TTL = 0）', async () => {
      const cache = createCacheManager()
      cache.set('key', 'value', 0)

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(cache.has('key')).toBe(true)
    })
  })

  describe('LRU 淘汰策略', () => {
    it('应该在达到最大容量时淘汰最少使用的项', () => {
      const cache = createCacheManager({ maxSize: 3 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 访问 a，使其变为最近使用
      cache.get('a')

      // 添加 d，应该淘汰 b（最少使用）
      cache.set('d', 4)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })

    it('访问缓存项应该更新其访问时间', () => {
      const cache = createCacheManager({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)

      // 访问 a
      cache.get('a')

      // 添加 c，应该淘汰 b
      cache.set('c', 3)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
      expect(cache.has('c')).toBe(true)
    })
  })

  describe('LFU 淘汰策略', () => {
    it('应该淘汰访问次数最少的项', () => {
      const cache = createCacheManager({ maxSize: 3, strategy: 'lfu' })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 访问 a 多次
      cache.get('a')
      cache.get('a')
      cache.get('a')

      // 访问 b 一次
      cache.get('b')

      // 添加 d，应该淘汰 c（访问次数为 0）
      cache.set('d', 4)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(false)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('FIFO 淘汰策略', () => {
    it('应该淘汰最早添加的项', () => {
      const cache = createCacheManager({ maxSize: 3, strategy: 'fifo' })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      // 添加 d，应该淘汰 a（最早添加）
      cache.set('d', 4)

      expect(cache.has('a')).toBe(false)
      expect(cache.has('b')).toBe(true)
      expect(cache.has('c')).toBe(true)
      expect(cache.has('d')).toBe(true)
    })
  })

  describe('内存限制', () => {
    it('应该在达到内存限制时淘汰项', () => {
      const cache = createCacheManager({
        maxMemory: 100, // 100 字节
        maxSize: 100,
      })

      // 添加一些数据
      cache.set('key1', 'a'.repeat(30))
      cache.set('key2', 'b'.repeat(30))

      // 添加更多数据，应该触发淘汰
      cache.set('key3', 'c'.repeat(30))

      // 由于内存限制，某些项应该被淘汰
      expect(cache.size()).toBeLessThan(3)
    })
  })

  describe('批量预热', () => {
    it('应该能够批量预热缓存', async () => {
      const cache = createCacheManager()

      await cache.warmup([
        {
          key: 'user',
          loader: async () => ({ id: 1, name: 'Alice' }),
        },
        {
          key: 'config',
          loader: async () => ({ theme: 'dark' }),
        },
      ])

      expect(cache.has('user')).toBe(true)
      expect(cache.has('config')).toBe(true)
      expect(cache.get('user')).toEqual({ id: 1, name: 'Alice' })
    })

    it('预热失败不应该影响其他项', async () => {
      const cache = createCacheManager()
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { })

      await cache.warmup([
        {
          key: 'success',
          loader: async () => 'value',
        },
        {
          key: 'fail',
          loader: async () => {
            throw new Error('Failed')
          },
        },
      ])

      expect(cache.has('success')).toBe(true)
      expect(cache.has('fail')).toBe(false)

      consoleError.mockRestore()
    })
  })

  describe('统计信息', () => {
    it('应该正确统计缓存命中和未命中', () => {
      const cache = createCacheManager()
      cache.set('key', 'value')

      cache.get('key') // hit
      cache.get('key') // hit
      cache.get('nonexistent') // miss

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(2 / 3)
    })

    it('应该统计淘汰次数', () => {
      const cache = createCacheManager({ maxSize: 2 })
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3) // 淘汰 a
      cache.set('d', 4) // 淘汰 b

      const stats = cache.getStats()
      expect(stats.evictions).toBe(2)
    })
  })

  describe('清理功能', () => {
    it('应该能够手动清理过期项', async () => {
      const cache = createCacheManager()
      cache.set('key1', 'value1', 100)
      cache.set('key2', 'value2', 0) // 永久

      await new Promise(resolve => setTimeout(resolve, 150))

      cache.cleanup()

      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
    })
  })

  describe('参数验证', () => {
    it('应该拒绝空键', () => {
      const cache = createCacheManager()
      expect(() => cache.set('', 'value')).toThrow('缓存键不能为空')
    })

    it('应该拒绝纯空格键', () => {
      const cache = createCacheManager()
      expect(() => cache.set('   ', 'value')).toThrow('缓存键不能为空')
    })
  })

  describe('生命周期', () => {
    it('应该能够初始化和销毁', async () => {
      const cache = createCacheManager()

      await cache.init()

      cache.set('key', 'value')
      expect(cache.size()).toBe(1)

      await cache.destroy()

      expect(cache.size()).toBe(0)
    })
  })
})

