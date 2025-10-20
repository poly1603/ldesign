import { BATCH_CONFIG, TIME_INTERVALS } from '../constants/performance'

/**
 * 事件节流优化工具
 * 
 * 提供事件批量处理和节流功能，显著减少高频事件的性能开销
 */

/**
 * 节流事件配置
 */
export interface ThrottleConfig {
  /** 批量大小（达到此数量立即触发） */
  batchSize?: number
  /** 刷新间隔（毫秒） */
  flushInterval?: number
  /** 是否启用 */
  enabled?: boolean
}

/**
 * 批量事件数据
 */
export interface BatchEventData<T = unknown> {
  /** 事件列表 */
  events: T[]
  /** 批次创建时间 */
  timestamp: number
  /** 批次大小 */
  size: number
}

/**
 * 事件处理器类型
 */
export type EventHandler<T = unknown> = (data: T) => void | Promise<void>

/**
 * 批量事件处理器类型
 */
export type BatchEventHandler<T = unknown> = (batch: BatchEventData<T>) => void | Promise<void>

/**
 * 节流事件发射器
 * 
 * 将高频事件批量处理，减少事件监听器的调用次数
 * 
 * @example
 * ```typescript
 * const emitter = new ThrottledEventEmitter({ batchSize: 10, flushInterval: 100 })
 * 
 * emitter.on('data', (batch) => {
 *   
 * })
 * 
 * // 发送多个事件
 * for (let i = 0; i < 100; i++) {
 *   emitter.emit('data', { value: i })
 * }
 * ```
 */
export class ThrottledEventEmitter<EventMap extends Record<string, unknown> = Record<string, unknown>> {
  /** 事件监听器映射 */
  private listeners: Map<string, Set<EventHandler>>
  /** 批量事件监听器映射 */
  private batchListeners: Map<string, Set<BatchEventHandler>>
  /** 事件队列映射 */
  private queues: Map<string, unknown[]>
  /** 刷新定时器映射 */
  private timers: Map<string, NodeJS.Timeout>
  /** 配置 */
  private config: Required<ThrottleConfig>

  /**
   * 构造函数
   */
  constructor(config: ThrottleConfig = {}) {
    this.listeners = new Map()
    this.batchListeners = new Map()
    this.queues = new Map()
    this.timers = new Map()
    this.config = {
      batchSize: config.batchSize ?? BATCH_CONFIG.DEFAULT_SIZE,
      flushInterval: config.flushInterval ?? TIME_INTERVALS.EVENT_FLUSH_DEFAULT,
      enabled: config.enabled ?? true,
    }
  }

  /**
   * 注册单个事件监听器
   * 
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  on<K extends keyof EventMap>(event: K & string, handler: EventHandler<EventMap[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as EventHandler)
  }

  /**
   * 注册批量事件监听器
   * 
   * @param event - 事件名称
   * @param handler - 批量事件处理器
   */
  onBatch<K extends keyof EventMap>(event: K & string, handler: BatchEventHandler<EventMap[K]>): void {
    if (!this.batchListeners.has(event)) {
      this.batchListeners.set(event, new Set())
    }
    this.batchListeners.get(event)!.add(handler as BatchEventHandler)
  }

  /**
   * 移除事件监听器
   * 
   * @param event - 事件名称
   * @param handler - 事件处理器
   */
  off<K extends keyof EventMap>(event: K & string, handler?: EventHandler<EventMap[K]>): void {
    if (handler) {
      this.listeners.get(event)?.delete(handler as EventHandler)
    }
    else {
      this.listeners.delete(event)
    }
  }

  /**
   * 移除批量事件监听器
   * 
   * @param event - 事件名称
   * @param handler - 批量事件处理器
   */
  offBatch<K extends keyof EventMap>(event: K & string, handler?: BatchEventHandler<EventMap[K]>): void {
    if (handler) {
      this.batchListeners.get(event)?.delete(handler as BatchEventHandler)
    }
    else {
      this.batchListeners.delete(event)
    }
  }

  /**
   * 发射事件
   * 
   * @param event - 事件名称
   * @param data - 事件数据
   */
  emit<K extends keyof EventMap>(event: K & string, data: EventMap[K]): void {
    if (!this.config?.enabled) {
      // 如果未启用节流，直接触发
      this.triggerListeners(event, data)
      return
    }

    // 添加到队列
    if (!this.queues.has(event)) {
      this.queues.set(event, [])
    }
    this.queues.get(event)!.push(data)

    // 检查是否需要立即刷新
    if (this.queues.get(event)!.length >= this.config?.batchSize) {
      this.flush(event)
    }
    else {
      // 设置定时刷新
      this.scheduleFlush(event)
    }
  }

  /**
   * 立即刷新指定事件的队列
   * 
   * @param event - 事件名称
   */
  flush(event: string): void {
    const queue = this.queues.get(event)
    if (!queue || queue.length === 0) {
      return
    }

    // 清除定时器
    const timer = this.timers.get(event)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(event)
    }

    // 创建批次数据
    const batch: BatchEventData = {
      events: [...queue],
      timestamp: Date.now(),
      size: queue.length,
    }

    // 清空队列
    queue.length = 0

    // 触发批量监听器
    this.triggerBatchListeners(event, batch)

