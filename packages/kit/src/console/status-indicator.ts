/**
 * 状态指示器组件
 * 提供成功、失败、警告、信息等状态的可视化显示
 */

import { EventEmitter } from 'node:events'
import chalk from 'chalk'
import { ConsoleTheme } from './console-theme'

/**
 * 状态类型
 */
export type StatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'pending'
  | 'skipped'
  | 'custom'

/**
 * 状态指示器选项
 */
export interface StatusIndicatorOptions {
  theme?: string
  showTimestamp?: boolean
  showDuration?: boolean
  indent?: number
  prefix?: string
  suffix?: string
  stream?: NodeJS.WriteStream
  customSymbols?: Record<string, string>
  customColors?: Record<string, string>
}

/**
 * 状态消息
 */
export interface StatusMessage {
  type: StatusType
  message: string
  timestamp?: Date
  duration?: number
  metadata?: Record<string, unknown>
}

/**
 * 状态统计
 */
export interface StatusStats {
  total: number
  success: number
  error: number
  warning: number
  info: number
  loading: number
  pending: number
  skipped: number
  custom: number
}

/**
 * 状态指示器类
 */
export class StatusIndicator extends EventEmitter {
  private options: Required<StatusIndicatorOptions>
  private theme: ConsoleTheme
  private messages: StatusMessage[] = []
  private stats: StatusStats = {
    total: 0,
    success: 0,
    error: 0,
    warning: 0,
    info: 0,
    loading: 0,
    pending: 0,
    skipped: 0,
    custom: 0,
  }

  constructor(options: StatusIndicatorOptions = {}) {
    super()

    this.theme = ConsoleTheme.create(options.theme)

    this.options = {
      theme: options.theme || 'default',
      showTimestamp: options.showTimestamp !== false,
      showDuration: options.showDuration !== false,
      indent: options.indent || 0,
      prefix: options.prefix || '',
      suffix: options.suffix || '',
      stream: options.stream || process.stdout,
      customSymbols: options.customSymbols || {},
      customColors: options.customColors || {},
    }
  }

  /**
   * 显示成功状态
   */
  success(message: string, metadata?: Record<string, unknown>): void {
    this.show('success', message, metadata)
  }

  /**
   * 显示错误状态
   */
  error(message: string, metadata?: Record<string, unknown>): void {
    this.show('error', message, metadata)
  }

  /**
   * 显示警告状态
   */
  warning(message: string, metadata?: Record<string, unknown>): void {
    this.show('warning', message, metadata)
  }

  /**
   * 显示信息状态
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.show('info', message, metadata)
  }

  /**
   * 显示加载状态
   */
  loading(message: string, metadata?: Record<string, unknown>): void {
    this.show('loading', message, metadata)
  }

  /**
   * 显示待处理状态
   */
  pending(message: string, metadata?: Record<string, unknown>): void {
    this.show('pending', message, metadata)
  }

  /**
   * 显示跳过状态
   */
  skipped(message: string, metadata?: Record<string, unknown>): void {
    this.show('skipped', message, metadata)
  }

  /**
   * 显示自定义状态
   */
  custom(message: string, symbol: string, color: string, metadata?: Record<string, any>): void {
    this.options.customSymbols.custom = symbol
    this.options.customColors.custom = color
    this.show('custom', message, metadata)
  }

  /**
   * 显示状态消息
   */
  show(type: StatusType, message: string, metadata?: Record<string, any>): void {
    const timestamp = new Date()
    const statusMessage: StatusMessage = {
      type,
      message,
      timestamp,
      metadata,
    }

    this.messages.push(statusMessage)
    this.updateStats(type)

    const formattedMessage = this.formatMessage(statusMessage)
    this.options.stream.write(`${formattedMessage}\n`)

    this.emit('status', statusMessage)
    this.emit(type, statusMessage)
  }

  /**
   * 显示多个状态
   */
  showMultiple(
    statuses: Array<{ type: StatusType, message: string, metadata?: Record<string, any> }>,
  ): void {
    statuses.forEach((status) => {
      this.show(status.type, status.message, status.metadata)
    })
  }

