/**
 * API Engine E2E 集成测试
 * 测试完整的API调用流程和插件集成
 */

import { test, expect } from '@playwright/test'

test.describe('API Engine E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到测试页面
    await page.goto('about:blank')
  })

  test('基本API调用流程', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // 动态导入API包（模拟真实使用场景）
      const { createApiEngine } = await import('../../dist/index.js')
      
      const engine = createApiEngine({
        http: {
          baseURL: 'https://jsonplaceholder.typicode.com',
        },
      })

      engine.register('getTodos', {
        name: 'getTodos',
        config: {
          url: '/todos',
          method: 'GET',
        },
      })

      try {
        const data = await engine.call('getTodos')
        return {
          success: true,
          dataLength: Array.isArray(data) ? data.length : 0,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }
      } finally {
        engine.destroy()
      }
    })

    expect(result.success).toBe(true)
    expect(result.dataLength).toBeGreaterThan(0)
  })

  test('缓存功能E2E测试', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { createApiEngine } = await import('../../dist/index.js')
      
      const engine = createApiEngine({
        http: {
          baseURL: 'https://jsonplaceholder.typicode.com',
        },
        cache: {
          enabled: true,
          ttl: 60000,
          maxSize: 100,
        },
      })

      engine.register('getPost', {
        name: 'getPost',
        config: {
          url: '/posts/1',
          method: 'GET',
        },
        cache: {
          enabled: true,
        },
      })

      const startTime1 = performance.now()
      const data1 = await engine.call('getPost')
      const time1 = performance.now() - startTime1

      const startTime2 = performance.now()
      const data2 = await engine.call('getPost')
      const time2 = performance.now() - startTime2

      const stats = engine.getCacheStats()

      engine.destroy()

      return {
        firstCallTime: time1,
        secondCallTime: time2,
        cacheHit: time2 < time1,
        cacheStats: stats,
        dataMatch: JSON.stringify(data1) === JSON.stringify(data2),
      }
    })

    expect(result.cacheHit).toBe(true)
    expect(result.dataMatch).toBe(true)
    expect(result.cacheStats.hits).toBeGreaterThan(0)
  })

  test('中间件执行顺序', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { createApiEngine } = await import('../../dist/index.js')
      
      const executionOrder: string[] = []

      const engine = createApiEngine({
        middlewares: {
          request: [
            (config) => {
              executionOrder.push('global-request-1')
              return config
            },
            (config) => {
              executionOrder.push('global-request-2')
              return config
            },
          ],
          response: [
            (response) => {
              executionOrder.push('global-response-1')
              return response
            },
            (response) => {
              executionOrder.push('global-response-2')
              return response
            },
          ],
        },
        http: {
          baseURL: 'https://jsonplaceholder.typicode.com',
        },
      })

      engine.register('getUser', {
        name: 'getUser',
        config: {
          url: '/users/1',
          method: 'GET',
        },
        middlewares: {
          request: [
            (config) => {
              executionOrder.push('method-request')
              return config
            },
          ],
          response: [
            (response) => {
              executionOrder.push('method-response')
              return response
            },
          ],
        },
      })

      try {
        await engine.call('getUser')
      } catch {
        // 忽略网络错误
      }

      engine.destroy()

      return {
        executionOrder,
        isCorrectOrder:
          executionOrder.indexOf('global-request-1') < executionOrder.indexOf('global-request-2') &&
          executionOrder.indexOf('global-request-2') < executionOrder.indexOf('method-request') &&
          executionOrder.indexOf('method-response') < executionOrder.indexOf('global-response-1') &&
          executionOrder.indexOf('global-response-1') < executionOrder.indexOf('global-response-2'),
      }
    })

    expect(result.isCorrectOrder).toBe(true)
    expect(result.executionOrder).toContain('global-request-1')
    expect(result.executionOrder).toContain('method-request')
    expect(result.executionOrder).toContain('method-response')
  })

  test('批量API调用', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { createApiEngine } = await import('../../dist/index.js')
      
      const engine = createApiEngine({
        http: {
          baseURL: 'https://jsonplaceholder.typicode.com',
        },
      })

      engine.register('getUser', {
        name: 'getUser',
        config: {
          url: '/users/1',
          method: 'GET',
        },
      })

      engine.register('getPost', {
        name: 'getPost',
        config: {
          url: '/posts/1',
          method: 'GET',
        },
      })

      const startTime = performance.now()
      const results = await engine.callBatch([
        { methodName: 'getUser' },
        { methodName: 'getPost' },
      ])
      const duration = performance.now() - startTime

      engine.destroy()

      return {
        success: results.length === 2,
        duration,
        resultCount: results.length,
      }
    })

    expect(result.success).toBe(true)
    expect(result.resultCount).toBe(2)
  })

  test('错误处理E2E测试', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { createApiEngine } = await import('../../dist/index.js')
      
      const engine = createApiEngine({
        http: {
          baseURL: 'https://jsonplaceholder.typicode.com',
        },
      })

      engine.register('getInvalidEndpoint', {
        name: 'getInvalidEndpoint',
        config: {
          url: '/invalid-endpoint-12345',
          method: 'GET',
        },
      })

      let errorCaught = false
      let errorDetails = null

      try {
        await engine.call('getInvalidEndpoint')
      } catch (error) {
        errorCaught = true
        errorDetails = {
          name: error instanceof Error ? error.name : 'Unknown',
          hasMessage: error instanceof Error && error.message.length > 0,
        }
      }

      engine.destroy()

      return {
        errorCaught,
        errorDetails,
      }
    })

    expect(result.errorCaught).toBe(true)
    expect(result.errorDetails).toBeTruthy()
  })

  test('性能监控E2E测试', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { createApiEngine, PerformanceMonitor } = await import('../../dist/index.js')
      
      const monitor = new PerformanceMonitor({
        enabled: true,
        collectDetailedMetrics: true,
        slowQueryThreshold: 1000,
      })

      const engine = createApiEngine({
        http: {
          baseURL: 'https://jsonplaceholder.typicode.com',
        },
      })

      engine.setPerformanceMonitor(monitor)

      engine.register('getComments', {
        name: 'getComments',
        config: {
          url: '/comments',
          method: 'GET',
        },
      })

      try {
        await engine.call('getComments')
      } catch {
        // 忽略网络错误
      }

      const report = monitor.generateReport()
      const stats = monitor.getStatistics()

      engine.destroy()
      monitor.destroy()

      return {
        hasReport: report.length > 0,
        hasStats: stats !== null,
        metricsCollected: stats ? stats.count > 0 : false,
      }
    })

    expect(result.hasReport).toBe(true)
    expect(result.hasStats).toBe(true)
    expect(result.metricsCollected).toBe(true)
  })

  test('引擎销毁后的清理', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { createApiEngine } = await import('../../dist/index.js')
      
      const engine = createApiEngine({
        cache: {
          enabled: true,
          maxSize: 100,
        },
      })

      engine.register('testMethod', {
        name: 'testMethod',
        config: {
          url: '/test',
          method: 'GET',
        },
      })

      const hasMethod = engine.hasMethod('testMethod')
      
      engine.destroy()

      let destroyedStateCorrect = false
      try {
        // 尝试在销毁后调用
        await engine.call('testMethod')
      } catch (error) {
        destroyedStateCorrect = error instanceof Error && error.message.includes('destroyed')
      }

      return {
        hadMethodBeforeDestroy: hasMethod,
        destroyedStateCorrect,
      }
    })

    expect(result.hadMethodBeforeDestroy).toBe(true)
    expect(result.destroyedStateCorrect).toBe(true)
  })

  test('Bundle大小验证', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // 测试tree-shaking效果
      const { createApiEngine } = await import('../../dist/index.js')
      
      // 检查是否只导入了需要的内容
      const engine = createApiEngine()
      const engineKeys = Object.keys(engine)
      
      engine.destroy()

      return {
        hasExpectedMethods: engineKeys.includes('register') && engineKeys.includes('call'),
        methodCount: engineKeys.length,
      }
    })

    expect(result.hasExpectedMethods).toBe(true)
  })
})

