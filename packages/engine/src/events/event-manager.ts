import type {
  EngineEventMap,
  EventHandler,
  EventManager,
  Logger,
  EventMap,
} from '../types'

interface EventListener {
  handler: EventHandler
  once: boolean
  priority: number
}

export class EventManagerImpl<TEventMap extends EventMap = EventMap>
  implements EventManager<TEventMap>
{
  private events: Map<string, EventListener[]> = new Map()
  private maxListeners = 50
  private sortedListenersCache: Map<string, EventListener[]> = new Map()
  private eventStats: Map<string, { count: number; lastEmit: number }> =
    new Map()

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
  on(event: any, handler: any, priority = 0): void {
    this.addEventListener(String(event), handler as EventHandler, false, priority)
  }

  // 重载：类型安全事件 + 通用字符串事件
  off<K extends keyof TEventMap>(
    event: K,
    handler?: EventHandler<TEventMap[K]>
  ): void
  off(event: string, handler?: EventHandler): void
  off(event: any, handler?: any): void {
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
  emit(event: any, ...args: any[]): void {
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
        listener.handler(args[0] as any)
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
  once(event: any, handler: any, priority = 0): void {
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

    listeners.push({
      handler,
      once,
      priority,
    })

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

    // 过滤掉需要移除的监听器
    const filteredListeners = listeners.filter(l => !removeSet.has(l.handler))

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

export class EventNamespace {
  constructor(
    private eventManager: EventManager,
    private namespace: string
  ) {}

  private getEventName(event: string): string {
    return `${this.namespace}:${event}`
  }

  on(event: string, handler: EventHandler): void {
    this.eventManager.on(this.getEventName(event), handler)
  }

  off(event: string, handler?: EventHandler): void {
    this.eventManager.off(this.getEventName(event), handler)
  }

  emit(event: string, ...args: unknown[]): void {
    this.eventManager.emit(this.getEventName(event), ...args)
  }

  once(event: string, handler: EventHandler): void {
    this.eventManager.once(this.getEventName(event), handler)
  }
}

export function createEventManager(logger?: Logger): EventManager<EngineEventMap> {
  return new EventManagerImpl<EngineEventMap>(logger)
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
