/**
 * 错误处理工具类
 * 提供统一的错误处理机制和错误码系统
 * 
 * @example
 * ```typescript
 * import { ErrorUtils, AppError, ErrorCode } from '@ldesign/kit'
 * 
 * // 创建应用错误
 * throw new AppError('User not found', ErrorCode.NOT_FOUND, { userId: 123 })
 * 
 * // 错误处理
 * try {
 *   // some code
 * } catch (error) {
 *   const handled = ErrorUtils.handle(error)
 *   console.error(handled.message)
 * }
 * ```
 */

/**
 * 错误码枚举
 */
export enum ErrorCode {
  // 通用错误 (1xxx)
  UNKNOWN = 1000,
  INTERNAL_ERROR = 1001,
  NOT_IMPLEMENTED = 1002,
  DEPRECATED = 1003,

  // 验证错误 (2xxx)
  VALIDATION_ERROR = 2000,
  INVALID_INPUT = 2001,
  INVALID_FORMAT = 2002,
  MISSING_REQUIRED_FIELD = 2003,
  OUT_OF_RANGE = 2004,

  // 认证/授权错误 (3xxx)
  UNAUTHORIZED = 3000,
  AUTHENTICATION_FAILED = 3001,
  INVALID_TOKEN = 3002,
  TOKEN_EXPIRED = 3003,
  INSUFFICIENT_PERMISSIONS = 3004,

  // 资源错误 (4xxx)
  NOT_FOUND = 4000,
  RESOURCE_NOT_FOUND = 4001,
  ALREADY_EXISTS = 4002,
  CONFLICT = 4003,
  GONE = 4004,

  // 网络错误 (5xxx)
  NETWORK_ERROR = 5000,
  CONNECTION_FAILED = 5001,
  TIMEOUT = 5002,
  REQUEST_FAILED = 5003,
  RESPONSE_ERROR = 5004,

  // 文件系统错误 (6xxx)
  FILE_ERROR = 6000,
  FILE_NOT_FOUND = 6001,
  FILE_ALREADY_EXISTS = 6002,
  PERMISSION_DENIED = 6003,
  DISK_FULL = 6004,
  READ_ERROR = 6005,
  WRITE_ERROR = 6006,

  // 数据库错误 (7xxx)
  DATABASE_ERROR = 7000,
  CONNECTION_ERROR = 7001,
  QUERY_ERROR = 7002,
  TRANSACTION_ERROR = 7003,
  DUPLICATE_ENTRY = 7004,

  // 业务逻辑错误 (8xxx)
  BUSINESS_ERROR = 8000,
  INVALID_OPERATION = 8001,
  STATE_ERROR = 8002,
  QUOTA_EXCEEDED = 8003,

  // 配置错误 (9xxx)
  CONFIG_ERROR = 9000,
  INVALID_CONFIG = 9001,
  MISSING_CONFIG = 9002,
}

/**
 * 错误级别
 */
export enum ErrorLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * 错误元数据
 */
export interface ErrorMetadata {
  [key: string]: any
}

/**
 * 应用错误类
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly level: ErrorLevel
  public readonly metadata?: ErrorMetadata
  public readonly timestamp: Date
  public override readonly stack?: string

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    metadata?: ErrorMetadata,
    level: ErrorLevel = ErrorLevel.ERROR,
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.level = level
    this.metadata = metadata
    this.timestamp = new Date()

    // 捕获堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  /**
   * 转换为 JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      level: this.level,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    }
  }

  /**
   * 转换为字符串
   */
  override toString(): string {
    const parts = [
      `[${this.level.toUpperCase()}]`,
      `${this.name}:`,
      this.message,
      `(Code: ${this.code})`,
    ]

    if (this.metadata) {
      parts.push(`Metadata: ${JSON.stringify(this.metadata)}`)
    }

    return parts.join(' ')
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, ErrorCode.VALIDATION_ERROR, metadata, ErrorLevel.WARNING)
    this.name = 'ValidationError'
  }
}

