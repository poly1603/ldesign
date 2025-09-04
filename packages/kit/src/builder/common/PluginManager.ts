/**
 * 插件管理器基类
 * @module PluginManager
 * @description 提供插件管理的核心功能，支持插件注册、配置、生命周期管理等
 */

import type { BuildEnvironment } from '../types'

/**
 * 插件生命周期钩子
 */
export type PluginHook = 
  | 'pre-config'
  | 'config'
  | 'pre-build'
  | 'build'
  | 'post-build'
  | 'pre-transform'
  | 'transform'
  | 'post-transform'
  | 'error'
  | 'close'

/**
 * 插件元数据
 */
export interface PluginMetadata {
  name: string
  version?: string
  description?: string
  author?: string
  homepage?: string
  dependencies?: string[]
  peerDependencies?: string[]
  keywords?: string[]
  category?: 'optimization' | 'transform' | 'analysis' | 'utility' | 'framework'
}

/**
 * 插件上下文
 */
export interface PluginContext {
  environment: BuildEnvironment
  mode: 'development' | 'production' | 'test'
  config: Record<string, any>
  logger: PluginLogger
  cache: Map<string, any>
  utils: Record<string, Function>
}

/**
 * 插件日志器
 */
export interface PluginLogger {
  info(message: string): void
  warn(message: string): void
  error(message: string): void
  debug(message: string): void
}

/**
 * 插件配置
 */
export interface PluginConfig {
  enabled?: boolean
  priority?: number
  options?: Record<string, any>
  apply?: BuildEnvironment | BuildEnvironment[] | ((context: PluginContext) => boolean)
  enforce?: 'pre' | 'post'
}

/**
 * 插件接口
 */
export interface Plugin<T = any> {
  name: string
  metadata?: PluginMetadata
  config?: PluginConfig
  setup?(context: PluginContext): void | Promise<void>
  apply?(options: T): any
  hooks?: Partial<Record<PluginHook, Function>>
  cleanup?(): void | Promise<void>
}

/**
 * 插件注册选项
 */
export interface PluginRegistration<T = any> {
  plugin: Plugin<T> | (() => Plugin<T> | Promise<Plugin<T>>)
  config?: PluginConfig
  options?: T
}

/**
 * 插件管理器基类
 * @class PluginManager
 * @template P 插件类型
 */
export abstract class PluginManager<P = any> {
  /**
   * 已注册的插件
   */
  protected plugins: Map<string, Plugin<P>> = new Map()

  /**
   * 插件配置
   */
  protected pluginConfigs: Map<string, PluginConfig> = new Map()

  /**
   * 插件选项
   */
  protected pluginOptions: Map<string, P> = new Map()

  /**
   * 插件实例
   */
  protected pluginInstances: Map<string, any> = new Map()

  /**
   * 插件依赖关系
   */
  protected dependencies: Map<string, Set<string>> = new Map()

  /**
   * 插件加载顺序
   */
  protected loadOrder: string[] = []

  /**
   * 当前环境
   */
  protected environment: BuildEnvironment = 'production'

  /**
   * 插件上下文
   */
  protected context: PluginContext

  /**
   * 是否已初始化
   */
  protected initialized = false

  constructor(environment: BuildEnvironment = 'production') {
    this.environment = environment
    this.context = this.createContext()
  }

  /**
   * 创建插件上下文
   */
  protected createContext(): PluginContext {
    return {
      environment: this.environment,
      mode: this.environment === 'development' ? 'development' : 'production',
      config: {},
      logger: this.createLogger(),
      cache: new Map(),
      utils: this.createUtils()
    }
  }

  /**
   * 创建日志器
   */
  protected createLogger(): PluginLogger {
    const prefix = '[PluginManager]'
    return {
      info: (message: string) => console.log(`${prefix} ℹ️ ${message}`),
      warn: (message: string) => console.warn(`${prefix} ⚠️ ${message}`),
      error: (message: string) => console.error(`${prefix} ❌ ${message}`),
      debug: (message: string) => console.debug(`${prefix} 🔍 ${message}`)
    }
  }

  /**
   * 创建工具函数集
   */
  protected createUtils(): Record<string, Function> {
    return {
      // 基础工具函数
      isProduction: () => this.environment === 'production',
      isDevelopment: () => this.environment === 'development',
      isTest: () => this.environment === 'test'
    }
  }

  /**
   * 注册插件
   */
  async register(registration: PluginRegistration<P>): Promise<void> {
    const plugin = await this.resolvePlugin(registration.plugin)
    
    if (this.plugins.has(plugin.name)) {
      this.context.logger.warn(`插件 "${plugin.name}" 已存在，将被覆盖`)
    }

    // 保存插件和配置
    this.plugins.set(plugin.name, plugin)
    this.pluginConfigs.set(plugin.name, {
      ...plugin.config,
      ...registration.config
    })
    
    if (registration.options) {
      this.pluginOptions.set(plugin.name, registration.options)
    }

    // 处理依赖关系
    if (plugin.metadata?.dependencies) {
      this.dependencies.set(
        plugin.name,
        new Set(plugin.metadata.dependencies)
      )
    }

    this.context.logger.debug(`插件 "${plugin.name}" 注册成功`)
  }

