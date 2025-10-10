/**
 * 事件发射器
 * 用于编辑器内部的事件通信
 */

type EventHandler = (...args: any[]) => void

export class EventEmitter {
  private events: Map<string, Set<EventHandler>> = new Map()

  /**
   * 监听事件
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(handler)

    // 返回取消监听函数
    return () => this.off(event, handler)
  }

  /**
   * 监听一次事件
   */
  once(event: string, handler: EventHandler): void {
    const onceHandler = (...args: any[]) => {
      handler(...args)
      this.off(event, onceHandler)
    }
    this.on(event, onceHandler)
  }

  /**
   * 取消监听
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.events.delete(event)
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error)
        }
      })
    }
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.events.clear()
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0
  }

  /**
   * 获取所有事件名
   */
  eventNames(): string[] {
    return Array.from(this.events.keys())
  }
}
