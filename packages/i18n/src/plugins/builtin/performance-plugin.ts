/**
 * 性能监控插件
 *
 * 提供：
 * - 翻译性能监控
 * - 性能指标收集
 * - 性能报告生成
 * - 性能优化建议
 */

import type { I18nInstance } from '../../core/types'
import type { I18nPlugin } from '../registry'

/**
 * 性能监控插件配置
 */
export interface PerformancePluginConfig {
  /** 是否启用监控 */
  enabled?: boolean
  /** 慢翻译阈值（毫秒） */
  slowThreshold?: number
  /** 最大记录数量 */
  maxRecords?: number
  /** 采样率 (0-1) */
  sampleRate?: number
  /** 是否收集堆栈跟踪 */
  collectStackTrace?: boolean
  /** 报告间隔（毫秒） */
  reportInterval?: number
}

/**
 * 性能记录
 */
interface PerformanceRecord {
  key: string
  params?: any
  duration: number
  timestamp: number
  stackTrace?: string
  memoryUsage?: number
}

/**
 * 性能指标
 */
interface PerformanceMetrics {
  totalTranslations: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  slowTranslations: PerformanceRecord[]
  memoryUsage: number
  cacheHitRate?: number
}

/**
 * 性能监控器
 */
class PerformanceMonitor {
  private config: Required<PerformancePluginConfig>
  private records: PerformanceRecord[] = []
  private metrics: PerformanceMetrics = {
    totalTranslations: 0,
    averageDuration: 0,
    minDuration: Infinity,
    maxDuration: 0,
    slowTranslations: [],
    memoryUsage: 0,
  }

  private reportTimer?: NodeJS.Timeout

  constructor(config: PerformancePluginConfig) {
    this.config = {
      enabled: true,
      slowThreshold: 10,
      maxRecords: 1000,
      sampleRate: 1.0,
      collectStackTrace: false,
      reportInterval: 60000, // 1分钟
      ...config,
    }

    if (this.config.reportInterval > 0) {
      this.startReportTimer()
    }
  }

  /**
   * 记录翻译性能
   */
  recordTranslation(
    key: string,
    params: any,
    duration: number,
    stackTrace?: string,
  ): void {
    if (!this.config.enabled)
      return

    // 采样检查
    if (Math.random() > this.config.sampleRate)
      return

    const record: PerformanceRecord = {
      key,
      params,
      duration,
      timestamp: Date.now(),
      stackTrace: this.config.collectStackTrace ? stackTrace : undefined,
      memoryUsage: this.getMemoryUsage(),
    }

    // 添加记录
    this.records.push(record)

    // 限制记录数量
    if (this.records.length > this.config.maxRecords) {
      this.records.shift()
    }

    // 更新指标
    this.updateMetrics(record)
  }

