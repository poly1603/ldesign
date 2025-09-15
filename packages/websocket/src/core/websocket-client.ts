/**
 * WebSocket 客户端核心类
 * 
 * 提供完整的 WebSocket 客户端功能，包括连接管理、自动重连、心跳检测、
 * 消息队列、认证等高级特性
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import {
  WebSocketState,
  MessageType,
  MessagePriority,
  ReconnectStrategy,
  AuthType,
  LogLevel
} from '@/types'

import type {
  WebSocketClientConfig,
  WebSocketMessage,
  WebSocketEventMap,
  ConnectionStats
} from '@/types'

import { WebSocketEventEmitter } from './event-emitter'
import {
  generateUUID,
  delay,
  retry,
  deepMerge,
  isWebSocketUrl,
  now,
  safeJsonParse,
  safeJsonStringify
} from '@/utils'

/**
 * 默认配置
 */
const DEFAULT_CONFIG: WebSocketClientConfig = {
  url: '',
  protocols: undefined,
  connectionTimeout: 10000,
  reconnect: {
    enabled: true,
    strategy: ReconnectStrategy.EXPONENTIAL,
    initialDelay: 1000,
    maxDelay: 30000,
    maxAttempts: 5,
    backoffMultiplier: 2,
    jitter: 1000
  },
  heartbeat: {
    enabled: true,
    interval: 30000,
    timeout: 5000,
    message: 'ping',
    messageType: MessageType.TEXT,
    maxFailures: 3
  },
  auth: {
    type: AuthType.NONE,
    autoRefresh: false
  },
  messageQueue: {
    enabled: true,
    maxSize: 1000,
    persistent: false,
    storageKey: 'websocket_message_queue',
    messageExpiry: 300000, // 5分钟
    deduplication: true
  },
  logLevel: LogLevel.INFO,
  debug: false,
  compression: false,
  maxMessageSize: 1024 * 1024 // 1MB
}

/**
 * WebSocket 客户端类
 */
export class WebSocketClient extends WebSocketEventEmitter<WebSocketEventMap> {
  /** 配置信息 */
  private readonly config: WebSocketClientConfig

  /** WebSocket 实例 */
  private ws: WebSocket | null = null

  /** 当前连接状态 */
  private state: WebSocketState = WebSocketState.DISCONNECTED

  /** 重连计数器 */
  private reconnectAttempts = 0

  /** 重连定时器 */
  private reconnectTimer: NodeJS.Timeout | null = null

  /** 心跳定时器 */
  private heartbeatTimer: NodeJS.Timeout | null = null

  /** 心跳超时定时器 */
  private heartbeatTimeoutTimer: NodeJS.Timeout | null = null

  /** 心跳失败计数器 */
  private heartbeatFailures = 0

  /** 最后一次心跳发送时间 */
  private lastHeartbeatSent = 0

  /** 消息队列 */
  private messageQueue: WebSocketMessage[] = []

  /** 待确认消息映射 */
  private pendingMessages = new Map<string, {
    message: WebSocketMessage
    resolve: (value: unknown) => void
    reject: (error: Error) => void
    timer: NodeJS.Timeout
  }>()

  /** 连接统计信息 */
  private stats: ConnectionStats = {
    connectedAt: null,
    totalConnectedTime: 0,
    reconnectCount: 0,
    messagesSent: 0,
    messagesReceived: 0,
    messagesFailedToSend: 0,
    averageLatency: 0,
    lastHeartbeatAt: null,
    heartbeatFailures: 0
  }

  /** 延迟测量数组 */
  private latencyMeasurements: number[] = []

  /**
   * 构造函数
   * @param config 配置选项
   */
  constructor(config: Partial<WebSocketClientConfig>) {
    super()

    // 合并配置
    this.config = deepMerge({}, DEFAULT_CONFIG, config)

    // 验证配置
    this.validateConfig()

    // 初始化消息队列
    this.initializeMessageQueue()

    // 设置事件监听器
    this.setupEventListeners()

    this.log('info', 'WebSocket 客户端已初始化', { config: this.config })
  }

