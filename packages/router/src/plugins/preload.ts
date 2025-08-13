/**
 * @ldesign/router 预加载插件
 *
 * 提供智能的路由组件预加载功能
 */

import type { App } from 'vue'
import type {
  Router,
  RouteLocationNormalized,
  RouteRecordNormalized,
} from '../types'
import type { PreloadStrategy, PreloadConfig } from '../components/types'

// ==================== 预加载管理器 ====================

/**
 * 预加载项
 */
interface PreloadItem {
  route: RouteLocationNormalized
  component: Promise<any>
  startTime: number
  strategy: PreloadStrategy
  priority: number
}

/**
 * 预加载统计
 */
interface PreloadStats {
  total: number
  success: number
  failed: number
  cached: number
  averageTime: number
}

/**
 * 预加载管理器
 */
export class PreloadManager {
  private preloadQueue = new Map<string, PreloadItem>()
  private loadedComponents = new Map<string, any>()
  private config: PreloadConfig
  private stats: PreloadStats = {
    total: 0,
    success: 0,
    failed: 0,
    cached: 0,
    averageTime: 0,
  }

  constructor(config: PreloadConfig) {
    this.config = config
  }

  /**
   * 生成预加载键
   */
  private generateKey(route: RouteLocationNormalized): string {
    return `${route.path}-${JSON.stringify(route.params)}`
  }

  /**
   * 预加载路由组件
   */
  async preload(
    route: RouteLocationNormalized,
    strategy: PreloadStrategy = this.config.strategy,
    priority: number = 0
  ): Promise<void> {
    const key = this.generateKey(route)

    // 检查是否已经加载
    if (this.loadedComponents.has(key)) {
      this.stats.cached++
      return
    }

    // 检查是否正在预加载
    if (this.preloadQueue.has(key)) {
      return
    }

    const startTime = Date.now()
    this.stats.total++

    try {
      // 创建预加载项
      const preloadItem: PreloadItem = {
        route,
        component: this.loadRouteComponents(route),
        startTime,
        strategy,
        priority,
      }

      this.preloadQueue.set(key, preloadItem)

      // 等待组件加载完成
      const components = await preloadItem.component

      // 缓存加载的组件
      this.loadedComponents.set(key, components)
      this.preloadQueue.delete(key)

      // 更新统计
      this.stats.success++
      this.updateAverageTime(Date.now() - startTime)

      console.log(`预加载成功: ${route.path} (${strategy})`)
    } catch (error) {
      this.preloadQueue.delete(key)
      this.stats.failed++
      console.warn(`预加载失败: ${route.path}`, error)
    }
  }

  /**
   * 批量预加载
   */
  async preloadBatch(
    routes: RouteLocationNormalized[],
    strategy: PreloadStrategy
  ): Promise<void> {
    const promises = routes.map(route => this.preload(route, strategy))
    await Promise.allSettled(promises)
  }

  /**
   * 预加载相关路由
   */
  async preloadRelated(currentRoute: RouteLocationNormalized): Promise<void> {
    const relatedRoutes = this.findRelatedRoutes(currentRoute)
    await this.preloadBatch(relatedRoutes, 'idle')
  }

  /**
   * 获取预加载的组件
   */
  getPreloaded(route: RouteLocationNormalized): any | null {
    const key = this.generateKey(route)
    return this.loadedComponents.get(key) || null
  }

  /**
   * 检查是否已预加载
   */
  isPreloaded(route: RouteLocationNormalized): boolean {
    const key = this.generateKey(route)
    return this.loadedComponents.has(key)
  }

  /**
   * 清理预加载缓存
   */
  clear(): void {
    this.preloadQueue.clear()
    this.loadedComponents.clear()
  }

  /**
   * 获取统计信息
   */
  getStats(): PreloadStats {
    return { ...this.stats }
  }

  /**
   * 加载路由组件
   */
  private async loadRouteComponents(
    route: RouteLocationNormalized
  ): Promise<any> {
    const components: Record<string, any> = {}

    for (const record of route.matched) {
      if (record.components) {
        for (const [name, component] of Object.entries(record.components)) {
          if (typeof component === 'function') {
            components[name] = await component()
          } else {
            components[name] = component
          }
        }
      }
    }

    return components
  }

  /**
   * 查找相关路由
   */
  private findRelatedRoutes(
    currentRoute: RouteLocationNormalized
  ): RouteLocationNormalized[] {
    // 简化实现：返回同级路由
    const pathSegments = currentRoute.path.split('/').filter(Boolean)
    const parentPath = pathSegments.slice(0, -1).join('/')

    // 这里应该从路由器获取所有路由，然后筛选相关的
    // 暂时返回空数组
    return []
  }

  /**
   * 更新平均时间
   */
  private updateAverageTime(time: number): void {
    const total = this.stats.success + this.stats.failed
    this.stats.averageTime =
      (this.stats.averageTime * (total - 1) + time) / total
  }
}

// ==================== 预加载策略实现 ====================

/**
 * Hover 预加载策略
 */
export class HoverPreloadStrategy {
  private manager: PreloadManager
  private timers = new Map<string, number>()

  constructor(manager: PreloadManager) {
    this.manager = manager
  }

  /**
   * 处理鼠标悬停
   */
  onMouseEnter(route: RouteLocationNormalized, delay: number = 200): void {
    const key = this.manager['generateKey'](route)

    // 清除之前的定时器
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 设置新的定时器
    const timer = window.setTimeout(() => {
      this.manager.preload(route, 'hover', 1)
      this.timers.delete(key)
    }, delay)

    this.timers.set(key, timer)
  }

