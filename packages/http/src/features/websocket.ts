/**
 * WebSocket 连接状态
 */
export enum WebSocketStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/**
 * WebSocket 消息类型
 */
export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp?: number
  id?: string
}

/**
 * WebSocket 客户端配置
 */
export interface WebSocketClientConfig {
  /** WebSocket URL */
  url: string
  /** 子协议 */
  protocols?: string | string[]
  /** 自动重连 */
  autoReconnect?: boolean
  /** 重连延迟（毫秒） */
  reconnectDelay?: number
  /** 最大重连次数 */
  maxReconnectAttempts?: number
  /** 心跳间隔（毫秒） */
  heartbeatInterval?: number
  /** 心跳消息 */
  heartbeatMessage?: any
  /** 连接超时（毫秒） */
  connectionTimeout?: number
  /** 调试模式 */
  debug?: boolean
  /** 自定义请求头（仅 Node.js 环境） */
  headers?: Record<string, string>
}

/**
 * WebSocket 事件���型
 */
export type WebSocketEventType =
  | 'open'
  | 'close'
  | 'error'
  | 'message'
  | 'reconnect'
  | 'reconnecting'
  | 'reconnect_failed'

/**
 * WebSocket 事件监听器
 */
export type WebSocketEventListener<T = any> = (data?: T) => void

/**
 * WebSocket 客户端
 *
 * 提供 WebSocket 连接管理，支持自动重连、心跳检测、消息队列等功能
 *
 * @example
 * ```typescript
 * const wsClient = new WebSocketClient({
 *   url: 'ws://localhost:3000',
 *   autoReconnect: true,
 *   heartbeatInterval: 30000,
 * })
 *
 * // 监听消息
 * wsClient.on('message', (message) => {
 *   
 * })
 *
 * // 连接
 * await wsClient.connect()
 *
 * // 发送消息
 * wsClient.send({ type: 'chat', data: 'Hello' })
 *
 * // 断开连接
 * wsClient.disconnect()
 * ```
 */
export class WebSocketClient {
  private config: Omit<Required<WebSocketClientConfig>, 'protocols'> & { protocols?: string | string[] }
  private ws: WebSocket | null = null
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED
  private eventListeners: Map<WebSocketEventType, Set<WebSocketEventListener>> = new Map()
  private messageQueue: any[] = []
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private connectionTimer: ReturnType<typeof setTimeout> | null = null

  constructor(config: WebSocketClientConfig) {
    this.config = {
      url: config.url,
      protocols: config.protocols,
      autoReconnect: config.autoReconnect ?? true,
      reconnectDelay: config.reconnectDelay ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      heartbeatMessage: config.heartbeatMessage ?? { type: 'ping' },
      connectionTimeout: config.connectionTimeout ?? 10000,
      debug: config.debug ?? false,
      headers: config.headers || {},
    }
  }

  /**
   * 连接 WebSocket
   */
  async connect(): Promise<void> {
    if (this.status === WebSocketStatus.CONNECTED || this.status === WebSocketStatus.CONNECTING) {
      this.log('Already connected or connecting')
      return
    }

    return new Promise((resolve, reject) => {
      this.status = WebSocketStatus.CONNECTING
      this.log(`Connecting to ${this.config?.url}`)

      try {
        this.ws = new WebSocket(this.config?.url, this.config?.protocols)

        // 连接超时处理
        this.connectionTimer = setTimeout(() => {
          if (this.status === WebSocketStatus.CONNECTING) {
            this.ws?.close()
            reject(new Error('Connection timeout'))
          }
        }, this.config?.connectionTimeout)

        this.ws.onopen = () => {
          if (this.connectionTimer) {
            clearTimeout(this.connectionTimer)
            this.connectionTimer = null
          }

          this.status = WebSocketStatus.CONNECTED
          this.reconnectAttempts = 0
          this.log('Connected')

          // 启动心跳
          this.startHeartbeat()

          // 发送队列中的消息
          this.flushMessageQueue()

          // 触发 open 事件
          this.emit('open')
          resolve()
        }

        this.ws.onclose = (event) => {
          this.log(`Disconnected: ${event.code} ${event.reason}`)
          this.handleDisconnection(event.code, event.reason)
        }

        this.ws.onerror = (error) => {
          this.log('Error:', error)
          this.status = WebSocketStatus.ERROR
          this.emit('error', error)
          reject(error)
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }
      }
      catch (error) {
        this.status = WebSocketStatus.ERROR
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(code = 1000, reason = 'Normal closure'): void {
    this.log(`Disconnecting: ${code} ${reason}`)

    // 清除定时器
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer)
      this.connectionTimer = null
    }

    // 关闭连接
    if (this.ws) {
      this.status = WebSocketStatus.DISCONNECTING
      this.ws.close(code, reason)
      this.ws = null
    }

    this.status = WebSocketStatus.DISCONNECTED
    this.emit('close', { code, reason })
  }

  /**
   * 发送消息
   */
  send(data: any): boolean {
    if (this.status !== WebSocketStatus.CONNECTED) {
      // 如果未连接，添加到队列
      this.messageQueue.push(data)
      this.log('Message queued (not connected)')
      return false
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      this.ws?.send(message)
      this.log('Message sent:', data)
      return true
    }
    catch (error) {
      this.log('Failed to send message:', error)
      return false
    }
  }

  /**
   * 监听事件
   */
  on<T = any>(event: WebSocketEventType, listener: WebSocketEventListener<T>): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener as WebSocketEventListener)

    // 返回取消监听函数
    return () => this.off(event, listener)
  }

