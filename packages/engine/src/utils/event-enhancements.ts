/**
 * 事件管理器增强工具
 * 🎯 提供异步事件、历史记录、通配符、拦截器等高级特性
 */

import type { EventHandler } from '../types'

import { getLogger } from '../logger/unified-logger'

/**
 * 事件记录
 */
export interface EventRecord {
  event: string
  data: unknown
  timestamp: number
  id: string
}

/**
 * 事件拦截器
 */
export interface EventInterceptor {
  name: string
  priority: number
  intercept: (event: string, data: unknown) => Promise<boolean | { event: string; data: unknown }>
}

/**
 * 异步事件处理器
 */
export type AsyncEventHandler<T = unknown> = (data: T) => Promise<void>

/**
 * 事件历史管理器
 */
export class EventHistory {
  private logger = getLogger('EventHistory')

  private history: EventRecord[] = []
  private maxSize: number
  private idCounter = 0

  constructor(options: { maxSize?: number } = {}) {
    this.maxSize = options.maxSize || 1000
  }

  /**
   * 记录事件
   */
  record(event: string, data: unknown): void {
    const record: EventRecord = {
      event,
      data,
      timestamp: Date.now(),
      id: `${++this.idCounter}_${Date.now()}`,
    }

    this.history.push(record)

    // 超过最大大小时移除最旧的记录
    if (this.history.length > this.maxSize) {
      this.history.shift()
    }
  }

  /**
   * 获取所有历史记录
   */
  getAll(): EventRecord[] {
    return [...this.history]
  }

  /**
   * 按事件名获取历史
   */
  getByEvent(event: string): EventRecord[] {
    return this.history.filter(r => r.event === event)
  }

  /**
   * 按时间范围获取历史
   */
  getByTimeRange(start: number, end: number): EventRecord[] {
    return this.history.filter(r => r.timestamp >= start && r.timestamp <= end)
  }

  /**
   * 获取最近N条记录
   */
  getRecent(count: number): EventRecord[] {
    return this.history.slice(-count)
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.history = []
  }

  /**
   * 导出历史
   */
  export(): string {
    return JSON.stringify(this.history, null, 2)
  }

  /**
   * 导入历史
   */
  import(json: string): void {
    try {
      const data = JSON.parse(json) as EventRecord[]
      this.history = data
    } catch (error) {
      throw new Error(`Failed to import history: ${(error as Error).message}`)
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    byEvent: Record<string, number>
    timeRange: { start: number; end: number } | null
  } {
    const byEvent: Record<string, number> = {}

    for (const record of this.history) {
      byEvent[record.event] = (byEvent[record.event] || 0) + 1
    }

    const timeRange = this.history.length > 0
      ? {
          start: this.history[0].timestamp,
          end: this.history[this.history.length - 1].timestamp,
        }
      : null

    return {
      total: this.history.length,
      byEvent,
      timeRange,
    }
  }
}

/**
 * 事件重放器
 */
export class EventReplayer {
  private playing = false
  private currentIndex = 0

  constructor(
    private history: EventRecord[],
    private emitFn: (event: string, data: unknown) => void
  ) {}

  /**
   * 重放所有事件
   */
  async replayAll(options: { speed?: number; filter?: (record: EventRecord) => boolean } = {}): Promise<void> {
    const { speed = 1, filter } = options
    const records = filter ? this.history.filter(filter) : this.history

    this.playing = true
    this.currentIndex = 0

    for (let i = 0; i < records.length && this.playing; i++) {
      const record = records[i]
      this.emitFn(record.event, record.data)
      this.currentIndex = i + 1

      // 根据实际时间间隔延迟（加速或减速）
      if (i < records.length - 1) {
        const delay = (records[i + 1].timestamp - record.timestamp) / speed
        await this.sleep(Math.max(0, delay))
      }
    }

    this.playing = false
  }

  /**
   * 重放指定范围的事件
   */
  async replayRange(start: number, end: number, speed = 1): Promise<void> {
    const records = this.history.slice(start, end)
    const replayer = new EventReplayer(records, this.emitFn)
    await replayer.replayAll({ speed })
  }

