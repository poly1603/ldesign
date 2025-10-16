/**
 * 基础类型定义模块
 * 
 * 定义HTTP相关的基础类型和接口
 */

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
  | 'CONNECT'
  | 'TRACE'

/**
 * 扩展的HTTP方法
 */
export type ExtendedHttpMethod = HttpMethod | 'PURGE' | 'LINK' | 'UNLINK'

/**
 * 请求配置接口
 */
export interface RequestConfig {
  /** 请求 URL */
  url?: string
  /** HTTP 方法 */
  method?: HttpMethod | string
  /** 请求头 */
  headers?: Record<string, string | string[]>
  /** 请求参数（GET 请求的查询参数） */
  params?: Record<string, unknown> | URLSearchParams
  /** 请求体数据 */
  data?: unknown
  /** 超时时间（毫秒） */
  timeout?: number
  /** 基础 URL */
  baseURL?: string
  /** 响应类型 */
  responseType?: ResponseType
  /** 是否携带凭证 */
  withCredentials?: boolean
  /** 取消信号 */
  signal?: AbortSignal
  /** 请求优先级 */
  priority?: Priority
  /** 缓存模式 */
  cache?: RequestCache
  /** 重定向模式 */
  redirect?: RequestRedirect
  /** 引荐来源 */
  referrer?: string
  /** 引荐策略 */
  referrerPolicy?: ReferrerPolicy
  /** 请求模式 */
  mode?: RequestMode
  /** 凭据模式 */
  credentials?: RequestCredentials
  /** 完整性元数据 */
  integrity?: string
  /** Keep-alive */
  keepalive?: boolean
  /** 验证器 */
  validateStatus?: (status: number) => boolean
  /** 最大内容长度 */
  maxContentLength?: number
  /** 最大响应体长度 */
  maxBodyLength?: number
  /** 进度回调 */
  onUploadProgress?: (progressEvent: ProgressEvent) => void
  onDownloadProgress?: (progressEvent: ProgressEvent) => void
  /** 元数据 */
  metadata?: Record<string, any>
  /** 重试配置 */
  retry?: RetryOptions
  /** 缓存配置 */
  cacheConfig?: CacheOptions
  /** 自定义配置 */
  [key: string]: unknown
}

/**
 * 响应类型
 */
export type ResponseType = 
  | 'json' 
  | 'text' 
  | 'blob' 
  | 'arrayBuffer' 
  | 'formData'
  | 'stream'
  | 'document'

/**
 * 请求优先级
 */
export type Priority = 'high' | 'normal' | 'low' | number

/**
 * 响应数据接口
 */
export interface ResponseData<T = unknown> {
  /** 响应数据 */
  data: T
  /** 状态码 */
  status: number
  /** 状态文本 */
  statusText: string
  /** 响应头 */
  headers: Headers | Record<string, string>
  /** 请求配置 */
  config: RequestConfig
  /** 请求对象 */
  request?: any
  /** 原始响应对象 */
  raw?: Response | any
  /** 响应时间 */
  duration?: number
  /** 是否从缓存 */
  fromCache?: boolean
  /** 缓存信息 */
  cacheInfo?: CacheInfo
}

/**
 * 进度事件
 */
export interface ProgressEvent {
  /** 是否可计算长度 */
  lengthComputable: boolean
  /** 已加载字节数 */
  loaded: number
  /** 总字节数 */
  total: number
  /** 进度百分比 (0-100) */
  percent?: number
  /** 速率 (bytes/s) */
  rate?: number
  /** 预估剩余时间 (ms) */
  estimated?: number
}

/**
 * 错误信息接口
 */
export interface HttpError extends Error {
  /** 错误名称 */
  name: 'HttpError'
  /** 错误代码 */
  code?: string | number
  /** HTTP状态码 */
  status?: number
  /** 状态文本 */
  statusText?: string
  /** 请求配置 */
  config?: RequestConfig
  /** 请求对象 */
  request?: any
  /** 响应数据 */
  response?: ResponseData
  /** 是否为网络错误 */
  isNetworkError?: boolean
  /** 是否为超时错误 */
  isTimeoutError?: boolean
  /** 是否为取消错误 */
  isCancelError?: boolean
  /** 是否为客户端错误 (4xx) */
  isClientError?: boolean
  /** 是否为服务器错误 (5xx) */
  isServerError?: boolean
  /** 原始错误 */
  cause?: Error | any
  /** 错误上下文 */
  context?: Record<string, any>
  /** 重试信息 */
  retryInfo?: {
    attempt: number
    maxAttempts: number
    delay: number
  }
}

/**
 * 重试选项
 */
export interface RetryOptions {
  /** 重试次数 */
  retries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number | ((retryCount: number) => number)
  /** 重试条件函数 */
  retryCondition?: (error: HttpError) => boolean
  /** 最大重试延迟 */
  maxRetryDelay?: number
  /** 是否使用指数退避 */
  exponentialBackoff?: boolean
  /** 退避因子 */
  backoffFactor?: number
  /** 重试的状态码 */
  retryStatusCodes?: number[]
  /** 重试的错误码 */
  retryErrorCodes?: string[]
  /** 重试回调 */
  onRetry?: (retryCount: number, error: HttpError) => void
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  /** 是否启用缓存 */
  enabled?: boolean
  /** 缓存时间（毫秒） */
  ttl?: number
  /** 缓存键生成函数 */
  keyGenerator?: (config: RequestConfig) => string
  /** 缓存策略 */
  strategy?: CacheStrategy
  /** 是否缓存错误响应 */
  cacheErrors?: boolean
  /** 缓存的状态码 */
  cacheStatusCodes?: number[]
  /** 排除的路径模式 */
  excludePatterns?: (string | RegExp)[]
  /** 包含的路径模式 */
  includePatterns?: (string | RegExp)[]
  /** 最大缓存大小 */
  maxSize?: number
  /** 缓存存储 */
  storage?: CacheStorage
}

