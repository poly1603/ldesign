/**
 * 事件发射器
 * 用于实现观察者模式，支持事件的订阅和发布
 */
export class EventEmitter<T extends Record<string, any>> {
  private events: Map<keyof T, Set<Function>> = new Map()

  /**
   * 订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  on<K extends keyof T>(event: K, handler: T[K]): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(handler)
  }

  /**
   * 取消订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  off<K extends keyof T>(event: K, handler: T[K]): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.events.delete(event)
      }
    }
  }

  /**
   * 订阅一次性事件
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  once<K extends keyof T>(event: K, handler: T[K]): void {
    const onceHandler = ((...args: any[]) => {
      handler(...args)
      this.off(event, onceHandler as T[K])
    }) as T[K]
    this.on(event, onceHandler)
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   */
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in event handler for "${String(event)}":`, error)
        }
      })
    }
  }

  /**
   * 移除所有事件监听器
   * @param event 可选的事件名称，如果提供则只移除该事件的监听器
   */
  removeAllListeners(event?: keyof T): void {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }

  /**
   * 获取事件监听器数量
   * @param event 事件名称
   */
  listenerCount(event: keyof T): number {
    return this.events.get(event)?.size || 0
  }
}
