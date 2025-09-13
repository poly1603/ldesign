/**
 * DOM 操作工具
 * 提供基础的DOM操作功能，避免循环引用
 */

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
    if (key === 'className') {
      element.className = value
    } else {
      element.setAttribute(key, value)
    }
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
