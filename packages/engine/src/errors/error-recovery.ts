/**
 * 错误恢复系统
 * 🛡️ 提供自动错误恢复、重试策略和降级处理
 */

import type { ErrorHandler } from '../types/enhanced'

/**
 * 错误恢复策略
 */
export interface RecoveryStrategy<T = unknown> {
  /** 策略名称 */
  name: string
  /** 是否可以处理该错误 */
  canHandle: (error: Error) => boolean
  /** 恢复处理 */
  recover: (error: Error, context?: Record<string, unknown>) => Promise<T>
  /** 优先级（数值越大优先级越高） */
  priority?: number
}

/**
 * 重试策略
 */
export interface RetryStrategy {
  /** 最大重试次数 */
  maxAttempts: number
  /** 重试延迟（毫秒） */
  delay: number | ((attempt: number) => number)
  /** 是否应该重试 */
  shouldRetry?: (error: Error, attempt: number) => boolean
  /** 重试前的处理 */
  onRetry?: (error: Error, attempt: number) => void
}

/**
 * 降级策略
 */
export interface FallbackStrategy<T = unknown> {
  /** 降级值或函数 */
  fallback: T | ((error: Error) => T)
  /** 是否应该降级 */
  shouldFallback?: (error: Error) => boolean
  /** 降级时的通知 */
  onFallback?: (error: Error, fallbackValue: T) => void
}

/**
 * 错误上下文
 */
export interface ErrorContext extends Record<string, unknown> {
  /** 错误发生的组件/模块 */
  component?: string
  /** 错误发生的操作 */
  operation?: string
  /** 用户信息 */
  user?: Record<string, unknown>
  /** 请求信息 */
  request?: Record<string, unknown>
  /** 附加数据 */
  metadata?: Record<string, unknown>
  /** 错误发生时间 */
  timestamp: number
  /** 错误ID */
  errorId: string
}

/**
 * 错误报告
 */
export interface ErrorReport {
  /** 错误信息 */
  error: Error
  /** 错误上下文 */
  context: ErrorContext
  /** 错误级别 */
  level: 'critical' | 'error' | 'warning' | 'info'
  /** 是否已恢复 */
  recovered: boolean
  /** 恢复策略 */
  recoveryStrategy?: string
  /** 重试次数 */
  retryCount?: number
  /** 堆栈跟踪 */
  stackTrace?: string
}

/**
 * 错误恢复管理器
 */
export class ErrorRecoveryManager {
  private strategies: RecoveryStrategy[] = []
  private errorHistory: ErrorReport[] = []
  private errorHandlers: Map<string, ErrorHandler> = new Map()
  private globalErrorHandler?: ErrorHandler
  private maxHistorySize = 100

  constructor(private config?: {
    enableAutoRecovery?: boolean
    enableErrorReporting?: boolean
    reportingEndpoint?: string
    maxHistorySize?: number
  }) {
    if (config?.maxHistorySize) {
      this.maxHistorySize = config.maxHistorySize
    }
    this.setupGlobalErrorHandling()
  }

