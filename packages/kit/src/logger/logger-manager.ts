/**
 * 日志管理器
 * 提供全局日志管理和配置功能
 */

import type { LogEntry, LoggerOptions, LogLevel, LogTransport } from '../types'
import { EventEmitter } from 'node:events'
import { ConsoleLogger } from './console-logger'
import { ErrorHandler } from './error-handler'
import { FileLogger } from './file-logger'
import { Logger } from './logger'

/**
 * 日志管理器选项
 */
export interface LoggerManagerOptions {
  level?: LogLevel
  defaultTransports?: LogTransport[]
  errorHandler?: boolean
  globalLogger?: boolean
  loggerOptions?: LoggerOptions
}

/**
 * 日志管理器类
 */
export class LoggerManager extends EventEmitter {
  private loggers: Map<string, Logger> = new Map()
  private globalLevel: LogLevel = 'info'
  private defaultTransports: LogTransport[] = []
  private errorHandler?: ErrorHandler
  private globalLogger?: Logger
  private options: Required<LoggerManagerOptions>

  constructor(options: LoggerManagerOptions = {}) {
    super()

    this.options = {
      level: options.level || 'info',
      defaultTransports: options.defaultTransports || [],
      errorHandler: options.errorHandler !== false,
      globalLogger: options.globalLogger !== false,
      loggerOptions: options.loggerOptions || {},
    }

    this.globalLevel = this.options.level

    // 设置默认传输器
    if (this.options.defaultTransports.length === 0) {
      this.defaultTransports.push(new ConsoleLogger())
    }
    else {
      this.defaultTransports = [...this.options.defaultTransports]
    }

    // 创建全局日志器
    if (this.options.globalLogger) {
      this.globalLogger = this.createLogger('global', {
        level: this.globalLevel,
        ...this.options.loggerOptions,
      })
    }

    // 设置错误处理器
    if (this.options.errorHandler) {
      this.errorHandler = ErrorHandler.createGlobal(this.globalLogger)
    }
  }

  /**
   * 创建日志器
   */
  createLogger(name: string, options: LoggerOptions = {}): Logger {
    if (this.loggers.has(name)) {
      return this.loggers.get(name)!
    }

    const loggerOptions: LoggerOptions = {
      level: this.globalLevel,
      ...this.options.loggerOptions,
      ...options,
    }

    const logger = new Logger(name, loggerOptions)

    // 添加默认传输器
    for (const transport of this.defaultTransports) {
      logger.addTransport(transport)
    }

    // 监听日志器事件
    logger.on('log', (entry: LogEntry) => {
      this.emit('log', { logger: name, entry })
    })

    logger.on('error', (error: Error) => {
      this.emit('loggerError', { logger: name, error })
    })

    this.loggers.set(name, logger)
    this.emit('loggerCreated', { name, logger })

    return logger
  }

  /**
   * 获取日志器
   */
  getLogger(name: string): Logger | undefined {
    return this.loggers.get(name)
  }

  /**
   * 获取或创建日志器
   */
  getOrCreateLogger(name: string, options?: LoggerOptions): Logger {
    return this.getLogger(name) || this.createLogger(name, options)
  }

  /**
   * 获取全局日志器
   */
  getGlobalLogger(): Logger | undefined {
    return this.globalLogger
  }

  /**
   * 获取所有日志器
   */
  getAllLoggers(): Map<string, Logger> {
    return new Map(this.loggers)
  }

  /**
   * 删除日志器
   */
  removeLogger(name: string): boolean {
    const logger = this.loggers.get(name)
    if (logger) {
      logger.destroy()
      this.loggers.delete(name)
      this.emit('loggerRemoved', { name, logger })
      return true
    }
    return false
  }

  /**
   * 设置全局日志级别
   */
  setGlobalLevel(level: LogLevel): void {
    this.globalLevel = level

    // 更新所有日志器的级别
    for (const logger of this.loggers.values()) {
      logger.setLevel(level)
    }

    this.emit('globalLevelChanged', level)
  }

  /**
   * 获取全局日志级别
   */
  getGlobalLevel(): LogLevel {
    return this.globalLevel
  }

  /**
   * 添加默认传输器
   */
  addDefaultTransport(transport: LogTransport): void {
    this.defaultTransports.push(transport)

    // 为所有现有日志器添加传输器
    for (const logger of this.loggers.values()) {
      logger.addTransport(transport)
    }

    this.emit('defaultTransportAdded', transport)
  }

  /**
   * 移除默认传输器
   */
  removeDefaultTransport(transport: LogTransport): void {
    const index = this.defaultTransports.indexOf(transport)
    if (index !== -1) {
      this.defaultTransports.splice(index, 1)

      // 从所有日志器中移除传输器
      for (const logger of this.loggers.values()) {
        logger.removeTransport(transport)
      }

      this.emit('defaultTransportRemoved', transport)
    }
  }

  /**
   * 获取默认传输器
   */
  getDefaultTransports(): LogTransport[] {
    return [...this.defaultTransports]
  }

