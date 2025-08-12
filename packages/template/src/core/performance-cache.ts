/**
 * 高性能模板缓存管理器
 *
 * 提供高效的模板缓存机制，支持：
 * - LRU 缓存策略
 * - 预加载和懒加载
 * - 内存管理
 * - 缓存统计
 * - 性能监控
 */

export interface CacheEntry<T = any> {
  /** 缓存的值 */
  value: T
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessedAt: number
  /** 访问次数 */
  accessCount: number
  /** 缓存大小（字节） */
  size: number
  /** 是否为预加载 */
  preloaded?: boolean
  /** 优先级 */
  priority?: number
  /** 过期时间 */
  expiresAt?: number
}

export interface CacheOptions {
  /** 最大缓存条目数 */
  maxSize?: number
  /** 最大内存使用量（字节） */
  maxMemory?: number
  /** 缓存过期时间（毫秒） */
  ttl?: number
  /** 是否启用统计 */
  enableStats?: boolean
  /** 预加载策略 */
  preloadStrategy?: 'aggressive' | 'conservative' | 'none'
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
}

export interface CacheStats {
  /** 缓存命中次数 */
  hits: number
  /** 缓存未命中次数 */
  misses: number
  /** 缓存命中率 */
  hitRate: number
  /** 当前缓存条目数 */
  size: number
  /** 当前内存使用量 */
  memoryUsage: number
  /** 最大内存限制 */
  maxMemory: number
  /** 内存使用率 */
  memoryUsageRate: number
  /** 预加载命中次数 */
  preloadHits: number
  /** 平均访问时间 */
  averageAccessTime: number
}

/**
 * 高性能 LRU 缓存管理器
 */
