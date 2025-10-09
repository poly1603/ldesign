/**
 * @ldesign/router 缓存优化器
 *
 * 提供智能缓存管理和优化策略
 */

import type { RouteLocationNormalized } from '../types'

/**
 * LRU 缓存实现
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private readonly maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // 重新插入以更新访问顺序
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }

  keys(): IterableIterator<K> {
    return this.cache.keys()
  }

  values(): IterableIterator<V> {
    return this.cache.values()
  }
}

/**
 * 智能路由缓存管理器
 */
export class SmartRouteCache {
  private routeCache = new LRUCache<string, RouteLocationNormalized>(200)
  private accessCount = new Map<string, number>()
  private lastAccess = new Map<string, number>()
  private hitCount = 0
  private missCount = 0

  /**
   * 获取缓存的路由
   */
  get(path: string): RouteLocationNormalized | undefined {
    const route = this.routeCache.get(path)

    if (route) {
      this.hitCount++
      this.updateAccessStats(path)
      return route
    }

    this.missCount++
    return undefined
  }

  /**
   * 设置路由缓存
   */
  set(path: string, route: RouteLocationNormalized): void {
    this.routeCache.set(path, route)
    this.updateAccessStats(path)
  }

  /**
   * 更新访问统计
   */
  private updateAccessStats(path: string): void {
    const currentCount = this.accessCount.get(path) || 0
    this.accessCount.set(path, currentCount + 1)
    this.lastAccess.set(path, Date.now())
  }

  /**
   * 获取热门路由
   */
  getHotRoutes(limit = 10): Array<{ path: string, count: number }> {
    return Array.from(this.accessCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([path, count]) => ({ path, count }))
  }

  /**
   * 预热热门路由
   */
  preheatHotRoutes(): void {
    const hotRoutes = this.getHotRoutes(20)
    console.log(`预热 ${hotRoutes.length} 个热门路由:`, hotRoutes.map(r => r.path))
  }

  /**
   * 清理过期缓存
   */
  cleanupExpiredCache(maxAge = 30 * 60 * 1000): void { // 30分钟
    const now = Date.now()
    const expiredPaths: string[] = []

    for (const [path, lastAccessTime] of this.lastAccess.entries()) {
      if (now - lastAccessTime > maxAge) {
        expiredPaths.push(path)
      }
    }

    for (const path of expiredPaths) {
      this.routeCache.delete(path)
      this.accessCount.delete(path)
      this.lastAccess.delete(path)
    }

    if (expiredPaths.length > 0) {
      console.log(`清理了 ${expiredPaths.length} 个过期缓存`)
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const total = this.hitCount + this.missCount
    return {
      hitRate: total > 0 ? this.hitCount / total : 0,
      hitCount: this.hitCount,
      missCount: this.missCount,
      cacheSize: this.routeCache.size,
      totalAccess: total,
      hotRoutes: this.getHotRoutes(5),
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.hitCount = 0
    this.missCount = 0
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.routeCache.clear()
    this.accessCount.clear()
    this.lastAccess.clear()
    this.resetStats()
  }
}

/**
 * 组件缓存优化器
 */
export class ComponentCacheOptimizer {
  private componentCache = new LRUCache<string, any>(50)
  private loadingPromises = new Map<string, Promise<any>>()

  /**
   * 获取缓存的组件
   */
  async getComponent(path: string, loader: () => Promise<any>): Promise<any> {
    // 检查缓存
    const cached = this.componentCache.get(path)
    if (cached) {
      return cached
    }

    // 检查是否正在加载
    const loadingPromise = this.loadingPromises.get(path)
    if (loadingPromise) {
      return loadingPromise
    }

    // 开始加载
    const promise = loader().then((component) => {
      this.componentCache.set(path, component)
      this.loadingPromises.delete(path)
      return component
    }).catch((error) => {
      this.loadingPromises.delete(path)
      throw error
    })

    this.loadingPromises.set(path, promise)
    return promise
  }

  /**
   * 预加载组件
   */
  async preloadComponent(path: string, loader: () => Promise<any>): Promise<void> {
    if (!this.componentCache.has(path) && !this.loadingPromises.has(path)) {
      try {
        await this.getComponent(path, loader)
      }
      catch (error) {
        console.warn(`预加载组件失败: ${path}`, error)
      }
    }
  }

  /**
   * 批量预加载组件
   */
  async preloadComponents(components: Array<{ path: string, loader: () => Promise<any> }>): Promise<void> {
    const promises = components.map(({ path, loader }) =>
      this.preloadComponent(path, loader),
    )

    await Promise.allSettled(promises)
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      cacheSize: this.componentCache.size,
      loadingCount: this.loadingPromises.size,
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.componentCache.clear()
    this.loadingPromises.clear()
  }
}

// 导出单例实例
export const smartRouteCache = new SmartRouteCache()
export const componentCacheOptimizer = new ComponentCacheOptimizer()
