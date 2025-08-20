/**
 * Vue I18n 性能监控和调试工具
 *
 * 提供：
 * - 翻译性能监控
 * - 内存使用跟踪
 * - 缓存命中率统计
 * - 渲染性能分析
 * - 调试信息收集
 */

import type { I18nInstance, TranslationParams } from '../core/types'
import { computed, reactive, ref } from 'vue'

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  translationCount: number
  averageTranslationTime: number
  cacheHitRate: number
  memoryUsage: number
  slowTranslations: Array<{
    key: string
    time: number
    params?: TranslationParams
    timestamp: number
  }>
  errorCount: number
  lastError?: Error
}

/**
 * 调试信息接口
 */
export interface DebugInfo {
  translationKey: string
  translationTime: number
  cacheHit: boolean
  params?: TranslationParams
  result: string
  timestamp: number
  stackTrace?: string
}

/**
 * 性能监控器
 */
export class I18nPerformanceMonitor {
  private i18n: I18nInstance
  private metrics = reactive<PerformanceMetrics>({
    translationCount: 0,
    averageTranslationTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    slowTranslations: [],
    errorCount: 0,
  })

  private debugLogs = reactive<DebugInfo[]>([])
  private translationTimes: number[] = []
  private cacheHits = 0
  private cacheMisses = 0
  private isEnabled = ref(false)
  private slowThreshold = 10 // 毫秒
  private maxLogs = 1000
  private maxSlowTranslations = 100

  constructor(i18n: I18nInstance) {
    this.i18n = i18n
    this.setupMonitoring()
  }

  /**
   * 设置监控
   */
  private setupMonitoring(): void {
    // 包装原始翻译方法
    const originalT = this.i18n.t.bind(this.i18n)

    this.i18n.t = (key: string, params?: TranslationParams, options?: any): any => {
      if (!this.isEnabled.value) {
        return originalT(key, params, options)
      }

      const startTime = performance.now()
      const stackTrace = this.captureStackTrace()

      try {
        const result = originalT(key, params, options)
        const endTime = performance.now()
        const translationTime = endTime - startTime

        this.recordTranslation(key, translationTime, params, result, stackTrace)

        return result
      }
      catch (error) {
        const endTime = performance.now()
        const translationTime = endTime - startTime

        this.recordError(key, translationTime, params, error as Error, stackTrace)
        throw error
      }
    }
  }

  /**
   * 记录翻译性能
   */
  private recordTranslation(
    key: string,
    time: number,
    params?: TranslationParams,
    result?: string,
    stackTrace?: string,
  ): void {
    this.metrics.translationCount++
    this.translationTimes.push(time)

    // 计算平均时间
    this.metrics.averageTranslationTime
      = this.translationTimes.reduce((sum, t) => sum + t, 0) / this.translationTimes.length

    // 记录慢翻译
    if (time > this.slowThreshold) {
      this.metrics.slowTranslations.unshift({
        key,
        time,
        params,
        timestamp: Date.now(),
      })

      // 限制慢翻译记录数量
      if (this.metrics.slowTranslations.length > this.maxSlowTranslations) {
        this.metrics.slowTranslations.pop()
      }
    }

    // 记录调试信息
    this.addDebugLog({
      translationKey: key,
      translationTime: time,
      cacheHit: false, // TODO: 实际检测缓存命中
      params,
      result: result || '',
      timestamp: Date.now(),
      stackTrace,
    })

    // 更新内存使用
    this.updateMemoryUsage()
  }

  /**
   * 记录错误
   */
  private recordError(
    key: string,
    time: number,
    params?: TranslationParams,
    error?: Error,
    stackTrace?: string,
  ): void {
    this.metrics.errorCount++
    this.metrics.lastError = error

    this.addDebugLog({
      translationKey: key,
      translationTime: time,
      cacheHit: false,
      params,
      result: `ERROR: ${error?.message || 'Unknown error'}`,
      timestamp: Date.now(),
      stackTrace,
    })
  }

  /**
   * 添加调试日志
   */
  private addDebugLog(info: DebugInfo): void {
    this.debugLogs.unshift(info)

    // 限制日志数量
    if (this.debugLogs.length > this.maxLogs) {
      this.debugLogs.pop()
    }
  }

  /**
   * 捕获堆栈跟踪
   */
  private captureStackTrace(): string {
    try {
      throw new Error('Stack trace capture')
    }
    catch (error) {
      return (error as Error).stack || ''
    }
  }

  /**
   * 更新内存使用
   */
  private updateMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      const memory = (window.performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize
    }
  }

  /**
   * 启用监控
   */
  enable(): void {
    this.isEnabled.value = true
  }

  /**
   * 禁用监控
   */
  disable(): void {
    this.isEnabled.value = false
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 获取调试日志
   */
  getDebugLogs(): DebugInfo[] {
    return [...this.debugLogs]
  }

  /**
   * 清除所有数据
   */
  clear(): void {
    this.metrics.translationCount = 0
    this.metrics.averageTranslationTime = 0
    this.metrics.cacheHitRate = 0
    this.metrics.memoryUsage = 0
    this.metrics.slowTranslations.length = 0
    this.metrics.errorCount = 0
    this.metrics.lastError = undefined

    this.debugLogs.length = 0
    this.translationTimes.length = 0
    this.cacheHits = 0
    this.cacheMisses = 0
  }

  /**
   * 设置慢翻译阈值
   */
  setSlowThreshold(threshold: number): void {
    this.slowThreshold = threshold
  }

  /**
   * 设置最大日志数量
   */
  setMaxLogs(maxLogs: number): void {
    this.maxLogs = maxLogs
  }

  /**
   * 导出性能报告
   */
  exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.getMetrics(),
      debugLogs: this.getDebugLogs(),
      configuration: {
        slowThreshold: this.slowThreshold,
        maxLogs: this.maxLogs,
        isEnabled: this.isEnabled.value,
      },
    }

    return JSON.stringify(report, null, 2)
  }

  /**
   * 获取性能建议
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.metrics.averageTranslationTime > 5) {
      recommendations.push('平均翻译时间较长，考虑启用缓存或优化翻译逻辑')
    }

    if (this.metrics.slowTranslations.length > 10) {
      recommendations.push('存在多个慢翻译，检查翻译键的复杂度和参数处理')
    }

    if (this.metrics.errorCount > 0) {
      recommendations.push('存在翻译错误，检查翻译键的有效性和参数格式')
    }

    if (this.metrics.cacheHitRate < 0.8) {
      recommendations.push('缓存命中率较低，考虑优化缓存策略')
    }

    if (this.metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push('内存使用较高，考虑清理不必要的翻译缓存')
    }

    return recommendations
  }

  /**
   * 获取响应式状态
   */
  getReactiveState() {
    return {
      metrics: computed(() => this.metrics),
      debugLogs: computed(() => this.debugLogs),
      isEnabled: this.isEnabled,
      recommendations: computed(() => this.getPerformanceRecommendations()),
    }
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(i18n: I18nInstance): I18nPerformanceMonitor {
  return new I18nPerformanceMonitor(i18n)
}

/**
 * 性能监控选项
 */
export interface PerformanceMonitorOptions {
  enabled?: boolean
  slowThreshold?: number
  maxLogs?: number
  autoStart?: boolean
}
