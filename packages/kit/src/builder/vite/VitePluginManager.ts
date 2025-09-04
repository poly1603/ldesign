/**
 * Vite 插件管理器
 * @module VitePluginManager
 * @description 提供 Vite 插件的管理和配置功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin as VitePlugin } from 'vite'
import type { PluginConfig, BuildEnvironment } from '../types'

/**
 * 插件选项接口
 */
export interface PluginOptions {
  /** 插件名称 */
  name: string
  /** 是否启用 */
  enabled?: boolean
  /** 应用环境 */
  apply?: BuildEnvironment | BuildEnvironment[]
  /** 插件配置 */
  options?: Record<string, any>
}

/**
 * Vite 插件管理器
 * @class VitePluginManager
 * @description 管理和配置 Vite 插件
 */
export class VitePluginManager {
  /**
   * 插件列表
   * @private
   */
  private plugins: Map<string, VitePlugin> = new Map()

  /**
   * 插件配置列表
   * @private
   */
  private pluginConfigs: Map<string, PluginConfig> = new Map()

  /**
   * 当前环境
   * @private
   */
  private environment: BuildEnvironment = 'production'

  /**
   * 构造函数
   * @param {BuildEnvironment} environment - 构建环境
   */
  constructor(environment: BuildEnvironment = 'production') {
    this.environment = environment
  }

  /**
   * 注册插件
   * @param {string} name - 插件名称
   * @param {VitePlugin | (() => VitePlugin)} plugin - 插件或插件工厂函数
   * @param {PluginOptions} options - 插件选项
   */
  register(
    name: string,
    plugin: VitePlugin | (() => VitePlugin),
    options?: PluginOptions
  ): void {
    // 创建插件配置
    const config: PluginConfig = {
      name,
      enabled: options?.enabled ?? true,
      apply: options?.apply,
      options: options?.options
    }

    // 检查是否应该在当前环境下应用
    if (!this.shouldApply(config)) {
      return
    }

    // 获取插件实例
    const pluginInstance = typeof plugin === 'function' ? plugin() : plugin

    // 保存插件和配置
    this.plugins.set(name, pluginInstance)
    this.pluginConfigs.set(name, config)
  }

  /**
   * 移除插件
   * @param {string} name - 插件名称
   */
  remove(name: string): void {
    this.plugins.delete(name)
    this.pluginConfigs.delete(name)
  }

  /**
   * 获取插件
   * @param {string} name - 插件名称
   * @returns {VitePlugin | undefined} 插件实例
   */
  get(name: string): VitePlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件
   * @returns {VitePlugin[]} 插件列表
   */
  getAll(): VitePlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取插件配置
   * @param {string} name - 插件名称
   * @returns {PluginConfig | undefined} 插件配置
   */
  getConfig(name: string): PluginConfig | undefined {
    return this.pluginConfigs.get(name)
  }

  /**
   * 检查插件是否存在
   * @param {string} name - 插件名称
   * @returns {boolean} 是否存在
   */
  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 启用插件
   * @param {string} name - 插件名称
   */
  enable(name: string): void {
    const config = this.pluginConfigs.get(name)
    if (config) {
      config.enabled = true
    }
  }

  /**
   * 禁用插件
   * @param {string} name - 插件名称
   */
  disable(name: string): void {
    const config = this.pluginConfigs.get(name)
    if (config) {
      config.enabled = false
    }
  }

  /**
   * 检查插件是否应该应用
   * @private
   * @param {PluginConfig} config - 插件配置
   * @returns {boolean} 是否应用
   */
  private shouldApply(config: PluginConfig): boolean {
    // 检查是否启用
    if (!config.enabled) {
      return false
    }

    // 检查应用环境
    if (!config.apply) {
      return true
    }

    if (typeof config.apply === 'function') {
      return config.apply(config)
    }

    if (Array.isArray(config.apply)) {
      return config.apply.includes(this.environment)
    }

    return config.apply === this.environment
  }

  /**
   * 设置环境
   * @param {BuildEnvironment} environment - 构建环境
   */
  setEnvironment(environment: BuildEnvironment): void {
    this.environment = environment
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.plugins.clear()
    this.pluginConfigs.clear()
  }

