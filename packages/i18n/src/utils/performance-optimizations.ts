/**
 * Performance optimization utilities for i18n
 * 
 * 提供各种性能优化工具和技术
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import type { TranslationParams } from '../core/types'

/**
 * Memoization decorator for functions
 * 
 * 缓存函数调用结果，避免重复计算
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number
    ttl?: number
    keyGenerator?: (...args: Parameters<T>) => string
  } = {}
): T {
  const { maxSize = 100, ttl = 0, keyGenerator = (...args: any[]) => JSON.stringify(args) } = options
  const cache = new Map<string, { value: ReturnType<T>, timestamp: number }>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator(...args)
    const cached = cache.get(key)

    // Check if cached value exists and is not expired
    if (cached) {
      if (ttl === 0 || Date.now() - cached.timestamp < ttl) {
        return cached.value
      }
      cache.delete(key)
    }

    // Calculate new value
    const value = fn(...args)

    // Apply LRU eviction if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value
      if (firstKey !== undefined) {
        cache.delete(firstKey)
      }
    }

    cache.set(key, { value, timestamp: Date.now() })
    return value
  }) as T
}

/**
 * Debounce function calls
 * 
 * 防抖函数，减少频繁调用
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttle function calls
 * 
 * 节流函数，限制调用频率
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle = false
  let lastResult: ReturnType<T> | undefined

  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    if (!inThrottle) {
      lastResult = fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
      return lastResult
    }
    return lastResult
  }
}

/**
 * Request Animation Frame based batching
 * 
 * 使用 requestAnimationFrame 批处理更新
 */
export class BatchProcessor<T> {
  private queue: T[] = []
  private processing = false
  private processor: (items: T[]) => void

  constructor(processor: (items: T[]) => void) {
    this.processor = processor
  }

  add(item: T): void {
    this.queue.push(item)
    this.scheduleProcessing()
  }

  private scheduleProcessing(): void {
    if (this.processing) return

    this.processing = true

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => this.process())
    } else {
      setTimeout(() => this.process(), 0)
    }
  }

  private process(): void {
    const items = [...this.queue]
    this.queue = []
    this.processing = false

    if (items.length > 0) {
      this.processor(items)
    }
  }
}

/**
 * Lazy loading wrapper
 * 
 * 懒加载包装器，延迟资源加载
 */
export class LazyLoader<T> {
  private value?: T
  private loading = false
  private loadPromise?: Promise<T>
  private loader: () => Promise<T>

  constructor(loader: () => Promise<T>) {
    this.loader = loader
  }

  async get(): Promise<T> {
    if (this.value !== undefined) {
      return this.value
    }

    if (this.loading) {
      return this.loadPromise!
    }

    this.loading = true
    this.loadPromise = this.loader()

    try {
      this.value = await this.loadPromise
      return this.value
    } finally {
      this.loading = false
      this.loadPromise = undefined
    }
  }

  isLoaded(): boolean {
    return this.value !== undefined
  }

  reset(): void {
    this.value = undefined
    this.loading = false
    this.loadPromise = undefined
  }
}

/**
 * String interpolation optimization
 * 
 * 优化字符串插值性能
 */
export class OptimizedInterpolator {
  private compiledTemplates = new Map<string, (params: TranslationParams) => string>()

  interpolate(template: string, params?: TranslationParams): string {
    if (!params || Object.keys(params).length === 0) {
      return template
    }

    let compiled = this.compiledTemplates.get(template)

    if (!compiled) {
      compiled = this.compileTemplate(template)
      this.compiledTemplates.set(template, compiled)
    }

    return compiled(params)
  }

  private compileTemplate(template: string): (params: TranslationParams) => string {
    // Extract all placeholders
    const placeholders: string[] = []
    const regex = /\{\{([^}]+)\}\}/g
    let match: RegExpExecArray | null

    while ((match = regex.exec(template)) !== null) {
      placeholders.push(match[1].trim())
    }

    // Create optimized function
    return (params: TranslationParams) => {
      let result = template

      for (const placeholder of placeholders) {
        const value = params[placeholder]
        if (value !== undefined) {
          result = result.replace(
            new RegExp(`\\{\\{\\s*${placeholder}\\s*\\}\\}`, 'g'),
            String(value)
          )
        }
      }

      return result
    }
  }

  clearCache(): void {
    this.compiledTemplates.clear()
  }
}

/**
 * Virtual scrolling for language lists
 * 
 * 虚拟滚动优化大列表性能
 */
