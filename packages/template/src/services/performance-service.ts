/**
 * 性能监控服务
 * 提供模板加载性能监控和优化建议
 */

import type { EventData, EventListener } from '../types'

/**
 * 性能指标接口
 */
interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  category: 'loading' | 'rendering' | 'caching' | 'scanning'
  metadata?: Record<string, any>
}

/**
 * 性能报告接口
 */
interface PerformanceReport {
  period: {
    start: number
    end: number
    duration: number
  }
  metrics: {
    loading: {
      averageTime: number
      totalRequests: number
      successRate: number
      slowestTemplates: Array<{ template: string, time: number }>
    }
    caching: {
      hitRate: number
      missCount: number
      evictionCount: number
      memoryUsage: number
    }
    scanning: {
      averageTime: number
      totalScans: number
      templatesFound: number
    }
    rendering: {
      averageTime: number
      totalRenders: number
      errorRate: number
    }
  }
  recommendations: string[]
}

/**
 * 性能配置接口
 */
interface PerformanceConfig {
  enabled: boolean
  sampleRate: number
  reportInterval: number
  maxMetrics: number
  thresholds: {
    slowLoading: number
    lowCacheHitRate: number
    highMemoryUsage: number
  }
}

/**
 * 性能监控服务类
 */
export class PerformanceService {
  private config: PerformanceConfig
  private metrics: PerformanceMetric[] = []
  private listeners = new Map<string, EventListener[]>()
  private reportTimer: NodeJS.Timeout | null = null
  private startTime = Date.now()

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      sampleRate: config.sampleRate ?? 1.0, // 100% 采样
      reportInterval: config.reportInterval ?? 60000, // 1分钟
      maxMetrics: config.maxMetrics ?? 1000,
      thresholds: {
        slowLoading: config.thresholds?.slowLoading ?? 2000, // 2秒
        lowCacheHitRate: config.thresholds?.lowCacheHitRate ?? 0.8, // 80%
        highMemoryUsage: config.thresholds?.highMemoryUsage ?? 50 * 1024 * 1024, // 50MB
        ...config.thresholds,
      },
    }

    if (this.config.enabled) {
      this.startReporting()
    }
  }

  /**
   * 记录性能指标
   */
  recordMetric(
    name: string,
    value: number,
    unit: string,
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>,
  ): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return
    }

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      category,
      metadata,
    }

    this.metrics.push(metric)

    // 限制指标数量
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics)
    }

    this.emit('performance:metric', { metric })
  }

  /**
   * 记录模板加载时间
   */
  recordLoadTime(templateName: string, loadTime: number, fromCache: boolean): void {
    this.recordMetric(
      'template_load_time',
      loadTime,
      'ms',
      'loading',
      { templateName, fromCache },
    )

    // 检查是否超过阈值
    if (loadTime > this.config.thresholds.slowLoading) {
      this.emit('performance:warning', {
        type: 'slow_loading',
        template: templateName,
        loadTime,
        threshold: this.config.thresholds.slowLoading,
      })
    }
  }

  /**
   * 记录渲染时间
   */
  recordRenderTime(templateName: string, renderTime: number): void {
    this.recordMetric(
      'template_render_time',
      renderTime,
      'ms',
      'rendering',
      { templateName },
    )
  }

  /**
   * 记录扫描时间
   */
  recordScanTime(scanTime: number, templatesFound: number): void {
    this.recordMetric(
      'template_scan_time',
      scanTime,
      'ms',
      'scanning',
      { templatesFound },
    )
  }

  /**
   * 记录缓存指标
   */
  recordCacheMetrics(hitRate: number, memoryUsage: number): void {
    this.recordMetric('cache_hit_rate', hitRate, '%', 'caching')
    this.recordMetric('cache_memory_usage', memoryUsage, 'bytes', 'caching')

    // 检查缓存命中率
    if (hitRate < this.config.thresholds.lowCacheHitRate) {
      this.emit('performance:warning', {
        type: 'low_cache_hit_rate',
        hitRate,
        threshold: this.config.thresholds.lowCacheHitRate,
      })
    }

    // 检查内存使用
    if (memoryUsage > this.config.thresholds.highMemoryUsage) {
      this.emit('performance:warning', {
        type: 'high_memory_usage',
        memoryUsage,
        threshold: this.config.thresholds.highMemoryUsage,
      })
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(periodMs?: number): PerformanceReport {
    const now = Date.now()
    const period = {
      start: periodMs ? now - periodMs : this.startTime,
      end: now,
      duration: periodMs || (now - this.startTime),
    }

    const periodMetrics = this.metrics.filter(m =>
      m.timestamp >= period.start && m.timestamp <= period.end,
    )

    const report: PerformanceReport = {
      period,
      metrics: {
        loading: this.analyzeLoadingMetrics(periodMetrics),
        caching: this.analyzeCachingMetrics(periodMetrics),
        scanning: this.analyzeScanningMetrics(periodMetrics),
        rendering: this.analyzeRenderingMetrics(periodMetrics),
      },
      recommendations: [],
    }

    // 生成优化建议
    report.recommendations = this.generateRecommendations(report)

    return report
  }

  /**
   * 分析加载指标
   */
  private analyzeLoadingMetrics(metrics: PerformanceMetric[]) {
    const loadingMetrics = metrics.filter(m => m.category === 'loading')
    const loadTimes = loadingMetrics.map(m => m.value)

    const totalRequests = loadingMetrics.length
    const averageTime = loadTimes.length > 0
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
      : 0

    // 找出最慢的模板
    const templateTimes = new Map<string, number[]>()
    loadingMetrics.forEach((m) => {
      const templateName = m.metadata?.templateName || 'unknown'
      if (!templateTimes.has(templateName)) {
        templateTimes.set(templateName, [])
      }
      templateTimes.get(templateName)!.push(m.value)
    })

    const slowestTemplates = Array.from(templateTimes.entries())
      .map(([template, times]) => ({
        template,
        time: Math.max(...times),
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5)

    return {
      averageTime,
      totalRequests,
      successRate: 1.0, // 需要从错误指标中计算
      slowestTemplates,
    }
  }

  /**
   * 分析缓存指标
   */
  private analyzeCachingMetrics(metrics: PerformanceMetric[]) {
    const cachingMetrics = metrics.filter(m => m.category === 'caching')

    const hitRateMetrics = cachingMetrics.filter(m => m.name === 'cache_hit_rate')
    const memoryMetrics = cachingMetrics.filter(m => m.name === 'cache_memory_usage')

    const hitRate = hitRateMetrics.length > 0
      ? hitRateMetrics[hitRateMetrics.length - 1].value
      : 0

    const memoryUsage = memoryMetrics.length > 0
      ? memoryMetrics[memoryMetrics.length - 1].value
      : 0

    return {
      hitRate,
      missCount: 0, // 需要从其他指标计算
      evictionCount: 0, // 需要从其他指标计算
      memoryUsage,
    }
  }

  /**
   * 分析扫描指标
   */
  private analyzeScanningMetrics(metrics: PerformanceMetric[]) {
    const scanningMetrics = metrics.filter(m => m.category === 'scanning')
    const scanTimes = scanningMetrics.map(m => m.value)

    const totalScans = scanningMetrics.length
    const averageTime = scanTimes.length > 0
      ? scanTimes.reduce((sum, time) => sum + time, 0) / scanTimes.length
      : 0

    const templatesFound = scanningMetrics.reduce((sum, m) =>
      sum + (m.metadata?.templatesFound || 0), 0)

    return {
      averageTime,
      totalScans,
      templatesFound,
    }
  }

  /**
   * 分析渲染指标
   */
  private analyzeRenderingMetrics(metrics: PerformanceMetric[]) {
    const renderingMetrics = metrics.filter(m => m.category === 'rendering')
    const renderTimes = renderingMetrics.map(m => m.value)

    const totalRenders = renderingMetrics.length
    const averageTime = renderTimes.length > 0
      ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
      : 0

    return {
      averageTime,
      totalRenders,
      errorRate: 0, // 需要从错误指标计算
    }
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(report: PerformanceReport): string[] {
    const recommendations: string[] = []

    // 加载性能建议
    if (report.metrics.loading.averageTime > this.config.thresholds.slowLoading) {
      recommendations.push('考虑启用预加载功能以减少模板加载时间')
      recommendations.push('检查网络连接或模板文件大小')
    }

    // 缓存建议
    if (report.metrics.caching.hitRate < this.config.thresholds.lowCacheHitRate) {
      recommendations.push('缓存命中率较低，考虑增加缓存大小或调整缓存策略')
      recommendations.push('检查模板使用模式，确保常用模板被正确缓存')
    }

    // 内存使用建议
    if (report.metrics.caching.memoryUsage > this.config.thresholds.highMemoryUsage) {
      recommendations.push('内存使用过高，考虑减少缓存大小或启用更积极的清理策略')
      recommendations.push('检查是否有内存泄漏或未正确清理的模板')
    }

    // 扫描性能建议
    if (report.metrics.scanning.averageTime > 1000) {
      recommendations.push('模板扫描时间较长，考虑减少扫描路径或启用扫描缓存')
    }

    return recommendations
  }

  /**
   * 获取实时性能指标
   */
  getRealTimeMetrics(): {
    currentMemoryUsage: number
    activeTemplates: number
    cacheHitRate: number
    averageLoadTime: number
  } {
    const recentMetrics = this.metrics.filter(m =>
      Date.now() - m.timestamp < 60000, // 最近1分钟
    )

    const memoryMetrics = recentMetrics.filter(m => m.name === 'cache_memory_usage')
    const hitRateMetrics = recentMetrics.filter(m => m.name === 'cache_hit_rate')
    const loadTimeMetrics = recentMetrics.filter(m => m.name === 'template_load_time')

    return {
      currentMemoryUsage: memoryMetrics.length > 0
        ? memoryMetrics[memoryMetrics.length - 1].value
        : 0,
      activeTemplates: new Set(
        loadTimeMetrics.map(m => m.metadata?.templateName),
      ).size,
      cacheHitRate: hitRateMetrics.length > 0
        ? hitRateMetrics[hitRateMetrics.length - 1].value
        : 0,
      averageLoadTime: loadTimeMetrics.length > 0
        ? loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length
        : 0,
    }
  }

  /**
   * 清理旧指标
   */
  cleanup(maxAge = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAge
    const initialCount = this.metrics.length

    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)

    const cleanedCount = initialCount - this.metrics.length

    if (cleanedCount > 0) {
      this.emit('performance:cleanup', { cleanedCount })
    }

    return cleanedCount
  }

  /**
   * 启动定期报告
   */
  private startReporting(): void {
    this.reportTimer = setInterval(() => {
      const report = this.generateReport(this.config.reportInterval)
      this.emit('performance:report', { report })
    }, this.config.reportInterval)
  }

  /**
   * 事件发射器
   */
  private emit(type: string, data: any): void {
    const eventData: EventData = {
      type: type as any,
      timestamp: Date.now(),
      data,
    }

    const listeners = this.listeners.get(type) || []
    listeners.forEach((listener) => {
      try {
        listener(eventData)
      }
      catch (error) {
        console.error(`Error in performance event listener for ${type}:`, error)
      }
    })
  }

  /**
   * 添加事件监听器
   */
  on(type: string, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = null
    }

    this.metrics = []
    this.listeners.clear()
  }
}
