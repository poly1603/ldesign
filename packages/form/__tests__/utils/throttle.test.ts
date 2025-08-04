import { beforeEach, describe, expect, it, vi } from 'vitest'
import { concurrent, debounce, rafThrottle, throttle } from '../../src/utils/throttle'

describe('throttle Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const mockFn = vi.fn()
      const throttled = throttle(mockFn, 100)

      throttled('arg1')
      throttled('arg2')
      throttled('arg3')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1')

      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('arg3')
    })

    it('should support leading=false option', () => {
      const mockFn = vi.fn()
      const throttled = throttle(mockFn, 100, { leading: false })

      throttled('arg1')
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledWith('arg1')
    })

    it('should support trailing=false option', () => {
      const mockFn = vi.fn()
      const throttled = throttle(mockFn, 100, { trailing: false })

      throttled('arg1')
      expect(mockFn).toHaveBeenCalledTimes(1)

      throttled('arg2')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1) // trailing call should not happen
    })

    it('should cancel pending calls', () => {
      const mockFn = vi.fn()
      const throttled = throttle(mockFn, 100)

      throttled('arg1')
      throttled('arg2')
      throttled.cancel()

      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1')
    })

    it('should flush pending calls', () => {
      const mockFn = vi.fn().mockReturnValue('result')
      const throttled = throttle(mockFn, 100)

      throttled('arg1')
      throttled('arg2')

      const result = throttled.flush()

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('arg2')
      expect(result).toBe('result')
    })

    it('should check pending status', () => {
      const mockFn = vi.fn()
      const throttled = throttle(mockFn, 100)

      expect(throttled.pending()).toBe(false)

      throttled('arg1')
      throttled('arg2')

      expect(throttled.pending()).toBe(true)

      vi.advanceTimersByTime(100)

      expect(throttled.pending()).toBe(false)
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 100)

      debounced('arg1')
      debounced('arg2')
      debounced('arg3')

      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })

    it('should support leading=true option', () => {
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 100, { leading: true })

      debounced('arg1')
      expect(mockFn).toHaveBeenCalledWith('arg1')

      debounced('arg2')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('arg2')
    })

    it('should support trailing=false option', () => {
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 100, { trailing: false, leading: true })

      debounced('arg1')
      expect(mockFn).toHaveBeenCalledTimes(1)

      debounced('arg2')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1) // trailing call should not happen
    })

    it('should support maxWait option', () => {
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 100, { maxWait: 200 })

      debounced('arg1')
      vi.advanceTimersByTime(50)

      debounced('arg2')
      vi.advanceTimersByTime(50)

      debounced('arg3')
      vi.advanceTimersByTime(50)

      debounced('arg4')
      vi.advanceTimersByTime(50) // 总共200ms，应该触发maxWait

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg4')
    })

    it('should cancel pending calls', () => {
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 100)

      debounced('arg1')
      debounced.cancel()

      vi.advanceTimersByTime(100)

      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should flush pending calls', () => {
      const mockFn = vi.fn().mockReturnValue('result')
      const debounced = debounce(mockFn, 100)

      debounced('arg1')
      const result = debounced.flush()

      expect(mockFn).toHaveBeenCalledWith('arg1')
      expect(result).toBe('result')
    })

    it('should check pending status', () => {
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 100)

      expect(debounced.pending()).toBe(false)

      debounced('arg1')
      expect(debounced.pending()).toBe(true)

      vi.advanceTimersByTime(100)
      expect(debounced.pending()).toBe(false)
    })
  })

  describe('rafThrottle', () => {
    beforeEach(() => {
      vi.useRealTimers() // RAF needs real timers
      // Mock requestAnimationFrame
      let rafId = 0
      const rafCallbacks = new Map()

      vi.stubGlobal('requestAnimationFrame', vi.fn((callback) => {
        const id = ++rafId
        rafCallbacks.set(id, callback)
        // 立即执行回调来模拟RAF
        setTimeout(() => {
          if (rafCallbacks.has(id)) {
            callback()
            rafCallbacks.delete(id)
          }
        }, 16)
        return id
      }))

      vi.stubGlobal('cancelAnimationFrame', vi.fn((id) => {
        rafCallbacks.delete(id)
      }))
    })

    it('should throttle using requestAnimationFrame', async () => {
      const mockFn = vi.fn()
      const throttled = rafThrottle(mockFn)

      throttled('arg1')
      throttled('arg2')
      throttled('arg3')

      expect(mockFn).not.toHaveBeenCalled()

      // 等待RAF执行
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })

    it('should cancel RAF calls', () => {
      const mockFn = vi.fn()
      const throttled = rafThrottle(mockFn)

      throttled('arg1')
      expect(throttled.pending()).toBe(true)

      throttled.cancel()
      expect(throttled.pending()).toBe(false)
      expect(cancelAnimationFrame).toHaveBeenCalled()
    })

    it('should flush RAF calls', async () => {
      const mockFn = vi.fn().mockReturnValue('result')
      const throttled = rafThrottle(mockFn)

      throttled('arg1')
      const result = throttled.flush()

      expect(mockFn).toHaveBeenCalledWith('arg1')
      expect(result).toBe('result')
      expect(cancelAnimationFrame).toHaveBeenCalled()
    })
  })

  describe('concurrent', () => {
    beforeEach(() => {
      vi.useRealTimers()
    })

    it('should limit concurrent executions', async () => {
      let running = 0
      let maxConcurrent = 0

      const mockFn = vi.fn(async (delay: number) => {
        running++
        maxConcurrent = Math.max(maxConcurrent, running)
        await new Promise(resolve => setTimeout(resolve, delay))
        running--
        return `result-${delay}`
      })

      const limited = concurrent(mockFn, 2)

      const promises = [
        limited(50),
        limited(30),
        limited(20),
        limited(40),
      ]

      const results = await Promise.all(promises)

      expect(maxConcurrent).toBe(2)
      expect(results).toEqual(['result-50', 'result-30', 'result-20', 'result-40'])
      expect(mockFn).toHaveBeenCalledTimes(4)
    })

    it('should handle errors in concurrent functions', async () => {
      const mockFn = vi.fn(async (shouldError: boolean) => {
        if (shouldError) {
          throw new Error('Test error')
        }
        return 'success'
      })

      const limited = concurrent(mockFn, 1)

      const results = await Promise.allSettled([
        limited(false),
        limited(true),
        limited(false),
      ])

      expect(results[0].status).toBe('fulfilled')
      expect(results[1].status).toBe('rejected')
      expect(results[2].status).toBe('fulfilled')
    })

    it('should preserve function context', async () => {
      const obj = {
        value: 'test',
        async method(this: any) {
          return this.value
        },
      }

      const limited = concurrent(obj.method, 1)
      const result = await limited.call(obj)

      expect(result).toBe('test')
    })
  })
})
