/**
 * 性能优化工具 - 增强版
 * 包含虚拟滚动、内存管理、懒加载、防抖节流等性能优化功能
 */

import { CleanupManager, CacheManager } from './memory'

/**
 * 虚拟滚动配置
 */
export interface VirtualScrollConfig {
  /** 容器高度 */
  containerHeight: number
  /** 项目高度 */
  itemHeight: number
  /** 缓冲区大小 */
  bufferSize?: number
  /** 滚动容器 */
  scrollContainer?: HTMLElement
}

/**
 * 虚拟滚动类
 */
export class VirtualScroll {
  private config: VirtualScrollConfig
  private container: HTMLElement
  private scrollContainer: HTMLElement
  private items: any[] = []
  private visibleItems: any[] = []
  private startIndex = 0
  private endIndex = 0
  private scrollTop = 0
  private renderCallback?: (items: any[], startIndex: number) => void

  constructor(container: HTMLElement, config: VirtualScrollConfig) {
    this.container = container
    this.config = {
      bufferSize: 5,
      ...config
    }
    this.scrollContainer = config.scrollContainer || container
    this.init()
  }

  /**
   * 初始化
   */
  private init(): void {
    this.scrollContainer.addEventListener('scroll', this.handleScroll.bind(this))
    this.updateVisibleItems()
  }

  /**
   * 设置数据
   */
  public setItems(items: any[]): void {
    this.items = items
    this.updateVisibleItems()
    this.updateScrollHeight()
  }

  /**
   * 设置渲染回调
   */
  public setRenderCallback(callback: (items: any[], startIndex: number) => void): void {
    this.renderCallback = callback
  }

  /**
   * 处理滚动
   */
  private handleScroll(): void {
    this.scrollTop = this.scrollContainer.scrollTop
    this.updateVisibleItems()
  }

  /**
   * 更新可见项目
   */
  private updateVisibleItems(): void {
    const visibleCount = Math.ceil(this.config.containerHeight / this.config.itemHeight)
    const bufferSize = this.config.bufferSize || 5

    this.startIndex = Math.max(0, Math.floor(this.scrollTop / this.config.itemHeight) - bufferSize)
    this.endIndex = Math.min(this.items.length - 1, this.startIndex + visibleCount + bufferSize * 2)

    this.visibleItems = this.items.slice(this.startIndex, this.endIndex + 1)

    if (this.renderCallback) {
      this.renderCallback(this.visibleItems, this.startIndex)
    }
  }

  /**
   * 更新滚动高度
   */
  private updateScrollHeight(): void {
    const totalHeight = this.items.length * this.config.itemHeight
    this.container.style.height = `${totalHeight}px`
  }

  /**
   * 滚动到指定索引
   */
  public scrollToIndex(index: number): void {
    const scrollTop = index * this.config.itemHeight
    this.scrollContainer.scrollTop = scrollTop
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.scrollContainer.removeEventListener('scroll', this.handleScroll.bind(this))
  }
}

/**
 * 内存管理器
 */
export class MemoryManager {
  private static instance: MemoryManager
  private cache: Map<string, any> = new Map()
  private maxCacheSize = 100
  private accessTimes: Map<string, number> = new Map()

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager()
    }
    return MemoryManager.instance
  }

  /**
   * 设置缓存
   */
  public set(key: string, value: any): void {
    // 如果缓存已满，清理最少使用的项目
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastUsed()
    }

    this.cache.set(key, value)
    this.accessTimes.set(key, Date.now())
  }

  /**
   * 获取缓存
   */
  public get(key: string): any {
    const value = this.cache.get(key)
    if (value !== undefined) {
      this.accessTimes.set(key, Date.now())
    }
    return value
  }

  /**
   * 删除缓存
   */
  public delete(key: string): boolean {
    this.accessTimes.delete(key)
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  public clear(): void {
    this.cache.clear()
    this.accessTimes.clear()
  }

  /**
   * 清理最少使用的项目
   */
  private evictLeastUsed(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    this.accessTimes.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time
        oldestKey = key
      }
    })

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  /**
   * 获取缓存统计
   */
  public getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: 0 // 可以添加命中率统计
    }
  }
}

