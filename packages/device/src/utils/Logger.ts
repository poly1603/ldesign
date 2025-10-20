/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  module?: string
  data?: unknown
  stack?: string
}

/**
 * Logger 配置选项
 */
export interface LoggerOptions {
  /** 最低日志级别 */
  level?: LogLevel
  /** 是否启用 */
  enabled?: boolean
  /** 模块名称前缀 */
  prefix?: string
  /** 是否显示时间戳 */
  showTimestamp?: boolean
  /** 是否显示堆栈信息 */
  showStack?: boolean
  /** 自定义日志处理器 */
  handler?: (entry: LogEntry) => void
  /** 最大日志历史记录数 */
  maxHistorySize?: number
}

/**
 * 高性能日志系统
 *
 * 特性：
 * - 分级日志（DEBUG, INFO, WARN, ERROR）
 * - 模块化日志
 * - 日志历史记录
 * - 性能统计
 * - 自定义日志处理器
 *
 * @example
 * ```typescript
 * // 创建 Logger 实例
 * const logger = new Logger({
 *   level: LogLevel.DEBUG,
 *   prefix: 'MyApp',
 *   showTimestamp: true
 * })
 *
 * // 使用日志
 * logger.debug('Debug message', { data: 'value' })
 * logger.info('Info message')
 * logger.warn('Warning message')
 * logger.error('Error message', error)
 *
 * // 获取日志历史
 * const history = logger.getHistory()
 * ```
 */
export class Logger {
  private options: Required<LoggerOptions>
  private history: LogEntry[] = []
  private stats = {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
  }

