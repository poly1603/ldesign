/**
 * Cache 模块测试
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CacheManager } from '../src/cache'

describe('cacheManager', () => {
  let cache: CacheManager

  beforeEach(() => {
    cache = new CacheManager({
      maxSize: 100,
      ttl: 1000, // 1秒
    })
  })

  afterEach(() => {
    cache.clear()
  })

  describe('基本操作', () => {
    it('应该能够设置和获取缓存', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('应该能够检查缓存是否存在', () => {
      expect(cache.has('key1')).toBe(false)

      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
    })

    it('应该能够删除缓存', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)

      cache.delete('key1')
      expect(cache.has('key1')).toBe(false)
    })

    it('应该能够清空所有缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      expect(cache.size()).toBe(2)

      cache.clear()
      expect(cache.size()).toBe(0)
    })
  })

  describe('tTL 过期', () => {
    it('应该在TTL过期后自动删除缓存', async () => {
      cache.set('key1', 'value1', 100) // 100ms TTL

      expect(cache.get('key1')).toBe('value1')

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(cache.get('key1')).toBeUndefined()
    })

    it('应该能够更新缓存的TTL', () => {
      cache.set('key1', 'value1', 100)
      cache.touch('key1', 1000) // 延长TTL
      // 立即检查仍然存在
      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('lRU 淘汰', () => {
    it('应该在达到最大容量时淘汰最久未使用的项', () => {
      const smallCache = new CacheManager({ maxSize: 2 })

      smallCache.set('key1', 'value1')
      smallCache.set('key2', 'value2')
      smallCache.set('key3', 'value3') // 应该淘汰 key1

      expect(smallCache.has('key1')).toBe(false)
      expect(smallCache.has('key2')).toBe(true)
      expect(smallCache.has('key3')).toBe(true)
    })

    it('访问缓存应该更新其使用时间', () => {
      const smallCache = new CacheManager({ maxSize: 2 })

      smallCache.set('key1', 'value1')
      smallCache.set('key2', 'value2')

      // 访问 key1 使其变为最近使用
      smallCache.get('key1')

      smallCache.set('key3', 'value3') // 应该淘汰 key2

      expect(smallCache.has('key1')).toBe(true)
      expect(smallCache.has('key2')).toBe(false)
      expect(smallCache.has('key3')).toBe(true)
    })
  })

  describe('统计信息', () => {
    it('应该正确统计缓存大小', () => {
      expect(cache.size()).toBe(0)

      cache.set('key1', 'value1')
      expect(cache.size()).toBe(1)

      cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)

      cache.delete('key1')
      expect(cache.size()).toBe(1)
    })

    it('应该正确统计命中率', () => {
      cache.set('key1', 'value1')

      // 命中
      cache.get('key1')
      cache.get('key1')

      // 未命中
      cache.get('key2')

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(0.67, 2)
    })
  })

  describe('批量操作', () => {
    it('应该能够批量设置缓存', () => {
      cache.mset([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3'],
      ])

      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
    })

    it('应该能够批量获取缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      const values = cache.mget(['key1', 'key2', 'key4'])

      expect(values).toEqual(['value1', 'value2', undefined])
    })

    it('应该能够批量删除缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      cache.mdel(['key1', 'key3'])

      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(false)
    })
  })

  describe('键管理', () => {
    it('应该能够获取所有键', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      const keys = cache.keys()
      expect(keys.sort()).toEqual(['key1', 'key2', 'key3'])
    })

    it('应该能够获取所有�?, () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      const values = cache.values()
    expect(values.sort()).toEqual(['value1', 'value2', 'value3'])
  })

  it('应该能够获取所有条�?, () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      const entries = cache.entries()
  expect(entries).toHaveLength(2)
  expect(entries).toContainEqual(['key1', 'value1'])
  expect(entries).toContainEqual(['key2', 'value2'])
})
  })

describe('事件监听', () => {
  it('应该在设置缓存时触发事件', () => {
    let eventTriggered = false

    cache.on('set', (key, value) => {
      expect(key).toBe('key1')
      expect(value).toBe('value1')
      eventTriggered = true
    })

    cache.set('key1', 'value1')
    expect(eventTriggered).toBe(true)
  })

  it('应该在删除缓存时触发事件', () => {
    let eventTriggered = false

    cache.set('key1', 'value1')

    cache.on('delete', (key) => {
      expect(key).toBe('key1')
      eventTriggered = true
    })

    cache.delete('key1')
    expect(eventTriggered).toBe(true)
  })

  it('应该在缓存过期时触发事件', async () => {
    let eventTriggered = false

    cache.on('expire', (key) => {
      expect(key).toBe('key1')
      eventTriggered = true
    })

    cache.set('key1', 'value1', 50) // 50ms TTL

    // 等待过期
    await new Promise(resolve => setTimeout(resolve, 100))

    // 触发清理
    cache.get('key1')

    expect(eventTriggered).toBe(true)
  })
})
})

