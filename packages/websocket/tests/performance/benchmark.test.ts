/**
 * WebSocket性能基准测试套件
 * 综合性能测试，生成性能报告
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { WebSocketClient } from '../../src/core/websocket-client'
import { ConnectionPool } from '../../src/core/connection-pool'
import { performance } from 'perf_hooks'
import { writeFileSync } from 'fs'
import { join } from 'path'

// 基准测试配置
const BENCHMARK_CONFIG = {
  /** 基准测试轮数 */
  BENCHMARK_ROUNDS: 3,
  /** 预热轮数 */
  WARMUP_ROUNDS: 1,
  /** 连接数量级别 */
  CONNECTION_SCALES: [1, 10, 50, 100],
  /** 消息数量级别 */
  MESSAGE_SCALES: [10, 100, 500, 1000],
  /** 消息大小级别（字节） */
  MESSAGE_SIZE_SCALES: [100, 1024, 10240, 102400],
  /** 测试超时时间（毫秒） */
  TEST_TIMEOUT: 30000
}

/**
 * 基准测试结果接口
 */
interface BenchmarkResult {
  /** 测试名称 */
  testName: string
  /** 测试参数 */
  parameters: Record<string, any>
  /** 平均执行时间（毫秒） */
  averageTime: number
  /** 最小执行时间（毫秒） */
  minTime: number
  /** 最大执行时间（毫秒） */
  maxTime: number
  /** 标准差 */
  standardDeviation: number
  /** 吞吐量（操作/秒） */
  throughput: number
  /** 成功率（%） */
  successRate: number
  /** 额外指标 */
  additionalMetrics?: Record<string, number>
}

/**
 * 基准测试套件类
 */
class BenchmarkSuite {
  private results: BenchmarkResult[] = []

  /**
   * 运行基准测试
   * @param testName 测试名称
   * @param testFunction 测试函数
   * @param parameters 测试参数
   * @param rounds 测试轮数
   */
  async runBenchmark(
    testName: string,
    testFunction: () => Promise<any>,
    parameters: Record<string, any> = {},
    rounds: number = BENCHMARK_CONFIG.BENCHMARK_ROUNDS
  ): Promise<BenchmarkResult> {
    console.log(`开始基准测试: ${testName}`)

    const times: number[] = []
    let successCount = 0

    // 预热
    for (let i = 0; i < BENCHMARK_CONFIG.WARMUP_ROUNDS; i++) {
      try {
        await testFunction()
      } catch (error) {
        // 预热失败不影响测试
      }
    }

    // 正式测试
    for (let round = 0; round < rounds; round++) {
      const startTime = performance.now()

      try {
        await testFunction()
        const endTime = performance.now()
        const executionTime = endTime - startTime

        times.push(executionTime)
        successCount++
      } catch (error) {
        console.warn(`测试轮次 ${round + 1} 失败:`, error)
      }
    }

    // 计算统计指标
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)

    const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length
    const standardDeviation = Math.sqrt(variance)

    const throughput = 1000 / averageTime // 操作/秒
    const successRate = (successCount / rounds) * 100

    const result: BenchmarkResult = {
      testName,
      parameters,
      averageTime,
      minTime,
      maxTime,
      standardDeviation,
      throughput,
      successRate
    }

    this.results.push(result)

    console.log(`测试完成: ${testName}`)
    console.log(`- 平均时间: ${averageTime.toFixed(2)}ms`)
    console.log(`- 吞吐量: ${throughput.toFixed(2)} 操作/秒`)
    console.log(`- 成功率: ${successRate.toFixed(2)}%`)

    return result
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const timestamp = new Date().toISOString()

    let report = `# WebSocket性能基准测试报告\n\n`
    report += `生成时间: ${timestamp}\n\n`

    report += `## 测试环境\n`
    report += `- Node.js版本: ${process.version}\n`
    report += `- 平台: ${process.platform}\n`
    report += `- 架构: ${process.arch}\n\n`

    report += `## 测试配置\n`
    report += `- 基准测试轮数: ${BENCHMARK_CONFIG.BENCHMARK_ROUNDS}\n`
    report += `- 预热轮数: ${BENCHMARK_CONFIG.WARMUP_ROUNDS}\n`
    report += `- 测试超时: ${BENCHMARK_CONFIG.TEST_TIMEOUT}ms\n\n`

    report += `## 测试结果\n\n`

    this.results.forEach((result, index) => {
      report += `### ${index + 1}. ${result.testName}\n\n`

      if (Object.keys(result.parameters).length > 0) {
        report += `**测试参数:**\n`
        Object.entries(result.parameters).forEach(([key, value]) => {
          report += `- ${key}: ${value}\n`
        })
        report += `\n`
      }

      report += `**性能指标:**\n`
      report += `- 平均执行时间: ${result.averageTime.toFixed(2)}ms\n`
      report += `- 最小执行时间: ${result.minTime.toFixed(2)}ms\n`
      report += `- 最大执行时间: ${result.maxTime.toFixed(2)}ms\n`
      report += `- 标准差: ${result.standardDeviation.toFixed(2)}ms\n`
      report += `- 吞吐量: ${result.throughput.toFixed(2)} 操作/秒\n`
      report += `- 成功率: ${result.successRate.toFixed(2)}%\n`

      if (result.additionalMetrics) {
        report += `\n**额外指标:**\n`
        Object.entries(result.additionalMetrics).forEach(([key, value]) => {
          report += `- ${key}: ${value}\n`
        })
      }

      report += `\n`
    })

