/**
 * 事件总线
 * 提供全局事件发布订阅机制
 */

import type { EventBusOptions, EventFilter, EventListener } from '../types'
import { EventEmitter } from './event-emitter'

/**
 * 事件总线类
 */
export class EventBus {
  private static instance: EventBus | undefined
  private emitter: EventEmitter
  private channels: Map<string, EventEmitter> = new Map()
  private filters: Map<string, EventFilter[]> = new Map()
  private middleware: Array<(event: string, args: unknown[], next: () => void) => void> = []
  private options: Required<EventBusOptions>

  constructor(options: EventBusOptions = {}) {
    this.options = {
      enableWildcard: options.enableWildcard !== false,
      enableNamespaces: options.enableNamespaces !== false,
      enableFilters: options.enableFilters !== false,
      enableMiddleware: options.enableMiddleware !== false,
      maxListeners: options.maxListeners || 100,
      enableStats: options.enableStats !== false,
    }

    this.emitter = new EventEmitter({
      maxListeners: this.options.maxListeners,
      enableStats: this.options.enableStats,
    })

    // 创建默认频道
    this.channels.set('default', this.emitter)
  }

  /**
   * 获取单例实例
   */
  static getInstance(options?: EventBusOptions): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus(options)
    }
    return EventBus.instance!
  }

  /**
   * 订阅事件
   */
  on(
    event: string,
    listener: EventListener,
    options: {
      channel?: string
      priority?: number
      namespace?: string
      tags?: string[]
      filter?: EventFilter
    } = {},
  ): this {
    const channel = this.getOrCreateChannel(options.channel || 'default')

    // 添加过滤器
    if (options.filter && this.options.enableFilters) {
      this.addFilter(event, options.filter)
    }

    channel.on(event, listener, {
      priority: options.priority,
      namespace: options.namespace,
      tags: options.tags,
    })

    return this
  }

  /**
   * 订阅一次性事件
   */
  once(
    event: string,
    listener: EventListener,
    options: {
      channel?: string
      priority?: number
      namespace?: string
      tags?: string[]
      filter?: EventFilter
    } = {},
  ): this {
    const channel = this.getOrCreateChannel(options.channel || 'default')

    // 添加过滤器
    if (options.filter && this.options.enableFilters) {
      this.addFilter(event, options.filter)
    }

    channel.once(event, listener, {
      priority: options.priority,
      namespace: options.namespace,
      tags: options.tags,
    })

    return this
  }

  /**
   * 取消订阅
   */
  off(event: string, listener?: EventListener, channel?: string): this {
    const channelEmitter = this.getChannel(channel || 'default')
    if (channelEmitter) {
      channelEmitter.off(event, listener)
    }
    return this
  }

  /**
   * 发布事件
   */
  emit(event: string, ...args: unknown[]): boolean {
    return this.emitToChannel('default', event, ...args)
  }

  /**
   * 发布事件到指定频道
   */
  emitToChannel(channel: string, event: string, ...args: unknown[]): boolean {
    const channelEmitter = this.getChannel(channel)
    if (!channelEmitter) {
      return false
    }

    // 应用过滤器
    if (this.options.enableFilters && !this.applyFilters(event, args)) {
      return false
    }

    // 应用中间件
    if (this.options.enableMiddleware && this.middleware.length > 0) {
      return this.applyMiddleware(channelEmitter, event, args)
    }

    // 处理通配符事件
    if (this.options.enableWildcard) {
      this.emitWildcardEvents(channelEmitter, event, args)
    }

    return channelEmitter.emit(event, ...args)
  }

  /**
   * 异步发布事件
   */
  async emitAsync(event: string, ...args: unknown[]): Promise<unknown[]> {
    return this.emitAsyncToChannel('default', event, ...args)
  }

  /**
   * 异步发布事件到指定频道
   */
  async emitAsyncToChannel(channel: string, event: string, ...args: unknown[]): Promise<unknown[]> {
    const channelEmitter = this.getChannel(channel)
    if (!channelEmitter) {
      return []
    }

    // 应用过滤器
    if (this.options.enableFilters && !this.applyFilters(event, args)) {
      return []
    }

    return channelEmitter.emitAsync(event, ...args)
  }

  /**
   * 广播事件到所有频道
   */
  broadcast(event: string, ...args: unknown[]): void {
    for (const [channelName] of this.channels) {
      this.emitToChannel(channelName, event, ...args)
    }
  }

  /**
   * 创建频道
   */
  createChannel(name: string): EventEmitter {
    if (this.channels.has(name)) {
      throw new Error(`Channel '${name}' already exists`)
    }

    const channel = new EventEmitter({
      maxListeners: this.options.maxListeners,
      enableStats: this.options.enableStats,
    })

    this.channels.set(name, channel)
    return channel
  }

  /**
   * 获取或创建频道
   */
  private getOrCreateChannel(name: string): EventEmitter {
    let channel = this.channels.get(name)
    if (!channel) {
      channel = this.createChannel(name)
    }
    return channel
  }

  /**
   * 获取频道
   */
  getChannel(name: string): EventEmitter | undefined {
    return this.channels.get(name)
  }

  /**
   * 删除频道
   */
  removeChannel(name: string): boolean {
    if (name === 'default') {
      throw new Error('Cannot remove default channel')
    }

    const channel = this.channels.get(name)
    if (channel) {
      channel.removeAllListeners()
      this.channels.delete(name)
      return true
    }
    return false
  }

  /**
   * 获取所有频道名称
   */
  getChannelNames(): string[] {
    return Array.from(this.channels.keys())
  }

  /**
   * 添加中间件
   */
  use(middleware: (event: string, args: unknown[], next: () => void) => void): this {
    this.middleware.push(middleware)
    return this
  }

  /**
   * 移除中间件
   */
  removeMiddleware(middleware: (event: string, args: unknown[], next: () => void) => void): boolean {
    const index = this.middleware.indexOf(middleware)
    if (index !== -1) {
      this.middleware.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 添加事件过滤器
   */
  addFilter(event: string, filter: EventFilter): this {
    if (!this.filters.has(event)) {
      this.filters.set(event, [])
    }
    this.filters.get(event)!.push(filter)
    return this
  }

  /**
   * 移除事件过滤器
   */
  removeFilter(event: string, filter?: EventFilter): this {
    if (!filter) {
      this.filters.delete(event)
    }
    else {
      const filters = this.filters.get(event)
      if (filters) {
        const index = filters.indexOf(filter)
        if (index !== -1) {
          filters.splice(index, 1)
        }
      }
    }
    return this
  }

  /**
   * 应用过滤器
   */
  private applyFilters(event: string, args: unknown[]): boolean {
    const filters = this.filters.get(event)
    if (!filters || filters.length === 0) {
      return true
    }

    return filters.every(filter => filter(event, args))
  }

  /**
   * 应用中间件
   */
  private applyMiddleware(emitter: EventEmitter, event: string, args: unknown[]): boolean {
    let index = 0

    const next = (): void => {
      if (index < this.middleware.length) {
        const middleware = this.middleware[index++]
        if (middleware) {
          middleware(event, args, next)
        }
        else {
          next()
        }
      }
      else {
        // 所有中间件都执行完毕，发射事件
        emitter.emit(event, ...args)
      }
    }

    next()
    return true
  }

  /**
   * 处理通配符事件
   */
  private emitWildcardEvents(emitter: EventEmitter, event: string, args: unknown[]): void {
    const parts = event.split('.')

    // 发射父级通配符事件
    for (let i = parts.length - 1; i > 0; i--) {
      const wildcardEvent = `${parts.slice(0, i).join('.')}.*`
      emitter.emit(wildcardEvent, event, ...args)
    }

    // 发射全局通配符事件
    emitter.emit('*', event, ...args)
  }

  /**
   * 按命名空间移除监听器
   */
  removeListenersByNamespace(namespace: string, channel?: string): this {
    if (channel) {
      const channelEmitter = this.getChannel(channel)
      if (channelEmitter) {
        channelEmitter.removeListenersByNamespace(namespace)
      }
    }
    else {
      for (const channelEmitter of this.channels.values()) {
        channelEmitter.removeListenersByNamespace(namespace)
      }
    }
    return this
  }

  /**
   * 按标签移除监听器
   */
  removeListenersByTag(tag: string, channel?: string): this {
    if (channel) {
      const channelEmitter = this.getChannel(channel)
      if (channelEmitter) {
        channelEmitter.removeListenersByTag(tag)
      }
    }
    else {
      for (const channelEmitter of this.channels.values()) {
        channelEmitter.removeListenersByTag(tag)
      }
    }
    return this
  }

  /**
   * 等待事件
   */
  waitFor(event: string, timeout?: number, channel?: string): Promise<unknown[]> {
    const channelEmitter = this.getChannel(channel || 'default')
    if (!channelEmitter) {
      return Promise.reject(new Error(`Channel '${channel}' not found`))
    }
    return channelEmitter.waitFor(event, timeout)
  }

  /**
   * 获取统计信息
   */
  getStats(channel?: string): unknown {
    if (channel) {
      const channelEmitter = this.getChannel(channel)
      return channelEmitter ? channelEmitter.getEventStats() : undefined
    }

    const stats: Record<string, unknown> = {}
    for (const [name, channelEmitter] of this.channels) {
      stats[name] = channelEmitter.getEventStats()
    }
    return stats
  }

  /**
   * 重置统计信息
   */
  resetStats(channel?: string): this {
    if (channel) {
      const channelEmitter = this.getChannel(channel)
      if (channelEmitter) {
        channelEmitter.resetStats()
      }
    }
    else {
      for (const channelEmitter of this.channels.values()) {
        channelEmitter.resetStats()
      }
    }
    return this
  }

  /**
   * 清空所有监听器
   */
  clear(channel?: string): this {
    if (channel) {
      const channelEmitter = this.getChannel(channel)
      if (channelEmitter) {
        channelEmitter.removeAllListeners()
      }
    }
    else {
      for (const channelEmitter of this.channels.values()) {
        channelEmitter.removeAllListeners()
      }
    }
    return this
  }

  /**
   * 销毁事件总线
   */
  destroy(): void {
    this.clear()
    this.channels.clear()
    this.filters.clear()
    this.middleware = []
    EventBus.instance = undefined
  }

  /**
   * 创建事件总线实例
   */
  static create(options?: EventBusOptions): EventBus {
    return new EventBus(options)
  }
}
