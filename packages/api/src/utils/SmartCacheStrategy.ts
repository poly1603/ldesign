/**
 * 智能缓存策略管理器
 * 基于访问频率和模式自动调整缓存策略
 */

/**
 * 缓存项访问统计
 */
interface CacheAccessStats {
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccessTime: number
  /** 首次访问时间 */
  firstAccessTime: number
  /** 平均访问间隔 */
  averageInterval: number
  /** 访问时间戳列表（最近10次） */
  accessTimestamps: number[]
}

/**
 * 智能缓存策略配置
 */
export interface SmartCacheStrategyConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 最小访问次数阈值（低于此值的项优先淘汰） */
  minAccessThreshold?: number
  /** 热点数据TTL倍数（访问频繁的数据缓存时间更长） */
  hotDataTTLMultiplier?: number
  /** 冷数据TTL倍数（访问不频繁的数据缓存时间更短） */
  coldDataTTLMultiplier?: number
  /** 统计窗口大小（保留最近N次访问记录） */
  statsWindowSize?: number
  /** 自动调整间隔（毫秒） */
  autoAdjustInterval?: number
}

/**
 * 缓存优先级
 */
export enum CachePriority {
  /** 低优先级 - 优先淘汰 */
  LOW = 1,
  /** 普通优先级 */
  NORMAL = 2,
  /** 高优先级 - 热点数据 */
  HIGH = 3,
  /** 最高优先级 - 永不淘汰 */
  CRITICAL = 4,
}

/**
 * 智能缓存策略管理器
 */
export class SmartCacheStrategy {
  private config: Required<SmartCacheStrategyConfig>
  private accessStats = new Map<string, CacheAccessStats>()
  private priorityMap = new Map<string, CachePriority>()
  private adjustTimer?: ReturnType<typeof setInterval>

  constructor(config: SmartCacheStrategyConfig = {}) {
    this.config = {
      enabled: true,
      minAccessThreshold: 3,
      hotDataTTLMultiplier: 2,
      coldDataTTLMultiplier: 0.5,
      statsWindowSize: 10,
      autoAdjustInterval: 5 * 60 * 1000, // 5分钟
      ...config,
    }

    if (this.config?.enabled && this.config?.autoAdjustInterval > 0) {
      this.startAutoAdjust()
    }
  }

  /**
   * 记录访问
   */
  recordAccess(key: string): void {
    if (!this.config?.enabled) {
      return
    }

    const now = Date.now()
    let stats = this.accessStats.get(key)

    if (!stats) {
      stats = {
        accessCount: 0,
        lastAccessTime: now,
        firstAccessTime: now,
        averageInterval: 0,
        accessTimestamps: [],
      }
      this.accessStats.set(key, stats)
    }

    stats.accessCount++
    stats.lastAccessTime = now
    stats.accessTimestamps.push(now)

    // 保持窗口大小
    if (stats.accessTimestamps.length > this.config?.statsWindowSize) {
      stats.accessTimestamps.shift()
    }

    // 计算平均访问间隔
    if (stats.accessTimestamps.length >= 2) {
      const intervals: number[] = []
      for (let i = 1; i < stats.accessTimestamps.length; i++) {
        intervals.push(stats.accessTimestamps[i] - stats.accessTimestamps[i - 1])
      }
      stats.averageInterval
        = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    }

    // 自动调整优先级
    this.adjustPriority(key, stats)
  }

  /**
   * 获取建议的TTL
   */
  getSuggestedTTL(key: string, baseTTL: number): number {
    if (!this.config?.enabled) {
      return baseTTL
    }

    const priority = this.priorityMap.get(key) || CachePriority.NORMAL

    switch (priority) {
      case CachePriority.CRITICAL:
        return baseTTL * 10 // 10倍TTL
      case CachePriority.HIGH:
        return baseTTL * this.config?.hotDataTTLMultiplier
      case CachePriority.LOW:
        return baseTTL * this.config?.coldDataTTLMultiplier
      default:
        return baseTTL
    }
  }

