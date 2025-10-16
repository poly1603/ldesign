/**
 * @ldesign/router 路由分析工具
 *
 * 提供路由使用分析、性能监控和用户行为追踪
 */

import type { Router } from '../types'

/**
 * 路由访问记录
 */
export interface RouteVisit {
  path: string
  name?: string
  timestamp: number
  duration?: number
  referrer?: string
  userAgent: string
  sessionId: string
  userId?: string
  metadata?: Record<string, any>
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  navigationStart: number
  routeResolved: number
  componentLoaded: number
  renderComplete: number
  totalTime: number
  ttfb?: number // Time to First Byte
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
}

/**
 * 用户行为事件
 */
export interface UserBehaviorEvent {
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'custom'
  target: string
  route: string
  timestamp: number
  data?: Record<string, any>
}

/**
 * 分析配置
 */
export interface AnalyticsConfig {
  /** 是否启用分析 */
  enabled: boolean
  /** 采样率 (0-1) */
  sampleRate: number
  /** 是否收集性能数据 */
  collectPerformance: boolean
  /** 是否收集用户行为 */
  collectBehavior: boolean
  /** 数据上报端点 */
  endpoint?: string
  /** 批量上报大小 */
  batchSize: number
  /** 上报间隔 (ms) */
  reportInterval: number
  /** 本地存储键名 */
  storageKey: string
}

/**
 * 路由分析器
 */
export class RouteAnalytics {
  private router: Router
  private config: AnalyticsConfig
  private visits: RouteVisit[] = []
  private performanceData: Map<string, PerformanceMetrics> = new Map()
  private behaviorEvents: UserBehaviorEvent[] = []
  private sessionId: string
  private currentVisit?: RouteVisit
  private reportTimer?: ReturnType<typeof setInterval>

  constructor(router: Router, config: Partial<AnalyticsConfig> = {}) {
    this.router = router
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      collectPerformance: true,
      collectBehavior: false,
      batchSize: 10,
      reportInterval: 30000, // 30秒
      storageKey: 'ldesign-router-analytics',
      ...config,
    }

    this.sessionId = this.generateSessionId()