  /**
   * 显示状态列表
   */
  showList(
    title: string,
    items: Array<{ message: string, type?: StatusType, metadata?: Record<string, any> }>,
  ): void {
    this.info(title)

    items.forEach((item) => {
      const type = item.type || 'info'
      const indentedMessage = `  ${item.message}`
      this.show(type, indentedMessage, item.metadata)
    })
  }

  /**
   * 显示状态表格
   */
  showTable(headers: string[], rows: Array<Array<{ value: string, type?: StatusType }>>): void {
    // 计算列宽
    const columnWidths = headers.map((header, index) => {
      const maxContentWidth = Math.max(
        header.length,
        ...rows.map(row => row[index]?.value?.length || 0),
      )
      return Math.max(maxContentWidth, 10)
    })

    // 显示表头
    const headerRow = headers.map((header, index) => header.padEnd(columnWidths[index] ?? 10)).join(' | ')

    this.info(headerRow)
    this.info('-'.repeat(headerRow.length))

    // 显示数据行
    rows.forEach((row) => {
      const formattedRow = row
        .map((cell, index) => {
          const width = columnWidths[index] ?? 10
          const safeCell = cell ?? { value: '', type: 'info' as StatusType }
          const value = String(safeCell.value ?? '').padEnd(width)
          const type = safeCell.type || 'info'
          return this.colorizeText(value, type)
        })
        .join(' | ')

      this.options.stream.write(`${formattedRow}\n`)
    })
  }

  /**
   * 显示进度状态
   */
  showProgress(current: number, total: number, message: string): void {
    const percentage = Math.round((current / total) * 100)
    const progressBar = this.theme.createProgressBar(current, total, 20)
    const progressMessage = `${message} ${progressBar} ${percentage}% (${current}/${total})`

    this.info(progressMessage)
  }

  /**
   * 显示分组状态
   */
  showGroup(
    title: string,
    statuses: Array<{ type: StatusType, message: string, metadata?: Record<string, any> }>,
  ): void {
    this.info(this.theme.createTitle(title, 2))

    statuses.forEach((status) => {
      const indentedMessage = `  ${status.message}`
      this.show(status.type, indentedMessage, status.metadata)
    })

    this.info('')
  }

  /**
   * 显示摘要
   */
  showSummary(title = '执行摘要'): void {
    this.info('')
    this.info(this.theme.createSeparator())
    this.info(this.theme.createTitle(title, 1))
    this.info('')

    const stats = this.getStats()

    if (stats.success > 0) {
      this.success(`成功: ${stats.success}`)
    }
    if (stats.error > 0) {
      this.error(`失败: ${stats.error}`)
    }
    if (stats.warning > 0) {
      this.warning(`警告: ${stats.warning}`)
    }
    if (stats.info > 0) {
      this.info(`信息: ${stats.info}`)
    }
    if (stats.skipped > 0) {
      this.skipped(`跳过: ${stats.skipped}`)
    }

    this.info('')
    this.info(`总计: ${stats.total}`)
    this.info(this.theme.createSeparator())
  }

  /**
   * 清除所有状态
   */
  clear(): void {
    this.messages = []
    this.resetStats()
    this.emit('cleared')
  }

  /**
   * 获取所有消息
   */
  getMessages(): StatusMessage[] {
    return [...this.messages]
  }

  /**
   * 获取指定类型的消息
   */
  getMessagesByType(type: StatusType): StatusMessage[] {
    return this.messages.filter(msg => msg.type === type)
  }

  /**
   * 获取统计信息
   */
  getStats(): StatusStats {
    return { ...this.stats }
  }

  /**
   * 获取最后一条消息
   */
  getLastMessage(): StatusMessage | null {
    return this.messages.length > 0 ? (this.messages[this.messages.length - 1] as StatusMessage) : null
  }

