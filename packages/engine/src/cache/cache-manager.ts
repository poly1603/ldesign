// 缓存策略枚举
export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  TTL = 'ttl',
}

// 缓存项接口
export interface CacheItem<T = unknown> {
  key: string
  value: T
  timestamp: number
  ttl?: number
  accessCount: number
  lastAccessed: number
}

// 缓存配置接口
export interface CacheConfig<T = unknown> {
  maxSize?: number
  defaultTTL?: number
  strategy?: CacheStrategy
  enableStats?: boolean
  onEvict?: (key: string, value: T) => void
}

// 缓存统计信息
export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  size: number
  hitRate: number
}

// 缓存管理器接口
export interface CacheManager<T = unknown> {
  get: (key: string) => T | undefined
  set: (key: string, value: T, ttl?: number) => void
  has: (key: string) => boolean
  delete: (key: string) => boolean
  clear: () => void
  size: () => number
  keys: () => string[]
  values: () => T[]
  entries: () => [string, T][]
  getStats: () => CacheStats & {
    hitRate: number
    memoryUsage: number
    averageItemSize: number
  }
  // 新增的功能增强方法
  preload: <K extends string>(
    keys: K[],
    loader: (key: K) => Promise<T> | T,
    options?: { ttl?: number; priority?: 'high' | 'normal' | 'low' }
  ) => Promise<void>
  warmup: <K extends string>(
    warmupData: Array<{ key: K; loader: () => Promise<T> | T; ttl?: number }>
  ) => Promise<void>
  resetStats: () => void
  namespace: (name: string) => CacheManager<T>
}

// LRU缓存实现
class LRUCache<T = unknown> {
  private cache = new Map<string, CacheItem<T>>()
  private maxSize: number
  private stats: CacheStats
  private onEvict?: (key: string, value: T) => void

  // 性能优化：批量清理队列
  private cleanupQueue: string[] = []
  private cleanupTimer?: NodeJS.Timeout
  private readonly CLEANUP_BATCH_SIZE = 20
  private readonly CLEANUP_INTERVAL = 5000 // 5秒

  constructor(maxSize = 100, onEvict?: (key: string, value: T) => void) {
    this.maxSize = maxSize
    this.onEvict = onEvict
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    }

