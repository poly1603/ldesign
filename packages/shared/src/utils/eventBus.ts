/**
 * 事件总线工具
 */

/**
 * 事件监听器类型
 */
export type EventListener<T = any> = (data: T) => void

/**
 * 事件监听器配置
 */
export interface EventListenerOptions {
  /** 是否只执行一次 */
  once?: boolean
  /** 优先级，数字越大优先级越高 */
  priority?: number
  /** 是否在捕获阶段执行 */
  capture?: boolean
}

/**
 * 内部事件监听器接口
 */
interface InternalEventListener<T = any> extends EventListenerOptions {
  listener: EventListener<T>
  id: string
}

/**
 * 事件总线类
 */
export class EventBus {
  private events = new Map<string, InternalEventListener[]>()
  private listenerIdCounter = 0

  /**
   * 监听事件
   */
  on<T = any>(
    event: string,
    listener: EventListener<T>,
    options: EventListenerOptions = {}
  ): () => void {
    const id = `listener_${++this.listenerIdCounter}`
    const internalListener: InternalEventListener<T> = {
      listener,
      id,
      once: false,
      priority: 0,
      capture: false,
      ...options,
    }

    if (!this.events.has(event)) {
      this.events.set(event, [])
    }

    const listeners = this.events.get(event)!
    listeners.push(internalListener)

    // 按优先级排序
    listeners.sort((a, b) => (b.priority || 0) - (a.priority || 0))

    // 返回取消监听的函数
    return () => this.off(event, id)
  }

  /**
   * 监听事件（只执行一次）
   */
  once<T = any>(event: string, listener: EventListener<T>): () => void {
    return this.on(event, listener, { once: true })
  }

  /**
   * 取消监听事件
   */
  off(event: string, listenerOrId?: EventListener | string): void {
    const listeners = this.events.get(event)
    if (!listeners) return

    if (!listenerOrId) {
      // 移除所有监听器
      this.events.delete(event)
      return
    }

    const filteredListeners = listeners.filter(item => {
      if (typeof listenerOrId === 'string') {
        return item.id !== listenerOrId
      }
      return item.listener !== listenerOrId
    })

    if (filteredListeners.length === 0) {
      this.events.delete(event)
    } else {
      this.events.set(event, filteredListeners)
    }
  }

  /**
   * 触发事件
   */
  emit<T = any>(event: string, data?: T): void {
    const listeners = this.events.get(event)
    if (!listeners || listeners.length === 0) return

    // 复制监听器数组，避免在执行过程中被修改
    const listenersToExecute = [...listeners]
    const onceListeners: string[] = []

    for (const item of listenersToExecute) {
      try {
        item.listener(data)
        
        if (item.once) {
          onceListeners.push(item.id)
        }
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error)
      }
    }

    // 移除一次性监听器
    onceListeners.forEach(id => this.off(event, id))
  }

  /**
   * 异步触发事件
   */
  async emitAsync<T = any>(event: string, data?: T): Promise<void> {
    const listeners = this.events.get(event)
    if (!listeners || listeners.length === 0) return

    const listenersToExecute = [...listeners]
    const onceListeners: string[] = []

    for (const item of listenersToExecute) {
      try {
        await Promise.resolve(item.listener(data))
        
        if (item.once) {
          onceListeners.push(item.id)
        }
      } catch (error) {
        console.error(`Error in async event listener for "${event}":`, error)
      }
    }

    // 移除一次性监听器
    onceListeners.forEach(id => this.off(event, id))
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: string): number {
    const listeners = this.events.get(event)
    return listeners ? listeners.length : 0
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys())
  }

  /**
   * 清空所有事件监听器
   */
  clear(): void {
    this.events.clear()
  }

  /**
   * 清空指定事件的所有监听器
   */
  clearEvent(event: string): void {
    this.events.delete(event)
  }

  /**
   * 检查是否有指定事件的监听器
   */
  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0
  }

  /**
   * 获取事件总线状态
   */
  getStats(): {
    eventCount: number
    totalListeners: number
    events: Record<string, number>
  } {
    const events: Record<string, number> = {}
    let totalListeners = 0

    for (const [event, listeners] of this.events.entries()) {
      events[event] = listeners.length
      totalListeners += listeners.length
    }

    return {
      eventCount: this.events.size,
      totalListeners,
      events,
    }
  }
}

/**
 * 类型安全的事件总线
 */
export class TypedEventBus<EventMap extends Record<string, any> = Record<string, any>> {
  private eventBus = new EventBus()

  /**
   * 监听事件
   */
  on<K extends keyof EventMap>(
    event: K,
    listener: EventListener<EventMap[K]>,
    options?: EventListenerOptions
  ): () => void {
    return this.eventBus.on(event as string, listener, options)
  }

  /**
   * 监听事件（只执行一次）
   */
  once<K extends keyof EventMap>(
    event: K,
    listener: EventListener<EventMap[K]>
  ): () => void {
    return this.eventBus.once(event as string, listener)
  }

  /**
   * 取消监听事件
   */
  off<K extends keyof EventMap>(
    event: K,
    listenerOrId?: EventListener<EventMap[K]> | string
  ): void {
    this.eventBus.off(event as string, listenerOrId)
  }

  /**
   * 触发事件
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.eventBus.emit(event as string, data)
  }

  /**
   * 异步触发事件
   */
  async emitAsync<K extends keyof EventMap>(event: K, data: EventMap[K]): Promise<void> {
    return this.eventBus.emitAsync(event as string, data)
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount<K extends keyof EventMap>(event: K): number {
    return this.eventBus.listenerCount(event as string)
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): (keyof EventMap)[] {
    return this.eventBus.eventNames()
  }

  /**
   * 清空所有事件监听器
   */
  clear(): void {
    this.eventBus.clear()
  }

  /**
   * 清空指定事件的所有监听器
   */
  clearEvent<K extends keyof EventMap>(event: K): void {
    this.eventBus.clearEvent(event as string)
  }

  /**
   * 检查是否有指定事件的监听器
   */
  hasListeners<K extends keyof EventMap>(event: K): boolean {
    return this.eventBus.hasListeners(event as string)
  }

  /**
   * 获取事件总线状态
   */
  getStats() {
    return this.eventBus.getStats()
  }
}

/**
 * 默认事件总线实例
 */
export const eventBus = new EventBus()

/**
 * 创建事件总线实例
 */
export function createEventBus(): EventBus {
  return new EventBus()
}

/**
 * 创建类型安全的事件总线实例
 */
export function createTypedEventBus<EventMap extends Record<string, any>>(): TypedEventBus<EventMap> {
  return new TypedEventBus<EventMap>()
}

/**
 * 事件总线装饰器
 */
export function eventListener<T = any>(
  event: string,
  options?: EventListenerOptions
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    // 在组件挂载时自动注册监听器
    const originalMounted = target.mounted || (() => {})
    target.mounted = function () {
      const unsubscribe = eventBus.on(event, originalMethod.bind(this), options)
      
      // 保存取消监听的函数
      if (!this._eventUnsubscribers) {
        this._eventUnsubscribers = []
      }
      this._eventUnsubscribers.push(unsubscribe)
      
      originalMounted.call(this)
    }

    // 在组件卸载时自动取消监听
    const originalUnmounted = target.unmounted || (() => {})
    target.unmounted = function () {
      if (this._eventUnsubscribers) {
        this._eventUnsubscribers.forEach((unsubscribe: () => void) => unsubscribe())
        this._eventUnsubscribers = []
      }
      
      originalUnmounted.call(this)
    }

    return descriptor
  }
}
