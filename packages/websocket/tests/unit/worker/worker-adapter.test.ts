/**
 * Worker适配器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WorkerAdapter, WorkerMessageType } from '../../../src/adapters/worker'
import { WebSocketClient } from '../../../src/core/websocket-client'

// 模拟Worker环境
const mockSelf = {
  addEventListener: vi.fn(),
  postMessage: vi.fn()
}

// 模拟全局self对象
Object.defineProperty(globalThis, 'self', {
  value: mockSelf,
  writable: true
})

describe('WorkerAdapter', () => {
  let client: WebSocketClient
  let adapter: WorkerAdapter
  let mockWebSocket: any

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()

    // 模拟WebSocket
    mockWebSocket = {
      readyState: WebSocket.CONNECTING,
      close: vi.fn(),
      send: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    global.WebSocket = vi.fn(() => mockWebSocket) as any

    // 创建WebSocket客户端
    client = new WebSocketClient({
      url: 'ws://localhost:8080',
      autoConnect: false
    })

    // 创建Worker适配器
    adapter = new WorkerAdapter(client, {
      autoConnect: false,
      autoDisconnect: true
    })
  })

  afterEach(() => {
    adapter?.destroy()
  })

  describe('构造函数', () => {
    it('应该正确初始化', () => {
      expect(adapter).toBeInstanceOf(WorkerAdapter)
      expect(mockSelf.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })
  })

  describe('消息处理', () => {
    it('应该处理INIT消息', async () => {
      const messageEvent = {
        data: {
          type: WorkerMessageType.INIT,
          id: 'test-id',
          data: { url: 'ws://localhost:8080', config: { timeout: 5000 } }
        }
      }

      // 获取消息处理器
      const messageHandler = mockSelf.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]

      expect(messageHandler).toBeDefined()

      // 调用消息处理器
      await messageHandler(messageEvent)

      // 验证响应
      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.INIT,
        id: 'test-id'
      })
    })

    it('应该处理CONNECT消息', async () => {
      const connectSpy = vi.spyOn(client, 'connect').mockResolvedValue()

      const messageEvent = {
        data: {
          type: WorkerMessageType.CONNECT,
          id: 'test-id'
        }
      }

      const messageHandler = mockSelf.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]

      await messageHandler(messageEvent)

      expect(connectSpy).toHaveBeenCalled()
    })

    it('应该处理DISCONNECT消息', async () => {
      const disconnectSpy = vi.spyOn(client, 'disconnect')

      const messageEvent = {
        data: {
          type: WorkerMessageType.DISCONNECT,
          data: { code: 1000, reason: '正常关闭' }
        }
      }

      const messageHandler = mockSelf.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]

      await messageHandler(messageEvent)

      expect(disconnectSpy).toHaveBeenCalledWith(1000, '正常关闭')
    })

    it('应该处理SEND消息', async () => {
      const sendSpy = vi.spyOn(client, 'send').mockResolvedValue()

      const messageEvent = {
        data: {
          type: WorkerMessageType.SEND,
          id: 'test-id',
          data: { type: 'text', data: 'Hello' }
        }
      }

      const messageHandler = mockSelf.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]

      await messageHandler(messageEvent)

      expect(sendSpy).toHaveBeenCalledWith({ type: 'text', data: 'Hello' })
      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.SEND,
        id: 'test-id'
      })
    })

    it('应该处理未知消息类型', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      const messageEvent = {
        data: {
          type: 'unknown-type' as WorkerMessageType
        }
      }

      const messageHandler = mockSelf.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]

      await messageHandler(messageEvent)

      expect(consoleSpy).toHaveBeenCalledWith('未知的Worker消息类型: unknown-type')

      consoleSpy.mockRestore()
    })

    it('应该处理消息处理错误', async () => {
      const sendSpy = vi.spyOn(client, 'send').mockRejectedValue(new Error('发送失败'))

      const messageEvent = {
        data: {
          type: WorkerMessageType.SEND,
          id: 'test-id',
          data: 'test message'
        }
      }

      const messageHandler = mockSelf.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1]

      await messageHandler(messageEvent)

      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.SEND,
        id: 'test-id',
        error: '发送失败'
      })
    })
  })

  describe('事件转发', () => {
    it('应该转发状态变化事件', () => {
      client.emit('stateChange', { from: 'connecting', to: 'connected' })

      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.STATE_CHANGE,
        data: { newState: 'connected', oldState: 'connecting' }
      })
    })

    it('应该转发连接成功事件', () => {
      client.emit('connected')

      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.CONNECTED
      })
    })

    it('应该转发连接断开事件', () => {
      const closeEvent = { code: 1000, reason: '正常关闭' } as CloseEvent
      client.emit('close', closeEvent)

      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.DISCONNECTED,
        data: { code: 1000, reason: '正常关闭' }
      })
    })

    it('应该转发消息事件', () => {
      const message = { type: 'text', data: 'Hello', timestamp: Date.now() }
      client.emit('message', message)

      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.MESSAGE,
        data: message
      })
    })

    it('应该转发错误事件', () => {
      const errorEvent = new ErrorEvent('error', { message: '连接错误' })
      client.emit('error', errorEvent)

      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.ERROR,
        data: { message: '连接错误' }
      })
    })

    it('应该转发重连事件', () => {
      client.emit('reconnecting', 3)

      expect(mockSelf.postMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.RECONNECTING,
        data: { attempt: 3 }
      })
    })
  })

  describe('状态管理', () => {
    it('应该正确更新状态', () => {
      const initialState = adapter.getState()
      expect(initialState.state).toBe('disconnected')
      expect(initialState.connected).toBe(false)

      // 触发状态变化
      client.emit('stateChange', { from: 'connecting', to: 'connected' })

      const newState = adapter.getState()
      expect(newState.state).toBe('connected')
      expect(newState.connected).toBe(true)
    })

    it('应该更新最后接收的消息', () => {
      const message = { type: 'text', data: 'Hello', timestamp: Date.now() }
      client.emit('message', message)

      const state = adapter.getState()
      expect(state.lastMessage).toEqual(message)
    })

    it('应该更新最后的错误', () => {
      const errorEvent = new ErrorEvent('error', { message: '连接错误' })
      client.emit('error', errorEvent)

      const state = adapter.getState()
      expect(state.lastError).toBeInstanceOf(Error)
      expect(state.lastError?.message).toBe('连接错误')
    })

    it('应该更新重连次数', () => {
      client.emit('reconnecting', 5)

      const state = adapter.getState()
      expect(state.reconnectCount).toBe(5)
    })
  })

  describe('生命周期', () => {
    it('应该正确销毁', () => {
      const destroySpy = vi.spyOn(client, 'destroy')

      adapter.destroy()

      expect(destroySpy).toHaveBeenCalled()
    })
  })
})
