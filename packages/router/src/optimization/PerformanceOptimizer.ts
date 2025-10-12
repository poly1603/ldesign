/**
 * 高性能路由优化系统
 * 提供路由缓存、懒加载优化、预取策略、渲染优化
 */

import type { RouteLocationNormalized, Router, RouteRecordRaw } from '../types'
import { markRaw, shallowRef } from 'vue'

// ============= 性能优化配置 =============
export interface OptimizationConfig {
  // 缓存配置
  cache?: {
    enabled?: boolean
    maxSize?: number
    ttl?: number
    strategy?: 'lru' | 'lfu' | 'fifo'
    persistence?: boolean
  }
  // 懒加载配置
  lazyLoad?: {
    enabled?: boolean
    preload?: boolean
    prefetch?: boolean
    timeout?: number
    retry?: number
    chunkName?: (route: RouteRecordRaw) => string
  }
  // 预取配置
  prefetch?: {
    enabled?: boolean
    strategy?: 'hover' | 'visible' | 'idle' | 'predictive'
    delay?: number
    priority?: 'high' | 'low' | 'auto'
    bandwidth?: 'slow' | 'fast' | 'auto'
  }
  // 渲染优化
  rendering?: {
    enabled?: boolean
    virtualScroll?: boolean
    skeltonScreen?: boolean
    progressiveEnhancement?: boolean
    ssr?: boolean
  }
}

// ============= 路由缓存管理器 =============
export class RouteCacheManager {
  private cache = new Map<string, CachedRoute>()
  private accessCount = new Map<string, number>()
  private lastAccess = new Map<string, number>()
  private maxSize: number
  private ttl: number
  private strategy: 'lru' | 'lfu' | 'fifo'

  constructor(config: OptimizationConfig['cache'] = {}) {
    this.maxSize = config.maxSize || 20 // 优化：从50降低到20
    this.ttl = config.ttl || 3 * 60 * 1000 // 优化：从5分钟降低到3分钟
    this.strategy = config.strategy || 'lru'

    // 如果启用持久化，从 localStorage 恢复缓存
    if (config.persistence) {
      this.restoreFromStorage()
    }
  }

  // 获取缓存的路由
  get(key: string): RouteLocationNormalized | null {
    const cached = this.cache.get(key)
    if (!cached)
      return null

    // 检查是否过期
    if (this.isExpired(cached)) {
      this.cache.delete(key)
      return null
    }

    // 更新访问统计
    this.updateAccessStats(key)

    return cached.route
  }

  // 设置缓存
  set(key: string, route: RouteLocationNormalized): void {
    // 如果缓存满了，根据策略清理
    if (this.cache.size >= this.maxSize) {
      this.evict()
    }

    this.cache.set(key, {
      route: markRaw(route),
      timestamp: Date.now(),
      hits: 0,
    })

    this.updateAccessStats(key)
  }

  // 检查是否过期
  private isExpired(cached: CachedRoute): boolean {
    return Date.now() - cached.timestamp > this.ttl
  }

  // 更新访问统计
  private updateAccessStats(key: string): void {
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1)
    this.lastAccess.set(key, Date.now())

    const cached = this.cache.get(key)
    if (cached) {
      cached.hits++
    }
  }

  // 缓存淘汰
  private evict(): void {
    let keyToRemove: string | null = null

    switch (this.strategy) {
      case 'lru': // 最近最少使用
        let oldestAccess = Date.now()
        for (const [key, time] of this.lastAccess) {
          if (time < oldestAccess) {
            oldestAccess = time
            keyToRemove = key
          }
        }
        break

      case 'lfu': // 最不频繁使用
        let minCount = Infinity
        for (const [key, count] of this.accessCount) {
          if (count < minCount) {
            minCount = count
            keyToRemove = key
          }
        }
        break

      case 'fifo': // 先进先出
        keyToRemove = this.cache.keys().next().value
        break
    }

    if (keyToRemove) {
      this.cache.delete(keyToRemove)
      this.accessCount.delete(keyToRemove)
      this.lastAccess.delete(keyToRemove)
    }
  }

  // 清理过期缓存
  clearExpired(): void {
    const now = Date.now()
    for (const [key, cached] of this.cache) {
      if (now - cached.timestamp > this.ttl) {
        this.cache.delete(key)
        this.accessCount.delete(key)
        this.lastAccess.delete(key)
      }
    }
  }

  // 持久化到 localStorage
  private saveToStorage(): void {
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        accessCount: Array.from(this.accessCount.entries()),
        lastAccess: Array.from(this.lastAccess.entries()),
      }
      localStorage.setItem('router-cache', JSON.stringify(data))
    }
    catch (e) {
      console.warn('Failed to save cache to localStorage:', e)
    }
  }

  // 从 localStorage 恢复
  private restoreFromStorage(): void {
    try {
      const stored = localStorage.getItem('router-cache')
      if (stored) {
        const data = JSON.parse(stored)
        this.cache = new Map(data.cache)
        this.accessCount = new Map(data.accessCount)
        this.lastAccess = new Map(data.lastAccess)
        this.clearExpired()
      }
    }
    catch (e) {
      console.warn('Failed to restore cache from localStorage:', e)
    }
  }

  // 获取缓存统计
  getStats(): CacheStats {
    const totalHits = Array.from(this.cache.values()).reduce((sum, c) => sum + c.hits, 0)
    const avgHits = this.cache.size > 0 ? totalHits / this.cache.size : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      avgHits,
      strategy: this.strategy,
      ttl: this.ttl,
    }
  }

  // 清空缓存
  clear(): void {
    this.cache.clear()
    this.accessCount.clear()
    this.lastAccess.clear()
  }
}

