/**
 * 智能插件管理器
 * 
 * 自动检测项目类型并加载对应的插件
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin } from 'vite'
import type { Logger } from '../utils/logger'
import { FileSystem, PathUtils } from '../utils'

/**
 * 项目类型枚举
 */
export enum ProjectType {
  VUE3 = 'vue3',
  VUE2 = 'vue2',
  REACT = 'react',
  SVELTE = 'svelte',
  VANILLA = 'vanilla'
}

/**
 * 插件配置接口
 */
export interface PluginConfig {
  /** 插件名称 */
  name: string
  /** 插件包名 */
  packageName: string
  /** 是否必需 */
  required: boolean
  /** 检测条件 */
  detection: {
    /** 依赖包名 */
    dependencies?: string[]
    /** 文件模式 */
    filePatterns?: string[]
    /** 配置文件 */
    configFiles?: string[]
  }
  /** 插件选项 */
  options?: Record<string, any>
}

/**
 * 智能插件管理器类
 */
export class SmartPluginManager {
  private logger: Logger
  private cwd: string
  private detectedType: ProjectType | null = null
  private availablePlugins: Map<string, PluginConfig> = new Map()

  constructor(cwd: string, logger: Logger) {
    this.cwd = cwd
    this.logger = logger
    this.initializePluginConfigs()
  }

  /**
   * 初始化插件配置
   */
  private initializePluginConfigs(): void {
    // Vue 3 插件配置
    this.availablePlugins.set('vue3', {
      name: 'Vue 3',
      packageName: '@vitejs/plugin-vue',
      required: true,
      detection: {
        dependencies: ['vue'],
        filePatterns: ['**/*.vue'],
        configFiles: ['vue.config.js', 'vue.config.ts']
      },
      options: {}
    })

    // Vue 2 插件配置
    this.availablePlugins.set('vue2', {
      name: 'Vue 2',
      packageName: '@vitejs/plugin-vue2',
      required: true,
      detection: {
        dependencies: ['vue@^2'],
        filePatterns: ['**/*.vue'],
        configFiles: ['vue.config.js', 'vue.config.ts']
      },
      options: {}
    })

    // React 插件配置
    this.availablePlugins.set('react', {
      name: 'React',
      packageName: '@vitejs/plugin-react',
      required: true,
      detection: {
        dependencies: ['react', 'react-dom'],
        filePatterns: ['**/*.jsx', '**/*.tsx'],
        configFiles: []
      },
      options: {}
    })

    // Svelte 插件配置
    this.availablePlugins.set('svelte', {
      name: 'Svelte',
      packageName: '@sveltejs/vite-plugin-svelte',
      required: true,
      detection: {
        dependencies: ['svelte'],
        filePatterns: ['**/*.svelte'],
        configFiles: ['svelte.config.js', 'svelte.config.ts']
      },
      options: {}
    })
  }

