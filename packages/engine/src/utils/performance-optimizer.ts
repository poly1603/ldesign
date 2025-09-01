/**
 * 性能优化工具类
 * 🚀 提供通用的性能优化功能，减少重复代码
 */

/**
 * 批处理器配置
 */
interface BatchProcessorConfig<T> {
  /** 批处理大小 */
  batchSize: number
  /** 处理间隔（毫秒） */
  interval: number
  /** 批处理函数 */
  processor: (items: T[]) => void | Promise<void>
  /** 最大等待时间（毫秒） */
  maxWaitTime?: number
}

/**
 * 批处理器
 * 🎯 将多个操作合并为批量操作，提高性能
 */
export class BatchProcessor<T> {
  private queue: T[] = []
  private timer?: NodeJS.Timeout
  private lastProcessTime = 0
  private processing = false

  constructor(private config: BatchProcessorConfig<T>) {}

  /**
   * 添加项目到批处理队列
   */
  add(item: T): void {
    this.queue.push(item)

    // 如果队列满了，立即处理
    if (this.queue.length >= this.config.batchSize) {
      this.process()
      return
    }

    // 如果超过最大等待时间，立即处理
    const now = Date.now()
    const maxWaitTime = this.config.maxWaitTime || this.config.interval * 2
    if (now - this.lastProcessTime > maxWaitTime) {
      this.process()
      return
    }

    // 设置定时器
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.process()
      }, this.config.interval)
    }
  }

  /**
   * 立即处理队列中的所有项目
   */
  async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    // 清除定时器
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }

    // 取出要处理的项目
    const items = this.queue.splice(0, this.config.batchSize)
    this.lastProcessTime = Date.now()

    try {
      await this.config.processor(items)
    } catch (error) {
      console.error('Batch processing error:', error)
    } finally {
      this.processing = false

      // 如果还有剩余项目，继续处理
      if (this.queue.length > 0) {
        setTimeout(() => this.process(), 0)
      }
    }
  }

  /**
   * 销毁批处理器
   */
  destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
    this.queue.length = 0
    this.processing = false
  }

  /**
   * 获取队列长度
   */
  get queueLength(): number {
    return this.queue.length
  }
}

/**
 * 防抖函数
 * 🎯 防止函数被频繁调用
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): T {
  let timeout: NodeJS.Timeout | undefined
  let result: ReturnType<T>

  const debounced = function (this: any, ...args: Parameters<T>) {
    const later = () => {
      timeout = undefined
      if (!immediate) {
        result = func.apply(this, args)
      }
    }

    const callNow = immediate && !timeout

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)

    if (callNow) {
      result = func.apply(this, args)
    }

    return result
  }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }
  }

  return debounced as unknown as T
}

/**
 * 节流函数
 * 🎯 限制函数的调用频率
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T {
  let timeout: NodeJS.Timeout | undefined
  let previous = 0
  let result: ReturnType<T>

  const { leading = true, trailing = true } = options

  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (!previous && !leading) {
      previous = now
    }

    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = undefined
      }
      previous = now
      result = func.apply(this, args)
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now()
        timeout = undefined
        result = func.apply(this, args)
      }, remaining)
    }

    return result
  }

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }
    previous = 0
  }

  return throttled as unknown as T
}

/**
 * 内存池
 * 🎯 重用对象，减少垃圾回收压力
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn?: (obj: T) => void
  private maxSize: number

  constructor(createFn: () => T, resetFn?: (obj: T) => void, maxSize = 100) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize
  }

  /**
   * 获取对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  /**
   * 释放对象
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj)
      }
      this.pool.push(obj)
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool.length = 0
  }

  /**
   * 获取池大小
   */
  get size(): number {
    return this.pool.length
  }
}

/**
 * 性能监控器
 * 🎯 监控函数执行性能
 */
export class PerformanceMonitor {
  private metrics = new Map<
    string,
    {
      count: number
      totalTime: number
      minTime: number
      maxTime: number
      avgTime: number
    }
  >()

  /**
   * 包装函数以监控性能
   */
  wrap<T extends (...args: any[]) => any>(name: string, func: T): T {
    return ((...args: Parameters<T>) => {
      const start = performance.now()
      const result = func(...args)
      const end = performance.now()

      this.recordMetric(name, end - start)

      return result
    }) as T
  }

  /**
   * 记录性能指标
   */
  recordMetric(name: string, time: number): void {
    const existing = this.metrics.get(name)

    if (existing) {
      existing.count++
      existing.totalTime += time
      existing.minTime = Math.min(existing.minTime, time)
      existing.maxTime = Math.max(existing.maxTime, time)
      existing.avgTime = existing.totalTime / existing.count
    } else {
      this.metrics.set(name, {
        count: 1,
        totalTime: time,
        minTime: time,
        maxTime: time,
        avgTime: time,
      })
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {}

    for (const [name, metric] of this.metrics) {
      result[name] = { ...metric }
    }

    return result
  }

  /**
   * 清除指标
   */
  clearMetrics(): void {
    this.metrics.clear()
  }
}
