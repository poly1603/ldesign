/**
 * 高级缓存管理系统
 * 支持多层缓存、智能失效、压缩存储等高级功能
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import chalk from 'chalk'

export interface CacheConfig {
  /** 缓存策略 */
  strategy: CacheStrategy
  /** 最大缓存大小 (MB) */
  maxSize: number
  /** 默认 TTL (毫秒) */
  defaultTTL: number
  /** 是否启用压缩 */
  enableCompression: boolean
  /** 是否启用加密 */
  enableEncryption: boolean
  /** 存储适配器 */
  storageAdapters: StorageAdapter[]
  /** 缓存层级 */
  layers: CacheLayer[]
  /** 性能监控 */
  enableMetrics: boolean
}

export type CacheStrategy = 
  | 'lru'        // 最近最少使用
  | 'lfu'        // 最少使用频率
  | 'fifo'       // 先进先出
  | 'lifo'       // 后进先出
  | 'ttl'        // 基于时间
  | 'adaptive'   // 自适应

export interface StorageAdapter {
  name: string
  type: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB' | 'redis' | 'custom'
  config: Record<string, any>
  priority: number
}

export interface CacheLayer {
  name: string
  adapter: string
  maxSize: number
  ttl: number
  compression: boolean
  encryption: boolean
}

export interface CacheItem<T = any> {
  key: string
  value: T
  metadata: CacheMetadata
}

export interface CacheMetadata {
  createdAt: number
  updatedAt: number
  expiresAt: number
  accessCount: number
  lastAccessed: number
  size: number
  compressed: boolean
  encrypted: boolean
  tags: string[]
  dependencies: string[]
}

export interface CacheMetrics {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  totalSize: number
  itemCount: number
  hitRate: number
  averageAccessTime: number
}

export class AdvancedCacheManager {
  private config: CacheConfig
  private adapters: Map<string, any> = new Map()
  private layers: Map<string, CacheLayer> = new Map()
  private metrics: CacheMetrics
  private compressionWorker?: Worker
  private encryptionKey?: CryptoKey

  constructor(config: CacheConfig) {
    this.config = config
    this.metrics = this.initializeMetrics()
    this.initializeAdapters()
    this.initializeLayers()
    this.initializeCompression()
    this.initializeEncryption()
  }

