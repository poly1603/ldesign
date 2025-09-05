/**
 * 依赖分析器
 *
 * 用于分析项目依赖，检查依赖的安全性、版本兼容性、大小等信息
 * 提供依赖树分析、依赖更新检查、安全漏洞扫描等功能
 *
 * @author LDesign Team
 * @version 1.0.0
 */

import type { DependencyInfo } from './types'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 依赖分析结果接口
 * 包含依赖的详细分析信息
 */
export interface DependencyAnalysisResult {
  /** 依赖信息 */
  dependencies: DependencyInfo[]
  /** 过时的依赖 */
  outdatedDependencies: OutdatedDependency[]
  /** 安全漏洞 */
  vulnerabilities: SecurityVulnerability[]
  /** 依赖树 */
  dependencyTree: DependencyNode[]
  /** 依赖大小统计 */
  sizeAnalysis: DependencySizeAnalysis
  /** 许可证信息 */
  licenseInfo: LicenseInfo[]
  /** 分析时间戳 */
  analyzedAt: Date
}

/**
 * 过时依赖接口
 * 描述需要更新的依赖信息
 */
export interface OutdatedDependency {
  /** 依赖名称 */
  name: string
  /** 当前版本 */
  currentVersion: string
  /** 想要版本 */
  wantedVersion: string
  /** 最新版本 */
  latestVersion: string
  /** 依赖类型 */
  type: 'dependency' | 'devDependency'
  /** 更新类型 */
  updateType: 'major' | 'minor' | 'patch'
}

/**
 * 安全漏洞接口
 * 描述依赖中的安全问题
 */
export interface SecurityVulnerability {
  /** 漏洞ID */
  id: string
  /** 影响的依赖名称 */
  dependencyName: string
  /** 严重级别 */
  severity: 'low' | 'moderate' | 'high' | 'critical'
  /** 漏洞标题 */
  title: string
  /** 漏洞描述 */
  description: string
  /** 影响的版本范围 */
  vulnerableVersions: string
  /** 修复版本 */
  patchedVersions?: string
  /** 参考链接 */
  references: string[]
}

/**
 * 依赖树节点接口
 * 表示依赖关系树的节点
 */
export interface DependencyNode {
  /** 依赖名称 */
  name: string
  /** 依赖版本 */
  version: string
  /** 子依赖 */
  dependencies: DependencyNode[]
  /** 是否为开发依赖 */
  isDevDependency: boolean
  /** 依赖深度 */
  depth: number
}

/**
 * 依赖大小分析接口
 * 分析依赖的大小统计信息
 */
export interface DependencySizeAnalysis {
  /** 总大小（字节） */
  totalSize: number
  /** 生产依赖大小 */
  productionSize: number
  /** 开发依赖大小 */
  developmentSize: number
  /** 最大的依赖 */
  largestDependencies: Array<{
    name: string
    size: number
    percentage: number
  }>
  /** 重复依赖 */
  duplicatedDependencies: Array<{
    name: string
    versions: string[]
    totalSize: number
  }>
}

/**
 * 许可证信息接口
 * 描述依赖的许可证信息
 */
export interface LicenseInfo {
  /** 依赖名称 */
  name: string
  /** 许可证类型 */
  license: string
  /** 许可证文件路径 */
  licenseFile?: string
  /** 是否兼容 */
  isCompatible: boolean
  /** 风险级别 */
  riskLevel: 'low' | 'medium' | 'high'
}

/**
 * 依赖分析选项接口
 * 配置依赖分析的选项
 */
export interface DependencyAnalysisOptions {
  /** 项目根目录 */
  projectRoot?: string
  /** 是否包含开发依赖 */
  includeDev?: boolean
  /** 是否检查安全漏洞 */
  checkVulnerabilities?: boolean
  /** 是否分析依赖大小 */
  analyzeSizes?: boolean
  /** 是否检查许可证 */
  checkLicenses?: boolean
  /** 是否检查过时依赖 */
  checkOutdated?: boolean
  /** 网络超时时间（毫秒） */
  timeout?: number
}

/**
 * 依赖分析器类
 * 提供项目依赖的全面分析功能
 */
