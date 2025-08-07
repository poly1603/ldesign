/**
 * 错误管理器
 */

import type {
  ErrorConfig,
  ErrorHandler,
  ErrorRecoveryStrategy,
  ErrorReport,
  ErrorSeverity,
  ErrorStats,
  ErrorManager as IErrorManager,
  WatermarkError,
} from '../types/error'

import {
  DEFAULT_ERROR_CONFIG,
  ErrorCategory,
  WatermarkErrorCode,
} from '../types/error'
import { generateId } from '../utils/id-generator'

/**
 * 错误管理器
 * 负责错误的捕获、处理、恢复和统计
 */
export class ErrorManager implements IErrorManager {
  // 实现接口要求的方法
  async tryRecover(error: WatermarkError): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(error.code)
    if (!strategy || !strategy.canRecover(error)) {
      return false
    }

    try {
      const recovered = await strategy.recover(error)
      if (recovered) {
        this.recoveredErrors++
        this.updateStats()
      }
      return recovered
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError)
      return false
    }
  }

  async reportError(error: WatermarkError): Promise<void> {
    if (!this.config.reportErrors || !this.config.reportUrl) {
      return
    }

    const report: ErrorReport = {
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
    }

    try {
      await fetch(this.config.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      })
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  getErrorStats(): ErrorStats {
    return { ...this.stats }
  }

  clearErrorHistory(): void {
    this.errorHistory = []
    this.stats.recentErrors = []
    this.updateStats()
  }

  private handlers = new Map<ErrorCategory, ErrorHandler[]>()
  private recoveryStrategies = new Map<
    WatermarkErrorCode,
    ErrorRecoveryStrategy
  >()
  private config: ErrorConfig
  private stats: ErrorStats = {
    totalErrors: 0,
    errorsByCategory: {} as Record<ErrorCategory, number>,
    errorsBySeverity: {} as Record<ErrorSeverity, number>,
    recentErrors: [],
    errorRate: 0,
    recoveryRate: 0,
  }

  private errorsByCode = new Map<WatermarkErrorCode, number>()
  private recoveredErrors = 0
  private unrecoveredErrors = 0
  private lastErrorTime = 0
  // private averageRecoveryTime = 0
  private errorHistory: ErrorReport[] = []
  private recoveryTimes: number[] = []
  private initialized = false

  constructor(config: Partial<ErrorConfig> = {}) {
    this.config = { ...DEFAULT_ERROR_CONFIG, ...config }
  }

  /**
   * 初始化错误管理器
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    // 注册默认错误处理器
    this.registerDefaultHandlers()

    // 注册默认恢复策略
    this.registerDefaultRecoveryStrategies()

    this.initialized = true
  }

  /**
   * 处理错误
   */
  async handleError(error: WatermarkError): Promise<void> {
    const startTime = performance.now()

    try {
      // 创建错误报告
      const report = this.createErrorReport(error)

      // 更新统计
      this.updateStats(error)

      // 添加到历史记录
      if (this.config.maxErrorHistory && this.config.maxErrorHistory > 0) {
        this.addToHistory(report)
      }

      // 记录错误日志
      if (this.config.logErrors) {
        this.logError(error)
      }

      // 执行错误处理器
      await this.executeHandlers(error)

      // 尝试恢复
      const recovered = await this.attemptRecovery(error)

      if (recovered) {
        this.recoveredErrors++
        const recoveryTime = performance.now() - startTime
        this.updateRecoveryTime(recoveryTime)
      } else {
        this.unrecoveredErrors++
      }

      // 发送错误报告
      if (this.config.reportErrors && this.shouldReport(error)) {
        await this.sendErrorReport(report)
      }
    } catch (handlingError) {
      // 错误处理本身出错
      console.error('Error handling failed:', handlingError)

      // 简单的回退处理
      this.fallbackErrorHandling(error, handlingError as Error)
    }
  }

  /**
   * 注册错误处理器
   */
  registerHandler(category: ErrorCategory, handler: ErrorHandler): string {
    if (!this.handlers.has(category)) {
      this.handlers.set(category, [])
    }

    this.handlers.get(category)!.push(handler)

    // 返回处理器ID用于移除
    const handlerId = generateId('handler')
    ;(handler as any).__handlerId = handlerId

    return handlerId
  }

  /**
   * 移除错误处理器
   */
  unregisterHandler(category: ErrorCategory, handler: ErrorHandler): boolean {
    const handlers = this.handlers.get(category)
    if (!handlers) {
      return false
    }

    const index = handlers.indexOf(handler)
    if (index === -1) {
      return false
    }

    handlers.splice(index, 1)

    if (handlers.length === 0) {
      this.handlers.delete(category)
    }

    return true
  }

  /**
   * 注册恢复策略
   */
  registerRecoveryStrategy(
    errorCode: WatermarkErrorCode,
    strategy: ErrorRecoveryStrategy
  ): void {
    this.recoveryStrategies.set(errorCode, strategy)
  }

  /**
   * 移除恢复策略
   */
  unregisterRecoveryStrategy(errorCode: WatermarkErrorCode): boolean {
    return this.recoveryStrategies.delete(errorCode)
  }

  /**
   * 获取错误统计
   */
  getStats(): ErrorStats {
    return { ...this.stats }
  }

  /**
   * 获取错误历史
   */
  getHistory(limit?: number): ErrorReport[] {
    if (limit) {
      return this.errorHistory.slice(-limit)
    }
    return [...this.errorHistory]
  }

  /**
   * 清空错误历史
   */
  clearHistory(): void {
    this.errorHistory = []
  }

  /**
   * 获取指定类别的错误处理器数量
   */
  getHandlerCount(category: ErrorCategory): number {
    const handlers = this.handlers.get(category)
    return handlers ? handlers.length : 0
  }

  /**
   * 检查是否有指定类别的错误处理器
   */
  hasHandlers(category: ErrorCategory): boolean {
    return this.getHandlerCount(category) > 0
  }

  /**
   * 获取所有错误类别
   */
  getCategories(): ErrorCategory[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalErrors: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      recentErrors: [],
      errorRate: 0,
      recoveryRate: 0,
    }
    this.errorsByCode = new Map()
    this.recoveredErrors = 0
    this.unrecoveredErrors = 0
    this.lastErrorTime = 0
    // this.averageRecoveryTime = 0
    this.recoveryTimes = []
  }

  /**
   * 导出错误报告
   */
  exportReport(): {
    stats: ErrorStats
    history: ErrorReport[]
    config: ErrorConfig
  } {
    return {
      stats: this.getStats(),
      history: this.getHistory(),
      config: { ...this.config },
    }
  }

  /**
   * 销毁错误管理器
   */
  async dispose(): Promise<void> {
    this.handlers.clear()
    this.recoveryStrategies.clear()
    this.errorHistory = []
    this.recoveryTimes = []
    this.initialized = false
  }

  // 私有方法

  private createErrorReport(error: WatermarkError): ErrorReport {
    return {
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
    }
  }

  private updateStats(error?: WatermarkError): void {
    if (error) {
      this.stats.totalErrors++
      this.lastErrorTime = Date.now()

      // 按错误代码统计
      const codeCount = this.errorsByCode.get(error.code) || 0
      this.errorsByCode.set(error.code, codeCount + 1)

      // 按严重程度统计
      const severityCount = this.stats.errorsBySeverity[error.severity] || 0
      this.stats.errorsBySeverity[error.severity] = severityCount + 1

      // 按类别统计
      const categoryCount = this.stats.errorsByCategory[error.category] || 0
      this.stats.errorsByCategory[error.category] = categoryCount + 1

      // 更新最近错误列表
      this.stats.recentErrors.push(error)
      if (this.stats.recentErrors.length > 10) {
        this.stats.recentErrors.shift()
      }

      // 计算错误率和恢复率
      this.stats.errorRate =
        this.stats.totalErrors / Math.max(1, Date.now() - this.lastErrorTime)
      this.stats.recoveryRate =
        this.recoveredErrors / Math.max(1, this.stats.totalErrors)
    }

    // 总是更新恢复率
    this.stats.recoveryRate =
      this.recoveredErrors / Math.max(1, this.stats.totalErrors)
  }

  private updateRecoveryTime(recoveryTime: number): void {
    this.recoveryTimes.push(recoveryTime)

    // 限制记录数量
    if (this.recoveryTimes.length > 100) {
      this.recoveryTimes.shift()
    }

    // 计算平均恢复时间
    // this.averageRecoveryTime =
    //   this.recoveryTimes.reduce((sum, time) => sum + time, 0) / this.recoveryTimes.length
  }

  private addToHistory(report: ErrorReport): void {
    this.errorHistory.push(report)

    // 限制历史记录大小
    if (
      this.config.maxErrorHistory &&
      this.errorHistory.length > this.config.maxErrorHistory
    ) {
      this.errorHistory.shift()
    }
  }

  private logError(error: WatermarkError): void {
    const logLevel = this.getLogLevel(error.severity)
    const message = `[WatermarkError] ${error.code}: ${error.message}`

    switch (logLevel) {
      case 'error':
        console.error(message, error)
        break
      case 'warn':
        console.warn(message, error)
        break
      case 'info':
        console.info(message, error)
        break
      default:
        console.log(message, error)
    }
  }

  private getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error'
      case 'medium':
        return 'warn'
      case 'low':
        return 'info'
      default:
        return 'log'
    }
  }

  private async executeHandlers(error: WatermarkError): Promise<void> {
    const handlers = this.handlers.get(error.category) || []

    for (const handler of handlers) {
      try {
        if (handler.canHandle(error)) {
          await handler.handle(error)
        }
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError)
        // 继续执行其他处理器
      }
    }
  }

  private async attemptRecovery(error: WatermarkError): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(error.code)
    if (!strategy) {
      return false
    }

    try {
      if (strategy.canRecover(error)) {
        return await strategy.recover(error)
      }
      return false
    } catch (recoveryError) {
      console.error('Error recovery failed:', recoveryError)
      return false
    }
  }

  private shouldReport(error: WatermarkError): boolean {
    // 根据配置决定是否需要报告错误
    if (error.severity === 'low') {
      return false
    }

    // 避免重复报告相同错误
    const recentSimilarErrors = this.errorHistory.filter(
      report =>
        report.error.code === error.code &&
        Date.now() - report.timestamp < 60000 // 1分钟内
    )

    return recentSimilarErrors.length < 3
  }

  private async sendErrorReport(report: ErrorReport): Promise<void> {
    if (!this.config.reportUrl) {
      return
    }

    try {
      await fetch(this.config.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      })
    } catch (error) {
      console.error('Failed to send error report:', error)
    }
  }

  private fallbackErrorHandling(
    originalError: WatermarkError,
    handlingError: Error
  ): void {
    // 最基本的错误处理
    console.error('Fallback error handling:', {
      original: originalError,
      handling: handlingError,
    })

    // 尝试通知用户
    this.notifyUser(originalError)
  }

  private notifyUser(error: WatermarkError): void {
    // 简单的用户通知
    const message = error.getUserFriendlyMessage()

    if (error.severity === 'critical' || error.severity === 'high') {
      alert(`水印系统错误: ${message}`)
    } else {
      console.warn(`水印系统警告: ${message}`)
    }
  }

  private registerDefaultHandlers(): void {
    // 配置错误处理器
    this.registerHandler(ErrorCategory.CONFIG, {
      handle: async error => {
        console.warn('Configuration error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.CONFIG,
      priority: 1,
    })

    // 渲染错误处理器
    this.registerHandler(ErrorCategory.RENDER, {
      handle: async error => {
        console.error('Rendering error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.RENDER,
      priority: 1,
    })

    // 实例错误处理器
    this.registerHandler(ErrorCategory.INSTANCE, {
      handle: async error => {
        console.warn('Instance error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.INSTANCE,
      priority: 1,
    })

    // 安全错误处理器
    this.registerHandler(ErrorCategory.SECURITY, {
      handle: async error => {
        console.error('Security error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.SECURITY,
      priority: 1,
    })

    // 动画错误处理器
    this.registerHandler(ErrorCategory.ANIMATION, {
      handle: async error => {
        console.warn('Animation error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.ANIMATION,
      priority: 1,
    })

    // 响应式错误处理器
    this.registerHandler(ErrorCategory.RESPONSIVE, {
      handle: async error => {
        console.warn('Responsive error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.RESPONSIVE,
      priority: 1,
    })

    // 事件错误处理器
    this.registerHandler(ErrorCategory.EVENT, {
      handle: async error => {
        console.warn('Event error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.EVENT,
      priority: 1,
    })

    // 性能错误处理器
    this.registerHandler(ErrorCategory.PERFORMANCE, {
      handle: async error => {
        console.warn('Performance error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.PERFORMANCE,
      priority: 1,
    })

    // 兼容性错误处理器
    this.registerHandler(ErrorCategory.COMPATIBILITY, {
      handle: async error => {
        console.error('Compatibility error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.COMPATIBILITY,
      priority: 1,
    })

    // 网络错误处理器
    this.registerHandler(ErrorCategory.NETWORK, {
      handle: async error => {
        console.error('Network error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.NETWORK,
      priority: 1,
    })

    // 未知错误处理器
    this.registerHandler(ErrorCategory.UNKNOWN, {
      handle: async error => {
        console.error('Unknown error detected:', error.message)
      },
      canHandle: error => error.category === ErrorCategory.UNKNOWN,
      priority: 1,
    })
  }

  private registerDefaultRecoveryStrategies(): void {
    // 配置错误恢复
    this.registerRecoveryStrategy(WatermarkErrorCode.INVALID_CONFIG, {
      name: 'config-recovery',
      canRecover: error => error.code === WatermarkErrorCode.INVALID_CONFIG,
      recover: async _error => {
        console.log('Attempting to recover from invalid config...')
        // 尝试使用默认配置
        return true
      },
    })

    // 渲染错误恢复
    this.registerRecoveryStrategy(WatermarkErrorCode.RENDER_FAILED, {
      name: 'render-recovery',
      canRecover: error => error.code === WatermarkErrorCode.RENDER_FAILED,
      recover: async _error => {
        console.log('Attempting to recover from render failure...')
        // 尝试重新渲染
        return false // 需要具体实现
      },
    })

    // 实例创建失败恢复
    this.registerRecoveryStrategy(WatermarkErrorCode.INSTANCE_CREATION_FAILED, {
      name: 'instance-recovery',
      canRecover: error =>
        error.code === WatermarkErrorCode.INSTANCE_CREATION_FAILED,
      recover: async _error => {
        console.log('Attempting to recover from instance creation failure...')
        // 尝试清理并重新创建
        return false // 需要具体实现
      },
    })
  }
}
