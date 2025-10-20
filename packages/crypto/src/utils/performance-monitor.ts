/**
 * 性能监控和优化工具
 */

import type { EncryptionAlgorithm } from '../types'
import process from 'node:process'

/**
 * 性能指标接口
 */
export interface PerformanceMetric {
  /** 操作名称 */
  operation: string
  /** 算法类型 */
  algorithm?: EncryptionAlgorithm
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 执行时长（毫秒） */
  duration: number
  /** 数据大小（字节） */
  dataSize?: number
  /** 吞吐量（字节/秒） */
  throughput?: number
  /** 内存使用（字节） */
  memoryUsage?: number
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
}

/**
 * 性能报告接口
 */
export interface PerformanceReport {
  /** 总操作数 */
  totalOperations: number
  /** 成功操作数 */
  successfulOperations: number
  /** 失败操作数 */
  failedOperations: number
  /** 平均执行时长（毫秒） */
  averageDuration: number
  /** 最小执行时长（毫秒） */
  minDuration: number
  /** 最大执行时长（毫秒） */
  maxDuration: number
  /** 总数据处理量（字节） */
  totalDataProcessed: number
  /** 平均吞吐量（字节/秒） */
  averageThroughput: number
  /** 按算法分组的统计 */
  byAlgorithm: Map<string, AlgorithmStats>
  /** 按操作分组的统计 */
  byOperation: Map<string, OperationStats>
  /** 时间段统计 */
  timeSeriesData: TimeSeriesData[]
}

/**
 * 算法统计接口
 */
export interface AlgorithmStats {
  algorithm: string
  count: number
  averageDuration: number
  totalDataProcessed: number
  successRate: number
}

/**
 * 操作统计接口
 */
export interface OperationStats {
  operation: string
  count: number
  averageDuration: number
  successRate: number
}

/**
 * 时间序列数据接口
 */
export interface TimeSeriesData {
  timestamp: number
  operationsPerSecond: number
  averageLatency: number
  errorRate: number
}

/**
 * 性能监控器配置
 */
export interface PerformanceMonitorConfig {
  /** 是否启用监控 */
  enabled: boolean
  /** 最大存储的指标数量 */
  maxMetrics: number
  /** 采样率（0-1） */
  samplingRate: number
  /** 是否记录内存使用 */
  trackMemory: boolean
  /** 是否自动清理旧数据 */
  autoCleanup: boolean
  /** 清理阈值（毫秒） */
  cleanupThreshold: number
  /** 是否启用实时监控 */
  realTimeMonitoring: boolean
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private config: PerformanceMonitorConfig
  private startTimes = new Map<string, number>()
  private realTimeCallbacks: Set<(metric: PerformanceMetric) => void> = new Set()
  private cleanupInterval?: NodeJS.Timeout

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    this.config = {
      enabled: true,
      maxMetrics: 10000,
      samplingRate: 1,
      trackMemory: false,
      autoCleanup: true,
      cleanupThreshold: 3600000, // 1 hour
      realTimeMonitoring: false,
      ...config,
    }

