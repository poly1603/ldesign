/**
 * 插件管理器实现
 * 负责插件的注册、卸载、依赖管理等
 */

import type {
  Plugin,
  PluginContext,
  PluginInfo,
  PluginManager,
  PluginStatus,
} from '../types'
import { PluginError, ErrorCodes } from '../errors'

/**
 * 依赖解析缓存项
 */
interface DependencyCacheEntry {
  /** 依赖图的哈希值 */
  graphHash: string
  /** 拓扑排序结果 */
  sortedOrder: string[]
  /** 缓存时间戳 */
  timestamp: number
  /** 命中次数 */
  hitCount: number
}

export class CorePluginManager implements PluginManager {
  private plugins = new Map<string, Plugin>()
  private pluginInfos = new Map<string, PluginInfo>()
  private dependencyGraph = new Map<string, string[]>()
  private loadOrder: string[] = []

  private context: Partial<PluginContext> = {}

  // 依赖解析缓存
  private dependencyCache: DependencyCacheEntry | null = null
  private cacheStats = {
    hits: 0,
    misses: 0,
    invalidations: 0,
  }

  constructor(context?: Partial<PluginContext>) {
    if (context) {
      this.context = context
    }
  }

  /**
   * 设置插件上下文
   */
  setContext(context: Partial<PluginContext>): void {
    this.context = { ...this.context, ...context }
  }

