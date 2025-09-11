/**
 * 性能管理器
 * 
 * 负责图表性能监控和优化，包括：
 * - 渲染性能监控
 * - 内存使用监控
 * - 大数据量优化
 * - 虚拟滚动支持
 * - 性能指标收集
 */

import type { ECharts } from 'echarts'
import type { ChartConfig } from '../core/types'

/**
 * 性能配置
 */
export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enableMonitoring?: boolean
  /** 大数据量阈值 */
  largeDataThreshold?: number
  /** 是否启用虚拟滚动 */
  enableVirtualScrolling?: boolean
  /** 虚拟滚动窗口大小 */
  virtualScrollWindowSize?: number
  /** 是否启用数据采样 */
  enableDataSampling?: boolean
  /** 采样率 */
  samplingRate?: number
  /** 是否启用渐进式渲染 */
  enableProgressiveRendering?: boolean
  /** 渐进式渲染阈值 */
  progressiveThreshold?: number
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 初始化时间 */
  initTime: number
  /** 渲染时间 */
  renderTime: number
  /** 数据处理时间 */
  dataProcessTime: number
  /** 内存使用量 */
  memoryUsage: number
  /** 数据点数量 */
  dataPointCount: number
  /** 系列数量 */
  seriesCount: number
  /** FPS */
  fps: number
  /** 是否使用了优化 */
  optimizationsUsed: string[]
}

/**
 * 内存监控信息
 */
export interface MemoryInfo {
  /** 已使用内存 */
  usedJSHeapSize: number
  /** 总内存 */
  totalJSHeapSize: number
  /** 内存限制 */
  jsHeapSizeLimit: number
  /** 内存使用率 */
  memoryUsagePercentage: number
}

/**
 * 性能管理器类
 */
export class PerformanceManager {
  /** 性能配置 */
  private _config: PerformanceConfig

  /** 性能指标 */
  private _metrics: PerformanceMetrics

  /** 性能监控定时器 */
  private _monitoringTimer: number | null = null

  /** FPS 监控 */
  private _fpsMonitor: {
    frames: number
    lastTime: number
    fps: number
    animationId?: number
  } = { frames: 0, lastTime: 0, fps: 0, animationId: undefined }

  /** 内存监控历史 */
  private _memoryHistory: MemoryInfo[] = []

  /** 性能事件监听器 */
  private _listeners: Map<string, Function[]> = new Map()

  /**
   * 构造函数
   * @param config - 性能配置
   */
  constructor(config: PerformanceConfig = {}) {
    this._config = {
      enableMonitoring: true,
      largeDataThreshold: 10000,
      enableVirtualScrolling: false,
      virtualScrollWindowSize: 1000,
      enableDataSampling: false,
      samplingRate: 0.1,
      enableProgressiveRendering: false,
      progressiveThreshold: 5000,
      ...config
    }

    this._metrics = {
      initTime: 0,
      renderTime: 0,
      dataProcessTime: 0,
      memoryUsage: 0,
      dataPointCount: 0,
      seriesCount: 0,
      fps: 0,
      optimizationsUsed: []
    }

    if (this._config.enableMonitoring) {
      this._startMonitoring()
    }
  }

  /**
   * 开始性能监控
   * @param echarts - ECharts 实例
   * @param config - 图表配置
   */
  startProfiling(echarts: ECharts, config: ChartConfig): void {
    const startTime = performance.now()

    // 记录初始化开始
    this._metrics.initTime = startTime

    // 监听渲染完成事件
    echarts.on('finished', () => {
      const endTime = performance.now()
      this._metrics.renderTime = endTime - startTime
      this._updateMetrics(config)
      this._triggerEvent('renderComplete', this._metrics)
    })
  }

