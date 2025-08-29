#!/usr/bin/env node

import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs'
import { join, resolve, extname } from 'node:path'
import { logger } from '../../utils/dev-logger'

interface PackageConfig {
  name: string
  main?: string
  module?: string
  types?: string
  exports?: Record<string, any>
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface BuildConfig {
  formats?: string[]
  entry?: string | Record<string, string>
  outDir?: string
  lib?: {
    entry: string | Record<string, string>
    formats: string[]
    fileName?: string | ((format: string) => string)
  }
  rollupOptions?: {
    external?: string[]
    output?: any
  }
}

interface ExpectedArtifact {
  path: string
  description: string
  required: boolean
  type: 'js' | 'css' | 'dts' | 'map' | 'other'
  format?: string
}

interface ValidationResult {
  success: boolean
  foundArtifacts: ExpectedArtifact[]
  missingArtifacts: ExpectedArtifact[]
  unexpectedFiles: string[]
  warnings: string[]
  errors: string[]
}

export class SmartBuildValidator {
  private packageRoot: string
  private packageConfig: PackageConfig
  private buildConfig: BuildConfig | null = null

  constructor(packageRoot: string) {
    this.packageRoot = resolve(packageRoot)
    this.packageConfig = this.loadPackageConfig()
    this.buildConfig = this.loadBuildConfig()
  }

  private loadPackageConfig(): PackageConfig {
    const packageJsonPath = join(this.packageRoot, 'package.json')
    if (!existsSync(packageJsonPath)) {
      throw new Error(`package.json not found in ${this.packageRoot}`)
    }

    try {
      return JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    } catch (error) {
      throw new Error(`Failed to parse package.json: ${error}`)
    }
  }

  private loadBuildConfig(): BuildConfig | null {
    // 尝试加载各种构建配置文件
    const configFiles = [
      'vite.config.ts',
      'vite.config.js',
      'rollup.config.js',
      'rollup.config.ts',
      'tsup.config.ts',
      'tsup.config.js'
    ]

    for (const configFile of configFiles) {
      const configPath = join(this.packageRoot, configFile)
      if (existsSync(configPath)) {
        try {
          // 简单的配置解析（实际项目中可能需要更复杂的解析）
          const content = readFileSync(configPath, 'utf8')
          return this.parseConfigContent(content, configFile)
        } catch (error) {
          logger.warn(`Failed to parse ${configFile}: ${error}`)
        }
      }
    }

    return null
  }

