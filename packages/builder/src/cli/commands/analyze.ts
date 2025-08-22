/**
 * 分析命令处理器
 * 分析项目依赖关系和构建信息
 */

import type { DependencyGraph, FileInfo, ProjectScanResult } from '../../types'
import path from 'node:path'
import chalk from 'chalk'
import ora from 'ora'
import { PluginConfigurator } from '../../core/plugin-configurator'
import { ProjectScanner } from '../../core/project-scanner'
import { Logger } from '../../utils/logger'

const logger = new Logger('Analyze')

export class AnalyzeCommand {
  /**
   * 执行分析命令
   */
  async execute(inputOrOptions: any, maybeOptions?: any): Promise<void> {
    const spinner = ora('正在分析项目...').start()

    try {
      const options = (typeof inputOrOptions === 'object' && !maybeOptions)
        ? inputOrOptions
        : (maybeOptions || {})
      const root = options.root || process.cwd()

      // 扫描项目
      spinner.text = '正在扫描项目结构...'
      const scanner = new ProjectScanner()
      const scanResult = await scanner.scan(root)

      // 分析依赖关系
      spinner.text = '正在分析依赖关系...'
      const dependencyGraph = await this.analyzeDependencies(scanResult)

      // 分析插件配置
      spinner.text = '正在分析插件配置...'
      const configurator = new PluginConfigurator()
      const pluginConfig = await configurator.configure(scanResult)

      spinner.stop()

      // 显示分析结果
      this.showAnalysisResult(scanResult, dependencyGraph, { plugins: pluginConfig }, options)
    }
    catch (error) {
      spinner.stop()
      logger.error('分析失败:', error)
      process.exit(1)
    }
  }

  /**
   * 分析依赖关系
   */
  private async analyzeDependencies(scanResult: ProjectScanResult): Promise<DependencyGraph> {
    const dependencyGraph: DependencyGraph = {
      nodes: new Map(),
      edges: [],
    }

    // 分析每个文件的依赖
    for (const file of scanResult.files) {
      const dependencies = await this.extractDependencies(file)
      dependencyGraph.nodes.set(file.path, {
        id: file.path,
        file,
        inDegree: 0,
        outDegree: dependencies.internal.length,
      })

      // 记录内部依赖关系
      dependencies.internal.forEach((dep) => {
        dependencyGraph.edges.push({
          from: file.path,
          to: dep,
          type: 'import',
        })
      })
    }

    // 计算入度
    for (const edge of dependencyGraph.edges) {
      const targetNode = dependencyGraph.nodes.get(edge.to)
      if (targetNode) {
        targetNode.inDegree++
      }
    }

    return dependencyGraph
  }

  /**
   * 提取文件依赖
   */
  private async extractDependencies(file: FileInfo): Promise<{
    internal: string[]
    external: string[]
  }> {
    const fs = await import('fs-extra')
    const internal: string[] = []
    const external: string[] = []

    try {
      const content = await fs.readFile(file.path, 'utf-8')

      // 匹配 import 语句
      const importRegex = /import\s+(?:[^\s,{}]+\s*(?:,\s*)?)?(?:\{[^}]*\}\s*)?from\s+['"]([^'"]+)['"]/g
      const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g

      let match

      // 处理 ES6 import
      while ((match = importRegex.exec(content)) !== null) {
        const dep = match[1]
        if (this.isExternalDependency(dep)) {
          external.push(dep)
        }
        else {
          const resolvedPath = this.resolvePath(dep, file.path)
          if (resolvedPath) {
            internal.push(resolvedPath)
          }
        }
      }

      // 处理 CommonJS require
      while ((match = requireRegex.exec(content)) !== null) {
        const dep = match[1]
        if (this.isExternalDependency(dep)) {
          external.push(dep)
        }
        else {
          const resolvedPath = this.resolvePath(dep, file.path)
          if (resolvedPath) {
            internal.push(resolvedPath)
          }
        }
      }
    }
    catch (error) {
      logger.warn(`无法读取文件 ${file.path}:`, error)
    }

