/**
 * 简化的日志器实现
 *
 * 这是一个兼容层，将简单的日志API映射到功能更强大的 logging-system
 * 保持向后兼容性，同时提供更强大的日志功能
 */

import type { LogEntry, Logger, LogLevel } from '../types'
import {
  ConsoleLogHandler,
  EnhancedLogger,
  LogLevel as SystemLogLevel,
  MemoryLogHandler,
} from '../utils/logging-system'

// 日志级别映射
const LEVEL_MAP: Record<LogLevel, SystemLogLevel> = {
  debug: SystemLogLevel.DEBUG,
  info: SystemLogLevel.INFO,
  warn: SystemLogLevel.WARN,
  error: SystemLogLevel.ERROR,
}

// 反向映射
const REVERSE_LEVEL_MAP: Record<SystemLogLevel, LogLevel> = {
  [SystemLogLevel.TRACE]: 'debug',
  [SystemLogLevel.DEBUG]: 'debug',
  [SystemLogLevel.INFO]: 'info',
  [SystemLogLevel.WARN]: 'warn',
  [SystemLogLevel.ERROR]: 'error',
  [SystemLogLevel.FATAL]: 'error',
}

/**
 * 日志器实现
 *
 * 使用 EnhancedLogger 作为底层实现，提供简单的API接口
 */
export class LoggerImpl implements Logger {
  private enhancedLogger: EnhancedLogger
  private memoryHandler: MemoryLogHandler
  private consoleHandler: ConsoleLogHandler
  private maxLogs = 1000

  constructor(level: LogLevel = 'info') {
    // 创建内存处理器用于存储日志
    this.memoryHandler = new MemoryLogHandler(this.maxLogs, LEVEL_MAP[level])

    // 创建控制台处理器
    this.consoleHandler = new ConsoleLogHandler(LEVEL_MAP[level])

    // 创建增强日志器
    this.enhancedLogger = new EnhancedLogger({
      minLevel: LEVEL_MAP[level],
      context: { module: 'engine' },
    })

    // 添加处理器
    this.enhancedLogger.addHandler(this.consoleHandler)
    this.enhancedLogger.addHandler(this.memoryHandler)
  }

  debug(message: string, data?: unknown): void {
    this.enhancedLogger.log(SystemLogLevel.DEBUG, message, data)
  }

  info(message: string, data?: unknown): void {
    this.enhancedLogger.log(SystemLogLevel.INFO, message, data)
  }

  warn(message: string, data?: unknown): void {
    this.enhancedLogger.log(SystemLogLevel.WARN, message, data)
  }

  error(message: string, data?: unknown): void {
    this.enhancedLogger.log(SystemLogLevel.ERROR, message, data)
  }

  setLevel(level: LogLevel): void {
    const systemLevel = LEVEL_MAP[level]
    this.enhancedLogger.setMinLevel(systemLevel)
    this.memoryHandler.setMinLevel(systemLevel)
    this.consoleHandler.setMinLevel(systemLevel)
  }

  getLevel(): LogLevel {
    const systemLevel = this.enhancedLogger.getMinLevel()
    return REVERSE_LEVEL_MAP[systemLevel] || 'info'
  }

  getLogs(): LogEntry[] {
    // 从内存处理器获取日志并转换格式
    const systemLogs = this.memoryHandler.getLogs()
    return systemLogs.map(log => ({
      level: REVERSE_LEVEL_MAP[log.level] || 'info',
      message: log.message,
      timestamp: log.timestamp,
      data: log.data,
    }))
  }

  clearLogs(): void {
    this.memoryHandler.clear()
  }

  clear(): void {
    this.clearLogs()
  }

  // 设置最大日志数量
  setMaxLogs(max: number): void {
    this.maxLogs = max
    this.memoryHandler.setMaxSize(max)
  }

  // 获取最大日志数量
  getMaxLogs(): number {
    return this.maxLogs
  }

  // 按级别获取日志
  getLogsByLevel(level: LogLevel): LogEntry[] {
    const logs = this.getLogs()
    return logs.filter(log => log.level === level)
  }

  // 按时间范围获取日志
  getLogsByTimeRange(startTime: number, endTime: number): LogEntry[] {
    const logs = this.getLogs()
    return logs.filter(
      log => log.timestamp >= startTime && log.timestamp <= endTime,
    )
  }

  // 搜索日志
  searchLogs(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase()
    const logs = this.getLogs()
    return logs.filter(
      log =>
        log.message.toLowerCase().includes(lowerQuery)
        || (log.data
          && JSON.stringify(log.data).toLowerCase().includes(lowerQuery)),
    )
  }

  // 获取日志统计
  getLogStats(): {
    total: number
    byLevel: Record<LogLevel, number>
    recent24h: number
    recentHour: number
  } {
    const now = Date.now()
    const hour = 60 * 60 * 1000
    const day = 24 * hour

    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    }

