/**
 * 进度条组件
 * 提供多种样式的进度条显示功能
 */

import { EventEmitter } from 'node:events'
import * as cliProgress from 'cli-progress'
import { ConsoleTheme } from './console-theme'

/**
 * 进度条选项
 */
export interface ProgressBarOptions {
  total: number
  current?: number
  width?: number
  theme?: string
  format?: string
  showPercentage?: boolean
  showEta?: boolean
  showValue?: boolean
  showRate?: boolean
  hideCursor?: boolean
  clearOnComplete?: boolean
  stopOnComplete?: boolean
  stream?: NodeJS.WriteStream
  barCompleteChar?: string
  barIncompleteChar?: string
  barGlue?: string
  etaBuffer?: number
  fps?: number
  barsize?: number
  position?: 'left' | 'right' | 'center'
  linewrap?: boolean
  autopadding?: boolean
  autopaddingChar?: string
  emptyOnZero?: boolean
  forceRedraw?: boolean
}

/**
 * 进度条类型
 */
export type ProgressBarType = 'single' | 'multi' | 'shades' | 'rect' | 'legacy'

/**
 * 进度条事件
 */
export interface ProgressBarEvents {
  start: (total: number) => void
  update: (current: number, total: number) => void
  complete: () => void
  stop: () => void
}

/**
 * 进度条类
 */
export class ProgressBar extends EventEmitter {
  private bar: cliProgress.SingleBar | null = null
  private options: Required<ProgressBarOptions>
  private theme: ConsoleTheme
  private isActive = false
  private startTime = 0

  constructor(options: ProgressBarOptions) {
    super()

    this.theme = ConsoleTheme.create(options.theme)

    this.options = {
      total: options.total,
      current: options.current || 0,
      width: options.width || 40,
      theme: options.theme || 'default',
      format: options.format || this.getDefaultFormat(),
      showPercentage: options.showPercentage !== false,
      showEta: options.showEta !== false,
      showValue: options.showValue !== false,
      showRate: options.showRate !== false,
      hideCursor: options.hideCursor !== false,
      clearOnComplete: options.clearOnComplete !== false,
      stopOnComplete: options.stopOnComplete !== false,
      stream: options.stream || process.stdout,
      barCompleteChar: options.barCompleteChar || '█',
      barIncompleteChar: options.barIncompleteChar || '░',
      barGlue: options.barGlue || '',
      etaBuffer: options.etaBuffer || 10,
      fps: options.fps || 10,
      barsize: options.barsize || options.width || 40,
      position: options.position || 'left',
      linewrap: options.linewrap !== false,
      autopadding: options.autopadding !== false,
      autopaddingChar: options.autopaddingChar || ' ',
      emptyOnZero: options.emptyOnZero !== false,
      forceRedraw: options.forceRedraw !== false,
    }
  }

  /**
   * 启动进度条
   */
  start(total?: number, current?: number): void {
    if (this.isActive) {
      return
    }

    const startTotal = total || this.options.total
    const startCurrent = current || this.options.current

    this.bar = new cliProgress.SingleBar({
      format: this.options.format,
      barCompleteChar: this.options.barCompleteChar,
      barIncompleteChar: this.options.barIncompleteChar,
      barGlue: this.options.barGlue,
      hideCursor: this.options.hideCursor,
      clearOnComplete: this.options.clearOnComplete,
      stopOnComplete: this.options.stopOnComplete,
      stream: this.options.stream,
      etaBuffer: this.options.etaBuffer,
      fps: this.options.fps,
      barsize: this.options.barsize,
      linewrap: this.options.linewrap,
      autopadding: this.options.autopadding,
      autopaddingChar: this.options.autopaddingChar,
      emptyOnZero: this.options.emptyOnZero,
      forceRedraw: this.options.forceRedraw,
    } as any)

    this.bar.start(startTotal, startCurrent)
    this.isActive = true
    this.startTime = Date.now()

    this.emit('start', startTotal)
  }

  /**
   * 更新进度
   */
  update(current: number, payload?: Record<string, unknown>): void {
    if (!this.isActive || !this.bar) {
      return
    }

    this.bar.update(current, payload)

    this.emit('update', current, this.options.total)

    // 检查是否完成
    if (current >= this.options.total) {
      this.complete()
    }
  }