    // 如果没有批量监听器，触发单个监听器
    if (!this.batchListeners.has(event) || this.batchListeners.get(event)!.size === 0) {
      for (const eventData of batch.events) {
        this.triggerListeners(event, eventData)
      }
    }
  }

  /**
   * 刷新所有事件队列
   */
  flushAll(): void {
    for (const event of this.queues.keys()) {
      this.flush(event)
    }
  }

  /**
   * 安排刷新任务
   * 
   * @param event - 事件名称
   */
  private scheduleFlush(event: string): void {
    // 如果已有定时器，不重复设置
    if (this.timers.has(event)) {
      return
    }

    const timer = setTimeout(() => {
      this.flush(event)
    }, this.config?.flushInterval)

    this.timers.set(event, timer)
  }

  /**
   * 触发单个事件监听器
   * 
   * @param event - 事件名称
   * @param data - 事件数据
   */
  private triggerListeners(event: string, data: unknown): void {
    const handlers = this.listeners.get(event)
    if (!handlers || handlers.size === 0) {
      return
    }

    for (const handler of handlers) {
      try {
        const result = handler(data)
        if (result instanceof Promise) {
          result.catch(error => {
            console.error(`Error in event handler for "${event}":`, error)
          })
        }
      }
      catch (error) {
        console.error(`Error in event handler for "${event}":`, error)
      }
    }
  }

  /**
   * 触发批量事件监听器
   * 
   * @param event - 事件名称
   * @param batch - 批量事件数据
   */
  private triggerBatchListeners(event: string, batch: BatchEventData): void {
    const handlers = this.batchListeners.get(event)
    if (!handlers || handlers.size === 0) {
      return
    }

    for (const handler of handlers) {
      try {
        const result = handler(batch)
        if (result instanceof Promise) {
          result.catch(error => {
            console.error(`Error in batch event handler for "${event}":`, error)
          })
        }
      }
      catch (error) {
        console.error(`Error in batch event handler for "${event}":`, error)
      }
    }
  }

  /**
   * 清理所有监听器和队列
   */
  clear(): void {
    // 清理所有定时器
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }

    this.listeners.clear()
    this.batchListeners.clear()
    this.queues.clear()
    this.timers.clear()
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    listeners: number
    batchListeners: number
    queuedEvents: number
    activeTimers: number
  } {
    let totalListeners = 0
    for (const handlers of this.listeners.values()) {
      totalListeners += handlers.size
    }

    let totalBatchListeners = 0
    for (const handlers of this.batchListeners.values()) {
      totalBatchListeners += handlers.size
    }

    let totalQueued = 0
    for (const queue of this.queues.values()) {
      totalQueued += queue.length
    }

    return {
      listeners: totalListeners,
      batchListeners: totalBatchListeners,
      queuedEvents: totalQueued,
      activeTimers: this.timers.size,
    }
  }

  /**
   * 更新配置
   * 
   * @param config - 新配置
   */
  updateConfig(config: Partial<ThrottleConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 获取当前配置
   */
  getConfig(): Readonly<Required<ThrottleConfig>> {
    return { ...this.config }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.flushAll()
    this.clear()
  }
}

/**
 * 创建节流事件发射器
 * 
 * @param config - 配置选项
 * @returns 节流事件发射器实例
 */
export function createThrottledEmitter<EventMap extends Record<string, unknown> = Record<string, unknown>>(
  config?: ThrottleConfig,
): ThrottledEventEmitter<EventMap> {
  return new ThrottledEventEmitter<EventMap>(config)
}

/**
 * 简单的事件节流函数
 * 
 * 将函数调用批量处理，减少执行次数
 * 
 * @param fn - 要节流的函数
 * @param options - 节流选项
 * @returns 节流后的函数
 * 
 * @example
 * ```typescript
 * const throttled = throttle(
 *   (items) => ,
 *   { batchSize: 10, flushInterval: 100 }
 * )
 * 
 * // 调用多次，但会批量处理
 * for (let i = 0; i < 100; i++) {
 *   throttled(i)
 * }
 * ```
 */
export function throttle<T>(
  fn: (batch: T[]) => void | Promise<void>,
  options: ThrottleConfig = {},
): (item: T) => void {
  const queue: T[] = []
  let timer: NodeJS.Timeout | null = null
  const batchSize = options.batchSize ?? BATCH_CONFIG.DEFAULT_SIZE
  const flushInterval = options.flushInterval ?? TIME_INTERVALS.EVENT_FLUSH_DEFAULT

  const flush = (): void => {
    if (queue.length === 0) {
      return
    }

    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    const batch = [...queue]
    queue.length = 0

    try {
      const result = fn(batch)
      if (result instanceof Promise) {
        result.catch(error => {
          console.error('Error in throttled function:', error)
        })
      }
    }
    catch (error) {
      console.error('Error in throttled function:', error)
    }
  }

  return (item: T): void => {
    queue.push(item)

    if (queue.length >= batchSize) {
      flush()
    }
    else if (!timer) {
      timer = setTimeout(flush, flushInterval)
    }
  }
}

/**
 * 防抖函数
 * 
 * 在指定时间内只执行一次
 * 
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null

  return (...args: Parameters<T>): void => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}
