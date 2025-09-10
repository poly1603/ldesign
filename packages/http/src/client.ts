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
} from './types'
import type { CancelManager } from './utils/cancel'
import type {
  DownloadConfig,
  DownloadResult,
} from './utils/download'
import type {
  UploadConfig,
  UploadResult,
} from './utils/upload'
import type { MonitorConfig } from './utils/monitor'
import type { Priority, PriorityQueueConfig } from './utils/priority'
import type { PoolConfig } from './utils/pool'
import { InterceptorManagerImpl } from './interceptors/manager'
import { CacheManager } from './utils/cache'
import { globalCancelManager } from './utils/cancel'
import { ConcurrencyManager } from './utils/concurrency'
import { RetryManager } from './utils/error'
import { RequestMonitor } from './utils/monitor'
import { PriorityQueue, determinePriority } from './utils/priority'
import { RequestPool } from './utils/pool'
import { generateId } from './utils'

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
  private monitor: RequestMonitor
  private priorityQueue: PriorityQueue
  private requestPool: RequestPool
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
    this.monitor = new RequestMonitor(config.monitor)
    this.priorityQueue = new PriorityQueue(config.priorityQueue)
    this.requestPool = new RequestPool(config.connectionPool)

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
    
    // 生成请求ID
    const requestId = generateId()
    
    // 开始监控
    this.monitor.startRequest(requestId, mergedConfig)
    
    // 判断优先级
    const priority = determinePriority(mergedConfig)
    
    // 使用优先级队列执行请求
    if (priority !== undefined && this.priorityQueue) {
      return this.priorityQueue.enqueue(
        mergedConfig,
        async () => {
          try {
            const response = await this.executeRequestWithRetry<T>(mergedConfig, requestId)
            this.monitor.endRequest(requestId, mergedConfig, response)
            return response
          } catch (error) {
            this.monitor.endRequest(requestId, mergedConfig, undefined, error as Error)
            throw error
          }
        },
        priority,
      )
    }

    // 普通执行
    try {
      const response = await this.executeRequestWithRetry<T>(mergedConfig, requestId)
      this.monitor.endRequest(requestId, mergedConfig, response)
      return response
    } catch (error) {
      this.monitor.endRequest(requestId, mergedConfig, undefined, error as Error)
      throw error
    }
  }
  
  /**
   * 执行带重试的请求
   */
  private async executeRequestWithRetry<T = any>(
    config: RequestConfig,
    requestId: string,
  ): Promise<ResponseData<T>> {
    // 如果启用了重试，使用重试管理器
    if (config.retry?.retries && config.retry.retries > 0) {
      return this.retryManager.executeWithRetry(
        () => {
          this.monitor.recordRetry(requestId)
          return this.executeRequest<T>(config)
        },
        config,
      )
    }

    return this.executeRequest<T>(config)
  }

  /**
   * 执行单次请求
   */
  private async executeRequest<T = any>(
    config: RequestConfig,
  ): Promise<ResponseData<T>> {
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
  private async performRequest<T = any>(
    config: RequestConfig,
  ): Promise<ResponseData<T>> {
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
      const processedError = await this.processErrorInterceptors(
        error as HttpError,
      )
      throw processedError
    }
  }

  /**
   * GET 请求
   */
  get<T = any>(
    url: string,
    config: RequestConfig = {},
  ): Promise<ResponseData<T>> {
    return this.request<T>({
      ...config,
      method: 'GET',
      url,
    })
  }

  /**
   * POST 请求
   */
  post<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<ResponseData<T>> {
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
  put<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<ResponseData<T>> {
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
  delete<T = any>(
    url: string,
    config: RequestConfig = {},
  ): Promise<ResponseData<T>> {
    return this.request<T>({
      ...config,
      method: 'DELETE',
      url,
    })
  }

  /**
   * PATCH 请求
   */
  patch<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<ResponseData<T>> {
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
  head<T = any>(
    url: string,
    config: RequestConfig = {},
  ): Promise<ResponseData<T>> {
    return this.request<T>({
      ...config,
      method: 'HEAD',
      url,
    })
  }

  /**
   * OPTIONS 请求
   */
  options<T = any>(
    url: string,
    config: RequestConfig = {},
  ): Promise<ResponseData<T>> {
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
  private async processRequestInterceptors(
    config: RequestConfig,
  ): Promise<RequestConfig> {
    let processedConfig = config

    const interceptors = (
      this.interceptors.request as InterceptorManagerImpl<RequestInterceptor>
    ).getInterceptors()

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
  private async processResponseInterceptors<T>(
    response: ResponseData<T>,
  ): Promise<ResponseData<T>> {
    let processedResponse = response

    const interceptors = (
      this.interceptors.response as InterceptorManagerImpl<ResponseInterceptor>
    ).getInterceptors()

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

    const interceptors = (
      this.interceptors.error as InterceptorManagerImpl<ErrorInterceptor>
    ).getInterceptors()

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
   * 上传文件
   */
  async upload<T = any>(
    url: string,
    file: File | File[],
    config: UploadConfig = {},
  ): Promise<UploadResult<T>> {
    this.checkDestroyed()

    const files = Array.isArray(file) ? file : [file]

    if (files.length === 1) {
      return this.uploadSingleFile<T>(url, files[0], config)
    }
    else {
      return this.uploadMultipleFiles<T>(url, files, config)
    }
  }

  /**
   * 上传单个文件
   */
  private async uploadSingleFile<T = any>(
    url: string,
    file: File,
    config: UploadConfig,
  ): Promise<UploadResult<T>> {
    const { validateFile, createUploadFormData, ProgressCalculator } = await import('./utils/upload')

    // 验证文件
    validateFile(file, config)

    const startTime = Date.now()
    const progressCalculator = new ProgressCalculator()

    // 创建表单数据
    const formData = createUploadFormData(file, config)

    // 配置请求
    const requestConfig: RequestConfig = {
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        ...config.headers,
        // 不设置 Content-Type，让浏览器自动设置 multipart/form-data
      },
      onUploadProgress: config.onProgress
        ? (progressEvent: any) => {
            const progress = progressCalculator.calculate(
              progressEvent.loaded,
              progressEvent.total,
              file,
            )
            config.onProgress!(progress)
          }
        : undefined,
    }

    const response = await this.request<T>(requestConfig)

    return {
      ...response,
      file,
      duration: Date.now() - startTime,
    }
  }

  /**
   * 上传多个文件
   */
  private async uploadMultipleFiles<T = any>(
    url: string,
    files: File[],
    config: UploadConfig,
  ): Promise<UploadResult<T>> {
    const { validateFile, ProgressCalculator } = await import('./utils/upload')

    // 验证所有文件
    files.forEach(file => validateFile(file, config))

    const startTime = Date.now()
    const progressCalculator = new ProgressCalculator()

    // 创建表单数据
    const formData = new FormData()

    // 添加所有文件
    const fileField = config.fileField || 'files'
    files.forEach((file, index) => {
      formData.append(`${fileField}[${index}]`, file)
    })

    // 添加额外的表单数据
    if (config.formData) {
      Object.entries(config.formData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // 配置请求
    const requestConfig: RequestConfig = {
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        ...config.headers,
      },
      onUploadProgress: config.onProgress
        ? (progressEvent: any) => {
            const progress = progressCalculator.calculate(
              progressEvent.loaded,
              progressEvent.total,
            )
            config.onProgress!(progress)
          }
        : undefined,
    }

    const response = await this.request<T>(requestConfig)

    return {
      ...response,
      file: files[0], // 返回第一个文件作为代表
      duration: Date.now() - startTime,
    }
  }

  /**
   * 下载文件
   */
  async download(
    url: string,
    config: DownloadConfig = {},
  ): Promise<DownloadResult> {
    this.checkDestroyed()

    const {
      getFilenameFromResponse,
      getFilenameFromURL,
      getMimeTypeFromFilename,
      saveFileToLocal,
      DownloadProgressCalculator,
    } = await import('./utils/download')

    const startTime = Date.now()
    const progressCalculator = new DownloadProgressCalculator()

    // 配置请求
    const requestConfig: RequestConfig = {
      ...config,
      method: 'GET',
      url,
      responseType: 'blob',
      onDownloadProgress: config.onProgress
        ? (progressEvent: any) => {
            const progress = progressCalculator.calculate(
              progressEvent.loaded,
              progressEvent.total,
              config.filename,
            )
            config.onProgress!(progress)
          }
        : undefined,
    }

    const response = await this.request<Blob>(requestConfig)

    // 确定文件名
    let filename = config.filename
    if (!filename) {
      filename = getFilenameFromResponse(response.headers)
        || getFilenameFromURL(response.config.url || url)
        || 'download'
    }

    // 确定文件类型
    const type = response.data?.type || getMimeTypeFromFilename(filename)

    // 自动保存文件（浏览器环境）
    let downloadUrl: string | undefined
    if (config.autoSave !== false && typeof window !== 'undefined') {
      saveFileToLocal(response.data, filename)
      downloadUrl = URL.createObjectURL(response.data)
    }

    return {
      data: response.data,
      filename,
      size: response.data.size,
      type,
      duration: Date.now() - startTime,
      url: downloadUrl,
    }
  }

  /**
   * 获取性能监控统计
   */
  getPerformanceStats() {
    return this.monitor.getStats()
  }

  /**
   * 获取最近的请求指标
   */
  getRecentMetrics(count?: number) {
    return this.monitor.getRecentMetrics(count)
  }

  /**
   * 获取慢请求列表
   */
  getSlowRequests() {
    return this.monitor.getSlowRequests()
  }

  /**
   * 获取失败请求列表
   */
  getFailedRequests() {
    return this.monitor.getFailedRequests()
  }

  /**
   * 启用性能监控
   */
  enableMonitoring() {
    this.monitor.enable()
  }

  /**
   * 禁用性能监控
   */
  disableMonitoring() {
    this.monitor.disable()
  }

  /**
   * 获取优先级队列统计
   */
  getPriorityQueueStats() {
    return this.priorityQueue.getStats()
  }

  /**
   * 获取连接池统计
   */
  getConnectionPoolStats() {
    return this.requestPool.getStats()
  }

  /**
   * 获取连接池详情
   */
  getConnectionDetails() {
    return this.requestPool.getConnectionDetails()
  }

  /**
   * 导出性能指标
   */
  exportMetrics() {
    return {
      performance: this.monitor.exportMetrics(),
      priorityQueue: this.priorityQueue.getStats(),
      connectionPool: this.requestPool.getStats(),
      concurrency: this.concurrencyManager.getStatus(),
      cache: this.cacheManager.getStats ? this.cacheManager.getStats() : null,
    }
  }

  /**
   * 设置请求优先级
   */
  setPriority(config: RequestConfig, priority: Priority): RequestConfig {
    return {
      ...config,
      priority,
    }
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
    
    // 清理优先级队列
    this.priorityQueue.destroy()
    
    // 清理连接池
    this.requestPool.destroy()
    
    // 清理监控器
    this.monitor.clear()

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
