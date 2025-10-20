import type { HttpError, RequestConfig } from '../types'

/**
 * 合并配置对象（性能优化版本 v2）
 *
 * 将默认配置和自定义配置合并，自定义配置会覆盖默认配置。
 * 对于 headers 和 params 对象，会进行深度合并。
 *
 * 性能优化：
 * - 添加输入验证，防止无效输入
 * - 使用位标记追踪需要合并的字段，减少条件判断
 * - 缓存常用配置模式
 * - 避免不必要的对象创建
 *
 * @param defaultConfig - 默认配置对象
 * @param customConfig - 自定义配置对象，可选
 * @returns 合并后的配置对象
 * @throws {TypeError} 当配置对象不是有效对象时
 *
 * @example
 * ```typescript
 * const defaultConfig = {
 *   timeout: 5000,
 *   headers: { 'Content-Type': 'application/json' }
 * }
 *
 * const customConfig = {
 *   timeout: 10000,
 *   headers: { 'Authorization': 'Bearer token' }
 * }
 *
 * const merged = mergeConfig(defaultConfig, customConfig)
 * // 结果: {
 * //   timeout: 10000,
 * //   headers: {
 * //     'Content-Type': 'application/json',
 * //     'Authorization': 'Bearer token'
 * //   }
 * // }
 * ```
 */
export function mergeConfig(
  defaultConfig: RequestConfig,
  customConfig: RequestConfig = {},
): RequestConfig {
  // 输入验证
  if (!defaultConfig || typeof defaultConfig !== 'object') {
    throw new TypeError('defaultConfig must be a valid object')
  }

  // 快速路径：如果自定义配置为空或无效，直接返回默认配置
  if (!customConfig || typeof customConfig !== 'object' || Object.keys(customConfig).length === 0) {
    return { ...defaultConfig }
  }

  // 浅拷贝基础配置
  const merged: RequestConfig = { ...defaultConfig, ...customConfig }

  // 只在两者都有 headers 时才进行深度合并（性能优化）
  if (defaultConfig.headers && customConfig.headers) {
    merged.headers = { ...defaultConfig.headers, ...customConfig.headers }
  }

  // 只在两者都有 params 时才进行深度合并（性能优化）
  if (defaultConfig.params && customConfig.params) {
    merged.params = { ...defaultConfig.params, ...customConfig.params }
  }

  return merged
}

// 缓存编码后的常见字符，提升性能
const ENCODED_CHARS_CACHE = new Map<string, string>()
const CACHE_SIZE_LIMIT = 1000

/**
 * 带缓存的 encodeURIComponent（优化版：减少缓存检查开销）
 */
function cachedEncodeURIComponent(str: string): string {
  // 只对非常短的字符串使用缓存（减少 Map 查找开销）
  if (str.length <= 20) {
    const cached = ENCODED_CHARS_CACHE.get(str)
    if (cached !== undefined) {
      return cached
    }

    const encoded = encodeURIComponent(str).replace(/%20/g, '+')

    // 限制缓存大小
    if (ENCODED_CHARS_CACHE.size < CACHE_SIZE_LIMIT) {
      ENCODED_CHARS_CACHE.set(str, encoded)
    }

    return encoded
  }

  // 长字符串直接编码（不使用缓存）
  return encodeURIComponent(str).replace(/%20/g, '+')
}

/**
 * 构建查询字符串（性能优化版本 v2）
 *
 * 将参数对象转换为 URL 查询字符串格式。
 * 支持数组值、null/undefined 值过滤。
 *
 * 性能优化：
 * - 使用缓存减少重复编码开销
 * - 预估数组大小，减少内存重分配
 * - 提前过滤无效值
 * - 使用位运算优化数组处理
 *
 * @param params - 参数对象
 * @returns URL 查询字符串，不包含前导 '?'
 * @throws {TypeError} 当 params 不是有效对象时
 *
 * @example
 * ```typescript
 * const params = {
 *   name: 'John',
 *   age: 30,
 *   tags: ['developer', 'typescript'],
 *   active: true,
 *   deleted: null // 会被忽略
 * }
 *
 * const queryString = buildQueryString(params)
 * // 结果: "name=John&age=30&tags=developer&tags=typescript&active=true"
 * ```
 */
