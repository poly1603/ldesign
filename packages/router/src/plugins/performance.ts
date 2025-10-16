/**
 * @ldesign/router 性能监控插件
 *
 * 提供路由导航和组件加载的性能监控功能
 */

import type { App } from 'vue'
import type { PerformanceConfig, PerformanceMetrics } from '../components/types'
import type { RouteLocationNormalized, Router } from '../types'

// ==================== 性能监控管理器 ====================

/**
 * 性能事件类型
 */
export enum PerformanceEventType {
  NAVIGATION_START = 'navigation-start',
  NAVIGATION_END = 'navigation-end',
  COMPONENT_LOAD_START = 'component-load-start',
  COMPONENT_LOAD_END = 'component-load-end',
  ROUTE_MATCH_START = 'route-match-start',
  ROUTE_MATCH_END = 'route-match-end',
  GUARD_EXECUTION_START = 'guard-execution-start',
  GUARD_EXECUTION_END = 'guard-execution-end',
}

/**
 * 性能事件
 */
interface PerformanceEvent {
  type: PerformanceEventType
  timestamp: number
  route?: RouteLocationNormalized
  data?: any
}

/**
 * 导航性能数据
 */
interface NavigationPerformance {
  id: string
  from: RouteLocationNormalized
  to: RouteLocationNormalized
  startTime: number
  endTime?: number
  events: PerformanceEvent[]
  metrics?: PerformanceMetrics
}

/**
 * 性能监控管理器
 */
export class PerformanceManager {
  private config: PerformanceConfig
  private navigations = new Map<string, NavigationPerformance>()
  private currentNavigation?: NavigationPerformance
  private eventListeners = new Map<
    PerformanceEventType,
    Array<(event: PerformanceEvent) => void>
  >()

  constructor(config: PerformanceConfig) {
    this.config = config
  }

  /**
   * 开始导航监控
   */
  startNavigation(
    from: RouteLocationNormalized,
    to: RouteLocationNormalized,
  ): string {
    const id = this.generateNavigationId(from, to)
    const startTime = performance.now()

    const navigation: NavigationPerformance = {
      id,
      from,
      to,
      startTime,
      events: [],
    }

    this.navigations.set(id, navigation)
    this.currentNavigation = navigation

    this.emitEvent({
      type: PerformanceEventType.NAVIGATION_START,
      timestamp: startTime,
      route: to,
    })

    return id
  }

  /**
   * 结束导航监控
   */
  endNavigation(id: string): PerformanceMetrics | null {
    const navigation = this.navigations.get(id)
    if (!navigation)
      return null

    const endTime = performance.now()
    navigation.endTime = endTime

    // 计算性能指标
    const metrics = this.calculateMetrics(navigation)
    navigation.metrics = metrics

    this.emitEvent({
      type: PerformanceEventType.NAVIGATION_END,
      timestamp: endTime,
      route: navigation.to,
      data: metrics,
    })

    // 检查性能阈值
    this.checkThresholds(metrics)

    // 调用回调
    if (this.config?.onMetrics) {
      this.config?.onMetrics(metrics)
    }

    // 清理当前导航
    if (this.currentNavigation?.id === id) {
      this.currentNavigation = undefined as any
    }

    return metrics
  }

  /**
   * 记录事件
   */
  recordEvent(type: PerformanceEventType, data?: any): void {
    if (!this.config?.enabled)
      return

    const event: any = {
      type,
      timestamp: performance.now(),
      data,
    }
    if (this.currentNavigation?.to) {
      event.route = this.currentNavigation.to
    }

    // 添加到当前导航
    if (this.currentNavigation) {
      this.currentNavigation.events.push(event)
    }

    this.emitEvent(event)
  }

