/**
 * 工具函数模块
 * 提供编辑器所需的各种工具函数
 */

// ==================== DOM 操作工具 ====================

/**
 * 获取元素
 * @param selector 选择器或DOM元素
 * @returns DOM元素或null
 */
export function getElement(selector: string | HTMLElement): HTMLElement | null {
  if (typeof selector === 'string') {
    return document.querySelector(selector)
  }
  return selector instanceof HTMLElement ? selector : null
}

/**
 * 创建元素
 * @param tagName 标签名
 * @param attributes 属性对象
 * @param children 子元素
 * @returns 创建的元素
 */
export function createElement(
  tagName: string,
  attributes: Record<string, string> = {},
  children: (HTMLElement | string)[] = []
): HTMLElement {
  const element = document.createElement(tagName)

  // 设置属性
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })

  // 添加子元素
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child))
    } else {
      element.appendChild(child)
    }
  })

  return element
}

/**
 * 检查元素是否包含指定类名
 * @param element 元素
 * @param className 类名
 * @returns 是否包含
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className)
}

/**
 * 添加类名
 * @param element 元素
 * @param className 类名
 */
export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className)
}

/**
 * 移除类名
 * @param element 元素
 * @param className 类名
 */
export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className)
}

/**
 * 切换类名
 * @param element 元素
 * @param className 类名
 * @returns 切换后是否包含该类名
 */
export function toggleClass(element: HTMLElement, className: string): boolean {
  return element.classList.toggle(className)
}

/**
 * 获取元素的计算样式
 * @param element 元素
 * @param property 样式属性
 * @returns 样式值
 */
export function getComputedStyle(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property)
}

/**
 * 设置元素样式
 * @param element 元素
 * @param styles 样式对象
 */
export function setStyles(element: HTMLElement, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value)
  })
}

// ==================== 选区操作工具 ====================

/**
 * 获取当前选区
 * @returns 选区对象或null
 */
export function getCurrentSelection(): Selection | null {
  return window.getSelection()
}

/**
 * 获取选区范围
 * @returns 范围对象或null
 */
export function getSelectionRange(): Range | null {
  const selection = getCurrentSelection()
  return selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
}

/**
 * 设置选区范围
 * @param range 范围对象
 */
export function setSelectionRange(range: Range): void {
  const selection = getCurrentSelection()
  if (selection) {
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

/**
 * 创建范围
 * @param startContainer 起始容器
 * @param startOffset 起始偏移
 * @param endContainer 结束容器
 * @param endOffset 结束偏移
 * @returns 范围对象
 */
export function createRange(
  startContainer: Node,
  startOffset: number,
  endContainer: Node = startContainer,
  endOffset: number = startOffset
): Range {
  const range = document.createRange()
  range.setStart(startContainer, startOffset)
  range.setEnd(endContainer, endOffset)
  return range
}

/**
 * 检查选区是否在指定元素内
 * @param element 元素
 * @returns 是否在元素内
 */
export function isSelectionInElement(element: HTMLElement): boolean {
  const selection = getCurrentSelection()
  if (!selection || selection.rangeCount === 0) {
    return false
  }

  const range = selection.getRangeAt(0)
  return element.contains(range.commonAncestorContainer)
}

// ==================== 事件处理工具 ====================

/**
 * 添加事件监听器
 * @param element 元素
 * @param type 事件类型
 * @param listener 监听器
 * @param options 选项
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
 * @param element 元素
 * @param type 事件类型
 * @param listener 监听器
 * @param options 选项
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
 * 阻止事件默认行为
 * @param event 事件对象
 */
export function preventDefault(event: Event): void {
  event.preventDefault()
}

/**
 * 阻止事件冒泡
 * @param event 事件对象
 */
export function stopPropagation(event: Event): void {
  event.stopPropagation()
}

/**
 * 阻止事件默认行为和冒泡
 * @param event 事件对象
 */
export function stopEvent(event: Event): void {
  preventDefault(event)
  stopPropagation(event)
}

// ==================== 设备检测工具 ====================

/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检查是否为平板设备
 * @returns 是否为平板设备
 */
export function isTablet(): boolean {
  return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent)
}

/**
 * 检查是否为桌面设备
 * @returns 是否为桌面设备
 */
export function isDesktop(): boolean {
  return !isMobile() && !isTablet()
}

/**
 * 检查是否支持触摸
 * @returns 是否支持触摸
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 获取设备类型
 * @param breakpoints 断点配置
 * @returns 设备类型
 */
export function getDeviceType(breakpoints: { mobile: number; tablet: number }): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth

  if (width < breakpoints.mobile) {
    return 'mobile'
  } else if (width < breakpoints.tablet) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

// ==================== 字符串处理工具 ====================

/**
 * 转义HTML字符
 * @param text 文本
 * @returns 转义后的文本
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 反转义HTML字符
 * @param html HTML字符串
 * @returns 反转义后的文本
 */
export function unescapeHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || ''
}

/**
 * 清理HTML标签
 * @param html HTML字符串
 * @returns 纯文本
 */
export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ==================== 防抖节流工具 ====================

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => func(...args), delay)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// ==================== 深拷贝工具 ====================

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    Object.keys(obj).forEach(key => {
      cloned[key as keyof T] = deepClone(obj[key as keyof T])
    })
    return cloned
  }

  return obj
}

// ==================== 响应式管理器 ====================

export { ResponsiveManager } from './responsive-manager'

// ==================== 图标管理器 ====================

export { IconManager } from './icon-manager'

// ==================== DOM工具模块 ====================

// 重新导出DOM工具，避免循环引用
export {
  createElement as createDOMElement,
  addClass as addDOMClass,
  removeClass as removeDOMClass,
  toggleClass as toggleDOMClass
} from './dom-utils'

// 保持向后兼容
export {
  createElement,
  addClass,
  removeClass,
  toggleClass
}