    // 启动定期清理
    this.startCleanupTimer()
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      return undefined
    }

    // 检查TTL
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      // 性能优化：延迟删除，加入清理队列
      this.scheduleCleanup(key)
      this.stats.misses++
      this.stats.evictions++
      this.updateHitRate()
      return undefined
    }

    // 更新访问信息
    item.lastAccessed = Date.now()
    item.accessCount++

    // 移到最后（最近使用）
    this.cache.delete(key)
    this.cache.set(key, item)

    this.stats.hits++
    this.updateHitRate()
    return item.value
  }

  set(key: string, value: T, ttl?: number): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    // 如果超过最大容量，删除最久未使用的
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        const evictedItem = this.cache.get(firstKey)
        this.cache.delete(firstKey)
        this.stats.evictions++

        // 调用淘汰回调
        if (evictedItem && this.onEvict) {
          this.onEvict(firstKey, evictedItem.value)
        }
      }
    }

    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
    }

    this.cache.set(key, item)
    this.stats.sets++
    this.stats.size = this.cache.size
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    // 检查TTL
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.evictions++
      this.stats.size = this.cache.size
      return false
    }

    return true
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
      this.stats.size = this.cache.size
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  values(): T[] {
    // 优化：直接从缓存项中获取值，避免重复的 TTL 检查
    const values: T[] = []
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      // 检查 TTL
      if (item.ttl && now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        this.stats.evictions++
        continue
      }
      values.push(item.value)
    }

    this.stats.size = this.cache.size
    return values
  }

  entries(): [string, T][] {
    // 优化：直接从缓存项中获取值，避免重复的 TTL 检查
    const entries: [string, T][] = []
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      // 检查 TTL
      if (item.ttl && now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        this.stats.evictions++
        continue
      }
      entries.push([key, item.value])
    }

    this.stats.size = this.cache.size
    return entries
  }

  // 新增：批量清理过期项的方法





  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: this.cache.size,
      hitRate: 0,
    }
  }

  // 获取内部缓存映射（用于统计计算）
  get internalCache(): Map<string, CacheItem<T>> {
    return this.cache
  }

  // 安全获取统计信息
  public getStats(): CacheStats {
    return this.stats
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  // 清理过期项
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache) {
      if (item.ttl && now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    }

    // 批量删除，避免在迭代过程中修改Map
    for (const key of keysToDelete) {
      this.cache.delete(key)
      this.stats.evictions++
    }

    this.stats.size = this.cache.size
  }



  /**
   * 性能优化：启动定期清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.processCleanupQueue()
    }, this.CLEANUP_INTERVAL)
  }

  /**
   * 性能优化：调度清理任务
   */
  private scheduleCleanup(key: string): void {
    if (!this.cleanupQueue.includes(key)) {
      this.cleanupQueue.push(key)
    }

    // 如果队列满了，立即处理
    if (this.cleanupQueue.length >= this.CLEANUP_BATCH_SIZE) {
      this.processCleanupQueue()
    }
  }

  /**
   * 性能优化：批量处理清理队列
   */
  private processCleanupQueue(): void {
    if (this.cleanupQueue.length === 0) return

    const keysToProcess = this.cleanupQueue.splice(0, this.CLEANUP_BATCH_SIZE)

    for (const key of keysToProcess) {
      this.cache.delete(key)
    }

    this.stats.size = this.cache.size
  }

  /**
   * 手动触发清理队列处理（主要用于测试）
   */
  forceCleanup(): void {
    this.processCleanupQueue()
  }

  /**
   * 销毁缓存，清理资源
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    this.cache.clear()
    this.cleanupQueue.length = 0
    this.stats.size = 0
  }

  // 获取缓存健康状态
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical'
    hitRate: number
    memoryUsage: number
    recommendations: string[]
  } {
    const hitRate = this.stats.hitRate
    const memoryUsage = this.cache.size / this.maxSize
    const recommendations: string[] = []

    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    if (hitRate < 0.5) {
      status = 'warning'
      recommendations.push('缓存命中率较低，考虑调整缓存策略')
    }

    if (hitRate < 0.2) {
      status = 'critical'
      recommendations.push('缓存命中率过低，需要重新评估缓存配置')
    }

    if (memoryUsage > 0.9) {
      status = 'critical'
      recommendations.push('缓存使用率过高，考虑增加缓存大小或调整TTL')
    } else if (memoryUsage > 0.7) {
      status = 'warning'
      recommendations.push('缓存使用率较高，建议监控内存使用情况')
    }

    if (this.stats.evictions > this.stats.sets * 0.3) {
      recommendations.push('缓存淘汰率较高，考虑增加缓存大小')
    }

    return {
      status,
      hitRate,
      memoryUsage,
      recommendations,
    }
  }
}

// 缓存管理器实现
export class CacheManagerImpl<T = unknown> implements CacheManager<T> {
  private cache: LRUCache<T>
  private config: Required<CacheConfig<T>>
  private namespaces = new Map<string, CacheManager<T>>()

  constructor(config: CacheConfig<T> = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 0, // 0表示永不过期
      strategy: CacheStrategy.LRU,
      enableStats: true,
      onEvict: () => { },
      ...config,
    }

    this.cache = new LRUCache(this.config.maxSize, this.config.onEvict)
  }

  get(key: string): T | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: T, ttl?: number): void {
    const finalTTL = ttl ?? this.config.defaultTTL
    this.cache.set(key, value, finalTTL > 0 ? finalTTL : undefined)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): boolean {
    const prev = this.cache.get(key)
    const deleted = this.cache.delete(key)
    if (deleted && this.config.onEvict && prev !== undefined) {
      this.config.onEvict(key, prev)
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size()
  }

  keys(): string[] {
    return this.cache.keys()
  }

  values(): T[] {
    // 先清理过期项
    this.cache.cleanup()

    const values: T[] = []
    for (const key of this.cache.keys()) {
      const value = this.cache.get(key)
      if (value !== undefined) {
        values.push(value)
      }
    }
    return values
  }

  entries(): [string, T][] {
    // 先清理过期项
    this.cache.cleanup()

    const entries: [string, T][] = []
    for (const key of this.cache.keys()) {
      const value = this.cache.get(key)
      if (value !== undefined) {
        entries.push([key, value])
      }
    }
    return entries
  }

  getStats(): CacheStats & {
    hitRate: number
    memoryUsage: number
    averageItemSize: number
  } {
    const baseStats = this.cache.getStats()
    const hitRate = baseStats.hits + baseStats.misses > 0
      ? baseStats.hits / (baseStats.hits + baseStats.misses)
      : 0

    // 估算内存使用（简单估算）- 直接访问缓存，不触发统计
    let memoryUsage = 0
    for (const [key, item] of this.cache.internalCache.entries()) {
      // 检查是否过期
      if (!item.ttl || Date.now() - item.timestamp <= item.ttl) {
        memoryUsage += key.length * 2 // 字符串大小估算
        memoryUsage += JSON.stringify(item.value).length * 2 // 值大小估算
      }
    }

    const currentSize = this.size()
    const averageItemSize = currentSize > 0 ? memoryUsage / currentSize : 0

    return {
      ...baseStats,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage,
      averageItemSize: Math.round(averageItemSize)
    }
  }

  resetStats(): void {
    this.cache.resetStats()
  }

  /**
   * 手动触发清理队列处理（主要用于测试）
   */
  forceCleanup(): void {
    this.cache.forceCleanup()
  }

  /**
   * 新增：智能预加载功能
   * 根据访问模式预加载可能需要的数据
   */
  async preload<K extends string>(
    keys: K[],
    loader: (key: K) => Promise<T> | T,
    options?: { ttl?: number; priority?: 'high' | 'normal' | 'low' }
  ): Promise<void> {
    const { ttl, priority = 'normal' } = options || {}

    const loadPromises = keys.map(async (key) => {
      if (!this.has(key)) {
        try {
          const value = await loader(key)
          this.set(key, value, ttl)
        } catch (error) {
          // 预加载失败不应该影响主流程
          console.warn(`Failed to preload cache key: ${key}`, error)
        }
      }
    })

    // 根据优先级决定是否等待完成
    if (priority === 'high') {
      return Promise.all(loadPromises).then(() => { })
    } else {
      // 低优先级异步执行，不阻塞
      Promise.all(loadPromises).catch(() => { })
      return Promise.resolve()
    }
  }

  /**
   * 新增：缓存预热功能
   * 在系统启动时预热常用数据
   */
  async warmup<K extends string>(
    warmupData: Array<{ key: K; loader: () => Promise<T> | T; ttl?: number }>
  ): Promise<void> {
    const warmupPromises = warmupData.map(async ({ key, loader, ttl }) => {
      try {
        const value = await loader()
        this.set(key, value, ttl)
      } catch (error) {
        console.warn(`Failed to warmup cache key: ${key}`, error)
      }
    })

    await Promise.all(warmupPromises)
  }

  namespace(name: string): CacheManager<T> {
    if (!this.namespaces.has(name)) {
      this.namespaces.set(
        name,
        new NamespacedCacheManager<T>(this, name)
      )
    }
    return this.namespaces.get(name)!
  }
}

