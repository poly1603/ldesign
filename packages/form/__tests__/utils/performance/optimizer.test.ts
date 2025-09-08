/**
 * @ldesign/form 性能优化器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  debounce,
  throttle,
  rafDebounce,
  memoize,
  LRUCache,
  BatchProcessor,
  PerformanceMonitor,
  RenderOptimizer
} from '../../../src/utils/performance/optimizer'

describe('性能优化器', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('debounce', () => {
    it('应该延迟执行函数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在多次调用时只执行最后一次', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该支持立即执行模式', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100, true)

      debouncedFn()
      expect(fn).toHaveBeenCalledTimes(1)

      debouncedFn()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      debouncedFn()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('throttle', () => {
    it('应该限制函数执行频率', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)

      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('rafDebounce', () => {
    it('应该使用requestAnimationFrame延迟执行', () => {
      const fn = vi.fn()
      const rafDebouncedFn = rafDebounce(fn)

      // Mock requestAnimationFrame
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        setTimeout(cb, 16)
        return 1
      })

      rafDebouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(16)
      expect(fn).toHaveBeenCalledTimes(1)

      rafSpy.mockRestore()
    })
  })

  describe('memoize', () => {
    it('应该缓存函数结果', () => {
      const fn = vi.fn((x: number) => x * 2)
      const memoizedFn = memoize(fn)

      const result1 = memoizedFn(5)
      const result2 = memoizedFn(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该支持自定义键生成器', () => {
      const fn = vi.fn((obj: { id: number; name: string }) => obj.id + obj.name)
      const memoizedFn = memoize(fn, (obj) => obj.id.toString())

      const obj1 = { id: 1, name: 'test' }
      const obj2 = { id: 1, name: 'different' }

      memoizedFn(obj1)
      memoizedFn(obj2) // 应该使用缓存，因为id相同

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('LRUCache', () => {
    it('应该正确存储和获取值', () => {
      const cache = new LRUCache<string, number>(3)

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
    })

    it('应该在超出容量时删除最久未使用的项', () => {
      const cache = new LRUCache<string, number>(2)

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3) // 应该删除 'a'

      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
    })

    it('应该在访问时更新使用顺序', () => {
      const cache = new LRUCache<string, number>(2)

      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a') // 访问 'a'，使其成为最近使用
      cache.set('c', 3) // 应该删除 'b'

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe(3)
    })
  })

  describe('BatchProcessor', () => {
    it('应该批量处理项目', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor, 3, 100)

      batchProcessor.add('item1')
      batchProcessor.add('item2')
      expect(processor).not.toHaveBeenCalled()

      batchProcessor.add('item3')
      expect(processor).toHaveBeenCalledWith(['item1', 'item2', 'item3'])
    })

    it('应该在延迟后处理剩余项目', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor, 5, 100)

      batchProcessor.add('item1')
      batchProcessor.add('item2')

      vi.advanceTimersByTime(100)
      expect(processor).toHaveBeenCalledWith(['item1', 'item2'])
    })

    it('应该支持手动刷新', () => {
      const processor = vi.fn()
      const batchProcessor = new BatchProcessor(processor, 5, 100)

      batchProcessor.add('item1')
      batchProcessor.add('item2')
      batchProcessor.flush()

      expect(processor).toHaveBeenCalledWith(['item1', 'item2'])
    })
  })

  describe('PerformanceMonitor', () => {
    it('应该记录和测量性能标记', () => {
      const monitor = new PerformanceMonitor()

      monitor.mark('start')
      vi.advanceTimersByTime(100)
      monitor.mark('end')

      const duration = monitor.measure('test', 'start', 'end')
      expect(duration).toBeGreaterThan(0)
      expect(monitor.getMeasure('test')).toBe(duration)
    })

    it('应该支持不指定结束标记', () => {
      const monitor = new PerformanceMonitor()

      monitor.mark('start')
      vi.advanceTimersByTime(50)

      const duration = monitor.measure('test', 'start')
      expect(duration).toBeGreaterThan(0)
    })

    it('应该抛出错误当标记不存在时', () => {
      const monitor = new PerformanceMonitor()

      expect(() => {
        monitor.measure('test', 'nonexistent')
      }).toThrow('Start mark "nonexistent" not found')
    })

    it('应该能清除所有测量', () => {
      const monitor = new PerformanceMonitor()

      monitor.mark('start')
      monitor.measure('test', 'start')
      expect(monitor.getMeasure('test')).toBeDefined()

      monitor.clear()
      expect(monitor.getMeasure('test')).toBeUndefined()
    })
  })

  describe('RenderOptimizer', () => {
    it('应该调度和批量执行更新', () => {
      const optimizer = new RenderOptimizer()
      const update1 = vi.fn()
      const update2 = vi.fn()

      // Mock requestAnimationFrame
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        setTimeout(cb, 16)
        return 1
      })

      optimizer.scheduleUpdate(update1)
      optimizer.scheduleUpdate(update2)

      expect(update1).not.toHaveBeenCalled()
      expect(update2).not.toHaveBeenCalled()

      vi.advanceTimersByTime(16)

      expect(update1).toHaveBeenCalledTimes(1)
      expect(update2).toHaveBeenCalledTimes(1)

      rafSpy.mockRestore()
    })

    it('应该能取消更新', () => {
      const optimizer = new RenderOptimizer()
      const update = vi.fn()

      optimizer.scheduleUpdate(update)
      optimizer.cancelUpdate(update)

      // Mock requestAnimationFrame
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        setTimeout(cb, 16)
        return 1
      })

      vi.advanceTimersByTime(16)
      expect(update).not.toHaveBeenCalled()

      rafSpy.mockRestore()
    })

    it('应该处理更新中的错误', () => {
      const optimizer = new RenderOptimizer()
      const errorUpdate = vi.fn().mockImplementation(() => {
        throw new Error('Update error')
      })
      const normalUpdate = vi.fn()

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock requestAnimationFrame
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        setTimeout(cb, 16)
        return 1
      })

      optimizer.scheduleUpdate(errorUpdate)
      optimizer.scheduleUpdate(normalUpdate)

      vi.advanceTimersByTime(16)

      expect(errorUpdate).toHaveBeenCalled()
      expect(normalUpdate).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Update error:', expect.any(Error))

      consoleSpy.mockRestore()
      rafSpy.mockRestore()
    })
  })
})
