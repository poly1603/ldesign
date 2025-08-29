/**
 * 构建产物验证器
 * 验证构建完成后的产物是否完整
 */

import type {
  BuildOptions,
  BuildResult,
  OutputFormat,
  ProjectScanResult,
  ValidationResult,
} from '../types'
import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { Logger } from '../utils/logger'

const logger = new Logger('BuildValidator')

export interface ExpectedArtifact {
  path: string
  type: 'js' | 'dts' | 'sourcemap' | 'css'
  format?: OutputFormat
  required: boolean
  description: string
}

export class BuildValidator {
  /**
   * 验证构建产物
   */
  async validate(
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions,
    buildResult: BuildResult,
  ): Promise<ValidationResult> {
    logger.info('开始验证构建产物...')

    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    const missingArtifacts: ExpectedArtifact[] = []
    const foundArtifacts: ExpectedArtifact[] = []

    try {
      // 生成预期的构建产物列表
      const expectedArtifacts = this.generateExpectedArtifacts(scanResult, buildOptions)

      // 验证每个预期的构建产物
      for (const artifact of expectedArtifacts) {
        if (existsSync(artifact.path)) {
          foundArtifacts.push(artifact)

          // 检查文件大小
          const stats = statSync(artifact.path)
          if (stats.size === 0) {
            warnings.push(`文件 ${artifact.path} 存在但为空`)
          }
        } else {
          missingArtifacts.push(artifact)

          if (artifact.required) {
            errors.push(`缺少必需的构建产物: ${artifact.description} (${artifact.path})`)
          } else {
            warnings.push(`缺少可选的构建产物: ${artifact.description} (${artifact.path})`)
          }
        }
      }

      // 验证构建结果中报告的输出文件
      if (buildResult.outputs) {
        for (const output of buildResult.outputs) {
          // RollupBuilder现在提供绝对路径，直接检查即可
          if (!existsSync(output.path)) {
            errors.push(`构建结果中报告的文件不存在: ${output.path}`)
          }
        }
      }

      // 特殊检查：确保至少有一个主要的输出格式
      const hasMainOutput = foundArtifacts.some(artifact =>
        artifact.type === 'js' && (artifact.format === 'esm' || artifact.format === 'cjs')
      )

      if (!hasMainOutput) {
        errors.push('没有找到主要的JavaScript输出文件 (ESM 或 CJS)')
      }

      // 特殊检查：如果启用了dts，确保有类型声明文件
      if (buildOptions.dts !== false) {
        const hasTypeDeclarations = foundArtifacts.some(artifact => artifact.type === 'dts')
        if (!hasTypeDeclarations) {
          errors.push('启用了类型声明生成但没有找到任何 .d.ts 文件')
        }
      }

      const endTime = Date.now()
      const validationTime = endTime - startTime

      const success = errors.length === 0
      const summary = this.generateValidationSummary(foundArtifacts, missingArtifacts, errors, warnings)

      if (success) {
        logger.info(`✅ 构建产物验证通过，耗时 ${validationTime}ms`)
      } else {
        logger.error(`❌ 构建产物验证失败，耗时 ${validationTime}ms`)
      }

      // 只在有错误或警告时显示详细摘要
      if (errors.length > 0 || warnings.length > 0) {
        logger.info(summary)
      }

      return {
        success,
        foundArtifacts,
        missingArtifacts,
        errors,
        warnings,
        validationTime,
        summary,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push(`验证过程中发生错误: ${errorMessage}`)
      logger.error('构建产物验证失败:', error)

      return {
        success: false,
        foundArtifacts,
        missingArtifacts,
        errors,
        warnings,
        validationTime: Date.now() - startTime,
        summary: '验证过程中发生错误',
      }
    }
  }

  /**
   * 生成预期的构建产物列表
   * 根据buildOptions配置智能检测预期产物
   */
  private generateExpectedArtifacts(
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions,
  ): ExpectedArtifact[] {
    const artifacts: ExpectedArtifact[] = []
    const projectRoot = resolve(buildOptions.root || process.cwd())
    const formats = (buildOptions.formats || ['esm', 'cjs']) as OutputFormat[]

    // JavaScript 输出文件
    for (const format of formats) {
      const outputDir = this.getFormatOutputDir(format, projectRoot)
      const mainFile = this.getMainOutputFile(format, outputDir)

      artifacts.push({
        path: mainFile,
        type: 'js',
        format,
        required: true,
        description: `${format.toUpperCase()} JavaScript 文件`,
      })

      // Source map 文件 - 只有在明确启用时才检测
      if (this.shouldGenerateSourcemap(buildOptions)) {
        artifacts.push({
          path: `${mainFile}.map`,
          type: 'sourcemap',
          format,
          required: false,
          description: `${format.toUpperCase()} Source Map 文件`,
        })
      }
    }

    // TypeScript 声明文件 - 只有在明确启用时才检测
    if (this.shouldGenerateDts(buildOptions)) {
      const typesDir = resolve(projectRoot, this.getDtsOutputDir(buildOptions))

      artifacts.push({
        path: resolve(typesDir, 'index.d.ts'),
        type: 'dts',
        required: true,
        description: 'TypeScript 声明文件',
      })
    }

    // CSS 文件 - 只有在项目包含样式文件且未禁用时才检测
    if (this.shouldGenerateCss(scanResult, buildOptions)) {
      // 检查各个格式目录中的CSS文件
      for (const format of formats) {
        const outputDir = this.getFormatOutputDir(format, projectRoot)
        const cssFile = resolve(outputDir, 'index.css')
        artifacts.push({
          path: cssFile,
          type: 'css',
          format,
          required: false,
          description: `${format.toUpperCase()} CSS 样式文件`,
        })
      }
    }

    return artifacts
  }

  /**
   * 判断是否应该生成Source Map文件
   */
  private shouldGenerateSourcemap(buildOptions: BuildOptions): boolean {
    // 如果明确设置为false，则不生成
    if (buildOptions.sourcemap === false) {
      return false
    }
    // 如果设置为true、'inline'、'hidden'或未设置，则生成
    return true
  }

  /**
   * 判断是否应该生成TypeScript声明文件
   */
  private shouldGenerateDts(buildOptions: BuildOptions): boolean {
    // 如果明确设置为false，则不生成
    if (buildOptions.dts === false) {
      return false
    }
    // 如果设置为true、对象配置或未设置，则生成
    return true
  }

  /**
   * 判断是否应该生成CSS文件
   */
  private shouldGenerateCss(scanResult: ProjectScanResult, buildOptions: BuildOptions): boolean {
    // 检查项目是否包含样式文件
    const hasStyles = scanResult.files.some(file =>
      ['css', 'scss', 'less', 'stylus'].includes(file.type as string)
    )

    // 如果没有样式文件，则不生成
    if (!hasStyles) {
      return false
    }

    // 如果明确禁用CSS处理，则不生成
    if (buildOptions.css === false) {
      return false
    }

    return true
  }

  /**
   * 获取TypeScript声明文件输出目录
   */
  private getDtsOutputDir(buildOptions: BuildOptions): string {
    // 如果dts是对象配置且指定了outDir
    if (typeof buildOptions.dts === 'object' && buildOptions.dts.outDir) {
      return buildOptions.dts.outDir
    }

    // 如果指定了dtsDir
    if (buildOptions.dtsDir) {
      return buildOptions.dtsDir
    }

    // 默认使用types目录
    return 'types'
  }

  /**
   * 获取格式输出目录
   */
  private getFormatOutputDir(format: OutputFormat, projectRoot: string): string {
    // 根据实际构建输出结构修正路径
    switch (format) {
      case 'esm':
        return resolve(projectRoot, 'esm')
      case 'cjs':
        return resolve(projectRoot, 'cjs')
      case 'umd':
      case 'iife':
        return resolve(projectRoot, 'dist')
      default:
        return resolve(projectRoot, 'dist')
    }
  }

  /**
   * 获取主输出文件路径
   */
  private getMainOutputFile(format: OutputFormat, outputDir: string): string {
    switch (format) {
      case 'esm':
      case 'cjs':
        return resolve(outputDir, 'index.js')
      case 'umd':
        return resolve(outputDir, 'index.umd.js')
      case 'iife':
        return resolve(outputDir, 'index.iife.js')
      default:
        return resolve(outputDir, 'index.js')
    }
  }

  /**
   * 生成验证摘要
   */
  private generateValidationSummary(
    foundArtifacts: ExpectedArtifact[],
    missingArtifacts: ExpectedArtifact[],
    errors: string[],
    warnings: string[],
  ): string {
    const lines: string[] = []

    lines.push('构建产物验证摘要:')
    lines.push(`  ✓ 找到: ${foundArtifacts.length} | ✗ 缺失: ${missingArtifacts.length} | ❌ 错误: ${errors.length} | ⚠️ 警告: ${warnings.length}`)

    // 去重并分类错误
    const uniqueErrors = [...new Set(errors)]
    const criticalMissing = missingArtifacts.filter(artifact => artifact.required)

    if (uniqueErrors.length > 0 || criticalMissing.length > 0) {
      lines.push('')
      lines.push('关键问题:')

      // 显示必需产物缺失
      criticalMissing.forEach(artifact => {
        lines.push(`  ❌ 缺少必需产物: ${artifact.description}`)
      })

      // 显示其他错误（去重后）
      uniqueErrors.forEach(error => {
        lines.push(`  ❌ ${error}`)
      })
    }

    // 只显示警告（可选产物缺失）
    const optionalMissing = missingArtifacts.filter(artifact => !artifact.required)
    const uniqueWarnings = [...new Set(warnings)]

    if (uniqueWarnings.length > 0 || optionalMissing.length > 0) {
      lines.push('')
      lines.push('警告:')

      // 显示可选产物缺失
      optionalMissing.forEach(artifact => {
        lines.push(`  ⚠️ 缺少可选产物: ${artifact.description}`)
      })

      // 显示其他警告（去重后）
      uniqueWarnings.forEach(warning => {
        lines.push(`  ⚠️ ${warning}`)
      })
    }

    return lines.join('\n')
  }


}
