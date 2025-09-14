/**
 * DOM 操作工具函数
 */

/**
 * 创建DOM元素
 */
export function createElement(
  tagName: string,
  attributes?: Record<string, any>,
  children?: (Node | string)[]
): HTMLElement {
  const element = document.createElement(tagName)
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value
      } else if (key === 'textContent') {
        element.textContent = value
      } else if (key === 'innerHTML') {
        element.innerHTML = value
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        element.setAttribute(key, value)
      }
    })
  }
  
  if (children) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child))
      } else {
        element.appendChild(child)
      }
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
 * 检查是否包含CSS类
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className)
}

/**
 * 获取元素的边界矩形
 */
export function getBoundingRect(element: HTMLElement) {
  return element.getBoundingClientRect()
}

/**
 * 获取元素的滚动位置
 */
export function getScrollPosition(element: HTMLElement) {
  return {
    top: element.scrollTop,
    left: element.scrollLeft,
  }
}

/**
 * 设置元素的滚动位置
 */
export function setScrollPosition(element: HTMLElement, top: number, left?: number) {
  element.scrollTop = top
  if (left !== undefined) {
    element.scrollLeft = left
  }
}

/**
 * 检查元素是否在视口中
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