  /**
   * 更新性能指标
   */
  private updateMetrics(record: PerformanceRecord): void {
    this.metrics.totalTranslations++

    // 更新持续时间统计
    this.metrics.minDuration = Math.min(this.metrics.minDuration, record.duration)
    this.metrics.maxDuration = Math.max(this.metrics.maxDuration, record.duration)

    // 计算平均持续时间
    const totalDuration = this.records.reduce((sum, r) => sum + r.duration, 0)
    this.metrics.averageDuration = totalDuration / this.records.length

    // 记录慢翻译
    if (record.duration > this.config.slowThreshold) {
      this.metrics.slowTranslations.push(record)

      // 限制慢翻译记录数量
      if (this.metrics.slowTranslations.length > 100) {
        this.metrics.slowTranslations.shift()
      }
    }

    // 更新内存使用
    this.metrics.memoryUsage = record.memoryUsage || 0
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 获取性能记录
   */
  getRecords(): PerformanceRecord[] {
    return [...this.records]
  }

  /**
   * 清除记录
   */
  clearRecords(): void {
    this.records = []
    this.metrics = {
      totalTranslations: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      slowTranslations: [],
      memoryUsage: 0,
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const metrics = this.getMetrics()
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTranslations: metrics.totalTranslations,
        averageDuration: `${metrics.averageDuration.toFixed(2)}ms`,
        minDuration: `${metrics.minDuration}ms`,
        maxDuration: `${metrics.maxDuration}ms`,
        slowTranslationsCount: metrics.slowTranslations.length,
        memoryUsage: `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      },
      slowTranslations: metrics.slowTranslations.slice(-10).map(record => ({
        key: record.key,
        duration: `${record.duration}ms`,
        timestamp: new Date(record.timestamp).toISOString(),
        params: record.params,
      })),
      recommendations: this.getRecommendations(),
    }

    return JSON.stringify(report, null, 2)
  }

  /**
   * 获取优化建议
   */
  getRecommendations(): string[] {
    const recommendations: string[] = []
    const metrics = this.getMetrics()

    if (metrics.averageDuration > 5) {
      recommendations.push('平均翻译时间较长，考虑启用缓存或优化翻译逻辑')
    }

    if (metrics.slowTranslations.length > 10) {
      recommendations.push('存在多个慢翻译，检查翻译键的复杂度和参数处理')
    }

    if (metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('内存使用较高，考虑清理不必要的翻译缓存')
    }

    const slowKeys = new Set(metrics.slowTranslations.map(r => r.key))
    if (slowKeys.size < metrics.slowTranslations.length / 2) {
      recommendations.push('某些翻译键重复出现性能问题，需要重点优化')
    }

    return recommendations
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if (typeof globalThis.process !== 'undefined' && globalThis.process.memoryUsage) {
      return globalThis.process.memoryUsage().heapUsed
    }

    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      return (window.performance as any).memory.usedJSHeapSize
    }

    return 0
  }

  /**
   * 启动报告定时器
   */
  private startReportTimer(): void {
    this.reportTimer = setInterval(() => {
      if (this.metrics.totalTranslations > 0) {
        console.warn('I18n Performance Report:', this.generateReport())
      }
    }, this.config.reportInterval)
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = undefined
    }
    this.clearRecords()
  }
}

/**
 * 性能监控插件
 */
export const performancePlugin: I18nPlugin = {
  name: 'performance',
  version: '1.0.0',
  description: 'Performance monitoring plugin for I18n',
  author: 'LDesign Team',

  install(i18n: I18nInstance, options: PerformancePluginConfig = {}) {
    const monitor = new PerformanceMonitor(options)

    // 包装翻译方法
    const originalT = i18n.t.bind(i18n)
    i18n.t = (key: string, params?: any, options?: any): any => {
      const startTime = performance.now()

      // 收集堆栈跟踪
      let stackTrace: string | undefined
      if (monitor.config.collectStackTrace) {
        try {
          throw new Error('Stack trace capture')
        }
        catch (error) {
          stackTrace = (error as Error).stack
        }
      }

      try {
        const result = originalT(key, params, options)
        const duration = performance.now() - startTime

        // 记录性能
        monitor.recordTranslation(key, params, duration, stackTrace)

        return result
      }
      catch (error) {
        const duration = performance.now() - startTime
        monitor.recordTranslation(key, params, duration, stackTrace)
        throw error
      }
    }

      // 添加性能监控方法
      ; (i18n as any).performance = {
        getMetrics: () => monitor.getMetrics(),
        getRecords: () => monitor.getRecords(),
        clearRecords: () => monitor.clearRecords(),
        generateReport: () => monitor.generateReport(),
        getRecommendations: () => monitor.getRecommendations(),
      }

      // 保存监控器引用
      ; (i18n as any)._performanceMonitor = monitor
  },

  uninstall(i18n: I18nInstance) {
    const monitor = (i18n as any)._performanceMonitor
    if (monitor) {
      monitor.destroy()
      delete (i18n as any)._performanceMonitor
      delete (i18n as any).performance
    }
  },
}
