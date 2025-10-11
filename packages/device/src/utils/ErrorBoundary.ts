/**
 * 错误信息
 */
export interface ErrorInfo {
  /** 错误对象 */
  error: Error
  /** 错误时间戳 */
  timestamp: number
  /** 错误上下文 */
  context?: string
  /** 错误堆栈 */
  stack?: string
  /** 额外信息 */
  metadata?: Record<string, unknown>
}

/**
 * 错误处理器
 */
export type ErrorHandler = (error: ErrorInfo) => void | Promise<void>

/**
 * 恢复策略
 */
export type RecoveryStrategy = (error: ErrorInfo) => boolean | Promise<boolean>

/**
 * 错误边界选项
 */
export interface ErrorBoundaryOptions {
  /** 错误处理器 */
  onError?: ErrorHandler
  /** 恢复策略 */
  recoveryStrategy?: RecoveryStrategy
  /** 是否启用日志 */
  enableLogging?: boolean
  /** 最大错误数量 */
  maxErrors?: number
  /** 错误重试次数 */
  maxRetries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 是否启用全局错误捕获 */
  catchGlobalErrors?: boolean
}

/**
 * 错误边界
 * 
 * 功能：
 * - 捕获并处理各类错误
 * - 提供优雅的错误恢复机制
 * - 错误日志记录和分析
 * - 自动重试
 * - 错误统计和监控
 * 
 * @example
 * ```typescript
 * const errorBoundary = ErrorBoundary.getInstance({
 *   onError: (error) => {
 *     console.error('Error caught:', error)
 *     // 发送错误到监控系统
 *   },
 *   recoveryStrategy: async (error) => {
 *     // 尝试恢复
 *     return true
 *   },
 *   maxRetries: 3
 * })
 * 
 * // 包装异步函数
 * const safeFunction = errorBoundary.wrap(async () => {
 *   // 可能抛出错误的代码
 * })
 * 
 * // 捕获错误
 * try {
 *   await safeFunction()
 * } catch (error) {
 *   // 错误已被处理
 * }
 * ```
 */
export class ErrorBoundary {
  private static instance: ErrorBoundary
  private options: Required<ErrorBoundaryOptions>
  private errorHistory: ErrorInfo[] = []
  private errorHandlers: Set<ErrorHandler> = new Set()
  private retryAttempts: Map<string, number> = new Map()

  // 错误统计
  private stats = {
    totalErrors: 0,
    handledErrors: 0,
    unhandledErrors: 0,
    recoveredErrors: 0,
  }

  private constructor(options: ErrorBoundaryOptions = {}) {
    this.options = {
      onError: options.onError ?? (() => {}),
      recoveryStrategy: options.recoveryStrategy ?? (() => false),
      enableLogging: options.enableLogging ?? true,
      maxErrors: options.maxErrors ?? 100,
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      catchGlobalErrors: options.catchGlobalErrors ?? true,
    }

    if (this.options.catchGlobalErrors) {
      this.setupGlobalErrorHandlers()
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(options?: ErrorBoundaryOptions): ErrorBoundary {
    if (!ErrorBoundary.instance) {
      ErrorBoundary.instance = new ErrorBoundary(options)
    }
    return ErrorBoundary.instance
  }

  /**
   * 包装函数以捕获错误
   */
  wrap<T extends (...args: any[]) => any>(
    fn: T,
    context?: string,
  ): T {
    const boundary = this

    return (async function wrappedFunction(...args: Parameters<T>) {
      const key = `${context || fn.name}`
      let attempts = boundary.retryAttempts.get(key) || 0

      while (attempts <= boundary.options.maxRetries) {
        try {
          const result = await fn(...args)
          // 成功后重置重试次数
          boundary.retryAttempts.delete(key)
          return result
        }
        catch (error) {
          const err = error instanceof Error ? error : new Error(String(error))
          const errorInfo: ErrorInfo = {
            error: err,
            timestamp: Date.now(),
            context,
            stack: err.stack,
          }

          boundary.handleError(errorInfo)

          // 尝试恢复
          const recovered = await boundary.attemptRecovery(errorInfo)

          if (recovered && attempts < boundary.options.maxRetries) {
            attempts++
            boundary.retryAttempts.set(key, attempts)
            await boundary.delay(boundary.options.retryDelay * attempts)
            continue
          }

          // 无法恢复，抛出错误
          boundary.retryAttempts.delete(key)
          throw err
        }
      }
    }) as T
  }

  /**
   * 捕获同步函数错误
   */
  try<T>(fn: () => T, defaultValue?: T): T | undefined {
    try {
      return fn()
    }
    catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.handleError({
        error: err,
        timestamp: Date.now(),
        stack: err.stack,
      })
      return defaultValue
    }
  }

  /**
   * 捕获异步函数错误
   */
  async tryAsync<T>(
    fn: () => Promise<T>,
    defaultValue?: T,
  ): Promise<T | undefined> {
    try {
      return await fn()
    }
    catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.handleError({
        error: err,
        timestamp: Date.now(),
        stack: err.stack,
      })
      return defaultValue
    }
  }

