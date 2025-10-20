/**
 * @ldesign/size - Performance Benchmark
 * 
 * 性能基准测试工具
 */

export interface BenchmarkResult {
  name: string
  iterations: number
  totalTime: number
  avgTime: number
  minTime: number
  maxTime: number
  opsPerSecond: number
  memory?: {
    before: number
    after: number
    delta: number
  }
}

export interface BenchmarkOptions {
  iterations?: number
  warmup?: number
  measureMemory?: boolean
}

/**
 * 性能基准测试类
 */
export class Benchmark {
  private results: BenchmarkResult[] = []
  
  /**
   * 运行单个基准测试
   */
  async run(
    name: string,
    fn: () => void | Promise<void>,
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult> {
    const {
      iterations = 1000,
      warmup = 100,
      measureMemory = false
    } = options
    
    // 预热
    for (let i = 0; i < warmup; i++) {
      await fn()
    }
    
    // 强制垃圾回收（如果可用）
    if (measureMemory && (globalThis as any).gc) {
      (globalThis as any).gc()
    }
    
    // 测量初始内存
    const memoryBefore = measureMemory ? this.getMemoryUsage() : 0
    
    // 运行测试
    const times: number[] = []
    const startTotal = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      await fn()
      times.push(performance.now() - start)
    }
    
    const totalTime = performance.now() - startTotal
    
    // 测量最终内存
    const memoryAfter = measureMemory ? this.getMemoryUsage() : 0
    
    // 计算统计
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    const minTime = Math.min(...times)
    const maxTime = Math.max(...times)
    const opsPerSecond = Math.round(1000 / avgTime)
    
    const result: BenchmarkResult = {
      name,
      iterations,
      totalTime,
      avgTime,
      minTime,
      maxTime,
      opsPerSecond
    }
    
    if (measureMemory) {
      result.memory = {
        before: memoryBefore,
        after: memoryAfter,
        delta: memoryAfter - memoryBefore
      }
    }
    
    this.results.push(result)
    return result
  }
  
  /**
   * 比较多个实现
   */
  async compare(
    benchmarks: Array<{
      name: string
      fn: () => void | Promise<void>
    }>,
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = []
    
    for (const { name, fn } of benchmarks) {
      const result = await this.run(name, fn, options)
      results.push(result)
    }
    
    return results
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
  clear(): void {
    this.results = []
  }
  
  /**
   * 获取内存使用
   */
  private getMemoryUsage(): number {
    if (typeof performance === 'undefined') return 0
    const memory = (performance as any).memory
    return memory?.usedJSHeapSize || 0
  }
  
  /**
   * 生成报告
   */
  generateReport(): string {
    if (this.results.length === 0) {
      return '没有可用的基准测试结果'
    }
    
    const report: string[] = []
    
    report.push('='.repeat(80))
    report.push('                          性能基准测试报告')
    report.push('='.repeat(80))
    report.push('')
    
    // 按性能排序
    const sorted = [...this.results].sort((a, b) => a.avgTime - b.avgTime)
    const fastest = sorted[0]
    
    sorted.forEach((result, index) => {
      const isFastest = result === fastest
      const ratio = result.avgTime / fastest.avgTime
      
      report.push(`${index + 1}. ${result.name}${isFastest ? ' ⚡' : ''}`)
      report.push(`   迭代次数: ${result.iterations.toLocaleString()}`)
      report.push(`   总耗时: ${result.totalTime.toFixed(2)}ms`)
      report.push(`   平均耗时: ${result.avgTime.toFixed(4)}ms`)
      report.push(`   最小耗时: ${result.minTime.toFixed(4)}ms`)
      report.push(`   最大耗时: ${result.maxTime.toFixed(4)}ms`)
      report.push(`   操作/秒: ${result.opsPerSecond.toLocaleString()} ops/s`)
      
      if (!isFastest) {
        report.push(`   性能比: ${ratio.toFixed(2)}x slower`)
      }
      
      if (result.memory) {
        const { before, after, delta } = result.memory
        report.push(`   内存 (开始): ${(before / 1024 / 1024).toFixed(2)} MB`)
        report.push(`   内存 (结束): ${(after / 1024 / 1024).toFixed(2)} MB`)
        report.push(`   内存增长: ${(delta / 1024 / 1024).toFixed(2)} MB`)
      }
      
      report.push('')
    })
    
    report.push('='.repeat(80))
    
    return report.join('\n')
  }
  
  /**
   * 输出报告到控制台
   */
  logReport(): void {
    console.log(this.generateReport())
  }
}

// 导出便捷实例
export const benchmark = new Benchmark()

// 便捷方法
export async function runBenchmark(
  name: string,
  fn: () => void | Promise<void>,
  options?: BenchmarkOptions
): Promise<BenchmarkResult> {
  return benchmark.run(name, fn, options)
}

export async function compareBenchmarks(
  benchmarks: Array<{
    name: string
    fn: () => void | Promise<void>
  }>,
  options?: BenchmarkOptions
): Promise<BenchmarkResult[]> {
  return benchmark.compare(benchmarks, options)
}

