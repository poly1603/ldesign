/**
 * 事件监听器函数类型
 */
export type EventListener = (...args: any[]) => void

/**
 * 事件发射器
 * 提供简单的事件订阅和触发机制
 */
export class EventEmitter {
  private events: Record<string, EventListener[]> = {}
  private maxListeners = 100 // 默认最大监听器数量
  private eventCount = 0 // 跟踪事件数量

  /**
   * 订阅事件
   */
  on(event: string, listener: EventListener): void {
    if (!this.events[event]) {
      this.events[event] = []
      this.eventCount++
    }
    
    // 检查监听器数量限制
    if (this.events[event].length >= this.maxListeners) {
      console.warn(`Warning: Event '${event}' has ${this.events[event].length} listeners. Possible memory leak detected.`)
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
  off(event: string, listener: EventListener): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener)
      
      // 如果没有监听器了，删除事件键
      if (this.events[event].length === 0) {
        delete this.events[event]
        this.eventCount--
      }
    }
  }

  /**
   * 订阅一次性事件
   */
  once(event: string, listener: EventListener): void {
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
      this.eventCount--
    } else {
      this.events = {}
      this.eventCount = 0
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
  
  /**
   * 设置最大监听器数量
   */
  setMaxListeners(max: number): void {
    this.maxListeners = max
  }
  
  /**
   * 获取事件统计信息
   */
  getStats(): { eventCount: number; totalListeners: number } {
    let totalListeners = 0
    for (const event in this.events) {
      totalListeners += this.events[event].length
    }
    return { eventCount: this.eventCount, totalListeners }
  }
  
  /**
   * 销毁事件发射器
   */
  dispose(): void {
    this.removeAllListeners()
  }
}
