/**
 * 事件管理器
 */

import type {
  EventConfig,
  EventFilter,
  EventListener,
  EventMiddleware,
  EventStats,
  EventManager as IEventManager,
  WatermarkEvent,
  WatermarkEventType,
} from '../types'

import {
  ErrorSeverity,
  WatermarkError,
  WatermarkErrorCode,
} from '../types/error'
import { DEFAULT_EVENT_CONFIG } from '../types/events'
// import { generateId } from '../utils/id-generator'

/**
 * 事件管理器
 * 负责事件的注册、触发、过滤和统计
 */
export class EventManager implements IEventManager {
  private listeners = new Map<WatermarkEventType, Set<EventListener<any>>>()
  private filters = new Map<string, EventFilter>()
  private middlewares: EventMiddleware[] = []
  private config: EventConfig
  private stats: EventStats = {
    totalEvents: 0,
    eventCounts: {} as Record<WatermarkEventType, number>,
    listenerCounts: {} as Record<WatermarkEventType, number>,
    avgHandlingTime: 0,
    errorCount: 0,
    lastEventTime: 0,
  }

  private eventHistory: WatermarkEvent[] = []
  private processingTimes: number[] = []
  private initialized = false

  constructor(config: Partial<EventConfig> = {}) {
    this.config = { ...DEFAULT_EVENT_CONFIG, ...config }
  }

  /**
   * 初始化事件管理器
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    // 设置默认中间件
    if (this.config.logEvents) {
      this.addMiddleware(this.createLoggingMiddleware())
    }

    // 总是启用错误处理中间件
    this.addMiddleware(this.createErrorHandlingMiddleware())

    // 总是启用性能跟踪中间件
    this.addMiddleware(this.createPerformanceMiddleware())

    this.initialized = true
  }

  /**
   * 添加事件监听器
   */
  on<T extends WatermarkEvent>(
    type: WatermarkEventType,
    listener: EventListener<T>
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }

