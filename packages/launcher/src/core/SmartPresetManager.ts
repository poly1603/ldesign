/**
 * 智能预设管理器
 * 
 * 提供智能的项目配置预设，支持自动检测和配置生成
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../utils/logger'
import type { ViteLauncherConfig, ProjectPreset, SmartPresetOptions } from '../types/config'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface PresetDefinition {
  /** 预设名称 */
  name: string
  /** 预设描述 */
  description: string
  /** 预设类型 */
  type: ProjectPreset
  /** 检测条件 */
  detection: {
    /** 必需的文件 */
    requiredFiles?: string[]
    /** 必需的依赖 */
    requiredDependencies?: string[]
    /** 必需的脚本 */
    requiredScripts?: string[]
    /** 检测函数 */
    detector?: (projectPath: string) => Promise<boolean>
  }
  /** 配置模板 */
  config: Partial<ViteLauncherConfig>
  /** 推荐的插件 */
  recommendedPlugins?: string[]
  /** 推荐的依赖 */
  recommendedDependencies?: string[]
}

export class SmartPresetManager {
  private logger: Logger
  private presets: Map<ProjectPreset, PresetDefinition> = new Map()
  private projectPath: string

  constructor(projectPath: string = process.cwd()) {
    this.logger = new Logger('SmartPresetManager')
    this.projectPath = projectPath
    this.initializePresets()
  }

  /**
   * 初始化预设定义
   */
  private initializePresets(): void {
    // Vue 3 预设
    this.presets.set('vue3', {
      name: 'Vue 3',
      description: 'Vue 3 项目配置',
      type: 'vue3',
      detection: {
        requiredDependencies: ['vue'],
        detector: async (projectPath) => {
          const packageJson = await this.readPackageJson(projectPath)
          const vueDep = packageJson.dependencies?.vue || packageJson.devDependencies?.vue
          return vueDep && vueDep.startsWith('^3.')
        }
      },
      config: {
        // 注意：这里存储的是插件名称，实际使用时需要动态导入
        launcher: {
          plugins: {
            plugins: ['@vitejs/plugin-vue']
          }
        },
        resolve: {
          alias: {
            '@': './src'
          }
        },
        server: {
          port: 3000,
          open: true
        }
      },
      recommendedPlugins: ['@vitejs/plugin-vue', 'vite-plugin-windicss'],
      recommendedDependencies: ['vue-router', 'pinia']
    })

    // Vue 3 + TypeScript 预设
    this.presets.set('vue3-ts', {
      name: 'Vue 3 + TypeScript',
      description: 'Vue 3 + TypeScript 项目配置',
      type: 'vue3-ts',
      detection: {
        requiredFiles: ['tsconfig.json'],
        requiredDependencies: ['vue', 'typescript'],
        detector: async (projectPath) => {
          const packageJson = await this.readPackageJson(projectPath)
          const vueDep = packageJson.dependencies?.vue || packageJson.devDependencies?.vue
          const tsDep = packageJson.devDependencies?.typescript
          return vueDep && vueDep.startsWith('^3.') && !!tsDep
        }
      },
      config: {
        // 注意：这里存储的是插件名称，实际使用时需要动态导入
        launcher: {
          plugins: {
            plugins: ['@vitejs/plugin-vue']
          }
        },
        resolve: {
          alias: {
            '@': './src'
          }
        },
        server: {
          port: 3000,
          open: true
        },
        build: {
          target: 'es2020'
        }
      },
      recommendedPlugins: ['@vitejs/plugin-vue', 'vite-plugin-checker'],
      recommendedDependencies: ['vue-router', 'pinia', '@types/node']
    })

    // React 预设
    this.presets.set('react', {
      name: 'React',
      description: 'React 项目配置',
      type: 'react',
      detection: {
        requiredDependencies: ['react'],
        detector: async (projectPath) => {
          const packageJson = await this.readPackageJson(projectPath)
          return !!(packageJson.dependencies?.react || packageJson.devDependencies?.react)
        }
      },
      config: {
        // 注意：这里存储的是插件名称，实际使用时需要动态导入
        launcher: {
          plugins: {
            plugins: ['@vitejs/plugin-react']
          }
        },
        server: {
          port: 3000,
          open: true
        }
      },
      recommendedPlugins: ['@vitejs/plugin-react', 'vite-plugin-eslint'],
      recommendedDependencies: ['react-router-dom', 'react-query']
    })

    // Next.js 预设
    this.presets.set('next', {
      name: 'Next.js',
      description: 'Next.js 项目配置',
      type: 'next',
      detection: {
        requiredDependencies: ['next'],
        requiredFiles: ['next.config.js', 'next.config.ts']
      },
      config: {
        build: {
          outDir: '.next'
        },
        server: {
          port: 3000
        }
      },
      recommendedPlugins: ['@next/bundle-analyzer'],
      recommendedDependencies: ['@next/font', '@vercel/analytics']
    })

    // Nuxt 预设
    this.presets.set('nuxt', {
      name: 'Nuxt',
      description: 'Nuxt 项目配置',
      type: 'nuxt',
      detection: {
        requiredDependencies: ['nuxt'],
        requiredFiles: ['nuxt.config.ts', 'nuxt.config.js']
      },
      config: {
        build: {
          outDir: '.nuxt'
        },
        server: {
          port: 3000
        }
      },
      recommendedPlugins: ['@nuxt/devtools'],
      recommendedDependencies: ['@pinia/nuxt', '@nuxtjs/tailwindcss']
    })

    // 库项目预设
    this.presets.set('library', {
      name: 'Library',
      description: '库项目配置',
      type: 'library',
      detection: {
        detector: async (projectPath) => {
          const packageJson = await this.readPackageJson(projectPath)
          return packageJson.main || packageJson.module || packageJson.exports
        }
      },
      config: {
        build: {
          lib: {
            entry: './src/index.ts',
            formats: ['es', 'cjs']
          },
          rollupOptions: {
            external: ['vue', 'react']
          }
        }
      },
      recommendedPlugins: ['vite-plugin-dts'],
      recommendedDependencies: ['typescript', '@types/node']
    })

    // Electron 预设
    this.presets.set('electron', {
      name: 'Electron',
      description: 'Electron 桌面应用配置',
      type: 'electron',
      detection: {
        requiredDependencies: ['electron'],
        requiredFiles: ['electron/main.ts', 'electron/main.js']
      },
      config: {
        base: './',
        build: {
          outDir: 'dist-electron'
        },
        server: {
          port: 3000
        }
      },
      recommendedPlugins: ['vite-plugin-electron'],
      recommendedDependencies: ['electron-builder', 'electron-updater']
    })

    // 微前端预设
    this.presets.set('micro-frontend', {
      name: 'Micro Frontend',
      description: '微前端项目配置',
      type: 'micro-frontend',
      detection: {
        requiredDependencies: ['@module-federation/vite'],
        detector: async (projectPath) => {
          const packageJson = await this.readPackageJson(projectPath)
          return !!(packageJson.dependencies?.['@module-federation/vite'] || 
                   packageJson.devDependencies?.['@module-federation/vite'])
        }
      },
      config: {
        // 注意：这里存储的是插件名称，实际使用时需要动态导入
        launcher: {
          plugins: {
            plugins: ['@module-federation/vite']
          }
        },
        build: {
          target: 'esnext',
          minify: false,
          cssCodeSplit: false
        }
      },
      recommendedPlugins: ['@module-federation/vite'],
      recommendedDependencies: ['@module-federation/runtime']
    })
  }

