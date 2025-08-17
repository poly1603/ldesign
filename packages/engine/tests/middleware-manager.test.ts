import type {
  Middleware,
  MiddlewareContext,
  MiddlewareManager,
} from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  commonMiddleware,
  createErrorMiddleware,
  createMiddlewareManager,
  createRequestMiddleware,
  createResponseMiddleware,
} from '../src/middleware/middleware-manager'

// Mock Performance API
Object.defineProperty(globalThis, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
  },
})

describe('middlewareManager', () => {
  let middlewareManager: MiddlewareManager

  beforeEach(() => {
    middlewareManager = createMiddlewareManager()
  })

  describe('基础功能', () => {
    it('应该创建中间件管理器实例', () => {
      expect(middlewareManager).toBeDefined()
      expect((middlewareManager as any).size()).toBe(0)
    })

    it('应该添加中间件', () => {
      const middleware: Middleware = {
        name: 'test',
        handler: vi.fn(),
      }

      middlewareManager.use(middleware)

      expect((middlewareManager as any).has('test')).toBe(true)
      expect((middlewareManager as any).get('test')).toBe(middleware)
      expect((middlewareManager as any).size()).toBe(1)
    })

    it('应该替换同名中间件', () => {
      const middleware1: Middleware = {
        name: 'test',
        handler: vi.fn(),
      }

      const middleware2: Middleware = {
        name: 'test',
        handler: vi.fn(),
      }

      middlewareManager.use(middleware1)
      middlewareManager.use(middleware2)

      expect((middlewareManager as any).size()).toBe(1)
      expect((middlewareManager as any).get('test')).toBe(middleware2)
    })

    it('应该按优先级排序中间件', () => {
      const middleware1: Middleware = {
        name: 'low-priority',
        handler: vi.fn(),
        priority: 100,
      }

      const middleware2: Middleware = {
        name: 'high-priority',
        handler: vi.fn(),
        priority: 10,
      }

      const middleware3: Middleware = {
        name: 'medium-priority',
        handler: vi.fn(),
        priority: 50,
      }

      middlewareManager.use(middleware1)
      middlewareManager.use(middleware2)
      middlewareManager.use(middleware3)

      const order = (middlewareManager as any).getExecutionOrder()
      expect(order).toEqual([
        'high-priority',
        'medium-priority',
        'low-priority',
      ])
    })

    it('应该为没有优先级的中间件设置默认优先级', () => {
      const middleware1: Middleware = {
        name: 'no-priority',
        handler: vi.fn(),
      }

      const middleware2: Middleware = {
        name: 'with-priority',
        handler: vi.fn(),
        priority: 50,
      }

      middlewareManager.use(middleware1)
      middlewareManager.use(middleware2)

      const order = (middlewareManager as any).getExecutionOrder()
      expect(order).toEqual(['with-priority', 'no-priority'])
    })

    it('应该移除中间件', () => {
      const middleware: Middleware = {
        name: 'test',
        handler: vi.fn(),
      }

      middlewareManager.use(middleware)
      expect((middlewareManager as any).has('test')).toBe(true)

      middlewareManager.remove('test')
      expect((middlewareManager as any).has('test')).toBe(false)
      expect((middlewareManager as any).size()).toBe(0)
    })

    it('应该获取所有中间件', () => {
      const middleware1: Middleware = {
        name: 'test1',
        handler: vi.fn(),
      }

      const middleware2: Middleware = {
        name: 'test2',
        handler: vi.fn(),
      }

      middlewareManager.use(middleware1)
      middlewareManager.use(middleware2)

      const allMiddleware = (middlewareManager as any).getAll()
      expect(allMiddleware).toHaveLength(2)
      expect(allMiddleware).toContain(middleware1)
      expect(allMiddleware).toContain(middleware2)
    })

    it('应该清空所有中间件', () => {
      middlewareManager.use({ name: 'test1', handler: vi.fn() })
      middlewareManager.use({ name: 'test2', handler: vi.fn() })

      expect((middlewareManager as any).size()).toBe(2);

      (middlewareManager as any).clear()
      expect((middlewareManager as any).size()).toBe(0)
    })
  })

  describe('中间件执行', () => {
    it('应该执行所有中间件', async () => {
      const order: string[] = []

      const middleware1: Middleware = {
        name: 'first',
        handler: async (ctx, next) => {
          order.push('first-start')
          await next()
          order.push('first-end')
        },
        priority: 10,
      }

      const middleware2: Middleware = {
        name: 'second',
        handler: async (ctx, next) => {
          order.push('second-start')
          await next()
          order.push('second-end')
        },
        priority: 20,
      }

      middlewareManager.use(middleware1)
      middlewareManager.use(middleware2)

      const context: MiddlewareContext = { data: 'test' }
      await middlewareManager.execute(context)

      expect(order).toEqual([
        'first-start',
        'second-start',
        'second-end',
        'first-end',
      ])
    })

    it('应该执行指定名称的中间件', async () => {
      const handler = vi.fn(async (ctx, next) => {
        await next() // 需要调用 next() 才能设置 processed: true
      })
      const middleware: Middleware = {
        name: 'test',
        handler,
      }

      middlewareManager.use(middleware)

      const context: MiddlewareContext = { data: 'test' }
      const result = await middlewareManager.execute('test', context)

      expect(handler).toHaveBeenCalledWith(context, expect.any(Function))
      expect(result).toEqual({ processed: true })
    })

    it('应该在指定中间件不存在时抛出错误', async () => {
      const context: MiddlewareContext = { data: 'test' }

      await expect(
        middlewareManager.execute('nonexistent', context),
      ).rejects.toThrow('Middleware "nonexistent" not found')
    })

    it('应该处理中间件中的错误', async () => {
      const error = new Error('Test error')
      const middleware: Middleware = {
        name: 'error-middleware',
        handler: async () => {
          throw error
        },
      }

      middlewareManager.use(middleware)

      const context: MiddlewareContext = { data: 'test' }

      await expect(middlewareManager.execute(context)).rejects.toThrow(
        'Test error',
      )
      expect(context.error).toBe(error)
    })

    it('应该支持同步中间件', async () => {
      const handler = vi.fn((ctx, next) => {
        ctx.processed = true
        next()
      })

      const middleware: Middleware = {
        name: 'sync',
        handler,
      }

      middlewareManager.use(middleware)

      const context: MiddlewareContext = { data: 'test' }
      await middlewareManager.execute(context)

      expect(handler).toHaveBeenCalled()
      expect(context.processed).toBe(true)
    })

    it('应该支持不调用next的中间件', async () => {
      const order: string[] = []

      const middleware1: Middleware = {
        name: 'first',
        handler: async (ctx, next) => {
          order.push('first')
          await next()
        },
        priority: 10,
      }

      const middleware2: Middleware = {
        name: 'second',
        handler: async () => {
          order.push('second')
          // 不调用 next()
        },
        priority: 20,
      }

      const middleware3: Middleware = {
        name: 'third',
        handler: async () => {
          order.push('third')
        },
        priority: 30,
      }

      middlewareManager.use(middleware1)
      middlewareManager.use(middleware2)
      middlewareManager.use(middleware3)

      const context: MiddlewareContext = { data: 'test' }
      await middlewareManager.execute(context)

      expect(order).toEqual(['first', 'second'])
    })
  })

  describe('中间件创建器', () => {
    it('应该创建请求中间件', () => {
      const handler = vi.fn()
      const middleware = createRequestMiddleware('test-request', handler, 25)

      expect(middleware.name).toBe('test-request')
      expect(middleware.handler).toBe(handler)
      expect(middleware.priority).toBe(25)
    })

    it('应该创建响应中间件', () => {
      const handler = vi.fn()
      const middleware = createResponseMiddleware('test-response', handler, 75)

      expect(middleware.name).toBe('test-response')
      expect(middleware.handler).toBe(handler)
      expect(middleware.priority).toBe(75)
    })

    it('应该创建错误中间件', () => {
      const handler = vi.fn()
      const middleware = createErrorMiddleware('test-error', handler)

      expect(middleware.name).toBe('test-error')
      expect(middleware.handler).toBe(handler)
      expect(middleware.priority).toBe(90)
    })

    it('应该为创建器设置默认优先级', () => {
      const requestMiddleware = createRequestMiddleware('test', vi.fn())
      const responseMiddleware = createResponseMiddleware('test', vi.fn())
      const errorMiddleware = createErrorMiddleware('test', vi.fn())

      expect(requestMiddleware.priority).toBe(50)
      expect(responseMiddleware.priority).toBe(50)
      expect(errorMiddleware.priority).toBe(90)
    })
  })

  describe('预定义中间件', () => {
    it('应该包含日志中间件', () => {
      const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      }

      const loggerMiddleware = commonMiddleware.logger(mockLogger)

      expect(loggerMiddleware.name).toBe('logger')
      expect(loggerMiddleware.priority).toBe(10)
      expect(typeof loggerMiddleware.handler).toBe('function')
    })

    it('应该包含错误处理中间件', () => {
      const mockErrorManager = {
        captureError: vi.fn(),
      }

      const errorMiddleware = commonMiddleware.errorHandler(mockErrorManager)

      expect(errorMiddleware.name).toBe('errorHandler')
      expect(errorMiddleware.priority).toBe(100)
      expect(typeof errorMiddleware.handler).toBe('function')
    })

    it('应该包含性能监控中间件', () => {
      const mockLogger = {
        warn: vi.fn(),
      }

      const performanceMiddleware = commonMiddleware.performance(mockLogger)

      expect(performanceMiddleware.name).toBe('performance')
      expect(performanceMiddleware.priority).toBe(20)
      expect(typeof performanceMiddleware.handler).toBe('function')
    })
  })
})

