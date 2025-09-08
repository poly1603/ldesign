/**
 * 包管理工具函数
 */

import type { DependencyAnalysis, PackageJsonData } from '../types'
import { join } from 'node:path'
import { FileSystem } from '../filesystem'
import { PackageManager } from './package-manager'

/**
 * 包工具类
 */
export class PackageUtils {
  /**
   * 验证包名
   */
  static isValidPackageName(name: string): boolean {
    // NPM 包名规则
    const nameRegex = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/

    if (!nameRegex.test(name)) {
      return false
    }

    // 长度限制
    if (name.length > 214) {
      return false
    }

    // 不能以点或下划线开头
    if (name.startsWith('.') || name.startsWith('_')) {
      return false
    }

    // 不能包含大写字母
    if (name !== name.toLowerCase()) {
      return false
    }

    return true
  }

  /**
   * 验证版本号
   */
  static isValidVersion(version: string): boolean {
    // 简化的 semver 验证
    const versionRegex
      = /^\d+\.\d+\.\d+(?:-[a-z0-9-]+(?:\.[a-z0-9-]+)*)?(?:\+[a-z0-9-]+(?:\.[a-z0-9-]+)*)?$/i
    return versionRegex.test(version)
  }

  /**
   * 比较版本号
   */
  static compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)

    const maxLength = Math.max(v1Parts.length, v2Parts.length)

    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0

      if (v1Part > v2Part)
        return 1
      if (v1Part < v2Part)
        return -1
    }

    return 0
  }

  /**
   * 获取最新版本
   */
  static getLatestVersion(versions: string[]): string {
    return versions.reduce((latest, current) => {
      return this.compareVersions(current, latest) > 0 ? current : latest
    })
  }

  /**
   * 解析版本范围
   */
  static parseVersionRange(range: string): {
    operator: string
    version: string
    isExact: boolean
  } {
    const exactMatch = range.match(/^(\d+\.\d+\.\d+)$/)
    if (exactMatch && exactMatch[1]) {
      return {
        operator: '=',
        version: exactMatch[1],
        isExact: true,
      }
    }

    const rangeMatch = range.match(/^([~^><=]+)?\s*([^\s~^><=].*)$/)
    if (rangeMatch) {
      return {
        operator: rangeMatch[1] || '=',
        version: rangeMatch[2] || '',
        isExact: false,
      }
    }

    return {
      operator: '=',
      version: range,
      isExact: false,
    }
  }

  /**
   * 创建 package.json
   */
  static createPackageJson(options: {
    name: string
    version?: string
    description?: string
    author?: string
    license?: string
    main?: string
    scripts?: Record<string, string>
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }): PackageJsonData {
    return {
      name: options.name,
      version: options.version || '1.0.0',
      description: options.description || '',
      main: options.main || 'index.js',
      scripts: options.scripts || {
        test: 'echo "Error: no test specified" && exit 1',
      },
      author: options.author || '',
      license: options.license || 'ISC',
      dependencies: options.dependencies || {},
      devDependencies: options.devDependencies || {},
    }
  }

  /**
   * 合并 package.json
   */
  static mergePackageJson(
    base: PackageJsonData,
    updates: Partial<PackageJsonData>,
  ): PackageJsonData {
    const merged = { ...base, ...updates }

    // 合并依赖
    if (updates.dependencies) {
      merged.dependencies = { ...base.dependencies, ...updates.dependencies }
    }

    if (updates.devDependencies) {
      merged.devDependencies = { ...base.devDependencies, ...updates.devDependencies }
    }

    if (updates.peerDependencies) {
      merged.peerDependencies = { ...base.peerDependencies, ...updates.peerDependencies }
    }

    if (updates.scripts) {
      merged.scripts = { ...base.scripts, ...updates.scripts }
    }

    return merged
  }

  /**
   * 分析依赖
   */
  static async analyzeDependencies(packagePath: string): Promise<DependencyAnalysis> {
    const packageManager = PackageManager.create(packagePath)
    const packageJson = await packageManager.readPackageJson()

    const analysis: DependencyAnalysis = {
      total: 0,
      production: 0,
      development: 0,
      peer: 0,
      optional: 0,
      outdated: [],
      duplicates: [],
      unused: [],
      security: [],
    }

    // 统计依赖数量
    analysis.production = Object.keys(packageJson.dependencies || {}).length
    analysis.development = Object.keys(packageJson.devDependencies || {}).length
    analysis.peer = Object.keys(packageJson.peerDependencies || {}).length
    analysis.optional = Object.keys(packageJson.optionalDependencies || {}).length
    analysis.total = analysis.production + analysis.development + analysis.peer + analysis.optional

    // 检查过时的依赖
    try {
      analysis.outdated = await packageManager.getOutdatedPackages()
    }
    catch {
      // 忽略错误
    }

    return analysis
  }

  /**
   * 检查依赖冲突
   */
  static checkDependencyConflicts(packageJson: PackageJsonData): Array<{
    package: string
    conflicts: Array<{
      type: 'version' | 'peer'
      message: string
    }>
  }> {
    const conflicts: Array<{
      package: string
      conflicts: Array<{
        type: 'version' | 'peer'
        message: string
      }>
    }> = []

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }

    const peerDeps = packageJson.peerDependencies || {}

    // 检查 peer dependencies 冲突
    for (const [peerPkg, peerVersion] of Object.entries(peerDeps)) {
      if (allDeps[peerPkg]) {
        const installedVersion = allDeps[peerPkg]
        if (installedVersion !== peerVersion) {
          const existing = conflicts.find(c => c.package === peerPkg)
          if (existing) {
            existing.conflicts.push({
              type: 'peer',
              message: `Peer dependency version ${peerVersion} conflicts with installed version ${installedVersion}`,
            })
          }
          else {
            conflicts.push({
              package: peerPkg,
              conflicts: [
                {
                  type: 'peer',
                  message: `Peer dependency version ${peerVersion} conflicts with installed version ${installedVersion}`,
                },
              ],
            })
          }
        }
      }
    }

    return conflicts
  }

  /**
   * 获取包大小信息
   */
  static async getPackageSize(
    packageName: string,
    version?: string,
  ): Promise<{
    name: string
    version: string
    size: number
    gzipSize: number
    files: number
  } | null> {
    try {
      // 这里可以集成 bundlephobia API 或其他服务
      // 简化实现，返回模拟数据
      return {
        name: packageName,
        version: version || 'latest',
        size: 0,
        gzipSize: 0,
        files: 0,
      }
    }
    catch {
      return null
    }
  }

  /**
   * 检查许可证兼容性
   */
  static checkLicenseCompatibility(licenses: string[]): {
    compatible: boolean
    conflicts: string[]
    warnings: string[]
  } {
    const incompatibleLicenses = ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0']
    const warningLicenses = ['LGPL-2.1', 'LGPL-3.0']

    const conflicts: string[] = []
    const warnings: string[] = []

    for (const license of licenses) {
      if (incompatibleLicenses.includes(license)) {
        conflicts.push(license)
      }
      else if (warningLicenses.includes(license)) {
        warnings.push(license)
      }
    }

    return {
      compatible: conflicts.length === 0,
      conflicts,
      warnings,
    }
  }

  /**
   * 生成依赖树
   */
  static async generateDependencyTree(packagePath: string): Promise<any> {
    const packageManager = PackageManager.create(packagePath)

    try {
      const installed = await packageManager.getInstalledPackages({ depth: 0 })

      const tree: { name: string, version: string, dependencies: Record<string, any> } = {
        name: 'root',
        version: '1.0.0',
        dependencies: {},
      }

      for (const dep of installed) {
        tree.dependencies[dep.name] = {
          version: dep.version,
          resolved: dep.resolved,
          dependencies: dep.dependencies,
        }
      }

      return tree
    }
    catch {
      return null
    }
  }

  /**
   * 清理 node_modules
   */
  static async cleanNodeModules(projectPath: string): Promise<void> {
    const nodeModulesPath = join(projectPath, 'node_modules')

    if (await FileSystem.exists(nodeModulesPath)) {
      await FileSystem.removeDir(nodeModulesPath)
    }
  }

  /**
   * 检查项目健康状态
   */
  static async checkProjectHealth(projectPath: string): Promise<{
    score: number
    issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      fix?: string
    }>
  }> {
    const issues: Array<{
      type: 'error' | 'warning' | 'info'
      message: string
      fix?: string
    }> = []

    let score = 100

    try {
      const packageManager = PackageManager.create(projectPath)
      const packageJson = await packageManager.readPackageJson()

      // 检查必要字段
      if (!packageJson.name) {
        issues.push({
          type: 'error',
          message: 'Package name is missing',
          fix: 'Add a name field to package.json',
        })
        score -= 20
      }

      if (!packageJson.version) {
        issues.push({
          type: 'error',
          message: 'Package version is missing',
          fix: 'Add a version field to package.json',
        })
        score -= 15
      }

      if (!packageJson.description) {
        issues.push({
          type: 'warning',
          message: 'Package description is missing',
          fix: 'Add a description field to package.json',
        })
        score -= 5
      }

      if (!packageJson.license) {
        issues.push({
          type: 'warning',
          message: 'Package license is missing',
          fix: 'Add a license field to package.json',
        })
        score -= 5
      }

      // 检查过时依赖
      const outdated = await packageManager.getOutdatedPackages()
      if (outdated.length > 0) {
        issues.push({
          type: 'warning',
          message: `${outdated.length} outdated dependencies found`,
          fix: 'Run package manager update command',
        })
        score -= Math.min(outdated.length * 2, 20)
      }

      // 检查安全漏洞（简化实现）
      // 实际应该集成 npm audit 或类似工具
    }
    catch (error) {
      issues.push({
        type: 'error',
        message: `Failed to analyze project: ${(error as Error).message}`,
      })
      score = 0
    }

    return {
      score: Math.max(0, score),
      issues,
    }
  }

  /**
   * 获取包的下载统计
   */
  static async getDownloadStats(
    _packageName: string,
    period = 'last-month',
  ): Promise<{
    downloads: number
    period: string
  } | null> {
    try {
      // 这里可以集成 npm-stat API
      // 简化实现，返回模拟数据
      return {
        downloads: 0,
        period,
      }
    }
    catch {
      return null
    }
  }
}
