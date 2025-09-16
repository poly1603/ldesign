#!/usr/bin/env node

/**
 * 依赖关系分析工具
 * 
 * 功能：
 * - 分析包之间的依赖关系
 * - 检测循环依赖
 * - 生成依赖关系图
 * - 优化构建顺序建议
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

class DependencyAnalyzer {
  constructor() {
    this.packages = new Map()
    this.dependencies = new Map()
    this.circularDeps = []
  }

  /**
   * 运行依赖分析
   */
  analyze() {
    console.log('🔍 开始分析依赖关系...')

    // 扫描所有包
    this.scanPackages()

    // 分析依赖关系
    this.analyzeDependencies()

    // 检测循环依赖
    this.detectCircularDependencies()

    // 生成报告
    this.generateReport()

    // 生成 Mermaid 图表
    this.generateMermaidDiagram()

    console.log('✅ 依赖分析完成！')
  }

  /**
   * 扫描所有包
   */
  scanPackages() {
    const packagesDir = 'packages'
    const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const dir of packageDirs) {
      const packageJsonPath = join(packagesDir, dir, 'package.json')
      
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
          this.packages.set(packageJson.name, {
            name: packageJson.name,
            path: join(packagesDir, dir),
            version: packageJson.version,
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {},
            peerDependencies: packageJson.peerDependencies || {}
          })
        } catch (error) {
          console.warn(`读取 ${packageJsonPath} 失败:`, error.message)
        }
      }
    }
    
    console.log(`📦 发现 ${this.packages.size} 个包`)
  }

  /**
   * 分析依赖关系
   */
  analyzeDependencies() {
    for (const [packageName, packageInfo] of this.packages) {
      const deps = []
      
      // 分析 dependencies
      for (const depName of Object.keys(packageInfo.dependencies)) {
        if (this.packages.has(depName)) {
          deps.push({
            name: depName,
            type: 'dependency',
            version: packageInfo.dependencies[depName]
          })
        }
      }
      
      // 分析 devDependencies
      for (const depName of Object.keys(packageInfo.devDependencies)) {
        if (this.packages.has(depName)) {
          deps.push({
            name: depName,
            type: 'devDependency',
            version: packageInfo.devDependencies[depName]
          })
        }
      }
      
      this.dependencies.set(packageName, deps)
    }
  }

  /**
   * 检测循环依赖
   */
  detectCircularDependencies() {
    const visited = new Set()
    const recursionStack = new Set()
    
    const dfs = (packageName, path = []) => {
      if (recursionStack.has(packageName)) {
        // 发现循环依赖
        const cycleStart = path.indexOf(packageName)
        const cycle = path.slice(cycleStart).concat(packageName)
        this.circularDeps.push(cycle)
        return
      }
      
      if (visited.has(packageName)) {
        return
      }
      
      visited.add(packageName)
      recursionStack.add(packageName)
      
      const deps = this.dependencies.get(packageName) || []
      for (const dep of deps) {
        if (dep.type === 'dependency') { // 只检查生产依赖
          dfs(dep.name, [...path, packageName])
        }
      }
      
      recursionStack.delete(packageName)
    }
    
    for (const packageName of this.packages.keys()) {
      if (!visited.has(packageName)) {
        dfs(packageName)
      }
    }
  }

  /**
   * 生成依赖关系报告
   */
  generateReport() {
    const report = `# 依赖关系分析报告

## 📊 总览

- **包总数**: ${this.packages.size}
- **依赖关系**: ${Array.from(this.dependencies.values()).reduce((sum, deps) => sum + deps.length, 0)}
- **循环依赖**: ${this.circularDeps.length}

## 📦 包列表

${Array.from(this.packages.values()).map(pkg => 
  `- **${pkg.name}** (${pkg.version})`
).join('\n')}

## 🔗 依赖关系

${Array.from(this.dependencies.entries()).map(([pkg, deps]) => {
  if (deps.length === 0) return `### ${pkg}\n无内部依赖`
  
  return `### ${pkg}
${deps.map(dep => `- ${dep.name} (${dep.type})`).join('\n')}`
}).join('\n\n')}

## ⚠️ 循环依赖

${this.circularDeps.length === 0 ? '✅ 未发现循环依赖' : 
  this.circularDeps.map((cycle, index) => 
    `### 循环依赖 ${index + 1}
${cycle.join(' → ')}`
  ).join('\n\n')
}

## 🚀 优化建议

${this.generateOptimizationSuggestions()}

---
*报告生成时间: ${new Date().toISOString()}*
`

    writeFileSync('dependency-report.md', report)
    console.log('📄 依赖报告已生成: dependency-report.md')
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions() {
    const suggestions = []
    
    if (this.circularDeps.length > 0) {
      suggestions.push('- 🔄 发现循环依赖，建议重构代码结构或使用 peerDependencies')
    }
    
    // 分析高度依赖的包
    const dependencyCount = new Map()
    for (const deps of this.dependencies.values()) {
      for (const dep of deps) {
        dependencyCount.set(dep.name, (dependencyCount.get(dep.name) || 0) + 1)
      }
    }
    
    const highlyDepended = Array.from(dependencyCount.entries())
      .filter(([_, count]) => count > 3)
      .sort((a, b) => b[1] - a[1])
    
    if (highlyDepended.length > 0) {
      suggestions.push(`- 📈 高度依赖的包: ${highlyDepended.map(([name, count]) => `${name}(${count})`).join(', ')}`)
      suggestions.push('- 💡 考虑将这些包优先构建以提高并行度')
    }
    
    // 分析孤立包
    const isolatedPackages = Array.from(this.packages.keys())
      .filter(pkg => !dependencyCount.has(pkg) && (this.dependencies.get(pkg) || []).length === 0)
    
    if (isolatedPackages.length > 0) {
      suggestions.push(`- 🏝️ 孤立包: ${isolatedPackages.join(', ')}`)
      suggestions.push('- 💡 这些包可以独立构建，适合并行处理')
    }
    
    if (suggestions.length === 0) {
      suggestions.push('- ✅ 依赖结构良好，无需特别优化')
    }
    
    return suggestions.join('\n')
  }

  /**
   * 生成 Mermaid 依赖关系图
   */
  generateMermaidDiagram() {
    let mermaid = 'graph TD\n'
    
    // 添加节点
    for (const packageName of this.packages.keys()) {
      const shortName = packageName.replace('@ldesign/', '')
      mermaid += `    ${shortName}[${shortName}]\n`
    }
    
    mermaid += '\n'
    
    // 添加依赖关系
    for (const [packageName, deps] of this.dependencies) {
      const shortName = packageName.replace('@ldesign/', '')
      
      for (const dep of deps) {
        const depShortName = dep.name.replace('@ldesign/', '')
        const style = dep.type === 'dependency' ? '-->' : '-.->|dev|'
        mermaid += `    ${shortName} ${style} ${depShortName}\n`
      }
    }
    
    // 高亮循环依赖
    if (this.circularDeps.length > 0) {
      mermaid += '\n    %% 循环依赖高亮\n'
      for (const cycle of this.circularDeps) {
        for (let i = 0; i < cycle.length - 1; i++) {
          const from = cycle[i].replace('@ldesign/', '')
          const to = cycle[i + 1].replace('@ldesign/', '')
          mermaid += `    ${from} -.->|循环| ${to}\n`
        }
      }
    }
    
    writeFileSync('dependency-graph.mmd', mermaid)
    console.log('📊 Mermaid 图表已生成: dependency-graph.mmd')
  }
}

// 运行依赖分析
const analyzer = new DependencyAnalyzer()
analyzer.analyze()
