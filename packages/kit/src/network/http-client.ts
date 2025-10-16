/**
 * HTTP客户端
 * 提供HTTP请求功能，支持拦截器、重试、缓存等
 */

import type {
  HttpClientOptions,
  HttpRequest,
  HttpResponse,
  RequestInterceptor,
  ResponseInterceptor,
} from '../types'
import { EventEmitter } from 'node:events'
import { NetworkError } from '../types'
import { AsyncUtils } from '../utils'

/**
 * HTTP客户端类
 */
type InternalHttpOptions = Required<HttpClientOptions> & {
  baseURL: string
  timeout: number
  headers: Record<string, string>
  followRedirects: boolean
  maxRedirects: number
  validateStatus: (status: number) => boolean
  retries: number
  retryDelay: number
  retryCondition: (error: any) => boolean
  cache: boolean
  cacheMaxAge: number
}

export class HttpClient extends EventEmitter {
  private config: InternalHttpOptions
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private cache: Map<string, CacheEntry> = new Map()

  constructor(options: HttpClientOptions = {}) {
    super()

    this.config = {
      baseURL: '',
      timeout: 30000,
      headers: {},
      followRedirects: true,
      maxRedirects: 5,
      validateStatus: status => status >= 200 && status < 300,
      retries: 0,
      retryDelay: 1000,
      retryCondition: (error: any) => (error as any).code === 'ECONNRESET' || (error as any).code === 'ETIMEDOUT',
      cache: false,
      cacheMaxAge: 300000, // 5分钟
      ...options as any,
    }
  }

