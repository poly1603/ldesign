/**
 * 性能优化工具
 * 
 * 提供性能监控、预加载策略、虚拟滚动等性能优化功能
 */

import type { TemplateMetadata } from '../types/template'
import { componentLoader } from './loader'

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>()
  private observers = new Map<string, PerformanceObserver>()

  /**
   * 记录性能指标
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  /**
   * 获取性能统计
   */
  getStats(name: string) {
    const values = this.metrics.get(name) || []
    if (values.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 }
    }

    const sum = values.reduce((a, b) => a + b, 0)
    return {
      count: values.length,
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    }
  }

  /**
   * 监控组件加载时间
   */
  monitorComponentLoad(templateName: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const loadTime = endTime - startTime
      this.recordMetric(`component_load_${templateName}`, loadTime)
      this.recordMetric('component_load_total', loadTime)
    }
  }

  /**
   * 监控内存使用
   */
  monitorMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      // @ts-ignore
      const memory = window.performance.memory
      if (memory) {
        this.recordMetric('memory_used', memory.usedJSHeapSize)
        this.recordMetric('memory_total', memory.totalJSHeapSize)
      }
    }
  }

  /**
   * 清除指标
   */
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }

  /**
   * 获取所有统计信息
   */
  getAllStats() {
    const stats: Record<string, any> = {}
    for (const [name] of this.metrics) {
      stats[name] = this.getStats(name)
    }
    return stats
  }
}

/**
 * 预加载策略管理器
 */
export class PreloadStrategy {
  private preloadQueue: TemplateMetadata[] = []
  private preloadedSet = new Set<string>()
  private isPreloading = false
  private maxConcurrent = 3
  private currentPreloading = 0

  constructor(
    private options: {
      maxConcurrent?: number
      priority?: string[]
      delayMs?: number
    } = {}
  ) {
    this.maxConcurrent = options.maxConcurrent || 3
  }

  /**
   * 添加到预加载队列
   */
  addToQueue(templates: TemplateMetadata[]): void {
    const newTemplates = templates.filter(template => {
      const key = this.getTemplateKey(template)
      return !this.preloadedSet.has(key)
    })

    // 按优先级排序
    if (this.options.priority) {
      newTemplates.sort((a, b) => {
        const aPriority = this.options.priority!.indexOf(a.name)
        const bPriority = this.options.priority!.indexOf(b.name)
        
        if (aPriority === -1 && bPriority === -1) return 0
        if (aPriority === -1) return 1
        if (bPriority === -1) return -1
        
        return aPriority - bPriority
      })
    }

    this.preloadQueue.push(...newTemplates)
    this.processQueue()
  }

  /**
   * 处理预加载队列
   */
  private async processQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) return

    this.isPreloading = true

    while (this.preloadQueue.length > 0 && this.currentPreloading < this.maxConcurrent) {
      const template = this.preloadQueue.shift()!
      this.preloadTemplate(template)
    }

    this.isPreloading = false
  }

  /**
   * 预加载单个模板
   */
  private async preloadTemplate(template: TemplateMetadata): Promise<void> {
    const key = this.getTemplateKey(template)
    if (this.preloadedSet.has(key)) return

    this.currentPreloading++

    try {
      // 延迟预加载，避免阻塞主线程
      if (this.options.delayMs) {
        await new Promise(resolve => setTimeout(resolve, this.options.delayMs))
      }

      await componentLoader.preloadComponent(template)
      this.preloadedSet.add(key)
    } catch (error) {
      console.warn(`Failed to preload template: ${template.name}`, error)
    } finally {
      this.currentPreloading--
      
      // 继续处理队列
      if (this.preloadQueue.length > 0) {
        this.processQueue()
      }
    }
  }

  /**
   * 获取模板键
   */
  private getTemplateKey(template: TemplateMetadata): string {
    return `${template.category}:${template.device}:${template.name}`
  }

  /**
   * 清除预加载状态
   */
  clear(): void {
    this.preloadQueue = []
    this.preloadedSet.clear()
    this.currentPreloading = 0
    this.isPreloading = false
  }

  /**
   * 获取预加载统计
   */
  getStats() {
    return {
      queueLength: this.preloadQueue.length,
      preloadedCount: this.preloadedSet.size,
      currentPreloading: this.currentPreloading,
      isPreloading: this.isPreloading
    }
  }
}

/**
 * Intersection Observer 工具
 */
export class IntersectionObserverManager {
  private observers = new Map<string, IntersectionObserver>()
  private callbacks = new Map<Element, () => void>()

  /**
   * 观察元素
   */
  observe(
    element: Element, 
    callback: () => void, 
    options: IntersectionObserverInit = {}
  ): void {
    const key = this.getObserverKey(options)
    
    if (!this.observers.has(key)) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target)
            if (callback) {
              callback()
              this.unobserve(entry.target)
            }
          }
        })
      }, options)
      
      this.observers.set(key, observer)
    }

    const observer = this.observers.get(key)!
    this.callbacks.set(element, callback)
    observer.observe(element)
  }

  /**
   * 停止观察元素
   */
  unobserve(element: Element): void {
    this.callbacks.delete(element)
    
    for (const observer of this.observers.values()) {
      observer.unobserve(element)
    }
  }

  /**
   * 清理所有观察者
   */
  cleanup(): void {
    for (const observer of this.observers.values()) {
      observer.disconnect()
    }
    this.observers.clear()
    this.callbacks.clear()
  }

  /**
   * 获取观察者键
   */
  private getObserverKey(options: IntersectionObserverInit): string {
    return JSON.stringify({
      rootMargin: options.rootMargin || '0px',
      threshold: options.threshold || 0
    })
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = window.setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func(...args)
    }
  }
}

/**
 * 空闲时执行
 */
export function runWhenIdle(callback: () => void, timeout = 5000): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, 0)
  }
}

/**
 * 全局性能监控实例
 */
export const performanceMonitor = new PerformanceMonitor()

/**
 * 全局预加载策略实例
 */
export const preloadStrategy = new PreloadStrategy({
  maxConcurrent: 3,
  delayMs: 100
})

/**
 * 全局 Intersection Observer 管理器
 */
export const intersectionManager = new IntersectionObserverManager()

/**
 * 性能优化工具函数
 */
export const performanceUtils = {
  /**
   * 监控函数执行时间
   */
  measureTime: <T extends (...args: any[]) => any>(
    name: string,
    func: T
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now()
      const result = func(...args)
      const end = performance.now()
      
      performanceMonitor.recordMetric(name, end - start)
      
      return result
    }) as T
  },

  /**
   * 异步函数执行时间监控
   */
  measureAsyncTime: <T extends (...args: any[]) => Promise<any>>(
    name: string,
    func: T
  ): T => {
    return (async (...args: Parameters<T>) => {
      const start = performance.now()
      const result = await func(...args)
      const end = performance.now()
      
      performanceMonitor.recordMetric(name, end - start)
      
      return result
    }) as T
  },

  /**
   * 获取性能报告
   */
  getPerformanceReport: () => {
    return {
      metrics: performanceMonitor.getAllStats(),
      preload: preloadStrategy.getStats(),
      memory: typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance
        // @ts-ignore
        ? window.performance.memory
        : null
    }
  }
}
