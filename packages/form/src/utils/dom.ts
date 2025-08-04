/**
 * DOM操作工具类
 */

// 创建元素
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: {
    className?: string
    id?: string
    attrs?: Record<string, string>
    style?: Partial<CSSStyleDeclaration>
    children?: (HTMLElement | string)[]
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

    if (options.attrs) {
      Object.entries(options.attrs).forEach(([key, value]) => {
        element.setAttribute(key, value)
      })
    }

    if (options.style) {
      Object.assign(element.style, options.style)
    }

    if (options.children) {
      options.children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child))
        } else {
          element.appendChild(child)
        }
      })
    }
  }

  return element
}

// 查询元素
export function querySelector<T extends HTMLElement = HTMLElement>(
  selector: string,
  container?: HTMLElement | Document
): T | null {
  return (container || document).querySelector<T>(selector)
}

// 查询所有元素
export function querySelectorAll<T extends HTMLElement = HTMLElement>(
  selector: string,
  container?: HTMLElement | Document
): NodeListOf<T> {
  return (container || document).querySelectorAll<T>(selector)
}

// 添加类名
export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className)
}

// 移除类名
export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className)
}

// 切换类名
export function toggleClass(element: HTMLElement, className: string): void {
  element.classList.toggle(className)
}

// 检查是否有类名
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className)
}

// 设置属性
export function setAttributes(
  element: HTMLElement,
  attributes: Record<string, string>
): void {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

// 设置样式
export function setStyle(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>
): void {
  Object.assign(element.style, styles)
}

// 获取样式
export function getStyle(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property)
}

// 获取元素尺寸
export function getElementSize(element: HTMLElement): {
  width: number
  height: number
  offsetWidth: number
  offsetHeight: number
  clientWidth: number
  clientHeight: number
  scrollWidth: number
  scrollHeight: number
} {
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
    offsetWidth: element.offsetWidth,
    offsetHeight: element.offsetHeight,
    clientWidth: element.clientWidth,
    clientHeight: element.clientHeight,
    scrollWidth: element.scrollWidth,
    scrollHeight: element.scrollHeight,
  }
}

// 获取元素位置
export function getElementPosition(element: HTMLElement): {
  x: number
  y: number
  top: number
  left: number
  right: number
  bottom: number
} {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.x,
    y: rect.y,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
  }
}

// 检查元素是否在视口中
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// 滚动到元素
export function scrollToElement(
  element: HTMLElement,
  options?: ScrollIntoViewOptions
): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
    ...options,
  })
}

// 添加事件监听器
export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  element.addEventListener(type, listener, options)
  return () => element.removeEventListener(type, listener, options)
}

// 移除所有子元素
export function removeAllChildren(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

// 插入HTML
export function insertHTML(
  element: HTMLElement,
  html: string,
  position: InsertPosition = 'beforeend'
): void {
  element.insertAdjacentHTML(position, html)
}

// 获取表单数据
export function getFormData(form: HTMLFormElement): Record<string, any> {
  const formData = new FormData(form)
  const data: Record<string, any> = {}

  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      // 处理多选情况
      if (Array.isArray(data[key])) {
        data[key].push(value)
      } else {
        data[key] = [data[key], value]
      }
    } else {
      data[key] = value
    }
  }

  return data
}

// 设置表单数据
export function setFormData(
  form: HTMLFormElement,
  data: Record<string, any>
): void {
  Object.entries(data).forEach(([key, value]) => {
    const elements = form.querySelectorAll<HTMLInputElement>(`[name="${key}"]`)

    elements.forEach(element => {
      if (element.type === 'checkbox' || element.type === 'radio') {
        element.checked = Array.isArray(value)
          ? value.includes(element.value)
          : element.value === String(value)
      } else {
        element.value = String(value || '')
      }
    })
  })
}

// 检查元素是否可见
export function isElementVisible(element: HTMLElement): boolean {
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length)
}

// 获取最近的滚动容器
export function getScrollParent(element: HTMLElement): HTMLElement {
  let parent = element.parentElement

  while (parent) {
    const style = getComputedStyle(parent)
    if (style.overflow !== 'visible' || style.overflowY !== 'visible') {
      return parent
    }
    parent = parent.parentElement
  }

  return document.documentElement
}

// 创建样式表
export function createStyleSheet(css: string, id?: string): HTMLStyleElement {
  const style = document.createElement('style')
  style.textContent = css

  if (id) {
    style.id = id
  }

  document.head.appendChild(style)
  return style
}

// 移除样式表
export function removeStyleSheet(id: string): void {
  const style = document.getElementById(id)
  if (style) {
    style.remove()
  }
}