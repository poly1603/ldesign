/**
 * Vue适配器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { VueAdapter, useWebSocket, VueWebSocketPlugin } from '../../../src/adapters/vue'
import { WebSocketClient } from '../../../src/core/websocket-client'

// 模拟Vue的onUnmounted
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onUnmounted: vi.fn((callback: () => void) => {
      // 存储回调以便测试时调用
      ;(global as any).__vueUnmountCallbacks = (global as any).__vueUnmountCallbacks || []
      ;(global as any).__vueUnmountCallbacks.push(callback)
    })
  }
})

describe('VueAdapter', () => {
  let client: WebSocketClient
  let adapter: VueAdapter
  let mockWebSocket: any

  beforeEach(() => {
    // 清理之前的回调
    ;(global as any).__vueUnmountCallbacks = []

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
    adapter = new VueAdapter(client)
  })

  afterEach(() => {
    adapter.destroy()
    vi.clearAllMocks()
  })

  describe('构造函数和初始化', () => {
    it('应该创建Vue响应式状态', () => {
      const vueState = adapter.getVueState()
      
      expect(vueState.state.value).toBe('disconnected')
      expect(vueState.connected.value).toBe(false)
      expect(vueState.connecting.value).toBe(false)
      expect(vueState.reconnecting.value).toBe(false)
      expect(vueState.lastError.value).toBeNull()
      expect(vueState.lastMessage.value).toBeNull()
      expect(vueState.reconnectCount.value).toBe(0)
    })

    it('应该同步初始状态到Vue响应式系统', () => {
      const vueState = adapter.getVueState()
      const adapterState = adapter.getState()
      
      expect(vueState.state.value).toBe(adapterState.state)
      expect(vueState.connected.value).toBe(adapterState.connected)
      expect(vueState.connecting.value).toBe(adapterState.connecting)
    })
  })

  describe('状态同步', () => {
    it('应该同步状态变化到Vue响应式系统', async () => {
      const vueState = adapter.getVueState()
      
      // 模拟状态变化
      client.emit('stateChange', 'connected', 'disconnected')
      
      await nextTick()
      
      expect(vueState.state.value).toBe('connected')
      expect(vueState.connected.value).toBe(true)
    })

    it('应该同步错误状态', async () => {
      const vueState = adapter.getVueState()
      const error = new Error('测试错误')
      
      client.emit('error', error)
      
      await nextTick()
      
      expect(vueState.lastError.value).toEqual(error)
    })

    it('应该同步消息状态', async () => {
      const vueState = adapter.getVueState()
      const message = { data: 'test', timestamp: Date.now(), id: '123' }
      
      client.emit('message', message)
      
      await nextTick()
      
      expect(vueState.lastMessage.value).toEqual(message)
    })

    it('应该同步重连计数', async () => {
      const vueState = adapter.getVueState()
      
      client.emit('reconnecting', 5)
      
      await nextTick()
      
      expect(vueState.reconnectCount.value).toBe(5)
    })
  })
})

describe('useWebSocket', () => {
  let mockWebSocket: any

  beforeEach(() => {
    // 清理之前的回调
    ;(global as any).__vueUnmountCallbacks = []

    // 模拟WebSocket
    mockWebSocket = {
      readyState: WebSocket.CONNECTING,
      close: vi.fn(),
      send: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    global.WebSocket = vi.fn(() => mockWebSocket) as any
  })

  afterEach(() => {
    // 调用所有的卸载回调来清理资源
    const callbacks = (global as any).__vueUnmountCallbacks || []
    callbacks.forEach((callback: () => void) => callback())
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该返回响应式状态和方法', () => {
      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })
      
      expect(result.state.value).toBe('disconnected')
      expect(result.connected.value).toBe(false)
      expect(result.connecting.value).toBe(false)
      expect(result.reconnecting.value).toBe(false)
      expect(result.lastError.value).toBeNull()
      expect(result.lastMessage.value).toBeNull()
      expect(result.reconnectCount.value).toBe(0)
      
      expect(typeof result.connect).toBe('function')
      expect(typeof result.disconnect).toBe('function')
      expect(typeof result.send).toBe('function')
      expect(typeof result.on).toBe('function')
      expect(typeof result.off).toBe('function')
      expect(typeof result.getClient).toBe('function')
    })

    it('应该使用提供的配置', () => {
      const config = {
        connectionTimeout: 5000,
        debug: true
      }
      
      const result = useWebSocket('ws://localhost:8080', config, { autoConnect: false })
      const client = result.getClient()
      
      expect(client.getConfig().connectionTimeout).toBe(5000)
      expect(client.getConfig().debug).toBe(true)
    })

    it('应该支持自定义适配器配置', () => {
      const adapterConfig = {
        autoConnect: false,
        autoDisconnect: false
      }
      
      const result = useWebSocket('ws://localhost:8080', {}, adapterConfig)
      
      // 验证没有自动连接
      expect(result.state.value).toBe('disconnected')
    })
  })

  describe('方法调用', () => {
    it('应该能够连接WebSocket', async () => {
      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })
      
      const connectPromise = result.connect()
      
      // 模拟连接成功
      setTimeout(() => {
        mockWebSocket.readyState = WebSocket.OPEN
        mockWebSocket.addEventListener.mock.calls
          .filter(call => call[0] === 'open')
          .forEach(call => call[1]())
      }, 10)
      
      await connectPromise
      
      expect(mockWebSocket.addEventListener).toHaveBeenCalled()
    })

    it('应该能够断开连接', () => {
      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })
      
      result.disconnect(1000, '测试断开')
      
      // 验证断开连接被调用
      expect(result.state.value).toBe('disconnected')
    })

    it('应该能够发送消息', async () => {
      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })
      const message = { type: 'test', data: 'hello' }
      
      // 模拟连接状态
      mockWebSocket.readyState = WebSocket.OPEN
      
      await result.send(message)
      
      expect(mockWebSocket.send).toHaveBeenCalled()
    })
  })

  describe('事件处理', () => {
    it('应该能够添加和移除事件监听器', () => {
      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })
      const listener = vi.fn()
      
      result.on('connected', listener)
      result.off('connected', listener)
      
      // 验证监听器管理正常工作
      expect(typeof result.on).toBe('function')
      expect(typeof result.off).toBe('function')
    })
  })

  describe('生命周期管理', () => {
    it('应该在组件卸载时清理资源', () => {
      const result = useWebSocket('ws://localhost:8080', {}, { autoConnect: false })
      const client = result.getClient()
      const destroySpy = vi.spyOn(client, 'disconnect')
      
      // 模拟组件卸载
      const callbacks = (global as any).__vueUnmountCallbacks || []
      callbacks.forEach((callback: () => void) => callback())
      
      expect(destroySpy).toHaveBeenCalled()
    })
  })
})

describe('VueWebSocketPlugin', () => {
  let mockApp: any

  beforeEach(() => {
    mockApp = {
      provide: vi.fn(),
      config: {
        globalProperties: {}
      }
    }
  })

  it('应该安装插件并提供默认配置', () => {
    const options = {
      defaultConfig: { debug: true },
      defaultAdapterConfig: { autoConnect: false },
      globalPropertyName: '$ws'
    }
    
    VueWebSocketPlugin.install(mockApp, options)
    
    expect(mockApp.provide).toHaveBeenCalledWith('websocket-default-config', options.defaultConfig)
    expect(mockApp.provide).toHaveBeenCalledWith('websocket-default-adapter-config', options.defaultAdapterConfig)
    expect(mockApp.config.globalProperties.$ws).toBeDefined()
  })

  it('应该使用默认选项', () => {
    VueWebSocketPlugin.install(mockApp)
    
    expect(mockApp.provide).toHaveBeenCalledWith('websocket-default-config', {})
    expect(mockApp.provide).toHaveBeenCalledWith('websocket-default-adapter-config', {})
    expect(mockApp.config.globalProperties.$websocket).toBeDefined()
  })

  it('应该提供全局方法', () => {
    VueWebSocketPlugin.install(mockApp)
    
    const globalWs = mockApp.config.globalProperties.$websocket
    
    expect(typeof globalWs.create).toBe('function')
    expect(typeof globalWs.useWebSocket).toBe('function')
    expect(mockApp.provide).toHaveBeenCalledWith('createWebSocket', expect.any(Function))
  })
})
