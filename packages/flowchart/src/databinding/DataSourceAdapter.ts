/**
 * 数据源适配器
 * 
 * 支持不同类型数据源的适配器实现
 */

import type {
  DataSourceAdapter as IDataSourceAdapter,
  DataSourceConfig,
  DataSourceType,
  DataSourceStatus
} from './types'

/**
 * 数据源适配器基类
 */
export abstract class BaseDataSourceAdapter implements IDataSourceAdapter {
  protected config!: DataSourceConfig
  protected status: DataSourceStatus = 'disconnected'
  protected callbacks: ((data: any) => void)[] = []

  abstract type: DataSourceType

  async connect(config: DataSourceConfig): Promise<void> {
    this.config = config
    this.status = 'connecting'
    await this.doConnect()
    this.status = 'connected'
  }

  async disconnect(): Promise<void> {
    await this.doDisconnect()
    this.status = 'disconnected'
    this.callbacks = []
  }

  abstract fetchData(): Promise<any>

  subscribe(callback: (data: any) => void): void {
    this.callbacks.push(callback)
  }

  unsubscribe(): void {
    this.callbacks = []
  }

  getStatus(): DataSourceStatus {
    return this.status
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.doTestConnection()
      return true
    } catch {
      return false
    }
  }

  protected abstract doConnect(): Promise<void>
  protected abstract doDisconnect(): Promise<void>
  protected abstract doTestConnection(): Promise<void>

  protected notifyCallbacks(data: any): void {
    this.callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('数据源回调执行失败:', error)
      }
    })
  }
}

/**
 * REST API 数据源适配器
 */
export class RestDataSourceAdapter extends BaseDataSourceAdapter {
  type: DataSourceType = 'rest'
  private pollTimer?: number

  protected async doConnect(): Promise<void> {
    // REST API 不需要持久连接
  }

  protected async doDisconnect(): Promise<void> {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = undefined
    }
  }

  protected async doTestConnection(): Promise<void> {
    await this.makeRequest()
  }

  async fetchData(): Promise<any> {
    return await this.makeRequest()
  }

  private async makeRequest(): Promise<any> {
    const { url, method = 'GET', headers = {}, body, params, auth, timeout } = this.config

    if (!url) {
      throw new Error('REST数据源缺少URL配置')
    }

    // 构建URL
    let requestUrl = url
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params)
      requestUrl += (url.includes('?') ? '&' : '?') + searchParams.toString()
    }

    // 构建请求头
    const requestHeaders: Record<string, string> = { ...headers }

    // 添加认证头
    if (auth) {
      switch (auth.type) {
        case 'basic':
          if (auth.username && auth.password) {
            const credentials = btoa(`${auth.username}:${auth.password}`)
            requestHeaders['Authorization'] = `Basic ${credentials}`
          }
          break
        case 'bearer':
          if (auth.token) {
            requestHeaders['Authorization'] = `Bearer ${auth.token}`
          }
          break
        case 'apikey':
          if (auth.apiKey && auth.apiKeyHeader) {
            requestHeaders[auth.apiKeyHeader] = auth.apiKey
          }
          break
      }
    }

    // 构建请求选项
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders
    }

    if (body && method !== 'GET') {
      if (typeof body === 'object') {
        requestOptions.body = JSON.stringify(body)
        requestHeaders['Content-Type'] = 'application/json'
      } else {
        requestOptions.body = body
      }
    }

    // 设置超时
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout || 10000)

    try {
      const response = await fetch(requestUrl, {
        ...requestOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时')
      }
      throw error
    }
  }
}

/**
 * WebSocket 数据源适配器
 */
export class WebSocketDataSourceAdapter extends BaseDataSourceAdapter {
  type: DataSourceType = 'websocket'
  private ws?: WebSocket
  private reconnectTimer?: number
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  protected async doConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const { url } = this.config

