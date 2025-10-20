/**
 * 性能基准测试套件
 * 
 * 提供全面的性能测试工具，用于验证优化效果
 */

import type { CacheManager } from '../core/cache-manager'
import type { SerializableValue } from '../types'

/**
 * 基准测试结果
 */
export interface BenchmarkResult {
  name: string
  operations: number
  duration: number
  opsPerSecond: number
  avgLatency: number
  minLatency: number
  maxLatency: number
  p50Latency: number
  p95Latency: number
  p99Latency: number
  memoryUsed?: number
}

/**
 * 基准测试配置
 */
export interface BenchmarkConfig {
  /** 测试名称 */
  name: string
  /** 操作次数 */
  operations?: number
  /** 预热次数 */
  warmup?: number
  /** 是否测量内存 */
  measureMemory?: boolean
  /** 测试数据生成器 */
  dataGenerator?: (index: number) => SerializableValue
}

/**
 * 性能基准测试器
 */
export class PerformanceBenchmark {
  private results: BenchmarkResult[] = []

  constructor(private cache: CacheManager) {}

  /**
   * 运行基准测试
   */
  async run(
    testFn: (cache: CacheManager, index: number) => Promise<void>,
    config: BenchmarkConfig,
  ): Promise<BenchmarkResult> {
    const {
      name,
      operations = 1000,
      warmup = 100,
      measureMemory = false,
    } = config

    // 预热阶段
    for (let i = 0; i < warmup; i++) {
      await testFn(this.cache, i)
    }

    // 清理缓存
    await this.cache.clear()

    // 测量内存（前）
    const memoryBefore = measureMemory ? this.getMemoryUsage() : 0

    // 执行测试
    const latencies: number[] = []
    const startTime = performance.now()

    for (let i = 0; i < operations; i++) {
      const opStart = performance.now()
      await testFn(this.cache, i)
      const opEnd = performance.now()
      latencies.push(opEnd - opStart)
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    // 测量内存（后）
    const memoryAfter = measureMemory ? this.getMemoryUsage() : 0
    const memoryUsed = memoryAfter - memoryBefore

    // 计算统计数据
    latencies.sort((a, b) => a - b)
    const result: BenchmarkResult = {
      name,
      operations,
      duration,
      opsPerSecond: (operations / duration) * 1000,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      minLatency: latencies[0] ?? 0,
      maxLatency: latencies[latencies.length - 1] ?? 0,
      p50Latency: latencies[Math.floor(latencies.length * 0.5)] ?? 0,
      p95Latency: latencies[Math.floor(latencies.length * 0.95)] ?? 0,
      p99Latency: latencies[Math.floor(latencies.length * 0.99)] ?? 0,
      memoryUsed: measureMemory ? memoryUsed : undefined,
    }

    this.results.push(result)
    return result
  }

  /**
   * 运行一组基准测试
   */
  async runSuite(tests: Array<{
    name: string
    fn: (cache: CacheManager, index: number) => Promise<void>
    config?: Partial<BenchmarkConfig>
  }>): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = []

    for (const test of tests) {
       
      
      const result = await this.run(test.fn, {
        name: test.name,
        ...test.config,
      })
      results.push(result)
      
      // 清理缓存
      await this.cache.clear()
      
      // 短暂延迟，让 GC 有机会运行
      await this.delay(100)
    }

    return results
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    if (this.results.length === 0) {
      return 'No benchmark results available'
    }

    const lines: string[] = [
      '='.repeat(100),
      '性能基准测试报告',
      '='.repeat(100),
      '',
    ]

    for (const result of this.results) {
      lines.push(`测试: ${result.name}`)
      lines.push(`  操作数: ${result.operations.toLocaleString()}`)
      lines.push(`  总耗时: ${result.duration.toFixed(2)} ms`)
      lines.push(`  吞吐量: ${result.opsPerSecond.toFixed(0)} ops/sec`)
      lines.push(`  平均延迟: ${result.avgLatency.toFixed(3)} ms`)
      lines.push(`  延迟范围: ${result.minLatency.toFixed(3)} - ${result.maxLatency.toFixed(3)} ms`)
      lines.push(`  P50 延迟: ${result.p50Latency.toFixed(3)} ms`)
      lines.push(`  P95 延迟: ${result.p95Latency.toFixed(3)} ms`)
      lines.push(`  P99 延迟: ${result.p99Latency.toFixed(3)} ms`)
      
      if (result.memoryUsed !== undefined) {
        lines.push(`  内存使用: ${this.formatBytes(result.memoryUsed)}`)
      }
      
      lines.push('')
    }

    lines.push('='.repeat(100))

    return lines.join('\n')
  }

  /**
   * 比较两个基准测试结果
   */
  compare(baseline: BenchmarkResult, current: BenchmarkResult): string {
    const lines: string[] = [
      `对比: ${baseline.name} vs ${current.name}`,
      '',
    ]

    const throughputChange = ((current.opsPerSecond - baseline.opsPerSecond) / baseline.opsPerSecond) * 100
    const latencyChange = ((current.avgLatency - baseline.avgLatency) / baseline.avgLatency) * 100

    lines.push(`  吞吐量变化: ${throughputChange > 0 ? '+' : ''}${throughputChange.toFixed(2)}%`)
    lines.push(`  延迟变化: ${latencyChange > 0 ? '+' : ''}${latencyChange.toFixed(2)}%`)

    if (typeof baseline.memoryUsed === 'number' && typeof current.memoryUsed === 'number') {
      const memoryChange = ((current.memoryUsed - baseline.memoryUsed) / baseline.memoryUsed) * 100
      lines.push(`  内存变化: ${memoryChange > 0 ? '+' : ''}${memoryChange.toFixed(2)}%`)
    }

    return lines.join('\n')
  }

