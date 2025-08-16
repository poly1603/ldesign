import type { ApiEngine, ApiPlugin } from '../types'

/**
 * 插件管理器
 */
export class PluginManager {
  /** 已注册的插件 */
  private readonly plugins = new Map<string, ApiPlugin>()

  /** 插件加载顺序 */
  private readonly loadOrder: string[] = []

  /** API 引擎实例 */
  private readonly engine: ApiEngine

  constructor(engine: ApiEngine) {
    this.engine = engine
  }

  /**
   * 注册插件
   */
  async register(plugin: ApiPlugin): Promise<void> {
    // 验证插件
    this.validatePlugin(plugin)

    // 检查是否已注册
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }

    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(
            `Plugin "${plugin.name}" depends on "${dep}" which is not registered`
          )
        }
      }
    }

    try {
      // 注册插件
      this.plugins.set(plugin.name, plugin)
      this.loadOrder.push(plugin.name)

      // 安装插件
      await plugin.install(this.engine)

      // 注册插件提供的 API 方法
      if (plugin.apis) {
        this.engine.registerBatch(plugin.apis)
      }

      this.log(`Plugin "${plugin.name}" registered successfully`, {
        version: plugin.version,
        dependencies: plugin.dependencies,
        apis: plugin.apis ? Object.keys(plugin.apis) : [],
      })
    } catch (error) {
      // 注册失败时清理
      this.plugins.delete(plugin.name)
      const index = this.loadOrder.indexOf(plugin.name)
      if (index > -1) {
        this.loadOrder.splice(index, 1)
      }

      this.log(`Failed to register plugin "${plugin.name}"`, error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  async unregister(name: string): Promise<void> {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    // 检查是否有其他插件依赖此插件
    const dependents = this.getDependents(name)
    if (dependents.length > 0) {
      throw new Error(
        `Cannot unregister plugin "${name}" because it is required by: ${dependents.join(
          ', '
        )}`
      )
    }

    try {
      // 卸载插件
      if (plugin.uninstall) {
        await plugin.uninstall(this.engine)
      }

      // 移除插件
      this.plugins.delete(name)
      const index = this.loadOrder.indexOf(name)
      if (index > -1) {
        this.loadOrder.splice(index, 1)
      }

      this.log(`Plugin "${name}" unregistered successfully`)
    } catch (error) {
      this.log(`Failed to unregister plugin "${name}"`, error)
      throw error
    }
  }

  /**
   * 获取插件
   */
  get(name: string): ApiPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件
   */
  getAll(): ApiPlugin[] {
    return this.loadOrder.map(name => this.plugins.get(name)!)
  }

  /**
   * 检查插件是否已注册
   */
  isRegistered(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 获取插件依赖
   */
  getDependencies(name: string): string[] {
    const plugin = this.plugins.get(name)
    return plugin?.dependencies || []
  }

  /**
   * 获取依赖此插件的其他插件
   */
  getDependents(name: string): string[] {
    const dependents: string[] = []

    this.plugins.forEach((plugin, pluginName) => {
      if (plugin.dependencies?.includes(name)) {
        dependents.push(pluginName)
      }
    })

    return dependents
  }

  /**
   * 获取加载顺序
   */
  getLoadOrder(): string[] {
    return [...this.loadOrder]
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.plugins.clear()
    this.loadOrder.length = 0
  }

  /**
   * 验证插件格式
   */
  private validatePlugin(plugin: ApiPlugin): void {
    if (!plugin) {
      throw new Error('Plugin cannot be null or undefined')
    }

    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new Error('Plugin must have a valid name')
    }

    if (!plugin.install || typeof plugin.install !== 'function') {
      throw new Error('Plugin must have an install function')
    }

    if (plugin.uninstall && typeof plugin.uninstall !== 'function') {
      throw new Error('Plugin uninstall must be a function')
    }

    if (plugin.dependencies && !Array.isArray(plugin.dependencies)) {
      throw new Error('Plugin dependencies must be an array')
    }

    if (plugin.apis && typeof plugin.apis !== 'object') {
      throw new Error('Plugin apis must be an object')
    }
  }

  /**
   * 日志输出
   */
  private log(message: string, data?: unknown): void {
    if (this.engine.config.debug) {
      console.warn(`[Plugin Manager] ${message}`, data || '')
    }
  }
}
