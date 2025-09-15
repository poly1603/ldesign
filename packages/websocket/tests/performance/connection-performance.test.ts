/**
 * 连接性能测试
 * 测试WebSocket连接建立、断开的性能指标
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { WebSocketClient } from '../../src/core/websocket-client'
import { performance } from 'perf_hooks'

// 性能测试配置
const PERFORMANCE_CONFIG = {
  /** 连接超时阈值（毫秒） */
  CONNECTION_TIMEOUT_THRESHOLD: 5000,
  /** 断开连接超时阈值（毫秒） */
  DISCONNECTION_TIMEOUT_THRESHOLD: 1000,
  /** 批量连接数量 */
  BATCH_CONNECTION_COUNT: 10,
  /** 并发连接数量 */
  CONCURRENT_CONNECTION_COUNT: 5
}

/**
 * 性能指标接口
 */
interface PerformanceMetrics {
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime: number
  /** 持续时间（毫秒） */
  duration: number
  /** 成功次数 */
  successCount: number
  /** 失败次数 */
  failureCount: number
  /** 平均时间（毫秒） */
  averageTime: number
  /** 最小时间（毫秒） */
  minTime: number
  /** 最大时间（毫秒） */
  maxTime: number
}

/**
 * 性能测试工具类
 */
class PerformanceTester {
  private metrics: PerformanceMetrics = {
    startTime: 0,
    endTime: 0,
    duration: 0,
    successCount: 0,
    failureCount: 0,
    averageTime: 0,
    minTime: Infinity,
    maxTime: 0
  }

  private times: number[] = []

  /**
   * 开始测试
   */
  start(): void {
    this.metrics.startTime = performance.now()
    this.times = []
  }

  /**
   * 记录单次操作时间
   * @param time 操作时间
   * @param success 是否成功
   */
  record(time: number, success: boolean = true): void {
    this.times.push(time)

    if (success) {
      this.metrics.successCount++
    } else {
      this.metrics.failureCount++
    }

    this.metrics.minTime = Math.min(this.metrics.minTime, time)
    this.metrics.maxTime = Math.max(this.metrics.maxTime, time)
  }

  /**
   * 结束测试并计算指标
   */
  end(): PerformanceMetrics {
    this.metrics.endTime = performance.now()
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime

    if (this.times.length > 0) {
      this.metrics.averageTime = this.times.reduce((sum, time) => sum + time, 0) / this.times.length
    }

    if (this.metrics.minTime === Infinity) {
      this.metrics.minTime = 0
    }

    return { ...this.metrics }
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.metrics = {
      startTime: 0,
      endTime: 0,
      duration: 0,
      successCount: 0,
      failureCount: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: 0
    }
    this.times = []
  }
}

/**
 * 模拟WebSocket服务器
 */
class MockWebSocketServer {
  private connections = new Set<any>()
  private messageHandlers = new Map<string, Function>()

  /**
   * 模拟连接延迟
   * @param delay 延迟时间（毫秒）
   */
  setConnectionDelay(delay: number): void {
    this.messageHandlers.set('connectionDelay', () => {
      return new Promise(resolve => setTimeout(resolve, delay))
    })
  }

  /**
   * 模拟连接成功率
   * @param successRate 成功率（0-1）
   */
  setConnectionSuccessRate(successRate: number): void {
    this.messageHandlers.set('connectionSuccessRate', () => {
      return Math.random() < successRate
    })
  }

  /**
   * 获取连接数
   */
  getConnectionCount(): number {
    return this.connections.size
  }

  /**
   * 清理所有连接
   */
  cleanup(): void {
    this.connections.clear()
    this.messageHandlers.clear()
  }
}

