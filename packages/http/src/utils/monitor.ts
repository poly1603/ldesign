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
}

/**
 * 监控配置
 */
export interface MonitorConfig {
  enabled?: boolean
  maxMetrics?: number // 最大保存的指标数量
  slowRequestThreshold?: number // 慢请求阈值(ms)
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
 * 请求监控器
 */
export class RequestMonitor {
  private metrics: PerformanceMetrics[] = []
  private config: Required<MonitorConfig>
  private requestMap = new Map<string, { startTime: number; retries: number }>()

  constructor(config: MonitorConfig = {}) {
    this.config = {
      enabled: true,
      maxMetrics: 1000,
      slowRequestThreshold: 3000,
      onSlowRequest: () => {},
      onError: () => {},
      onMetricsUpdate: () => {},
      ...config,
    }
  }

  /**
   * 开始监控请求
   */
  startRequest(requestId: string, config: RequestConfig): void {
    if (!this.config.enabled) return

    this.requestMap.set(requestId, {
      startTime: Date.now(),
      retries: 0,
    })
  }

  /**
   * 结束监控请求
   */
  endRequest<T>(
    requestId: string,
    config: RequestConfig,
    response?: ResponseData<T>,
    error?: Error,
  ): void {
    if (!this.config.enabled) return

    const requestInfo = this.requestMap.get(requestId)
    if (!requestInfo) return

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
    }

    this.addMetrics(metrics)
    this.requestMap.delete(requestId)

    // 触发回调
    if (duration > this.config.slowRequestThreshold) {
      this.config.onSlowRequest(metrics)
    }

    if (error) {
      this.config.onError(metrics)
    }

    this.config.onMetricsUpdate(this.metrics)
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
   * 添加指标
   */
  private addMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)

    // 限制保存的指标数量
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics.shift()
    }
  }

  /**
   * 获取响应大小
   */
  private getResponseSize<T>(response?: ResponseData<T>): number {
    if (!response?.data) return 0

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
   * 获取性能统计
   */
  getStats(): PerformanceStats {
    const total = this.metrics.length
    const successful = this.metrics.filter(m => !m.error).length
    const failed = total - successful
    const cached = this.metrics.filter(m => m.cached).length
    const slow = this.metrics.filter(m => m.duration > this.config.slowRequestThreshold).length

    const durations = this.metrics.map(m => m.duration).sort((a, b) => a - b)
    const totalDuration = durations.reduce((sum, d) => sum + d, 0)
    const totalSize = this.metrics.reduce((sum, m) => sum + (m.size || 0), 0)

    const requestsByMethod: Record<string, number> = {}
    const requestsByStatus: Record<number, number> = {}

    for (const metric of this.metrics) {
      // 按方法统计
      requestsByMethod[metric.method] = (requestsByMethod[metric.method] || 0) + 1

      // 按状态码统计
      if (metric.status) {
        requestsByStatus[metric.status] = (requestsByStatus[metric.status] || 0) + 1
      }
    }

    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      cachedRequests: cached,
      averageDuration: total > 0 ? totalDuration / total : 0,
      medianDuration: this.getPercentile(durations, 50),
      p95Duration: this.getPercentile(durations, 95),
      p99Duration: this.getPercentile(durations, 99),
      slowRequests: slow,
      totalDataTransferred: totalSize,
      requestsByMethod,
      requestsByStatus,
      errorRate: total > 0 ? failed / total : 0,
      cacheHitRate: total > 0 ? cached / total : 0,
    }
  }

  /**
   * 获取百分位数
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0
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
    return this.metrics.filter(m => m.duration > this.config.slowRequestThreshold)
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
    this.config.enabled = true
  }

  /**
   * 禁用监控
   */
  disable(): void {
    this.config.enabled = false
  }

  /**
   * 是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled
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
