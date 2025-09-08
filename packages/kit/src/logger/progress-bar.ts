/**
 * 进度条
 * 提供控制台进度条显示功能
 */

import type { Logger } from './logger'

/**
 * 进度条选项
 */
export interface ProgressBarOptions {
  total: number
  message?: string
  width?: number
  complete?: string
  incomplete?: string
  showPercentage?: boolean
  showETA?: boolean
  showSpeed?: boolean
  showCurrent?: boolean
  clear?: boolean
  stream?: NodeJS.WriteStream
}

/**
 * 进度条类
 */
export class ProgressBar {
  private options: Required<ProgressBarOptions>
  private current = 0
  private startTime: number
  private lastUpdate = 0
  private logger?: Logger

  constructor(options: ProgressBarOptions, logger?: Logger) {
    this.options = {
      total: options.total,
      message: options.message || 'Progress',
      width: options.width || 40,
      complete: options.complete || '█',
      incomplete: options.incomplete || '░',
      showPercentage: options.showPercentage !== false,
      showETA: options.showETA !== false,
      showSpeed: options.showSpeed !== false,
      showCurrent: options.showCurrent !== false,
      clear: options.clear !== false,
      stream: options.stream || process.stdout,
    }

    this.startTime = Date.now()
    this.logger = logger
  }

  /**
   * 更新进度
   */
  update(current?: number, message?: string): void {
    if (current !== undefined) {
      this.current = Math.min(current, this.options.total)
    }
    else {
      this.current = Math.min(this.current + 1, this.options.total)
    }

    if (message) {
      this.options.message = message
    }

    this.render()

    // 如果完成，清理并记录日志
    if (this.current >= this.options.total) {
      this.complete()
    }
  }

  /**
   * 增加进度
   */
  increment(step = 1, message?: string): void {
    this.update(this.current + step, message)
  }

  /**
   * 设置进度
   */
  setProgress(current: number, message?: string): void {
    this.update(current, message)
  }

  /**
   * 渲染进度条
   */
  private render(): void {
    const now = Date.now()

    // 限制更新频率（每100ms更新一次）
    if (now - this.lastUpdate < 100 && this.current < this.options.total) {
      return
    }

    this.lastUpdate = now

    const percentage = Math.round((this.current / this.options.total) * 100)
    const elapsed = now - this.startTime
    const rate = this.current / (elapsed / 1000)
    const eta
      = this.current > 0 ? (elapsed / this.current) * (this.options.total - this.current) : 0

    let line = `\r${this.options.message} `

    // 进度条
    const progressBar = this.createProgressBar(percentage)
    line += `${progressBar} `

    // 百分比
    if (this.options.showPercentage) {
      line += `${percentage.toString().padStart(3)}% `
    }

    // 当前/总数
    if (this.options.showCurrent) {
      line += `(${this.current}/${this.options.total}) `
    }

    // 速度
    if (this.options.showSpeed && rate > 0) {
      line += `${this.formatRate(rate)} `
    }

    // ETA
    if (this.options.showETA && eta > 0 && this.current < this.options.total) {
      line += `ETA: ${this.formatTime(eta)} `
    }

    // 已用时间
    if (elapsed > 1000) {
      line += `[${this.formatTime(elapsed)}]`
    }

    this.options.stream.write(line)
  }

  /**
   * 创建进度条字符串
   */
  private createProgressBar(percentage: number): string {
    const completed = Math.round((percentage / 100) * this.options.width)
    const remaining = this.options.width - completed

    return `[${this.options.complete.repeat(completed)}${this.options.incomplete.repeat(
      remaining,
    )}]`
  }

  /**
   * 格式化时间
   */
  private formatTime(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`
    }

    const seconds = ms / 1000
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  /**
   * 格式化速率
   */
  private formatRate(rate: number): string {
    if (rate < 1) {
      return `${(rate * 1000).toFixed(0)}/s`
    }

    if (rate < 1000) {
      return `${rate.toFixed(1)}/s`
    }

    return `${(rate / 1000).toFixed(1)}k/s`
  }

  /**
   * 完成进度条
   */
  private complete(): void {
    if (this.options.clear) {
      this.options.stream.write(`\r${' '.repeat(80)}\r`)
    }
    else {
      this.options.stream.write('\n')
    }

    const elapsed = Date.now() - this.startTime
    const message = `${this.options.message} completed in ${this.formatTime(elapsed)}`

    if (this.logger) {
      this.logger.success(message)
    }
    else {
      this.options.stream.write(`✅ ${message}\n`)
    }
  }

  /**
   * 停止进度条
   */
  stop(message?: string): void {
    if (this.options.clear) {
      this.options.stream.write(`\r${' '.repeat(80)}\r`)
    }
    else {
      this.options.stream.write('\n')
    }

    if (message) {
      if (this.logger) {
        this.logger.info(message)
      }
      else {
        this.options.stream.write(`${message}\n`)
      }
    }
  }

  /**
   * 中断进度条
   */
  interrupt(message: string): void {
    this.options.stream.write(`\r${' '.repeat(80)}\r`)

    if (this.logger) {
      this.logger.warn(message)
    }
    else {
      this.options.stream.write(`⚠️  ${message}\n`)
    }

    this.render()
  }

  /**
   * 获取当前进度
   */
  getCurrent(): number {
    return this.current
  }

  /**
   * 获取总数
   */
  getTotal(): number {
    return this.options.total
  }

  /**
   * 获取百分比
   */
  getPercentage(): number {
    return Math.round((this.current / this.options.total) * 100)
  }

  /**
   * 获取已用时间
   */
  getElapsed(): number {
    return Date.now() - this.startTime
  }

  /**
   * 获取预计剩余时间
   */
  getETA(): number {
    if (this.current === 0)
      return 0
    const elapsed = this.getElapsed()
    return (elapsed / this.current) * (this.options.total - this.current)
  }

  /**
   * 获取速率
   */
  getRate(): number {
    const elapsed = this.getElapsed() / 1000
    return elapsed > 0 ? this.current / elapsed : 0
  }

  /**
   * 是否完成
   */
  isComplete(): boolean {
    return this.current >= this.options.total
  }

  /**
   * 重置进度条
   */
  reset(): void {
    this.current = 0
    this.startTime = Date.now()
    this.lastUpdate = 0
  }

  /**
   * 更新总数
   */
  setTotal(total: number): void {
    this.options.total = total
    this.current = Math.min(this.current, total)
  }

  /**
   * 更新消息
   */
  setMessage(message: string): void {
    this.options.message = message
  }

  /**
   * 创建进度条实例
   */
  static create(options: ProgressBarOptions, logger?: Logger): ProgressBar {
    return new ProgressBar(options, logger)
  }

  /**
   * 创建简单进度条
   */
  static simple(total: number, message?: string): ProgressBar {
    return new ProgressBar({ total, message })
  }

  /**
   * 创建详细进度条
   */
  static detailed(total: number, message?: string): ProgressBar {
    return new ProgressBar({
      total,
      message,
      showPercentage: true,
      showETA: true,
      showSpeed: true,
      showCurrent: true,
    })
  }
}
