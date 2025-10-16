/**
 * DOM 操作工具函数
 */

export interface ElementConfig {
  tag?: string
  className?: string
  id?: string
  style?: Partial<CSSStyleDeclaration>
  attrs?: Record<string, string>
  children?: (HTMLElement | string)[]
  html?: string
  text?: string
  parent?: HTMLElement
}

/**
 * 创建元素
 */
export function createElement(config: ElementConfig): HTMLElement {
  const { 
    tag = 'div',
    className,
    id,
    style,
    attrs,
    children,
    html,
    text,
    parent
  } = config
  
  const element = document.createElement(tag)
  
  if (className) {
    element.className = className
  }
  
  if (id) {
    element.id = id
  }
  
  if (style) {
    applyStyles(element, style)
  }
  
  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
  }
  
  if (html) {
    element.innerHTML = html
  } else if (text) {
    element.textContent = text
  } else if (children) {
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child))
      } else {
        element.appendChild(child)
      }
    })
  }
  
  if (parent) {
    parent.appendChild(element)
  }
  
  return element
}

/**
 * 应用样式
 */
export function applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles)
}

/**
 * 添加类名
 */
export function addClass(element: HTMLElement, ...classNames: string[]): void {
  element.classList.add(...classNames)
}

/**
 * 移除类名
 */
export function removeClass(element: HTMLElement, ...classNames: string[]): void {
  element.classList.remove(...classNames)
}

/**
 * 切换类名
 */
export function toggleClass(element: HTMLElement, className: string, force?: boolean): boolean {
  return element.classList.toggle(className, force)
}

/**
 * 检查是否有类名
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className)
}

/**
 * 移除元素
 */
export function removeElement(element: HTMLElement): void {
  element.parentNode?.removeChild(element)
}

/**
 * 清空元素内容
 */
export function clearElement(element: HTMLElement): void {
  element.innerHTML = ''
}

/**
 * 替换元素
 */
export function replaceElement(oldElement: HTMLElement, newElement: HTMLElement): void {
  oldElement.parentNode?.replaceChild(newElement, oldElement)
}

/**
 * 插入元素到指定位置
 */
export function insertElement(
  element: HTMLElement,
  target: HTMLElement,
  position: 'before' | 'after' | 'prepend' | 'append' = 'append'
): void {
  switch (position) {
    case 'before':
      target.parentNode?.insertBefore(element, target)
      break
    case 'after':
      target.parentNode?.insertBefore(element, target.nextSibling)
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
 * 查询元素
 */
export function query<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): T | null {
  return parent.querySelector<T>(selector)
}

/**
 * 查询所有元素
 */
export function queryAll<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector))
}

/**
 * 获取元素的最近父元素
 */
export function closest<T extends HTMLElement = HTMLElement>(
  element: HTMLElement,
  selector: string
): T | null {
  return element.closest<T>(selector)
}

/**
 * 检查元素是否匹配选择器
 */
export function matches(element: HTMLElement, selector: string): boolean {
  return element.matches(selector)
}

/**
 * 获取元素的兄弟元素
 */
export function getSiblings(element: HTMLElement): HTMLElement[] {
  const parent = element.parentNode
  if (!parent) return []
  
  return Array.from(parent.children).filter(child => child !== element) as HTMLElement[]
}

/**
 * 获取元素的索引
 */
export function getIndex(element: HTMLElement): number {
  const parent = element.parentNode
  if (!parent) return -1
  
  return Array.from(parent.children).indexOf(element)
}

/**
 * 显示元素
 */
export function show(element: HTMLElement): void {
  element.style.display = ''
}

/**
 * 隐藏元素
 */
export function hide(element: HTMLElement): void {
  element.style.display = 'none'
}

/**
 * 切换显示状态
 */
export function toggle(element: HTMLElement, force?: boolean): void {
  if (force === undefined) {
    element.style.display = element.style.display === 'none' ? '' : 'none'
  } else {
    element.style.display = force ? '' : 'none'
  }
}

/**
 * 检查元素是否可见
 */
export function isVisible(element: HTMLElement): boolean {
  return element.offsetParent !== null && element.style.display !== 'none'
}

/**
 * 获取元素的文本内容
 */
