/**
 * 高级缓存管理器
 * 🚀 提供分层缓存、智能预加载、自动更新等特性
 */

import type { Logger } from '../types/logger'

// ============================================
// 类型定义
// ============================================

export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  TTL = 'ttl',
}

export interface CacheItem<T = unknown> {
  key: string
  value: T
  timestamp: number
  ttl?: number
  accessCount: number
  lastAccessed: number
  size?: number
  metadata?: Record<string, unknown>
}

export interface CacheConfig<T = unknown> {
  // 基础配置
  maxSize?: number
  defaultTTL?: number
  strategy?: CacheStrategy
  enableStats?: boolean

  // 内存配置
  maxMemory?: number
  cleanupInterval?: number

  // 分层缓存配置
  layers?: {
    memory?: { enabled: boolean; maxSize: number; ttl: number }
    localStorage?: { enabled: boolean; prefix: string; maxSize: number }
    sessionStorage?: { enabled: boolean; prefix: string; maxSize: number }
    indexedDB?: { enabled: boolean; dbName: string; storeName: string }
  }

  // 回调
  onEvict?: (key: string, value: T) => void
  onError?: (error: Error) => void
}

export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  expirations: number
  size: number
  hitRate: number
  memoryUsage: number
  averageItemSize: number
}

// ============================================
// 缓存管理器实现
// ============================================

export class CacheManager<T = unknown> {
  private cache = new Map<string, CacheItem<T>>()
  private config: Required<CacheConfig<T>>
  private stats: CacheStats
  private cleanupTimer?: NodeJS.Timeout
  private totalMemory = 0
  private logger?: Logger

  // 分层缓存存储
  private layers = new Map<string, StorageLayer<T>>()

  // 预加载和更新
  private preloadQueue = new Set<string>()
  private updateTimers = new Map<string, NodeJS.Timeout>()

  // 缓存分片（减少单个Map的大小，提升性能）
  private shards: Map<string, CacheItem<T>>[] = []
  private readonly SHARD_COUNT = 16 // 分片数量
  private useSharding = false // 是否启用分片

  constructor(config: CacheConfig<T> = {}, logger?: Logger) {
    this.logger = logger
    this.config = this.normalizeConfig(config)
    this.stats = this.initStats()

    // 如果缓存大小超过阈值，启用分片
    if (this.config.maxSize > 100) {
      this.useSharding = true
      this.initializeShards()
    }

    this.initializeLayers()
    this.startCleanup()
  }

  /**
   * 初始化缓存分片
   */
  private initializeShards(): void {
    for (let i = 0; i < this.SHARD_COUNT; i++) {
      this.shards.push(new Map())
    }
    this.logger?.debug(`Cache sharding enabled with ${this.SHARD_COUNT} shards`)
  }

