/**
 * 性能监控器
 * 
 * 监控应用性能指标，包括内存使用、CPU使用、渲染性能、网络性能等
 */

import { EventEmitter } from 'events'
import type {
  IPerformanceMonitor,
  PerformanceMetrics,
  PerformanceMonitorConfig,
  PerformanceReport,
  PerformanceIssue
} from './types'

/**
 * 性能监控器实现
 */
export class PerformanceMonitor extends EventEmitter implements IPerformanceMonitor {
  private config: PerformanceMonitorConfig
  private isMonitoring: boolean = false
  private metricsHistory: PerformanceMetrics[] = []
  private monitoringInterval?: NodeJS.Timeout
  private observer?: PerformanceObserver
  private startTime: number = 0

  constructor(config: PerformanceMonitorConfig) {
    super()
    this.config = {
      enabled: true,
      sampleInterval: 1000,
      maxHistorySize: 100,
      thresholds: {
        memory: 80,
        cpu: 70,
        fps: 30,
        responseTime: 100
      },
      autoOptimize: false,
      reporting: {
        enabled: false,
        interval: 60000
      },
      ...config
    }
  }

  /**
   * 开始监控
   */
  start(): void {
    if (!this.config.enabled || this.isMonitoring) {
      return
    }

    this.isMonitoring = true
    this.startTime = Date.now()

    // 启动定期采样
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics()
    }, this.config.sampleInterval)

    // 设置性能观察器
    this.setupPerformanceObserver()

    console.log('性能监控已启动')
    this.emit('started', { timestamp: Date.now() })
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (!this.isMonitoring) {
      return
    }

    this.isMonitoring = false

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }

    if (this.observer) {
      this.observer.disconnect()
      this.observer = undefined
    }

    console.log('性能监控已停止')
    this.emit('stopped', { timestamp: Date.now() })
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): PerformanceMetrics {
    return this.collectMetrics()
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const currentMetrics = this.getMetrics()
    const issues = this.analyzeIssues(currentMetrics)
    const recommendations = this.generateRecommendations(issues)
    const score = this.calculatePerformanceScore(currentMetrics, issues)

    const report: PerformanceReport = {
      id: `report_${Date.now()}`,
      timestamp: Date.now(),
      duration: Date.now() - this.startTime,
      metrics: currentMetrics,
      issues,
      recommendations,
      score
    }

    this.emit('reportGenerated', report)
    return report
  }

  /**
   * 检查是否正在监控
   */
  isRunning(): boolean {
    return this.isMonitoring
  }

  /**
   * 收集性能指标
   */
  private collectMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      memory: this.getMemoryMetrics(),
      cpu: this.getCPUMetrics(),
      rendering: this.getRenderingMetrics(),
      network: this.getNetworkMetrics(),
      interaction: this.getInteractionMetrics()
    }

    // 添加到历史记录
    this.metricsHistory.push(metrics)
    if (this.metricsHistory.length > this.config.maxHistorySize) {
      this.metricsHistory.shift()
    }

    // 检查阈值
    this.checkThresholds(metrics)

    this.emit('metricsCollected', metrics)
    return metrics
  }

  /**
   * 获取内存指标
   */
  private getMemoryMetrics() {
    const memory = (performance as any).memory
    if (memory) {
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      }
    }

    // 估算内存使用
    const estimatedUsed = this.estimateMemoryUsage()
    const estimatedTotal = estimatedUsed * 2 // 简单估算
    
    return {
      used: estimatedUsed,
      total: estimatedTotal,
      percentage: 50 // 默认值
    }
  }

  /**
   * 获取CPU指标
   */
  private getCPUMetrics() {
    // 浏览器环境下CPU使用率难以准确获取，使用估算方法
    const cores = navigator.hardwareConcurrency || 4
    const usage = this.estimateCPUUsage()

    return {
      usage,
      cores
    }
  }

  /**
   * 获取渲染性能指标
   */
  private getRenderingMetrics() {
    const fps = this.calculateFPS()
    const frameTime = fps > 0 ? 1000 / fps : 0
    const droppedFrames = this.getDroppedFrames()

    return {
      fps,
      frameTime,
      droppedFrames
    }
  }

  /**
   * 获取网络性能指标
   */
  private getNetworkMetrics() {
    const connection = (navigator as any).connection
    const latency = this.measureLatency()
    
    return {
      latency,
      bandwidth: connection?.downlink || 0,
      requests: this.getActiveRequestCount()
    }
  }

  /**
   * 获取交互性能指标
   */
  private getInteractionMetrics() {
    return {
      inputDelay: this.getInputDelay(),
      responseTime: this.getResponseTime(),
      scrollPerformance: this.getScrollPerformance()
    }
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObserver(): void {
    if (!window.PerformanceObserver) {
      return
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          this.processPerformanceEntry(entry)
        })
      })

      // 观察各种性能指标
      this.observer.observe({ entryTypes: ['measure', 'navigation', 'paint', 'largest-contentful-paint'] })
    } catch (error) {
      console.warn('无法设置性能观察器:', error)
    }
  }

  /**
   * 处理性能条目
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    this.emit('performanceEntry', {
      type: entry.entryType,
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration,
      timestamp: Date.now()
    })
  }

  /**
   * 估算内存使用
   */
  private estimateMemoryUsage(): number {
    // 简单的内存使用估算
    const domNodes = document.querySelectorAll('*').length
    const eventListeners = this.getEventListenerCount()
    const estimatedUsage = (domNodes * 1000) + (eventListeners * 500) + 10000000 // 基础内存

    return estimatedUsage
  }

  /**
   * 估算CPU使用率
   */
  private estimateCPUUsage(): number {
    // 通过测量代码执行时间来估算CPU使用率
    const start = performance.now()
    let iterations = 0
    const maxTime = 10 // 最大测量时间（毫秒）

    while (performance.now() - start < maxTime) {
      iterations++
    }

    // 基于迭代次数估算CPU使用率
    const baselineIterations = 100000 // 基准迭代次数
    const usage = Math.max(0, Math.min(100, (baselineIterations - iterations) / baselineIterations * 100))

    return usage
  }

  /**
   * 计算FPS
   */
  private calculateFPS(): number {
    // 使用requestAnimationFrame计算FPS
    let fps = 60 // 默认值
    let lastTime = performance.now()
    let frameCount = 0

    const measureFPS = () => {
      const currentTime = performance.now()
      frameCount++

      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        frameCount = 0
        lastTime = currentTime
      }

      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS)
      }
    }

    requestAnimationFrame(measureFPS)
    return fps
  }

  /**
   * 获取丢帧数
   */
  private getDroppedFrames(): number {
    // 简单的丢帧估算
    const fps = this.calculateFPS()
    const targetFPS = 60
    return Math.max(0, targetFPS - fps)
  }

  /**
   * 测量网络延迟
   */
  private measureLatency(): number {
    // 简单的延迟测量
    const start = performance.now()
    
    // 创建一个小的网络请求来测量延迟
    fetch('data:text/plain,ping', { method: 'HEAD' })
      .then(() => {
        const latency = performance.now() - start
        this.emit('latencyMeasured', { latency, timestamp: Date.now() })
      })
      .catch(() => {
        // 忽略错误
      })

    return 50 // 默认延迟值
  }

  /**
   * 获取活跃请求数
   */
  private getActiveRequestCount(): number {
    // 简单估算，实际应用中可以通过拦截器统计
    return 0
  }

  /**
   * 获取输入延迟
   */
  private getInputDelay(): number {
    // 通过First Input Delay API获取
    const entries = performance.getEntriesByType('first-input')
    if (entries.length > 0) {
      return (entries[0] as any).processingStart - entries[0].startTime
    }
    return 0
  }

  /**
   * 获取响应时间
   */
  private getResponseTime(): number {
    // 简单的响应时间测量
    return 50 // 默认值
  }

  /**
   * 获取滚动性能
   */
  private getScrollPerformance(): number {
    // 滚动性能评分（0-100）
    return 80 // 默认值
  }

  /**
   * 获取事件监听器数量
   */
  private getEventListenerCount(): number {
    // 简单估算
    return document.querySelectorAll('[onclick], [onchange], [onsubmit]').length
  }

  /**
   * 检查性能阈值
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    const issues: PerformanceIssue[] = []

    // 检查内存阈值
    if (metrics.memory.percentage > this.config.thresholds.memory) {
      issues.push({
        type: 'memory',
        severity: 'high',
        description: `内存使用率过高: ${metrics.memory.percentage.toFixed(1)}%`,
        impact: '可能导致应用卡顿或崩溃',
        solution: '清理不必要的对象引用，优化内存使用',
        timestamp: Date.now()
      })
    }

    // 检查CPU阈值
    if (metrics.cpu.usage > this.config.thresholds.cpu) {
      issues.push({
        type: 'cpu',
        severity: 'medium',
        description: `CPU使用率过高: ${metrics.cpu.usage.toFixed(1)}%`,
        impact: '可能导致界面响应缓慢',
        solution: '优化计算密集型操作，使用Web Workers',
        timestamp: Date.now()
      })
    }

    // 检查FPS阈值
    if (metrics.rendering.fps < this.config.thresholds.fps) {
      issues.push({
        type: 'rendering',
        severity: 'medium',
        description: `帧率过低: ${metrics.rendering.fps} FPS`,
        impact: '动画和交互可能不够流畅',
        solution: '优化渲染逻辑，减少重绘和重排',
        timestamp: Date.now()
      })
    }

    if (issues.length > 0) {
      this.emit('thresholdExceeded', { issues, metrics, timestamp: Date.now() })

      if (this.config.autoOptimize) {
        this.autoOptimize(issues)
      }
    }
  }

  /**
   * 分析性能问题
   */
  private analyzeIssues(metrics: PerformanceMetrics): PerformanceIssue[] {
    const issues: PerformanceIssue[] = []

    // 分析内存问题
    if (metrics.memory.percentage > 90) {
      issues.push({
        type: 'memory',
        severity: 'critical',
        description: '内存使用率极高，可能导致应用崩溃',
        impact: '应用可能变得不稳定',
        solution: '立即清理内存，检查内存泄漏',
        timestamp: Date.now()
      })
    }

    // 分析渲染问题
    if (metrics.rendering.droppedFrames > 10) {
      issues.push({
        type: 'rendering',
        severity: 'high',
        description: '大量丢帧，渲染性能差',
        impact: '用户体验受到严重影响',
        solution: '优化渲染管道，减少DOM操作',
        timestamp: Date.now()
      })
    }

    return issues
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(issues: PerformanceIssue[]): string[] {
    const recommendations: string[] = []

    issues.forEach(issue => {
      switch (issue.type) {
        case 'memory':
          recommendations.push('启用内存管理器自动清理功能')
          recommendations.push('检查并修复内存泄漏')
          break
        case 'cpu':
          recommendations.push('将计算密集型任务移至Web Workers')
          recommendations.push('优化算法复杂度')
          break
        case 'rendering':
          recommendations.push('启用虚拟滚动减少DOM节点')
          recommendations.push('使用CSS transform代替改变布局属性')
          break
        case 'network':
          recommendations.push('启用请求缓存和压缩')
          recommendations.push('优化网络请求策略')
          break
      }
    })

    return [...new Set(recommendations)] // 去重
  }

  /**
   * 计算性能评分
   */
  private calculatePerformanceScore(metrics: PerformanceMetrics, issues: PerformanceIssue[]): number {
    let score = 100

    // 根据各项指标扣分
    score -= Math.max(0, metrics.memory.percentage - 50) * 0.5
    score -= Math.max(0, metrics.cpu.usage - 30) * 0.3
    score -= Math.max(0, 60 - metrics.rendering.fps) * 0.5
    score -= metrics.rendering.droppedFrames * 2
    score -= Math.max(0, metrics.network.latency - 100) * 0.1

    // 根据问题严重程度扣分
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 20
          break
        case 'high':
          score -= 10
          break
        case 'medium':
          score -= 5
          break
        case 'low':
          score -= 2
          break
      }
    })

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 自动优化
   */
  private autoOptimize(issues: PerformanceIssue[]): void {
    console.log('执行自动优化...', issues)
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'memory':
          this.emit('optimizeMemory', { timestamp: Date.now() })
          break
        case 'rendering':
          this.emit('optimizeRendering', { timestamp: Date.now() })
          break
      }
    })
  }
}
