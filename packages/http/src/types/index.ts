/**
 * HTTP 请求方法类型
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'

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
  /** 原始错误 */
  cause?: Error
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
  use: (fulfilled: T, rejected?: ErrorInterceptor) => number
  eject: (id: number) => void
  clear: () => void
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
  get: (key: string) => Promise<any> | any
  set: (key: string, value: any, ttl?: number) => Promise<void> | void
  delete: (key: string) => Promise<void> | void
  clear: () => Promise<void> | void
}

/**
 * 并发控制配置
 */
export interface ConcurrencyConfig {
  /** 最大并发数 */
  maxConcurrent?: number
  /** 队列大小限制 */
  maxQueueSize?: number
  /** 是否启用请求去重 */
  deduplication?: boolean
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
  request: <T = any>(config: RequestConfig) => Promise<ResponseData<T>>
  /** 是否支持该环境 */
  isSupported: () => boolean
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
  request: <T = any>(config: RequestConfig) => Promise<ResponseData<T>>

  /** GET 请求 */
  get: <T = any>(url: string, config?: RequestConfig) => Promise<ResponseData<T>>

  /** POST 请求 */
  post: <T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>

  /** PUT 请求 */
  put: <T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>

  /** DELETE 请求 */
  delete: <T = any>(url: string, config?: RequestConfig) => Promise<ResponseData<T>>

  /** PATCH 请求 */
  patch: <T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>

  /** HEAD 请求 */
  head: <T = any>(url: string, config?: RequestConfig) => Promise<ResponseData<T>>

