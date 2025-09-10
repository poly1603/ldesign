import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CacheManager,
  PersistenceManager,
  DebounceManager,
  ThrottleManager,
  PerformanceOptimizer,
} from '../core/PerformanceOptimizer'

describe('cacheManager', () => {
  let cacheManager: CacheManager

  beforeEach(() => {
    cacheManager = new CacheManager(3, 1000) // maxSize: 3, defaultTTL: 1000ms
  })

  it('should set and get cache values', () => {
    cacheManager.set('key1', 'value1')
    expect(cacheManager.get('key1')).toBe('value1')
  })

  it('should return undefined for non-existent keys', () => {
    expect(cacheManager.get('nonexistent')).toBeUndefined()
  })

  it('should respect TTL', async () => {
    cacheManager.set('key1', 'value1', 100) // 100ms TTL
    expect(cacheManager.get('key1')).toBe('value1')

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(cacheManager.get('key1')).toBeUndefined()
  })

  it('should evict oldest item when max size is reached', () => {
    cacheManager.set('key1', 'value1')
    cacheManager.set('key2', 'value2')
    cacheManager.set('key3', 'value3')
    cacheManager.set('key4', 'value4') // Should evict key1

    expect(cacheManager.get('key1')).toBeUndefined()
    expect(cacheManager.get('key2')).toBe('value2')
    expect(cacheManager.get('key3')).toBe('value3')
    expect(cacheManager.get('key4')).toBe('value4')
  })

  it('should delete cache entries', () => {
    cacheManager.set('key1', 'value1')
    expect(cacheManager.delete('key1')).toBe(true)
    expect(cacheManager.get('key1')).toBeUndefined()
    expect(cacheManager.delete('nonexistent')).toBe(false)
  })

  it('should clear all cache entries', () => {
    cacheManager.set('key1', 'value1')
    cacheManager.set('key2', 'value2')
    cacheManager.clear()
    expect(cacheManager.size()).toBe(0)
    expect(cacheManager.get('key1')).toBeUndefined()
    expect(cacheManager.get('key2')).toBeUndefined()
  })

  it('should cleanup expired entries', async () => {
    cacheManager.set('key1', 'value1', 100) // 100ms TTL
    cacheManager.set('key2', 'value2', 1000) // 1000ms TTL

    await new Promise(resolve => setTimeout(resolve, 150))
    cacheManager.cleanup()

    expect(cacheManager.get('key1')).toBeUndefined()
    expect(cacheManager.get('key2')).toBe('value2')
  })
})

describe('persistenceManager', () => {
  let persistenceManager: PersistenceManager
  let mockStorage: Storage

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }
    persistenceManager = new PersistenceManager({ storage: mockStorage })
  })

  it('should save and load state', () => {
    const state = { count: 1, name: 'test' }
    vi.mocked(mockStorage.getItem).mockReturnValue(JSON.stringify(state))

    persistenceManager.save('test-key', state)
    const loaded = persistenceManager.load('test-key')

    expect(mockStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(state))
    expect(loaded).toEqual(state)
  })

  it('should save only specified paths', () => {
    const state = { count: 1, name: 'test', other: 'value' }
    persistenceManager.save('test-key', state, ['count', 'name'])

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify({ count: 1, name: 'test' })
    )
  })

  it('should return null for non-existent keys', () => {
    vi.mocked(mockStorage.getItem).mockReturnValue(null)
    expect(persistenceManager.load('nonexistent')).toBeNull()
  })

  it('should handle serialization errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.mocked(mockStorage.setItem).mockImplementation(() => {
      throw new Error('Storage error')
    })

    persistenceManager.save('test-key', { test: 'value' })
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should handle deserialization errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.mocked(mockStorage.getItem).mockReturnValue('invalid json')

    const result = persistenceManager.load('test-key')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should remove persisted state', () => {
    persistenceManager.remove('test-key')
    expect(mockStorage.removeItem).toHaveBeenCalledWith('test-key')
  })

  it('should clear all persisted state', () => {
    persistenceManager.clear()
    expect(mockStorage.clear).toHaveBeenCalled()
  })
})

