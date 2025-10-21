/**
 * @ldesign/form - Event Emitter
 * 事件发射器
 */

import type { EventListener, Disposer } from '../utils/types'
import { MAX_LISTENERS } from '../utils/constants'

/**
 * 事件监听器配置
 */
interface ListenerConfig<T = any> {
  listener: EventListener<T>
  once: boolean
  priority: number
}

/**
 * 事件发射器类
 */
export class EventEmitter<EventMap extends Record<string, any> = Record<string, any>> {
  private listeners: Map<keyof EventMap, ListenerConfig[]>
  private maxListeners: number
  private destroyed: boolean

  constructor(maxListeners = MAX_LISTENERS) {
    this.listeners = new Map()
    this.maxListeners = maxListeners
    this.destroyed = false
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param priority 优先级（数字越大优先级越高）
   * @returns 取消订阅函数
   */
  on<K extends keyof EventMap>(
    event: K,
    listener: EventListener<EventMap[K]>,
    priority = 0
  ): Disposer {
    this.checkDestroyed()
    this.addListener(event, listener, false, priority)

    return () => this.off(event, listener)
  }

  /**
   * 添加一次性事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param priority 优先级
   * @returns 取消订阅函数
   */
  once<K extends keyof EventMap>(
    event: K,
    listener: EventListener<EventMap[K]>,
    priority = 0
  ): Disposer {
    this.checkDestroyed()
    this.addListener(event, listener, true, priority)

    return () => this.off(event, listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off<K extends keyof EventMap>(
    event: K,
    listener?: EventListener<EventMap[K]>
  ): void {
    if (this.destroyed) return

    if (!listener) {
      // 移除该事件的所有监听器
      this.listeners.delete(event)
      return
    }

    const eventListeners = this.listeners.get(event)
    if (!eventListeners) return

    const index = eventListeners.findIndex(config => config.listener === listener)
    if (index !== -1) {
      eventListeners.splice(index, 1)
      if (eventListeners.length === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param data 事件数据
   */
  async emit<K extends keyof EventMap>(event: K, data: EventMap[K]): Promise<void> {
    if (this.destroyed) return

    const eventListeners = this.listeners.get(event)
    if (!eventListeners || eventListeners.length === 0) return

    // 按优先级排序（从高到低）
    const sortedListeners = [...eventListeners].sort((a, b) => b.priority - a.priority)

    // 执行监听器
    const toRemove: EventListener<EventMap[K]>[] = []

    for (const config of sortedListeners) {
      try {
        await config.listener(data)

        // 如果是一次性监听器，标记为需要移除
        if (config.once) {
          toRemove.push(config.listener)
        }
      } catch (error) {
        console.error(`Error in event listener for "${String(event)}":`, error)
      }
    }

    // 移除一次性监听器
    toRemove.forEach(listener => this.off(event, listener))
  }

  /**
   * 同步触发事件
   * @param event 事件名称
   * @param data 事件数据
   */
  emitSync<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    if (this.destroyed) return

    const eventListeners = this.listeners.get(event)
    if (!eventListeners || eventListeners.length === 0) return

    // 按优先级排序（从高到低）
    const sortedListeners = [...eventListeners].sort((a, b) => b.priority - a.priority)

    // 执行监听器
    const toRemove: EventListener<EventMap[K]>[] = []

    for (const config of sortedListeners) {
      try {
        config.listener(data)

        // 如果是一次性监听器，标记为需要移除
        if (config.once) {
          toRemove.push(config.listener)
        }
      } catch (error) {
        console.error(`Error in event listener for "${String(event)}":`, error)
      }
    }

    // 移除一次性监听器
    toRemove.forEach(listener => this.off(event, listener))
  }

  /**
   * 获取事件的监听器数量
   * @param event 事件名称
   */
  listenerCount<K extends keyof EventMap>(event: K): number {
    const eventListeners = this.listeners.get(event)
    return eventListeners ? eventListeners.length : 0
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): (keyof EventMap)[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners<K extends keyof EventMap>(event?: K): void {
    if (event !== undefined) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * 销毁事件发射器
   */
  destroy(): void {
    this.removeAllListeners()
    this.destroyed = true
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('EventEmitter has been destroyed')
    }
  }

  /**
   * 添加监听器（内部方法）
   */
  private addListener<K extends keyof EventMap>(
    event: K,
    listener: EventListener<EventMap[K]>,
    once: boolean,
    priority: number
  ): void {
    let eventListeners = this.listeners.get(event)

    if (!eventListeners) {
      eventListeners = []
      this.listeners.set(event, eventListeners)
    }

    // 检查监听器数量限制
    if (eventListeners.length >= this.maxListeners) {
      console.warn(
        `Max listeners (${this.maxListeners}) for event "${String(event)}" exceeded.` +
          ` This might indicate a memory leak.`
      )
    }

    // 添加监听器
    eventListeners.push({
      listener,
      once,
      priority
    })
  }

  /**
   * 获取是否已销毁
   */
  get isDestroyed(): boolean {
    return this.destroyed
  }
}

/**
 * 创建事件发射器
 */
export function createEventEmitter<
  EventMap extends Record<string, any> = Record<string, any>
>(maxListeners?: number): EventEmitter<EventMap> {
  return new EventEmitter<EventMap>(maxListeners)
}




