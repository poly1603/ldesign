import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CoreCacheManager } from '../cache-manager'
import { CacheError, ErrorCodes } from '../../errors'

describe('CoreCacheManager', () => {
  let manager: CoreCacheManager

  beforeEach(() => {
    manager = new CoreCacheManager()
  })

  describe('基本操作', () => {
    it('应该能够设置和获取缓存', () => {
      manager.set('key', 'value')
      
      expect(manager.get('key')).toBe('value')
    })

    it('应该在键不存在时返回 undefined', () => {
      expect(manager.get('nonexistent')).toBeUndefined()
    })

    it('应该能够检查键是否存在', () => {
      manager.set('key', 'value')
      
      expect(manager.has('key')).toBe(true)
      expect(manager.has('nonexistent')).toBe(false)
    })

    it('应该能够删除缓存', () => {
      manager.set('key', 'value')
      
      expect(manager.delete('key')).toBe(true)
      expect(manager.has('key')).toBe(false)
    })

    it('应该在删除不存在的键时返回 false', () => {
      expect(manager.delete('nonexistent')).toBe(false)
    })

    it('应该能够清空所有缓存', () => {
      manager.set('key1', 'value1')
      manager.set('key2', 'value2')
      
      manager.clear()
      
      expect(manager.has('key1')).toBe(false)
      expect(manager.has('key2')).toBe(false)
      expect(manager.size()).toBe(0)
    })

    it('应该返回正确的缓存大小', () => {
      expect(manager.size()).toBe(0)
      
      manager.set('key1', 'value1')
      expect(manager.size()).toBe(1)
      
      manager.set('key2', 'value2')
      expect(manager.size()).toBe(2)
      
      manager.delete('key1')
      expect(manager.size()).toBe(1)
    })
  })

  describe('TTL (过期时间)', () => {
    it('应该支持 TTL', async () => {
      manager.set('key', 'value', 100) // 100ms TTL
      
      expect(manager.get('key')).toBe('value')
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(manager.get('key')).toBeUndefined()
    })

    it('应该使用默认 TTL', async () => {
      const managerWithTTL = new CoreCacheManager({ defaultTTL: 100 })
      
      managerWithTTL.set('key', 'value')
      
      expect(managerWithTTL.get('key')).toBe('value')
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(managerWithTTL.get('key')).toBeUndefined()
    })

    it('应该支持永不过期 (TTL = 0)', async () => {
      manager.set('key', 'value', 0)
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(manager.get('key')).toBe('value')
    })
  })

  describe('LRU 策略', () => {
    it('应该在达到最大容量时驱逐最少使用的项', () => {
      const lruManager = new CoreCacheManager({ maxSize: 3, strategy: 'lru' })
      
      lruManager.set('key1', 'value1')
      lruManager.set('key2', 'value2')
      lruManager.set('key3', 'value3')
      
      // 访问 key1,使其成为最近使用
      lruManager.get('key1')
      
      // 添加新项,应该驱逐 key2
      lruManager.set('key4', 'value4')
      
      expect(lruManager.has('key1')).toBe(true)
      expect(lruManager.has('key2')).toBe(false)
      expect(lruManager.has('key3')).toBe(true)
      expect(lruManager.has('key4')).toBe(true)
    })

    it('应该在访问时更新 LRU 顺序', () => {
      const lruManager = new CoreCacheManager({ maxSize: 2, strategy: 'lru' })
      
      lruManager.set('key1', 'value1')
      lruManager.set('key2', 'value2')
      
      // 访问 key1
      lruManager.get('key1')
      
      // 添加新项,应该驱逐 key2
      lruManager.set('key3', 'value3')
      
      expect(lruManager.has('key1')).toBe(true)
      expect(lruManager.has('key2')).toBe(false)
      expect(lruManager.has('key3')).toBe(true)
    })
  })

  describe('批量操作', () => {
    it('应该支持批量设置', () => {
      manager.setMany([
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3']
      ])
      
      expect(manager.get('key1')).toBe('value1')
      expect(manager.get('key2')).toBe('value2')
      expect(manager.get('key3')).toBe('value3')
    })

    it('应该支持批量获取', () => {
      manager.set('key1', 'value1')
      manager.set('key2', 'value2')
      manager.set('key3', 'value3')
      
      const values = manager.getMany(['key1', 'key2', 'key3', 'nonexistent'])
      
      expect(values).toEqual(['value1', 'value2', 'value3', undefined])
    })

    it('应该支持批量删除', () => {
      manager.set('key1', 'value1')
      manager.set('key2', 'value2')
      manager.set('key3', 'value3')
      
      manager.deleteMany(['key1', 'key3'])
      
      expect(manager.has('key1')).toBe(false)
      expect(manager.has('key2')).toBe(true)
      expect(manager.has('key3')).toBe(false)
    })
  })

  describe('统计信息', () => {
    it('应该返回正确的统计信息', () => {
      manager.set('key1', 'value1')
      manager.set('key2', 'value2')
      
      manager.get('key1') // hit
      manager.get('key1') // hit
      manager.get('nonexistent') // miss
      
      const stats = manager.getStats()
      
      expect(stats.size).toBe(2)
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(0.67, 1)
    })

    it('应该跟踪驱逐次数', () => {
      const smallManager = new CoreCacheManager({ maxSize: 2 })
      
      smallManager.set('key1', 'value1')
      smallManager.set('key2', 'value2')
      smallManager.set('key3', 'value3') // 触发驱逐
      
      const stats = smallManager.getStats()
      
      expect(stats.evictions).toBeGreaterThan(0)
    })
  })

  describe('内存压力响应', () => {
    it('应该能够获取内存压力状态', () => {
      const pressure = manager.getMemoryPressure()
      
      expect(pressure).toBeDefined()
      expect(pressure.level).toBeDefined()
      expect(pressure.usageRatio).toBeDefined()
      expect(pressure.timestamp).toBeDefined()
    })

    // 注意: 实际的内存压力测试需要模拟内存使用情况
    // 这里只是验证 API 存在
  })

  describe('错误处理', () => {
    it('应该在空键时抛出错误', () => {
      try {
        manager.set('', 'value')
        expect.fail('应该抛出错误')
      } catch (error) {
        expect(error).toBeInstanceOf(CacheError)
        expect((error as CacheError).code).toBe(ErrorCodes.CACHE_INVALID_KEY)
      }
    })

    it('应该在空白键时抛出错误', () => {
      try {
        manager.set('   ', 'value')
        expect.fail('应该抛出错误')
      } catch (error) {
        expect(error).toBeInstanceOf(CacheError)
        expect((error as CacheError).code).toBe(ErrorCodes.CACHE_INVALID_KEY)
      }
    })

    it('应该处理各种数据类型', () => {
      manager.set('string', 'value')
      manager.set('number', 123)
      manager.set('boolean', true)
      manager.set('object', { key: 'value' })
      manager.set('array', [1, 2, 3])
      manager.set('null', null)
      
      expect(manager.get('string')).toBe('value')
      expect(manager.get('number')).toBe(123)
      expect(manager.get('boolean')).toBe(true)
      expect(manager.get('object')).toEqual({ key: 'value' })
      expect(manager.get('array')).toEqual([1, 2, 3])
      expect(manager.get('null')).toBe(null)
    })
  })

  describe('性能', () => {
    it('应该能够处理大量缓存项', () => {
      const largeManager = new CoreCacheManager({ maxSize: 10000 })
      
      for (let i = 0; i < 10000; i++) {
        largeManager.set(`key${i}`, `value${i}`)
      }
      
      expect(largeManager.size()).toBe(10000)
      
      for (let i = 0; i < 10000; i++) {
        expect(largeManager.get(`key${i}`)).toBe(`value${i}`)
      }
    })

    it('应该快速执行 get 操作', () => {
      for (let i = 0; i < 1000; i++) {
        manager.set(`key${i}`, `value${i}`)
      }
      
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        manager.get(`key${i}`)
      }
      
      const duration = performance.now() - start
      
      // 1000 次 get 操作应该在 100ms 内完成
      expect(duration).toBeLessThan(100)
    })
  })

  describe('生命周期', () => {
    it('应该能够初始化', async () => {
      await expect(manager.init()).resolves.toBeUndefined()
    })

    it('应该能够销毁', async () => {
      manager.set('key', 'value')
      
      await manager.destroy()
      
      expect(manager.size()).toBe(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理重复设置相同的键', () => {
      manager.set('key', 'value1')
      manager.set('key', 'value2')
      
      expect(manager.get('key')).toBe('value2')
      expect(manager.size()).toBe(1)
    })

    it('应该处理 undefined 值', () => {
      manager.set('key', undefined)
      
      expect(manager.has('key')).toBe(true)
      expect(manager.get('key')).toBeUndefined()
    })

    it('应该处理空数组的批量操作', () => {
      manager.setMany([])
      expect(manager.getMany([])).toEqual([])
      manager.deleteMany([])
      
      expect(manager.size()).toBe(0)
    })
  })
})

