/**
 * 智能格式检测器
 * 根据项目类型和使用场景自动推荐最佳输出格式组合
 */

import type {
  BuildOptions,
  OutputFormat,
  PackageInfo,
  ProjectScanResult,
  ProjectType,
} from '../types'
import { Logger } from '../utils/logger'

const logger = new Logger('FormatDetector')

export interface FormatRecommendation {
  /** 推荐的输出格式 */
  formats: OutputFormat[]
  /** 推荐理由 */
  reasons: string[]
  /** 优先级 (1-5, 5为最高) */
  priority: number
  /** 是否为最优推荐 */
  isOptimal: boolean
}

export interface DetectionResult {
  /** 主要推荐 */
  primary: FormatRecommendation
  /** 备选推荐 */
  alternatives: FormatRecommendation[]
  /** 检测到的项目特征 */
  projectCharacteristics: {
    type: ProjectType
    isLibrary: boolean
    hasExternal: boolean
    targetEnvironment: ('browser' | 'node' | 'universal')[]
    usageScenarios: string[]
  }
  /** 检测耗时 */
  detectionTime: number
}

export class FormatDetector {
  /**
   * 检测并推荐最佳输出格式
   */
  async detect(
    scanResult: ProjectScanResult,
    buildOptions: Partial<BuildOptions> = {}
  ): Promise<DetectionResult> {
    const startTime = Date.now()
    logger.info('开始智能格式检测...')

    try {
      // 分析项目特征
      const characteristics = this.analyzeProjectCharacteristics(scanResult, buildOptions)

      // 生成格式推荐
      const recommendations = this.generateFormatRecommendations(characteristics, buildOptions)

      // 排序并选择最佳推荐
      const sortedRecommendations = recommendations.sort((a, b) => b.priority - a.priority)
      const primary = sortedRecommendations[0]
      const alternatives = sortedRecommendations.slice(1, 4) // 最多3个备选方案

      // 标记最优推荐
      primary.isOptimal = true

      const detectionTime = Date.now() - startTime

      logger.info(`格式检测完成，耗时 ${detectionTime}ms`)
      logger.info(`推荐格式: ${primary.formats.join(', ')}`)
      logger.info(`推荐理由: ${primary.reasons.join('; ')}`)

      return {
        primary,
        alternatives,
        projectCharacteristics: characteristics,
        detectionTime,
      }
    }
    catch (error) {
      logger.error('格式检测失败:', error)
      throw error
    }
  }

  /**
   * 分析项目特征
   */
  private analyzeProjectCharacteristics(
    scanResult: ProjectScanResult,
    buildOptions: Partial<BuildOptions>
  ): DetectionResult['projectCharacteristics'] {
    const packageInfo = scanResult.packageInfo
    const projectType = scanResult.projectType

    // 判断是否为库项目
    const isLibrary = this.detectLibraryProject(packageInfo, buildOptions)

    // 检测是否有外部依赖
    const hasExternal = this.detectExternalDependencies(packageInfo, buildOptions)

    // 检测目标环境
    const targetEnvironment = this.detectTargetEnvironment(packageInfo, scanResult)

    // 检测使用场景
    const usageScenarios = this.detectUsageScenarios(packageInfo, scanResult)

    return {
      type: projectType,
      isLibrary,
      hasExternal,
      targetEnvironment,
      usageScenarios,
    }
  }

  /**
   * 生成格式推荐
   */
  private generateFormatRecommendations(
    characteristics: DetectionResult['projectCharacteristics'],
    buildOptions: Partial<BuildOptions>
  ): FormatRecommendation[] {
    const recommendations: FormatRecommendation[] = []

    // 如果用户已指定格式，优先考虑用户选择
    if (buildOptions.formats && buildOptions.formats.length > 0) {
      recommendations.push({
        formats: buildOptions.formats,
        reasons: ['用户指定的格式配置'],
        priority: 5,
        isOptimal: false,
      })
    }

    // 基于项目类型的推荐
    switch (characteristics.type) {
      case 'vue':
        recommendations.push(...this.getVueRecommendations(characteristics))
        break
      case 'react':
        recommendations.push(...this.getReactRecommendations(characteristics))
        break
      case 'typescript':
        recommendations.push(...this.getTypeScriptRecommendations(characteristics))
        break
      case 'javascript':
        recommendations.push(...this.getJavaScriptRecommendations(characteristics))
        break
      default:
        recommendations.push(...this.getGenericRecommendations(characteristics))
    }

    return recommendations
  }

  /**
   * Vue 项目格式推荐
   */
  private getVueRecommendations(characteristics: DetectionResult['projectCharacteristics']): FormatRecommendation[] {
    const recommendations: FormatRecommendation[] = []

    if (characteristics.isLibrary) {
      // Vue 组件库
      recommendations.push({
        formats: ['esm', 'cjs', 'umd'],
        reasons: [
          'Vue 组件库标准配置',
          'ESM 支持 tree-shaking',
          'CJS 支持 Node.js 环境',
          'UMD 支持浏览器直接引用',
        ],
        priority: 5,
        isOptimal: false,
      })

      if (characteristics.targetEnvironment.includes('browser')) {
        recommendations.push({
          formats: ['esm', 'iife'],
          reasons: [
            '现代浏览器优化配置',
            'ESM 原生支持',
            'IIFE 兼容性好',
          ],
          priority: 4,
          isOptimal: false,
        })
      }
    } else {
      // Vue 应用
      recommendations.push({
        formats: ['esm'],
        reasons: [
          'Vue 应用通常使用构建工具',
          'ESM 支持最佳的 tree-shaking',
        ],
        priority: 4,
        isOptimal: false,
      })
    }

    return recommendations
  }

