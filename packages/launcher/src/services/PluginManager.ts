/**
 * @fileoverview 插件管理器 - 重构优化版本
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import type { Plugin, PluginOption } from 'vite'
import type {
  FrameworkType,
  IPluginManager,
  PluginConfig,
  ProjectType,
  LauncherError,
} from '@/types'
import { ErrorHandler } from './ErrorHandler'

/**
 * 插件加载结果接口
 */
interface PluginLoadResult {
  readonly success: boolean
  readonly plugin?: Plugin
  readonly error?: string
}

/**
 * 插件验证结果接口
 */
interface PluginValidationResult {
  readonly valid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
}

/**
 * 插件安装命令选项
 */
interface InstallCommandOptions {
  readonly packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun'
  readonly saveDev?: boolean
  readonly exact?: boolean
}

/**
 * 插件管理器实现类
 * 负责Vite插件的注册、加载、管理和配置
 * 
 * @implements {IPluginManager}
 */
export class PluginManager implements IPluginManager {
  private readonly errorHandler: ErrorHandler
  private readonly pluginRegistry: Map<string, PluginConfig>
  private readonly loadedPlugins: Map<string, Plugin>
  private readonly loadAttempts: Map<string, number>

  constructor() {
    this.errorHandler = new ErrorHandler()
    this.pluginRegistry = new Map()
    this.loadedPlugins = new Map()
    this.loadAttempts = new Map()
    this.initializeBuiltinPlugins()
  }

  /**
   * 初始化内置插件配置
   */
  private initializeBuiltinPlugins(): void {
    const builtinPlugins: PluginConfig[] = [
      // Vue 3 插件
      {
        name: '@vitejs/plugin-vue',
        packageName: '@vitejs/plugin-vue',
        version: '^5.0.0',
        description: 'Vue 3 单文件组件支持',
        frameworks: ['vue3'],
        supportedFrameworks: ['vue3'],
        defaultOptions: {
          include: [/\.vue$/],
          exclude: [],
          reactivityTransform: false,
        },
        required: true,
      },

      // Vue 2 插件
      {
        name: '@vitejs/plugin-vue2',
        packageName: '@vitejs/plugin-vue2',
        version: '^2.3.0',
        description: 'Vue 2 单文件组件支持',
        frameworks: ['vue2'],
        supportedFrameworks: ['vue2'],
        defaultOptions: {
          include: [/\.vue$/],
          exclude: [],
        },
        required: true,
      },

      // React 插件
      {
        name: '@vitejs/plugin-react',
        packageName: '@vitejs/plugin-react',
        version: '^4.0.0',
        description: 'React 支持，包含 JSX 和 Fast Refresh',
        frameworks: ['react'],
        supportedFrameworks: ['react'],
        defaultOptions: {
          include: '**/*.{jsx,tsx}',
          exclude: [],
          fastRefresh: true,
          jsxImportSource: undefined,
        },
        required: true,
      },

      // React SWC 插件
      {
        name: '@vitejs/plugin-react-swc',
        packageName: '@vitejs/plugin-react-swc',
        version: '^3.0.0',
        description: 'React 支持，使用 SWC 编译器',
        frameworks: ['react'],
        supportedFrameworks: ['react'],
        defaultOptions: {
          jsxImportSource: undefined,
        },
        required: false,
      },

      // Svelte 插件
      {
        name: '@sveltejs/vite-plugin-svelte',
        packageName: '@sveltejs/vite-plugin-svelte',
        version: '^3.0.0',
        description: 'Svelte 组件支持',
        frameworks: ['svelte'],
        supportedFrameworks: ['svelte'],
        defaultOptions: {
          hot: true,
          emitCss: true,
        },
        required: true,
      },

      // 通用工具插件
      {
        name: '@vitejs/plugin-legacy',
        packageName: '@vitejs/plugin-legacy',
        version: '^5.0.0',
        description: '为旧版浏览器提供支持',
        frameworks: ['vue3', 'vue2', 'react', 'vanilla', 'vanilla-ts'],
        supportedFrameworks: ['vue3', 'vue2', 'react', 'vanilla', 'vanilla-ts'],
        defaultOptions: {
          targets: ['defaults', 'not IE 11'],
        },
        required: false,
      },

      {
        name: 'vite-plugin-eslint',
        packageName: 'vite-plugin-eslint',
        version: '^1.8.0',
        description: 'ESLint 集成',
        frameworks: ['vue3', 'vue2', 'react', 'vanilla', 'vanilla-ts'],
        supportedFrameworks: ['vue3', 'vue2', 'react', 'vanilla', 'vanilla-ts'],
        defaultOptions: {
          cache: false,
          fix: false,
        },
        required: false,
      },

      {
        name: 'unplugin-auto-import/vite',
        packageName: 'unplugin-auto-import',
        version: '^0.17.0',
        description: '自动导入 API',
        frameworks: ['vue3', 'vue2', 'react'],
        supportedFrameworks: ['vue3', 'vue2', 'react'],
        defaultOptions: {
          imports: ['vue', 'vue-router'],
          dts: true,
          eslintrc: {
            enabled: false,
          },
        },
        required: false,
      },
    ]

    for (const plugin of builtinPlugins) {
      this.pluginRegistry.set(plugin.name, plugin)
    }
  }

