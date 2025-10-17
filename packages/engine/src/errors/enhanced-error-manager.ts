/**
 * 增强型错误管理器
 * 提供高级错误处理、恢复和分析功能
 */

import type { Logger } from '../types'
import type { Engine } from '../types/engine'

// ==================== 类型定义 ====================

export interface ErrorContext {
  component?: string
  module?: string
  action?: string
  user?: string
  timestamp?: number
  environment?: Record<string, unknown>
  stack?: string
  data?: unknown
}

export interface ErrorRecoveryStrategy {
  name: string
  condition: (error: Error) => boolean
  recover: (error: Error, context: ErrorContext) => Promise<boolean>
  maxAttempts?: number
}

export interface ErrorReport {
  id: string
  error: Error
  context: ErrorContext
  handled: boolean
  recovered: boolean
  attempts: number
  timestamp: number
  fingerprint: string
}

export interface ErrorStatistics {
  total: number
  handled: number
  recovered: number
  byType: Map<string, number>
  byModule: Map<string, number>
  timeline: Array<{ time: number; count: number }>
}

export type ErrorHandler = (error: Error, context: ErrorContext) => void | Promise<void>
export type ErrorFilter = (error: Error) => boolean

// ==================== 实现 ====================

export class EnhancedErrorManager {
  private errors = new Map<string, ErrorReport>()
  private handlers = new Map<string, ErrorHandler>()
  private recoveryStrategies = new Map<string, ErrorRecoveryStrategy>()
  private filters = new Set<ErrorFilter>()
  private statistics: ErrorStatistics
  private logger?: Logger
  private engine?: Engine
  private reportingEndpoint?: string
  private batchReportInterval?: number
  private errorQueue: ErrorReport[] = []
  private isReporting = false

  constructor(engine?: Engine) {
    this.engine = engine
    this.logger = engine?.logger
    this.statistics = this.initStatistics()
    this.setupGlobalHandlers()
    this.setupDefaultStrategies()
  }

  // ==================== 公共 API ====================

  /**
   * 处理错误
   */
  async handle(error: Error, context: ErrorContext = {}): Promise<ErrorReport> {
    // 应用过滤器
    if (this.shouldFilter(error)) {
      this.logger?.debug('Error filtered', { error })
      return this.createReport(error, context, true, false)
    }

    // 创建错误报告
    const report = this.createReport(error, context)
    this.errors.set(report.id, report)
    
    // 更新统计
    this.updateStatistics(report)
    
    // 尝试恢复
    const recovered = await this.tryRecover(error, context, report)
    report.recovered = recovered
    
    // 执行处理器
    await this.executeHandlers(error, context)
    
    // 记录日志
    this.logError(error, context, recovered)
    
    // 添加到上报队列
    if (!recovered) {
      this.queueForReporting(report)
    }
    
    return report
  }

  /**
   * 注册错误处理器
   */
  registerHandler(name: string, handler: ErrorHandler): void {
    this.handlers.set(name, handler)
  }

