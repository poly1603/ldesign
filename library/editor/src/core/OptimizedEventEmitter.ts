/**
 * 优化的事件发射器
 * 减少内存占用，提高性能
 */

type EventHandler = (...args: any[]) => void

interface EventRegistration {
  handler: EventHandler
  once: boolean
  priority: number
}

/**
 * 优化的事件发射器类
 */
export class OptimizedEventEmitter {
  private events: Map<string, EventRegistration[]> = new Map()
  private maxListeners: number = 100
  private listenerCount: number = 0
  
  /**
   * 监听事件
   */
  on(event: string, handler: EventHandler, priority: number = 0): this {
    this.checkMaxListeners()
    
    const registrations = this.events.get(event) || []
    registrations.push({ handler, once: false, priority })
    
    // 按优先级排序
    registrations.sort((a, b) => b.priority - a.priority)
    
    this.events.set(event, registrations)
    this.listenerCount++
    
    return this
  }
  
  /**
   * 监听一次性事件
   */
  once(event: string, handler: EventHandler, priority: number = 0): this {
    this.checkMaxListeners()
    
    const registrations = this.events.get(event) || []
    registrations.push({ handler, once: true, priority })
    
    // 按优先级排序
    registrations.sort((a, b) => b.priority - a.priority)
    
    this.events.set(event, registrations)
    this.listenerCount++
    
    return this
  }
  
  /**
   * 取消监听事件
   */
  off(event: string, handler: EventHandler): this {
    const registrations = this.events.get(event)
    
    if (!registrations) {
      return this
    }
    
    const index = registrations.findIndex(r => r.handler === handler)
    
    if (index !== -1) {
      registrations.splice(index, 1)
      this.listenerCount--
      
      if (registrations.length === 0) {
        this.events.delete(event)
      }
    }
    
    return this
  }
  
  /**
   * 发射事件
   */
  emit(event: string, ...args: any[]): boolean {
    const registrations = this.events.get(event)
    
    if (!registrations || registrations.length === 0) {
      return false
    }
    
    // 复制数组，防止在处理过程中修改
    const handlers = [...registrations]
    
    for (const registration of handlers) {
      try {
        registration.handler(...args)
        
        // 如果是一次性监听器，移除它
        if (registration.once) {
          this.off(event, registration.handler)
        }
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error)
      }
    }
    
    return true
  }
  
  /**
   * 异步发射事件
   */
  async emitAsync(event: string, ...args: any[]): Promise<void> {
    const registrations = this.events.get(event)
    
    if (!registrations || registrations.length === 0) {
      return
    }
    
    const handlers = [...registrations]
    
    for (const registration of handlers) {
      try {
        await registration.handler(...args)
        
        if (registration.once) {
          this.off(event, registration.handler)
        }
      } catch (error) {
        console.error(`Error in async event handler for "${event}":`, error)
      }
    }
  }
  
  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: string): this {
    if (event) {
      const registrations = this.events.get(event)
      if (registrations) {
        this.listenerCount -= registrations.length
        this.events.delete(event)
      }
    } else {
      this.listenerCount = 0
      this.events.clear()
    }
    
    return this
  }
  
  /**
   * 获取监听器列表
   */
  listeners(event: string): EventHandler[] {
    const registrations = this.events.get(event)
    return registrations ? registrations.map(r => r.handler) : []
  }
  
  /**
   * 获取监听器数量
   */
  listenerCount(event?: string): number {
    if (event) {
      return this.events.get(event)?.length || 0
    }
    return this.listenerCount
  }
  
  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys())
  }
  
  /**
   * 设置最大监听器数量
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n
    return this
  }
  
  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners
  }
  
  /**
   * 检查监听器数量
   */
  private checkMaxListeners(): void {
    if (this.listenerCount >= this.maxListeners) {
      console.warn(
        `Max listeners (${this.maxListeners}) exceeded. ` +
        `This may indicate a memory leak.`
      )
    }
  }
  
  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): {
    events: number
    listeners: number
    averageListenersPerEvent: number
  } {
    const events = this.events.size
    const listeners = this.listenerCount
    
    return {
      events,
      listeners,
      averageListenersPerEvent: events > 0 ? listeners / events : 0
    }
  }
  
  /**
   * 优化内存
   */
  optimize(): void {
    // 清理空的事件
    const emptyEvents: string[] = []
    
    this.events.forEach((registrations, event) => {
      if (registrations.length === 0) {
        emptyEvents.push(event)
      }
    })
    
    emptyEvents.forEach(event => {
      this.events.delete(event)
    })
  }
}






