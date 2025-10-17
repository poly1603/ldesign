/**
 * DOM 操作工具函数
 * 统一管理DOM相关操作，避免重复代码
 */

/**
 * 创建元素并设置属性
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Partial<HTMLElementTagNameMap[K]> & { style?: string | Partial<CSSStyleDeclaration> },
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)
  
  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'style') {
        if (typeof value === 'string') {
          element.style.cssText = value
        } else if (typeof value === 'object') {
          Object.assign(element.style, value)
        }
      } else if (key === 'className') {
        element.className = value as string
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, String(value))
      } else {
        (element as any)[key] = value
      }
    })
  }
  
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
 * 查询单个元素
 */
export function $(selector: string, parent: Element | Document = document): HTMLElement | null {
  return parent.querySelector(selector) as HTMLElement | null
}

/**
 * 查询多个元素
 */
export function $$(selector: string, parent: Element | Document = document): HTMLElement[] {
  return Array.from(parent.querySelectorAll(selector))
}

/**
 * 添加事件监听器（支持事件委托）
 */
export function on<K extends keyof HTMLElementEventMap>(
  element: Element | Document | Window,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void
export function on(
  element: Element | Document | Window,
  event: string,
  selector: string,
  handler: (e: Event) => void
): () => void
export function on(
  element: Element | Document | Window,
  event: string,
  selectorOrHandler: string | ((e: Event) => void),
  handlerOrOptions?: ((e: Event) => void) | boolean | AddEventListenerOptions
): () => void {
  if (typeof selectorOrHandler === 'function') {
    // 直接绑定
    element.addEventListener(event, selectorOrHandler as EventListener, handlerOrOptions as boolean | AddEventListenerOptions)
    return () => element.removeEventListener(event, selectorOrHandler as EventListener)
  } else {
    // 事件委托
    const selector = selectorOrHandler
    const handler = handlerOrOptions as (e: Event) => void
    const delegatedHandler = (e: Event) => {
      const target = e.target as Element
      const matched = target.closest(selector)
      if (matched && element.contains(matched)) {
        handler.call(matched, e)
      }
    }
    element.addEventListener(event, delegatedHandler)
    return () => element.removeEventListener(event, delegatedHandler)
  }
}

/**
 * 显示/隐藏元素
 */
export function show(element: HTMLElement): void {
  element.style.display = ''
}

export function hide(element: HTMLElement): void {
  element.style.display = 'none'
}

export function toggle(element: HTMLElement, force?: boolean): void {
  if (force !== undefined) {
    element.style.display = force ? '' : 'none'
  } else {
    element.style.display = element.style.display === 'none' ? '' : 'none'
  }
}

/**
 * 添加/移除类名
 */
export function addClass(element: Element, ...classNames: string[]): void {
  element.classList.add(...classNames)
}

export function removeClass(element: Element, ...classNames: string[]): void {
  element.classList.remove(...classNames)
}

export function toggleClass(element: Element, className: string, force?: boolean): void {
  element.classList.toggle(className, force)
}

export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className)
}

/**
 * 获取元素位置
 */
export function getPosition(element: HTMLElement): { top: number; left: number; width: number; height: number } {
  const rect = element.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height
  }
}

/**
 * 设置元素位置
 */
export function setPosition(element: HTMLElement, position: { top?: number; left?: number; right?: number; bottom?: number }): void {
  if (position.top !== undefined) element.style.top = position.top + 'px'
  if (position.left !== undefined) element.style.left = position.left + 'px'
  if (position.right !== undefined) element.style.right = position.right + 'px'
  if (position.bottom !== undefined) element.style.bottom = position.bottom + 'px'
}

/**
 * 移除元素
 */
export function remove(element: Element): void {
  element.remove()
}

/**
 * 清空元素内容
 */
export function empty(element: Element): void {
  element.innerHTML = ''
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, wait)
    }
  }
}

/**
 * 等待DOM元素出现
 */
export function waitForElement(selector: string, timeout = 5000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const element = $(selector)
    if (element) {
      return resolve(element)
    }
    
    const observer = new MutationObserver(() => {
      const element = $(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element ${selector} not found within ${timeout}ms`))
    }, timeout)
  })
}