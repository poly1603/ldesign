import type { RequestConfig, ResponseData } from '../types'
import { isArrayBuffer, isBlob, isFormData, isURLSearchParams } from '../utils'
import { BaseAdapter } from './base'

/**
 * Fetch 适配器
 */
export class FetchAdapter extends BaseAdapter {
  name = 'fetch'

  /**
   * 检查是否支持 fetch API
   */
  isSupported(): boolean {
    return (
      typeof fetch !== 'undefined' && typeof AbortController !== 'undefined'
    )
  }

  /**
   * 发送请求
   */
  async request<T = unknown>(config: RequestConfig): Promise<ResponseData<T>> {
    const processedConfig = this.processConfig(config)

    try {
      // 创建超时控制器
      const timeoutController = this.createTimeoutController(
        processedConfig.timeout,
      )

      // 合并 AbortSignal
      const signal = this.mergeAbortSignals([
        processedConfig.signal,
        timeoutController.signal,
      ])

      // 构建 fetch 选项
      const fetchOptions: RequestInit = {
        method: processedConfig.method,
        headers: this.buildHeaders(processedConfig),
        signal,
        credentials: processedConfig.withCredentials
          ? 'include'
          : 'same-origin',
      }

      // 处理请求体
      if (
        processedConfig.data
        && processedConfig.method !== 'GET'
        && processedConfig.method !== 'HEAD'
      ) {
        fetchOptions.body = this.buildBody(
          processedConfig.data,
          processedConfig.headers,
        )
      }

      // 发送请求
      const response = await fetch(processedConfig.url!, fetchOptions)

      // 清理超时定时器
      timeoutController.cleanup()

      // 处理响应
      return await this.handleResponse<T>(response, processedConfig)
    }
    catch (error) {
      throw this.processError(error, processedConfig)
    }
  }

  /**
   * 构建请求头
   */
  private buildHeaders(config: RequestConfig): HeadersInit {
    const headers: Record<string, string> = { ...config.headers }

    // 如果没有设置 Content-Type 且有数据，自动设置
    if (config.data && !headers['content-type'] && !headers['Content-Type']) {
      if (typeof config.data === 'string') {
        headers['Content-Type'] = 'text/plain'
      }
      else if (isFormData(config.data)) {
        // FormData 会自动设置 Content-Type，包括 boundary
        delete headers['Content-Type']
      }
      else if (isURLSearchParams(config.data)) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
      }
      else if (typeof config.data === 'object') {
        headers['Content-Type'] = 'application/json'
      }
    }

    return headers
  }

  /**
   * 构建请求体
   */
  private buildBody(data: any, headers?: Record<string, string>): BodyInit {
    if (data === null || data === undefined) {
      return undefined as any
    }

    // 直接支持的类型
    if (
      typeof data === 'string'
      || isFormData(data)
      || isBlob(data)
      || isArrayBuffer(data)
      || isURLSearchParams(data)
      || data instanceof ReadableStream
    ) {
      return data
    }

    // 对象类型，根据 Content-Type 处理
    const contentType
      = headers?.['content-type'] || headers?.['Content-Type'] || ''

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams()
      Object.keys(data).forEach((key) => {
        const value = data[key]
        if (value !== null && value !== undefined) {
          params.append(key, String(value))
        }
      })
      return params
    }

    // 默认 JSON 序列化
    return JSON.stringify(data)
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(
    response: Response,
    config: RequestConfig,
  ): Promise<ResponseData<T>> {
    const headers = this.parseHeaders(response.headers)

    // 解析响应数据
    const data = await this.parseResponseData<T>(response, config.responseType)

    // 检查状态码
    if (!response.ok) {
      const error = this.processError(
        new Error(`Request failed with status ${response.status}`),
        config,
        this.processResponse(
          data,
          response.status,
          response.statusText,
          headers,
          config,
          response,
        ),
      )
      throw error
    }

    return this.processResponse(
      data,
      response.status,
      response.statusText,
      headers,
      config,
      response,
    )
  }

  /**
   * 解析响应数据
   */
  private async parseResponseData<T>(
    response: Response,
    responseType?: string,
  ): Promise<T> {
    if (!response.body) {
      return null as T
    }

    try {
      switch (responseType) {
        case 'text':
          return (await response.text()) as T
        case 'blob':
          return (await response.blob()) as T
        case 'arrayBuffer':
          return (await response.arrayBuffer()) as T
        case 'stream':
          return response.body as T
        case 'json':
        default: {
          // 检查 Content-Type
          const contentType = response.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            return await response.json()
          }
          else if (contentType.includes('text/')) {
            return (await response.text()) as T
          }
          else {
            // 尝试解析为 JSON，失败则返回文本
            const text = await response.text()
            try {
              return JSON.parse(text)
            }
            catch {
              return text as T
            }
          }
        }
      }
    }
    catch {
      // 解析失败，返回空值
      return null as T
    }
  }
}
