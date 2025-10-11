/**
 * 增强的管理器基类
 * 提供批处理、改进的事件系统和状态管理
 *
 * @module enhanced-manager
 */

import type { Engine } from '../types/engine'

import { AbstractBaseManager } from './base-manager'

/**
 * 批处理操作配置
 */
export interface BatchOptions {
  /** 批处理大小 */
  batchSize?: number
  /** 批处理延迟（毫秒） */
  delay?: number
  /** 是否并行执行 */
  parallel?: boolean
  /** 最大并发数 */
  maxConcurrency?: number
  /** 失败时是否继续 */
  continueOnError?: boolean
  /** 进度回调 */
  onProgress?: (completed: number, total: number) => void
  /** 错误回调 */
  onError?: (error: Error, item: any, index: number) => void
}

/**
 * 批处理结果
 */
export interface BatchResult<T, R> {
  /** 成功的结果 */
  successful: Array<{ item: T; result: R; index: number }>
  /** 失败的项目 */
  failed: Array<{ item: T; error: Error; index: number }>
  /** 总数 */
  total: number
  /** 成功数 */
  successCount: number
  /** 失败数 */
  failCount: number
  /** 执行时间（毫秒） */
  duration: number
}

/**
 * 事件处理器
 */
export type EventHandler<T = any> = (data: T) => void | Promise<void>

/**
 * 事件监听器配置
 */
export interface EventListenerOptions {
  /** 是否只执行一次 */
  once?: boolean
  /** 优先级（数字越大优先级越高） */
  priority?: number
  /** 是否异步执行 */
  async?: boolean
}

/**
 * 事件监听器信息
 */
interface EventListener<T = any> {
  handler: EventHandler<T>
  options: EventListenerOptions
  id: string
}

/**
 * 状态变化事件
 */
export interface StateChangeEvent<T = any> {
  /** 之前的状态 */
  previous: T
  /** 当前状态 */
  current: T
  /** 变化的字段 */
  changes: Partial<T>
  /** 时间戳 */
  timestamp: number
}

/**
 * 增强的管理器基类
 *
 * @example
 * ```typescript
 * class UserManager extends EnhancedManager<UserConfig> {
  private logger = getLogger('UserManager');

 *   protected async onInitialize() {
 *     // 初始化逻辑
 *   }
 *
 *   protected async onDestroy() {
 *     // 清理逻辑
 *   }
 *
 *   // 批量加载用户
 *   async loadUsers(ids: string[]) {
 *     return await this.batch(
 *       ids,
 *       async (id) => await this.loadUser(id),
 *       { batchSize: 10, parallel: true }
 *     )
 *   }
 * }
 * ```
 */
export abstract class EnhancedManager<
  TConfig = Record<string, unknown>,
  TState = Record<string, unknown>
