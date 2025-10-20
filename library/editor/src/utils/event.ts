/**
 * 事件处理工具函数
 */

export interface EventOptions extends AddEventListenerOptions {
  preventDefault?: boolean
  stopPropagation?: boolean
  stopImmediatePropagation?: boolean
}

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
}

export interface ThrottledFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void
  cancel: () => void
}

/**
 * 绑定事件（返回解绑函数）
 */
export function on(
  element: Element | Document | Window,
  event: string,
  handler: EventListener,
  options?: EventOptions
): () => void {
  const wrappedHandler = (e: Event) => {
    if (options?.preventDefault) {
      e.preventDefault()
    }
    if (options?.stopPropagation) {
      e.stopPropagation()
    }
    if (options?.stopImmediatePropagation) {
      e.stopImmediatePropagation()
    }
    handler(e)
  }
  
  element.addEventListener(event, wrappedHandler, options)
  
  return () => {
    element.removeEventListener(event, wrappedHandler, options)
  }
}

/**
 * 绑定一次性事件
 */
export function once(
  element: Element | Document | Window,
  event: string,
  handler: EventListener,
  options?: EventOptions
): () => void {
  return on(element, event, handler, { ...options, once: true })
}

/**
 * 解绑事件
 */
export function off(
  element: Element | Document | Window,
  event: string,
  handler: EventListener,
  options?: boolean | EventListenerOptions
): void {
  element.removeEventListener(event, handler, options)
}

/**
 * 触发事件
 */
export function trigger(
  element: Element,
  event: string | Event,
  detail?: any
): boolean {
  let evt: Event
  
  if (typeof event === 'string') {
    evt = new CustomEvent(event, {
      detail,
      bubbles: true,
      cancelable: true
    })
  } else {
    evt = event
  }
  
  return element.dispatchEvent(evt)
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): DebouncedFunction<T> {
  let timeout: number | null = null
  let result: any
  
  const debounced = function(this: any, ...args: Parameters<T>) {
    const context = this
    
    const later = () => {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
      }
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = window.setTimeout(later, wait)
    
    if (callNow) {
      result = func.apply(context, args)
    }
    
    return result
  }
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  
  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      func.apply(undefined, [] as any)
      timeout = null
    }
  }
  
  return debounced as DebouncedFunction<T>
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): ThrottledFunction<T> {
  const { leading = true, trailing = true } = options
  
  let timeout: number | null = null
  let context: any
  let args: any
  let result: any
  let previous = 0
  
  const later = () => {
    previous = leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) {
      context = args = null
    }
  }
  
  const throttled = function(this: any, ...passedArgs: Parameters<T>) {
    const now = Date.now()
    if (!previous && leading === false) {
      previous = now
    }
    
    const remaining = wait - (now - previous)
    context = this
    args = passedArgs
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) {
        context = args = null
      }
    } else if (!timeout && trailing !== false) {
      timeout = window.setTimeout(later, remaining)
    }
    
    return result
  }
  
  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
    }
    previous = 0
    timeout = context = args = null
  }
  
  return throttled as ThrottledFunction<T>
}

/**
 * 事件委托
 */
export function delegate(
  element: Element | Document,
  selector: string,
  event: string,
  handler: (e: Event, target: Element) => void,
  options?: EventOptions
): () => void {
  return on(element, event, (e: Event) => {
    const target = e.target as Element
    const delegateTarget = target.closest(selector)
    
    if (delegateTarget && element.contains(delegateTarget)) {
      handler(e, delegateTarget)
    }
  }, options)
}

/**
 * 停止事件传播
 */
export function stop(e: Event): void {
  e.preventDefault()
  e.stopPropagation()
}

/**
 * 阻止默认行为
 */
export function prevent(e: Event): void {
  e.preventDefault()
}

/**
 * 获取键盘事件的按键
 */
export function getKey(e: KeyboardEvent): string {
  return e.key || e.keyCode.toString()
}

/**
 * 检查是否按下修饰键
 */
export function hasModifier(e: KeyboardEvent | MouseEvent): boolean {
  return e.ctrlKey || e.metaKey || e.altKey || e.shiftKey
}

/**
 * 检查是否按下特定修饰键组合
 */
export function checkModifiers(
  e: KeyboardEvent | MouseEvent,
  modifiers: {
    ctrl?: boolean
    meta?: boolean
    alt?: boolean
    shift?: boolean
  }
): boolean {
  const { ctrl = false, meta = false, alt = false, shift = false } = modifiers
  
  return (
    e.ctrlKey === ctrl &&
    e.metaKey === meta &&
    e.altKey === alt &&
    e.shiftKey === shift
  )
}

/**
 * 创建长按事件
 */
