/**
 * @ldesign/router 路由性能分析器
 *
 * 提供详细的路由性能分析、诊断和优化建议
 */

import type { RouteLocationNormalized, Router } from '../types'
import { reactive } from 'vue'

// ==================== 类型定义 ====================

/**
 * 性能指标
 */
export interface PerformanceMetric {
  /** 路由路径 */
  path: string
  /** 路由名称 */
  name?: string
  /** 导航开始时间 */
  startTime: number
  /** 导航结束时间 */
  endTime?: number
  /** 总耗时 */
  duration?: number
  /** 守卫执行时间 */
  guardTime?: number
  /** 组件加载时间 */
  componentLoadTime?: number
  /** 渲染时间 */
  renderTime?: number
  /** 内存使用 */
  memoryUsage?: number
  /** 是否是懒加载 */
  isLazyLoaded?: boolean
  /** 是否命中缓存 */
  isCached?: boolean
  /** 错误信息 */
  error?: Error
  /** 性能评分 */
  score?: number
}

/**
 * 性能分析报告
 */
export interface PerformanceReport {
  /** 总体评分 */
  overallScore: number
  /** 总导航次数 */
  totalNavigations: number
  /** 平均导航时间 */
  averageNavigationTime: number
  /** 最慢的路由 */
  slowestRoutes: PerformanceMetric[]
  /** 最快的路由 */
  fastestRoutes: PerformanceMetric[]
  /** 错误路由 */
  errorRoutes: PerformanceMetric[]
  /** 性能趋势 */
  performanceTrend: 'improving' | 'stable' | 'degrading'
  /** 优化建议 */
  suggestions: OptimizationSuggestion[]
  /** 详细指标 */
  detailedMetrics: {
    p50: number
    p75: number
    p90: number
    p95: number
    p99: number
  }
}

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  /** 优先级 */
  priority: 'high' | 'medium' | 'low'
  /** 类型 */
  type: 'lazy-loading' | 'caching' | 'code-splitting' | 'guard-optimization' | 'memory' | 'other'
  /** 受影响的路由 */
  affectedRoutes: string[]
  /** 建议描述 */
  description: string
  /** 预期改进 */
  expectedImprovement: string
  /** 实施步骤 */
  implementationSteps?: string[]
}

/**
 * 分析器配置
 */
export interface AnalyzerConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 采样率 (0-1) */
  sampleRate?: number
  /** 最大记录数 */
  maxRecords?: number
  /** 性能阈值 */
  thresholds?: {
    good?: number // 良好 < 200ms
    acceptable?: number // 可接受 < 500ms
    poor?: number // 差 < 1000ms
  }
  /** 是否记录详细信息 */
  detailed?: boolean
  /** 是否自动分析 */
  autoAnalyze?: boolean
  /** 分析间隔 */
  analyzeInterval?: number
}

// ==================== 性能分析器实现 ====================

/**
 * 路由性能分析器
 */
export class RoutePerformanceAnalyzer {
  private router: Router
  private config: Required<AnalyzerConfig>
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private currentNavigation: PerformanceMetric | null = null
  private analyzeTimer?: number
  private navigationCount = 0

  // 响应式状态
  public state = reactive({
    isRecording: false,
    totalRecords: 0,
    currentReport: null as PerformanceReport | null,
    realTimeMetrics: {
      lastNavigationTime: 0,
      averageTime: 0,
      memoryUsage: 0,
    },
  })

  constructor(router: Router, config?: AnalyzerConfig) {
    this.router = router
    this.config = {
      enabled: true,
      sampleRate: 1,
      maxRecords: 1000,
      thresholds: {
        good: 200,
        acceptable: 500,
        poor: 1000,
        ...config?.thresholds,
      },
      detailed: false,
      autoAnalyze: true,
      analyzeInterval: 60000, // 1分钟
      ...config,
    }

    if (this.config?.enabled) {
      this.initialize()
    }
  }

  /**
   * 初始化分析器
   */
  private initialize(): void {
    this.setupNavigationTracking()

    if (this.config?.autoAnalyze) {
      this.startAutoAnalyze()
    }

    this.state.isRecording = true
  }