// ============= 智能预取管理器 =============
export class SmartPrefetchManager {
  private prefetchQueue: Set<string> = new Set()
  private prefetchedRoutes: Set<string> = new Set()
  private observer?: IntersectionObserver
  private idleCallback?: number
  private router: Router
  private config: OptimizationConfig['prefetch']
  private bandwidth: 'slow' | 'fast' = 'fast'
  private predictiveModel: PredictiveModel

  constructor(router: Router, config: OptimizationConfig['prefetch'] = {}) {
    this.router = router
    this.config = {
      enabled: true,
      strategy: 'idle',
      delay: 50,
      priority: 'auto',
      bandwidth: 'auto',
      ...config,
    }

    this.predictiveModel = new PredictiveModel()
    this.setupStrategies()
    this.detectBandwidth()
  }

  // 设置预取策略
  private setupStrategies(): void {
    if (!this.config.enabled)
      return

    switch (this.config.strategy) {
      case 'hover':
        this.setupHoverStrategy()
        break
      case 'visible':
        this.setupVisibleStrategy()
        break
      case 'idle':
        this.setupIdleStrategy()
        break
      case 'predictive':
        this.setupPredictiveStrategy()
        break
    }
  }

  // 悬停预取策略
  private setupHoverStrategy(): void {
    document.addEventListener('mouseover', (e) => {
      const link = (e.target as HTMLElement).closest('a[href]')
      if (link) {
        const href = link.getAttribute('href')
        if (href && this.shouldPrefetch(href)) {
          setTimeout(() => this.prefetch(href), this.config.delay || 50)
        }
      }
    })
  }

