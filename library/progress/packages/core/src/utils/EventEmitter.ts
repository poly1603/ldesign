import { EventHandler, EventType } from '../types';

/**
 * 事件发射器类
 */
export class EventEmitter {
  private events: Map<EventType, Set<EventHandler>>;

  constructor() {
    this.events = new Map();
  }

  /**
   * 监听事件
   */
  on(event: EventType, handler: EventHandler): this {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
    return this;
  }

  /**
   * 监听一次事件
   */
  once(event: EventType, handler: EventHandler): this {
    const onceHandler: EventHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    return this.on(event, onceHandler);
  }

  /**
   * 取消监听
   */
  off(event: EventType, handler?: EventHandler): this {
    if (!handler) {
      this.events.delete(event);
      return this;
    }

    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
    return this;
  }

  /**
   * 触发事件
   */
  emit(event: EventType, ...args: any[]): this {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
    return this;
  }

  /**
   * 清除所有事件监听
   */
  removeAllListeners(): void {
    this.events.clear();
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: EventType): number {
    return this.events.get(event)?.size || 0;
  }
}


