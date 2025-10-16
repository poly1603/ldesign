/**
 * WebSocket 组合式函数
 * 提供 WebSocket 连接和消息处理
 */

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

/**
 * WebSocket 消息类型
 */
export interface WSMessage {
  type: string
  data?: any
  timestamp?: string
}

/**
 * WebSocket 状态
 */
export interface WSState {
  connected: boolean
  connecting: boolean
  error: string | null
  lastMessage: WSMessage | null
}

/**
 * WebSocket 连接管理
 */
class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private messageHandlers = new Map<string, ((data: any) => void)[]>()

  public state = reactive<WSState>({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null
  })

  /**
   * 连接 WebSocket
   */
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    this.state.connecting = true
    this.state.error = null

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

      // 获取服务器配置以确定实际端口
      let wsUrl: string
      const isDev = import.meta.env?.DEV

      if (isDev) {
        // 开发模式：通过 Vite 代理连接到后端 WebSocket 服务器
        // 使用 /ws 路径，Vite 会将其代理到 ws://localhost:3000
        const host = window.location.host // 使用当前 Vite 服务器的 host
        wsUrl = `${protocol}//${host}/ws`
              } else {
        // 生产模式：连接到当前主机
        wsUrl = `${protocol}//${window.location.host}`
      }

            this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
                this.state.connected = true
        this.state.connecting = false
        this.state.error = null
        this.reconnectAttempts = 0

        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer)
          this.reconnectTimer = null
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          this.state.lastMessage = message
          this.handleMessage(message)
        } catch (error) {
          console.error('解析 WebSocket 消息失败:', error)
        }
      }

      this.ws.onclose = (event) => {
                this.state.connected = false
        this.state.connecting = false

        // 自动重连
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        } else {
          this.state.error = '连接失败，已达到最大重试次数'
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket 错误:', error)
        this.state.error = 'WebSocket 连接错误'
        this.state.connecting = false
      }

    } catch (error) {
      console.error('创建 WebSocket 连接失败:', error)
      this.state.error = '无法创建 WebSocket 连接'
      this.state.connecting = false
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.state.connected = false
    this.state.connecting = false
  }

  /**
   * 发送消息
   */
  send(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket 未连接，无法发送消息')
    }
  }

  /**
   * 订阅消息类型
   */
  on(type: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)!.push(handler)
  }

  /**
   * 取消订阅
   */
  off(type: string, handler?: (data: any) => void): void {
    if (!this.messageHandlers.has(type)) {
      return
    }

    if (handler) {
      const handlers = this.messageHandlers.get(type)!
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    } else {
      this.messageHandlers.delete(type)
    }
  }

  /**
   * 处理消息
   */
  private handleMessage(message: WSMessage): void {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data)
        } catch (error) {
          console.error(`处理 ${message.type} 消息失败:`, error)
        }
      })
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)

    
    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, delay)
  }
}

// 全局 WebSocket 管理器实例
const wsManager = new WebSocketManager()

/**
 * WebSocket 组合式函数
 */
export function useWebSocket() {
  /**
   * 订阅消息
   */
  const subscribe = (type: string, handler: (data: any) => void) => {
    wsManager.on(type, handler)

    // 返回取消订阅函数
    return () => {
      wsManager.off(type, handler)
    }
  }

  /**
   * 发送消息
   */
  const send = (type: string, data?: any) => {
    wsManager.send({ type, data })
  }

  return {
    connected: computed(() => wsManager.state.connected),
    connecting: computed(() => wsManager.state.connecting),
    error: computed(() => wsManager.state.error),
    lastMessage: computed(() => wsManager.state.lastMessage),
    subscribe,
    send
  }
}

/**
 * 设置 WebSocket 连接
 */
export function setupWebSocket(): void {
  wsManager.connect()
}
