/**
 * 统一缓存系统
 * 
 * 整合所有缓存相关功能，消除重复代码
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import { TimeUtils } from '../utils/common'
import { FastCacheKeyGenerator } from './fast-cache-key'

/**
 * 缓存项接口
 */
export interface CacheEntry<T = any> {
  value: T
  timestamp: number
  ttl?: number
  accessCount: number
  lastAccessed: number
  size?: number
  priority?: number
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  maxSize?: number
  maxMemory?: number
  ttl?: number
  strategy?: 'lru' | 'lfu' | 'fifo' | 'hybrid'
  enableStats?: boolean
  enableCompression?: boolean
  autoCleanup?: boolean
  cleanupInterval?: number
  compressionThreshold?: number
}

/**
 * 缓存统计接口
 */
export interface CacheStatistics {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
  size: number
  memoryUsage: number
  evictions: number
  avgAccessTime?: number
}

/**
 * 缓存事件类型
 */
export type CacheEventType = 'hit' | 'miss' | 'evict' | 'expire' | 'clear' | 'memory-pressure'

/**
 * 缓存事件监听器
 */
export type CacheEventListener = (event: {
  type: CacheEventType
  key?: string
  value?: any
  stats?: CacheStatistics
}) => void

/**
 * 统一缓存基类
 * 
 * 提供所有缓存操作的基础实现，避免重复代码
 */
export abstract class UnifiedCache<T = any> {
  protected cache = new Map<string, CacheEntry<T>>()
  protected config: Required<CacheConfig>
  protected stats: CacheStatistics
  protected cleanupTimer?: NodeJS.Timeout
  protected lastCleanup = 0
  protected eventListeners = new Map<CacheEventType, Set<CacheEventListener>>()

  // 使用弱引用池管理缓存项，减少GC压力
  private static entryPool = new WeakMap<any, CacheEntry<any>>()
  
