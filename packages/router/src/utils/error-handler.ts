/**
 * @ldesign/router 错误处理增强
 *
 * 提供统一的错误处理、恢复机制和错误报告
 */

import type { RouteLocationNormalized } from '../types'

/**
 * 路由错误类型
 */
export enum RouterErrorType {
  NAVIGATION_CANCELLED = 'NAVIGATION_CANCELLED',
  NAVIGATION_DUPLICATED = 'NAVIGATION_DUPLICATED',
  NAVIGATION_ABORTED = 'NAVIGATION_ABORTED',
  COMPONENT_LOAD_FAILED = 'COMPONENT_LOAD_FAILED',
  GUARD_REJECTED = 'GUARD_REJECTED',
  INVALID_ROUTE = 'INVALID_ROUTE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 路由错误详情
 */
export interface RouterError extends Error {
  type: RouterErrorType
  code: string
  route?: RouteLocationNormalized
  originalError?: Error
  timestamp: number
  context?: Record<string, any>
}

/**
 * 错误恢复策略
 */
export interface ErrorRecoveryStrategy {
  type: RouterErrorType
  maxRetries: number
  retryDelay: number
  fallbackRoute?: string
  handler: (error: RouterError) => Promise<boolean>
}

/**
 * 路由错误处理器
 */
export class RouterErrorHandler {
  private errorLog: RouterError[] = []
  private recoveryStrategies = new Map<RouterErrorType, ErrorRecoveryStrategy>()
  private retryCount = new Map<string, number>()
  private readonly maxLogSize = 100

  constructor() {
    this.setupDefaultStrategies()
  }

  /**
   * 设置默认恢复策略
   */
  private setupDefaultStrategies(): void {
    // 组件加载失败恢复策略
    this.addRecoveryStrategy({
      type: RouterErrorType.COMPONENT_LOAD_FAILED,
      maxRetries: 3,
      retryDelay: 1000,
      fallbackRoute: '/error',
      handler: async (error) => {
        console.warn('组件加载失败，尝试重新加载:', error.route?.path)
        await this.delay(1000)
        return true // 允许重试
      },
    })

    // 网络错误恢复策略
    this.addRecoveryStrategy({
      type: RouterErrorType.NETWORK_ERROR,
      maxRetries: 2,
      retryDelay: 2000,
      handler: async (error) => {
        console.warn('网络错误，等待重试:', error.message)
        await this.delay(2000)
        return navigator.onLine // 只有在线时才重试
      },
    })

    // 权限拒绝处理
    this.addRecoveryStrategy({
      type: RouterErrorType.PERMISSION_DENIED,
      maxRetries: 0,
      retryDelay: 0,
      fallbackRoute: '/login',
      handler: async (error) => {
        console.warn('权限不足，重定向到登录页:', error.route?.path)
        return false // 不重试，直接跳转
      },
    })
  }

