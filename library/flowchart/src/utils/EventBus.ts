/**
 * 事件总线 - 用于组件间通信
 */

type EventHandler = (...args: any[]) => void;

export class EventBus {
  private events: Map<string, Set<EventHandler>> = new Map();

  /**
   * 注册事件监听器
   */
  on(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  /**
   * 注册一次性事件监听器
   */
  once(event: string, handler: EventHandler): void {
    const wrappedHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, handler?: EventHandler): void {
    if (!handler) {
      this.events.delete(event);
      return;
    }

    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * 清空所有事件监听器
   */
  clear(): void {
    this.events.clear();
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}