  /**
   * 设置导航跟踪
   */
  private setupNavigationTracking(): void {
    // 导航开始前
    this.router.beforeEach((to, _from, next) => {
      if (this.shouldRecord()) {
        this.startNavigation(to)
      }

      const guardStart = performance.now()

      // 包装 next 函数以测量守卫时间
      const wrappedNext = (arg?: any) => {
        if (this.currentNavigation) {
          this.currentNavigation.guardTime = performance.now() - guardStart
        }
        return next(arg)
      }

      return wrappedNext
    })

    // 导航完成后
    this.router.afterEach((to, _from) => {
      if (this.currentNavigation) {
        this.endNavigation(to)
      }
    })

    // 导航错误
    this.router.onError((error) => {
      if (this.currentNavigation) {
        this.currentNavigation.error = error
        this.endNavigation()
      }
    })
  }

  /**
   * 判断是否应该记录
   */
  private shouldRecord(): boolean {
    if (!this.config?.enabled || !this.state.isRecording) {
      return false
    }

    // 采样
    if (Math.random() > this.config?.sampleRate) {
      return false
    }

    // 检查记录数限制
    if (this.state.totalRecords >= this.config?.maxRecords) {
      this.cleanOldRecords()
    }

    return true
  }

  /**
   * 开始导航记录
   */
  private startNavigation(to: RouteLocationNormalized): void {
    this.currentNavigation = {
      path: to.path,
      name: to.name as string | undefined,
      startTime: performance.now(),
      memoryUsage: this.getMemoryUsage(),
    }
  }

  /**
   * 结束导航记录
   */
  private endNavigation(to?: RouteLocationNormalized): void {
    if (!this.currentNavigation)
      return

    const endTime = performance.now()
    this.currentNavigation.endTime = endTime
    this.currentNavigation.duration = endTime - this.currentNavigation.startTime

    // 计算渲染时间（总时间 - 守卫时间 - 组件加载时间）
    if (this.currentNavigation.guardTime && this.currentNavigation.componentLoadTime) {
      this.currentNavigation.renderTime = this.currentNavigation.duration
        - this.currentNavigation.guardTime
        - this.currentNavigation.componentLoadTime
    }

    // 计算性能评分
    this.currentNavigation.score = this.calculateScore(this.currentNavigation)

    // 存储指标
    const path = to?.path || this.currentNavigation.path
    if (!this.metrics.has(path)) {
      this.metrics.set(path, [])
    }
    this.metrics.get(path)!.push(this.currentNavigation)

    // 更新状态
    this.navigationCount++
    this.state.totalRecords++
    this.updateRealTimeMetrics(this.currentNavigation)

    this.currentNavigation = null
  }

  /**
   * 计算性能评分
   */
  private calculateScore(metric: PerformanceMetric): number {
    if (!metric.duration)
      return 0

    const { good = 200, acceptable = 500, poor = 1000 } = this.config?.thresholds || {}

    if (metric.duration <= good) {
      return 100
    }
    else if (metric.duration <= acceptable) {
      return 80 - (metric.duration - good) / (acceptable - good) * 20
    }
    else if (metric.duration <= poor) {
      return 60 - (metric.duration - acceptable) / (poor - acceptable) * 30
    }
    else {
      return Math.max(0, 30 - (metric.duration - poor) / 1000 * 10)
    }
  }

  /**
   * 获取内存使用量
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0
    }
    return 0
  }

  /**
   * 更新实时指标
   */
  private updateRealTimeMetrics(metric: PerformanceMetric): void {
    this.state.realTimeMetrics.lastNavigationTime = metric.duration || 0
    this.state.realTimeMetrics.memoryUsage = this.getMemoryUsage()

    // 计算移动平均
    const allMetrics = Array.from(this.metrics.values()).flat()
    const recentMetrics = allMetrics.slice(-100) // 最近100次
    const totalTime = recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    this.state.realTimeMetrics.averageTime = recentMetrics.length > 0
      ? totalTime / recentMetrics.length
      : 0
  }

