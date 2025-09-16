/**
 * 错误处理和验证工具
 */

import type { CalendarEvent, DateInput } from '../types'
import dayjs from 'dayjs'

/**
 * 自定义错误类型
 */
export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_DATE = 'INVALID_DATE',
  INVALID_EVENT = 'INVALID_EVENT',
  INVALID_CONFIG = 'INVALID_CONFIG',
  OPERATION_FAILED = 'OPERATION_FAILED',
  RENDER_ERROR = 'RENDER_ERROR',
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  TIMEOUT = 'TIMEOUT'
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 自定义日历错误类
 */
export class CalendarError extends Error {
  public readonly code: ErrorCode
  public readonly severity: ErrorSeverity
  public readonly timestamp: Date
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.OPERATION_FAILED,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'CalendarError'
    this.code = code
    this.severity = severity
    this.timestamp = new Date()
    this.context = context

    // 保持原型链
    Object.setPrototypeOf(this, CalendarError.prototype)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    }
  }
}

/**
 * 验证器类
 */
export class Validator {
  /**
   * 验证必填字段
   */
  static required<T>(value: T | null | undefined, fieldName: string): T {
    if (value === null || value === undefined) {
      throw new CalendarError(
        `Field "${fieldName}" is required`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.HIGH
      )
    }
    return value
  }