  /**
   * 注册插件
   */
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      const existingInfo = this.pluginInfos.get(plugin.name)
      throw new PluginError(
        ErrorCodes.PLUGIN_ALREADY_REGISTERED,
        `插件 "${plugin.name}" 已经注册`,
        plugin.name,
        {
          existingVersion: existingInfo?.version,
          newVersion: plugin.version,
          suggestions: [
            '先卸载现有插件',
            '使用不同的插件名称',
            '检查是否重复注册'
          ]
        }
      )
    }

    // 检查依赖
    const depCheck = this.checkDependencies(plugin)
    if (!depCheck.satisfied) {
      throw new PluginError(
        ErrorCodes.PLUGIN_DEPENDENCY_MISSING,
        `插件 "${plugin.name}" 缺少依赖`,
        plugin.name,
        {
          missing: depCheck.missing,
          suggestions: [
            `先注册依赖插件: ${depCheck.missing.join(', ')}`,
            '检查插件加载顺序',
            '查看插件文档了解依赖要求'
          ]
        }
      )
    }

    // 创建插件信息
    const pluginInfo: PluginInfo = {
      plugin,
      status: 'pending',
      dependencies: plugin.dependencies || [],
      dependents: [],
    }

    // 保存插件
    this.plugins.set(plugin.name, plugin)
    this.pluginInfos.set(plugin.name, pluginInfo)

    // 更新依赖图
    this.updateDependencyGraph()

    // 执行安装
    try {
      pluginInfo.status = 'installing'

      // 调用 beforeInstall 钩子
      if (plugin.beforeInstall) {
        await plugin.beforeInstall(this.context as PluginContext)
      }

      // 调用 install
      await plugin.install(this.context as PluginContext)

      // 调用 afterInstall 钩子
      if (plugin.afterInstall) {
        await plugin.afterInstall(this.context as PluginContext)
      }

      pluginInfo.status = 'installed'
      pluginInfo.installTime = Date.now()
    } catch (error) {
      pluginInfo.status = 'error'
      pluginInfo.error = error as Error
      throw error
    }
  }

  /**
   * 注销插件
   */
  async unregister(name: string): Promise<void> {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    const pluginInfo = this.pluginInfos.get(name)!

    try {
      pluginInfo.status = 'uninstalling'

      // 调用 beforeUninstall 钩子
      if (plugin.beforeUninstall) {
        await plugin.beforeUninstall(this.context as PluginContext)
      }

      // 调用 uninstall
      if (plugin.uninstall) {
        await plugin.uninstall(this.context as PluginContext)
      }

      // 调用 afterUninstall 钩子
      if (plugin.afterUninstall) {
        await plugin.afterUninstall(this.context as PluginContext)
      }

      // 移除插件
      this.plugins.delete(name)
      this.pluginInfos.delete(name)
      this.updateDependencyGraph()
    } catch (error) {
      pluginInfo.status = 'error'
      pluginInfo.error = error as Error
      throw error
    }
  }

  /**
   * 获取插件
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取插件信息
   */
  getInfo(name: string): PluginInfo | undefined {
    return this.pluginInfos.get(name)
  }

  /**
   * 获取所有插件
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取所有插件信息
   */
  getAllInfo(): PluginInfo[] {
    return Array.from(this.pluginInfos.values())
  }

  /**
   * 检查插件是否已注册
   */
  isRegistered(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 检查插件是否存在
   */
  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 获取插件状态
   */
  getStatus(name: string): PluginStatus | undefined {
    return this.pluginInfos.get(name)?.status
  }

  /**
   * 检查依赖
   */
  checkDependencies(plugin: Plugin): {
    satisfied: boolean
    missing: string[]
    conflicts: string[]
  } {
    const dependencies = plugin.dependencies || []
    const missing: string[] = []
    const conflicts: string[] = []

    for (const dep of dependencies) {
      if (!this.isRegistered(dep)) {
        missing.push(dep)
      }
    }

    return {
      satisfied: missing.length === 0 && conflicts.length === 0,
      missing,
      conflicts,
    }
  }

  /**
   * 获取加载顺序
   */
  getLoadOrder(): string[] {
    return [...this.loadOrder]
  }

  /**
   * 获取依赖图
   */
  getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {}
    this.dependencyGraph.forEach((deps, name) => {
      graph[name] = [...deps]
    })
    return graph
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    loaded: string[]
    dependencies: Record<string, string[]>
    installed: number
    pending: number
    errors: number
    cache?: {
      hits: number
      misses: number
      invalidations: number
      hitRate: number
      lastCacheTime?: number
      cacheHitCount?: number
    }
  } {
    const infos = this.getAllInfo()
    const stats: any = {
      total: this.plugins.size,
      loaded: Array.from(this.plugins.keys()),
      dependencies: this.getDependencyGraph(),
      installed: infos.filter(i => i.status === 'installed').length,
      pending: infos.filter(i => i.status === 'pending').length,
      errors: infos.filter(i => i.status === 'error').length,
    }

    // 添加缓存统计
    const totalAccess = this.cacheStats.hits + this.cacheStats.misses
    if (totalAccess > 0) {
      stats.cache = {
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        invalidations: this.cacheStats.invalidations,
        hitRate: this.cacheStats.hits / totalAccess,
        lastCacheTime: this.dependencyCache?.timestamp,
        cacheHitCount: this.dependencyCache?.hitCount,
      }
    }

    return stats
  }

  /**
   * 使缓存失效
   */
  invalidateCache(): void {
    if (this.dependencyCache) {
      this.cacheStats.invalidations++
      this.dependencyCache = null
    }
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    hits: number
    misses: number
    invalidations: number
    hitRate: number
    currentCache: {
      exists: boolean
      timestamp?: number
      hitCount?: number
      pluginCount?: number
    }
  } {
    const totalAccess = this.cacheStats.hits + this.cacheStats.misses
    return {
      hits: this.cacheStats.hits,
      misses: this.cacheStats.misses,
      invalidations: this.cacheStats.invalidations,
      hitRate: totalAccess > 0 ? this.cacheStats.hits / totalAccess : 0,
      currentCache: {
        exists: this.dependencyCache !== null,
        timestamp: this.dependencyCache?.timestamp,
        hitCount: this.dependencyCache?.hitCount,
        pluginCount: this.dependencyCache?.sortedOrder.length,
      },
    }
  }

  /**
   * 更新依赖图
   */
  private updateDependencyGraph(): void {
    this.dependencyGraph.clear()
    this.plugins.forEach((plugin, name) => {
      this.dependencyGraph.set(name, plugin.dependencies || [])
    })
    this.loadOrder = this.topologicalSortWithCache()
  }

  /**
   * 计算依赖图的哈希值
   */
  private computeGraphHash(): string {
    const entries: string[] = []
    // 按插件名称排序以确保一致性
    const sortedNames = Array.from(this.dependencyGraph.keys()).sort()
    for (const name of sortedNames) {
      const deps = this.dependencyGraph.get(name) || []
      entries.push(`${name}:${deps.sort().join(',')}`)
    }
    return entries.join('|')
  }

  /**
   * 带缓存的拓扑排序
   */
  private topologicalSortWithCache(): string[] {
    const currentHash = this.computeGraphHash()

    // 检查缓存是否有效
    if (this.dependencyCache && this.dependencyCache.graphHash === currentHash) {
      this.cacheStats.hits++
      this.dependencyCache.hitCount++
      return [...this.dependencyCache.sortedOrder]
    }

    // 缓存未命中,执行拓扑排序
    this.cacheStats.misses++
    const sorted = this.topologicalSort()

    // 更新缓存
    this.dependencyCache = {
      graphHash: currentHash,
      sortedOrder: sorted,
      timestamp: Date.now(),
      hitCount: 0,
    }

    return [...sorted]
  }

  /**
   * 拓扑排序
   */
  private topologicalSort(): string[] {
    const sorted: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (name: string) => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`)
      }

      visiting.add(name)
      const deps = this.dependencyGraph.get(name) || []
      for (const dep of deps) {
        visit(dep)
      }
      visiting.delete(name)
      visited.add(name)
      sorted.push(name)
    }

    this.plugins.forEach((_, name) => visit(name))
    return sorted
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    // 初始化逻辑（如果需要）
  }

  /**
   * 销毁
   */
  async destroy(): Promise<void> {
    // 卸载所有插件
    const names = Array.from(this.plugins.keys())
    for (const name of names) {
      try {
        await this.unregister(name)
      } catch (error) {
        console.error(`Failed to unregister plugin "${name}":`, error)
      }
    }

    this.plugins.clear()
    this.pluginInfos.clear()
    this.dependencyGraph.clear()
    this.loadOrder = []
  }
}

/**
 * 创建插件管理器
 */
export function createPluginManager(context?: Partial<PluginContext>): PluginManager {
  return new CorePluginManager(context)
}

