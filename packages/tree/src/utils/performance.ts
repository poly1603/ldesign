/**
 * 性能优化工具函数
 */

/**
 * 请求动画帧的Promise版本
 */
export function nextFrame(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => resolve())
  })
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

/**
 * 批量执行任务
 */
export async function batchExecute<T>(
  tasks: (() => T)[],
  batchSize: number = 10
): Promise<T[]> {
  const results: T[] = []
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize)
    const batchResults = batch.map(task => task())
    results.push(...batchResults)
    
    // 让出控制权，避免阻塞UI
    if (i + batchSize < tasks.length) {
      await nextFrame()
    }
  }
  
  return results
}

/**
 * 性能监控
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  
  /**
   * 开始计时
   */
  start(name: string): void {
    this.marks.set(name, performance.now())
  }
  
  /**
   * 结束计时并返回耗时
   */
  end(name: string): number {
    const startTime = this.marks.get(name)
    if (startTime === undefined) {
      console.warn(`Performance mark "${name}" not found`)
      return 0
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    this.marks.delete(name)
    
    return duration
  }
  
  /**
   * 测量函数执行时间
   */
  measure<T>(name: string, fn: () => T): T {
    this.start(name)
    const result = fn()
    const duration = this.end(name)
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    
    return result
  }
  
  /**
   * 测量异步函数执行时间
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name)
    const result = await fn()
    const duration = this.end(name)
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    
    return result
  }
}

/**
 * 全局性能监控实例
 */
export const performanceMonitor = new PerformanceMonitor()

/**
 * 内存使用监控
 */
export function getMemoryUsage(): MemoryInfo | null {
  if ('memory' in performance) {
    return (performance as any).memory
  }
  return null
}

/**
 * 检查是否支持某个API
 */
export function isSupported(feature: string): boolean {
  switch (feature) {
    case 'IntersectionObserver':
      return 'IntersectionObserver' in window
    case 'ResizeObserver':
      return 'ResizeObserver' in window
    case 'requestIdleCallback':
      return 'requestIdleCallback' in window
    case 'performance.memory':
      return 'memory' in performance
    default:
      return false
  }
}
