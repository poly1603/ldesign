/**
 * 拦截器中间件系统
 * 
 * 提供可组合、可复用的拦截器中间件模式
 */

import type {
  ErrorInterceptor,
  HttpError,
  RequestConfig,
  RequestInterceptor,
  ResponseData,
  ResponseInterceptor,
} from '../types'

/**
 * 中间件函数类型
 */
export type Middleware<TContext = any> = (
  context: TContext,
  next: () => Promise<TContext>,
) => Promise<TContext>

/**
 * 请求中间件类型
 */
export type RequestMiddleware = Middleware<RequestConfig>

/**
 * 响应中间件类型
 */
export type ResponseMiddleware<T = any> = Middleware<ResponseData<T>>

/**
 * 错误中间件类型
 */
export type ErrorMiddleware = (
  error: HttpError,
  next: (error: HttpError) => Promise<HttpError>,
) => Promise<HttpError>

/**
 * 组合多个请求中间件为一个拦截器
 * 
 * @param middlewares - 中间件数组
 * @returns 组合后的请求拦截器
 * 
 * @example
 * ```typescript
 * const logRequest: RequestMiddleware = async (config, next) => {
 *   
 *   return next()
 * }
 * 
 * const addTimestamp: RequestMiddleware = async (config, next) => {
 *   config.params = { ...config.params, _t: Date.now() }
 *   return next()
 * }
 * 
 * const interceptor = composeRequestMiddleware([logRequest, addTimestamp])
 * client.interceptors.request.use(interceptor)
 * ```
 */
export function composeRequestMiddleware(
  middlewares: RequestMiddleware[],
): RequestInterceptor {
  if (!Array.isArray(middlewares) || middlewares.length === 0) {
    return (config: RequestConfig) => config
  }

  return async (config: RequestConfig): Promise<RequestConfig> => {
    const index = 0

    async function dispatch(i: number, ctx: RequestConfig): Promise<RequestConfig> {
      if (i >= middlewares.length) {
        return ctx
      }

      const middleware = middlewares[i]!

      return middleware(ctx, () => dispatch(i + 1, ctx))
    }

    return dispatch(index, config)
  }
}

/**
 * 组合多个响应中间件为一个拦截器
 * 
 * @param middlewares - 中间件数组
 * @returns 组合后的响应拦截器
 * 
 * @example
 * ```typescript
 * const logResponse: ResponseMiddleware = async (response, next) => {
 *   
 *   return next()
 * }
 * 
 * const extractData: ResponseMiddleware = async (response, next) => {
 *   // 提取嵌套的数据字段
 *   if (response.data?.result) {
 *     response.data = response.data.result
 *   }
 *   return next()
 * }
 * 
 * const interceptor = composeResponseMiddleware([logResponse, extractData])
 * client.interceptors.response.use(interceptor)
 * ```
 */
export function composeResponseMiddleware<T = any>(
  middlewares: ResponseMiddleware<T>[],
): ResponseInterceptor<T> {
  if (!Array.isArray(middlewares) || middlewares.length === 0) {
    return (response: ResponseData<T>) => response
  }

  return async (response: ResponseData<T>): Promise<ResponseData<T>> => {
    const index = 0

    async function dispatch(i: number, ctx: ResponseData<T>): Promise<ResponseData<T>> {
      if (i >= middlewares.length) {
        return ctx
      }

      const middleware = middlewares[i]!

      return middleware(ctx, () => dispatch(i + 1, ctx))
    }

    return dispatch(index, response)
  }
}

/**
 * 组合多个错误中间件为一个拦截器
 * 
 * @param middlewares - 中间件数组
 * @returns 组合后的错误拦截器
 * 
 * @example
 * ```typescript
 * const logError: ErrorMiddleware = async (error, next) => {
 *   console.error('Error:', error.message)
 *   return next(error)
 * }
 * 
 * const retryOn5xx: ErrorMiddleware = async (error, next) => {
 *   if (error.response?.status >= 500) {
 *     // 自定义重试逻辑
 *   }
 *   return next(error)
 * }
 * 
 * const interceptor = composeErrorMiddleware([logError, retryOn5xx])
 * client.interceptors.error.use(interceptor)
 * ```
 */
export function composeErrorMiddleware(
  middlewares: ErrorMiddleware[],
): ErrorInterceptor {
  if (!Array.isArray(middlewares) || middlewares.length === 0) {
    return (error: HttpError) => error
  }

  return async (error: HttpError): Promise<HttpError> => {
    const index = 0

    async function dispatch(i: number, err: HttpError): Promise<HttpError> {
      if (i >= middlewares.length) {
        return err
      }

      const middleware = middlewares[i]!

      return middleware(err, nextError => dispatch(i + 1, nextError))
    }

    return dispatch(index, error)
  }
}