  /**
   * 验证字符串
   */
  static string(value: any, fieldName: string, options?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    allowEmpty?: boolean
  }): string {
    if (typeof value !== 'string') {
      throw new CalendarError(
        `Field "${fieldName}" must be a string`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.HIGH
      )
    }

    if (!options?.allowEmpty && value.trim().length === 0) {
      throw new CalendarError(
        `Field "${fieldName}" cannot be empty`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.HIGH
      )
    }

    if (options?.minLength && value.length < options.minLength) {
      throw new CalendarError(
        `Field "${fieldName}" must be at least ${options.minLength} characters`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    if (options?.maxLength && value.length > options.maxLength) {
      throw new CalendarError(
        `Field "${fieldName}" must be at most ${options.maxLength} characters`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    if (options?.pattern && !options.pattern.test(value)) {
      throw new CalendarError(
        `Field "${fieldName}" format is invalid`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    return value
  }

  /**
   * 验证数字
   */
  static number(value: any, fieldName: string, options?: {
    min?: number
    max?: number
    integer?: boolean
    positive?: boolean
  }): number {
    const num = Number(value)
    
    if (isNaN(num)) {
      throw new CalendarError(
        `Field "${fieldName}" must be a number`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.HIGH
      )
    }

    if (options?.integer && !Number.isInteger(num)) {
      throw new CalendarError(
        `Field "${fieldName}" must be an integer`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    if (options?.positive && num <= 0) {
      throw new CalendarError(
        `Field "${fieldName}" must be positive`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    if (options?.min !== undefined && num < options.min) {
      throw new CalendarError(
        `Field "${fieldName}" must be at least ${options.min}`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    if (options?.max !== undefined && num > options.max) {
      throw new CalendarError(
        `Field "${fieldName}" must be at most ${options.max}`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    return num
  }

  /**
   * 验证日期
   */
  static date(value: DateInput, fieldName: string, options?: {
    minDate?: DateInput
    maxDate?: DateInput
    allowPast?: boolean
    allowFuture?: boolean
  }): Date {
    const date = dayjs(value)
    
    if (!date.isValid()) {
      throw new CalendarError(
        `Field "${fieldName}" must be a valid date`,
        ErrorCode.INVALID_DATE,
        ErrorSeverity.HIGH
      )
    }

    const now = dayjs()
    
    if (options?.allowPast === false && date.isBefore(now, 'day')) {
      throw new CalendarError(
        `Field "${fieldName}" cannot be in the past`,
        ErrorCode.INVALID_DATE,
        ErrorSeverity.MEDIUM
      )
    }

    if (options?.allowFuture === false && date.isAfter(now, 'day')) {
      throw new CalendarError(
        `Field "${fieldName}" cannot be in the future`,
        ErrorCode.INVALID_DATE,
        ErrorSeverity.MEDIUM
      )
    }

    if (options?.minDate && date.isBefore(dayjs(options.minDate))) {
      throw new CalendarError(
        `Field "${fieldName}" must be after ${dayjs(options.minDate).format('YYYY-MM-DD')}`,
        ErrorCode.INVALID_DATE,
        ErrorSeverity.MEDIUM
      )
    }

    if (options?.maxDate && date.isAfter(dayjs(options.maxDate))) {
      throw new CalendarError(
        `Field "${fieldName}" must be before ${dayjs(options.maxDate).format('YYYY-MM-DD')}`,
        ErrorCode.INVALID_DATE,
        ErrorSeverity.MEDIUM
      )
    }

    return date.toDate()
  }

  /**
   * 验证事件
   */
  static event(event: Partial<CalendarEvent>): CalendarEvent {
    // 验证必填字段
    const title = Validator.string(
      Validator.required(event.title, 'event.title'),
      'event.title',
      { minLength: 1, maxLength: 200 }
    )

    const start = Validator.date(
      Validator.required(event.start, 'event.start'),
      'event.start'
    )

    // 验证可选字段
    let end: Date | undefined
    if (event.end !== undefined) {
      end = Validator.date(event.end, 'event.end')
      
      if (dayjs(end).isBefore(dayjs(start))) {
        throw new CalendarError(
          'Event end date must be after start date',
          ErrorCode.INVALID_EVENT,
          ErrorSeverity.HIGH
        )
      }
    }

    // 验证描述
    let description: string | undefined
    if (event.description !== undefined) {
      description = Validator.string(
        event.description,
        'event.description',
        { maxLength: 1000, allowEmpty: true }
      )
    }

    // 验证颜色
    let color: string | undefined
    if (event.color !== undefined) {
      color = Validator.string(
        event.color,
        'event.color',
        { pattern: /^#[0-9A-Fa-f]{6}$/ }
      )
    }

    return {
      ...event,
      id: event.id || generateId(),
      title,
      start,
      end,
      description,
      color,
      allDay: event.allDay ?? false,
      editable: event.editable ?? true,
      draggable: event.draggable ?? true,
      resizable: event.resizable ?? true
    } as CalendarEvent
  }

  /**
   * 验证邮箱
   */
  static email(value: string, fieldName: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(value)) {
      throw new CalendarError(
        `Field "${fieldName}" must be a valid email`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    return value
  }

  /**
   * 验证URL
   */
  static url(value: string, fieldName: string): string {
    try {
      new URL(value)
      return value
    } catch {
      throw new CalendarError(
        `Field "${fieldName}" must be a valid URL`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }
  }

  /**
   * 验证数组
   */
  static array<T>(value: any, fieldName: string, options?: {
    minLength?: number
    maxLength?: number
    itemValidator?: (item: any, index: number) => T
  }): T[] {
    if (!Array.isArray(value)) {
      throw new CalendarError(
        `Field "${fieldName}" must be an array`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.HIGH
      )
    }

    if (options?.minLength && value.length < options.minLength) {
      throw new CalendarError(
        `Field "${fieldName}" must have at least ${options.minLength} items`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    if (options?.maxLength && value.length > options.maxLength) {
      throw new CalendarError(
        `Field "${fieldName}" must have at most ${options.maxLength} items`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    if (options?.itemValidator) {
      return value.map((item, index) => options.itemValidator!(item, index))
    }

    return value
  }

  /**
   * 验证枚举值
   */
  static enum<T extends string | number>(
    value: any,
    fieldName: string,
    validValues: readonly T[]
  ): T {
    if (!validValues.includes(value)) {
      throw new CalendarError(
        `Field "${fieldName}" must be one of: ${validValues.join(', ')}`,
        ErrorCode.INVALID_INPUT,
        ErrorSeverity.MEDIUM
      )
    }

    return value as T
  }
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  private static listeners: Map<ErrorCode, ((error: CalendarError) => void)[]> = new Map()
  private static globalHandler?: (error: CalendarError) => void
  private static errorLog: CalendarError[] = []
  private static maxLogSize = 100

  /**
   * 处理错误
   */
  static handle(error: any, context?: Record<string, any>): void {
    let calendarError: CalendarError

    if (error instanceof CalendarError) {
      calendarError = error
    } else if (error instanceof Error) {
      calendarError = new CalendarError(
        error.message,
        ErrorCode.OPERATION_FAILED,
        ErrorSeverity.HIGH,
        context
      )
    } else {
      calendarError = new CalendarError(
        String(error),
        ErrorCode.OPERATION_FAILED,
        ErrorSeverity.HIGH,
        context
      )
    }

    // 记录错误
    this.log(calendarError)

    // 调用特定错误处理器
    const handlers = this.listeners.get(calendarError.code) || []
    handlers.forEach(handler => {
      try {
        handler(calendarError)
      } catch (e) {
        // 防止处理器错误导致循环
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error in error handler:', e)
        }
      }
    })

    // 调用全局处理器
    if (this.globalHandler) {
      try {
        this.globalHandler(calendarError)
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error in global error handler:', e)
        }
      }
    }

    // 严重错误抛出
    if (calendarError.severity === ErrorSeverity.CRITICAL) {
      throw calendarError
    }
  }

  /**
   * 注册错误监听器
   */
  static on(code: ErrorCode, handler: (error: CalendarError) => void): void {
    if (!this.listeners.has(code)) {
      this.listeners.set(code, [])
    }
    this.listeners.get(code)!.push(handler)
  }

  /**
   * 移除错误监听器
   */
  static off(code: ErrorCode, handler?: (error: CalendarError) => void): void {
    if (!handler) {
      this.listeners.delete(code)
    } else {
      const handlers = this.listeners.get(code)
      if (handlers) {
        const index = handlers.indexOf(handler)
        if (index >= 0) {
          handlers.splice(index, 1)
        }
      }
    }
  }

  /**
   * 设置全局错误处理器
   */
  static setGlobalHandler(handler: (error: CalendarError) => void): void {
    this.globalHandler = handler
  }

  /**
   * 记录错误
   */
  private static log(error: CalendarError): void {
    this.errorLog.push(error)
    
    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }

    // 开发环境输出
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Calendar Error]', error.toJSON())
    }
  }

  /**
   * 获取错误日志
   */
  static getErrorLog(): CalendarError[] {
    return [...this.errorLog]
  }

  /**
   * 清除错误日志
   */
  static clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * 获取错误统计
   */
  static getErrorStats(): Record<ErrorCode, number> {
    const stats: Record<string, number> = {}
    
    this.errorLog.forEach(error => {
      stats[error.code] = (stats[error.code] || 0) + 1
    })

    return stats as Record<ErrorCode, number>
  }
}

/**
 * 安全执行函数
 */
export function safeExecute<T>(
  fn: () => T,
  fallback?: T,
  context?: Record<string, any>
): T | undefined {
  try {
    return fn()
  } catch (error) {
    ErrorHandler.handle(error, context)
    return fallback
  }
}

/**
 * 异步安全执行函数
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback?: T,
  context?: Record<string, any>
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    ErrorHandler.handle(error, context)
    return fallback
  }
}

/**
 * 重试机制
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: boolean
    onRetry?: (attempt: number, error: any) => void
  } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3
  const delay = options.delay ?? 1000
  const backoff = options.backoff ?? true

  let lastError: any
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (options.onRetry) {
        options.onRetry(attempt, error)
      }

      if (attempt < maxAttempts) {
        const waitTime = backoff ? delay * attempt : delay
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw new CalendarError(
    `Operation failed after ${maxAttempts} attempts`,
    ErrorCode.OPERATION_FAILED,
    ErrorSeverity.HIGH,
    { lastError, maxAttempts }
  )
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/**
 * XSS防护：清理HTML内容
 */
export function sanitizeHTML(html: string): string {
  // 创建临时元素
  const temp = document.createElement('div')
  temp.textContent = html
  return temp.innerHTML
}

/**
 * 输入清理
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // 移除尖括号
    .replace(/javascript:/gi, '') // 移除javascript协议
    .replace(/on\w+=/gi, '') // 移除事件处理器
    .trim()
}

/**
 * 防止SQL注入的参数化
 */
export function escapeSQL(value: string): string {
  return value
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x00/g, '\\x00')
    .replace(/\x1a/g, '\\x1a')
}

/**
 * 验证并清理文件名
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // 只允许字母数字和部分符号
    .replace(/^\.+/, '') // 移除开头的点
    .slice(0, 255) // 限制长度
}

export default {
  CalendarError,
  ErrorCode,
  ErrorSeverity,
  Validator,
  ErrorHandler,
  safeExecute,
  safeExecuteAsync,
  retry,
  sanitizeHTML,
  sanitizeInput,
  escapeSQL,
  sanitizeFilename
}