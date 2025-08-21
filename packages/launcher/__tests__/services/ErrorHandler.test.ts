import { describe, it, expect, beforeEach } from 'vitest'
import { ErrorHandler } from '../../src/services/ErrorHandler'
import { ERROR_CODES } from '../../src/types'

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler

  beforeEach(() => {
    errorHandler = new ErrorHandler()
  })

  describe('createError', () => {
    it('应该创建带有错误代码的错误', () => {
      const error = ErrorHandler.createError(
        ERROR_CODES.INVALID_PROJECT_ROOT,
        '项目根目录无效',
      )

      expect(error).toHaveProperty('code', ERROR_CODES.INVALID_PROJECT_ROOT)
      expect(error).toHaveProperty('message', '项目根目录无效')
      expect(error).toHaveProperty('suggestion')
    })

    it('应该创建带有详细信息的错误', () => {
      const error = ErrorHandler.createError(
        ERROR_CODES.BUILD_FAILED,
        '构建失败',
        '配置错误',
      )

      expect(error.message).toBe('构建失败')
      expect(error.details).toBe('配置错误')
    })
  })

  describe('handleError', () => {
    it('应该处理标准错误', () => {
      const originalError = new Error('原始错误')
      const handledError = errorHandler.handleError(originalError, 'test operation')

      expect(handledError).toHaveProperty('code')
      expect(handledError).toHaveProperty('message')
      expect(handledError.message).toContain('原始错误')
    })

    it('应该处理带有错误代码的错误', () => {
      const originalError = ErrorHandler.createError(
        ERROR_CODES.INVALID_PROJECT_ROOT,
        '项目根目录无效',
      )
      const handledError = errorHandler.handleError(originalError, 'create project')

      expect(handledError).toHaveProperty('code')
      expect(handledError).toHaveProperty('message')
      expect(handledError.message).toContain('项目根目录无效')
    })

    it('应该处理未知错误', () => {
      const originalError = new Error('未知错误')
      const handledError = errorHandler.handleError(originalError, 'unknown operation')

      expect(handledError).toHaveProperty('code')
      expect(handledError).toHaveProperty('message')
      expect(handledError.message).toContain('未知错误')
    })
  })

  describe('formatError', () => {
    it('应该格式化错误信息', () => {
      const error = ErrorHandler.createError(
        ERROR_CODES.INVALID_PROJECT_ROOT,
        '项目根目录无效',
      )
      const formatted = errorHandler.formatError(error)
      expect(typeof formatted).toBe('string')
      expect(formatted).toContain('项目根目录无效')
    })
  })

  describe('logError', () => {
    it('应该记录错误信息', () => {
      const error = ErrorHandler.createError(
        ERROR_CODES.BUILD_FAILED,
        '构建失败',
      )
      expect(() => errorHandler.logError(error)).not.toThrow()
    })
  })
})
