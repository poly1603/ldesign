import { memoryManager } from './memory-manager'

// 日志级别枚举
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5
}

// 日志级别名称映射
export const LogLevelNames: Record<LogLevel, string> = {
  [LogLevel.TRACE]: 'TRACE',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL'
}

// 日志条目接口
export interface LogEntry {
  id: string
  timestamp: number
  level: LogLevel
  message: string
  data?: any
  context?: LogContext
  stack?: string
  fingerprint?: string // 用于错误去重
}

// 日志上下文
export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  module?: string
  function?: string
  tags?: string[]
  metadata?: Record<string, any>
}

// 日志处理器接口
export interface LogHandler {
  handle: (entry: LogEntry) => void | Promise<void>
  shouldHandle: (level: LogLevel) => boolean
  getName: () => string
  destroy?: () => void
}

// 错误报告接口
export interface ErrorReport {
  id: string
  timestamp: number
  message: string
  stack?: string
  context?: LogContext
  fingerprint: string
  count: number
  firstOccurrence: number
  lastOccurrence: number
  userAgent?: string
  url?: string
  additionalData?: any
}

// 控制台日志处理器
export class ConsoleLogHandler implements LogHandler {
  private colors: Record<LogLevel, string> = {
    [LogLevel.TRACE]: '\x1B[90m', // 灰色
    [LogLevel.DEBUG]: '\x1B[36m', // 青色
    [LogLevel.INFO]: '\x1B[32m', // 绿色
    [LogLevel.WARN]: '\x1B[33m', // 黄色
    [LogLevel.ERROR]: '\x1B[31m', // 红色
    [LogLevel.FATAL]: '\x1B[35m' // 紫色
  }

  private resetColor = '\x1B[0m'

  constructor(private minLevel: LogLevel = LogLevel.INFO) { }

