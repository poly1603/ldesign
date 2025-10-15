/**
 * 生命周期管理器
 * 
 * 管理模板系统的生命周期钩子
 */

import type { LifecycleHooks, TemplateId } from '../types'
import type { Component } from 'vue'

/**
 * 生命周期管理器类
 */
export class LifecycleManager {
  private hooks: LifecycleHooks = {}

  /**
   * 注册钩子
   */
  registerHooks(hooks: LifecycleHooks): void {
    this.hooks = {
      ...this.hooks,
      ...hooks,
    }
  }

  /**
   * 注册单个钩子
   */
  registerHook<K extends keyof LifecycleHooks>(
    name: K,
    hook: LifecycleHooks[K]
  ): void {
    this.hooks[name] = hook
  }

  /**
   * 移除钩子
   */
  removeHook(name: keyof LifecycleHooks): void {
    delete this.hooks[name]
  }

  /**
   * 清空所有钩子
   */
  clearHooks(): void {
    this.hooks = {}
  }

  /**
   * 触发 onBeforeLoad 钩子
   */
  async onBeforeLoad(id: TemplateId): Promise<void> {
    if (this.hooks.onBeforeLoad) {
      await this.hooks.onBeforeLoad(id)
    }
  }

  /**
   * 触发 onAfterLoad 钩子
   */
  async onAfterLoad(id: TemplateId, component: Component): Promise<void> {
    if (this.hooks.onAfterLoad) {
      await this.hooks.onAfterLoad(id, component)
    }
  }

  /**
   * 触发 onError 钩子
   */
  async onError(id: TemplateId, error: Error): Promise<void> {
    if (this.hooks.onError) {
      await this.hooks.onError(id, error)
    }
  }

  /**
   * 触发 onBeforeSwitch 钩子
   */
  async onBeforeSwitch(from: TemplateId | null, to: TemplateId): Promise<void> {
    if (this.hooks.onBeforeSwitch) {
      await this.hooks.onBeforeSwitch(from, to)
    }
  }

  /**
   * 触发 onAfterSwitch 钩子
   */
  async onAfterSwitch(from: TemplateId | null, to: TemplateId): Promise<void> {
    if (this.hooks.onAfterSwitch) {
      await this.hooks.onAfterSwitch(from, to)
    }
  }

  /**
   * 触发 onCacheEvict 钩子
   */
  async onCacheEvict(id: TemplateId): Promise<void> {
    if (this.hooks.onCacheEvict) {
      await this.hooks.onCacheEvict(id)
    }
  }

  /**
   * 触发钩子（通用方法）
   */
  async emit(hookName: keyof LifecycleHooks, ...args: any[]): Promise<void> {
    const hook = this.hooks[hookName]
    if (hook) {
      try {
        await (hook as any)(...args)
      } catch (error) {
        console.error(`[Lifecycle] Error in hook "${hookName}":`, error)
      }
    }
  }

  /**
   * 获取所有钩子
   */
  getHooks(): LifecycleHooks {
    return { ...this.hooks }
  }

  /**
   * 检查是否有某个钩子
   */
  hasHook(name: keyof LifecycleHooks): boolean {
    return !!this.hooks[name]
  }
}

// 单例实例
let instance: LifecycleManager | null = null

/**
 * 获取生命周期管理器实例
 */
export function getLifecycle(): LifecycleManager {
  if (!instance) {
    instance = new LifecycleManager()
  }
  return instance
}

/**
 * 重置生命周期管理器
 */
export function resetLifecycle(): void {
  if (instance) {
    instance.clearHooks()
    instance = null
  }
}
