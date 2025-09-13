/**
 * 事件处理工具函数
 * 提供事件发射器、事件总线等功能
 */

import type {
  EventListener,
  EventListenerOptions,
  AdvancedEventListenerOptions,
  BaseEvent,
  IEventEmitter,
  IEventBus,
  EventMiddleware,
  EventFilter,
  EventTransformer
} from '../types/events'

/**
 * 创建基础事件对象
 */
export function createEvent(type: string, target?: any, data?: any): BaseEvent {
  return {
    type,
    target,
    timestamp: Date.now(),
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault() {
      this.defaultPrevented = true
    },
    stopPropagation() {
      this.propagationStopped = true
    }
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }) as T
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let lastCall = 0

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return func.apply(this, args)
    }
  }) as T
}

/**
 * 事件发射器实现
 */
export class EventEmitter implements IEventEmitter {
  private listeners = new Map<string, Set<EventListener>>()
  private onceListeners = new Map<string, Set<EventListener>>()
  private maxListeners = 10

  /**
   * 添加事件监听器
   */
  on<T = any>(
    event: string,
    listener: EventListener<T>,
    options?: EventListenerOptions
  ): void {
    if (options?.once) {
      this.once(event, listener, options)
      return
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const listeners = this.listeners.get(event)!

    // 检查监听器数量限制
    if (listeners.size >= this.maxListeners) {
      console.warn(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${listeners.size + 1} ${event} listeners added.`)
    }

    listeners.add(listener)
  }

  /**
   * 添加一次性事件监听器
   */
  once<T = any>(
    event: string,
    listener: EventListener<T>,
    options?: EventListenerOptions
  ): void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }

    this.onceListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   */
  off<T = any>(event: string, listener?: EventListener<T>): void {
    if (!listener) {
      // 移除所有监听器
      this.listeners.delete(event)
      this.onceListeners.delete(event)
      return
    }

    // 移除普通监听器
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(event)
      }
    }

    // 移除一次性监听器
    const onceListeners = this.onceListeners.get(event)
    if (onceListeners) {
      onceListeners.delete(listener)
      if (onceListeners.size === 0) {
        this.onceListeners.delete(event)
      }
    }
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    } else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }

  /**
   * 触发事件
   */
  emit<T = any>(event: string, data?: T): boolean {
    let hasListeners = false

    // 触发普通监听器
    const listeners = this.listeners.get(event)
    if (listeners && listeners.size > 0) {
      hasListeners = true
      const eventObj = createEvent(event, this, data)

      for (const listener of listeners) {
        try {
          listener(eventObj)
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error)
        }

        if (eventObj.propagationStopped) {
          break
        }
      }
    }

    // 触发一次性监听器
    const onceListeners = this.onceListeners.get(event)
    if (onceListeners && onceListeners.size > 0) {
      hasListeners = true
      const eventObj = createEvent(event, this, data)

      // 复制监听器列表，因为在执行过程中会被修改
      const listenersArray = Array.from(onceListeners)
      this.onceListeners.delete(event)

      for (const listener of listenersArray) {
        try {
          listener(eventObj)
        } catch (error) {
          console.error(`Error in once event listener for "${event}":`, error)
        }

        if (eventObj.propagationStopped) {
          break
        }
      }
    }

    return hasListeners
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    const listeners = this.listeners.get(event)
    const onceListeners = this.onceListeners.get(event)

    return (listeners?.size || 0) + (onceListeners?.size || 0)
  }

  /**
   * 获取事件监听器列表
   */
  listeners(event: string): EventListener[] {
    const listeners = this.listeners.get(event)
    const onceListeners = this.onceListeners.get(event)

    const result: EventListener[] = []

    if (listeners) {
      result.push(...listeners)
    }

    if (onceListeners) {
      result.push(...onceListeners)
    }

    return result
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    const names = new Set<string>()

    for (const name of this.listeners.keys()) {
      names.add(name)
    }

    for (const name of this.onceListeners.keys()) {
      names.add(name)
    }

    return Array.from(names)
  }

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(n: number): void {
    this.maxListeners = n
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners
  }
}

/**
 * 事件总线实现
 */
export class EventBus extends EventEmitter implements IEventBus {
  private namespaces = new Map<string, EventBus>()
  private paused = false
  private middlewares: EventMiddleware[] = []

  /**
   * 创建命名空间
   */
  namespace(name: string): IEventBus {
    if (!this.namespaces.has(name)) {
      this.namespaces.set(name, new EventBus())
    }
    return this.namespaces.get(name)!
  }

  /**
   * 销毁事件总线
   */
  destroy(): void {
    this.removeAllListeners()
    this.namespaces.clear()
    this.middlewares = []
  }

  /**
   * 暂停事件处理
   */
  pause(): void {
    this.paused = true
  }

  /**
   * 恢复事件处理
   */
  resume(): void {
    this.paused = false
  }

  /**
   * 是否已暂停
   */
  isPaused(): boolean {
    return this.paused
  }

  /**
   * 添加中间件
   */
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware)
  }

  /**
   * 移除中间件
   */
  removeMiddleware(middleware: EventMiddleware): void {
    const index = this.middlewares.indexOf(middleware)
    if (index > -1) {
      this.middlewares.splice(index, 1)
    }
  }

  /**
   * 触发事件（重写以支持中间件和暂停功能）
   */
  emit<T = any>(event: string, data?: T): boolean {
    if (this.paused) {
      return false
    }

    const eventObj = createEvent(event, this, data)

    // 执行中间件
    let middlewareIndex = 0
    const next = () => {
      if (middlewareIndex < this.middlewares.length) {
        const middleware = this.middlewares[middlewareIndex++]
        middleware(eventObj, next)
      } else {
        // 执行原始的emit逻辑
        super.emit(event, data)
      }
    }

    next()

    return true
  }
}

/**
 * 高级事件监听器包装器
 */
export class AdvancedEventListener {
  private listener: EventListener
  private options: AdvancedEventListenerOptions
  private count = 0

  constructor(listener: EventListener, options: AdvancedEventListenerOptions = {}) {
    this.listener = listener
    this.options = options

    // 应用防抖
    if (options.debounce) {
      this.listener = debounce(this.listener, options.debounce)
    }

    // 应用节流
    if (options.throttle) {
      this.listener = throttle(this.listener, options.throttle)
    }
  }

  /**
   * 处理事件
   */
  handle(event: any): void {
    try {
      // 检查最大执行次数
      if (this.options.maxCount && this.count >= this.options.maxCount) {
        return
      }

      // 应用过滤器
      if (this.options.filter && !this.options.filter(event)) {
        return
      }

      // 应用转换器
      let transformedEvent = event
      if (this.options.transformer) {
        transformedEvent = this.options.transformer(event)
      }

      // 执行中间件
      if (this.options.middleware && this.options.middleware.length > 0) {
        let middlewareIndex = 0
        const next = () => {
          if (middlewareIndex < this.options.middleware!.length) {
            const middleware = this.options.middleware![middlewareIndex++]
            middleware(transformedEvent, next)
          } else {
            this.listener(transformedEvent)
          }
        }
        next()
      } else {
        this.listener(transformedEvent)
      }

      this.count++
    } catch (error) {
      if (this.options.errorHandler) {
        this.options.errorHandler(error as Error)
      } else {
        console.error('Error in advanced event listener:', error)
      }
    }
  }
}

/**
 * 创建全局事件总线实例
 */
export const globalEventBus = new EventBus()

/**
 * DOM事件工具函数
 */
export const dom = {
  /**
   * 添加DOM事件监听器
   */
  on(
    element: Element | Window | Document,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    element.addEventListener(event, listener as any, options)
  },

  /**
   * 移除DOM事件监听器
   */
  off(
    element: Element | Window | Document,
    event: string,
    listener: EventListener,
    options?: EventListenerOptions
  ): void {
    element.removeEventListener(event, listener as any, options)
  },

  /**
   * 一次性DOM事件监听器
   */
  once(
    element: Element | Window | Document,
    event: string,
    listener: EventListener
  ): void {
    const onceListener = (e: Event) => {
      listener(e)
      element.removeEventListener(event, onceListener)
    }
    element.addEventListener(event, onceListener)
  },

  /**
   * 触发DOM事件
   */
  trigger(element: Element, event: string, data?: any): void {
    const customEvent = new CustomEvent(event, { detail: data })
    element.dispatchEvent(customEvent)
  }
}
