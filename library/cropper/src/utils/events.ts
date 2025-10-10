/**
 * Event utilities
 */

import type { Point } from '../types'

/**
 * Event listener options
 */
export interface EventOptions {
  capture?: boolean
  passive?: boolean
  once?: boolean
}

/**
 * Add event listener
 */
export function on<K extends keyof HTMLElementEventMap>(
  element: Element | Window | Document,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  options?: EventOptions
): void {
  element.addEventListener(type, listener as EventListener, options)
}

/**
 * Remove event listener
 */
export function off<K extends keyof HTMLElementEventMap>(
  element: Element | Window | Document,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  options?: EventOptions
): void {
  element.removeEventListener(type, listener as EventListener, options)
}

/**
 * Dispatch custom event
 */
export function dispatch(
  element: Element,
  type: string,
  detail?: any
): boolean {
  const event = new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    detail
  })
  return element.dispatchEvent(event)
}

/**
 * Get pointer coordinates from event
 */
export function getPointer(
  event: MouseEvent | TouchEvent,
  endTouch = false
): Point {
  const touches = (event as TouchEvent).touches
  const changedTouches = (event as TouchEvent).changedTouches

  if (touches && touches.length > 0) {
    const touch = endTouch ? changedTouches[0] : touches[0]
    return {
      x: touch.pageX,
      y: touch.pageY
    }
  }

  const mouseEvent = event as MouseEvent
  return {
    x: mouseEvent.pageX,
    y: mouseEvent.pageY
  }
}

/**
 * Get center point of multiple pointers
 */
export function getCenter(event: TouchEvent): Point {
  const touches = event.touches
  if (touches.length < 2) {
    return getPointer(event)
  }

  const touch1 = touches[0]
  const touch2 = touches[1]

  return {
    x: (touch1.pageX + touch2.pageX) / 2,
    y: (touch1.pageY + touch2.pageY) / 2
  }
}

/**
 * Get distance between two touch points
 */
export function getTouchDistance(event: TouchEvent): number {
  const touches = event.touches
  if (touches.length < 2) {
    return 0
  }

  const touch1 = touches[0]
  const touch2 = touches[1]

  const dx = touch2.pageX - touch1.pageX
  const dy = touch2.pageY - touch1.pageY

  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Prevent default behavior
 */
export function preventDefault(event: Event): void {
  if (event.cancelable) {
    event.preventDefault()
  }
}

/**
 * Stop propagation
 */
export function stopPropagation(event: Event): void {
  event.stopPropagation()
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined
  let lastExecTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func.apply(this, args)
      lastExecTime = currentTime
    } else {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
      timeoutId = window.setTimeout(() => {
        func.apply(this, args)
        lastExecTime = Date.now()
      }, delay)
    }
  }
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * Check if event is touch event
 */
export function isTouchEvent(event: Event): event is TouchEvent {
  return event.type.startsWith('touch')
}

/**
 * Check if event is mouse event
 */
export function isMouseEvent(event: Event): event is MouseEvent {
  return event.type.startsWith('mouse')
}

/**
 * Check if event is pointer event
 */
export function isPointerEvent(event: Event): event is PointerEvent {
  return event.type.startsWith('pointer')
}
