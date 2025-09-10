/**
 * 插件管理器
 * 负责插件的注册、加载、卸载和管理
 */

import type { 
  IPluginManager, 
  IPlugin, 
  IEditor,
  PluginState
} from '../types'

/**
 * 插件管理器实现
 * 提供完整的插件管理功能
 */
export class PluginManager implements IPluginManager {
  /** 编辑器实例 */
  private editor: IEditor

  /** 已注册的插件 */
  private registeredPlugins: Map<string, IPlugin> = new Map()

  /** 已启用的插件 */
  private enabledPlugins: Set<string> = new Set()

  /** 插件依赖关系图 */
  private dependencyGraph: Map<string, string[]> = new Map()

  constructor(editor: IEditor) {
    this.editor = editor
  }

  /**
   * 注册插件
   * @param plugin 插件实例
   */
  register(plugin: IPlugin): void {
    if (this.registeredPlugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already registered. Overwriting.`)
    }

    // 检查插件依赖
    if (plugin.dependencies) {
      this.dependencyGraph.set(plugin.name, plugin.dependencies)
    }

    this.registeredPlugins.set(plugin.name, plugin)
    
    // 设置插件状态
    this.editor.state.plugins[plugin.name] = {
      enabled: false,
      data: {}
    }

    console.log(`Plugin "${plugin.name}" registered successfully`)
  }

  /**
   * 批量注册插件
   * @param plugins 插件数组
   */
  registerMultiple(plugins: IPlugin[]): void {
    plugins.forEach(plugin => this.register(plugin))
  }

  /**
   * 注销插件
   * @param name 插件名称
   */
  unregister(name: string): void {
    if (!this.registeredPlugins.has(name)) {
      console.warn(`Plugin "${name}" is not registered.`)
      return
    }

    // 如果插件已启用，先禁用它
    if (this.isEnabled(name)) {
      this.disable(name)
    }

    // 移除插件
    this.registeredPlugins.delete(name)
    this.dependencyGraph.delete(name)
    
    // 移除插件状态
    delete this.editor.state.plugins[name]

    console.log(`Plugin "${name}" unregistered successfully`)
  }

  /**
   * 获取插件
   * @param name 插件名称
   * @returns 插件实例或undefined
   */
  get(name: string): IPlugin | undefined {
    return this.registeredPlugins.get(name)
  }

  /**
   * 获取所有插件
   * @returns 插件数组
   */
  getAll(): IPlugin[] {
    return Array.from(this.registeredPlugins.values())
  }

  /**
   * 获取所有插件名称
   * @returns 插件名称数组
   */
  getPluginNames(): string[] {
    return Array.from(this.registeredPlugins.keys())
  }

  /**
   * 启用插件
   * @param name 插件名称
   */
  enable(name: string): void {
    const plugin = this.registeredPlugins.get(name)
    if (!plugin) {
      throw new Error(`Plugin "${name}" is not registered.`)
    }

    if (this.isEnabled(name)) {
      console.warn(`Plugin "${name}" is already enabled.`)
      return
    }

    try {
      // 检查并启用依赖
      this.enableDependencies(name)

      // 初始化插件
      plugin.init(this.editor)

      // 注册插件命令
      if (plugin.getCommands) {
        const commands = plugin.getCommands()
        commands.forEach(command => {
          this.editor.commands.register(command)
        })
      }

      // 标记为已启用
      this.enabledPlugins.add(name)
      
      // 更新插件状态
      const currentState = this.editor.state.plugins[name] || { enabled: false, data: {} }
      this.editor.state.plugins[name] = {
        ...currentState,
        enabled: true
      }

      console.log(`Plugin "${name}" enabled successfully`)
    } catch (error) {
      console.error(`Failed to enable plugin "${name}":`, error)
      throw error
    }
  }

  /**
   * 禁用插件
   * @param name 插件名称
   */
  disable(name: string): void {
    const plugin = this.registeredPlugins.get(name)
    if (!plugin) {
      console.warn(`Plugin "${name}" is not registered.`)
      return
    }

    if (!this.isEnabled(name)) {
      console.warn(`Plugin "${name}" is not enabled.`)
      return
    }

    try {
      // 检查是否有其他插件依赖此插件
      this.checkDependents(name)

      // 销毁插件
      plugin.destroy()

      // 注销插件命令
      if (plugin.getCommands) {
        const commands = plugin.getCommands()
        commands.forEach(command => {
          this.editor.commands.unregister(command.name)
        })
      }

      // 标记为已禁用
      this.enabledPlugins.delete(name)
      
      // 更新插件状态
      const currentState = this.editor.state.plugins[name] || { enabled: true, data: {} }
      this.editor.state.plugins[name] = {
        ...currentState,
        enabled: false
      }

      console.log(`Plugin "${name}" disabled successfully`)
    } catch (error) {
      console.error(`Failed to disable plugin "${name}":`, error)
      throw error
    }
  }

  /**
   * 检查插件是否启用
   * @param name 插件名称
   * @returns 是否启用
   */
  isEnabled(name: string): boolean {
    return this.enabledPlugins.has(name)
  }

  /**
   * 检查插件是否注册
   * @param name 插件名称
   * @returns 是否注册
   */
  isRegistered(name: string): boolean {
    return this.registeredPlugins.has(name)
  }

  /**
   * 获取已启用的插件
   * @returns 已启用插件数组
   */
  getEnabledPlugins(): IPlugin[] {
    return Array.from(this.enabledPlugins)
      .map(name => this.registeredPlugins.get(name))
      .filter((plugin): plugin is IPlugin => plugin !== undefined)
  }

  /**
   * 启用插件依赖
   * @param pluginName 插件名称
   */
  private enableDependencies(pluginName: string): void {
    const dependencies = this.dependencyGraph.get(pluginName)
    if (!dependencies) {
      return
    }

    for (const dependency of dependencies) {
      if (!this.isRegistered(dependency)) {
        throw new Error(`Dependency "${dependency}" for plugin "${pluginName}" is not registered.`)
      }

      if (!this.isEnabled(dependency)) {
        this.enable(dependency)
      }
    }
  }

  /**
   * 检查插件的依赖者
   * @param pluginName 插件名称
   */
  private checkDependents(pluginName: string): void {
    const dependents: string[] = []

    for (const [name, dependencies] of this.dependencyGraph) {
      if (dependencies.includes(pluginName) && this.isEnabled(name)) {
        dependents.push(name)
      }
    }

    if (dependents.length > 0) {
      throw new Error(
        `Cannot disable plugin "${pluginName}" because it is required by: ${dependents.join(', ')}`
      )
    }
  }

  /**
   * 获取插件信息
   * @param name 插件名称
   * @returns 插件信息
   */
  getPluginInfo(name: string): {
    registered: boolean
    enabled: boolean
    plugin?: IPlugin
    dependencies?: string[]
    dependents?: string[]
  } {
    const plugin = this.registeredPlugins.get(name)
    const dependencies = this.dependencyGraph.get(name)
    
    // 查找依赖此插件的其他插件
    const dependents: string[] = []
    for (const [pluginName, deps] of this.dependencyGraph) {
      if (deps.includes(name)) {
        dependents.push(pluginName)
      }
    }

    return {
      registered: this.isRegistered(name),
      enabled: this.isEnabled(name),
      plugin,
      dependencies,
      dependents: dependents.length > 0 ? dependents : undefined
    }
  }

  /**
   * 获取调试信息
   * @returns 调试信息对象
   */
  getDebugInfo(): {
    totalRegistered: number
    totalEnabled: number
    registeredPlugins: string[]
    enabledPlugins: string[]
    dependencyGraph: Record<string, string[]>
  } {
    return {
      totalRegistered: this.registeredPlugins.size,
      totalEnabled: this.enabledPlugins.size,
      registeredPlugins: this.getPluginNames(),
      enabledPlugins: Array.from(this.enabledPlugins),
      dependencyGraph: Object.fromEntries(this.dependencyGraph)
    }
  }

  /**
   * 销毁插件管理器
   */
  destroy(): void {
    // 禁用所有插件
    const enabledPlugins = Array.from(this.enabledPlugins)
    enabledPlugins.forEach(name => {
      try {
        this.disable(name)
      } catch (error) {
        console.error(`Failed to disable plugin "${name}" during cleanup:`, error)
      }
    })

    // 清理数据
    this.registeredPlugins.clear()
    this.enabledPlugins.clear()
    this.dependencyGraph.clear()
  }
}
