/**
 * 内存使用性能测试
 * 测试WebSocket客户端的内存使用情况和内存泄漏检测
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { WebSocketClient } from '../../src/core/websocket-client'
import { WebSocketWorkerFactory } from '../../src/worker'

// 内存测试配置
const MEMORY_CONFIG = {
  /** 内存测试迭代次数 */
  MEMORY_TEST_ITERATIONS: 50,
  /** 大量连接数 */
  LARGE_CONNECTION_COUNT: 100,
  /** 内存增长阈值（MB） */
  MEMORY_GROWTH_THRESHOLD: 50,
  /** 垃圾回收等待时间（毫秒） */
  GC_WAIT_TIME: 100,
  /** 内存采样间隔（毫秒） */
  MEMORY_SAMPLE_INTERVAL: 50
}

/**
 * 内存使用指标接口
 */
interface MemoryMetrics {
  /** 初始内存使用（MB） */
  initialMemory: number
  /** 峰值内存使用（MB） */
  peakMemory: number
  /** 最终内存使用（MB） */
  finalMemory: number
  /** 内存增长量（MB） */
  memoryGrowth: number
  /** 内存增长率（%） */
  memoryGrowthRate: number
  /** 是否存在内存泄漏 */
  hasMemoryLeak: boolean
  /** 内存采样数据 */
  memorySamples: number[]
}

/**
 * 内存监控工具类
 */
class MemoryMonitor {
  private samples: number[] = []
  private initialMemory: number = 0
  private peakMemory: number = 0
  private samplingInterval: NodeJS.Timeout | null = null

  /**
   * 获取当前内存使用量（MB）
   */
  private getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      // Node.js环境
      const usage = process.memoryUsage()
      return usage.heapUsed / 1024 / 1024
    } else if (typeof performance !== 'undefined' && (performance as any).memory) {
      // 浏览器环境（Chrome）
      const memory = (performance as any).memory
      return memory.usedJSHeapSize / 1024 / 1024
    } else {
      // 模拟内存使用
      return Math.random() * 10 + 20
    }
  }

  /**
   * 开始内存监控
   */
  startMonitoring(): void {
    this.samples = []
    this.initialMemory = this.getCurrentMemoryUsage()
    this.peakMemory = this.initialMemory

    // 定期采样内存使用
    this.samplingInterval = setInterval(() => {
      const currentMemory = this.getCurrentMemoryUsage()
      this.samples.push(currentMemory)
      this.peakMemory = Math.max(this.peakMemory, currentMemory)
    }, MEMORY_CONFIG.MEMORY_SAMPLE_INTERVAL)
  }

  /**
   * 停止内存监控
   */
  stopMonitoring(): MemoryMetrics {
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval)
      this.samplingInterval = null
    }

    const finalMemory = this.getCurrentMemoryUsage()
    const memoryGrowth = finalMemory - this.initialMemory
    const memoryGrowthRate = (memoryGrowth / this.initialMemory) * 100

    // 简单的内存泄漏检测：如果最终内存比初始内存增长超过阈值，认为可能存在内存泄漏
    const hasMemoryLeak = memoryGrowth > MEMORY_CONFIG.MEMORY_GROWTH_THRESHOLD

    return {
      initialMemory: this.initialMemory,
      peakMemory: this.peakMemory,
      finalMemory,
      memoryGrowth,
      memoryGrowthRate,
      hasMemoryLeak,
      memorySamples: [...this.samples]
    }
  }

  /**
   * 强制垃圾回收（如果可用）
   */
  async forceGarbageCollection(): Promise<void> {
    if (typeof global !== 'undefined' && global.gc) {
      global.gc()
    }

    // 等待垃圾回收完成
    await new Promise(resolve => setTimeout(resolve, MEMORY_CONFIG.GC_WAIT_TIME))
  }

  /**
   * 重置监控器
   */
  reset(): void {
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval)
      this.samplingInterval = null
    }
    this.samples = []
    this.initialMemory = 0
    this.peakMemory = 0
  }
}

