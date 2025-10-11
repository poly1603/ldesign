import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  CacheAnalyzer,
  AdaptiveCache,
  CacheWarmer,
  MultiLevelCache,
} from '../utils/advanced-cache'
import { LRUCache } from '../utils/cache'

describe('CacheAnalyzer', () => {
  let cache: LRUCache
  let analyzer: CacheAnalyzer

  beforeEach(() => {
    cache = new LRUCache(100)
    analyzer = new CacheAnalyzer(cache)
  })

  it('should track cache hits and misses', () => {
    analyzer.recordHit('key1')
    analyzer.recordHit('key2')
    analyzer.recordMiss('key3')

    const stats = analyzer.getStats()
    expect(stats.hits).toBe(2)
    expect(stats.misses).toBe(1)
    expect(stats.operations).toBe(3)
    expect(stats.hitRate).toBeCloseTo(2 / 3)
  })

  it('should identify hot keys', () => {
    analyzer.recordHit('key1')
    analyzer.recordHit('key1')
    analyzer.recordHit('key1')
    analyzer.recordHit('key2')
    analyzer.recordHit('key3')

    const hotKeys = analyzer.getHotKeys(2)
    expect(hotKeys).toEqual(['key1', 'key2'])
  })

  it('should get access frequency', () => {
    analyzer.recordHit('key1')
    analyzer.recordHit('key1')
    analyzer.recordMiss('key1')

    expect(analyzer.getAccessFrequency('key1')).toBe(3)
    expect(analyzer.getAccessFrequency('key2')).toBe(0)
  })

  it('should reset statistics', () => {
    analyzer.recordHit('key1')
    analyzer.recordMiss('key2')

    analyzer.reset()

    const stats = analyzer.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(0)
    expect(stats.operations).toBe(0)
  })
})

describe('AdaptiveCache', () => {
  let cache: AdaptiveCache

  beforeEach(() => {
    cache = new AdaptiveCache(100, 50, 200, 0.8)
  })

  it('should set and get values', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should track statistics', () => {
    cache.set('key1', 'value1')
    cache.get('key1') // hit
    cache.get('key2') // miss

    const stats = cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBe(0.5)
  })

  it('should identify hot keys', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    
    cache.get('key1')
    cache.get('key1')
    cache.get('key2')

    const hotKeys = cache.getHotKeys(2)
    expect(hotKeys).toContain('key1')
  })

  it('should support has, delete, and clear', () => {
    cache.set('key1', 'value1')
    expect(cache.has('key1')).toBe(true)

    cache.delete('key1')
    expect(cache.has('key1')).toBe(false)

    cache.set('key2', 'value2')
    cache.clear()
    expect(cache.has('key2')).toBe(false)
  })
})

describe('CacheWarmer', () => {
  let cache: LRUCache
  let warmer: CacheWarmer

  beforeEach(() => {
    cache = new LRUCache(100)
    warmer = new CacheWarmer(cache)
  })

  it('should register and execute warmup tasks', async () => {
    warmer.register('key1', () => Promise.resolve('value1'))
    warmer.register('key2', () => Promise.resolve('value2'))

    await warmer.warmup()

    expect(cache.get('key1')).toBe('value1')
    expect(cache.get('key2')).toBe('value2')
  })

  it('should warmup specific keys', async () => {
    warmer.register('key1', () => Promise.resolve('value1'))
    warmer.register('key2', () => Promise.resolve('value2'))

    await warmer.warmup(['key1'])

    expect(cache.get('key1')).toBe('value1')
    expect(cache.get('key2')).toBeUndefined()
  })

  it('should handle warmup errors gracefully', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    warmer.register('key1', () => Promise.reject(new Error('Failed')))
    warmer.register('key2', () => Promise.resolve('value2'))

    await warmer.warmup()

    expect(cache.get('key1')).toBeUndefined()
    expect(cache.get('key2')).toBe('value2')
    expect(consoleWarnSpy).toHaveBeenCalled()
    
    consoleWarnSpy.mockRestore()
  })

  it('should support concurrent warmup with limit', async () => {
    let concurrentCount = 0
    let maxConcurrent = 0

    const createTask = (delay: number) => async () => {
      concurrentCount++
      maxConcurrent = Math.max(maxConcurrent, concurrentCount)
      await new Promise(resolve => setTimeout(resolve, delay))
      concurrentCount--
      return 'value'
    }

    warmer.register('key1', createTask(50))
    warmer.register('key2', createTask(50))
    warmer.register('key3', createTask(50))
    warmer.register('key4', createTask(50))
    warmer.register('key5', createTask(50))

    await warmer.warmupConcurrent(undefined, 2)

    expect(maxConcurrent).toBeLessThanOrEqual(2)
  })

  it('should clear registered tasks', () => {
    warmer.register('key1', () => Promise.resolve('value1'))
    warmer.clear()

    // After clear, warmup should do nothing
    warmer.warmup().then(() => {
      expect(cache.get('key1')).toBeUndefined()
    })
  })
})

describe('MultiLevelCache', () => {
  let cache: MultiLevelCache
  let mockStorage: Storage

  beforeEach(() => {
    const store: Record<string, string> = {}
    mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { Object.keys(store).forEach(key => delete store[key]) },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    }

    cache = new MultiLevelCache(100, 5000, mockStorage, 'test:')
  })

  it('should write to both L1 and L2', () => {
    cache.set('key1', 'value1')

    // Check L1
    expect(cache.get('key1')).toBe('value1')

    // Check L2
    const stored = mockStorage.getItem('test:key1')
    expect(stored).toBe('"value1"')
  })

  it('should read from L1 first', () => {
    cache.set('key1', 'value1')
    
    // L1 should have it
    expect(cache.get('key1')).toBe('value1')
  })

  it('should fallback to L2 when L1 misses', () => {
    // Write to L2 directly
    mockStorage.setItem('test:key2', '"value2"')

    // Should find it in L2 and promote to L1
    expect(cache.get('key2')).toBe('value2')

    // Now it should be in L1
    expect(cache.get('key2')).toBe('value2')
  })

  it('should check existence in both levels', () => {
    cache.set('key1', 'value1')
    mockStorage.setItem('test:key2', '"value2"')

    expect(cache.has('key1')).toBe(true)
    expect(cache.has('key2')).toBe(true)
    expect(cache.has('key3')).toBe(false)
  })

  it('should delete from both levels', () => {
    cache.set('key1', 'value1')

    cache.delete('key1')

    expect(cache.has('key1')).toBe(false)
    expect(mockStorage.getItem('test:key1')).toBeNull()
  })

  it('should clear both levels', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    mockStorage.setItem('test:key3', '"value3"')

    cache.clear()

    expect(cache.has('key1')).toBe(false)
    expect(cache.has('key2')).toBe(false)
    expect(mockStorage.getItem('test:key3')).toBeNull()
  })

  it('should handle L2 storage errors gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    const faultyStorage = {
      ...mockStorage,
      setItem: () => { throw new Error('Storage full') },
    }

    const faultyCache = new MultiLevelCache(100, 5000, faultyStorage, 'test:')

    // Should not throw
    expect(() => faultyCache.set('key1', 'value1')).not.toThrow()
    expect(consoleWarnSpy).toHaveBeenCalled()

    consoleWarnSpy.mockRestore()
  })
})
