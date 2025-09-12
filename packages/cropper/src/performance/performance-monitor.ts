/**
 * @file 性能监控器
 * @description 监控图片裁剪器的性能指标
 */

import { EventEmitter } from '@/core/event-emitter'

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 帧率 */
  fps: number
  /** 平均帧时间（毫秒） */
  frameTime: number
  /** 内存使用量（MB） */
  memoryUsage: number
  /** CPU使用率估算 */
  cpuUsage: number
  /** 渲染时间（毫秒） */
  renderTime: number
  /** 图片加载时间（毫秒） */
  imageLoadTime: number
  /** 裁剪处理时间（毫秒） */
  cropTime: number
}

/**
 * 性能统计
 */
export interface PerformanceStats {
  /** 当前指标 */
  current: PerformanceMetrics
  /** 平均指标 */
  average: PerformanceMetrics
  /** 最大指标 */
  peak: PerformanceMetrics
  /** 采样数量 */
  sampleCount: number
  /** 监控时长（毫秒） */
  duration: number
}

/**
 * 性能警告级别
 */
export enum PerformanceWarningLevel {
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical'
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor extends EventEmitter {
  /** 是否正在监控 */
  private isMonitoring: boolean = false

  /** 监控开始时间 */
  private startTime: number = 0

  /** 帧率计算相关 */
  private frameCount: number = 0
  private lastFrameTime: number = 0
  private frameTimes: number[] = []

  /** 性能指标历史 */
  private metricsHistory: PerformanceMetrics[] = []
  private maxHistorySize: number = 100

  /** 当前性能指标 */
  private currentMetrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    renderTime: 0,
    imageLoadTime: 0,
    cropTime: 0
  }

  /** 性能阈值 */
  private performanceThresholds = {
    fps: {
      [PerformanceWarningLevel.GOOD]: 55,
      [PerformanceWarningLevel.FAIR]: 45,
      [PerformanceWarningLevel.POOR]: 30,
      [PerformanceWarningLevel.CRITICAL]: 15
    },
    frameTime: {
      [PerformanceWarningLevel.GOOD]: 18,
      [PerformanceWarningLevel.FAIR]: 22,
      [PerformanceWarningLevel.POOR]: 33,
      [PerformanceWarningLevel.CRITICAL]: 66
    },
    memoryUsage: {
      [PerformanceWarningLevel.GOOD]: 50,
      [PerformanceWarningLevel.FAIR]: 100,
      [PerformanceWarningLevel.POOR]: 200,
      [PerformanceWarningLevel.CRITICAL]: 400
    }
  }

  /** 监控间隔 */
  private monitoringInterval: number = 1000 // 1秒

  /** 监控定时器 */
  private monitorTimer?: number

