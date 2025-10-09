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
 * CacheItem对象池（减少GC压力）
 */
class CacheItemPool<T> {
  private pool: CacheItem<T>[] = []
  private maxSize: number

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize
  }

  acquire(value: T, timestamp: number): CacheItem<T> {
    if (this.pool.length > 0) {
      const item = this.pool.pop()!
      item.value = value
      item.timestamp = timestamp
      item.accessCount = 0
      item.lastAccessed = timestamp
      return item
    }
    return {
      value,
      timestamp,
      accessCount: 0,
      lastAccessed: timestamp
    }
  }

  release(item: CacheItem<T>): void {
    if (this.pool.length < this.maxSize) {
      // 清理引用，避免内存泄漏
      (item as any).value = null
      this.pool.push(item)
    }
  }

  clear(): void {
    this.pool = []
  }
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
  private accessSet = new Set<string>() // 快速查找访问顺序
  private config: Required<CacheConfig>
  private stats = {
    hitCount: 0,
    missCount: 0,
    evictionCount: 0,
  }
  // 对象池用于复用CacheItem
  private itemPool: CacheItemPool<T>
  // 懒清理跟踪
  private lastCleanupTime = 0
  private cleanupThreshold = 100 // 每100次操作检查一次
  private operationCount = 0

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: 1000,
      ttl: 300000, // 5 minutes
      enableLRU: true,
      strategy: 'lru',
      ...config,
    }
    // 初始化对象池，大小为最大缓存大小的10%
    this.itemPool = new CacheItemPool<T>(Math.max(10, Math.floor(this.config.maxSize * 0.1)))
  }

  /**
   * 设置缓存项
   * @param key 键
   * @param value 值
   */
  set(key: string, value: T): void {
    const now = Date.now()
    
    // 懒清理：每100次操作或距离上次清理超过30秒才执行
    this.operationCount++
    if (this.operationCount >= this.cleanupThreshold || now - this.lastCleanupTime > 30000) {
      this.cleanupExpired()
      this.lastCleanupTime = now
      this.operationCount = 0
    }
    
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

    // 添加新项（使用对象池）
    const item = this.itemPool.acquire(value, now)
    this.cache.set(key, item)

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
    const item = this.cache.get(key)
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.removeFromAccessOrder(key)
      // 释放回对象池
      if (item) {
        this.itemPool.release(item)
      }
    }
    return deleted
  }

  /**
   * 清空缓存
   */
  clear(): void {
    // 释放所有项回对象池
    for (const item of this.cache.values()) {
      this.itemPool.release(item)
    }
    this.cache.clear()
    this.accessOrder = []
    this.accessSet.clear()
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
    // 优化：如果缓存为空或太小，跳过清理
    if (this.cache.size === 0 || this.cache.size < 10) {
      return
    }

    const now = Date.now()
    const expiredKeys: string[] = []
    let checkedCount = 0
    const maxChecks = Math.min(this.cache.size, 100) // 每次最多检查100个

    // 只检查一部分项目，避免完整遍历
    for (const [key, item] of this.cache) {
      if (checkedCount++ >= maxChecks) break
      
      if (now - item.timestamp > this.config.ttl) {
        expiredKeys.push(key)
      }
    }

    // 批量删除
    for (const key of expiredKeys) {
      const item = this.cache.get(key)
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
      if (item) {
        this.itemPool.release(item)
      }
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

    // 获取项并释放回对象池
    const item = this.cache.get(keyToEvict)
    this.cache.delete(keyToEvict)
    this.removeFromAccessOrder(keyToEvict)
    if (item) {
      this.itemPool.release(item)
    }
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

    // 使用Set进行快速查找，避免O(n)的indexOf
    if (this.accessSet.has(key)) {
      // 只有在Set中存在时才从数组中移除（延迟操作）
      const index = this.accessOrder.indexOf(key)
      if (index > -1) {
        this.accessOrder.splice(index, 1)
      }
    }
    this.accessOrder.push(key)
    this.accessSet.add(key)
  }

  /**
   * 从访问顺序中移除键
   * @param key 键
   */
  private removeFromAccessOrder(key: string): void {
    // 使用Set快速检查是否存在
    if (this.accessSet.has(key)) {
      const index = this.accessOrder.indexOf(key)
      if (index > -1) {
        this.accessOrder.splice(index, 1)
      }
      this.accessSet.delete(key)
    }
  }
}

/**
 * 翻译缓存类
 */
export class TranslationCache extends PerformanceCache<string> {
  // 使用静态快速缓存键生成器实例（单例模式，避免重复创建）
  private static keyGenerator: any = null

  /**
   * 获取缓存键生成器（懒加载）
   */
  private static getKeyGenerator(): any {
    if (!this.keyGenerator) {
      // 动态导入避免循环依赖
      try {
        const { FastCacheKeyGenerator } = require('./fast-cache-key')
        this.keyGenerator = new FastCacheKeyGenerator({ compact: true, sortParams: true })
      } catch {
        // 回退到简单生成器
        this.keyGenerator = {
          generateTranslationKey: (locale: string, key: string, params?: Record<string, any>) => {
            if (!params || Object.keys(params).length === 0) {
              return `${locale}:${key}`
            }
            const paramStr = JSON.stringify(params)
            return `${locale}:${key}:${paramStr}`
          }
        }
      }
    }
    return this.keyGenerator
  }

  /**
   * 生成缓存键（优化版本，使用FastCacheKeyGenerator）
   * @param locale 语言代码
   * @param key 翻译键
   * @param params 参数
   * @returns 缓存键
   */
  static generateKey(locale: string, key: string, params?: Record<string, any>): string {
    return this.getKeyGenerator().generateTranslationKey(locale, key, params)
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

  /**
   * 清除指定语言的所有缓存
   * @param locale 语言代码
   */
  clearLocale(locale: string): void {
    const keysToDelete: string[] = []
    for (const key of this.keys()) {
      if (key.startsWith(`${locale}:`)) {
        keysToDelete.push(key)
      }
    }
    for (const key of keysToDelete) {
      this.delete(key)
    }
  }

  /**
   * 预热缓存
   * @param entries 缓存条目数组
   */
  warmUp(entries: Array<{ locale: string; key: string; params?: Record<string, any>; value: string }>): void {
    for (const entry of entries) {
      this.cacheTranslation(entry.locale, entry.key, entry.params, entry.value)
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    // 调用父类的清理方法
    const stats = this.getStats()
    if (stats.size > stats.maxSize * 0.8) {
      // 清理最少使用的 20% 缓存
      const keysToDelete = Math.floor(stats.size * 0.2)
      const allKeys = this.keys()
      for (let i = 0; i < keysToDelete && i < allKeys.length; i++) {
        this.delete(allKeys[i])
      }
    }
  }

  /**
   * 获取内存使用量（估算）
   * @returns 内存使用量（字节）
   */
  getMemoryUsage(): number {
    let totalSize = 0
    for (const key of this.keys()) {
      const value = this.get(key)
      if (value) {
        // 估算：键长度 + 值长度 + 对象开销
        totalSize += key.length * 2 + value.length * 2 + 64
      }
    }
    return totalSize
  }
}
