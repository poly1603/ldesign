/**
 * @file DOM 工具函数
 * @description 提供 DOM 操作相关的工具函数
 */

import type { Point, Size } from '../types'

/**
 * 获取元素
 */
export function getElement(selector: HTMLElement | string): HTMLElement | null {
  if (typeof selector === 'string') {
    return document.querySelector(selector)
  }
  return selector
}

/**
 * 创建元素
 */
export function createElement(
  tagName: string,
  className?: string,
  attributes?: Record<string, string>
): HTMLElement {
  const element = document.createElement(tagName)
  
  if (className) {
    element.className = className
  }
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
  }
  
  return element
}

/**
 * 添加CSS类
 */
export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className)
}

/**
 * 移除CSS类
 */
export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className)
}

/**
 * 切换CSS类
 */
export function toggleClass(element: HTMLElement, className: string): void {
  element.classList.toggle(className)
}

/**
 * 检查是否有CSS类
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className)
}

/**
 * 设置样式
 */
export function setStyle(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration> | string,
  value?: string
): void {
  if (typeof styles === 'string' && value !== undefined) {
    ;(element.style as any)[styles] = value
  } else if (typeof styles === 'object') {
    Object.assign(element.style, styles)
  }
}

/**
 * 获取元素的边界矩形
 */
export function getBoundingRect(element: HTMLElement): DOMRect {
  return element.getBoundingClientRect()
}

/**
 * 获取元素的偏移位置
 */
export function getOffset(element: HTMLElement): Point {
  const rect = getBoundingRect(element)
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
  }
}

/**
 * 获取元素的尺寸
 */
export function getSize(element: HTMLElement): Size {
  const rect = getBoundingRect(element)
  return {
    width: rect.width,
    height: rect.height,
  }
}

/**
 * 获取鼠标/触摸位置
 */
export function getPointerPosition(event: MouseEvent | TouchEvent): Point {
  if ('touches' in event && event.touches.length > 0) {
    const touch = event.touches[0]
    return { x: touch.clientX, y: touch.clientY }
  } else if ('clientX' in event) {
    return { x: event.clientX, y: event.clientY }
  }
  return { x: 0, y: 0 }
}

/**
 * 获取相对于元素的位置
 */
export function getRelativePosition(
  event: MouseEvent | TouchEvent,
  element: HTMLElement
): Point {
  const pointerPos = getPointerPosition(event)
  const elementRect = getBoundingRect(element)
  
  return {
    x: pointerPos.x - elementRect.left,
    y: pointerPos.y - elementRect.top,
  }
}

/**
 * 阻止事件默认行为和冒泡
 */
export function preventDefault(event: Event): void {
  event.preventDefault()
  event.stopPropagation()
}

/**
 * 添加事件监听器
 */
export function addEventListener(
  element: HTMLElement | Document | Window,
  type: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
): void {
  element.addEventListener(type, listener, options)
}

/**
 * 移除事件监听器
 */
export function removeEventListener(
  element: HTMLElement | Document | Window,
  type: string,
  listener: EventListener,
  options?: boolean | EventListenerOptions
): void {
  element.removeEventListener(type, listener, options)
}

/**
 * 检查是否支持触摸事件
 */
export function isTouchSupported(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 获取设备像素比
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1
}

/**
 * 创建Canvas元素
 */
export function createCanvas(width?: number, height?: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  if (width !== undefined) canvas.width = width
  if (height !== undefined) canvas.height = height
  return canvas
}

/**
 * 获取Canvas上下文
 */
export function getCanvasContext(
  canvas: HTMLCanvasElement,
  contextType: '2d' = '2d'
): CanvasRenderingContext2D | null {
  return canvas.getContext(contextType)
}

/**
 * 设置Canvas的高DPI支持
 */
export function setupHighDPICanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const ctx = getCanvasContext(canvas)
  if (!ctx) return null
  
  const devicePixelRatio = getDevicePixelRatio()
  
  // 设置实际尺寸
  canvas.width = width * devicePixelRatio
  canvas.height = height * devicePixelRatio
  
  // 设置显示尺寸
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  
  // 缩放上下文以匹配设备像素比
  ctx.scale(devicePixelRatio, devicePixelRatio)
  
  return ctx
}

/**
 * 下载文件
 */
export function downloadFile(
  data: string | Blob,
  filename: string,
  mimeType?: string
): void {
  const link = document.createElement('a')
  
  if (typeof data === 'string') {
    link.href = data
  } else {
    const url = URL.createObjectURL(data)
    link.href = url
  }
  
  link.download = filename
  if (mimeType) {
    link.type = mimeType
  }
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // 清理对象URL
  if (typeof data !== 'string') {
    URL.revokeObjectURL(link.href)
  }
}

/**
 * 读取文件为DataURL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * 加载图片
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

/**
 * 检查元素是否在视口内
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = getBoundingRect(element)
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  )
}

/**
 * 获取滚动位置
 */
export function getScrollPosition(): Point {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  }
}

/**
 * 设置元素的变换
 */
export function setTransform(
  element: HTMLElement,
  transform: {
    translateX?: number
    translateY?: number
    scaleX?: number
    scaleY?: number
    rotate?: number
  }
): void {
  const transforms: string[] = []
  
  if (transform.translateX !== undefined || transform.translateY !== undefined) {
    const x = transform.translateX || 0
    const y = transform.translateY || 0
    transforms.push(`translate(${x}px, ${y}px)`)
  }
  
  if (transform.scaleX !== undefined || transform.scaleY !== undefined) {
    const x = transform.scaleX || 1
    const y = transform.scaleY || 1
    transforms.push(`scale(${x}, ${y})`)
  }
  
  if (transform.rotate !== undefined) {
    transforms.push(`rotate(${transform.rotate}deg)`)
  }
  
  element.style.transform = transforms.join(' ')
}
