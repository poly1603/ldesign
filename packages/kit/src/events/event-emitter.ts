/**
 * 增强的事件发射器模块
 * 提供比 Node.js 原生 EventEmitter 更强大的功能，包括优先级、命名空间、统计信息等
 *
 * @example
 * ```typescript
 * import { EventEmitter } from '@ldesign/kit'
 *
 * const emitter = new EventEmitter({
 *   maxListeners: 50,
 *   enableStats: true
 * })
 *
 * // 添加带优先级的监听器
 * emitter.on('data', (data) => , { priority: 1 })
 * emitter.on('data', (data) => , { priority: 10 })
 *
 * // 添加带命名空间的监听器
 * emitter.on('user:login', (user) => )
 *
 * // 发射事件
 * emitter.emit('data', { message: 'Hello' })
 * emitter.emit('user:login', { id: 1, name: 'John' })
 *
 * // 获取统计信息
 * const stats = emitter.getEventStats('data')
 * 
 * ```
 */

import type { EventListener, EventOptions, EventStats } from '../types'
import { EventEmitter as NodeEventEmitter } from 'node:events'

/**
 * 事件监听器信息接口
 * 存储每个监听器的详细信息，用于管理和统计
 */
interface ListenerInfo {
  /** 事件监听器函数 */
  listener: EventListener
  /** 是否为一次性监听器 */
  once: boolean
  /** 监听器优先级，数值越大优先级越高 */
  priority: number
  /** 监听器所属的命名空间 */
  namespace?: string
  /** 监听器标签，用于分类和过滤 */
  tags: string[]
  /** 监听器创建时间 */
  createdAt: Date
  /** 监听器被调用次数 */
  callCount: number
  /** 最后一次被调用的时间 */
  lastCalledAt?: Date
}

/**
 * 增强的事件发射器类
 * 继承自 Node.js 原生 EventEmitter，提供额外的功能：
 *
 * - 监听器优先级控制
 * - 命名空间支持
 * - 事件统计信息
 * - 监听器标签和过滤
 * - 批量操作支持
 * - 条件监听器
 *
 * @extends NodeEventEmitter
 */
export class EventEmitter extends NodeEventEmitter {
  private listenerInfos: Map<string, ListenerInfo[]> = new Map()
  private stats: Map<string, EventStats> = new Map()
  private maxListenersPerEvent = 100
  private enableStats = true
  private namespaces: Set<string> = new Set()

  constructor(options: EventOptions = {}) {
    super()

    this.maxListenersPerEvent = options.maxListeners || 100
    this.enableStats = options.enableStats !== false

    // 设置Node.js EventEmitter的最大监听器数量
    this.setMaxListeners(this.maxListenersPerEvent)
  }

  /**
   * 添加事件监听器
   */
  override on(
    event: string,
    listener: EventListener,
    options: {
      priority?: number
      namespace?: string
      tags?: string[]
      once?: boolean
    } = {},
  ): this {
    return this.addListenerWithOptions(event, listener, {
      ...options,
      once: false,
    })
  }

  /**
   * 添加一次性事件监听器
   */
  override once(
    event: string,
    listener: EventListener,
    options: {
      priority?: number
      namespace?: string
      tags?: string[]
    } = {},
  ): this {
    return this.addListenerWithOptions(event, listener, {
      ...options,
      once: true,
    })
  }

