/**
 * 缓存性能测试
 */

import { describe, expect, it, beforeEach } from 'vitest'
import { CacheManager } from '../../src/core/cache-manager'
import { StorageStrategy } from '../../src/strategies/storage-strategy'

describe('缓存性能测试', () => {
  let cache: CacheManager

  beforeEach(async () => {
    cache = new CacheManager({
      engines: {
        memory: { enabled: true },
        localStorage: { enabled: true },
        sessionStorage: { enabled: true }
      }
    })
    // CacheManager 会自动初始化，不需要手动调用 initialize
  })

  describe('基础操作性能', () => {
    it('应该快速执行大量set操作', async () => {
      const startTime = performance.now()
      const operations = []

      // 执行1000次set操作
      for (let i = 0; i < 1000; i++) {
        operations.push(cache.set(`key-${i}`, `value-${i}`))
      }

      await Promise.all(operations)
      const endTime = performance.now()
      const duration = endTime - startTime

      // 1000次操作应该在合理时间内完成（通常<1秒）
      expect(duration).toBeLessThan(1000)
      console.log(`1000次set操作耗时: ${duration.toFixed(2)}ms`)
    })

    it('应该快速执行大量get操作', async () => {
      // 先设置一些数据
      const setupOperations = []
      for (let i = 0; i < 100; i++) {
        setupOperations.push(cache.set(`perf-key-${i}`, `perf-value-${i}`))
      }
      await Promise.all(setupOperations)

      const startTime = performance.now()
      const operations = []

      // 执行1000次get操作（包含命中和未命中）
      for (let i = 0; i < 1000; i++) {
        const keyIndex = i % 150 // 有些键存在，有些不存在
        operations.push(cache.get(`perf-key-${keyIndex}`))
      }

      await Promise.all(operations)
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(500)
      console.log(`1000次get操作耗时: ${duration.toFixed(2)}ms`)
    })

    it('应该高效处理大对象', async () => {
      // 创建一个大对象（约1MB）
      const largeObject = {
        id: 'large-object',
        data: 'x'.repeat(1024 * 1024), // 1MB字符串
        metadata: {
          created: Date.now(),
          version: '1.0.0',
          tags: Array.from({ length: 1000 }, (_, i) => `tag-${i}`)
        }
      }

      const startTime = performance.now()

      await cache.set('large-object', largeObject)
      const retrieved = await cache.get('large-object')

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(retrieved).toEqual(largeObject)
      expect(duration).toBeLessThan(100) // 大对象操作应该在100ms内完成
      console.log(`大对象操作耗时: ${duration.toFixed(2)}ms`)
    })
  })

  describe('策略选择性能', () => {
    it('应该快速选择存储策略', async () => {
      const strategy = new StorageStrategy()
      const testData = [
        { key: 'small', value: 'small data', ttl: undefined },
        { key: 'medium', value: 'x'.repeat(10000), ttl: 3600000 },
        { key: 'large', value: 'x'.repeat(100000), ttl: 86400000 },
        { key: 'object', value: { complex: { nested: { data: true } } }, ttl: 1800000 }
      ]

      const startTime = performance.now()

      // 执行1000次策略选择
      const operations = []
      for (let i = 0; i < 1000; i++) {
        const data = testData[i % testData.length]
        operations.push(strategy.selectEngine(data.key, data.value, { ttl: data.ttl }))
      }

      await Promise.all(operations)
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(50) // 策略选择应该非常快
      console.log(`1000次策略选择耗时: ${duration.toFixed(2)}ms`)

      // 检查缓存命中率
      const stats = strategy.getCacheStats()
      expect(stats.hitRate).toBeGreaterThan(0.5) // 应该有较高的缓存命中率
      console.log(`策略缓存命中率: ${(stats.hitRate * 100).toFixed(1)}%`)
    })
  })

  describe('内存使用优化', () => {
    it('应该有效管理内存使用', async () => {
      const initialMemory = process.memoryUsage?.()?.heapUsed || 0

      // 创建大量缓存项
      const operations = []
      for (let i = 0; i < 10000; i++) {
        operations.push(cache.set(`memory-test-${i}`, {
          id: i,
          data: `data-${i}`,
          timestamp: Date.now()
        }))
      }
      await Promise.all(operations)

      const afterSetMemory = process.memoryUsage?.()?.heapUsed || 0

      // 清理缓存
      await cache.clear()

      const afterClearMemory = process.memoryUsage?.()?.heapUsed || 0

      // 内存应该得到有效释放
      const memoryIncrease = afterSetMemory - initialMemory
      const memoryAfterClear = afterClearMemory - initialMemory

      console.log(`设置10000项后内存增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)
      console.log(`清理后内存使用: ${(memoryAfterClear / 1024 / 1024).toFixed(2)}MB`)

      // 清理后内存使用应该显著减少
      expect(memoryAfterClear).toBeLessThan(memoryIncrease * 0.5)
    })
  })

  describe('并发性能', () => {
    it('应该处理并发读写操作', async () => {
      const concurrentOperations = 100
      const startTime = performance.now()

      // 创建并发的读写操作
      const operations = []

      for (let i = 0; i < concurrentOperations; i++) {
        // 混合读写操作
        if (i % 3 === 0) {
          operations.push(cache.set(`concurrent-${i}`, `value-${i}`))
        } else if (i % 3 === 1) {
          operations.push(cache.get(`concurrent-${i - 1}`))
        } else {
          operations.push(cache.has(`concurrent-${i - 2}`))
        }
      }

      const results = await Promise.all(operations)
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(200) // 并发操作应该快速完成
      expect(results).toHaveLength(concurrentOperations)
      console.log(`${concurrentOperations}个并发操作耗时: ${duration.toFixed(2)}ms`)
    })
  })

  describe('清理性能', () => {
    it('应该高效清理过期项', async () => {
      // 设置一些即将过期的项
      const operations = []
      for (let i = 0; i < 1000; i++) {
        operations.push(cache.set(`expire-${i}`, `value-${i}`, { ttl: 100 })) // 100ms TTL
      }
      await Promise.all(operations)

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 150))

      const startTime = performance.now()
      await cache.cleanup()
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(100) // 清理操作应该快速完成
      console.log(`清理1000个过期项耗时: ${duration.toFixed(2)}ms`)

      // 验证过期项已被清理
      const remainingKeys = await cache.keys()
      const expiredKeysRemaining = remainingKeys.filter(key => key.startsWith('expire-'))
      expect(expiredKeysRemaining.length).toBe(0)
    })
  })

  describe('序列化性能', () => {
    it('应该高效处理复杂对象序列化', async () => {
      const complexObject = {
        users: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          profile: {
            age: 20 + (i % 50),
            interests: [`hobby-${i % 10}`, `sport-${i % 5}`],
            settings: {
              theme: i % 2 === 0 ? 'dark' : 'light',
              notifications: true,
              privacy: {
                showEmail: i % 3 === 0,
                showAge: i % 4 === 0
              }
            }
          }
        })),
        metadata: {
          version: '2.0.0',
          created: Date.now(),
          stats: {
            totalUsers: 1000,
            activeUsers: 750,
            premiumUsers: 250
          }
        }
      }

      const startTime = performance.now()

      await cache.set('complex-object', complexObject)
      const retrieved = await cache.get('complex-object')

      const endTime = performance.now()
      const duration = endTime - startTime

      expect(retrieved).toEqual(complexObject)
      expect(duration).toBeLessThan(50) // 复杂对象序列化应该在50ms内完成
      console.log(`复杂对象序列化耗时: ${duration.toFixed(2)}ms`)
    })
  })
})
