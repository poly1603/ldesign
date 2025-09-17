/**
 * 内存管理和泄漏预防工具
 * 
 * 提供内存泄漏检测、预防和清理工具
 */

/**
 * 定时器管理器 - 防止定时器泄漏
 */
export class TimerManager {
  private timers = new Set<NodeJS.Timeout>()
  private intervals = new Set<NodeJS.Timeout>()
  
  /**
   * 清除所有定时器和间隔器
   */
  clearAll(): void {
    for (const timer of this.timers) {
      clearTimeout(timer)
    }
    for (const timer of this.intervals) {
      clearInterval(timer)
    }
    
    this.timers.clear()
    this.intervals.clear()
  }
}

/**
 * 事件监听器管理器 - 防止监听器泄漏
 */
export class ListenerManager {
  private listeners = new Map<EventTarget, Map<string, Set<EventListenerOrEventListenerObject>>>()
  
  /**
   * 清除所有监听器
   */
  clearAll(): void {
    for (const [target, targetListeners] of this.listeners) {
      for (const [type, listeners] of targetListeners) {
        for (const listener of listeners) {
          target.removeEventListener(type, listener)
        }
      }
    }
    this.listeners.clear()
  }
}

/**
 * 资源清理管理器
 */
export class ResourceManager {
  private resources = new Set<() => void>()
  private timerManager = new TimerManager()
  private listenerManager = new ListenerManager()
  private isDestroyed = false
  
  /**
   * 注册清理资源
   */
  register(cleanup: () => void): void {
    if (this.isDestroyed) {
      console.warn('ResourceManager is already destroyed')
      return
    }
    this.resources.add(cleanup)
  }
  
  /**
   * 取消注册清理资源
   */
  unregister(cleanup: () => void): void {
    this.resources.delete(cleanup)
  }
  
  /**
   * 添加定时器（自动管理）
   */
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    return this.timerManager.setTimeout(callback, delay)
  }
  
  /**
   * 添加间隔器（自动管理）
   */
  setInterval(callback: () => void, interval: number): NodeJS.Timeout {
    return this.timerManager.setInterval(callback, interval)
  }
  
  /**
   * 添加事件监听器（自动管理）
   */
  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
  ): void {
    this.listenerManager.addEventListener(target, type, listener, options)
  }
  
  /**
   * 移除事件监听器
   */
  removeEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    this.listenerManager.removeEventListener(target, type, listener)
  }
  
  /**
   * 清理所有资源
   */
  destroy(): void {
    if (this.isDestroyed) {
      return
    }
    
    // 执行自定义清理函数
    for (const cleanup of this.resources) {
      try {
        cleanup()
      } catch (error) {
        console.error('Error during resource cleanup:', error)
      }
    }
    
    // 清理定时器
    this.timerManager.clearAll()
    
    // 清理事件监听器
    this.listenerManager.clearAll()
    
    // 清空资源集合
    this.resources.clear()
    
    this.isDestroyed = true
  }
  
  /**
   * 获取资源统计
   */
  getStats(): {
    customResources: number
    timers: ReturnType<TimerManager['getActiveTimers']>
    listeners: ReturnType<ListenerManager['getStats']>
    isDestroyed: boolean
  } {
    return {
      customResources: this.resources.size,
      timers: this.timerManager.getActiveTimers(),
      listeners: this.listenerManager.getStats(),
      isDestroyed: this.isDestroyed,
    }
  }
}

/**
 * 内存泄漏检测器
 */
export class MemoryLeakDetector {
  private snapshots: Array<{
    timestamp: number
    heapUsed: number
    heapTotal: number
    external: number
  }> = []
  
  private readonly maxSnapshots = 100
  private monitoringInterval?: NodeJS.Timeout
  
