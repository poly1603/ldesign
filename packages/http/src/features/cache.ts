/**
 * HTTP请求缓存功能 - 中间件层
 *
 * 注意：此文件提供缓存中间件功能，与 utils/cache.ts 的职责不同：
 * - features/cache.ts: 提供 HTTP 缓存中间件（用于拦截器）
 * - utils/cache.ts: 提供缓存管理器（用于 HTTP 客户端内部）
 *
 * 两者的接口定义略有不同，这是设计上的考虑。
 */

export interface CacheConfig {
  /** 默认TTL(秒) */
  defaultTTL: number
  /** 最大缓存条目数 */
  maxSize: number
  /** 缓存键生成函数 */
  keyGenerator?: (url: string, options: any) => string
  /** 缓存存储适配器 */
  storage?: CacheStorage
  /** 是否启用压缩 */
  enableCompression: boolean
  /** 缓存策略 */
  strategy: CacheStrategy
}

export type CacheStrategy =
  | 'memory'
  | 'localStorage'
  | 'sessionStorage'
  | 'indexedDB'

export interface CacheItem {
  data: any
  timestamp: number
  ttl: number
  headers?: Record<string, string>
  etag?: string
  lastModified?: string
  size: number
}

export interface CacheStorage {
  get: (key: string) => Promise<CacheItem | null>
  set: (key: string, item: CacheItem) => Promise<void>
  delete: (key: string) => Promise<boolean>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
  size: () => Promise<number>
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  hitRate: number
}

/**
 * 内存缓存存储
 */
export class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, CacheItem>()
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  async get(key: string): Promise<CacheItem | null> {
    const item = this.cache.get(key)
    if (!item)
      return null

    // 检查是否过期
    if (Date.now() > item.timestamp + item.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return item
  }

  async set(key: string, item: CacheItem): Promise<void> {
    // 如果超过最大大小，删除最旧的条目（LRU）
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, item)
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys())
  }

  async size(): Promise<number> {
    return this.cache.size
  }
}

/**
 * LocalStorage 缓存存储
 */
export class LocalStorageCacheStorage implements CacheStorage {
  private prefix: string

  constructor(prefix: string = 'http_cache_') {
    this.prefix = prefix
  }

  async get(key: string): Promise<CacheItem | null> {
    try {
      const data = localStorage.getItem(this.prefix + key)
      if (!data)
        return null

      const item: CacheItem = JSON.parse(data)

      // 检查是否过期
      if (Date.now() > item.timestamp + item.ttl * 1000) {
        await this.delete(key)
        return null
      }

      return item
    }
    catch {
      return null
    }
  }

  async set(key: string, item: CacheItem): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item))
    }
    catch {
      // 存储空间不足时清理过期条目
      await this.cleanup()
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(item))
      }
      catch {
        // 仍然失败则忽略
      }
    }
  }

  async delete(key: string): Promise<boolean> {
    const exists = localStorage.getItem(this.prefix + key) !== null
    localStorage.removeItem(this.prefix + key)
    return exists
  }

  async clear(): Promise<void> {
    const keys = await this.keys()
    keys.forEach(key => localStorage.removeItem(this.prefix + key))
  }

  async keys(): Promise<string[]> {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length))
      }
    }
    return keys
  }

  async size(): Promise<number> {
    return (await this.keys()).length
  }

  private async cleanup(): Promise<void> {
    const keys = await this.keys()
    const now = Date.now()

    for (const key of keys) {
      const item = await this.get(key)
      if (!item || now > item.timestamp + item.ttl * 1000) {
        await this.delete(key)
      }
    }
  }
}

/**
 * HTTP缓存管理器
 */
