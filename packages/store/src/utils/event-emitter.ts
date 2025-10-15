/**
 * 事件发射器
 * 提供简单的事件订阅和触发机制
 */
export class EventEmitter {
  private events: Record<string, Function[]> = {}

  /**
   * 订阅事件
   */
  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args))
    }
  }

  /**
   * 取消订阅事件
   */
  off(event: string, listener: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener)
    }
  }

  /**
   * 订阅一次性事件
   */
  once(event: string, listener: Function): void {
    const onceWrapper = (...args: any[]) => {
      listener(...args)
      this.off(event, onceWrapper)
    }
    this.on(event, onceWrapper)
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event]
    } else {
      this.events = {}
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    return this.events[event]?.length || 0
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Object.keys(this.events)
  }
}
