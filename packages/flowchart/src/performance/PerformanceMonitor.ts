/**
 * 性能监控系统
 * 用于监控流程图编辑器的渲染性能、内存使用和DOM操作
 */

export interface PerformanceMetrics {
  /** 渲染时间（毫秒） */
  renderTime: number
  /** 内存使用（MB） */
  memoryUsage: number
  /** DOM节点数量 */
  domNodeCount: number
  /** 事件监听器数量 */
  eventListenerCount: number
  /** 流程图节点数量 */
  flowchartNodeCount: number
  /** 流程图边数量 */
  flowchartEdgeCount: number
  /** FPS（帧率） */
  fps: number
  /** 时间戳 */
  timestamp: number
}

export interface PerformanceReport {
  /** 指标历史记录 */
  metrics: PerformanceMetrics[]
  /** 平均渲染时间 */
  avgRenderTime: number
  /** 最大渲染时间 */
  maxRenderTime: number
  /** 平均内存使用 */
  avgMemoryUsage: number
  /** 最大内存使用 */
  maxMemoryUsage: number
  /** 平均FPS */
  avgFPS: number
  /** 最低FPS */
  minFPS: number
  /** 性能等级 */
  performanceGrade: 'excellent' | 'good' | 'fair' | 'poor'
  /** 建议 */
  recommendations: string[]
}

export interface PerformanceMonitorConfig {
  /** 是否启用监控 */
  enabled: boolean
  /** 采样间隔（毫秒） */
  sampleInterval: number
  /** 最大历史记录数量 */
  maxHistorySize: number
  /** 是否监控内存 */
  monitorMemory: boolean
  /** 是否监控FPS */
  monitorFPS: boolean
  /** 是否自动生成报告 */
  autoReport: boolean
  /** 报告生成间隔（毫秒） */
  reportInterval: number
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private config: PerformanceMonitorConfig
  private metrics: PerformanceMetrics[] = []
  private isMonitoring = false
  private sampleTimer?: number
  private reportTimer?: number
  private fpsCounter = new FPSCounter()
  private renderStartTime = 0
  private domObserver?: MutationObserver
  private eventListenerCount = 0

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    this.config = {
      enabled: true,
      sampleInterval: 1000, // 1秒采样一次
      maxHistorySize: 100,
      monitorMemory: true,
      monitorFPS: true,
      autoReport: false,
      reportInterval: 30000, // 30秒生成一次报告
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
    this.startSampling()
    this.startDOMObserver()
    
    if (this.config.monitorFPS) {
      this.fpsCounter.start()
    }

    if (this.config.autoReport) {
      this.startAutoReport()
    }

    console.log('性能监控已启动')
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (!this.isMonitoring) {
      return
    }

    this.isMonitoring = false
    this.stopSampling()
    this.stopDOMObserver()
    this.fpsCounter.stop()
    this.stopAutoReport()

    console.log('性能监控已停止')
  }

  /**
   * 标记渲染开始
   */
  markRenderStart(): void {
    this.renderStartTime = performance.now()
  }

  /**
   * 标记渲染结束
   */
  markRenderEnd(): void {
    if (this.renderStartTime > 0) {
      const renderTime = performance.now() - this.renderStartTime
      this.recordRenderTime(renderTime)
      this.renderStartTime = 0
    }
  }

  /**
   * 记录事件监听器数量变化
   */
  recordEventListener(delta: number): void {
    this.eventListenerCount += delta
  }

  /**
   * 获取当前性能指标
   */
  getCurrentMetrics(): PerformanceMetrics {
    return {
      renderTime: this.getLastRenderTime(),
      memoryUsage: this.getMemoryUsage(),
      domNodeCount: this.getDOMNodeCount(),
      eventListenerCount: this.eventListenerCount,
      flowchartNodeCount: this.getFlowchartNodeCount(),
      flowchartEdgeCount: this.getFlowchartEdgeCount(),
      fps: this.fpsCounter.getFPS(),
      timestamp: Date.now()
    }
  }

  /**
   * 获取性能报告
   */
  getReport(): PerformanceReport {
    if (this.metrics.length === 0) {
      return this.createEmptyReport()
    }

    const renderTimes = this.metrics.map(m => m.renderTime).filter(t => t > 0)
    const memoryUsages = this.metrics.map(m => m.memoryUsage)
    const fpsValues = this.metrics.map(m => m.fps).filter(f => f > 0)

    const avgRenderTime = this.average(renderTimes)
    const maxRenderTime = Math.max(...renderTimes)
    const avgMemoryUsage = this.average(memoryUsages)
    const maxMemoryUsage = Math.max(...memoryUsages)
    const avgFPS = this.average(fpsValues)
    const minFPS = Math.min(...fpsValues)

    return {
      metrics: [...this.metrics],
      avgRenderTime,
      maxRenderTime,
      avgMemoryUsage,
      maxMemoryUsage,
      avgFPS,
      minFPS,
      performanceGrade: this.calculatePerformanceGrade(avgRenderTime, avgFPS, avgMemoryUsage),
      recommendations: this.generateRecommendations(avgRenderTime, avgFPS, avgMemoryUsage, maxMemoryUsage)
    }
  }

