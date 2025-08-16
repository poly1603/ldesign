import type {
  HttpError,
  RequestConfig,
  ResponseData,
  RetryConfig,
} from '../types'
import { createHttpError, delay } from './index'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  CANCEL = 'CANCEL_ERROR',
  HTTP = 'HTTP_ERROR',
  PARSE = 'PARSE_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * 错误处理器类（优化版）
 */
export class ErrorHandler {
  // 缓存常见错误消息模板
  private static readonly ERROR_TEMPLATES = {
    [ErrorType.NETWORK]: 'Network Error: Unable to connect to the server',
    [ErrorType.TIMEOUT]: (timeout: number) =>
      `Timeout Error: Request timed out after ${timeout}ms`,
    [ErrorType.CANCEL]: 'Cancel Error: Request was cancelled',
    [ErrorType.HTTP]: (status: number, statusText: string) =>
      `HTTP Error ${status}: ${statusText}`,
    [ErrorType.PARSE]: 'Parse Error: Failed to parse response data',
    [ErrorType.UNKNOWN]: 'Unknown Error: An unexpected error occurred',
  } as const

  /**
   * 创建网络错误（优化版）
   */
  static createNetworkError(
    config: RequestConfig,
    originalError?: any,
  ): HttpError {
    const error = createHttpError(
      this.ERROR_TEMPLATES[ErrorType.NETWORK],
      config,
      ErrorType.NETWORK,
    )
    error.isNetworkError = true
    error.cause = originalError
    return error
  }

  /**
   * 创建超时错误（优化版）
   */
  static createTimeoutError(config: RequestConfig, timeout: number): HttpError {
    const message
      = typeof this.ERROR_TEMPLATES[ErrorType.TIMEOUT] === 'function'
        ? this.ERROR_TEMPLATES[ErrorType.TIMEOUT](timeout)
        : `Timeout Error: Request timed out after ${timeout}ms`

    const error = createHttpError(message, config, ErrorType.TIMEOUT)
    error.isTimeoutError = true
    return error
  }

  /**
   * 创建取消错误（优化版）
   */
  static createCancelError(config: RequestConfig): HttpError {
    const error = createHttpError(
      this.ERROR_TEMPLATES[ErrorType.CANCEL],
      config,
      ErrorType.CANCEL,
    )
    error.isCancelError = true
    return error
  }

  /**
   * 创建 HTTP 错误
   */
  static createHttpError(
    status: number,
    statusText: string,
    config: RequestConfig,
    response?: ResponseData,
  ): HttpError {
    const error = createHttpError(
      `HTTP Error: ${status} ${statusText}`,
      config,
      ErrorType.HTTP,
      response,
    )
    return error
  }

  /**
   * 创建解析错误
   */
  static createParseError(
    config: RequestConfig,
    originalError?: any,
  ): HttpError {
    const error = createHttpError(
      'Parse Error: Failed to parse response data',
      config,
      ErrorType.PARSE,
    )
    error.cause = originalError
    return error
  }

  /**
   * 判断错误是否可重试
   */
  static isRetryableError(error: HttpError): boolean {
    // 网络错误和超时错误通常可以重试
    if (error.isNetworkError || error.isTimeoutError) {
      return true
    }

    // 某些 HTTP 状态码可以重试
    if (error.response?.status) {
      const status = error.response.status
      // 5xx 服务器错误和 429 限流错误可以重试
      return status >= 500 || status === 429 || status === 408
    }

    return false
  }

  /**
   * 获取错误的用户友好消息
   */
  static getUserFriendlyMessage(error: HttpError): string {
    if (error.isNetworkError) {
      return '网络连接失败，请检查网络设置'
    }

    if (error.isTimeoutError) {
      return '请求超时，请稍后重试'
    }

    if (error.isCancelError) {
      return '请求已取消'
    }

    if (error.response?.status) {
      const status = error.response.status
      switch (status) {
        case 400:
          return '请求参数错误'
        case 401:
          return '未授权，请重新登录'
        case 403:
          return '权限不足'
        case 404:
          return '请求的资源不存在'
        case 429:
          return '请求过于频繁，请稍后重试'
        case 500:
          return '服务器内部错误'
        case 502:
          return '网关错误'
        case 503:
          return '服务暂时不可用'
        default:
          return `请求失败 (${status})`
      }
    }

    return error.message || '未知错误'
  }
}

/**
 * 重试管理器
 */
export class RetryManager {
  private config: Required<RetryConfig>

  constructor(config: RetryConfig = {}) {
    this.config = {
      retries: config.retries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      retryCondition: config.retryCondition ?? ErrorHandler.isRetryableError,
      retryDelayFunction:
        config.retryDelayFunction ?? this.defaultRetryDelayFunction,
    }
  }

  /**
   * 执行带重试的请求
   */
  async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    _requestConfig?: RequestConfig,
  ): Promise<T> {
    let lastError: HttpError
    let retryCount = 0

    while (retryCount <= this.config.retries) {
      try {
        return await requestFn()
      }
      catch (error) {
        lastError = error as HttpError

        // 检查是否应该重试
        if (
          retryCount >= this.config.retries
          || !this.config.retryCondition(lastError)
        ) {
          throw lastError
        }

        // 计算延迟时间
        const delayTime = this.config.retryDelayFunction(retryCount, lastError)

        // 等待重试
        await delay(delayTime)

        retryCount++
      }
    }

    throw lastError!
  }

  /**
   * 默认重试延迟函数（指数退避）
   */
  private defaultRetryDelayFunction(
    retryCount: number,
    _error: HttpError,
  ): number {
    const baseDelay = this.config.retryDelay
    const exponentialDelay = baseDelay * 2 ** retryCount

    // 添加随机抖动，避免雷群效应
    const jitter = Math.random() * 0.1 * exponentialDelay

    return Math.min(exponentialDelay + jitter, 30000) // 最大延迟 30 秒
  }

  /**
   * 更新重试配置
   */
  updateConfig(config: Partial<RetryConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 获取当前配置
   */
  getConfig(): Required<RetryConfig> {
    return { ...this.config }
  }
}

/**
 * 超时管理器
 */
export class TimeoutManager {
  private timeouts = new Map<string, NodeJS.Timeout>()

  /**
   * 创建超时控制器
   */
  createTimeoutController(
    timeout: number,
    requestId?: string,
  ): {
      signal: AbortSignal
      cleanup: () => void
    } {
    const controller = new AbortController()
    const id = requestId || this.generateId()

    const timeoutId = setTimeout(() => {
      controller.abort()
      this.timeouts.delete(id)
    }, timeout)

    this.timeouts.set(id, timeoutId)

    return {
      signal: controller.signal,
      cleanup: () => {
        const existingTimeout = this.timeouts.get(id)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
          this.timeouts.delete(id)
        }
      },
    }
  }

  /**
   * 清理所有超时
   */
  clearAll(): void {
    this.timeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    this.timeouts.clear()
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15)
  }
}