  /** OPTIONS 请求 */
  options: <T = any>(
    url: string,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>

  /** 取消所有请求 */
  cancelAll: (reason?: string) => void

  /** 获取活跃请求数量 */
  getActiveRequestCount: () => number

  /** 更新重试配置 */
  updateRetryConfig: (config: Partial<RetryConfig>) => void

  /** 获取当前配置 */
  getConfig: () => HttpClientConfig

  /** 清空缓存 */
  clearCache: () => Promise<void>

  /** 获取并发状态 */
  getConcurrencyStatus: () => {
    activeCount: number
    queuedCount: number
    maxConcurrent: number
    maxQueueSize: number
  }

  /** 取消队列中的所有请求 */
  cancelQueue: (reason?: string) => void

  /** 上传文件 */
  upload: (
    url: string,
    file: File | File[],
    config?: any
  ) => Promise<any>

  /** 下载文件 */
  download: (url: string, config?: any) => Promise<any>
}

/**
 * 严格类型的 HTTP 客户端接口
 */
export interface TypedHttpClient<TBaseResponse = any> extends HttpClient {
  request: <T = TBaseResponse>(config: RequestConfig) => Promise<ResponseData<T>>
  get: <T = TBaseResponse>(
    url: string,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>
  post: <T = TBaseResponse, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>
  put: <T = TBaseResponse, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>
  delete: <T = TBaseResponse>(
    url: string,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>
  patch: <T = TBaseResponse, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>
  head: <T = TBaseResponse>(
    url: string,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>
  options: <T = TBaseResponse>(
    url: string,
    config?: RequestConfig
  ) => Promise<ResponseData<T>>

  /** 上传文件 */
  upload: (
    url: string,
    file: File | File[],
    config?: any
  ) => Promise<any>

  /** 下载文件 */
  download: (url: string, config?: any) => Promise<any>
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
export interface TypedRequestConfig<TData = any>
  extends Omit<RequestConfig, 'data'> {
  data?: TData
}

/**
 * 类型化的响应数据
 */
export interface TypedResponseData<TData = any>
  extends Omit<ResponseData, 'data'> {
  data: TData
}

/**
 * 状态码类型
 */
export type HttpStatusCode =
  | 200
  | 201
  | 202
  | 204 // 成功
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429 // 客户端错误
  | 500
  | 502
  | 503
  | 504 // 服务器错误

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

/**
 * 严格的类型化请求配置
 */
export interface StrictRequestConfig<TData = any, TParams = any> extends Omit<RequestConfig, 'data' | 'params'> {
  /** 类型化的请求体数据 */
  data?: TData
  /** 类型化的请求参数 */
  params?: TParams
}

/**
 * 严格的类型化响应数据
 */
export interface StrictResponseData<TData = any> extends Omit<ResponseData, 'data'> {
  /** 类型化的响应数据 */
  data: TData
}

/**
 * API 端点定义
 */
export interface ApiEndpointDefinition<TRequest = any, TResponse = any, TParams = any> {
  /** 端点路径 */
  path: string
  /** HTTP 方法 */
  method: HttpMethod
  /** 请求数据类型 */
  requestType?: new () => TRequest
  /** 响应数据类型 */
  responseType?: new () => TResponse
  /** 参数类型 */
  paramsType?: new () => TParams
  /** 端点描述 */
  description?: string
  /** 是否需要认证 */
  requiresAuth?: boolean
  /** 缓存配置 */
  cache?: CacheConfig
  /** 重试配置 */
  retry?: RetryConfig
}

/**
 * 类型化的 HTTP 客户端方法
 */
export interface TypedHttpMethods {
  /** GET 请求 */
  get: <TResponse = any, TParams = any>(
    url: string,
    config?: StrictRequestConfig<never, TParams>
  ) => Promise<StrictResponseData<TResponse>>

  /** POST 请求 */
  post: <TResponse = any, TData = any, TParams = any>(
    url: string,
    data?: TData,
    config?: StrictRequestConfig<TData, TParams>
  ) => Promise<StrictResponseData<TResponse>>

  /** PUT 请求 */
  put: <TResponse = any, TData = any, TParams = any>(
    url: string,
    data?: TData,
    config?: StrictRequestConfig<TData, TParams>
  ) => Promise<StrictResponseData<TResponse>>

  /** PATCH 请求 */
  patch: <TResponse = any, TData = any, TParams = any>(
    url: string,
    data?: TData,
    config?: StrictRequestConfig<TData, TParams>
  ) => Promise<StrictResponseData<TResponse>>

  /** DELETE 请求 */
  delete: <TResponse = any, TParams = any>(
    url: string,
    config?: StrictRequestConfig<never, TParams>
  ) => Promise<StrictResponseData<TResponse>>

  /** HEAD 请求 */
  head: <TParams = any>(
    url: string,
    config?: StrictRequestConfig<never, TParams>
  ) => Promise<StrictResponseData<never>>

  /** OPTIONS 请求 */
  options: <TResponse = any, TParams = any>(
    url: string,
    config?: StrictRequestConfig<never, TParams>
  ) => Promise<StrictResponseData<TResponse>>
}

/**
 * 条件类型：根据方法确定数据类型
 */
export type RequestDataByMethod<TMethod extends HttpMethod, TData = any> =
  TMethod extends 'GET' | 'HEAD' | 'DELETE' ? never : TData

/**
 * 条件类型：根据响应类型确定数据类型
 */
export type ResponseDataByType<TResponseType extends RequestConfig['responseType'], TData = any> =
  TResponseType extends 'json' ? TData :
    TResponseType extends 'text' ? string :
      TResponseType extends 'blob' ? Blob :
        TResponseType extends 'arrayBuffer' ? ArrayBuffer :
          TResponseType extends 'stream' ? ReadableStream :
            TData

/**
 * 工具类型：提取 Promise 的类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T

/**
 * 工具类型：使某些属性必需
 */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * 工具类型：深度只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 工具类型：深度可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 类型守卫：检查是否为 HTTP 错误
 */
export function isHttpError(error: any): error is HttpError {
  return error && typeof error === 'object' && 'config' in error
}

/**
 * 类型守卫：检查是否为网络错误
 */
export function isNetworkError(error: any): error is HttpError & { isNetworkError: true } {
  return isHttpError(error) && error.isNetworkError === true
}

/**
 * 类型守卫：检查是否为超时错误
 */
export function isTimeoutError(error: any): error is HttpError & { isTimeoutError: true } {
  return isHttpError(error) && error.isTimeoutError === true
}

/**
 * 类型守卫：检查是否为取消错误
 */
export function isCancelError(error: any): error is HttpError & { isCancelError: true } {
  return isHttpError(error) && error.isCancelError === true
}

/**
 * 类型守卫：检查响应状态码
 */
export function isSuccessStatus(status: number): status is 200 | 201 | 202 | 204 {
  return status >= 200 && status < 300
}

/**
 * 类型守卫：检查是否为客户端错误
 */
export function isClientError(status: number): status is 400 | 401 | 403 | 404 | 409 | 422 | 429 {
  return status >= 400 && status < 500
}

/**
 * 类型守卫：检查是否为服务器错误
 */
export function isServerError(status: number): status is 500 | 502 | 503 | 504 {
  return status >= 500 && status < 600
}

export type {
  DownloadChunk,
  DownloadConfig,
  DownloadProgress,
  DownloadResult,
} from '../utils/download'

// 重新导出上传下载相关类型
export type {
  ChunkInfo,
  FileValidationError,
  UploadConfig,
  UploadProgress,
  UploadResult,
} from '../utils/upload'