  /**
   * 设置全局错误处理
   */
  private setupGlobalErrorHandling(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError(event.error, {
          component: 'window',
          operation: 'global'
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(new Error(event.reason), {
          component: 'promise',
          operation: 'unhandled-rejection'
        })
      })
    }
  }

  /**
   * 注册恢复策略
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy)
    // 按优先级排序
    this.strategies.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * 注册错误处理器
   */
  registerErrorHandler(type: string, handler: ErrorHandler): void {
    this.errorHandlers.set(type, handler)
  }

  /**
   * 设置全局错误处理器
   */
  setGlobalErrorHandler(handler: ErrorHandler): void {
    this.globalErrorHandler = handler
  }

  /**
   * 处理错误
   */
  async handleError(
    error: Error,
    context?: Partial<ErrorContext>
  ): Promise<void> {
    const errorContext: ErrorContext = {
      timestamp: Date.now(),
      errorId: this.generateErrorId(),
      ...context
    }

    // 记录错误
    const report = this.createErrorReport(error, errorContext)
    this.addToHistory(report)

    // 尝试自动恢复
    if (this.config?.enableAutoRecovery) {
      const result = await this.tryRecover(error, errorContext)
      if (result.recovered) {
        report.recovered = true
        report.recoveryStrategy = result.strategy
        // 恢复成功，不需要返回值
      }
    }

    // 调用错误处理器
    await this.invokeErrorHandlers(error, errorContext)

    // 报告错误
    if (this.config?.enableErrorReporting) {
      await this.reportError(report)
    }

    throw error
  }

  /**
   * 尝试恢复
   */
  private async tryRecover(
    error: Error,
    context: ErrorContext
  ): Promise<{ recovered: boolean; strategy?: string; value?: unknown }> {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(error)) {
        try {
          const value = await strategy.recover(error, context)
          return {
            recovered: true,
            strategy: strategy.name,
            value
          }
        } catch (recoveryError) {
          console.error(`Recovery strategy ${strategy.name} failed:`, recoveryError)
        }
      }
    }

    return { recovered: false }
  }

  /**
   * 调用错误处理器
   */
  private async invokeErrorHandlers(
    error: Error,
    _context: ErrorContext
  ): Promise<void> {
    // 调用特定类型的处理器
    const errorType = error.constructor.name
    const specificHandler = this.errorHandlers.get(errorType)
    if (specificHandler) {
      await specificHandler(error)
    }

    // 调用全局处理器
    if (this.globalErrorHandler) {
      await this.globalErrorHandler(error)
    }
  }

  /**
   * 带重试的执行
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    strategy: RetryStrategy
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= strategy.maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        // 检查是否应该重试
        if (strategy.shouldRetry && !strategy.shouldRetry(lastError, attempt)) {
          throw lastError
        }

        // 如果还有重试机会
        if (attempt < strategy.maxAttempts) {
          // 触发重试回调
          if (strategy.onRetry) {
            strategy.onRetry(lastError, attempt)
          }

          // 计算延迟
          const delay = typeof strategy.delay === 'function'
            ? strategy.delay(attempt)
            : strategy.delay

          // 等待后重试
          await this.sleep(delay)
        }
      }
    }

    throw lastError || new Error('Operation failed')
  }

  /**
   * 带降级的执行
   */
  async executeWithFallback<T>(
    fn: () => Promise<T>,
    strategy: FallbackStrategy
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      const err = error as Error

      // 检查是否应该降级
      if (strategy.shouldFallback && !strategy.shouldFallback(err)) {
        throw err
      }

      // 获取降级值
      const fallbackValue = typeof strategy.fallback === 'function'
        ? strategy.fallback(err)
        : strategy.fallback

      // 触发降级回调
      if (strategy.onFallback) {
        strategy.onFallback(err, fallbackValue)
      }

      return fallbackValue
    }
  }

  /**
   * 带断路器的执行
   */
  createCircuitBreaker<T>(
    fn: () => Promise<T>,
    options: {
      threshold: number
      timeout: number
      resetTimeout: number
    }
  ): () => Promise<T> {
    let failures = 0
    let lastFailureTime = 0
    let state: 'closed' | 'open' | 'half-open' = 'closed'

    return async () => {
      // 检查断路器状态
      if (state === 'open') {
        const now = Date.now()
        if (now - lastFailureTime > options.resetTimeout) {
          state = 'half-open'
        } else {
          throw new Error('Circuit breaker is open')
        }
      }

      try {
        const result = await Promise.race([
          fn(),
          this.timeout(options.timeout)
        ])

        // 重置失败计数
        if (state === 'half-open') {
          state = 'closed'
          failures = 0
        }

        return result as T
      } catch (error) {
        failures++
        lastFailureTime = Date.now()

        // 检查是否达到阈值
        if (failures >= options.threshold) {
          state = 'open'
        }

        throw error
      }
    }
  }

  /**
   * 创建错误报告
   */
  private createErrorReport(
    error: Error,
    context: ErrorContext
  ): ErrorReport {
    return {
      error,
      context,
      level: this.determineErrorLevel(error),
      recovered: false,
      stackTrace: error.stack
    }
  }

  /**
   * 确定错误级别
   */
  private determineErrorLevel(error: Error): ErrorReport['level'] {
    // 可以根据错误类型、消息等确定级别
    if (error.message.includes('critical')) {
      return 'critical'
    }
    if (error.message.includes('warning')) {
      return 'warning'
    }
    return 'error'
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(report: ErrorReport): void {
    this.errorHistory.push(report)

    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift()
    }
  }

  /**
   * 报告错误
   */
  private async reportError(report: ErrorReport): Promise<void> {
    if (!this.config?.reportingEndpoint) return

    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...report,
          error: {
            name: report.error.name,
            message: report.error.message,
            stack: report.error.stack
          }
        })
      })
    } catch (error) {
      console.error('Failed to report error:', error)
    }
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 超时Promise
   */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), ms)
    })
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(): ErrorReport[] {
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
  getErrorStatistics(): {
    total: number
    recovered: number
    byLevel: Record<string, number>
    byComponent: Record<string, number>
    recoveryRate: number
  } {
    const stats = {
      total: this.errorHistory.length,
      recovered: 0,
      byLevel: {} as Record<string, number>,
      byComponent: {} as Record<string, number>,
      recoveryRate: 0
    }

    for (const report of this.errorHistory) {
      // 统计恢复的错误
      if (report.recovered) {
        stats.recovered++
      }

      // 按级别统计
      stats.byLevel[report.level] = (stats.byLevel[report.level] || 0) + 1

      // 按组件统计
      const component = report.context.component || 'unknown'
      stats.byComponent[component] = (stats.byComponent[component] || 0) + 1
    }

    // 计算恢复率
    stats.recoveryRate = stats.total > 0
      ? (stats.recovered / stats.total) * 100
      : 0

    return stats
  }
}

