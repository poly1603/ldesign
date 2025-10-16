import type {
  ErrorInterceptor,
  HttpError,
  RequestInterceptor,
  ResponseInterceptor,
} from '../types'

/**
 * 请求日志拦截器
 */
export const requestLoggerInterceptor: RequestInterceptor = (config) => {
  // eslint-disable-next-line no-console
  console.log(`[HTTP Request] ${config.method} ${config.url}`, {
    headers: config.headers,
    data: config.data,
    params: config.params,
  })
  return config
}

/**
 * 响应日志拦截器
 */
export const responseLoggerInterceptor: ResponseInterceptor = (response) => {
  // eslint-disable-next-line no-console
  console.log(`[HTTP Response] ${response.config.method} ${response.config.url}`, {
    status: response.status,
    data: response.data
  })
  return response
}

/**
 * 错误日志拦截器
 */
export const errorLoggerInterceptor: ErrorInterceptor = (error) => {
  console.error(`[HTTP Error] ${error.config?.url}`, {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    response: error.response?.data,
  })
  return error
}

/**
 * 认证拦截器工厂
 */
export function createAuthInterceptor(
  getToken: () => string | null,
): RequestInterceptor {
  return (config) => {
    const token = getToken()
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
    return config
  }
}

/**
 * 基础 URL 拦截器工厂
 */
export function createBaseURLInterceptor(baseURL: string): RequestInterceptor {
  return (config) => {
    if (!config.baseURL && !config.url?.startsWith('http')) {
      config.baseURL = baseURL
    }
    return config
  }
}

/**
 * 请求 ID 拦截器
 */
export const requestIdInterceptor: RequestInterceptor = (config) => {
  const requestId = Math.random().toString(36).substring(2, 15)
  config.headers = {
    ...config.headers,
    'X-Request-ID': requestId,
  }
  return config
}

/**
 * 时间戳拦截器
 */
export const timestampInterceptor: RequestInterceptor = (config) => {
  const timestamp = Date.now()

  // 为 GET 请求添加时间戳参数防止缓存
  if (config.method === 'GET') {
    config.params = {
      ...config.params,
      _t: timestamp,
    }
  }

  // 添加时间戳头部
  config.headers = {
    ...config.headers,
    'X-Timestamp': timestamp.toString(),
  }

  return config
}

/**
 * 内容类型拦截器
 */
export const contentTypeInterceptor: RequestInterceptor = (config) => {
  if (
    config.data
    && !config.headers?.['Content-Type']
    && !config.headers?.['content-type']
  ) {
    if (typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      }
    }
  }
  return config
}

/**
 * 响应时间拦截器
 */
export function createResponseTimeInterceptor(): {
  request: RequestInterceptor
  response: ResponseInterceptor
} {
  const startTimes = new Map<string, number>()

  return {
    request: (config) => {
      const requestId
        = config.headers?.['X-Request-ID'] || Math.random().toString(36)
      startTimes.set(requestId, Date.now())
      config.headers = {
        ...config.headers,
        'X-Request-ID': requestId,
      }
      return config
    },
    response: (response) => {
      const requestId = response.config.headers?.['X-Request-ID']
      if (requestId && startTimes.has(requestId)) {
        const startTime = startTimes.get(requestId)!
        const duration = Date.now() - startTime
        // eslint-disable-next-line no-console
        console.log(`[Response Time] ${response.config.url}: ${duration}ms`)
        startTimes.delete(requestId)
      }
      return response
    },
  }
}

/**
 * 状态码处理拦截器
 */
export const statusCodeInterceptor: ResponseInterceptor = (response) => {
  // 可以在这里处理特定的状态码
  if (response.status >= 400) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
  }
  return response
}

/**
 * 数据转换拦截器工厂
 */
export function createDataTransformInterceptor<T, R>(
  transform: (data: T) => R,
): ResponseInterceptor<R> {
  return (response) => {
    return {
      ...response,
      data: transform(response.data as unknown as T),
    }
  }
}

