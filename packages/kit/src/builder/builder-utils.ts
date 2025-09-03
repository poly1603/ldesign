/**
 * 构建器工具函数
 * 提供构建相关的实用工具函数
 */

import { resolve, join, relative, dirname, basename, extname } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'fs'
import { glob } from 'glob'
import type { BuildResult, OutputFormat, BuildEnvironment } from './types'

/**
 * 构建器工具类
 */
export class BuilderUtils {
  /**
   * 检测项目类型
   * @param projectPath 项目路径
   * @returns 项目类型
   */
  static detectProjectType(projectPath: string): string {
    const packageJsonPath = resolve(projectPath, 'package.json')
    
    if (!existsSync(packageJsonPath)) {
      return 'unknown'
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

      // 检测框架
      if (dependencies.vue || dependencies['@vue/core']) {
        return 'vue'
      }
      if (dependencies.react || dependencies['react-dom']) {
        return 'react'
      }
      if (dependencies.angular || dependencies['@angular/core']) {
        return 'angular'
      }
      if (dependencies.svelte) {
        return 'svelte'
      }

      // 检测库类型
      if (packageJson.main || packageJson.module || packageJson.exports) {
        return 'library'
      }

      // 检测 Node.js 应用
      if (packageJson.type === 'module' || dependencies.express || dependencies.koa) {
        return 'node'
      }

      return 'web'
    } catch {
      return 'unknown'
    }
  }

  /**
   * 查找入口文件
   * @param projectPath 项目路径
   * @param patterns 搜索模式
   * @returns 入口文件路径
   */
  static findEntryFile(
    projectPath: string,
    patterns: string[] = [
      'src/index.ts',
      'src/index.js',
      'src/main.ts',
      'src/main.js',
      'index.ts',
      'index.js'
    ]
  ): string | null {
    for (const pattern of patterns) {
      const filePath = resolve(projectPath, pattern)
      if (existsSync(filePath)) {
        return filePath
      }
    }
    return null
  }

  /**
   * 查找多个入口文件
   * @param projectPath 项目路径
   * @param pattern 搜索模式
   * @returns 入口文件映射
   */
  static findMultipleEntries(
    projectPath: string,
    pattern: string = 'src/*/index.ts'
  ): Record<string, string> {
    const files = glob.sync(pattern, { cwd: projectPath })
    const entries: Record<string, string> = {}

    files.forEach(file => {
      const fullPath = resolve(projectPath, file)
      const dirName = basename(dirname(file))
      entries[dirName] = fullPath
    })

    return entries
  }

  /**
   * 生成输出文件名
   * @param format 输出格式
   * @param entryName 入口名称
   * @param options 选项
   * @returns 文件名
   */
  static generateFileName(
    format: OutputFormat,
    entryName: string = 'index',
    options: {
      minify?: boolean
      hash?: boolean
      extension?: string
    } = {}
  ): string {
    const { minify = false, hash = false, extension } = options
    
    let ext = extension
    if (!ext) {
      switch (format) {
        case 'es':
          ext = '.js'
          break
        case 'cjs':
          ext = '.cjs'
          break
        case 'umd':
        case 'iife':
          ext = '.umd.js'
          break
        case 'amd':
          ext = '.amd.js'
          break
        case 'system':
          ext = '.system.js'
          break
        default:
          ext = '.js'
      }
    }

    let fileName = entryName
    
    if (format !== 'es') {
      fileName += `.${format}`
    }
    
    if (minify) {
      fileName += '.min'
    }
    
    if (hash) {
      fileName += '.[hash]'
    }
    
    return fileName + ext
  }

