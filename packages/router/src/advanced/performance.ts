import type { RouteLocationNormalized, RouteLocationRaw } from '../types'

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
  memoryUsage?: number
  cacheHit?: boolean
}

/**
 * 导航性能数据
 */
export interface NavigationPerformance {
  from: RouteLocationNormalized
  to: RouteLocationNormalized | RouteLocationRaw
  metrics: PerformanceMetrics
  timestamp: number
  success: boolean
  error?: any
  userAgent?: string
  networkType?: string
}

/**
 * 性能统计
 */
export interface PerformanceStats {
  totalNavigations: number
  successRate: number
  averageDuration: number
  fastestNavigation: number
  slowestNavigation: number
  p95Duration: number
  p99Duration: number
  errorRate: number
  cacheHitRate: number
}

/**
 * 性能告警配置
 */
export interface PerformanceAlertConfig {
  slowNavigationThreshold: number
  errorRateThreshold: number
  memoryUsageThreshold: number
  enabled: boolean
}

/**
 * 性能事件
 */
export interface PerformanceEvents {
  'performance:navigation-start': (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) => void
  'performance:navigation-end': (performance: NavigationPerformance) => void
  'performance:slow-navigation': (performance: NavigationPerformance) => void
  'performance:error': (
    error: any,
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) => void
  'performance:alert': (type: string, message: string, data: any) => void
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private enabled = false
  private navigationHistory: NavigationPerformance[] = []
  private activeNavigations = new Map<string, Partial<PerformanceMetrics>>()
  private maxHistorySize = 100
  private eventListeners = new Map<keyof PerformanceEvents, Function[]>()
  private alertConfig: PerformanceAlertConfig = {
    slowNavigationThreshold: 1000,
    errorRateThreshold: 0.05,
    memoryUsageThreshold: 100 * 1024 * 1024, // 100MB
    enabled: true,
  }