  /**
   * 自动检测项目类型
   */
  async detectProjectType(): Promise<ProjectPreset[]> {
    this.logger.info('开始自动检测项目类型...')
    
    const detectedTypes: ProjectPreset[] = []
    
    for (const [type, preset] of this.presets) {
      try {
        const isMatch = await this.checkPresetMatch(preset)
        if (isMatch) {
          detectedTypes.push(type)
          this.logger.debug(`检测到项目类型: ${preset.name}`)
        }
      } catch (error) {
        this.logger.warn(`检测预设 ${preset.name} 时出错`, { error: (error as Error).message })
      }
    }
    
    this.logger.info(`检测完成，找到 ${detectedTypes.length} 个匹配的预设`)
    return detectedTypes
  }

  /**
   * 获取预设配置
   */
  getPresetConfig(type: ProjectPreset): Partial<ViteLauncherConfig> | null {
    const preset = this.presets.get(type)
    return preset ? preset.config : null
  }

  /**
   * 获取预设定义
   */
  getPresetDefinition(type: ProjectPreset): PresetDefinition | null {
    return this.presets.get(type) || null
  }

  /**
   * 获取所有预设
   */
  getAllPresets(): PresetDefinition[] {
    return Array.from(this.presets.values())
  }

  /**
   * 生成智能配置
   */
  async generateSmartConfig(options: SmartPresetOptions = {}): Promise<Partial<ViteLauncherConfig>> {
    const detectedTypes = await this.detectProjectType()
    
    if (detectedTypes.length === 0) {
      this.logger.warn('未检测到匹配的项目类型，使用默认配置')
      return this.getDefaultConfig()
    }

    // 选择最佳匹配的预设
    const bestMatch = this.selectBestPreset(detectedTypes, options)
    const preset = this.presets.get(bestMatch)
    
    if (!preset) {
      return this.getDefaultConfig()
    }

    this.logger.info(`使用预设: ${preset.name}`)
    
    // 合并配置
    let config = { ...preset.config }
    
    // 应用自定义配置
    if (options.custom) {
      config = this.mergeConfigs(config, options.custom)
    }
    
    // 添加智能优化
    config = await this.applySmartOptimizations(config, preset)
    
    return config
  }