export class DependencyAnalyzer {
  /** 项目根目录 */
  private projectRoot: string
  /** 分析选项 */
  private options: Required<DependencyAnalysisOptions>

  /**
   * 构造函数
   * @param options 分析选项
   */
  constructor(options: DependencyAnalysisOptions = {}) {
    this.projectRoot = options.projectRoot || process.cwd()
    this.options = {
      projectRoot: this.projectRoot,
      includeDev: options.includeDev ?? true,
      checkVulnerabilities: options.checkVulnerabilities ?? true,
      analyzeSizes: options.analyzeSizes ?? true,
      checkLicenses: options.checkLicenses ?? true,
      checkOutdated: options.checkOutdated ?? true,
      timeout: options.timeout ?? 30000,
    }
  }

  /**
   * 分析项目依赖
   * 主入口方法，执行完整的依赖分析
   *
   * @returns 依赖分析结果
   */
  async analyzeDependencies(): Promise<DependencyAnalysisResult> {
    const packageJson = this.getPackageJson()
    if (!packageJson) {
      throw new Error('未找到 package.json 文件')
    }

    // 基础依赖信息
    const dependencies = this.extractDependencyInfo(packageJson)

    // 并行执行各种分析
    const [outdatedDependencies, vulnerabilities, dependencyTree, sizeAnalysis, licenseInfo]
      = await Promise.allSettled([
        this.options.checkOutdated ? this.checkOutdatedDependencies() : Promise.resolve([]),
        this.options.checkVulnerabilities ? this.checkVulnerabilities() : Promise.resolve([]),
        this.buildDependencyTree(packageJson),
        this.options.analyzeSizes
          ? this.analyzeDependencySizes()
          : Promise.resolve(this.createEmptySizeAnalysis()),
        this.options.checkLicenses ? this.checkLicenses() : Promise.resolve([]),
      ])

    return {
      dependencies,
      outdatedDependencies: this.getSettledValue(outdatedDependencies, []),
      vulnerabilities: this.getSettledValue(vulnerabilities, []),
      dependencyTree: this.getSettledValue(dependencyTree, []),
      sizeAnalysis: this.getSettledValue(sizeAnalysis, this.createEmptySizeAnalysis()),
      licenseInfo: this.getSettledValue(licenseInfo, []),
      analyzedAt: new Date(),
    }
  }

  /**
   * 获取 Promise.allSettled 的值
   * 如果 Promise 被拒绝，返回默认值
   *
   * @param result Promise 结果
   * @param defaultValue 默认值
   * @returns 实际值或默认值
   */
  private getSettledValue<T>(result: PromiseSettledResult<T>, defaultValue: T): T {
    if (result.status === 'fulfilled') {
      return result.value
    }
    console.warn('依赖分析子任务失败:', result.reason)
    return defaultValue
  }

  /**
   * 读取 package.json 文件
   *
   * @returns package.json 内容或 null
   */
  private getPackageJson(): any {
    const packageJsonPath = resolve(this.projectRoot, 'package.json')
    if (!existsSync(packageJsonPath)) {
      return null
    }

    try {
      const content = readFileSync(packageJsonPath, 'utf-8')
      return JSON.parse(content)
    }
    catch (error) {
      console.warn('无法解析 package.json:', error)
      return null
    }
  }

  /**
   * 提取依赖信息
   * 从 package.json 中提取依赖的基础信息
   *
   * @param packageJson package.json 内容
   * @returns 依赖信息列表
   */
  private extractDependencyInfo(packageJson: any): DependencyInfo[] {
    const dependencies: DependencyInfo[] = []

    // 生产依赖
    for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
      dependencies.push({
        name,
        version: version as string,
        type: 'dependency',
        isFrameworkCore: this.isFrameworkCore(name),
      })
    }

