/**
 * 缓存管理器
 * 提供内存、localStorage、sessionStorage 等多种缓存策略
 */

import type { CacheConfig, CacheItem, CacheStats } from '../types'
import { LRUCache } from './LRUCache'

/**
 * 缓存存储接口
 */
interface CacheStorage {
  get: (key: string) => string | null
  set: (key: string, value: string) => void
  remove: (key: string) => void
  clear: () => void
  keys: () => string[]
}

/**
 * 内存缓存存储
 */
class MemoryCacheStorage implements CacheStorage {
  private storage = new Map<string, string>()

  get(key: string): string | null {
    return this.storage.get(key) || null
  }

  set(key: string, value: string): void {
    this.storage.set(key, value)
  }

  remove(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }

  keys(): string[] {
    return Array.from(this.storage.keys())
  }
}

/**
 * 通用Web存储缓存（localStorage/sessionStorage）
 * 消除重复代码，统一处理
 */
class WebStorageCacheStorage implements CacheStorage {
  constructor(
    private storage: Storage,
    private prefix: string = 'ldesign_api_cache_',
  ) {}

  get(key: string): string | null {
    try {
      return this.storage.getItem(this.prefix + key)
    }
    catch {
      return null
    }
  }

  set(key: string, value: string): void {
    try {
      this.storage.setItem(this.prefix + key, value)
    }
    catch {
      // 忽略存储错误
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(this.prefix + key)
    }
    catch {
      // 忽略删除错误
    }
  }

  clear(): void {
    try {
      const keys = this.keys()
      keys.forEach(key => this.remove(key))
    }
    catch {
      // 忽略清除错误
    }
  }

  keys(): string[] {
    try {
      const keys: string[] = []
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length))
        }
      }
      return keys
    }
    catch {
      return []
    }
  }
}

/**
 * 缓存管理器实现
 */
export class CacheManager {
  private storage: CacheStorage
  private lruCache?: LRUCache<unknown>
  private config: Required<CacheConfig>
  private stats = {
    hits: 0,
    misses: 0,
    totalItems: 0,
    size: 0,
  }

  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(config: CacheConfig) {
    this.config = {
      enabled: true,
      ttl: 300000, // 5分钟
      maxSize: 100,
      storage: 'memory',
      keyGenerator: (methodName: string, params?: unknown) =>
        `${methodName}:${JSON.stringify(params || {})}`,
      prefix: 'ldesign_api_cache_',
      ...config,
    }

    // 创建存储实例
    const prefix = this.config?.prefix || 'ldesign_api_cache_'
    switch (this.config?.storage) {
      case 'localStorage':
        this.storage = new WebStorageCacheStorage(localStorage, prefix)
        break
      case 'sessionStorage':
        this.storage = new WebStorageCacheStorage(sessionStorage, prefix)
        break
      case 'lru':
        // 使用高性能LRU缓存
        this.lruCache = new LRUCache({
          maxSize: this.config?.maxSize,
          defaultTTL: this.config?.ttl,
          enabled: this.config?.enabled,
        })
        this.storage = new MemoryCacheStorage() // 备用存储
        break
      default:
        this.storage = new MemoryCacheStorage()
    }

    // 定期清理过期缓存
    this.startCleanupTimer()
  }

  /**
   * 获取缓存数据
   */
  get<T = unknown>(key: string): T | null {
    if (!this.config?.enabled) {
      return null
    }

    // 优先使用LRU缓存
    if (this.lruCache) {
      const result = this.lruCache.get(key) as T | null
      if (result !== null) {
        this.stats.hits++
        return result
      }
      else {
        this.stats.misses++
        return null
      }
    }

    // 回退到传统缓存
    try {
      const itemStr = this.storage.get(key)
      if (!itemStr) {
        this.stats.misses++
        return null
      }

      const item: CacheItem = JSON.parse(itemStr)

      // 检查是否过期
      if (Date.now() > item.expireTime) {
        this.storage.remove(key)
        this.stats.misses++
        this.updateStats()
        return null
      }

      // 更新访问信息
      item.accessCount++
      item.lastAccessTime = Date.now()
      this.storage.set(key, JSON.stringify(item))

      this.stats.hits++
      return item.data
    }
    catch {
      this.stats.misses++
      return null
    }
  }

  /**
   * 设置缓存数据
   */
  set<T = unknown>(key: string, data: T, ttl?: number): void {
    if (!this.config?.enabled) {
      return
    }

    // 优先使用LRU缓存
    if (this.lruCache) {
      this.lruCache.set(key, data, ttl)
      return
    }

    // 回退到传统缓存
    try {
      const now = Date.now()
      const item: CacheItem = {
        data,
        timestamp: now,
        expireTime: now + (ttl || this.config?.ttl),
        accessCount: 1,
        lastAccessTime: now,
      }

      // 检查缓存大小限制
      this.ensureCacheSize()

      this.storage.set(key, JSON.stringify(item))
      this.updateStats()
    }
    catch {
      // 忽略设置错误
    }
  }

  /**
   * 删除缓存数据
   */
  remove(key: string): void {
    this.storage.remove(key)
    this.updateStats()
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.storage.clear()
    this.stats.hits = 0
    this.stats.misses = 0
    this.stats.totalItems = 0
    this.stats.size = 0
  }

