/**
 * 核心日志器
 * 提供基础的日志记录功能
 */

import type { LogEntry, LogFormatter, LoggerOptions, LogLevel, LogTransport } from '../types'
import { EventEmitter } from 'node:events'
import { ConsoleLogger } from './console-logger'

/**
 * 日志器类
 */
export class Logger extends EventEmitter {
  private readonly name: string
  private options: Required<LoggerOptions>
  private transports: LogTransport[] = []
  private formatters: Map<string, LogFormatter> = new Map()
  private logs: LogEntry[] = []
  private static globalLevel: LogLevel = 'info'
  private static instances: Map<string, Logger> = new Map()

  constructor(name: string, options: LoggerOptions = {}) {
    super()

    this.name = name
    this.options = {
      level: 'info',
      timestamp: true,
      colors: true,
      module: name,
      file: options.file,
      maxFiles: 5,
      maxSize: 10 * 1024 * 1024, // 10MB
      maxLogs: 1000,
      silent: false,
      ...options,
    } as Required<LoggerOptions>

    // 默认添加控制台传输器
    if (!this.options.silent) {
      this.addTransport(
        new ConsoleLogger({
          colors: this.options.colors,
          timestamp: this.options.timestamp,
        }),
      )
    }

    // 注册实例
    Logger.instances.set(name, this)
  }

  /**
   * 设置全局日志级别
   */
  static setGlobalLevel(level: LogLevel): void {
    Logger.globalLevel = level
    // 更新所有实例的级别
    for (const logger of Logger.instances.values()) {
      logger.setLevel(level)
    }
  }

  /**
   * 获取全局日志级别
   */
  static getGlobalLevel(): LogLevel {
    return Logger.globalLevel
  }

  /**
   * 获取日志器实例
   */
  static getInstance(name: string, options?: LoggerOptions): Logger {
    if (!Logger.instances.has(name)) {
      const _logger = new Logger(name, options)
      void _logger
    }
    return Logger.instances.get(name)!
  }

  /**
   * 获取所有日志器实例
   */
  static getAllInstances(): Map<string, Logger> {
    return new Map(Logger.instances)
  }

  /**
   * 清理所有实例
   */
  static clearInstances(): void {
    for (const logger of Logger.instances.values()) {
      logger.destroy()
    }
    Logger.instances.clear()
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.options.level = level
    this.emit('levelChanged', level)
  }

  /**
   * 获取日志级别
   */
  getLevel(): LogLevel {
    return this.options.level
  }

  /**
   * 添加传输器
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport)
    this.emit('transportAdded', transport)
  }

  /**
   * 移除传输器
   */
  removeTransport(transport: LogTransport): void {
    const index = this.transports.indexOf(transport)
    if (index !== -1) {
      this.transports.splice(index, 1)
      this.emit('transportRemoved', transport)
    }
  }

  /**
   * 获取所有传输器
   */
  getTransports(): LogTransport[] {
    return [...this.transports]
  }

  /**
   * 添加格式化器
   */
  addFormatter(name: string, formatter: LogFormatter): void {
    this.formatters.set(name, formatter)
    this.emit('formatterAdded', { name, formatter })
  }

  /**
   * 获取格式化器
   */
  getFormatter(name: string): LogFormatter | undefined {
    return this.formatters.get(name)
  }

  /**
   * 记录调试信息
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data)
  }

  /**
   * 记录信息
   */
  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  /**
   * 记录警告
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  /**
   * 记录错误
   */
  error(message: string, data?: any): void {
    this.log('error', message, data)
  }

  /**
   * 记录成功信息
   */
  success(message: string, data?: any): void {
    this.log('info', message, data, 'success')
  }

  /**
   * 记录日志
   */
  private async log(level: LogLevel, message: string, data?: any, type?: string): Promise<void> {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      module: this.options.module,
      type,
    }

    // 添加到内存日志
    this.addToMemory(entry)

    // 发送到所有传输器
    await this.sendToTransports(entry)

    // 触发事件
    this.emit('log', entry)
  }

  /**
   * 检查是否应该记录日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }

    const currentLevel = this.options.level
    return levels[level] >= levels[currentLevel]
  }

  /**
   * 添加到内存日志
   */
  private addToMemory(entry: LogEntry): void {
    this.logs.unshift(entry)

    // 限制日志数量
    if (this.logs.length > this.options.maxLogs) {
      this.logs = this.logs.slice(0, this.options.maxLogs)
    }
  }

  /**
   * 发送到所有传输器
   */
  private async sendToTransports(entry: LogEntry): Promise<void> {
    const promises = this.transports.map(async (transport) => {
      try {
        await transport.log(entry)
      }
      catch (error) {
        this.emit('transportError', { transport, error, entry })
      }
    })

    await Promise.all(promises)
  }

  /**
   * 获取日志记录
   */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * 清空日志记录
   */
  clearLogs(): void {
    this.logs = []
    this.emit('logsCleared')
  }

  /**
   * 过滤日志
   */
  filterLogs(filter: (entry: LogEntry) => boolean): LogEntry[] {
    return this.logs.filter(filter)
  }

  /**
   * 按级别获取日志
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(entry => entry.level === level)
  }

  /**
   * 按时间范围获取日志
   */
  getLogsByTimeRange(start: Date, end: Date): LogEntry[] {
    return this.logs.filter(entry => entry.timestamp >= start && entry.timestamp <= end)
  }

  /**
   * 导出日志
   */
  exportLogs(format: 'json' | 'csv' | 'txt' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2)

      case 'csv': {
        const headers = ['timestamp', 'level', 'module', 'message', 'data']
        const rows = this.logs.map(log => [
          log.timestamp.toISOString(),
          log.level,
          log.module || '',
          `"${log.message.replace(/"/g, '""')}"`,
          log.data ? `"${JSON.stringify(log.data).replace(/"/g, '""')}"` : '',
        ])
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      }

      case 'txt':
        return this.logs
          .map((log) => {
            const timestamp = log.timestamp.toISOString()
            const module = log.module ? `[${log.module}]` : ''
            const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : ''
            return `[${timestamp}] ${module} [${log.level.toUpperCase()}] ${log.message}${dataStr}`
          })
          .join('\n')

      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * 创建子日志器
   */
  child(name: string, options: Partial<LoggerOptions> = {}): Logger {
    const childName = `${this.name}:${name}`
    const childOptions = {
      ...this.options,
      ...options,
      module: childName,
    }

    return new Logger(childName, childOptions)
  }

  /**
   * 销毁日志器
   */
  destroy(): void {
    this.clearLogs()
    this.transports = []
    this.formatters.clear()
    this.removeAllListeners()
    Logger.instances.delete(this.name)
  }

  /**
   * 获取日志器名称
   */
  getName(): string {
    return this.name
  }

  /**
   * 获取日志器选项
   */
  getOptions(): Required<LoggerOptions> {
    return { ...this.options }
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<LoggerOptions>): void {
    this.options = { ...this.options, ...options }
    this.emit('optionsUpdated', this.options)
  }

  /**
   * 创建日志器实例
   */
  static create(name: string, options?: LoggerOptions): Logger {
    return new Logger(name, options)
  }
}