/**
 * 缓存策略
 */
export type CacheStrategy = 
  | 'cache-first'
  | 'network-first'
  | 'cache-only'
  | 'network-only'
  | 'stale-while-revalidate'

/**
 * 缓存信息
 */
export interface CacheInfo {
  /** 是否命中缓存 */
  hit: boolean
  /** 缓存键 */
  key?: string
  /** 缓存时间 */
  cachedAt?: number
  /** 过期时间 */
  expiresAt?: number
  /** 缓存策略 */
  strategy?: CacheStrategy
}

/**
 * 缓存存储接口
 */
export interface CacheStorage {
  /** 获取缓存 */
  get: <T = any>(key: string) => Promise<T | undefined> | T | undefined
  /** 设置缓存 */
  set: <T = any>(key: string, value: T, options?: CacheSetOptions) => Promise<void> | void
  /** 删除缓存 */
  delete: (key: string) => Promise<boolean> | boolean
  /** 清空缓存 */
  clear: () => Promise<void> | void
  /** 是否存在 */
  has?: (key: string) => Promise<boolean> | boolean
  /** 获取所有键 */
  keys?: () => Promise<string[]> | string[]
  /** 获取大小 */
  size?: () => Promise<number> | number
}

/**
 * 缓存设置选项
 */
export interface CacheSetOptions {
  /** 过期时间（毫秒） */
  ttl?: number
  /** 标签 */
  tags?: string[]
  /** 元数据 */
  metadata?: Record<string, any>
}

/**
 * HTTP状态码枚举
 */
export enum HttpStatus {
  // 1xx 信息响应
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLY_HINTS = 103,

  // 2xx 成功
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  MULTI_STATUS = 207,
  ALREADY_REPORTED = 208,
  IM_USED = 226,

  // 3xx 重定向
  MULTIPLE_CHOICES = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  USE_PROXY = 305,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,

  // 4xx 客户端错误
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  IM_A_TEAPOT = 418,
  MISDIRECTED_REQUEST = 421,
  UNPROCESSABLE_ENTITY = 422,
  LOCKED = 423,
  FAILED_DEPENDENCY = 424,
  TOO_EARLY = 425,
  UPGRADE_REQUIRED = 426,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
  UNAVAILABLE_FOR_LEGAL_REASONS = 451,

  // 5xx 服务器错误
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
  VARIANT_ALSO_NEGOTIATES = 506,
  INSUFFICIENT_STORAGE = 507,
  LOOP_DETECTED = 508,
  NOT_EXTENDED = 510,
  NETWORK_AUTHENTICATION_REQUIRED = 511,
}

/**
 * 内容类型枚举
 */
export enum ContentType {
  // 文本类型
  JSON = 'application/json',
  JSONLD = 'application/ld+json',
  TEXT = 'text/plain',
  HTML = 'text/html',
  XML = 'application/xml',
  CSS = 'text/css',
  JAVASCRIPT = 'application/javascript',
  
  // 表单类型
  FORM = 'application/x-www-form-urlencoded',
  MULTIPART = 'multipart/form-data',
  
  // 二进制类型
  BINARY = 'application/octet-stream',
  PDF = 'application/pdf',
  ZIP = 'application/zip',
  GZIP = 'application/gzip',
  
  // 图片类型
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
  WEBP = 'image/webp',
  SVG = 'image/svg+xml',
  
  // 音频类型
  MP3 = 'audio/mpeg',
  OGG = 'audio/ogg',
  WAV = 'audio/wav',
  
  // 视频类型
  MP4 = 'video/mp4',
  WEBM = 'video/webm',
  OGV = 'video/ogg',
}

/**
 * 字符集枚举
 */
export enum Charset {
  UTF8 = 'utf-8',
  UTF16 = 'utf-16',
  UTF32 = 'utf-32',
  ASCII = 'ascii',
  ISO_8859_1 = 'iso-8859-1',
  WINDOWS_1252 = 'windows-1252',
}

/**
 * 创建类型化配置
 */
export function createTypedConfig<T = any>(config: RequestConfig): RequestConfig & { _type?: T } {
  return config
}

/**
 * 判断是否为HTTP错误
 */
export function isHttpError(error: any): error is HttpError {
  return error instanceof Error && error.name === 'HttpError'
}

/**
 * 判断是否为网络错误
 */
export function isNetworkError(error: any): boolean {
  return isHttpError(error) && error.isNetworkError === true
}

/**
 * 判断是否为超时错误
 */
export function isTimeoutError(error: any): boolean {
  return isHttpError(error) && error.isTimeoutError === true
}

/**
 * 判断是否为取消错误
 */
export function isCancelError(error: any): boolean {
  return isHttpError(error) && error.isCancelError === true
}

/**
 * 判断是否为客户端错误
 */
export function isClientError(error: any): boolean {
  if (isHttpError(error)) {
    return error.isClientError === true || (error.status !== undefined && error.status >= 400 && error.status < 500)
  }
  return false
}

/**
 * 判断是否为服务器错误
 */
export function isServerError(error: any): boolean {
  if (isHttpError(error)) {
    return error.isServerError === true || (error.status !== undefined && error.status >= 500)
  }
  return false
}