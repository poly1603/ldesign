/**
 * LDesign QRCode - 性能优化功能
 * 包括DOM元素复用、懒加载、Web Workers支持等
 */

import type { QRCodeOptions, QRCodeResult } from '../types'
import type { WorkerMessage, WorkerResponse } from '../types/advanced'

// DOM元素池管理
export class DOMElementPool {
  private canvasPool: HTMLCanvasElement[] = []
  private svgPool: SVGElement[] = []
  private maxPoolSize: number

  constructor(maxPoolSize = 10) {
    this.maxPoolSize = maxPoolSize
  }

  /**
   * 获取Canvas元素
   */
  getCanvas(width: number, height: number): HTMLCanvasElement {
    let canvas = this.canvasPool.pop()
    
    if (!canvas) {
      canvas = document.createElement('canvas')
    }
    
    canvas.width = width
    canvas.height = height
    
    // 清除之前的内容
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, width, height)
    }
    
    return canvas
  }

  /**
   * 获取SVG元素
   */
  getSVG(width: number, height: number): SVGElement {
    let svg = this.svgPool.pop()
    
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    }
    
    svg.setAttribute('width', width.toString())
    svg.setAttribute('height', height.toString())
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    
    // 清除之前的内容
    svg.innerHTML = ''
    
    return svg
  }

  /**
   * 归还Canvas元素到池中
   */
  returnCanvas(canvas: HTMLCanvasElement): void {
    if (this.canvasPool.length < this.maxPoolSize) {
      this.canvasPool.push(canvas)
    }
  }

  /**
   * 归还SVG元素到池中
   */
  returnSVG(svg: SVGElement): void {
    if (this.svgPool.length < this.maxPoolSize) {
      this.svgPool.push(svg)
    }
  }

  /**
   * 清空元素池
   */
  clear(): void {
    this.canvasPool = []
    this.svgPool = []
  }

  /**
   * 获取池状态
   */
  getStats(): { canvas: number, svg: number } {
    return {
      canvas: this.canvasPool.length,
      svg: this.svgPool.length
    }
  }
}

// 懒加载管理器
export class LazyLoadManager {
  private observer: IntersectionObserver | null = null
  private pendingElements = new Map<Element, () => Promise<void>>()
  
  constructor(options: IntersectionObserverInit = {}) {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px',
          threshold: 0.1,
          ...options
        }
      )
    }
  }

  /**
   * 注册需要懒加载的元素
   */
  register(element: Element, loadFunction: () => Promise<void>): void {
    if (!this.observer) {
      // 如果不支持IntersectionObserver，直接加载
      loadFunction()
      return
    }

    this.pendingElements.set(element, loadFunction)
    this.observer.observe(element)
  }

  /**
   * 取消注册元素
   */
  unregister(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element)
    }
    this.pendingElements.delete(element)
  }

  /**
   * 处理交叉观察回调
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const loadFunction = this.pendingElements.get(entry.target)
        if (loadFunction) {
          loadFunction()
          this.unregister(entry.target)
        }
      }
    })
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.pendingElements.clear()
  }
}

// Web Worker 管理器
export class WorkerManager {
  private worker: Worker | null = null
  private pendingTasks = new Map<string, {
    resolve: (value: any) => void
    reject: (error: Error) => void
  }>()

  constructor(workerScript?: string) {
    if (typeof Worker !== 'undefined' && workerScript) {
      try {
        this.worker = new Worker(workerScript)
        this.worker.onmessage = this.handleWorkerMessage.bind(this)
        this.worker.onerror = this.handleWorkerError.bind(this)
      } catch (error) {
        console.warn('Failed to create worker:', error)
      }
    }
  }

  /**
   * 检查Worker是否可用
   */
  isAvailable(): boolean {
    return this.worker !== null
  }

  /**
   * 在Worker中执行任务
   */
  async execute<T = any>(
    type: 'generate' | 'batch' | 'validate',
    payload: any
  ): Promise<T> {
    if (!this.worker) {
      throw new Error('Worker is not available')
    }

    return new Promise((resolve, reject) => {
      const id = this.generateTaskId()
      const message: WorkerMessage = { id, type, payload }
      
      this.pendingTasks.set(id, { resolve, reject })
      this.worker!.postMessage(message)

      // 设置超时
      setTimeout(() => {
        if (this.pendingTasks.has(id)) {
          this.pendingTasks.delete(id)
          reject(new Error('Worker task timeout'))
        }
      }, 30000) // 30秒超时
    })
  }

  /**
   * 处理Worker消息
   */
  private handleWorkerMessage(event: MessageEvent): void {
    const response: WorkerResponse = event.data
    const task = this.pendingTasks.get(response.id)
    
    if (task) {
      this.pendingTasks.delete(response.id)
      
      if (response.success) {
        task.resolve(response.data)
      } else {
        task.reject(new Error(response.error || 'Worker task failed'))
      }
    }
  }

  /**
   * 处理Worker错误
   */
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker error:', error)
    // 清理所有待处理任务
    this.pendingTasks.forEach(task => {
      task.reject(new Error('Worker encountered an error'))
    })
    this.pendingTasks.clear()
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 销毁Worker
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    
    // 拒绝所有待处理任务
    this.pendingTasks.forEach(task => {
      task.reject(new Error('Worker was terminated'))
    })
    this.pendingTasks.clear()
  }
}

// 内存管理器
export class MemoryManager {
  private imageCache = new Map<string, HTMLImageElement>()
  private maxImageCacheSize = 50
  private gcThreshold = 0.8 // 当内存使用超过80%时触发GC

