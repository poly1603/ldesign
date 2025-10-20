import type { HttpClient, RequestConfig } from '../types'

/**
 * GraphQL 查询变量类型
 */
export type GraphQLVariables = Record<string, any>

/**
 * GraphQL 请求配置
 */
export interface GraphQLRequestConfig extends Omit<RequestConfig, 'method' | 'data'> {
  /** GraphQL 端点 URL（如果不同于 baseURL） */
  endpoint?: string
  /** 自定义请求头 */
  headers?: Record<string, string>
  /** 启用批量查询 */
  batching?: boolean
  /** 批量查询延迟（毫秒） */
  batchDelay?: number
}

/**
 * GraphQL 响应类型
 */
export interface GraphQLResponse<T = any> {
  data?: T
  errors?: GraphQLError[]
  extensions?: Record<string, any>
}

/**
 * GraphQL 错误类��
 */
export interface GraphQLError {
  message: string
  locations?: Array<{ line: number, column: number }>
  path?: Array<string | number>
  extensions?: Record<string, any>
}

/**
 * GraphQL 批量请求项
 */
interface BatchItem<T = any> {
  query: string
  variables?: GraphQLVariables
  operationName?: string
  resolve: (value: GraphQLResponse<T>) => void
  reject: (error: Error) => void
}

/**
 * GraphQL 客户端配置
 */
export interface GraphQLClientConfig {
  /** 默认端点 URL */
  endpoint: string
  /** 默认请求头 */
  headers?: Record<string, string>
  /** 启用批量查询 */
  batching?: boolean
  /** 批量查询延迟（毫秒） */
  batchDelay?: number
  /** 是否在控制台打印查询 */
  debug?: boolean
}

/**
 * GraphQL 客户端
 *
 * 提供 GraphQL 查询、变更和订阅功能，支持批量查询优化
 *
 * @example
 * ```typescript
 * const graphqlClient = new GraphQLClient(httpClient, {
 *   endpoint: '/graphql',
 *   batching: true,
 *   batchDelay: 10
 * })
 *
 * // 执行查询
 * const { data, errors } = await graphqlClient.query<User[]>(`
 *   query GetUsers {
 *     users {
 *       id
 *       name
 *       email
 *     }
 *   }
 * `)
 *
 * // 执行变更
 * const result = await graphqlClient.mutate<User>(`
 *   mutation CreateUser($input: CreateUserInput!) {
 *     createUser(input: $input) {
 *       id
 *       name
 *     }
 *   }
 * `, {
 *   input: { name: 'John', email: 'john@example.com' }
 * })
 * ```
 */
export class GraphQLClient {
  private httpClient: HttpClient
  private config: Required<GraphQLClientConfig>
  private batchQueue: BatchItem[] = []
  private batchTimer: ReturnType<typeof setTimeout> | null = null

  constructor(httpClient: HttpClient, config: GraphQLClientConfig) {
    this.httpClient = httpClient
    this.config = {
      endpoint: config.endpoint,
      headers: config.headers || {},
      batching: config.batching ?? false,
      batchDelay: config.batchDelay ?? 10,
      debug: config.debug ?? false,
    }
  }

  /**
   * 执行 GraphQL 查询
   */
  async query<T = any>(
    query: string,
    variables?: GraphQLVariables,
    config?: GraphQLRequestConfig,
  ): Promise<GraphQLResponse<T>> {
    return this.request<T>(query, variables, undefined, config)
  }

  /**
   * 执行 GraphQL 变更
   */
  async mutate<T = any>(
    mutation: string,
    variables?: GraphQLVariables,
    config?: GraphQLRequestConfig,
  ): Promise<GraphQLResponse<T>> {
    // 变更不支持批量处理
    return this.request<T>(mutation, variables, undefined, {
      ...config,
      batching: false,
    })
  }

  /**
   * 执行 GraphQL 请求
   */
  private async request<T = any>(
    query: string,
    variables?: GraphQLVariables,
    operationName?: string,
    config?: GraphQLRequestConfig,
  ): Promise<GraphQLResponse<T>> {
    const shouldBatch = config?.batching ?? this.config?.batching

    if (shouldBatch) {
      return this.batchRequest<T>(query, variables, operationName, config)
    }

    return this.singleRequest<T>(query, variables, operationName, config)
  }