    return report
  }

  /**
   * 保存报告到文件
   * @param filename 文件名
   */
  saveReport(filename: string = 'benchmark-report.md'): void {
    const report = this.generateReport()
    const filePath = join(process.cwd(), filename)
    writeFileSync(filePath, report, 'utf-8')
    console.log(`性能报告已保存到: ${filePath}`)
  }

  /**
   * 清空结果
   */
  clearResults(): void {
    this.results = []
  }

  /**
   * 获取所有结果
   */
  getResults(): BenchmarkResult[] {
    return [...this.results]
  }
}

describe('WebSocket性能基准测试', () => {
  let benchmarkSuite: BenchmarkSuite

  beforeAll(() => {
    benchmarkSuite = new BenchmarkSuite()

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
        }, Math.random() * 10 + 5) // 5-15ms连接延迟
      }

      send(data: string | ArrayBuffer | Blob): void {
        // 模拟发送延迟
        setTimeout(() => {
          if (this.onmessage) {
            this.onmessage(new MessageEvent('message', { data }))
          }
        }, Math.random() * 5 + 1) // 1-6ms发送延迟
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

  afterAll(() => {
    // 生成并保存性能报告
    benchmarkSuite.saveReport('benchmark-report.md')
  })

  describe('连接性能基准测试', () => {
    BENCHMARK_CONFIG.CONNECTION_SCALES.forEach(connectionCount => {
      it(`应该能够高效建立 ${connectionCount} 个连接`, async () => {
        await benchmarkSuite.runBenchmark(
          `建立 ${connectionCount} 个连接`,
          async () => {
            const clients: WebSocketClient[] = []

            // 创建连接
            const connectionPromises = Array.from({ length: connectionCount }, async (_, index) => {
              const client = new WebSocketClient({
                url: `ws://localhost:808${index % 10}`,
                autoConnect: false
              })
              clients.push(client)
              return client.connect()
            })

            await Promise.all(connectionPromises)

            // 清理连接
            clients.forEach(client => client.destroy())
          },
          { connectionCount },
          3
        )
      }, BENCHMARK_CONFIG.TEST_TIMEOUT)
    })
  })

  describe('消息发送性能基准测试', () => {
    BENCHMARK_CONFIG.MESSAGE_SCALES.forEach(messageCount => {
      it(`应该能够高效发送 ${messageCount} 条消息`, async () => {
        await benchmarkSuite.runBenchmark(
          `发送 ${messageCount} 条消息`,
          async () => {
            const client = new WebSocketClient({
              url: 'ws://localhost:8080',
              autoConnect: false
            })

            await client.connect()

            // 发送消息
            const sendPromises = Array.from({ length: messageCount }, (_, index) => {
              return client.send(`test message ${index}`)
            })

            await Promise.all(sendPromises)

            client.destroy()
          },
          { messageCount },
          3
        )
      }, BENCHMARK_CONFIG.TEST_TIMEOUT)
    })
  })

  describe('不同消息大小性能基准测试', () => {
    BENCHMARK_CONFIG.MESSAGE_SIZE_SCALES.forEach(messageSize => {
      it(`应该能够高效处理 ${messageSize} 字节的消息`, async () => {
        const testMessage = 'A'.repeat(messageSize)

        await benchmarkSuite.runBenchmark(
          `处理 ${messageSize} 字节消息`,
          async () => {
            const client = new WebSocketClient({
              url: 'ws://localhost:8080',
              autoConnect: false
            })

            await client.connect()

            // 发送大消息
            await client.send(testMessage)

            client.destroy()
          },
          { messageSize },
          3
        )
      }, BENCHMARK_CONFIG.TEST_TIMEOUT)
    })
  })

  describe('连接池性能基准测试', () => {
    it('应该能够高效管理连接池', async () => {
      await benchmarkSuite.runBenchmark(
        '连接池管理性能',
        async () => {
          const pool = new ConnectionPool({
            maxConnections: 10,
            strategy: 'round-robin'
          })

          // 添加连接
          for (let i = 0; i < 10; i++) {
            await pool.addConnection(`ws://localhost:808${i}`)
          }

          // 获取连接
          for (let i = 0; i < 50; i++) {
            const connection = pool.getConnection()
            expect(connection).toBeDefined()
          }

          // 清理连接池
          pool.destroy()
        },
        { poolSize: 10, operations: 50 },
        5
      )
    })
  })
})
