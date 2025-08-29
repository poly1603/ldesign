/**
 * 插件生态管理器
 * 负责管理内置插件和外部插件
 */

import type {
  BuiltinPlugin,
  IPluginEcosystem,
  PluginConfig,
  PluginEcosystemConfig,
  PluginInfo,
  PluginInstallResult,
  PluginSearchResult,
  PluginStats,
} from '../types/plugins'
import { ErrorHandler } from './ErrorHandler'
import { createCompressionPlugin } from '../plugins/optimization/compression'
import { createCodeSplittingPlugin } from '../plugins/optimization/code-splitting'
import { createHMREnhancedPlugin } from '../plugins/development/hmr-enhanced'
import { createBundleAnalyzerPlugin } from '../plugins/analysis/bundle-analyzer'

export class PluginEcosystem implements IPluginEcosystem {
  private errorHandler: ErrorHandler
  private pluginConfigs = new Map<string, PluginConfig>()
  private installedPlugins = new Map<string, PluginInfo>()
  private stats: PluginStats = {
    builtin: { total: 0, enabled: 0, disabled: 0 },
    external: { installed: 0, updatable: 0 },
    usage: { mostUsed: [], recentlyUsed: [] },
  }

  constructor() {
    this.errorHandler = new ErrorHandler()
    this.initializeBuiltinPlugins()
  }

  /**
   * 初始化内置插件
   */
  private initializeBuiltinPlugins(): void {
    const builtinPlugins = this.getBuiltinPlugins()
    this.stats.builtin.total = builtinPlugins.length

    // 默认启用一些插件
    this.enableBuiltinPlugin('compression', { enabled: false }) // 默认禁用，构建时启用
    this.enableBuiltinPlugin('hmr-enhanced', { enabled: true, apply: 'serve' })
  }

  /**
   * 获取内置插件列表
   */
  getBuiltinPlugins(): BuiltinPlugin[] {
    return [
      {
        name: 'compression',
        description: '代码压缩插件，支持 Gzip、Brotli 等压缩算法',
        category: 'optimization',
        framework: ['react', 'vue', 'lit', 'vanilla'],
        defaultEnabled: false,
        version: '1.0.0',
        author: 'LDesign Team',
        tags: ['compression', 'optimization', 'gzip', 'brotli'],
      },
      {
        name: 'code-splitting',
        description: '智能代码分割插件，优化包大小和加载性能',
        category: 'optimization',
        framework: ['react', 'vue', 'lit', 'vanilla'],
        defaultEnabled: true,
        version: '1.0.0',
        author: 'LDesign Team',
        tags: ['code-splitting', 'optimization', 'chunks'],
      },
      {
        name: 'hmr-enhanced',
        description: '增强热重载插件，提供更好的开发体验',
        category: 'development',
        framework: ['react', 'vue', 'lit', 'vanilla'],
        defaultEnabled: true,
        version: '1.0.0',
        author: 'LDesign Team',
        tags: ['hmr', 'development', 'hot-reload'],
      },
      {
        name: 'bundle-analyzer',
        description: '构建分析插件，可视化分析构建产物',
        category: 'analysis',
        framework: ['react', 'vue', 'lit', 'vanilla'],
        defaultEnabled: false,
        version: '1.0.0',
        author: 'LDesign Team',
        tags: ['analysis', 'bundle', 'visualization'],
      },
    ]
  }

