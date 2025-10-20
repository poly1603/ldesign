/**
 * 性能基准测试和内存泄漏检测
 * 
 * 功能：
 * 1. 性能基准测试
 * 2. 内存泄漏检测
 * 3. 压力测试
 * 4. 性能对比分析
 */

import { HttpClientImpl } from '../client'
import { createAdapter } from '../adapters'
import { MemoryCacheStorage } from '../utils/cache'
import { BatchOptimizer } from '../utils/batch-optimizer'
import type { HttpClientConfig } from '../types'

/**
 * 性能测试配置
 */
interface BenchmarkConfig {
  /** 测试名称 */
  name: string
  /** 请求数量 */
  requests: number
  /** 并发数量 */
  concurrency: number
  /** 是否启用缓存 */
  cache?: boolean
  /** 是否启用批处理 */
  batching?: boolean
  /** 是否启用优先级队列 */
  priorityQueue?: boolean
}

/**
 * 性能测试结果
 */
interface BenchmarkResult {
  name: string
  totalRequests: number
  totalTime: number
  averageTime: number
  requestsPerSecond: number
  memoryUsage: MemoryUsage
  errors: number
  p50: number
  p95: number
  p99: number
}

/**
 * 内存使用情况
 */
interface MemoryUsage {
  initial: number
  peak: number
  final: number
  leaked: number
}

/**
 * 性能基准测试类
 */
export class PerformanceBenchmark {
  private results: BenchmarkResult[] = []
  
  /**
   * 运行基准测试
   */
  async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult> {
    console.log(`🚀 Running benchmark: ${config.name}`)
    
    // 记录初始内存
    const initialMemory = this.getMemoryUsage()
    let peakMemory = initialMemory
    
    // 创建客户端
    const clientConfig: HttpClientConfig = {
      baseURL: 'https://api.example.com',
      timeout: 30000,
      cache: {
        enabled: config.cache ?? false,
        storage: new MemoryCacheStorage(1000),
      },
      concurrency: {
        maxConcurrent: config.concurrency,
      },
      priorityQueue: {
        maxConcurrent: config.priorityQueue ? 6 : undefined,
      },
    }
    
    const adapter = createAdapter()
    const client = new HttpClientImpl(clientConfig, adapter)
    
    // 批处理优化器
    let batchOptimizer: BatchOptimizer | undefined
    if (config.batching) {
      batchOptimizer = new BatchOptimizer({
        enabled: true,
        maxBatchSize: 10,
        batchWindow: 50,
      })
    }
    
    // 性能数据收集
    const durations: number[] = []
    let errors = 0
    
    // 开始测试
    const startTime = Date.now()
    
    // 创建请求任务
    const tasks: Promise<void>[] = []
    for (let i = 0; i < config.requests; i++) {
      const task = this.executeRequest(client, batchOptimizer, i)
        .then(duration => {
          durations.push(duration)
          
          // 更新峰值内存
          const currentMemory = this.getMemoryUsage()
          if (currentMemory > peakMemory) {
            peakMemory = currentMemory
          }
        })
        .catch(() => {
          errors++
        })
      
      tasks.push(task)
      
      // 控制并发
      if (tasks.length >= config.concurrency) {
        await Promise.race(tasks)
        tasks.splice(tasks.findIndex(t => t), 1)
      }
    }
    
    // 等待所有请求完成
    await Promise.all(tasks)
    
    const totalTime = Date.now() - startTime
    
    // 记录最终内存
    const finalMemory = this.getMemoryUsage()
    
    // 清理资源
    client.destroy()
    if (batchOptimizer) {
      batchOptimizer.destroy()
    }
    
    // 强制垃圾回收（如果可用）
    this.forceGC()
    await this.sleep(100)
    
    // 检查内存泄漏
    const afterGCMemory = this.getMemoryUsage()
    const leaked = afterGCMemory - initialMemory
    
    // 计算统计数据
    durations.sort((a, b) => a - b)
    const result: BenchmarkResult = {
      name: config.name,
      totalRequests: config.requests,
      totalTime,
      averageTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      requestsPerSecond: (config.requests / totalTime) * 1000,
      memoryUsage: {
        initial: initialMemory,
        peak: peakMemory,
        final: finalMemory,
        leaked: Math.max(0, leaked),
      },
      errors,
      p50: this.getPercentile(durations, 50),
      p95: this.getPercentile(durations, 95),
      p99: this.getPercentile(durations, 99),
    }
    
    this.results.push(result)
    this.printResult(result)
    
    return result
  }
  
  /**
   * 执行单个请求
   */
  private async executeRequest(
    client: HttpClientImpl,
    batchOptimizer: BatchOptimizer | undefined,
    index: number
  ): Promise<number> {
    const startTime = Date.now()
    
    if (batchOptimizer) {
      await batchOptimizer.addRequest(
        {
          url: `/api/users/${index % 100}`,
          method: 'GET',
        },
        (config) => client.request(config)
      )
    } else {
      await client.get(`/api/users/${index % 100}`)
    }
    
    return Date.now() - startTime
  }
  
  /**
   * 运行内存泄漏测试
   */
  async runMemoryLeakTest(): Promise<void> {
    console.log('🔍 Running memory leak detection...')
    
    const iterations = 10
    const requestsPerIteration = 100
    const memoryHistory: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      // 创建和销毁客户端
      const adapter = createAdapter()
      const client = new HttpClientImpl({}, adapter)
      
      // 执行请求
      const promises: Promise<any>[] = []
      for (let j = 0; j < requestsPerIteration; j++) {
        promises.push(
          client.get(`/api/test/${j}`).catch(() => {})
        )
      }
      
      await Promise.all(promises)
      
      // 销毁客户端
      client.destroy()
      
      // 强制GC并记录内存
      this.forceGC()
      await this.sleep(100)
      
      const memory = this.getMemoryUsage()
      memoryHistory.push(memory)
      
      console.log(`  Iteration ${i + 1}: ${this.formatMemory(memory)}`)
    }
    
