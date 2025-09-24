/**
 * 性能管理器
 * 
 * 统一管理I18n系统的性能优化功能
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { TimeUtils } from '../utils/common'
import { CacheOperations } from '../utils/cache-operations'
import { UnifiedErrorHandler } from '../utils/error-handling'

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** 翻译调用总数 */
  totalTranslations: number
  /** 平均翻译时间（毫秒） */
  averageTranslationTime: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 内存使用量（估算，字节） */
  memoryUsage: number
  /** 最慢的翻译操作 */
  slowestTranslations: Array<{ key: string; time: number; timestamp: number }>
  /** 最频繁的翻译键 */
  mostFrequentKeys: Array<{ key: string; count: number }>
  /** 错误率 */
  errorRate: number
}

/**
 * 性能配置接口
 */
export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enabled: boolean
  /** 采样率（0-1） */
  sampleRate: number
  /** 慢翻译阈值（毫秒） */
  slowTranslationThreshold: number
  /** 最大慢翻译记录数 */
  maxSlowTranslations: number
  /** 最大频繁键记录数 */
  maxFrequentKeys: number
  /** 统计窗口大小（毫秒） */
  statisticsWindow: number
}

/**
 * 翻译记录接口
 */
interface TranslationRecord {
  key: string
  startTime: number
  endTime: number
  fromCache: boolean
  success: boolean
  params?: Record<string, unknown>
}

/**
 * 增强性能管理器类
 */
