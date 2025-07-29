import type { IEventBus, EventHandler } from '../types'
import { createLogger } from '../utils'

/**
 * 事件总线实现
 */
export class EventBus implements IEventBus {
  private readonly events = new Map<string, Set<EventHandler>>()
  private readonly onceEvents = new Map<string, Set<EventHandler>>()
  private readonly logger = createLogger('EventBus')

  /**
   * 监听事件
   */
  on(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(handler)
    this.logger.debug(`Added listener for event: ${event}`)
  }

  /**
   * 监听一次事件
   */
  once(event: string, handler: EventHandler): void {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, new Set())
    }
    this.onceEvents.get(event)!.add(handler)
    this.logger.debug(`Added once listener for event: ${event}`)
  }

  /**
   * 取消监听事件
   */
  off(event: string, handler?: EventHandler): void {
    if (handler) {
      // 移除特定处理器
      this.events.get(event)?.delete(handler)
      this.onceEvents.get(event)?.delete(handler)
      this.logger.debug(`Removed specific listener for event: ${event}`)
    } else {
      // 移除所有处理器
      this.events.delete(event)
      this.onceEvents.delete(event)
      this.logger.debug(`Removed all listeners for event: ${event}`)
    }
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): void {
    this.logger.debug(`Emitting event: ${event}`, args)

    // 执行普通监听器
    const handlers = this.events.get(event)
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(...args)
        } catch (error) {
          this.logger.error(`Error in event handler for ${event}:`, error)
        }
      }
    }

    // 执行一次性监听器
    const onceHandlers = this.onceEvents.get(event)
    if (onceHandlers) {
      for (const handler of onceHandlers) {
        try {
          handler(...args)
        } catch (error) {
          this.logger.error(`Error in once event handler for ${event}:`, error)
        }
      }
      // 清除一次性监听器
      this.onceEvents.delete(event)
    }
  }

  /**
   * 清空所有事件监听器
   */
  clear(): void {
    this.events.clear()
    this.onceEvents.clear()
    this.logger.debug('Cleared all event listeners')
  }

  /**
   * 获取事件监听器数量
   */
  getListenerCount(event: string): number {
    const normalCount = this.events.get(event)?.size || 0
    const onceCount = this.onceEvents.get(event)?.size || 0
    return normalCount + onceCount
  }

  /**
   * 获取所有事件名称
   */
  getEventNames(): string[] {
    const names = new Set<string>()
    for (const name of this.events.keys()) {
      names.add(name)
    }
    for (const name of this.onceEvents.keys()) {
      names.add(name)
    }
    return Array.from(names)
  }
}