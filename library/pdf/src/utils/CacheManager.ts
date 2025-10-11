import type { CacheItem } from '../types'

/**
 * 缓存管理器
 * 使用LRU（Least Recently Used）算法管理缓存
 */
export class CacheManager<T> {
  private cache: Map<string, CacheItem<T>> = new Map()
  private maxSize: number
  private ttl: number // Time to live in milliseconds

  /**
   * @param maxSize 最大缓存数量
   * @param ttl 缓存生存时间（毫秒），默认30分钟
   */
  constructor(maxSize: number = 50, ttl: number = 30 * 60 * 1000) {
    this.maxSize = maxSize
    this.ttl = ttl
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   */
  set(key: string, value: T): void {
    // 如果缓存已满，删除最少使用的项
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const lruKey = this.findLRU()
      if (lruKey) {
        this.cache.delete(lruKey)
      }
    }

    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      accessCount: 0
    }

    this.cache.set(key, item)
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在或已过期则返回undefined
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key)

    if (!item) {
      return undefined
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return undefined
    }

    // 更新访问信息
    item.accessCount++
    item.timestamp = Date.now()

    return item.value
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   */
  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空所��缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > this.ttl) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * 查找最少使用的缓存项
   * @private
   */
  private findLRU(): string | null {
    let lruKey: string | null = null
    let minAccessCount = Infinity
    let oldestTime = Infinity

    this.cache.forEach((item, key) => {
      // 首先按访问次数排序，次数相同则按时间戳排序
      if (item.accessCount < minAccessCount ||
          (item.accessCount === minAccessCount && item.timestamp < oldestTime)) {
        lruKey = key
        minAccessCount = item.accessCount
        oldestTime = item.timestamp
      }
    })

    return lruKey
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    let totalAccessCount = 0
    let oldestTimestamp = Date.now()
    let newestTimestamp = 0

    this.cache.forEach(item => {
      totalAccessCount += item.accessCount
      oldestTimestamp = Math.min(oldestTimestamp, item.timestamp)
      newestTimestamp = Math.max(newestTimestamp, item.timestamp)
    })

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccessCount,
      averageAccessCount: this.cache.size > 0 ? totalAccessCount / this.cache.size : 0,
      oldestTimestamp,
      newestTimestamp
    }
  }
}