  /**
   * React 项目格式推荐
   */
  private getReactRecommendations(characteristics: DetectionResult['projectCharacteristics']): FormatRecommendation[] {
    const recommendations: FormatRecommendation[] = []

    if (characteristics.isLibrary) {
      // React 组件库
      recommendations.push({
        formats: ['esm', 'cjs'],
        reasons: [
          'React 组件库标准配置',
          'ESM 支持现代构建工具',
          'CJS 兼容 Node.js 和旧版构建工具',
        ],
        priority: 5,
        isOptimal: false,
      })

      if (characteristics.usageScenarios.includes('cdn')) {
        recommendations.push({
          formats: ['esm', 'cjs', 'umd'],
          reasons: [
            '支持 CDN 分发',
            'UMD 格式可直接在浏览器中使用',
          ],
          priority: 4,
          isOptimal: false,
        })
      }
    } else {
      // React 应用
      recommendations.push({
        formats: ['esm'],
        reasons: [
          'React 应用通常使用现代构建工具',
          'ESM 是最佳选择',
        ],
        priority: 4,
        isOptimal: false,
      })
    }

    return recommendations
  }

  /**
   * TypeScript 项目格式推荐
   */
  private getTypeScriptRecommendations(characteristics: DetectionResult['projectCharacteristics']): FormatRecommendation[] {
    const recommendations: FormatRecommendation[] = []

    if (characteristics.isLibrary) {
      if (characteristics.targetEnvironment.includes('node')) {
        recommendations.push({
          formats: ['esm', 'cjs'],
          reasons: [
            'TypeScript 库的现代化配置',
            'ESM 支持 tree-shaking',
            'CJS 兼容 Node.js',
          ],
          priority: 5,
          isOptimal: false,
        })
      }

      if (characteristics.targetEnvironment.includes('browser')) {
        recommendations.push({
          formats: ['esm', 'cjs', 'umd'],
          reasons: [
            '全平台兼容配置',
            'UMD 支持浏览器直接使用',
          ],
          priority: 4,
          isOptimal: false,
        })
      }
    } else {
      recommendations.push({
        formats: ['esm'],
        reasons: [
          'TypeScript 应用推荐配置',
          '充分利用现代 JavaScript 特性',
        ],
        priority: 4,
        isOptimal: false,
      })
    }

    return recommendations
  }

  /**
   * JavaScript 项目格式推荐
   */
  private getJavaScriptRecommendations(characteristics: DetectionResult['projectCharacteristics']): FormatRecommendation[] {
    const recommendations: FormatRecommendation[] = []

    if (characteristics.isLibrary) {
      recommendations.push({
        formats: ['esm', 'cjs'],
        reasons: [
          'JavaScript 库标准配置',
          '兼容现代和传统环境',
        ],
        priority: 4,
        isOptimal: false,
      })

      if (characteristics.targetEnvironment.includes('browser')) {
        recommendations.push({
          formats: ['esm', 'cjs', 'umd', 'iife'],
          reasons: [
            '完整浏览器兼容配置',
            'UMD 和 IIFE 支持直接使用',
          ],
          priority: 3,
          isOptimal: false,
        })
      }
    } else {
      if (characteristics.targetEnvironment.includes('node')) {
        recommendations.push({
          formats: ['cjs'],
          reasons: [
            'Node.js 应用传统配置',
            'CJS 兼容性最好',
          ],
          priority: 3,
          isOptimal: false,
        })
      } else {
        recommendations.push({
          formats: ['esm'],
          reasons: [
            '现代 JavaScript 应用配置',
            'ESM 是未来标准',
          ],
          priority: 4,
          isOptimal: false,
        })
      }
    }

    return recommendations
  }

  /**
   * 通用格式推荐
   */
  private getGenericRecommendations(characteristics: DetectionResult['projectCharacteristics']): FormatRecommendation[] {
    const recommendations: FormatRecommendation[] = []

    if (characteristics.isLibrary) {
      recommendations.push({
        formats: ['esm', 'cjs'],
        reasons: [
          '通用库配置',
          '兼容现代和传统环境',
        ],
        priority: 3,
        isOptimal: false,
      })
    } else {
      recommendations.push({
        formats: ['esm'],
        reasons: [
          '现代应用推荐配置',
          'ESM 是标准格式',
        ],
        priority: 3,
        isOptimal: false,
      })
    }

    return recommendations
  }

