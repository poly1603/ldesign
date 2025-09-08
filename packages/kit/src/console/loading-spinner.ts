/**
 * 加载动画组件
 * 提供多种样式的加载动画效果
 */

import type { Ora } from 'ora'
import { EventEmitter } from 'node:events'
import ora from 'ora'
import { ConsoleTheme } from './console-theme'

/**
 * 加载动画选项
 */
export interface LoadingSpinnerOptions {
  text?: string
  spinner?: string | SpinnerConfig
  color?: string
  theme?: string
  hideCursor?: boolean
  indent?: number
  interval?: number
  stream?: NodeJS.WriteStream
  isEnabled?: boolean
  isSilent?: boolean
  discardStdin?: boolean
  prefixText?: string
  suffixText?: string
}

/**
 * 自定义动画配置
 */
export interface SpinnerConfig {
  interval: number
  frames: string[]
}

/**
 * 预定义动画类型
 */
export type SpinnerType =
  | 'dots'
  | 'dots2'
  | 'dots3'
  | 'dots4'
  | 'dots5'
  | 'dots6'
  | 'dots7'
  | 'dots8'
  | 'dots9'
  | 'dots10'
  | 'dots11'
  | 'dots12'
  | 'line'
  | 'line2'
  | 'pipe'
  | 'simpleDots'
  | 'simpleDotsScrolling'
  | 'star'
  | 'star2'
  | 'flip'
  | 'hamburger'
  | 'growVertical'
  | 'growHorizontal'
  | 'balloon'
  | 'balloon2'
  | 'noise'
  | 'bounce'
  | 'boxBounce'
  | 'boxBounce2'
  | 'triangle'
  | 'arc'
  | 'circle'
  | 'squareCorners'
  | 'circleQuarters'
  | 'circleHalves'
  | 'squish'
  | 'toggle'
  | 'toggle2'
  | 'toggle3'
  | 'toggle4'
  | 'toggle5'
  | 'toggle6'
  | 'toggle7'
  | 'toggle8'
  | 'toggle9'
  | 'toggle10'
  | 'toggle11'
  | 'toggle12'
  | 'toggle13'
  | 'arrow'
  | 'arrow2'
  | 'arrow3'
  | 'bouncingBar'
  | 'bouncingBall'

/**
 * 加载状态
 */
export type LoadingStatus = 'loading' | 'success' | 'error' | 'warning' | 'info' | 'stopped'

/**
 * 加载动画类
 */
export class LoadingSpinner extends EventEmitter {
  private spinner: Ora | null = null
  private options: LoadingSpinnerOptions
  private isActive = false
  private startTime = 0

  constructor(options: LoadingSpinnerOptions = {}) {
    super()

    ConsoleTheme.create(options.theme)
    this.options = {
      text: options.text || 'Loading...',
      spinner: options.spinner || 'dots',
      color: options.color || 'cyan',
      theme: options.theme || 'default',
      hideCursor: options.hideCursor !== false,
      indent: options.indent || 0,
      interval: options.interval,
      stream: options.stream || process.stdout,
      isEnabled: options.isEnabled !== false,
      isSilent: options.isSilent !== false,
      discardStdin: options.discardStdin !== false,
      prefixText: options.prefixText,
      suffixText: options.suffixText,
    }
  }

  /**
   * 启动加载动画
   */
  start(text?: string): void {
    if (this.isActive) {
      return
    }

    const spinnerOptions: any = {
      text: text || this.options.text,
      spinner: this.options.spinner,
      color: this.options.color,
      hideCursor: this.options.hideCursor,
      indent: this.options.indent,
      stream: this.options.stream,
      isEnabled: this.options.isEnabled,
      isSilent: this.options.isSilent,
      discardStdin: this.options.discardStdin,
    }

    if (this.options.interval) {
      spinnerOptions.interval = this.options.interval
    }

    if (this.options.prefixText) {
      spinnerOptions.prefixText = this.options.prefixText
    }

    if (this.options.suffixText) {
      spinnerOptions.suffixText = this.options.suffixText
    }

    this.spinner = ora(spinnerOptions)
    this.spinner.start()
    this.isActive = true
    this.startTime = Date.now()

    this.emit('start', text || this.options.text)
  }

  /**
   * 更新文本
   */
  updateText(text: string): void {
    if (this.spinner && this.isActive) {
      this.spinner.text = text
      this.emit('update', text)
    }
  }

  /**
   * 更新颜色
   */
  updateColor(color: string): void {
    if (this.spinner && this.isActive) {
      this.spinner.color = color as any
      this.options.color = color
    }
  }

  /**
   * 更新动画类型
   */
  updateSpinner(spinner: string | SpinnerConfig): void {
    if (this.spinner && this.isActive) {
      this.spinner.spinner = spinner as any
      this.options.spinner = spinner
    }
  }

  /**
   * 成功完成
   */
  succeed(text?: string): void {
    if (this.spinner && this.isActive) {
      this.spinner.succeed(text)
      this.isActive = false
      this.emit('success', text)
    }
  }

  /**
   * 失败完成
   */
  fail(text?: string): void {
    if (this.spinner && this.isActive) {
      this.spinner.fail(text)
      this.isActive = false
      this.emit('error', text)
    }
  }

  /**
   * 警告完成
   */
  warn(text?: string): void {
    if (this.spinner && this.isActive) {
      this.spinner.warn(text)
      this.isActive = false
      this.emit('warning', text)
    }
  }

