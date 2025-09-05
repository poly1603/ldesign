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

    // 简洁模式下的格式化
    if (this.compact) {
      // 只显示级别和消息
      if (this.colors) {
        switch (level) {
          case 'debug':
            formatted += picocolors.magenta('🔍 ')
            break
          case 'info':
            formatted += picocolors.blue('ℹ️  ')
            break
          case 'warn':
            formatted += picocolors.yellow('⚠️  ')
            break
          case 'error':
            formatted += picocolors.red('❌ ')
            break
        }
      }

      formatted += message

      // 简洁模式下只显示关键数据
      if (data !== undefined && this.shouldShowData(data)) {
        formatted += ' ' + this.formatCompactData(data)
      }

      return formatted
    }

    // 标准模式的格式化
    // 添加时间戳
    if (this.timestamp) {
      const timestamp = new Date().toISOString()
      formatted += this.colors ? picocolors.gray(`[${timestamp}]`) : `[${timestamp}]`
      formatted += ' '
    }

    // 添加前缀
    if (this.prefix) {
      formatted += this.colors ? picocolors.cyan(`[${this.prefix}]`) : `[${this.prefix}]`
      formatted += ' '
    }

    // 添加级别
    const levelStr = level.toUpperCase().padEnd(5)
    if (this.colors) {
      switch (level) {
        case 'debug':
          formatted += picocolors.magenta(`[${levelStr}]`)
          break
        case 'info':
          formatted += picocolors.blue(`[${levelStr}]`)
          break
        case 'warn':
          formatted += picocolors.yellow(`[${levelStr}]`)
          break
        case 'error':
          formatted += picocolors.red(`[${levelStr}]`)
          break
        default:
          formatted += `[${levelStr}]`
      }
    } else {
      formatted += `[${levelStr}]`
    }

    formatted += ' ' + message

    // 添加数据
    if (data !== undefined) {
      formatted += ' ' + (typeof data === 'string' ? data : JSON.stringify(data, null, 2))
    }

    return formatted
  }

  /**
   * 判断是否应该显示数据（简洁模式下）
   */
  private shouldShowData(data: any): boolean {
    if (typeof data === 'string') return true
    if (typeof data === 'number') return true
    if (typeof data === 'boolean') return true

    // 对于对象，只显示包含关键信息的
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data)
      const importantKeys = ['url', 'port', 'host', 'error', 'path', 'duration', 'count']
      return keys.some(key => importantKeys.includes(key))
    }

    return false
  }

  /**
   * 格式化简洁数据
   */
  private formatCompactData(data: any): string {
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return String(data)
    }

    if (typeof data === 'object' && data !== null) {
      const important: Record<string, any> = {}
      const keys = Object.keys(data)
      const importantKeys = ['url', 'port', 'host', 'error', 'path', 'duration', 'count']

      keys.forEach(key => {
        if (importantKeys.includes(key)) {
          important[key] = data[key]
        }
      })

      if (Object.keys(important).length > 0) {
        return JSON.stringify(important)
      }
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
