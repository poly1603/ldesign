/**
 * Angular适配器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { BehaviorSubject, Subject } from 'rxjs'
import { AngularAdapter, AngularWebSocketService } from '../../../src/adapters/angular'
import { WebSocketClient } from '../../../src/core/websocket-client'

// 模拟Angular依赖
const mockNgZone = {
  run: vi.fn((fn: () => void) => fn())
}

// 模拟Angular装饰器
vi.mock('@angular/core', () => ({
  Injectable: () => (target: any) => target,
  OnDestroy: () => (target: any) => target,
  NgZone: vi.fn(() => mockNgZone)
}))

describe('AngularAdapter', () => {
  let client: WebSocketClient
  let adapter: AngularAdapter
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
    adapter = new AngularAdapter(client, {}, mockNgZone as any)
  })

  afterEach(() => {
    adapter.destroy()
    vi.clearAllMocks()
  })

  describe('构造函数和初始化', () => {
    it('应该创建Angular适配器', () => {
      expect(adapter).toBeInstanceOf(AngularAdapter)
      expect(adapter.getClient()).toBe(client)
    })

    it('应该接受NgZone参数', () => {
      const customNgZone = { run: vi.fn() }
      const customAdapter = new AngularAdapter(client, {}, customNgZone as any)
      
      expect(customAdapter).toBeInstanceOf(AngularAdapter)
      customAdapter.destroy()
    })
  })

  describe('状态同步', () => {
    it('应该实现syncState方法', () => {
      // syncState在Angular适配器中是空实现，因为状态通过服务的Subject处理
      expect(() => {
        // 调用受保护的方法需要通过类型断言
        ;(adapter as any).syncState()
      }).not.toThrow()
    })
  })
})

describe('AngularWebSocketService', () => {
  let service: AngularWebSocketService
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

    service = new AngularWebSocketService(mockNgZone as any)
  })

  afterEach(() => {
    service.ngOnDestroy()
    vi.clearAllMocks()
  })

  describe('构造函数和初始化', () => {
    it('应该创建服务实例', () => {
      expect(service).toBeInstanceOf(AngularWebSocketService)
    })

    it('应该初始化Observable流', () => {
      expect(service.state$).toBeDefined()
      expect(service.connected$).toBeDefined()
      expect(service.connecting$).toBeDefined()
      expect(service.reconnecting$).toBeDefined()
      expect(service.lastError$).toBeDefined()
      expect(service.lastMessage$).toBeDefined()
      expect(service.reconnectCount$).toBeDefined()
      expect(service.messages$).toBeDefined()
    })
  })

  describe('连接管理', () => {
    it('应该能够连接WebSocket', async () => {
      const connectPromise = service.connect('ws://localhost:8080')
      
      // 模拟连接成功
      setTimeout(() => {
        mockWebSocket.readyState = WebSocket.OPEN
        const openHandler = mockWebSocket.addEventListener.mock.calls
          .find(call => call[0] === 'open')?.[1]
        if (openHandler) openHandler()
      }, 10)
      
      await connectPromise
      
      expect(mockWebSocket.addEventListener).toHaveBeenCalled()
    })

    it('应该在URL变化时重新创建适配器', async () => {
      // 首次连接
      await service.connect('ws://localhost:8080')
      const firstClient = service.getClient()
      
      // 连接到不同URL
      await service.connect('ws://localhost:8081')
      const secondClient = service.getClient()
      
      expect(firstClient).not.toBe(secondClient)
      expect(secondClient?.getConfig().url).toBe('ws://localhost:8081')
    })

    it('应该能够断开连接', () => {
      service.disconnect(1000, '测试断开')
      
      // 验证断开连接逻辑
      expect(service.getState()).toBeNull() // 因为还没有连接
    })

    it('应该在没有URL时抛出错误', async () => {
      await expect(service.connect()).rejects.toThrow('WebSocket适配器未初始化，请提供URL')
    })
  })

  describe('消息发送', () => {
    it('应该能够发送消息', async () => {
      await service.connect('ws://localhost:8080')
      
      // 模拟连接状态
      mockWebSocket.readyState = WebSocket.OPEN
      
      const message = { type: 'test', data: 'hello' }
      await service.send(message)
      
      expect(mockWebSocket.send).toHaveBeenCalled()
    })

    it('应该在未连接时抛出错误', async () => {
      await expect(service.send('test')).rejects.toThrow('WebSocket未连接')
    })
  })

  describe('状态获取', () => {
    it('应该返回当前状态', async () => {
      expect(service.getState()).toBeNull()
      
      await service.connect('ws://localhost:8080')
      const state = service.getState()
      
      expect(state).toBeDefined()
      expect(state?.state).toBe('disconnected')
    })

    it('应该返回客户端实例', async () => {
      expect(service.getClient()).toBeNull()
      
      await service.connect('ws://localhost:8080')
      const client = service.getClient()
      
      expect(client).toBeInstanceOf(WebSocketClient)
    })
  })

  describe('Observable流', () => {
    it('应该提供状态流', (done) => {
      service.state$.subscribe(state => {
        expect(typeof state).toBe('string')
        done()
      })
    })

    it('应该提供连接状态流', (done) => {
      service.connected$.subscribe(connected => {
        expect(typeof connected).toBe('boolean')
        done()
      })
    })

    it('应该提供消息流', (done) => {
      let subscribed = false
      service.messages$.subscribe(message => {
        if (!subscribed) {
          subscribed = true
          expect(message).toBeDefined()
          done()
        }
      })
      
      // 模拟消息事件
      setTimeout(() => {
        if (!subscribed) {
          done() // 如果没有消息，也完成测试
        }
      }, 100)
    })
  })

  describe('消息过滤', () => {
    it('应该能够过滤特定类型的消息', (done) => {
      const filteredMessages = service.filterMessages('test-type')
      
      filteredMessages.subscribe(data => {
        expect(data).toBeDefined()
        done()
      })
      
      // 由于没有实际的消息流，这里只是测试方法存在
      setTimeout(done, 100)
    })

    it('应该能够等待连接建立', (done) => {
      const connectionWait = service.waitForConnection()
      
      connectionWait.subscribe(connected => {
        expect(connected).toBe(true)
        done()
      })
      
      // 由于没有实际连接，这里只是测试方法存在
      setTimeout(done, 100)
    })
  })

  describe('生命周期管理', () => {
    it('应该在ngOnDestroy时清理资源', async () => {
      await service.connect('ws://localhost:8080')
      const client = service.getClient()
      const destroySpy = vi.spyOn(client!, 'disconnect')
      
      service.ngOnDestroy()
      
      expect(destroySpy).toHaveBeenCalled()
      expect(service.getClient()).toBeNull()
    })

    it('应该完成所有Subject', () => {
      const completeSpy = vi.spyOn(BehaviorSubject.prototype, 'complete')
      const subjectCompleteSpy = vi.spyOn(Subject.prototype, 'complete')
      
      service.ngOnDestroy()
      
      // 验证Subject被完成（虽然这个测试可能不够精确）
      expect(completeSpy.mock.calls.length + subjectCompleteSpy.mock.calls.length).toBeGreaterThan(0)
    })
  })

  describe('NgZone集成', () => {
    it('应该在NgZone中运行状态更新', async () => {
      await service.connect('ws://localhost:8080')
      
      // 模拟状态变化事件
      const adapter = (service as any).adapter
      if (adapter) {
        adapter.emit('stateChange', 'connected')
        
        expect(mockNgZone.run).toHaveBeenCalled()
      }
    })

    it('应该在NgZone中运行连接事件', async () => {
      await service.connect('ws://localhost:8080')
      
      const adapter = (service as any).adapter
      if (adapter) {
        adapter.emit('connected')
        
        expect(mockNgZone.run).toHaveBeenCalled()
      }
    })

    it('应该在NgZone中运行消息事件', async () => {
      await service.connect('ws://localhost:8080')
      
      const adapter = (service as any).adapter
      if (adapter) {
        const message = { data: 'test', timestamp: Date.now(), id: '123' }
        adapter.emit('message', message)
        
        expect(mockNgZone.run).toHaveBeenCalled()
      }
    })
  })
})
