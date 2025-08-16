import type { EventHandler, EventManager, Logger } from '../types'

interface EventListener {
  handler: EventHandler
  once: boolean
  priority: number
}

export class EventManagerImpl implements EventManager {
  private events = new Map<string, EventListener[]>()
  private maxListeners = 100

  // 性能优化：缓存排序后的监听器
  private sortedListenersCache = new Map<string, EventListener[]>()

  constructor(_logger?: Logger) {
    // logger参数保留用于未来扩展
  }

  on(event: string, handler: EventHandler, priority = 0): void {
    this.addEventListener(event, handler, false, priority)
  }

  off(event: string, handler?: EventHandler): void {
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

  emit(event: string, ...args: unknown[]): void {
    const listeners = this.events.get(event)
    if (!listeners || listeners.length === 0) {
      return
    }

    // 使用缓存的排序后的监听器，提高性能
    let listenersToExecute = this.sortedListenersCache.get(event)
    if (!listenersToExecute) {
      listenersToExecute = [...listeners].sort(
        (a, b) => b.priority - a.priority
      )
      this.sortedListenersCache.set(event, listenersToExecute)
    }

    for (const listener of listenersToExecute) {
      try {
        listener.handler(...args)
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error)
      }

      // 如果是一次性监听器，执行后移除
      if (listener.once) {
        this.off(event, listener.handler)
      }
    }
  }

  once(event: string, handler: EventHandler, priority = 0): void {
    this.addEventListener(event, handler, true, priority)
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
    } else {
      this.events.clear()
    }
  }

  // 在指定事件前添加监听器
  prependListener(event: string, handler: EventHandler, priority = 1000): void {
    this.addEventListener(event, handler, false, priority)
  }

  // 在指定事件前添加一次性监听器
  prependOnceListener(
    event: string,
    handler: EventHandler,
    priority = 1000
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
  constructor(private eventManager: EventManager, private namespace: string) {}

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
