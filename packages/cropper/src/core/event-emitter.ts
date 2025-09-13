/**
 * @file 事件发射器
 * @description 提供事件监听、触发和管理功能
 */


/**
 * 事件发射器类
 * 提供事件的注册、触发、移除等功能
 */
export class EventEmitter {
  /** 事件监听器映射 */
  private listeners: Map<string, Set<(e: any) => void>> = new Map()

  /** 一次性事件监听器映射 */
  private onceListeners: Map<string, Set<(e: any) => void>> = new Map()

  /** 最大监听器数量 */
  private maxListeners = 100

  /** 是否启用调试模式 */
  private debug = false

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: { maxListeners?: number; debug?: boolean } = {}) {
    this.maxListeners = options.maxListeners ?? 100
    this.debug = options.debug ?? false
  }

  /**
   * 添加事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   * @returns 当前实例，支持链式调用
   */
  on(event: string, listener: (e: any) => void): this {
    this.validateListener(listener)

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const eventListeners = this.listeners.get(event)!

    // 检查监听器数量限制
    if (eventListeners.size >= this.maxListeners) {
      console.warn(`Maximum listeners (${this.maxListeners}) exceeded for event: ${event}`)
    }

    eventListeners.add(listener)

    if (this.debug) {
      console.log(`Event listener added for: ${event}`)
    }

    return this
  }

  /**
   * 添加一次性事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   * @returns 当前实例，支持链式调用
   */
  once(event: string, listener: (e: any) => void): this {
    this.validateListener(listener)

    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }

    this.onceListeners.get(event)!.add(listener)

    if (this.debug) {
      console.log(`One-time event listener added for: ${event}`)
    }

    return this
  }

  /**
   * 移除事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   * @returns 当前实例，支持链式调用
   */
  off(event: string, listener?: (e: any) => void): this {
    if (!listener) {
      // 移除所有监听器
      this.listeners.delete(event)
      this.onceListeners.delete(event)

      if (this.debug) {
        console.log(`All listeners removed for event: ${event}`)
      }

      return this
    }

    this.validateListener(listener)

    // 移除普通监听器
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener)
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }
    }

    // 移除一次性监听器
    const onceEventListeners = this.onceListeners.get(event)
    if (onceEventListeners) {
      onceEventListeners.delete(listener)
      if (onceEventListeners.size === 0) {
        this.onceListeners.delete(event)
      }
    }

    if (this.debug) {
      console.log(`Event listener removed for: ${event}`)
    }

    return this
  }

  /**
   * 触发事件
   * @param event 事件类型
   * @param data 事件数据
   * @returns 是否有监听器处理了该事件
   */
  emit(event: string, data?: any): boolean {
    const eventData: any = {
      type: event,
      ...data,
    }

    let hasListeners = false

    // 触发普通监听器
    const eventListeners = this.listeners.get(event)
    if (eventListeners && eventListeners.size > 0) {
      hasListeners = true

      // 创建监听器副本，避免在执行过程中修改原集合
      const listenersArray = Array.from(eventListeners)

      for (const listener of listenersArray) {
        try {
          listener(eventData)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)

          // 触发错误事件
          if (event !== 'imageError') {
            this.emit('imageError', { error })
          }
        }
      }
    }

    // 触发一次性监听器
    const onceEventListeners = this.onceListeners.get(event)
    if (onceEventListeners && onceEventListeners.size > 0) {
      hasListeners = true

      // 创建监听器副本
      const onceListenersArray = Array.from(onceEventListeners)

      // 清空一次性监听器
      this.onceListeners.delete(event)

      for (const listener of onceListenersArray) {
        try {
          listener(eventData)
        } catch (error) {
          console.error(`Error in once event listener for ${event}:`, error)

          // 触发错误事件
          if (event !== 'imageError') {
            this.emit('imageError', { error })
          }
        }
      }
    }

    if (this.debug && hasListeners) {
      console.log(`Event emitted: ${event}`, eventData)
    }

    return hasListeners
  }

  /**
   * 获取事件的监听器数量
   * @param event 事件类型
   * @returns 监听器数量
   */
  listenerCount(event: CropperEventType): number {
    const normalCount = this.listeners.get(event)?.size ?? 0
    const onceCount = this.onceListeners.get(event)?.size ?? 0
    return normalCount + onceCount
  }

  /**
   * 获取所有事件类型
   * @returns 事件类型数组
   */
  eventNames(): CropperEventType[] {
    const normalEvents = Array.from(this.listeners.keys())
    const onceEvents = Array.from(this.onceListeners.keys())
    return Array.from(new Set([...normalEvents, ...onceEvents]))
  }

  /**
   * 获取指定事件的所有监听器
   * @param event 事件类型
   * @returns 监听器数组
   */
  getListeners(event: CropperEventType): CropperEventListener[] {
    const normalListeners = Array.from(this.listeners.get(event) ?? [])
    const onceListeners = Array.from(this.onceListeners.get(event) ?? [])
    return [...normalListeners, ...onceListeners]
  }

  /**
   * 移除所有监听器
   * @returns 当前实例，支持链式调用
   */
  removeAllListeners(): this {
    this.listeners.clear()
    this.onceListeners.clear()

    if (this.debug) {
      console.log('All event listeners removed')
    }

    return this
  }

  /**
   * 设置最大监听器数量
   * @param n 最大数量
   * @returns 当前实例，支持链式调用
   */
  setMaxListeners(n: number): this {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('Max listeners must be a non-negative integer')
    }

    this.maxListeners = n
    return this
  }

  /**
   * 获取最大监听器数量
   * @returns 最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners
  }

  /**
   * 启用或禁用调试模式
   * @param enabled 是否启用
   * @returns 当前实例，支持链式调用
   */
  setDebug(enabled: boolean): this {
    this.debug = enabled
    return this
  }

  /**
   * 验证监听器函数
   * @param listener 监听器函数
   */
  private validateListener(listener: CropperEventListener): void {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function')
    }
  }

  /**
   * 销毁事件发射器
   * 清理所有监听器和资源
   */
  destroy(): void {
    this.removeAllListeners()

    if (this.debug) {
      console.log('EventEmitter destroyed')
    }
  }
}
