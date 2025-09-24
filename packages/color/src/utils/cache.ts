/**
 * 缓存系统实现
 * 提供基础缓存和LRU缓存功能
 */

export interface Cache<K, V> {
  get: (key: K) => V | undefined
  set: (key: K, value: V, ttl?: number) => this
  has: (key: K) => boolean
  delete: (key: K) => boolean
  clear: () => void
  readonly size: number
  keys: () => IterableIterator<K>
  values: () => IterableIterator<V>
  entries: () => IterableIterator<[K, V]>
  forEach: (callback: (value: V, key: K, cache: this) => void) => void
}

export interface LRUCache<K, V> extends Cache<K, V> {
  readonly capacity: number
  getStats: () => CacheStats
  resetStats: () => void
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
}

/**
 * 基础缓存实现
 */
export class CacheImpl<K, V> implements Cache<K, V> {
  private data: Map<K, V>

  constructor(entries?: Iterable<[K, V]> | Map<K, V>) {
    if (entries instanceof Map) {
      this.data = new Map(entries)
    }
    else if (entries) {
      this.data = new Map(entries)
    }
    else {
      this.data = new Map()
    }
  }

  get(key: K): V | undefined {
    return this.data.get(key)
  }

  set(key: K, value: V): this {
    this.data.set(key, value)
    return this
  }

  has(key: K): boolean {
    return this.data.has(key)
  }

  delete(key: K): boolean {
    return this.data.delete(key)
  }

  clear(): void {
    this.data.clear()
  }

  get size(): number {
    return this.data.size
  }

  keys(): IterableIterator<K> {
    return this.data.keys()
  }

  values(): IterableIterator<V> {
    return this.data.values()
  }

  entries(): IterableIterator<[K, V]> {
    return this.data.entries()
  }

  forEach(callback: (value: V, key: K, cache: this) => void): void {
    this.data.forEach((value, key) => callback(value, key, this))
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.data[Symbol.iterator]()
  }
}

interface CacheItem<V> {
  value: V
  accessTime: number
  expireTime?: number
}

/**
 * LRU缓存实现
 */
export class LRUCacheImpl<K, V> implements LRUCache<K, V> {
  private data: Map<K, CacheItem<V>>
  private readonly maxCapacity: number
  private stats: CacheStats

  constructor(capacity: number, entries?: Iterable<[K, V]>) {
    if (capacity < 0) {
      throw new Error('Cache capacity must be non-negative')
    }

    this.maxCapacity = capacity
    this.data = new Map()
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
    }

    if (entries && capacity > 0) {
      for (const [key, value] of entries) {
        this.set(key, value)
      }
    }
  }

  get capacity(): number {
    return this.maxCapacity
  }

  get(key: K): V | undefined {
    this.cleanupExpired()

    const item = this.data.get(key)
    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      return undefined
    }

    if (item.expireTime && Date.now() > item.expireTime) {
      this.data.delete(key)
      this.stats.misses++
      this.updateHitRate()
      return undefined
    }

    // 更新访问时间并重新插入以更新Map中的位置
    const now = Date.now()
    this.data.delete(key)
    this.data.set(key, {
      ...item,
      accessTime: now,
    })
    this.stats.hits++
    this.updateHitRate()

    return item.value
  }

  set(key: K, value: V, ttl?: number): this {
    if (this.maxCapacity === 0) {
      return this
    }

    this.cleanupExpired()

    const now = Date.now()
    const expireTime = ttl ? now + ttl : undefined

    if (this.data.has(key)) {
      // 更新现有项 - 需要重新插入以更新Map中的位置
      this.data.get(key)
      this.data.delete(key) // 先删除
      this.data.set(key, {
        // 再重新插入到最后
        value,
        accessTime: now,
        expireTime,
      })
    }
    else {
      // 添加新项
      if (this.data.size >= this.maxCapacity) {
        this.evictLRU()
      }

      this.data.set(key, {
        value,
        accessTime: now,
        expireTime,
      })
    }

    return this
  }

  has(key: K): boolean {
    this.cleanupExpired()

    const item = this.data.get(key)
    if (!item) {
      return false
    }

    if (item.expireTime && Date.now() > item.expireTime) {
      this.data.delete(key)
      return false
    }

    // 更新访问时间并重新插入以更新Map中的位置
    const now = Date.now()
    this.data.delete(key)
    this.data.set(key, {
      ...item,
      accessTime: now,
    })
    return true
  }

  delete(key: K): boolean {
    return this.data.delete(key)
  }

  clear(): void {
    this.data.clear()
  }

  get size(): number {
    this.cleanupExpired()
    return this.data.size
  }

  keys(): IterableIterator<K> {
    this.cleanupExpired()
    return this.data.keys()
  }

  values(): IterableIterator<V> {
    this.cleanupExpired()
    const values = Array.from(this.data.values()).map(item => item.value)
    return values[Symbol.iterator]()
  }

  entries(): IterableIterator<[K, V]> {
    this.cleanupExpired()
    const entries = Array.from(this.data.entries()).map(
      ([key, item]) => [key, item.value] as [K, V],
    )

    return entries[Symbol.iterator]()
  }

  forEach(callback: (value: V, key: K, cache: this) => void): void {
    this.cleanupExpired()
    for (const [key, value] of this.entries()) {
      callback(value, key, this)
    }
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries()
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
    }
  }

  private cleanupExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.data) {
      if (item.expireTime && now > item.expireTime) {
        this.data.delete(key)
      }
    }
  }

  private evictLRU(): void {
    // Map的迭代顺序是插入顺序，最早插入的在前面
    // 由于我们在访问时重新插入，最少使用的应该在Map的前面
    const firstEntry = this.data.entries().next()
    if (!firstEntry.done) {
      this.data.delete(firstEntry.value[0])
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }
}

/**
 * 创建基础缓存
 */
export function createCache<K, V>(entries?: Iterable<[K, V]> | Map<K, V>): Cache<K, V> {
  return new CacheImpl(entries)
}

/**
 * 创建LRU缓存
 */
export function createLRUCache<K, V>(capacity: number, entries?: Iterable<[K, V]>): LRUCache<K, V> {
  return new LRUCacheImpl(capacity, entries)
}
