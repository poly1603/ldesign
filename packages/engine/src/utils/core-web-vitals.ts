/**
 * Core Web Vitals 监控器
 * 监控 LCP, FCP, CLS, FID, TTFB 等关键性能指标
 */

// 布局偏移归因接口
interface LayoutShiftAttribution {
  node?: Node
  previousRect?: DOMRectReadOnly
  currentRect?: DOMRectReadOnly
}

// Core Web Vitals 指标类型
export interface CoreWebVitalsMetrics {
  // Largest Contentful Paint - 最大内容绘制
  lcp?: {
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    timestamp: number
    element?: Element
  }

  // First Contentful Paint - 首次内容绘制
  fcp?: {
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    timestamp: number
  }

  // Cumulative Layout Shift - 累积布局偏移
  cls?: {
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    timestamp: number
    sources: LayoutShiftAttribution[]
  }

  // First Input Delay - 首次输入延迟
  fid?: {
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    timestamp: number
    eventType: string
  }

  // Time to First Byte - 首字节时间
  ttfb?: {
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    timestamp: number
  }

  // Interaction to Next Paint - 交互到下次绘制
  inp?: {
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    timestamp: number
    eventType: string
  }
}

// 性能评级阈值
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fcp: { good: 1800, poor: 3000 },
  cls: { good: 0.1, poor: 0.25 },
  fid: { good: 100, poor: 300 },
  ttfb: { good: 800, poor: 1800 },
  inp: { good: 200, poor: 500 }
} as const