  /**
   * 取消监听
   */
  off(event: WebSocketEventType, listener: WebSocketEventListener): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  /**
   * 监听一次事件
   */
  once<T = any>(event: WebSocketEventType, listener: WebSocketEventListener<T>): void {
    const wrappedListener = (data?: T) => {
      listener(data)
      this.off(event, wrappedListener)
    }
    this.on(event, wrappedListener)
  }

  /**
   * 获取连接状态
   */
  getStatus(): WebSocketStatus {
    return this.status
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.status === WebSocketStatus.CONNECTED
  }

  /**
   * 获取队列大小
   */
  getQueueSize(): number {
    return this.messageQueue.length
  }

  /**
   * 清空消息队列
   */
  clearQueue(): void {
    this.messageQueue = []
  }

  /**
   * 获取重连次数
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<WebSocketClientConfig>): void {
    Object.assign(this.config, config)

    // 如果已连接且修改了心跳配置，重新启动心跳
    if (this.isConnected() && (config.heartbeatInterval || config.heartbeatMessage)) {
      this.stopHeartbeat()
      this.startHeartbeat()
    }
  }

  /**
   * 获取原生 WebSocket 实例
   */
  getWebSocket(): WebSocket | null {
    return this.ws
  }

  /**
   * 触发事件
   */
  private emit(event: WebSocketEventType, data?: any): void {
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
  private handleMessage(data: string | ArrayBuffer | Blob): void {
    try {
      let message: any
      if (typeof data === 'string') {
        message = JSON.parse(data)
      }
      else {
        // 处理二进制数据
        message = data
      }

      this.log('Message received:', message)
      this.emit('message', message)
    }
    catch (error) {
      this.log('Failed to parse message:', error)
      this.emit('message', data)
    }
  }

  /**
   * 处理断开连接
   */
  private handleDisconnection(code: number, reason: string): void {
    this.stopHeartbeat()
    this.status = WebSocketStatus.DISCONNECTED

    // 触发 close 事件
    this.emit('close', { code, reason })

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

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect()
        this.log('Reconnected successfully')
        this.emit('reconnect')
      }
      catch (error) {
        this.log('Reconnect failed:', error)
        // handleDisconnection 会处理下一次重连
      }
    }, this.config?.reconnectDelay * this.reconnectAttempts)
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    if (this.config?.heartbeatInterval <= 0) {
      return
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send(this.config?.heartbeatMessage)
        this.log('Heartbeat sent')
      }
    }, this.config?.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 刷新消息队列
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) {
      return
    }

    this.log(`Flushing ${this.messageQueue.length} queued messages`)
    const queue = [...this.messageQueue]
    this.messageQueue = []

    queue.forEach((message) => {
      this.send(message)
    })
  }

  /**
   * 日志输出
   */
  private log(..._args: any[]): void {
    if (this.config?.debug) {
      // console.log('[WebSocket]', ...args)
    }
  }
}

/**
 * 创建 WebSocket 客户端
 */
export function createWebSocketClient(config: WebSocketClientConfig): WebSocketClient {
  return new WebSocketClient(config)
}