    // 分析内存增长
    const memoryGrowth = memoryHistory[memoryHistory.length - 1] - memoryHistory[0]
    const averageGrowth = memoryGrowth / iterations
    
    console.log('📊 Memory leak analysis:')
    console.log(`  Total growth: ${this.formatMemory(memoryGrowth)}`)
    console.log(`  Average growth per iteration: ${this.formatMemory(averageGrowth)}`)
    
    if (averageGrowth > 1024 * 1024) { // 1MB
      console.log('  ⚠️ WARNING: Potential memory leak detected!')
    } else {
      console.log('  ✅ No significant memory leak detected')
    }
  }
  
  /**
   * 运行压力测试
   */
  async runStressTest(): Promise<void> {
    console.log('💪 Running stress test...')
    
    const configs: BenchmarkConfig[] = [
      {
        name: 'Baseline',
        requests: 1000,
        concurrency: 10,
      },
      {
        name: 'With Cache',
        requests: 1000,
        concurrency: 10,
        cache: true,
      },
      {
        name: 'With Batching',
        requests: 1000,
        concurrency: 10,
        batching: true,
      },
      {
        name: 'With Priority Queue',
        requests: 1000,
        concurrency: 10,
        priorityQueue: true,
      },
      {
        name: 'Full Optimization',
        requests: 1000,
        concurrency: 10,
        cache: true,
        batching: true,
        priorityQueue: true,
      },
      {
        name: 'High Concurrency',
        requests: 1000,
        concurrency: 100,
      },
      {
        name: 'Very High Load',
        requests: 5000,
        concurrency: 50,
        cache: true,
        batching: true,
      },
    ]
    
    for (const config of configs) {
      await this.runBenchmark(config)
      await this.sleep(1000) // 冷却时间
    }
    
    this.printComparison()
  }
  
  /**
   * 打印结果
   */
  private printResult(result: BenchmarkResult): void {
    console.log(`
📈 Results for ${result.name}:
  ├─ Total Requests: ${result.totalRequests}
  ├─ Total Time: ${result.totalTime}ms
  ├─ Average Time: ${result.averageTime.toFixed(2)}ms
  ├─ Requests/Second: ${result.requestsPerSecond.toFixed(2)}
  ├─ Errors: ${result.errors}
  ├─ P50: ${result.p50.toFixed(2)}ms
  ├─ P95: ${result.p95.toFixed(2)}ms
  ├─ P99: ${result.p99.toFixed(2)}ms
  └─ Memory:
      ├─ Initial: ${this.formatMemory(result.memoryUsage.initial)}
      ├─ Peak: ${this.formatMemory(result.memoryUsage.peak)}
      ├─ Final: ${this.formatMemory(result.memoryUsage.final)}
      └─ Leaked: ${this.formatMemory(result.memoryUsage.leaked)}
`)
  }
  
  /**
   * 打印性能对比
   */
  private printComparison(): void {
    if (this.results.length === 0) return
    
    console.log('\n📊 Performance Comparison:')
    console.log('═'.repeat(80))
    
    // 找出基准测试
    const baseline = this.results.find(r => r.name === 'Baseline') || this.results[0]
    
    // 打印表头
    console.log(
      '| Test Name'.padEnd(25) + 
      '| RPS'.padEnd(12) +
      '| Avg Time'.padEnd(12) +
      '| P99'.padEnd(10) +
      '| Memory'.padEnd(12) +
      '| vs Baseline |'
    )
    console.log('─'.repeat(80))
    
    // 打印每个结果
    for (const result of this.results) {
      const improvement = ((result.requestsPerSecond / baseline.requestsPerSecond) - 1) * 100
      const improvementStr = improvement >= 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`
      
      console.log(
        `| ${result.name.padEnd(23)} ` +
        `| ${result.requestsPerSecond.toFixed(1).padEnd(10)} ` +
        `| ${result.averageTime.toFixed(1).padEnd(10)} ` +
        `| ${result.p99.toFixed(1).padEnd(8)} ` +
        `| ${this.formatMemory(result.memoryUsage.peak).padEnd(10)} ` +
        `| ${improvementStr.padEnd(11)} |`
      )
    }
    
    console.log('═'.repeat(80))
  }
  
  /**
   * 获取内存使用量（字节）
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }
    
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize
    }
    
    return 0
  }
  
  /**
   * 格式化内存大小
   */
  private formatMemory(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }
  
  /**
   * 强制垃圾回收
   */
  private forceGC(): void {
    if (typeof global !== 'undefined' && (global as any).gc) {
      try {
        (global as any).gc()
      } catch {
        // 忽略错误
      }
    }
  }
  
  /**
   * 获取百分位数
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
    return sortedArray[Math.max(0, index)]
  }
  
  /**
   * 睡眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 运行所有性能测试
 */
export async function runAllBenchmarks(): Promise<void> {
  const benchmark = new PerformanceBenchmark()
  
  console.log('🎯 Starting HTTP Client Performance Benchmarks\n')
  
  // 1. 内存泄漏测试
  await benchmark.runMemoryLeakTest()
  console.log('\n')
  
  // 2. 压力测试
  await benchmark.runStressTest()
  
  console.log('\n✅ All benchmarks completed!')
}

// 如果直接运行此文件
if (require.main === module) {
  runAllBenchmarks().catch(console.error)
}