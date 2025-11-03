/**
 * 事件管理器实现
 *
 * 提供高性能的事件发布订阅系统。
 *
 * 主要特性：
 * - 优先级桶机制，避免每次排序
 * - 监听器数量限制和警告
 * - 弱引用监听器支持
 * - 命名空间支持
 * - 自动清理长时间未触发的事件
 * - 完善的错误处理
 *
 * @packageDocumentation
 */

import type {
  EventHandler,
  EventInfo,
  EventManager,
  EventOptions,
  Unsubscribe,
} from '../types'
import { EventError, ErrorCodes } from '../errors'

/**
 * 事件监听器
 */
interface EventListener<T = any> {
  handler: EventHandler<T>
  priority: number
  once: boolean
  namespace?: string
  createdAt: number
  lastTriggered?: number
  triggerCount: number
  /** 是否为弱引用（用于自动清理） */
  weak?: boolean
  /** 所有者的弱引用（用于自动清理） */
  owner?: WeakRef<object>
  /** 监听器唯一标识 */
  id: string
}

/**
 * 优先级桶
 */
interface PriorityBucket<T = any> {
  priority: number
  listeners: Set<EventListener<T>>
}

/**
 * 事件管理器配置
 */
interface EventManagerConfig {
  /** 单个事件最大监听器数量 */
  maxListenersPerEvent?: number
  /** 全局最大监听器数量 */
  maxTotalListeners?: number
  /** 自动清理阈值（毫秒），超过此时间未触发的事件将被清理 */
  autoCleanupThreshold?: number
  /** 自动清理检查间隔（毫秒） */
  autoCleanupInterval?: number
  /** 孤儿监听器清理间隔（毫秒） */
  orphanCleanupInterval?: number
}

/**
 * 核心事件管理器实现
 *
 * @example
 * ```typescript
 * const events = new CoreEventManager({
 *   maxListenersPerEvent: 100,
 *   autoCleanupThreshold: 3600000 // 1小时
 * })
 *
 * // 监听事件
 * const unsubscribe = events.on('user:login', (user) => {
 *   console.log('用户登录:', user.name)
 * }, { priority: 10 })
 *
 * // 触发事件
 * await events.emit('user:login', { id: 123, name: 'Alice' })
 *
 * // 取消监听
 * unsubscribe()
 * ```
 */
export class CoreEventManager implements EventManager {
  // 使用优先级桶存储监听器
  private eventBuckets = new Map<string, Map<number, Set<EventListener>>>()

  // 事件元数据
  private eventMetadata = new Map<string, {
    createdAt: number
    lastTriggered?: number
    triggerCount: number
  }>()

  // 全局监听器计数
  private totalListeners = 0

  // 配置
  private config: Required<EventManagerConfig>

  // 自动清理定时器
  private cleanupTimer?: ReturnType<typeof setInterval>

  // 孤儿监听器清理定时器
  private orphanCleanupTimer?: ReturnType<typeof setInterval>

  // 所有者到监听器的映射 (用于自动清理)
  private ownerListeners = new WeakMap<object, Set<string>>()

  // 监听器 ID 到事件名和优先级的映射
  private listenerRegistry = new Map<string, { event: string; priority: number }>()

  constructor(config: EventManagerConfig = {}) {
    this.config = {
      maxListenersPerEvent: config.maxListenersPerEvent ?? 100,
      maxTotalListeners: config.maxTotalListeners ?? 10000,
      autoCleanupThreshold: config.autoCleanupThreshold ?? 3600000, // 1小时
      autoCleanupInterval: config.autoCleanupInterval ?? 600000, // 10分钟
      orphanCleanupInterval: config.orphanCleanupInterval ?? 300000, // 5分钟
    }

    this.startAutoCleanup()
    this.startOrphanCleanup()
  }