  /**
   * 根据key计算分片索引（使用简单哈希）
   */
  private getShardIndex(key: string): number {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i)
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash) % this.SHARD_COUNT
  }

  /**
   * 获取缓存分片
   */
  private getShard(key: string): Map<string, CacheItem<T>> {
    if (!this.useSharding) {
      return this.cache
    }
    return this.shards[this.getShardIndex(key)]
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config: CacheConfig<T>): Required<CacheConfig<T>> {
    return {
      maxSize: config.maxSize ?? 50, // 进一步减少默认缓存大小到50
      defaultTTL: config.defaultTTL ?? 3 * 60 * 1000, // 减少默认TTL为3分钟
      strategy: config.strategy ?? CacheStrategy.LRU,
      enableStats: config.enableStats ?? false, // 默认关闭统计以节省内存
      maxMemory: config.maxMemory ?? 5 * 1024 * 1024, // 减少最大内存到5MB
      cleanupInterval: config.cleanupInterval ?? 20000, // 更频繁的清理（20秒）
      layers: config.layers ?? {},
      onEvict: config.onEvict ?? (() => { }),
      onError: config.onError ?? ((error) => this.logger?.error('Cache error', error))
    }
  }

  /**
   * 初始化统计信息
   */
  private initStats(): CacheStats {
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      expirations: 0,
      size: 0,
      hitRate: 0,
      memoryUsage: 0,
      averageItemSize: 0
    }
  }

  /**
   * 初始化分层缓存
   */
  private initializeLayers(): void {
    const { layers } = this.config

    if (layers.memory?.enabled) {
      this.layers.set('memory', new MemoryLayer(layers.memory))
    }

    if (layers.localStorage?.enabled && typeof window !== 'undefined') {
      this.layers.set('localStorage', new LocalStorageLayer(layers.localStorage))
    }

    if (layers.sessionStorage?.enabled && typeof window !== 'undefined') {
      this.layers.set('sessionStorage', new SessionStorageLayer(layers.sessionStorage))
    }

    if (layers.indexedDB?.enabled && typeof window !== 'undefined') {
      this.layers.set('indexedDB', new IndexedDBLayer(layers.indexedDB))
    }
  }

  // ============================================
  // 核心方法
  // ============================================

  /**
   * 获取缓存值
   */
  async get(key: string): Promise<T | undefined> {
    // 先从内存缓存查找
    const memoryItem = this.getFromMemory(key)
    if (memoryItem !== undefined) {
      return memoryItem
    }

    // 从分层缓存查找
    for (const [, layer] of this.layers) {
      try {
        const value = await layer.get(key)
        if (value !== undefined) {
          // 回填到内存缓存
          this.set(key, value)

          if (this.config?.enableStats) {
            this.stats.hits++
            this.updateHitRate()
          }

          return value
        }
      } catch (error) {
        this.config?.onError(error as Error)
      }
    }

    // 未命中
    if (this.config?.enableStats) {
      this.stats.misses++
      this.updateHitRate()
    }

    return undefined
  }

  /**
   * 从内存缓存获取（支持分片）
   */
  private getFromMemory(key: string): T | undefined {
    const shard = this.getShard(key)
    const item = shard.get(key)

    if (!item) {
      return undefined
    }

    // 检查TTL
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.delete(key)
      this.stats.expirations++
      return undefined
    }

    // 更新访问信息
    item.lastAccessed = Date.now()
    item.accessCount++

    // 根据策略更新顺序
    this.updateItemOrder(key, item)

    if (this.config?.enableStats) {
      this.stats.hits++
      this.updateHitRate()
    }

    return item.value
  }

  /**
   * 设置缓存值
   */
  async set(key: string, value: T, ttl?: number, metadata?: Record<string, unknown>): Promise<void> {
    const effectiveTTL = ttl ?? this.config?.defaultTTL
    const size = this.estimateSize(value)

    // 检查容量限制
    await this.ensureCapacity(key, size)

    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: effectiveTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
      size,
      metadata
    }

    // 存入内存缓存（使用分片）
    const shard = this.getShard(key)
    shard.set(key, item)
    this.totalMemory += size

    // 存入分层缓存
    for (const [, layer] of this.layers) {
      try {
        await layer.set(key, value, effectiveTTL)
      } catch (error) {
        this.config?.onError(error as Error)
      }
    }

    if (this.config?.enableStats) {
      this.stats.sets++
      this.stats.size = this.cache.size
      this.updateStats()
    }
  }

  /**
   * 删除缓存（支持分片）
   */
  async delete(key: string): Promise<boolean> {
    const shard = this.getShard(key)
    const item = shard.get(key)

    if (item) {
      shard.delete(key)
      this.totalMemory -= item.size || 0

      // 从所有层删除
      for (const [, layer] of this.layers) {
        try {
          await layer.delete(key)
        } catch (error) {
          this.config?.onError(error as Error)
        }
      }

      if (this.config?.enableStats) {
        this.stats.deletes++
        this.stats.size = this.getTotalSize()
      }

      return true
    }

    return false
  }

  /**
   * 获取总缓存大小（支持分片）
   */
  private getTotalSize(): number {
    if (!this.useSharding) {
      return this.cache.size
    }
    return this.shards.reduce((total, shard) => total + shard.size, 0)
  }

  /**
   * 清空缓存（支持分片）
   */
  async clear(): Promise<void> {
    if (this.useSharding) {
      this.shards.forEach(shard => shard.clear())
    } else {
      this.cache.clear()
    }
    this.totalMemory = 0

    // 清空所有层
    for (const [, layer] of this.layers) {
      try {
        await layer.clear()
      } catch (error) {
        this.config?.onError(error as Error)
      }
    }

    this.resetStats()
  }

  /**
   * 按命名空间清理缓存键（前缀匹配，支持分片）
   */
  async clearNamespace(namespace: string): Promise<void> {
    const prefix = `${namespace}:`
    const keysToDelete: string[] = []

    // 遍历所有分片查找匹配的键
    if (this.useSharding) {
      for (const shard of this.shards) {
        for (const key of shard.keys()) {
          if (key.startsWith(prefix)) {
            keysToDelete.push(key)
          }
        }
      }
    } else {
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          keysToDelete.push(key)
        }
      }
    }

    await Promise.all(keysToDelete.map(key => this.delete(key)))
  }

  // ============================================
  // 高级功能
  // ============================================

  /**
   * 批量预加载
   */
  async preload<K extends string>(
    keys: K[],
    loader: (key: K) => Promise<T> | T,
    options?: { ttl?: number; priority?: 'high' | 'normal' | 'low' }
  ): Promise<void> {
    const priority = options?.priority ?? 'normal'
    const ttl = options?.ttl

    // 根据优先级排序
    const sortedKeys = priority === 'high'
      ? keys
      : priority === 'low'
        ? keys.reverse()
        : keys

    const promises = sortedKeys.map(async (key) => {
      try {
        const value = await loader(key)
        await this.set(key, value, ttl)
      } catch (error) {
        this.logger?.error(`Failed to preload ${key}`, error)
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * 缓存预热
   */
  async warmup<K extends string>(
    warmupData: Array<{ key: K; loader: () => Promise<T> | T; ttl?: number }>
  ): Promise<void> {
    const promises = warmupData.map(async ({ key, loader, ttl }) => {
      try {
        const value = await loader()
        await this.set(key, value, ttl)
      } catch (error) {
        this.logger?.error(`Failed to warmup ${key}`, error)
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * 获取命名空间缓存
   */
  namespace(name: string): NamespacedCache<T> {
    return new NamespacedCache(this, name)
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
   * 事件监听（兼容方法）
   * @param event 事件名称
   * @param callback 回调函数
   * @returns 取消监听的函数
   */
  on(event: string, callback: (...args: unknown[]) => void): () => void {
    // 简单实现，如果需要更复杂的事件系统可以后续扩展
    const self = this as unknown as { _eventListeners?: Map<string, Array<(...args: unknown[]) => void>> }
    const listeners = self._eventListeners || new Map()
    if (!self._eventListeners) {
      self._eventListeners = listeners
    }

    const eventListeners = listeners.get(event) || []
    eventListeners.push(callback)
    listeners.set(event, eventListeners)

    // 返回取消监听的函数
    return () => {
      const callbacks = listeners.get(event) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // ============================================
  // 私有方法
  // ============================================

  /**
   * 确保有足够的容量（支持分片）
   */
  private async ensureCapacity(key: string, size: number): Promise<void> {
    const shard = this.getShard(key)
    const totalSize = this.getTotalSize()

    // 检查最大条目数
    if (totalSize >= this.config?.maxSize && !shard.has(key)) {
      await this.evict()
    }

    // 检查内存限制
    if (this.config?.maxMemory > 0) {
      while (this.totalMemory + size > this.config?.maxMemory && totalSize > 0) {
        await this.evict()
      }
    }
  }

  /**
   * 淘汰缓存项
   */
  private async evict(): Promise<void> {
    const strategy = this.config?.strategy
    let keyToEvict: string | undefined

    switch (strategy) {
      case CacheStrategy.LRU:
        keyToEvict = this.findLRU()
        break
      case CacheStrategy.LFU:
        keyToEvict = this.findLFU()
        break
      case CacheStrategy.FIFO:
        keyToEvict = this.cache.keys().next().value
        break
      case CacheStrategy.TTL:
        keyToEvict = this.findExpired()
        break
    }

    if (keyToEvict) {
      const item = this.cache.get(keyToEvict)
      if (item) {
        this.config?.onEvict(keyToEvict, item.value)
        await this.delete(keyToEvict)
        this.stats.evictions++
      }
    }
  }

  /**
   * 查找最久未使用的项 - 支持分片
   */
  private findLRU(): string | undefined {
    const totalSize = this.getTotalSize()
    if (totalSize === 0) return undefined

    let lruKey: string | undefined
    let lruTime = Infinity

    // 优化：限制搜索数量
    const maxSearch = Math.min(totalSize, 20)
    let searchCount = 0

    // 遍历所有分片
    const caches = this.useSharding ? this.shards : [this.cache]

    for (const cache of caches) {
      for (const [key, item] of cache) {
        if (item.lastAccessed < lruTime) {
          lruTime = item.lastAccessed
          lruKey = key
        }
        if (++searchCount >= maxSearch) return lruKey
      }
    }

    return lruKey
  }

  /**
   * 查找最少使用的项（支持分片）
   */
  private findLFU(): string | undefined {
    let lfuKey: string | undefined
    let lfuCount = Infinity

    const caches = this.useSharding ? this.shards : [this.cache]

    for (const cache of caches) {
      for (const [key, item] of cache) {
        if (item.accessCount < lfuCount) {
          lfuCount = item.accessCount
          lfuKey = key
        }
      }
    }

    return lfuKey
  }

  /**
   * 查找已过期的项（支持分片）
   */
  private findExpired(): string | undefined {
    const now = Date.now()

    const caches = this.useSharding ? this.shards : [this.cache]

    for (const cache of caches) {
      for (const [key, item] of cache) {
        if (item.ttl && now - item.timestamp > item.ttl) {
          return key
        }
      }
    }

    return undefined
  }

  /**
   * 更新项顺序（支持分片）
   */
  private updateItemOrder(key: string, item: CacheItem<T>): void {
    if (this.config?.strategy === CacheStrategy.LRU) {
      // 移到最后（最近使用）
      const shard = this.getShard(key)
      shard.delete(key)
      shard.set(key, item)
    }
  }

  /**
   * 估算对象大小 - 极致优化版
   * 使用更精确的采样策略和缓存机制
   */
  private estimateSize(obj: unknown, depth = 0, visited?: WeakSet<object>): number {
    // 快速路径：基本类型
    if (obj === null || obj === undefined) return 0

    const type = typeof obj
    if (type === 'string') {
      // 更精确的字符串大小估算（UTF-16编码）
      return Math.min((obj as string).length * 2 + 24, 10000)
    }
    if (type === 'number') return 8
    if (type === 'boolean') return 4
    if (type === 'bigint') return 16
    if (type === 'symbol') return 32
    if (type === 'function') return 64
    if (type !== 'object') return 32

    // 限制递归深度
    if (depth > 5) return 100

    // 只在必要时创建 visited 集合
    if (!visited) {
      visited = new WeakSet()
    }

    // 避免循环引用
    if (visited.has(obj as object)) return 0
    visited.add(obj as object)

    // 特殊对象类型
    if (obj instanceof Date) return 24
    if (obj instanceof RegExp) return 48
    if (obj instanceof Map) return 24 + (obj as Map<unknown, unknown>).size * 48
    if (obj instanceof Set) return 24 + (obj as Set<unknown>).size * 32

    // 数组优化：智能采样
    if (Array.isArray(obj)) {
      const len = obj.length
      if (len === 0) return 24

      // 自适应采样：小数组全扫描，大数组采样
      if (len <= 10) {
        let total = 24
        for (let i = 0; i < len; i++) {
          total += this.estimateSize(obj[i], depth + 1, visited)
        }
        return total
      } else {
        // 采样前5个、中间3个、最后2个
        const samples: number[] = []
        for (let i = 0; i < 5 && i < len; i++) {
          samples.push(this.estimateSize(obj[i], depth + 1, visited))
        }
        const mid = Math.floor(len / 2)
        for (let i = mid - 1; i <= mid + 1 && i < len; i++) {
          if (i >= 0) samples.push(this.estimateSize(obj[i], depth + 1, visited))
        }
        for (let i = len - 2; i < len; i++) {
          if (i >= 0) samples.push(this.estimateSize(obj[i], depth + 1, visited))
        }

        const avgSize = samples.reduce((a, b) => a + b, 0) / samples.length
        return 24 + avgSize * len
      }
    }

    // 对象优化：智能估算
    try {
      const keys = Object.keys(obj)
      const keyCount = keys.length
      if (keyCount === 0) return 32

      let size = 32 // 对象基础开销

      // 小对象全扫描
      if (keyCount <= 10) {
        for (const key of keys) {
          size += key.length * 2 + 16 // 键的开销
          size += this.estimateSize((obj as any)[key], depth + 1, visited)
        }
      } else {
        // 大对象采样估算（前7个、中间3个、最后3个）
        const sampleKeys: string[] = []
        for (let i = 0; i < 7 && i < keyCount; i++) {
          sampleKeys.push(keys[i])
        }
        const mid = Math.floor(keyCount / 2)
        for (let i = mid - 1; i <= mid + 1 && i < keyCount; i++) {
          if (i >= 0) sampleKeys.push(keys[i])
        }
        for (let i = keyCount - 3; i < keyCount; i++) {
          if (i >= 0) sampleKeys.push(keys[i])
        }

        let sampleSize = 0
        for (const key of sampleKeys) {
          sampleSize += key.length * 2 + 16
          sampleSize += this.estimateSize((obj as any)[key], depth + 1, visited)
        }

        const avgKeySize = sampleSize / sampleKeys.length
        size += avgKeySize * keyCount
      }

      return Math.min(size, 100000) // 限制最大估算大小
    } catch {
      return 512 // 默认512B
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.memoryUsage = this.totalMemory
    this.stats.averageItemSize = this.cache.size > 0
      ? this.totalMemory / this.cache.size
      : 0
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    if (this.config?.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup()
      }, this.config?.cleanupInterval)
    }
  }

  /**
   * 清理过期项 - 优化版（支持分片）
   */
  private cleanup(): void {
    const now = Date.now()
    let expiredCount = 0
    const totalSize = this.getTotalSize()
    const maxCleanup = Math.min(30, Math.ceil(totalSize * 0.2))

    const caches = this.useSharding ? this.shards : [this.cache]

    // 收集并删除过期项（单次遍历）
    outerLoop: for (const cache of caches) {
      for (const [key, item] of cache) {
        if (item.ttl && now - item.timestamp > item.ttl) {
          cache.delete(key)
          this.totalMemory = Math.max(0, this.totalMemory - (item.size || 0))
          expiredCount++

          if (expiredCount >= maxCleanup) break outerLoop
        }
      }
    }

    if (this.config?.enableStats && expiredCount > 0) {
      this.stats.expirations += expiredCount
    }

    // 检查内存压力并主动清理
    if (this.config?.maxMemory > 0 && this.totalMemory > this.config.maxMemory * 0.75) {
      const currentSize = this.getTotalSize()
      const targetSize = Math.floor(currentSize * 0.6) // 清理到60%
      const toRemove = currentSize - targetSize

      if (toRemove > 0) {
        // 优化：并行处理多个分片
        for (let i = 0; i < toRemove && this.getTotalSize() > targetSize; i++) {
          let minAccess = Infinity
          let minKey = ''
          let minShard: Map<string, CacheItem<T>> | undefined

          // 找到最少访问的项（跨分片采样前20个）
          let checked = 0
          outerSearch: for (const cache of caches) {
            for (const [key, item] of cache) {
              if (item.lastAccessed < minAccess) {
                minAccess = item.lastAccessed
                minKey = key
                minShard = cache
              }
              if (++checked >= 20) break outerSearch
            }
          }

          if (minKey && minShard) {
            const item = minShard.get(minKey)
            if (item) {
              minShard.delete(minKey)
              this.totalMemory = Math.max(0, this.totalMemory - (item.size || 0))
            }
          }
        }
      }
    }

    // 更新统计
    if (this.config?.enableStats) {
      this.stats.size = this.getTotalSize()
      this.updateStats()
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    // 清理定时器
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    // 清理更新定时器
    for (const timer of this.updateTimers.values()) {
      clearTimeout(timer)
    }
    this.updateTimers.clear()

    // 清理所有层
    for (const layer of this.layers.values()) {
      layer.clear().catch(() => { })
    }
    this.layers.clear()

    // 清理事件监听器
    const self = this as unknown as { _eventListeners?: Map<string, Array<(...args: unknown[]) => void>> }
    if (self._eventListeners) {
      self._eventListeners.clear()
      delete self._eventListeners
    }

    // 清理缓存（包括分片）
    if (this.useSharding) {
      this.shards.forEach(shard => shard.clear())
      this.shards = []
    } else {
      this.cache.clear()
    }
    this.preloadQueue.clear()

    // 重置内存计数
    this.totalMemory = 0

    // 重置统计
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      expirations: 0,
      size: 0,
      memoryUsage: 0,
      hitRate: 0,
      averageItemSize: 0
    }
  }
}

// ============================================
// 存储层抽象类
// ============================================

abstract class StorageLayer<T> {
  constructor(protected config: Record<string, unknown>) { }

  abstract get(key: string): Promise<T | undefined>
  abstract set(key: string, value: T, ttl?: number): Promise<void>
  abstract delete(key: string): Promise<boolean>
  abstract clear(): Promise<void>
}

// ============================================
// 内存存储层
// ============================================

class MemoryLayer<T> extends StorageLayer<T> {
  private storage = new Map<string, { value: T; expires: number }>()
  private maxSize = 200 // 进一步限制内存层大小
  private cleanupInterval?: NodeJS.Timeout

  constructor(config: Record<string, unknown>) {
    super(config)
    // 定期清理过期项
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 30000)
  }

  private cleanupExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.storage) {
      if (item.expires > 0 && now > item.expires) {
        this.storage.delete(key)
      }
    }
  }

  async get(key: string): Promise<T | undefined> {
    const item = this.storage.get(key)
    if (!item) return undefined

    if (item.expires > 0 && Date.now() > item.expires) {
      this.storage.delete(key)
      return undefined
    }

    return item.value
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    // 强制大小限制
    if (this.storage.size >= this.maxSize && !this.storage.has(key)) {
      // 删除最旧的条目(FIFO)
      const firstKey = this.storage.keys().next().value
      if (firstKey) {
        this.storage.delete(firstKey)
      }
    }

    const expires = ttl ? Date.now() + ttl : 0
    this.storage.set(key, { value, expires })
  }

  async delete(key: string): Promise<boolean> {
    return this.storage.delete(key)
  }

  async clear(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }
    this.storage.clear()
  }
}

// ============================================
// LocalStorage 存储层
// ============================================

class LocalStorageLayer<T> extends StorageLayer<T> {
  private prefix: string

  constructor(config: Record<string, unknown>) {
    super(config)
    this.prefix = (config.prefix as string) || 'cache:'
  }

  async get(key: string): Promise<T | undefined> {
    try {
      const data = localStorage.getItem(this.prefix + key)
      if (!data) return undefined

      const item = JSON.parse(data)
      if (item.expires > 0 && Date.now() > item.expires) {
        localStorage.removeItem(this.prefix + key)
        return undefined
      }

      return item.value
    } catch {
      return undefined
    }
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const expires = ttl ? Date.now() + ttl : 0
      const data = JSON.stringify({ value, expires })
      localStorage.setItem(this.prefix + key, data)
    } catch {
      // 存储空间不足或其他错误
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(this.prefix + key)
      return true
    } catch {
      return false
    }
  }

  async clear(): Promise<void> {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}

// ============================================
// SessionStorage 存储层
// ============================================

class SessionStorageLayer<T> extends StorageLayer<T> {
  private prefix: string

  constructor(config: Record<string, unknown>) {
    super(config)
    this.prefix = (config.prefix as string) || 'cache:'
  }

  async get(key: string): Promise<T | undefined> {
    try {
      const data = sessionStorage.getItem(this.prefix + key)
      if (!data) return undefined

      const item = JSON.parse(data)
      if (item.expires > 0 && Date.now() > item.expires) {
        sessionStorage.removeItem(this.prefix + key)
        return undefined
      }

      return item.value
    } catch {
      return undefined
    }
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const expires = ttl ? Date.now() + ttl : 0
      const data = JSON.stringify({ value, expires })
      sessionStorage.setItem(this.prefix + key, data)
    } catch {
      // 存储空间不足或其他错误
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      sessionStorage.removeItem(this.prefix + key)
      return true
    } catch {
      return false
    }
  }

  async clear(): Promise<void> {
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        sessionStorage.removeItem(key)
      }
    })
  }
}

// ============================================
// IndexedDB 存储层
// ============================================

class IndexedDBLayer<T> extends StorageLayer<T> {
  private db?: IDBDatabase
  private dbName: string
  private storeName: string

  constructor(config: Record<string, unknown>) {
    super(config)
    this.dbName = (config.dbName as string) || 'CacheDB'
    this.storeName = (config.storeName as string) || 'cache'
    this.initDB()
  }

  private async initDB(): Promise<void> {
    const request = indexedDB.open(this.dbName, 1)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'key' })
      }
    }

    this.db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async get(key: string): Promise<T | undefined> {
    if (!this.db) await this.initDB()
    if (!this.db) return undefined

    const db = this.db
    return new Promise((resolve) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        if (!result) {
          resolve(undefined)
        } else if (result.expires > 0 && Date.now() > result.expires) {
          this.delete(key)
          resolve(undefined)
        } else {
          resolve(result.value)
        }
      }

      request.onerror = () => resolve(undefined)
    })
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.db) await this.initDB()
    if (!this.db) return

    const db = this.db
    return new Promise((resolve) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const expires = ttl ? Date.now() + ttl : 0

      store.put({ key, value, expires })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => resolve()
    })
  }

  async delete(key: string): Promise<boolean> {
    if (!this.db) await this.initDB()
    if (!this.db) return false

    const db = this.db
    return new Promise((resolve) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      store.delete(key)

      transaction.oncomplete = () => resolve(true)
      transaction.onerror = () => resolve(false)
    })
  }

  async clear(): Promise<void> {
    if (!this.db) await this.initDB()
    if (!this.db) return

    const db = this.db
    return new Promise((resolve) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      store.clear()

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => resolve()
    })
  }
}

// ============================================
// 命名空间缓存
// ============================================

class NamespacedCache<T> {
  constructor(
    private parent: CacheManager<T>,
    private namespace: string
  ) { }

  private prefixKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  async get(key: string): Promise<T | undefined> {
    return this.parent.get(this.prefixKey(key))
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    return this.parent.set(this.prefixKey(key), value, ttl)
  }

  async delete(key: string): Promise<boolean> {
    return this.parent.delete(this.prefixKey(key))
  }

  async clear(): Promise<void> {
    // 按前缀清理命名空间下的所有键
    await this.parent.clearNamespace(this.namespace)
  }
}

// ============================================
// 导出
// ============================================

export function createCacheManager<T = unknown>(
  config?: CacheConfig<T>,
  logger?: Logger
): CacheManager<T> {
  return new CacheManager(config, logger)
}
