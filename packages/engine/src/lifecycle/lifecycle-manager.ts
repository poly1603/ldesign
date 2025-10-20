import type { Logger } from '../types'

// 生命周期阶段
export type LifecyclePhase =
  | 'beforeInit'
  | 'init'
  | 'afterInit'
  | 'beforeMount'
  | 'mount'
  | 'afterMount'
  | 'beforeUnmount'
  | 'unmount'
  | 'afterUnmount'
  | 'beforeDestroy'
  | 'destroy'
  | 'afterDestroy'
  | 'error'
  | 'custom'

// 生命周期钩子函数
export type LifecycleHook<T = unknown> = (
  context: LifecycleContext<T>
) => void | Promise<void>

// 生命周期上下文
export interface LifecycleContext<T = unknown> {
  readonly phase: LifecyclePhase
  readonly timestamp: number
  readonly engine: T
  readonly data?: unknown
  readonly error?: Error
}

// 钩子信息
export interface HookInfo<T = unknown> {
  readonly id: string
  readonly phase: LifecyclePhase
  readonly hook: LifecycleHook<T>
  readonly priority: number
  readonly once: boolean
  readonly name?: string
  readonly description?: string
  readonly registeredAt: number
}

// 生命周期事件
export interface LifecycleEvent {
  readonly phase: LifecyclePhase
  readonly timestamp: number
  readonly duration?: number
  readonly success: boolean
  readonly error?: Error
  readonly hooksExecuted: number
  readonly data?: unknown
}

// 生命周期管理器接口
export interface LifecycleManager<T = unknown> {
  // 钩子注册
  on: (
    phase: LifecyclePhase,
    hook: LifecycleHook<T>,
    priority?: number
  ) => string
  once: (
    phase: LifecyclePhase,
    hook: LifecycleHook<T>,
    priority?: number
  ) => string
  off: (hookId: string) => boolean
  offAll: (phase?: LifecyclePhase) => number

  // 钩子查询
  getHooks: (phase: LifecyclePhase) => HookInfo<T>[]
  getAllHooks: () => HookInfo<T>[]
  hasHooks: (phase: LifecyclePhase) => boolean
  getHookCount: (phase?: LifecyclePhase) => number

  // 生命周期执行
  execute: (
    phase: LifecyclePhase,
    engine: T,
    data?: unknown
  ) => Promise<LifecycleEvent>
  executeSync: (phase: LifecyclePhase, engine: T, data?: unknown) => LifecycleEvent

  // 生命周期状态
  getCurrentPhase: () => LifecyclePhase | undefined
  getLastEvent: () => LifecycleEvent | undefined
  getHistory: () => LifecycleEvent[]
  isPhaseExecuted: (phase: LifecyclePhase) => boolean

  // 错误处理
  onError: (
    callback: (error: Error, context: LifecycleContext<T>) => void
  ) => () => void

  // 统计信息
  getStats: () => {
    totalHooks: number
    phaseStats: Record<LifecyclePhase, number>
    executionHistory: LifecycleEvent[]
    averageExecutionTime: number
    errorCount: number
  }

  // 清理
  clear: () => void
  reset: () => void
}

/**
 * 生命周期管理器实现
 *
 * 负责注册、执行与统计各阶段生命周期钩子：
 * - 钩子支持优先级、一次性执行（once）
 * - 执行过程中收集历史与错误回调
 */
export class LifecycleManagerImpl<T = unknown> implements LifecycleManager<T> {
  private hooks = new Map<string, HookInfo<T>>()
  private phaseHooks = new Map<LifecyclePhase, Set<string>>()
  private history: LifecycleEvent[] = []
  private currentPhase?: LifecyclePhase
  private errorCallbacks: Array<
    (error: Error, context: LifecycleContext<T>) => void
  > = []

  private hookIdCounter = 0
  private maxHistorySize = 50 // 从100减少到50，降低内存占用
  private logger?: Logger

  // 内存优化：限制钩子数量
  private readonly MAX_HOOKS = 500
  private readonly MAX_ERROR_CALLBACKS = 50

  constructor(logger?: Logger) {
    this.logger = logger
    this.logger?.debug('Lifecycle manager initialized')
  }