export class PerformanceCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private accessOrder: string[] = []
  private stats: CacheStats
  private options: Required<CacheOptions>
  private cleanupTimer?: NodeJS.Timeout
  private accessTimes: number[] = []

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 100,
      maxMemory: options.maxMemory || 50 * 1024 * 1024, // 50MB
      ttl: options.ttl || 30 * 60 * 1000, // 30分钟
      enableStats: options.enableStats !== false,
      preloadStrategy: options.preloadStrategy || 'conservative',
      cleanupInterval: options.cleanupInterval || 5 * 60 * 1000, // 5分钟
    }

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      memoryUsage: 0,
      maxMemory: this.options.maxMemory,
      memoryUsageRate: 0,
      preloadHits: 0,
      averageAccessTime: 0,
    }

    this.startCleanupTimer()
    console.log('🚀 高性能缓存管理器初始化完成')
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | undefined {
    const startTime = performance.now()
    const entry = this.cache.get(key)

    if (!entry) {
      this.updateStats('miss')
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.delete(key)
      this.updateStats('miss')
      return undefined
    }

    // 更新访问信息
    entry.lastAccessedAt = Date.now()
    entry.accessCount++

    // 更新 LRU 顺序
    this.updateAccessOrder(key)

    // 记录访问时间
    const accessTime = performance.now() - startTime
    this.recordAccessTime(accessTime)

    // 更新统计
    this.updateStats('hit', entry.preloaded)

    return entry.value
  }

  /**
   * 设置缓存项
   */
  set(
    key: string,
    value: T,
    options?: {
      priority?: number
      preloaded?: boolean
      ttl?: number
    }
  ): void {
    const now = Date.now()
    const size = this.calculateSize(value)
    const ttl = options?.ttl || this.options.ttl

    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 1,
      size,
      preloaded: options?.preloaded || false,
      priority: options?.priority || 1,
      expiresAt: now + ttl,
    }

    // 检查内存限制
    if (this.stats.memoryUsage + size > this.options.maxMemory) {
      this.evictByMemory(size)
    }

    // 检查大小限制
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, entry)
    this.updateAccessOrder(key)
    this.updateMemoryUsage()

    console.log(`💾 缓存项已设置: ${key} (${this.formatSize(size)})`)
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    this.cache.delete(key)
    this.removeFromAccessOrder(key)
    this.updateMemoryUsage()

    console.log(`🗑️ 缓存项已删除: ${key}`)
    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.updateMemoryUsage()
    console.log('🧹 缓存已清空')
  }

  /**
   * 预加载缓存项
   */
  async preload(key: string, loader: () => Promise<T>): Promise<void> {
    if (this.cache.has(key)) {
      console.log(`⚡ 缓存命中，跳过预加载: ${key}`)
      return
    }

    try {
      console.log(`🔄 开始预加载: ${key}`)
      const value = await loader()
      this.set(key, value, { preloaded: true, priority: 2 })
      console.log(`✅ 预加载完成: ${key}`)
    } catch (error) {
      console.error(`❌ 预加载失败: ${key}`, error)
    }
  }

  /**
   * 批量预加载
   */
  async batchPreload(items: Array<{ key: string; loader: () => Promise<T> }>): Promise<void> {
    console.log(`🚀 开始批量预加载: ${items.length} 项`)
    const startTime = performance.now()

    const promises = items.map(item => this.preload(item.key, item.loader))
    await Promise.allSettled(promises)

    const endTime = performance.now()
    console.log(`✅ 批量预加载完成，耗时: ${Math.round(endTime - startTime)}ms`)
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * 获取缓存键列表
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 检查缓存项是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry ? !this.isExpired(entry) : false
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clear()
    console.log('💥 缓存管理器已销毁')
  }

  // 私有方法

  private isExpired(entry: CacheEntry<T>): boolean {
    return entry.expiresAt ? Date.now() > entry.expiresAt : false
  }

  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    this.accessOrder.push(key)
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return

    const keyToEvict = this.accessOrder[0]
    this.delete(keyToEvict)
    console.log(`🔄 LRU 淘汰: ${keyToEvict}`)
  }

  private evictByMemory(requiredSize: number): void {
    let freedMemory = 0
    const toEvict: string[] = []

    // 按优先级和访问时间排序，优先淘汰低优先级和久未访问的项
    const sortedKeys = this.accessOrder.slice().sort((a, b) => {
      const entryA = this.cache.get(a)!
      const entryB = this.cache.get(b)!

      // 优先级低的先淘汰
      if (entryA.priority !== entryB.priority) {
        return entryA.priority! - entryB.priority!
      }

      // 访问时间早的先淘汰
      return entryA.lastAccessedAt - entryB.lastAccessedAt
    })

    for (const key of sortedKeys) {
      const entry = this.cache.get(key)
      if (!entry) continue

      toEvict.push(key)
      freedMemory += entry.size

      if (freedMemory >= requiredSize) break
    }

    toEvict.forEach(key => this.delete(key))
    console.log(`🧹 内存清理: 释放 ${this.formatSize(freedMemory)}，淘汰 ${toEvict.length} 项`)
  }

  private calculateSize(value: T): number {
    try {
      return new Blob([JSON.stringify(value)]).size
    } catch {
      return 1024 // 默认 1KB
    }
  }

  private updateMemoryUsage(): void {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }
    this.stats.memoryUsage = totalSize
    this.stats.size = this.cache.size
    this.stats.memoryUsageRate = totalSize / this.options.maxMemory
  }

  private updateStats(type?: 'hit' | 'miss', isPreload?: boolean): void {
    if (!this.options.enableStats) return

    if (type === 'hit') {
      this.stats.hits++
      if (isPreload) {
        this.stats.preloadHits++
      }
    } else if (type === 'miss') {
      this.stats.misses++
    }

    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0

    // 更新平均访问时间
    if (this.accessTimes.length > 0) {
      this.stats.averageAccessTime = this.accessTimes.reduce((a, b) => a + b, 0) / this.accessTimes.length
    }
  }

  private recordAccessTime(time: number): void {
    this.accessTimes.push(time)
    // 只保留最近 100 次访问时间
    if (this.accessTimes.length > 100) {
      this.accessTimes.shift()
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.delete(key))

    if (expiredKeys.length > 0) {
      console.log(`🧹 定期清理: 移除 ${expiredKeys.length} 个过期项`)
    }
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)}${units[unitIndex]}`
  }
}

/**
 * 创建高性能缓存实例
 */
export function createPerformanceCache<T = any>(options?: CacheOptions): PerformanceCache<T> {
  return new PerformanceCache<T>(options)
}
