import type { LogEntry, Logger, LogLevel } from '../types'

export class LoggerImpl implements Logger {
  private logs: LogEntry[] = []
  private level: LogLevel = 'info'
  private maxLogs = 1000
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  constructor(level: LogLevel = 'info') {
    this.level = level
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data)
  }

  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  error(message: string, data?: any): void {
    this.log('error', message, data)
  }

  private log(level: LogLevel, message: string, data?: any): void {
    // 检查日志级别
    if (this.levels[level] < this.levels[this.level]) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      data,
    }

    // 添加到日志列表
    this.addLog(entry)

    // 输出到控制台
    this.outputToConsole(entry)
  }

  private addLog(entry: LogEntry): void {
    this.logs.unshift(entry)

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString()
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`

    const styles = this.getConsoleStyles(entry.level)

    if (entry.data) {
      console.groupCollapsed(`%c${prefix} ${entry.message}`, styles.prefix)
      console.log('%cData:', styles.data, entry.data)
      console.groupEnd()
    }
    else {
      console.log(`%c${prefix} ${entry.message}`, styles.prefix)
    }
  }

  private getConsoleStyles(level: LogLevel): { prefix: string, data: string } {
    const baseStyle = 'font-weight: bold; padding: 2px 4px; border-radius: 2px;'

    switch (level) {
      case 'debug':
        return {
          prefix: `${baseStyle} background: #e3f2fd; color: #1976d2;`,
          data: 'color: #1976d2;',
        }
      case 'info':
        return {
          prefix: `${baseStyle} background: #e8f5e8; color: #2e7d32;`,
          data: 'color: #2e7d32;',
        }
      case 'warn':
        return {
          prefix: `${baseStyle} background: #fff3e0; color: #f57c00;`,
          data: 'color: #f57c00;',
        }
      case 'error':
        return {
          prefix: `${baseStyle} background: #ffebee; color: #d32f2f;`,
          data: 'color: #d32f2f;',
        }
      default:
        return {
          prefix: baseStyle,
          data: '',
        }
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  getLevel(): LogLevel {
    return this.level
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }

  clear(): void {
    this.clearLogs()
  }

  // 设置最大日志数量
  setMaxLogs(max: number): void {
    this.maxLogs = max
    if (this.logs.length > max) {
      this.logs = this.logs.slice(0, max)
    }
  }

  // 获取最大日志数量
  getMaxLogs(): number {
    return this.maxLogs
  }

  // 按级别获取日志
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  // 按时间范围获取日志
  getLogsByTimeRange(startTime: number, endTime: number): LogEntry[] {
    return this.logs.filter(log =>
      log.timestamp >= startTime && log.timestamp <= endTime,
    )
  }

  // 搜索日志
  searchLogs(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase()
    return this.logs.filter(log =>
      log.message.toLowerCase().includes(lowerQuery)
      || (log.data && JSON.stringify(log.data).toLowerCase().includes(lowerQuery)),
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

    for (const log of this.logs) {
      byLevel[log.level]++

      if (now - log.timestamp <= day) {
        recent24h++
      }

      if (now - log.timestamp <= hour) {
        recentHour++
      }
    }

    return {
      total: this.logs.length,
      byLevel,
      recent24h,
      recentHour,
    }
  }

  // 导出日志
  exportLogs(format: 'json' | 'csv' | 'txt' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2)

      case 'csv': {
        const headers = ['timestamp', 'level', 'message', 'data']
        const rows = this.logs.map(log => [
          new Date(log.timestamp).toISOString(),
          log.level,
          `"${log.message.replace(/"/g, '""')}"`,
          log.data ? `"${JSON.stringify(log.data).replace(/"/g, '""')}"` : '',
        ])
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
      }

      case 'txt':
        return this.logs.map((log) => {
          const timestamp = new Date(log.timestamp).toISOString()
          const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : ''
          return `[${timestamp}] [${log.level.toUpperCase()}] ${log.message}${dataStr}`
        }).join('\n')

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
    private prefix: string,
  ) { }

  debug(message: string, data?: any): void {
    this.parent.debug(`${this.prefix} ${message}`, data)
  }

  info(message: string, data?: any): void {
    this.parent.info(`${this.prefix} ${message}`, data)
  }

  warn(message: string, data?: any): void {
    this.parent.warn(`${this.prefix} ${message}`, data)
  }

  error(message: string, data?: any): void {
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
  console: (formatter = logFormatters.simple) => (entry: LogEntry) => {
    const formatted = formatter(entry)
    const method = entry.level === 'error'
      ? 'error'
      : entry.level === 'warn' ? 'warn' : 'log'
    console[method](formatted)
  },

  // 本地存储传输器
  localStorage: (key = 'engine-logs', maxEntries = 100) => (entry: LogEntry) => {
    try {
      const stored = localStorage.getItem(key)
      const logs = stored ? JSON.parse(stored) : []

      logs.unshift(entry)

      if (logs.length > maxEntries) {
        logs.splice(maxEntries)
      }

      localStorage.setItem(key, JSON.stringify(logs))
    }
    catch (error) {
      console.error('Failed to store log in localStorage:', error)
    }
  },

  // 远程传输器
  remote: (config: { endpoint: string, apiKey?: string, batchSize?: number }) => {
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
        }
        catch (error) {
          console.error('Failed to send logs to remote service:', error)
        }
      }
    }
  },
}
