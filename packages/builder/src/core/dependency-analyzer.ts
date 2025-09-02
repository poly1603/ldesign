/**
 * 智能依赖分析器
 * 提供更精确的依赖关系检测和循环依赖分析
 */

import type {
  DependencyGraph,
  FileInfo,
  ProjectScanResult,
} from '../types'
import { basename, dirname, resolve } from 'node:path'
import { Logger } from '../utils/logger'

const logger = new Logger('DependencyAnalyzer')

export interface CircularDependency {
  cycle: string[]
  severity: 'warning' | 'error'
  description: string
}

export interface DependencyAnalysisResult {
  circularDependencies: CircularDependency[]
  orphanedFiles: string[]
  heaviestDependencies: Array<{ file: string; dependentCount: number }>
  deepestChains: Array<{ chain: string[]; depth: number }>
  analysisTime: number
}

export class DependencyAnalyzer {
  private extensionPriority = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json']

  /**
   * 分析项目依赖关系
   */
  async analyze(scanResult: ProjectScanResult): Promise<DependencyAnalysisResult> {
    const startTime = Date.now()
    logger.info('开始智能依赖分析...')

    try {
      // 构建更精确的依赖图
      const dependencyGraph = await this.buildEnhancedDependencyGraph(scanResult)

      // 检测循环依赖
      const circularDependencies = this.detectCircularDependencies(dependencyGraph)

      // 查找孤儿文件
      const orphanedFiles = this.findOrphanedFiles(dependencyGraph, scanResult.entryPoints)

      // 分析最重的依赖
      const heaviestDependencies = this.findHeaviestDependencies(dependencyGraph)

      // 找到最深的依赖链
      const deepestChains = this.findDeepestDependencyChains(dependencyGraph, scanResult.entryPoints)

      const analysisTime = Date.now() - startTime

      logger.info(`依赖分析完成，耗时 ${analysisTime}ms`)
      logger.info(`发现 ${circularDependencies.length} 个循环依赖`)
      logger.info(`发现 ${orphanedFiles.length} 个孤儿文件`)

      return {
        circularDependencies,
        orphanedFiles,
        heaviestDependencies,
        deepestChains,
        analysisTime,
      }
    }
    catch (error) {
      logger.error('依赖分析失败:', error)
      throw error
    }
  }

  /**
   * 构建增强的依赖图
   */
  private async buildEnhancedDependencyGraph(scanResult: ProjectScanResult): Promise<DependencyGraph> {
    const dependencyGraph: DependencyGraph = {
      nodes: new Map(),
      edges: [],
    }

    const projectRoot = scanResult.root

    // 创建节点映射
    for (const file of scanResult.files) {
      dependencyGraph.nodes.set(file.path, {
        id: file.path,
        file,
        inDegree: 0,
        outDegree: 0,
      })
    }

    // 分析每个文件的依赖关系
    for (const file of scanResult.files) {
      if (this.isSourceFile(file)) {
        const dependencies = await this.resolveFileDependencies(file, scanResult.files, projectRoot)

        for (const depPath of dependencies) {
          const targetNode = dependencyGraph.nodes.get(depPath)
          if (targetNode) {
            dependencyGraph.edges.push({
              from: file.path,
              to: depPath,
              type: 'import',
            })

            // 更新节点度数
            const fromNode = dependencyGraph.nodes.get(file.path)
            if (fromNode) fromNode.outDegree++
            targetNode.inDegree++
          }
        }
      }
    }

    return dependencyGraph
  }

  /**
   * 解析文件的依赖关系
   */
  private async resolveFileDependencies(
    file: FileInfo,
    allFiles: FileInfo[],
    projectRoot: string,
  ): Promise<string[]> {
    const dependencies: string[] = []
    const fileDir = dirname(file.path)

    // 解析每个导入
    for (const dep of file.dependencies || []) {
      // 跳过外部依赖
      if (this.isExternalDependency(dep)) {
        continue
      }

      const resolvedPath = await this.resolveDependencyPath(dep, fileDir, allFiles, projectRoot)
      if (resolvedPath) {
        dependencies.push(resolvedPath)
      }
    }

    return dependencies
  }

