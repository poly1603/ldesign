/**
 * 预加载管理器
 * 
 * 管理I18n系统的预加载和懒加载功能，提供智能的资源加载策略
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { TimeUtils } from '../utils/common'
import type { Loader } from './types'

/**
 * 预加载配置接口
 */
export interface PreloadConfig {
  /** 是否启用预加载 */
  enabled: boolean
  /** 预加载策略 */
  strategy: 'eager' | 'lazy' | 'smart' | 'critical'
  /** 预加载优先级 */
  priority: 'high' | 'normal' | 'low'
  /** 最大并发加载数 */
  maxConcurrent: number
  /** 预加载超时时间（毫秒） */
  timeout: number
  /** 是否启用智能预测 */
  enablePrediction: boolean
  /** 预测窗口大小 */
  predictionWindow: number
}

/**
 * 预加载项接口
 */
interface PreloadItem {
  locale: string
  namespace?: string
  priority: number
  timestamp: number
  attempts: number
  status: 'pending' | 'loading' | 'loaded' | 'failed'
  promise?: Promise<any>
  error?: Error
}

/**
 * 使用统计接口
 */
interface UsageStats {
  locale: string
  namespace?: string
  accessCount: number
  lastAccessed: number
  averageInterval: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

/**
 * 预加载管理器类
 */
export class PreloadManager {
  private config: PreloadConfig
  private loader: Loader
  private preloadQueue = new Map<string, PreloadItem>()
  private loadingPromises = new Map<string, Promise<any>>()
  private usageStats = new Map<string, UsageStats>()
  private loadingCount = 0
  private predictionModel = new Map<string, number>()

  constructor(loader: Loader, config: Partial<PreloadConfig> = {}) {
    this.loader = loader
    this.config = {
      enabled: true,
      strategy: 'smart',
      priority: 'normal',
      maxConcurrent: 3,
      timeout: 10000, // 10秒
      enablePrediction: true,
      predictionWindow: 10,
      ...config
    }
  }

  /**
   * 添加预加载项
   */
  addPreloadItem(
    locale: string,
    namespace?: string,
    priority: number = 1
  ): void {
    if (!this.config.enabled) return

    const key = this.generateKey(locale, namespace)
    
    if (this.preloadQueue.has(key)) {
      // 更新优先级
      const item = this.preloadQueue.get(key)!
      item.priority = Math.max(item.priority, priority)
      return
    }

    const item: PreloadItem = {
      locale,
      namespace,
      priority,
      timestamp: TimeUtils.now(),
      attempts: 0,
      status: 'pending'
    }

    this.preloadQueue.set(key, item)
    this.schedulePreload()
  }

  /**
   * 预加载关键资源
   */
  preloadCritical(locales: string[], namespaces?: string[]): Promise<void[]> {
    const promises: Promise<void>[] = []

    for (const locale of locales) {
      if (namespaces) {
        for (const namespace of namespaces) {
          promises.push(this.preloadResource(locale, namespace, 10))
        }
      } else {
        promises.push(this.preloadResource(locale, undefined, 10))
      }
    }

    return Promise.all(promises)
  }

  /**
   * 智能预加载
   */
  smartPreload(): void {
    if (!this.config.enablePrediction) return

    const predictions = this.generatePredictions()
    
    for (const [key, score] of predictions) {
      if (score > 0.7) { // 70%以上的概率
        const [locale, namespace] = this.parseKey(key)
        this.addPreloadItem(locale, namespace, Math.floor(score * 10))
      }
    }
  }

  /**
   * 记录使用情况
   */
  recordUsage(locale: string, namespace?: string): void {
    const key = this.generateKey(locale, namespace)
    const now = TimeUtils.now()
    
    let stats = this.usageStats.get(key)
    
    if (!stats) {
      stats = {
        locale,
        namespace,
        accessCount: 0,
        lastAccessed: now,
        averageInterval: 0,
        trend: 'stable'
      }
      this.usageStats.set(key, stats)
    }

    // 更新统计
    const interval = now - stats.lastAccessed
    stats.accessCount++
    stats.averageInterval = (stats.averageInterval + interval) / 2
    stats.lastAccessed = now

    // 更新趋势
    this.updateTrend(stats)

    // 更新预测模型
    this.updatePredictionModel(key, stats)
  }

  /**
   * 获取预加载状态
   */
  getPreloadStatus(): {
    pending: number
    loading: number
    loaded: number
    failed: number
    queueSize: number
  } {
    let pending = 0, loading = 0, loaded = 0, failed = 0

    for (const item of this.preloadQueue.values()) {
      switch (item.status) {
        case 'pending': pending++; break
        case 'loading': loading++; break
        case 'loaded': loaded++; break
        case 'failed': failed++; break
      }
    }

    return {
      pending,
      loading,
      loaded,
      failed,
      queueSize: this.preloadQueue.size
    }
  }

