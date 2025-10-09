/**
 * 性能监控工具
 * 用于监控和分析颜色库的性能指标
 */

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 操作名称 */
  name: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 持续时间（毫秒） */
  duration?: number
  /** 内存使用（字节） */
  memory?: {
    used: number
    total: number
    limit: number
  }
  /** 自定义数据 */
  data?: Record<string, any>
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  /** 总操作数 */
  totalOperations: number
  /** 总耗时 */
  totalDuration: number
  /** 平均耗时 */
  averageDuration: number
  /** 最小耗时 */
  minDuration: number
  /** 最大耗时 */
  maxDuration: number
  /** 操作详情 */
  operations: PerformanceMetrics[]
  /** 内存统计 */
  memoryStats?: {
    average: number
    peak: number
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private history: PerformanceMetrics[] = []
  private maxHistorySize: number

  constructor(maxHistorySize = 1000) {
    this.maxHistorySize = maxHistorySize
  }

  /**
   * 开始监控
   */
  start(name: string, data?: Record<string, any>): void {
    const metric: PerformanceMetrics = {
      name,
      startTime: performance.now(),
      data,
    }

    // 记录内存使用（如果支持）
    if (typeof (performance as any).memory !== 'undefined') {
      const memory = (performance as any).memory
      metric.memory = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      }
    }

    this.metrics.set(name, metric)
  }

  /**
   * 结束监控
   */
  end(name: string): PerformanceMetrics | null {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`性能监控: 未找到名为 "${name}" 的监控项`)
      return null
    }

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    // 更新内存使用
    if (typeof (performance as any).memory !== 'undefined') {
      const memory = (performance as any).memory
      if (metric.memory) {
        metric.memory.used = memory.usedJSHeapSize - metric.memory.used
      }
    }

    // 添加到历史记录
    this.history.push({ ...metric })
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }

    this.metrics.delete(name)
    return metric
  }

  /**
   * 测量函数执行时间
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>,
    data?: Record<string, any>,
  ): Promise<{ result: T, metrics: PerformanceMetrics }> {
    this.start(name, data)

    try {
      const result = await fn()
      const metrics = this.end(name)!
      return { result, metrics }
    }
    catch (error) {
      this.end(name)
      throw error
    }
  }

  /**
   * 获取性能报告
   */
  getReport(filterName?: string): PerformanceReport {
    const operations = filterName
      ? this.history.filter(m => m.name === filterName)
      : this.history

    if (operations.length === 0) {
      return {
        totalOperations: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        operations: [],
      }
    }

    const durations = operations.map(m => m.duration || 0)
    const totalDuration = durations.reduce((sum, d) => sum + d, 0)

    const report: PerformanceReport = {
      totalOperations: operations.length,
      totalDuration,
      averageDuration: totalDuration / operations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      operations,
    }

    // 计算内存统计
    const memoryMetrics = operations.filter(m => m.memory)
    if (memoryMetrics.length > 0) {
      const memoryUsages = memoryMetrics.map(m => m.memory!.used)
      report.memoryStats = {
        average: memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length,
        peak: Math.max(...memoryUsages),
      }
    }

    return report
  }

  /**
   * 清除历史记录
   */
  clear(): void {
    this.history = []
    this.metrics.clear()
  }

  /**
   * 获取当前正在监控的项目
   */
  getActive(): string[] {
    return Array.from(this.metrics.keys())
  }

  /**
   * 导出性能数据
   */
  export(): string {
    return JSON.stringify({
      history: this.history,
      timestamp: new Date().toISOString(),
    }, null, 2)
  }

  /**
   * 打印性能报告
   */
  printReport(filterName?: string): void {
    const report = this.getReport(filterName)

    console.group(`性能报告${filterName ? ` - ${filterName}` : ''}`)
    console.log(`总操作数: ${report.totalOperations}`)
    console.log(`总耗时: ${report.totalDuration.toFixed(2)}ms`)
    console.log(`平均耗时: ${report.averageDuration.toFixed(2)}ms`)
    console.log(`最小耗时: ${report.minDuration.toFixed(2)}ms`)
    console.log(`最大耗时: ${report.maxDuration.toFixed(2)}ms`)

    if (report.memoryStats) {
      console.log(`平均内存: ${(report.memoryStats.average / 1024 / 1024).toFixed(2)}MB`)
      console.log(`峰值内存: ${(report.memoryStats.peak / 1024 / 1024).toFixed(2)}MB`)
    }

    console.groupEnd()
  }
}

/**
 * 全局性能监控器实例
 */
export const globalPerformanceMonitor = new PerformanceMonitor()

/**
 * 性能监控装饰器
 */
export function monitored(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value
    const monitorName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      return globalPerformanceMonitor.measure(
        monitorName,
        () => originalMethod.apply(this, args),
        { args },
      ).then(({ result }) => result)
    }

    return descriptor
  }
}

/**
 * 便捷函数：测量函数执行时间
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>,
): Promise<T> {
  const { result } = await globalPerformanceMonitor.measure(name, fn)
  return result
}

/**
 * 便捷函数：获取性能报告
 */
export function getPerformanceReport(filterName?: string): PerformanceReport {
  return globalPerformanceMonitor.getReport(filterName)
}

/**
 * 便捷函数：打印性能报告
 */
export function printPerformanceReport(filterName?: string): void {
  globalPerformanceMonitor.printReport(filterName)
}

/**
 * 便捷函数：清除性能数据
 */
export function clearPerformanceData(): void {
  globalPerformanceMonitor.clear()
}

/**
 * 性能基准测试
 */
export async function benchmark(
  name: string,
  fn: () => any | Promise<any>,
  iterations = 100,
): Promise<PerformanceReport> {
  const monitor = new PerformanceMonitor()

  for (let i = 0; i < iterations; i++) {
    await monitor.measure(`${name}-${i}`, fn)
  }

  return monitor.getReport()
}

/**
 * 比较两个函数的性能
 */
export async function comparePerformance(
  fn1: { name: string, fn: () => any | Promise<any> },
  fn2: { name: string, fn: () => any | Promise<any> },
  iterations = 100,
): Promise<{
  fn1: PerformanceReport
  fn2: PerformanceReport
  winner: string
  improvement: number
}> {
  const report1 = await benchmark(fn1.name, fn1.fn, iterations)
  const report2 = await benchmark(fn2.name, fn2.fn, iterations)

  const winner = report1.averageDuration < report2.averageDuration ? fn1.name : fn2.name
  const improvement = Math.abs(
    ((report1.averageDuration - report2.averageDuration) / Math.max(report1.averageDuration, report2.averageDuration)) * 100,
  )

  return {
    fn1: report1,
    fn2: report2,
    winner,
    improvement,
  }
}

