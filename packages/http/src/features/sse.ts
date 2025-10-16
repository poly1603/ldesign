/**
 * SSE 事件类型
 */
export interface SSEEvent {
  /** 事件类型 */
  type: string
  /** 事件数据 */
  data: string
  /** 事件 ID */
  id?: string
  /** 重连延迟 */
  retry?: number
}

/**
 * SSE 客户端配置
 */
export interface SSEClientConfig {
  /** SSE 端点 URL */
  url: string
  /** 请求配置 */
  withCredentials?: boolean
  /** 自定义请求头 */
  headers?: Record<string, string>
  /** 自动重连 */
  autoReconnect?: boolean
  /** 重连延迟（毫秒） */
  reconnectDelay?: number
  /** 最大重连次数 */
  maxReconnectAttempts?: number
  /** 心跳超时（毫秒） */
  heartbeatTimeout?: number
  /** 调试模式 */
  debug?: boolean
}

/**
 * SSE 连接状态
 */
export enum SSEStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/**
 * SSE 事件监听器
 */
export type SSEEventListener<T = any> = (event: T) => void

/**
 * SSE 客户端
 *
 * 提供 Server-Sent Events (SSE) 连接管理，支持自动重连、心跳检测等功能
 *
 * @example
 * ```typescript
 * const sseClient = new SSEClient({
 *   url: 'http://localhost:3000/events',
 *   autoReconnect: true,
 * })
 *
 * // 监听消息
 * sseClient.on('message', (event) => {
 *   
 * })
 *
 * // 监听自定义事件
 * sseClient.addEventListener('notification', (event) => {
 *   
 * })
 *
 * // 连接
 * await sseClient.connect()
 *
 * // 断开连接
 * sseClient.disconnect()
 * ```
 */
export class SSEClient {
  private config: Required<SSEClientConfig>
  private eventSource: EventSource | null = null
  private status: SSEStatus = SSEStatus.DISCONNECTED
  private eventListeners: Map<string, Set<SSEEventListener>> = new Map()
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null
  private lastEventId: string | null = null

  constructor(config: SSEClientConfig) {
    this.config = {
      url: config.url,
      withCredentials: config.withCredentials ?? false,
      headers: config.headers || {},
      autoReconnect: config.autoReconnect ?? true,
      reconnectDelay: config.reconnectDelay ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      heartbeatTimeout: config.heartbeatTimeout ?? 30000,
      debug: config.debug ?? false,
    }
  }

  /**
   * 连接 SSE
   */
  async connect(): Promise<void> {
    if (this.status === SSEStatus.CONNECTED || this.status === SSEStatus.CONNECTING) {
      this.log('Already connected or connecting')
      return
    }

    return new Promise((resolve, reject) => {
      this.status = SSEStatus.CONNECTING
      this.log(`Connecting to ${this.config?.url}`)

      try {
        // 构建 URL（添加 lastEventId 如果存在）
        let url = this.config?.url
        if (this.lastEventId) {
          const separator = url.includes('?') ? '&' : '?'
          url += `${separator}lastEventId=${encodeURIComponent(this.lastEventId)}`
        }

        // 创建 EventSource
        this.eventSource = new EventSource(url, {
          withCredentials: this.config?.withCredentials,
        })

        // 连接打开
        this.eventSource.onopen = () => {
          this.status = SSEStatus.CONNECTED
          this.reconnectAttempts = 0
          this.log('Connected')

          // 启动心跳检测
          this.startHeartbeat()

          // 触发 open 事件
          this.emit('open')
          resolve()
        }

        // 接收消息
        this.eventSource.onmessage = (event: MessageEvent) => {
          this.handleMessage(event)
        }

        // 错误处理
        this.eventSource.onerror = (error) => {
          this.log('Error:', error)

          if (this.status === SSEStatus.CONNECTING) {
            // 连接失败
            this.status = SSEStatus.ERROR
            this.emit('error', error)
            reject(error)
          }
          else {
            // 连接断开
            this.handleDisconnection()
          }
        }
      }
      catch (error) {
        this.status = SSEStatus.ERROR
        this.emit('error', error)
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.log('Disconnecting')

    // 清除定时器
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    // 关闭连接
    if (this.eventSource) {
      this.status = SSEStatus.DISCONNECTING
      this.eventSource.close()
      this.eventSource = null
    }

    this.status = SSEStatus.DISCONNECTED
    this.emit('close')
  }

  /**
   * 监听默认消息事件
   */
  on(event: 'message' | 'open' | 'close' | 'error' | 'reconnect' | 'reconnecting' | 'reconnect_failed', listener: SSEEventListener): () => void {
    return this.addEventListener(event, listener)
  }

  /**
   * 监听自定义事件
   */
  addEventListener(event: string, listener: SSEEventListener): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)

    // 如果已连接，注册到 EventSource
    if (this.eventSource && event !== 'open' && event !== 'close' && event !== 'error') {
      this.eventSource.addEventListener(event, listener as any)
    }

    // 返回取消监听函数
    return () => this.removeEventListener(event, listener)
  }

  /**
   * 取消监听
   */
  removeEventListener(event: string, listener: SSEEventListener): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
    }