  private parseConfigContent(content: string, filename: string): BuildConfig {
    const config: BuildConfig = {}

    // 解析 formats
    const formatsMatch = content.match(/formats:\s*\[([^\]]+)\]/)
    if (formatsMatch) {
      config.formats = formatsMatch[1]
        .split(',')
        .map(f => f.trim().replace(/['"]/g, ''))
    }

    // 解析 entry
    const entryMatch = content.match(/entry:\s*({[^}]+}|[^,\n]+)/)
    if (entryMatch) {
      const entryStr = entryMatch[1].trim()
      if (entryStr.startsWith('{')) {
        // 多入口
        try {
          config.entry = JSON.parse(entryStr.replace(/'/g, '"'))
        } catch {
          // 解析失败，使用默认
        }
      } else {
        config.entry = entryStr.replace(/['"]/g, '')
      }
    }

    // 解析 lib 配置
    const libMatch = content.match(/lib:\s*{([^}]+)}/s)
    if (libMatch) {
      config.lib = {} as any
      const libContent = libMatch[1]

      const libEntryMatch = libContent.match(/entry:\s*({[^}]+}|[^,\n]+)/)
      if (libEntryMatch) {
        const entryStr = libEntryMatch[1].trim()
        if (entryStr.startsWith('{')) {
          try {
            config.lib.entry = JSON.parse(entryStr.replace(/'/g, '"'))
          } catch {
            config.lib.entry = 'src/index.ts'
          }
        } else {
          config.lib.entry = entryStr.replace(/['"]/g, '')
        }
      }

      const libFormatsMatch = libContent.match(/formats:\s*\[([^\]]+)\]/)
      if (libFormatsMatch) {
        config.lib.formats = libFormatsMatch[1]
          .split(',')
          .map(f => f.trim().replace(/['"]/g, ''))
      }
    }

    return config
  }

  private analyzeSourceStructure(): { hasVue: boolean, hasReact: boolean, hasTypes: boolean, entries: string[] } {
    const srcDir = join(this.packageRoot, 'src')
    const result = {
      hasVue: false,
      hasReact: false,
      hasTypes: false,
      entries: [] as string[]
    }

    if (!existsSync(srcDir)) {
      return result
    }

    const scanDirectory = (dir: string) => {
      try {
        const files = readdirSync(dir)
        for (const file of files) {
          const filePath = join(dir, file)
          const stat = statSync(filePath)

          if (stat.isDirectory()) {
            scanDirectory(filePath)
          } else {
            const ext = extname(file)
            if (['.vue', '.tsx', '.jsx'].includes(ext)) {
              if (ext === '.vue') result.hasVue = true
              if (['.tsx', '.jsx'].includes(ext)) result.hasReact = true
            }
            if (['.ts', '.tsx', '.d.ts'].includes(ext)) {
              result.hasTypes = true
            }
            if (file === 'index.ts' || file === 'index.js') {
              result.entries.push(filePath.replace(this.packageRoot, '').replace(/\\/g, '/'))
            }
          }
        }
      } catch (error) {
        logger.warn(`Failed to scan directory ${dir}: ${error}`)
      }
    }

    scanDirectory(srcDir)
    return result
  }

  private generateExpectedArtifacts(): ExpectedArtifact[] {
    const artifacts: ExpectedArtifact[] = []
    const sourceAnalysis = this.analyzeSourceStructure()

    // 基于构建配置推断产物
    if (this.buildConfig?.lib) {
      const { lib } = this.buildConfig
      const formats = lib.formats || ['es', 'cjs']
      const entries = typeof lib.entry === 'object' ? Object.keys(lib.entry) : ['index']

      for (const format of formats) {
        for (const entry of entries) {
          const fileName = this.getOutputFileName(format, entry)
          artifacts.push({
            path: join(this.packageRoot, fileName),
            description: `${format.toUpperCase()} bundle for ${entry}`,
            required: true,
            type: 'js',
            format
          })

          // Source map
          artifacts.push({
            path: join(this.packageRoot, `${fileName}.map`),
            description: `Source map for ${format.toUpperCase()} bundle`,
            required: false,
            type: 'map',
            format
          })
        }
      }
    } else {
      // 默认产物推断
      const defaultFormats = ['es', 'cjs', 'umd']
      for (const format of defaultFormats) {
        const fileName = this.getOutputFileName(format, 'index')
        artifacts.push({
          path: join(this.packageRoot, fileName),
          description: `${format.toUpperCase()} bundle`,
          required: format !== 'umd', // UMD 通常是可选的
          type: 'js',
          format
        })
      }
    }

    // TypeScript 声明文件
    if (sourceAnalysis.hasTypes) {
      artifacts.push({
        path: join(this.packageRoot, 'types/index.d.ts'),
        description: 'TypeScript declarations',
        required: true,
        type: 'dts'
      })

      // 如果有 Vue 组件，可能需要额外的声明文件
      if (sourceAnalysis.hasVue) {
        artifacts.push({
          path: join(this.packageRoot, 'types/vue/index.d.ts'),
          description: 'Vue component declarations',
          required: false,
          type: 'dts'
        })
      }
    }

    return artifacts
  }

  private getOutputFileName(format: string, entry: string): string {
    const base = entry === 'index' ? 'index' : entry

    switch (format) {
      case 'es':
      case 'esm':
        return `es/${base}.js`
      case 'cjs':
      case 'commonjs':
        return `lib/${base}.js`
      case 'umd':
        return `dist/${base}.js`
      case 'iife':
        return `dist/${base}.iife.js`
      default:
        return `${format}/${base}.js`
    }
  }

  async validate(): Promise<ValidationResult> {
    logger.info(`🔍 开始智能构建产物验证: ${this.packageConfig.name}`)

    const expectedArtifacts = this.generateExpectedArtifacts()
    const foundArtifacts: ExpectedArtifact[] = []
    const missingArtifacts: ExpectedArtifact[] = []
    const warnings: string[] = []
    const errors: string[] = []

    // 验证预期产物
    for (const artifact of expectedArtifacts) {
      if (existsSync(artifact.path)) {
        foundArtifacts.push(artifact)

        // 检查文件大小
        const stats = statSync(artifact.path)
        if (stats.size === 0) {
          warnings.push(`文件 ${artifact.description} 存在但为空`)
        }
      } else {
        missingArtifacts.push(artifact)

        if (artifact.required) {
          errors.push(`缺少必需的构建产物: ${artifact.description}`)
        } else {
          warnings.push(`缺少可选的构建产物: ${artifact.description}`)
        }
      }
    }

    // 检查意外文件
    const unexpectedFiles = this.findUnexpectedFiles(expectedArtifacts)

    const success = errors.length === 0

    // 输出验证结果
    if (success) {
      logger.success(`✅ 构建产物验证通过`)
      logger.info(`📦 找到 ${foundArtifacts.length} 个预期产物`)
    } else {
      logger.error(`❌ 构建产物验证失败`)
      logger.error(`🚫 ${errors.length} 个错误, ${warnings.length} 个警告`)
    }

    if (warnings.length > 0) {
      logger.warn(`⚠️  警告信息:`)
      warnings.forEach(warning => logger.warn(`  - ${warning}`))
    }

    if (errors.length > 0) {
      logger.error(`❌ 错误信息:`)
      errors.forEach(error => logger.error(`  - ${error}`))
    }

    return {
      success,
      foundArtifacts,
      missingArtifacts,
      unexpectedFiles,
      warnings,
      errors
    }
  }

  private findUnexpectedFiles(expectedArtifacts: ExpectedArtifact[]): string[] {
    const expectedPaths = new Set(expectedArtifacts.map(a => a.path))
    const unexpectedFiles: string[] = []

    const buildDirs = ['dist', 'es', 'lib', 'types']

    for (const dir of buildDirs) {
      const dirPath = join(this.packageRoot, dir)
      if (existsSync(dirPath)) {
        this.scanForUnexpectedFiles(dirPath, expectedPaths, unexpectedFiles)
      }
    }

    return unexpectedFiles
  }

  private scanForUnexpectedFiles(dir: string, expectedPaths: Set<string>, unexpectedFiles: string[]) {
    try {
      const files = readdirSync(dir)
      for (const file of files) {
        const filePath = join(dir, file)
        const stat = statSync(filePath)

        if (stat.isDirectory()) {
          this.scanForUnexpectedFiles(filePath, expectedPaths, unexpectedFiles)
        } else {
          if (!expectedPaths.has(filePath)) {
            unexpectedFiles.push(filePath.replace(this.packageRoot, '').replace(/\\/g, '/'))
          }
        }
      }
    } catch (error) {
      logger.warn(`Failed to scan directory ${dir}: ${error}`)
    }
  }
}

// CLI 接口
if (import.meta.url === `file://${process.argv[1]}`) {
  const packageRoot = process.argv[2] || process.cwd()
  const validator = new SmartBuildValidator(packageRoot)

  validator.validate()
    .then(result => {
      process.exit(result.success ? 0 : 1)
    })
    .catch(error => {
      logger.error('验证过程出错:', error)
      process.exit(1)
    })
}

export type { ValidationResult, ExpectedArtifact }
