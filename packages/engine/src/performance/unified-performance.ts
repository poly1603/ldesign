/**
 * 统一的性能管理系统
 * 🚀 整合所有性能监控、分析和优化功能
 *
 * 合并了以下文件的功能：
 * - utils/performance-monitor.ts
 * - utils/performance-analyzer.ts
 * - utils/performance-optimizer.ts
 * - utils/realtime-performance-monitor.ts
 * - utils/core-web-vitals.ts
 */

import type { Engine } from '../types/engine'

// ============================================
// 类型定义
// ============================================

export interface PerformanceMetrics {
  // 核心 Web 指标
  FCP?: number // First Contentful Paint
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
  TTI?: number // Time to Interactive

  // 性能指标
  fps: number
  memory: {
    used: number
    limit: number
    percent: number
  }

  // 网络指标
  network: {
    requests: number
    totalSize: number
    avgLatency: number
    failedRequests: number
  }

  // 组件指标
  components: {
    totalRenders: number
    avgRenderTime: number
    slowComponents: Array<{
      name: string
      renderTime: number
      count: number
    }>
  }

  // 自定义指标
  custom: Map<string, number>
}

export interface PerformanceConfig {
  enabled?: boolean
  sampleRate?: number
  bufferSize?: number
  reportingInterval?: number
  thresholds?: {
    fps?: number
    memory?: number
    renderTime?: number
    networkLatency?: number
  }
  webVitals?: boolean
  realtime?: boolean
}

export interface PerformanceMark {
  name: string
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface PerformanceMeasure {
  name: string
  startTime: number
  duration: number
  metadata?: Record<string, unknown>
}

// ============================================
// 统一性能管理器
// ============================================

export class UnifiedPerformanceManager {
  private config: Required<PerformanceConfig>
  private metrics: PerformanceMetrics
  private marks = new Map<string, PerformanceMark>()
  private measures = new Map<string, PerformanceMeasure[]>()
  private observers = new Map<string, PerformanceObserver>()
  private rafId?: number
  private frameCount = 0
  private lastFrameTime = 0
  private fpsHistory: number[] = []
  private reportTimer?: NodeJS.Timeout

  constructor(
    private engine?: Engine,
    config: PerformanceConfig = {}
  ) {
    this.config = this.normalizeConfig(config)
    this.metrics = this.initMetrics()

    if (this.config.enabled) {
      this.initialize()
    }
  }

  /**
   * 标准化配置
   */
  private normalizeConfig(config: PerformanceConfig): Required<PerformanceConfig> {
    return {
      enabled: config.enabled ?? true,
      sampleRate: config.sampleRate ?? 1,
      bufferSize: config.bufferSize ?? 100,
      reportingInterval: config.reportingInterval ?? 5000,
      thresholds: {
        fps: config.thresholds?.fps ?? 30,
        memory: config.thresholds?.memory ?? 0.9,
        renderTime: config.thresholds?.renderTime ?? 16,
        networkLatency: config.thresholds?.networkLatency ?? 1000
      },
      webVitals: config.webVitals ?? true,
      realtime: config.realtime ?? true
    }
  }

  /**
   * 初始化指标
   */
  private initMetrics(): PerformanceMetrics {
    return {
      fps: 0,
      memory: {
        used: 0,
        limit: 0,
        percent: 0
      },
      network: {
        requests: 0,
        totalSize: 0,
        avgLatency: 0,
        failedRequests: 0
      },
      components: {
        totalRenders: 0,
        avgRenderTime: 0,
        slowComponents: []
      },
      custom: new Map()
    }
  }

  /**
   * 初始化性能监控
   */
  private initialize(): void {
    // 启动 FPS 监控
    if (this.config.realtime) {
      this.startFPSMonitoring()
    }

    // 启动内存监控
    this.startMemoryMonitoring()

    // 启动 Web Vitals 监控
    if (this.config.webVitals) {
      this.observeWebVitals()
    }

    // 启动网络监控
    this.observeNetwork()

    // 启动定期报告
    if (this.config.reportingInterval > 0) {
      this.startReporting()
    }

    this.engine?.logger?.info('Unified Performance Manager initialized')
  }

  // ============================================
  // 核心功能
  // ============================================

  /**
   * 标记性能点
   */
  mark(name: string, metadata?: Record<string, unknown>): void {
    const mark: PerformanceMark = {
      name,
      timestamp: performance.now(),
      metadata
    }

    this.marks.set(name, mark)

    // 使用原生 Performance API
    if (performance.mark) {
      performance.mark(name)
    }
  }

