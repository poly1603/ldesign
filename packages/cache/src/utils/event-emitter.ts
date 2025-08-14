/**
 * 事件发射器
 */
export class EventEmitter<T = any> {
  private listeners: Map<string, Set<(event: T) => void>> = new Map()

  /**
   * 添加事件监听器
   */
  on(event: string, listener: (event: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: (event: T) => void): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener)
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once(event: string, listener: (event: T) => void): void {
    const onceListener = (eventData: T) => {
      listener(eventData)
      this.off(event, onceListener)
    }
    this.on(event, onceListener)
  }

  /**
   * 触发事件
   */
  emit(event: string, data: T): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      }
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    const eventListeners = this.listeners.get(event)
    return eventListeners ? eventListeners.size : 0
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 检查是否有监听器
   */
  hasListeners(event?: string): boolean {
    if (event) {
      return this.listeners.has(event) && this.listeners.get(event)!.size > 0
    }
    return this.listeners.size > 0
  }
}
