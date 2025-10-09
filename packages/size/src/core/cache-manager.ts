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

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 50
    this.ttl = options.ttl ?? 0
    this.enabled = options.enabled ?? true
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
    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 0,
      lastAccessTime: now,
    })
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

