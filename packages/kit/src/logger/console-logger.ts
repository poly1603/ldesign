/**
 * 控制台日志传输器
 * 提供彩色控制台输出功能
 */

import type { LogEntry, LogTransport } from '../types'

/**
 * 控制台日志器选项
 */
export interface ConsoleLoggerOptions {
  colors?: boolean
  timestamp?: boolean
  module?: boolean
  level?: boolean
  icons?: boolean
  output?: NodeJS.WriteStream
  errorOutput?: NodeJS.WriteStream
}

/**
 * 控制台日志传输器类
 */
export class ConsoleLogger implements LogTransport {
  private options: Required<ConsoleLoggerOptions>

  constructor(options: ConsoleLoggerOptions = {}) {
    this.options = {
      colors: true,
      timestamp: true,
      module: true,
      level: true,
      icons: true,
      output: process.stdout,
      errorOutput: process.stderr,
      ...options,
    }
  }

  /**
   * 记录日志
   */
  async log(entry: LogEntry): Promise<void> {
    const formatted = this.formatEntry(entry)
    const output = entry.level === 'error' ? this.options.errorOutput : this.options.output

    output.write(`${formatted}\n`)
  }

  /**
   * 格式化日志条目
   */
  private formatEntry(entry: LogEntry): string {
    let formatted = ''

    // 时间戳
    if (this.options.timestamp) {
      const timestamp = this.formatTimestamp(entry.timestamp)
      formatted += this.options.colors ? this.colorize(timestamp, 'gray') : timestamp
      formatted += ' '
    }

    // 图标
    if (this.options.icons) {
      const icon = this.getIcon(entry.level, entry.type)
      formatted += `${icon} `
    }

    // 级别
    if (this.options.level) {
      const level = this.formatLevel(entry.level)
      formatted += `${level} `
    }

    // 模块
    if (this.options.module && entry.module) {
      const module = `[${entry.module}]`
      formatted += this.options.colors ? this.colorize(module, 'magenta') : module
      formatted += ' '
    }

    // 消息
    const messageColor = this.getMessageColor(entry.level, entry.type)
    formatted += this.options.colors ? this.colorize(entry.message, messageColor) : entry.message

    // 数据
    if (entry.data !== undefined) {
      const dataStr = this.formatData(entry.data)
      formatted += this.options.colors ? this.colorize(dataStr, 'gray') : dataStr
    }

    return formatted
  }

  /**
   * 格式化时间戳
   */
  private formatTimestamp(timestamp: Date): string {
    return `[${timestamp.toLocaleTimeString()}]`
  }

  /**
   * 格式化级别
   */
  private formatLevel(level: string): string {
    const levelStr = `[${level.toUpperCase()}]`

    if (!this.options.colors) {
      return levelStr
    }

    const colors: Record<string, string> = {
      debug: 'cyan',
      info: 'blue',
      warn: 'yellow',
      error: 'red',
    }

    return this.colorize(levelStr, colors[level] || 'white')
  }

  /**
   * 获取图标
   */
  private getIcon(level: string, type?: string): string {
    if (type === 'success') {
      return '✅'
    }

    const icons: Record<string, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }

    return icons[level] || 'ℹ️'
  }

  /**
   * 获取消息颜色
   */
  private getMessageColor(level: string, type?: string): string {
    if (type === 'success') {
      return 'green'
    }

    const colors: Record<string, string> = {
      debug: 'white',
      info: 'white',
      warn: 'yellow',
      error: 'red',
    }

    return colors[level] || 'white'
  }

  /**
   * 格式化数据
   */
  private formatData(data: any): string {
    if (data === null)
      return ' | null'
    if (data === undefined)
      return ''

    if (typeof data === 'string') {
      return ` | ${data}`
    }

    if (typeof data === 'object') {
      try {
        return ` | ${JSON.stringify(data)}`
      }
      catch {
        return ` | [Object]`
      }
    }

    return ` | ${String(data)}`
  }

  /**
   * 着色文本
   */
  private colorize(text: string, color: string): string {
    const colors: Record<string, string> = {
      black: '\x1B[30m',
      red: '\x1B[31m',
      green: '\x1B[32m',
      yellow: '\x1B[33m',
      blue: '\x1B[34m',
      magenta: '\x1B[35m',
      cyan: '\x1B[36m',
      white: '\x1B[37m',
      gray: '\x1B[90m',
      bright: '\x1B[1m',
      dim: '\x1B[2m',
      reset: '\x1B[0m',
    }

    const colorCode = colors[color] || colors.white
    const resetCode = colors.reset

    return `${colorCode}${text}${resetCode}`
  }

  /**
   * 设置选项
   */
  setOptions(options: Partial<ConsoleLoggerOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取选项
   */
  getOptions(): Required<ConsoleLoggerOptions> {
    return { ...this.options }
  }

  /**
   * 启用颜色
   */
  enableColors(): void {
    this.options.colors = true
  }

  /**
   * 禁用颜色
   */
  disableColors(): void {
    this.options.colors = false
  }

  /**
   * 启用时间戳
   */
  enableTimestamp(): void {
    this.options.timestamp = true
  }

  /**
   * 禁用时间戳
   */
  disableTimestamp(): void {
    this.options.timestamp = false
  }

  /**
   * 启用模块显示
   */
  enableModule(): void {
    this.options.module = true
  }

  /**
   * 禁用模块显示
   */
  disableModule(): void {
    this.options.module = false
  }

  /**
   * 启用级别显示
   */
  enableLevel(): void {
    this.options.level = true
  }

  /**
   * 禁用级别显示
   */
  disableLevel(): void {
    this.options.level = false
  }

  /**
   * 启用图标
   */
  enableIcons(): void {
    this.options.icons = true
  }

  /**
   * 禁用图标
   */
  disableIcons(): void {
    this.options.icons = false
  }

  /**
   * 检查是否支持颜色
   */
  static supportsColor(): boolean {
    // 检查环境变量
    if (process.env.FORCE_COLOR) {
      return true
    }

    if (process.env.NO_COLOR || process.env.NODE_DISABLE_COLORS) {
      return false
    }

    // 检查终端支持
    if (process.stdout && process.stdout.isTTY) {
      return true
    }

    return false
  }

  /**
   * 创建控制台日志器实例
   */
  static create(options?: ConsoleLoggerOptions): ConsoleLogger {
    return new ConsoleLogger(options)
  }
}