/**
 * 创建条件中间件
 * 
 * 只在满足条件时执行中间件
 * 
 * @param condition - 条件函数
 * @param middleware - 要执行的中间件
 * @returns 条件中间件
 * 
 * @example
 * ```typescript
 * const addAuthToken: RequestMiddleware = async (config, next) => {
 *   config.headers = { ...config.headers, Authorization: 'Bearer token' }
 *   return next()
 * }
 * 
 * // 只对 /api 路径的请求添加认证
 * const conditionalAuth = createConditionalMiddleware(
 *   (config) => config.url?.startsWith('/api'),
 *   addAuthToken
 * )
 * ```
 */
export function createConditionalMiddleware<TContext>(
  condition: (context: TContext) => boolean | Promise<boolean>,
  middleware: Middleware<TContext>,
): Middleware<TContext> {
  return async (context: TContext, next: () => Promise<TContext>): Promise<TContext> => {
    const shouldExecute = await condition(context)

    if (shouldExecute) {
      return middleware(context, next)
    }

    return next()
  }
}

/**
 * 创建请求路径匹配中间件
 * 
 * @param pattern - URL 匹配模式（正则或字符串）
 * @param middleware - 要执行的中间件
 * @returns 路径匹配中间件
 * 
 * @example
 * ```typescript
 * const logApiRequests: RequestMiddleware = async (config, next) => {
 *   
 *   return next()
 * }
 * 
 * // 只记录 API 请求
 * const apiLogger = createPathMatchMiddleware(/^\/api\//, logApiRequests)
 * ```
 */
export function createPathMatchMiddleware(
  pattern: string | RegExp,
  middleware: RequestMiddleware,
): RequestMiddleware {
  const matcher = typeof pattern === 'string'
    ? (url: string) => url.includes(pattern)
    : (url: string) => pattern.test(url)

  return createConditionalMiddleware(
    (config: RequestConfig) => {
      const url = config.url || ''
      return matcher(url)
    },
    middleware,
  )
}

/**
 * 创建方法匹配中间件
 * 
 * @param methods - HTTP 方法数组
 * @param middleware - 要执行的中间件
 * @returns 方法匹配中间件
 * 
 * @example
 * ```typescript
 * const addCsrfToken: RequestMiddleware = async (config, next) => {
 *   config.headers = { ...config.headers, 'X-CSRF-Token': getCsrfToken() }
 *   return next()
 * }
 * 
 * // 只对写操作添加 CSRF token
 * const csrfProtection = createMethodMatchMiddleware(
 *   ['POST', 'PUT', 'PATCH', 'DELETE'],
 *   addCsrfToken
 * )
 * ```
 */
export function createMethodMatchMiddleware(
  methods: string[],
  middleware: RequestMiddleware,
): RequestMiddleware {
  const methodSet = new Set(methods.map(m => m.toUpperCase()))

  return createConditionalMiddleware(
    (config: RequestConfig) => {
      const method = (config.method || 'GET').toUpperCase()
      return methodSet.has(method)
    },
    middleware,
  )
}

/**
 * 创建计时中间件
 * 
 * 自动测量请求执行时间
 * 
 * @param onComplete - 完成回调
 * @returns 计时中间件
 * 
 * @example
 * ```typescript
 * const timingMiddleware = createTimingMiddleware((duration, config) => {
 *   
 * })
 * ```
 */
export function createTimingMiddleware(
  onComplete?: (duration: number, config: RequestConfig) => void,
): RequestMiddleware {
  return async (config: RequestConfig, next: () => Promise<RequestConfig>): Promise<RequestConfig> => {
    const startTime = Date.now()

    try {
      return await next()
    }
    finally {
      const duration = Date.now() - startTime
      onComplete?.(duration, config)
    }
  }
}

/**
 * 创建缓存中间件
 * 
 * 缓存中间件执行结果
 * 
 * @param options - 缓存选项
 * @param options.ttl - 缓存过期时间（毫秒），默认60000
 * @param options.keyGenerator - 缓存键生成函数
 * @param options.middleware - 要缓存的中间件
 * @returns 缓存中间件
 * 
 * @example
 * ```typescript
 * const cachedMiddleware = createCacheMiddleware({
 *   ttl: 60000, // 1分钟
 *   keyGenerator: (config) => config.url,
 *   middleware: expensiveMiddleware
 * })
 * ```
 */
