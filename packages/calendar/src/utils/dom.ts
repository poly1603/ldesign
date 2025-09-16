/**
 * DOM操作工具函数
 */

import type { Position, Size, Rect } from '../types'

/**
 * DOM工具类
 */
export class DOMUtils {
  /**
   * 创建元素
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    className?: string,
    attributes?: Record<string, string>
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName)
    
    if (className) {
      element.className = className
    }
    
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value)
      }
    }
    
    return element
  }

  /**
   * 添加CSS类
   */
  static addClass(element: HTMLElement, className: string): void {
    element.classList.add(className)
  }

  /**
   * 移除CSS类
   */
  static removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className)
  }

  /**
   * 切换CSS类
   */
  static toggleClass(element: HTMLElement, className: string): void {
    element.classList.toggle(className)
  }

  /**
   * 检查是否包含CSS类
   */
  static hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className)
  }

  /**
   * 设置样式
   */
  static setStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    for (const [property, value] of Object.entries(styles)) {
      if (value !== undefined) {
        (element.style as any)[property] = value
      }
    }
  }

  /**
   * 获取样式
   */
  static getStyle(element: HTMLElement, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property)
  }

  /**
   * 设置属性
   */
  static setAttribute(element: HTMLElement, name: string, value: string): void {
    element.setAttribute(name, value)
  }

  /**
   * 获取属性
   */
  static getAttribute(element: HTMLElement, name: string): string | null {
    return element.getAttribute(name)
  }

  /**
   * 移除属性
   */
  static removeAttribute(element: HTMLElement, name: string): void {
    element.removeAttribute(name)
  }

  /**
   * 设置数据属性
   */
  static setData(element: HTMLElement, key: string, value: string): void {
    element.dataset[key] = value
  }

  /**
   * 获取数据属性
   */
  static getData(element: HTMLElement, key: string): string | undefined {
    return element.dataset[key]
  }

  /**
   * 查找元素
   */
  static find(selector: string, context: Document | HTMLElement = document): HTMLElement | null {
    return context.querySelector(selector)
  }

  /**
   * 查找所有元素
   */
  static findAll(selector: string, context: Document | HTMLElement = document): NodeListOf<HTMLElement> {
    return context.querySelectorAll(selector)
  }

  /**
   * 查找最近的匹配元素
   */
  static closest(element: HTMLElement, selector: string): HTMLElement | null {
    return element.closest(selector) as HTMLElement | null
  }

  /**
   * 检查元素是否匹配选择器
   */
  static matches(element: HTMLElement, selector: string): boolean {
    return element.matches(selector)
  }

  /**
   * 获取元素位置
   */
  static getPosition(element: HTMLElement): Position {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    }
  }

  /**
   * 获取元素相对位置
   */
  static getRelativePosition(element: HTMLElement): Position {
    return {
      x: element.offsetLeft,
      y: element.offsetTop
    }
  }

  /**
   * 获取元素尺寸
   */
  static getSize(element: HTMLElement): Size {
    return {
      width: element.offsetWidth,
      height: element.offsetHeight
    }
  }

  /**
   * 获取元素矩形区域
   */
  static getRect(element: HTMLElement): Rect {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height
    }
  }

  /**
   * 获取视口矩形区域
   */
  static getViewportRect(): Rect {
    return {
      x: window.scrollX,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  /**
   * 检查元素是否在视口内
   */
  static isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    )
  }

  /**
   * 滚动到元素
   */
  static scrollToElement(element: HTMLElement, options?: ScrollIntoViewOptions): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
      ...options
    })
  }

  /**
   * 滚动到指定位置
   */
  static scrollTo(x: number, y: number, smooth = true): void {
    window.scrollTo({
      left: x,
      top: y,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  /**
   * 获取滚动位置
   */
  static getScrollPosition(): Position {
    return {
      x: window.scrollX || document.documentElement.scrollLeft,
      y: window.scrollY || document.documentElement.scrollTop
    }
  }

  /**
   * 添加事件监听器
   */
  static addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(type, listener, options)
  }

  /**
   * 移除事件监听器
   */
  static removeEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void {
    element.removeEventListener(type, listener, options)
  }

  /**
   * 触发事件
   */
  static dispatchEvent(element: HTMLElement, event: Event): boolean {
    return element.dispatchEvent(event)
  }

  /**
   * 创建自定义事件
   */
  static createEvent(type: string, detail?: any): CustomEvent {
    return new CustomEvent(type, { detail })
  }

  /**
   * 阻止默认行为
   */
  static preventDefault(event: Event): void {
    event.preventDefault()
  }

  /**
   * 阻止事件冒泡
   */
  static stopPropagation(event: Event): void {
    event.stopPropagation()
  }

  /**
   * 阻止事件传播
   */
  static stopImmediatePropagation(event: Event): void {
    event.stopImmediatePropagation()
  }

  /**
   * 获取鼠标位置
   */
  static getMousePosition(event: MouseEvent): Position {
    return {
      x: event.clientX,
      y: event.clientY
    }
  }

  /**
   * 获取触摸位置
   */
  static getTouchPosition(event: TouchEvent): Position {
    const touch = event.touches[0] || event.changedTouches[0]
    return {
      x: touch.clientX,
      y: touch.clientY
    }
  }

  /**
   * 检查是否支持触摸
   */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  /**
   * 检查是否为移动设备
   */
  static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  /**
   * 获取设备像素比
   */
  static getDevicePixelRatio(): number {
    return window.devicePixelRatio || 1
  }

  /**
   * 防抖函数
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null
    
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      
      const callNow = immediate && !timeout
      
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      
      if (callNow) func(...args)
    }
  }

  /**
   * 节流函数
   */
  static throttle<T extends (...args: any[]) => any>(
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
   * 动画帧请求
   */
  static requestAnimationFrame(callback: FrameRequestCallback): number {
    return window.requestAnimationFrame(callback)
  }

  /**
   * 取消动画帧请求
   */
  static cancelAnimationFrame(id: number): void {
    window.cancelAnimationFrame(id)
  }

  /**
   * 等待下一帧
   */
  static nextFrame(): Promise<void> {
    return new Promise(resolve => {
      this.requestAnimationFrame(() => resolve())
    })
  }

  /**
   * 等待指定时间
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 复制文本到剪贴板
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const result = document.execCommand('copy')
        document.body.removeChild(textArea)
        return result
      }
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error)
      return false
    }
  }

  /**
   * 从剪贴板读取文本
   */
  static async readFromClipboard(): Promise<string | null> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return await navigator.clipboard.readText()
      }
      return null
    } catch (error) {
      console.error('Failed to read text from clipboard:', error)
      return null
    }
  }

  /**
   * 下载文件
   */
  static downloadFile(content: string, filename: string, mimeType = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * 读取文件
   */
  static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  /**
   * 获取元素的文本内容
   */
  static getTextContent(element: HTMLElement): string {
    return element.textContent || element.innerText || ''
  }

  /**
   * 设置元素的文本内容
   */
  static setTextContent(element: HTMLElement, text: string): void {
    element.textContent = text
  }

  /**
   * 获取元素的HTML内容
   */
  static getHTML(element: HTMLElement): string {
    return element.innerHTML
  }

  /**
   * 设置元素的HTML内容
   */
  static setHTML(element: HTMLElement, html: string): void {
    element.innerHTML = html
  }

  /**
   * 清空元素内容
   */
  static empty(element: HTMLElement): void {
    element.innerHTML = ''
  }

  /**
   * 移除元素
   */
  static remove(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element)
    }
  }

  /**
   * 插入元素
   */
  static insertBefore(newElement: HTMLElement, referenceElement: HTMLElement): void {
    if (referenceElement.parentNode) {
      referenceElement.parentNode.insertBefore(newElement, referenceElement)
    }
  }

  /**
   * 在元素后插入
   */
  static insertAfter(newElement: HTMLElement, referenceElement: HTMLElement): void {
    if (referenceElement.parentNode) {
      referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling)
    }
  }

  /**
   * 追加子元素
   */
  static appendChild(parent: HTMLElement, child: HTMLElement): void {
    parent.appendChild(child)
  }

  /**
   * 前置子元素
   */
  static prependChild(parent: HTMLElement, child: HTMLElement): void {
    parent.insertBefore(child, parent.firstChild)
  }

  /**
   * 替换元素
   */
  static replaceElement(newElement: HTMLElement, oldElement: HTMLElement): void {
    if (oldElement.parentNode) {
      oldElement.parentNode.replaceChild(newElement, oldElement)
    }
  }

  /**
   * 克隆元素
   */
  static cloneElement(element: HTMLElement, deep = true): HTMLElement {
    return element.cloneNode(deep) as HTMLElement
  }
}
