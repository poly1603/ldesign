/**
 * 智能缓存管理器
 * 
 * 新增功能：
 * - 内存压力感知的自动清理
 * - 改进的 LRU 算法
 * - 缓存统计和命中率追踪
 * - 缓存预热功能
 * - 渐进式缓存清理
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { CacheManager, type CacheType, type CacheItem, type CacheConfig } from './CacheManager'

/**
 * 缓存统计信息
 */
export interface CacheStatistics {
  /** 总命中次数 */
  hits: number
  /** 总未命中次数 */
  misses: number
  /** 命中率 (0-100) */
  hitRate: number
  /** 缓存项总数 */
  totalItems: number
  /** 缓存占用内存 (估算, bytes) */
  memoryUsage: number
  /** 各类型缓存数量 */
  itemsByType: Record<CacheType, number>
}

/**
 * 缓存项元数据
 */
interface CacheItemMetadata {
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccessTime: number
  /** 创建时间 */
  createdTime: number
  /** 数据大小 (估算, bytes) */
  size: number
  /** 缓存类型 */
  type: CacheType
}

/**
 * 智能缓存管理器配置
 */
export interface SmartCacheConfig {
  /** 最大缓存大小 (MB) */
  maxSize?: number
  /** 是否启用内存压力感知清理 */
  enableMemoryPressureCleanup?: boolean
  /** 内存压力阈值 (0-100) */
  memoryPressureThreshold?: number
  /** 缓存项最大生存时间 (ms) */
  maxAge?: number
  /** 是否启用缓存统计 */
  enableStatistics?: boolean
  /** 渐进式清理间隔 (ms) */
  progressiveCleanupInterval?: number
  /** 每次清理的项目数 */
  cleanupBatchSize?: number
}

/**
 * 智能缓存管理器
 */
export class SmartCacheManager extends CacheManager {
  private smartConfig: Required<SmartCacheConfig>
  private metadata: Map<string, CacheItemMetadata>
  private statistics: CacheStatistics
  private smartCleanupTimer?: NodeJS.Timeout

  constructor(config: SmartCacheConfig = {}) {
    // 调用父类构造函数，传入 CacheConfig
    super({
      enabled: true,
      cacheDir: '.cache',
      maxSize: config.maxSize ?? 100,
      ttl: config.maxAge ?? 3600000,
      types: ['build', 'deps', 'modules', 'transform', 'assets', 'temp'],
      compression: true,
      autoClean: {
        enabled: config.enableMemoryPressureCleanup ?? true,
        interval: 4,
        threshold: (config.memoryPressureThreshold ?? 70) / 100
      }
    })

    this.smartConfig = {
      maxSize: config.maxSize ?? 100, // 100MB
      enableMemoryPressureCleanup: config.enableMemoryPressureCleanup ?? true,
      memoryPressureThreshold: config.memoryPressureThreshold ?? 70,
      maxAge: config.maxAge ?? 3600000, // 1 hour
      enableStatistics: config.enableStatistics ?? true,
      progressiveCleanupInterval: config.progressiveCleanupInterval ?? 60000, // 1 minute
      cleanupBatchSize: config.cleanupBatchSize ?? 10
    }

    this.metadata = new Map()
    this.statistics = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalItems: 0,
      memoryUsage: 0,
      itemsByType: {
        build: 0,
        deps: 0,
        modules: 0,
        transform: 0,
        assets: 0,
        temp: 0
      }
    }

