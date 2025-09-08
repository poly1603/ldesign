/**
 * 计时器
 * 提供代码执行时间测量功能
 */

import type { Logger } from './logger'

/**
 * 计时器选项
 */
export interface TimerOptions {
  label?: string
  autoLog?: boolean
  precision?: number
  unit?: 'ms' | 's' | 'auto'
}

/**
 * 计时结果
 */
export interface TimerResult {
  label: string
  duration: number
  unit: string
  formatted: string
}

/**
 * 计时器类
 */
export class Timer {
  private label: string
  private startTime: number
  private endTime?: number
  private marks: Map<string, number> = new Map()
  private options: Required<TimerOptions>
  private logger?: Logger

  constructor(label = 'Timer', options: TimerOptions = {}, logger?: Logger) {
    this.label = label
    this.options = {
      label,
      autoLog: options.autoLog !== false,
      precision: options.precision || 2,
      unit: options.unit || 'auto',
    }
    this.logger = logger
    this.startTime = this.getHighResTime()
  }

  /**
   * 获取高精度时间
   */
  private getHighResTime(): number {
    const [seconds, nanoseconds] = process.hrtime()
    return seconds * 1000 + nanoseconds / 1000000
  }

  /**
   * 开始计时
   */
  start(label?: string): Timer {
    if (label) {
      this.label = label
    }
    this.startTime = this.getHighResTime()
    this.endTime = undefined
    this.marks.clear()
    return this
  }

  /**
   * 结束计时
   */
  end(log = this.options.autoLog): TimerResult {
    this.endTime = this.getHighResTime()
    const result = this.getResult()

    if (log && this.logger) {
      this.logger.info(`${this.label}: ${result.formatted}`)
    }
    else if (log) {
      process.stdout.write(`⏱️  ${this.label}: ${result.formatted}\n`)
    }

    return result
  }

  /**
   * 添加标记点
   */
  mark(name: string): number {
    const time = this.getHighResTime()
    this.marks.set(name, time)
    return time - this.startTime
  }

  /**
   * 获取标记点时间
   */
  getMark(name: string): number | undefined {
    const markTime = this.marks.get(name)
    return markTime ? markTime - this.startTime : undefined
  }

  /**
   * 获取所有标记点
   */
  getMarks(): Record<string, number> {
    const result: Record<string, number> = {}
    for (const [name, time] of this.marks) {
      result[name] = time - this.startTime
    }
    return result
  }

  /**
   * 获取当前经过时间
   */
  getElapsed(): number {
    const currentTime = this.endTime || this.getHighResTime()
    return currentTime - this.startTime
  }

  /**
   * 获取计时结果
   */
  getResult(): TimerResult {
    const duration = this.getElapsed()
    const { unit, formatted } = this.formatDuration(duration)

    return {
      label: this.label,
      duration,
      unit,
      formatted,
    }
  }

  /**
   * 格式化持续时间
   */
  private formatDuration(ms: number): { unit: string, formatted: string } {
    const precision = this.options.precision

    if (this.options.unit === 'ms') {
      return {
        unit: 'ms',
        formatted: `${ms.toFixed(precision)}ms`,
      }
    }

    if (this.options.unit === 's') {
      return {
        unit: 's',
        formatted: `${(ms / 1000).toFixed(precision)}s`,
      }
    }

    // 自动选择单位
    if (ms < 1000) {
      return {
        unit: 'ms',
        formatted: `${ms.toFixed(precision)}ms`,
      }
    }

    if (ms < 60000) {
      return {
        unit: 's',
        formatted: `${(ms / 1000).toFixed(precision)}s`,
      }
    }

    if (ms < 3600000) {
      const minutes = Math.floor(ms / 60000)
      const seconds = ((ms % 60000) / 1000).toFixed(precision)
      return {
        unit: 'm',
        formatted: `${minutes}m ${seconds}s`,
      }
    }

    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(precision)
    return {
      unit: 'h',
      formatted: `${hours}h ${minutes}m ${seconds}s`,
    }
  }

