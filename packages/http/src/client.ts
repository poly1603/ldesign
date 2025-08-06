import type {
  ErrorInterceptor,
  HttpAdapter,
  HttpClient,
  HttpClientConfig,
  HttpError,
  InterceptorManager,
  RequestConfig,
  RequestInterceptor,
  ResponseData,
  ResponseInterceptor,
  RetryConfig,
} from '@/types'
import type { CancelManager } from '@/utils/cancel'
import { InterceptorManagerImpl } from '@/interceptors/manager'
import { CacheManager } from '@/utils/cache'
import { globalCancelManager } from '@/utils/cancel'
import { ConcurrencyManager } from '@/utils/concurrency'
import { RetryManager } from '@/utils/error'

/**
 * HTTP 客户端实现
 */
export class HttpClientImpl implements HttpClient {
  private config: HttpClientConfig
  private adapter: HttpAdapter
  private retryManager: RetryManager
  // private timeoutManager: TimeoutManager
  private cancelManager: CancelManager
  private cacheManager: CacheManager
  private concurrencyManager: ConcurrencyManager
  private isDestroyed = false

  public interceptors: {
    request: InterceptorManager<RequestInterceptor>
    response: InterceptorManager<ResponseInterceptor>
    error: InterceptorManager<ErrorInterceptor>
  }

  constructor(config: HttpClientConfig = {}, adapter?: HttpAdapter) {
    this.config = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      ...config,
    }

    if (!adapter) {
      throw new Error('HTTP adapter is required')
    }
    this.adapter = adapter

    // 初始化管理器
    this.retryManager = new RetryManager(config.retry)
    // this.timeoutManager = new TimeoutManager()
    this.cancelManager = globalCancelManager
    this.cacheManager = new CacheManager(config.cache)
    this.concurrencyManager = new ConcurrencyManager(config.concurrency)