    if (this.config?.enabled && this.shouldSample()) {
      this.init()
    }
  }

  /**
   * 初始化分析器
   */
  private init(): void {
    this.setupRouteTracking()

    if (this.config?.collectPerformance) {
      this.setupPerformanceTracking()
    }

    if (this.config?.collectBehavior) {
      this.setupBehaviorTracking()
    }

    this.startReporting()
    this.loadStoredData()
  }

  /**
   * 设置路由追踪
   */
  private setupRouteTracking(): void {
    this.router.beforeEach((to, from) => {
      // 结束上一个访问记录
      if (this.currentVisit) {
        this.currentVisit.duration = Date.now() - this.currentVisit.timestamp
        this.visits.push(this.currentVisit)
      }

      // 开始新的访问记录
      this.currentVisit = {
        path: to.path,
        name: to.name as string,
        timestamp: Date.now(),
        referrer: from.path,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        metadata: {
          params: to.params,
          query: to.query,
          meta: to.meta,
        },
      }
    })

    this.router.afterEach((_to) => {
      if (this.currentVisit) {
        this.currentVisit.duration = Date.now() - this.currentVisit.timestamp
      }
    })
  }

  /**
   * 设置性能追踪
   */
  private setupPerformanceTracking(): void {
    this.router.beforeEach((to) => {
      const metrics: Partial<PerformanceMetrics> = {
        navigationStart: performance.now(),
      }

      // 监听性能事件
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            metrics.ttfb = navEntry.responseStart - navEntry.requestStart
          }
          else if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime
            }
          }
          else if (entry.entryType === 'largest-contentful-paint') {
            metrics.lcp = entry.startTime
          }
        }
      })

      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })

      // 存储到临时数据中
      ;(to as any)._performanceMetrics = metrics
    })

    this.router.afterEach((to) => {
      const metrics = (to as any)._performanceMetrics as Partial<PerformanceMetrics>
      if (metrics) {
        metrics.renderComplete = performance.now()
        metrics.totalTime = metrics.renderComplete - (metrics.navigationStart || 0)

        this.performanceData.set(to.path, metrics as PerformanceMetrics)
      }
    })
  }

  /**
   * 设置用户行为追踪
   */
  private setupBehaviorTracking(): void {
    // 点击事件
    document.addEventListener('click', (event) => {
      this.recordBehaviorEvent({
        type: 'click',
        target: this.getElementSelector(event.target as Element),
        route: this.router.currentRoute.value.path,
        timestamp: Date.now(),
        data: {
          x: event.clientX,
          y: event.clientY,
        },
      })
    })

    // 滚动事件（节流）
    let scrollTimer: ReturnType<typeof setTimeout>
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        this.recordBehaviorEvent({
          type: 'scroll',
          target: 'window',
          route: this.router.currentRoute.value.path,
          timestamp: Date.now(),
          data: {
            scrollY: window.scrollY,
            scrollX: window.scrollX,
          },
        })
      }, 100)
    })
  }

  /**
   * 记录用户行为事件
   */
  recordBehaviorEvent(event: UserBehaviorEvent): void {
    this.behaviorEvents.push(event)

    // 限制事件数量
    if (this.behaviorEvents.length > 1000) {
      this.behaviorEvents = this.behaviorEvents.slice(-500)
    }
  }

  /**
   * 获取元素选择器
   */
  private getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`
    }

    if (element.className) {
      return `.${element.className.split(' ')[0]}`
    }

    return element.tagName.toLowerCase()
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 判断是否应该采样
   */
  private shouldSample(): boolean {
    return Math.random() < this.config?.sampleRate
  }

  /**
   * 开始定期上报
   */
  private startReporting(): void {
    this.reportTimer = setInterval(() => {
      this.report()
    }, this.config?.reportInterval) as any
  }

  /**
   * 上报数据
   */
  async report(): Promise<void> {
    if (this.visits.length === 0 && this.behaviorEvents.length === 0) {
      return
    }

    const data = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      visits: this.visits.splice(0, this.config?.batchSize),
      performance: Object.fromEntries(this.performanceData),
      behavior: this.behaviorEvents.splice(0, this.config?.batchSize * 5),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    try {
      if (this.config?.endpoint) {
        await fetch(this.config?.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
      }
      else {
        // 存储到本地
        this.storeData(data)
      }
    }
    catch (error) {
      console.error('路由分析数据上报失败:', error)
      // 失败时重新加入队列
      this.visits.unshift(...data.visits)
      this.behaviorEvents.unshift(...data.behavior)
    }
  }

  /**
   * 存储数据到本地
   */
  private storeData(data: any): void {
    try {
      const stored = localStorage.getItem(this.config?.storageKey)
      const existing = stored ? JSON.parse(stored) : []
      existing.push(data)

      // 限制存储大小
      if (existing.length > 100) {
        existing.splice(0, existing.length - 100)
      }

      localStorage.setItem(this.config?.storageKey, JSON.stringify(existing))
    }
    catch (error) {
      console.error('路由分析数据存储失败:', error)
    }
  }

  /**
   * 加载存储的数据
   */
  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem(this.config?.storageKey)
      if (stored) {
        // const data = JSON.parse(stored)
        // 加载的路由分析数据
      }
    }
    catch (error) {
      console.error('加载路由分析数据失败:', error)
    }
  }

  /**
   * 获取分析报告
   */
  getReport() {
    const allVisits = [...this.visits]
    if (this.currentVisit) {
      allVisits.push({
        ...this.currentVisit,
        duration: Date.now() - this.currentVisit.timestamp,
      })
    }

    // 路由访问统计
    const routeStats = new Map<string, { count: number, totalTime: number, avgTime: number }>()

    for (const visit of allVisits) {
      const existing = routeStats.get(visit.path)
      if (existing) {
        existing.count++
        existing.totalTime += visit.duration || 0
        existing.avgTime = existing.totalTime / existing.count
      }
      else {
        routeStats.set(visit.path, {
          count: 1,
          totalTime: visit.duration || 0,
          avgTime: visit.duration || 0,
        })
      }
    }

    // 性能统计
    const performanceStats = {
      averageNavigationTime: 0,
      slowestRoute: '',
      fastestRoute: '',
      totalNavigations: allVisits.length,
    }

    if (this.performanceData.size > 0) {
      const times = Array.from(this.performanceData.values()).map(m => m.totalTime)
      performanceStats.averageNavigationTime = times.reduce((a, b) => a + b, 0) / times.length

      const sortedEntries = Array.from(this.performanceData.entries()).sort((a, b) => b[1].totalTime - a[1].totalTime)
      performanceStats.slowestRoute = sortedEntries[0]?.[0] || ''
      performanceStats.fastestRoute = sortedEntries[sortedEntries.length - 1]?.[0] || ''
    }

    return {
      sessionId: this.sessionId,
      totalVisits: allVisits.length,
      uniqueRoutes: routeStats.size,
      routeStats: Object.fromEntries(routeStats),
      performanceStats,
      behaviorEvents: this.behaviorEvents.length,
      topRoutes: Array.from(routeStats.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([path, stats]) => ({ path, ...stats })),
    }
  }

  /**
   * 清空数据
   */
  clear(): void {
    this.visits = []
    this.performanceData.clear()
    this.behaviorEvents = []
    this.currentVisit = undefined
    localStorage.removeItem(this.config?.storageKey)
  }

  /**
   * 销毁分析器
   */
  destroy(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
    }

    // 最后一次上报
    this.report()
  }
}

/**
 * 创建路由分析器
 */
export function createRouteAnalytics(router: Router, config?: Partial<AnalyticsConfig>): RouteAnalytics {
  return new RouteAnalytics(router, config)
}
