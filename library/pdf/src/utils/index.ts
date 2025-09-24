/**
 * PDF阅读器工具函数集合
 * 提供各种辅助功能和工具方法
 */

/**
 * 获取DOM元素
 * @param selector - 元素选择器或元素本身
 * @returns DOM元素
 */
export function getElement(selector: HTMLElement | string): HTMLElement {
  if (typeof selector === 'string') {
    const element = document.querySelector(selector) as HTMLElement
    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }
    return element
  }
  return selector
}

/**
 * 创建DOM元素
 * @param tagName - 标签名
 * @param className - 类名
 * @param attributes - 属性对象
 * @returns 创建的DOM元素
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  attributes?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName)
  
  if (className) {
    element.className = className
  }
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
  }
  
  return element
}

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * 节流函数
 * @param func - 要节流的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 节流后的函数
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
      func.apply(this, args)
    }
  }
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 检查是否为有效的页码
 * @param pageNumber - 页码
 * @param totalPages - 总页数
 * @returns 是否有效
 */
export function isValidPageNumber(pageNumber: number, totalPages: number): boolean {
  return Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages
}

/**
 * 限制数值在指定范围内
 * @param value - 数值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的数值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 生成唯一ID
 * @param prefix - 前缀
 * @returns 唯一ID字符串
 */
export function generateId(prefix = 'pdf'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 检查浏览器是否支持PDF.js
 * @returns 是否支持
 */
export function isBrowserSupported(): boolean {
  // 检查必要的API支持
  return !!(
    window.ArrayBuffer &&
    window.Uint8Array &&
    window.Promise &&
    window.Worker &&
    document.createElement('canvas').getContext('2d')
  )
}

/**
 * 获取设备像素比
 * @returns 设备像素比
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1
}

/**
 * 计算适合容器的缩放比例
 * @param containerWidth - 容器宽度
 * @param containerHeight - 容器高度
 * @param pageWidth - 页面宽度
 * @param pageHeight - 页面高度
 * @param padding - 内边距
 * @returns 缩放比例
 */
export function calculateFitScale(
  containerWidth: number,
  containerHeight: number,
  pageWidth: number,
  pageHeight: number,
  padding = 20
): number {
  const availableWidth = containerWidth - padding * 2
  const availableHeight = containerHeight - padding * 2
  
  const scaleX = availableWidth / pageWidth
  const scaleY = availableHeight / pageHeight
  
  return Math.min(scaleX, scaleY)
}

/**
 * 错误处理装饰器
 * @param target - 目标对象
 * @param propertyKey - 属性键
 * @param descriptor - 属性描述符
 */
export function errorHandler(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value
  
  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args)
    } catch (error) {
      console.error(`Error in ${propertyKey}:`, error)
      if (this.emit && typeof this.emit === 'function') {
        this.emit('error', error)
      }
      throw error
    }
  }
  
  return descriptor
}

/**
 * 深度合并对象
 * @param target - 目标对象
 * @param sources - 源对象数组
 * @returns 合并后的对象
 */
export function deepMerge<T>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  const source = sources.shift()
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  
  return deepMerge(target, ...sources)
}

/**
 * 检查是否为对象
 * @param item - 要检查的项
 * @returns 是否为对象
 */
function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}