    let recent24h = 0
    let recentHour = 0

    const logs = this.getLogs()
    for (const log of logs) {
      byLevel[log.level]++

      if (now - log.timestamp <= day) {
        recent24h++
      }

      if (now - log.timestamp <= hour) {
        recentHour++
      }
    }

    return {
      total: logs.length,
      byLevel,
      recent24h,
      recentHour,
    }
  }

  // 导出日志
  exportLogs(format: 'json' | 'csv' | 'txt' = 'json'): string {
    const logs = this.getLogs()

    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2)

      case 'csv': {
        const headers = ['timestamp', 'level', 'message', 'data']
        const rows = logs.map(log => [
          new Date(log.timestamp).toISOString(),
          log.level,
          `"${log.message.replace(/"/g, '""')}"`,
          log.data ? `"${JSON.stringify(log.data).replace(/"/g, '""')}"` : '',
        ])
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      }

      case 'txt':
        return logs
          .map((log) => {
            const timestamp = new Date(log.timestamp).toISOString()
            const dataStr = log.data
              ? ` | Data: ${JSON.stringify(log.data)}`
              : ''
            return `[${timestamp}] [${log.level.toUpperCase()}] ${log.message}${dataStr}`
          })
          .join('\n')

      default:
        return ''
    }
  }

  // 创建子日志器
  createChild(prefix: string): Logger {
    return new ChildLogger(this, prefix)
  }

  // 创建命名空间日志器
  namespace(ns: string): Logger {
    return this.createChild(`[${ns}]`)
  }
}

// 子日志器类
class ChildLogger implements Logger {
  constructor(
    private parent: Logger,
    private prefix: string
  ) { }

  debug(message: string, data?: unknown): void {
    this.parent.debug(`${this.prefix} ${message}`, data)
  }

  info(message: string, data?: unknown): void {
    this.parent.info(`${this.prefix} ${message}`, data)
  }

  warn(message: string, data?: unknown): void {
    this.parent.warn(`${this.prefix} ${message}`, data)
  }

  error(message: string, data?: unknown): void {
    this.parent.error(`${this.prefix} ${message}`, data)
  }

  setLevel(level: LogLevel): void {
    this.parent.setLevel(level)
  }

  getLevel(): LogLevel {
    return this.parent.getLevel()
  }

  getLogs(): LogEntry[] {
    return this.parent.getLogs()
  }

  clearLogs(): void {
    this.parent.clearLogs()
  }

  clear(): void {
    this.parent.clear()
  }

  setMaxLogs(max: number): void {
    this.parent.setMaxLogs(max)
  }

  getMaxLogs(): number {
    return this.parent.getMaxLogs()
  }
}

export function createLogger(level: LogLevel = 'info'): Logger {
  return new LoggerImpl(level)
}

// 预定义的日志格式化器
export const logFormatters = {
  // 简单格式化器
  simple: (entry: LogEntry): string => {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()
    return `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`
  },

  // 详细格式化器
  detailed: (entry: LogEntry): string => {
    const timestamp = new Date(entry.timestamp).toISOString()
    const dataStr = entry.data ? ` | Data: ${JSON.stringify(entry.data)}` : ''
    return `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${dataStr}`
  },

  // JSON格式化器
  json: (entry: LogEntry): string => {
    return JSON.stringify({
      ...entry,
      timestamp: new Date(entry.timestamp).toISOString(),
    })
  },
}

// 日志传输器
export const logTransports = {
  // 控制台传输器
  console:
    (formatter = logFormatters.simple) =>
      (entry: LogEntry) => {
        const formatted = formatter(entry)
        const method =
          entry.level === 'error'
            ? 'error'
            : entry.level === 'warn'
              ? 'warn'
              : 'log'

        console[method](formatted)
      },

  // 本地存储传输器
  localStorage:
    (key = 'engine-logs', maxEntries = 100) =>
      (entry: LogEntry) => {
        try {
          const stored = localStorage.getItem(key)
          const logs = stored ? JSON.parse(stored) : []

          logs.unshift(entry)

          if (logs.length > maxEntries) {
            logs.splice(maxEntries)
          }

          localStorage.setItem(key, JSON.stringify(logs))
        } catch (error) {
          console.error('Failed to store log in localStorage:', error)
        }
      },

  // 远程传输器
  remote: (config: {
    endpoint: string
    apiKey?: string
    batchSize?: number
  }) => {
    const batch: LogEntry[] = []
    const batchSize = config.batchSize || 10

    return async (entry: LogEntry) => {
      batch.push(entry)

      if (batch.length >= batchSize) {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          }

          if (config.apiKey) {
            headers.Authorization = `Bearer ${config.apiKey}`
          }

          await fetch(config.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(batch.splice(0, batchSize)),
          })
        } catch (error) {
          console.error('Failed to send logs to remote service:', error)
        }
      }
    }
  },
}