  /**
   * 清空历史数据
   */
  clear(): void {
    this.metrics = []
    this.fpsCounter.reset()
    console.log('性能监控数据已清空')
  }

  /**
   * 导出性能数据
   */
  exportData(): string {
    const report = this.getReport()
    return JSON.stringify(report, null, 2)
  }

  private startSampling(): void {
    this.sampleTimer = window.setInterval(() => {
      const metrics = this.getCurrentMetrics()
      this.addMetrics(metrics)
    }, this.config.sampleInterval)
  }

  private stopSampling(): void {
    if (this.sampleTimer) {
      clearInterval(this.sampleTimer)
      this.sampleTimer = undefined
    }
  }

  private startDOMObserver(): void {
    this.domObserver = new MutationObserver(() => {
      // DOM变化时可以记录相关信息
    })

    this.domObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  private stopDOMObserver(): void {
    if (this.domObserver) {
      this.domObserver.disconnect()
      this.domObserver = undefined
    }
  }

  private startAutoReport(): void {
    this.reportTimer = window.setInterval(() => {
      const report = this.getReport()
      console.log('性能报告:', report)
    }, this.config.reportInterval)
  }

  private stopAutoReport(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = undefined
    }
  }

  private addMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)
    
    // 限制历史记录数量
    if (this.metrics.length > this.config.maxHistorySize) {
      this.metrics.shift()
    }
  }

  private recordRenderTime(renderTime: number): void {
    // 记录渲染时间，可以用于实时监控
  }

  private getLastRenderTime(): number {
    const lastMetrics = this.metrics[this.metrics.length - 1]
    return lastMetrics?.renderTime || 0
  }

  private getMemoryUsage(): number {
    if (!this.config.monitorMemory || !('memory' in performance)) {
      return 0
    }

    const memory = (performance as any).memory
    return Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100 // MB
  }

  private getDOMNodeCount(): number {
    return document.querySelectorAll('*').length
  }

  private getFlowchartNodeCount(): number {
    // 这里需要从编辑器实例获取，暂时返回0
    return 0
  }

  private getFlowchartEdgeCount(): number {
    // 这里需要从编辑器实例获取，暂时返回0
    return 0
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  }

  private calculatePerformanceGrade(avgRenderTime: number, avgFPS: number, avgMemoryUsage: number): PerformanceReport['performanceGrade'] {
    let score = 100

    // 渲染时间评分（越低越好）
    if (avgRenderTime > 100) score -= 30
    else if (avgRenderTime > 50) score -= 20
    else if (avgRenderTime > 20) score -= 10

    // FPS评分（越高越好）
    if (avgFPS < 30) score -= 30
    else if (avgFPS < 45) score -= 20
    else if (avgFPS < 55) score -= 10

    // 内存使用评分（越低越好）
    if (avgMemoryUsage > 100) score -= 20
    else if (avgMemoryUsage > 50) score -= 10

    if (score >= 90) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'fair'
    return 'poor'
  }

  private generateRecommendations(avgRenderTime: number, avgFPS: number, avgMemoryUsage: number, maxMemoryUsage: number): string[] {
    const recommendations: string[] = []

    if (avgRenderTime > 50) {
      recommendations.push('渲染时间较长，建议启用虚拟滚动或减少同时渲染的节点数量')
    }

    if (avgFPS < 45) {
      recommendations.push('帧率较低，建议优化动画效果或减少DOM操作频率')
    }

    if (avgMemoryUsage > 50) {
      recommendations.push('内存使用较高，建议检查是否存在内存泄漏或优化数据结构')
    }

    if (maxMemoryUsage > 100) {
      recommendations.push('内存峰值过高，建议实现对象池或延迟加载机制')
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表现良好，继续保持！')
    }

    return recommendations
  }

  private createEmptyReport(): PerformanceReport {
    return {
      metrics: [],
      avgRenderTime: 0,
      maxRenderTime: 0,
      avgMemoryUsage: 0,
      maxMemoryUsage: 0,
      avgFPS: 0,
      minFPS: 0,
      performanceGrade: 'excellent',
      recommendations: ['暂无性能数据']
    }
  }
}

/**
 * FPS计数器
 */
class FPSCounter {
  private fps = 0
  private frameCount = 0
  private lastTime = 0
  private isRunning = false
  private animationId?: number

  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.lastTime = performance.now()
    this.frameCount = 0
    this.tick()
  }

  stop(): void {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = undefined
    }
  }

  reset(): void {
    this.fps = 0
    this.frameCount = 0
    this.lastTime = 0
  }

  getFPS(): number {
    return Math.round(this.fps)
  }

  private tick = (): void => {
    if (!this.isRunning) return

    const currentTime = performance.now()
    this.frameCount++

    if (currentTime - this.lastTime >= 1000) {
      this.fps = (this.frameCount * 1000) / (currentTime - this.lastTime)
      this.frameCount = 0
      this.lastTime = currentTime
    }

    this.animationId = requestAnimationFrame(this.tick)
  }
}
