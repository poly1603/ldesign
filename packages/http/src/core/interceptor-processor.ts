/**
 * 拦截器处理器模块
 * 
 * 负责处理请求、响应和错误拦截器链
 */

import type {
  ErrorInterceptor,
  HttpError,
  InterceptorManager,
  RequestConfig,
  RequestInterceptor,
  ResponseData,
  ResponseInterceptor,
} from '../types'
import { InterceptorManagerImpl } from '../interceptors/manager'

/**
 * 拦截器处理器配置
 */
export interface InterceptorProcessorConfig {
  /** 请求拦截器管理器 */
  requestInterceptors: InterceptorManager<RequestInterceptor>
  /** 响应拦截器管理器 */
  responseInterceptors: InterceptorManager<ResponseInterceptor>
  /** 错误拦截器管理器 */
  errorInterceptors: InterceptorManager<ErrorInterceptor>
}

/**
 * 拦截器处理器
 * 
 * 管理和执行拦截器链
 */
export class InterceptorProcessor {
  private requestInterceptors: InterceptorManager<RequestInterceptor>
  private responseInterceptors: InterceptorManager<ResponseInterceptor>
  private errorInterceptors: InterceptorManager<ErrorInterceptor>

  constructor(config?: InterceptorProcessorConfig) {
    this.requestInterceptors = config?.requestInterceptors || new InterceptorManagerImpl<RequestInterceptor>()
    this.responseInterceptors = config?.responseInterceptors || new InterceptorManagerImpl<ResponseInterceptor>()
    this.errorInterceptors = config?.errorInterceptors || new InterceptorManagerImpl<ErrorInterceptor>()
  }