  /**
   * 注册恢复策略
   */
  registerRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.name, strategy)
  }

  /**
   * 添加错误过滤器
   */
  addFilter(filter: ErrorFilter): void {
    this.filters.add(filter)
  }

  /**
   * 创建错误边界
   */
  createBoundary<T>(
    fn: () => T | Promise<T>,
    context?: ErrorContext,
    fallback?: T
  ): T | Promise<T> {
    try {
      const result = fn()
      if (result instanceof Promise) {
        return result.catch(error => {
          this.handle(error, context)
          if (fallback !== undefined) return fallback
          throw error
        })
      }
      return result
    } catch (error) {
      this.handle(error as Error, context)
      if (fallback !== undefined) return fallback
      throw error
    }
  }

  /**
   * 包装函数以自动处理错误
   */
  wrap<T extends (...args: any[]) => any>(
    fn: T,
    context?: ErrorContext
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args)
        if (result instanceof Promise) {
          return result.catch(error => {
            this.handle(error, context)
            throw error
          })
        }
        return result
      } catch (error) {
        this.handle(error as Error, context)
        throw error
      }
    }) as T
  }

  /**
   * 获取错误统计
   */
  getStatistics(): ErrorStatistics {
    return { ...this.statistics }
  }

  /**
   * 获取错误报告
   */
  getReport(id: string): ErrorReport | undefined {
    return this.errors.get(id)
  }

  /**
   * 获取所有错误报告
   */
  getAllReports(): ErrorReport[] {
    return Array.from(this.errors.values())
  }

  /**
   * 清除错误历史
   */
  clearHistory(): void {
    this.errors.clear()
    this.statistics = this.initStatistics()
  }

  /**
   * 设置错误上报端点
   */
  setReportingEndpoint(url: string, batchInterval = 5000): void {
    this.reportingEndpoint = url
    this.batchReportInterval = batchInterval
    this.startBatchReporting()
  }

  // ==================== 私有方法 ====================

  private initStatistics(): ErrorStatistics {
    return {
      total: 0,
      handled: 0,
      recovered: 0,
      byType: new Map(),
      byModule: new Map(),
      timeline: []
    }
  }

  private setupGlobalHandlers(): void {
    if (typeof window !== 'undefined') {
      // 浏览器环境
      window.addEventListener('error', event => {
        this.handle(new Error(event.message), {
          component: 'window',
          stack: event.error?.stack
        })
      })

      window.addEventListener('unhandledrejection', event => {
        this.handle(new Error(`Unhandled Promise rejection: ${event.reason}`), {
          component: 'promise',
          data: event.reason
        })
      })
    } else if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
      // Node.js 环境 - 安全访问
      const proc = (globalThis as any).process
      if (proc && proc.on) {
        proc.on('uncaughtException', (error: Error) => {
          this.handle(error, { component: 'process' })
        })

        proc.on('unhandledRejection', (reason: any) => {
          this.handle(new Error(`Unhandled Promise rejection: ${reason}`), {
            component: 'promise',
            data: reason
          })
        })
      }
    }
  }

  private setupDefaultStrategies(): void {
    // 网络错误重试策略
    this.registerRecoveryStrategy({
      name: 'network-retry',
      condition: error => error.message.includes('network') || error.message.includes('fetch'),
      recover: async (_error, _context) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        // 这里应该重试原始操作
        return false // 简化示例
      },
      maxAttempts: 3
    })

    // 内存不足策略
    this.registerRecoveryStrategy({
      name: 'memory-cleanup',
      condition: error => error.message.toLowerCase().includes('memory'),
      recover: async () => {
        if (typeof globalThis.gc === 'function') {
          globalThis.gc()
        }
        // 清理缓存
        this.engine?.cache?.clear()
        return true
      },
      maxAttempts: 1
    })

    // 权限错误策略
    this.registerRecoveryStrategy({
      name: 'permission-request',
      condition: error => error.message.includes('permission') || error.message.includes('denied'),
      recover: async (error, context) => {
        // 可以触发重新授权流程
        this.engine?.events?.emit('permission-required', { error, context })
        return false
      },
      maxAttempts: 1
    })
  }

  private createReport(
    error: Error,
    context: ErrorContext,
    handled = false,
    recovered = false
  ): ErrorReport {
    const id = this.generateId()
    const fingerprint = this.generateFingerprint(error, context)
    
    return {
      id,
      error,
      context: {
        ...context,
        timestamp: Date.now(),
        environment: this.getEnvironment()
      },
      handled,
      recovered,
      attempts: 0,
      timestamp: Date.now(),
      fingerprint
    }
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateFingerprint(error: Error, context: ErrorContext): string {
    const key = `${error.name}_${error.message}_${context.module || 'unknown'}_${context.action || 'unknown'}`
    return btoa(key).replace(/=/g, '').substr(0, 16)
  }

  private getEnvironment(): Record<string, unknown> {
    const env: Record<string, unknown> = {}
    
    if (typeof window !== 'undefined') {
      env.userAgent = navigator.userAgent
      env.platform = navigator.platform
      env.language = navigator.language
      env.screenResolution = `${screen.width}x${screen.height}`
      env.viewport = `${window.innerWidth}x${window.innerHeight}`
      env.url = window.location.href
    }
    
    if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
      const proc = (globalThis as any).process
      if (proc) {
        env.nodeVersion = proc.version
        env.platform = proc.platform
        env.arch = proc.arch
      }
    }
    
    return env
  }

  private shouldFilter(error: Error): boolean {
    return Array.from(this.filters).some(filter => filter(error))
  }

  private async tryRecover(
    error: Error,
    context: ErrorContext,
    report: ErrorReport
  ): Promise<boolean> {
    for (const strategy of this.recoveryStrategies.values()) {
      if (strategy.condition(error)) {
        const maxAttempts = strategy.maxAttempts || 1
        
        if (report.attempts < maxAttempts) {
          report.attempts++
          
          try {
            const recovered = await strategy.recover(error, context)
            if (recovered) {
              this.logger?.info(`Error recovered using strategy: ${strategy.name}`)
              return true
            }
          } catch (recoveryError) {
            this.logger?.error(`Recovery strategy failed: ${strategy.name}`, recoveryError)
          }
        }
      }
    }
    
    return false
  }

  private async executeHandlers(error: Error, context: ErrorContext): Promise<void> {
    const promises = Array.from(this.handlers.values()).map(handler => {
      try {
        return Promise.resolve(handler(error, context))
      } catch (handlerError) {
        this.logger?.error('Error handler failed', handlerError)
        return Promise.resolve()
      }
    })
    
    await Promise.all(promises)
  }

  private logError(error: Error, context: ErrorContext, recovered: boolean): void {
    const level = recovered ? 'warn' : 'error'
    const message = recovered ? 'Error handled and recovered' : 'Error handled'
    
    this.logger?.[level](message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      recovered
    })
  }

  private updateStatistics(report: ErrorReport): void {
    this.statistics.total++
    
    if (report.handled) {
      this.statistics.handled++
    }
    
    if (report.recovered) {
      this.statistics.recovered++
    }
    
    // 更新类型统计
    const errorType = report.error.name || 'UnknownError'
    this.statistics.byType.set(
      errorType,
      (this.statistics.byType.get(errorType) || 0) + 1
    )
    
    // 更新模块统计
    const module = report.context.module || 'unknown'
    this.statistics.byModule.set(
      module,
      (this.statistics.byModule.get(module) || 0) + 1
    )
    
    // 更新时间线
    const now = Date.now()
    const lastEntry = this.statistics.timeline[this.statistics.timeline.length - 1]
    
    if (lastEntry && now - lastEntry.time < 60000) {
      lastEntry.count++
    } else {
      this.statistics.timeline.push({ time: now, count: 1 })
      
      // 保留最近24小时的数据
      const cutoff = now - 24 * 60 * 60 * 1000
      this.statistics.timeline = this.statistics.timeline.filter(
        entry => entry.time > cutoff
      )
    }
  }

  private queueForReporting(report: ErrorReport): void {
    if (this.reportingEndpoint) {
      this.errorQueue.push(report)
    }
  }

  private startBatchReporting(): void {
    if (this.isReporting) return
    
    this.isReporting = true
    
    const reportBatch = async () => {
      if (this.errorQueue.length === 0) {
        setTimeout(reportBatch, this.batchReportInterval || 5000)
        return
      }
      
      const batch = this.errorQueue.splice(0, 10) // 每次最多发送10个
      
      try {
        await this.sendReports(batch)
      } catch (error) {
        this.logger?.error('Failed to send error reports', error)
        // 将失败的报告重新加入队列
        this.errorQueue.unshift(...batch)
      }
      
      setTimeout(reportBatch, this.batchReportInterval || 5000)
    }
    
    setTimeout(reportBatch, this.batchReportInterval || 5000)
  }

  private async sendReports(reports: ErrorReport[]): Promise<void> {
    if (!this.reportingEndpoint) return
    
    const payload = reports.map(report => ({
      id: report.id,
      fingerprint: report.fingerprint,
      timestamp: report.timestamp,
      error: {
        name: report.error.name,
        message: report.error.message,
        stack: report.error.stack
      },
      context: report.context,
      recovered: report.recovered,
      attempts: report.attempts
    }))
    
    const response = await fetch(this.reportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to send reports: ${response.statusText}`)
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.isReporting = false
    this.handlers.clear()
    this.recoveryStrategies.clear()
    this.filters.clear()
    this.errors.clear()
    this.errorQueue = []
  }
}

// 导出工厂函数
export function createEnhancedErrorManager(engine?: Engine): EnhancedErrorManager {
  return new EnhancedErrorManager(engine)
}