  /**
   * 增加进度
   */
  increment(delta = 1, payload?: Record<string, unknown>): void {
    if (!this.isActive || !this.bar) {
      return
    }

    this.bar.increment(delta, payload)

    const current = this.bar.getProgress() * this.options.total
    this.emit('update', current, this.options.total)

    // 检查是否完成
    if (current >= this.options.total) {
      this.complete()
    }
  }

  /**
   * 设置总数
   */
  setTotal(total: number): void {
    this.options.total = total
    if (this.bar) {
      this.bar.setTotal(total)
    }
  }

  /**
   * 获取当前进度
   */
  getProgress(): number {
    if (!this.bar) {
      return 0
    }
    return this.bar.getProgress()
  }

  /**
   * 获取当前值
   */
  getValue(): number {
    if (!this.bar) {
      return 0
    }
    return Math.round(this.bar.getProgress() * this.options.total)
  }

  /**
   * 获取总数
   */
  getTotal(): number {
    return this.options.total
  }

  /**
   * 获取运行时间
   */
  getDuration(): number {
    return Date.now() - this.startTime
  }

  /**
   * 获取预计剩余时间
   */
  getEta(): number {
    if (!this.bar) {
      return 0
    }

    const progress = this.getProgress()
    if (progress === 0) {
      return 0
    }

    const elapsed = this.getDuration() / 1000
    const rate = progress / elapsed
    const remaining = (1 - progress) / rate

    return Math.round(remaining)
  }

  /**
   * 获取处理速率
   */
  getRate(): number {
    const elapsed = this.getDuration() / 1000
    const current = this.getValue()
    return elapsed > 0 ? current / elapsed : 0
  }

  /**
   * 完成进度条
   */
  complete(): void {
    if (!this.isActive || !this.bar) {
      return
    }

    this.bar.update(this.options.total)
    this.bar.stop()
    this.isActive = false

    this.emit('complete')
  }

  /**
   * 停止进度条
   */
  stop(): void {
    if (!this.isActive || !this.bar) {
      return
    }

    this.bar.stop()
    this.isActive = false

    this.emit('stop')
  }

  /**
   * 检查是否活跃
   */
  isRunning(): boolean {
    return this.isActive
  }

  /**
   * 更新格式
   */
  updateFormat(format: string): void {
    this.options.format = format
    // 注意：cli-progress 不支持动态更新格式，需要重新创建
  }

  /**
   * 更新主题
   */
  updateTheme(themeName: string): void {
    this.theme.setTheme(themeName)
    this.options.theme = themeName
    this.options.format = this.getDefaultFormat()
  }

  // 私有方法

  private getDefaultFormat(): string {
    const theme = this.theme.getCurrentTheme()
    let format = theme.progressBar.format

    // 根据选项调整格式
    if (!this.options.showPercentage) {
      format = format.replace('{percentage}%', '')
    }
    if (!this.options.showEta) {
      format = format.replace('ETA: {eta}s', '')
    }
    if (!this.options.showValue) {
      format = format.replace('{value}/{total}', '')
    }

    return format.replace(/\s+/g, ' ').trim()
  }

  /**
   * 创建简单进度条
   */
  static createSimple(total: number, options: Partial<ProgressBarOptions> = {}): ProgressBar {
    return new ProgressBar({
      total,
      format: '{bar} {percentage}%',
      showEta: false,
      showValue: false,
      ...options,
    })
  }

  /**
   * 创建详细进度条
   */
  static createDetailed(total: number, options: Partial<ProgressBarOptions> = {}): ProgressBar {
    return new ProgressBar({
      total,
      format: '{bar} {percentage}% | {value}/{total} | ETA: {eta}s | Rate: {rate}/s',
      showPercentage: true,
      showEta: true,
      showValue: true,
      showRate: true,
      ...options,
    })
  }

  /**
   * 创建百分比进度条
   */
  static createPercentage(total: number, options: Partial<ProgressBarOptions> = {}): ProgressBar {
    return new ProgressBar({
      total,
      format: '{percentage}% [{bar}]',
      showEta: false,
      showValue: false,
      ...options,
    })
  }

  /**
   * 创建步骤式进度条
   */
  static createSteps(total: number, options: Partial<ProgressBarOptions> = {}): ProgressBar {
    return new ProgressBar({
      total,
      format: 'Step {value}/{total} [{bar}] {percentage}%',
      showEta: false,
      ...options,
    })
  }

  /**
   * 创建自定义进度条
   */
  static create(options: ProgressBarOptions): ProgressBar {
    return new ProgressBar(options)
  }
}
