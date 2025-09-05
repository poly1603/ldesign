/**
 * 插件管理器（为后续 plugin 包预留）
 * 
 * 负责插件的注册、加载、卸载和管理
 * 为后续的 @ldesign/plugin 包预留扩展接口
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { EventEmitter } from 'events'
import { Logger } from '../utils/logger'

import type {
  IPluginManager,
  LauncherPlugin,
  PluginInfo,
  PluginRegistrationOptions,
  AsyncResult,
  ValidationResult
} from '../types'
import { PluginStatus } from '../types'

/**
 * 插件管理器类
 * 
 * 提供插件的生命周期管理、依赖解析、状态监控等功能
 * 为后续的 plugin 包预留完整的扩展接口
 */
export class PluginManager extends EventEmitter implements IPluginManager {
  /** 日志记录器 */
  private logger: Logger

  /** 已注册的插件映射 */
  private plugins: Map<string, PluginInfo> = new Map()

  /** 插件依赖图 */
  private dependencyGraph: Map<string, Set<string>> = new Map()

  /** 插件加载顺序 */
  private loadOrder: string[] = []

  /**
   * 构造函数
   */
  constructor() {
    super()

    // 初始化日志记录器
    this.logger = new Logger('PluginManager', {
      level: 'info',
      colors: true
    })

    this.logger.debug('插件管理器初始化完成')
  }