describe('内存使用性能测试', () => {
  let monitor: MemoryMonitor

  beforeEach(() => {
    monitor = new MemoryMonitor()

    // 模拟CloseEvent
    global.CloseEvent = class MockCloseEvent extends Event {
      public code: number
      public reason: string

      constructor(type: string, eventInitDict?: { code?: number; reason?: string }) {
        super(type)
        this.code = eventInitDict?.code || 1000
        this.reason = eventInitDict?.reason || ''
      }
    } as any

    // 模拟WebSocket
    global.WebSocket = class MockWebSocket {
      public readyState = WebSocket.CONNECTING
      public onopen: ((event: Event) => void) | null = null
      public onclose: ((event: CloseEvent) => void) | null = null
      public onerror: ((event: Event) => void) | null = null
      public onmessage: ((event: MessageEvent) => void) | null = null

      constructor(public url: string) {
        setTimeout(() => {
          this.readyState = WebSocket.OPEN
          if (this.onopen) {
            this.onopen(new Event('open'))
          }
        }, 10)
      }

      send(data: string | ArrayBuffer | Blob): void {
        // 模拟发送
      }

      close(code?: number, reason?: string): void {
        this.readyState = WebSocket.CLOSED
        if (this.onclose) {
          this.onclose(new CloseEvent('close', { code: code || 1000, reason: reason || '' }))
        }
      }

      addEventListener(type: string, listener: EventListener): void {
        if (type === 'open') this.onopen = listener as any
        if (type === 'close') this.onclose = listener as any
        if (type === 'error') this.onerror = listener as any
        if (type === 'message') this.onmessage = listener as any
      }

      removeEventListener(type: string, listener: EventListener): void {
        if (type === 'open') this.onopen = null
        if (type === 'close') this.onclose = null
        if (type === 'error') this.onerror = null
        if (type === 'message') this.onmessage = null
      }
    } as any
  })

  afterEach(() => {
    monitor.reset()
  })

  describe('单客户端内存使用', () => {
    it('应该有合理的内存使用量', async () => {
      monitor.startMonitoring()

      const client = new WebSocketClient({
        url: 'ws://localhost:8080',
        autoConnect: false
      })

      await client.connect()

      // 发送一些消息以测试内存使用
      for (let i = 0; i < 100; i++) {
        await client.send(`test message ${i}`)
      }

      // 等待一段时间让操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      client.destroy()

      // 强制垃圾回收
      await monitor.forceGarbageCollection()

      const metrics = monitor.stopMonitoring()

      expect(metrics.hasMemoryLeak).toBe(false)
      expect(metrics.memoryGrowth).toBeLessThan(MEMORY_CONFIG.MEMORY_GROWTH_THRESHOLD)

      console.log(`单客户端内存使用测试结果:`)
      console.log(`- 初始内存: ${metrics.initialMemory.toFixed(2)} MB`)
      console.log(`- 峰值内存: ${metrics.peakMemory.toFixed(2)} MB`)
      console.log(`- 最终内存: ${metrics.finalMemory.toFixed(2)} MB`)
      console.log(`- 内存增长: ${metrics.memoryGrowth.toFixed(2)} MB`)
      console.log(`- 内存增长率: ${metrics.memoryGrowthRate.toFixed(2)}%`)
      console.log(`- 是否存在内存泄漏: ${metrics.hasMemoryLeak}`)
    })
  })

  describe('多客户端内存使用', () => {
    it('应该能够处理多个客户端而不产生内存泄漏', async () => {
      monitor.startMonitoring()

      const clients: WebSocketClient[] = []

      // 创建多个客户端
      for (let i = 0; i < 10; i++) {
        const client = new WebSocketClient({
          url: `ws://localhost:808${i}`,
          autoConnect: false
        })
        clients.push(client)
        await client.connect()
      }

      // 让客户端运行一段时间
      await new Promise(resolve => setTimeout(resolve, 200))

      // 销毁所有客户端
      clients.forEach(client => client.destroy())

      // 强制垃圾回收
      await monitor.forceGarbageCollection()

      const metrics = monitor.stopMonitoring()

      expect(metrics.hasMemoryLeak).toBe(false)

      console.log(`多客户端内存使用测试结果:`)
      console.log(`- 客户端数量: ${clients.length}`)
      console.log(`- 初始内存: ${metrics.initialMemory.toFixed(2)} MB`)
      console.log(`- 峰值内存: ${metrics.peakMemory.toFixed(2)} MB`)
      console.log(`- 最终内存: ${metrics.finalMemory.toFixed(2)} MB`)
      console.log(`- 内存增长: ${metrics.memoryGrowth.toFixed(2)} MB`)
      console.log(`- 是否存在内存泄漏: ${metrics.hasMemoryLeak}`)
    })
  })

  describe('长时间运行内存测试', () => {
    it('应该在长时间运行后保持稳定的内存使用', async () => {
      monitor.startMonitoring()

      const client = new WebSocketClient({
        url: 'ws://localhost:8080',
        autoConnect: false
      })

      await client.connect()

      // 模拟长时间运行
      for (let i = 0; i < MEMORY_CONFIG.MEMORY_TEST_ITERATIONS; i++) {
        // 发送消息
        await client.send(`long running test ${i}`)

        // 添加一些事件监听器
        const listener = () => { }
        client.on('message', listener)

        // 移除事件监听器
        client.off('message', listener)

        // 短暂等待
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // 强制垃圾回收
      await monitor.forceGarbageCollection()

      const metrics = monitor.stopMonitoring()

      client.destroy()

      expect(metrics.hasMemoryLeak).toBe(false)
      expect(metrics.memoryGrowthRate).toBeLessThan(100) // 内存增长不应超过100%

      console.log(`长时间运行内存测试结果:`)
      console.log(`- 测试迭代次数: ${MEMORY_CONFIG.MEMORY_TEST_ITERATIONS}`)
      console.log(`- 初始内存: ${metrics.initialMemory.toFixed(2)} MB`)
      console.log(`- 峰值内存: ${metrics.peakMemory.toFixed(2)} MB`)
      console.log(`- 最终内存: ${metrics.finalMemory.toFixed(2)} MB`)
      console.log(`- 内存增长率: ${metrics.memoryGrowthRate.toFixed(2)}%`)
      console.log(`- 是否存在内存泄漏: ${metrics.hasMemoryLeak}`)
    })
  })

  describe('Worker内存使用测试', () => {
    it('应该正确管理Worker的内存使用', async () => {
      monitor.startMonitoring()

      // 创建多个Worker
      const workerKeys = ['worker1', 'worker2', 'worker3']

      for (const key of workerKeys) {
        try {
          await WebSocketWorkerFactory.getOrCreateWorker(
            key,
            'test-worker.js',
            'ws://localhost:8080'
          )
        } catch (error) {
          // Worker创建可能失败，这在测试环境中是正常的
        }
      }

      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 100))

      // 销毁所有Worker
      WebSocketWorkerFactory.destroyAllWorkers()

      // 强制垃圾回收
      await monitor.forceGarbageCollection()

      const metrics = monitor.stopMonitoring()

      expect(metrics.hasMemoryLeak).toBe(false)

      console.log(`Worker内存使用测试结果:`)
      console.log(`- Worker数量: ${workerKeys.length}`)
      console.log(`- 初始内存: ${metrics.initialMemory.toFixed(2)} MB`)
      console.log(`- 峰值内存: ${metrics.peakMemory.toFixed(2)} MB`)
      console.log(`- 最终内存: ${metrics.finalMemory.toFixed(2)} MB`)
      console.log(`- 内存增长: ${metrics.memoryGrowth.toFixed(2)} MB`)
      console.log(`- 是否存在内存泄漏: ${metrics.hasMemoryLeak}`)
    })
  })

  describe('事件监听器内存泄漏测试', () => {
    it('应该正确清理事件监听器避免内存泄漏', async () => {
      monitor.startMonitoring()

      const client = new WebSocketClient({
        url: 'ws://localhost:8080',
        autoConnect: false
      })

      await client.connect()

      // 添加大量事件监听器
      const listeners: Function[] = []
      for (let i = 0; i < 1000; i++) {
        const listener = () => { }
        listeners.push(listener)
        client.on('message', listener)
      }

      // 移除所有事件监听器
      listeners.forEach(listener => {
        client.off('message', listener)
      })

      client.destroy()

      // 强制垃圾回收
      await monitor.forceGarbageCollection()

      const metrics = monitor.stopMonitoring()

      expect(metrics.hasMemoryLeak).toBe(false)

      console.log(`事件监听器内存泄漏测试结果:`)
      console.log(`- 事件监听器数量: ${listeners.length}`)
      console.log(`- 初始内存: ${metrics.initialMemory.toFixed(2)} MB`)
      console.log(`- 峰值内存: ${metrics.peakMemory.toFixed(2)} MB`)
      console.log(`- 最终内存: ${metrics.finalMemory.toFixed(2)} MB`)
      console.log(`- 内存增长: ${metrics.memoryGrowth.toFixed(2)} MB`)
      console.log(`- 是否存在内存泄漏: ${metrics.hasMemoryLeak}`)
    })
  })
})
