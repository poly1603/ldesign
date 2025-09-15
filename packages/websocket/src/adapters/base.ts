/**
 * 基础适配器抽象类
 * 为不同框架提供统一的WebSocket集成接口
 */

import type { WebSocketClient } from '../core/websocket-client'
import type { WebSocketConfig, WebSocketState, WebSocketMessage } from '../types'

/**
 * 适配器状态接口
 * 定义适配器需要管理的响应式状态
 */
export interface AdapterState {
  /** WebSocket连接状态 */
  state: WebSocketState
  /** 是否已连接 */
  connected: boolean
  /** 是否正在连接 */
  connecting: boolean
  /** 是否正在重连 */
  reconnecting: boolean
  /** 最后一次错误 */
  lastError: Error | null
  /** 最后接收到的消息 */
  lastMessage: WebSocketMessage | null
  /** 重连次数 */
  reconnectCount: number
}

/**
 * 适配器事件接口
 * 定义适配器支持的事件类型
 */
export interface AdapterEvents {
  /** 连接状态变化 */
  stateChange: (state: WebSocketState) => void
  /** 连接成功 */
  connected: () => void
  /** 连接断开 */
  disconnected: (code?: number, reason?: string) => void
  /** 接收到消息 */
  message: (message: WebSocketMessage) => void
  /** 发生错误 */
  error: (error: Error) => void
  /** 开始重连 */
  reconnecting: (attempt: number) => void
}

/**
 * 适配器配置接口
 */
export interface AdapterConfig {
  /** 是否自动连接 */
  autoConnect?: boolean
  /** 是否在组件销毁时自动断开连接 */
  autoDisconnect?: boolean
  /** 是否启用状态同步 */
  enableStateSync?: boolean
  /** 自定义状态更新函数 */
  onStateUpdate?: (state: Partial<AdapterState>) => void
}

/**
 * 基础适配器抽象类
 * 提供框架无关的WebSocket集成基础功能
 */
export abstract class BaseAdapter {
  protected client: WebSocketClient
  protected config: AdapterConfig
  protected state: AdapterState
  protected listeners: Map<keyof AdapterEvents, Set<Function>> = new Map()

  /**
   * 构造函数
   * @param client WebSocket客户端实例
   * @param config 适配器配置
   */
  constructor(client: WebSocketClient, config: AdapterConfig = {}) {
    this.client = client
    this.config = {
      autoConnect: true,
      autoDisconnect: true,
      enableStateSync: true,
      ...config
    }

    // 初始化状态
    this.state = {
      state: client.getState(),
      connected: client.isConnected(),
      connecting: client.getState() === 'connecting',
      reconnecting: client.getState() === 'reconnecting',
      lastError: null,
      lastMessage: null,
      reconnectCount: 0
    }

    this.setupEventListeners()
  }

  /**
   * 设置事件监听器
   * 监听WebSocket客户端事件并更新适配器状态
   */
  protected setupEventListeners(): void {
    // 监听状态变化
    this.client.on('stateChange', (newState: WebSocketState, oldState: WebSocketState) => {
      this.updateState({
        state: newState,
        connected: newState === 'connected',
        connecting: newState === 'connecting',
        reconnecting: newState === 'reconnecting'
      })
      this.emit('stateChange', newState)
    })

    // 监听连接成功
    this.client.on('connected', () => {
      this.updateState({ lastError: null })
      this.emit('connected')
    })

    // 监听连接断开
    this.client.on('close', (event: CloseEvent) => {
      this.emit('disconnected', event.code, event.reason)
    })

    // 监听消息接收
    this.client.on('message', (message: WebSocketMessage) => {
      this.updateState({ lastMessage: message })
      this.emit('message', message)
    })

    // 监听错误
    this.client.on('error', (error: Error) => {
      this.updateState({ lastError: error })
      this.emit('error', error)
    })

    // 监听重连
    this.client.on('reconnecting', (attempt: number) => {
      this.updateState({ reconnectCount: attempt })
      this.emit('reconnecting', attempt)
    })
  }

  /**
   * 更新适配器状态
   * @param updates 状态更新对象
   */
  protected updateState(updates: Partial<AdapterState>): void {
    Object.assign(this.state, updates)

    if (this.config.enableStateSync) {
      this.syncState()
    }

    if (this.config.onStateUpdate) {
      this.config.onStateUpdate(updates)
    }
  }

  /**
   * 同步状态到框架
   * 子类需要实现此方法来更新框架特定的响应式状态
   */
  protected abstract syncState(): void

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  public on<K extends keyof AdapterEvents>(event: K, listener: AdapterEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  public off<K extends keyof AdapterEvents>(event: K, listener: AdapterEvents[K]): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener)
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   */
  protected emit<K extends keyof AdapterEvents>(event: K, ...args: Parameters<AdapterEvents[K]>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          (listener as Function)(...args)
        } catch (error) {
          console.error(`Error in ${event} listener:`, error)
        }
      })
    }
  }

  /**
   * 连接WebSocket
   */
  public async connect(): Promise<void> {
    return this.client.connect()
  }

  /**
   * 断开WebSocket连接
   * @param code 关闭代码
   * @param reason 关闭原因
   */
  public disconnect(code?: number, reason?: string): void {
    this.client.disconnect(code, reason)
  }

  /**
   * 发送消息
   * @param data 消息数据
   */
  public send(data: unknown): Promise<void> {
    return this.client.send(data)
  }

  /**
   * 获取当前状态
   */
  public getState(): AdapterState {
    return { ...this.state }
  }

  /**
   * 获取WebSocket客户端实例
   */
  public getClient(): WebSocketClient {
    return this.client
  }

  /**
   * 销毁适配器
   * 清理资源和事件监听器
   */
  public destroy(): void {
    this.listeners.clear()

    if (this.config.autoDisconnect && this.client.isConnected()) {
      this.client.disconnect(1000, '适配器销毁')
    }

    // 销毁客户端
    this.client.destroy()
  }
}
