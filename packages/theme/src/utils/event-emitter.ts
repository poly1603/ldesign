/**
 * @ldesign/theme - 事件发射器
 *
 * 提供事件发射和监听功能
 */

import type {
  ThemeEventType,
  ThemeEventListener,
  ThemeEventData,
} from '../core/types'

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  on(event: ThemeEventType, listener: ThemeEventListener): void
  off(event: ThemeEventType, listener: ThemeEventListener): void
  emit(
    event: ThemeEventType,
    data: Omit<ThemeEventData, 'type' | 'timestamp'>
  ): void
  once(event: ThemeEventType, listener: ThemeEventListener): void
  removeAllListeners(event?: ThemeEventType): void
  listenerCount(event: ThemeEventType): number
  listeners(event: ThemeEventType): ThemeEventListener[]
  destroy(): void
}

/**
 * 事件发射器实现
 */
export class EventEmitterImpl implements EventEmitter {
  private events = new Map<ThemeEventType, Set<ThemeEventListener>>()
  private onceEvents = new Map<ThemeEventType, Set<ThemeEventListener>>()

  /**
   * 添加事件监听器
   */
  on(event: ThemeEventType, listener: ThemeEventListener): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: ThemeEventType, listener: ThemeEventListener): void {
    const listeners = this.events.get(event)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.events.delete(event)
      }
    }

    // 同时移除一次性监听器
    const onceListeners = this.onceEvents.get(event)
    if (onceListeners) {
      onceListeners.delete(listener)
      if (onceListeners.size === 0) {
        this.onceEvents.delete(event)
      }
    }
  }

  /**
   * 发射事件
   */
  emit(
    event: ThemeEventType,
    data: Omit<ThemeEventData, 'type' | 'timestamp'>
  ): void {
    const eventData: ThemeEventData = {
      type: event,
      timestamp: Date.now(),
      ...data,
    }

    // 触发普通监听器
    const listeners = this.events.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(eventData)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }

    // 触发一次性监听器
    const onceListeners = this.onceEvents.get(event)
    if (onceListeners) {
      const listenersArray = Array.from(onceListeners)
      onceListeners.clear()
      this.onceEvents.delete(event)

      listenersArray.forEach(listener => {
        try {
          listener(eventData)
        } catch (error) {
          console.error(`Error in once event listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once(event: ThemeEventType, listener: ThemeEventListener): void {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set())
    }
    this.onceEvents.get(event)!.add(listener)
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: ThemeEventType): void {
    if (event) {
      this.events.delete(event)
      this.onceEvents.delete(event)
    } else {
      this.events.clear()
      this.onceEvents.clear()
    }
  }

  /**
   * 获取监听器数量
   */
  listenerCount(event: ThemeEventType): number {
    const listeners = this.events.get(event)
    const onceListeners = this.onceEvents.get(event)
    return (listeners?.size || 0) + (onceListeners?.size || 0)
  }

  /**
   * 获取监听器列表
   */
  listeners(event: ThemeEventType): ThemeEventListener[] {
    const listeners = this.events.get(event)
    const onceListeners = this.onceEvents.get(event)
    return [
      ...(listeners ? Array.from(listeners) : []),
      ...(onceListeners ? Array.from(onceListeners) : []),
    ]
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
export function createEventEmitter(): EventEmitter {
  return new EventEmitterImpl()
}

/**
 * 默认事件发射器实例
 */
export const defaultEventEmitter = createEventEmitter()
