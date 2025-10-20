/**
 * 缓存存储实现模块
 * 
 * 提供多种缓存存储后端的实现
 */

import type { CacheStorage, ResponseData } from '../types'

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  /** 缓存的响应数据 */
  data: ResponseData<T>
  /** 缓存创建时间戳 */
  timestamp: number
  /** 生存时间（毫秒） */
  ttl: number
  /** 元数据 */
  metadata?: CacheItemMetadata
}

/**
 * 缓存项元数据
 */
export interface CacheItemMetadata {
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessed: number
  /** 访问次数 */
  accessCount: number
  /** 数据大小（字节） */
  size: number
  /** 标签 */
  tags?: string[]
  /** 依赖 */
  dependencies?: string[]
}

/**
 * 内存缓存存储实现（优化版）
 */
export class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, CacheItem>()
  private cleanupTimer?: NodeJS.Timeout
  private cleanupInterval = 60000 // 每分钟清理一次

  constructor() {
    this.startCleanup()
  }

  async get(key: string): Promise<any> {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期（延迟过期检查）
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    // 更新访问时间和计数
    if (item.metadata) {
      item.metadata.lastAccessed = Date.now()
      item.metadata.accessCount++
    }

    return item.data
  }

  async set(key: string, value: any, ttl = 300000): Promise<void> {
    const now = Date.now()
    this.cache.set(key, {
      data: value,
      timestamp: now,
      ttl,
      metadata: {
        createdAt: now,
        lastAccessed: now,
        accessCount: 0,
        size: this.calculateSize(value),
      },
    })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key)
    if (!item) return false
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  /**
   * 批量删除
   */
  async deleteBatch(keys: string[]): Promise<void> {
    for (const key of keys) {
      this.cache.delete(key)
    }
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存元数据
   */
  getMetadata(key: string): CacheItemMetadata | null {
    const item = this.cache.get(key)
    return item?.metadata || null
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired()
    }, this.cleanupInterval)
  }

  /**
   * 批量清理过期项
   */
  private cleanupExpired(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key)
    }
  }

  /**
   * 计算数据大小（粗略估计）
   */
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2 // 估算UTF-16字符占用
    } catch {
      return 0
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
    this.cache.clear()
  }
}

/**
 * LocalStorage 缓存存储实现
 */
export class LocalStorageCacheStorage implements CacheStorage {
  protected prefix: string

  constructor(prefix = 'http_cache_') {
    this.prefix = prefix
  }

  async get(key: string): Promise<any> {
    if (typeof localStorage === 'undefined') {
      return null
    }

    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) {
        return null
      }

      const parsed = JSON.parse(item) as CacheItem

      // 检查是否过期
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        await this.delete(key)
        return null
      }

      return parsed.data
    }
    catch {
      return null
    }
  }

  async set(key: string, value: any, ttl = 300000): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return
    }

    try {
      const item: CacheItem = {
        data: value,
        timestamp: Date.now(),
        ttl,
      }

      localStorage.setItem(this.prefix + key, JSON.stringify(item))
    }
    catch {
      // 存储失败，可能是空间不足
      this.handleStorageQuotaExceeded()
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return
    }

    localStorage.removeItem(this.prefix + key)
  }

  async clear(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return
    }

    // 只清除带有特定前缀的项
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key)
    }
  }

  async has(key: string): Promise<boolean> {
    if (typeof localStorage === 'undefined') {
      return false
    }
    return localStorage.getItem(this.prefix + key) !== null
  }

  /**
   * 处理存储配额超限
   */
  private handleStorageQuotaExceeded(): void {
    // 清理最旧的缓存项
    const items: { key: string; timestamp: number }[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key)!) as CacheItem
          items.push({ key, timestamp: item.timestamp })
        } catch {
          // 忽略解析错误的项
        }
      }
    }

    // 按时间戳排序，删除最旧的10%
    items.sort((a, b) => a.timestamp - b.timestamp)
    const toRemove = Math.ceil(items.length * 0.1)
    
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(items[i].key)
    }
  }
}

/**
 * SessionStorage 缓存存储实现
 */
export class SessionStorageCacheStorage extends LocalStorageCacheStorage {
  constructor(prefix = 'http_session_cache_') {
    super(prefix)
  }

  async get(key: string): Promise<any> {
    if (typeof sessionStorage === 'undefined') {
      return null
    }

    try {
      const item = sessionStorage.getItem(this.prefix + key)
      if (!item) {
        return null
      }

      const parsed = JSON.parse(item) as CacheItem

      // 检查是否过期
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        await this.delete(key)
        return null
      }

      return parsed.data
    }
    catch {
      return null
    }
  }

  async set(key: string, value: any, ttl = 300000): Promise<void> {
    if (typeof sessionStorage === 'undefined') {
      return
    }

    try {
      const item: CacheItem = {
        data: value,
        timestamp: Date.now(),
        ttl,
      }

      sessionStorage.setItem(this.prefix + key, JSON.stringify(item))
    }
    catch {
      // 存储失败
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof sessionStorage === 'undefined') {
      return
    }

    sessionStorage.removeItem(this.prefix + key)
  }

  async clear(): Promise<void> {
    if (typeof sessionStorage === 'undefined') {
      return
    }

    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }

    for (const key of keysToRemove) {
      sessionStorage.removeItem(key)
    }
  }
}

/**
 * IndexedDB 缓存存储实现
 */
export class IndexedDBCacheStorage implements CacheStorage {
  private dbName: string
  private storeName = 'cache'
  private db: IDBDatabase | null = null

  constructor(dbName = 'http_cache_db') {
    this.dbName = dbName
    this.init()
  }

  private async init(): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  async get(key: string): Promise<any> {
    if (!this.db) await this.init()
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        if (!result) {
          resolve(null)
          return
        }

        // 检查是否过期
        if (Date.now() - result.timestamp > result.ttl) {
          this.delete(key)
          resolve(null)
          return
        }

        resolve(result.data)
      }
    })
  }

  async set(key: string, value: any, ttl = 300000): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      const item = {
        key,
        data: value,
        timestamp: Date.now(),
        ttl,
      }

      const request = store.put(item)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== null
  }

  destroy(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

/**
 * 创建缓存存储
 */
export function createCacheStorage(type: 'memory' | 'local' | 'session' | 'indexeddb' = 'memory'): CacheStorage {
  switch (type) {
    case 'local':
      return new LocalStorageCacheStorage()
    case 'session':
      return new SessionStorageCacheStorage()
    case 'indexeddb':
      return new IndexedDBCacheStorage()
    case 'memory':
    default:
      return new MemoryCacheStorage()
  }
}