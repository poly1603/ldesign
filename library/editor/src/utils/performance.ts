/**
 * 性能优化工具
 * 提供防抖、节流、懒加载等性能优化功能
 */

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this
    const later = () => {
      timeout = null
      if (!immediate) func.apply(context, args)
    }

    const callNow = immediate && !timeout
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = window.setTimeout(later, wait)

    if (callNow) func.apply(context, args)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 * @param options 选项
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  let previous = 0
  const { leading = true, trailing = true } = options

  return function (this: any, ...args: Parameters<T>) {
    const context = this
    const now = Date.now()

    if (!previous && !leading) previous = now

    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(context, args)
    } else if (!timeout && trailing) {
      timeout = window.setTimeout(() => {
        previous = leading ? Date.now() : 0
        timeout = null
        func.apply(context, args)
      }, remaining)
    }
  }
}

/**
 * 使用 requestAnimationFrame 的节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (rafId !== null) {
      return
    }

    rafId = requestAnimationFrame(() => {
      func.apply(context, args)
      rafId = null
    })
  }
}

/**
 * 使用 requestIdleCallback 延迟执行
 */
export function idleCallback(
  callback: () => void,
  options?: IdleRequestOptions
): number {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, options)
  } else {
    // 降级方案
    return window.setTimeout(callback, 1) as any
  }
}

/**
 * 取消 idle callback
 */
export function cancelIdleCallback(id: number): void {
  if ('cancelIdleCallback' in window) {
    cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * 批量处理任务（分批执行，避免阻塞）
 */
export class TaskQueue {
  private tasks: Array<() => void> = []
  private isProcessing = false
  private chunkSize: number

  constructor(chunkSize = 10) {
    this.chunkSize = chunkSize
  }

  /**
   * 添加任务
   */
  add(task: () => void): void {
    this.tasks.push(task)
    this.process()
  }

  /**
   * 批量添加任务
   */
  addBatch(tasks: Array<() => void>): void {
    this.tasks.push(...tasks)
    this.process()
  }

  /**
   * 处理任务队列
   */
  private process(): void {
    if (this.isProcessing || this.tasks.length === 0) {
      return
    }

    this.isProcessing = true
    this.processChunk()
  }

  /**
   * 处理一批任务
   */
  private processChunk(): void {
    const chunk = this.tasks.splice(0, this.chunkSize)

    chunk.forEach(task => {
      try {
        task()
      } catch (error) {
        console.error('Task execution failed:', error)
      }
    })

    if (this.tasks.length > 0) {
      idleCallback(() => this.processChunk())
    } else {
      this.isProcessing = false
    }
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.tasks = []
    this.isProcessing = false
  }

  /**
   * 获取剩余任务数
   */
  getTaskCount(): number {
    return this.tasks.length
  }
}

/**
 * 虚拟滚动助手
 */
export interface VirtualScrollOptions {
  itemHeight: number
  bufferSize?: number
  onRender: (startIndex: number, endIndex: number) => void
}

export class VirtualScroll {
  private container: HTMLElement
  private options: Required<VirtualScrollOptions>
  private scrollTop = 0
  private totalItems = 0
  
  private rafId: number | null = null

  constructor(container: HTMLElement, options: VirtualScrollOptions) {
    this.container = container
    this.options = {
      bufferSize: 3,
      ...options
    }

    this.setupScrollListener()
  }

  /**
   * 设置总项目数
   */
  setTotalItems(count: number): void {
    this.totalItems = count
    this.updateContainerHeight()
    this.render()
  }

  /**
   * 设置滚动监听
   */
  private setupScrollListener(): void {
    const handleScroll = rafThrottle(() => {
      this.scrollTop = this.container.scrollTop
      this.render()
    })

    this.container.addEventListener('scroll', handleScroll)
  }

  /**
   * 更新容器高度
   */
  private updateContainerHeight(): void {
    const height = this.totalItems * this.options.itemHeight
    this.container.style.height = `${height}px`
  }

  /**
   * 渲染可见项
   */
  private render(): void {
    const containerHeight = this.container.clientHeight
    const { itemHeight, bufferSize } = this.options

    const startIndex = Math.max(
      0,
      Math.floor(this.scrollTop / itemHeight) - bufferSize
    )
    
    const endIndex = Math.min(
      this.totalItems,
      Math.ceil((this.scrollTop + containerHeight) / itemHeight) + bufferSize
    )

    this.options.onRender(startIndex, endIndex)
  }

  /**
   * 滚动到指定索引
   */
  scrollToIndex(index: number): void {
    const top = index * this.options.itemHeight
    this.container.scrollTop = top
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
    }
  }
}

/**
 * 记忆化函数（缓存结果）
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func.apply(this, args)
    cache.set(key, result)

    return result
  } as T
}

/**
 * 懒加载图片
 */
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src
        observer.disconnect()
      }
    })
  })

  observer.observe(img)
}

/**
 * 性能监控
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()

  /**
   * 开始计时
   */
  start(label: string): void {
    this.marks.set(label, performance.now())
  }

  /**
   * 结束计时并返回耗时
   */
  end(label: string): number {
    const startTime = this.marks.get(label)
    if (!startTime) {
      console.warn(`Performance mark "${label}" not found`)
      return 0
    }

    const duration = performance.now() - startTime
    this.marks.delete(label)

    return duration
  }

  /**
   * 结束计时并记录日志
   */
  endWithLog(label: string): number {
    const duration = this.end(label)
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
    return duration
  }

  /**
   * 清除所有标记
   */
  clear(): void {
    this.marks.clear()
  }
}

/**
 * 单例模式的性能监控器
 */
export const performanceMonitor = new PerformanceMonitor()









