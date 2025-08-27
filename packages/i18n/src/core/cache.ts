/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 最大缓存大小 */
  maxSize?: number
  /** 生存时间（毫秒） */
  ttl?: number
  /** 是否启用 LRU 策略 */
  enableLRU?: boolean
  /** 缓存策略 */
  strategy?: 'lru' | 'lfu' | 'fifo'
}

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  value: T
  timestamp: number
  accessCount: number
  lastAccessed: number
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  size: number
  maxSize: number
  hitCount: number
  missCount: number
  hitRate: number
  evictionCount: number
}

/**
 * 高性能缓存类
 */
export class PerformanceCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private accessOrder: string[] = []
  private config: Required<CacheConfig>
  private stats = {
    hitCount: 0,
    missCount: 0,
    evictionCount: 0,
  }

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: 1000,
      ttl: 300000, // 5 minutes
      enableLRU: true,
      strategy: 'lru',
      ...config,
    }
  }

  /**
   * 设置缓存项
   * @param key 键
   * @param value 值
   */
  set(key: string, value: T): void {
    const now = Date.now()
    
    // 检查是否需要清理过期项
    this.cleanupExpired()
    
    // 如果已存在，更新值
    if (this.cache.has(key)) {
      const item = this.cache.get(key)!
      item.value = value
      item.timestamp = now
      item.lastAccessed = now
      this.updateAccessOrder(key)
      return
    }

    // 检查是否需要驱逐
    if (this.cache.size >= this.config.maxSize) {
      this.evict()
    }

    // 添加新项
    this.cache.set(key, {
      value,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
    })

    this.accessOrder.push(key)
  }

  /**
   * 获取缓存项
   * @param key 键
   * @returns 值或 undefined
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.missCount++
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
      this.stats.missCount++
      return undefined
    }

    // 更新访问信息
    item.accessCount++
    item.lastAccessed = Date.now()
    this.updateAccessOrder(key)
    
    this.stats.hitCount++
    return item.value
  }

  /**
   * 检查键是否存在
   * @param key 键
   * @returns 是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
      return false
    }
    
    return true
  }

  /**
   * 删除缓存项
   * @param key 键
   * @returns 是否删除成功
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.removeFromAccessOrder(key)
    }
    return deleted
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.stats = {
      hitCount: 0,
      missCount: 0,
      evictionCount: 0,
    }
  }

  /**
   * 获取缓存统计信息
   * @returns 统计信息
   */
  getStats(): CacheStats {
    const totalAccess = this.stats.hitCount + this.stats.missCount
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitCount: this.stats.hitCount,
      missCount: this.stats.missCount,
      hitRate: totalAccess > 0 ? this.stats.hitCount / totalAccess : 0,
      evictionCount: this.stats.evictionCount,
    }
  }

  /**
   * 获取所有键
   * @returns 键数组
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存大小
   * @returns 大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 检查项是否过期
   * @param item 缓存项
   * @returns 是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > this.config.ttl
  }

  /**
   * 清理过期项
   */
  private cleanupExpired(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, item] of this.cache) {
      if (now - item.timestamp > this.config.ttl) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
    }
  }

  /**
   * 驱逐缓存项
   */
  private evict(): void {
    if (this.cache.size === 0) return

    let keyToEvict: string

    switch (this.config.strategy) {
      case 'lru':
        keyToEvict = this.accessOrder[0]
        break
      case 'lfu':
        keyToEvict = this.findLFUKey()
        break
      case 'fifo':
        keyToEvict = this.accessOrder[0]
        break
      default:
        keyToEvict = this.accessOrder[0]
    }

    this.cache.delete(keyToEvict)
    this.removeFromAccessOrder(keyToEvict)
    this.stats.evictionCount++
  }

  /**
   * 查找最少使用频率的键
   * @returns 键
   */
  private findLFUKey(): string {
    let minAccessCount = Infinity
    let lfuKey = ''

    for (const [key, item] of this.cache) {
      if (item.accessCount < minAccessCount) {
        minAccessCount = item.accessCount
        lfuKey = key
      }
    }

    return lfuKey
  }

  /**
   * 更新访问顺序
   * @param key 键
   */
  private updateAccessOrder(key: string): void {
    if (!this.config.enableLRU) return

    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    this.accessOrder.push(key)
  }

  /**
   * 从访问顺序中移除键
   * @param key 键
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }
}

/**
 * 翻译缓存类
 */
export class TranslationCache extends PerformanceCache<string> {
  /**
   * 生成缓存键
   * @param locale 语言代码
   * @param key 翻译键
   * @param params 参数
   * @returns 缓存键
   */
  static generateKey(locale: string, key: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : ''
    return `${locale}:${key}:${paramStr}`
  }

  /**
   * 缓存翻译结果
   * @param locale 语言代码
   * @param key 翻译键
   * @param params 参数
   * @param result 翻译结果
   */
  cacheTranslation(locale: string, key: string, params: Record<string, any> | undefined, result: string): void {
    const cacheKey = TranslationCache.generateKey(locale, key, params)
    this.set(cacheKey, result)
  }

  /**
   * 获取缓存的翻译结果
   * @param locale 语言代码
   * @param key 翻译键
   * @param params 参数
   * @returns 翻译结果或 undefined
   */
  getCachedTranslation(locale: string, key: string, params?: Record<string, any>): string | undefined {
    const cacheKey = TranslationCache.generateKey(locale, key, params)
    return this.get(cacheKey)
  }
}
