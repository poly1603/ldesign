/**
 * 基础适配器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { BaseAdapter, type AdapterConfig, type AdapterState } from '../../../src/adapters/base'
import { WebSocketClient } from '../../../src/core/websocket-client'

// 创建测试用的适配器实现
class TestAdapter extends BaseAdapter {
  public syncStateCallCount = 0
  public lastSyncedState: Partial<AdapterState> | null = null

  protected syncState(): void {
    this.syncStateCallCount++
    this.lastSyncedState = { ...this.state }
  }

  // 暴露受保护的方法用于测试
  public testUpdateState(updates: Partial<AdapterState>): void {
    this.updateState(updates)
  }

  public testEmit<K extends keyof import('../../../src/adapters/base').AdapterEvents>(
    event: K,
    ...args: Parameters<import('../../../src/adapters/base').AdapterEvents[K]>
  ): void {
    this.emit(event, ...args)
  }
}

describe('BaseAdapter', () => {
  let client: WebSocketClient
  let adapter: TestAdapter
  let mockWebSocket: any

  beforeEach(() => {
    // 模拟WebSocket
    mockWebSocket = {
      readyState: WebSocket.CONNECTING,
      close: vi.fn(),
      send: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    global.WebSocket = vi.fn(() => mockWebSocket) as any

    client = new WebSocketClient({ url: 'ws://localhost:8080' })
    adapter = new TestAdapter(client)
  })

  afterEach(() => {
    adapter.destroy()
    vi.clearAllMocks()
  })

  describe('构造函数和初始化', () => {
    it('应该使用默认配置创建适配器', () => {
      const state = adapter.getState()

      expect(state.state).toBe('disconnected')
      expect(state.connected).toBe(false)
      expect(state.connecting).toBe(false)
      expect(state.reconnecting).toBe(false)
      expect(state.lastError).toBeNull()
      expect(state.lastMessage).toBeNull()
      expect(state.reconnectCount).toBe(0)
    })

    it('应该使用自定义配置创建适配器', () => {
      const config: AdapterConfig = {
        autoConnect: false,
        autoDisconnect: false,
        enableStateSync: false
      }

      const customAdapter = new TestAdapter(client, config)
      expect(customAdapter.getClient()).toBe(client)
      customAdapter.destroy()
    })

    it('应该设置事件监听器', () => {
      // 验证客户端事件监听器已设置
      expect(client.listenerCount('stateChange')).toBeGreaterThan(0)
      expect(client.listenerCount('connected')).toBeGreaterThan(0)
      expect(client.listenerCount('disconnected')).toBeGreaterThan(0)
      expect(client.listenerCount('message')).toBeGreaterThan(0)
      expect(client.listenerCount('error')).toBeGreaterThan(0)
      expect(client.listenerCount('reconnecting')).toBeGreaterThan(0)
    })
  })

  describe('状态管理', () => {
    it('应该更新适配器状态', () => {
      const updates = {
        connected: true,
        lastError: new Error('测试错误')
      }

      adapter.testUpdateState(updates)

      const state = adapter.getState()
      expect(state.connected).toBe(true)
      expect(state.lastError).toEqual(updates.lastError)
    })

    it('应该在状态更新时调用syncState', () => {
      const initialCallCount = adapter.syncStateCallCount

      adapter.testUpdateState({ connected: true })

      expect(adapter.syncStateCallCount).toBe(initialCallCount + 1)
      expect(adapter.lastSyncedState?.connected).toBe(true)
    })

    it('应该在禁用状态同步时不调用syncState', () => {
      const config: AdapterConfig = { enableStateSync: false }
      const noSyncAdapter = new TestAdapter(client, config)

      const initialCallCount = noSyncAdapter.syncStateCallCount
      noSyncAdapter.testUpdateState({ connected: true })

      expect(noSyncAdapter.syncStateCallCount).toBe(initialCallCount)
      noSyncAdapter.destroy()
    })

    it('应该调用自定义状态更新回调', () => {
      const onStateUpdate = vi.fn()
      const config: AdapterConfig = { onStateUpdate }
      const callbackAdapter = new TestAdapter(client, config)

      const updates = { connected: true }
      callbackAdapter.testUpdateState(updates)

      expect(onStateUpdate).toHaveBeenCalledWith(updates)
      callbackAdapter.destroy()
    })
  })

  describe('事件处理', () => {
    it('应该添加和触发事件监听器', () => {
      const listener = vi.fn()

      adapter.on('connected', listener)
      adapter.testEmit('connected')

      expect(listener).toHaveBeenCalledOnce()
    })

    it('应该移除事件监听器', () => {
      const listener = vi.fn()

      adapter.on('connected', listener)
      adapter.off('connected', listener)
      adapter.testEmit('connected')

      expect(listener).not.toHaveBeenCalled()
    })

    it('应该支持多个事件监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      adapter.on('connected', listener1)
      adapter.on('connected', listener2)
      adapter.testEmit('connected')

      expect(listener1).toHaveBeenCalledOnce()
      expect(listener2).toHaveBeenCalledOnce()
    })

    it('应该处理监听器中的错误', () => {
      const errorListener = vi.fn(() => {
        throw new Error('监听器错误')
      })
      const normalListener = vi.fn()

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      adapter.on('connected', errorListener)
      adapter.on('connected', normalListener)
      adapter.testEmit('connected')

      expect(consoleSpy).toHaveBeenCalled()
      expect(normalListener).toHaveBeenCalledOnce()

      consoleSpy.mockRestore()
    })
  })

  describe('WebSocket操作', () => {
    it('应该连接WebSocket', async () => {
      const connectSpy = vi.spyOn(client, 'connect').mockResolvedValue()

      await adapter.connect()

      expect(connectSpy).toHaveBeenCalledOnce()
    })

    it('应该断开WebSocket连接', () => {
      const disconnectSpy = vi.spyOn(client, 'disconnect')

      adapter.disconnect(1000, '测试断开')

      expect(disconnectSpy).toHaveBeenCalledWith(1000, '测试断开')
    })

    it('应该发送消息', async () => {
      const sendSpy = vi.spyOn(client, 'send').mockResolvedValue()
      const message = { type: 'test', data: 'hello' }

      await adapter.send(message)

      expect(sendSpy).toHaveBeenCalledWith(message)
    })

    it('应该获取WebSocket客户端实例', () => {
      expect(adapter.getClient()).toBe(client)
    })
  })

  describe('生命周期管理', () => {
    it('应该在销毁时清理资源', () => {
      const disconnectSpy = vi.spyOn(client, 'disconnect')

      // 模拟连接状态
      vi.spyOn(client, 'isConnected').mockReturnValue(true)

      adapter.destroy()

      expect(disconnectSpy).toHaveBeenCalledWith(1000, '适配器销毁')
    })

    it('应该在autoDisconnect为false时不自动断开连接', () => {
      const config: AdapterConfig = { autoDisconnect: false }
      const noAutoDisconnectAdapter = new TestAdapter(client, config)
      const disconnectSpy = vi.spyOn(client, 'disconnect')

      vi.spyOn(client, 'isConnected').mockReturnValue(true)

      noAutoDisconnectAdapter.destroy()

      expect(disconnectSpy).not.toHaveBeenCalled()
    })

    it('应该清空事件监听器', () => {
      const listener = vi.fn()

      adapter.on('connected', listener)
      adapter.destroy()
      adapter.testEmit('connected')

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('客户端事件响应', () => {
    it('应该响应状态变化事件', () => {
      const listener = vi.fn()
      adapter.on('stateChange', listener)

      // 模拟状态变化
      client.emit('stateChange', 'connected', 'disconnected')

      expect(listener).toHaveBeenCalledWith('connected')
      expect(adapter.getState().state).toBe('connected')
      expect(adapter.getState().connected).toBe(true)
    })

    it('应该响应连接成功事件', () => {
      const listener = vi.fn()
      adapter.on('connected', listener)

      client.emit('connected')

      expect(listener).toHaveBeenCalledOnce()
      expect(adapter.getState().lastError).toBeNull()
    })

    it('应该响应断开连接事件', () => {
      const listener = vi.fn()
      adapter.on('disconnected', listener)

      client.emit('close', { code: 1000, reason: '正常关闭' } as CloseEvent)

      expect(listener).toHaveBeenCalledWith(1000, '正常关闭')
    })

    it('应该响应消息事件', () => {
      const listener = vi.fn()
      adapter.on('message', listener)

      const message = { data: 'test', timestamp: Date.now(), id: '123' }
      client.emit('message', message)

      expect(listener).toHaveBeenCalledWith(message)
      expect(adapter.getState().lastMessage).toEqual(message)
    })

    it('应该响应错误事件', () => {
      const listener = vi.fn()
      adapter.on('error', listener)

      const error = new Error('测试错误')
      client.emit('error', error)

      expect(listener).toHaveBeenCalledWith(error)
      expect(adapter.getState().lastError).toEqual(error)
    })

    it('应该响应重连事件', () => {
      const listener = vi.fn()
      adapter.on('reconnecting', listener)

      client.emit('reconnecting', 3)

      expect(listener).toHaveBeenCalledWith(3)
      expect(adapter.getState().reconnectCount).toBe(3)
    })
  })
})
