/**
 * Web Worker适配器
 * 为Web Worker环境提供WebSocket支持
 */

import { BaseAdapter, type AdapterConfig, type AdapterState } from './base'
import type { WebSocketClient } from '../core/websocket-client'
import type { WebSocketConfig, WebSocketMessage } from '../types'
import { createWebSocketClient } from '../factory'

/**
 * Worker消息类型
 */
export enum WorkerMessageType {
  /** 初始化WebSocket */
  INIT = 'websocket:init',
  /** 连接WebSocket */
  CONNECT = 'websocket:connect',
  /** 断开连接 */
  DISCONNECT = 'websocket:disconnect',
  /** 发送消息 */
  SEND = 'websocket:send',
  /** 状态变化 */
  STATE_CHANGE = 'websocket:state_change',
  /** 接收到消息 */
  MESSAGE = 'websocket:message',
  /** 错误事件 */
  ERROR = 'websocket:error',
  /** 连接成功 */
  CONNECTED = 'websocket:connected',
  /** 连接断开 */
  DISCONNECTED = 'websocket:disconnected',
  /** 重连事件 */
  RECONNECTING = 'websocket:reconnecting'
}

/**
 * Worker消息接口
 */
export interface WorkerMessage {
  /** 消息类型 */
  type: WorkerMessageType
  /** 消息ID，用于请求响应匹配 */
  id?: string
  /** 消息数据 */
  data?: unknown
  /** 错误信息 */
  error?: string
}

/**
 * Web Worker适配器类
 * 在Worker线程中运行WebSocket客户端
 */
export class WorkerAdapter extends BaseAdapter {
  private messageHandlers = new Map<string, (response: WorkerMessage) => void>()
  private messageId = 0

  constructor(client: WebSocketClient, config: AdapterConfig = {}) {
    super(client, config)
    this.setupWorkerEventListeners()
  }

  /**
   * 设置Worker事件监听器
   */
  private setupWorkerEventListeners(): void {
    // 监听来自主线程的消息
    self.addEventListener('message', this.handleWorkerMessage.bind(this))
  }

