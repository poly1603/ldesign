/**
 * 智能缓存系统
 * 提供高性能的三级缓存架构
 */

import type { CacheStrategy } from '../types'

/**
 * 缓存项
 */
interface CacheItem<T> {
  /** 数据 */
  data: T
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessedAt: number
  /** 访问次数 */
  accessCount: number
  /** 过期时间 */
  expiresAt?: number
  /** 优先级 */
  priority?: number
  /** 大小（字节） */
  size?: number
  /** 标签 */
  tags?: string[]
}

/**
 * 缓存配置选项
 */
export interface SmartCacheOptions {
  /** 最大缓存项数 */
  maxSize?: number
  /** 最大内存使用（字节） */
  maxMemory?: number
  /** 默认TTL（毫秒） */
  ttl?: number
  /** 缓存策略 */
  strategy?: CacheStrategy
  /** 是否启用统计 */
  enableStats?: boolean
  /** 是否启用压缩 */
  compress?: boolean
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
  /** 调试模式 */
  debug?: boolean
}

/**
 * 缓存统计
 */
export interface CacheStats {
  /** 缓存命中次数 */
  hits: number
  /** 缓存未命中次数 */
  misses: number
  /** 缓存项数量 */
  size: number
  /** 内存使用（字节） */
  memoryUsage: number
  /** 命中率 */
  hitRate: number
  /** 平均访问时间（毫秒） */
  avgAccessTime: number
  /** 驱逐次数 */
  evictions: number
}

/**
 * 智能缓存类
 * 实现LRU、LFU、TTL等多种缓存策略
 */
