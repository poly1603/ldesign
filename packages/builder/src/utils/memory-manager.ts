/**
 * 内存管理器 - 防止内存泄漏和优化内存使用
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events'

/**
 * 资源清理接口
 */
export interface ICleanupable {
  cleanup(): void | Promise<void>
  isCleanedUp?: boolean
}

/**
 * 内存管理器选项
 */
export interface MemoryManagerOptions {
  /** 是否启用内存监控 */
  enableMonitoring?: boolean
  /** 内存使用警告阈值(MB) */
  memoryThreshold?: number
  /** 清理间隔(ms) */
  cleanupInterval?: number
  /** 是否自动清理 */
  autoCleanup?: boolean
}

/**
 * 资源管理器类
 */
export class ResourceManager implements ICleanupable {
  private resources = new Map<string, ICleanupable>()
  private timers = new Set<NodeJS.Timeout>()
  private watchers = new Set<any>()
  private listeners = new Map<EventEmitter, Map<string | symbol, Set<Function>>>()
  private isDestroyed = false

  /**
   * 注册资源
   */
  register(id: string, resource: ICleanupable): void {
    if (this.isDestroyed) {
      throw new Error('ResourceManager has been destroyed')
    }
    this.resources.set(id, resource)
  }

  /**
   * 注销资源
   */
  unregister(id: string): void {
    const resource = this.resources.get(id)
    if (resource && !resource.isCleanedUp) {
      this.cleanupResource(resource)
    }
    this.resources.delete(id)
  }

  /**
   * 添加定时器
   */
  addTimer(timer: NodeJS.Timeout): void {
    this.timers.add(timer)
  }

  /**
   * 清除定时器
   */
  clearTimer(timer: NodeJS.Timeout): void {
    clearTimeout(timer)
    clearInterval(timer)
    this.timers.delete(timer)
  }

  /**
   * 添加文件监听器
   */
  addWatcher(watcher: any): void {
    this.watchers.add(watcher)
  }

  /**
   * 添加事件监听器追踪
   */
  trackListener(emitter: EventEmitter, event: string | symbol, listener: Function): void {
    if (!this.listeners.has(emitter)) {
      this.listeners.set(emitter, new Map())
    }
    const events = this.listeners.get(emitter)!
    if (!events.has(event)) {
      events.set(event, new Set())
    }
    events.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器追踪
   */
  untrackListener(emitter: EventEmitter, event: string | symbol, listener: Function): void {
    const events = this.listeners.get(emitter)
    if (!events) return

    const listeners = events.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        events.delete(event)
      }
    }

    if (events.size === 0) {
      this.listeners.delete(emitter)
    }
  }

  /**
   * 清理单个资源
   */
  private async cleanupResource(resource: ICleanupable): Promise<void> {
    if (resource.isCleanedUp) return

    try {
      await resource.cleanup()
      resource.isCleanedUp = true
    } catch (error) {
      console.error('资源清理失败:', error)
    }
  }

  /**
   * 清理所有资源
   */
  async cleanup(): Promise<void> {
    if (this.isDestroyed) return

    // 清理所有定时器
    for (const timer of this.timers) {
      this.clearTimer(timer)
    }
    this.timers.clear()

    // 清理所有文件监听器
    for (const watcher of this.watchers) {
      if (watcher && typeof watcher.close === 'function') {
        try {
          await watcher.close()
        } catch (error) {
          console.error('关闭文件监听器失败:', error)
        }
      }
    }
    this.watchers.clear()

    // 清理所有事件监听器
    for (const [emitter, events] of this.listeners) {
      for (const [event, listeners] of events) {
        for (const listener of listeners) {
          try {
            emitter.removeListener(event, listener as any)
          } catch (error) {
            console.error('移除事件监听器失败:', error)
          }
        }
      }
    }
    this.listeners.clear()

    // 清理所有注册的资源
    for (const resource of this.resources.values()) {
      await this.cleanupResource(resource)
    }
    this.resources.clear()

    this.isDestroyed = true
  }

  /**
   * 获取资源统计
   */
  getStats(): {
    resources: number
    timers: number
    watchers: number
    listeners: number
  } {
    let listenerCount = 0
    for (const events of this.listeners.values()) {
      for (const listeners of events.values()) {
        listenerCount += listeners.size
      }
    }

    return {
      resources: this.resources.size,
      timers: this.timers.size,
      watchers: this.watchers.size,
      listeners: listenerCount
    }
  }
}

/**
 * 内存管理器类
 */
export class MemoryManager extends EventEmitter {
  private options: Required<MemoryManagerOptions>
  private resourceManager = new ResourceManager()
  private monitoringInterval?: NodeJS.Timeout
  private cleanupInterval?: NodeJS.Timeout
  private memorySnapshots: Array<{ timestamp: number; heapUsed: number }> = []
  private maxSnapshots = 100

  constructor(options: MemoryManagerOptions = {}) {
    super()

    this.options = {
      enableMonitoring: false,
      memoryThreshold: 500, // 500MB
      cleanupInterval: 60000, // 1分钟
      autoCleanup: true,
      ...options
    }

    this.initialize()
  }

  /**
   * 初始化内存管理器
   */
  private initialize(): void {
    if (this.options.enableMonitoring) {
      this.startMonitoring()
    }

    if (this.options.autoCleanup) {
      this.cleanupInterval = setInterval(() => {
        this.performCleanup()
      }, this.options.cleanupInterval)
      this.resourceManager.addTimer(this.cleanupInterval)
    }

    // 监听进程退出事件
    process.on('exit', () => this.destroy())
    process.on('SIGINT', () => this.destroy())
    process.on('SIGTERM', () => this.destroy())
  }

