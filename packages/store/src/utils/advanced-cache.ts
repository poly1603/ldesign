/**
 * 高级缓存工具
 * 提供缓存预热、缓存分析、自适应缓存等高级功能
 */

import { LRUCache } from './cache'

/**
 * 缓存统计信息
 */
export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  size: number
  evictions: number
  operations: number
}

/**
 * 缓存分析器
 * 提供缓存命中率分析和性能监控
 */
export class CacheAnalyzer<K = string, V = any> {
  private hits = 0
  private misses = 0
  private evictions = 0
  private operations = 0
  private accessPattern = new Map<K, number>()
  private cache: LRUCache<K, V>

  constructor(cache: LRUCache<K, V>) {
    this.cache = cache
  }

  /**
   * 记录缓存命中
   */
  recordHit(key: K): void {
    this.hits++
    this.operations++
    this.recordAccess(key)
  }

  /**
   * 记录缓存未命中
   */
  recordMiss(key: K): void {
    this.misses++
    this.operations++
    this.recordAccess(key)
  }

  /**
   * 记录缓存淘汰
   */
  recordEviction(): void {
    this.evictions++
  }

  /**
   * 记录访问模式
   */
  private recordAccess(key: K): void {
    const count = this.accessPattern.get(key) || 0
    this.accessPattern.set(key, count + 1)
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.operations > 0 ? this.hits / this.operations : 0,
      size: this.cache.size(),
      evictions: this.evictions,
      operations: this.operations,
    }
  }

  /**
   * 获取热门键（最频繁访问）
   */
  getHotKeys(limit = 10): K[] {
    const sorted = Array.from(this.accessPattern.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
    return sorted.map(([key]) => key)
  }

  /**
   * 重置统计信息
   */
  reset(): void {
    this.hits = 0
    this.misses = 0
    this.evictions = 0
    this.operations = 0
    this.accessPattern.clear()
  }

  /**
   * 获取访问频率
   */
  getAccessFrequency(key: K): number {
    return this.accessPattern.get(key) || 0
  }
}

/**
 * 自适应缓存
 * 根据访问模式自动调整缓存策略
 */
export class AdaptiveCache<K = string, V = any> {
  private cache: LRUCache<K, V>
  private analyzer: CacheAnalyzer<K, V>
  private minSize: number
  private maxSize: number
  private targetHitRate: number
  private adjustmentTimer?: NodeJS.Timeout

  constructor(
    initialSize = 1000,
    minSize = 100,
    maxSize = 10000,
    targetHitRate = 0.8,
    defaultTTL = 5 * 60 * 1000
  ) {
    this.cache = new LRUCache<K, V>(initialSize, defaultTTL)
    this.analyzer = new CacheAnalyzer(this.cache)
    this.minSize = minSize
    this.maxSize = maxSize
    this.targetHitRate = targetHitRate
    
    // 定期调整缓存大小
    this.startAutoAdjustment()
  }

  /**
   * 设置缓存
   */
  set(key: K, value: V, ttl?: number): void {
    this.cache.set(key, value, ttl)
  }

  /**
   * 获取缓存
   */
  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      this.analyzer.recordHit(key)
    } else {
      this.analyzer.recordMiss(key)
    }
    return value
  }

  /**
   * 检查是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.analyzer.reset()
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    return this.analyzer.getStats()
  }

  /**
   * 获取热门键
   */
  getHotKeys(limit?: number): K[] {
    return this.analyzer.getHotKeys(limit)
  }

  /**
   * 启动自动调整
   */
  private startAutoAdjustment(): void {
    this.adjustmentTimer = setInterval(() => {
      this.adjustCacheSize()
    }, 60000) // 每分钟调整一次
  }

  /**
   * 根据命中率调整缓存大小
   */
  private adjustCacheSize(): void {
    const stats = this.analyzer.getStats()
    
    if (stats.operations < 100) {
      // 数据不足，不调整
      return
    }

    const currentSize = stats.size
    const hitRate = stats.hitRate

    if (hitRate < this.targetHitRate && currentSize < this.maxSize) {
      // 命中率低，增加缓存大小
      const newSize = Math.min(Math.floor(currentSize * 1.2), this.maxSize)
      this.resizeCache(newSize)
    } else if (hitRate > this.targetHitRate + 0.1 && currentSize > this.minSize) {
      // 命中率高于目标，可以减少缓存大小
      const newSize = Math.max(Math.floor(currentSize * 0.9), this.minSize)
      this.resizeCache(newSize)
    }

    // 重置统计以便下次调整
    this.analyzer.reset()
  }

  /**
   * 调整缓存大小
   */
  private resizeCache(newSize: number): void {
    const oldCache = this.cache
    const defaultTTL = 5 * 60 * 1000 // 使用默认 TTL
    this.cache = new LRUCache<K, V>(newSize, defaultTTL)
    
    // 迁移热门数据到新缓存
    const hotKeys = this.analyzer.getHotKeys(newSize)
    for (const key of hotKeys) {
      const value = oldCache.get(key)
      if (value !== undefined) {
        this.cache.set(key, value)
      }
    }
    
    oldCache.dispose()
  }

  /**
   * 销毁缓存
   */
  dispose(): void {
    if (this.adjustmentTimer) {
      clearInterval(this.adjustmentTimer)
      this.adjustmentTimer = undefined
    }
    this.cache.dispose()
  }
}

