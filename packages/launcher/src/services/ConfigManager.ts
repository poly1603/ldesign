/**
 * @fileoverview 配置管理器 - 重构优化版本
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import type { InlineConfig, UserConfig } from 'vite'
import type {
  ConfigMergeOptions,
  IConfigManager,
  LauncherError,
  PresetConfig,
  ProjectType,
  FrameworkType,
} from '@/types'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { mergeConfig } from 'vite'
import { ERROR_CODES } from '@/types'
import { ErrorHandler } from './ErrorHandler'
import { DEFAULT_CONFIG } from '@/constants'

/**
 * 配置验证结果接口
 */
interface ConfigValidationResult {
  readonly valid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
}

/**
 * 配置生成选项接口
 */
interface ConfigGenerationOptions {
  readonly typescript?: boolean
  readonly plugins?: readonly string[]
  readonly customConfig?: Partial<UserConfig>
}

/**
 * 配置管理器实现类
 * 负责预设配置管理、配置文件加载、配置合并和验证
 * 
 * @implements {IConfigManager}
 */
export class ConfigManager implements IConfigManager {
  private readonly errorHandler: ErrorHandler
  private readonly presetConfigs: ReadonlyMap<ProjectType, PresetConfig>
  private readonly configCache: Map<string, UserConfig> = new Map()

  constructor() {
    this.errorHandler = new ErrorHandler()
    this.presetConfigs = this.createPresetConfigs()
  }

