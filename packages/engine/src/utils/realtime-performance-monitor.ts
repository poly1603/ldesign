/**
 * 实时性能监控器
 * 提供实时性能数据收集、分析和告警功能
 */

import type { CoreWebVitalsMetrics } from './core-web-vitals'

// 实时性能数据接口
export interface RealtimePerformanceData {
  timestamp: number

  // 系统性能
  system: {
    memory: {
      used: number
      total: number
      percentage: number
    }
    cpu: {
      usage: number
      cores: number
    }
    fps: number
    frameDrops: number
  }

  // 网络性能
  network: {
    latency: number
    bandwidth: number
    connectionType: string
    effectiveType: string
  }

  // DOM性能
  dom: {
    nodeCount: number
    depth: number
    renderTime: number
    layoutTime: number
  }

  // Core Web Vitals
  webVitals: CoreWebVitalsMetrics

  // 自定义指标
  custom: Record<string, number>
}

// 性能告警接口
export interface PerformanceAlert {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  metric: string
  message: string
  value: number
  threshold: number
  timestamp: number
  resolved: boolean
}

// 性能阈值配置
export interface PerformanceThresholds {
  memory: { warning: number; critical: number }
  fps: { warning: number; critical: number }
  latency: { warning: number; critical: number }
  domNodes: { warning: number; critical: number }
  frameDrops: { warning: number; critical: number }
}

// 默认阈值
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  memory: { warning: 70, critical: 90 },
  fps: { warning: 30, critical: 20 },
  latency: { warning: 200, critical: 500 },
  domNodes: { warning: 5000, critical: 10000 },
  frameDrops: { warning: 5, critical: 10 }
}

// 实时性能监控器类
export class RealtimePerformanceMonitor {
  private isMonitoring = false
  private monitoringInterval?: number
  private fpsMonitoringId?: number
  private lastFrameTime = 0
  private frameCount = 0
  private frameDrops = 0

  private data: RealtimePerformanceData[] = []
  private alerts: PerformanceAlert[] = []
  private thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS

  private callbacks: Array<(data: RealtimePerformanceData) => void> = []
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = []

  private readonly maxDataPoints = 1000
  private readonly monitoringIntervalMs = 1000 // 1秒

  /**
   * 开始实时监控
   */
  start(): void {
    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true

    // 启动数据收集
    this.monitoringInterval = window.setInterval(() => {
      this.collectData()
    }, this.monitoringIntervalMs)

    // 启动FPS监控
    this.startFPSMonitoring()
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.isMonitoring = false

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }

