/**
 * 性能工具函数测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  PerformanceTimer,
  MemoryMonitor,
  RenderOptimizer,
  CacheManager,
  EventOptimizer,
  performanceTimer,
  cacheManager,
  nextFrame,
  batchDOMUpdates,
  debounceEvent,
  throttleEvent,
} from '../performance'

describe('PerformanceTimer', () => {
  let timer: PerformanceTimer

  beforeEach(() => {
    timer = new PerformanceTimer()
  })

  afterEach(() => {
    timer.clear()
  })

  it('should start and end timer correctly', () => {
    timer.start('test')
    
    // 模拟一些耗时操作
    const start = performance.now()
    while (performance.now() - start < 10) {
      // 等待10ms
    }
    
    const duration = timer.end('test')
    expect(duration).toBeGreaterThan(0)
    expect(duration).toBeGreaterThanOrEqual(10)
  })

  it('should handle non-existent timer', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const duration = timer.end('non-existent')
    
    expect(duration).toBe(0)
    expect(consoleSpy).toHaveBeenCalledWith('Timer "non-existent" not found')
    
    consoleSpy.mockRestore()
  })

  it('should mark and measure correctly', () => {
    timer.mark('start')
    
    // 模拟一些耗时操作
    const start = performance.now()
    while (performance.now() - start < 5) {
      // 等待5ms
    }
    
    timer.mark('end')
    const duration = timer.measure('start', 'end')
    
    expect(duration).toBeGreaterThan(0)
    expect(duration).toBeGreaterThanOrEqual(5)
  })

  it('should handle non-existent marks', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const duration = timer.measure('non-existent-start', 'non-existent-end')
    
    expect(duration).toBe(0)
    expect(consoleSpy).toHaveBeenCalledWith('Mark "non-existent-start" or "non-existent-end" not found')
    
    consoleSpy.mockRestore()
  })

  it('should clear all timers and marks', () => {
    timer.start('timer1')
    timer.mark('mark1')
    
    timer.clear()
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    timer.end('timer1')
    timer.measure('mark1', 'mark2')
    
    expect(consoleSpy).toHaveBeenCalledTimes(2)
    consoleSpy.mockRestore()
  })
})

describe('MemoryMonitor', () => {
  it('should format memory size correctly', () => {
    expect(MemoryMonitor.formatMemorySize(1024)).toBe('1.00 KB')
    expect(MemoryMonitor.formatMemorySize(1048576)).toBe('1.00 MB')
    expect(MemoryMonitor.formatMemorySize(1073741824)).toBe('1.00 GB')
    expect(MemoryMonitor.formatMemorySize(500)).toBe('500.00 B')
  })

  it('should monitor memory usage', () => {
    const callback = vi.fn()
    const stopMonitoring = MemoryMonitor.monitor(100, callback)
    
    // 停止监控
    stopMonitoring()
    
    expect(typeof stopMonitoring).toBe('function')
  })
})

describe('RenderOptimizer', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16)
      return 1
    })
  })

  it('should execute callback in next frame', (done) => {
    const callback = vi.fn()
    
    RenderOptimizer.nextFrame(callback)
    
    setTimeout(() => {
      expect(callback).toHaveBeenCalled()
      done()
    }, 20)
  })

  it('should batch DOM updates', (done) => {
    const update1 = vi.fn()
    const update2 = vi.fn()
    const updates = [update1, update2]
    
    RenderOptimizer.batchDOMUpdates(updates)
    
    setTimeout(() => {
      expect(update1).toHaveBeenCalled()
      expect(update2).toHaveBeenCalled()
      done()
    }, 20)
  })

  it('should handle errors in DOM updates', (done) => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const errorUpdate = vi.fn(() => {
      throw new Error('Test error')
    })
    const normalUpdate = vi.fn()
    
    RenderOptimizer.batchDOMUpdates([errorUpdate, normalUpdate])
    
    setTimeout(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(normalUpdate).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
      done()
    }, 20)
  })
})

describe('CacheManager', () => {
  let cache: CacheManager<string>

  beforeEach(() => {
    cache = new CacheManager<string>(3, 1000) // 最大3项，TTL 1秒
  })

  it('should set and get cache correctly', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should return null for non-existent key', () => {
    expect(cache.get('non-existent')).toBeNull()
  })

  it('should respect TTL', (done) => {
    cache.set('key1', 'value1', 50) // 50ms TTL
    
    setTimeout(() => {
      expect(cache.get('key1')).toBeNull()
      done()
    }, 60)
  })

  it('should evict oldest item when max size reached', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')
    cache.set('key4', 'value4') // 应该驱逐key1
    
    expect(cache.get('key1')).toBeNull()
    expect(cache.get('key2')).toBe('value2')
    expect(cache.get('key3')).toBe('value3')
    expect(cache.get('key4')).toBe('value4')
  })

  it('should delete cache correctly', () => {
    cache.set('key1', 'value1')
    expect(cache.delete('key1')).toBe(true)
    expect(cache.get('key1')).toBeNull()
    expect(cache.delete('non-existent')).toBe(false)
  })

  it('should clear all cache', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    
    cache.clear()
    
    expect(cache.size()).toBe(0)
    expect(cache.get('key1')).toBeNull()
    expect(cache.get('key2')).toBeNull()
  })

  it('should cleanup expired items', (done) => {
    cache.set('key1', 'value1', 50) // 50ms TTL
    cache.set('key2', 'value2', 1000) // 1s TTL
    
    setTimeout(() => {
      cache.cleanup()
      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBe('value2')
      done()
    }, 60)
  })
})

describe('EventOptimizer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce events correctly', () => {
    const handler = vi.fn()
    const debouncedHandler = EventOptimizer.debounce(handler, 100)
    
    // 快速触发多次
    debouncedHandler({} as Event)
    debouncedHandler({} as Event)
    debouncedHandler({} as Event)
    
    expect(handler).not.toHaveBeenCalled()
    
    // 等待延迟时间
    vi.advanceTimersByTime(100)
    
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should throttle events correctly', () => {
    const handler = vi.fn()
    const throttledHandler = EventOptimizer.throttle(handler, 100)
    
    // 快速触发多次
    throttledHandler({} as Event)
    throttledHandler({} as Event)
    throttledHandler({} as Event)
    
    expect(handler).toHaveBeenCalledTimes(1)
    
    // 等待延迟时间后再次触发
    vi.advanceTimersByTime(100)
    throttledHandler({} as Event)
    
    expect(handler).toHaveBeenCalledTimes(2)
  })
})

describe('Global instances and functions', () => {
  it('should export global performance timer', () => {
    expect(performanceTimer).toBeInstanceOf(PerformanceTimer)
  })

  it('should export global cache manager', () => {
    expect(cacheManager).toBeInstanceOf(CacheManager)
  })

  it('should export convenience functions', () => {
    expect(typeof nextFrame).toBe('function')
    expect(typeof batchDOMUpdates).toBe('function')
    expect(typeof debounceEvent).toBe('function')
    expect(typeof throttleEvent).toBe('function')
  })
})
