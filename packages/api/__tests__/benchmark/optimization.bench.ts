/**
 * 优化效果验证基准测试
 * 对比优化前后的性能差异
 */

import { bench, describe } from 'vitest'
import { createApiEngine } from '../../src/index'
import { RequestQueueManager } from '../../src/utils/RequestQueue'

describe('优化效果验证', () => {
  describe('RequestQueue 插入性能（二分查找优化）', () => {
    bench('插入 100 个任务（优化后：二分查找）', () => {
      const queue = new RequestQueueManager({
        enabled: true,
        concurrency: 5,
        maxQueue: 1000,
      })

      // 插入不同优先级的任务
      for (let i = 0; i < 100; i++) {
        const priority = Math.floor(Math.random() * 10)
        queue.enqueue(() => Promise.resolve(i), priority).catch(() => {})
      }

      queue.destroy()
    })

    bench('插入 500 个任务（优化后：二分查找）', () => {
      const queue = new RequestQueueManager({
        enabled: true,
        concurrency: 5,
        maxQueue: 2000,
      })

      for (let i = 0; i < 500; i++) {
        const priority = Math.floor(Math.random() * 10)
        queue.enqueue(() => Promise.resolve(i), priority).catch(() => {})
      }

      queue.destroy()
    })

    bench('插入 1000 个任务（压力测试）', () => {
      const queue = new RequestQueueManager({
        enabled: true,
        concurrency: 10,
        maxQueue: 5000,
      })

      for (let i = 0; i < 1000; i++) {
        const priority = Math.floor(Math.random() * 10)
        queue.enqueue(() => Promise.resolve(i), priority).catch(() => {})
      }

      queue.destroy()
    })
  })

  describe('参数序列化缓存性能（WeakMap 优化）', () => {
    const engine = createApiEngine()

    engine.register('test', {
      name: 'test',
      config: { url: '/test', method: 'GET' },
    })

    bench('相同参数对象序列化 - 100 次（WeakMap 缓存）', () => {
      const params = { id: '123', name: 'test', data: { value: 456 } }

      for (let i = 0; i < 100; i++) {
        engine['generateCacheKey']('test', params)
      }
    })

    bench('不同参数对象序列化 - 100 次', () => {
      for (let i = 0; i < 100; i++) {
        const params = { id: `${i}`, name: `test-${i}`, data: { value: i } }
        engine['generateCacheKey']('test', params)
      }
    })

    bench('复杂嵌套对象序列化 - 50 次', () => {
      for (let i = 0; i < 50; i++) {
        const params = {
          id: `${i}`,
          filters: {
            status: ['active', 'pending'],
            types: ['user', 'admin'],
            dates: { start: Date.now(), end: Date.now() + 86400000 },
          },
          pagination: { page: i, pageSize: 20 },
          sort: { field: 'createdAt', order: 'desc' },
        }
        engine['generateCacheKey']('test', params)
      }
    })

    afterAll(() => {
      engine.destroy()
    })
  })

  describe('对象池性能（扩容优化）', () => {
    bench('对象池复用 - 200 次（扩容后）', () => {
      const engine = createApiEngine()
      engine.register('test', {
        name: 'test',
        config: { url: '/test', method: 'GET' },
      })

      // 模拟大量对象池操作
      for (let i = 0; i < 200; i++) {
        const ctx = engine['objectPool'].contexts.pop() || { methodName: '', params: null, engine }
        ctx.methodName = 'test'
        ctx.params = { id: i }

        // 放回对象池
        if (engine['objectPool'].contexts.length < engine['objectPool'].maxContexts) {
          ctx.methodName = ''
          ctx.params = null
          engine['objectPool'].contexts.push(ctx)
        }
      }

      engine.destroy()
    })

    bench('对象池满载测试 - 500 次', () => {
      const engine = createApiEngine()

      for (let i = 0; i < 500; i++) {
        const ctx = engine['objectPool'].contexts.pop() || { methodName: '', params: null, engine }
        ctx.methodName = `test-${i}`
        ctx.params = { id: i }

        if (engine['objectPool'].contexts.length < engine['objectPool'].maxContexts) {
          ctx.methodName = ''
          ctx.params = null
          engine['objectPool'].contexts.push(ctx)
        }
      }

      engine.destroy()
    })
  })

  describe('中间件缓存性能（LRU 优化）', () => {
    bench('中间件缓存命中率测试 - 100 个方法', () => {
      const engine = createApiEngine({
        middlewares: {
          request: [(config) => config],
          response: [(response) => response],
        },
      })

      // 注册 100 个方法
      for (let i = 0; i < 100; i++) {
        engine.register(`method${i}`, {
          name: `method${i}`,
          config: { url: `/api/${i}`, method: 'GET' },
        })
      }

      // 测试中间件获取（会触发缓存）
      for (let i = 0; i < 100; i++) {
        const methodConfig = engine['methods'].get(`method${i}`)!
        engine['getMiddlewares'](`method${i}`, methodConfig, {})
      }

      // 再次获取（应该全部命中缓存）
      for (let i = 0; i < 100; i++) {
        const methodConfig = engine['methods'].get(`method${i}`)!
        engine['getMiddlewares'](`method${i}`, methodConfig, {})
      }

      engine.destroy()
    })
  })

  describe('内存优化效果', () => {
    bench('大量引擎创建和销毁 - 50 次', () => {
      for (let i = 0; i < 50; i++) {
        const engine = createApiEngine({
          cache: { enabled: true, maxSize: 100 },
        })

        engine.register('test', {
          name: 'test',
          config: { url: '/test', method: 'GET' },
        })

        engine.destroy()
      }
    })

    bench('内存清理测试 - 缓存 + 定时器', () => {
      const engine = createApiEngine({
        cache: { enabled: true, maxSize: 500 },
      })

      // 填充缓存
      for (let i = 0; i < 500; i++) {
        engine['cacheManager'].set(`key-${i}`, { data: i }, 60000)
      }

      // 清理
      engine.destroy()
    })
  })

  describe('常量优化效果', () => {
    bench('配置对象创建 - 优化后（预计算常量）', () => {
      for (let i = 0; i < 1000; i++) {
        const config = {
          HTTP_TIMEOUT: 10000,
          CACHE_TTL: 300000,
          CACHE_MAX_SIZE: 100,
          CIRCUIT_EXPIRE_TIME: 86400000, // 预计算
        }
        void config
      }
    })
  })

  describe('批量操作性能', () => {
    bench('批量方法注册 - 200 个', () => {
      const engine = createApiEngine()
      const methods = Object.fromEntries(
        Array.from({ length: 200 }, (_, i) => [
          `method${i}`,
          {
            name: `method${i}`,
            config: {
              url: `/api/method${i}`,
              method: 'GET' as const,
            },
          },
        ]),
      )
      engine.registerBatch(methods)
      engine.destroy()
    })

    bench('批量缓存操作 - 写入 500 项', () => {
      const engine = createApiEngine({
        cache: { enabled: true, maxSize: 1000, storage: 'lru' },
      })

      const entries = Array.from({ length: 500 }, (_, i) => ({
        key: `key-${i}`,
        data: { id: i, value: `value-${i}` },
        ttl: 60000,
      }))

      engine['cacheManager'].setMany(entries)
      engine.destroy()
    })

    bench('批量缓存操作 - 读取 500 项', () => {
      const engine = createApiEngine({
        cache: { enabled: true, maxSize: 1000, storage: 'lru' },
      })

      // 预填充
      for (let i = 0; i < 500; i++) {
        engine['cacheManager'].set(`key-${i}`, { id: i }, 60000)
      }

      // 批量读取
      const keys = Array.from({ length: 500 }, (_, i) => `key-${i}`)
      engine['cacheManager'].getMany(keys)

      engine.destroy()
    })
  })
})



