/**
 * LRU缓存测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LRUCache } from '../src/utils/LRUCache'
import type { LRUCacheConfig } from '../src/utils/LRUCache'

describe('LRUCache', () => {
  let cache: LRUCache<string>
  let config: LRUCacheConfig

  beforeEach(() => {
    config = {
      maxSize: 3,
      defaultTTL: 1000,
      enabled: true,
      cleanupInterval: 100,
    }
    cache = new LRUCache<string>(config)
  })

  afterEach(() => {
    cache.destroy()
  })

  describe('基础功能', () => {
    it('应该正确设置和获取缓存', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('应该在禁用时返回null', () => {
      const disabledCache = new LRUCache<string>({
        ...config,
        enabled: false,
      })
      
      disabledCache.set('key1', 'value1')
      expect(disabledCache.get('key1')).toBeNull()
      
      disabledCache.destroy()
    })

    it('应该正确处理不存在的键', () => {
      expect(cache.get('nonexistent')).toBeNull()
    })

    it('应该正确删除缓存项', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      
      cache.delete('key1')
      expect(cache.get('key1')).toBeNull()
    })

    it('应该正确清空所有缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      cache.clear()
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })
  })

  describe('LRU 策略', () => {
    it('应该在达到最大容量时移除最久未使用的项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      
      // 此时缓存已满，添加新项应该移除最久未使用的 key1
      cache.set('key4', 'value4')
      
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBe('value2')
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
    })

    it('应该在访问时更新项的位置', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      
      // 访问 key1，使其成为最近使用的
      cache.get('key1')
      
      // 添加新项，应该移除 key2（最久未使用）
      cache.set('key4', 'value4')
      
      expect(cache.get('key1')).toBe('value1')
      expect(cache.get('key2')).toBeNull()
      expect(cache.get('key3')).toBe('value3')
      expect(cache.get('key4')).toBe('value4')
    })
  })

  describe('TTL 过期', () => {
    it('应该在TTL过期后返回null', async () => {
      const shortTTLCache = new LRUCache<string>({
        maxSize: 10,
        defaultTTL: 50,
        enabled: true,
      })

      shortTTLCache.set('key1', 'value1')
      expect(shortTTLCache.get('key1')).toBe('value1')

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(shortTTLCache.get('key1')).toBeNull()
      
      shortTTLCache.destroy()
    })

    it('应该支持自定义TTL', async () => {
      cache.set('key1', 'value1', 50)
      expect(cache.get('key1')).toBe('value1')

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(cache.get('key1')).toBeNull()
    })
  })

  describe('统计信息', () => {
    it('应该正确统计命中和未命中', () => {
      cache.set('key1', 'value1')
      
      // 命中
      cache.get('key1')
      cache.get('key1')
      
      // 未命中
      cache.get('nonexistent')
      
      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(0.67, 2)
    })

    it('应该正确统计缓存大小', () => {
      const stats1 = cache.getStats()
      expect(stats1.size).toBe(0)
      
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      const stats2 = cache.getStats()
      expect(stats2.size).toBe(2)
      expect(stats2.maxSize).toBe(3)
    })
  })

  describe('内存管理', () => {
    it('应该正确估算内存使用', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      const stats = cache.getStats()
      expect(stats.memoryUsage).toBeGreaterThan(0)
    })

    it('应该在销毁时清理资源', () => {
      cache.set('key1', 'value1')
      cache.destroy()
      
      // 销毁后应该无法使用
      expect(cache.get('key1')).toBeNull()
    })
  })

  describe('边界情况', () => {
    it('应该处理空字符串键', () => {
      cache.set('', 'empty-key-value')
      expect(cache.get('')).toBe('empty-key-value')
    })

    it('应该处理undefined和null值', () => {
      cache.set('undefined', undefined as any)
      cache.set('null', null as any)
      
      expect(cache.get('undefined')).toBeUndefined()
      expect(cache.get('null')).toBeNull()
    })

    it('应该处理大量数据', () => {
      const largeCache = new LRUCache<string>({
        maxSize: 1000,
        defaultTTL: 60000,
        enabled: true,
      })

      // 添加大量数据
      for (let i = 0; i < 500; i++) {
        largeCache.set(`key${i}`, `value${i}`)
      }

      // 验证数据正确性
      expect(largeCache.get('key0')).toBe('value0')
      expect(largeCache.get('key499')).toBe('value499')
      
      const stats = largeCache.getStats()
      expect(stats.size).toBe(500)
      
      largeCache.destroy()
    })
  })
})
