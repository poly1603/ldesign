/**
 * @fileoverview 日志工具模块
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import { picocolors as pc } from 'picocolors'
import type { LogLevel, ILogger } from '../types'
import { DEFAULT_CONFIG } from '../constants'

/**
 * 日志级别映射
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  silent: 3,
}

/**
 * 日志颜色映射
 */
const LOG_COLORS = {
  error: pc.red,
  warn: pc.yellow,
  info: pc.cyan,
  debug: pc.gray,
  success: pc.green,
} as const

/**
 * 日志前缀
 */
const LOG_PREFIX = '[ViteLauncher]'

/**
 * 默认日志记录器实现
 */
export class Logger implements ILogger {
  private level: LogLevel
  private enableTimestamp: boolean
  private enableColors: boolean

  constructor(
    level: LogLevel = DEFAULT_CONFIG.LOG_LEVEL,
    enableTimestamp = true,
    enableColors = true
  ) {
    this.level = level
    this.enableTimestamp = enableTimestamp
    this.enableColors = enableColors
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level
  }

  /**
   * 启用或禁用时间戳
   * @param enabled 是否启用
   */
  setTimestamp(enabled: boolean): void {
    this.enableTimestamp = enabled
  }

  /**
   * 启用或禁用颜色
   * @param enabled 是否启用
   */
  setColors(enabled: boolean): void {
    this.enableColors = enabled
  }

  /**
   * 记录信息日志
   * @param message 消息
   * @param args 额外参数
   */
  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args)
  }

  /**
   * 记录警告日志
   * @param message 消息
   * @param args 额外参数
   */
  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args)
  }

  /**
   * 记录错误日志
   * @param message 消息
   * @param args 额外参数
   */
  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args)
  }

  /**
   * 记录调试日志
   * @param message 消息
   * @param args 额外参数
   */
  debug(message: string, ...args: unknown[]): void {
    // 调试日志只在开发环境下显示
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, ...args)
    }
  }

  /**
   * 记录成功日志
   * @param message 消息
   * @param args 额外参数
   */
  success(message: string, ...args: unknown[]): void {
    this.log('success', message, ...args)
  }

  /**
   * 创建带有上下文的日志记录器
   * @param context 上下文名称
   * @returns 带上下文的日志记录器
   */
  createChild(context: string): Logger {
    const child = new Logger(this.level, this.enableTimestamp, this.enableColors)
    
    // 重写日志方法，添加上下文
    const originalLog = child.log.bind(child)
    child.log = (level: any, message: string, ...args: unknown[]) => {
      originalLog(level, `[${context}] ${message}`, ...args)
    }

    return child
  }

  /**
   * 核心日志记录方法
   * @param level 日志级别
   * @param message 消息
   * @param args 额外参数
   */
  private log(
    level: keyof typeof LOG_COLORS, 
    message: string, 
    ...args: unknown[]
  ): void {
    // 检查是否应该输出此级别的日志
    if (this.level === 'silent' || 
        (level in LOG_LEVELS && LOG_LEVELS[level as LogLevel] > LOG_LEVELS[this.level])) {
      return
    }

    // 构建日志消息
    let logMessage = LOG_PREFIX

    // 添加时间戳
    if (this.enableTimestamp) {
      const timestamp = new Date().toISOString()
      logMessage += ` ${timestamp}`
    }

    // 添加级别标识
    const levelTag = `[${level.toUpperCase()}]`
    logMessage += ` ${levelTag}`

    // 添加消息内容
    logMessage += ` ${message}`

    // 应用颜色
    if (this.enableColors && level in LOG_COLORS) {
      logMessage = LOG_COLORS[level](logMessage)
    }

    // 输出日志
    const logMethod = this.getLogMethod(level as LogLevel)
    logMethod(logMessage, ...args)
  }

  /**
   * 获取对应的控制台输出方法
   * @param level 日志级别
   * @returns 控制台方法
   */
  private getLogMethod(level: LogLevel | 'debug' | 'success') {
    switch (level) {
      case 'error':
        return console.error
      case 'warn':
        return console.warn
      case 'debug':
        return console.debug
      default:
        return console.log
    }
  }
}

/**
 * 默认日志实例
 */
export const logger = new Logger()

/**
 * 创建进度条日志
 * @param total 总数
 * @param prefix 前缀
 * @returns 进度条更新函数
 */