  /**
   * 格式化构建结果
   * @param result 构建结果
   * @returns 格式化的字符串
   */
  static formatBuildResult(result: BuildResult): string {
    const lines: string[] = []
    
    if (result.success) {
      lines.push(`✅ 构建成功 (${result.duration}ms)`)
      
      if (result.outputs.length > 0) {
        lines.push('\n📦 输出文件:')
        result.outputs.forEach(output => {
          const size = this.formatFileSize(output.size)
          const compressedSize = output.compressedSize 
            ? ` (压缩后: ${this.formatFileSize(output.compressedSize)})` 
            : ''
          lines.push(`  ${output.fileName} - ${size}${compressedSize}`)
        })
      }
    } else {
      lines.push(`❌ 构建失败 (${result.duration}ms)`)
      
      if (result.errors && result.errors.length > 0) {
        lines.push('\n🚫 错误信息:')
        result.errors.forEach(error => {
          lines.push(`  ${error}`)
        })
      }
    }
    
    if (result.warnings && result.warnings.length > 0) {
      lines.push('\n⚠️ 警告信息:')
      result.warnings.forEach(warning => {
        lines.push(`  ${warning}`)
      })
    }
    
    return lines.join('\n')
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化的大小字符串
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 检查依赖是否已安装
   * @param projectPath 项目路径
   * @param dependencies 依赖列表
   * @returns 检查结果
   */
  static checkDependencies(
    projectPath: string,
    dependencies: string[]
  ): { installed: string[]; missing: string[] } {
    const packageJsonPath = resolve(projectPath, 'package.json')
    const installed: string[] = []
    const missing: string[] = []

    if (!existsSync(packageJsonPath)) {
      return { installed, missing: dependencies }
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies
      }

      dependencies.forEach(dep => {
        if (allDeps[dep]) {
          installed.push(dep)
        } else {
          missing.push(dep)
        }
      })
    } catch {
      return { installed, missing: dependencies }
    }

    return { installed, missing }
  }

  /**
   * 创建构建配置文件
   * @param projectPath 项目路径
   * @param config 配置内容
   * @param fileName 文件名
   */
  static createConfigFile(
    projectPath: string,
    config: any,
    fileName: string = 'build.config.js'
  ): void {
    const configPath = resolve(projectPath, fileName)
    const configContent = `export default ${JSON.stringify(config, null, 2)}`
    
    writeFileSync(configPath, configContent, 'utf-8')
  }

  /**
   * 读取构建配置文件
   * @param projectPath 项目路径
   * @param fileName 文件名
   * @returns 配置对象
   */
  static readConfigFile(
    projectPath: string,
    fileName: string = 'build.config.js'
  ): any {
    const configPath = resolve(projectPath, fileName)
    
    if (!existsSync(configPath)) {
      return null
    }

    try {
      // 这里简化处理，实际应该使用动态导入
      const content = readFileSync(configPath, 'utf-8')
      const match = content.match(/export default\s+(.+)/)
      if (match) {
        return JSON.parse(match[1])
      }
    } catch {
      // 忽略解析错误
    }

    return null
  }

  /**
   * 获取推荐的构建配置
   * @param projectPath 项目路径
   * @returns 推荐配置
   */
  static getRecommendedConfig(projectPath: string): any {
    const projectType = this.detectProjectType(projectPath)
    const entryFile = this.findEntryFile(projectPath)

    const baseConfig = {
      entry: entryFile ? relative(projectPath, entryFile) : 'src/index.ts',
      outDir: 'dist',
      sourcemap: true,
      minify: true
    }

    switch (projectType) {
      case 'vue':
        return {
          ...baseConfig,
          server: { port: 3000, open: true },
          css: { extract: true }
        }
      case 'react':
        return {
          ...baseConfig,
          server: { port: 3000, open: true }
        }
      case 'library':
        return {
          ...baseConfig,
          lib: {
            entry: baseConfig.entry,
            formats: ['es', 'cjs']
          }
        }
      case 'node':
        return {
          ...baseConfig,
          target: 'node16',
          external: ['node:*']
        }
      default:
        return baseConfig
    }
  }

  /**
   * 验证构建配置
   * @param config 构建配置
   * @returns 验证结果
   */
  static validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // 检查必需字段
    if (!config.entry && !config.input) {
      errors.push('缺少入口文件配置 (entry 或 input)')
    }

    if (!config.outDir && !config.output) {
      errors.push('缺少输出目录配置 (outDir 或 output)')
    }

    // 检查文件是否存在
    if (config.entry && typeof config.entry === 'string') {
      if (!existsSync(config.entry)) {
        errors.push(`入口文件不存在: ${config.entry}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
