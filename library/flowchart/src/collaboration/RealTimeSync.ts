/**
 * 实时同步服务
 * 
 * 负责与协作服务器的实时通信和数据同步
 */

import type {
  CollaborationConfig,
  CollaborationMessage,
  Operation,
  RealTimeSync as IRealTimeSync,
  SyncState
} from './types'
import { EventEmitter } from 'events'

/**
 * 连接状态
 */
export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error'

/**
 * 实时同步类
 */
export class RealTimeSync extends EventEmitter implements IRealTimeSync {
  private websocket?: WebSocket
  private config?: CollaborationConfig
  private connectionState: ConnectionState = 'disconnected'
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000
  private heartbeatInterval?: number
  private messageQueue: CollaborationMessage[] = []
  private isReconnecting: boolean = false

  /**
   * 连接到协作服务器
   */
  async connect(config: CollaborationConfig): Promise<void> {
    this.config = config
    this.connectionState = 'connecting'

    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(config.serverUrl)
        
        this.websocket.onopen = () => {
          this.connectionState = 'connected'
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.sendQueuedMessages()
          this.emit('connected')
          resolve()
        }

        this.websocket.onmessage = (event) => {
          try {
            const message: CollaborationMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('解析消息失败:', error)
          }
        }

        this.websocket.onerror = (error) => {
          this.connectionState = 'error'
          this.emit('error', error)
          reject(error)
        }

        this.websocket.onclose = (event) => {
          this.connectionState = 'disconnected'
          this.stopHeartbeat()
          this.emit('disconnected', event)
          
          // 如果不是主动关闭，尝试重连
          if (!event.wasClean && !this.isReconnecting) {
            this.attemptReconnect()
          }
        }

        // 连接超时处理
        setTimeout(() => {
          if (this.connectionState === 'connecting') {
            this.websocket?.close()
            reject(new Error('连接超时'))
          }
        }, 10000)

      } catch (error) {
        this.connectionState = 'error'
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.isReconnecting = false
    this.stopHeartbeat()
    
    if (this.websocket) {
      this.websocket.close(1000, '主动断开连接')
      this.websocket = undefined
    }
    
    this.connectionState = 'disconnected'
    this.emit('disconnected')
  }

  /**
   * 发送消息
   */
  async sendMessage(message: CollaborationMessage): Promise<void> {
    if (this.connectionState === 'connected' && this.websocket) {
      try {
        this.websocket.send(JSON.stringify(message))
      } catch (error) {
        console.error('发送消息失败:', error)
        // 将消息加入队列，等待重连后发送
        this.messageQueue.push(message)
        throw error
      }
    } else {
      // 连接未建立，将消息加入队列
      this.messageQueue.push(message)
      
      if (this.connectionState === 'disconnected') {
        this.attemptReconnect()
      }
    }
  }

  /**
   * 获取连接状态
   */
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  /**
   * 注册消息处理回调
   */
  onMessage(callback: (message: CollaborationMessage) => void): void {
    this.on('message', callback)
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: CollaborationMessage): void {
    switch (message.type) {
      case 'operation':
        this.emit('operation', message.data)
        break
      case 'presence':
        this.emit('presence', message.data)
        break
      case 'user_join':
        this.emit('user_join', message.data)
        break
      case 'user_leave':
        this.emit('user_leave', message.data)
        break
      case 'sync_response':
        this.emit('sync_response', message.data)
        break
      case 'error':
        this.emit('server_error', message.data)
        break
      default:
        console.warn('未知消息类型:', message.type)
    }
    
    this.emit('message', message)
  }

  /**
   * 尝试重连
   */
  private async attemptReconnect(): Promise<void> {
    if (this.isReconnecting || !this.config) {
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('重连次数超过限制，停止重连')
      this.emit('reconnect_failed')
      return
    }

    this.isReconnecting = true
    this.reconnectAttempts++
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    console.log(`第 ${this.reconnectAttempts} 次重连尝试，${delay}ms 后开始...`)
    
    setTimeout(async () => {
      try {
        await this.connect(this.config!)
        this.isReconnecting = false
        this.emit('reconnected')
        console.log('重连成功')
      } catch (error) {
        this.isReconnecting = false
        console.error('重连失败:', error)
        this.attemptReconnect()
      }
    }, delay)
  }

  /**
   * 开始心跳检测
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.connectionState === 'connected' && this.websocket) {
        const heartbeatMessage: CollaborationMessage = {
          id: this.generateId(),
          type: 'presence',
          sessionId: this.config?.sessionId || '',
          userId: this.config?.user.id || '',
          timestamp: Date.now(),
          data: { type: 'heartbeat' }
        }
        
        try {
          this.websocket.send(JSON.stringify(heartbeatMessage))
        } catch (error) {
          console.error('心跳发送失败:', error)
          this.stopHeartbeat()
        }
      }
    }, 30000) // 30秒心跳间隔
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = undefined
    }
  }

  /**
   * 发送队列中的消息
   */
  private sendQueuedMessages(): void {
    if (this.messageQueue.length === 0) {
      return
    }

    const messages = [...this.messageQueue]
    this.messageQueue = []

    messages.forEach(message => {
      this.sendMessage(message).catch(error => {
        console.error('发送队列消息失败:', error)
      })
    })
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取同步统计信息
   */
  getSyncStats(): {
    connectionState: ConnectionState
    reconnectAttempts: number
    queuedMessages: number
    isReconnecting: boolean
  } {
    return {
      connectionState: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      isReconnecting: this.isReconnecting
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.disconnect()
    this.stopHeartbeat()
    this.messageQueue = []
    this.removeAllListeners()
  }
}