  /**
   * 连接到 WebSocket 服务器
   * @returns Promise<void>
   */
  async connect(): Promise<void> {
    if (this.state === WebSocketState.CONNECTED || this.state === WebSocketState.CONNECTING) {
      this.log('warn', '连接已存在或正在连接中')
      return
    }

    this.setState(WebSocketState.CONNECTING)
    this.log('info', '开始连接到 WebSocket 服务器', { url: this.config.url })

    try {
      await this.createConnection()
      this.log('info', 'WebSocket 连接成功建立')
    } catch (error) {
      this.log('error', 'WebSocket 连接失败', { error })
      this.setState(WebSocketState.ERROR)

      if (this.config.reconnect.enabled) {
        this.scheduleReconnect()
      }

      throw error
    }
  }

  /**
   * 断开 WebSocket 连接
   * @param code 关闭代码
   * @param reason 关闭原因
   */
  disconnect(code = 1000, reason = '正常关闭'): void {
    this.log('info', '主动断开 WebSocket 连接', { code, reason })

    // 清理定时器
    this.clearTimers()

    // 关闭连接
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(code, reason)
    }

    this.setState(WebSocketState.CLOSED)
    this.ws = null
  }

  /**
   * 发送消息
   * @param data 消息数据
   * @param options 发送选项
   * @returns Promise<void>
   */
  async send<T = unknown>(
    data: T,
    options: {
      type?: MessageType
      priority?: MessagePriority
      needsAck?: boolean
      timeout?: number
    } = {}
  ): Promise<void> {
    const message: WebSocketMessage<T> = {
      id: generateUUID(),
      type: options.type || MessageType.JSON,
      data,
      timestamp: now(),
      priority: options.priority || MessagePriority.NORMAL,
      needsAck: options.needsAck || false,
      retryCount: 0,
      maxRetries: 3
    }

    return this.sendMessage(message, options.timeout)
  }

  /**
   * 获取当前连接状态
   * @returns 连接状态
   */
  getState(): WebSocketState {
    return this.state
  }

  /**
   * 获取连接统计信息
   * @returns 统计信息
   */
  getStats(): ConnectionStats {
    return { ...this.stats }
  }

  /**
   * 获取配置信息
   * @returns 配置信息
   */
  getConfig(): WebSocketClientConfig {
    return { ...this.config }
  }

  /**
   * 检查是否已连接
   * @returns 是否已连接
   */
  isConnected(): boolean {
    return this.state === WebSocketState.CONNECTED &&
      this.ws !== null &&
      this.ws.readyState === WebSocket.OPEN
  }

  /**
   * 检查是否正在连接
   * @returns 是否正在连接
   */
  isConnecting(): boolean {
    return this.state === WebSocketState.CONNECTING
  }

  /**
   * 检查是否正在重连
   * @returns 是否正在重连
   */
  isReconnecting(): boolean {
    return this.state === WebSocketState.RECONNECTING
  }

  /**
   * 获取消息队列长度
   * @returns 队列长度
   */
  getQueueLength(): number {
    return this.messageQueue.length
  }

  /**
   * 清空消息队列
   */
  clearQueue(): void {
    this.messageQueue.length = 0
    this.log('info', '消息队列已清空')
  }

  /**
   * 销毁客户端实例
   */
  destroy(): void {
    this.log('info', '销毁 WebSocket 客户端')

    // 断开连接
    this.disconnect(1000, '客户端销毁')

    // 清理所有定时器
    this.clearTimers()

    // 清理消息队列
    this.clearQueue()

    // 清理待确认消息
    this.clearPendingMessages()

    // 移除所有事件监听器
    this.removeAllListeners()
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    if (!this.config.url) {
      throw new Error('WebSocket URL 不能为空')
    }

    if (!isWebSocketUrl(this.config.url)) {
      throw new Error('无效的 WebSocket URL')
    }

    if (this.config.connectionTimeout <= 0) {
      throw new Error('连接超时时间必须大于 0')
    }

    if (this.config.reconnect.maxAttempts < 0) {
      throw new Error('最大重连次数不能小于 0')
    }

    if (this.config.heartbeat.interval <= 0) {
      throw new Error('心跳间隔必须大于 0')
    }

    if (this.config.messageQueue.maxSize <= 0) {
      throw new Error('消息队列最大长度必须大于 0')
    }
  }

  /**
   * 初始化消息队列
   */
  private initializeMessageQueue(): void {
    if (!this.config.messageQueue.enabled) {
      return
    }

    // 从本地存储恢复消息队列
    if (this.config.messageQueue.persistent && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.config.messageQueue.storageKey)
        if (stored) {
          const messages = safeJsonParse<WebSocketMessage[]>(stored, [])
          const now = Date.now()

          // 过滤过期消息
          this.messageQueue = messages.filter(msg =>
            now - msg.timestamp < this.config.messageQueue.messageExpiry
          )

          this.log('info', `从本地存储恢复了 ${this.messageQueue.length} 条消息`)
        }
      } catch (error) {
        this.log('error', '恢复消息队列失败', { error })
      }
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听状态变化事件
    this.on('stateChange', ({ from, to }) => {
      this.log('info', `状态变化: ${from} -> ${to}`)
    })

    // 监听连接成功事件
    this.on('open', () => {
      this.stats.connectedAt = now()
      this.reconnectAttempts = 0

      // 开始心跳
      if (this.config.heartbeat.enabled) {
        this.startHeartbeat()
      }

      // 处理消息队列
      this.processMessageQueue()
    })

    // 监听连接关闭事件
    this.on('close', (event) => {
      if (this.stats.connectedAt) {
        this.stats.totalConnectedTime += now() - this.stats.connectedAt
        this.stats.connectedAt = null
      }

      // 停止心跳
      this.stopHeartbeat()

      // 如果不是主动关闭且启用了重连，则尝试重连
      if (event.code !== 1000 && this.config.reconnect.enabled) {
        this.scheduleReconnect()
      }
    })

    // 监听消息事件
    this.on('message', (message) => {
      this.stats.messagesReceived++
      this.handleIncomingMessage(message)
    })

    // 监听错误事件
    this.on('error', (error) => {
      this.log('error', 'WebSocket 错误', { error })
    })
  }

  /**
   * 创建 WebSocket 连接
   */
  private async createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 创建 WebSocket 实例
        this.ws = new WebSocket(this.config.url, this.config.protocols)

        // 设置二进制数据类型
        this.ws.binaryType = 'arraybuffer'

        // 连接超时处理
        const timeoutId = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close()
            reject(new Error('连接超时'))
          }
        }, this.config.connectionTimeout)

        // 连接成功
        this.ws.onopen = (event) => {
          clearTimeout(timeoutId)
          this.setState(WebSocketState.CONNECTED)
          this.emit('open', event)
          resolve()
        }

        // 连接关闭
        this.ws.onclose = (event) => {
          clearTimeout(timeoutId)
          this.setState(WebSocketState.DISCONNECTED)
          this.emit('close', event)
          this.ws = null
        }

        // 连接错误
        this.ws.onerror = (event) => {
          clearTimeout(timeoutId)
          this.setState(WebSocketState.ERROR)
          this.emit('error', event)
          reject(new Error('WebSocket 连接错误'))
        }

        // 接收消息
        this.ws.onmessage = (event) => {
          this.handleRawMessage(event)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 处理原始消息
   */
  private handleRawMessage(event: MessageEvent): void {
    try {
      let message: WebSocketMessage

      if (typeof event.data === 'string') {
        // 文本消息
        try {
          const parsed = JSON.parse(event.data)
          message = {
            id: parsed.id || generateUUID(),
            type: parsed.type || MessageType.JSON,
            data: parsed.data || parsed,
            timestamp: parsed.timestamp || now(),
            priority: parsed.priority || MessagePriority.NORMAL
          }
        } catch {
          // 纯文本消息
          message = {
            id: generateUUID(),
            type: MessageType.TEXT,
            data: event.data,
            timestamp: now(),
            priority: MessagePriority.NORMAL
          }
        }
      } else {
        // 二进制消息
        message = {
          id: generateUUID(),
          type: MessageType.BINARY,
          data: event.data,
          timestamp: now(),
          priority: MessagePriority.NORMAL
        }
      }

      this.emit('message', message)

    } catch (error) {
      this.log('error', '处理消息失败', { error, data: event.data })
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleIncomingMessage(message: WebSocketMessage): void {
    // 处理心跳响应
    if (message.type === MessageType.HEARTBEAT) {
      this.handleHeartbeatResponse(message)
      return
    }

    // 处理消息确认
    if (message.data && typeof message.data === 'object' && 'ackId' in message.data) {
      this.handleMessageAck(message.data.ackId as string)
      return
    }

    // 发射消息接收事件
    this.emit('messageReceived', message)
  }

  /**
   * 发送消息
   */
  private async sendMessage<T>(message: WebSocketMessage<T>, timeout?: number): Promise<void> {
    // 检查连接状态
    if (!this.isConnected()) {
      if (this.config.messageQueue.enabled) {
        this.addToQueue(message)
        this.log('info', '连接未建立，消息已加入队列', { messageId: message.id })
        return
      } else {
        throw new Error('WebSocket 连接未建立')
      }
    }

    try {
      // 序列化消息
      const serialized = this.serializeMessage(message)

      // 检查消息大小
      if (this.config.maxMessageSize && serialized.length > this.config.maxMessageSize) {
        throw new Error(`消息大小超过限制: ${serialized.length} > ${this.config.maxMessageSize}`)
      }

      // 发送消息
      this.ws!.send(serialized)
      this.stats.messagesSent++

      // 发射消息发送事件
      this.emit('messageSent', message)

      // 如果需要确认，等待确认
      if (message.needsAck && timeout) {
        await this.waitForAck(message.id, timeout)
      }

      this.log('debug', '消息发送成功', { messageId: message.id, type: message.type })

    } catch (error) {
      this.stats.messagesFailedToSend++
      this.emit('messageFailed', { message, error: error as Error })
      this.log('error', '消息发送失败', { messageId: message.id, error })
      throw error
    }
  }

  /**
   * 序列化消息
   */
  private serializeMessage<T>(message: WebSocketMessage<T>): string | ArrayBuffer {
    switch (message.type) {
      case MessageType.TEXT:
        return String(message.data)

      case MessageType.JSON:
        return safeJsonStringify(message)

      case MessageType.BINARY:
        if (message.data instanceof ArrayBuffer) {
          return message.data
        }
        throw new Error('二进制消息数据必须是 ArrayBuffer 类型')

      case MessageType.HEARTBEAT:
        return safeJsonStringify({
          type: 'heartbeat',
          data: message.data,
          timestamp: message.timestamp
        })

      default:
        return safeJsonStringify(message)
    }
  }

  /**
   * 等待消息确认
   */
  private waitForAck(messageId: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingMessages.delete(messageId)
        reject(new Error('消息确认超时'))
      }, timeout)

      this.pendingMessages.set(messageId, {
        message: {} as WebSocketMessage, // 这里可以存储原始消息
        resolve,
        reject,
        timer
      })
    })
  }

  /**
   * 处理消息确认
   */
  private handleMessageAck(ackId: string): void {
    const pending = this.pendingMessages.get(ackId)
    if (pending) {
      clearTimeout(pending.timer)
      this.pendingMessages.delete(ackId)
      pending.resolve(undefined)
    }
  }

  /**
   * 添加消息到队列
   */
  private addToQueue<T>(message: WebSocketMessage<T>): void {
    // 检查队列大小
    if (this.messageQueue.length >= this.config.messageQueue.maxSize) {
      // 移除最旧的消息
      this.messageQueue.shift()
    }

    // 去重检查
    if (this.config.messageQueue.deduplication) {
      const exists = this.messageQueue.some(msg => msg.id === message.id)
      if (exists) {
        return
      }
    }

    // 按优先级插入
    const priority = message.priority || MessagePriority.NORMAL
    const priorityOrder = {
      [MessagePriority.URGENT]: 0,
      [MessagePriority.HIGH]: 1,
      [MessagePriority.NORMAL]: 2,
      [MessagePriority.LOW]: 3
    }

    let insertIndex = this.messageQueue.length
    for (let i = 0; i < this.messageQueue.length; i++) {
      const msgPriority = this.messageQueue[i].priority || MessagePriority.NORMAL
      if (priorityOrder[priority] < priorityOrder[msgPriority]) {
        insertIndex = i
        break
      }
    }

    this.messageQueue.splice(insertIndex, 0, message)

    // 持久化到本地存储
    this.persistMessageQueue()
  }

  /**
   * 处理消息队列
   */
  private async processMessageQueue(): Promise<void> {
    if (!this.config.messageQueue.enabled || this.messageQueue.length === 0) {
      return
    }

    this.log('info', `开始处理消息队列，共 ${this.messageQueue.length} 条消息`)

    const messages = [...this.messageQueue]
    this.messageQueue.length = 0

    for (const message of messages) {
      try {
        // 检查消息是否过期
        if (now() - message.timestamp > this.config.messageQueue.messageExpiry) {
          this.log('warn', '跳过过期消息', { messageId: message.id })
          continue
        }

        await this.sendMessage(message)
        await delay(10) // 避免发送过快
      } catch (error) {
        this.log('error', '队列消息发送失败', { messageId: message.id, error })

        // 重试逻辑
        if ((message.retryCount || 0) < (message.maxRetries || 3)) {
          message.retryCount = (message.retryCount || 0) + 1
          this.addToQueue(message)
        }
      }
    }

    this.persistMessageQueue()
  }

  /**
   * 持久化消息队列
   */
  private persistMessageQueue(): void {
    if (!this.config.messageQueue.persistent || typeof localStorage === 'undefined') {
      return
    }

    try {
      localStorage.setItem(
        this.config.messageQueue.storageKey,
        safeJsonStringify(this.messageQueue)
      )
    } catch (error) {
      this.log('error', '持久化消息队列失败', { error })
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnect.maxAttempts) {
      this.log('error', '已达到最大重连次数，停止重连')
      this.setState(WebSocketState.CLOSED)
      return
    }

    this.setState(WebSocketState.RECONNECTING)
    this.reconnectAttempts++
    this.stats.reconnectCount++

    const delay = this.calculateReconnectDelay()

    this.log('info', `第 ${this.reconnectAttempts} 次重连将在 ${delay}ms 后开始`)

    this.emit('reconnectStart', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.config.reconnect.maxAttempts
    })

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect()
        this.emit('reconnectSuccess', { attempt: this.reconnectAttempts })
        this.log('info', `第 ${this.reconnectAttempts} 次重连成功`)
      } catch (error) {
        this.emit('reconnectFailed', {
          attempt: this.reconnectAttempts,
          error: error as Error
        })
        this.log('error', `第 ${this.reconnectAttempts} 次重连失败`, { error })
        this.scheduleReconnect()
      }
    }, delay)
  }

  /**
   * 计算重连延迟
   */
  private calculateReconnectDelay(): number {
    const { strategy, initialDelay, maxDelay, backoffMultiplier, jitter } = this.config.reconnect

    let delay: number

    switch (strategy) {
      case ReconnectStrategy.FIXED:
        delay = initialDelay
        break

      case ReconnectStrategy.LINEAR:
        delay = initialDelay * this.reconnectAttempts
        break

      case ReconnectStrategy.EXPONENTIAL:
        delay = initialDelay * Math.pow(backoffMultiplier, this.reconnectAttempts - 1)
        break

      default:
        delay = initialDelay
    }

    // 应用最大延迟限制
    delay = Math.min(delay, maxDelay)

    // 添加抖动
    if (jitter > 0) {
      const jitterAmount = Math.random() * jitter
      delay += jitterAmount
    }

    return Math.floor(delay)
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    if (!this.config.heartbeat.enabled) {
      return
    }

    this.stopHeartbeat() // 确保没有重复的定时器

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, this.config.heartbeat.interval)

    this.log('debug', '心跳已启动', { interval: this.config.heartbeat.interval })
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }

    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }

    this.log('debug', '心跳已停止')
  }

  /**
   * 发送心跳
   */
  private async sendHeartbeat(): Promise<void> {
    if (!this.isConnected()) {
      return
    }

    try {
      const heartbeatMessage: WebSocketMessage = {
        id: generateUUID(),
        type: MessageType.HEARTBEAT,
        data: this.config.heartbeat.message,
        timestamp: now(),
        priority: MessagePriority.HIGH
      }

      this.lastHeartbeatSent = now()
      await this.sendMessage(heartbeatMessage)

      this.emit('heartbeatSent', { timestamp: this.lastHeartbeatSent })
      this.stats.lastHeartbeatAt = this.lastHeartbeatSent

      // 设置心跳超时
      this.heartbeatTimeoutTimer = setTimeout(() => {
        this.handleHeartbeatTimeout()
      }, this.config.heartbeat.timeout)

    } catch (error) {
      this.log('error', '发送心跳失败', { error })
      this.handleHeartbeatFailure()
    }
  }

  /**
   * 处理心跳响应
   */
  private handleHeartbeatResponse(message: WebSocketMessage): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }

    const latency = now() - this.lastHeartbeatSent
    this.updateLatencyStats(latency)

    this.emit('heartbeatReceived', { timestamp: now(), latency })

    // 重置心跳失败计数
    this.heartbeatFailures = 0
    this.stats.heartbeatFailures = 0

    this.log('debug', '收到心跳响应', { latency })
  }

  /**
   * 处理心跳超时
   */
  private handleHeartbeatTimeout(): void {
    this.emit('heartbeatTimeout', { timestamp: now() })
    this.log('warn', '心跳超时')
    this.handleHeartbeatFailure()
  }

  /**
   * 处理心跳失败
   */
  private handleHeartbeatFailure(): void {
    this.heartbeatFailures++
    this.stats.heartbeatFailures++

    if (this.heartbeatFailures >= this.config.heartbeat.maxFailures) {
      this.log('error', '心跳失败次数过多，断开连接')
      this.disconnect(1000, '心跳失败')
    }
  }

  /**
   * 更新延迟统计
   */
  private updateLatencyStats(latency: number): void {
    this.latencyMeasurements.push(latency)

    // 保持最近100次测量
    if (this.latencyMeasurements.length > 100) {
      this.latencyMeasurements.shift()
    }

    // 计算平均延迟
    const sum = this.latencyMeasurements.reduce((a, b) => a + b, 0)
    this.stats.averageLatency = sum / this.latencyMeasurements.length
  }

  /**
   * 设置连接状态
   */
  private setState(newState: WebSocketState): void {
    if (this.state === newState) {
      return
    }

    const oldState = this.state
    this.state = newState

    this.emit('stateChange', { from: oldState, to: newState })
  }

  /**
   * 清理所有定时器
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }

    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  /**
   * 清理待确认消息
   */
  private clearPendingMessages(): void {
    for (const [id, pending] of this.pendingMessages) {
      clearTimeout(pending.timer)
      pending.reject(new Error('客户端已销毁'))
    }
    this.pendingMessages.clear()
  }

  /**
   * 日志记录
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return
    }

    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [WebSocket] [${level.toUpperCase()}] ${message}`

    if (data) {
      console[level](logMessage, data)
    } else {
      console[level](logMessage)
    }
  }

  /**
   * 检查是否应该记录日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
      [LogLevel.SILENT]: 4
    }

    return levels[level] >= levels[this.config.logLevel]
  }
}