  /**
   * 获取缓存优先级
   */
  getPriority(key: string): CachePriority {
    return this.priorityMap.get(key) || CachePriority.NORMAL
  }

  /**
   * 设置缓存优先级
   */
  setPriority(key: string, priority: CachePriority): void {
    this.priorityMap.set(key, priority)
  }

  /**
   * 获取访问统计
   */
  getAccessStats(key: string): CacheAccessStats | null {
    return this.accessStats.get(key) || null
  }

  /**
   * 获取所有统计信息
   */
  getAllStats(): Map<string, CacheAccessStats> {
    return new Map(this.accessStats)
  }

  /**
   * 获取热点数据列表
   */
  getHotKeys(limit: number = 10): string[] {
    const entries = Array.from(this.accessStats.entries())
    return entries
      .sort((a, b) => {
        // 综合考虑访问次数和访问频率
        const scoreA = a[1].accessCount / (a[1].averageInterval || 1)
        const scoreB = b[1].accessCount / (b[1].averageInterval || 1)
        return scoreB - scoreA
      })
      .slice(0, limit)
      .map(([key]) => key)
  }

  /**
   * 获取冷数据列表
   */
  getColdKeys(limit: number = 10): string[] {
    const entries = Array.from(this.accessStats.entries())
    const now = Date.now()

    return entries
      .filter(([, stats]) => stats.accessCount < this.config?.minAccessThreshold)
      .sort((a, b) => {
        // 按最后访问时间排序
        return (now - b[1].lastAccessTime) - (now - a[1].lastAccessTime)
      })
      .slice(0, limit)
      .map(([key]) => key)
  }

  /**
   * 清理统计信息
   */
  clearStats(key?: string): void {
    if (key) {
      this.accessStats.delete(key)
      this.priorityMap.delete(key)
    }
    else {
      this.accessStats.clear()
      this.priorityMap.clear()
    }
  }

  /**
   * 销毁策略管理器
   */
  destroy(): void {
    if (this.adjustTimer) {
      clearInterval(this.adjustTimer)
      this.adjustTimer = undefined
    }
    this.clearStats()
  }

  /**
   * 调整缓存优先级
   */
  private adjustPriority(key: string, stats: CacheAccessStats): void {
    const currentPriority = this.priorityMap.get(key) || CachePriority.NORMAL

    // 如果已经是最高优先级，不再调整
    if (currentPriority === CachePriority.CRITICAL) {
      return
    }

    // 基于访问次数和频率计算优先级
    const accessScore = stats.accessCount
    const frequencyScore = stats.averageInterval > 0 ? 1000 / stats.averageInterval : 0

    let newPriority = CachePriority.NORMAL

    if (accessScore >= 10 && frequencyScore > 0.1) {
      // 高频访问
      newPriority = CachePriority.HIGH
    }
    else if (accessScore < this.config?.minAccessThreshold) {
      // 低频访问
      newPriority = CachePriority.LOW
    }

    if (newPriority !== currentPriority) {
      this.priorityMap.set(key, newPriority)
    }
  }

  /**
   * 启动自动调整
   */
  private startAutoAdjust(): void {
    this.adjustTimer = setInterval(() => {
      this.performAutoAdjust()
    }, this.config?.autoAdjustInterval)
  }

  /**
   * 执行自动调整
   */
  private performAutoAdjust(): void {
    const now = Date.now()
    const staleThreshold = 10 * 60 * 1000 // 10分钟未访问视为过期

    // 清理长时间未访问的统计信息
    const toDelete: string[] = []
    this.accessStats.forEach((stats, key) => {
      if (now - stats.lastAccessTime > staleThreshold) {
        toDelete.push(key)
      }
    })

    toDelete.forEach((key) => {
      this.clearStats(key)
    })
  }
}

/**
 * 创建智能缓存策略
 */
export function createSmartCacheStrategy(
  config?: SmartCacheStrategyConfig,
): SmartCacheStrategy {
  return new SmartCacheStrategy(config)
}

