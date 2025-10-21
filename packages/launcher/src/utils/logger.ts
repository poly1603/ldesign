/**
 * 日志记录器
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { createWriteStream, WriteStream } from 'fs'
import picocolors from 'picocolors'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export interface LoggerOptions {
  level?: LogLevel
  colors?: boolean
  timestamp?: boolean
  prefix?: string
  logFile?: string
  compact?: boolean // 简洁模式，减少冗余信息
}

export class Logger {
  private level: LogLevel
  private colors: boolean
  private timestamp: boolean
  private prefix: string
  private logFile?: string
  private fileStream?: WriteStream
  private compact: boolean

  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4
  }

  constructor(name: string = 'Logger', options: LoggerOptions = {}) {
    this.level = options.level || 'info'
    this.colors = options.colors !== false
    this.timestamp = options.timestamp !== false
    this.prefix = options.prefix || name
    this.logFile = options.logFile
    this.compact = options.compact || false

    if (this.logFile) {
      this.fileStream = createWriteStream(this.logFile, { flags: 'a' })
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level]
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    let formatted = ''

    // 添加时间戳（总是显示，用于性能分析）
    if (this.timestamp || true) { // 强制显示时间戳
      const now = new Date()
      const timeStr = now.toTimeString().slice(0, 8) // HH:MM:SS
      const msStr = String(now.getMilliseconds()).padStart(3, '0')
      const fullTimeStr = `${timeStr}.${msStr}`
      formatted += this.colors ? picocolors.gray(`[${fullTimeStr}]`) : `[${fullTimeStr}]`
      formatted += ' '
    }

    // 添加级别对应的emoji（简化输出）
    if (this.colors && !this.compact) {
      switch (level) {
        case 'debug':
          formatted += '🔧 '
          break
        case 'info':
          formatted += 'ℹ️  '
          break
        case 'warn':
          formatted += '⚠️  '
          break
        case 'error':
          formatted += '❌ '
          break
      }
    } else if (!this.colors) {
      // 无颜色模式下使用文字标识
      switch (level) {
        case 'debug':
          formatted += '[DEBUG] '
          break
        case 'info':
          formatted += '[INFO] '
          break
        case 'warn':
          formatted += '[WARN] '
          break
        case 'error':
          formatted += '[ERROR] '
          break
      }
    }

    formatted += message

    // 在compact模式下不显示额外数据，除非是错误
    if (data !== undefined && (!this.compact || level === 'error') && this.shouldShowSimpleData(data)) {
      formatted += ' ' + this.formatSimpleData(data)
    }

    return formatted
  }

  /**
   * 判断是否应该显示简单数据
   */
  private shouldShowSimpleData(data: any): boolean {
    // 只显示字符串和数字
    return typeof data === 'string' || typeof data === 'number'
  }

  /**
   * 格式化简单数据
   */
  private formatSimpleData(data: any): string {
    if (typeof data === 'string' || typeof data === 'number') {
      return String(data)
    }
    return ''
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return
    }

    const formatted = this.formatMessage(level, message, data)

    // 输出到控制台
    switch (level) {
      case 'debug':
        console.debug(formatted)
        break
      case 'info':
        console.log(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
    }

    // 输出到文件
    if (this.fileStream) {
      this.fileStream.write(formatted + '\n')
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data)
  }

  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  success(message: string, data?: any): void {
    const successMessage = this.colors ? picocolors.green(message) : message
    this.log('info', successMessage, data)
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  error(message: string, data?: any): void {
    this.log('error', message, data)
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  getLevel(): LogLevel {
    return this.level
  }

  setCompact(compact: boolean): void {
    this.compact = compact
  }

  getCompact(): boolean {
    return this.compact
  }

  close(): void {
    if (this.fileStream) {
      this.fileStream.end()
      this.fileStream = undefined
    }
  }
}

// 创建默认实例（使用简洁模式）
export const logger = new Logger('Launcher', {
  compact: process.env.NODE_ENV !== 'development'
})

// 便捷函数
export const debug = (message: string, data?: any) => logger.debug(message, data)
export const info = (message: string, data?: any) => logger.info(message, data)
export const success = (message: string, data?: any) => logger.success(message, data)
export const warn = (message: string, data?: any) => logger.warn(message, data)
export const error = (message: string, data?: any) => logger.error(message, data)
