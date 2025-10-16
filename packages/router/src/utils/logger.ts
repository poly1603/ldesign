/**
 * 统一的日志系统
 * 
 * 提供环境感知的日志功能，生产环境自动禁用
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  prefix?: string
  timestamp?: boolean
}

class Logger {
  private config: LoggerConfig
  private isDevelopment: boolean
  private isTest: boolean

  constructor(config?: Partial<LoggerConfig>) {
    // Web包只检查import.meta环境变量
    this.isDevelopment = (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) || false
    this.isTest = (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE === 'test') || false
    
    this.config = {
      enabled: this.isDevelopment || this.isTest,
      level: 'info',
      timestamp: true,
      ...config
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const targetLevelIndex = levels.indexOf(level)
    
    return targetLevelIndex >= currentLevelIndex
  }

  private format(level: LogLevel, message: string, ..._args: any[]): string {
    let output = ''
    
    if (this.config.timestamp) {
      output += `[${new Date().toISOString()}] `
    }
    
    if (this.config.prefix) {
      output += `[${this.config.prefix}] `
    }
    
    output += `[${level.toUpperCase()}] ${message}`
    
    return output
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      const formatted = this.format('debug', message, ...args)
      console.info(formatted, ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      const formatted = this.format('info', message, ...args)
      console.info(formatted, ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      const formatted = this.format('warn', message, ...args)
      console.warn(formatted, ...args)
    }
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    if (this.shouldLog('error')) {
      const formatted = this.format('error', message, ...args)
      if (error instanceof Error) {
        console.error(formatted, error.stack || error.message, ...args)
      } else if (error) {
        console.error(formatted, error, ...args)
      } else {
        console.error(formatted, ...args)
      }
    }
  }

  group(label: string): void {
    if (this.config.enabled && console.group) {
      console.group(label)
    }
  }

  groupEnd(): void {
    if (this.config.enabled && console.groupEnd) {
      console.groupEnd()
    }
  }

  table(data: any): void {
    if (this.config.enabled && console.table) {
      console.table(data)
    }
  }

  time(label: string): void {
    if (this.config.enabled && console.time) {
      console.time(label)
    }
  }

  timeEnd(label: string): void {
    if (this.config.enabled && console.timeEnd) {
      console.timeEnd(label)
    }
  }

  clear(): void {
    if (this.config.enabled && console.clear) {
      console.clear()
    }
  }

  /**
   * 创建子日志器
   */
  createChild(prefix: string, config?: Partial<LoggerConfig>): Logger {
    return new Logger({
      ...this.config,
      ...config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix
    })
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  /**
   * 启用/禁用日志
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
  }
}

// 创建默认日志器实例
const defaultLogger = new Logger({
  prefix: 'Router'
})

// 导出便捷方法
export const logger = {
  debug: defaultLogger.debug.bind(defaultLogger),
  info: defaultLogger.info.bind(defaultLogger),
  warn: defaultLogger.warn.bind(defaultLogger),
  error: defaultLogger.error.bind(defaultLogger),
  group: defaultLogger.group.bind(defaultLogger),
  groupEnd: defaultLogger.groupEnd.bind(defaultLogger),
  table: defaultLogger.table.bind(defaultLogger),
  time: defaultLogger.time.bind(defaultLogger),
  timeEnd: defaultLogger.timeEnd.bind(defaultLogger),
  clear: defaultLogger.clear.bind(defaultLogger),
  createChild: defaultLogger.createChild.bind(defaultLogger),
  setLevel: defaultLogger.setLevel.bind(defaultLogger),
  setEnabled: defaultLogger.setEnabled.bind(defaultLogger)
}

// 导出类用于创建独立实例
export { Logger }
export type { LoggerConfig, LogLevel }

// 导出特定功能的日志器
export const performanceLogger = defaultLogger.createChild('Performance')
export const securityLogger = defaultLogger.createChild('Security')
export const debugLogger = defaultLogger.createChild('Debug')
export const analyticsLogger = defaultLogger.createChild('Analytics')

export default logger