describe('预定义中间件功能测试', () => {
  let middlewareManager: MiddlewareManager

  beforeEach(() => {
    middlewareManager = createMiddlewareManager()
  })

  describe('日志中间件', () => {
    it('应该记录中间件执行开始和完成', async () => {
      const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      }

      const loggerMiddleware = commonMiddleware.logger(mockLogger)
      middlewareManager.use(loggerMiddleware)

      const context: MiddlewareContext = { data: 'test' }
      await middlewareManager.execute(context)

      expect(mockLogger.info).toHaveBeenCalledTimes(2)
      expect(mockLogger.info).toHaveBeenNthCalledWith(
        1,
        'Middleware execution started',
        { context },
      )
      expect(mockLogger.info).toHaveBeenNthCalledWith(
        2,
        'Middleware execution completed',
        expect.objectContaining({
          duration: expect.any(Number),
          context,
        }),
      )
    })

    it('应该与其他中间件正确配合', async () => {
      const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      }

      const loggerMiddleware = commonMiddleware.logger(mockLogger)
      const testMiddleware: Middleware = {
        name: 'test',
        handler: async (ctx, next) => {
          ctx.processed = true
          await next()
        },
        priority: 50,
      }

      middlewareManager.use(loggerMiddleware)
      middlewareManager.use(testMiddleware)

      const context: MiddlewareContext = { data: 'test' }
      await middlewareManager.execute(context)

      expect(context.processed).toBe(true)
      expect(mockLogger.info).toHaveBeenCalledTimes(2)
    })
  })

  describe('错误处理中间件', () => {
    it('应该捕获并处理错误', async () => {
      const mockErrorManager = {
        captureError: vi.fn(),
      }

      const errorHandlerMiddleware
        = commonMiddleware.errorHandler(mockErrorManager)
      const errorMiddleware: Middleware = {
        name: 'error-thrower',
        handler: async () => {
          throw new Error('Test error')
        },
        priority: 200, // 设置更低的优先级，让错误处理中间件先执行
      }

      middlewareManager.use(errorHandlerMiddleware)
      middlewareManager.use(errorMiddleware)

      const context: MiddlewareContext = { data: 'test' }
      await middlewareManager.execute(context)

      expect(mockErrorManager.captureError).toHaveBeenCalledWith(
        expect.any(Error),
      )
      expect(context.error).toBeInstanceOf(Error)
      expect(context.error?.message).toBe('Test error')
    })

    it('应该不重新抛出错误', async () => {
      const mockErrorManager = {
        captureError: vi.fn(),
      }

      const errorHandlerMiddleware
        = commonMiddleware.errorHandler(mockErrorManager)
      const errorMiddleware: Middleware = {
        name: 'error-thrower',
        handler: async () => {
          throw new Error('Test error')
        },
        priority: 200, // 设置更低的优先级，让错误处理中间件先执行
      }

      middlewareManager.use(errorHandlerMiddleware)
      middlewareManager.use(errorMiddleware)

      const context: MiddlewareContext = { data: 'test' }

      // 错误处理中间件应该捕获错误而不重新抛出
      await expect(middlewareManager.execute(context)).resolves.not.toThrow()
    })
  })

  describe('性能监控中间件', () => {
    it('应该监控中间件执行时间', async () => {
      const mockLogger = {
        warn: vi.fn(),
      }

      // Mock performance.now to control timing
      const originalPerformanceNow = globalThis.performance?.now
      let callCount = 0
      globalThis.performance = {
        now: vi.fn(() => {
          callCount++
          return callCount === 1 ? 0 : 50 // 50ms duration
        }),
      } as any

      const performanceMiddleware = commonMiddleware.performance(mockLogger)
      middlewareManager.use(performanceMiddleware)

      const context: MiddlewareContext = { data: 'test' }
      await middlewareManager.execute(context)

      expect(globalThis.performance.now).toHaveBeenCalledTimes(2)
      expect(mockLogger.warn).not.toHaveBeenCalled() // 50ms < 100ms threshold

      // Restore original performance.now
      if (originalPerformanceNow) {
        globalThis.performance.now = originalPerformanceNow
      }
    })

    it('应该在执行时间过长时发出警告', async () => {
      const mockLogger = {
        warn: vi.fn(),
      }

      // Mock performance.now to simulate slow execution
      const originalPerformanceNow = globalThis.performance?.now
      let callCount = 0
      globalThis.performance = {
        now: vi.fn(() => {
          callCount++
          return callCount === 1 ? 0 : 150 // 150ms duration
        }),
      } as any

      const performanceMiddleware = commonMiddleware.performance(mockLogger)
      middlewareManager.use(performanceMiddleware)

      const context: MiddlewareContext = { data: 'test' }
      await middlewareManager.execute(context)

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Slow middleware execution detected',
        expect.objectContaining({
          duration: 150,
          context,
        }),
      )

      // Restore original performance.now
      if (originalPerformanceNow) {
        globalThis.performance.now = originalPerformanceNow
      }
    })
  })

  describe('中间件组合测试', () => {
    it('应该正确执行多个预定义中间件', async () => {
      const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      }

      const mockErrorManager = {
        captureError: vi.fn(),
      }

      const loggerMiddleware = commonMiddleware.logger(mockLogger)
      const errorHandlerMiddleware
        = commonMiddleware.errorHandler(mockErrorManager)
      const performanceMiddleware = commonMiddleware.performance(mockLogger)

      middlewareManager.use(loggerMiddleware)
      middlewareManager.use(errorHandlerMiddleware)
      middlewareManager.use(performanceMiddleware)

      const context: MiddlewareContext = { data: 'test' }
      await middlewareManager.execute(context)

      // 验证执行顺序（按优先级）
      const order = (middlewareManager as any).getExecutionOrder()
      expect(order).toEqual(['logger', 'performance', 'errorHandler'])

      // 验证日志中间件被调用
      expect(mockLogger.info).toHaveBeenCalled()
    })

    it('应该在错误情况下正确协作', async () => {
      const mockLogger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      }

      const mockErrorManager = {
        captureError: vi.fn(),
      }

      const loggerMiddleware = commonMiddleware.logger(mockLogger)
      const errorHandlerMiddleware
        = commonMiddleware.errorHandler(mockErrorManager)
      const errorMiddleware: Middleware = {
        name: 'error-thrower',
        handler: async () => {
          throw new Error('Test error')
        },
        priority: 200, // 设置更低的优先级，让错误处理中间件先执行
      }

      middlewareManager.use(loggerMiddleware)
      middlewareManager.use(errorHandlerMiddleware)
      middlewareManager.use(errorMiddleware)

      const context: MiddlewareContext = { data: 'test' }
      await middlewareManager.execute(context)

      // 验证错误被捕获
      expect(mockErrorManager.captureError).toHaveBeenCalled()
      expect(context.error).toBeInstanceOf(Error)

      // 验证日志仍然被记录
      expect(mockLogger.info).toHaveBeenCalled()
    })
  })
})
