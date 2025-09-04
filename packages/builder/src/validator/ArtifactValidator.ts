/**
 * 产物验证器 - 验证打包产物的完整性
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'fs'
import { join, extname, relative } from 'path'
import { glob } from 'glob'

// 验证结果
export interface ValidationResult {
  success: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  stats: ArtifactStats
}

// 验证错误
export interface ValidationError {
  type: 'missing' | 'invalid' | 'empty'
  message: string
  file?: string
}

// 验证警告
export interface ValidationWarning {
  type: 'size' | 'structure' | 'convention'
  message: string
  file?: string
}

// 产物统计信息
export interface ArtifactStats {
  totalFiles: number
  totalSize: number
  filesByType: Record<string, number>
  formats: {
    cjs: boolean
    es: boolean
    umd: boolean
  }
  hasDts: boolean
  hasStyles: boolean
  hasSourceMaps: boolean
}

// 验证配置
export interface ValidatorConfig {
  rootDir: string
  outputDirs: {
    cjs?: string
    es?: string
    umd?: string
  }
  srcDir?: string
  checkDts?: boolean
  checkStyles?: boolean
  checkSourceMaps?: boolean
  maxFileSize?: number // 单个文件最大大小（字节）
  maxTotalSize?: number // 总大小限制（字节）
}

export class ArtifactValidator {
  private config: ValidatorConfig

  constructor(config: ValidatorConfig) {
    this.config = config
  }

  /**
   * 执行验证
   */
  async validate(): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const stats = await this.collectStats()

    // 检查输出目录是否存在
    this.validateOutputDirs(errors)

    // 检查必要文件
    this.validateRequiredFiles(errors, stats)

    // 检查文件完整性
    await this.validateFileIntegrity(errors, warnings)

    // 检查文件大小
    this.validateFileSizes(warnings, stats)

    // 检查代码约定
    this.validateConventions(warnings)

    return {
      success: errors.length === 0,
      errors,
      warnings,
      stats
    }
  }

  /**
   * 收集产物统计信息
   */
  private async collectStats(): Promise<ArtifactStats> {
    const stats: ArtifactStats = {
      totalFiles: 0,
      totalSize: 0,
      filesByType: {},
      formats: {
        cjs: false,
        es: false,
        umd: false
      },
      hasDts: false,
      hasStyles: false,
      hasSourceMaps: false
    }

    // 检查各格式目录
    for (const [format, dir] of Object.entries(this.config.outputDirs)) {
      if (!dir) continue
      
      const fullPath = join(this.config.rootDir, dir)
      if (existsSync(fullPath)) {
        stats.formats[format as keyof typeof stats.formats] = true
        
        // 扫描文件
        const files = glob.sync('**/*', {
          cwd: fullPath,
          nodir: true
        })

        for (const file of files) {
          const filePath = join(fullPath, file)
          const stat = statSync(filePath)
          const ext = extname(file)

          stats.totalFiles++
          stats.totalSize += stat.size

          // 统计文件类型
          stats.filesByType[ext] = (stats.filesByType[ext] || 0) + 1

          // 检查特定文件类型
          if (ext === '.d.ts') stats.hasDts = true
          if (ext === '.css' || ext === '.less') stats.hasStyles = true
          if (ext === '.map') stats.hasSourceMaps = true
        }
      }
    }

    return stats
  }

  /**
   * 验证输出目录
   */
  private validateOutputDirs(errors: ValidationError[]): void {
    for (const [format, dir] of Object.entries(this.config.outputDirs)) {
      if (!dir) continue
      
      const fullPath = join(this.config.rootDir, dir)
      if (!existsSync(fullPath)) {
        errors.push({
          type: 'missing',
          message: `Output directory for ${format} format does not exist: ${dir}`
        })
      } else {
        // 检查目录是否为空
        const files = readdirSync(fullPath)
        if (files.length === 0) {
          errors.push({
            type: 'empty',
            message: `Output directory for ${format} format is empty: ${dir}`
          })
        }
      }
    }
  }

  /**
   * 验证必要文件
   */
  private validateRequiredFiles(errors: ValidationError[], stats: ArtifactStats): void {
    // 检查入口文件
    if (this.config.outputDirs.es) {
      const esIndex = join(this.config.rootDir, this.config.outputDirs.es, 'index.js')
      if (!existsSync(esIndex)) {
        errors.push({
          type: 'missing',
          message: 'Missing ES module entry file',
          file: 'es/index.js'
        })
      }
    }

    if (this.config.outputDirs.cjs) {
      const cjsIndex = join(this.config.rootDir, this.config.outputDirs.cjs, 'index.cjs')
      if (!existsSync(cjsIndex)) {
        // 也检查 .js 扩展名
        const cjsIndexJs = join(this.config.rootDir, this.config.outputDirs.cjs, 'index.js')
        if (!existsSync(cjsIndexJs)) {
          errors.push({
            type: 'missing',
            message: 'Missing CommonJS entry file',
            file: 'lib/index.cjs or lib/index.js'
          })
        }
      }
    }

    if (this.config.outputDirs.umd) {
      const umdIndex = join(this.config.rootDir, this.config.outputDirs.umd, 'index.js')
      if (!existsSync(umdIndex)) {
        errors.push({
          type: 'missing',
          message: 'Missing UMD bundle file',
          file: 'dist/index.js'
        })
      }
    }

    // 检查类型声明文件
    if (this.config.checkDts && !stats.hasDts) {
      errors.push({
        type: 'missing',
        message: 'No TypeScript declaration files found'
      })
    }
  }

  /**
   * 验证文件完整性
   */
  private async validateFileIntegrity(_errors: ValidationError[], warnings: ValidationWarning[]): Promise<void> {
    if (!this.config.srcDir) return

    const srcDir = join(this.config.rootDir, this.config.srcDir)
    if (!existsSync(srcDir)) return

    // 获取源文件列表
    const srcFiles = glob.sync('**/*.{ts,tsx,js,jsx,vue}', {
      cwd: srcDir,
      ignore: ['**/*.test.*', '**/*.spec.*', '**/*.d.ts']
    })

    // 检查每个源文件是否有对应的输出
    for (const srcFile of srcFiles) {
      const baseName = srcFile.replace(/\.(ts|tsx|js|jsx|vue)$/, '')
      
      // 检查 ES 模块
      if (this.config.outputDirs.es) {
        const esFile = join(this.config.rootDir, this.config.outputDirs.es, baseName + '.js')
        if (!existsSync(esFile)) {
          warnings.push({
            type: 'structure',
            message: `Source file has no ES module output`,
            file: srcFile
          })
        }
      }

      // 检查 CommonJS 模块
      if (this.config.outputDirs.cjs) {
        const cjsFile = join(this.config.rootDir, this.config.outputDirs.cjs, baseName + '.cjs')
        const cjsFileJs = join(this.config.rootDir, this.config.outputDirs.cjs, baseName + '.js')
        if (!existsSync(cjsFile) && !existsSync(cjsFileJs)) {
          warnings.push({
            type: 'structure',
            message: `Source file has no CommonJS output`,
            file: srcFile
          })
        }
      }

      // 检查类型声明
      if (this.config.checkDts && srcFile.match(/\.(ts|tsx)$/)) {
        const dtsFile = join(this.config.rootDir, this.config.outputDirs.es || 'es', baseName + '.d.ts')
        if (!existsSync(dtsFile)) {
          warnings.push({
            type: 'structure',
            message: `TypeScript file has no declaration file`,
            file: srcFile
          })
        }
      }
    }

    // 检查样式文件
    if (this.config.checkStyles) {
      const styleFiles = glob.sync('**/*.{less,css,scss}', {
        cwd: srcDir
      })

      for (const styleFile of styleFiles) {
        const baseName = styleFile.replace(/\.(less|scss)$/, '')
        const cssFile = baseName + '.css'

        // 检查各输出目录
        let found = false
        for (const dir of Object.values(this.config.outputDirs)) {
          if (!dir) continue
          const outputCss = join(this.config.rootDir, dir, cssFile)
          if (existsSync(outputCss)) {
            found = true
            break
          }
        }

        if (!found) {
          warnings.push({
            type: 'structure',
            message: `Style file has no CSS output`,
            file: styleFile
          })
        }
      }
    }
  }

  /**
   * 验证文件大小
   */
  private validateFileSizes(warnings: ValidationWarning[], stats: ArtifactStats): void {
    // 检查总大小
    if (this.config.maxTotalSize && stats.totalSize > this.config.maxTotalSize) {
      warnings.push({
        type: 'size',
        message: `Total artifact size (${this.formatSize(stats.totalSize)}) exceeds limit (${this.formatSize(this.config.maxTotalSize)})`
      })
    }

    // 检查单个文件大小
    if (this.config.maxFileSize) {
      for (const dir of Object.values(this.config.outputDirs)) {
        if (!dir) continue
        
        const fullPath = join(this.config.rootDir, dir)
        if (!existsSync(fullPath)) continue

        const files = glob.sync('**/*', {
          cwd: fullPath,
          nodir: true
        })

        for (const file of files) {
          const filePath = join(fullPath, file)
          const stat = statSync(filePath)
          
          if (stat.size > this.config.maxFileSize) {
            warnings.push({
              type: 'size',
              message: `File size (${this.formatSize(stat.size)}) exceeds limit (${this.formatSize(this.config.maxFileSize)})`,
              file: relative(this.config.rootDir, filePath)
            })
          }
        }
      }
    }
  }

  /**
   * 验证代码约定
   */
  private validateConventions(warnings: ValidationWarning[]): void {
    // 检查 package.json 中的字段
    const pkgPath = join(this.config.rootDir, 'package.json')
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      
      // 检查 main 字段（CommonJS）
      if (this.config.outputDirs.cjs && !pkg.main) {
        warnings.push({
          type: 'convention',
          message: 'package.json is missing "main" field for CommonJS entry'
        })
      }

      // 检查 module 字段（ES）
      if (this.config.outputDirs.es && !pkg.module) {
        warnings.push({
          type: 'convention',
          message: 'package.json is missing "module" field for ES module entry'
        })
      }

      // 检查 types 字段
      if (this.config.checkDts && !pkg.types && !pkg.typings) {
        warnings.push({
          type: 'convention',
          message: 'package.json is missing "types" or "typings" field for TypeScript declarations'
        })
      }

      // 检查 files 字段
      if (!pkg.files) {
        warnings.push({
          type: 'convention',
          message: 'package.json is missing "files" field to specify published files'
        })
      }
    }
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  /**
   * 生成验证报告
   */
  generateReport(result: ValidationResult): string {
    const lines: string[] = []
    
    lines.push('=== Artifact Validation Report ===\n')
    
    // 总体状态
    lines.push(`Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`)
    lines.push(`Errors: ${result.errors.length}`)
    lines.push(`Warnings: ${result.warnings.length}\n`)
    
    // 统计信息
    lines.push('📊 Statistics:')
    lines.push(`  Total Files: ${result.stats.totalFiles}`)
    lines.push(`  Total Size: ${this.formatSize(result.stats.totalSize)}`)
    lines.push(`  Formats: ${Object.entries(result.stats.formats).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ')}`)
    lines.push(`  Has TypeScript Declarations: ${result.stats.hasDts ? 'Yes' : 'No'}`)
    lines.push(`  Has Styles: ${result.stats.hasStyles ? 'Yes' : 'No'}`)
    lines.push(`  Has Source Maps: ${result.stats.hasSourceMaps ? 'Yes' : 'No'}\n`)
    
    // 文件类型分布
    if (Object.keys(result.stats.filesByType).length > 0) {
      lines.push('📁 File Types:')
      for (const [ext, count] of Object.entries(result.stats.filesByType)) {
        lines.push(`  ${ext}: ${count} files`)
      }
      lines.push('')
    }
    
    // 错误列表
    if (result.errors.length > 0) {
      lines.push('❌ Errors:')
      result.errors.forEach((error, i) => {
        lines.push(`  ${i + 1}. [${error.type.toUpperCase()}] ${error.message}`)
        if (error.file) {
          lines.push(`     File: ${error.file}`)
        }
      })
      lines.push('')
    }
    
    // 警告列表
    if (result.warnings.length > 0) {
      lines.push('⚠️  Warnings:')
      result.warnings.forEach((warning, i) => {
        lines.push(`  ${i + 1}. [${warning.type.toUpperCase()}] ${warning.message}`)
        if (warning.file) {
          lines.push(`     File: ${warning.file}`)
        }
      })
      lines.push('')
    }
    
    lines.push('=== End of Report ===')
    
    return lines.join('\n')
  }
}
