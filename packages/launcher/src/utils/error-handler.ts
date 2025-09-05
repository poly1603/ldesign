/**
 * 错误处理器
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from './logger'

export interface ErrorHandlerOptions {
  logger?: Logger
  exitOnError?: boolean
  maxRetries?: number
  retryDelay?: number
}

export interface ErrorContext {
  operation?: string
  component?: string
  metadata?: Record<string, any>
  timestamp?: number
}

export class LauncherError extends Error {
  public readonly code: string
  public readonly context: ErrorContext
  public readonly originalError?: Error

  constructor(
    message: string,
    code: string = 'LAUNCHER_ERROR',
    context: ErrorContext = {},
    originalError?: Error
  ) {
    super(message)
    this.name = 'LauncherError'
    this.code = code
    this.context = {
      ...context,
      timestamp: context.timestamp || Date.now()
    }
    this.originalError = originalError

    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LauncherError)
    }
  }
}

export class ErrorHandler {
  private logger: Logger
  private exitOnError: boolean
  private maxRetries: number
  private retryDelay: number
  private retryCount = new Map<string, number>()

  constructor(options: ErrorHandlerOptions = {}) {
    this.logger = options.logger || new Logger('ErrorHandler')
    this.exitOnError = options.exitOnError !== false
    this.maxRetries = options.maxRetries || 3
    this.retryDelay = options.retryDelay || 1000
  }

  /**
   * 处理错误
   */
  handle(error: Error | LauncherError, context: ErrorContext = {}): void {
    const launcherError = error instanceof LauncherError 
      ? error 
      : new LauncherError(error.message, 'UNKNOWN_ERROR', context, error)

    // 记录错误
    this.logError(launcherError)

    // 根据错误类型决定是否退出
    if (this.shouldExit(launcherError)) {
      this.logger.error('严重错误，程序即将退出')
      if (this.exitOnError) {
        process.exit(1)
      }
    }
  }

  /**
   * 包装异步函数，自动处理错误
   */
  async wrap<T>(
    fn: () => Promise<T>,
    context: ErrorContext = {}
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      this.handle(error as Error, context)
      throw error
    }
  }

  /**
   * 带重试的异步函数执行
   */
  async retry<T>(
    fn: () => Promise<T>,
    context: ErrorContext = {},
    maxRetries?: number
  ): Promise<T> {
    const retries = maxRetries || this.maxRetries
    const operation = context.operation || 'unknown'
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await fn()
        // 成功后重置重试计数
        this.retryCount.delete(operation)
        return result
      } catch (error) {
        const isLastAttempt = attempt === retries
        
        if (isLastAttempt) {
          this.handle(error as Error, {
            ...context,
            metadata: {
              ...context.metadata,
              attempts: attempt,
              maxRetries: retries
            }
          })
          throw error
        }

        this.logger.warn(`操作失败，正在重试 (${attempt}/${retries})`, {
          operation,
          error: (error as Error).message
        })

        // 等待后重试
        await this.delay(this.retryDelay * attempt)
      }
    }

    throw new LauncherError('重试次数已用完', 'MAX_RETRIES_EXCEEDED', context)
  }

  /**
   * 创建错误
   */
  createError(
    message: string,
    code: string = 'LAUNCHER_ERROR',
    context: ErrorContext = {}
  ): LauncherError {
    return new LauncherError(message, code, context)
  }

  /**
   * 检查是否为特定类型的错误
   */
  isErrorType(error: Error, code: string): boolean {
    return error instanceof LauncherError && error.code === code
  }

  /**
   * 获取错误的详细信息
   */
  getErrorDetails(error: Error): {
    message: string
    code: string
    context: ErrorContext
    stack?: string
  } {
    if (error instanceof LauncherError) {
      return {
        message: error.message,
        code: error.code,
        context: error.context,
        stack: error.stack
      }
    }

    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      context: {},
      stack: error.stack
    }
  }

  private logError(error: LauncherError): void {
    const details = {
      code: error.code,
      context: error.context,
      originalError: error.originalError?.message
    }

    this.logger.error(error.message, details)

    // 在调试模式下显示堆栈跟踪
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      this.logger.debug('错误堆栈跟踪:', error.stack)
      if (error.originalError?.stack) {
        this.logger.debug('原始错误堆栈:', error.originalError.stack)
      }
    }
  }

  private shouldExit(error: LauncherError): boolean {
    // 定义需要退出的错误类型
    const fatalErrorCodes = [
      'INIT_FAILED',
      'CONFIG_INVALID',
      'DEPENDENCY_MISSING',
      'PERMISSION_DENIED'
    ]

    return fatalErrorCodes.includes(error.code)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 创建默认实例
export const errorHandler = new ErrorHandler()

// 便捷函数
export const handleError = (error: Error, context?: ErrorContext) => 
  errorHandler.handle(error, context)

export const createError = (message: string, code?: string, context?: ErrorContext) =>
  errorHandler.createError(message, code, context)

export const withErrorHandling = <T>(fn: () => Promise<T>, context?: ErrorContext) =>
  errorHandler.wrap(fn, context)

export const withRetry = <T>(fn: () => Promise<T>, context?: ErrorContext, maxRetries?: number) =>
  errorHandler.retry(fn, context, maxRetries)