  /**
   * 开始内存监控
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) return

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage()
    }, 10000) // 每10秒检查一次

    this.resourceManager.addTimer(this.monitoringInterval)
  }

  /**
   * 检查内存使用
   */
  private checkMemoryUsage(): void {
    const memUsage = process.memoryUsage()
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024

    // 记录快照
    this.memorySnapshots.push({
      timestamp: Date.now(),
      heapUsed: memUsage.heapUsed
    })

    // 限制快照数量
    if (this.memorySnapshots.length > this.maxSnapshots) {
      this.memorySnapshots.shift()
    }

    // 检查是否超过阈值
    if (heapUsedMB > this.options.memoryThreshold) {
      this.emit('memoryWarning', {
        heapUsedMB,
        threshold: this.options.memoryThreshold,
        memUsage
      })

      // 触发垃圾回收（如果可用）
      if (global.gc) {
        global.gc()
      }
    }

    // 检测内存泄漏
    this.detectMemoryLeak()
  }

  /**
   * 检测内存泄漏
   */
  private detectMemoryLeak(): void {
    if (this.memorySnapshots.length < 10) return

    const recent = this.memorySnapshots.slice(-10)
    const oldest = recent[0]
    const newest = recent[recent.length - 1]

    const timeDiff = newest.timestamp - oldest.timestamp
    const heapDiff = newest.heapUsed - oldest.heapUsed

    // 计算增长率 (bytes/second)
    const growthRate = heapDiff / (timeDiff / 1000)

    // 如果每秒增长超过1MB，可能存在内存泄漏
    if (growthRate > 1024 * 1024) {
      this.emit('memoryLeak', {
        growthRate: growthRate / 1024 / 1024, // MB/s
        duration: timeDiff / 1000, // seconds
        increase: heapDiff / 1024 / 1024 // MB
      })
    }
  }

  /**
   * 执行清理
   */
  private async performCleanup(): Promise<void> {
    try {
      // 获取清理前的内存使用
      const beforeMem = process.memoryUsage().heapUsed

      // 执行资源清理
      await this.resourceManager.cleanup()

      // 触发垃圾回收
      if (global.gc) {
        global.gc()
      }

      // 计算清理效果
      const afterMem = process.memoryUsage().heapUsed
      const freedMB = (beforeMem - afterMem) / 1024 / 1024

      this.emit('cleanupCompleted', {
        freedMB: Math.max(0, freedMB),
        stats: this.resourceManager.getStats()
      })
    } catch (error) {
      this.emit('cleanupError', error)
    }
  }

  /**
   * 获取资源管理器
   */
  getResourceManager(): ResourceManager {
    return this.resourceManager
  }

  /**
   * 获取内存使用统计
   */
  getMemoryStats(): {
    current: NodeJS.MemoryUsage
    history: Array<{ timestamp: number; heapUsed: number }>
    trend: 'stable' | 'increasing' | 'decreasing'
  } {
    const current = process.memoryUsage()
    
    let trend: 'stable' | 'increasing' | 'decreasing' = 'stable'
    if (this.memorySnapshots.length >= 5) {
      const recent = this.memorySnapshots.slice(-5)
      const first = recent[0].heapUsed
      const last = recent[recent.length - 1].heapUsed
      const diff = last - first
      
      if (diff > 10 * 1024 * 1024) { // 10MB
        trend = 'increasing'
      } else if (diff < -10 * 1024 * 1024) {
        trend = 'decreasing'
      }
    }

    return {
      current,
      history: [...this.memorySnapshots],
      trend
    }
  }

  /**
   * 手动触发清理
   */
  async cleanup(): Promise<void> {
    await this.performCleanup()
  }

  /**
   * 销毁内存管理器
   */
  async destroy(): Promise<void> {
    // 停止监控
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }

    // 清理资源
    await this.resourceManager.cleanup()

    // 清空快照
    this.memorySnapshots = []

    // 移除所有监听器
    this.removeAllListeners()
  }
}

/**
 * 创建全局内存管理器实例
 */
let globalMemoryManager: MemoryManager | null = null

export function getGlobalMemoryManager(): MemoryManager {
  if (!globalMemoryManager) {
    globalMemoryManager = new MemoryManager({
      enableMonitoring: process.env.NODE_ENV !== 'production',
      memoryThreshold: 500,
      cleanupInterval: 60000,
      autoCleanup: true
    })
  }
  return globalMemoryManager
}

/**
 * 创建可清理的资源包装器
 */
export function createCleanupable<T extends object>(
  resource: T,
  cleanupFn: (resource: T) => void | Promise<void>
): T & ICleanupable {
  return Object.assign(resource as any, {
    cleanup: () => cleanupFn(resource),
    isCleanedUp: false
  }) as T & ICleanupable
}

/**
 * 装饰器：自动管理资源生命周期
 */
export function managedResource(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function(this: any, ...args: any[]) {
    const memoryManager = getGlobalMemoryManager()
    const resourceManager = memoryManager.getResourceManager()
    const resourceId = `${target.constructor.name}.${propertyKey}_${Date.now()}`

    try {
      const result = await originalMethod.apply(this, args)

      // 如果返回值是可清理的资源，注册它
      if (result && typeof result.cleanup === 'function') {
        resourceManager.register(resourceId, result)
      }

      return result
    } catch (error) {
      // 出错时确保清理
      resourceManager.unregister(resourceId)
      throw error
    }
  }

  return descriptor
}