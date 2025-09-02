import pc from 'picocolors'

/**
 * 日志级别
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

/**
 * 日志配置选项
 */
interface LoggerOptions {
  level?: LogLevel
  timestamp?: boolean
  prefix?: string
  colors?: boolean
}

/**
 * 日志记录器
 */
export class Logger {
  private level: LogLevel = LogLevel.INFO
  private timestamp: boolean = true
  private prefix: string = ''
  private colors: boolean = true

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO
    this.timestamp = options.timestamp ?? true
    this.prefix = options.prefix ?? ''
    this.colors = options.colors ?? true
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level
  }

  /**
   * 启用/禁用颜色输出
   * @param enabled 是否启用颜色
   */
  setColors(enabled: boolean): void {
    this.colors = enabled
  }

  /**
   * 设置日志前缀
   * @param prefix 前缀字符串
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix
  }

  /**
   * 格式化时间戳
   * @returns 格式化的时间戳
   */
  private formatTimestamp(): string {
    if (!this.timestamp) return ''
    const now = new Date()
    const timeStr = now.toLocaleTimeString()
    return this.colors ? pc.gray(`[${timeStr}]`) : `[${timeStr}]`
  }

  /**
   * 格式化前缀
   * @returns 格式化的前缀
   */
  private formatPrefix(): string {
    if (!this.prefix) return ''
    return this.colors ? pc.cyan(`[${this.prefix}]`) : `[${this.prefix}]`
  }

  /**
   * 构建日志行
   * @param levelLabel 级别标签
   * @param levelColor 级别颜色函数
   * @param message 消息内容
   * @returns 格式化的日志行
   */
  private buildLogLine(
    levelLabel: string,
    levelColor: (text: string) => string,
    message: string
  ): string {
    const parts = [
      this.formatTimestamp(),
      this.formatPrefix(),
      this.colors ? levelColor(levelLabel) : levelLabel,
      message
    ].filter(Boolean)
    
    return parts.join(' ')
  }

  /**
   * 记录错误日志
   * @param message 错误消息
   * @param error 错误对象
   */
  error(message: string, error?: Error): void {
    if (this.level >= LogLevel.ERROR) {
      const logLine = this.buildLogLine('ERROR', pc.red, message)
      console.error(logLine)
      
      if (error) {
        if (process.env.NODE_ENV === 'development' && error.stack) {
          console.error(this.colors ? pc.gray(error.stack) : error.stack)
        } else if (error.message && error.message !== message) {
          console.error(this.colors ? pc.gray(`原因: ${error.message}`) : `原因: ${error.message}`)
        }
      }
    }
  }

  /**
   * 记录警告日志
   * @param message 警告消息
   */
  warn(message: string): void {
    if (this.level >= LogLevel.WARN) {
      const logLine = this.buildLogLine('WARN', pc.yellow, message)
      console.warn(logLine)
    }
  }

  /**
   * 记录信息日志
   * @param message 信息消息
   */
  info(message: string): void {
    if (this.level >= LogLevel.INFO) {
      const logLine = this.buildLogLine('INFO', pc.blue, message)
      console.log(logLine)
    }
  }

  /**
   * 记录调试日志
   * @param message 调试消息
   */
  debug(message: string): void {
    if (this.level >= LogLevel.DEBUG) {
      const logLine = this.buildLogLine('DEBUG', pc.gray, message)
      console.log(logLine)
    }
  }

  /**
   * 记录详细日志
   * @param message 详细消息
   */
  verbose(message: string): void {
    if (this.level >= LogLevel.VERBOSE) {
      const logLine = this.buildLogLine('VERBOSE', pc.magenta, message)
      console.log(logLine)
    }
  }

  /**
   * 记录成功消息
   * @param message 成功消息
   */
  success(message: string): void {
    if (this.level >= LogLevel.INFO) {
      const logLine = this.buildLogLine('SUCCESS', pc.green, message)
      console.log(logLine)
    }
  }

  /**
   * 开始计时
   * @param label 计时标签
   */
  time(label: string): void {
    if (this.level >= LogLevel.DEBUG) {
      console.time(this.colors ? pc.cyan(label) : label)
    }
  }

  /**
   * 结束计时
   * @param label 计时标签
   */
  timeEnd(label: string): void {
    if (this.level >= LogLevel.DEBUG) {
      console.timeEnd(this.colors ? pc.cyan(label) : label)
    }
  }

  /**
   * 创建带前缀的子记录器
   * @param prefix 子记录器前缀
   * @returns 新的Logger实例
   */
  child(prefix: string): Logger {
    return new Logger({
      level: this.level,
      timestamp: this.timestamp,
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      colors: this.colors
    })
  }

  /**
   * 输出分割线
   * @param char 分割字符
   * @param length 长度
   */
  divider(char: string = '-', length: number = 50): void {
    if (this.level >= LogLevel.INFO) {
      const line = char.repeat(length)
      console.log(this.colors ? pc.gray(line) : line)
    }
  }

  /**
   * 输出表格数据
   * @param data 表格数据
   */
  table(data: Record<string, any>[]): void {
    if (this.level >= LogLevel.INFO) {
      console.table(data)
    }
  }

  /**
   * 清空控制台
   */
  clear(): void {
    console.clear()
  }

  /**
   * 输出空行
   * @param count 空行数量
   */
  newLine(count: number = 1): void {
    if (this.level >= LogLevel.INFO) {
      console.log('\n'.repeat(count - 1))
    }
  }

  /**
   * 条件日志记录
   * @param condition 条件
   * @param level 日志级别
   * @param message 消息
   */
  conditionalLog(condition: boolean, level: 'info' | 'warn' | 'error' | 'debug', message: string): void {
    if (condition) {
      this[level](message)
    }
  }

  /**
   * 进度指示器
   * @param current 当前进度
   * @param total 总进度
   * @param message 消息
   */
  progress(current: number, total: number, message: string = ''): void {
    if (this.level >= LogLevel.INFO) {
      const percentage = Math.round((current / total) * 100)
      const filled = Math.round((current / total) * 20)
      const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
      const progressLine = this.colors 
        ? `${pc.cyan('PROGRESS')} ${pc.green(bar)} ${pc.yellow(`${percentage}%`)} ${message}`
        : `PROGRESS ${bar} ${percentage}% ${message}`
      
      // 使用 \r 在同一行更新进度
      process.stdout.write(`\r${progressLine}${' '.repeat(10)}`)
      
      if (current === total) {
        console.log() // 完成后换行
      }
    }
  }
}

/**
 * 获取环境变量中的日志级别
 */
function getLogLevelFromEnv(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase()
  switch (envLevel) {
    case 'ERROR': return LogLevel.ERROR
    case 'WARN': return LogLevel.WARN
    case 'INFO': return LogLevel.INFO
    case 'DEBUG': return LogLevel.DEBUG
    case 'VERBOSE': return LogLevel.VERBOSE
    default:
      return process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
  }
}

/**
 * 默认日志记录器实例
 */
export const logger = new Logger({
  level: getLogLevelFromEnv(),
  timestamp: true,
  colors: process.stdout.isTTY !== false, // 检测是否在终端中运行
})

/**
 * 创建专用记录器的工厂函数
 */
export function createLogger(prefix: string, options?: Partial<LoggerOptions>): Logger {
  return new Logger({
    level: getLogLevelFromEnv(),
    timestamp: true,
    colors: process.stdout.isTTY !== false,
    prefix,
    ...options,
  })
}
