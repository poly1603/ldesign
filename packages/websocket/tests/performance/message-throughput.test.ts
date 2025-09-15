/**
 * 消息吞吐量性能测试
 * 测试WebSocket消息发送和接收的性能指标
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { WebSocketClient } from '../../src/core/websocket-client'
import { performance } from 'perf_hooks'

// 吞吐量测试配置
const THROUGHPUT_CONFIG = {
  /** 小消息大小（字节） */
  SMALL_MESSAGE_SIZE: 100,
  /** 中等消息大小（字节） */
  MEDIUM_MESSAGE_SIZE: 1024,
  /** 大消息大小（字节） */
  LARGE_MESSAGE_SIZE: 10240,
  /** 测试消息数量 */
  MESSAGE_COUNT: 100,
  /** 批量消息数量 */
  BATCH_MESSAGE_COUNT: 1000,
  /** 并发发送数量 */
  CONCURRENT_SEND_COUNT: 10,
  /** 最小吞吐量要求（消息/秒） */
  MIN_THROUGHPUT_THRESHOLD: 100,
  /** 最大延迟要求（毫秒） */
  MAX_LATENCY_THRESHOLD: 100
}

/**
 * 吞吐量指标接口
 */
interface ThroughputMetrics {
  /** 总消息数 */
  totalMessages: number
  /** 成功发送数 */
  successfulSends: number
  /** 成功接收数 */
  successfulReceives: number
  /** 总耗时（毫秒） */
  totalTime: number
  /** 发送吞吐量（消息/秒） */
  sendThroughput: number
  /** 接收吞吐量（消息/秒） */
  receiveThroughput: number
  /** 平均发送延迟（毫秒） */
  averageSendLatency: number
  /** 平均接收延迟（毫秒） */
  averageReceiveLatency: number
  /** 最小延迟（毫秒） */
  minLatency: number
  /** 最大延迟（毫秒） */
  maxLatency: number
  /** 数据传输量（字节） */
  totalBytes: number
  /** 数据传输速率（字节/秒） */
  dataRate: number
}

/**
 * 吞吐量测试工具类
 */
class ThroughputTester {
  private startTime: number = 0
  private endTime: number = 0
  private sendTimes: number[] = []
  private receiveTimes: number[] = []
  private sendLatencies: number[] = []
  private receiveLatencies: number[] = []
  private totalBytes: number = 0
  private successfulSends: number = 0
  private successfulReceives: number = 0

  /**
   * 开始测试
   */
  start(): void {
    this.startTime = performance.now()
    this.sendTimes = []
    this.receiveTimes = []
    this.sendLatencies = []
    this.receiveLatencies = []
    this.totalBytes = 0
    this.successfulSends = 0
    this.successfulReceives = 0
  }

  /**
   * 记录发送操作
   * @param latency 发送延迟
   * @param bytes 消息字节数
   * @param success 是否成功
   */
  recordSend(latency: number, bytes: number, success: boolean = true): void {
    if (success) {
      this.successfulSends++
      this.sendTimes.push(performance.now())
      this.sendLatencies.push(latency)
      this.totalBytes += bytes
    }
  }

  /**
   * 记录接收操作
   * @param latency 接收延迟
   * @param success 是否成功
   */
  recordReceive(latency: number, success: boolean = true): void {
    if (success) {
      this.successfulReceives++
      this.receiveTimes.push(performance.now())
      this.receiveLatencies.push(latency)
    }
  }

  /**
   * 结束测试并计算指标
   */
  end(): ThroughputMetrics {
    this.endTime = performance.now()
    const totalTime = this.endTime - this.startTime

    const sendThroughput = this.successfulSends / (totalTime / 1000)
    const receiveThroughput = this.successfulReceives / (totalTime / 1000)

    const averageSendLatency = this.sendLatencies.length > 0
      ? this.sendLatencies.reduce((sum, lat) => sum + lat, 0) / this.sendLatencies.length
      : 0

    const averageReceiveLatency = this.receiveLatencies.length > 0
      ? this.receiveLatencies.reduce((sum, lat) => sum + lat, 0) / this.receiveLatencies.length
      : 0

    const allLatencies = [...this.sendLatencies, ...this.receiveLatencies]
    const minLatency = allLatencies.length > 0 ? Math.min(...allLatencies) : 0
    const maxLatency = allLatencies.length > 0 ? Math.max(...allLatencies) : 0

    const dataRate = this.totalBytes / (totalTime / 1000)

    return {
      totalMessages: this.successfulSends + this.successfulReceives,
      successfulSends: this.successfulSends,
      successfulReceives: this.successfulReceives,
      totalTime,
      sendThroughput,
      receiveThroughput,
      averageSendLatency,
      averageReceiveLatency,
      minLatency,
      maxLatency,
      totalBytes: this.totalBytes,
      dataRate
    }
  }

