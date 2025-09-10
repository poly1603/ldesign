/**
 * 性能监控工具函数
 */

import type { BenchmarkResult } from '../types'
import { performance } from 'node:perf_hooks'
import { PerformanceMonitor } from './performance-monitor'

/**
 * 性能工具类
 */
export class PerformanceUtils {
  private static defaultMonitor: PerformanceMonitor | null = null

  /**
   * 获取默认性能监控器
   */
  private static getDefaultMonitor(): PerformanceMonitor {
    if (!this.defaultMonitor) {
      this.defaultMonitor = new PerformanceMonitor()
    }
    return this.defaultMonitor
  }

  /**
   * 快速计时
   */
  static time<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()

    process.stdout.write(`${name}: ${(end - start).toFixed(2)}ms\n`)
    return result
  }

  /**
   * 快速异步计时
   */
  static async timeAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()

    process.stdout.write(`${name}: ${(end - start).toFixed(2)}ms\n`)
    return result
  }

  /**
   * 创建计时器装饰器
   */
  static createTimerDecorator(name?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value
      const timerName = name || `${target.constructor.name}.${propertyKey}`

      descriptor.value = function (...args: any[]) {
        return PerformanceUtils.time(timerName, () => originalMethod.apply(this, args))
      }

      return descriptor
    }
  }

  /**
   * 创建异步计时器装饰器
   */
  static createAsyncTimerDecorator(name?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value
      const timerName = name || `${target.constructor.name}.${propertyKey}`

      descriptor.value = function (...args: any[]) {
        return PerformanceUtils.timeAsync(timerName, () => originalMethod.apply(this, args))
      }

      return descriptor
    }
  }

  /**
   * 快速基准测试
   */
  static async quickBenchmark(
    name: string,
    fn: () => void | Promise<void>,
    iterations = 1000,
  ): Promise<BenchmarkResult> {
    const monitor = this.getDefaultMonitor()
    return monitor.benchmark(name, fn, { iterations })
  }

  /**
   * 比较函数性能
   */
  static async compareFunctions<T>(
    functions: Array<{ name: string, fn: () => T | Promise<T> }>,
    iterations = 1000,
  ): Promise<Array<BenchmarkResult & { rank: number }>> {
    const results: BenchmarkResult[] = []

    for (const { name, fn } of functions) {
      const result = await this.quickBenchmark(name, async () => { await Promise.resolve(fn()) }, iterations)
      results.push(result)
    }

    // 按平均时间排序
    const sorted = results
      .sort((a, b) => a.averageTime - b.averageTime)
      .map((result, index) => ({ ...result, rank: index + 1 }))

    return sorted
  }

  /**
   * 内存使用分析
   */
  static analyzeMemoryUsage(): {
    current: NodeJS.MemoryUsage
    formatted: {
      rss: string
      heapTotal: string
      heapUsed: string
      external: string
      heapUsagePercent: number
    }
  } {
    const memory = process.memoryUsage()

    return {
      current: memory,
      formatted: {
        rss: this.formatBytes(memory.rss),
        heapTotal: this.formatBytes(memory.heapTotal),
        heapUsed: this.formatBytes(memory.heapUsed),
        external: this.formatBytes(memory.external),
        heapUsagePercent: Math.round((memory.heapUsed / memory.heapTotal) * 100),
      },
    }
  }

  /**
   * CPU 使用分析
   */
  static analyzeCPUUsage(previousUsage?: NodeJS.CpuUsage): {
    current: NodeJS.CpuUsage
    percentage?: {
      user: number
      system: number
      total: number
    }
  } {
    const current = process.cpuUsage(previousUsage)

    let percentage: { user: number, system: number, total: number } | undefined

    if (previousUsage) {
      const totalTime = current.user + current.system
      percentage = {
        user: (current.user / totalTime) * 100,
        system: (current.system / totalTime) * 100,
        total: totalTime / 1000, // 转换为毫秒
      }
    }

    return { current, percentage }
  }

  /**
   * 事件循环延迟测量
   */
  static measureEventLoopDelay(duration = 1000): Promise<{
    min: number
    max: number
    mean: number
    stddev: number
    percentiles: Record<string, number>
  }> {
    return new Promise((resolve) => {
      ; (async () => {
        const { monitorEventLoopDelay } = await import('node:perf_hooks')
        const histogram = monitorEventLoopDelay({ resolution: 20 })

        histogram.enable()

        setTimeout(() => {
          histogram.disable()

          resolve({
            min: histogram.min,
            max: histogram.max,
            mean: histogram.mean,
            stddev: histogram.stddev,
            percentiles: {
              p50: histogram.percentile(50),
              p90: histogram.percentile(90),
              p95: histogram.percentile(95),
              p99: histogram.percentile(99),
            },
          })
        }, duration)
      })()
    })
  }

  /**
   * 垃圾回收监控
   */
  static monitorGarbageCollection(): {
    start: () => void
    stop: () => void
    getStats: () => Array<{
      type: string
      duration: number
      timestamp: Date
    }>
  } {
    const gcStats: Array<{
      type: string
      duration: number
      timestamp: Date
    }> = []

    let observer: any = null

    return {
      start: () => {
        try {
          void import('node:perf_hooks')
            .then(({ PerformanceObserver }) => {
              observer = new PerformanceObserver((list: any) => {
                const entries = list.getEntries()
                entries.forEach((entry: any) => {
                  if (entry.entryType === 'gc') {
                    gcStats.push({
                      type: this.getGCType(entry.kind),
                      duration: entry.duration,
                      timestamp: new Date(),
                    })
                  }
                })
              })

              observer.observe({ entryTypes: ['gc'] })
            })
            .catch((error) => {
              console.warn('GC monitoring not available:', error)
            })
        }
        catch (error) {
          console.warn('GC monitoring not available:', error)
        }
      },

      stop: () => {
        if (observer) {
          observer.disconnect()
          observer = null
        }
      },

      getStats: () => [...gcStats],
    }
  }

  /**
   * 性能分析器
   */
  static createProfiler() {
    const timers = new Map<string, number>()
    const results = new Map<string, number[]>()

    return {
      start: (name: string) => {
        timers.set(name, performance.now())
      },

      end: (name: string) => {
        const startTime = timers.get(name)
        if (!startTime) {
          throw new Error(`Timer "${name}" not found`)
        }

        const duration = performance.now() - startTime
        timers.delete(name)

        if (!results.has(name)) {
          results.set(name, [])
        }
        results.get(name)!.push(duration)

        return duration
      },

      getResults: () => {
        const summary = new Map<
          string,
          {
            count: number
            total: number
            average: number
            min: number
            max: number
          }
        >()

        for (const [name, times] of results) {
          summary.set(name, {
            count: times.length,
            total: times.reduce((a, b) => a + b, 0),
            average: times.reduce((a, b) => a + b, 0) / times.length,
            min: Math.min(...times),
            max: Math.max(...times),
          })
        }

        return Object.fromEntries(summary)
      },

      reset: () => {
        timers.clear()
        results.clear()
      },
    }
  }

  /**
   * 资源使用监控
   */
  static createResourceMonitor(interval = 1000) {
    const samples: Array<{
      timestamp: Date
      memory: NodeJS.MemoryUsage
      cpu: NodeJS.CpuUsage
    }> = []

    let monitoring = false
    let intervalId: NodeJS.Timeout | null = null
    let lastCpuUsage = process.cpuUsage()

    return {
      start: () => {
        if (monitoring)
          return

        monitoring = true
        intervalId = setInterval(() => {
          const currentCpuUsage = process.cpuUsage(lastCpuUsage)

          samples.push({
            timestamp: new Date(),
            memory: process.memoryUsage(),
            cpu: currentCpuUsage,
          })

          lastCpuUsage = process.cpuUsage()
        }, interval)
      },

      stop: () => {
        if (!monitoring)
          return

        monitoring = false
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      },

      getSamples: () => [...samples],

      getStats: () => {
        if (samples.length === 0) {
          return null
        }

        const memoryStats = {
          rss: this.calculateStats(samples.map(s => s.memory.rss)),
          heapTotal: this.calculateStats(samples.map(s => s.memory.heapTotal)),
          heapUsed: this.calculateStats(samples.map(s => s.memory.heapUsed)),
          external: this.calculateStats(samples.map(s => s.memory.external)),
        }

        const cpuStats = {
          user: this.calculateStats(samples.map(s => s.cpu.user)),
          system: this.calculateStats(samples.map(s => s.cpu.system)),
        }

        return { memory: memoryStats, cpu: cpuStats }
      },

      reset: () => {
        samples.length = 0
      },
    }
  }

  /**
   * 格式化字节数
   */
  private static formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  /**
   * 获取 GC 类型
   */
  private static getGCType(kind: number): string {
    const types = {
      1: 'Scavenge',
      2: 'Mark-Sweep-Compact',
      4: 'Incremental Marking',
      8: 'Weak Callbacks',
      15: 'All',
    }
    return types[kind as keyof typeof types] || 'Unknown'
  }

  /**
   * 计算统计信息
   */
  private static calculateStats(values: number[]) {
    if (values.length === 0) {
      return { min: 0, max: 0, avg: 0, total: 0 }
    }

    const sorted = values.sort((a, b) => a - b)
    const total = values.reduce((a, b) => a + b, 0)

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: total / values.length,
      total,
    }
  }
}
