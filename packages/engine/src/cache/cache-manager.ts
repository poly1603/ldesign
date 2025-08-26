// 缓存策略枚举
export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  TTL = 'ttl',
}

// 缓存项接口
export interface CacheItem<T = any> {
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
export interface CacheManager {
  get: <T = unknown>(key: string) => T | undefined
  set: <T = unknown>(key: string, value: T, ttl?: number) => void
  has: (key: string) => boolean
  delete: (key: string) => boolean
  clear: () => void
  size: () => number
  keys: () => string[]
  values: () => unknown[]
  entries: () => [string, unknown][]
  getStats: () => CacheStats
  resetStats: () => void
  namespace: (name: string) => CacheManager
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
    if (!item)
      return false

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
    const values: T[] = []
    for (const key of this.cache.keys()) {
      const value = this.get(key)
      if (value !== undefined) {
        values.push(value)
      }
    }
    return values
  }

  entries(): [string, T][] {
    const entries: [string, T][] = []
    for (const key of this.cache.keys()) {
      const value = this.get(key)
      if (value !== undefined) {
        entries.push([key, value])
      }
    }
    return entries
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

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

  // 预热缓存
  warmup(entries: Array<{ key: string, value: T, ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.ttl)
    }
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
    }
    else if (memoryUsage > 0.7) {
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
export class CacheManagerImpl implements CacheManager {
  private cache: LRUCache
  private config: Required<CacheConfig>
  private namespaces = new Map<string, CacheManager>()

  constructor(config: CacheConfig = {}) {
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

  get<T = unknown>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined
  }

  set<T = unknown>(key: string, value: T, ttl?: number): void {
    const finalTTL = ttl ?? this.config.defaultTTL
    this.cache.set(key, value, finalTTL > 0 ? finalTTL : undefined)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted && this.config.onEvict) {
      this.config.onEvict(key, undefined)
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

  values(): unknown[] {
    const values: unknown[] = []
    for (const key of this.cache.keys()) {
      const value = this.cache.get(key)
      if (value !== undefined) {
        values.push(value)
      }
    }
    return values
  }

  entries(): [string, unknown][] {
    const entries: [string, unknown][] = []
    for (const key of this.cache.keys()) {
      const value = this.cache.get(key)
      if (value !== undefined) {
        entries.push([key, value])
      }
    }
    return entries
  }

  getStats(): CacheStats {
    return this.cache.getStats()
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

  namespace(name: string): CacheManager {
    if (!this.namespaces.has(name)) {
      this.namespaces.set(
        name,
        new NamespacedCacheManager(this, name) as CacheManager,
      )
    }
    return this.namespaces.get(name)!
  }
}

// 命名空间缓存管理器
class NamespacedCacheManager implements CacheManager {
  constructor(private parent: CacheManager, private namespaceName: string) { }

  private getKey(key: string): string {
    return `${this.namespaceName}:${key}`
  }

  get<T = any>(key: string): T | undefined {
    return this.parent.get(this.getKey(key))
  }

  set<T = any>(key: string, value: T, ttl?: number): void {
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

  values(): unknown[] {
    return this.keys().map(key => this.get(key))
  }

  entries(): [string, unknown][] {
    return this.keys().map(key => [key, this.get(key)])
  }

  getStats(): CacheStats {
    // 命名空间缓存的统计信息是父缓存的子集
    return this.parent.getStats()
  }

  resetStats(): void {
    // 重置父缓存的统计信息
    this.parent.resetStats()
  }

  namespace(name: string): CacheManager {
    return this.parent.namespace(`${this.namespaceName}:${name}`)
  }
}

// 创建缓存管理器
export function createCacheManager(config?: CacheConfig): CacheManager {
  return new CacheManagerImpl(config)
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
