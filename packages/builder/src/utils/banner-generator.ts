/**
 * Banner 生成器
 * 
 * 为打包产物生成标识 banner
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import fs from 'fs'
import path from 'path'

export interface BannerOptions {
  /** 打包工具名称 */
  bundler: string
  /** 打包工具版本 */
  bundlerVersion?: string
  /** 项目名称 */
  projectName?: string
  /** 项目版本 */
  projectVersion?: string
  /** 项目描述 */
  projectDescription?: string
  /** 项目作者 */
  projectAuthor?: string
  /** 项目许可证 */
  projectLicense?: string
  /** 构建时间 */
  buildTime?: Date
  /** 构建模式 */
  buildMode?: string
  /** 是否压缩 */
  minified?: boolean
  /** 自定义信息 */
  customInfo?: Record<string, string>
  /** Banner 样式 */
  style?: 'default' | 'compact' | 'detailed'
}

export class BannerGenerator {
  /**
   * 生成 banner 字符串
   */
  static generate(options: BannerOptions): string {
    const {
      bundler,
      bundlerVersion,
      projectName,
      projectVersion,
      projectDescription,
      projectAuthor,
      projectLicense,
      buildTime = new Date(),
      buildMode = 'production',
      minified = false,
      customInfo = {},
      style = 'default'
    } = options

    switch (style) {
      case 'compact':
        return this.generateCompactBanner(options)
      case 'detailed':
        return this.generateDetailedBanner(options)
      default:
        return this.generateDefaultBanner(options)
    }
  }

  /**
   * 生成默认样式的 banner
   */
  private static generateDefaultBanner(options: BannerOptions): string {
    const {
      bundler,
      bundlerVersion,
      projectName,
      projectVersion,
      buildTime = new Date(),
      buildMode = 'production',
      minified = false
    } = options

    const lines = [
      `Built with ${bundler}${bundlerVersion ? ` v${bundlerVersion}` : ''}`,
      `Build time: ${buildTime.toISOString()}`,
      `Build mode: ${buildMode}`,
      `Minified: ${minified ? 'Yes' : 'No'}`
    ]

    if (projectName) {
      lines.unshift(`${projectName}${projectVersion ? ` v${projectVersion}` : ''}`)
    }

    const maxLength = Math.max(...lines.map(line => line.length))
    const border = '*'.repeat(maxLength + 4)

    return [
      `/*!`,
      ` * ${border}`,
      ...lines.map(line => ` * ${line.padEnd(maxLength)} *`),
      ` * ${border}`,
      ` */`
    ].join('\n')
  }

  /**
   * 生成紧凑样式的 banner
   */
  private static generateCompactBanner(options: BannerOptions): string {
    const {
      bundler,
      bundlerVersion,
      projectName,
      projectVersion,
      buildTime = new Date()
    } = options

    const parts = []
    
    if (projectName) {
      parts.push(`${projectName}${projectVersion ? ` v${projectVersion}` : ''}`)
    }
    
    parts.push(`Built with ${bundler}${bundlerVersion ? ` v${bundlerVersion}` : ''}`)
    parts.push(buildTime.toISOString().split('T')[0])

    return `/*! ${parts.join(' | ')} */`
  }