export function getText(element: HTMLElement): string {
  return element.textContent || ''
}

/**
 * 设置元素的文本内容
 */
export function setText(element: HTMLElement, text: string): void {
  element.textContent = text
}

/**
 * 获取元素的HTML内容
 */
export function getHTML(element: HTMLElement): string {
  return element.innerHTML
}

/**
 * 设置元素的HTML内容
 */
export function setHTML(element: HTMLElement, html: string): void {
  element.innerHTML = html
}

/**
 * 获取元素属性
 */
export function getAttr(element: HTMLElement, name: string): string | null {
  return element.getAttribute(name)
}

/**
 * 设置元素属性
 */
export function setAttr(element: HTMLElement, name: string, value: string): void {
  element.setAttribute(name, value)
}

/**
 * 移除元素属性
 */
export function removeAttr(element: HTMLElement, name: string): void {
  element.removeAttribute(name)
}

/**
 * 检查元素是否有属性
 */
export function hasAttr(element: HTMLElement, name: string): boolean {
  return element.hasAttribute(name)
}

/**
 * 获取或设置元素数据
 */
export function data(element: HTMLElement, key: string, value?: any): any {
  if (value === undefined) {
    const data = element.dataset[key]
    try {
      return JSON.parse(data || '')
    } catch {
      return data
    }
  } else {
    element.dataset[key] = typeof value === 'string' ? value : JSON.stringify(value)
  }
}

/**
 * 包装元素
 */
export function wrap(element: HTMLElement, wrapper: HTMLElement): void {
  element.parentNode?.insertBefore(wrapper, element)
  wrapper.appendChild(element)
}

/**
 * 解包元素
 */
export function unwrap(element: HTMLElement): void {
  const parent = element.parentNode
  if (!parent || parent === document.body) return
  
  const grandParent = parent.parentNode
  if (!grandParent) return
  
  while (parent.firstChild) {
    grandParent.insertBefore(parent.firstChild, parent)
  }
  grandParent.removeChild(parent)
}

/**
 * 克隆元素
 */
export function clone(element: HTMLElement, deep: boolean = true): HTMLElement {
  return element.cloneNode(deep) as HTMLElement
}

/**
 * 检查元素是否包含另一个元素
 */
export function contains(parent: HTMLElement, child: HTMLElement): boolean {
  return parent.contains(child)
}

/**
 * 聚焦元素
 */
export function focus(element: HTMLElement): void {
  element.focus()
}

/**
 * 失焦元素
 */
export function blur(element: HTMLElement): void {
  element.blur()
}

/**
 * 滚动到元素
 */
export function scrollIntoView(element: HTMLElement, options?: ScrollIntoViewOptions): void {
  element.scrollIntoView(options)
}

/**
 * 获取元素的偏移量
 */
export function getOffset(element: HTMLElement): { top: number; left: number } {
  const rect = element.getBoundingClientRect()
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX
  }
}

/**
 * 获取元素的尺寸
 */
export function getSize(element: HTMLElement): { width: number; height: number } {
  return {
    width: element.offsetWidth,
    height: element.offsetHeight
  }
}

/**
 * 获取元素的内部尺寸
 */
export function getInnerSize(element: HTMLElement): { width: number; height: number } {
  return {
    width: element.clientWidth,
    height: element.clientHeight
  }
}

/**
 * 获取元素的外部尺寸
 */
export function getOuterSize(element: HTMLElement, includeMargin: boolean = false): { width: number; height: number } {
  const styles = getComputedStyle(element)
  let width = element.offsetWidth
  let height = element.offsetHeight
  
  if (includeMargin) {
    width += parseFloat(styles.marginLeft) + parseFloat(styles.marginRight)
    height += parseFloat(styles.marginTop) + parseFloat(styles.marginBottom)
  }
  
  return { width, height }
}

// Create button helper
export function createButton(text: string, className?: string): HTMLButtonElement {
  const button = document.createElement('button')
  button.textContent = text
  if (className) button.className = className
  return button
}

// Create icon helper
export function createIcon(iconName: string, className?: string): HTMLElement {
  const icon = document.createElement('i')
  if (className) icon.className = className
  icon.setAttribute('data-icon', iconName)
  return icon
}
