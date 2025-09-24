/**
 * 缓存操作工具
 * 
 * 提供统一的缓存操作接口，消除重复的缓存逻辑
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { TimeUtils, CacheKeyUtils } from './common'

/**
 * 缓存项接口
 */
export interface CacheItem<T = unknown> {
  value: T
  timestamp: number
  ttl?: number
  accessCount: number
  lastAccessed: number
  size?: number
}

/**
 * 缓存操作配置
 */
export interface CacheOperationConfig {
  /** 默认TTL（毫秒） */
  defaultTTL?: number
  /** 是否启用TTL */
  enableTTL?: boolean
  /** 最大缓存大小 */
  maxSize?: number
  /** 是否启用访问统计 */
  enableStats?: boolean
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
  size: number
  memoryUsage?: number
}

/**
 * 统一缓存操作工具类
 */
export class CacheOperations<T = unknown> {
  private cache = new Map<string, CacheItem<T>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    size: 0
  }

  constructor(private config: CacheOperationConfig = {}) {}

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    this.stats.totalRequests++

    const item = this.cache.get(key)
    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.misses++
      this.updateHitRate()
      return undefined
    }

    // 更新访问信息
    item.accessCount++
    item.lastAccessed = TimeUtils.now()
    
    this.stats.hits++
    this.updateHitRate()
    return item.value
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, ttl?: number): void {
    const now = TimeUtils.now()
    const effectiveTTL = ttl ?? this.config.defaultTTL

    // 检查是否需要清理空间
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      this.evictLRU()
    }

    const item: CacheItem<T> = {
      value,
      timestamp: now,
      ttl: effectiveTTL,
      accessCount: 1,
      lastAccessed: now,
      size: this.calculateSize(value)
    }

    this.cache.set(key, item)
    this.stats.size = this.cache.size
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.size = this.cache.size
    }
    return deleted
  }

  /**
   * 检查缓存项是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) {
      return false
    }

    if (this.isExpired(item)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 清理过期项
   */
  cleanupExpired(): number {
    let cleanedCount = 0
    const now = TimeUtils.now()

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      this.stats.size = this.cache.size
    }

    return cleanedCount
  }

  /**
   * 获取缓存健康状态
   */
  getHealthStatus(): {
    isHealthy: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // 检查命中率
    if (this.stats.hitRate < 0.5 && this.stats.totalRequests > 100) {
      issues.push('Low cache hit rate')
      recommendations.push('Consider increasing cache size or adjusting TTL')
    }

    // 检查缓存大小
    if (this.config.maxSize && this.stats.size > this.config.maxSize * 0.9) {
      issues.push('Cache size approaching limit')
      recommendations.push('Consider increasing max cache size')
    }

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations
    }
  }

  /**
   * 预热缓存
   */
  warmUp(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.ttl)
    }
  }

  /**
   * 批量获取
   */
  getMultiple(keys: string[]): Map<string, T> {
    const results = new Map<string, T>()
    
    for (const key of keys) {
      const value = this.get(key)
      if (value !== undefined) {
        results.set(key, value)
      }
    }

    return results
  }

  /**
   * 批量设置
   */
  setMultiple(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.ttl)
    }
  }

  /**
   * 检查项是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    if (!this.config.enableTTL || !item.ttl) {
      return false
    }
    return TimeUtils.isExpired(item.timestamp, item.ttl)
  }

  /**
   * LRU淘汰策略
   */
  private evictLRU(): void {
    let oldestKey: string | undefined
    let oldestTime = Infinity

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * 计算值的大小（简单估算）
   */
  private calculateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2 // 粗略估算字节数
    } catch {
      return 100 // 默认大小
    }
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = this.stats.hits / this.stats.totalRequests
    }
  }
}

/**
 * 创建翻译专用缓存操作实例
 */
export function createTranslationCache(config?: CacheOperationConfig): CacheOperations<string> {
  return new CacheOperations<string>({
    defaultTTL: 300000, // 5分钟
    enableTTL: true,
    maxSize: 1000,
    enableStats: true,
    ...config
  })
}

/**
 * 创建语言包专用缓存操作实例
 */
export function createPackageCache(config?: CacheOperationConfig): CacheOperations<any> {
  return new CacheOperations<any>({
    defaultTTL: 600000, // 10分钟
    enableTTL: true,
    maxSize: 100,
    enableStats: true,
    ...config
  })
}
