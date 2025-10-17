/**
 * 日志系统工具
 * 
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */

import chalk from 'chalk'
import type { LogLevel } from '../types/common'

/**
 * 日志级别枚举
 */
export enum LogLevelEnum {
  SILENT = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  VERBOSE = 5
}

/**
 * 日志级别映射
 */
const LOG_LEVEL_MAP: Record<LogLevel, LogLevelEnum> = {
  silent: LogLevelEnum.SILENT,
  error: LogLevelEnum.ERROR,
  warn: LogLevelEnum.WARN,
  info: LogLevelEnum.INFO,
  debug: LogLevelEnum.DEBUG,
  verbose: LogLevelEnum.VERBOSE
}

/**
 * 日志选项
 */
export interface LoggerOptions {
  /** 日志级别 */
  level?: LogLevel
  /** 是否启用颜色 */
  colors?: boolean
  /** 是否显示时间戳 */
  timestamp?: boolean
  /** 日志前缀 */
  prefix?: string
  /** 是否静默模式 */
  silent?: boolean
}

/**
 * 日志记录器类
 */
export class Logger {
  private level: LogLevelEnum
  private colors: boolean
  private timestamp: boolean
  private prefix: string
  private silent: boolean

  constructor(options: LoggerOptions = {}) {
    this.level = LOG_LEVEL_MAP[options.level || 'info']
    this.colors = options.colors ?? true
    this.timestamp = options.timestamp ?? true  // 默认启用时间戳
    this.prefix = options.prefix || ''  // 默认不显示前缀
    this.silent = options.silent ?? false
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = LOG_LEVEL_MAP[level]
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    const entries = Object.entries(LOG_LEVEL_MAP)
    const entry = entries.find(([, value]) => value === this.level)
    return (entry?.[0] as LogLevel) || 'info'
  }

