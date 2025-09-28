/**
 * 统一缓存系统
 *
 * 提供多种缓存策略、内存压缩、持久化等高级功能
 * 包含组件缓存、元数据缓存等专用缓存管理器
 */

import { ref, type Ref, type Component } from 'vue'
import type { StrictCacheStats } from '../types/strict-types'
import type { TemplateMetadata } from '../types/template'

/**
 * 缓存策略类型
 */
export type AdvancedCacheStrategy = 'LRU' | 'LFU' | 'FIFO' | 'TTL' | 'HYBRID'

/**
 * 缓存项元数据
 */
export interface CacheItemMeta {
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessedAt: number
  /** 访问次数 */
  accessCount: number
  /** 大小（字节） */
  size: number
  /** 过期时间 */
  expiresAt?: number
  /** 优先级 */
  priority?: number
  /** 是否压缩 */
  compressed?: boolean
  /** 标签 */
  tags?: string[]
}

/**
 * 缓存项
 */
export interface CacheItem<T = any> {
  key: string
  value: T
  meta: CacheItemMeta
}

/**
 * 缓存配置
 */
export interface AdvancedCacheConfig {
  /** 缓存策略 */
  strategy?: AdvancedCacheStrategy
  /** 最大缓存大小（字节） */
  maxSize?: number
  /** 最大缓存项数量 */
  maxItems?: number
  /** 默认TTL（毫秒） */
  defaultTTL?: number
  /** 是否启用压缩 */
  enableCompression?: boolean
  /** 压缩阈值（字节） */
  compressionThreshold?: number
  /** 是否启用持久化 */
  enablePersistence?: boolean
  /** 持久化键名 */
  persistenceKey?: string
  /** 是否启用统计 */
  enableStats?: boolean
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
  /** 是否启用内存警告 */
  enableMemoryWarning?: boolean
  /** 内存警告阈值（百分比） */
  memoryWarningThreshold?: number
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  /** 总请求数 */
  requests: number
  /** 命中数 */
  hits: number
  /** 未命中数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 当前大小（字节） */
  currentSize: number
  /** 当前项数 */
  currentItems: number
  /** 最大大小 */
  maxSize: number
  /** 最大项数 */
  maxItems: number
  /** 平均访问时间（毫秒） */
  avgAccessTime: number
  /** 驱逐次数 */
  evictions: number
  /** 压缩节省的空间 */
  compressionSavings: number
}

/**
 * 高级缓存类
 */
export class AdvancedCache<T = any> {
  private cache: Map<string, CacheItem<T>>
  private config: Required<AdvancedCacheConfig>
  private stats: CacheStats
  private cleanupTimer?: any
  private accessQueue: string[] = []
  private frequencyMap: Map<string, number> = new Map()

  constructor(config: AdvancedCacheConfig = {}) {
    this.cache = new Map()
    this.config = {
      strategy: config.strategy || 'LRU',
      maxSize: config.maxSize || 100 * 1024 * 1024, // 100MB
      maxItems: config.maxItems || 1000,
      defaultTTL: config.defaultTTL || 0,
      enableCompression: config.enableCompression || true,
      compressionThreshold: config.compressionThreshold || 1024, // 1KB
      enablePersistence: config.enablePersistence || false,
      persistenceKey: config.persistenceKey || 'advanced-cache',
      enableStats: config.enableStats || true,
      cleanupInterval: config.cleanupInterval || 60000, // 1 minute
      enableMemoryWarning: config.enableMemoryWarning || true,
      memoryWarningThreshold: config.memoryWarningThreshold || 0.9
    }

    this.stats = this.initStats()

    // 启动清理定时器
    if (this.config.cleanupInterval > 0) {
      this.startCleanupTimer()
    }

    // 从持久化存储恢复
    if (this.config.enablePersistence) {
      this.restore()
    }

    // 设置内存监控
    this.setupMemoryMonitoring()
  }

  /**
   * 设置内存监控
   */
  private setupMemoryMonitoring(): void {
    if (typeof window === 'undefined' || !('performance' in window) || !('memory' in window.performance)) {
      return
    }

    // 定期检查内存使用情况
    setInterval(() => {
      this.checkMemoryUsage()
    }, 30000) // 每30秒检查一次
  }