  // 可见性预取策略
  private setupVisibleStrategy(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement
            const href = link.getAttribute('href')
            if (href && this.shouldPrefetch(href)) {
              this.prefetch(href)
            }
          }
        })
      },
      { rootMargin: '50px' },
    )

    // 观察所有链接
    document.querySelectorAll('a[href]').forEach((link) => {
      this.observer?.observe(link)
    })
  }

  // 空闲时预取策略
  private setupIdleStrategy(): void {
    if ('requestIdleCallback' in window) {
      this.idleCallback = window.requestIdleCallback(() => {
        this.prefetchFromQueue()
      }, { timeout: 2000 })
    }
    else {
      // 降级到 setTimeout
      setTimeout(() => this.prefetchFromQueue(), 2000)
    }
  }

  // 预测性预取策略
  private setupPredictiveStrategy(): void {
    // 监听路由变化，更新预测模型
    this.router.afterEach((to, from) => {
      this.predictiveModel.recordTransition(from.path, to.path)

      // 预取可能的下一个路由
      const predictions = this.predictiveModel.predict(to.path)
      predictions.forEach(({ path, probability }) => {
        if (probability > 0.3) { // 30% 以上概率才预取
          this.prefetch(path, probability > 0.7 ? 'high' : 'low')
        }
      })
    })
  }

  // 检测带宽
  private detectBandwidth(): void {
    if (this.config.bandwidth === 'auto' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        const effectiveType = connection.effectiveType
        this.bandwidth = ['slow-2g', '2g', '3g'].includes(effectiveType) ? 'slow' : 'fast'

        // 监听网络变化
        connection.addEventListener('change', () => {
          this.bandwidth = ['slow-2g', '2g', '3g'].includes(connection.effectiveType) ? 'slow' : 'fast'
        })
      }
    }
    else if (this.config.bandwidth !== 'auto') {
      this.bandwidth = this.config.bandwidth!
    }
  }

  // 判断是否应该预取
  private shouldPrefetch(path: string): boolean {
    // 已经预取过的不再预取
    if (this.prefetchedRoutes.has(path))
      return false

    // 慢速网络下限制预取
    if (this.bandwidth === 'slow' && this.prefetchQueue.size > 2)
      return false

    // 当前路由不预取
    if (path === this.router.currentRoute.value.path)
      return false

    return true
  }

  // 执行预取
  async prefetch(path: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (!this.shouldPrefetch(path))
      return

    try {
      // 解析路由
      const route = this.router.resolve(path)

      // 预取组件
      if (route.matched.length > 0) {
        const components = route.matched
          .map(record => record.components?.default)
          .filter(Boolean)

        for (const component of components) {
          if (typeof component === 'function') {
            // 动态导入的组件
            if (priority === 'high') {
              await component()
            }
            else {
              this.prefetchQueue.add(path)
            }
          }
        }

        this.prefetchedRoutes.add(path)
      }
    }
    catch (error) {
      console.warn(`Failed to prefetch route: ${path}`, error)
    }
  }

  // 从队列中预取
  private async prefetchFromQueue(): Promise<void> {
    for (const path of this.prefetchQueue) {
      if (this.bandwidth === 'slow' && this.prefetchQueue.size > 1) {
        // 慢速网络下每次只预取一个
        await this.prefetch(path)
        this.prefetchQueue.delete(path)
        break
      }
      else {
        // 快速网络下批量预取
        this.prefetch(path)
        this.prefetchQueue.delete(path)
      }
    }

    // 继续调度
    if (this.prefetchQueue.size > 0) {
      this.setupIdleStrategy()
    }
  }

  // 清理资源
  destroy(): void {
    this.observer?.disconnect()
    if (this.idleCallback) {
      window.cancelIdleCallback(this.idleCallback)
    }
    this.prefetchQueue.clear()
    this.prefetchedRoutes.clear()
  }
}

// ============= 预测模型 =============
class PredictiveModel {
  private transitions = new Map<string, Map<string, number>>()
  private totalTransitions = new Map<string, number>()

  // 记录路由转换
  recordTransition(from: string, to: string): void {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, new Map())
    }

    const toMap = this.transitions.get(from)!
    toMap.set(to, (toMap.get(to) || 0) + 1)

    this.totalTransitions.set(from, (this.totalTransitions.get(from) || 0) + 1)
  }

  // 预测下一个路由
  predict(currentPath: string): Array<{ path: string, probability: number }> {
    const toMap = this.transitions.get(currentPath)
    if (!toMap)
      return []

    const total = this.totalTransitions.get(currentPath) || 0
    if (total === 0)
      return []

    const predictions: Array<{ path: string, probability: number }> = []

    for (const [path, count] of toMap) {
      predictions.push({
        path,
        probability: count / total,
      })
    }

    // 按概率降序排序
    return predictions.sort((a, b) => b.probability - a.probability)
  }

  // 清空模型
  clear(): void {
    this.transitions.clear()
    this.totalTransitions.clear()
  }
}

// ============= 懒加载优化器 =============
export class LazyLoadOptimizer {
  private loadingComponents = new Map<string, Promise<any>>()
  private loadedComponents = new Map<string, any>()
  private retryCount = new Map<string, number>()
  private config: OptimizationConfig['lazyLoad']

  constructor(config: OptimizationConfig['lazyLoad'] = {}) {
    this.config = {
      enabled: true,
      preload: true,
      prefetch: true,
      timeout: 30000,
      retry: 3,
      ...config,
    }
  }

  // 优化组件加载
  async loadComponent(
    loader: () => Promise<any>,
    name: string,
    options?: { retry?: boolean },
  ): Promise<any> {
    // 如果已经加载过，直接返回
    if (this.loadedComponents.has(name)) {
      return this.loadedComponents.get(name)
    }

    // 如果正在加载，返回进行中的 Promise
    if (this.loadingComponents.has(name)) {
      return this.loadingComponents.get(name)
    }

    // 创建加载 Promise
    const loadPromise = this.createLoadPromise(loader, name, options)
    this.loadingComponents.set(name, loadPromise)

    try {
      const component = await loadPromise
      this.loadedComponents.set(name, component)
      this.loadingComponents.delete(name)
      return component
    }
    catch (error) {
      this.loadingComponents.delete(name)

      // 重试逻辑
      if (options?.retry !== false && this.shouldRetry(name)) {
        this.retryCount.set(name, (this.retryCount.get(name) || 0) + 1)
        return this.loadComponent(loader, name, options)
      }

      throw error
    }
  }

