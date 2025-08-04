/**
 * 错误管理器
 */

import type {
  WatermarkError,
  ErrorHandler,
  ErrorRecoveryStrategy,
  ErrorReport,
  ErrorManager as IErrorManager,
  ErrorStats,
  ErrorConfig,
  ErrorSeverity,
  ErrorCategory
} from '../types/error'

import { DEFAULT_ERROR_CONFIG, WatermarkErrorCode } from '../types/error'
import { generateId } from '../utils/id-generator'

/**
 * 错误管理器
 * 负责错误的捕获、处理、恢复和统计
 */
export class ErrorManager implements IErrorManager {
  private handlers = new Map<ErrorCategory, ErrorHandler[]>()
  private recoveryStrategies = new Map<WatermarkErrorCode, ErrorRecoveryStrategy>()
  private config: ErrorConfig
  private stats: ErrorStats = {
    totalErrors: 0,
    errorsByCode: new Map(),
    errorsBySeverity: new Map(),
    errorsByCategory: new Map(),
    recoveredErrors: 0,
    unrecoveredErrors: 0,
    lastErrorTime: 0,
    averageRecoveryTime: 0
  }
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
      if (this.config.maxHistorySize > 0) {
        this.addToHistory(report)
      }
      
      // 记录错误日志
      if (this.config.enableLogging) {
        this.logError(error)
      }
      
      // 执行错误处理器
      await this.executeHandlers(error)
      
      // 尝试恢复
      const recovered = await this.attemptRecovery(error)
      
      if (recovered) {
        this.stats.recoveredErrors++
        const recoveryTime = performance.now() - startTime
        this.updateRecoveryTime(recoveryTime)
      } else {
        this.stats.unrecoveredErrors++
      }
      
      // 发送错误报告
      if (this.config.enableReporting && this.shouldReport(error)) {
        await this.sendErrorReport(report)
      }
    } catch (handlingError) {
      // 错误处理本身出错
      console.error('Error handling failed:', handlingError)
      
      if (this.config.enableFallback) {
        this.fallbackErrorHandling(error, handlingError as Error)
      }
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
      errorsByCode: new Map(),
      errorsBySeverity: new Map(),
      errorsByCategory: new Map(),
      recoveredErrors: 0,
      unrecoveredErrors: 0,
      lastErrorTime: 0,
      averageRecoveryTime: 0
    }
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
      config: { ...this.config }
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
      id: generateId('error-report'),
      error,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stackTrace: error.stack || '',
      context: {
        ...error.context,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height
        },
        memory: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : undefined
      }
    }
  }

  private updateStats(error: WatermarkError): void {
    this.stats.totalErrors++
    this.stats.lastErrorTime = Date.now()
    
    // 按错误代码统计
    const codeCount = this.stats.errorsByCode.get(error.code) || 0
    this.stats.errorsByCode.set(error.code, codeCount + 1)
    
    // 按严重程度统计
    const severityCount = this.stats.errorsBySeverity.get(error.severity) || 0
    this.stats.errorsBySeverity.set(error.severity, severityCount + 1)
    
    // 按类别统计
    const categoryCount = this.stats.errorsByCategory.get(error.category) || 0
    this.stats.errorsByCategory.set(error.category, categoryCount + 1)
  }

  private updateRecoveryTime(recoveryTime: number): void {
    this.recoveryTimes.push(recoveryTime)
    
    // 限制记录数量
    if (this.recoveryTimes.length > 100) {
      this.recoveryTimes.shift()
    }
    
    // 计算平均恢复时间
    this.stats.averageRecoveryTime = 
      this.recoveryTimes.reduce((sum, time) => sum + time, 0) / this.recoveryTimes.length
  }

  private addToHistory(report: ErrorReport): void {
    this.errorHistory.push(report)
    
    // 限制历史记录大小
    if (this.errorHistory.length > this.config.maxHistorySize) {
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
        await handler(error)
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError)
        
        if (this.config.strictMode) {
          throw handlerError
        }
      }
    }
  }

  private async attemptRecovery(error: WatermarkError): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(error.code)
    if (!strategy) {
      return false
    }
    
    try {
      return await strategy(error)
    } catch (recoveryError) {
      console.error('Error recovery failed:', recoveryError)
      return false
    }
  }

  private shouldReport(error: WatermarkError): boolean {
    // 根据配置决定是否需要报告错误
    if (error.severity === 'low' && !this.config.reportLowSeverity) {
      return false
    }
    
    // 避免重复报告相同错误
    const recentSimilarErrors = this.errorHistory
      .filter(report => 
        report.error.code === error.code &&
        Date.now() - report.timestamp < 60000 // 1分钟内
      )
    
    return recentSimilarErrors.length < 3
  }

  private async sendErrorReport(report: ErrorReport): Promise<void> {
    if (!this.config.reportingEndpoint) {
      return
    }
    
    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      })
    } catch (error) {
      console.error('Failed to send error report:', error)
    }
  }

  private fallbackErrorHandling(originalError: WatermarkError, handlingError: Error): void {
    // 最基本的错误处理
    console.error('Fallback error handling:', {
      original: originalError,
      handling: handlingError
    })
    
    // 尝试通知用户
    if (this.config.enableUserNotification) {
      this.notifyUser(originalError)
    }
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
    this.registerHandler('configuration', async (error) => {
      console.warn('Configuration error detected:', error.message)
    })
    
    // 渲染错误处理器
    this.registerHandler('rendering', async (error) => {
      console.error('Rendering error detected:', error.message)
    })
    
    // 实例错误处理器
    this.registerHandler('instance', async (error) => {
      console.warn('Instance error detected:', error.message)
    })
    
    // 安全错误处理器
    this.registerHandler('security', async (error) => {
      console.error('Security error detected:', error.message)
    })
    
    // 动画错误处理器
    this.registerHandler('animation', async (error) => {
      console.warn('Animation error detected:', error.message)
    })
    
    // 响应式错误处理器
    this.registerHandler('responsive', async (error) => {
      console.warn('Responsive error detected:', error.message)
    })
    
    // 事件错误处理器
    this.registerHandler('event', async (error) => {
      console.warn('Event error detected:', error.message)
    })
    
    // 性能错误处理器
    this.registerHandler('performance', async (error) => {
      console.warn('Performance error detected:', error.message)
    })
    
    // 兼容性错误处理器
    this.registerHandler('compatibility', async (error) => {
      console.error('Compatibility error detected:', error.message)
    })
    
    // 网络错误处理器
    this.registerHandler('network', async (error) => {
      console.error('Network error detected:', error.message)
    })
    
    // 未知错误处理器
    this.registerHandler('unknown', async (error) => {
      console.error('Unknown error detected:', error.message)
    })
  }

  private registerDefaultRecoveryStrategies(): void {
    // 配置错误恢复
    this.registerRecoveryStrategy(WatermarkErrorCode.INVALID_CONFIG, async (error) => {
      console.log('Attempting to recover from invalid config...')
      // 尝试使用默认配置
      return true
    })
    
    // 渲染错误恢复
    this.registerRecoveryStrategy(WatermarkErrorCode.RENDER_FAILED, async (error) => {
      console.log('Attempting to recover from render failure...')
      // 尝试重新渲染
      return false // 需要具体实现
    })
    
    // 实例创建失败恢复
    this.registerRecoveryStrategy(WatermarkErrorCode.INSTANCE_CREATION_FAILED, async (error) => {
      console.log('Attempting to recover from instance creation failure...')
      // 尝试清理并重新创建
      return false // 需要具体实现
    })
  }
}