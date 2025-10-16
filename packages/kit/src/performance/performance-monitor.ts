/**
 * 性能监控器
 */

import type {
  BenchmarkResult,
  CPUSnapshot,
  MemorySnapshot,
  PerformanceConfig,
  PerformanceMetrics,
} from '../types'
import { performance, PerformanceObserver } from 'node:perf_hooks'
import { cpuUsage, memoryUsage } from 'node:process'

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private config: Required<PerformanceConfig>
  private timers: Map<string, number> = new Map()
  private metrics: PerformanceMetrics[] = []
  private observer: PerformanceObserver | null = null

  constructor(config: PerformanceConfig = {}) {
    this.config = {
      maxMetrics: config.maxMetrics ?? 1000,
      enableGC: config.enableGC ?? false,
      enableMemory: config.enableMemory ?? true,
      enableCPU: config.enableCPU ?? true,
      sampleInterval: config.sampleInterval ?? 1000,
      ...config,
    }

    this.setupObserver()
  }

  /**
   * 开始计时
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now())
    performance.mark(`${name}-start`)
  }

  /**
   * 结束计时
   */
  endTimer(name: string): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      throw new Error(`Timer "${name}" not found`)
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)

    this.timers.delete(name)
    this.recordMetric({
      name,
      type: 'timer',
      value: duration,
      timestamp: new Date(),
      unit: 'ms',
    })

    return duration
  }

  /**
   * 测量函数执行时间
   */
  async measureFunction<T>(
    name: string,
    fn: () => T | Promise<T>,
  ): Promise<{ result: T, duration: number }> {
    this.startTimer(name)

    try {
      const result = await fn()
      const duration = this.endTimer(name)
      return { result, duration }
    }
    catch (error) {
      this.endTimer(name)
      throw error
    }
  }

  /**
   * 测量异步函数执行时间
   */
  async measureAsync<T>(
    name: string,
    promise: Promise<T>,
  ): Promise<{ result: T, duration: number }> {
    this.startTimer(name)

    try {
      const result = await promise
      const duration = this.endTimer(name)
      return { result, duration }
    }
    catch (error) {
      this.endTimer(name)
      throw error
    }
  }

  /**
   * 创建性能装饰器
   */
  createDecorator(name?: string) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value
      const timerName = name || `${target.constructor.name}.${propertyKey}`

      descriptor.value = async function (...args: any[]) {
        const monitor = new PerformanceMonitor()
        return monitor.measureFunction(timerName, () => originalMethod.apply(this, args))
      }

      return descriptor
    }
  }

  /**
   * 获取内存快照
   */
  getMemorySnapshot(): MemorySnapshot {
    const memory = memoryUsage()

    return {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
      arrayBuffers: memory.arrayBuffers,
      timestamp: new Date(),
    }
  }

  /**
   * 获取 CPU 快照
   */
  getCPUSnapshot(): CPUSnapshot {
    const cpu = cpuUsage()

    return {
      user: cpu.user,
      system: cpu.system,
      timestamp: new Date(),
    }
  }

  /**
   * 开始监控
   */
  startMonitoring(): void {
    if (this.config?.enableMemory || this.config?.enableCPU) {
      const interval = setInterval(() => {
        if (this.config?.enableMemory) {
          const memory = this.getMemorySnapshot()
          this.recordMetric({
            name: 'memory.heapUsed',
            type: 'memory',
            value: memory.heapUsed,
            timestamp: memory.timestamp,
            unit: 'bytes',
          })
        }

        if (this.config?.enableCPU) {
          const cpu = this.getCPUSnapshot()
          this.recordMetric({
            name: 'cpu.user',
            type: 'cpu',
            value: cpu.user,
            timestamp: cpu.timestamp,
            unit: 'microseconds',
          })
        }
      }, this.config?.sampleInterval)

      // 存储 interval ID 以便后续清理
      ;(this as any).monitoringInterval = interval
    }
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if ((this as any).monitoringInterval) {
      clearInterval((this as any).monitoringInterval)
      delete (this as any).monitoringInterval
    }

    if (this.observer) {
      this.observer.disconnect()
    }
  }

  /**
   * 运行基准测试
   */
  async benchmark(
    name: string,
    fn: () => void | Promise<void>,
    options: {
      iterations?: number
      warmup?: number
      timeout?: number
    } = {},
  ): Promise<BenchmarkResult> {
    const { iterations = 1000, warmup = 100, timeout = 30000 } = options

    const results: number[] = []
    const startTime = Date.now()

    // 预热
    for (let i = 0; i < warmup; i++) {
      await fn()

      if (Date.now() - startTime > timeout) {
        throw new Error('Benchmark timeout during warmup')
      }
    }

    // 正式测试
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      await fn()
      const end = performance.now()

      results.push(end - start)

      if (Date.now() - startTime > timeout) {
        throw new Error('Benchmark timeout')
      }
    }

    // 计算统计信息
    const sorted = results.sort((a, b) => a - b)
    const sum = results.reduce((a, b) => a + b, 0)

    return {
      name,
      iterations: results.length,
      totalTime: sum,
      averageTime: sum / results.length,
      minTime: sorted[0] ?? 0,
      maxTime: sorted[sorted.length - 1] ?? 0,
      medianTime: sorted[Math.floor(sorted.length / 2)] ?? 0,
      p95Time: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
      p99Time: sorted[Math.floor(sorted.length * 0.99)] ?? 0,
      standardDeviation: this.calculateStandardDeviation(results),
      opsPerSecond: 1000 / (sum / results.length),
      timestamp: new Date(),
    }
  }

  /**
   * 比较基准测试结果
   */
  compareBenchmarks(
    baseline: BenchmarkResult,
    current: BenchmarkResult,
  ): {
      improvement: number
      regression: boolean
      significant: boolean
      details: Record<string, number>
    } {
    const improvement = (baseline.averageTime - current.averageTime) / baseline.averageTime
    const regression = improvement < 0
    const significant = Math.abs(improvement) > 0.05 // 5% 阈值

    return {
      improvement,
      regression,
      significant,
      details: {
        averageTimeChange: improvement,
        minTimeChange: (baseline.minTime - current.minTime) / baseline.minTime,
        maxTimeChange: (baseline.maxTime - current.maxTime) / baseline.maxTime,
        opsPerSecondChange: (current.opsPerSecond - baseline.opsPerSecond) / baseline.opsPerSecond,
      },
    }
  }

  /**
   * 获取性能报告
   */
  getReport(timeRange?: { start: Date, end: Date }): {
    summary: {
      totalMetrics: number
      timeRange: { start: Date, end: Date }
      averageMemory: number
      peakMemory: number
      averageCPU: number
    }
    timers: Array<{
      name: string
      count: number
      totalTime: number
      averageTime: number
      minTime: number
      maxTime: number
    }>
    memory: MemorySnapshot[]
    cpu: CPUSnapshot[]
  } {
    let filteredMetrics = this.metrics

    if (timeRange) {
      filteredMetrics = this.metrics.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end,
      )
    }

    const memoryMetrics = filteredMetrics.filter(m => m.type === 'memory')
    const cpuMetrics = filteredMetrics.filter(m => m.type === 'cpu')
    const timerMetrics = filteredMetrics.filter(m => m.type === 'timer')

    // 计算定时器统计
    const timerStats = new Map<string, number[]>()
    timerMetrics.forEach((m) => {
      if (!timerStats.has(m.name)) {
        timerStats.set(m.name, [])
      }
      timerStats.get(m.name)!.push(m.value)
    })

    const timers = Array.from(timerStats.entries()).map(([name, times]) => ({
      name,
      count: times.length,
      totalTime: times.reduce((a, b) => a + b, 0),
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
    }))

    return {
      summary: {
        totalMetrics: filteredMetrics.length,
        timeRange: timeRange || {
          start: filteredMetrics[0]?.timestamp || new Date(),
          end: filteredMetrics[filteredMetrics.length - 1]?.timestamp || new Date(),
        },
        averageMemory:
          memoryMetrics.length > 0
            ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length
            : 0,
        peakMemory: memoryMetrics.length > 0 ? Math.max(...memoryMetrics.map(m => m.value)) : 0,
        averageCPU:
          cpuMetrics.length > 0
            ? cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length
            : 0,
      },
      timers,
      memory: memoryMetrics.map(m => ({
        rss: 0,
        heapTotal: 0,
        heapUsed: m.value,
        external: 0,
        arrayBuffers: 0,
        timestamp: m.timestamp,
      })),
      cpu: cpuMetrics.map(m => ({
        user: m.value,
        system: 0,
        timestamp: m.timestamp,
      })),
    }
  }

  /**
   * 清空指标
   */
  clearMetrics(): void {
    this.metrics = []
    this.timers.clear()
  }

  /**
   * 记录指标
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric)

    // 限制指标数量
    if (this.metrics.length > this.config?.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config?.maxMetrics)
    }
  }

  /**
   * 设置性能观察器
   */
  private setupObserver(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            this.recordMetric({
              name: entry.name,
              type: 'measure',
              value: entry.duration,
              timestamp: new Date(),
              unit: 'ms',
            })
          }
        })
      })

      this.observer.observe({ entryTypes: ['measure'] })
    }
  }

  /**
   * 计算标准差
   */
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(value => (value - mean) ** 2)
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
    return Math.sqrt(avgSquaredDiff)
  }

  /**
   * 创建性能监控器实例
   */
  static create(config?: PerformanceConfig): PerformanceMonitor {
    return new PerformanceMonitor(config)
  }
}
