/**
 * 自动配置增强器
 * 
 * 自动处理 external、globals、libraryType 和 Vue 插件配置
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type { BuilderConfig } from '../types/config'
import { LibraryType } from '../types/library'
import { Logger } from './logger'

/**
 * 包信息接口
 */
interface PackageInfo {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

/**
 * 已知的全局变量映射
 */
const KNOWN_GLOBALS: Record<string, string> = {
  'vue': 'Vue',
  'react': 'React',
  'react-dom': 'ReactDOM',
  'lodash': '_',
  'lodash-es': '_',
  'jquery': '$',
  'moment': 'moment',
  'dayjs': 'dayjs',
  'axios': 'axios',
  'raf': 'raf',
  '@vue/runtime-core': 'Vue',
  '@vue/runtime-dom': 'Vue',
  '@vue/reactivity': 'Vue',
  '@vue/shared': 'Vue'
}

/**
 * 自动配置增强器类
 */
export class AutoConfigEnhancer {
  private logger: Logger
  private projectPath: string
  private packageInfo?: PackageInfo

  constructor(projectPath: string, logger?: Logger) {
    this.projectPath = projectPath
    this.logger = logger || new Logger()
  }

  /**
   * 增强配置
   */
  async enhanceConfig(config: BuilderConfig): Promise<BuilderConfig> {
    this.logger.debug('开始配置自动增强...')
    const enhanced = { ...config }

    // 读取 package.json
    this.logger.debug('读取 package.json...')
    await this.loadPackageInfo()

    // 自动检测库类型
    this.logger.debug(`当前 libraryType: ${enhanced.libraryType}`)
    if (!enhanced.libraryType || enhanced.libraryType === LibraryType.TYPESCRIPT) {
      this.logger.debug('libraryType 为空或为默认的 TypeScript 类型，开始自动检测...')
      enhanced.libraryType = await this.detectLibraryType()
      this.logger.debug(`自动检测库类型: ${enhanced.libraryType}`)
    } else {
      this.logger.debug('libraryType 已明确设置，跳过自动检测')
    }

    // 自动生成 external
    if (!enhanced.external || (Array.isArray(enhanced.external) && enhanced.external.length === 0)) {
      enhanced.external = this.generateExternal()
    }

    // 自动生成 globals
    if (!enhanced.globals || Object.keys(enhanced.globals).length === 0) {
      enhanced.globals = this.generateGlobals(enhanced.external)
    }

    // 自动添加默认的 exclude 配置
    if (!enhanced.exclude || (Array.isArray(enhanced.exclude) && enhanced.exclude.length === 0)) {
      enhanced.exclude = this.generateDefaultExcludes()
    }

    // 自动添加 Vue 插件
    this.logger.debug(`检查是否需要添加 Vue 插件，libraryType: ${enhanced.libraryType}`)
    if (enhanced.libraryType === LibraryType.VUE3 || enhanced.libraryType === LibraryType.VUE2) {
      this.logger.debug(`检测到 ${enhanced.libraryType} 项目，自动添加 Vue 插件`)
      enhanced.plugins = await this.addVuePlugin(enhanced.plugins || [], enhanced.libraryType)
    } else {
      this.logger.debug('非 Vue 项目，不添加 Vue 插件')
    }

    this.logger.debug('配置自动增强完成')
    return enhanced
  }

  /**
   * 加载 package.json 信息
   */
  private async loadPackageInfo(): Promise<void> {
    try {
      const packagePath = path.join(this.projectPath, 'package.json')
      const content = await fs.readFile(packagePath, 'utf-8')
      this.packageInfo = JSON.parse(content)
    } catch (error) {
      this.logger.warn('无法读取 package.json，将使用默认配置')
      this.packageInfo = {}
    }
  }

  /**
   * 检测库类型
   */
  private async detectLibraryType(): Promise<LibraryType> {
    this.logger.debug('开始检测库类型...')

    if (!this.packageInfo) {
      this.logger.debug('没有 package.json 信息，返回 TypeScript 类型')
      return LibraryType.TYPESCRIPT
    }

    const allDeps = {
      ...this.packageInfo.dependencies,
      ...this.packageInfo.devDependencies,
      ...this.packageInfo.peerDependencies
    }
    this.logger.debug(`所有依赖: ${JSON.stringify(Object.keys(allDeps))}`)

    // 检查是否有 Vue 文件
    const hasVueFiles = await this.hasVueFiles()
    this.logger.debug(`是否有 Vue 文件: ${hasVueFiles}`)

    if (hasVueFiles) {
      // 检查 Vue 版本
      const vueVersion = allDeps.vue
      this.logger.info(`Vue 版本: ${vueVersion}`)

      if (vueVersion && vueVersion.includes('2.')) {
        this.logger.info('检测到 Vue 2 项目')
        return LibraryType.VUE2
      } else {
        this.logger.info('检测到 Vue 3 项目')
        return LibraryType.VUE3
      }
    }

    // 检查 React
    if (allDeps.react) {
      this.logger.info('检测到 React 项目')
      return LibraryType.REACT
    }

    // 检查样式库
    if (allDeps.less || allDeps.sass || allDeps.stylus) {
      this.logger.info('检测到样式库项目')
      return LibraryType.STYLE
    }

    this.logger.info('检测到 TypeScript 项目')
    return LibraryType.TYPESCRIPT
  }

