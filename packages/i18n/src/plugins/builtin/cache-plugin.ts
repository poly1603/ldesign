/**
 * 缓存插件
 *
 * 提供：
 * - 智能缓存管理
 * - 缓存策略配置
 * - 缓存性能监控
 * - 缓存清理策略
 */

import type { I18nInstance } from '../../core/types'
import type { I18nPlugin } from '../registry'

/**
 * 缓存插件配置
 */
export interface CachePluginConfig {
  /** 最大缓存大小 */
  maxSize?: number
  /** 缓存过期时间（毫秒） */
  ttl?: number
  /** 是否启用LRU策略 */
  lru?: boolean
  /** 预热缓存的键 */
  preloadKeys?: string[]
  /** 缓存清理间隔（毫秒） */
  cleanupInterval?: number
  /** 是否启用性能监控 */
  enableMetrics?: boolean
}

/**
 * 缓存项
 */
interface CacheItem {
  value: string
  timestamp: number
  accessCount: number
  lastAccess: number
}

/**
 * 缓存指标
 */
interface CacheMetrics {
  hits: number
  misses: number
  size: number
  hitRate: number
  memoryUsage: number
}

/**
 * 高级缓存管理器
 */
class AdvancedCacheManager {
  private cache = new Map<string, CacheItem>()
  private config: Required<CachePluginConfig>
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
    memoryUsage: 0,
  }

  private cleanupTimer?: NodeJS.Timeout

  constructor(config: CachePluginConfig) {
    this.config = {
      maxSize: 1000,
      ttl: 5 * 60 * 1000, // 5分钟
      lru: true,
      preloadKeys: [],
      cleanupInterval: 60 * 1000, // 1分钟
      enableMetrics: true,
      ...config,
    }

    this.startCleanupTimer()
  }

  /**
   * 获取缓存值
   */
  get(key: string): string | undefined {
    const item = this.cache.get(key)

    if (!item) {
      if (this.config.enableMetrics) {
        this.metrics.misses++
        this.updateMetrics()
      }
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      if (this.config.enableMetrics) {
        this.metrics.misses++
        this.updateMetrics()
      }
      return undefined
    }

    // 更新访问信息
    item.accessCount++
    item.lastAccess = Date.now()

    if (this.config.enableMetrics) {
      this.metrics.hits++
      this.updateMetrics()
    }

    return item.value
  }

  /**
   * 设置缓存值
   */
  set(key: string, value: string): void {
    // 检查缓存大小限制
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      if (this.config.lru) {
        this.evictLRU()
      }
      else {
        this.evictOldest()
      }
    }

    const now = Date.now()
    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 1,
      lastAccess: now,
    })

    this.updateMetrics()
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key)
    if (result) {
      this.updateMetrics()
    }
    return result
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.metrics.hits = 0
    this.metrics.misses = 0
    this.updateMetrics()
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    return item ? !this.isExpired(item) : false
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取缓存指标
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  /**
   * 预热缓存
   */
  async warmup(i18n: I18nInstance): Promise<void> {
    for (const key of this.config.preloadKeys) {
      try {
        const value = i18n.t(key)
        this.set(key, value)
      }
      catch (error) {
        console.warn(`Failed to preload cache for key "${key}":`, error)
      }
    }
  }

  /**
   * 检查是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > this.config.ttl
  }

  /**
   * LRU 淘汰
   */
  private evictLRU(): void {
    let lruKey = ''
    let lruTime = Infinity

    for (const [key, item] of this.cache) {
      if (item.lastAccess < lruTime) {
        lruTime = item.lastAccess
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }

  /**
   * 最旧项淘汰
   */
  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Infinity

    for (const [key, item] of this.cache) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * 更新指标
   */
  private updateMetrics(): void {
    if (!this.config.enableMetrics)
      return

    this.metrics.size = this.cache.size
    this.metrics.hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0

    // 估算内存使用
    let memoryUsage = 0
    for (const [key, item] of this.cache) {
      memoryUsage += key.length * 2 + item.value.length * 2 + 32 // 估算对象开销
    }
    this.metrics.memoryUsage = memoryUsage
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache) {
      if (now - item.timestamp > this.config.ttl) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key)
    }

    if (keysToDelete.length > 0) {
      this.updateMetrics()
    }
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clear()
  }
}

/**
 * 缓存插件
 */
export const cachePlugin: I18nPlugin = {
  name: 'cache',
  version: '1.0.0',
  description: 'Advanced caching plugin for I18n',
  author: 'LDesign Team',

  install(i18n: I18nInstance, options: CachePluginConfig = {}) {
    const cacheManager = new AdvancedCacheManager(options)

    // 包装翻译方法
    const originalT = i18n.t.bind(i18n)
    i18n.t = (key: string, params?: any, options?: any): any => {
      const cacheKey = `${key}:${JSON.stringify(params || {})}`

      // 尝试从缓存获取
      let result = cacheManager.get(cacheKey)
      if (result !== undefined) {
        return result
      }

      // 执行翻译
      result = originalT(key, params, options)

      // 缓存结果（只缓存有效结果）
      if (result !== undefined) {
        cacheManager.set(cacheKey, result)
      }

      return result
    }

    // 添加缓存管理方法
    ; (i18n as any).cache = {
      get: (key: string) => cacheManager.get(key),
      set: (key: string, value: string) => cacheManager.set(key, value),
      delete: (key: string) => cacheManager.delete(key),
      clear: () => cacheManager.clear(),
      has: (key: string) => cacheManager.has(key),
      size: () => cacheManager.size(),
      getMetrics: () => cacheManager.getMetrics(),
      warmup: () => cacheManager.warmup(i18n),
    }

    // 预热缓存
    if (options.preloadKeys && options.preloadKeys.length > 0) {
      setTimeout(() => {
        cacheManager.warmup(i18n)
      }, 0)
    }

    // 保存管理器引用
    ; (i18n as any)._cacheManager = cacheManager
  },

  uninstall(i18n: I18nInstance) {
    const cacheManager = (i18n as any)._cacheManager
    if (cacheManager) {
      cacheManager.destroy()
      delete (i18n as any)._cacheManager
      delete (i18n as any).cache
    }
  },
}
