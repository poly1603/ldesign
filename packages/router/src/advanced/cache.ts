import type { RouteCacheConfig, RouteLocationNormalized } from '../types'

/**
 * 缓存项
 */
interface CacheItem {
  route: RouteLocationNormalized
  component?: any
  data?: any
  timestamp: number
  accessCount: number
  lastAccess: number
  size: number
  hitCount: number
  expiresAt: number
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  size: number
  maxSize: number
  hitRate: number
  totalHits: number
  totalMisses: number
  totalRequests: number
  timeSaved: number
  memoryUsage: number
}

/**
 * 缓存事件
 */
export interface CacheEvents {
  'cache:hit': (key: string, item: CacheItem) => void
  'cache:miss': (key: string) => void
  'cache:set': (key: string, item: CacheItem) => void
  'cache:evict': (key: string, reason: 'lru' | 'ttl' | 'manual') => void
  'cache:clear': () => void
}

/**
 * 路由缓存管理器
 */
export class RouteCacheManager {
  private cache = new Map<string, CacheItem>()
  private config: Required<RouteCacheConfig>
  private eventListeners = new Map<keyof CacheEvents, Function[]>()
  private cleanupTimer?: number

  // 统计信息
  private stats = {
    totalHits: 0,
    totalMisses: 0,
    totalRequests: 0,
    timeSaved: 0,
    memoryUsage: 0,
  }

  constructor(config: RouteCacheConfig = {}) {
    this.config = {
      max: config.max || 10,
      ttl: config.ttl || 5 * 60 * 1000, // 5分钟
      include: config.include || [],
      exclude: config.exclude || [],
    }

    // 启动定期清理
    this.startCleanupTimer()
  }

  /**
   * 添加路由到缓存
   */
  set(route: RouteLocationNormalized, component?: any, data?: any): void {
    const key = this.getRouteKey(route)

    // 检查是否应该缓存
    if (!this.shouldCache(route)) {
      return
    }

    const now = Date.now()
    const existing = this.cache.get(key)

    if (existing) {
      // 更新现有缓存
      existing.lastAccess = now
      existing.accessCount++
      existing.expiresAt = now + this.config.ttl
      if (component) existing.component = component
      if (data) existing.data = data
    } else {
      // 检查缓存容量
      if (this.cache.size >= this.config.max) {
        this.evictLeastUsed()
      }

      // 估算缓存项大小
      const size = this.estimateSize(route, component, data)

      const item: CacheItem = {
        route,
        component,
        data,
        timestamp: now,
        accessCount: 1,
        lastAccess: now,
        size,
        hitCount: 0,
        expiresAt: now + this.config.ttl,
      }

      this.cache.set(key, item)
      this.stats.memoryUsage += size
      this.emit('cache:set', key, item)
    }
  }

  /**
   * 从缓存获取路由
   */
  get(
    key: string
  ): { route: RouteLocationNormalized; component?: any; data?: any } | null {
    const item = this.cache.get(key)

    this.stats.totalRequests++

    if (!item) {
      this.stats.totalMisses++
      this.emit('cache:miss', key)
      return null
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      this.stats.memoryUsage -= item.size
      this.stats.totalMisses++
      this.emit('cache:evict', key, 'ttl')
      this.emit('cache:miss', key)
      return null
    }

    // 更新访问信息（LRU）
    const now = Date.now()
    item.lastAccess = now
    item.accessCount++
    item.hitCount++

    // 重新插入到 Map 末尾（LRU 策略）
    this.cache.delete(key)
    this.cache.set(key, item)

    this.stats.totalHits++
    this.emit('cache:hit', key, item)

    return {
      route: item.route,
      component: item.component,
      data: item.data,
    }
  }