      if (!url) {
        reject(new Error('WebSocket数据源缺少URL配置'))
        return
      }

      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        resolve()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.notifyCallbacks(data)
        } catch (error) {
          console.error('WebSocket消息解析失败:', error)
        }
      }

      this.ws.onclose = () => {
        this.status = 'disconnected'
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error)
        this.status = 'error'
        reject(new Error('WebSocket连接失败'))
      }
    })
  }

  protected async doDisconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }

    if (this.ws) {
      this.ws.close()
      this.ws = undefined
    }
  }

  protected async doTestConnection(): Promise<void> {
    // WebSocket 测试连接需要实际建立连接
    await this.doConnect()
    await this.doDisconnect()
  }

  async fetchData(): Promise<any> {
    // WebSocket 是推送模式，不支持主动获取数据
    throw new Error('WebSocket数据源不支持主动获取数据')
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket重连次数超过限制')
      return
    }

    this.reconnectAttempts++
    this.status = 'reconnecting'

    const delay = Math.pow(2, this.reconnectAttempts) * 1000 // 指数退避
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.doConnect()
        this.status = 'connected'
      } catch (error) {
        console.error('WebSocket重连失败:', error)
        this.attemptReconnect()
      }
    }, delay)
  }
}

/**
 * 静态数据源适配器
 */
export class StaticDataSourceAdapter extends BaseDataSourceAdapter {
  type: DataSourceType = 'static'

  protected async doConnect(): Promise<void> {
    // 静态数据源不需要连接
  }

  protected async doDisconnect(): Promise<void> {
    // 静态数据源不需要断开连接
  }

  protected async doTestConnection(): Promise<void> {
    // 静态数据源总是可用的
  }

  async fetchData(): Promise<any> {
    return this.config.staticData || null
  }
}

/**
 * GraphQL 数据源适配器
 */
export class GraphQLDataSourceAdapter extends BaseDataSourceAdapter {
  type: DataSourceType = 'graphql'

  protected async doConnect(): Promise<void> {
    // GraphQL 不需要持久连接
  }

  protected async doDisconnect(): Promise<void> {
    // GraphQL 不需要断开连接
  }

  protected async doTestConnection(): Promise<void> {
    // 发送一个简单的查询来测试连接
    await this.executeQuery('{ __typename }')
  }

  async fetchData(): Promise<any> {
    const query = this.config.customConfig?.query
    const variables = this.config.customConfig?.variables

    if (!query) {
      throw new Error('GraphQL数据源缺少查询配置')
    }

    return await this.executeQuery(query, variables)
  }

  private async executeQuery(query: string, variables?: any): Promise<any> {
    const { url, headers = {}, auth, timeout } = this.config

    if (!url) {
      throw new Error('GraphQL数据源缺少URL配置')
    }

    // 构建请求头
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }

    // 添加认证头
    if (auth?.type === 'bearer' && auth.token) {
      requestHeaders['Authorization'] = `Bearer ${auth.token}`
    }

    const requestBody = {
      query,
      variables
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout || 10000)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(`GraphQL错误: ${result.errors.map((e: any) => e.message).join(', ')}`)
      }

      return result.data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时')
      }
      throw error
    }
  }
}

/**
 * 数据源适配器工厂
 */
export class DataSourceAdapter {
  private static adapters: Map<DataSourceType, new () => BaseDataSourceAdapter> = new Map([
    ['rest', RestDataSourceAdapter],
    ['websocket', WebSocketDataSourceAdapter],
    ['static', StaticDataSourceAdapter],
    ['graphql', GraphQLDataSourceAdapter]
  ])

  constructor(private type: DataSourceType) {}

  /**
   * 创建适配器实例
   */
  static create(type: DataSourceType): BaseDataSourceAdapter {
    const AdapterClass = this.adapters.get(type)
    if (!AdapterClass) {
      throw new Error(`不支持的数据源类型: ${type}`)
    }
    return new AdapterClass()
  }

  /**
   * 注册自定义适配器
   */
  static register(type: DataSourceType, adapterClass: new () => BaseDataSourceAdapter): void {
    this.adapters.set(type, adapterClass)
  }

  // 实现 IDataSourceAdapter 接口
  get type(): DataSourceType {
    return this.type
  }

  async connect(config: DataSourceConfig): Promise<void> {
    const adapter = DataSourceAdapter.create(this.type)
    return adapter.connect(config)
  }

  async disconnect(): Promise<void> {
    // 由具体适配器实例处理
  }

  async fetchData(): Promise<any> {
    // 由具体适配器实例处理
    throw new Error('方法需要由具体适配器实例实现')
  }

  subscribe(callback: (data: any) => void): void {
    // 由具体适配器实例处理
  }

  unsubscribe(): void {
    // 由具体适配器实例处理
  }

  getStatus(): DataSourceStatus {
    return 'disconnected'
  }

  async testConnection(): Promise<boolean> {
    return false
  }
}