    if (this.fpsMonitoringId) {
      cancelAnimationFrame(this.fpsMonitoringId)
      this.fpsMonitoringId = undefined
    }
  }

  /**
   * 设置性能阈值
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }

  /**
   * 添加数据回调
   */
  onData(callback: (data: RealtimePerformanceData) => void): void {
    this.callbacks.push(callback)
  }

  /**
   * 添加告警回调
   */
  onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback)
  }

  /**
   * 获取最新数据
   */
  getLatestData(): RealtimePerformanceData | null {
    return this.data[this.data.length - 1] || null
  }

  /**
   * 获取历史数据
   */
  getHistoryData(limit?: number): RealtimePerformanceData[] {
    if (limit) {
      return this.data.slice(-limit)
    }
    return [...this.data]
  }

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  /**
   * 获取所有告警
   */
  getAllAlerts(): PerformanceAlert[] {
    return [...this.alerts]
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
    }
  }

  /**
   * 收集性能数据
   */
  private collectData(): void {
    const timestamp = Date.now()

    const data: RealtimePerformanceData = {
      timestamp,
      system: this.collectSystemData(),
      network: this.collectNetworkData(),
      dom: this.collectDOMData(),
      webVitals: this.collectWebVitalsData(),
      custom: {}
    }

    // 添加到数据数组
    this.data.push(data)

    // 限制数据点数量
    if (this.data.length > this.maxDataPoints) {
      this.data.shift()
    }

    // 检查告警
    this.checkAlerts(data)

    // 通知回调
    this.notifyCallbacks(data)
  }

  /**
   * 收集系统性能数据
   */
  private collectSystemData() {
    const memory = this.getMemoryInfo()
    const cpu = this.getCPUInfo()

    return {
      memory,
      cpu,
      fps: this.getCurrentFPS(),
      frameDrops: this.frameDrops
    }
  }

  /**
   * 收集网络性能数据
   */
  private collectNetworkData() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    return {
      latency: this.measureLatency(),
      bandwidth: connection?.downlink || 0,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown'
    }
  }

  /**
   * 收集DOM性能数据
   */
  private collectDOMData() {
    const nodeCount = document.querySelectorAll('*').length
    const depth = this.getDOMDepth()

    return {
      nodeCount,
      depth,
      renderTime: this.measureRenderTime(),
      layoutTime: this.measureLayoutTime()
    }
  }

  /**
   * 收集Web Vitals数据
   */
  private collectWebVitalsData(): CoreWebVitalsMetrics {
    // 这里应该从Core Web Vitals监控器获取数据
    // 为了简化，返回空对象
    return {}
  }

  /**
   * 获取内存信息
   */
  private getMemoryInfo() {
    const memory = (performance as any).memory
    if (memory) {
      const used = memory.usedJSHeapSize
      const total = memory.totalJSHeapSize
      return {
        used,
        total,
        percentage: (used / total) * 100
      }
    }

    return { used: 0, total: 0, percentage: 0 }
  }

  /**
   * 获取CPU信息
   */
  private getCPUInfo() {
    return {
      usage: 0, // CPU使用率需要通过其他方式计算
      cores: navigator.hardwareConcurrency || 1
    }
  }

  /**
   * 启动FPS监控
   */
  private startFPSMonitoring(): void {
    let lastTime = performance.now()
    let frames = 0

    const measureFPS = (currentTime: number) => {
      frames++

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime))

        // 检测掉帧
        if (fps < 55) {
          this.frameDrops++
        }

        this.lastFrameTime = currentTime
        this.frameCount = fps

        frames = 0
        lastTime = currentTime
      }

      if (this.isMonitoring) {
        this.fpsMonitoringId = requestAnimationFrame(measureFPS)
      }
    }

    this.fpsMonitoringId = requestAnimationFrame(measureFPS)
  }

  /**
   * 获取当前FPS
   */
  private getCurrentFPS(): number {
    return this.frameCount
  }

  /**
   * 测量网络延迟
   */
  private measureLatency(): number {
    // 简化的延迟测量，实际应用中可能需要更复杂的实现
    return 0
  }

  /**
   * 获取DOM深度
   */
  private getDOMDepth(): number {
    let maxDepth = 0

    function getDepth(element: Element, depth = 0): number {
      maxDepth = Math.max(maxDepth, depth)

      for (const child of element.children) {
        getDepth(child, depth + 1)
      }

      return maxDepth
    }

    if (document.documentElement) {
      return getDepth(document.documentElement)
    }

    return 0
  }

  /**
   * 测量渲染时间
   */
  private measureRenderTime(): number {
    // 简化实现，实际应该使用Performance API
    return 0
  }

  /**
   * 测量布局时间
   */
  private measureLayoutTime(): number {
    // 简化实现，实际应该使用Performance API
    return 0
  }

  /**
   * 检查告警
   */
  private checkAlerts(data: RealtimePerformanceData): void {
    const alerts: PerformanceAlert[] = []

    // 检查内存使用率
    if (data.system.memory.percentage > this.thresholds.memory.critical) {
      alerts.push(this.createAlert('critical', 'memory', '内存使用率过高', data.system.memory.percentage, this.thresholds.memory.critical))
    } else if (data.system.memory.percentage > this.thresholds.memory.warning) {
      alerts.push(this.createAlert('warning', 'memory', '内存使用率较高', data.system.memory.percentage, this.thresholds.memory.warning))
    }

    // 检查FPS
    if (data.system.fps < this.thresholds.fps.critical) {
      alerts.push(this.createAlert('critical', 'fps', 'FPS过低', data.system.fps, this.thresholds.fps.critical))
    } else if (data.system.fps < this.thresholds.fps.warning) {
      alerts.push(this.createAlert('warning', 'fps', 'FPS较低', data.system.fps, this.thresholds.fps.warning))
    }

    // 检查DOM节点数量
    if (data.dom.nodeCount > this.thresholds.domNodes.critical) {
      alerts.push(this.createAlert('critical', 'domNodes', 'DOM节点过多', data.dom.nodeCount, this.thresholds.domNodes.critical))
    } else if (data.dom.nodeCount > this.thresholds.domNodes.warning) {
      alerts.push(this.createAlert('warning', 'domNodes', 'DOM节点较多', data.dom.nodeCount, this.thresholds.domNodes.warning))
    }

    // 添加新告警
    alerts.forEach(alert => {
      this.alerts.push(alert)
      this.notifyAlertCallbacks(alert)
    })
  }

  /**
   * 创建告警
   */
  private createAlert(level: PerformanceAlert['level'], metric: string, message: string, value: number, threshold: number): PerformanceAlert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      metric,
      message,
      value,
      threshold,
      timestamp: Date.now(),
      resolved: false
    }
  }

  /**
   * 通知数据回调
   */
  private notifyCallbacks(data: RealtimePerformanceData): void {
    this.callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error in realtime performance callback:', error)
      }
    })
  }

  /**
   * 通知告警回调
   */
  private notifyAlertCallbacks(alert: PerformanceAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('Error in performance alert callback:', error)
      }
    })
  }
}

// 全局实时性能监控器实例
export const globalRealtimePerformanceMonitor = new RealtimePerformanceMonitor()

// 便捷函数
export function startRealtimeMonitoring(): void {
  globalRealtimePerformanceMonitor.start()
}

export function stopRealtimeMonitoring(): void {
  globalRealtimePerformanceMonitor.stop()
}

export function getRealtimePerformanceData(): RealtimePerformanceData | null {
  return globalRealtimePerformanceMonitor.getLatestData()
}

export function getPerformanceAlerts(): PerformanceAlert[] {
  return globalRealtimePerformanceMonitor.getActiveAlerts()
}
