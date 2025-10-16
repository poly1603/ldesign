/**
 * 错误报告和监控系统
 * 提供错误收集、分析和上报功能
 */

import type { ApiError, ErrorSeverity } from './ApiError'

/**
 * 错误报告配置
 */
export interface ErrorReporterConfig {
  /** 是否启用错误报告 */
  enabled?: boolean
  /** 报告端点URL */
  endpoint?: string
  /** API密钥 */
  apiKey?: string
  /** 采样率 (0-1) */
  sampleRate?: number
  /** 最大错误缓存数量 */
  maxCacheSize?: number
  /** 批量上报间隔 (毫秒) */
  batchInterval?: number
  /** 是否在开发环境启用 */
  enableInDevelopment?: boolean
  /** 自定义过滤器 */
  filter?: (error: ApiError) => boolean
  /** 自定义转换器 */
  transform?: (error: ApiError) => any
}

/**
 * 错误统计信息
 */
export interface ErrorStats {
  /** 总错误数 */
  total: number
  /** 按类型分组的错误数 */
  byType: Record<string, number>
  /** 按严重程度分组的错误数 */
  bySeverity: Record<ErrorSeverity, number>
  /** 按方法名分组的错误数 */
  byMethod: Record<string, number>
  /** 最近的错误 */
  recent: ApiError[]
  /** 统计时间范围 */
  timeRange: {
    start: number
    end: number
  }
}

/**
 * 错误报告器
 */
export class ErrorReporter {
  private config: Required<ErrorReporterConfig>
  private errorCache: ApiError[] = []
  private stats: ErrorStats
  private batchTimer?: NodeJS.Timeout
  private listeners: Array<(error: ApiError) => void> = []

  constructor(config: ErrorReporterConfig = {}) {
    this.config = {
      enabled: true,
      endpoint: '',
      apiKey: '',
      sampleRate: 1.0,
      maxCacheSize: 100,
      batchInterval: 5000,
      enableInDevelopment: false,
      filter: () => true,
      transform: error => error.toJSON(),
      ...config,
    }

    this.stats = this.initStats()
    this.startBatchReporting()
  }

  /**
   * 初始化统计信息
   */
  private initStats(): ErrorStats {
    return {
      total: 0,
      byType: {},
      bySeverity: {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        CRITICAL: 0,
      },
      byMethod: {},
      recent: [],
      timeRange: {
        start: Date.now(),
        end: Date.now(),
      },
    }
  }

  /**
   * 报告错误
   */
  report(error: ApiError): void {
    if (!this.shouldReport(error)) {
      return
    }

    // 更新统计信息
    this.updateStats(error)

    // 添加到缓存
    this.addToCache(error)

    // 触发监听器
    this.notifyListeners(error)

    // 在开发环境下直接输出到控制台
    if (this.isDevelopment()) {
      this.logToConsole(error)
    }
  }

  /**
   * 判断是否应该报告错误
   */
  private shouldReport(error: ApiError): boolean {
    if (!this.config?.enabled) {
      return false
    }

    if (!this.config?.enableInDevelopment && this.isDevelopment()) {
      return false
    }

    if (Math.random() > this.config?.sampleRate) {
      return false
    }

    return this.config?.filter(error)
  }

  /**
   * 更新统计信息
   */
  private updateStats(error: ApiError): void {
    this.stats.total++
    this.stats.byType[error.type] = (this.stats.byType[error.type] || 0) + 1
    this.stats.bySeverity[error.severity]++

    if (error.context.methodName) {
      this.stats.byMethod[error.context.methodName]
        = (this.stats.byMethod[error.context.methodName] || 0) + 1
    }

    this.stats.recent.unshift(error)
    if (this.stats.recent.length > 10) {
      this.stats.recent = this.stats.recent.slice(0, 10)
    }

    this.stats.timeRange.end = Date.now()
  }

