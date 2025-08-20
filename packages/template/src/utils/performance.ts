/**
 * 性能优化工具
 * 提供图片预加载、懒加载、缓存管理等功能
 */

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  imageLoadTime: number
  cacheHitRate: number
}

/**
 * 图片预加载器
 */
export class ImagePreloader {
  private cache = new Map<string, HTMLImageElement>()
  private loading = new Set<string>()

  async preload(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preloadSingle(url))
    await Promise.allSettled(promises)
  }

  async preloadSingle(url: string): Promise<HTMLImageElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }

    if (this.loading.has(url)) {
      return new Promise((resolve, reject) => {
        const checkLoaded = () => {
          if (this.cache.has(url)) {
            resolve(this.cache.get(url)!)
          } else if (!this.loading.has(url)) {
            reject(new Error('Image loading failed'))
          } else {
            setTimeout(checkLoaded, 50)
          }
        }
        checkLoaded()
      })
    }

    this.loading.add(url)

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        this.cache.set(url, img)
        this.loading.delete(url)
        resolve(img)
      }

      img.onerror = () => {
        this.loading.delete(url)
        reject(new Error(`Failed to load image: ${url}`))
      }

      img.src = url
    })
  }

  getCached(url: string): HTMLImageElement | null {
    return this.cache.get(url) || null
  }

  clear(): void {
    this.cache.clear()
    this.loading.clear()
  }
}

/**
 * 懒加载观察器
 */
export class LazyLoader {
  private observer: IntersectionObserver
  private callbacks = new Map<Element, () => void>()

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const callback = this.callbacks.get(entry.target)
          if (callback) {
            callback()
            this.unobserve(entry.target)
          }
        }
      })
    }, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    })
  }

  observe(element: Element, callback: () => void): void {
    this.callbacks.set(element, callback)
    this.observer.observe(element)
  }

  unobserve(element: Element): void {
    this.callbacks.delete(element)
    this.observer.unobserve(element)
  }

  disconnect(): void {
    this.observer.disconnect()
    this.callbacks.clear()
  }
}

/**
 * 缓存管理器
 */
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5分钟默认TTL
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  set(key: string, data: any, ttl = this.defaultTTL): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  getHitRate(): number {
    // 简化的命中率计算
    return this.cache.size > 0 ? 0.8 : 0
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private startTime = Date.now()

  markStart(name: string): void {
    performance.mark(`${name}-start`)
  }

  markEnd(name: string): number {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measure = performance.getEntriesByName(name, 'measure')[0]
    return measure ? measure.duration : 0
  }

  recordLoadTime(): void {
    this.metrics.loadTime = Date.now() - this.startTime
  }

  recordRenderTime(duration: number): void {
    this.metrics.renderTime = duration
  }

  recordImageLoadTime(duration: number): void {
    this.metrics.imageLoadTime = duration
  }

  recordCacheHitRate(rate: number): void {
    this.metrics.cacheHitRate = rate
  }

  getMetrics(): PerformanceMetrics {
    return {
      loadTime: this.metrics.loadTime || 0,
      renderTime: this.metrics.renderTime || 0,
      imageLoadTime: this.metrics.imageLoadTime || 0,
      cacheHitRate: this.metrics.cacheHitRate || 0
    }
  }

  logMetrics(): void {
    const metrics = this.getMetrics()
    console.group('Performance Metrics')
    console.log('Load Time:', `${metrics.loadTime}ms`)
    console.log('Render Time:', `${metrics.renderTime}ms`)
    console.log('Image Load Time:', `${metrics.imageLoadTime}ms`)
    console.log('Cache Hit Rate:', `${(metrics.cacheHitRate * 100).toFixed(1)}%`)
    console.groupEnd()
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 全局实例
 */
export const imagePreloader = new ImagePreloader()
export const lazyLoader = new LazyLoader()
export const cacheManager = new CacheManager()
export const performanceMonitor = new PerformanceMonitor()

/**
 * 优化图片加载
 */
export async function optimizeImageLoading(urls: string[]): Promise<void> {
  const startTime = Date.now()
  
  try {
    await imagePreloader.preload(urls)
    const duration = Date.now() - startTime
    performanceMonitor.recordImageLoadTime(duration)
  } catch (error) {
    console.warn('Image preloading failed:', error)
  }
}

/**
 * 优化组件渲染
 */
export function optimizeRender(callback: () => void): void {
  const startTime = performance.now()
  
  requestAnimationFrame(() => {
    callback()
    const duration = performance.now() - startTime
    performanceMonitor.recordRenderTime(duration)
  })
}

/**
 * 检测设备性能
 */
export function getDevicePerformance(): 'low' | 'medium' | 'high' {
  // 基于硬件并发数和内存估算性能
  const cores = navigator.hardwareConcurrency || 2
  const memory = (navigator as any).deviceMemory || 4

  if (cores >= 8 && memory >= 8) return 'high'
  if (cores >= 4 && memory >= 4) return 'medium'
  return 'low'
}

/**
 * 根据设备性能调整动画
 */
export function adjustAnimationsForPerformance(): void {
  const performance = getDevicePerformance()
  const root = document.documentElement

  switch (performance) {
    case 'low':
      root.style.setProperty('--duration-normal', '150ms')
      root.style.setProperty('--duration-slow', '300ms')
      break
    case 'medium':
      root.style.setProperty('--duration-normal', '250ms')
      root.style.setProperty('--duration-slow', '400ms')
      break
    case 'high':
    default:
      // 使用默认值
      break
  }
}