  /**
   * 检测是否为库项目
   */
  private detectLibraryProject(
    packageInfo: PackageInfo | undefined,
    buildOptions: Partial<BuildOptions>
  ): boolean {
    // 用户明确指定
    if (buildOptions.lib !== undefined) {
      return buildOptions.lib
    }

    if (!packageInfo) {
      return false
    }

    // 通过 package.json 字段判断
    const isLibrary = Boolean(
      packageInfo.main ||
      packageInfo.module ||
      packageInfo.exports ||
      packageInfo.types ||
      (packageInfo.keywords && packageInfo.keywords.some(k => 
        ['library', 'lib', 'component', 'plugin', 'utility', 'framework'].includes(k.toLowerCase())
      ))
    )

    return isLibrary
  }

  /**
   * 检测外部依赖
   */
  private detectExternalDependencies(
    packageInfo: PackageInfo | undefined,
    buildOptions: Partial<BuildOptions>
  ): boolean {
    // 用户指定了 external
    if (buildOptions.external) {
      return Array.isArray(buildOptions.external) ? buildOptions.external.length > 0 : true
    }

    // 有 peerDependencies 说明有外部依赖
    return Boolean(packageInfo?.peerDependencies && Object.keys(packageInfo.peerDependencies).length > 0)
  }

  /**
   * 检测目标环境
   */
  private detectTargetEnvironment(
    packageInfo: PackageInfo | undefined,
    _scanResult: ProjectScanResult
  ): ('browser' | 'node' | 'universal')[] {
    const environments: ('browser' | 'node' | 'universal')[] = []

    // 通过依赖推断
    const allDeps = {
      ...packageInfo?.dependencies,
      ...packageInfo?.devDependencies,
      ...packageInfo?.peerDependencies,
    }

    const browserDeps = ['react', 'vue', 'angular', '@angular/core', 'svelte']
    const nodeDeps = ['express', 'koa', 'fastify', 'next', 'nuxt']

    const hasBrowserDeps = Object.keys(allDeps || {}).some(dep => 
      browserDeps.includes(dep) || dep.startsWith('@types/react') || dep.startsWith('@vue/')
    )

    const hasNodeDeps = Object.keys(allDeps || {}).some(dep => 
      nodeDeps.includes(dep) || dep.startsWith('@types/node')
    )

    if (hasBrowserDeps && hasNodeDeps) {
      environments.push('universal')
    } else if (hasBrowserDeps) {
      environments.push('browser')
    } else if (hasNodeDeps) {
      environments.push('node')
    } else {
      // 默认推断
      environments.push('browser')
    }

    return environments
  }

  /**
   * 检测使用场景
   */
  private detectUsageScenarios(
    packageInfo: PackageInfo | undefined,
    scanResult: ProjectScanResult
  ): string[] {
    const scenarios: string[] = []

    // 通过关键词推断
    const keywords = packageInfo?.keywords || []
    
    if (keywords.some(k => ['cdn', 'unpkg', 'jsdelivr'].includes(k.toLowerCase()))) {
      scenarios.push('cdn')
    }

    if (keywords.some(k => ['component', 'ui', 'widget'].includes(k.toLowerCase()))) {
      scenarios.push('component-library')
    }

    if (keywords.some(k => ['plugin', 'addon', 'extension'].includes(k.toLowerCase()))) {
      scenarios.push('plugin')
    }

    if (keywords.some(k => ['utility', 'utils', 'helper'].includes(k.toLowerCase()))) {
      scenarios.push('utility')
    }

    // 通过项目类型推断
    switch (scanResult.projectType) {
      case 'vue':
        scenarios.push('vue-ecosystem')
        break
      case 'react':
        scenarios.push('react-ecosystem')
        break
    }

    return scenarios
  }

  /**
   * 生成格式推荐报告
   */
  generateReport(result: DetectionResult): string {
    const lines: string[] = []

    lines.push('🎯 智能格式检测报告')
    lines.push('='.repeat(50))
    lines.push('')

    // 项目特征
    lines.push('📋 项目特征:')
    lines.push(`  类型: ${result.projectCharacteristics.type}`)
    lines.push(`  是否为库项目: ${result.projectCharacteristics.isLibrary ? '是' : '否'}`)
    lines.push(`  目标环境: ${result.projectCharacteristics.targetEnvironment.join(', ')}`)
    lines.push(`  使用场景: ${result.projectCharacteristics.usageScenarios.join(', ') || '通用'}`)
    lines.push('')

    // 主要推荐
    lines.push('🏆 推荐配置:')
    lines.push(`  格式: ${result.primary.formats.join(', ')}`)
    lines.push(`  推荐理由:`)
    result.primary.reasons.forEach(reason => {
      lines.push(`    • ${reason}`)
    })
    lines.push('')

    // 备选方案
    if (result.alternatives.length > 0) {
      lines.push('🔄 备选方案:')
      result.alternatives.forEach((alt, index) => {
        lines.push(`  ${index + 1}. ${alt.formats.join(', ')} (优先级: ${alt.priority})`)
        alt.reasons.forEach(reason => {
          lines.push(`     • ${reason}`)
        })
        lines.push('')
      })
    }

    lines.push(`⏱️ 检测耗时: ${result.detectionTime}ms`)

    return lines.join('\n')
  }
}