    // 从 EventSource 移除
    if (this.eventSource) {
      this.eventSource.removeEventListener(event, listener as any)
    }
  }

  /**
   * 监听一次事件
   */
  once(event: string, listener: SSEEventListener): void {
    const wrappedListener = (data: any) => {
      listener(data)
      this.removeEventListener(event, wrappedListener)
    }
    this.addEventListener(event, wrappedListener)
  }

  /**
   * 获取连接状态
   */
  getStatus(): SSEStatus {
    return this.status
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.status === SSEStatus.CONNECTED
  }

  /**
   * 获取重连次数
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts
  }

  /**
   * 获取最后的事件 ID
   */
  getLastEventId(): string | null {
    return this.lastEventId
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SSEClientConfig>): void {
    Object.assign(this.config, config)

    // 如果已连接且修改了心跳配置，重新启动心跳
    if (this.isConnected() && config.heartbeatTimeout) {
      this.stopHeartbeat()
      this.startHeartbeat()
    }
  }

  /**
   * 获取原生 EventSource 实例
   */
  getEventSource(): EventSource | null {
    return this.eventSource
  }

  /**
   * 获取就绪状态
   */
  getReadyState(): number {
    return this.eventSource?.readyState ?? EventSource.CLOSED
  }

  /**
   * 触发事件
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data)
        }
        catch (error) {
          this.log('Error in event listener:', error)
        }
      })
    }
  }

  /**
   * 处理消息
   */
  private handleMessage(event: MessageEvent): void {
    // 重置心跳定时器
    this.resetHeartbeat()

    // 保存最后的事件 ID
    if (event.lastEventId) {
      this.lastEventId = event.lastEventId
    }

    this.log('Message received:', event.data)
    this.emit('message', {
      type: event.type,
      data: event.data,
      id: event.lastEventId,
    })
  }

  /**
   * 处理断开连接
   */
  private handleDisconnection(): void {
    this.stopHeartbeat()
    this.status = SSEStatus.DISCONNECTED

    // 触发 close 事件
    this.emit('close')

    // 自动重连
    if (this.config?.autoReconnect && this.reconnectAttempts < this.config?.maxReconnectAttempts) {
      this.reconnect()
    }
    else if (this.reconnectAttempts >= this.config?.maxReconnectAttempts) {
      this.log('Max reconnect attempts reached')
      this.emit('reconnect_failed')
    }
  }

  /**
   * 重连
   */
  private reconnect(): void {
    this.reconnectAttempts++
    this.log(`Reconnecting... (attempt ${this.reconnectAttempts}/${this.config?.maxReconnectAttempts})`)

    this.emit('reconnecting', { attempts: this.reconnectAttempts })

    // 关闭旧连接
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect()
        this.log('Reconnected successfully')
        this.emit('reconnect')
      }
      catch (error) {
        this.log('Reconnect failed:', error)
        this.handleDisconnection()
      }
    }, this.config?.reconnectDelay * this.reconnectAttempts)
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat(): void {
    if (this.config?.heartbeatTimeout <= 0) {
      return
    }

    this.heartbeatTimer = setTimeout(() => {
      this.log('Heartbeat timeout')
      // 心跳超时，认为连接已断开
      this.handleDisconnection()
    }, this.config?.heartbeatTimeout)
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 重置心跳定时器
   */
  private resetHeartbeat(): void {
    this.stopHeartbeat()
    this.startHeartbeat()
  }

  /**
   * 日志输出
   */
  private log(..._args: any[]): void {
    if (this.config?.debug) {
      // console.log('[SSE]', ...args)
    }
  }
}

/**
 * 创建 SSE 客户端
 */
export function createSSEClient(config: SSEClientConfig): SSEClient {
  return new SSEClient(config)
}

/**
 * 基础 SSE 客户端包装器
 */
export class BasicSSEClient {
  private client: SSEClient
  private handlers: Map<string, SSEEventListener[]> = new Map()

  constructor(url: string, options?: Partial<SSEClientConfig>) {
    this.client = new SSEClient({
      url,
      ...options,
    })
  }

  /**
   * 订阅事件流
   */
  async subscribe(eventType: string, handler: SSEEventListener): Promise<() => void> {
    // 保存处理器
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, [])
    }
    this.handlers.get(eventType)!.push(handler)

    // 连接（如果还未连接）
    if (!this.client.isConnected()) {
      await this.client.connect()
    }

    // 添加事件监听器
    return this.client.addEventListener(eventType, handler)
  }

  /**
   * 取消订阅
   */
  unsubscribe(eventType?: string): void {
    if (eventType) {
      // 取消指定事件的所有监听器
      const handlers = this.handlers.get(eventType)
      if (handlers) {
        handlers.forEach((handler) => {
          this.client.removeEventListener(eventType, handler)
        })
        this.handlers.delete(eventType)
      }
    }
    else {
      // 取消所有事件的监听器
      this.handlers.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          this.client.removeEventListener(event, handler)
        })
      })
      this.handlers.clear()
    }

    // 如果没有任何监���器了，断开连接
    if (this.handlers.size === 0) {
      this.client.disconnect()
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.unsubscribe()
    this.client.disconnect()
  }

  /**
   * 获取底层客户端
   */
  getClient(): SSEClient {
    return this.client
  }
}

/**
 * 创建基础 SSE 客户端
 */
export function createBasicSSEClient(url: string, options?: Partial<SSEClientConfig>): BasicSSEClient {
  return new BasicSSEClient(url, options)
}
