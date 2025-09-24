/**
 * 事件发射器
 * 
 * 提供框架无关的事件系统实现
 * 支持事件的注册、触发、移除等功能
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

/**
 * 事件监听器函数类型
 */
export type EventListener = (...args: any[]) => void

/**
 * 事件监听器信息
 */
interface ListenerInfo {
  listener: EventListener
  once: boolean
}

/**
 * 事件发射器类
 * 
 * 提供完整的事件系统功能，包括：
 * - 事件注册和移除
 * - 事件触发
 * - 一次性事件监听
 * - 事件监听器管理
 */
export class EventEmitter {
  /** 事件监听器映射 */
  protected listeners: Map<string, ListenerInfo[]> = new Map()

  /** 最大监听器数量 */
  private maxListeners = 100

  /** 是否已销毁 */
  protected destroyed = false

  /**
   * 添加事件监听器
   * 
   * @param event 事件名称
   * @param listener 监听器函数
   * @returns 返回自身，支持链式调用
   */
  on(event: string, listener: EventListener): this {
    this.checkDestroyed()
    this.addListener(event, listener, false)
    return this
  }

  /**
   * 添加一次性事件监听器
   * 
   * @param event 事件名称
   * @param listener 监听器函数
   * @returns 返回自身，支持链式调用
   */
  once(event: string, listener: EventListener): this {
    this.checkDestroyed()
    this.addListener(event, listener, true)
    return this
  }

  /**
   * 移除事件监听器
   * 
   * @param event 事件名称
   * @param listener 监听器函数
   * @returns 返回自身，支持链式调用
   */
  off(event: string, listener: EventListener): this {
    this.checkDestroyed()

    const listeners = this.listeners.get(event)
    if (!listeners) return this

    const index = listeners.findIndex(info => info.listener === listener)
    if (index !== -1) {
      listeners.splice(index, 1)

      // 如果没有监听器了，删除事件
      if (listeners.length === 0) {
        this.listeners.delete(event)
      }
    }

    return this
  }

  /**
   * 移除指定事件的所有监听器
   * 
   * @param event 事件名称
   * @returns 返回自身，支持链式调用
   */
  removeAllListeners(event?: string): this {
    this.checkDestroyed()

    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }

    return this
  }

  /**
   * 触发事件
   * 
   * @param event 事件名称
   * @param args 事件参数
   * @returns 是否有监听器处理了该事件
   */
  emit(event: string, ...args: any[]): boolean {
    this.checkDestroyed()

    const listeners = this.listeners.get(event)
    if (!listeners || listeners.length === 0) {
      return false
    }

    // 复制监听器数组，避免在执行过程中被修改
    const listenersToCall = [...listeners]

    // 移除一次性监听器
    const onceListeners = listenersToCall.filter(info => info.once)
    if (onceListeners.length > 0) {
      const remainingListeners = listeners.filter(info => !info.once)
      if (remainingListeners.length === 0) {
        this.listeners.delete(event)
      } else {
        this.listeners.set(event, remainingListeners)
      }
    }

    // 执行监听器
    for (const { listener } of listenersToCall) {
      try {
        listener.apply(this, args)
      } catch (error) {
        // 监听器执行错误不应该影响其他监听器
        console.error(`Error in event listener for "${event}":`, error)
      }
    }

    return true
  }

  /**
   * 获取指定事件的监听器数量
   * 
   * @param event 事件名称
   * @returns 监听器数量
   */
  listenerCount(event: string): number {
    const listeners = this.listeners.get(event)
    return listeners ? listeners.length : 0
  }

  /**
   * 获取指定事件的所有监听器
   *
   * @param event 事件名称
   * @returns 监听器函数数组
   */
  getListeners(event: string): EventListener[] {
    const listenerInfos = this.listeners.get(event)
    return listenerInfos ? listenerInfos.map(info => info.listener) : []
  }

  /**
   * 获取所有事件名称
   * 
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 设置最大监听器数量
   * 
   * @param n 最大数量
   * @returns 返回自身，支持链式调用
   */
  setMaxListeners(n: number): this {
    if (n < 0 || !Number.isInteger(n)) {
      throw new TypeError('Max listeners must be a non-negative integer')
    }
    this.maxListeners = n
    return this
  }

  /**
   * 获取最大监听器数量
   * 
   * @returns 最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners
  }

  /**
   * 销毁事件发射器
   */
  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.listeners.clear()
  }

  /**
   * 添加监听器的内部实现
   * 
   * @param event 事件名称
   * @param listener 监听器函数
   * @param once 是否为一次性监听器
   */
  private addListener(event: string, listener: EventListener, once: boolean): void {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function')
    }

    let listeners = this.listeners.get(event)
    if (!listeners) {
      listeners = []
      this.listeners.set(event, listeners)
    }

    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(
        `Possible EventEmitter memory leak detected. ${listeners.length + 1} "${event}" listeners added. ` +
        `Use setMaxListeners() to increase limit.`
      )
    }

    listeners.push({ listener, once })
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('EventEmitter has been destroyed')
    }
  }
}
