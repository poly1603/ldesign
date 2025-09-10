/**
 * 事件管理器
 * 负责编辑器的事件系统，包括事件监听、触发和管理
 */

import type { 
  IEventManager, 
  EventType, 
  EventListener, 
  EditorEvent 
} from '../types'

/**
 * 编辑器事件实现
 */
class EditorEventImpl<T = any> implements EditorEvent<T> {
  public cancelled = false

  constructor(
    public readonly type: EventType,
    public readonly data: T,
    public readonly timestamp: number = Date.now(),
    public readonly cancelable: boolean = true
  ) {}

  /**
   * 阻止事件默认行为
   */
  preventDefault(): void {
    if (this.cancelable) {
      this.cancelled = true
    }
  }
}

/**
 * 事件管理器实现
 * 提供完整的事件系统功能，包括事件监听、触发、移除等
 */
export class EventManager implements IEventManager {
  /** 事件监听器映射表 */
  private listeners: Map<EventType, Set<EventListener>> = new Map()
  
  /** 一次性事件监听器映射表 */
  private onceListeners: Map<EventType, Set<EventListener>> = new Map()

  /**
   * 监听事件
   * @param type 事件类型
   * @param listener 事件监听器
   */
  on<T = any>(type: EventType, listener: EventListener<T>): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener as EventListener)
  }

  /**
   * 监听一次性事件
   * @param type 事件类型
   * @param listener 事件监听器
   */
  once<T = any>(type: EventType, listener: EventListener<T>): void {
    if (!this.onceListeners.has(type)) {
      this.onceListeners.set(type, new Set())
    }
    this.onceListeners.get(type)!.add(listener as EventListener)
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 事件监听器
   */
  off<T = any>(type: EventType, listener: EventListener<T>): void {
    // 从普通监听器中移除
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.delete(listener as EventListener)
      if (listeners.size === 0) {
        this.listeners.delete(type)
      }
    }

    // 从一次性监听器中移除
    const onceListeners = this.onceListeners.get(type)
    if (onceListeners) {
      onceListeners.delete(listener as EventListener)
      if (onceListeners.size === 0) {
        this.onceListeners.delete(type)
      }
    }
  }

  /**
   * 移除指定类型的所有监听器
   * @param type 事件类型
   */
  removeAllListeners(type?: EventType): void {
    if (type) {
      this.listeners.delete(type)
      this.onceListeners.delete(type)
    } else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param data 事件数据
   * @param cancelable 是否可取消
   * @returns 事件对象
   */
  emit<T = any>(type: EventType, data: T, cancelable = true): EditorEvent<T> {
    const event = new EditorEventImpl(type, data, Date.now(), cancelable)

    // 触发普通监听器
    const listeners = this.listeners.get(type)
    if (listeners) {
      // 创建监听器副本，避免在执行过程中修改原集合
      const listenersCopy = Array.from(listeners)
      for (const listener of listenersCopy) {
        try {
          listener(event)
          // 如果事件被取消，停止后续监听器的执行
          if (event.cancelled) {
            break
          }
        } catch (error) {
          console.error(`Error in event listener for ${type}:`, error)
        }
      }
    }

    // 触发一次性监听器
    const onceListeners = this.onceListeners.get(type)
    if (onceListeners && !event.cancelled) {
      // 创建监听器副本并清空原集合
      const onceListenersCopy = Array.from(onceListeners)
      this.onceListeners.delete(type)
      
      for (const listener of onceListenersCopy) {
        try {
          listener(event)
          // 如果事件被取消，停止后续监听器的执行
          if (event.cancelled) {
            break
          }
        } catch (error) {
          console.error(`Error in once event listener for ${type}:`, error)
        }
      }
    }

    return event
  }

  /**
   * 检查是否有指定类型的监听器
   * @param type 事件类型
   * @returns 是否有监听器
   */
  hasListeners(type: EventType): boolean {
    const hasNormalListeners = this.listeners.has(type) && this.listeners.get(type)!.size > 0
    const hasOnceListeners = this.onceListeners.has(type) && this.onceListeners.get(type)!.size > 0
    return hasNormalListeners || hasOnceListeners
  }

  /**
   * 获取指定类型的监听器数量
   * @param type 事件类型
   * @returns 监听器数量
   */
  getListenerCount(type: EventType): number {
    const normalCount = this.listeners.get(type)?.size || 0
    const onceCount = this.onceListeners.get(type)?.size || 0
    return normalCount + onceCount
  }

  /**
   * 获取所有事件类型
   * @returns 事件类型数组
   */
  getEventTypes(): EventType[] {
    const types = new Set<EventType>()
    
    // 添加普通监听器的事件类型
    for (const type of this.listeners.keys()) {
      types.add(type)
    }
    
    // 添加一次性监听器的事件类型
    for (const type of this.onceListeners.keys()) {
      types.add(type)
    }
    
    return Array.from(types)
  }

  /**
   * 销毁事件管理器
   * 清理所有监听器和资源
   */
  destroy(): void {
    this.listeners.clear()
    this.onceListeners.clear()
  }

  /**
   * 获取调试信息
   * @returns 调试信息对象
   */
  getDebugInfo(): {
    totalListeners: number
    totalOnceListeners: number
    eventTypes: EventType[]
    listenersByType: Record<string, number>
  } {
    const listenersByType: Record<string, number> = {}
    let totalListeners = 0
    let totalOnceListeners = 0

    // 统计普通监听器
    for (const [type, listeners] of this.listeners) {
      const count = listeners.size
      listenersByType[type] = (listenersByType[type] || 0) + count
      totalListeners += count
    }

    // 统计一次性监听器
    for (const [type, listeners] of this.onceListeners) {
      const count = listeners.size
      listenersByType[`${type}(once)`] = count
      totalOnceListeners += count
    }

    return {
      totalListeners,
      totalOnceListeners,
      eventTypes: this.getEventTypes(),
      listenersByType
    }
  }
}