> extends AbstractBaseManager<TConfig> {
  private eventListeners = new Map<string, EventListener[]>()
  private eventIdCounter = 0
  private _state: TState
  private stateHistory: StateChangeEvent<TState>[] = []
  private maxHistorySize = 50

  constructor(
    engine: Engine,
    name: string,
    config?: TConfig,
    initialState?: TState
  ) {
    super(engine, name, config)
    this._state = (initialState ?? {}) as TState
  }

  /**
   * 获取当前状态
   */
  get state(): Readonly<TState> {
    return Object.freeze({ ...this._state })
  }

  /**
   * 更新状态
   *
   * @param updates - 状态更新
   * @param silent - 是否静默更新（不触发事件）
   */
  protected setState(updates: Partial<TState>, silent = false): void {
    const previous = { ...this._state }
    const current = { ...this._state, ...updates }

    const changes: Partial<TState> = {}
    for (const key in updates) {
      if (updates[key] !== previous[key]) {
        changes[key] = updates[key]
      }
    }

    // 只有实际有变化时才更新
    if (Object.keys(changes).length > 0) {
      this._state = current

      const event: StateChangeEvent<TState> = {
        previous,
        current,
        changes,
        timestamp: Date.now(),
      }

      // 记录历史
      this.stateHistory.push(event)
      if (this.stateHistory.length > this.maxHistorySize) {
        this.stateHistory.shift()
      }

      // 触发状态变化事件
      if (!silent) {
        this.emitEvent('state:changed', event)
      }
    }
  }

  /**
   * 获取状态历史
   */
  getStateHistory(): readonly StateChangeEvent<TState>[] {
    return [...this.stateHistory]
  }

  /**
   * 清空状态历史
   */
  clearStateHistory(): void {
    this.stateHistory = []
  }

  /**
   * 批处理操作
   *
   * @param items - 要处理的项目列表
   * @param processor - 处理函数
   * @param options - 批处理选项
   * @returns 批处理结果
   *
   * @example
   * ```typescript
   * const result = await manager.batch(
   *   userIds,
   *   async (id) => await fetchUser(id),
   *   {
   *     batchSize: 10,
   *     parallel: true,
   *     maxConcurrency: 5,
   *     onProgress: (completed, total) => {
   *       this.logger.debug(`处理进度: ${completed}/${total}`)
   *     }
   *   }
   * )
   * ```
   */
  protected async batch<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    options: BatchOptions = {}
  ): Promise<BatchResult<T, R>> {
    const {
      batchSize = 10,
      delay = 0,
      parallel = false,
      maxConcurrency = 5,
      continueOnError = true,
      onProgress,
      onError,
    } = options

    const startTime = Date.now()
    const successful: Array<{ item: T; result: R; index: number }> = []
    const failed: Array<{ item: T; error: Error; index: number }> = []

    if (parallel) {
      // 并行处理（带并发控制）
      const chunks = this.chunkArray(items, batchSize)
      let completed = 0

      for (const chunk of chunks) {
        const promises = chunk.map(async (item, chunkIndex) => {
          const index = chunks.indexOf(chunk) * batchSize + chunkIndex
          try {
            const result = await processor(item, index)
            successful.push({ item, result, index })
          } catch (error) {
            const err = error as Error
            failed.push({ item, error: err, index })
            onError?.(err, item, index)
            if (!continueOnError) {
              throw error
            }
          } finally {
            completed++
            onProgress?.(completed, items.length)
          }
        })

        // 控制并发
        const concurrentBatches = this.chunkArray(promises, maxConcurrency)
        for (const batch of concurrentBatches) {
          await Promise.all(batch)
        }

        if (delay > 0 && chunks.indexOf(chunk) < chunks.length - 1) {
          await this.sleep(delay)
        }
      }
    } else {
      // 串行处理
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        try {
          const result = await processor(item, i)
          successful.push({ item, result, index: i })
        } catch (error) {
          const err = error as Error
          failed.push({ item, error: err, index: i })
          onError?.(err, item, i)
          if (!continueOnError) {
            throw error
          }
        }

        onProgress?.(i + 1, items.length)

        if (delay > 0 && i < items.length - 1) {
          await this.sleep(delay)
        }
      }
    }

    const duration = Date.now() - startTime

    return {
      successful,
      failed,
      total: items.length,
      successCount: successful.length,
      failCount: failed.length,
      duration,
    }
  }

  /**
   * 发送事件（增强版）
   *
   * @param event - 事件名称
   * @param data - 事件数据
   */
  protected emitEvent<T = any>(event: string, data?: T): void {
    const fullEventName = `${this.name}:${event}`

    // 触发本地监听器
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      // 按优先级排序
      const sortedListeners = [...listeners].sort(
        (a, b) => (b.options.priority ?? 0) - (a.options.priority ?? 0)
      )

      for (const listener of sortedListeners) {
        try {
          if (listener.options.async) {
            // 异步执行，不等待
            Promise.resolve(listener.handler(data)).catch((error) => {
              this.log('error', `事件处理器错误: ${event}`, error)
            })
          } else {
            // 同步执行
            listener.handler(data)
          }

          // 如果是 once 监听器，执行后移除
          if (listener.options.once) {
            this.offEvent(event, listener.id)
          }
        } catch (error) {
          this.log('error', `事件处理器错误: ${event}`, error)
        }
      }
    }

    // 触发全局事件（如果engine支持）
    if (this.engine.events) {
      this.engine.events.emit(fullEventName, data)
    }
  }

  /**
   * 监听事件（增强版）
   *
   * @param event - 事件名称
   * @param handler - 事件处理器
   * @param options - 监听器选项
   * @returns 监听器ID（用于移除）
   */
  protected onEvent<T = any>(
    event: string,
    handler: EventHandler<T>,
    options: EventListenerOptions = {}
  ): string {
    const listenerId = `${this.name}-${event}-${this.eventIdCounter++}`

    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }

    const listeners = this.eventListeners.get(event)!
    listeners.push({
      handler,
      options: {
        once: options.once ?? false,
        priority: options.priority ?? 0,
        async: options.async ?? false,
      },
      id: listenerId,
    })

    return listenerId
  }

  /**
   * 移除事件监听器
   *
   * @param event - 事件名称
   * @param listenerId - 监听器ID
   */
  protected offEvent(event: string, listenerId: string): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.findIndex((l) => l.id === listenerId)
      if (index !== -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 只监听一次
   */
  protected onceEvent<T = any>(
    event: string,
    handler: EventHandler<T>,
    options: Omit<EventListenerOptions, 'once'> = {}
  ): string {
    return this.onEvent(event, handler, { ...options, once: true })
  }

  /**
   * 移除所有事件监听器
   */
  protected removeAllEventListeners(event?: string): void {
    if (event) {
      this.eventListeners.delete(event)
    } else {
      this.eventListeners.clear()
    }
  }

  /**
   * 等待特定事件
   *
   * @param event - 事件名称
   * @param timeout - 超时时间（毫秒）
   * @returns Promise，在事件触发时resolve
   */
  protected waitForEvent<T = any>(
    event: string,
    timeout?: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let timerId: NodeJS.Timeout | undefined

      const listenerId = this.onceEvent<T>(event, (data) => {
        if (timerId) {
          clearTimeout(timerId)
        }
        resolve(data)
      })

      if (timeout) {
        timerId = setTimeout(() => {
          this.offEvent(event, listenerId)
          reject(new Error(`等待事件 ${event} 超时`))
        }, timeout)
      }
    })
  }

  /**
   * 获取事件监听器数量
   */
  protected getEventListenerCount(event?: string): number {
    if (event) {
      return this.eventListeners.get(event)?.length ?? 0
    }
    return Array.from(this.eventListeners.values()).reduce(
      (sum, listeners) => sum + listeners.length,
      0
    )
  }

  /**
   * 获取所有事件名称
   */
  protected getEventNames(): string[] {
    return Array.from(this.eventListeners.keys())
  }

  /**
   * 延迟执行
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 数组分块
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * 销毁管理器（清理事件监听器）
   */
  async destroy(): Promise<void> {
    this.removeAllEventListeners()
    this.clearStateHistory()
    await super.destroy()
  }

  /**
   * 获取管理器统计信息
   */
  getEnhancedStats() {
    return {
      name: this.name,
      status: this.getStatus(),
      initialized: this.isInitialized,
      state: this.state,
      eventListenerCount: this.getEventListenerCount(),
      events: this.getEventNames(),
      stateHistorySize: this.stateHistory.length,
    }
  }

  /**
   * 子类需要实现的初始化逻辑
   */
  protected abstract onInitialize(): Promise<void> | void

  /**
   * 子类需要实现的销毁逻辑
   */
  protected abstract onDestroy(): Promise<void> | void
}

