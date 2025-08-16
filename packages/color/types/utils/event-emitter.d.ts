import {
  EventEmitter,
  ThemeEventType,
  ThemeEventListener,
} from '../core/types.js'

/**
 * 事件发射器实现
 */

/**
 * 事件发射器实现类
 */
declare class EventEmitterImpl implements EventEmitter {
  private listeners
  /**
   * 添加事件监听器
   */
  on<T = unknown>(event: ThemeEventType, listener: ThemeEventListener<T>): void
  /**
   * 移除事件监听器
   */
  off<T = unknown>(event: ThemeEventType, listener: ThemeEventListener<T>): void
  /**
   * 触发事件
   */
  emit<T = unknown>(event: ThemeEventType, data?: T): void
  /**
   * 添加一次性事件监听器
   */
  once<T = unknown>(
    event: ThemeEventType,
    listener: ThemeEventListener<T>
  ): void
  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: ThemeEventType): void
  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: ThemeEventType): number
  /**
   * 获取所有事件类型
   */
  eventNames(): ThemeEventType[]
}
/**
 * 创建事件发射器实例
 */
declare function createEventEmitter(): EventEmitter

export { EventEmitterImpl, createEventEmitter }