export class HttpCacheManager {
  private config: CacheConfig
  private storage: CacheStorage
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
  }

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300, // 5分钟
      maxSize: 100,
      enableCompression: false,
      strategy: 'memory',
      ...config,
    }

    this.storage = this.createStorage()
  }

  private createStorage(): CacheStorage {
    switch (this.config?.strategy) {
      case 'localStorage':
        return new LocalStorageCacheStorage()
      case 'sessionStorage':
        // 类似LocalStorage但使用sessionStorage
        return new LocalStorageCacheStorage('session_http_cache_')
      case 'memory':
      default:
        return new MemoryCacheStorage(this.config?.maxSize)
    }
  }

  /**
   * 生成缓存键
   */
  private generateKey(url: string, options: any): string {
    if (this.config?.keyGenerator) {
      return this.config?.keyGenerator(url, options)
    }

    // 默认键生成策略
    const method = options.method || 'GET'
    const params = options.params ? JSON.stringify(options.params) : ''
    const headers = options.headers ? JSON.stringify(options.headers) : ''

    return `${method}:${url}:${params}:${headers}`
  }

  /**
   * 获取缓存
   */
  async get(url: string, options: any = {}): Promise<any | null> {
    const key = this.generateKey(url, options)
    const item = await this.storage.get(key)

    if (item) {
      this.stats.hits++
      this.updateStats()
      return item.data
    }

    this.stats.misses++
    this.updateStats()
    return null
  }

  /**
   * 设置缓存
   */
  async set(
    url: string,
    options: any,
    data: any,
    ttl?: number,
    headers?: Record<string, string>,
  ): Promise<void> {
    const key = this.generateKey(url, options)
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config?.defaultTTL,
      headers,
      size: this.calculateSize(data),
    }

    await this.storage.set(key, item)
    this.stats.size = await this.storage.size()
  }

  /**
   * 删除缓存
   */
  async delete(url: string, options: any = {}): Promise<boolean> {
    const key = this.generateKey(url, options)
    const result = await this.storage.delete(key)
    this.stats.size = await this.storage.size()
    return result
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    await this.storage.clear()
    this.stats.size = 0
    this.stats.hits = 0
    this.stats.misses = 0
    this.stats.hitRate = 0
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  /**
   * 计算数据大小
   */
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length
    }
    catch {
      return 0
    }
  }

  /**
   * 检查响应是否可缓存
   */
  static isCacheable(
    method: string,
    status: number,
    headers: Record<string, string> = {},
  ): boolean {
    // 只缓存GET请求
    if (method.toUpperCase() !== 'GET') {
      return false
    }

    // 只缓存成功响应
    if (status < 200 || status >= 300) {
      return false
    }

    // 检查Cache-Control头
    const cacheControl = headers['cache-control'] || headers['Cache-Control']
    if (cacheControl) {
      if (
        cacheControl.includes('no-cache')
        || cacheControl.includes('no-store')
      ) {
        return false
      }
    }

    return true
  }
}

/**
 * 创建HTTP缓存管理器
 */
export function createHttpCacheManager(
  config?: Partial<CacheConfig>,
): HttpCacheManager {
  return new HttpCacheManager(config)
}

/**
 * 缓存中间件配置
 */
export interface CacheMiddlewareConfig {
  enabled?: boolean
  ttl?: number
  methods?: string[]
  keyGenerator?: (config: any) => string
  storage?: CacheStorage
}

/**
 * 创建缓存中间件
 */
export function withCache(config: CacheMiddlewareConfig = {}) {
  const cacheConfig = {
    enabled: config.enabled ?? true,
    ttl: config.ttl ?? 300000, // 5分钟
    methods: config.methods ?? ['GET'],
    keyGenerator: config.keyGenerator ?? ((cfg: any) => {
      const method = cfg.method || 'GET'
      const url = cfg.url || ''
      const params = cfg.params ? JSON.stringify(cfg.params) : ''
      return `${method}:${url}:${params}`
    }),
    storage: config.storage ?? new MemoryCacheStorage(),
  }

  return async function cacheMiddleware(requestConfig: any, next: () => Promise<any>) {
    // 合并请求级别的缓存配置
    const requestCacheConfig = requestConfig?.cache || {}
    const finalConfig = {
      enabled: requestCacheConfig.enabled ?? cacheConfig.enabled,
      ttl: requestCacheConfig.ttl ?? cacheConfig.ttl,
      methods: requestCacheConfig.methods ?? cacheConfig.methods,
      keyGenerator: requestCacheConfig.keyGenerator ?? cacheConfig.keyGenerator,
      storage: requestCacheConfig.storage ?? cacheConfig.storage,
    }

    if (!finalConfig.enabled || !finalConfig.methods.includes(requestConfig.method || 'GET')) {
      return next()
    }

    // 生成缓存键
    const key = finalConfig.keyGenerator(requestConfig)

    try {
      // 尝试从缓存获取
      const cached = await finalConfig.storage.get(key)
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data
      }
    }
    catch (error) {
      // 缓存读取错误，继续执行请求
      console.warn('Cache read error:', error)
    }

    // 执行请求
    const response = await next()

    // 缓存响应
    if (response && response.status >= 200 && response.status < 300) {
      try {
        await finalConfig.storage.set(key, {
          data: response,
          timestamp: Date.now(),
          ttl: finalConfig.ttl,
          size: JSON.stringify(response).length,
        })
      }
      catch (error) {
        // 缓存写入错误，不影响响应
        console.warn('Cache write error:', error)
      }
    }

    return response
  }
}

/**
 * 全局HTTP缓存管理器实例
 */
export const globalHttpCacheManager = createHttpCacheManager()
