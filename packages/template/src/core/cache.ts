/**
 * 缓存管理器
 *
 * 基于LRU/LFU算法的高性能缓存系统
 */

import type { Component } from 'vue'
import type { CacheConfig, CacheStats, CacheStrategy } from '../types'
import { getGlobalEmitter } from './events'

/**
 * 缓存项
 */
interface CacheEntry<T = Component> {
  key: string
  value: T
  timestamp: number
  accessCount: number
  lastAccess: number
}

/**
 * 缓存管理器类
 */
export class CacheManager<T = Component> {
  private cache = new Map<string, CacheEntry<T>>()
  private config: Required<CacheConfig>
  private accessOrder: string[] = []
  private hitCount = 0
  private missCount = 0
  private evictCount = 0
  private emitter = getGlobalEmitter()

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      strategy: config.strategy || 'lru',
      maxSize: config.maxSize || 50,
      ttl: config.ttl || 0,
    }
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | null {
    if (!this.config.enabled)
return null

    const entry = this.cache.get(key)
    if (!entry) {
      this.missCount++
      this.emitter.emit('cache:miss', { key })
      return null
    }

    // 检查TTL
    if (this.config.ttl > 0) {
      const now = Date.now()
      if (now - entry.timestamp > this.config.ttl) {
        this.delete(key)
        this.missCount++
        this.emitter.emit('cache:miss', { key, reason: 'expired' })
        return null
      }
    }

    // 更新访问信息
    entry.lastAccess = Date.now()
    entry.accessCount++

    // 更新访问顺序
    this.updateAccessOrder(key)

    this.hitCount++
    this.emitter.emit('cache:hit', { key })

    return entry.value
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T): void {
    if (!this.config.enabled)
return

    // 检查是否需要清理空间
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evict()
    }

    // 创建或更新缓存项
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      accessCount: this.cache.has(key) ? this.cache.get(key)!.accessCount : 0,
      lastAccess: Date.now(),
    }

    this.cache.set(key, entry)
    this.updateAccessOrder(key)
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key)
    if (result) {
      const index = this.accessOrder.indexOf(key)
      if (index > -1) {
        this.accessOrder.splice(index, 1)
      }
    }
    return result
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    if (!this.config.enabled)
return false

    if (!this.cache.has(key))
return false

    // 检查TTL
    if (this.config.ttl > 0) {
      const entry = this.cache.get(key)!
      const now = Date.now()
      if (now - entry.timestamp > this.config.ttl) {
        this.delete(key)
        return false
      }
    }

    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.hitCount = 0
    this.missCount = 0
    this.evictCount = 0
  }

  /**
   * 更新访问顺序
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)

    switch (this.config.strategy) {
      case 'lru':
        // LRU: 移到队尾
        if (index > -1) {
          this.accessOrder.splice(index, 1)
        }
        this.accessOrder.push(key)
        break

      case 'lfu':
        // LFU: 不需要维护顺序，根据访问次数淘汰
        if (index === -1) {
          this.accessOrder.push(key)
        }
        break

      case 'fifo':
        // FIFO: 只在首次添加时加入队列
        if (index === -1) {
          this.accessOrder.push(key)
        }
        break
    }
  }

  /**
   * 淘汰缓存项
   */
  private evict(): void {
    if (this.cache.size === 0)
return

    let keyToEvict: string | null = null

    switch (this.config.strategy) {
      case 'lru':
        // 删除最久未使用的
        keyToEvict = this.accessOrder[0] || null
        break

      case 'lfu':
        // 删除访问次数最少的
        keyToEvict = this.findLeastFrequentlyUsed()
        break

      case 'fifo':
        // 删除最早添加的
        keyToEvict = this.accessOrder[0] || null
        break

      case 'none':
        // 不淘汰
        return
    }

    if (keyToEvict) {
      this.delete(keyToEvict)
      this.evictCount++
      this.emitter.emit('cache:evict', { key: keyToEvict })
    }
  }

  /**
   * 查找访问次数最少的key
   */
  private findLeastFrequentlyUsed(): string | null {
    if (this.cache.size === 0)
return null

    let minCount = Infinity
    let leastUsedKey: string | null = null

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < minCount) {
        minCount = entry.accessCount
        leastUsedKey = key
      }
    }

    return leastUsedKey
  }

  /**
   * 预热缓存
   */
  async warmup(keys: string[], loader: (key: string) => Promise<T>): Promise<void> {
    for (const key of keys) {
      if (!this.has(key)) {
        try {
          const value = await loader(key)
          this.set(key, value)
        }
 catch (error) {
          console.error(`[Cache] Warmup failed for key: ${key}`, error)
        }
      }
    }
  }

  /**
   * 设置缓存策略
   */
  setStrategy(strategy: CacheStrategy): void {
    this.config.strategy = strategy
    // 重置访问顺序
    this.accessOrder = Array.from(this.cache.keys())
  }

  /**
   * 设置TTL
   */
  setTTL(ttl: number): void {
    this.config.ttl = ttl
  }

  /**
   * 设置最大缓存数
   */
  setMaxSize(maxSize: number): void {
    this.config.maxSize = maxSize
    // 如果当前缓存超过最大值，进行淘汰
    while (this.cache.size > maxSize) {
      this.evict()
    }
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const total = this.hitCount + this.missCount
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      evictCount: this.evictCount,
      hitRate: total > 0 ? this.hitCount / total : 0,
    }
  }

  /**
   * 获取配置
   */
  getConfig(): Required<CacheConfig> {
    return { ...this.config }
  }
}

// 单例实例
let instance: CacheManager | null = null

/**
 * 获取缓存管理器实例
 */
export function getCache(): CacheManager {
  if (!instance) {
    instance = new CacheManager()
  }
  return instance
}

/**
 * 重置缓存管理器
 */
export function resetCache(): void {
  if (instance) {
    instance.clear()
    instance = null
  }
}
