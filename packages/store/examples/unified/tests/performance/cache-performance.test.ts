/**
 * 缓存机制性能测试
 *
 * 测试缓存系统的性能和命中率，包括：
 * - 缓存读写性能
 * - 缓存命中率测试
 * - 内存使用优化
 * - 缓存清理性能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  PerformanceBenchmark,
  getMemoryUsage,
  createLargeDataset,
  memoize,
  performanceMonitor
} from './setup'

// 创建测试用的计算密集型函数
function expensiveCalculation(n: number): number {
  let result = 0
  for (let i = 0; i < n * 1000; i++) {
    result += Math.sqrt(i)
  }
  return result
}

// 创建测试用的异步函数
async function expensiveAsyncCalculation(n: number): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, n))
  return expensiveCalculation(n)
}

// 创建简单的 LRU 缓存实现
class LRUCache<K, V> {
  private capacity: number
  private cache: Map<K, V>

  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!
      // 移到最后（最近使用）
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return undefined
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项（第一个）
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }
}

// 创建缓存统计类
class CacheStats {
  private hits = 0
  private misses = 0
  private totalRequests = 0

  hit(): void {
    this.hits++
  }

  miss(): void {
    this.misses++
  }

  request(): void {
    this.totalRequests++
  }

  getHitRate(): number {
    return this.totalRequests > 0 ? this.hits / this.totalRequests : 0
  }

  getMissRate(): number {
    return this.totalRequests > 0 ? this.misses / this.totalRequests : 0
  }

  getTotalRequests(): number {
    return this.totalRequests
  }

  reset(): void {
    this.hits = 0
    this.misses = 0
    this.totalRequests = 0
  }

  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      totalRequests: this.totalRequests,
      hitRate: this.getHitRate(),
      missRate: this.getMissRate()
    }
  }
}

describe('缓存机制性能测试', () => {
  beforeEach(() => {
    performanceMonitor.clear()
  })

  describe('基础缓存性能', () => {
    it('应该快速执行缓存读写操作', async () => {
      const cache = new LRUCache<string, number>(1000)
      const benchmark = new PerformanceBenchmark('基础缓存操作')

      // 准备测试数据
      const testKeys = Array.from({ length: 1000 }, (_, i) => `key-${i}`)
      const testValues = Array.from({ length: 1000 }, (_, i) => i * Math.random())

      benchmark
        .add('缓存写入操作', () => {
          testKeys.forEach((key, index) => {
            cache.set(key, testValues[index])
          })
        })
        .add('缓存读取操作', () => {
          testKeys.forEach(key => {
            cache.get(key)
          })
        })
        .add('缓存命中检查', () => {
          testKeys.forEach(key => {
            cache.has(key)
          })
        })
        .add('缓存清空操作', () => {
          cache.clear()
        })

      const results = await benchmark.run()

      // 性能断言
      const writeResult = results.find(r => r.name.includes('写入'))
      const readResult = results.find(r => r.name.includes('读取'))
      const checkResult = results.find(r => r.name.includes('检查'))
      const clearResult = results.find(r => r.name.includes('清空'))

      expect(writeResult?.opsPerSecond).toBeGreaterThan(100)
      expect(readResult?.opsPerSecond).toBeGreaterThan(500)
      expect(checkResult?.opsPerSecond).toBeGreaterThan(1000)
      expect(clearResult?.opsPerSecond).toBeGreaterThan(10000)

      console.log('基础缓存操作性能结果:', results)
    })

    it('应该高效处理不同大小的缓存', async () => {
      const cacheSizes = [100, 500, 1000, 5000, 10000]
      const benchmark = new PerformanceBenchmark('不同大小缓存')

      cacheSizes.forEach(size => {
        const cache = new LRUCache<string, number>(size)

        benchmark.add(`${size}容量缓存操作`, () => {
          // 填满缓存
          for (let i = 0; i < size; i++) {
            cache.set(`key-${i}`, i)
          }

          // 读取操作
          for (let i = 0; i < size; i++) {
            cache.get(`key-${i}`)
          }
        })
      })

      const results = await benchmark.run()

      // 性能断言 - 不同大小的缓存性能应该相对稳定
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(10)
      })

      console.log('不同大小缓存性能结果:', results)
    })
  })

  describe('memoization 性能测试', () => {
    it('应该显著提升重复计算的性能', async () => {
      const memoizedFn = memoize(expensiveCalculation)
      const benchmark = new PerformanceBenchmark('Memoization 性能')

      const testInputs = [10, 20, 30, 10, 20, 30, 10, 20, 30] // 重复输入

      benchmark
        .add('原始函数调用', () => {
          testInputs.forEach(input => expensiveCalculation(input))
        })
        .add('Memoized函数调用', () => {
          testInputs.forEach(input => memoizedFn(input))
        })

      const results = await benchmark.run()

      const originalResult = results.find(r => r.name.includes('原始'))
      const memoizedResult = results.find(r => r.name.includes('Memoized'))

      // Memoized 版本应该显著更快
      expect(memoizedResult!.opsPerSecond).toBeGreaterThan(originalResult!.opsPerSecond * 2)

      console.log('Memoization 性能结果:', results)
      console.log(`性能提升: ${(memoizedResult!.opsPerSecond / originalResult!.opsPerSecond).toFixed(2)}x`)
    })

    it('应该正确处理缓存命中和未命中', async () => {
      const stats = new CacheStats()
      const cache = new Map()

      const memoizedFn = (n: number) => {
        stats.request() // 统计总请求数

        if (cache.has(n)) {
          stats.hit()
          return cache.get(n)
        } else {
          stats.miss()
          const result = expensiveCalculation(n)
          cache.set(n, result)
          return result
        }
      }

      const testSequence = [1, 2, 3, 1, 2, 3, 4, 1, 2, 5]

      performanceMonitor.mark('cache-test-start')

      testSequence.forEach(input => memoizedFn(input))

      performanceMonitor.mark('cache-test-end')
      const totalTime = performanceMonitor.measure('cache-test-total', 'cache-test-start', 'cache-test-end')

      const cacheStats = stats.getStats()

      // 验证缓存统计
      expect(cacheStats.totalRequests).toBe(testSequence.length)
      expect(cacheStats.hitRate).toBeGreaterThan(0.3) // 至少30%命中率
      expect(totalTime).toBeLessThan(1000) // 总时间合理

      console.log('缓存统计:', cacheStats)
      console.log(`总执行时间: ${totalTime.toFixed(2)}ms`)
    })
  })

  describe('lRU 缓存性能测试', () => {
    it('应该高效处理 LRU 淘汰策略', async () => {
      const cache = new LRUCache<string, number>(100) // 小容量缓存
      const benchmark = new PerformanceBenchmark('LRU 淘汰策略')

      benchmark
        .add('填满缓存', () => {
          for (let i = 0; i < 100; i++) {
            cache.set(`key-${i}`, i)
          }
        })
        .add('触发LRU淘汰', () => {
          for (let i = 100; i < 200; i++) {
            cache.set(`key-${i}`, i) // 这会触发淘汰
          }
        })
        .add('访问模式测试', () => {
          // 模拟真实访问模式
          for (let i = 0; i < 50; i++) {
            cache.get(`key-${150 + (i % 50)}`) // 访问最近的50个
          }
        })

      const results = await benchmark.run()

      // 验证缓存大小保持在限制内
      expect(cache.size()).toBeLessThanOrEqual(100)

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(50)
      })

      console.log('LRU 淘汰策略性能结果:', results)
    })

    it('应该在高并发访问下保持性能', async () => {
      const cache = new LRUCache<string, string>(1000)
      const largeData = createLargeDataset(2000)

      const benchmark = new PerformanceBenchmark('高并发缓存访问')

      benchmark
        .add('并发写入', () => {
          largeData.forEach(item => {
            cache.set(`item-${item.id}`, JSON.stringify(item))
          })
        })
        .add('并发读取', () => {
          largeData.forEach(item => {
            cache.get(`item-${item.id}`)
          })
        })
        .add('混合读写', () => {
          largeData.forEach((item, index) => {
            if (index % 2 === 0) {
              cache.set(`mixed-${item.id}`, JSON.stringify(item))
            } else {
              cache.get(`mixed-${item.id}`)
            }
          })
        })

      const memoryBefore = getMemoryUsage()
      const results = await benchmark.run()
      const memoryAfter = getMemoryUsage()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(20)
      })

      // 内存使用检查
      const memoryIncrease = memoryAfter.used - memoryBefore.used
      console.log(`高并发缓存内存使用增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)

      console.log('高并发缓存访问性能结果:', results)
    })
  })

  describe('缓存清理性能测试', () => {
    it('应该快速执行缓存清理操作', async () => {
      const cache = new LRUCache<string, any>(10000)
      const benchmark = new PerformanceBenchmark('缓存清理性能')

      // 填充大量数据
      const largeDataset = createLargeDataset(10000)
      largeDataset.forEach(item => {
        cache.set(`item-${item.id}`, item)
      })

      benchmark
        .add('全量清理', () => {
          cache.clear()
        })
        .add('重新填充', () => {
          largeDataset.slice(0, 5000).forEach(item => {
            cache.set(`new-${item.id}`, item)
          })
        })
        .add('部分清理', () => {
          // 模拟部分清理（删除一半）
          for (let i = 0; i < 2500; i++) {
            cache.set(`temp-${i}`, null) // 覆盖旧数据
          }
        })

      const memoryBefore = getMemoryUsage()
      const results = await benchmark.run()
      const memoryAfter = getMemoryUsage()

      // 性能断言
      const clearResult = results.find(r => r.name.includes('全量清理'))
      expect(clearResult?.opsPerSecond).toBeGreaterThan(1000) // 清理应该很快

      // 内存检查
      const memoryChange = memoryAfter.used - memoryBefore.used
      console.log(`缓存清理内存变化: ${(memoryChange / 1024 / 1024).toFixed(2)} MB`)

      console.log('缓存清理性能结果:', results)
    })
  })

  describe('缓存策略比较测试', () => {
    it('应该比较不同缓存策略的性能', async () => {
      const lruCache = new LRUCache<string, number>(500)
      const mapCache = new Map<string, number>()
      const benchmark = new PerformanceBenchmark('缓存策略比较')

      const testData = Array.from({ length: 1000 }, (_, i) => ({
        key: `key-${i}`,
        value: i * Math.random()
      }))

      benchmark
        .add('LRU缓存操作', () => {
          testData.forEach(({ key, value }) => {
            lruCache.set(key, value)
          })
          testData.forEach(({ key }) => {
            lruCache.get(key)
          })
        })
        .add('Map缓存操作', () => {
          testData.forEach(({ key, value }) => {
            mapCache.set(key, value)
          })
          testData.forEach(({ key }) => {
            mapCache.get(key)
          })
        })
        .add('LRU缓存清理', () => {
          lruCache.clear()
        })
        .add('Map缓存清理', () => {
          mapCache.clear()
        })

      const results = await benchmark.run()

      // 分析不同策略的性能特点
      const lruResult = results.find(r => r.name.includes('LRU缓存操作'))
      const mapResult = results.find(r => r.name.includes('Map缓存操作'))

      console.log('缓存策略比较结果:', results)
      console.log(`LRU vs Map 性能比: ${(lruResult!.opsPerSecond / mapResult!.opsPerSecond).toFixed(2)}`)
    })
  })
})
