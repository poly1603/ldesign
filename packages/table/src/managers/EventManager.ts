/**
 * 事件管理器
 * 
 * 提供完整的事件监听、触发和管理功能
 * 支持事件优先级、一次性监听器等高级特性
 * 确保类型安全的事件处理
 */

import type {
  IEventManager,
  EventListener,
  EventListenerConfig
} from '../types/events'

/**
 * 内部事件监听器信息
 */
interface InternalEventListener<T = any> {
  /** 监听器函数 */
  listener: EventListener<T>
  /** 是否只执行一次 */
  once: boolean
  /** 优先级 */
  priority: number
  /** 监听器ID */
  id: string
}

/**
 * 事件管理器实现类
 * 
 * 功能特性：
 * - 支持事件监听器的添加、移除和触发
 * - 支持一次性监听器
 * - 支持监听器优先级排序
 * - 提供完整的类型安全支持
 * - 支持事件监听器统计和管理
 */
export class EventManager implements IEventManager {
  /** 事件监听器映射表 */
  private listeners: Map<string, InternalEventListener[]> = new Map()

  /** 监听器ID计数器 */
  private listenerIdCounter = 0

  /** 是否已销毁 */
  private destroyed: boolean = false

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param config 监听器配置
   */
  on<T = any>(event: string, listener: EventListener<T>, config: EventListenerConfig = {}): void {
    if (this.destroyed) {
      return // 销毁后不允许添加新监听器
    }

    if (!event || typeof listener !== 'function') {
      throw new Error('事件名称和监听器函数不能为空')
    }

    const { once = false, priority = 0 } = config
    const id = `listener_${++this.listenerIdCounter}`

    const internalListener: InternalEventListener<T> = {
      listener,
      once,
      priority,
      id
    }

    // 获取或创建事件监听器数组
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    const eventListeners = this.listeners.get(event)!
    eventListeners.push(internalListener)

    // 按优先级排序（优先级高的先执行）
    eventListeners.sort((a, b) => b.priority - a.priority)
  }

  /**
   * 添加一次性事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  once<T = any>(event: string, listener: EventListener<T>): void {
    this.on(event, listener, { once: true })
  }

  /**
   * 移除事件监听器
   * @param event 事件名称，不传则移除所有事件的所有监听器
   * @param listener 监听器函数，不传则移除该事件的所有监听器
   */
  off<T = any>(event?: string, listener?: EventListener<T>): void {
    if (!event) {
      // 移除所有事件的所有监听器
      this.listeners.clear()
      return
    }

    if (!this.listeners.has(event)) {
      return
    }

    const eventListeners = this.listeners.get(event)!

    if (!listener) {
      // 移除该事件的所有监听器
      this.listeners.delete(event)
      return
    }

    // 移除指定的监听器
    const index = eventListeners.findIndex(item => item.listener === listener)
    if (index !== -1) {
      eventListeners.splice(index, 1)

      // 如果没有监听器了，删除该事件
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
  emit<T = any>(event: string, data?: T): void {
    if (!this.listeners.has(event)) {
      return
    }

    const eventListeners = this.listeners.get(event)!
    const listenersToRemove: string[] = []

    // 执行所有监听器
    for (const item of eventListeners) {
      try {
        item.listener(data)

        // 如果是一次性监听器，标记为待移除
        if (item.once) {
          listenersToRemove.push(item.id)
        }
      } catch (error) {
        console.error(`执行事件监听器时发生错误 [${event}]:`, error)

        // 触发错误事件
        if (event !== 'error') {
          this.emit('error', {
            error,
            event,
            data
          })
        }
      }
    }

    // 移除一次性监听器
    if (listenersToRemove.length > 0) {
      const remainingListeners = eventListeners.filter(
        item => !listenersToRemove.includes(item.id)
      )

      if (remainingListeners.length === 0) {
        this.listeners.delete(event)
      } else {
        this.listeners.set(event, remainingListeners)
      }
    }
  }

  /**
   * 触发事件（带传播控制）
   * @param event 事件名称
   * @param data 事件数据
   */
  emitWithContext<T = any>(event: string, data?: T): { defaultPrevented: boolean; propagationStopped: boolean } {
    const result = {
      defaultPrevented: false,
      propagationStopped: false
    }

    if (!this.listeners.has(event)) {
      return result
    }

    const eventListeners = this.listeners.get(event)!
    const listenersToRemove: string[] = []

    // 创建事件上下文
    const context = {
      preventDefault: () => {
        result.defaultPrevented = true
      },
      stopPropagation: () => {
        result.propagationStopped = true
      }
    }

    // 执行所有监听器
    for (const item of eventListeners) {
      try {
        item.listener(data, context)

        // 如果是一次性监听器，标记为待移除
        if (item.once) {
          listenersToRemove.push(item.id)
        }

        // 如果停止传播，跳出循环
        if (result.propagationStopped) {
          break
        }
      } catch (error) {
        console.error(`执行事件监听器时发生错误 [${event}]:`, error)

        // 触发错误事件
        if (event !== 'error') {
          this.emit('error', {
            error,
            event,
            data
          })
        }
      }
    }

    // 移除一次性监听器
    if (listenersToRemove.length > 0) {
      const remainingListeners = eventListeners.filter(
        item => !listenersToRemove.includes(item.id)
      )

      if (remainingListeners.length === 0) {
        this.listeners.delete(event)
      } else {
        this.listeners.set(event, remainingListeners)
      }
    }

    return result
  }

  /**
   * 清除所有事件监听器
   */
  clear(): void {
    this.listeners.clear()
    this.listenerIdCounter = 0
  }

  /**
   * 获取事件监听器数量
   * @param event 事件名称
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0
  }

  /**
   * 获取事件监听器数量（别名）
   * @param event 事件名称
   */
  getListenerCount(event: string): number {
    return this.listenerCount(event)
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 获取所有事件名称（别名）
   */
  getEventNames(): string[] {
    return this.eventNames()
  }

  /**
   * 检查是否有指定事件的监听器
   * @param event 事件名称
   */
  hasListeners(event: string): boolean {
    return this.listeners.has(event) && this.listeners.get(event)!.length > 0
  }

  /**
   * 获取所有监听器总数
   */
  getTotalListenerCount(): number {
    let count = 0
    for (const listeners of this.listeners.values()) {
      count += listeners.length
    }
    return count
  }

  /**
   * 销毁事件管理器
   * 清理所有资源
   */
  destroy(): void {
    this.clear()
    this.destroyed = true
  }
}
