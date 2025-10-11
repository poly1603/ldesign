/**
 * 统一错误处理系统
 * 
 * 提供标准化的错误类型、错误处理和错误恢复机制
 */

/**
 * 错误代码枚举
 */
export enum ErrorCode {
  // 模板相关错误 (1000-1999)
  TEMPLATE_NOT_FOUND = 1000,
  TEMPLATE_LOAD_FAILED = 1001,
  TEMPLATE_INVALID = 1002,
  TEMPLATE_PARSE_ERROR = 1003,
  TEMPLATE_TIMEOUT = 1004,

  // 设备检测错误 (2000-2999)
  DEVICE_DETECTION_FAILED = 2000,
  DEVICE_UNSUPPORTED = 2001,

  // 缓存错误 (3000-3999)
  CACHE_READ_ERROR = 3000,
  CACHE_WRITE_ERROR = 3001,
  CACHE_FULL = 3002,
  CACHE_CORRUPTED = 3003,

  // 加载器错误 (4000-4999)
  LOADER_TIMEOUT = 4000,
  LOADER_NETWORK_ERROR = 4001,
  LOADER_PARSE_ERROR = 4002,
  LOADER_RETRY_EXHAUSTED = 4003,

  // 配置错误 (5000-5999)
  CONFIG_INVALID = 5000,
  CONFIG_MISSING = 5001,

  // 运行时错误 (6000-6999)
  RUNTIME_ERROR = 6000,
  INITIALIZATION_ERROR = 6001,
  COMPONENT_RENDER_ERROR = 6002,

  // 安全错误 (7000-7999)
  SECURITY_VIOLATION = 7000,
  XSS_ATTEMPT = 7001,
  INVALID_PATH = 7002,

  // 未知错误
  UNKNOWN = 9999,
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * 错误上下文
 */
export interface ErrorContext {
  /** 组件名称 */
  component?: string
  /** 模板信息 */
  template?: {
    category?: string
    device?: string
    name?: string
  }
  /** 用户操作 */
  action?: string
  /** 额外数据 */
  metadata?: Record<string, unknown>
  /** 时间戳 */
  timestamp: number
  /** 堆栈追踪 */
  stack?: string
}

/**
 * 基础模板错误类
 */
export class TemplateError extends Error {
  public readonly code: ErrorCode
  public readonly severity: ErrorSeverity
  public readonly context: ErrorContext
  public readonly recoverable: boolean
  public readonly originalError?: Error

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    options: {
      severity?: ErrorSeverity
      context?: Partial<ErrorContext>
      recoverable?: boolean
      cause?: Error
    } = {}
  ) {
    super(message)
    this.name = 'TemplateError'
    this.code = code
    this.severity = options.severity || this.inferSeverity(code)
    this.recoverable = options.recoverable ?? this.inferRecoverable(code)
    this.originalError = options.cause
    this.context = {
      timestamp: Date.now(),
      stack: this.stack,
      ...options.context,
    }

    // 维护正确的原型链
    Object.setPrototypeOf(this, TemplateError.prototype)
  }

  /**
   * 根据错误代码推断严重级别
   */
  private inferSeverity(code: ErrorCode): ErrorSeverity {
    if (code >= 7000 && code < 8000) return ErrorSeverity.CRITICAL
    if (code >= 6000 && code < 7000) return ErrorSeverity.HIGH
    if (code >= 4000 && code < 5000) return ErrorSeverity.MEDIUM
    return ErrorSeverity.LOW
  }

  /**
   * 根据错误代码推断是否可恢复
   */
  private inferRecoverable(code: ErrorCode): boolean {
    const unrecoverableCodes = [
      ErrorCode.SECURITY_VIOLATION,
      ErrorCode.XSS_ATTEMPT,
      ErrorCode.CONFIG_INVALID,
      ErrorCode.TEMPLATE_INVALID,
    ]
    return !unrecoverableCodes.includes(code)
  }

