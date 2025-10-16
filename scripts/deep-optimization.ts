#!/usr/bin/env tsx
import * as fs from 'fs'
import * as path from 'path'
import { globSync } from 'glob'

interface OptimizationResult {
  filesProcessed: number
  consoleLogs: number
  debuggers: number
  todos: number
  duplicates: number
  unusedImports: number
}

class DeepOptimizer {
  private results: OptimizationResult = {
    filesProcessed: 0,
    consoleLogs: 0,
    debuggers: 0,
    todos: 0,
    duplicates: 0,
    unusedImports: 0
  }

  async optimize() {
    console.log('🚀 开始深度优化...\n')
    
    // 1. 清理调试代码
    await this.cleanDebugCode()
    
    // 2. 删除无用导入
    await this.removeUnusedImports()
    
    // 3. 合并重复代码
    await this.mergeDuplicateCode()
    
    // 4. 优化包结构
    await this.optimizePackageStructure()
    
    // 5. 生成报告
    this.generateReport()
  }

  private async cleanDebugCode() {
    console.log('📝 清理调试代码...')
    
    const files = globSync('packages/**/src/**/*.{ts,tsx,js,jsx}', {
      ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
    })

    for (const file of files) {
      let content = fs.readFileSync(file, 'utf-8')
      let modified = false

      // 删除 console.log/debug 语句（保留 console.warn/error）
      const consolePattern = /console\.(log|debug)\([^)]*\);?\n?/g
      const consoleMatches = content.match(consolePattern)
      if (consoleMatches) {
        this.results.consoleLogs += consoleMatches.length
        content = content.replace(consolePattern, '')
        modified = true
      }

      // 删除 debugger 语句
      const debuggerPattern = /debugger;?\n?/g
      const debuggerMatches = content.match(debuggerPattern)
      if (debuggerMatches) {
        this.results.debuggers += debuggerMatches.length
        content = content.replace(debuggerPattern, '')
        modified = true
      }

      // 标记 TODO/FIXME/HACK 注释
      const todoPattern = /\/\/\s*(TODO|FIXME|HACK):/g
      const todoMatches = content.match(todoPattern)
      if (todoMatches) {
        this.results.todos += todoMatches.length
      }

      if (modified) {
        fs.writeFileSync(file, content, 'utf-8')
        this.results.filesProcessed++
      }
    }
  }

  private async removeUnusedImports() {
    console.log('🗑️ 删除无用导入...')
    
    const files = globSync('packages/**/src/**/*.{ts,tsx}', {
      ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
    })

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const lines = content.split('\n')
      const newLines: string[] = []
      
      for (const line of lines) {
        // 检查导入语句
        if (line.startsWith('import ')) {
          const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from/)
          if (importMatch) {
            const imports = importMatch[1] || importMatch[2]
            const symbols = imports.split(',').map(s => s.trim())
            
            // 检查是否使用
            let used = false
            for (const symbol of symbols) {
              const symbolName = symbol.split(' as ')[0].trim()
              const usagePattern = new RegExp(`\\b${symbolName}\\b`, 'g')
              const restContent = lines.join('\n').replace(line, '')
              if (usagePattern.test(restContent)) {
                used = true
                break
              }
            }
            
            if (used) {
              newLines.push(line)
            } else {
              this.results.unusedImports++
            }
          } else {
            newLines.push(line)
          }
        } else {
          newLines.push(line)
        }
      }
      
      const newContent = newLines.join('\n')
      if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf-8')
      }
    }
  }

  private async mergeDuplicateCode() {
    console.log('🔄 检查重复代码...')
    
    // 创建共享工具包
    const sharedUtils = path.join('packages', 'shared', 'src', 'utils')
    
    // 常见的重复工具函数
    const commonUtils = {
      logger: [],
      errorHandler: [],
      cache: [],
      validator: []
    }
    
    const files = globSync('packages/**/src/**/*.ts', {
      ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*', '**/shared/**']
    })

    // 分析每个文件
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      
      // 检查常见模式
      if (content.includes('class Logger') || content.includes('function log')) {
        commonUtils.logger.push(file)
      }
      if (content.includes('class ErrorHandler') || content.includes('handleError')) {
        commonUtils.errorHandler.push(file)
      }
      if (content.includes('class Cache') || content.includes('LRUCache')) {
        commonUtils.cache.push(file)
      }
      if (content.includes('validate') || content.includes('Validator')) {
        commonUtils.validator.push(file)
      }
    }

    // 统计重复
    for (const [type, files] of Object.entries(commonUtils)) {
      if (files.length > 1) {
        this.results.duplicates += files.length - 1
        console.log(`  发现 ${files.length} 个重复的 ${type} 实现`)
      }
    }
  }

  private async optimizePackageStructure() {
    console.log('📦 优化包结构...')
    
    // 分析包依赖
    const packages = globSync('packages/*/package.json')
    const dependencies = new Map<string, Set<string>>()
    
    for (const pkg of packages) {
      const content = JSON.parse(fs.readFileSync(pkg, 'utf-8'))
      const pkgName = content.name
      const deps = new Set<string>()
      
      // 收集所有依赖
      for (const dep of Object.keys(content.dependencies || {})) {
        if (dep.startsWith('@ldesign/')) {
          deps.add(dep)
        }
      }
      
      dependencies.set(pkgName, deps)
    }
    
    // 检查循环依赖
    for (const [pkg, deps] of dependencies) {
      for (const dep of deps) {
        const depDeps = dependencies.get(dep)
        if (depDeps?.has(pkg)) {
          console.log(`  ⚠️ 循环依赖: ${pkg} <-> ${dep}`)
        }
      }
    }
  }

  private generateReport() {
    console.log('\n📊 优化报告:')
    console.log('─'.repeat(50))
    console.log(`✅ 处理文件数: ${this.results.filesProcessed}`)
    console.log(`🗑️ 删除 console.log/debug: ${this.results.consoleLogs}`)
    console.log(`🐛 删除 debugger: ${this.results.debuggers}`)
    console.log(`📝 发现 TODO/FIXME/HACK: ${this.results.todos}`)
    console.log(`♻️ 发现重复代码: ${this.results.duplicates} 处`)
    console.log(`📦 删除无用导入: ${this.results.unusedImports}`)
    console.log('─'.repeat(50))
    
    // 生成详细报告文件
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      recommendations: [
        '1. 将重复的工具函数提取到 @ldesign/shared 包',
        '2. 合并 http 和 api 包的功能',
        '3. 统一日志和错误处理机制',
        '4. 实现统一的缓存策略',
        '5. 清理所有 TODO/FIXME 注释'
      ]
    }
    
    fs.writeFileSync(
      'OPTIMIZATION_REPORT.json',
      JSON.stringify(report, null, 2),
      'utf-8'
    )
    
    console.log('\n📄 详细报告已保存到 OPTIMIZATION_REPORT.json')
  }
}

// 执行优化
const optimizer = new DeepOptimizer()
optimizer.optimize().catch(console.error)