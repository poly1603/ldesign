/**
 * 颜色库错误处理模块
 * 
 * 提供统一的错误类型系统和错误处理工具
 */

/**
 * 错误代码枚举
 */
export enum ColorErrorCode {
  // 颜色相关错误 (1xxx)
  INVALID_COLOR_FORMAT = 'COLOR_1001',
  COLOR_CONVERSION_FAILED = 'COLOR_1002',
  COLOR_OUT_OF_RANGE = 'COLOR_1003',
  UNSUPPORTED_COLOR_SPACE = 'COLOR_1004',

  // 主题相关错误 (2xxx)
  THEME_NOT_FOUND = 'THEME_2001',
  THEME_ALREADY_EXISTS = 'THEME_2002',
  INVALID_THEME_CONFIG = 'THEME_2003',
  THEME_GENERATION_FAILED = 'THEME_2004',
  THEME_APPLICATION_FAILED = 'THEME_2005',

  // 存储相关错误 (3xxx)
  STORAGE_NOT_AVAILABLE = 'STORAGE_3001',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_3002',
  STORAGE_READ_FAILED = 'STORAGE_3003',
  STORAGE_WRITE_FAILED = 'STORAGE_3004',

  // 缓存相关错误 (4xxx)
  CACHE_FULL = 'CACHE_4001',
  CACHE_CORRUPTED = 'CACHE_4002',

  // 配置相关错误 (5xxx)
  INVALID_CONFIG = 'CONFIG_5001',
  MISSING_REQUIRED_OPTION = 'CONFIG_5002',

  // 运行时错误 (9xxx)
  INITIALIZATION_FAILED = 'RUNTIME_9001',
  OPERATION_TIMEOUT = 'RUNTIME_9002',
  UNKNOWN_ERROR = 'RUNTIME_9999',
}

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  /** 信息性消息，不影响功能 */
  INFO = 'info',
  /** 警告，可能影响部分功能 */
  WARNING = 'warning',
  /** 错误，影响功能但可恢复 */
  ERROR = 'error',
  /** 严重错误，无法恢复 */
  CRITICAL = 'critical',
}

/**
 * 错误上下文接口
 */
export interface ErrorContext {
  /** 错误发生的组件或模块 */
  component?: string
  /** 错误发生时的操作 */
  operation?: string
  /** 相关数据 */
  data?: Record<string, unknown>
  /** 错误发生的时间戳 */
  timestamp?: number
  /** 调用栈（如果可用） */
  stack?: string
}

/**
 * 基础颜色错误类
 */
export class ColorError extends Error {
  public readonly code: ColorErrorCode
  public readonly severity: ErrorSeverity
  public readonly context: ErrorContext
  public readonly recoverable: boolean

  constructor(
    message: string,
    code: ColorErrorCode = ColorErrorCode.UNKNOWN_ERROR,
    options: {
      severity?: ErrorSeverity
      context?: ErrorContext
      recoverable?: boolean
      cause?: Error
    } = {},
  ) {
    super(message)
    this.name = 'ColorError'
    this.code = code
    this.severity = options.severity ?? ErrorSeverity.ERROR
    this.context = {
      ...options.context,
      timestamp: Date.now(),
    }
    this.recoverable = options.recoverable ?? false

    // 保留原始错误的堆栈
    if (options.cause) {
      this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`
    }

    // 确保错误名称正确显示
    Object.setPrototypeOf(this, ColorError.prototype)
  }

  /**
   * 将错误转换为JSON格式
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      recoverable: this.recoverable,
      stack: this.stack,
    }
  }

  /**
   * 生成用户友好的错误消息
   */
  getUserMessage(): string {
    const baseMessage = this.message

    switch (this.code) {
      case ColorErrorCode.INVALID_COLOR_FORMAT:
        return `${baseMessage}. 请确保颜色值格式正确（如 #RRGGBB 或 rgb(r,g,b)）。`
      case ColorErrorCode.THEME_NOT_FOUND:
        return `${baseMessage}. 请检查主题名称是否正确。`
      case ColorErrorCode.STORAGE_NOT_AVAILABLE:
        return `${baseMessage}. 某些功能可能受限。`
      default:
        return baseMessage
    }
  }
}

/**
 * 颜色转换错误
 */
export class ColorConversionError extends ColorError {
  constructor(message: string, context?: ErrorContext, cause?: Error) {
    super(message, ColorErrorCode.COLOR_CONVERSION_FAILED, {
      severity: ErrorSeverity.ERROR,
      context: {
        ...context,
        component: 'ColorConverter',
      },
      recoverable: false,
      cause,
    })
    this.name = 'ColorConversionError'
  }
}

/**
 * 主题错误
 */
export class ThemeError extends ColorError {
  constructor(
    message: string,
    code: ColorErrorCode = ColorErrorCode.THEME_NOT_FOUND,
    context?: ErrorContext,
    cause?: Error,
  ) {
    super(message, code, {
      severity: ErrorSeverity.ERROR,
      context: {
        ...context,
        component: 'ThemeManager',
      },
      recoverable: true,
      cause,
    })
    this.name = 'ThemeError'
  }
}

/**
 * 配置错误
 */
export class ConfigError extends ColorError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ColorErrorCode.INVALID_CONFIG, {
      severity: ErrorSeverity.CRITICAL,
      context: {
        ...context,
        component: 'Configuration',
      },
      recoverable: false,
    })
    this.name = 'ConfigError'
  }
}

/**
 * 存储错误
 */
