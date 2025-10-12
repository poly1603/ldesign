/**
 * 统一性能监控系统
 * 
 * 整合所有性能监控功能，消除重复代码
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import { TimeUtils } from '../utils/common'

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  /** 操作总数 */
  totalOperations: number
  /** 平均操作时间 */
  avgOperationTime: number
  /** 最慢操作 */
  slowestOperations: Array<{
    name: string
    time: number
    timestamp: number
    context?: any
  }>
  /** 操作频率统计 */
  operationFrequency: Map<string, number>
  /** 错误统计 */
  errors: {
    total: number
    rate: number
    recent: Array<{ operation: string; error: string; timestamp: number }>
  }
  /** 内存统计 */
  memory: {
    current: number
    peak: number
    pressure: boolean
  }
  /** 缓存统计 */
  cache: {
    hitRate: number
    size: number
    evictions: number
  }
}

/**
 * 性能配置接口
 */
export interface PerformanceConfig {
  enabled?: boolean
  sampleRate?: number
  slowThreshold?: number
  maxSlowOperations?: number
  maxErrorHistory?: number
  memoryCheckInterval?: number
  autoReport?: boolean
  reportInterval?: number
  enableAdaptiveSampling?: boolean
}

/**
 * 操作记录接口
 */
interface OperationRecord {
  name: string
  startTime: number
  endTime: number
  success: boolean
  error?: string
  context?: any
  sampled: boolean
}

/**
 * 滑动窗口统计类
 */
class SlidingWindow<T = number> {
  private values: T[] = []
  private maxSize: number
  private windowStart = 0

  constructor(maxSize: number) {
    this.maxSize = maxSize
  }

  add(value: T): void {
    if (this.values.length < this.maxSize) {
      this.values.push(value)
    } else {
      this.values[this.windowStart] = value
      this.windowStart = (this.windowStart + 1) % this.maxSize
    }
  }

  getValues(): T[] {
    return [...this.values]
  }

  clear(): void {
    this.values = []
    this.windowStart = 0
  }

  get size(): number {
    return this.values.length
  }
}

/**
 * 自适应采样器
 */
class AdaptiveSampler {
  private baseSampleRate: number
  private currentRate: number
  private errorCount = 0
  private totalCount = 0
  private slowCount = 0

  constructor(baseSampleRate: number) {
    this.baseSampleRate = baseSampleRate
    this.currentRate = baseSampleRate
  }

  shouldSample(isError: boolean = false, isSlow: boolean = false): boolean {
    this.totalCount++

    if (isError) {
      this.errorCount++
    }
    if (isSlow) {
      this.slowCount++
    }

    // 动态调整采样率
    this.adjustSampleRate()

    // 错误和慢操作总是采样
    if (isError || isSlow) {
      return true
    }

    return Math.random() < this.currentRate
  }

  private adjustSampleRate(): void {
    const errorRate = this.errorCount / this.totalCount
    const slowRate = this.slowCount / this.totalCount

    if (errorRate > 0.1 || slowRate > 0.1) {
      // 问题较多时提高采样率
      this.currentRate = Math.min(1, this.baseSampleRate * 2)
    } else if (errorRate < 0.01 && slowRate < 0.01) {
      // 系统稳定时降低采样率
      this.currentRate = Math.max(0.001, this.baseSampleRate * 0.5)
    } else {
      // 逐渐恢复到基础采样率
      this.currentRate = this.currentRate * 0.9 + this.baseSampleRate * 0.1
    }
  }

  reset(): void {
    this.errorCount = 0
    this.totalCount = 0
    this.slowCount = 0
    this.currentRate = this.baseSampleRate
  }

  getStats(): { errorRate: number; slowRate: number; sampleRate: number } {
    return {
      errorRate: this.totalCount > 0 ? this.errorCount / this.totalCount : 0,
      slowRate: this.totalCount > 0 ? this.slowCount / this.totalCount : 0,
      sampleRate: this.currentRate,
    }
  }
}

/**
 * 统一性能监控器
 */
export class UnifiedPerformanceMonitor {
  private config: Required<PerformanceConfig>
  private metrics: PerformanceMetrics
  private operationWindow: SlidingWindow<OperationRecord>
  private timeWindow: SlidingWindow<number>
  private sampler: AdaptiveSampler
  private memoryCheckTimer?: NodeJS.Timeout
  private reportTimer?: NodeJS.Timeout
  private listeners = new Map<string, Set<(metrics: PerformanceMetrics) => void>>()