  /**
   * 转换为普通对象（用于日志）
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      recoverable: this.recoverable,
      context: this.context,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    }
  }
}

/**
 * 模板加载错误
 */
export class TemplateLoadError extends TemplateError {
  constructor(
    message: string,
    templateInfo: { category: string; device: string; name: string },
    cause?: Error
  ) {
    super(message, ErrorCode.TEMPLATE_LOAD_FAILED, {
      severity: ErrorSeverity.HIGH,
      context: {
        template: templateInfo,
      },
      recoverable: true,
      cause,
    })
    this.name = 'TemplateLoadError'
    Object.setPrototypeOf(this, TemplateLoadError.prototype)
  }
}

/**
 * 模板超时错误
 */
export class TemplateTimeoutError extends TemplateError {
  constructor(message: string, timeout: number, templateName?: string) {
    super(message, ErrorCode.TEMPLATE_TIMEOUT, {
      severity: ErrorSeverity.MEDIUM,
      context: {
        metadata: { timeout, templateName },
      },
      recoverable: true,
    })
    this.name = 'TemplateTimeoutError'
    Object.setPrototypeOf(this, TemplateTimeoutError.prototype)
  }
}

/**
 * 缓存错误
 */
export class CacheError extends TemplateError {
  constructor(message: string, code: ErrorCode, cause?: Error) {
    super(message, code, {
      severity: ErrorSeverity.LOW,
      recoverable: true,
      cause,
    })
    this.name = 'CacheError'
    Object.setPrototypeOf(this, CacheError.prototype)
  }
}

/**
 * 设备检测错误
 */
export class DeviceDetectionError extends TemplateError {
  constructor(message: string, cause?: Error) {
    super(message, ErrorCode.DEVICE_DETECTION_FAILED, {
      severity: ErrorSeverity.MEDIUM,
      recoverable: true,
      cause,
    })
    this.name = 'DeviceDetectionError'
    Object.setPrototypeOf(this, DeviceDetectionError.prototype)
  }
}

/**
 * 安全错误
 */
export class SecurityError extends TemplateError {
  constructor(message: string, code: ErrorCode = ErrorCode.SECURITY_VIOLATION) {
    super(message, code, {
      severity: ErrorSeverity.CRITICAL,
      recoverable: false,
    })
    this.name = 'SecurityError'
    Object.setPrototypeOf(this, SecurityError.prototype)
  }
}

/**
 * 错误处理器配置
 */
export interface ErrorHandlerConfig {
  /** 是否启用日志 */
  enableLogging?: boolean
  /** 是否上报错误 */
  enableReporting?: boolean
  /** 自定义错误上报函数 */
  reportFn?: (error: TemplateError) => void
  /** 自定义错误恢复函数 */
  recoveryFn?: (error: TemplateError) => Promise<void> | void
  /** 是否在开发环境显示详细错误 */
  verboseInDev?: boolean
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  private config: Required<ErrorHandlerConfig>
  private errorHistory: TemplateError[] = []
  private maxHistorySize = 100

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: false,
      reportFn: () => {},
      recoveryFn: async () => {},
      verboseInDev: true,
      ...config,
    }
  }

  /**
   * 处理错误
   */
  async handle(error: Error | TemplateError): Promise<void> {
    const templateError = this.normalizeError(error)

    // 添加到历史记录
    this.addToHistory(templateError)

    // 日志记录
    if (this.config.enableLogging) {
      this.log(templateError)
    }

    // 错误上报
    if (this.config.enableReporting) {
      try {
        this.config.reportFn(templateError)
      } catch (reportError) {
        console.error('Error reporting failed:', reportError)
      }
    }

    // 尝试恢复
    if (templateError.recoverable) {
      try {
        await this.config.recoveryFn(templateError)
      } catch (recoveryError) {
        console.error('Error recovery failed:', recoveryError)
      }
    }
  }

  /**
   * 规范化错误对象
   */
  private normalizeError(error: Error | TemplateError): TemplateError {
    if (error instanceof TemplateError) {
      return error
    }

    return new TemplateError(
      error.message || 'Unknown error',
      ErrorCode.RUNTIME_ERROR,
      {
        cause: error,
        context: {
          stack: error.stack,
        },
      }
    )
  }

  /**
   * 记录错误日志
   */
  private log(error: TemplateError): void {
    const isDev = process.env.NODE_ENV === 'development'
    const shouldShowDetails = isDev && this.config.verboseInDev

    const logMethod = this.getLogMethod(error.severity)
    const prefix = `[TemplateSystem][${error.severity.toUpperCase()}]`

    if (shouldShowDetails) {
      logMethod(`${prefix} ${error.message}`, {
        code: error.code,
        context: error.context,
        originalError: error.originalError,
      })
    } else {
      logMethod(`${prefix} ${error.message} (Code: ${error.code})`)
    }
  }

  /**
   * 获取日志方法
   */
  private getLogMethod(severity: ErrorSeverity): (...args: any[]) => void {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return console.error
      case ErrorSeverity.MEDIUM:
        return console.warn
      case ErrorSeverity.LOW:
      default:
        return console.info
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(error: TemplateError): void {
    this.errorHistory.push(error)

    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift()
    }
  }

  /**
   * 获取错误历史
   */
  getHistory(filter?: {
    severity?: ErrorSeverity
    code?: ErrorCode
    limit?: number
  }): TemplateError[] {
    let history = [...this.errorHistory]

    if (filter?.severity) {
      history = history.filter((e) => e.severity === filter.severity)
    }

    if (filter?.code) {
      history = history.filter((e) => e.code === filter.code)
    }

    if (filter?.limit) {
      history = history.slice(-filter.limit)
    }

    return history
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.errorHistory = []
  }

  /**
   * 获取错误统计
   */
  getStats() {
    const stats: Record<string, number> = {}
    const severityStats: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    }

    for (const error of this.errorHistory) {
      stats[error.code] = (stats[error.code] || 0) + 1
      severityStats[error.severity]++
    }

    return {
      total: this.errorHistory.length,
      byCode: stats,
      bySeverity: severityStats,
      recoverable: this.errorHistory.filter((e) => e.recoverable).length,
      unrecoverable: this.errorHistory.filter((e) => !e.recoverable).length,
    }
  }
}

