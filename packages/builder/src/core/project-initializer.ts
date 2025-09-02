/**
 * 智能项目初始化器
 * 根据项目特征自动生成最优的配置文件
 */

import type {
  BuildOptions,
  ProjectType,
  OutputFormat,
} from '../types'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { Logger } from '../utils/logger'

const logger = new Logger('ProjectInitializer')

export interface InitializationOptions {
  /** 项目名称 */
  name?: string
  /** 项目类型 */
  type?: ProjectType
  /** 是否使用TypeScript */
  typescript?: boolean
  /** 目标环境 */
  target?: 'browser' | 'node' | 'universal'
  /** 项目模板 */
  template?: 'library' | 'application' | 'component'
  /** 输出目录 */
  outDir?: string
  /** 是否覆盖现有配置 */
  force?: boolean
}

export interface InitializationResult {
  success: boolean
  configFile: string
  packageJsonUpdates: Record<string, any>
  createdFiles: string[]
  messages: string[]
  errors: string[]
}

export class ProjectInitializer {
  /**
   * 智能初始化项目
   */
  async initialize(
    projectPath: string,
    options: InitializationOptions = {}
  ): Promise<InitializationResult> {
    logger.info('开始智能项目初始化...')

    const result: InitializationResult = {
      success: false,
      configFile: '',
      packageJsonUpdates: {},
      createdFiles: [],
      messages: [],
      errors: [],
    }

    try {
      // 分析现有项目结构
      const projectInfo = await this.analyzeProject(projectPath)

      // 生成配置
      const buildConfig = this.generateBuildConfig(projectInfo, options)

      // 创建配置文件
      const configFile = await this.createConfigFile(projectPath, buildConfig, options.force)
      result.configFile = configFile
      result.createdFiles.push(configFile)

      // 生成 package.json 建议
      const packageUpdates = this.generatePackageJsonUpdates(projectInfo, buildConfig)
      result.packageJsonUpdates = packageUpdates

      // 创建必要的目录结构
      const createdDirs = await this.createDirectoryStructure(projectPath, buildConfig)
      result.createdFiles.push(...createdDirs)

      // 生成提示信息
      result.messages = this.generateInitializationMessages(buildConfig, packageUpdates)

      result.success = true
      logger.info('项目初始化完成')

      return result
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      result.errors.push(errorMessage)
      logger.error('项目初始化失败:', error)
      
      return result
    }
  }

  /**
   * 分析现有项目
   */
  private async analyzeProject(projectPath: string): Promise<{
    hasPackageJson: boolean
    packageInfo: any
    projectType: ProjectType
    hasTypeScript: boolean
    hasFramework: string | null
    sourceStructure: {
      hasSrcDir: boolean
      hasLibDir: boolean
      entryPoints: string[]
    }
  }> {
    const packageJsonPath = resolve(projectPath, 'package.json')
    let packageInfo = {}
    let hasPackageJson = false

    if (existsSync(packageJsonPath)) {
      try {
        packageInfo = require(packageJsonPath)
        hasPackageJson = true
      }
      catch (error) {
        logger.warn('读取 package.json 失败:', error)
      }
    }

    // 检测项目类型
    const projectType = this.detectProjectType(packageInfo)
    
    // 检测 TypeScript
    const hasTypeScript = this.detectTypeScript(projectPath, packageInfo)
    
    // 检测框架
    const hasFramework = this.detectFramework(packageInfo)
    
    // 分析源码结构
    const sourceStructure = this.analyzeSourceStructure(projectPath)

    return {
      hasPackageJson,
      packageInfo,
      projectType,
      hasTypeScript,
      hasFramework,
      sourceStructure,
    }
  }

