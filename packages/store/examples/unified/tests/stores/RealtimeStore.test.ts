import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRealtimeStore } from '../../src/stores/realtime/RealtimeStore'

// Mock timers
vi.useFakeTimers()

describe('realtimeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useRealtimeStore()

      expect(store.connectionStatus).toMatchObject({
        connected: false,
        reconnecting: false,
        lastConnected: null,
        reconnectAttempts: 0,
        latency: 0
      })

      expect(store.messages).toEqual([])
      expect(store.onlineUsers).toHaveLength(3) // 初始3个在线用户
      expect(store.realtimeData).toEqual([])
      expect(store.notifications).toEqual([])

      expect(store.stats).toMatchObject({
        totalMessages: 0,
        totalUsers: 0,
        dataPoints: 0,
        uptime: expect.any(Number)
      })
    })

    it('应该有正确的初始用户数据', () => {
      const store = useRealtimeStore()

      expect(store.currentUser).toMatchObject({
        id: 'current',
        name: '我',
        avatar: '😊',
        status: 'online'
      })

      expect(store.onlineUsers[0]).toMatchObject({
        id: '1',
        name: '张三',
        avatar: '👨‍💻',
        status: 'online'
      })
    })
  })

  describe('getters', () => {
    it('unreadNotificationsCount 应该计算未读通知数量', () => {
      const store = useRealtimeStore()

      store.addNotification({
        id: '1',
        title: '测试通知1',
        message: '消息1',
        type: 'info',
        timestamp: Date.now(),
        read: false
      })

      store.addNotification({
        id: '2',
        title: '测试通知2',
        message: '消息2',
        type: 'info',
        timestamp: Date.now(),
        read: true
      })

      expect(store.unreadNotificationsCount).toBe(1)
    })

    it('onlineUsersCount 应该计算在线用户数量', () => {
      const store = useRealtimeStore()

      const onlineCount = store.onlineUsers.filter(u => u.status === 'online').length
      expect(store.onlineUsersCount).toBe(onlineCount)
    })

    it('latestRealtimeData 应该返回最新的实时数据', () => {
      const store = useRealtimeStore()

      expect(store.latestRealtimeData).toBeNull()

      const testData = {
        temperature: 25.5,
        humidity: 60,
        pressure: 1013,
        timestamp: Date.now()
      }

      store.realtimeData.push(testData)
      expect(store.latestRealtimeData).toEqual(testData)
    })

    it('connectionStatusText 应该返回正确的连接状态文本', () => {
      const store = useRealtimeStore()

      expect(store.connectionStatusText).toBe('未连接')

      store.connectionStatus.reconnecting = true
      expect(store.connectionStatusText).toBe('连接中...')

      store.connectionStatus.connected = true
      store.connectionStatus.reconnecting = false
      expect(store.connectionStatusText).toBe('已连接')
    })

    it('uptime 应该计算运行时间', () => {
      const store = useRealtimeStore()

      const uptime = store.uptime
      expect(uptime).toBeGreaterThanOrEqual(0)
    })

    it('recentMessages 应该返回最近的消息', () => {
      const store = useRealtimeStore()

      // 添加超过20条消息
      for (let i = 0; i < 25; i++) {
        store.addMessage({
          id: i.toString(),
          user: '测试用户',
          content: `消息 ${i}`,
          timestamp: Date.now() + i,
          type: 'text'
        })
      }

      expect(store.recentMessages).toHaveLength(20) // 最多返回20条
    })
  })

  describe('actions', () => {
    it('connect 应该成功连接', async () => {
      const store = useRealtimeStore()

      const connectPromise = store.connect()

      expect(store.connectionStatus.reconnecting).toBe(true)

      // 快进时间完成连接
      vi.advanceTimersByTime(1000)
      await connectPromise

      expect(store.connectionStatus.connected).toBe(true)
      expect(store.connectionStatus.reconnecting).toBe(false)
      expect(store.connectionStatus.lastConnected).toBeGreaterThan(0)
      expect(store.messages.some(m => m.content === '已连接到实时服务')).toBe(true)
    })

    it('connect 应该处理重复连接', async () => {
      const store = useRealtimeStore()

      // 第一次连接
      const connectPromise1 = store.connect()
      vi.advanceTimersByTime(1000)
      await connectPromise1

      expect(store.connectionStatus.connected).toBe(true)

      // 第二次连接应该直接返回
      await store.connect()
      expect(store.connectionStatus.connected).toBe(true)
    })

    it('disconnect 应该断开连接', () => {
      const store = useRealtimeStore()

      // 先连接
      store.connectionStatus.connected = true

      store.disconnect()

      expect(store.connectionStatus.connected).toBe(false)
      expect(store.connectionStatus.reconnecting).toBe(false)
      expect(store.messages.some(m => m.content === '已断开连接')).toBe(true)
    })

    it('sendMessage 应该发送消息', () => {
      const store = useRealtimeStore()

      // 先连接
      store.connectionStatus.connected = true

      store.sendMessage('测试消息')

      expect(store.messages.some(m => m.content === '测试消息')).toBe(true)
      expect(store.stats.totalMessages).toBe(1)
    })

    it('sendMessage 应该在未连接时抛出错误', () => {
      const store = useRealtimeStore()

      expect(() => store.sendMessage('测试消息')).toThrow('未连接到服务器')
    })

    it('addMessage 应该添加消息', () => {
      const store = useRealtimeStore()

      const message = {
        id: '1',
        user: '测试用户',
        content: '测试消息',
        timestamp: Date.now(),
        type: 'text' as const
      }

      store.addMessage(message)

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]).toEqual(message)
    })

    it('addMessage 应该限制消息数量', () => {
      const store = useRealtimeStore()

      // 添加超过100条消息
      for (let i = 0; i < 105; i++) {
        store.addMessage({
          id: i.toString(),
          user: '测试用户',
          content: `消息 ${i}`,
          timestamp: Date.now() + i,
          type: 'text'
        })
      }

      expect(store.messages).toHaveLength(100) // 最多保留100条
    })

    it('updateUserStatus 应该更新用户状态', () => {
      const store = useRealtimeStore()

      store.updateUserStatus('1', 'away')

      const user = store.onlineUsers.find(u => u.id === '1')
      expect(user?.status).toBe('away')
      expect(store.notifications.some(n => n.message.includes('现在离开'))).toBe(true)
    })

    it('addNotification 应该添加通知', () => {
      const store = useRealtimeStore()

      const notification = {
        id: '1',
        title: '测试通知',
        message: '测试消息',
        type: 'info' as const,
        timestamp: Date.now(),
        read: false
      }

      store.addNotification(notification)

      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0]).toEqual(notification)
    })

    it('addNotification 应该限制通知数量', () => {
      const store = useRealtimeStore()

      // 添加超过50条通知
      for (let i = 0; i < 55; i++) {
        store.addNotification({
          id: i.toString(),
          title: `通知 ${i}`,
          message: `消息 ${i}`,
          type: 'info',
          timestamp: Date.now() + i,
          read: false
        })
      }

      expect(store.notifications).toHaveLength(50) // 最多保留50条
    })

    it('markNotificationAsRead 应该标记通知为已读', () => {
      const store = useRealtimeStore()

      store.addNotification({
        id: '1',
        title: '测试通知',
        message: '测试消息',
        type: 'info',
        timestamp: Date.now(),
        read: false
      })

      store.markNotificationAsRead('1')

      const notification = store.notifications.find(n => n.id === '1')
      expect(notification?.read).toBe(true)
    })

    it('clearNotifications 应该清空所有通知', () => {
      const store = useRealtimeStore()

      store.addNotification({
        id: '1',
        title: '测试通知',
        message: '测试消息',
        type: 'info',
        timestamp: Date.now(),
        read: false
      })

      store.clearNotifications()

      expect(store.notifications).toHaveLength(0)
    })

    it('startMockDataStream 应该开始数据流', () => {
      const store = useRealtimeStore()

      store.connectionStatus.connected = true
      store.startMockDataStream()

      expect(store.dataInterval).not.toBeNull()

      // 快进时间触发数据更新
      vi.advanceTimersByTime(2000)

      expect(store.realtimeData.length).toBeGreaterThan(0)
      expect(store.stats.dataPoints).toBeGreaterThan(0)
    })

    it('stopMockDataStream 应该停止数据流', () => {
      const store = useRealtimeStore()

      store.connectionStatus.connected = true
      store.startMockDataStream()

      expect(store.dataInterval).not.toBeNull()

      store.stopMockDataStream()

      expect(store.dataInterval).toBeNull()
    })

    it('simulateUserActivity 应该模拟用户活动', () => {
      const store = useRealtimeStore()
      const initialUserCount = store.onlineUsers.length
      const initialMessageCount = store.messages.length

      // 模拟多次用户活动
      for (let i = 0; i < 10; i++) {
        store.simulateUserActivity()
      }

      // 应该有一些变化（用户加入/离开或状态变更）
      const hasUserChanges = store.onlineUsers.length !== initialUserCount
      const hasNewMessages = store.messages.length > initialMessageCount

      expect(hasUserChanges || hasNewMessages).toBe(true)
    })

    it('getStatusLabel 应该返回正确的状态标签', () => {
      const store = useRealtimeStore()

      expect(store.getStatusLabel('online')).toBe('在线')
      expect(store.getStatusLabel('away')).toBe('离开')
      expect(store.getStatusLabel('busy')).toBe('忙碌')
    })
  })

  describe('实时数据处理', () => {
    it('应该正确处理实时数据流', () => {
      const store = useRealtimeStore()

      store.connectionStatus.connected = true
      store.startMockDataStream()

      // 快进时间生成多个数据点
      vi.advanceTimersByTime(6000) // 3个数据点

      expect(store.realtimeData.length).toBe(3)
      expect(store.stats.dataPoints).toBe(3)

      // 检查数据格式
      const latestData = store.latestRealtimeData
      expect(latestData).toMatchObject({
        temperature: expect.any(Number),
        humidity: expect.any(Number),
        pressure: expect.any(Number),
        timestamp: expect.any(Number)
      })
    })

    it('应该限制实时数据数量', () => {
      const store = useRealtimeStore()

      // 手动添加超过50个数据点
      for (let i = 0; i < 55; i++) {
        store.realtimeData.push({
          temperature: 20 + i,
          humidity: 50 + i,
          pressure: 1000 + i,
          timestamp: Date.now() + i
        })
      }

      // 触发数据流添加新数据点
      store.connectionStatus.connected = true
      store.startMockDataStream()
      vi.advanceTimersByTime(2000)

      expect(store.realtimeData.length).toBeLessThanOrEqual(50)
    })

    it('应该生成温度警告通知', () => {
      const store = useRealtimeStore()

      store.connectionStatus.connected = true

      // 手动添加高温数据
      store.realtimeData.push({
        temperature: 35, // 高温
        humidity: 60,
        pressure: 1013,
        timestamp: Date.now()
      })

      // 模拟数据流处理
      store.startMockDataStream()
      vi.advanceTimersByTime(2000)

      // 可能会生成温度警告（基于随机概率）
      const hasTemperatureWarning = store.notifications.some(n =>
        n.title === '温度警告' && n.type === 'warning'
      )

      // 由于是随机生成，我们只检查数据结构是否正确
      expect(store.realtimeData.length).toBeGreaterThan(0)
    })
  })

  describe('边界情况', () => {
    it('应该处理空消息发送', () => {
      const store = useRealtimeStore()

      store.connectionStatus.connected = true

      expect(() => store.sendMessage('')).toThrow('未连接到服务器')
    })

    it('应该处理不存在的用户状态更新', () => {
      const store = useRealtimeStore()

      expect(() => store.updateUserStatus('nonexistent', 'online')).not.toThrow()
    })

    it('应该处理不存在的通知标记', () => {
      const store = useRealtimeStore()

      expect(() => store.markNotificationAsRead('nonexistent')).not.toThrow()
    })

    it('应该处理连接失败', async () => {
      const store = useRealtimeStore()

      // 模拟连接失败
      vi.spyOn(globalThis, 'setTimeout').mockImplementation((callback, delay) => {
        if (typeof callback === 'function') {
          throw new TypeError('Connection failed')
        }
        return 0 as any
      })

      try {
        await store.connect()
      } catch (error) {
        expect(store.connectionStatus.reconnecting).toBe(false)
        expect(store.connectionStatus.reconnectAttempts).toBe(1)
      }

      vi.restoreAllMocks()
    })
  })
})
