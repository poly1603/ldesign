/**
 * 高性能监控工具
 * 提供实时性能监控、内存分析、性能瓶颈检测等功能
 */

import type { Engine } from '../types'

export interface PerformanceMetrics {
  cpu: {
    usage: number
    idle: number
  }
  memory: {
    used: number
    total: number
    heapUsed: number
    heapTotal: number
    external: number
    arrayBuffers: number
  }
  timing: {
    [key: string]: {
      count: number
      total: number
      min: number
      max: number
      average: number
      p50: number
      p90: number
      p99: number
    }
  }
  counters: Map<string, number>
  gauges: Map<string, number>
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics
  private timings = new Map<string, number[]>()
  private startTimes = new Map<string, number>()
  private counters = new Map<string, number>()
  private gauges = new Map<string, number>()
  private observers = new Set<(metrics: PerformanceMetrics) => void>()
  private updateInterval?: number
  private readonly maxTimingSamples = 100 // 减少样本数量
  private readonly maxMetricKeys = 50 // 限制指标数量
  private readonly maxObservers = 20 // 限制观察者数量
  private lastCleanup = Date.now()
  private readonly cleanupInterval = 60000 // 每分钟清理

  constructor(private engine?: Engine) {
    this.metrics = this.initMetrics()
    this.startAutoMonitoring()
  }

  private initMetrics(): PerformanceMetrics {
    return {
      cpu: { usage: 0, idle: 100 },
      memory: {
        used: 0,
        total: 0,
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        arrayBuffers: 0
      },
      timing: {},
      counters: new Map(),
      gauges: new Map()
    }
  }

  /**
   * 开始性能计时
   */
  startTiming(label: string): void {
    // 限制开始时间记录数量
    if (this.startTimes.size >= this.maxMetricKeys) {
      const firstKey = this.startTimes.keys().next().value
      if (firstKey !== undefined) {
        this.startTimes.delete(firstKey)
      }
    }
    this.startTimes.set(label, performance.now())

    // 定期清理
    this.performPeriodicCleanup()
  }

  /**
   * 结束性能计时并记录
   */
  endTiming(label: string): number {
    const startTime = this.startTimes.get(label)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    this.startTimes.delete(label)

    // 检查指标数量限制
    if (this.timings.size >= this.maxMetricKeys && !this.timings.has(label)) {
      // 删除最早的指标
      const firstKey = this.timings.keys().next().value
      if (firstKey) {
        this.timings.delete(firstKey)
        delete this.metrics.timing[firstKey]
      }
    }

    // 记录时间样本
    if (!this.timings.has(label)) {
      this.timings.set(label, [])
    }
    const samples = this.timings.get(label)!
    samples.push(duration)

    // 限制样本数量 - 使用环形缓冲区逻辑
    if (samples.length > this.maxTimingSamples) {
      samples.shift()
    }

    // 更新统计
    this.updateTimingStats(label)

    return duration
  }

  /**
   * 使用装饰器模式测量函数执行时间
   */
  measure<T extends (...args: any[]) => any>(
    label: string,
    fn: T
  ): T {
    return ((...args: Parameters<T>) => {
      this.startTiming(label)
      try {
        const result = fn(...args)
        if (result instanceof Promise) {
          return result.finally(() => this.endTiming(label))
        }
        this.endTiming(label)
        return result
      } catch (error) {
        this.endTiming(label)
        throw error
      }
    }) as T
  }

  /**
   * 增加计数器
   */
  incrementCounter(name: string, value = 1): void {
    // 限制计数器数量
    if (this.counters.size >= this.maxMetricKeys && !this.counters.has(name)) {
      const firstKey = this.counters.keys().next().value
      if (firstKey !== undefined) {
        this.counters.delete(firstKey)
      }
    }

    const current = this.counters.get(name) || 0
    this.counters.set(name, current + value)
    this.metrics.counters = new Map(this.counters)
  }

  /**
   * 设置测量值
   */
  setGauge(name: string, value: number): void {
    // 限制测量值数量
    if (this.gauges.size >= this.maxMetricKeys && !this.gauges.has(name)) {
      const firstKey = this.gauges.keys().next().value
      if (firstKey !== undefined) {
        this.gauges.delete(firstKey)
      }
    }

    this.gauges.set(name, value)
    this.metrics.gauges = new Map(this.gauges)
  }

  /**
   * 获取当前指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 重置所有指标
   */
  reset(): void {
    this.timings.clear()
    this.startTimes.clear()
    this.counters.clear()
    this.gauges.clear()
    this.metrics = this.initMetrics()
  }

  /**
   * 订阅性能指标更新
   */
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    // 限制观察者数量
    if (this.observers.size >= this.maxObservers) {
      console.warn(`Performance monitor: Maximum observers (${this.maxObservers}) reached`)
      return () => { }
    }

