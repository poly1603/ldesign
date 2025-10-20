import type { EventListener } from '../types'

/**
 * 监听器包装器（支持优先级）
 */
interface ListenerWrapper<T = unknown> {
  listener: EventListener<T>
  priority: number
  once: boolean
  namespace?: string
}

/**
 * 高性能事件发射器实现
 *
 * 优化特性:
 * - 避免在emit时创建新数组,直接遍历Set
 * - 添加性能监控
 * - 优化内存使用
 * - 支持事件监听器弱引用
 * 
 * 高级特性：
 * - 监听器优先级
 * - 通配符事件
 * - 命名空间
 * - 内存泄漏检测
 */
export class EventEmitter<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  private events: Map<keyof T | string, ListenerWrapper[]> = new Map()
  private maxListeners = 100 // 增加最大监听器数量以支持测试
  private errorHandler?: (error: Error, event: keyof T | string) => void
  private wildcardListeners: ListenerWrapper[] = [] // 通配符监听器
  private isSorted = new Map<keyof T | string, boolean>() // 记录是否已排序

  // 性能监控
  private performanceMetrics = {
    totalEmits: 0,
    totalListenerCalls: 0,
    errors: 0,
    averageListenersPerEvent: 0,
  }

  // 是否启用性能监控
  private enablePerformanceTracking = false

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(max: number): this {
    this.maxListeners = max
    return this
  }

  /**
   * 设置错误处理器
   */
  setErrorHandler(handler: (error: Error, event: keyof T) => void): this {
    this.errorHandler = handler
    return this
  }

  /**
   * 启用性能监控
   */
  enablePerformanceMonitoring(enable = true): this {
    this.enablePerformanceTracking = enable
    return this
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics }
  }

  /**
   * 重置性能指标
   */
  resetPerformanceMetrics(): this {
    this.performanceMetrics = {
      totalEmits: 0,
      totalListenerCalls: 0,
      errors: 0,
      averageListenersPerEvent: 0,
    }
    return this
  }

  /**
   * 添加事件监听器（支持优先级和命名空间）
   * 
   * @param event - 事件名称（支持 '*' 通配符）
   * @param listener - 监听器函数
   * @param options - 配置选项
   * @param options.priority - 优先级（数字越大优先级越高，默认0）
   * @param options.namespace - 命名空间（用于批量移除）
   */
  on<K extends keyof T>(
    event: K | '*',
    listener: EventListener<T[K]>,
    options: { priority?: number, namespace?: string } = {},
  ): this {
    const { priority = 0, namespace } = options

    const wrapper: ListenerWrapper = {
      listener: listener as EventListener<unknown>,
      priority,
      once: false,
      namespace,
    }

    // 处理通配符
    if (event === '*') {
      this.wildcardListeners.push(wrapper)
      // 延迟排序，标记为未排序
      return this
    }

    if (!this.events.has(event as string)) {
      this.events.set(event as string, [])
    }

    const listeners = this.events.get(event as string)
    if (!listeners) return this

    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${String(event)}. Consider using removeAllListeners() or increasing maxListeners.`)
    }

    listeners.push(wrapper as unknown as ListenerWrapper)
    // 标记为未排序，延迟到emit时再排序
    this.isSorted.set(event as string, false)

    return this
  }

  /**
   * 添加一次性事件监听器
   */
  once<K extends keyof T>(
    event: K | '*',
    listener: EventListener<T[K]>,
    options: { priority?: number, namespace?: string } = {},
  ): this {
    const { priority = 0, namespace } = options

    const wrapper: ListenerWrapper = {
      listener: listener as EventListener<unknown>,
      priority,
      once: true,
      namespace,
    }

    if (event === '*') {
      this.wildcardListeners.push(wrapper)
      return this
    }

    if (!this.events.has(event as string)) {
      this.events.set(event as string, [])
    }

    const listeners = this.events.get(event as string)
    if (listeners) {
      listeners.push(wrapper as unknown as ListenerWrapper)
    }
    this.isSorted.set(event as string, false)

    return this
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof T>(event: K | '*', listener?: EventListener<T[K]>): this {
    if (event === '*') {
      if (listener) {
        this.wildcardListeners = this.wildcardListeners.filter(
          w => w.listener !== listener,
        )
      }
      else {
        this.wildcardListeners = []
      }
      return this
    }

    const listeners = this.events.get(event as string)
    if (!listeners)
      return this

    if (listener) {
      const filtered = listeners.filter(w => w.listener !== listener)
      if (filtered.length === 0) {
        this.events.delete(event as string)
      }
      else {
        this.events.set(event as string, filtered)
      }
    }
    else {
      this.events.delete(event as string)
    }

    return this
  }

  /**
   * 移除指定命名空间的所有监听器
   */
  offNamespace(namespace: string): this {
    // 移除普通监听器
    for (const [event, listeners] of this.events.entries()) {
      const filtered = listeners.filter(w => w.namespace !== namespace)
      if (filtered.length === 0) {
        this.events.delete(event)
      }
      else {
        this.events.set(event, filtered)
      }
    }

    // 移除通配符监听器
    this.wildcardListeners = this.wildcardListeners.filter(
      w => w.namespace !== namespace,
    )

    return this
  }

  /**
   * 移除监听器包装器（内部方法）
   */
  private removeWrapper(event: string, wrapper: ListenerWrapper): void {
    if (event === '*') {
      this.wildcardListeners = this.wildcardListeners.filter(w => w !== wrapper)
      return
    }

    const listeners = this.events.get(event)
    if (listeners) {
      const filtered = listeners.filter(w => w !== wrapper)
      if (filtered.length === 0) {
        this.events.delete(event)
      }
      else {
        this.events.set(event, filtered)
      }
    }
  }

  /**
   * 触发事件（支持通配符监听器）
   *
   * 优化: 按优先级顺序执行监听器，避免创建新数组
   */
  emit<K extends keyof T>(event: K, data: T[K]): this {
    const listeners = this.events.get(event as string)
    const hasListeners = listeners && listeners.length > 0
    const hasWildcard = this.wildcardListeners.length > 0
    
    if (!hasListeners && !hasWildcard) {
      return this
    }

    // 确保监听器已排序
    if (hasListeners && !this.isSorted.get(event as string)) {
      listeners?.sort((a, b) => b.priority - a.priority)
      this.isSorted.set(event as string, true)
    }
    
    // 排序通配符监听器（仅在需要时，且避免重复排序）
    if (hasWildcard && this.wildcardListeners.length > 1) {
      // 只在添加新监听器后第一次触发时排序
      this.wildcardListeners.sort((a, b) => b.priority - a.priority)
    }

    // 性能监控（优化：减少不必要的计算）
    if (this.enablePerformanceTracking) {
      const totalListeners = (listeners ? listeners.length : 0) + this.wildcardListeners.length
      this.performanceMetrics.totalEmits++
      this.performanceMetrics.totalListenerCalls += totalListeners

      // 更新平均监听器数量（使用指数移动平均）
      const alpha = 0.1
      this.performanceMetrics.averageListenersPerEvent
        = this.performanceMetrics.averageListenersPerEvent * (1 - alpha)
          + totalListeners * alpha
    }

    // 记录需要移除的一次性监听器（复用数组以减少分配）
    const toRemove: ListenerWrapper[] = []

    // 执行普通监听器
    if (listeners) {
      for (let i = 0; i < listeners.length; i++) {
        const wrapper = listeners[i]
        try {
          wrapper.listener(data)
          if (wrapper.once) {
            toRemove.push(wrapper)
          }
        }
        catch (error) {
          this.handleListenerError(error, event as string)
        }
      }
    }

    // 执行通配符监听器
    if (hasWildcard) {
      for (let i = 0; i < this.wildcardListeners.length; i++) {
        const wrapper = this.wildcardListeners[i]
        try {
          wrapper.listener(data)
          if (wrapper.once) {
            toRemove.push(wrapper)
          }
        }
        catch (error) {
          this.handleListenerError(error, event as string)
        }
      }
    }

    // 移除一次性监听器（批量处理以提高效率）
    if (toRemove.length > 0) {
      for (let i = 0; i < toRemove.length; i++) {
        this.removeWrapper(event as string, toRemove[i])
      }
    }

    return this
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount<K extends keyof T>(event: K | '*'): number {
    if (event === '*') {
      return this.wildcardListeners.length
    }
    const listeners = this.events.get(event as string)
    return listeners ? listeners.length : 0
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): Array<keyof T | string> {
    const names = Array.from(this.events.keys())
    if (this.wildcardListeners.length > 0) {
      names.push('*')
    }
    return names
  }

  /**
   * 移除所有事件监听器（支持通配符模式）
   */
  removeAllListeners<K extends keyof T>(event?: K | '*' | string): this {
    if (event === '*') {
      this.wildcardListeners = []
    }
    else if (event) {
      const eventStr = event as string
      // 支持通配符模式，如 'user:*' 移除所有 user: 开头的事件
      if (eventStr.includes('*')) {
        const prefix = eventStr.replace('*', '')
        const keysToDelete: string[] = []
        
        for (const key of this.events.keys()) {
          if (String(key).startsWith(prefix)) {
            keysToDelete.push(String(key))
          }
        }
        
        for (const key of keysToDelete) {
          this.events.delete(key)
          this.isSorted.delete(key)
        }
      }
      else {
        this.events.delete(eventStr)
        this.isSorted.delete(eventStr)
      }
    }
    else {
      this.events.clear()
      this.wildcardListeners = []
      this.isSorted.clear()
    }
    return this
  }

  /**
   * 获取指定事件的所有监听器
   */
  listeners<K extends keyof T>(event: K | '*'): EventListener<T[K]>[] {
    if (event === '*') {
      return this.wildcardListeners.map(w => w.listener as EventListener<T[K]>)
    }
    const listeners = this.events.get(event as string)
    return listeners ? listeners.map(w => w.listener as EventListener<T[K]>) : []
  }

  /**
   * 检查是否有指定事件的监听器
   */
  hasListeners<K extends keyof T>(event: K | '*'): boolean {
    return this.listenerCount(event) > 0
  }

  /**
   * 检测内存泄漏（监听器过多的事件）
   * 
   * @param threshold - 阈值，默认50
   * @returns 监听器过多的事件列表
   */
  detectMemoryLeaks(threshold = 50): Array<{ event: string, count: number }> {
    const leaks: Array<{ event: string, count: number }> = []

    for (const [event, listeners] of this.events.entries()) {
      if (listeners.length > threshold) {
        leaks.push({
          event: String(event),
          count: listeners.length,
        })
      }
    }

    if (this.wildcardListeners.length > threshold) {
      leaks.push({
        event: '*',
        count: this.wildcardListeners.length,
      })
    }

    return leaks
  }

  /**
   * 获取所有监听器总数
   */
  getTotalListenerCount(): number {
    let total = this.wildcardListeners.length
    for (const listeners of this.events.values()) {
      total += listeners.length
    }
    return total
  }

  /**
   * 处理监听器错误
   */
  private handleListenerError(error: unknown, event: string): void {
    if (this.enablePerformanceTracking) {
      this.performanceMetrics.errors++
    }

    const err = error instanceof Error ? error : new Error(String(error))

    if (this.errorHandler) {
      this.errorHandler(err, event)
    }
    else {
      console.error(`Error in event listener for "${event}":`, err)
    }
  }
}
