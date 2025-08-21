/**
 * 性能监控工具
 * 提供渲染性能指标收集和分析功能
 */

import type {
  PerformanceMonitor as IPerformanceMonitor,
  PerformanceMetrics,
} from '../types'

/**
 * 性能指标项
 */
interface MetricEntry {
  name: string
  value: number
  timestamp: number
  category: string
  metadata?: Record<string, any>
}

/**
 * 性能计时器
 */
interface Timer {
  name: string
  startTime: number
  category: string
  metadata?: Record<string, any>
}

/**
 * 性能统计信息
 */
interface PerformanceStats {
  count: number
  total: number
  average: number
  min: number
  max: number
  p50: number
  p90: number
  p95: number
  p99: number
}

/**
 * 性能监控器实现
 */
export class PerformanceMonitor implements IPerformanceMonitor {
  private metrics: MetricEntry[] = []
  private timers = new Map<string, Timer>()
  private maxMetrics = 1000
  private enableLogging = false
  private categories = new Set<string>()

  constructor(options: {
    maxMetrics?: number
    enableLogging?: boolean
  } = {}) {
    this.maxMetrics = options.maxMetrics || 1000
    this.enableLogging = options.enableLogging || false
  }

  /**
   * 开始计时
   */
  startTiming(name: string, category: string = 'default'): void {
    const timer: Timer = {
      name,
      startTime: performance.now(),
      category,
    }

    this.timers.set(name, timer)
    this.categories.add(category)
    this.log(`Started timer '${name}' in category '${category}'`)
  }

  /**
   * 结束计时
   */
  endTiming(name: string): number {
    const timer = this.timers.get(name)
    if (!timer) {
      console.warn(`Timer '${name}' not found`)
      return 0
    }

    const duration = this.now() - timer.startTime
    this.timers.delete(name)

    this.recordMetric(timer.name, duration, timer.category, timer.metadata || {})
    this.log(`Ended timer '${name}': ${duration.toFixed(2)}ms`)

    return duration
  }

  /**
   * 记录指标
   */
  recordMetric(name: string, value: number, category: string = 'general', metadata?: Record<string, any>): void {
    const entry: MetricEntry = {
      name,
      value,
      timestamp: Date.now(),
      category,
      ...(metadata && { metadata }),
    }

    this.metrics.push(entry)
    this.categories.add(category)

    // 限制指标数量
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    this.log(`Recorded metric '${name}': ${value} (${category})`)
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    const now = Date.now()
    // const oneMinuteAgo = now - 60000
    const fiveMinutesAgo = now - 300000

    // 过滤最近的指标
    const recentMetrics = this.metrics.filter(m => m.timestamp >= fiveMinutesAgo)
    // 过滤最近一分钟的指标（暂未使用）
    // const lastMinuteMetrics = this.metrics.filter(m => m.timestamp >= oneMinuteAgo)

    // 按类别分组（暂未使用）
    // const metricsByCategory = this.groupMetricsByCategory(recentMetrics)

    // 计算统计信息
    const renderTimes = this.getMetricValues(recentMetrics, 'render')
    const loadTimes = this.getMetricValues(recentMetrics, 'load')

    return {
      loadTime: this.average(loadTimes),
      renderTime: this.average(renderTimes),
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: this.calculateCacheHitRate(recentMetrics),
      workerUtilization: 0, // TODO: 实现worker利用率计算
      errorRate: this.getErrorCount(recentMetrics) / Math.max(recentMetrics.length, 1) * 100,
    }
  }

  /**
   * 获取指标统计
   */
  getStats(metricName?: string, category?: string): Record<string, PerformanceStats> {
    let filteredMetrics = this.metrics

    if (metricName) {
      filteredMetrics = filteredMetrics.filter(m => m.name === metricName)
    }

    if (category) {
      filteredMetrics = filteredMetrics.filter(m => m.category === category)
    }

    const statsByName: Record<string, PerformanceStats> = {}

    // 按指标名称分组
    const metricGroups = this.groupBy(filteredMetrics, 'name')

    for (const [name, metrics] of Object.entries(metricGroups)) {
      const values = metrics.map(m => m.value).sort((a, b) => a - b)

      if (values.length > 0) {
        statsByName[name] = {
          count: values.length,
          total: this.sum(values),
          average: this.average(values),
          min: Math.min(...values),
          max: Math.max(...values),
          p50: this.percentile(values, 50),
          p90: this.percentile(values, 90),
          p95: this.percentile(values, 95),
          p99: this.percentile(values, 99),
        }
      }
    }

    return statsByName
  }

  /**
   * 清除指标
   */
  clearMetrics(): void {
    this.metrics = []
    this.timers.clear()
    this.categories.clear()
    this.log('Cleared all metrics')
  }

