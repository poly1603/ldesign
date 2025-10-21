/**
 * Enhanced Logger - 高性能日志记录器
 * 
 * 提供美化的、高性能的统一日志输出功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import picocolors from 'picocolors'
import { performance } from 'perf_hooks'
import { createWriteStream, WriteStream } from 'fs'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

export interface LoggerOptions {
  level?: LogLevel
  colors?: boolean
  timestamp?: boolean
  prefix?: string
  logFile?: string
  compact?: boolean
  showPerformance?: boolean
}

// 日志图标
const LOG_ICONS = {
  debug: '🔍',
  info: 'ℹ️ ',
  warn: '⚠️ ',
  error: '❌',
  success: '✅',
  start: '🚀',
  build: '📦',
  preview: '👁️ ',
  time: '⏱️ '
} as const

// 性能记录器
interface PerformanceRecord {
  label: string
  startTime: number
  endTime?: number
  duration?: number
}

/**
 * 增强的日志记录器类
 * 
 * 提供美化输出、性能监控、规范化格式的日志功能
 */
export class EnhancedLogger {
  private name: string
  private level: LogLevel
  private useColors: boolean
  private timestamp: boolean
  private compact: boolean
  private showPerformance: boolean
  private performanceRecords: Map<string, PerformanceRecord> = new Map()
  private lastLogTime: number = 0
  private logBuffer: string[] = []
  private bufferSize: number = 100
  private fileStream?: WriteStream
  
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4
  }

  constructor(name: string, options: LoggerOptions = {}) {
    this.name = name
    this.level = options.level || 'info'
    this.useColors = options.colors !== false
    this.timestamp = options.timestamp || false
    this.compact = options.compact !== false
    this.showPerformance = options.showPerformance !== false
    
    if (options.logFile) {
      this.fileStream = createWriteStream(options.logFile, { flags: 'a' })
    }
  }

  /**
   * 记录调试信息
   */
  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      this.log('debug', message, meta)
    }
  }

  /**
   * 记录信息日志
   */
  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      this.log('info', message, meta)
    }
  }

  /**
   * 记录警告信息
   */
  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      this.log('warn', message, meta)
    }
  }

  /**
   * 记录错误信息
   */
  error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      this.log('error', message, error)
    }
  }

  /**
   * 记录成功信息
   */
  success(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      const icon = this.useColors ? LOG_ICONS.success : '[SUCCESS]'
      const formattedMessage = this.useColors ? picocolors.green(message) : message
      this.logWithIcon('info', icon, formattedMessage, meta)
    }
  }

  /**
   * 记录启动信息
   */
  start(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      const icon = this.useColors ? LOG_ICONS.start : '[START]'
      const formattedMessage = this.useColors ? picocolors.cyan(message) : message
      this.logWithIcon('info', icon, formattedMessage, meta)
    }
  }

  /**
   * 记录构建信息
   */
  build(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      const icon = this.useColors ? LOG_ICONS.build : '[BUILD]'
      const formattedMessage = this.useColors ? picocolors.blue(message) : message
      this.logWithIcon('info', icon, formattedMessage, meta)
    }
  }

  /**
   * 开始计时
   */
  time(label: string): void {
    this.performanceRecords.set(label, {
      label,
      startTime: performance.now()
    })
  }

  /**
   * 结束计时并输出耗时
   */
  timeEnd(label: string, message?: string): void {
    const record = this.performanceRecords.get(label)
    if (!record) {
      this.warn(`计时器 "${label}" 不存在`)
      return
    }

    const endTime = performance.now()
    const duration = endTime - record.startTime
    record.endTime = endTime
    record.duration = duration

    const formattedDuration = this.formatDuration(duration)
    const icon = this.useColors ? LOG_ICONS.time : '[TIME]'
    const msg = message || `${label} 完成`
    const finalMessage = this.useColors 
      ? `${picocolors.cyan(msg)} ${picocolors.gray(`(${formattedDuration})`)}`
      : `${msg} (${formattedDuration})`

    this.logWithIcon('info', icon, finalMessage)
    this.performanceRecords.delete(label)
  }

  /**
   * 创建进度条
   */
  createProgressBar(total: number, label: string = '进度'): (current: number) => void {
    let lastPercent = -1
    
    return (current: number) => {
      const percent = Math.floor((current / total) * 100)
      if (percent !== lastPercent && this.shouldLog('info')) {
        lastPercent = percent
        const bar = this.generateProgressBar(percent)
        const message = `${label}: ${bar} ${percent}%`
        process.stdout.write(`\r${this.formatPrefix('info')} ${message}`)
        if (percent === 100) {
          process.stdout.write('\n')
        }
      }
    }
  }

  /**
   * 清空缓冲区
   */
  flush(): void {
    if (this.logBuffer.length > 0) {
      console.log(this.logBuffer.join('\n'))
      this.logBuffer = []
    }
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.level
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level
  }

  /**
   * 关闭日志文件流
   */
  close(): void {
    if (this.fileStream) {
      this.fileStream.end()
      this.fileStream = undefined
    }
  }

  /**
   * 输出带图标的日志
   */
  private logWithIcon(level: LogLevel, icon: string, message: string, meta?: any): void {
    const prefix = this.formatPrefix(level)
    const logParts = this.compact 
      ? [icon, message].filter(Boolean).join(' ')
      : [icon, prefix, message].filter(Boolean).join(' ')

    const output = level === 'error' ? console.error : console.log
    output(logParts)

    if (meta !== undefined) {
      this.logMetadata(meta)
    }
    
    // 写入文件
    if (this.fileStream) {
      this.fileStream.write(logParts + '\n')
    }
  }

  /**
   * 输出日志
   */
  private log(level: LogLevel, message: string, meta?: any): void {
    // 计算与上次日志的时间差
    const now = Date.now()
    const timeDiff = this.lastLogTime ? now - this.lastLogTime : 0
    this.lastLogTime = now

    const timestamp = this.timestamp ? this.formatTimestamp() : ''
    const prefix = this.formatPrefix(level)
    const icon = this.getIcon(level)
    const formattedMessage = this.formatMessage(level, message)

    // 紧凑模式：单行输出
    let logParts: string
    if (this.compact) {
      const parts = [
        icon,
        formattedMessage,
        this.showPerformance && timeDiff > 1000 ? picocolors.gray(`+${this.formatDuration(timeDiff)}`) : ''
      ].filter(Boolean)
      logParts = parts.join(' ')
    } else {
      const parts = [
        timestamp,
        icon,
        prefix,
        formattedMessage
      ].filter(Boolean)
      logParts = parts.join(' ')
    }

    const output = level === 'error' ? console.error : console.log
    output(logParts)

    // 写入文件
    if (this.fileStream) {
      this.fileStream.write(logParts + '\n')
    }

    // 如果有元数据，格式化输出
    if (meta !== undefined) {
      this.logMetadata(meta)
    }
  }

  /**
   * 输出元数据
   */
  private logMetadata(meta: any): void {
    if (meta instanceof Error) {
      const stack = meta.stack || meta.message
      if (this.useColors) {
        console.error(picocolors.red(stack))
      } else {
        console.error(stack)
      }
    } else if (typeof meta === 'object') {
      try {
        const json = JSON.stringify(meta, null, 2)
        if (this.useColors && !this.compact) {
          // 语法高亮
          const highlighted = json
            .replace(/"([^"]+)":/g, picocolors.cyan('"$1":'))
            .replace(/: "([^"]+)"/g, ': ' + picocolors.green('"$1"'))
            .replace(/: (\d+)/g, ': ' + picocolors.yellow('$1'))
            .replace(/: (true|false)/g, ': ' + picocolors.magenta('$1'))
            .replace(/: null/g, ': ' + picocolors.gray('null'))
          console.log(picocolors.gray(highlighted))
        } else if (this.compact) {
          // 紧凑模式：单行输出
          console.log(picocolors.gray(JSON.stringify(meta)))
        } else {
          console.log(json)
        }
      } catch {
        console.log(meta)
      }
    } else {
      console.log(meta)
    }
  }

  /**
   * 生成进度条
   */
  private generateProgressBar(percent: number): string {
    const width = 30
    const filled = Math.floor((percent / 100) * width)
    const empty = width - filled
    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    return this.useColors ? picocolors.cyan(bar) : bar
  }

  /**
   * 格式化持续时间
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`
    } else {
      const minutes = Math.floor(ms / 60000)
      const seconds = ((ms % 60000) / 1000).toFixed(0)
      return `${minutes}m ${seconds}s`
    }
  }

  /**
   * 格式化时间戳
   */
  private formatTimestamp(): string {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    return this.useColors ? picocolors.gray(`[${time}]`) : `[${time}]`
  }

  /**
   * 获取日志级别图标
   */
  private getIcon(level: LogLevel): string {
    if (!this.useColors) return ''
    return LOG_ICONS[level] || ''
  }

  /**
   * 格式化前缀
   */
  private formatPrefix(level: LogLevel): string {
    if (this.compact) {
      const shortName = this.name.length > 10 ? this.name.slice(0, 10) + '…' : this.name
      return this.useColors ? picocolors.cyan(`[${shortName}]`) : `[${shortName}]`
    }

    const levelText = level.toUpperCase().padEnd(5)
    const nameText = `[${this.name}]`

    if (!this.useColors) {
      return `${levelText} ${nameText}`
    }

    const coloredLevel = this.colorizeLevel(level, levelText)
    const coloredName = picocolors.cyan(nameText)

    return `${coloredLevel} ${coloredName}`
  }

  /**
   * 格式化消息
   */
  private formatMessage(level: LogLevel, message: string): string {
    if (!this.useColors) {
      return message
    }

    // 高亮特殊内容
    message = message
      .replace(/`([^`]+)`/g, picocolors.cyan('`$1`'))  // 代码片段
      .replace(/"([^"]+)"/g, picocolors.green('"$1"'))  // 引号内容
      .replace(/\b(\d+(\.\d+)?)(ms|s|m|h|MB|KB|GB)\b/g, picocolors.yellow('$1$3'))  // 数字和单位

    switch (level) {
      case 'debug':
        return picocolors.gray(message)
      case 'info':
        return message
      case 'warn':
        return picocolors.yellow(message)
      case 'error':
        return picocolors.red(message)
      default:
        return message
    }
  }

  /**
   * 给级别添加颜色
   */
  private colorizeLevel(level: LogLevel, text: string): string {
    switch (level) {
      case 'debug':
        return picocolors.gray(text)
      case 'info':
        return picocolors.blue(text)
      case 'warn':
        return picocolors.yellow(text)
      case 'error':
        return picocolors.red(text)
      default:
        return text
    }
  }

  /**
   * 判断是否应该输出日志
   */
  private shouldLog(level: LogLevel): boolean {
    if (this.level === 'silent') {
      return false
    }
    return this.levels[level] >= this.levels[this.level]
  }
}

// 导出原始 Logger 类的兼容层
export class Logger extends EnhancedLogger {
  constructor(name: string, options: LoggerOptions = {}) {
    super(name, options)
  }
}

// 创建默认实例
export const logger = new Logger('Launcher', {
  compact: process.env.NODE_ENV !== 'development',
  showPerformance: process.env.NODE_ENV === 'development'
})

// 便捷函数
export const debug = (message: string, data?: any) => logger.debug(message, data)
export const info = (message: string, data?: any) => logger.info(message, data)
export const success = (message: string, data?: any) => logger.success(message, data)
export const warn = (message: string, data?: any) => logger.warn(message, data)
export const error = (message: string, data?: any) => logger.error(message, data)