/**
 * 请求构建器
 * 提供链式API构建HTTP请求
 */

import type { HttpRequest } from '../types'

/**
 * 请求构建器类
 */
export class RequestBuilder {
  private request: Partial<HttpRequest> = {
    method: 'GET',
    headers: {},
    params: {},
  }

  /**
   * 设置请求方法
   */
  method(method: string): RequestBuilder {
    this.request.method = method.toUpperCase()
    return this
  }

  /**
   * 设置URL
   */
  url(url: string): RequestBuilder {
    this.request.url = url
    return this
  }

  /**
   * 设置请求头
   */
  header(name: string, value: string): RequestBuilder {
    if (!this.request.headers) {
      this.request.headers = {}
    }
    this.request.headers[name] = value
    return this
  }

  /**
   * 批量设置请求头
   */
  headers(headers: Record<string, string>): RequestBuilder {
    this.request.headers = { ...this.request.headers, ...headers }
    return this
  }

  /**
   * 设置查询参数
   */
  param(name: string, value: any): RequestBuilder {
    if (!this.request.params) {
      this.request.params = {}
    }
    this.request.params[name] = value
    return this
  }

  /**
   * 批量设置查询参数
   */
  params(params: Record<string, any>): RequestBuilder {
    this.request.params = { ...this.request.params, ...params }
    return this
  }

  /**
   * 设置请求体
   */
  body(data: any): RequestBuilder {
    this.request.data = data
    return this
  }

  /**
   * 设置JSON请求体
   */
  json(data: any): RequestBuilder {
    this.request.data = data
    this.header('Content-Type', 'application/json')
    return this
  }

  /**
   * 设置表单数据
   */
  form(data: Record<string, any>): RequestBuilder {
    this.request.data = data
    this.header('Content-Type', 'application/x-www-form-urlencoded')
    return this
  }

  /**
   * 设置超时时间
   */
  timeout(timeout: number): RequestBuilder {
    this.request.timeout = timeout
    return this
  }

  /**
   * 设置响应类型
   */
  responseType(type: string): RequestBuilder {
    this.request.responseType = type
    return this
  }

  /**
   * 设置认证信息
   */
  auth(token: string, type = 'Bearer'): RequestBuilder {
    this.header('Authorization', `${type} ${token}`)
    return this
  }

  /**
   * 设置基本认证
   */
  basicAuth(username: string, password: string): RequestBuilder {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    this.header('Authorization', `Basic ${credentials}`)
    return this
  }

  /**
   * 设置User-Agent
   */
  userAgent(userAgent: string): RequestBuilder {
    this.header('User-Agent', userAgent)
    return this
  }

  /**
   * 设置Accept
   */
  accept(accept: string): RequestBuilder {
    this.header('Accept', accept)
    return this
  }

  /**
   * 禁用缓存
   */
  noCache(): RequestBuilder {
    this.header('Cache-Control', 'no-cache')
    this.header('Pragma', 'no-cache')
    return this
  }

  /**
   * 设置自定义配置
   */
  config(config: Partial<HttpRequest>): RequestBuilder {
    Object.assign(this.request, config)
    return this
  }

  /**
   * 构建请求配置
   */
  build(): HttpRequest {
    if (!this.request.url) {
      throw new Error('URL is required')
    }

    return {
      method: 'GET',
      headers: {},
      ...this.request,
    } as HttpRequest
  }

  /**
   * 重置构建器
   */
  reset(): RequestBuilder {
    this.request = {
      method: 'GET',
      headers: {},
      params: {},
    }
    return this
  }

  /**
   * 克隆构建器
   */
  clone(): RequestBuilder {
    const builder = new RequestBuilder()
    builder.request = JSON.parse(JSON.stringify(this.request))
    return builder
  }

  /**
   * 创建GET请求构建器
   */
  static get(url: string): RequestBuilder {
    return new RequestBuilder().method('GET').url(url)
  }

  /**
   * 创建POST请求构建器
   */
  static post(url: string): RequestBuilder {
    return new RequestBuilder().method('POST').url(url)
  }

  /**
   * 创建PUT请求构建器
   */
  static put(url: string): RequestBuilder {
    return new RequestBuilder().method('PUT').url(url)
  }

  /**
   * 创建PATCH请求构建器
   */
  static patch(url: string): RequestBuilder {
    return new RequestBuilder().method('PATCH').url(url)
  }

  /**
   * 创建DELETE请求构建器
   */
  static delete(url: string): RequestBuilder {
    return new RequestBuilder().method('DELETE').url(url)
  }

  /**
   * 创建HEAD请求构建器
   */
  static head(url: string): RequestBuilder {
    return new RequestBuilder().method('HEAD').url(url)
  }

  /**
   * 创建OPTIONS请求构建器
   */
  static options(url: string): RequestBuilder {
    return new RequestBuilder().method('OPTIONS').url(url)
  }

  /**
   * 从现有请求创建构建器
   */
  static from(request: Partial<HttpRequest>): RequestBuilder {
    const builder = new RequestBuilder()
    builder.request = { ...request }
    return builder
  }
}
