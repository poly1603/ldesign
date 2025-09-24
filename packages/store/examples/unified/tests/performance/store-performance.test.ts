/**
 * Store 状态更新性能测试
 *
 * 测试 Pinia Store 的状态更新性能，包括：
 * - 单个状态更新性能
 * - 批量状态更新性能
 * - 深层对象更新性能
 * - 数组操作性能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  PerformanceBenchmark,
  getMemoryUsage,
  createLargeDataset,
  performanceMonitor
} from './setup'
import { useProductStore } from '../../src/stores/decorators/ProductStore'
import { usePersistenceStore } from '../../src/stores/persistence/PersistenceStore'
import { useRealtimeStore } from '../../src/stores/realtime/RealtimeStore'

describe('store 状态更新性能测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    performanceMonitor.clear()
  })

  describe('productStore 性能测试', () => {
    it('应该快速执行单个产品更新', async () => {
      const store = useProductStore()
      const benchmark = new PerformanceBenchmark('ProductStore 单个产品更新')

      // 准备测试数据
      const testProduct = {
        id: 1,
        name: '测试产品',
        price: 99.99,
        category: '测试分类',
        description: '测试描述',
        stock: 100,
        rating: 4.5,
        tags: ['测试', '性能'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      benchmark
        .add('添加单个产品', () => {
          store.addProduct(testProduct)
        })
        .add('更新单个产品', () => {
          store.updateProduct(1, { name: '更新后的产品名称' })
        })
        .add('删除单个产品', () => {
          store.removeProduct(1)
        })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(1000) // 至少每秒1000次操作
        expect(result.meanTime).toBeLessThan(1) // 平均执行时间小于1ms
      })

      console.log('ProductStore 单个产品更新性能结果:', results)
    })

    it('应该高效处理批量产品操作', async () => {
      const store = useProductStore()
      const benchmark = new PerformanceBenchmark('ProductStore 批量操作')

      // 创建适量测试数据（减少数量以避免超时）
      const largeDataset = createLargeDataset(100).map(item => ({
        id: item.id,
        name: item.name,
        price: item.value,
        category: '批量测试',
        description: `批量测试产品 ${item.id}`,
        stock: Math.floor(item.value),
        rating: Math.random() * 5,
        tags: ['批量', '测试'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }))

      benchmark
        .add('批量添加100个产品', () => {
          largeDataset.forEach(product => store.addProduct(product))
        })
        .add('批量搜索产品', () => {
          store.searchProducts('测试')
        })
        .add('批量过滤产品', () => {
          store.filterProducts({ category: '批量测试' })
        })

      const memoryBefore = getMemoryUsage()
      const results = await benchmark.run()
      const memoryAfter = getMemoryUsage()

      // 性能断言
      const batchAddResult = results.find(r => r.name.includes('批量添加'))
      expect(batchAddResult?.opsPerSecond).toBeGreaterThan(10) // 批量操作相对较慢但应该合理

      // 内存使用检查
      const memoryIncrease = memoryAfter.used - memoryBefore.used
      console.log(`内存使用增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // 内存增加不超过50MB

      console.log('ProductStore 批量操作性能结果:', results)
    })
  })

  describe('persistenceStore 性能测试', () => {
    it('应该快速执行存储操作', async () => {
      const store = usePersistenceStore()
      const benchmark = new PerformanceBenchmark('PersistenceStore 存储操作')

      // 初始化存储
      store.initializePersistence()

      benchmark
        .add('更新用户偏好', () => {
          store.userPreferences.theme = store.userPreferences.theme === 'light' ? 'dark' : 'light'
        })
        .add('更新表单数据', () => {
          store.formData.name = `测试用户${Math.random()}`
        })
        .add('更新会话数据', () => {
          store.updateSessionData({ pageViews: store.sessionData.pageViews + 1 })
        })
        .add('保存到存储', () => {
          store.saveToStorage(false)
        })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        if (result.name.includes('保存到存储')) {
          expect(result.opsPerSecond).toBeGreaterThan(100) // 存储操作相对较慢
        } else {
          expect(result.opsPerSecond).toBeGreaterThan(10000) // 内存操作应该很快
        }
      })

      console.log('PersistenceStore 存储操作性能结果:', results)
    })

    it('应该高效处理存储统计更新', async () => {
      const store = usePersistenceStore()
      const benchmark = new PerformanceBenchmark('PersistenceStore 存储统计')

      store.initializePersistence()

      benchmark
        .add('更新存储统计', () => {
          store.updateStorageStats()
        })
        .add('计算存储使用率', () => {
          const usage = store.storageUsage
          return usage.localStorage + usage.sessionStorage
        })
        .add('格式化存储大小', () => {
          const formatted = store.formattedStorageSize
          return formatted.localStorage.used + formatted.sessionStorage.used
        })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(1000)
        expect(result.meanTime).toBeLessThan(1)
      })

      console.log('PersistenceStore 存储统计性能结果:', results)
    })
  })

  describe('realtimeStore 性能测试', () => {
    it('应该快速处理实时消息', async () => {
      const store = useRealtimeStore()
      const benchmark = new PerformanceBenchmark('RealtimeStore 实时消息')

      benchmark
        .add('添加单条消息', () => {
          store.addMessage({
            id: Date.now().toString(),
            user: '测试用户',
            content: '测试消息内容',
            timestamp: Date.now(),
            type: 'text'
          })
        })
        .add('批量添加消息', () => {
          for (let i = 0; i < 10; i++) {
            store.addMessage({
              id: `${Date.now()}-${i}`,
              user: `用户${i}`,
              content: `批量消息 ${i}`,
              timestamp: Date.now(),
              type: 'text'
            })
          }
        })
        .add('更新在线用户', () => {
          store.updateUserStatus('user1', 'online')
        })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(500)
      })

      console.log('RealtimeStore 实时消息性能结果:', results)
    })

    it('应该高效管理连接状态', async () => {
      const store = useRealtimeStore()
      const benchmark = new PerformanceBenchmark('RealtimeStore 连接管理')

      benchmark
        .add('连接操作', () => {
          store.connect()
        })
        .add('断开连接', () => {
          store.disconnect()
        })
        .add('重新连接', () => {
          store.reconnect()
        })
        .add('更新统计信息', () => {
          store.stats.messagesReceived++
          store.stats.messagesSent++
        })

      const results = await benchmark.run()

      // 性能断言
      results.forEach(result => {
        expect(result.opsPerSecond).toBeGreaterThan(1000)
      })

      console.log('RealtimeStore 连接管理性能结果:', results)
    })
  })

  describe('跨 Store 性能测试', () => {
    it('应该高效处理多个 Store 的同时操作', async () => {
      const productStore = useProductStore()
      const persistenceStore = usePersistenceStore()
      const realtimeStore = useRealtimeStore()

      const benchmark = new PerformanceBenchmark('跨 Store 操作')

      // 准备测试数据
      const testProduct = {
        id: 1,
        name: '跨Store测试产品',
        price: 199.99,
        category: '测试',
        description: '跨Store测试',
        stock: 50,
        rating: 4.0,
        tags: ['跨Store', '测试'],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      benchmark
        .add('同时操作多个Store', () => {
          // 产品操作
          productStore.addProduct(testProduct)

          // 持久化操作
          persistenceStore.updateSessionData({ pageViews: persistenceStore.sessionData.pageViews + 1 })

          // 实时操作
          realtimeStore.addMessage({
            id: Date.now().toString(),
            user: 'System',
            content: '添加了新产品',
            timestamp: Date.now(),
            type: 'system'
          })
        })

      const memoryBefore = getMemoryUsage()
      performanceMonitor.mark('cross-store-start')

      const results = await benchmark.run()

      performanceMonitor.mark('cross-store-end')
      const totalTime = performanceMonitor.measure('cross-store-total', 'cross-store-start', 'cross-store-end')
      const memoryAfter = getMemoryUsage()

      // 性能断言
      expect(results[0].opsPerSecond).toBeGreaterThan(100)
      expect(totalTime).toBeLessThan(1000) // 总时间小于1秒

      // 内存检查
      const memoryIncrease = memoryAfter.used - memoryBefore.used
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // 内存增加不超过10MB

      console.log('跨 Store 操作性能结果:', results)
      console.log(`总执行时间: ${totalTime.toFixed(2)}ms`)
      console.log(`内存使用增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)
    })
  })
})
