import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_BASE_URL, API_TIMEOUT, DEBUG } from '../config/env'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: number
}

class ApiClient {
  private instance: AxiosInstance
  private isConnected: boolean = false

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()

    if (DEBUG) {
      console.log('[ApiClient] 初始化完成', {
        baseURL: API_BASE_URL,
        timeout: API_TIMEOUT,
      })
    }
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        if (DEBUG) {
          console.log('[ApiClient] 请求:', config.method?.toUpperCase(), config.url)
        }
        return config
      },
      (error) => {
        if (DEBUG) {
          console.error('[ApiClient] 请求错误:', error)
        }
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response

        if (DEBUG) {
          console.log('[ApiClient] 响应:', response.config.url, data)
        }

        // 标记为已连接
        this.isConnected = true

        if (!data.success) {
          const errorMessage = data.error?.message || data.message || '请求失败'
          if (DEBUG) {
            console.error('[ApiClient] 业务错误:', errorMessage)
          }
          return Promise.reject(new Error(errorMessage))
        }

        return response
      },
      (error) => {
        // 标记为未连接
        this.isConnected = false

        const message = error.response?.data?.error?.message || error.message || '网络错误'
        if (DEBUG) {
          console.error('[ApiClient] 网络错误:', {
            message,
            status: error.response?.status,
            url: error.config?.url,
          })
        }
        return Promise.reject(new Error(message))
      }
    )
  }

  /**
   * 检查连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.get('/health')
      this.isConnected = true
      return true
    } catch (error) {
      this.isConnected = false
      return false
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, config)
    return response.data.data as T
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config)
    return response.data.data as T
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config)
    return response.data.data as T
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config)
    return response.data.data as T
  }
}

export const apiClient = new ApiClient()


