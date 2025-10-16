/**
 * 性能测试
 * 验证优化效果
 */

import { describe, expect, it } from 'vitest'
import { InterceptorManagerImpl } from '../../src/interceptors/manager'
import { DeduplicationKeyGenerator } from '../../src/utils/concurrency'
import { MemoryCacheStorage } from '../../src/utils/cache'
import { RequestMonitor } from '../../src/utils/monitor'

describe('性能优化测试', () => {
  describe('拦截器管理器性能', () => {
    it('应该高效地添加和删除拦截器', () => {
      const manager = new InterceptorManagerImpl()
      const startTime = performance.now()

      // 添加1000个拦截器
      const ids: number[] = []
      for (let i = 0; i < 1000; i++) {
        const id = manager.use(() => {})
        ids.push(id)
      }

      // 删除500个拦截器
      for (let i = 0; i < 500; i++) {
        manager.eject(ids[i])
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // 应该在合理时间内完成（<50ms）
      expect(duration).toBeLessThan(50)
      expect(manager.size()).toBe(500)
    })

    it('应该高效地遍历拦截器', () => {
      const manager = new InterceptorManagerImpl()

      // 添加100个拦截器
      for (let i = 0; i < 100; i++) {
        manager.use(() => {})
      }

      const startTime = performance.now()

      // 遍历10000次
      for (let i = 0; i < 10000; i++) {
        let count = 0
        manager.forEach(() => {
          count++
        })
        expect(count).toBe(100)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // 应该在合理时间内完成（<100ms）
      expect(duration).toBeLessThan(100)
    })
  })

  describe('缓存键生成器性能', () => {
    it('应该高效地生成缓存键', () => {
      const generator = new DeduplicationKeyGenerator()

      const config = {
        method: 'GET',
        url: '/api/users',
        params: { page: 1, size: 10 },
      }

      const startTime = performance.now()

      // 生成10000个键
      for (let i = 0; i < 10000; i++) {
        generator.generate(config)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // 应该在合理时间内完成（<50ms）
      expect(duration).toBeLessThan(50)
    })

    it('应该利用缓存提升性能', () => {
      const generator = new DeduplicationKeyGenerator()

      const config = {
        method: 'GET',
        url: '/api/users',
        params: { page: 1, size: 10 },
      }

      // 第一次生成（无缓存）
      const startTime1 = performance.now()
      for (let i = 0; i < 1000; i++) {
        generator.generate(config)
      }
      const duration1 = performance.now() - startTime1

      // 第二次生成（有缓存）
      const startTime2 = performance.now()
      for (let i = 0; i < 1000; i++) {
        generator.generate(config)
      }
      const duration2 = performance.now() - startTime2

      // 有缓存应该更快
      expect(duration2).toBeLessThan(duration1)
    })
  })

  describe('内存缓存性能', () => {
    it('应该高效地存储和读取数据', async () => {
      const storage = new MemoryCacheStorage()

      const startTime = performance.now()

      // 存储1000个项
      for (let i = 0; i < 1000; i++) {
        await storage.set(`key${i}`, { data: `value${i}` })
      }

      // 读取1000个项
      for (let i = 0; i < 1000; i++) {
        await storage.get(`key${i}`)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // 应该在合理时间内完成（<100ms）
      expect(duration).toBeLessThan(100)

      storage.destroy()
    })

    it('应该高效地清理过期项', async () => {
      const storage = new MemoryCacheStorage()

      // 存储100个短TTL项
      for (let i = 0; i < 100; i++) {
        await storage.set(`key${i}`, { data: `value${i}` }, 10) // 10ms TTL
      }

      expect(storage.size()).toBe(100)

      // 等待过期
      await new Promise(resolve => setTimeout(resolve, 50))

      // 访问一个项触发清理
      await storage.get('key0')

      // 应该已经过期
      const result = await storage.get('key0')
      expect(result).toBeNull()

      storage.destroy()
    })
  })

  describe('监控系统性能', () => {
    it('应该高效地记录指标', () => {
      const monitor = new RequestMonitor({
        enabled: true,
        maxMetrics: 1000,
      })

      const startTime = performance.now()

      // 记录1000个请求
      for (let i = 0; i < 1000; i++) {
        const requestId = `req${i}`
        monitor.startRequest(requestId, { url: '/api/test', method: 'GET' })
        monitor.endRequest(requestId, { url: '/api/test', method: 'GET' }, {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
        })
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // 应该在合理时间内完成（<100ms）
      expect(duration).toBeLessThan(100)
    })

    it('应该利用缓存提升统计查询性能', () => {
      const monitor = new RequestMonitor({
        enabled: true,
        maxMetrics: 1000,
      })

      // 记录100个请求
      for (let i = 0; i < 100; i++) {
        const requestId = `req${i}`
        monitor.startRequest(requestId, { url: '/api/test', method: 'GET' })
        monitor.endRequest(requestId, { url: '/api/test', method: 'GET' }, {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
        })
      }

      // 第一次查询（无缓存）
      const startTime1 = performance.now()
      for (let i = 0; i < 100; i++) {
        monitor.getStats()
      }
      const duration1 = performance.now() - startTime1

      // 第二次查询（有缓存）
      const startTime2 = performance.now()
      for (let i = 0; i < 100; i++) {
        monitor.getStats()
      }
      const duration2 = performance.now() - startTime2

      // 有缓存应该更快
      expect(duration2).toBeLessThan(duration1)
    })

    it('采样应该减少内存占用', () => {
      const monitorWithSampling = new RequestMonitor({
        enabled: true,
        enableSampling: true,
        samplingRate: 0.1, // 10%采样率
        maxMetrics: 1000,
      })

      const monitorWithoutSampling = new RequestMonitor({
        enabled: true,
        enableSampling: false,
        maxMetrics: 1000,
      })

      // 记录1000个请求
      for (let i = 0; i < 1000; i++) {
        const requestId = `req${i}`

        monitorWithSampling.startRequest(requestId, { url: '/api/test', method: 'GET' })
        monitorWithSampling.endRequest(requestId, { url: '/api/test', method: 'GET' }, {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
        })

        monitorWithoutSampling.startRequest(requestId, { url: '/api/test', method: 'GET' })
        monitorWithoutSampling.endRequest(requestId, { url: '/api/test', method: 'GET' }, {
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
        })
      }

      const statsWithSampling = monitorWithSampling.getStats()
      const statsWithoutSampling = monitorWithoutSampling.getStats()

      // 采样应该记录更少的请求
      expect(statsWithSampling.totalRequests).toBeLessThan(statsWithoutSampling.totalRequests)
    })
  })

  describe('内存占用测试', () => {
    it('拦截器管理器应该使用紧凑数组', () => {
      const manager = new InterceptorManagerImpl()

      // 添加100个拦截器
      const ids: number[] = []
      for (let i = 0; i < 100; i++) {
        const id = manager.use(() => {})
        ids.push(id)
      }

      // 删除50个拦截器 (删除偶数索引的拦截器)
      for (let i = 0; i < 100; i += 2) {
        manager.eject(ids[i])
      }

      // 应该只有50个拦截器
      expect(manager.size()).toBe(50)

      // 获取所有拦截器应该返回紧凑数组
      const interceptors = manager.getInterceptors()
      expect(interceptors.length).toBe(50)
      expect(interceptors.every(i => i !== null)).toBe(true)
    })
  })
})