  /**
   * 创建预设配置映射
   */
  private createPresetConfigs(): ReadonlyMap<ProjectType, PresetConfig> {
    const configs = new Map<ProjectType, PresetConfig>()

    // Vue 3 预设配置
    configs.set('vue3', {
      name: 'Vue 3项目',
      framework: 'vue3' as FrameworkType,
      config: {
        build: {
          target: 'es2015',
          outDir: DEFAULT_CONFIG.OUTPUT_DIR,
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
        },
        server: {
          port: DEFAULT_CONFIG.DEV_PORT,
          host: true,
          open: true,
          cors: true,
        },
        preview: {
          port: DEFAULT_CONFIG.PREVIEW_PORT,
          host: true,
          open: true,
        },
        resolve: {
          alias: {
            '@': path.resolve(process.cwd(), 'src'),
          },
        },
      },
      priority: 1,
      description: 'Vue 3项目的优化配置',
    })

    // Vue 2 预设配置
    configs.set('vue2', {
      name: 'Vue 2项目',
      framework: 'vue2' as FrameworkType,
      config: {
        build: {
          target: 'es2015',
          outDir: DEFAULT_CONFIG.OUTPUT_DIR,
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
        },
        server: {
          port: DEFAULT_CONFIG.DEV_PORT,
          host: true,
          open: true,
          cors: true,
        },
        preview: {
          port: DEFAULT_CONFIG.PREVIEW_PORT,
          host: true,
          open: true,
        },
        resolve: {
          alias: {
            '@': path.resolve(process.cwd(), 'src'),
            vue: 'vue/dist/vue.runtime.esm.js',
          },
        },
      },
      priority: 1,
      description: 'Vue 2项目的优化配置',
    })

    // React 预设配置
    configs.set('react', {
      name: 'React项目',
      framework: 'react' as FrameworkType,
      config: {
        build: {
          target: 'es2015',
          outDir: DEFAULT_CONFIG.OUTPUT_DIR,
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
        },
        server: {
          port: DEFAULT_CONFIG.DEV_PORT,
          host: true,
          open: true,
          cors: true,
        },
        preview: {
          port: DEFAULT_CONFIG.PREVIEW_PORT,
          host: true,
          open: true,
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
      description: 'React项目的优化配置',
    })

    // 其他框架配置...
    configs.set('vanilla-ts', {
      name: 'Vanilla TypeScript项目',
      framework: 'vanilla-ts' as FrameworkType,
      config: {
        build: {
          target: 'es2015',
          outDir: DEFAULT_CONFIG.OUTPUT_DIR,
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
        },
        server: {
          port: DEFAULT_CONFIG.DEV_PORT,
          host: true,
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
      description: 'Vanilla TypeScript项目的优化配置',
    })

    configs.set('vanilla', {
      name: 'Vanilla JavaScript项目',
      framework: 'vanilla' as FrameworkType,
      config: {
        build: {
          target: 'es2015',
          outDir: DEFAULT_CONFIG.OUTPUT_DIR,
          assetsDir: 'assets',
          sourcemap: false,
          minify: 'esbuild',
        },
        server: {
          port: DEFAULT_CONFIG.DEV_PORT,
          host: true,
          open: true,
          cors: true,
        },
      },
      priority: 1,
      description: 'Vanilla JavaScript项目的优化配置',
    })

    return configs
  }

  /**
   * 加载项目配置文件
   */
  async loadProjectConfig(projectRoot: string): Promise<UserConfig> {
    try {
      const cacheKey = `config:${projectRoot}`
      const cached = this.configCache.get(cacheKey)
      if (cached) {
        return cached
      }

      const configFiles = [
        'vite.config.ts',
        'vite.config.mts',
        'vite.config.js',
        'vite.config.mjs',
      ] as const

      let loadedConfig: UserConfig = {}

      for (const configFile of configFiles) {
        const configPath = path.join(projectRoot, configFile)

        try {
          await fs.access(configPath)
          const configModule = await import(`file://${configPath}?t=${Date.now()}`)
          let config = configModule.default || configModule

          if (typeof config === 'function') {
            config = await config({
              command: 'serve',
              mode: 'development',
              ssrBuild: false,
            })
          }

          loadedConfig = config
          break
        } catch {
          continue
        }
      }

      this.configCache.set(cacheKey, loadedConfig)
      return loadedConfig
    } catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'load project config',
      )
      throw launcherError
    }
  }

  /**
   * 获取预设配置
   */
  getPresetConfig(projectType: ProjectType): PresetConfig {
    const preset = this.presetConfigs.get(projectType)
    if (!preset) {
      throw ErrorHandler.createError(
        ERROR_CODES.UNSUPPORTED_FRAMEWORK,
        `不支持的项目类型: ${projectType}`,
        {
          suggestion: '请检查项目类型是否正确，支持的类型：vue2, vue3, react, vanilla, vanilla-ts',
        },
      )
    }
    return JSON.parse(JSON.stringify(preset))
  }

  /**
   * 合并配置
   */
  mergeConfigs(
    baseConfig: UserConfig,
    userConfig: UserConfig,
    options?: ConfigMergeOptions,
  ): UserConfig {
    try {
      const mergeOptions = {
        deep: true,
        overrideArrays: false,
        ...options,
      }

      let mergedConfig = mergeConfig(baseConfig, userConfig)

      if (mergeOptions.overrideArrays) {
        mergedConfig = this.mergeArrayFields(baseConfig, userConfig, mergedConfig)
      }

      if (mergeOptions.customMerger) {
        mergedConfig = this.applyCustomMerger(
          baseConfig,
          userConfig,
          mergedConfig,
          mergeOptions.customMerger,
        )
      }

      return mergedConfig
    } catch (error) {
      const launcherError = this.errorHandler.handleError(
        error as Error,
        'merge configs',
      )
      throw launcherError
    }
  }

  /**
   * 处理数组字段的合并
   */
  private mergeArrayFields(
    baseConfig: UserConfig,
    userConfig: UserConfig,
    mergedConfig: UserConfig,
  ): UserConfig {
    if (Array.isArray(baseConfig.plugins) && Array.isArray(userConfig.plugins)) {
      mergedConfig.plugins = [...baseConfig.plugins, ...userConfig.plugins]
    }

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
   * 应用自定义合并函数
   */
  private applyCustomMerger(
    baseConfig: UserConfig,
    userConfig: UserConfig,
    mergedConfig: UserConfig,
    customMerger: (target: unknown, source: unknown, key: string) => unknown,
  ): UserConfig {
    const result = { ...mergedConfig }
    const allKeys = new Set([...Object.keys(baseConfig), ...Object.keys(userConfig)])

    for (const key of allKeys) {
      if (key in baseConfig || key in userConfig) {
        const baseValue = (baseConfig as Record<string, unknown>)[key]
        const userValue = (userConfig as Record<string, unknown>)[key]
        const mergedValue = customMerger(baseValue, userValue, key)
        
        if (mergedValue !== undefined) {
          (result as Record<string, unknown>)[key] = mergedValue
        }
      }
    }

    return result
  }

  /**
   * 验证配置对象
   */
  async validateConfig(config: InlineConfig): Promise<boolean> {
    const errors: string[] = []

    try {
      if (!config || typeof config !== 'object') {
        return false
      }

      // 验证服务器配置
      if (config.server?.port && 
          (typeof config.server.port !== 'number' || 
           config.server.port < 1 || 
           config.server.port > 65535)) {
        errors.push('服务器端口必须是 1-65535 之间的数字')
      }

      // 验证构建配置
      if (config.build?.outDir && typeof config.build.outDir !== 'string') {
        errors.push('构建输出目录必须是字符串')
      }

      // 验证插件配置
      if (config.plugins && !Array.isArray(config.plugins)) {
        errors.push('插件配置必须是数组')
      }

      return errors.length === 0
    } catch {
      return false
    }
  }

  /**
   * 加载预设配置 - 接口兼容性方法
   */
  async loadPreset(framework: ProjectType): Promise<PresetConfig> {
    return this.getPresetConfig(framework)
  }

  /**
   * 合并配置 - 接口兼容性方法
   */
  mergeConfig(
    base: InlineConfig,
    override: Partial<InlineConfig>,
    options?: ConfigMergeOptions,
  ): InlineConfig {
    return this.mergeConfigs(base, override, options) as InlineConfig
  }

  /**
   * 获取所有预设配置
   */
  async getAllPresets(): Promise<readonly PresetConfig[]> {
    return Array.from(this.presetConfigs.values())
  }

  /**
   * 生成配置文件内容
   */
  generateConfigFile(
    projectType: ProjectType,
    options: ConfigGenerationOptions = {},
  ): string {
    const { typescript = true, plugins = [] } = options
    const presetConfig = this.getPresetConfig(projectType)

    // 生成导入语句
    const imports = plugins.map(plugin => {
      const pluginName = plugin.replace('@vitejs/plugin-', '').replace('@', '')
      return `import ${pluginName} from '${plugin}'`
    }).join('\n')

    // 生成插件配置
    const pluginsConfig = plugins.length > 0 
      ? `[\n${plugins.map(plugin => {
          const pluginName = plugin.replace('@vitejs/plugin-', '').replace('@', '')
          return `    ${pluginName}()`
        }).join(',\n')}\n  ]`
      : '[]'

    return `${imports}
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: ${pluginsConfig},
  server: {
    port: ${presetConfig.config.server?.port || DEFAULT_CONFIG.DEV_PORT},
    host: true,
    open: true
  },
  build: {
    outDir: '${presetConfig.config.build?.outDir || DEFAULT_CONFIG.OUTPUT_DIR}',
    sourcemap: ${presetConfig.config.build?.sourcemap || false}
  },
  resolve: ${JSON.stringify(presetConfig.config.resolve || {}, null, 4)}
})
`
  }
}