  /**
   * 生成构建配置
   */
  private generateBuildConfig(
    projectInfo: any,
    options: InitializationOptions
  ): BuildOptions {
    const config: BuildOptions = {
      input: 'src/index.ts',
      outDir: options.outDir || 'dist',
      formats: this.recommendFormats(projectInfo, options),
      dts: projectInfo.hasTypeScript,
      minify: true,
      sourcemap: true,
      clean: true,
    }

    // 根据项目类型调整配置
    switch (projectInfo.projectType) {
      case 'vue':
        config.external = ['vue']
        config.globals = { vue: 'Vue' }
        break
      case 'react':
        config.external = ['react', 'react-dom']
        config.globals = { react: 'React', 'react-dom': 'ReactDOM' }
        break
      case 'typescript':
      case 'javascript':
        if (options.template === 'library') {
          config.lib = true
        }
        break
    }

    // 如果有指定名称，设置 UMD/IIFE 名称
    if (options.name) {
      config.name = options.name
    } else if (projectInfo.packageInfo.name) {
      config.name = this.normalizePackageName(projectInfo.packageInfo.name)
    }

    return config
  }

  /**
   * 推荐输出格式
   */
  private recommendFormats(
    projectInfo: any,
    options: InitializationOptions
  ): OutputFormat[] {
    const template = options.template || 'library'
    const target = options.target || 'browser'

    if (template === 'application') {
      return ['esm']
    }

    if (template === 'component') {
      switch (projectInfo.projectType) {
        case 'vue':
          return ['esm', 'cjs', 'umd']
        case 'react':
          return ['esm', 'cjs']
        default:
          return ['esm', 'cjs']
      }
    }

    // library 模板
    switch (target) {
      case 'node':
        return ['esm', 'cjs']
      case 'browser':
        return ['esm', 'umd', 'iife']
      case 'universal':
      default:
        return ['esm', 'cjs', 'umd']
    }
  }

  /**
   * 创建配置文件
   */
  private async createConfigFile(
    projectPath: string,
    config: BuildOptions,
    force = false
  ): Promise<string> {
    const configPath = resolve(projectPath, 'ldesign.config.ts')

    if (existsSync(configPath) && !force) {
      throw new Error('配置文件已存在，使用 --force 参数强制覆盖')
    }

    const configContent = this.generateConfigContent(config)
    
    writeFileSync(configPath, configContent, 'utf-8')
    logger.info(`创建配置文件: ${configPath}`)

    return configPath
  }

  /**
   * 生成配置文件内容
   */
  private generateConfigContent(config: BuildOptions): string {
    const lines: string[] = []

    lines.push("import { defineConfig } from '@ldesign/builder'")
    lines.push('')
    lines.push('export default defineConfig({')

    // 基本配置
    lines.push(`  // 入口文件`)
    lines.push(`  input: '${config.input}',`)
    lines.push('')

    lines.push(`  // 输出目录`)
    lines.push(`  outDir: '${config.outDir}',`)
    lines.push('')

    lines.push(`  // 输出格式`)
    lines.push(`  formats: [${config.formats?.map(f => `'${f}'`).join(', ')}],`)
    lines.push('')

    // 类型声明
    if (config.dts) {
      lines.push(`  // 生成类型声明文件`)
      lines.push(`  dts: true,`)
      lines.push('')
    }

    // 外部依赖
    if (config.external && Array.isArray(config.external) && config.external.length > 0) {
      lines.push(`  // 外部依赖（不会被打包）`)
      lines.push(`  external: [${config.external.map(ext => `'${ext}'`).join(', ')}],`)
      lines.push('')
    }

    // 全局变量映射
    if (config.globals && Object.keys(config.globals).length > 0) {
      lines.push(`  // 全局变量映射（用于 IIFE 和 UMD 格式）`)
      lines.push(`  globals: {`)
      Object.entries(config.globals).forEach(([key, value]) => {
        lines.push(`    '${key}': '${value}',`)
      })
      lines.push(`  },`)
      lines.push('')
    }

    // UMD/IIFE 名称
    if (config.name) {
      lines.push(`  // UMD/IIFE 全局变量名`)
      lines.push(`  name: '${config.name}',`)
      lines.push('')
    }

    // 其他选项
    lines.push(`  // 构建选项`)
    lines.push(`  minify: ${config.minify},`)
    lines.push(`  sourcemap: ${config.sourcemap},`)
    lines.push(`  clean: ${config.clean},`)

    lines.push('})')

    return lines.join('\n')
  }