  /**
   * 添加事件监听器
   */
  addEventListener(
    type: PerformanceEventType,
    listener: (event: PerformanceEvent) => void,
  ): () => void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, [])
    }

    const listeners = this.eventListeners.get(type)!
    listeners.push(listener)

    return () => {
      const index = listeners.indexOf(listener)
      if (index >= 0) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 获取导航历史
   */
  getNavigationHistory(): NavigationPerformance[] {
    return Array.from(this.navigations.values())
  }

  /**
   * 获取性能统计
   */
  getStats() {
    const navigations = Array.from(this.navigations.values())
    const completedNavigations = navigations.filter(n => n.metrics)

    if (completedNavigations.length === 0) {
      return {
        totalNavigations: 0,
        averageTime: 0,
        slowNavigations: 0,
        fastNavigations: 0,
      }
    }

    const totalTime = completedNavigations.reduce(
      (sum, n) => sum + n.metrics!.totalTime,
      0,
    )
    const averageTime = totalTime / completedNavigations.length
    const slowNavigations = completedNavigations.filter(
      n => n.metrics!.totalTime > this.config?.warningThreshold,
    ).length
    const fastNavigations = completedNavigations.filter(
      n => n.metrics!.totalTime < this.config?.warningThreshold / 2,
    ).length

    return {
      totalNavigations: completedNavigations.length,
      averageTime,
      slowNavigations,
      fastNavigations,
    }
  }

  /**
   * 清理历史数据
   */
  clear(): void {
    this.navigations.clear()
    this.currentNavigation = undefined as any
  }

  /**
   * 生成导航ID
   */
  private generateNavigationId(
    from: RouteLocationNormalized,
    to: RouteLocationNormalized,
  ): string {
    return `${from.path}->${to.path}-${Date.now()}`
  }

  /**
   * 计算性能指标
   */
  private calculateMetrics(
    navigation: NavigationPerformance,
  ): PerformanceMetrics {
    const events = navigation.events
    const startTime = navigation.startTime
    const endTime = navigation.endTime || performance.now()

    // 查找关键事件
    const componentLoadStart = events.find(
      e => e.type === PerformanceEventType.COMPONENT_LOAD_START,
    )
    const componentLoadEnd = events.find(
      e => e.type === PerformanceEventType.COMPONENT_LOAD_END,
    )
    const routeMatchStart = events.find(
      e => e.type === PerformanceEventType.ROUTE_MATCH_START,
    )
    const routeMatchEnd = events.find(
      e => e.type === PerformanceEventType.ROUTE_MATCH_END,
    )
    const guardStart = events.find(
      e => e.type === PerformanceEventType.GUARD_EXECUTION_START,
    )
    const guardEnd = events.find(
      e => e.type === PerformanceEventType.GUARD_EXECUTION_END,
    )

    return {
      navigationStart: startTime,
      navigationEnd: endTime,
      componentLoadStart: componentLoadStart?.timestamp || startTime,
      componentLoadEnd: componentLoadEnd?.timestamp || endTime,
      routeMatchTime:
        routeMatchEnd && routeMatchStart
          ? routeMatchEnd.timestamp - routeMatchStart.timestamp
          : 0,
      guardExecutionTime:
        guardEnd && guardStart ? guardEnd.timestamp - guardStart.timestamp : 0,
      totalTime: endTime - startTime,
    }
  }

  /**
   * 检查性能阈值
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    if (metrics.totalTime > this.config?.errorThreshold) {
      console.error(
        `路由导航性能严重超标: ${metrics.totalTime.toFixed(2)}ms (阈值: ${this.config?.errorThreshold
        }ms)`,
      )
    }
    else if (metrics.totalTime > this.config?.warningThreshold) {
      console.warn(
        `路由导航性能超标: ${metrics.totalTime.toFixed(2)}ms (阈值: ${this.config?.warningThreshold
        }ms)`,
      )
    }
  }

  /**
   * 发射事件
   */
  private emitEvent(event: PerformanceEvent): void {
    const listeners = this.eventListeners.get(event.type)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event)
        }
        catch (error) {
          console.error('性能监控事件监听器错误:', error)
        }
      })
    }
  }
}

// ==================== 性能监控装饰器 ====================

/**
 * 性能监控装饰器
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  manager: PerformanceManager,
): T {
  return ((...args: any[]) => {
    const startTime = performance.now()

    try {
      const result = fn(...args)

      // 处理异步函数
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const endTime = performance.now()
          manager.recordEvent(PerformanceEventType.COMPONENT_LOAD_END, {
            name,
            duration: endTime - startTime,
          })
        })
      }

      // 同步函数
      const endTime = performance.now()
      manager.recordEvent(PerformanceEventType.COMPONENT_LOAD_END, {
        name,
        duration: endTime - startTime,
      })

      return result
    }
    catch (error) {
      const endTime = performance.now()
      manager.recordEvent(PerformanceEventType.COMPONENT_LOAD_END, {
        name,
        duration: endTime - startTime,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }) as T
}

// ==================== 性能监控插件 ====================

/**
 * 性能监控插件选项
 */
