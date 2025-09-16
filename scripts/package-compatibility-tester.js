#!/usr/bin/env node

/**
 * 包兼容性测试工具
 * 
 * 功能：
 * - 系统性测试所有包的构建兼容性
 * - 诊断构建失败的具体原因
 * - 生成详细的兼容性报告
 * - 提供修复建议
 */

import { execSync } from 'child_process'
import { writeFileSync, readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

class PackageCompatibilityTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalPackages: 0,
      successfulBuilds: 0,
      failedBuilds: 0,
      packages: [],
      summary: {}
    }
    this.packagesDir = 'packages'
  }

  /**
   * 运行兼容性测试
   */
  async runCompatibilityTest() {
    console.log('🔍 开始包兼容性测试...')
    
    // 获取所有包
    const packages = this.getAllPackages()
    this.results.totalPackages = packages.length
    
    console.log(`📦 发现 ${packages.length} 个包`)
    
    // 按优先级排序包（基于依赖关系）
    const sortedPackages = this.sortPackagesByPriority(packages)
    
    // 逐个测试包
    for (const pkg of sortedPackages) {
      await this.testPackage(pkg)
    }
    
    // 生成报告
    this.generateReport()
    
    console.log('✅ 兼容性测试完成！')
    this.printSummary()
  }

  /**
   * 获取所有包
   */
  getAllPackages() {
    const packages = []
    const packageDirs = readdirSync(this.packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const dir of packageDirs) {
      const packageJsonPath = join(this.packagesDir, dir, 'package.json')
      
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
          packages.push({
            name: packageJson.name,
            version: packageJson.version,
            path: join(this.packagesDir, dir),
            scripts: packageJson.scripts || {},
            dependencies: packageJson.dependencies || {},
            devDependencies: packageJson.devDependencies || {}
          })
        } catch (error) {
          console.warn(`⚠️ 读取 ${packageJsonPath} 失败:`, error.message)
        }
      }
    }
    
    return packages
  }

  /**
   * 按优先级排序包
   */
  sortPackagesByPriority(packages) {
    // 基础包优先级最高
    const priorityOrder = [
      '@ldesign/shared',
      '@ldesign/builder', 
      '@ldesign/launcher',
      '@ldesign/color',
      '@ldesign/icons'
    ]
    
    const priorityPackages = []
    const regularPackages = []
    
    for (const pkg of packages) {
      const priority = priorityOrder.indexOf(pkg.name)
      if (priority !== -1) {
        priorityPackages[priority] = pkg
      } else {
        regularPackages.push(pkg)
      }
    }
    
    // 过滤掉 undefined 元素并合并
    return priorityPackages.filter(Boolean).concat(regularPackages)
  }

  /**
   * 测试单个包
   */
  async testPackage(pkg) {
    console.log(`\n🧪 测试包: ${pkg.name}`)
    
    const result = {
      name: pkg.name,
      version: pkg.version,
      path: pkg.path,
      buildSuccess: false,
      buildTime: 0,
      errors: [],
      warnings: [],
      hasTests: false,
      testSuccess: false,
      suggestions: []
    }

    // 检查是否有构建脚本
    if (!pkg.scripts.build) {
      result.errors.push('缺少 build 脚本')
      result.suggestions.push('添加 build 脚本到 package.json')
      this.results.packages.push(result)
      return
    }

    // 测试构建
    try {
      const startTime = Date.now()
      
      const output = execSync(
        `pnpm turbo run build --filter="${pkg.name}" --no-cache`,
        { 
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 120000 // 2分钟超时
        }
      )
      
      const endTime = Date.now()
      result.buildTime = (endTime - startTime) / 1000
      result.buildSuccess = true
      
      console.log(`  ✅ 构建成功 (${result.buildTime.toFixed(2)}s)`)
      this.results.successfulBuilds++
      
      // 分析输出中的警告
      this.analyzeWarnings(output, result)
      
    } catch (error) {
      result.buildSuccess = false
      result.errors.push(error.message)
      this.results.failedBuilds++
      
      console.log(`  ❌ 构建失败`)
      
      // 分析错误原因
      this.analyzeErrors(error, result)
    }

    // 检查测试
    if (pkg.scripts.test || pkg.scripts['test:run']) {
      result.hasTests = true
      try {
        execSync(
          `pnpm turbo run test:run --filter="${pkg.name}" --no-cache`,
          { stdio: 'pipe', timeout: 60000 }
        )
        result.testSuccess = true
        console.log(`  ✅ 测试通过`)
      } catch (error) {
        result.testSuccess = false
        result.errors.push(`测试失败: ${error.message}`)
        console.log(`  ❌ 测试失败`)
      }
    }

    this.results.packages.push(result)
  }

  /**
   * 分析构建警告
   */
  analyzeWarnings(output, result) {
    const lines = output.split('\n')
    
    for (const line of lines) {
      if (line.includes('WARNING') || line.includes('warning')) {
        result.warnings.push(line.trim())
      }
      
      // 检查常见警告模式
      if (line.includes('emitDecoratorMetadata')) {
        result.suggestions.push('考虑安装 @swc/core 以提升构建性能')
      }
      
      if (line.includes('named and default exports')) {
        result.suggestions.push('考虑使用 output.exports: "named" 配置')
      }
      
      if (line.includes('imported from external module') && line.includes('but never used')) {
        result.suggestions.push('清理未使用的导入以减少包大小')
      }
    }
  }

  /**
   * 分析构建错误
   */
  analyzeErrors(error, result) {
    const errorMessage = error.message || error.toString()
    
    // 模块解析错误
    if (errorMessage.includes('UNRESOLVED_IMPORT')) {
      result.suggestions.push('检查模块导入路径是否正确')
      result.suggestions.push('确保依赖包已正确安装')
    }
    
    // TypeScript 错误
    if (errorMessage.includes('TS')) {
      result.suggestions.push('修复 TypeScript 类型错误')
      result.suggestions.push('检查 tsconfig.json 配置')
    }
    
    // 依赖问题
    if (errorMessage.includes('Cannot resolve dependency')) {
      result.suggestions.push('检查 package.json 中的依赖声明')
      result.suggestions.push('运行 pnpm install 重新安装依赖')
    }
    
    // 配置问题
    if (errorMessage.includes('config')) {
      result.suggestions.push('检查构建配置文件（tsup.config.ts, rollup.config.js 等）')
    }
  }

  /**
   * 生成兼容性报告
   */
  generateReport() {
    const successRate = ((this.results.successfulBuilds / this.results.totalPackages) * 100).toFixed(2)
    
    const report = `# 包兼容性测试报告

## 📊 测试概览

- **测试时间**: ${this.results.timestamp}
- **总包数**: ${this.results.totalPackages}
- **构建成功**: ${this.results.successfulBuilds}
- **构建失败**: ${this.results.failedBuilds}
- **成功率**: ${successRate}%

## ✅ 构建成功的包

${this.results.packages
  .filter(pkg => pkg.buildSuccess)
  .map(pkg => `- **${pkg.name}** (${pkg.buildTime.toFixed(2)}s)${pkg.testSuccess ? ' 🧪' : ''}`)
  .join('\n')}

## ❌ 构建失败的包

${this.results.packages
  .filter(pkg => !pkg.buildSuccess)
  .map(pkg => `### ${pkg.name}

**错误信息:**
${pkg.errors.map(err => `- ${err}`).join('\n')}

**修复建议:**
${pkg.suggestions.map(sug => `- ${sug}`).join('\n')}
`).join('\n')}

## ⚠️ 警告信息

${this.results.packages
  .filter(pkg => pkg.warnings.length > 0)
  .map(pkg => `### ${pkg.name}
${pkg.warnings.map(warn => `- ${warn}`).join('\n')}
`).join('\n')}

## 🚀 优化建议

${this.generateOptimizationSuggestions()}

---
*报告生成时间: ${this.results.timestamp}*
`

    writeFileSync('package-compatibility-report.md', report)
    console.log('📄 兼容性报告已生成: package-compatibility-report.md')
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions() {
    const suggestions = []
    
    if (this.results.failedBuilds > 0) {
      suggestions.push('- 🔧 优先修复构建失败的包，它们可能影响其他包的构建')
    }
    
    const slowBuilds = this.results.packages.filter(pkg => pkg.buildTime > 30)
    if (slowBuilds.length > 0) {
      suggestions.push(`- ⚡ 优化构建较慢的包: ${slowBuilds.map(p => p.name).join(', ')}`)
    }
    
    const noTests = this.results.packages.filter(pkg => !pkg.hasTests)
    if (noTests.length > 0) {
      suggestions.push(`- 🧪 为以下包添加测试: ${noTests.map(p => p.name).join(', ')}`)
    }
    
    if (suggestions.length === 0) {
      suggestions.push('- ✅ 所有包构建正常，无需特别优化')
    }
    
    return suggestions.join('\n')
  }

  /**
   * 打印测试摘要
   */
  printSummary() {
    const successRate = ((this.results.successfulBuilds / this.results.totalPackages) * 100).toFixed(2)
    
    console.log('\n📊 测试摘要:')
    console.log(`   总包数: ${this.results.totalPackages}`)
    console.log(`   成功: ${this.results.successfulBuilds}`)
    console.log(`   失败: ${this.results.failedBuilds}`)
    console.log(`   成功率: ${successRate}%`)
    
    if (this.results.failedBuilds > 0) {
      console.log('\n❌ 失败的包:')
      this.results.packages
        .filter(pkg => !pkg.buildSuccess)
        .forEach(pkg => console.log(`   - ${pkg.name}`))
    }
  }
}

// 运行兼容性测试
const tester = new PackageCompatibilityTester()
tester.runCompatibilityTest().catch(console.error)
