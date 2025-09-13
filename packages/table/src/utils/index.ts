/**
 * 工具函数模块
 * 
 * 提供表格相关的工具函数
 * 支持数据处理、DOM操作、类型判断等功能
 */

import type { TableRow, TableId, TableColumn } from '../types'

// 导出性能优化相关工具
export { DataLazyLoader } from './DataLazyLoader'
export { IncrementalUpdater } from './IncrementalUpdater'

// 导出类型
export type { LazyLoadConfig, DataLoader } from './DataLazyLoader'
export type { IncrementalUpdateConfig, ChangeType, DataChange, BatchChange, DiffResult } from './IncrementalUpdater'

/**
 * 生成唯一ID
 * @param prefix 前缀
 */
export function generateId(prefix: string = 'table'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 深度克隆对象
 * @param obj 要克隆的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(null, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(null, args)
    }
  }
}

/**
 * 检查是否为空值
 * @param value 要检查的值
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }

  return false
}

/**
 * 获取对象的嵌套属性值
 * @param obj 对象
 * @param path 属性路径，如 'user.profile.name'
 * @param defaultValue 默认值
 */
export function getNestedValue(obj: any, path: string, defaultValue: any = undefined): any {
  if (!obj || typeof obj !== 'object') {
    return defaultValue
  }

  const keys = path.split('.')
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined || !(key in result)) {
      return defaultValue
    }
    result = result[key]
  }

  return result
}

/**
 * 设置对象的嵌套属性值
 * @param obj 对象
 * @param path 属性路径
 * @param value 要设置的值
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  if (!obj || typeof obj !== 'object') {
    return
  }

  const keys = path.split('.')
  const lastKey = keys.pop()!
  let current = obj

  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[lastKey] = value
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化数字
 * @param num 数字
 * @param options 格式化选项
 */
export function formatNumber(
  num: number,
  options: {
    decimals?: number
    thousandsSeparator?: string
    decimalSeparator?: string
  } = {}
): string {
  const {
    decimals = 0,
    thousandsSeparator = ',',
    decimalSeparator = '.'
  } = options

  const fixed = num.toFixed(decimals)
  const parts = fixed.split('.')

  // 添加千位分隔符
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)

  return parts.join(decimalSeparator)
}

/**
 * 比较两个值是否相等（深度比较）
 * @param a 值A
 * @param b 值B
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) {
    return true
  }

  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b
  }

  if (typeof a !== typeof b) {
    return false
  }

  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) {
      return false
    }

    if (Array.isArray(a)) {
      if (a.length !== b.length) {
        return false
      }

      for (let i = 0; i < a.length; i++) {
        if (!isEqual(a[i], b[i])) {
          return false
        }
      }

      return true
    }

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) {
      return false
    }

    for (const key of keysA) {
      if (!keysB.includes(key) || !isEqual(a[key], b[key])) {
        return false
      }
    }

    return true
  }

  return false
}

/**
 * 获取元素的边界矩形信息
 * @param element DOM元素
 */
export function getElementRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left
  }
}

/**
 * 检查元素是否在视口中可见
 * @param element DOM元素
 * @param threshold 可见阈值（0-1）
 */
export function isElementVisible(element: HTMLElement, threshold: number = 0): boolean {
  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth

  const verticalVisible = (rect.top + rect.height * threshold) < windowHeight &&
    (rect.bottom - rect.height * threshold) > 0
  const horizontalVisible = (rect.left + rect.width * threshold) < windowWidth &&
    (rect.right - rect.width * threshold) > 0

  return verticalVisible && horizontalVisible
}

/**
 * 创建CSS类名
 * @param baseClass 基础类名
 * @param modifiers 修饰符对象
 */
export function createClassName(
  baseClass: string,
  modifiers: Record<string, boolean> = {}
): string {
  const classes = [baseClass]

  for (const [modifier, condition] of Object.entries(modifiers)) {
    if (condition) {
      classes.push(`${baseClass}--${modifier}`)
    }
  }

  return classes.join(' ')
}

/**
 * 表格数据排序工具
 * @param data 数据数组
 * @param column 排序列
 * @param direction 排序方向
 * @param customSorter 自定义排序函数
 */
export function sortTableData<T extends TableRow>(
  data: T[],
  column: string,
  direction: 'asc' | 'desc',
  customSorter?: (a: T, b: T) => number
): T[] {
  return [...data].sort((a, b) => {
    let result = 0

    if (customSorter) {
      result = customSorter(a, b)
    } else {
      const aValue = getNestedValue(a, column)
      const bValue = getNestedValue(b, column)

      if (aValue < bValue) result = -1
      else if (aValue > bValue) result = 1
      else result = 0
    }

    return direction === 'desc' ? -result : result
  })
}

/**
 * 表格数据过滤工具
 * @param data 数据数组
 * @param filters 过滤条件
 */
export function filterTableData<T extends TableRow>(
  data: T[],
  filters: Record<string, any[]>
): T[] {
  if (Object.keys(filters).length === 0) {
    return data
  }

  return data.filter(row => {
    for (const [column, filterValues] of Object.entries(filters)) {
      if (filterValues.length === 0) {
        continue
      }

      const value = getNestedValue(row, column)
      if (!filterValues.includes(value)) {
        return false
      }
    }
    return true
  })
}
