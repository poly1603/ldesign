import {
  ThemeEventType,
  ThemeEventListener,
  ThemeEventData,
} from '../core/types.js'

/**
 * @ldesign/theme - 事件发射器
 *
 * 提供事件发射和监听功能
 */

/**
 * 事件发射器接口
 */
interface EventEmitter {
  on: (event: ThemeEventType, listener: ThemeEventListener) => void
  off: (event: ThemeEventType, listener: ThemeEventListener) => void
  emit: (
    event: ThemeEventType,
    data: Omit<ThemeEventData, 'type' | 'timestamp'>
  ) => void
  once: (event: ThemeEventType, listener: ThemeEventListener) => void
  removeAllListeners: (event?: ThemeEventType) => void
  listenerCount: (event: ThemeEventType) => number
  listeners: (event: ThemeEventType) => ThemeEventListener[]
}
/**
 * 事件发射器实现
 */
declare class EventEmitterImpl implements EventEmitter {
  private events
  private onceEvents
  /**
   * 添加事件监听器
   */
  on(event: ThemeEventType, listener: ThemeEventListener): void
  /**
   * 移除事件监听器
   */
  off(event: ThemeEventType, listener: ThemeEventListener): void
  /**
   * 发射事件
   */
  emit(
    event: ThemeEventType,
    data: Omit<ThemeEventData, 'type' | 'timestamp'>
  ): void
  /**
   * 添加一次性事件监听器
   */
  once(event: ThemeEventType, listener: ThemeEventListener): void
  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: ThemeEventType): void
  /**
   * 获取监听器数量
   */
  listenerCount(event: ThemeEventType): number
  /**
   * 获取监听器列表
   */
  listeners(event: ThemeEventType): ThemeEventListener[]
  /**
   * 销毁事件发射器
   */
  destroy(): void
}
/**
 * 创建事件发射器实例
 */
declare function createEventEmitter(): EventEmitter
/**
 * 默认事件发射器实例
 */
declare const defaultEventEmitter: EventEmitter

export { EventEmitterImpl, createEventEmitter, defaultEventEmitter }
export type { EventEmitter }