  /**
   * 暂停重放
   */
  pause(): void {
    this.playing = false
  }

  /**
   * 继续重放
   */
  resume(): void {
    this.playing = true
  }

  /**
   * 停止重放
   */
  stop(): void {
    this.playing = false
    this.currentIndex = 0
  }

  /**
   * 是否正在播放
   */
  isPlaying(): boolean {
    return this.playing
  }

  /**
   * 获取当前进度
   */
  getProgress(): number {
    return this.history.length > 0 ? this.currentIndex / this.history.length : 0
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 通配符匹配器
 */
export class WildcardMatcher {
  /**
   * 检查事件名是否匹配模式
   */
  static match(pattern: string, event: string): boolean {
    // 完全匹配
    if (pattern === event) {
      return true
    }

    // 通配符匹配
    if (pattern.includes('*')) {
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`)
      return regex.test(event)
    }

    return false
  }

  /**
   * 从事件列表中查找匹配的事件
   */
  static findMatches(pattern: string, events: string[]): string[] {
    return events.filter(event => this.match(pattern, event))
  }

  /**
   * 检查是否为通配符模式
   */
  static isWildcard(pattern: string): boolean {
    return pattern.includes('*')
  }
}

/**
 * 事件拦截器管理器
 */
export class InterceptorManager {
  private interceptors: EventInterceptor[] = []

  /**
   * 添加拦截器
   */
  add(interceptor: EventInterceptor): void {
    this.interceptors.push(interceptor)
    this.interceptors.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 移除拦截器
   */
  remove(name: string): boolean {
    const index = this.interceptors.findIndex(i => i.name === name)
    if (index > -1) {
      this.interceptors.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 执行拦截
   */
  async intercept(event: string, data: unknown): Promise<{ event: string; data: unknown } | null> {
    let currentEvent = event
    let currentData = data

    for (const interceptor of this.interceptors) {
      try {
        const result = await interceptor.intercept(currentEvent, currentData)

        // 如果返回false，阻止事件
        if (result === false) {
          return null
        }

        // 如果返回对象，更新事件和数据
        if (typeof result === 'object' && result !== null) {
          currentEvent = result.event
          currentData = result.data
        }
      } catch (error) {
        this.logger.error(`Interceptor "${interceptor.name}" error:`, error)
      }
    }

    return { event: currentEvent, data: currentData }
  }

  /**
   * 清空所有拦截器
   */
  clear(): void {
    this.interceptors = []
  }

  /**
   * 获取所有拦截器
   */
  getAll(): EventInterceptor[] {
    return [...this.interceptors]
  }
}

/**
 * 增强型事件管理器
 */
export class EnhancedEventManager {
  private listeners: Map<string, Array<{
    handler: EventHandler | AsyncEventHandler
    once: boolean
    priority: number
    async: boolean
  }>> = new Map()

  private history: EventHistory
  private interceptors = new InterceptorManager()
  private wildcardListeners: Map<string, Array<{
    handler: EventHandler | AsyncEventHandler
    once: boolean
    priority: number
    async: boolean
  }>> = new Map()

  constructor(options: { enableHistory?: boolean; historySize?: number } = {}) {
    this.history = new EventHistory({ maxSize: options.historySize })

    if (options.enableHistory !== false) {
      // 启用历史记录
    }
  }

  /**
   * 添加同步事件监听器
   */
  on(event: string, handler: EventHandler, priority = 0): void {
    this.addListener(event, handler, false, priority, false)
  }

  /**
   * 添加异步事件监听器
   */
  onAsync(event: string, handler: AsyncEventHandler, priority = 0): void {
    this.addListener(event, handler, false, priority, true)
  }

  /**
   * 添加一次性同步监听器
   */
  once(event: string, handler: EventHandler, priority = 0): void {
    this.addListener(event, handler, true, priority, false)
  }

  /**
   * 添加一次性异步监听器
   */
  onceAsync(event: string, handler: AsyncEventHandler, priority = 0): void {
    this.addListener(event, handler, true, priority, true)
  }

  /**
   * 移除监听器
   */
  off(event: string, handler?: EventHandler | AsyncEventHandler): void {
    const isWildcard = WildcardMatcher.isWildcard(event)
    const map = isWildcard ? this.wildcardListeners : this.listeners

    if (!handler) {
      map.delete(event)
      return
    }

    const listeners = map.get(event)
    if (!listeners) return

    const index = listeners.findIndex(l => l.handler === handler)
    if (index > -1) {
      listeners.splice(index, 1)
      if (listeners.length === 0) {
        map.delete(event)
      }
    }
  }

  /**
   * 同步触发事件
   */
  emit(event: string, data?: unknown): void {
    this.history.record(event, data)

    // 拦截器同步处理（简化版）
    const listeners = this.getMatchingListeners(event)

    const listenersToRemove: Array<{ event: string; handler: EventHandler | AsyncEventHandler }> = []

    for (const { listener, matchedEvent } of listeners) {
      if (!listener.async) {
        try {
          (listener.handler as EventHandler)(data)
        } catch (error) {
          this.logger.error(`Error in sync event handler for "${event}":`, error)
        }

        if (listener.once) {
          listenersToRemove.push({ event: matchedEvent, handler: listener.handler })
        }
      }
    }

    // 移除一次性监听器
    for (const { event: evt, handler } of listenersToRemove) {
      this.off(evt, handler)
    }
  }

  /**
   * 异步触发事件
   */
  async emitAsync(event: string, data?: unknown): Promise<void> {
    this.history.record(event, data)

    // 通过拦截器
    const intercepted = await this.interceptors.intercept(event, data)
    if (!intercepted) {
      return // 事件被拦截
    }

    const { event: finalEvent, data: finalData } = intercepted

    const listeners = this.getMatchingListeners(finalEvent)

    const listenersToRemove: Array<{ event: string; handler: EventHandler | AsyncEventHandler }> = []

    // 并行执行所有异步监听器
    await Promise.all(
      listeners.map(async ({ listener, matchedEvent }) => {
        try {
          if (listener.async) {
            await (listener.handler as AsyncEventHandler)(finalData)
          } else {
            (listener.handler as EventHandler)(finalData)
          }

          if (listener.once) {
            listenersToRemove.push({ event: matchedEvent, handler: listener.handler })
          }
        } catch (error) {
          this.logger.error(`Error in async event handler for "${finalEvent}":`, error)
        }
      })
    )

    // 移除一次性监听器
    for (const { event: evt, handler } of listenersToRemove) {
      this.off(evt, handler)
    }
  }

  /**
   * 等待事件发生
   */
  waitFor<T = unknown>(event: string, options: { timeout?: number; filter?: (data: T) => boolean } = {}): Promise<T> {
    const { timeout, filter } = options

    return new Promise<T>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const handler = (data: unknown) => {
        const typedData = data as T

        if (filter && !filter(typedData)) {
          return // 不满足过滤条件，继续等待
        }

        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        this.off(event, handler)
        resolve(typedData)
      }

      this.once(event, handler)

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(event, handler)
          reject(new Error(`Timeout waiting for event "${event}"`))
        }, timeout)
      }
    })
  }

  /**
   * 等待多个事件
   */
  async waitForAll<T = unknown>(events: string[], timeout?: number): Promise<T[]> {
    const promises = events.map(event => this.waitFor<T>(event, { timeout }))
    return Promise.all(promises)
  }

  /**
   * 等待任一事件
   */
  async waitForAny<T = unknown>(events: string[], timeout?: number): Promise<{ event: string; data: T }> {
    return Promise.race(
      events.map(event =>
        this.waitFor<T>(event, { timeout }).then(data => ({ event, data }))
      )
    )
  }

  /**
   * 添加拦截器
   */
  addInterceptor(interceptor: EventInterceptor): void {
    this.interceptors.add(interceptor)
  }

  /**
   * 移除拦截器
   */
  removeInterceptor(name: string): boolean {
    return this.interceptors.remove(name)
  }

  /**
   * 获取历史管理器
   */
  getHistory(): EventHistory {
    return this.history
  }

  /**
   * 创建重放器
   */
  createReplayer(filter?: (record: EventRecord) => boolean): EventReplayer {
    const records = filter ? this.history.getAll().filter(filter) : this.history.getAll()
    return new EventReplayer(records, (event, data) => this.emit(event, data))
  }

  /**
   * 清空所有监听器
   */
  clear(): void {
    this.listeners.clear()
    this.wildcardListeners.clear()
  }

  /**
   * 获取所有事件名
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 获取监听器数量
   */
  getListenerCount(event: string): number {
    const listeners = this.listeners.get(event)
    return listeners ? listeners.length : 0
  }

  /**
   * 添加监听器（内部方法）
   */
  private addListener(
    event: string,
    handler: EventHandler | AsyncEventHandler,
    once: boolean,
    priority: number,
    async: boolean
  ): void {
    const isWildcard = WildcardMatcher.isWildcard(event)
    const map = isWildcard ? this.wildcardListeners : this.listeners

    if (!map.has(event)) {
      map.set(event, [])
    }

    const listeners = map.get(event)!
    listeners.push({ handler, once, priority, async })
    listeners.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 获取匹配的监听器
   */
  private getMatchingListeners(event: string): Array<{
    listener: {
      handler: EventHandler | AsyncEventHandler
      once: boolean
      priority: number
      async: boolean
    }
    matchedEvent: string
  }> {
    const result: Array<{
      listener: {
        handler: EventHandler | AsyncEventHandler
        once: boolean
        priority: number
        async: boolean
      }
      matchedEvent: string
    }> = []

    // 精确匹配
    const exactListeners = this.listeners.get(event)
    if (exactListeners) {
      result.push(...exactListeners.map(listener => ({ listener, matchedEvent: event })))
    }

    // 通配符匹配
    for (const [pattern, listeners] of this.wildcardListeners.entries()) {
      if (WildcardMatcher.match(pattern, event)) {
        result.push(...listeners.map(listener => ({ listener, matchedEvent: pattern })))
      }
    }

    // 按优先级排序
    result.sort((a, b) => b.listener.priority - a.listener.priority)

    return result
  }
}

/**
 * 事件聚合器
 * 将多个事件聚合成一个
 */
export class EventAggregator {
  private buffer: Map<string, unknown[]> = new Map()
  private timer?: NodeJS.Timeout

  constructor(
    private eventManager: EnhancedEventManager,
    private sourceEvents: string[],
    private targetEvent: string,
    private options: {
      bufferTime?: number
      bufferSize?: number
      transform?: (events: Array<{ event: string; data: unknown }>) => unknown
    } = {}
  ) {
    this.setupListeners()
  }

  private setupListeners(): void {
    for (const event of this.sourceEvents) {
      this.eventManager.on(event, data => {
        this.addToBuffer(event, data)
      })
    }
  }

  private addToBuffer(event: string, data: unknown): void {
    if (!this.buffer.has(event)) {
      this.buffer.set(event, [])
    }

    this.buffer.get(event)!.push(data)

    // 检查缓冲区大小
    const totalSize = Array.from(this.buffer.values()).reduce((sum, arr) => sum + arr.length, 0)

    if (this.options.bufferSize && totalSize >= this.options.bufferSize) {
      this.flush()
    } else if (this.options.bufferTime && !this.timer) {
      this.timer = setTimeout(() => {
        this.flush()
      }, this.options.bufferTime)
    }
  }

  private flush(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }

    const events: Array<{ event: string; data: unknown }> = []

    for (const [event, dataArray] of this.buffer.entries()) {
      for (const data of dataArray) {
        events.push({ event, data })
      }
    }

    if (events.length > 0) {
      const transformedData = this.options.transform
        ? this.options.transform(events)
        : events

      this.eventManager.emit(this.targetEvent, transformedData)
      this.buffer.clear()
    }
  }

  /**
   * 停止聚合
   */
  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }

    for (const event of this.sourceEvents) {
      this.eventManager.off(event)
    }

    this.buffer.clear()
  }
}

/**
 * 创建增强型事件管理器
 */
export function createEnhancedEventManager(options?: {
  enableHistory?: boolean
  historySize?: number
}): EnhancedEventManager {
  return new EnhancedEventManager(options)
}