  // 访问顺序追踪（LRU优化）
  protected accessOrder: string[] = []
  protected accessSet = new Set<string>()

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: 1000,
      maxMemory: 10 * 1024 * 1024, // 10MB
      ttl: 5 * 60 * 1000, // 5分钟
      strategy: 'hybrid',
      enableStats: true,
      enableCompression: false,
      autoCleanup: true,
      cleanupInterval: 60 * 1000, // 1分钟
      compressionThreshold: 1024, // 1KB
      ...config,
    }

    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      size: 0,
      memoryUsage: 0,
      evictions: 0,
    }

    if (this.config.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    if (this.config.enableStats) {
      this.stats.totalRequests++
    }

    const entry = this.cache.get(key)
    
    if (!entry) {
      this.handleMiss(key)
      return undefined
    }

    if (this.isExpired(entry)) {
      this.delete(key)
      this.handleMiss(key)
      return undefined
    }

    this.handleHit(key, entry)
    return entry.value
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, options?: Partial<CacheEntry<T>>): void {
    const now = TimeUtils.now()

    // 检查内存压力
    if (this.shouldEvict()) {
      this.evict()
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      ttl: options?.ttl ?? this.config.ttl,
      accessCount: 1,
      lastAccessed: now,
      size: this.calculateSize(value),
      priority: options?.priority ?? 1,
      ...options,
    }

    // 更新或新增
    const existing = this.cache.has(key)
    this.cache.set(key, entry)

    if (!existing) {
      this.updateAccessOrder(key, 'add')
      this.stats.size++
    }

    this.updateMemoryUsage()
  }

  /**
   * 批量设置
   */
  setMany(entries: Array<{ key: string; value: T; options?: Partial<CacheEntry<T>> }>): void {
    for (const { key, value, options } of entries) {
      this.set(key, value, options)
    }
  }

  /**
   * 批量获取
   */
  getMany(keys: string[]): Map<string, T> {
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
   * 删除缓存项
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const deleted = this.cache.delete(key)
    if (deleted) {
      this.updateAccessOrder(key, 'remove')
      this.stats.size--
      this.updateMemoryUsage()
      this.emitEvent('evict', { key, value: entry.value })
    }
    return deleted
  }

  /**
   * 清空缓存
   */
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    this.accessOrder = []
    this.accessSet.clear()
    this.resetStats()
    this.emitEvent('clear', { stats: this.getStats() })
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (this.isExpired(entry)) {
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
  size(): number {
    return this.cache.size
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStatistics {
    if (this.config.enableStats) {
      this.updateHitRate()
    }
    return { ...this.stats }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      size: this.cache.size,
      memoryUsage: 0,
      evictions: 0,
    }
  }

  /**
   * 添加事件监听器
   */
  on(event: CacheEventType, listener: CacheEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: CacheEventType, listener: CacheEventListener): void {
    this.eventListeners.get(event)?.delete(listener)
  }

  /**
   * 执行清理
   */
  cleanup(): number {
    const now = TimeUtils.now()
    const expired: string[] = []

    // 使用迭代器避免创建大数组
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        expired.push(key)
      }
    }

    for (const key of expired) {
      this.delete(key)
    }

    this.lastCleanup = now
    return expired.length
  }

  /**
   * 优化内存使用
   */
  optimize(): void {
    // 清理过期项
    this.cleanup()

    // 根据策略调整缓存大小
    if (this.stats.memoryUsage > this.config.maxMemory * 0.9) {
      const targetSize = Math.floor(this.cache.size * 0.7)
      while (this.cache.size > targetSize) {
        this.evict()
      }
    }

    // 压缩访问顺序数组
    if (this.accessOrder.length > this.config.maxSize * 2) {
      this.compactAccessOrder()
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
    this.eventListeners.clear()
  }

  /**
   * 检查是否过期
   */
  protected isExpired(entry: CacheEntry<T>): boolean {
    if (!entry.ttl || entry.ttl <= 0) return false
    return TimeUtils.now() - entry.timestamp > entry.ttl
  }

  /**
   * 计算大小
   */
  protected calculateSize(value: T): number {
    try {
      // 简单估算，可以被子类重写
      if (typeof value === 'string') {
        return value.length * 2
      }
      return JSON.stringify(value).length * 2
    } catch {
      return 100 // 默认值
    }
  }

  /**
   * 是否需要驱逐
   */
  protected shouldEvict(): boolean {
    return (
      this.cache.size >= this.config.maxSize ||
      this.stats.memoryUsage >= this.config.maxMemory
    )
  }

  /**
   * 驱逐缓存项
   */
  protected evict(): void {
    const key = this.selectEvictionCandidate()
    if (key) {
      this.delete(key)
      this.stats.evictions++
    }
  }

  /**
   * 选择驱逐候选
   */
  protected selectEvictionCandidate(): string | undefined {
    switch (this.config.strategy) {
      case 'lru':
        return this.selectLRU()
      case 'lfu':
        return this.selectLFU()
      case 'fifo':
        return this.selectFIFO()
      case 'hybrid':
      default:
        return this.selectHybrid()
    }
  }

  /**
   * LRU选择
   */
  protected selectLRU(): string | undefined {
    if (this.accessOrder.length > 0) {
      return this.accessOrder[0]
    }
    return this.cache.keys().next().value
  }

  /**
   * LFU选择
   */
  protected selectLFU(): string | undefined {
    let minCount = Infinity
    let candidate: string | undefined

    for (const [key, entry] of this.cache) {
      if (entry.accessCount < minCount) {
        minCount = entry.accessCount
        candidate = key
      }
    }

    return candidate
  }

  /**
   * FIFO选择
   */
  protected selectFIFO(): string | undefined {
    return this.cache.keys().next().value
  }

  /**
   * 混合策略选择
   */
  protected selectHybrid(): string | undefined {
    const now = TimeUtils.now()
    let minScore = Infinity
    let candidate: string | undefined

    for (const [key, entry] of this.cache) {
      const age = now - entry.lastAccessed
      const frequency = entry.accessCount
      const priority = entry.priority || 1
      
      // 综合评分：年龄越大、访问频率越低、优先级越低，分数越低
      const score = (age / 1000) * (1 / (frequency + 1)) * (1 / priority)
      
      if (score < minScore) {
        minScore = score
        candidate = key
      }
    }

    return candidate
  }

  /**
   * 更新访问顺序
   */
  protected updateAccessOrder(key: string, action: 'add' | 'remove' | 'access'): void {
    if (this.config.strategy !== 'lru' && this.config.strategy !== 'hybrid') {
      return
    }

    if (action === 'remove') {
      const index = this.accessOrder.indexOf(key)
      if (index > -1) {
        this.accessOrder.splice(index, 1)
      }
      this.accessSet.delete(key)
    } else {
      // 移除旧位置
      if (this.accessSet.has(key)) {
        const index = this.accessOrder.indexOf(key)
        if (index > -1) {
          this.accessOrder.splice(index, 1)
        }
      }
      // 添加到末尾
      this.accessOrder.push(key)
      this.accessSet.add(key)
    }
  }

  /**
   * 压缩访问顺序数组
   */
  protected compactAccessOrder(): void {
    // 只保留实际存在的键
    this.accessOrder = this.accessOrder.filter(key => this.cache.has(key))
    this.accessSet = new Set(this.accessOrder)
  }

  /**
   * 处理命中
   */
  protected handleHit(key: string, entry: CacheEntry<T>): void {
    entry.accessCount++
    entry.lastAccessed = TimeUtils.now()
    this.updateAccessOrder(key, 'access')
    
    if (this.config.enableStats) {
      this.stats.hits++
    }
    
    this.emitEvent('hit', { key, value: entry.value })
  }

  /**
   * 处理未命中
   */
  protected handleMiss(key: string): void {
    if (this.config.enableStats) {
      this.stats.misses++
    }
    this.emitEvent('miss', { key })
  }

  /**
   * 更新命中率
   */
  protected updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = this.stats.hits / this.stats.totalRequests
    }
  }

  /**
   * 更新内存使用
   */
  protected updateMemoryUsage(): void {
    let total = 0
    for (const entry of this.cache.values()) {
      total += entry.size || 0
    }
    this.stats.memoryUsage = total

    // 检查内存压力
    if (total > this.config.maxMemory * 0.9) {
      this.emitEvent('memory-pressure', { stats: this.getStats() })
    }
  }

  /**
   * 启动自动清理
   */
  protected startAutoCleanup(): void {
    if (this.cleanupTimer) return

    this.cleanupTimer = setInterval(() => {
      this.cleanup()
      this.optimize()
    }, this.config.cleanupInterval)
  }

  /**
   * 触发事件
   */
  protected emitEvent(type: CacheEventType, data?: any): void {
    const listeners = this.eventListeners.get(type)
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener({ type, ...data })
        } catch (error) {
          console.error(`Error in cache event listener: ${error}`)
        }
      }
    }
  }
}

