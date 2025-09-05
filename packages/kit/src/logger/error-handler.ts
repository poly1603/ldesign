/**
 * 错误处理器
 * 提供全局错误处理和错误日志记录功能
 */

import type { Logger } from './logger'

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  logger?: Logger
  exitOnError?: boolean
  captureRejections?: boolean
  captureExceptions?: boolean
  logStackTrace?: boolean
  logErrorDetails?: boolean
  errorFilter?: (error: Error) => boolean
  onError?: (error: Error, context?: any) => void
}

/**
 * 错误信息
 */
export interface ErrorInfo {
  message: string
  stack?: string
  name: string
  code?: string | number
  timestamp: Date
  context?: any
  handled: boolean
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  private options: Required<ErrorHandlerOptions>
  private errors: ErrorInfo[] = []
  private maxErrors = 1000
  private isHandlingError = false

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      logger: options.logger,
      exitOnError: options.exitOnError || false,
      captureRejections: options.captureRejections !== false,
      captureExceptions: options.captureExceptions !== false,
      logStackTrace: options.logStackTrace !== false,
      logErrorDetails: options.logErrorDetails !== false,
      errorFilter: options.errorFilter || (() => true),
      onError: options.onError || (() => {}),
    } as Required<ErrorHandlerOptions>

    this.setupGlobalHandlers()
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalHandlers(): void {
    if (this.options.captureExceptions) {
      process.on('uncaughtException', (error) => {
        this.handleError(error, { type: 'uncaughtException' })
        if (this.options.exitOnError) {
          process.exit(1)
        }
      })
    }

    if (this.options.captureRejections) {
      process.on('unhandledRejection', (reason, promise) => {
        const error = reason instanceof Error ? reason : new Error(String(reason))
        this.handleError(error, { type: 'unhandledRejection', promise })
        if (this.options.exitOnError) {
          process.exit(1)
        }
      })
    }

    // 监听进程退出
    process.on('exit', (code) => {
      if (this.options.logger) {
        this.options.logger.info(`Process exiting with code: ${code}`)
      }
    })

    // 监听 SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      if (this.options.logger) {
        this.options.logger.info('Received SIGINT, shutting down gracefully')
      }
      process.exit(0)
    })

    // 监听 SIGTERM
    process.on('SIGTERM', () => {
      if (this.options.logger) {
        this.options.logger.info('Received SIGTERM, shutting down gracefully')
      }
      process.exit(0)
    })
  }

  /**
   * 处理错误
   */
  handleError(error: Error, context?: any): void {
    // 防止递归错误处理
    if (this.isHandlingError) {
      console.error('Error in error handler:', error)
      return
    }

    this.isHandlingError = true

    try {
      // 应用错误过滤器
      if (!this.options.errorFilter(error)) {
        return
      }

      // 创建错误信息
      const errorInfo: ErrorInfo = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: (error as any).code,
        timestamp: new Date(),
        context,
        handled: true,
      }

      // 添加到错误列表
      this.addError(errorInfo)

      // 记录日志
      this.logError(error, context)

      // 调用自定义错误处理器
      this.options.onError(error, context)
    }
    finally {
      this.isHandlingError = false
    }
  }

  /**
   * 添加错误到列表
   */
  private addError(errorInfo: ErrorInfo): void {
    this.errors.unshift(errorInfo)

    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }
  }

  /**
   * 记录错误日志
   */
  private logError(error: Error, context?: any): void {
    if (!this.options.logger) {
      console.error('Error:', error.message)
      if (this.options.logStackTrace && error.stack) {
        console.error('Stack:', error.stack)
      }
      if (this.options.logErrorDetails && context) {
        console.error('Context:', context)
      }
      return
    }

    const message = error.message
    const data: any = {}

    if (this.options.logErrorDetails) {
      data.name = error.name
      data.code = (error as any).code
      data.context = context
    }

    if (this.options.logStackTrace && error.stack) {
      data.stack = error.stack
    }

    this.options.logger.error(message, Object.keys(data).length > 0 ? data : undefined)
  }

  /**
   * 包装函数以捕获错误
   */
  wrap<T extends (...args: any[]) => any>(fn: T, context?: any): T {
    return ((...args: any[]) => {
      try {
        const result = fn(...args)

        // 如果返回 Promise，捕获 rejection
        if (result && typeof result.catch === 'function') {
          return result.catch((error: Error) => {
            this.handleError(error, { ...context, function: fn.name, args })
            throw error
          })
        }

        return result
      }
      catch (error) {
        this.handleError(error as Error, { ...context, function: fn.name, args })
        throw error
      }
    }) as T
  }

  /**
   * 包装异步函数以捕获错误
   */
  wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T, context?: any): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args)
      }
      catch (error) {
        this.handleError(error as Error, { ...context, function: fn.name, args })
        throw error
      }
    }) as T
  }

  /**
   * 安全执行函数
   */
  safe<T>(fn: () => T, defaultValue?: T, context?: any): T | undefined {
    try {
      return fn()
    }
    catch (error) {
      this.handleError(error as Error, { ...context, function: fn.name })
      return defaultValue
    }
  }

  /**
   * 安全执行异步函数
   */
  async safeAsync<T>(
    fn: () => Promise<T>,
    defaultValue?: T,
    context?: any,
  ): Promise<T | undefined> {
    try {
      return await fn()
    }
    catch (error) {
      this.handleError(error as Error, { ...context, function: fn.name })
      return defaultValue
    }
  }

  /**
   * 获取错误列表
   */
  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  /**
   * 获取最近的错误
   */
  getRecentErrors(count = 10): ErrorInfo[] {
    return this.errors.slice(0, count)
  }

  /**
   * 按类型过滤错误
   */
  getErrorsByType(type: string): ErrorInfo[] {
    return this.errors.filter(error => error.context?.type === type || error.name === type)
  }

  /**
   * 按时间范围获取错误
   */
  getErrorsByTimeRange(start: Date, end: Date): ErrorInfo[] {
    return this.errors.filter(error => error.timestamp >= start && error.timestamp <= end)
  }

  /**
   * 清空错误列表
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): ErrorStats {
    const total = this.errors.length
    const byType: Record<string, number> = {}
    const byName: Record<string, number> = {}

    for (const error of this.errors) {
      const type = error.context?.type || 'unknown'
      byType[type] = (byType[type] || 0) + 1
      byName[error.name] = (byName[error.name] || 0) + 1
    }

    const recent = this.getRecentErrors(24).length // 最近24个错误
    const lastError = this.errors[0]

    return {
      total,
      recent,
      byType,
      byName,
      lastError: lastError
        ? {
            message: lastError.message,
            name: lastError.name,
            timestamp: lastError.timestamp,
          }
        : undefined,
    }
  }

  /**
   * 导出错误报告
   */
  exportErrorReport(format: 'json' | 'csv' | 'txt' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            stats: this.getErrorStats(),
            errors: this.errors,
          },
          null,
          2,
        )

      case 'csv': {
        const headers = ['timestamp', 'name', 'message', 'code', 'context']
        const rows = this.errors.map(error => [
          error.timestamp.toISOString(),
          error.name,
          `"${error.message.replace(/"/g, '""')}"`,
          error.code || '',
          error.context ? `"${JSON.stringify(error.context).replace(/"/g, '""')}"` : '',
        ])
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      }

      case 'txt':
        return this.errors
          .map((error) => {
            const timestamp = error.timestamp.toISOString()
            const context = error.context ? ` | Context: ${JSON.stringify(error.context)}` : ''
            const stack = error.stack ? `\nStack: ${error.stack}` : ''
            return `[${timestamp}] [${error.name}] ${error.message}${context}${stack}`
          })
          .join('\n\n')

      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * 设置最大错误数量
   */
  setMaxErrors(max: number): void {
    this.maxErrors = max
    if (this.errors.length > max) {
      this.errors = this.errors.slice(0, max)
    }
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<ErrorHandlerOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 销毁错误处理器
   */
  destroy(): void {
    process.removeAllListeners('uncaughtException')
    process.removeAllListeners('unhandledRejection')
    this.clearErrors()
  }

  /**
   * 创建错误处理器实例
   */
  static create(options?: ErrorHandlerOptions): ErrorHandler {
    return new ErrorHandler(options)
  }

  /**
   * 创建全局错误处理器
   */
  static createGlobal(logger?: Logger): ErrorHandler {
    return new ErrorHandler({
      logger,
      captureExceptions: true,
      captureRejections: true,
      logStackTrace: true,
      logErrorDetails: true,
    })
  }
}

/**
 * 错误统计
 */
export interface ErrorStats {
  total: number
  recent: number
  byType: Record<string, number>
  byName: Record<string, number>
  lastError?: {
    message: string
    name: string
    timestamp: Date
  }
}
