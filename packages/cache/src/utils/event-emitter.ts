/**
 * 事件监听器函数类型
 */
export type EventListener<T = unknown> = (event: T) => void

/**
 * 事件发射器
 *
 * 提供类型安全的事件发布订阅机制，支持泛型约束确保事件数据类型安全
 *
 * @template T - 事件数据类型，默认为 unknown 以确保类型安全
 *
 * @example
 * ```typescript
 * // 定义事件数据类型
 * interface MyEvent {
 *   type: string
 *   data: any
 * }
 *
 * // 创建类型安全的事件发射器
 * const emitter = new EventEmitter<MyEvent>()
 *
 * // 添加监听器
 * emitter.on('test', (event) => {
 *    // TypeScript 会提供类型提示
 * })
 *
 * // 触发事件
 * emitter.emit('test', { type: 'test', data: 'hello' })
 * ```
 */
export class EventEmitter<T = unknown> {
  /** 事件监听器映射表 */
  private readonly listeners: Map<string, Set<EventListener<T>>> = new Map()

  /**
   * 添加事件监听器
   *
   * @param event - 事件名称
   * @param listener - 事件监听器函数
   *
   * @example
   * ```typescript
   * emitter.on('data', (event) => )
   * ```
   */
  on(event: string, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   *
   * @param event - 事件名称
   * @param listener - 要移除的事件监听器函数
   *
   * @example
   * ```typescript
   * const handler = (event) => 
   * emitter.on('data', handler)
   * emitter.off('data', handler) // 移除特定监听器
   * ```
   */
  off(event: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener)
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * 添加一次性事件监听器
   *
   * 监听器在第一次触发后会自动移除
   *
   * @param event - 事件名称
   * @param listener - 事件监听器函数
   *
   * @example
   * ```typescript
   * emitter.once('init', (event) => {
   *   
   *   // 这个监听器只会执行一次
   * })
   * ```
   */
  once(event: string, listener: EventListener<T>): void {
    const onceListener: EventListener<T> = (eventData: T) => {
      listener(eventData)
      this.off(event, onceListener)
    }
    this.on(event, onceListener)
  }

  /**
   * 触发事件
   *
   * 向所有注册的监听器发送事件数据
   *
   * @param event - 事件名称
   * @param data - 事件数据
   *
   * @example
   * ```typescript
   * emitter.emit('data', { message: 'Hello World' })
   * ```
   */
  emit(event: string, data: T): void {
    const eventListeners = this.listeners.get(event)
    if (!eventListeners || eventListeners.size === 0) {
      return
    }
    
    // 优化：将Set转换为数组一次，避免迭代器开销
    const listenersArray = Array.from(eventListeners)
    for (let i = 0; i < listenersArray.length; i++) {
      try {
        listenersArray[i](data)
      }
      catch (error) {
        console.error(`Error in event listener for ${event}:`, error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  /**
   * 移除所有监听器
   *
   * @param event - 可选的事件名称，如果提供则只移除该事件的监听器，否则移除所有监听器
   *
   * @example
   * ```typescript
   * // 移除特定事件的所有监听器
   * emitter.removeAllListeners('data')
   *
   * // 移除所有事件的所有监听器
   * emitter.removeAllListeners()
   * ```
   */
  removeAllListeners(event?: string): void {
    if (event !== undefined) {
      this.listeners.delete(event)
    }
    else {
      this.listeners.clear()
    }
  }

  /**
   * 获取指定事件的监听器数量
   *
   * @param event - 事件名称
   * @returns 监听器数量
   *
   * @example
   * ```typescript
   * const count = emitter.listenerCount('data')
   * 
   * ```
   */
  listenerCount(event: string): number {
    const eventListeners = this.listeners.get(event)
    return eventListeners ? eventListeners.size : 0
  }

  /**
   * 获取所有已注册的事件名称
   *
   * @returns 事件名称数组
   *
   * @example
   * ```typescript
   * const events = emitter.eventNames()
   * 
   * ```
   */
  eventNames(): readonly string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 检查是否有监听器
   *
   * @param event - 可选的事件名称，如果提供则检查该事件是否有监听器，否则检查是否有任何监听器
   * @returns 是否有监听器
   *
   * @example
   * ```typescript
   * // 检查特定事件是否有监听器
   * if (emitter.hasListeners('data')) {
   *   
   * }
   *
   * // 检查是否有任何监听器
   * if (emitter.hasListeners()) {
   *   
   * }
   * ```
   */
  hasListeners(event?: string): boolean {
    if (event !== undefined) {
      return this.listeners.has(event) && this.listeners.get(event)!.size > 0
    }
    return this.listeners.size > 0
  }

  /**
   * 获取指定事件的所有监听器
   *
   * @param event - 事件名称
   * @returns 监听器数组的只读副本
   *
   * @example
   * ```typescript
   * const listeners = emitter.getListeners('data')
   * 
   * ```
   */
  getListeners(event: string): readonly EventListener<T>[] {
    const eventListeners = this.listeners.get(event)
    return eventListeners ? Array.from(eventListeners) : []
  }

  /**
   * 获取事件发射器的统计信息
   *
   * @returns 统计信息对象
   *
   * @example
   * ```typescript
   * const stats = emitter.getStats()
   * 
   * ```
   */
  getStats(): { eventCount: number, listenerCount: number, events: Record<string, number> } {
    const events: Record<string, number> = {}
    let totalListeners = 0

    for (const [eventName, listeners] of this.listeners) {
      const count = listeners.size
      events[eventName] = count
      totalListeners += count
    }

    return {
      eventCount: this.listeners.size,
      listenerCount: totalListeners,
      events,
    }
  }
}
