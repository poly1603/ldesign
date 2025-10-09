/**
 * 路由性能监控工具
 * 
 * 提供轻量级、高性能的路由性能监控功能
 * 专注于最小内存占用和最佳性能
 */

import type { Router, RouteLocationNormalized } from '../types'

/**
 * 性能指标
 */
export interface PerformanceMetric {
  /** 路由路径 */
  path: string
  /** 导航开始时间 */
  startTime: number
  /** 导航结束时间 */
  endTime: number
  /** 总耗时（毫秒） */
  duration: number
  /** 是否慢速路由 */
  isSlow: boolean
}

/**
 * 监控配置
 */
export interface MonitorConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 慢速路由阈值（毫秒） */
  slowThreshold?: number
  /** 最大记录数 */
  maxRecords?: number
  /** 性能报告回调 */
  onReport?: (metrics: PerformanceMetric[]) => void
}

/**
 * 路由性能监控器
 * 
 * 轻量级设计，最小内存占用
 */
export class RoutePerformanceMonitor {
  private router: Router
  private config: Required<MonitorConfig>
  private metrics: PerformanceMetric[] = []
  private currentNavigation: { path: string; startTime: number } | null = null

  constructor(router: Router, config: MonitorConfig = {}) {
    this.router = router
    this.config = {
      enabled: config.enabled ?? true,
      slowThreshold: config.slowThreshold ?? 1000,
      maxRecords: config.maxRecords ?? 50,
      onReport: config.onReport ?? (() => {}),
    }

    if (this.config.enabled) {
      this.setupMonitoring()
    }
  }

  /**
   * 设置监控
   */
  private setupMonitoring(): void {
    // 导航开始
    this.router.beforeEach((_to, _from, next) => {
      this.currentNavigation = {
        path: _to.path,
        startTime: performance.now(),
      }
      next()
    })

    // 导航结束
    this.router.afterEach((to) => {
      if (this.currentNavigation && this.currentNavigation.path === to.path) {
        const endTime = performance.now()
        const duration = endTime - this.currentNavigation.startTime

        const metric: PerformanceMetric = {
          path: to.path,
          startTime: this.currentNavigation.startTime,
          endTime,
          duration,
          isSlow: duration > this.config.slowThreshold,
        }

        this.addMetric(metric)
        this.currentNavigation = null
      }
    })
  }

  /**
   * 添加性能指标
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // 限制记录数量，保持内存占用最小
    if (this.metrics.length > this.config.maxRecords) {
      this.metrics.shift()
    }

    // 如果是慢速路由，立即报告
    if (metric.isSlow) {
      this.config.onReport([metric])
    }
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * 获取慢速路由
   */
  getSlowRoutes(): PerformanceMetric[] {
    return this.metrics.filter(m => m.isSlow)
  }

  /**
   * 获取平均导航时间
   */
  getAverageNavigationTime(): number {
    if (this.metrics.length === 0) return 0
    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0)
    return total / this.metrics.length
  }

  /**
   * 获取最慢的路由
   */
  getSlowestRoute(): PerformanceMetric | null {
    if (this.metrics.length === 0) return null
    return this.metrics.reduce((slowest, current) =>
      current.duration > slowest.duration ? current : slowest
    )
  }

  /**
   * 获取最快的路由
   */
  getFastestRoute(): PerformanceMetric | null {
    if (this.metrics.length === 0) return null
    return this.metrics.reduce((fastest, current) =>
      current.duration < fastest.duration ? current : fastest
    )
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics = []
  }

  /**
   * 生成性能报告
   */
  generateReport(): {
    totalNavigations: number
    averageTime: number
    slowRoutes: number
    slowestRoute: PerformanceMetric | null
    fastestRoute: PerformanceMetric | null
  } {
    return {
      totalNavigations: this.metrics.length,
      averageTime: this.getAverageNavigationTime(),
      slowRoutes: this.getSlowRoutes().length,
      slowestRoute: this.getSlowestRoute(),
      fastestRoute: this.getFastestRoute(),
    }
  }

  /**
   * 启用监控
   */
  enable(): void {
    if (!this.config.enabled) {
      this.config.enabled = true
      this.setupMonitoring()
    }
  }

  /**
   * 禁用监控
   */
  disable(): void {
    this.config.enabled = false
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.disable()
    this.clear()
  }
}

/**
 * 创建路由性能监控器
 */
export function createRoutePerformanceMonitor(
  router: Router,
  config?: MonitorConfig
): RoutePerformanceMonitor {
  return new RoutePerformanceMonitor(router, config)
}

/**
 * 性能监控插件
 */
export function createPerformanceMonitorPlugin(config?: MonitorConfig) {
  return {
    name: 'performance-monitor',
    install(router: Router) {
      const monitor = createRoutePerformanceMonitor(router, config)
      
      // 将监控器附加到路由器实例
      ;(router as any).__performanceMonitor = monitor
      
      return monitor
    },
  }
}

/**
 * 获取路由器的性能监控器
 */
export function getPerformanceMonitor(router: Router): RoutePerformanceMonitor | null {
  return (router as any).__performanceMonitor || null
}

/**
 * 导出类型
 */
export type {
  PerformanceMetric as RoutePerformanceMetric,
  MonitorConfig as PerformanceMonitorConfig,
}