  // 创建带超时的加载 Promise
  private createLoadPromise(
    loader: () => Promise<any>,
    name: string,
    options?: { retry?: boolean },
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Component ${name} loading timeout`))
      }, this.config.timeout)

      loader()
        .then((module) => {
          clearTimeout(timeoutId)
          resolve(module)
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  // 判断是否应该重试
  private shouldRetry(name: string): boolean {
    const count = this.retryCount.get(name) || 0
    return count < (this.config.retry || 3)
  }

  // 预加载组件
  preloadComponent(loader: () => Promise<any>, name: string): void {
    if (!this.config.preload)
      return

    // 在空闲时预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadComponent(loader, name, { retry: false })
      })
    }
    else {
      setTimeout(() => {
        this.loadComponent(loader, name, { retry: false })
      }, 1000)
    }
  }

  // 清理缓存
  clear(): void {
    this.loadingComponents.clear()
    this.loadedComponents.clear()
    this.retryCount.clear()
  }
}

// ============= 渲染优化器 =============
export class RenderingOptimizer {
  private virtualListRefs = new Map<string, any>()
  private skeletonScreens = new Map<string, any>()
  private config: OptimizationConfig['rendering']

  constructor(config: OptimizationConfig['rendering'] = {}) {
    this.config = {
      enabled: true,
      virtualScroll: true,
      skeltonScreen: true,
      progressiveEnhancement: true,
      ssr: false,
      ...config,
    }
  }

  // 创建虚拟列表
  createVirtualList(items: any[], options: VirtualListOptions = {}): VirtualListResult {
    const itemHeight = options.itemHeight || 50
    const containerHeight = options.containerHeight || 500
    const buffer = options.buffer || 5

    const visibleCount = Math.ceil(containerHeight / itemHeight) + buffer * 2
    const totalHeight = items.length * itemHeight

    const scrollTop = shallowRef(0)
    const startIndex = shallowRef(0)
    const endIndex = shallowRef(visibleCount)

    // 监听滚动更新可见范围
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      scrollTop.value = target.scrollTop

      const start = Math.floor(scrollTop.value / itemHeight) - buffer
      startIndex.value = Math.max(0, start)
      endIndex.value = Math.min(items.length, startIndex.value + visibleCount)
    }

    return {
      containerStyle: {
        height: `${containerHeight}px`,
        overflow: 'auto',
        position: 'relative' as const,
      },
      listStyle: {
        height: `${totalHeight}px`,
        position: 'relative' as const,
      },
      visibleItems: () => items.slice(startIndex.value, endIndex.value),
      itemStyle: (index: number) => ({
        position: 'absolute' as const,
        top: `${(startIndex.value + index) * itemHeight}px`,
        height: `${itemHeight}px`,
      }),
      handleScroll,
    }
  }

  // 创建骨架屏
  createSkeletonScreen(template?: SkeletonTemplate): any {
    return {
      rows: template?.rows || 3,
      columns: template?.columns || 1,
      avatar: template?.avatar || false,
      loading: true,
      animated: template?.animated !== false,
    }
  }

  // 渐进式增强
  progressiveEnhance(component: any): any {
    if (!this.config.progressiveEnhancement)
      return component

    return {
      ...component,
      mounted() {
        // 基础功能立即可用
        component.mounted?.call(this)

        // 延迟加载增强功能
        requestIdleCallback(() => {
          // 加载高级功能
          this.enhancementsLoaded = true
        })
      },
    }
  }

  // 服务端渲染优化
  optimizeSSR(route: RouteLocationNormalized): SSROptimization {
    if (!this.config.ssr) {
      return { shouldSSR: false }
    }

    // 根据路由特征决定是否使用 SSR
    const isStatic = !route.params || Object.keys(route.params).length === 0
    const isCritical = route.meta?.critical === true

    return {
      shouldSSR: isStatic || isCritical,
      cacheKey: isStatic ? route.fullPath : null,
      ttl: isStatic ? 3600000 : 0, // 静态页面缓存1小时
    }
  }
}

// ============= 性能优化器主类 =============
export class PerformanceOptimizer {
  private cacheManager: RouteCacheManager
  private prefetchManager: SmartPrefetchManager
  private lazyLoadOptimizer: LazyLoadOptimizer
  private renderingOptimizer: RenderingOptimizer
  private metrics: PerformanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    prefetchCount: 0,
    lazyLoadCount: 0,
    avgLoadTime: 0,
  }

  constructor(router: Router, config: OptimizationConfig = {}) {
    this.cacheManager = new RouteCacheManager(config.cache)
    this.prefetchManager = new SmartPrefetchManager(router, config.prefetch)
    this.lazyLoadOptimizer = new LazyLoadOptimizer(config.lazyLoad)
    this.renderingOptimizer = new RenderingOptimizer(config.rendering)

    this.setupMetricsCollection(router)
  }

  // 设置性能指标收集
  private setupMetricsCollection(router: Router): void {
    const loadTimes: number[] = []

    router.beforeEach((to, from) => {
      // 记录开始时间
      (to.meta as any).__startTime = performance.now()
      return true
    })

    router.afterEach((to) => {
      // 计算加载时间
      const startTime = (to.meta as any).__startTime
      if (startTime) {
        const loadTime = performance.now() - startTime
        loadTimes.push(loadTime)

        // 更新平均加载时间
        this.metrics.avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length

        // 只保留最近100次
        if (loadTimes.length > 100) {
          loadTimes.shift()
        }
      }
    })
  }

  // 获取优化的路由
  getOptimizedRoute(path: string): RouteLocationNormalized | null {
    // 先检查缓存
    const cached = this.cacheManager.get(path)
    if (cached) {
      this.metrics.cacheHits++
      return cached
    }

    this.metrics.cacheMisses++
    return null
  }

  // 优化组件加载
  async optimizeComponentLoad(
    loader: () => Promise<any>,
    name: string,
  ): Promise<any> {
    this.metrics.lazyLoadCount++
    return this.lazyLoadOptimizer.loadComponent(loader, name)
  }

  // 获取性能报告
  getPerformanceReport(): PerformanceReport {
    const cacheStats = this.cacheManager.getStats()

    return {
      metrics: this.metrics,
      cache: cacheStats,
      recommendations: this.generateRecommendations(),
    }
  }

  // 生成优化建议
  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    // 缓存命中率分析
    const hitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
    if (hitRate < 0.5) {
      recommendations.push('缓存命中率较低，考虑增加缓存大小或调整缓存策略')
    }

    // 加载时间分析
    if (this.metrics.avgLoadTime > 1000) {
      recommendations.push('平均加载时间较长，建议启用预取和代码分割')
    }

    // 懒加载分析
    if (this.metrics.lazyLoadCount > 100) {
      recommendations.push('懒加载次数较多，考虑预加载常用组件')
    }

    return recommendations
  }

  // 清理资源
  destroy(): void {
    this.cacheManager.clear()
    this.prefetchManager.destroy()
    this.lazyLoadOptimizer.clear()
  }
}

// ============= 类型定义 =============
interface CachedRoute {
  route: RouteLocationNormalized
  timestamp: number
  hits: number
}

interface CacheStats {
  size: number
  maxSize: number
  totalHits: number
  avgHits: number
  strategy: string
  ttl: number
}

interface VirtualListOptions {
  itemHeight?: number
  containerHeight?: number
  buffer?: number
}

interface VirtualListResult {
  containerStyle: any
  listStyle: any
  visibleItems: () => any[]
  itemStyle: (index: number) => any
  handleScroll: (e: Event) => void
}

interface SkeletonTemplate {
  rows?: number
  columns?: number
  avatar?: boolean
  animated?: boolean
}

interface SSROptimization {
  shouldSSR: boolean
  cacheKey?: string | null
  ttl?: number
}

interface PerformanceMetrics {
  cacheHits: number
  cacheMisses: number
  prefetchCount: number
  lazyLoadCount: number
  avgLoadTime: number
}

interface PerformanceReport {
  metrics: PerformanceMetrics
  cache: CacheStats
  recommendations: string[]
}

// ============= 导出便捷函数 =============
let defaultOptimizer: PerformanceOptimizer | null = null

export function setupPerformanceOptimizer(
  router: Router,
  config?: OptimizationConfig,
): PerformanceOptimizer {
  if (!defaultOptimizer) {
    defaultOptimizer = new PerformanceOptimizer(router, config)
  }
  return defaultOptimizer
}

export function getPerformanceReport(): PerformanceReport | null {
  return defaultOptimizer?.getPerformanceReport() || null
}

export function optimizeRoute(path: string): RouteLocationNormalized | null {
  return defaultOptimizer?.getOptimizedRoute(path) || null
}
