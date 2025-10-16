/**
 * HTTP 请求工具函数
 */

import type { HttpMethod, ApiResponse } from '../types'

/**
 * HTTP 请求配置接口
 */
export interface HttpConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer'
}

/**
 * 请求选项接口
 */
export interface RequestOptions extends HttpConfig {
  method?: HttpMethod
  url: string
  data?: any
  params?: Record<string, any>
  onUploadProgress?: (progressEvent: ProgressEvent) => void
  onDownloadProgress?: (progressEvent: ProgressEvent) => void
}

/**
 * 响应拦截器类型
 */
export type ResponseInterceptor<T = any> = (response: Response) => T | Promise<T>

/**
 * 请求拦截器类型
 */
export type RequestInterceptor = (config: RequestOptions) => RequestOptions | Promise<RequestOptions>

/**
 * 错误拦截器类型
 */
export type ErrorInterceptor = (error: Error) => Error | Promise<Error>

/**
 * HTTP 客户端类
 */
export class HttpClient {
  private config: HttpConfig
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  constructor(config: HttpConfig = {}) {
    this.config = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    }
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor<T = any>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * 添加错误拦截器
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  /**
   * 构建完整URL
   */
  private buildURL(url: string, params?: Record<string, any>): string {
    const baseURL = this.config?.baseURL || ''
    const fullURL = url.startsWith('http') ? url : `${baseURL}${url}`
    
    if (!params) return fullURL
    
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    
    const queryString = searchParams.toString()
    return queryString ? `${fullURL}?${queryString}` : fullURL
  }

  /**
   * 处理请求拦截器
   */
  private async processRequestInterceptors(options: RequestOptions): Promise<RequestOptions> {
    let processedOptions = { ...options }
    
    for (const interceptor of this.requestInterceptors) {
      processedOptions = await interceptor(processedOptions)
    }
    
    return processedOptions
  }

  /**
   * 处理响应拦截器
   */
  private async processResponseInterceptors<T>(response: Response): Promise<T> {
    let processedResponse: any = response
    
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse)
    }
    
    return processedResponse
  }

  /**
   * 处理错误拦截器
   */
  private async processErrorInterceptors(error: Error): Promise<Error> {
    let processedError = error
    
    for (const interceptor of this.errorInterceptors) {
      processedError = await interceptor(processedError)
    }
    
    return processedError
  }

  /**
   * 发送请求
   */
  async request<T = any>(options: RequestOptions): Promise<T> {
    try {
      // 处理请求拦截器
      const processedOptions = await this.processRequestInterceptors({
        ...this.config,
        ...options,
      })

      // 构建请求配置
      const { method = 'GET', url, data, params, ...config } = processedOptions
      const fullURL = this.buildURL(url, params)

      const requestInit: RequestInit = {
        method,
        headers: config.headers,
        credentials: config.withCredentials ? 'include' : 'same-origin',
      }

      // 添加请求体
      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        if (data instanceof FormData) {
          requestInit.body = data
          // 删除 Content-Type，让浏览器自动设置
          delete (requestInit.headers as any)['Content-Type']
        } else {
          requestInit.body = JSON.stringify(data)
        }
      }

      // 发送请求
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeout)

      const response = await fetch(fullURL, {
        ...requestInit,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
      }

      // 解析响应数据
      let responseData: any
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json()
      } else if (config.responseType === 'blob') {
        responseData = await response.blob()
      } else if (config.responseType === 'arrayBuffer') {
        responseData = await response.arrayBuffer()
      } else {
        responseData = await response.text()
      }

      // 处理响应拦截器
      return await this.processResponseInterceptors<T>(responseData)
    } catch (error) {
      // 处理错误拦截器
      const processedError = await this.processErrorInterceptors(error as Error)
      throw processedError
    }
  }

  /**
   * GET 请求
   */
  get<T = any>(url: string, params?: Record<string, any>, config?: Partial<HttpConfig>): Promise<T> {
    return this.request<T>({ method: 'GET', url, params, ...config })
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config?: Partial<HttpConfig>): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, ...config })
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: Partial<HttpConfig>): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data, ...config })
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, config?: Partial<HttpConfig>): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, ...config })
  }

  /**
   * PATCH 请求
   */
  patch<T = any>(url: string, data?: any, config?: Partial<HttpConfig>): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data, ...config })
  }
}

/**
 * 默认 HTTP 客户端实例
 */
export const http = new HttpClient()

/**
 * 创建 HTTP 客户端实例
 */
export function createHttpClient(config?: HttpConfig): HttpClient {
  return new HttpClient(config)
}

/**
 * 快速请求方法
 */
export const get = http.get.bind(http)
export const post = http.post.bind(http)
export const put = http.put.bind(http)
export const del = http.delete.bind(http)
export const patch = http.patch.bind(http)

/**
 * 上传文件
 */
export async function uploadFile(
  url: string,
  file: File,
  options: {
    name?: string
    data?: Record<string, any>
    onProgress?: (percent: number) => void
  } = {}
): Promise<any> {
  const { name = 'file', data = {}, onProgress } = options
  
  const formData = new FormData()
  formData.append(name, file)
  
  // 添加额外数据
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value))
  })

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress(percent)
        }
      })
    }
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } catch {
          resolve(xhr.responseText)
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
      }
    })
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })
    
    xhr.open('POST', url)
    xhr.send(formData)
  })
}

/**
 * 下载远程文件
 */
export async function downloadRemoteFile(url: string, filename?: string): Promise<void> {
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`)
  }
  
  const blob = await response.blob()
  const downloadUrl = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename || url.split('/').pop() || 'download'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(downloadUrl)
}
