/**
 * 日志工具
 */

import chalk from 'chalk'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export interface LoggerOptions {
  level?: LogLevel
  prefix?: string
  timestamp?: boolean
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
}

export class Logger {
  private level: LogLevel
  private prefix: string
  private timestamp: boolean

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || 'info'
    this.prefix = options.prefix || ''
    this.timestamp = options.timestamp !== false
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  getLevel(): LogLevel {
    return this.level
  }

  withPrefix(prefix: string): Logger {
    return new Logger({
      level: this.level,
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      timestamp: this.timestamp,
    })
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args)
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args)
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args)
  }

  success(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      const formatted = this.format('info', chalk.green('✓ ' + message))
      console.log(formatted, ...args)
    }
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) {
      return
    }

    const formatted = this.format(level, message)
    const logFn = this.getLogFunction(level)
    logFn(formatted, ...args)
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level]
  }

  private format(level: LogLevel, message: string): string {
    const parts: string[] = []

    // 时间戳
    if (this.timestamp) {
      const now = new Date()
      const time = now.toLocaleTimeString('zh-CN', { hour12: false })
      parts.push(chalk.gray(`[${time}]`))
    }

    // 级别
    parts.push(this.formatLevel(level))

    // 前缀
    if (this.prefix) {
      parts.push(chalk.cyan(`[${this.prefix}]`))
    }

    // 消息
    parts.push(message)

    return parts.join(' ')
  }

  private formatLevel(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return chalk.gray('[DEBUG]')
      case 'info':
        return chalk.blue('[INFO]')
      case 'warn':
        return chalk.yellow('[WARN]')
      case 'error':
        return chalk.red('[ERROR]')
      default:
        return `[${level.toUpperCase()}]`
    }
  }

  private getLogFunction(level: LogLevel): typeof console.log {
    switch (level) {
      case 'error':
        return console.error
      case 'warn':
        return console.warn
      default:
        return console.log
    }
  }
}

// 默认导出单例
export const logger = new Logger()