export class StorageError extends ColorError {
  constructor(
    message: string,
    code: ColorErrorCode = ColorErrorCode.STORAGE_READ_FAILED,
    context?: ErrorContext,
    cause?: Error,
  ) {
    super(message, code, {
      severity: ErrorSeverity.WARNING,
      context: {
        ...context,
        component: 'Storage',
      },
      recoverable: true,
      cause,
    })
    this.name = 'StorageError'
  }
}

/**
 * 错误处理器选项
 */
export interface ErrorHandlerOptions {
  /** 是否记录错误到控制台 */
  logToConsole?: boolean
  /** 自定义错误日志函数 */
  logger?: (error: ColorError) => void
  /** 错误恢复策略 */
  recoveryStrategy?: (error: ColorError) => void | Promise<void>
}

/**
 * 全局错误处理器
 */
export class ErrorHandler {
  private static instance: ErrorHandler | null = null
  private options: Required<ErrorHandlerOptions>
  private errorLog: ColorError[] = []
  private readonly maxLogSize = 100

  private constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      logToConsole: options.logToConsole ?? true,
      logger: options.logger ?? this.defaultLogger.bind(this),
      recoveryStrategy: options.recoveryStrategy ?? this.defaultRecovery.bind(this),
    }
  }

  /**
   * 获取错误处理器单例
   */
  static getInstance(options?: ErrorHandlerOptions): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(options)
    }
    return ErrorHandler.instance
  }

  /**
   * 处理错误
   */
  async handle(error: Error | ColorError): Promise<void> {
    const colorError = this.normalizeError(error)
    
    // 记录错误
    this.recordError(colorError)
    
    // 日志记录
    if (this.options.logToConsole) {
      this.options.logger(colorError)
    }

    // 尝试恢复
    if (colorError.recoverable && this.options.recoveryStrategy) {
      try {
        await this.options.recoveryStrategy(colorError)
      }
      catch (recoveryError) {
        console.error('Error recovery failed:', recoveryError)
      }
    }
  }

  /**
   * 将普通错误转换为 ColorError
   */
  private normalizeError(error: Error | ColorError): ColorError {
    if (error instanceof ColorError) {
      return error
    }

    return new ColorError(error.message, ColorErrorCode.UNKNOWN_ERROR, {
      severity: ErrorSeverity.ERROR,
      cause: error,
    })
  }

  /**
   * 记录错误到内存
   */
  private recordError(error: ColorError): void {
    this.errorLog.push(error)
    
    // 限制日志大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift()
    }
  }

  /**
   * 默认日志函数
   */
  private defaultLogger(error: ColorError): void {
    const logMethod = this.getLogMethod(error.severity)
    
    logMethod(
      `[${error.code}] ${error.name}: ${error.message}`,
      error.context,
    )
  }

  /**
   * 根据严重程度获取日志方法
   */
  private getLogMethod(severity: ErrorSeverity): typeof console.log {
    switch (severity) {
      case ErrorSeverity.INFO:
        return console.info
      case ErrorSeverity.WARNING:
        return console.warn
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        return console.error
      default:
        return console.log
    }
  }

  /**
   * 默认恢复策略
   */
  private async defaultRecovery(error: ColorError): Promise<void> {
    // 默认不执行任何恢复操作
    console.debug(`Attempting to recover from error: ${error.code}`)
  }

  /**
   * 获取错误日志
   */
  getErrorLog(): readonly ColorError[] {
    return [...this.errorLog]
  }

  /**
   * 清空错误日志
   */
  clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * 导出错误日志为JSON
   */
  exportErrorLog(): string {
    return JSON.stringify(
      this.errorLog.map(error => error.toJSON()),
      null,
      2,
    )
  }
}

/**
 * 安全执行函数，捕获并处理错误
 * 
 * @param fn 要执行的函数
 * @param fallback 错误时的回退值
 * @param errorContext 错误上下文
 * @returns 函数结果或回退值
 * 
 * @example
 * ```ts
 * const result = await safeExecute(
 *   () => riskyColorConversion(color),
 *   '#000000', // fallback
 *   { component: 'ColorPicker' }
 * )
 * ```
 */
export async function safeExecute<T>(
  fn: () => T | Promise<T>,
  fallback: T,
  errorContext?: ErrorContext,
): Promise<T> {
  try {
    return await fn()
  }
  catch (error) {
    const colorError = new ColorError(
      (error as Error).message,
      ColorErrorCode.UNKNOWN_ERROR,
      {
        context: errorContext,
        cause: error as Error,
        recoverable: true,
      },
    )
    
    await ErrorHandler.getInstance().handle(colorError)
    return fallback
  }
}

/**
 * 创建带错误处理的函数装饰器
 * 
 * @param errorCode 错误代码
 * @param errorContext 错误上下文
 * @returns 装饰器函数
 * 
 * @example
 * ```ts
 * class ColorService {
 *   @withErrorHandling(ColorErrorCode.COLOR_CONVERSION_FAILED)
 *   convertColor(color: string): string {
 *     // ... 可能抛出错误的代码
 *   }
 * }
 * ```
 */
export function withErrorHandling(
  errorCode: ColorErrorCode,
  errorContext?: ErrorContext,
) {
  return function (
    _target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args)
      }
      catch (error) {
        const colorError = new ColorError(
          (error as Error).message,
          errorCode,
          {
            context: {
              ...errorContext,
              operation: propertyKey,
            },
            cause: error as Error,
          },
        )
        
        await ErrorHandler.getInstance().handle(colorError)
        throw colorError
      }
    }

    return descriptor
  }
}