  /**
   * 更智能的依赖路径解析
   */
  private async resolveDependencyPath(
    importPath: string,
    fromDir: string,
    allFiles: FileInfo[],
    projectRoot: string,
  ): Promise<string | null> {
    // 相对路径导入
    if (importPath.startsWith('.')) {
      const absolutePath = resolve(fromDir, importPath)
      return this.findMatchingFile(absolutePath, allFiles)
    }

    // 绝对路径导入（以 / 开头）
    if (importPath.startsWith('/')) {
      const absolutePath = resolve(projectRoot, importPath.slice(1))
      return this.findMatchingFile(absolutePath, allFiles)
    }

    // 别名导入（如 @/，~/）
    if (importPath.startsWith('@/')) {
      const srcPath = resolve(projectRoot, 'src', importPath.slice(2))
      return this.findMatchingFile(srcPath, allFiles)
    }

    if (importPath.startsWith('~/')) {
      const rootPath = resolve(projectRoot, importPath.slice(2))
      return this.findMatchingFile(rootPath, allFiles)
    }

    return null
  }

  /**
   * 查找匹配的文件
   */
  private findMatchingFile(basePath: string, allFiles: FileInfo[]): string | null {
    // 直接匹配
    const directMatch = allFiles.find(f => f.path === basePath)
    if (directMatch) {
      return directMatch.path
    }

    // 尝试添加扩展名
    for (const ext of this.extensionPriority) {
      const withExt = basePath + ext
      const match = allFiles.find(f => f.path === withExt)
      if (match) {
        return match.path
      }
    }

    // 尝试index文件
    for (const ext of this.extensionPriority) {
      const indexPath = resolve(basePath, `index${ext}`)
      const match = allFiles.find(f => f.path === indexPath)
      if (match) {
        return match.path
      }
    }

    return null
  }