  shouldHandle(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  getName(): string {
    return 'ConsoleLogHandler'
  }

  handle(entry: LogEntry): void {
    if (!this.shouldHandle(entry.level)) return

    const color = this.colors[entry.level]
    const levelName = LogLevelNames[entry.level]
    const timestamp = new Date(entry.timestamp).toISOString()

    const prefix = `${color}[${timestamp}] ${levelName}${this.resetColor}`
    const context = entry.context ? ` [${this.formatContext(entry.context)}]` : ''

    const message = `${prefix}${context} ${entry.message}`

    const consoleMethods: Record<LogLevel, keyof Console> = {
      [LogLevel.TRACE]: 'trace',
      [LogLevel.DEBUG]: 'debug',
      [LogLevel.INFO]: 'info',
      [LogLevel.WARN]: 'warn',
      [LogLevel.ERROR]: 'error',
      [LogLevel.FATAL]: 'error'
    }

    const consoleMethod = consoleMethods[entry.level] as keyof Console
    const consoleFunction = console[consoleMethod] as (...args: unknown[]) => void

    if (entry.data !== undefined) {
      consoleFunction(message, entry.data)
    } else {
      consoleFunction(message)
    }

    // 对于错误级别，显示堆栈信息
    if (entry.level >= LogLevel.ERROR && entry.stack) {
      console.error('Stack trace:', entry.stack)
    }
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  private formatContext(context: LogContext): string {
    const parts: string[] = []

    if (context.module) parts.push(`${context.module}`)
    if (context.function) parts.push(`${context.function}()`)
    if (context.userId) parts.push(`user:${context.userId}`)
    if (context.requestId) parts.push(`req:${context.requestId.substring(0, 8)}`)

    return parts.join('|')
  }
}

// 内存日志处理器
export class MemoryLogHandler implements LogHandler {
  private logs: LogEntry[] = []
  private maxSize: number

  constructor(maxSize = 1000, private minLevel: LogLevel = LogLevel.TRACE) {
    this.maxSize = maxSize
  }

  shouldHandle(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  getName(): string {
    return 'MemoryLogHandler'
  }

  handle(entry: LogEntry): void {
    if (!this.shouldHandle(entry.level)) return

    this.logs.push(entry)

    // 保持日志数量在限制内
    if (this.logs.length > this.maxSize) {
      this.logs.splice(0, this.logs.length - this.maxSize)
    }
  }

  getLogs(filter?: {
    level?: LogLevel
    module?: string
    since?: number
    limit?: number
  }): LogEntry[] {
    let filteredLogs = this.logs

    if (filter) {
      if (filter.level !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.level >= filter.level!)
      }

      if (filter.module) {
        filteredLogs = filteredLogs.filter(log =>
          log.context?.module === filter.module,
        )
      }

      if (filter.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.since!)
      }

      if (filter.limit) {
        filteredLogs = filteredLogs.slice(-filter.limit)
      }
    }

    // 返回反转的数组，最新的日志在前
    return [...filteredLogs].reverse()
  }

  clear(): void {
    this.logs = []
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  setMaxSize(size: number): void {
    this.maxSize = size
    // 如果当前日志数量超过新的最大值，进行裁剪
    if (this.logs.length > size) {
      this.logs.splice(0, this.logs.length - size)
    }
  }
}

// 远程日志处理器
export class RemoteLogHandler implements LogHandler {
  private buffer: LogEntry[] = []
  private batchSize: number
  private flushInterval: NodeJS.Timeout

  constructor(
    private endpoint: string,
    private apiKey?: string,
    batchSize = 50,
    flushIntervalMs = 30000,
    private minLevel: LogLevel = LogLevel.WARN
  ) {
    this.batchSize = batchSize

    // 定期刷新缓冲区
    this.flushInterval = memoryManager.setInterval(() => {
      this.flush()
    }, flushIntervalMs)

    // 页面卸载时刷新
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush()
      })
    }
  }

  shouldHandle(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  getName(): string {
    return 'RemoteLogHandler'
  }

  handle(entry: LogEntry): void {
    if (!this.shouldHandle(entry.level)) return

    this.buffer.push(entry)

    // 如果缓冲区满了，立即刷新
    if (this.buffer.length >= this.batchSize) {
      this.flush()
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const logsToSend = [...this.buffer]
    this.buffer = []

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`
      }

      await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          logs: logsToSend,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })
    } catch (error) {
      // 如果发送失败，将日志放回缓冲区
      this.buffer = logsToSend.concat(this.buffer)
      console.error('Failed to send logs to remote endpoint:', error)
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      memoryManager.clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// 错误追踪器
export class ErrorTracker {
  private errorReports: Map<string, ErrorReport> = new Map()
  private maxReports = 1000
  private listeners: Array<(report: ErrorReport) => void> = []

  constructor() {
    // 自动捕获未处理的错误
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError(event.error, {
          module: 'global',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(event.reason, {
          module: 'promise',
          metadata: { type: 'unhandledrejection' }
        })
      })
    }
  }

  captureError(error: any, context?: LogContext): ErrorReport {
    const errorInfo = this.extractErrorInfo(error)
    const fingerprint = this.generateFingerprint(errorInfo, context)

    let report = this.errorReports.get(fingerprint)
    const now = Date.now()

    if (report) {
      // 更新现有报告
      report.count++
      report.lastOccurrence = now
      report.context = { ...report.context, ...context }
    } else {
      // 创建新报告
      report = {
        id: this.generateId(),
        timestamp: now,
        message: errorInfo.message,
        stack: errorInfo.stack,
        context,
        fingerprint,
        count: 1,
        firstOccurrence: now,
        lastOccurrence: now,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        additionalData: errorInfo.additionalData
      }

      this.errorReports.set(fingerprint, report)

      // 保持报告数量在限制内
      if (this.errorReports.size > this.maxReports) {
        const oldestKey = this.errorReports.keys().next().value
        if (oldestKey) {
          this.errorReports.delete(oldestKey)
        }
      }
    }

    // 通知监听器
    this.notifyListeners(report)

    return report
  }

  private extractErrorInfo(error: any): {
    message: string
    stack?: string
    additionalData?: any
  } {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        additionalData: {
          name: error.name,
          ...(error as any) // 获取额外属性
        }
      }
    }

    if (typeof error === 'string') {
      return { message: error }
    }

    if (typeof error === 'object' && error !== null) {
      return {
        message: error.message || 'Unknown object error',
        additionalData: error
      }
    }

    return {
      message: String(error),
      additionalData: { originalValue: error }
    }
  }

  private generateFingerprint(errorInfo: any, context?: LogContext): string {
    const parts = [
      errorInfo.message,
      context?.module,
      context?.function
    ].filter(Boolean)

    // 使用简单的哈希算法
    return this.simpleHash(parts.join('|'))
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(16)
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private notifyListeners(report: ErrorReport): void {
    this.listeners.forEach(listener => {
      try {
        listener(report)
      } catch (error) {
        console.error('Error in error tracker listener:', error)
      }
    })
  }

  onError(listener: (report: ErrorReport) => void): () => void {
    this.listeners.push(listener)

    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  getReports(options?: {
    since?: number
    limit?: number
    minCount?: number
  }): ErrorReport[] {
    let reports = Array.from(this.errorReports.values())

    if (options?.since) {
      reports = reports.filter(r => r.lastOccurrence >= options.since!)
    }

    if (options?.minCount) {
      reports = reports.filter(r => r.count >= options.minCount!)
    }

    // 按最后发生时间排序
    reports.sort((a, b) => b.lastOccurrence - a.lastOccurrence)

    if (options?.limit) {
      reports = reports.slice(0, options.limit)
    }

    return reports
  }

  clearReports(): void {
    this.errorReports.clear()
  }

  exportReports(): string {
    return JSON.stringify(Array.from(this.errorReports.values()), null, 2)
  }
}

// 增强的日志记录器配置
export interface EnhancedLoggerConfig {
  minLevel?: LogLevel
  context?: LogContext
  autoAddConsoleHandler?: boolean
}

// 增强的日志记录器
export class EnhancedLogger {
  private handlers: LogHandler[] = []
  private context: LogContext = {}
  private errorTracker = new ErrorTracker()
  private minLevel: LogLevel = LogLevel.INFO

  constructor(config: EnhancedLoggerConfig = {}) {
    this.minLevel = config.minLevel ?? LogLevel.INFO
    this.context = config.context ?? {}

    // 默认添加控制台处理器
    if (config.autoAddConsoleHandler !== false) {
      this.addHandler(new ConsoleLogHandler(this.minLevel))
    }
  }

  addHandler(handler: LogHandler): this {
    this.handlers.push(handler)
    return this
  }

  removeHandler(handlerName: string): this {
    this.handlers = this.handlers.filter(h => h.getName() !== handlerName)
    return this
  }

  setContext(context: Partial<LogContext>): this {
    this.context = { ...this.context, ...context }
    return this
  }

  setMinLevel(level: LogLevel): this {
    this.minLevel = level
    return this
  }

  getMinLevel(): LogLevel {
    return this.minLevel
  }

  createChild(context: Partial<LogContext>): EnhancedLogger {
    const child = new EnhancedLogger({ minLevel: this.minLevel, context: this.context, autoAddConsoleHandler: false })
    child.handlers = [...this.handlers]
    child.context = { ...this.context, ...context }
    child.errorTracker = this.errorTracker
    return child
  }

  public log(level: LogLevel, message: string, data?: any, additionalContext?: LogContext): void {
    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      message,
      data,
      context: { ...this.context, ...additionalContext },
      stack: level >= LogLevel.ERROR ? this.captureStackTrace() : undefined
    }

    // 为错误级别生成指纹
    if (level >= LogLevel.ERROR) {
      entry.fingerprint = this.generateErrorFingerprint(message, entry.context)
    }

    // 将条目传递给所有处理器
    this.handlers.forEach(handler => {
      try {
        handler.handle(entry)
      } catch (error) {
        console.error(`Error in log handler ${handler.getName()}:`, error)
      }
    })

    // 如果是错误级别，同时发送给错误追踪器
    if (level >= LogLevel.ERROR) {
      this.errorTracker.captureError(
        new Error(message),
        entry.context
      )
    }
  }

  trace(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.TRACE, message, data, context)
  }

  debug(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, data, context)
  }

  info(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.INFO, message, data, context)
  }

  warn(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.WARN, message, data, context)
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    let errorData = error
    let stackTrace: string | undefined = this.captureStackTrace()

    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
      stackTrace = error.stack || this.captureStackTrace()
    }

    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      message,
      data: errorData,
      context: { ...this.context, ...context },
      stack: stackTrace,
      fingerprint: this.generateErrorFingerprint(message, { ...this.context, ...context })
    }

    this.handlers.forEach(handler => {
      try {
        handler.handle(entry)
      } catch (handlerError) {
        console.error(`Error in log handler ${handler.getName()}:`, handlerError)
      }
    })

    // 发送给错误追踪器
    this.errorTracker.captureError(error || new Error(message), entry.context)
  }

  fatal(message: string, error?: Error | any, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, error, context)

    // 对于致命错误，发送给错误追踪器
    this.errorTracker.captureError(error || new Error(message), { ...this.context, ...context })
  }

  // 性能日志
  time(label: string, context?: LogContext): () => void {
    const startTime = Date.now()
    this.debug(`Timer started: ${label}`, undefined, context)

    return () => {
      const duration = Date.now() - startTime
      this.info(`Timer ended: ${label}`, { duration }, context)
    }
  }

  // 异步操作包装
  async withLogging<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const timer = this.time(`async:${operation}`, context)

    try {
      this.debug(`Starting async operation: ${operation}`, undefined, context)
      const result = await fn()
      this.debug(`Completed async operation: ${operation}`, undefined, context)
      return result
    } catch (error) {
      this.error(`Failed async operation: ${operation}`, error, context)
      throw error
    } finally {
      timer()
    }
  }

  // 获取错误追踪器
  getErrorTracker(): ErrorTracker {
    return this.errorTracker
  }

  // 获取内存处理器的日志
  getMemoryLogs(): LogEntry[] {
    const memoryHandler = this.handlers.find(h => h instanceof MemoryLogHandler) as MemoryLogHandler
    return memoryHandler ? memoryHandler.getLogs() : []
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private captureStackTrace(): string {
    const stack = new Error('Stack trace').stack
    if (!stack) return ''

    // 移除与日志系统相关的栈帧
    const lines = stack.split('\n')
    const relevantLines = lines.slice(3) // 跳过 Error、captureStackTrace、log 方法
    return relevantLines.join('\n')
  }

  private generateErrorFingerprint(message: string, context?: LogContext): string {
    const parts = [
      message,
      context?.module,
      context?.function
    ].filter(Boolean)

    return this.simpleHash(parts.join('|'))
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  destroy(): void {
    this.handlers.forEach(handler => {
      if (handler.destroy) {
        handler.destroy()
      }
    })
    this.handlers = []
  }
}

// 全局日志记录器实例
export const logger = new EnhancedLogger()

// 便捷的模块日志记录器创建函数
export function createModuleLogger(moduleName: string): EnhancedLogger {
  return logger.createChild({ module: moduleName })
}

// 日志装饰器
export function logMethod(level: LogLevel = LogLevel.DEBUG, includeArgs = false) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const className = target.constructor.name

    descriptor.value = function (...args: any[]) {
      const methodLogger = logger.createChild({
        module: className,
        function: propertyKey
      })

      const logData = includeArgs ? { arguments: args } : undefined
      methodLogger.log(level, `Method ${propertyKey} called`, logData)

      try {
        const result = originalMethod.apply(this, args)

        if (result && typeof result.then === 'function') {
          // 异步方法
          return result.then(
            (value: any) => {
              methodLogger.log(level, `Method ${propertyKey} completed successfully`)
              return value
            },
            (error: any) => {
              methodLogger.error(`Method ${propertyKey} failed`, error)
              throw error
            }
          )
        } else {
          // 同步方法
          methodLogger.log(level, `Method ${propertyKey} completed successfully`)
          return result
        }
      } catch (error) {
        methodLogger.error(`Method ${propertyKey} failed`, error)
        throw error
      }
    }

    return descriptor
  }
}

// 性能监控装饰器
export function logPerformance(threshold = 1000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const className = target.constructor.name

    descriptor.value = function (...args: any[]) {
      const methodLogger = logger.createChild({
        module: className,
        function: propertyKey
      })

      const startTime = Date.now()

      try {
        const result = originalMethod.apply(this, args)

        if (result && typeof result.then === 'function') {
          // 异步方法
          return result.finally(() => {
            const duration = Date.now() - startTime
            if (duration > threshold) {
              methodLogger.warn(`Slow method ${propertyKey}`, { duration, threshold })
            } else {
              methodLogger.debug(`Method ${propertyKey} performance`, { duration })
            }
          })
        } else {
          // 同步方法
          const duration = Date.now() - startTime
          if (duration > threshold) {
            methodLogger.warn(`Slow method ${propertyKey}`, { duration, threshold })
          } else {
            methodLogger.debug(`Method ${propertyKey} performance`, { duration })
          }
          return result
        }
      } catch (error) {
        const duration = Date.now() - startTime
        methodLogger.error(`Method ${propertyKey} failed after ${duration}ms`, error)
        throw error
      }
    }

    return descriptor
  }
}
