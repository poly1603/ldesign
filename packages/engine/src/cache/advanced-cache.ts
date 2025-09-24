/**
 * 高级缓存管理器
 * 🚀 提供分层缓存、智能预加载、自动更新等高级特性
 */

import type {
  CacheItem,
  CacheOptions,
  CacheStorage,
  MemoryCacheConfig,
  LocalStorageCacheConfig,
  IndexedDBCacheConfig
} from '../types/cache'

/**
 * 分层缓存配置
 */
export interface LayeredCacheConfig {
  /** 内存缓存配置 */
  memory?: {
    enabled: boolean
    maxSize: number
    ttl: number
  }
  /** 本地存储缓存配置 */
  localStorage?: {
    enabled: boolean
    prefix: string
    maxSize: number
    ttl: number
  }
  /** 会话存储缓存配置 */
  sessionStorage?: {
    enabled: boolean
    prefix: string
    maxSize: number
    ttl: number
  }
  /** IndexedDB 缓存配置 */
  indexedDB?: {
    enabled: boolean
    dbName: string
    storeName: string
    maxSize: number
    ttl: number
  }
}

/**
 * 缓存预加载配置
 */
export interface PreloadConfig {
  /** 预加载的键列表 */
  keys?: string[]
  /** 预加载函数 */
  loader?: (key: string) => Promise<unknown>
  /** 是否在启动时预加载 */
  onStartup?: boolean
  /** 预加载优先级 */
  priority?: 'high' | 'normal' | 'low'
}

/**
 * 缓存自动更新配置
 */
export interface AutoUpdateConfig {
  /** 更新间隔（毫秒） */
  interval: number
  /** 更新函数 */
  updater: (key: string, value: unknown) => Promise<unknown>
  /** 更新失败时是否保留旧值 */
  keepOnError?: boolean
  /** 最大重试次数 */
  maxRetries?: number
}

/**
 * 缓存统计信息
 */
export interface CacheStatistics {
  /** 总请求次数 */
  requests: number
  /** 命中次数 */
  hits: number
  /** 未命中次数 */
  misses: number
  /** 命中率 */
  hitRate: number
  /** 平均响应时间（毫秒） */
  avgResponseTime: number
  /** 存储使用量 */
  storageUsed: number
  /** 各层缓存统计 */
  layers: Map<string, {
    hits: number
    misses: number
    size: number
  }>
}

/**
 * 高级缓存管理器
 */
export class AdvancedCacheManager {
  private layers: Map<string, CacheStorage> = new Map()
  private preloadQueue: Set<string> = new Set()
  private updateTimers: Map<string, NodeJS.Timeout> = new Map()
  private statistics: CacheStatistics = {
    requests: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    avgResponseTime: 0,
    storageUsed: 0,
    layers: new Map()
  }
  private responseTimeHistory: number[] = []

  constructor(
    private config: LayeredCacheConfig = {},
    private preloadConfig?: PreloadConfig,
    private autoUpdateConfig?: AutoUpdateConfig
  ) {
    this.initializeLayers()
    if (preloadConfig?.onStartup) {
      this.startPreloading()
    }
  }

  /**
   * 初始化缓存层
   */
  private initializeLayers(): void {
    // 内存缓存层
    if (this.config.memory?.enabled) {
      this.layers.set('memory', new MemoryCache(this.config.memory))
      this.statistics.layers.set('memory', { hits: 0, misses: 0, size: 0 })
    }

    // 本地存储缓存层
    if (this.config.localStorage?.enabled && typeof window !== 'undefined') {
      this.layers.set('localStorage', new LocalStorageCache(this.config.localStorage))
      this.statistics.layers.set('localStorage', { hits: 0, misses: 0, size: 0 })
    }

    // 会话存储缓存层
    if (this.config.sessionStorage?.enabled && typeof window !== 'undefined') {
      this.layers.set('sessionStorage', new SessionStorageCache(this.config.sessionStorage))
      this.statistics.layers.set('sessionStorage', { hits: 0, misses: 0, size: 0 })
    }

    // IndexedDB 缓存层
    if (this.config.indexedDB?.enabled && typeof window !== 'undefined') {
      this.layers.set('indexedDB', new IndexedDBCache(this.config.indexedDB))
      this.statistics.layers.set('indexedDB', { hits: 0, misses: 0, size: 0 })
    }
  }

