/**
 * 插件管理器
 * 
 * 管理审批流程图编辑器的插件系统
 */

import type { Plugin } from '../types'
import type { FlowchartEditor } from '../core/FlowchartEditor'

/**
 * 插件管理器类
 */
export class PluginManager {
  private editor: FlowchartEditor
  private plugins: Map<string, Plugin> = new Map()
  private installedPlugins: Set<string> = new Set()

  /**
   * 构造函数
   * @param editor 编辑器实例
   */
  constructor(editor: FlowchartEditor) {
    this.editor = editor
  }

  /**
   * 注册插件
   * @param plugin 插件实例
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`插件 "${plugin.name}" 已存在，将被覆盖`)
    }
    
    this.plugins.set(plugin.name, plugin)
  }

  /**
   * 安装插件
   * @param pluginOrName 插件实例或插件名称
   */
  install(pluginOrName: Plugin | string): void {
    let plugin: Plugin

    if (typeof pluginOrName === 'string') {
      const registeredPlugin = this.plugins.get(pluginOrName)
      if (!registeredPlugin) {
        throw new Error(`插件 "${pluginOrName}" 未注册`)
      }
      plugin = registeredPlugin
    } else {
      plugin = pluginOrName
      // 自动注册插件
      this.register(plugin)
    }

    if (this.installedPlugins.has(plugin.name)) {
      console.warn(`插件 "${plugin.name}" 已安装`)
      return
    }

    try {
      // 安装插件
      plugin.install(this.editor)
      this.installedPlugins.add(plugin.name)
      
      console.log(`插件 "${plugin.name}" 安装成功`)
    } catch (error) {
      console.error(`插件 "${plugin.name}" 安装失败:`, error)
      throw error
    }
  }

  /**
   * 卸载插件
   * @param pluginName 插件名称
   */
  uninstall(pluginName: string): void {
    if (!this.installedPlugins.has(pluginName)) {
      console.warn(`插件 "${pluginName}" 未安装`)
      return
    }

    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      console.warn(`插件 "${pluginName}" 未注册`)
      return
    }

    try {
      // 卸载插件
      if (plugin.uninstall) {
        plugin.uninstall(this.editor)
      }
      
      this.installedPlugins.delete(pluginName)
      console.log(`插件 "${pluginName}" 卸载成功`)
    } catch (error) {
      console.error(`插件 "${pluginName}" 卸载失败:`, error)
      throw error
    }
  }

  /**
   * 卸载所有插件
   */
  uninstallAll(): void {
    const installedPluginNames = Array.from(this.installedPlugins)
    
    installedPluginNames.forEach(pluginName => {
      try {
        this.uninstall(pluginName)
      } catch (error) {
        console.error(`卸载插件 "${pluginName}" 时出错:`, error)
      }
    })
  }

  /**
   * 检查插件是否已安装
   * @param pluginName 插件名称
   */
  isInstalled(pluginName: string): boolean {
    return this.installedPlugins.has(pluginName)
  }

  /**
   * 获取所有已注册的插件名称
   */
  getRegisteredPlugins(): string[] {
    return Array.from(this.plugins.keys())
  }

  /**
   * 获取所有已安装的插件名称
   */
  getInstalledPlugins(): string[] {
    return Array.from(this.installedPlugins)
  }

  /**
   * 获取插件实例
   * @param pluginName 插件名称
   */
  getPlugin(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName)
  }

  /**
   * 批量安装插件
   * @param plugins 插件数组
   */
  installBatch(plugins: Array<Plugin | string>): void {
    plugins.forEach(plugin => {
      try {
        this.install(plugin)
      } catch (error) {
        console.error('批量安装插件时出错:', error)
      }
    })
  }

  /**
   * 批量卸载插件
   * @param pluginNames 插件名称数组
   */
  uninstallBatch(pluginNames: string[]): void {
    pluginNames.forEach(pluginName => {
      try {
        this.uninstall(pluginName)
      } catch (error) {
        console.error('批量卸载插件时出错:', error)
      }
    })
  }
}
