/**
 * 内存缓存
 * 提供基于内存的高性能缓存实现
 */

import type { CacheEntry, CacheStats, CacheStore, EvictionStrategy } from '../types'
import { EventEmitter } from 'node:events'

/**
 * 内存缓存选项
 */
export interface MemoryCacheOptions {
  maxSize?: number
  defaultTTL?: number
  strategy?: EvictionStrategy
  checkInterval?: number
  maxMemory?: number
}

/**
 * 内存缓存条目
 */
interface MemoryCacheEntry<T = unknown> extends CacheEntry<T> {
  accessTime: number
  accessCount: number
}

/**
 * 内存缓存类
 */
export class MemoryCache extends EventEmitter implements CacheStore {
  private cache: Map<string, MemoryCacheEntry> = new Map()
  private options: Required<MemoryCacheOptions>
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
  }

  private cleanupTimer?: NodeJS.Timeout

  constructor(options: MemoryCacheOptions = {}) {
    super()

    this.options = {
      maxSize: options.maxSize || 1000,
      defaultTTL: options.defaultTTL || 3600,
      strategy: options.strategy || 'lru',
      checkInterval: options.checkInterval || 60000, // 1分钟
      maxMemory: options.maxMemory || 100 * 1024 * 1024, // 100MB
    }

    // 启动定期清理
    this.startCleanup()
  }

  /**
   * 获取缓存值
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      this.emit('miss', key)
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.stats.misses++
      this.emit('miss', key)
      this.emit('expired', key)
      return undefined
    }

    // 更新访问信息
    entry.accessTime = Date.now()
    entry.accessCount++

    this.stats.hits++
    this.emit('hit', key)
    return entry.value as T
  }

  /**
   * 设置缓存值
   */
  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const now = Date.now()
    const expiresAt = ttl ? now + ttl * 1000 : undefined

    const entry: MemoryCacheEntry<T> = {
      value,
      expiresAt,
      createdAt: now,
      accessTime: now,
      accessCount: 1,
    }

    // 检查是否需要驱逐
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evict()
    }

    this.cache.set(key, entry)
    this.stats.sets++
    this.emit('set', key, value)

    // 检查内存使用
    this.checkMemoryUsage()
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      this.emit('expired', key)
      return false
    }

    return true
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
      this.emit('delete', key)
    }
    return deleted
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    this.cache.clear()
    this.resetStats()
    this.emit('clear')
  }

  /**
   * 批量获取
   */
  async mget<T = unknown>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>()

    for (const key of keys) {
      const value = await this.get<T>(key)
      if (value !== undefined) {
        results.set(key, value)
      }
    }

    return results
  }

  /**
   * 批量设置
   */
  async mset<T = unknown>(entries: Map<string, T>, ttl?: number): Promise<void> {
    for (const [key, value] of entries) {
      await this.set(key, value, ttl)
    }
  }

  /**
   * 批量删除
   */
  async mdel(keys: string[]): Promise<number> {
    let deleted = 0
    for (const key of keys) {
      if (await this.delete(key)) {
        deleted++
      }
    }
    return deleted
  }

  /**
   * 获取所有键
   */
  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys())

    if (!pattern) {
      return allKeys
    }

    // 简单的通配符匹配
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))
    return allKeys.filter(key => regex.test(key))
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    entry.expiresAt = Date.now() + ttl * 1000
    return true
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    const entry = this.cache.get(key)
    if (!entry || !entry.expiresAt) {
      return -1
    }

    const remaining = entry.expiresAt - Date.now()
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<CacheStats> {
    const memoryUsage = this.calculateMemoryUsage()

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      keys: this.cache.size,
      size: this.cache.size,
      memory: memoryUsage,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      evictions: this.stats.evictions,
    }
  }

  /**
   * 检查条目是否过期
   */
  private isExpired(entry: MemoryCacheEntry): boolean {
    return entry.expiresAt ? Date.now() > entry.expiresAt : false
  }

  /**
   * 驱逐策略
   */
  private evict(): void {
    if (this.cache.size === 0)
      return

    let keyToEvict: string | undefined

    switch (this.options.strategy) {
      case 'lru':
        keyToEvict = this.findLRUKey()
        break
      case 'lfu':
        keyToEvict = this.findLFUKey()
        break
      case 'fifo':
        keyToEvict = this.findFIFOKey()
        break
      case 'random':
        keyToEvict = this.findRandomKey()
        break
      default:
        keyToEvict = this.findLRUKey()
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict)
      this.stats.evictions++
      this.emit('evicted', keyToEvict)
    }
  }

  /**
   * 查找最近最少使用的键
   */
  private findLRUKey(): string | undefined {
    let oldestTime = Date.now()
    let oldestKey: string | undefined

    for (const [key, entry] of this.cache) {
      if (entry.accessTime < oldestTime) {
        oldestTime = entry.accessTime
        oldestKey = key
      }
    }

    return oldestKey
  }

  /**
   * 查找最少使用的键
   */
  private findLFUKey(): string | undefined {
    let minCount = Infinity
    let leastUsedKey: string | undefined

    for (const [key, entry] of this.cache) {
      if (entry.accessCount < minCount) {
        minCount = entry.accessCount
        leastUsedKey = key
      }
    }

    return leastUsedKey
  }

  /**
   * 查找最早创建的键
   */
  private findFIFOKey(): string | undefined {
    let oldestTime = Date.now()
    let oldestKey: string | undefined

    for (const [key, entry] of this.cache) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt
        oldestKey = key
      }
    }

    return oldestKey
  }

  /**
   * 随机选择键
   */
  private findRandomKey(): string | undefined {
    const keys = Array.from(this.cache.keys())
    return keys[Math.floor(Math.random() * keys.length)]
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.checkInterval)
  }

  /**
   * 清理过期条目
   */
  private cleanup(): void {
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key)
      this.emit('expired', key)
    }

    if (expiredKeys.length > 0) {
      this.emit('cleanup', expiredKeys.length)
    }
  }

  /**
   * 检查内存使用
   */
  private checkMemoryUsage(): void {
    const memoryUsage = this.calculateMemoryUsage()

    if (memoryUsage > this.options.maxMemory) {
      // 驱逐一些条目以释放内存
      const targetSize = Math.floor(this.cache.size * 0.8)
      while (this.cache.size > targetSize) {
        this.evict()
      }
      this.emit('memoryPressure', { usage: memoryUsage, limit: this.options.maxMemory })
    }
  }

  /**
   * 计算内存使用量（估算）
   */
  private calculateMemoryUsage(): number {
    let totalSize = 0

    for (const [key, entry] of this.cache) {
      // 估算键和值的内存占用
      totalSize += key.length * 2 // 字符串按UTF-16计算
      totalSize += this.estimateValueSize(entry.value)
      totalSize += 64 // 条目元数据的估算大小
    }

    return totalSize
  }

  /**
   * 估算值的大小
   */
  private estimateValueSize(value: unknown): number {
    if (value === null || value === undefined) {
      return 8
    }

    if (typeof value === 'string') {
      return value.length * 2
    }

    if (typeof value === 'number') {
      return 8
    }

    if (typeof value === 'boolean') {
      return 4
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value).length * 2
      }
      catch {
        return 1024 // 默认估算
      }
    }

    return 64 // 默认估算
  }

  /**
   * 重置统计信息
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
    }
  }

  /**
   * 销毁缓存
   */
  async destroy(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }

    await this.clear()
    this.removeAllListeners()
  }

  /**
   * 创建内存缓存实例
   */
  static create(options?: MemoryCacheOptions): MemoryCache {
    return new MemoryCache(options)
  }
}