  /**
   * 检查是否有 Vue 文件
   */
  private async hasVueFiles(): Promise<boolean> {
    try {
      const srcPath = path.join(this.projectPath, 'src')
      const files = await this.findVueFiles(srcPath)
      this.logger.debug(`在 ${srcPath} 中找到 ${files.length} 个 Vue 文件: ${files.join(', ')}`)
      return files.length > 0
    } catch (error) {
      this.logger.warn(`检查 Vue 文件时出错: ${error}`)
      return false
    }
  }

  /**
   * 递归查找 Vue 文件
   */
  private async findVueFiles(dir: string): Promise<string[]> {
    const vueFiles: string[] = []

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory() && entry.name !== 'node_modules') {
          const subFiles = await this.findVueFiles(fullPath)
          vueFiles.push(...subFiles)
        } else if (entry.isFile() && entry.name.endsWith('.vue')) {
          vueFiles.push(fullPath)
        }
      }
    } catch {
      // 忽略错误
    }

    return vueFiles
  }

  /**
   * 生成 external 配置
   */
  private generateExternal(): string[] {
    if (!this.packageInfo) {
      return []
    }

    const external: string[] = []

    // 添加 peerDependencies
    if (this.packageInfo.peerDependencies) {
      external.push(...Object.keys(this.packageInfo.peerDependencies))
    }

    // 添加常见的外部依赖
    if (this.packageInfo.dependencies) {
      const deps = Object.keys(this.packageInfo.dependencies)
      const commonExternals = ['vue', 'react', 'react-dom', 'lodash', 'lodash-es', 'moment', 'dayjs']

      for (const dep of deps) {
        if (commonExternals.includes(dep)) {
          external.push(dep)
        }
      }
    }

    this.logger.info(`自动生成 external: ${external.join(', ')}`)
    return [...new Set(external)] // 去重
  }

  /**
   * 生成 globals 配置
   */
  private generateGlobals(external: string[] | ((id: string) => boolean) | undefined): Record<string, string> {
    if (!external || typeof external === 'function') {
      return {}
    }

    const globals: Record<string, string> = {}

    for (const dep of external) {
      if (KNOWN_GLOBALS[dep]) {
        globals[dep] = KNOWN_GLOBALS[dep]
      } else {
        // 生成驼峰命名的全局变量名
        globals[dep] = this.toPascalCase(dep)
      }
    }

    this.logger.info(`自动生成 globals: ${JSON.stringify(globals)}`)
    return globals
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(name: string): string {
    // 移除作用域前缀
    const base = name.replace(/^@[^/]+\//, '')

    return base
      .split(/[\/-]/)
      .filter(Boolean)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join('')
  }

  /**
   * 添加 Vue 插件
   */
  private async addVuePlugin(plugins: any[], libraryType: LibraryType): Promise<any[]> {
    // 检查是否已经有 Vue 插件
    const hasVuePlugin = plugins.some(plugin =>
      plugin && (
        plugin.name === 'vue' ||
        plugin.name === 'rollup-plugin-vue' ||
        (typeof plugin === 'function' && plugin.toString().includes('vue'))
      )
    )

    if (hasVuePlugin) {
      this.logger.info('已存在 Vue 插件，跳过自动添加')
      return plugins
    }

    try {
      // 动态导入 Vue 插件
      const { default: vue } = await import('rollup-plugin-vue')

      const vuePlugin = vue({
        target: 'browser',
        compileTemplate: true,
        ...(libraryType === LibraryType.VUE2 ? { version: 2 } : {})
      } as any)

      this.logger.info(`自动添加 Vue ${libraryType === LibraryType.VUE2 ? '2' : '3'} 插件`)
      return [vuePlugin, ...plugins]
    } catch (error) {
      this.logger.warn('无法加载 Vue 插件，请手动安装 rollup-plugin-vue')
      return plugins
    }
  }

  /**
   * 生成默认的排除配置
   */
  private generateDefaultExcludes(): string[] {
    return [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/test/**',
      '**/tests/**',
      '**/__tests__/**',
      '**/examples/**',
      '**/demo/**',
      '**/demos/**',
      '**/*.stories.ts',
      '**/*.stories.tsx'
    ]
  }
}

/**
 * 创建自动配置增强器
 */
export function createAutoConfigEnhancer(projectPath: string, logger?: Logger): AutoConfigEnhancer {
  return new AutoConfigEnhancer(projectPath, logger)
}