  /**
   * 优化数据
   * @param data - 原始数据
   * @returns 优化后的数据
   */
  optimizeData(data: any[]): any[] {
    const optimizations: string[] = []
    let optimizedData = data

    // 检查是否需要数据采样
    if (this._shouldUseSampling(data)) {
      optimizedData = this._sampleData(optimizedData)
      optimizations.push('data-sampling')
    }

    // 检查是否需要虚拟滚动
    if (this._shouldUseVirtualScrolling(data)) {
      optimizedData = this._applyVirtualScrolling(optimizedData)
      optimizations.push('virtual-scrolling')
    }

    // 检查是否需要渐进式渲染
    if (this._shouldUseProgressiveRendering(data)) {
      optimizations.push('progressive-rendering')
    }

    this._metrics.optimizationsUsed = optimizations
    return optimizedData
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this._metrics }
  }

  /**
   * 获取内存信息
   */
  getMemoryInfo(): MemoryInfo | null {
    if (typeof performance === 'undefined' || !performance.memory) {
      return null
    }

    const memory = performance.memory as any
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      memoryUsagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    }
  }

  /**
   * 获取内存使用历史
   */
  getMemoryHistory(): MemoryInfo[] {
    return [...this._memoryHistory]
  }

  /**
   * 清理内存历史
   */
  clearMemoryHistory(): void {
    this._memoryHistory = []
  }

  /**
   * 监听性能事件
   * @param event - 事件名称
   * @param listener - 监听器函数
   */
  on(event: string, listener: Function): void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, [])
    }
    this._listeners.get(event)!.push(listener)
  }

  /**
   * 移除性能事件监听器
   * @param event - 事件名称
   * @param listener - 监听器函数
   */
  off(event: string, listener?: Function): void {
    if (!this._listeners.has(event)) return

    if (listener) {
      const listeners = this._listeners.get(event)!
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this._listeners.delete(event)
    }
  }

  /**
   * 销毁性能管理器
   */
  dispose(): void {
    this._isMonitoring = false

    if (this._monitoringTimer) {
      clearInterval(this._monitoringTimer)
      this._monitoringTimer = null
    }

    // 清理 FPS 监控
    if (this._fpsMonitor.animationId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this._fpsMonitor.animationId)
      this._fpsMonitor.animationId = undefined
    }

    this._listeners.clear()
    this._memoryHistory = []
  }

  /**
   * 开始监控
   */
  private _startMonitoring(): void {
    // FPS 监控 (仅在浏览器环境中)
    if (typeof requestAnimationFrame !== 'undefined') {
      const updateFPS = () => {
        if (!this._isMonitoring) return // 停止监控时退出

        this._fpsMonitor.frames++
        const now = performance.now()

        if (now - this._fpsMonitor.lastTime >= 1000) {
          this._fpsMonitor.fps = Math.round((this._fpsMonitor.frames * 1000) / (now - this._fpsMonitor.lastTime))
          this._fpsMonitor.frames = 0
          this._fpsMonitor.lastTime = now
          this._metrics.fps = this._fpsMonitor.fps
        }

        if (this._isMonitoring) {
          this._fpsMonitor.animationId = requestAnimationFrame(updateFPS)
        }
      }
      this._fpsMonitor.animationId = requestAnimationFrame(updateFPS)
    }

    // 内存监控
    this._monitoringTimer = (typeof window !== 'undefined' ? window.setInterval : setInterval)(() => {
      const memoryInfo = this.getMemoryInfo()
      if (memoryInfo) {
        this._memoryHistory.push(memoryInfo)
        this._metrics.memoryUsage = memoryInfo.usedJSHeapSize

        // 限制历史记录长度
        if (this._memoryHistory.length > 100) {
          this._memoryHistory.shift()
        }

        // 检查内存泄漏
        if (memoryInfo.memoryUsagePercentage > 80) {
          this._triggerEvent('memoryWarning', memoryInfo)
        }
      }
    }, 1000)
  }

  /**
   * 更新性能指标
   * @param config - 图表配置
   */
  private _updateMetrics(config: ChartConfig): void {
    // 计算数据点数量
    if (Array.isArray(config.data)) {
      this._metrics.dataPointCount = config.data.length
    }

    // 更新其他指标
    this._metrics.seriesCount = 1 // 简化处理
  }

  /**
   * 是否应该使用数据采样
   * @param data - 数据
   * @returns 是否使用采样
   */
  private _shouldUseSampling(data: any[]): boolean {
    return this._config.enableDataSampling &&
      data.length > this._config.largeDataThreshold!
  }

  /**
   * 是否应该使用虚拟滚动
   * @param data - 数据
   * @returns 是否使用虚拟滚动
   */
  private _shouldUseVirtualScrolling(data: any[]): boolean {
    return this._config.enableVirtualScrolling &&
      data.length > this._config.largeDataThreshold!
  }

  /**
   * 是否应该使用渐进式渲染
   * @param data - 数据
   * @returns 是否使用渐进式渲染
   */
  private _shouldUseProgressiveRendering(data: any[]): boolean {
    return this._config.enableProgressiveRendering &&
      data.length > this._config.progressiveThreshold!
  }

  /**
   * 数据采样
   * @param data - 原始数据
   * @returns 采样后的数据
   */
  private _sampleData(data: any[]): any[] {
    const sampleSize = Math.floor(data.length * this._config.samplingRate!)
    const step = Math.floor(data.length / sampleSize)

    const sampledData = []
    for (let i = 0; i < data.length; i += step) {
      sampledData.push(data[i])
    }

    return sampledData
  }

  /**
   * 应用虚拟滚动
   * @param data - 原始数据
   * @returns 虚拟滚动数据
   */
  private _applyVirtualScrolling(data: any[]): any[] {
    // 简化实现，返回窗口大小的数据
    return data.slice(0, this._config.virtualScrollWindowSize)
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param data - 事件数据
   */
  private _triggerEvent(event: string, data: any): void {
    const listeners = this._listeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`性能事件监听器执行失败 (${event}):`, error)
        }
      })
    }
  }
}