  /**
   * 获取缓存值（支持分层查找）
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const startTime = performance.now()
    this.statistics.requests++

    // 按优先级从各层查找
    const layerOrder = ['memory', 'sessionStorage', 'localStorage', 'indexedDB']

    for (const layerName of layerOrder) {
      const layer = this.layers.get(layerName)
      if (!layer) continue

      const value = await layer.get<T>(key)
      if (value !== null) {
        // 更新统计
        this.statistics.hits++
        const layerStats = this.statistics.layers.get(layerName)
        if (layerStats) layerStats.hits++

        // 将值写入更高优先级的层（回填）
        await this.backfillToUpperLayers(key, value, layerName)

        // 记录响应时间
        this.recordResponseTime(performance.now() - startTime)

        return value
      } else {
        const layerStats = this.statistics.layers.get(layerName)
        if (layerStats) layerStats.misses++
      }
    }

    // 未命中
    this.statistics.misses++
    this.recordResponseTime(performance.now() - startTime)

    // 尝试预加载
    if (this.preloadConfig?.loader) {
      return await this.loadAndCache(key)
    }

    return null
  }

  /**
   * 设置缓存值（写入所有层）
   */
  async set<T = unknown>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<void> {
    // 写入所有启用的层
    const promises: Promise<void>[] = []

    for (const layer of this.layers.values()) {
      promises.push(layer.set(key, value, options))
    }

    await Promise.all(promises)

    // 设置自动更新
    if (this.autoUpdateConfig) {
      this.scheduleAutoUpdate(key, value)
    }

    // 更新存储使用量
    await this.updateStorageUsage()
  }

  /**
   * 删除缓存值（从所有层删除）
   */
  async remove(key: string): Promise<void> {
    const promises: Promise<void>[] = []

    for (const layer of this.layers.values()) {
      promises.push(layer.remove(key))
    }

    await Promise.all(promises)

    // 取消自动更新
    this.cancelAutoUpdate(key)

    // 更新存储使用量
    await this.updateStorageUsage()
  }

  /**
   * 清空缓存（清空所有层）
   */
  async clear(): Promise<void> {
    const promises: Promise<void>[] = []

    for (const layer of this.layers.values()) {
      promises.push(layer.clear())
    }

    await Promise.all(promises)

    // 取消所有自动更新
    for (const timer of this.updateTimers.values()) {
      clearTimeout(timer)
    }
    this.updateTimers.clear()

    // 重置统计
    this.resetStatistics()
  }

  /**
   * 回填到更高优先级的层
   */
  private async backfillToUpperLayers(
    key: string,
    value: unknown,
    foundLayer: string
  ): Promise<void> {
    const layerOrder = ['memory', 'sessionStorage', 'localStorage', 'indexedDB']
    const foundIndex = layerOrder.indexOf(foundLayer)

    // 写入更高优先级的层
    for (let i = 0; i < foundIndex; i++) {
      const layer = this.layers.get(layerOrder[i])
      if (layer) {
        await layer.set(key, value)
      }
    }
  }

  /**
   * 加载并缓存数据
   */
  private async loadAndCache<T>(key: string): Promise<T | null> {
    if (!this.preloadConfig?.loader) return null

    try {
      const value = await this.preloadConfig.loader(key) as T
      await this.set(key, value)
      return value
    } catch (error) {
      console.error(`Failed to load and cache key: ${key}`, error)
      return null
    }
  }

  /**
   * 开始预加载
   */
  private async startPreloading(): Promise<void> {
    if (!this.preloadConfig?.keys || !this.preloadConfig.loader) return

    const priority = this.preloadConfig.priority || 'normal'
    const delay = priority === 'high' ? 0 : priority === 'normal' ? 100 : 500

    for (const key of this.preloadConfig.keys) {
      this.preloadQueue.add(key)

      setTimeout(async () => {
        if (this.preloadQueue.has(key)) {
          await this.loadAndCache(key)
          this.preloadQueue.delete(key)
        }
      }, delay)
    }
  }

