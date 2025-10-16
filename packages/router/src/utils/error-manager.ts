/**
 * 统一的错误管理系统
 * 
 * 提供集中化的错误处理、追踪和恢复机制
 */

import { logger } from './logger'

// 错误类型定义
export enum ErrorType {
  NAVIGATION = 'NAVIGATION',
  GUARD = 'GUARD',
  MIDDLEWARE = 'MIDDLEWARE',
  COMPONENT = 'COMPONENT',
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
  VALIDATION = 'VALIDATION',
  STATE = 'STATE',
  MEMORY = 'MEMORY',
  PERFORMANCE = 'PERFORMANCE',
  UNKNOWN = 'UNKNOWN'
}

// 错误严重级别
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 错误详情接口
export interface ErrorDetails {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  code?: string
  stack?: string
  context?: Record<string, any>
  timestamp: number
  userAgent?: string
  url?: string
  recoverable?: boolean
  retryable?: boolean
  retryCount?: number
  maxRetries?: number
}

// 错误恢复策略
export interface ErrorRecoveryStrategy {
  shouldRecover: (error: ErrorDetails) => boolean
  recover: (error: ErrorDetails) => Promise<void> | void
  fallback?: () => void
}

// 错误监听器
export type ErrorListener = (error: ErrorDetails) => void

// 错误管理器配置
export interface ErrorManagerConfig {
  maxErrorHistory: number
  enableAutoRecovery: boolean
  enableErrorReporting: boolean
  reportingEndpoint?: string
  recoveryStrategies?: Map<ErrorType, ErrorRecoveryStrategy>
  globalFallback?: () => void
}

/**
 * 错误管理器类
 */
export class ErrorManager {
  private static instance: ErrorManager
  private config: ErrorManagerConfig
  private errorHistory: ErrorDetails[] = []
  private listeners: Set<ErrorListener> = new Set()
  private recoveryStrategies: Map<ErrorType, ErrorRecoveryStrategy>
  private isRecovering: boolean = false

