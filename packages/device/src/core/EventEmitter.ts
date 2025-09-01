import type { EventListener } from '../types'

/**
 * 高性能事件发射器实现
 */
export class EventEmitter<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  private events: Map<keyof T, Set<EventListener<unknown>>> = new Map()
  private maxListeners = 100 // 增加最大监听器数量以支持测试
  private errorHandler?: (error: Error, event: keyof T) => void

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
   * 添加事件监听器
   */
  on<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }

    const listeners = this.events.get(event)!

    // 检查监听器数量限制
    if (listeners.size >= this.maxListeners) {
      console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${String(event)}`)
    }

    listeners.add(listener as EventListener<unknown>)
    return this
  }

  /**
   * 添加一次性事件监听器
   */
  once<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
    const onceListener = (data: T[K]) => {
      listener(data)
      this.off(event, onceListener)
    }
    return this.on(event, onceListener)
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof T>(event: K, listener?: EventListener<T[K]>): this {
    const listeners = this.events.get(event)
    if (!listeners)
      return this

    if (listener) {
      listeners.delete(listener as EventListener<unknown>)
      if (listeners.size === 0) {
        this.events.delete(event)
      }
    }
    else {
      this.events.delete(event)
    }

    return this
  }

  /**
   * 触发事件
   */
  emit<K extends keyof T>(event: K, data: T[K]): this {
    const listeners = this.events.get(event)
    if (!listeners || listeners.size === 0) {
      return this
    }

    // 性能优化：将 Set 转换为数组以避免迭代器开销
    const listenersArray = Array.from(listeners)

    for (const listener of listenersArray) {
      try {
        listener(data)
      }
      catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))

        if (this.errorHandler) {
          this.errorHandler(err, event)
        }
        else {
          console.error(`Error in event listener for "${String(event)}":`, err)
        }
      }
    }

    return this
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount<K extends keyof T>(event: K): number {
    const listeners = this.events.get(event)
    return listeners ? listeners.size : 0
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): Array<keyof T> {
    return Array.from(this.events.keys())
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners<K extends keyof T>(event?: K): this {
    if (event) {
      this.events.delete(event)
    }
    else {
      this.events.clear()
    }
    return this
  }

  /**
   * 获取指定事件的所有监听器
   */
  listeners<K extends keyof T>(event: K): EventListener<T[K]>[] {
    const listeners = this.events.get(event)
    return listeners ? Array.from(listeners) : []
  }

  /**
   * 检查是否有指定事件的监听器
   */
  hasListeners<K extends keyof T>(event: K): boolean {
    return this.listenerCount(event) > 0
  }
}
