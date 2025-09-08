/**
 * 响应处理器
 * 提供HTTP响应的处理和转换功能
 */

import type { HttpResponse } from '../types'
import { NetworkError } from '../types'

/**
 * 响应处理器类
 */
export class ResponseHandler<T = any> {
  private response: HttpResponse<T>

  constructor(response: HttpResponse<T>) {
    this.response = response
  }

  /**
   * 获取响应数据
   */
  data(): T {
    return this.response.data
  }

  /**
   * 获取状态码
   */
  status(): number {
    return this.response.status
  }

  /**
   * 获取状态文本
   */
  statusText(): string {
    return this.response.statusText
  }

  /**
   * 获取响应头
   */
  headers(): Record<string, string> {
    return this.response.headers
  }

  /**
   * 获取指定响应头
   * @param name 头名称
   */
  header(name: string): string | undefined {
    return this.response.headers[name] || this.response.headers[name.toLowerCase()]
  }

  /**
   * 获取Content-Type
   */
  contentType(): string | undefined {
    return this.header('content-type')
  }

  /**
   * 获取Content-Length
   */
  contentLength(): number | undefined {
    const length = this.header('content-length')
    return length ? Number.parseInt(length, 10) : undefined
  }

  /**
   * 获取ETag
   */
  etag(): string | undefined {
    return this.header('etag')
  }

  /**
   * 获取Last-Modified
   */
  lastModified(): Date | undefined {
    const lastModified = this.header('last-modified')
    return lastModified ? new Date(lastModified) : undefined
  }

  /**
   * 获取Location（重定向地址）
   */
  location(): string | undefined {
    return this.header('location')
  }

  /**
   * 获取Set-Cookie
   */
  cookies(): string[] {
    const setCookie = this.header('set-cookie')
    return setCookie ? setCookie.split(',').map(c => c.trim()) : []
  }

  /**
   * 获取响应时长
   */
  duration(): number | undefined {
    return this.response.duration
  }

  /**
   * 获取最终URL
   */
  url(): string | undefined {
    return this.response.url
  }

  /**
   * 检查是否成功
   */
  isSuccess(): boolean {
    return this.response.status >= 200 && this.response.status < 300
  }

  /**
   * 检查是否重定向
   */
  isRedirect(): boolean {
    return this.response.status >= 300 && this.response.status < 400
  }

  /**
   * 检查是否客户端错误
   */
  isClientError(): boolean {
    return this.response.status >= 400 && this.response.status < 500
  }

  /**
   * 检查是否服务器错误
   */
  isServerError(): boolean {
    return this.response.status >= 500 && this.response.status < 600
  }

  /**
   * 检查是否错误
   */
  isError(): boolean {
    return this.response.status >= 400
  }

  /**
   * 检查是否为JSON响应
   */
  isJson(): boolean {
    const contentType = this.contentType()
    return contentType ? contentType.includes('application/json') : false
  }

  /**
   * 检查是否为HTML响应
   */
  isHtml(): boolean {
    const contentType = this.contentType()
    return contentType ? contentType.includes('text/html') : false
  }

  /**
   * 检查是否为文本响应
   */
  isText(): boolean {
    const contentType = this.contentType()
    return contentType ? contentType.startsWith('text/') : false
  }

  /**
   * 检查是否为二进制响应
   */
  isBinary(): boolean {
    return !this.isText() && !this.isJson()
  }

  /**
   * 转换为JSON
   */
  json<U = any>(): U {
    if (typeof this.response.data === 'string') {
      try {
        return JSON.parse(this.response.data)
      }
      catch (error) {
        throw new NetworkError(
          'Failed to parse JSON response',
          this.response.config.url,
          error as Error,
        )
      }
    }
    return this.response.data as unknown as U
  }

  /**
   * 转换为文本
   */
  text(): string {
    if (typeof this.response.data === 'string') {
      return this.response.data
    }

    if (typeof this.response.data === 'object') {
      return JSON.stringify(this.response.data)
    }

    return String(this.response.data)
  }

  /**
   * 获取原始响应
   */
  raw(): HttpResponse<T> {
    return this.response
  }

  /**
   * 转换数据
   * @param transformer 转换函数
   */
  transform<U>(transformer: (data: T) => U): ResponseHandler<U> {
    const transformedData = transformer(this.response.data)
    const transformedResponse: HttpResponse<U> = {
      ...this.response,
      data: transformedData,
    }
    return new ResponseHandler(transformedResponse)
  }

  /**
   * 验证响应
   * @param validator 验证函数
   */
  validate(validator: (data: T) => boolean): ResponseHandler<T> {
    if (!validator(this.response.data)) {
      throw new NetworkError('Response validation failed', this.response.config.url)
    }
    return this
  }

