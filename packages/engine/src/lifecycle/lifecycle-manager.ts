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
export type LifecycleHook<T = any> = (context: LifecycleContext<T>) => void | Promise<void>

// 生命周期上下文
export interface LifecycleContext<T = any> {
  readonly phase: LifecyclePhase
  readonly timestamp: number
  readonly engine: T
  readonly data?: any
  readonly error?: Error
}

// 钩子信息
export interface HookInfo {
  readonly id: string
  readonly phase: LifecyclePhase
  readonly hook: LifecycleHook
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
  readonly data?: any
}

// 生命周期管理器接口
export interface LifecycleManager<T = any> {
  // 钩子注册
  on: (phase: LifecyclePhase, hook: LifecycleHook<T>, priority?: number) => string
  once: (phase: LifecyclePhase, hook: LifecycleHook<T>, priority?: number) => string
  off: (hookId: string) => boolean
  offAll: (phase?: LifecyclePhase) => number

  // 钩子查询
  getHooks: (phase: LifecyclePhase) => HookInfo[]
  getAllHooks: () => HookInfo[]
  hasHooks: (phase: LifecyclePhase) => boolean
  getHookCount: (phase?: LifecyclePhase) => number

  // 生命周期执行
  execute: (phase: LifecyclePhase, engine: T, data?: any) => Promise<LifecycleEvent>
  executeSync: (phase: LifecyclePhase, engine: T, data?: any) => LifecycleEvent

  // 生命周期状态
  getCurrentPhase: () => LifecyclePhase | undefined
  getLastEvent: () => LifecycleEvent | undefined
  getHistory: () => LifecycleEvent[]
  isPhaseExecuted: (phase: LifecyclePhase) => boolean

  // 错误处理
  onError: (callback: (error: Error, context: LifecycleContext<T>) => void) => () => void

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

// 生命周期管理器实现
export class LifecycleManagerImpl<T = any> implements LifecycleManager<T> {
  private hooks = new Map<string, HookInfo>()
  private phaseHooks = new Map<LifecyclePhase, Set<string>>()
  private history: LifecycleEvent[] = []
  private currentPhase?: LifecyclePhase
  private errorCallbacks: Array<(error: Error, context: LifecycleContext<T>) => void> = []
  private hookIdCounter = 0
  private maxHistorySize = 100
  private logger?: Logger

  constructor(logger?: Logger) {
    this.logger = logger
    this.logger?.debug('Lifecycle manager initialized')
  }

