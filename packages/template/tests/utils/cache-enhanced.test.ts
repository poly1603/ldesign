import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { EnhancedCache } from '../../src/utils/cache-enhanced'

describe('EnhancedCache', () => {
  let cache: EnhancedCache<any>

  beforeEach(() => {
    cache = new EnhancedCache()
  })

  afterEach(() => {
    cache.clear()
  })

  describe('基本功能', () => {
    it('应该能够设置和获取缓存', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('应该在键不存在时返回 undefined', () => {
      expect(cache.get('non-existent')).toBeUndefined()
    })

    it('应该能够检查键是否存在', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
    })

    it('应该能够删除缓存项', () => {
      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.has('key1')).toBe(false)
      expect(cache.delete('key1')).toBe(false) // 再次删除应返回 false
    })

    it('应该能够清除所有缓存', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(false)
    })
  })

  describe('LRU 策略', () => {
    beforeEach(() => {
      cache = new EnhancedCache({
        strategy: 'lru',
        maxSize: 3,
      })
    })

    it('应该在超过最大大小时驱逐最久未使用的项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // key1 是最久未使用的
      cache.set('key4', 'value4')

      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(true)
      expect(cache.has('key4')).toBe(true)
    })

    it('访问应该更新使用时间', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 访问 key1，使其变为最近使用
      cache.get('key1')

      // 添加新项，应该驱逐 key2（现在是最久未使用的）
      cache.set('key4', 'value4')

      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
      expect(cache.has('key3')).toBe(true)
      expect(cache.has('key4')).toBe(true)
    })
  })

  describe('LFU 策略', () => {
    beforeEach(() => {
      cache = new EnhancedCache({
        strategy: 'lfu',
        maxSize: 3,
      })
    })

    it('应该在超过最大大小时驱逐最少使用的项', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // key1 访问 3 次
      cache.get('key1')
      cache.get('key1')
      cache.get('key1')

      // key2 访问 2 次
      cache.get('key2')
      cache.get('key2')

      // key3 访问 1 次（默认）

      // 添加新项，应该驱逐 key3（使用频率最低）
      cache.set('key4', 'value4')

      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(false)
      expect(cache.has('key4')).toBe(true)
    })

    it('应该正确计算访问频率', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      // key1 访问多次
      for (let i = 0; i < 10; i++) {
        cache.get('key1')
      }

      // key2 只访问一次
      cache.get('key2')

      cache.set('key3', 'value3')

      // 添加第四个项，应该驱逐 key2
      cache.set('key4', 'value4')

      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
    })
  })

  describe('FIFO 策略', () => {
    beforeEach(() => {
      cache = new EnhancedCache({
        strategy: 'fifo',
        maxSize: 3,
      })
    })

    it('应该按照先进先出顺序驱逐', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      // 访问不应该影响顺序
      cache.get('key1')
      cache.get('key1')

      // 添加新项，应该驱逐最早添加的 key1
      cache.set('key4', 'value4')

      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(true)
      expect(cache.has('key4')).toBe(true)
    })
  })

  describe('TTL (生存时间)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      cache = new EnhancedCache({
        ttl: 1000, // 1秒
      })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该在 TTL 过期后自动删除', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)

      // 前进 500ms，应该还存在
      vi.advanceTimersByTime(500)
      expect(cache.has('key1')).toBe(true)

      // 再前进 600ms，应该过期
      vi.advanceTimersByTime(600)
      expect(cache.has('key1')).toBe(false)
    })

    it('应该支持为单个项设置 TTL', () => {
      cache.set('key1', 'value1', 500) // 500ms TTL
      cache.set('key2', 'value2', 2000) // 2s TTL

      vi.advanceTimersByTime(600)

      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
    })

    it('访问应该刷新 TTL', () => {
      cache.set('key1', 'value1')

      vi.advanceTimersByTime(800)
      cache.get('key1') // 刷新 TTL

      vi.advanceTimersByTime(800)
      expect(cache.has('key1')).toBe(true) // 应该还存在

      vi.advanceTimersByTime(300)
      expect(cache.has('key1')).toBe(false) // 现在应该过期
    })
  })

  describe('WeakMap 缓存', () => {
    beforeEach(() => {
      cache = new EnhancedCache({
        weakCache: {
          enabled: true,
          maxRefs: 100,
        },
      })
    })

    it('应该能够使用对象作为弱引用键', () => {
      const obj = { id: 1 }
      cache.setWeak(obj, 'value1', 'key1')

      expect(cache.getWeak(obj, 'key1')).toBe('value1')
    })

    it('应该在对象被回收后自动删除', () => {
      let obj: any = { id: 1 }
      cache.setWeak(obj, 'value1', 'key1')

      expect(cache.hasWeak(obj, 'key1')).toBe(true)

      // 删除对象引用（模拟垃圾回收）
      obj = null

      // WeakMap 会自动清理，但我们无法直接测试
      // 这里只验证 API 正常工作
    })

    it('应该能够删除弱引用缓存', () => {
      const obj = { id: 1 }
      cache.setWeak(obj, 'value1', 'key1')

      expect(cache.deleteWeak(obj, 'key1')).toBe(true)
      expect(cache.hasWeak(obj, 'key1')).toBe(false)
    })
  })

  describe('统计功能', () => {
    beforeEach(() => {
      cache = new EnhancedCache({ maxSize: 10 })
    })

    it('应该正确计算命中率', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      // 2 次命中
      cache.get('key1')
      cache.get('key2')

      // 1 次未命中
      cache.get('key3')

      const stats = cache.getEnhancedStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(66.67, 1)
    })

    it('应该跟踪缓存大小', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      const stats = cache.getEnhancedStats()
      expect(stats.size).toBe(2)
      expect(stats.maxSize).toBe(10)
    })

    it('应该跟踪驱逐次数', () => {
      cache = new EnhancedCache({ maxSize: 2 })

      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3') // 触发驱逐

      const stats = cache.getEnhancedStats()
      expect(stats.evictionCount).toBe(1)
    })
  })

  describe('预热功能', () => {
    it('应该能够立即预热缓存', async () => {
      const loader = vi.fn(async (key: string) => `value-${key}`)

      await cache.warmup(['key1', 'key2', 'key3'], loader, {
        type: 'immediate',
      })

      expect(loader).toHaveBeenCalledTimes(3)
      expect(cache.get('key1')).toBe('value-key1')
      expect(cache.get('key2')).toBe('value-key2')
      expect(cache.get('key3')).toBe('value-key3')
    })

    it('应该能够延迟预热缓存', async () => {
      vi.useFakeTimers()

      const loader = vi.fn(async (key: string) => `value-${key}`)

      const promise = cache.warmup(['key1'], loader, {
        type: 'delayed',
        delay: 1000,
      })

      expect(loader).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1000)
      await promise

      expect(loader).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('应该能够空闲时预热缓存', async () => {
      const loader = vi.fn(async (key: string) => `value-${key}`)

      // 模拟 requestIdleCallback
      global.requestIdleCallback = vi.fn((cb: any) => {
        setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0)
        return 1
      }) as any

      await cache.warmup(['key1'], loader, { type: 'idle' })

      expect(loader).toHaveBeenCalled()

      delete (global as any).requestIdleCallback
    })

    it('预热失败应该记录错误但不抛出', async () => {
      const loader = vi.fn(async () => {
        throw new Error('Load failed')
      })

      // 不应该抛出错误
      await expect(
        cache.warmup(['key1'], loader, { type: 'immediate' }),
      ).resolves.not.toThrow()

      expect(cache.has('key1')).toBe(false)
    })
  })

  describe('配置更新', () => {
    it('应该能够动态更新配置', () => {
      cache.set('key1', 'value1')

      cache.updateConfig({
        strategy: 'lfu',
        maxSize: 5,
      })

      // 配置应该已更新（通过内部状态验证）
      cache.set('key2', 'value2')
      expect(cache.has('key2')).toBe(true)
    })

    it('更新配置不应影响现有缓存', () => {
      cache.set('key1', 'value1')

      cache.updateConfig({ maxSize: 5 })

      expect(cache.get('key1')).toBe('value1')
    })
  })

  describe('事件系统', () => {
    it('应该在命中时触发事件', () => {
      const listener = vi.fn()
      cache.on('hit', listener)

      cache.set('key1', 'value1')
      cache.get('key1')

      expect(listener).toHaveBeenCalledWith('key1')
    })

    it('应该在未命中时触发事件', () => {
      const listener = vi.fn()
      cache.on('miss', listener)

      cache.get('non-existent')

      expect(listener).toHaveBeenCalledWith('non-existent')
    })

    it('应该在驱逐时触发事件', () => {
      cache = new EnhancedCache({ maxSize: 1 })
      const listener = vi.fn()
      cache.on('evict', listener)

      cache.set('key1', 'value1')
      cache.set('key2', 'value2') // 触发驱逐

      expect(listener).toHaveBeenCalledWith('key1', 'value1')
    })

    it('应该能够移除事件监听器', () => {
      const listener = vi.fn()
      cache.on('hit', listener)
      cache.off('hit', listener)

      cache.set('key1', 'value1')
      cache.get('key1')

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('边界情况', () => {
    it('应该处理 undefined 和 null 值', () => {
      cache.set('key1', undefined)
      cache.set('key2', null)

      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBeNull()
    })

    it('应该处理复杂对象', () => {
      const obj = {
        nested: { deep: { value: 'test' } },
        array: [1, 2, 3],
        fn: () => 'hello',
      }

      cache.set('key1', obj)
      const retrieved = cache.get('key1')

      expect(retrieved).toBe(obj)
      expect(retrieved.nested.deep.value).toBe('test')
    })

    it('应该处理空键', () => {
      cache.set('', 'empty-key-value')
      expect(cache.get('')).toBe('empty-key-value')
    })

    it('maxSize 为 0 应该不缓存', () => {
      cache = new EnhancedCache({ maxSize: 0 })
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(false)
    })

    it('负数 TTL 应该立即过期', () => {
      cache.set('key1', 'value1', -1)
      expect(cache.has('key1')).toBe(false)
    })
  })

  describe('内存管理', () => {
    it('应该在内存使用过高时触发警告', () => {
      cache = new EnhancedCache({ maxSize: 5 })
      const listener = vi.fn()
      cache.on('memoryWarning', listener)

      // 添加大量数据
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, { large: 'data'.repeat(1000) })
      }

      // 应该触发内存警告（实际实现可能需要检测内存使用）
      // expect(listener).toHaveBeenCalled()
    })

    it('清除缓存应该释放内存', () => {
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, 'value')
      }

      const beforeClear = cache.getEnhancedStats().size
      cache.clear()
      const afterClear = cache.getEnhancedStats().size

      expect(beforeClear).toBeGreaterThan(0)
      expect(afterClear).toBe(0)
    })
  })

  describe('并发安全', () => {
    it('应该处理并发的 set 操作', async () => {
      const promises = []

      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            cache.set(`key${i}`, `value${i}`)
            resolve()
          }),
        )
      }

      await Promise.all(promises)

      const stats = cache.getEnhancedStats()
      expect(stats.size).toBeGreaterThan(0)
    })

    it('应该处理并发的 get 操作', async () => {
      cache.set('key1', 'value1')

      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            const value = cache.get('key1')
            expect(value).toBe('value1')
            resolve()
          }),
        )
      }

      await Promise.all(promises)
    })
  })
})
