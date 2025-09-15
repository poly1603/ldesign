/**
 * WebSocket 事件发射器
 * 
 * 提供高性能的事件发射和监听功能，支持中间件、过滤器、转换器等高级特性
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type {
  EventListener,
  EventListenerOptions,
  EventListenerInfo,
  AdvancedEventEmitter,
  EventMiddleware,
  EventFilter,
  EventTransformer
} from '@/types/events'

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

/**
 * 高级事件发射器实现
 */
export class WebSocketEventEmitter<EventMap = Record<string, unknown>>
  implements AdvancedEventEmitter<EventMap> {

  /** 事件监听器映射 */
  private readonly eventListeners = new Map<keyof EventMap, EventListenerInfo[]>()

  /** 事件中间件列表 */
  private readonly middlewares: EventMiddleware[] = []

  /** 事件过滤器映射 */
  private readonly filters = new Map<keyof EventMap, EventFilter[]>()

  /** 事件转换器映射 */
  private readonly transformers = new Map<keyof EventMap, EventTransformer[]>()

  /** 最大监听器数量 */
  private maxListeners = 1000

  /** 事件统计信息 */
  private readonly eventStats = new Map<string, {
    listenerCount: number
    emitCount: number
    lastEmitAt: number | null
  }>()

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param options 监听器选项
   */
  on<K extends keyof EventMap>(
    event: K,
    listener: EventListener<EventMap[K]>,
    options: EventListenerOptions = {}
  ): this {
    const eventListeners = this.eventListeners.get(event) || []

    // 检查监听器数量限制
    if (eventListeners.length >= this.maxListeners) {
      console.warn(`事件 "${String(event)}" 的监听器数量已达到最大限制 ${this.maxListeners}`)
    }

    const listenerInfo: EventListenerInfo<EventMap[K]> = {
      listener,
      options: { priority: 0, ...options },
      id: generateId(),
      addedAt: Date.now(),
      callCount: 0
    }

    eventListeners.push(listenerInfo)

    // 按优先级排序
    eventListeners.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0))

    this.eventListeners.set(event, eventListeners)

    // 更新统计信息
    this.updateEventStats(String(event), { listenerCount: eventListeners.length })

    return this
  }

  /**
   * 添加一次性事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param options 监听器选项
   */
  once<K extends keyof EventMap>(
    event: K,
    listener: EventListener<EventMap[K]>,
    options: Omit<EventListenerOptions, 'once'> = {}
  ): this {
    return this.on(event, listener, { ...options, once: true })
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off<K extends keyof EventMap>(
    event: K,
    listener?: EventListener<EventMap[K]>
  ): this {
    const eventListeners = this.eventListeners.get(event)
    if (!eventListeners) return this

    if (listener) {
      // 移除指定监听器
      const index = eventListeners.findIndex(info => info.listener === listener)
      if (index !== -1) {
        eventListeners.splice(index, 1)
      }
    } else {
      // 移除所有监听器
      eventListeners.length = 0
    }

    if (eventListeners.length === 0) {
      this.eventListeners.delete(event)
      this.eventStats.delete(String(event))
    } else {
      // 更新统计信息
      this.updateEventStats(String(event), { listenerCount: eventListeners.length })
    }

    return this
  }

  /**
   * 发射事件
   * @param event 事件名称
   * @param data 事件数据
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean {
    const eventName = String(event)

    // 更新统计信息
    this.updateEventStats(eventName, {
      emitCount: (this.eventStats.get(eventName)?.emitCount || 0) + 1,
      lastEmitAt: Date.now()
    })

    // 应用过滤器
    const filters = this.filters.get(event) || []
    for (const filter of filters) {
      if (!filter(eventName, data)) {
        return false
      }
    }

    // 应用转换器
    let transformedData = data
    const transformers = this.transformers.get(event) || []
    for (const transformer of transformers) {
      transformedData = transformer(eventName, transformedData) as EventMap[K]
    }

    // 执行监听器
    const executeListeners = (): void => {
      const eventListeners = this.eventListeners.get(event) || []
      const listenersToRemove: EventListener<EventMap[K]>[] = []

      for (const listenerInfo of eventListeners) {
        try {
          // 更新调用次数
          listenerInfo.callCount++

          // 执行监听器
          const result = listenerInfo.listener(transformedData)

          // 如果返回 Promise，异步处理错误
          if (result && typeof result.then === 'function') {
            result.catch((error: Error) => {
              console.error(`异步事件监听器执行错误:`, error)
            })
          }

          // 如果是一次性监听器，标记为待移除
          if (listenerInfo.options.once) {
            listenersToRemove.push(listenerInfo.listener)
          }
        } catch (error) {
          console.error(`事件监听器执行错误:`, error)
        }
      }

      // 移除一次性监听器
      for (const listener of listenersToRemove) {
        this.off(event, listener)
      }
    }

    // 执行中间件链
    const executeMiddlewares = (index: number): void => {
      if (index >= this.middlewares.length) {
        executeListeners()
        return
      }

      try {
        const middleware = this.middlewares[index]
        middleware(eventName, transformedData, () => {
          executeMiddlewares(index + 1)
        })
      } catch (error) {
        console.error(`事件中间件执行错误:`, error)
        executeListeners() // 即使中间件出错也要执行监听器
      }
    }

    // 同步执行
    executeMiddlewares(0)

    return true
  }

  /**
   * 获取事件监听器列表
   * @param event 事件名称
   */
  listeners<K extends keyof EventMap>(event: K): EventListenerInfo<EventMap[K]>[] {
    return [...(this.eventListeners.get(event) || [])]
  }

  /**
   * 获取事件监听器数量
   * @param event 事件名称
   */
  listenerCount<K extends keyof EventMap>(event: K): number {
    return this.eventListeners.get(event)?.length || 0
  }

  /**
   * 移除所有监听器
   * @param event 可选的事件名称，不传则移除所有事件的监听器
   */
  removeAllListeners<K extends keyof EventMap>(event?: K): this {
    if (event) {
      this.eventListeners.delete(event)
      this.eventStats.delete(String(event))
    } else {
      this.eventListeners.clear()
      this.eventStats.clear()
    }
    return this
  }

  /**
   * 设置最大监听器数量
   * @param n 最大数量
   */
  setMaxListeners(n: number): this {
    this.maxListeners = Math.max(0, n)
    return this
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners
  }

  /**
   * 添加事件中间件
   * @param middleware 中间件函数
   */
  use(middleware: EventMiddleware): this {
    this.middlewares.push(middleware)
    return this
  }

  /**
   * 添加事件过滤器
   * @param event 事件名称
   * @param filter 过滤器函数
   */
  filter<K extends keyof EventMap>(
    event: K,
    filter: EventFilter<EventMap[K]>
  ): this {
    const filters = this.filters.get(event) || []
    filters.push(filter)
    this.filters.set(event, filters)
    return this
  }

  /**
   * 添加事件转换器
   * @param event 事件名称
   * @param transformer 转换器函数
   */
  transform<K extends keyof EventMap, R = unknown>(
    event: K,
    transformer: EventTransformer<EventMap[K], R>
  ): this {
    const transformers = this.transformers.get(event) || []
    transformers.push(transformer as EventTransformer)
    this.transformers.set(event, transformers)
    return this
  }

  /**
   * 等待事件发生
   * @param event 事件名称
   * @param timeout 超时时间（毫秒）
   */
  waitFor<K extends keyof EventMap>(
    event: K,
    timeout?: number
  ): Promise<EventMap[K]> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined

      const cleanup = (): void => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }

      const listener = (data: EventMap[K]): void => {
        cleanup()
        resolve(data)
      }

      this.once(event, listener)

      if (timeout && timeout > 0) {
        timeoutId = setTimeout(() => {
          this.off(event, listener)
          reject(new Error(`等待事件 "${String(event)}" 超时`))
        }, timeout)
      }
    })
  }

  /**
   * 批量发射事件
   * @param events 事件列表
   */
  emitBatch<K extends keyof EventMap>(
    events: Array<{ event: K; data: EventMap[K] }>
  ): boolean[] {
    return events.map(({ event, data }) => this.emit(event, data))
  }

  /**
   * 延迟发射事件
   * @param event 事件名称
   * @param data 事件数据
   * @param delay 延迟时间（毫秒）
   */
  async emitAfter<K extends keyof EventMap>(
    event: K,
    data: EventMap[K],
    delay: number
  ): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.emit(event, data))
      }, delay)
    })
  }

  /**
   * 获取事件统计信息
   */
  getEventStats(): Record<string, {
    listenerCount: number
    emitCount: number
    lastEmitAt: number | null
  }> {
    const stats: Record<string, {
      listenerCount: number
      emitCount: number
      lastEmitAt: number | null
    }> = {}
    for (const [event, stat] of this.eventStats) {
      stats[event] = { ...stat }
    }
    return stats
  }

  /**
   * 清除事件统计信息
   */
  clearEventStats(): this {
    for (const [event] of this.eventStats) {
      this.eventStats.set(event, {
        listenerCount: this.listenerCount(event as keyof EventMap),
        emitCount: 0,
        lastEmitAt: null
      })
    }
    return this
  }

  /**
   * 更新事件统计信息
   * @param event 事件名称
   * @param updates 更新内容
   */
  private updateEventStats(
    event: string,
    updates: Partial<{
      listenerCount: number
      emitCount: number
      lastEmitAt: number | null
    }>
  ): void {
    const current = this.eventStats.get(event) || {
      listenerCount: 0,
      emitCount: 0,
      lastEmitAt: null
    }

    this.eventStats.set(event, { ...current, ...updates })
  }
}