  /**
   * 清理旧记录
   */
  private cleanOldRecords(): void {
    const halfMax = Math.floor(this.config?.maxRecords / 2)

    for (const [path, metrics] of this.metrics.entries()) {
      if (metrics.length > halfMax) {
        this.metrics.set(path, metrics.slice(-halfMax))
      }
    }

    this.state.totalRecords = Array.from(this.metrics.values())
      .reduce((sum, metrics) => sum + metrics.length, 0)
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const allMetrics = Array.from(this.metrics.values()).flat()

    if (allMetrics.length === 0) {
      return this.createEmptyReport()
    }

    // 排序指标
    const sortedByDuration = [...allMetrics]
      .filter(m => m.duration !== undefined)
      .sort((a, b) => (a.duration || 0) - (b.duration || 0))

    // 计算统计数据
    const durations = sortedByDuration.map(m => m.duration || 0)
    const totalTime = durations.reduce((sum, d) => sum + d, 0)
    const averageTime = totalTime / durations.length

    // 计算百分位数
    const detailedMetrics = {
      p50: this.percentile(durations, 0.5),
      p75: this.percentile(durations, 0.75),
      p90: this.percentile(durations, 0.9),
      p95: this.percentile(durations, 0.95),
      p99: this.percentile(durations, 0.99),
    }

    // 找出最慢和最快的路由
    const slowestRoutes = sortedByDuration.slice(-5).reverse()
    const fastestRoutes = sortedByDuration.slice(0, 5)

    // 找出错误路由
    const errorRoutes = allMetrics.filter(m => m.error)

    // 计算性能趋势
    const trend = this.calculateTrend(allMetrics)

    // 生成优化建议
    const suggestions = this.generateSuggestions(allMetrics)

    // 计算总体评分
    const overallScore = this.calculateOverallScore(allMetrics)

    const report: PerformanceReport = {
      overallScore,
      totalNavigations: allMetrics.length,
      averageNavigationTime: averageTime,
      slowestRoutes,
      fastestRoutes,
      errorRoutes,
      performanceTrend: trend,
      suggestions,
      detailedMetrics,
    }

    this.state.currentReport = report
    return report
  }

