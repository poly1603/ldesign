/**
 * 数据缓存
 * 
 * 提供数据缓存功能，提高数据访问性能
 */

import type { DataCache as IDataCache, CacheItem } from './types'

/**
 * 数据缓存类
 */
export class DataCache implements IDataCache {
  private cache: Map<string, CacheItem> = new Map()
  private maxSize: number
  private defaultExpiry: number
  private hitCount = 0
  private missCount = 0
  private cleanupTimer?: number

  constructor(options?: {
    maxSize?: number
    defaultExpiry?: number
    cleanupInterval?: number
  }) {
    this.maxSize = options?.maxSize || 1000
    this.defaultExpiry = options?.defaultExpiry || 300000 // 5分钟

    // 启动定期清理
    const cleanupInterval = options?.cleanupInterval || 60000 // 1分钟
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, cleanupInterval)
  }

  /**
   * 获取缓存数据
   */
  get(key: string): CacheItem | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.missCount++
      return null
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      this.missCount++
      return null
    }

    // 更新访问统计
    item.accessCount++
    item.lastAccessedAt = Date.now()
    this.hitCount++

    return item
  }

  /**
   * 设置缓存数据
   */
  set(key: string, data: any, expiry?: number): void {
    const now = Date.now()
    const expiryTime = expiry || this.defaultExpiry

    const item: CacheItem = {
      data,
      createdAt: now,
      expiresAt: now + expiryTime,
      accessCount: 0,
      lastAccessedAt: now
    }

    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLeastRecentlyUsed()
    }

    this.cache.set(key, item)
  }

  /**
   * 删除缓存数据
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    size: number
    hitRate: number
    missRate: number
  } {
    const totalRequests = this.hitCount + this.missCount
    
    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      missRate: totalRequests > 0 ? this.missCount / totalRequests : 0
    }
  }

  /**
   * 获取详细统计信息
   */
  getDetailedStats(): {
    size: number
    maxSize: number
    hitCount: number
    missCount: number
    hitRate: number
    missRate: number
    items: Array<{
      key: string
      size: number
      createdAt: number
      expiresAt: number
      accessCount: number
      lastAccessedAt: number
    }>
  } {
    const stats = this.getStats()
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      size: this.estimateSize(item.data),
      createdAt: item.createdAt,
      expiresAt: item.expiresAt,
      accessCount: item.accessCount,
      lastAccessedAt: item.lastAccessedAt
    }))

    return {
      ...stats,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      items
    }
  }

  /**
   * 设置最大缓存大小
   */
  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize
    
    // 如果当前缓存超过新的限制，进行清理
    while (this.cache.size > this.maxSize) {
      this.evictLeastRecentlyUsed()
    }
  }

  /**
   * 设置默认过期时间
   */
  setDefaultExpiry(expiry: number): void {
    this.defaultExpiry = expiry
  }

  /**
   * 检查键是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) {
      return false
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    // 清理过期项
    this.cleanup()
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存大小（字节估算）
   */
  getSize(): number {
    let totalSize = 0
    for (const [key, item] of this.cache.entries()) {
      totalSize += key.length * 2 // 字符串按2字节计算
      totalSize += this.estimateSize(item.data)
      totalSize += 64 // CacheItem 元数据大小估算
    }
    return totalSize
  }

  /**
   * 刷新缓存项的过期时间
   */
  refresh(key: string, expiry?: number): boolean {
    const item = this.cache.get(key)
    if (!item) {
      return false
    }

    const expiryTime = expiry || this.defaultExpiry
    item.expiresAt = Date.now() + expiryTime
    return true
  }

  /**
   * 批量设置缓存
   */
  setMultiple(items: Array<{ key: string; data: any; expiry?: number }>): void {
    for (const item of items) {
      this.set(item.key, item.data, item.expiry)
    }
  }

  /**
   * 批量获取缓存
   */
  getMultiple(keys: string[]): Map<string, any> {
    const result = new Map<string, any>()
    
    for (const key of keys) {
      const item = this.get(key)
      if (item) {
        result.set(key, item.data)
      }
    }
    
    return result
  }

  /**
   * 批量删除缓存
   */
  deleteMultiple(keys: string[]): void {
    for (const key of keys) {
      this.delete(key)
    }
  }

  /**
   * 根据模式删除缓存
   */
  deleteByPattern(pattern: RegExp): number {
    let deletedCount = 0
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        deletedCount++
      }
    }
    
    return deletedCount
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    
    this.clear()
  }

  /**
   * 清理过期项
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key)
    }
  }

  /**
   * 驱逐最少使用的项
   */
  private evictLeastRecentlyUsed(): void {
    let lruKey: string | null = null
    let lruTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessedAt < lruTime) {
        lruTime = item.lastAccessedAt
        lruKey = key
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey)
    }
  }

  /**
   * 估算数据大小
   */
  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2 // 按2字节计算
    } catch {
      return 0
    }
  }
}