  /**
   * 检测项目类型
   */
  async detectProjectType(): Promise<ProjectType> {
    if (this.detectedType) {
      return this.detectedType
    }

    this.logger.debug('正在检测项目类型...')

    try {
      // 读取 package.json
      const packageJsonPath = PathUtils.resolve(this.cwd, 'package.json')
      if (await FileSystem.exists(packageJsonPath)) {
        const packageJson = JSON.parse(await FileSystem.readFile(packageJsonPath))
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

        // 检测 Vue 版本
        if (dependencies.vue) {
          const vueVersion = dependencies.vue
          if (vueVersion.includes('^3') || vueVersion.includes('~3') || vueVersion.startsWith('3')) {
            this.detectedType = ProjectType.VUE3
            this.logger.info('检测到 Vue 3 项目')
            return this.detectedType
          } else if (vueVersion.includes('^2') || vueVersion.includes('~2') || vueVersion.startsWith('2')) {
            this.detectedType = ProjectType.VUE2
            this.logger.info('检测到 Vue 2 项目')
            return this.detectedType
          }
        }

        // 检测 React
        if (dependencies.react && dependencies['react-dom']) {
          this.detectedType = ProjectType.REACT
          this.logger.info('检测到 React 项目')
          return this.detectedType
        }

        // 检测 Svelte
        if (dependencies.svelte) {
          this.detectedType = ProjectType.SVELTE
          this.logger.info('检测到 Svelte 项目')
          return this.detectedType
        }
      }

      // 如果无法从依赖检测，尝试从文件检测
      const hasVueFiles = await this.hasFiles(['**/*.vue'])
      if (hasVueFiles) {
        // 默认假设是 Vue 3
        this.detectedType = ProjectType.VUE3
        this.logger.info('检测到 Vue 文件，假设为 Vue 3 项目')
        return this.detectedType
      }

      const hasReactFiles = await this.hasFiles(['**/*.jsx', '**/*.tsx'])
      if (hasReactFiles) {
        this.detectedType = ProjectType.REACT
        this.logger.info('检测到 React 文件')
        return this.detectedType
      }

      const hasSvelteFiles = await this.hasFiles(['**/*.svelte'])
      if (hasSvelteFiles) {
        this.detectedType = ProjectType.SVELTE
        this.logger.info('检测到 Svelte 文件')
        return this.detectedType
      }

      // 默认为 vanilla 项目
      this.detectedType = ProjectType.VANILLA
      this.logger.info('未检测到特定框架，使用 Vanilla 配置')
      return this.detectedType

    } catch (error) {
      this.logger.warn('项目类型检测失败', { error: (error as Error).message })
      this.detectedType = ProjectType.VANILLA
      return this.detectedType
    }
  }

  /**
   * 检查是否存在指定模式的文件
   */
  private async hasFiles(patterns: string[]): Promise<boolean> {
    // 简单实现：检查 src 目录下是否有对应文件
    const srcDir = PathUtils.resolve(this.cwd, 'src')
    if (!await FileSystem.exists(srcDir)) {
      return false
    }

    try {
      const files = await FileSystem.readDir(srcDir)
      for (const pattern of patterns) {
        const extension = pattern.replace('**/*.', '.')
        if (files.some((file: string) => file.endsWith(extension))) {
          return true
        }
      }
      return false
    } catch {
      return false
    }
  }

  /**
   * 获取推荐的插件列表
   */
  async getRecommendedPlugins(): Promise<Plugin[]> {
    const projectType = await this.detectProjectType()
    const plugins: Plugin[] = []

    this.logger.debug('正在加载推荐插件...', { projectType })

    try {
      // 根据项目类型加载对应插件
      switch (projectType) {
        case ProjectType.VUE3:
          const vuePlugin = await this.loadPlugin('vue3')
          if (vuePlugin) plugins.push(vuePlugin)
          break
        case ProjectType.VUE2:
          const vue2Plugin = await this.loadPlugin('vue2')
          if (vue2Plugin) plugins.push(vue2Plugin)
          break
        case ProjectType.REACT:
          const reactPlugin = await this.loadPlugin('react')
          if (reactPlugin) plugins.push(reactPlugin)
          break
        case ProjectType.SVELTE:
          const sveltePlugin = await this.loadPlugin('svelte')
          if (sveltePlugin) plugins.push(sveltePlugin)
          break
      }

      if (plugins.length > 0) {
        const pluginNames = plugins.map(p => p.name || 'unknown').join(', ')
        this.logger.success(`智能插件加载完成: ${pluginNames}`)
      }
      return plugins

    } catch (error) {
      this.logger.error('智能插件加载失败', { error: (error as Error).message })
      return []
    }
  }

  /**
   * 加载指定插件
   */
  private async loadPlugin(pluginKey: string): Promise<Plugin | null> {
    const config = this.availablePlugins.get(pluginKey)
    if (!config) {
      this.logger.warn(`未知插件: ${pluginKey}`)
      return null
    }

    try {
      // 动态导入插件
      const pluginModule = await import(config.packageName)
      const pluginFactory = pluginModule.default || pluginModule

      this.logger.debug('加载插件', { name: config.name, package: config.packageName })

      return pluginFactory(config.options)
    } catch (error) {
      this.logger.warn('插件加载失败，可能未安装', {
        name: config.name,
        package: config.packageName,
        error: (error as Error).message
      })
      return null
    }
  }

  /**
   * 获取检测到的项目类型
   */
  getDetectedType(): ProjectType | null {
    return this.detectedType
  }
}
