/**
 * 性能监控服务
 * 
 * 提供性能监控和统计功能，包括：
 * - 性能指标收集
 * - 内存使用监控
 * - 缓存命中率统计
 * - 加载时间统计
 * - FPS 监控
 */

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** 缓存命中率 (0-1) */
  cacheHitRate: number
  /** 平均加载时间 (毫秒) */
  averageLoadTime: number
  /** 内存使用量 (MB) */
  memoryUsage: number
  /** 当前 FPS */
  fps: number
  /** 模板数量 */
  templateCount: number
  /** 活跃组件数量 */
  activeComponents: number
  /** 错误率 (0-1) */
  errorRate: number
  /** 最后更新时间 */
  lastUpdated: number
}

/**
 * 性能监控配置
 */
export interface PerformanceMonitorConfig {
  /** 是否启用监控 */
  enabled?: boolean
  /** 监控间隔 (毫秒) */
  interval?: number
  /** 是否监控 FPS */
  monitorFPS?: boolean
  /** 是否监控内存 */
  monitorMemory?: boolean
  /** 历史数据保留数量 */
  historySize?: number
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 性能历史记录
 */
export interface PerformanceHistory {
  timestamp: number
  metrics: PerformanceMetrics
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private config: Required<PerformanceMonitorConfig>
  private metrics: PerformanceMetrics
  private history: PerformanceHistory[] = []
  private intervalId: number | null = null
  private frameCount = 0
  private lastFrameTime = 0
  private loadTimes: number[] = []
  private cacheHits = 0
  private cacheMisses = 0
  private errorCount = 0
  private totalOperations = 0

  constructor(config: PerformanceMonitorConfig = {}) {
    this.config = {
      enabled: true,
      interval: 1000,
      monitorFPS: true,
      monitorMemory: true,
      historySize: 100,
      debug: false,
      ...config,
    }

    this.metrics = this.createInitialMetrics()

    if (this.config.enabled) {
      this.start()
    }
  }

  /**
   * 开始监控
   */
  start(): void {
    if (this.intervalId) {
      return
    }

    this.intervalId = window.setInterval(() => {
      this.updateMetrics()
    }, this.config.interval)

    if (this.config.monitorFPS) {
      this.startFPSMonitoring()
    }

    if (this.config.debug) {
      console.log('🔍 性能监控已启动')
    }
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.config.debug) {
      console.log('🔍 性能监控已停止')
    }
  }

  /**
   * 记录加载时间
   */
  recordLoadTime(duration: number): void {
    this.loadTimes.push(duration)
    this.totalOperations++

    // 限制数组大小
    if (this.loadTimes.length > 100) {
      this.loadTimes.shift()
    }
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(): void {
    this.cacheHits++
    this.totalOperations++
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(): void {
    this.cacheMisses++
    this.totalOperations++
  }

  /**
   * 记录错误
   */
  recordError(): void {
    this.errorCount++
    this.totalOperations++
  }

  /**
   * 获取当前性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 获取性能历史
   */
  getHistory(): PerformanceHistory[] {
    return [...this.history]
  }

  /**
   * 清除历史数据
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * 重置统计数据
   */
  reset(): void {
    this.loadTimes = []
    this.cacheHits = 0
    this.cacheMisses = 0
    this.errorCount = 0
    this.totalOperations = 0
    this.frameCount = 0
    this.lastFrameTime = 0
    this.metrics = this.createInitialMetrics()
    this.clearHistory()
  }

  /**
   * 更新性能指标
   */
  private updateMetrics(): void {
    // 计算缓存命中率
    const totalCacheOperations = this.cacheHits + this.cacheMisses
    this.metrics.cacheHitRate = totalCacheOperations > 0 
      ? this.cacheHits / totalCacheOperations 
      : 0

    // 计算平均加载时间
    this.metrics.averageLoadTime = this.loadTimes.length > 0
      ? this.loadTimes.reduce((sum, time) => sum + time, 0) / this.loadTimes.length
      : 0

    // 计算错误率
    this.metrics.errorRate = this.totalOperations > 0
      ? this.errorCount / this.totalOperations
      : 0

    // 监控内存使用
    if (this.config.monitorMemory && 'memory' in performance) {
      const memInfo = (performance as any).memory
      this.metrics.memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024) // 转换为 MB
    }

    // 更新时间戳
    this.metrics.lastUpdated = Date.now()

    // 添加到历史记录
    this.addToHistory()

    if (this.config.debug) {
      console.log('📊 性能指标更新:', this.metrics)
    }
  }

  /**
   * 开始 FPS 监控
   */
  private startFPSMonitoring(): void {
    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = timestamp
      }

      const delta = timestamp - this.lastFrameTime
      if (delta >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / delta)
        this.frameCount = 0
        this.lastFrameTime = timestamp
      }

      this.frameCount++
      requestAnimationFrame(measureFPS)
    }

    requestAnimationFrame(measureFPS)
  }

  /**
   * 创建初始性能指标
   */
  private createInitialMetrics(): PerformanceMetrics {
    return {
      cacheHitRate: 0,
      averageLoadTime: 0,
      memoryUsage: 0,
      fps: 0,
      templateCount: 0,
      activeComponents: 0,
      errorRate: 0,
      lastUpdated: Date.now(),
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(): void {
    this.history.push({
      timestamp: Date.now(),
      metrics: { ...this.metrics },
    })

    // 限制历史记录大小
    if (this.history.length > this.config.historySize) {
      this.history.shift()
    }
  }

  /**
   * 获取性能摘要
   */
  getSummary(): {
    averageFPS: number
    peakMemoryUsage: number
    totalLoadTime: number
    cacheEfficiency: string
  } {
    if (this.history.length === 0) {
      return {
        averageFPS: 0,
        peakMemoryUsage: 0,
        totalLoadTime: 0,
        cacheEfficiency: '0%',
      }
    }

    const avgFPS = this.history.reduce((sum, h) => sum + h.metrics.fps, 0) / this.history.length
    const peakMemory = Math.max(...this.history.map(h => h.metrics.memoryUsage))
    const totalLoadTime = this.loadTimes.reduce((sum, time) => sum + time, 0)
    const cacheEfficiency = `${Math.round(this.metrics.cacheHitRate * 100)}%`

    return {
      averageFPS: Math.round(avgFPS),
      peakMemoryUsage: Math.round(peakMemory * 100) / 100,
      totalLoadTime: Math.round(totalLoadTime),
      cacheEfficiency,
    }
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stop()
    this.reset()

    if (this.config.debug) {
      console.log('🔍 性能监控器已销毁')
    }
  }
}
