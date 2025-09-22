/**
 * 错误处理工具
 * 
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */

import { ErrorCode, ERROR_MESSAGES, ERROR_SUGGESTIONS } from '../constants/errors'
import type { Logger } from './logger'

/**
 * 构建器错误类
 */
export class BuilderError extends Error {
  public readonly code: ErrorCode
  public readonly suggestion?: string
  public readonly details?: any
  public readonly phase?: string
  public readonly file?: string
  public readonly cause?: Error

  constructor(
    code: ErrorCode,
    message?: string,
    options: {
      suggestion?: string
      details?: any
      phase?: string
      file?: string
      cause?: Error
    } = {}
  ) {
    const errorMessage = message || ERROR_MESSAGES[code] || '未知错误'
    super(errorMessage)

    this.name = 'BuilderError'
    this.code = code
    this.suggestion = options.suggestion || ERROR_SUGGESTIONS[code]
    this.details = options.details
    this.phase = options.phase
    this.file = options.file

    if (options.cause) {
      this.cause = options.cause
    }

    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BuilderError)
    }
  }

  /**
   * 获取完整的错误信息
   */
  getFullMessage(): string {
    let message = `[${this.code}] ${this.message}`

    if (this.phase) {
      message += ` (阶段: ${this.phase})`
    }

    if (this.file) {
      message += ` (文件: ${this.file})`
    }

    if (this.suggestion) {
      message += `\n建议: ${this.suggestion}`
    }

    return message
  }

  /**
   * 转换为 JSON 格式
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
      details: this.details,
      phase: this.phase,
      file: this.file,
      stack: this.stack
    }
  }
}

/**
 * 错误处理器选项
 */
export interface ErrorHandlerOptions {
  /** 日志记录器 */
  logger?: Logger

  /** 是否显示堆栈跟踪 */
  showStack?: boolean

  /** 是否显示建议 */
  showSuggestions?: boolean

  /** 错误回调 */
  onError?: (error: Error) => void

  /** 是否退出进程 */
  exitOnError?: boolean

  /** 退出码 */
  exitCode?: number
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  private logger?: Logger
  private showStack: boolean
  private showSuggestions: boolean
  private onError?: (error: Error) => void
  private exitOnError: boolean
  private exitCode: number

  constructor(options: ErrorHandlerOptions = {}) {
    this.logger = options.logger
    this.showStack = options.showStack ?? false
    this.showSuggestions = options.showSuggestions ?? true
    this.onError = options.onError
    this.exitOnError = options.exitOnError ?? false
    this.exitCode = options.exitCode ?? 1
  }

  /**
   * 处理错误
   */
  handle(error: Error, context?: string): void {
    // 调用错误回调
    if (this.onError) {
      try {
        this.onError(error)
      } catch (callbackError) {
        this.logger?.error('错误回调执行失败:', callbackError)
      }
    }

    // 记录错误日志
    this.logError(error, context)

    // 是否退出进程
    if (this.exitOnError) {
      process.exit(this.exitCode)
    }
  }

  /**
   * 处理异步错误 - 优化性能，避免不必要的Promise包装
   */
  async handleAsync(error: Error, context?: string): Promise<void> {
    // 直接调用同步处理方法，避免Promise包装开销
    this.handle(error, context)
  }

  /**
   * 批量处理错误
   */
  handleBatch(errors: Array<{ error: Error; context?: string }>): void {
    if (errors.length === 0) return

    this.logger?.info(`批量处理 ${errors.length} 个错误`)

    for (const { error, context } of errors) {
      try {
        this.handle(error, context)
      } catch (handlerError) {
        // 防止错误处理器本身出错导致的无限循环
        console.error('错误处理器执行失败:', handlerError)
      }
    }
  }

  /**
   * 错误恢复机制
   */
  async recover<T>(
    fn: () => T | Promise<T>,
    fallback?: T | (() => T | Promise<T>),
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await Promise.resolve(fn())
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        this.logger?.warn(`Attempt ${i + 1} failed:`, lastError.message)
        
        if (i === maxRetries) {
          break
        }
        
        // 指数退避
        const delay = Math.min(1000 * Math.pow(2, i), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // 尝试使用降级方案
    if (fallback !== undefined) {
      try {
        return typeof fallback === 'function' ? await (fallback as () => T | Promise<T>)() : fallback
      } catch (fallbackError) {
        this.logger?.error('Fallback also failed:', fallbackError)
      }
    }
    
    throw lastError
  }

  /**
   * 包装函数以处理错误
   */
  wrap<TArgs extends readonly unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    context?: string
  ): (...args: TArgs) => TReturn {
    return ((...args: TArgs) => {
      try {
        const result = fn(...args)

        // 处理 Promise
        if (result && typeof result === 'object' && 'catch' in result && typeof result.catch === 'function') {
          return (result as unknown as Promise<unknown>).catch((error: unknown) => {
            const err = error instanceof Error ? error : new Error(String(error))
            this.handle(err, context)
            throw err
          }) as TReturn
        }

        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        this.handle(err, context)
        throw err
      }
    })
  }