  /**
   * 添加恢复策略
   */
  addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.type, strategy)
  }

  /**
   * 处理路由错误
   */
  async handleError(error: Error | RouterError, route?: RouteLocationNormalized): Promise<boolean> {
    const routerError = this.normalizeError(error, route)

    // 记录错误
    this.logError(routerError)

    // 尝试恢复
    return this.attemptRecovery(routerError)
  }

  /**
   * 标准化错误对象
   */
  private normalizeError(error: Error | RouterError, route?: RouteLocationNormalized): RouterError {
    if (this.isRouterError(error)) {
      return error
    }

    // 根据错误信息推断错误类型
    let type = RouterErrorType.UNKNOWN_ERROR
    if (error.message.includes('Loading chunk')) {
      type = RouterErrorType.COMPONENT_LOAD_FAILED
    }
    else if (error.message.includes('Network')) {
      type = RouterErrorType.NETWORK_ERROR
    }

    return {
      ...error,
      type,
      code: `${type}_${Date.now()}`,
      route,
      originalError: error,
      timestamp: Date.now(),
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        online: navigator.onLine,
      },
    } as RouterError
  }

  /**
   * 检查是否为路由错误
   */
  private isRouterError(error: any): error is RouterError {
    return error && typeof error.type === 'string' && error.timestamp
  }

  /**
   * 记录错误
   */
  private logError(error: RouterError): void {
    this.errorLog.push(error)

    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }

    // 输出到控制台
    console.error(`[Router Error] ${error.type}:`, {
      message: error.message,
      route: error.route?.path,
      timestamp: new Date(error.timestamp).toISOString(),
      context: error.context,
    })
  }

  /**
   * 尝试错误恢复
   */
  private async attemptRecovery(error: RouterError): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(error.type)
    if (!strategy) {
      return false
    }

    const retryKey = `${error.type}_${error.route?.path || 'unknown'}`
    const currentRetries = this.retryCount.get(retryKey) || 0

    if (currentRetries >= strategy.maxRetries) {
      console.warn(`达到最大重试次数 (${strategy.maxRetries})，停止重试:`, error.type)
      this.retryCount.delete(retryKey)
      return false
    }

    try {
      // 执行恢复策略
      const shouldRetry = await strategy.handler(error)

      if (shouldRetry) {
        this.retryCount.set(retryKey, currentRetries + 1)
        console.log(`错误恢复成功，重试次数: ${currentRetries + 1}/${strategy.maxRetries}`)
        return true
      }
    }
    catch (recoveryError) {
      console.error('错误恢复失败:', recoveryError)
    }

    this.retryCount.delete(retryKey)
    return false
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取错误统计
   */
  getErrorStats() {
    const errorsByType = new Map<RouterErrorType, number>()
    const recentErrors = this.errorLog.filter(e => Date.now() - e.timestamp < 24 * 60 * 60 * 1000) // 24小时内

    for (const error of recentErrors) {
      errorsByType.set(error.type, (errorsByType.get(error.type) || 0) + 1)
    }

    return {
      totalErrors: this.errorLog.length,
      recentErrors: recentErrors.length,
      errorsByType: Object.fromEntries(errorsByType),
      mostCommonError: this.getMostCommonError(),
      errorRate: this.calculateErrorRate(),
    }
  }

  /**
   * 获取最常见的错误类型
   */
  private getMostCommonError(): { type: RouterErrorType, count: number } | null {
    const errorCounts = new Map<RouterErrorType, number>()

    for (const error of this.errorLog) {
      errorCounts.set(error.type, (errorCounts.get(error.type) || 0) + 1)
    }

    let mostCommon: { type: RouterErrorType, count: number } | null = null
    for (const [type, count] of errorCounts) {
      if (!mostCommon || count > mostCommon.count) {
        mostCommon = { type, count }
      }
    }

    return mostCommon
  }

  /**
   * 计算错误率
   */
  private calculateErrorRate(): number {
    const recentErrors = this.errorLog.filter(e => Date.now() - e.timestamp < 60 * 60 * 1000) // 1小时内
    return recentErrors.length / 60 // 每分钟错误数
  }

  /**
   * 清空错误日志
   */
  clearErrorLog(): void {
    this.errorLog = []
    this.retryCount.clear()
  }

  /**
   * 导出错误日志
   */
  exportErrorLog(): RouterError[] {
    return [...this.errorLog]
  }
}

// 导出单例实例
export const routerErrorHandler = new RouterErrorHandler()

/**
 * 创建路由错误
 */
export function createRouterError(
  type: RouterErrorType,
  message: string,
  route?: RouteLocationNormalized,
  originalError?: Error,
): RouterError {
  return {
    name: 'RouterError',
    message,
    type,
    code: `${type}_${Date.now()}`,
    route,
    originalError,
    timestamp: Date.now(),
    context: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      online: navigator.onLine,
    },
  } as RouterError
}