/**
 * 对象池
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn?: (obj: T) => void
  private maxSize: number

  constructor(createFn: () => T, resetFn?: (obj: T) => void, maxSize = 50) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize
  }

  /**
   * 获取对象
   */
  public acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  /**
   * 释放对象
   */
  public release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj)
      }
      this.pool.push(obj)
    }
  }

  /**
   * 清空池
   */
  public clear(): void {
    this.pool = []
  }

  /**
   * 获取池大小
   */
  public size(): number {
    return this.pool.length
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private enabled = false

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * 启用监控
   */
  public enable(): void {
    this.enabled = true
  }

  /**
   * 禁用监控
   */
  public disable(): void {
    this.enabled = false
  }

  /**
   * 开始测量
   */
  public startMeasure(name: string): void {
    if (!this.enabled) return
    performance.mark(`${name}-start`)
  }

  /**
   * 结束测量
   */
  public endMeasure(name: string): number {
    if (!this.enabled) return 0

    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)

    const measure = performance.getEntriesByName(name, 'measure')[0]
    const duration = measure.duration

    // 记录指标
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    const values = this.metrics.get(name)!
    values.push(duration)

    // 保持最近100次测量
    if (values.length > 100) {
      values.shift()
    }

    // 清理性能条目
    performance.clearMarks(`${name}-start`)
    performance.clearMarks(`${name}-end`)
    performance.clearMeasures(name)

    return duration
  }

  /**
   * 获取指标统计
   */
  public getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) {
      return null
    }

    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { avg, min, max, count: values.length }
  }

  /**
   * 获取所有指标
   */
  public getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    this.metrics.forEach((values, name) => {
      stats[name] = this.getStats(name)
    })
    return stats
  }

  /**
   * 清空指标
   */
  public clear(): void {
    this.metrics.clear()
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options?: {
    leading?: boolean
    trailing?: boolean
    maxWait?: number
  }
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  let lastCallTime = 0
  let lastInvokeTime = 0
  
  const leading = options?.leading ?? false
  const trailing = options?.trailing ?? true
  const maxWait = options?.maxWait
  
  return function debounced(...args: Parameters<T>) {
    const now = Date.now()
    
    if (!lastCallTime && !leading) {
      lastCallTime = now
    }
    
    const timeSinceLastCall = now - lastCallTime
    const timeSinceLastInvoke = now - lastInvokeTime
    
    lastCallTime = now
    
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    if (leading && !timeoutId) {
      fn(...args)
      lastInvokeTime = now
    }
    
    timeoutId = setTimeout(() => {
      if (trailing) {
        fn(...args)
        lastInvokeTime = Date.now()
      }
      timeoutId = null
      lastCallTime = 0
    }, delay)
    
    if (maxWait && timeSinceLastInvoke >= maxWait) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      fn(...args)
      lastInvokeTime = now
      lastCallTime = 0
    }
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  options?: {
    leading?: boolean
    trailing?: boolean
  }
): (...args: Parameters<T>) => void {
  let waiting = false
  let lastArgs: Parameters<T> | null = null
  
  const leading = options?.leading ?? true
  const trailing = options?.trailing ?? true
  
  return function throttled(...args: Parameters<T>) {
    if (!waiting) {
      if (leading) {
        fn(...args)
      } else {
        lastArgs = args
      }
      
      waiting = true
      
      setTimeout(() => {
        if (trailing && lastArgs) {
          fn(...lastArgs)
        }
        waiting = false
        lastArgs = null
      }, limit)
    } else {
      lastArgs = args
    }
  }
}

/**
 * 记忆化函数装饰器
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    maxSize?: number
    ttl?: number
    keyResolver?: (...args: Parameters<T>) => string
  }
): T {
  const cache = new CacheManager<ReturnType<T>>(options?.maxSize ?? 100)
  const keyResolver = options?.keyResolver || ((...args: any[]) => JSON.stringify(args))
  
  return ((...args: Parameters<T>) => {
    const key = keyResolver(...args)
    const cached = cache.get(key)
    
    if (cached !== undefined) {
      return cached
    }
    
    const result = fn(...args)
    cache.set(key, result, options?.ttl)
    
    return result
  }) as T
}

/**
 * 懒加载管理器
 */
export class LazyLoader {
  private observer: IntersectionObserver
  private loadedElements = new WeakSet<Element>()
  private loadCallback: (element: Element) => void | Promise<void>
  private cleanup = new CleanupManager()

  constructor(options?: {
    root?: Element | null
    rootMargin?: string
    threshold?: number | number[]
    loadCallback?: (element: Element) => void | Promise<void>
  }) {
    this.loadCallback = options?.loadCallback || this.defaultLoadCallback
    
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: options?.root || null,
        rootMargin: options?.rootMargin || '50px',
        threshold: options?.threshold || 0.01
      }
    )
    
    this.cleanup.addObserver(this.observer)
  }

  /**
   * 观察元素
   */
  observe(element: Element): void {
    if (!this.loadedElements.has(element)) {
      this.observer.observe(element)
    }
  }

  /**
   * 停止观察元素
   */
  unobserve(element: Element): void {
    this.observer.unobserve(element)
  }

  /**
   * 处理交叉事件
   */
  private async handleIntersection(entries: IntersectionObserverEntry[]): Promise<void> {
    for (const entry of entries) {
      if (entry.isIntersecting && !this.loadedElements.has(entry.target)) {
        this.loadedElements.add(entry.target)
        
        try {
          await this.loadCallback(entry.target)
        } catch (error) {
          console.error('Lazy loading error:', error)
        }
        
        this.observer.unobserve(entry.target)
      }
    }
  }

  /**
   * 默认加载回调
   */
  private defaultLoadCallback(element: Element): void {
    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement
      const src = img.dataset.src
      if (src) {
        img.src = src
        delete img.dataset.src
      }
    }
    
    const content = element.getAttribute('data-lazy-content')
    if (content) {
      element.innerHTML = content
      element.removeAttribute('data-lazy-content')
    }
  }

  /**
   * 销毁
   */
  dispose(): void {
    this.observer.disconnect()
    this.cleanup.dispose()
  }
}

