/**
 * I18n 错误处理系统
 *
 * 提供统一的错误类型和处理机制
 */

/**
 * I18n 错误基类
 */
export class I18nError extends Error {
  public readonly code: string
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.context = context

    // 确保错误堆栈正确显示
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * 获取错误的详细信息
   */
  getDetails(): string {
    const details = [`错误代码: ${this.code}`, `错误信息: ${this.message}`]

    if (this.context) {
      details.push(`上下文: ${JSON.stringify(this.context, null, 2)}`)
    }

    return details.join('\n')
  }

  /**
   * 转换为JSON格式
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack,
    }
  }
}

/**
 * 语言包加载错误
 */
export class LanguageLoadError extends I18nError {
  constructor(locale: string, originalError?: Error) {
    super(`无法加载语言包: ${locale}`, 'LANGUAGE_LOAD_ERROR', {
      locale,
      originalError: originalError?.message,
    })
  }
}

/**
 * 翻译键不存在错误
 */
export class TranslationKeyError extends I18nError {
  constructor(key: string, locale: string) {
    super(`翻译键不存在: ${key} (语言: ${locale})`, 'TRANSLATION_KEY_ERROR', {
      key,
      locale,
    })
  }
}

/**
 * 插值参数错误
 */
export class InterpolationError extends I18nError {
  constructor(key: string, missingParams: string[]) {
    super(
      `插值参数缺失: ${missingParams.join(', ')} (翻译键: ${key})`,
      'INTERPOLATION_ERROR',
      {
        key,
        missingParams,
      }
    )
  }
}

/**
 * 复数规则错误
 */
export class PluralRuleError extends I18nError {
  constructor(locale: string, count: number) {
    super(
      `复数规则处理失败: 语言 ${locale}, 数量 ${count}`,
      'PLURAL_RULE_ERROR',
      {
        locale,
        count,
      }
    )
  }
}

/**
 * 配置错误
 */
export class ConfigurationError extends I18nError {
  constructor(option: string, value: unknown) {
    super(`配置选项无效: ${option} = ${value}`, 'CONFIGURATION_ERROR', {
      option,
      value,
    })
  }
}

/**
 * 初始化错误
 */
export class InitializationError extends I18nError {
  constructor(reason: string) {
    super(`I18n 初始化失败: ${reason}`, 'INITIALIZATION_ERROR', {
      reason,
    })
  }
}

/**
 * 缓存错误
 */
export class CacheError extends I18nError {
  constructor(operation: string, key: string, originalError?: Error) {
    super(`缓存操作失败: ${operation} (键: ${key})`, 'CACHE_ERROR', {
      operation,
      key,
      originalError: originalError?.message,
    })
  }
}

/**
 * 错误处理器接口
 */
export interface ErrorHandler {
  /** 处理错误 */
  handle: (_error: I18nError) => void
  /** 是否可以处理该错误 */
  canHandle: (_error: I18nError) => boolean
}

/**
 * 默认错误处理器
 */
export class DefaultErrorHandler implements ErrorHandler {
  canHandle(_error: I18nError): boolean {
    return true // 可以处理所有错误
  }

  handle(error: I18nError): void {
    console.error(`[I18n Error] ${error.getDetails()}`)
  }
}

/**
 * 静默错误处理器
 */
export class SilentErrorHandler implements ErrorHandler {
  canHandle(_error: I18nError): boolean {
    return true
  }

  handle(_error: I18nError): void {
    // 静默处理，不输出任何信息
  }
}

/**
 * 开发环境错误处理器
 */
export class DevelopmentErrorHandler implements ErrorHandler {
  canHandle(_error: I18nError): boolean {
    return true
  }

  handle(error: I18nError): void {
    console.group(`🚨 I18n Error: ${error.code}`)
    console.error(error.message)
    if (error.context) {
      console.table(error.context)
    }
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    console.groupEnd()
  }
}

/**
 * 错误管理器
 */
export class ErrorManager {
  private handlers: ErrorHandler[] = []
  private errorCounts = new Map<string, number>()

  constructor() {
    // 默认添加一个错误处理器
    this.addHandler(
      process.env.NODE_ENV === 'development'
        ? new DevelopmentErrorHandler()
        : new DefaultErrorHandler()
    )
  }

  /**
   * 添加错误处理器
   * @param handler 错误处理器
   */
  addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler)
  }

  /**
   * 移除错误处理器
   * @param handler 错误处理器
   */
  removeHandler(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler)
    if (index > -1) {
      this.handlers.splice(index, 1)
    }
  }

  /**
   * 处理错误
   * @param error 错误实例
   */
  handle(error: I18nError): void {
    // 记录错误次数
    this.errorCounts.set(
      error.code,
      (this.errorCounts.get(error.code) || 0) + 1
    )

    // 使用第一个能处理该错误的处理器
    for (const handler of this.handlers) {
      if (handler.canHandle(error)) {
        handler.handle(error)
        break
      }
    }
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts)
  }

  /**
   * 重置错误统计
   */
  resetStats(): void {
    this.errorCounts.clear()
  }

  /**
   * 创建并处理错误
   * @param ErrorClass 错误类
   * @param args 错误构造参数
   */
  createAndHandle<T extends I18nError>(
    ErrorClass: new (...args: any[]) => T,
    ...args: any[]
  ): T {
    const error = new ErrorClass(...args)
    this.handle(error)
    return error
  }
}

/**
 * 全局错误管理器实例
 */
export const globalErrorManager = new ErrorManager()

/**
 * 错误处理装饰器
 */
export function handleErrors(errorManager: ErrorManager = globalErrorManager) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args)

        // 如果返回 Promise，处理异步错误
        if (result instanceof Promise) {
          return result.catch(error => {
            if (error instanceof I18nError) {
              errorManager.handle(error)
            } else {
              // 将普通错误转换为 I18nError
              const i18nError = new I18nError(
                error.message || '未知错误',
                'UNKNOWN_ERROR',
                { originalError: error }
              )
              errorManager.handle(i18nError)
            }
            throw error
          })
        }

        return result
      } catch (error) {
        if (error instanceof I18nError) {
          errorManager.handle(error)
        } else {
          // 将普通错误转换为 I18nError
          const i18nError = new I18nError(
            (error as Error).message || '未知错误',
            'UNKNOWN_ERROR',
            { originalError: error }
          )
          errorManager.handle(i18nError)
        }
        throw error
      }
    }

    return descriptor
  }
}
