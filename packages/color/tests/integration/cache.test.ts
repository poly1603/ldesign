import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SmartCache } from '../../src/cache/smart-cache'

describe('smartCache Integration Tests', () => {
  let cache: SmartCache

  beforeEach(async () => {
    cache = new SmartCache({
      dbName: 'test-cache',
      maxSize: 1024 * 1024, // 1MB
      ttl: 3600000, // 1 hour
      compression: true,
      encryption: false,
    })
    await cache.initialize()
  })

  afterEach(async () => {
    await cache.clear()
  })

  it('should store and retrieve values with LRU strategy', async () => {
    await cache.set('key1', { color: '#FF0000' }, 'lru')
    await cache.set('key2', { color: '#00FF00' }, 'lru')
    await cache.set('key3', { color: '#0000FF' }, 'lru')

    const value1 = await cache.get('key1')
    expect(value1).toEqual({ color: '#FF0000' })

    const value2 = await cache.get('key2')
    expect(value2).toEqual({ color: '#00FF00' })

    const value3 = await cache.get('key3')
    expect(value3).toEqual({ color: '#0000FF' })
  })

  it('should handle LFU caching strategy', async () => {
    await cache.set('freq1', { count: 1 }, 'lfu')
    await cache.set('freq2', { count: 2 }, 'lfu')

    // Access freq1 multiple times to increase frequency
    await cache.get('freq1')
    await cache.get('freq1')
    await cache.get('freq1')

    const stats = await cache.getStats()
    expect(stats.totalSets).toBeGreaterThan(0)
    expect(stats.totalGets).toBeGreaterThan(0)
  })

  it('should respect TTL and expire entries', async () => {
    const shortTTL = 100 // 100ms
    await cache.set('expire-test', { temp: true }, 'ttl', shortTTL)

    const immediate = await cache.get('expire-test')
    expect(immediate).toEqual({ temp: true })

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150))

    const expired = await cache.get('expire-test')
    expect(expired).toBeNull()
  })

  it('should handle compression when enabled', async () => {
    const largeData = {
      colors: Array.from({ length: 1000 }).fill(null).map((_, i) => ({
        id: i,
        hex: `#${i.toString(16).padStart(6, '0')}`,
        rgb: [i % 256, (i * 2) % 256, (i * 3) % 256],
      })),
    }

    await cache.set('compressed', largeData, 'lru')
    const retrieved = await cache.get('compressed')

    expect(retrieved).toEqual(largeData)
  })

  it('should handle batch operations', async () => {
    const batchData = [
      { key: 'batch1', value: { color: '#111111' } },
      { key: 'batch2', value: { color: '#222222' } },
      { key: 'batch3', value: { color: '#333333' } },
    ]

    // Batch set
    await Promise.all(
      batchData.map(item => cache.set(item.key, item.value, 'lru')),
    )

    // Batch get
    const results = await Promise.all(
      batchData.map(item => cache.get(item.key)),
    )

    expect(results).toEqual(batchData.map(item => item.value))
  })

  it('should provide accurate statistics', async () => {
    await cache.set('stat1', { test: 1 }, 'lru')
    await cache.set('stat2', { test: 2 }, 'lru')

    await cache.get('stat1')
    await cache.get('stat1')
    await cache.get('stat2')
    await cache.get('nonexistent')

    const stats = await cache.getStats()

    expect(stats.totalSets).toBe(2)
    expect(stats.totalGets).toBe(4)
    expect(stats.hits).toBe(3)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(0.75, 2)
  })

  it('should handle cache invalidation patterns', async () => {
    // Set related keys
    await cache.set('user:1:profile', { name: 'Alice' }, 'lru')
    await cache.set('user:1:settings', { theme: 'dark' }, 'lru')
    await cache.set('user:2:profile', { name: 'Bob' }, 'lru')

    // Invalidate by pattern (manual implementation)
    const keys = ['user:1:profile', 'user:1:settings', 'user:2:profile']
    const user1Keys = keys.filter(k => k.startsWith('user:1:'))

    await Promise.all(user1Keys.map(k => cache.delete(k)))

    // Check invalidation
    expect(await cache.get('user:1:profile')).toBeNull()
    expect(await cache.get('user:1:settings')).toBeNull()
    expect(await cache.get('user:2:profile')).toEqual({ name: 'Bob' })
  })

  it('should handle concurrent operations', async () => {
    const operations = Array.from({ length: 100 }).fill(null).map((_, i) => ({
      key: `concurrent-${i}`,
      value: { index: i },
    }))

    // Concurrent writes
    await Promise.all(
      operations.map(op => cache.set(op.key, op.value, 'lru')),
    )

    // Concurrent reads
    const results = await Promise.all(
      operations.map(op => cache.get(op.key)),
    )

    results.forEach((result, i) => {
      expect(result).toEqual({ index: i })
    })
  })
})