  /**
   * 添加到缓存
   */
  private addToCache(error: ApiError): void {
    this.errorCache.unshift(error)
    if (this.errorCache.length > this.config?.maxCacheSize) {
      this.errorCache = this.errorCache.slice(0, this.config?.maxCacheSize)
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(error: ApiError): void {
    this.listeners.forEach((listener) => {
      try {
        listener(error)
      }
      catch (e) {
        console.warn('Error in error listener:', e)
      }
    })
  }

  /**
   * 输出到控制台
   */
  private logToConsole(error: ApiError): void {
    const style = this.getConsoleStyle(error.severity)

    console.group(`%c🚨 API Error [${error.type}]`, style)
    console.error('Message:', error.userMessage)
    console.error('Developer Message:', error.developerMessage)
    console.error('Method:', error.context.methodName)
    console.error('Severity:', error.severity)
    console.error('Suggestions:', error.suggestions)
    if (error.originalError) {
      console.error('Original Error:', error.originalError)
    }
    console.groupEnd()
  }

  /**
   * 获取控制台样式
   */
  private getConsoleStyle(severity: ErrorSeverity): string {
    switch (severity) {
      case 'CRITICAL':
        return 'color: white; background-color: #dc2626; font-weight: bold; padding: 2px 6px; border-radius: 3px;'
      case 'HIGH':
        return 'color: white; background-color: #ea580c; font-weight: bold; padding: 2px 6px; border-radius: 3px;'
      case 'MEDIUM':
        return 'color: white; background-color: #d97706; font-weight: bold; padding: 2px 6px; border-radius: 3px;'
      case 'LOW':
        return 'color: white; background-color: #65a30d; font-weight: bold; padding: 2px 6px; border-radius: 3px;'
      default:
        return 'color: white; background-color: #6b7280; font-weight: bold; padding: 2px 6px; border-radius: 3px;'
    }
  }

  /**
   * 开始批量报告
   */
  private startBatchReporting(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer)
    }

    this.batchTimer = setInterval(() => {
      this.flushCache()
    }, this.config?.batchInterval)
  }

  /**
   * 刷新缓存，发送错误报告
   */
  private async flushCache(): Promise<void> {
    if (this.errorCache.length === 0 || !this.config?.endpoint) {
      return
    }

    const errors = this.errorCache.splice(0)
    const payload = {
      errors: errors.map(error => this.config?.transform(error)),
      stats: this.stats,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
    }

    try {
      await this.sendReport(payload)
    }
    catch (error) {
      console.warn('Failed to send error report:', error)
      // 将错误重新加入缓存
      this.errorCache.unshift(...errors)
    }
  }

  /**
   * 发送报告
   */
  private async sendReport(payload: any): Promise<void> {
    const response = await fetch(this.config?.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config?.apiKey && { Authorization: `Bearer ${this.config?.apiKey}` }),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  /**
   * 判断是否为开发环境
   */
  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
      || typeof window !== 'undefined' && window.location.hostname === 'localhost'
  }

  /**
   * 添加错误监听器
   */
  addListener(listener: (error: ApiError) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 获取错误统计
   */
  getStats(): ErrorStats {
    return { ...this.stats }
  }

  /**
   * 清除统计信息
   */
  clearStats(): void {
    this.stats = this.initStats()
  }

  /**
   * 获取缓存的错误
   */
  getCachedErrors(): ApiError[] {
    return [...this.errorCache]
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.errorCache = []
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ErrorReporterConfig>): void {
    this.config = { ...this.config, ...config }
    this.startBatchReporting()
  }

  /**
   * 销毁报告器
   */
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer)
      this.batchTimer = undefined
    }
    this.flushCache()
    this.listeners = []
  }
}

/**
 * 全局错误报告器实例
 */
let globalReporter: ErrorReporter | null = null

/**
 * 获取全局错误报告器
 */
export function getGlobalErrorReporter(): ErrorReporter | null {
  return globalReporter
}

/**
 * 设置全局错误报告器
 */
export function setGlobalErrorReporter(reporter: ErrorReporter | null): void {
  globalReporter = reporter
}

/**
 * 创建错误报告器
 */
export function createErrorReporter(config?: ErrorReporterConfig): ErrorReporter {
  return new ErrorReporter(config)
}
