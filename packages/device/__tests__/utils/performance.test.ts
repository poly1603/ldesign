import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BatchExecutor,
  debounce,
  LazyLoader,
  memoize,
  MemoryCache,
  rafThrottle,
  throttle,
} from '../../src/utils/performance'

describe('performance Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('debounce', () => {
    it('应该延迟执行函数', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该在连续调用时重置计时器', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      vi.advanceTimersByTime(50)
      debouncedFn()
      vi.advanceTimersByTime(50)
      debouncedFn()
      vi.advanceTimersByTime(50)

      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该支持立即执行', () => {
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

    it('应该支持取消', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn.cancel()
      vi.advanceTimersByTime(100)

      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('throttle', () => {
    it('应该限制函数执行频率', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)

      throttledFn()
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('应该支持 leading 选项', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100, { leading: false })

      throttledFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该支持 trailing 选项', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100, { trailing: false })

      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)

      throttledFn()
      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该支持取消', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      throttledFn.cancel()

      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('memoryCache', () => {
    it('应该存储和获取值', () => {
      const cache = new MemoryCache()

      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.size).toBe(1)
    })

    it('应该支持 TTL', () => {
      const cache = new MemoryCache({ defaultTTL: 100 })

      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')

      vi.advanceTimersByTime(50)
      expect(cache.get('key1')).toBe('value1')

      vi.advanceTimersByTime(51)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('应该支持 LRU 淘汰', () => {
      const cache = new MemoryCache({ maxSize: 2 })

      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(true)
    })

    it('应该更新访问顺序', () => {
      const cache = new MemoryCache({ maxSize: 2 })

      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      // 访问 key1，使其成为最近使用的
      cache.get('key1')

      cache.set('key3', 'value3')

      expect(cache.has('key1')).toBe(true)
      expect(cache.has('key2')).toBe(false)
      expect(cache.has('key3')).toBe(true)
    })

    it('应该支持删除', () => {
      const cache = new MemoryCache()

      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.has('key1')).toBe(false)
      expect(cache.delete('key1')).toBe(false)
    })

    it('应该支持清空', () => {
      const cache = new MemoryCache()

      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()

      expect(cache.size).toBe(0)
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(false)
    })

    it('应该清理过期项', () => {
      const cache = new MemoryCache()

      cache.set('key1', 'value1', 50)
      cache.set('key2', 'value2', 100)
      cache.set('key3', 'value3')

      vi.advanceTimersByTime(75)
      cache.prune()

      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(true)
    })

    it('应该返回所有键', () => {
      const cache = new MemoryCache()

      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      const keys = cache.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toHaveLength(2)
    })
  })

  describe('memoize', () => {
    it('应该缓存函数结果', () => {
      const fn = vi.fn((x: number) => x * 2)
      const memoizedFn = memoize(fn)

      expect(memoizedFn(5)).toBe(10)
      expect(memoizedFn(5)).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)

      expect(memoizedFn(10)).toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('应该支持自定义缓存键', () => {
      const fn = vi.fn((a: number, b: number) => a + b)
      const memoizedFn = memoize(fn, {
        getKey: (a, b) => `${a}-${b}`,
      })

      expect(memoizedFn(1, 2)).toBe(3)
      expect(memoizedFn(1, 2)).toBe(3)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('应该支持 TTL', () => {
      const fn = vi.fn((x: number) => x * 2)
      const memoizedFn = memoize(fn, { ttl: 100 })

      expect(memoizedFn(5)).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(50)
      expect(memoizedFn(5)).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(51)
      expect(memoizedFn(5)).toBe(10)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('应该支持最大缓存大小', () => {
      const fn = vi.fn((x: number) => x * 2)
      const memoizedFn = memoize(fn, { maxSize: 2 })

      memoizedFn(1)
      memoizedFn(2)
      memoizedFn(3)

      expect(fn).toHaveBeenCalledTimes(3)

      memoizedFn(1) // 应该重新计算，因为被淘汰了
      expect(fn).toHaveBeenCalledTimes(4)
    })
  })

  describe('lazyLoader', () => {
    it('应该懒加载资源', async () => {
      const loader = new LazyLoader<string>()
      const mockLoader = vi.fn().mockResolvedValue('loaded resource')

      loader.register('resource1', mockLoader)

      const result = await loader.load('resource1')
      expect(result).toBe('loaded resource')
      expect(mockLoader).toHaveBeenCalledTimes(1)
    })

    it('应该缓存已加载的资源', async () => {
      const loader = new LazyLoader<string>()
      const mockLoader = vi.fn().mockResolvedValue('loaded resource')

      loader.register('resource1', mockLoader)

      await loader.load('resource1')
      await loader.load('resource1')

      expect(mockLoader).toHaveBeenCalledTimes(1)
    })

    it('应该处理并发加载', async () => {
      const loader = new LazyLoader<string>()
      const mockLoader = vi.fn().mockResolvedValue('loaded')

      loader.register('resource1', mockLoader)

      const promise1 = loader.load('resource1')
      const promise2 = loader.load('resource1')

      expect(loader.isLoading('resource1')).toBe(true)

      const [result1, result2] = await Promise.all([promise1, promise2])

      expect(result1).toBe('loaded')
      expect(result2).toBe('loaded')
      expect(mockLoader).toHaveBeenCalledTimes(1)
    })

    it('应该检查加载状态', async () => {
      const loader = new LazyLoader<string>()
      const mockLoader = vi.fn().mockResolvedValue('loaded')

      loader.register('resource1', mockLoader)

      expect(loader.isLoaded('resource1')).toBe(false)
      expect(loader.isLoading('resource1')).toBe(false)

      const loadPromise = loader.load('resource1')
      expect(loader.isLoading('resource1')).toBe(true)

      await loadPromise
      expect(loader.isLoaded('resource1')).toBe(true)
      expect(loader.isLoading('resource1')).toBe(false)
    })

    it('应该预加载多个资源', async () => {
      const loader = new LazyLoader<string>()

      loader.register('resource1', vi.fn().mockResolvedValue('r1'))
      loader.register('resource2', vi.fn().mockResolvedValue('r2'))
      loader.register('resource3', vi.fn().mockResolvedValue('r3'))

      await loader.preload(['resource1', 'resource2'])

      expect(loader.isLoaded('resource1')).toBe(true)
      expect(loader.isLoaded('resource2')).toBe(true)
      expect(loader.isLoaded('resource3')).toBe(false)
    })

    it('应该清除缓存', async () => {
      const loader = new LazyLoader<string>()
      const mockLoader = vi.fn().mockResolvedValue('loaded')

      loader.register('resource1', mockLoader)
      loader.register('resource2', mockLoader)

      await loader.load('resource1')
      await loader.load('resource2')

      loader.clear('resource1')
      expect(loader.isLoaded('resource1')).toBe(false)
      expect(loader.isLoaded('resource2')).toBe(true)

      loader.clear()
      expect(loader.isLoaded('resource2')).toBe(false)
    })

    it('应该处理加载错误', async () => {
      const loader = new LazyLoader<string>()
      const mockLoader = vi.fn().mockRejectedValue(new Error('Load failed'))

      loader.register('resource1', mockLoader)

      await expect(loader.load('resource1')).rejects.toThrow('Load failed')
      expect(loader.isLoaded('resource1')).toBe(false)
    })

    it('应该处理未注册的资源', async () => {
      const loader = new LazyLoader<string>()

      await expect(loader.load('unknown')).rejects.toThrow('Loader for "unknown" not found')
    })
  })

  describe('rafThrottle', () => {
    it('应该使用 requestAnimationFrame 节流', () => {
      const fn = vi.fn()
      const throttledFn = rafThrottle(fn)

      // Mock requestAnimationFrame
      let rafCallback: FrameRequestCallback | null = null
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
        rafCallback = callback
        return 1
      })

      throttledFn('arg1')
      throttledFn('arg2')
      throttledFn('arg3')

      expect(fn).not.toHaveBeenCalled()

      // 执行 RAF 回调
      if (rafCallback) {
        rafCallback(0)
      }

      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg1')
    })

    it('应该支持取消', () => {
      const fn = vi.fn()
      const throttledFn = rafThrottle(fn)

      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
      vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)

      throttledFn()
      throttledFn.cancel()

      expect(cancelSpy).toHaveBeenCalledWith(1)
    })
  })

  describe('batchExecutor', () => {
    it('应该批量执行', async () => {
      const executor = vi.fn().mockImplementation((batch: number[]) =>
        batch.map(x => x * 2),
      )
      const batchExecutor = new BatchExecutor(executor, {
        maxBatchSize: 3,
        maxWaitTime: 100,
      })

      const results = await Promise.all([
        batchExecutor.add(1),
        batchExecutor.add(2),
        batchExecutor.add(3),
      ])

      expect(results).toEqual([2, 4, 6])
      expect(executor).toHaveBeenCalledTimes(1)
      expect(executor).toHaveBeenCalledWith([1, 2, 3])
    })

    it('应该在达到批大小时立即执行', async () => {
      const executor = vi.fn().mockImplementation((batch: number[]) =>
        batch.map(x => x * 2),
      )
      const batchExecutor = new BatchExecutor(executor, {
        maxBatchSize: 2,
        maxWaitTime: 1000,
      })

      const promise1 = batchExecutor.add(1)
      const promise2 = batchExecutor.add(2)

      // 不需要等待，应该立即执行
      const results = await Promise.all([promise1, promise2])

      expect(results).toEqual([2, 4])
      expect(executor).toHaveBeenCalledTimes(1)
    })

    it('应该在等待时间后执行', async () => {
      vi.useRealTimers() // 使用真实计时器以便 Promise 能正确解析

      const executor = vi.fn().mockImplementation((batch: number[]) =>
        batch.map(x => x * 2),
      )
      const batchExecutor = new BatchExecutor(executor, {
        maxBatchSize: 10,
        maxWaitTime: 50,
      })

      const promise = batchExecutor.add(1)

      await new Promise(resolve => setTimeout(resolve, 60))

      const result = await promise
      expect(result).toBe(2)
      expect(executor).toHaveBeenCalledTimes(1)
      expect(executor).toHaveBeenCalledWith([1])
    })

    it('应该支持强制执行', async () => {
      const executor = vi.fn().mockImplementation((batch: number[]) =>
        batch.map(x => x * 2),
      )
      const batchExecutor = new BatchExecutor(executor, {
        maxBatchSize: 10,
        maxWaitTime: 1000,
      })

      const promise = batchExecutor.add(1)
      await batchExecutor.forceFlush()

      const result = await promise
      expect(result).toBe(2)
      expect(executor).toHaveBeenCalledTimes(1)
    })

    it('应该处理执行错误', async () => {
      const executor = vi.fn().mockRejectedValue(new Error('Execution failed'))
      const batchExecutor = new BatchExecutor(executor, {
        maxBatchSize: 2,
      })

      const promise1 = batchExecutor.add(1)
      const promise2 = batchExecutor.add(2)

      await expect(promise1).rejects.toThrow('Execution failed')
      await expect(promise2).rejects.toThrow('Execution failed')
    })
  })
})