    return { internal, external }
  }

  /**
   * 判断是否为外部依赖
   */
  private isExternalDependency(dep: string): boolean {
    // 相对路径或绝对路径
    if (dep.startsWith('.') || dep.startsWith('/')) {
      return false
    }

    // Node.js 内置模块
    const builtinModules = [
      'fs',
      'path',
      'url',
      'util',
      'events',
      'stream',
      'buffer',
      'crypto',
      'os',
      'http',
      'https',
      'zlib',
      'querystring',
    ]

    if (builtinModules.includes(dep)) {
      return true
    }

    // npm 包（不包含路径分隔符或以 @ 开头的 scoped 包）
    return !dep.includes('/') || dep.startsWith('@')
  }

  /**
   * 解析相对路径
   */
  private resolvePath(dep: string, fromPath: string): string | null {
    try {
      const fromDir = path.dirname(fromPath)
      const resolvedPath = path.resolve(fromDir, dep)

      // 尝试添加常见扩展名
      const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json']
      const fs = require('node:fs')

      if (fs.existsSync(resolvedPath)) {
        return resolvedPath
      }

      for (const ext of extensions) {
        const pathWithExt = resolvedPath + ext
        if (fs.existsSync(pathWithExt)) {
          return pathWithExt
        }
      }

      // 尝试 index 文件
      for (const ext of extensions) {
        const indexPath = path.join(resolvedPath, `index${ext}`)
        if (fs.existsSync(indexPath)) {
          return indexPath
        }
      }
    }
    catch (error) {
      // 忽略解析错误
    }

    return null
  }

  /**
   * 检测循环依赖
   */
  private detectCycles(graph: DependencyGraph): string[][] {
    const cycles: string[][] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // 找到循环
        const cycleStart = path.indexOf(node)
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart).concat(node))
        }
        return
      }

      if (visited.has(node)) {
        return
      }

      visited.add(node)
      recursionStack.add(node)

      // 从edges中找到当前节点的依赖
      const dependencies = graph.edges
        .filter(edge => edge.from === node)
        .map(edge => edge.to)

      for (const dep of dependencies) {
        dfs(dep, [...path, node])
      }

      recursionStack.delete(node)
    }

    for (const node of graph.nodes.keys()) {
      if (!visited.has(node)) {
        dfs(node, [])
      }
    }

    return cycles
  }

  /**
   * 显示分析结果
   */
  private showAnalysisResult(
    scanResult: ProjectScanResult,
    dependencyGraph: DependencyGraph,
    pluginConfig: any,
    options: any,
  ): void {
    console.log()
    console.log(chalk.cyan.bold('📊 项目分析报告'))
    console.log(chalk.gray('='.repeat(60)))

    // 项目概览
    this.showProjectOverview(scanResult)

    // 文件类型统计
    this.showFileTypeStats(scanResult)

    // 依赖关系分析
    this.showDependencyAnalysis(dependencyGraph)

    // 插件配置分析
    this.showPluginAnalysis(pluginConfig)

    // 构建建议
    this.showBuildRecommendations(scanResult, dependencyGraph)

    console.log(chalk.gray('='.repeat(60)))
    console.log()
  }

  /**
   * 显示项目概览
   */
  private showProjectOverview(scanResult: ProjectScanResult): void {
    console.log()
    console.log(chalk.bold('📁 项目概览'))
    console.log(chalk.gray('─'.repeat(30)))
    console.log(`${chalk.bold('项目类型:')} ${chalk.yellow(scanResult.projectType)}`)
    console.log(`${chalk.bold('根目录:')} ${chalk.cyan(scanResult.root)}`)
    console.log(`${chalk.bold('文件总数:')} ${chalk.green(scanResult.files.length)}`)
    console.log(`${chalk.bold('入口文件:')} ${chalk.cyan(scanResult.entryPoints.join(', ') || '未检测到')}`)

    if (scanResult.packageInfo) {
      console.log(`${chalk.bold('包名:')} ${chalk.cyan(scanResult.packageInfo.name || '未定义')}`)
      console.log(`${chalk.bold('版本:')} ${chalk.cyan(scanResult.packageInfo.version || '未定义')}`)
    }
  }

  /**
   * 显示文件类型统计
   */
  private showFileTypeStats(scanResult: ProjectScanResult): void {
    console.log()
    console.log(chalk.bold('📄 文件类型统计'))
    console.log(chalk.gray('─'.repeat(30)))

    const typeStats = new Map<string, number>()
    let totalSize = 0

    scanResult.files.forEach((file) => {
      const count = typeStats.get(file.type) || 0
      typeStats.set(file.type, count + 1)
      totalSize += file.size || 0
    })

    // 按数量排序
    const sortedTypes = Array.from(typeStats.entries())
      .sort((a, b) => b[1] - a[1])

    sortedTypes.forEach(([type, count]) => {
      const percentage = ((count / scanResult.files.length) * 100).toFixed(1)
      console.log(`  ${chalk.cyan(type.padEnd(12))} ${chalk.green(count.toString().padStart(4))} 个 (${percentage}%)`)
    })

    console.log(`\n${chalk.bold('总大小:')} ${chalk.yellow(this.formatFileSize(totalSize))}`)
  }

  /**
   * 显示依赖关系分析
   */
  private showDependencyAnalysis(dependencyGraph: DependencyGraph): void {
    console.log()
    console.log(chalk.bold('🔗 依赖关系分析'))
    console.log(chalk.gray('─'.repeat(30)))

    console.log(`${chalk.bold('内部模块:')} ${chalk.green(dependencyGraph.nodes.size)} 个`)
    console.log(`${chalk.bold('依赖关系:')} ${chalk.green(dependencyGraph.edges.length)} 条`)

    // 检测循环依赖
    const cycles = this.detectCycles(dependencyGraph)

    // 显示循环依赖
    if (cycles.length > 0) {
      console.log(`\n${chalk.red.bold('⚠️  检测到循环依赖:')} ${cycles.length} 个`)
      cycles.slice(0, 3).forEach((cycle, index) => {
        console.log(`  ${chalk.red(`${index + 1}.`)} ${cycle.map(p => path.basename(p)).join(' → ')}`)
      })

      if (cycles.length > 3) {
        console.log(`  ${chalk.gray(`... 还有 ${cycles.length - 3} 个`)}`)
      }
    }
    else {
      console.log(`\n${chalk.green('✓ 未检测到循环依赖')}`)
    }
  }

  /**
   * 显示插件分析
   */
  private showPluginAnalysis(pluginConfig: any): void {
    console.log()
    console.log(chalk.bold('🔌 插件配置分析'))
    console.log(chalk.gray('─'.repeat(30)))

    if (pluginConfig.plugins && pluginConfig.plugins.length > 0) {
      console.log(`${chalk.bold('推荐插件:')} ${chalk.green(pluginConfig.plugins.length)} 个`)
      pluginConfig.plugins.forEach((plugin: any) => {
        console.log(`  ${chalk.cyan('•')} ${plugin.name}`)
      })
    }
    else {
      console.log(chalk.yellow('未检测到需要特殊插件的文件类型'))
    }
  }

  /**
   * 显示构建建议
   */
  private showBuildRecommendations(scanResult: ProjectScanResult, dependencyGraph: DependencyGraph): void {
    console.log()
    console.log(chalk.bold('💡 构建建议'))
    console.log(chalk.gray('─'.repeat(30)))

    const recommendations: string[] = []

    // 基于项目类型的建议
    if (scanResult.projectType === 'vue') {
      recommendations.push('建议使用 ESM 和 UMD 格式以支持 Vue 生态系统')
    }
    else if (scanResult.projectType === 'react') {
      recommendations.push('建议使用 ESM 和 CJS 格式以支持 React 生态系统')
    }

    // 基于文件数量的建议
    if (scanResult.files.length > 100) {
      recommendations.push('项目文件较多，建议启用代码分割和 Tree Shaking')
    }

    // 基于循环依赖的建议
    const cycles = this.detectCycles(dependencyGraph)
    if (cycles.length > 0) {
      recommendations.push('检测到循环依赖，建议重构代码结构')
    }

    // 基于依赖关系的建议
    if (dependencyGraph.edges.length > 50) {
      recommendations.push('依赖关系较复杂，建议优化模块结构')
    }

    // TypeScript 相关建议
    const hasTypeScript = scanResult.files.some(f => f.type === 'typescript' || f.type === 'tsx')
    if (hasTypeScript) {
      recommendations.push('检测到 TypeScript 文件，建议启用类型声明文件生成')
    }

    if (recommendations.length === 0) {
      recommendations.push('项目结构良好，可以直接使用默认配置进行构建')
    }

    recommendations.forEach((rec, index) => {
      console.log(`  ${chalk.yellow(`${index + 1}.`)} ${rec}`)
    })
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0)
      return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }
}
