/**
 * 事件系统服务
 * 
 * 提供类型安全的事件发射器，包括：
 * - 强类型事件定义
 * - 事件监听和发射
 * - 事件取消订阅
 * - 事件统计和调试
 */

import type { TemplateChangeEvent } from '../types'

/**
 * 模板事件类型枚举
 */
export enum TemplateEventType {
  /** 模板变化事件 */
  TEMPLATE_CHANGE = 'template:change',
  /** 设备变化事件 */
  DEVICE_CHANGE = 'device:change',
  /** 扫描完成事件 */
  SCAN_COMPLETE = 'scan:complete',
  /** 模板加载开始事件 */
  TEMPLATE_LOAD_START = 'template:load:start',
  /** 模板加载完成事件 */
  TEMPLATE_LOAD_COMPLETE = 'template:load:complete',
  /** 模板加载错误事件 */
  TEMPLATE_LOAD_ERROR = 'template:load:error',
  /** 缓存命中事件 */
  CACHE_HIT = 'cache:hit',
  /** 缓存未命中事件 */
  CACHE_MISS = 'cache:miss',
  /** 性能指标更新事件 */
  PERFORMANCE_UPDATE = 'performance:update',
}

/**
 * 事件监听器函数类型
 */
export type EventListener<T = unknown> = (event: T) => void | Promise<void>

/**
 * 事件监听器配置
 */
export interface EventListenerConfig {
  /** 是否只监听一次 */
  once?: boolean
  /** 监听器优先级（数字越大优先级越高） */
  priority?: number
  /** 监听器标识符 */
  id?: string
}

/**
 * 内部事件监听器信息
 */
interface InternalEventListener<T = unknown> {
  listener: EventListener<T>
  config: EventListenerConfig
  callCount: number
  lastCalled: number
}

/**
 * 事件统计信息
 */
export interface EventStats {
  /** 事件类型 */
  eventType: string
  /** 监听器数量 */
  listenerCount: number
  /** 触发次数 */
  emitCount: number
  /** 最后触发时间 */
  lastEmitted: number
  /** 平均处理时间（毫秒） */
  averageProcessTime: number
}

/**
 * 事件发射器配置
 */
export interface EventEmitterConfig {
  /** 是否启用调试模式 */
  debug?: boolean
  /** 最大监听器数量 */
  maxListeners?: number
  /** 是否启用性能统计 */
  enableStats?: boolean
  /** 是否启用异步事件处理 */
  asyncEvents?: boolean
}

/**
 * 类型安全的事件发射器
 */
export class EventEmitter {
  private listeners = new Map<string, InternalEventListener[]>()
  private stats = new Map<string, EventStats>()
  private config: Required<EventEmitterConfig>

  constructor(config: EventEmitterConfig = {}) {
    this.config = {
      debug: false,
      maxListeners: 100,
      enableStats: true,
      asyncEvents: true,
      ...config,
    }
  }

  /**
   * 监听事件
   */
  on<T = TemplateChangeEvent>(
    eventType: TemplateEventType | string,
    listener: EventListener<T>,
    config: EventListenerConfig = {},
  ): () => void {
    const eventListeners = this.listeners.get(eventType) || []

    // 检查监听器数量限制
    if (eventListeners.length >= this.config.maxListeners) {
      throw new Error(`Maximum listeners (${this.config.maxListeners}) exceeded for event: ${eventType}`)
    }

    // 创建内部监听器对象
    const internalListener: InternalEventListener<T> = {
      listener,
      config: {
        once: false,
        priority: 0,
        ...config,
      },
      callCount: 0,
      lastCalled: 0,
    }

    // 按优先级插入监听器
    const insertIndex = eventListeners.findIndex(
      l => (l.config.priority || 0) < (internalListener.config.priority || 0),
    )

    if (insertIndex === -1) {
      eventListeners.push(internalListener)
    }
    else {
      eventListeners.splice(insertIndex, 0, internalListener)
    }

    this.listeners.set(eventType, eventListeners)

    // 初始化统计信息
    if (this.config.enableStats && !this.stats.has(eventType)) {
      this.stats.set(eventType, {
        eventType,
        listenerCount: 0,
        emitCount: 0,
        lastEmitted: 0,
        averageProcessTime: 0,
      })
    }

    // 更新监听器数量统计
    if (this.config.enableStats) {
      const stat = this.stats.get(eventType)!
      stat.listenerCount = eventListeners.length
    }

    if (this.config.debug) {
      console.log(`📡 添加事件监听器: ${eventType} (优先级: ${internalListener.config.priority})`)
    }

    // 返回取消订阅函数
    return () => this.off(eventType, listener)
  }

