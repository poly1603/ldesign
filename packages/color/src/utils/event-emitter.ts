/**
 * 事件发射器实现
 */

import type {
  EventEmitter,
  ThemeEventListener,
  ThemeEventType,
} from '../core/types'

/**
 * 事件发射器实现类
 */
export class EventEmitterImpl implements EventEmitter {
  private listeners: Map<ThemeEventType, Set<ThemeEventListener>> = new Map()

  /**
   * 添加事件监听器
   */
  on<T = unknown>(
    event: ThemeEventType,
    listener: ThemeEventListener<T>,
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as ThemeEventListener)
  }

  /**
   * 移除事件监听器
   */
  off<T = unknown>(
    event: ThemeEventType,
    listener: ThemeEventListener<T>,
  ): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener as ThemeEventListener)
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * 触发事件
   */
  emit<T = unknown>(event: ThemeEventType, data?: T): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data)
        }
        catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once<T = unknown>(
    event: ThemeEventType,
    listener: ThemeEventListener<T>,
  ): void {
    const onceListener = (data: T) => {
      listener(data)
      this.off(event, onceListener)
    }
    this.on(event, onceListener)
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: ThemeEventType): void {
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
  listenerCount(event: ThemeEventType): number {
    const eventListeners = this.listeners.get(event)
    return eventListeners ? eventListeners.size : 0
  }

  /**
   * 获取所有事件类型
   */
  eventNames(): ThemeEventType[] {
    return Array.from(this.listeners.keys())
  }
}

/**
 * 创建事件发射器实例
 */
export function createEventEmitter(): EventEmitter {
  return new EventEmitterImpl()
}