  /**
   * 条件处理
   * @param condition 条件函数
   * @param handler 处理函数
   */
  when(
    condition: (response: HttpResponse<T>) => boolean,
    handler: (data: T) => T,
  ): ResponseHandler<T> {
    if (condition(this.response)) {
      const transformedData = handler(this.response.data)
      this.response = { ...this.response, data: transformedData }
    }
    return this
  }

  /**
   * 错误处理
   * @param handler 错误处理函数
   */
  catch(handler: (error: NetworkError) => T): ResponseHandler<T> {
    if (this.isError()) {
      const error = new NetworkError(
        `HTTP ${this.response.status}: ${this.response.statusText}`,
        this.response.config.url,
      )

      const handledData = handler(error)
      this.response = { ...this.response, data: handledData }
    }
    return this
  }

  /**
   * 成功处理
   * @param handler 成功处理函数
   */
  then<U>(handler: (data: T) => U): ResponseHandler<U> {
    if (this.isSuccess()) {
      return this.transform(handler)
    }
    return this as any
  }

  /**
   * 最终处理
   * @param handler 最终处理函数
   */
  finally(handler: (response: HttpResponse<T>) => void): ResponseHandler<T> {
    handler(this.response)
    return this
  }

  /**
   * 提取字段
   * @param path 字段路径
   */
  pluck(path: string): any {
    const keys = path.split('.')
    let current = this.response.data as any

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      }
      else {
        return undefined
      }
    }

    return current
  }

  /**
   * 检查字段是否存在
   * @param path 字段路径
   */
  has(path: string): boolean {
    return this.pluck(path) !== undefined
  }

  /**
   * 获取分页信息
   */
  pagination(): PaginationInfo | null {
    const data = this.response.data as any

    if (data && typeof data === 'object') {
      // 常见的分页字段
      const pageFields = ['page', 'currentPage', 'pageNumber']
      const sizeFields = ['size', 'pageSize', 'limit', 'perPage']
      const totalFields = ['total', 'totalCount', 'totalItems']
      const pagesFields = ['pages', 'totalPages', 'pageCount']

      const pageField = pageFields.find(field => field in data)
      const sizeField = sizeFields.find(field => field in data)
      const totalField = totalFields.find(field => field in data)
      const pagesField = pagesFields.find(field => field in data)

      const page = pageField !== undefined ? Number(data[pageField]) : undefined
      const size = sizeField !== undefined ? Number(data[sizeField]) : undefined
      const total = totalField !== undefined ? Number(data[totalField]) : undefined
      const pages = pagesField !== undefined ? Number(data[pagesField]) : undefined

      if (page !== undefined || size !== undefined || total !== undefined) {
        const pg = Number.isFinite(page as number) ? (page as number) : 1
        const sz = Number.isFinite(size as number) ? (size as number) : 10
        const tt = Number.isFinite(total as number) ? (total as number) : 0
        const ps = Number.isFinite(pages as number) ? (pages as number) : Math.ceil(tt / sz)
        return {
          page: pg,
          size: sz,
          total: tt,
          pages: ps,
        }
      }
    }

    return null
  }

  /**
   * 获取错误信息
   */
  error(): ErrorInfo | null {
    if (!this.isError()) {
      return null
    }

    const data = this.response.data as any

    return {
      status: this.response.status,
      statusText: this.response.statusText,
      message: data?.message || data?.error || this.response.statusText,
      code: data?.code || data?.errorCode,
      details: data?.details || data?.errors,
    }
  }

  /**
   * 创建响应处理器
   * @param response HTTP响应
   */
  static create<T>(response: HttpResponse<T>): ResponseHandler<T> {
    return new ResponseHandler(response)
  }

  /**
   * 批量处理响应
   * @param responses 响应数组
   * @param handler 处理函数
   */
  static batch<T, U>(
    responses: HttpResponse<T>[],
    handler: (handler: ResponseHandler<T>) => U,
  ): U[] {
    return responses.map((response) => {
      const responseHandler = new ResponseHandler(response)
      return handler(responseHandler)
    })
  }

  /**
   * 合并响应数据
   * @param responses 响应数组
   * @param merger 合并函数
   */
  static merge<T, U>(responses: HttpResponse<T>[], merger: (data: T[]) => U): U {
    const data = responses.map(response => response.data)
    return merger(data)
  }
}

// 类型定义
interface PaginationInfo {
  page: number
  size: number
  total: number
  pages: number
}

interface ErrorInfo {
  status: number
  statusText: string
  message: string
  code?: string | number
  details?: any
}