  /**
   * 测量性能
   */
  measure(name: string, startMark: string, endMark?: string): PerformanceMeasure | null {
    const start = this.marks.get(startMark)
    if (!start) return null

    const end = endMark ? this.marks.get(endMark) : { timestamp: performance.now() }
    if (!end) return null

    const measure: PerformanceMeasure = {
      name,
      startTime: start.timestamp,
      duration: end.timestamp - start.timestamp,
      metadata: { ...start.metadata, ...end.metadata }
    }

    // 保存测量结果
    if (!this.measures.has(name)) {
      this.measures.set(name, [])
    }
    this.measures.get(name)!.push(measure)

    // 限制缓冲区大小
    const buffer = this.measures.get(name)!
    if (buffer.length > this.config.bufferSize) {
      buffer.shift()
    }

    // 使用原生 Performance API
    if (performance.measure) {
      try {
        performance.measure(name, startMark, endMark)
      } catch {
        // 忽略错误
      }
    }

    return measure
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 获取特定测量的统计信息
   */
  getMeasureStats(name: string): {
    count: number
    avg: number
    min: number
    max: number
    total: number
  } | null {
    const measures = this.measures.get(name)
    if (!measures || measures.length === 0) return null

    const durations = measures.map(m => m.duration)
    const total = durations.reduce((a, b) => a + b, 0)

    return {
      count: measures.length,
      avg: total / measures.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      total
    }
  }

  // ============================================
  // FPS 监控
  // ============================================

  /**
   * 启动 FPS 监控
   */
  private startFPSMonitoring(): void {
    const measureFPS = (currentTime: number) => {
      if (this.lastFrameTime) {
        const delta = currentTime - this.lastFrameTime
        const fps = 1000 / delta

        this.fpsHistory.push(fps)
        if (this.fpsHistory.length > this.config.bufferSize) {
          this.fpsHistory.shift()
        }

        // 计算平均 FPS
        this.metrics.fps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length

        // 检查性能问题
        if (this.metrics.fps < this.config.thresholds.fps!) {
          this.handlePerformanceIssue('low-fps', {
            current: this.metrics.fps,
            threshold: this.config.thresholds.fps
          })
        }
      }

      this.lastFrameTime = currentTime
      this.frameCount++

      this.rafId = requestAnimationFrame(measureFPS)
    }

    this.rafId = requestAnimationFrame(measureFPS)
  }

  // ============================================
  // 内存监控
  // ============================================

  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    if (!('memory' in performance)) return

    const checkMemory = () => {
      const memory = (performance as any).memory

      this.metrics.memory = {
        used: memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }

      // 检查内存问题
      if (this.metrics.memory.percent > this.config.thresholds.memory! * 100) {
        this.handlePerformanceIssue('high-memory', {
          percent: this.metrics.memory.percent,
          threshold: this.config.thresholds.memory! * 100
        })
      }
    }

    // 定期检查内存
    setInterval(checkMemory, 1000)
    checkMemory()
  }

  // ============================================
  // Web Vitals 监控
  // ============================================

  /**
   * 监控 Web Vitals
   */
  private observeWebVitals(): void {
    // FCP - First Contentful Paint
    this.observePaintTiming('first-contentful-paint', (value) => {
      this.metrics.FCP = value
    })

    // LCP - Largest Contentful Paint
    this.observeLCP()

    // FID - First Input Delay
    this.observeFID()

    // CLS - Cumulative Layout Shift
    this.observeCLS()

    // TTFB - Time to First Byte
    this.observeTTFB()
  }