  /**
   * 检查内存使用情况
   */
  private checkMemoryUsage(): void {
    if (typeof window === 'undefined' || !window.performance?.memory) {
      return
    }

    // @ts-ignore
    const memory = window.performance.memory
    const usedRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit

    if (usedRatio > this.config.memoryWarningThreshold) {
      // 内存使用率过高，主动清理缓存
      this.aggressiveCleanup()

      if (this.config.enableStats && import.meta.env?.DEV) {
        console.warn(`[Cache] High memory usage detected (${Math.round(usedRatio * 100)}%), performing aggressive cleanup`)
      }
    }
  }

  /**
   * 激进清理策略
   */
  private aggressiveCleanup(): void {
    const targetSize = Math.floor(this.stats.currentSize * 0.5) // 清理到50%
    let cleanedSize = 0

    // 优先清理过期项
    this.cleanupExpired()

    // 按访问频率清理
    const sortedItems = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.meta.accessCount - b.meta.accessCount)

    for (const [key, item] of sortedItems) {
      if (cleanedSize >= targetSize) break

      cleanedSize += item.meta.size
      this.cache.delete(key)
      this.stats.currentSize -= item.meta.size
      this.stats.currentItems--
      this.stats.evictions++
    }
  }

  /**
   * 初始化统计信息
   */
  private initStats(): CacheStats {
    return {
      requests: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      currentSize: 0,
      currentItems: 0,
      maxSize: this.config.maxSize,
      maxItems: this.config.maxItems,
      avgAccessTime: 0,
      evictions: 0,
      compressionSavings: 0
    }
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    const startTime = performance.now()

    if (this.config.enableStats) {
      this.stats.requests++
    }

    const item = this.cache.get(key)

    if (!item) {
      if (this.config.enableStats) {
        this.stats.misses++
        this.updateHitRate()
      }
      return undefined
    }

    // 检查是否过期
    if (item.meta.expiresAt && item.meta.expiresAt < Date.now()) {
      this.delete(key)
      if (this.config.enableStats) {
        this.stats.misses++
        this.updateHitRate()
      }
      return undefined
    }

    // 更新访问信息
    item.meta.lastAccessedAt = Date.now()
    item.meta.accessCount++

    // 更新策略相关信息
    this.updateStrategyInfo(key)

    if (this.config.enableStats) {
      this.stats.hits++
      this.updateHitRate()
      this.updateAvgAccessTime(performance.now() - startTime)
    }

    // 解压缩数据
    let value = item.value
    if (item.meta.compressed) {
      value = this.decompress(value)
    }

    return value
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, options: {
    ttl?: number
    priority?: number
    tags?: string[]
    compress?: boolean
  } = {}): boolean {
    const size = this.calculateSize(value)

    // 检查单项大小限制
    if (size > this.config.maxSize) {
      console.warn(`Cache item ${key} exceeds max size limit`)
      return false
    }

    // 驱逐策略
    while (this.needsEviction(size)) {
      this.evict()
    }

    // 压缩数据
    let storedValue = value
    let compressed = false
    if (this.shouldCompress(size, options.compress)) {
      storedValue = this.compress(value)
      compressed = true
      const compressedSize = this.calculateSize(storedValue)
      if (this.config.enableStats) {
        this.stats.compressionSavings += size - compressedSize
      }
    }

    // 创建缓存项
    const item: CacheItem<T> = {
      key,
      value: storedValue,
      meta: {
        createdAt: Date.now(),
        lastAccessedAt: Date.now(),
        accessCount: 0,
        size: compressed ? this.calculateSize(storedValue) : size,
        expiresAt: options.ttl ? Date.now() + options.ttl :
          this.config.defaultTTL ? Date.now() + this.config.defaultTTL : undefined,
        priority: options.priority,
        compressed,
        tags: options.tags
      }
    }

    // 更新现有项或添加新项
    const existingItem = this.cache.get(key)
    if (existingItem) {
      this.stats.currentSize -= existingItem.meta.size
    }

    this.cache.set(key, item)
    this.stats.currentSize += item.meta.size
    this.stats.currentItems = this.cache.size

    // 更新策略信息
    this.updateStrategyInfo(key)

    // 持久化
    if (this.config.enablePersistence) {
      this.persist()
    }

    // 内存警告
    if (this.config.enableMemoryWarning) {
      this.checkMemoryUsage()
    }

    return true
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    this.stats.currentSize -= item.meta.size
    this.cache.delete(key)
    this.stats.currentItems = this.cache.size

    // 从策略相关数据结构中删除
    this.removeFromStrategyInfo(key)

    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessQueue = []
    this.frequencyMap.clear()
    this.stats.currentSize = 0
    this.stats.currentItems = 0

    if (this.config.enablePersistence) {
      localStorage.removeItem(this.config.persistenceKey)
    }
  }

  /**
   * 检查是否有缓存项
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    // 检查是否过期
    if (item.meta.expiresAt && item.meta.expiresAt < Date.now()) {
      this.delete(key)
      return false
    }

    return true
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
  get size(): number {
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
    this.stats = this.initStats()
  }

  /**
   * 根据标签获取缓存项
   */
  getByTags(tags: string[]): Array<{ key: string; value: T }> {
    const results: Array<{ key: string; value: T }> = []

    this.cache.forEach((item, key) => {
      if (item.meta.tags?.some(tag => tags.includes(tag))) {
        const value = this.get(key)
        if (value !== undefined) {
          results.push({ key, value })
        }
      }
    })

    return results
  }

  /**
   * 根据标签删除缓存项
   */
  deleteByTags(tags: string[]): number {
    const keysToDelete: string[] = []

    this.cache.forEach((item, key) => {
      if (item.meta.tags?.some(tag => tags.includes(tag))) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.delete(key))
    return keysToDelete.length
  }

  /**
   * 预热缓存
   */
  async warmup(loader: (key: string) => Promise<T>, keys: string[]): Promise<void> {
    const promises = keys.map(async key => {
      try {
        const value = await loader(key)
        this.set(key, value)
      } catch (error) {
        console.error(`Failed to warmup cache for key ${key}:`, error)
      }
    })

    await Promise.all(promises)
  }

  /**
   * 批量获取
   */
  mget(keys: string[]): Map<string, T | undefined> {
    const results = new Map<string, T | undefined>()

    keys.forEach(key => {
      results.set(key, this.get(key))
    })

    return results
  }

  /**
   * 批量设置
   */
  mset(entries: Array<[string, T, any?]>): Map<string, boolean> {
    const results = new Map<string, boolean>()

    entries.forEach(([key, value, options]) => {
      results.set(key, this.set(key, value, options))
    })

    return results
  }

  /**
   * 计算对象大小（粗略估算）
   */
  private calculateSize(obj: any): number {
    if (obj === null || obj === undefined) return 0

    switch (typeof obj) {
      case 'boolean': return 4
      case 'number': return 8
      case 'string': return obj.length * 2
      case 'object':
        if (obj instanceof ArrayBuffer) return obj.byteLength
        if (obj instanceof Blob) return obj.size

        // 粗略估算对象大小
        let size = 0
        try {
          const json = JSON.stringify(obj)
          size = json.length * 2
        } catch {
          size = 1024 // 默认1KB
        }
        return size
      default:
        return 0
    }
  }

  /**
   * 检查是否需要驱逐
   */
  private needsEviction(newItemSize: number): boolean {
    return (
      this.stats.currentSize + newItemSize > this.config.maxSize ||
      this.cache.size >= this.config.maxItems
    )
  }

  /**
   * 驱逐缓存项
   */
  private evict(): void {
    let keyToEvict: string | undefined

    switch (this.config.strategy) {
      case 'LRU':
        keyToEvict = this.evictLRU()
        break
      case 'LFU':
        keyToEvict = this.evictLFU()
        break
      case 'FIFO':
        keyToEvict = this.evictFIFO()
        break
      case 'TTL':
        keyToEvict = this.evictTTL()
        break
      case 'HYBRID':
        keyToEvict = this.evictHybrid()
        break
      default:
        keyToEvict = this.evictLRU()
    }

    if (keyToEvict) {
      this.delete(keyToEvict)
      if (this.config.enableStats) {
        this.stats.evictions++
      }
    }
  }

  /**
   * LRU驱逐策略
   */
  private evictLRU(): string | undefined {
    let oldestKey: string | undefined
    let oldestTime = Infinity

    this.cache.forEach((item, key) => {
      if (item.meta.lastAccessedAt < oldestTime) {
        oldestTime = item.meta.lastAccessedAt
        oldestKey = key
      }
    })

    return oldestKey
  }

  /**
   * LFU驱逐策略
   */
  private evictLFU(): string | undefined {
    let leastFreqKey: string | undefined
    let leastFreq = Infinity

    this.cache.forEach((item, key) => {
      const freq = this.frequencyMap.get(key) || 0
      if (freq < leastFreq) {
        leastFreq = freq
        leastFreqKey = key
      }
    })

    return leastFreqKey
  }

  /**
   * FIFO驱逐策略
   */
  private evictFIFO(): string | undefined {
    let oldestKey: string | undefined
    let oldestTime = Infinity

    this.cache.forEach((item, key) => {
      if (item.meta.createdAt < oldestTime) {
        oldestTime = item.meta.createdAt
        oldestKey = key
      }
    })

    return oldestKey
  }

  /**
   * TTL驱逐策略
   */
  private evictTTL(): string | undefined {
    let nearestExpiryKey: string | undefined
    let nearestExpiry = Infinity

    this.cache.forEach((item, key) => {
      if (item.meta.expiresAt && item.meta.expiresAt < nearestExpiry) {
        nearestExpiry = item.meta.expiresAt
        nearestExpiryKey = key
      }
    })

    return nearestExpiryKey || this.evictLRU()
  }

  /**
   * 混合驱逐策略
   */
  private evictHybrid(): string | undefined {
    // 结合LRU和LFU，根据访问频率和最后访问时间综合评分
    let lowestScoreKey: string | undefined
    let lowestScore = Infinity

    this.cache.forEach((item, key) => {
      const freq = this.frequencyMap.get(key) || 0
      const age = Date.now() - item.meta.lastAccessedAt
      const priority = item.meta.priority || 0

      // 评分公式：频率 * 优先级 / 年龄
      const score = (freq + 1) * (priority + 1) / (age + 1)

      if (score < lowestScore) {
        lowestScore = score
        lowestScoreKey = key
      }
    })

    return lowestScoreKey
  }

  /**
   * 更新策略信息
   */
  private updateStrategyInfo(key: string): void {
    // 更新访问队列（LRU）
    const index = this.accessQueue.indexOf(key)
    if (index > -1) {
      this.accessQueue.splice(index, 1)
    }
    this.accessQueue.push(key)

    // 更新频率映射（LFU）
    this.frequencyMap.set(key, (this.frequencyMap.get(key) || 0) + 1)
  }

  /**
   * 从策略信息中移除
   */
  private removeFromStrategyInfo(key: string): void {
    const index = this.accessQueue.indexOf(key)
    if (index > -1) {
      this.accessQueue.splice(index, 1)
    }
    this.frequencyMap.delete(key)
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    if (this.stats.requests > 0) {
      this.stats.hitRate = this.stats.hits / this.stats.requests
    }
  }

  /**
   * 更新平均访问时间
   */
  private updateAvgAccessTime(time: number): void {
    const alpha = 0.1 // 指数移动平均系数
    this.stats.avgAccessTime = (1 - alpha) * this.stats.avgAccessTime + alpha * time
  }

  /**
   * 检查是否应该压缩
   */
  private shouldCompress(size: number, forceCompress?: boolean): boolean {
    if (!this.config.enableCompression) return false
    if (forceCompress !== undefined) return forceCompress
    return size >= this.config.compressionThreshold
  }

  /**
   * 压缩数据（简单示例，实际应使用压缩库）
   */
  private compress(data: any): any {
    // 这里使用简单的JSON字符串化作为示例
    // 实际应用中应使用如lz-string等压缩库
    try {
      return JSON.stringify(data)
    } catch {
      return data
    }
  }

  /**
   * 解压缩数据
   */
  private decompress(data: any): any {
    // 对应的解压缩逻辑
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval) as unknown as NodeJS.Timeout
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((item, key) => {
      if (item.meta.expiresAt && item.meta.expiresAt < now) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.delete(key))
  }

  /**
   * 持久化到localStorage
   */
  private persist(): void {
    if (!this.config.enablePersistence) return

    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        stats: this.stats,
        accessQueue: this.accessQueue,
        frequencyMap: Array.from(this.frequencyMap.entries())
      }
      localStorage.setItem(this.config.persistenceKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to persist cache:', error)
    }
  }

  /**
   * 从localStorage恢复
   */
  private restore(): void {
    if (!this.config.enablePersistence) return

    try {
      const stored = localStorage.getItem(this.config.persistenceKey)
      if (!stored) return

      const data = JSON.parse(stored)
      this.cache = new Map(data.cache)
      this.stats = data.stats
      this.accessQueue = data.accessQueue
      this.frequencyMap = new Map(data.frequencyMap)

      // 清理过期项
      this.cleanup()
    } catch (error) {
      console.error('Failed to restore cache:', error)
    }
  }



  /**
   * 销毁缓存
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer as unknown as number)
    }
    this.clear()
  }
}

/**
 * 组件缓存管理器
 * 专门用于缓存Vue组件
 */
