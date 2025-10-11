/**
 * 统一错误处理工具
 *
 * 提供标准化的错误处理模式和工具函数
 *
 * @author LDesign Team
 * @version 2.0.0
 */

import { TimeUtils } from './common'

/**
 * 错误处理策略
 */
export enum ErrorHandlingStrategy {
  SILENT = 'SILENT',
  WARN = 'WARN',
  THROW = 'THROW',
  FALLBACK = 'FALLBACK',
}

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  operation: string
  locale?: string
  key?: string
  params?: Record<string, unknown>
  timestamp?: number
  metadata?: Record<string, unknown>
}

/**
 * 错误处理结果
 */
export interface ErrorHandlingResult<T = unknown> {
  success: boolean
  value?: T
  error?: Error
  fallbackUsed?: boolean
  retryCount?: number
}

/**
 * 重试配置
 */
export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

/**
 * 统一错误处理器
 */
export class UnifiedErrorHandler {
  private retryAttempts = new Map<string, number>()
  private errorHistory: Array<{ error: Error, context: ErrorContext, timestamp: number }> = []

  constructor(
    private strategy: ErrorHandlingStrategy = ErrorHandlingStrategy.WARN,
    private retryConfig: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
    },
  ) {}

  /**
   * 处理错误
   */
  handle<T>(
    error: Error,
    context: ErrorContext,
    fallbackValue?: T,
  ): ErrorHandlingResult<T> {
    // 记录错误历史
    this.recordError(error, context)

    switch (this.strategy) {
      case ErrorHandlingStrategy.SILENT:
        return { success: false, error, fallbackUsed: !!fallbackValue, value: fallbackValue }

      case ErrorHandlingStrategy.WARN:
        console.warn(`[I18n Warning] ${context.operation}:`, error.message, context)
        return { success: false, error, fallbackUsed: !!fallbackValue, value: fallbackValue }

      case ErrorHandlingStrategy.THROW:
        throw error

      case ErrorHandlingStrategy.FALLBACK:
        if (fallbackValue !== undefined) {
          return { success: true, value: fallbackValue, fallbackUsed: true }
        }
        console.warn(`[I18n Fallback Failed] ${context.operation}:`, error.message, context)
        return { success: false, error }

      default:
        return { success: false, error }
    }
  }

  /**
   * 带重试的错误处理
   */
  async handleWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    fallbackValue?: T,
  ): Promise<ErrorHandlingResult<T>> {
    const retryKey = this.getRetryKey(context)
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const result = await operation()
        // 成功时重置重试计数
        this.retryAttempts.delete(retryKey)
        return { success: true, value: result, retryCount: attempt }
      }
      catch (error) {
        lastError = error as Error

        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateDelay(attempt)
          await TimeUtils.delay(delay)
          this.retryAttempts.set(retryKey, attempt + 1)
        }
      }
    }

    // 所有重试都失败了
    this.retryAttempts.delete(retryKey)
    return this.handle(lastError!, context, fallbackValue)
  }

  /**
   * 安全执行函数
   */
  safeExecute<T>(
    fn: () => T,
    context: ErrorContext,
    fallbackValue?: T,
  ): ErrorHandlingResult<T> {
    try {
      const result = fn()
      return { success: true, value: result }
    }
    catch (error) {
      return this.handle(error as Error, context, fallbackValue)
    }
  }

  /**
   * 安全执行异步函数
   */
  async safeExecuteAsync<T>(
    fn: () => Promise<T>,
    context: ErrorContext,
    fallbackValue?: T,
  ): Promise<ErrorHandlingResult<T>> {
    try {
      const result = await fn()
      return { success: true, value: result }
    }
    catch (error) {
      return this.handle(error as Error, context, fallbackValue)
    }
  }

  /**
   * 批量错误处理
   */
  handleBatch<T>(
    operations: Array<{ fn: () => T, context: ErrorContext, fallback?: T }>,
    continueOnError = true,
  ): Array<ErrorHandlingResult<T>> {
    const results: Array<ErrorHandlingResult<T>> = []

    for (const { fn, context, fallback } of operations) {
      const result = this.safeExecute(fn, context, fallback)
      results.push(result)

      if (!continueOnError && !result.success) {
        break
      }
    }

    return results
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    totalErrors: number
    recentErrors: number
    errorsByOperation: Record<string, number>
    mostCommonErrors: Array<{ message: string, count: number }>
  } {
    const now = TimeUtils.now()
    const oneHourAgo = now - 60 * 60 * 1000

    const recentErrors = this.errorHistory.filter(entry => entry.timestamp > oneHourAgo)

    const errorsByOperation: Record<string, number> = {}
    const errorMessages: Record<string, number> = {}

    for (const entry of this.errorHistory) {
      const operation = entry.context.operation
      errorsByOperation[operation] = (errorsByOperation[operation] || 0) + 1

      const message = entry.error.message
      errorMessages[message] = (errorMessages[message] || 0) + 1
    }

    const mostCommonErrors = Object.entries(errorMessages)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalErrors: this.errorHistory.length,
      recentErrors: recentErrors.length,
      errorsByOperation,
      mostCommonErrors,
    }
  }

  /**
   * 清理错误历史
   */
  clearErrorHistory(): void {
    this.errorHistory = []
    this.retryAttempts.clear()
  }

  /**
   * 设置错误处理策略
   */
  setStrategy(strategy: ErrorHandlingStrategy): void {
    this.strategy = strategy
  }

  /**
   * 记录错误
   */
  private recordError(error: Error, context: ErrorContext): void {
    this.errorHistory.push({
      error,
      context: { ...context, timestamp: TimeUtils.now() },
      timestamp: TimeUtils.now(),
    })

    // 保持历史记录在合理范围内
    if (this.errorHistory.length > 1000) {
      this.errorHistory = this.errorHistory.slice(-500)
    }
  }

  /**
   * 生成重试键
   */
  private getRetryKey(context: ErrorContext): string {
    return `${context.operation}:${context.locale || ''}:${context.key || ''}`
  }

  /**
   * 计算重试延迟
   */
  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * this.retryConfig.backoffFactor ** attempt
    return Math.min(delay, this.retryConfig.maxDelay)
  }
}

/**
 * 错误处理装饰器
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  handler: UnifiedErrorHandler,
  context: Omit<ErrorContext, 'timestamp'>,
  fallbackValue?: ReturnType<T>,
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const fullContext: ErrorContext = {
        ...context,
        timestamp: TimeUtils.now(),
      }

      return handler.safeExecute(
        () => originalMethod.apply(this, args),
        fullContext,
        fallbackValue,
      )
    }

    return descriptor
  }
}

/**
 * 异步错误处理装饰器
 */
export function withAsyncErrorHandling<T extends (...args: any[]) => Promise<any>>(
  handler: UnifiedErrorHandler,
  context: Omit<ErrorContext, 'timestamp'>,
  fallbackValue?: Awaited<ReturnType<T>>,
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const fullContext: ErrorContext = {
        ...context,
        timestamp: TimeUtils.now(),
      }

      return handler.safeExecuteAsync(
        () => originalMethod.apply(this, args),
        fullContext,
        fallbackValue,
      )
    }

    return descriptor
  }
}

/**
 * 创建默认错误处理器
 */
export function createDefaultErrorHandler(strategy?: ErrorHandlingStrategy): UnifiedErrorHandler {
  return new UnifiedErrorHandler(strategy)
}
