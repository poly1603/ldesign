/**
 * 插件管理器实现
 */

import { TreeEventEmitterImpl } from '../../core/event-emitter'
import type { Tree } from '../../core/tree'
import type {
  PluginManager,
  Plugin,
  PluginLifecycle,
  PluginInfo,
  PluginConfig,
  PluginRegistrationOptions
} from './plugin-interface'
import { PluginStatus } from './plugin-interface'
import { PluginContextImpl } from './plugin-context'

/**
 * 插件管理器实现类
 */
export class PluginManagerImpl extends TreeEventEmitterImpl implements PluginManager {
  private plugins = new Map<string, PluginInfo>()
  private tree: Tree

  constructor(tree: Tree) {
    super()
    this.tree = tree
  }

  /**
   * 注册插件
   */
  register(plugin: Plugin, options: PluginRegistrationOptions = {}): void {
    const { config = {}, enabled = true, override = false } = options
    const name = plugin.metadata.name

    // 检查插件是否已存在
    if (this.plugins.has(name) && !override) {
      throw new Error(`Plugin "${name}" is already registered`)
    }

    // 检查依赖
    this.checkDependencies(plugin)

    // 创建插件信息
    const pluginInfo: PluginInfo = {
      plugin,
      status: PluginStatus.UNINSTALLED,
      installedAt: new Date(),
    }

    // 设置插件配置
    plugin.setConfig({ enabled, ...config })

    // 创建插件上下文
    const context = new PluginContextImpl(
      this.tree,
      this,
      plugin.config,
      plugin.metadata
    )
    plugin.context = context

    try {
      // 调用安装钩子
      if (plugin.install) {
        const result = plugin.install(context)
        if (result instanceof Promise) {
          result.catch(error => this.handlePluginError(plugin, error))
        }
      }

      pluginInfo.status = PluginStatus.INSTALLED
      this.plugins.set(name, pluginInfo)

      // 如果启用，则启用插件
      if (enabled) {
        this.enable(name)
      }

      this.emit('plugin:registered', plugin)
    } catch (error) {
      this.handlePluginError(plugin, error as Error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  unregister(name: string): void {
    const pluginInfo = this.plugins.get(name)
    if (!pluginInfo) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    const { plugin } = pluginInfo

    try {
      // 如果插件已启用，先禁用
      if (this.isEnabled(name)) {
        this.disable(name)
      }

      // 调用卸载钩子
      if (plugin.uninstall && plugin.context) {
        const result = plugin.uninstall(plugin.context)
        if (result instanceof Promise) {
          result.catch(error => this.handlePluginError(plugin, error))
        }
      }

      // 销毁插件上下文
      if (plugin.context) {
        (plugin.context as PluginContextImpl).destroy()
        plugin.context = undefined
      }

      this.plugins.delete(name)
      this.emit('plugin:unregistered', name)
    } catch (error) {
      this.handlePluginError(plugin, error as Error)
      throw error
    }
  }

  /**
   * 获取插件
   */
  get<T = Plugin>(name: string): T | undefined {
    const pluginInfo = this.plugins.get(name)
    return pluginInfo?.plugin as T | undefined
  }

  /**
   * 获取所有插件
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values()).map(info => info.plugin)
  }

  /**
   * 启用插件
   */
  enable(name: string): void {
    const pluginInfo = this.plugins.get(name)
    if (!pluginInfo) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    if (pluginInfo.status === PluginStatus.ENABLED) {
      return
    }

    const { plugin } = pluginInfo

    try {
      // 更新配置
      plugin.setConfig({ ...plugin.config, enabled: true })

      // 调用挂载前钩子
      if (plugin.beforeMount && plugin.context) {
        const result = plugin.beforeMount(plugin.context)
        if (result instanceof Promise) {
          result.catch(error => this.handlePluginError(plugin, error))
        }
      }

      // 调用挂载钩子
      if (plugin.mounted && plugin.context) {
        const result = plugin.mounted(plugin.context)
        if (result instanceof Promise) {
          result.catch(error => this.handlePluginError(plugin, error))
        }
      }

      pluginInfo.status = PluginStatus.ENABLED
      pluginInfo.enabledAt = new Date()

      this.emit('plugin:enabled', plugin)
    } catch (error) {
      this.handlePluginError(plugin, error as Error)
      throw error
    }
  }

  /**
   * 禁用插件
   */
  disable(name: string): void {
    const pluginInfo = this.plugins.get(name)
    if (!pluginInfo) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    if (pluginInfo.status !== PluginStatus.ENABLED) {
      return
    }

    const { plugin } = pluginInfo

    try {
      // 调用卸载前钩子
      if (plugin.beforeUnmount && plugin.context) {
        const result = plugin.beforeUnmount(plugin.context)
        if (result instanceof Promise) {
          result.catch(error => this.handlePluginError(plugin, error))
        }
      }

      // 更新配置
      plugin.setConfig({ ...plugin.config, enabled: false })

      pluginInfo.status = PluginStatus.DISABLED
      pluginInfo.enabledAt = undefined

      this.emit('plugin:disabled', plugin)
    } catch (error) {
      this.handlePluginError(plugin, error as Error)
      throw error
    }
  }

  /**
   * 检查插件是否存在
   */
  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 检查插件是否启用
   */
  isEnabled(name: string): boolean {
    const pluginInfo = this.plugins.get(name)
    return pluginInfo?.status === PluginStatus.ENABLED
  }

  /**
   * 调用插件生命周期钩子
   */
  async callHook(hook: keyof PluginLifecycle, ...args: any[]): Promise<void> {
    const promises: Promise<void>[] = []

    for (const pluginInfo of this.plugins.values()) {
      if (pluginInfo.status === PluginStatus.ENABLED) {
        const { plugin } = pluginInfo
        const hookFn = plugin[hook]

        if (hookFn && plugin.context) {
          try {
            const result = hookFn.call(plugin, plugin.context, ...args)
            if (result instanceof Promise) {
              promises.push(result.catch(error => this.handlePluginError(plugin, error)))
            }
          } catch (error) {
            this.handlePluginError(plugin, error as Error)
          }
        }
      }
    }

    await Promise.all(promises)
  }

  /**
   * 获取插件信息
   */
  getPluginInfo(name: string): PluginInfo | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件信息
   */
  getAllPluginInfo(): PluginInfo[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 检查插件依赖
   */
  private checkDependencies(plugin: Plugin): void {
    const { dependencies = [] } = plugin.metadata

    for (const dep of dependencies) {
      if (!this.has(dep)) {
        throw new Error(`Plugin "${plugin.metadata.name}" depends on "${dep}" which is not registered`)
      }

      if (!this.isEnabled(dep)) {
        throw new Error(`Plugin "${plugin.metadata.name}" depends on "${dep}" which is not enabled`)
      }
    }
  }

  /**
   * 处理插件错误
   */
  private handlePluginError(plugin: Plugin, error: Error): void {
    const pluginInfo = this.plugins.get(plugin.metadata.name)
    if (pluginInfo) {
      pluginInfo.status = PluginStatus.ERROR
      pluginInfo.error = error
    }

    this.emit('plugin:error', error, plugin)
    console.error(`Plugin "${plugin.metadata.name}" error:`, error)
  }

  /**
   * 销毁插件管理器
   */
  destroy(): void {
    // 卸载所有插件
    const pluginNames = Array.from(this.plugins.keys())
    for (const name of pluginNames) {
      try {
        this.unregister(name)
      } catch (error) {
        console.error(`Error unregistering plugin "${name}":`, error)
      }
    }

    this.plugins.clear()
    this.removeAllListeners()
  }
}
