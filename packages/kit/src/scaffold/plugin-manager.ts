/**
 * 插件管理器
 * 负责插件的加载、管理和执行
 */

import type { Logger } from '../logger'
import { EventEmitter } from 'node:events'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { FileSystem } from '../filesystem'

/**
 * 插件配置
 */
export interface PluginConfig {
  name: string
  version: string
  description: string
  author?: string
  license?: string
  main: string
  hooks?: string[]
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  options?: Record<string, any>
}

/**
 * 插件接口
 */
export interface Plugin {
  name: string
  version: string
  install?: (context: PluginContext) => Promise<void> | void
  uninstall?: (context: PluginContext) => Promise<void> | void
  beforeCreate?: (context: PluginContext) => Promise<void> | void
  afterCreate?: (context: PluginContext) => Promise<void> | void
  beforeRender?: (context: PluginContext) => Promise<void> | void
  afterRender?: (context: PluginContext) => Promise<void> | void
  [hookName: string]: any
}

/**
 * 插件上下文
 */
export interface PluginContext {
  projectPath: string
  templateName?: string
  variables?: Record<string, any>
  options?: Record<string, any>
  logger?: Logger
  fileSystem: typeof FileSystem
}

/**
 * 插件管理器选项
 */
export interface PluginManagerOptions {
  pluginsDir: string
  logger?: Logger
}

/**
 * 插件管理器类
 */
export class PluginManager extends EventEmitter {
  private options: PluginManagerOptions
  private plugins = new Map<string, Plugin>()
  private pluginConfigs = new Map<string, PluginConfig>()
  private logger?: Logger

  constructor(options: PluginManagerOptions) {
    super()
    this.options = options
    this.logger = options.logger
  }

  /**
   * 初始化插件管理器
   */
  async initialize(): Promise<void> {
    try {
      await this.loadPlugins()
      this.logger?.info(`加载了 ${this.plugins.size} 个插件`)
    }
    catch (error) {
      this.logger?.error('插件管理器初始化失败:', error)
      throw error
    }
  }