/**
 * 批量更新管理器
 */
export class BatchUpdateManager<T> {
  private updates: T[] = []
  private batchSize: number
  private processCallback: (batch: T[]) => void | Promise<void>
  private timeoutId?: NodeJS.Timeout
  private delay: number

  constructor(options: {
    batchSize?: number
    delay?: number
    processCallback: (batch: T[]) => void | Promise<void>
  }) {
    this.batchSize = options.batchSize ?? 10
    this.delay = options.delay ?? 16
    this.processCallback = options.processCallback
  }

  /**
   * 添加更新
   */
  add(update: T): void {
    this.updates.push(update)
    
    if (this.updates.length >= this.batchSize) {
      this.flush()
    } else {
      this.scheduleFlush()
    }
  }

  /**
   * 计划刷新
   */
  private scheduleFlush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    
    this.timeoutId = setTimeout(() => this.flush(), this.delay)
  }

  /**
   * 立即刷新
   */
  async flush(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
    
    if (this.updates.length === 0) return
    
    const batch = this.updates.splice(0, this.batchSize)
    
    try {
      await this.processCallback(batch)
    } catch (error) {
      console.error('Batch update error:', error)
    }
    
    if (this.updates.length > 0) {
      this.scheduleFlush()
    }
  }

  /**
   * 清空更新
   */
  clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
    this.updates = []
  }
}

/**
 * 批处理器
 */
export class BatchProcessor<T> {
  private queue: T[] = []
  private processFn: (items: T[]) => void
  private batchSize: number
  private delay: number
  private timer?: NodeJS.Timeout

  constructor(processFn: (items: T[]) => void, batchSize = 10, delay = 100) {
    this.processFn = processFn
    this.batchSize = batchSize
    this.delay = delay
  }

  /**
   * 添加项目
   */
  public add(item: T): void {
    this.queue.push(item)

    if (this.queue.length >= this.batchSize) {
      this.flush()
    } else {
      this.scheduleFlush()
    }
  }

  /**
   * 立即处理
   */
  public flush(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }

    if (this.queue.length > 0) {
      const items = this.queue.splice(0)
      this.processFn(items)
    }
  }

  /**
   * 安排处理
   */
  private scheduleFlush(): void {
    if (this.timer) return

    this.timer = setTimeout(() => {
      this.flush()
    }, this.delay)
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.flush()
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
  }
}

/**
 * 懒加载管理器
 */
export class LazyLoader {
  private observer?: IntersectionObserver
  private callbacks: Map<Element, () => void> = new Map()

  constructor() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        { threshold: 0.1 }
      )
    }
  }

  /**
   * 观察元素
   */
  public observe(element: Element, callback: () => void): void {
    if (!this.observer) {
      // 如果不支持IntersectionObserver，立即执行回调
      callback()
      return
    }

    this.callbacks.set(element, callback)
    this.observer.observe(element)
  }

  /**
   * 停止观察元素
   */
  public unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element)
    }
    this.callbacks.delete(element)
  }

  /**
   * 处理交叉
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const callback = this.callbacks.get(entry.target)
        if (callback) {
          callback()
          this.unobserve(entry.target)
        }
      }
    })
  }

  /**
   * 销毁
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = undefined
    }
    this.callbacks.clear()
  }
}

/**
 * 性能优化工具集合
 */
export const PerformanceUtils = {
  VirtualScroll,
  MemoryManager,
  ObjectPool,
  PerformanceMonitor,
  BatchProcessor,
  LazyLoader,

  /**
   * 创建虚拟滚动
   */
  createVirtualScroll(container: HTMLElement, config: VirtualScrollConfig): VirtualScroll {
    return new VirtualScroll(container, config)
  },

  /**
   * 获取内存管理器
   */
  getMemoryManager(): MemoryManager {
    return MemoryManager.getInstance()
  },

  /**
   * 获取性能监控器
   */
  getPerformanceMonitor(): PerformanceMonitor {
    return PerformanceMonitor.getInstance()
  },

  /**
   * 创建对象池
   */
  createObjectPool<T>(createFn: () => T, resetFn?: (obj: T) => void, maxSize?: number): ObjectPool<T> {
    return new ObjectPool(createFn, resetFn, maxSize)
  },

  /**
   * 创建批处理器
   */
  createBatchProcessor<T>(processFn: (items: T[]) => void, batchSize?: number, delay?: number): BatchProcessor<T> {
    return new BatchProcessor(processFn, batchSize, delay)
  },

  /**
   * 创建懒加载管理器
   */
  createLazyLoader(): LazyLoader {
    return new LazyLoader()
  }
}