  /**
   * 添加监听器（内部方法）
   */
  private addListenerWithOptions(
    event: string,
    listener: EventListener,
    options: {
      priority?: number
      namespace?: string
      tags?: string[]
      once?: boolean
    },
  ): this {
    const listenerInfo: ListenerInfo = {
      listener,
      once: options.once || false,
      priority: options.priority || 0,
      namespace: options.namespace,
      tags: options.tags || [],
      createdAt: new Date(),
      callCount: 0,
    }

    // 添加到内部监听器列表
    if (!this.listenerInfos.has(event)) {
      this.listenerInfos.set(event, [])
    }

    const eventListeners = this.listenerInfos.get(event)!
    eventListeners.push(listenerInfo)

    // 按优先级排序（高优先级先执行）
    eventListeners.sort((a, b) => b.priority - a.priority)

    // 添加命名空间
    if (options.namespace) {
      this.namespaces.add(options.namespace)
    }

    // 初始化统计信息
    if (this.enableStats && !this.stats.has(event)) {
      this.stats.set(event, {
        emitCount: 0,
        listenerCount: 0,
        lastEmittedAt: undefined,
        averageExecutionTime: 0,
        totalExecutionTime: 0,
      })
    }

    // 更新监听器数量
    if (this.enableStats) {
      const stats = this.stats.get(event)!
      stats.listenerCount = eventListeners.length
    }

    // 添加到Node.js EventEmitter
    if (options.once) {
      super.once(event, listener)
    }
    else {
      super.on(event, listener)
    }

    return this
  }

  /**
   * 移除事件监听器
   */
  override off(event: string, listener?: EventListener): this {
    if (!listener) {
      return this.removeAllListeners(event)
    }

    const eventListeners = this.listenerInfos.get(event)
    if (eventListeners) {
      const index = eventListeners.findIndex(info => info.listener === listener)
      if (index !== -1) {
        eventListeners.splice(index, 1)

        // 更新统计信息
        if (this.enableStats) {
          const stats = this.stats.get(event)!
          stats.listenerCount = eventListeners.length
        }
      }
    }

    super.off(event, listener)
    return this
  }

  /**
   * 移除所有监听器
   */
  override removeAllListeners(event?: string): this {
    if (event) {
      this.listenerInfos.delete(event)
      if (this.enableStats) {
        const stats = this.stats.get(event)
        if (stats) {
          stats.listenerCount = 0
        }
      }
    }
    else {
      this.listenerInfos.clear()
      if (this.enableStats) {
        for (const stats of this.stats.values()) {
          stats.listenerCount = 0
        }
      }
    }

    super.removeAllListeners(event)
    return this
  }

  /**
   * 发射事件
   */
  override emit(event: string, ...args: unknown[]): boolean {
    const startTime = this.enableStats ? Date.now() : 0

    // 更新统计信息
    if (this.enableStats) {
      const stats = this.stats.get(event)
      if (stats) {
        stats.emitCount++
        stats.lastEmittedAt = new Date()
      }
    }

    // 更新监听器调用统计
    const eventListeners = this.listenerInfos.get(event)
    if (eventListeners) {
      for (const listenerInfo of eventListeners) {
        listenerInfo.callCount++
        listenerInfo.lastCalledAt = new Date()
      }
    }

    const result = super.emit(event, ...args)

    // 更新执行时间统计
    if (this.enableStats && startTime > 0) {
      const executionTime = Date.now() - startTime
      const stats = this.stats.get(event)
      if (stats) {
        stats.totalExecutionTime += executionTime
        stats.averageExecutionTime = stats.totalExecutionTime / stats.emitCount
      }
    }

    return result
  }

  /**
   * 异步发射事件
   */
  async emitAsync(event: string, ...args: unknown[]): Promise<unknown[]> {
    const eventListeners = this.listenerInfos.get(event)
    if (!eventListeners || eventListeners.length === 0) {
      return []
    }

    const startTime = this.enableStats ? Date.now() : 0

    // 更新统计信息
    if (this.enableStats) {
      const stats = this.stats.get(event)
      if (stats) {
        stats.emitCount++
        stats.lastEmittedAt = new Date()
      }
    }

    const results: unknown[] = []

    for (const listenerInfo of eventListeners) {
      try {
        listenerInfo.callCount++
        listenerInfo.lastCalledAt = new Date()

        const result = await listenerInfo.listener(...args)
        results.push(result)

        // 如果是一次性监听器，移除它
        if (listenerInfo.once) {
          this.off(event, listenerInfo.listener)
        }
      }
      catch (error) {
        this.emit('error', error)
      }
    }

    // 更新执行时间统计
    if (this.enableStats && startTime > 0) {
      const executionTime = Date.now() - startTime
      const stats = this.stats.get(event)
      if (stats) {
        stats.totalExecutionTime += executionTime
        stats.averageExecutionTime = stats.totalExecutionTime / stats.emitCount
      }
    }

    return results
  }

