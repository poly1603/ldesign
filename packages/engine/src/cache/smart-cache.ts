/**
 * 智能缓存策略
 * 提供基于访问模式的预测性缓存和自适应TTL
 */

import type { CacheManager } from './cache-manager'
import type { Logger } from '../types'

// 访问模式
interface AccessPattern {
  key: string
  accessCount: number
  lastAccess: number
  firstAccess: number
  averageInterval: number // 平均访问间隔
  trend: 'increasing' | 'stable' | 'decreasing'
  predictedNextAccess: number // 预测下次访问时间
}

// 智能缓存配置
export interface SmartCacheConfig {
  enablePatternLearning?: boolean // 启用模式学习
  enablePredictivePrefetch?: boolean // 启用预测性预取
  enableAdaptiveTTL?: boolean // 启用自适应TTL
  minAccessForPrediction?: number // 预测所需的最小访问次数
  patternWindow?: number // 模式分析时间窗口（ms）
  prefetchThreshold?: number // 预取置信度阈值（0-1）
}

/**
 * 智能缓存策略实现
 */
export class SmartCacheStrategy<T = unknown> {
  private accessPatterns = new Map<string, AccessPattern>()
  private config: Required<SmartCacheConfig>
  private predictionTimer?: NodeJS.Timeout
  private cleanupTimer?: NodeJS.Timeout

  constructor(
    private cache: CacheManager<T>,
    config: SmartCacheConfig = {},
    private logger?: Logger
  ) {
    this.config = {
      enablePatternLearning: config.enablePatternLearning ?? true,
      enablePredictivePrefetch: config.enablePredictivePrefetch ?? true,
      enableAdaptiveTTL: config.enableAdaptiveTTL ?? true,
      minAccessForPrediction: config.minAccessForPrediction || 3,
      patternWindow: config.patternWindow || 10 * 60 * 1000, // 10分钟
      prefetchThreshold: config.prefetchThreshold || 0.7
    }

    // 启动预测引擎
    if (this.config.enablePredictivePrefetch) {
      this.startPredictionEngine()
    }

    // 启动模式清理
    this.startPatternCleanup()
  }

  /**
   * 记录访问模式
   */
  recordAccess(key: string): void {
    if (!this.config.enablePatternLearning) {
      return
    }

    const now = Date.now()
    let pattern = this.accessPatterns.get(key)

    if (!pattern) {
      pattern = {
        key,
        accessCount: 0,
        lastAccess: now,
        firstAccess: now,
        averageInterval: 0,
        trend: 'stable',
        predictedNextAccess: 0
      }
      this.accessPatterns.set(key, pattern)
    }

    // 更新访问统计
    const interval = now - pattern.lastAccess
    pattern.accessCount++
    pattern.lastAccess = now

    // 计算平均间隔（指数移动平均）
    if (pattern.accessCount > 1) {
      pattern.averageInterval = pattern.averageInterval === 0
        ? interval
        : pattern.averageInterval * 0.7 + interval * 0.3
    }

    // 分析趋势
    this.analyzeTrend(pattern)

    // 预测下次访问
    if (pattern.accessCount >= this.config.minAccessForPrediction) {
      pattern.predictedNextAccess = now + pattern.averageInterval
    }

    this.logger?.debug(`Access pattern updated for ${key}`, {
      count: pattern.accessCount,
      interval: pattern.averageInterval.toFixed(0)
    })
  }

  /**
   * 分析访问趋势
   */
  private analyzeTrend(pattern: AccessPattern): void {
    if (pattern.accessCount < 5) {
      pattern.trend = 'stable'
      return
    }

    const totalTime = pattern.lastAccess - pattern.firstAccess
    const expectedAccesses = totalTime / pattern.averageInterval
    const actualAccesses = pattern.accessCount

    const ratio = actualAccesses / expectedAccesses

    if (ratio > 1.2) {
      pattern.trend = 'increasing'
    } else if (ratio < 0.8) {
      pattern.trend = 'decreasing'
    } else {
      pattern.trend = 'stable'
    }
  }