  /**
   * 加载单个插件
   */
  async loadPlugin(pluginName: string, options?: Record<string, unknown>): Promise<Plugin> {
    try {
      // 检查缓存
      const cached = this.loadedPlugins.get(pluginName)
      if (cached) {
        return cached
      }

      // 增加加载尝试次数
      const attempts = (this.loadAttempts.get(pluginName) || 0) + 1
      this.loadAttempts.set(pluginName, attempts)

      // 避免无限重试
      if (attempts > 3) {
        throw new Error(`插件 ${pluginName} 加载失败次数过多`)
      }

      // 获取插件配置
      const config = this.pluginRegistry.get(pluginName)
      if (!config) {
        throw new Error(`未知的插件: ${pluginName}`)
      }

      // 动态导入插件
      const pluginModule = await this.importPlugin(pluginName)
      const pluginFactory = pluginModule.default || pluginModule

      if (typeof pluginFactory !== 'function') {
        throw new TypeError(`插件 ${pluginName} 不是有效的插件工厂函数`)
      }

      // 合并选项
      const finalOptions = this.resolvePluginOptions(pluginName, options)

      // 创建插件实例
      const plugin = pluginFactory(finalOptions)

      // 验证插件
      this.validatePlugin(plugin, pluginName)

      // 缓存插件实例
      this.loadedPlugins.set(pluginName, plugin)
      this.loadAttempts.delete(pluginName) // 清除失败计数

      return plugin
    } catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        `load plugin: ${pluginName}`,
      )
      throw launcherError
    }
  }

  /**
   * 动态导入插件模块
   */
  private async importPlugin(pluginName: string): Promise<Record<string, unknown>> {
    try {
      // 对于作用域包，需要特殊处理
      if (pluginName.includes('/vite')) {
        return await import(pluginName)
      }
      
      // 尝试直接导入
      return await import(pluginName)
    } catch (importError) {
      // 尝试从 node_modules 导入
      try {
        return await import(`${process.cwd()}/node_modules/${pluginName}`)
      } catch {
        throw new Error(`无法导入插件 ${pluginName}: ${(importError as Error).message}`)
      }
    }
  }

  /**
   * 验证插件实例
   */
  private validatePlugin(plugin: Plugin, pluginName: string): void {
    if (!plugin || typeof plugin !== 'object') {
      throw new TypeError(`插件 ${pluginName} 返回了无效的插件对象`)
    }

    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new TypeError(`插件 ${pluginName} 缺少有效的 name 属性`)
    }
  }

  /**
   * 批量加载插件
   */
  async loadPlugins(
    pluginConfigs: readonly Array<{ name: string; options?: Record<string, unknown> }>,
  ): Promise<Plugin[]> {
    const results = await Promise.allSettled(
      pluginConfigs.map(({ name, options }) => this.loadPlugin(name, options)),
    )

    const plugins: Plugin[] = []
    const errors: string[] = []

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const { name } = pluginConfigs[i]

      if (result.status === 'fulfilled') {
        plugins.push(result.value)
      } else {
        errors.push(`加载插件 ${name} 失败: ${result.reason?.message || '未知错误'}`)
      }
    }

    if (errors.length > 0) {
      console.warn('部分插件加载失败:', errors)
    }

    return plugins
  }

  /**
   * 为项目类型创建插件数组
   */
  async createPluginsForProject(
    projectType: ProjectType,
    additionalPlugins: readonly Array<{ name: string; options?: Record<string, unknown> }> = [],
  ): Promise<PluginOption[]> {
    try {
      // 获取必需插件
      const requiredPlugins = this.getRequiredPlugins(projectType)

      // 构建插件配置列表
      const pluginConfigs = [
        ...requiredPlugins.map(config => ({ 
          name: config.name, 
          options: config.defaultOptions,
        })),
        ...additionalPlugins,
      ]

      // 验证插件依赖
      const validation = this.validatePluginDependencies(
        pluginConfigs.map(p => p.name),
      )

      if (!validation.valid) {
        console.warn('插件依赖验证失败:', validation.errors)
      }

      // 加载所有插件
      const plugins = await this.loadPlugins(pluginConfigs)

      return plugins as PluginOption[]
    } catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        `create plugins for ${projectType}`,
      )
      throw launcherError
    }
  }

  /**
   * 获取项目类型的推荐插件
   */
  getRecommendedPlugins(projectType: ProjectType): PluginConfig[] {
    const recommended: PluginConfig[] = []

    for (const config of this.pluginRegistry.values()) {
      if (config.supportedFrameworks.includes(projectType as FrameworkType)) {
        recommended.push({ ...config })
      }
    }

    return recommended.sort((a, b) => {
      if (a.required !== b.required) {
        return a.required ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  }

  /**
   * 获取必需插件
   */
  getRequiredPlugins(projectType: ProjectType): PluginConfig[] {
    return this.getRecommendedPlugins(projectType).filter(config => config.required)
  }

  /**
   * 注册自定义插件
   */
  registerPlugin(config: PluginConfig): void {
    // 验证插件配置
    this.validatePluginConfig(config)
    this.pluginRegistry.set(config.name, { ...config })
  }

  /**
   * 验证插件配置
   */
  private validatePluginConfig(config: PluginConfig): void {
    if (!config.name || typeof config.name !== 'string') {
      throw new Error('插件配置必须包含有效的 name 属性')
    }

    if (!config.packageName || typeof config.packageName !== 'string') {
      throw new Error('插件配置必须包含有效的 packageName 属性')
    }

    if (!Array.isArray(config.supportedFrameworks) || config.supportedFrameworks.length === 0) {
      throw new Error('插件配置必须包含支持的框架列表')
    }
  }

  /**
   * 注销插件
   */
  unregisterPlugin(pluginName: string): void {
    this.pluginRegistry.delete(pluginName)
    this.loadedPlugins.delete(pluginName)
    this.loadAttempts.delete(pluginName)
  }

  /**
   * 获取插件配置
   */
  getPluginConfig(pluginName: string): PluginConfig | undefined {
    const config = this.pluginRegistry.get(pluginName)
    return config ? { ...config } : undefined
  }

  /**
   * 检查插件是否兼容项目类型
   */
  isPluginCompatible(pluginName: string, projectType: ProjectType): boolean {
    const config = this.pluginRegistry.get(pluginName)
    return config?.supportedFrameworks.includes(projectType as FrameworkType) || false
  }

  /**
   * 加载框架特定插件
   */
  async loadFrameworkPlugins(framework: FrameworkType): Promise<PluginOption[]> {
    const compatiblePlugins = Array.from(this.pluginRegistry.values())
      .filter(plugin => plugin.supportedFrameworks.includes(framework))
      .filter(plugin => plugin.required)

    const pluginConfigs = compatiblePlugins.map(plugin => ({
      name: plugin.name,
      options: plugin.defaultOptions,
    }))

    return this.loadPlugins(pluginConfigs) as Promise<PluginOption[]>
  }

  /**
   * 获取可用插件列表
   */
  async getAvailablePlugins(framework?: FrameworkType): Promise<PluginConfig[]> {
    const plugins = Array.from(this.pluginRegistry.values())

    if (framework) {
      return plugins.filter(plugin => 
        plugin.supportedFrameworks.includes(framework),
      ).map(plugin => ({ ...plugin }))
    }

    return plugins.map(plugin => ({ ...plugin }))
  }

  /**
   * 解析插件选项
   */
  resolvePluginOptions(
    pluginName: string, 
    userOptions?: Record<string, unknown>,
  ): Record<string, unknown> {
    const config = this.pluginRegistry.get(pluginName)
    const defaultOptions = config?.defaultOptions || {}
    
    if (!userOptions) {
      return { ...defaultOptions }
    }

    // 深度合并选项
    return this.deepMergeOptions(defaultOptions, userOptions)
  }

  /**
   * 深度合并选项
   */
  private deepMergeOptions(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
  ): Record<string, unknown> {
    const result = { ...target }

    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const targetValue = result[key]
        if (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
          result[key] = this.deepMergeOptions(
            targetValue as Record<string, unknown>,
            value as Record<string, unknown>,
          )
        } else {
          result[key] = { ...value as Record<string, unknown> }
        }
      } else {
        result[key] = value
      }
    }

    return result
  }

  /**
   * 验证插件依赖
   */
  validatePluginDependencies(pluginNames: readonly string[]): PluginValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查未知插件
    const unknownPlugins = pluginNames.filter(name => !this.pluginRegistry.has(name))
    if (unknownPlugins.length > 0) {
      errors.push(`未知插件: ${unknownPlugins.join(', ')}`)
    }

    // 检查插件冲突
    this.checkPluginConflicts(pluginNames, errors, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * 检查插件冲突
   */
  private checkPluginConflicts(
    pluginNames: readonly string[],
    errors: string[],
    warnings: string[],
  ): void {
    // React 插件冲突检查
    const reactPlugins = pluginNames.filter(name =>
      name === '@vitejs/plugin-react' || name === '@vitejs/plugin-react-swc',
    )

    if (reactPlugins.length > 1) {
      errors.push('不能同时使用 @vitejs/plugin-react 和 @vitejs/plugin-react-swc')
    }

    // Vue 插件冲突检查
    const vuePlugins = pluginNames.filter(name =>
      name === '@vitejs/plugin-vue' || name === '@vitejs/plugin-vue2',
    )

    if (vuePlugins.length > 1) {
      errors.push('不能同时使用 @vitejs/plugin-vue 和 @vitejs/plugin-vue2')
    }

    // 检查重复插件
    const duplicates = this.findDuplicates(pluginNames)
    if (duplicates.length > 0) {
      warnings.push(`发现重复插件: ${duplicates.join(', ')}`)
    }
  }

  /**
   * 查找重复项
   */
  private findDuplicates(array: readonly string[]): string[] {
    const seen = new Set<string>()
    const duplicates = new Set<string>()

    for (const item of array) {
      if (seen.has(item)) {
        duplicates.add(item)
      } else {
        seen.add(item)
      }
    }

    return Array.from(duplicates)
  }

  /**
   * 清理插件缓存
   */
  clearCache(): void {
    this.loadedPlugins.clear()
    this.loadAttempts.clear()
  }

  /**
   * 获取插件使用统计
   */
  getPluginStats(): Array<{ name: string; loadCount: number; isLoaded: boolean }> {
    return Array.from(this.pluginRegistry.keys()).map(name => ({
      name,
      loadCount: this.loadAttempts.get(name) || 0,
      isLoaded: this.loadedPlugins.has(name),
    })).sort((a, b) => b.loadCount - a.loadCount)
  }

  /**
   * 生成插件安装命令
   */
  generateInstallCommand(
    pluginNames: readonly string[],
    options: InstallCommandOptions = {},
  ): string {
    const {
      packageManager = 'npm',
      saveDev = true,
      exact = false,
    } = options

    const packages = pluginNames.map(name => {
      const config = this.pluginRegistry.get(name)
      const version = config?.version || 'latest'
      return exact ? `${name}@${version}` : name
    })

    const devFlag = saveDev ? '-D' : ''
    const exactFlag = exact ? '--exact' : ''

    switch (packageManager) {
      case 'yarn':
        return `yarn add ${devFlag} ${exactFlag} ${packages.join(' ')}`.trim()
      case 'pnpm':
        return `pnpm add ${devFlag} ${exactFlag} ${packages.join(' ')}`.trim()
      case 'bun':
        return `bun add ${devFlag} ${exactFlag} ${packages.join(' ')}`.trim()
      default:
        return `npm install ${devFlag} ${exactFlag} ${packages.join(' ')}`.trim()
    }
  }

  /**
   * 获取所有已注册的插件
   */
  getAllPlugins(): ReadonlyMap<string, PluginConfig> {
    return new Map(this.pluginRegistry)
  }
}