  /**
   * 包装异步函数以处理错误
   */
  wrapAsync<TArgs extends readonly unknown[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    context?: string
  ): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs) => {
      try {
        return await fn(...args)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        await this.handleAsync(err, context)
        throw err
      }
    }
  }

  /**
   * 创建构建器错误
   */
  createError(
    code: ErrorCode,
    message?: string,
    options?: {
      suggestion?: string
      details?: any
      phase?: string
      file?: string
      cause?: Error
    }
  ): BuilderError {
    return new BuilderError(code, message, options)
  }

  /**
   * 抛出构建器错误
   */
  throwError(
    code: ErrorCode,
    message?: string,
    options?: {
      suggestion?: string
      details?: any
      phase?: string
      file?: string
      cause?: Error
    }
  ): never {
    throw this.createError(code, message, options)
  }

  /**
   * 格式化错误信息
   */
  formatError(error: Error, includeStack?: boolean): string {
    const showStack = includeStack ?? this.showStack

    if (isBuilderError(error)) {
      return error.getFullMessage()
    }

    let message = error.message
    if (showStack && error.stack) {
      message += `\n${error.stack}`
    }

    return message
  }

  /**
   * 获取错误建议
   */
  getSuggestions(error: Error): string[] {
    if (isBuilderError(error) && error.suggestion) {
      return [error.suggestion]
    }

    // 根据错误类型提供通用建议
    const suggestions: string[] = []

    if (error.message.includes('ENOENT')) {
      suggestions.push('检查文件或目录是否存在')
    }

    if (error.message.includes('EACCES')) {
      suggestions.push('检查文件权限')
    }

    if (error.message.includes('MODULE_NOT_FOUND')) {
      suggestions.push('运行 npm install 安装依赖')
    }

    return suggestions
  }

  /**
   * 记录错误日志
   */
  private logError(error: Error, context?: string): void {
    if (!this.logger) {
      console.error(error)
      return
    }

    // 构建错误消息
    let message = error.message
    if (context) {
      message = `${context}: ${message}`
    }

    // 记录基本错误信息
    this.logger.error(message)

    // 如果是构建器错误，显示额外信息
    if (error instanceof BuilderError) {
      if (error.phase) {
        this.logger.error(`阶段: ${error.phase}`)
      }

      if (error.file) {
        this.logger.error(`文件: ${error.file}`)
      }

      if (error.details) {
        this.logger.debug('错误详情:', error.details)
      }

      if (this.showSuggestions && error.suggestion) {
        this.logger.info(`建议: ${error.suggestion}`)
      }
    }

    // 显示堆栈跟踪
    if (this.showStack && error.stack) {
      this.logger.debug('堆栈跟踪:')
      this.logger.debug(error.stack)
    }

    // 显示原因链
    if ((error as any).cause) {
      this.logger.debug('原因:')
      this.logError((error as any).cause as Error)
    }
  }
}

/**
 * 默认错误处理器实例
 */
export const errorHandler = new ErrorHandler()

/**
 * 创建错误处理器
 */
export function createErrorHandler(options: ErrorHandlerOptions = {}): ErrorHandler {
  return new ErrorHandler(options)
}

/**
 * 处理未捕获的异常
 */
export function setupGlobalErrorHandling(handler: ErrorHandler = errorHandler): void {
  // 处理未捕获的异常
  process.on('uncaughtException', (error) => {
    handler.handle(error, '未捕获的异常')
    process.exit(1)
  })

  // 处理未处理的 Promise 拒绝
  process.on('unhandledRejection', (reason, _promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason))
    handler.handle(error, '未处理的 Promise 拒绝')
  })

  // 处理警告
  process.on('warning', (warning) => {
    if (handler['logger']) {
      handler['logger'].warn(`Node.js 警告: ${warning.message}`)
    }
  })
}

/**
 * 判断是否为构建器错误
 */
export function isBuilderError(error: any): error is BuilderError {
  return error instanceof BuilderError
}

/**
 * 从错误中提取错误码
 */
export function getErrorCode(error: Error): ErrorCode | undefined {
  if (isBuilderError(error)) {
    return error.code
  }
  return undefined
}

/**
 * 格式化错误信息
 */
export function formatError(error: Error, includeStack: boolean = false): string {
  if (isBuilderError(error)) {
    return error.getFullMessage()
  }

  let message = error.message
  if (includeStack && error.stack) {
    message += `\n${error.stack}`
  }

  return message
}
