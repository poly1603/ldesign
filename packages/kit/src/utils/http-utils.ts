/**
 * HTTP 请求增强工具
 * 提供高级 HTTP 请求功能、重试机制、缓存等
 */

import { createHash } from 'node:crypto'
import { EventEmitter } from 'node:events'
import fetch, { type RequestInit, type Response } from 'node-fetch'

/**
 * HTTP 请求选项
 */
export interface HttpRequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
  retryCondition?: (error: any, response?: Response) => boolean
  cache?: boolean
  cacheKey?: string
  cacheTTL?: number
  onProgress?: (loaded: number, total: number) => void
  validateStatus?: (status: number) => boolean
}

/**
 * HTTP 响应接口
 */
export interface HttpResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  url: string
  cached?: boolean
  duration: number
}

/**
 * 请求缓存条目
 */
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
  headers: Record<string, string>
}

/**
 * HTTP 工具类
 */
export class HttpUtils extends EventEmitter {
  private static cache = new Map<string, CacheEntry>()
  private static defaultOptions: Partial<HttpRequestOptions> = {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    cacheTTL: 300000, // 5 minutes
    validateStatus: status => status >= 200 && status < 300,
  }

  /**
   * 发送 GET 请求
   */
  static async get<T = any>(
    url: string,
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  /**
   * 发送 POST 请求
   */
  static async post<T = any>(
    url: string,
    data?: any,
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  }

  /**
   * 发送 PUT 请求
   */
  static async put<T = any>(
    url: string,
    data?: any,
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  }

  /**
   * 发送 DELETE 请求
   */
  static async delete<T = any>(
    url: string,
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }

  /**
   * 发送 PATCH 请求
   */
  static async patch<T = any>(
    url: string,
    data?: any,
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  }

  /**
   * 通用请求方法
   */
  static async request<T = any>(
    url: string,
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const mergedOptions = { ...this.defaultOptions, ...options }
    const cacheKey = options.cacheKey || this.generateCacheKey(url, options)

    // 检查缓存
    if (mergedOptions.cache && mergedOptions.method === 'GET') {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return {
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: cached.headers,
          url,
          cached: true,
          duration: 0,
        }
      }
    }

    const startTime = Date.now()
    let lastError: any

    for (let attempt = 0; attempt <= (mergedOptions.retries || 0); attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout)

        const response = await fetch(url, {
          ...mergedOptions,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // 验证状态码
        if (mergedOptions.validateStatus && !mergedOptions.validateStatus(response.status)) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type') || ''
        let data: T

        if (contentType.includes('application/json')) {
          data = (await response.json()) as T
        }
        else if (contentType.includes('text/')) {
          data = (await response.text()) as T
        }
        else {
          data = (await response.arrayBuffer()) as T
        }

        const headers: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          headers[key] = value
        })

        const result: HttpResponse<T> = {
          data,
          status: response.status,
          statusText: response.statusText,
          headers,
          url: response.url,
          duration: Date.now() - startTime,
        }

        // 缓存成功的 GET 请求
        if (mergedOptions.cache && mergedOptions.method === 'GET' && response.ok) {
          this.setCache(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl: mergedOptions.cacheTTL || this.defaultOptions.cacheTTL!,
            headers,
          })
        }

        return result
      }
      catch (error) {
        lastError = error

        // 检查是否应该重试
        if (attempt < (mergedOptions.retries || 0)) {
          const shouldRetry = mergedOptions.retryCondition
            ? mergedOptions.retryCondition(error)
            : this.defaultRetryCondition(error)

          if (shouldRetry) {
            await this.delay(mergedOptions.retryDelay || this.defaultOptions.retryDelay!)
            continue
          }
        }

        throw error
      }
    }

    throw lastError
  }

  /**
   * 批量请求
   */
  static async batchRequest<T = any>(
    requests: Array<{ url: string, options?: HttpRequestOptions }>,
    concurrency = 5,
  ): Promise<Array<HttpResponse<T> | Error>> {
    const results: Array<HttpResponse<T> | Error> = []

    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency)
      const batchPromises = batch.map(async ({ url, options }) => {
        try {
          return await this.request<T>(url, options)
        }
        catch (error) {
          return error as Error
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
  }

  /**
   * 下载文件
   */
  static async downloadFile(
    url: string,
    filePath: string,
    options: HttpRequestOptions = {},
  ): Promise<void> {
    const fs = await import('node:fs')
    const path = await import('node:path')

    // 确保目录存在
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
    }

    const fileStream = fs.createWriteStream(filePath)

    if (response.body) {
      const contentLength = Number.parseInt(response.headers.get('content-length') || '0')
      let downloaded = 0

      await new Promise<void>((resolve, reject) => {
        (response.body as any)
          .on('data', (chunk: Buffer) => {
            downloaded += chunk.length
            fileStream.write(chunk)
            if (options.onProgress && contentLength > 0) {
              options.onProgress(downloaded, contentLength)
            }
          })
          .on('end', () => {
            fileStream.end()
            resolve()
          })
          .on('error', (err: Error) => {
            fileStream.end()
            reject(err)
          })
      })
    }
  }

  /**
   * 上传文件
   */
  static async uploadFile(
    url: string,
    filePath: string,
    fieldName = 'file',
    options: HttpRequestOptions = {},
  ): Promise<HttpResponse> {
    const fs = await import('node:fs')
    const FormData = (await import('form-data')).default

    const form = new FormData()
    form.append(fieldName, fs.createReadStream(filePath))

    return this.request(url, {
      ...options,
      method: 'POST',
      body: form as any,
      headers: {
        ...((form as any).getHeaders ? (form as any).getHeaders() : {}),
        ...options.headers,
      },
    })
  }

  /**
   * 检查 URL 是否可访问
   */
  static async isUrlAccessible(url: string, timeout = 5000): Promise<boolean> {
    try {
      const response = await this.request(url, {
        method: 'HEAD',
        timeout,
        retries: 0,
      })
      return response.status >= 200 && response.status < 400
    }
    catch {
      return false
    }
  }

  /**
   * 获取 URL 的响应时间
   */
  static async getResponseTime(url: string): Promise<number> {
    const startTime = Date.now()
    try {
      await this.request(url, { method: 'HEAD', retries: 0 })
      return Date.now() - startTime
    }
    catch {
      return -1
    }
  }

  /**
   * 清除缓存
   */
  static clearCache(pattern?: RegExp): void {
    if (pattern) {
      for (const [key] of this.cache) {
        if (pattern.test(key)) {
          this.cache.delete(key)
        }
      }
    }
    else {
      this.cache.clear()
    }
  }

  /**
   * 设置默认选项
   */
  static setDefaultOptions(options: Partial<HttpRequestOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options }
  }

  // 私有方法

  private static generateCacheKey(url: string, options: HttpRequestOptions): string {
    const key = `${options.method || 'GET'}:${url}`
    if (options.body) {
      const bodyHash = createHash('md5')
        .update(JSON.stringify(options.body))
        .digest('hex')
      return `${key}:${bodyHash}`
    }
    return key
  }

  private static getFromCache(key: string): CacheEntry | null {
    const entry = this.cache.get(key)
    if (!entry)
      return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry
  }

  private static setCache(key: string, entry: CacheEntry): void {
    this.cache.set(key, entry)
  }

  private static defaultRetryCondition(error: any): boolean {
    // 重试网络错误和 5xx 错误
    return (
      error.code === 'ECONNRESET'
      || error.code === 'ENOTFOUND'
      || error.code === 'ECONNREFUSED'
      || error.code === 'ETIMEDOUT'
      || (error.status >= 500 && error.status < 600)
    )
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