  /**
   * 缓存图片
   */
  cacheImage(src: string, image: HTMLImageElement): void {
    if (this.imageCache.size >= this.maxImageCacheSize) {
      // 删除最旧的图片
      const firstKey = this.imageCache.keys().next().value
      if (firstKey) {
        this.imageCache.delete(firstKey)
      }
    }
    
    this.imageCache.set(src, image)
  }

  /**
   * 获取缓存的图片
   */
  getCachedImage(src: string): HTMLImageElement | null {
    return this.imageCache.get(src) || null
  }

  /**
   * 检查内存使用情况并触发清理
   */
  checkMemoryUsage(): void {
    if (this.isMemoryPressure()) {
      this.performGC()
    }
  }

  /**
   * 检查是否有内存压力
   */
  private isMemoryPressure(): boolean {
    if ('memory' in performance && (performance as any).memory) {
      const memInfo = (performance as any).memory
      return memInfo.usedJSHeapSize / memInfo.totalJSHeapSize > this.gcThreshold
    }
    
    // 如果无法获取内存信息，使用缓存大小作为指标
    return this.imageCache.size > this.maxImageCacheSize * 0.8
  }

  /**
   * 执行垃圾回收
   */
  private performGC(): void {
    // 清理图片缓存
    const toDelete = Math.floor(this.imageCache.size * 0.3) // 删除30%的缓存
    let deleted = 0
    
    for (const [key] of this.imageCache) {
      if (deleted >= toDelete) break
      this.imageCache.delete(key)
      deleted++
    }

    // 建议浏览器进行垃圾回收（如果支持）
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
    }
  }

  /**
   * 获取内存统计
   */
  getMemoryStats(): {
    imageCacheSize: number
    maxImageCacheSize: number
    memoryInfo?: any
  } {
    const stats = {
      imageCacheSize: this.imageCache.size,
      maxImageCacheSize: this.maxImageCacheSize
    }

    if ('memory' in performance && (performance as any).memory) {
      (stats as any).memoryInfo = (performance as any).memory
    }

    return stats
  }

  /**
   * 清理所有缓存
   */
  clear(): void {
    this.imageCache.clear()
  }
}

// 性能监控器
export class AdvancedPerformanceMonitor {
  private metrics = new Map<string, number[]>()
  private observers = new Map<string, PerformanceObserver>()

  constructor() {
    this.initializeObservers()
  }

  /**
   * 初始化性能观察器
   */
  private initializeObservers(): void {
    if (typeof PerformanceObserver === 'undefined') return

    // 监控导航时间
    if ('navigation' in PerformanceObserver.supportedEntryTypes) {
      const navObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.recordMetric('navigation', entry.duration)
        })
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.set('navigation', navObserver)
    }

    // 监控资源加载
    if ('resource' in PerformanceObserver.supportedEntryTypes) {
      const resourceObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.recordMetric('resource', entry.duration)
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', resourceObserver)
    }
  }

  /**
   * 记录指标
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // 限制存储的数据量
    if (values.length > 100) {
      values.shift()
    }
  }

  /**
   * 获取指标统计
   */
  getMetricStats(name: string): {
    count: number
    average: number
    min: number
    max: number
    latest: number
  } | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null

    return {
      count: values.length,
      average: values.reduce((a, b) => a + b) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1]
    }
  }

  /**
   * 获取所有指标名称
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys())
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.metrics.clear()
  }
}

// 全局性能管理器
export class GlobalPerformanceManager {
  private elementPool = new DOMElementPool()
  private lazyLoader = new LazyLoadManager()
  private memoryManager = new MemoryManager()
  private performanceMonitor = new AdvancedPerformanceMonitor()
  private workerManager: WorkerManager | null = null

  constructor(workerScript?: string) {
    if (workerScript) {
      this.workerManager = new WorkerManager(workerScript)
    }

    // 定期检查内存使用情况
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.memoryManager.checkMemoryUsage()
      }, 30000) // 每30秒检查一次
    }
  }

  /**
   * 获取DOM元素池
   */
  getElementPool(): DOMElementPool {
    return this.elementPool
  }

  /**
   * 获取懒加载管理器
   */
  getLazyLoader(): LazyLoadManager {
    return this.lazyLoader
  }

  /**
   * 获取内存管理器
   */
  getMemoryManager(): MemoryManager {
    return this.memoryManager
  }

  /**
   * 获取性能监控器
   */
  getPerformanceMonitor(): AdvancedPerformanceMonitor {
    return this.performanceMonitor
  }

  /**
   * 获取Worker管理器
   */
  getWorkerManager(): WorkerManager | null {
    return this.workerManager
  }

  /**
   * 获取综合性能统计
   */
  getPerformanceStats(): {
    elementPool: { canvas: number, svg: number }
    memoryStats: any
    performanceMetrics: string[]
    workerAvailable: boolean
  } {
    return {
      elementPool: this.elementPool.getStats(),
      memoryStats: this.memoryManager.getMemoryStats(),
      performanceMetrics: this.performanceMonitor.getMetricNames(),
      workerAvailable: this.workerManager?.isAvailable() || false
    }
  }

  /**
   * 销毁性能管理器
   */
  destroy(): void {
    this.elementPool.clear()
    this.lazyLoader.destroy()
    this.memoryManager.clear()
    this.performanceMonitor.destroy()
    this.workerManager?.destroy()
  }
}

// 全局实例
export const globalPerformanceManager = new GlobalPerformanceManager()

// 便利函数
export function getPerformanceManager(): GlobalPerformanceManager {
  return globalPerformanceManager
}