  /**
   * 信息完成
   */
  info(text?: string): void {
    if (this.spinner && this.isActive) {
      this.spinner.info(text)
      this.isActive = false
      this.emit('info', text)
    }
  }

  /**
   * 停止动画
   */
  stop(): void {
    if (this.spinner && this.isActive) {
      this.spinner.stop()
      this.isActive = false
      this.emit('stop')
    }
  }

  /**
   * 清除动画
   */
  clear(): void {
    if (this.spinner) {
      this.spinner.clear()
    }
  }

  /**
   * 渲染当前帧
   */
  render(): void {
    if (this.spinner && this.isActive) {
      this.spinner.render()
    }
  }

  /**
   * 获取当前文本
   */
  getText(): string {
    return this.spinner?.text || ''
  }

  /**
   * 检查是否运行中
   */
  isRunning(): boolean {
    return this.isActive
  }

  /**
   * 获取运行时间
   */
  getDuration(): number {
    return Date.now() - this.startTime
  }

  /**
   * 暂停动画
   */
  pause(): void {
    if (this.spinner && this.isActive) {
      this.spinner.stop()
      // 保持状态但停止渲染
    }
  }

  /**
   * 恢复动画
   */
  resume(): void {
    if (this.spinner && this.isActive) {
      this.spinner.start()
    }
  }

  /**
   * 设置前缀文本
   */
  setPrefixText(text: string): void {
    this.options.prefixText = text
    if (this.spinner) {
      ;(this.spinner as any).prefixText = text
    }
  }

  /**
   * 设置后缀文本
   */
  setSuffixText(text: string): void {
    this.options.suffixText = text
    if (this.spinner) {
      ;(this.spinner as any).suffixText = text
    }
  }

  /**
   * 获取当前状态
   */
  getStatus(): LoadingStatus {
    if (!this.isActive) {
      return 'stopped'
    }
    return 'loading'
  }

  /**
   * 创建简单加载动画
   */
  static createSimple(
    text = 'Loading...',
    options: Partial<LoadingSpinnerOptions> = {},
  ): LoadingSpinner {
    return new LoadingSpinner({
      text,
      spinner: 'dots',
      ...options,
    })
  }

  /**
   * 创建点状加载动画
   */
  static createDots(
    text = 'Processing...',
    options: Partial<LoadingSpinnerOptions> = {},
  ): LoadingSpinner {
    return new LoadingSpinner({
      text,
      spinner: 'dots',
      color: 'cyan',
      ...options,
    })
  }

  /**
   * 创建线条加载动画
   */
  static createLine(
    text = 'Working...',
    options: Partial<LoadingSpinnerOptions> = {},
  ): LoadingSpinner {
    return new LoadingSpinner({
      text,
      spinner: 'line',
      color: 'yellow',
      ...options,
    })
  }

  /**
   * 创建弹跳加载动画
   */
  static createBounce(
    text = 'Loading...',
    options: Partial<LoadingSpinnerOptions> = {},
  ): LoadingSpinner {
    return new LoadingSpinner({
      text,
      spinner: 'bounce',
      color: 'green',
      ...options,
    })
  }

  /**
   * 创建圆形加载动画
   */
  static createCircle(
    text = 'Please wait...',
    options: Partial<LoadingSpinnerOptions> = {},
  ): LoadingSpinner {
    return new LoadingSpinner({
      text,
      spinner: 'circle',
      color: 'blue',
      ...options,
    })
  }

  /**
   * 创建箭头加载动画
   */
  static createArrow(
    text = 'Processing...',
    options: Partial<LoadingSpinnerOptions> = {},
  ): LoadingSpinner {
    return new LoadingSpinner({
      text,
      spinner: 'arrow3',
      color: 'magenta',
      ...options,
    })
  }

  /**
   * 创建自定义加载动画
   */
  static createCustom(
    frames: string[],
    interval: number,
    text = 'Loading...',
    options: Partial<LoadingSpinnerOptions> = {},
  ): LoadingSpinner {
    return new LoadingSpinner({
      text,
      spinner: { frames, interval },
      ...options,
    })
  }

  /**
   * 创建主题化加载动画
   */
  static createThemed(
    themeName: string,
    text = 'Loading...',
    options: Partial<LoadingSpinnerOptions> = {},
  ): LoadingSpinner {
    const theme = ConsoleTheme.create(themeName)
    const themeConfig = theme.getCurrentTheme()

    return new LoadingSpinner({
      text,
      spinner: {
        frames: themeConfig.spinner.frames,
        interval: themeConfig.spinner.interval,
      },
      theme: themeName,
      ...options,
    })
  }

  /**
   * 创建多阶段加载动画
   */
  static createMultiStage(
    stages: Array<{ text: string, duration?: number }>,
    options: Partial<LoadingSpinnerOptions> = {},
  ): LoadingSpinner {
    const spinner = new LoadingSpinner(options)
    let currentStage = 0

    const nextStage = () => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage]
        if (!stage)
          return
        spinner.updateText(stage.text)

        if (stage.duration) {
          setTimeout(() => {
            currentStage++
            nextStage()
          }, stage.duration)
        }
      }
    }

    // 重写 start 方法以支持多阶段
    const originalStart = spinner.start.bind(spinner)
    spinner.start = (text?: string) => {
      originalStart(text)
      if (stages.length > 0) {
        currentStage = 0
        nextStage()
      }
    }

    return spinner
  }

  /**
   * 创建加载动画实例
   */
  static create(options: LoadingSpinnerOptions = {}): LoadingSpinner {
    return new LoadingSpinner(options)
  }
}