  /**
   * 导出指标数据
   */
  exportMetrics(): {
    metrics: MetricEntry[]
    stats: Record<string, PerformanceStats>
    summary: PerformanceMetrics
  } {
    return {
      metrics: [...this.metrics],
      stats: this.getStats(),
      summary: this.getMetrics(),
    }
  }

  /**
   * 获取活动计时器
   */
  getActiveTimers(): string[] {
    return Array.from(this.timers.keys())
  }

  /**
   * 获取所有类别
   */
  getCategories(): string[] {
    return Array.from(this.categories)
  }

  /**
   * 设置最大指标数量
   */
  setMaxMetrics(max: number): void {
    this.maxMetrics = max

    // 如果当前指标超过限制，删除旧的
    if (this.metrics.length > max) {
      this.metrics = this.metrics.slice(-max)
    }
  }

  /**
   * 启用/禁用日志
   */
  setLogging(enabled: boolean): void {
    this.enableLogging = enabled
  }

  /**
   * 重置所有指标
   */
  reset(): void {
    this.clearMetrics()
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 获取当前时间（高精度）
   */
  private now(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now()
    }
    return Date.now()
  }

  /**
   * 按类别分组指标
   */
  // private groupMetricsByCategory(metrics: MetricEntry[]): Record<string, number> {
  //   const groups: Record<string, number> = {}
  //
  //   for (const metric of metrics) {
  //     groups[metric.category] = (groups[metric.category] || 0) + 1
  //   }
  //
  //   return groups
  // }

  /**
   * 获取指定类型的指标值
   */
  private getMetricValues(metrics: MetricEntry[], namePattern: string): number[] {
    return metrics
      .filter(m => m.name.toLowerCase().includes(namePattern.toLowerCase()))
      .map(m => m.value)
  }

  /**
   * 计算缓存命中率
   */
  private calculateCacheHitRate(metrics: MetricEntry[]): number {
    const cacheHits = metrics.filter(m => m.name === 'cache_hit').length
    const cacheMisses = metrics.filter(m => m.name === 'cache_miss').length
    const total = cacheHits + cacheMisses

    return total > 0 ? (cacheHits / total) * 100 : 0
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize || 0
    }
    return 0
  }

  /**
   * 获取错误数量
   */
  private getErrorCount(metrics: MetricEntry[]): number {
    return metrics.filter(m => m.name.includes('error')).length
  }

  /**
   * 按属性分组
   */
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key])
      groups[groupKey] = groups[groupKey] || []
      groups[groupKey].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }

  /**
   * 计算数组和
   */
  private sum(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0)
  }

  /**
   * 计算平均值
   */
  private average(values: number[]): number {
    return values.length > 0 ? this.sum(values) / values.length : 0
  }

  /**
   * 计算百分位数
   */
  private percentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0)
      return 0

    const index = (percentile / 100) * (sortedValues.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)

    if (lower === upper) {
      return sortedValues[lower] || 0
    }

    const weight = index - lower
    return (sortedValues[lower] || 0) * (1 - weight) + (sortedValues[upper] || 0) * weight
  }

  /**
   * 日志输出
   */
  private log(message: string, ...args: any[]): void {
    if (this.enableLogging) {
      console.warn(`[PerformanceMonitor] ${message}`, ...args)
    }
  }
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(options?: {
  maxMetrics?: number
  enableLogging?: boolean
}): PerformanceMonitor {
  return new PerformanceMonitor(options)
}

/**
 * 性能装饰器
 */
export function measurePerformance(
  monitor: IPerformanceMonitor,
  _category = 'function',
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const timerName = `${target.constructor.name}.${propertyKey}`
      monitor.startTiming(timerName)

      try {
        const result = originalMethod.apply(this, args)

        if (result instanceof Promise) {
          return result.finally(() => {
            monitor.endTiming(timerName)
          })
        }
        else {
          monitor.endTiming(timerName)
          return result
        }
      }
      catch (error) {
        monitor.endTiming(timerName)
        monitor.recordMetric(`${timerName}_error`, 1)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 测量异步函数性能
 */
export async function measureAsync<T>(
  fn: () => Promise<T>,
  monitor: IPerformanceMonitor,
  name: string,
  _category = 'async',
): Promise<T> {
  monitor.startTiming(name)

  try {
    const result = await fn()
    monitor.endTiming(name)
    return result
  }
  catch (error) {
    monitor.endTiming(name)
    monitor.recordMetric(`${name}_error`, 1)
    throw error
  }
}

/**
 * 默认性能监控器实例
 */
export const defaultPerformanceMonitor = createPerformanceMonitor({
  maxMetrics: 500,
  enableLogging: false,
})
