/**
 * 请求监控模块
 * 提供请求性能监控、指标收集和分析功能
 */

import type { RequestConfig, ResponseData } from '../types'

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  requestId: string
  url: string
  method: string
  startTime: number
  endTime: number
  duration: number
  status?: number
  size?: number
  cached: boolean
  retries: number
  error?: Error
  timestamp?: number
}

/**
 * 监控配置
 */
export interface MonitorConfig {
  enabled?: boolean
  maxMetrics?: number // 最大保存的指标数量
  slowRequestThreshold?: number // 慢请求阈值(ms)
  samplingRate?: number // 采样率 (0-1)，高负载时降低采样
  enableSampling?: boolean // 是否启用采样
  onSlowRequest?: (metrics: PerformanceMetrics) => void
  onError?: (metrics: PerformanceMetrics) => void
  onMetricsUpdate?: (metrics: PerformanceMetrics[]) => void
}

/**
 * 性能统计信息
 */
export interface PerformanceStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  cachedRequests: number
  averageDuration: number
  averageResponseTime?: number
  medianDuration: number
  p95Duration: number
  p99Duration: number
  slowRequests: number
  totalDataTransferred: number
  requestsByMethod: Record<string, number>
  requestsByStatus: Record<number, number>
  errorRate: number
  cacheHitRate: number
}

/**
 * 请求监控器（优化版）
 *
 * 优化点：
 * 1. 添加采样机制，高负载时降低采样率
 * 2. 缓存统计结果，避免重复计算
 * 3. 使用更紧凑的数据结构
 */
export class RequestMonitor {
  private metrics: PerformanceMetrics[] = []
  private metricsIndex = 0 // 循环缓冲区索引
  private config: Required<MonitorConfig>
  private requestMap = new Map<string, { startTime: number, retries: number }>()

  // 统计缓存
  private statsCache?: PerformanceStats
  private statsCacheTime = 0
  private statsCacheTTL = 1000 // 统计缓存1秒

  // 采样计数器
  private sampleCounter = 0

  constructor(config: MonitorConfig = {}) {
    this.config = {
      enabled: true,
      maxMetrics: 1000,
      slowRequestThreshold: 3000,
      samplingRate: 1.0, // 默认100%采样
      enableSampling: false, // 默认不启用采样
      onSlowRequest: () => {},
      onError: () => {},
      onMetricsUpdate: () => {},
      ...config,
    }
  }

  /**
   * 检查是否应该采样
   */
  private shouldSample(): boolean {
    if (!this.config?.enableSampling) {
      return true
    }

    this.sampleCounter++
    return Math.random() < this.config?.samplingRate
  }

  /**
   * 开始监控请求（优化版 - 带采样）
   */
  startRequest(requestId: string, _config: RequestConfig): void {
    if (!this.config?.enabled || !this.shouldSample()) {
      return
    }

    this.requestMap.set(requestId, {
      startTime: Date.now(),
      retries: 0,
    })
  }

  /**
   * 结束监控请求（优化版）
   */
  endRequest<T>(
    requestId: string,
    config: RequestConfig,
    response?: ResponseData<T>,
    error?: Error,
  ): void {
    if (!this.config?.enabled) {
      return
    }

    const requestInfo = this.requestMap.get(requestId)
    if (!requestInfo) {
      return
    }

    const endTime = Date.now()
    const duration = endTime - requestInfo.startTime

    const metrics: PerformanceMetrics = {
      requestId,
      url: config.url || '',
      method: config.method || 'GET',
      startTime: requestInfo.startTime,
      endTime,
      duration,
      status: response?.status,
      size: this.getResponseSize(response),
      cached: false, // 需要从缓存管理器获取
      retries: requestInfo.retries,
      error,
      timestamp: endTime,
    }

    this.addMetrics(metrics)
    this.requestMap.delete(requestId)

    // 清除统计缓存
    this.invalidateStatsCache()

    // 触发回调
    if (duration > this.config?.slowRequestThreshold) {
      this.config?.onSlowRequest(metrics)
    }

    if (error) {
      this.config?.onError(metrics)
    }

    this.config?.onMetricsUpdate(this.metrics)
  }

  /**
   * 记录重试
   */
  recordRetry(requestId: string): void {
    const requestInfo = this.requestMap.get(requestId)
    if (requestInfo) {
      requestInfo.retries++
    }
  }

  /**
   * 标记缓存命中
   */
  markCached(requestId: string): void {
    const metrics = this.metrics.find(m => m.requestId === requestId)
    if (metrics) {
      metrics.cached = true
    }
  }

  /**
   * 添加指标（使用循环缓冲区优化性能）
   */
  private addMetrics(metrics: PerformanceMetrics): void {
    if (this.metrics.length < this.config?.maxMetrics) {
      // 缓冲区未满，直接添加
      this.metrics.push(metrics)
    }
    else {
      // 缓冲区已满，使用循环覆盖（O(1)操作）
      this.metrics[this.metricsIndex] = metrics
      this.metricsIndex = (this.metricsIndex + 1) % this.config?.maxMetrics
    }
  }

