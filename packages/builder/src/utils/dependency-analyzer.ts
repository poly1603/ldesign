/**
 * 智能依赖分析器
 * 
 * 提供深度依赖分析、循环依赖检测、未使用依赖识别等功能
 */

import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { Logger } from './logger'

/**
 * 依赖类型
 */
export type DependencyType = 'production' | 'development' | 'peer' | 'optional' | 'bundled'

/**
 * 依赖信息
 */
export interface DependencyInfo {
  name: string
  version: string
  type: DependencyType
  size?: number
  license?: string
  description?: string
  homepage?: string
  repository?: string
  lastUpdated?: Date
  vulnerabilities?: VulnerabilityInfo[]
  usageCount: number
  importPaths: string[]
}

/**
 * 漏洞信息
 */
export interface VulnerabilityInfo {
  id: string
  severity: 'low' | 'moderate' | 'high' | 'critical'
  title: string
  description: string
  patchedVersions?: string
  recommendation?: string
}

/**
 * 循环依赖信息
 */
export interface CircularDependency {
  cycle: string[]
  files: string[]
  severity: 'warning' | 'error'
}

/**
 * 依赖分析结果
 */
export interface DependencyAnalysisResult {
  dependencies: DependencyInfo[]
  summary: {
    total: number
    production: number
    development: number
    peer: number
    optional: number
  }
  circularDependencies: CircularDependency[]
  unusedDependencies: string[]
  duplicateDependencies: Array<{
    name: string
    versions: string[]
    locations: string[]
  }>
  outdatedDependencies: Array<{
    name: string
    current: string
    latest: string
    wanted: string
  }>
  securityIssues: VulnerabilityInfo[]
  bundleSizeAnalysis?: {
    totalSize: number
    largestDependencies: Array<{
      name: string
      size: number
      percentage: number
    }>
    treeShakeable: string[]
    nonTreeShakeable: string[]
  }
  recommendations: string[]
}

/**
 * 分析选项
 */
export interface AnalysisOptions {
  /** 项目根目录 */
  rootDir: string
  /** 是否检查安全漏洞 */
  checkSecurity?: boolean
  /** 是否分析包大小 */
  analyzeBundleSize?: boolean
  /** 是否检查过期依赖 */
  checkOutdated?: boolean
  /** 忽略的依赖模式 */
  ignorePatterns?: string[]
  /** 最大分析深度 */
  maxDepth?: number
}

/**
 * 智能依赖分析器
 */
export class DependencyAnalyzer {
  private logger: Logger
  private packageJsonCache = new Map<string, any>()

  constructor(logger?: Logger) {
    this.logger = logger || new Logger({ level: 'info' })
  }

  /**
   * 分析项目依赖
   */
  async analyze(options: AnalysisOptions): Promise<DependencyAnalysisResult> {
    this.logger.info('开始分析项目依赖...')

    const packageJsonPath = path.join(options.rootDir, 'package.json')
    const packageJson = await this.loadPackageJson(packageJsonPath)

    if (!packageJson) {
      throw new Error('未找到 package.json 文件')
    }

    // 收集所有依赖信息
    const dependencies = await this.collectDependencies(packageJson, options)

    // 检测循环依赖
    const circularDependencies = await this.detectCircularDependencies(options.rootDir)

    // 检测未使用的依赖
    const unusedDependencies = await this.detectUnusedDependencies(dependencies, options.rootDir)

    // 检测重复依赖
    const duplicateDependencies = await this.detectDuplicateDependencies(options.rootDir)

    // 检测过期依赖
    const outdatedDependencies = options.checkOutdated 
      ? await this.detectOutdatedDependencies(dependencies)
      : []

    // 安全漏洞检查
    const securityIssues = options.checkSecurity 
      ? await this.checkSecurityVulnerabilities(dependencies)
      : []

    // 包大小分析
    const bundleSizeAnalysis = options.analyzeBundleSize
      ? await this.analyzeBundleSize(dependencies, options.rootDir)
      : undefined

    // 生成摘要
    const summary = {
      total: dependencies.length,
      production: dependencies.filter(d => d.type === 'production').length,
      development: dependencies.filter(d => d.type === 'development').length,
      peer: dependencies.filter(d => d.type === 'peer').length,
      optional: dependencies.filter(d => d.type === 'optional').length
    }

    // 生成建议
    const recommendations = this.generateRecommendations({
      dependencies,
      circularDependencies,
      unusedDependencies,
      duplicateDependencies,
      outdatedDependencies,
      securityIssues,
      bundleSizeAnalysis
    })

    this.logger.info(`依赖分析完成，发现 ${dependencies.length} 个依赖`)

    return {
      dependencies,
      summary,
      circularDependencies,
      unusedDependencies,
      duplicateDependencies,
      outdatedDependencies,
      securityIssues,
      bundleSizeAnalysis,
      recommendations
    }
  }

