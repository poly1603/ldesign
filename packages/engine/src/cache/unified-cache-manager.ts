/**
 * 统一的高级缓存管理器
 * 🚀 整合了所有缓存功能，提供分层缓存、智能预加载、自动更新等特性
 *
 * 这个文件合并了原有的三个缓存管理器：
 * - cache/cache-manager.ts
 * - cache/advanced-cache.ts
 * - utils/cache-manager.ts
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
// 统一缓存管理器实现
// ============================================

export class UnifiedCacheManager<T = unknown> {
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

  constructor(config: CacheConfig<T> = {}, logger?: Logger) {
    this.logger = logger
    this.config = this.normalizeConfig(config)
    this.stats = this.initStats()

    this.initializeLayers()
    this.startCleanup()
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config: CacheConfig<T>): Required<CacheConfig<T>> {
    return {
      maxSize: config.maxSize ?? 100,  // 减少默认缓存大小从1000到100
      defaultTTL: config.defaultTTL ?? 5 * 60 * 1000,  // 设置默认TTL为5分钟
      strategy: config.strategy ?? CacheStrategy.LRU,
      enableStats: config.enableStats ?? false,  // 默认关闭统计以节省内存
      maxMemory: config.maxMemory ?? 10 * 1024 * 1024,  // 限制最大内存10MB
      cleanupInterval: config.cleanupInterval ?? 30000,  // 更频繁的清理（30秒）
      layers: config.layers ?? {},
      onEvict: config.onEvict ?? (() => {}),
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
    for (const [layerName, layer] of this.layers) {
      try {
        const value = await layer.get(key)
        if (value !== undefined) {
          // 回填到内存缓存
          this.set(key, value)

          if (this.config.enableStats) {
            this.stats.hits++
            this.updateHitRate()
          }

          return value
        }
      } catch (error) {
        this.config.onError(error as Error)
      }
    }

    // 未命中
    if (this.config.enableStats) {
      this.stats.misses++
      this.updateHitRate()
    }

    return undefined
  }

  /**
   * 从内存缓存获取
   */
  private getFromMemory(key: string): T | undefined {
    const item = this.cache.get(key)

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

    if (this.config.enableStats) {
      this.stats.hits++
      this.updateHitRate()
    }

    return item.value
  }

  /**
   * 设置缓存值
   */
  async set(key: string, value: T, ttl?: number, metadata?: Record<string, unknown>): Promise<void> {
    const effectiveTTL = ttl ?? this.config.defaultTTL
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

    // 存入内存缓存
    this.cache.set(key, item)
    this.totalMemory += size

    // 存入分层缓存
    for (const [, layer] of this.layers) {
      try {
        await layer.set(key, value, effectiveTTL)
      } catch (error) {
        this.config.onError(error as Error)
      }
    }

    if (this.config.enableStats) {
      this.stats.sets++
      this.stats.size = this.cache.size
      this.updateStats()
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    const item = this.cache.get(key)

    if (item) {
      this.cache.delete(key)
      this.totalMemory -= item.size || 0

      // 从所有层删除
      for (const [, layer] of this.layers) {
        try {
          await layer.delete(key)
        } catch (error) {
          this.config.onError(error as Error)
        }
      }

      if (this.config.enableStats) {
        this.stats.deletes++
        this.stats.size = this.cache.size
      }

      return true
    }

    return false
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    this.cache.clear()
    this.totalMemory = 0

    // 清空所有层
    for (const [, layer] of this.layers) {
      try {
        await layer.clear()
      } catch (error) {
        this.config.onError(error as Error)
      }
    }

    this.resetStats()
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

  // ============================================
  // 私有方法
  // ============================================

  /**
   * 确保有足够的容量
   */
  private async ensureCapacity(key: string, size: number): Promise<void> {
    // 检查最大条目数
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      await this.evict()
    }

    // 检查内存限制
    if (this.config.maxMemory > 0) {
      while (this.totalMemory + size > this.config.maxMemory && this.cache.size > 0) {
        await this.evict()
      }
    }
  }

  /**
   * 淘汰缓存项
   */
  private async evict(): Promise<void> {
    const strategy = this.config.strategy
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
        this.config.onEvict(keyToEvict, item.value)
        await this.delete(keyToEvict)
        this.stats.evictions++
      }
    }
  }

  /**
   * 查找最久未使用的项
   */
  private findLRU(): string | undefined {
    let lruKey: string | undefined
    let lruTime = Date.now()

    for (const [key, item] of this.cache) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed
        lruKey = key
      }
    }

    return lruKey
  }

  /**
   * 查找最少使用的项
   */
  private findLFU(): string | undefined {
    let lfuKey: string | undefined
    let lfuCount = Infinity

    for (const [key, item] of this.cache) {
      if (item.accessCount < lfuCount) {
        lfuCount = item.accessCount
        lfuKey = key
      }
    }

    return lfuKey
  }

  /**
   * 查找已过期的项
   */
  private findExpired(): string | undefined {
    const now = Date.now()

    for (const [key, item] of this.cache) {
      if (item.ttl && now - item.timestamp > item.ttl) {
        return key
      }
    }

    return undefined
  }

  /**
   * 更新项顺序
   */
  private updateItemOrder(key: string, item: CacheItem<T>): void {
    if (this.config.strategy === CacheStrategy.LRU) {
      // 移到最后（最近使用）
      this.cache.delete(key)
      this.cache.set(key, item)
    }
  }

  /**
   * 估算对象大小
   */
  private estimateSize(obj: unknown): number {
    if (obj === null || obj === undefined) return 0
    if (typeof obj === 'string') return obj.length * 2
    if (typeof obj === 'number') return 8
    if (typeof obj === 'boolean') return 4

    try {
      return JSON.stringify(obj).length * 2
    } catch {
      return 1024 // 默认1KB
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
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup()
      }, this.config.cleanupInterval)
    }
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache) {
      if (item.ttl && now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.delete(key)
      this.stats.expirations++
    })
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    for (const timer of this.updateTimers.values()) {
      clearInterval(timer)
    }
    this.updateTimers.clear()

    this.cache.clear()
    this.layers.clear()
    this.preloadQueue.clear()
  }
}

