/**
 * 配置预设系统
 * 
 * 为不同项目类型提供开箱即用的配置模板
 * 支持配置继承和合并
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { ViteLauncherConfig, ProjectPreset, LauncherConfigOptions } from '../types'
import { DEFAULT_VITE_LAUNCHER_CONFIG } from '../constants'
import { createAliasManager } from './AliasManager'

/**
 * 预设配置基类
 */
export abstract class BasePreset {
  abstract readonly name: ProjectPreset
  abstract readonly description: string
  abstract readonly plugins: string[]

  /**
   * 获取预设配置
   */
  abstract getConfig(): ViteLauncherConfig

  /**
   * 获取依赖列表
   */
  abstract getDependencies(): {
    dependencies: string[]
    devDependencies: string[]
  }

  /**
   * 获取推荐的脚本命令
   */
  getScripts(): Record<string, string> {
    return {
      dev: 'launcher dev',
      build: 'launcher build',
      preview: 'launcher preview'
    }
  }

  /**
   * 获取环境变量配置
   */
  getEnvConfig(): Record<string, string> {
    return {}
  }
}

/**
 * Vue 3 预设配置
 */
export class Vue3Preset extends BasePreset {
  readonly name: ProjectPreset = 'vue3'
  readonly description = 'Vue 3 项目配置预设'
  readonly plugins = ['@vitejs/plugin-vue']

  getConfig(): ViteLauncherConfig {
    return {
      ...DEFAULT_VITE_LAUNCHER_CONFIG,
      plugins: [
        // 注意：这里使用字符串占位，在实际使用时需要由用户或插件系统解析为真正的插件实例
        '@vitejs/plugin-vue' as any
      ],
      launcher: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.launcher,
        preset: 'vue3',
        env: {
          prefix: 'VITE_',
          variables: {
            APP_TITLE: 'Vue 3 App',
            APP_VERSION: '1.0.0'
          }
        }
      },
      server: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.server,
        port: 3000
      },
      build: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.build,
        rollupOptions: {
          output: {
            manualChunks: {
              vue: ['vue'],
              'vue-router': ['vue-router']
            }
          }
        }
      }
    }
  }

  getDependencies() {
    return {
      dependencies: ['vue', 'vue-router'],
      devDependencies: ['@vitejs/plugin-vue', '@vue/tsconfig']
    }
  }
}

/**
 * Vue 3 + TypeScript 预设配置
 */
export class Vue3TypeScriptPreset extends BasePreset {
  readonly name: ProjectPreset = 'vue3-ts'
  readonly description = 'Vue 3 + TypeScript 项目配置预设'
  readonly plugins = ['@vitejs/plugin-vue']

  getConfig(): ViteLauncherConfig {
    return {
      ...DEFAULT_VITE_LAUNCHER_CONFIG,
      plugins: [
        // 注意：这里使用字符串占位，在实际使用时需要由用户或插件系统解析为真正的插件实例
        '@vitejs/plugin-vue' as any
      ],
      launcher: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.launcher,
        preset: 'vue3-ts'
      },
      esbuild: {
        target: 'es2020'
      },
      build: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.build,
        rollupOptions: {
          output: {
            manualChunks: {
              vue: ['vue'],
              'vue-router': ['vue-router'],
              'vue-ecosystem': ['pinia', '@vueuse/core']
            }
          }
        }
      }
    }
  }

  getDependencies() {
    return {
      dependencies: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      devDependencies: [
        '@vitejs/plugin-vue',
        '@vue/tsconfig',
        'typescript',
        'vue-tsc',
        '@types/node'
      ]
    }
  }

  getScripts() {
    return {
      ...super.getScripts(),
      'type-check': 'vue-tsc --noEmit'
    }
  }
}

/**
 * Vue 2 预设配置
 */
export class Vue2Preset extends BasePreset {
  readonly name: ProjectPreset = 'vue2'
  readonly description = 'Vue 2 项目配置预设'
  readonly plugins = ['@vitejs/plugin-vue2']

