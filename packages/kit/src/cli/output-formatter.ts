/**
 * 输出格式化器
 */

import type { OutputFormatterOptions } from '../types'

/**
 * 输出格式化器
 */
export class OutputFormatter {
  private options: Required<OutputFormatterOptions>

  constructor(options: OutputFormatterOptions = {}) {
    this.options = {
      colors: options.colors ?? true,
      indent: options.indent ?? 2,
      maxWidth: options.maxWidth ?? 80,
      ...options,
    }
  }

  /**
   * 输出信息
   */
  info(message: string): void {
    this.writeLine(this.formatMessage(message, 'info'))
  }

  /**
   * 输出成功信息
   */
  success(message: string): void {
    this.writeLine(this.formatMessage(message, 'success'))
  }

  /**
   * 输出警告信息
   */
  warn(message: string): void {
    console.warn(this.formatMessage(message, 'warn'))
  }

  /**
   * 输出错误信息
   */
  error(message: string): void {
    console.error(this.formatMessage(message, 'error'))
  }

  /**
   * 输出调试信息
   */
  debug(message: string): void {
    if (process.env.DEBUG) {
      this.writeLine(this.formatMessage(message, 'debug'))
    }
  }

  /**
   * 格式化消息
   */
  private formatMessage(
    message: string,
    type: 'info' | 'success' | 'warn' | 'error' | 'debug',
  ): string {
    if (!this.options.colors) {
      return message
    }

    const colors = {
      info: '\x1B[36m', // cyan
      success: '\x1B[32m', // green
      warn: '\x1B[33m', // yellow
      error: '\x1B[31m', // red
      debug: '\x1B[90m', // gray
      reset: '\x1B[0m',
    }

    return `${colors[type]}${message}${colors.reset}`
  }

  /**
   * 写一行到标准输出
   */
  private writeLine(str: string): void {
    process.stdout.write(`${str}\n`)
  }

  /**
   * 创建进度条
   */
  createProgressBar(
    total: number,
    options: {
      format?: string
      width?: number
      complete?: string
      incomplete?: string
    } = {},
  ): {
    update: (current: number) => void
    complete: () => void
  } {
    const opts = {
      format: options.format ?? ':bar :percent :current/:total',
      width: options.width ?? 40,
      complete: options.complete ?? '█',
      incomplete: options.incomplete ?? '░',
    }

    let current = 0

    const update = (value: number) => {
      current = Math.min(value, total)
      const percent = Math.round((current / total) * 100)
      const completed = Math.round((current / total) * opts.width)
      const remaining = opts.width - completed

      const bar = opts.complete.repeat(completed) + opts.incomplete.repeat(remaining)
      const output = opts.format
        .replace(':bar', bar)
        .replace(':percent', `${percent}%`)
        .replace(':current', current.toString())
        .replace(':total', total.toString())

      process.stdout.write(`\r${output}`)
    }

    const complete = () => {
      update(total)
      process.stdout.write('\n')
    }

    return { update, complete }
  }