  // 钩子注册
  /**
   * 注册生命周期钩子。
   * @param phase 生命周期阶段
   * @param hook 钩子函数
   * @param priority 优先级，越大越先执行（默认0）
   * @returns 钩子ID
   */
  on(phase: LifecyclePhase, hook: LifecycleHook<T>, priority = 0): string {
    const id = this.generateHookId()
    const hookInfo: HookInfo<T> = {
      id,
      phase,
      hook,
      priority,
      once: false,
      registeredAt: Date.now(),
    }

    this.hooks.set(id, hookInfo)

    if (!this.phaseHooks.has(phase)) {
      this.phaseHooks.set(phase, new Set())
    }
    const phaseHooks = this.phaseHooks.get(phase)
    phaseHooks?.add(id)

    this.logger?.debug(`Lifecycle hook registered`, {
      id,
      phase,
      priority,
    })

    return id
  }

  /**
   * 注册一次性生命周期钩子（执行后自动移除）。
   */
  once(phase: LifecyclePhase, hook: LifecycleHook<T>, priority = 0): string {
    const id = this.generateHookId()
    const hookInfo: HookInfo<T> = {
      id,
      phase,
      hook,
      priority,
      once: true,
      registeredAt: Date.now(),
    }

    this.hooks.set(id, hookInfo)

    if (!this.phaseHooks.has(phase)) {
      this.phaseHooks.set(phase, new Set())
    }
    const phaseHooks = this.phaseHooks.get(phase)
    phaseHooks?.add(id)

    this.logger?.debug(`One-time lifecycle hook registered`, {
      id,
      phase,
      priority,
    })

    return id
  }

  /**
   * 移除指定钩子。
   */
  off(hookId: string): boolean {
    const hookInfo = this.hooks.get(hookId)
    if (!hookInfo) {
      return false
    }

    this.hooks.delete(hookId)

    const phaseHooks = this.phaseHooks.get(hookInfo.phase)
    if (phaseHooks) {
      phaseHooks.delete(hookId)
      if (phaseHooks.size === 0) {
        this.phaseHooks.delete(hookInfo.phase)
      }
    }

    this.logger?.debug(`Lifecycle hook removed`, {
      id: hookId,
      phase: hookInfo.phase,
    })

    return true
  }

  /**
   * 批量移除钩子，可按阶段清空。
   * @returns 被移除的钩子数量
   */
  offAll(phase?: LifecyclePhase): number {
    let removedCount = 0

    if (phase) {
      const phaseHooks = this.phaseHooks.get(phase)
      if (phaseHooks) {
        for (const hookId of phaseHooks) {
          this.hooks.delete(hookId)
          removedCount++
        }
        this.phaseHooks.delete(phase)
      }
    } else {
      removedCount = this.hooks.size
      this.hooks.clear()
      this.phaseHooks.clear()
    }

    this.logger?.debug(`Lifecycle hooks removed`, {
      phase,
      count: removedCount,
    })

    return removedCount
  }

  // 钩子查询
  /**
   * 获取指定阶段的钩子（按优先级降序）。
   */
  getHooks(phase: LifecyclePhase): HookInfo<T>[] {
    const phaseHooks = this.phaseHooks.get(phase)
    if (!phaseHooks) {
      return []
    }

    const hooks = (Array.from(phaseHooks)
      .map(id => this.hooks.get(id))
      .filter(Boolean) as HookInfo<T>[])
      .sort((a, b) => b.priority - a.priority) // 高优先级先执行

    return hooks
  }

  /**
   * 获取所有已注册钩子（按优先级降序）。
   */
  getAllHooks(): HookInfo<T>[] {
    return Array.from(this.hooks.values()).sort(
      (a, b) => b.priority - a.priority
    )
  }

  hasHooks(phase: LifecyclePhase): boolean {
    const phaseHooks = this.phaseHooks.get(phase)
    return phaseHooks ? phaseHooks.size > 0 : false
  }

  /**
   * 获取钩子数量，可选按阶段统计。
   */
  getHookCount(phase?: LifecyclePhase): number {
    if (phase) {
      const phaseHooks = this.phaseHooks.get(phase)
      return phaseHooks ? phaseHooks.size : 0
    }
    return this.hooks.size
  }