  getConfig(): ViteLauncherConfig {
    return {
      ...DEFAULT_VITE_LAUNCHER_CONFIG,
      plugins: [
        // 注意：这里使用字符串占位，在实际使用时需要由用户或插件系统解析为真正的插件实例
        '@vitejs/plugin-vue2' as any,
        '@vitejs/plugin-legacy' as any
      ],
      launcher: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.launcher,
        preset: 'vue2'
      },
      build: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.build,
        target: 'es2015',
        rollupOptions: {
          output: {
            manualChunks: {
              vue: ['vue'],
              'vue-router': ['vue-router'],
              vuex: ['vuex']
            }
          }
        }
      }
    }
  }

  getDependencies() {
    return {
      dependencies: ['vue@^2.7.0', 'vue-router@^3.6.0', 'vuex@^3.6.0'],
      devDependencies: [
        '@vitejs/plugin-vue2',
        '@vitejs/plugin-legacy',
        'terser'
      ]
    }
  }
}

/**
 * React 预设配置
 */
export class ReactPreset extends BasePreset {
  readonly name: ProjectPreset = 'react'
  readonly description = 'React 项目配置预设'
  readonly plugins = ['@vitejs/plugin-react']

  getConfig(): ViteLauncherConfig {
    return {
      ...DEFAULT_VITE_LAUNCHER_CONFIG,
      plugins: [
        // 注意：这里使用字符串占位，在实际使用时需要由用户或插件系统解析为真正的插件实例
        '@vitejs/plugin-react' as any
      ],
      launcher: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.launcher,
        preset: 'react',
        env: {
          prefix: 'REACT_APP_',
          variables: {
            APP_TITLE: 'React App',
            APP_VERSION: '1.0.0'
          }
        }
      },
      server: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.server,
        port: 3000
      },
      build: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.build,
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom'],
              'react-router': ['react-router-dom']
            }
          }
        }
      }
    }
  }

  getDependencies() {
    return {
      dependencies: ['react', 'react-dom', 'react-router-dom'],
      devDependencies: ['@vitejs/plugin-react', '@types/react', '@types/react-dom']
    }
  }
}

/**
 * React + TypeScript 预设配置
 */
export class ReactTypeScriptPreset extends BasePreset {
  readonly name: ProjectPreset = 'react-ts'
  readonly description = 'React + TypeScript 项目配置预设'
  readonly plugins = ['@vitejs/plugin-react']

  getConfig(): ViteLauncherConfig {
    return {
      ...DEFAULT_VITE_LAUNCHER_CONFIG,
      plugins: [
        // 注意：这里使用字符串占位，在实际使用时需要由用户或插件系统解析为真正的插件实例
        '@vitejs/plugin-react' as any
      ],
      launcher: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.launcher,
        preset: 'react-ts'
      },
      esbuild: {
        target: 'es2020',
        jsxDev: true
      },
      build: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.build,
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom'],
              'react-router': ['react-router-dom'],
              'ui-libs': ['antd', '@mui/material']
            }
          }
        }
      }
    }
  }

  getDependencies() {
    return {
      dependencies: ['react', 'react-dom', 'react-router-dom'],
      devDependencies: [
        '@vitejs/plugin-react',
        '@types/react',
        '@types/react-dom',
        '@types/node',
        'typescript'
      ]
    }
  }

  getScripts() {
    return {
      ...super.getScripts(),
      'type-check': 'tsc --noEmit'
    }
  }
}

/**
 * Svelte 预设配置
 */
export class SveltePreset extends BasePreset {
  readonly name: ProjectPreset = 'svelte'
  readonly description = 'Svelte 项目配置预设'
  readonly plugins = ['@sveltejs/vite-plugin-svelte']

  getConfig(): ViteLauncherConfig {
    return {
      ...DEFAULT_VITE_LAUNCHER_CONFIG,
      plugins: [
        // 注意：这里使用字符串占位，在实际使用时需要由用户或插件系统解析为真正的插件实例
        '@sveltejs/vite-plugin-svelte' as any
      ],
      launcher: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.launcher,
        preset: 'svelte'
      },
      server: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.server,
        port: 5173
      },
      build: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.build,
        rollupOptions: {
          output: {
            manualChunks: {
              svelte: ['svelte']
            }
          }
        }
      }
    }
  }

  getDependencies() {
    return {
      dependencies: ['svelte'],
      devDependencies: ['@sveltejs/vite-plugin-svelte', '@sveltejs/adapter-auto']
    }
  }
}

/**
 * Svelte + TypeScript 预设配置
 */
export class SvelteTypeScriptPreset extends BasePreset {
  readonly name: ProjectPreset = 'svelte-ts'
  readonly description = 'Svelte + TypeScript 项目配置预设'
  readonly plugins = ['@sveltejs/vite-plugin-svelte']