/**
 * 重试拦截器工厂
 */
export function createRetryInterceptor(
  maxRetries: number = 3,
  retryDelay: number = 1000,
  retryCondition?: (error: HttpError) => boolean,
): ErrorInterceptor {
  return async (error) => {
    const config = error.config
    if (!config) {
      return error
    }

    // 检查是否应该重试
    const shouldRetry = retryCondition
      ? retryCondition(error)
      : error.isNetworkError || error.isTimeoutError

    if (!shouldRetry) {
      return error
    }

    // 获取当前重试次数
    const retryCount = (config as any).__retryCount || 0

    if (retryCount >= maxRetries) {
      return error
    }

    // 增加重试次数
    ;(config as any).__retryCount = retryCount + 1

    // 延迟重试
    await new Promise(resolve =>
      setTimeout(resolve, retryDelay * 2 ** retryCount),
    )

    // 这里需要重新发送请求，但由于拦截器的限制，我们只能返回错误
    // 实际的重试逻辑应该在 HttpClient 中实现
    return error
  }
}

// 简化的拦截器函数，用于测试
export function authInterceptor(options: any = {}) {
  const {
    tokenKey = 'accessToken',
    headerName = 'Authorization',
    tokenPrefix = 'Bearer',
  } = options

  return {
    request: (config: any) => {
      const token = localStorage.getItem(tokenKey)
      if (token) {
        config.headers = config.headers || {}
        config.headers[headerName] = `${tokenPrefix} ${token}`
      }
      return config
    },
    responseError: (error: any) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(tokenKey)
      }
      return error
    },
  }
}

export function loggingInterceptor(options: any = {}) {
  const { level = 'info', logger = console } = options

  return {
    request: (config: any) => {
      if (level === 'info' || level === 'debug') {
        logger.log('Request:', {
          method: config.method,
          url: config.url,
          headers: config.headers,
          data: config.data,
        })
      }
      return config
    },
    response: (response: any) => {
      if (level === 'info' || level === 'debug') {
        logger.log('Response:', {
          status: response.status,
          data: response.data,
          headers: response.headers,
        })
      }
      return response
    },
    responseError: (error: any) => {
      logger.error('Error:', {
        message: error.message,
        config: error.config,
        response: error.response,
      })
      return error
    },
  }
}

export function errorHandlingInterceptor(options: any = {}) {
  const { customHandler } = options

  return {
    responseError: (error: any) => {
      if (customHandler) {
        return customHandler(error)
      }

      // 默认错误处理
      if (error.isNetworkError) {
        error.userMessage = '网络连接失败，请检查网络设置'
      }
      else if (error.isTimeoutError) {
        error.userMessage = '请求超时，请重试'
      }
      else if (error.response?.status >= 500) {
        error.userMessage = '服务器内部错误'
      }
      else if (error.response?.status >= 400) {
        error.userMessage = `请求失败 (${error.response.status})`
      }

      return error
    },
  }
}

export function timeoutInterceptor(options: any = {}) {
  const { timeout = 5000 } = options

  return {
    request: (config: any) => {
      if (!config.timeout) {
        config.timeout = timeout
      }
      return config
    },
    responseError: (error: any) => {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        error.isTimeoutError = true
        error.message = 'Request timeout'
      }
      return error
    },
  }
}

export function retryInterceptor(options: any = {}) {
  const { maxAttempts = 3, delay = 1000 } = options

  return {
    request: (config: any) => {
      if (!config.retry) {
        config.retry = { maxAttempts, delay }
      }
      return config
    },
  }
}

export function cacheInterceptor(options: any = {}) {
  const { enabled = true, ttl = 300000, methods = ['GET'] } = options

  return {
    request: (config: any) => {
      // 不覆盖现有的缓存配置
      if (!config.cache) {
        const method = config.method?.toUpperCase() || 'GET'
        const shouldCache = enabled && methods.includes(method)
        config.cache = { enabled: shouldCache, ttl }
      }
      return config
    },
  }
}
