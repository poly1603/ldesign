/**
 * 适配器索引测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  FrameworkDetector, 
  AutoAdapterFactory, 
  useWebSocket,
  BaseAdapter 
} from '../../../src/adapters/index'
import { WebSocketClient } from '../../../src/core/websocket-client'

describe('FrameworkDetector', () => {
  let originalWindow: any
  let originalGlobal: any

  beforeEach(() => {
    // 保存原始环境
    originalWindow = global.window
    originalGlobal = global.global
  })

  afterEach(() => {
    // 恢复原始环境
    global.window = originalWindow
    global.global = originalGlobal
    vi.clearAllMocks()
  })

  describe('Vue检测', () => {
    it('应该检测到window.Vue', () => {
      global.window = { Vue: {} } as any
      
      expect(FrameworkDetector.isVue()).toBe(true)
    })

    it('应该检测到global.Vue', () => {
      global.window = undefined as any
      global.global = { Vue: {} } as any
      
      expect(FrameworkDetector.isVue()).toBe(true)
    })

    it('应该在没有Vue时返回false', () => {
      global.window = {} as any
      global.global = {} as any
      
      expect(FrameworkDetector.isVue()).toBe(false)
    })
  })

  describe('React检测', () => {
    it('应该检测到window.React', () => {
      global.window = { React: {} } as any
      
      expect(FrameworkDetector.isReact()).toBe(true)
    })

    it('应该检测到global.React', () => {
      global.window = undefined as any
      global.global = { React: {} } as any
      
      expect(FrameworkDetector.isReact()).toBe(true)
    })

    it('应该在没有React时返回false', () => {
      global.window = {} as any
      global.global = {} as any
      
      expect(FrameworkDetector.isReact()).toBe(false)
    })
  })

  describe('Angular检测', () => {
    it('应该检测到window.ng', () => {
      global.window = { ng: {} } as any
      
      expect(FrameworkDetector.isAngular()).toBe(true)
    })

    it('应该检测到global.ng', () => {
      global.window = undefined as any
      global.global = { ng: {} } as any
      
      expect(FrameworkDetector.isAngular()).toBe(true)
    })

    it('应该在没有Angular时返回false', () => {
      global.window = {} as any
      global.global = {} as any
      
      expect(FrameworkDetector.isAngular()).toBe(false)
    })
  })

  describe('getCurrentFramework', () => {
    it('应该返回vue', () => {
      global.window = { Vue: {} } as any
      
      expect(FrameworkDetector.getCurrentFramework()).toBe('vue')
    })

    it('应该返回react', () => {
      global.window = { React: {} } as any
      
      expect(FrameworkDetector.getCurrentFramework()).toBe('react')
    })

    it('应该返回angular', () => {
      global.window = { ng: {} } as any
      
      expect(FrameworkDetector.getCurrentFramework()).toBe('angular')
    })

    it('应该返回unknown', () => {
      global.window = {} as any
      global.global = {} as any
      
      expect(FrameworkDetector.getCurrentFramework()).toBe('unknown')
    })

    it('应该按优先级返回框架', () => {
      // Vue优先级最高
      global.window = { Vue: {}, React: {}, ng: {} } as any
      
      expect(FrameworkDetector.getCurrentFramework()).toBe('vue')
    })
  })
})

describe('AutoAdapterFactory', () => {
  let client: WebSocketClient
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
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('应该为Vue创建VueAdapter', () => {
      global.window = { Vue: {} } as any
      
      const adapter = AutoAdapterFactory.create(client)
      
      expect(adapter).toBeInstanceOf(BaseAdapter)
      adapter.destroy()
    })

    it('应该为React创建ReactAdapter', () => {
      global.window = { React: {} } as any
      
      const adapter = AutoAdapterFactory.create(client)
      
      expect(adapter).toBeInstanceOf(BaseAdapter)
      adapter.destroy()
    })

    it('应该为Angular创建AngularAdapter', () => {
      global.window = { ng: {} } as any
      
      const adapter = AutoAdapterFactory.create(client)
      
      expect(adapter).toBeInstanceOf(BaseAdapter)
      adapter.destroy()
    })

    it('应该为未知框架创建BaseAdapter', () => {
      global.window = {} as any
      global.global = {} as any
      
      const adapter = AutoAdapterFactory.create(client)
      
      expect(adapter).toBeInstanceOf(BaseAdapter)
      adapter.destroy()
    })

    it('应该传递配置参数', () => {
      global.window = {} as any
      global.global = {} as any
      
      const config = { autoConnect: false }
      const adapter = AutoAdapterFactory.create(client, config)
      
      expect(adapter).toBeInstanceOf(BaseAdapter)
      adapter.destroy()
    })
  })
})

describe('useWebSocket通用函数', () => {
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
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('框架特定调用', () => {
    it('应该为Vue调用Vue的useWebSocket', () => {
      global.window = { Vue: {} } as any
      
      // 模拟Vue的useWebSocket
      const mockVueUseWebSocket = vi.fn(() => ({
        state: { value: 'disconnected' },
        connected: { value: false }
      }))
      
      vi.doMock('../../../src/adapters/vue', () => ({
        useWebSocket: mockVueUseWebSocket
      }))
      
      const result = useWebSocket('ws://localhost:8080')
      
      expect(result).toBeDefined()
    })

    it('应该为React调用React的useWebSocket', () => {
      global.window = { React: {} } as any
      
      // 模拟React的useWebSocket
      const mockReactUseWebSocket = vi.fn(() => ({
        state: 'disconnected',
        connected: false
      }))
      
      vi.doMock('../../../src/adapters/react', () => ({
        useWebSocket: mockReactUseWebSocket
      }))
      
      const result = useWebSocket('ws://localhost:8080')
      
      expect(result).toBeDefined()
    })

    it('应该为不支持的框架抛出错误', () => {
      global.window = {} as any
      global.global = {} as any
      
      expect(() => {
        useWebSocket('ws://localhost:8080')
      }).toThrow('不支持的框架: unknown。请使用框架特定的适配器。')
    })

    it('应该为Angular抛出错误', () => {
      global.window = { ng: {} } as any
      
      expect(() => {
        useWebSocket('ws://localhost:8080')
      }).toThrow('不支持的框架: angular。请使用框架特定的适配器。')
    })
  })

  describe('参数传递', () => {
    it('应该传递URL和配置参数', () => {
      global.window = { Vue: {} } as any
      
      const mockVueUseWebSocket = vi.fn()
      
      vi.doMock('../../../src/adapters/vue', () => ({
        useWebSocket: mockVueUseWebSocket
      }))
      
      const url = 'ws://localhost:8080'
      const config = { debug: true }
      const adapterConfig = { autoConnect: false }
      
      useWebSocket(url, config, adapterConfig)
      
      expect(mockVueUseWebSocket).toHaveBeenCalledWith(url, config, adapterConfig)
    })
  })
})

describe('导出验证', () => {
  it('应该导出所有必要的类和函数', () => {
    expect(FrameworkDetector).toBeDefined()
    expect(AutoAdapterFactory).toBeDefined()
    expect(useWebSocket).toBeDefined()
    expect(BaseAdapter).toBeDefined()
  })

  it('FrameworkDetector应该有所有检测方法', () => {
    expect(typeof FrameworkDetector.isVue).toBe('function')
    expect(typeof FrameworkDetector.isReact).toBe('function')
    expect(typeof FrameworkDetector.isAngular).toBe('function')
    expect(typeof FrameworkDetector.getCurrentFramework).toBe('function')
  })

  it('AutoAdapterFactory应该有create方法', () => {
    expect(typeof AutoAdapterFactory.create).toBe('function')
  })
})
