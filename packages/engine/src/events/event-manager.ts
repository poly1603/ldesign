import type { EngineEventMap, EventHandler, EventManager, Logger } from '../types'

interface EventListener {
  handler: EventHandler
  once: boolean
  priority: number
}

export class EventManagerImpl implements EventManager<EngineEventMap> {
  private events = new Map<string, EventListener[]>()
  private maxListeners = 100

  // 性能优化：缓存排序后的监听器
  private sortedListenersCache = new Map<string, EventListener[]>()

  // 性能优化：事件统计和监控
  private eventStats = new Map<string, { count: number, lastEmit: number }>()

  // 性能优化：批量处理队列
  private eventQueue: Array<{ event: string, args: any[] }> = []
  private processingQueue = false
  private batchSize = 10

  constructor(private logger?: Logger) {
    // 定期清理统计数据，防止内存泄漏
    setInterval(() => this.cleanupStats(), 300000) // 5分钟清理一次
  }

  on(event: any, handler: EventHandler, priority = 0): void {
    this.addEventListener(event, handler, false, priority)
  }

  off(event: any, handler?: EventHandler): void {
    if (!this.events.has(event)) {
      return
    }

    const listeners = this.events.get(event)!

    if (!handler) {
      // 移除所有监听器
      this.events.delete(event)
      return
    }

    // 移除指定监听器
    const index = listeners.findIndex(listener => listener.handler === handler)
    if (index > -1) {
      listeners.splice(index, 1)
      if (listeners.length === 0) {
        this.events.delete(event)
      }
    }
  }

  emit(event: any, ...args: any[]): void {
    // 更新事件统计
    this.updateEventStats(event)

    const listeners = this.events.get(event)
    if (!listeners || listeners.length === 0) {
      return
    }

    // 使用缓存的排序后的监听器，提高性能
    let listenersToExecute = this.sortedListenersCache.get(event)
    if (!listenersToExecute) {
      listenersToExecute = [...listeners].sort(
        (a, b) => b.priority - a.priority,
      )
      this.sortedListenersCache.set(event, listenersToExecute)
    }

    // 性能优化：批量处理一次性监听器的移除
    const onceListenersToRemove: EventListener[] = []

    for (const listener of listenersToExecute) {
      try {
        listener.handler(args[0])
      }
      catch (error) {
        if (this.logger) {
          this.logger.error(`Error in event handler for "${event}":`, error)
        } else {
          console.error(`Error in event handler for "${event}":`, error)
        }
      }

      // 收集需要移除的一次性监听器
      if (listener.once) {
        onceListenersToRemove.push(listener)
      }
    }

    // 批量移除一次性监听器，减少数组操作次数
    if (onceListenersToRemove.length > 0) {
      this.batchRemoveListeners(event, onceListenersToRemove)
    }
  }

  once(event: any, handler: EventHandler, priority = 0): void {
    this.addEventListener(event, handler, true, priority)
  }

  private addEventListener(
    event: string,
    handler: EventHandler,
    once: boolean,
    priority: number,
  ): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }

    const listeners = this.events.get(event)!

    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: Possible EventManager memory leak detected. `
        + `${listeners.length + 1} "${event}" listeners added. `
        + `Use setMaxListeners() to increase limit.`,
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
    }
    else {
      this.events.clear()
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
  private batchRemoveListeners(event: string, listenersToRemove: EventListener[]): void {
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
  getEventStats(): Map<string, { count: number, lastEmit: number }> {
    return new Map(this.eventStats)
  }

  /**
   * 清理所有缓存和统计数据
   */
  cleanup(): void {
    this.sortedListenersCache.clear()
    this.eventStats.clear()
    this.eventQueue.length = 0
  }

  // 在指定事件前添加一次性监听器
  prependOnceListener(
    event: string,
    handler: EventHandler,
    priority = 1000,
  ): void {
    this.addEventListener(event, handler, true, priority)
  }

  // 创建事件命名空间
  namespace(ns: string): EventNamespace {
    return new EventNamespace(this, ns)
  }

  // 获取事件统计信息
  getStats(): {
    totalEvents: number
    totalListeners: number
    events: Record<string, number>
  } {
    const events: Record<string, number> = {}
    let totalListeners = 0

    for (const [event, listeners] of this.events) {
      events[event] = listeners.length
      totalListeners += listeners.length
    }

    return {
      totalEvents: this.events.size,
      totalListeners,
      events,
    }
  }
}

// 事件命名空间类
export class EventNamespace {
  constructor(private eventManager: EventManager, private namespace: string) { }

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

export function createEventManager(logger?: Logger): EventManager {
  return new EventManagerImpl(logger)
}

// 预定义的事件常量
export const ENGINE_EVENTS = {
  // 引擎生命周期事件
  INSTALLED: 'engine:installed',
  MOUNTED: 'engine:mounted',
  UNMOUNTED: 'engine:unmounted',
  DESTROYED: 'engine:destroy',
  ERROR: 'engine:error',

  // 插件事件
  PLUGIN_REGISTERED: 'plugin:registered',
  PLUGIN_UNREGISTERED: 'plugin:unregistered',
  PLUGIN_ERROR: 'plugin:error',

  // 中间件事件
  MIDDLEWARE_ADDED: 'middleware:added',
  MIDDLEWARE_REMOVED: 'middleware:removed',
  MIDDLEWARE_ERROR: 'middleware:error',

  // 状态事件
  STATE_CHANGED: 'state:changed',
  STATE_CLEARED: 'state:cleared',

  // 配置事件
  CONFIG_CHANGED: 'config:changed',

  // 路由事件
  ROUTE_CHANGED: 'route:changed',
  ROUTE_ERROR: 'route:error',

  // 主题事件
  THEME_CHANGED: 'theme:changed',

  // 语言事件
  LOCALE_CHANGED: 'locale:changed',
} as const