  /**
   * 设置自动更新
   */
  private scheduleAutoUpdate(key: string, initialValue: unknown): void {
    if (!this.autoUpdateConfig) return

    // 取消之前的更新
    this.cancelAutoUpdate(key)

    // 设置新的更新定时器
    const timer = setInterval(async () => {
      try {
        const newValue = await this.autoUpdateConfig!.updater(key, initialValue)
        await this.set(key, newValue)
      } catch (error) {
        console.error(`Failed to auto-update key: ${key}`, error)

        if (!this.autoUpdateConfig!.keepOnError) {
          await this.remove(key)
        }
      }
    }, this.autoUpdateConfig.interval)

    this.updateTimers.set(key, timer)
  }

  /**
   * 取消自动更新
   */
  private cancelAutoUpdate(key: string): void {
    const timer = this.updateTimers.get(key)
    if (timer) {
      clearInterval(timer)
      this.updateTimers.delete(key)
    }
  }

  /**
   * 记录响应时间
   */
  private recordResponseTime(time: number): void {
    this.responseTimeHistory.push(time)

    // 保留最近1000条记录
    if (this.responseTimeHistory.length > 1000) {
      this.responseTimeHistory.shift()
    }

    // 计算平均响应时间
    const sum = this.responseTimeHistory.reduce((a, b) => a + b, 0)
    this.statistics.avgResponseTime = sum / this.responseTimeHistory.length

    // 计算命中率
    const total = this.statistics.hits + this.statistics.misses
    this.statistics.hitRate = total > 0 ? this.statistics.hits / total : 0
  }

  /**
   * 更新存储使用量
   */
  private async updateStorageUsage(): Promise<void> {
    let totalSize = 0

    for (const [layerName, layer] of this.layers) {
      const size = await layer.getSize()
      totalSize += size

      const layerStats = this.statistics.layers.get(layerName)
      if (layerStats) {
        layerStats.size = size
      }
    }

    this.statistics.storageUsed = totalSize
  }

  /**
   * 重置统计信息
   */
  private resetStatistics(): void {
    this.statistics = {
      requests: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      avgResponseTime: 0,
      storageUsed: 0,
      layers: new Map()
    }

    for (const layerName of this.layers.keys()) {
      this.statistics.layers.set(layerName, { hits: 0, misses: 0, size: 0 })
    }

    this.responseTimeHistory = []
  }

  /**
   * 获取统计信息
   */
  getStatistics(): CacheStatistics {
    return { ...this.statistics }
  }

  /**
   * 预热缓存
   */
  async warmUp(keys: string[]): Promise<void> {
    if (!this.preloadConfig?.loader) return

    const promises = keys.map(key => this.loadAndCache(key))
    await Promise.all(promises)
  }

  /**
   * 批量获取
   */
  async getBatch<T = unknown>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>()
    const promises = keys.map(async key => {
      const value = await this.get<T>(key)
      result.set(key, value)
    })

    await Promise.all(promises)
    return result
  }

  /**
   * 批量设置
   */
  async setBatch<T = unknown>(
    entries: Array<[string, T]>,
    options?: CacheOptions
  ): Promise<void> {
    const promises = entries.map(([key, value]) =>
      this.set(key, value, options)
    )
    await Promise.all(promises)
  }
}

/**
 * 内存缓存实现
 */
class MemoryCache implements CacheStorage {
  private cache = new Map<string, CacheItem>()
  private config: MemoryCacheConfig & { prefix: string }