// 命名空间缓存管理器
class NamespacedCacheManager<T = unknown> implements CacheManager<T> {
  constructor(
    private parent: CacheManager<T>,
    private namespaceName: string
  ) { }

  private getKey(key: string): string {
    return `${this.namespaceName}:${key}`
  }

  get(key: string): T | undefined {
    return this.parent.get(this.getKey(key))
  }

  set(key: string, value: T, ttl?: number): void {
    this.parent.set(this.getKey(key), value, ttl)
  }

  has(key: string): boolean {
    return this.parent.has(this.getKey(key))
  }

  delete(key: string): boolean {
    return this.parent.delete(this.getKey(key))
  }

  clear(): void {
    const prefix = `${this.namespaceName}:`
    const keys = this.parent.keys().filter(key => key.startsWith(prefix))
    keys.forEach(key => this.parent.delete(key))
  }

  size(): number {
    const prefix = `${this.namespaceName}:`
    return this.parent.keys().filter(key => key.startsWith(prefix)).length
  }

  keys(): string[] {
    const prefix = `${this.namespaceName}:`
    return this.parent
      .keys()
      .filter(key => key.startsWith(prefix))
      .map(key => key.slice(prefix.length))
  }

  values(): T[] {
    return this.keys().map(key => this.get(key)!).filter(value => value !== undefined)
  }

  entries(): [string, T][] {
    const result: [string, T][] = []
    for (const key of this.keys()) {
      const v = this.get(key)
      if (v !== undefined) {
        result.push([key, v])
      }
    }
    return result
  }

  getStats(): CacheStats & {
    hitRate: number
    memoryUsage: number
    averageItemSize: number
  } {
    // 命名空间缓存的统计信息是父缓存的子集
    return this.parent.getStats()
  }

  async preload<K extends string>(
    keys: K[],
    loader: (key: K) => Promise<T> | T,
    options?: { ttl?: number; priority?: 'high' | 'normal' | 'low' }
  ): Promise<void> {
    return this.parent.preload(keys, loader, options)
  }

  async warmup<K extends string>(
    warmupData: Array<{ key: K; loader: () => Promise<T> | T; ttl?: number }>
  ): Promise<void> {
    return this.parent.warmup(warmupData)
  }

  resetStats(): void {
    this.parent.resetStats()
  }

  namespace(name: string): CacheManager<T> {
    return this.parent.namespace(`${this.namespaceName}:${name}`)
  }
}

// 创建缓存管理器
export function createCacheManager<T = unknown>(config?: CacheConfig<T>): CacheManager<T> {
  return new CacheManagerImpl<T>(config)
}

// 全局缓存管理器
let globalCacheManager: CacheManager | undefined

export function getGlobalCacheManager(): CacheManager {
  if (!globalCacheManager) {
    globalCacheManager = createCacheManager({
      maxSize: 1000,
      defaultTTL: 30 * 60 * 1000, // 30分钟
      enableStats: true,
    })
  }
  return globalCacheManager
}

export function setGlobalCacheManager(manager: CacheManager): void {
  globalCacheManager = manager
}