  /**
   * 重置计时器
   */
  reset(): Timer {
    this.startTime = this.getHighResTime()
    this.endTime = undefined
    this.marks.clear()
    return this
  }

  /**
   * 是否已结束
   */
  isEnded(): boolean {
    return this.endTime !== undefined
  }

  /**
   * 获取标签
   */
  getLabel(): string {
    return this.label
  }

  /**
   * 设置标签
   */
  setLabel(label: string): Timer {
    this.label = label
    return this
  }

  /**
   * 创建计时器实例
   */
  static create(label?: string, options?: TimerOptions, logger?: Logger): Timer {
    return new Timer(label, options, logger)
  }

  /**
   * 测量函数执行时间
   */
  static async measure<T>(
    fn: () => T | Promise<T>,
    label?: string,
    logger?: Logger,
  ): Promise<{ result: T, timer: TimerResult }> {
    const timer = new Timer(label || 'Function execution', { autoLog: false }, logger)

    try {
      const result = await fn()
      const timerResult = timer.end(true)
      return { result, timer: timerResult }
    }
    catch (error) {
      timer.end(false)
      if (logger) {
        logger.error(`${timer.getLabel()} failed: ${error}`)
      }
      throw error
    }
  }

  /**
   * 测量同步函数执行时间
   */
  static measureSync<T>(
    fn: () => T,
    label?: string,
    logger?: Logger,
  ): { result: T, timer: TimerResult } {
    const timer = new Timer(label || 'Function execution', { autoLog: false }, logger)

    try {
      const result = fn()
      const timerResult = timer.end(true)
      return { result, timer: timerResult }
    }
    catch (error) {
      timer.end(false)
      if (logger) {
        logger.error(`${timer.getLabel()} failed: ${error}`)
      }
      throw error
    }
  }

  /**
   * 创建性能基准测试
   */
  static async benchmark(
    fn: () => any | Promise<any>,
    iterations = 1000,
    label?: string,
    logger?: Logger,
  ): Promise<BenchmarkResult> {
    const results: number[] = []
    const overallTimer = new Timer(
      `${label || 'Benchmark'} (${iterations} iterations)`,
      { autoLog: false },
      logger,
    )

    for (let i = 0; i < iterations; i++) {
      const timer = new Timer('', { autoLog: false })
      await fn()
      const result = timer.end(false)
      results.push(result.duration)
    }

    const overallResult = overallTimer.end(true)

    const min = Math.min(...results)
    const max = Math.max(...results)
    const avg = results.reduce((sum, time) => sum + time, 0) / results.length
    const sortedResults = [...results].sort((a, b) => a - b)
    const median = sortedResults[Math.floor(sortedResults.length / 2)] ?? 0

    const benchmarkResult: BenchmarkResult = {
      iterations,
      total: overallResult.duration,
      min,
      max,
      avg,
      median,
      results,
    }

    if (logger) {
      logger.info(`Benchmark results for ${label || 'function'}:`)
      logger.info(`  Iterations: ${iterations}`)
      logger.info(`  Total time: ${overallResult.formatted}`)
      logger.info(
        `  Average: ${Timer.prototype.formatDuration.call({ options: { precision: 2, unit: 'auto' } }, avg).formatted}`,
      )
      logger.info(
        `  Min: ${Timer.prototype.formatDuration.call({ options: { precision: 2, unit: 'auto' } }, min).formatted}`,
      )
      logger.info(
        `  Max: ${Timer.prototype.formatDuration.call({ options: { precision: 2, unit: 'auto' } }, max).formatted}`,
      )
      logger.info(
        `  Median: ${Timer.prototype.formatDuration.call({ options: { precision: 2, unit: 'auto' } }, median).formatted}`,
      )
    }

    return benchmarkResult
  }
}

/**
 * 基准测试结果
 */
export interface BenchmarkResult {
  iterations: number
  total: number
  min: number
  max: number
  avg: number
  median: number
  results: number[]
}
