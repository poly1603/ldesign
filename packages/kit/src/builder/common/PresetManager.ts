/**
 * 预设管理器
 * @module PresetManager
 * @description 管理构建器预设配置，支持内置预设和自定义预设
 */

import type { BaseBuilderConfig, BuildEnvironment, PluginConfig } from '../types'
import { deepMerge, cloneDeep } from '../utils'

/**
 * 预设元数据
 */
export interface PresetMetadata {
  name: string
  version?: string
  description?: string
  author?: string
  tags?: string[]
  compatible?: {
    node?: string
    builders?: string[]
  }
}

/**
 * 预设配置
 */
export interface PresetConfig<T = BaseBuilderConfig> {
  metadata: PresetMetadata
  config: Partial<T>
  plugins?: PluginConfig[]
  extend?: (config: T) => T
  validate?: (config: T) => boolean | string
  hooks?: PresetHooks<T>
}

/**
 * 预设钩子
 */
export interface PresetHooks<T = BaseBuilderConfig> {
  beforeApply?: (config: T) => T | Promise<T>
  afterApply?: (config: T) => T | Promise<T>
  onError?: (error: Error, config: T) => void
}

/**
 * 预设选项
 */
export interface PresetOptions {
  overwrite?: boolean
  merge?: boolean
  skipValidation?: boolean
  environment?: BuildEnvironment
}

/**
 * 预设管理器
 * @class PresetManager
 * @template T 配置类型
 */
export class PresetManager<T extends BaseBuilderConfig = BaseBuilderConfig> {
  /**
   * 预设集合
   */
  protected presets: Map<string, PresetConfig<T>> = new Map()

  /**
   * 已应用的预设
   */
  protected appliedPresets: Set<string> = new Set()

  /**
   * 预设依赖
   */
  protected dependencies: Map<string, string[]> = new Map()

  /**
   * 当前环境
   */
  protected environment: BuildEnvironment = 'production'

  constructor(environment: BuildEnvironment = 'production') {
    this.environment = environment
    this.registerBuiltinPresets()
  }

  /**
   * 注册内置预设
   */
  protected registerBuiltinPresets(): void {
    // 基础预设
    this.register('base', this.createBasePreset())
    
    // 库模式预设
    this.register('library', this.createLibraryPreset())
    
    // React 预设
    this.register('react', this.createReactPreset())
    
    // Vue 预设
    this.register('vue', this.createVuePreset())
    
    // Node.js 预设
    this.register('node', this.createNodePreset())
    
    // 性能优化预设
    this.register('performance', this.createPerformancePreset())
  }

  /**
   * 创建基础预设
   */
  protected createBasePreset(): PresetConfig<T> {
    return {
      metadata: {
        name: 'base',
        description: '基础构建配置',
        tags: ['basic', 'default']
      },
      config: {
        env: 'production',
        sourcemap: true,
        minify: true,
        cleanOutDir: true
      } as Partial<T>,
      validate: (config) => {
        if (!config.root) return '缺少根目录配置'
        return true
      }
    }
  }

  /**
   * 创建库模式预设
   */
  protected createLibraryPreset(): PresetConfig<T> {
    return {
      metadata: {
        name: 'library',
        description: '库模式构建配置',
        tags: ['library', 'npm', 'package']
      },
      config: {
        sourcemap: true,
        minify: true,
        external: ['vue', 'react', 'react-dom'],
        // 库模式特定配置
        lib: {
          formats: ['es', 'cjs', 'umd'],
          fileName: (format) => `index.${format}.js`
        }
      } as Partial<T>,
      plugins: [
        {
          name: 'dts',
          options: { insertTypesEntry: true }
        }
      ],
      extend: (config) => {
        // 库模式下的特殊处理
        if (config.lib && !config.lib.name) {
          // 从 package.json 获取库名
          config.lib.name = 'Library'
        }
        return config
      }
    }
  }

  /**
   * 创建 React 预设
   */
  protected createReactPreset(): PresetConfig<T> {
    return {
      metadata: {
        name: 'react',
        description: 'React 应用构建配置',
        tags: ['react', 'jsx', 'frontend']
      },
      config: {
        target: 'es2015',
        esbuild: {
          jsxFactory: 'React.createElement',
          jsxFragment: 'React.Fragment',
          jsxInject: "import React from 'react'"
        }
      } as Partial<T>,
      plugins: [
        {
          name: '@vitejs/plugin-react',
          options: {
            fastRefresh: true,
            babel: {
              plugins: []
            }
          }
        }
      ]
    }
  }

