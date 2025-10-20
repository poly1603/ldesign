/**
 * 性能监控和日志系统
 * 
 * 提供加密操作的性能监控、日志记录和统计分析
 */

export interface PerformanceMetric {
  operation: string
  algorithm: string
  dataSize: number
  duration: number
  timestamp: number
  success: boolean
  error?: string
}

export interface PerformanceStats {
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  totalDuration: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  operationsPerSecond: number
  byAlgorithm: Map<string, {
    count: number
    totalDuration: number
    averageDuration: number
  }>
}

/**
 * 性能日志记录器
 */
export class PerformanceLogger {
  private metrics: PerformanceMetric[] = []
  private maxMetrics: number
  private enabled: boolean
  private readonly startTime: number

  constructor(options: {
    maxMetrics?: number
    enabled?: boolean
  } = {}) {
    this.maxMetrics = options.maxMetrics || 1000
    this.enabled = options.enabled ?? true
    this.startTime = Date.now()
  }

  /**
   * 记录性能指标
   */
  log(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    if (!this.enabled) return

    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    }

    this.metrics.push(fullMetric)

    // 限制存储的指标数量
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }

  /**
   * 测量操作性能
   */
  async measure<T>(
    operation: string,
    algorithm: string,
    dataSize: number,
    fn: () => Promise<T> | T,
  ): Promise<T> {
    const start = performance.now()
    let success = true
    let error: string | undefined

    try {
      const result = await fn()
      return result
    } catch (err) {
      success = false
      error = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      const duration = performance.now() - start
      
      this.log({
        operation,
        algorithm,
        dataSize,
        duration,
        success,
        error,
      })
    }
  }

  /**
   * 获取性能统计
   */
  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        operationsPerSecond: 0,
        byAlgorithm: new Map(),
      }
    }

    const successful = this.metrics.filter(m => m.success)
    const failed = this.metrics.filter(m => !m.success)
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0)
    const durations = this.metrics.map(m => m.duration)

    // 按算法统计
    const byAlgorithm = new Map<string, { count: number, totalDuration: number, averageDuration: number }>()
    
    for (const metric of this.metrics) {
      const current = byAlgorithm.get(metric.algorithm) || {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
      }
      
      current.count++
      current.totalDuration += metric.duration
      current.averageDuration = current.totalDuration / current.count
      
      byAlgorithm.set(metric.algorithm, current)
    }

    // 计算操作速率（基于实际运行时间）
    const runningTime = (Date.now() - this.startTime) / 1000 // 转换为秒
    const operationsPerSecond = runningTime > 0 ? this.metrics.length / runningTime : 0

    return {
      totalOperations: this.metrics.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      totalDuration,
      averageDuration: totalDuration / this.metrics.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      operationsPerSecond,
      byAlgorithm,
    }
  }

  /**
   * 获取最近的指标
   */
  getRecentMetrics(count: number = 10): PerformanceMetric[] {
    return this.metrics.slice(-count)
  }

  /**
   * 获取特定算法的指标
   */
  getMetricsByAlgorithm(algorithm: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.algorithm === algorithm)
  }

  /**
   * 获取失败的操作
   */
  getFailedOperations(): PerformanceMetric[] {
    return this.metrics.filter(m => !m.success)
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics = []
  }

  /**
   * 启用/禁用日志记录
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * 是否启用
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * 导出指标为 JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      stats: this.getStats(),
      metrics: this.metrics,
    }, (key, value) => {
      // 转换 Map 为普通对象
      if (value instanceof Map) {
        return Object.fromEntries(value)
      }
      return value
    }, 2)
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const stats = this.getStats()
    const lines: string[] = []

    lines.push('=== 加密性能报告 ===')
    lines.push(`总操作数: ${stats.totalOperations}`)
    lines.push(`成功: ${stats.successfulOperations} | 失败: ${stats.failedOperations}`)
    lines.push(`成功率: ${((stats.successfulOperations / stats.totalOperations) * 100).toFixed(2)}%`)
    lines.push(`总耗时: ${stats.totalDuration.toFixed(2)}ms`)
    lines.push(`平均耗时: ${stats.averageDuration.toFixed(2)}ms`)
    lines.push(`最小耗时: ${stats.minDuration.toFixed(2)}ms`)
    lines.push(`最大耗时: ${stats.maxDuration.toFixed(2)}ms`)
    lines.push(`操作速率: ${stats.operationsPerSecond.toFixed(2)} ops/s`)
    
    if (stats.byAlgorithm.size > 0) {
      lines.push('\n=== 按算法统计 ===')
      for (const [algo, stat] of stats.byAlgorithm) {
        lines.push(`${algo}:`)
        lines.push(`  操作数: ${stat.count}`)
        lines.push(`  平均耗时: ${stat.averageDuration.toFixed(2)}ms`)
        lines.push(`  占比: ${((stat.count / stats.totalOperations) * 100).toFixed(2)}%`)
      }
    }

    const failed = this.getFailedOperations()
    if (failed.length > 0) {
      lines.push('\n=== 失败操作 ===')
      for (const metric of failed.slice(-5)) {
        lines.push(`${metric.operation} (${metric.algorithm}): ${metric.error}`)
      }
    }

    return lines.join('\n')
  }
}

// 全局性能日志记录器实例
export const globalPerformanceLogger = new PerformanceLogger({
  maxMetrics: 5000,
  enabled: false, // 默认禁用，避免影响生产环境性能
})

/**
 * 性能装饰器（用于类方法）
 */
export function measurePerformance(
  operation: string,
  algorithm: string,
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const dataSize = typeof args[0] === 'string' ? args[0].length : 0
      
      return globalPerformanceLogger.measure(
        operation,
        algorithm,
        dataSize,
        () => originalMethod.apply(this, args),
      )
    }

    return descriptor
  }
}