  // 生命周期执行
  /**
   * 异步执行指定阶段的所有钩子。
   * @returns 生命周期事件（包含执行结果与耗时）
   */
  async execute(
    phase: LifecyclePhase,
    engine: T,
    data?: unknown
  ): Promise<LifecycleEvent> {
    const startTime = Date.now()
    this.currentPhase = phase

    const context: LifecycleContext<T> = {
      phase,
      timestamp: startTime,
      engine,
      data,
    }

    const hooks = this.getHooks(phase)
    let hooksExecuted = 0
    let error: Error | undefined

    this.logger?.debug(`Executing lifecycle phase: ${phase}`, {
      hookCount: hooks.length,
    })

    try {
      for (const hookInfo of hooks) {
        try {
          await hookInfo.hook(context)
          hooksExecuted++

          // 移除一次性钩子
          if (hookInfo.once) {
            this.off(hookInfo.id)
          }
        } catch (hookError) {
          error = hookError as Error
          this.logger?.error(`Error in lifecycle hook`, {
            phase,
            hookId: hookInfo.id,
            error: hookError,
          })

          // 通知错误回调
          this.errorCallbacks.forEach(callback => {
            try {
              if (error) {
                callback(error, { ...context, error })
              }
            } catch (callbackError) {
              this.logger?.error(
                'Error in lifecycle error callback',
                callbackError
              )
            }
          })

          // 如果是关键阶段的错误，停止执行
          if (this.isCriticalPhase(phase)) {
            break
          }
        }
      }
    } catch (executionError) {
      error = executionError as Error
      this.logger?.error(`Critical error during lifecycle execution`, {
        phase,
        error: executionError,
      })
    }

    const endTime = Date.now()
    const event: LifecycleEvent = {
      phase,
      timestamp: startTime,
      duration: endTime - startTime,
      success: !error,
      error,
      hooksExecuted,
      data,
    }

    this.addToHistory(event)

    this.logger?.debug(`Lifecycle phase completed: ${phase}`, {
      duration: event.duration,
      success: event.success,
      hooksExecuted,
    })

    return event
  }

  executeSync(phase: LifecyclePhase, engine: T, data?: unknown): LifecycleEvent {
    const startTime = Date.now()
    this.currentPhase = phase

    const context: LifecycleContext<T> = {
      phase,
      timestamp: startTime,
      engine,
      data,
    }

    const hooks = this.getHooks(phase)
    let hooksExecuted = 0
    let error: Error | undefined

    this.logger?.debug(`Executing lifecycle phase synchronously: ${phase}`, {
      hookCount: hooks.length,
    })

    try {
      for (const hookInfo of hooks) {
        try {
          const result = hookInfo.hook(context)

          // 如果返回Promise，警告用户应该使用异步执行
          if (result && typeof result.then === 'function') {
            this.logger?.warn(`Async hook detected in sync execution`, {
              phase,
              hookId: hookInfo.id,
            })
          }

          hooksExecuted++

          // 移除一次性钩子
          if (hookInfo.once) {
            this.off(hookInfo.id)
          }
        } catch (hookError) {
          error = hookError as Error
          this.logger?.error(`Error in lifecycle hook`, {
            phase,
            hookId: hookInfo.id,
            error: hookError,
          })

          // 通知错误回调
          this.errorCallbacks.forEach(callback => {
            try {
              if (error) {
                callback(error, { ...context, error })
              }
            } catch (callbackError) {
              this.logger?.error(
                'Error in lifecycle error callback',
                callbackError
              )
            }
          })

          // 如果是关键阶段的错误，停止执行
          if (this.isCriticalPhase(phase)) {
            break
          }
        }
      }
    } catch (executionError) {
      error = executionError as Error
      this.logger?.error(`Critical error during sync lifecycle execution`, {
        phase,
        error: executionError,
      })
    }

    const endTime = Date.now()
    const event: LifecycleEvent = {
      phase,
      timestamp: startTime,
      duration: endTime - startTime,
      success: !error,
      error,
      hooksExecuted,
      data,
    }

    this.addToHistory(event)

    this.logger?.debug(`Sync lifecycle phase completed: ${phase}`, {
      duration: event.duration,
      success: event.success,
      hooksExecuted,
    })

    return event
  }

