/**
 * 缓存管理系统单元测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CacheManager,
  cacheResult,
  createCache,
  createObjectPool,
  LRUCache,
  MemoryMonitor,
  ObjectPool,
} from '../../src/utils/cache-manager'

describe('lRUCache', () => {
  let cache: LRUCache<any>

  beforeEach(() => {
    cache = new LRUCache({ maxSize: 3, enableStats: true })
  })

  afterEach(() => {
    cache.destroy()
  })

  it('应该能设置和获取缓存', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('应该在缓存满时淘汰最少使用的条目', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')

    // 访问 key1，使其成为最近使用的
    cache.get('key1')

    // 添加 key4，应该淘汰 key2
    cache.set('key4', 'value4')

    expect(cache.has('key1')).toBe(true)
    expect(cache.has('key2')).toBe(false)
    expect(cache.has('key3')).toBe(true)
    expect(cache.has('key4')).toBe(true)
  })

  it('应该支持TTL过期', async () => {
    cache.set('key1', 'value1', 100) // 100ms后过期

    expect(cache.get('key1')).toBe('value1')

    // 等待过期
    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(cache.get('key1')).toBeUndefined()
  })

  it('应该正确删除缓存', () => {
    cache.set('key1', 'value1')
    expect(cache.has('key1')).toBe(true)

    cache.delete('key1')
    expect(cache.has('key1')).toBe(false)
  })

  it('应该正确清空所有缓存', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    expect(cache.size).toBe(2)

    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('应该收集正确的统计信息', () => {
    cache.set('key1', 'value1')

    // 命中
    cache.get('key1')
    cache.get('key1')

    // 未命中
    cache.get('key2')

    const stats = cache.getStats()
    expect(stats.hits).toBe(2)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(0.667, 2)
    expect(stats.size).toBe(1)
  })

  it('应该返回所有键', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')

    const keys = cache.keys()
    expect(keys).toContain('key1')
    expect(keys).toContain('key2')
    expect(keys.length).toBe(2)
  })

  it('应该清理过期条目', async () => {
    cache.set('key1', 'value1', 50)
    cache.set('key2', 'value2', 1000)

    await new Promise((resolve) => setTimeout(resolve, 100))

    const cleaned = cache.cleanup()
    expect(cleaned).toBe(1)
    expect(cache.has('key1')).toBe(false)
    expect(cache.has('key2')).toBe(true)
  })

  it('应该调用淘汰回调', () => {
    const onEvict = vi.fn()
    const smallCache = new LRUCache({ maxSize: 2, onEvict })

    smallCache.set('key1', 'value1')
    smallCache.set('key2', 'value2')
    smallCache.set('key3', 'value3') // 触发淘汰

    expect(onEvict).toHaveBeenCalledWith('key1', 'value1')
    smallCache.destroy()
  })

  it('应该遵守内存限制', () => {
    const memCache = new LRUCache({
      maxSize: 100,
      maxMemory: 1000, // 1KB限制
    })

    // 添加大对象
    const largeValue = { data: 'x'.repeat(500) }
    memCache.set('key1', largeValue)
    memCache.set('key2', largeValue)

    const stats = memCache.getStats()
    expect(stats.memoryUsage).toBeLessThanOrEqual(1000)

    memCache.destroy()
  })

  it('应该正确更新访问顺序', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')

    // 访问 key1
    cache.get('key1')

    // 添加 key4，应该淘汰 key2
    cache.set('key4', 'value4')

    expect(cache.has('key2')).toBe(false)
  })
})

describe('objectPool', () => {
  interface Point {
    x: number
    y: number
  }

  let pool: ObjectPool<Point>

  beforeEach(() => {
    pool = new ObjectPool<Point>({
      factory: () => ({ x: 0, y: 0 }),
      reset: (point) => {
        point.x = 0
        point.y = 0
      },
      initialSize: 5,
      maxSize: 10,
    })
  })

  afterEach(() => {
    pool.clear()
  })

  it('应该预创建初始对象', () => {
    const stats = pool.getStats()
    expect(stats.created).toBe(5)
    expect(stats.poolSize).toBe(5)
  })

  it('应该从池中获取对象', () => {
    const point = pool.acquire()
    expect(point).toBeDefined()
    expect(point.x).toBe(0)
    expect(point.y).toBe(0)
  })

  it('应该归还对象到池中', () => {
    const point = pool.acquire()
    point.x = 100
    point.y = 200

    pool.release(point)

    const stats = pool.getStats()
    expect(stats.released).toBe(1)

    // 再次获取应该得到被重置的对象
    const point2 = pool.acquire()
    expect(point2.x).toBe(0)
    expect(point2.y).toBe(0)
  })

  it('应该在池为空时创建新对象', () => {
    // 获取所有初始对象
    const points: Point[] = []
    for (let i = 0; i < 5; i++) {
      points.push(pool.acquire())
    }

    // 再获取一个，应该创建新对象
    const newPoint = pool.acquire()
    expect(newPoint).toBeDefined()

    const stats = pool.getStats()
    expect(stats.created).toBe(6)
  })

  it('应该批量归还对象', () => {
    const points = [pool.acquire(), pool.acquire(), pool.acquire()]

    pool.releaseAll(points)

    const stats = pool.getStats()
    expect(stats.released).toBe(3)
  })

  it('应该计算正确的重用率', () => {
    const point1 = pool.acquire()
    pool.release(point1)

    const point2 = pool.acquire() // 重用
    const point3 = pool.acquire() // 重用

    const stats = pool.getStats()
    expect(stats.reused).toBe(2)
    expect(stats.reuseRate).toBeGreaterThan(0)
  })

  it('应该遵守最大池大小限制', () => {
    const points: Point[] = []

    // 获取并归还超过最大大小的对象
    for (let i = 0; i < 15; i++) {
      const point = pool.acquire()
      points.push(point)
    }

    pool.releaseAll(points)

    const stats = pool.getStats()
    expect(stats.poolSize).toBeLessThanOrEqual(10)
  })

  it('应该使用验证函数', () => {
    const validatingPool = new ObjectPool<Point>({
      factory: () => ({ x: 0, y: 0 }),
      validate: (point) => point.x === 0 && point.y === 0,
      initialSize: 2,
    })

    const point = validatingPool.acquire()
    point.x = 999 // 使对象无效
    validatingPool.release(point)

    // 下次获取应该跳过无效对象
    const newPoint = validatingPool.acquire()
    expect(newPoint.x).toBe(0)

    validatingPool.clear()
  })

  it('应该正确清空池', () => {
    pool.clear()
    const stats = pool.getStats()
    expect(stats.poolSize).toBe(0)
  })
})

describe('memoryMonitor', () => {
  let monitor: MemoryMonitor

  afterEach(() => {
    if (monitor) {
      monitor.destroy()
    }
  })

  it('应该获取内存使用情况', () => {
    monitor = new MemoryMonitor()
    const usage = monitor.getUsage()

    expect(usage).toHaveProperty('used')
    expect(usage).toHaveProperty('total')
    expect(usage).toHaveProperty('percentage')
    expect(usage).toHaveProperty('heapUsed')
    expect(usage).toHaveProperty('heapTotal')
  })

  it('应该记录内存使用历史', async () => {
    monitor = new MemoryMonitor({ checkInterval: 50 })

    await new Promise((resolve) => setTimeout(resolve, 200))

    const history = monitor.getHistory()
    expect(history.length).toBeGreaterThan(0)
  })

  it('应该计算平均内存使用', async () => {
    monitor = new MemoryMonitor({ checkInterval: 50 })

    await new Promise((resolve) => setTimeout(resolve, 200))

    const average = monitor.getAverageUsage()
    expect(average).toBeGreaterThanOrEqual(0)
    expect(average).toBeLessThanOrEqual(1)
  })

  it('应该在超过阈值时调用回调', async () => {
    const onThresholdExceeded = vi.fn()

    monitor = new MemoryMonitor({
      checkInterval: 50,
      threshold: 0, // 设置为0以确保触发
      onThresholdExceeded,
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(onThresholdExceeded).toHaveBeenCalled()
  })

  it('应该能启动和停止监控', () => {
    monitor = new MemoryMonitor({ checkInterval: 1000 })

    monitor.stop()
    const historyAfterStop = monitor.getHistory()

    monitor.start()
    expect(monitor).toBeDefined()
  })

  it('应该尝试强制垃圾回收', () => {
    monitor = new MemoryMonitor()
    const result = monitor.forceGC()

    // 结果取决于环境
    expect(typeof result).toBe('boolean')
  })
})

describe('cacheManager', () => {
  let manager: CacheManager

  beforeEach(() => {
    manager = CacheManager.getInstance()
  })

  afterEach(() => {
    manager.clearAll()
  })

  it('应该是单例', () => {
    const manager1 = CacheManager.getInstance()
    const manager2 = CacheManager.getInstance()
    expect(manager1).toBe(manager2)
  })

  it('应该创建和获取缓存', () => {
    const cache1 = manager.getCache('test')
    const cache2 = manager.getCache('test')

    expect(cache1).toBe(cache2)
  })

  it('应该删除缓存', () => {
    const cache = manager.getCache('test')
    cache.set('key', 'value')

    const removed = manager.removeCache('test')
    expect(removed).toBe(true)

    // 获取新缓存应该是空的
    const newCache = manager.getCache('test')
    expect(newCache.has('key')).toBe(false)
  })

  it('应该清理所有缓存', () => {
    const cache1 = manager.getCache('cache1')
    const cache2 = manager.getCache('cache2')

    cache1.set('key', 'value', 50)
    cache2.set('key', 'value', 50)

    setTimeout(() => {
      manager.cleanupAll()
      expect(cache1.size).toBe(0)
      expect(cache2.size).toBe(0)
    }, 100)
  })

  it('应该清空所有缓存', () => {
    const cache1 = manager.getCache('cache1')
    const cache2 = manager.getCache('cache2')

    cache1.set('key', 'value')
    cache2.set('key', 'value')

    manager.clearAll()

    expect(cache1.size).toBe(0)
    expect(cache2.size).toBe(0)
  })

  it('应该获取所有缓存统计', () => {
    const cache1 = manager.getCache('cache1')
    const cache2 = manager.getCache('cache2')

    cache1.set('key', 'value')
    cache2.set('key', 'value')

    const stats = manager.getAllStats()

    expect(stats).toHaveProperty('cache1')
    expect(stats).toHaveProperty('cache2')
    expect(stats.cache1.size).toBe(1)
    expect(stats.cache2.size).toBe(1)
  })

  it('应该获取内存使用情况', () => {
    const usage = manager.getMemoryUsage()

    expect(usage).toHaveProperty('used')
    expect(usage).toHaveProperty('total')
    expect(usage).toHaveProperty('percentage')
  })
})

describe('便捷函数', () => {
  afterEach(() => {
    CacheManager.getInstance().clearAll()
  })

  it('createCache 应该创建缓存', () => {
    const cache = createCache('test', { maxSize: 100 })
    expect(cache).toBeDefined()

    cache.set('key', 'value')
    expect(cache.get('key')).toBe('value')
  })

  it('createObjectPool 应该创建对象池', () => {
    const pool = createObjectPool({
      factory: () => ({ value: 0 }),
      initialSize: 5,
    })

    expect(pool).toBeDefined()

    const obj = pool.acquire()
    expect(obj.value).toBe(0)

    pool.clear()
  })
})

describe('cacheResult 装饰器', () => {
  class TestService {
    callCount = 0

    @cacheResult({ ttl: 1000, cacheName: 'test' })
    async getData(id: string): Promise<string> {
      this.callCount++
      return `data-${id}`
    }

    @cacheResult({
      ttl: 1000,
      cacheName: 'custom',
      keyGenerator: (id: string) => `custom:${id}`,
    })
    async getDataWithCustomKey(id: string): Promise<string> {
      this.callCount++
      return `data-${id}`
    }
  }

  let service: TestService

  beforeEach(() => {
    service = new TestService()
    CacheManager.getInstance().clearAll()
  })

  afterEach(() => {
    CacheManager.getInstance().clearAll()
  })

  it('应该缓存方法结果', async () => {
    const result1 = await service.getData('1')
    const result2 = await service.getData('1')

    expect(result1).toBe('data-1')
    expect(result2).toBe('data-1')
    expect(service.callCount).toBe(1) // 只调用一次
  })

  it('应该为不同参数缓存不同结果', async () => {
    const result1 = await service.getData('1')
    const result2 = await service.getData('2')

    expect(result1).toBe('data-1')
    expect(result2).toBe('data-2')
    expect(service.callCount).toBe(2) // 调用两次
  })

  it('应该使用自定义键生成器', async () => {
    const result1 = await service.getDataWithCustomKey('1')
    const result2 = await service.getDataWithCustomKey('1')

    expect(result1).toBe('data-1')
    expect(result2).toBe('data-1')
    expect(service.callCount).toBe(1)

    const cache = CacheManager.getInstance().getCache('custom')
    expect(cache.has('custom:1')).toBe(true)
  })

  it('应该在TTL过期后重新获取数据', async () => {
    const shortTTLService = new (class {
      callCount = 0

      @cacheResult({ ttl: 50, cacheName: 'short' })
      async getData(id: string): Promise<string> {
        this.callCount++
        return `data-${id}`
      }
    })()

    await shortTTLService.getData('1')
    expect(shortTTLService.callCount).toBe(1)

    // 等待过期
    await new Promise((resolve) => setTimeout(resolve, 100))

    await shortTTLService.getData('1')
    expect(shortTTLService.callCount).toBe(2) // 重新调用
  })
})

describe('性能测试', () => {
  it('lRUCache 大量操作性能', () => {
    const cache = new LRUCache({ maxSize: 10000 })

    const start = Date.now()

    // 写入10000条
    for (let i = 0; i < 10000; i++) {
      cache.set(`key${i}`, { value: i })
    }

    // 读取10000条
    for (let i = 0; i < 10000; i++) {
      cache.get(`key${i}`)
    }

    const duration = Date.now() - start

    expect(duration).toBeLessThan(1000) // 应该在1秒内完成

    cache.destroy()
  })

  it('objectPool 大量获取和归还性能', () => {
    const pool = createObjectPool({
      factory: () => ({ x: 0, y: 0, z: 0 }),
      reset: (obj) => {
        obj.x = 0
        obj.y = 0
        obj.z = 0
      },
      initialSize: 100,
      maxSize: 1000,
    })

    const start = Date.now()

    // 10000次获取和归还
    for (let i = 0; i < 10000; i++) {
      const obj = pool.acquire()
      obj.x = i
      pool.release(obj)
    }

    const duration = Date.now() - start

    expect(duration).toBeLessThan(500) // 应该在500ms内完成

    const stats = pool.getStats()
    expect(stats.reuseRate).toBeGreaterThan(0.9) // 重用率应该很高

    pool.clear()
  })
})