  constructor(config: PerformanceConfig = {}) {
    this.config = {
      enabled: true,
      sampleRate: 0.1,
      slowThreshold: 10,
      maxSlowOperations: 50,
      maxErrorHistory: 20,
      memoryCheckInterval: 30000,
      autoReport: false,
      reportInterval: 60000,
      enableAdaptiveSampling: true,
      ...config,
    }

    this.metrics = this.initializeMetrics()
    this.operationWindow = new SlidingWindow<OperationRecord>(1000)
    this.timeWindow = new SlidingWindow<number>(1000)
    this.sampler = new AdaptiveSampler(this.config.sampleRate)

    if (this.config.enabled) {
      this.start()
    }
  }

  /**
   * 记录操作开始
   */
  startOperation(name: string, context?: any): { endOperation: (success?: boolean, error?: string) => void } {
    const startTime = performance.now()

    return {
      endOperation: (success: boolean = true, error?: string) => {
        this.endOperation(name, startTime, success, error, context)
      },
    }
  }

  /**
   * 记录操作结束
   */
  private endOperation(
    name: string,
    startTime: number,
    success: boolean,
    error?: string,
    context?: any
  ): void {
    if (!this.config.enabled) return

    const endTime = performance.now()
    const duration = endTime - startTime
    const isSlow = duration > this.config.slowThreshold
    const isError = !success

    // 自适应采样决策
    const shouldSample = this.config.enableAdaptiveSampling
      ? this.sampler.shouldSample(isError, isSlow)
      : Math.random() < this.config.sampleRate

    if (!shouldSample && !isSlow && !isError) {
      return
    }

    const record: OperationRecord = {
      name,
      startTime,
      endTime,
      success,
      error,
      context,
      sampled: shouldSample,
    }

    // 更新统计
    this.updateMetrics(record, duration)

    // 触发监听器
    if (isSlow || isError) {
      this.notifyListeners('alert')
    }
  }

  /**
   * 记录简单操作（用于装饰器）
   */
  measureOperation<T>(name: string, operation: () => T): T {
    const { endOperation } = this.startOperation(name)
    try {
      const result = operation()
      endOperation(true)
      return result
    } catch (error) {
      endOperation(false, String(error))
      throw error
    }
  }