  /**
   * 处理来自主线程的消息
   * @param event 消息事件
   */
  private async handleWorkerMessage(event: MessageEvent<WorkerMessage>): Promise<void> {
    const { type, id, data } = event.data

    try {
      switch (type) {
        case WorkerMessageType.INIT:
          await this.handleInit(data as { url: string; config?: Partial<WebSocketConfig> })
          this.sendResponse(id, { type: WorkerMessageType.INIT })
          break

        case WorkerMessageType.CONNECT:
          await this.client.connect()
          break

        case WorkerMessageType.DISCONNECT:
          const { code, reason } = data as { code?: number; reason?: string }
          this.client.disconnect(code, reason)
          break

        case WorkerMessageType.SEND:
          await this.client.send(data)
          this.sendResponse(id, { type: WorkerMessageType.SEND })
          break

        default:
          console.warn(`未知的Worker消息类型: ${type}`)
      }
    } catch (error) {
      this.sendResponse(id, {
        type,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * 初始化WebSocket客户端
   * @param data 初始化数据
   */
  private async handleInit(data: { url: string; config?: Partial<WebSocketConfig> }): Promise<void> {
    // 在Worker中重新创建客户端
    const newClient = createWebSocketClient({ url: data.url, ...data.config })

    // 替换当前客户端
    this.client = newClient

    // 重新设置事件监听器
    this.setupEventListeners()
  }

  /**
   * 发送响应消息到主线程
   * @param id 消息ID
   * @param message 响应消息
   */
  private sendResponse(id: string | undefined, message: Partial<WorkerMessage>): void {
    if (id) {
      self.postMessage({ ...message, id })
    }
  }

  /**
   * 发送事件消息到主线程
   * @param message 事件消息
   */
  private sendEvent(message: WorkerMessage): void {
    self.postMessage(message)
  }

  /**
   * 重写事件监听器设置，发送事件到主线程
   */
  protected setupEventListeners(): void {
    // 监听状态变化
    this.client.on('stateChange', (stateData: { from: string; to: string }) => {
      const newState = stateData.to
      const oldState = stateData.from

      this.updateState({
        state: newState,
        connected: newState === 'connected',
        connecting: newState === 'connecting',
        reconnecting: newState === 'reconnecting'
      })

      this.sendEvent({
        type: WorkerMessageType.STATE_CHANGE,
        data: { newState, oldState }
      })
    })

    // 监听连接成功
    this.client.on('connected', () => {
      this.updateState({ lastError: null })
      this.sendEvent({
        type: WorkerMessageType.CONNECTED
      })
    })

    // 监听连接断开
    this.client.on('close', (event: CloseEvent) => {
      this.sendEvent({
        type: WorkerMessageType.DISCONNECTED,
        data: { code: event.code, reason: event.reason }
      })
    })

    // 监听消息接收
    this.client.on('message', (message: WebSocketMessage) => {
      this.updateState({ lastMessage: message })
      this.sendEvent({
        type: WorkerMessageType.MESSAGE,
        data: message
      })
    })

    // 监听错误
    this.client.on('error', (error: Event) => {
      const errorMessage = error instanceof ErrorEvent ? error.message : '未知错误'
      const errorObj = new Error(errorMessage)
      this.updateState({ lastError: errorObj })
      this.sendEvent({
        type: WorkerMessageType.ERROR,
        data: { message: errorMessage }
      })
    })

    // 监听重连
    this.client.on('reconnecting', (attempt: number) => {
      this.updateState({ reconnectCount: attempt })
      this.sendEvent({
        type: WorkerMessageType.RECONNECTING,
        data: { attempt }
      })
    })
  }

  /**
   * 同步状态（Worker中不需要特殊处理）
   */
  protected syncState(): void {
    // Worker中的状态同步通过消息传递处理
  }

  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`
  }
}

/**
 * 主线程WebSocket代理类
 * 通过Worker线程管理WebSocket连接
 */
export class WebSocketWorkerProxy {
  private worker: Worker
  private messageHandlers = new Map<string, (response: WorkerMessage) => void>()
  private eventListeners = new Map<string, Set<Function>>()
  private messageId = 0
  private state: AdapterState = {
    state: 'disconnected',
    connected: false,
    connecting: false,
    reconnecting: false,
    lastError: null,
    lastMessage: null,
    reconnectCount: 0
  }

  constructor(workerScript: string | URL) {
    this.worker = new Worker(workerScript)
    this.setupWorkerEventListeners()
  }

  /**
   * 设置Worker事件监听器
   */
  private setupWorkerEventListeners(): void {
    this.worker.addEventListener('message', this.handleWorkerMessage.bind(this))
    this.worker.addEventListener('error', this.handleWorkerError.bind(this))
  }

  /**
   * 处理来自Worker的消息
   * @param event 消息事件
   */
  private handleWorkerMessage(event: MessageEvent<WorkerMessage>): void {
    const { type, id, data, error } = event.data

    // 处理响应消息
    if (id && this.messageHandlers.has(id)) {
      const handler = this.messageHandlers.get(id)!
      handler(event.data)
      this.messageHandlers.delete(id)
      return
    }

    // 处理事件消息
    switch (type) {
      case WorkerMessageType.STATE_CHANGE:
        const { newState } = data as { newState: string; oldState: string }
        this.state.state = newState as any
        this.state.connected = newState === 'connected'
        this.state.connecting = newState === 'connecting'
        this.state.reconnecting = newState === 'reconnecting'
        this.emit('stateChange', newState)
        break

      case WorkerMessageType.CONNECTED:
        this.state.lastError = null
        this.emit('connected')
        break

      case WorkerMessageType.DISCONNECTED:
        const { code, reason } = data as { code?: number; reason?: string }
        this.emit('disconnected', code, reason)
        break

      case WorkerMessageType.MESSAGE:
        const message = data as WebSocketMessage
        this.state.lastMessage = message
        this.emit('message', message)
        break

      case WorkerMessageType.ERROR:
        const { message: errorMessage } = data as { message: string }
        const errorObj = new Error(errorMessage)
        this.state.lastError = errorObj
        this.emit('error', errorObj)
        break

      case WorkerMessageType.RECONNECTING:
        const { attempt } = data as { attempt: number }
        this.state.reconnectCount = attempt
        this.emit('reconnecting', attempt)
        break
    }
  }

  /**
   * 处理Worker错误
   * @param event 错误事件
   */
  private handleWorkerError(event: ErrorEvent): void {
    console.error('Worker错误:', event.error)
    const error = new Error(`Worker错误: ${event.message}`)
    this.state.lastError = error
    this.emit('error', error)
  }

  /**
   * 初始化WebSocket连接
   * @param url WebSocket服务器URL
   * @param config WebSocket配置
   */
  public async init(url: string, config?: Partial<WebSocketConfig>): Promise<void> {
    return this.sendMessage(WorkerMessageType.INIT, { url, config })
  }

  /**
   * 连接WebSocket
   */
  public async connect(): Promise<void> {
    return this.sendMessage(WorkerMessageType.CONNECT)
  }

  /**
   * 断开WebSocket连接
   * @param code 关闭代码
   * @param reason 关闭原因
   */
  public disconnect(code?: number, reason?: string): void {
    this.sendMessage(WorkerMessageType.DISCONNECT, { code, reason })
  }

  /**
   * 发送消息
   * @param data 消息数据
   */
  public async send(data: unknown): Promise<void> {
    return this.sendMessage(WorkerMessageType.SEND, data)
  }

  /**
   * 获取当前状态
   */
  public getState(): AdapterState {
    return { ...this.state }
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  public on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  public off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   */
  private emit(event: string, ...args: unknown[]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`事件监听器错误 (${event}):`, error)
        }
      })
    }
  }

  /**
   * 发送消息到Worker
   * @param type 消息类型
   * @param data 消息数据
   */
  private async sendMessage(type: WorkerMessageType, data?: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = this.generateMessageId()

      this.messageHandlers.set(id, (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve()
        }
      })

      this.worker.postMessage({ type, id, data })
    })
  }

  /**
   * 生成消息ID
   */
  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`
  }

  /**
   * 销毁Worker
   */
  public destroy(): void {
    this.worker.terminate()
    this.messageHandlers.clear()
    this.eventListeners.clear()
  }
}