  constructor(enabled = false, config?: Partial<PerformanceAlertConfig>) {
    this.enabled = enabled
    if (config) {
      this.alertConfig = { ...this.alertConfig, ...config }
    }
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
  startNavigation(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ): string | null {
    if (!this.enabled) {
      return null
    }

    // 触发导航开始事件
    this.emit('performance:navigation-start', to, from)

    const navigationId = this.generateNavigationId()
    const now = this.now()

    this.activeNavigations.set(navigationId, {
      navigationStart: now,
    })

    return navigationId
  }

  /**
   * 结束导航性能监控
   */
  endNavigation(
    navigationId: string,
    success: boolean,
    error?: any,
    to?: RouteLocationNormalized,
    from?: RouteLocationNormalized
  ): void {
    if (!this.enabled || !navigationId) {
      return
    }

    const metrics = this.activeNavigations.get(navigationId)
    if (!metrics || metrics.navigationStart === undefined) {
      return
    }

    const now = this.now()
    const finalMetrics: PerformanceMetrics = {
      navigationStart: metrics.navigationStart,
      navigationEnd: now,
      duration: now - metrics.navigationStart,
      routeResolution: metrics.routeResolution || 0,
      guardExecution: metrics.guardExecution || 0,
      componentLoad: metrics.componentLoad || 0,
      renderTime: metrics.renderTime || 0,
      memoryUsage: this.getMemoryUsage() || 0,
      cacheHit: metrics.cacheHit || false,
    }

    // 创建导航性能记录
    const performance: NavigationPerformance = {
      from: from || ({} as RouteLocationNormalized),
      to: to || ({} as RouteLocationNormalized),
      metrics: finalMetrics,
      timestamp: metrics.navigationStart,
      success,
      error,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      networkType: this.getNetworkType() || '',
    }

    // 添加到历史记录
    this.addToHistory(performance)

    // 检查告警
    this.checkAlerts(performance)

    // 触发事件
    this.emit('performance:navigation-end', performance)
    if (error) {
      this.emit(
        'performance:error',
        error,
        to || ({} as RouteLocationNormalized),
        from || ({} as RouteLocationNormalized)
      )
    }

    // 清理活跃导航
    this.activeNavigations.delete(navigationId)
  }

  /**
   * 记录路由解析时间
   */
  recordRouteResolution(navigationId: string, duration: number): void {
    if (!this.enabled || !navigationId) {
      return
    }

    const metrics = this.activeNavigations.get(navigationId)
    if (metrics) {
      metrics.routeResolution = duration
    }
  }

  /**
   * 记录守卫执行时间
   */
  recordGuardExecution(navigationId: string, duration: number): void {
    if (!this.enabled || !navigationId) {
      return
    }

    const metrics = this.activeNavigations.get(navigationId)
    if (metrics) {
      metrics.guardExecution = duration
    }
  }

  /**
   * 记录组件加载时间
   */
  recordComponentLoad(navigationId: string, duration: number): void {
    if (!this.enabled || !navigationId) {
      return
    }

    const metrics = this.activeNavigations.get(navigationId)
    if (metrics) {
      metrics.componentLoad = duration
    }
  }

  /**
   * 记录渲染时间
   */
  recordRenderTime(navigationId: string, duration: number): void {
    if (!this.enabled || !navigationId) {
      return
    }

    const metrics = this.activeNavigations.get(navigationId)
    if (metrics) {
      metrics.renderTime = duration
    }
  }

  /**
   * 获取性能统计信息
   */
  getStats(): PerformanceStats | null {
    if (!this.enabled) {
      return null
    }

    const navigations = this.navigationHistory.filter(n => n.success)
    const durations = navigations
      .map(n => n.metrics.duration)
      .sort((a, b) => a - b)
    const errors = this.navigationHistory.filter(n => !n.success)
    const cacheHits = navigations.filter(n => n.metrics.cacheHit).length

    if (durations.length === 0) {
      return {
        totalNavigations: 0,
        averageDuration: 0,
        successRate: 0,
        fastestNavigation: 0,
        slowestNavigation: 0,
        p95Duration: 0,
        p99Duration: 0,
        errorRate: 0,
        cacheHitRate: 0,
      }
    }

    const totalDuration = durations.reduce((sum, d) => sum + d, 0)
    const averageDuration = totalDuration / durations.length
    const successRate = navigations.length / this.navigationHistory.length
    const errorRate = errors.length / this.navigationHistory.length
    const cacheHitRate = cacheHits / navigations.length

    // 计算百分位数
    const p95Index = Math.floor(durations.length * 0.95)
    const p99Index = Math.floor(durations.length * 0.99)

    return {
      totalNavigations: this.navigationHistory.length,
      averageDuration: Math.round(averageDuration),
      successRate: Math.round(successRate * 100) / 100,
      fastestNavigation: durations[0] || 0,
      slowestNavigation: durations[durations.length - 1] || 0,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      errorRate: Math.round(errorRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    }
  }

  /**
   * 获取详细的性能报告
   */
  getDetailedReport() {
    if (!this.enabled) {
      return null
    }

    const stats = this.getStats()
    if (!stats) {
      return null
    }

    const history = this.navigationHistory
    const breakdown = {
      routeResolution: {
        average: this.calculateAverage(history, 'routeResolution'),
        max: this.calculateMax(history, 'routeResolution'),
        min: this.calculateMin(history, 'routeResolution'),
      },
      guardExecution: {
        average: this.calculateAverage(history, 'guardExecution'),
        max: this.calculateMax(history, 'guardExecution'),
        min: this.calculateMin(history, 'guardExecution'),
      },
      componentLoad: {
        average: this.calculateAverage(history, 'componentLoad'),
        max: this.calculateMax(history, 'componentLoad'),
        min: this.calculateMin(history, 'componentLoad'),
      },
      renderTime: {
        average: this.calculateAverage(history, 'renderTime'),
        max: this.calculateMax(history, 'renderTime'),
        min: this.calculateMin(history, 'renderTime'),
      },
    }

    return {
      ...stats,
      breakdown,
      recommendations: this.generateRecommendations(breakdown),
    }
  }

  /**
   * 清空性能历史
   */
  clear(): void {
    this.navigationHistory = []
    this.activeNavigations.clear()
  }

  /**
   * 生成导航ID
   */
  private generateNavigationId(): string {
    return `nav_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * 获取当前时间戳
   */
  private now(): number {
    return typeof performance !== 'undefined' && performance.now
      ? performance.now()
      : Date.now()
  }

  /**
   * 计算平均值
   */
  private calculateAverage(
    history: NavigationPerformance[],
    metric: keyof PerformanceMetrics
  ): number {
    if (history.length === 0) return 0
    const values = history.map(nav => nav.metrics[metric] as number)
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  /**
   * 计算最大值
   */
  private calculateMax(
    history: NavigationPerformance[],
    metric: keyof PerformanceMetrics
  ): number {
    if (history.length === 0) return 0
    const values = history.map(nav => nav.metrics[metric] as number)
    return Math.max(...values)
  }

  /**
   * 计算最小值
   */
  private calculateMin(
    history: NavigationPerformance[],
    metric: keyof PerformanceMetrics
  ): number {
    if (history.length === 0) return 0
    const values = history.map(nav => nav.metrics[metric] as number)
    return Math.min(...values)
  }

  /**
   * 生成性能优化建议
   */
  private generateRecommendations(breakdown: any): string[] {
    const recommendations: string[] = []

    if (breakdown.componentLoad.average > 100) {
      recommendations.push('考虑使用路由懒加载来减少组件加载时间')
    }

    if (breakdown.guardExecution.average > 50) {
      recommendations.push('优化路由守卫逻辑，减少执行时间')
    }

    if (breakdown.routeResolution.average > 20) {
      recommendations.push('考虑优化路由匹配算法或减少路由数量')
    }

    if (breakdown.renderTime.average > 200) {
      recommendations.push('优化组件渲染性能，考虑使用虚拟滚动或分页')
    }

    return recommendations
  }

  /**
   * 获取导航历史
   */
  getNavigationHistory(): NavigationPerformance[] {
    return [...this.navigationHistory]
  }

  /**
   * 获取路由性能统计
   */
  getRouteStats(): Map<string, PerformanceStats> {
    const routeMap = new Map<string, NavigationPerformance[]>()

    // 按路由分组
    this.navigationHistory.forEach(nav => {
      const routePath = typeof nav.to === 'string' ? nav.to : nav.to.path || '/'
      if (!routeMap.has(routePath)) {
        routeMap.set(routePath, [])
      }
      routeMap.get(routePath)!.push(nav)
    })

    // 计算每个路由的统计
    const routeStats = new Map<string, PerformanceStats>()
    routeMap.forEach((navigations, route) => {
      const successful = navigations.filter(n => n.success)
      const durations = successful
        .map(n => n.metrics.duration)
        .sort((a, b) => a - b)

      if (durations.length > 0) {
        const totalDuration = durations.reduce((sum, d) => sum + d, 0)
        const p95Index = Math.floor(durations.length * 0.95)
        const p99Index = Math.floor(durations.length * 0.99)

        routeStats.set(route, {
          totalNavigations: navigations.length,
          averageDuration: Math.round(totalDuration / durations.length),
          successRate: successful.length / navigations.length,
          fastestNavigation: durations[0] || 0,
          slowestNavigation: durations[durations.length - 1] || 0,
          p95Duration: durations[p95Index] || 0,
          p99Duration: durations[p99Index] || 0,
          errorRate:
            (navigations.length - successful.length) / navigations.length,
          cacheHitRate:
            successful.filter(n => n.metrics.cacheHit).length /
            successful.length,
        })
      }
    })

    return routeStats
  }

  /**
   * 事件监听
   */
  on<K extends keyof PerformanceEvents>(
    event: K,
    handler: PerformanceEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(handler)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof PerformanceEvents>(
    event: K,
    handler: PerformanceEvents[K]
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
  private emit<K extends keyof PerformanceEvents>(
    event: K,
    ...args: Parameters<PerformanceEvents[K]>
  ): void {
    const handlers = this.eventListeners.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          ;(handler as any)(...args)
        } catch (error) {
          console.error(
            `Error in performance event handler for ${event}:`,
            error
          )
        }
      })
    }
  }

  /**
   * 检查性能告警
   */
  private checkAlerts(performance: NavigationPerformance): void {
    if (!this.alertConfig.enabled) return

    // 慢导航告警
    if (
      performance.metrics.duration > this.alertConfig.slowNavigationThreshold
    ) {
      this.emit('performance:slow-navigation', performance)
      this.emit(
        'performance:alert',
        'slow-navigation',
        `Slow navigation detected: ${performance.metrics.duration}ms`,
        performance
      )
    }

    // 错误率告警
    const stats = this.getStats()
    if (stats && stats.errorRate > this.alertConfig.errorRateThreshold) {
      this.emit(
        'performance:alert',
        'high-error-rate',
        `High error rate detected: ${(stats.errorRate * 100).toFixed(1)}%`,
        stats
      )
    }

    // 内存使用告警
    if (
      performance.metrics.memoryUsage &&
      performance.metrics.memoryUsage > this.alertConfig.memoryUsageThreshold
    ) {
      this.emit(
        'performance:alert',
        'high-memory-usage',
        `High memory usage detected: ${Math.round(
          performance.metrics.memoryUsage / 1024 / 1024
        )}MB`,
        performance
      )
    }
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.navigationHistory = []
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number | undefined {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return undefined
  }

  /**
   * 获取网络类型
   */
  private getNetworkType(): string | undefined {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      return (navigator as any).connection?.effectiveType
    }
    return undefined
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(performance: NavigationPerformance): void {
    this.navigationHistory.push(performance)

    // 限制历史记录大小
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory.shift()
    }
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.clearHistory()
    this.eventListeners.clear()
    this.enabled = false
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(
  enabled?: boolean
): PerformanceMonitor | null {
  if (enabled === false) {
    return null
  }

  return new PerformanceMonitor(enabled)
}
