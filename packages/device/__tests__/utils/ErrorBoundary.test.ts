import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '../../src/utils/ErrorBoundary'

describe('errorBoundary', () => {
  let errorBoundary: ErrorBoundary

  beforeEach(() => {
    errorBoundary = ErrorBoundary.getInstance({
      enableGlobalCapture: false, // 避免干扰其他测试
      maxErrorCount: 100,
      sampleRate: 1,
    })
  })

  afterEach(() => {
    errorBoundary.clearErrors()
    errorBoundary.dispose()
  })

  describe('单例模式', () => {
    it('应该返回同一个实例', () => {
      const instance1 = ErrorBoundary.getInstance()
      const instance2 = ErrorBoundary.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('同步错误捕获', () => {
    it('应该捕获同步函数中的错误', () => {
      const errorFn = () => {
        throw new Error('Test error')
      }

      const result = errorBoundary.wrap(errorFn)()
      expect(result).toBeUndefined()
    })

    it('应该执行错误处理器', () => {
      const errorHandler = vi.fn()
      const errorFn = () => {
        throw new Error('Test error')
      }

      errorBoundary.onError(errorHandler)
      errorBoundary.wrap(errorFn)()

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          type: 'sync',
        }),
      )
    })

    it('应该支持默认值', () => {
      const errorFn = () => {
        throw new Error('Test error')
      }

      const result = errorBoundary.wrap(errorFn, { defaultValue: 'fallback' })()
      expect(result).toBe('fallback')
    })

    it('应该支持自定义错误处理', () => {
      const customHandler = vi.fn()
      const errorFn = () => {
        throw new Error('Test error')
      }

      errorBoundary.wrap(errorFn, { onError: customHandler })()
      expect(customHandler).toHaveBeenCalled()
    })
  })

  describe('异步错误捕获', () => {
    it('应该捕获异步函数中的错误', async () => {
      const errorFn = async () => {
        throw new Error('Async error')
      }

      const result = await errorBoundary.wrapAsync(errorFn)()
      expect(result).toBeUndefined()
    })

    it('应该执行错误处理器', async () => {
      const errorHandler = vi.fn()
      const errorFn = async () => {
        throw new Error('Async error')
      }

      errorBoundary.onError(errorHandler)
      await errorBoundary.wrapAsync(errorFn)()

      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          type: 'async',
        }),
      )
    })

    it('应该支持默认值', async () => {
      const errorFn = async () => {
        throw new Error('Async error')
      }

      const result = await errorBoundary.wrapAsync(errorFn, {
        defaultValue: 'fallback',
      })()
      expect(result).toBe('fallback')
    })

    it('应该处理 Promise 拒绝', async () => {
      const errorFn = async () => Promise.reject(new Error('Promise rejected'))

      const result = await errorBoundary.wrapAsync(errorFn)()
      expect(result).toBeUndefined()
    })
  })

  describe('错误恢复策略', () => {
    it('应该支持重试策略', async () => {
      let attempts = 0
      const flakeyFn = async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Not yet')
        }
        return 'success'
      }

      const result = await errorBoundary.wrapAsync(flakeyFn, {
        retry: { maxAttempts: 3, delay: 10 },
      })()

      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('应该在达到最大重试次数后失败', async () => {
      let attempts = 0
      const alwaysFailFn = async () => {
        attempts++
        throw new Error('Always fails')
      }

      const result = await errorBoundary.wrapAsync(alwaysFailFn, {
        retry: { maxAttempts: 2, delay: 10 },
        defaultValue: 'fallback',
      })()

      expect(result).toBe('fallback')
      expect(attempts).toBe(2)
    })

    it('应该支持降级策略', () => {
      const errorFn = () => {
        throw new Error('Primary failed')
      }

      const fallbackFn = () => 'fallback result'

      const result = errorBoundary.wrap(errorFn, { fallback: fallbackFn })()
      expect(result).toBe('fallback result')
    })

    it('应该处理降级函数中的错误', () => {
      const errorFn = () => {
        throw new Error('Primary failed')
      }

      const fallbackFn = () => {
        throw new Error('Fallback failed')
      }

      const result = errorBoundary.wrap(errorFn, {
        fallback: fallbackFn,
        defaultValue: 'final fallback',
      })()
      expect(result).toBe('final fallback')
    })
  })

  describe('错误统计', () => {
    it('应该记录错误', () => {
      const errorFn = () => {
        throw new Error('Test error')
      }

      errorBoundary.wrap(errorFn)()
      const stats = errorBoundary.getErrorStats()

      expect(stats.total).toBe(1)
      expect(stats.byType.sync).toBe(1)
    })

    it('应该限制错误记录数量', () => {
      const smallBoundary = ErrorBoundary.getInstance({
        maxErrorCount: 2,
        enableGlobalCapture: false,
      })

      const errorFn = () => {
        throw new Error('Test error')
      }

      for (let i = 0; i < 5; i++) {
        smallBoundary.wrap(errorFn)()
      }

      const errors = smallBoundary.getErrors()
      expect(errors.length).toBeLessThanOrEqual(2)

      smallBoundary.dispose()
    })

    it('应该正确统计不同类型的错误', async () => {
      const syncError = () => {
        throw new Error('Sync error')
      }
      const asyncError = async () => {
        throw new Error('Async error')
      }

      errorBoundary.wrap(syncError)()
      await errorBoundary.wrapAsync(asyncError)()

      const stats = errorBoundary.getErrorStats()
      expect(stats.byType.sync).toBe(1)
      expect(stats.byType.async).toBe(1)
      expect(stats.total).toBe(2)
    })

    it('应该能够清除错误记录', () => {
      const errorFn = () => {
        throw new Error('Test error')
      }

      errorBoundary.wrap(errorFn)()
      errorBoundary.clearErrors()

      const errors = errorBoundary.getErrors()
      expect(errors).toHaveLength(0)
    })
  })

  describe('错误采样', () => {
    it('应该根据采样率记录错误', () => {
      const sampledBoundary = ErrorBoundary.getInstance({
        sampleRate: 0.5,
        enableGlobalCapture: false,
      })

      const errorFn = () => {
        throw new Error('Test error')
      }

      // 运行多次以测试采样
      for (let i = 0; i < 20; i++) {
        sampledBoundary.wrap(errorFn)()
      }

      const stats = sampledBoundary.getErrorStats()
      // 由于采样率为 0.5，记录的错误应该少于总调用次数
      expect(stats.total).toBeLessThan(20)

      sampledBoundary.dispose()
    })
  })

  describe('全局错误捕获', () => {
    it('应该捕获未处理的错误', () => {
      const globalBoundary = ErrorBoundary.getInstance({
        enableGlobalCapture: true,
      })

      const errorHandler = vi.fn()
      globalBoundary.onError(errorHandler)

      // 模拟全局错误
      if (typeof window !== 'undefined') {
        const errorEvent = new ErrorEvent('error', {
          error: new Error('Global error'),
          message: 'Global error',
        })
        window.dispatchEvent(errorEvent)
      }

      globalBoundary.dispose()
    })

    it('应该捕获未处理的 Promise 拒绝', () => {
      const globalBoundary = ErrorBoundary.getInstance({
        enableGlobalCapture: true,
      })

      const errorHandler = vi.fn()
      globalBoundary.onError(errorHandler)

      // 模拟未处理的 Promise 拒绝
      if (typeof window !== 'undefined') {
        const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
          promise: Promise.reject(new Error('Unhandled rejection')),
          reason: new Error('Unhandled rejection'),
        })
        window.dispatchEvent(rejectionEvent)
      }

      globalBoundary.dispose()
    })
  })

  describe('装饰器工厂', () => {
    it('应该创建错误边界装饰器', () => {
      const decorator = errorBoundary.createDecorator({
        defaultValue: 'decorated fallback',
      })

      class TestClass {
        @decorator
        errorMethod() {
          throw new Error('Decorated error')
        }
      }

      const instance = new TestClass()
      const result = instance.errorMethod()
      expect(result).toBe('decorated fallback')
    })
  })

  describe('工厂函数', () => {
    it('应该创建独立的错误边界实例', () => {
      const boundary1 = errorBoundary.createBoundary({
        maxErrorCount: 10,
      })

      const boundary2 = errorBoundary.createBoundary({
        maxErrorCount: 20,
      })

      expect(boundary1).not.toBe(boundary2)
    })

    it('应该为独立实例维护单独的错误记录', () => {
      const boundary1 = errorBoundary.createBoundary()
      const boundary2 = errorBoundary.createBoundary()

      const errorFn = () => {
        throw new Error('Test error')
      }

      boundary1.wrap(errorFn)()
      boundary2.wrap(errorFn)()
      boundary2.wrap(errorFn)()

      expect(boundary1.getErrors()).toHaveLength(1)
      expect(boundary2.getErrors()).toHaveLength(2)
    })
  })

  describe('错误处理器管理', () => {
    it('应该支持多个错误处理器', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      errorBoundary.onError(handler1)
      errorBoundary.onError(handler2)

      const errorFn = () => {
        throw new Error('Test error')
      }

      errorBoundary.wrap(errorFn)()

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })

    it('应该能够移除错误处理器', () => {
      const handler = vi.fn()

      const unsubscribe = errorBoundary.onError(handler)
      unsubscribe()

      const errorFn = () => {
        throw new Error('Test error')
      }

      errorBoundary.wrap(errorFn)()

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('资源清理', () => {
    it('应该在 dispose 时清理所有资源', () => {
      const boundary = ErrorBoundary.getInstance({
        enableGlobalCapture: false,
      })

      const errorFn = () => {
        throw new Error('Test error')
      }

      boundary.wrap(errorFn)()
      boundary.dispose()

      const errors = boundary.getErrors()
      expect(errors).toHaveLength(0)
    })
  })

  describe('错误上下文', () => {
    it('应该记录错误发生时的上下文', () => {
      const errorFn = () => {
        throw new Error('Test error')
      }

      errorBoundary.wrap(errorFn)()
      const errors = errorBoundary.getErrors()

      expect(errors[0]).toHaveProperty('timestamp')
      expect(errors[0]).toHaveProperty('type')
      expect(errors[0]).toHaveProperty('error')
      expect(errors[0].timestamp).toBeInstanceOf(Date)
    })

    it('应该支持自定义元数据', () => {
      const errorFn = () => {
        throw new Error('Test error')
      }

      errorBoundary.wrap(errorFn, {
        metadata: { userId: '123', page: 'home' },
      })()

      const errors = errorBoundary.getErrors()
      expect(errors[0].metadata).toEqual({ userId: '123', page: 'home' })
    })
  })

  describe('边界条件', () => {
    it('应该处理非 Error 对象的异常', () => {
      const errorFn = () => {
        throw 'String error'
      }

      const result = errorBoundary.wrap(errorFn, { defaultValue: 'fallback' })()
      expect(result).toBe('fallback')
    })

    it('应该处理 null 和 undefined 异常', () => {
      const nullError = () => {
        throw null
      }
      const undefinedError = () => {
        throw undefined
      }

      errorBoundary.wrap(nullError)()
      errorBoundary.wrap(undefinedError)()

      const stats = errorBoundary.getErrorStats()
      expect(stats.total).toBe(2)
    })

    it('应该处理正常返回的函数', () => {
      const normalFn = () => 'success'

      const result = errorBoundary.wrap(normalFn)()
      expect(result).toBe('success')
    })

    it('应该处理带参数的函数', () => {
      const addFn = (a: number, b: number) => a + b

      const wrappedAdd = errorBoundary.wrap(addFn)
      const result = wrappedAdd(2, 3)
      expect(result).toBe(5)
    })

    it('应该处理异步函数的正常返回', async () => {
      const asyncFn = async () => 'async success'

      const result = await errorBoundary.wrapAsync(asyncFn)()
      expect(result).toBe('async success')
    })
  })
})