  /**
   * 重置测试数据
   */
  reset(): void {
    this.startTime = 0
    this.endTime = 0
    this.sendTimes = []
    this.receiveTimes = []
    this.sendLatencies = []
    this.receiveLatencies = []
    this.totalBytes = 0
    this.successfulSends = 0
    this.successfulReceives = 0
  }
}

/**
 * 生成测试消息
 * @param size 消息大小（字节）
 * @returns 测试消息
 */
function generateTestMessage(size: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < size; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 计算字符串字节大小
 * @param str 字符串
 * @returns 字节大小
 */
function getByteSize(str: string): number {
  return new Blob([str]).size
}

describe('消息吞吐量性能测试', () => {
  let tester: ThroughputTester

  beforeEach(() => {
    tester = new ThroughputTester()

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
        // 模拟发送延迟
        setTimeout(() => {
          if (this.onmessage) {
            // 模拟回显消息
            this.onmessage(new MessageEvent('message', { data }))
          }
        }, 1)
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
    tester.reset()
  })

  describe('小消息吞吐量测试', () => {
    it('应该能够高效处理小消息', async () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8080',
        autoConnect: false
      })

      await client.connect()

      const testMessage = generateTestMessage(THROUGHPUT_CONFIG.SMALL_MESSAGE_SIZE)
      const messageBytes = getByteSize(testMessage)
      let receivedCount = 0

      // 设置消息接收监听器
      client.on('message', () => {
        const receiveTime = performance.now()
        tester.recordReceive(receiveTime - sendTime)
        receivedCount++
      })

      tester.start()
      let sendTime: number

      // 发送消息
      for (let i = 0; i < THROUGHPUT_CONFIG.MESSAGE_COUNT; i++) {
        sendTime = performance.now()

        try {
          await client.send(testMessage)
          const sendLatency = performance.now() - sendTime
          tester.recordSend(sendLatency, messageBytes, true)
        } catch (error) {
          tester.recordSend(0, 0, false)
        }
      }

      // 等待所有消息接收完成
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (receivedCount >= THROUGHPUT_CONFIG.MESSAGE_COUNT) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 10)
      })

      const metrics = tester.end()

      expect(metrics.successfulSends).toBe(THROUGHPUT_CONFIG.MESSAGE_COUNT)
      expect(metrics.successfulReceives).toBe(THROUGHPUT_CONFIG.MESSAGE_COUNT)
      expect(metrics.sendThroughput).toBeGreaterThan(THROUGHPUT_CONFIG.MIN_THROUGHPUT_THRESHOLD)
      expect(metrics.averageSendLatency).toBeLessThan(THROUGHPUT_CONFIG.MAX_LATENCY_THRESHOLD)

      console.log(`小消息吞吐量测试结果:`)
      console.log(`- 消息大小: ${THROUGHPUT_CONFIG.SMALL_MESSAGE_SIZE} 字节`)
      console.log(`- 消息数量: ${THROUGHPUT_CONFIG.MESSAGE_COUNT}`)
      console.log(`- 发送吞吐量: ${metrics.sendThroughput.toFixed(2)} 消息/秒`)
      console.log(`- 接收吞吐量: ${metrics.receiveThroughput.toFixed(2)} 消息/秒`)
      console.log(`- 平均发送延迟: ${metrics.averageSendLatency.toFixed(2)}ms`)
      console.log(`- 平均接收延迟: ${metrics.averageReceiveLatency.toFixed(2)}ms`)
      console.log(`- 数据传输速率: ${(metrics.dataRate / 1024).toFixed(2)} KB/s`)

      client.destroy()
    })
  })

  describe('中等消息吞吐量测试', () => {
    it('应该能够处理中等大小消息', async () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8080',
        autoConnect: false
      })

      await client.connect()

      const testMessage = generateTestMessage(THROUGHPUT_CONFIG.MEDIUM_MESSAGE_SIZE)
      const messageBytes = getByteSize(testMessage)
      let receivedCount = 0

      client.on('message', () => {
        const receiveTime = performance.now()
        tester.recordReceive(receiveTime - sendTime)
        receivedCount++
      })

      tester.start()
      let sendTime: number

      const messageCount = Math.floor(THROUGHPUT_CONFIG.MESSAGE_COUNT / 2) // 减少消息数量以适应较大消息

      for (let i = 0; i < messageCount; i++) {
        sendTime = performance.now()

        try {
          await client.send(testMessage)
          const sendLatency = performance.now() - sendTime
          tester.recordSend(sendLatency, messageBytes, true)
        } catch (error) {
          tester.recordSend(0, 0, false)
        }
      }

      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (receivedCount >= messageCount) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 10)
      })

      const metrics = tester.end()

      expect(metrics.successfulSends).toBe(messageCount)
      expect(metrics.successfulReceives).toBe(messageCount)

      console.log(`中等消息吞吐量测试结果:`)
      console.log(`- 消息大小: ${THROUGHPUT_CONFIG.MEDIUM_MESSAGE_SIZE} 字节`)
      console.log(`- 消息数量: ${messageCount}`)
      console.log(`- 发送吞吐量: ${metrics.sendThroughput.toFixed(2)} 消息/秒`)
      console.log(`- 接收吞吐量: ${metrics.receiveThroughput.toFixed(2)} 消息/秒`)
      console.log(`- 平均发送延迟: ${metrics.averageSendLatency.toFixed(2)}ms`)
      console.log(`- 数据传输速率: ${(metrics.dataRate / 1024).toFixed(2)} KB/s`)

      client.destroy()
    })
  })

  describe('大消息吞吐量测试', () => {
    it('应该能够处理大消息', async () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8080',
        autoConnect: false
      })

      await client.connect()

      const testMessage = generateTestMessage(THROUGHPUT_CONFIG.LARGE_MESSAGE_SIZE)
      const messageBytes = getByteSize(testMessage)
      let receivedCount = 0

      client.on('message', () => {
        const receiveTime = performance.now()
        tester.recordReceive(receiveTime - sendTime)
        receivedCount++
      })

      tester.start()
      let sendTime: number

      const messageCount = Math.floor(THROUGHPUT_CONFIG.MESSAGE_COUNT / 10) // 进一步减少消息数量

      for (let i = 0; i < messageCount; i++) {
        sendTime = performance.now()

        try {
          await client.send(testMessage)
          const sendLatency = performance.now() - sendTime
          tester.recordSend(sendLatency, messageBytes, true)
        } catch (error) {
          tester.recordSend(0, 0, false)
        }
      }

      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (receivedCount >= messageCount) {
            clearInterval(checkInterval)
            resolve()
          }
        }, 10)
      })

      const metrics = tester.end()

      expect(metrics.successfulSends).toBe(messageCount)
      expect(metrics.successfulReceives).toBe(messageCount)

      console.log(`大消息吞吐量测试结果:`)
      console.log(`- 消息大小: ${THROUGHPUT_CONFIG.LARGE_MESSAGE_SIZE} 字节`)
      console.log(`- 消息数量: ${messageCount}`)
      console.log(`- 发送吞吐量: ${metrics.sendThroughput.toFixed(2)} 消息/秒`)
      console.log(`- 接收吞吐量: ${metrics.receiveThroughput.toFixed(2)} 消息/秒`)
      console.log(`- 平均发送延迟: ${metrics.averageSendLatency.toFixed(2)}ms`)
      console.log(`- 数据传输速率: ${(metrics.dataRate / 1024 / 1024).toFixed(2)} MB/s`)

      client.destroy()
    })
  })

  describe('并发发送性能测试', () => {
    it('应该能够处理并发消息发送', async () => {
      const client = new WebSocketClient({
        url: 'ws://localhost:8080',
        autoConnect: false
      })

      await client.connect()

      const testMessage = generateTestMessage(THROUGHPUT_CONFIG.SMALL_MESSAGE_SIZE)
      const messageBytes = getByteSize(testMessage)

      tester.start()

      // 并发发送消息
      const concurrentPromises = Array.from({ length: THROUGHPUT_CONFIG.CONCURRENT_SEND_COUNT }, async (_, index) => {
        const sendTime = performance.now()

        try {
          await client.send(`${testMessage}_${index}`)
          const sendLatency = performance.now() - sendTime
          tester.recordSend(sendLatency, messageBytes, true)
          return sendLatency
        } catch (error) {
          tester.recordSend(0, 0, false)
          throw error
        }
      })

      const results = await Promise.all(concurrentPromises)
      const metrics = tester.end()

      expect(metrics.successfulSends).toBe(THROUGHPUT_CONFIG.CONCURRENT_SEND_COUNT)
      expect(results.every(latency => latency < THROUGHPUT_CONFIG.MAX_LATENCY_THRESHOLD)).toBe(true)

      console.log(`并发发送性能测试结果:`)
      console.log(`- 并发数量: ${THROUGHPUT_CONFIG.CONCURRENT_SEND_COUNT}`)
      console.log(`- 成功发送数: ${metrics.successfulSends}`)
      console.log(`- 平均发送延迟: ${metrics.averageSendLatency.toFixed(2)}ms`)
      console.log(`- 最小延迟: ${metrics.minLatency.toFixed(2)}ms`)
      console.log(`- 最大延迟: ${metrics.maxLatency.toFixed(2)}ms`)
      console.log(`- 总耗时: ${metrics.totalTime.toFixed(2)}ms`)

      client.destroy()
    })
  })
})