  /**
   * 检测循环依赖
   */
  private detectCircularDependencies(dependencyGraph: DependencyGraph): CircularDependency[] {
    const circularDependencies: CircularDependency[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const cycles = new Map<string, string[]>()

    const dfs = (nodeId: string, path: string[]): void => {
      if (visiting.has(nodeId)) {
        // 发现循环依赖
        const cycleStart = path.indexOf(nodeId)
        const cycle = path.slice(cycleStart).concat([nodeId])
        const cycleKey = cycle.slice().sort().join('|')

        if (!cycles.has(cycleKey)) {
          cycles.set(cycleKey, cycle)
          
          const severity = this.evaluateCycleSeverity(cycle)
          const description = this.describeCycle(cycle)

          circularDependencies.push({
            cycle,
            severity,
            description,
          })
        }
        return
      }

      if (visited.has(nodeId)) {
        return
      }

      visiting.add(nodeId)

      // 访问所有依赖
      const outgoingEdges = dependencyGraph.edges.filter(edge => edge.from === nodeId)
      for (const edge of outgoingEdges) {
        dfs(edge.to, [...path, nodeId])
      }

      visiting.delete(nodeId)
      visited.add(nodeId)
    }

    // 从每个节点开始检测
    for (const [nodeId] of dependencyGraph.nodes) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, [])
      }
    }

    return circularDependencies
  }

  /**
   * 评估循环依赖的严重程度
   */
  private evaluateCycleSeverity(cycle: string[]): 'warning' | 'error' {
    // 自引用视为错误
    if (cycle.length === 2 && cycle[0] === cycle[1]) {
      return 'error'
    }

    // 短循环（3个文件以内）通常更严重
    if (cycle.length <= 3) {
      return 'error'
    }

    // 长循环相对较轻
    return 'warning'
  }

  /**
   * 描述循环依赖
   */
  private describeCycle(cycle: string[]): string {
    const fileNames = cycle.map(path => basename(path))
    return `${fileNames.join(' → ')}`
  }

  /**
   * 查找孤儿文件
   */
  private findOrphanedFiles(dependencyGraph: DependencyGraph, entryPoints: string[]): string[] {
    const reachable = new Set<string>()

    // 从入口点开始深度优先搜索
    const dfs = (nodeId: string): void => {
      if (reachable.has(nodeId)) {
        return
      }

      reachable.add(nodeId)

      // 访问所有依赖
      const outgoingEdges = dependencyGraph.edges.filter(edge => edge.from === nodeId)
      for (const edge of outgoingEdges) {
        dfs(edge.to)
      }
    }

    // 从所有入口点开始
    for (const entryPoint of entryPoints) {
      // 找到完整路径
      const fullPath = Array.from(dependencyGraph.nodes.keys()).find(path =>
        path.endsWith(entryPoint) || path === entryPoint
      )
      if (fullPath) {
        dfs(fullPath)
      }
    }

    // 找出不可达的文件
    const orphanedFiles: string[] = []
    for (const [nodeId, node] of dependencyGraph.nodes) {
      if (!reachable.has(nodeId) && this.isSourceFile(node.file)) {
        orphanedFiles.push(nodeId)
      }
    }

    return orphanedFiles
  }

  /**
   * 找到最重的依赖
   */
  private findHeaviestDependencies(dependencyGraph: DependencyGraph): Array<{ file: string; dependentCount: number }> {
    const heaviestDependencies: Array<{ file: string; dependentCount: number }> = []

    for (const [nodeId, node] of dependencyGraph.nodes) {
      if (node.inDegree > 0) {
        heaviestDependencies.push({
          file: nodeId,
          dependentCount: node.inDegree,
        })
      }
    }

    return heaviestDependencies
      .sort((a, b) => b.dependentCount - a.dependentCount)
      .slice(0, 10) // 返回前10个
  }

  /**
   * 找到最深的依赖链
   */
  private findDeepestDependencyChains(
    dependencyGraph: DependencyGraph,
    entryPoints: string[],
  ): Array<{ chain: string[]; depth: number }> {
    const deepestChains: Array<{ chain: string[]; depth: number }> = []

    const dfs = (nodeId: string, path: string[], visited: Set<string>): void => {
      if (visited.has(nodeId)) {
        return // 避免循环
      }

      visited.add(nodeId)
      const currentChain = [...path, nodeId]

      const outgoingEdges = dependencyGraph.edges.filter(edge => edge.from === nodeId)

      if (outgoingEdges.length === 0) {
        // 叶子节点，记录链条
        deepestChains.push({
          chain: currentChain,
          depth: currentChain.length,
        })
      } else {
        // 继续深度遍历
        for (const edge of outgoingEdges) {
          dfs(edge.to, currentChain, new Set(visited))
        }
      }

      visited.delete(nodeId)
    }

    // 从所有入口点开始
    for (const entryPoint of entryPoints) {
      const fullPath = Array.from(dependencyGraph.nodes.keys()).find(path =>
        path.endsWith(entryPoint) || path === entryPoint
      )
      if (fullPath) {
        dfs(fullPath, [], new Set())
      }
    }

    return deepestChains
      .sort((a, b) => b.depth - a.depth)
      .slice(0, 5) // 返回前5个最深的链条
  }

  /**
   * 判断是否为外部依赖
   */
  private isExternalDependency(dep: string): boolean {
    // 相对路径
    if (dep.startsWith('.')) {
      return false
    }

    // 别名路径
    if (dep.startsWith('@/') || dep.startsWith('~/')) {
      return false
    }

    // 绝对路径
    if (dep.startsWith('/')) {
      return false
    }

    return true
  }

  /**
   * 判断是否为源码文件
   */
  private isSourceFile(file: FileInfo): boolean {
    return [
      'typescript',
      'tsx',
      'javascript',
      'jsx',
      'vue',
    ].includes(file.type)
  }

  /**
   * 生成依赖分析报告
   */
  generateReport(result: DependencyAnalysisResult): string {
    const lines: string[] = []

    lines.push('📊 依赖分析报告')
    lines.push('=' .repeat(50))
    lines.push('')

    // 循环依赖
    if (result.circularDependencies.length > 0) {
      lines.push('🔄 循环依赖:')
      result.circularDependencies.forEach((cycle, index) => {
        const icon = cycle.severity === 'error' ? '❌' : '⚠️'
        lines.push(`  ${icon} ${index + 1}. ${cycle.description}`)
      })
      lines.push('')
    } else {
      lines.push('✅ 未发现循环依赖')
      lines.push('')
    }

    // 孤儿文件
    if (result.orphanedFiles.length > 0) {
      lines.push('👻 孤儿文件:')
      result.orphanedFiles.slice(0, 10).forEach((file, index) => {
        lines.push(`  ${index + 1}. ${basename(file)}`)
      })
      if (result.orphanedFiles.length > 10) {
        lines.push(`  ... 还有 ${result.orphanedFiles.length - 10} 个文件`)
      }
      lines.push('')
    } else {
      lines.push('✅ 未发现孤儿文件')
      lines.push('')
    }

    // 最重的依赖
    if (result.heaviestDependencies.length > 0) {
      lines.push('🏗️ 最重的依赖:')
      result.heaviestDependencies.slice(0, 5).forEach((dep, index) => {
        lines.push(`  ${index + 1}. ${basename(dep.file)} (被 ${dep.dependentCount} 个文件依赖)`)
      })
      lines.push('')
    }

    // 最深的依赖链
    if (result.deepestChains.length > 0) {
      lines.push('🔗 最深的依赖链:')
      result.deepestChains.slice(0, 3).forEach((chain, index) => {
        const chainStr = chain.chain.map(f => basename(f)).join(' → ')
        lines.push(`  ${index + 1}. ${chainStr} (深度: ${chain.depth})`)
      })
      lines.push('')
    }

    lines.push(`⏱️ 分析耗时: ${result.analysisTime}ms`)

    return lines.join('\n')
  }
}