    // 开发依赖
    if (this.options.includeDev) {
      for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
        dependencies.push({
          name,
          version: version as string,
          type: 'devDependency',
          isFrameworkCore: this.isFrameworkCore(name),
        })
      }
    }

    return dependencies
  }

  /**
   * 判断是否为框架核心依赖
   *
   * @param dependencyName 依赖名称
   * @returns 是否为框架核心依赖
   */
  private isFrameworkCore(dependencyName: string): boolean {
    const coreFrameworks = [
      'vue',
      'react',
      '@angular/core',
      'svelte',
      'next',
      'nuxt',
      '@nuxt/kit',
      '@sveltejs/kit',
      'express',
      'koa',
      'fastify',
      '@nestjs/core',
    ]
    return coreFrameworks.includes(dependencyName)
  }

  /**
   * 检查过时的依赖
   * 使用包管理器检查可以更新的依赖
   *
   * @returns 过时依赖列表
   */
  private async checkOutdatedDependencies(): Promise<OutdatedDependency[]> {
    const packageManager = this.detectPackageManager()

    try {
      const outdatedData = await this.runPackageManagerCommand(packageManager, [
        'outdated',
        '--json',
      ])
      return this.parseOutdatedData(outdatedData, packageManager)
    }
    catch (error) {
      console.warn('检查过时依赖失败:', error)
      return []
    }
  }

  /**
   * 检查安全漏洞
   * 使用 npm audit 或相应工具检查安全问题
   *
   * @returns 安全漏洞列表
   */
  private async checkVulnerabilities(): Promise<SecurityVulnerability[]> {
    const packageManager = this.detectPackageManager()

    try {
      const auditData = await this.runPackageManagerCommand(packageManager, ['audit', '--json'])
      return this.parseVulnerabilityData(auditData, packageManager)
    }
    catch (error) {
      console.warn('安全漏洞检查失败:', error)
      return []
    }
  }

  /**
   * 构建依赖树
   * 分析依赖的层级关系
   *
   * @param packageJson package.json 内容
   * @returns 依赖树节点列表
   */
  private async buildDependencyTree(packageJson: any): Promise<DependencyNode[]> {
    const packageManager = this.detectPackageManager()

    try {
      const treeData = await this.runPackageManagerCommand(packageManager, [
        'list',
        '--json',
        '--all',
      ])
      return this.parseDependencyTree(treeData, packageManager)
    }
    catch (error) {
      console.warn('构建依赖树失败:', error)
      // 返回简化的依赖树
      return this.buildSimpleDependencyTree(packageJson)
    }
  }

  /**
   * 分析依赖大小
   * 计算依赖包的大小统计信息
   *
   * @returns 依赖大小分析结果
   */
  private async analyzeDependencySizes(): Promise<DependencySizeAnalysis> {
    try {
      // 尝试使用 bundlephobia API 或本地分析
      return await this.analyzeSizesWithBundlephobia()
    }
    catch (error) {
      console.warn('依赖大小分析失败:', error)
      return this.createEmptySizeAnalysis()
    }
  }

  /**
   * 检查许可证信息
   * 分析依赖的许可证兼容性
   *
   * @returns 许可证信息列表
   */
  private async checkLicenses(): Promise<LicenseInfo[]> {
    try {
      // 这里可以使用 license-checker 或类似工具
      return await this.analyzeLicenses()
    }
    catch (error) {
      console.warn('许可证检查失败:', error)
      return []
    }
  }

  /**
   * 检测包管理器类型
   *
   * @returns 包管理器类型字符串
   */
  private detectPackageManager(): string {
    if (existsSync(resolve(this.projectRoot, 'pnpm-lock.yaml'))) {
      return 'pnpm'
    }
    if (existsSync(resolve(this.projectRoot, 'yarn.lock'))) {
      return 'yarn'
    }
    if (existsSync(resolve(this.projectRoot, 'bun.lockb'))) {
      return 'bun'
    }
    return 'npm'
  }

  /**
   * 运行包管理器命令
   *
   * @param packageManager 包管理器名称
   * @param args 命令参数
   * @returns 命令输出
   */
  private async runPackageManagerCommand(packageManager: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(packageManager, args, {
        cwd: this.projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      const timeout = setTimeout(() => {
        child.kill()
        reject(new Error('命令执行超时'))
      }, this.options.timeout)

      child.on('close', (code) => {
        clearTimeout(timeout)
        if (code === 0) {
          resolve(stdout)
        }
        else {
          reject(new Error(`命令执行失败: ${stderr || stdout}`))
        }
      })

      child.on('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
    })
  }

  /**
   * 解析过时依赖数据
   *
   * @param data 命令输出数据
   * @param packageManager 包管理器类型
   * @returns 过时依赖列表
   */
  private parseOutdatedData(data: string, packageManager: string): OutdatedDependency[] {
    try {
      if (packageManager === 'npm') {
        const parsed = JSON.parse(data)
        return Object.entries(parsed).map(([name, info]: [string, any]) => ({
          name,
          currentVersion: info.current,
          wantedVersion: info.wanted,
          latestVersion: info.latest,
          type: info.type || 'dependency',
          updateType: this.determineUpdateType(info.current, info.latest),
        }))
      }
      // 处理其他包管理器的输出格式
      return []
    }
    catch {
      return []
    }
  }

  /**
   * 解析安全漏洞数据
   *
   * @param data 命令输出数据
   * @param packageManager 包管理器类型
   * @returns 安全漏洞列表
   */
  private parseVulnerabilityData(data: string, packageManager: string): SecurityVulnerability[] {
    try {
      if (packageManager === 'npm') {
        const parsed = JSON.parse(data)
        const vulnerabilities: SecurityVulnerability[] = []

        if (parsed.advisories) {
          for (const [id, advisory] of Object.entries(parsed.advisories)) {
            vulnerabilities.push({
              id,
              dependencyName: (advisory as any).module_name,
              severity: (advisory as any).severity,
              title: (advisory as any).title,
              description: (advisory as any).overview,
              vulnerableVersions: (advisory as any).vulnerable_versions,
              patchedVersions: (advisory as any).patched_versions,
              references: (advisory as any).references ? [(advisory as any).references] : [],
            })
          }
        }

        return vulnerabilities
      }
      return []
    }
    catch {
      return []
    }
  }

  /**
   * 解析依赖树数据
   *
   * @param data 命令输出数据
   * @param packageManager 包管理器类型
   * @returns 依赖树节点列表
   */
  private parseDependencyTree(data: string, packageManager: string): DependencyNode[] {
    try {
      if (packageManager === 'npm') {
        const parsed = JSON.parse(data)
        return this.convertNpmTreeToNodes(parsed.dependencies || {}, false, 0)
      }
      return []
    }
    catch {
      return []
    }
  }

  /**
   * 转换 npm 依赖树为节点格式
   *
   * @param dependencies 依赖对象
   * @param isDevDependency 是否为开发依赖
   * @param depth 深度
   * @returns 依赖节点列表
   */
  private convertNpmTreeToNodes(
    dependencies: Record<string, any>,
    isDevDependency: boolean,
    depth: number,
  ): DependencyNode[] {
    return Object.entries(dependencies).map(([name, info]) => ({
      name,
      version: info.version || 'unknown',
      dependencies: this.convertNpmTreeToNodes(info.dependencies || {}, isDevDependency, depth + 1),
      isDevDependency,
      depth,
    }))
  }

  /**
   * 构建简化的依赖树
   * 当无法获取完整依赖树时的备用方案
   *
   * @param packageJson package.json 内容
   * @returns 简化的依赖树
   */
  private buildSimpleDependencyTree(packageJson: any): DependencyNode[] {
    const nodes: DependencyNode[] = []

    // 生产依赖
    for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
      nodes.push({
        name,
        version: version as string,
        dependencies: [],
        isDevDependency: false,
        depth: 0,
      })
    }

    // 开发依赖
    if (this.options.includeDev) {
      for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
        nodes.push({
          name,
          version: version as string,
          dependencies: [],
          isDevDependency: true,
          depth: 0,
        })
      }
    }

    return nodes
  }

  /**
   * 使用 Bundlephobia API 分析依赖大小
   *
   * @returns 依赖大小分析结果
   */
  private async analyzeSizesWithBundlephobia(): Promise<DependencySizeAnalysis> {
    // 这里可以实现对 bundlephobia.com API 的调用
    // 或使用本地工具分析
    return this.createEmptySizeAnalysis()
  }

  /**
   * 分析许可证信息
   *
   * @returns 许可证信息列表
   */
  private async analyzeLicenses(): Promise<LicenseInfo[]> {
    // 这里可以实现许可证分析逻辑
    // 可以使用 license-checker 等工具
    return []
  }

  /**
   * 创建空的大小分析结果
   *
   * @returns 空的大小分析结果
   */
  private createEmptySizeAnalysis(): DependencySizeAnalysis {
    return {
      totalSize: 0,
      productionSize: 0,
      developmentSize: 0,
      largestDependencies: [],
      duplicatedDependencies: [],
    }
  }

  /**
   * 确定更新类型
   * 根据版本变化确定是主版本、次版本还是补丁更新
   *
   * @param currentVersion 当前版本
   * @param latestVersion 最新版本
   * @returns 更新类型
   */
  private determineUpdateType(
    currentVersion: string,
    latestVersion: string,
  ): 'major' | 'minor' | 'patch' {
    const current = this.parseVersion(currentVersion)
    const latest = this.parseVersion(latestVersion)

    if (latest.major > current.major)
      return 'major'
    if (latest.minor > current.minor)
      return 'minor'
    return 'patch'
  }

  /**
   * 解析版本号
   *
   * @param version 版本字符串
   * @returns 版本对象
   */
  private parseVersion(version: string): { major: number, minor: number, patch: number } {
    const cleaned = version.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.').map(Number)
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    }
  }

  /**
   * 生成依赖报告
   * 创建可读的依赖分析报告
   *
   * @param result 依赖分析结果
   * @returns 报告字符串
   */
  generateReport(result: DependencyAnalysisResult): string {
    const report: string[] = []

    report.push('# 依赖分析报告')
    report.push(`生成时间: ${result.analyzedAt.toLocaleString()}`)
    report.push('')

    // 基础统计
    report.push('## 基础统计')
    report.push(`总依赖数: ${result.dependencies.length}`)
    report.push(`生产依赖: ${result.dependencies.filter(d => d.type === 'dependency').length}`)
    report.push(`开发依赖: ${result.dependencies.filter(d => d.type === 'devDependency').length}`)
    report.push('')

    // 过时依赖
    if (result.outdatedDependencies.length > 0) {
      report.push('## 过时依赖')
      for (const dep of result.outdatedDependencies) {
        report.push(
          `- ${dep.name}: ${dep.currentVersion} → ${dep.latestVersion} (${dep.updateType})`,
        )
      }
      report.push('')
    }

    // 安全漏洞
    if (result.vulnerabilities.length > 0) {
      report.push('## 安全漏洞')
      for (const vuln of result.vulnerabilities) {
        report.push(`- ${vuln.dependencyName}: ${vuln.title} (${vuln.severity})`)
      }
      report.push('')
    }

    // 大小分析
    if (result.sizeAnalysis.totalSize > 0) {
      report.push('## 大小分析')
      report.push(`总大小: ${this.formatBytes(result.sizeAnalysis.totalSize)}`)
      report.push(`生产依赖: ${this.formatBytes(result.sizeAnalysis.productionSize)}`)
      report.push(`开发依赖: ${this.formatBytes(result.sizeAnalysis.developmentSize)}`)

      if (result.sizeAnalysis.largestDependencies.length > 0) {
        report.push('### 最大的依赖:')
        for (const dep of result.sizeAnalysis.largestDependencies.slice(0, 5)) {
          report.push(
            `- ${dep.name}: ${this.formatBytes(dep.size)} (${dep.percentage.toFixed(1)}%)`,
          )
        }
      }
    }

    return report.join('\n')
  }

  /**
   * 格式化字节数
   *
   * @param bytes 字节数
   * @returns 格式化的字符串
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }
}

/**
 * 创建依赖分析器实例
 * 工厂函数，用于创建依赖分析器
 *
 * @param options 分析选项
 * @returns 依赖分析器实例
 */
export function createDependencyAnalyzer(options?: DependencyAnalysisOptions): DependencyAnalyzer {
  return new DependencyAnalyzer(options)
}

/**
 * 快速分析项目依赖
 * 便捷函数，直接返回依赖分析结果
 *
 * @param projectPath 项目路径，默认为当前目录
 * @returns 依赖分析结果
 */
export async function analyzeDependencies(projectPath?: string): Promise<DependencyAnalysisResult> {
  const analyzer = new DependencyAnalyzer({ projectRoot: projectPath })
  return analyzer.analyzeDependencies()
}