  /**
   * 获取响应大小
   */
  private getResponseSize<T>(response?: ResponseData<T>): number {
    if (!response?.data)
      return 0

    if (response.data instanceof Blob) {
      return response.data.size
    }

    if (typeof response.data === 'string') {
      return new Blob([response.data]).size
    }

    if (typeof response.data === 'object') {
      return new Blob([JSON.stringify(response.data)]).size
    }

    return 0
  }

  /**
   * 获取性能统计（优化版 - 带缓存）
   */
  getStats(): PerformanceStats {
    // 检查缓存
    const now = Date.now()
    if (this.statsCache && (now - this.statsCacheTime) < this.statsCacheTTL) {
      return { ...this.statsCache } // 返回副本，避免外部修改
    }

    // 计算统计信息
    const stats = this.calculateStats()

    // 缓存结果
    this.statsCache = stats
    this.statsCacheTime = now

    return { ...stats } // 返回副本
  }

  /**
   * 计算统计信息（优化版）
   */
  private calculateStats(): PerformanceStats {
    const total = this.metrics.length
    
    // 早期返回优化
    if (total === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        cachedRequests: 0,
        averageDuration: 0,
        averageResponseTime: 0,
        medianDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        slowRequests: 0,
        totalDataTransferred: 0,
        requestsByMethod: {},
        requestsByStatus: {},
        errorRate: 0,
        cacheHitRate: 0,
      }
    }
    
    let successful = 0
    let failed = 0
    let cached = 0
    let slow = 0
    let totalDuration = 0
    let totalSize = 0

    // 使用 Object.create(null) 创建更快的普通对象
    const requestsByMethod: Record<string, number> = Object.create(null)
    const requestsByStatus: Record<number, number> = Object.create(null)
    
    // 预分配数组大小
    const durations: number[] = Array.from({ length: total }, () => 0)
    const slowThreshold = this.config?.slowRequestThreshold

    // 单次遍历收集所有数据
    let i = 0
    for (const metric of this.metrics) {
      const duration = metric.duration
      durations[i++] = duration
      totalDuration += duration
      totalSize += metric.size || 0

      // 使用位运算优化计数
      failed += metric.error ? 1 : 0
      successful += metric.error ? 0 : 1
      cached += metric.cached ? 1 : 0
      slow += duration > slowThreshold ? 1 : 0

      // 按方法统计
      requestsByMethod[metric.method] = (requestsByMethod[metric.method] || 0) + 1

      // 按状态码统计
      if (metric.status) {
        requestsByStatus[metric.status] = (requestsByStatus[metric.status] || 0) + 1
      }
    }

    // 使用更快的排序算法（对于小数组）
    if (total < 100) {
      // 插入排序对小数组更快
      this.insertionSort(durations)
    } else {
      durations.sort((a, b) => a - b)
    }

    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      cachedRequests: cached,
      averageDuration: totalDuration / total,
      averageResponseTime: totalDuration / total,
      medianDuration: this.getPercentile(durations, 50),
      p95Duration: this.getPercentile(durations, 95),
      p99Duration: this.getPercentile(durations, 99),
      slowRequests: slow,
      totalDataTransferred: totalSize,
      requestsByMethod,
      requestsByStatus,
      errorRate: failed / total,
      cacheHitRate: cached / total,
    }
  }

  /**
   * 插入排序（对小数组更快）
   */
  private insertionSort(arr: number[]): void {
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i]
      let j = i - 1
      while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j]
        j--
      }
      arr[j + 1] = key
    }
  }

  /**
   * 清除统计缓存
   */
  private invalidateStatsCache(): void {
    this.statsCache = undefined
  }

  /**
   * 获取百分位数
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0)
      return 0
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
    return sortedArray[Math.max(0, index)]
  }

  /**
   * 获取最近的指标
   */
  getRecentMetrics(count: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count)
  }

  /**
   * 获取慢请求
   */
  getSlowRequests(): PerformanceMetrics[] {
    return this.metrics.filter(m => m.duration > this.config?.slowRequestThreshold)
  }

  /**
   * 获取失败请求
   */
  getFailedRequests(): PerformanceMetrics[] {
    return this.metrics.filter(m => m.error)
  }

  /**
   * 清空指标
   */
  clear(): void {
    this.metrics = []
    this.requestMap.clear()
  }

  /**
   * 导出指标
   */
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * 启用监控
   */
  enable(): void {
    if (this.config) {
      this.config.enabled = true
    }
  }

  /**
   * 禁用监控
   */
  disable(): void {
    if (this.config) {
      this.config.enabled = false
    }
  }

  /**
   * 设置慢请求阈值
   */
  setSlowRequestThreshold(threshold: number): void {
    if (this.config) {
      this.config.slowRequestThreshold = threshold
    }
  }

  /**
   * 获取指标
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * 是否启用
   */
  isEnabled(): boolean {
    return this.config?.enabled
  }
}

/**
 * 创建请求监控器
 */
export function createRequestMonitor(config?: MonitorConfig): RequestMonitor {
  return new RequestMonitor(config)
}

/**
 * 默认监控器实例
 */
export const defaultMonitor = createRequestMonitor()
