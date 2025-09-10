/**
 * 插件注册表
 * 管理所有可用的插件，提供插件的注册和获取功能
 */

import type { IPlugin } from '../types'
import { BoldPlugin, ItalicPlugin, UnderlinePlugin } from './format'
import { HeadingPlugin, ListPlugin, BlockquotePlugin } from './block'
import { ImagePlugin, LinkPlugin } from './media'

/**
 * 插件注册表类
 * 提供插件的注册、获取和管理功能
 */
export class PluginRegistry {
  /** 插件构造函数映射表 */
  private static pluginConstructors: Map<string, new () => IPlugin> = new Map()

  /** 插件实例缓存 */
  private static pluginInstances: Map<string, IPlugin> = new Map()

  /**
   * 注册插件构造函数
   * @param name 插件名称
   * @param constructor 插件构造函数
   */
  static registerConstructor(name: string, constructor: new () => IPlugin): void {
    if (this.pluginConstructors.has(name)) {
      console.warn(`Plugin constructor "${name}" is already registered. Overwriting.`)
    }

    this.pluginConstructors.set(name, constructor)
  }

  /**
   * 批量注册插件构造函数
   * @param plugins 插件构造函数映射
   */
  static registerMultipleConstructors(plugins: Record<string, new () => IPlugin>): void {
    Object.entries(plugins).forEach(([name, constructor]) => {
      this.registerConstructor(name, constructor)
    })
  }

  /**
   * 获取插件实例
   * @param name 插件名称
   * @returns 插件实例或undefined
   */
  static getPlugin(name: string): IPlugin | undefined {
    // 先从缓存中查找
    if (this.pluginInstances.has(name)) {
      return this.pluginInstances.get(name)
    }

    // 从构造函数创建新实例
    const constructor = this.pluginConstructors.get(name)
    if (constructor) {
      try {
        const instance = new constructor()
        this.pluginInstances.set(name, instance)
        return instance
      } catch (error) {
        console.error(`Failed to create plugin instance "${name}":`, error)
        return undefined
      }
    }

    return undefined
  }

  /**
   * 检查插件是否已注册
   * @param name 插件名称
   * @returns 是否已注册
   */
  static isRegistered(name: string): boolean {
    return this.pluginConstructors.has(name)
  }

  /**
   * 获取所有已注册的插件名称
   * @returns 插件名称数组
   */
  static getRegisteredPluginNames(): string[] {
    return Array.from(this.pluginConstructors.keys())
  }

  /**
   * 获取所有可用的插件实例
   * @returns 插件实例数组
   */
  static getAllPlugins(): IPlugin[] {
    const plugins: IPlugin[] = []

    for (const name of this.pluginConstructors.keys()) {
      const plugin = this.getPlugin(name)
      if (plugin) {
        plugins.push(plugin)
      }
    }

    return plugins
  }

  /**
   * 清除插件实例缓存
   * @param name 插件名称，如果不提供则清除所有缓存
   */
  static clearCache(name?: string): void {
    if (name) {
      this.pluginInstances.delete(name)
    } else {
      this.pluginInstances.clear()
    }
  }

  /**
   * 注销插件
   * @param name 插件名称
   */
  static unregister(name: string): void {
    this.pluginConstructors.delete(name)
    this.pluginInstances.delete(name)
  }

  /**
   * 获取插件信息
   * @param name 插件名称
   * @returns 插件信息
   */
  static getPluginInfo(name: string): {
    registered: boolean
    cached: boolean
    plugin?: IPlugin
  } {
    return {
      registered: this.isRegistered(name),
      cached: this.pluginInstances.has(name),
      plugin: this.pluginInstances.get(name)
    }
  }

  /**
   * 获取调试信息
   * @returns 调试信息对象
   */
  static getDebugInfo(): {
    totalRegistered: number
    totalCached: number
    registeredPlugins: string[]
    cachedPlugins: string[]
  } {
    return {
      totalRegistered: this.pluginConstructors.size,
      totalCached: this.pluginInstances.size,
      registeredPlugins: this.getRegisteredPluginNames(),
      cachedPlugins: Array.from(this.pluginInstances.keys())
    }
  }
}

// 注册内置插件
PluginRegistry.registerMultipleConstructors({
  // 格式化插件
  'bold': BoldPlugin,
  'italic': ItalicPlugin,
  'underline': UnderlinePlugin,

  // 块级插件
  'heading': HeadingPlugin,
  'list': ListPlugin,
  'blockquote': BlockquotePlugin,

  // 媒体插件
  'image': ImagePlugin,
  'link': LinkPlugin
})

/**
 * 获取插件实例的便捷函数
 * @param name 插件名称
 * @returns 插件实例或undefined
 */
export function getPlugin(name: string): IPlugin | undefined {
  return PluginRegistry.getPlugin(name)
}

/**
 * 检查插件是否可用
 * @param name 插件名称
 * @returns 是否可用
 */
export function isPluginAvailable(name: string): boolean {
  return PluginRegistry.isRegistered(name)
}

/**
 * 获取所有可用插件名称
 * @returns 插件名称数组
 */
export function getAvailablePlugins(): string[] {
  return PluginRegistry.getRegisteredPluginNames()
}
