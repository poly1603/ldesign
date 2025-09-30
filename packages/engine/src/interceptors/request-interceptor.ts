/**
 * 请求拦截器
 * 🎯 提供请求/响应拦截、重试、缓存等功能
 */

/**
 * 请求配置
 */
export interface RequestConfig {
  /** 请求URL */
  url: string
  /** 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求体 */
  body?: unknown
  /** 查询参数 */
  params?: Record<string, unknown>
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否缓存响应 */
  cache?: boolean
  /** 缓存时间（毫秒） */
  cacheTTL?: number
  /** 重试次数 */
  retries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 是否跟踪进度 */
  trackProgress?: boolean
  /** 自定义元数据 */
  metadata?: Record<string, unknown>
}

/**
 * 响应数据
 */
export interface ResponseData<T = any> {
  /** 响应数据 */
  data: T
  /** 状态码 */
  status: number
  /** 状态文本 */
  statusText: string
  /** 响应头 */
  headers: Record<string, string>
  /** 请求配置 */
  config: RequestConfig
  /** 是否从缓存获取 */
  fromCache?: boolean
  /** 响应时间（毫秒） */
  responseTime?: number
}

/**
 * 拦截器函数类型
 */
export type InterceptorFn<T = unknown> = (value: T) => T | Promise<T>

/**
 * 错误拦截器函数类型
 */
export type ErrorInterceptorFn<T = unknown> = (error: unknown) => T | Promise<T>

/**
 * 进度事件
 */
export interface ProgressEvent {
  /** 已加载字节数 */
  loaded: number
  /** 总字节数 */
  total: number
  /** 进度百分比 */
  progress: number
  /** 传输速率（字节/秒） */
  rate?: number
  /** 预计剩余时间（秒） */
  estimated?: number
}

/**
 * 请求拦截器管理器
 */
export class RequestInterceptorManager {
  private requestInterceptors: Array<{
    fulfilled: InterceptorFn<RequestConfig>
    rejected?: ErrorInterceptorFn<RequestConfig>
  }> = []

  private responseInterceptors: Array<{
    fulfilled: InterceptorFn<ResponseData>
    rejected?: ErrorInterceptorFn<ResponseData>
  }> = []

  private cache = new Map<string, { data: unknown; expiry: number }>()
  private pendingRequests = new Map<string, Promise<ResponseData>>()

  /**
   * 添加请求拦截器
   */
  useRequestInterceptor(
    onFulfilled: InterceptorFn<RequestConfig>,
    onRejected?: ErrorInterceptorFn<RequestConfig>
  ): number {
    this.requestInterceptors.push({
      fulfilled: onFulfilled,
      rejected: onRejected
    })
    return this.requestInterceptors.length - 1
  }

  /**
   * 添加响应拦截器
   */
  useResponseInterceptor(
    onFulfilled: InterceptorFn<ResponseData>,
    onRejected?: ErrorInterceptorFn<ResponseData>
  ): number {
    this.responseInterceptors.push({
      fulfilled: onFulfilled,
      rejected: onRejected
    })
    return this.responseInterceptors.length - 1
  }

  /**
   * 移除请求拦截器
   */
  ejectRequestInterceptor(id: number): void {
    if (this.requestInterceptors[id]) {
      this.requestInterceptors[id] = { fulfilled: (v) => v }
    }
  }

  /**
   * 移除响应拦截器
   */
  ejectResponseInterceptor(id: number): void {
    if (this.responseInterceptors[id]) {
      this.responseInterceptors[id] = { fulfilled: (v) => v }
    }
  }

  /**
   * 执行请求
   */
  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    const startTime = performance.now()