export class EnhancedPerformanceManager {
  private config: PerformanceConfig
  private metrics: PerformanceMetrics
  private translationHistory: TranslationRecord[] = []
  private keyFrequency = new Map<string, number>()
  private totalTime = 0
  private totalCalls = 0
  private cacheHits = 0
  private errors = 0

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 0.1, // 10% 采样
      slowTranslationThreshold: 10, // 10ms
      maxSlowTranslations: 50,
      maxFrequentKeys: 20,
      statisticsWindow: 60 * 1000, // 1分钟
      ...config
    }

    this.metrics = {
      totalTranslations: 0,
      averageTranslationTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      slowestTranslations: [],
      mostFrequentKeys: [],
      errorRate: 0
    }
  }

  /**
   * 记录翻译操作
   */
  recordTranslation(
    key: string,
    startTime: number,
    endTime: number,
    fromCache: boolean,
    success: boolean = true,
    params?: Record<string, unknown>
  ): void {
    if (!this.config.enabled) return

    // 采样检查
    if (Math.random() > this.config.sampleRate) return

    const duration = endTime - startTime
    const record: TranslationRecord = {
      key,
      startTime,
      endTime,
      fromCache,
      success,
      params
    }

    // 更新统计
    this.totalCalls++
    this.totalTime += duration

    if (fromCache) {
      this.cacheHits++
    }

    if (!success) {
      this.errors++
    }

    // 记录键频率
    const currentCount = this.keyFrequency.get(key) || 0
    this.keyFrequency.set(key, currentCount + 1)

    // 记录慢翻译
    if (duration > this.config.slowTranslationThreshold) {
      this.addSlowTranslation(key, duration)
    }

    // 添加到历史记录
    this.translationHistory.push(record)
    this.cleanupOldRecords()

    // 更新指标
    this.updateMetrics()
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 获取性能建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []

    // 缓存命中率建议
    if (this.metrics.cacheHitRate < 0.7) {
      suggestions.push('缓存命中率较低，考虑增加缓存大小或调整TTL设置')
    }

    // 平均翻译时间建议
    if (this.metrics.averageTranslationTime > 5) {
      suggestions.push('平均翻译时间较长，考虑启用预加载或优化翻译逻辑')
    }

    // 错误率建议
    if (this.metrics.errorRate > 0.05) {
      suggestions.push('翻译错误率较高，检查翻译键的正确性和语言包完整性')
    }

    // 内存使用建议
    if (this.metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      suggestions.push('内存使用量较高，考虑减少缓存大小或启用内存压力清理')
    }

    // 慢翻译建议
    if (this.metrics.slowestTranslations.length > 10) {
      suggestions.push('存在较多慢翻译操作，考虑优化复杂的插值或格式化逻辑')
    }

    return suggestions
  }

  /**
   * 重置统计数据
   */
  reset(): void {
    this.translationHistory = []
    this.keyFrequency.clear()
    this.totalTime = 0
    this.totalCalls = 0
    this.cacheHits = 0
    this.errors = 0

    this.metrics = {
      totalTranslations: 0,
      averageTranslationTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      slowestTranslations: [],
      mostFrequentKeys: [],
      errorRate: 0
    }
  }

  /**
   * 启用/禁用性能监控
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
  }

  /**
   * 设置采样率
   */
  setSampleRate(rate: number): void {
    this.config.sampleRate = Math.max(0, Math.min(1, rate))
  }

  /**
   * 获取详细报告
   */
  getDetailedReport(): {
    metrics: PerformanceMetrics
    suggestions: string[]
    topSlowKeys: string[]
    topFrequentKeys: string[]
    recentErrors: Array<{ key: string; timestamp: number }>
  } {
    const recentErrors = this.translationHistory
      .filter(record => !record.success)
      .slice(-10)
      .map(record => ({
        key: record.key,
        timestamp: record.startTime
      }))

    const topSlowKeys = this.metrics.slowestTranslations
      .slice(0, 5)
      .map(item => item.key)

    const topFrequentKeys = this.metrics.mostFrequentKeys
      .slice(0, 5)
      .map(item => item.key)

    return {
      metrics: this.getMetrics(),
      suggestions: this.getOptimizationSuggestions(),
      topSlowKeys,
      topFrequentKeys,
      recentErrors
    }
  }

  /**
   * 添加慢翻译记录
   */
  private addSlowTranslation(key: string, time: number): void {
    const slowTranslation = {
      key,
      time,
      timestamp: TimeUtils.now()
    }

    this.metrics.slowestTranslations.push(slowTranslation)

    // 保持数量限制，按时间排序
    this.metrics.slowestTranslations.sort((a, b) => b.time - a.time)
    if (this.metrics.slowestTranslations.length > this.config.maxSlowTranslations) {
      this.metrics.slowestTranslations = this.metrics.slowestTranslations.slice(0, this.config.maxSlowTranslations)
    }
  }

  /**
   * 清理旧记录
   */
  private cleanupOldRecords(): void {
    const cutoffTime = TimeUtils.now() - this.config.statisticsWindow
    this.translationHistory = this.translationHistory.filter(
      record => record.startTime > cutoffTime
    )
  }

  /**
   * 更新指标
   */
  private updateMetrics(): void {
    // 基本指标
    this.metrics.totalTranslations = this.totalCalls
    this.metrics.averageTranslationTime = this.totalCalls > 0 ? this.totalTime / this.totalCalls : 0
    this.metrics.cacheHitRate = this.totalCalls > 0 ? this.cacheHits / this.totalCalls : 0
    this.metrics.errorRate = this.totalCalls > 0 ? this.errors / this.totalCalls : 0

    // 估算内存使用
    this.metrics.memoryUsage = this.estimateMemoryUsage()

    // 更新最频繁的键
    this.updateMostFrequentKeys()
  }

  /**
   * 估算内存使用量
   */
  private estimateMemoryUsage(): number {
    let usage = 0

    // 历史记录内存
    usage += this.translationHistory.length * 200 // 每条记录约200字节

    // 键频率映射内存
    for (const [key] of this.keyFrequency) {
      usage += key.length * 2 + 8 // 字符串 + 数字
    }

    // 慢翻译记录内存
    usage += this.metrics.slowestTranslations.length * 100

    return usage
  }

  /**
   * 更新最频繁的键
   */
  private updateMostFrequentKeys(): void {
    const sortedKeys = Array.from(this.keyFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.config.maxFrequentKeys)

    this.metrics.mostFrequentKeys = sortedKeys.map(([key, count]) => ({
      key,
      count
    }))
  }
}

/**
 * 创建增强性能管理器实例
 */
export function createEnhancedPerformanceManager(config?: Partial<PerformanceConfig>): EnhancedPerformanceManager {
  return new EnhancedPerformanceManager(config)
}
