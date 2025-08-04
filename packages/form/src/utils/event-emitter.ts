/**
 * 事件发射器类
 */

export type EventListener<T = any> = (data: T) => void

export class EventEmitter<T extends Record<string, any> = Record<string, any>> {
  private listeners: Map<keyof T, Set<EventListener<T[keyof T]>>> = new Map()
  private onceListeners: Map<keyof T, Set<EventListener<T[keyof T]>>> = new Map()
  private maxListeners: number = 10

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(max: number): this {
    this.maxListeners = max
    return this
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners
  }

  /**
   * 添加事件监听器
   */
  on<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const listeners = this.listeners.get(event)!
    
    // 检查监听器数量限制
    if (listeners.size >= this.maxListeners) {
      console.warn(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${listeners.size + 1} ${String(event)} listeners added.`)
    }

    listeners.add(listener)
    return this
  }

  /**
   * 添加一次性事件监听器
   */
  once<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }

    this.onceListeners.get(event)!.add(listener)
    return this
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof T>(event: K, listener?: EventListener<T[K]>): this {
    if (listener) {
      // 移除特定监听器
      this.listeners.get(event)?.delete(listener)
      this.onceListeners.get(event)?.delete(listener)
    } else {
      // 移除所有监听器
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    }
    return this
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners<K extends keyof T>(event?: K): this {
    if (event) {
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    } else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
    return this
  }

  /**
   * 触发事件
   */
  emit<K extends keyof T>(event: K, data: T[K]): boolean {
    let hasListeners = false

    // 触发普通监听器
    const listeners = this.listeners.get(event)
    if (listeners && listeners.size > 0) {
      hasListeners = true
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in event listener for '${String(event)}':`, error)
        }
      })
    }

    // 触发一次性监听器
    const onceListeners = this.onceListeners.get(event)
    if (onceListeners && onceListeners.size > 0) {
      hasListeners = true
      onceListeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in once event listener for '${String(event)}':`, error)
        }
      })
      // 清除一次性监听器
      this.onceListeners.delete(event)
    }

    return hasListeners
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount<K extends keyof T>(event: K): number {
    const regularCount = this.listeners.get(event)?.size || 0
    const onceCount = this.onceListeners.get(event)?.size || 0
    return regularCount + onceCount
  }

  /**
   * 获取事件的所有监听器
   */
  listeners<K extends keyof T>(event: K): EventListener<T[K]>[] {
    const regularListeners = Array.from(this.listeners.get(event) || [])
    const onceListeners = Array.from(this.onceListeners.get(event) || [])
    return [...regularListeners, ...onceListeners]
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): (keyof T)[] {
    const regularEvents = Array.from(this.listeners.keys())
    const onceEvents = Array.from(this.onceListeners.keys())
    return Array.from(new Set([...regularEvents, ...onceEvents]))
  }

  /**
   * 检查是否有指定事件的监听器
   */
  hasListeners<K extends keyof T>(event: K): boolean {
    return this.listenerCount(event) > 0
  }

  /**
   * 添加监听器（别名）
   */
  addListener<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
    return this.on(event, listener)
  }

  /**
   * 移除监听器（别名）
   */
  removeListener<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
    return this.off(event, listener)
  }

  /**
   * 在指定监听器之前添加监听器
   */
  prependListener<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const listeners = this.listeners.get(event)!
    const newListeners = new Set([listener, ...Array.from(listeners)])
    this.listeners.set(event, newListeners)
    return this
  }

  /**
   * 在指定监听器之前添加一次性监听器
   */
  prependOnceListener<K extends keyof T>(event: K, listener: EventListener<T[K]>): this {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }

    const listeners = this.onceListeners.get(event)!
    const newListeners = new Set([listener, ...Array.from(listeners)])
    this.onceListeners.set(event, newListeners)
    return this
  }

  /**
   * 获取原始监听器（用于调试）
   */
  rawListeners<K extends keyof T>(event: K): EventListener<T[K]>[] {
    return this.listeners(event)
  }

  /**
   * 销毁事件发射器
   */
  destroy(): void {
    this.removeAllListeners()
  }
}

/**
 * 创建事件发射器实例
 */
export function createEventEmitter<T extends Record<string, any> = Record<string, any>>(): EventEmitter<T> {
  return new EventEmitter<T>()
}

/**
 * 事件发射器装饰器
 */
export function eventEmitter<T extends Record<string, any> = Record<string, any>>(target: any): void {
  const emitter = new EventEmitter<T>()
  
  // 将事件发射器方法添加到目标对象
  Object.getOwnPropertyNames(EventEmitter.prototype).forEach(name => {
    if (name !== 'constructor') {
      target[name] = emitter[name as keyof EventEmitter].bind(emitter)
    }
  })
}

/**
 * 混入事件发射器功能
 */
export function mixinEventEmitter<T extends Record<string, any> = Record<string, any>>(
  target: any
): asserts target is EventEmitter<T> {
  const emitter = new EventEmitter<T>()
  
  Object.getOwnPropertyNames(EventEmitter.prototype).forEach(name => {
    if (name !== 'constructor' && typeof emitter[name as keyof EventEmitter] === 'function') {
      target[name] = emitter[name as keyof EventEmitter].bind(emitter)
    }
  })
}