    try {
      // 执行请求拦截器
      const finalConfig = await this.runRequestInterceptors(config)

      // 生成缓存键
      const cacheKey = this.generateCacheKey(finalConfig)

      // 检查缓存
      if (finalConfig.cache) {
        const cached = this.getFromCache(cacheKey)
        if (cached) {
          return {
            ...cached,
            fromCache: true,
            responseTime: performance.now() - startTime
          }
        }

        // 检查是否有相同的请求正在进行
        const pending = this.pendingRequests.get(cacheKey)
        if (pending) {
          return await pending as ResponseData<T>
        }
      }

      // 创建请求Promise
      const requestPromise = this.performRequest<T>(finalConfig, startTime)

      // 如果启用缓存，保存pending状态
      if (finalConfig.cache) {
        this.pendingRequests.set(cacheKey, requestPromise)
      }

      try {
        const response = await requestPromise

        // 执行响应拦截器
        const finalResponse = await this.runResponseInterceptors(response)

        // 缓存响应
        if (finalConfig.cache && finalResponse.status >= 200 && finalResponse.status < 300) {
          this.saveToCache(cacheKey, finalResponse, finalConfig.cacheTTL)
        }

        return finalResponse as ResponseData<T>
      } finally {
        // 清除pending状态
        if (finalConfig.cache) {
          this.pendingRequests.delete(cacheKey)
        }
      }
    } catch (error) {
      // 执行错误拦截器
      throw await this.runErrorInterceptors(error as Error)
    }
  }

  /**
   * 执行实际请求
   */
  private async performRequest<T>(
    config: RequestConfig,
    startTime: number
  ): Promise<ResponseData<T>> {
    const { url, method = 'GET', headers = {}, body, params, timeout = 30000 } = config

    // 构建完整URL
    const fullUrl = this.buildUrl(url, params)

    // 创建AbortController用于超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      // 准备请求选项
      const headersObj = new Headers(headers)
      const requestOptions: RequestInit = {
        method,
        headers: headersObj,
        signal: controller.signal
      }

      // 处理请求体
      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        if (typeof body === 'object' && !(body instanceof FormData)) {
          requestOptions.body = JSON.stringify(body)
          headersObj.set('Content-Type', 'application/json')
        } else {
          requestOptions.body = body as BodyInit
        }
      }

      // 执行请求
      const response = await this.fetchWithRetry(fullUrl, requestOptions, config)

      // 解析响应
      const data = await this.parseResponse<T>(response)

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers),
        config,
        responseTime: performance.now() - startTime
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * 带重试的fetch
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    config: RequestConfig
  ): Promise<Response> {
    const { retries = 0, retryDelay = 1000 } = config
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options)

        // 如果响应成功或不需要重试的状态码，直接返回
        if (response.ok || !this.shouldRetry(response.status)) {
          return response
        }

        // 保存错误供后续使用
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (error) {
        lastError = error as Error
      }

      // 如果还有重试次数，等待后重试
      if (attempt < retries) {
        await this.delay(retryDelay * 2 ** attempt) // 指数退避
      }
    }

    throw lastError || new Error('Request failed')
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(status: number): boolean {
    // 5xx错误和429（太多请求）应该重试
    return status >= 500 || status === 429
  }

  /**
   * 解析响应数据
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      return await response.json()
    } else if (contentType.includes('text/')) {
      return await response.text() as any
    } else if (contentType.includes('application/octet-stream')) {
      return await response.blob() as any
    } else {
      // 尝试解析为JSON，失败则返回文本
      const text = await response.text()
      try {
        return JSON.parse(text)
      } catch {
        return text as any
      }
    }
  }

  /**
   * 解析响应头
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  /**
   * 构建URL
   */
  private buildUrl(baseUrl: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return baseUrl
    }

    const url = new URL(baseUrl, window.location.origin)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    return url.toString()
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(config: RequestConfig): string {
    const { url, method = 'GET', params, body } = config
    const keyParts = [method, url]

    if (params) {
      keyParts.push(JSON.stringify(params))
    }

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      keyParts.push(JSON.stringify(body))
    }

    return keyParts.join('|')
  }

  /**
   * 从缓存获取
   */
  private getFromCache(key: string): ResponseData | null {
    const cached = this.cache.get(key)

    if (!cached) return null

    // 检查是否过期
    if (cached.expiry < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return cached.data as ResponseData
  }

  /**
   * 保存到缓存
   */
  private saveToCache(key: string, data: ResponseData, ttl: number = 300000): void {
    const expiry = Date.now() + ttl
    this.cache.set(key, { data, expiry })

    // 限制缓存大小
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
  }

  /**
   * 执行请求拦截器
   */
  private async runRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let result = config

    for (const interceptor of this.requestInterceptors) {
      try {
        result = await interceptor.fulfilled(result)
      } catch (error) {
        if (interceptor.rejected) {
          result = await interceptor.rejected(error)
        } else {
          throw error
        }
      }
    }

    return result
  }

  /**
   * 执行响应拦截器
   */
  private async runResponseInterceptors(response: ResponseData): Promise<ResponseData> {
    let result = response

    for (const interceptor of this.responseInterceptors) {
      try {
        result = await interceptor.fulfilled(result)
      } catch (error) {
        if (interceptor.rejected) {
          result = await interceptor.rejected(error)
        } else {
          throw error
        }
      }
    }

    return result
  }

  /**
   * 执行错误拦截器
   */
  private async runErrorInterceptors(error: Error): Promise<Error> {
    let result: unknown = error

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.rejected) {
        try {
          result = await interceptor.rejected(result)
        } catch (e) {
          result = e
        }
      }
    }

    return result as Error
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 清除缓存
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      // 清除匹配模式的缓存
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      // 清除所有缓存
      this.cache.clear()
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * 批量请求
   */
  async batchRequest<T = any>(
    configs: RequestConfig[],
    options?: { parallel?: boolean; maxConcurrent?: number }
  ): Promise<ResponseData<T>[]> {
    const { parallel = true, maxConcurrent = 5 } = options || {}

    if (!parallel) {
      // 串行执行
      const results: ResponseData<T>[] = []
      for (const config of configs) {
        results.push(await this.request<T>(config))
      }
      return results
    }

    // 并行执行（限制并发数）
    const results: ResponseData<T>[] = []
    const executing: Promise<void>[] = []

    for (const config of configs) {
      const promise = this.request<T>(config).then(
        result => {
          results.push(result)
        }
      )

      if (configs.length >= maxConcurrent) {
        executing.push(promise)

        if (executing.length >= maxConcurrent) {
          await Promise.race(executing)
          executing.splice(executing.findIndex(p => p === promise), 1)
        }
      }
    }

    await Promise.all(executing)
    return results
  }
}

/**
 * 创建请求拦截器实例
 */
export function createRequestInterceptor(): RequestInterceptorManager {
  return new RequestInterceptorManager()
}

/**
 * 默认请求拦截器实例
 */
export const requestInterceptor = createRequestInterceptor()

// 添加默认请求拦截器
requestInterceptor.useRequestInterceptor(
  config => {
    // 添加时间戳防止缓存
    if (config.method === 'GET' && !config.cache) {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    return config
  }
)

// 添加默认响应拦截器
requestInterceptor.useResponseInterceptor(
  response => {
    // 记录响应日志
    console.debug(`[Response] ${response.config.method} ${response.config.url}`, {
      status: response.status,
      time: response.responseTime,
      fromCache: response.fromCache
    })
    return response
  },
  error => {
    // 统一错误处理
    console.error('[Request Error]', error)
    throw error
  }
)
