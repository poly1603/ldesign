import type { Engine, Plugin, PluginManager } from '../types'

export class PluginManagerImpl implements PluginManager {
  readonly name = 'PluginManager'
  readonly version = '1.0.0'

  private plugins = new Map<string, Plugin>()
  private loadOrder: string[] = []
  private engine?: Engine

  // 性能优化：缓存依赖图和验证结果
  private dependencyGraphCache?: Record<string, string[]>
  private validationCache?: { valid: boolean; errors: string[] }
  private dependentsCache = new Map<string, string[]>()

  constructor(engine?: Engine) {
    this.engine = engine
  }

  async register(plugin: Plugin): Promise<void> {
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

      // 清除缓存
      this.clearCaches()

      // 安装插件
      if (this.engine) {
        const context = {
          engine: this.engine,
          logger: this.engine.logger,
          config: this.engine.config,
          events: this.engine.events,
        }
        await plugin.install(context)
      }

      if (this.engine?.logger) {
        this.engine.logger.info(
          `Plugin "${plugin.name}" registered successfully`,
          {
            version: plugin.version,
            dependencies: plugin.dependencies,
          }
        )
      }

      // 发送插件注册事件
      if (this.engine?.events) {
        this.engine.events.emit('plugin:registered', {
          name: plugin.name,
          plugin,
        })
      }
    } catch (error) {
      // 注册失败时清理
      this.plugins.delete(plugin.name)
      const index = this.loadOrder.indexOf(plugin.name)
      if (index > -1) {
        this.loadOrder.splice(index, 1)
      }

      if (this.engine?.logger) {
        this.engine.logger.error(
          `Failed to register plugin "${plugin.name}"`,
          error
        )
      }
      throw error
    }
  }

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
      if (plugin.uninstall && this.engine) {
        const context = {
          engine: this.engine,
          logger: this.engine.logger,
          config: this.engine.config,
          events: this.engine.events,
        }
        await plugin.uninstall(context)
      }

      // 移除插件
      this.plugins.delete(name)
      const index = this.loadOrder.indexOf(name)
      if (index > -1) {
        this.loadOrder.splice(index, 1)
      }

      if (this.engine?.logger) {
        this.engine.logger.info(`Plugin "${name}" unregistered successfully`)
      }

      // 发送插件卸载事件
      if (this.engine?.events) {
        this.engine.events.emit('plugin:unregistered', {
          name,
          plugin,
        })
      }
    } catch (error) {
      if (this.engine?.logger) {
        this.engine.logger.error(`Failed to unregister plugin "${name}"`, error)
      }
      throw error
    }
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name)
  }

  getAll(): Plugin[] {
    return this.loadOrder.map(name => this.plugins.get(name)!)
  }

  isRegistered(name: string): boolean {
    return this.plugins.has(name)
  }

  has(name: string): boolean {
    return this.plugins.has(name)
  }

  checkDependencies(plugin: Plugin): {
    satisfied: boolean
    missing: string[]
    conflicts: string[]
  } {
    const missing: string[] = []
    const conflicts: string[] = []

    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          missing.push(dep)
        }
      }
    }

    return {
      satisfied: missing.length === 0 && conflicts.length === 0,
      missing,
      conflicts,
    }
  }

  // 获取插件的依赖者（带缓存）
  private getDependents(pluginName: string): string[] {
    if (this.dependentsCache.has(pluginName)) {
      return this.dependentsCache.get(pluginName)!
    }

    const dependents: string[] = []

    for (const [name, plugin] of this.plugins) {
      if (plugin.dependencies?.includes(pluginName)) {
        dependents.push(name)
      }
    }

    this.dependentsCache.set(pluginName, dependents)
    return dependents
  }

  // 获取插件加载顺序
  getLoadOrder(): string[] {
    return [...this.loadOrder]
  }

  // 获取插件依赖图（带缓存）
  getDependencyGraph(): Record<string, string[]> {
    if (this.dependencyGraphCache) {
      return this.dependencyGraphCache
    }

    const graph: Record<string, string[]> = {}

    for (const [name, plugin] of this.plugins) {
      graph[name] = plugin.dependencies ? [...plugin.dependencies] : []
    }

    this.dependencyGraphCache = graph
    return graph
  }

  // 验证插件依赖（带缓存）
  validateDependencies(): { valid: boolean; errors: string[] } {
    if (this.validationCache) {
      return this.validationCache
    }

    const errors: string[] = []

    for (const [name, plugin] of this.plugins) {
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.plugins.has(dep)) {
            errors.push(`Plugin "${name}" depends on missing plugin "${dep}"`)
          }
        }
      }
    }

    const result = {
      valid: errors.length === 0,
      errors,
    }

    this.validationCache = result
    return result
  }

  // 获取插件统计信息
  getStats(): {
    total: number
    loaded: string[]
    dependencies: Record<string, string[]>
    installed: number
    pending: number
    errors: number
    averageInstallTime: number
    timestamp: number
  } {
    return {
      total: this.plugins.size,
      loaded: this.getLoadOrder(),
      dependencies: this.getDependencyGraph(),
      installed: this.plugins.size,
      pending: 0,
      errors: 0,
      averageInstallTime: 0,
      timestamp: Date.now(),
    }
  }

  // 清除所有缓存
  private clearCaches(): void {
    this.dependencyGraphCache = undefined
    this.validationCache = undefined
    this.dependentsCache.clear()
  }

  // 获取插件信息
  getInfo(name: string): any | undefined {
    const plugin = this.plugins.get(name)
    if (!plugin) return undefined

    return {
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      dependencies: plugin.dependencies || [],
      dependents: this.getDependents(name),
    }
  }

  // 获取所有插件信息
  getAllInfo(): any[] {
    return Array.from(this.plugins.keys())
      .map(name => this.getInfo(name)!)
      .filter(Boolean)
  }

  // 获取插件状态
  getStatus(name: string): any | undefined {
    if (!this.plugins.has(name)) return undefined
    return 'installed' // 简化实现
  }

  // 解析依赖
  resolveDependencies(plugins: Plugin[]): Plugin[] {
    // 简化实现，返回原数组
    return plugins
  }

  // 按关键词查找插件
  findByKeyword(keyword: string): Plugin[] {
    return Array.from(this.plugins.values()).filter(
      plugin =>
        plugin.description?.includes(keyword) || plugin.name.includes(keyword)
    )
  }

  // 按作者查找插件
  findByAuthor(author: string): Plugin[] {
    return Array.from(this.plugins.values()).filter(
      plugin => (plugin as any).author === author
    )
  }

  // 按依赖查找插件
  findByDependency(dependency: string): Plugin[] {
    return Array.from(this.plugins.values()).filter(plugin =>
      plugin.dependencies?.includes(dependency)
    )
  }

  destroy(): void {
    // 卸载所有插件
    for (const plugin of this.plugins.values()) {
      if (plugin.uninstall) {
        try {
          plugin.uninstall({
            engine: this.engine!,
            logger: this.engine!.logger,
            config: this.engine!.config,
            events: this.engine!.events,
          } as any)
        } catch (error) {
          console.error(`Error uninstalling plugin ${plugin.name}:`, error)
        }
      }
    }
    this.plugins.clear()
    this.loadOrder = []
    this.clearCaches()
  }
}

export function createPluginManager(engine?: Engine): PluginManager {
  return new PluginManagerImpl(engine)
}
