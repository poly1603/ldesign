/**
 * 内存管理工具 - 防止内存泄漏
 */

/**
 * 清理管理器 - 管理所有需要清理的资源
 */
export class CleanupManager {
  private cleanupTasks: Map<string, () => void> = new Map()
  private timers: Set<NodeJS.Timeout> = new Set()
  private intervals: Set<NodeJS.Timeout> = new Set()
  private animationFrames: Set<number> = new Set()
  private observers: Set<{ observer: any; disconnect: () => void }> = new Set()
  private eventListeners: Array<{
    element: EventTarget
    event: string
    handler: EventListener
    options?: boolean | AddEventListenerOptions
  }> = []
  private abortControllers: Set<AbortController> = new Set()
  private disposed = false

  /**
   * 注册清理任务
   */
  register(id: string, cleanup: () => void): void {
    if (this.disposed) {
      throw new Error('CleanupManager has been disposed')
    }
    this.cleanupTasks.set(id, cleanup)
  }

  /**
   * 注销清理任务
   */
  unregister(id: string): void {
    const cleanup = this.cleanupTasks.get(id)
    if (cleanup) {
      cleanup()
      this.cleanupTasks.delete(id)
    }
  }

  /**
   * 添加定时器
   */
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      callback()
      this.timers.delete(timer)
    }, delay)
    this.timers.add(timer)
    return timer
  }

  /**
   * 清除定时器
   */
  clearTimeout(timer: NodeJS.Timeout): void {
    if (this.timers.has(timer)) {
      clearTimeout(timer)
      this.timers.delete(timer)
    }
  }

  /**
   * 添加间隔定时器
   */
  setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay)
    this.intervals.add(interval)
    return interval
  }

  /**
   * 清除间隔定时器
   */
  clearInterval(interval: NodeJS.Timeout): void {
    if (this.intervals.has(interval)) {
      clearInterval(interval)
      this.intervals.delete(interval)
    }
  }

  /**
   * 请求动画帧
   */
  requestAnimationFrame(callback: FrameRequestCallback): number {
    const frameId = window.requestAnimationFrame((time) => {
      callback(time)
      this.animationFrames.delete(frameId)
    })
    this.animationFrames.add(frameId)
    return frameId
  }

  /**
   * 取消动画帧
   */
  cancelAnimationFrame(frameId: number): void {
    if (this.animationFrames.has(frameId)) {
      window.cancelAnimationFrame(frameId)
      this.animationFrames.delete(frameId)
    }
  }

  /**
   * 添加事件监听器
   */
  addEventListener(
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options)
    this.eventListeners.push({ element, event, handler, options })
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(
    element: EventTarget,
    event: string,
    handler: EventListener
  ): void {
    element.removeEventListener(event, handler)
    const index = this.eventListeners.findIndex(
      (item) => item.element === element && item.event === event && item.handler === handler
    )
    if (index >= 0) {
      this.eventListeners.splice(index, 1)
    }
  }

  /**
   * 添加观察器
   */
  addObserver(observer: any): void {
    if (observer && typeof observer.disconnect === 'function') {
      this.observers.add({ observer, disconnect: () => observer.disconnect() })
    }
  }

  /**
   * 创建AbortController
   */
  createAbortController(): AbortController {
    const controller = new AbortController()
    this.abortControllers.add(controller)
    return controller
  }

  /**
   * 清理所有资源
   */
  dispose(): void {
    if (this.disposed) return

    // 清理定时器
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()

    // 清理间隔定时器
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals.clear()

    // 清理动画帧
    this.animationFrames.forEach(frameId => window.cancelAnimationFrame(frameId))
    this.animationFrames.clear()

    // 清理事件监听器
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options)
    })
    this.eventListeners = []

    // 清理观察器
    this.observers.forEach(({ disconnect }) => disconnect())
    this.observers.clear()

    // 中止所有请求
    this.abortControllers.forEach(controller => controller.abort())
    this.abortControllers.clear()

    // 执行所有清理任务
    this.cleanupTasks.forEach(cleanup => cleanup())
    this.cleanupTasks.clear()

    this.disposed = true
  }

  /**
   * 检查是否已销毁
   */
  isDisposed(): boolean {
    return this.disposed
  }
}

/**
 * 对象池 - 复用对象以减少内存分配
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset?: (obj: T) => void
  private maxSize: number

  constructor(factory: () => T, reset?: (obj: T) => void, maxSize = 100) {
    this.factory = factory
    this.reset = reset
    this.maxSize = maxSize
  }

  /**
   * 获取对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.factory()
  }

  /**
   * 释放对象
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.reset) {
        this.reset(obj)
      }
      this.pool.push(obj)
    }
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = []
  }

  /**
   * 获取池中对象数量
   */
  size(): number {
    return this.pool.length
  }
}

/**
 * 缓存管理器 - 带有大小限制和过期时间的缓存
 */
export class CacheManager<T> {
  private cache: Map<string, { value: T; expires?: number }> = new Map()
  private maxSize: number
  private cleanupInterval?: NodeJS.Timeout

  constructor(maxSize = 1000, cleanupIntervalMs = 60000) {
    this.maxSize = maxSize
    
    // 定期清理过期缓存
    if (cleanupIntervalMs > 0) {
      this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs)
    }
  }

  /**
   * 设置缓存
   */
  set(key: string, value: T, ttl?: number): void {
    // 检查缓存大小
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // 删除最旧的缓存项
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    const expires = ttl ? Date.now() + ttl : undefined
    this.cache.set(key, { value, expires })
  }

  /**
   * 获取缓存
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key)
    
    if (!item) return undefined
    
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key)
      return undefined
    }
    
    return item.value
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) return false
    
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expires && item.expires < now) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 销毁缓存管理器
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }
}

/**
 * 弱引用管理器 - 管理弱引用对象
 */