export interface PerformancePluginOptions extends Partial<PerformanceConfig> {
  /** 是否启用自动监控 */
  autoMonitor?: boolean
  /** 是否启用控制台输出 */
  consoleOutput?: boolean
}

/**
 * 创建性能监控插件
 */
export function createPerformancePlugin(
  options: PerformancePluginOptions = {},
) {
  const {
    enabled = true,
    warningThreshold = 1000,
    errorThreshold = 3000,
    sampleRate = 1,
    autoMonitor = true,
    consoleOutput = true,
    onMetrics,
  } = options

  if (!enabled) {
    return {
      install() {
        // 空实现
      },
      manager: null,
    }
  }

  const config: PerformanceConfig = {
    enabled,
    warningThreshold,
    errorThreshold,
    sampleRate,
    onMetrics: onMetrics || (() => { }),
  }

  const manager = new PerformanceManager(config)

  return {
    install(app: App, router: Router) {
      // 提供性能管理器
      app.provide('performanceManager', manager)

      // 全局属性
      app.config.globalProperties.$performanceManager = manager

      if (autoMonitor) {
        // 路由守卫：监控导航性能
        router.beforeEach((to, from, next) => {
          // 采样控制
          if (Math.random() > sampleRate) {
            next()
            return
          }

          const navigationId = manager.startNavigation(from, to)

          // 记录路由匹配开始
          manager.recordEvent(PerformanceEventType.ROUTE_MATCH_START)

          // 记录守卫执行开始
          manager.recordEvent(PerformanceEventType.GUARD_EXECUTION_START)

          // 存储导航ID到路由元信息
          to.meta._navigationId = navigationId

          next()
        })

        router.afterEach((to, from) => {
          const navigationId = to.meta._navigationId as string
          if (navigationId) {
            // 记录守卫执行结束
            manager.recordEvent(PerformanceEventType.GUARD_EXECUTION_END)

            // 记录路由匹配结束
            manager.recordEvent(PerformanceEventType.ROUTE_MATCH_END)

            // 延迟结束导航监控，等待组件加载
            setTimeout(() => {
              const metrics = manager.endNavigation(navigationId)

              if (consoleOutput && metrics) {
                console.warn(`路由导航性能: ${from.path} -> ${to.path}`, {
                  总耗时: `${metrics.totalTime.toFixed(2)}ms`,
                  路由匹配: `${metrics.routeMatchTime.toFixed(2)}ms`,
                  守卫执行: `${metrics.guardExecutionTime.toFixed(2)}ms`,
                  组件加载: `${(
                    metrics.componentLoadEnd - metrics.componentLoadStart
                  ).toFixed(2)}ms`,
                })
              }
            }, 0)
          }
        })
      }
    },
    manager,
  }
}

// ==================== 性能工具函数 ====================

/**
 * 创建性能配置
 */
export function createPerformanceConfig(
  config: Partial<PerformanceConfig>,
): PerformanceConfig {
  return {
    enabled: true,
    warningThreshold: 1000,
    errorThreshold: 3000,
    sampleRate: 1,
    ...config,
  }
}

/**
 * 检查性能API支持
 */
export function supportsPerformanceAPI(): boolean {
  return typeof performance !== 'undefined' && 'now' in performance
}

/**
 * 获取页面性能信息
 */
export function getPagePerformance() {
  if (!supportsPerformanceAPI())
    return null

  const navigation = performance.getEntriesByType(
    'navigation',
  )[0] as PerformanceNavigationTiming

  if (!navigation)
    return null

  return {
    domContentLoaded:
      navigation.domContentLoadedEventEnd
      - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
    firstContentfulPaint:
      performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
  }
}

// ==================== 默认导出 ====================

export default {
  createPerformancePlugin,
  PerformanceManager,
  PerformanceEventType,
  withPerformanceMonitoring,
  createPerformanceConfig,
  supportsPerformanceAPI,
  getPagePerformance,
}