  /**
   * 处理请求拦截器
   */
  async processRequest(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config

    const interceptors = (
      this.requestInterceptors as InterceptorManagerImpl<RequestInterceptor>
    ).getInterceptors()

    for (const interceptor of interceptors) {
      try {
        processedConfig = await interceptor.fulfilled(processedConfig)
      } catch (error) {
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
  async processResponse<T>(response: ResponseData<T>): Promise<ResponseData<T>> {
    let processedResponse = response as ResponseData<unknown>

    const interceptors = (
      this.responseInterceptors as InterceptorManagerImpl<ResponseInterceptor>
    ).getInterceptors()

    for (const interceptor of interceptors) {
      try {
        processedResponse = await interceptor.fulfilled(processedResponse)
      } catch (error) {
        if (interceptor.rejected) {
          throw await interceptor.rejected(error as HttpError)
        }
        throw error
      }
    }

    return processedResponse as ResponseData<T>
  }

  /**
   * 处理错误拦截器
   */
  async processError(error: HttpError): Promise<HttpError> {
    let processedError = error

    const interceptors = (
      this.errorInterceptors as InterceptorManagerImpl<ErrorInterceptor>
    ).getInterceptors()

    for (const interceptor of interceptors) {
      try {
        processedError = await interceptor.fulfilled(processedError)
      } catch (err) {
        processedError = err as HttpError
      }
    }

    return processedError
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(
    fulfilled: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>,
    rejected?: (error: HttpError) => HttpError | Promise<HttpError>,
  ): number {
    return this.requestInterceptors.use(fulfilled, rejected)
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor<T = any>(
    fulfilled: (response: ResponseData<T>) => ResponseData<T> | Promise<ResponseData<T>>,
    rejected?: (error: HttpError) => HttpError | Promise<HttpError>,
  ): number {
    return this.responseInterceptors.use(fulfilled as ResponseInterceptor, rejected)
  }

  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(
    fulfilled: (error: HttpError) => HttpError | Promise<HttpError>,
    rejected?: (error: HttpError) => HttpError | Promise<HttpError>,
  ): number {
    return this.errorInterceptors.use(fulfilled, rejected)
  }

  /**
   * 移除请求拦截器
   */
  removeRequestInterceptor(id: number): void {
    this.requestInterceptors.eject(id)
  }

  /**
   * 移除响应拦截器
   */
  removeResponseInterceptor(id: number): void {
    this.responseInterceptors.eject(id)
  }

  /**
   * 移除错误拦截器
   */
  removeErrorInterceptor(id: number): void {
    this.errorInterceptors.eject(id)
  }

  /**
   * 清空所有请求拦截器
   */
  clearRequestInterceptors(): void {
    (this.requestInterceptors as InterceptorManagerImpl<RequestInterceptor>).clear()
  }

  /**
   * 清空所有响应拦截器
   */
  clearResponseInterceptors(): void {
    (this.responseInterceptors as InterceptorManagerImpl<ResponseInterceptor>).clear()
  }

  /**
   * 清空所有错误拦截器
   */
  clearErrorInterceptors(): void {
    (this.errorInterceptors as InterceptorManagerImpl<ErrorInterceptor>).clear()
  }

  /**
   * 清空所有拦截器
   */
  clearAll(): void {
    this.clearRequestInterceptors()
    this.clearResponseInterceptors()
    this.clearErrorInterceptors()
  }

  /**
   * 获取拦截器管理器
   */
  getInterceptors() {
    return {
      request: this.requestInterceptors,
      response: this.responseInterceptors,
      error: this.errorInterceptors,
    }
  }

  /**
   * 获取拦截器统计
   */
  getStats() {
    return {
      request: (this.requestInterceptors as InterceptorManagerImpl<RequestInterceptor>).getInterceptors().length,
      response: (this.responseInterceptors as InterceptorManagerImpl<ResponseInterceptor>).getInterceptors().length,
      error: (this.errorInterceptors as InterceptorManagerImpl<ErrorInterceptor>).getInterceptors().length,
    }
  }

  /**
   * 创建拦截器链
   */
  createChain<T>(
    request: RequestConfig,
    adapter: (config: RequestConfig) => Promise<ResponseData<T>>,
  ): Promise<ResponseData<T>> {
    return new Promise((resolve, reject) => {
      void (async () => {
        try {
          // 处理请求拦截器
          const processedConfig = await this.processRequest(request)

          // 执行适配器请求
          let response: ResponseData<T>
          try {
            response = await adapter(processedConfig)
          } catch (error) {
            // 处理错误拦截器
            const processedError = await this.processError(error as HttpError)
            reject(processedError)
            return
          }

          // 处理响应拦截器
          const processedResponse = await this.processResponse(response)
          resolve(processedResponse)
        } catch (error) {
          // 处理任何拦截器中的错误
          const processedError = await this.processError(error as HttpError)
          reject(processedError)
        }
      })()
    })
  }

  /**
   * 克隆拦截器处理器
   */
  clone(): InterceptorProcessor {
    const cloned = new InterceptorProcessor()
    
    // 复制请求拦截器
    const requestInterceptors = (this.requestInterceptors as InterceptorManagerImpl<RequestInterceptor>).getInterceptors()
    requestInterceptors.forEach(interceptor => {
      cloned.addRequestInterceptor(interceptor.fulfilled, interceptor.rejected)
    })

    // 复制响应拦截器
    const responseInterceptors = (this.responseInterceptors as InterceptorManagerImpl<ResponseInterceptor>).getInterceptors()
    responseInterceptors.forEach(interceptor => {
      cloned.addResponseInterceptor(interceptor.fulfilled, interceptor.rejected)
    })

    // 复制错误拦截器
    const errorInterceptors = (this.errorInterceptors as InterceptorManagerImpl<ErrorInterceptor>).getInterceptors()
    errorInterceptors.forEach(interceptor => {
      cloned.addErrorInterceptor(interceptor.fulfilled, interceptor.rejected)
    })

    return cloned
  }
}

/**
 * 创建拦截器处理器
 */
export function createInterceptorProcessor(
  config?: InterceptorProcessorConfig,
): InterceptorProcessor {
  return new InterceptorProcessor(config)
}

/**
 * 创建组合拦截器
 * 
 * 将多个拦截器组合成一个
 */
export function composeInterceptors<T>(
  ...interceptors: Array<(value: T) => T | Promise<T>>
): (value: T) => Promise<T> {
  return async (value: T): Promise<T> => {
    let result = value
    
    for (const interceptor of interceptors) {
      result = await interceptor(result)
    }
    
    return result
  }
}

/**
 * 创建条件拦截器
 * 
 * 根据条件决定是否执行拦截器
 */
export function conditionalInterceptor<T>(
  condition: (value: T) => boolean | Promise<boolean>,
  interceptor: (value: T) => T | Promise<T>,
): (value: T) => Promise<T> {
  return async (value: T): Promise<T> => {
    const shouldIntercept = await condition(value)
    
    if (shouldIntercept) {
      return interceptor(value)
    }
    
    return value
  }
}

/**
 * 创建缓存拦截器
 */
export function createCacheInterceptor(
  cache: Map<string, any>,
  keyGenerator: (config: RequestConfig) => string,
): {
  request: (config: RequestConfig) => RequestConfig
  response: <T>(response: ResponseData<T>) => ResponseData<T>
} {
  return {
    request: (config: RequestConfig) => {
      const key = keyGenerator(config)
      const cached = cache.get(key)
      
      if (cached) {
        // 标记为从缓存返回
        config.fromCache = true
        config.cachedResponse = cached
      }
      
      return config
    },
    response: <T>(response: ResponseData<T>) => {
      if (!response.config.fromCache) {
        const key = keyGenerator(response.config)
        cache.set(key, response)
      }
      
      return response
    },
  }
}

/**
 * 创建重试拦截器
 */
export function createRetryInterceptor(
  maxRetries: number = 3,
  retryDelay: number = 1000,
  shouldRetry?: (error: HttpError) => boolean,
): (error: HttpError) => Promise<never> {
  return async (error: HttpError): Promise<never> => {
    const config = error.config
    
    if (!config) {
      throw error
    }
    
    // 检查是否应该重试
    if (shouldRetry && !shouldRetry(error)) {
      throw error
    }
    
    // 获取或初始化重试计数
    const retryCount = ((config as any).retryCount ?? 0) + 1
    
    if (retryCount > maxRetries) {
      throw error
    }
    
    // 更新重试计数
    (config as any).retryCount = retryCount
    
    // 等待一段时间后重试
    await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount))
    
    // 重新发起请求
    throw error // 这里实际应该重新发起请求，但需要访问到HTTP客户端
  }
}

/**
 * 创建日志拦截器
 */
export function createLoggingInterceptor(
  logger: {
    log: (message: string, data?: any) => void
    error: (message: string, error?: any) => void
  } = console,
): {
  request: (config: RequestConfig) => RequestConfig
  response: <T>(response: ResponseData<T>) => ResponseData<T>
  error: (error: HttpError) => Promise<never>
} {
  return {
    request: (config: RequestConfig) => {
      logger.log(`[Request] ${config.method} ${config.url}`, config)
      return config
    },
    response: <T>(response: ResponseData<T>) => {
      logger.log(
        `[Response] ${response.config.method} ${response.config.url} - ${response.status}`,
        response,
      )
      return response
    },
    error: async (error: HttpError) => {
      logger.error(
        `[Error] ${error.config?.method} ${error.config?.url} - ${error.message}`,
        error,
      )
      throw error
    },
  }
}