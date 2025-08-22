/**
 * 日志服务
 * 
 * 提供统一的日志记录功能，包括：
 * - 多级别日志记录
 * - 日志格式化
 * - 日志过滤
 * - 性能日志
 */

/**
 * 日志级别枚举
 */
export enum LogLevel {
  /** 调试信息 */
  DEBUG = 0,
  /** 一般信息 */
  INFO = 1,
  /** 警告信息 */
  WARN = 2,
  /** 错误信息 */
  ERROR = 3,
  /** 静默模式 */
  SILENT = 4,
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  /** 日志级别 */
  level: LogLevel
  /** 日志消息 */
  message: string
  /** 时间戳 */
  timestamp: number
  /** 日志标签 */
  tag?: string
  /** 附加数据 */
  data?: unknown
  /** 错误对象 */
  error?: Error
}

/**
 * 日志器配置
 */
export interface LoggerConfig {
  /** 最小日志级别 */
  level?: LogLevel
  /** 日志标签前缀 */
  prefix?: string
  /** 是否启用时间戳 */
  timestamp?: boolean
  /** 是否启用颜色输出 */
  colors?: boolean
  /** 自定义日志格式化函数 */
  formatter?: (entry: LogEntry) => string
  /** 日志输出函数 */
  output?: (formatted: string, entry: LogEntry) => void
}

/**
 * 日志器类
 */
export class Logger {
  private config: Required<LoggerConfig>
  private logHistory: LogEntry[] = []
  private readonly maxHistorySize = 1000

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: LogLevel.INFO,
      prefix: 'LDesign',
      timestamp: true,
      colors: true,
      formatter: this.defaultFormatter.bind(this),
      output: this.defaultOutput.bind(this),
      ...config,
    }
  }

  /**
   * 记录调试日志
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data)
  }

  /**
   * 记录信息日志
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data)
  }

  /**
   * 记录警告日志
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data)
  }

  /**
   * 记录错误日志
   */
  error(message: string, error?: Error | unknown): void {
    const errorObj = error instanceof Error ? error : undefined
    const data = error instanceof Error ? undefined : error
    this.log(LogLevel.ERROR, message, data, errorObj)
  }

  /**
   * 记录性能日志
   */
  perf(operation: string, duration: number, data?: unknown): void {
    this.log(LogLevel.INFO, `⚡ ${operation} 耗时: ${duration}ms`, data, undefined, 'PERF')
  }

  /**
   * 记录模板相关日志
   */
  template(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data, undefined, 'TEMPLATE')
  }

  /**
   * 记录缓存相关日志
   */
  cache(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data, undefined, 'CACHE')
  }

  /**
   * 记录设备相关日志
   */
  device(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data, undefined, 'DEVICE')
  }

  /**
   * 核心日志记录方法
   */
  private log(
    level: LogLevel,
    message: string,
    data?: unknown,
    error?: Error,
    tag?: string,
  ): void {
    // 检查日志级别
    if (level < this.config.level) {
      return
    }

    // 创建日志条目
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      tag: tag || this.config.prefix,
      data,
      error,
    }

    // 添加到历史记录
    this.addToHistory(entry)

    // 格式化并输出日志
    const formatted = this.config.formatter(entry)
    this.config.output(formatted, entry)
  }

  /**
   * 默认日志格式化函数
   */
  private defaultFormatter(entry: LogEntry): string {
    const parts: string[] = []

    // 时间戳
    if (this.config.timestamp) {
      const date = new Date(entry.timestamp)
      const timeStr = date.toLocaleTimeString('zh-CN', { hour12: false })
      parts.push(`[${timeStr}]`)
    }

    // 日志级别
    const levelStr = this.getLevelString(entry.level)
    parts.push(`[${levelStr}]`)

    // 标签
    if (entry.tag) {
      parts.push(`[${entry.tag}]`)
    }

    // 消息
    parts.push(entry.message)

    // 数据
    if (entry.data !== undefined) {
      parts.push(JSON.stringify(entry.data, null, 2))
    }

    // 错误
    if (entry.error) {
      parts.push(`\n错误: ${entry.error.message}`)
      if (entry.error.stack) {
        parts.push(`\n堆栈: ${entry.error.stack}`)
      }
    }

    return parts.join(' ')
  }

  /**
   * 默认日志输出函数
   */
  private defaultOutput(formatted: string, entry: LogEntry): void {
    const colorized = this.config.colors ? this.colorize(formatted, entry.level) : formatted

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(colorized)
        break
      case LogLevel.INFO:
        console.info(colorized)
        break
      case LogLevel.WARN:
        console.warn(colorized)
        break
      case LogLevel.ERROR:
        console.error(colorized)
        break
    }
  }

  /**
   * 为日志添加颜色
   */
  private colorize(message: string, level: LogLevel): string {
    if (typeof window !== 'undefined') {
      // 浏览器环境，使用 CSS 样式
      const styles = {
        [LogLevel.DEBUG]: 'color: #888',
        [LogLevel.INFO]: 'color: #007acc',
        [LogLevel.WARN]: 'color: #ff8c00',
        [LogLevel.ERROR]: 'color: #ff4444',
      }
      return `%c${message}`
    }

    // Node.js 环境，使用 ANSI 颜色代码
    const colors = {
      [LogLevel.DEBUG]: '\x1b[90m', // 灰色
      [LogLevel.INFO]: '\x1b[36m',  // 青色
      [LogLevel.WARN]: '\x1b[33m',  // 黄色
      [LogLevel.ERROR]: '\x1b[31m', // 红色
    }

    const reset = '\x1b[0m'
    return `${colors[level] || ''}${message}${reset}`
  }

  /**
   * 获取日志级别字符串
   */
  private getLevelString(level: LogLevel): string {
    const levelNames = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR',
    }
    return levelNames[level] || 'UNKNOWN'
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry)

    // 限制历史记录大小
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift()
    }
  }

  /**
   * 获取日志历史
   */
  getHistory(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logHistory.filter(entry => entry.level >= level)
    }
    return [...this.logHistory]
  }

  /**
   * 清除日志历史
   */
  clearHistory(): void {
    this.logHistory = []
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.config.level = level
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.config.level
  }

  /**
   * 创建子日志器
   */
  child(tag: string, config?: Partial<LoggerConfig>): Logger {
    return new Logger({
      ...this.config,
      prefix: `${this.config.prefix}:${tag}`,
      ...config,
    })
  }
}

// 默认日志器实例
export const logger = new Logger({
  level: LogLevel.INFO,
  prefix: 'LDesign:Template',
})
