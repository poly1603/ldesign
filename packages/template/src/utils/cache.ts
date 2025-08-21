/**
 * 缓存工具模块
 *
 * 提供 LRU 缓存和模板缓存功能
 */

export interface CacheItem<T = any> {
  value: T
  timestamp: number
  ttl?: number
}

/**
 * LRU 缓存实现
 */
export class LRUCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private maxSize: number
  private defaultTTL?: number

  constructor(maxSize = 100, defaultTTL?: number) {
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)
    if (!item)
      return undefined

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      return undefined
    }

    // 移动到最前面（LRU 策略）
    this.cache.delete(key)
    this.cache.set(key, item)

    return item.value
  }

  set(key: string, value: T, ttl?: number): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // 如果超过最大容量，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    // 添加新项
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item)
      return false

    if (this.isExpired(item)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  private isExpired(item: CacheItem<T>): boolean {
    if (!item.ttl)
      return false
    return Date.now() - item.timestamp > item.ttl
  }
}

/**
 * 模板缓存类
 */
export class TemplateCache {
  private cache: LRUCache<any>
  private stats = {
    hits: 0,
    misses: 0,
  }

  constructor(maxSize = 50, defaultTTL = 5 * 60 * 1000) {
    // 默认 5 分钟 TTL
    this.cache = new LRUCache(maxSize, defaultTTL)
  }

  get(key: string) {
    const result = this.cache.get(key)
    if (result) {
      this.stats.hits++
    }
    else {
      this.stats.misses++
    }
    return result
  }

  set(key: string, template: any, ttl?: number) {
    this.cache.set(key, template, ttl)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return this.cache.keys()
  }

  // 生成缓存键
  generateKey(category: string, device: string, template: string): string {
    return `${category}:${device}:${template}`
  }

  // 缓存模板
  cacheTemplate(category: string, device: string, template: string, component: any, ttl?: number) {
    const key = this.generateKey(category, device, template)
    this.set(key, component, ttl)
  }

  // 获取缓存的模板
  getCachedTemplate(category: string, device: string, template: string) {
    const key = this.generateKey(category, device, template)
    return this.get(key)
  }

  // 检查模板是否已缓存
  hasTemplate(category: string, device: string, template: string): boolean {
    const key = this.generateKey(category, device, template)
    return this.has(key)
  }

  // 删除模板缓存
  deleteTemplate(category: string, device: string, template: string): boolean {
    const key = this.generateKey(category, device, template)
    return this.delete(key)
  }

  // 获取缓存统计
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    }
  }

  // 重置统计
  resetStats() {
    this.stats.hits = 0
    this.stats.misses = 0
  }
}