  /**
   * 检查预设匹配
   */
  private async checkPresetMatch(preset: PresetDefinition): Promise<boolean> {
    const { detection } = preset
    
    // 检查必需文件
    if (detection.requiredFiles) {
      for (const file of detection.requiredFiles) {
        try {
          await fs.access(path.join(this.projectPath, file))
        } catch {
          return false
        }
      }
    }
    
    // 检查必需依赖
    if (detection.requiredDependencies) {
      try {
        const packageJson = await this.readPackageJson(this.projectPath)
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        }
        
        for (const dep of detection.requiredDependencies) {
          if (!allDeps[dep]) {
            return false
          }
        }
      } catch {
        return false
      }
    }
    
    // 检查必需脚本
    if (detection.requiredScripts) {
      try {
        const packageJson = await this.readPackageJson(this.projectPath)
        const scripts = packageJson.scripts || {}
        
        for (const script of detection.requiredScripts) {
          if (!scripts[script]) {
            return false
          }
        }
      } catch {
        return false
      }
    }
    
    // 执行自定义检测函数
    if (detection.detector) {
      return await detection.detector(this.projectPath)
    }
    
    return true
  }

  /**
   * 选择最佳预设
   */
  private selectBestPreset(types: ProjectPreset[], options: SmartPresetOptions): ProjectPreset {
    // 如果只有一个匹配，直接返回
    if (types.length === 1) {
      return types[0]
    }
    
    // 根据优先级排序
    const priorityOrder: ProjectPreset[] = [
      'vue3-ts', 'react-ts', 'vue3', 'react',
      'next', 'nuxt', 'svelte', 'astro',
      'library', 'electron', 'micro-frontend'
    ]
    
    for (const priority of priorityOrder) {
      if (types.includes(priority)) {
        return priority
      }
    }
    
    // 如果没有匹配优先级，返回第一个
    return types[0]
  }

  /**
   * 应用智能优化
   */
  private async applySmartOptimizations(
    config: Partial<ViteLauncherConfig>, 
    preset: PresetDefinition
  ): Promise<Partial<ViteLauncherConfig>> {
    // 根据项目大小调整配置
    const projectSize = await this.estimateProjectSize()
    
    if (projectSize > 1000) { // 大型项目
      config.build = {
        ...config.build,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          ...config.build?.rollupOptions,
          output: {
            manualChunks: {
              vendor: ['vue', 'react'],
              utils: ['lodash', 'dayjs']
            }
          }
        }
      }
    }
    
    // 根据依赖数量调整优化配置
    const depCount = await this.countDependencies()
    
    if (depCount > 50) {
      config.optimizeDeps = {
        ...config.optimizeDeps,
        include: preset.recommendedDependencies?.slice(0, 10)
      }
    }
    
    return config
  }

  /**
   * 读取 package.json
   */
  private async readPackageJson(projectPath: string): Promise<any> {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json')
      const content = await fs.readFile(packageJsonPath, 'utf8')
      return JSON.parse(content)
    } catch {
      return {}
    }
  }

  /**
   * 估算项目大小
   */
  private async estimateProjectSize(): Promise<number> {
    try {
      const srcPath = path.join(this.projectPath, 'src')
      const files = await this.countFiles(srcPath)
      return files
    } catch {
      return 0
    }
  }

  /**
   * 统计文件数量
   */
  private async countFiles(dir: string): Promise<number> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      let count = 0
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          count += await this.countFiles(path.join(dir, entry.name))
        } else {
          count++
        }
      }
      
      return count
    } catch {
      return 0
    }
  }

  /**
   * 统计依赖数量
   */
  private async countDependencies(): Promise<number> {
    try {
      const packageJson = await this.readPackageJson(this.projectPath)
      const deps = Object.keys(packageJson.dependencies || {})
      const devDeps = Object.keys(packageJson.devDependencies || {})
      return deps.length + devDeps.length
    } catch {
      return 0
    }
  }

  /**
   * 合并配置
   */
  private mergeConfigs(base: any, override: any): any {
    const result = { ...base }
    
    for (const key in override) {
      if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
        result[key] = this.mergeConfigs(result[key] || {}, override[key])
      } else {
        result[key] = override[key]
      }
    }
    
    return result
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): Partial<ViteLauncherConfig> {
    return {
      server: {
        port: 3000,
        open: true
      },
      build: {
        outDir: 'dist',
        sourcemap: true
      }
    }
  }
}
