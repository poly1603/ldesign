import type { Plugin, PluginOption } from 'vite'
import type {
  FrameworkType,
  IPluginManager,
  PluginConfig,
  ProjectType,
} from '@/types'
import { ErrorHandler } from './ErrorHandler'

/**
 * 插件管理器实现类
 * 负责 Vite 插件的加载、管理和配置
 */
export class PluginManager implements IPluginManager {
  private errorHandler: ErrorHandler
  private pluginRegistry: Map<string, PluginConfig>
  private loadedPlugins: Map<string, Plugin>

  constructor() {
    this.errorHandler = new ErrorHandler()
    this.pluginRegistry = new Map()
    this.loadedPlugins = new Map()
    this.initializeBuiltinPlugins()
  }

  /**
   * 初始化内置插件配置
   */
  private initializeBuiltinPlugins(): void {
    // Vue 3 插件
    this.pluginRegistry.set('@vitejs/plugin-vue', {
      name: '@vitejs/plugin-vue',
      packageName: '@vitejs/plugin-vue',
      version: '^5.0.0',
      description: 'Vue 3 单文件组件支持',
      frameworks: ['vue3'],
      supportedFrameworks: ['vue3'],
      defaultOptions: {
        include: [/\.vue$/],
        exclude: [],
      },
      required: true,
    })

    // Vue 2 插件
    this.pluginRegistry.set('@vitejs/plugin-vue2', {
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
    })

    // React 插件
    this.pluginRegistry.set('@vitejs/plugin-react', {
      name: '@vitejs/plugin-react',
      packageName: '@vitejs/plugin-react',
      version: '^4.0.0',
      description: 'React 支持，包含 JSX 和 Fast Refresh',
      frameworks: ['react'],
      supportedFrameworks: ['react'],
      defaultOptions: {
        include: '**/*.{jsx,tsx}',
        exclude: [],
      },
      required: true,
    })

    // React SWC 插件（替代方案）
    this.pluginRegistry.set('@vitejs/plugin-react-swc', {
      name: '@vitejs/plugin-react-swc',
      packageName: '@vitejs/plugin-react-swc',
      version: '^3.0.0',
      description: 'React 支持，使用 SWC 编译器',
      frameworks: ['react'],
      supportedFrameworks: ['react'],
      defaultOptions: {},
      required: false,
    })

    // Lit 插件
    this.pluginRegistry.set('@vitejs/plugin-lit', {
      name: '@vitejs/plugin-lit',
      packageName: '@vitejs/plugin-lit',
      version: '^1.0.0',
      description: 'Lit 元素支持',
      frameworks: ['lit'],
      supportedFrameworks: ['lit'],
      defaultOptions: {},
      required: true,
    })

    // Svelte 插件
    this.pluginRegistry.set('@sveltejs/vite-plugin-svelte', {
      name: '@sveltejs/vite-plugin-svelte',
      packageName: '@sveltejs/vite-plugin-svelte',
      version: '^3.0.0',
      description: 'Svelte 组件支持',
      frameworks: ['svelte'],
      supportedFrameworks: ['svelte'],
      defaultOptions: {
        hot: true,
      },
      required: true,
    })

    // TypeScript 插件
    this.pluginRegistry.set('@vitejs/plugin-typescript', {
      name: '@vitejs/plugin-typescript',
      packageName: '@vitejs/plugin-typescript',
      version: '^1.0.0',
      description: 'TypeScript 支持',
      frameworks: ['vanilla-ts', 'vue3', 'vue2', 'react', 'lit'],
      supportedFrameworks: ['vanilla-ts', 'vue3', 'vue2', 'react', 'lit'],
      defaultOptions: {},
      required: false,
    })

    // 常用工具插件
    this.pluginRegistry.set('@vitejs/plugin-legacy', {
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
    })

    this.pluginRegistry.set('vite-plugin-eslint', {
      name: 'vite-plugin-eslint',
      packageName: 'vite-plugin-eslint',
      version: '^1.8.0',
      description: 'ESLint 集成',
      frameworks: ['vue3', 'vue2', 'react', 'vanilla', 'vanilla-ts'],
      supportedFrameworks: ['vue3', 'vue2', 'react', 'vanilla', 'vanilla-ts'],
      defaultOptions: {
        cache: false,
      },
      required: false,
    })

    this.pluginRegistry.set('vite-plugin-windicss', {
      name: 'vite-plugin-windicss',
      packageName: 'vite-plugin-windicss',
      version: '^1.9.0',
      description: 'WindiCSS 集成',
      frameworks: ['vue3', 'vue2', 'react', 'vanilla', 'vanilla-ts'],
      supportedFrameworks: ['vue3', 'vue2', 'react', 'vanilla', 'vanilla-ts'],
      defaultOptions: {},
      required: false,
    })

    this.pluginRegistry.set('unplugin-auto-import/vite', {
      name: 'unplugin-auto-import',
      packageName: 'unplugin-auto-import',
      version: '^0.17.0',
      description: '自动导入 API',
      frameworks: ['vue3', 'vue2', 'react'],
      supportedFrameworks: ['vue3', 'vue2', 'react'],
      defaultOptions: {
        imports: ['vue', 'vue-router'],
        dts: true,
      },
      required: false,
    })
  }

