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

/**
 * 内存使用信息接口
 */
export interface MemoryInfo {
  /** 已使用的堆内存（字节） */
  usedJSHeapSize: number
  /** 总堆内存大小（字节） */
  totalJSHeapSize: number
  /** 堆内存限制（字节） */
  jsHeapSizeLimit: number
  /** 内存使用率（0-1） */
  usageRatio: number
  /** 格式化的内存信息 */
  formatted: {
    used: string
    total: string
    limit: string
    usage: string
  }
}

/**
 * FPS 监控器
 */
export class FPSMonitor {
  private frames: number[] = []
  private lastTime: number = performance.now()
  private rafId: number | null = null
  private isRunning: boolean = false
  private readonly maxSamples: number

  constructor(maxSamples: number = 60) {
    this.maxSamples = maxSamples
  }

  /**
   * 开始监控 FPS
   */
  start(): void {
    if (this.isRunning)
      return

    this.isRunning = true
    this.lastTime = performance.now()
    this.tick()
  }

  /**
   * 停止监控
   */
  stop(): void {
    this.isRunning = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /**
   * 获取当前 FPS
   */
  getFPS(): number {
    if (this.frames.length === 0)
      return 0

    const sum = this.frames.reduce((a, b) => a + b, 0)
    return sum / this.frames.length
  }

  /**
   * 获取 FPS 统计信息
   */
  getStats(): {
    current: number
    average: number
    min: number
    max: number
    samples: number
  } {
    if (this.frames.length === 0) {
      return {
        current: 0,
        average: 0,
        min: 0,
        max: 0,
        samples: 0,
      }
    }

    return {
      current: this.frames[this.frames.length - 1] || 0,
      average: this.getFPS(),
      min: Math.min(...this.frames),
      max: Math.max(...this.frames),
      samples: this.frames.length,
    }
  }

  /**
   * 重置统计
   */
  reset(): void {
    this.frames = []
    this.lastTime = performance.now()
  }

  /**
   * FPS 计算循环
   */
  private tick(): void {
    if (!this.isRunning)
      return

    const now = performance.now()
    const delta = now - this.lastTime
    const fps = 1000 / delta

    this.frames.push(fps)
    if (this.frames.length > this.maxSamples) {
      this.frames.shift()
    }

    this.lastTime = now
    this.rafId = requestAnimationFrame(() => this.tick())
  }
}

/**
 * 内存监控器
 */
export class MemoryMonitor {
  private samples: MemoryInfo[] = []
  private readonly maxSamples: number
  private timerId: NodeJS.Timeout | null = null

  constructor(maxSamples: number = 100) {
    this.maxSamples = maxSamples
  }

  /**
   * 检查内存 API 是否可用
   */
  static isSupported(): boolean {
    return typeof performance !== 'undefined'
      && 'memory' in performance
      && performance.memory !== undefined
  }

  /**
   * 获取当前内存使用情况
   */
  getMemoryInfo(): MemoryInfo | null {
    if (!MemoryMonitor.isSupported())
      return null

    const memory = (performance as any).memory
    const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usageRatio,
      formatted: {
        used: this.formatBytes(memory.usedJSHeapSize),
        total: this.formatBytes(memory.totalJSHeapSize),
        limit: this.formatBytes(memory.jsHeapSizeLimit),
        usage: `${(usageRatio * 100).toFixed(2)}%`,
      },
    }
  }

  /**
   * 开始定期监控内存
   * @param interval 采样间隔（毫秒）
   */
  startMonitoring(interval: number = 5000): void {
    if (this.timerId)
      return

    this.timerId = setInterval(() => {
      const info = this.getMemoryInfo()
      if (info) {
        this.samples.push(info)
        if (this.samples.length > this.maxSamples) {
          this.samples.shift()
        }
      }
    }, interval)

    // 在 Node.js 环境中允许进程退出
    if (typeof process !== 'undefined' && this.timerId.unref) {
      this.timerId.unref()
    }
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }

  /**
   * 获取内存趋势统计
   */
  getStats(): {
    current: MemoryInfo | null
    average: number
    peak: number
    samples: number
  } {
    if (this.samples.length === 0) {
      return {
        current: this.getMemoryInfo(),
        average: 0,
        peak: 0,
        samples: 0,
      }
    }

    const usages = this.samples.map(s => s.usedJSHeapSize)
    const average = usages.reduce((a, b) => a + b, 0) / usages.length
    const peak = Math.max(...usages)

    return {
      current: this.getMemoryInfo(),
      average,
      peak,
      samples: this.samples.length,
    }
  }

  /**
   * 检查内存压力
   * @param threshold 阈值（0-1）
   * @returns 是否超过阈值
   */
  isMemoryPressureHigh(threshold: number = 0.85): boolean {
    const info = this.getMemoryInfo()
    return info ? info.usageRatio > threshold : false
  }

  /**
   * 清空采样数据
   */
  clear(): void {
    this.samples = []
  }

  /**
   * 格式化字节数
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0)
      return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
  }
}

/**
 * 慢操作检测器
 */
export class SlowOperationDetector {
  private threshold: number
  private operations: Map<string, {
    count: number
    totalTime: number
    slowCount: number
    maxTime: number
  }> = new Map()

  /**
   * @param threshold 慢操作阈值（毫秒）
   */
  constructor(threshold: number = 16) {
    this.threshold = threshold
  }

  /**
   * 记录操作
   * @param name 操作名称
   * @param duration 持续时间（毫秒）
   */
  record(name: string, duration: number): void {
    if (!this.operations.has(name)) {
      this.operations.set(name, {
        count: 0,
        totalTime: 0,
        slowCount: 0,
        maxTime: 0,
      })
    }

    const op = this.operations.get(name)!
    op.count++
    op.totalTime += duration
    op.maxTime = Math.max(op.maxTime, duration)

    if (duration > this.threshold) {
      op.slowCount++
      console.warn(
        `⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms (threshold: ${this.threshold}ms)`,
      )
    }
  }

  /**
   * 获取操作统计
   */
  getStats(name?: string): Map<string, {
    count: number
    averageTime: number
    slowCount: number
    slowRatio: number
    maxTime: number
  }> {
    const stats = new Map<string, {
      count: number
      averageTime: number
      slowCount: number
      slowRatio: number
      maxTime: number
    }>()

    const entries: [string, {
      count: number
      totalTime: number
      slowCount: number
      maxTime: number
    }][] = name
      ? [[name, this.operations.get(name)!]].filter(([_, data]) => data !== undefined) as any
      : Array.from(this.operations.entries())

    for (const [opName, data] of entries) {
      if (data) {
        stats.set(opName, {
          count: data.count,
          averageTime: data.totalTime / data.count,
          slowCount: data.slowCount,
          slowRatio: data.slowCount / data.count,
          maxTime: data.maxTime,
        })
      }
    }

    return stats
  }

  /**
   * 包装函数以自动检测慢操作
   */
  wrap<T extends (...args: any[]) => any>(
    name: string,
    fn: T,
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const start = performance.now()
      const result = fn(...args)
      const duration = performance.now() - start
      this.record(name, duration)
      return result
    }) as T
  }

  /**
   * 重置统计
   */
  clear(): void {
    this.operations.clear()
  }
}

/**
 * 全局性能监控实例
 */
export const globalPerformanceMonitor = new PerformanceMonitor()
export const globalMemoryMonitor = new MemoryMonitor()
export const globalFPSMonitor = new FPSMonitor()
export const globalSlowOpDetector = new SlowOperationDetector()