    // 初始化拦截器
    this.interceptors = {
      request: new InterceptorManagerImpl<RequestInterceptor>(),
      response: new InterceptorManagerImpl<ResponseInterceptor>(),
      error: new InterceptorManagerImpl<ErrorInterceptor>(),
    }
  }

  /**
   * 发送请求（优化版）
   */
  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    this.checkDestroyed()

    // 合并配置（只在需要时进行深度合并）
    const mergedConfig = this.optimizedMergeConfig(config)

    // 如果启用了重试，使用重试管理器
    if (mergedConfig.retry?.retries && mergedConfig.retry.retries > 0) {
      return this.retryManager.executeWithRetry(
        () => this.executeRequest<T>(mergedConfig),
        mergedConfig,
      )
    }

    return this.executeRequest<T>(mergedConfig)
  }

  /**
   * 执行单次请求
   */
  private async executeRequest<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    // 检查缓存
    const cachedResponse = await this.cacheManager.get<T>(config)
    if (cachedResponse) {
      return cachedResponse
    }

    // 使用并发控制执行请求
    return this.concurrencyManager.execute(
      () => this.performRequest<T>(config),
      config,
    )
  }

  /**
   * 执行实际的请求
   */
  private async performRequest<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    try {
      // 执行请求拦截器
      const processedConfig = await this.processRequestInterceptors(config)

      // 发送请求
      let response = await this.adapter.request<T>(processedConfig)

      // 执行响应拦截器
      response = await this.processResponseInterceptors(response)

      // 缓存响应
      await this.cacheManager.set(processedConfig, response)

      return response
    }
    catch (error) {
      // 执行错误拦截器
      const processedError = await this.processErrorInterceptors(error as HttpError)
      throw processedError
    }
  }

  /**
   * GET 请求
   */
  get<T = any>(url: string, config: RequestConfig = {}): Promise<ResponseData<T>> {
    return this.request<T>({
      ...config,
      method: 'GET',
      url,
    })
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ResponseData<T>> {
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data,
    })
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ResponseData<T>> {
    return this.request<T>({
      ...config,
      method: 'PUT',
      url,
      data,
    })
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, config: RequestConfig = {}): Promise<ResponseData<T>> {
    return this.request<T>({
      ...config,
      method: 'DELETE',
      url,
    })
  }

  /**
   * PATCH 请求
   */
  patch<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ResponseData<T>> {
    return this.request<T>({
      ...config,
      method: 'PATCH',
      url,
      data,
    })
  }

  /**
   * HEAD 请求
   */
  head<T = any>(url: string, config: RequestConfig = {}): Promise<ResponseData<T>> {
    return this.request<T>({
      ...config,
      method: 'HEAD',
      url,
    })
  }

  /**
   * OPTIONS 请求
   */
  options<T = any>(url: string, config: RequestConfig = {}): Promise<ResponseData<T>> {
    return this.request<T>({
      ...config,
      method: 'OPTIONS',
      url,
    })
  }

  /**
   * 取消所有请求
   */
  cancelAll(reason?: string): void {
    this.cancelManager.cancelAll(reason)
  }

  /**
   * 获取活跃请求数量
   */
  getActiveRequestCount(): number {
    return this.cancelManager.getActiveRequestCount()
  }

  /**
   * 更新重试配置
   */
  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryManager.updateConfig(config)
  }

  /**
   * 获取当前配置
   */
  getConfig(): HttpClientConfig {
    return { ...this.config }
  }

  /**
   * 清空缓存
   */
  clearCache(): Promise<void> {
    return this.cacheManager.clear()
  }

  /**
   * 获取并发状态
   */
  getConcurrencyStatus() {
    return this.concurrencyManager.getStatus()
  }

  /**
   * 取消队列中的所有请求
   */
  cancelQueue(reason?: string): void {
    this.concurrencyManager.cancelQueue(reason)
  }

  /**
   * 处理请求拦截器
   */
  private async processRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config

    const interceptors = (this.interceptors.request as InterceptorManagerImpl<RequestInterceptor>)
      .getInterceptors()

    for (const interceptor of interceptors) {
      try {
        processedConfig = await interceptor.fulfilled(processedConfig)
      }
      catch (error) {
        if (interceptor.rejected) {
          throw await interceptor.rejected(error as HttpError)
        }
        throw error
      }
    }

    return processedConfig
  }

  /**
   * 处理响应拦截器
   */
  private async processResponseInterceptors<T>(response: ResponseData<T>): Promise<ResponseData<T>> {
    let processedResponse = response

    const interceptors = (this.interceptors.response as InterceptorManagerImpl<ResponseInterceptor>)
      .getInterceptors()

    for (const interceptor of interceptors) {
      try {
        processedResponse = await interceptor.fulfilled(processedResponse)
      }
      catch (error) {
        if (interceptor.rejected) {
          throw await interceptor.rejected(error as HttpError)
        }
        throw error
      }
    }

    return processedResponse
  }

  /**
   * 处理错误拦截器
   */
  private async processErrorInterceptors(error: HttpError): Promise<HttpError> {
    let processedError = error

    const interceptors = (this.interceptors.error as InterceptorManagerImpl<ErrorInterceptor>)
      .getInterceptors()

    for (const interceptor of interceptors) {
      try {
        processedError = await interceptor.fulfilled(processedError)
      }
      catch (err) {
        processedError = err as HttpError
      }
    }

    return processedError
  }

  /**
   * 优化的配置合并（避免不必要的深度合并）
   */
  private optimizedMergeConfig(config: RequestConfig): RequestConfig {
    // 如果请求配置为空，直接返回默认配置
    if (!config || Object.keys(config).length === 0) {
      return this.config
    }

    // 浅合并，只在需要时进行深度合并
    const merged: RequestConfig = {
      ...this.config,
      ...config,
    }

    // 只有在两者都有 headers 时才进行深度合并
    if (this.config.headers && config.headers) {
      merged.headers = {
        ...this.config.headers,
        ...config.headers,
      }
    }

    // 只有在两者都有 params 时才进行深度合并
    if (this.config.params && config.params) {
      merged.params = {
        ...this.config.params,
        ...config.params,
      }
    }

    return merged
  }

  /**
   * 销毁客户端，清理资源
   */
  destroy(): void {
    if (this.isDestroyed) {
      return
    }

    this.isDestroyed = true

    // 取消所有进行中的请求
    this.cancelManager.cancelAll('Client destroyed')

    // 清理缓存
    this.cacheManager.clear()

    // 清理并发队列
    this.concurrencyManager.cancelQueue('Client destroyed')

    // 清理拦截器
    this.interceptors.request.clear()
    this.interceptors.response.clear()
    this.interceptors.error.clear()
  }

  /**
   * 检查客户端是否已销毁
   */
  private checkDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error('HttpClient has been destroyed')
    }
  }
}