  /**
   * 创建 Vue 预设
   */
  protected createVuePreset(): PresetConfig<T> {
    return {
      metadata: {
        name: 'vue',
        description: 'Vue 应用构建配置',
        tags: ['vue', 'sfc', 'frontend']
      },
      config: {
        target: 'es2015',
        resolve: {
          alias: {
            '@': '/src',
            'vue': 'vue/dist/vue.esm-bundler.js'
          },
          extensions: ['.vue', '.js', '.ts', '.jsx', '.tsx', '.json']
        }
      } as Partial<T>,
      plugins: [
        {
          name: '@vitejs/plugin-vue',
          options: {
            template: {
              compilerOptions: {
                isCustomElement: (tag: string) => tag.startsWith('custom-')
              }
            }
          }
        }
      ]
    }
  }

  /**
   * 创建 Node.js 预设
   */
  protected createNodePreset(): PresetConfig<T> {
    return {
      metadata: {
        name: 'node',
        description: 'Node.js 应用构建配置',
        tags: ['node', 'backend', 'server']
      },
      config: {
        target: 'node14',
        output: {
          format: 'cjs'
        },
        external: [
          // Node.js 内置模块
          'fs', 'path', 'os', 'crypto', 'util', 'stream', 'events',
          'http', 'https', 'net', 'tls', 'dns', 'url', 'querystring',
          'child_process', 'cluster', 'process', 'buffer', 'console'
        ]
      } as Partial<T>,
      extend: (config) => {
        // Node.js 环境特殊处理
        config.ssr = {
          target: 'node',
          noExternal: true
        } as any
        return config
      }
    }
  }

