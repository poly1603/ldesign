/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

/**
 * 日志接口
 */
export interface ILogger {
  debug(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  setLevel(level: LogLevel | keyof typeof LogLevel): void
}

/**
 * 日志实现
 */
export class Logger implements ILogger {
  private level: LogLevel = LogLevel.INFO
  private readonly prefix: string

  constructor(name: string) {
    this.prefix = `[${name}]`
  }

  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.prefix, message, ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.prefix, message, ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.prefix, message, ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.prefix, message, ...args)
    }
  }

  setLevel(level: LogLevel | keyof typeof LogLevel): void {
    if (typeof level === 'string') {
      this.level = LogLevel[level]
    } else {
      this.level = level
    }
  }
}

/**
 * 创建日志实例
 */
export function createLogger(name: string): Logger {
  return new Logger(name)
}

/**
 * 全局日志配置
 */
class GlobalLogger {
  private static instance: GlobalLogger
  private level: LogLevel = LogLevel.INFO

  static getInstance(): GlobalLogger {
    if (!GlobalLogger.instance) {
      GlobalLogger.instance = new GlobalLogger()
    }
    return GlobalLogger.instance
  }

  setGlobalLevel(level: LogLevel | keyof typeof LogLevel): void {
    if (typeof level === 'string') {
      this.level = LogLevel[level]
    } else {
      this.level = level
    }
  }

  getGlobalLevel(): LogLevel {
    return this.level
  }
}

/**
 * 设置全局日志级别
 */
export function setGlobalLogLevel(level: LogLevel | keyof typeof LogLevel): void {
  GlobalLogger.getInstance().setGlobalLevel(level)
}

/**
 * 获取全局日志级别
 */
export function getGlobalLogLevel(): LogLevel {
  return GlobalLogger.getInstance().getGlobalLevel()
}