export class VirtualScroller<T> {
  private items: T[]
  private itemHeight: number
  private containerHeight: number
  private overscan: number

  constructor(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan = 3
  ) {
    this.items = items
    this.itemHeight = itemHeight
    this.containerHeight = containerHeight
    this.overscan = overscan
  }

  getVisibleItems(scrollTop: number): {
    items: T[]
    startIndex: number
    endIndex: number
    offsetY: number
  } {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / this.itemHeight) - this.overscan
    )
    const endIndex = Math.min(
      this.items.length - 1,
      Math.ceil((scrollTop + this.containerHeight) / this.itemHeight) + this.overscan
    )

    return {
      items: this.items.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex,
      offsetY: startIndex * this.itemHeight
    }
  }

  getTotalHeight(): number {
    return this.items.length * this.itemHeight
  }
}

/**
 * Resource preloader
 * 
 * 资源预加载器
 */
export class ResourcePreloader {
  private preloadQueue: (() => Promise<void>)[] = []
  private preloading = false

  add(loader: () => Promise<void>): void {
    this.preloadQueue.push(loader)
    this.processQueue()
  }

  private async processQueue(): Promise<void> {
    if (this.preloading || this.preloadQueue.length === 0) {
      return
    }

    this.preloading = true

    // Use requestIdleCallback if available
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(async () => {
        await this.preloadNext()
      })
    } else {
      setTimeout(async () => {
        await this.preloadNext()
      }, 100)
    }
  }

  private async preloadNext(): Promise<void> {
    const loader = this.preloadQueue.shift()

    if (loader) {
      try {
        await loader()
      } catch (error) {
        console.error('Preload error:', error)
      }
    }

    this.preloading = false

    if (this.preloadQueue.length > 0) {
      this.processQueue()
    }
  }
}

/**
 * Memory usage monitor
 * 
 * 内存使用监控
 */
export class MemoryMonitor {
  private threshold: number
  private callback: (usage: number) => void
  private interval: NodeJS.Timeout | null = null

  constructor(threshold: number, callback: (usage: number) => void) {
    this.threshold = threshold
    this.callback = callback
  }

  start(intervalMs = 5000): void {
    if (this.interval) return

    this.interval = setInterval(() => {
      const usage = this.getMemoryUsage()
      if (usage > this.threshold) {
        this.callback(usage)
      }
    }, intervalMs)
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit
    }
    return 0
  }
}

/**
 * Web Worker based translator
 * 
 * 使用 Web Worker 进行翻译处理
 */
export class WorkerTranslator {
  private worker?: Worker
  private pendingRequests = new Map<string, (value: string) => void>()

  constructor(workerScript?: string) {
    if (typeof Worker !== 'undefined' && workerScript) {
      this.worker = new Worker(workerScript)
      this.worker.onmessage = (e) => {
        const { id, result } = e.data
        const resolver = this.pendingRequests.get(id)
        if (resolver) {
          resolver(result)
          this.pendingRequests.delete(id)
        }
      }
    }
  }

  async translate(key: string, params?: TranslationParams): Promise<string> {
    if (!this.worker) {
      throw new Error('Worker not available')
    }

    const id = `${key}-${Date.now()}-${Math.random()}`

    return new Promise((resolve) => {
      this.pendingRequests.set(id, resolve)
      this.worker!.postMessage({ id, key, params })
    })
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = undefined
    }
    this.pendingRequests.clear()
  }
}

/**
 * Create optimized translation function
 * 
 * 创建优化的翻译函数
 */
export function createOptimizedTranslator(
  translator: (key: string, params?: TranslationParams) => string
): (key: string, params?: TranslationParams) => string {
  const memoized = memoize(translator, {
    maxSize: 500,
    ttl: 60000, // 1 minute
    keyGenerator: (key, params) => `${key}:${JSON.stringify(params || {})}`
  })

  const interpolator = new OptimizedInterpolator()

  return (key: string, params?: TranslationParams): string => {
    const template = memoized(key, undefined)

    if (params && template.includes('{{')) {
      return interpolator.interpolate(template, params)
    }

    return template
  }
}

export default {
  memoize,
  debounce,
  throttle,
  BatchProcessor,
  LazyLoader,
  OptimizedInterpolator,
  VirtualScroller,
  ResourcePreloader,
  MemoryMonitor,
  WorkerTranslator,
  createOptimizedTranslator
}