    // 启动渐进式清理
    this.startProgressiveCleanup()
  }

  /**
   * 增强的 set 方法
   */
  async set(key: string, type: CacheType, data: any, ttl?: number): Promise<void> {
    await super.set(key, type, data, ttl)

    // 估算数据大小
    const size = this.estimateSize(data)

    // 记录元数据
    this.metadata.set(key, {
      accessCount: 0,
      lastAccessTime: Date.now(),
      createdTime: Date.now(),
      size,
      type
    })

    // 更新统计信息
    this.updateStatistics()

    // 检查是否需要清理
    this.checkAndCleanup()
  }

  /**
   * 增强的 get 方法
   */
  async get<T = any>(key: string, type: CacheType): Promise<T | null> {
    const value = await super.get<T>(key, type)

    // 更新元数据
    const meta = this.metadata.get(key)
    if (meta) {
      meta.accessCount++
      meta.lastAccessTime = Date.now()

      // 记录命中
      if (this.smartConfig?.enableStatistics) {
        this.statistics.hits++
        this.updateHitRate()
      }
    } else if (this.smartConfig?.enableStatistics) {
      // 记录未命中
      this.statistics.misses++
      this.updateHitRate()
    }

    return value
  }

  /**
   * 删除缓存项
   */
  async delete(key: string, type: CacheType): Promise<void> {
    await super.delete(key, type)
    this.metadata.delete(key)
    this.updateStatistics()
  }

  /**
   * 估算数据大小
   */
  private estimateSize(value: any): number {
    const json = JSON.stringify(value)
    return new Blob([json]).size
  }

  /**
   * 更新统计信息
   */
  private updateStatistics(): void {
    if (!this.smartConfig?.enableStatistics) return

    this.statistics.totalItems = this.metadata.size
    this.statistics.memoryUsage = Array.from(this.metadata.values())
      .reduce((sum, meta) => sum + meta.size, 0)

    // 统计各类型数量
    const itemsByType: Record<CacheType, number> = {
      build: 0,
      deps: 0,
      modules: 0,
      transform: 0,
      assets: 0,
      temp: 0
    }

    for (const meta of this.metadata.values()) {
      itemsByType[meta.type]++
    }

    this.statistics.itemsByType = itemsByType
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.statistics.hits + this.statistics.misses
    this.statistics.hitRate = total > 0
      ? Math.round((this.statistics.hits / total) * 100)
      : 0
  }

  /**
   * 检查并清理缓存
   */
  private async checkAndCleanup(): Promise<void> {
    // 检查内存压力
    if (this.smartConfig?.enableMemoryPressureCleanup) {
      const memUsage = process.memoryUsage()
      const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100

      if (heapUsedPercent > this.smartConfig?.memoryPressureThreshold) {
        console.warn(`🧹 内存压力过高 (${heapUsedPercent.toFixed(1)}%), 开始清理缓存...`)
        await this.cleanup(0.3) // 清理 30% 的缓存
      }
    }

    // 检查缓存大小
    const sizeMB = this.statistics.memoryUsage / 1024 / 1024
    if (sizeMB > this.smartConfig?.maxSize) {
      console.warn(`🧹 缓存大小超限 (${sizeMB.toFixed(1)}MB), 开始清理...`)
      await this.cleanup(0.2) // 清理 20% 的缓存
    }
  }

  /**
   * 清理缓存
   * @param ratio 清理比例 (0-1)
   */
  async cleanup(ratio: number = 0.1): Promise<void> {
    const entries = Array.from(this.metadata.entries())
    const now = Date.now()

    // 计算清理数量
    const cleanupCount = Math.max(1, Math.floor(entries.length * ratio))

    // 使用改进的 LRU 算法排序
    // 考虑：访问频率、最后访问时间、数据年龄
    entries.sort(([, a], [, b]) => {
      // 计算访问频率分数 (0-1)
      const maxAccessCount = Math.max(...entries.map(([, m]) => m.accessCount), 1)
      const frequencyScoreA = a.accessCount / maxAccessCount
      const frequencyScoreB = b.accessCount / maxAccessCount

      // 计算新鲜度分数 (0-1)
      const ageA = now - a.lastAccessTime
      const ageB = now - a.lastAccessTime
      const maxAge = Math.max(ageA, ageB)
      const freshnessScoreA = maxAge > 0 ? 1 - (ageA / maxAge) : 1
      const freshnessScoreB = maxAge > 0 ? 1 - (ageB / maxAge) : 1

      // 综合分数 (访问频率 60% + 新鲜度 40%)
      const scoreA = frequencyScoreA * 0.6 + freshnessScoreA * 0.4
      const scoreB = frequencyScoreB * 0.6 + freshnessScoreB * 0.4

      return scoreA - scoreB // 分数低的排在前面，优先清理
    })

    // 清理得分最低的项
    for (let i = 0; i < cleanupCount; i++) {
      const [key] = entries[i]
      const meta = this.metadata.get(key)
      if (meta) {
        await this.delete(key, meta.type)
      }
    }


  }

  /**
   * 启动渐进式清理
   */
  private startProgressiveCleanup(): void {
    this.smartCleanupTimer = setInterval(() => {
      this.cleanupExpired()
    }, this.smartConfig?.progressiveCleanupInterval)
  }

  /**
   * 清理过期项
   */
  private async cleanupExpired(): Promise<void> {
    const now = Date.now()
    const expired: string[] = []

    for (const [key, meta] of this.metadata.entries()) {
      const age = now - meta.createdTime
      if (age > this.smartConfig?.maxAge) {
        expired.push(key)
      }
    }

    if (expired.length > 0) {
      // 分批清理
      const batch = expired.slice(0, this.smartConfig?.cleanupBatchSize)
      for (const key of batch) {
        const meta = this.metadata.get(key)
        if (meta) {
          await this.delete(key, meta.type)
        }
      }


    }
  }

  /**
   * 停止渐进式清理
   */
  stopProgressiveCleanup(): void {
    if (this.smartCleanupTimer) {
      clearInterval(this.smartCleanupTimer)
      this.smartCleanupTimer = undefined
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStatistics(): CacheStatistics {
    return { ...this.statistics }
  }

  /**
   * 缓存预热
   * @param warmupFn 预热函数
   */
  async warmup(warmupFn: () => Promise<Record<string, any>>): Promise<void> {

    const startTime = Date.now()

    try {
      const data = await warmupFn()
      let count = 0

      for (const [key, value] of Object.entries(data)) {
        await this.set(key, 'build', value)
        count++
      }

      const duration = Date.now() - startTime

    } catch (error) {
      console.error('❌ 缓存预热失败:', error)
    }
  }

  /**
   * 导出缓存报告
   */
  getReport(): string {
    const stats = this.getStatistics()
    const sizeMB = (stats.memoryUsage / 1024 / 1024).toFixed(2)

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💾 智能缓存报告
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【统计信息】
  📊 缓存项总数: ${stats.totalItems}
  💾 内存占用: ${sizeMB}MB / ${this.smartConfig?.maxSize}MB
  🎯 命中率: ${stats.hitRate}%
  ✅ 命中次数: ${stats.hits}
  ❌ 未命中次数: ${stats.misses}

【按类型统计】
  🏗️  构建缓存: ${stats.itemsByType.build}
  📦 依赖缓存: ${stats.itemsByType.deps}
  📂 模块缓存: ${stats.itemsByType.modules}
  🔄 转换缓存: ${stats.itemsByType.transform}
  🎨 资源缓存: ${stats.itemsByType.assets}
  📄 临时缓存: ${stats.itemsByType.temp}

【缓存健康度】
  ${this.getCacheHealthEmoji(stats)} ${this.getCacheHealthStatus(stats)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim()
  }

  /**
   * 获取缓存健康状态
   */
  private getCacheHealthStatus(stats: CacheStatistics): string {
    const sizeMB = stats.memoryUsage / 1024 / 1024
    const sizePercent = (sizeMB / this.smartConfig?.maxSize) * 100

    if (stats.hitRate >= 80 && sizePercent < 70) {
      return '健康 - 缓存运行良好'
    } else if (stats.hitRate >= 60 && sizePercent < 85) {
      return '良好 - 缓存性能可接受'
    } else if (sizePercent >= 85) {
      return '警告 - 缓存占用过高，建议清理'
    } else if (stats.hitRate < 60) {
      return '注意 - 命中率较低，建议优化缓存策略'
    }
    return '正常'
  }

  /**
   * 获取缓存健康度 emoji
   */
  private getCacheHealthEmoji(stats: CacheStatistics): string {
    const sizeMB = stats.memoryUsage / 1024 / 1024
    const sizePercent = (sizeMB / this.smartConfig?.maxSize) * 100

    if (stats.hitRate >= 80 && sizePercent < 70) return '✅'
    if (stats.hitRate >= 60 && sizePercent < 85) return '👍'
    if (sizePercent >= 85) return '⚠️'
    if (stats.hitRate < 60) return '📉'
    return '✔️'
  }

  /**
   * 清理并销毁管理器
   */
  async destroy(): Promise<void> {
    this.stopProgressiveCleanup()
    await this.clear()
  }
}

/**
 * 创建智能缓存管理器实例
 */
export function createSmartCache(config?: SmartCacheConfig): SmartCacheManager {
  return new SmartCacheManager(config)
}
