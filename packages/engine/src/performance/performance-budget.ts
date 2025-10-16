/**
 * 性能预算管理器
 * 监控和管理应用性能预算
 */

export interface PerformanceBudget {
  /** 包体积限制（字节） */
  bundleSize?: number
  /** 初始加载时间限制（毫秒） */
  initialLoadTime?: number
  /** 内存使用限制（字节） */
  memoryUsage?: number
  /** FPS 最低限制 */
  minFps?: number
  /** DOM 节点数量限制 */
  domNodes?: number
  /** 网络请求数量限制 */
  networkRequests?: number
  /** 网络请求总大小限制（字节） */
  networkSize?: number
}

export interface PerformanceMetric {
  name: string
  value: number
  limit: number
  unit: string
  exceeded: boolean
  percentage: number
}

export type BudgetExceededCallback = (metric: PerformanceMetric) => void

export class PerformanceBudgetManager {
  private budget: PerformanceBudget
  private onExceeded?: BudgetExceededCallback
  private metrics: Map<string, PerformanceMetric> = new Map()
  private monitoring = false
  private observer?: PerformanceObserver
  private animationFrameId?: number

  constructor(budget: PerformanceBudget, onExceeded?: BudgetExceededCallback) {
    this.budget = budget
    this.onExceeded = onExceeded
    this.initializeMetrics()
  }

  /**
   * 初始化指标
   */
  private initializeMetrics(): void {
    if (this.budget.bundleSize) {
      this.metrics.set('bundleSize', {
        name: 'Bundle Size',
        value: 0,
        limit: this.budget.bundleSize,
        unit: 'bytes',
        exceeded: false,
        percentage: 0
      })
    }

    if (this.budget.initialLoadTime) {
      this.metrics.set('initialLoadTime', {
        name: 'Initial Load Time',
        value: 0,
        limit: this.budget.initialLoadTime,
        unit: 'ms',
        exceeded: false,
        percentage: 0
      })
    }

    if (this.budget.memoryUsage) {
      this.metrics.set('memoryUsage', {
        name: 'Memory Usage',
        value: 0,
        limit: this.budget.memoryUsage,
        unit: 'bytes',
        exceeded: false,
        percentage: 0
      })
    }

    if (this.budget.minFps) {
      this.metrics.set('fps', {
        name: 'FPS',
        value: 60,
        limit: this.budget.minFps,
        unit: 'fps',
        exceeded: false,
        percentage: 100
      })
    }

    if (this.budget.domNodes) {
      this.metrics.set('domNodes', {
        name: 'DOM Nodes',
        value: 0,
        limit: this.budget.domNodes,
        unit: 'nodes',
        exceeded: false,
        percentage: 0
      })
    }

    if (this.budget.networkRequests) {
      this.metrics.set('networkRequests', {
        name: 'Network Requests',
        value: 0,
        limit: this.budget.networkRequests,
        unit: 'requests',
        exceeded: false,
        percentage: 0
      })
    }

    if (this.budget.networkSize) {
      this.metrics.set('networkSize', {
        name: 'Network Size',
        value: 0,
        limit: this.budget.networkSize,
        unit: 'bytes',
        exceeded: false,
        percentage: 0
      })
    }
  }

  /**
   * 开始监控
   */
  startMonitoring(): void {
    if (this.monitoring) return
    this.monitoring = true

    // 监控页面加载性能
    this.monitorLoadPerformance()

    // 监控内存使用
    this.monitorMemory()

    // 监控 FPS
    this.monitorFPS()

    // 监控 DOM 节点
    this.monitorDOMNodes()

    // 监控网络请求
    this.monitorNetwork()
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    this.monitoring = false

    if (this.observer) {
      this.observer.disconnect()
      this.observer = undefined
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = undefined
    }
  }

  /**
   * 监控加载性能
   */
  private monitorLoadPerformance(): void {
    if (typeof window === 'undefined') return

    // 使用 Navigation Timing API
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart

      if (loadTime > 0 && this.metrics.has('initialLoadTime')) {
        this.updateMetric('initialLoadTime', loadTime)
      }
    }

    // 监控资源加载
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource')
      let totalSize = 0

      resources.forEach(resource => {
        if ('transferSize' in resource) {
          totalSize += (resource as unknown as { transferSize: number }).transferSize
        }
      })

