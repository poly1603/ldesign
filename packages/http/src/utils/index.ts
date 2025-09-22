import type { HttpError, RequestConfig } from '../types'

/**
 * 合并配置对象
 */
export function mergeConfig(
  defaultConfig: RequestConfig,
  customConfig: RequestConfig = {},
): RequestConfig {
  const merged: RequestConfig = { ...defaultConfig }

  // 合并基础属性
  Object.keys(customConfig).forEach((key) => {
    const value = customConfig[key as keyof RequestConfig]
    if (value !== undefined) {
      if (key === 'headers' && typeof value === 'object' && value !== null) {
        merged.headers = { ...merged.headers, ...value }
      }
      else if (
        key === 'params'
        && typeof value === 'object'
        && value !== null
      ) {
        merged.params = { ...merged.params, ...value }
      }
      else {
        ;(merged as any)[key] = value
      }
    }
  })

  return merged
}

/**
 * 构建查询字符串
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          searchParams.append(key, String(item))
        })
      }
      else {
        searchParams.append(key, String(value))
      }
    }
  })

  return searchParams.toString()
}

/**
 * 构建完整的 URL
 */
export function buildURL(
  url: string,
  baseURL?: string,
  params?: Record<string, any>,
): string {
  let fullURL = url

  // 处理 baseURL
  if (baseURL && !isAbsoluteURL(url)) {
    fullURL = combineURLs(baseURL, url)
  }

  // 处理查询参数
  if (params && Object.keys(params).length > 0) {
    const queryString = buildQueryString(params)
    if (queryString) {
      const separator = fullURL.includes('?') ? '&' : '?'
      fullURL += separator + queryString
    }
  }

  return fullURL
}

/**
 * 判断是否为绝对 URL
 */
export function isAbsoluteURL(url: string): boolean {
  return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

/**
 * 合并 URL
 */
export function combineURLs(baseURL: string, relativeURL: string): string {
  return relativeURL
    ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}`
    : baseURL
}

/**
 * 创建 HTTP 错误
 */
export function createHttpError(
  message: string,
  config?: RequestConfig,
  code?: string,
  response?: any,
): HttpError {
  const error = new Error(message) as HttpError
  error.config = config
  error.code = code
  error.response = response
  error.isNetworkError = false
  error.isTimeoutError = false
  error.isCancelError = false

  // 判断错误类型
  if (code === 'ECONNABORTED' || message.includes('timeout')) {
    error.isTimeoutError = true
  }
  else if (code === 'NETWORK_ERROR' || message.includes('Network Error')) {
    error.isNetworkError = true
  }
  else if (code === 'CANCELED' || message.includes('canceled')) {
    error.isCancelError = true
  }

  return error
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15)
    + Math.random().toString(36).substring(2, 15)
  )
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    Object.keys(obj).forEach((key) => {
      ;(cloned as any)[key] = deepClone((obj as any)[key])
    })
    return cloned
  }

  return obj
}

/**
 * 判断是否为 FormData
 */
export function isFormData(data: any): data is FormData {
  return typeof FormData !== 'undefined' && data instanceof FormData
}

/**
 * 判断是否为 Blob
 */
export function isBlob(data: any): data is Blob {
  return typeof Blob !== 'undefined' && data instanceof Blob
}

/**
 * 判断是否为 ArrayBuffer
 */
export function isArrayBuffer(data: any): data is ArrayBuffer {
  return typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer
}

/**
 * 判断是否为 URLSearchParams
 */
export function isURLSearchParams(data: any): data is URLSearchParams {
  return (
    typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams
  )
}

/**
 * HTTP状态码分类工具函数
 */
export const HttpStatus = {
  isSuccess: (status: number): boolean => status >= 200 && status < 300,
  isRedirect: (status: number): boolean => status >= 300 && status < 400,
  isClientError: (status: number): boolean => status >= 400 && status < 500,
  isServerError: (status: number): boolean => status >= 500,
  isAuthError: (status: number): boolean => status === 401 || status === 403,
  isNotFound: (status: number): boolean => status === 404,
  isTimeout: (status: number): boolean => status === 408,
} as const

/**
 * 错误分类工具函数
 */
export const ErrorClassifier = {
  /**
   * 判断是否为网络错误
   */
  isNetworkError: (error: any): boolean => {
    return error?.isNetworkError ||
           error?.name === 'NetworkError' ||
           error?.code === 'NETWORK_ERROR' ||
           (!error?.response && error?.message?.includes('network'))
  },

  /**
   * 判断是否为超时错误
   */
  isTimeoutError: (error: any): boolean => {
    return error?.isTimeoutError ||
           error?.name === 'TimeoutError' ||
           error?.code === 'TIMEOUT' ||
           error?.message?.includes('timeout')
  },

  /**
   * 判断是否为取消错误
   */
  isCancelError: (error: any): boolean => {
    return error?.isCancelError ||
           error?.name === 'AbortError' ||
           error?.code === 'CANCELED' ||
           error?.message?.includes('aborted')
  },

  /**
   * 获取错误类型
   */
  getErrorType: (error: any): string => {
    if (ErrorClassifier.isNetworkError(error)) return 'network'
    if (ErrorClassifier.isTimeoutError(error)) return 'timeout'
    if (ErrorClassifier.isCancelError(error)) return 'cancel'
    if (error?.response?.status) {
      const status = error.response.status
      if (HttpStatus.isClientError(status)) return 'client'
      if (HttpStatus.isServerError(status)) return 'server'
    }
    return 'unknown'
  },

  /**
   * 获取用户友好的错误消息
   */
  getUserFriendlyMessage: (error: any): string => {
    const type = ErrorClassifier.getErrorType(error)
    const messages = {
      network: '网络连接失败，请检查网络设置',
      timeout: '请求超时，请重试',
      cancel: '请求已取消',
      client: `请求失败 (${error?.response?.status || '客户端错误'})`,
      server: '服务器内部错误，请稍后重试',
      unknown: '未知错误，请重试'
    }
    return messages[type as keyof typeof messages] || messages.unknown
  }
} as const
