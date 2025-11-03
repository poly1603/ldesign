/**
 * 生命周期系统类型定义
 */

/**
 * 生命周期阶段
 */
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

/**
 * 生命周期上下文
 */
export interface LifecycleContext<T = unknown> {
  readonly phase: LifecyclePhase
  readonly timestamp: number
  readonly engine: T
  readonly data?: unknown
  readonly error?: Error
}

/**
 * 生命周期钩子函数
 */
export type LifecycleHook<T = unknown> = (
  context: LifecycleContext<T>
) => void | Promise<void>

/**
 * 钩子信息
 */
export interface HookInfo<T = unknown> {
  readonly id: string
  readonly phase: LifecyclePhase
  readonly hook: LifecycleHook<T>
  readonly priority: number
  readonly once: boolean
  readonly name?: string
  readonly registeredAt: number
}

/**
 * 生命周期事件
 */
export interface LifecycleEvent {
  readonly phase: LifecyclePhase
  readonly timestamp: number
  readonly duration?: number
  readonly success: boolean
  readonly error?: Error
  readonly hooksExecuted: number
  readonly data?: unknown
}

/**
 * 生命周期管理器接口
 */
export interface LifecycleManager<T = unknown> {
  /** 注册钩子 */
  on: (
    phase: LifecyclePhase,
    hook: LifecycleHook<T>,
    priority?: number
  ) => string
  /** 注册一次性钩子 */
  once: (
    phase: LifecyclePhase,
    hook: LifecycleHook<T>,
    priority?: number
  ) => string
  /** 移除钩子 */
  off: (hookId: string) => boolean
  /** 移除所有钩子 */
  offAll: (phase?: LifecyclePhase) => number

  /** 钩子查询 */
  getHooks: (phase: LifecyclePhase) => HookInfo<T>[]
  getAllHooks: () => HookInfo<T>[]
  hasHooks: (phase: LifecyclePhase) => boolean
  getHookCount: (phase?: LifecyclePhase) => number

  /** 生命周期执行 */
  execute: (
    phase: LifecyclePhase,
    engine: T,
    data?: unknown
  ) => Promise<LifecycleEvent>

  /** 生命周期状态 */
  getCurrentPhase: () => LifecyclePhase | undefined
  getLastEvent: () => LifecycleEvent | undefined
  getHistory: () => LifecycleEvent[]

  /** 错误处理 */
  onError: (
    callback: (error: Error, context: LifecycleContext<T>) => void
  ) => () => void

  /** 初始化和销毁 */
  init?(): Promise<void>
  destroy?(): Promise<void>
}