/**
 * 全局错误处理器实例
 */
export const globalErrorHandler = new ErrorHandler({
  enableLogging: true,
  enableReporting: false,
  verboseInDev: true,
})

/**
 * 包装异步函数以捕获错误
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler: ErrorHandler = globalErrorHandler
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      await errorHandler.handle(error as Error)
      throw error
    }
  }) as T
}

/**
 * 创建错误处理装饰器
 */
export function HandleErrors(errorHandler: ErrorHandler = globalErrorHandler) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        await errorHandler.handle(error as Error)
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 错误边界辅助函数
 */
export function createErrorBoundary(options: {
  fallback?: any
  onError?: (error: TemplateError) => void
  errorHandler?: ErrorHandler
}) {
  const handler = options.errorHandler || globalErrorHandler

  return {
    async execute<T>(fn: () => Promise<T> | T): Promise<T | typeof options.fallback> {
      try {
        return await fn()
      } catch (error) {
        await handler.handle(error as Error)
        
        if (options.onError) {
          const templateError = error instanceof TemplateError 
            ? error 
            : new TemplateError((error as Error).message)
          options.onError(templateError)
        }

        if (options.fallback !== undefined) {
          return options.fallback
        }

        throw error
      }
    },
  }
}

/**
 * 安全执行函数
 */
export async function safeExecute<T>(
  fn: () => Promise<T> | T,
  options: {
    fallback?: T
    onError?: (error: Error) => void
    silent?: boolean
  } = {}
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    if (options.onError) {
      options.onError(error as Error)
    }

    if (!options.silent) {
      await globalErrorHandler.handle(error as Error)
    }

    return options.fallback
  }
}
