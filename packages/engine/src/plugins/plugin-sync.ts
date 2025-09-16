/**
 * 插件同步机制
 * 确保关键插件在应用渲染前完全初始化
 */

import type { Plugin } from '../types'

/**
 * 插件就绪状态管理
 */
export class PluginReadinessManager {
  private readyPlugins = new Set<string>()
  private pendingPlugins = new Map<string, Promise<void>>()
  private criticalPlugins = new Set<string>(['i18n', 'router', 'store'])
  private readyCallbacks: Array<() => void> = []
  private isAllReady = false

  /**
   * 标记插件为关键插件
   */
  markCritical(pluginName: string): void {
    this.criticalPlugins.add(pluginName)
  }

  /**
   * 注册插件初始化
   */
  registerPlugin(pluginName: string, initPromise?: Promise<void>): void {
    if (initPromise) {
      this.pendingPlugins.set(pluginName, initPromise)
      initPromise.then(() => {
        this.markReady(pluginName)
      }).catch((error) => {
        console.error(`Plugin ${pluginName} initialization failed:`, error)
        // 即使失败也标记为就绪，避免阻塞
        this.markReady(pluginName)
      })
    } else {
      // 如果没有异步初始化，直接标记为就绪
      this.markReady(pluginName)
    }
  }

  /**
   * 标记插件已就绪
   */
  markReady(pluginName: string): void {
    this.readyPlugins.add(pluginName)
    this.pendingPlugins.delete(pluginName)
    this.checkAllReady()
  }

  /**
   * 检查所有关键插件是否就绪
   */
  private checkAllReady(): void {
    // 检查所有关键插件是否都已就绪
    const allCriticalReady = Array.from(this.criticalPlugins).every(
      name => this.readyPlugins.has(name) || !this.pendingPlugins.has(name)
    )

    if (allCriticalReady && !this.isAllReady) {
      this.isAllReady = true
      // 触发所有就绪回调
      this.readyCallbacks.forEach(callback => {
        try {
          callback()
        } catch (error) {
          console.error('Ready callback error:', error)
        }
      })
      this.readyCallbacks = []
    }
  }

  /**
   * 等待所有关键插件就绪
   */
  async waitForCriticalPlugins(): Promise<void> {
    // 获取所有关键插件的待处理Promise
    const criticalPending = Array.from(this.criticalPlugins)
      .map(name => this.pendingPlugins.get(name))
      .filter((p): p is Promise<void> => p !== undefined)

    if (criticalPending.length === 0) {
      // 所有关键插件都已就绪
      return
    }

    // 等待所有关键插件初始化完成
    await Promise.allSettled(criticalPending)
  }

  /**
   * 当所有关键插件就绪时执行回调
   */
  onAllReady(callback: () => void): void {
    if (this.isAllReady) {
      // 如果已经就绪，立即执行
      callback()
    } else {
      // 否则添加到回调列表
      this.readyCallbacks.push(callback)
    }
  }

  /**
   * 检查特定插件是否就绪
   */
  isPluginReady(pluginName: string): boolean {
    return this.readyPlugins.has(pluginName)
  }

  /**
   * 检查是否所有关键插件都已就绪
   */
  areAllCriticalPluginsReady(): boolean {
    return this.isAllReady
  }

  /**
   * 获取待处理的插件列表
   */
  getPendingPlugins(): string[] {
    return Array.from(this.pendingPlugins.keys())
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.readyPlugins.clear()
    this.pendingPlugins.clear()
    this.readyCallbacks = []
    this.isAllReady = false
  }
}

// 全局插件就绪管理器实例
export const pluginReadinessManager = new PluginReadinessManager()

/**
 * 确保插件同步初始化的装饰器
 */
export function ensureSyncInit(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    // 等待关键插件就绪
    await pluginReadinessManager.waitForCriticalPlugins()
    // 执行原始方法
    return originalMethod.apply(this, args)
  }

  return descriptor
}

/**
 * 插件初始化辅助函数
 */
export function initializePluginSync(plugin: Plugin & { initSync?: () => void }): void {
  if (typeof plugin.initSync === 'function') {
    // 如果插件提供同步初始化方法，使用它
    plugin.initSync()
    pluginReadinessManager.markReady(plugin.name)
  } else if (typeof plugin.install === 'function') {
    // 否则尝试同步执行 install
    const result = plugin.install({} as any)
    if (result && typeof result.then === 'function') {
      // 如果返回 Promise，注册到管理器
      pluginReadinessManager.registerPlugin(plugin.name, result)
    } else {
      // 同步完成，标记为就绪
      pluginReadinessManager.markReady(plugin.name)
    }
  } else {
    // 没有初始化方法，直接标记为就绪
    pluginReadinessManager.markReady(plugin.name)
  }
}

/**
 * 批量初始化插件
 */
export async function batchInitializePlugins(plugins: Plugin[]): Promise<void> {
  // 先同步初始化所有能同步初始化的插件
  for (const plugin of plugins) {
    initializePluginSync(plugin)
  }

  // 然后等待所有关键插件就绪
  await pluginReadinessManager.waitForCriticalPlugins()
}