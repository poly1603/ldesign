/**
 * Plugin - 插件基类
 * 提供插件系统的基础功能
 */

import type { Plugin as PluginType, PluginConfig, Command } from '../types'

/**
 * 插件基类
 */
export abstract class Plugin implements PluginType {
  public abstract name: string
  public abstract config: PluginConfig
  protected editor: any

  /**
   * 安装插件
   */
  install(editor: any): void {
    this.editor = editor

    // 注册命令
    if (this.config.commands) {
      Object.entries(this.config.commands).forEach(([name, command]) => {
        editor.commands.register(name, command)
      })
    }

    // 注册快捷键
    if (this.config.keys) {
      Object.entries(this.config.keys).forEach(([keys, command]) => {
        editor.keymap.register(keys, command)
      })
    }

    // 合并 Schema
    if (this.config.schema) {
      editor.extendSchema(this.config.schema)
    }

    // 调用自定义初始化
    this.onInstall?.(editor)
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    // 移除命令
    if (this.config.commands) {
      Object.keys(this.config.commands).forEach(name => {
        this.editor.commands.unregister(name)
      })
    }

    // 移除快捷键
    if (this.config.keys) {
      Object.keys(this.config.keys).forEach(keys => {
        this.editor.keymap.unregister(keys)
      })
    }

    // 调用自定义清理
    this.onDestroy?.(this.editor)
  }

  /**
   * 插件安装时的钩子
   */
  protected onInstall?(editor: any): void

  /**
   * 插件销毁时的钩子
   */
  protected onDestroy?(editor: any): void
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins: Map<string, PluginType> = new Map()
  private editor: any

  constructor(editor: any) {
    this.editor = editor
  }

  /**
   * 注册插件
   */
  register(plugin: PluginType): void {
    console.log(`[PluginManager] Registering plugin: "${plugin.name}"`)
    
    if (this.plugins.has(plugin.name)) {
      console.warn(`[PluginManager] Plugin "${plugin.name}" is already registered`)
      return
    }

    this.plugins.set(plugin.name, plugin)
    
    if (plugin.install) {
      console.log(`[PluginManager] Installing plugin: "${plugin.name}"`)
      plugin.install(this.editor)
      console.log(`[PluginManager] Plugin installed: "${plugin.name}"`)
    } else {
      console.log(`[PluginManager] Plugin "${plugin.name}" has no install method`)
    }
  }

  /**
   * 获取插件
   */
  get(name: string): PluginType | undefined {
    return this.plugins.get(name)
  }

  /**
   * 移除插件
   */
  unregister(name: string): void {
    const plugin = this.plugins.get(name)
    if (plugin) {
      plugin.destroy?.()
      this.plugins.delete(name)
    }
  }

  /**
   * 获取所有插件
   */
  getAll(): PluginType[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 检查插件是否已注册
   */
  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 清除所有插件
   */
  clear(): void {
    this.plugins.forEach(plugin => plugin.destroy?.())
    this.plugins.clear()
  }
}

/**
 * 创建插件辅助函数
 */
export function createPlugin(config: PluginConfig): PluginType {
  return {
    name: config.name,
    config,
    install(editor: any) {
      console.log(`[createPlugin] Installing plugin: ${config.name}`)
      console.log(`[createPlugin] Config commands:`, config.commands ? Object.keys(config.commands) : 'none')
      
      // 注册命令
      if (config.commands) {
        Object.entries(config.commands).forEach(([name, command]) => {
          console.log(`[createPlugin] Registering command: ${name} for plugin: ${config.name}`)
          editor.commands.register(name, command)
          console.log(`[createPlugin] Command ${name} registered successfully`)
        })
      }

      // 注册快捷键
      if (config.keys) {
        Object.entries(config.keys).forEach(([keys, command]) => {
          editor.keymap.register(keys, command)
        })
      }

      // 合并 Schema
      if (config.schema) {
        editor.extendSchema(config.schema)
      }
      
      // 调用 init 钩子
      if (config.init) {
        console.log(`[Plugin] Calling init for plugin: ${config.name}`)
        config.init(editor)
      }
    },
    destroy() {
      // 调用 destroy 钩子
      if (config.destroy) {
        config.destroy()
      }
    }
  }
}