  /**
   * 创建性能优化预设
   */
  protected createPerformancePreset(): PresetConfig<T> {
    return {
      metadata: {
        name: 'performance',
        description: '性能优化构建配置',
        tags: ['optimization', 'performance', 'production']
      },
      config: {
        minify: 'terser',
        build: {
          reportCompressedSize: true,
          chunkSizeWarningLimit: 500,
          rollupOptions: {
            output: {
              manualChunks: {
                'vendor': ['react', 'react-dom', 'vue'],
                'lodash': ['lodash-es'],
                'utils': ['axios', 'dayjs', 'classnames']
              },
              compact: true,
              generatedCode: {
                constBindings: true,
                arrowFunctions: true,
                objectShorthand: true
              }
            }
          },
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info']
            },
            format: {
              comments: false
            }
          }
        },
        optimization: {
          treeshake: true,
          sideEffects: false,
          usedExports: true,
          concatenateModules: true,
          splitChunks: true,
          runtimeChunk: 'single'
        }
      } as Partial<T>,
      plugins: [
        {
          name: 'compression',
          options: { algorithm: 'gzip' }
        },
        {
          name: 'visualizer',
          options: { open: true, gzipSize: true }
        }
      ]
    }
  }

  /**
   * 注册预设
   */
  register(name: string, preset: PresetConfig<T>): void {
    if (this.presets.has(name)) {
      console.warn(`预设 "${name}" 已存在，将被覆盖`)
    }
    this.presets.set(name, preset)
  }

  /**
   * 获取预设
   */
  get(name: string): PresetConfig<T> | undefined {
    return this.presets.get(name)
  }

  /**
   * 获取所有预设
   */
  getAll(): Map<string, PresetConfig<T>> {
    return new Map(this.presets)
  }

  /**
   * 应用预设
   */
  async apply(
    name: string,
    baseConfig: T,
    options: PresetOptions = {}
  ): Promise<T> {
    const preset = this.presets.get(name)
    
    if (!preset) {
      throw new Error(`预设 "${name}" 不存在`)
    }

    // 执行 beforeApply 钩子
    let config = baseConfig
    if (preset.hooks?.beforeApply) {
      config = await preset.hooks.beforeApply(config)
    }

    try {
      // 验证预设
      if (!options.skipValidation && preset.validate) {
        const valid = preset.validate(config)
        if (valid !== true) {
          throw new Error(typeof valid === 'string' ? valid : `预设 "${name}" 验证失败`)
        }
      }

      // 应用配置
      if (options.overwrite) {
        config = { ...config, ...preset.config }
      } else {
        config = deepMerge(config, preset.config) as T
      }

      // 执行扩展函数
      if (preset.extend) {
        config = preset.extend(config)
      }

      // 标记为已应用
      this.appliedPresets.add(name)

      // 执行 afterApply 钩子
      if (preset.hooks?.afterApply) {
        config = await preset.hooks.afterApply(config)
      }

      return config
    } catch (error) {
      // 执行错误钩子
      if (preset.hooks?.onError) {
        preset.hooks.onError(error as Error, config)
      }
      throw error
    }
  }

  /**
   * 批量应用预设
   */
  async applyMultiple(
    names: string[],
    baseConfig: T,
    options: PresetOptions = {}
  ): Promise<T> {
    let config = baseConfig
    
    for (const name of names) {
      config = await this.apply(name, config, options)
    }
    
    return config
  }

  /**
   * 组合预设
   */
  combine(names: string[], newName: string): PresetConfig<T> {
    const configs: Partial<T>[] = []
    const plugins: PluginConfig[] = []
    const tags: string[] = []
    
    for (const name of names) {
      const preset = this.presets.get(name)
      if (preset) {
        configs.push(preset.config)
        if (preset.plugins) {
          plugins.push(...preset.plugins)
        }
        if (preset.metadata.tags) {
          tags.push(...preset.metadata.tags)
        }
      }
    }
    
    const combinedConfig = configs.reduce((acc, curr) => {
      return deepMerge(acc, curr)
    }, {} as Partial<T>)
    
    const combinedPreset: PresetConfig<T> = {
      metadata: {
        name: newName,
        description: `组合预设: ${names.join(', ')}`,
        tags: Array.from(new Set(tags))
      },
      config: combinedConfig,
      plugins: plugins
    }
    
    this.register(newName, combinedPreset)
    return combinedPreset
  }

  /**
   * 导出预设
   */
  export(name: string): string {
    const preset = this.presets.get(name)
    
    if (!preset) {
      throw new Error(`预设 "${name}" 不存在`)
    }
    
    return JSON.stringify({
      metadata: preset.metadata,
      config: preset.config,
      plugins: preset.plugins
    }, null, 2)
  }

  /**
   * 导入预设
   */
  import(name: string, presetData: string): void {
    try {
      const data = JSON.parse(presetData)
      const preset: PresetConfig<T> = {
        metadata: data.metadata || { name },
        config: data.config,
        plugins: data.plugins
      }
      this.register(name, preset)
    } catch (error) {
      throw new Error(`无法导入预设: ${error}`)
    }
  }

  /**
   * 验证预设兼容性
   */
  validateCompatibility(name: string, config: T): { valid: boolean; issues: string[] } {
    const preset = this.presets.get(name)
    const issues: string[] = []
    
    if (!preset) {
      issues.push(`预设 "${name}" 不存在`)
      return { valid: false, issues }
    }
    
    // 检查 Node.js 版本兼容性
    if (preset.metadata.compatible?.node) {
      // 这里可以添加版本检查逻辑
    }
    
    // 执行预设自定义验证
    if (preset.validate) {
      const result = preset.validate(config)
      if (result !== true) {
        issues.push(typeof result === 'string' ? result : '预设验证失败')
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    }
  }

  /**
   * 获取推荐预设
   */
  getRecommended(tags?: string[]): PresetConfig<T>[] {
    const recommended: PresetConfig<T>[] = []
    
    for (const preset of this.presets.values()) {
      if (!tags || tags.some(tag => preset.metadata.tags?.includes(tag))) {
        recommended.push(preset)
      }
    }
    
    return recommended
  }

  /**
   * 获取已应用的预设
   */
  getApplied(): string[] {
    return Array.from(this.appliedPresets)
  }

  /**
   * 清空已应用标记
   */
  clearApplied(): void {
    this.appliedPresets.clear()
  }

  /**
   * 删除预设
   */
  remove(name: string): boolean {
    this.appliedPresets.delete(name)
    return this.presets.delete(name)
  }

  /**
   * 清空所有预设
   */
  clear(): void {
    this.presets.clear()
    this.appliedPresets.clear()
    this.dependencies.clear()
  }

  /**
   * 设置预设依赖
   */
  setDependencies(name: string, dependencies: string[]): void {
    this.dependencies.set(name, dependencies)
  }

  /**
   * 获取预设依赖
   */
  getDependencies(name: string): string[] {
    return this.dependencies.get(name) || []
  }

  /**
   * 检查预设是否存在
   */
  has(name: string): boolean {
    return this.presets.has(name)
  }

  /**
   * 获取预设统计信息
   */
  getStatistics(): {
    total: number
    applied: number
    byTag: Record<string, number>
  } {
    const stats = {
      total: this.presets.size,
      applied: this.appliedPresets.size,
      byTag: {} as Record<string, number>
    }
    
    for (const preset of this.presets.values()) {
      if (preset.metadata.tags) {
        for (const tag of preset.metadata.tags) {
          stats.byTag[tag] = (stats.byTag[tag] || 0) + 1
        }
      }
    }
    
    return stats
  }
}