  /**
   * 发送GET请求
   * @param url URL
   * @param config 配置
   * @returns 响应
   */
  async get<T = any>(url: string, config: Partial<HttpRequest> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  /**
   * 发送POST请求
   * @param url URL
   * @param data 数据
   * @param config 配置
   * @returns 响应
   */
  async post<T = any>(
    url: string,
    data?: any,
    config: Partial<HttpRequest> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  /**
   * 发送PUT请求
   * @param url URL
   * @param data 数据
   * @param config 配置
   * @returns 响应
   */
  async put<T = any>(
    url: string,
    data?: any,
    config: Partial<HttpRequest> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  /**
   * 发送PATCH请求
   * @param url URL
   * @param data 数据
   * @param config 配置
   * @returns 响应
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config: Partial<HttpRequest> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }

  /**
   * 发送DELETE请求
   * @param url URL
   * @param config 配置
   * @returns 响应
   */
  async delete<T = any>(url: string, config: Partial<HttpRequest> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }

  /**
   * 发送HEAD请求
   * @param url URL
   * @param config 配置
   * @returns 响应
   */
  async head<T = any>(url: string, config: Partial<HttpRequest> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'HEAD', url })
  }

  /**
   * 发送OPTIONS请求
   * @param url URL
   * @param config 配置
   * @returns 响应
   */
  async optionsRequest<T = any>(url: string, config: Partial<HttpRequest> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'OPTIONS', url })
  }

  /**
   * 发送请求
   * @param config 请求配置
   * @returns 响应
   */
  async request<T = any>(config: Partial<HttpRequest>): Promise<HttpResponse<T>> {
    const requestConfig = this.mergeConfig(config)

    // 检查缓存
    if (this.config?.cache && requestConfig.method === 'GET') {
      const cached = this.getFromCache(requestConfig)
      if (cached) {
        this.emit('cache-hit', { url: requestConfig.url })
        return cached as HttpResponse<T>
      }
    }

    // 应用请求拦截器
    let processedConfig = requestConfig
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig)
    }

    this.emit('request', processedConfig)

    let lastError: Error | undefined
    let attempt = 0
    const maxAttempts = this.config?.retries + 1

    while (attempt < maxAttempts) {
      try {
        const response = await this.executeRequest<T>(processedConfig)

        // 应用响应拦截器
        let processedResponse = response
        for (const interceptor of this.responseInterceptors) {
          processedResponse = await interceptor(processedResponse)
        }

        // 验证状态码
        if (!this.config?.validateStatus(processedResponse.status)) {
          throw new (NetworkError as any)(
            `Request failed with status ${processedResponse.status}`,
            processedConfig,
            processedResponse,
          )
        }

        // 缓存响应
        if (this.config?.cache && processedConfig.method === 'GET') {
          this.setCache(processedConfig, processedResponse)
        }

        this.emit('response', processedResponse)
        return processedResponse
      }
      catch (error) {
        lastError = error as Error
        attempt++

        if (attempt < maxAttempts && this.shouldRetry(lastError)) {
          this.emit('retry', { attempt, error: lastError, config: processedConfig })
          await AsyncUtils.delay(this.config?.retryDelay * attempt)
        }
        else {
          break
        }
      }
    }

    this.emit('error', lastError!)
    throw (lastError instanceof Error ? lastError : new Error(String(lastError || 'Unknown error')))
  }

  /**
   * 执行HTTP请求
   */
  private async executeRequest<T>(config: HttpRequest): Promise<HttpResponse<T>> {
    const url = new URL(config.url, this.config?.baseURL)

    // 添加查询参数
    if (config.params) {
      for (const [key, value] of Object.entries(config.params)) {
        url.searchParams.append(key, String(value))
      }
    }

    const requestOptions: RequestInit = {
      method: config.method,
      headers: config.headers,
      body: this.prepareBody(config.data, config.headers),
      signal: AbortSignal.timeout(config.timeout || this.config?.timeout),
    }

    const startTime = Date.now()

    try {
      const response = await fetch(url.toString(), requestOptions)

      const responseData = await this.parseResponse<T>(response, config.responseType)

      const headersObj: Record<string, string> = {}
        ; (response.headers as any).forEach((value: string, key: string) => {
          headersObj[key] = value
        })

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: headersObj,
        config,
        duration: Date.now() - startTime,
        url: response.url,
      }
    }
    catch (error) {
      if (error instanceof Error && (error as any).name === 'AbortError') {
        throw new (NetworkError as any)('Request timeout', config.url, error)
      }

      throw new (NetworkError as any)('Request failed', config.url, error as Error)
    }
  }

  /**
   * 准备请求体
   */
  private prepareBody(
    data: any,
    headers?: Record<string, string>,
  ): string | FormData | URLSearchParams | null {
    if (!data)
      return null

    const contentType = headers?.['content-type'] || headers?.['Content-Type']

    if (data instanceof FormData || data instanceof URLSearchParams) {
      return data
    }

    if (contentType?.includes('application/json')) {
      return JSON.stringify(data)
    }

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(data)) {
        params.append(key, String(value))
      }
      return params
    }

    if (typeof data === 'string') {
      return data
    }

    // 默认JSON序列化
    return JSON.stringify(data)
  }

  /**
   * 解析响应
   */
  private async parseResponse<T>(response: Response, responseType?: string): Promise<T> {
    const contentType = response.headers.get('content-type') || ''

    switch (responseType) {
      case 'json':
        return response.json()
      case 'text':
        return response.text() as T
      case 'blob':
        return response.blob() as T
      case 'arrayBuffer':
        return response.arrayBuffer() as T
      case 'stream':
        return response.body as T
      default:
        // 自动检测内容类型
        if (contentType.includes('application/json')) {
          return response.json()
        }
        else if (contentType.includes('text/')) {
          return response.text() as T
        }
        else {
          return response.blob() as T
        }
    }
  }

  /**
   * 合并配置
   */
  private mergeConfig(config: Partial<HttpRequest>): HttpRequest {
    return {
      method: 'GET',
      url: '',
      headers: { ...this.config?.headers, ...config.headers },
      timeout: config.timeout || this.config?.timeout,
      ...config,
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: Error): boolean {
    return this.config?.retryCondition(error)
  }

  /**
   * 从缓存获取
   */
  private getFromCache<T>(config: HttpRequest): HttpResponse<T> | null {
    const key = this.getCacheKey(config)
    const entry = this.cache.get(key)

    if (entry && Date.now() - entry.timestamp < this.config?.cacheMaxAge) {
      return entry.response as HttpResponse<T>
    }

    if (entry) {
      this.cache.delete(key)
    }

    return null
  }

  /**
   * 设置缓存
   */
  private setCache<T>(config: HttpRequest, response: HttpResponse<T>): void {
    const key = this.getCacheKey(config)
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    })
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(config: HttpRequest): string {
    const url = new URL(config.url, this.config?.baseURL)

    if (config.params) {
      for (const [key, value] of Object.entries(config.params)) {
        url.searchParams.append(key, String(value))
      }
    }

    return `${config.method}:${url.toString()}`
  }

  /**
   * 添加请求拦截器
   * @param interceptor 拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * 添加响应拦截器
   * @param interceptor 拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * 移除请求拦截器
   * @param interceptor 拦截器
   */
  removeRequestInterceptor(interceptor: RequestInterceptor): void {
    const index = this.requestInterceptors.indexOf(interceptor)
    if (index > -1) {
      this.requestInterceptors.splice(index, 1)
    }
  }

  /**
   * 移除响应拦截器
   * @param interceptor 拦截器
   */
  removeResponseInterceptor(interceptor: ResponseInterceptor): void {
    const index = this.responseInterceptors.indexOf(interceptor)
    if (index > -1) {
      this.responseInterceptors.splice(index, 1)
    }
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): CacheStats {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp < this.config?.cacheMaxAge) {
        validEntries++
      }
      else {
        expiredEntries++
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
    }
  }

  /**
   * 创建HTTP客户端实例
   * @param options 选项
   */
  static create(options: HttpClientOptions = {}): HttpClient {
    return new HttpClient(options)
  }
}

// 类型定义
interface CacheEntry {
  response: HttpResponse<any>
  timestamp: number
}

interface CacheStats {
  total: number
  valid: number
  expired: number
}
