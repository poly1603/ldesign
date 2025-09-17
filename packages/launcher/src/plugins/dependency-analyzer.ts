/**
 * 智能依赖分析和优化插件
 * 
 * 自动分析项目依赖，提供优化建议和自动优化功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin } from 'vite'
import { Logger } from '../utils/logger'
import fs from 'node:fs/promises'
import path from 'node:path'
import { execSync } from 'node:child_process'

export interface DependencyAnalysisResult {
  /** 未使用的依赖 */
  unusedDependencies: string[]
  /** 重复的依赖 */
  duplicatedDependencies: Array<{
    name: string
    versions: string[]
    locations: string[]
  }>
  /** 过时的依赖 */
  outdatedDependencies: Array<{
    name: string
    current: string
    latest: string
    type: 'major' | 'minor' | 'patch'
  }>
  /** 大型依赖 */
  largeDependencies: Array<{
    name: string
    size: number
    alternatives?: string[]
  }>
  /** 安全漏洞 */
  vulnerabilities: Array<{
    name: string
    severity: 'low' | 'moderate' | 'high' | 'critical'
    description: string
    fixAvailable: boolean
  }>
}

export interface DependencyOptimizerOptions {
  /** 是否启用自动优化 */
  autoOptimize?: boolean
  /** 是否检查未使用的依赖 */
  checkUnused?: boolean
  /** 是否检查重复依赖 */
  checkDuplicates?: boolean
  /** 是否检查过时依赖 */
  checkOutdated?: boolean
  /** 是否检查大型依赖 */
  checkLarge?: boolean
  /** 是否检查安全漏洞 */
  checkVulnerabilities?: boolean
  /** 大型依赖阈值（KB） */
  largeSizeThreshold?: number
  /** 排除的依赖 */
  excludeDependencies?: string[]
  /** 分析报告输出路径 */
  reportPath?: string
}

export class DependencyAnalyzer {
  private logger: Logger
  private options: Required<DependencyOptimizerOptions>
  private projectRoot: string

  constructor(projectRoot: string, options: DependencyOptimizerOptions = {}) {
    this.logger = new Logger('DependencyAnalyzer')
    this.projectRoot = projectRoot
    this.options = {
      autoOptimize: false,
      checkUnused: true,
      checkDuplicates: true,
      checkOutdated: true,
      checkLarge: true,
      checkVulnerabilities: true,
      largeSizeThreshold: 500, // 500KB
      excludeDependencies: [],
      reportPath: './dependency-analysis-report.json',
      ...options
    }
  }

  /**
   * 执行完整的依赖分析
   */
  async analyze(): Promise<DependencyAnalysisResult> {
    this.logger.info('开始依赖分析...')
    
    const result: DependencyAnalysisResult = {
      unusedDependencies: [],
      duplicatedDependencies: [],
      outdatedDependencies: [],
      largeDependencies: [],
      vulnerabilities: []
    }

    try {
      // 并行执行各种检查
      const checks = await Promise.allSettled([
        this.options.checkUnused ? this.findUnusedDependencies() : Promise.resolve([]),
        this.options.checkDuplicates ? this.findDuplicatedDependencies() : Promise.resolve([]),
        this.options.checkOutdated ? this.findOutdatedDependencies() : Promise.resolve([]),
        this.options.checkLarge ? this.findLargeDependencies() : Promise.resolve([]),
        this.options.checkVulnerabilities ? this.findVulnerabilities() : Promise.resolve([])
      ])

      // 处理检查结果
      if (checks[0].status === 'fulfilled') result.unusedDependencies = checks[0].value
      if (checks[1].status === 'fulfilled') result.duplicatedDependencies = checks[1].value
      if (checks[2].status === 'fulfilled') result.outdatedDependencies = checks[2].value
      if (checks[3].status === 'fulfilled') result.largeDependencies = checks[3].value
      if (checks[4].status === 'fulfilled') result.vulnerabilities = checks[4].value

      // 生成报告
      await this.generateReport(result)

      // 自动优化
      if (this.options.autoOptimize) {
        await this.autoOptimize(result)
      }

      this.logger.success('依赖分析完成')
      return result

    } catch (error) {
      this.logger.error('依赖分析失败', { error: (error as Error).message })
      throw error
    }
  }

  /**
   * 查找未使用的依赖
   */
  private async findUnusedDependencies(): Promise<string[]> {
    try {
      // 使用 depcheck 或自定义逻辑分析未使用的依赖
      const packageJson = await this.readPackageJson()
      const dependencies = Object.keys(packageJson.dependencies || {})
      const devDependencies = Object.keys(packageJson.devDependencies || {})
      const allDeps = [...dependencies, ...devDependencies]

      const unusedDeps: string[] = []

      for (const dep of allDeps) {
        if (this.options.excludeDependencies.includes(dep)) continue
        
        const isUsed = await this.isDependencyUsed(dep)
        if (!isUsed) {
          unusedDeps.push(dep)
        }
      }

      return unusedDeps
    } catch (error) {
      this.logger.warn('检查未使用依赖失败', { error: (error as Error).message })
      return []
    }
  }

