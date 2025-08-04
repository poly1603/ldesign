/**
 * ResizeObserver 工具类
 */

import { debounce } from './throttle'

export interface ResizeEntry {
  target: Element
  contentRect: DOMRectReadOnly
  borderBoxSize?: ReadonlyArray<ResizeObserverSize>
  contentBoxSize?: ReadonlyArray<ResizeObserverSize>
  devicePixelContentBoxSize?: ReadonlyArray<ResizeObserverSize>
}

export type ResizeCallback = (entries: ResizeEntry[]) => void

/**
 * ResizeObserver 包装类
 */
export class ResizeObserverWrapper {
  private observer: ResizeObserver | null = null
  private callbacks = new Map<Element, Set<ResizeCallback>>()
  private debounceDelay: number
  private debouncedCallback: ResizeCallback

  constructor(debounceDelay: number = 16) {
    this.debounceDelay = debounceDelay
    this.debouncedCallback = debounce(this.handleResize.bind(this), debounceDelay)
    this.createObserver()
  }

  private createObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      console.warn('ResizeObserver is not supported in this environment')
      return
    }

    this.observer = new ResizeObserver((entries) => {
      const mappedEntries: ResizeEntry[] = entries.map(entry => ({
        target: entry.target,
        contentRect: entry.contentRect,
        borderBoxSize: entry.borderBoxSize,
        contentBoxSize: entry.contentBoxSize,
        devicePixelContentBoxSize: entry.devicePixelContentBoxSize,
      }))
      
      this.debouncedCallback(mappedEntries)
    })
  }

  private handleResize(entries: ResizeEntry[]): void {
    entries.forEach(entry => {
      const callbacks = this.callbacks.get(entry.target)
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback([entry])
          } catch (error) {
            console.error('Error in resize callback:', error)
          }
        })
      }
    })
  }

  /**
   * 观察元素
   */
  observe(element: Element, callback: ResizeCallback): () => void {
    if (!this.observer) {
      console.warn('ResizeObserver is not available')
      return () => {}
    }

    if (!this.callbacks.has(element)) {
      this.callbacks.set(element, new Set())
      this.observer.observe(element)
    }

    this.callbacks.get(element)!.add(callback)

    // 返回取消观察的函数
    return () => this.unobserve(element, callback)
  }

  /**
   * 取消观察元素
   */
  unobserve(element: Element, callback?: ResizeCallback): void {
    const callbacks = this.callbacks.get(element)
    if (!callbacks) return

    if (callback) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.callbacks.delete(element)
        this.observer?.unobserve(element)
      }
    } else {
      this.callbacks.delete(element)
      this.observer?.unobserve(element)
    }
  }

  /**
   * 取消观察所有元素
   */
  disconnect(): void {
    this.observer?.disconnect()
    this.callbacks.clear()
  }

  /**
   * 销毁观察器
   */
  destroy(): void {
    this.disconnect()
    this.observer = null
  }

  /**
   * 获取当前观察的元素数量
   */
  getObservedElementsCount(): number {
    return this.callbacks.size
  }

  /**
   * 检查元素是否被观察
   */
  isObserving(element: Element): boolean {
    return this.callbacks.has(element)
  }
}

// 全局 ResizeObserver 实例
let globalResizeObserver: ResizeObserverWrapper | null = null

/**
 * 获取全局 ResizeObserver 实例
 */
export function getGlobalResizeObserver(): ResizeObserverWrapper {
  if (!globalResizeObserver) {
    globalResizeObserver = new ResizeObserverWrapper()
  }
  return globalResizeObserver
}

/**
 * 观察元素尺寸变化
 */
export function observeResize(
  element: Element,
  callback: ResizeCallback,
  options?: {
    debounceDelay?: number
    useGlobal?: boolean
  }
): () => void {
  const { debounceDelay = 16, useGlobal = true } = options || {}
  
  if (useGlobal) {
    const observer = getGlobalResizeObserver()
    return observer.observe(element, callback)
  } else {
    const observer = new ResizeObserverWrapper(debounceDelay)
    const unobserve = observer.observe(element, callback)
    return () => {
      unobserve()
      observer.destroy()
    }
  }
}

