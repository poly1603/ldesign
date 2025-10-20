import type {
  HttpAdapter,
  HttpError,
  RequestConfig,
  ResponseData,
} from '../types'
import { buildURL, createHttpError } from '../utils'

/**
 * 适配器基类
 */
export abstract class BaseAdapter implements HttpAdapter {
  abstract name: string

  /**
   * 发送请求的抽象方法
   */
  abstract request<T = unknown>(config: RequestConfig): Promise<ResponseData<T>>

  /**
   * 检查是否支持当前环境
   */
  abstract isSupported(): boolean

  /**
   * 处理请求配置
   */
  protected processConfig(config: RequestConfig): RequestConfig {
    const processedConfig = { ...config }

    // 构建完整 URL
    if (processedConfig.url) {
      processedConfig.url = buildURL(
        processedConfig.url,
        processedConfig.baseURL,
        processedConfig.params,
      )
    }

    // 设置默认方法
    if (!processedConfig.method) {
      processedConfig.method = 'GET'
    }

    // 设置默认头部
    if (!processedConfig.headers) {
      processedConfig.headers = {}
    }

    return processedConfig
  }

  /**
   * 处理响应数据
   */
  protected processResponse<T>(
    data: T,
    status: number,
    statusText: string,
    headers: Record<string, string>,
    config: RequestConfig,
    raw?: any,
  ): ResponseData<T> {
    return {
      data,
      status,
      statusText,
      headers,
      config,
      raw,
    }
  }

  /**
   * 处理错误
   */
  protected processError(
    error: any,
    config: RequestConfig,
    response?: ResponseData,
  ): HttpError {
    let message = 'Request failed'
    let code: string | undefined

    if (error instanceof Error) {
      message = error.message
      code = (error as any).code
    }
    else if (typeof error === 'string') {
      message = error
    }

    // 根据错误类型设置相应的标志
    const httpError = createHttpError(message, config, code, response)

    // 处理特定错误类型
    if (error.name === 'AbortError' || message.includes('aborted')) {
      httpError.isCancelError = true
      httpError.code = 'CANCELED'
    }
    else if (error.name === 'TimeoutError' || message.includes('timeout')) {
      httpError.isTimeoutError = true
      httpError.code = 'TIMEOUT'
    }
    else if (message.includes('Network') || message.includes('fetch')) {
      httpError.isNetworkError = true
      httpError.code = 'NETWORK_ERROR'
    }

    return httpError
  }

  /**
   * 创建超时控制器
   */
  protected createTimeoutController(timeout?: number): {
    signal: AbortSignal
    cleanup: () => void
  } {
    const controller = new AbortController()
    let timeoutId: NodeJS.Timeout | undefined

    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        if (controller && typeof controller.abort === 'function') {
          controller.abort()
        }
      }, timeout)
    }

    return {
      signal: controller.signal,
      cleanup: () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      },
    }
  }

  /**
   * 合并 AbortSignal
   */
  protected mergeAbortSignals(
    signals: (AbortSignal | undefined)[],
  ): AbortSignal {
    const validSignals = signals.filter(
      (signal): signal is AbortSignal => signal !== undefined,
    )

    if (validSignals.length === 0) {
      return new AbortController().signal
    }

    if (validSignals.length === 1) {
      // 已检查数组长度，安全断言
      return validSignals[0]!
    }

    // 创建一个新的控制器来合并多个信号
    const controller = new AbortController()

    const abortHandler = () => {
      controller.abort()
    }

    validSignals.forEach((signal) => {
      if (signal.aborted) {
        controller.abort()
        return
      }
      signal.addEventListener('abort', abortHandler, { once: true })
    })

    return controller.signal
  }

  /**
   * 解析响应头
   */
  protected parseHeaders(
    headers: Headers | Record<string, string>,
  ): Record<string, string> {
    const result: Record<string, string> = {}

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        result[key.toLowerCase()] = value
      })
    }
    else {
      Object.keys(headers).forEach((key) => {
        const value = headers[key]
        if (value !== undefined) {
          result[key.toLowerCase()] = value
        }
      })
    }

    return result
  }
}
