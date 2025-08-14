import type { CacheConfig } from '../types'

/**
 * 缓存项
 */
interface CacheItem<T = unknown> {
  /** 缓存值 */
  value: T
  /** 过期时间 */
  expiresAt: number
  /** 创建时间 */
  createdAt: number
}

/**
 * 缓存管理器
 */
export class CacheManager {
  /** 配置 */
  private readonly config: Required<CacheConfig>

  /** 内存缓存 */
  private readonly memoryCache = new Map<string, CacheItem>()

  /** 缓存统计 */
  private readonly stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    clears: 0,
  }

  constructor(config: CacheConfig) {
    this.config = {
      enabled: true,
      ttl: 300000, // 5分钟
      maxSize: 100,
      storage: 'memory',
      prefix: 'api_cache_',
      ...config,
    }

    // 定期清理过期缓存
    this.startCleanupTimer()
  }

  /**
   * 获取缓存
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.config.enabled) {
      return null
    }

    try {
      const item = await this.getItem<T>(key)

      if (!item) {
        this.stats.misses++
        return null
      }

      // 检查是否过期
      if (Date.now() > item.expiresAt) {
        await this.delete(key)
        this.stats.misses++
        return null
      }

      this.stats.hits++
      return item.value
    } catch (error) {
      console.warn(
        `[Cache Manager] Failed to get cache for key "${key}"`,
        error
      )
      this.stats.misses++
      return null
    }
  }

  /**
   * 设置缓存
   */
  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    try {
      const actualTtl = ttl ?? this.config.ttl
      const now = Date.now()
      const item: CacheItem<T> = {
        value,
        expiresAt: now + actualTtl,
        createdAt: now,
      }

      await this.setItem(key, item)
      this.stats.sets++

      // 检查缓存大小限制
      await this.enforceMaxSize()
    } catch (error) {
      console.warn(
        `[Cache Manager] Failed to set cache for key "${key}"`,
        error
      )
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    try {
      await this.deleteItem(key)
      this.stats.deletes++
    } catch (error) {
      console.warn(
        `[Cache Manager] Failed to delete cache for key "${key}"`,
        error
      )
    }
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    try {
      await this.clearItems()
      this.stats.clears++
    } catch (error) {
      console.warn('[Cache Manager] Failed to clear cache', error)
    }
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    if (!this.config.enabled) {
      return false
    }

    try {
      const item = await this.getItem(key)
      if (!item) {
        return false
      }

      // 检查是否过期
      if (Date.now() > item.expiresAt) {
        await this.delete(key)
        return false
      }

      return true
    } catch (error) {
      console.warn(
        `[Cache Manager] Failed to check cache for key "${key}"`,
        error
      )
      return false
    }
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      ...this.stats,
      size: this.memoryCache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    }
  }

  /**
   * 获取缓存项（根据存储类型）
   */
  private async getItem<T>(key: string): Promise<CacheItem<T> | null> {
    const fullKey = this.config.prefix + key

    switch (this.config.storage) {
      case 'memory':
        return (this.memoryCache.get(fullKey) as CacheItem<T>) || null

      case 'localStorage': {
        if (typeof localStorage === 'undefined') {
          return null
        }
        const localItem = localStorage.getItem(fullKey)
        return localItem ? JSON.parse(localItem) : null
      }

      case 'sessionStorage': {
        if (typeof sessionStorage === 'undefined') {
          return null
        }
        const sessionItem = sessionStorage.getItem(fullKey)
        return sessionItem ? JSON.parse(sessionItem) : null
      }

      default:
        return null
    }
  }

  /**
   * 设置缓存项（根据存储类型）
   */
  private async setItem<T>(key: string, item: CacheItem<T>): Promise<void> {
    const fullKey = this.config.prefix + key

    switch (this.config.storage) {
      case 'memory':
        this.memoryCache.set(fullKey, item)
        break

      case 'localStorage':
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(fullKey, JSON.stringify(item))
        }
        break

      case 'sessionStorage':
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(fullKey, JSON.stringify(item))
        }
        break
    }
  }

  /**
   * 删除缓存项（根据存储类型）
   */
  private async deleteItem(key: string): Promise<void> {
    const fullKey = this.config.prefix + key

    switch (this.config.storage) {
      case 'memory':
        this.memoryCache.delete(fullKey)
        break

      case 'localStorage':
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(fullKey)
        }
        break

      case 'sessionStorage':
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem(fullKey)
        }
        break
    }
  }

  /**
   * 清空所有缓存项（根据存储类型）
   */
  private async clearItems(): Promise<void> {
    switch (this.config.storage) {
      case 'memory':
        this.memoryCache.clear()
        break

      case 'localStorage':
        if (typeof localStorage !== 'undefined') {
          const keys = Object.keys(localStorage).filter(key =>
            key.startsWith(this.config.prefix)
          )
          keys.forEach(key => localStorage.removeItem(key))
        }
        break

      case 'sessionStorage':
        if (typeof sessionStorage !== 'undefined') {
          const keys = Object.keys(sessionStorage).filter(key =>
            key.startsWith(this.config.prefix)
          )
          keys.forEach(key => sessionStorage.removeItem(key))
        }
        break
    }
  }

  /**
   * 强制执行最大缓存大小限制
   */
  private async enforceMaxSize(): Promise<void> {
    if (this.config.storage !== 'memory') {
      return // 只对内存缓存执行大小限制
    }

    while (this.memoryCache.size > this.config.maxSize) {
      // 删除最旧的缓存项
      const oldestKey = this.memoryCache.keys().next().value
      if (oldestKey) {
        this.memoryCache.delete(oldestKey)
      } else {
        break
      }
    }
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    // 每5分钟清理一次过期缓存
    setInterval(() => {
      this.cleanupExpiredItems()
    }, 5 * 60 * 1000)
  }

  /**
   * 清理过期的缓存项
   */
  private cleanupExpiredItems(): void {
    if (this.config.storage !== 'memory') {
      return // 只对内存缓存执行自动清理
    }

    const now = Date.now()
    const expiredKeys: string[] = []

    this.memoryCache.forEach((item, key) => {
      if (now > item.expiresAt) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach(key => {
      this.memoryCache.delete(key)
    })

    if (expiredKeys.length > 0) {
      console.warn(
        `[Cache Manager] Cleaned up ${expiredKeys.length} expired cache items`
      )
    }
  }
}
