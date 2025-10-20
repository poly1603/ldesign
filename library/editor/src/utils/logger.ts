/**
 * 统一日志工具
 * 开发环境输出详细日志，生产环境只输出错误
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LoggerOptions {
  prefix?: string
  enabled?: boolean
  level?: LogLevel
}

class Logger {
  private isDevelopment: boolean
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  }

  constructor() {
    // 检测开发环境
    this.isDevelopment = process.env.NODE_ENV === 'development' || 
                        typeof process === 'undefined' ||
                        !process.env.NODE_ENV
  }

  /**
   * 调试日志（仅开发环境）
   */
  debug(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('[DEBUG]', ...args)
    }
  }

  /**
   * 信息日志
   */
  info(...args: any[]): void {
    console.info('[INFO]', ...args)
  }

  /**
   * 警告日志
   */
  warn(...args: any[]): void {
    console.warn('[WARN]', ...args)
  }

  /**
   * 错误日志
   */
  error(...args: any[]): void {
    console.error('[ERROR]', ...args)
  }

  /**
   * 创建带前缀的日志记录器
   */
  createLogger(prefix: string): PrefixLogger {
    return new PrefixLogger(prefix, this)
  }
}

/**
 * 带前缀的日志记录器
 */
class PrefixLogger {
  constructor(
    private prefix: string,
    private parent: Logger
  ) {}

  debug(...args: any[]): void {
    this.parent.debug(`[${this.prefix}]`, ...args)
  }

  info(...args: any[]): void {
    this.parent.info(`[${this.prefix}]`, ...args)
  }

  warn(...args: any[]): void {
    this.parent.warn(`[${this.prefix}]`, ...args)
  }

  error(...args: any[]): void {
    this.parent.error(`[${this.prefix}]`, ...args)
  }
}

// 导出单例
export const logger = new Logger()

// 导出工厂函数
export function createLogger(prefix: string): PrefixLogger {
  return logger.createLogger(prefix)
}