  /**
   * 异步操作测量
   */
  async measureAsyncOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const { endOperation } = this.startOperation(name)
    try {
      const result = await operation()
      endOperation(true)
      return result
    } catch (error) {
      endOperation(false, String(error))
      throw error
    }
  }

  /**
   * 更新缓存统计
   */
  updateCacheStats(hitRate: number, size: number, evictions: number): void {
    this.metrics.cache = {
      hitRate,
      size,
      evictions,
    }
  }

  /**
   * 获取当前指标
   */
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      operationFrequency: new Map(this.metrics.operationFrequency),
      errors: {
        ...this.metrics.errors,
        recent: [...this.metrics.errors.recent],
      },
      slowestOperations: [...this.metrics.slowestOperations],
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const metrics = this.getMetrics()
    const report: string[] = []

    report.push('=== 性能监控报告 ===')
    report.push(`总操作数: ${metrics.totalOperations}`)
    report.push(`平均操作时间: ${metrics.avgOperationTime.toFixed(2)}ms`)
    report.push('')

    // 缓存统计
    report.push('缓存统计:')
    report.push(`  命中率: ${(metrics.cache.hitRate * 100).toFixed(2)}%`)
    report.push(`  大小: ${metrics.cache.size}`)
    report.push(`  驱逐次数: ${metrics.cache.evictions}`)
    report.push('')

    // 错误统计
    report.push('错误统计:')
    report.push(`  总错误数: ${metrics.errors.total}`)
    report.push(`  错误率: ${(metrics.errors.rate * 100).toFixed(2)}%`)
    if (metrics.errors.recent.length > 0) {
      report.push('  最近错误:')
      metrics.errors.recent.slice(0, 5).forEach(err => {
        report.push(`    - ${err.operation}: ${err.error}`)
      })
    }
    report.push('')

    // 内存统计
    report.push('内存统计:')
    report.push(`  当前: ${(metrics.memory.current / 1024 / 1024).toFixed(2)}MB`)
    report.push(`  峰值: ${(metrics.memory.peak / 1024 / 1024).toFixed(2)}MB`)
    report.push(`  压力状态: ${metrics.memory.pressure ? '是' : '否'}`)
    report.push('')

    // 慢操作
    if (metrics.slowestOperations.length > 0) {
      report.push('最慢操作:')
      metrics.slowestOperations.slice(0, 5).forEach(op => {
        report.push(`  - ${op.name}: ${op.time.toFixed(2)}ms`)
      })
    }

    // 操作频率
    if (metrics.operationFrequency.size > 0) {
      report.push('')
      report.push('操作频率 TOP 5:')
      const sorted = Array.from(metrics.operationFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
      sorted.forEach(([name, count]) => {
        report.push(`  - ${name}: ${count}次`)
      })
    }

    // 采样器统计
    if (this.config.enableAdaptiveSampling) {
      const samplerStats = this.sampler.getStats()
      report.push('')
      report.push('采样统计:')
      report.push(`  当前采样率: ${(samplerStats.sampleRate * 100).toFixed(2)}%`)
      report.push(`  错误率: ${(samplerStats.errorRate * 100).toFixed(2)}%`)
      report.push(`  慢操作率: ${(samplerStats.slowRate * 100).toFixed(2)}%`)
    }

    return report.join('\n')
  }

  /**
   * 获取优化建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = []
    const metrics = this.getMetrics()

    // 基于指标生成建议
    if (metrics.cache.hitRate < 0.7) {
      suggestions.push('缓存命中率较低，建议增加缓存大小或优化缓存策略')
    }

    if (metrics.avgOperationTime > 20) {
      suggestions.push('平均操作时间较长，建议优化热点代码路径')
    }

    if (metrics.errors.rate > 0.05) {
      suggestions.push('错误率较高，建议检查错误日志并修复问题')
    }

    if (metrics.memory.pressure) {
      suggestions.push('内存压力较大，建议优化内存使用或增加内存限制')
    }

    if (metrics.slowestOperations.length > 10) {
      suggestions.push('慢操作较多，建议分析并优化这些操作')
    }

    // 基于操作频率生成建议
    const topOperations = Array.from(metrics.operationFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    if (topOperations.length > 0) {
      const topOp = topOperations[0]
      if (topOp[1] > metrics.totalOperations * 0.5) {
        suggestions.push(`"${topOp[0]}"操作频率过高，建议优化或添加缓存`)
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('性能表现良好，继续保持')
    }

    return suggestions
  }

  /**
   * 添加监听器
   */
  on(event: string, listener: (metrics: PerformanceMetrics) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  /**
   * 移除监听器
   */
  off(event: string, listener: (metrics: PerformanceMetrics) => void): void {
    this.listeners.get(event)?.delete(listener)
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.metrics = this.initializeMetrics()
    this.operationWindow.clear()
    this.timeWindow.clear()
    this.sampler.reset()
  }

  /**
   * 启动监控
   */
  start(): void {
    this.config.enabled = true

    // 启动内存检查
    if (!this.memoryCheckTimer) {
      this.memoryCheckTimer = setInterval(() => {
        this.checkMemory()
      }, this.config.memoryCheckInterval)
    }

    // 启动自动报告
    if (this.config.autoReport && !this.reportTimer) {
      this.reportTimer = setInterval(() => {
        console.log(this.generateReport())
      }, this.config.reportInterval)
    }
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.config.enabled = false

    if (this.memoryCheckTimer) {
      clearInterval(this.memoryCheckTimer)
      this.memoryCheckTimer = undefined
    }

    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = undefined
    }
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.stop()
    this.reset()
    this.listeners.clear()
  }

  /**
   * 初始化指标
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      totalOperations: 0,
      avgOperationTime: 0,
      slowestOperations: [],
      operationFrequency: new Map(),
      errors: {
        total: 0,
        rate: 0,
        recent: [],
      },
      memory: {
        current: 0,
        peak: 0,
        pressure: false,
      },
      cache: {
        hitRate: 0,
        size: 0,
        evictions: 0,
      },
    }
  }

  /**
   * 更新指标
   */
  private updateMetrics(record: OperationRecord, duration: number): void {
    // 更新操作计数
    this.metrics.totalOperations++

    // 更新操作频率
    const currentCount = this.metrics.operationFrequency.get(record.name) || 0
    this.metrics.operationFrequency.set(record.name, currentCount + 1)

    // 更新时间窗口
    this.timeWindow.add(duration)
    this.operationWindow.add(record)

    // 计算平均时间
    const times = this.timeWindow.getValues()
    if (times.length > 0) {
      this.metrics.avgOperationTime = times.reduce((sum, t) => sum + t, 0) / times.length
    }

    // 更新慢操作
    if (duration > this.config.slowThreshold) {
      this.addSlowOperation(record.name, duration, record.context)
    }

    // 更新错误统计
    if (!record.success) {
      this.metrics.errors.total++
      this.metrics.errors.rate = this.metrics.errors.total / this.metrics.totalOperations

      // 添加到最近错误
      this.metrics.errors.recent.unshift({
        operation: record.name,
        error: record.error || 'Unknown error',
        timestamp: TimeUtils.now(),
      })

      // 限制错误历史大小
      if (this.metrics.errors.recent.length > this.config.maxErrorHistory) {
        this.metrics.errors.recent = this.metrics.errors.recent.slice(0, this.config.maxErrorHistory)
      }
    }
  }

  /**
   * 添加慢操作
   */
  private addSlowOperation(name: string, time: number, context?: any): void {
    const operation = {
      name,
      time,
      timestamp: TimeUtils.now(),
      context,
    }

    // 插入排序保持有序
    let inserted = false
    for (let i = 0; i < this.metrics.slowestOperations.length; i++) {
      if (time > this.metrics.slowestOperations[i].time) {
        this.metrics.slowestOperations.splice(i, 0, operation)
        inserted = true
        break
      }
    }

    if (!inserted && this.metrics.slowestOperations.length < this.config.maxSlowOperations) {
      this.metrics.slowestOperations.push(operation)
    }

    // 限制大小
    if (this.metrics.slowestOperations.length > this.config.maxSlowOperations) {
      this.metrics.slowestOperations = this.metrics.slowestOperations.slice(0, this.config.maxSlowOperations)
    }
  }

  /**
   * 检查内存
   */
  private checkMemory(): void {
    const usage = this.getMemoryUsage()
    this.metrics.memory.current = usage

    if (usage > this.metrics.memory.peak) {
      this.metrics.memory.peak = usage
    }

    // 检查内存压力（超过100MB）
    const pressureThreshold = 100 * 1024 * 1024
    const wasPressure = this.metrics.memory.pressure
    this.metrics.memory.pressure = usage > pressureThreshold

    // 内存压力变化时通知
    if (!wasPressure && this.metrics.memory.pressure) {
      this.notifyListeners('memory-pressure')
    }
  }

  /**
   * 获取内存使用量
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize || 0
    }

    // 粗略估算
    return (
      this.metrics.totalOperations * 100 +
      this.metrics.slowestOperations.length * 200 +
      this.metrics.operationFrequency.size * 50
    )
  }

  /**
   * 通知监听器
   */
  private notifyListeners(event: string): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const metrics = this.getMetrics()
      for (const listener of listeners) {
        try {
          listener(metrics)
        } catch (error) {
          console.error(`Error in performance listener: ${error}`)
        }
      }
    }
  }
}

/**
 * 性能监控装饰器
 */
export function performanceMonitor(monitor: UnifiedPerformanceMonitor) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const isAsync = originalMethod.constructor.name === 'AsyncFunction'

    if (isAsync) {
      descriptor.value = async function (...args: any[]) {
        const operationName = `${target.constructor.name}.${propertyKey}`
        return monitor.measureAsyncOperation(operationName, () => 
          originalMethod.apply(this, args)
        )
      }
    } else {
      descriptor.value = function (...args: any[]) {
        const operationName = `${target.constructor.name}.${propertyKey}`
        return monitor.measureOperation(operationName, () => 
          originalMethod.apply(this, args)
        )
      }
    }

    return descriptor
  }
}

/**
 * 创建全局性能监控器实例
 */
export const globalPerformanceMonitor = new UnifiedPerformanceMonitor({
  enabled: true,
  sampleRate: 0.1,
  enableAdaptiveSampling: true,
  autoReport: false,
})