/**
 * WebSocket Worker代理测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WebSocketWorkerProxy, WorkerMessageType } from '../../../src/adapters/worker'

// 模拟Worker
class MockWorker {
  public onmessage: ((event: MessageEvent) => void) | null = null
  public onerror: ((event: ErrorEvent) => void) | null = null
  private listeners = new Map<string, Set<Function>>()

  constructor(public scriptURL: string | URL) { }

  addEventListener(type: string, listener: Function): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener)
  }

  removeEventListener(type: string, listener: Function): void {
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  postMessage(message: any): void {
    // 模拟异步消息处理
    setTimeout(() => {
      if (message.type === WorkerMessageType.INIT) {
        this.simulateMessage({
          type: WorkerMessageType.INIT,
          id: message.id
        })
      } else if (message.type === WorkerMessageType.SEND) {
        this.simulateMessage({
          type: WorkerMessageType.SEND,
          id: message.id
        })
      }
    }, 0)
  }

  terminate(): void {
    this.listeners.clear()
  }

  // 模拟从Worker发送消息
  simulateMessage(data: any): void {
    const listeners = this.listeners.get('message')
    if (listeners) {
      const event = { data } as MessageEvent
      listeners.forEach(listener => listener(event))
    }
  }

  // 模拟Worker错误
  simulateError(error: string): void {
    const listeners = this.listeners.get('error')
    if (listeners) {
      const event = new ErrorEvent('error', { message: error })
      listeners.forEach(listener => listener(event))
    }
  }
}

// 模拟全局Worker
global.Worker = MockWorker as any

describe('WebSocketWorkerProxy', () => {
  let proxy: WebSocketWorkerProxy
  let mockWorker: MockWorker

  beforeEach(() => {
    proxy = new WebSocketWorkerProxy('test-worker.js')
    mockWorker = (proxy as any).worker as MockWorker
  })

  afterEach(() => {
    proxy?.destroy()
  })

  describe('构造函数', () => {
    it('应该正确初始化', () => {
      expect(proxy).toBeInstanceOf(WebSocketWorkerProxy)
      expect(mockWorker).toBeInstanceOf(MockWorker)
      expect(mockWorker.scriptURL).toBe('test-worker.js')
    })

    it('应该设置事件监听器', () => {
      // 在创建新实例之前设置spy
      const MockWorkerClass = global.Worker as any
      const addEventListenerSpy = vi.fn()

      // 模拟Worker构造函数
      const mockConstructor = vi.fn().mockImplementation(function (this: any, scriptURL: string | URL) {
        this.scriptURL = scriptURL
        this.addEventListener = addEventListenerSpy
        this.removeEventListener = vi.fn()
        this.postMessage = vi.fn()
        this.terminate = vi.fn()
      })

      global.Worker = mockConstructor as any

      new WebSocketWorkerProxy('test-worker.js')

      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))

      // 恢复原始Worker
      global.Worker = MockWorkerClass
    })
  })

  describe('初始化', () => {
    it('应该发送初始化消息', async () => {
      const postMessageSpy = vi.spyOn(mockWorker, 'postMessage')

      const initPromise = proxy.init('ws://localhost:8080', { timeout: 5000 })

      expect(postMessageSpy).toHaveBeenCalledWith({
        type: WorkerMessageType.INIT,
        id: expect.any(String),
        data: { url: 'ws://localhost:8080', config: { timeout: 5000 } }
      })

      await initPromise
    })

    it('应该处理初始化错误', async () => {
      const postMessageSpy = vi.spyOn(mockWorker, 'postMessage').mockImplementation((message) => {
        setTimeout(() => {
          mockWorker.simulateMessage({
            type: message.type,
            id: message.id,
            error: '初始化失败'
          })
        }, 0)
      })

      await expect(proxy.init('ws://localhost:8080')).rejects.toThrow('初始化失败')
    })
  })

  describe('连接管理', () => {
    beforeEach(async () => {
      await proxy.init('ws://localhost:8080')
    })

    it('应该发送连接消息', async () => {
      const postMessageSpy = vi.spyOn(mockWorker, 'postMessage')

      proxy.connect()

      expect(postMessageSpy).toHaveBeenCalledWith({
        type: WorkerMessageType.CONNECT,
        id: expect.any(String)
      })
    })

    it('应该发送断开连接消息', () => {
      const postMessageSpy = vi.spyOn(mockWorker, 'postMessage')

      proxy.disconnect(1000, '正常关闭')

      expect(postMessageSpy).toHaveBeenCalledWith({
        type: WorkerMessageType.DISCONNECT,
        id: expect.any(String),
        data: { code: 1000, reason: '正常关闭' }
      })
    })
  })

  describe('消息发送', () => {
    beforeEach(async () => {
      await proxy.init('ws://localhost:8080')
    })

    it('应该发送消息', async () => {
      const postMessageSpy = vi.spyOn(mockWorker, 'postMessage')

      const sendPromise = proxy.send({ type: 'text', data: 'Hello' })

      expect(postMessageSpy).toHaveBeenCalledWith({
        type: WorkerMessageType.SEND,
        id: expect.any(String),
        data: { type: 'text', data: 'Hello' }
      })

      await sendPromise
    })

    it('应该处理发送错误', async () => {
      const postMessageSpy = vi.spyOn(mockWorker, 'postMessage').mockImplementation((message) => {
        if (message.type === WorkerMessageType.SEND) {
          setTimeout(() => {
            mockWorker.simulateMessage({
              type: message.type,
              id: message.id,
              error: '发送失败'
            })
          }, 0)
        }
      })

      await expect(proxy.send('test')).rejects.toThrow('发送失败')
    })
  })

  describe('事件处理', () => {
    beforeEach(async () => {
      await proxy.init('ws://localhost:8080')
    })

    it('应该处理状态变化事件', () => {
      const listener = vi.fn()
      proxy.on('stateChange', listener)

      mockWorker.simulateMessage({
        type: WorkerMessageType.STATE_CHANGE,
        data: { newState: 'connected', oldState: 'connecting' }
      })

      expect(listener).toHaveBeenCalledWith('connected')
    })

    it('应该处理连接成功事件', () => {
      const listener = vi.fn()
      proxy.on('connected', listener)

      mockWorker.simulateMessage({
        type: WorkerMessageType.CONNECTED
      })

      expect(listener).toHaveBeenCalled()
    })

    it('应该处理连接断开事件', () => {
      const listener = vi.fn()
      proxy.on('disconnected', listener)

      mockWorker.simulateMessage({
        type: WorkerMessageType.DISCONNECTED,
        data: { code: 1000, reason: '正常关闭' }
      })

      expect(listener).toHaveBeenCalledWith(1000, '正常关闭')
    })

    it('应该处理消息事件', () => {
      const listener = vi.fn()
      proxy.on('message', listener)

      const message = { type: 'text', data: 'Hello', timestamp: Date.now() }
      mockWorker.simulateMessage({
        type: WorkerMessageType.MESSAGE,
        data: message
      })

      expect(listener).toHaveBeenCalledWith(message)
    })

    it('应该处理错误事件', () => {
      const listener = vi.fn()
      proxy.on('error', listener)

      mockWorker.simulateMessage({
        type: WorkerMessageType.ERROR,
        data: { message: '连接错误' }
      })

      expect(listener).toHaveBeenCalledWith(expect.any(Error))
    })

    it('应该处理重连事件', () => {
      const listener = vi.fn()
      proxy.on('reconnecting', listener)

      mockWorker.simulateMessage({
        type: WorkerMessageType.RECONNECTING,
        data: { attempt: 3 }
      })

      expect(listener).toHaveBeenCalledWith(3)
    })
  })

  describe('状态管理', () => {
    beforeEach(async () => {
      await proxy.init('ws://localhost:8080')
    })

    it('应该返回当前状态', () => {
      const state = proxy.getState()

      expect(state).toEqual({
        state: 'disconnected',
        connected: false,
        connecting: false,
        reconnecting: false,
        lastError: null,
        lastMessage: null,
        reconnectCount: 0
      })
    })

    it('应该更新状态', () => {
      mockWorker.simulateMessage({
        type: WorkerMessageType.STATE_CHANGE,
        data: { newState: 'connected', oldState: 'connecting' }
      })

      const state = proxy.getState()
      expect(state.state).toBe('connected')
      expect(state.connected).toBe(true)
    })

    it('应该更新最后的消息', () => {
      const message = { type: 'text', data: 'Hello', timestamp: Date.now() }
      mockWorker.simulateMessage({
        type: WorkerMessageType.MESSAGE,
        data: message
      })

      const state = proxy.getState()
      expect(state.lastMessage).toEqual(message)
    })

    it('应该更新最后的错误', () => {
      mockWorker.simulateMessage({
        type: WorkerMessageType.ERROR,
        data: { message: '连接错误' }
      })

      const state = proxy.getState()
      expect(state.lastError).toBeInstanceOf(Error)
      expect(state.lastError?.message).toBe('连接错误')
    })
  })

  describe('事件监听器管理', () => {
    it('应该添加事件监听器', () => {
      const listener = vi.fn()
      proxy.on('connected', listener)

      mockWorker.simulateMessage({
        type: WorkerMessageType.CONNECTED
      })

      expect(listener).toHaveBeenCalled()
    })

    it('应该移除事件监听器', () => {
      const listener = vi.fn()
      proxy.on('connected', listener)
      proxy.off('connected', listener)

      mockWorker.simulateMessage({
        type: WorkerMessageType.CONNECTED
      })

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('Worker错误处理', () => {
    it('应该处理Worker错误', () => {
      const listener = vi.fn()
      proxy.on('error', listener)

      mockWorker.simulateError('Worker脚本加载失败')

      expect(listener).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('销毁', () => {
    it('应该正确销毁', () => {
      const terminateSpy = vi.spyOn(mockWorker, 'terminate')

      proxy.destroy()

      expect(terminateSpy).toHaveBeenCalled()
    })

    it('应该清理所有资源', () => {
      const listener = vi.fn()
      proxy.on('connected', listener)

      proxy.destroy()

      // 销毁后不应该响应事件
      mockWorker.simulateMessage({
        type: WorkerMessageType.CONNECTED
      })

      expect(listener).not.toHaveBeenCalled()
    })
  })
})