  constructor(config: MemoryCacheConfig) {
    this.config = {
      prefix: 'memory',
      maxSize: 1000,
      ttl: 300000,
      compression: false,
      encryption: false,
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      gcInterval: 60000,
      ...config
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查是否过期
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || this.config.ttl
    const expiry = ttl ? Date.now() + ttl : undefined

    this.cache.set(key, {
      value,
      expiry,
      metadata: options?.metadata
    })

    // 检查大小限制
    if (this.config.maxSize && this.cache.size > this.config.maxSize) {
      // 删除最旧的项
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async getSize(): Promise<number> {
    // 粗略估算内存使用量
    let size = 0
    for (const item of this.cache.values()) {
      size += JSON.stringify(item).length
    }
    return size
  }
}

/**
 * 本地存储缓存实现
 */
class LocalStorageCache implements CacheStorage {
  private config: LocalStorageCacheConfig & { prefix: string }

  constructor(config: LocalStorageCacheConfig) {
    this.config = {
      prefix: 'ldesign',
      maxSize: 1000,
      ttl: 300000,
      compression: false,
      encryption: false,
      storageKey: 'cache',
      quotaLimit: 5 * 1024 * 1024, // 5MB
      ...config
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const prefixedKey = `${this.config.prefix}_${key}`
    const item = localStorage.getItem(prefixedKey)

    if (!item) return null

    try {
      const parsed = JSON.parse(item) as CacheItem

      // 检查是否过期
      if (parsed.expiry && parsed.expiry < Date.now()) {
        localStorage.removeItem(prefixedKey)
        return null
      }

      return parsed.value as T
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const prefixedKey = `${this.config.prefix}_${key}`
    const ttl = options?.ttl || this.config.ttl
    const expiry = ttl ? Date.now() + ttl : undefined

    const item: CacheItem = {
      value,
      expiry,
      metadata: options?.metadata
    }

    localStorage.setItem(prefixedKey, JSON.stringify(item))
  }

  async remove(key: string): Promise<void> {
    const prefixedKey = `${this.config.prefix}_${key}`
    localStorage.removeItem(prefixedKey)
  }

  async clear(): Promise<void> {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.config.prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  async getSize(): Promise<number> {
    let size = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.config.prefix)) {
        const value = localStorage.getItem(key)
        if (value) size += value.length
      }
    }

    return size
  }
}

/**
 * 会话存储缓存实现
 */
class SessionStorageCache implements CacheStorage {
  private config: LocalStorageCacheConfig & { prefix: string }

  constructor(config: LocalStorageCacheConfig) {
    this.config = {
      prefix: 'ldesign',
      maxSize: 1000,
      ttl: 300000,
      compression: false,
      encryption: false,
      storageKey: 'cache',
      quotaLimit: 5 * 1024 * 1024, // 5MB
      ...config
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const prefixedKey = `${this.config.prefix}_${key}`
    const item = sessionStorage.getItem(prefixedKey)

    if (!item) return null

    try {
      const parsed = JSON.parse(item) as CacheItem

      // 检查是否过期
      if (parsed.expiry && parsed.expiry < Date.now()) {
        sessionStorage.removeItem(prefixedKey)
        return null
      }

      return parsed.value as T
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const prefixedKey = `${this.config.prefix}_${key}`
    const ttl = options?.ttl || this.config.ttl
    const expiry = ttl ? Date.now() + ttl : undefined

    const item: CacheItem = {
      value,
      expiry,
      metadata: options?.metadata
    }

    sessionStorage.setItem(prefixedKey, JSON.stringify(item))
  }

  async remove(key: string): Promise<void> {
    const prefixedKey = `${this.config.prefix}_${key}`
    sessionStorage.removeItem(prefixedKey)
  }

  async clear(): Promise<void> {
    const keysToRemove: string[] = []

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(this.config.prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key))
  }

  async getSize(): Promise<number> {
    let size = 0

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(this.config.prefix)) {
        const value = sessionStorage.getItem(key)
        if (value) size += value.length
      }
    }

    return size
  }
}

/**
 * IndexedDB 缓存实现（简化版）
 */
class IndexedDBCache implements CacheStorage {
  private db: IDBDatabase | null = null
  private config: IndexedDBCacheConfig & { prefix: string; dbName: string; storeName: string }

  constructor(config: IndexedDBCacheConfig) {
    this.config = {
      prefix: 'ldesign',
      maxSize: 1000,
      ttl: 300000,
      compression: false,
      encryption: false,
      dbName: 'ldesign-cache',
      storeName: 'cache',
      version: 1,
      ...config
    }
    this.initDB()
  }

  private async initDB(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          db.createObjectStore(this.config.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readonly')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        if (!result) {
          resolve(null)
          return
        }

        // 检查是否过期
        if (result.expiry && result.expiry < Date.now()) {
          this.remove(key)
          resolve(null)
          return
        }

        resolve(result.value as T)
      }
    })
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.db) return

    const ttl = options?.ttl || this.config.ttl
    const expiry = ttl ? Date.now() + ttl : undefined

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.put({
        key,
        value,
        expiry,
        metadata: options?.metadata
      })

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async remove(key: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite')
      const store = transaction.objectStore(this.config.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getSize(): Promise<number> {
    // IndexedDB 没有直接的方法获取存储大小
    // 这里返回一个估算值
    return 0
  }
}