  /**
   * 生成 package.json 更新建议
   */
  private generatePackageJsonUpdates(
    projectInfo: any,
    config: BuildOptions
  ): Record<string, any> {
    const updates: Record<string, any> = {}

    // 建议的 scripts
    updates.scripts = {
      ...projectInfo.packageInfo.scripts,
      'build': 'ldesign-builder build',
      'build:watch': 'ldesign-builder watch',
      'build:analyze': 'ldesign-builder analyze',
    }

    // 建议的 main/module/types 字段
    if (config.formats?.includes('cjs')) {
      updates.main = 'cjs/index.js'
    }
    
    if (config.formats?.includes('esm')) {
      updates.module = 'esm/index.js'
    }
    
    if (config.dts) {
      updates.types = 'types/index.d.ts'
    }

    // 建议的 exports 字段
    if (config.formats && config.formats.length > 1) {
      updates.exports = this.generateExportsField(config.formats)
    }

    // 建议的 files 字段
    const files = ['README.md']
    config.formats?.forEach(format => {
      switch (format) {
        case 'esm':
          files.push('esm/')
          break
        case 'cjs':
          files.push('cjs/')
          break
        case 'umd':
        case 'iife':
          files.push('dist/')
          break
      }
    })
    if (config.dts) {
      files.push('types/')
    }
    updates.files = files

    return updates
  }

  /**
   * 生成 exports 字段
   */
  private generateExportsField(formats: OutputFormat[]): Record<string, any> {
    const exports: Record<string, any> = {}

    if (formats.includes('esm') && formats.includes('cjs')) {
      exports['.'] = {
        import: './esm/index.js',
        require: './cjs/index.js',
        types: './types/index.d.ts',
      }
    } else if (formats.includes('esm')) {
      exports['.'] = {
        import: './esm/index.js',
        types: './types/index.d.ts',
      }
    } else if (formats.includes('cjs')) {
      exports['.'] = {
        require: './cjs/index.js',
        types: './types/index.d.ts',
      }
    }

    return exports
  }

  /**
   * 创建目录结构
   */
  private async createDirectoryStructure(
    projectPath: string,
    config: BuildOptions
  ): Promise<string[]> {
    const createdDirs: string[] = []

    // 确保源码目录存在
    const srcDir = resolve(projectPath, 'src')
    if (!existsSync(srcDir)) {
      mkdirSync(srcDir, { recursive: true })
      createdDirs.push(srcDir)
      
      // 创建示例入口文件
      const entryFile = resolve(srcDir, 'index.ts')
      const entryContent = this.generateEntryFileContent(config)
      writeFileSync(entryFile, entryContent, 'utf-8')
      createdDirs.push(entryFile)
    }

    return createdDirs
  }

  /**
   * 生成入口文件内容
   */
  private generateEntryFileContent(config: BuildOptions): string {
    const lines: string[] = []

    lines.push('/**')
    lines.push(' * 项目主入口文件')
    lines.push(' * 由 @ldesign/builder 自动生成')
    lines.push(' */')
    lines.push('')

    // 根据项目类型生成不同的示例代码
    if (Array.isArray(config.external) && config.external.includes('vue')) {
      lines.push("// Vue 组件库示例")
      lines.push("export { default as MyComponent } from './components/MyComponent.vue'")
      lines.push('')
      lines.push("// 导出类型")
      lines.push("export type { ComponentProps } from './types'")
    } else if (Array.isArray(config.external) && config.external.includes('react')) {
      lines.push("// React 组件库示例")
      lines.push("export { default as MyComponent } from './components/MyComponent'")
      lines.push('')
      lines.push("// 导出类型")
      lines.push("export type { ComponentProps } from './types'")
    } else {
      lines.push("// 示例导出")
      lines.push("export function hello(name: string): string {")
      lines.push("  return `Hello, ${name}!`")
      lines.push("}")
      lines.push('')
      lines.push("// 默认导出")
      lines.push("export default {")
      lines.push("  hello,")
      lines.push("}")
    }

    return lines.join('\n')
  }

