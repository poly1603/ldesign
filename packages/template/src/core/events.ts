/**
 * 事件系统
 *
 * 统一的事件发布订阅系统，用于核心层与其他层之间的通信
 */

import type { EventListener, EventType, UnsubscribeFn } from '../types'

/**
 * 事件发射器类
 */
export class EventEmitter {
  private listeners = new Map<EventType, Set<EventListener>>()

  /**
   * 监听事件
   */
  on<T = any>(event: EventType, listener: EventListener<T>): UnsubscribeFn {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(listener as EventListener)

    // 返回取消订阅函数
    return () => this.off(event, listener)
  }

  /**
   * 监听事件（只触发一次）
   */
  once<T = any>(event: EventType, listener: EventListener<T>): UnsubscribeFn {
    const wrappedListener: EventListener<T> = (data) => {
      this.off(event, wrappedListener as EventListener)
      listener(data)
    }

    return this.on(event, wrappedListener)
  }

  /**
   * 取消监听
   */
  off<T = any>(event: EventType, listener: EventListener<T>): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.delete(listener as EventListener)
      if (listeners.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * 发射事件
   */
  async emit<T = any>(event: EventType, data?: T): Promise<void> {
    const listeners = this.listeners.get(event)
    if (!listeners || listeners.size === 0)
return

    const promises: Promise<void>[] = []

    for (const listener of listeners) {
      try {
        const result = listener(data)
        if (result instanceof Promise) {
          promises.push(result)
        }
      }
 catch (error) {
        console.error(`[EventEmitter] Error in listener for "${event}":`, error)
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises)
    }
  }

  /**
   * 移除所有监听器
   */
  clear(event?: EventType): void {
    if (event) {
      this.listeners.delete(event)
    }
 else {
      this.listeners.clear()
    }
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: EventType): number {
    return this.listeners.get(event)?.size || 0
  }

  /**
   * 获取所有事件类型
   */
  eventNames(): EventType[] {
    return Array.from(this.listeners.keys())
  }
}

// 单例实例
let instance: EventEmitter | null = null

/**
 * 获取全局事件发射器实例
 */
export function getGlobalEmitter(): EventEmitter {
  if (!instance) {
    instance = new EventEmitter()
  }
  return instance
}

/**
 * 重置全局事件发射器
 */
export function resetGlobalEmitter(): void {
  if (instance) {
    instance.clear()
    instance = null
  }
}
