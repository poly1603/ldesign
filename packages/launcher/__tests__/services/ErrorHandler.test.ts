/**
 * @fileoverview ErrorHandler 单元测试
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ErrorHandler } from '../../src/services/ErrorHandler'
import { ERROR_CODES } from '../../src/types'

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler

  beforeEach(() => {
    errorHandler = new ErrorHandler()
    // 清除控制台mock
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('应该正确初始化', () => {
      expect(errorHandler).toBeInstanceOf(ErrorHandler)
    })
  })

  describe('handleError', () => {
    it('应该处理标准错误', () => {
      const error = new Error('测试错误')
      const context = 'test operation'

      const launcherError = errorHandler.handleError(error, context)

      expect(launcherError.code).toBe(ERROR_CODES.UNKNOWN_ERROR)
      expect(launcherError.message).toBe('测试错误')
      expect(launcherError.severity).toBe('error')
      expect(launcherError.timestamp).toBeTypeOf('number')
      expect(launcherError.originalError).toBe(error)
    })

    it('应该处理没有消息的错误', () => {
      const error = new Error('')
      const context = 'empty message test'

      const launcherError = errorHandler.handleError(error, context)

      expect(launcherError.message).toBe('发生未知错误')
    })

    it('应该处理非Error对象', () => {
      const error = 'string error'
      const context = 'string error test'

      const launcherError = errorHandler.handleError(error as any, context)

      expect(launcherError.message).toBe('string error')
      expect(launcherError.code).toBe(ERROR_CODES.UNKNOWN_ERROR)
    })

    it('应该处理null/undefined错误', () => {
      const launcherError = errorHandler.handleError(null as any, 'null test')

      expect(launcherError.message).toBe('发生未知错误')
      expect(launcherError.code).toBe(ERROR_CODES.UNKNOWN_ERROR)
    })

    it('应该根据错误消息映射错误代码', () => {
      const fileNotFoundError = new Error('ENOENT: no such file or directory')
      const launcherError = errorHandler.handleError(fileNotFoundError, 'file test')

      expect(launcherError.code).toBe(ERROR_CODES.FILE_NOT_FOUND)
      expect(launcherError.severity).toBe('error')
    })

    it('应该根据上下文提供建议', () => {
      const error = new Error('配置文件格式错误')
      const launcherError = errorHandler.handleError(error, 'config validation')

      expect(launcherError.suggestion).toContain('配置')
    })
  })

  describe('createError', () => {
    it('应该创建LauncherError', () => {
      const code = ERROR_CODES.INVALID_CONFIG
      const message = '无效配置'
      const options = {
        suggestion: '请检查配置文件',
        docUrl: 'https://example.com/docs',
      }

      const error = ErrorHandler.createError(code, message, options)

      expect(error.code).toBe(code)
      expect(error.message).toBe(message)
      expect(error.suggestion).toBe(options.suggestion)
      expect(error.docUrl).toBe(options.docUrl)
      expect(error.severity).toBe('error')
      expect(error.timestamp).toBeTypeOf('number')
    })

    it('应该设置默认严重程度', () => {
      const error = ErrorHandler.createError(ERROR_CODES.INVALID_CONFIG, '测试')
      expect(error.severity).toBe('error')
    })

    it('应该接受自定义严重程度', () => {
      const error = ErrorHandler.createError(
        ERROR_CODES.INVALID_CONFIG,
        '测试',
        { severity: 'warn' },
      )
      expect(error.severity).toBe('warn')
    })
  })

  describe('formatError', () => {
    it('应该格式化完整的错误信息', () => {
      const launcherError = ErrorHandler.createError(
        ERROR_CODES.INVALID_CONFIG,
        '配置无效',
        {
          suggestion: '请检查配置文件格式',
          docUrl: 'https://docs.example.com',
        },
      )

      const formatted = errorHandler.formatError(launcherError)

      expect(formatted).toContain('❌ 配置无效')
      expect(formatted).toContain('💡 请检查配置文件格式')
      expect(formatted).toContain('📖 https://docs.example.com')
      expect(formatted).toContain(`错误代码: ${ERROR_CODES.INVALID_CONFIG}`)
    })

    it('应该格式化最小错误信息', () => {
      const launcherError = ErrorHandler.createError(
        ERROR_CODES.UNKNOWN_ERROR,
        '简单错误',
      )

      const formatted = errorHandler.formatError(launcherError)

      expect(formatted).toContain('❌ 简单错误')
      expect(formatted).not.toContain('💡')
      expect(formatted).not.toContain('📖')
    })

    it('应该根据严重程度使用不同图标', () => {
      const errorMsg = ErrorHandler.createError(
        ERROR_CODES.UNKNOWN_ERROR,
        '错误',
        { severity: 'error' },
      )
      const warnMsg = ErrorHandler.createError(
        ERROR_CODES.UNKNOWN_ERROR,
        '警告',
        { severity: 'warn' },
      )
      const infoMsg = ErrorHandler.createError(
        ERROR_CODES.UNKNOWN_ERROR,
        '信息',
        { severity: 'info' },
      )

      expect(errorHandler.formatError(errorMsg)).toContain('❌')
      expect(errorHandler.formatError(warnMsg)).toContain('⚠️')
      expect(errorHandler.formatError(infoMsg)).toContain('ℹ️')
    })
  })

  describe('logError', () => {
    it('应该记录错误日志', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const launcherError = ErrorHandler.createError(
        ERROR_CODES.INVALID_CONFIG,
        '测试错误',
      )

      errorHandler.logError(launcherError)

      expect(consoleSpy).toHaveBeenCalled()
      const loggedMessage = consoleSpy.mock.calls[0][0]
      expect(loggedMessage).toContain('测试错误')

      consoleSpy.mockRestore()
    })

    it('应该根据严重程度使用不同的日志方法', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const errorMsg = ErrorHandler.createError(
        ERROR_CODES.UNKNOWN_ERROR,
        '错误',
        { severity: 'error' },
      )
      const warnMsg = ErrorHandler.createError(
        ERROR_CODES.UNKNOWN_ERROR,
        '警告',
        { severity: 'warn' },
      )
      const infoMsg = ErrorHandler.createError(
        ERROR_CODES.UNKNOWN_ERROR,
        '信息',
        { severity: 'info' },
      )

      errorHandler.logError(errorMsg)
      errorHandler.logError(warnMsg)
      errorHandler.logError(infoMsg)

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleLogSpy).toHaveBeenCalledTimes(1)

      consoleErrorSpy.mockRestore()
      consoleWarnSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })
  })

  describe('getSuggestion', () => {
    it('应该返回已知错误代码的建议', () => {
      const suggestion = errorHandler.getSuggestion(ERROR_CODES.FILE_NOT_FOUND)
      expect(suggestion).toContain('文件')
    })

    it('应该对未知错误代码返回undefined', () => {
      const suggestion = errorHandler.getSuggestion('UNKNOWN_CODE' as any)
      expect(suggestion).toBeUndefined()
    })
  })

  describe('getErrorSeverity', () => {
    it('应该返回错误代码的严重程度', () => {
      const severity = errorHandler.getErrorSeverity(ERROR_CODES.INVALID_CONFIG)
      expect(['error', 'warn', 'info']).toContain(severity)
    })

    it('应该对未知错误代码返回默认严重程度', () => {
      const severity = errorHandler.getErrorSeverity('UNKNOWN_CODE' as any)
      expect(severity).toBe('error')
    })
  })

  describe('getDocumentationUrl', () => {
    it('应该返回错误代码的文档链接', () => {
      const url = errorHandler.getDocumentationUrl(ERROR_CODES.INVALID_CONFIG)
      expect(url).toContain('http')
    })

    it('应该对未知错误代码返回通用链接', () => {
      const url = errorHandler.getDocumentationUrl('UNKNOWN_CODE' as any)
      expect(url).toContain('http')
    })
  })

  describe('错误映射', () => {
    it('应该正确映射文件系统错误', () => {
      const enoentError = new Error('ENOENT: no such file or directory')
      const eaccessError = new Error('EACCES: permission denied')
      const eexistError = new Error('EEXIST: file already exists')

      expect(errorHandler.handleError(enoentError).code).toBe(ERROR_CODES.FILE_NOT_FOUND)
      expect(errorHandler.handleError(eaccessError).code).toBe(ERROR_CODES.PERMISSION_DENIED)
      expect(errorHandler.handleError(eexistError).code).toBe(ERROR_CODES.FILE_ALREADY_EXISTS)
    })

    it('应该正确映射网络错误', () => {
      const networkError = new Error('getaddrinfo ENOTFOUND')
      const timeoutError = new Error('ETIMEDOUT')

      expect(errorHandler.handleError(networkError).code).toBe(ERROR_CODES.NETWORK_ERROR)
      expect(errorHandler.handleError(timeoutError).code).toBe(ERROR_CODES.NETWORK_ERROR)
    })

    it('应该正确映射配置错误', () => {
      const syntaxError = new SyntaxError('Unexpected token')
      const configError = new Error('Invalid configuration')

      expect(errorHandler.handleError(syntaxError).code).toBe(ERROR_CODES.INVALID_CONFIG)
      expect(errorHandler.handleError(configError).code).toBe(ERROR_CODES.INVALID_CONFIG)
    })
  })

  describe('边界情况', () => {
    it('应该处理循环引用对象', () => {
      const circularObj: any = { name: 'test' }
      circularObj.self = circularObj

      const error = new Error('Circular reference error')
      ;(error as any).data = circularObj

      expect(() => {
        errorHandler.handleError(error)
      }).not.toThrow()
    })

    it('应该处理非常长的错误消息', () => {
      const longMessage = 'x'.repeat(10000)
      const error = new Error(longMessage)

      const launcherError = errorHandler.handleError(error)
      expect(launcherError.message).toBe(longMessage)
    })

    it('应该处理特殊字符', () => {
      const specialMessage = '特殊字符测试 🚀 \n\t\r'
      const error = new Error(specialMessage)

      const launcherError = errorHandler.handleError(error)
      expect(launcherError.message).toBe(specialMessage)
    })
  })
})