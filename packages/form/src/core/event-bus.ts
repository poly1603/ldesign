/**
 * 事件总线实现
 * 
 * 提供高性能的事件发布订阅机制，支持事件过滤、转换、中间件等高级功能
 */

import type {
  EventType,
  EventData,
  EventListener,
  EventListenerConfig,
  EventFilter,
  EventTransformer,
  EventMiddleware,
  EventStats,
  EventBus as IEventBus
} from '../types'

/**
 * 事件监听器包装器
 */
interface ListenerWrapper {
  id: string
  listener: EventListener
  config: EventListenerConfig
  callCount: number
  lastCalled: number
  totalTime: number
  errors: number
}

/**
 * 事件总线实现类
 */
export class EventBus implements IEventBus {
  // 监听器存储
  private listeners = new Map<EventType, Set<ListenerWrapper>>()
  
  // 全局监听器（监听所有事件）
  private globalListeners = new Set<ListenerWrapper>()
  
  // 事件过滤器
  private filters = new Set<EventFilter>()
  
  // 事件转换器
  private transformers = new Set<EventTransformer>()
  
  // 事件中间件
  private middlewares: EventMiddleware[] = []
  
  // 统计信息
  private stats: EventStats = {
    totalEvents: 0,
    eventTypes: {} as Record<EventType, number>,
    listenerCount: 0,
    averageProcessTime: 0,
    errorCount: 0,
    lastEventTime: 0,
    performance: {
      slowestEvent: { type: '' as EventType, duration: 0 },
      fastestEvent: { type: '' as EventType, duration: Infinity },
      memoryUsage: 0
    }
  }
  
