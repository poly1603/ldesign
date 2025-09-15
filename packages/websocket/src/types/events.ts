/**
 * WebSocket 事件系统类型定义
 * 
 * 定义事件系统相关的类型和接口
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 事件监听器函数类型
 */
export type EventListener<T = unknown> = (data: T) => void | Promise<void>

/**
 * 事件监听器选项
 */
export interface EventListenerOptions {
  /** 是否只执行一次 */
  once?: boolean
  /** 监听器优先级 */
  priority?: number
  /** 是否在捕获阶段执行 */
  capture?: boolean
  /** 是否是被动监听器 */
  passive?: boolean
}

/**
 * 事件监听器信息
 */
export interface EventListenerInfo<T = unknown> {
  /** 监听器函数 */
  listener: EventListener<T>
  /** 监听器选项 */
  options: EventListenerOptions
  /** 监听器 ID */
  id: string
  /** 添加时间 */
  addedAt: number
  /** 执行次数 */
  callCount: number
}

/**
 * 事件发射器接口
 */
export interface EventEmitter<EventMap = Record<string, unknown>> {
  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param options 监听器选项
   */
  on<K extends keyof EventMap>(
    event: K,
    listener: EventListener<EventMap[K]>,
    options?: EventListenerOptions
  ): this

  /**
   * 添加一次性事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   * @param options 监听器选项
   */
  once<K extends keyof EventMap>(
    event: K,
    listener: EventListener<EventMap[K]>,
    options?: Omit<EventListenerOptions, 'once'>
  ): this

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off<K extends keyof EventMap>(
    event: K,
    listener?: EventListener<EventMap[K]>
  ): this

  /**
   * 发射事件
   * @param event 事件名称
   * @param data 事件数据
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean

  /**
   * 获取事件监听器列表
   * @param event 事件名称
   */
  listeners<K extends keyof EventMap>(event: K): EventListenerInfo<EventMap[K]>[]

  /**
   * 获取事件监听器数量
   * @param event 事件名称
   */
  listenerCount<K extends keyof EventMap>(event: K): number

  /**
   * 移除所有监听器
   * @param event 可选的事件名称，不传则移除所有事件的监听器
   */
  removeAllListeners<K extends keyof EventMap>(event?: K): this

  /**
   * 设置最大监听器数量
   * @param n 最大数量
   */
  setMaxListeners(n: number): this

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number
}

/**
 * 事件中间件函数类型
 */
export type EventMiddleware<T = unknown> = (
  event: string,
  data: T,
  next: () => void | Promise<void>
) => void | Promise<void>

/**
 * 事件过滤器函数类型
 */
export type EventFilter<T = unknown> = (event: string, data: T) => boolean

/**
 * 事件转换器函数类型
 */
export type EventTransformer<T = unknown, R = unknown> = (
  event: string,
  data: T
) => R | Promise<R>

/**
 * 高级事件发射器接口
 */
export interface AdvancedEventEmitter<EventMap = Record<string, unknown>>
  extends EventEmitter<EventMap> {
  /**
   * 添加事件中间件
   * @param middleware 中间件函数
   */
  use(middleware: EventMiddleware): this

  /**
   * 添加事件过滤器
   * @param filter 过滤器函数
   */
  filter<K extends keyof EventMap>(
    event: K,
    filter: EventFilter<EventMap[K]>
  ): this

  /**
   * 添加事件转换器
   * @param transformer 转换器函数
   */
  transform<K extends keyof EventMap, R = unknown>(
    event: K,
    transformer: EventTransformer<EventMap[K], R>
  ): this

  /**
   * 等待事件发生
   * @param event 事件名称
   * @param timeout 超时时间（毫秒）
   */
  waitFor<K extends keyof EventMap>(
    event: K,
    timeout?: number
  ): Promise<EventMap[K]>

  /**
   * 批量发射事件
   * @param events 事件列表
   */
  emitBatch<K extends keyof EventMap>(
    events: Array<{ event: K; data: EventMap[K] }>
  ): boolean[]

  /**
   * 延迟发射事件
   * @param event 事件名称
   * @param data 事件数据
   * @param delay 延迟时间（毫秒）
   */
  emitAfter<K extends keyof EventMap>(
    event: K,
    data: EventMap[K],
    delay: number
  ): Promise<boolean>

  /**
   * 获取事件统计信息
   */
  getEventStats(): Record<string, {
    listenerCount: number
    emitCount: number
    lastEmitAt: number | null
  }>

  /**
   * 清除事件统计信息
   */
  clearEventStats(): this
}

/**
 * 事件命名空间接口
 */
export interface EventNamespace {
  /** 命名空间名称 */
  name: string
  /** 父命名空间 */
  parent?: EventNamespace
  /** 子命名空间 */
  children: Map<string, EventNamespace>
  /** 事件发射器 */
  emitter: EventEmitter
}

/**
 * 命名空间事件发射器接口
 */
export interface NamespacedEventEmitter {
  /**
   * 获取或创建命名空间
   * @param namespace 命名空间路径
   */
  namespace(namespace: string): EventEmitter

  /**
   * 在指定命名空间发射事件
   * @param namespace 命名空间路径
   * @param event 事件名称
   * @param data 事件数据
   */
  emitTo(namespace: string, event: string, data: unknown): boolean

  /**
   * 广播事件到所有命名空间
   * @param event 事件名称
   * @param data 事件数据
   */
  broadcast(event: string, data: unknown): boolean[]

  /**
   * 获取所有命名空间
   */
  getNamespaces(): string[]

  /**
   * 移除命名空间
   * @param namespace 命名空间路径
   */
  removeNamespace(namespace: string): boolean
}