  /**
   * 开始监控内存使用
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      console.warn('Memory monitoring is already active')
      return
    }
    
    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot()
    }, intervalMs)
    
    // 立即拍摄一次快照
    this.takeSnapshot()
  }
  
  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
  }
  
  /**
   * 拍摄内存快照
   */
  takeSnapshot(): void {
    if (typeof process === 'undefined' || !process.memoryUsage) {
      // 浏览器环境
      if ('memory' in performance) {
        const memory = (performance as any).memory
        this.snapshots.push({
          timestamp: Date.now(),
          heapUsed: memory.usedJSHeapSize,
          heapTotal: memory.totalJSHeapSize,
          external: 0,
        })
      }
    } else {
      // Node.js 环境
      const memUsage = process.memoryUsage()
      this.snapshots.push({
        timestamp: Date.now(),
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
      })
    }
    
    // 限制快照数量
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift()
    }
  }
  
  /**
   * 检测内存泄漏
   */
  detectLeaks(): {
    hasPotentialLeak: boolean
    trend: 'increasing' | 'stable' | 'decreasing'
    growth: number // MB per minute
    recommendations: string[]
  } {
    if (this.snapshots.length < 3) {
      return {
        hasPotentialLeak: false,
        trend: 'stable',
        growth: 0,
        recommendations: ['Need more data points for accurate analysis'],
      }
    }
    
    const recent = this.snapshots.slice(-10) // 最近10个快照
    const oldest = recent[0]
    const newest = recent[recent.length - 1]
    
    const timeDiff = newest.timestamp - oldest.timestamp
    const heapDiff = newest.heapUsed - oldest.heapUsed
    
    // 计算增长率 (MB/min)
    const growthRate = (heapDiff / (1024 * 1024)) / (timeDiff / (1000 * 60))
    
    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
    if (growthRate > 0.1) {
      trend = 'increasing'
    } else if (growthRate < -0.1) {
      trend = 'decreasing'
    }
    
    const hasPotentialLeak = trend === 'increasing' && growthRate > 1 // 每分钟增长超过1MB
    
    const recommendations: string[] = []
    if (hasPotentialLeak) {
      recommendations.push('Memory usage is increasing rapidly')
      recommendations.push('Check for unclosed intervals/timeouts')
      recommendations.push('Review event listener cleanup')
      recommendations.push('Consider implementing object pooling')
    }
    
    if (newest.heapUsed / newest.heapTotal > 0.8) {
      recommendations.push('Heap usage is high (>80%)')
    }
    
    return {
      hasPotentialLeak,
      trend,
      growth: Math.round(growthRate * 100) / 100,
      recommendations,
    }
  }
  
  /**
   * 获取内存使用历史
   */
  getMemoryHistory(): Array<{
    timestamp: number
    heapUsed: number // bytes
    heapTotal: number // bytes
    usage: number // percentage
  }> {
    return this.snapshots.map(snapshot => ({
      timestamp: snapshot.timestamp,
      heapUsed: snapshot.heapUsed,
      heapTotal: snapshot.heapTotal,
      usage: Math.round((snapshot.heapUsed / snapshot.heapTotal) * 100),
    }))
  }
  
  /**
   * 清理监控数据
   */
  clear(): void {
    this.snapshots = []
  }
  
  /**
   * 销毁检测器
   */
  destroy(): void {
    this.stopMonitoring()
    this.clear()
  }
}

/**
 * 引用计数器 - 检测循环引用
 */
export class ReferenceTracker {
  private refs = new WeakMap<object, number>()
  private objects = new Set<object>()
  
  /**
   * 添加对象引用
   */
  addReference(obj: object): void {
    const count = this.refs.get(obj) || 0
    this.refs.set(obj, count + 1)
    this.objects.add(obj)
  }
  
  /**
   * 移除对象引用
   */
  removeReference(obj: object): void {
    const count = this.refs.get(obj) || 0
    if (count > 1) {
      this.refs.set(obj, count - 1)
    } else {
      this.refs.delete(obj)
      this.objects.delete(obj)
    }
  }
  
  /**
   * 获取引用计数
   */
  getRefCount(obj: object): number {
    return this.refs.get(obj) || 0
  }
  
  /**
   * 查找潜在的循环引用
   */
  findPotentialLeaks(): object[] {
    const potentialLeaks: object[] = []
    
    for (const obj of this.objects) {
      const count = this.refs.get(obj) || 0
      if (count > 5) { // 引用次数过多可能存在问题
        potentialLeaks.push(obj)
      }
    }
    
    return potentialLeaks
  }
  
