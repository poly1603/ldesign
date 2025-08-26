/**
 * 缓存服务 - 简化版本
 * 专注于模板系统的缓存需求
 */

import type {
  CacheConfig,
  EventData,
  EventListener,
} from '../types'

/**
 * 缓存项接口
 */
interface CacheItem<T = any> {
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccess: number
}

/**
 * 缓存统计信息
 */
interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  size: number
  maxSize: number
  memoryUsage: number
}

/**
 * 简化的缓存服务类
 */
export class CacheService<T = any> {
  private config: Required<CacheConfig>
  private cache = new Map<string, CacheItem<T>>()
  private listeners = new Map<string, EventListener[]>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    maxSize: 0,
    memoryUsage: 0,
  }

  constructor(config: CacheConfig = {}) {
    this.config = this.normalizeConfig(config)
    this.stats.maxSize = this.config.maxSize
    this.startCleanupTimer()
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config: CacheConfig): Required<CacheConfig> {
    return {
      enabled: config.enabled ?? true,
      strategy: config.strategy ?? 'lru',
      maxSize: config.maxSize ?? 100,
      ttl: config.ttl ?? 30 * 60 * 1000, // 30分钟
      persistent: config.persistent ?? false,
      keyPrefix: config.keyPrefix ?? 'template:',
    }
  }

  /**
   * 获取缓存项
   */
  async get(key: string): Promise<T | null> {
    if (!this.config.enabled) {
      return null
    }

    const fullKey = this.config.keyPrefix + key
    const item = this.cache.get(fullKey)

    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      this.emit('cache:miss', {
        type: 'cache:miss',
        key: fullKey,
        timestamp: Date.now(),
      })
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(fullKey)
      this.stats.misses++
      this.updateHitRate()
      this.emit('cache:miss', {
        type: 'cache:miss',
        key: fullKey,
        timestamp: Date.now(),
      })
      return null
    }

    // 更新访问信息
    item.accessCount++
    item.lastAccess = Date.now()

    this.stats.hits++
    this.updateHitRate()
    this.emit('cache:hit', {
      type: 'cache:hit',
      key: fullKey,
      timestamp: Date.now(),
    })

    return item.value
  }

  /**
   * 设置缓存项
   */
  async set(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    const fullKey = this.config.keyPrefix + key
    const itemTtl = ttl || this.config.ttl

    // 检查是否需要清理空间
    if (this.cache.size >= this.config.maxSize) {
      this.evictItems()
    }

    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: itemTtl,
      accessCount: 1,
      lastAccess: Date.now(),
    }

    this.cache.set(fullKey, item)
    this.updateStats()

    this.emit('cache:set', {
      type: 'cache:set',
      key: fullKey,
      size: this.estimateSize(value),
      timestamp: Date.now(),
    })
  }

  /**
   * 删除缓存项
   */
  async delete(key: string): Promise<boolean> {
    if (!this.config.enabled) {
      return false
    }

    const fullKey = this.config.keyPrefix + key
    const deleted = this.cache.delete(fullKey)

    if (deleted) {
      this.updateStats()
      this.emit('cache:delete', {
        type: 'cache:delete',
        key: fullKey,
        timestamp: Date.now(),
      })
    }

    return deleted
  }

  /**
   * 检查缓存项是否存在
   */
  async has(key: string): Promise<boolean> {
    if (!this.config.enabled) {
      return false
    }

    const fullKey = this.config.keyPrefix + key
    const item = this.cache.get(fullKey)

    if (!item) {
      return false
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(fullKey)
      return false
    }

    return true
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    this.cache.clear()
    this.resetStats()
    this.emit('cache:clear', {
      type: 'cache:clear',
      timestamp: Date.now(),
    })
  }

  /**
   * 获取缓存统计
   */
  async getStats(): Promise<CacheStats> {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * 清理过期项
   */
  private evictItems(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())

    // 首先清理过期项
    for (const [key, item] of entries) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }

    // 如果还是超出限制，根据策略清理
    if (this.cache.size >= this.config.maxSize) {
      const remainingEntries = Array.from(this.cache.entries())

      if (this.config.strategy === 'lru') {
        // 按最后访问时间排序，删除最久未访问的
        remainingEntries.sort((a, b) => a[1].lastAccess - b[1].lastAccess)
      }
      else if (this.config.strategy === 'fifo') {
        // 按创建时间排序，删除最早创建的
        remainingEntries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      }

      // 删除最旧的项直到符合大小限制
      const toDelete = remainingEntries.slice(0, remainingEntries.length - this.config.maxSize + 1)
      for (const [key] of toDelete) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.size = this.cache.size
  }

  /**
   * 重置统计信息
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      size: 0,
      maxSize: this.config.maxSize,
      memoryUsage: 0,
    }
  }

  /**
   * 估算值的大小
   */
  private estimateSize(value: any): number {
    try {
      return JSON.stringify(value).length
    }
    catch {
      return 0
    }
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.evictItems()
    }, 60000) // 每分钟清理一次
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: EventData): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data)
        }
        catch (error) {
          console.error(`Error in cache event listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * 销毁缓存服务
   */
  async destroy(): Promise<void> {
    await this.clear()
    this.listeners.clear()
  }
}
