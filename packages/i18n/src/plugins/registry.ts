/**
 * 插件注册表
 *
 * 提供：
 * - 插件注册和管理
 * - 插件生命周期管理
 * - 插件依赖解析
 * - 插件配置管理
 * - 插件热重载
 */

import type { I18nInstance } from '../core/types'

/**
 * 插件接口
 */
export interface I18nPlugin {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件描述 */
  description?: string
  /** 插件作者 */
  author?: string
  /** 插件依赖 */
  dependencies?: string[]
  /** 插件配置 */
  config?: Record<string, any>
  /** 插件安装函数 */
  install: (i18n: I18nInstance, options?: any) => void | Promise<void>
  /** 插件卸载函数 */
  uninstall?: (i18n: I18nInstance) => void | Promise<void>
  /** 插件启用函数 */
  enable?: (i18n: I18nInstance) => void | Promise<void>
  /** 插件禁用函数 */
  disable?: (i18n: I18nInstance) => void | Promise<void>
}

/**
 * 插件状态
 */
export enum PluginStatus {
  UNINSTALLED = 'uninstalled',
  INSTALLED = 'installed',
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  ERROR = 'error',
}

/**
 * 插件信息
 */
export interface PluginInfo {
  plugin: I18nPlugin
  status: PluginStatus
  error?: Error
  installTime?: number
  enableTime?: number
}

/**
 * 插件事件
 */
export interface PluginEvents {
  'plugin:install': (name: string, plugin: I18nPlugin) => void
  'plugin:uninstall': (name: string) => void
  'plugin:enable': (name: string) => void
  'plugin:disable': (name: string) => void
  'plugin:error': (name: string, error: Error) => void
}

/**
 * 插件注册表
 */
export class PluginRegistry {
  private plugins = new Map<string, PluginInfo>()
  private i18n: I18nInstance
  private eventHandlers = new Map<keyof PluginEvents, Set<(...args: any[]) => void>>()

  constructor(i18n: I18nInstance) {
    this.i18n = i18n
  }