  /**
   * 计算百分位数
   */
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0)
      return 0

    const index = Math.ceil(sorted.length * p) - 1
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))] ?? 0
  }

  /**
   * 计算性能趋势
   */
  private calculateTrend(metrics: PerformanceMetric[]): 'improving' | 'stable' | 'degrading' {
    if (metrics.length < 20)
      return 'stable'

    const recent = metrics.slice(-10)
    const previous = metrics.slice(-20, -10)

    const recentAvg = recent.reduce((sum, m) => sum + (m.duration || 0), 0) / recent.length
    const previousAvg = previous.reduce((sum, m) => sum + (m.duration || 0), 0) / previous.length

    const changePercent = (recentAvg - previousAvg) / previousAvg * 100

    if (changePercent < -10)
      return 'improving'
    if (changePercent > 10)
      return 'degrading'
    return 'stable'
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(metrics: PerformanceMetric[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    const routeMetrics = new Map<string, PerformanceMetric[]>()

    // 按路由分组
    metrics.forEach((m) => {
      if (!routeMetrics.has(m.path)) {
        routeMetrics.set(m.path, [])
      }
      routeMetrics.get(m.path)!.push(m)
    })

    // 分析每个路由
    for (const [path, pathMetrics] of routeMetrics.entries()) {
      const avgTime = pathMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / pathMetrics.length

      // 检查慢路由
      if (this.config && avgTime > (this.config.thresholds?.poor ?? 1000)) {
        suggestions.push({
          priority: 'high',
          type: 'lazy-loading',
          affectedRoutes: [path],
          description: `路由 "${path}" 平均加载时间为 ${avgTime.toFixed(0)}ms，建议实施懒加载`,
          expectedImprovement: '预计可减少 50-70% 的初始加载时间',
          implementationSteps: [
            '将组件改为动态导入：() => import("./Component.vue")',
            '考虑使用路由级别的代码分割',
            '实施预加载策略',
          ],
        })
      }

      // 检查频繁访问的路由
      if (this.config && pathMetrics.length > metrics.length * 0.2 && avgTime > (this.config.thresholds?.acceptable ?? 500)) {
        suggestions.push({
          priority: 'medium',
          type: 'caching',
          affectedRoutes: [path],
          description: `路由 "${path}" 访问频繁但加载较慢，建议启用缓存`,
          expectedImprovement: '预计可减少 60-80% 的重复加载时间',
          implementationSteps: [
            '启用组件缓存',
            '使用 keep-alive 包裹组件',
            '实施数据缓存策略',
          ],
        })
      }

      // 检查守卫耗时
      const avgGuardTime = pathMetrics
        .filter(m => m.guardTime)
        .reduce((sum, m) => sum + (m.guardTime || 0), 0) / pathMetrics.length

      if (avgGuardTime > 100) {
        suggestions.push({
          priority: 'medium',
          type: 'guard-optimization',
          affectedRoutes: [path],
          description: `路由 "${path}" 的守卫执行时间过长 (${avgGuardTime.toFixed(0)}ms)`,
          expectedImprovement: '预计可减少 30-50% 的守卫执行时间',
          implementationSteps: [
            '优化守卫逻辑，避免同步阻塞操作',
            '将重复的验证逻辑缓存',
            '考虑并行执行独立的守卫',
          ],
        })
      }
    }

    // 检查内存使用
    const avgMemory = metrics.reduce((sum, m) => sum + (m.memoryUsage || 0), 0) / metrics.length
    if (avgMemory > 50 * 1024 * 1024) { // 50MB
      suggestions.push({
        priority: 'high',
        type: 'memory',
        affectedRoutes: Array.from(routeMetrics.keys()),
        description: `平均内存使用量过高 (${(avgMemory / 1024 / 1024).toFixed(1)}MB)`,
        expectedImprovement: '预计可减少 40-60% 的内存使用',
        implementationSteps: [
          '清理未使用的组件和数据',
          '实施更激进的垃圾回收策略',
          '优化数据结构和算法',
          '避免内存泄漏',
        ],
      })
    }

    // 排序建议
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return suggestions
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0)
      return 100

    const scores = metrics
      .filter(m => m.score !== undefined)
      .map(m => m.score!)

    if (scores.length === 0)
      return 100

    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  /**
   * 创建空报告
   */
  private createEmptyReport(): PerformanceReport {
    return {
      overallScore: 100,
      totalNavigations: 0,
      averageNavigationTime: 0,
      slowestRoutes: [],
      fastestRoutes: [],
      errorRoutes: [],
      performanceTrend: 'stable',
      suggestions: [],
      detailedMetrics: {
        p50: 0,
        p75: 0,
        p90: 0,
        p95: 0,
        p99: 0,
      },
    }
  }

  /**
   * 开始自动分析
   */
  private startAutoAnalyze(): void {
    if (typeof window === 'undefined')
      return

    this.analyzeTimer = window.setInterval(() => {
      this.generateReport()
    }, this.config?.analyzeInterval)
  }

  /**
   * 停止自动分析
   */
  private stopAutoAnalyze(): void {
    if (this.analyzeTimer) {
      clearInterval(this.analyzeTimer)
      this.analyzeTimer = undefined
    }
  }

  // ==================== 公共 API ====================

  /**
   * 开始记录
   */
  startRecording(): void {
    this.state.isRecording = true
  }

  /**
   * 停止记录
   */
  stopRecording(): void {
    this.state.isRecording = false
  }

  /**
   * 清除数据
   */
  clearData(): void {
    this.metrics.clear()
    this.state.totalRecords = 0
    this.state.currentReport = null
    this.navigationCount = 0
  }

  /**
   * 导出数据
   */
  exportData(): string {
    const data = {
      metrics: Array.from(this.metrics.entries()).map(([path, metrics]) => ({
        path,
        metrics,
      })),
      report: this.state.currentReport,
      config: this.config,
      timestamp: new Date().toISOString(),
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * 导入数据
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)

      // 恢复指标
      this.metrics.clear()
      data.metrics.forEach((item: any) => {
        this.metrics.set(item.path, item.metrics)
      })

      // 更新状态
      this.state.totalRecords = Array.from(this.metrics.values())
        .reduce((sum, metrics) => sum + metrics.length, 0)

      // 重新生成报告
      this.generateReport()

      return true
    }
    catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  /**
   * 获取路由性能历史
   */
  getRouteHistory(path: string): PerformanceMetric[] {
    return this.metrics.get(path) || []
  }

  /**
   * 获取实时指标
   */
  getRealTimeMetrics() {
    return { ...this.state.realTimeMetrics }
  }

  /**
   * 销毁分析器
   */
  destroy(): void {
    this.stopAutoAnalyze()
    this.clearData()
  }
}

// ==================== 导出便捷函数 ====================

let defaultAnalyzer: RoutePerformanceAnalyzer | null = null

/**
 * 设置性能分析器
 */
export function setupPerformanceAnalyzer(
  router: Router,
  config?: AnalyzerConfig,
): RoutePerformanceAnalyzer {
  if (!defaultAnalyzer) {
    defaultAnalyzer = new RoutePerformanceAnalyzer(router, config)
  }
  return defaultAnalyzer
}

/**
 * 获取性能分析器实例
 */
export function getPerformanceAnalyzer(): RoutePerformanceAnalyzer | null {
  return defaultAnalyzer
}

/**
 * 生成性能报告
 */
export function generatePerformanceReport(): PerformanceReport | null {
  if (!defaultAnalyzer) {
    console.error('Performance analyzer not initialized')
    return null
  }
  return defaultAnalyzer.generateReport()
}

/**
 * 获取性能建议
 */
export function getPerformanceSuggestions(): OptimizationSuggestion[] {
  const report = generatePerformanceReport()
  return report?.suggestions || []
}
