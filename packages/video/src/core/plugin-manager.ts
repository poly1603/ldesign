/**
 * 插件管理器
 * 负责插件的注册、加载、卸载和生命周期管理
 */

import { EventEmitter } from '../utils/events'
import { generateId } from '../utils/common'
import type {
  IPlugin,
  IPluginManager,
  PluginConstructor,
  PluginOptions,
  PluginContext
} from '../types/plugin'
import { PluginError, PluginEvent, PluginHook, PluginStatus } from '../types/plugin'
import type { IVideoPlayer } from '../types/player'

/**
 * 插件管理器实现
 */
export class PluginManager extends EventEmitter implements IPluginManager {
  private _plugins = new Map<string, IPlugin>()
  private _player: IVideoPlayer
  private _context: Partial<PluginContext>

  constructor(player: IVideoPlayer) {
    super()
    this._player = player
    this._context = {
      player,
      manager: this
    }
  }

  /**
   * 已安装的插件
   */
  get plugins(): Map<string, IPlugin> {
    return new Map(this._plugins)
  }

  /**
   * 播放器实例
   */
  get player(): IVideoPlayer {
    return this._player
  }

  /**
   * 注册插件
   */
  async register(plugin: PluginConstructor | IPlugin, options: PluginOptions = {}): Promise<void> {
    try {
      let pluginInstance: IPlugin

      // 创建插件实例
      if (typeof plugin === 'function') {
        pluginInstance = new plugin(options)
      } else {
        pluginInstance = plugin
        if (options && Object.keys(options).length > 0) {
          pluginInstance.updateOptions(options)
        }
      }

      const { name } = pluginInstance.metadata

      // 检查插件是否已存在
      if (this._plugins.has(name)) {
        throw new PluginError(`Plugin "${name}" is already registered`, name, 'ALREADY_REGISTERED')
      }

      // 创建插件上下文
      const context: PluginContext = {
        ...this._context,
        options: pluginInstance.options,
        metadata: pluginInstance.metadata,
        status: pluginInstance.status
      } as PluginContext

      // 触发安装前钩子
      await this.triggerHook(PluginHook.BEFORE_INSTALL, context)

      // 安装插件
      await pluginInstance.install({
        player: this._context.player,
        pluginManager: this._context.manager
      })

      // 注册插件
      this._plugins.set(name, pluginInstance)

      // 触发安装后钩子
      await this.triggerHook(PluginHook.AFTER_INSTALL, context)

      // 如果插件默认启用，则启用它
      if (options.enabled !== false) {
        await this.enable(name)
      }

      this.emitSimple(PluginEvent.PLUGIN_REGISTERED, { plugin: pluginInstance, name })

    } catch (error) {
      const pluginName = typeof plugin === 'function' ? plugin.metadata?.name || 'unknown' : plugin.metadata.name
      const pluginError = error instanceof PluginError ? error : new PluginError(
        `Failed to register plugin "${pluginName}": ${(error as Error).message}`,
        pluginName,
        'REGISTRATION_FAILED'
      )

      this.emit(PluginEvent.PLUGIN_ERROR, { error: pluginError })
      throw pluginError
    }
  }

  /**
   * 卸载插件
   */
  async unregister(name: string): Promise<void> {
    const plugin = this._plugins.get(name)
    if (!plugin) {
      throw new PluginError(`Plugin "${name}" is not registered`, name, 'NOT_FOUND')
    }

    try {
      // 如果插件已启用，先禁用它
      if (this.isEnabled(name)) {
        await this.disable(name)
      }

      const context: PluginContext = {
        ...this._context,
        options: plugin.options,
        metadata: plugin.metadata,
        status: plugin.status
      } as PluginContext

      // 触发卸载前钩子
      await this.triggerHook(PluginHook.BEFORE_UNINSTALL, context)

      // 卸载插件
      await plugin.uninstall(context)

      // 移除插件
      this._plugins.delete(name)

      // 触发卸载后钩子
      await this.triggerHook(PluginHook.AFTER_UNINSTALL, context)

      this.emitSimple(PluginEvent.PLUGIN_UNREGISTERED, { plugin, name })

    } catch (error) {
      const pluginError = new PluginError(
        `Failed to unregister plugin "${name}": ${(error as Error).message}`,
        name,
        'UNREGISTRATION_FAILED'
      )

      this.emit(PluginEvent.PLUGIN_ERROR, { error: pluginError })
      throw pluginError
    }
  }

  /**
   * 启用插件
   */
  async enable(name: string): Promise<void> {
    const plugin = this._plugins.get(name)
    if (!plugin) {
      throw new PluginError(`Plugin "${name}" is not registered`, name, 'NOT_FOUND')
    }

    if (this.isEnabled(name)) {
      return // 已经启用
    }

    try {
      const context: PluginContext = {
        ...this._context,
        options: plugin.options,
        metadata: plugin.metadata,
        status: plugin.status
      } as PluginContext

      // 触发启用前钩子
      await this.triggerHook(PluginHook.BEFORE_ENABLE, context)

      // 启用插件
      await plugin.enable(context)

      // 触发启用后钩子
      await this.triggerHook(PluginHook.AFTER_ENABLE, context)

      this.emitSimple(PluginEvent.PLUGIN_ENABLED, { plugin, name })

    } catch (error) {
      const pluginError = new PluginError(
        `Failed to enable plugin "${name}": ${(error as Error).message}`,
        name,
        'ENABLE_FAILED'
      )

      this.emit(PluginEvent.PLUGIN_ERROR, { error: pluginError })
      throw pluginError
    }
  }

