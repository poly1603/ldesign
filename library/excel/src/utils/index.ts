/**
 * Excel编辑器工具函数库
 * 提供各种实用的工具函数
 */

import type { CellPosition, CellRange, CellValueType, Cell } from '../types/index.js'

/**
 * 数据处理工具类
 */
export class DataUtils {
  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T
    }

    if (obj instanceof Array) {
      return obj.map(item => DataUtils.deepClone(item)) as T
    }

    if (typeof obj === 'object') {
      const cloned = {} as T
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = DataUtils.deepClone(obj[key])
        }
      }
      return cloned
    }

    return obj
  }

  /**
   * 检查值是否为空
   * @param value 要检查的值
   * @returns 是否为空
   */
  static isEmpty(value: CellValueType): boolean {
    return value === null || value === undefined || value === ''
  }

  /**
   * 格式化单元格值用于显示
   * @param value 单元格值
   * @returns 格式化后的字符串
   */
  static formatCellValue(value: CellValueType): string {
    if (DataUtils.isEmpty(value)) {
      return ''
    }

    if (typeof value === 'number') {
      return value.toString()
    }

    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE'
    }

    if (value instanceof Date) {
      return value.toLocaleDateString()
    }

    return String(value)
  }

  /**
   * 解析用户输入的值
   * @param input 用户输入
   * @returns 解析后的值
   */
  static parseUserInput(input: string): CellValueType {
    if (input === '') {
      return null
    }

    // 尝试解析为数字
    const num = Number(input)
    if (!isNaN(num) && isFinite(num)) {
      return num
    }

    // 尝试解析为布尔值
    const lowerInput = input.toLowerCase()
    if (lowerInput === 'true' || lowerInput === 'false') {
      return lowerInput === 'true'
    }

    // 尝试解析为日期
    const date = new Date(input)
    if (!isNaN(date.getTime())) {
      return date
    }

    // 默认返回字符串
    return input
  }
}

/**
 * DOM操作工具类
 */
export class DOMUtils {
  /**
   * 创建元素
   * @param tagName 标签名
   * @param className 类名
   * @param textContent 文本内容
   * @returns 创建的元素
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    className?: string,
    textContent?: string
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName)
    
    if (className) {
      element.className = className
    }
    
    if (textContent) {
      element.textContent = textContent
    }
    
    return element
  }

  /**
   * 获取元素的绝对位置
   * @param element 元素
   * @returns 位置信息
   */
  static getElementPosition(element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    }
  }

  /**
   * 检查元素是否在视口内
   * @param element 元素
   * @returns 是否在视口内
   */
  static isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  /**
   * 滚动元素到视口内
   * @param element 元素
   * @param behavior 滚动行为
   */
  static scrollIntoView(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
    element.scrollIntoView({ behavior, block: 'nearest', inline: 'nearest' })
  }
}

/**
 * 位置和范围工具类
 */
export class PositionUtils {
  /**
   * 检查位置是否有效
   * @param position 位置
   * @returns 是否有效
   */
  static isValidPosition(position: CellPosition): boolean {
    return position.row >= 0 && position.column >= 0
  }

  /**
   * 检查位置是否在范围内
   * @param position 位置
   * @param range 范围
   * @returns 是否在范围内
   */
  static isPositionInRange(position: CellPosition, range: CellRange): boolean {
    return (
      position.row >= Math.min(range.start.row, range.end.row) &&
      position.row <= Math.max(range.start.row, range.end.row) &&
      position.column >= Math.min(range.start.column, range.end.column) &&
      position.column <= Math.max(range.start.column, range.end.column)
    )
  }

  /**
   * 获取范围内的所有位置
   * @param range 范围
   * @returns 位置数组
   */
  static getPositionsInRange(range: CellRange): CellPosition[] {
    const positions: CellPosition[] = []
    
    const minRow = Math.min(range.start.row, range.end.row)
    const maxRow = Math.max(range.start.row, range.end.row)
    const minCol = Math.min(range.start.column, range.end.column)
    const maxCol = Math.max(range.start.column, range.end.column)
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        positions.push({ row, column: col })
      }
    }
    
    return positions
  }

  /**
   * 计算两个位置之间的距离
   * @param pos1 位置1
   * @param pos2 位置2
   * @returns 距离
   */
  static getDistance(pos1: CellPosition, pos2: CellPosition): number {
    const deltaRow = pos2.row - pos1.row
    const deltaCol = pos2.column - pos1.column
    return Math.sqrt(deltaRow * deltaRow + deltaCol * deltaCol)
  }

  /**
   * 创建范围
   * @param start 起始位置
   * @param end 结束位置
   * @returns 范围
   */
  static createRange(start: CellPosition, end: CellPosition): CellRange {
    return { start, end }
  }

  /**
   * 扩展范围
   * @param range 原范围
   * @param position 新位置
   * @returns 扩展后的范围
   */
  static expandRange(range: CellRange, position: CellPosition): CellRange {
    return {
      start: {
        row: Math.min(range.start.row, position.row),
        column: Math.min(range.start.column, position.column)
      },
      end: {
        row: Math.max(range.end.row, position.row),
        column: Math.max(range.end.column, position.column)
      }
    }
  }
}

/**
 * 样式工具类
 */
export class StyleUtils {
  /**
   * 应用样式到元素
   * @param element 元素
   * @param styles 样式对象
   */
  static applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(element.style, styles)
  }

  /**
   * 添加CSS类
   * @param element 元素
   * @param classNames 类名
   */
  static addClass(element: HTMLElement, ...classNames: string[]): void {
    element.classList.add(...classNames)
  }

  /**
   * 移除CSS类
   * @param element 元素
   * @param classNames 类名
   */
  static removeClass(element: HTMLElement, ...classNames: string[]): void {
    element.classList.remove(...classNames)
  }

  /**
   * 切换CSS类
   * @param element 元素
   * @param className 类名
   * @param force 强制添加或移除
   */
  static toggleClass(element: HTMLElement, className: string, force?: boolean): void {
    element.classList.toggle(className, force)
  }

  /**
   * 检查是否有CSS类
   * @param element 元素
   * @param className 类名
   * @returns 是否有该类
   */
  static hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className)
  }
}

/**
 * 事件工具类
 */
export class EventUtils {
  /**
   * 防抖函数
   * @param func 要防抖的函数
   * @param delay 延迟时间
   * @returns 防抖后的函数
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  /**
   * 节流函数
   * @param func 要节流的函数
   * @param delay 延迟时间
   * @returns 节流后的函数
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
   * 阻止事件冒泡和默认行为
   * @param event 事件对象
   */
  static preventDefault(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
  }
}
