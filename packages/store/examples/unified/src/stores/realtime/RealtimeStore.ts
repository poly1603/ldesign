import { defineStore } from 'pinia'

export interface Message {
  id: string
  user: string
  content: string
  timestamp: number
  type: 'text' | 'system' | 'notification'
}

export interface OnlineUser {
  id: string
  name: string
  avatar: string
  status: 'online' | 'away' | 'busy'
  lastSeen: number
}

export interface RealtimeData {
  temperature: number
  humidity: number
  pressure: number
  timestamp: number
}

export interface ConnectionStatus {
  connected: boolean
  reconnecting: boolean
  lastConnected: number | null
  reconnectAttempts: number
  latency: number
}

/**
 * 实时同步示例 Store
 *
 * 展示 WebSocket、SSE 等实时数据同步功能
 */
export const useRealtimeStore = defineStore('realtime', {
  state: () => ({
    // 连接状态
    connectionStatus: {
      connected: false,
      reconnecting: false,
      lastConnected: null,
      reconnectAttempts: 0,
      latency: 0
    } as ConnectionStatus,

    // 聊天消息
    messages: [] as Message[],

    // 在线用户
    onlineUsers: [
      {
        id: '1',
        name: '张三',
        avatar: '👨‍💻',
        status: 'online',
        lastSeen: Date.now()
      },
      {
        id: '2',
        name: '李四',
        avatar: '👩‍💼',
        status: 'away',
        lastSeen: Date.now() - 300000
      },
      {
        id: '3',
        name: '王五',
        avatar: '👨‍🎨',
        status: 'busy',
        lastSeen: Date.now() - 600000
      }
    ] as OnlineUser[],

    // 当前用户
    currentUser: {
      id: 'current',
      name: '我',
      avatar: '😊',
      status: 'online',
      lastSeen: Date.now()
    } as OnlineUser,

    // 实时数据
    realtimeData: [] as RealtimeData[],

    // 通知
    notifications: [] as Array<{
      id: string
      title: string
      message: string
      type: 'info' | 'success' | 'warning' | 'error'
      timestamp: number
      read: boolean
    }>,

    // 模拟连接
    mockConnection: null as any,
    dataInterval: null as any,

    // 统计信息
    stats: {
      totalMessages: 0,
      totalUsers: 0,
      dataPoints: 0,
      uptime: Date.now()
    }
  }),

  actions: {
    // 连接到实时服务
    async connect() {
      if (this.connectionStatus.connected) return

      this.connectionStatus.reconnecting = true

      try {
        // 模拟连接延迟
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 模拟连接成功
        this.connectionStatus.connected = true
        this.connectionStatus.reconnecting = false
        this.connectionStatus.lastConnected = Date.now()
        this.connectionStatus.reconnectAttempts = 0

        // 开始模拟数据流
        this.startMockDataStream()

        // 添加系统消息
        this.addMessage({
          id: Date.now().toString(),
          user: 'System',
          content: '已连接到实时服务',
          timestamp: Date.now(),
          type: 'system'
        })

        // 模拟延迟测试
        this.startLatencyTest()
      } catch (error) {
        this.connectionStatus.reconnecting = false
        this.connectionStatus.reconnectAttempts++
        throw error
      }
    },

    // 断开连接
    disconnect() {
      this.connectionStatus.connected = false
      this.connectionStatus.reconnecting = false

      // 停止数据流
      this.stopMockDataStream()

      // 添加系统消息
      this.addMessage({
        id: Date.now().toString(),
        user: 'System',
        content: '已断开连接',
        timestamp: Date.now(),
        type: 'system'
      })
    },

    // 重新连接 (用于性能测试)
    async reconnect() {
      this.disconnect()
      await new Promise(resolve => setTimeout(resolve, 100)) // 短暂延迟
      await this.connect()
    },

    // 发送消息
    sendMessage(content: string) {
      if (!this.connectionStatus.connected || !content.trim()) {
        throw new Error('未连接到服务器')
      }

      const message: Message = {
        id: Date.now().toString(),
        user: this.currentUser.name,
        content,
        timestamp: Date.now(),
        type: 'text'
      }

      this.addMessage(message)
      this.stats.totalMessages++

      // 模拟其他用户的回复
      setTimeout(() => {
        if (this.connectionStatus.connected && Math.random() > 0.5) {
          const randomUser = this.onlineUsers[Math.floor(Math.random() * this.onlineUsers.length)]
          const replies = [
            '收到！',
            '好的',
            '了解',
            '👍',
            '没问题',
            '正在处理...'
          ]

          this.addMessage({
            id: (Date.now() + 1).toString(),
            user: randomUser.name,
            content: replies[Math.floor(Math.random() * replies.length)],
            timestamp: Date.now() + 1,
            type: 'text'
          })
        }
      }, 1000 + Math.random() * 3000)
    },

    // 添加消息
    addMessage(message: Message) {
      this.messages.push(message)

      // 限制消息数量
      if (this.messages.length > 100) {
        this.messages.shift()
      }
    },

    // 更新用户状态
    updateUserStatus(userId: string, status: OnlineUser['status']) {
      const user = this.onlineUsers.find(u => u.id === userId)
      if (user) {
        user.status = status
        user.lastSeen = Date.now()

        // 添加状态变更通知
        this.addNotification({
          id: Date.now().toString(),
          title: '用户状态变更',
          message: `${user.name} 现在${this.getStatusLabel(status)}`,
          type: 'info',
          timestamp: Date.now(),
          read: false
        })
      }
    },

    // 添加通知
    addNotification(notification: {
      id: string
      title: string
      message: string
      type: 'info' | 'success' | 'warning' | 'error'
      timestamp: number
      read: boolean
    }) {
      this.notifications.unshift(notification)

      // 限制通知数量
      if (this.notifications.length > 50) {
        this.notifications.pop()
      }
    },

    // 标记通知为已读
    markNotificationAsRead(id: string) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.read = true
      }
    },

    // 清除所有通知
    clearNotifications() {
      this.notifications = []
    },

    // 开始模拟数据流
    startMockDataStream() {
      // 首先清理多余的数据点
      if (this.realtimeData.length > 50) {
        this.realtimeData = this.realtimeData.slice(-50)
      }

      this.dataInterval = setInterval(() => {
        if (this.connectionStatus.connected) {
          const data: RealtimeData = {
            temperature: 20 + Math.random() * 15,
            humidity: 40 + Math.random() * 40,
            pressure: 1000 + Math.random() * 50,
            timestamp: Date.now()
          }

          this.realtimeData.push(data)
          this.stats.dataPoints++

          // 限制数据点数量
          if (this.realtimeData.length > 50) {
            this.realtimeData.shift()
          }

          // 随机生成异常数据通知
          if (data.temperature > 30 && Math.random() > 0.8) {
            this.addNotification({
              id: Date.now().toString(),
              title: '温度警告',
              message: `温度过高: ${data.temperature.toFixed(1)}°C`,
              type: 'warning',
              timestamp: Date.now(),
              read: false
            })
          }
        }
      }, 2000)
    },

    // 停止模拟数据流
    stopMockDataStream() {
      if (this.dataInterval) {
        clearInterval(this.dataInterval)
        this.dataInterval = null
      }
    },

    // 开始延迟测试
    startLatencyTest() {
      const testLatency = () => {
        if (this.connectionStatus.connected) {
          const start = Date.now()

          // 模拟网络延迟
          setTimeout(() => {
            this.connectionStatus.latency = Date.now() - start + Math.random() * 50
          }, Math.random() * 100 + 50)

          setTimeout(testLatency, 5000)
        }
      }

      testLatency()
    },

    // 模拟用户加入/离开
    simulateUserActivity() {
      const actions = ['join', 'leave', 'status_change']
      const action = actions[Math.floor(Math.random() * actions.length)]

      switch (action) {
        case 'join': {
          const newUser: OnlineUser = {
            id: Date.now().toString(),
            name: `用户${Math.floor(Math.random() * 1000)}`,
            avatar: ['👨', '👩', '🧑', '👦', '👧'][Math.floor(Math.random() * 5)],
            status: 'online',
            lastSeen: Date.now()
          }

          this.onlineUsers.push(newUser)
          this.stats.totalUsers++

          this.addMessage({
            id: Date.now().toString(),
            user: 'System',
            content: `${newUser.name} 加入了聊天`,
            timestamp: Date.now(),
            type: 'system'
          })
          break
        }

        case 'leave':
          if (this.onlineUsers.length > 1) {
            const userIndex = Math.floor(Math.random() * this.onlineUsers.length)
            const user = this.onlineUsers[userIndex]

            this.onlineUsers.splice(userIndex, 1)

            this.addMessage({
              id: Date.now().toString(),
              user: 'System',
              content: `${user.name} 离开了聊天`,
              timestamp: Date.now(),
              type: 'system'
            })
          }
          break

        case 'status_change':
          if (this.onlineUsers.length > 0) {
            const user = this.onlineUsers[Math.floor(Math.random() * this.onlineUsers.length)]
            const statuses: OnlineUser['status'][] = ['online', 'away', 'busy']
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)]

            if (user.status !== newStatus) {
              this.updateUserStatus(user.id, newStatus)
            }
          }
          break
      }
    },

    // 获取状态标签
    getStatusLabel(status: OnlineUser['status']) {
      const labels = {
        online: '在线',
        away: '离开',
        busy: '忙碌'
      }
      return labels[status]
    }
  },

  getters: {
    // 未读通知数量
    unreadNotificationsCount: (state) => {
      return state.notifications.filter(n => !n.read).length
    },

    // 在线用户数量
    onlineUsersCount: (state) => {
      return state.onlineUsers.filter(u => u.status === 'online').length
    },

    // 最新的实时数据
    latestRealtimeData: (state) => {
      return state.realtimeData[state.realtimeData.length - 1] || null
    },

    // 连接状态文本
    connectionStatusText: (state) => {
      if (state.connectionStatus.connected) return '已连接'
      if (state.connectionStatus.reconnecting) return '连接中...'
      return '未连接'
    },

    // 运行时间
    uptime: (state) => {
      return Date.now() - state.stats.uptime
    },

    // 最近的消息
    recentMessages: (state) => {
      return state.messages.slice(-20)
    }
  }
})