    if (this.config?.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 开始监控操作
   */
  startOperation(operationId: string, _algorithm?: EncryptionAlgorithm): void {
    if (!this.config?.enabled || Math.random() > this.config?.samplingRate) {
      return
    }

    this.startTimes.set(operationId, performance.now())
  }

  /**
   * 结束监控操作
   */
  endOperation(
    operationId: string,
    operation: string,
    success: boolean = true,
    dataSize?: number,
    error?: string,
    algorithm?: EncryptionAlgorithm,
  ): void {
    if (!this.config?.enabled || !this.startTimes.has(operationId)) {
      return
    }

    const startTime = this.startTimes.get(operationId)
    if (!startTime) {
      return
    }
    const endTime = performance.now()
    const duration = endTime - startTime

    const metric: PerformanceMetric = {
      operation,
      algorithm,
      startTime,
      endTime,
      duration,
      dataSize,
      throughput: dataSize ? (dataSize / duration) * 1000 : undefined,
      memoryUsage: this.config?.trackMemory ? this.getMemoryUsage() : undefined,
      success,
      error,
    }

    this.addMetric(metric)
    this.startTimes.delete(operationId)

    // 触发实时监控回调
    if (this.config?.realTimeMonitoring) {
      this.notifyRealTimeListeners(metric)
    }
  }

  /**
   * 记录指标
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)

    // 限制存储的指标数量
    if (this.metrics.length > this.config?.maxMetrics) {
      this.metrics.shift()
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number | undefined {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }
 else if (typeof performance !== 'undefined') {
      const perf = performance as unknown as { memory?: { usedJSHeapSize: number } }
      return perf.memory?.usedJSHeapSize
    }
    return undefined
  }

  /**
   * 生成性能报告
   */
  generateReport(since?: number): PerformanceReport {
    const filteredMetrics = since
      ? this.metrics.filter(m => m.startTime >= since)
      : this.metrics

    const successfulMetrics = filteredMetrics.filter(m => m.success)
    const failedMetrics = filteredMetrics.filter(m => !m.success)

    const durations = filteredMetrics.map(m => m.duration)
    const totalDataProcessed = filteredMetrics.reduce(
      (sum, m) => sum + (m.dataSize || 0),
      0,
    )

    // 按算法分组统计
    const byAlgorithm = this.groupByAlgorithm(filteredMetrics)

    // 按操作分组统计
    const byOperation = this.groupByOperation(filteredMetrics)

    // 生成时间序列数据
    const timeSeriesData = this.generateTimeSeriesData(filteredMetrics)

    return {
      totalOperations: filteredMetrics.length,
      successfulOperations: successfulMetrics.length,
      failedOperations: failedMetrics.length,
      averageDuration: this.average(durations),
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalDataProcessed,
      averageThroughput: this.calculateAverageThroughput(filteredMetrics),
      byAlgorithm,
      byOperation,
      timeSeriesData,
    }
  }

  /**
   * 按算法分组统计
   */
  private groupByAlgorithm(metrics: PerformanceMetric[]): Map<string, AlgorithmStats> {
    const grouped = new Map<string, AlgorithmStats>()

    for (const metric of metrics) {
      const algorithm = metric.algorithm || 'unknown'

      if (!grouped.has(algorithm)) {
        grouped.set(algorithm, {
          algorithm,
          count: 0,
          averageDuration: 0,
          totalDataProcessed: 0,
          successRate: 0,
        })
      }

      const stats = grouped.get(algorithm)
      if (!stats) continue
      stats.count++
      stats.totalDataProcessed += metric.dataSize || 0

      // 更新平均时长（累积平均）
      stats.averageDuration
        = (stats.averageDuration * (stats.count - 1) + metric.duration) / stats.count

      // 更新成功率
      const successCount = metrics
        .filter(m => m.algorithm === algorithm && m.success)
        .length
      stats.successRate = successCount / stats.count
    }

    return grouped
  }

  /**
   * 按操作分组统计
   */
  private groupByOperation(metrics: PerformanceMetric[]): Map<string, OperationStats> {
    const grouped = new Map<string, OperationStats>()

    for (const metric of metrics) {
      const operation = metric.operation

      if (!grouped.has(operation)) {
        grouped.set(operation, {
          operation,
          count: 0,
          averageDuration: 0,
          successRate: 0,
        })
      }

      const stats = grouped.get(operation)
      if (!stats) continue
      stats.count++

      // 更新平均时长
      stats.averageDuration
        = (stats.averageDuration * (stats.count - 1) + metric.duration) / stats.count

      // 更新成功率
      const successCount = metrics
        .filter(m => m.operation === operation && m.success)
        .length
      stats.successRate = successCount / stats.count
    }

    return grouped
  }

  /**
   * 生成时间序列数据
   */
  private generateTimeSeriesData(metrics: PerformanceMetric[]): TimeSeriesData[] {
    if (metrics.length === 0) { return [] }

    const timeSeriesData: TimeSeriesData[] = []
    const interval = 60000 // 1 minute intervals

    const minTime = Math.min(...metrics.map(m => m.startTime))
    const maxTime = Math.max(...metrics.map(m => m.endTime))

    for (let time = minTime; time <= maxTime; time += interval) {
      const windowMetrics = metrics.filter(
        m => m.startTime >= time && m.startTime < time + interval,
      )

      if (windowMetrics.length > 0) {
        const operationsPerSecond = (windowMetrics.length / interval) * 1000
        const averageLatency = this.average(windowMetrics.map(m => m.duration))
        const errorRate = windowMetrics.filter(m => !m.success).length / windowMetrics.length

        timeSeriesData.push({
          timestamp: time,
          operationsPerSecond,
          averageLatency,
          errorRate,
        })
      }
    }

    return timeSeriesData
  }

  /**
   * 计算平均值
   */
  private average(values: number[]): number {
    if (values.length === 0) { return 0 }
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  /**
   * 计算平均吞吐量
   */
  private calculateAverageThroughput(metrics: PerformanceMetric[]): number {
    const validMetrics = metrics.filter(m => m.throughput !== undefined)
    if (validMetrics.length === 0) { return 0 }

    const throughputs = validMetrics.map(m => m.throughput).filter((t): t is number => t !== undefined)
    return this.average(throughputs)
  }

  /**
   * 清理旧数据
   */
  cleanup(olderThan?: number): void {
    const threshold = olderThan || Date.now() - this.config?.cleanupThreshold
    this.metrics = this.metrics.filter(m => m.startTime >= threshold)
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, this.config?.cleanupThreshold)
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }
  }

  /**
   * 注册实时监控回调
   */
  onRealTimeMetric(callback: (metric: PerformanceMetric) => void): () => void {
    this.realTimeCallbacks.add(callback)
    return () => {
      this.realTimeCallbacks.delete(callback)
    }
  }

  /**
   * 通知实时监控监听器
   */
  private notifyRealTimeListeners(metric: PerformanceMetric): void {
    this.realTimeCallbacks.forEach((callback) => {
      try {
        callback(metric)
      }
 catch (error) {
        console.error('Error in real-time metric callback:', error)
      }
    })
  }

  /**
   * 重置监控器
   */
  reset(): void {
    this.metrics = []
    this.startTimes.clear()
  }

  /**
   * 获取当前指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * 导出指标数据
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2)
  }

  /**
   * 导入指标数据
   */
  importMetrics(data: string): void {
    try {
      const imported = JSON.parse(data) as PerformanceMetric[]
      this.metrics = [...this.metrics, ...imported]
    }
 catch (error) {
      console.error('Failed to import metrics:', error)
    }
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stopAutoCleanup()
    this.reset()
    this.realTimeCallbacks.clear()
  }
}

// 全局单例实例
export const performanceMonitor = new PerformanceMonitor()

/**
 * 性能测量装饰器
 */
export function measurePerformance(
  target: unknown,
  propertyName: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: unknown[]) {
    const operationId = `${propertyName}_${Date.now()}`
    performanceMonitor.startOperation(operationId)

    try {
      const result = await originalMethod.apply(this, args)
      performanceMonitor.endOperation(
        operationId,
        propertyName,
        true,
        JSON.stringify(args[0]).length,
      )
      return result
    }
 catch (error) {
      performanceMonitor.endOperation(
        operationId,
        propertyName,
        false,
        undefined,
        error instanceof Error ? error.message : 'Unknown error',
      )
      throw error
    }
  }

  return descriptor
}
