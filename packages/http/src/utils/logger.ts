/**
 * 统一日志管理器
 *
 * 替换所有console.log,提供更好的日志控制
 */

// 浏览器兼容的 process.env 访问
const isBrowser = typeof window !== 'undefined'
const env = isBrowser ? (import.meta.env || {}) : (globalThis.process?.env || {})

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LoggerConfig {
  /** 日志级别 */
  level?: LogLevel
  /** 是否在生产环境启用 */
  enableInProduction?: boolean
  /** 自定义日志处理器 */
  customHandler?: (level: LogLevel, message: string, data?: any) => void
  /** 是否显示时间戳 */
  showTimestamp?: boolean
  /** 日志前缀 */
  prefix?: string
}

/**
 * 日志管理器
 *
 * @example
 * ```typescript
 * // 配置日志级别
 * logger.setLevel(LogLevel.WARN) // 只显示警告和错误
 *
 * // 使用日志
 * logger.debug('调试信息', { data: 123 })
 * logger.info('请求已发送')
 * logger.warn('请求耗时较长')
 * logger.error('请求失败', error)
 *
 * // 分组日志
 * logger.group('请求详情')
 * logger.info('URL:', url)
 * logger.info('Method:', method)
 * logger.groupEnd()
 * ```
 */

export class Logger {
  private config: Omit<Required<LoggerConfig>, 'customHandler'> & { customHandler: ((level: LogLevel, message: string, data?: any) => void) | null }
  private isProduction: boolean

  constructor(config: LoggerConfig = {}) {
    this.isProduction = env.NODE_ENV === 'production' || env.MODE === 'production'

    this.config = {
      level: config.level ?? (this.isProduction ? LogLevel.WARN : LogLevel.DEBUG),
      enableInProduction: config.enableInProduction ?? false,
      customHandler: config.customHandler ?? null,
      showTimestamp: config.showTimestamp ?? true,
      prefix: config.prefix ?? '[HTTP]',
    }
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    if (this.config) {
      this.config.level = level
    }
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.config?.level
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args)
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args)
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args)
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args)
  }

  /**
   * 分组开始
   */
  group(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(this.formatMessage(label))
    }
  }

  /**
   * 折叠分组开始
   */
  groupCollapsed(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupCollapsed(this.formatMessage(label))
    }
  }

  /**
   * 分组结束
   */
  groupEnd(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd()
    }
  }

  /**
   * 表格输出
   */
  table(data: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.table(data)
    }
  }

  /**
   * 计时开始
   */
  time(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.time(this.formatMessage(label))
    }
  }

  /**
   * 计时结束
   */
  timeEnd(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(this.formatMessage(label))
    }
  }

  /**
   * 核心日志方法
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) {
      return
    }

    const formattedMessage = this.formatMessage(message)

    // 使用自定义处理器
    if (this.config?.customHandler) {
      this.config?.customHandler(level, message, args.length > 0 ? args : undefined)
      return
    }

    // 根据级别选择console方法
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, ...args)
        break
      case LogLevel.INFO:
        console.info(formattedMessage, ...args)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args)
        break
    }
  }

  /**
   * 判断是否应该输出日志
   */
  private shouldLog(level: LogLevel): boolean {
    // 生产环境检查
    if (this.isProduction && !this.config?.enableInProduction) {
      return false
    }

    // 级别检查
    return level >= this.config?.level
  }

  /**
   * 格式化消息
   */
  private formatMessage(message: string): string {
    const parts: string[] = []

    // 添加前缀
    if (this.config?.prefix) {
      parts.push(this.config?.prefix)
    }

    // 添加时间戳
    if (this.config?.showTimestamp) {
      const timestamp = new Date().toISOString().split('T')[1].slice(0, -1)
      parts.push(`[${timestamp}]`)
    }

    parts.push(message)

    return parts.join(' ')
  }

  /**
   * 创建子日志器
   */
  createChild(prefix: string): Logger {
    const { customHandler, ...restConfig } = this.config
    return new Logger({
      ...restConfig,
      customHandler: customHandler || undefined,
      prefix: `${this.config?.prefix} ${prefix}`,
    })
  }
}

/**
 * 全局日志器实例
 */
export const logger = new Logger()

/**
 * 创建日志器
 */
export function createLogger(config?: LoggerConfig): Logger {
  return new Logger(config)
}

/**
 * 开发环境专用日志器
 */
export const devLogger = new Logger({
  level: LogLevel.DEBUG,
  enableInProduction: false,
  prefix: '[HTTP:DEV]',
})