describe('debounceManager', () => {
  let debounceManager: DebounceManager

  beforeEach(() => {
    debounceManager = new DebounceManager()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce function calls', async () => {
    const mockFn = vi.fn().mockResolvedValue('result')
    const debouncedFn = debounceManager.debounce('test', mockFn, 100)

    debouncedFn('arg1')
    debouncedFn('arg2')
    debouncedFn('arg3')

    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('arg3')
  })

  it('should cancel debounced calls', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounceManager.debounce('test', mockFn, 100)

    debouncedFn('arg1')
    debounceManager.cancel('test')

    vi.advanceTimersByTime(100)
    expect(mockFn).not.toHaveBeenCalled()
  })

  it('should clear all debounced calls', () => {
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()

    debounceManager.debounce('test1', mockFn1, 100)('arg1')
    debounceManager.debounce('test2', mockFn2, 100)('arg2')

    debounceManager.clear()

    vi.advanceTimersByTime(100)
    expect(mockFn1).not.toHaveBeenCalled()
    expect(mockFn2).not.toHaveBeenCalled()
  })
})

describe('throttleManager', () => {
  let throttleManager: ThrottleManager

  beforeEach(() => {
    throttleManager = new ThrottleManager()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should throttle function calls', () => {
    const mockFn = vi.fn().mockReturnValue('result')
    const throttledFn = throttleManager.throttle('test', mockFn, 100)

    const result1 = throttledFn('arg1')
    const result2 = throttledFn('arg2')
    const result3 = throttledFn('arg3')

    expect(result1).toBe('result')
    expect(result2).toBeUndefined()
    expect(result3).toBeUndefined()
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('arg1')
  })

  it('should allow calls after delay', () => {
    const mockFn = vi.fn().mockReturnValue('result')
    const throttledFn = throttleManager.throttle('test', mockFn, 100)

    throttledFn('arg1')
    vi.advanceTimersByTime(100)
    throttledFn('arg2')

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenNthCalledWith(1, 'arg1')
    expect(mockFn).toHaveBeenNthCalledWith(2, 'arg2')
  })

  it('should reset throttle state', () => {
    const mockFn = vi.fn().mockReturnValue('result')
    const throttledFn = throttleManager.throttle('test', mockFn, 100)

    throttledFn('arg1')
    throttleManager.reset('test')
    throttledFn('arg2')

    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should clear all throttle states', () => {
    const mockFn = vi.fn().mockReturnValue('result')

    throttleManager.throttle('test1', mockFn, 100)('arg1')
    throttleManager.throttle('test2', mockFn, 100)('arg2')

    throttleManager.clear()

    throttleManager.throttle('test1', mockFn, 100)('arg3')
    throttleManager.throttle('test2', mockFn, 100)('arg4')

    expect(mockFn).toHaveBeenCalledTimes(4)
  })
})

describe('performanceOptimizer', () => {
  let optimizer: PerformanceOptimizer

  beforeEach(() => {
    optimizer = new PerformanceOptimizer()
  })

  it('should initialize all managers', () => {
    expect(optimizer.cache).toBeInstanceOf(CacheManager)
    expect(optimizer.persistence).toBeInstanceOf(PersistenceManager)
    expect(optimizer.debounce).toBeInstanceOf(DebounceManager)
    expect(optimizer.throttle).toBeInstanceOf(ThrottleManager)
  })

  it('should dispose all resources', () => {
    const cacheSpy = vi.spyOn(optimizer.cache, 'clear')
    const debounceSpy = vi.spyOn(optimizer.debounce, 'clear')
    const throttleSpy = vi.spyOn(optimizer.throttle, 'clear')

    optimizer.dispose()

    expect(cacheSpy).toHaveBeenCalled()
    expect(debounceSpy).toHaveBeenCalled()
    expect(throttleSpy).toHaveBeenCalled()
  })
})
