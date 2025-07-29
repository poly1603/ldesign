// HTTP核心类
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type {
  HttpConfig,
  RequestOptions,
  HttpResponse,
  HttpError,
  RequestInterceptor,
  ResponseInterceptor,
  HttpMethod
} from '../types'

/**
 * HTTP客户端类
 */
export class Http {
  private instance: AxiosInstance
  private defaultConfig: HttpConfig

  constructor(config: HttpConfig = {}) {
    this.defaultConfig = {
      timeout: 10000,
      withCredentials: false,
      ...config
    }

    this.instance = axios.create(this.defaultConfig)
    this.setupInterceptors()
  }

  /**
   * 设置默认拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 可以在这里添加通用的请求处理逻辑
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        const httpError: HttpError = {
          message: error.message || 'Request failed',
          status: error.response?.status,
          statusText: error.response?.statusText,
          response: error.response,
          config: error.config
        }
        return Promise.reject(httpError)
      }
    )
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): number {
    return this.instance.interceptors.request.use(
      interceptor.onFulfilled,
      interceptor.onRejected
    )
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): number {
    return this.instance.interceptors.response.use(
      interceptor.onFulfilled,
      interceptor.onRejected
    )
  }

  /**
   * 移除请求拦截器
   */
  removeRequestInterceptor(id: number): void {
    this.instance.interceptors.request.eject(id)
  }

  /**
   * 移除响应拦截器
   */
  removeResponseInterceptor(id: number): void {
    this.instance.interceptors.response.eject(id)
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(options: RequestOptions): Promise<HttpResponse<T>> {
    try {
      const config: AxiosRequestConfig = {
        ...this.defaultConfig,
        ...options
      }
      
      const response: AxiosResponse<T> = await this.instance.request(config)
      
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        config: options
      }
    } catch (error: any) {
      throw error
    }
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'GET' as HttpMethod,
      url,
      ...config
    })
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'POST' as HttpMethod,
      url,
      data,
      ...config
    })
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'PUT' as HttpMethod,
      url,
      data,
      ...config
    })
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'DELETE' as HttpMethod,
      url,
      ...config
    })
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(url: string, data?: any, config?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>({
      method: 'PATCH' as HttpMethod,
      url,
      data,
      ...config
    })
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): HttpConfig {
    return { ...this.defaultConfig }
  }

  /**
   * 更新默认配置
   */
  updateDefaultConfig(config: Partial<HttpConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config }
    Object.assign(this.instance.defaults, config)
  }

  /**
   * 获取Axios实例
   */
  getInstance(): AxiosInstance {
    return this.instance
  }
}

/**
 * 创建HTTP实例
 */
export function createHttp(config?: HttpConfig): Http {
  return new Http(config)
}