  /**
   * 初始化指标
   */
  private initializeMetrics(): CacheMetrics {
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalSize: 0,
      itemCount: 0,
      hitRate: 0,
      averageAccessTime: 0,
    }
  }

  /**
   * 初始化存储适配器
   */
  private async initializeAdapters(): Promise<void> {
    console.log(chalk.blue('💾 初始化缓存适配器...'))

    for (const adapterConfig of this.config.storageAdapters) {
      try {
        const adapter = await this.createAdapter(adapterConfig)
        this.adapters.set(adapterConfig.name, adapter)
        console.log(chalk.green(`✅ ${adapterConfig.name} 适配器初始化成功`))
      } catch (error) {
        console.error(chalk.red(`❌ ${adapterConfig.name} 适配器初始化失败:`), error)
      }
    }
  }

  /**
   * 创建存储适配器
   */
  private async createAdapter(config: StorageAdapter): Promise<any> {
    switch (config.type) {
      case 'memory':
        return this.createMemoryAdapter(config)
      case 'localStorage':
        return this.createLocalStorageAdapter(config)
      case 'sessionStorage':
        return this.createSessionStorageAdapter(config)
      case 'indexedDB':
        return this.createIndexedDBAdapter(config)
      case 'redis':
        return this.createRedisAdapter(config)
      case 'custom':
        return this.createCustomAdapter(config)
      default:
        throw new Error(`不支持的存储适配器类型: ${config.type}`)
    }
  }

  /**
   * 创建内存适配器
   */
  private createMemoryAdapter(config: StorageAdapter) {
    const storage = new Map<string, CacheItem>()

    return {
      name: config.name,
      type: 'memory',
      
      async get(key: string): Promise<CacheItem | null> {
        const item = storage.get(key)
        if (item && this.isExpired(item)) {
          storage.delete(key)
          return null
        }
        return item || null
      },

      async set(key: string, item: CacheItem): Promise<void> {
        storage.set(key, item)
      },

      async delete(key: string): Promise<boolean> {
        return storage.delete(key)
      },

      async clear(): Promise<void> {
        storage.clear()
      },

      async keys(): Promise<string[]> {
        return Array.from(storage.keys())
      },

      async size(): Promise<number> {
        return storage.size
      },
    }
  }

  /**
   * 创建 localStorage 适配器
   */
  private createLocalStorageAdapter(config: StorageAdapter) {
    const prefix = config.config.prefix || 'ldesign_cache_'

    return {
      name: config.name,
      type: 'localStorage',

      async get(key: string): Promise<CacheItem | null> {
        try {
          const data = localStorage.getItem(prefix + key)
          if (!data) return null

          const item: CacheItem = JSON.parse(data)
          if (this.isExpired(item)) {
            localStorage.removeItem(prefix + key)
            return null
          }
          return item
        } catch {
          return null
        }
      },

      async set(key: string, item: CacheItem): Promise<void> {
        try {
          localStorage.setItem(prefix + key, JSON.stringify(item))
        } catch (error) {
          // 处理存储空间不足
          if (error instanceof DOMException && error.code === 22) {
            await this.evictLRU()
            localStorage.setItem(prefix + key, JSON.stringify(item))
          }
        }
      },

      async delete(key: string): Promise<boolean> {
        const existed = localStorage.getItem(prefix + key) !== null
        localStorage.removeItem(prefix + key)
        return existed
      },

      async clear(): Promise<void> {
        const keys = Object.keys(localStorage).filter(key => key.startsWith(prefix))
        keys.forEach(key => localStorage.removeItem(key))
      },

      async keys(): Promise<string[]> {
        return Object.keys(localStorage)
          .filter(key => key.startsWith(prefix))
          .map(key => key.substring(prefix.length))
      },

      async size(): Promise<number> {
        return Object.keys(localStorage).filter(key => key.startsWith(prefix)).length
      },
    }
  }

  /**
   * 创建 IndexedDB 适配器
   */
  private createIndexedDBAdapter(config: StorageAdapter) {
    const dbName = config.config.dbName || 'ldesign_cache'
    const storeName = config.config.storeName || 'cache_store'
    let db: IDBDatabase

    const openDB = (): Promise<IDBDatabase> => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1)
        
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
        
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'key' })
          }
        }
      })
    }

    return {
      name: config.name,
      type: 'indexedDB',

      async init() {
        db = await openDB()
      },

      async get(key: string): Promise<CacheItem | null> {
        if (!db) await this.init()
        
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readonly')
          const store = transaction.objectStore(storeName)
          const request = store.get(key)

          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            const item = request.result
            if (item && this.isExpired(item)) {
              this.delete(key)
              resolve(null)
            } else {
              resolve(item || null)
            }
          }
        })
      },

      async set(key: string, item: CacheItem): Promise<void> {
        if (!db) await this.init()

        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite')
          const store = transaction.objectStore(storeName)
          const request = store.put({ ...item, key })

          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve()
        })
      },

      async delete(key: string): Promise<boolean> {
        if (!db) await this.init()

        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite')
          const store = transaction.objectStore(storeName)
          const request = store.delete(key)

          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(true)
        })
      },

      async clear(): Promise<void> {
        if (!db) await this.init()

        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite')
          const store = transaction.objectStore(storeName)
          const request = store.clear()

          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve()
        })
      },

      async keys(): Promise<string[]> {
        if (!db) await this.init()

        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readonly')
          const store = transaction.objectStore(storeName)
          const request = store.getAllKeys()

          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(request.result as string[])
        })
      },

      async size(): Promise<number> {
        if (!db) await this.init()

        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readonly')
          const store = transaction.objectStore(storeName)
          const request = store.count()

          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(request.result)
        })
      },
    }
  }

  /**
   * 创建 Redis 适配器
   */
  private createRedisAdapter(config: StorageAdapter) {
    // 这里需要 Redis 客户端库
    // 实际实现中应该使用 ioredis 或其他 Redis 客户端
    return {
      name: config.name,
      type: 'redis',
      
      async get(key: string): Promise<CacheItem | null> {
        // Redis 实现
        return null
      },

      async set(key: string, item: CacheItem): Promise<void> {
        // Redis 实现
      },

      async delete(key: string): Promise<boolean> {
        // Redis 实现
        return false
      },

      async clear(): Promise<void> {
        // Redis 实现
      },

      async keys(): Promise<string[]> {
        // Redis 实现
        return []
      },

      async size(): Promise<number> {
        // Redis 实现
        return 0
      },
    }
  }

  /**
   * 创建自定义适配器
   */
  private createCustomAdapter(config: StorageAdapter) {
    return config.config.adapter || {
      name: config.name,
      type: 'custom',
      get: async () => null,
      set: async () => {},
      delete: async () => false,
      clear: async () => {},
      keys: async () => [],
      size: async () => 0,
    }
  }

  /**
   * 初始化缓存层级
   */
  private initializeLayers(): void {
    for (const layer of this.config.layers) {
      this.layers.set(layer.name, layer)
    }
  }

  /**
   * 初始化压缩
   */
  private async initializeCompression(): Promise<void> {
    if (this.config.enableCompression && typeof Worker !== 'undefined') {
      try {
        // 创建压缩 Worker
        const workerCode = `
          self.onmessage = function(e) {
            const { action, data, id } = e.data;
            
            if (action === 'compress') {
              // 简单的压缩实现（实际应该使用更好的算法）
              const compressed = JSON.stringify(data);
              self.postMessage({ id, result: compressed });
            } else if (action === 'decompress') {
              try {
                const decompressed = JSON.parse(data);
                self.postMessage({ id, result: decompressed });
              } catch (error) {
                self.postMessage({ id, error: error.message });
              }
            }
          };
        `
        
        const blob = new Blob([workerCode], { type: 'application/javascript' })
        this.compressionWorker = new Worker(URL.createObjectURL(blob))
      } catch (error) {
        console.warn(chalk.yellow('⚠️ 压缩 Worker 初始化失败，使用同步压缩'))
      }
    }
  }

  /**
   * 初始化加密
   */
  private async initializeEncryption(): Promise<void> {
    if (this.config.enableEncryption && typeof crypto !== 'undefined') {
      try {
        this.encryptionKey = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        )
      } catch (error) {
        console.warn(chalk.yellow('⚠️ 加密密钥生成失败'))
      }
    }
  }

  /**
   * 获取缓存项
   */
  async get<T = any>(key: string, options: { layer?: string } = {}): Promise<T | null> {
    const startTime = performance.now()

    try {
      const layers = options.layer 
        ? [this.layers.get(options.layer)!]
        : Array.from(this.layers.values()).sort((a, b) => a.name.localeCompare(b.name))

      for (const layer of layers) {
        const adapter = this.adapters.get(layer.adapter)
        if (!adapter) continue

        const item = await adapter.get(key)
        if (item) {
          // 更新访问统计
          item.metadata.accessCount++
          item.metadata.lastAccessed = Date.now()
          await adapter.set(key, item)

          // 解压缩
          let value = item.value
          if (item.metadata.compressed) {
            value = await this.decompress(value)
          }

          // 解密
          if (item.metadata.encrypted) {
            value = await this.decrypt(value)
          }

          this.metrics.hits++
          this.updateAverageAccessTime(performance.now() - startTime)
          return value
        }
      }

      this.metrics.misses++
      return null
    } catch (error) {
      console.error(chalk.red('❌ 缓存获取失败:'), error)
      this.metrics.misses++
      return null
    }
  }

  /**
   * 设置缓存项
   */
  async set<T = any>(
    key: string, 
    value: T, 
    options: {
      ttl?: number
      layer?: string
      tags?: string[]
      dependencies?: string[]
    } = {}
  ): Promise<void> {
    try {
      const layer = options.layer 
        ? this.layers.get(options.layer)!
        : Array.from(this.layers.values())[0]

      if (!layer) {
        throw new Error('没有可用的缓存层')
      }

      const adapter = this.adapters.get(layer.adapter)
      if (!adapter) {
        throw new Error(`缓存适配器不存在: ${layer.adapter}`)
      }

      let processedValue = value

      // 加密
      if (layer.encryption && this.encryptionKey) {
        processedValue = await this.encrypt(processedValue)
      }

      // 压缩
      if (layer.compression) {
        processedValue = await this.compress(processedValue)
      }

      const now = Date.now()
      const ttl = options.ttl || layer.ttl || this.config.defaultTTL
      
      const item: CacheItem<T> = {
        key,
        value: processedValue,
        metadata: {
          createdAt: now,
          updatedAt: now,
          expiresAt: now + ttl,
          accessCount: 0,
          lastAccessed: now,
          size: this.calculateSize(processedValue),
          compressed: layer.compression,
          encrypted: layer.encryption,
          tags: options.tags || [],
          dependencies: options.dependencies || [],
        },
      }

      await adapter.set(key, item)
      this.metrics.sets++
      this.metrics.itemCount++
      this.metrics.totalSize += item.metadata.size

      // 检查缓存大小限制
      await this.checkSizeLimit(layer)
    } catch (error) {
      console.error(chalk.red('❌ 缓存设置失败:'), error)
      throw error
    }
  }

  /**
   * 删除缓存项
   */
  async delete(key: string, options: { layer?: string } = {}): Promise<boolean> {
    try {
      const layers = options.layer 
        ? [this.layers.get(options.layer)!]
        : Array.from(this.layers.values())

      let deleted = false

      for (const layer of layers) {
        const adapter = this.adapters.get(layer.adapter)
        if (!adapter) continue

        const item = await adapter.get(key)
        if (item) {
          this.metrics.totalSize -= item.metadata.size
          this.metrics.itemCount--
        }

        if (await adapter.delete(key)) {
          deleted = true
        }
      }

      if (deleted) {
        this.metrics.deletes++
      }

      return deleted
    } catch (error) {
      console.error(chalk.red('❌ 缓存删除失败:'), error)
      return false
    }
  }

  /**
   * 清空缓存
   */
  async clear(options: { layer?: string } = {}): Promise<void> {
    try {
      const layers = options.layer 
        ? [this.layers.get(options.layer)!]
        : Array.from(this.layers.values())

      for (const layer of layers) {
        const adapter = this.adapters.get(layer.adapter)
        if (adapter) {
          await adapter.clear()
        }
      }

      this.metrics.totalSize = 0
      this.metrics.itemCount = 0
    } catch (error) {
      console.error(chalk.red('❌ 缓存清空失败:'), error)
      throw error
    }
  }

  /**
   * 根据标签删除
   */
  async deleteByTag(tag: string): Promise<number> {
    let deletedCount = 0

    for (const layer of this.layers.values()) {
      const adapter = this.adapters.get(layer.adapter)
      if (!adapter) continue

      const keys = await adapter.keys()
      
      for (const key of keys) {
        const item = await adapter.get(key)
        if (item && item.metadata.tags.includes(tag)) {
          await this.delete(key, { layer: layer.name })
          deletedCount++
        }
      }
    }

    return deletedCount
  }

  /**
   * 检查项目是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.metadata.expiresAt
  }

  /**
   * 压缩数据
   */
  private async compress(data: any): Promise<any> {
    if (this.compressionWorker) {
      return new Promise((resolve, reject) => {
        const id = Math.random().toString(36)
        
        const handler = (e: MessageEvent) => {
          if (e.data.id === id) {
            this.compressionWorker!.removeEventListener('message', handler)
            if (e.data.error) {
              reject(new Error(e.data.error))
            } else {
              resolve(e.data.result)
            }
          }
        }

        this.compressionWorker.addEventListener('message', handler)
        this.compressionWorker.postMessage({ action: 'compress', data, id })
      })
    } else {
      // 同步压缩
      return JSON.stringify(data)
    }
  }

  /**
   * 解压缩数据
   */
  private async decompress(data: any): Promise<any> {
    if (this.compressionWorker) {
      return new Promise((resolve, reject) => {
        const id = Math.random().toString(36)
        
        const handler = (e: MessageEvent) => {
          if (e.data.id === id) {
            this.compressionWorker!.removeEventListener('message', handler)
            if (e.data.error) {
              reject(new Error(e.data.error))
            } else {
              resolve(e.data.result)
            }
          }
        }

        this.compressionWorker.addEventListener('message', handler)
        this.compressionWorker.postMessage({ action: 'decompress', data, id })
      })
    } else {
      // 同步解压缩
      return JSON.parse(data)
    }
  }

  /**
   * 加密数据
   */
  private async encrypt(data: any): Promise<any> {
    if (!this.encryptionKey) return data

    try {
      const encoder = new TextEncoder()
      const dataString = JSON.stringify(data)
      const dataBuffer = encoder.encode(dataString)
      
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        dataBuffer
      )

      return {
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️ 加密失败，使用原始数据'))
      return data
    }
  }

  /**
   * 解密数据
   */
  private async decrypt(encryptedData: any): Promise<any> {
    if (!this.encryptionKey || !encryptedData.encrypted) return encryptedData

    try {
      const encrypted = new Uint8Array(encryptedData.encrypted)
      const iv = new Uint8Array(encryptedData.iv)
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encrypted
      )

      const decoder = new TextDecoder()
      const dataString = decoder.decode(decrypted)
      return JSON.parse(dataString)
    } catch (error) {
      console.warn(chalk.yellow('⚠️ 解密失败'))
      return encryptedData
    }
  }

  /**
   * 计算数据大小
   */
  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size
  }

  /**
   * 检查大小限制
   */
  private async checkSizeLimit(layer: CacheLayer): Promise<void> {
    if (this.metrics.totalSize > layer.maxSize * 1024 * 1024) {
      await this.evictItems(layer)
    }
  }

  /**
   * 驱逐缓存项
   */
  private async evictItems(layer: CacheLayer): Promise<void> {
    const adapter = this.adapters.get(layer.adapter)
    if (!adapter) return

    const keys = await adapter.keys()
    const items: Array<{ key: string; item: CacheItem }> = []

    for (const key of keys) {
      const item = await adapter.get(key)
      if (item) {
        items.push({ key, item })
      }
    }

    // 根据策略排序
    items.sort((a, b) => {
      switch (this.config.strategy) {
        case 'lru':
          return a.item.metadata.lastAccessed - b.item.metadata.lastAccessed
        case 'lfu':
          return a.item.metadata.accessCount - b.item.metadata.accessCount
        case 'fifo':
          return a.item.metadata.createdAt - b.item.metadata.createdAt
        case 'lifo':
          return b.item.metadata.createdAt - a.item.metadata.createdAt
        case 'ttl':
          return a.item.metadata.expiresAt - b.item.metadata.expiresAt
        default:
          return a.item.metadata.lastAccessed - b.item.metadata.lastAccessed
      }
    })

    // 驱逐 25% 的项目
    const evictCount = Math.ceil(items.length * 0.25)
    for (let i = 0; i < evictCount; i++) {
      await adapter.delete(items[i].key)
      this.metrics.evictions++
      this.metrics.totalSize -= items[i].item.metadata.size
      this.metrics.itemCount--
    }
  }

  /**
   * 更新平均访问时间
   */
  private updateAverageAccessTime(accessTime: number): void {
    const totalAccesses = this.metrics.hits + this.metrics.misses
    this.metrics.averageAccessTime = 
      (this.metrics.averageAccessTime * (totalAccesses - 1) + accessTime) / totalAccesses
  }

  /**
   * 获取缓存指标
   */
  getMetrics(): CacheMetrics {
    this.metrics.hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0
    return { ...this.metrics }
  }

  /**
   * 重置指标
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics()
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.compressionWorker) {
      this.compressionWorker.terminate()
    }
  }
}

/**
 * 创建高级缓存管理器
 */
export function createAdvancedCacheManager(config: CacheConfig): AdvancedCacheManager {
  return new AdvancedCacheManager(config)
}

/**
 * 默认配置
 */
export const defaultCacheConfig: CacheConfig = {
  strategy: 'lru',
  maxSize: 100, // 100MB
  defaultTTL: 60 * 60 * 1000, // 1小时
  enableCompression: true,
  enableEncryption: false,
  storageAdapters: [
    { name: 'memory', type: 'memory', config: {}, priority: 1 },
    { name: 'localStorage', type: 'localStorage', config: { prefix: 'ldesign_cache_' }, priority: 2 },
  ],
  layers: [
    { name: 'L1', adapter: 'memory', maxSize: 50, ttl: 30 * 60 * 1000, compression: false, encryption: false },
    { name: 'L2', adapter: 'localStorage', maxSize: 100, ttl: 60 * 60 * 1000, compression: true, encryption: false },
  ],
  enableMetrics: true,
}