  getConfig(): ViteLauncherConfig {
    return {
      ...DEFAULT_VITE_LAUNCHER_CONFIG,
      plugins: [
        // 注意：这里使用字符串占位，在实际使用时需要由用户或插件系统解析为真正的插件实例
        '@sveltejs/vite-plugin-svelte' as any
      ],
      launcher: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.launcher,
        preset: 'svelte-ts'
      },
      build: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.build,
        rollupOptions: {
          output: {
            manualChunks: {
              svelte: ['svelte']
            }
          }
        }
      }
    }
  }

  getDependencies() {
    return {
      dependencies: ['svelte'],
      devDependencies: [
        '@sveltejs/vite-plugin-svelte',
        '@sveltejs/adapter-auto',
        'typescript',
        'svelte-check',
        '@types/node'
      ]
    }
  }

  getScripts() {
    return {
      ...super.getScripts(),
      check: 'svelte-check --tsconfig ./tsconfig.json'
    }
  }
}

/**
 * 香草 JS 预设配置
 */
export class VanillaPreset extends BasePreset {
  readonly name: ProjectPreset = 'vanilla'
  readonly description = '原生 JavaScript 项目配置预设'
  readonly plugins = []

  getConfig(): ViteLauncherConfig {
    return {
      ...DEFAULT_VITE_LAUNCHER_CONFIG,
      launcher: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.launcher,
        preset: 'vanilla'
      }
    }
  }

  getDependencies() {
    return {
      dependencies: [],
      devDependencies: []
    }
  }
}

/**
 * 香草 TypeScript 预设配置
 */
export class VanillaTypeScriptPreset extends BasePreset {
  readonly name: ProjectPreset = 'vanilla-ts'
  readonly description = 'TypeScript 项目配置预设'
  readonly plugins = []

  getConfig(): ViteLauncherConfig {
    return {
      ...DEFAULT_VITE_LAUNCHER_CONFIG,
      launcher: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.launcher,
        preset: 'vanilla-ts'
      },
      esbuild: {
        target: 'es2020'
      }
    }
  }

  getDependencies() {
    return {
      dependencies: [],
      devDependencies: ['typescript', '@types/node']
    }
  }

  getScripts() {
    return {
      ...super.getScripts(),
      'type-check': 'tsc --noEmit'
    }
  }
}

/**
 * LDesign 项目预设配置
 * 专门为 @ldesign 项目优化的预设，包含通用的构建配置和 polyfills
 */
export class LDesignPreset extends BasePreset {
  readonly name: ProjectPreset = 'ldesign'
  readonly description = 'LDesign 项目配置预设，包含通用构建优化和 polyfills'
  readonly plugins = ['@vitejs/plugin-vue']