/**
 * 未找到错误类
 */
export class NotFoundError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, ErrorCode.NOT_FOUND, metadata, ErrorLevel.INFO)
    this.name = 'NotFoundError'
  }
}

/**
 * 未授权错误类
 */
export class UnauthorizedError extends AppError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(message, ErrorCode.UNAUTHORIZED, metadata, ErrorLevel.WARNING)
    this.name = 'UnauthorizedError'
  }
}

/**
 * 文件系统错误类
 */
export class FileSystemError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.FILE_ERROR, metadata?: ErrorMetadata) {
    super(message, code, metadata, ErrorLevel.ERROR)
    this.name = 'FileSystemError'
  }
}

/**
 * 网络错误类
 */
export class NetworkError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.NETWORK_ERROR, metadata?: ErrorMetadata) {
    super(message, code, metadata, ErrorLevel.ERROR)
    this.name = 'NetworkError'
  }
}

/**
 * 数据库错误类
 */
export class DatabaseError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.DATABASE_ERROR, metadata?: ErrorMetadata) {
    super(message, code, metadata, ErrorLevel.ERROR)
    this.name = 'DatabaseError'
  }
}

/**
 * 业务逻辑错误类
 */
export class BusinessError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.BUSINESS_ERROR, metadata?: ErrorMetadata) {
    super(message, code, metadata, ErrorLevel.WARNING)
    this.name = 'BusinessError'
  }
}

/**
 * 错误处理器接口
 */
export interface ErrorHandler {
  (error: Error): void | Promise<void>
}

/**
 * 错误过滤器接口
 */
export interface ErrorFilter {
  (error: Error): boolean
}

/**
 * 错误工具类
 */
export class ErrorUtils {
  private static handlers: ErrorHandler[] = []
  private static filters: ErrorFilter[] = []

  /**
   * 注册错误处理器
   */
  static registerHandler(handler: ErrorHandler): void {
    ErrorUtils.handlers.push(handler)
  }

  /**
   * 注册错误过滤器
   */
  static registerFilter(filter: ErrorFilter): void {
    ErrorUtils.filters.push(filter)
  }

  /**
   * 清除所有处理器和过滤器
   */
  static clear(): void {
    ErrorUtils.handlers = []
    ErrorUtils.filters = []
  }

  /**
   * 处理错误
   */
  static async handle(error: unknown): Promise<AppError> {
    // 转换为 AppError
    const appError = ErrorUtils.normalize(error)

    // 应用过滤器
    const shouldHandle = ErrorUtils.filters.every(filter => filter(appError))

    if (shouldHandle) {
      // 执行所有处理器
      for (const handler of ErrorUtils.handlers) {
        try {
          await handler(appError)
        }
        catch (handlerError) {
          console.error('Error handler failed:', handlerError)
        }
      }
    }

    return appError
  }