  /**
   * 从配置创建插件管理器
   * @static
   * @param {PluginConfig[]} configs - 插件配置列表
   * @param {BuildEnvironment} environment - 构建环境
   * @returns {VitePluginManager} 插件管理器实例
   */
  static fromConfigs(
    configs: PluginConfig[],
    environment: BuildEnvironment = 'production'
  ): VitePluginManager {
    const manager = new VitePluginManager(environment)

    // 注册所有配置的插件
    configs.forEach(config => {
      // 这里需要实际的插件加载逻辑
      // 可以通过动态导入或预定义的插件映射来实现
    })

    return manager
  }

  /**
   * 获取插件统计信息
   * @returns {object} 统计信息
   */
  getStats(): {
    total: number
    enabled: number
    disabled: number
    byEnvironment: Record<string, number>
  } {
    const stats = {
      total: this.plugins.size,
      enabled: 0,
      disabled: 0,
      byEnvironment: {} as Record<string, number>
    }

    this.pluginConfigs.forEach(config => {
      if (config.enabled) {
        stats.enabled++
      } else {
        stats.disabled++
      }

      // 统计环境分布
      if (config.apply) {
        const envs = Array.isArray(config.apply) ? config.apply : [config.apply]
        envs.forEach(env => {
          if (typeof env === 'string') {
            stats.byEnvironment[env] = (stats.byEnvironment[env] || 0) + 1
          }
        })
      }
    })

    return stats
  }

  /**
   * 导出配置
   * @returns {PluginConfig[]} 插件配置列表
   */
  exportConfigs(): PluginConfig[] {
    return Array.from(this.pluginConfigs.values())
  }

  /**
   * 批量注册插件
   * @param {Array<[string, VitePlugin, PluginOptions?]>} plugins - 插件列表
   */
  registerBatch(plugins: Array<[string, VitePlugin, PluginOptions?]>): void {
    plugins.forEach(([name, plugin, options]) => {
      this.register(name, plugin, options)
    })
  }

  /**
   * 按名称排序插件
   * @returns {VitePlugin[]} 排序后的插件列表
   */
  getSorted(): VitePlugin[] {
    const entries = Array.from(this.plugins.entries())
    entries.sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    return entries.map(([, plugin]) => plugin)
  }

  /**
   * 按优先级排序插件
   * @param {Record<string, number>} priorities - 插件优先级映射
   * @returns {VitePlugin[]} 排序后的插件列表
   */
  getSortedByPriority(priorities: Record<string, number>): VitePlugin[] {
    const entries = Array.from(this.plugins.entries())
    
    entries.sort(([nameA], [nameB]) => {
      const priorityA = priorities[nameA] || 0
      const priorityB = priorities[nameB] || 0
      return priorityB - priorityA // 高优先级在前
    })

    return entries.map(([, plugin]) => plugin)
  }

  /**
   * 过滤插件
   * @param {(config: PluginConfig) => boolean} predicate - 过滤条件
   * @returns {VitePlugin[]} 过滤后的插件列表
   */
  filter(predicate: (config: PluginConfig) => boolean): VitePlugin[] {
    const filtered: VitePlugin[] = []

    this.pluginConfigs.forEach((config, name) => {
      if (predicate(config)) {
        const plugin = this.plugins.get(name)
        if (plugin) {
          filtered.push(plugin)
        }
      }
    })

    return filtered
  }

  /**
   * 查找插件
   * @param {(config: PluginConfig) => boolean} predicate - 查找条件
   * @returns {VitePlugin | undefined} 找到的插件
   */
  find(predicate: (config: PluginConfig) => boolean): VitePlugin | undefined {
    for (const [name, config] of this.pluginConfigs.entries()) {
      if (predicate(config)) {
        return this.plugins.get(name)
      }
    }
    return undefined
  }

  /**
   * 克隆插件管理器
   * @returns {VitePluginManager} 克隆的实例
   */
  clone(): VitePluginManager {
    const cloned = new VitePluginManager(this.environment)
    
    this.plugins.forEach((plugin, name) => {
      cloned.plugins.set(name, plugin)
    })
    
    this.pluginConfigs.forEach((config, name) => {
      cloned.pluginConfigs.set(name, { ...config })
    })

    return cloned
  }
}
