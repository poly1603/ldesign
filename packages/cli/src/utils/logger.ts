/**
 * 日志工具
 * 提供统一的日志输出功能
 */

import chalk from 'chalk'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

/**
 * 日志记录器类
 */
class Logger {
  private level: LogLevel = 'info'

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.level
  }

  /**
   * 检查是否应该输出指定级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    if (this.level === 'silent') return false
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentIndex = levels.indexOf(this.level)
    const targetIndex = levels.indexOf(level)
    
    return targetIndex >= currentIndex
  }

  /**
   * 格式化时间戳
   */
  private getTimestamp(): string {
    return new Date().toLocaleTimeString()
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]): void {
    if (!this.shouldLog('debug')) return
    }] [DEBUG]`), message, ...args)
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]): void {
    if (!this.shouldLog('info')) return
    }] [INFO]`), message, ...args)
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]): void {
    if (!this.shouldLog('warn')) return
    console.warn(chalk.yellow(`[${this.getTimestamp()}] [WARN]`), message, ...args)
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: any[]): void {
    if (!this.shouldLog('error')) return
    console.error(chalk.red(`[${this.getTimestamp()}] [ERROR]`), message, ...args)
  }

  /**
   * 成功日志
   */
  success(message: string, ...args: any[]): void {
    if (!this.shouldLog('info')) return
    }] [SUCCESS]`), message, ...args)
  }

  /**
   * 带前缀的日志
   */
  withPrefix(prefix: string) {
    return {
      debug: (message: string, ...args: any[]) => this.debug(`[${prefix}] ${message}`, ...args),
      info: (message: string, ...args: any[]) => this.info(`[${prefix}] ${message}`, ...args),
      warn: (message: string, ...args: any[]) => this.warn(`[${prefix}] ${message}`, ...args),
      error: (message: string, ...args: any[]) => this.error(`[${prefix}] ${message}`, ...args),
      success: (message: string, ...args: any[]) => this.success(`[${prefix}] ${message}`, ...args)
    }
  }
}

// 导出单例实例
export const logger = new Logger()

// 导出类型
export { Logger }