  /**
   * 监听事件一次
   */
  once<T = TemplateChangeEvent>(
    eventType: TemplateEventType | string,
    listener: EventListener<T>,
    config: EventListenerConfig = {},
  ): () => void {
    return this.on(eventType, listener, { ...config, once: true })
  }

  /**
   * 取消监听事件
   */
  off<T = TemplateChangeEvent>(
    eventType: TemplateEventType | string,
    listener: EventListener<T>,
  ): void {
    const eventListeners = this.listeners.get(eventType)
    if (!eventListeners) return

    const index = eventListeners.findIndex(l => l.listener === listener)
    if (index > -1) {
      eventListeners.splice(index, 1)

      if (eventListeners.length === 0) {
        this.listeners.delete(eventType)
      }
      else {
        this.listeners.set(eventType, eventListeners)
      }

      // 更新监听器数量统计
      if (this.config.enableStats) {
        const stat = this.stats.get(eventType)
        if (stat) {
          stat.listenerCount = eventListeners.length
        }
      }

      if (this.config.debug) {
        console.log(`📡 移除事件监听器: ${eventType}`)
      }
    }
  }

  /**
   * 发射事件
   */
  async emit<T = TemplateChangeEvent>(
    eventType: TemplateEventType | string,
    event: T,
  ): Promise<void> {
    const eventListeners = this.listeners.get(eventType)
    if (!eventListeners || eventListeners.length === 0) {
      return
    }

    const startTime = Date.now()

    if (this.config.debug) {
      console.log(`📡 发射事件: ${eventType}`, event)
    }

    // 处理监听器
    const promises: Promise<void>[] = []
    const listenersToRemove: InternalEventListener[] = []

    for (const internalListener of eventListeners) {
      try {
        // 更新调用统计
        internalListener.callCount++
        internalListener.lastCalled = Date.now()

        // 执行监听器
        const result = internalListener.listener(event)

        if (this.config.asyncEvents && result instanceof Promise) {
          promises.push(result)
        }

        // 如果是一次性监听器，标记为待移除
        if (internalListener.config.once) {
          listenersToRemove.push(internalListener)
        }
      }
      catch (error) {
        console.error(`❌ 事件监听器执行错误 (${eventType}):`, error)
      }
    }

    // 等待异步监听器完成
    if (promises.length > 0) {
      await Promise.allSettled(promises)
    }

    // 移除一次性监听器
    if (listenersToRemove.length > 0) {
      const remainingListeners = eventListeners.filter(
        l => !listenersToRemove.includes(l),
      )

      if (remainingListeners.length === 0) {
        this.listeners.delete(eventType)
      }
      else {
        this.listeners.set(eventType, remainingListeners)
      }
    }

    // 更新统计信息
    if (this.config.enableStats) {
      const stat = this.stats.get(eventType)
      if (stat) {
        stat.emitCount++
        stat.lastEmitted = Date.now()

        // 计算平均处理时间
        const processTime = Date.now() - startTime
        stat.averageProcessTime = (stat.averageProcessTime * (stat.emitCount - 1) + processTime) / stat.emitCount
      }
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(eventType?: TemplateEventType | string): void {
    if (eventType) {
      this.listeners.delete(eventType)
      this.stats.delete(eventType)

      if (this.config.debug) {
        console.log(`📡 移除所有监听器: ${eventType}`)
      }
    }
    else {
      this.listeners.clear()
      this.stats.clear()

      if (this.config.debug) {
        console.log('📡 移除所有事件监听器')
      }
    }
  }

  /**
   * 获取监听器数量
   */
  listenerCount(eventType: TemplateEventType | string): number {
    const eventListeners = this.listeners.get(eventType)
    return eventListeners ? eventListeners.length : 0
  }

  /**
   * 获取所有事件类型
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 获取事件统计信息
   */
  getEventStats(eventType?: TemplateEventType | string): EventStats | EventStats[] {
    if (eventType) {
      return this.stats.get(eventType) || {
        eventType,
        listenerCount: 0,
        emitCount: 0,
        lastEmitted: 0,
        averageProcessTime: 0,
      }
    }

    return Array.from(this.stats.values())
  }

  /**
   * 清除事件统计
   */
  clearStats(): void {
    this.stats.clear()
  }

  /**
   * 销毁事件发射器
   */
  destroy(): void {
    this.removeAllListeners()
    this.clearStats()

    if (this.config.debug) {
      console.log('📡 事件发射器已销毁')
    }
  }
}