/**
 * 取消观察元素尺寸变化
 */
export function unobserveResize(element: Element, callback?: ResizeCallback): void {
  if (globalResizeObserver) {
    globalResizeObserver.unobserve(element, callback)
  }
}

/**
 * 创建一个简单的尺寸变化监听器
 */
export function createResizeListener(
  element: Element,
  callback: (size: { width: number; height: number }) => void,
  options?: {
    debounceDelay?: number
    immediate?: boolean
  }
): () => void {
  const { debounceDelay = 16, immediate = true } = options || {}
  
  // 立即执行一次回调
  if (immediate) {
    const rect = element.getBoundingClientRect()
    callback({ width: rect.width, height: rect.height })
  }
  
  const resizeCallback: ResizeCallback = (entries) => {
    const entry = entries[0]
    if (entry) {
      callback({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    }
  }
  
  return observeResize(element, resizeCallback, { debounceDelay })
}

/**
 * 等待元素尺寸稳定
 */
export function waitForSizeStable(
  element: Element,
  timeout: number = 1000,
  tolerance: number = 1
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    let lastSize = { width: 0, height: 0 }
    let stableCount = 0
    const requiredStableCount = 3
    let timeoutId: number
    
    const cleanup = observeResize(element, (entries) => {
      const entry = entries[0]
      if (!entry) return
      
      const currentSize = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }
      
      const widthDiff = Math.abs(currentSize.width - lastSize.width)
      const heightDiff = Math.abs(currentSize.height - lastSize.height)
      
      if (widthDiff <= tolerance && heightDiff <= tolerance) {
        stableCount++
        if (stableCount >= requiredStableCount) {
          clearTimeout(timeoutId)
          cleanup()
          resolve(currentSize)
        }
      } else {
        stableCount = 0
      }
      
      lastSize = currentSize
    })
    
    timeoutId = window.setTimeout(() => {
      cleanup()
      reject(new Error('Timeout waiting for size to stabilize'))
    }, timeout)
  })
}

/**
 * 监听容器尺寸变化并计算最佳列数
 */
export function observeContainerForColumns(
  container: Element,
  callback: (columns: number, size: { width: number; height: number }) => void,
  options?: {
    columnWidth?: number
    gap?: number
    minColumns?: number
    maxColumns?: number
    debounceDelay?: number
  }
): () => void {
  const {
    columnWidth = 200,
    gap = 16,
    minColumns = 1,
    maxColumns = 4,
    debounceDelay = 16,
  } = options || {}
  
  return createResizeListener(
    container,
    (size) => {
      const availableWidth = size.width - gap
      const theoreticalColumns = Math.floor(
        (availableWidth + gap) / (columnWidth + gap)
      )
      const columns = Math.max(minColumns, Math.min(maxColumns, theoreticalColumns))
      
      callback(columns, size)
    },
    { debounceDelay }
  )
}

/**
 * 清理全局 ResizeObserver
 */
export function cleanupGlobalResizeObserver(): void {
  if (globalResizeObserver) {
    globalResizeObserver.destroy()
    globalResizeObserver = null
  }
}

/**
 * ResizeObserver polyfill 检测
 */
export function isResizeObserverSupported(): boolean {
  return typeof ResizeObserver !== 'undefined'
}

/**
 * 获取元素的内容尺寸（不包括边框和滚动条）
 */
export function getContentSize(element: Element): { width: number; height: number } {
  if (element instanceof HTMLElement) {
    return {
      width: element.clientWidth,
      height: element.clientHeight,
    }
  }
  
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
  }
}

/**
 * 获取元素的边框尺寸（包括边框但不包括外边距）
 */
export function getBorderBoxSize(element: Element): { width: number; height: number } {
  if (element instanceof HTMLElement) {
    return {
      width: element.offsetWidth,
      height: element.offsetHeight,
    }
  }
  
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
  }
}