  /**
   * 清理跟踪数据
   */
  clear(): void {
    this.refs = new WeakMap()
    this.objects.clear()
  }
}

/**
 * 全局内存管理器
 */
export class GlobalMemoryManager {
  private static instance?: GlobalMemoryManager
  
  private resourceManager = new ResourceManager()
  private leakDetector = new MemoryLeakDetector()
  private referenceTracker = new ReferenceTracker()
  
  private constructor() {}
  
  static getInstance(): GlobalMemoryManager {
    if (!this.instance) {
      this.instance = new GlobalMemoryManager()
    }
    return this.instance
  }
  
  /**
   * 开始监控
   */
  startMonitoring(): void {
    this.leakDetector.startMonitoring()
  }
  
  /**
   * 停止监控
   */
  stopMonitoring(): void {
    this.leakDetector.stopMonitoring()
  }
  
  /**
   * 注册资源清理
   */
  registerCleanup(cleanup: () => void): void {
    this.resourceManager.register(cleanup)
  }
  
  /**
   * 创建受管理的定时器
   */
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    return this.resourceManager.setTimeout(callback, delay)
  }
  
  /**
   * 创建受管理的间隔器
   */
  setInterval(callback: () => void, interval: number): NodeJS.Timeout {
    return this.resourceManager.setInterval(callback, interval)
  }
  
  /**
   * 添加受管理的事件监听器
   */
  addEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions
  ): void {
    this.resourceManager.addEventListener(target, type, listener, options)
  }
  
  /**
   * 获取内存健康报告
   */
  getHealthReport(): {
    memory: ReturnType<MemoryLeakDetector['detectLeaks']>
    resources: ReturnType<ResourceManager['getStats']>
    potentialLeaks: number
  } {
    return {
      memory: this.leakDetector.detectLeaks(),
      resources: this.resourceManager.getStats(),
      potentialLeaks: this.referenceTracker.findPotentialLeaks().length,
    }
  }
  
  /**
   * 强制垃圾回收（如果可用）
   */
  forceGC(): void {
    if (typeof global !== 'undefined' && global.gc) {
      global.gc()
    } else if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc()
    } else {
      console.warn('Garbage collection is not available')
    }
  }
  
  /**
   * 销毁所有管理的资源
   */
  destroy(): void {
    this.resourceManager.destroy()
    this.leakDetector.destroy()
    this.referenceTracker.clear()
  }
}

// 导出便捷函数
export const memoryManager = GlobalMemoryManager.getInstance()

/**
 * 装饰器：自动管理组件生命周期
 */
export function managedLifecycle(target: any) {
  const originalDestroy = target.prototype.destroy || target.prototype.unmount
  
  target.prototype.destroy = function() {
    // 清理资源
    if (this._resourceManager) {
      this._resourceManager.destroy()
    }
    
    // 调用原始销毁方法
    if (originalDestroy) {
      originalDestroy.call(this)
    }
  }
  
  // 初始化时创建资源管理器
  const originalConstructor = target
  function WrappedConstructor(...args: any[]) {
    const instance = new originalConstructor(...args)
    instance._resourceManager = new ResourceManager()
    return instance
  }
  
  WrappedConstructor.prototype = originalConstructor.prototype
  return WrappedConstructor
}

/**
 * 创建受管理的异步操作
 */
export function createManagedPromise<T>(
  executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void,
  timeoutMs?: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let isSettled = false
    let timeoutId: NodeJS.Timeout | undefined
    
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
    
    const wrappedResolve = (value: T) => {
      if (!isSettled) {
        isSettled = true
        cleanup()
        resolve(value)
      }
    }
    
    const wrappedReject = (reason?: any) => {
      if (!isSettled) {
        isSettled = true
        cleanup()
        reject(reason)
      }
    }
    
    if (timeoutMs) {
      timeoutId = setTimeout(() => {
        wrappedReject(new Error('Promise timeout'))
      }, timeoutMs)
    }
    
    // 注册清理函数
    memoryManager.registerCleanup(cleanup)
    
    try {
      executor(wrappedResolve, wrappedReject)
    } catch (error) {
      wrappedReject(error)
    }
  })
}