  /**
   * 添加错误处理器
   */
  addErrorHandler(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler)
    return () => this.errorHandlers.delete(handler)
  }

  /**
   * 手动处理错误
   */
  captureError(
    error: Error,
    context?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const errorInfo: ErrorInfo = {
      error,
      timestamp: Date.now(),
      context,
      stack: error.stack,
      metadata,
    }
    this.handleError(errorInfo)
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(): ErrorInfo[] {
    return [...this.errorHistory]
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory(): void {
    this.errorHistory = []
  }

  /**
   * 获取错误统计
   */
  getStats() {
    return {
      ...this.stats,
      errorHistory: this.errorHistory.length,
      errorRate: this.stats.totalErrors > 0
        ? this.stats.handledErrors / this.stats.totalErrors
        : 0,
      recoveryRate: this.stats.totalErrors > 0
        ? this.stats.recoveredErrors / this.stats.totalErrors
        : 0,
    }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      totalErrors: 0,
      handledErrors: 0,
      unhandledErrors: 0,
      recoveredErrors: 0,
    }
  }

  /**
   * 销毁错误边界
   */
  destroy(): void {
    this.clearErrorHistory()
    this.errorHandlers.clear()
    this.retryAttempts.clear()
    this.removeGlobalErrorHandlers()
  }

  // ==================== 私有方法 ====================

  /**
   * 处理错误
   */
  private async handleError(errorInfo: ErrorInfo): Promise<void> {
    this.stats.totalErrors++

    // 记录错误历史
    this.errorHistory.push(errorInfo)
    if (this.errorHistory.length > this.options.maxErrors) {
      this.errorHistory.shift()
    }

    // 日志记录
    if (this.options.enableLogging) {
      this.logError(errorInfo)
    }

    // 调用所有错误处理器
    try {
      await this.options.onError(errorInfo)
      for (const handler of this.errorHandlers) {
        await handler(errorInfo)
      }
      this.stats.handledErrors++
    }
    catch (handlerError) {
      this.stats.unhandledErrors++
      console.error('Error in error handler:', handlerError)
    }
  }

  /**
   * 尝试恢复
   */
  private async attemptRecovery(errorInfo: ErrorInfo): Promise<boolean> {
    try {
      const recovered = await this.options.recoveryStrategy(errorInfo)
      if (recovered) {
        this.stats.recoveredErrors++
        if (this.options.enableLogging) {
          console.info('Successfully recovered from error:', errorInfo.error.message)
        }
      }
      return recovered
    }
    catch (error) {
      console.error('Error during recovery attempt:', error)
      return false
    }
  }

  /**
   * 记录错误日志
   */
  private logError(errorInfo: ErrorInfo): void {
    const { error, context, timestamp, metadata } = errorInfo

    console.group('🚨 Error Caught by ErrorBoundary')
    console.error('Error:', error.message)
    if (context) {
      console.error('Context:', context)
    }
    console.error('Timestamp:', new Date(timestamp).toISOString())
    if (metadata) {
      console.error('Metadata:', metadata)
    }
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    console.groupEnd()
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalErrorHandlers(): void {
    // 捕获未处理的错误
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError)
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
    }

    // Node.js 环境
    if (typeof process !== 'undefined') {
      process.on('uncaughtException', this.handleProcessError)
      process.on('unhandledRejection', this.handleProcessRejection)
    }
  }

  /**
   * 移除全局错误处理器
   */
  private removeGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleGlobalError)
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
    }

    if (typeof process !== 'undefined') {
      process.off('uncaughtException', this.handleProcessError)
      process.off('unhandledRejection', this.handleProcessRejection)
    }
  }

  /**
   * 处理全局错误
   */
  private handleGlobalError = (event: ErrorEvent) => {
    const error = event.error || new Error(event.message)
    this.captureError(error, 'Global Error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  }

  /**
   * 处理未处理的 Promise 拒绝
   */
  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason))
    this.captureError(error, 'Unhandled Promise Rejection')
  }

  /**
   * 处理 Node.js 进程错误
   */
  private handleProcessError = (error: Error) => {
    this.captureError(error, 'Uncaught Exception')
  }

  /**
   * 处理 Node.js 进程未处理的 Promise 拒绝
   */
  private handleProcessRejection = (reason: unknown) => {
    const error = reason instanceof Error ? reason : new Error(String(reason))
    this.captureError(error, 'Unhandled Rejection')
  }
}

/**
 * 装饰器：为类方法添加错误边界
 */
export function ErrorBoundaryDecorator(
  context?: string,
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value
    const boundary = ErrorBoundary.getInstance()

    descriptor.value = boundary.wrap(
      originalMethod,
      context || `${target.constructor.name}.${String(propertyKey)}`,
    )

    return descriptor
  }
}

/**
 * 创建错误边界高阶函数
 */
export function createErrorBoundary(options?: ErrorBoundaryOptions) {
  // 使用单例模式的 getInstance 而不是直接 new
  const boundary = ErrorBoundary.getInstance(options)

  return {
    wrap: boundary.wrap.bind(boundary),
    try: boundary.try.bind(boundary),
    tryAsync: boundary.tryAsync.bind(boundary),
    captureError: boundary.captureError.bind(boundary),
    getStats: boundary.getStats.bind(boundary),
    destroy: boundary.destroy.bind(boundary),
  }
}
