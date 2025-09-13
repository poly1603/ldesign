/**
 * DOM工具函数
 * 
 * 提供DOM操作相关的工具函数：
 * - 元素创建和操作
 * - 事件处理
 * - 样式操作
 * - 位置计算
 * - 滚动处理
 */

/**
 * 事件监听器信息
 */
interface EventListenerInfo {
  element: Element
  event: string
  handler: EventListener
  options?: boolean | AddEventListenerOptions
}

/**
 * DOM工具类
 */
export class DOMUtils {
  /** 事件监听器存储 */
  private static eventListeners: EventListenerInfo[] = []

  /**
   * 创建DOM元素
   * @param tagName 标签名
   * @param className CSS类名
   * @param textContent 文本内容
   * @param attributes 属性对象
   */
  static createElement(
    tagName: string,
    className?: string,
    textContent?: string,
    attributes?: Record<string, string>
  ): HTMLElement {
    const element = document.createElement(tagName)

    if (className) {
      element.className = className
    }

    if (textContent) {
      element.textContent = textContent
    }

    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value)
      })
    }

    return element
  }

  /**
   * 添加事件监听器
   * @param element 目标元素
   * @param event 事件名称
   * @param handler 事件处理器
   * @param options 选项
   */
  static addEventListener(
    element: Element,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options)

    // 存储监听器信息，用于后续清理
    const listenerInfo: EventListenerInfo = {
      element,
      event,
      handler,
    }

    if (options !== undefined) {
      listenerInfo.options = options
    }

    this.eventListeners.push(listenerInfo)
  }

  /**
   * 移除事件监听器
   * @param element 目标元素
   * @param event 事件名称
   * @param handler 事件处理器
   * @param options 选项
   */
  static removeEventListener(
    element: Element,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.removeEventListener(event, handler, options)

    // 从存储中移除
    const index = this.eventListeners.findIndex(listener =>
      listener.element === element &&
      listener.event === event &&
      listener.handler === handler
    )

    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  /**
   * 清理所有事件监听器
   */
  static clearAllEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options)
    })
    this.eventListeners = []
  }

  /**
   * 添加CSS类
   * @param element 目标元素
   * @param className 类名
   */
  static addClass(element: Element, className: string): void {
    element.classList.add(className)
  }

  /**
   * 移除CSS类
   * @param element 目标元素
   * @param className 类名
   */
  static removeClass(element: Element, className: string): void {
    element.classList.remove(className)
  }

  /**
   * 切换CSS类
   * @param element 目标元素
   * @param className 类名
   */
  static toggleClass(element: Element, className: string): void {
    element.classList.toggle(className)
  }

  /**
   * 检查是否包含CSS类
   * @param element 目标元素
   * @param className 类名
   */
  static hasClass(element: Element, className: string): boolean {
    return element.classList.contains(className)
  }

  /**
   * 设置元素样式
   * @param element 目标元素
   * @param styles 样式对象
   */
  static setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined) {
        (element.style as any)[property] = value
      }
    })
  }

  /**
   * 获取元素的计算样式
   * @param element 目标元素
   * @param property 样式属性
   */
  static getComputedStyle(element: Element, property?: string): string | CSSStyleDeclaration {
    const computedStyle = window.getComputedStyle(element)
    return property ? computedStyle.getPropertyValue(property) : computedStyle
  }

  /**
   * 获取元素位置信息
   * @param element 目标元素
   */
  static getElementPosition(element: Element): DOMRect {
    return element.getBoundingClientRect()
  }

  /**
   * 获取元素相对于文档的偏移量
   * @param element 目标元素
   */
  static getElementOffset(element: Element): { top: number; left: number } {
    const rect = element.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
    }
  }

  /**
   * 检查元素是否在视口内
   * @param element 目标元素
   * @param threshold 阈值（0-1）
   */
  static isElementInViewport(element: Element, threshold: number = 0): boolean {
    const rect = element.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const windowWidth = window.innerWidth || document.documentElement.clientWidth

    const verticalVisible = (rect.top + rect.height * threshold) < windowHeight &&
      (rect.bottom - rect.height * threshold) > 0
    const horizontalVisible = (rect.left + rect.width * threshold) < windowWidth &&
      (rect.right - rect.width * threshold) > 0

    return verticalVisible && horizontalVisible
  }

  /**
   * 滚动到指定元素
   * @param element 目标元素
   * @param options 滚动选项
   */
  static scrollToElement(element: Element, options?: ScrollIntoViewOptions): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
      ...options,
    })
  }

  /**
   * 获取滚动位置
   */
  static getScrollPosition(): { x: number; y: number } {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop,
    }
  }

  /**
   * 设置滚动位置
   * @param x 水平位置
   * @param y 垂直位置
   * @param smooth 是否平滑滚动
   */
  static setScrollPosition(x: number, y: number, smooth: boolean = false): void {
    if (smooth) {
      window.scrollTo({
        left: x,
        top: y,
        behavior: 'smooth',
      })
    } else {
      window.scrollTo(x, y)
    }
  }

  /**
   * 查找最近的父元素
   * @param element 起始元素
   * @param selector CSS选择器
   */
  static closest(element: Element, selector: string): Element | null {
    return element.closest(selector)
  }

  /**
   * 查找子元素
   * @param element 父元素
   * @param selector CSS选择器
   */
  static querySelector(element: Element | Document, selector: string): Element | null {
    return element.querySelector(selector)
  }

  /**
   * 查找所有子元素
   * @param element 父元素
   * @param selector CSS选择器
   */
  static querySelectorAll(element: Element | Document, selector: string): NodeListOf<Element> {
    return element.querySelectorAll(selector)
  }

  /**
   * 插入HTML内容
   * @param element 目标元素
   * @param html HTML字符串
   * @param position 插入位置
   */
  static insertHTML(
    element: Element,
    html: string,
    position: InsertPosition = 'beforeend'
  ): void {
    element.insertAdjacentHTML(position, html)
  }

  /**
   * 清空元素内容
   * @param element 目标元素
   */
  static empty(element: Element): void {
    element.innerHTML = ''
  }

  /**
   * 移除元素
   * @param element 目标元素
   */
  static remove(element: Element): void {
    element.remove()
  }

  /**
   * 克隆元素
   * @param element 源元素
   * @param deep 是否深度克隆
   */
  static clone(element: Element, deep: boolean = true): Element {
    return element.cloneNode(deep) as Element
  }

  /**
   * 获取元素的文本内容
   * @param element 目标元素
   */
  static getText(element: Element): string {
    return element.textContent || ''
  }

  /**
   * 设置元素的文本内容
   * @param element 目标元素
   * @param text 文本内容
   */
  static setText(element: Element, text: string): void {
    element.textContent = text
  }

  /**
   * 获取元素的HTML内容
   * @param element 目标元素
   */
  static getHTML(element: Element): string {
    return element.innerHTML
  }

  /**
   * 设置元素的HTML内容
   * @param element 目标元素
   * @param html HTML内容
   */
  static setHTML(element: Element, html: string): void {
    element.innerHTML = html
  }

  /**
   * 获取或设置元素属性
   * @param element 目标元素
   * @param name 属性名
   * @param value 属性值（可选）
   */
  static attr(element: Element, name: string, value?: string): string | null {
    if (value !== undefined) {
      element.setAttribute(name, value)
      return value
    }
    return element.getAttribute(name)
  }

  /**
   * 移除元素属性
   * @param element 目标元素
   * @param name 属性名
   */
  static removeAttr(element: Element, name: string): void {
    element.removeAttribute(name)
  }

  /**
   * 检查元素是否有指定属性
   * @param element 目标元素
   * @param name 属性名
   */
  static hasAttr(element: Element, name: string): boolean {
    return element.hasAttribute(name)
  }

  /**
   * 防抖函数
   * @param func 要防抖的函数
   * @param delay 延迟时间（毫秒）
   */
  static debounce<T extends (...args: any[]) => any>(
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
   * @param delay 延迟时间（毫秒）
   */
  static throttle<T extends (...args: any[]) => any>(
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

  /**
   * 等待DOM就绪
   * @param callback 回调函数
   */
  static ready(callback: () => void): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback)
    } else {
      callback()
    }
  }

  /**
   * 检查是否为移动设备
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  /**
   * 检查是否支持触摸
   */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }
}

// 导出便捷函数
export const createElement = DOMUtils.createElement.bind(DOMUtils)
export const addEventListener = DOMUtils.addEventListener.bind(DOMUtils)
export const removeEventListener = DOMUtils.removeEventListener.bind(DOMUtils)
export const addClass = DOMUtils.addClass.bind(DOMUtils)
export const removeClass = DOMUtils.removeClass.bind(DOMUtils)
export const toggleClass = DOMUtils.toggleClass.bind(DOMUtils)
export const hasClass = DOMUtils.hasClass.bind(DOMUtils)
export const setStyles = DOMUtils.setStyles.bind(DOMUtils)
export const debounce = DOMUtils.debounce.bind(DOMUtils)
export const throttle = DOMUtils.throttle.bind(DOMUtils)