  getConfig(): ViteLauncherConfig {
    return {
      ...DEFAULT_VITE_LAUNCHER_CONFIG,
      launcher: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.launcher,
        preset: 'ldesign'
      },

      // 构建优化配置
      build: {
        ...DEFAULT_VITE_LAUNCHER_CONFIG.build,
        outDir: 'site', // 默认输出到 site 目录
        rollupOptions: {
          output: {
            // 文件命名策略
            chunkFileNames: (chunkInfo) => {
              const facadeModuleId = chunkInfo.facadeModuleId
              if (facadeModuleId) {
                // 页面组件放在 pages 目录
                if (facadeModuleId.includes('/pages/') || facadeModuleId.includes('/views/')) {
                  return 'pages/[name]-[hash].js'
                }
                // 组件放在 components 目录
                if (facadeModuleId.includes('/components/')) {
                  return 'components/[name]-[hash].js'
                }
              }
              return 'chunks/[name]-[hash].js'
            },

            // 入口文件命名
            entryFileNames: 'js/[name]-[hash].js',

            // 资源文件命名
            assetFileNames: (assetInfo) => {
              const fileName = assetInfo.names?.[0] || 'asset'
              const info = fileName.split('.')
              const ext = info[info.length - 1]

              // 图片资源
              if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(fileName)) {
                return 'images/[name]-[hash].[ext]'
              }

              // 字体资源
              if (/\.(woff2?|eot|ttf|otf)$/i.test(fileName)) {
                return 'fonts/[name]-[hash].[ext]'
              }

              // CSS 文件
              if (ext === 'css') {
                return 'css/[name]-[hash].[ext]'
              }

              // 其他资源
              return 'assets/[name]-[hash].[ext]'
            },

            // 基础分包策略
            manualChunks: (id) => {
              // Vue 核心
              if (id.includes('vue') && !id.includes('node_modules')) {
                return 'vue-core'
              }

              // Vue 生态系统
              if (id.includes('vue-router') || id.includes('pinia')) {
                return 'vue-ecosystem'
              }

              // LDesign 核心包
              if (id.includes('@ldesign/cache') || id.includes('@ldesign/i18n') || id.includes('@ldesign/router')) {
                return 'ldesign-core'
              }

              // LDesign 功能包
              if (id.includes('@ldesign/api') || id.includes('@ldesign/device') || id.includes('@ldesign/color')) {
                return 'ldesign-features'
              }

              // 大型第三方库
              if (id.includes('node_modules')) {
                return 'vendor'
              }
            }
          },

          // 外部化 Node.js 内置模块
          external: (id) => {
            const nodeBuiltins = [
              'fs', 'path', 'os', 'util', 'stream', 'events',
              'node:fs', 'node:path', 'node:os', 'node:util', 'node:stream', 'node:events',
              'fs/promises', 'node:fs/promises',
              'chokidar', 'fsevents', 'readdirp', 'glob-parent', 'is-binary-path',
              'picomatch', 'fill-range', 'braces', 'micromatch'
            ]
            return nodeBuiltins.includes(id)
          }
        },

        // 代码分割阈值
        chunkSizeWarningLimit: 500,

        // 启用 CSS 代码分割
        cssCodeSplit: true,

        // 生成 source map
        sourcemap: true,

        // 静态资源处理
        assetsDir: 'assets',

        // 内联资源大小限制
        assetsInlineLimit: 4096
      },

      // 环境变量和全局变量定义
      define: {
        // 定义全局变量，避免 process is not defined 错误
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env': JSON.stringify({}),
        'process.platform': JSON.stringify('browser'),
        'process.version': JSON.stringify('v18.0.0'),
        'process.versions': JSON.stringify({ node: '18.0.0' }),
        'process.browser': true,
        'process.nextTick': 'setTimeout',
        'global': 'globalThis',
        '__DEV__': false,
        '__PROD__': true
      },

      // 基础 resolve 配置
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json'],
        alias: [] // 将在运行时根据阶段动态生成
      },

      // 优化依赖配置
      optimizeDeps: {
        exclude: ['alova', 'alova/GlobalFetch', 'axios']
      },

      // 内置 polyfill 插件
      plugins: [
        '@vitejs/plugin-vue' as any,
        // Process polyfill 插件
        {
          name: 'ldesign-process-polyfill',
          config(config: any, { command }: any) {
            if (command === 'build') {
              config.define = config.define || {}
              Object.assign(config.define, {
                'process': JSON.stringify({
                  env: { NODE_ENV: 'production' },
                  platform: 'browser',
                  version: 'v18.0.0',
                  versions: { node: '18.0.0' },
                  browser: true,
                  nextTick: function (fn: any) { setTimeout(fn, 0) }
                }),
                'process.env': JSON.stringify({ NODE_ENV: 'production' }),
                'process.env.NODE_ENV': JSON.stringify('production'),
                'process.platform': JSON.stringify('browser'),
                'process.version': JSON.stringify('v18.0.0'),
                'process.versions': JSON.stringify({ node: '18.0.0' }),
                'process.browser': true,
                'global': 'globalThis'
              })
            }
          }
        } as any,
        // Crypto polyfill 插件
        {
          name: 'ldesign-crypto-polyfill',
          config(config: any, { command }: any) {
            if (command === 'build') {
              config.resolve = config.resolve || {}
              config.resolve.alias = config.resolve.alias || {}

              // 如果 alias 是数组，转换为对象
              if (Array.isArray(config.resolve.alias)) {
                const aliasObj: any = {}
                config.resolve.alias.forEach((item: any) => {
                  if (typeof item === 'object' && item.find && item.replacement) {
                    if (typeof item.find === 'string') {
                      aliasObj[item.find] = item.replacement
                    }
                  }
                })
                config.resolve.alias = aliasObj
              }

              // 添加 crypto polyfill
              config.resolve.alias['crypto'] = 'crypto-js'
            }
          }
        } as any
      ]
    }
  }

  getDependencies() {
    return {
      dependencies: ['vue', 'vue-router', 'crypto-js'],
      devDependencies: ['@vitejs/plugin-vue', '@vue/tsconfig', 'typescript']
    }
  }

  getScripts() {
    return {
      ...super.getScripts(),
      'build:npm': 'ldesign-builder build',
      'type-check': 'vue-tsc --noEmit'
    }
  }
}

