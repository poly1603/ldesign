import type { RouteLocationNormalized } from './types'

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  navigationStart: number
  navigationEnd: number
  duration: number
  routeResolution: number
  guardExecution: number
  componentLoad: number
  renderTime: number
}

/**
 * 导航性能数据
 */
export interface NavigationPerformance {
  from: RouteLocationNormalized
  to: RouteLocationNormalized
  metrics: PerformanceMetrics
  timestamp: number
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private enabled = false
  private navigationHistory: NavigationPerformance[] = []
  private currentNavigation: Partial<PerformanceMetrics> = {}
  private maxHistorySize = 100

  constructor(enabled = false) {
    this.enabled = enabled
  }

  /**
   * 启用性能监控
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用性能监控
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * 开始导航性能监控
   */
  startNavigation(): void {
    if (!this.enabled) return

    this.currentNavigation = {
      navigationStart: performance.now(),
    }
  }

  /**
   * 记录路由解析时间
   */
  markRouteResolution(): void {
    if (!this.enabled || !this.currentNavigation.navigationStart) return

    this.currentNavigation.routeResolution =
      performance.now() - this.currentNavigation.navigationStart
  }

  /**
   * 记录守卫执行时间
   */
  markGuardExecution(): void {
    if (!this.enabled || !this.currentNavigation.navigationStart) return

    const now = performance.now()
    this.currentNavigation.guardExecution =
      now -
      this.currentNavigation.navigationStart -
      (this.currentNavigation.routeResolution || 0)
  }

  /**
   * 记录组件加载时间
   */
  markComponentLoad(): void {
    if (!this.enabled || !this.currentNavigation.navigationStart) return

    const now = performance.now()
    const previousTime =
      (this.currentNavigation.routeResolution || 0) +
      (this.currentNavigation.guardExecution || 0)
    this.currentNavigation.componentLoad =
      now - this.currentNavigation.navigationStart - previousTime
  }

  /**
   * 结束导航性能监控
   */
  endNavigation(
    from: RouteLocationNormalized,
    to: RouteLocationNormalized
  ): void {
    if (!this.enabled || !this.currentNavigation.navigationStart) return

    const navigationEnd = performance.now()
    const duration = navigationEnd - this.currentNavigation.navigationStart

    const metrics: PerformanceMetrics = {
      navigationStart: this.currentNavigation.navigationStart,
      navigationEnd,
      duration,
      routeResolution: this.currentNavigation.routeResolution || 0,
      guardExecution: this.currentNavigation.guardExecution || 0,
      componentLoad: this.currentNavigation.componentLoad || 0,
      renderTime:
        duration -
        (this.currentNavigation.routeResolution || 0) -
        (this.currentNavigation.guardExecution || 0) -
        (this.currentNavigation.componentLoad || 0),
    }

    const navigationPerformance: NavigationPerformance = {
      from,
      to,
      metrics,
      timestamp: Date.now(),
    }

    this.addToHistory(navigationPerformance)
    this.currentNavigation = {}

    // 输出性能信息到控制台（开发模式）
    if (process.env.NODE_ENV === 'development') {
      this.logPerformance(navigationPerformance)
    }
  }

  /**
   * 获取性能统计
   */
  getStats() {
    if (this.navigationHistory.length === 0) {
      return null
    }

    const durations = this.navigationHistory.map(nav => nav.metrics.duration)
    const routeResolutions = this.navigationHistory.map(
      nav => nav.metrics.routeResolution
    )
    const guardExecutions = this.navigationHistory.map(
      nav => nav.metrics.guardExecution
    )
    const componentLoads = this.navigationHistory.map(
      nav => nav.metrics.componentLoad
    )

    return {
      totalNavigations: this.navigationHistory.length,
      averageDuration: this.average(durations),
      medianDuration: this.median(durations),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      averageRouteResolution: this.average(routeResolutions),
      averageGuardExecution: this.average(guardExecutions),
      averageComponentLoad: this.average(componentLoads),
      slowestNavigations: this.getSlowestNavigations(5),
      fastestNavigations: this.getFastestNavigations(5),
    }
  }

  /**
   * 获取导航历史
   */
  getHistory(): NavigationPerformance[] {
    return [...this.navigationHistory]
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.navigationHistory = []
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(navigation: NavigationPerformance): void {
    this.navigationHistory.push(navigation)

    // 限制历史记录大小
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory.shift()
    }
  }

  /**
   * 计算平均值
   */
  private average(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  }

  /**
   * 计算中位数
   */
  private median(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }

  /**
   * 获取最慢的导航
   */
  private getSlowestNavigations(count: number): NavigationPerformance[] {
    return [...this.navigationHistory]
      .sort((a, b) => b.metrics.duration - a.metrics.duration)
      .slice(0, count)
  }

  /**
   * 获取最快的导航
   */
  private getFastestNavigations(count: number): NavigationPerformance[] {
    return [...this.navigationHistory]
      .sort((a, b) => a.metrics.duration - b.metrics.duration)
      .slice(0, count)
  }

  /**
   * 输出性能信息到控制台
   */
  private logPerformance(navigation: NavigationPerformance): void {
    const { metrics, to } = navigation

    console.group(`🚀 Navigation Performance: ${to.path}`)
    console.log(`⏱️  Total Duration: ${metrics.duration.toFixed(2)}ms`)
    console.log(`🔍 Route Resolution: ${metrics.routeResolution.toFixed(2)}ms`)
    console.log(`🛡️  Guard Execution: ${metrics.guardExecution.toFixed(2)}ms`)
    console.log(`📦 Component Load: ${metrics.componentLoad.toFixed(2)}ms`)
    console.log(`🎨 Render Time: ${metrics.renderTime.toFixed(2)}ms`)
    console.groupEnd()
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(enabled = false): PerformanceMonitor {
  return new PerformanceMonitor(enabled)
}
