/**
 * 性能监控工具
 * 用于跟踪和报告关键性能指标
 */

// Web Vitals 指标
export interface WebVitals {
  LCP?: number  // Largest Contentful Paint
  FID?: number  // First Input Delay
  CLS?: number  // Cumulative Layout Shift
  FCP?: number  // First Contentful Paint
  TTFB?: number // Time to First Byte
}

// 性能指标收集器
class PerformanceMonitor {
  private metrics: WebVitals = {}
  private reported = false

  constructor() {
    if (typeof window === 'undefined') return
    this.observePerformance()
  }

  private observePerformance() {
    // 监听 FCP
    this.observePaint()

    // 监听 LCP
    this.observeLCP()

    // 监听 CLS
    this.observeCLS()

    // 监听 FID
    this.observeFID()

    // 页面加载完成后报告
    if (document.readyState === 'complete') {
      this.report()
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.report(), 0)
      })
    }
  }

  private observePaint() {
    try {
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = entry.startTime
        }
      })
    } catch (e) {
      // Ignore errors
    }
  }

  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.LCP = lastEntry.startTime
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // Ignore errors
    }
  }

  private observeCLS() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            this.metrics.CLS = clsValue
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      // Ignore errors
    }
  }

  private observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0]
        this.metrics.FID = (firstInput as any).processingStart - firstInput.startTime
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      // Ignore errors
    }
  }

  private report() {
    if (this.reported) return
    this.reported = true

    // 获取 Navigation Timing 数据
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navTiming) {
      this.metrics.TTFB = navTiming.responseStart - navTiming.requestStart
    }

    // 只在开发环境输出
    if (import.meta.env.DEV) {
      console.log('📊 Performance Metrics:', {
        ...this.metrics,
        'DOM Content Loaded': navTiming ? Math.round(navTiming.domContentLoadedEventEnd - navTiming.fetchStart) : 0,
        'Load Complete': navTiming ? Math.round(navTiming.loadEventEnd - navTiming.fetchStart) : 0
      })
    }

    // 在生产环境可以发送到分析服务
    // if (import.meta.env.PROD) {
    //   sendToAnalytics(this.metrics)
    // }
  }

  getMetrics(): WebVitals {
    return { ...this.metrics }
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor()

// 简化的性能标记工具
export function markPerformance(name: string) {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name)
  }
}

export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0]
      if (import.meta.env.DEV) {
        console.log(`⏱️ ${name}: ${Math.round(measure.duration)}ms`)
      }
    } catch (e) {
      // Ignore errors
    }
  }
}