export class ComponentCache extends AdvancedCache<Component> {
  constructor() {
    super({
      strategy: 'LRU',
      maxSize: 50 * 1024 * 1024, // 50MB
      maxItems: 50,
      defaultTTL: 60 * 60 * 1000, // 1小时
      enableCompression: true,
      enableStats: true,
    })
  }

  /**
   * 生成组件缓存键
   */
  private generateKey(category: string, device: string, templateName: string): string {
    return `${category}:${device}:${templateName}`
  }

  /**
   * 缓存组件
   */
  cacheComponent(
    category: string,
    device: string,
    templateName: string,
    component: Component,
  ): void {
    const key = this.generateKey(category, device, templateName)
    this.set(key, component)
  }

  /**
   * 获取缓存的组件
   */
  getComponent(
    category: string,
    device: string,
    templateName: string,
  ): Component | undefined {
    const key = this.generateKey(category, device, templateName)
    return this.get(key)
  }

  /**
   * 检查组件是否已缓存
   */
  hasComponent(category: string, device: string, templateName: string): boolean {
    const key = this.generateKey(category, device, templateName)
    return this.has(key)
  }

  /**
   * 删除组件缓存
   */
  removeComponent(category: string, device: string, templateName: string): boolean {
    const key = this.generateKey(category, device, templateName)
    return this.delete(key)
  }
}