export class WeakRefManager<T extends object> {
  private refs: Map<string, WeakRef<T>> = new Map()
  private registry?: FinalizationRegistry<string>

  constructor() {
    // 使用FinalizationRegistry来清理已被垃圾回收的对象
    if (typeof FinalizationRegistry !== 'undefined') {
      this.registry = new FinalizationRegistry((key: string) => {
        this.refs.delete(key)
      })
    }
  }

  /**
   * 添加弱引用
   */
  add(key: string, obj: T): void {
    const ref = new WeakRef(obj)
    this.refs.set(key, ref)
    
    if (this.registry) {
      this.registry.register(obj, key)
    }
  }

  /**
   * 获取对象
   */
  get(key: string): T | undefined {
    const ref = this.refs.get(key)
    if (!ref) return undefined
    
    const obj = ref.deref()
    if (!obj) {
      this.refs.delete(key)
      return undefined
    }
    
    return obj
  }

  /**
   * 删除引用
   */
  delete(key: string): boolean {
    return this.refs.delete(key)
  }

  /**
   * 清空所有引用
   */
  clear(): void {
    this.refs.clear()
  }

  /**
   * 获取活动引用数量
   */
  size(): number {
    // 清理已被回收的引用
    for (const [key, ref] of this.refs.entries()) {
      if (!ref.deref()) {
        this.refs.delete(key)
      }
    }
    return this.refs.size
  }
}

/**
 * DOM清理工具
 */
export class DOMCleaner {
  /**
   * 清理DOM节点
   */
  static cleanNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      
      // 移除事件监听器
      const clone = element.cloneNode(true) as HTMLElement
      element.parentNode?.replaceChild(clone, element)
    }
    
    // 递归清理子节点
    while (node.firstChild) {
      this.cleanNode(node.firstChild)
      node.removeChild(node.firstChild)
    }
  }

  /**
   * 清空元素内容
   */
  static empty(element: HTMLElement): void {
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }

  /**
   * 安全地移除元素
   */
  static remove(element: HTMLElement): void {
    // 清理数据和事件
    this.cleanNode(element)
    
    // 移除元素
    if (element.parentNode) {
      element.parentNode.removeChild(element)
    }
  }
}

/**
 * 资源监控器
 */
export class ResourceMonitor {
  private static instance?: ResourceMonitor
  private memoryCheckInterval?: NodeJS.Timeout
  private performanceObserver?: PerformanceObserver
  private memoryThreshold = 100 * 1024 * 1024 // 100MB
  private warningCallback?: (info: MemoryInfo) => void

  /**
   * 获取单例实例
   */
  static getInstance(): ResourceMonitor {
    if (!this.instance) {
      this.instance = new ResourceMonitor()
    }
    return this.instance
  }

  /**
   * 开始监控
   */
  startMonitoring(options?: {
    memoryCheckInterval?: number
    memoryThreshold?: number
    onWarning?: (info: MemoryInfo) => void
  }): void {
    if (options?.memoryThreshold) {
      this.memoryThreshold = options.memoryThreshold
    }
    
    if (options?.onWarning) {
      this.warningCallback = options.onWarning
    }

    // 监控内存使用
    if ('memory' in performance) {
      this.memoryCheckInterval = setInterval(() => {
        this.checkMemory()
      }, options?.memoryCheckInterval ?? 30000)
    }

    // 监控长任务
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry)
          }
        }
      })
      
      try {
        this.performanceObserver.observe({ entryTypes: ['longtask'] })
      } catch {
        // longtask可能不被支持
      }
    }
  }

  /**
   * 检查内存使用
   */
  private checkMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const used = memory.usedJSHeapSize
      const limit = memory.jsHeapSizeLimit
      
      if (used > this.memoryThreshold) {
        const info: MemoryInfo = {
          used,
          limit,
          usage: (used / limit) * 100
        }
        
        console.warn(`High memory usage: ${(used / 1024 / 1024).toFixed(2)}MB`)
        
        if (this.warningCallback) {
          this.warningCallback(info)
        }
      }
    }
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
      this.memoryCheckInterval = undefined
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
      this.performanceObserver = undefined
    }
  }

  /**
   * 获取内存信息
   */
  getMemoryInfo(): MemoryInfo | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }
    }
    return undefined
  }
}

interface MemoryInfo {
  used: number
  limit: number
  usage: number
}

/**
 * 自动清理装饰器
 */
export function AutoCleanup(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  
  descriptor.value = function(this: any, ...args: any[]) {
    const cleanup = new CleanupManager()
    
    try {
      // 将cleanup管理器注入到this上下文
      const originalCleanup = this._cleanup
      this._cleanup = cleanup
      
      const result = originalMethod.apply(this, args)
      
      // 如果是Promise，等待完成后清理
      if (result instanceof Promise) {
        return result.finally(() => {
          cleanup.dispose()
          this._cleanup = originalCleanup
        })
      }
      
      return result
    } finally {
      // 同步方法直接清理
      if (!(originalMethod.constructor.name === 'AsyncFunction')) {
        cleanup.dispose()
      }
    }
  }
  
  return descriptor
}

export default {
  CleanupManager,
  ObjectPool,
  CacheManager,
  WeakRefManager,
  DOMCleaner,
  ResourceMonitor,
  AutoCleanup
}