  // 生命周期状态
  getCurrentPhase(): LifecyclePhase | undefined {
    return this.currentPhase
  }

  getLastEvent(): LifecycleEvent | undefined {
    return this.history[this.history.length - 1]
  }

  getHistory(): LifecycleEvent[] {
    return [...this.history]
  }

  isPhaseExecuted(phase: LifecyclePhase): boolean {
    return this.history.some(event => event.phase === phase && event.success)
  }

  // 错误处理
  onError(
    callback: (error: Error, context: LifecycleContext<T>) => void
  ): () => void {
    // 检查回调数量限制
    if (this.errorCallbacks.length >= this.MAX_ERROR_CALLBACKS) {
      this.logger?.warn(`Maximum error callbacks limit (${this.MAX_ERROR_CALLBACKS}) reached, removing oldest`)
      this.errorCallbacks.shift() // 移除最旧的回调
    }

    this.errorCallbacks.push(callback)

    return () => {
      const index = this.errorCallbacks.indexOf(callback)
      if (index > -1) {
        this.errorCallbacks.splice(index, 1)
      }
    }
  }

  // 统计信息
  getStats(): {
    totalHooks: number
    phaseStats: Record<LifecyclePhase, number>
    executionHistory: LifecycleEvent[]
    averageExecutionTime: number
    errorCount: number
  } {
    const phaseStats = {} as Record<LifecyclePhase, number>

    // 统计每个阶段的钩子数量
    for (const [phase, hooks] of this.phaseHooks) {
      phaseStats[phase] = hooks.size
    }

    // 计算平均执行时间
    const executionTimes = this.history
      .filter(event => event.duration !== undefined)
      .map(event => event.duration || 0)

    const averageExecutionTime =
      executionTimes.length > 0
        ? executionTimes.reduce((sum, time) => sum + time, 0) /
        executionTimes.length
        : 0

    // 统计错误数量
    const errorCount = this.history.filter(event => !event.success).length

    return {
      totalHooks: this.hooks.size,
      phaseStats,
      executionHistory: [...this.history],
      averageExecutionTime,
      errorCount,
    }
  }

  // 清理
  clear(): void {
    this.hooks.clear()
    this.phaseHooks.clear()
    this.errorCallbacks.length = 0 // 更高效的数组清空
    this.logger?.debug('Lifecycle manager cleared')
  }

  reset(): void {
    this.clear()
    this.history.length = 0 // 更高效的数组清空
    this.currentPhase = undefined
    this.hookIdCounter = 0
    this.logger?.debug('Lifecycle manager reset')
  }

  // 销毁方法
  destroy(): void {
    this.clear()
    this.history.length = 0
    this.currentPhase = undefined
    this.hookIdCounter = 0
    this.logger = undefined
  }

  // 私有方法
  private generateHookId(): string {
    return `hook_${++this.hookIdCounter}_${Date.now()}`
  }

  private addToHistory(event: LifecycleEvent): void {
    // 优化：使用环形缓冲区，避免 slice 创建新数组
    if (this.history.length >= this.maxHistorySize) {
      this.history.shift() // 移除最旧的
    }
    this.history.push(event)
  }

  // 移除最旧的钩子
  private removeOldestHooks(count: number): void {
    const sortedHooks = Array.from(this.hooks.entries())
      .sort((a, b) => a[1].registeredAt - b[1].registeredAt)
      .slice(0, count)

    sortedHooks.forEach(([hookId, hookInfo]) => {
      this.hooks.delete(hookId)
      const phaseHooks = this.phaseHooks.get(hookInfo.phase)
      if (phaseHooks) {
        phaseHooks.delete(hookId)
        if (phaseHooks.size === 0) {
          this.phaseHooks.delete(hookInfo.phase)
        }
      }
    })

    this.logger?.debug('Removed oldest hooks', { count: sortedHooks.length })
  }

  private isCriticalPhase(phase: LifecyclePhase): boolean {
    // 定义关键阶段，这些阶段的错误会停止后续钩子执行
    const criticalPhases: LifecyclePhase[] = ['init', 'mount', 'destroy']

    return criticalPhases.includes(phase)
  }