  /**
   * 通过路由获取缓存
   */
  getByRoute(
    route: RouteLocationNormalized
  ): { route: RouteLocationNormalized; component?: any; data?: any } | null {
    const key = this.getRouteKey(route)
    return this.get(key)
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const item = this.cache.get(key)
    if (item) {
      this.stats.memoryUsage -= item.size
      this.emit('cache:evict', key, 'manual')
    }
    return this.cache.delete(key)
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 处理导航事件
   */
  handleNavigation(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized
  ): void {
    // 缓存当前路由
    this.set(to)

    // 清理过期缓存
    this.cleanupExpired()
  }

  /**
   * 获取路由键
   */
  private getRouteKey(route: RouteLocationNormalized): string {
    return route.fullPath
  }

  /**
   * 检查是否应该缓存
   */
  private shouldCache(route: RouteLocationNormalized): boolean {
    const path = route.path
    const name = route.name

    // 检查排除列表
    if (this.config.exclude.length > 0) {
      for (const pattern of this.config.exclude) {
        if (typeof pattern === 'string') {
          if (path === pattern || name === pattern) {
            return false
          }
        } else if (
          pattern &&
          typeof pattern === 'object' &&
          'test' in pattern
        ) {
          const regexPattern = pattern as RegExp
          if (
            regexPattern.test(path) ||
            (name && regexPattern.test(String(name)))
          ) {
            return false
          }
        }
      }
    }

    // 检查包含列表
    if (this.config.include.length > 0) {
      for (const pattern of this.config.include) {
        if (typeof pattern === 'string') {
          if (path === pattern || name === pattern) {
            return true
          }
        } else if (
          pattern &&
          typeof pattern === 'object' &&
          'test' in pattern
        ) {
          const regexPattern = pattern as RegExp
          if (
            regexPattern.test(path) ||
            (name && regexPattern.test(String(name)))
          ) {
            return true
          }
        }
      }
      return false
    }

    // 检查路由元信息
    return route.meta.cache !== false
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.expiresAt
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
        this.stats.memoryUsage -= item.size
        this.emit('cache:evict', key, 'ttl')
      }
    }
  }

  /**
   * 驱逐最少使用的缓存项
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null
    let leastUsedItem: CacheItem | null = null

    for (const [key, item] of this.cache.entries()) {
      if (!leastUsedItem || item.lastAccess < leastUsedItem.lastAccess) {
        leastUsedKey = key
        leastUsedItem = item
      }
    }

    if (leastUsedKey && leastUsedItem) {
      this.cache.delete(leastUsedKey)
      this.stats.memoryUsage -= leastUsedItem.size
      this.emit('cache:evict', leastUsedKey, 'lru')
    }
  }

  /**
   * 估算缓存项大小
   */
  private estimateSize(
    route: RouteLocationNormalized,
    component?: any,
    data?: any
  ): number {
    try {
      let size = JSON.stringify(route).length * 2 // 字符串大小估算

      if (component) {
        size += component.toString().length * 2
      }

      if (data) {
        size += JSON.stringify(data).length * 2
      }

      return size
    } catch {
      return 1024 // 默认 1KB
    }
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (typeof window !== 'undefined') {
      this.cleanupTimer = window.setInterval(() => {
        this.cleanupExpired()
      }, 60000) // 每分钟清理一次
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const hitRate =
      this.stats.totalRequests > 0
        ? (this.stats.totalHits / this.stats.totalRequests) * 100
        : 0

    return {
      size: this.cache.size,
      maxSize: this.config.max,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      totalRequests: this.stats.totalRequests,
      timeSaved: this.stats.timeSaved,
      memoryUsage: this.stats.memoryUsage,
    }
  }

  /**
   * 获取缓存条目详情
   */
  getEntries(): Array<{ key: string; item: CacheItem }> {
    return Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      item,
    }))
  }

  /**
   * 事件监听
   */
  on<K extends keyof CacheEvents>(event: K, handler: CacheEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(handler)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof CacheEvents>(event: K, handler: CacheEvents[K]): void {
    const handlers = this.eventListeners.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof CacheEvents>(
    event: K,
    ...args: Parameters<CacheEvents[K]>
  ): void {
    const handlers = this.eventListeners.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          ;(handler as any)(...args)
        } catch (error) {
          console.error(`Error in cache event handler for ${event}:`, error)
        }
      })
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.stats.memoryUsage = 0
    this.emit('cache:clear')
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    this.clear()

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    this.eventListeners.clear()
  }
}

/**
 * 创建路由缓存管理器
 */
export function createRouteCacheManager(
  config?: RouteCacheConfig
): RouteCacheManager | null {
  if (!config) {
    return null
  }

  return new RouteCacheManager(config)
}
