/**
 * 缓存管理器
 * 用于缓存 CSS 变量和配置，减少重复计算
 */

import type { SizeConfig, SizeMode } from '../types'

export interface CacheEntry<T> {
  /** 缓存的值 */
  value: T
  /** 创建时间戳 */
  timestamp: number
  /** 访问次数 */
  accessCount: number
  /** 最后访问时间 */
  lastAccessTime: number
}

export interface CacheOptions {
  /** 最大缓存条目数 */
  maxSize?: number
  /** 缓存过期时间（毫秒），0 表示永不过期 */
  ttl?: number
  /** 是否启用缓存 */
  enabled?: boolean
  /** 内存压力阈值（字节），超过此值时自动清理 */
  memoryThreshold?: number
  /** 是否启用自动清理 */
  enableAutoCleanup?: boolean
  /** 自动清理间隔（毫秒） */
  cleanupInterval?: number
}

/**
 * LRU 缓存管理器
 */
export class CacheManager<K = string, V = any> {
  private cache: Map<K, CacheEntry<V>> = new Map()
  private maxSize: number
  private ttl: number
  private enabled: boolean
  private hits = 0
  private misses = 0
  private memoryThreshold: number
  private enableAutoCleanup: boolean
  private cleanupInterval: number
  private cleanupTimer: NodeJS.Timeout | null = null
  private estimatedSize = 0

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 50
    this.ttl = options.ttl ?? 0
    this.enabled = options.enabled ?? true
    this.memoryThreshold = options.memoryThreshold ?? 10 * 1024 * 1024 // 10MB default
    this.enableAutoCleanup = options.enableAutoCleanup ?? true
    this.cleanupInterval = options.cleanupInterval ?? 60000 // 1分钟

    if (this.enableAutoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 获取缓存值
   */
  get(key: K): V | undefined {
    if (!this.enabled) {
      return undefined
    }

    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return undefined
    }

    // 检查是否过期
    if (this.ttl > 0 && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      this.misses++
      return undefined
    }

    // 更新访问信息
    entry.accessCount++
    entry.lastAccessTime = Date.now()
    this.hits++

    return entry.value
  }

  /**
   * 设置缓存值
   */
  set(key: K, value: V): void {
    if (!this.enabled) {
      return
    }

    // 如果缓存已满，删除最少使用的条目
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    const now = Date.now()
    const entry = {
      value,
      timestamp: now,
      accessCount: 0,
      lastAccessTime: now,
    }
    
    this.cache.set(key, entry)
    this.updateEstimatedSize()
    
    // 检查内存压力
    if (this.estimatedSize > this.memoryThreshold) {
      this.performMemoryCleanup()
    }
  }

  /**
   * 检查缓存是否存在
   */
  has(key: K): boolean {
    if (!this.enabled) {
      return false
    }

    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    // 检查是否过期
    if (this.ttl > 0 && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }

  /**
   * 驱逐最少使用的条目
   */
  private evictLRU(): void {
    let lruKey: K | undefined
    let lruTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessTime < lruTime) {
        lruTime = entry.lastAccessTime
        lruKey = key
      }
    }

    if (lruKey !== undefined) {
      this.cache.delete(lruKey)
    }
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取缓存命中率
   */
  getHitRate(): number {
    const total = this.hits + this.misses
    return total === 0 ? 0 : this.hits / total
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number
    maxSize: number
    hits: number
    misses: number
    hitRate: number
    enabled: boolean
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      enabled: this.enabled,
    }
  }

  /**
   * 启用缓存
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用缓存
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * 获取所有缓存键
   */
  keys(): K[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取所有缓存值
   */
  values(): V[] {
    return Array.from(this.cache.values()).map(entry => entry.value)
  }

  /**
   * 获取所有缓存条目
   */
  entries(): Array<[K, V]> {
    return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value])
  }

  /**
   * 更新估算的缓存大小
   */
  private updateEstimatedSize(): void {
    // 粗略估算：每个条目约200字节 + 键的大小
    this.estimatedSize = this.cache.size * 200
  }

  /**
   * 执行内存清理
   */
  private performMemoryCleanup(): void {
    const targetSize = Math.floor(this.maxSize * 0.7) // 清理到70%容量
    const toRemove = this.cache.size - targetSize

    if (toRemove <= 0) return

    // 按访问时间排序，移除最久未使用的条目
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessTime - b[1].lastAccessTime)
      .slice(0, toRemove)

    for (const [key] of entries) {
      this.cache.delete(key)
    }

    this.updateEstimatedSize()
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired()
    }, this.cleanupInterval)
  }

  /**
   * 停止自动清理
   */
  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * 清理过期条目
   */
  private cleanupExpired(): void {
    if (this.ttl <= 0) return

    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }

    this.updateEstimatedSize()
  }

  /**
   * 预热缓存
   * @param entries 要预热的条目
   */
  warmup(entries: Array<[K, V]>): void {
    for (const [key, value] of entries) {
      this.set(key, value)
    }
  }

  /**
   * 获取估算的内存使用
   */
  getEstimatedSize(): number {
    return this.estimatedSize
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    this.stopAutoCleanup()
    this.clear()
  }
}

/**
 * CSS 变量缓存管理器
 */
export class CSSVariableCache extends CacheManager<SizeMode, Record<string, string>> {
  constructor() {
    super({
      maxSize: 10, // 只缓存少量模式
      ttl: 0, // 永不过期
      enabled: true,
    })
  }
}

/**
 * 配置缓存管理器
 */
export class ConfigCache extends CacheManager<SizeMode, SizeConfig> {
  constructor() {
    super({
      maxSize: 10,
      ttl: 0,
      enabled: true,
    })
  }
}

/**
 * 全局 CSS 变量缓存实例
 */
export const globalCSSVariableCache = new CSSVariableCache()

/**
 * 全局配置缓存实例
 */
export const globalConfigCache = new ConfigCache()

