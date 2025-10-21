/**
 * 缓存管理器性能基准测试
 */

import { bench, describe } from 'vitest'
import { createCacheManager } from '../../src/cache/cache-manager'

describe('Cache Manager Benchmarks', () => {
  bench('缓存设置（小缓存 - 无分片）', () => {
    const cache = createCacheManager({ maxSize: 50 })
    for (let i = 0; i < 50; i++) {
      cache.set(`key${i}`, { data: `value${i}` })
    }
    cache.destroy()
  })

  bench('缓存设置（大缓存 - 启用分片）', () => {
    const cache = createCacheManager({ maxSize: 500 })
    for (let i = 0; i < 500; i++) {
      cache.set(`key${i}`, { data: `value${i}` })
    }
    cache.destroy()
  })

  bench('缓存获取（命中）', async () => {
    const cache = createCacheManager({ maxSize: 100 })
    for (let i = 0; i < 100; i++) {
      await cache.set(`key${i}`, { data: `value${i}` })
    }
    for (let i = 0; i < 100; i++) {
      await cache.get(`key${i}`)
    }
    cache.destroy()
  })

  bench('缓存获取（未命中）', async () => {
    const cache = createCacheManager({ maxSize: 100 })
    for (let i = 0; i < 100; i++) {
      await cache.get(`nonexistent${i}`)
    }
    cache.destroy()
  })

  bench('LRU淘汰策略', async () => {
    const cache = createCacheManager({
      maxSize: 50,
      strategy: 'lru'
    })
    for (let i = 0; i < 100; i++) {
      await cache.set(`key${i}`, { data: `value${i}` })
    }
    cache.destroy()
  })

  bench('命名空间缓存操作', async () => {
    const cache = createCacheManager({ maxSize: 100 })
    const userCache = cache.namespace('users')
    for (let i = 0; i < 50; i++) {
      await userCache.set(`${i}`, { id: i, name: `User ${i}` })
    }
    await userCache.clear()
    cache.destroy()
  })

  bench('缓存大小估算（复杂对象）', () => {
    const cache = createCacheManager({ maxSize: 50 })
    const complexObject = {
      arrays: Array.from({ length: 100 }, (_, i) => i),
      nested: {
        level1: {
          level2: {
            level3: Array.from({ length: 50 }, (_, i) => ({ id: i }))
          }
        }
      }
    }
    cache.set('complex', complexObject)
    cache.destroy()
  })
})




