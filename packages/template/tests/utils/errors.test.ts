import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ErrorHandler } from '../../src/utils/errors'

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler

  beforeEach(() => {
    errorHandler = new ErrorHandler()
  })

  describe('基本功能', () => {
    it('应该能够处理错误', () => {
      const error = new Error('Test error')

      expect(() => errorHandler.handle(error)).not.toThrow()
    })

    it('应该能够带上下文处理错误', () => {
      const error = new Error('Test error')
      const context = {
        component: 'TestComponent',
        action: 'load',
      }

      errorHandler.handle(error, context)

      const recent = errorHandler.getRecentErrors(1)
      expect(recent[0].error).toBe(error)
      expect(recent[0].context).toEqual(context)
    })

    it('应该记录错误时间戳', () => {
      const error = new Error('Test error')
      const before = Date.now()

      errorHandler.handle(error)

      const after = Date.now()
      const recent = errorHandler.getRecentErrors(1)

      expect(recent[0].timestamp).toBeGreaterThanOrEqual(before)
      expect(recent[0].timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('错误历史', () => {
    it('应该能够获取最近的错误', () => {
      errorHandler.handle(new Error('Error 1'))
      errorHandler.handle(new Error('Error 2'))
      errorHandler.handle(new Error('Error 3'))

      const recent = errorHandler.getRecentErrors(2)
      expect(recent).toHaveLength(2)
      expect(recent[0].error.message).toBe('Error 3')
      expect(recent[1].error.message).toBe('Error 2')
    })

    it('应该限制历史记录数量', () => {
      errorHandler = new ErrorHandler({ maxHistory: 5 })

      for (let i = 0; i < 10; i++) {
        errorHandler.handle(new Error(`Error ${i}`))
      }

      const history = errorHandler.getHistory()
      expect(history.length).toBeLessThanOrEqual(5)
    })

    it('应该能够清除历史', () => {
      errorHandler.handle(new Error('Error 1'))
      errorHandler.handle(new Error('Error 2'))

      errorHandler.clearHistory()

      const history = errorHandler.getHistory()
      expect(history).toHaveLength(0)
    })

    it('getHistory 应该返回完整历史', () => {
      errorHandler.handle(new Error('Error 1'))
      errorHandler.handle(new Error('Error 2'))
      errorHandler.handle(new Error('Error 3'))

      const history = errorHandler.getHistory()
      expect(history).toHaveLength(3)
    })
  })

  describe('错误统计', () => {
    it('应该统计总错误数', () => {
      errorHandler.handle(new Error('Error 1'))
      errorHandler.handle(new Error('Error 2'))

      const stats = errorHandler.getStats()
      expect(stats.totalErrors).toBe(2)
    })

    it('应该按类型统计错误', () => {
      errorHandler.handle(new TypeError('Type error'))
      errorHandler.handle(new TypeError('Another type error'))
      errorHandler.handle(new RangeError('Range error'))

      const stats = errorHandler.getStats()
      expect(stats.errorTypes.TypeError).toBe(2)
      expect(stats.errorTypes.RangeError).toBe(1)
    })

    it('应该包含最近的错误', () => {
      errorHandler.handle(new Error('Error 1'))

      const stats = errorHandler.getStats()
      expect(stats.recentErrors).toHaveLength(1)
      expect(stats.recentErrors[0].error.message).toBe('Error 1')
    })

    it('应该计算平均解决时间', () => {
      // 这个需要实际实现中有解决时间的概念
      const stats = errorHandler.getStats()
      expect(stats.avgResolutionTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('重试机制', () => {
    it('应该在失败时重试', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('Success')

      errorHandler = new ErrorHandler({ maxRetries: 3 })

      const result = await errorHandler.retry(fn)
      expect(result).toBe('Success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('应该在达到最大重试次数后抛出错误', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fail'))

      errorHandler = new ErrorHandler({ maxRetries: 2 })

      await expect(errorHandler.retry(fn)).rejects.toThrow('Always fail')
      expect(fn).toHaveBeenCalledTimes(3) // 初始 + 2次重试
    })

    it('应该支持自定义重试次数', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Fail'))

      errorHandler = new ErrorHandler({ maxRetries: 3 })

      await expect(errorHandler.retry(fn, 5)).rejects.toThrow()
      expect(fn).toHaveBeenCalledTimes(6) // 初始 + 5次重试
    })

    it('应该在重试间有延迟', async () => {
      vi.useFakeTimers()

      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('Success')

      errorHandler = new ErrorHandler({
        maxRetries: 2,
        retryDelay: 1000,
      })

      const promise = errorHandler.retry(fn)

      // 第一次调用立即执行
      expect(fn).toHaveBeenCalledTimes(1)

      // 等待延迟
      await vi.advanceTimersByTimeAsync(1000)

      // 第二次调用应该执行
      expect(fn).toHaveBeenCalledTimes(2)

      await promise

      vi.useRealTimers()
    })

    it('第一次成功不应重试', async () => {
      const fn = vi.fn().mockResolvedValue('Success')

      const result = await errorHandler.retry(fn)
      expect(result).toBe('Success')
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('降级模板', () => {
    it('应该提供降级模板', () => {
      errorHandler = new ErrorHandler({
        fallbackTemplate: 'error-page',
      })

      const fallback = errorHandler.getFallbackTemplate()
      expect(fallback).toBe('error-page')
    })

    it('默认降级模板应该是 error', () => {
      errorHandler = new ErrorHandler()

      const fallback = errorHandler.getFallbackTemplate()
      expect(fallback).toBe('error')
    })
  })

  describe('日志记录', () => {
    it('启用日志时应该记录错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation()

      errorHandler = new ErrorHandler({ logErrors: true })
      errorHandler.handle(new Error('Test error'))

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('禁用日志时不应记录', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation()

      errorHandler = new ErrorHandler({ logErrors: false })
      errorHandler.handle(new Error('Test error'))

      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('应该记录详细的错误信息', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation()

      errorHandler = new ErrorHandler({ logErrors: true })

      const error = new Error('Test error')
      const context = { component: 'Test' }

      errorHandler.handle(error, context)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error'),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('错误分类', () => {
    it('应该能够识别不同的错误类型', () => {
      errorHandler.handle(new TypeError('Type error'))
      errorHandler.handle(new RangeError('Range error'))
      errorHandler.handle(new ReferenceError('Reference error'))
      errorHandler.handle(new SyntaxError('Syntax error'))

      const stats = errorHandler.getStats()
      expect(stats.errorTypes.TypeError).toBe(1)
      expect(stats.errorTypes.RangeError).toBe(1)
      expect(stats.errorTypes.ReferenceError).toBe(1)
      expect(stats.errorTypes.SyntaxError).toBe(1)
    })

    it('应该处理自定义错误类', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'CustomError'
        }
      }

      errorHandler.handle(new CustomError('Custom error'))

      const stats = errorHandler.getStats()
      expect(stats.errorTypes.CustomError).toBe(1)
    })

    it('应该处理未知错误类型', () => {
      const unknownError = { message: 'Unknown error' } as Error

      errorHandler.handle(unknownError)

      const recent = errorHandler.getRecentErrors(1)
      expect(recent[0].error).toBe(unknownError)
    })
  })

  describe('错误过滤', () => {
    it('应该能够按类型过滤错误', () => {
      errorHandler.handle(new TypeError('Type 1'))
      errorHandler.handle(new RangeError('Range 1'))
      errorHandler.handle(new TypeError('Type 2'))

      const typeErrors = errorHandler.getErrorsByType('TypeError')
      expect(typeErrors).toHaveLength(2)
      expect(typeErrors[0].error.message).toBe('Type 2')
      expect(typeErrors[1].error.message).toBe('Type 1')
    })

    it('应该能够按时间范围过滤错误', () => {
      const now = Date.now()

      errorHandler.handle(new Error('Error 1'))

      const errors = errorHandler.getErrorsInTimeRange(now - 1000, now + 1000)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('时间范围外的错误应该被排除', () => {
      errorHandler.handle(new Error('Error 1'))

      const future = Date.now() + 10000
      const errors = errorHandler.getErrorsInTimeRange(future, future + 1000)
      expect(errors).toHaveLength(0)
    })
  })

  describe('配置更新', () => {
    it('应该能够更新配置', () => {
      errorHandler = new ErrorHandler({ maxRetries: 3 })

      errorHandler.updateConfig({ maxRetries: 5 })

      // 验证配置已更新（通过行为验证）
      const config = errorHandler.getConfig()
      expect(config.maxRetries).toBe(5)
    })

    it('部分更新不应影响其他配置', () => {
      errorHandler = new ErrorHandler({
        maxRetries: 3,
        logErrors: true,
      })

      errorHandler.updateConfig({ maxRetries: 5 })

      const config = errorHandler.getConfig()
      expect(config.maxRetries).toBe(5)
      expect(config.logErrors).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理 null 和 undefined 错误', () => {
      expect(() => {
        errorHandler.handle(null as any)
      }).not.toThrow()

      expect(() => {
        errorHandler.handle(undefined as any)
      }).not.toThrow()
    })

    it('应该处理没有消息的错误', () => {
      const error = new Error()
      error.message = ''

      errorHandler.handle(error)

      const recent = errorHandler.getRecentErrors(1)
      expect(recent).toHaveLength(1)
    })

    it('应该处理循环引用的上下文', () => {
      const context: any = { name: 'test' }
      context.self = context

      expect(() => {
        errorHandler.handle(new Error('Test'), context)
      }).not.toThrow()
    })

    it('maxHistory 为 0 应该不保存历史', () => {
      errorHandler = new ErrorHandler({ maxHistory: 0 })

      errorHandler.handle(new Error('Error 1'))
      errorHandler.handle(new Error('Error 2'))

      const history = errorHandler.getHistory()
      expect(history).toHaveLength(0)
    })

    it('maxRetries 为 0 应该不重试', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Fail'))

      errorHandler = new ErrorHandler({ maxRetries: 0 })

      await expect(errorHandler.retry(fn)).rejects.toThrow()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('并发处理', () => {
    it('应该能够并发处理多个错误', () => {
      const errors = Array.from({ length: 100 }, (_, i) =>
        new Error(`Error ${i}`))

      errors.forEach(error => errorHandler.handle(error))

      const stats = errorHandler.getStats()
      expect(stats.totalErrors).toBe(100)
    })

    it('并发重试应该正确工作', async () => {
      const fns = Array.from({ length: 10 }, (_, i) =>
        vi.fn()
          .mockRejectedValueOnce(new Error(`Fail ${i}`))
          .mockResolvedValueOnce(`Success ${i}`))

      errorHandler = new ErrorHandler({ maxRetries: 2 })

      const results = await Promise.all(
        fns.map(fn => errorHandler.retry(fn)),
      )

      expect(results).toHaveLength(10)
      results.forEach((result, i) => {
        expect(result).toBe(`Success ${i}`)
      })
    })
  })

  describe('错误堆栈', () => {
    it('应该保留错误堆栈信息', () => {
      const error = new Error('Test error')

      errorHandler.handle(error)

      const recent = errorHandler.getRecentErrors(1)
      expect(recent[0].error.stack).toBeDefined()
      expect(recent[0].error.stack).toContain('Test error')
    })

    it('应该记录堆栈跟踪', () => {
      function deepFunction() {
        errorHandler.handle(new Error('Deep error'))
      }

      function middleFunction() {
        deepFunction()
      }

      middleFunction()

      const recent = errorHandler.getRecentErrors(1)
      expect(recent[0].error.stack).toContain('deepFunction')
    })
  })

  describe('错误通知', () => {
    it('应该能够订阅错误事件', () => {
      const listener = vi.fn()
      errorHandler.on('error', listener)

      const error = new Error('Test error')
      errorHandler.handle(error)

      expect(listener).toHaveBeenCalledWith(error, undefined)
    })

    it('应该能够取消订阅', () => {
      const listener = vi.fn()
      errorHandler.on('error', listener)
      errorHandler.off('error', listener)

      errorHandler.handle(new Error('Test error'))

      expect(listener).not.toHaveBeenCalled()
    })

    it('多个监听器应该都被调用', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      errorHandler.on('error', listener1)
      errorHandler.on('error', listener2)

      const error = new Error('Test error')
      errorHandler.handle(error)

      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })
  })

  describe('性能', () => {
    it('处理大量错误应该高效', () => {
      const start = performance.now()

      for (let i = 0; i < 10000; i++) {
        errorHandler.handle(new Error(`Error ${i}`))
      }

      const end = performance.now()
      const duration = end - start

      // 应该在合理时间内完成 (< 1秒)
      expect(duration).toBeLessThan(1000)
    })

    it('获取统计信息应该快速', () => {
      for (let i = 0; i < 1000; i++) {
        errorHandler.handle(new Error(`Error ${i}`))
      }

      const start = performance.now()
      const stats = errorHandler.getStats()
      const end = performance.now()

      expect(end - start).toBeLessThan(100) // < 100ms
      expect(stats.totalErrors).toBe(1000)
    })
  })
})