  /**
   * 设置静默模式
   */
  setSilent(silent: boolean): void {
    this.silent = silent
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevelEnum.ERROR)) {
      this.log('ERROR', message, chalk.red, ...args)
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevelEnum.WARN)) {
      this.log('WARN', message, chalk.yellow, ...args)
    }
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      this.log('INFO', message, chalk.blue, ...args)
    }
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevelEnum.DEBUG)) {
      this.log('DEBUG', message, chalk.gray, ...args)
    }
  }

  /**
   * 详细日志
   */
  verbose(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevelEnum.VERBOSE)) {
      this.log('VERBOSE', message, chalk.gray, ...args)
    }
  }

  /**
   * 成功日志
   */
  success(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      this.log('SUCCESS', message, chalk.green, ...args)
    }
  }

  /**
   * 开始日志（带缩进）
   */
  start(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      this.log('START', `▶ ${message}`, chalk.cyan, ...args)
    }
  }

  /**
   * 完成日志（带缩进）
   */
  complete(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      this.log('COMPLETE', `✓ ${message}`, chalk.green, ...args)
    }
  }

  /**
   * 失败日志（带缩进）
   */
  fail(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevelEnum.ERROR)) {
      this.log('FAIL', `✗ ${message}`, chalk.red, ...args)
    }
  }

  /**
   * 进度日志
   */
  progress(current: number, total: number, message?: string): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      const percent = Math.round((current / total) * 100)
      const progressBar = this.createProgressBar(percent)
      const progressMessage = message ? ` ${message}` : ''
      this.log('PROGRESS', `${progressBar} ${percent}%${progressMessage}`, chalk.cyan)
    }
  }

  /**
   * 表格日志
   */
  table(data: Record<string, any>[]): void {
    if (this.shouldLog(LogLevelEnum.INFO) && data.length > 0) {
      console.table(data)
    }
  }

  /**
   * 分组开始
   */
  group(label: string): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      console.group(this.formatMessage('GROUP', label, chalk.cyan))
    }
  }

  /**
   * 分组结束
   */
  groupEnd(): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      console.groupEnd()
    }
  }

  /**
   * 清屏
   */
  clear(): void {
    if (!this.silent) {
      console.clear()
    }
  }

  /**
   * 换行
   */
  newLine(): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      console.log('')
    }
  }

  /**
   * 分隔线
   */
  divider(char: string = '-', length: number = 50): void {
    if (this.shouldLog(LogLevelEnum.INFO)) {
      console.log(char.repeat(length))
    }
  }

  /**
   * 创建子日志记录器
   */
  child(prefix: string, options: Partial<LoggerOptions> = {}): Logger {
    return new Logger({
      level: this.getLevel(),
      colors: this.colors,
      timestamp: this.timestamp,
      prefix: `${this.prefix}:${prefix}`,
      silent: this.silent,
      ...options
    })
  }

  /**
   * 判断是否应该记录日志
   */
  private shouldLog(level: LogLevelEnum): boolean {
    return !this.silent && this.level >= level
  }

  /**
   * 记录日志
   */
  private log(type: string, message: string, colorFn: (str: string) => string, ...args: any[]): void {
    const formattedMessage = this.formatMessage(type, message, colorFn)
    console.log(formattedMessage, ...args)
  }

  /**
   * 格式化消息
   * 新格式: [HH:mm:ss] [LEVEL] 消息内容
   * - 时间戳使用灰色
   * - 日志级别标签使用对应颜色
   * - 消息内容使用默认颜色（不着色）
   * - 只对特殊内容（路径、数字等）进行高亮
   */
  private formatMessage(type: string, message: string, colorFn: (str: string) => string): string {
    let formatted = ''

    // 添加时间戳 [HH:mm:ss]
    if (this.timestamp) {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const timestamp = `${hours}:${minutes}:${seconds}`
      formatted += chalk.gray(`[${timestamp}] `)
    }

    // 添加日志级别标签（带颜色）
    if (this.colors) {
      formatted += colorFn(`[${type}]`) + ' '
    } else {
      formatted += `[${type}] `
    }

    // 添加消息内容（不着色，保持原始消息中的颜色）
    formatted += message

    return formatted
  }

  /**
   * 创建进度条
   */
  private createProgressBar(percent: number, width: number = 20): string {
    const filled = Math.round((percent / 100) * width)
    const empty = width - filled
    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    return this.colors ? chalk.cyan(bar) : bar
  }
}

/**
 * 默认日志记录器实例
 */
export const logger = new Logger()

/**
 * 创建日志记录器
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  return new Logger(options)
}

/**
 * 设置全局日志级别
 */
export function setLogLevel(level: LogLevel): void {
  logger.setLevel(level)
}

/**
 * 设置全局静默模式
 */
export function setSilent(silent: boolean): void {
  logger.setSilent(silent)
}

/**
 * 高亮工具函数 - 用于在日志消息中高亮特定内容
 */
export const highlight = {
  /**
   * 高亮文件路径（青色）
   */
  path: (path: string): string => chalk.cyan(path),

  /**
   * 高亮数字/数据（黄色）
   */
  number: (value: number | string): string => chalk.yellow(String(value)),

  /**
   * 高亮百分比（黄色）
   */
  percent: (value: number): string => chalk.yellow(`${value}%`),

  /**
   * 高亮文件大小（青色）
   */
  size: (size: string): string => chalk.cyan(size),

  /**
   * 高亮耗时（黄色）
   */
  time: (time: string): string => chalk.yellow(time),

  /**
   * 高亮成功信息（绿色）
   */
  success: (text: string): string => chalk.green(text),

  /**
   * 高亮错误信息（红色）
   */
  error: (text: string): string => chalk.red(text),

  /**
   * 高亮警告信息（黄色）
   */
  warn: (text: string): string => chalk.yellow(text),

  /**
   * 高亮重要信息（青色加粗）
   */
  important: (text: string): string => chalk.cyan.bold(text),

  /**
   * 高亮次要信息（灰色）
   */
  dim: (text: string): string => chalk.gray(text)
}
