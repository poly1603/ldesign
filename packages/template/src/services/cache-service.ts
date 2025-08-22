/**
 * 缓存服务封装
 * 
 * 提供统一的缓存接口，包括：
 * - LRU 缓存实现
 * - TTL 支持
 * - 缓存统计
 * - 缓存策略
 */

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 最大缓存数量 */
  maxSize?: number
  /** 缓存过期时间 (毫秒) */
  ttl?: number
  /** 是否启用调试模式 */
  debug?: boolean
  /** 缓存策略 */
  strategy?: 'lru' | 'fifo' | 'lfu'
}

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  /** 缓存值 */
  value: T
  /** 创建时间 */
  timestamp: number
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccessed: number
}

/**
 * 缓存统计接口
 */
export interface CacheStats {
  /** 缓存大小 */
  size: number
  /** 最大大小 */
  maxSize: number
  /** 命中次数 */
  hits: number
  /** 未命中次数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 过期清理次数 */
  evictions: number
}

/**
 * 缓存服务类
 */
export class CacheService<T = unknown> {
  private cache = new Map<string, CacheItem<T>>()
  private config: Required<CacheConfig>
  private stats: CacheStats

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: 100,
      ttl: 5 * 60 * 1000, // 5分钟
      debug: false,
      strategy: 'lru',
      ...config,
    }

    this.stats = {
      size: 0,
      maxSize: this.config.maxSize,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0,
    }
  }

  /**
   * 设置缓存
   */
  set(key: string, value: T): void {
    const now = Date.now()

    // 如果已存在，更新值
    if (this.cache.has(key)) {
      const item = this.cache.get(key)!
      item.value = value
      item.timestamp = now
      item.lastAccessed = now
      item.accessCount++
      return
    }

    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxSize) {
      this.evict()
    }

    // 添加新项
    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
    })

    this.updateStats()

    if (this.config.debug) {
      console.log(`💾 缓存设置: ${key}`)
    }
  }

  /**
   * 获取缓存
   */
  get(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      return null
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      this.updateStats()
      return null
    }

    // 更新访问信息
    item.lastAccessed = Date.now()
    item.accessCount++

    this.stats.hits++
    this.updateHitRate()

    if (this.config.debug) {
      console.log(`💾 缓存命中: ${key}`)
    }

    return item.value
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) {
      return false
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.evictions++
      this.updateStats()
      return false
    }

    return true
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.updateStats()
      if (this.config.debug) {
        console.log(`💾 缓存删除: ${key}`)
      }
    }
    return deleted
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.stats.hits = 0
    this.stats.misses = 0
    this.stats.evictions = 0
    this.updateStats()

    if (this.config.debug) {
      console.log('💾 缓存已清空')
    }
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取所有值
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(item => item.value)
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      this.stats.evictions += cleanedCount
      this.updateStats()

      if (this.config.debug) {
        console.log(`💾 清理过期缓存: ${cleanedCount} 项`)
      }
    }

    return cleanedCount
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > this.config.ttl
  }

  /**
   * 缓存淘汰策略
   */
  private evict(): void {
    if (this.cache.size === 0) {
      return
    }

    let keyToEvict: string

    switch (this.config.strategy) {
      case 'lru':
        keyToEvict = this.findLRUKey()
        break
      case 'lfu':
        keyToEvict = this.findLFUKey()
        break
      case 'fifo':
      default:
        keyToEvict = this.findFIFOKey()
        break
    }

    this.cache.delete(keyToEvict)
    this.stats.evictions++

    if (this.config.debug) {
      console.log(`💾 缓存淘汰 (${this.config.strategy}): ${keyToEvict}`)
    }
  }

  /**
   * 查找最近最少使用的键 (LRU)
   */
  private findLRUKey(): string {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    return oldestKey
  }

  /**
   * 查找最少使用的键 (LFU)
   */
  private findLFUKey(): string {
    let leastUsedKey = ''
    let leastCount = Number.MAX_SAFE_INTEGER

    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < leastCount) {
        leastCount = item.accessCount
        leastUsedKey = key
      }
    }

    return leastUsedKey
  }

  /**
   * 查找最先进入的键 (FIFO)
   */
  private findFIFOKey(): string {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    return oldestKey
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.size = this.cache.size
    this.updateHitRate()
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  /**
   * 销毁缓存服务
   */
  destroy(): void {
    this.clear()

    if (this.config.debug) {
      console.log('💾 缓存服务已销毁')
    }
  }
}
