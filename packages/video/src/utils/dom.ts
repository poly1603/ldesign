/**
 * DOM操作工具函数
 * 提供DOM元素创建、查找、样式操作等功能
 */

/**
 * 创建DOM元素
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: {
    className?: string
    id?: string
    attributes?: Record<string, string>
    styles?: Partial<CSSStyleDeclaration>
    innerHTML?: string
    textContent?: string
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName)
  
  if (options) {
    if (options.className) {
      element.className = options.className
    }
    
    if (options.id) {
      element.id = options.id
    }
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value)
      })
    }
    
    if (options.styles) {
      Object.assign(element.style, options.styles)
    }
    
    if (options.innerHTML) {
      element.innerHTML = options.innerHTML
    }
    
    if (options.textContent) {
      element.textContent = options.textContent
    }
  }
  
  return element
}

/**
 * 查找DOM元素
 */
export function querySelector<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): T | null {
  return parent.querySelector<T>(selector)
}

/**
 * 查找多个DOM元素
 */
export function querySelectorAll<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): NodeListOf<T> {
  return parent.querySelectorAll<T>(selector)
}

/**
 * 添加CSS类
 */
export function addClass(element: Element, ...classNames: string[]): void {
  element.classList.add(...classNames)
}

/**
 * 移除CSS类
 */
export function removeClass(element: Element, ...classNames: string[]): void {
  element.classList.remove(...classNames)
}

/**
 * 切换CSS类
 */
export function toggleClass(element: Element, className: string, force?: boolean): boolean {
  return element.classList.toggle(className, force)
}

/**
 * 检查是否包含CSS类
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className)
}

/**
 * 设置元素样式
 */
export function setStyle(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration> | string,
  value?: string
): void {
  if (typeof styles === 'string') {
    if (value !== undefined) {
      element.style.setProperty(styles, value)
    }
  } else {
    Object.assign(element.style, styles)
  }
}

/**
 * 获取元素样式
 */
export function getStyle(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property)
}

/**
 * 获取元素尺寸
 */
export function getElementSize(element: HTMLElement): { width: number; height: number } {
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height
  }
}

/**
 * 获取元素位置
 */
export function getElementPosition(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY
  }
}

/**
 * 获取元素相对于父元素的位置
 */
export function getRelativePosition(
  element: HTMLElement,
  parent: HTMLElement
): { x: number; y: number } {
  const elementRect = element.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  
  return {
    x: elementRect.left - parentRect.left,
    y: elementRect.top - parentRect.top
  }
}

/**
 * 检查元素是否在视口中
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * 滚动到元素
 */
export function scrollToElement(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
    ...options
  })
}

/**
 * 设置元素属性
 */
export function setAttribute(
  element: Element,
  attributes: Record<string, string>
): void {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

/**
 * 获取元素属性
 */
export function getAttribute(element: Element, name: string): string | null {
  return element.getAttribute(name)
}

/**
 * 移除元素属性
 */
export function removeAttribute(element: Element, ...names: string[]): void {
  names.forEach(name => element.removeAttribute(name))
}

/**
 * 插入HTML内容
 */
export function insertHTML(
  element: Element,
  html: string,
  position: InsertPosition = 'beforeend'
): void {
  element.insertAdjacentHTML(position, html)
}

/**
 * 清空元素内容
 */
export function empty(element: Element): void {
  element.innerHTML = ''
}

/**
 * 移除元素
 */
export function remove(element: Element): void {
  element.remove()
}

/**
 * 克隆元素
 */
export function clone(element: Element, deep = true): Element {
  return element.cloneNode(deep) as Element
}

/**
 * 获取元素的所有子元素
 */
export function getChildren(element: Element): Element[] {
  return Array.from(element.children)
}

/**
 * 获取元素的父元素
 */
export function getParent(element: Element): Element | null {
  return element.parentElement
}

/**
 * 获取元素的兄弟元素
 */
export function getSiblings(element: Element): Element[] {
  const parent = element.parentElement
  if (!parent) return []
  
  return Array.from(parent.children).filter(child => child !== element)
}

/**
 * 检查元素是否匹配选择器
 */
export function matches(element: Element, selector: string): boolean {
  return element.matches(selector)
}

/**
 * 查找最近的匹配祖先元素
 */
export function closest(element: Element, selector: string): Element | null {
  return element.closest(selector)
}

/**
 * 创建文档片段
 */
export function createFragment(): DocumentFragment {
  return document.createDocumentFragment()
}

/**
 * 将元素添加到文档片段
 */
export function appendToFragment(
  fragment: DocumentFragment,
  ...elements: (Element | string)[]
): void {
  elements.forEach(element => {
    if (typeof element === 'string') {
      fragment.appendChild(document.createTextNode(element))
    } else {
      fragment.appendChild(element)
    }
  })
}

/**
 * 批量操作DOM（减少重排重绘）
 */
export function batchDOMOperation(callback: () => void): void {
  // 使用requestAnimationFrame来批量处理DOM操作
  requestAnimationFrame(callback)
}

/**
 * 等待元素加载完成
 */
export function waitForElement(
  selector: string,
  timeout = 5000,
  parent: Element | Document = document
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = parent.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }
    
    const observer = new MutationObserver(() => {
      const element = parent.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })
    
    observer.observe(parent, {
      childList: true,
      subtree: true
    })
    
    // 超时处理
    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element "${selector}" not found within ${timeout}ms`))
    }, timeout)
  })
}

/**
 * 监听元素尺寸变化
 */
export function observeResize(
  element: Element,
  callback: (entry: ResizeObserverEntry) => void
): ResizeObserver {
  const observer = new ResizeObserver(entries => {
    entries.forEach(callback)
  })
  
  observer.observe(element)
  return observer
}

/**
 * 监听元素可见性变化
 */
export function observeVisibility(
  element: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(callback)
  }, options)
  
  observer.observe(element)
  return observer
}

/**
 * 获取元素的计算样式
 */
export function getComputedStyle(element: Element): CSSStyleDeclaration {
  return window.getComputedStyle(element)
}

/**
 * 检查元素是否可见
 */
export function isVisible(element: HTMLElement): boolean {
  const style = getComputedStyle(element)
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0'
}

/**
 * 获取元素的滚动位置
 */
export function getScrollPosition(element: Element): { x: number; y: number } {
  return {
    x: element.scrollLeft,
    y: element.scrollTop
  }
}

/**
 * 设置元素的滚动位置
 */
export function setScrollPosition(
  element: Element,
  x: number,
  y: number,
  smooth = false
): void {
  if (smooth) {
    element.scrollTo({
      left: x,
      top: y,
      behavior: 'smooth'
    })
  } else {
    element.scrollLeft = x
    element.scrollTop = y
  }
}
