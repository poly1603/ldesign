import type { Engine, Plugin, PluginContext, PluginInfo, PluginManager, PluginStatus } from '../types'

/**
 * 插件管理器实现
 *
 * 负责插件的注册、卸载、依赖验证、查询与统计等能力。
 * - 维护插件注册表与加载顺序
 * - 为每个插件提供上下文（engine/logger/config/events）
 * - 提供依赖图与依赖校验缓存，避免重复计算
 */

export class PluginManagerImpl implements PluginManager {
  readonly name = 'PluginManager'
  readonly version = '1.0.0'

  private plugins = new Map<string, Plugin>()
  private loadOrder: string[] = []
  private engine?: Engine

  // 内存优化：限制插件数量
  private readonly MAX_PLUGINS = 100

  // 缓存优化：使用 WeakMap 避免内存泄漏
  private dependencyCache = new WeakMap<Plugin, string[]>()
  
  // 性能优化：缓存依赖图和查询结果
  private dependencyGraphCache?: Record<string, string[]>
  private dependentsCache = new Map<string, string[]>()
  private cacheInvalidated = true

  constructor(engine?: Engine) {
    this.engine = engine
  }
  
  /**
   * 使缓存失效
   */
  private invalidateCache(): void {
    this.cacheInvalidated = true
    this.dependencyGraphCache = undefined
    this.dependentsCache.clear()
  }

