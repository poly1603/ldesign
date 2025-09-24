/**
 * 事件发射器类
 * 提供事件监听和触发功能
 */

export type EventListener<T = any> = (data: T) => void

/**
 * 事件发射器类
 * 用于实现观察者模式，支持事件的注册、触发和移除
 */
export class EventEmitter<T extends Record<string, any> = Record<string, any>> {
  /** 事件监听器映射 */
  private listeners: Map<keyof T, Set<EventListener>> = new Map()

  /**
   * 注册事件监听器
   * @param event - 事件名称
   * @param listener - 监听器函数
   * @returns 当前实例，支持链式调用
   */
  on<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
    return this
  }

  /**
   * 注册一次性事件监听器
   * @param event - 事件名称
   * @param listener - 监听器函数
   * @returns 当前实例，支持链式调用
   */
  once<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
    const onceListener: EventListener<T[K]> = (data) => {
      listener(data)
      this.off(event, onceListener)
    }
    return this.on(event, onceListener)
  }

  /**
   * 移除事件监听器
   * @param event - 事件名称
   * @param listener - 监听器函数（可选，不传则移除所有监听器）
   * @returns 当前实例，支持链式调用
   */
  off<K extends keyof T>(event: K, listener?: EventListener<T[K]>): this {
    const eventListeners = this.listeners.get(event)
    if (!eventListeners) return this

    if (listener) {
      eventListeners.delete(listener)
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }
    } else {
      this.listeners.delete(event)
    }
    return this
  }

  /**
   * 触发事件
   * @param event - 事件名称
   * @param data - 事件数据
   * @returns 当前实例，支持链式调用
   */
  emit<K extends keyof T>(event: K, data: T[K]): this {
    const eventListeners = this.listeners.get(event)
    if (!eventListeners) return this

    // 创建监听器副本，避免在执行过程中修改原集合
    const listenersArray = Array.from(eventListeners)
    
    for (const listener of listenersArray) {
      try {
        listener(data)
      } catch (error) {
        console.error(`Error in event listener for "${String(event)}":`, error)
      }
    }
    return this
  }

  /**
   * 获取指定事件的监听器数量
   * @param event - 事件名称
   * @returns 监听器数量
   */
  listenerCount<K extends keyof T>(event: K): number {
    const eventListeners = this.listeners.get(event)
    return eventListeners ? eventListeners.size : 0
  }

  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  eventNames(): Array<keyof T> {
    return Array.from(this.listeners.keys())
  }

  /**
   * 移除所有事件监听器
   * @returns 当前实例，支持链式调用
   */
  removeAllListeners(): this {
    this.listeners.clear()
    return this
  }

  /**
   * 检查是否有指定事件的监听器
   * @param event - 事件名称
   * @returns 是否有监听器
   */
  hasListeners<K extends keyof T>(event: K): boolean {
    return this.listenerCount(event) > 0
  }
}