  /**
   * 生成详细样式的 banner
   */
  private static generateDetailedBanner(options: BannerOptions): string {
    const {
      bundler,
      bundlerVersion,
      projectName,
      projectVersion,
      projectDescription,
      projectAuthor,
      projectLicense,
      buildTime = new Date(),
      buildMode = 'production',
      minified = false,
      customInfo = {}
    } = options

    const lines = []

    // 项目信息
    if (projectName) {
      lines.push(`Project: ${projectName}${projectVersion ? ` v${projectVersion}` : ''}`)
    }
    if (projectDescription) {
      lines.push(`Description: ${projectDescription}`)
    }
    if (projectAuthor) {
      lines.push(`Author: ${projectAuthor}`)
    }
    if (projectLicense) {
      lines.push(`License: ${projectLicense}`)
    }

    if (lines.length > 0) {
      lines.push('')
    }

    // 构建信息
    lines.push(`Built with: ${bundler}${bundlerVersion ? ` v${bundlerVersion}` : ''}`)
    lines.push(`Build time: ${buildTime.toISOString()}`)
    lines.push(`Build mode: ${buildMode}`)
    lines.push(`Minified: ${minified ? 'Yes' : 'No'}`)

    // 自定义信息
    if (Object.keys(customInfo).length > 0) {
      lines.push('')
      Object.entries(customInfo).forEach(([key, value]) => {
        lines.push(`${key}: ${value}`)
      })
    }

    const maxLength = Math.max(...lines.map(line => line.length))
    const border = '='.repeat(maxLength + 4)

    return [
      `/*!`,
      ` * ${border}`,
      ...lines.map(line => line ? ` * ${line.padEnd(maxLength)} *` : ` * ${' '.repeat(maxLength)} *`),
      ` * ${border}`,
      ` */`
    ].join('\n')
  }

  /**
   * 从 package.json 获取项目信息
   */
  static async getProjectInfo(packageJsonPath?: string): Promise<Partial<BannerOptions>> {
    try {
      const pkgPath = packageJsonPath || path.resolve(process.cwd(), 'package.json')
      const packageJson = JSON.parse(await fs.promises.readFile(pkgPath, 'utf-8'))

      return {
        projectName: packageJson.name,
        projectVersion: packageJson.version,
        projectDescription: packageJson.description,
        projectAuthor: typeof packageJson.author === 'string' 
          ? packageJson.author 
          : packageJson.author?.name,
        projectLicense: packageJson.license
      }
    } catch (error) {
      return {}
    }
  }

  /**
   * 获取打包工具版本
   */
  static async getBundlerVersion(bundler: string): Promise<string | undefined> {
    try {
      const packagePath = path.resolve(process.cwd(), 'node_modules', bundler, 'package.json')
      const packageJson = JSON.parse(await fs.promises.readFile(packagePath, 'utf-8'))
      return packageJson.version
    } catch (error) {
      return undefined
    }
  }

  /**
   * 创建 Rollup banner 函数
   */
  static createRollupBanner(options: Partial<BannerOptions> = {}): () => Promise<string> {
    return async () => {
      const projectInfo = await this.getProjectInfo()
      const bundlerVersion = await this.getBundlerVersion('rollup')

      const bannerOptions: BannerOptions = {
        bundler: 'Rollup',
        bundlerVersion,
        buildTime: new Date(),
        ...projectInfo,
        ...options
      }

      return this.generate(bannerOptions)
    }
  }

  /**
   * 创建 Rolldown banner 函数
   */
  static createRolldownBanner(options: Partial<BannerOptions> = {}): () => Promise<string> {
    return async () => {
      const projectInfo = await this.getProjectInfo()
      const bundlerVersion = await this.getBundlerVersion('rolldown')

      const bannerOptions: BannerOptions = {
        bundler: 'Rolldown',
        bundlerVersion,
        buildTime: new Date(),
        ...projectInfo,
        ...options
      }

      return this.generate(bannerOptions)
    }
  }

  /**
   * 创建通用 banner 函数
   */
  static createBanner(bundler: string, options: Partial<BannerOptions> = {}): () => Promise<string> {
    return async () => {
      const projectInfo = await this.getProjectInfo()
      const bundlerVersion = await this.getBundlerVersion(bundler)

      const bannerOptions: BannerOptions = {
        bundler: bundler.charAt(0).toUpperCase() + bundler.slice(1),
        bundlerVersion,
        buildTime: new Date(),
        ...projectInfo,
        ...options
      }

      return this.generate(bannerOptions)
    }
  }
}
