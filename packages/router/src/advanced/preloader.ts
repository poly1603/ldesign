import type {
  PreloadStrategy,
  RouteComponent,
  RouteLocationNormalized,
  RouteRecordNormalized,
} from '../types'

/**
 * 预加载事件类型
 */
export interface PreloadEvents {
  'preload:start': (route: string, strategy: PreloadStrategy) => void
  'preload:complete': (route: string, duration: number, size?: number) => void
  'preload:error': (route: string, error: Error) => void
  'preload:cache-hit': (route: string) => void
}

/**
 * 预加载统计信息
 */
export interface PreloadStats {
  preloadedCount: number
  queueSize: number
  strategy: PreloadStrategy
  cacheHits: number
  totalPreloads: number
  averageDuration: number
  timeSaved: number
}

/**
 * 预加载条件函数
 */
export type PreloadCondition = (route: RouteRecordNormalized) => boolean

/**
 * 路由预加载器
 */
export class RoutePreloader {
  private preloadedComponents = new Map<string, Promise<RouteComponent>>()
  private preloadQueue = new Set<string>()
  private strategy: PreloadStrategy = 'none'
  private intersectionObserver?: IntersectionObserver
  private hoverTimers = new Map<string, number>()
  private preloadDelay = 100
  private condition?: PreloadCondition
  private allRoutes: RouteRecordNormalized[] = []
  private eventListeners = new Map<keyof PreloadEvents, Function[]>()

  // 统计信息
  private stats = {
    cacheHits: 0,
    totalPreloads: 0,
    totalDuration: 0,
    timeSaved: 0,
  }

  constructor(
    strategy: PreloadStrategy = 'none',
    options: {
      delay?: number
      condition?: PreloadCondition
      routes?: RouteRecordNormalized[]
    } = {}
  ) {
    this.strategy = strategy
    this.preloadDelay = options.delay || 100
    this.condition = options.condition || (() => true)
    this.allRoutes = options.routes || []
    this.initializeIntersectionObserver()
  }

  /**
   * 设置预加载策略
   */
  setStrategy(strategy: PreloadStrategy) {
    this.strategy = strategy
  }

  /**
   * 设置预加载条件
   */
  setCondition(condition: PreloadCondition) {
    this.condition = condition
  }

  /**
   * 设置所有路由
   */
  setRoutes(routes: RouteRecordNormalized[]) {
    this.allRoutes = routes
  }

  /**
   * 预加载路由组件
   */
  async preloadRoute(
    route: RouteRecordNormalized | string,
    strategy?: PreloadStrategy
  ): Promise<void> {
    const routeRecord =
      typeof route === 'string'
        ? this.allRoutes.find(r => r.path === route || r.name === route)
        : route

    if (!routeRecord) {
      console.warn(`Route not found for preloading: ${route}`)
      return
    }

    const routeKey = this.getRouteKey(routeRecord)
    const usedStrategy = strategy || this.strategy

    // 检查是否已经预加载或正在预加载
    if (this.preloadedComponents.has(routeKey)) {
      this.stats.cacheHits++
      this.emit('preload:cache-hit', routeKey)
      return
    }

    if (this.preloadQueue.has(routeKey)) {
      return
    }

    // 检查预加载条件
    if (this.condition && !this.condition(routeRecord)) {
      return
    }

    // 检查网络条件
    if (!this.checkNetworkConditions()) {
      return
    }

    this.preloadQueue.add(routeKey)
    const startTime = performance.now()

    try {
      this.emit('preload:start', routeKey, usedStrategy)

      const component = routeRecord.components?.default
      if (component && typeof component === 'function') {
        const preloadPromise = Promise.resolve(component()).then(module => {
          // 处理 ES 模块默认导出
          return module && typeof module === 'object' && 'default' in module
            ? module.default
            : module
        })

        this.preloadedComponents.set(routeKey, preloadPromise)
        await preloadPromise

        const duration = performance.now() - startTime
        this.stats.totalPreloads++
        this.stats.totalDuration += duration

        // 估算组件大小（简化实现）
        const size = this.estimateComponentSize(component)

        this.emit('preload:complete', routeKey, duration, size)
      }
    } catch (error) {
      console.warn(`Failed to preload route ${routeKey}:`, error)
      this.emit('preload:error', routeKey, error as Error)
    } finally {
      this.preloadQueue.delete(routeKey)
    }
  }

  /**
   * 预加载多个路由
   */
  async preloadRoutes(
    routes: (RouteRecordNormalized | string)[]
  ): Promise<void> {
    const promises = routes.map(route => this.preloadRoute(route))
    await Promise.allSettled(promises)
  }

  /**
   * 获取预加载的组件
   */
  getPreloadedComponent(
    route: RouteRecordNormalized
  ): Promise<RouteComponent> | null {
    const routeKey = this.getRouteKey(route)
    return this.preloadedComponents.get(routeKey) || null
  }

  /**
   * 悬停预加载处理
   */
  handleHover(_element: Element, route: RouteRecordNormalized | string): void {
    if (this.strategy !== 'hover') return

    const routeKey = typeof route === 'string' ? route : this.getRouteKey(route)

    // 清除之前的定时器
    const existingTimer = this.hoverTimers.get(routeKey)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 设置延迟预加载
    const timer = setTimeout(() => {
      this.preloadRoute(route, 'hover')
      this.hoverTimers.delete(routeKey)
    }, this.preloadDelay)

    this.hoverTimers.set(routeKey, timer as any)
  }

