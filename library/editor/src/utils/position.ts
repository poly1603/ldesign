/**
 * 位置和坐标工具函数
 */

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Position {
  top: number
  left: number
  right: number
  bottom: number
}

/**
 * 调整元素位置以保持在视口内
 */
export function keepInViewport(element: HTMLElement, padding: number = 10): Point {
  const rect = element.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let x = rect.left
  let y = rect.top
  
  // 水平调整
  if (rect.right > viewportWidth - padding) {
    x = viewportWidth - rect.width - padding
  }
  if (x < padding) {
    x = padding
  }
  
  // 垂直调整
  if (rect.bottom > viewportHeight - padding) {
    y = viewportHeight - rect.height - padding
  }
  if (y < padding) {
    y = padding
  }
  
  return { x, y }
}

/**
 * 调整位置
 */
export function adjustPosition(el: HTMLElement, x: number, y: number): Point {
  const rect = el.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const padding = 10
  
  // 确保元素不超出右边界
  if (x + rect.width > viewportWidth - padding) {
    x = viewportWidth - rect.width - padding
  }
  
  // 确保元素不超出底边界
  if (y + rect.height > viewportHeight - padding) {
    y = viewportHeight - rect.height - padding
  }
  
  // 确保元素不超出左边界
  if (x < padding) {
    x = padding
  }
  
  // 确保元素不超出顶边界
  if (y < padding) {
    y = padding
  }
  
  return { x, y }
}

/**
 * 获取相对位置
 */
export function getRelativePosition(el: HTMLElement, parent: HTMLElement): Point {
  const elRect = el.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  
  return {
    x: elRect.left - parentRect.left,
    y: elRect.top - parentRect.top
  }
}

/**
 * 获取鼠标相对于元素的位置
 */
export function getMousePosition(event: MouseEvent, element: HTMLElement): Point {
  const rect = element.getBoundingClientRect()
  
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

/**
 * 获取元素中心点
 */
export function getCenterPosition(element: HTMLElement): Point {
  const rect = element.getBoundingClientRect()
  
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

/**
 * 计算两点之间的距离
 */
export function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 计算两点之间的角度
 */
export function getAngle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)
}

/**
 * 检查点是否在矩形内
 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return point.x >= rect.x &&
         point.x <= rect.x + rect.width &&
         point.y >= rect.y &&
         point.y <= rect.y + rect.height
}

/**
 * 检查两个矩形是否相交
 */
export function isRectOverlap(rect1: Rect, rect2: Rect): boolean {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y
}

/**
 * 获取元素的边界框
 */
export function getBoundingBox(element: HTMLElement): Rect {
  const rect = element.getBoundingClientRect()
  
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  }
}

/**
 * 设置元素位置
 */
export function setPosition(element: HTMLElement, x: number, y: number): void {
  element.style.position = 'fixed'
  element.style.left = `${x}px`
  element.style.top = `${y}px`
}

/**
 * 获取元素位置
 */
export function getPosition(element: HTMLElement): Position {
  const rect = element.getBoundingClientRect()
  
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom
  }
}

/**
 * 计算最佳弹出位置
 */
export function calculatePopupPosition(
  trigger: HTMLElement,
  popup: HTMLElement,
  preferredPosition: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'auto',
  offset: number = 8
): Point {
  const triggerRect = trigger.getBoundingClientRect()
  const popupRect = popup.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let x = 0
  let y = 0
  
  if (preferredPosition === 'auto') {
    // 自动选择最佳位置
    const spaceAbove = triggerRect.top
    const spaceBelow = viewportHeight - triggerRect.bottom
    const spaceLeft = triggerRect.left
    const spaceRight = viewportWidth - triggerRect.right
    
    // 优先选择下方
    if (spaceBelow >= popupRect.height + offset) {
      x = triggerRect.left + (triggerRect.width - popupRect.width) / 2
      y = triggerRect.bottom + offset
    }
    // 其次选择上方
    else if (spaceAbove >= popupRect.height + offset) {
      x = triggerRect.left + (triggerRect.width - popupRect.width) / 2
      y = triggerRect.top - popupRect.height - offset
    }
    // 然后选择右方
    else if (spaceRight >= popupRect.width + offset) {
      x = triggerRect.right + offset
      y = triggerRect.top + (triggerRect.height - popupRect.height) / 2
    }
    // 最后选择左方
    else if (spaceLeft >= popupRect.width + offset) {
      x = triggerRect.left - popupRect.width - offset
      y = triggerRect.top + (triggerRect.height - popupRect.height) / 2
    }
    // 如果都不够，选择下方并调整
    else {
      x = triggerRect.left + (triggerRect.width - popupRect.width) / 2
      y = triggerRect.bottom + offset
    }
  } else {
    switch (preferredPosition) {
      case 'top':
        x = triggerRect.left + (triggerRect.width - popupRect.width) / 2
        y = triggerRect.top - popupRect.height - offset
        break
      case 'bottom':
        x = triggerRect.left + (triggerRect.width - popupRect.width) / 2
        y = triggerRect.bottom + offset
        break
      case 'left':
        x = triggerRect.left - popupRect.width - offset
        y = triggerRect.top + (triggerRect.height - popupRect.height) / 2
        break
      case 'right':
        x = triggerRect.right + offset
        y = triggerRect.top + (triggerRect.height - popupRect.height) / 2
        break
    }
  }
  
  // 确保不超出视口
  return adjustPosition(popup, x, y)
}

/**
 * 对齐到网格
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}

/**
 * 限制在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 获取滚动位置
 */
export function getScrollPosition(): Point {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  }
}

/**
 * 设置滚动位置
 */
export function setScrollPosition(x: number, y: number): void {
  window.scrollTo(x, y)
}

/**
 * 平滑滚动到元素
 */
export function smoothScrollTo(element: HTMLElement, options?: ScrollIntoViewOptions): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'center',
    ...options
  })
}

/**
 * 获取视口尺寸
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

/**
 * 检查元素是否在视口内
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  
  return rect.top >= 0 &&
         rect.left >= 0 &&
         rect.bottom <= window.innerHeight &&
         rect.right <= window.innerWidth
}

/**
 * 检查元素是否部分在视口内
 */
export function isPartiallyInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  
  return rect.bottom > 0 &&
         rect.right > 0 &&
         rect.top < window.innerHeight &&
         rect.left < window.innerWidth
}