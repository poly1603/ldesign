// 缓存策略枚举
export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  TTL = 'ttl',
}

// 缓存项接口
export interface CacheItem<T = any> {
  key: string
  value: T
  timestamp: number
  ttl?: number
  accessCount: number
  lastAccessed: number
}

// 缓存配置接口
export interface CacheConfig {
  maxSize?: number
  defaultTTL?: number
  strategy?: CacheStrategy
  enableStats?: boolean
  onEvict?: (key: string, value: any) => void
}

// 缓存统计信息
export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  size: number
  hitRate: number
}

// 缓存管理器接口
export interface CacheManager {
  get: <T = any>(key: string) => T | undefined
  set: <T = any>(key: string, value: T, ttl?: number) => void
  has: (key: string) => boolean
  delete: (key: string) => boolean
  clear: () => void
  size: () => number
  keys: () => string[]
  values: () => any[]
  entries: () => [string, any][]
  getStats: () => CacheStats
  resetStats: () => void
  namespace: (name: string) => CacheManager
}

// LRU缓存实现
class LRUCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private maxSize: number
  private stats: CacheStats

  constructor(maxSize = 100) {
    this.maxSize = maxSize
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    }
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item) {
      this.stats.misses++
      this.updateHitRate()
      return undefined
    }

    // 检查TTL
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.evictions++
      this.updateHitRate()
      return undefined
    }

    // 更新访问信息
    item.lastAccessed = Date.now()
    item.accessCount++

    // 移到最后（最近使用）
    this.cache.delete(key)
    this.cache.set(key, item)

    this.stats.hits++
    this.updateHitRate()
    return item.value
  }

  set(key: string, value: T, ttl?: number): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    // 如果超过最大容量，删除最久未使用的
    else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
      this.stats.evictions++
    }

    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
    }

    this.cache.set(key, item)
    this.stats.sets++
    this.stats.size = this.cache.size
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item)
      return false

    // 检查TTL
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      this.stats.evictions++
      this.stats.size = this.cache.size
      return false
    }

    return true
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.deletes++
      this.stats.size = this.cache.size
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  values(): T[] {
    return Array.from(this.cache.values()).map(item => item.value)
  }

  entries(): [string, T][] {
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.value])
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: this.cache.size,
      hitRate: 0,
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }
}

// 缓存管理器实现
export class CacheManagerImpl implements CacheManager {
  private cache: LRUCache
  private config: Required<CacheConfig>
  private namespaces = new Map<string, CacheManager>()

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 0, // 0表示永不过期
      strategy: CacheStrategy.LRU,
      enableStats: true,
      onEvict: () => {},
      ...config,
    }

    this.cache = new LRUCache(this.config.maxSize)
  }

  get<T = any>(key: string): T | undefined {
    return this.cache.get(key)
  }

  set<T = any>(key: string, value: T, ttl?: number): void {
    const finalTTL = ttl ?? this.config.defaultTTL
    this.cache.set(key, value, finalTTL > 0 ? finalTTL : undefined)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted && this.config.onEvict) {
      this.config.onEvict(key, undefined)
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size()
  }

  keys(): string[] {
    return this.cache.keys()
  }

  values(): any[] {
    return this.cache.values()
  }

  entries(): [string, any][] {
    return this.cache.entries()
  }

  getStats(): CacheStats {
    return this.cache.getStats()
  }

  resetStats(): void {
    this.cache.resetStats()
  }

  namespace(name: string): CacheManager {
    if (!this.namespaces.has(name)) {
      this.namespaces.set(name, new NamespacedCacheManager(this, name))
    }
    return this.namespaces.get(name)!
  }
}

// 命名空间缓存管理器
class NamespacedCacheManager implements CacheManager {
  constructor(
    private parent: CacheManager,
    private namespace: string,
  ) {}

  private getKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  get<T = any>(key: string): T | undefined {
    return this.parent.get(this.getKey(key))
  }

  set<T = any>(key: string, value: T, ttl?: number): void {
    this.parent.set(this.getKey(key), value, ttl)
  }

  has(key: string): boolean {
    return this.parent.has(this.getKey(key))
  }

  delete(key: string): boolean {
    return this.parent.delete(this.getKey(key))
  }

  clear(): void {
    const prefix = `${this.namespace}:`
    const keys = this.parent.keys().filter(key => key.startsWith(prefix))
    keys.forEach(key => this.parent.delete(key))
  }

  size(): number {
    const prefix = `${this.namespace}:`
    return this.parent.keys().filter(key => key.startsWith(prefix)).length
  }

  keys(): string[] {
    const prefix = `${this.namespace}:`
    return this.parent.keys()
      .filter(key => key.startsWith(prefix))
      .map(key => key.slice(prefix.length))
  }

  values(): any[] {
    return this.keys().map(key => this.get(key))
  }

  entries(): [string, any][] {
    return this.keys().map(key => [key, this.get(key)])
  }

  getStats(): CacheStats {
    // 命名空间缓存的统计信息是父缓存的子集
    return this.parent.getStats()
  }

  resetStats(): void {
    // 重置父缓存的统计信息
    this.parent.resetStats()
  }

  namespace(name: string): CacheManager {
    return this.parent.namespace(`${this.namespace}:${name}`)
  }
}

// 创建缓存管理器
export function createCacheManager(config?: CacheConfig): CacheManager {
  return new CacheManagerImpl(config)
}

// 全局缓存管理器
let globalCacheManager: CacheManager | undefined

export function getGlobalCacheManager(): CacheManager {
  if (!globalCacheManager) {
    globalCacheManager = createCacheManager({
      maxSize: 1000,
      defaultTTL: 30 * 60 * 1000, // 30分钟
      enableStats: true,
    })
  }
  return globalCacheManager
}

export function setGlobalCacheManager(manager: CacheManager): void {
  globalCacheManager = manager
}
