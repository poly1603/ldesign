import type { App } from 'vue'
import type { Router, RouteLocationNormalized } from '../types'

/**
 * 缓存策略
 */
export type CacheStrategy = 'memory' | 'localStorage' | 'sessionStorage'

/**
 * 缓存配置
 */
export interface CacheConfig {
  /**
   * 是否启用缓存
   */
  enabled?: boolean

  /**
   * 缓存策略
   */
  strategy?: CacheStrategy

  /**
   * 默认缓存时间（毫秒）
   */
  defaultTTL?: number

  /**
   * 最大缓存条目数
   */
  maxSize?: number

  /**
   * 缓存键生成器
   */
  keyGenerator?: (route: RouteLocationNormalized) => string

  /**
   * 缓存过滤器
   */
  shouldCache?: (route: RouteLocationNormalized) => boolean

  /**
   * 缓存数据序列化器
   */
  serializer?: {
    serialize: (data: unknown) => string
    deserialize: (data: string) => unknown
  }
}

/**
 * 缓存条目
 */
interface CacheEntry {
  data: unknown
  timestamp: number
  ttl: number
  route: string
}

/**
 * 缓存存储接口
 */
interface CacheStorage {
  get(key: string): CacheEntry | null
  set(key: string, entry: CacheEntry): void
  delete(key: string): boolean
  clear(): void
  keys(): string[]
  size(): number
}

/**
 * 内存缓存存储
 */
class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, CacheEntry>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry
  }

  set(key: string, entry: CacheEntry): void {
    // 如果超过最大大小，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, entry)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * 本地存储缓存
 */
class LocalStorageCacheStorage implements CacheStorage {
  private prefix: string

  constructor(prefix = 'router_cache_') {
    this.prefix = prefix
  }

  get(key: string): CacheEntry | null {
    try {
      const data = localStorage.getItem(this.prefix + key)
      if (!data) return null

      const entry: CacheEntry = JSON.parse(data)

      // 检查是否过期
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.delete(key)
        return null
      }

      return entry
    } catch {
      return null
    }
  }

  set(key: string, entry: CacheEntry): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(entry))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  delete(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key)
      return true
    } catch {
      return false
    }
  }

  clear(): void {
    const keys = this.keys()
    keys.forEach(key => this.delete(key))
  }

  keys(): string[] {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length))
      }
    }
    return keys
  }

  size(): number {
    return this.keys().length
  }
}

/**
 * 路由缓存插件
 */
export class RouterCachePlugin {
  private config: Required<CacheConfig>
  private storage: CacheStorage
  private router: Router | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: true,
      strategy: 'memory',
      defaultTTL: 5 * 60 * 1000, // 5分钟
      maxSize: 100,
      keyGenerator: route => `${route.path}?${JSON.stringify(route.query)}`,
      shouldCache: route => route.meta?.cache !== false,
      serializer: {
        serialize: JSON.stringify,
        deserialize: JSON.parse,
      },
      ...config,
    }

    this.storage = this.createStorage()
  }

  /**
   * 创建存储实例
   */
  private createStorage(): CacheStorage {
    switch (this.config.strategy) {
      case 'localStorage':
        return new LocalStorageCacheStorage()
      case 'sessionStorage':
        return new LocalStorageCacheStorage('session_router_cache_')
      case 'memory':
      default:
        return new MemoryCacheStorage(this.config.maxSize)
    }
  }

  /**
   * 安装插件
   */
  install(app: App): void {
    if (!this.config.enabled) return

    // 获取路由器实例
    const router = (app.config.globalProperties as any).$router as Router
    if (!router) {
      console.warn('RouterCachePlugin: Router not found')
      return
    }

    this.router = router
    this.setupCaching()

    // 提供缓存API
    app.provide('routerCache', this)
    ;(app.config.globalProperties as any).$routerCache = this
  }

  /**
   * 设置缓存逻辑
   */
  private setupCaching(): void {
    if (!this.router) return

    // 在路由解析后检查缓存
    this.router.beforeEach(to => {
      if (this.config.shouldCache(to)) {
        const cached = this.get(to)
        if (cached) {
          // 将缓存数据附加到路由
          to.meta = { ...to.meta, cachedData: cached }
        }
      }
      return true
    })
  }

  /**
   * 获取缓存数据
   */
  get(route: RouteLocationNormalized): unknown | null {
    const key = this.config.keyGenerator(route)
    const entry = this.storage.get(key)
    return entry ? entry.data : null
  }

  /**
   * 设置缓存数据
   */
  set(route: RouteLocationNormalized, data: unknown, ttl?: number): void {
    if (!this.config.shouldCache(route)) return

    const key = this.config.keyGenerator(route)
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      route: route.path,
    }

    this.storage.set(key, entry)
  }

  /**
   * 删除缓存
   */
  delete(route: RouteLocationNormalized): boolean {
    const key = this.config.keyGenerator(route)
    return this.storage.delete(key)
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.storage.clear()
  }

  /**
   * 清除过期缓存
   */
  clearExpired(): void {
    const keys = this.storage.keys()
    const now = Date.now()

    keys.forEach(key => {
      const entry = this.storage.get(key)
      if (entry && now - entry.timestamp > entry.ttl) {
        this.storage.delete(key)
      }
    })
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    size: number
    keys: string[]
    strategy: CacheStrategy
  } {
    return {
      size: this.storage.size(),
      keys: this.storage.keys(),
      strategy: this.config.strategy,
    }
  }

  /**
   * 检查路由是否被缓存
   */
  has(route: RouteLocationNormalized): boolean {
    const key = this.config.keyGenerator(route)
    return this.storage.get(key) !== null
  }
}

/**
 * 创建缓存插件
 */
export function createCachePlugin(config?: Partial<CacheConfig>) {
  return new RouterCachePlugin(config)
}

export default RouterCachePlugin