  // 日志级别颜色映射（用于浏览器控制台）
  private readonly levelColors: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: '#8B5CF6', // 紫色
    [LogLevel.INFO]: '#3B82F6', // 蓝色
    [LogLevel.WARN]: '#F59E0B', // 橙色
    [LogLevel.ERROR]: '#EF4444', // 红色
    [LogLevel.NONE]: '#999999', // 灰色
  }

  // 日志级别名称映射
  private readonly levelNames = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.NONE]: 'NONE',
  }

  constructor(options: LoggerOptions = {}) {
    this.options = {
      level: options.level ?? LogLevel.WARN,
      enabled: options.enabled ?? true,
      prefix: options.prefix ?? '',
      showTimestamp: options.showTimestamp ?? true,
      showStack: options.showStack ?? false,
      handler: options.handler,
      maxHistorySize: options.maxHistorySize ?? 100,
    } as Required<LoggerOptions>
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): this {
    this.options.level = level
    return this
  }

  /**
   * 启用/禁用日志
   */
  setEnabled(enabled: boolean): this {
    this.options.enabled = enabled
    return this
  }

  /**
   * 设置模块前缀
   */
  setPrefix(prefix: string): this {
    this.options.prefix = prefix
    return this
  }

  /**
   * Debug 级别日志
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data)
  }

  /**
   * Info 级别日志
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data)
  }

  /**
   * Warn 级别日志
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data)
  }

  /**
   * Error 级别日志
   */
  error(message: string, error?: unknown): void {
    const stack = error instanceof Error ? error.stack : undefined
    this.log(LogLevel.ERROR, message, error, stack)
  }

  /**
   * 分组日志开始
   */
  group(label: string): void {
    if (!this.options.enabled || typeof console.group !== 'function')
      return

    console.group(this.formatPrefix() + label)
  }

  /**
   * 分组日志结束
   */
  groupEnd(): void {
    if (!this.options.enabled || typeof console.groupEnd !== 'function')
      return

    console.groupEnd()
  }

  /**
   * 表格日志
   */
  table(data: unknown): void {
    if (!this.options.enabled || typeof console.table !== 'function')
      return

    console.table(data)
  }

  /**
   * 性能计时开始
   */
  time(label: string): void {
    if (!this.options.enabled || typeof console.time !== 'function')
      return

    console.time(this.formatPrefix() + label)
  }

  /**
   * 性能计时结束
   */
  timeEnd(label: string): void {
    if (!this.options.enabled || typeof console.timeEnd !== 'function')
      return

    console.timeEnd(this.formatPrefix() + label)
  }

  /**
   * 获取日志历史
   */
  getHistory(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.history.filter(entry => entry.level === level)
    }
    return [...this.history]
  }

  /**
   * 清除日志历史
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * 获取日志统计
   */
  getStats() {
    return { ...this.stats }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    }
  }

  /**
   * 导出日志（JSON 格式）
   */
  export(): string {
    return JSON.stringify(
      {
        history: this.history,
        stats: this.stats,
        exportTime: Date.now(),
      },
      null,
      2,
    )
  }

  /**
   * 核心日志方法
   */
  private log(
    level: LogLevel,
    message: string,
    data?: unknown,
    stack?: string,
  ): void {
    // 检查是否启用和级别过滤
    if (!this.options.enabled || level < this.options.level)
      return

    // 创建日志条目
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      module: this.options.prefix || undefined,
      data,
      stack: this.options.showStack ? stack : undefined,
    }

    // 添加到历史记录（限制大小）
    this.history.push(entry)
    if (this.history.length > this.options.maxHistorySize) {
      this.history.shift()
    }

    // 更新统计
    this.updateStats(level)

    // 调用自定义处理器
    if (this.options.handler) {
      try {
        this.options.handler(entry)
      }
      catch (error) {
        // 避免处理器错误影响日志系统
        console.error('Logger handler error:', error)
      }
    }

    // 输出到控制台
    this.outputToConsole(entry)
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(entry: LogEntry): void {
    const { level, message, data, stack } = entry

    const prefix = this.formatPrefix()
    const timestamp = this.options.showTimestamp
      ? this.formatTimestamp(entry.timestamp)
      : ''
    const levelName = this.levelNames[level]

    // 浏览器环境使用颜色
    if (typeof window !== 'undefined') {
      const color = this.levelColors[level]
      const args: unknown[] = [
        `%c${timestamp}%c${prefix}%c[${levelName}]%c ${message}`,
        'color: #999',
        'color: #333; font-weight: bold',
        `color: ${color}; font-weight: bold`,
        'color: inherit',
      ]

      if (data !== undefined) {
        args.push('\n', data)
      }

      if (stack) {
        args.push('\n', stack)
      }

      this.getConsoleMethod(level)(...args)
    }
    else {
      // Node.js 环境
      const output = `${timestamp}${prefix}[${levelName}] ${message}`
      const args: unknown[] = [output]

      if (data !== undefined) {
        args.push('\n', data)
      }

      if (stack) {
        args.push('\n', stack)
      }

      this.getConsoleMethod(level)(...args)
    }
  }

  /**
   * 获取对应的 console 方法
   */
  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug || console.info
      case LogLevel.INFO:
        return console.info
      case LogLevel.WARN:
        return console.warn
      case LogLevel.ERROR:
        return console.error
      default:
        return console.info
    }
  }

  /**
   * 格式化时间戳
   */
  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const ms = String(date.getMilliseconds()).padStart(3, '0')
    return `[${hours}:${minutes}:${seconds}.${ms}] `
  }

  /**
   * 格式化前缀
   */
  private formatPrefix(): string {
    return this.options.prefix ? `[${this.options.prefix}] ` : ''
  }

  /**
   * 更新统计信息
   */
  private updateStats(level: LogLevel): void {
    switch (level) {
      case LogLevel.DEBUG:
        this.stats.debug++
        break
      case LogLevel.INFO:
        this.stats.info++
        break
      case LogLevel.WARN:
        this.stats.warn++
        break
      case LogLevel.ERROR:
        this.stats.error++
        break
    }
  }
}

/**
 * 创建默认 Logger 实例
 */
export const defaultLogger = new Logger({
  // eslint-disable-next-line node/prefer-global/process
  level: typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development'
    ? LogLevel.DEBUG
    : LogLevel.WARN,
  prefix: '@ldesign/device',
  showTimestamp: true,
})

/**
 * 便捷方法导出
 */
export const debug = (message: string, data?: unknown) => defaultLogger.debug(message, data)
export const info = (message: string, data?: unknown) => defaultLogger.info(message, data)
export const warn = (message: string, data?: unknown) => defaultLogger.warn(message, data)
export const error = (message: string, err?: unknown) => defaultLogger.error(message, err)
