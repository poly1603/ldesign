import type {
  ApiEndpoint,
  HttpClient,
  HttpMethod,
  RequestConfig,
  ResponseData,
  TypedHttpClient,
  TypedRequestConfig,
  TypedResponseData,
} from './types'

/**
 * 类型安全的 HTTP 客户端包装器
 */
export class TypedHttpClientWrapper<TBaseResponse = any> implements TypedHttpClient<TBaseResponse> {
  constructor(private client: HttpClient) {}

  // 代理所有基础方法
  get interceptors() {
    return this.client.interceptors
  }

  async request<T = TBaseResponse>(config: RequestConfig): Promise<ResponseData<T>> {
    return this.client.request<T>(config)
  }

  async get<T = TBaseResponse>(url: string, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.client.get<T>(url, config)
  }

  async post<T = TBaseResponse, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<ResponseData<T>> {
    return this.client.post<T>(url, data, config)
  }

  async put<T = TBaseResponse, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<ResponseData<T>> {
    return this.client.put<T>(url, data, config)
  }

  async delete<T = TBaseResponse>(url: string, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.client.delete<T>(url, config)
  }

  async patch<T = TBaseResponse, D = any>(
    url: string,
    data?: D,
    config?: RequestConfig,
  ): Promise<ResponseData<T>> {
    return this.client.patch<T>(url, data, config)
  }

  async head<T = TBaseResponse>(url: string, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.client.head<T>(url, config)
  }

  async options<T = TBaseResponse>(url: string, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.client.options<T>(url, config)
  }

  cancelAll(reason?: string): void {
    return this.client.cancelAll(reason)
  }

  getActiveRequestCount(): number {
    return this.client.getActiveRequestCount()
  }

  updateRetryConfig(config: any): void {
    return this.client.updateRetryConfig(config)
  }

  getConfig(): any {
    return this.client.getConfig()
  }

  clearCache(): Promise<void> {
    return this.client.clearCache()
  }

  getConcurrencyStatus() {
    return this.client.getConcurrencyStatus()
  }

  cancelQueue(reason?: string): void {
    return this.client.cancelQueue(reason)
  }

  /**
   * 类型安全的端点调用
   */
  async callEndpoint<TResponse = TBaseResponse, TRequest = any>(
    endpoint: ApiEndpoint<TResponse, TRequest>,
    data?: TRequest,
    config?: TypedRequestConfig<TRequest>,
  ): Promise<TypedResponseData<TResponse>> {
    const requestConfig: RequestConfig = {
      ...config,
      url: endpoint.url,
      method: endpoint.method,
      data,
    }

    // 验证请求数据
    if (endpoint.validate && data && !endpoint.validate(data)) {
      throw new Error('Request data validation failed')
    }

    const response = await this.client.request<any>(requestConfig)

    // 转换响应数据
    let transformedData = response.data
    if (endpoint.transform) {
      transformedData = endpoint.transform(response.data)
    }

    return {
      ...response,
      data: transformedData,
    } as TypedResponseData<TResponse>
  }

  /**
   * 批量请求
   */
  async batch<T extends Record<string, any>>(
    requests: {
      [K in keyof T]: () => Promise<ResponseData<T[K]>>
    },
  ): Promise<{ [K in keyof T]: ResponseData<T[K]> }> {
    const keys = Object.keys(requests) as Array<keyof T>
    const promises = keys.map(key => requests[key]())

    const results = await Promise.all(promises)

    const response = {} as { [K in keyof T]: ResponseData<T[K]> }
    keys.forEach((key, index) => {
      response[key] = results[index]!
    })

    return response
  }

  /**
   * 条件请求
   */
  async conditionalRequest<T = TBaseResponse>(
    condition: boolean | (() => boolean),
    config: RequestConfig,
  ): Promise<ResponseData<T> | null> {
    const shouldExecute = typeof condition === 'function' ? condition() : condition

    if (!shouldExecute) {
      return null
    }

    return this.client.request<T>(config)
  }

  /**
   * 重试请求直到成功
   */
  async retryUntilSuccess<T = TBaseResponse>(
    config: RequestConfig,
    maxAttempts = 5,
    delay = 1000,
  ): Promise<ResponseData<T>> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.client.request<T>(config)
      }
      catch (error) {
        lastError = error as Error

        if (attempt === maxAttempts) {
          break
        }

        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }

    throw lastError!
  }

  /**
   * 轮询请求
   */
  async poll<T = TBaseResponse>(
    config: RequestConfig,
    options: {
      interval: number
      maxAttempts?: number
      condition?: (response: ResponseData<T>) => boolean
    },
  ): Promise<ResponseData<T>> {
    const { interval, maxAttempts = Infinity, condition } = options
    let attempts = 0

    while (attempts < maxAttempts) {
      const response = await this.client.request<T>(config)

      if (!condition || condition(response)) {
        return response
      }

      attempts++
      await new Promise(resolve => setTimeout(resolve, interval))
    }

    throw new Error('Polling max attempts reached')
  }
}

/**
 * 创建类型安全的 HTTP 客户端
 */
export function createTypedHttpClient<TBaseResponse = any>(
  client: HttpClient,
): TypedHttpClient<TBaseResponse> {
  return new TypedHttpClientWrapper<TBaseResponse>(client)
}

/**
 * API 端点构建器
 */
export class ApiEndpointBuilder<TResponse = any, TRequest = any> {
  private endpoint: Partial<ApiEndpoint<TResponse, TRequest>> = {}

  url(url: string): this {
    this.endpoint.url = url
    return this
  }

  method(method: HttpMethod): this {
    this.endpoint.method = method
    return this
  }

  transform(transform: (data: any) => TResponse): this {
    this.endpoint.transform = transform
    return this
  }

  validate(validate: (data: TRequest) => boolean): this {
    this.endpoint.validate = validate
    return this
  }

  build(): ApiEndpoint<TResponse, TRequest> {
    if (!this.endpoint.url || !this.endpoint.method) {
      throw new Error('URL and method are required')
    }

    return this.endpoint as ApiEndpoint<TResponse, TRequest>
  }
}

/**
 * 创建 API 端点构建器
 */
export function createEndpoint<TResponse = any, TRequest = any>(): ApiEndpointBuilder<TResponse, TRequest> {
  return new ApiEndpointBuilder<TResponse, TRequest>()
}