  /**
   * 执行单个 GraphQL 请求
   */
  private async singleRequest<T = any>(
    query: string,
    variables?: GraphQLVariables,
    operationName?: string,
    config?: GraphQLRequestConfig,
  ): Promise<GraphQLResponse<T>> {
    const endpoint = config?.endpoint || this.config?.endpoint

    if (this.config?.debug) {
      console.debug('[GraphQL Query]', query)
      if (variables) {
        console.debug('[GraphQL Variables]', variables)
      }
    }

    try {
      const response = await this.httpClient.post<GraphQLResponse<T>>(
        endpoint,
        {
          query,
          variables,
          operationName,
        },
        {
          ...config,
          headers: {
            'Content-Type': 'application/json',
            ...this.config?.headers,
            ...config?.headers,
          },
        },
      )

      const result = response.data

      if (this.config?.debug && result.errors) {
        console.error('[GraphQL Errors]', result.errors)
      }

      if (result.errors && result.errors.length > 0) {
        throw new GraphQLClientError(result.errors, result.data)
      }

      return result
    }
    catch (error: any) {
      if (error instanceof GraphQLClientError) {
        throw error
      }
      throw new GraphQLClientError([{
        message: error.message || 'GraphQL request failed',
        extensions: { originalError: error },
      }])
    }
  }

  /**
   * 批量请求
   */
  private async batchRequest<T = any>(
    query: string,
    variables?: GraphQLVariables,
    operationName?: string,
    config?: GraphQLRequestConfig,
  ): Promise<GraphQLResponse<T>> {
    return new Promise<GraphQLResponse<T>>((resolve, reject) => {
      // 添加到批量队列
      this.batchQueue.push({
        query,
        variables,
        operationName,
        resolve: resolve as any,
        reject,
      })

      // 如果已经有定时器，不需要创建新的
      if (this.batchTimer) {
        return
      }

      // 设置批量执行定时器
      const delay = config?.batchDelay ?? this.config?.batchDelay
      this.batchTimer = setTimeout(() => {
        this.executeBatch(config)
      }, delay)
    })
  }

  /**
   * 执行批量请求
   */
  private async executeBatch(config?: GraphQLRequestConfig): Promise<void> {
    // 获取并清空队列
    const batch = [...this.batchQueue]
    this.batchQueue = []
    this.batchTimer = null

    if (batch.length === 0) {
      return
    }

    const endpoint = config?.endpoint || this.config?.endpoint

    if (this.config?.debug) {
      console.debug('[GraphQL Batch]', `Processing ${batch.length} requests`)
    }

    try {
      // 构建批量请求
      const batchRequest = batch.map(item => ({
        query: item.query,
        variables: item.variables,
        operationName: item.operationName,
      }))

      // 发送批量请求
      const response = await this.httpClient.post<GraphQLResponse[]>(
        endpoint,
        batchRequest,
        {
          ...config,
          headers: {
            'Content-Type': 'application/json',
            ...this.config?.headers,
            ...config?.headers,
          },
        },
      )

      // 分发响应到各个 Promise
      response.data.forEach((result, index) => {
        const item = batch[index]
        if (result.errors && result.errors.length > 0) {
          item.reject(new GraphQLClientError(result.errors, result.data))
        }
        else {
          item.resolve(result)
        }
      })
    }
    catch (error: any) {
      // 批量请求失败，所有 Promise 都 reject
      batch.forEach((item) => {
        item.reject(error)
      })
    }
  }

  /**
   * 清除批量队列
   */
  clearBatch(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    this.batchQueue = []
  }

  /**
   * 获取批量队列大小
   */
  getBatchQueueSize(): number {
    return this.batchQueue.length
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<GraphQLClientConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 获取当前配置
   */
  getConfig(): GraphQLClientConfig {
    return { ...this.config }
  }
}

/**
 * GraphQL 客户端错误
 */
export class GraphQLClientError extends Error {
  public graphQLErrors: GraphQLError[]
  public data?: any

  constructor(errors: GraphQLError[], data?: any) {
    const message = errors.map(e => e.message).join('\n')
    super(message)
    this.name = 'GraphQLClientError'
    this.graphQLErrors = errors
    this.data = data

    // 设置原型链，确保 instanceof 正常工作
    Object.setPrototypeOf(this, GraphQLClientError.prototype)
  }

  /**
   * 判断是否有指定类型的错误
   */
  hasErrorCode(code: string): boolean {
    return this.graphQLErrors.some(
      error => error.extensions?.code === code,
    )
  }

  /**
   * 获取第一个错误
   */
  getFirstError(): GraphQLError | undefined {
    return this.graphQLErrors[0]
  }
}

/**
 * 创建 GraphQL 客户端
 */
export function createGraphQLClient(
  httpClient: HttpClient,
  config: GraphQLClientConfig,
): GraphQLClient {
  return new GraphQLClient(httpClient, config)
}

/**
 * 类型守卫：检查是否为 GraphQL 错误
 */
export function isGraphQLError(error: any): error is GraphQLClientError {
  return error instanceof GraphQLClientError
}