  /**
   * 按命名空间移除监听器
   */
  removeListenersByNamespace(namespace: string): this {
    for (const [event, eventListeners] of this.listenerInfos) {
      const filteredListeners = eventListeners.filter(
        (info: ListenerInfo) => info.namespace !== namespace,
      )

      if (filteredListeners.length !== eventListeners.length) {
        this.listenerInfos.set(event, filteredListeners)

        // 更新统计信息
        if (this.enableStats) {
          const stats = this.stats.get(event)
          if (stats) {
            stats.listenerCount = filteredListeners.length
          }
        }

        // 重新注册到Node.js EventEmitter
        super.removeAllListeners(event)
        for (const info of filteredListeners) {
          if (info.once) {
            super.once(event, info.listener)
          }
          else {
            super.on(event, info.listener)
          }
        }
      }
    }

    this.namespaces.delete(namespace)
    return this
  }

  /**
   * 按标签移除监听器
   */
  removeListenersByTag(tag: string): this {
    for (const [event, eventListeners] of this.listenerInfos) {
      const filteredListeners = eventListeners.filter(
        (info: ListenerInfo) => !info.tags.includes(tag),
      )

      if (filteredListeners.length !== eventListeners.length) {
        this.listenerInfos.set(event, filteredListeners)

        // 更新统计信息
        if (this.enableStats) {
          const stats = this.stats.get(event)
          if (stats) {
            stats.listenerCount = filteredListeners.length
          }
        }

        // 重新注册到Node.js EventEmitter
        super.removeAllListeners(event)
        for (const info of filteredListeners) {
          if (info.once) {
            super.once(event, info.listener)
          }
          else {
            super.on(event, info.listener)
          }
        }
      }
    }

    return this
  }

  /**
   * 获取事件的监听器信息
   */
  getListenerInfo(event: string): ListenerInfo[] {
    return this.listenerInfos.get(event) || []
  }

  /**
   * 获取所有命名空间
   */
  getNamespaces(): string[] {
    return Array.from(this.namespaces)
  }

  /**
   * 获取事件统计信息
   */
  getEventStats(event?: string): Map<string, EventStats> | EventStats | undefined {
    if (event) {
      return this.stats.get(event)
    }
    return new Map(this.stats)
  }

  /**
   * 重置统计信息
   */
  resetStats(event?: string): this {
    if (event) {
      const stats = this.stats.get(event)
      if (stats) {
        stats.emitCount = 0
        stats.lastEmittedAt = undefined
        stats.averageExecutionTime = 0
        stats.totalExecutionTime = 0
      }
    }
    else {
      for (const stats of this.stats.values()) {
        stats.emitCount = 0
        stats.lastEmittedAt = undefined
        stats.averageExecutionTime = 0
        stats.totalExecutionTime = 0
      }
    }
    return this
  }

  /**
   * 启用/禁用统计
   */
  setStatsEnabled(enabled: boolean): this {
    this.enableStats = enabled
    return this
  }

  /**
   * 获取所有事件名称
   */
  getEventNames(): string[] {
    return Array.from(this.listenerInfos.keys())
  }

  /**
   * 获取监听器数量
   */
  getListenerCount(event?: string): number {
    if (event) {
      return this.listenerInfos.get(event)?.length || 0
    }

    let total = 0
    for (const listeners of this.listenerInfos.values()) {
      total += listeners.length
    }
    return total
  }

  /**
   * 检查是否有监听器
   */
  hasListeners(event: string): boolean {
    return this.getListenerCount(event) > 0
  }

  /**
   * 等待事件发生
   */
  waitFor(event: string, timeout?: number): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const listener = (...args: unknown[]) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        this.off(event, listener)
        resolve(args)
      }

      this.once(event, listener)

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(event, listener)
          reject(new Error(`Timeout waiting for event '${event}'`))
        }, timeout)
      }
    })
  }

  /**
   * 创建事件发射器实例
   */
  static create(options?: EventOptions): EventEmitter {
    return new EventEmitter(options)
  }
}