/**
 * 缓存预热器
 * 预先加载热门数据到缓存
 */
export class CacheWarmer<K = string, V = any> {
  private cache: LRUCache<K, V> | AdaptiveCache<K, V>
  private warmupTasks = new Map<K, () => Promise<V> | V>()

  constructor(cache: LRUCache<K, V> | AdaptiveCache<K, V>) {
    this.cache = cache
  }

  /**
   * 注册预热任务
   */
  register(key: K, loader: () => Promise<V> | V): void {
    this.warmupTasks.set(key, loader)
  }

  /**
   * 批量注册预热任务
   */
  registerBatch(tasks: Map<K, () => Promise<V> | V>): void {
    for (const [key, loader] of tasks) {
      this.warmupTasks.set(key, loader)
    }
  }

  /**
   * 执行预热
   */
  async warmup(keys?: K[]): Promise<void> {
    const keysToWarm = keys || Array.from(this.warmupTasks.keys())
    
    const promises = keysToWarm.map(async (key) => {
      const loader = this.warmupTasks.get(key)
      if (loader) {
        try {
          const value = await loader()
          this.cache.set(key, value)
        } catch (error) {
          console.warn(`Failed to warmup cache for key: ${String(key)}`, error)
        }
      }
    })

    await Promise.all(promises)
  }

  /**
   * 并发预热（限制并发数）
   */
  async warmupConcurrent(keys?: K[], concurrency = 5): Promise<void> {
    const keysToWarm = keys || Array.from(this.warmupTasks.keys())
    
    for (let i = 0; i < keysToWarm.length; i += concurrency) {
      const batch = keysToWarm.slice(i, i + concurrency)
      const batchPromises = batch.map(async (key) => {
        const loader = this.warmupTasks.get(key)
        if (loader) {
          try {
            const value = await loader()
            this.cache.set(key, value)
          } catch (error) {
            console.warn(`Failed to warmup cache for key: ${String(key)}`, error)
          }
        }
      })
      
      await Promise.all(batchPromises)
    }
  }

  /**
   * 清除预热任务
   */
  clear(): void {
    this.warmupTasks.clear()
  }
}

/**
 * 多级缓存
 * 实现 L1（内存）+ L2（持久化）两级缓存
 */
export class MultiLevelCache<K = string, V = any> {
  private l1Cache: LRUCache<K, V>
  private l2Storage?: Storage
  private l2Prefix: string
  private serializer: {
    serialize: (value: V) => string
    deserialize: (value: string) => V
  }

  constructor(
    l1Size = 1000,
    l1TTL = 5 * 60 * 1000,
    l2Storage?: Storage,
    l2Prefix = 'cache:',
    serializer = {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    }
  ) {
    this.l1Cache = new LRUCache<K, V>(l1Size, l1TTL)
    this.l2Storage = l2Storage
    this.l2Prefix = l2Prefix
    this.serializer = serializer
  }

  /**
   * 设置缓存（同时写入 L1 和 L2）
   */
  set(key: K, value: V, ttl?: number): void {
    // L1 缓存
    this.l1Cache.set(key, value, ttl)
    
    // L2 持久化
    if (this.l2Storage) {
      try {
        const serialized = this.serializer.serialize(value)
        this.l2Storage.setItem(this.l2Prefix + String(key), serialized)
      } catch (error) {
        console.warn('Failed to write to L2 cache:', error)
      }
    }
  }

  /**
   * 获取缓存（先从 L1，再从 L2）
   */
  get(key: K): V | undefined {
    // 先查 L1
    let value = this.l1Cache.get(key)
    if (value !== undefined) {
      return value
    }

    // 再查 L2
    if (this.l2Storage) {
      try {
        const serialized = this.l2Storage.getItem(this.l2Prefix + String(key))
        if (serialized) {
          value = this.serializer.deserialize(serialized)
          // 回写到 L1
          this.l1Cache.set(key, value)
          return value
        }
      } catch (error) {
        console.warn('Failed to read from L2 cache:', error)
      }
    }

    return undefined
  }

  /**
   * 检查是否存在
   */
  has(key: K): boolean {
    if (this.l1Cache.has(key)) {
      return true
    }

    if (this.l2Storage) {
      return this.l2Storage.getItem(this.l2Prefix + String(key)) !== null
    }

    return false
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    const l1Result = this.l1Cache.delete(key)
    
    if (this.l2Storage) {
      try {
        this.l2Storage.removeItem(this.l2Prefix + String(key))
      } catch (error) {
        console.warn('Failed to delete from L2 cache:', error)
      }
    }

    return l1Result
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.l1Cache.clear()
    
    if (this.l2Storage) {
      try {
        const keys = Object.keys(this.l2Storage)
        for (const key of keys) {
          if (key.startsWith(this.l2Prefix)) {
            this.l2Storage.removeItem(key)
          }
        }
      } catch (error) {
        console.warn('Failed to clear L2 cache:', error)
      }
    }
  }

  /**
   * 销毁缓存
   */
  dispose(): void {
    this.l1Cache.dispose()
  }
}