// 获取性能评级
function getRating(value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// Core Web Vitals 监控器类
export class CoreWebVitalsMonitor {
  private metrics: CoreWebVitalsMetrics = {}
  private observers: PerformanceObserver[] = []
  private callbacks: Array<(metrics: CoreWebVitalsMetrics) => void> = []
  private isMonitoring = false

  /**
   * 开始监控 Core Web Vitals
   */
  start(): void {
    if (this.isMonitoring || typeof PerformanceObserver === 'undefined') {
      return
    }

    this.isMonitoring = true

    // 监控 LCP
    this.observeLCP()

    // 监控 FCP
    this.observeFCP()

    // 监控 CLS
    this.observeCLS()

    // 监控 FID
    this.observeFID()

    // 监控 TTFB
    this.observeTTFB()

    // 监控 INP (如果支持)
    this.observeINP()
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.isMonitoring = false
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  /**
   * 添加指标回调
   */
  onMetric(callback: (metrics: CoreWebVitalsMetrics) => void): void {
    this.callbacks.push(callback)
  }

  /**
   * 获取当前指标
   */
  getMetrics(): CoreWebVitalsMetrics {
    return { ...this.metrics }
  }

  /**
   * 监控 LCP (Largest Contentful Paint)
   */
  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          element?: Element
        }

        if (lastEntry) {
          const value = lastEntry.startTime
          this.metrics.lcp = {
            value,
            rating: getRating(value, THRESHOLDS.lcp),
            timestamp: Date.now(),
            element: lastEntry.element
          }
          this.notifyCallbacks()
        }
      })

      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('LCP monitoring not supported:', error)
    }
  }

  /**
   * 监控 FCP (First Contentful Paint)
   */
  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')

        if (fcpEntry) {
          const value = fcpEntry.startTime
          this.metrics.fcp = {
            value,
            rating: getRating(value, THRESHOLDS.fcp),
            timestamp: Date.now()
          }
          this.notifyCallbacks()
        }
      })

      observer.observe({ type: 'paint', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FCP monitoring not supported:', error)
    }
  }

  /**
   * 监控 CLS (Cumulative Layout Shift)
   */
  private observeCLS(): void {
    try {
      let clsValue = 0
      let sessionValue = 0
      let sessionEntries: PerformanceEntry[] = []

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as (PerformanceEntry & {
          value: number
          sources: LayoutShiftAttribution[]
          hadRecentInput?: boolean
        })[]

        for (const entry of entries) {
          // 只计算非用户输入引起的布局偏移
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0]
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

            // 如果条目与当前会话相距超过1秒，或者与第一个条目相距超过5秒，则开始新会话
            if (sessionValue &&
              (entry.startTime - lastSessionEntry.startTime > 1000 ||
                entry.startTime - firstSessionEntry.startTime > 5000)) {
              clsValue = Math.max(clsValue, sessionValue)
              sessionValue = 0
              sessionEntries = []
            }

            sessionValue += entry.value
            sessionEntries.push(entry)
            clsValue = Math.max(clsValue, sessionValue)

            this.metrics.cls = {
              value: clsValue,
              rating: getRating(clsValue, THRESHOLDS.cls),
              timestamp: Date.now(),
              sources: entry.sources || []
            }
            this.notifyCallbacks()
          }
        }
      })

      observer.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('CLS monitoring not supported:', error)
    }
  }

  /**
   * 监控 FID (First Input Delay)
   */
  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as (PerformanceEntry & {
          processingStart: number
          eventType: string
        })[]

        for (const entry of entries) {
          const value = entry.processingStart - entry.startTime
          this.metrics.fid = {
            value,
            rating: getRating(value, THRESHOLDS.fid),
            timestamp: Date.now(),
            eventType: entry.eventType
          }
          this.notifyCallbacks()
        }
      })

      observer.observe({ type: 'first-input', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FID monitoring not supported:', error)
    }
  }

  /**
   * 监控 TTFB (Time to First Byte)
   */
  private observeTTFB(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const navigationEntry = entries[0] as PerformanceNavigationTiming

        if (navigationEntry) {
          const value = navigationEntry.responseStart - navigationEntry.requestStart
          this.metrics.ttfb = {
            value,
            rating: getRating(value, THRESHOLDS.ttfb),
            timestamp: Date.now()
          }
          this.notifyCallbacks()
        }
      })

      observer.observe({ type: 'navigation', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('TTFB monitoring not supported:', error)
    }
  }

  /**
   * 监控 INP (Interaction to Next Paint) - 实验性功能
   */
  private observeINP(): void {
    try {
      // INP 是一个较新的指标，可能不被所有浏览器支持
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as (PerformanceEntry & {
          processingStart: number
          processingEnd: number
          eventType: string
        })[]

        for (const entry of entries) {
          const value = entry.processingEnd - entry.startTime
          this.metrics.inp = {
            value,
            rating: getRating(value, THRESHOLDS.inp),
            timestamp: Date.now(),
            eventType: entry.eventType
          }
          this.notifyCallbacks()
        }
      })

      // 尝试观察事件时序
      observer.observe({ type: 'event', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      // INP 监控失败是正常的，因为它是实验性功能
      console.debug('INP monitoring not supported:', error)
    }
  }

  /**
   * 通知所有回调
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.getMetrics())
      } catch (error) {
        console.error('Error in Core Web Vitals callback:', error)
      }
    })
  }

  /**
   * 获取性能分数 (0-100)
   */
  getPerformanceScore(): number {
    const metrics = this.getMetrics()
    let score = 100

    // 根据各项指标计算分数
    if (metrics.lcp) {
      if (metrics.lcp.rating === 'poor') score -= 25
      else if (metrics.lcp.rating === 'needs-improvement') score -= 10
    }

    if (metrics.fcp) {
      if (metrics.fcp.rating === 'poor') score -= 20
      else if (metrics.fcp.rating === 'needs-improvement') score -= 8
    }

    if (metrics.cls) {
      if (metrics.cls.rating === 'poor') score -= 25
      else if (metrics.cls.rating === 'needs-improvement') score -= 10
    }

    if (metrics.fid) {
      if (metrics.fid.rating === 'poor') score -= 20
      else if (metrics.fid.rating === 'needs-improvement') score -= 8
    }

    if (metrics.ttfb) {
      if (metrics.ttfb.rating === 'poor') score -= 10
      else if (metrics.ttfb.rating === 'needs-improvement') score -= 5
    }

    return Math.max(0, score)
  }
}

// 全局 Core Web Vitals 监控器实例
export const globalCoreWebVitalsMonitor = new CoreWebVitalsMonitor()

// 便捷函数
export function startCoreWebVitalsMonitoring(callback?: (metrics: CoreWebVitalsMetrics) => void): void {
  if (callback) {
    globalCoreWebVitalsMonitor.onMetric(callback)
  }
  globalCoreWebVitalsMonitor.start()
}

export function getCoreWebVitals(): CoreWebVitalsMetrics {
  return globalCoreWebVitalsMonitor.getMetrics()
}

export function getCoreWebVitalsScore(): number {
  return globalCoreWebVitalsMonitor.getPerformanceScore()
}
