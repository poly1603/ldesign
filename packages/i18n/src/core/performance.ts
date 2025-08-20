/**
 * 性能监控管理器
 *
 * 提供 I18n 系统的性能监控和优化建议
 */

export interface PerformanceMetrics {
  /** 翻译调用次数 */
  translationCalls: number
  /** 平均翻译时间（毫秒） */
  averageTranslationTime: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 语言包加载时间 */
  languageLoadTimes: Record<string, number>
  /** 内存使用量（字节） */
  memoryUsage: number
  /** 最慢的翻译键 */
  slowestTranslations: Array<{ key: string, time: number }>
}

export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enabled: boolean
  /** 采样率（0-1） */
  sampleRate: number
  /** 慢翻译阈值（毫秒） */
  slowTranslationThreshold: number
  /** 最大记录的慢翻译数量 */
  maxSlowTranslations: number
  /** 最大历史记录数量 */
  maxHistorySize: number
  /** 统计窗口大小（毫秒） */
  statisticsWindow: number
  /** 是否启用智能采样 */
  enableSmartSampling: boolean
  /** 内存压力阈值 */
  memoryPressureThreshold: number
}

/**
 * 高效的滑动窗口统计
 */
class SlidingWindowStats {
  private values: number[] = []
  private sum = 0
  private maxSize: number
  private windowStart = 0

  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  add(value: number): void {
    if (this.values.length < this.maxSize) {
      this.values.push(value)
      this.sum += value
    }
    else {
      // 替换最旧的值
      this.sum = this.sum - this.values[this.windowStart] + value
      this.values[this.windowStart] = value
      this.windowStart = (this.windowStart + 1) % this.maxSize
    }
  }

  getAverage(): number {
    return this.values.length > 0 ? this.sum / this.values.length : 0
  }

  getCount(): number {
    return this.values.length
  }

  clear(): void {
    this.values = []
    this.sum = 0
    this.windowStart = 0
  }
}

/**
 * 智能采样器
 */
class SmartSampler {
  private errorCount = 0
  private totalCount = 0
  private baseSampleRate: number
  private adaptiveRate: number

  constructor(baseSampleRate: number) {
    this.baseSampleRate = baseSampleRate
    this.adaptiveRate = baseSampleRate
  }

  shouldSample(isError = false): boolean {
    this.totalCount++

    if (isError) {
      this.errorCount++
      // 错误情况下提高采样率
      return Math.random() < Math.min(1, this.adaptiveRate * 3)
    }

    // 根据错误率调整采样率
    const errorRate = this.errorCount / this.totalCount
    if (errorRate > 0.1) {
      // 错误率高时提高采样率
      this.adaptiveRate = Math.min(1, this.baseSampleRate * 2)
    }
    else if (errorRate < 0.01) {
      // 错误率低时降低采样率
      this.adaptiveRate = Math.max(0.001, this.baseSampleRate * 0.5)
    }

    return Math.random() < this.adaptiveRate
  }

  reset(): void {
    this.errorCount = 0
    this.totalCount = 0
    this.adaptiveRate = this.baseSampleRate
  }
}

/**
 * 性能监控管理器
 */
