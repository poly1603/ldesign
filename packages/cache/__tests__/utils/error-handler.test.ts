/**
 * 错误处理工具测试
 */

import { describe, expect, it, vi } from 'vitest'
import { ErrorHandler, safeAsync, safeSync, normalizeError, isErrorType } from '../../src/utils/error-handler'
import { withRetry } from '../../src/utils/retry-manager'

describe('ErrorHandler', () => {
  describe('safeAsync', () => {
    it('应该成功执行异步操作', async () => {
      const operation = vi.fn().mockResolvedValue('success')
      const result = await ErrorHandler.safeAsync(operation)

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.error).toBeUndefined()
    })

    it('应该捕获异步操作错误', async () => {
      const error = new Error('Test error')
      const operation = vi.fn().mockRejectedValue(error)
      const result = await ErrorHandler.safeAsync(operation)

      expect(result.success).toBe(false)
      expect(result.data).toBeUndefined()
      expect(result.error).toEqual(error)
    })

    it('应该转换非Error类型的错误', async () => {
      const operation = vi.fn().mockRejectedValue('string error')
      const result = await ErrorHandler.safeAsync(operation)

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('string error')
    })

    it('应该使用自定义错误转换函数', async () => {
      const operation = vi.fn().mockRejectedValue('custom error')
      const errorTransform = vi.fn().mockReturnValue(new Error('transformed'))
      
      const result = await ErrorHandler.safeAsync(operation, { errorTransform })

      expect(errorTransform).toHaveBeenCalledWith('custom error')
      expect(result.error?.message).toBe('transformed')
    })
  })

  describe('safeSync', () => {
    it('应该成功执行同步操作', () => {
      const operation = vi.fn().mockReturnValue('success')
      const result = ErrorHandler.safeSync(operation)

      expect(result).toBe('success')
    })

    it('应该捕获同步操作错误并返回默认值', () => {
      const operation = vi.fn().mockImplementation(() => {
        throw new Error('Test error')
      })
      
      const result = ErrorHandler.safeSync(operation, { 
        defaultValue: 'default',
        logError: false 
      })

      expect(result).toBe('default')
    })

    it('应该重新抛出错误当rethrow为true', () => {
      const error = new Error('Test error')
      const operation = vi.fn().mockImplementation(() => {
        throw error
      })

      expect(() => {
        ErrorHandler.safeSync(operation, { rethrow: true, logError: false })
      }).toThrow(error)
    })
  })

  describe('withRetry', () => {
    it('应该在第一次尝试成功时返回结果', async () => {
      const operation = vi.fn().mockResolvedValue('success')
      const result = await ErrorHandler.withRetry(operation, 3, 100)

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('应该重试失败的操作', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockRejectedValueOnce(new Error('Second fail'))
        .mockResolvedValue('success')

      const result = await ErrorHandler.withRetry(operation, 3, 10)

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('应该在达到最大重试次数后失败', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fail'))
      const result = await ErrorHandler.withRetry(operation, 2, 10)

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('failed after 2 attempts')
      expect(operation).toHaveBeenCalledTimes(2)
    })
  })

  describe('normalizeError', () => {
    it('应该保持Error对象不变', () => {
      const error = new Error('Test error')
      const result = ErrorHandler.normalizeError(error)

      expect(result).toBe(error)
    })

    it('应该将字符串转换为Error', () => {
      const result = ErrorHandler.normalizeError('string error')

      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('string error')
    })

    it('应该添加上下文信息', () => {
      const result = ErrorHandler.normalizeError('test', 'Context')

      expect(result.message).toBe('Context: test')
    })

    it('应该处理未知类型的错误', () => {
      const result = ErrorHandler.normalizeError({ unknown: 'object' })

      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('Unknown error')
    })
  })

  describe('isErrorType', () => {
    it('应该匹配字符串模式', () => {
      const error = new Error('Network timeout error')

      expect(ErrorHandler.isErrorType(error, 'timeout')).toBe(true)
      expect(ErrorHandler.isErrorType(error, 'connection')).toBe(false)
    })

    it('应该匹配正则表达式模式', () => {
      const error = new Error('HTTP 404 Not Found')

      expect(ErrorHandler.isErrorType(error, /\d{3}/)).toBe(true)
      expect(ErrorHandler.isErrorType(error, /\d{4}/)).toBe(false)
    })

    it('应该匹配多个模式', () => {
      const error = new Error('Network timeout error')

      expect(ErrorHandler.isErrorType(error, 'connection', 'timeout')).toBe(true)
      expect(ErrorHandler.isErrorType(error, 'database', 'auth')).toBe(false)
    })

    it('应该处理非Error类型', () => {
      expect(ErrorHandler.isErrorType('not an error', 'test')).toBe(false)
      expect(ErrorHandler.isErrorType(null, 'test')).toBe(false)
    })
  })

  describe('快捷函数', () => {
    it('safeAsync应该工作', async () => {
      const result = await safeAsync(() => Promise.resolve('test'))
      expect(result.success).toBe(true)
      expect(result.data).toBe('test')
    })

    it('safeSync应该工作', () => {
      const result = safeSync(() => 'test')
      expect(result).toBe('test')
    })

    it('withRetry应该工作', async () => {
      const result = await ErrorHandler.withRetry(() => Promise.resolve('test'))
      expect(result.success).toBe(true)
      expect(result.data).toBe('test')
    })

    it('normalizeError应该工作', () => {
      const result = normalizeError('test')
      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('test')
    })

    it('isErrorType应该工作', () => {
      const error = new Error('test error')
      expect(isErrorType(error, 'test')).toBe(true)
    })
  })
})