describe('连接性能测试', () => {
  let server: MockWebSocketServer
  let tester: PerformanceTester

  beforeEach(() => {
    server = new MockWebSocketServer()
    tester = new PerformanceTester()

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
        // 模拟异步连接
        setTimeout(() => {
          this.readyState = WebSocket.OPEN
          if (this.onopen) {
            this.onopen(new Event('open'))
          }
        }, 10) // 10ms连接延迟
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
    server.cleanup()
    tester.reset()
  })

  describe('单连接性能', () => {
    it('应该在合理时间内建立连接', async () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8080',
        autoConnect: false
      })

      tester.start()
      const startTime = performance.now()

      await client.connect()

      const endTime = performance.now()
      const connectionTime = endTime - startTime

      tester.record(connectionTime)
      const metrics = tester.end()

      expect(connectionTime).toBeLessThan(PERFORMANCE_CONFIG.CONNECTION_TIMEOUT_THRESHOLD)
      expect(metrics.successCount).toBe(1)
      expect(metrics.failureCount).toBe(0)

      console.log(`连接建立时间: ${connectionTime.toFixed(2)}ms`)

      client.destroy()
    })

    it('应该在合理时间内断开连接', async () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8080',
        autoConnect: false
      })

      await client.connect()

      tester.start()
      const startTime = performance.now()

      client.disconnect()

      // 等待断开连接事件
      await new Promise<void>((resolve) => {
        client.on('close', () => {
          const endTime = performance.now()
          const disconnectionTime = endTime - startTime

          tester.record(disconnectionTime)
          resolve()
        })
      })

      const metrics = tester.end()

      expect(metrics.averageTime).toBeLessThan(PERFORMANCE_CONFIG.DISCONNECTION_TIMEOUT_THRESHOLD)
      expect(metrics.successCount).toBe(1)

      console.log(`连接断开时间: ${metrics.averageTime.toFixed(2)}ms`)

      client.destroy()
    })
  })

  describe('批量连接性能', () => {
    it('应该能够处理批量连接建立', async () => {
      const clients: WebSocketClient[] = []
      const connectionTimes: number[] = []

      tester.start()

      // 创建多个客户端
      for (let i = 0; i < PERFORMANCE_CONFIG.BATCH_CONNECTION_COUNT; i++) {
        const client = new WebSocketClient({
          url: `ws://localhost:808${i}`,
          autoConnect: false
        })
        clients.push(client)
      }

      // 批量连接
      const connectionPromises = clients.map(async (client, index) => {
        const startTime = performance.now()

        try {
          await client.connect()
          const endTime = performance.now()
          const connectionTime = endTime - startTime

          connectionTimes.push(connectionTime)
          tester.record(connectionTime, true)
        } catch (error) {
          tester.record(0, false)
        }
      })

      await Promise.all(connectionPromises)

      const metrics = tester.end()

      expect(metrics.successCount).toBe(PERFORMANCE_CONFIG.BATCH_CONNECTION_COUNT)
      expect(metrics.failureCount).toBe(0)
      expect(metrics.averageTime).toBeLessThan(PERFORMANCE_CONFIG.CONNECTION_TIMEOUT_THRESHOLD)

      console.log(`批量连接性能指标:`)
      console.log(`- 总连接数: ${PERFORMANCE_CONFIG.BATCH_CONNECTION_COUNT}`)
      console.log(`- 成功连接数: ${metrics.successCount}`)
      console.log(`- 平均连接时间: ${metrics.averageTime.toFixed(2)}ms`)
      console.log(`- 最小连接时间: ${metrics.minTime.toFixed(2)}ms`)
      console.log(`- 最大连接时间: ${metrics.maxTime.toFixed(2)}ms`)
      console.log(`- 总耗时: ${metrics.duration.toFixed(2)}ms`)

      // 清理资源
      clients.forEach(client => client.destroy())
    })

    it('应该能够处理并发连接', async () => {
      const clients: WebSocketClient[] = []

      tester.start()

      // 创建并发连接
      const concurrentPromises = Array.from({ length: PERFORMANCE_CONFIG.CONCURRENT_CONNECTION_COUNT }, async (_, index) => {
        const client = new WebSocketClient({
          url: `ws://localhost:909${index}`,
          autoConnect: false
        })
        clients.push(client)

        const startTime = performance.now()

        try {
          await client.connect()
          const endTime = performance.now()
          const connectionTime = endTime - startTime

          tester.record(connectionTime, true)
          return connectionTime
        } catch (error) {
          tester.record(0, false)
          throw error
        }
      })

      const results = await Promise.all(concurrentPromises)
      const metrics = tester.end()

      expect(metrics.successCount).toBe(PERFORMANCE_CONFIG.CONCURRENT_CONNECTION_COUNT)
      expect(metrics.failureCount).toBe(0)

      console.log(`并发连接性能指标:`)
      console.log(`- 并发连接数: ${PERFORMANCE_CONFIG.CONCURRENT_CONNECTION_COUNT}`)
      console.log(`- 成功连接数: ${metrics.successCount}`)
      console.log(`- 平均连接时间: ${metrics.averageTime.toFixed(2)}ms`)
      console.log(`- 总耗时: ${metrics.duration.toFixed(2)}ms`)

      // 清理资源
      clients.forEach(client => client.destroy())
    })
  })

  describe('连接稳定性测试', () => {
    it('应该能够处理频繁的连接和断开', async () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8080',
        autoConnect: false
      })

      const cycleCount = 5
      const connectionTimes: number[] = []
      const disconnectionTimes: number[] = []

      tester.start()

      for (let i = 0; i < cycleCount; i++) {
        // 连接
        const connectStartTime = performance.now()
        await client.connect()
        const connectEndTime = performance.now()
        const connectionTime = connectEndTime - connectStartTime
        connectionTimes.push(connectionTime)

        // 等待一小段时间
        await new Promise(resolve => setTimeout(resolve, 10))

        // 断开
        const disconnectStartTime = performance.now()
        client.disconnect()

        await new Promise<void>((resolve) => {
          client.on('close', () => {
            const disconnectEndTime = performance.now()
            const disconnectionTime = disconnectEndTime - disconnectStartTime
            disconnectionTimes.push(disconnectionTime)
            resolve()
          })
        })

        // 等待一小段时间
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      const metrics = tester.end()

      const avgConnectionTime = connectionTimes.reduce((sum, time) => sum + time, 0) / connectionTimes.length
      const avgDisconnectionTime = disconnectionTimes.reduce((sum, time) => sum + time, 0) / disconnectionTimes.length

      expect(avgConnectionTime).toBeLessThan(PERFORMANCE_CONFIG.CONNECTION_TIMEOUT_THRESHOLD)
      expect(avgDisconnectionTime).toBeLessThan(PERFORMANCE_CONFIG.DISCONNECTION_TIMEOUT_THRESHOLD)

      console.log(`连接稳定性测试结果:`)
      console.log(`- 测试周期数: ${cycleCount}`)
      console.log(`- 平均连接时间: ${avgConnectionTime.toFixed(2)}ms`)
      console.log(`- 平均断开时间: ${avgDisconnectionTime.toFixed(2)}ms`)
      console.log(`- 总测试时间: ${metrics.duration.toFixed(2)}ms`)

      client.destroy()
    })
  })
})