export function createCacheMiddleware<TContext>(options: {
  ttl?: number
  keyGenerator: (context: TContext) => string
  middleware: Middleware<TContext>
}): Middleware<TContext> {
  const { ttl = 60000, keyGenerator, middleware } = options
  const cache = new Map<string, { value: TContext, expiry: number }>()

  return async (context: TContext, next: () => Promise<TContext>): Promise<TContext> => {
    const key = keyGenerator(context)
    const now = Date.now()

    // 检查缓存
    const cached = cache.get(key)
    if (cached && cached.expiry > now) {
      return cached.value
    }

    // 执行中间件
    const result = await middleware(context, next)

    // 存入缓存
    cache.set(key, {
      value: result,
      expiry: now + ttl,
    })

    return result
  }
}

/**
 * 创建重试中间件
 * 
 * 自动重试失败的中间件
 * 
 * @param options - 重试选项
 * @param options.maxAttempts - 最大重试次数，默认3次
 * @param options.delay - 重试延迟（毫秒），默认1000
 * @param options.shouldRetry - 判断是否应该重试的函数
 * @param options.middleware - 要重试的中间件
 * @returns 重试中间件
 * 
 * @example
 * ```typescript
 * const retryMiddleware = createRetryMiddleware({
 *   maxAttempts: 3,
 *   delay: 1000,
 *   shouldRetry: (error) => error.status === 503,
 *   middleware: unstableMiddleware
 * })
 * ```
 */
export function createRetryMiddleware<TContext>(options: {
  maxAttempts?: number
  delay?: number
  shouldRetry?: (error: any, attempt: number) => boolean
  middleware: Middleware<TContext>
}): Middleware<TContext> {
  const {
    maxAttempts = 3,
    delay = 1000,
    shouldRetry = () => true,
    middleware,
  } = options

  return async (context: TContext, next: () => Promise<TContext>): Promise<TContext> => {
    let lastError: any

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await middleware(context, next)
      }
      catch (error) {
        lastError = error

        if (attempt < maxAttempts && shouldRetry(error, attempt)) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
        else {
          throw error
        }
      }
    }

    throw lastError
  }
}

/**
 * 创建管道中间件
 * 
 * 按顺序执行一系列转换函数
 * 
 * @param transforms - 转换函数数组
 * @returns 管道中间件
 * 
 * @example
 * ```typescript
 * const pipeline = createPipelineMiddleware([
 *   (config) => ({ ...config, headers: { ...config.headers, 'X-Custom': 'value' } }),
 *   (config) => ({ ...config, timeout: 5000 }),
 *   (config) => ({ ...config, withCredentials: true })
 * ])
 * ```
 */
export function createPipelineMiddleware<TContext>(
  transforms: Array<(context: TContext) => TContext | Promise<TContext>>,
): Middleware<TContext> {
  return async (context: TContext, next: () => Promise<TContext>): Promise<TContext> => {
    let result = context

    for (const transform of transforms) {
      result = await transform(result)
    }

    return next()
  }
}

/**
 * 中间件构建器
 * 
 * 提供流畅的 API 来构建复杂的中间件组合
 * 
 * @example
 * ```typescript
 * const middleware = new MiddlewareBuilder<RequestConfig>()
 *   .use(loggingMiddleware)
 *   .when(config => config.url?.includes('/api'), authMiddleware)
 *   .timing((duration, config) => )
 *   .build()
 * ```
 */
export class MiddlewareBuilder<TContext> {
  private middlewares: Array<Middleware<TContext>> = []

  /**
   * 添加中间件
   */
  use(middleware: Middleware<TContext>): this {
    this.middlewares.push(middleware)
    return this
  }

  /**
   * 添加条件中间件
   */
  when(
    condition: (context: TContext) => boolean | Promise<boolean>,
    middleware: Middleware<TContext>,
  ): this {
    this.middlewares.push(createConditionalMiddleware(condition, middleware))
    return this
  }

  /**
   * 添加计时中间件（仅适用于 RequestConfig）
   */
  timing(
    onComplete: (duration: number, config: any) => void,
  ): this {
    this.middlewares.push(createTimingMiddleware(onComplete) as any)
    return this
  }

  /**
   * 添加管道转换
   */
  pipe(
    ...transforms: Array<(context: TContext) => TContext | Promise<TContext>>
  ): this {
    this.middlewares.push(createPipelineMiddleware(transforms))
    return this
  }

  /**
   * 构建最终的中间件
   */
  build(): Middleware<TContext> {
    const composed = this.middlewares

    return async (context: TContext, next: () => Promise<TContext>): Promise<TContext> => {
      const index = 0

      async function dispatch(i: number, ctx: TContext): Promise<TContext> {
        if (i >= composed.length) {
          return next()
        }

        const middleware = composed[i]!

        return middleware(ctx, () => dispatch(i + 1, ctx))
      }

      return dispatch(index, context)
    }
  }

  /**
   * 清空所有中间件
   */
  clear(): this {
    this.middlewares = []
    return this
  }

  /**
   * 获取中间件数量
   */
  get size(): number {
    return this.middlewares.length
  }
}
