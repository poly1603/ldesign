import type {
  ConfigMergeOptions,
  IConfigManager,
  PresetConfig,
  ProjectType,
} from '@/types'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { type InlineConfig, mergeConfig, type UserConfig } from 'vite'
import { ERROR_CODES } from '@/types'
import { ErrorHandler } from './ErrorHandler'

/**
 * 配置管理器实现类
 * 负责处理 Vite 配置的加载、合并、验证和管理
 */
export class ConfigManager implements IConfigManager {
  private errorHandler: ErrorHandler
  private presetConfigs: Map<ProjectType, PresetConfig>

  constructor() {
    this.errorHandler = new ErrorHandler()
    this.presetConfigs = new Map()
    this.initializePresetConfigs()
  }

  /**
   * 初始化预设配置
   */
  private initializePresetConfigs(): void {
    // Vue 3 预设配置
    this.presetConfigs.set('vue3', {
      name: 'Vue 3项目',
      framework: 'vue3',
      config: {
        build: {
          target: 'es2015',
          outDir: 'dist',
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
        },
        server: {
          port: 3000,
          open: true,
          cors: true,
        },
        resolve: {
          alias: {
            '@': path.resolve(process.cwd(), 'src'),
          },
        },
      },
      priority: 1,
      description: 'Vue 3项目的默认配置',
    })

    // Vue 2 预设配置
    this.presetConfigs.set('vue2', {
      name: 'Vue 2项目',
      framework: 'vue2',
      config: {
        build: {
          target: 'es2015',
          outDir: 'dist',
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
        },
        server: {
          port: 3000,
          open: true,
          cors: true,
        },
        resolve: {
          alias: {
            '@': path.resolve(process.cwd(), 'src'),
          },
        },
      },
      priority: 1,
      description: 'Vue 2项目的默认配置',
    })

    // React 预设配置
    this.presetConfigs.set('react', {
      name: 'React项目',
      framework: 'react',
      config: {
        build: {
          target: 'es2015',
          outDir: 'dist',
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
        },
        server: {
          port: 3000,
          open: true,
          cors: true,
        },
        resolve: {
          alias: {
            '@': path.resolve(process.cwd(), 'src'),
          },
        },
        esbuild: {
          jsxInject: `import React from 'react'`,
        },
      },
      priority: 1,
      description: 'React项目的默认配置',
    })

    // Lit 预设配置
    this.presetConfigs.set('lit', {
      name: 'Lit项目',
      framework: 'lit',
      config: {
        build: {
          target: 'es2018',
          outDir: 'dist',
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
          lib: {
            entry: 'src/index.ts',
            formats: ['es'],
          },
          rollupOptions: {
            external: /^lit/,
          },
        },
        server: {
          port: 3000,
          open: true,
          cors: true,
        },
      },
      priority: 1,
      description: 'Lit项目的默认配置',
    })

    // Vanilla TypeScript 预设配置
    this.presetConfigs.set('vanilla-ts', {
      name: 'Vanilla TypeScript项目',
      framework: 'vanilla-ts',
      config: {
        build: {
          target: 'es2015',
          outDir: 'dist',
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
        },
        server: {
          port: 3000,
          open: true,
          cors: true,
        },
        resolve: {
          alias: {
            '@': path.resolve(process.cwd(), 'src'),
          },
        },
      },
      priority: 1,
      description: 'Vanilla TypeScript项目的默认配置',
    })

    // Vanilla JavaScript 预设配置
    this.presetConfigs.set('vanilla', {
      name: 'Vanilla JavaScript项目',
      framework: 'vanilla',
      config: {
        build: {
          target: 'es2015',
          outDir: 'dist',
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
        },
        server: {
          port: 3000,
          open: true,
          cors: true,
        },
      },
      priority: 1,
      description: 'Vanilla JavaScript项目的默认配置',
    })

    // 原生 HTML 预设配置
    this.presetConfigs.set('html', {
      name: '原生 HTML 项目',
      framework: 'html',
      config: {
        build: {
          target: 'es2015',
          outDir: 'dist',
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
          rollupOptions: {
            input: {
              main: 'index.html'
            }
          }
        },
        server: {
          port: 3000,
          open: true,
          cors: true,
        },
      },
      priority: 1,
      description: '原生 HTML 项目的默认配置',
    })
  }