  private constructor(config?: Partial<ErrorManagerConfig>) {
    this.config = {
      maxErrorHistory: 100,
      enableAutoRecovery: true,
      enableErrorReporting: false,
      ...config
    }
    
    this.recoveryStrategies = config?.recoveryStrategies || this.getDefaultRecoveryStrategies()
    this.setupGlobalErrorHandlers()
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: Partial<ErrorManagerConfig>): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager(config)
    }
    return ErrorManager.instance
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalErrorHandlers(): void {
    // 浏览器环境
    if (typeof window !== 'undefined') {
      // 处理未捕获的错误
      window.addEventListener('error', (event) => {
        this.handleError({
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.HIGH,
          message: event.message,
          stack: event.error?.stack,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        })
      })

      // 处理未处理的 Promise 拒绝
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError({
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.HIGH,
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          context: {
            reason: event.reason,
            promise: event.promise
          }
        })
      })
    }

    // Web包不需要Node.js环境的错误处理
  }

  /**
   * 获取默认恢复策略
   */
  private getDefaultRecoveryStrategies(): Map<ErrorType, ErrorRecoveryStrategy> {
    const strategies = new Map<ErrorType, ErrorRecoveryStrategy>()

    // 导航错误恢复策略
    strategies.set(ErrorType.NAVIGATION, {
      shouldRecover: (error) => error.retryCount! < 3,
      recover: async (error) => {
        logger.info('Attempting to recover from navigation error', error)
        // 尝试返回上一页或首页
        if (typeof window !== 'undefined' && window.history.length > 1) {
          window.history.back()
        } else if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      },
      fallback: () => {
        logger.warn('Navigation recovery failed, redirecting to home')
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }
    })

    // 网络错误恢复策略
    strategies.set(ErrorType.NETWORK, {
      shouldRecover: (error) => error.retryable !== false && (error.retryCount || 0) < 3,
      recover: async (error) => {
        logger.info('Attempting to recover from network error', error)
        // 延迟重试
        await new Promise(resolve => setTimeout(resolve, 1000 * (error.retryCount || 1)))
        // 这里应该重新发起网络请求
      }
    })

    // 组件错误恢复策略
    strategies.set(ErrorType.COMPONENT, {
      shouldRecover: () => true,
      recover: (error) => {
        logger.info('Component error detected, attempting recovery', error)
        // 组件错误通常由 ErrorBoundary 处理
      }
    })

    return strategies
  }

  /**
   * 处理错误
   */
  handleError(errorData: Partial<ErrorDetails> & { type: ErrorType; message: string }): void {
    const error: ErrorDetails = {
      severity: ErrorSeverity.MEDIUM,
      timestamp: Date.now(),
      recoverable: true,
      retryable: false,
      retryCount: 0,
      maxRetries: 3,
      ...errorData,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    // 记录错误
    this.logError(error)
    
    // 保存到历史记录
    this.addToHistory(error)
    
    // 通知监听器
    this.notifyListeners(error)
    
    // 尝试自动恢复
    if (this.config.enableAutoRecovery && !this.isRecovering) {
      this.attemptRecovery(error)
    }
    
    // 上报错误
    if (this.config.enableErrorReporting) {
      this.reportError(error)
    }
  }

  /**
   * 记录错误日志
   */
  private logError(error: ErrorDetails): void {
    const logMessage = `[${error.type}] ${error.message}`
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        logger.error(logMessage, error)
        break
      case ErrorSeverity.MEDIUM:
        logger.warn(logMessage, error)
        break
      case ErrorSeverity.LOW:
        logger.info(logMessage, error)
        break
    }
  }

  /**
   * 添加到错误历史
   */
  private addToHistory(error: ErrorDetails): void {
    this.errorHistory.push(error)
    
    // 限制历史记录大小
    if (this.errorHistory.length > this.config.maxErrorHistory) {
      this.errorHistory.shift()
    }
  }

  /**
   * 通知错误监听器
   */
  private notifyListeners(error: ErrorDetails): void {
    this.listeners.forEach(listener => {
      try {
        listener(error)
      } catch (e) {
        logger.error('Error in error listener', e)
      }
    })
  }

  /**
   * 尝试错误恢复
   */
  private async attemptRecovery(error: ErrorDetails): Promise<void> {
    if (!error.recoverable) return
    
    const strategy = this.recoveryStrategies.get(error.type)
    if (!strategy) return
    
    if (!strategy.shouldRecover(error)) {
      if (strategy.fallback) {
        strategy.fallback()
      }
      return
    }
    
    this.isRecovering = true
    
    try {
      await strategy.recover(error)
      logger.info('Successfully recovered from error', error)
    } catch (recoveryError) {
      logger.error('Recovery failed', recoveryError)
      if (strategy.fallback) {
        strategy.fallback()
      } else if (this.config.globalFallback) {
        this.config.globalFallback()
      }
    } finally {
      this.isRecovering = false
    }
  }

  /**
   * 上报错误到服务器
   */
  private async reportError(error: ErrorDetails): Promise<void> {
    if (!this.config.reportingEndpoint) return
    
    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...error,
          // 移除敏感信息
          stack: error.stack?.substring(0, 500)
        })
      })
    } catch (e) {
      logger.error('Failed to report error', e)
    }
  }

  /**
   * 添加错误监听器
   */
  addListener(listener: ErrorListener): () => void {
    this.listeners.add(listener)
    return () => this.removeListener(listener)
  }

  /**
   * 移除错误监听器
   */
  removeListener(listener: ErrorListener): void {
    this.listeners.delete(listener)
  }

  /**
   * 注册恢复策略
   */
  registerRecoveryStrategy(type: ErrorType, strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(type, strategy)
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(filter?: { type?: ErrorType; severity?: ErrorSeverity }): ErrorDetails[] {
    if (!filter) return [...this.errorHistory]
    
    return this.errorHistory.filter(error => {
      if (filter.type && error.type !== filter.type) return false
      if (filter.severity && error.severity !== filter.severity) return false
      return true
    })
  }

  /**
   * 清除错误历史
   */
  clearHistory(): void {
    this.errorHistory = []
  }

  /**
   * 获取错误统计
   */
  getStatistics(): {
    total: number
    byType: Record<ErrorType, number>
    bySeverity: Record<ErrorSeverity, number>
    recentErrors: ErrorDetails[]
  } {
    const stats = {
      total: this.errorHistory.length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recentErrors: this.errorHistory.slice(-10)
    }
    
    this.errorHistory.forEach(error => {
      // 按类型统计
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      
      // 按严重程度统计
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
    })
    
    return stats
  }

  /**
   * 创建自定义错误
   */
  static createError(
    type: ErrorType,
    message: string,
    options?: Partial<ErrorDetails>
  ): Error {
    const error = new Error(message)
    ;(error as any).__errorDetails = {
      type,
      message,
      ...options
    }
    return error
  }

  /**
   * 包装函数以捕获错误
   */
  static wrapFunction<T extends (...args: any[]) => any>(
    fn: T,
    errorType: ErrorType = ErrorType.UNKNOWN
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args)
        if (result instanceof Promise) {
          return result.catch((error) => {
            ErrorManager.getInstance().handleError({
              type: errorType,
              message: error.message || 'Unknown error',
              stack: error.stack,
              context: { args }
            })
            throw error
          })
        }
        return result
      } catch (error: any) {
        ErrorManager.getInstance().handleError({
          type: errorType,
          message: error.message || 'Unknown error',
          stack: error.stack,
          context: { args }
        })
        throw error
      }
    }) as T
  }

  /**
   * 装饰器：错误处理
   */
  static errorHandler(errorType: ErrorType = ErrorType.UNKNOWN) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value
      
      descriptor.value = function (...args: any[]) {
        try {
          const result = originalMethod.apply(this, args)
          if (result instanceof Promise) {
            return result.catch((error: any) => {
              ErrorManager.getInstance().handleError({
                type: errorType,
                message: error.message || 'Unknown error',
                stack: error.stack,
                context: {
                  class: target.constructor.name,
                  method: propertyKey,
                  args
                }
              })
              throw error
            })
          }
          return result
        } catch (error: any) {
          ErrorManager.getInstance().handleError({
            type: errorType,
            message: error.message || 'Unknown error',
            stack: error.stack,
            context: {
              class: target.constructor.name,
              method: propertyKey,
              args
            }
          })
          throw error
        }
      }
      
      return descriptor
    }
  }
}

// 导出单例实例
export const errorManager = ErrorManager.getInstance()

// 导出便捷方法
export const handleError = errorManager.handleError.bind(errorManager)
export const addErrorListener = errorManager.addListener.bind(errorManager)
export const getErrorHistory = errorManager.getErrorHistory.bind(errorManager)
export const getErrorStatistics = errorManager.getStatistics.bind(errorManager)

export default errorManager