/**
 * 日志器实现
 * 提供基础的日志功能
 */

import type { Logger, LoggerConfig, LogEntry, LogLevel } from '../types'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export class CoreLogger implements Logger {
  private config: Required<LoggerConfig>
  private history: LogEntry[] = []

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level ?? 'info',
      enabled: config.enabled ?? true,
      showTimestamp: config.showTimestamp ?? true,
      showContext: config.showContext ?? false,
      prefix: config.prefix ?? '[Engine]',
      maxLogs: config.maxLogs ?? 1000,
    }
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args)
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args)
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args)
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args)
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  /**
   * 获取日志级别
   */
  getLevel(): LogLevel {
    return this.config.level
  }

  /**
   * 获取日志历史
   */
  getHistory(): LogEntry[] {
    return [...this.history]
  }

  /**
   * 清空日志历史
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * 内部日志方法
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.config.enabled) return

    // 检查日志级别
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.level]) {
      return
    }

    const timestamp = Date.now()
    const entry: LogEntry = {
      level,
      message,
      timestamp,
      data: args.length > 0 ? args : undefined,
    }

    // 保存到历史
    this.history.push(entry)
    if (this.history.length > this.config.maxLogs) {
      this.history.shift()
    }

    // 输出到控制台
    this.output(entry)
  }

  /**
   * 输出日志
   */
  private output(entry: LogEntry): void {
    const parts: string[] = []

    // 添加前缀
    if (this.config.prefix) {
      parts.push(this.config.prefix)
    }

    // 添加时间戳
    if (this.config.showTimestamp) {
      const date = new Date(entry.timestamp)
      parts.push(`[${date.toISOString()}]`)
    }

    // 添加级别
    parts.push(`[${entry.level.toUpperCase()}]`)

    // 添加消息
    parts.push(entry.message)

    const message = parts.join(' ')

    // 根据级别输出
    switch (entry.level) {
      case 'debug':
        console.debug(message, ...(entry.data || []))
        break
      case 'info':
        console.info(message, ...(entry.data || []))
        break
      case 'warn':
        console.warn(message, ...(entry.data || []))
        break
      case 'error':
        console.error(message, ...(entry.data || []))
        break
    }
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    // 初始化逻辑（如果需要）
  }

  /**
   * 销毁
   */
  async destroy(): Promise<void> {
    this.history = []
  }
}

/**
 * 创建日志器
 */
export function createLogger(config?: LoggerConfig): Logger {
  return new CoreLogger(config)
}

