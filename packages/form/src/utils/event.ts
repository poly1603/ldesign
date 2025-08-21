// 事件系统工具函数

import type {
  EventEmitter,
  EventListener,
  EventListenerOptions,
} from '../types/events'

/**
 * 事件发射器实现
 */
export class SimpleEventEmitter implements EventEmitter {
  private listeners: Map<string, Set<EventListener>> = new Map()
  private onceListeners: Map<string, Set<EventListener>> = new Map()

  on<K extends keyof any>(
    event: K,
    listener: any,
    options?: EventListenerOptions,
  ): void {
    const eventName = String(event)

    if (options?.once) {
      this.once(event, listener)
      return
    }

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set())
    }

    this.listeners.get(eventName)!.add(listener)
  }

  once<K extends keyof any>(event: K, listener: any): void {
    const eventName = String(event)

    if (!this.onceListeners.has(eventName)) {
      this.onceListeners.set(eventName, new Set())
    }

    this.onceListeners.get(eventName)!.add(listener)
  }

  off<K extends keyof any>(event: K, listener: any): void {
    const eventName = String(event)

    this.listeners.get(eventName)?.delete(listener)
    this.onceListeners.get(eventName)?.delete(listener)
  }

  emit<K extends keyof any>(event: K, ...args: any[]): void {
    const eventName = String(event)

    // 执行普通监听器
    const listeners = this.listeners.get(eventName)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(...args)
        }
        catch (error) {
          console.error(`Error in event listener for "${eventName}":`, error)
        }
      })
    }

    // 执行一次性监听器
    const onceListeners = this.onceListeners.get(eventName)
    if (onceListeners) {
      onceListeners.forEach((listener) => {
        try {
          listener(...args)
        }
        catch (error) {
          console.error(
            `Error in once event listener for "${eventName}":`,
            error,
          )
        }
      })
      // 清空一次性监听器
      this.onceListeners.delete(eventName)
    }
  }

  removeAllListeners(event?: keyof any): void {
    if (event) {
      const eventName = String(event)
      this.listeners.delete(eventName)
      this.onceListeners.delete(eventName)
    }
    else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }

  listenerCount(event: keyof any): number {
    const eventName = String(event)
    const regularCount = this.listeners.get(eventName)?.size || 0
    const onceCount = this.onceListeners.get(eventName)?.size || 0
    return regularCount + onceCount
  }

  getListeners<K extends keyof any>(event: K): any[] {
    const eventName = String(event)
    const regular = Array.from(this.listeners.get(eventName) || [])
    const once = Array.from(this.onceListeners.get(eventName) || [])
    return [...regular, ...once]
  }
}

/**
 * 创建事件发射器
 */
export function createEventEmitter(): EventEmitter {
  return new SimpleEventEmitter()
}

/**
 * DOM事件监听器管理
 */
export class DOMEventManager {
  private listeners: Map<Element, Map<string, EventListener[]>> = new Map()