  /**
   * 注册插件
   */
  async register(plugin: I18nPlugin, options?: any): Promise<void> {
    const { name } = plugin

    if (this.plugins.has(name)) {
      throw new Error(`Plugin "${name}" is already registered`)
    }

    // 检查依赖
    await this.checkDependencies(plugin)

    try {
      // 安装插件
      await plugin.install(this.i18n, options)

      // 记录插件信息
      this.plugins.set(name, {
        plugin,
        status: PluginStatus.INSTALLED,
        installTime: Date.now(),
      })

      // 触发事件
      this.emit('plugin:install', name, plugin)

      // 自动启用插件
      await this.enable(name)
    }
    catch (error) {
      this.plugins.set(name, {
        plugin,
        status: PluginStatus.ERROR,
        error: error as Error,
      })

      this.emit('plugin:error', name, error as Error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  async unregister(name: string): Promise<void> {
    const pluginInfo = this.plugins.get(name)
    if (!pluginInfo) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    try {
      // 先禁用插件
      if (pluginInfo.status === PluginStatus.ENABLED) {
        await this.disable(name)
      }

      // 卸载插件
      if (pluginInfo.plugin.uninstall) {
        await pluginInfo.plugin.uninstall(this.i18n)
      }

      // 移除插件
      this.plugins.delete(name)

      // 触发事件
      this.emit('plugin:uninstall', name)
    }
    catch (error) {
      pluginInfo.status = PluginStatus.ERROR
      pluginInfo.error = error as Error

      this.emit('plugin:error', name, error as Error)
      throw error
    }
  }

  /**
   * 启用插件
   */
  async enable(name: string): Promise<void> {
    const pluginInfo = this.plugins.get(name)
    if (!pluginInfo) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    if (pluginInfo.status === PluginStatus.ENABLED) {
      return
    }

    try {
      // 启用插件
      if (pluginInfo.plugin.enable) {
        await pluginInfo.plugin.enable(this.i18n)
      }

      // 更新状态
      pluginInfo.status = PluginStatus.ENABLED
      pluginInfo.enableTime = Date.now()

      // 触发事件
      this.emit('plugin:enable', name)
    }
    catch (error) {
      pluginInfo.status = PluginStatus.ERROR
      pluginInfo.error = error as Error

      this.emit('plugin:error', name, error as Error)
      throw error
    }
  }

  /**
   * 禁用插件
   */
  async disable(name: string): Promise<void> {
    const pluginInfo = this.plugins.get(name)
    if (!pluginInfo) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    if (pluginInfo.status !== PluginStatus.ENABLED) {
      return
    }

    try {
      // 禁用插件
      if (pluginInfo.plugin.disable) {
        await pluginInfo.plugin.disable(this.i18n)
      }

      // 更新状态
      pluginInfo.status = PluginStatus.DISABLED

      // 触发事件
      this.emit('plugin:disable', name)
    }
    catch (error) {
      pluginInfo.status = PluginStatus.ERROR
      pluginInfo.error = error as Error

      this.emit('plugin:error', name, error as Error)
      throw error
    }
  }

  /**
   * 获取插件信息
   */
  getPlugin(name: string): PluginInfo | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Map<string, PluginInfo> {
    return new Map(this.plugins)
  }

  /**
   * 获取已启用的插件
   */
  getEnabledPlugins(): Map<string, PluginInfo> {
    const enabled = new Map<string, PluginInfo>()
    for (const [name, info] of this.plugins) {
      if (info.status === PluginStatus.ENABLED) {
        enabled.set(name, info)
      }
    }
    return enabled
  }

  /**
   * 检查插件是否已注册
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 检查插件是否已启用
   */
  isEnabled(name: string): boolean {
    const pluginInfo = this.plugins.get(name)
    return pluginInfo?.status === PluginStatus.ENABLED
  }

  /**
   * 检查依赖
   */
  private async checkDependencies(plugin: I18nPlugin): Promise<void> {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return
    }

    for (const dependency of plugin.dependencies) {
      const dependencyInfo = this.plugins.get(dependency)
      if (!dependencyInfo) {
        throw new Error(`Plugin "${plugin.name}" requires dependency "${dependency}" which is not installed`)
      }

      if (dependencyInfo.status !== PluginStatus.ENABLED) {
        throw new Error(`Plugin "${plugin.name}" requires dependency "${dependency}" to be enabled`)
      }
    }
  }

  /**
   * 事件监听
   */
  on<K extends keyof PluginEvents>(event: K, handler: PluginEvents[K]): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof PluginEvents>(event: K, handler: PluginEvents[K]): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof PluginEvents>(event: K, ...args: Parameters<PluginEvents[K]>): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      for (const handler of handlers) {
        try {
          (handler as any)(...args)
        }
        catch (error) {
          console.error(`Error in plugin event handler for "${event}":`, error)
        }
      }
    }
  }

  /**
   * 清理所有插件
   */
  async cleanup(): Promise<void> {
    const pluginNames = Array.from(this.plugins.keys())

    for (const name of pluginNames) {
      try {
        await this.unregister(name)
      }
      catch (error) {
        console.error(`Error unregistering plugin "${name}":`, error)
      }
    }

    this.eventHandlers.clear()
  }

  /**
   * 获取插件统计信息
   */
  getStats(): {
    total: number
    enabled: number
    disabled: number
    error: number
  } {
    let enabled = 0
    let disabled = 0
    let error = 0

    for (const info of this.plugins.values()) {
      switch (info.status) {
        case PluginStatus.ENABLED:
          enabled++
          break
        case PluginStatus.DISABLED:
        case PluginStatus.INSTALLED:
          disabled++
          break
        case PluginStatus.ERROR:
          error++
          break
      }
    }

    return {
      total: this.plugins.size,
      enabled,
      disabled,
      error,
    }
  }
}

/**
 * 创建插件注册表
 */
export function createPluginRegistry(i18n: I18nInstance): PluginRegistry {
  return new PluginRegistry(i18n)
}
