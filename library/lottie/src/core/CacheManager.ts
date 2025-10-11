import type { CacheItem } from '../types'

/**
 * 缓存管理器
 */
export class CacheManager {
  private cache: Map<string, CacheItem> = new Map()
  private maxSize: number // 最大缓存大小 (MB)
  private ttl: number // 缓存过期时间 (ms)
  private currentSize: number = 0 // 当前缓存大小 (bytes)
  private hits: number = 0
  private misses: number = 0

  constructor(maxSize: number = 50, ttl: number = 3600000) {
    this.maxSize = maxSize * 1024 * 1024 // 转换为 bytes
    this.ttl = ttl
  }

  /**
   * 设置缓存
   */
  set(key: string, data: any): boolean {
    // 计算数据大小
    const size = this.calculateSize(data)

    // 如果超过最大大小，不缓存
    if (size > this.maxSize) {
      console.warn('[CacheManager] Data too large to cache')
      return false
    }

    // 如果添加后超过最大大小，清理旧缓存
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictOldest()
    }

    // 如果 key 已存在，先删除旧的
    if (this.cache.has(key)) {
      const old = this.cache.get(key)!
      this.currentSize -= old.size
    }

    // 添加新缓存
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size,
    })
    this.currentSize += size

    return true
  }

  /**
   * 获取缓存
   */
  get(key: string): any | null {
    const item = this.cache.get(key)

    if (!item) {
      this.misses++
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.delete(key)
      this.misses++
      return null
    }

    this.hits++
    return item.data
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    this.currentSize -= item.size
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.currentSize = 0
    this.hits = 0
    this.misses = 0
  }

  /**
   * 获取缓存命中率
   */
  getHitRate(): number {
    const total = this.hits + this.misses
    return total === 0 ? 0 : Math.round((this.hits / total) * 100) / 100
  }

  /**
   * 获取当前缓存大小 (MB)
   */
  getCurrentSize(): number {
    return Math.round(this.currentSize / 1024 / 1024 * 100) / 100
  }

  /**
   * 驱逐最旧的缓存
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime: number = Infinity

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    })

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  /**
   * 计算数据大小 (bytes)
   * 这是一个粗略的估算
   */
  private calculateSize(data: any): number {
    const str = JSON.stringify(data)
    return new Blob([str]).size
  }

  /**
   * 清理过期缓存
   */
  cleanExpired(): number {
    let cleaned = 0
    const now = Date.now()

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > this.ttl) {
        this.delete(key)
        cleaned++
      }
    })

    return cleaned
  }
}