export function createProgressLogger(
  total: number, 
  prefix = 'Progress'
): (current: number, message?: string) => void {
  let lastLogTime = 0
  const throttleInterval = 100 // 限制更新频率

  return (current: number, message = '') => {
    const now = Date.now()
    if (now - lastLogTime < throttleInterval && current < total) {
      return
    }
    lastLogTime = now

    const percentage = Math.round((current / total) * 100)
    const progressBar = '█'.repeat(Math.floor(percentage / 2)) + 
                       '░'.repeat(50 - Math.floor(percentage / 2))
    
    const logMessage = `${prefix} [${progressBar}] ${percentage}% ${message}`
    
    if (current === total) {
      logger.success(logMessage)
    } else {
      logger.info(logMessage)
    }
  }
}

/**
 * 创建计时器日志
 * @param name 计时器名称
 * @returns 计时器控制函数
 */
export function createTimer(name: string) {
  const startTime = Date.now()
  
  return {
    /**
     * 记录中间时间点
     * @param message 消息
     */
    mark(message: string): void {
      const elapsed = Date.now() - startTime
      logger.debug(`${name} - ${message} (${elapsed}ms)`)
    },

    /**
     * 结束计时
     * @param message 结束消息
     */
    end(message = 'completed'): void {
      const elapsed = Date.now() - startTime
      logger.info(`${name} ${message} in ${elapsed}ms`)
    }
  }
}

/**
 * 创建分组日志
 * @param title 分组标题
 * @returns 分组日志函数
 */
export function createLogGroup(title: string) {
  logger.info(`\n=== ${title} ===`)
  
  return {
    /**
     * 记录分组内的日志
     * @param level 日志级别
     * @param message 消息
     * @param args 额外参数
     */
    log(level: keyof typeof LOG_COLORS, message: string, ...args: unknown[]): void {
      logger[level](`  ${message}`, ...args)
    },

    /**
     * 结束分组
     */
    end(): void {
      logger.info(`=== End ${title} ===\n`)
    }
  }
}

/**
 * 记录表格数据
 * @param data 表格数据
 * @param title 表格标题
 */
export function logTable(data: Record<string, any>[], title?: string): void {
  if (title) {
    logger.info(title)
  }
  console.table(data)
}

/**
 * 记录对象信息
 * @param obj 对象
 * @param title 标题
 * @param depth 深度
 */
export function logObject(
  obj: any, 
  title?: string, 
  depth = 2
): void {
  if (title) {
    logger.info(title)
  }
  console.dir(obj, { depth, colors: true })
}

/**
 * 记录文件操作日志
 * @param operation 操作类型
 * @param filePath 文件路径
 * @param success 是否成功
 * @param error 错误信息
 */
export function logFileOperation(
  operation: 'read' | 'write' | 'copy' | 'delete' | 'create',
  filePath: string,
  success: boolean,
  error?: string
): void {
  const operationMap = {
    read: '读取',
    write: '写入',
    copy: '复制',
    delete: '删除',
    create: '创建'
  }

  const verb = operationMap[operation]
  const shortPath = filePath.length > 50 
    ? '...' + filePath.slice(-47) 
    : filePath

  if (success) {
    logger.success(`${verb}文件成功: ${shortPath}`)
  } else {
    logger.error(`${verb}文件失败: ${shortPath}${error ? ` - ${error}` : ''}`)
  }
}

/**
 * 记录网络请求日志
 * @param method HTTP 方法
 * @param url 请求 URL
 * @param status 响应状态码
 * @param duration 请求耗时
 */
export function logHttpRequest(
  method: string,
  url: string,
  status: number,
  duration: number
): void {
  const statusColor = status >= 400 ? pc.red : 
                     status >= 300 ? pc.yellow : 
                     pc.green

  const message = `${method} ${url} ${statusColor(status.toString())} (${duration}ms)`
  
  if (status >= 400) {
    logger.error(message)
  } else if (status >= 300) {
    logger.warn(message)
  } else {
    logger.info(message)
  }
}

/**
 * 格式化错误信息并记录
 * @param error 错误对象
 * @param context 错误上下文
 */
export function logError(error: Error, context?: string): void {
  const contextPrefix = context ? `[${context}] ` : ''
  logger.error(`${contextPrefix}${error.message}`)
  
  if (error.stack && process.env.NODE_ENV === 'development') {
    logger.debug(error.stack)
  }
}