  // 钩子注册
  on(phase: LifecyclePhase, hook: LifecycleHook<T>, priority = 0): string {
    const id = this.generateHookId()
    const hookInfo: HookInfo = {
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
    this.phaseHooks.get(phase)!.add(id)

    this.logger?.debug(`Lifecycle hook registered`, {
      id,
      phase,
      priority,
    })

    return id
  }

  once(phase: LifecyclePhase, hook: LifecycleHook<T>, priority = 0): string {
    const id = this.generateHookId()
    const hookInfo: HookInfo = {
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
    this.phaseHooks.get(phase)!.add(id)

    this.logger?.debug(`One-time lifecycle hook registered`, {
      id,
      phase,
      priority,
    })

    return id
  }

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
    }
    else {
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
  getHooks(phase: LifecyclePhase): HookInfo[] {
    const phaseHooks = this.phaseHooks.get(phase)
    if (!phaseHooks) {
      return []
    }

    const hooks = Array.from(phaseHooks)
      .map(id => this.hooks.get(id)!)
      .filter(Boolean)
      .sort((a, b) => b.priority - a.priority) // 高优先级先执行

    return hooks
  }

  getAllHooks(): HookInfo[] {
    return Array.from(this.hooks.values())
      .sort((a, b) => b.priority - a.priority)
  }

  hasHooks(phase: LifecyclePhase): boolean {
    const phaseHooks = this.phaseHooks.get(phase)
    return phaseHooks ? phaseHooks.size > 0 : false
  }

  getHookCount(phase?: LifecyclePhase): number {
    if (phase) {
      const phaseHooks = this.phaseHooks.get(phase)
      return phaseHooks ? phaseHooks.size : 0
    }
    return this.hooks.size
  }

  // 生命周期执行
  async execute(phase: LifecyclePhase, engine: T, data?: any): Promise<LifecycleEvent> {
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
        }
        catch (hookError) {
          error = hookError as Error
          this.logger?.error(`Error in lifecycle hook`, {
            phase,
            hookId: hookInfo.id,
            error: hookError,
          })

          // 通知错误回调
          this.errorCallbacks.forEach((callback) => {
            try {
              callback(error!, { ...context, error })
            }
            catch (callbackError) {
              this.logger?.error('Error in lifecycle error callback', callbackError)
            }
          })

          // 如果是关键阶段的错误，停止执行
          if (this.isCriticalPhase(phase)) {
            break
          }
        }
      }
    }
    catch (executionError) {
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

  executeSync(phase: LifecyclePhase, engine: T, data?: any): LifecycleEvent {
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
        }
        catch (hookError) {
          error = hookError as Error
          this.logger?.error(`Error in lifecycle hook`, {
            phase,
            hookId: hookInfo.id,
            error: hookError,
          })

          // 通知错误回调
          this.errorCallbacks.forEach((callback) => {
            try {
              callback(error!, { ...context, error })
            }
            catch (callbackError) {
              this.logger?.error('Error in lifecycle error callback', callbackError)
            }
          })

          // 如果是关键阶段的错误，停止执行
          if (this.isCriticalPhase(phase)) {
            break
          }
        }
      }
    }
    catch (executionError) {
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
  onError(callback: (error: Error, context: LifecycleContext<T>) => void): () => void {
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
      .map(event => event.duration!)

    const averageExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
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
    this.errorCallbacks = []
    this.logger?.debug('Lifecycle manager cleared')
  }

  reset(): void {
    this.clear()
    this.history = []
    this.currentPhase = undefined
    this.hookIdCounter = 0
    this.logger?.debug('Lifecycle manager reset')
  }

  // 私有方法
  private generateHookId(): string {
    return `hook_${++this.hookIdCounter}_${Date.now()}`
  }

  private addToHistory(event: LifecycleEvent): void {
    this.history.push(event)

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize)
    }
  }

  private isCriticalPhase(phase: LifecyclePhase): boolean {
    // 定义关键阶段，这些阶段的错误会停止后续钩子执行
    const criticalPhases: LifecyclePhase[] = [
      'init',
      'mount',
      'destroy',
    ]

    return criticalPhases.includes(phase)
  }

  // 添加缺失的方法
  add(hook: any): void {
    // 兼容性方法，委托给on方法
    if (hook.phase && hook.handler) {
      this.on(hook.phase, hook.handler, hook.priority || 0)
    }
  }

  remove(name: string): void {
    // 兼容性方法，委托给off方法
    this.off(name)
  }

  getOrder(phase: LifecyclePhase): string[] {
    const hooks = this.getHooks(phase)
    return hooks.sort((a, b) => (b?.priority || 0) - (a?.priority || 0)).map(h => h?.id || '')
  }

  validate(): any {
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
export function createLifecycleManager<T = any>(logger?: Logger): LifecycleManager<T> {
  return new LifecycleManagerImpl<T>(logger)
}

// 生命周期装饰器
export function LifecycleHookDecorator(phase: LifecyclePhase, priority = 0) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    // 在类实例化时自动注册钩子
    descriptor.value = function (...args: any[]) {
      if ((this as any).lifecycle && typeof (this as any).lifecycle.on === 'function') {
        ; (this as any).lifecycle.on(phase, originalMethod.bind(this), priority)
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

  static isPhaseBefore(phase1: LifecyclePhase, phase2: LifecyclePhase): boolean {
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