  /**
   * 根据模式清除缓存
   */
  clearByPattern(pattern: RegExp): void {
    const keys = this.storage.keys()
    keys.forEach((key) => {
      if (pattern.test(key)) {
        this.storage.remove(key)
      }
    })
    this.updateStats()
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    this.updateStats()
    return {
      ...this.stats,
      hitRate:
        this.stats.hits + this.stats.misses > 0
          ? this.stats.hits / (this.stats.hits + this.stats.misses)
          : 0,
    }
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return this.storage.keys()
  }

  /**
   * 确保缓存大小不超过限制
   */
  private ensureCacheSize(): void {
    const keys = this.storage.keys()
    if (keys.length >= this.config?.maxSize) {
      // 使用 LRU 策略删除最少使用的缓存
      const items: Array<{ key: string, item: CacheItem }> = []

      keys.forEach((key) => {
        try {
          const itemStr = this.storage.get(key)
          if (itemStr) {
            const item: CacheItem = JSON.parse(itemStr)
            items.push({ key, item })
          }
        }
        catch {
          // 忽略解析错误的项
        }
      })

      // 按最后访问时间排序，删除最旧的项
      items.sort((a, b) => a.item.lastAccessTime - b.item.lastAccessTime)
      const toRemove = items.slice(0, Math.floor(this.config?.maxSize * 0.1)) // 删除 10%
      toRemove.forEach(({ key }) => this.storage.remove(key))
    }
  }

  /**
   * 更新统计信息（优化版：增量更新，避免频繁全量计算）
   */
  private lastStatsUpdate = 0
  private readonly statsUpdateInterval = 10000 // 10秒更新一次统计
  
  private updateStats(): void {
    const now = Date.now()
    
    // 节流统计更新，避免频繁计算
    if (now - this.lastStatsUpdate < this.statsUpdateInterval) {
      return
    }
    
    this.lastStatsUpdate = now
    const keys = this.storage.keys()
    this.stats.totalItems = keys.length

    // 计算缓存大小（采样估算）
    let totalSize = 0
    if (keys.length > 100) {
      // 大缓存时采样估算
      const sampleSize = 20
      const step = Math.floor(keys.length / sampleSize)
      for (let i = 0; i < keys.length; i += step) {
        const itemStr = this.storage.get(keys[i])
        if (itemStr) {
          totalSize += itemStr.length * 2 * step // 估算字符串大小（UTF-16）
        }
      }
    } else {
      // 小缓存时全量计算
      keys.forEach((key) => {
        const itemStr = this.storage.get(key)
        if (itemStr) {
          totalSize += itemStr.length * 2 // 估算字符串大小（UTF-16）
        }
      })
    }
    this.stats.size = totalSize
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    // 每5分钟清理一次过期缓存
    this.cleanupTimer = globalThis.setInterval(
      () => {
        this.cleanupExpiredItems()
      },
      5 * 60 * 1000,
    )
  }

  /**
   * 清理过期缓存项（优化版：批量处理，减少重复调用）
   */
  private cleanupExpiredItems(): void {
    const now = Date.now()
    const keys = this.storage.keys()
    let cleanedCount = 0

    for (const key of keys) {
      try {
        const itemStr = this.storage.get(key)
        if (itemStr) {
          const item: CacheItem = JSON.parse(itemStr)
          if (now > item.expireTime) {
            this.storage.remove(key)
            cleanedCount++
          }
        }
      }
      catch {
        // 删除无法解析的项
        this.storage.remove(key)
        cleanedCount++
      }
    }

    // 只在清理了项时才更新统计
    if (cleanedCount > 0) {
      this.updateStats()
    }
  }

  /**
   * 批量设置缓存
   */
  setMany<T = unknown>(entries: Array<{ key: string, data: T, ttl?: number }>): void {
    if (this.lruCache) {
      this.lruCache.setMany(entries.map(e => ({ key: e.key, value: e.data, ttl: e.ttl })))
      return
    }

    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl)
    })
  }

  /**
   * 批量获取缓存
   */
  getMany<T = unknown>(keys: string[]): Map<string, T> {
    if (this.lruCache) {
      return this.lruCache.getMany(keys) as Map<string, T>
    }

    const result = new Map<string, T>()
    keys.forEach((key) => {
      const value = this.get<T>(key)
      if (value !== null) {
        result.set(key, value)
      }
    })
    return result
  }

  /**
   * 预热缓存
   */
  warmup<T = unknown>(entries: Array<{ key: string, data: T, ttl?: number }>): void {
    if (this.lruCache) {
      this.lruCache.warmup(entries.map(e => ({ key: e.key, value: e.data, ttl: e.ttl })))
      return
    }

    entries.forEach(({ key, data, ttl }) => {
      if (!this.has(key)) {
        this.set(key, data, ttl)
      }
    })
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    if (this.lruCache) {
      return this.lruCache.has(key)
    }

    try {
      const itemStr = this.storage.get(key)
      if (!itemStr) {
        return false
      }

      const item: CacheItem = JSON.parse(itemStr)
      return Date.now() <= item.expireTime
    }
    catch {
      return false
    }
  }

  /**
   * 获取增强的缓存统计信息
   */
  getEnhancedStats(): CacheStats & { lruStats?: any } {
    const baseStats = this.getStats()

    if (this.lruCache) {
      return {
        ...baseStats,
        lruStats: this.lruCache.getStats(),
      }
    }

    return baseStats
  }

  /**
   * 销毁缓存管理器，清理定时器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    if (this.lruCache) {
      this.lruCache.destroy()
    }

    this.clear()
  }
}