  /**
   * 配置控制台日志
   */
  configureConsole(
    options: {
      enabled?: boolean
      colors?: boolean
      timestamp?: boolean
      level?: LogLevel
    } = {},
  ): void {
    // 移除现有的控制台传输器
    this.defaultTransports = this.defaultTransports.filter(
      transport => !(transport instanceof ConsoleLogger),
    )

    if (options.enabled !== false) {
      const consoleLogger = new ConsoleLogger({
        colors: options.colors,
        timestamp: options.timestamp,
      })

      this.addDefaultTransport(consoleLogger)
    }

    // 更新所有日志器
    for (const logger of this.loggers.values()) {
      const transports = logger
        .getTransports()
        .filter(transport => !(transport instanceof ConsoleLogger))

      // 清除所有传输器
      for (const transport of logger.getTransports()) {
        logger.removeTransport(transport)
      }

      // 重新添加非控制台传输器
      for (const transport of transports) {
        logger.addTransport(transport)
      }

      // 添加新的控制台传输器
      if (options.enabled !== false) {
        logger.addTransport(
          new ConsoleLogger({
            colors: options.colors,
            timestamp: options.timestamp,
          }),
        )
      }
    }
  }

  /**
   * 配置文件日志
   */
  configureFile(
    options: {
      enabled?: boolean
      filename?: string
      maxSize?: number
      maxFiles?: number
      level?: LogLevel
    } = {},
  ): void {
    // 移除现有的文件传输器
    this.defaultTransports = this.defaultTransports.filter(
      transport => !(transport instanceof FileLogger),
    )

    if (options.enabled !== false && options.filename) {
      const fileLogger = new FileLogger({
        filename: options.filename,
        maxSize: options.maxSize,
        maxFiles: options.maxFiles,
      })

      this.addDefaultTransport(fileLogger)
    }
  }

  /**
   * 获取所有日志
   */
  getAllLogs(): LogEntry[] {
    const allLogs: LogEntry[] = []

    for (const logger of this.loggers.values()) {
      allLogs.push(...logger.getLogs())
    }

    // 按时间戳排序
    return allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * 按级别过滤所有日志
   */
  getAllLogsByLevel(level: LogLevel): LogEntry[] {
    return this.getAllLogs().filter(entry => entry.level === level)
  }

  /**
   * 按时间范围获取所有日志
   */
  getAllLogsByTimeRange(start: Date, end: Date): LogEntry[] {
    return this.getAllLogs().filter(entry => entry.timestamp >= start && entry.timestamp <= end)
  }

  /**
   * 清空所有日志
   */
  clearAllLogs(): void {
    for (const logger of this.loggers.values()) {
      logger.clearLogs()
    }
    this.emit('allLogsCleared')
  }

  /**
   * 导出所有日志
   */
  exportAllLogs(format: 'json' | 'csv' | 'txt' = 'json'): string {
    const logs = this.getAllLogs()

    switch (format) {
      case 'json':
        return JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            totalLogs: logs.length,
            loggers: Array.from(this.loggers.keys()),
            logs,
          },
          null,
          2,
        )

      case 'csv': {
        const headers = ['timestamp', 'logger', 'level', 'module', 'message', 'data']
        const rows = logs.map(log => [
          log.timestamp.toISOString(),
          this.findLoggerName(log) || '',
          log.level,
          log.module || '',
          `"${log.message.replace(/"/g, '""')}"`,
          log.data ? `"${JSON.stringify(log.data).replace(/"/g, '""')}"` : '',
        ])
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      }

      case 'txt':
        return logs
          .map((log) => {
            const timestamp = log.timestamp.toISOString()
            const logger = this.findLoggerName(log) || 'unknown'
            const module = log.module ? `[${log.module}]` : ''
            const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : ''
            return `[${timestamp}] [${logger}] ${module} [${log.level.toUpperCase()}] ${log.message}${dataStr}`
          })
          .join('\n')

      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * 查找日志条目对应的日志器名称
   */
  private findLoggerName(entry: LogEntry): string | undefined {
    for (const [name, logger] of this.loggers) {
      if (logger.getLogs().includes(entry)) {
        return name
      }
    }
    return undefined
  }

  /**
   * 获取统计信息
   */
  getStats(): LoggerManagerStats {
    const loggerCount = this.loggers.size
    const totalLogs = this.getAllLogs().length
    const logsByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    }

    for (const log of this.getAllLogs()) {
      logsByLevel[log.level]++
    }

    const loggerStats = Array.from(this.loggers.entries()).map(([name, logger]) => ({
      name,
      logCount: logger.getLogs().length,
      level: logger.getLevel(),
      transportCount: logger.getTransports().length,
    }))

    return {
      loggerCount,
      totalLogs,
      logsByLevel,
      defaultTransportCount: this.defaultTransports.length,
      globalLevel: this.globalLevel,
      loggerStats,
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    // 销毁所有日志器
    for (const logger of this.loggers.values()) {
      logger.destroy()
    }
    this.loggers.clear()

    // 销毁错误处理器
    if (this.errorHandler) {
      this.errorHandler.destroy()
    }

    // 清理事件监听器
    this.removeAllListeners()

    this.emit('destroyed')
  }

  /**
   * 创建日志管理器实例
   */
  static create(options?: LoggerManagerOptions): LoggerManager {
    return new LoggerManager(options)
  }

  /**
   * 创建默认管理器
   */
  static createDefault(): LoggerManager {
    return new LoggerManager({
      level: 'info',
      errorHandler: true,
      globalLogger: true,
    })
  }
}

/**
 * 日志管理器统计信息
 */
export interface LoggerManagerStats {
  loggerCount: number
  totalLogs: number
  logsByLevel: Record<LogLevel, number>
  defaultTransportCount: number
  globalLevel: LogLevel
  loggerStats: Array<{
    name: string
    logCount: number
    level: LogLevel
    transportCount: number
  }>
}
