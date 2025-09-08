/**
 * 脚手架管理器
 * 核心脚手架功能的统一管理
 */

import { EventEmitter } from 'node:events'
import { join, resolve } from 'node:path'
import { ConfigCache, ConfigHotReload, ConfigManager } from '../config'
import { FileSystem } from '../filesystem'
import { InquirerManager } from '../inquirer'
import { Logger } from '../logger'
import { EnvironmentManager } from './environment-manager'
import { PluginManager } from './plugin-manager'
import { TemplateManager } from './template-manager'

/**
 * 脚手架配置选项
 */
export interface ScaffoldOptions {
  name: string
  version?: string
  description?: string
  workingDir?: string
  configDir?: string
  templatesDir?: string
  pluginsDir?: string
  environments?: string[]
  defaultEnvironment?: string
  enableHotReload?: boolean
  enableCache?: boolean
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}

/**
 * 项目创建选项
 */
export interface ProjectCreateOptions {
  name: string
  template: string
  targetDir?: string
  environment?: string
  variables?: Record<string, any>
  plugins?: string[]
  interactive?: boolean
  overwrite?: boolean
}

/**
 * 项目创建结果
 */
export interface ProjectCreateResult {
  success: boolean
  projectPath: string
  template: string
  environment: string
  files: string[]
  plugins: string[]
  duration: number
  errors: Error[]
}

/**
 * 脚手架管理器类
 */
export class ScaffoldManager extends EventEmitter {
  private options: Required<ScaffoldOptions>
  private configManager: ConfigManager
  private configCache?: ConfigCache
  private hotReload?: ConfigHotReload
  private templateManager: TemplateManager
  private pluginManager: PluginManager
  private environmentManager: EnvironmentManager
  private inquirer: InquirerManager
  private logger: Logger
  private initialized = false

  constructor(options: ScaffoldOptions) {
    super()

    this.options = {
      name: options.name,
      version: options.version || '1.0.0',
      description: options.description || '',
      workingDir: options.workingDir || process.cwd(),
      configDir: options.configDir || '.scaffold',
      templatesDir: options.templatesDir || 'templates',
      pluginsDir: options.pluginsDir || 'plugins',
      environments: options.environments || ['development', 'production', 'staging', 'test'],
      defaultEnvironment: options.defaultEnvironment || 'development',
      enableHotReload: options.enableHotReload !== false,
      enableCache: options.enableCache !== false,
      logLevel: options.logLevel || 'info',
    }

    // 初始化组件
    this.logger = Logger.create(`scaffold:${this.options.name}`)
    this.logger.setLevel(this.options.logLevel)

    this.inquirer = new InquirerManager()

    this.configManager = new ConfigManager({
      configFile: 'scaffold.config.json5',
      configDir: resolve(this.options.workingDir, this.options.configDir),
      envPrefix: `${this.options.name.toUpperCase()}_SCAFFOLD`,
    })

    if (this.options.enableCache) {
      this.configCache = new ConfigCache({
        maxSize: 1000,
        ttl: 3600000, // 1 hour
        enableVersioning: true,
      })
    }

    this.templateManager = new TemplateManager({
      templatesDir: resolve(this.options.workingDir, this.options.templatesDir),
      logger: this.logger,
    })

    this.pluginManager = new PluginManager({
      pluginsDir: resolve(this.options.workingDir, this.options.pluginsDir),
      logger: this.logger,
    })

    this.environmentManager = new EnvironmentManager({
      environments: this.options.environments,
      defaultEnvironment: this.options.defaultEnvironment,
      logger: this.logger,
    })

    this.setupEventListeners()
  }

