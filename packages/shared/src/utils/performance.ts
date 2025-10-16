/**
 * 性能优化工具函数模块
 * 
 * @description
 * 提供性能监控、优化相关的工具函数。
 */

/**
 * 性能计时器
 */
export class PerformanceTimer {
  private startTime: number = 0
  private endTime: number = 0
  private marks: Map<string, number> = new Map()

  /**
   * 开始计时
   */
  start(): void {
    this.startTime = performance.now()
  }

  /**
   * 结束计时
   * @returns 耗时（毫秒）
   */
  end(): number {
    this.endTime = performance.now()
    return this.endTime - this.startTime
  }

  /**
   * 添加标记点
   * @param name - 标记名称
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * 获取两个标记点之间的耗时
   * @param startMark - 开始标记
   * @param endMark - 结束标记
   * @returns 耗时（毫秒）
   */
  measure(startMark: string, endMark: string): number {
    const start = this.marks.get(startMark)
    const end = this.marks.get(endMark)
    
    if (start === undefined || end === undefined) {
      throw new Error(`Mark not found: ${startMark} or ${endMark}`)
    }
    
    return end - start
  }

  /**
   * 获取从开始到指定标记的耗时
   * @param markName - 标记名称
   * @returns 耗时（毫秒）
   */
  measureFromStart(markName: string): number {
    const mark = this.marks.get(markName)
    if (mark === undefined) {
      throw new Error(`Mark not found: ${markName}`)
    }
    return mark - this.startTime
  }

  /**
   * 清除所有标记
   */
  clear(): void {
    this.marks.clear()
    this.startTime = 0
    this.endTime = 0
  }
}

/**
 * 创建性能计时器
 * @returns 性能计时器实例
 * 
 * @example
 * ```typescript
 * const timer = createTimer()
 * timer.start()
 * 
 * // 执行一些操作
 * await someAsyncOperation()
 * timer.mark('operation1')
 * 
 * // 执行更多操作
 * await anotherOperation()
 * timer.mark('operation2')
 * 
 * const totalTime = timer.end()
 * const op1Time = timer.measureFromStart('operation1')
 * const op2Time = timer.measure('operation1', 'operation2')
 * ```
 */
export function createTimer(): PerformanceTimer {
  return new PerformanceTimer()
}

/**
 * 简单的性能测试函数
 * @param fn - 要测试的函数
 * @param iterations - 迭代次数（默认1000）
 * @returns 平均耗时（毫秒）
 * 
 * @example
 * ```typescript
 * const avgTime = benchmark(() => {
 *   // 要测试的代码
 *   someExpensiveOperation()
 * }, 100)
 * 
 *  * ```
 */
export function benchmark(fn: () => void, iterations = 1000): number {
  const timer = createTimer()
  timer.start()
  
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  
  const totalTime = timer.end()
  return totalTime / iterations
}

/**
 * 异步函数性能测试
 * @param fn - 要测试的异步函数
 * @param iterations - 迭代次数（默认100）
 * @returns 平均耗时（毫秒）
 */
export async function benchmarkAsync(
  fn: () => Promise<void>, 
  iterations = 100
): Promise<number> {
  const timer = createTimer()
  timer.start()
  
  for (let i = 0; i < iterations; i++) {
    await fn()
  }
  
  const totalTime = timer.end()
  return totalTime / iterations
}

/**
 * 内存使用情况监控
 * @returns 内存使用信息
 */
export function getMemoryUsage(): {
  used: number
  total: number
  percentage: number
} | null {
  if (typeof performance === 'undefined' || !('memory' in performance)) {
    return null
  }

  const memory = (performance as any).memory
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
  }
}

/**
 * 检查是否支持性能 API
 * @returns 是否支持
 */
export function isPerformanceSupported(): boolean {
  return typeof performance !== 'undefined' && 'now' in performance
}

/**
 * 获取页面加载性能指标
 * @returns 性能指标
 */
export function getPagePerformance(): {
  domContentLoaded: number
  loadComplete: number
  firstPaint?: number
  firstContentfulPaint?: number
} | null {
  if (typeof performance === 'undefined' || !performance.timing) {
    return null
  }

  const timing = performance.timing
  const navigation = timing.navigationStart

  const result = {
    domContentLoaded: timing.domContentLoadedEventEnd - navigation,
    loadComplete: timing.loadEventEnd - navigation,
  } as any

  // 获取 Paint Timing API 数据
  if ('getEntriesByType' in performance) {
    const paintEntries = performance.getEntriesByType('paint')
    for (const entry of paintEntries) {
      if (entry.name === 'first-paint') {
        result.firstPaint = entry.startTime
      } else if (entry.name === 'first-contentful-paint') {
        result.firstContentfulPaint = entry.startTime
      }
    }
  }

  return result
}
