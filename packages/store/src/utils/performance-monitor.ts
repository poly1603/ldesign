/**
 * 性能监控工具类
 * 提供更精确和稳定的性能监控功能
 */

// Node.js process 类型声明
declare const process: {
  memoryUsage: () => {
    heapUsed: number
    heapTotal: number
    external: number
  }
} | undefined

export interface PerformanceMetrics {
  /** 执行时间（毫秒） */
  duration: number
  /** 内存使用情况 */
  memory?: {
    used: number
    total: number
    external: number
  }
  /** 时间戳 */
  timestamp: number
  /** 操作名称 */
  operation: string
}

export interface PerformanceStats {
  /** 总执行次数 */
  count: number
  /** 平均执行时间 */
  avgDuration: number
  /** 最小执行时间 */
  minDuration: number
  /** 最大执行时间 */
  maxDuration: number
  /** 总执行时间 */
  totalDuration: number
  /** 最后执行时间 */
  lastExecution: number
}

/**
 * 增强的性能监控器
 */
export class EnhancedPerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics[]> = new Map()
  private marks: Map<string, number> = new Map()
  private stats: Map<string, PerformanceStats> = new Map()

  /**
   * 标记性能测量点
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * 测量两个标记点之间的性能
   */
  measure(name: string, startMark?: string, endMark?: string): PerformanceMetrics {
    const endTime = endMark ? this.marks.get(endMark) : performance.now()
    const startTime = startMark ? this.marks.get(startMark) : this.marks.get(name)

    if (startTime === undefined) {
      throw new Error(`Start mark "${startMark || name}" not found`)
    }

    if (endTime === undefined) {
      throw new Error(`End mark "${endMark}" not found`)
    }

    const duration = endTime - startTime
    const memory = this.getMemoryUsage()

    const metric: PerformanceMetrics = {
      duration,
      memory,
      timestamp: Date.now(),
      operation: name
    }

    // 存储指标
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(metric)

    // 更新统计信息
    this.updateStats(name, duration)

    return metric
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      return {
        used: usage.heapUsed,
        total: usage.heapTotal,
        external: usage.external
      }
    }

    // 浏览器环境的内存估算
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize || 0,
        total: memory.totalJSHeapSize || 0,
        external: 0
      }
    }

    return undefined
  }

  /**
   * 更新统计信息
   */
  private updateStats(name: string, duration: number): void {
    const existing = this.stats.get(name)

    if (!existing) {
      this.stats.set(name, {
        count: 1,
        avgDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        totalDuration: duration,
        lastExecution: Date.now()
      })
    } else {
      const newCount = existing.count + 1
      const newTotal = existing.totalDuration + duration

      this.stats.set(name, {
        count: newCount,
        avgDuration: newTotal / newCount,
        minDuration: Math.min(existing.minDuration, duration),
        maxDuration: Math.max(existing.maxDuration, duration),
        totalDuration: newTotal,
        lastExecution: Date.now()
      })
    }
  }

  /**
   * 获取指定操作的所有指标
   */
  getMetrics(name: string): PerformanceMetrics[] {
    return this.metrics.get(name) || []
  }

  /**
   * 获取指定操作的统计信息
   */
  getStats(name: string): PerformanceStats | undefined {
    return this.stats.get(name)
  }

  /**
   * 获取所有统计信息
   */
  getAllStats(): Map<string, PerformanceStats> {
    return new Map(this.stats)
  }

  /**
   * 清理指定操作的数据
   */
  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name)
      this.marks.delete(name)
      this.stats.delete(name)
    } else {
      this.metrics.clear()
      this.marks.clear()
      this.stats.clear()
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const report: string[] = ['=== 性能监控报告 ===\n']

    for (const [name, stats] of this.stats) {
      report.push(`操作: ${name}`)
      report.push(`  执行次数: ${stats.count}`)
      report.push(`  平均耗时: ${stats.avgDuration.toFixed(2)}ms`)
      report.push(`  最小耗时: ${stats.minDuration.toFixed(2)}ms`)
      report.push(`  最大耗时: ${stats.maxDuration.toFixed(2)}ms`)
      report.push(`  总耗时: ${stats.totalDuration.toFixed(2)}ms`)
      report.push(`  最后执行: ${new Date(stats.lastExecution).toISOString()}`)
      report.push('')
    }

    return report.join('\n')
  }

  /**
   * 异步测量函数执行性能
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.mark(`${name}-start`)
    try {
      const result = await fn()
      this.measure(name, `${name}-start`)
      return result
    } catch (error) {
      this.measure(name, `${name}-start`)
      throw error
    }
  }

  /**
   * 同步测量函数执行性能
   */
  measureSync<T>(name: string, fn: () => T): T {
    this.mark(`${name}-start`)
    try {
      const result = fn()
      this.measure(name, `${name}-start`)
      return result
    } catch (error) {
      this.measure(name, `${name}-start`)
      throw error
    }
  }
}

// 导出单例实例
export const performanceMonitor = new EnhancedPerformanceMonitor()

// 导出装饰器
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const operationName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measureSync(operationName, () => {
        return originalMethod.apply(this, args)
      })
    }

    return descriptor
  }
}

export function measureAsyncPerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const operationName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measureAsync(operationName, () => {
        return originalMethod.apply(this, args)
      })
    }

    return descriptor
  }
}