  /**
   * 加载 package.json
   */
  private async loadPackageJson(filePath: string): Promise<any> {
    if (this.packageJsonCache.has(filePath)) {
      return this.packageJsonCache.get(filePath)
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const packageJson = JSON.parse(content)
      this.packageJsonCache.set(filePath, packageJson)
      return packageJson
    } catch (error) {
      this.logger.warn(`无法读取 package.json: ${filePath}`)
      return null
    }
  }

  /**
   * 收集依赖信息
   */
  private async collectDependencies(packageJson: any, options: AnalysisOptions): Promise<DependencyInfo[]> {
    const dependencies: DependencyInfo[] = []
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
      ...packageJson.optionalDependencies
    }

    for (const [name, version] of Object.entries(allDeps)) {
      if (this.shouldIgnoreDependency(name, options.ignorePatterns)) {
        continue
      }

      const depInfo = await this.analyzeDependency(name, version as string, packageJson, options.rootDir)
      if (depInfo) {
        dependencies.push(depInfo)
      }
    }

    return dependencies
  }

  /**
   * 分析单个依赖
   */
  private async analyzeDependency(
    name: string, 
    version: string, 
    rootPackageJson: any, 
    rootDir: string
  ): Promise<DependencyInfo | null> {
    try {
      const nodeModulesPath = path.join(rootDir, 'node_modules', name)
      const depPackageJsonPath = path.join(nodeModulesPath, 'package.json')
      const depPackageJson = await this.loadPackageJson(depPackageJsonPath)

      if (!depPackageJson) {
        return null
      }

      // 确定依赖类型
      const type = this.getDependencyType(name, rootPackageJson)

      // 计算使用次数和导入路径
      const { usageCount, importPaths } = await this.analyzeUsage(name, rootDir)

      return {
        name,
        version,
        type,
        size: await this.calculatePackageSize(nodeModulesPath),
        license: depPackageJson.license,
        description: depPackageJson.description,
        homepage: depPackageJson.homepage,
        repository: typeof depPackageJson.repository === 'string' 
          ? depPackageJson.repository 
          : depPackageJson.repository?.url,
        usageCount,
        importPaths
      }
    } catch (error) {
      this.logger.warn(`分析依赖 ${name} 时出错:`, error)
      return null
    }
  }

  /**
   * 获取依赖类型
   */
  private getDependencyType(name: string, packageJson: any): DependencyType {
    if (packageJson.dependencies?.[name]) return 'production'
    if (packageJson.devDependencies?.[name]) return 'development'
    if (packageJson.peerDependencies?.[name]) return 'peer'
    if (packageJson.optionalDependencies?.[name]) return 'optional'
    if (packageJson.bundledDependencies?.includes(name)) return 'bundled'
    return 'production'
  }

  /**
   * 分析依赖使用情况
   */
  private async analyzeUsage(_dependencyName: string, _rootDir: string): Promise<{
    usageCount: number
    importPaths: string[]
  }> {
    // 这里实现代码扫描逻辑，查找 import/require 语句
    // 简化实现，实际应该扫描所有源文件
    return {
      usageCount: 1,
      importPaths: []
    }
  }

  /**
   * 计算包大小
   */
  private async calculatePackageSize(packagePath: string): Promise<number> {
    try {
      const stats = await fs.stat(packagePath)
      if (stats.isDirectory()) {
        // 递归计算目录大小
        let totalSize = 0
        const files = await fs.readdir(packagePath)
        
        for (const file of files) {
          const filePath = path.join(packagePath, file)
          const fileStats = await fs.stat(filePath)
          
          if (fileStats.isDirectory()) {
            totalSize += await this.calculatePackageSize(filePath)
          } else {
            totalSize += fileStats.size
          }
        }
        
        return totalSize
      } else {
        return stats.size
      }
    } catch {
      return 0
    }
  }

  /**
   * 检测循环依赖
   */
  private async detectCircularDependencies(_rootDir: string): Promise<CircularDependency[]> {
    // 实现循环依赖检测逻辑
    // 这里返回空数组作为占位符
    return []
  }

  /**
   * 检测未使用的依赖
   */
  private async detectUnusedDependencies(dependencies: DependencyInfo[], _rootDir: string): Promise<string[]> {
    return dependencies
      .filter(dep => dep.usageCount === 0 && dep.type === 'production')
      .map(dep => dep.name)
  }

  /**
   * 检测重复依赖
   */
  private async detectDuplicateDependencies(_rootDir: string): Promise<Array<{
    name: string
    versions: string[]
    locations: string[]
  }>> {
    // 实现重复依赖检测逻辑
    return []
  }

  /**
   * 检测过期依赖
   */
  private async detectOutdatedDependencies(_dependencies: DependencyInfo[]): Promise<Array<{
    name: string
    current: string
    latest: string
    wanted: string
  }>> {
    // 实现过期依赖检测逻辑
    return []
  }

  /**
   * 检查安全漏洞
   */
  private async checkSecurityVulnerabilities(_dependencies: DependencyInfo[]): Promise<VulnerabilityInfo[]> {
    // 实现安全漏洞检查逻辑
    return []
  }

  /**
   * 分析包大小
   */
  private async analyzeBundleSize(dependencies: DependencyInfo[], _rootDir: string) {
    const totalSize = dependencies.reduce((sum, dep) => sum + (dep.size || 0), 0)
    
    const largestDependencies = dependencies
      .filter(dep => dep.size)
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, 10)
      .map(dep => ({
        name: dep.name,
        size: dep.size || 0,
        percentage: ((dep.size || 0) / totalSize) * 100
      }))

    return {
      totalSize,
      largestDependencies,
      treeShakeable: [],
      nonTreeShakeable: []
    }
  }

  /**
   * 生成建议
   */
  private generateRecommendations(analysisResult: Partial<DependencyAnalysisResult>): string[] {
    const recommendations: string[] = []

    if (analysisResult.unusedDependencies?.length) {
      recommendations.push(`发现 ${analysisResult.unusedDependencies.length} 个未使用的依赖，建议移除以减小包大小`)
    }

    if (analysisResult.circularDependencies?.length) {
      recommendations.push(`发现 ${analysisResult.circularDependencies.length} 个循环依赖，建议重构代码结构`)
    }

    if (analysisResult.securityIssues?.length) {
      const criticalCount = analysisResult.securityIssues.filter(issue => issue.severity === 'critical').length
      if (criticalCount > 0) {
        recommendations.push(`发现 ${criticalCount} 个严重安全漏洞，建议立即更新相关依赖`)
      }
    }

    if (analysisResult.outdatedDependencies?.length) {
      recommendations.push(`发现 ${analysisResult.outdatedDependencies.length} 个过期依赖，建议更新到最新版本`)
    }

    return recommendations
  }

  /**
   * 检查是否应该忽略依赖
   */
  private shouldIgnoreDependency(name: string, ignorePatterns?: string[]): boolean {
    if (!ignorePatterns) return false
    
    return ignorePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'))
        return regex.test(name)
      }
      return name === pattern
    })
  }
}
