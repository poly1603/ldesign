/**
 * 性能优化工具函数
 * 包含防抖、节流、批处理等功能
 */

/**
 * 防抖函数选项
 */
export interface DebounceOptions {
  /** 延迟时间（毫秒） */
  wait: number
  /** 是否在开始时调用 */
  leading?: boolean
  /** 是否在结束时调用 */
  trailing?: boolean
  /** 最大等待时间（毫秒） */
  maxWait?: number
}

/**
 * 节流函数选项
 */
export interface ThrottleOptions {
  /** 间隔时间（毫秒） */
  wait: number
  /** 是否在开始时调用 */
  leading?: boolean
  /** 是否在结束时调用 */
  trailing?: boolean
}

/**
 * 批处理选项
 */
export interface BatchOptions {
  /** 批处理大小 */
  size?: number
  /** 批处理延迟（毫秒） */
  delay?: number
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param options 防抖选项
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  options: DebounceOptions,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  let lastCallTime: number | null = null
  let lastInvokeTime = 0
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null
  let result: ReturnType<T>

  const { wait, leading = false, trailing = true, maxWait } = options

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = null
    lastThis = null
    lastInvokeTime = time

    result = func.apply(thisArg, args!)
    return result
  }

  function leadingEdge(time: number): void {
    lastInvokeTime = time
    timeoutId = setTimeout(timerExpired, wait)

    if (leading) {
      invokeFunc(time)
    }
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime || 0)
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime || 0)
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === null
      || timeSinceLastCall >= wait
      || timeSinceLastCall < 0
      || (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    )
  }

  function timerExpired(): void {
    const time = Date.now()

    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }

    timeoutId = setTimeout(timerExpired, remainingWait(time))
  }

  function trailingEdge(time: number): void {
    timeoutId = null

    if (trailing && lastArgs) {
      invokeFunc(time)
    }

    lastArgs = null
    lastThis = null
  }

  function cancel(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    lastInvokeTime = 0
    lastArgs = null
    lastCallTime = null
    lastThis = null
    timeoutId = null
  }

  function flush(): ReturnType<T> | undefined {
    if (timeoutId === null) {
      return result
    }
    trailingEdge(Date.now())
    return result
  }

  function pending(): boolean {
    return timeoutId !== null
  }

  function debounced(this: any, ...args: Parameters<T>): void {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    // eslint-disable-next-line ts/no-this-alias
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime) as any
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, wait)
        return invokeFunc(lastCallTime) as any
      }
    }

    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, wait)
    }
  }

  Object.assign(debounced, { cancel, flush, pending })

  return debounced
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param options 节流选项
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  options: ThrottleOptions,
): (...args: Parameters<T>) => void {
  const { wait, leading = true, trailing = true } = options

  return debounce(func, {
    wait,
    leading,
    trailing,
    maxWait: wait,
  })
}

/**
 * 批处理执行器
 */
export class BatchProcessor<T> {
  private queue: T[] = []
  private timeoutId: NodeJS.Timeout | null = null
  private readonly processor: (items: T[]) => void
  private readonly options: Required<BatchOptions>

  constructor(processor: (items: T[]) => void, options: BatchOptions = {}) {
    this.processor = processor
    this.options = {
      size: options.size ?? 10,
      delay: options.delay ?? 100,
    }
  }

  /**
   * 添加项目到批处理队列
   */
  add(item: T): void {
    this.queue.push(item)

    if (this.queue.length >= this.options.size) {
      this.flush()
    }
    else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => this.flush(), this.options.delay)
    }
  }

  /**
   * 批量添加项目
   */
  addAll(items: T[]): void {
    items.forEach(item => this.add(item))
  }

  /**
   * 立即处理队列中的所有项目
   */
  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.queue.length > 0) {
      const items = [...this.queue]
      this.queue = []
      this.processor(items)
    }
  }

  /**
   * 清空队列
   */
  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.queue = []
  }

  /**
   * 获取队列大小
   */
  size(): number {
    return this.queue.length
  }
}

/**
 * 创建一个记忆化函数
 * @param fn 要记忆化的函数
 * @param getKey 获取缓存键的函数
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string,
): T {
  const cache = new Map<string, ReturnType<T>>()

  const defaultGetKey = (...args: Parameters<T>): string => {
    return JSON.stringify(args)
  }

  const keyGetter = getKey || defaultGetKey

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGetter(...args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)

    // 限制缓存大小
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      if (firstKey !== undefined) {
        cache.delete(firstKey)
      }
    }

    return result
  }) as T
}

/**
 * RAF（requestAnimationFrame）调度器
 */
export class RAFScheduler {
  private tasks: Set<() => void> = new Set()
  private rafId: number | null = null

  /**
   * 添加任务到 RAF 队列
   */
  schedule(task: () => void): () => void {
    this.tasks.add(task)

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.flush())
    }

    // 返回取消函数
    return () => {
      this.tasks.delete(task)
      if (this.tasks.size === 0 && this.rafId !== null) {
        cancelAnimationFrame(this.rafId)
        this.rafId = null
      }
    }
  }

  /**
   * 执行所有任务
   */
  private flush(): void {
    const tasks = [...this.tasks]
    this.tasks.clear()
    this.rafId = null

    tasks.forEach((task) => {
      try {
        task()
      }
      catch (error) {
        console.error('RAF task error:', error)
      }
    })
  }

  /**
   * 清空所有任务
   */
  clear(): void {
    this.tasks.clear()
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number[]> = new Map()

  /**
   * 标记开始时间
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * 测量时间间隔
   */
  measure(name: string, startMark: string): number {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      throw new Error(`Mark "${startMark}" not found`)
    }

    const duration = performance.now() - startTime

    if (!this.measures.has(name)) {
      this.measures.set(name, [])
    }

    this.measures.get(name)!.push(duration)

    return duration
  }

  /**
   * 获取平均测量时间
   */
  getAverage(name: string): number {
    const measures = this.measures.get(name)
    if (!measures || measures.length === 0) {
      return 0
    }

    return measures.reduce((sum, val) => sum + val, 0) / measures.length
  }

  /**
   * 获取所有测量统计
   */
  getStats(name: string): {
    count: number
    average: number
    min: number
    max: number
    total: number
  } | null {
    const measures = this.measures.get(name)
    if (!measures || measures.length === 0) {
      return null
    }

    return {
      count: measures.length,
      average: this.getAverage(name),
      min: Math.min(...measures),
      max: Math.max(...measures),
      total: measures.reduce((sum, val) => sum + val, 0),
    }
  }

  /**
   * 清空所有记录
   */
  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }

  /**
   * 输出性能报告
   */
  report(): void {
    console.group('Performance Report')

    this.measures.forEach((_, name) => {
      const stats = this.getStats(name)
      if (stats) {
        console.table({
          Metric: name,
          Count: stats.count,
          Average: `${stats.average.toFixed(2)}ms`,
          Min: `${stats.min.toFixed(2)}ms`,
          Max: `${stats.max.toFixed(2)}ms`,
          Total: `${stats.total.toFixed(2)}ms`,
        })
      }
    })

    console.groupEnd()
  }
}

/**
 * 创建性能优化的函数包装器
 */
export function withPerformance<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  monitor: PerformanceMonitor,
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    monitor.mark(`${name}-start`)
    const result = fn(...args)
    monitor.measure(name, `${name}-start`)
    return result
  }) as T
}