  /**
   * 获取所有结果
   */
  getResults(): BenchmarkResult[] {
    return [...this.results]
  }

  /**
   * 清除结果
   */
  clearResults(): void {
    this.results = []
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): number {
    // 检查浏览器环境的内存 API
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const perfWithMemory = performance as unknown as { memory?: { usedJSHeapSize?: number } }
      return perfWithMemory.memory?.usedJSHeapSize ?? 0
    }
    
    // 检查 Node.js 环境
    // eslint-disable-next-line node/prefer-global/process
    if (typeof globalThis !== 'undefined' && (globalThis as any).process && typeof (globalThis as any).process.memoryUsage === 'function') {
      // eslint-disable-next-line node/prefer-global/process
      return (globalThis as any).process.memoryUsage().heapUsed
    }
    
    return 0
  }

  /**
   * 格式化字节大小
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 B'
    }
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
  }

  /**
   * 延迟
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 创建性能基准测试器
 */
export function createBenchmark(cache: CacheManager): PerformanceBenchmark {
  return new PerformanceBenchmark(cache)
}

/**
 * 预定义的基准测试套件
 */
export const standardBenchmarks = {
  /**
   * 基础操作测试
   */
  basicOperations: [
    {
      name: 'Set (小字符串)',
      fn: async (cache: CacheManager, index: number) => {
        await cache.set(`key-${index}`, `value-${index}`)
      },
    },
    {
      name: 'Get (存在的键)',
      fn: async (cache: CacheManager, index: number) => {
        // 预先设置
        if (index === 0) {
          for (let i = 0; i < 1000; i++) {
            await cache.set(`key-${i}`, `value-${i}`)
          }
        }
        await cache.get(`key-${index % 1000}`)
      },
    },
    {
      name: 'Get (不存在的键)',
      fn: async (cache: CacheManager, index: number) => {
        await cache.get(`nonexistent-${index}`)
      },
    },
    {
      name: 'Remove',
      fn: async (cache: CacheManager, index: number) => {
        // 预先设置
        await cache.set(`key-${index}`, `value-${index}`)
        await cache.remove(`key-${index}`)
      },
    },
  ],

  /**
   * 不同数据大小测试
   */
  dataSizes: [
    {
      name: 'Set (1KB 数据)',
      fn: async (cache: CacheManager, index: number) => {
        const data = 'x'.repeat(1024)
        await cache.set(`key-${index}`, data)
      },
    },
    {
      name: 'Set (10KB 数据)',
      fn: async (cache: CacheManager, index: number) => {
        const data = 'x'.repeat(10 * 1024)
        await cache.set(`key-${index}`, data)
      },
    },
    {
      name: 'Set (100KB 数据)',
      fn: async (cache: CacheManager, index: number) => {
        const data = 'x'.repeat(100 * 1024)
        await cache.set(`key-${index}`, data)
      },
      config: { operations: 100 }, // 减少操作次数
    },
  ],

  /**
   * 批量操作测试
   */
  batchOperations: [
    {
      name: 'Batch Set (10项)',
      fn: async (cache: CacheManager, index: number) => {
        const items = Array.from({ length: 10 }, (_, i) => ({
          key: `batch-${index}-${i}`,
          value: `value-${i}`,
        }))
        await cache.mset(items)
      },
      config: { operations: 100 },
    },
    {
      name: 'Batch Get (10项)',
      fn: async (cache: CacheManager, index: number) => {
        // 预先设置
        if (index === 0) {
          for (let i = 0; i < 100; i++) {
            for (let j = 0; j < 10; j++) {
              await cache.set(`batch-${i}-${j}`, `value-${j}`)
            }
          }
        }
        const keys = Array.from({ length: 10 }, (_, i) => `batch-${index}-${i}`)
        await cache.mget(keys)
      },
      config: { operations: 100 },
    },
  ],

  /**
   * TTL 测试
   */
  ttlOperations: [
    {
      name: 'Set (带 TTL)',
      fn: async (cache: CacheManager, index: number) => {
        await cache.set(`key-${index}`, `value-${index}`, { ttl: 60000 })
      },
    },
    {
      name: 'Get (过期检查)',
      fn: async (cache: CacheManager, index: number) => {
        // 预先设置带 TTL 的数据
        if (index === 0) {
          for (let i = 0; i < 1000; i++) {
            await cache.set(`key-${i}`, `value-${i}`, { ttl: 60000 })
          }
        }
        await cache.get(`key-${index % 1000}`)
      },
    },
  ],
}

/**
 * 运行标准基准测试
 */
export async function runStandardBenchmarks(cache: CacheManager): Promise<void> {
  const benchmark = createBenchmark(cache)

   
  console.info('开始运行标准基准测试...')

  // 运行所有测试
  await benchmark.runSuite(standardBenchmarks.basicOperations)
  await benchmark.runSuite(standardBenchmarks.dataSizes)
  await benchmark.runSuite(standardBenchmarks.batchOperations)
  await benchmark.runSuite(standardBenchmarks.ttlOperations)

  // 生成报告
   
  console.info('\n测试完成！生成报告...')
   
  console.info(benchmark.generateReport())
}