/**
 * 预定义的恢复策略
 */
export const commonRecoveryStrategies = {
  /**
   * 网络错误恢复策略
   */
  networkError: {
    name: 'network-error-recovery',
    canHandle: (error: Error) => {
      return error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('Failed to fetch')
    },
    recover: async (_error: Error, _context?: unknown) => {
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 返回缓存数据或默认值
      return (_context as { cachedData?: unknown } | undefined)?.cachedData || null
    },
    priority: 10
  },

  /**
   * 权限错误恢复策略
   */
  permissionError: {
    name: 'permission-error-recovery',
    canHandle: (error: Error) => {
      return error.message.includes('permission') ||
        error.message.includes('unauthorized') ||
        error.message.includes('403')
    },
    recover: async (error: Error, context?: Record<string, unknown>) => {
      // 尝试刷新令牌
      if (context?.refreshToken) {
        // 这里应该调用刷新令牌的API
        return { refreshed: true }
      }

      // 重定向到登录页
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }

      throw error
    },
    priority: 20
  },

  /**
   * 存储错误恢复策略
   */
  storageError: {
    name: 'storage-error-recovery',
    canHandle: (error: Error) => {
      return error.message.includes('storage') ||
        error.message.includes('quota') ||
        error.name === 'QuotaExceededError'
    },
    recover: async (_error: Error) => {
      // 清理旧数据
      if (typeof window !== 'undefined') {
        // 清理localStorage
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('temp_')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))

        // 清理sessionStorage
        sessionStorage.clear()
      }

      return { cleaned: true }
    },
    priority: 5
  }
} as const

/**
 * 创建错误恢复管理器
 */
export function createErrorRecoveryManager(
  config?: ConstructorParameters<typeof ErrorRecoveryManager>[0]
): ErrorRecoveryManager {
  const manager = new ErrorRecoveryManager(config)

  // 注册默认恢复策略
  Object.values(commonRecoveryStrategies).forEach(strategy => {
    manager.registerStrategy(strategy)
  })

  return manager
}
