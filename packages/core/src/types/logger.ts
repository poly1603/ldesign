/**
 * 日志系统类型定义
 */

/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * 日志条目
 */
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  context?: string
  data?: any
}

/**
 * 日志配置
 */
export interface LoggerConfig {
  /** 日志级别 */
  level?: LogLevel
  /** 是否启用 */
  enabled?: boolean
  /** 是否显示时间戳 */
  showTimestamp?: boolean
  /** 是否显示上下文 */
  showContext?: boolean
  /** 日志前缀 */
  prefix?: string
  /** 最大日志数量 */
  maxLogs?: number
}

/**
 * 日志器接口
 */
export interface Logger {
  /** 调试日志 */
  debug(message: string, ...args: any[]): void

  /** 信息日志 */
  info(message: string, ...args: any[]): void

  /** 警告日志 */
  warn(message: string, ...args: any[]): void

  /** 错误日志 */
  error(message: string, ...args: any[]): void

  /** 设置日志级别 */
  setLevel(level: LogLevel): void

  /** 获取日志级别 */
  getLevel(): LogLevel

  /** 获取日志历史 */
  getHistory(): LogEntry[]

  /** 清空日志历史 */
  clearHistory(): void

  /** 初始化和销毁 */
  init?(): Promise<void>
  destroy?(): Promise<void>
}