  /**
   * 创建加载动画
   */
  createSpinner(message = 'Loading...'): {
    start: () => void
    stop: () => void
    succeed: (text?: string) => void
    fail: (text?: string) => void
  } {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    let frameIndex = 0
    let interval: NodeJS.Timeout | null = null

    const start = () => {
      if (interval)
        return

      interval = setInterval(() => {
        const frame = frames[frameIndex]
        process.stdout.write(`\r${frame} ${message}`)
        frameIndex = (frameIndex + 1) % frames.length
      }, 80)
    }

    const stop = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
        process.stdout.write('\r')
      }
    }

    const succeed = (text?: string) => {
      stop()
      this.success(`✓ ${text || message}`)
    }

    const fail = (text?: string) => {
      stop()
      this.error(`✗ ${text || message}`)
    }

    return { start, stop, succeed, fail }
  }

  /**
   * 显示表格
   */
  table(
    data: Array<Record<string, unknown>>,
    options: {
      headers?: string[]
      maxColumnWidth?: number
      border?: boolean
    } = {},
  ): void {
    if (data.length === 0)
      return

    const opts = {
      headers: options.headers,
      maxColumnWidth: options.maxColumnWidth ?? 30,
      border: options.border ?? true,
    }

    // 获取列名
    const columns = opts.headers || Object.keys(data[0] || {})

    // 计算列宽
    const columnWidths = columns.map((col) => {
      const headerWidth = col.length
      const dataWidth = Math.max(...data.map(row => String(row[col] || '').length))
      return Math.min(Math.max(headerWidth, dataWidth), opts.maxColumnWidth)
    })

    // 创建分隔线
    const separator = opts.border ? `+${columnWidths.map(w => '-'.repeat(w + 2)).join('+')}+` : ''

    // 输出表格
    if (opts.border)
      this.writeLine(separator)

    // 输出表头
    const headerRow = columns
      .map((col, i) => this.padString(col, columnWidths[i] || 0))
      .join(opts.border ? ' | ' : '  ')

    this.writeLine(opts.border ? `| ${headerRow} |` : headerRow)

    if (opts.border)
      this.writeLine(separator)

    // 输出数据行
    data.forEach((row) => {
      const dataRow = columns
        .map((col, i) => this.padString(String(row[col] || ''), columnWidths[i] || 0))
        .join(opts.border ? ' | ' : '  ')

      this.writeLine(opts.border ? `| ${dataRow} |` : dataRow)
    })

    if (opts.border)
      this.writeLine(separator)
  }

  /**
   * 显示列表
   */
  list(
    items: string[],
    options: {
      bullet?: string
      indent?: number
      numbered?: boolean
    } = {},
  ): void {
    const opts = {
      bullet: options.bullet ?? '•',
      indent: options.indent ?? this.options.indent,
      numbered: options.numbered ?? false,
    }

    const indentStr = ' '.repeat(opts.indent)

    items.forEach((item, index) => {
      const prefix = opts.numbered ? `${index + 1}.` : opts.bullet

      this.writeLine(`${indentStr}${prefix} ${item}`)
    })
  }

  /**
   * 显示 JSON
   */
  json(
    data: unknown,
    options: {
      indent?: number
      colors?: boolean
    } = {},
  ): void {
    const opts = {
      indent: options.indent ?? 2,
      colors: options.colors ?? this.options.colors,
    }

    const jsonStr = JSON.stringify(data, null, opts.indent)

    if (opts.colors) {
      // 简单的 JSON 语法高亮
      const highlighted = jsonStr
        .replace(/"([^"]+)":/g, '\x1B[34m"$1"\x1B[0m:') // 键名 - 蓝色
        .replace(/: "([^"]+)"/g, ': \x1B[32m"$1"\x1B[0m') // 字符串值 - 绿色
        .replace(/: (\d+)/g, ': \x1B[33m$1\x1B[0m') // 数字值 - 黄色
        .replace(/: (true|false)/g, ': \x1B[35m$1\x1B[0m') // 布尔值 - 紫色
        .replace(/: null/g, ': \x1B[90mnull\x1B[0m') // null - 灰色

      this.writeLine(highlighted)
    }
    else {
      this.writeLine(jsonStr)
    }
  }

  /**
   * 清屏
   */
  clear(): void {
    process.stdout.write('\x1B[2J\x1B[0f')
  }

  /**
   * 输出分隔线
   */
  separator(char = '-', length?: number): void {
    const len = length || this.options.maxWidth
    this.writeLine(char.repeat(len))
  }

  /**
   * 输出空行
   */
  newline(count = 1): void {
    process.stdout.write('\n'.repeat(count))
  }

  /**
   * 格式化文本框
   */
  box(
    text: string,
    options: {
      padding?: number
      margin?: number
      borderStyle?: 'single' | 'double' | 'rounded'
      align?: 'left' | 'center' | 'right'
    } = {},
  ): void {
    const opts = {
      padding: options.padding ?? 1,
      margin: options.margin ?? 0,
      borderStyle: options.borderStyle ?? 'single',
      align: options.align ?? 'center',
    }

    const borders = {
      single: { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘' },
      double: { h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝' },
      rounded: { h: '─', v: '│', tl: '╭', tr: '╮', bl: '╰', br: '╯' },
    }

    const border = borders[opts.borderStyle]
    const lines = text.split('\n')
    const maxLength = Math.max(...lines.map(line => line.length))
    const boxWidth = maxLength + opts.padding * 2

    const marginStr = ' '.repeat(opts.margin)

    // 顶部边框
    this.writeLine(marginStr + border.tl + border.h.repeat(boxWidth) + border.tr)

    // 内容
    lines.forEach((line) => {
      const paddedLine = this.alignText(line, maxLength, opts.align)
      const padding = ' '.repeat(opts.padding)
      this.writeLine(marginStr + border.v + padding + paddedLine + padding + border.v)
    })

    // 底部边框
    this.writeLine(marginStr + border.bl + border.h.repeat(boxWidth) + border.br)
  }

  /**
   * 填充字符串到指定长度
   */
  private padString(str: string, length: number): string {
    if (str.length >= length) {
      return `${str.substring(0, length - 3)}...`
    }
    return str + ' '.repeat(length - str.length)
  }

  /**
   * 对齐文本
   */
  private alignText(text: string, width: number, align: 'left' | 'center' | 'right'): string {
    if (text.length >= width)
      return text

    const padding = width - text.length

    switch (align) {
      case 'center': {
        const leftPad = Math.floor(padding / 2)
        const rightPad = padding - leftPad
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad)
      }

      case 'right': {
        return ' '.repeat(padding) + text
      }

      default: { // left
        return text + ' '.repeat(padding)
      }
    }
  }

  /**
   * 创建输出格式化器实例
   */
  static create(options?: OutputFormatterOptions): OutputFormatter {
    return new OutputFormatter(options)
  }
}