  /**
   * 监控绘制时间
   */
  private observePaintTiming(name: string, callback: (value: number) => void): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === name) {
            callback(entry.startTime)
          }
        }
      })

      observer.observe({ entryTypes: ['paint'] })
      this.observers.set(name, observer)
    } catch {
      // 忽略错误
    }
  }

  /**
   * 监控 LCP
   */
  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          this.metrics.LCP = lastEntry.startTime
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.set('lcp', observer)
    } catch {
      // 忽略错误
    }
  }

  /**
   * 监控 FID
   */
  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-input') {
            this.metrics.FID = entry.processingStart - entry.startTime
          }
        }
      })

      observer.observe({ entryTypes: ['first-input'] })
      this.observers.set('fid', observer)
    } catch {
      // 忽略错误
    }
  }

  /**
   * 监控 CLS
   */
  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return

    let clsValue = 0
    const clsEntries: any[] = []

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsEntries.push(entry)
            clsValue += (entry as any).value
          }
        }
        this.metrics.CLS = clsValue
      })

      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.set('cls', observer)
    } catch {
      // 忽略错误
    }
  }

  /**
   * 监控 TTFB
   */
  private observeTTFB(): void {
    if (!('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.metrics.TTFB = entry.responseStart - entry.requestStart
          }
        }
      })

      observer.observe({ entryTypes: ['navigation'] })
      this.observers.set('ttfb', observer)
    } catch {
      // 忽略错误
    }
  }

  // ============================================
  // 网络监控
  // ============================================

  /**
   * 监控网络请求
   */
  private observeNetwork(): void {
    if (!('PerformanceObserver' in window)) return

    const networkRequests: any[] = []

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            networkRequests.push(entry)

            // 更新网络指标
            this.metrics.network.requests = networkRequests.length
            this.metrics.network.totalSize += entry.encodedBodySize || 0

            const durations = networkRequests.map(r => r.duration)
            this.metrics.network.avgLatency = durations.reduce((a, b) => a + b, 0) / durations.length

            // 检查慢请求
            if (entry.duration > this.config.thresholds.networkLatency!) {
              this.handlePerformanceIssue('slow-network', {
                url: entry.name,
                duration: entry.duration,
                threshold: this.config.thresholds.networkLatency
              })
            }
          }
        }
      })

      observer.observe({ entryTypes: ['resource'] })
      this.observers.set('network', observer)
    } catch {
      // 忽略错误
    }
  }

  // ============================================
  // 组件性能监控
  // ============================================

  /**
   * 记录组件渲染
   */
  recordComponentRender(name: string, duration: number): void {
    this.metrics.components.totalRenders++

    // 更新平均渲染时间
    const total = this.metrics.components.avgRenderTime * (this.metrics.components.totalRenders - 1)
    this.metrics.components.avgRenderTime = (total + duration) / this.metrics.components.totalRenders

    // 记录慢组件
    if (duration > this.config.thresholds.renderTime!) {
      const existing = this.metrics.components.slowComponents.find(c => c.name === name)
      if (existing) {
        existing.count++
        existing.renderTime = (existing.renderTime * (existing.count - 1) + duration) / existing.count
      } else {
        this.metrics.components.slowComponents.push({
          name,
          renderTime: duration,
          count: 1
        })
      }

      // 保持列表大小
      if (this.metrics.components.slowComponents.length > 10) {
        this.metrics.components.slowComponents.sort((a, b) => b.renderTime - a.renderTime)
        this.metrics.components.slowComponents = this.metrics.components.slowComponents.slice(0, 10)
      }
    }
  }

  // ============================================
  // 性能优化
  // ============================================

  /**
   * 批处理优化
   */
  createBatchProcessor<T>(config: {
    batchSize: number
    interval: number
    processor: (items: T[]) => Promise<void>
  }): {
    add: (item: T) => void
    flush: () => Promise<void>
    destroy: () => void
  } {
    const queue: T[] = []
    let timer: NodeJS.Timeout | undefined

    const process = async () => {
      if (queue.length === 0) return

      const items = queue.splice(0, config.batchSize)
      await config.processor(items)

      if (queue.length > 0) {
        timer = setTimeout(process, 0)
      }
    }

    return {
      add: (item: T) => {
        queue.push(item)

        if (queue.length >= config.batchSize) {
          process()
        } else if (!timer) {
          timer = setTimeout(process, config.interval)
        }
      },
      flush: async () => {
        if (timer) {
          clearTimeout(timer)
          timer = undefined
        }
        await process()
      },
      destroy: () => {
        if (timer) {
          clearTimeout(timer)
          timer = undefined
        }
        queue.length = 0
      }
    }
  }

  /**
   * 节流函数
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    let timeout: NodeJS.Timeout | undefined
    let lastTime = 0

    return (...args: Parameters<T>) => {
      const now = Date.now()
      const remaining = wait - (now - lastTime)

      if (remaining <= 0) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = undefined
        }
        lastTime = now
        return func.apply(null, args)
      } else if (!timeout) {
        timeout = setTimeout(() => {
          lastTime = Date.now()
          timeout = undefined
          func.apply(null, args)
        }, remaining)
      }
    }
  }

  /**
   * 防抖函数
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | undefined

    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(null, args), wait)
    }
  }

  // ============================================
  // 报告和分析
  // ============================================

  /**
   * 启动定期报告
   */
  private startReporting(): void {
    this.reportTimer = setInterval(() => {
      this.generateReport()
    }, this.config.reportingInterval)
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      metrics: this.getMetrics(),
      measures: {},
      issues: [],
      recommendations: []
    }

    // 添加测量统计
    for (const [name, measures] of this.measures) {
      const stats = this.getMeasureStats(name)
      if (stats) {
        report.measures[name] = stats
      }
    }

    // 分析性能问题
    this.analyzePerformance(report)

    // 生成建议
    this.generateRecommendations(report)

    // 触发报告事件
    this.engine?.events?.emit('performance:report', report)

    return report
  }

  /**
   * 分析性能问题
   */
  private analyzePerformance(report: PerformanceReport): void {
    // FPS 问题
    if (this.metrics.fps < this.config.thresholds.fps!) {
      report.issues.push({
        type: 'low-fps',
        severity: 'high',
        message: `FPS (${this.metrics.fps.toFixed(1)}) is below threshold (${this.config.thresholds.fps})`
      })
    }

    // 内存问题
    if (this.metrics.memory.percent > this.config.thresholds.memory! * 100) {
      report.issues.push({
        type: 'high-memory',
        severity: 'medium',
        message: `Memory usage (${this.metrics.memory.percent.toFixed(1)}%) is above threshold`
      })
    }

    // Web Vitals 问题
    if (this.metrics.LCP && this.metrics.LCP > 2500) {
      report.issues.push({
        type: 'poor-lcp',
        severity: 'high',
        message: `LCP (${this.metrics.LCP.toFixed(0)}ms) is in the poor range (>2500ms)`
      })
    }

    if (this.metrics.FID && this.metrics.FID > 100) {
      report.issues.push({
        type: 'poor-fid',
        severity: 'medium',
        message: `FID (${this.metrics.FID.toFixed(0)}ms) needs improvement (>100ms)`
      })
    }

    if (this.metrics.CLS && this.metrics.CLS > 0.1) {
      report.issues.push({
        type: 'poor-cls',
        severity: 'medium',
        message: `CLS (${this.metrics.CLS.toFixed(3)}) needs improvement (>0.1)`
      })
    }
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(report: PerformanceReport): void {
    for (const issue of report.issues) {
      switch (issue.type) {
        case 'low-fps':
          report.recommendations.push(
            'Reduce JavaScript execution time',
            'Use requestAnimationFrame for animations',
            'Implement virtual scrolling for long lists'
          )
          break
        case 'high-memory':
          report.recommendations.push(
            'Clear unused references',
            'Implement object pooling',
            'Use WeakMap/WeakSet for caches'
          )
          break
        case 'poor-lcp':
          report.recommendations.push(
            'Optimize critical rendering path',
            'Preload important resources',
            'Reduce server response time'
          )
          break
        case 'poor-fid':
          report.recommendations.push(
            'Break up long tasks',
            'Use web workers for heavy computations',
            'Implement progressive enhancement'
          )
          break
        case 'poor-cls':
          report.recommendations.push(
            'Set explicit dimensions for images/videos',
            'Avoid inserting content above existing content',
            'Use transform animations instead of layout properties'
          )
          break
      }
    }
  }

  /**
   * 处理性能问题
   */
  private handlePerformanceIssue(type: string, data: any): void {
    this.engine?.logger?.warn(`Performance issue detected: ${type}`, data)
    this.engine?.events?.emit('performance:issue', { type, data })
  }

  // ============================================
  // 清理
  // ============================================

  /**
   * 销毁性能管理器
   */
  destroy(): void {
    // 停止 FPS 监控
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = undefined
    }

    // 停止报告
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = undefined
    }

    // 断开所有观察者
    for (const observer of this.observers.values()) {
      observer.disconnect()
    }
    this.observers.clear()

    // 清理数据
    this.marks.clear()
    this.measures.clear()
    this.fpsHistory.length = 0
  }
}

// ============================================
// 类型定义
// ============================================

export interface PerformanceReport {
  timestamp: number
  metrics: PerformanceMetrics
  measures: Record<string, any>
  issues: PerformanceIssue[]
  recommendations: string[]
}

export interface PerformanceIssue {
  type: string
  severity: 'low' | 'medium' | 'high'
  message: string
}

// ============================================
// 导出
// ============================================

export function createUnifiedPerformanceManager(
  engine?: Engine,
  config?: PerformanceConfig
): UnifiedPerformanceManager {
  return new UnifiedPerformanceManager(engine, config)
}

// 向后兼容
export { UnifiedPerformanceManager as PerformanceManager }
export { createUnifiedPerformanceManager as createPerformanceManager }