/**
 * 翻译缓存（特化实现）
 */
export class TranslationCache extends UnifiedCache<string> {
  private static keyGenerator = new FastCacheKeyGenerator({ 
    compact: true, 
    sortParams: true 
  })

  /**
   * 缓存翻译
   */
  cacheTranslation(
    locale: string,
    key: string,
    params: Record<string, any> | undefined,
    result: string
  ): void {
    const cacheKey = TranslationCache.generateKey(locale, key, params)
    this.set(cacheKey, result)
  }

  /**
   * 获取缓存的翻译
   */
  getCachedTranslation(
    locale: string,
    key: string,
    params?: Record<string, any>
  ): string | undefined {
    const cacheKey = TranslationCache.generateKey(locale, key, params)
    return this.get(cacheKey)
  }

  /**
   * 清除特定语言的缓存
   */
  clearLocale(locale: string): void {
    const keysToDelete: string[] = []
    for (const key of this.keys()) {
      if (key.startsWith(`${locale}:`)) {
        keysToDelete.push(key)
      }
    }
    for (const key of keysToDelete) {
      this.delete(key)
    }
  }

  /**
   * 生成缓存键
   */
  static generateKey(
    locale: string,
    key: string,
    params?: Record<string, any>
  ): string {
    return this.keyGenerator.generateTranslationKey(locale, key, params)
  }

  /**
   * 预热缓存
   */
  warmUp(entries: Array<{
    locale: string
    key: string
    params?: Record<string, any>
    value: string
  }>): void {
    for (const entry of entries) {
      this.cacheTranslation(entry.locale, entry.key, entry.params, entry.value)
    }
  }
}

/**
 * 创建统一缓存实例
 */
export function createUnifiedCache<T = any>(config?: CacheConfig): UnifiedCache<T> {
  return new (class extends UnifiedCache<T> {})(config)
}

/**
 * 创建翻译缓存实例
 */
export function createTranslationCache(config?: CacheConfig): TranslationCache {
  return new TranslationCache({
    maxSize: 2000,
    ttl: 10 * 60 * 1000, // 10分钟
    strategy: 'hybrid',
    ...config,
  })
}