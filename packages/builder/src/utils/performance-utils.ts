/**
 * 性能优化工具函数
 * 
 * 提供各种性能优化相关的实用工具
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 内存使用监控
 */
export class MemoryMonitor {
  private samples: Array<{ timestamp: number; usage: NodeJS.MemoryUsage }> = []
  private maxSamples: number
  
  constructor(maxSamples = 100) {
    this.maxSamples = maxSamples
  }
  
  /**
   * 记录当前内存使用情况
   */
  sample(): NodeJS.MemoryUsage {
    const usage = process.memoryUsage()
    const timestamp = Date.now()
    
    this.samples.push({ timestamp, usage })
    
    // 限制样本数量
    if (this.samples.length > this.maxSamples) {
      this.samples.shift()
    }
    
    return usage
  }
  
  /**
   * 获取内存使用趋势
   */
  getTrend(): {
    current: NodeJS.MemoryUsage
    peak: NodeJS.MemoryUsage
    average: NodeJS.MemoryUsage
    trend: 'increasing' | 'decreasing' | 'stable'
  } {
    if (this.samples.length === 0) {
      const current = process.memoryUsage()
      return {
        current,
        peak: current,
        average: current,
        trend: 'stable'
      }
    }
    
    const current = this.samples[this.samples.length - 1].usage
    const peak = this.samples.reduce((max, sample) => ({
      rss: Math.max(max.rss, sample.usage.rss),
      heapTotal: Math.max(max.heapTotal, sample.usage.heapTotal),
      heapUsed: Math.max(max.heapUsed, sample.usage.heapUsed),
      external: Math.max(max.external, sample.usage.external),
      arrayBuffers: Math.max(max.arrayBuffers || 0, sample.usage.arrayBuffers || 0)
    }), { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 })
    
    const average = this.samples.reduce((sum, sample) => ({
      rss: sum.rss + sample.usage.rss,
      heapTotal: sum.heapTotal + sample.usage.heapTotal,
      heapUsed: sum.heapUsed + sample.usage.heapUsed,
      external: sum.external + sample.usage.external,
      arrayBuffers: (sum.arrayBuffers || 0) + (sample.usage.arrayBuffers || 0)
    }), { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 })
    
    const count = this.samples.length
    const avgUsage = {
      rss: Math.round(average.rss / count),
      heapTotal: Math.round(average.heapTotal / count),
      heapUsed: Math.round(average.heapUsed / count),
      external: Math.round(average.external / count),
      arrayBuffers: Math.round((average.arrayBuffers || 0) / count)
    }
    
    // 计算趋势
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (this.samples.length >= 3) {
      const recent = this.samples.slice(-3)
      const firstHeap = recent[0].usage.heapUsed
      const lastHeap = recent[recent.length - 1].usage.heapUsed
      const diff = lastHeap - firstHeap
      const threshold = firstHeap * 0.1 // 10% 变化阈值
      
      if (diff > threshold) {
        trend = 'increasing'
      } else if (diff < -threshold) {
        trend = 'decreasing'
      }
    }
    
    return { current, peak, average: avgUsage, trend }
  }
  
  /**
   * 清除所有样本
   */
  clear(): void {
    this.samples = []
  }
}

/**
 * 批处理工具
 */
export class BatchProcessor<T, R> {
  private batchSize: number
  private processor: (batch: T[]) => Promise<R[]>
  
  constructor(batchSize: number, processor: (batch: T[]) => Promise<R[]>) {
    this.batchSize = batchSize
    this.processor = processor
  }
  
  /**
   * 处理数据批次
   */
  async process(items: T[]): Promise<R[]> {
    const results: R[] = []
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize)
      const batchResults = await this.processor(batch)
      results.push(...batchResults)
    }
    
    return results
  }
  
  /**
   * 并行处理数据批次
   */
  async processParallel(items: T[], maxConcurrency = 3): Promise<R[]> {
    const batches: T[][] = []
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      batches.push(items.slice(i, i + this.batchSize))
    }
    
    const results: R[] = []
    
    for (let i = 0; i < batches.length; i += maxConcurrency) {
      const concurrentBatches = batches.slice(i, i + maxConcurrency)
      const promises = concurrentBatches.map(batch => this.processor(batch))
      const batchResults = await Promise.all(promises)
      results.push(...batchResults.flat())
    }
    
    return results
  }
}

/**
 * 缓存装饰器
 */
export function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  keyGenerator?: (...args: TArgs) => string
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>()
  
  return (...args: TArgs): TReturn => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * 异步缓存装饰器
 */
export function memoizeAsync<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  keyGenerator?: (...args: TArgs) => string,
  ttl?: number
): (...args: TArgs) => Promise<TReturn> {
  const cache = new Map<string, { value: TReturn; timestamp: number }>()
  
  return async (...args: TArgs): Promise<TReturn> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    const now = Date.now()
    
    if (cache.has(key)) {
      const cached = cache.get(key)!
      if (!ttl || (now - cached.timestamp) < ttl) {
        return cached.value
      }
    }
    
    const result = await fn(...args)
    cache.set(key, { value: result, timestamp: now })
    return result
  }
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化持续时间
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}