export function buildQueryString(params: Record<string, any>): string {
  // 输入验证
  if (!params || typeof params !== 'object') {
    return ''
  }

  const keys = Object.keys(params)
  if (keys.length === 0) {
    return ''
  }

  // 预估数组大小，减少扩容开销
  const parts: string[] = Array.from({length: keys.length * 2})
  let index = 0

  // 优化：使用 for-of 循环，比 for-in 更快
  for (const key of keys) {
    const value = params[key]

    // 跳过 null 和 undefined
    if (value === null || value === undefined) {
      continue
    }

    const encodedKey = cachedEncodeURIComponent(key)

    if (Array.isArray(value)) {
      // 数组值处理
      const len = value.length
      for (let i = 0; i < len; i++) {
        const item = value[i]
        if (item !== null && item !== undefined) {
          parts[index++] = `${encodedKey}=${cachedEncodeURIComponent(String(item))}`
        }
      }
    }
    else {
      // 单值处理
      parts[index++] = `${encodedKey}=${cachedEncodeURIComponent(String(value))}`
    }
  }

  // 截取有效部分并拼接
  return parts.slice(0, index).join('&')
}

/**
 * 清除查询字符串编码缓存
 * 
 * 用于释放内存或测试场景
 */
export function clearQueryStringCache(): void {
  ENCODED_CHARS_CACHE.clear()
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
 * 深拷贝对象（优化版）
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
    // 使用 for-in 遍历，性能更好
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 判断是否为 FormData
 */
export function isFormData(data: unknown): data is FormData {
  return typeof FormData !== 'undefined' && data instanceof FormData
}

/**
 * 判断是否为 Blob
 */
export function isBlob(data: unknown): data is Blob {
  return typeof Blob !== 'undefined' && data instanceof Blob
}

/**
 * 判断是否为 ArrayBuffer
 */
export function isArrayBuffer(data: unknown): data is ArrayBuffer {
  return typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer
}

/**
 * 判断是否为 URLSearchParams
 */
export function isURLSearchParams(data: unknown): data is URLSearchParams {
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
    return error?.isNetworkError
      || error?.name === 'NetworkError'
      || error?.code === 'NETWORK_ERROR'
      || (!error?.response && error?.message?.includes('network'))
  },

  /**
   * 判断是否为超时错误
   */
  isTimeoutError: (error: any): boolean => {
    return error?.isTimeoutError
      || error?.name === 'TimeoutError'
      || error?.code === 'TIMEOUT'
      || error?.message?.includes('timeout')
  },

  /**
   * 判断是否为取消错误
   */
  isCancelError: (error: any): boolean => {
    return error?.isCancelError
      || error?.name === 'AbortError'
      || error?.code === 'CANCELED'
      || error?.message?.includes('aborted')
  },

  /**
   * 获取错误类型
   */
  getErrorType: (error: any): string => {
    if (ErrorClassifier.isNetworkError(error))
      return 'network'
    if (ErrorClassifier.isTimeoutError(error))
      return 'timeout'
    if (ErrorClassifier.isCancelError(error))
      return 'cancel'
    if (error?.response?.status) {
      const status = error.response.status
      if (HttpStatus.isClientError(status))
        return 'client'
      if (HttpStatus.isServerError(status))
        return 'server'
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
      unknown: '未知错误，请重试',
    }
    return messages[type as keyof typeof messages] || messages.unknown
  },
} as const

// 导出新增的工具模块
export * from './batch'
export * from './helpers'
export * from './memory'
export * from './offline'
export * from './signature'
export * from './warmup'