  /**
   * 生成初始化提示信息
   */
  private generateInitializationMessages(
    config: BuildOptions,
    packageUpdates: Record<string, any>
  ): string[] {
    const messages: string[] = []

    messages.push('🎉 项目初始化完成！')
    messages.push('')
    messages.push('📋 创建的配置:')
    messages.push(`  • 输出格式: ${config.formats?.join(', ')}`)
    messages.push(`  • 类型声明: ${config.dts ? '已启用' : '已禁用'}`)
    messages.push(`  • 代码压缩: ${config.minify ? '已启用' : '已禁用'}`)
    messages.push('')

    if (Object.keys(packageUpdates).length > 0) {
      messages.push('💡 建议更新 package.json:')
      
      if (packageUpdates.main) {
        messages.push(`  • "main": "${packageUpdates.main}"`)
      }
      if (packageUpdates.module) {
        messages.push(`  • "module": "${packageUpdates.module}"`)
      }
      if (packageUpdates.types) {
        messages.push(`  • "types": "${packageUpdates.types}"`)
      }
      if (packageUpdates.scripts) {
        messages.push(`  • 添加构建脚本到 scripts 字段`)
      }
      messages.push('')
    }

    messages.push('🚀 开始构建:')
    messages.push('  npm run build')
    messages.push('  # 或')
    messages.push('  ldesign-builder build')

    return messages
  }

  // 私有辅助方法

  private detectProjectType(packageInfo: any): ProjectType {
    const allDeps = {
      ...packageInfo.dependencies,
      ...packageInfo.devDependencies,
      ...packageInfo.peerDependencies,
    }

    if (allDeps.vue || allDeps['@vue/core']) {
      return 'vue'
    }
    if (allDeps.react || allDeps['@types/react']) {
      return 'react'
    }
    if (allDeps['@angular/core']) {
      return 'angular'
    }
    if (allDeps.svelte) {
      return 'svelte'
    }
    if (allDeps.typescript || allDeps['@types/node']) {
      return 'typescript'
    }

    return 'javascript'
  }

  private detectTypeScript(projectPath: string, packageInfo: any): boolean {
    // 检查是否有 TypeScript 配置文件
    const tsConfigExists = existsSync(resolve(projectPath, 'tsconfig.json'))
    
    // 检查依赖
    const allDeps = {
      ...packageInfo.dependencies,
      ...packageInfo.devDependencies,
    }
    const hasTypescriptDep = Boolean(allDeps.typescript)

    return tsConfigExists || hasTypescriptDep
  }

  private detectFramework(packageInfo: any): string | null {
    const allDeps = {
      ...packageInfo.dependencies,
      ...packageInfo.devDependencies,
      ...packageInfo.peerDependencies,
    }

    if (allDeps.vue) return 'vue'
    if (allDeps.react) return 'react'
    if (allDeps['@angular/core']) return 'angular'
    if (allDeps.svelte) return 'svelte'

    return null
  }

  private analyzeSourceStructure(projectPath: string): {
    hasSrcDir: boolean
    hasLibDir: boolean
    entryPoints: string[]
  } {
    const srcDir = resolve(projectPath, 'src')
    const libDir = resolve(projectPath, 'lib')
    
    const hasSrcDir = existsSync(srcDir)
    const hasLibDir = existsSync(libDir)

    // 查找可能的入口点
    const entryPoints: string[] = []
    const possibleEntries = [
      'src/index.ts', 'src/index.js',
      'src/main.ts', 'src/main.js',
      'lib/index.ts', 'lib/index.js',
      'index.ts', 'index.js',
    ]

    for (const entry of possibleEntries) {
      if (existsSync(resolve(projectPath, entry))) {
        entryPoints.push(entry)
      }
    }

    return {
      hasSrcDir,
      hasLibDir,
      entryPoints,
    }
  }

  private normalizePackageName(name: string): string {
    // 将包名转换为合适的全局变量名
    return name
      .replace(/[@\/\-]/g, '')
      .replace(/^./, c => c.toUpperCase())
      .replace(/[A-Z]/g, (match, offset) => offset > 0 ? match : match.toUpperCase())
  }
}
