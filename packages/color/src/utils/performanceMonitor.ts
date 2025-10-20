/**
 * @ldesign/color - Performance Monitor
 * 
 * 运行时性能监控工具
 */

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  count: number
}

/**
 * 简单的性能监控器
 * 用于开发和调试时监控性能
 */
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private enabled = false

  /**
   * 启用性能监控
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * 禁用性能监控
   */
  disable(): void {
    this.enabled = false
  }

  /**
   * 开始测量
   */
  start(name: string): void {
    if (!this.enabled) return

    const metric = this.metrics.get(name)
    if (metric) {
      metric.count++
      metric.startTime = performance.now()
    } else {
      this.metrics.set(name, {
        name,
        startTime: performance.now(),
        count: 1
      })
    }
  }

  /**
   * 结束测量
   */
  end(name: string): number | undefined {
    if (!this.enabled) return undefined

    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`[PerformanceMonitor] No metric found for: ${name}`)
      return undefined
    }

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    return metric.duration
  }

  /**
   * 测量函数执行
   */
  measure<T>(name: string, fn: () => T): T {
    if (!this.enabled) return fn()

    this.start(name)
    const result = fn()
    this.end(name)

    return result
  }

  /**
   * 异步测量
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn()

    this.start(name)
    const result = await fn()
    this.end(name)

    return result
  }

  /**
   * 获取指标
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name)
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  /**
   * 获取统计信息
   */
  getStats(name: string): {
    count: number
    avgDuration: number
    lastDuration: number
  } | undefined {
    const metric = this.metrics.get(name)
    if (!metric || !metric.duration) return undefined

    return {
      count: metric.count,
      avgDuration: metric.duration / metric.count,
      lastDuration: metric.duration
    }
  }

  /**
   * 打印报告
   */
  report(): void {
    if (!this.enabled) {
      console.log('[PerformanceMonitor] Disabled')
      return
    }

    console.log('\n=== Performance Report ===\n')

    const metrics = this.getAllMetrics()
      .filter(m => m.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))

    for (const metric of metrics) {
      const avgDuration = (metric.duration || 0) / metric.count
      console.log(`${metric.name}:`)
      console.log(`  Count: ${metric.count}`)
      console.log(`  Total: ${metric.duration?.toFixed(2)}ms`)
      console.log(`  Average: ${avgDuration.toFixed(2)}ms`)
      console.log('')
    }
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * 重置指定指标
   */
  reset(name: string): void {
    this.metrics.delete(name)
  }
}

/**
 * 全局性能监控实例
 */
export const performanceMonitor = new PerformanceMonitor()

/**
 * 性能装饰器（用于类方法）
 */
export function measurePerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value

  descriptor.value = function(...args: any[]) {
    return performanceMonitor.measure(
      `${target.constructor.name}.${propertyKey}`,
      () => originalMethod.apply(this, args)
    )
  }

  return descriptor
}

/**
 * 简单的性能测量函数
 */
export function measure<T>(name: string, fn: () => T): T {
  return performanceMonitor.measure(name, fn)
}

/**
 * 异步性能测量函数
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return performanceMonitor.measureAsync(name, fn)
}

/**
 * 启用性能监控（仅在开发环境）
 */
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  performanceMonitor.enable()
}

export { PerformanceMonitor }