  // 内部状态
  private idCounter = 0
  private destroyed = false
  private paused = false
  
  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `listener_${++this.idCounter}`
  }
  
  /**
   * 创建监听器包装器
   */
  private createWrapper(
    listener: EventListener,
    config: Partial<EventListenerConfig> = {}
  ): ListenerWrapper {
    const fullConfig: EventListenerConfig = {
      listener,
      type: config.type || '',
      priority: config.priority || 'normal',
      once: config.once || false,
      capture: config.capture || false,
      passive: config.passive || false,
      condition: config.condition,
      debounce: config.debounce,
      throttle: config.throttle,
      description: config.description,
      tags: config.tags,
      metadata: config.metadata
    }
    
    return {
      id: this.generateId(),
      listener: this.wrapListener(listener, fullConfig),
      config: fullConfig,
      callCount: 0,
      lastCalled: 0,
      totalTime: 0,
      errors: 0
    }
  }
  
  /**
   * 包装监听器以支持防抖、节流等功能
   */
  private wrapListener(
    listener: EventListener,
    config: EventListenerConfig
  ): EventListener {
    let wrappedListener = listener
    
    // 添加条件检查
    if (config.condition) {
      const originalListener = wrappedListener
      wrappedListener = (event: EventData) => {
        if (config.condition!(event)) {
          return originalListener(event)
        }
      }
    }
    
    // 添加防抖
    if (config.debounce && config.debounce > 0) {
      wrappedListener = this.debounce(wrappedListener, config.debounce)
    }
    
    // 添加节流
    if (config.throttle && config.throttle > 0) {
      wrappedListener = this.throttle(wrappedListener, config.throttle)
    }
    
    return wrappedListener
  }
  
  /**
   * 防抖函数
   */
  private debounce<T extends EventListener>(fn: T, delay: number): T {
    let timeoutId: NodeJS.Timeout | null = null
    
    return ((...args: any[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        fn(...args)
        timeoutId = null
      }, delay)
    }) as T
  }
  
  /**
   * 节流函数
   */
  private throttle<T extends EventListener>(fn: T, interval: number): T {
    let lastCall = 0
    
    return ((...args: any[]) => {
      const now = Date.now()
      if (now - lastCall >= interval) {
        lastCall = now
        fn(...args)
      }
    }) as T
  }
  
  /**
   * 按优先级排序监听器
   */
  private sortListenersByPriority(listeners: ListenerWrapper[]): ListenerWrapper[] {
    const priorityOrder = { highest: 0, high: 1, normal: 2, low: 3, lowest: 4 }
    
    return listeners.sort((a, b) => {
      const aPriority = priorityOrder[a.config.priority || 'normal']
      const bPriority = priorityOrder[b.config.priority || 'normal']
      return aPriority - bPriority
    })
  }
  
  /**
   * 应用过滤器
   */
  private applyFilters(event: EventData): boolean {
    for (const filter of this.filters) {
      try {
        if (!filter(event)) {
          return false
        }
      } catch (error) {
        console.error('Event filter error:', error)
        this.stats.errorCount++
      }
    }
    return true
  }
  
  /**
   * 应用转换器
   */
  private applyTransformers(event: EventData): EventData {
    let transformedEvent = event
    
    for (const transformer of this.transformers) {
      try {
        transformedEvent = transformer(transformedEvent)
      } catch (error) {
        console.error('Event transformer error:', error)
        this.stats.errorCount++
      }
    }
    
    return transformedEvent
  }
  
  /**
   * 执行中间件
   */
  private async executeMiddlewares(
    event: EventData,
    listeners: ListenerWrapper[]
  ): Promise<void> {
    let index = 0
    
    const next = async (): Promise<void> => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++]
        await middleware(event, next)
      } else {
        // 执行监听器
        await this.executeListeners(event, listeners)
      }
    }
    
    await next()
  }
  
  /**
   * 执行监听器
   */
  private async executeListeners(
    event: EventData,
    listeners: ListenerWrapper[]
  ): Promise<void> {
    const sortedListeners = this.sortListenersByPriority(listeners)
    
    for (const wrapper of sortedListeners) {
      if (this.destroyed || this.paused) {
        break
      }
      
      try {
        const startTime = performance.now()
        
        await wrapper.listener(event)
        
        const endTime = performance.now()
        const duration = endTime - startTime
        
        // 更新统计信息
        wrapper.callCount++
        wrapper.lastCalled = Date.now()
        wrapper.totalTime += duration
        
        // 更新性能统计
        if (duration > this.stats.performance.slowestEvent.duration) {
          this.stats.performance.slowestEvent = { type: event.type, duration }
        }
        
        if (duration < this.stats.performance.fastestEvent.duration) {
          this.stats.performance.fastestEvent = { type: event.type, duration }
        }
        
        // 如果是一次性监听器，移除它
        if (wrapper.config.once) {
          this.removeListenerWrapper(wrapper)
        }
        
      } catch (error) {
        console.error(`Event listener error for ${event.type}:`, error)
        wrapper.errors++
        this.stats.errorCount++
      }
    }
  }
  
  /**
   * 移除监听器包装器
   */
  private removeListenerWrapper(wrapper: ListenerWrapper): void {
    // 从类型监听器中移除
    for (const [type, listeners] of this.listeners) {
      if (listeners.has(wrapper)) {
        listeners.delete(wrapper)
        if (listeners.size === 0) {
          this.listeners.delete(type)
        }
        break
      }
    }
    
    // 从全局监听器中移除
    this.globalListeners.delete(wrapper)
    
    // 更新统计
    this.stats.listenerCount--
  }
  
  /**
   * 添加事件监听器
   */
  public on<T extends EventData = EventData>(
    type: EventType | EventType[],
    listener: EventListener<T>,
    options: Partial<EventListenerConfig> = {}
  ): () => void {
    if (this.destroyed) {
      throw new Error('EventBus has been destroyed')
    }
    
    const types = Array.isArray(type) ? type : [type]
    const wrapper = this.createWrapper(listener as EventListener, { ...options, type })
    
    // 添加到对应的事件类型
    for (const eventType of types) {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, new Set())
      }
      this.listeners.get(eventType)!.add(wrapper)
    }
    
    // 更新统计
    this.stats.listenerCount++
    
    // 返回取消监听的函数
    return () => {
      this.removeListenerWrapper(wrapper)
    }
  }
  
  /**
   * 添加一次性事件监听器
   */
  public once<T extends EventData = EventData>(
    type: EventType | EventType[],
    listener: EventListener<T>,
    options: Partial<EventListenerConfig> = {}
  ): () => void {
    return this.on(type, listener, { ...options, once: true })
  }
  
  /**
   * 移除事件监听器
   */
  public off(type: EventType | EventType[], listener?: EventListener): void {
    if (this.destroyed) {
      return
    }
    
    const types = Array.isArray(type) ? type : [type]
    
    for (const eventType of types) {
      const listeners = this.listeners.get(eventType)
      if (!listeners) {
        continue
      }
      
      if (listener) {
        // 移除特定监听器
        for (const wrapper of listeners) {
          if (wrapper.config.listener === listener) {
            this.removeListenerWrapper(wrapper)
            break
          }
        }
      } else {
        // 移除所有监听器
        for (const wrapper of listeners) {
          this.removeListenerWrapper(wrapper)
        }
      }
    }
  }
  
  /**
   * 触发事件（异步）
   */
  public async emit(type: EventType, data: Partial<EventData> = {}): Promise<void> {
    if (this.destroyed || this.paused) {
      return
    }
    
    const startTime = performance.now()
    
    // 创建完整的事件数据
    const event: EventData = {
      type,
      timestamp: Date.now(),
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data
    } as EventData
    
    // 应用过滤器
    if (!this.applyFilters(event)) {
      return
    }
    
    // 应用转换器
    const transformedEvent = this.applyTransformers(event)
    
    // 收集监听器
    const listeners: ListenerWrapper[] = []
    
    // 添加类型特定的监听器
    const typeListeners = this.listeners.get(type)
    if (typeListeners) {
      listeners.push(...typeListeners)
    }
    
    // 添加全局监听器
    listeners.push(...this.globalListeners)
    
    // 执行中间件和监听器
    if (this.middlewares.length > 0) {
      await this.executeMiddlewares(transformedEvent, listeners)
    } else {
      await this.executeListeners(transformedEvent, listeners)
    }
    
    // 更新统计信息
    const endTime = performance.now()
    const duration = endTime - startTime
    
    this.stats.totalEvents++
    this.stats.eventTypes[type] = (this.stats.eventTypes[type] || 0) + 1
    this.stats.lastEventTime = Date.now()
    this.stats.averageProcessTime = 
      (this.stats.averageProcessTime * (this.stats.totalEvents - 1) + duration) / this.stats.totalEvents
  }
  
  /**
   * 同步触发事件
   */
  public emitSync(type: EventType, data: Partial<EventData> = {}): void {
    // 同步版本的emit，不等待Promise
    this.emit(type, data).catch(error => {
      console.error('Sync emit error:', error)
    })
  }
  
  /**
   * 添加事件过滤器
   */
  public addFilter(filter: EventFilter): void {
    this.filters.add(filter)
  }
  
  /**
   * 移除事件过滤器
   */
  public removeFilter(filter: EventFilter): void {
    this.filters.delete(filter)
  }
  
  /**
   * 添加事件转换器
   */
  public addTransformer(transformer: EventTransformer): void {
    this.transformers.add(transformer)
  }
  
  /**
   * 移除事件转换器
   */
  public removeTransformer(transformer: EventTransformer): void {
    this.transformers.delete(transformer)
  }
  
  /**
   * 添加事件中间件
   */
  public use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware)
  }
  
  /**
   * 获取所有监听器
   */
  public getListeners(type?: EventType): EventListenerConfig[] {
    const configs: EventListenerConfig[] = []
    
    if (type) {
      const listeners = this.listeners.get(type)
      if (listeners) {
        for (const wrapper of listeners) {
          configs.push(wrapper.config)
        }
      }
    } else {
      for (const listeners of this.listeners.values()) {
        for (const wrapper of listeners) {
          configs.push(wrapper.config)
        }
      }
      
      for (const wrapper of this.globalListeners) {
        configs.push(wrapper.config)
      }
    }
    
    return configs
  }
  
  /**
   * 清除所有监听器
   */
  public clear(): void {
    this.listeners.clear()
    this.globalListeners.clear()
    this.filters.clear()
    this.transformers.clear()
    this.middlewares = []
    
    this.stats.listenerCount = 0
  }
  
  /**
   * 暂停事件处理
   */
  public pause(): void {
    this.paused = true
  }
  
  /**
   * 恢复事件处理
   */
  public resume(): void {
    this.paused = false
  }
  
  /**
   * 销毁事件总线
   */
  public destroy(): void {
    if (this.destroyed) {
      return
    }
    
    this.destroyed = true
    this.clear()
  }
  
  /**
   * 获取事件统计
   */
  public getStats(): EventStats {
    // 更新内存使用情况
    if (performance.memory) {
      this.stats.performance.memoryUsage = performance.memory.usedJSHeapSize
    }
    
    return { ...this.stats }
  }
  
  /**
   * 检查是否已销毁
   */
  public get isDestroyed(): boolean {
    return this.destroyed
  }
  
  /**
   * 检查是否已暂停
   */
  public get isPaused(): boolean {
    return this.paused
  }
}
