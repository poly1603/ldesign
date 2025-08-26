/**
 * 性能测试设置文件
 *
 * 提供性能测试的基础工具和配置
 */

import Benchmark from 'benchmark'

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

// 性能基准测试类
export class PerformanceBenchmark {
  private suite: Benchmark.Suite
  private results: PerformanceResult[] = []

  constructor(name: string) {
    this.suite = new Benchmark.Suite(name)
  }

  /**
   * 添加测试用例
   */
  add(name: string, fn: () => void, options?: Benchmark.Options): this {
    this.suite.add(name, fn, options)
    return this
  }

  /**
   * 运行基准测试
   */
  async run(): Promise<PerformanceResult[]> {
    return new Promise((resolve, reject) => {
      this.suite
        .on('cycle', (event: Benchmark.Event) => {
          const benchmark = event.target as Benchmark
          const result: PerformanceResult = {
            name: benchmark.name || 'Unknown',
            opsPerSecond: benchmark.hz || 0,
            meanTime: benchmark.stats?.mean || 0,
            samples: benchmark.stats?.sample?.length || 0,
            variance: benchmark.stats?.variance || 0,
            standardDeviation: benchmark.stats?.deviation || 0,
            marginOfError: benchmark.stats?.moe || 0,
            relativeMarginOfError: benchmark.stats?.rme || 0
          }
          this.results.push(result)
          console.log(`${benchmark.name}: ${benchmark.hz?.toFixed(2)} ops/sec ±${benchmark.stats?.rme?.toFixed(2)}%`)
        })
        .on('complete', () => {
          resolve(this.results)
        })
        .on('error', (error: Error) => {
          reject(error)
        })
        .run({ async: true })
    })
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