  /**
   * 禁用插件
   */
  async disable(name: string): Promise<void> {
    const plugin = this._plugins.get(name)
    if (!plugin) {
      throw new PluginError(`Plugin "${name}" is not registered`, name, 'NOT_FOUND')
    }

    if (!this.isEnabled(name)) {
      return // 已经禁用
    }

    try {
      const context: PluginContext = {
        ...this._context,
        options: plugin.options,
        metadata: plugin.metadata,
        status: plugin.status
      } as PluginContext

      // 触发禁用前钩子
      await this.triggerHook(PluginHook.BEFORE_DISABLE, context)

      // 禁用插件
      await plugin.disable(context)

      // 触发禁用后钩子
      await this.triggerHook(PluginHook.AFTER_DISABLE, context)

      this.emitSimple(PluginEvent.PLUGIN_DISABLED, { plugin, name })

    } catch (error) {
      const pluginError = new PluginError(
        `Failed to disable plugin "${name}": ${(error as Error).message}`,
        name,
        'DISABLE_FAILED'
      )

      this.emit(PluginEvent.PLUGIN_ERROR, { error: pluginError })
      throw pluginError
    }
  }

  /**
   * 获取插件
   */
  get(name: string): IPlugin | undefined {
    return this._plugins.get(name)
  }

  /**
   * 获取所有插件
   */
  getAll(): IPlugin[] {
    return Array.from(this._plugins.values())
  }

  /**
   * 获取已启用的插件
   */
  getEnabled(): IPlugin[] {
    return this.getAll().filter(plugin => plugin.getStatus() === PluginStatus.ENABLED)
  }

  /**
   * 检查插件是否存在
   */
  has(name: string): boolean {
    return this._plugins.has(name)
  }

  /**
   * 检查插件是否启用
   */
  isEnabled(name: string): boolean {
    const plugin = this._plugins.get(name)
    return plugin ? plugin.getStatus() === PluginStatus.ENABLED : false
  }

  /**
   * 更新插件配置
   */
  async updateOptions(name: string, options: Partial<PluginOptions>): Promise<void> {
    const plugin = this._plugins.get(name)
    if (!plugin) {
      throw new PluginError(`Plugin "${name}" not found`, name, 'NOT_FOUND')
    }

    try {
      plugin.updateOptions(options)
      this.emit(PluginEvent.PLUGIN_OPTIONS_UPDATED, { pluginName: name, plugin, options })
    } catch (error) {
      const pluginError = new PluginError(
        `Failed to update options for plugin "${name}": ${(error as Error).message}`,
        name,
        'UPDATE_OPTIONS_FAILED'
      )

      this.emit(PluginEvent.PLUGIN_ERROR, { error: pluginError })
      throw pluginError
    }
  }

  /**
   * 获取已禁用的插件
   */
  getDisabled(): IPlugin[] {
    return Array.from(this._plugins.values()).filter(plugin => !this.isEnabled(plugin.metadata.name))
  }

  /**
   * 启用所有插件
   */
  async enableAll(): Promise<void> {
    const pluginNames = Array.from(this._plugins.keys())

    for (const name of pluginNames) {
      try {
        await this.enable(name)
      } catch (error) {
        console.error(`Failed to enable plugin "${name}":`, error)
      }
    }
  }

  /**
   * 禁用所有插件
   */
  async disableAll(): Promise<void> {
    const pluginNames = Array.from(this._plugins.keys())

    for (const name of pluginNames) {
      try {
        await this.disable(name)
      } catch (error) {
        console.error(`Failed to disable plugin "${name}":`, error)
      }
    }
  }

  /**
   * 卸载所有插件
   */
  async unregisterAll(): Promise<void> {
    const pluginNames = Array.from(this._plugins.keys())

    for (const name of pluginNames) {
      try {
        await this.unregister(name)
      } catch (error) {
        console.error(`Failed to unregister plugin "${name}":`, error)
      }
    }
  }

  /**
   * 清空所有插件
   */
  async clear(): Promise<void> {
    const pluginNames = Array.from(this._plugins.keys())

    for (const name of pluginNames) {
      try {
        await this.unregister(name)
      } catch (error) {
        console.error(`Failed to unregister plugin "${name}":`, error)
      }
    }
  }

  /**
   * 触发插件钩子
   */
  async triggerHook(hook: PluginHook, context?: Partial<PluginContext>): Promise<void> {
    const plugins = this.getAll()

    for (const plugin of plugins) {
      if (plugin.onHook) {
        try {
          const fullContext = { ...this._context, ...context } as PluginContext
          await plugin.onHook(hook, fullContext)
        } catch (error) {
          console.error(`Error in plugin "${plugin.metadata.name}" hook "${hook}":`, error)
        }
      }
    }
  }

  /**
   * 简单事件发射（直接传递数据，不包装在事件对象中）
   */
  private emitSimple<T = any>(event: string, data?: T): boolean {
    const listeners = this.listeners.get(event)
    if (listeners && listeners.size > 0) {
      for (const listener of listeners) {
        try {
          listener(data)
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error)
        }
      }
      return true
    }
    return false
  }

  /**
   * 销毁插件管理器
   */
  async destroy(): Promise<void> {
    await this.clear()
    this.removeAllListeners()
  }
}
