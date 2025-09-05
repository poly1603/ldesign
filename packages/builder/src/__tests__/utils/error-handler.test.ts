/**
 * 错误处理工具测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BuilderError, ErrorHandler, createErrorHandler } from '../../utils/error-handler'
import { ErrorCode } from '../../constants/errors'
import { Logger } from '../../utils/logger'

describe('BuilderError', () => {
  it('should create error with code and message', () => {
    const error = new BuilderError(ErrorCode.CONFIG_INVALID, 'Test error')
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(BuilderError)
    expect(error.name).toBe('BuilderError')
    expect(error.code).toBe(ErrorCode.CONFIG_INVALID)
    expect(error.message).toBe('Test error')
  })

  it('should include suggestion when provided', () => {
    const error = new BuilderError(ErrorCode.CONFIG_INVALID, 'Test error', {
      suggestion: 'Check your configuration file'
    })
    
    expect(error.suggestion).toBe('Check your configuration file')
  })

  it('should include additional details', () => {
    const details = { field: 'input', value: null }
    const error = new BuilderError(ErrorCode.CONFIG_INVALID, 'Test error', {
      details,
      phase: 'validation',
      file: 'config.ts'
    })
    
    expect(error.details).toEqual(details)
    expect(error.phase).toBe('validation')
    expect(error.file).toBe('config.ts')
  })

  it('should chain errors with cause', () => {
    const originalError = new Error('Original error')
    const builderError = new BuilderError(ErrorCode.BUILD_FAILED, 'Build failed', {
      cause: originalError
    })
    
    expect(builderError.cause).toBe(originalError)
  })
})

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler
  let mockLogger: Logger

  beforeEach(() => {
    mockLogger = new Logger({ level: 'silent' })
    errorHandler = new ErrorHandler({ logger: mockLogger })
  })

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const handler = new ErrorHandler()
      expect(handler).toBeInstanceOf(ErrorHandler)
    })

    it('should accept custom logger', () => {
      const customLogger = new Logger({ level: 'debug' })
      const handler = new ErrorHandler({ logger: customLogger })
      expect(handler).toBeInstanceOf(ErrorHandler)
    })
  })

  describe('Error Handling', () => {
    it('should handle BuilderError', () => {
      const error = new BuilderError(ErrorCode.CONFIG_INVALID, 'Test error')
      
      expect(() => {
        errorHandler.handle(error)
      }).not.toThrow()
    })

    it('should handle generic Error', () => {
      const error = new Error('Generic error')
      
      expect(() => {
        errorHandler.handle(error)
      }).not.toThrow()
    })

    it('should format error messages', () => {
      const error = new BuilderError(ErrorCode.CONFIG_INVALID, 'Test error', {
        suggestion: 'Check configuration',
        phase: 'validation'
      })
      
      const formatted = errorHandler.formatError(error)
      expect(formatted).toContain('Test error')
      expect(typeof formatted).toBe('string')
    })
  })

  describe('Error Recovery', () => {
    it('should suggest recovery actions', () => {
      const error = new BuilderError(ErrorCode.DEPENDENCY_MISSING, 'Missing dependency')
      
      const suggestions = errorHandler.getSuggestions(error)
      expect(Array.isArray(suggestions)).toBe(true)
    })
  })
})

describe('createErrorHandler', () => {
  it('should create ErrorHandler instance', () => {
    const handler = createErrorHandler()
    expect(handler).toBeInstanceOf(ErrorHandler)
  })

  it('should accept configuration options', () => {
    const logger = new Logger({ level: 'debug' })
    const handler = createErrorHandler({
      logger,
      showSuggestions: true
    })
    expect(handler).toBeInstanceOf(ErrorHandler)
  })
})