  /**
   * 规范化错误
   */
  static normalize(error: unknown): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        ErrorCode.UNKNOWN,
        {
          originalName: error.name,
          originalStack: error.stack,
        },
      )
    }

    if (typeof error === 'string') {
      return new AppError(error)
    }

    if (typeof error === 'object' && error !== null) {
      return new AppError(
        JSON.stringify(error),
        ErrorCode.UNKNOWN,
        { originalError: error },
      )
    }

    return new AppError('Unknown error', ErrorCode.UNKNOWN, { error })
  }

  /**
   * 包装异步函数，自动处理错误
   */
  static wrap<T extends (...args: any[]) => Promise<any>>(
    fn: T,
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        return await fn(...args)
      }
      catch (error) {
        await ErrorUtils.handle(error)
        throw error
      }
    }
  }

  /**
   * 安全执行函数，捕获错误
   */
  static async safe<T>(
    fn: () => T | Promise<T>,
  ): Promise<{ success: true; value: T } | { success: false; error: AppError }> {
    try {
      const value = await fn()
      return { success: true, value }
    }
    catch (error) {
      const appError = await ErrorUtils.handle(error)
      return { success: false, error: appError }
    }
  }

  /**
   * 重试函数执行
   */
  static async retry<T>(
    fn: () => T | Promise<T>,
    options: {
      maxAttempts?: number
      delay?: number
      backoff?: boolean
      onRetry?: (error: Error, attempt: number) => void
    } = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = true,
      onRetry,
    } = options

    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      }
      catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < maxAttempts) {
          if (onRetry) {
            onRetry(lastError, attempt)
          }

          const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }

    throw lastError || new Error('Retry failed')
  }

  /**
   * 获取错误消息
   */
  static getMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }

    if (typeof error === 'string') {
      return error
    }

    return 'Unknown error'
  }

  /**
   * 获取错误堆栈
   */
  static getStack(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack
    }

    return undefined
  }

  /**
   * 检查是否为特定错误类型
   */
  static is<T extends Error>(error: unknown, ErrorClass: new (...args: any[]) => T): error is T {
    return error instanceof ErrorClass
  }

  /**
   * 检查是否为特定错误码
   */
  static hasCode(error: unknown, code: ErrorCode): boolean {
    return error instanceof AppError && error.code === code
  }

  /**
   * 格式化错误
   */
  static format(error: unknown): string {
    if (error instanceof AppError) {
      return error.toString()
    }

    if (error instanceof Error) {
      return `${error.name}: ${error.message}`
    }

    return String(error)
  }

  /**
   * 创建错误链
   */
  static chain(message: string, cause: Error, code?: ErrorCode): AppError {
    return new AppError(
      message,
      code || ErrorCode.UNKNOWN,
      { cause: cause.message, causeStack: cause.stack },
    )
  }

  /**
   * 聚合多个错误
   */
  static aggregate(errors: Error[], message?: string): AppError {
    return new AppError(
      message || 'Multiple errors occurred',
      ErrorCode.UNKNOWN,
      {
        errors: errors.map(e => ({
          name: e.name,
          message: e.message,
          stack: e.stack,
        })),
        count: errors.length,
      },
    )
  }

  /**
   * 断言条件，失败时抛出错误
   */
  static assert(condition: boolean, message: string, code?: ErrorCode): asserts condition {
    if (!condition) {
      throw new AppError(message, code || ErrorCode.VALIDATION_ERROR)
    }
  }

  /**
   * 断言值不为 null/undefined
   */
  static assertDefined<T>(
    value: T,
    message?: string,
    code?: ErrorCode,
  ): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
      throw new AppError(
        message || 'Value is null or undefined',
        code || ErrorCode.VALIDATION_ERROR,
      )
    }
  }

  /**
   * 创建不应该到达的错误（用于 switch 等）
   */
  static unreachable(value?: never): never {
    throw new AppError(
      `Unreachable code reached: ${value}`,
      ErrorCode.INTERNAL_ERROR,
    )
  }

  /**
   * 创建未实现错误
   */
  static notImplemented(feature?: string): never {
    throw new AppError(
      feature ? `${feature} is not implemented` : 'Not implemented',
      ErrorCode.NOT_IMPLEMENTED,
    )
  }

  /**
   * 创建已废弃错误
   */
  static deprecated(feature: string, alternative?: string): void {
    const message = alternative
      ? `${feature} is deprecated. Use ${alternative} instead.`
      : `${feature} is deprecated.`

    console.warn(message)
  }
}

/**
 * 错误边界装饰器（用于类方法）
 */
export function errorBoundary(
  handler?: (error: Error) => void,
): MethodDecorator {
  return function (
    _target: any,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args)
      }
      catch (error) {
        if (handler) {
          handler(error as Error)
        }
        else {
          await ErrorUtils.handle(error)
        }
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 重试装饰器
 */
export function retry(options?: {
  maxAttempts?: number
  delay?: number
  backoff?: boolean
}): MethodDecorator {
  return function (
    _target: any,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      return await ErrorUtils.retry(
        () => originalMethod.apply(this, args),
        options,
      )
    }

    return descriptor
  }
}



