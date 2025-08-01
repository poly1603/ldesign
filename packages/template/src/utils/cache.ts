import type { TemplateComponent, TemplateMetadata } from '@/types'

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  /** 缓存的值 */
  value: T
  /** 创建时间 */
  createdAt: number
  /** 最后访问时间 */
  lastAccessedAt: number
  /** 访问次数 */
  accessCount: number
  /** 过期时间（可选） */
  expiresAt?: number
}

/**
 * LRU 缓存管理器
 */
export class LRUCache<K, V> {
  private cache = new Map<K, CacheItem<V>>()
  private maxSize: number
  private defaultTTL?: number

  constructor(maxSize = 50, defaultTTL?: number) {
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  /**
   * 设置缓存项
   */
  set(key: K, value: V, ttl?: number): void {
    const now = Date.now()
    const expiresAt = ttl ? now + ttl : (this.defaultTTL ? now + this.defaultTTL : undefined)

    // 如果已存在，更新值
    if (this.cache.has(key)) {
      const item = this.cache.get(key)!
      item.value = value
      item.lastAccessedAt = now
      item.accessCount++
      item.expiresAt = expiresAt
      return
    }

    // 检查缓存大小限制
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed()
    }

    // 添加新项
    this.cache.set(key, {
      value,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 1,
      expiresAt,
    })
  }

  /**
   * 获取缓存项
   */
  get(key: K): V | undefined {
    const item = this.cache.get(key)
    if (!item)
      return undefined

    // 检查是否过期
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return undefined
    }

    // 更新访问信息
    const now = Date.now()
    item.lastAccessedAt = now
    item.accessCount++

    // 重新插入以更新 Map 中的顺序（LRU 策略）
    this.cache.delete(key)
    this.cache.set(key, item)

    return item.value
  }

  /**
   * 检查是否存在
   */
  has(key: K): boolean {
    const item = this.cache.get(key)
    if (!item)
      return false

    // 检查是否过期
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存项
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
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
   * 获取所有键
   */
  keys(): K[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const items = Array.from(this.cache.values())
    const now = Date.now()

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccess: items.reduce((sum, item) => sum + item.accessCount, 0),
      averageAge: items.length > 0
        ? items.reduce((sum, item) => sum + (now - item.createdAt), 0) / items.length
        : 0,
      expiredCount: items.filter(item => item.expiresAt && now > item.expiresAt).length,
    }
  }

  /**
   * 清理过期项
   */
  cleanup(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  /**
   * 淘汰最少使用的项
   */
  private evictLeastRecentlyUsed(): void {
    let lruKey: K | undefined
    let lruTime = Infinity

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessedAt < lruTime) {
        lruTime = item.lastAccessedAt
        lruKey = key
      }
    }

    if (lruKey !== undefined) {
      this.cache.delete(lruKey)
    }
  }
}

/**
 * 模板缓存管理器
 */
export class TemplateCache {
  private componentCache: LRUCache<string, TemplateComponent>
  private metadataCache: LRUCache<string, TemplateMetadata>
  private preloadQueue = new Set<string>()
  private hits = 0
  private misses = 0

  constructor(maxSize = 50, ttl?: number) {
    this.componentCache = new LRUCache(maxSize, ttl)
    this.metadataCache = new LRUCache(maxSize * 2, ttl) // 元数据缓存更多
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(category: string, device: string, template: string): string {
    return `${category}:${device}:${template}`
  }

  /**
   * 缓存模板组件
   */
  setComponent(
    category: string,
    device: string,
    template: string,
    component: TemplateComponent,
  ): void {
    const key = this.getCacheKey(category, device, template)
    this.componentCache.set(key, component)
  }

  /**
   * 获取缓存的模板组件
   */
  getComponent(category: string, device: string, template: string): TemplateComponent | undefined {
    const key = this.getCacheKey(category, device, template)
    return this.componentCache.get(key)
  }

  /**
   * 缓存模板元数据
   */
  setMetadata(
    category: string,
    device: string,
    template: string,
    metadata: TemplateMetadata,
  ): void {
    const key = this.getCacheKey(category, device, template)
    this.metadataCache.set(key, metadata)
  }

  /**
   * 获取缓存的模板元数据
   */
  getMetadata(category: string, device: string, template: string): TemplateMetadata | undefined {
    const key = this.getCacheKey(category, device, template)
    return this.metadataCache.get(key)
  }

  /**
   * 检查模板是否已缓存
   */
  hasComponent(category: string, device: string, template: string): boolean {
    const key = this.getCacheKey(category, device, template)
    return this.componentCache.has(key)
  }

  /**
   * 添加到预加载队列
   */
  addToPreloadQueue(category: string, device: string, template: string): void {
    const key = this.getCacheKey(category, device, template)
    this.preloadQueue.add(key)
  }

  /**
   * 从预加载队列移除
   */
  removeFromPreloadQueue(category: string, device: string, template: string): void {
    const key = this.getCacheKey(category, device, template)
    this.preloadQueue.delete(key)
  }

  /**
   * 获取预加载队列
   */
  getPreloadQueue(): string[] {
    return Array.from(this.preloadQueue)
  }

  /**
   * 清空预加载队列
   */
  clearPreloadQueue(): void {
    this.preloadQueue.clear()
  }

  /**
   * 删除指定模板的缓存
   */
  deleteTemplate(category: string, device: string, template: string): void {
    const key = this.getCacheKey(category, device, template)
    this.componentCache.delete(key)
    this.metadataCache.delete(key)
    this.preloadQueue.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.componentCache.clear()
    this.metadataCache.clear()
    this.preloadQueue.clear()
  }

  /**
   * 清理过期缓存
   */
  cleanup(): { components: number, metadata: number } {
    return {
      components: this.componentCache.cleanup(),
      metadata: this.metadataCache.cleanup(),
    }
  }

  // 为了兼容测试，添加基础缓存方法
  set(key: string, value: any, ttl?: number): void {
    this.componentCache.set(key, value, ttl)
  }

  get(key: string): any {
    const result = this.componentCache.get(key)
    if (result !== undefined) {
      this.hits++
    }
    else {
      this.misses++
    }
    return result
  }

  has(key: string): boolean {
    return this.componentCache.has(key)
  }

  delete(key: string): boolean {
    return this.componentCache.delete(key)
  }

  get size(): number {
    return this.componentCache.size
  }

  resetStats(): void {
    // 重置统计信息的实现
    this.hits = 0
    this.misses = 0
  }

  // 重写 getStats 方法以兼容测试
  getStats() {
    const componentStats = this.componentCache.getStats()
    return {
      hits: this.hits,
      misses: this.misses,
      components: componentStats,
      metadata: this.metadataCache.getStats(),
      preloadQueue: this.preloadQueue.size,
    }
  }
}