  /**
   * 计算自适应TTL
   */
  calculateAdaptiveTTL(key: string, defaultTTL: number): number {
    if (!this.config.enableAdaptiveTTL) {
      return defaultTTL
    }

    const pattern = this.accessPatterns.get(key)
    if (!pattern || pattern.accessCount < this.config.minAccessForPrediction) {
      return defaultTTL
    }

    // 根据访问间隔调整TTL
    // 频繁访问的项使用较短TTL（保持新鲜）
    // 不常访问的项使用较长TTL（节省资源）
    if (pattern.averageInterval < 60000) {
      // 1分钟内频繁访问
      return Math.max(pattern.averageInterval * 2, 30000)
    } else if (pattern.averageInterval < 300000) {
      // 5分钟内中等频率
      return Math.max(pattern.averageInterval * 1.5, 60000)
    } else {
      // 低频访问
      return Math.min(pattern.averageInterval * 2, defaultTTL * 2)
    }
  }

  /**
   * 获取预测性预取建议
   */
  getPrefetchCandidates(): string[] {
    if (!this.config.enablePredictivePrefetch) {
      return []
    }

    const now = Date.now()
    const candidates: Array<{ key: string; confidence: number }> = []

    for (const pattern of this.accessPatterns.values()) {
      // 需要足够的访问历史
      if (pattern.accessCount < this.config.minAccessForPrediction) {
        continue
      }

      // 计算预取置信度
      const timeSinceLastAccess = now - pattern.lastAccess
      const timeUntilPredicted = pattern.predictedNextAccess - now

      // 如果预测的访问时间即将到来
      if (timeUntilPredicted > 0 && timeUntilPredicted < pattern.averageInterval * 0.5) {
        // 趋势递增的项有更高的优先级
        let confidence = 0.5
        if (pattern.trend === 'increasing') {
          confidence = 0.9
        } else if (pattern.trend === 'stable') {
          confidence = 0.7
        } else {
          confidence = 0.4
        }

        // 根据访问频率调整置信度
        if (pattern.accessCount > 10) {
          confidence += 0.1
        }

        if (confidence >= this.config.prefetchThreshold) {
          candidates.push({ key: pattern.key, confidence })
        }
      }
    }

    // 按置信度排序
    candidates.sort((a, b) => b.confidence - a.confidence)

    return candidates.slice(0, 10).map(c => c.key)
  }

  /**
   * 启动预测引擎
   */
  private startPredictionEngine(): void {
    this.predictionTimer = setInterval(() => {
      const candidates = this.getPrefetchCandidates()

      if (candidates.length > 0) {
        this.logger?.debug('Predictive prefetch candidates', {
          count: candidates.length,
          keys: candidates.slice(0, 3)
        })

        // 这里可以触发预加载逻辑
        // 实际实现需要有数据加载器
      }
    }, 10000) as any // 每10秒运行一次预测
  }

  /**
   * 启动模式清理
   */
  private startPatternCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldPatterns()
    }, 60000) as any // 每分钟清理一次
  }

  /**
   * 清理过期的访问模式
   */
  private cleanupOldPatterns(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, pattern] of this.accessPatterns) {
      // 如果超过时间窗口未访问，删除模式
      if (now - pattern.lastAccess > this.config.patternWindow) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.accessPatterns.delete(key))

    if (expiredKeys.length > 0) {
      this.logger?.debug('Cleaned old access patterns', {
        removed: expiredKeys.length
      })
    }
  }

  /**
   * 获取访问模式统计
   */
  getStats(): {
    totalPatterns: number
    highFrequency: number
    mediumFrequency: number
    lowFrequency: number
    increasingTrend: number
    decreasingTrend: number
  } {
    const patterns = Array.from(this.accessPatterns.values())

    return {
      totalPatterns: patterns.length,
      highFrequency: patterns.filter(p => p.averageInterval < 60000).length,
      mediumFrequency: patterns.filter(p => p.averageInterval >= 60000 && p.averageInterval < 300000).length,
      lowFrequency: patterns.filter(p => p.averageInterval >= 300000).length,
      increasingTrend: patterns.filter(p => p.trend === 'increasing').length,
      decreasingTrend: patterns.filter(p => p.trend === 'decreasing').length
    }
  }

  /**
   * 销毁智能缓存策略
   */
  destroy(): void {
    if (this.predictionTimer) {
      clearInterval(this.predictionTimer)
      this.predictionTimer = undefined
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    this.accessPatterns.clear()
  }
}

/**
 * 创建智能缓存策略实例
 */
export function createSmartCacheStrategy<T = unknown>(
  cache: CacheManager<T>,
  config?: SmartCacheConfig,
  logger?: Logger
): SmartCacheStrategy<T> {
  return new SmartCacheStrategy<T>(cache, config, logger)
}




