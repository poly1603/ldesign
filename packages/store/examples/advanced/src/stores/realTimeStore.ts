import { Action, BaseStore, State } from '@ldesign/store'

interface Message {
  id: string
  user: string
  content: string
  timestamp: number
  isOwn: boolean
}

interface User {
  id: string
  name: string
  status: string
  online: boolean
}

interface OfflineQueueItem {
  id: string
  action: string
  data: any
  timestamp: number
}

export class RealTimeStore extends BaseStore {
  @State({ default: 'disconnected' })
  connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected'

  @State({ default: [] })
  messages: Message[] = []

  @State({ default: [] })
  userList: User[] = []

  @State({ default: 0 })
  sharedCounter: number = 0

  @State({ default: null })
  lastSyncTime: number | null = null

  @State({ default: 'idle' })
  syncStatus: 'idle' | 'syncing' | 'error' = 'idle'

  @State({ default: [] })
  offlineQueue: OfflineQueueItem[] = []

  @State({ default: 0 })
  messageCounter: number = 0

  @State({ default: 0 })
  queueCounter: number = 0

  private websocket: WebSocket | null = null
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null

  constructor() {
    super('realtime-store')
    this.initializeMockUsers()
  }

  @Action()
  initialize(): void {
    
    // 模拟一些初始消息
    this.addSystemMessage('欢迎使用实时聊天系统')
  }

  @Action()
  connect(): void {
    if (
      this.connectionStatus === 'connected'
      || this.connectionStatus === 'connecting'
    ) {
      return
    }

    this.connectionStatus = 'connecting'

    // 模拟WebSocket连接
    setTimeout(() => {
      this.connectionStatus = 'connected'
      this.addSystemMessage('已连接到服务器')
      this.startHeartbeat()
      this.processOfflineQueue()
    }, 1000)
  }

  @Action()
  disconnect(): void {
    this.connectionStatus = 'disconnected'
    this.stopHeartbeat()
    this.addSystemMessage('已断开连接')

    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
  }

  @Action()
  sendMessage(content: string): void {
    if (this.connectionStatus !== 'connected') {
      // 离线时添加到队列
      this.addToOfflineQueue('send-message', { content })
      return
    }

    this.messageCounter++
    const message: Message = {
      id: `msg-${this.messageCounter}`,
      user: '我',
      content,
      timestamp: Date.now(),
      isOwn: true,
    }

    this.messages.push(message)

    // 模拟服务器响应
    setTimeout(() => {
      this.simulateServerResponse(content)
    }, 500 + Math.random() * 1000)
  }

  @Action()
  clearMessages(): void {
    this.messages = []
  }

  @Action()
  incrementSharedCounter(): void {
    if (this.connectionStatus !== 'connected') {
      this.addToOfflineQueue('increment-counter', {})
      return
    }

    this.sharedCounter++
    this.lastSyncTime = Date.now()
    this.syncStatus = 'syncing'

    // 模拟同步延迟
    setTimeout(() => {
      this.syncStatus = 'idle'
    }, 500)
  }

  @Action()
  decrementSharedCounter(): void {
    if (this.connectionStatus !== 'connected') {
      this.addToOfflineQueue('decrement-counter', {})
      return
    }

    this.sharedCounter--
    this.lastSyncTime = Date.now()
    this.syncStatus = 'syncing'

    setTimeout(() => {
      this.syncStatus = 'idle'
    }, 500)
  }

  @Action()
  resetSharedCounter(): void {
    if (this.connectionStatus !== 'connected') {
      this.addToOfflineQueue('reset-counter', {})
      return
    }

    this.sharedCounter = 0
    this.lastSyncTime = Date.now()
    this.syncStatus = 'syncing'

    setTimeout(() => {
      this.syncStatus = 'idle'
    }, 500)
  }

  @Action()
  addToOfflineQueue(action: string, data: any): void {
    this.queueCounter++
    const item: OfflineQueueItem = {
      id: `queue-${this.queueCounter}`,
      action,
      data,
      timestamp: Date.now(),
    }

    this.offlineQueue.push(item)
  }

  @Action()
  processOfflineQueue(): void {
    if (
      this.connectionStatus !== 'connected'
      || this.offlineQueue.length === 0
    ) {
      return
    }

    const queue = [...this.offlineQueue]
    this.offlineQueue = []

    queue.forEach((item) => {
      switch (item.action) {
        case 'send-message':
          this.sendMessage(item.data.content)
          break
        case 'increment-counter':
          this.incrementSharedCounter()
          break
        case 'decrement-counter':
          this.decrementSharedCounter()
          break
        case 'reset-counter':
          this.resetSharedCounter()
          break
      }
    })

    this.addSystemMessage(`已处理 ${queue.length} 个离线操作`)
  }

  @Action()
  clearOfflineQueue(): void {
    this.offlineQueue = []
  }

  @Action()
  cleanup(): void {
    this.disconnect()
    this.stopHeartbeat()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // 私有方法
  private addSystemMessage(content: string): void {
    this.messageCounter++
    const message: Message = {
      id: `sys-${this.messageCounter}`,
      user: '系统',
      content,
      timestamp: Date.now(),
      isOwn: false,
    }

    this.messages.push(message)
  }

  private simulateServerResponse(originalContent: string): void {
    const responses = [
      '收到你的消息了！',
      '这是一个自动回复',
      `你说的"${originalContent}"很有趣`,
      '服务器正在处理你的请求...',
      '感谢你的反馈！',
    ]

    this.messageCounter++
    const message: Message = {
      id: `bot-${this.messageCounter}`,
      user: '机器人',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: Date.now(),
      isOwn: false,
    }

    this.messages.push(message)
  }

  private initializeMockUsers(): void {
    this.userList = [
      { id: '1', name: '张三', status: '在线', online: true },
      { id: '2', name: '李四', status: '忙碌', online: true },
      { id: '3', name: '王五', status: '离开', online: false },
      { id: '4', name: '赵六', status: '在线', online: true },
      { id: '5', name: '钱七', status: '离线', online: false },
    ]
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.connectionStatus === 'connected') {
        // 模拟心跳检测
        
      }
    }, 30000) // 30秒心跳
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
}

// 导出Hook式用法
export function useRealTimeStore() {
  return new RealTimeStore()
}