// ============================================
// 存储层抽象类
// ============================================

abstract class StorageLayer<T> {
  constructor(protected config: any) {}

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
    const expires = ttl ? Date.now() + ttl : 0
    this.storage.set(key, { value, expires })
  }

  async delete(key: string): Promise<boolean> {
    return this.storage.delete(key)
  }

  async clear(): Promise<void> {
    this.storage.clear()
  }
}

// ============================================
// LocalStorage 存储层
// ============================================

class LocalStorageLayer<T> extends StorageLayer<T> {
  private prefix: string

  constructor(config: any) {
    super(config)
    this.prefix = config.prefix || 'cache:'
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

  constructor(config: any) {
    super(config)
    this.prefix = config.prefix || 'cache:'
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

  constructor(config: any) {
    super(config)
    this.dbName = config.dbName || 'CacheDB'
    this.storeName = config.storeName || 'cache'
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

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
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

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const expires = ttl ? Date.now() + ttl : 0

      store.put({ key, value, expires })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => resolve()
    })
  }

  async delete(key: string): Promise<boolean> {
    if (!this.db) await this.initDB()

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      store.delete(key)

      transaction.oncomplete = () => resolve(true)
      transaction.onerror = () => resolve(false)
    })
  }

  async clear(): Promise<void> {
    if (!this.db) await this.initDB()

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
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
    private parent: UnifiedCacheManager<T>,
    private namespace: string
  ) {}

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
    // 清空命名空间下的所有键
    // 这里需要实现命名空间清理逻辑
  }
}

// ============================================
// 导出
// ============================================

export function createUnifiedCacheManager<T = unknown>(
  config?: CacheConfig<T>,
  logger?: Logger
): UnifiedCacheManager<T> {
  return new UnifiedCacheManager(config, logger)
}

// 向后兼容的别名
export { UnifiedCacheManager as CacheManager }
export { createUnifiedCacheManager as createCacheManager }