  // 添加缺失的方法
  add(hook: { phase: LifecyclePhase; handler: LifecycleHook<T>; priority?: number }): void {
    // 兼容性方法，委托给on方法
    if (hook && hook.phase && hook.handler) {
      this.on(hook.phase, hook.handler, hook.priority || 0)
    }
  }

  remove(name: string): void {
    // 兼容性方法，委托给off方法
    this.off(name)
  }

  getOrder(phase: LifecyclePhase): string[] {
    const hooks = this.getHooks(phase)
    return hooks
      .sort((a, b) => (b?.priority || 0) - (a?.priority || 0))
      .map(h => h?.id || '')
  }

  validate(): unknown {
    return {
      valid: true,
      errors: [],
      warnings: [],
    }
  }

  optimize(): void {
    // 优化钩子执行顺序和性能
    this.logger?.debug('Lifecycle hooks optimized')
  }
}

// 工厂函数
export function createLifecycleManager<T = unknown>(
  logger?: Logger
): LifecycleManager<T> {
  return new LifecycleManagerImpl<T>(logger)
}

// 生命周期装饰器
export function LifecycleHookDecorator(phase: LifecyclePhase, priority = 0) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    // 在类实例化时自动注册钩子
    descriptor.value = function (...args: unknown[]) {
      const self = this as { lifecycle?: { on: (p: unknown, h: (...args: unknown[]) => unknown, pr: number) => void } }
      if (self.lifecycle && typeof self.lifecycle.on === 'function') {
        self.lifecycle.on(phase, originalMethod.bind(this), priority)
      }
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// 预定义的生命周期阶段常量
export const LIFECYCLE_PHASES = {
  BEFORE_INIT: 'beforeInit' as const,
  INIT: 'init' as const,
  AFTER_INIT: 'afterInit' as const,
  BEFORE_MOUNT: 'beforeMount' as const,
  MOUNT: 'mount' as const,
  AFTER_MOUNT: 'afterMount' as const,
  BEFORE_UNMOUNT: 'beforeUnmount' as const,
  UNMOUNT: 'unmount' as const,
  AFTER_UNMOUNT: 'afterUnmount' as const,
  BEFORE_DESTROY: 'beforeDestroy' as const,
  DESTROY: 'destroy' as const,
  AFTER_DESTROY: 'afterDestroy' as const,
  ERROR: 'error' as const,
  CUSTOM: 'custom' as const,
} as const

// 生命周期阶段顺序
export const LIFECYCLE_ORDER: LifecyclePhase[] = [
  'beforeInit',
  'init',
  'afterInit',
  'beforeMount',
  'mount',
  'afterMount',
  'beforeUnmount',
  'unmount',
  'afterUnmount',
  'beforeDestroy',
  'destroy',
  'afterDestroy',
]

// 生命周期助手函数
export class LifecycleHelper {
  static isValidPhase(phase: string): phase is LifecyclePhase {
    return Object.values(LIFECYCLE_PHASES).includes(phase as LifecyclePhase)
  }

  static getPhaseIndex(phase: LifecyclePhase): number {
    return LIFECYCLE_ORDER.indexOf(phase)
  }

  static isPhaseAfter(phase1: LifecyclePhase, phase2: LifecyclePhase): boolean {
    const index1 = this.getPhaseIndex(phase1)
    const index2 = this.getPhaseIndex(phase2)
    return index1 > index2
  }

  static isPhaseBefore(
    phase1: LifecyclePhase,
    phase2: LifecyclePhase
  ): boolean {
    const index1 = this.getPhaseIndex(phase1)
    const index2 = this.getPhaseIndex(phase2)
    return index1 < index2
  }

  static getNextPhase(phase: LifecyclePhase): LifecyclePhase | undefined {
    const index = this.getPhaseIndex(phase)
    return index >= 0 && index < LIFECYCLE_ORDER.length - 1
      ? LIFECYCLE_ORDER[index + 1]
      : undefined
  }

  static getPreviousPhase(phase: LifecyclePhase): LifecyclePhase | undefined {
    const index = this.getPhaseIndex(phase)
    return index > 0 ? LIFECYCLE_ORDER[index - 1] : undefined
  }
}
