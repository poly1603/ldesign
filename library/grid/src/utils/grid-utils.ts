/**
 * Utility functions for grid operations
 */

import type { GridItemOptions, Rect } from '../types'

/**
 * Generate unique ID
 */
export function generateId(prefix = 'grid-item'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * Check if two rectangles intersect
 */
export function rectsIntersect(rect1: Rect, rect2: Rect): boolean {
  return !(
    rect1.x + rect1.width <= rect2.x ||
    rect2.x + rect2.width <= rect1.x ||
    rect1.y + rect1.height <= rect2.y ||
    rect2.y + rect2.height <= rect1.y
  )
}

/**
 * Get element bounding rectangle
 */
export function getElementRect(element: HTMLElement): Rect {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  }
}

/**
 * Calculate grid position from pixel position
 */
export function pixelToGrid(
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number
): { x: number; y: number } {
  return {
    x: Math.round(x / cellWidth),
    y: Math.round(y / cellHeight)
  }
}

/**
 * Calculate pixel position from grid position
 */
export function gridToPixel(
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number
): { x: number; y: number } {
  return {
    x: x * cellWidth,
    y: y * cellHeight
  }
}

/**
 * Normalize grid item options
 */
export function normalizeItemOptions(options: GridItemOptions): GridItemOptions {
  return {
    id: options.id || generateId(),
    x: options.x ?? 0,
    y: options.y ?? 0,
    w: options.w ?? 1,
    h: options.h ?? 1,
    minW: options.minW,
    maxW: options.maxW,
    minH: options.minH,
    maxH: options.maxH,
    locked: options.locked ?? false,
    noResize: options.noResize ?? false,
    noMove: options.noMove ?? false,
    autoPosition: options.autoPosition ?? false,
    content: options.content,
    data: options.data
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Check if point is inside rectangle
 */
export function pointInRect(x: number, y: number, rect: Rect): boolean {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  )
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Check if element is visible in viewport
 */
export function isElementVisible(element: HTMLElement, viewport?: Rect): boolean {
  const rect = getElementRect(element)

  if (!viewport) {
    viewport = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  return rectsIntersect(rect, viewport)
}

/**
 * Get scroll position
 */
export function getScrollPosition(element?: HTMLElement): { x: number; y: number } {
  if (element) {
    return {
      x: element.scrollLeft,
      y: element.scrollTop
    }
  }

  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  }
}

/**
 * Set element CSS
 */
export function setElementCSS(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles)
}

/**
 * Create element from HTML string
 */
export function createElementFromHTML(html: string): HTMLElement {
  const template = document.createElement('template')
  template.innerHTML = html.trim()
  return template.content.firstChild as HTMLElement
}

/**
 * Remove element from DOM
 */
export function removeElement(element: HTMLElement): void {
  element.parentNode?.removeChild(element)
}

/**
 * Add class to element
 */
export function addClass(element: HTMLElement, ...classNames: string[]): void {
  element.classList.add(...classNames)
}

/**
 * Remove class from element
 */
export function removeClass(element: HTMLElement, ...classNames: string[]): void {
  element.classList.remove(...classNames)
}

/**
 * Toggle class on element
 */
export function toggleClass(element: HTMLElement, className: string, force?: boolean): void {
  element.classList.toggle(className, force)
}

/**
 * Check if element has class
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className)
}