/**
 * 模板元数据缓存管理器
 * 专门用于缓存模板元数据
 */
export class MetadataCache extends AdvancedCache<TemplateMetadata> {
  constructor() {
    super({
      strategy: 'LRU',
      maxSize: 10 * 1024 * 1024, // 10MB
      maxItems: 200,
      defaultTTL: 10 * 60 * 1000, // 10分钟
      enableCompression: false, // 元数据通常较小，不需要压缩
      enableStats: true,
    })
  }
}

/**
 * 全局缓存实例
 */
export const componentCache = new ComponentCache()
export const metadataCache = new MetadataCache()

/**
 * 创建模板缓存
 *
 * @param options 缓存配置选项
 * @returns 缓存管理器实例
 */
export function createTemplateCache(options: AdvancedCacheConfig = {}) {
  return new AdvancedCache(options)
}

/**
 * 清空模板缓存
 */
export function clearTemplateCache(): void {
  componentCache.clear()
  metadataCache.clear()
}

/**
 * 缓存工具函数
 */
export const cacheUtils = {
  /**
   * 清空所有缓存
   */
  clearAll(): void {
    componentCache.clear()
    metadataCache.clear()
  },

  /**
   * 获取所有缓存统计信息
   */
  getAllStats(): { component: CacheStats, metadata: CacheStats } {
    return {
      component: componentCache.getStats(),
      metadata: metadataCache.getStats(),
    }
  },

  /**
   * 清理所有过期缓存
   */
  cleanupAll(): { component: number, metadata: number } {
    const componentKeys = componentCache.keys()
    const metadataKeys = metadataCache.keys()

    // 手动清理过期项（AdvancedCache会自动清理，这里只是统计）
    let componentCleaned = 0
    let metadataCleaned = 0

    componentKeys.forEach(key => {
      if (!componentCache.has(key)) componentCleaned++
    })

    metadataKeys.forEach(key => {
      if (!metadataCache.has(key)) metadataCleaned++
    })

    return {
      component: componentCleaned,
      metadata: metadataCleaned,
    }
  },
}

/**
 * 创建响应式缓存
 */
export function useAdvancedCache<T = any>(config?: AdvancedCacheConfig) {
  const cache = new AdvancedCache<T>(config)
  const stats = ref(cache.getStats())

  // 定期更新统计信息
  const statsUpdateInterval = setInterval(() => {
    stats.value = cache.getStats()
  }, 1000)

  // 清理函数
  const cleanup = () => {
    clearInterval(statsUpdateInterval)
    cache.destroy()
  }

  return {
    cache,
    stats,
    cleanup
  }
}

// 为了兼容性，导出一些别名
export { AdvancedCache as CacheManager }
export { AdvancedCache as LRUCache }