  /**
   * 注册插件
   * 
   * @param plugin - 要注册的插件
   * @param options - 注册选项
   * @returns 注册结果
   */
  async register(plugin: LauncherPlugin, options: PluginRegistrationOptions = {}): Promise<AsyncResult> {
    try {
      // 验证插件
      const validation = this.validatePlugin(plugin)
      if (!validation.valid) {
        return {
          success: false,
          error: `插件验证失败: ${validation.errors.join(', ')}`
        }
      }

      const pluginName = plugin.name || 'unknown'

      // 检查是否已存在
      if (this.plugins.has(pluginName) && !options.override) {
        return {
          success: false,
          error: `插件 "${pluginName}" 已存在`
        }
      }

      this.logger.info('正在注册插件', { name: pluginName })

      // 创建插件信息
      const pluginInfo: PluginInfo = {
        plugin,
        status: PluginStatus.UNLOADED,
        loadTime: 0,
        lastActivity: Date.now(),
        stats: {
          callCount: 0,
          totalExecutionTime: 0,
          averageExecutionTime: 0,
          errorCount: 0,
          lastExecutionTime: 0
        }
      }

      // 注册插件
      this.plugins.set(pluginName, pluginInfo)

      // 构建依赖图
      this.buildDependencyGraph(plugin)

      // 如果启用自动启用，则启用插件
      if (options.autoEnable) {
        const enableResult = await this.enable(pluginName)
        if (!enableResult.success) {
          // 如果启用失败，移除插件
          this.plugins.delete(pluginName)
          return enableResult
        }
      }

      // 触发注册事件
      this.emit('registered', { plugin, timestamp: Date.now() })

      this.logger.success('插件注册成功', { name: pluginName })

      return {
        success: true,
        data: pluginInfo
      }

    } catch (error) {
      this.logger.error('插件注册失败', { error: (error as Error).message })
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * 卸载插件
   * 
   * @param pluginName - 插件名称
   * @returns 卸载结果
   */
  async unregister(pluginName: string): Promise<AsyncResult> {
    try {
      const pluginInfo = this.plugins.get(pluginName)
      if (!pluginInfo) {
        return {
          success: false,
          error: `插件 "${pluginName}" 不存在`
        }
      }

      this.logger.info('正在卸载插件', { name: pluginName })

      // 如果插件已启用，先禁用
      if (pluginInfo.status === PluginStatus.ENABLED) {
        const disableResult = await this.disable(pluginName)
        if (!disableResult.success) {
          return disableResult
        }
      }

      // 执行插件销毁方法
      if (pluginInfo.plugin.destroy) {
        await pluginInfo.plugin.destroy()
      }

      // 从依赖图中移除
      this.dependencyGraph.delete(pluginName)

      // 移除插件
      this.plugins.delete(pluginName)

      // 重新计算加载顺序
      this.calculateLoadOrder()

      // 触发卸载事件
      this.emit('unregistered', { pluginName, timestamp: Date.now() })

      this.logger.success('插件卸载成功', { name: pluginName })

      return { success: true }

    } catch (error) {
      this.logger.error('插件卸载失败', { error: (error as Error).message })
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * 启用插件
   * 
   * @param pluginName - 插件名称
   * @returns 启用结果
   */
  async enable(pluginName: string): Promise<AsyncResult> {
    try {
      const pluginInfo = this.plugins.get(pluginName)
      if (!pluginInfo) {
        return {
          success: false,
          error: `插件 "${pluginName}" 不存在`
        }
      }

      if (pluginInfo.status === PluginStatus.ENABLED) {
        return {
          success: true,
          data: '插件已启用'
        }
      }

      this.logger.info('正在启用插件', { name: pluginName })

      // 更新状态
      pluginInfo.status = PluginStatus.LOADING

      // 执行插件初始化
      if (pluginInfo.plugin.init) {
        // 注意：这里需要传入 launcher 实例，但为了避免循环依赖，暂时传入 null
        // 在实际使用时，应该由 ViteLauncher 类来管理插件
        await pluginInfo.plugin.init(null as any)
      }

      // 更新状态和统计信息
      pluginInfo.status = PluginStatus.ENABLED
      pluginInfo.loadTime = Date.now()
      pluginInfo.lastActivity = Date.now()

      // 触发启用事件
      this.emit('enabled', { plugin: pluginInfo.plugin, timestamp: Date.now() })

      this.logger.success('插件启用成功', { name: pluginName })

      return { success: true }

    } catch (error) {
      // 更新错误状态
      const pluginInfo = this.plugins.get(pluginName)
      if (pluginInfo) {
        pluginInfo.status = PluginStatus.ERROR
        pluginInfo.error = error as Error
        pluginInfo.stats.errorCount++
      }

      this.logger.error('插件启用失败', { name: pluginName, error: (error as Error).message })

      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * 禁用插件
   * 
   * @param pluginName - 插件名称
   * @returns 禁用结果
   */
  async disable(pluginName: string): Promise<AsyncResult> {
    try {
      const pluginInfo = this.plugins.get(pluginName)
      if (!pluginInfo) {
        return {
          success: false,
          error: `插件 "${pluginName}" 不存在`
        }
      }

      if (pluginInfo.status === PluginStatus.DISABLED) {
        return {
          success: true,
          data: '插件已禁用'
        }
      }

      this.logger.info('正在禁用插件', { name: pluginName })

      // 执行插件销毁方法
      if (pluginInfo.plugin.destroy) {
        await pluginInfo.plugin.destroy()
      }

      // 更新状态
      pluginInfo.status = PluginStatus.DISABLED
      pluginInfo.lastActivity = Date.now()

      // 触发禁用事件
      this.emit('disabled', { plugin: pluginInfo.plugin, timestamp: Date.now() })

      this.logger.success('插件禁用成功', { name: pluginName })

      return { success: true }

    } catch (error) {
      this.logger.error('插件禁用失败', { name: pluginName, error: (error as Error).message })
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * 获取所有插件
   * 
   * @returns 插件列表
   */
  getPlugins(): LauncherPlugin[] {
    return Array.from(this.plugins.values()).map(info => info.plugin)
  }

  /**
   * 获取已启用的插件
   * 
   * @returns 已启用的插件列表
   */
  getEnabledPlugins(): LauncherPlugin[] {
    return Array.from(this.plugins.values())
      .filter(info => info.status === PluginStatus.ENABLED)
      .map(info => info.plugin)
  }

  /**
   * 获取插件信息
   * 
   * @param pluginName - 插件名称
   * @returns 插件信息
   */
  getPluginInfo(pluginName: string): PluginInfo | null {
    return this.plugins.get(pluginName) || null
  }

  /**
   * 验证插件
   * 
   * @param plugin - 要验证的插件
   * @returns 验证结果
   */
  validatePlugin(plugin: LauncherPlugin): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证插件名称
    if (!plugin.name || typeof plugin.name !== 'string') {
      errors.push('插件必须有有效的名称')
    }

    // 验证插件元数据
    if (plugin.meta) {
      if (!plugin.meta.version) {
        warnings.push('建议提供插件版本信息')
      }

      if (!plugin.meta.description) {
        warnings.push('建议提供插件描述')
      }
    }

    // 验证插件配置
    if (plugin.config) {
      if (plugin.config.priority && typeof plugin.config.priority !== 'number') {
        errors.push('插件优先级必须是数字')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 解析插件依赖
   *
   * @returns 解析结果
   */
  async resolveDependencies(): Promise<AsyncResult> {
    try {
      this.logger.info('正在解析插件依赖...')

      // 检查循环依赖
      const circularDeps = this.detectCircularDependencies()
      if (circularDeps.length > 0) {
        return {
          success: false,
          error: `检测到循环依赖: ${circularDeps.map(cycle => cycle.join(' -> ')).join(', ')}`
        }
      }

      // 计算加载顺序
      this.calculateLoadOrder()

      this.logger.success('插件依赖解析完成', {
        loadOrder: this.loadOrder
      })

      return {
        success: true,
        data: {
          loadOrder: this.loadOrder,
          dependencyGraph: Object.fromEntries(this.dependencyGraph)
        }
      }

    } catch (error) {
      this.logger.error('插件依赖解析失败', { error: (error as Error).message })
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  /**
   * 清理插件缓存
   */
  async clearCache(): Promise<void> {
    try {
      this.logger.info('正在清理插件缓存...')

      // 重置所有插件统计信息
      for (const pluginInfo of this.plugins.values()) {
        pluginInfo.stats = {
          callCount: 0,
          totalExecutionTime: 0,
          averageExecutionTime: 0,
          errorCount: 0,
          lastExecutionTime: 0
        }
      }

      this.logger.success('插件缓存清理完成')

    } catch (error) {
      this.logger.error('清理插件缓存失败', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * 获取插件统计信息
   *
   * @returns 统计信息
   */
  getStats(): {
    totalPlugins: number
    enabledPlugins: number
    disabledPlugins: number
    errorPlugins: number
    loadOrder: string[]
  } {
    const stats = {
      totalPlugins: this.plugins.size,
      enabledPlugins: 0,
      disabledPlugins: 0,
      errorPlugins: 0,
      loadOrder: [...this.loadOrder]
    }

    for (const pluginInfo of this.plugins.values()) {
      switch (pluginInfo.status) {
        case PluginStatus.ENABLED:
          stats.enabledPlugins++
          break
        case PluginStatus.DISABLED:
          stats.disabledPlugins++
          break
        case PluginStatus.ERROR:
          stats.errorPlugins++
          break
      }
    }

    return stats
  }

  /**
   * 构建依赖图
   *
   * @param plugin - 插件
   */
  private buildDependencyGraph(plugin: LauncherPlugin): void {
    const pluginName = plugin.name || 'unknown'

    if (!this.dependencyGraph.has(pluginName)) {
      this.dependencyGraph.set(pluginName, new Set())
    }

    // 如果插件有依赖信息，添加到依赖图
    if (plugin.meta?.dependencies) {
      const dependencies = this.dependencyGraph.get(pluginName)!
      plugin.meta.dependencies.forEach(dep => dependencies.add(dep))
    }
  }

  /**
   * 检测循环依赖
   *
   * @returns 循环依赖列表
   */
  private detectCircularDependencies(): string[][] {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const cycles: string[][] = []

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // 找到循环依赖
        const cycleStart = path.indexOf(node)
        cycles.push([...path.slice(cycleStart), node])
        return
      }

      if (visited.has(node)) {
        return
      }

      visited.add(node)
      recursionStack.add(node)

      const dependencies = this.dependencyGraph.get(node) || new Set()
      for (const dep of dependencies) {
        dfs(dep, [...path, node])
      }

      recursionStack.delete(node)
    }

    for (const node of this.dependencyGraph.keys()) {
      if (!visited.has(node)) {
        dfs(node, [])
      }
    }

    return cycles
  }

  /**
   * 计算加载顺序（拓扑排序）
   */
  private calculateLoadOrder(): void {
    const inDegree = new Map<string, number>()
    const queue: string[] = []
    const result: string[] = []

    // 初始化入度
    for (const node of this.dependencyGraph.keys()) {
      inDegree.set(node, 0)
    }

    // 计算入度
    for (const dependencies of this.dependencyGraph.values()) {
      for (const dep of dependencies) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1)
      }
    }

    // 找到入度为 0 的节点
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(node)
      }
    }

    // 拓扑排序
    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)

      const dependencies = this.dependencyGraph.get(node) || new Set()
      for (const dep of dependencies) {
        const newDegree = (inDegree.get(dep) || 0) - 1
        inDegree.set(dep, newDegree)

        if (newDegree === 0) {
          queue.push(dep)
        }
      }
    }

    this.loadOrder = result
  }

  /**
   * 销毁插件管理器
   */
  async destroy(): Promise<void> {
    try {
      this.logger.info('正在销毁插件管理器...')

      // 禁用所有插件
      for (const pluginName of this.plugins.keys()) {
        await this.disable(pluginName)
      }

      // 清理所有数据
      this.plugins.clear()
      this.dependencyGraph.clear()
      this.loadOrder = []

      // 移除所有事件监听器
      this.removeAllListeners()

      this.logger.success('插件管理器已销毁')

    } catch (error) {
      this.logger.error('销毁插件管理器失败', { error: (error as Error).message })
      throw error
    }
  }
}
