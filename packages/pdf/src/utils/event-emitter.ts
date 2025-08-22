/**
 * 事件系统
 * 提供发布订阅模式的事件管理功能
 */

import type {
  EventListener,
  EventType,
  EventEmitter as IEventEmitter,
} from '../types'

/**
 * 事件监听器信息
 */
interface ListenerInfo {
  listener: EventListener
  once: boolean
  priority: number
}

/**
 * 事件发射器实现
 */
export class EventEmitter implements IEventEmitter {
  private listeners = new Map<EventType, ListenerInfo[]>()
  private maxListeners = 100
  private enableLogging = false

  constructor(options: { maxListeners?: number, enableLogging?: boolean } = {}) {
    this.maxListeners = options.maxListeners || 100
    this.enableLogging = options.enableLogging || false
  }

  /**
   * 添加事件监听器
   */
  on(event: EventType, listener: EventListener, priority = 0): void {
    this.addListener(event, listener, false, priority)
  }

  /**
   * 添加一次性事件监听器
   */
  once(event: EventType, listener: EventListener, priority = 0): void {
    this.addListener(event, listener, true, priority)
  }

  /**
   * 移除事件监听器
   */
  off(event: EventType, listener: EventListener): void {
    const listeners = this.listeners.get(event)
    if (!listeners)
      return

    const index = listeners.findIndex(info => info.listener === listener)
    if (index > -1) {
      listeners.splice(index, 1)
      this.log(`Removed listener for event '${event}'`)

      if (listeners.length === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event?: EventType): void {
    if (event) {
      this.listeners.delete(event)
      this.log(`Removed all listeners for event '${event}'`)
    }
    else {
      this.listeners.clear()
      this.log('Removed all listeners for all events')
    }
  }

  /**
   * 触发事件
   */
  emit<T>(event: EventType, data?: T): void {
    const listeners = this.listeners.get(event)
    if (!listeners || listeners.length === 0) {
      return
    }

    const listenersToExecute = [...listeners]

    for (const listenerInfo of listenersToExecute) {
      try {
        if (data !== undefined) {
          listenerInfo.listener(data)
        }
        else {
          listenerInfo.listener({} as any)
        }

        if (listenerInfo.once) {
          this.off(event, listenerInfo.listener)
        }
      }
      catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: EventType): number {
    const listeners = this.listeners.get(event)
    return listeners ? listeners.length : 0
  }

  /**
   * 获取所有事件类型
   */
  eventNames(): EventType[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 获取事件的所有监听器
   */
  getListeners(event: EventType): EventListener[] {
    const listeners = this.listeners.get(event)
    return listeners ? listeners.map(info => info.listener) : []
  }

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(max: number): void {
    this.maxListeners = max
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners
  }

  /**
   * 启用/禁用日志
   */
  setLogging(enabled: boolean): void {
    this.enableLogging = enabled
  }

  /**
   * 等待事件触发
   */
  waitForEvent(event: EventType, timeout?: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const listener = (...args: any[]) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
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
   * 创建事件代理
   */
  proxy(targetEmitter: IEventEmitter, events?: EventType[]): void {
    const eventsToProxy = events || this.eventNames()

    for (const event of eventsToProxy) {
      this.on(event, (...args) => {
        targetEmitter.emit(event, ...args)
      })
    }
  }

  /**
   * 销毁事件发射器
   */
  destroy(): void {
    this.removeAllListeners()
    this.log('EventEmitter destroyed')
  }

  // ============================================================================
  // 私有方法
  // ============================================================================

  /**
   * 添加监听器
   */
  private addListener(
    event: EventType,
    listener: EventListener,
    once: boolean,
    priority: number,
  ): void {
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
        `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. `
        + `${listeners.length + 1} ${event} listeners added. `
        + `Use emitter.setMaxListeners() to increase limit.`,
      )
    }

    const listenerInfo: ListenerInfo = {
      listener,
      once,
      priority,
    }

    // 按优先级插入（高优先级在前）
    let insertIndex = listeners.length
    for (let i = 0; i < listeners.length; i++) {
      const currentListener = listeners[i]
      if (currentListener && priority > currentListener.priority) {
        insertIndex = i
        break
      }
    }

    listeners.splice(insertIndex, 0, listenerInfo)

    this.log(
      `Added ${once ? 'once' : 'on'} listener for event '${event}' `
      + `with priority ${priority} (total: ${listeners.length})`,
    )
  }

  /**
   * 日志输出
   */
  private log(message: string, ...args: any[]): void {
    if (this.enableLogging) {
      console.warn(`[EventEmitter] ${message}`, ...args)
    }
  }
}

/**
 * 创建事件发射器
 */
export function createEventEmitter(options?: {
  maxListeners?: number
  enableLogging?: boolean
}): EventEmitter {
  return new EventEmitter(options)
}

/**
 * 混入事件发射器功能
 */
export function mixinEventEmitter<T extends new (...args: any[]) => any>(
  BaseClass: T,
): T & (new (...args: any[]) => IEventEmitter) {
  return class extends BaseClass implements IEventEmitter {
    private _eventEmitter = new EventEmitter()

    on(event: EventType, listener: EventListener): void {
      this._eventEmitter.on(event, listener)
    }

    once(event: EventType, listener: EventListener): void {
      this._eventEmitter.once(event, listener)
    }

    off(event: EventType, listener: EventListener): void {
      this._eventEmitter.off(event, listener)
    }

    removeAllListeners(event?: EventType): void {
      this._eventEmitter.removeAllListeners(event)
    }

    emit(event: EventType, ...args: any[]): boolean {
      this._eventEmitter.emit(event, args[0])
      return true
    }

    listenerCount(event: EventType): number {
      return this._eventEmitter.listenerCount(event)
    }

    eventNames(): EventType[] {
      return this._eventEmitter.eventNames()
    }

    getListeners(event: EventType): EventListener[] {
      return this._eventEmitter.getListeners(event)
    }

    setMaxListeners(max: number): void {
      this._eventEmitter.setMaxListeners(max)
    }

    getMaxListeners(): number {
      return this._eventEmitter.getMaxListeners()
    }

    waitForEvent(event: EventType, timeout?: number): Promise<any[]> {
      return this._eventEmitter.waitForEvent(event, timeout)
    }

    proxy(targetEmitter: IEventEmitter, events?: EventType[]): void {
      this._eventEmitter.proxy(targetEmitter, events)
    }

    destroy(): void {
      this._eventEmitter.destroy()
      if (super.destroy) {
        super.destroy()
      }
    }
  } as any
}

/**
 * 默认事件发射器实例
 */
export const defaultEventEmitter = createEventEmitter({
  maxListeners: 50,
  enableLogging: false,
})
