/**
 * Vue I18n 插件管理器
 *
 * 统一的插件架构，与engine插件管理器保持一致
 */

import type { App } from 'vue'
import type { I18nInstance } from '../../core/types'
import type {
  VueI18nOptions,
  VueI18nPluginContext,
  VueI18nPluginInterface,
  VueI18nPluginManager,
} from '../../vue/types'

export class VueI18nPluginManagerImpl implements VueI18nPluginManager {
  private plugins = new Map<string, VueI18nPluginInterface>()
  private loadOrder: string[] = []
  private app?: App
  private i18n?: I18nInstance
  private options?: VueI18nOptions

  constructor(app?: App, i18n?: I18nInstance, options?: VueI18nOptions) {
    this.app = app
    this.i18n = i18n
    this.options = options
  }

  /**
   * 设置上下文
   */
  setContext(app: App, i18n: I18nInstance, options: VueI18nOptions) {
    this.app = app
    this.i18n = i18n
    this.options = options
  }

  /**
   * 注册插件
   */
  async register(plugin: VueI18nPluginInterface): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }

    // 检查依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(
            `Plugin "${plugin.name}" depends on "${dep}" which is not registered`,
          )
        }
      }
    }

    if (!this.app || !this.i18n || !this.options) {
      throw new Error('Plugin manager context is not set')
    }

    try {
      // 注册插件
      this.plugins.set(plugin.name, plugin)
      this.loadOrder.push(plugin.name)

      // 创建插件上下文
      const context: VueI18nPluginContext = {
        app: this.app,
        i18n: this.i18n,
        options: this.options,
      }

      // 执行生命周期钩子
      if (plugin.beforeInstall) {
        await plugin.beforeInstall(context)
      }

      // 安装插件
      await plugin.install(context)

      // 执行生命周期钩子
      if (plugin.afterInstall) {
        await plugin.afterInstall(context)
      }

      console.log(`Vue I18n plugin "${plugin.name}" registered successfully`)
    }
    catch (error) {
      // 注册失败时清理
      this.plugins.delete(plugin.name)
      const index = this.loadOrder.indexOf(plugin.name)
      if (index > -1) {
        this.loadOrder.splice(index, 1)
      }

      console.error(`Failed to register Vue I18n plugin "${plugin.name}"`, error)
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
        `Cannot unregister plugin "${name}" because it is required by: ${dependents.join(', ')}`,
      )
    }

    if (!this.app || !this.i18n || !this.options) {
      throw new Error('Plugin manager context is not set')
    }

    try {
      // 创建插件上下文
      const context: VueI18nPluginContext = {
        app: this.app,
        i18n: this.i18n,
        options: this.options,
      }

      // 执行生命周期钩子
      if (plugin.beforeUninstall) {
        await plugin.beforeUninstall(context)
      }

      // 卸载插件
      if (plugin.uninstall) {
        await plugin.uninstall(context)
      }

      // 执行生命周期钩子
      if (plugin.afterUninstall) {
        await plugin.afterUninstall(context)
      }

      // 从注册表中移除
      this.plugins.delete(name)
      const index = this.loadOrder.indexOf(name)
      if (index > -1) {
        this.loadOrder.splice(index, 1)
      }

      console.log(`Vue I18n plugin "${name}" unregistered successfully`)
    }
    catch (error) {
      console.error(`Failed to unregister Vue I18n plugin "${name}"`, error)
      throw error
    }
  }

  /**
   * 获取插件
   */
  get(name: string): VueI18nPluginInterface | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件
   */
  getAll(): VueI18nPluginInterface[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 检查插件是否已注册
   */
  isRegistered(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 检查依赖
   */
  checkDependencies(plugin: VueI18nPluginInterface): {
    satisfied: boolean
    missing: string[]
    conflicts: string[]
  } {
    const missing: string[] = []
    const conflicts: string[] = []

    // 检查必需依赖
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          missing.push(dep)
        }
      }
    }

    // 检查对等依赖
    if (plugin.peerDependencies) {
      for (const dep of plugin.peerDependencies) {
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
   * 获取依赖此插件的插件列表
   */
  private getDependents(name: string): string[] {
    const dependents: string[] = []

    for (const [pluginName, plugin] of this.plugins) {
      if (plugin.dependencies?.includes(name) || plugin.peerDependencies?.includes(name)) {
        dependents.push(pluginName)
      }
    }

    return dependents
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

    for (const [name, plugin] of this.plugins) {
      graph[name] = [
        ...(plugin.dependencies || []),
        ...(plugin.peerDependencies || []),
      ]
    }

    return graph
  }

  /**
   * 验证所有依赖
   */
  validateDependencies(): { valid: boolean, errors: string[] } {
    const errors: string[] = []

    for (const [name, plugin] of this.plugins) {
      const check = this.checkDependencies(plugin)
      if (!check.satisfied) {
        if (check.missing.length > 0) {
          errors.push(`Plugin "${name}" has missing dependencies: ${check.missing.join(', ')}`)
        }
        if (check.conflicts.length > 0) {
          errors.push(`Plugin "${name}" has conflicting dependencies: ${check.conflicts.join(', ')}`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      total: this.plugins.size,
      loaded: this.loadOrder,
      dependencies: this.getDependencyGraph(),
    }
  }

  /**
   * 清理所有插件
   */
  async clear(): Promise<void> {
    const pluginNames = [...this.loadOrder].reverse() // 按相反顺序卸载

    for (const name of pluginNames) {
      try {
        await this.unregister(name)
      }
      catch (error) {
        console.error(`Failed to unregister plugin "${name}" during cleanup`, error)
      }
    }
  }
}

/**
 * 创建Vue I18n插件管理器
 */
export function createVueI18nPluginManager(
  app?: App,
  i18n?: I18nInstance,
  options?: VueI18nOptions,
): VueI18nPluginManager {
  return new VueI18nPluginManagerImpl(app, i18n, options)
}
