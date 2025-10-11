/**
 * API 引擎性能基准测试
 * 用于持续监控和优化性能
 */

import { bench, describe } from 'vitest'
import { createApiEngine } from '../../src/index'
import type { ApiEngine } from '../../src/types'

/**
 * 测试数据生成器
 */
function generateTestData(size: number) {
  return Array.from({ length: size }, (_, i) => ({
    id: `test-${i}`,
    name: `Test Item ${i}`,
    value: Math.random() * 1000,
    timestamp: Date.now(),
  }))
}

/**
 * 模拟 HTTP 响应
 */
function mockHttpResponse(data: any) {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  })
}

describe('API 引擎性能基准测试', () => {
  let engine: ApiEngine

  // 在每个测试套件前创建引擎
  beforeEach(() => {
    engine = createApiEngine({
      http: {
        baseURL: 'https://api.example.com',
      },
      cache: {
        enabled: true,
        ttl: 60000,
        maxSize: 1000,
      },
    })

    // 注册测试方法
    engine.register('getData', {
      name: 'getData',
      config: {
        url: '/api/data',
        method: 'GET',
      },
    })

    engine.register('postData', {
      name: 'postData',
      config: {
        url: '/api/data',
        method: 'POST',
      },
    })

    engine.register('getCachedData', {
      name: 'getCachedData',
      config: {
        url: '/api/cached',
        method: 'GET',
      },
      cache: {
        enabled: true,
        ttl: 60000,
      },
    })
  })

  afterEach(() => {
    engine.destroy()
  })

  describe('中间件性能', () => {
    bench('无中间件调用', async () => {
      try {
        await engine.call('getData')
      }
      catch {
        // 忽略网络错误
      }
    })

    bench('5个全局中间件', async () => {
      const engineWithMiddleware = createApiEngine({
        middlewares: {
          request: [
            (config) => config,
            (config) => config,
            (config) => config,
            (config) => config,
            (config) => config,
          ],
          response: [
            (response) => response,
            (response) => response,
            (response) => response,
            (response) => response,
            (response) => response,
          ],
        },
      })

      engineWithMiddleware.register('getData', {
        name: 'getData',
        config: {
          url: '/api/data',
          method: 'GET',
        },
      })

      try {
        await engineWithMiddleware.call('getData')
      }
      catch {
        // 忽略网络错误
      }

      engineWithMiddleware.destroy()
    })

    bench('10个全局中间件', async () => {
      const middlewares = Array.from({ length: 10 }, () => (config: any) => config)

      const engineWithMiddleware = createApiEngine({
        middlewares: {
          request: middlewares,
          response: middlewares,
        },
      })

      engineWithMiddleware.register('getData', {
        name: 'getData',
        config: {
          url: '/api/data',
          method: 'GET',
        },
      })

      try {
        await engineWithMiddleware.call('getData')
      }
      catch {
        // 忽略网络错误
      }

      engineWithMiddleware.destroy()
    })
  })

  describe('缓存性能', () => {
    bench('缓存键生成 - 小对象', () => {
      const params = { id: '123' }
      engine['generateCacheKey']('getData', params)
    })

    bench('缓存键生成 - 中等对象', () => {
      const params = {
        id: '123',
        filters: { status: 'active', type: 'user' },
        pagination: { page: 1, pageSize: 20 },
      }
      engine['generateCacheKey']('getData', params)
    })

    bench('缓存键生成 - 大对象', () => {
      const params = {
        id: '123',
        filters: generateTestData(50),
        metadata: { timestamp: Date.now(), user: 'test' },
      }
      engine['generateCacheKey']('getData', params)
    })

    bench('LRU 缓存写入 - 100 项', () => {
      const testEngine = createApiEngine({
        cache: {
          enabled: true,
          maxSize: 1000,
        },
      })

      for (let i = 0; i < 100; i++) {
        testEngine['cacheManager'].set(`key-${i}`, { data: i }, 60000)
      }

      testEngine.destroy()
    })

    bench('LRU 缓存读取 - 100 项', () => {
      const testEngine = createApiEngine({
        cache: {
          enabled: true,
          maxSize: 1000,
        },
      })

      // 预填充缓存
      for (let i = 0; i < 100; i++) {
        testEngine['cacheManager'].set(`key-${i}`, { data: i }, 60000)
      }

      // 读取测试
      for (let i = 0; i < 100; i++) {
        testEngine['cacheManager'].get(`key-${i}`)
      }

      testEngine.destroy()
    })
  })

  describe('方法注册性能', () => {
    bench('注册单个方法', () => {
      const testEngine = createApiEngine()
      testEngine.register('testMethod', {
        name: 'testMethod',
        config: {
          url: '/api/test',
          method: 'GET',
        },
      })
      testEngine.destroy()
    })

    bench('批量注册 10 个方法', () => {
      const testEngine = createApiEngine()
      const methods = Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => [
          `method${i}`,
          {
            name: `method${i}`,
            config: {
              url: `/api/method${i}`,
              method: 'GET',
            },
          },
        ]),
      )
      testEngine.registerBatch(methods)
      testEngine.destroy()
    })

    bench('批量注册 100 个方法', () => {
      const testEngine = createApiEngine()
      const methods = Object.fromEntries(
        Array.from({ length: 100 }, (_, i) => [
          `method${i}`,
          {
            name: `method${i}`,
            config: {
              url: `/api/method${i}`,
              method: 'GET',
            },
          },
        ]),
      )
      testEngine.registerBatch(methods)
      testEngine.destroy()
    })
  })

  describe('重试配置构建性能', () => {
    bench('构建重试配置 - 默认值', () => {
      const methodConfig = {
        name: 'test',
        config: { url: '/test', method: 'GET' },
      }
      const options = {}
      engine['buildRetryConfig'](methodConfig, options)
    })

    bench('构建重试配置 - 完整配置', () => {
      const methodConfig = {
        name: 'test',
        config: { url: '/test', method: 'GET' },
        retry: {
          enabled: true,
          retries: 3,
          delay: 1000,
          backoff: 'exponential' as const,
        },
      }
      const options = {
        retry: {
          maxDelay: 10000,
        },
      }
      engine['buildRetryConfig'](methodConfig, options)
    })

    bench('构建断路器配置', () => {
      const methodConfig = {
        name: 'test',
        config: { url: '/test', method: 'GET' },
      }
      const options = {}
      engine['buildCircuitBreakerConfig'](methodConfig, options)
    })
  })

  describe('中间件缓存性能', () => {
    bench('获取中间件 - 无缓存', () => {
      const testEngine = createApiEngine({
        middlewares: {
          request: [(config) => config],
          response: [(response) => response],
        },
      })

      const methodConfig = {
        name: 'test',
        config: { url: '/test', method: 'GET' },
        middlewares: {
          request: [(config: any) => config],
        },
      }

      testEngine['getMiddlewares']('test', methodConfig, {})
      testEngine.destroy()
    })

    bench('获取中间件 - 有缓存（命中）', () => {
      const testEngine = createApiEngine({
        middlewares: {
          request: [(config) => config],
          response: [(response) => response],
        },
      })

      const methodConfig = {
        name: 'test',
        config: { url: '/test', method: 'GET' },
        middlewares: {
          request: [(config: any) => config],
        },
      }

      // 预热缓存
      testEngine['getMiddlewares']('test', methodConfig, {})

      // 测试缓存命中
      testEngine['getMiddlewares']('test', methodConfig, {})
      testEngine.destroy()
    })

    bench('获取中间件 - 100次（测试缓存效果）', () => {
      const testEngine = createApiEngine({
        middlewares: {
          request: [(config) => config],
          response: [(response) => response],
        },
      })

      const methodConfig = {
        name: 'test',
        config: { url: '/test', method: 'GET' },
        middlewares: {
          request: [(config: any) => config],
        },
      }

      for (let i = 0; i < 100; i++) {
        testEngine['getMiddlewares']('test', methodConfig, {})
      }

      testEngine.destroy()
    })
  })

  describe('引擎创建和销毁性能', () => {
    bench('创建引擎 - 最小配置', () => {
      const testEngine = createApiEngine()
      testEngine.destroy()
    })

    bench('创建引擎 - 完整配置', () => {
      const testEngine = createApiEngine({
        http: {
          baseURL: 'https://api.example.com',
          timeout: 10000,
        },
        cache: {
          enabled: true,
          ttl: 60000,
          maxSize: 1000,
        },
        retry: {
          enabled: true,
          retries: 3,
          delay: 1000,
        },
        middlewares: {
          request: [(config) => config],
          response: [(response) => response],
        },
      })
      testEngine.destroy()
    })

    bench('创建并注册 50 个方法', () => {
      const testEngine = createApiEngine()
      const methods = Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => [
          `method${i}`,
          {
            name: `method${i}`,
            config: {
              url: `/api/method${i}`,
              method: 'GET',
            },
          },
        ]),
      )
      testEngine.registerBatch(methods)
      testEngine.destroy()
    })
  })

  describe('对象规范化性能', () => {
    bench('规范化请求配置 - 无函数', () => {
      const config = {
        url: '/api/test',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
      engine['normalizeRequestConfig'](config)
    })

    bench('规范化请求配置 - 有函数', () => {
      const config = {
        url: '/api/test',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': () => 'Bearer token',
        },
        data: (params: any) => params,
      }
      engine['normalizeRequestConfig'](config, { test: 'data' })
    })

    bench('规范化请求配置 - 多个函数', () => {
      const config = {
        url: '/api/test',
        method: 'GET',
        headers: {
          'Content-Type': () => 'application/json',
          'Authorization': () => 'Bearer token',
          'X-Request-ID': () => Date.now().toString(),
        },
        data: (params: any) => params,
        params: (p: any) => p,
      }
      engine['normalizeRequestConfig'](config, { test: 'data' })
    })
  })

  describe('重试延迟计算性能', () => {
    bench('计算固定延迟', () => {
      const retryConfig = engine['buildRetryConfig'](
        {
          name: 'test',
          config: { url: '/test', method: 'GET' },
          retry: {
            enabled: true,
            delay: 1000,
            backoff: 'fixed' as const,
          },
        },
        {},
      )
      engine['calculateRetryDelay'](0, retryConfig)
    })

    bench('计算指数退避延迟', () => {
      const retryConfig = engine['buildRetryConfig'](
        {
          name: 'test',
          config: { url: '/test', method: 'GET' },
          retry: {
            enabled: true,
            delay: 1000,
            backoff: 'exponential' as const,
            maxDelay: 30000,
          },
        },
        {},
      )
      engine['calculateRetryDelay'](3, retryConfig)
    })

    bench('计算延迟 - 带抖动', () => {
      const retryConfig = engine['buildRetryConfig'](
        {
          name: 'test',
          config: { url: '/test', method: 'GET' },
          retry: {
            enabled: true,
            delay: 1000,
            backoff: 'exponential' as const,
            maxDelay: 30000,
          },
        },
        {},
      )
      // 添加抖动
      ; (retryConfig as any).jitter = 0.2
      engine['calculateRetryDelay'](3, retryConfig)
    })
  })

  describe('断路器性能', () => {
    bench('断路器状态检查 - 关闭状态', () => {
      const cb = engine['buildCircuitBreakerConfig'](
        {
          name: 'test',
          config: { url: '/test', method: 'GET' },
          retry: {
            circuitBreaker: {
              enabled: true,
            },
          },
        },
        {},
      )
      try {
        engine['checkCircuitBreaker']('test', { name: 'test', config: { url: '/test', method: 'GET' } }, {}, cb)
      }
      catch {
        // 忽略错误
      }
    })

    bench('断路器成功反馈处理', () => {
      const cb = engine['buildCircuitBreakerConfig'](
        {
          name: 'test',
          config: { url: '/test', method: 'GET' },
          retry: {
            circuitBreaker: {
              enabled: true,
            },
          },
        },
        {},
      )
      engine['handleCircuitBreakerSuccess']('test', cb)
    })

    bench('断路器失败反馈处理', () => {
      const cb = engine['buildCircuitBreakerConfig'](
        {
          name: 'test',
          config: { url: '/test', method: 'GET' },
          retry: {
            circuitBreaker: {
              enabled: true,
            },
          },
        },
        {},
      )
      engine['handleCircuitBreakerFailure']('test', cb)
    })
  })
})