  /** 性能观察器 */
  private performanceObserver?: PerformanceObserver

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: {
    monitoringInterval?: number
    maxHistorySize?: number
  } = {}) {
    super()

    this.monitoringInterval = options.monitoringInterval || this.monitoringInterval
    this.maxHistorySize = options.maxHistorySize || this.maxHistorySize

    // 初始化性能观察器
    this.initPerformanceObserver()
  }

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.startTime = performance.now()
    this.frameCount = 0
    this.lastFrameTime = this.startTime

    // 启动监控定时器
    this.monitorTimer = window.setInterval(() => {
      this.updateMetrics()
      this.checkPerformanceWarnings()
    }, this.monitoringInterval)

    // 启动帧率监控
    this.startFrameRateMonitoring()

    this.emit('monitoringStarted')
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return

    this.isMonitoring = false

    if (this.monitorTimer) {
      clearInterval(this.monitorTimer)
      this.monitorTimer = undefined
    }

    this.emit('monitoringStopped')
  }

  /**
   * 记录渲染时间
   * @param duration 渲染时长（毫秒）
   */
  recordRenderTime(duration: number): void {
    this.currentMetrics.renderTime = duration
    this.emit('renderTimeRecorded', { duration })
  }

  /**
   * 记录图片加载时间
   * @param duration 加载时长（毫秒）
   */
  recordImageLoadTime(duration: number): void {
    this.currentMetrics.imageLoadTime = duration
    this.emit('imageLoadTimeRecorded', { duration })
  }

  /**
   * 记录裁剪处理时间
   * @param duration 处理时长（毫秒）
   */
  recordCropTime(duration: number): void {
    this.currentMetrics.cropTime = duration
    this.emit('cropTimeRecorded', { duration })
  }

  /**
   * 获取当前性能指标
   */
  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.currentMetrics }
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): PerformanceStats {
    if (this.metricsHistory.length === 0) {
      return {
        current: this.currentMetrics,
        average: this.currentMetrics,
        peak: this.currentMetrics,
        sampleCount: 0,
        duration: 0
      }
    }

    const average = this.calculateAverageMetrics()
    const peak = this.calculatePeakMetrics()
    const duration = performance.now() - this.startTime

    return {
      current: this.currentMetrics,
      average,
      peak,
      sampleCount: this.metricsHistory.length,
      duration
    }
  }

  /**
   * 获取性能等级
   */
  getPerformanceLevel(): PerformanceWarningLevel {
    const metrics = this.currentMetrics

    // 基于FPS判断性能等级
    if (metrics.fps >= this.performanceThresholds.fps[PerformanceWarningLevel.GOOD]) {
      return PerformanceWarningLevel.GOOD
    } else if (metrics.fps >= this.performanceThresholds.fps[PerformanceWarningLevel.FAIR]) {
      return PerformanceWarningLevel.FAIR
    } else if (metrics.fps >= this.performanceThresholds.fps[PerformanceWarningLevel.POOR]) {
      return PerformanceWarningLevel.POOR
    } else {
      return PerformanceWarningLevel.CRITICAL
    }
  }

  /**
   * 清空性能历史
   */
  clearHistory(): void {
    this.metricsHistory = []
    this.frameTimes = []
    this.emit('historyCleared')
  }

  /**
   * 导出性能数据
   */
  exportPerformanceData(): string {
    const stats = this.getPerformanceStats()
    return JSON.stringify({
      stats,
      history: this.metricsHistory,
      timestamp: Date.now()
    }, null, 2)
  }

  /**
   * 初始化性能观察器
   */
  private initPerformanceObserver(): void {
    if (typeof PerformanceObserver === 'undefined') return

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            // 处理自定义测量
            this.handleCustomMeasure(entry)
          } else if (entry.entryType === 'navigation') {
            // 处理导航性能
            this.handleNavigationPerformance(entry as PerformanceNavigationTiming)
          }
        })
      })

      this.performanceObserver.observe({ 
        entryTypes: ['measure', 'navigation'] 
      })
    } catch (error) {
      console.warn('Failed to initialize PerformanceObserver:', error)
    }
  }

  /**
   * 处理自定义测量
   */
  private handleCustomMeasure(entry: PerformanceEntry): void {
    if (entry.name.startsWith('cropper-render')) {
      this.recordRenderTime(entry.duration)
    } else if (entry.name.startsWith('cropper-crop')) {
      this.recordCropTime(entry.duration)
    } else if (entry.name.startsWith('cropper-image-load')) {
      this.recordImageLoadTime(entry.duration)
    }
  }

  /**
   * 处理导航性能
   */
  private handleNavigationPerformance(entry: PerformanceNavigationTiming): void {
    // 可以用于分析页面加载性能
    this.emit('navigationPerformance', {
      loadTime: entry.loadEventEnd - entry.navigationStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart
    })
  }

  /**
   * 启动帧率监控
   */
  private startFrameRateMonitoring(): void {
    const measureFrame = () => {
      if (!this.isMonitoring) return

      const now = performance.now()
      const frameTime = now - this.lastFrameTime

      this.frameTimes.push(frameTime)
      if (this.frameTimes.length > 60) { // 保持最近60帧
        this.frameTimes.shift()
      }

      this.frameCount++
      this.lastFrameTime = now

      requestAnimationFrame(measureFrame)
    }

    requestAnimationFrame(measureFrame)
  }

  /**
   * 更新性能指标
   */
  private updateMetrics(): void {
    // 计算FPS
    if (this.frameTimes.length > 0) {
      const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
      this.currentMetrics.fps = Math.round(1000 / avgFrameTime)
      this.currentMetrics.frameTime = Math.round(avgFrameTime * 100) / 100
    }

    // 估算CPU使用率（基于帧时间）
    this.currentMetrics.cpuUsage = Math.min(100, Math.round(this.currentMetrics.frameTime / 16.67 * 100))

    // 获取内存使用量
    this.currentMetrics.memoryUsage = this.getMemoryUsage()

    // 添加到历史记录
    this.addToHistory({ ...this.currentMetrics })

    this.emit('metricsUpdated', this.currentMetrics)
  }

  /**
   * 获取内存使用量
   */
  private getMemoryUsage(): number {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory
      return Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100 // MB
    }
    return 0
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(metrics: PerformanceMetrics): void {
    this.metricsHistory.push(metrics)
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift()
    }
  }

  /**
   * 计算平均指标
   */
  private calculateAverageMetrics(): PerformanceMetrics {
    if (this.metricsHistory.length === 0) {
      return { ...this.currentMetrics }
    }

    const sum = this.metricsHistory.reduce((acc, metrics) => ({
      fps: acc.fps + metrics.fps,
      frameTime: acc.frameTime + metrics.frameTime,
      memoryUsage: acc.memoryUsage + metrics.memoryUsage,
      cpuUsage: acc.cpuUsage + metrics.cpuUsage,
      renderTime: acc.renderTime + metrics.renderTime,
      imageLoadTime: acc.imageLoadTime + metrics.imageLoadTime,
      cropTime: acc.cropTime + metrics.cropTime
    }), {
      fps: 0, frameTime: 0, memoryUsage: 0, cpuUsage: 0,
      renderTime: 0, imageLoadTime: 0, cropTime: 0
    })

    const count = this.metricsHistory.length
    return {
      fps: Math.round(sum.fps / count),
      frameTime: Math.round(sum.frameTime / count * 100) / 100,
      memoryUsage: Math.round(sum.memoryUsage / count * 100) / 100,
      cpuUsage: Math.round(sum.cpuUsage / count),
      renderTime: Math.round(sum.renderTime / count * 100) / 100,
      imageLoadTime: Math.round(sum.imageLoadTime / count * 100) / 100,
      cropTime: Math.round(sum.cropTime / count * 100) / 100
    }
  }

  /**
   * 计算峰值指标
   */
  private calculatePeakMetrics(): PerformanceMetrics {
    if (this.metricsHistory.length === 0) {
      return { ...this.currentMetrics }
    }

    return this.metricsHistory.reduce((peak, metrics) => ({
      fps: Math.max(peak.fps, metrics.fps),
      frameTime: Math.max(peak.frameTime, metrics.frameTime),
      memoryUsage: Math.max(peak.memoryUsage, metrics.memoryUsage),
      cpuUsage: Math.max(peak.cpuUsage, metrics.cpuUsage),
      renderTime: Math.max(peak.renderTime, metrics.renderTime),
      imageLoadTime: Math.max(peak.imageLoadTime, metrics.imageLoadTime),
      cropTime: Math.max(peak.cropTime, metrics.cropTime)
    }))
  }

  /**
   * 检查性能警告
   */
  private checkPerformanceWarnings(): void {
    const level = this.getPerformanceLevel()
    
    if (level === PerformanceWarningLevel.POOR || level === PerformanceWarningLevel.CRITICAL) {
      this.emit('performanceWarning', {
        level,
        metrics: this.currentMetrics,
        suggestions: this.getPerformanceSuggestions(level)
      })
    }
  }

  /**
   * 获取性能建议
   */
  private getPerformanceSuggestions(level: PerformanceWarningLevel): string[] {
    const suggestions: string[] = []

    if (this.currentMetrics.fps < 30) {
      suggestions.push('考虑降低图片分辨率或减少同时处理的图片数量')
    }

    if (this.currentMetrics.memoryUsage > 200) {
      suggestions.push('内存使用过高，建议清理缓存或减少图片缓存数量')
    }

    if (this.currentMetrics.renderTime > 50) {
      suggestions.push('渲染时间过长，考虑使用Web Workers进行后台处理')
    }

    if (level === PerformanceWarningLevel.CRITICAL) {
      suggestions.push('性能严重不足，建议关闭一些高级功能或降低处理质量')
    }

    return suggestions
  }

  /**
   * 销毁性能监控器
   */
  destroy(): void {
    this.stopMonitoring()
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
      this.performanceObserver = undefined
    }

    this.clearHistory()
    this.removeAllListeners()
  }
}
