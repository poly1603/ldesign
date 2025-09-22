/**
 * 性能测试设置文件
 *
 * 提供性能测试的基础工具和配置
 */

// 不再使用 Benchmark 库，改用自定义实现避免 DOM 依赖
// import Benchmark from 'benchmark'

// 性能测试结果接口
export interface PerformanceResult {
  name: string
  opsPerSecond: number
  meanTime: number
  samples: number
  variance: number
  standardDeviation: number
  marginOfError: number
  relativeMarginOfError: number
}

// 内存使用情况接口
export interface MemoryUsage {
  used: number
  total: number
  percentage: number
}

// 性能基准测试类 - 自定义实现，避免 DOM 依赖
export class PerformanceBenchmark {
  private tests: Array<{ name: string; fn: () => void; options?: any }> = []
  private results: PerformanceResult[] = []
  private name: string

  constructor(name: string) {
    this.name = name
  }

  /**
   * 添加测试用例
   */
  add(name: string, fn: () => void, options?: any): this {
    this.tests.push({ name, fn, options })
    return this
  }

  /**
   * 运行基准测试
   */
  async run(): Promise<PerformanceResult[]> {
    this.results = []

    for (const test of this.tests) {
      try {
        const result = await this.runSingleTest(test.name, test.fn)
        this.results.push(result)
        console.log(`${test.name}: ${result.opsPerSecond.toFixed(2)} ops/sec ±${result.relativeMarginOfError.toFixed(2)}%`)
      } catch (error) {
        console.error(`Error running test ${test.name}:`, error)
      }
    }

    return this.results
  }

  /**
   * 运行单个测试
   */
  private async runSingleTest(name: string, fn: () => void): Promise<PerformanceResult> {
    const samples: number[] = []
    const sampleCount = 100 // 减少样本数量以避免超时
    const warmupCount = 10

    // 预热
    for (let i = 0; i < warmupCount; i++) {
      fn()
    }

    // 收集样本
    for (let i = 0; i < sampleCount; i++) {
      const start = performance.now()
      fn()
      const end = performance.now()
      samples.push(end - start)
    }

    // 计算统计数据
    const mean = samples.reduce((sum, time) => sum + time, 0) / samples.length
    const variance = samples.reduce((sum, time) => sum + (time - mean) ** 2, 0) / samples.length
    const standardDeviation = Math.sqrt(variance)
    const marginOfError = 1.96 * standardDeviation / Math.sqrt(samples.length)
    const relativeMarginOfError = (marginOfError / mean) * 100

    return {
      name,
      opsPerSecond: 1000 / mean, // 转换为每秒操作数
      meanTime: mean,
      samples: samples.length,
      variance,
      standardDeviation,
      marginOfError,
      relativeMarginOfError
    }
  }

  /**
   * 获取最快的测试结果
   */
  getFastest(): PerformanceResult | null {
    if (this.results.length === 0) return null
    return this.results.reduce((fastest, current) =>
      current.opsPerSecond > fastest.opsPerSecond ? current : fastest
    )
  }

  /**
   * 获取最慢的测试结果
   */
  getSlowest(): PerformanceResult | null {
    if (this.results.length === 0) return null
    return this.results.reduce((slowest, current) =>
      current.opsPerSecond < slowest.opsPerSecond ? current : slowest
    )
  }
}

/**
 * 测量函数执行时间
 */
export function measureTime<T>(fn: () => T): { result: T; time: number } {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  return { result, time: end - start }
}

/**
 * 测量异步函数执行时间
 */
export async function measureTimeAsync<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  return { result, time: end - start }
}

/**
 * 获取内存使用情况
 */
export function getMemoryUsage(): MemoryUsage {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    }
  }

  // 在 Node.js 环境中使用 process.memoryUsage()
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memory = process.memoryUsage()
    return {
      used: memory.heapUsed,
      total: memory.heapTotal,
      percentage: (memory.heapUsed / memory.heapTotal) * 100
    }
  }

  return { used: 0, total: 0, percentage: 0 }
}

/**
 * 创建大量测试数据
 */
export function createLargeDataset(size: number): Array<{ id: number; name: string; value: number }> {
  return Array.from({ length: size }, (_, index) => ({
    id: index,
    name: `Item ${index}`,
    value: Math.random() * 1000
  }))
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 缓存装饰器
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number> = new Map()

  /**
   * 标记时间点
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * 清除所有标记
   */
  clearMarks(): void {
    this.marks.clear()
    this.measures.clear()
  }

  /**
   * 测量两个时间点之间的时间
   */
  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      throw new Error(`Start mark "${startMark}" not found`)
    }

    const endTime = endMark ? this.marks.get(endMark) : performance.now()
    if (endMark && !endTime) {
      throw new Error(`End mark "${endMark}" not found`)
    }

    const duration = (endTime || performance.now()) - startTime
    this.measures.set(name, duration)
    return duration
  }

  /**
   * 获取测量结果
   */
  getMeasure(name: string): number | undefined {
    return this.measures.get(name)
  }

  /**
   * 获取所有测量结果
   */
  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures)
  }

  /**
   * 清除所有标记和测量
   */
  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }
}

// 导出全局性能监控器实例
export const performanceMonitor = new PerformanceMonitor()