  /**
   * 添加事件监听器
   */
  addEventListener(
    element: Element,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    if (!this.listeners.has(element)) {
      this.listeners.set(element, new Map())
    }

    const elementListeners = this.listeners.get(element)!
    if (!elementListeners.has(event)) {
      elementListeners.set(event, [])
    }

    elementListeners.get(event)!.push(listener)
    element.addEventListener(event, listener as any, options)
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(
    element: Element,
    event: string,
    listener: EventListener,
  ): void {
    const elementListeners = this.listeners.get(element)
    if (!elementListeners)
      return

    const eventListeners = elementListeners.get(event)
    if (!eventListeners)
      return

    const index = eventListeners.indexOf(listener)
    if (index > -1) {
      eventListeners.splice(index, 1)
      element.removeEventListener(event, listener as any)
    }

    // 清理空的监听器数组
    if (eventListeners.length === 0) {
      elementListeners.delete(event)
    }

    if (elementListeners.size === 0) {
      this.listeners.delete(element)
    }
  }

  /**
   * 移除元素的所有事件监听器
   */
  removeAllListeners(element: Element): void {
    const elementListeners = this.listeners.get(element)
    if (!elementListeners)
      return

    elementListeners.forEach((listeners, event) => {
      listeners.forEach((listener) => {
        element.removeEventListener(event, listener as any)
      })
    })

    this.listeners.delete(element)
  }

  /**
   * 清空所有监听器
   */
  clear(): void {
    this.listeners.forEach((elementListeners, element) => {
      elementListeners.forEach((listeners, event) => {
        listeners.forEach((listener) => {
          element.removeEventListener(event, listener as any)
        })
      })
    })

    this.listeners.clear()
  }

  /**
   * 获取元素的监听器数量
   */
  getListenerCount(element: Element, event?: string): number {
    const elementListeners = this.listeners.get(element)
    if (!elementListeners)
      return 0

    if (event) {
      return elementListeners.get(event)?.length || 0
    }

    let count = 0
    elementListeners.forEach((listeners) => {
      count += listeners.length
    })
    return count
  }
}

/**
 * 创建DOM事件管理器
 */
export function createDOMEventManager(): DOMEventManager {
  return new DOMEventManager()
}

/**
 * 事件委托
 */
export function delegate(
  container: Element,
  selector: string,
  event: string,
  handler: (event: Event, target: Element) => void,
): () => void {
  const delegateHandler = (e: Event) => {
    const target = (e.target as Element).closest(selector)
    if (target && container.contains(target)) {
      handler(e, target)
    }
  }

  container.addEventListener(event, delegateHandler)

  return () => {
    container.removeEventListener(event, delegateHandler)
  }
}

/**
 * 一次性事件监听
 */
export function once(
  element: Element,
  event: string,
  handler: EventListener,
): void {
  const onceHandler = (e: Event) => {
    handler(e)
    element.removeEventListener(event, onceHandler as any)
  }

  element.addEventListener(event, onceHandler as any)
}

/**
 * 等待事件触发
 */
export function waitForEvent(
  element: Element,
  event: string,
  timeout?: number,
): Promise<Event> {
  return new Promise((resolve, reject) => {
    let timeoutId: number | undefined

    const handler = (e: Event) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      element.removeEventListener(event, handler)
      resolve(e)
    }

    element.addEventListener(event, handler)

    if (timeout) {
      timeoutId = window.setTimeout(() => {
        element.removeEventListener(event, handler)
        reject(new Error(`Event "${event}" timeout after ${timeout}ms`))
      }, timeout)
    }
  })
}

/**
 * 创建自定义事件
 */
export function createCustomEvent(
  type: string,
  detail?: any,
  options?: EventInit,
): CustomEvent {
  return new CustomEvent(type, {
    detail,
    bubbles: true,
    cancelable: true,
    ...options,
  })
}

/**
 * 触发自定义事件
 */
export function dispatchCustomEvent(
  element: Element,
  type: string,
  detail?: any,
  options?: EventInit,
): boolean {
  const event = createCustomEvent(type, detail, options)
  return element.dispatchEvent(event)
}

/**
 * 阻止事件默认行为和冒泡
 */
export function stopEvent(event: Event): void {
  event.preventDefault()
  event.stopPropagation()
}

/**
 * 检查事件是否支持
 */
export function isEventSupported(
  eventName: string,
  element?: Element,
): boolean {
  const testElement = element || document.createElement('div')
  const eventProperty = `on${eventName}`
  return eventProperty in testElement
}

/**
 * 获取事件的键盘修饰键状态
 */
export function getModifierKeys(event: KeyboardEvent | MouseEvent): {
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
} {
  return {
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
    meta: event.metaKey,
  }
}

/**
 * 检查是否为移动设备触摸事件
 */
export function isTouchEvent(event: Event): event is TouchEvent {
  return 'touches' in event
}

/**
 * 获取事件的坐标位置
 */
export function getEventPosition(event: MouseEvent | TouchEvent): {
  x: number
  y: number
} {
  if (isTouchEvent(event)) {
    const touch = event.touches[0] || event.changedTouches[0]
    return { x: touch.clientX, y: touch.clientY }
  }

  return { x: event.clientX, y: event.clientY }
}
