// HTTP工具包类型定义

// HTTP方法枚举
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

// 响应类型枚举
export enum ResponseType {
  JSON = 'json',
  TEXT = 'text',
  BLOB = 'blob',
  ARRAYBUFFER = 'arraybuffer',
  DOCUMENT = 'document',
  STREAM = 'stream'
}

// HTTP状态码枚举
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

// 请求配置接口
export interface HttpConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  responseType?: ResponseType
  validateStatus?: (status: number) => boolean
}

// 请求选项接口
export interface RequestOptions extends HttpConfig {
  method?: HttpMethod
  url?: string
  data?: any
  params?: Record<string, any>
}

// 响应接口
export interface HttpResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestOptions
}

// 错误响应接口
export interface HttpError {
  message: string
  status?: number
  statusText?: string
  response?: HttpResponse
  config?: RequestOptions
}

// 拦截器接口
export interface RequestInterceptor {
  onFulfilled?: (config: RequestOptions) => RequestOptions | Promise<RequestOptions>
  onRejected?: (error: any) => any
}

export interface ResponseInterceptor {
  onFulfilled?: (response: HttpResponse) => HttpResponse | Promise<HttpResponse>
  onRejected?: (error: HttpError) => any
}

// HTTP插件配置接口
export interface HttpPluginConfig extends HttpConfig {
  enableInterceptors?: boolean
  enableRetry?: boolean
  retryCount?: number
  retryDelay?: number
}