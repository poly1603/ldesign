/**
 * 事件发射器
 */

type EventHandler<T = any> = (data: T) => void;

export class EventEmitter<Events extends Record<string, any>> {
  private _events: Map<keyof Events, Set<EventHandler>> = new Map();

  /**
   * 监听事件
   */
  on<K extends keyof Events>(event: K, handler: Events[K]): void {
    if (!this._events.has(event)) {
      this._events.set(event, new Set());
    }
    this._events.get(event)!.add(handler);
  }

  /**
   * 取消监听
   */
  off<K extends keyof Events>(event: K, handler: Events[K]): void {
    const handlers = this._events.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 监听一次
   */
  once<K extends keyof Events>(event: K, handler: Events[K]): void {
    const onceHandler = ((...args: any[]) => {
      handler(...args);
      this.off(event, onceHandler as any);
    }) as Events[K];

    this.on(event, onceHandler);
  }

  /**
   * 触发事件
   */
  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    const handlers = this._events.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`事件处理器错误 [${String(event)}]:`, error);
        }
      });
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: keyof Events): void {
    if (event) {
      this._events.delete(event);
    } else {
      this._events.clear();
    }
  }

  /**
   * 获取监听器数量
   */
  listenerCount(event: keyof Events): number {
    return this._events.get(event)?.size || 0;
  }
}