  /**
   * 启用内置插件
   */
  enableBuiltinPlugin(name: string, config: PluginConfig = {}): void {
    try {
      const plugin = this.getBuiltinPlugins().find(p => p.name === name)
      if (!plugin) {
        throw new Error(`Builtin plugin '${name}' not found`)
      }

      this.pluginConfigs.set(name, { enabled: true, ...config })
      this.updateStats()

      console.log(`[Plugin Ecosystem] Enabled builtin plugin: ${name}`)
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'enable builtin plugin',
      )
      throw launcherError
    }
  }

  /**
   * 禁用内置插件
   */
  disableBuiltinPlugin(name: string): void {
    try {
      const config = this.pluginConfigs.get(name)
      if (config) {
        this.pluginConfigs.set(name, { ...config, enabled: false })
        this.updateStats()
        console.log(`[Plugin Ecosystem] Disabled builtin plugin: ${name}`)
      }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'disable builtin plugin',
      )
      throw launcherError
    }
  }

  /**
   * 配置插件
   */
  configurePlugin(name: string, config: PluginConfig): void {
    try {
      this.pluginConfigs.set(name, config)
      console.log(`[Plugin Ecosystem] Configured plugin: ${name}`)
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'configure plugin',
      )
      throw launcherError
    }
  }

  /**
   * 获取插件配置
   */
  getPluginConfig(name: string): PluginConfig | undefined {
    return this.pluginConfigs.get(name)
  }

  /**
   * 搜索插件
   */
  async searchPlugins(query: string, page = 1, pageSize = 20): Promise<PluginSearchResult> {
    try {
      // 简化实现，实际应该调用插件市场 API
      const mockPlugins: PluginInfo[] = [
        {
          name: 'vite-plugin-mock',
          version: '2.9.6',
          description: 'A mock plugin for vite',
          author: 'vbenjs',
          downloads: 50000,
          rating: 4.5,
          official: false,
        },
        {
          name: 'vite-plugin-windicss',
          version: '1.9.3',
          description: 'Windi CSS for Vite',
          author: 'windicss',
          downloads: 30000,
          rating: 4.2,
          official: false,
        },
      ]

      const filteredPlugins = mockPlugins.filter(plugin =>
        plugin.name.toLowerCase().includes(query.toLowerCase()) ||
        plugin.description.toLowerCase().includes(query.toLowerCase())
      )

      return {
        plugins: filteredPlugins.slice((page - 1) * pageSize, page * pageSize),
        total: filteredPlugins.length,
        page,
        pageSize,
        query,
      }
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'search plugins',
      )
      throw launcherError
    }
  }

  /**
   * 安装插件
   */
  async installPlugin(name: string, version?: string): Promise<PluginInstallResult> {
    try {
      // 简化实现，实际应该调用包管理器
      const startTime = Date.now()

      // 模拟安装过程
      await new Promise(resolve => setTimeout(resolve, 1000))

      const pluginInfo: PluginInfo = {
        name,
        version: version || '1.0.0',
        description: `Plugin ${name}`,
        author: 'Unknown',
      }

      this.installedPlugins.set(name, pluginInfo)
      this.stats.external.installed++

      return {
        success: true,
        pluginName: name,
        version: pluginInfo.version,
        installTime: Date.now() - startTime,
        dependencies: [],
      }
    }
    catch (error) {
      return {
        success: false,
        pluginName: name,
        error: (error as Error).message,
      }
    }
  }

  /**
   * 卸载插件
   */
  async uninstallPlugin(name: string): Promise<boolean> {
    try {
      if (this.installedPlugins.has(name)) {
        this.installedPlugins.delete(name)
        this.pluginConfigs.delete(name)
        this.stats.external.installed--
        console.log(`[Plugin Ecosystem] Uninstalled plugin: ${name}`)
        return true
      }
      return false
    }
    catch (error) {
      console.error(`[Plugin Ecosystem] Failed to uninstall plugin ${name}:`, error)
      return false
    }
  }

  /**
   * 获取已安装插件
   */
  getInstalledPlugins(): PluginInfo[] {
    return Array.from(this.installedPlugins.values())
  }

  /**
   * 生成 Vite 插件配置
   */
  generateVitePlugins(): any[] {
    const plugins: any[] = []

    for (const [name, config] of this.pluginConfigs.entries()) {
      if (!config.enabled) continue

      try {
        let plugin: any

        switch (name) {
          case 'compression':
            plugin = createCompressionPlugin(config)
            break
          case 'code-splitting':
            plugin = createCodeSplittingPlugin(config)
            break
          case 'hmr-enhanced':
            plugin = createHMREnhancedPlugin(config)
            break
          case 'bundle-analyzer':
            plugin = createBundleAnalyzerPlugin(config)
            break
          default:
            console.warn(`[Plugin Ecosystem] Unknown plugin: ${name}`)
            continue
        }

        if (plugin) {
          plugins.push(plugin)
        }
      }
      catch (error) {
        console.error(`[Plugin Ecosystem] Failed to create plugin ${name}:`, error)
      }
    }

    return plugins
  }

  /**
   * 验证插件配置
   */
  validateConfig(config: PluginEcosystemConfig): boolean {
    try {
      // 基本的配置验证
      if (config.builtin) {
        for (const [name, _pluginConfig] of Object.entries(config.builtin)) {
          const builtinPlugin = this.getBuiltinPlugins().find(p => p.name === name)
          if (!builtinPlugin) {
            console.warn(`[Plugin Ecosystem] Unknown builtin plugin: ${name}`)
            return false
          }
        }
      }

      return true
    }
    catch {
      return false
    }
  }

  /**
   * 重置配置
   */
  reset(): void {
    this.pluginConfigs.clear()
    this.installedPlugins.clear()
    this.stats = {
      builtin: { total: 0, enabled: 0, disabled: 0 },
      external: { installed: 0, updatable: 0 },
      usage: { mostUsed: [], recentlyUsed: [] },
    }
    this.initializeBuiltinPlugins()
  }

  /**
   * 获取统计信息
   */
  getStats(): PluginStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    const builtinPlugins = this.getBuiltinPlugins()
    let enabled = 0
    let disabled = 0

    for (const plugin of builtinPlugins) {
      const config = this.pluginConfigs.get(plugin.name)
      if (config?.enabled) {
        enabled++
      } else {
        disabled++
      }
    }

    this.stats.builtin = {
      total: builtinPlugins.length,
      enabled,
      disabled,
    }

    this.stats.external.installed = this.installedPlugins.size
  }

  /**
   * 应用插件生态配置
   */
  applyConfig(config: PluginEcosystemConfig): void {
    try {
      // 应用内置插件配置
      if (config.builtin) {
        for (const [name, pluginConfig] of Object.entries(config.builtin)) {
          if (pluginConfig) {
            this.configurePlugin(name, pluginConfig)
          }
        }
      }

      // 禁用指定的插件
      if (config.disabled) {
        for (const name of config.disabled) {
          this.disableBuiltinPlugin(name)
        }
      }

      console.log('[Plugin Ecosystem] Applied configuration')
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'apply plugin ecosystem config',
      )
      throw launcherError
    }
  }
}

/**
 * 默认插件生态管理器实例
 */
export const pluginEcosystem = new PluginEcosystem()
