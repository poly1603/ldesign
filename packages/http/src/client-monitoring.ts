/**
 * HTTP 客户端监控模块
 * 
 * 提供性能监控、指标统计和分析功能
 */

import type { CacheManager } from './utils/cache'
import type { ConcurrencyManager } from './utils/concurrency'
import type { RequestMonitor } from './utils/monitor'
import type { RequestPool } from './utils/pool'
import type { PriorityQueue } from './utils/priority'

/**
 * 监控指标接口
 */
export interface MonitoringMetrics {
  /** 性能统计 */
  performance: any
  /** 优先级队列统计 */
  priorityQueue?: any
  /** 连接池统计 */
  connectionPool?: any
  /** 并发控制统计 */
  concurrency?: any
  /** 缓存统计 */
  cache?: any
}

/**
 * 监控功能接口
 */
export interface MonitoringOperations {
  /**
   * 获取性能监控统计
   */
  getPerformanceStats: () => any

  /**
   * 获取最近的请求指标
   */
  getRecentMetrics: (count?: number) => any

  /**
   * 获取慢请求列表
   */
  getSlowRequests: () => any

  /**
   * 获取失败请求列表
   */
  getFailedRequests: () => any

  /**
   * 启用性能监控
   */
  enableMonitoring: () => void

  /**
   * 禁用性能监控
   */
  disableMonitoring: () => void

  /**
   * 获取优先级队列统计
   */
  getPriorityQueueStats: () => any

  /**
   * 获取连接池统计
   */
  getConnectionPoolStats: () => any

  /**
   * 获取连接池详情
   */
  getConnectionDetails: () => any

  /**
   * 导出性能指标
   */
  exportMetrics: () => MonitoringMetrics
}

/**
 * 监控处理器
 */
export class MonitoringHandler implements MonitoringOperations {
  constructor(
    private monitor: RequestMonitor,
    private priorityQueue?: PriorityQueue,
    private requestPool?: RequestPool,
    private concurrencyManager?: ConcurrencyManager,
    private cacheManager?: CacheManager,
  ) {}

  /**
   * 获取性能监控统计
   */
  getPerformanceStats() {
    return this.monitor.getStats()
  }

  /**
   * 获取最近的请求指标
   */
  getRecentMetrics(count?: number) {
    return this.monitor.getRecentMetrics(count)
  }

  /**
   * 获取慢请求列表
   */
  getSlowRequests() {
    return this.monitor.getSlowRequests()
  }

  /**
   * 获取失败请求列表
   */
  getFailedRequests() {
    return this.monitor.getFailedRequests()
  }

  /**
   * 启用性能监控
   */
  enableMonitoring() {
    this.monitor.enable()
  }

  /**
   * 禁用性能监控
   */
  disableMonitoring() {
    this.monitor.disable()
  }

  /**
   * 获取优先级队列统计
   */
  getPriorityQueueStats() {
    return this.priorityQueue?.getStats()
  }

  /**
   * 获取连接池统计
   */
  getConnectionPoolStats() {
    return this.requestPool?.getStats()
  }

  /**
   * 获取连接池详情
   */
  getConnectionDetails() {
    return this.requestPool?.getConnectionDetails()
  }

  /**
   * 导出性能指标
   */
  exportMetrics(): MonitoringMetrics {
    return {
      performance: this.monitor.exportMetrics(),
      priorityQueue: this.priorityQueue?.getStats(),
      connectionPool: this.requestPool?.getStats(),
      concurrency: this.concurrencyManager?.getStatus(),
      cache: this.cacheManager?.getStats ? this.cacheManager.getStats() : null,
    }
  }

  /**
   * 清理监控数据
   */
  clearMetrics(): void {
    this.monitor.clear()
  }

  /**
   * 设置监控阈值
   */
  setThresholds(thresholds: {
    slowRequestThreshold?: number
    errorRateThreshold?: number
  }): void {
    if (thresholds.slowRequestThreshold !== undefined) {
      this.monitor.setSlowRequestThreshold(thresholds.slowRequestThreshold)
    }
    if (thresholds.errorRateThreshold !== undefined) {
      // 实现错误率阈值设置
    }
  }

  /**
   * 获取实时性能指标
   */
  getRealtimeMetrics(): {
    requestsPerSecond: number
    averageResponseTime: number
    errorRate: number
    activeRequests: number
  } {
    const stats = this.monitor.getStats()
    const concurrencyStatus = this.concurrencyManager?.getStatus()

    return {
      requestsPerSecond: this.calculateRequestsPerSecond(),
      averageResponseTime: stats.averageResponseTime || 0,
      errorRate: stats.errorRate || 0,
      activeRequests: concurrencyStatus?.activeCount || 0,
    }
  }

  /**
   * 计算每秒请求数
   */
  private calculateRequestsPerSecond(): number {
    const recentMetrics = this.monitor.getRecentMetrics(60) // 最近60个请求
    if (!recentMetrics || recentMetrics.length === 0) {
      return 0
    }

    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const recentRequests = recentMetrics.filter(
      (m: any) => m.timestamp && m.timestamp > oneMinuteAgo
    )

    if (recentRequests.length === 0) {
      return 0
    }

    const firstRequest = recentRequests[0]
    if (!firstRequest?.timestamp) {
      return 0
    }
    const timeSpan = (now - firstRequest.timestamp) / 1000
    return recentRequests.length / timeSpan
  }

  /**
   * 生成性能报告
   */
  generateReport(): {
    summary: any
    details: any
    recommendations: string[]
  } {
    const metrics = this.exportMetrics()
    const stats = this.getPerformanceStats()

    const recommendations: string[] = []

    // 分析并生成建议
    const avgResponseTime = stats.averageResponseTime ?? 0
    if (avgResponseTime > 3000) {
      recommendations.push('Average response time is high. Consider implementing caching or optimizing server endpoints.')
    }

    if (stats.errorRate > 0.05) {
      recommendations.push('Error rate is above 5%. Review error logs and implement retry strategies.')
    }

    if (metrics.cache?.hitRate && metrics.cache.hitRate < 0.3) {
      recommendations.push('Cache hit rate is low. Consider adjusting cache TTL or preloading frequently accessed data.')
    }

    if (metrics.concurrency?.queuedCount && metrics.concurrency.queuedCount > 10) {
      recommendations.push('Many requests are queued. Consider increasing the concurrent request limit.')
    }

    return {
      summary: {
        totalRequests: stats.totalRequests,
        successRate: 1 - stats.errorRate,
        averageResponseTime: stats.averageResponseTime,
        cacheHitRate: metrics.cache?.hitRate || 0,
      },
      details: metrics,
      recommendations,
    }
  }
}

/**
 * 创建监控处理器
 */
export function createMonitoringHandler(
  monitor: RequestMonitor,
  priorityQueue?: PriorityQueue,
  requestPool?: RequestPool,
  concurrencyManager?: ConcurrencyManager,
  cacheManager?: CacheManager,
): MonitoringHandler {
  return new MonitoringHandler(
    monitor,
    priorityQueue,
    requestPool,
    concurrencyManager,
    cacheManager,
  )
}