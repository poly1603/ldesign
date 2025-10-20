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

    // 存入内存缓存
    this.cache.set(key, item)
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
          this.config?.onError(error as Error)
        }
      }

      if (this.config?.enableStats) {
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
        this.config?.onError(error as Error)
      }
    }

    this.resetStats()
  }

  /**
   * 按命名空间清理缓存键（前缀匹配）
   */
  async clearNamespace(namespace: string): Promise<void> {
    const prefix = `${namespace}:`
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
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
   * 确保有足够的容量
   */
  private async ensureCapacity(key: string, size: number): Promise<void> {
    // 检查最大条目数
    if (this.cache.size >= this.config?.maxSize && !this.cache.has(key)) {
      await this.evict()
    }

    // 检查内存限制
    if (this.config?.maxMemory > 0) {
      while (this.totalMemory + size > this.config?.maxMemory && this.cache.size > 0) {
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
   * 查找最久未使用的项 - 优化版
   */
  private findLRU(): string | undefined {
    if (this.cache.size === 0) return undefined

    let lruKey: string | undefined
    let lruTime = Infinity

    // 优化：限制搜索数量，避免大缓存时的性能问题
    let searchCount = 0
    const maxSearch = Math.min(this.cache.size, 20)

    for (const [key, item] of this.cache) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed
        lruKey = key
      }
      if (++searchCount >= maxSearch) break
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
    if (this.config?.strategy === CacheStrategy.LRU) {
      // 移到最后（最近使用）
      this.cache.delete(key)
      this.cache.set(key, item)
    }
  }

  /**
   * 估算对象大小 - 优化版
   * 使用更高效的内存估算算法
   */
  private estimateSize(obj: unknown, depth = 0, visited?: WeakSet<object>): number {
    // 限制递归深度，避免栈溢出
    if (depth > 3) return 100

    if (obj === null || obj === undefined) return 0
    
    const type = typeof obj
    if (type === 'string') return Math.min((obj as string).length * 2, 5000)
    if (type === 'number') return 8
    if (type === 'boolean') return 4
    if (type === 'bigint') return 16
    if (type === 'symbol') return 32
    if (type !== 'object') return 32

    // 只在必要时创建 visited 集合
    if (!visited) {
      visited = new WeakSet()
    }

    // 避免循环引用
    if (visited.has(obj as object)) return 0
    visited.add(obj as object)

    // 数组优化：采样估算
    if (Array.isArray(obj)) {
      const len = obj.length
      if (len === 0) return 24
      // 只采样前3个元素
      const sampleSize = Math.min(len, 3)
      let sampleSum = 0
      for (let i = 0; i < sampleSize; i++) {
        sampleSum += this.estimateSize(obj[i], depth + 1, visited)
      }
      return 24 + (sampleSum / sampleSize) * len
    }

    // 对象优化：快速估算
    try {
      const keys = Object.keys(obj)
      const keyCount = keys.length
      if (keyCount === 0) return 32
      
      // 只检查前5个属性
      const checkCount = Math.min(keyCount, 5)
      let size = 32 + keyCount * 16 // 基础开销
      
      for (let i = 0; i < checkCount; i++) {
        const key = keys[i]
        size += key.length * 2 + this.estimateSize((obj as any)[key], depth + 1, visited)
      }
      
      // 估算剩余属性
      if (keyCount > checkCount) {
        size += (keyCount - checkCount) * 40 // 平均每个属性40字节
      }
      
      return Math.min(size, 50000) // 限制最大大小
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
   * 清理过期项 - 优化版
   */
  private cleanup(): void {
    const now = Date.now()
    let expiredCount = 0
    const maxCleanup = Math.min(30, Math.ceil(this.cache.size * 0.2))

    // 收集并删除过期项（单次遍历）
    for (const [key, item] of this.cache) {
      if (item.ttl && now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        this.totalMemory = Math.max(0, this.totalMemory - (item.size || 0))
        expiredCount++
        
        if (expiredCount >= maxCleanup) break
      }
    }

    if (this.config?.enableStats && expiredCount > 0) {
      this.stats.expirations += expiredCount
    }

    // 检查内存压力并主动清理
    if (this.config?.maxMemory > 0 && this.totalMemory > this.config.maxMemory * 0.75) {
      const targetSize = Math.floor(this.cache.size * 0.6) // 清理到60%
      const toRemove = this.cache.size - targetSize

      if (toRemove > 0) {
        // 优化：使用迭代器避免创建临时数组
        let minAccess = Infinity
        let minKey = ''
        
        // 找出并删除最少访问的项
        for (let i = 0; i < toRemove && this.cache.size > targetSize; i++) {
          minAccess = Infinity
          minKey = ''
          
          // 找到最少访问的项（采样前20个）
          let checked = 0
          for (const [key, item] of this.cache) {
            if (item.lastAccessed < minAccess) {
              minAccess = item.lastAccessed
              minKey = key
            }
            if (++checked >= 20) break
          }
          
          if (minKey) {
            const item = this.cache.get(minKey)
            if (item) {
              this.cache.delete(minKey)
              this.totalMemory = Math.max(0, this.totalMemory - (item.size || 0))
            }
          }
        }
      }
    }

    // 更新统计
    if (this.config?.enableStats) {
      this.stats.size = this.cache.size
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

    // 清理缓存
    this.cache.clear()
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