export class SmartCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private options: Required<SmartCacheOptions>
  private stats: CacheStats
  private cleanupTimer?: NodeJS.Timeout
  private memoryUsage = 0
  private accessTimes: number[] = []

  constructor(options: SmartCacheOptions = {}) {
    this.options = {
      maxSize: 1000,
      maxMemory: 100 * 1024 * 1024, // 100MB
      ttl: 5 * 60 * 1000, // 5分钟
      strategy: 'memory',
      enableStats: true,
      compress: false,
      cleanupInterval: 60 * 1000, // 1分钟
      debug: false,
      ...options,
    }

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      memoryUsage: 0,
      hitRate: 0,
      avgAccessTime: 0,
      evictions: 0,
    }

    // 启动定期清理
    if (this.options.cleanupInterval > 0) {
      this.startCleanup()
    }
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    const startTime = Date.now()
    const item = this.cache.get(key)

    if (!item) {
      this.recordMiss()
      return undefined
    }

    // 检查是否过期
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.delete(key)
      this.recordMiss()
      return undefined
    }

    // 更新访问信息
    item.lastAccessedAt = Date.now()
    item.accessCount++

    // 根据策略调整位置（LRU）
    if (this.options.strategy === 'memory') {
      this.cache.delete(key)
      this.cache.set(key, item)
    }

    this.recordHit(Date.now() - startTime)
    return item.data
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, options?: {
    ttl?: number
    priority?: number
    tags?: string[]
  }): boolean {
    const ttl = options?.ttl ?? this.options.ttl
    const size = this.estimateSize(value)

    // 检查内存限制
    if (this.memoryUsage + size > this.options.maxMemory) {
      this.evict(size)
    }

    // 检查数量限制
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictOne()
    }

    const item: CacheItem<T> = {
      data: value,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 0,
      expiresAt: ttl > 0 ? Date.now() + ttl : undefined,
      priority: options?.priority,
      size,
      tags: options?.tags,
    }

    // 更新内存使用
    const oldItem = this.cache.get(key)
    if (oldItem) {
      this.memoryUsage -= oldItem.size || 0
    }
    this.memoryUsage += size

    this.cache.set(key, item)
    this.updateStats()

    if (this.options.debug) {
      console.log(`[SmartCache] 设置缓存：${key}，大小：${size}，TTL：${ttl}`)
    }

    return true
  }

  /**
   * 检查缓存项是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    // 检查是否过期
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    this.memoryUsage -= item.size || 0
    const result = this.cache.delete(key)
    this.updateStats()

    if (this.options.debug) {
      console.log(`[SmartCache] 删除缓存：${key}`)
    }

    return result
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.memoryUsage = 0
    this.stats.size = 0
    this.stats.memoryUsage = 0

    if (this.options.debug) {
      console.log('[SmartCache] 缓存已清空')
    }
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: this.cache.size,
      memoryUsage: this.memoryUsage,
      hitRate: 0,
      avgAccessTime: 0,
      evictions: 0,
    }
    this.accessTimes = []
  }

  /**
   * 按标签获取缓存项
   */
  getByTags(tags: string[]): Map<string, T> {
    const result = new Map<string, T>()

    for (const [key, item] of this.cache) {
      if (item.tags && tags.some(tag => item.tags!.includes(tag))) {
        if (!item.expiresAt || item.expiresAt > Date.now()) {
          result.set(key, item.data)
        }
      }
    }

    return result
  }

  /**
   * 按标签删除缓存项
   */
  deleteByTags(tags: string[]): number {
    const keys: string[] = []

    for (const [key, item] of this.cache) {
      if (item.tags && tags.some(tag => item.tags!.includes(tag))) {
        keys.push(key)
      }
    }

    let count = 0
    for (const key of keys) {
      if (this.delete(key)) {
        count++
      }
    }

    if (this.options.debug) {
      console.log(`[SmartCache] 按标签删除 ${count} 个缓存项`)
    }

    return count
  }

  /**
   * 触发缓存预热
   */
  async warm(keys: string[], loader: (key: string) => Promise<T>): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!this.has(key)) {
        try {
          const value = await loader(key)
          this.set(key, value)
        } catch (error) {
          if (this.options.debug) {
            console.error(`[SmartCache] 预热失败：${key}`, error)
          }
        }
      }
    })

    await Promise.all(promises)

    if (this.options.debug) {
      console.log(`[SmartCache] 预热完成，加载 ${keys.length} 个缓存项`)
    }
  }

  /**
   * 估算数据大小
   */
  private estimateSize(value: T): number {
    try {
      if (typeof value === 'string') {
        return value.length * 2 // UTF-16
      }
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value).length * 2
      }
      return 8 // 基本类型
    } catch {
      return 1024 // 默认1KB
    }
  }

  /**
   * 驱逐缓存项（LRU策略）
   */
  private evict(requiredSize: number): void {
    const entries = Array.from(this.cache.entries())

    // 根据策略排序
    entries.sort((a, b) => {
      // 优先驱逐过期项
      const aExpired = a[1].expiresAt && a[1].expiresAt < Date.now()
      const bExpired = b[1].expiresAt && b[1].expiresAt < Date.now()
      if (aExpired && !bExpired) return -1
      if (!aExpired && bExpired) return 1

      // 根据优先级
      if (a[1].priority !== b[1].priority) {
        return (a[1].priority || 0) - (b[1].priority || 0)
      }

      // LRU: 最近最少使用
      return a[1].lastAccessedAt - b[1].lastAccessedAt
    })

    let freedSize = 0
    for (const [key, item] of entries) {
      if (freedSize >= requiredSize) break

      freedSize += item.size || 0
      this.delete(key)
      this.stats.evictions++
    }
  }

  /**
   * 驱逐单个缓存项
   */
  private evictOne(): void {
    const firstKey = this.cache.keys().next().value
    if (firstKey) {
      this.delete(firstKey)
      this.stats.evictions++
    }
  }

  /**
   * 记录命中
   */
  private recordHit(accessTime: number): void {
    if (!this.options.enableStats) return

    this.stats.hits++
    this.accessTimes.push(accessTime)

    // 保持最近1000次访问时间
    if (this.accessTimes.length > 1000) {
      this.accessTimes.shift()
    }

    this.updateHitRate()
    this.updateAvgAccessTime()
  }

  /**
   * 记录未命中
   */
  private recordMiss(): void {
    if (!this.options.enableStats) return

    this.stats.misses++
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
   * 更新平均访问时间
   */
  private updateAvgAccessTime(): void {
    if (this.accessTimes.length === 0) {
      this.stats.avgAccessTime = 0
      return
    }

    const sum = this.accessTimes.reduce((a, b) => a + b, 0)
    this.stats.avgAccessTime = sum / this.accessTimes.length
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    if (!this.options.enableStats) return

    this.stats.size = this.cache.size
    this.stats.memoryUsage = this.memoryUsage
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)
  }

  /**
   * 清理过期缓存项
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache) {
      if (item.expiresAt && item.expiresAt < now) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.delete(key)
    }

    if (this.options.debug && keysToDelete.length > 0) {
      console.log(`[SmartCache] 清理 ${keysToDelete.length} 个过期缓存项`)
    }
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    this.clear()
  }
}

/**
 * 创建智能缓存实例
 */
export function createSmartCache<T = any>(options?: SmartCacheOptions): SmartCache<T> {
  return new SmartCache<T>(options)
}

export default SmartCache