/**
 * 预设管理器
 */
export class ConfigPresetsManager {
  private presets = new Map<ProjectPreset, BasePreset>()

  constructor() {
    this.registerBuiltinPresets()
  }

  /**
   * 注册内置预设
   */
  private registerBuiltinPresets() {
    this.register(new Vue3Preset())
    this.register(new Vue3TypeScriptPreset())
    this.register(new Vue2Preset())
    this.register(new ReactPreset())
    this.register(new ReactTypeScriptPreset())
    this.register(new SveltePreset())
    this.register(new SvelteTypeScriptPreset())
    this.register(new VanillaPreset())
    this.register(new VanillaTypeScriptPreset())
    this.register(new LDesignPreset())
  }

  /**
   * 注册预设
   */
  register(preset: BasePreset) {
    this.presets.set(preset.name, preset)
  }

  /**
   * 获取预设
   */
  get(name: ProjectPreset): BasePreset | undefined {
    return this.presets.get(name)
  }

  /**
   * 获取所有预设
   */
  getAll(): BasePreset[] {
    return Array.from(this.presets.values())
  }

  /**
   * 检查预设是否存在
   */
  has(name: ProjectPreset): boolean {
    return this.presets.has(name)
  }

  /**
   * 获取预设配置
   */
  getConfig(name: ProjectPreset): ViteLauncherConfig | undefined {
    const preset = this.get(name)
    return preset?.getConfig()
  }

  /**
   * 获取预设依赖
   */
  getDependencies(name: ProjectPreset) {
    const preset = this.get(name)
    return preset?.getDependencies()
  }

  /**
   * 获取预设脚本
   */
  getScripts(name: ProjectPreset) {
    const preset = this.get(name)
    return preset?.getScripts()
  }

  /**
   * 自动检测项目类型
   */
  async detectProjectType(cwd: string = process.cwd()): Promise<ProjectPreset | null> {
    const fs = await import('fs/promises')
    const path = await import('path')

    try {
      // 读取 package.json
      const packageJsonPath = path.resolve(cwd, 'package.json')
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))

      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }

      // 检测 Vue
      if (dependencies.vue) {
        const vueVersion = dependencies.vue
        if (vueVersion.startsWith('^3') || vueVersion.startsWith('3')) {
          return dependencies.typescript ? 'vue3-ts' : 'vue3'
        } else if (vueVersion.startsWith('^2') || vueVersion.startsWith('2')) {
          return 'vue2'
        }
      }

      // 检测 React
      if (dependencies.react) {
        return dependencies.typescript ? 'react-ts' : 'react'
      }

      // 检测 Svelte
      if (dependencies.svelte) {
        return dependencies.typescript ? 'svelte-ts' : 'svelte'
      }

      // 检测 TypeScript
      if (dependencies.typescript) {
        return 'vanilla-ts'
      }

      return 'vanilla'

    } catch (error) {
      return null
    }
  }

  /**
   * 应用预设配置
   */
  applyPreset(
    baseConfig: ViteLauncherConfig,
    presetName: ProjectPreset
  ): ViteLauncherConfig {
    const preset = this.get(presetName)
    if (!preset) {
      throw new Error(`未知预设: ${presetName}`)
    }

    const presetConfig = preset.getConfig()

    // 深度合并配置：预设作为基础，用户配置覆盖预设
    return this.deepMergeConfigs(presetConfig, baseConfig)
  }

  /**
   * 深度合并配置
   */
  private deepMergeConfigs(
    base: ViteLauncherConfig,
    override: ViteLauncherConfig
  ): ViteLauncherConfig {
    const result = { ...base } as any

    for (const [key, value] of Object.entries(override)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMergeConfigs(
          (base[key as keyof ViteLauncherConfig] as any) || {},
          value as any
        )
      } else if (Array.isArray(value)) {
        // 合并数组
        const baseArray = (base[key as keyof ViteLauncherConfig] as any) || []
        result[key] = [...baseArray, ...value]
      } else {
        result[key] = value
      }
    }

    return result
  }
}

// 默认导出预设管理器实例
export const configPresets = new ConfigPresetsManager()
