/**
 * @file 事件工具函数
 * @description 提供事件处理相关的工具函数
 */

import type { CropperEventType, EventListener, EventListenerMap } from '../types'

/**
 * 事件发射器类
 */
export class EventEmitter {
  private listeners: EventListenerMap = {}

  /**
   * 添加事件监听器
   */
  on(type: CropperEventType, listener: EventListener): void {
    if (!this.listeners[type]) {
      this.listeners[type] = []
    }
    this.listeners[type]!.push(listener)
  }

  /**
   * 移除事件监听器
   */
  off(type: CropperEventType, listener?: EventListener): void {
    if (!this.listeners[type]) return

    if (listener) {
      const index = this.listeners[type]!.indexOf(listener)
      if (index > -1) {
        this.listeners[type]!.splice(index, 1)
      }
    } else {
      this.listeners[type] = []
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once(type: CropperEventType, listener: EventListener): void {
    const onceListener: EventListener = (event) => {
      listener(event)
      this.off(type, onceListener)
    }
    this.on(type, onceListener)
  }

  /**
   * 触发事件
   */
  emit(type: CropperEventType, data?: any): void {
    if (!this.listeners[type]) return

    const event = {
      type,
      target: this,
      ...data,
    }

    this.listeners[type]!.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(type?: CropperEventType): void {
    if (type) {
      this.listeners[type] = []
    } else {
      this.listeners = {}
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(type: CropperEventType): number {
    return this.listeners[type]?.length || 0
  }

  /**
   * 检查是否有事件监听器
   */
  hasListeners(type: CropperEventType): boolean {
    return this.listenerCount(type) > 0
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

/**
 * 检查是否为鼠标事件
 */
export function isMouseEvent(event: Event): event is MouseEvent {
  return event.type.startsWith('mouse')
}

/**
 * 检查是否为触摸事件
 */
export function isTouchEvent(event: Event): event is TouchEvent {
  return event.type.startsWith('touch')
}

/**
 * 检查是否为指针事件
 */
export function isPointerEvent(event: Event): event is PointerEvent {
  return event.type.startsWith('pointer')
}

/**
 * 获取事件的按键信息
 */
export function getEventKeys(event: KeyboardEvent): {
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
 * 检查是否按下了修饰键
 */
export function hasModifierKey(event: KeyboardEvent): boolean {
  const keys = getEventKeys(event)
  return keys.ctrl || keys.shift || keys.alt || keys.meta
}

/**
 * 创建自定义事件
 */
export function createCustomEvent(
  type: string,
  detail?: any,
  options?: EventInit
): CustomEvent {
  return new CustomEvent(type, {
    detail,
    bubbles: true,
    cancelable: true,
    ...options,
  })
}

/**
 * 事件委托
 */
export function delegate(
  container: HTMLElement,
  selector: string,
  eventType: string,
  handler: (event: Event, target: HTMLElement) => void
): () => void {
  const delegateHandler = (event: Event) => {
    const target = event.target as HTMLElement
    const delegateTarget = target.closest(selector) as HTMLElement
    
    if (delegateTarget && container.contains(delegateTarget)) {
      handler(event, delegateTarget)
    }
  }

  container.addEventListener(eventType, delegateHandler)

  // 返回清理函数
  return () => {
    container.removeEventListener(eventType, delegateHandler)
  }
}

/**
 * 一次性事件监听器
 */
export function once(
  element: HTMLElement | Document | Window,
  eventType: string,
  handler: EventListener
): void {
  const onceHandler = (event: Event) => {
    handler(event)
    element.removeEventListener(eventType, onceHandler)
  }
  element.addEventListener(eventType, onceHandler)
}

/**
 * 等待事件触发
 */
export function waitForEvent(
  element: HTMLElement | Document | Window,
  eventType: string,
  timeout?: number
): Promise<Event> {
  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | null = null

    const handler = (event: Event) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      element.removeEventListener(eventType, handler)
      resolve(event)
    }

    element.addEventListener(eventType, handler)

    if (timeout) {
      timeoutId = setTimeout(() => {
        element.removeEventListener(eventType, handler)
        reject(new Error(`Event ${eventType} timeout after ${timeout}ms`))
      }, timeout)
    }
  })
}

/**
 * 批量添加事件监听器
 */
export function addEventListeners(
  element: HTMLElement | Document | Window,
  events: Record<string, EventListener>
): () => void {
  const cleanupFunctions: (() => void)[] = []

  Object.entries(events).forEach(([eventType, handler]) => {
    element.addEventListener(eventType, handler)
    cleanupFunctions.push(() => {
      element.removeEventListener(eventType, handler)
    })
  })

  // 返回清理函数
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup())
  }
}

/**
 * 检查事件是否来自指定元素或其子元素
 */
export function isEventFromElement(
  event: Event,
  element: HTMLElement
): boolean {
  const target = event.target as HTMLElement
  return element === target || element.contains(target)
}

/**
 * 获取事件路径
 */
export function getEventPath(event: Event): HTMLElement[] {
  if ('composedPath' in event && typeof event.composedPath === 'function') {
    return event.composedPath() as HTMLElement[]
  }

  // 兼容性处理
  const path: HTMLElement[] = []
  let target = event.target as HTMLElement

  while (target) {
    path.push(target)
    target = target.parentElement as HTMLElement
  }

  return path
}

/**
 * 阻止事件冒泡和默认行为
 */
export function stopEvent(event: Event): void {
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
}

/**
 * 检查事件是否被阻止
 */
export function isEventPrevented(event: Event): boolean {
  return event.defaultPrevented
}

/**
 * 模拟事件触发
 */
export function simulateEvent(
  element: HTMLElement,
  eventType: string,
  options?: EventInit
): void {
  const event = new Event(eventType, {
    bubbles: true,
    cancelable: true,
    ...options,
  })
  element.dispatchEvent(event)
}