  /**
   * 加载所有插件
   */
  async loadPlugins(): Promise<void> {
    if (!(await FileSystem.exists(this.options.pluginsDir))) {
      await FileSystem.ensureDir(this.options.pluginsDir)
      return
    }

    const entries = await fs.readdir(this.options.pluginsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          await this.loadPlugin(entry.name)
        }
        catch (error) {
          this.logger?.warn(`加载插件失败: ${entry.name}`, error)
        }
      }
    }
  }

  /**
   * 加载单个插件
   */
  async loadPlugin(name: string): Promise<void> {
    const pluginDir = join(this.options.pluginsDir, name)
    const configPath = join(pluginDir, 'plugin.json')

    if (!(await FileSystem.exists(configPath))) {
      throw new Error(`插件配置文件不存在: ${configPath}`)
    }

    try {
      // 加载插件配置
      const configContent = await fs.readFile(configPath, 'utf8')
      const config = JSON.parse(configContent) as PluginConfig

      // 验证插件配置
      if (!config.name || !config.version || !config.main) {
        throw new Error('插件配置缺少必要字段')
      }

      // 加载插件主文件
      const mainPath = join(pluginDir, config.main)
      if (!(await FileSystem.exists(mainPath))) {
        throw new Error(`插件主文件不存在: ${mainPath}`)
      }

      // 动态导入插件
      const pluginModule = await import(mainPath)
      const plugin: Plugin = pluginModule.default || pluginModule

      // 验证插件接口
      if (!plugin.name || !plugin.version) {
        throw new Error('插件必须导出 name 和 version 属性')
      }

      this.pluginConfigs.set(name, config)
      this.plugins.set(name, plugin)

      this.emit('pluginLoaded', { name, config, plugin })
      this.logger?.debug(`插件加载成功: ${name}`)
    }
    catch (error) {
      this.logger?.error(`加载插件失败: ${name}`, error)
      throw error
    }
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): Plugin | null {
    return this.plugins.get(name) || null
  }

  /**
   * 获取插件配置
   */
  getPluginConfig(name: string): PluginConfig | null {
    return this.pluginConfigs.get(name) || null
  }

  /**
   * 获取所有插件名称
   */
  getPluginNames(): string[] {
    return Array.from(this.plugins.keys())
  }

  /**
   * 安装插件到项目
   */
  async installPlugins(pluginNames: string[], projectPath: string): Promise<void> {
    for (const pluginName of pluginNames) {
      await this.installPlugin(pluginName, projectPath)
    }
  }

  /**
   * 安装单个插件
   */
  async installPlugin(pluginName: string, projectPath: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    const config = this.pluginConfigs.get(pluginName)

    if (!plugin || !config) {
      throw new Error(`插件不存在: ${pluginName}`)
    }

    try {
      this.emit('pluginInstallStarted', { pluginName, projectPath })

      const context: PluginContext = {
        projectPath,
        options: config.options,
        logger: this.logger,
        fileSystem: FileSystem,
      }

      // 执行插件安装
      if (plugin.install) {
        await plugin.install(context)
      }

      this.emit('pluginInstallCompleted', { pluginName, projectPath })
      this.logger?.info(`插件安装成功: ${pluginName}`)
    }
    catch (error) {
      this.emit('pluginInstallError', { pluginName, projectPath, error })
      this.logger?.error(`插件安装失败: ${pluginName}`, error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  async uninstallPlugin(pluginName: string, projectPath: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    const config = this.pluginConfigs.get(pluginName)

    if (!plugin || !config) {
      throw new Error(`插件不存在: ${pluginName}`)
    }

    try {
      this.emit('pluginUninstallStarted', { pluginName, projectPath })

      const context: PluginContext = {
        projectPath,
        options: config.options,
        logger: this.logger,
        fileSystem: FileSystem,
      }

      // 执行插件卸载
      if (plugin.uninstall) {
        await plugin.uninstall(context)
      }

      this.emit('pluginUninstallCompleted', { pluginName, projectPath })
      this.logger?.info(`插件卸载成功: ${pluginName}`)
    }
    catch (error) {
      this.emit('pluginUninstallError', { pluginName, projectPath, error })
      this.logger?.error(`插件卸载失败: ${pluginName}`, error)
      throw error
    }
  }

  /**
   * 执行插件钩子
   */
  async executeHook(hookName: string, context: Partial<PluginContext>): Promise<void> {
    const plugins = Array.from(this.plugins.values())

    for (const plugin of plugins) {
      if (typeof plugin[hookName] === 'function') {
        try {
          const fullContext: PluginContext = {
            projectPath: context.projectPath || '',
            templateName: context.templateName,
            variables: context.variables,
            options: context.options,
            logger: this.logger,
            fileSystem: FileSystem,
          }

          await plugin[hookName](fullContext)
          this.logger?.debug(`插件钩子执行成功: ${plugin.name}.${hookName}`)
        }
        catch (error) {
          this.logger?.error(`插件钩子执行失败: ${plugin.name}.${hookName}`, error)
          this.emit('hookError', { plugin: plugin.name, hook: hookName, error })
        }
      }
    }
  }

  /**
   * 创建新插件
   */
  async createPlugin(
    name: string,
    config: Partial<PluginConfig>,
    template?: string,
  ): Promise<void> {
    const pluginDir = join(this.options.pluginsDir, name)

    if (await FileSystem.exists(pluginDir)) {
      throw new Error(`插件已存在: ${name}`)
    }

    await FileSystem.ensureDir(pluginDir)

    // 创建插件配置
    const pluginConfig: PluginConfig = {
      name,
      version: config.version || '1.0.0',
      description: config.description || '',
      author: config.author,
      license: config.license,
      main: config.main || 'index.js',
      hooks: config.hooks,
      dependencies: config.dependencies,
      peerDependencies: config.peerDependencies,
      options: config.options,
    }

    await fs.writeFile(
      join(pluginDir, 'plugin.json'),
      JSON.stringify(pluginConfig, null, 2),
      'utf8',
    )

    // 创建插件主文件
    const mainContent = template || this.getDefaultPluginTemplate(name)
    await fs.writeFile(join(pluginDir, pluginConfig.main), mainContent, 'utf8')

    this.emit('pluginCreated', { name, config: pluginConfig })
  }

  /**
   * 删除插件
   */
  async deletePlugin(name: string): Promise<void> {
    const pluginDir = join(this.options.pluginsDir, name)

    if (!(await FileSystem.exists(pluginDir))) {
      throw new Error(`插件不存在: ${name}`)
    }

    await FileSystem.remove(pluginDir)
    this.plugins.delete(name)
    this.pluginConfigs.delete(name)

    this.emit('pluginDeleted', { name })
  }

  /**
   * 重新加载插件
   */
  async reloadPlugin(name: string): Promise<void> {
    // 卸载现有插件
    this.plugins.delete(name)
    this.pluginConfigs.delete(name)

    // 重新加载插件
    await this.loadPlugin(name)
  }

  /**
   * 销毁插件管理器
   */
  async destroy(): Promise<void> {
    this.plugins.clear()
    this.pluginConfigs.clear()
    this.emit('destroyed')
  }

  // 私有方法

  private getDefaultPluginTemplate(name: string): string {
    return `/**
 * ${name} 插件
 */

module.exports = {
  name: '${name}',
  version: '1.0.0',

  async install(context) {
    const { projectPath, logger, fileSystem } = context
    logger?.info('安装插件: ${name}')
    
    // 在这里实现插件安装逻辑
  },

  async uninstall(context) {
    const { projectPath, logger, fileSystem } = context
    logger?.info('卸载插件: ${name}')
    
    // 在这里实现插件卸载逻辑
  },

  async beforeCreate(context) {
    const { projectPath, templateName, variables, logger } = context
    logger?.debug('执行 beforeCreate 钩子: ${name}')
    
    // 在项目创建前执行的逻辑
  },

  async afterCreate(context) {
    const { projectPath, templateName, variables, logger } = context
    logger?.debug('执行 afterCreate 钩子: ${name}')
    
    // 在项目创建后执行的逻辑
  }
}
`
  }

  /**
   * 创建插件管理器实例
   */
  static create(options: PluginManagerOptions): PluginManager {
    return new PluginManager(options)
  }
}