  /**
   * 初始化脚手架
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      this.emit('initializing')
      this.logger.info('初始化脚手架系统...')

      // 确保目录存在
      await this.ensureDirectories()

      // 加载配置
      await this.configManager.load()

      // 启用热重载
      if (this.options.enableHotReload && this.configCache) {
        this.hotReload = new ConfigHotReload(this.configCache, (this.configManager as any).loader)
        await this.hotReload.enable((this.configManager as any).options.configFile!)
      }

      // 初始化子模块
      await this.templateManager.initialize()
      await this.pluginManager.initialize()
      await this.environmentManager.initialize()

      this.initialized = true
      this.emit('initialized')
      this.logger.info('脚手架系统初始化完成')
    }
    catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 创建新项目
   */
  async createProject(options: ProjectCreateOptions): Promise<ProjectCreateResult> {
    if (!this.initialized) {
      await this.initialize()
    }

    const startTime = Date.now()
    const result: ProjectCreateResult = {
      success: false,
      projectPath: '',
      template: options.template,
      environment: options.environment || this.options.defaultEnvironment,
      files: [],
      plugins: options.plugins || [],
      duration: 0,
      errors: [],
    }

    try {
      this.emit('projectCreateStarted', options)
      this.logger.info(`开始创建项目: ${options.name}`)

      // 验证模板
      const template = await this.templateManager.getTemplate(options.template)
      if (!template) {
        throw new Error(`模板不存在: ${options.template}`)
      }

      // 确定目标目录
      const targetDir = options.targetDir || join(this.options.workingDir, options.name)
      result.projectPath = targetDir

      // 检查目录是否存在
      if (await FileSystem.exists(targetDir)) {
        if (!options.overwrite) {
          if (options.interactive) {
            const shouldOverwrite = await this.inquirer.confirm({
              message: `目录 ${targetDir} 已存在，是否覆盖？`,
              default: false,
            })
            if (!shouldOverwrite) {
              throw new Error('用户取消创建')
            }
          }
          else {
            throw new Error(`目录已存在: ${targetDir}`)
          }
        }
        await FileSystem.remove(targetDir)
      }

      // 创建目录
      await FileSystem.ensureDir(targetDir)

      // 准备变量
      let variables = options.variables || {}
      if (options.interactive) {
        variables = await this.collectVariables(template, variables)
      }

      // 设置环境
      await this.environmentManager.setEnvironment(result.environment)

      // 渲染模板
      result.files = await this.templateManager.renderTemplate(options.template, targetDir, {
        ...variables,
        projectName: options.name,
        environment: result.environment,
      })

      // 安装插件
      if (result.plugins.length > 0) {
        await this.pluginManager.installPlugins(result.plugins, targetDir)
      }

      // 执行后处理钩子
      await this.executeHooks('afterCreate', {
        projectPath: targetDir,
        template: options.template,
        variables,
      })

      result.success = true
      this.logger.info(`项目创建成功: ${targetDir}`)
    }
    catch (error) {
      result.errors.push(error as Error)
      this.logger.error('项目创建失败:', error)
      this.emit('projectCreateError', error)
    }

    result.duration = Date.now() - startTime
    this.emit('projectCreateCompleted', result)

    return result
  }

  /**
   * 获取可用模板列表
   */
  async getTemplates(): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize()
    }
    return this.templateManager.getTemplateNames()
  }

  /**
   * 获取可用插件列表
   */
  async getPlugins(): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize()
    }
    return this.pluginManager.getPluginNames()
  }

  /**
   * 获取可用环境列表
   */
  getEnvironments(): string[] {
    return this.options.environments
  }

  /**
   * 获取当前环境
   */
  getCurrentEnvironment(): string {
    return this.environmentManager.getCurrentEnvironment()
  }

  /**
   * 设置环境
   */
  async setEnvironment(environment: string): Promise<void> {
    await this.environmentManager.setEnvironment(environment)
  }

  /**
   * 获取配置值
   */
  getConfig<T = any>(key: string, defaultValue?: T): T {
    return this.configManager.get(key, defaultValue)
  }

  /**
   * 设置配置值
   */
  async setConfig(key: string, value: any): Promise<void> {
    await this.configManager.set(key, value)
  }

  /**
   * 销毁脚手架
   */
  async destroy(): Promise<void> {
    if (this.hotReload) {
      await this.hotReload.disable()
    }

    await this.templateManager.destroy()
    await this.pluginManager.destroy()

    this.initialized = false
    this.emit('destroyed')
  }

  // 私有方法

  private setupEventListeners(): void {
    this.templateManager.on('error', (error) => {
      this.emit('templateError', error)
    })

    this.pluginManager.on('error', (error) => {
      this.emit('pluginError', error)
    })

    this.environmentManager.on('environmentChanged', (environment) => {
      this.emit('environmentChanged', environment)
    })
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [
      resolve(this.options.workingDir, this.options.configDir),
      resolve(this.options.workingDir, this.options.templatesDir),
      resolve(this.options.workingDir, this.options.pluginsDir),
    ]

    for (const dir of dirs) {
      await FileSystem.ensureDir(dir)
    }
  }

  private async collectVariables(
    template: any,
    existingVariables: Record<string, any>,
  ): Promise<Record<string, any>> {
    const variables = { ...existingVariables }

    if (template.variables) {
      for (const [key, config] of Object.entries(template.variables)) {
        if (!(key in variables)) {
          const value = await this.inquirer.input({
            message: (config as any).message || `请输入 ${key}:`,
            default: (config as any).default,
          })
          variables[key] = value
        }
      }
    }

    return variables
  }

  private async executeHooks(hookName: string, context: any): Promise<void> {
    // 执行插件钩子
    await this.pluginManager.executeHook(hookName, context)

    // 执行自定义钩子
    this.emit(hookName, context)
  }

  /**
   * 创建脚手架管理器实例
   */
  static create(options: ScaffoldOptions): ScaffoldManager {
    return new ScaffoldManager(options)
  }
}