  /**
   * 检查是否有错误
   */
  hasErrors(): boolean {
    return this.stats.error > 0
  }

  /**
   * 检查是否有警告
   */
  hasWarnings(): boolean {
    return this.stats.warning > 0
  }

  /**
   * 导出消息
   */
  export(format: 'json' | 'text' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(
        {
          messages: this.messages,
          stats: this.stats,
          timestamp: new Date(),
        },
        null,
        2,
      )
    }
    else {
      return this.messages.map(msg => this.formatMessage(msg, false)).join('\n')
    }
  }

  // 私有方法

  private formatMessage(message: StatusMessage, useColors = true): string {
    const symbol = this.getSymbol(message.type)
    const coloredSymbol = useColors ? this.colorizeSymbol(symbol, message.type) : symbol
    const indent = ' '.repeat(this.options.indent)

    let formatted = `${indent}${this.options.prefix}${coloredSymbol} ${message.message}${this.options.suffix}`

    if (this.options.showTimestamp && message.timestamp) {
      const timestamp = message.timestamp.toLocaleTimeString()
      formatted += ` ${this.theme.muted(`[${timestamp}]`)}`
    }

    if (this.options.showDuration && message.duration) {
      formatted += ` ${this.theme.muted(`(${message.duration}ms)`)}`
    }

    return formatted
  }

  private getSymbol(type: StatusType): string {
    if (this.options.customSymbols[type]) {
      return this.options.customSymbols[type]
    }

    switch (type) {
      case 'success':
        return this.theme.symbol('success')
      case 'error':
        return this.theme.symbol('error')
      case 'warning':
        return this.theme.symbol('warning')
      case 'info':
        return this.theme.symbol('info')
      case 'loading':
        return this.theme.symbol('loading')
      case 'pending':
        return '⏳'
      case 'skipped':
        return '⏭'
      case 'custom':
        return '●'
      default:
        return '•'
    }
  }

  private colorizeSymbol(symbol: string, type: StatusType): string {
    if (this.options.customColors[type]) {
      return chalk.hex(this.options.customColors[type])(symbol)
    }

    switch (type) {
      case 'success':
        return this.theme.color('success')(symbol)
      case 'error':
        return this.theme.color('error')(symbol)
      case 'warning':
        return this.theme.color('warning')(symbol)
      case 'info':
        return this.theme.color('info')(symbol)
      case 'loading':
        return this.theme.color('primary')(symbol)
      case 'pending':
        return this.theme.color('secondary')(symbol)
      case 'skipped':
        return this.theme.color('muted')(symbol)
      case 'custom':
        return this.theme.color('primary')(symbol)
      default:
        return this.theme.color('text')(symbol)
    }
  }

  private colorizeText(text: string, type: StatusType): string {
    if (this.options.customColors[type]) {
      return chalk.hex(this.options.customColors[type])(text)
    }

    switch (type) {
      case 'success':
        return this.theme.color('success')(text)
      case 'error':
        return this.theme.color('error')(text)
      case 'warning':
        return this.theme.color('warning')(text)
      case 'info':
        return this.theme.color('info')(text)
      default:
        return text
    }
  }

  private updateStats(type: StatusType): void {
    this.stats.total++
    this.stats[type]++
  }

  private resetStats(): void {
    this.stats = {
      total: 0,
      success: 0,
      error: 0,
      warning: 0,
      info: 0,
      loading: 0,
      pending: 0,
      skipped: 0,
      custom: 0,
    }
  }

  /**
   * 创建状态指示器实例
   */
  static create(options: StatusIndicatorOptions = {}): StatusIndicator {
    return new StatusIndicator(options)
  }

  /**
   * 创建简单状态指示器
   */
  static createSimple(): StatusIndicator {
    return new StatusIndicator({
      showTimestamp: false,
      showDuration: false,
    })
  }

  /**
   * 创建详细状态指示器
   */
  static createDetailed(): StatusIndicator {
    return new StatusIndicator({
      showTimestamp: true,
      showDuration: true,
    })
  }
}