  /**
   * 注册并安装插件。
   *
   * 会校验依赖、写入注册表、清理缓存并调用插件的 install。
   * @throws 当插件已注册或依赖缺失时抛出错误
   */
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }

    // 检查插件数量限制
    if (this.plugins.size >= this.MAX_PLUGINS) {
      throw new Error(`Maximum plugin limit (${this.MAX_PLUGINS}) reached`)
    }

    // 检查依赖 - 提前验证所有依赖，一次性处理
    const { satisfied, missing } = this.checkDependencies(plugin)
    if (!satisfied) {
      if (missing.length === 1) {
        throw new Error(`Plugin "${plugin.name}" depends on "${missing[0]}" which is not registered`)
      } else {
        throw new Error(`Plugin "${plugin.name}" depends on missing plugins: ${missing.join(', ')}`)
      }
    }

    try {
      // 注册插件
      this.plugins.set(plugin.name, plugin)
      this.loadOrder.push(plugin.name)
      
      // 使缓存失效
      this.invalidateCache()

      // 安装插件
      if (this.engine) {
        const context = this.createPluginContext()
        await plugin.install(context)
      }

      // Plugin registered successfully (日志已禁用)

      // 发送插件注册事件
      if (this.engine?.events) {
        this.engine.events.emit('plugin:registered', {
          name: plugin.name,
          plugin,
        })
      }
    } catch (error) {
      // 回滚注册
      this.plugins.delete(plugin.name)
      const index = this.loadOrder.indexOf(plugin.name)
      if (index > -1) {
        this.loadOrder.splice(index, 1)
      }

      this.logPluginError(plugin.name, error)
      throw error
    }
  }

  /**
   * 卸载并注销插件。
   *
   * 会检查是否存在依赖该插件的其他插件，若存在则拒绝卸载。
   * @throws 当插件未注册或存在依赖者时抛出错误
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
      if (plugin.uninstall && this.engine) {
        const context = this.createPluginContext()
        await plugin.uninstall(context)
      }

      // 移除插件
      this.plugins.delete(name)
      const index = this.loadOrder.indexOf(name)
      if (index > -1) {
        this.loadOrder.splice(index, 1)
      }
      
      // 使缓存失效
      this.invalidateCache()

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
    return this.loadOrder.map(name => this.plugins.get(name)).filter(Boolean) as Plugin[]
  }

  isRegistered(name: string): boolean {
    return this.plugins.has(name)
  }

  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 检查插件依赖满足情况（不修改状态）。
   */
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

  /**
   * 获取依赖指定插件的插件列表 - 使用缓存优化
   */
  private getDependents(pluginName: string): string[] {
    // 检查缓存
    if (!this.cacheInvalidated && this.dependentsCache.has(pluginName)) {
      return this.dependentsCache.get(pluginName)!
    }
    
    const dependents: string[] = []
    for (const [name, plugin] of this.plugins) {
      if (plugin.dependencies?.includes(pluginName)) {
        dependents.push(name)
      }
    }
    
    // 更新缓存
    this.dependentsCache.set(pluginName, dependents)
    
    return dependents
  }

  // 获取插件加载顺序
  /**
   * 获取插件按注册顺序的名称列表。
   */
  getLoadOrder(): string[] {
    return [...this.loadOrder]
  }

  /**
   * 获取当前插件依赖图 - 使用缓存优化
   */
  getDependencyGraph(): Record<string, string[]> {
    // 检查缓存
    if (!this.cacheInvalidated && this.dependencyGraphCache) {
      return { ...this.dependencyGraphCache }
    }
    
    const graph: Record<string, string[]> = {}
    for (const [name, plugin] of this.plugins) {
      graph[name] = plugin.dependencies ? [...plugin.dependencies] : []
    }
    
    // 更新缓存
    this.dependencyGraphCache = graph
    this.cacheInvalidated = false
    
    return { ...graph }
  }

  /**
   * 验证所有已注册插件的依赖是否完整。
   */
  validateDependencies(): { valid: boolean; errors: string[] } {
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
    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // 获取插件统计信息
  /**
   * 获取插件统计信息快照。
   */
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

  // 获取插件信息
  /**
   * 获取单个插件的元信息摘要。
   */
  getInfo(name: string): PluginInfo<Engine> | undefined {
    const plugin = this.plugins.get(name)
    if (!plugin) return undefined

    return {
      plugin,
      status: 'installed',
      installTime: undefined,
      error: undefined,
      dependencies: plugin.dependencies || [],
      dependents: this.getDependents(name),
    }
  }

  // 获取所有插件信息
  /**
   * 获取所有已注册插件的元信息摘要列表。
   */
  getAllInfo(): PluginInfo<Engine>[] {
    return Array.from(this.plugins.keys())
      .map(name => this.getInfo(name))
      .filter(Boolean) as PluginInfo<Engine>[]
  }

  // 获取插件状态
  /**
   * 获取插件状态（当前实现为简化版）。
   */
  getStatus(name: string): PluginStatus | undefined {
    if (!this.plugins.has(name)) return undefined
    return 'installed' // 简化实现
  }

  // 解析依赖
  /**
   * 解析插件依赖并按合适顺序返回（当前实现简化为原序）。
   */
  resolveDependencies(plugins: Plugin[]): Plugin[] {
    // 简化实现，返回原数组
    return plugins
  }

  // 按关键词查找插件
  /**
   * 按关键字搜索插件（基于名称与描述）- 优化版
   */
  findByKeyword(keyword: string): Plugin[] {
    const lowerKeyword = keyword.toLowerCase()
    const results: Plugin[] = []
    
    for (const plugin of this.plugins.values()) {
      if (plugin.name.toLowerCase().includes(lowerKeyword) ||
          plugin.description?.toLowerCase().includes(lowerKeyword)) {
        results.push(plugin)
      }
    }
    
    return results
  }

  // 按作者查找插件
  /**
   * 按作者筛选插件（依赖插件公开 author 字段）。
   */
  findByAuthor(author: string): Plugin[] {
    return Array.from(this.plugins.values()).filter((plugin) => {
      return (plugin as { author?: string }).author === author
    })
  }

  // 按依赖查找插件
  /**
   * 查找依赖了指定插件名称的插件。
   */
  findByDependency(dependency: string): Plugin[] {
    return Array.from(this.plugins.values()).filter(plugin =>
      plugin.dependencies?.includes(dependency)
    )
  }

  destroy(): void {
    // 卸载所有插件（倒序卸载，与注册顺序相反）
    const reversedOrder = [...this.loadOrder].reverse()
    for (const pluginName of reversedOrder) {
      const plugin = this.plugins.get(pluginName)
      if (plugin && plugin.uninstall && this.engine) {
        try {
          plugin.uninstall({
            engine: this.engine,
            logger: this.engine.logger,
            config: this.engine.config,
            events: this.engine.events,
          } as PluginContext<Engine>)
        } catch (error) {
          this.engine?.logger?.error(`Error uninstalling plugin ${plugin.name}:`, error)
        }
      }
    }

    // 清理数据结构
    this.plugins.clear()
    this.loadOrder.length = 0

    // 清理缓存
    this.clearCaches()

    // 清理引擎引用
    this.engine = undefined
  }

  // 清理缓存 - 增强版
  private clearCaches(): void {
    this.dependencyCache = new WeakMap()
    this.dependencyGraphCache = undefined
    this.dependentsCache.clear()
    this.cacheInvalidated = true
  }

  // 实现接口需要的额外方法
  getInstalledPlugins(): Plugin[] {
    return this.getAll()
  }

  isInstalled(name: string): boolean {
    return this.isRegistered(name)
  }

  getPlugin(name: string): Plugin | undefined {
    return this.get(name)
  }

  getPluginStatus(name: string): PluginStatus | undefined {
    return this.getStatus(name)
  }

  async initializeAll(): Promise<void> {
    // 优化：并发初始化所有插件，提高启动速度
    const initPromises = Array.from(this.plugins.values()).map(async (plugin) => {
      try {
        if (this.engine && plugin.install) {
          const context = this.createPluginContext()
          await plugin.install(context)
        }
      } catch (error) {
        this.engine?.logger?.error(`Failed to initialize plugin ${plugin.name}:`, error)
      }
    })

    await Promise.all(initPromises)
  }

  // 新增的辅助方法

  /**
   * 抽取创建上下文的逻辑
   */
  private createPluginContext(): PluginContext<Engine> {
    if (!this.engine) {
      throw new Error('Engine is not initialized')
    }
    return {
      engine: this.engine,
      logger: this.engine.logger,
      config: this.engine.config,
      events: this.engine.events,
    }
  }

  /**
   * 记录插件错误
   */
  private logPluginError(pluginName: string, error: unknown): void {
    if (this.engine?.logger) {
      this.engine.logger.error(
        `Failed to register plugin "${pluginName}"`,
        error
      )
    }
  }
}

export function createPluginManager(engine?: Engine): PluginManager {
  return new PluginManagerImpl(engine)
}
