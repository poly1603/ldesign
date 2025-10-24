#!/usr/bin/env tsx
/**
 * 依赖分析工具 - 分析 monorepo 中的包依赖关系
 * 用于识别循环依赖和生成依赖图
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

interface PackageInfo {
  name: string
  version: string
  path: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  peerDependencies: Record<string, string>
}

interface DependencyEdge {
  from: string
  to: string
  type: 'dep' | 'devDep' | 'peerDep'
}

class DependencyAnalyzer {
  private packages: Map<string, PackageInfo> = new Map()
  private edges: DependencyEdge[] = []
  private cycles: string[][] = []

  async analyze() {
    console.log('🔍 开始分析包依赖关系...\n')

    // 1. 收集所有包信息
    this.collectPackages()

    // 2. 构建依赖图
    this.buildDependencyGraph()

    // 3. 检测循环依赖
    this.detectCycles()

    // 4. 生成报告
    this.generateReport()
  }

  private collectPackages() {
    const workspaceDirs = ['packages', 'libraries', 'tools']

    for (const dir of workspaceDirs) {
      const dirPath = join(rootDir, dir)
      if (!existsSync(dirPath)) continue

      const packages = readdirSync(dirPath)
      for (const pkg of packages) {
        const pkgPath = join(dirPath, pkg)
        const packageJsonPath = join(pkgPath, 'package.json')

        if (existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
            const packageInfo: PackageInfo = {
              name: packageJson.name,
              version: packageJson.version,
              path: pkgPath,
              dependencies: packageJson.dependencies || {},
              devDependencies: packageJson.devDependencies || {},
              peerDependencies: packageJson.peerDependencies || {}
            }

            this.packages.set(packageInfo.name, packageInfo)
          } catch (error) {
            console.warn(`⚠️  无法解析 ${packageJsonPath}`)
          }
        }
      }
    }

    console.log(`📦 找到 ${this.packages.size} 个包\n`)
  }

  private buildDependencyGraph() {
    for (const [pkgName, pkgInfo] of this.packages) {
      // 分析 dependencies
      for (const depName of Object.keys(pkgInfo.dependencies)) {
        if (this.packages.has(depName)) {
          this.edges.push({
            from: pkgName,
            to: depName,
            type: 'dep'
          })
        }
      }

      // 分析 devDependencies
      for (const depName of Object.keys(pkgInfo.devDependencies)) {
        if (this.packages.has(depName)) {
          this.edges.push({
            from: pkgName,
            to: depName,
            type: 'devDep'
          })
        }
      }

      // 分析 peerDependencies
      for (const depName of Object.keys(pkgInfo.peerDependencies)) {
        if (this.packages.has(depName)) {
          this.edges.push({
            from: pkgName,
            to: depName,
            type: 'peerDep'
          })
        }
      }
    }

    console.log(`🔗 找到 ${this.edges.length} 个内部依赖关系\n`)
  }

  private detectCycles() {
    const graph: Map<string, Set<string>> = new Map()

    // 构建邻接表（只考虑 dependencies，不考虑 devDependencies）
    for (const edge of this.edges) {
      if (edge.type === 'dep') {
        if (!graph.has(edge.from)) {
          graph.set(edge.from, new Set())
        }
        graph.get(edge.from)!.add(edge.to)
      }
    }

    // DFS 检测循环
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    const dfs = (node: string): void => {
      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      const neighbors = graph.get(node) || new Set()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor)
        } else if (recursionStack.has(neighbor)) {
          // 找到循环
          const cycleStartIndex = path.indexOf(neighbor)
          const cycle = path.slice(cycleStartIndex).concat(neighbor)
          this.cycles.push(cycle)
        }
      }

      path.pop()
      recursionStack.delete(node)
    }

    // 对每个未访问的节点进行 DFS
    for (const pkgName of this.packages.keys()) {
      if (!visited.has(pkgName)) {
        dfs(pkgName)
      }
    }
  }

  private generateReport() {
    console.log('📊 依赖分析报告\n')
    console.log('='.repeat(80))

    // 1. 循环依赖报告
    console.log('\n🔄 循环依赖检测结果：')
    if (this.cycles.length === 0) {
      console.log('✅ 未发现循环依赖！')
    } else {
      console.log(`❌ 发现 ${this.cycles.length} 个循环依赖：`)
      this.cycles.forEach((cycle, index) => {
        console.log(`\n  循环 ${index + 1}: ${cycle.join(' → ')}`)
      })
    }

    // 2. 依赖层级分析
    console.log('\n\n📈 依赖层级分析：')
    const layers = this.analyzeLayers()
    layers.forEach((layer, index) => {
      console.log(`\n  第 ${index} 层 (${layer.size} 个包)：`)
      for (const pkg of layer) {
        const deps = this.getDirectDependencies(pkg)
        console.log(`    - ${pkg} ${deps.length > 0 ? `→ [${deps.join(', ')}]` : '(无依赖)'}`)
      }
    })

    // 3. 依赖统计
    console.log('\n\n📊 依赖统计：')
    const stats = this.calculateStats()
    console.log(`  - 包总数: ${stats.totalPackages}`)
    console.log(`  - 依赖关系总数: ${stats.totalDependencies}`)
    console.log(`  - 平均每个包的依赖数: ${stats.avgDependencies.toFixed(2)}`)
    console.log(`  - 最多被依赖的包:`)
    stats.mostDepended.forEach(({ pkg, count }) => {
      console.log(`    - ${pkg}: 被 ${count} 个包依赖`)
    })

    // 4. 建议
    console.log('\n\n💡 优化建议：')
    this.generateSuggestions()

    console.log('\n' + '='.repeat(80))
  }

  private analyzeLayers(): Set<string>[] {
    const layers: Set<string>[] = []
    const processed = new Set<string>()
    const graph = this.buildAdjacencyList()

    // 计算每个节点的入度
    const inDegree = new Map<string, number>()
    for (const pkg of this.packages.keys()) {
      inDegree.set(pkg, 0)
    }

    for (const deps of graph.values()) {
      for (const dep of deps) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1)
      }
    }

    // 拓扑排序
    while (processed.size < this.packages.size) {
      const currentLayer = new Set<string>()

      for (const [pkg, degree] of inDegree) {
        if (degree === 0 && !processed.has(pkg)) {
          currentLayer.add(pkg)
          processed.add(pkg)
        }
      }

      if (currentLayer.size === 0) {
        // 存在循环依赖，添加剩余的包
        for (const pkg of this.packages.keys()) {
          if (!processed.has(pkg)) {
            currentLayer.add(pkg)
            processed.add(pkg)
          }
        }
      }

      if (currentLayer.size > 0) {
        layers.push(currentLayer)

        // 更新入度
        for (const pkg of currentLayer) {
          const deps = graph.get(pkg) || new Set()
          for (const dep of deps) {
            inDegree.set(dep, (inDegree.get(dep) || 1) - 1)
          }
        }
      }
    }

    return layers
  }

  private buildAdjacencyList(): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>()

    for (const edge of this.edges) {
      if (edge.type === 'dep') {
        if (!graph.has(edge.from)) {
          graph.set(edge.from, new Set())
        }
        graph.get(edge.from)!.add(edge.to)
      }
    }

    return graph
  }

  private getDirectDependencies(pkg: string): string[] {
    return this.edges
      .filter(edge => edge.from === pkg && edge.type === 'dep')
      .map(edge => edge.to)
  }

  private calculateStats() {
    const dependencyCount = new Map<string, number>()

    for (const pkg of this.packages.keys()) {
      dependencyCount.set(pkg, 0)
    }

    for (const edge of this.edges) {
      if (edge.type === 'dep') {
        dependencyCount.set(edge.to, (dependencyCount.get(edge.to) || 0) + 1)
      }
    }

    const totalDeps = this.edges.filter(e => e.type === 'dep').length
    const sortedByDependency = Array.from(dependencyCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      totalPackages: this.packages.size,
      totalDependencies: totalDeps,
      avgDependencies: totalDeps / this.packages.size,
      mostDepended: sortedByDependency.map(([pkg, count]) => ({ pkg, count }))
    }
  }

  private generateSuggestions() {
    const suggestions: string[] = []

    // 循环依赖建议
    if (this.cycles.length > 0) {
      suggestions.push('❌ 发现循环依赖，建议：')
      suggestions.push('  - 重新设计包的职责，确保单向依赖')
      suggestions.push('  - 考虑将共享代码提取到独立的包中')
      suggestions.push('  - 使用依赖注入或事件系统解耦')
    }

    // 层级建议
    const layers = this.analyzeLayers()
    if (layers.length > 5) {
      suggestions.push('\n⚠️  依赖层级过深（' + layers.length + ' 层），建议：')
      suggestions.push('  - 减少包之间的依赖链长度')
      suggestions.push('  - 考虑合并功能相近的包')
    }

    // 高耦合建议
    const stats = this.calculateStats()
    const highlyDepended = stats.mostDepended.filter(({ count }) => count > 5)
    if (highlyDepended.length > 0) {
      suggestions.push('\n⚠️  部分包被过多依赖，建议：')
      highlyDepended.forEach(({ pkg, count }) => {
        suggestions.push(`  - ${pkg} 被 ${count} 个包依赖，考虑拆分功能`)
      })
    }

    if (suggestions.length === 0) {
      suggestions.push('✅ 依赖结构良好，继续保持！')
    }

    suggestions.forEach(s => console.log(s))
  }

  // 生成可视化数据
  async generateVisualization() {
    const mermaidGraph = this.generateMermaidDiagram()
    const outputPath = join(rootDir, 'dependency-graph.md')

    const content = `# 依赖关系图

\`\`\`mermaid
${mermaidGraph}
\`\`\`

生成时间: ${new Date().toISOString()}
`

    const { writeFileSync } = await import('fs')
    writeFileSync(outputPath, content)
    console.log(`\n📈 依赖关系图已生成: ${outputPath}`)
  }

  private generateMermaidDiagram(): string {
    const lines = ['graph TD']

    // 添加节点
    for (const [pkgName] of this.packages) {
      const cleanName = pkgName.replace('@ldesign/', '')
      lines.push(`  ${cleanName}["${cleanName}"]`)
    }

    // 添加边
    for (const edge of this.edges) {
      if (edge.type === 'dep') {
        const from = edge.from.replace('@ldesign/', '')
        const to = edge.to.replace('@ldesign/', '')
        lines.push(`  ${from} --> ${to}`)
      }
    }

    return lines.join('\n')
  }
}

// 执行分析
const analyzer = new DependencyAnalyzer()
analyzer.analyze().then(() => {
  analyzer.generateVisualization()
}).catch(console.error)

