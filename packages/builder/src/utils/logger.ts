/**
 * 日志系统
 * 统一的日志记录和错误处理
 */

import type { LogEntry, LoggerOptions, LogLevel } from '../types'

export class Logger {
  private readonly name: string
  private readonly options: LoggerOptions
  private static globalLevel: LogLevel = 'info'
  private static logs: LogEntry[] = []

  constructor(name: string, options: LoggerOptions = {}) {
    this.name = name
    this.options = {
      level: 'info',
      timestamp: true,
      colors: true,
      ...options,
    }
  }

  /**
   * 设置全局日志级别
   */
  static setGlobalLevel(level: LogLevel): void {
    Logger.globalLevel = level
  }

  /**
   * 获取所有日志记录
   */
  static getLogs(): LogEntry[] {
    return [...Logger.logs]
  }

  /**
   * 清空日志记录
   */
  static clearLogs(): void {
    Logger.logs = []
  }

  /**
   * 记录调试信息
   */
  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args)
  }

  /**
   * 记录信息
   */
  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args)
  }

  /**
   * 记录警告
   */
  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args)
  }

  /**
   * 记录错误
   */
  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args)
  }

  /**
   * 记录成功信息
   */
  success(message: string, ...args: any[]): void {
    this.log('info', message, ...args)
  }

  /**
   * 记录日志
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) {
      return
    }

    const output = this.formatMessage(level, message)

    if (args && args.length > 0) {
      console.log(output, ...args)
    }
    else {
      console.log(output)
    }
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

    const currentLevel = this.options.level || Logger.globalLevel
    return levels[level] >= levels[currentLevel]
  }

  /**
   * 格式化消息
   */
  private formatMessage(level: LogLevel, message: string): string {
    const levelStr = this.formatLevel(level)
    const prefix = this.name ? `[${this.name}]` : ''
    return `${prefix} ${levelStr}: ${message}`
  }

  /**
   * 格式化日志级别
   */
  private formatLevel(level: LogLevel): string {
    if (!this.options.colors) {
      return level.toUpperCase()
    }

    const colors: Record<LogLevel, string> = {
      debug: '\x1B[36m', // cyan
      info: '\x1B[34m', // blue
      warn: '\x1B[33m', // yellow
      error: '\x1B[31m', // red
    }

    const reset = '\x1B[0m'
    const color = colors[level] || ''

    return `${color}${level.toUpperCase()}${reset}`
  }

  /**
   * 创建进度条
   */
  createProgress(total: number, message?: string): ProgressBar {
    return new ProgressBar(total, message, this)
  }

  /**
   * 创建计时器
   */
  createTimer(label?: string): Timer {
    return new Timer(label, this)
  }

  /**
   * 格式化文件大小
   */
  static formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
  }

  /**
   * 格式化时间
   */
  static formatTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`
    }

    const seconds = ms / 1000
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }
}

/**
 * 进度条类
 */
export class ProgressBar {
  private current = 0
  private readonly total: number
  private readonly message: string
  private readonly logger: Logger
  private readonly startTime: number

  constructor(total: number, message = 'Progress', logger: Logger) {
    this.total = total
    this.message = message
    this.logger = logger
    this.startTime = Date.now()
  }

  /**
   * 更新进度
   */
  update(current?: number): void {
    if (current !== undefined) {
      this.current = current
    }
    else {
      this.current++
    }

    const percentage = Math.round((this.current / this.total) * 100)
    const elapsed = Date.now() - this.startTime
    const eta = this.current > 0 ? (elapsed / this.current) * (this.total - this.current) : 0

    const progressBar = this.createProgressBar(percentage)
    const message = `${this.message} ${progressBar} ${percentage}% (${this.current}/${this.total}) ETA: ${Logger.formatTime(eta)}`

    // 使用 \r 覆盖当前行
    process.stdout.write(`\r${message}`)

    if (this.current >= this.total) {
      process.stdout.write('\n')
      this.logger.success(`${this.message} completed in ${Logger.formatTime(elapsed)}`)
    }
  }

  /**
   * 创建进度条字符串
   */
  private createProgressBar(percentage: number): string {
    const width = 20
    const filled = Math.round((percentage / 100) * width)
    const empty = width - filled

    return `[${'█'.repeat(filled)}${' '.repeat(empty)}]`
  }

  /**
   * 完成进度条
   */
  complete(): void {
    this.update(this.total)
  }
}

/**
 * 计时器类
 */
export class Timer {
  private readonly label: string
  private readonly logger: Logger
  private readonly startTime: number

  constructor(label = 'Timer', logger: Logger) {
    this.label = label
    this.logger = logger
    this.startTime = Date.now()
    this.logger.debug(`${this.label} started`)
  }

  /**
   * 结束计时
   */
  end(): number {
    const elapsed = Date.now() - this.startTime
    this.logger.info(`${this.label} completed in ${Logger.formatTime(elapsed)}`)
    return elapsed
  }

  /**
   * 获取已用时间
   */
  elapsed(): number {
    return Date.now() - this.startTime
  }
}

/**
 * 错误处理工具
 */
export class ErrorHandler {
  private static readonly logger = new Logger('ErrorHandler')

  /**
   * 处理未捕获的异常
   */
  static handleUncaughtException(error: Error): void {
    ErrorHandler.logger.error('未捕获的异常:', error)
    ErrorHandler.logger.error('堆栈跟踪:', error.stack)

    // 优雅退出
    process.exit(1)
  }

  /**
   * 处理未处理的Promise拒绝
   */
  static handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    ErrorHandler.logger.error('未处理的Promise拒绝:', reason)
    ErrorHandler.logger.error('Promise:', promise)

    // 优雅退出
    process.exit(1)
  }

  /**
   * 包装异步函数，添加错误处理
   */
  static wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorMessage?: string,
  ): T {
    return (async (...args: any[]) => {
      try {
        return await fn(...args)
      }
      catch (error) {
        if (errorMessage) {
          ErrorHandler.logger.error(errorMessage, error)
        }
        else {
          ErrorHandler.logger.error('异步操作失败:', error)
        }
        throw error
      }
    }) as T
  }

  /**
   * 创建用户友好的错误消息
   */
  static createUserFriendlyError(error: Error, context?: string): string {
    let message = error.message

    // 处理常见错误类型
    if (error.message.includes('ENOENT')) {
      message = '文件或目录不存在'
    }
    else if (error.message.includes('EACCES')) {
      message = '权限不足'
    }
    else if (error.message.includes('EMFILE')) {
      message = '打开的文件过多'
    }
    else if (error.message.includes('ENOTDIR')) {
      message = '不是一个目录'
    }
    else if (error.message.includes('EISDIR')) {
      message = '是一个目录'
    }

    if (context) {
      message = `${context}: ${message}`
    }

    return message
  }

  /**
   * 注册全局错误处理器
   */
  static registerGlobalHandlers(): void {
    process.on('uncaughtException', ErrorHandler.handleUncaughtException)
    process.on('unhandledRejection', ErrorHandler.handleUnhandledRejection)

    // 处理SIGINT信号（Ctrl+C）
    process.on('SIGINT', () => {
      ErrorHandler.logger.info('收到SIGINT信号，正在退出...')
      process.exit(0)
    })

    // 处理SIGTERM信号
    process.on('SIGTERM', () => {
      ErrorHandler.logger.info('收到SIGTERM信号，正在退出...')
      process.exit(0)
    })
  }
}

// 默认导出
export default Logger
