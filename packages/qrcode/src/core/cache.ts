/**
 * LDesign QRCode - 改进的缓存管理系统
 * 提供TTL、LRU淘汰策略和内存管理功能
 */

export interface CacheEntry<T> {
  data: T
  timestamp: number
  accessCount: number
  lastAccessed: number
  size?: number
}

export interface CacheConfig {
  maxSize?: number
  ttl?: number // Time to live in milliseconds
  maxMemoryUsage?: number // Maximum memory usage in bytes (estimated)
  enableLRU?: boolean
  enableStats?: boolean
}

export interface CacheStats {
  size: number
  maxSize: number
  hitCount: number
  missCount: number
  evictionCount: number
  totalMemoryUsage: number
  hitRate: number
}

export class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private config: Required<CacheConfig>
  private stats = {
    hitCount: 0,
    missCount: 0,
    evictionCount: 0,
  }
  
  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize ?? 100,
      ttl: config.ttl ?? 1000 * 60 * 30, // 30 minutes default
      maxMemoryUsage: config.maxMemoryUsage ?? 50 * 1024 * 1024, // 50MB default
      enableLRU: config.enableLRU ?? true,
      enableStats: config.enableStats ?? true,
    }
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.missCount++
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.stats.missCount++
      this.stats.evictionCount++
      return undefined
    }

    // 更新访问信息（LRU）
    if (this.config.enableLRU) {
      entry.accessCount++
      entry.lastAccessed = Date.now()
    }

    this.stats.hitCount++
    return entry.data
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, customTTL?: number): void {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
      size: this.estimateSize(value),
    }

    // 检查是否需要清理空间
    this.evictIfNeeded()

    this.cache.set(key, entry)
  }

  /**
   * 检查键是否存在且有效
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.stats.evictionCount++
      return false
    }
    
    return true
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.resetStats()
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hitCount + this.stats.missCount
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitCount: this.stats.hitCount,
      missCount: this.stats.missCount,
      evictionCount: this.stats.evictionCount,
      totalMemoryUsage: this.getTotalMemoryUsage(),
      hitRate: totalRequests > 0 ? this.stats.hitCount / totalRequests : 0,
    }
  }

  /**
   * 清理过期项
   */
  cleanup(): number {
    let removedCount = 0
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        removedCount++
      }
    }
    
    this.stats.evictionCount += removedCount
    return removedCount
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 如果新的最大大小更小，需要清理
    if (newConfig.maxSize && this.cache.size > newConfig.maxSize) {
      this.evictIfNeeded()
    }
  }

  /**
   * 检查项是否过期
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    const now = Date.now()
    return (now - entry.timestamp) > this.config.ttl
  }

  /**
   * 估算数据大小（粗略估算）
   */
  private estimateSize(value: T): number {
    try {
      const str = JSON.stringify(value)
      return str.length * 2 // 粗略估算，假设每个字符占2字节
    } catch {
      return 1024 // 默认估算1KB
    }
  }

  /**
   * 获取总内存使用量
   */
  private getTotalMemoryUsage(): number {
    let total = 0
    for (const entry of this.cache.values()) {
      total += entry.size ?? 1024
    }
    return total
  }

  /**
   * 如果需要则清理缓存项
   */
  private evictIfNeeded(): void {
    // 首先清理过期项
    this.cleanup()
    
    // 检查大小限制
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU(this.cache.size - this.config.maxSize + 1)
    }
    
    // 检查内存使用限制
    const memoryUsage = this.getTotalMemoryUsage()
    if (memoryUsage > this.config.maxMemoryUsage) {
      this.evictByMemory()
    }
  }

  /**
   * LRU淘汰策略
   */
  private evictLRU(count: number): void {
    if (!this.config.enableLRU || count <= 0) return
    
    // 按最后访问时间排序
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
    
    for (let i = 0; i < count && i < entries.length; i++) {
      const [key] = entries[i]
      this.cache.delete(key)
      this.stats.evictionCount++
    }
  }

  /**
   * 基于内存使用的淘汰策略
   */
  private evictByMemory(): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => {
        // 优先删除大文件和旧文件
        const sizeScore = (b.size ?? 0) - (a.size ?? 0)
        const timeScore = a.lastAccessed - b.lastAccessed
        return sizeScore + timeScore * 0.001 // 时间权重较小
      })
    
    let currentMemory = this.getTotalMemoryUsage()
    let i = 0
    
    while (currentMemory > this.config.maxMemoryUsage && i < entries.length) {
      const [key, entry] = entries[i]
      this.cache.delete(key)
      currentMemory -= entry.size ?? 1024
      this.stats.evictionCount++
      i++
    }
  }

  /**
   * 重置统计信息
   */
  private resetStats(): void {
    this.stats = {
      hitCount: 0,
      missCount: 0,
      evictionCount: 0,
    }
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    this.clear()
  }
}

/**
 * 创建缓存实例的工厂函数
 */
export function createCache<T>(config?: CacheConfig): AdvancedCache<T> {
  return new AdvancedCache<T>(config)
}
