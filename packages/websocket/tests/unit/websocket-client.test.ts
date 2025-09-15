/**
 * WebSocket 客户端单元测试
 * 
 * 测试 WebSocketClient 类的核心功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WebSocketClient } from '@/core/websocket-client'
import { WebSocketState, MessageType, ReconnectStrategy, AuthType, LogLevel } from '@/types'

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  url: string
  protocols?: string | string[]
  binaryType: 'blob' | 'arraybuffer' = 'arraybuffer'

  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(url: string, protocols?: string | string[]) {
    this.url = url
    this.protocols = protocols

    // 模拟异步连接
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 10)
  }

  send(data: string | ArrayBuffer): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open')
    }
    // 模拟发送成功
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code: code || 1000, reason: reason || '' }))
    }
  }

  // 模拟接收消息
  simulateMessage(data: string | ArrayBuffer): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }))
    }
  }

  // 模拟连接错误
  simulateError(): void {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }
}

// 全局 Mock
global.WebSocket = MockWebSocket as any

describe('WebSocketClient', () => {
  let client: WebSocketClient
  let mockConsole: any

  beforeEach(() => {
    // Mock console methods
    mockConsole = {
      log: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    }

    Object.assign(console, mockConsole)

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    })
  })

  afterEach(() => {
    if (client) {
      client.destroy()
    }
    vi.clearAllMocks()
  })

  describe('构造函数和初始化', () => {
    it('应该使用默认配置创建客户端', () => {
      client = new WebSocketClient({ url: 'ws://localhost:8080' })

      expect(client.getState()).toBe(WebSocketState.DISCONNECTED)
      expect(client.isConnected()).toBe(false)
      expect(client.getQueueLength()).toBe(0)
    })

    it('应该合并自定义配置', () => {
      const config = {
        url: 'ws://localhost:8080',
        connectionTimeout: 5000,
        debug: true,
        logLevel: LogLevel.DEBUG
      }

      client = new WebSocketClient(config)
      const clientConfig = client.getConfig()

      expect(clientConfig.url).toBe(config.url)
      expect(clientConfig.connectionTimeout).toBe(config.connectionTimeout)
      expect(clientConfig.debug).toBe(config.debug)
      expect(clientConfig.logLevel).toBe(config.logLevel)
    })

    it('应该验证无效的 URL', () => {
      expect(() => {
        new WebSocketClient({ url: '' })
      }).toThrow('WebSocket URL 不能为空')

      expect(() => {
        new WebSocketClient({ url: 'http://localhost:8080' })
      }).toThrow('无效的 WebSocket URL')
    })

    it('应该验证无效的配置参数', () => {
      expect(() => {
        new WebSocketClient({
          url: 'ws://localhost:8080',
          connectionTimeout: -1
        })
      }).toThrow('连接超时时间必须大于 0')

      expect(() => {
        new WebSocketClient({
          url: 'ws://localhost:8080',
          reconnect: {
            enabled: true,
            strategy: ReconnectStrategy.EXPONENTIAL,
            initialDelay: 1000,
            maxDelay: 30000,
            maxAttempts: -1,
            backoffMultiplier: 2,
            jitter: 1000
          }
        })
      }).toThrow('最大重连次数不能小于 0')
    })
  })

  describe('连接管理', () => {
    beforeEach(() => {
      client = new WebSocketClient({
        url: 'ws://localhost:8080',
        logLevel: LogLevel.ERROR, // 减少测试输出
        reconnect: {
          enabled: true,
          strategy: ReconnectStrategy.EXPONENTIAL,
          initialDelay: 1000,
          maxDelay: 30000,
          maxAttempts: 5,
          backoffMultiplier: 2,
          jitter: 1000
        }
      })
    })

    it('应该成功连接到 WebSocket 服务器', async () => {
      const connectPromise = client.connect()

      expect(client.getState()).toBe(WebSocketState.CONNECTING)
      expect(client.isConnecting()).toBe(true)

      await connectPromise

      expect(client.getState()).toBe(WebSocketState.CONNECTED)
      expect(client.isConnected()).toBe(true)
    })

    it('应该处理连接超时', async () => {
      client = new WebSocketClient({
        url: 'ws://localhost:8080',
        connectionTimeout: 1,
        logLevel: LogLevel.ERROR
      })

      // Mock WebSocket 不触发 onopen
      global.WebSocket = class extends MockWebSocket {
        constructor(url: string, protocols?: string | string[]) {
          super(url, protocols)
          // 不自动触发 onopen
          clearTimeout(setTimeout(() => { }))
        }
      } as any

      await expect(client.connect()).rejects.toThrow('连接超时')
    })

    it('应该正确断开连接', async () => {
      await client.connect()
      expect(client.isConnected()).toBe(true)

      client.disconnect()

      expect(client.getState()).toBe(WebSocketState.CLOSED)
      expect(client.isConnected()).toBe(false)
    })

    it('应该防止重复连接', async () => {
      const connectPromise1 = client.connect()
      const connectPromise2 = client.connect()

      await Promise.all([connectPromise1, connectPromise2])

      expect(client.isConnected()).toBe(true)
    })
  })

  describe('消息发送和接收', () => {
    beforeEach(async () => {
      client = new WebSocketClient({
        url: 'ws://localhost:8080',
        logLevel: LogLevel.ERROR,
        reconnect: {
          enabled: true,
          strategy: ReconnectStrategy.EXPONENTIAL,
          initialDelay: 1000,
          maxDelay: 30000,
          maxAttempts: 5,
          backoffMultiplier: 2,
          jitter: 1000
        }
      })
      await client.connect()
    })

    it('应该发送文本消息', async () => {
      const testMessage = 'Hello, WebSocket!'

      await client.send(testMessage, { type: MessageType.TEXT })

      const stats = client.getStats()
      expect(stats.messagesSent).toBe(1)
    })

    it('应该发送 JSON 消息', async () => {
      const testData = { message: 'Hello', timestamp: Date.now() }

      await client.send(testData, { type: MessageType.JSON })

      const stats = client.getStats()
      expect(stats.messagesSent).toBe(1)
    })

    it('应该发送二进制消息', async () => {
      const buffer = new ArrayBuffer(8)
      const view = new Uint8Array(buffer)
      view[0] = 72 // 'H'
      view[1] = 101 // 'e'

      await client.send(buffer, { type: MessageType.BINARY })

      const stats = client.getStats()
      expect(stats.messagesSent).toBe(1)
    })

    it('应该处理接收到的消息', (done) => {
      const testMessage = 'Hello from server'

      client.on('messageReceived', (message) => {
        expect(message.data).toBe(testMessage)
        expect(message.type).toBe(MessageType.TEXT)
        done()
      })

      // 模拟服务器发送消息
      const mockWs = (client as any).ws as MockWebSocket
      mockWs.simulateMessage(testMessage)
    })

    it('应该处理 JSON 消息的接收', (done) => {
      const testData = { message: 'Hello', timestamp: Date.now() }
      const jsonMessage = JSON.stringify({
        id: 'test-id',
        type: MessageType.JSON,
        data: testData,
        timestamp: Date.now()
      })

      client.on('messageReceived', (message) => {
        expect(message.data).toEqual(testData)
        expect(message.type).toBe(MessageType.JSON)
        done()
      })

      const mockWs = (client as any).ws as MockWebSocket
      mockWs.simulateMessage(jsonMessage)
    })
  })

  describe('消息队列', () => {
    beforeEach(() => {
      client = new WebSocketClient({
        url: 'ws://localhost:8080',
        logLevel: LogLevel.ERROR,
        reconnect: {
          enabled: true,
          strategy: ReconnectStrategy.EXPONENTIAL,
          initialDelay: 1000,
          maxDelay: 30000,
          maxAttempts: 5,
          backoffMultiplier: 2,
          jitter: 1000
        },
        messageQueue: {
          enabled: true,
          maxSize: 10,
          persistent: false,
          storageKey: 'test_queue',
          messageExpiry: 60000,
          deduplication: true
        }
      })
    })

    it('应该在未连接时将消息加入队列', async () => {
      expect(client.isConnected()).toBe(false)

      await client.send('test message')

      expect(client.getQueueLength()).toBe(1)
    })

    it('应该在连接后处理队列中的消息', async () => {
      // 未连接时发送消息
      await client.send('message 1')
      await client.send('message 2')

      expect(client.getQueueLength()).toBe(2)

      // 连接后应该处理队列
      await client.connect()

      // 等待队列处理完成
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(client.getQueueLength()).toBe(0)
      const stats = client.getStats()
      expect(stats.messagesSent).toBe(2)
    })

    it('应该限制队列大小', async () => {
      // 发送超过队列大小限制的消息
      for (let i = 0; i < 15; i++) {
        await client.send(`message ${i}`)
      }

      expect(client.getQueueLength()).toBe(10) // 应该限制在最大大小
    })

    it('应该支持消息去重', async () => {
      const messageId = 'duplicate-test'

      // 发送相同 ID 的消息
      await (client as any).addToQueue({
        id: messageId,
        type: MessageType.TEXT,
        data: 'test',
        timestamp: Date.now()
      })

      await (client as any).addToQueue({
        id: messageId,
        type: MessageType.TEXT,
        data: 'test',
        timestamp: Date.now()
      })

      expect(client.getQueueLength()).toBe(1) // 应该只有一条消息
    })
  })
})
