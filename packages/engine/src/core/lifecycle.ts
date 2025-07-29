import type { ILifecycle, LifecycleHandler, LifecyclePhase } from '../types'
import { createLogger } from '../utils'

/**
 * 生命周期管理器实现
 */
export class Lifecycle implements ILifecycle {
  private readonly hooks = new Map<LifecyclePhase, Set<LifecycleHandler>>()
  private readonly logger = createLogger('Lifecycle')
  private currentPhase: LifecyclePhase | null = null

  /**
   * 注册生命周期钩子
   */
  hook(phase: LifecyclePhase, handler: LifecycleHandler): void {
    if (!this.hooks.has(phase)) {
      this.hooks.set(phase, new Set())
    }
    this.hooks.get(phase)!.add(handler)
    this.logger.debug(`Registered hook for phase: ${phase}`)
  }

  /**
   * 执行生命周期钩子
   */
  async execute(phase: LifecyclePhase, ...args: any[]): Promise<void> {
    this.currentPhase = phase
    this.logger.debug(`Executing lifecycle phase: ${phase}`, args)

    const handlers = this.hooks.get(phase)
    if (!handlers || handlers.size === 0) {
      this.logger.debug(`No handlers for phase: ${phase}`)
      return
    }

    const promises: Promise<void>[] = []
    
    for (const handler of handlers) {
      try {
        const result = handler(...args)
        if (result instanceof Promise) {
          promises.push(result)
        }
      } catch (error) {
        this.logger.error(`Error in lifecycle handler for ${phase}:`, error)
        throw error
      }
    }

    // 等待所有异步处理器完成
    if (promises.length > 0) {
      try {
        await Promise.all(promises)
      } catch (error) {
        this.logger.error(`Error in async lifecycle handlers for ${phase}:`, error)
        throw error
      }
    }

    this.logger.debug(`Completed lifecycle phase: ${phase}`)
  }

  /**
   * 获取当前阶段
   */
  getCurrentPhase(): LifecyclePhase | null {
    return this.currentPhase
  }

  /**
   * 移除生命周期钩子
   */
  unhook(phase: LifecyclePhase, handler?: LifecycleHandler): void {
    if (handler) {
      this.hooks.get(phase)?.delete(handler)
      this.logger.debug(`Removed specific hook for phase: ${phase}`)
    } else {
      this.hooks.delete(phase)
      this.logger.debug(`Removed all hooks for phase: ${phase}`)
    }
  }

  /**
   * 清空所有钩子
   */
  clear(): void {
    this.hooks.clear()
    this.currentPhase = null
    this.logger.debug('Cleared all lifecycle hooks')
  }

  /**
   * 获取指定阶段的钩子数量
   */
  getHookCount(phase: LifecyclePhase): number {
    return this.hooks.get(phase)?.size || 0
  }

  /**
   * 获取所有已注册的阶段
   */
  getRegisteredPhases(): LifecyclePhase[] {
    return Array.from(this.hooks.keys())
  }
}