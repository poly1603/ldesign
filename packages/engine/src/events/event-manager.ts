import type {
  EventHandler,
  EventManager,
  EventMap,
  Logger,
} from '../types'

interface EventListener {
  handler: EventHandler
  once: boolean
  priority: number
}

// 事件对象池，用于减少内存分配
class EventObjectPool {
  private pool: EventListener[] = []
  private maxSize = 100

  get(): EventListener {
    return this.pool.pop() || { handler: () => { }, once: false, priority: 0 }
  }

  release(obj: EventListener): void {
    if (this.pool.length < this.maxSize) {
      // 重置对象状态
      obj.handler = () => { }
      obj.once = false
      obj.priority = 0
      this.pool.push(obj)
    }
  }

  clear(): void {
    this.pool.length = 0
  }
}

export class EventManagerImpl<TEventMap extends EventMap = EventMap>
  implements EventManager<TEventMap> {
  private events: Map<string, EventListener[]> = new Map()
  private maxListeners = 50
  private sortedListenersCache: Map<string, EventListener[]> = new Map()
  private eventStats: Map<string, { count: number; lastEmit: number }> =
    new Map()
  private eventPool = new EventObjectPool() // 事件对象池

  constructor(private logger?: Logger) {
    // 定期清理统计数据，防止内存泄漏
    setInterval(() => this.cleanupStats(), 300000) // 5分钟清理一次
  }

  // 重载：类型安全事件 + 通用字符串事件
  on<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>
  ): void
  on<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>,
    priority: number
  ): void
  on(event: string, handler: EventHandler): void
  on(event: string, handler: EventHandler, priority: number): void
  on(event: unknown, handler: unknown, priority = 0): void {
    this.addEventListener(String(event), handler as EventHandler, false, priority)
  }

  // 重载：类型安全事件 + 通用字符串事件
  off<K extends keyof TEventMap>(
    event: K,
    handler?: EventHandler<TEventMap[K]>
  ): void
  off(event: string, handler?: EventHandler): void
  off(event: unknown, handler?: unknown): void {
    const key = String(event)
    if (!this.events.has(key)) {
      return
    }

    const listeners = this.events.get(key)!

    if (!handler) {
      // 移除所有监听器
      this.events.delete(key)
      this.sortedListenersCache.delete(key)
      return
    }

    // 移除指定监听器
    const index = listeners.findIndex(listener => listener.handler === handler)
    if (index > -1) {
      listeners.splice(index, 1)
      if (listeners.length === 0) {
        this.events.delete(key)
        this.sortedListenersCache.delete(key)
      } else {
        this.sortedListenersCache.delete(key)
      }
    }
  }

  // 重载：类型安全事件 + 通用字符串事件
  emit<K extends keyof TEventMap>(event: K, data: TEventMap[K]): void
  emit(event: string, ...args: unknown[]): void
  emit(event: unknown, ...args: unknown[]): void {
    const key = String(event)
    // 更新事件统计
    this.updateEventStats(key)

    const listeners = this.events.get(key)
    if (!listeners || listeners.length === 0) {
      return
    }

    // 使用缓存的排序后的监听器，提高性能
    let listenersToExecute = this.sortedListenersCache.get(key)
    if (!listenersToExecute) {
      listenersToExecute = [...listeners].sort(
        (a, b) => b.priority - a.priority
      )
      this.sortedListenersCache.set(key, listenersToExecute)
    }

    // 性能优化：批量处理一次性监听器的移除
    const onceListenersToRemove: EventListener[] = []

    for (const listener of listenersToExecute) {
      try {
        listener.handler(args[0] as unknown)
      } catch (error) {
        if (this.logger) {
          this.logger.error(`Error in event handler for "${key}":`, error)
        } else {
          console.error(`Error in event handler for "${key}":`, error)
        }
      }

      // 收集需要移除的一次性监听器
      if (listener.once) {
        onceListenersToRemove.push(listener)
      }
    }

    // 批量移除一次性监听器，减少数组操作次数
    if (onceListenersToRemove.length > 0) {
      this.batchRemoveListeners(key, onceListenersToRemove)
    }
  }

  // 重载：类型安全事件 + 通用字符串事件
  once<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>
  ): void
  once<K extends keyof TEventMap>(
    event: K,
    handler: EventHandler<TEventMap[K]>,
    priority: number
  ): void
  once(event: string, handler: EventHandler): void
  once(event: string, handler: EventHandler, priority: number): void
  once(event: unknown, handler: unknown, priority = 0): void {
    this.addEventListener(String(event), handler as EventHandler, true, priority)
  }

  private addEventListener(
    event: string,
    handler: EventHandler,
    once: boolean,
    priority: number
  ): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }

    const listeners = this.events.get(event)!

    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: Possible EventManager memory leak detected. ` +
        `${listeners.length + 1} "${event}" listeners added. ` +
        `Use setMaxListeners() to increase limit.`
      )
    }

    // 使用对象池来减少内存分配
    const listener = this.eventPool.get()
    listener.handler = handler
    listener.once = once
    listener.priority = priority

    listeners.push(listener)

    // 清除该事件的缓存
    this.sortedListenersCache.delete(event)
  }

  // 获取事件的监听器数量
  listenerCount(event: string): number {
    const listeners = this.events.get(event)
    return listeners ? listeners.length : 0
  }

  // 获取所有事件名称
  eventNames(): string[] {
    return Array.from(this.events.keys())
  }

  // 获取指定事件的所有监听器
  listeners(event: string): EventHandler[] {
    const listeners = this.events.get(event)
    return listeners ? listeners.map(l => l.handler) : []
  }

  // 设置最大监听器数量
  setMaxListeners(n: number): void {
    this.maxListeners = n
  }

  // 获取最大监听器数量
  getMaxListeners(): number {
    return this.maxListeners
  }

  // 移除所有监听器
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event)
      this.sortedListenersCache.delete(event)
    } else {
      this.events.clear()
      this.sortedListenersCache.clear()
    }
  }

  // 在指定事件前添加监听器
  prependListener(event: string, handler: EventHandler, priority = 1000): void {
    this.addEventListener(event, handler, false, priority)
  }

  /**
   * 性能优化：更新事件统计
   */
  private updateEventStats(event: string): void {
    const stats = this.eventStats.get(event)
    const now = Date.now()

    if (stats) {
      stats.count++
      stats.lastEmit = now
    } else {
      this.eventStats.set(event, { count: 1, lastEmit: now })
    }
  }

  /**
   * 性能优化：批量移除监听器
   */
  private batchRemoveListeners(
    event: string,
    listenersToRemove: EventListener[]
  ): void {
    const listeners = this.events.get(event)
    if (!listeners) return

    // 使用 Set 提高查找性能
    const removeSet = new Set(listenersToRemove.map(l => l.handler))

    // 过滤掉需要移除的监听器，并释放到对象池
    const filteredListeners = listeners.filter(l => {
      if (removeSet.has(l.handler)) {
        // 释放监听器对象到池中
        this.eventPool.release(l)
        return false
      }
      return true
    })

    if (filteredListeners.length === 0) {
      this.events.delete(event)
      this.sortedListenersCache.delete(event)
    } else {
      this.events.set(event, filteredListeners)
      this.sortedListenersCache.delete(event) // 清除缓存
    }
  }

  /**
   * 性能优化：清理过期的统计数据
   */
  private cleanupStats(): void {
    const now = Date.now()
    const maxAge = 600000 // 10分钟

    for (const [event, stats] of this.eventStats.entries()) {
      if (now - stats.lastEmit > maxAge) {
        this.eventStats.delete(event)
      }
    }
  }

  /**
   * 获取事件统计信息
   */
  getEventStats(): Map<string, { count: number; lastEmit: number }> {
    return new Map(this.eventStats)
  }

  /**
   * 清理所有资源
   */
  cleanup(): void {
    this.events.clear()
    this.sortedListenersCache.clear()
    this.eventStats.clear()
  }

  prependOnceListener(
    event: string,
    handler: EventHandler,
    priority = 1000
  ): void {
    this.addEventListener(event, handler, true, priority)
  }

  namespace(ns: string): EventNamespace {
    return new EventNamespace(this, ns)
  }

  /**
   * 新增：批量事件操作
   * 一次性添加多个事件监听器
   */
  addListeners(listeners: Array<{
    event: string
    handler: EventHandler
    options?: { once?: boolean; priority?: number }
  }>): void {
    for (const { event, handler, options } of listeners) {
      this.addEventListener(event, handler, !!options?.once, options?.priority ?? 0)
    }
  }

  /**
   * 新增：事件管道
   * 支持事件的链式处理
   */
  pipe(sourceEvent: string, targetEvent: string, transform?: (data: unknown) => unknown): void {
    this.on(sourceEvent, (data) => {
      const transformedData = transform ? transform(data) : data
      this.emit(targetEvent, transformedData)
    })
  }

  /**
   * 新增：条件事件监听
   * 只有满足条件时才触发监听器
   */
  onWhen(
    event: string,
    condition: (data: unknown) => boolean,
    handler: EventHandler,
    options?: { once?: boolean; priority?: number }
  ): void {
    this.addEventListener(event, (data) => {
      if (condition(data)) {
        handler(data)
      }
    }, !!options?.once, options?.priority ?? 0)
  }

  /**
   * 新增：事件防抖
   * 在指定时间内只触发一次事件
   */
  debounce(event: string, delay: number = 300): EventDebouncer {
    return new EventDebouncer(this, event, delay)
  }

  /**
   * 新增：事件节流
   * 在指定时间间隔内最多触发一次事件
   */
  throttle(event: string, interval: number = 300): EventThrottler {
    return new EventThrottler(this, event, interval)
  }

  getStats(): {
    totalEvents: number
    totalListeners: number
    events: Record<string, number>
  } {
    const stats: Record<string, number> = {}
    let totalListeners = 0

    for (const [event, listeners] of this.events.entries()) {
      stats[event] = listeners.length
      totalListeners += listeners.length
    }

    return {
      totalEvents: this.events.size,
      totalListeners,
      events: stats,
    }
  }
}



export const ENGINE_EVENTS = {
  CREATED: 'engine:created',
  INSTALLED: 'engine:installed',
  MOUNTED: 'engine:mounted',
  UNMOUNTED: 'engine:unmounted',
  DESTROYED: 'engine:destroy',
  ERROR: 'engine:error',

  PLUGIN_REGISTERED: 'plugin:registered',
  PLUGIN_UNREGISTERED: 'plugin:unregistered',
  PLUGIN_ERROR: 'plugin:error',

  MIDDLEWARE_ADDED: 'middleware:added',
  MIDDLEWARE_REMOVED: 'middleware:removed',
  MIDDLEWARE_ERROR: 'middleware:error',

  STATE_CHANGED: 'state:changed',
  STATE_CLEARED: 'state:cleared',

  CONFIG_CHANGED: 'config:changed',

  ROUTE_CHANGED: 'route:changed',
  ROUTE_ERROR: 'route:error',

  THEME_CHANGED: 'theme:changed',

  LOCALE_CHANGED: 'locale:changed',
} as const

/**
 * 事件命名空间类 - 功能增强
 * 提供命名空间隔离的事件管理
 */
export class EventNamespace {
  constructor(
    private eventManager: EventManagerImpl,
    private namespace: string
  ) { }

  private getNamespacedEvent(event: string): string {
    return `${this.namespace}:${event}`
  }

  on(event: string, handler: EventHandler, priority?: number): void {
    this.eventManager.on(this.getNamespacedEvent(event), handler, priority ?? 0)
  }

  once(event: string, handler: EventHandler, priority?: number): void {
    this.eventManager.once(this.getNamespacedEvent(event), handler, priority ?? 0)
  }

  emit(event: string, data?: unknown): void {
    this.eventManager.emit(this.getNamespacedEvent(event), data)
  }

  off(event: string, handler?: EventHandler): void {
    this.eventManager.off(this.getNamespacedEvent(event), handler)
  }

  clear(): void {
    // 清理该命名空间下的所有事件
    const namespacedPrefix = `${this.namespace}:`
    const eventsToRemove: string[] = []

    for (const event of this.eventManager.eventNames()) {
      if (event.startsWith(namespacedPrefix)) {
        eventsToRemove.push(event)
      }
    }

    for (const event of eventsToRemove) {
      this.eventManager.removeAllListeners(event)
    }
  }
}

/**
 * 事件防抖器类 - 功能增强
 */
export class EventDebouncer {
  private timeoutId?: NodeJS.Timeout
  private lastArgs?: unknown

  constructor(
    private eventManager: EventManagerImpl,
    private event: string,
    private delay: number
  ) { }

  emit(data?: unknown): void {
    this.lastArgs = data

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      this.eventManager.emit(this.event, this.lastArgs)
      this.timeoutId = undefined
    }, this.delay)
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.eventManager.emit(this.event, this.lastArgs)
      this.timeoutId = undefined
    }
  }
}

/**
 * 事件节流器类 - 功能增强
 */
export class EventThrottler {
  private lastEmitTime = 0
  private timeoutId?: NodeJS.Timeout
  private lastArgs?: unknown

  constructor(
    private eventManager: EventManagerImpl,
    private event: string,
    private interval: number
  ) { }

  emit(data?: unknown): void {
    const now = Date.now()
    this.lastArgs = data

    if (now - this.lastEmitTime >= this.interval) {
      this.eventManager.emit(this.event, data)
      this.lastEmitTime = now
    } else if (!this.timeoutId) {
      // 设置延迟触发，确保最后一次调用会被执行
      const remainingTime = this.interval - (now - this.lastEmitTime)
      this.timeoutId = setTimeout(() => {
        this.eventManager.emit(this.event, this.lastArgs)
        this.lastEmitTime = Date.now()
        this.timeoutId = undefined
      }, remainingTime)
    }
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }
}

export function createEventManager<TEventMap extends EventMap = EventMap>(
  logger?: Logger
): EventManager<TEventMap> {
  return new EventManagerImpl<TEventMap>(logger)
}
