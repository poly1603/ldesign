import type { RouteLocationNormalized, RouteCacheConfig } from './types'

/**
 * 缓存项
 */
interface CacheItem {
  route: RouteLocationNormalized
  timestamp: number
  accessCount: number
  lastAccess: number
}

/**
 * 路由缓存管理器
 */
export class RouteCacheManager {
  private cache = new Map<string, CacheItem>()
  private config: Required<RouteCacheConfig>

  constructor(config: RouteCacheConfig = {}) {
    this.config = {
      max: config.max || 10,
      ttl: config.ttl || 5 * 60 * 1000, // 5分钟
      include: config.include || [],
      exclude: config.exclude || [],
    }
  }

  /**
   * 添加路由到缓存
   */
  set(route: RouteLocationNormalized): void {
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
    } else {
      // 添加新缓存
      if (this.cache.size >= this.config.max) {
        this.evictLeastUsed()
      }

      this.cache.set(key, {
        route: { ...route },
        timestamp: now,
        accessCount: 1,
        lastAccess: now,
      })
    }
  }

  /**
   * 从缓存获取路由
   */
  get(key: string): RouteLocationNormalized | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key)
      return null
    }

    // 更新访问信息
    item.lastAccess = Date.now()
    item.accessCount++

    return item.route
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (this.isExpired(item)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const items = Array.from(this.cache.values())
    return {
      size: this.cache.size,
      maxSize: this.config.max,
      totalAccess: items.reduce((sum, item) => sum + item.accessCount, 0),
      averageAccess:
        items.length > 0
          ? items.reduce((sum, item) => sum + item.accessCount, 0) /
            items.length
          : 0,
      oldestItem:
        items.length > 0
          ? Math.min(...items.map(item => item.timestamp))
          : null,
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 获取路由缓存键
   */
  private getRouteKey(route: RouteLocationNormalized): string {
    return route.name?.toString() || route.fullPath
  }

  /**
   * 检查是否应该缓存路由
   */
  private shouldCache(route: RouteLocationNormalized): boolean {
    const routeName = route.name?.toString()
    const routePath = route.path

    // 检查排除列表
    if (this.config.exclude.length > 0) {
      const isExcluded = this.config.exclude.some(pattern => {
        if (routeName && routeName.includes(pattern)) return true
        if (routePath.includes(pattern)) return true
        return false
      })
      if (isExcluded) return false
    }

    // 检查包含列表
    if (this.config.include.length > 0) {
      const isIncluded = this.config.include.some(pattern => {
        if (routeName && routeName.includes(pattern)) return true
        if (routePath.includes(pattern)) return true
        return false
      })
      return isIncluded
    }

    // 检查路由元信息
    if (route.meta.cache === false) return false
    if (route.meta.cache === true) return true

    // 默认缓存策略
    return true
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > this.config.ttl
  }

  /**
   * 淘汰最少使用的缓存项
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null
    let leastUsedScore = Infinity

    for (const [key, item] of this.cache.entries()) {
      // 计算使用分数（访问次数 / 时间差）
      const timeDiff = Date.now() - item.timestamp
      const score = item.accessCount / (timeDiff / 1000 / 60) // 每分钟访问次数

      if (score < leastUsedScore) {
        leastUsedScore = score
        leastUsedKey = key
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey)
    }
  }
}

/**
 * 创建路由缓存管理器
 */
export function createRouteCacheManager(
  config?: RouteCacheConfig
): RouteCacheManager {
  return new RouteCacheManager(config)
}