/**
 * 批处理辅助函数
 */
export class BatchProcessor {
  /**
   * 批量处理数组
   */
  static async processArray<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    options: BatchOptions = {}
  ): Promise<BatchResult<T, R>> {
    const {
      batchSize = 10,
      delay = 0,
      parallel = false,
      maxConcurrency = 5,
      continueOnError = true,
      onProgress,
      onError,
    } = options

    const startTime = Date.now()
    const successful: Array<{ item: T; result: R; index: number }> = []
    const failed: Array<{ item: T; error: Error; index: number }> = []

    const chunks = this.chunkArray(items, batchSize)
    let completed = 0

    for (const chunk of chunks) {
      if (parallel) {
        // 并行处理
        const promises = chunk.map(async (item, chunkIndex) => {
          const index = chunks.indexOf(chunk) * batchSize + chunkIndex
          try {
            const result = await processor(item, index)
            successful.push({ item, result, index })
          } catch (error) {
            const err = error as Error
            failed.push({ item, error: err, index })
            onError?.(err, item, index)
            if (!continueOnError) {
              throw error
            }
          } finally {
            completed++
            onProgress?.(completed, items.length)
          }
        })

        // 控制并发
        const concurrentBatches = this.chunkArray(promises, maxConcurrency)
        for (const batch of concurrentBatches) {
          await Promise.all(batch)
        }
      } else {
        // 串行处理
        for (let i = 0; i < chunk.length; i++) {
          const item = chunk[i]
          const index = chunks.indexOf(chunk) * batchSize + i
          try {
            const result = await processor(item, index)
            successful.push({ item, result, index })
          } catch (error) {
            const err = error as Error
            failed.push({ item, error: err, index })
            onError?.(err, item, index)
            if (!continueOnError) {
              throw error
            }
          }

          completed++
          onProgress?.(completed, items.length)
        }
      }

      if (delay > 0 && chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    return {
      successful,
      failed,
      total: items.length,
      successCount: successful.length,
      failCount: failed.length,
      duration: Date.now() - startTime,
    }
  }

  /**
   * 数组分块
   */
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * 批量处理Map
   */
  static async processMap<K, V, R>(
    map: Map<K, V>,
    processor: (key: K, value: V, index: number) => Promise<R>,
    options: BatchOptions = {}
  ): Promise<BatchResult<[K, V], R>> {
    const items = Array.from(map.entries())
    return this.processArray(
      items,
      ([key, value], index) => processor(key, value, index),
      options
    )
  }

  /**
   * 批量处理Set
   */
  static async processSet<T, R>(
    set: Set<T>,
    processor: (item: T, index: number) => Promise<R>,
    options: BatchOptions = {}
  ): Promise<BatchResult<T, R>> {
    const items = Array.from(set)
    return this.processArray(items, processor, options)
  }
}