  /**
   * 处理鼠标离开
   */
  onMouseLeave(route: RouteLocationNormalized): void {
    const key = this.manager['generateKey'](route)
    const timer = this.timers.get(key)

    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  /**
   * 清理所有定时器
   */
  cleanup(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()
  }
}

/**
 * 可见性预加载策略
 */
export class VisibilityPreloadStrategy {
  private manager: PreloadManager
  private observer?: IntersectionObserver
  private observedElements = new Map<Element, RouteLocationNormalized>()

  constructor(manager: PreloadManager) {
    this.manager = manager
    this.setupObserver()
  }

  /**
   * 设置交叉观察器
   */
  private setupObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const route = this.observedElements.get(entry.target)
            if (route) {
              this.manager.preload(route, 'visible', 2)
            }
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )
  }

  /**
   * 观察元素
   */
  observe(element: Element, route: RouteLocationNormalized): void {
    if (!this.observer) return

    this.observer.observe(element)
    this.observedElements.set(element, route)
  }

  /**
   * 停止观察元素
   */
  unobserve(element: Element): void {
    if (!this.observer) return

    this.observer.unobserve(element)
    this.observedElements.delete(element)
  }

  /**
   * 清理观察器
   */
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observedElements.clear()
    }
  }
}

/**
 * 空闲预加载策略
 */
export class IdlePreloadStrategy {
  private manager: PreloadManager
  private pendingRoutes: RouteLocationNormalized[] = []

  constructor(manager: PreloadManager) {
    this.manager = manager
    this.scheduleIdlePreload()
  }

  /**
   * 添加到空闲预加载队列
   */
  addToQueue(route: RouteLocationNormalized): void {
    if (!this.pendingRoutes.some(r => r.path === route.path)) {
      this.pendingRoutes.push(route)
    }
  }

  /**
   * 调度空闲预加载
   */
  private scheduleIdlePreload(): void {
    const processQueue = () => {
      if (this.pendingRoutes.length === 0) return

      const route = this.pendingRoutes.shift()!
      this.manager.preload(route, 'idle', 3)

      // 继续处理队列
      if (this.pendingRoutes.length > 0) {
        this.scheduleNext()
      }
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(processQueue, { timeout: 5000 })
    } else {
      setTimeout(processQueue, 1000)
    }
  }

  /**
   * 调度下一个预加载
   */
  private scheduleNext(): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.scheduleIdlePreload(), { timeout: 5000 })
    } else {
      setTimeout(() => this.scheduleIdlePreload(), 1000)
    }
  }

  /**
   * 清理队列
   */
  cleanup(): void {
    this.pendingRoutes = []
  }
}

// ==================== 预加载插件 ====================

/**
 * 预加载插件选项
 */
export interface PreloadPluginOptions extends Partial<PreloadConfig> {
  /** 是否启用预加载 */
  enabled?: boolean
  /** 是否启用自动预加载相关路由 */
  autoPreloadRelated?: boolean
}

/**
 * 创建预加载插件
 */
export function createPreloadPlugin(options: PreloadPluginOptions = {}) {
  const {
    enabled = true,
    strategy = 'hover',
    delay = 200,
    onVisible = true,
    visibilityThreshold = 0.1,
    onIdle = true,
    idleTimeout = 5000,
    autoPreloadRelated = false,
  } = options

  if (!enabled) {
    return {
      install() {
        // 空实现
      },
      manager: null,
    }
  }

  const config: PreloadConfig = {
    strategy,
    delay,
    onVisible,
    visibilityThreshold,
    onIdle,
    idleTimeout,
  }

  const manager = new PreloadManager(config)
  const hoverStrategy = new HoverPreloadStrategy(manager)
  const visibilityStrategy = new VisibilityPreloadStrategy(manager)
  const idleStrategy = new IdlePreloadStrategy(manager)

  return {
    install(app: App, router: Router) {
      // 提供预加载管理器
      app.provide('preloadManager', manager)

      // 全局属性
      app.config.globalProperties.$preloadManager = manager

      // 路由守卫：自动预加载相关路由
      if (autoPreloadRelated) {
        router.afterEach(to => {
          manager.preloadRelated(to)
        })
      }
    },
    manager,
    strategies: {
      hover: hoverStrategy,
      visibility: visibilityStrategy,
      idle: idleStrategy,
    },
  }
}

// ==================== 预加载工具函数 ====================

/**
 * 创建预加载配置
 */
export function createPreloadConfig(
  config: Partial<PreloadConfig>
): PreloadConfig {
  return {
    strategy: 'hover',
    delay: 200,
    onVisible: true,
    visibilityThreshold: 0.1,
    onIdle: true,
    idleTimeout: 5000,
    ...config,
  }
}

/**
 * 检查预加载支持
 */
export function supportsPreload(): {
  intersectionObserver: boolean
  requestIdleCallback: boolean
} {
  return {
    intersectionObserver: typeof IntersectionObserver !== 'undefined',
    requestIdleCallback: typeof requestIdleCallback !== 'undefined',
  }
}

// ==================== 默认导出 ====================

export default {
  createPreloadPlugin,
  PreloadManager,
  HoverPreloadStrategy,
  VisibilityPreloadStrategy,
  IdlePreloadStrategy,
  createPreloadConfig,
  supportsPreload,
}