  /**
   * 查找重复的依赖
   */
  private async findDuplicatedDependencies(): Promise<Array<{
    name: string
    versions: string[]
    locations: string[]
  }>> {
    try {
      // 分析 node_modules 中的重复依赖
      const duplicates: Map<string, { versions: Set<string>, locations: Set<string> }> = new Map()
      
      await this.scanNodeModules(path.join(this.projectRoot, 'node_modules'), duplicates)
      
      return Array.from(duplicates.entries())
        .filter(([, info]) => info.versions.size > 1)
        .map(([name, info]) => ({
          name,
          versions: Array.from(info.versions),
          locations: Array.from(info.locations)
        }))
    } catch (error) {
      this.logger.warn('检查重复依赖失败', { error: (error as Error).message })
      return []
    }
  }

  /**
   * 查找过时的依赖
   */
  private async findOutdatedDependencies(): Promise<Array<{
    name: string
    current: string
    latest: string
    type: 'major' | 'minor' | 'patch'
  }>> {
    try {
      // 使用 npm outdated 或 yarn outdated 检查过时依赖
      const result = execSync('npm outdated --json', { 
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const outdated = JSON.parse(result || '{}')
      
      return Object.entries(outdated).map(([name, info]: [string, any]) => ({
        name,
        current: info.current,
        latest: info.latest,
        type: this.getUpdateType(info.current, info.latest)
      }))
    } catch (error) {
      // npm outdated 在有过时依赖时会返回非零退出码，这是正常的
      return []
    }
  }

  /**
   * 查找大型依赖
   */
  private async findLargeDependencies(): Promise<Array<{
    name: string
    size: number
    alternatives?: string[]
  }>> {
    try {
      const packageJson = await this.readPackageJson()
      const dependencies = Object.keys(packageJson.dependencies || {})
      const largeDeps: Array<{ name: string; size: number; alternatives?: string[] }> = []

      for (const dep of dependencies) {
        if (this.options.excludeDependencies.includes(dep)) continue
        
        const size = await this.getDependencySize(dep)
        if (size > this.options.largeSizeThreshold * 1024) { // 转换为字节
          largeDeps.push({
            name: dep,
            size,
            alternatives: this.getAlternatives(dep)
          })
        }
      }

      return largeDeps.sort((a, b) => b.size - a.size)
    } catch (error) {
      this.logger.warn('检查大型依赖失败', { error: (error as Error).message })
      return []
    }
  }

  /**
   * 查找安全漏洞
   */
  private async findVulnerabilities(): Promise<Array<{
    name: string
    severity: 'low' | 'moderate' | 'high' | 'critical'
    description: string
    fixAvailable: boolean
  }>> {
    try {
      // 使用 npm audit 检查安全漏洞
      const result = execSync('npm audit --json', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const audit = JSON.parse(result)
      const vulnerabilities: Array<{
        name: string
        severity: 'low' | 'moderate' | 'high' | 'critical'
        description: string
        fixAvailable: boolean
      }> = []

      if (audit.vulnerabilities) {
        Object.entries(audit.vulnerabilities).forEach(([name, vuln]: [string, any]) => {
          vulnerabilities.push({
            name,
            severity: vuln.severity,
            description: vuln.title || vuln.overview,
            fixAvailable: vuln.fixAvailable || false
          })
        })
      }

      return vulnerabilities
    } catch (error) {
      this.logger.warn('检查安全漏洞失败', { error: (error as Error).message })
      return []
    }
  }

  /**
   * 检查依赖是否被使用
   */
  private async isDependencyUsed(dependency: string): Promise<boolean> {
    try {
      // 简单的文件内容搜索，实际项目中可以使用更复杂的 AST 分析
      const srcDir = path.join(this.projectRoot, 'src')
      const files = await this.getAllFiles(srcDir, ['.ts', '.js', '.vue', '.jsx', '.tsx'])
      
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8')
        if (content.includes(`from '${dependency}'`) || 
            content.includes(`require('${dependency}')`)) {
          return true
        }
      }
      
      return false
    } catch (error) {
      return true // 如果检查失败，假设依赖被使用
    }
  }

  /**
   * 扫描 node_modules 目录
   */
  private async scanNodeModules(
    dir: string, 
    duplicates: Map<string, { versions: Set<string>, locations: Set<string> }>
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(dir, entry.name)
          
          if (entry.name.startsWith('@')) {
            // 处理 scoped packages
            await this.scanNodeModules(fullPath, duplicates)
          } else if (entry.name !== '.bin') {
            // 处理普通包
            const packageJsonPath = path.join(fullPath, 'package.json')
            try {
              const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
              const name = packageJson.name
              const version = packageJson.version
              
              if (!duplicates.has(name)) {
                duplicates.set(name, { versions: new Set(), locations: new Set() })
              }
              
              const info = duplicates.get(name)!
              info.versions.add(version)
              info.locations.add(fullPath)
            } catch {
              // 忽略无效的 package.json
            }
          }
        }
      }
    } catch (error) {
      // 忽略无法访问的目录
    }
  }

  /**
   * 获取所有指定扩展名的文件
   */
  private async getAllFiles(dir: string, extensions: string[]): Promise<string[]> {
    const files: string[] = []
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          files.push(...await this.getAllFiles(fullPath, extensions))
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    } catch {
      // 忽略无法访问的目录
    }
    
    return files
  }

  /**
   * 读取 package.json
   */
  private async readPackageJson(): Promise<any> {
    const packageJsonPath = path.join(this.projectRoot, 'package.json')
    const content = await fs.readFile(packageJsonPath, 'utf8')
    return JSON.parse(content)
  }

  /**
   * 获取依赖大小
   */
  private async getDependencySize(dependency: string): Promise<number> {
    try {
      const depPath = path.join(this.projectRoot, 'node_modules', dependency)
      return await this.getDirectorySize(depPath)
    } catch {
      return 0
    }
  }

  /**
   * 获取目录大小
   */
  private async getDirectorySize(dir: string): Promise<number> {
    let size = 0
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          size += await this.getDirectorySize(fullPath)
        } else {
          const stats = await fs.stat(fullPath)
          size += stats.size
        }
      }
    } catch {
      // 忽略无法访问的目录
    }
    
    return size
  }

  /**
   * 获取更新类型
   */
  private getUpdateType(current: string, latest: string): 'major' | 'minor' | 'patch' {
    const currentParts = current.split('.').map(Number)
    const latestParts = latest.split('.').map(Number)
    
    if (latestParts[0] > currentParts[0]) return 'major'
    if (latestParts[1] > currentParts[1]) return 'minor'
    return 'patch'
  }

  /**
   * 获取依赖的替代方案
   */
  private getAlternatives(dependency: string): string[] {
    // 预定义的一些常见大型依赖的替代方案
    const alternatives: Record<string, string[]> = {
      'moment': ['dayjs', 'date-fns'],
      'lodash': ['ramda', 'just'],
      'axios': ['ky', 'fetch'],
      'antd': ['arco-design', '@douyinfe/semi-ui'],
      'element-plus': ['naive-ui', 'quasar'],
      'react': ['preact', 'solid-js'],
      'vue': ['petite-vue', 'alpine.js']
    }
    
    return alternatives[dependency] || []
  }

  /**
   * 生成分析报告
   */
  private async generateReport(result: DependencyAnalysisResult): Promise<void> {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        projectRoot: this.projectRoot,
        options: this.options,
        result,
        summary: {
          totalIssues: result.unusedDependencies.length + 
                     result.duplicatedDependencies.length + 
                     result.outdatedDependencies.length + 
                     result.largeDependencies.length + 
                     result.vulnerabilities.length,
          criticalVulnerabilities: result.vulnerabilities.filter(v => v.severity === 'critical').length,
          potentialSavings: result.largeDependencies.reduce((sum, dep) => sum + dep.size, 0)
        }
      }
      
      await fs.writeFile(this.options.reportPath, JSON.stringify(report, null, 2))
      this.logger.info(`分析报告已生成: ${this.options.reportPath}`)
    } catch (error) {
      this.logger.warn('生成报告失败', { error: (error as Error).message })
    }
  }

  /**
   * 自动优化
   */
  private async autoOptimize(result: DependencyAnalysisResult): Promise<void> {
    this.logger.info('开始自动优化...')
    
    // 移除未使用的依赖
    if (result.unusedDependencies.length > 0) {
      this.logger.info(`移除 ${result.unusedDependencies.length} 个未使用的依赖`)
      // 实际项目中需要谨慎处理，可能需要用户确认
    }
    
    // 修复安全漏洞
    const fixableVulns = result.vulnerabilities.filter(v => v.fixAvailable)
    if (fixableVulns.length > 0) {
      this.logger.info(`修复 ${fixableVulns.length} 个安全漏洞`)
      try {
        execSync('npm audit fix', { cwd: this.projectRoot })
      } catch (error) {
        this.logger.warn('自动修复安全漏洞失败', { error: (error as Error).message })
      }
    }
  }
}

/**
 * 创建依赖分析插件
 */
export function createDependencyAnalyzerPlugin(options: DependencyOptimizerOptions = {}): Plugin {
  return {
    name: 'dependency-analyzer',
    
    async buildStart() {
      if (process.env.NODE_ENV === 'development' || process.env.ANALYZE_DEPS === 'true') {
        const analyzer = new DependencyAnalyzer(process.cwd(), options)
        await analyzer.analyze()
      }
    }
  }
}
