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
  slowestTranslations: Array<{ key: string; time: number }>
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
}

/**
 * 性能监控管理器
 */
export class PerformanceManager {
  private config: PerformanceConfig
  private metrics: PerformanceMetrics
  private translationTimes: number[] = []
  private languageLoadStartTimes = new Map<string, number>()

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 0.1, // 10% 采样
      slowTranslationThreshold: 10, // 10ms
      maxSlowTranslations: 50,
      ...config,
    }

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
   * @param fromCache 是否来自缓存
   */
  recordTranslation(
    key: string,
    startTime: number,
    endTime: number,
    fromCache: boolean
  ): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return
    }

    const duration = endTime - startTime
    this.metrics.translationCalls++
    this.translationTimes.push(duration)

    // 更新平均时间
    this.metrics.averageTranslationTime =
      this.translationTimes.reduce((sum, time) => sum + time, 0) /
      this.translationTimes.length

    // 记录慢翻译
    if (duration > this.config.slowTranslationThreshold) {
      this.metrics.slowestTranslations.push({ key, time: duration })

      // 保持最大数量限制
      if (
        this.metrics.slowestTranslations.length >
        this.config.maxSlowTranslations
      ) {
        this.metrics.slowestTranslations.sort((a, b) => b.time - a.time)
        this.metrics.slowestTranslations =
          this.metrics.slowestTranslations.slice(
            0,
            this.config.maxSlowTranslations
          )
      }
    }
  }

  /**
   * 记录语言包加载开始
   * @param locale 语言代码
   */
  recordLanguageLoadStart(locale: string): void {
    if (!this.config.enabled) return
    this.languageLoadStartTimes.set(locale, performance.now())
  }

  /**
   * 记录语言包加载完成
   * @param locale 语言代码
   */
  recordLanguageLoadEnd(locale: string): void {
    if (!this.config.enabled) return

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
    if (!this.config.enabled) return
    this.metrics.cacheHitRate = hitRate
  }

  /**
   * 更新内存使用量
   * @param usage 内存使用量（字节）
   */
  updateMemoryUsage(usage: number): void {
    if (!this.config.enabled) return
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
    this.translationTimes = []
    this.languageLoadStartTimes.clear()
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

    const avgLoadTime =
      Object.values(metrics.languageLoadTimes).reduce(
        (sum, time) => sum + time,
        0
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
  descriptor: PropertyDescriptor
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
      false
    )

    return result
  }

  return descriptor
}