export class PerformanceManager {
  private config: Required<PerformanceConfig>
  private metrics: PerformanceMetrics
  private translationStats: SlidingWindowStats
  private smartSampler: SmartSampler
  private languageLoadStartTimes = new Map<string, number>()
  private lastCleanup = Date.now()

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 0.1, // 10% 采样
      slowTranslationThreshold: 10, // 10ms
      maxSlowTranslations: 50,
      maxHistorySize: 1000,
      statisticsWindow: 60 * 1000, // 1分钟
      enableSmartSampling: true,
      memoryPressureThreshold: 0.8,
      ...config,
    }

    this.translationStats = new SlidingWindowStats(this.config.maxHistorySize)
    this.smartSampler = new SmartSampler(this.config.sampleRate)

    this.metrics = {
      translationCalls: 0,
      averageTranslationTime: 0,
      cacheHitRate: 0,
      languageLoadTimes: {},
      memoryUsage: 0,
      slowestTranslations: [],
    }
  }

  /**
   * 记录翻译性能
   * @param key 翻译键
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param _fromCache 是否来自缓存
   */
  recordTranslation(
    key: string,
    startTime: number,
    endTime: number,
    _fromCache: boolean,
  ): void {
    if (!this.config.enabled) {
      return
    }

    const duration = endTime - startTime
    const isSlowTranslation = duration > this.config.slowTranslationThreshold

    // 智能采样决策
    const shouldSample = this.config.enableSmartSampling
      ? this.smartSampler.shouldSample(isSlowTranslation)
      : Math.random() <= this.config.sampleRate

    if (!shouldSample && !isSlowTranslation) {
      // 对于慢翻译，即使不在采样范围内也要记录
      return
    }

    this.metrics.translationCalls++

    // 使用滑动窗口统计，避免内存泄漏
    this.translationStats.add(duration)
    this.metrics.averageTranslationTime = this.translationStats.getAverage()

    // 记录慢翻译（使用更高效的插入排序）
    if (isSlowTranslation) {
      this.addSlowTranslation(key, duration)
    }

    // 定期清理以避免内存泄漏
    this.performPeriodicCleanup()
  }

  /**
   * 高效地添加慢翻译记录
   */
  private addSlowTranslation(key: string, time: number): void {
    const slowTranslations = this.metrics.slowestTranslations

    // 如果数组未满，直接添加
    if (slowTranslations.length < this.config.maxSlowTranslations) {
      slowTranslations.push({ key, time })
      // 保持排序（插入排序）
      for (let i = slowTranslations.length - 1; i > 0; i--) {
        if (slowTranslations[i].time > slowTranslations[i - 1].time) {
          [slowTranslations[i], slowTranslations[i - 1]] = [slowTranslations[i - 1], slowTranslations[i]]
        }
        else {
          break
        }
      }
    }
    else if (time > slowTranslations[slowTranslations.length - 1].time) {
      // 替换最慢的记录
      slowTranslations[slowTranslations.length - 1] = { key, time }
      // 向前冒泡到正确位置
      for (let i = slowTranslations.length - 1; i > 0; i--) {
        if (slowTranslations[i].time > slowTranslations[i - 1].time) {
          [slowTranslations[i], slowTranslations[i - 1]] = [slowTranslations[i - 1], slowTranslations[i]]
        }
        else {
          break
        }
      }
    }
  }

  /**
   * 定期清理以防止内存泄漏
   */
  private performPeriodicCleanup(): void {
    const now = Date.now()
    if (now - this.lastCleanup > this.config.statisticsWindow) {
      this.lastCleanup = now

      // 清理过期的语言加载记录
      for (const [locale, startTime] of this.languageLoadStartTimes) {
        if (now - startTime > 30000) { // 30秒超时
          this.languageLoadStartTimes.delete(locale)
        }
      }

      // 重置智能采样器
      if (this.config.enableSmartSampling) {
        this.smartSampler.reset()
      }
    }
  }

  /**
   * 记录语言包加载开始
   * @param locale 语言代码
   */
  recordLanguageLoadStart(locale: string): void {
    if (!this.config.enabled)
      return
    this.languageLoadStartTimes.set(locale, performance.now())
  }

  /**
   * 记录语言包加载完成
   * @param locale 语言代码
   */
  recordLanguageLoadEnd(locale: string): void {
    if (!this.config.enabled)
      return

    const startTime = this.languageLoadStartTimes.get(locale)
    if (startTime) {
      const duration = performance.now() - startTime
      this.metrics.languageLoadTimes[locale] = duration
      this.languageLoadStartTimes.delete(locale)
    }
  }

  /**
   * 更新缓存命中率
   * @param hitRate 命中率
   */
  updateCacheHitRate(hitRate: number): void {
    if (!this.config.enabled)
      return
    this.metrics.cacheHitRate = hitRate
  }

  /**
   * 更新内存使用量
   * @param usage 内存使用量（字节）
   */
  updateMemoryUsage(usage: number): void {
    if (!this.config.enabled)
      return
    this.metrics.memoryUsage = usage
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 重置性能指标
   */
  resetMetrics(): void {
    this.metrics = {
      translationCalls: 0,
      averageTranslationTime: 0,
      cacheHitRate: 0,
      languageLoadTimes: {},
      memoryUsage: 0,
      slowestTranslations: [],
    }

    // 重置内部状态
    this.translationStats.clear()
    this.smartSampler.reset()
    this.languageLoadStartTimes.clear()
    this.lastCleanup = Date.now()
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): number {
    let usage = 0

    // 估算各种数据结构的内存使用
    usage += this.metrics.slowestTranslations.length * 64 // 每个记录约64字节
    usage += this.languageLoadStartTimes.size * 32 // 每个Map条目约32字节
    usage += this.translationStats.getCount() * 8 // 每个数字8字节

    return usage
  }

  /**
   * 检查内存压力并执行清理
   */
  checkMemoryPressure(): void {
    const memoryUsage = this.getMemoryUsage()
    const maxMemory = 1024 * 1024 // 1MB限制

    if (memoryUsage > maxMemory * this.config.memoryPressureThreshold) {
      this.performMemoryCleanup()
    }
  }

  /**
   * 执行内存清理
   */
  private performMemoryCleanup(): void {
    // 清理一半的慢翻译记录
    const halfSize = Math.floor(this.config.maxSlowTranslations / 2)
    this.metrics.slowestTranslations = this.metrics.slowestTranslations.slice(0, halfSize)

    // 清理过期的语言加载记录
    const now = Date.now()
    for (const [locale, startTime] of this.languageLoadStartTimes) {
      if (now - startTime > 10000) { // 10秒超时
        this.languageLoadStartTimes.delete(locale)
      }
    }

    // 重置统计窗口
    this.translationStats.clear()
  }

  /**
   * 清理历史数据
   */
  clearHistory(): void {
    this.translationStats.clear()
    this.smartSampler.reset()
    this.languageLoadStartTimes.clear()
    this.metrics.slowestTranslations = []
    this.lastCleanup = Date.now()
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const metrics = this.getMetrics()
    const report = []

    report.push('=== I18n 性能报告 ===')
    report.push(`翻译调用次数: ${metrics.translationCalls}`)
    report.push(`平均翻译时间: ${metrics.averageTranslationTime.toFixed(2)}ms`)
    report.push(`缓存命中率: ${(metrics.cacheHitRate * 100).toFixed(2)}%`)
    report.push(`内存使用量: ${(metrics.memoryUsage / 1024).toFixed(2)}KB`)

    if (Object.keys(metrics.languageLoadTimes).length > 0) {
      report.push('\n语言包加载时间:')
      for (const [locale, time] of Object.entries(metrics.languageLoadTimes)) {
        report.push(`  ${locale}: ${time.toFixed(2)}ms`)
      }
    }

    if (metrics.slowestTranslations.length > 0) {
      report.push('\n最慢的翻译:')
      metrics.slowestTranslations.slice(0, 10).forEach(({ key, time }) => {
        report.push(`  ${key}: ${time.toFixed(2)}ms`)
      })
    }

    return report.join('\n')
  }

  /**
   * 获取性能优化建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []
    const metrics = this.getMetrics()

    if (metrics.cacheHitRate < 0.8) {
      suggestions.push('缓存命中率较低，考虑增加缓存大小或优化缓存策略')
    }

    if (metrics.averageTranslationTime > 5) {
      suggestions.push('平均翻译时间较长，考虑优化翻译逻辑或预加载常用翻译')
    }

    if (metrics.memoryUsage > 10 * 1024 * 1024) {
      // 10MB
      suggestions.push('内存使用量较高，考虑减少缓存大小或清理不必要的数据')
    }

    if (metrics.slowestTranslations.length > 20) {
      suggestions.push('存在较多慢翻译，考虑优化这些翻译键的处理逻辑')
    }

    const avgLoadTime
      = Object.values(metrics.languageLoadTimes).reduce(
        (sum, time) => sum + time,
        0,
      ) / Object.keys(metrics.languageLoadTimes).length

    if (avgLoadTime > 100) {
      suggestions.push('语言包加载时间较长，考虑使用 CDN 或优化网络请求')
    }

    if (suggestions.length === 0) {
      suggestions.push('性能表现良好，无需特别优化')
    }

    return suggestions
  }

  /**
   * 启用性能监控
   */
  enable(): void {
    this.config.enabled = true
  }

  /**
   * 禁用性能监控
   */
  disable(): void {
    this.config.enabled = false
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * 全局性能管理器实例
 */
export const globalPerformanceManager = new PerformanceManager()

/**
 * 性能装饰器：用于自动监控函数执行时间
 */
export function performanceMonitor(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value

  descriptor.value = function (...args: any[]) {
    const startTime = performance.now()
    const result = originalMethod.apply(this, args)
    const endTime = performance.now()

    globalPerformanceManager.recordTranslation(
      `${target.constructor.name}.${propertyKey}`,
      startTime,
      endTime,
      false,
    )

    return result
  }

  return descriptor
}
