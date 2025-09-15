/**
 * React适配器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// 模拟React hooks - 必须在导入之前定义
vi.mock('react', () => ({
  useState: vi.fn(),
  useEffect: vi.fn(),
  useCallback: vi.fn(),
  useRef: vi.fn(),
  useMemo: vi.fn()
}))

import { ReactAdapter, useWebSocket, useWebSocketMessages } from '../../../src/adapters/react'
import { WebSocketClient } from '../../../src/core/websocket-client'

describe('ReactAdapter', () => {
  let client: WebSocketClient
  let adapter: ReactAdapter
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
    adapter = new ReactAdapter(client)
  })

  afterEach(() => {
    adapter.destroy()
    vi.clearAllMocks()
  })

  describe('构造函数和初始化', () => {
    it('应该创建React适配器', () => {
      expect(adapter).toBeInstanceOf(ReactAdapter)
      expect(adapter.getClient()).toBe(client)
    })

    it('应该设置状态更新回调', () => {
      const callback = vi.fn()

      adapter.setStateUpdateCallback(callback)

      // 模拟状态变化
      client.emit('stateChange', 'connected', 'disconnected')

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('状态同步', () => {
    it('应该通过回调同步状态', () => {
      const callback = vi.fn()
      adapter.setStateUpdateCallback(callback)

      // 模拟状态变化
      client.emit('stateChange', 'connected', 'disconnected')

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'connected',
          connected: true
        })
      )
    })

    it('应该在没有回调时不报错', () => {
      expect(() => {
        client.emit('stateChange', 'connected', 'disconnected')
      }).not.toThrow()
    })
  })
})

describe('useWebSocket', () => {
  let mockWebSocket: any
  let mockSetState: vi.Mock
  let mockAdapterRef: { current: ReactAdapter | null }
  let mockEffectCleanup: vi.Mock

  beforeEach(async () => {
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

    // 模拟React hooks
    mockSetState = vi.fn()
    mockAdapterRef = { current: null }
    mockEffectCleanup = vi.fn()

    const { useState, useRef, useEffect, useCallback } = await import('react')

    vi.mocked(useState).mockReturnValue([
      {
        state: 'disconnected',
        connected: false,
        connecting: false,
        reconnecting: false,
        lastError: null,
        lastMessage: null,
        reconnectCount: 0
      },
      mockSetState
    ])

    vi.mocked(useRef).mockReturnValue(mockAdapterRef)

    vi.mocked(useEffect).mockImplementation((effect, deps) => {
      const cleanup = effect()
      if (cleanup) {
        mockEffectCleanup.mockImplementation(cleanup)
      }
      return cleanup
    })

    vi.mocked(useCallback).mockImplementation((fn) => fn)
  })

  afterEach(() => {
    // 调用清理函数
    if (mockEffectCleanup.mock.calls.length > 0) {
      mockEffectCleanup()
    }
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该返回WebSocket状态和方法', () => {
      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })

      expect(result).toHaveProperty('state')
      expect(result).toHaveProperty('connected')
      expect(result).toHaveProperty('connecting')
      expect(result).toHaveProperty('reconnecting')
      expect(result).toHaveProperty('lastError')
      expect(result).toHaveProperty('lastMessage')
      expect(result).toHaveProperty('reconnectCount')
      expect(result).toHaveProperty('connect')
      expect(result).toHaveProperty('disconnect')
      expect(result).toHaveProperty('send')
      expect(result).toHaveProperty('on')
      expect(result).toHaveProperty('off')
      expect(result).toHaveProperty('getClient')
    })

    it('应该使用useState管理状态', async () => {
      const { useState } = await import('react')
      useWebSocket('ws://localhost:8080', {}, { autoConnect: false })

      expect(vi.mocked(useState)).toHaveBeenCalledWith(expect.any(Function))
    })

    it('应该使用useRef保存适配器实例', async () => {
      const { useRef } = await import('react')
      useWebSocket('ws://localhost:8080', {}, { autoConnect: false })

      expect(vi.mocked(useRef)).toHaveBeenCalled()
    })

    it('应该使用useEffect管理生命周期', async () => {
      const { useEffect } = await import('react')
      useWebSocket('ws://localhost:8080', {}, { autoConnect: false })

      expect(vi.mocked(useEffect)).toHaveBeenCalled()
    })

    it('应该使用useCallback创建方法', async () => {
      const { useCallback } = await import('react')
      useWebSocket('ws://localhost:8080', {}, { autoConnect: false })

      expect(vi.mocked(useCallback)).toHaveBeenCalledTimes(6) // connect, disconnect, send, on, off, getClient
    })
  })

  describe('方法实现', () => {
    it('connect方法应该调用适配器的connect', async () => {
      // 创建一个真实的适配器实例用于测试
      const client = new WebSocketClient({ url: 'ws://localhost:8080' })
      const adapter = new ReactAdapter(client)
      mockAdapterRef.current = adapter

      const connectSpy = vi.spyOn(adapter, 'connect').mockResolvedValue()

      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })
      await result.connect()

      expect(connectSpy).toHaveBeenCalledOnce()

      adapter.destroy()
    })

    it('disconnect方法应该调用适配器的disconnect', () => {
      const client = new WebSocketClient({ url: 'ws://localhost:8080' })
      const adapter = new ReactAdapter(client)
      mockAdapterRef.current = adapter

      const disconnectSpy = vi.spyOn(adapter, 'disconnect')

      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })
      result.disconnect(1000, '测试断开')

      expect(disconnectSpy).toHaveBeenCalledWith(1000, '测试断开')

      adapter.destroy()
    })

    it('send方法应该调用适配器的send', async () => {
      const client = new WebSocketClient({ url: 'ws://localhost:8080' })
      const adapter = new ReactAdapter(client)
      mockAdapterRef.current = adapter

      const sendSpy = vi.spyOn(adapter, 'send').mockResolvedValue()

      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })
      const message = { type: 'test', data: 'hello' }
      await result.send(message)

      expect(sendSpy).toHaveBeenCalledWith(message)

      adapter.destroy()
    })

    it('getClient方法应该返回客户端实例', () => {
      const client = new WebSocketClient({ url: 'ws://localhost:8080' })
      const adapter = new ReactAdapter(client)
      mockAdapterRef.current = adapter

      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })
      const returnedClient = result.getClient()

      expect(returnedClient).toBe(client)

      adapter.destroy()
    })

    it('在适配器未初始化时应该抛出错误', async () => {
      mockAdapterRef.current = null

      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })

      await expect(result.send('test')).rejects.toThrow('WebSocket未初始化')
      expect(() => result.getClient()).toThrow('WebSocket未初始化')
    })
  })
})

describe('useWebSocketMessages', () => {
  let mockSetMessages: vi.Mock
  let mockUseWebSocketResult: any

  beforeEach(async () => {
    vi.clearAllMocks()

    mockSetMessages = vi.fn()
    mockUseWebSocketResult = {
      connected: false,
      send: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      off: vi.fn()
    }

    const { useState, useEffect, useCallback } = await import('react')

    vi.mocked(useState).mockReturnValue([[], mockSetMessages])

    // 模拟useWebSocket的返回值
    vi.doMock('../../../src/adapters/react', async () => {
      const actual = await vi.importActual('../../../src/adapters/react')
      return {
        ...actual,
        useWebSocket: vi.fn(() => mockUseWebSocketResult)
      }
    })

    vi.mocked(useEffect).mockImplementation((effect) => {
      const cleanup = effect()
      return cleanup
    })

    vi.mocked(useCallback).mockImplementation((fn) => fn)
  })

  describe('基础功能', () => {
    it('应该返回消息相关的状态和方法', () => {
      const result = useWebSocketMessages('ws://localhost:8080')

      expect(result).toHaveProperty('messages')
      expect(result).toHaveProperty('sendMessage')
      expect(result).toHaveProperty('clearMessages')
      expect(result).toHaveProperty('connected')
    })

    it('sendMessage应该在连接时发送消息', async () => {
      mockUseWebSocketResult.connected = true

      const result = useWebSocketMessages('ws://localhost:8080')
      await result.sendMessage('test message')

      expect(mockUseWebSocketResult.send).toHaveBeenCalledWith('test message')
    })

    it('sendMessage应该在未连接时抛出错误', async () => {
      mockUseWebSocketResult.connected = false

      const result = useWebSocketMessages('ws://localhost:8080')

      await expect(result.sendMessage('test')).rejects.toThrow('WebSocket未连接')
    })

    it('clearMessages应该清空消息列表', () => {
      const result = useWebSocketMessages('ws://localhost:8080')
      result.clearMessages()

      expect(mockSetMessages).toHaveBeenCalledWith([])
    })
  })
})
