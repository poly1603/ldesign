/**
 * 错误处理工具类
 * 
 * 提供统一的错误处理、日志记录和错误转换功能
 */

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  /** 是否记录错误日志 */
  logError?: boolean
  /** 日志前缀 */
  logPrefix?: string
  /** 是否重新抛出错误 */
  rethrow?: boolean
  /** 默认返回值 */
  defaultValue?: any
  /** 错误转换函数 */
  errorTransform?: (error: unknown) => Error
}

/**
 * 异步操作错误处理结果
 */
export interface AsyncResult<T> {
  /** 操作是否成功 */
  success: boolean
  /** 返回数据 */
  data?: T
  /** 错误信息 */
  error?: Error
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 安全执行异步操作
   * 
   * @param operation - 要执行的异步操作
   * @param options - 错误处理选项
   * @returns 执行结果
   * 
   * @example
   * ```typescript
   * const result = await ErrorHandler.safeAsync(
   *   () => riskyOperation(),
   *   { logPrefix: '[Cache]', defaultValue: null }
   * )
   * 
   * if (result.success) {
   *   
   * } else {
   *   console.error('操作失败:', result.error?.message)
   * }
   * ```
   */
  static async safeAsync<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {},
  ): Promise<AsyncResult<T>> {
    const {
      logError = true,
      logPrefix = '[ErrorHandler]',
      errorTransform = err => (err instanceof Error ? err : new Error(String(err))),
    } = options

    try {
      const data = await operation()
      return { success: true, data }
    }
    catch (error) {
      const transformedError = errorTransform(error)
      
      if (logError) {
        console.error(`${logPrefix} Operation failed:`, transformedError.message)
      }

      return { success: false, error: transformedError }
    }
  }

  /**
   * 安全执行同步操作
   * 
   * @param operation - 要执行的同步操作
   * @param options - 错误处理选项
   * @returns 执行结果或默认值
   */
  static safeSync<T>(
    operation: () => T,
    options: ErrorHandlerOptions = {},
  ): T | undefined {
    const {
      logError = true,
      logPrefix = '[ErrorHandler]',
      defaultValue,
      rethrow = false,
      errorTransform = err => (err instanceof Error ? err : new Error(String(err))),
    } = options

    try {
      return operation()
    }
    catch (error) {
      const transformedError = errorTransform(error)
      
      if (logError) {
        console.error(`${logPrefix} Operation failed:`, transformedError.message)
      }

      if (rethrow) {
        throw transformedError
      }

      return defaultValue
    }
  }

  /**
   * 创建带重试机制的异步操作
   * 
   * @param operation - 要执行的异步操作
   * @param maxRetries - 最大重试次数
   * @param delay - 重试延迟时间（毫秒）
   * @param options - 错误处理选项
   * @returns 执行结果
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    options: ErrorHandlerOptions = {},
  ): Promise<AsyncResult<T>> {
    const { logPrefix = '[ErrorHandler]' } = options
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.safeAsync(operation, {
        ...options,
        logError: attempt === maxRetries, // 只在最后一次失败时记录日志
      })

      if (result.success) {
        return result
      }

      if (attempt < maxRetries) {
        console.warn(`${logPrefix} Attempt ${attempt} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return { success: false, error: new Error(`Operation failed after ${maxRetries} attempts`) }
  }

  /**
   * 标准化错误对象
   * 
   * @param error - 原始错误
   * @param context - 错误上下文信息
   * @returns 标准化的错误对象
   */
  static normalizeError(error: unknown, context?: string): Error {
    if (error instanceof Error) {
      return context ? new Error(`${context}: ${error.message}`) : error
    }

    const message = typeof error === 'string' ? error : 'Unknown error'
    return new Error(context ? `${context}: ${message}` : message)
  }

  /**
   * 检查是否为特定类型的错误
   * 
   * @param error - 错误对象
   * @param patterns - 错误模式（字符串或正则表达式）
   * @returns 是否匹配
   */
  static isErrorType(error: unknown, ...patterns: (string | RegExp)[]): boolean {
    if (!(error instanceof Error)) {
      return false
    }

    return patterns.some((pattern) => {
      if (typeof pattern === 'string') {
        return error.message.includes(pattern)
      }
      return pattern.test(error.message)
    })
  }

  /**
   * 创建错误处理装饰器
   * 
   * @param options - 错误处理选项
   * @returns 装饰器函数
   */
  static createDecorator(options: ErrorHandlerOptions = {}) {
    return function <T extends (...args: any[]) => any>(
      target: any,
      propertyKey: string,
      descriptor: TypedPropertyDescriptor<T>,
    ) {
      const originalMethod = descriptor.value!

      descriptor.value = async function (this: unknown, ...args: any[]) {
        const result = await ErrorHandler.safeAsync(
          () => originalMethod.apply(this, args),
          options,
        )

        if (result.success) {
          return result.data
        }

        if (options.rethrow !== false) {
          throw result.error
        }

        return options.defaultValue
      } as T

      return descriptor
    }
  }
}

/**
 * 错误处理装饰器
 * 
 * @param options - 错误处理选项
 * @returns 装饰器函数
 * 
 * @example
 * ```typescript
 * class MyClass {
 *   @handleErrors({ logPrefix: '[MyClass]', defaultValue: null })
 *   async riskyMethod() {
 *     // 可能抛出错误的代码
 *   }
 * }
 * ```
 */
export function handleErrors(options: ErrorHandlerOptions = {}) {
  return ErrorHandler.createDecorator(options)
}

/**
 * 快捷的错误处理函数
 */
export const safeAsync = ErrorHandler.safeAsync
export const safeSync = ErrorHandler.safeSync
export const normalizeError = ErrorHandler.normalizeError
export const isErrorType = ErrorHandler.isErrorType