  /**
   * 批量注册插件
   */
  async registerBatch(registrations: PluginRegistration<P>[]): Promise<void> {
    for (const registration of registrations) {
      await this.register(registration)
    }
  }

  /**
   * 解析插件
   */
  protected async resolvePlugin(
    plugin: Plugin<P> | (() => Plugin<P> | Promise<Plugin<P>>)
  ): Promise<Plugin<P>> {
    if (typeof plugin === 'function') {
      return await plugin()
    }
    return plugin
  }

  /**
   * 初始化所有插件
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    // 计算加载顺序
    this.calculateLoadOrder()

    // 按顺序初始化插件
    for (const name of this.loadOrder) {
      await this.initializePlugin(name)
    }

    this.initialized = true
    this.context.logger.info('所有插件初始化完成')
  }

  /**
   * 初始化单个插件
   */
  protected async initializePlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name)
    const config = this.pluginConfigs.get(name)
    
    if (!plugin) {
      throw new Error(`插件 "${name}" 不存在`)
    }

    // 检查是否应该应用此插件
    if (!this.shouldApply(config)) {
      this.context.logger.debug(`跳过插件 "${name}" (不适用于当前环境)`)
      return
    }

    // 检查是否启用
    if (config?.enabled === false) {
      this.context.logger.debug(`跳过插件 "${name}" (已禁用)`)
      return
    }

    try {
      // 执行插件 setup
      if (plugin.setup) {
        await plugin.setup(this.context)
      }

      // 应用插件
      if (plugin.apply) {
        const options = this.pluginOptions.get(name)
        const instance = await plugin.apply(options)
        if (instance) {
          this.pluginInstances.set(name, instance)
        }
      }

      this.context.logger.debug(`插件 "${name}" 初始化成功`)
    } catch (error) {
      this.context.logger.error(`插件 "${name}" 初始化失败: ${error}`)
      throw error
    }
  }

  /**
   * 计算插件加载顺序
   */
  protected calculateLoadOrder(): void {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []

    const visit = (name: string) => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        throw new Error(`检测到循环依赖: ${name}`)
      }

      visiting.add(name)

      // 先访问依赖
      const deps = this.dependencies.get(name)
      if (deps) {
        for (const dep of deps) {
          if (this.plugins.has(dep)) {
            visit(dep)
          }
        }
      }

      visiting.delete(name)
      visited.add(name)
      order.push(name)
    }

    // 按优先级排序
    const sortedPlugins = Array.from(this.plugins.keys()).sort((a, b) => {
      const priorityA = this.pluginConfigs.get(a)?.priority || 0
      const priorityB = this.pluginConfigs.get(b)?.priority || 0
      return priorityB - priorityA
    })

    // 访问所有插件
    for (const name of sortedPlugins) {
      visit(name)
    }

    this.loadOrder = order
  }

  /**
   * 检查插件是否应该应用
   */
  protected shouldApply(config?: PluginConfig): boolean {
    if (!config?.apply) {
      return true
    }

    if (typeof config.apply === 'function') {
      return config.apply(this.context)
    }

    const envs = Array.isArray(config.apply) ? config.apply : [config.apply]
    return envs.includes(this.environment)
  }

  /**
   * 执行插件钩子
   */
  async executeHook(hook: PluginHook, ...args: any[]): Promise<any[]> {
    const results: any[] = []

    // 按照 enforce 顺序分组
    const prePlugins: string[] = []
    const normalPlugins: string[] = []
    const postPlugins: string[] = []

    for (const name of this.loadOrder) {
      const config = this.pluginConfigs.get(name)
      if (config?.enabled === false) continue
      if (!this.shouldApply(config)) continue

      if (config?.enforce === 'pre') {
        prePlugins.push(name)
      } else if (config?.enforce === 'post') {
        postPlugins.push(name)
      } else {
        normalPlugins.push(name)
      }
    }

    // 按顺序执行钩子
    const executeOrder = [...prePlugins, ...normalPlugins, ...postPlugins]

    for (const name of executeOrder) {
      const plugin = this.plugins.get(name)
      const hookFn = plugin?.hooks?.[hook]

      if (hookFn) {
        try {
          const result = await hookFn.apply(plugin, args)
          if (result !== undefined) {
            results.push(result)
          }
        } catch (error) {
          this.context.logger.error(`插件 "${name}" 钩子 "${hook}" 执行失败: ${error}`)
          if (hook !== 'error') {
            await this.executeHook('error', error, { plugin: name, hook })
          }
        }
      }
    }

    return results
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): Plugin<P> | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取插件实例
   */
  getPluginInstance(name: string): any {
    return this.pluginInstances.get(name)
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): Plugin<P>[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取已启用的插件
   */
  getEnabledPlugins(): Plugin<P>[] {
    return this.getAllPlugins().filter(plugin => {
      const config = this.pluginConfigs.get(plugin.name)
      return config?.enabled !== false && this.shouldApply(config)
    })
  }

  /**
   * 启用插件
   */
  async enablePlugin(name: string): Promise<void> {
    const config = this.pluginConfigs.get(name)
    if (config) {
      config.enabled = true
      if (this.initialized) {
        await this.initializePlugin(name)
      }
    }
  }

  /**
   * 禁用插件
   */
  async disablePlugin(name: string): Promise<void> {
    const config = this.pluginConfigs.get(name)
    if (config) {
      config.enabled = false
      await this.cleanupPlugin(name)
    }
  }

  /**
   * 移除插件
   */
  async removePlugin(name: string): Promise<void> {
    await this.cleanupPlugin(name)
    
    this.plugins.delete(name)
    this.pluginConfigs.delete(name)
    this.pluginOptions.delete(name)
    this.pluginInstances.delete(name)
    this.dependencies.delete(name)
    
    // 重新计算加载顺序
    this.calculateLoadOrder()
  }

  /**
   * 清理插件
   */
  protected async cleanupPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name)
    
    if (plugin?.cleanup) {
      try {
        await plugin.cleanup()
      } catch (error) {
        this.context.logger.error(`插件 "${name}" 清理失败: ${error}`)
      }
    }
    
    this.pluginInstances.delete(name)
  }

  /**
   * 清理所有插件
   */
  async cleanup(): Promise<void> {
    for (const name of this.loadOrder.reverse()) {
      await this.cleanupPlugin(name)
    }
    
    this.plugins.clear()
    this.pluginConfigs.clear()
    this.pluginOptions.clear()
    this.pluginInstances.clear()
    this.dependencies.clear()
    this.loadOrder = []
    this.initialized = false
  }

  /**
   * 获取插件统计信息
   */
  getStatistics(): {
    total: number
    enabled: number
    disabled: number
    byCategory: Record<string, number>
    byEnvironment: Record<string, number>
  } {
    const stats = {
      total: this.plugins.size,
      enabled: 0,
      disabled: 0,
      byCategory: {} as Record<string, number>,
      byEnvironment: {} as Record<string, number>
    }

    for (const [name, plugin] of this.plugins) {
      const config = this.pluginConfigs.get(name)
      
      // 统计启用状态
      if (config?.enabled === false) {
        stats.disabled++
      } else {
        stats.enabled++
      }

      // 统计类别
      const category = plugin.metadata?.category || 'utility'
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1

      // 统计环境
      if (config?.apply) {
        const envs = Array.isArray(config.apply) ? config.apply : [config.apply]
        for (const env of envs) {
          if (typeof env === 'string') {
            stats.byEnvironment[env] = (stats.byEnvironment[env] || 0) + 1
          }
        }
      } else {
        stats.byEnvironment['all'] = (stats.byEnvironment['all'] || 0) + 1
      }
    }

    return stats
  }

  /**
   * 验证插件依赖
   */
  validateDependencies(): { valid: boolean; missing: string[] } {
    const missing: string[] = []

    for (const [name, deps] of this.dependencies) {
      for (const dep of deps) {
        if (!this.plugins.has(dep)) {
          missing.push(`${name} -> ${dep}`)
        }
      }
    }

    return {
      valid: missing.length === 0,
      missing
    }
  }

  /**
   * 获取插件依赖树
   */
  getDependencyTree(): Record<string, string[]> {
    const tree: Record<string, string[]> = {}
    
    for (const [name, deps] of this.dependencies) {
      tree[name] = Array.from(deps)
    }
    
    return tree
  }

  /**
   * 设置环境
   */
  setEnvironment(environment: BuildEnvironment): void {
    this.environment = environment
    this.context.environment = environment
    this.context.mode = environment === 'development' ? 'development' : 'production'
  }

  /**
   * 导出插件配置
   */
  exportConfig(): Record<string, any> {
    const config: Record<string, any> = {}
    
    for (const [name, plugin] of this.plugins) {
      config[name] = {
        metadata: plugin.metadata,
        config: this.pluginConfigs.get(name),
        options: this.pluginOptions.get(name)
      }
    }
    
    return config
  }

  /**
   * 导入插件配置
   */
  async importConfig(config: Record<string, any>): Promise<void> {
    for (const [name, data] of Object.entries(config)) {
      // 这里需要插件加载逻辑
      // 可以通过插件注册表或动态导入实现
    }
  }
}