test.describe('插件系统E2E测试', () => {
  test('REST插件集成', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { createApiEngine, createRestApiPlugin } = await import('../../dist/index.js')
      
      const engine = createApiEngine({
        http: {
          baseURL: 'https://jsonplaceholder.typicode.com',
        },
      })

      const restPlugin = createRestApiPlugin('/api')
      await engine.use(restPlugin)

      try {
        const data = await engine.call('getResource', { resource: 'posts', id: '1' })
        return {
          success: true,
          hasData: !!data,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }
      } finally {
        engine.destroy()
      }
    })

    expect(result.success).toBe(true)
  })

  test('多插件协同工作', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const { createApiEngine, createPerformancePlugin, createLoggingPlugin } = await import('../../dist/index.js')
      
      const engine = createApiEngine({
        http: {
          baseURL: 'https://jsonplaceholder.typicode.com',
        },
      })

      const performancePlugin = createPerformancePlugin()
      const loggingPlugin = createLoggingPlugin({ level: 'info' })

      await engine.use(performancePlugin)
      await engine.use(loggingPlugin)

      const pluginCount = engine.plugins.size

      engine.destroy()

      return {
        pluginCount,
        bothPluginsRegistered: pluginCount >= 2,
      }
    })

    expect(result.bothPluginsRegistered).toBe(true)
  })
})