  /**
   * 取消悬停预加载
   */
  cancelHover(route: RouteRecordNormalized | string): void {
    const routeKey = typeof route === 'string' ? route : this.getRouteKey(route)
    const timer = this.hoverTimers.get(routeKey)

    if (timer) {
      clearTimeout(timer)
      this.hoverTimers.delete(routeKey)
    }
  }

  /**
   * 事件监听
   */
  on<K extends keyof PreloadEvents>(event: K, handler: PreloadEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(handler)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof PreloadEvents>(
    event: K,
    handler: PreloadEvents[K]
  ): void {
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
  private emit<K extends keyof PreloadEvents>(
    event: K,
    ...args: Parameters<PreloadEvents[K]>
  ): void {
    const handlers = this.eventListeners.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          ;(handler as any)(...args)
        } catch (error) {
          console.error(`Error in preload event handler for ${event}:`, error)
        }
      })
    }
  }

  /**
   * 处理导航事件
   */
  handleNavigation(to: RouteLocationNormalized): void {
    if (this.strategy === 'none') {
      return
    }

    // 根据策略预加载相关路由
    this.executePreloadStrategy(to)
  }

  /**
   * 观察链接元素进行预加载
   */
  observeLink(element: Element, route: RouteRecordNormalized): void {
    if (this.strategy !== 'visible' || !this.intersectionObserver) {
      return
    }

    // 将路由信息附加到元素上
    ;(element as any).__routePreloadData = route
    this.intersectionObserver.observe(element)
  }

  /**
   * 停止观察链接元素
   */
  unobserveLink(element: Element): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element)
    }
  }

  /**
   * 清理预加载缓存
   */
  clear(): void {
    this.preloadedComponents.clear()
    this.preloadQueue.clear()
  }

  /**
   * 获取预加载统计信息
   */
  getStats(): PreloadStats {
    const averageDuration =
      this.stats.totalPreloads > 0
        ? this.stats.totalDuration / this.stats.totalPreloads
        : 0

    return {
      preloadedCount: this.preloadedComponents.size,
      queueSize: this.preloadQueue.size,
      strategy: this.strategy,
      cacheHits: this.stats.cacheHits,
      totalPreloads: this.stats.totalPreloads,
      averageDuration,
      timeSaved: this.stats.timeSaved,
    }
  }

  /**
   * 估算组件大小（简化实现）
   */
  private estimateComponentSize(component: any): number {
    try {
      // 简化的大小估算，实际应用中可以更精确
      const str = component.toString()
      return new Blob([str]).size
    } catch {
      return 0
    }
  }

  /**
   * 检查网络状况
   */
  private checkNetworkConditions(): boolean {
    if (typeof navigator === 'undefined') return true

    // 检查网络连接
    const connection = (navigator as any).connection
    if (connection) {
      // 慢网络时减少预加载
      if (
        connection.effectiveType === '2g' ||
        connection.effectiveType === 'slow-2g'
      ) {
        return false
      }

      // 数据保护模式
      if (connection.saveData) {
        return false
      }
    }

    // 检查设备内存
    const deviceMemory = (navigator as any).deviceMemory
    if (deviceMemory && deviceMemory < 4) {
      return false
    }

    return true
  }

  /**
   * 销毁预加载器
   */
  destroy(): void {
    this.clear()

    // 清除所有定时器
    this.hoverTimers.forEach(timer => clearTimeout(timer))
    this.hoverTimers.clear()

    // 断开观察器
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
    }

    // 清除事件监听器
    this.eventListeners.clear()
  }

  /**
   * 获取路由键
   */
  private getRouteKey(route: RouteRecordNormalized): string {
    return route.path || route.name?.toString() || ''
  }

  /**
   * 初始化 Intersection Observer
   */
  private initializeIntersectionObserver(): void {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return
    }

    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const route = (entry.target as any).__routePreloadData
            if (route) {
              this.preloadRoute(route)
              this.intersectionObserver!.unobserve(entry.target)
            }
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    )
  }

  /**
   * 执行预加载策略
   */
  private executePreloadStrategy(_to: RouteLocationNormalized): void {
    switch (this.strategy) {
      case 'immediate':
        // 立即预加载所有路由
        this.preloadAllRoutes()
        break

      case 'hover':
        // 悬停预加载在 RouterLink 组件中处理
        break

      case 'visible':
        // 可见性预加载在 IntersectionObserver 中处理
        break

      case 'idle':
        // 空闲时预加载
        this.preloadOnIdle()
        break

      default:
        break
    }
  }

  /**
   * 预加载所有路由
   */
  private preloadAllRoutes(): void {
    // 这里需要访问路由器的所有路由
    // 在实际实现中，需要传入路由器实例或路由列表
  }

  /**
   * 空闲时预加载
   */
  private preloadOnIdle(): void {
    if (typeof window === 'undefined') {
      return
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        this.preloadAllRoutes()
      })
    } else {
      // 降级到 setTimeout
      setTimeout(() => {
        this.preloadAllRoutes()
      }, 100)
    }
  }
}

/**
 * 创建路由预加载器
 */
export function createRoutePreloader(
  strategy?: PreloadStrategy
): RoutePreloader | null {
  if (!strategy || strategy === 'none') {
    return null
  }

  return new RoutePreloader(strategy)
}
