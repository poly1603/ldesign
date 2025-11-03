/**
 * 生命周期管理器实现
 * 负责生命周期钩子的注册和执行
 */

import type {
  HookInfo,
  LifecycleContext,
  LifecycleEvent,
  LifecycleHook,
  LifecycleManager,
  LifecyclePhase,
} from '../types'

export class CoreLifecycleManager<T = unknown> implements LifecycleManager<T> {
  private hooks = new Map<LifecyclePhase, Map<string, HookInfo<T>>>()
  private history: LifecycleEvent[] = []
  private currentPhase?: LifecyclePhase
  private lastEvent?: LifecycleEvent
  private errorCallbacks: Array<(error: Error, context: LifecycleContext<T>) => void> = []
  private hookIdCounter = 0

  /**
   * 注册钩子
   */
  on(phase: LifecyclePhase, hook: LifecycleHook<T>, priority = 0): string {
    return this.registerHook(phase, hook, priority, false)
  }

  /**
   * 注册一次性钩子
   */
  once(phase: LifecyclePhase, hook: LifecycleHook<T>, priority = 0): string {
    return this.registerHook(phase, hook, priority, true)
  }

  /**
   * 注册钩子（内部方法）
   */
  private registerHook(
    phase: LifecyclePhase,
    hook: LifecycleHook<T>,
    priority: number,
    once: boolean
  ): string {
    if (!this.hooks.has(phase)) {
      this.hooks.set(phase, new Map())
    }

    const id = `hook_${phase}_${this.hookIdCounter++}`
    const hookInfo: HookInfo<T> = {
      id,
      phase,
      hook,
      priority,
      once,
      registeredAt: Date.now(),
    }

    this.hooks.get(phase)!.set(id, hookInfo)
    return id
  }

  /**
   * 移除钩子
   */
  off(hookId: string): boolean {
    for (const phaseHooks of this.hooks.values()) {
      if (phaseHooks.has(hookId)) {
        phaseHooks.delete(hookId)
        return true
      }
    }
    return false
  }

  /**
   * 移除所有钩子
   */
  offAll(phase?: LifecyclePhase): number {
    if (phase) {
      const phaseHooks = this.hooks.get(phase)
      if (!phaseHooks) return 0
      const count = phaseHooks.size
      phaseHooks.clear()
      return count
    }

    let count = 0
    this.hooks.forEach(phaseHooks => {
      count += phaseHooks.size
      phaseHooks.clear()
    })
    return count
  }

  /**
   * 获取指定阶段的钩子
   */
  getHooks(phase: LifecyclePhase): HookInfo<T>[] {
    const phaseHooks = this.hooks.get(phase)
    if (!phaseHooks) return []

    return Array.from(phaseHooks.values()).sort((a, b) => b.priority - a.priority)
  }

  /**
   * 获取所有钩子
   */
  getAllHooks(): HookInfo<T>[] {
    const allHooks: HookInfo<T>[] = []
    this.hooks.forEach(phaseHooks => {
      allHooks.push(...phaseHooks.values())
    })
    return allHooks
  }

  /**
   * 检查是否有钩子
   */
  hasHooks(phase: LifecyclePhase): boolean {
    const phaseHooks = this.hooks.get(phase)
    return phaseHooks ? phaseHooks.size > 0 : false
  }

  /**
   * 获取钩子数量
   */
  getHookCount(phase?: LifecyclePhase): number {
    if (phase) {
      const phaseHooks = this.hooks.get(phase)
      return phaseHooks ? phaseHooks.size : 0
    }

    let count = 0
    this.hooks.forEach(phaseHooks => {
      count += phaseHooks.size
    })
    return count
  }

  /**
   * 执行生命周期
   */
  async execute(phase: LifecyclePhase, engine: T, data?: unknown): Promise<LifecycleEvent> {
    const startTime = Date.now()
    this.currentPhase = phase

    const context: LifecycleContext<T> = {
      phase,
      timestamp: startTime,
      engine,
      data,
    }

    const hooks = this.getHooks(phase)
    let success = true
    let error: Error | undefined

    try {
      for (const hookInfo of hooks) {
        try {
          await hookInfo.hook(context)

          // 如果是一次性钩子，执行后移除
          if (hookInfo.once) {
            this.off(hookInfo.id)
          }
        } catch (err) {
          error = err as Error
          success = false

          // 调用错误回调
          this.errorCallbacks.forEach(callback => {
            try {
              callback(error!, { ...context, error })
            } catch (callbackError) {
              console.error('Error in lifecycle error callback:', callbackError)
            }
          })

          break
        }
      }
    } catch (err) {
      error = err as Error
      success = false
    }

    const endTime = Date.now()
    const event: LifecycleEvent = {
      phase,
      timestamp: startTime,
      duration: endTime - startTime,
      success,
      error,
      hooksExecuted: hooks.length,
      data,
    }

    this.lastEvent = event
    this.history.push(event)

    return event
  }

  /**
   * 获取当前阶段
   */
  getCurrentPhase(): LifecyclePhase | undefined {
    return this.currentPhase
  }

  /**
   * 获取最后一个事件
   */
  getLastEvent(): LifecycleEvent | undefined {
    return this.lastEvent
  }

  /**
   * 获取历史记录
   */
  getHistory(): LifecycleEvent[] {
    return [...this.history]
  }

  /**
   * 注册错误处理回调
   */
  onError(callback: (error: Error, context: LifecycleContext<T>) => void): () => void {
    this.errorCallbacks.push(callback)
    return () => {
      const index = this.errorCallbacks.indexOf(callback)
      if (index !== -1) {
        this.errorCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    // 初始化逻辑（如果需要）
  }

  /**
   * 销毁
   */
  async destroy(): Promise<void> {
    this.hooks.clear()
    this.history = []
    this.errorCallbacks = []
    this.currentPhase = undefined
    this.lastEvent = undefined
  }
}

/**
 * 创建生命周期管理器
 */
export function createLifecycleManager<T = unknown>(): LifecycleManager<T> {
  return new CoreLifecycleManager<T>()
}