  /**
   * 清理预加载队列
   */
  cleanup(): void {
    const now = TimeUtils.now()
    const maxAge = 30 * 60 * 1000 // 30分钟

    for (const [key, item] of this.preloadQueue) {
      if (now - item.timestamp > maxAge && item.status !== 'loading') {
        this.preloadQueue.delete(key)
      }
    }
  }

  /**
   * 获取使用统计
   */
  getUsageStats(): UsageStats[] {
    return Array.from(this.usageStats.values())
  }

  /**
   * 预加载资源
   */
  private async preloadResource(
    locale: string,
    namespace?: string,
    priority: number = 1
  ): Promise<void> {
    const key = this.generateKey(locale, namespace)
    
    // 检查是否已经在加载
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!
    }

    const promise = this.executePreload(locale, namespace, priority)
    this.loadingPromises.set(key, promise)

    try {
      await promise
    } finally {
      this.loadingPromises.delete(key)
    }
  }

  /**
   * 执行预加载
   */
  private async executePreload(
    locale: string,
    namespace?: string,
    priority: number
  ): Promise<void> {
    const key = this.generateKey(locale, namespace)
    const item = this.preloadQueue.get(key)

    if (!item) return

    item.status = 'loading'
    item.attempts++
    this.loadingCount++

    try {
      // 使用超时控制
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Preload timeout')), this.config.timeout)
      })

      const loadPromise = namespace 
        ? this.loader.loadNamespace(locale, namespace)
        : this.loader.load(locale)

      await Promise.race([loadPromise, timeoutPromise])
      
      item.status = 'loaded'
    } catch (error) {
      item.status = 'failed'
      item.error = error as Error
      
      // 重试逻辑
      if (item.attempts < 3) {
        setTimeout(() => {
          item.status = 'pending'
          this.schedulePreload()
        }, Math.pow(2, item.attempts) * 1000) // 指数退避
      }
    } finally {
      this.loadingCount--
    }
  }

  /**
   * 调度预加载
   */
  private schedulePreload(): void {
    if (this.loadingCount >= this.config.maxConcurrent) return

    // 按优先级排序
    const pendingItems = Array.from(this.preloadQueue.values())
      .filter(item => item.status === 'pending')
      .sort((a, b) => b.priority - a.priority)

    const availableSlots = this.config.maxConcurrent - this.loadingCount
    const itemsToLoad = pendingItems.slice(0, availableSlots)

    for (const item of itemsToLoad) {
      this.preloadResource(item.locale, item.namespace, item.priority)
    }
  }

  /**
   * 生成预测
   */
  private generatePredictions(): Map<string, number> {
    const predictions = new Map<string, number>()
    const now = TimeUtils.now()

    for (const [key, stats] of this.usageStats) {
      // 基于访问频率和趋势的简单预测模型
      let score = 0

      // 访问频率权重
      const frequency = stats.accessCount / (now - stats.lastAccessed + 1)
      score += frequency * 0.4

      // 趋势权重
      switch (stats.trend) {
        case 'increasing': score += 0.3; break
        case 'stable': score += 0.1; break
        case 'decreasing': score -= 0.1; break
      }

      // 最近访问权重
      const recency = Math.max(0, 1 - (now - stats.lastAccessed) / (24 * 60 * 60 * 1000))
      score += recency * 0.3

      predictions.set(key, Math.min(1, Math.max(0, score)))
    }

    return predictions
  }

  /**
   * 更新趋势
   */
  private updateTrend(stats: UsageStats): void {
    // 简单的趋势分析
    const recentAccesses = stats.accessCount
    const timeSpan = TimeUtils.now() - stats.lastAccessed

    if (recentAccesses > 5 && timeSpan < stats.averageInterval) {
      stats.trend = 'increasing'
    } else if (recentAccesses < 2 || timeSpan > stats.averageInterval * 2) {
      stats.trend = 'decreasing'
    } else {
      stats.trend = 'stable'
    }
  }

  /**
   * 更新预测模型
   */
  private updatePredictionModel(key: string, stats: UsageStats): void {
    // 简单的学习算法
    const currentScore = this.predictionModel.get(key) || 0
    const newScore = stats.accessCount / 100 // 简化的评分

    this.predictionModel.set(key, (currentScore + newScore) / 2)
  }

  /**
   * 生成键
   */
  private generateKey(locale: string, namespace?: string): string {
    return namespace ? `${locale}:${namespace}` : locale
  }

  /**
   * 解析键
   */
  private parseKey(key: string): [string, string?] {
    const parts = key.split(':')
    return [parts[0], parts[1]]
  }
}

/**
 * 创建预加载管理器实例
 */
export function createPreloadManager(
  loader: Loader,
  config?: Partial<PreloadConfig>
): PreloadManager {
  return new PreloadManager(loader, config)
}
