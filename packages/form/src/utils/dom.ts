// DOM 操作工具函数

/**
 * 创建DOM元素
 */
export function createElement(
  tag: string,
  props?: Record<string, any>,
  children?: (Node | string)[],
): HTMLElement {
  const element = document.createElement(tag)

  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value
      }
      else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value)
      }
      else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase()
        element.addEventListener(eventName, value)
      }
      else {
        element.setAttribute(key, String(value))
      }
    })
  }

  if (children) {
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child))
      }
      else {
        element.appendChild(child)
      }
    })
  }

  return element
}

/**
 * 查询DOM元素
 */
export function querySelector(
  selector: string,
  context?: Element | Document,
): Element | null {
  return (context || document).querySelector(selector)
}

/**
 * 查询多个DOM元素
 */
export function querySelectorAll(
  selector: string,
  context?: Element | Document,
): NodeListOf<Element> {
  return (context || document).querySelectorAll(selector)
}

/**
 * 添加CSS类
 */
export function addClass(element: Element, className: string): void {
  element.classList.add(className)
}

/**
 * 移除CSS类
 */
export function removeClass(element: Element, className: string): void {
  element.classList.remove(className)
}

/**
 * 切换CSS类
 */
export function toggleClass(
  element: Element,
  className: string,
  force?: boolean,
): boolean {
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
  styles: Record<string, string | number>,
): void {
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, String(value))
  })
}

/**
 * 获取元素样式
 */
export function getStyle(element: Element, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property)
}

/**
 * 获取元素尺寸
 */
export function getElementSize(element: Element): {
  width: number
  height: number
} {
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
  }
}

/**
 * 获取元素位置
 */
export function getElementPosition(element: Element): { x: number, y: number } {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
  }
}

/**
 * 获取元素相对于父元素的位置
 */
export function getRelativePosition(
  element: Element,
  parent: Element,
): { x: number, y: number } {
  const elementRect = element.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  return {
    x: elementRect.left - parentRect.left,
    y: elementRect.top - parentRect.top,
  }
}

/**
 * 检查元素是否在视口内
 */
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom
    <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * 滚动到元素
 */
export function scrollToElement(
  element: Element,
  options?: ScrollIntoViewOptions,
): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
    ...options,
  })
}

/**
 * 获取元素的所有子元素
 */
export function getChildren(element: Element, selector?: string): Element[] {
  const children = Array.from(element.children)
  return selector ? children.filter(child => child.matches(selector)) : children
}

/**
 * 获取元素的父元素（可指定选择器）
 */
export function getParent(element: Element, selector?: string): Element | null {
  let parent = element.parentElement
  while (parent) {
    if (!selector || parent.matches(selector)) {
      return parent
    }
    parent = parent.parentElement
  }
  return null
}

/**
 * 获取元素的兄弟元素
 */
export function getSiblings(element: Element, selector?: string): Element[] {
  const siblings = Array.from(element.parentElement?.children || []).filter(
    sibling => sibling !== element,
  )
  return selector
    ? siblings.filter(sibling => sibling.matches(selector))
    : siblings
}

/**
 * 插入元素到指定位置
 */
export function insertElement(
  element: Element,
  target: Element,
  position: 'before' | 'after' | 'prepend' | 'append',
): void {
  switch (position) {
    case 'before':
      target.parentElement?.insertBefore(element, target)
      break
    case 'after':
      target.parentElement?.insertBefore(element, target.nextSibling)
      break
    case 'prepend':
      target.insertBefore(element, target.firstChild)
      break
    case 'append':
      target.appendChild(element)
      break
  }
}

/**
 * 移除元素
 */
export function removeElement(element: Element): void {
  element.parentElement?.removeChild(element)
}

/**
 * 克隆元素
 */
export function cloneElement(element: Element, deep = true): Element {
  return element.cloneNode(deep) as Element
}

/**
 * 获取元素的文本内容
 */
export function getTextContent(element: Element): string {
  return element.textContent || ''
}

/**
 * 设置元素的文本内容
 */
export function setTextContent(element: Element, text: string): void {
  element.textContent = text
}

/**
 * 获取元素的HTML内容
 */
export function getHtmlContent(element: Element): string {
  return element.innerHTML
}

/**
 * 设置元素的HTML内容
 */
export function setHtmlContent(element: Element, html: string): void {
  element.innerHTML = html
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
 * 获取元素属性
 */
export function getAttribute(element: Element, name: string): string | null {
  return element.getAttribute(name)
}

/**
 * 设置元素属性
 */
export function setAttribute(
  element: Element,
  name: string,
  value: string,
): void {
  element.setAttribute(name, value)
}

/**
 * 移除元素属性
 */
export function removeAttribute(element: Element, name: string): void {
  element.removeAttribute(name)
}

/**
 * 检查元素是否有属性
 */
export function hasAttribute(element: Element, name: string): boolean {
  return element.hasAttribute(name)
}