      if (this.metrics.has('bundleSize')) {
        this.updateMetric('bundleSize', totalSize)
      }
    }
  }

  /**
   * 监控内存使用
   */
  private monitorMemory(): void {
    if (typeof window === 'undefined') return

    // 检查是否支持 memory API
    if ('memory' in performance) {
      const checkMemory = () => {
        if (!this.monitoring) return

        const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
        if (memory && this.metrics.has('memoryUsage')) {
          this.updateMetric('memoryUsage', memory.usedJSHeapSize)
        }

        // 每秒检查一次
        setTimeout(() => checkMemory(), 1000)
      }

      checkMemory()
    }
  }

  /**
   * 监控 FPS
   */
  private monitorFPS(): void {
    if (typeof window === 'undefined') return

    let lastTime = performance.now()
    let frameCount = 0
    let fps = 60

    const measureFPS = () => {
      if (!this.monitoring) return

      const currentTime = performance.now()
      frameCount++

      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        frameCount = 0
        lastTime = currentTime

        if (this.metrics.has('fps')) {
          const metric = this.metrics.get('fps')
          if (metric) {
            metric.value = fps
            metric.exceeded = fps < metric.limit
            metric.percentage = (fps / 60) * 100

            if (metric.exceeded && this.onExceeded) {
              this.onExceeded(metric)
            }
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(measureFPS)
    }

    measureFPS()
  }

  /**
   * 监控 DOM 节点数量
   */
  private monitorDOMNodes(): void {
    if (typeof window === 'undefined') return

    const checkDOMNodes = () => {
      if (!this.monitoring) return

      const nodeCount = document.getElementsByTagName('*').length

      if (this.metrics.has('domNodes')) {
        this.updateMetric('domNodes', nodeCount)
      }

      // 每秒检查一次
      setTimeout(() => checkDOMNodes(), 1000)
    }

    checkDOMNodes()
  }

  /**
   * 监控网络请求
   */
  private monitorNetwork(): void {
    if (typeof window === 'undefined') return

    let requestCount = 0
    let totalSize = 0

    // 使用 PerformanceObserver 监控网络请求
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            requestCount++

            if ('transferSize' in entry) {
              totalSize += (entry as unknown as { transferSize: number }).transferSize
            }

            if (this.metrics.has('networkRequests')) {
              this.updateMetric('networkRequests', requestCount)
            }

            if (this.metrics.has('networkSize')) {
              this.updateMetric('networkSize', totalSize)
            }
          }
        }
      })

      this.observer.observe({ entryTypes: ['resource'] })
    }
  }

  /**
   * 更新指标
   */
  private updateMetric(name: string, value: number): void {
    const metric = this.metrics.get(name)
    if (!metric) return

    metric.value = value
    metric.percentage = (value / metric.limit) * 100

    const wasExceeded = metric.exceeded
    metric.exceeded = metric.name === 'FPS'
      ? value < metric.limit
      : value > metric.limit

    // 如果首次超出预算，触发回调
    if (!wasExceeded && metric.exceeded && this.onExceeded) {
      this.onExceeded(metric)
    }
  }

  /**
   * 手动检查特定指标
   */
  checkMetric(name: string, value: number): PerformanceMetric | null {
    if (!this.metrics.has(name)) return null

    this.updateMetric(name, value)
    return this.metrics.get(name) || null
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * 获取超出预算的指标
   */
  getExceededMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.exceeded)
  }

  /**
   * 获取性能报告
   */
  getReport(): {
    passed: boolean
    metrics: PerformanceMetric[]
    exceeded: PerformanceMetric[]
    summary: string
  } {
    const metrics = this.getAllMetrics()
    const exceeded = this.getExceededMetrics()
    const passed = exceeded.length === 0

    const summary = passed
      ? '✅ 所有性能指标都在预算范围内'
      : `⚠️ ${exceeded.length} 个性能指标超出预算: ${exceeded.map(m => m.name).join(', ')}`

    return {
      passed,
      metrics,
      exceeded,
      summary
    }
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.stopMonitoring()
    this.metrics.clear()
    this.initializeMetrics()
  }

  /**
   * 更新预算
   */
  updateBudget(budget: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...budget }
    this.reset()
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopMonitoring()
    this.metrics.clear()
  }
}
