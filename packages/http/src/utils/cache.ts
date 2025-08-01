import type { CacheConfig, CacheStorage, RequestConfig, ResponseData } from '@/types'

/**
 * 缓存项接口
 */
interface CacheItem<T = any> {
  data: ResponseData<T>
  timestamp: number
  ttl: number
}

/**
 * 内存缓存存储实现
 */
export class MemoryCacheStorage implements CacheStorage {
  private cache = new Map<string, CacheItem>()
  private timers = new Map<string, NodeJS.Timeout>()

  async get(key: string): Promise<any> {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key)
      return null
    }

    return item.data
  }

  async set(key: string, value: any, ttl = 300000): Promise<void> {
    // 清除旧的定时器
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 存储数据
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    })

    // 设置过期定时器
    const timer = setTimeout(() => {
      this.delete(key)
    }, ttl)

    this.timers.set(key, timer)
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)

    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  async clear(): Promise<void> {
    this.cache.clear()

    this.timers.forEach((timer) => {
      clearTimeout(timer)
    })
    this.timers.clear()
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
}

/**
 * LocalStorage 缓存存储实现
 */
export class LocalStorageCacheStorage implements CacheStorage {
  private prefix: string

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
        this.delete(key)
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

    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}

/**
 * 缓存管理器
 */
export class CacheManager {
  private config: Required<CacheConfig>
  private storage: CacheStorage

  constructor(config: CacheConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      ttl: config.ttl ?? 300000, // 默认 5 分钟
      keyGenerator: config.keyGenerator ?? this.defaultKeyGenerator,
      storage: config.storage ?? new MemoryCacheStorage(),
    }

    this.storage = this.config.storage
  }

  /**
   * 获取缓存
   */
  async get<T = any>(config: RequestConfig): Promise<ResponseData<T> | null> {
    if (!this.config.enabled) {
      return null
    }

    const key = this.config.keyGenerator(config)
    return this.storage.get(key)
  }

  /**
   * 设置缓存
   */
  async set<T = any>(config: RequestConfig, response: ResponseData<T>): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    // 只缓存成功的 GET 请求
    if (config.method !== 'GET' || response.status < 200 || response.status >= 300) {
      return
    }

    const key = this.config.keyGenerator(config)
    await this.storage.set(key, response, this.config.ttl)
  }

  /**
   * 删除缓存
   */
  async delete(config: RequestConfig): Promise<void> {
    const key = this.config.keyGenerator(config)
    await this.storage.delete(key)
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    await this.storage.clear()
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CacheConfig>): void {
    Object.assign(this.config, config)
    if (config.storage) {
      this.storage = config.storage
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): Required<CacheConfig> {
    return { ...this.config }
  }

  /**
   * 默认缓存键生成器
   */
  private defaultKeyGenerator(config: RequestConfig): string {
    const { method = 'GET', url = '', params = {}, data } = config

    // 构建基础键
    let key = `${method}:${url}`

    // 添加查询参数
    const paramKeys = Object.keys(params).sort()
    if (paramKeys.length > 0) {
      const paramString = paramKeys
        .map(k => `${k}=${params[k]}`)
        .join('&')
      key += `?${paramString}`
    }

    // 对于 POST 等请求，添加数据哈希
    if (data && method !== 'GET') {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data)
      key += `:${simpleHash(dataString)}`
    }

    return key
  }
}

/**
 * 创建缓存管理器
 */
export function createCacheManager(config?: CacheConfig): CacheManager {
  return new CacheManager(config)
}

/**
 * 创建内存缓存存储
 */
export function createMemoryStorage(): MemoryCacheStorage {
  return new MemoryCacheStorage()
}

/**
 * 创建 LocalStorage 缓存存储
 */
export function createLocalStorage(prefix?: string): LocalStorageCacheStorage {
  return new LocalStorageCacheStorage(prefix)
}

/**
 * 简单哈希函数
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为 32 位整数
  }
  return Math.abs(hash).toString(36)
}