  /**
   * 加载插件
   * @param pluginName 插件名称
   * @param options 插件选项
   * @returns 加载的插件实例
   */
  async loadPlugin(pluginName: string, options?: any): Promise<Plugin> {
    try {
      // 检查是否已加载
      const cached = this.loadedPlugins.get(pluginName)
      if (cached) {
        return cached
      }

      // 获取插件配置
      const config = this.pluginRegistry.get(pluginName)
      if (!config) {
        throw new Error(`未知的插件: ${pluginName}`)
      }

      // 动态导入插件
      let pluginModule
      try {
        pluginModule = await import(pluginName)
      }
      catch (importError) {
        throw new Error(`无法导入插件 ${pluginName}: ${(importError as Error).message}`)
      }

      // 获取插件工厂函数
      const pluginFactory = pluginModule.default || pluginModule
      if (typeof pluginFactory !== 'function') {
        throw new TypeError(`插件 ${pluginName} 不是有效的插件工厂函数`)
      }

      // 合并选项
      const finalOptions = {
        ...config.defaultOptions,
        ...options,
      }

      // 创建插件实例
      const plugin = pluginFactory(finalOptions)

      // 缓存插件实例
      this.loadedPlugins.set(pluginName, plugin)

      return plugin
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        `load plugin: ${pluginName}`,
      )
      throw launcherError
    }
  }

  /**
   * 获取项目类型的推荐插件
   * @param projectType 项目类型
   * @returns 推荐插件列表
   */
  getRecommendedPlugins(projectType: ProjectType): PluginConfig[] {
    const recommended: PluginConfig[] = []

    for (const [, config] of this.pluginRegistry.entries()) {
      if (config.supportedFrameworks.includes(projectType as any)) {
        recommended.push(config)
      }
    }

    // 按必需性和名称排序
    return recommended.sort((a, b) => {
      if (a.required !== b.required) {
        return a.required ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  }

  /**
   * 获取必需插件
   * @param projectType 项目类型
   * @returns 必需插件列表
   */
  getRequiredPlugins(projectType: ProjectType): PluginConfig[] {
    return this.getRecommendedPlugins(projectType).filter(config => config.required)
  }

  /**
   * 批量加载插件
   * @param pluginConfigs 插件配置列表
   * @returns 加载的插件实例数组
   */
  async loadPlugins(pluginConfigs: Array<{ name: string, options?: any }>): Promise<Plugin[]> {
    const plugins: Plugin[] = []
    const errors: string[] = []

    for (const { name, options } of pluginConfigs) {
      try {
        const plugin = await this.loadPlugin(name, options)
        plugins.push(plugin)
      }
      catch (error) {
        errors.push(`加载插件 ${name} 失败: ${(error as Error).message}`)
      }
    }

    if (errors.length > 0) {
      console.warn('部分插件加载失败:', errors.join(', '))
    }

    return plugins
  }

  /**
   * 为项目类型创建插件数组
   * @param projectType 项目类型
   * @param additionalPlugins 额外插件配置
   * @returns 插件选项数组
   */
  async createPluginsForProject(
    projectType: ProjectType,
    additionalPlugins: Array<{ name: string, options?: any }> = [],
  ): Promise<PluginOption[]> {
    try {
      // 获取必需插件
      const requiredPlugins = this.getRequiredPlugins(projectType)

      // 构建插件配置列表
      const pluginConfigs = [
        ...requiredPlugins.map(config => ({ name: config.name, options: config.defaultOptions })),
        ...additionalPlugins,
      ]

      // 加载所有插件
      const plugins = await this.loadPlugins(pluginConfigs)

      return plugins as PluginOption[]
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        `create plugins for ${projectType}`,
      )
      throw launcherError
    }
  }

  /**
   * 注册自定义插件
   * @param config 插件配置
   */
  registerPlugin(config: PluginConfig): void {
    this.pluginRegistry.set(config.name, config)
  }

  /**
   * 注销插件
   * @param pluginName 插件名称
   */
  unregisterPlugin(pluginName: string): void {
    this.pluginRegistry.delete(pluginName)
    this.loadedPlugins.delete(pluginName)
  }

  /**
   * 获取插件配置
   * @param pluginName 插件名称
   * @returns 插件配置
   */
  getPluginConfig(pluginName: string): PluginConfig | undefined {
    return this.pluginRegistry.get(pluginName)
  }

  /**
   * 获取所有已注册的插件
   * @returns 插件配置映射
   */
  getAllPlugins(): Map<string, PluginConfig> {
    return new Map(this.pluginRegistry)
  }

  /**
   * 检查插件是否兼容项目类型
   * @param pluginName 插件名称
   * @param projectType 项目类型
   * @returns 是否兼容
   */
  isPluginCompatible(pluginName: string, projectType: ProjectType): boolean {
    const config = this.pluginRegistry.get(pluginName)
    if (!config) {
      return false
    }
    return config.supportedFrameworks.includes(projectType as any)
  }

  /**
   * 加载框架特定插件
   * @param framework 框架类型
   * @returns 插件配置数组
   */
  async loadFrameworkPlugins(framework: FrameworkType): Promise<PluginOption[]> {
    const plugins = Array.from(this.pluginRegistry.values())
      .filter(plugin => plugin.supportedFrameworks.includes(framework))

    // 将 PluginConfig 转换为 PluginOption
    return plugins.map((plugin) => {
      // 这里需要动态导入插件模块并返回实际的插件函数
      // 简化实现，返回插件名称作为标识
      return plugin.name as any
    })
  }

  /**
   * 获取可用插件列表
   * @param framework 可选的框架类型过滤
   * @returns 插件配置数组
   */
  async getAvailablePlugins(framework?: FrameworkType): Promise<PluginConfig[]> {
    if (framework) {
      return Array.from(this.pluginRegistry.values())
        .filter(plugin => plugin.supportedFrameworks.includes(framework))
    }
    return Array.from(this.pluginRegistry.values())
  }

  /**
   * 解析插件选项
   * @param pluginName 插件名称
   * @param userOptions 用户选项
   * @returns 解析后的选项
   */
  resolvePluginOptions(pluginName: string, userOptions?: any): any {
    const config = this.pluginRegistry.get(pluginName)
    if (!config) {
      return userOptions || {}
    }
    return {
      ...config.defaultOptions,
      ...userOptions,
    }
  }

  /**
   * 验证插件依赖
   * @param pluginNames 插件名称列表
   * @returns 验证结果
   */
  validatePluginDependencies(pluginNames: string[]): { valid: boolean, errors: string[] } {
    const errors: string[] = []
    const unknownPlugins: string[] = []

    for (const pluginName of pluginNames) {
      if (!this.pluginRegistry.has(pluginName)) {
        unknownPlugins.push(pluginName)
      }
    }

    if (unknownPlugins.length > 0) {
      errors.push(`未知插件: ${unknownPlugins.join(', ')}`)
    }

    // 检查插件冲突（例如 @vitejs/plugin-react 和 @vitejs/plugin-react-swc）
    const reactPlugins = pluginNames.filter(name =>
      name === '@vitejs/plugin-react' || name === '@vitejs/plugin-react-swc',
    )

    if (reactPlugins.length > 1) {
      errors.push('不能同时使用 @vitejs/plugin-react 和 @vitejs/plugin-react-swc')
    }

    const vuePlugins = pluginNames.filter(name =>
      name === '@vitejs/plugin-vue' || name === '@vitejs/plugin-vue2',
    )

    if (vuePlugins.length > 1) {
      errors.push('不能同时使用 @vitejs/plugin-vue 和 @vitejs/plugin-vue2')
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * 清理插件缓存
   */
  clearCache(): void {
    this.loadedPlugins.clear()
  }

  /**
   * 获取插件使用统计
   * @returns 插件使用统计
   */
  getPluginStats(): { name: string, loadCount: number }[] {
    const stats: { name: string, loadCount: number }[] = []

    for (const [name] of this.pluginRegistry.entries()) {
      const loadCount = this.loadedPlugins.has(name) ? 1 : 0
      stats.push({ name, loadCount })
    }

    return stats.sort((a, b) => b.loadCount - a.loadCount)
  }

  /**
   * 生成插件安装命令
   * @param pluginNames 插件名称列表
   * @param packageManager 包管理器
   * @returns 安装命令
   */
  generateInstallCommand(pluginNames: string[], packageManager: 'npm' | 'yarn' | 'pnpm' = 'npm'): string {
    const packages = pluginNames.map((name) => {
      const config = this.pluginRegistry.get(name)
      return config ? `${name}@${config.version}` : name
    })

    switch (packageManager) {
      case 'yarn':
        return `yarn add -D ${packages.join(' ')}`
      case 'pnpm':
        return `pnpm add -D ${packages.join(' ')}`
      default:
        return `npm install -D ${packages.join(' ')}`
    }
  }
}

/**
 * 默认插件管理器实例
 */
export const pluginManager = new PluginManager()