  /**
   * 监听事件
   *
   * @param eventName - 事件名称
   * @param handler - 事件处理函数
   * @param options - 监听选项
   * @returns 取消订阅函数
   *
   * @throws 如果监听器数量超过限制
   *
   * @example
   * ```typescript
   * const unsubscribe = events.on('data:update', (data) => {
   *   console.log('数据更新:', data)
   * }, {
   *   priority: 10,  // 高优先级先执行
   *   once: false,   // 是否只触发一次
   *   namespace: 'app'  // 命名空间
   * })
   *
   * // 取消监听
   * unsubscribe()
   * ```
   */
  on<T = any>(
    eventName: string,
    handler: EventHandler<T>,
    options: EventOptions = {}
  ): Unsubscribe {
    const {
      priority = 0,
      once = false,
      namespace,
      weak = false,
      owner
    } = options

    // 检查全局监听器限制
    if (this.totalListeners >= this.config.maxTotalListeners) {
      console.warn(
        `Total listener count (${this.totalListeners}) exceeds maximum (${this.config.maxTotalListeners}). ` +
        `Consider removing unused listeners.`
      )
    }

    // 初始化事件桶
    if (!this.eventBuckets.has(eventName)) {
      this.eventBuckets.set(eventName, new Map())
      this.eventMetadata.set(eventName, {
        createdAt: Date.now(),
        triggerCount: 0,
      })
    }

    const buckets = this.eventBuckets.get(eventName)!

    // 检查单个事件监听器限制
    const currentCount = this.getListenerCount(eventName)
    if (currentCount >= this.config.maxListenersPerEvent) {
      console.warn(
        `Event "${eventName}" has ${currentCount} listeners, exceeding maximum (${this.config.maxListenersPerEvent}). ` +
        `This may indicate a memory leak.`
      )
    }

    // 获取或创建优先级桶
    if (!buckets.has(priority)) {
      buckets.set(priority, new Set())
    }

    // 生成唯一 ID
    const id = `${eventName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const listener: EventListener<T> = {
      handler,
      priority,
      once,
      namespace,
      createdAt: Date.now(),
      triggerCount: 0,
      weak,
      owner: owner ? new WeakRef(owner) : undefined,
      id,
    }

    buckets.get(priority)!.add(listener)
    this.totalListeners++

    // 注册监听器 ID
    this.listenerRegistry.set(id, { event: eventName, priority })

    // 关联所有者
    if (owner) {
      if (!this.ownerListeners.has(owner)) {
        this.ownerListeners.set(owner, new Set())
      }
      this.ownerListeners.get(owner)!.add(id)
    }

    // 返回取消订阅函数
    return () => {
      this.offSpecific(eventName, listener)
    }
  }

  /**
   * 监听一次事件
   *
   * @param eventName - 事件名称
   * @param handler - 事件处理函数
   * @param options - 监听选项
   * @returns 取消订阅函数
   */
  once<T = any>(
    eventName: string,
    handler: EventHandler<T>,
    options: Omit<EventOptions, 'once'> = {}
  ): Unsubscribe {
    return this.on(eventName, handler, { ...options, once: true })
  }

  /**
   * 触发事件（异步）
   *
   * 按优先级从高到低执行所有监听器。
   * 监听器中的错误会被捕获，不会中断其他监听器。
   *
   * @param eventName - 事件名称
   * @param data - 事件数据
   *
   * @example
   * ```typescript
   * await events.emit('user:update', {
   *   id: 123,
   *   name: 'Alice'
   * })
   * ```
   */
  async emit<T = any>(eventName: string, data?: T): Promise<void> {
    const buckets = this.eventBuckets.get(eventName)
    if (!buckets || buckets.size === 0)
      return

    // 更新元数据
    const metadata = this.eventMetadata.get(eventName)
    if (metadata) {
      metadata.lastTriggered = Date.now()
      metadata.triggerCount++
    }

    // 按优先级排序（降序）
    const sortedPriorities = Array.from(buckets.keys()).sort((a, b) => b - a)

    // 收集要移除的一次性监听器
    const listenersToRemove: Array<{ priority: number; listener: EventListener<T> }> = []

    // 按优先级执行监听器
    for (const priority of sortedPriorities) {
      const listeners = buckets.get(priority)!

      // 转换为数组以避免迭代过程中修改
      const listenersArray = Array.from(listeners)

      for (const listener of listenersArray) {
        try {
          await listener.handler(data)
          listener.lastTriggered = Date.now()
          listener.triggerCount++

          // 如果是一次性监听器，标记为待移除
          if (listener.once) {
            listenersToRemove.push({ priority, listener })
          }
        }
        catch (error) {
          console.error(
            `Error in event handler for "${eventName}" (priority: ${priority}):`,
            error
          )
          // 继续执行其他监听器
        }
      }
    }

    // 移除一次性监听器
    for (const { priority, listener } of listenersToRemove) {
      const bucket = buckets.get(priority)
      if (bucket) {
        bucket.delete(listener)
        this.totalListeners--

        // 如果桶为空，删除桶
        if (bucket.size === 0) {
          buckets.delete(priority)
        }
      }
    }

    // 如果所有桶都为空，删除事件
    if (buckets.size === 0) {
      this.eventBuckets.delete(eventName)
      this.eventMetadata.delete(eventName)
    }
  }

  /**
   * 触发事件（同步）
   *
   * @param eventName - 事件名称
   * @param data - 事件数据
   */
  emitSync<T = any>(eventName: string, data?: T): void {
    const buckets = this.eventBuckets.get(eventName)
    if (!buckets || buckets.size === 0)
      return

    // 更新元数据
    const metadata = this.eventMetadata.get(eventName)
    if (metadata) {
      metadata.lastTriggered = Date.now()
      metadata.triggerCount++
    }

    // 按优先级排序（降序）
    const sortedPriorities = Array.from(buckets.keys()).sort((a, b) => b - a)

    // 收集要移除的一次性监听器
    const listenersToRemove: Array<{ priority: number; listener: EventListener<T> }> = []

    // 按优先级执行监听器
    for (const priority of sortedPriorities) {
      const listeners = buckets.get(priority)!
      const listenersArray = Array.from(listeners)

      for (const listener of listenersArray) {
        try {
          listener.handler(data)
          listener.lastTriggered = Date.now()
          listener.triggerCount++

          if (listener.once) {
            listenersToRemove.push({ priority, listener })
          }
        }
        catch (error) {
          console.error(
            `Error in event handler for "${eventName}" (priority: ${priority}):`,
            error
          )
        }
      }
    }

    // 移除一次性监听器
    for (const { priority, listener } of listenersToRemove) {
      const bucket = buckets.get(priority)
      if (bucket) {
        bucket.delete(listener)
        this.totalListeners--
        if (bucket.size === 0) {
          buckets.delete(priority)
        }
      }
    }

    if (buckets.size === 0) {
      this.eventBuckets.delete(eventName)
      this.eventMetadata.delete(eventName)
    }
  }

  /**
   * 移除特定监听器
   */
  private offSpecific(eventName: string, listener: EventListener): void {
    const buckets = this.eventBuckets.get(eventName)
    if (!buckets)
      return

    const bucket = buckets.get(listener.priority)
    if (bucket) {
      bucket.delete(listener)
      this.totalListeners--

      if (bucket.size === 0) {
        buckets.delete(listener.priority)
      }
    }

    if (buckets.size === 0) {
      this.eventBuckets.delete(eventName)
      this.eventMetadata.delete(eventName)
    }
  }

  /**
   * 移除事件监听器
   *
   * @param eventName - 事件名称
   * @param handler - 事件处理函数（可选）
   */
  off(eventName: string, handler?: EventHandler): void {
    const buckets = this.eventBuckets.get(eventName)
    if (!buckets)
      return

    if (handler) {
      // 移除特定的处理函数
      for (const [priority, listeners] of buckets) {
        for (const listener of listeners) {
          if (listener.handler === handler) {
            listeners.delete(listener)
            this.totalListeners--

            if (listeners.size === 0) {
              buckets.delete(priority)
            }
            break
          }
        }
      }

      // 如果没有监听器了，清理事件
      if (buckets.size === 0) {
        this.eventBuckets.delete(eventName)
        this.eventMetadata.delete(eventName)
      }
    }
    else {
      // 移除所有监听器
      for (const listeners of buckets.values()) {
        this.totalListeners -= listeners.size
      }
      this.eventBuckets.delete(eventName)
      this.eventMetadata.delete(eventName)
    }
  }

  /**
   * 移除命名空间下的所有监听器
   *
   * @param namespace - 命名空间
   *
   * @example
   * ```typescript
   * // 移除 'app' 命名空间下的所有监听器
   * events.offNamespace('app')
   * ```
   */
  offNamespace(namespace: string): void {
    for (const [eventName, buckets] of this.eventBuckets) {
      for (const listeners of buckets.values()) {
        for (const listener of Array.from(listeners)) {
          if (listener.namespace === namespace) {
            listeners.delete(listener)
            this.totalListeners--
          }
        }
      }

      // 清理空桶
      for (const [priority, listeners] of Array.from(buckets)) {
        if (listeners.size === 0) {
          buckets.delete(priority)
        }
      }

      // 清理空事件
      if (buckets.size === 0) {
        this.eventBuckets.delete(eventName)
        this.eventMetadata.delete(eventName)
      }
    }
  }

  /**
   * 获取命名空间下的所有事件名称
   *
   * @param namespace - 命名空间
   * @returns 事件名称数组
   *
   * @example
   * ```typescript
   * const events = eventManager.getNamespaceEvents('app')
   * console.log(events) // ['app:init', 'app:ready', ...]
   * ```
   */
  getNamespaceEvents(namespace: string): string[] {
    const events = new Set<string>()
    for (const [eventName, buckets] of this.eventBuckets) {
      for (const listeners of buckets.values()) {
        for (const listener of listeners) {
          if (listener.namespace === namespace) {
            events.add(eventName)
            break
          }
        }
      }
    }
    return Array.from(events)
  }

  /**
   * 获取命名空间下的监听器数量
   *
   * @param namespace - 命名空间
   * @returns 监听器数量
   */
  getNamespaceListenerCount(namespace: string): number {
    let count = 0
    for (const buckets of this.eventBuckets.values()) {
      for (const listeners of buckets.values()) {
        for (const listener of listeners) {
          if (listener.namespace === namespace) {
            count++
          }
        }
      }
    }
    return count
  }

  /**
   * 获取所有命名空间
   *
   * @returns 命名空间数组
   */
  getAllNamespaces(): string[] {
    const namespaces = new Set<string>()
    for (const buckets of this.eventBuckets.values()) {
      for (const listeners of buckets.values()) {
        for (const listener of listeners) {
          if (listener.namespace) {
            namespaces.add(listener.namespace)
          }
        }
      }
    }
    return Array.from(namespaces)
  }

  /**
   * 获取命名空间的详细信息
   *
   * @param namespace - 命名空间
   * @returns 命名空间信息
   */
  getNamespaceInfo(namespace: string): {
    namespace: string
    eventCount: number
    listenerCount: number
    events: Array<{
      name: string
      listenerCount: number
    }>
  } | undefined {
    const events = this.getNamespaceEvents(namespace)
    if (events.length === 0) {
      return undefined
    }

    const eventDetails = events.map(eventName => ({
      name: eventName,
      listenerCount: this.getEventListenerCountByNamespace(eventName, namespace),
    }))

    return {
      namespace,
      eventCount: events.length,
      listenerCount: this.getNamespaceListenerCount(namespace),
      events: eventDetails,
    }
  }

  /**
   * 获取特定事件在特定命名空间下的监听器数量
   */
  private getEventListenerCountByNamespace(eventName: string, namespace: string): number {
    const buckets = this.eventBuckets.get(eventName)
    if (!buckets) return 0

    let count = 0
    for (const listeners of buckets.values()) {
      for (const listener of listeners) {
        if (listener.namespace === namespace) {
          count++
        }
      }
    }
    return count
  }

  /**
   * 在命名空间下触发事件
   *
   * @param namespace - 命名空间
   * @param eventName - 事件名称
   * @param data - 事件数据
   *
   * @example
   * ```typescript
   * // 只触发 'app' 命名空间下的 'update' 事件监听器
   * await events.emitNamespace('app', 'update', { data: 'new' })
   * ```
   */
  async emitNamespace<T = any>(namespace: string, eventName: string, data?: T): Promise<void> {
    const buckets = this.eventBuckets.get(eventName)
    if (!buckets) return

    // 更新元数据
    const metadata = this.eventMetadata.get(eventName)
    if (metadata) {
      metadata.lastTriggered = Date.now()
      metadata.triggerCount++
    }

    // 按优先级从高到低执行
    const priorities = Array.from(buckets.keys()).sort((a, b) => b - a)

    for (const priority of priorities) {
      const listeners = buckets.get(priority)
      if (!listeners) continue

      const listenersToExecute = Array.from(listeners).filter(
        listener => listener.namespace === namespace
      )

      for (const listener of listenersToExecute) {
        try {
          await listener.handler(data as T)
          listener.lastTriggered = Date.now()
          listener.triggerCount++

          if (listener.once) {
            listeners.delete(listener)
            this.totalListeners--
          }
        }
        catch (error) {
          console.error(`Error in event handler for "${eventName}" in namespace "${namespace}":`, error)
        }
      }
    }
  }


  /**
   * 移除所有监听器
   *
   * @param eventName - 事件名称（可选）
   */
  removeAllListeners(eventName?: string): void {
    if (eventName) {
      const buckets = this.eventBuckets.get(eventName)
      if (buckets) {
        for (const listeners of buckets.values()) {
          this.totalListeners -= listeners.size
        }
      }
      this.eventBuckets.delete(eventName)
      this.eventMetadata.delete(eventName)
    }
    else {
      this.eventBuckets.clear()
      this.eventMetadata.clear()
      this.totalListeners = 0
    }
  }

  /**
   * 获取事件监听器数量
   *
   * @param eventName - 事件名称
   * @returns 监听器数量
   */
  listenerCount(eventName: string): number {
    return this.getListenerCount(eventName)
  }

  /**
   * 内部方法：获取监听器数量
   */
  private getListenerCount(eventName: string): number {
    const buckets = this.eventBuckets.get(eventName)
    if (!buckets)
      return 0

    let count = 0
    for (const listeners of buckets.values()) {
      count += listeners.size
    }
    return count
  }

  /**
   * 获取所有事件名称
   *
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this.eventBuckets.keys())
  }

  /**
   * 获取事件信息
   *
   * @param eventName - 事件名称
   * @returns 事件信息
   */
  getEventInfo(eventName: string): EventInfo | undefined {
    const buckets = this.eventBuckets.get(eventName)
    const metadata = this.eventMetadata.get(eventName)

    if (!buckets || !metadata) {
      return undefined
    }

    // 获取所有命名空间
    const namespaces = new Set<string>()
    for (const listeners of buckets.values()) {
      for (const listener of listeners) {
        if (listener.namespace) {
          namespaces.add(listener.namespace)
        }
      }
    }

    return {
      name: eventName,
      listenersCount: this.getListenerCount(eventName),
      namespace: Array.from(namespaces).join(', ') || undefined,
      createdAt: metadata.createdAt,
      lastTriggered: metadata.lastTriggered,
      triggerCount: metadata.triggerCount,
    }
  }

  /**
   * 获取所有事件统计信息
   *
   * @returns 事件统计信息
   */
  getStats(): {
    totalEvents: number
    totalListeners: number
    events: EventInfo[]
  } {
    return {
      totalEvents: this.eventBuckets.size,
      totalListeners: this.totalListeners,
      events: this.eventNames()
        .map(name => this.getEventInfo(name))
        .filter(info => info !== undefined) as EventInfo[],
    }
  }

  /**
   * 自动清理长时间未触发的事件
   */
  private autoCleanup(): void {
    const now = Date.now()
    const eventsToCleanup: string[] = []

    for (const [eventName, metadata] of this.eventMetadata) {
      const lastActivity = metadata.lastTriggered ?? metadata.createdAt

      if (now - lastActivity > this.config.autoCleanupThreshold) {
        eventsToCleanup.push(eventName)
      }
    }

    for (const eventName of eventsToCleanup) {
      const count = this.getListenerCount(eventName)
      this.removeAllListeners(eventName)

      console.debug(
        `Auto-cleaned event "${eventName}" with ${count} listeners (inactive for ${this.config.autoCleanupThreshold / 1000
        }s)`
      )
    }
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    if (this.config.autoCleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.autoCleanup()
      }, this.config.autoCleanupInterval)

      // 防止定时器阻止进程退出
      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref()
      }
    }
  }

  /**
   * 停止自动清理
   */
  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  /**
   * 清理孤儿监听器（所有者已被垃圾回收的监听器）
   */
  private cleanupOrphanedListeners(): void {
    let cleaned = 0

    for (const [eventName, buckets] of this.eventBuckets) {
      for (const [priority, listeners] of buckets) {
        for (const listener of listeners) {
          // 检查弱引用所有者是否还存在
          if (listener.owner && !listener.owner.deref()) {
            listeners.delete(listener)
            this.totalListeners--
            cleaned++
          }
        }

        // 清理空桶
        if (listeners.size === 0) {
          buckets.delete(priority)
        }
      }

      // 清理空事件
      if (buckets.size === 0) {
        this.eventBuckets.delete(eventName)
        this.eventMetadata.delete(eventName)
      }
    }

    if (cleaned > 0) {
      console.debug(`清理了 ${cleaned} 个孤儿监听器`)
    }
  }

  /**
   * 启动孤儿监听器清理
   */
  private startOrphanCleanup(): void {
    if (this.config.orphanCleanupInterval > 0) {
      this.orphanCleanupTimer = setInterval(() => {
        this.cleanupOrphanedListeners()
      }, this.config.orphanCleanupInterval)

      // 防止定时器阻止进程退出
      if (this.orphanCleanupTimer.unref) {
        this.orphanCleanupTimer.unref()
      }
    }
  }

  /**
   * 停止孤儿监听器清理
   */
  private stopOrphanCleanup(): void {
    if (this.orphanCleanupTimer) {
      clearInterval(this.orphanCleanupTimer)
      this.orphanCleanupTimer = undefined
    }
  }

  /**
   * 清理指定所有者的所有监听器
   *
   * @param owner - 所有者对象
   * @returns 清理的监听器数量
   *
   * @example
   * ```typescript
   * class MyComponent {
   *   constructor(events: EventManager) {
   *     events.on('data', handler, { owner: this })
   *     events.on('update', handler, { owner: this })
   *   }
   *
   *   destroy() {
   *     // 自动清理所有监听器
   *     events.cleanupOwner(this)
   *   }
   * }
   * ```
   */
  cleanupOwner(owner: object): number {
    const listenerIds = this.ownerListeners.get(owner)
    if (!listenerIds || listenerIds.size === 0) {
      return 0
    }

    let cleaned = 0
    for (const id of listenerIds) {
      const info = this.listenerRegistry.get(id)
      if (info) {
        const buckets = this.eventBuckets.get(info.event)
        if (buckets) {
          const listeners = buckets.get(info.priority)
          if (listeners) {
            for (const listener of listeners) {
              if (listener.id === id) {
                listeners.delete(listener)
                this.totalListeners--
                cleaned++
                break
              }
            }

            // 清理空桶
            if (listeners.size === 0) {
              buckets.delete(info.priority)
            }
          }
        }

        // 清理空事件
        if (buckets && buckets.size === 0) {
          this.eventBuckets.delete(info.event)
          this.eventMetadata.delete(info.event)
        }

        this.listenerRegistry.delete(id)
      }
    }

    this.ownerListeners.delete(owner)
    return cleaned
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    // 初始化逻辑（如果需要）
  }

  /**
   * 销毁
   *
   * 清理所有资源，停止定时器。
   */
  async destroy(): Promise<void> {
    this.stopAutoCleanup()
    this.stopOrphanCleanup()
    this.removeAllListeners()
    this.listenerRegistry.clear()
  }
}

/**
 * 创建事件管理器
 *
 * @param config - 事件管理器配置
 * @returns 事件管理器实例
 *
 * @example
 * ```typescript
 * const events = createEventManager({
 *   maxListenersPerEvent: 100,
 *   autoCleanupThreshold: 3600000
 * })
 * ```
 */
export function createEventManager(config?: EventManagerConfig): EventManager {
  return new CoreEventManager(config)
}