export function onLongPress(
  element: Element,
  handler: (e: MouseEvent | TouchEvent) => void,
  duration: number = 500
): () => void {
  let timeout: number | null = null
  let startEvent: MouseEvent | TouchEvent | null = null
  
  const start = (e: MouseEvent | TouchEvent) => {
    startEvent = e
    timeout = window.setTimeout(() => {
      handler(startEvent!)
      timeout = null
    }, duration)
  }
  
  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    startEvent = null
  }
  
  const offs: (() => void)[] = []
  
  // 鼠标事件
  offs.push(on(element, 'mousedown', start as EventListener))
  offs.push(on(element, 'mouseup', cancel as EventListener))
  offs.push(on(element, 'mouseleave', cancel as EventListener))
  
  // 触摸事件
  offs.push(on(element, 'touchstart', start as EventListener))
  offs.push(on(element, 'touchend', cancel as EventListener))
  offs.push(on(element, 'touchcancel', cancel as EventListener))
  
  return () => {
    cancel()
    offs.forEach(off => off())
  }
}

/**
 * 创建拖拽事件
 */
export function onDrag(
  element: Element,
  handlers: {
    onStart?: (e: MouseEvent | TouchEvent, pos: { x: number; y: number }) => void
    onMove?: (e: MouseEvent | TouchEvent, pos: { x: number; y: number }, delta: { x: number; y: number }) => void
    onEnd?: (e: MouseEvent | TouchEvent, pos: { x: number; y: number }) => void
  }
): () => void {
  let isDragging = false
  let startX = 0
  let startY = 0
  let currentX = 0
  let currentY = 0
  
  const getPosition = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    }
    return {
      x: e.clientX,
      y: e.clientY
    }
  }
  
  const handleStart = (e: MouseEvent | TouchEvent) => {
    isDragging = true
    const pos = getPosition(e)
    startX = currentX = pos.x
    startY = currentY = pos.y
    
    handlers.onStart?.(e, pos)
  }
  
  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    
    const pos = getPosition(e)
    const delta = {
      x: pos.x - currentX,
      y: pos.y - currentY
    }
    
    currentX = pos.x
    currentY = pos.y
    
    handlers.onMove?.(e, pos, delta)
  }
  
  const handleEnd = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    
    isDragging = false
    const pos = getPosition(e)
    
    handlers.onEnd?.(e, pos)
  }
  
  const offs: (() => void)[] = []
  
  // 鼠标事件
  offs.push(on(element, 'mousedown', handleStart as EventListener))
  offs.push(on(document, 'mousemove', handleMove as EventListener))
  offs.push(on(document, 'mouseup', handleEnd as EventListener))
  
  // 触摸事件
  offs.push(on(element, 'touchstart', handleStart as EventListener, { passive: false }))
  offs.push(on(document, 'touchmove', handleMove as EventListener, { passive: false }))
  offs.push(on(document, 'touchend', handleEnd as EventListener))
  offs.push(on(document, 'touchcancel', handleEnd as EventListener))
  
  return () => {
    offs.forEach(off => off())
  }
}

/**
 * 监听元素尺寸变化
 */
export function onResize(
  element: Element,
  handler: (entries: ResizeObserverEntry[]) => void
): () => void {
  if (!window.ResizeObserver) {
    console.warn('ResizeObserver is not supported')
    return () => {}
  }
  
  const observer = new ResizeObserver(handler)
  observer.observe(element)
  
  return () => {
    observer.disconnect()
  }
}

/**
 * 监听元素可见性变化
 */
export function onVisibilityChange(
  element: Element,
  handler: (isVisible: boolean, entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): () => void {
  if (!window.IntersectionObserver) {
    console.warn('IntersectionObserver is not supported')
    return () => {}
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      handler(entry.isIntersecting, entry)
    })
  }, options)
  
  observer.observe(element)
  
  return () => {
    observer.disconnect()
  }
}

/**
 * 等待事件触发
 */
export function waitForEvent(
  element: Element | Document | Window,
  event: string,
  timeout?: number
): Promise<Event> {
  return new Promise((resolve, reject) => {
    let timeoutId: number | null = null
    
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      off(element, event, handler)
    }
    
    const handler = (e: Event) => {
      cleanup()
      resolve(e)
    }
    
    on(element, event, handler, { once: true })
    
    if (timeout) {
      timeoutId = window.setTimeout(() => {
        cleanup()
        reject(new Error(`Event "${event}" timeout after ${timeout}ms`))
      }, timeout)
    }
  })
}

/**
 * 事件处理器类型
 */
export type EventHandler = (...args: any[]) => void

/**
 * 事件映射类型
 */
export type EventMap = Record<string, any[]>

/**
 * 增强的事件发射器（支持泛型）
 */
export class EventEmitter<T extends Record<string, any[]> = Record<string, any[]>> {
  private events: Map<keyof T, Set<Function>> = new Map()
  
  on<K extends keyof T>(event: K, handler: (...args: T[K]) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    
    this.events.get(event)!.add(handler)
    
    return () => this.off(event, handler)
  }
  
  once<K extends keyof T>(event: K, handler: (...args: T[K]) => void): () => void {
    const wrappedHandler = (...args: T[K]) => {
      handler(...args)
      this.off(event, wrappedHandler)
    }
    
    return this.on(event, wrappedHandler)
  }
  
  off<K extends keyof T>(event: K, handler: (...args: T[K]) => void): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.events.delete(event)
      }
    }
  }
  
  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in event handler for "${String(event)}":`, error)
        }
      })
    }
  }
  
  clear(event?: keyof T): void {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }
  
  listenerCount(event: keyof T): number {
    return this.events.get(event)?.size || 0
  }
}