    this.listeners.get(type)!.add(listener)
    this.updateStats()
  }

  /**
   * 添加一次性事件监听器
   */
  once<T extends WatermarkEvent>(
    type: WatermarkEventType,
    listener: EventListener<T>
  ): void {
    const onceListener = async (event: T) => {
      await listener(event)
      this.off(type, onceListener)
    }
    this.on(type, onceListener)
  }

  /**
   * 移除事件监听器
   */
  off<T extends WatermarkEvent>(
    type: WatermarkEventType,
    listener: EventListener<T>
  ): void {
    const listeners = this.listeners.get(type)
    if (!listeners) {
      return
    }

    listeners.delete(listener)
    if (listeners.size === 0) {
      this.listeners.delete(type)
    }

    this.updateStats()
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(type?: WatermarkEventType): void {
    if (type) {
      this.listeners.delete(type)
    } else {
      this.listeners.clear()
    }
    this.updateStats()
  }

  /**
   * 获取监听器数量
   */
  listenerCount(type: WatermarkEventType): number {
    const listeners = this.listeners.get(type)
    return listeners ? listeners.size : 0
  }

  /**
   * 获取所有事件类型
   */
  eventNames(): WatermarkEventType[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(n: number): void {
    // 实现最大监听器数量限制
    this.config.maxListeners = n
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.config.maxListeners || 10
  }

  /**
   * 触发事件
   */
  async emit<T extends WatermarkEvent>(event: T): Promise<void> {
    const startTime = performance.now()

    try {
      // 应用过滤器
      if (!this.shouldProcessEvent(event)) {
        return
      }

      // 应用中间件
      const processedEvent = event
      for (const middleware of this.middlewares) {
        try {
          if (middleware.enabled !== false) {
            await middleware.handle(processedEvent, async () => {
              // 继续处理下一个中间件
            })
          }
        } catch (error) {
          console.warn('Event middleware error:', error)
          // 继续处理其他中间件
        }
      }

      // 获取监听器
      const listeners = this.listeners.get(event.type)
      if (!listeners || listeners.size === 0) {
        return
      }

      // 并发或串行执行监听器
      const listenerArray = Array.from(listeners)

      if (this.config.asyncHandling) {
        // 并发执行
        const promises = listenerArray.map(listener =>
          this.executeListener(listener, processedEvent)
        )
        await Promise.allSettled(promises)
      } else {
        // 串行执行
        for (const listener of listenerArray) {
          await this.executeListener(listener, processedEvent)
        }
      }

      // 更新统计
      this.updateEventStats(event, startTime)

      // 保存到历史记录
      if (this.config.maxHistorySize && this.config.maxHistorySize > 0) {
        this.addToHistory(processedEvent)
      }
    } catch (error) {
      const watermarkError = new WatermarkError(
        'Failed to emit event',
        WatermarkErrorCode.EVENT_EMISSION_FAILED,
        ErrorSeverity.MEDIUM
      )

      console.error('Event emission error:', watermarkError)
    }
  }

  /**
   * 添加事件过滤器
   */
  addFilter(name: string, filter: EventFilter): void {
    this.filters.set(name, filter)
    this.updateStats()
  }

  /**
   * 移除事件过滤器
   */
  removeFilter(name: string): boolean {
    const removed = this.filters.delete(name)
    this.updateStats()
    return removed
  }

  /**
   * 添加中间件
   */
  addMiddleware(middleware: EventMiddleware): void {
    this.middlewares.push(middleware)
    this.updateStats()
  }

  /**
   * 移除中间件
   */
  removeMiddleware(middleware: EventMiddleware): boolean {
    const index = this.middlewares.indexOf(middleware)
    if (index === -1) {
      return false
    }

    this.middlewares.splice(index, 1)
    this.updateStats()
    return true
  }

  /**
   * 获取统计信息
   */
  getStats(): EventStats {
    return { ...this.stats }
  }

  /**
   * 获取事件历史
   */
  getHistory(limit?: number): WatermarkEvent[] {
    if (limit) {
      return this.eventHistory.slice(-limit)
    }
    return [...this.eventHistory]
  }

  /**
   * 清空事件历史
   */
  clearHistory(): void {
    this.eventHistory = []
  }

  /**
   * 获取指定类型的监听器数量
   */
  getListenerCount(type: WatermarkEventType): number {
    const listeners = this.listeners.get(type)
    return listeners ? listeners.size : 0
  }

  /**
   * 检查是否有指定类型的监听器
   */
  hasListeners(type: WatermarkEventType): boolean {
    return this.getListenerCount(type) > 0
  }

  /**
   * 获取所有事件类型
   */
  getEventTypes(): WatermarkEventType[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 等待指定事件
   */
  waitFor<T extends WatermarkEvent>(
    type: WatermarkEventType,
    timeout?: number,
    filter?: (event: T) => boolean
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const listener: EventListener<T> = event => {
        if (filter && !filter(event)) {
          return
        }

        this.off(type, listener)
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        resolve(event)
      }

      this.on(type, listener)

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(type, listener)
          reject(new Error(`Timeout waiting for event: ${type}`))
        }, timeout)
      }
    })
  }

  /**
   * 批量触发事件
   */
  async emitBatch(events: WatermarkEvent[]): Promise<void> {
    if (this.config.asyncHandling) {
      const promises = events.map(event => this.emit(event))
      await Promise.allSettled(promises)
    } else {
      for (const event of events) {
        await this.emit(event)
      }
    }
  }

  /**
   * 销毁事件管理器
   */
  async dispose(): Promise<void> {
    this.listeners.clear()
    this.filters.clear()
    this.middlewares = []
    this.eventHistory = []
    this.processingTimes = []
    this.initialized = false
  }

  // 私有方法

  private shouldProcessEvent(event: WatermarkEvent): boolean {
    for (const filter of this.filters.values()) {
      if (!filter(event)) {
        return false
      }
    }
    return true
  }

  private async executeListener(
    listener: EventListener<any>,
    event: WatermarkEvent
  ): Promise<void> {
    try {
      await listener(event)
    } catch (error) {
      const watermarkError = new WatermarkError(
        'Event listener execution failed',
        WatermarkErrorCode.EVENT_LISTENER_ERROR,
        ErrorSeverity.LOW
      )

      console.error('Event listener error:', watermarkError)
    }
  }

  private updateEventStats(event: WatermarkEvent, startTime: number): void {
    const processingTime = performance.now() - startTime

    this.stats.totalEvents++
    this.stats.lastEventTime = event.timestamp

    // 更新按类型统计
    const typeCount = this.stats.eventCounts[event.type] || 0
    this.stats.eventCounts[event.type] = typeCount + 1

    // 更新平均处理时间
    this.processingTimes.push(processingTime)
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift()
    }

    this.stats.avgHandlingTime =
      this.processingTimes.reduce((sum, time) => sum + time, 0) /
      this.processingTimes.length
  }

  private updateStats(): void {
    // 更新监听器统计
    for (const [eventType, listeners] of this.listeners.entries()) {
      this.stats.listenerCounts[eventType] = listeners.size
    }
  }

  private addToHistory(event: WatermarkEvent): void {
    this.eventHistory.push(event)

    // 限制历史记录大小
    if (
      this.config.maxHistorySize &&
      this.eventHistory.length > this.config.maxHistorySize
    ) {
      this.eventHistory.shift()
    }
  }

  private createLoggingMiddleware(): EventMiddleware {
    return {
      name: 'logging',
      handle: async (event, next) => {
        console.log(`[WatermarkEvent] ${event.type}:`, event)
        await next()
      },
    }
  }

  private createErrorHandlingMiddleware(): EventMiddleware {
    return {
      name: 'error-handling',
      handle: async (_event, next) => {
        try {
          await next()
        } catch (error) {
          console.error('Event processing error:', error)
          this.stats.errorCount++
        }
      },
    }
  }

  private createPerformanceMiddleware(): EventMiddleware {
    return {
      name: 'performance',
      handle: async (event, next) => {
        const startTime = performance.now()

        await next()

        const endTime = performance.now()
        console.debug(
          `Event ${event.type} processing time: ${endTime - startTime}ms`
        )
      },
    }
  }
}
