/**
 * Worker工厂和池测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  WebSocketWorkerFactory,
  WebSocketWorkerPool,
  createWebSocketWorker,
  createInlineWebSocketWorker,
  isWorkerSupported,
  isInWorker
} from '../../../src/worker'
import { WebSocketWorkerProxy } from '../../../src/adapters/worker'

// 模拟Worker（复用之前的MockWorker）
class MockWorker {
  public onmessage: ((event: MessageEvent) => void) | null = null
  public onerror: ((event: ErrorEvent) => void) | null = null
  private listeners = new Map<string, Set<Function>>()

  constructor(public scriptURL: string | URL) {}

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
    setTimeout(() => {
      this.simulateMessage({
        type: message.type,
        id: message.id
      })
    }, 0)
  }

  terminate(): void {
    this.listeners.clear()
  }

  simulateMessage(data: any): void {
    const listeners = this.listeners.get('message')
    if (listeners) {
      const event = { data } as MessageEvent
      listeners.forEach(listener => listener(event))
    }
  }
}

// 模拟全局对象
global.Worker = MockWorker as any
global.Blob = class MockBlob {
  constructor(public parts: any[], public options?: any) {}
} as any
global.URL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn()
} as any

describe('Worker工厂函数', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createWebSocketWorker', () => {
    it('应该创建WebSocket Worker代理', async () => {
      const proxy = await createWebSocketWorker('test-worker.js', 'ws://localhost:8080')
      
      expect(proxy).toBeInstanceOf(WebSocketWorkerProxy)
      
      proxy.destroy()
    })

    it('应该传递配置参数', async () => {
      const config = { timeout: 5000, maxReconnectAttempts: 3 }
      const proxy = await createWebSocketWorker('test-worker.js', 'ws://localhost:8080', config)
      
      expect(proxy).toBeInstanceOf(WebSocketWorkerProxy)
      
      proxy.destroy()
    })
  })

  describe('createInlineWebSocketWorker', () => {
    it('应该创建内联WebSocket Worker', async () => {
      const proxy = await createInlineWebSocketWorker('ws://localhost:8080')
      
      expect(proxy).toBeInstanceOf(WebSocketWorkerProxy)
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
      
      proxy.destroy()
    })

    it('应该传递配置参数', async () => {
      const config = { heartbeatInterval: 30000 }
      const proxy = await createInlineWebSocketWorker('ws://localhost:8080', config)
      
      expect(proxy).toBeInstanceOf(WebSocketWorkerProxy)
      
      proxy.destroy()
    })
  })

  describe('环境检测', () => {
    it('isWorkerSupported应该返回true', () => {
      expect(isWorkerSupported()).toBe(true)
    })

    it('isInWorker应该返回false（在主线程中）', () => {
      expect(isInWorker()).toBe(false)
    })

    it('isInWorker应该返回true（在Worker中）', () => {
      // 模拟Worker环境
      const originalSelf = globalThis.self
      const originalWindow = globalThis.window
      
      Object.defineProperty(globalThis, 'self', {
        value: { constructor: { name: 'DedicatedWorkerGlobalScope' } },
        configurable: true
      })
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        configurable: true
      })

      expect(isInWorker()).toBe(true)

      // 恢复原始环境
      Object.defineProperty(globalThis, 'self', {
        value: originalSelf,
        configurable: true
      })
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        configurable: true
      })
    })
  })
})

describe('WebSocketWorkerFactory', () => {
  afterEach(() => {
    WebSocketWorkerFactory.destroyAllWorkers()
    vi.clearAllMocks()
  })

  describe('Worker管理', () => {
    it('应该创建新的Worker', async () => {
      const worker = await WebSocketWorkerFactory.getOrCreateWorker(
        'test-key',
        'test-worker.js',
        'ws://localhost:8080'
      )

      expect(worker).toBeInstanceOf(WebSocketWorkerProxy)
      expect(WebSocketWorkerFactory.getWorkerCount()).toBe(1)
      expect(WebSocketWorkerFactory.hasWorker('test-key')).toBe(true)
    })

    it('应该复用已存在的Worker', async () => {
      const worker1 = await WebSocketWorkerFactory.getOrCreateWorker(
        'test-key',
        'test-worker.js',
        'ws://localhost:8080'
      )

      const worker2 = await WebSocketWorkerFactory.getOrCreateWorker(
        'test-key',
        'test-worker.js',
        'ws://localhost:8080'
      )

      expect(worker1).toBe(worker2)
      expect(WebSocketWorkerFactory.getWorkerCount()).toBe(1)
    })

    it('应该销毁指定的Worker', async () => {
      await WebSocketWorkerFactory.getOrCreateWorker(
        'test-key',
        'test-worker.js',
        'ws://localhost:8080'
      )

      expect(WebSocketWorkerFactory.hasWorker('test-key')).toBe(true)

      WebSocketWorkerFactory.destroyWorker('test-key')

      expect(WebSocketWorkerFactory.hasWorker('test-key')).toBe(false)
      expect(WebSocketWorkerFactory.getWorkerCount()).toBe(0)
    })

    it('应该销毁所有Worker', async () => {
      await WebSocketWorkerFactory.getOrCreateWorker(
        'worker1',
        'test-worker.js',
        'ws://localhost:8080'
      )
      await WebSocketWorkerFactory.getOrCreateWorker(
        'worker2',
        'test-worker.js',
        'ws://localhost:8081'
      )

      expect(WebSocketWorkerFactory.getWorkerCount()).toBe(2)

      WebSocketWorkerFactory.destroyAllWorkers()

      expect(WebSocketWorkerFactory.getWorkerCount()).toBe(0)
      expect(WebSocketWorkerFactory.getWorkerKeys()).toEqual([])
    })

    it('应该获取所有Worker键', async () => {
      await WebSocketWorkerFactory.getOrCreateWorker(
        'worker1',
        'test-worker.js',
        'ws://localhost:8080'
      )
      await WebSocketWorkerFactory.getOrCreateWorker(
        'worker2',
        'test-worker.js',
        'ws://localhost:8081'
      )

      const keys = WebSocketWorkerFactory.getWorkerKeys()
      expect(keys).toContain('worker1')
      expect(keys).toContain('worker2')
      expect(keys).toHaveLength(2)
    })
  })
})

describe('WebSocketWorkerPool', () => {
  let pool: WebSocketWorkerPool

  beforeEach(() => {
    pool = new WebSocketWorkerPool('test-worker.js', 3)
  })

  afterEach(() => {
    pool?.destroy()
    vi.clearAllMocks()
  })

  describe('Worker池管理', () => {
    it('应该创建新的Worker池', () => {
      expect(pool).toBeInstanceOf(WebSocketWorkerPool)
      expect(pool.getWorkerCount()).toBe(0)
    })

    it('应该获取Worker（首次创建）', async () => {
      const worker = await pool.getWorker('ws://localhost:8080')
      
      expect(worker).toBeInstanceOf(WebSocketWorkerProxy)
      expect(pool.getWorkerCount()).toBe(1)
    })

    it('应该使用轮询策略选择Worker', async () => {
      // 添加多个Worker
      await pool.addWorker('ws://localhost:8080')
      await pool.addWorker('ws://localhost:8081')
      await pool.addWorker('ws://localhost:8082')

      expect(pool.getWorkerCount()).toBe(3)

      // 获取Worker应该轮询选择
      const worker1 = await pool.getWorker('ws://localhost:8080')
      const worker2 = await pool.getWorker('ws://localhost:8080')
      const worker3 = await pool.getWorker('ws://localhost:8080')
      const worker4 = await pool.getWorker('ws://localhost:8080')

      // 第4个应该回到第1个Worker
      expect(worker4).toBe(worker1)
    })

    it('应该添加新的Worker', async () => {
      expect(pool.getWorkerCount()).toBe(0)

      await pool.addWorker('ws://localhost:8080')
      expect(pool.getWorkerCount()).toBe(1)

      await pool.addWorker('ws://localhost:8081')
      expect(pool.getWorkerCount()).toBe(2)
    })

    it('应该限制最大Worker数量', async () => {
      // 添加到最大数量
      await pool.addWorker('ws://localhost:8080')
      await pool.addWorker('ws://localhost:8081')
      await pool.addWorker('ws://localhost:8082')

      expect(pool.getWorkerCount()).toBe(3)

      // 尝试添加超过限制的Worker
      await expect(pool.addWorker('ws://localhost:8083')).rejects.toThrow(
        'Worker池已达到最大数量限制: 3'
      )
    })

    it('应该移除指定的Worker', async () => {
      await pool.addWorker('ws://localhost:8080')
      await pool.addWorker('ws://localhost:8081')

      expect(pool.getWorkerCount()).toBe(2)

      pool.removeWorker(0)
      expect(pool.getWorkerCount()).toBe(1)
    })

    it('应该处理无效的Worker索引', () => {
      expect(() => pool.removeWorker(-1)).not.toThrow()
      expect(() => pool.removeWorker(10)).not.toThrow()
    })

    it('应该销毁所有Worker', async () => {
      await pool.addWorker('ws://localhost:8080')
      await pool.addWorker('ws://localhost:8081')

      expect(pool.getWorkerCount()).toBe(2)

      pool.destroy()
      expect(pool.getWorkerCount()).toBe(0)
    })
  })
})