    this.observers.add(callback)
    return () => this.observers.delete(callback)
  }

  /**
   * 获取性能报告
   */
  getReport(): string {
    const report: string[] = []
    report.push('=== Performance Report ===')

    // 内存使用
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory
      report.push(`Memory: ${(mem.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(mem.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
    }

    // 计时统计
    for (const [label, stats] of Object.entries(this.metrics.timing)) {
      report.push(`${label}: avg=${stats.average.toFixed(2)}ms, p99=${stats.p99.toFixed(2)}ms`)
    }

    // 计数器
    if (this.counters.size > 0) {
      report.push('Counters:')
      for (const [name, value] of this.counters) {
        report.push(`  ${name}: ${value}`)
      }
    }

    return report.join('\n')
  }

  /**
   * 获取性能建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []

    // 检查缓慢的操作
    for (const [label, stats] of Object.entries(this.metrics.timing)) {
      if (stats.p99 > 100) {
        suggestions.push(`考虑优化 "${label}" 操作，P99延迟为 ${stats.p99.toFixed(2)}ms`)
      }
    }

    // 检查内存使用
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const mem = (performance as any).memory
      const usagePercent = (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100
      if (usagePercent > 80) {
        suggestions.push(`内存使用率较高 (${usagePercent.toFixed(1)}%)，建议检查内存泄漏`)
      }
    }

    // 检查事件监听器数量
    if (this.engine?.events) {
      const stats = (this.engine.events as any).getStats?.()
      if (stats?.totalListeners > 100) {
        suggestions.push(`事件监听器过多 (${stats.totalListeners})，可能存在内存泄漏`)
      }
    }

    // 检查缓存命中率
    if (this.engine?.cache) {
      const cacheStats = this.engine.cache.getStats()
      if (cacheStats.hitRate < 50) {
        suggestions.push(`缓存命中率较低 (${cacheStats.hitRate.toFixed(1)}%)，考虑调整缓存策略`)
      }
    }

    return suggestions
  }

  /**
   * 更新计时统计 - 优化版
   */
  private updateTimingStats(label: string): void {
    const samples = this.timings.get(label)
    if (!samples || samples.length === 0) return

    // 使用原地排序减少内存分配
    const sorted = samples.slice().sort((a, b) => a - b)
    const len = sorted.length
    
    // 优化：一次遍历计算 total
    let total = 0
    for (let i = 0; i < len; i++) {
      total += sorted[i]
    }

    const stats = {
      count: len,
      total,
      min: sorted[0],
      max: sorted[len - 1],
      average: total / len,
      p50: sorted[Math.floor(len * 0.5)],
      p90: sorted[Math.floor(len * 0.9)],
      p99: sorted[Math.floor(len * 0.99)]
    }

    this.metrics.timing[label] = stats
  }


  /**
   * 定期清理过期数据
   */
  private performPeriodicCleanup(): void {
    const now = Date.now()
    // 每分钟执行一次清理
    if (now - this.lastCleanup > this.cleanupInterval) {
      // 清理超时的startTimes
      const timeout = 30000 // 30秒超时
      for (const [label, startTime] of this.startTimes) {
        if (now - startTime > timeout) {
          this.startTimes.delete(label)
        }
      }
      this.lastCleanup = now
    }
  }

  /**
   * 开始自动监控 - 优化频率
   */
  private startAutoMonitoring(): void {
    this.updateInterval = window.setInterval(() => {
      // 更新内存指标
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const mem = (performance as any).memory
        this.metrics.memory = {
          used: mem.usedJSHeapSize,
          total: mem.jsHeapSizeLimit,
          heapUsed: mem.usedJSHeapSize,
          heapTotal: mem.totalJSHeapSize,
          external: 0,
          arrayBuffers: 0
        }
      }

      // 定期清理
      this.performPeriodicCleanup()

      // 通知观察者（节流）
      if (this.observers.size > 0) {
        this.notifyObservers()
      }
    }, 2000) // 降低频率到2秒
  }

  /**
   * 通知所有观察者
   */
  private notifyObservers(): void {
    for (const observer of this.observers) {
      observer(this.getMetrics())
    }
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    if (this.updateInterval) {
      window.clearInterval(this.updateInterval)
    }
    this.observers.clear()
    this.reset()
  }
}

// 创建全局性能监控实例
let globalMonitor: PerformanceMonitor | undefined

export function getGlobalPerformanceMonitor(engine?: Engine): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor(engine)
  }
  return globalMonitor
}

/**
 * 性能测量装饰器
 */
export function Measure(label?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const measureLabel = label || `${target.constructor.name}.${propertyKey}`

    descriptor.value = function (...args: any[]) {
      const monitor = getGlobalPerformanceMonitor()
      return monitor.measure(measureLabel, originalMethod).apply(this, args)
    }

    return descriptor
  }
}