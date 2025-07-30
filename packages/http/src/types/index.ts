/**
 * HTTP 请求方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/**
 * 请求配置接口
 */
export interface RequestConfig {
  /** 请求 URL */
  url?: string
  /** HTTP 方法 */
  method?: HttpMethod
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求参数（GET 请求的查询参数） */
  params?: Record<string, any>
  /** 请求体数据 */
  data?: any
  /** 超时时间（毫秒） */
  timeout?: number
  /** 基础 URL */
  baseURL?: string
  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'stream'
  /** 是否携带凭证 */
  withCredentials?: boolean
  /** 取消令牌 */
  signal?: AbortSignal
  /** 自定义配置 */
  [key: string]: any
}

/**
 * 响应数据接口
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
  /** 原始响应对象 */
  raw?: any
}

/**
 * 错误信息接口
 */
export interface HttpError extends Error {
  /** 错误代码 */
  code?: string
  /** 请求配置 */
  config?: RequestConfig
  /** 响应数据 */
  response?: ResponseData
  /** 是否为网络错误 */
  isNetworkError?: boolean
  /** 是否为超时错误 */
  isTimeoutError?: boolean
  /** 是否为取消错误 */
  isCancelError?: boolean
}

/**
 * 拦截器函数类型
 */
export interface RequestInterceptor {
  (config: RequestConfig): RequestConfig | Promise<RequestConfig>
}

export interface ResponseInterceptor<T = any> {
  (response: ResponseData<T>): ResponseData<T> | Promise<ResponseData<T>>
}

export interface ErrorInterceptor {
  (error: HttpError): HttpError | Promise<HttpError>
}

/**
 * 拦截器管理器接口
 */
export interface InterceptorManager<T> {
  use(fulfilled: T, rejected?: ErrorInterceptor): number
  eject(id: number): void
  clear(): void
}

/**
 * 重试配置接口
 */
export interface RetryConfig {
  /** 重试次数 */
  retries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 重试条件函数 */
  retryCondition?: (error: HttpError) => boolean
  /** 重试延迟函数 */
  retryDelayFunction?: (retryCount: number, error: HttpError) => number
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 缓存时间（毫秒） */
  ttl?: number
  /** 缓存键生成函数 */
  keyGenerator?: (config: RequestConfig) => string
  /** 缓存存储接口 */
  storage?: CacheStorage
}

/**
 * 缓存存储接口
 */
export interface CacheStorage {
  get(key: string): Promise<any> | any
  set(key: string, value: any, ttl?: number): Promise<void> | void
  delete(key: string): Promise<void> | void
  clear(): Promise<void> | void
}

/**
 * 并发控制配置
 */
export interface ConcurrencyConfig {
  /** 最大并发数 */
  maxConcurrent?: number
  /** 队列大小限制 */
  maxQueueSize?: number
}

/**
 * HTTP 客户端配置接口
 */
export interface HttpClientConfig extends RequestConfig {
  /** 适配器名称或实例 */
  adapter?: string | HttpAdapter
  /** 重试配置 */
  retry?: RetryConfig
  /** 缓存配置 */
  cache?: CacheConfig
  /** 并发控制配置 */
  concurrency?: ConcurrencyConfig
}

/**
 * HTTP 适配器接口
 */
export interface HttpAdapter {
  /** 适配器名称 */
  name: string
  /** 发送请求 */
  request<T = any>(config: RequestConfig): Promise<ResponseData<T>>
  /** 是否支持该环境 */
  isSupported(): boolean
}

/**
 * HTTP 客户端接口
 */
export interface HttpClient {
  /** 请求拦截器 */
  interceptors: {
    request: InterceptorManager<RequestInterceptor>
    response: InterceptorManager<ResponseInterceptor>
    error: InterceptorManager<ErrorInterceptor>
  }

  /** 发送请求 */
  request<T = any>(config: RequestConfig): Promise<ResponseData<T>>

  /** GET 请求 */
  get<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>

  /** POST 请求 */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>

  /** PUT 请求 */
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>

  /** DELETE 请求 */
  delete<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>

  /** PATCH 请求 */
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>>

  /** HEAD 请求 */
  head<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>

  /** OPTIONS 请求 */
  options<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>>

  /** 取消所有请求 */
  cancelAll(reason?: string): void

  /** 获取活跃请求数量 */
  getActiveRequestCount(): number

  /** 更新重试配置 */
  updateRetryConfig(config: Partial<RetryConfig>): void

  /** 获取当前配置 */
  getConfig(): HttpClientConfig

  /** 清空缓存 */
  clearCache(): Promise<void>

  /** 获取并发状态 */
  getConcurrencyStatus(): {
    activeCount: number
    queuedCount: number
    maxConcurrent: number
    maxQueueSize: number
  }

  /** 取消队列中的所有请求 */
  cancelQueue(reason?: string): void
}

/**
 * 严格类型的 HTTP 客户端接口
 */
export interface TypedHttpClient<TBaseResponse = any> extends HttpClient {
  request<T = TBaseResponse>(config: RequestConfig): Promise<ResponseData<T>>
  get<T = TBaseResponse>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
  post<T = TBaseResponse, D = any>(url: string, data?: D, config?: RequestConfig): Promise<ResponseData<T>>
  put<T = TBaseResponse, D = any>(url: string, data?: D, config?: RequestConfig): Promise<ResponseData<T>>
  delete<T = TBaseResponse>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
  patch<T = TBaseResponse, D = any>(url: string, data?: D, config?: RequestConfig): Promise<ResponseData<T>>
  head<T = TBaseResponse>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
  options<T = TBaseResponse>(url: string, config?: RequestConfig): Promise<ResponseData<T>>
}

/**
 * API 端点配置
 */
export interface ApiEndpoint<TResponse = any, TRequest = any> {
  url: string
  method: HttpMethod
  transform?: (data: any) => TResponse
  validate?: (data: TRequest) => boolean
}

/**
 * 类型化的请求配置
 */
export interface TypedRequestConfig<TData = any> extends Omit<RequestConfig, 'data'> {
  data?: TData
}

/**
 * 类型化的响应数据
 */
export interface TypedResponseData<TData = any> extends Omit<ResponseData, 'data'> {
  data: TData
}

/**
 * 状态码类型
 */
export type HttpStatusCode =
  | 200 | 201 | 202 | 204 // 成功
  | 400 | 401 | 403 | 404 | 409 | 422 | 429 // 客户端错误
  | 500 | 502 | 503 | 504 // 服务器错误

/**
 * 内容类型枚举
 */
export enum ContentType {
  JSON = 'application/json',
  FORM = 'application/x-www-form-urlencoded',
  MULTIPART = 'multipart/form-data',
  TEXT = 'text/plain',
  HTML = 'text/html',
  XML = 'application/xml',
  BINARY = 'application/octet-stream',
}

/**
 * 请求优先级
 */
export enum RequestPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * 扩展的请求配置
 */
export interface ExtendedRequestConfig extends RequestConfig {
  /** 请求优先级 */
  priority?: RequestPriority
  /** 请求标签（用于分组和统计） */
  tags?: string[]
  /** 请求元数据 */
  metadata?: Record<string, any>
  /** 是否跳过拦截器 */
  skipInterceptors?: boolean
  /** 自定义验证函数 */
  validate?: (response: ResponseData) => boolean
}