  /**
   * 加载项目配置文件
   * @param projectRoot 项目根目录路径
   * @returns Vite 配置对象
   */
  async loadProjectConfig(projectRoot: string): Promise<UserConfig> {
    try {
      const configFiles = [
        'vite.config.ts',
        'vite.config.js',
        'vite.config.mjs',
      ]

      for (const configFile of configFiles) {
        const configPath = path.join(projectRoot, configFile)

        try {
          await fs.access(configPath)

          // 动态导入配置文件
          const configModule = await import(configPath)
          const config = configModule.default || configModule

          // 如果配置是函数，调用它
          if (typeof config === 'function') {
            return config({ command: 'serve', mode: 'development' })
          }

          return config
        }
        catch (error) {
          // 继续尝试下一个配置文件
          continue
        }
      }

      // 没有找到配置文件，返回空配置
      return {}
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'load project config',
      )
      throw launcherError
    }
  }

  /**
   * 获取预设配置
   * @param projectType 项目类型
   * @returns 预设配置
   */
  getPresetConfig(projectType: ProjectType): PresetConfig {
    const preset = this.presetConfigs.get(projectType)
    if (!preset) {
      throw ErrorHandler.createError(
        ERROR_CODES.UNSUPPORTED_FRAMEWORK,
        `不支持的项目类型: ${projectType}`,
      )
    }
    return JSON.parse(JSON.stringify(preset)) // 深拷贝
  }

  /**
   * 合并配置
   * @param baseConfig 基础配置
   * @param userConfig 用户配置
   * @param options 合并选项
   * @returns 合并后的配置
   */
  mergeConfigs(
    baseConfig: UserConfig,
    userConfig: UserConfig,
    options?: ConfigMergeOptions,
  ): UserConfig {
    try {
      const mergeOptions = {
        arrayMergeStrategy: 'replace' as const,
        ...options,
      }

      // 使用 Vite 的 mergeConfig 函数
      let mergedConfig = mergeConfig(baseConfig, userConfig)

      // 处理数组合并策略
      if (mergeOptions?.overrideArrays) {
        // 如果设置为覆盖数组，直接使用用户配置的数组
        mergedConfig = this.mergeArrayFields(baseConfig, userConfig, mergedConfig)
      }

      return mergedConfig
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'config merge',
      )
      throw launcherError
    }
  }

  /**
   * 处理数组字段的合并
   * @param baseConfig 基础配置
   * @param userConfig 用户配置
   * @param mergedConfig 已合并的配置
   * @returns 处理后的配置
   */
  private mergeArrayFields(
    baseConfig: UserConfig,
    userConfig: UserConfig,
    mergedConfig: UserConfig,
  ): UserConfig {
    // 合并插件数组
    if (Array.isArray(baseConfig.plugins) && Array.isArray(userConfig.plugins)) {
      mergedConfig.plugins = [...baseConfig.plugins, ...userConfig.plugins]
    }

    // 合并构建目标数组
    if (baseConfig.build?.target && userConfig.build?.target) {
      const baseTargets = Array.isArray(baseConfig.build.target)
        ? baseConfig.build.target
        : [baseConfig.build.target]
      const userTargets = Array.isArray(userConfig.build.target)
        ? userConfig.build.target
        : [userConfig.build.target]

      if (mergedConfig.build) {
        mergedConfig.build.target = [...baseTargets, ...userTargets]
      }
    }

    return mergedConfig
  }

  /**
   * 验证配置对象
   * @param config 配置对象
   * @returns 验证结果
   */
  async validateConfig(config: InlineConfig): Promise<boolean> {
    const errors: string[] = []

    try {
      // 验证基本结构
      if (config && typeof config !== 'object') {
        errors.push('配置必须是一个对象')
        return false
      }

      // 验证服务器配置
      if (config.server) {
        if (config.server.port && (typeof config.server.port !== 'number' || config.server.port < 1 || config.server.port > 65535)) {
          errors.push('服务器端口必须是 1-65535 之间的数字')
        }

        if (config.server.host && typeof config.server.host !== 'string' && typeof config.server.host !== 'boolean') {
          errors.push('服务器主机必须是字符串或布尔值')
        }
      }

      // 验证构建配置
      if (config.build) {
        if (config.build.outDir && typeof config.build.outDir !== 'string') {
          errors.push('构建输出目录必须是字符串')
        }

        if (config.build.target) {
          const validTargets = ['es5', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'esnext']
          const targets = Array.isArray(config.build.target) ? config.build.target : [config.build.target]

          for (const target of targets) {
            if (typeof target === 'string' && !validTargets.includes(target)) {
              errors.push(`无效的构建目标: ${target}`)
            }
          }
        }
      }

      // 验证插件配置
      if (config.plugins && !Array.isArray(config.plugins)) {
        errors.push('插件配置必须是数组')
      }

      // 验证解析配置
      if (config.resolve?.alias) {
        const alias = config.resolve.alias
        if (typeof alias !== 'object' || Array.isArray(alias)) {
          errors.push('别名配置必须是对象')
        }
      }

      return errors.length === 0
    }
    catch (error) {
      errors.push(`配置验证失败: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 加载预设配置
   * @param framework 框架类型
   * @returns 预设配置
   */
  async loadPreset(framework: ProjectType): Promise<PresetConfig> {
    const preset = this.presetConfigs.get(framework)
    if (!preset) {
      throw ErrorHandler.createError(
        ERROR_CODES.UNSUPPORTED_FRAMEWORK,
        `不支持的框架类型: ${framework}`,
      )
    }
    return preset
  }

  /**
   * 合并配置
   * @param base 基础配置
   * @param override 覆盖配置
   * @param options 合并选项
   * @returns 合并后的配置
   */
  mergeConfig(
    base: InlineConfig,
    override: Partial<InlineConfig>,
    options?: ConfigMergeOptions,
  ): InlineConfig {
    return this.mergeConfigs(base, override, options)
  }

  /**
   * 获取所有预设配置
   * @returns 所有预设配置列表
   */
  async getAllPresets(): Promise<PresetConfig[]> {
    return Array.from(this.presetConfigs.values())
  }

  /**
   * 创建运行时配置
   * @param framework 框架类型
   * @param options 配置选项
   * @returns Vite 内联配置
   */
  async createRuntimeConfig(
    framework: ProjectType,
    options: any = {},
  ): Promise<InlineConfig> {
    try {
      // 获取预设配置
      const presetConfig = await this.loadPreset(framework)

      // 创建基础配置
      const baseConfig: UserConfig = {
        ...presetConfig.config,
        root: options.root || process.cwd(),
        mode: options.mode || 'development',
        logLevel: options.logLevel || 'info',
      }

      // 合并用户配置
      const finalConfig = options.userConfig
        ? this.mergeConfigs(baseConfig, options.userConfig)
        : baseConfig

      // 验证最终配置
      const isValid = await this.validateConfig(finalConfig as InlineConfig)
      if (!isValid) {
        throw new Error('配置验证失败')
      }

      return finalConfig as InlineConfig
    }
    catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'create runtime config',
      )
      throw launcherError
    }
  }

  /**
   * 更新预设配置
   * @param projectType 项目类型
   * @param config 新的预设配置
   */
  updatePresetConfig(projectType: ProjectType, config: PresetConfig): void {
    this.presetConfigs.set(projectType, JSON.parse(JSON.stringify(config)))
  }

  /**
   * 获取所有预设配置
   * @returns 预设配置映射
   */
  getAllPresetConfigs(): Map<ProjectType, PresetConfig> {
    const result = new Map<ProjectType, PresetConfig>()
    for (const [key, value] of this.presetConfigs.entries()) {
      result.set(key, JSON.parse(JSON.stringify(value)))
    }
    return result
  }

  /**
   * 解析配置文件路径
   * @param projectRoot 项目根目录
   * @param configFile 配置文件名（可选）
   * @returns 配置文件路径
   */
  resolveConfigPath(projectRoot: string, configFile?: string): string | null {
    if (configFile) {
      const customPath = path.resolve(projectRoot, configFile)
      try {
        require.resolve(customPath)
        return customPath
      }
      catch {
        return null
      }
    }

    const defaultConfigFiles = [
      'vite.config.ts',
      'vite.config.js',
      'vite.config.mjs',
    ]

    for (const file of defaultConfigFiles) {
      const configPath = path.join(projectRoot, file)
      try {
        require.resolve(configPath)
        return configPath
      }
      catch {
        continue
      }
    }

    return null
  }

  /**
   * 生成配置文件内容
   * @param projectType 项目类型
   * @param options 生成选项
   * @returns 配置文件内容
   */
  generateConfigFile(
    projectType: ProjectType,
    options: { typescript?: boolean, plugins?: string[] } = {},
  ): string {
    const { plugins = [] } = options || {}
    const presetConfig = this.getPresetConfig(projectType)

    // 只使用传入的插件字符串数组
    const allPlugins = plugins

    const imports = allPlugins.map((plugin) => {
      if (typeof plugin === 'string') {
        const pluginName = plugin.replace('@vitejs/plugin-', '').replace('@', '')
        return `import ${pluginName} from '${plugin}';`
      }
      return ''
    }).filter(Boolean).join('\n')

    const pluginsArray = allPlugins.map((plugin) => {
      if (typeof plugin === 'string') {
        const pluginName = plugin.replace('@vitejs/plugin-', '').replace('@', '')
        return `    ${pluginName}()`
      }
      return ''
    }).filter(Boolean).join(',\n')

    const configContent = `${imports}
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [\n${pluginsArray}\n  ],
  server: {
    port: ${presetConfig.config.server?.port || 3000},
    open: ${presetConfig.config.server?.open || true}
  },
  build: {
    outDir: '${presetConfig.config.build?.outDir || 'dist'}',
    sourcemap: ${presetConfig.config.build?.sourcemap || false}
  }
});`

    return configContent
  }
}

/**
 * 默认配置管理器实例
 */
export const configManager = new ConfigManager()
