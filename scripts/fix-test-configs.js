#!/usr/bin/env node

/**
 * 测试配置修复工具
 * 
 * 功能：
 * - 统一所有包的测试脚本配置
 * - 修复测试环境问题
 * - 确保所有包都有正确的测试配置
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

class TestConfigFixer {
  constructor() {
    this.packagesDir = 'packages'
    this.results = {
      fixed: [],
      skipped: [],
      errors: []
    }
  }

  /**
   * 运行测试配置修复
   */
  async fixTestConfigs() {
    console.log('🔧 开始修复测试配置...')
    
    const packages = this.getAllPackages()
    console.log(`📦 发现 ${packages.length} 个包`)
    
    for (const pkg of packages) {
      await this.fixPackageTestConfig(pkg)
    }
    
    this.generateReport()
    console.log('✅ 测试配置修复完成！')
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
        packages.push({
          name: dir,
          path: join(this.packagesDir, dir),
          packageJsonPath
        })
      }
    }
    
    return packages
  }

  /**
   * 修复单个包的测试配置
   */
  async fixPackageTestConfig(pkg) {
    try {
      console.log(`🔧 修复包: ${pkg.name}`)
      
      // 读取 package.json
      const packageJson = JSON.parse(readFileSync(pkg.packageJsonPath, 'utf8'))
      
      // 检查是否需要修复
      const needsFix = this.needsTestConfigFix(packageJson)
      
      if (!needsFix) {
        console.log(`  ✅ ${pkg.name} - 配置已正确`)
        this.results.skipped.push(pkg.name)
        return
      }
      
      // 修复测试脚本
      const originalScripts = { ...packageJson.scripts }
      this.fixTestScripts(packageJson)
      
      // 确保有 vitest 配置
      await this.ensureVitestConfig(pkg)
      
      // 写回 package.json
      writeFileSync(pkg.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
      
      console.log(`  ✅ ${pkg.name} - 已修复`)
      this.results.fixed.push({
        name: pkg.name,
        changes: this.getChanges(originalScripts, packageJson.scripts)
      })
      
    } catch (error) {
      console.log(`  ❌ ${pkg.name} - 修复失败: ${error.message}`)
      this.results.errors.push({
        name: pkg.name,
        error: error.message
      })
    }
  }

  /**
   * 检查是否需要修复测试配置
   */
  needsTestConfigFix(packageJson) {
    const scripts = packageJson.scripts || {}
    
    // 检查必需的测试脚本
    const requiredScripts = ['test', 'test:run']
    const hasAllRequired = requiredScripts.every(script => scripts[script])
    
    if (!hasAllRequired) return true
    
    // 检查脚本内容是否正确
    if (scripts.test && !scripts.test.includes('vitest')) return true
    if (scripts['test:run'] && !scripts['test:run'].includes('vitest run')) return true
    
    return false
  }

  /**
   * 修复测试脚本
   */
  fixTestScripts(packageJson) {
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }
    
    const scripts = packageJson.scripts
    
    // 标准化测试脚本
    scripts.test = 'vitest'
    scripts['test:run'] = 'vitest run'
    scripts['test:watch'] = 'vitest --watch'
    scripts['test:coverage'] = 'vitest run --coverage'
    scripts['test:ui'] = 'vitest --ui'
    
    // 如果没有 lint 脚本，添加基础的
    if (!scripts.lint) {
      scripts.lint = 'eslint . --ext .ts,.tsx,.vue,.js,.jsx'
    }
    
    if (!scripts['lint:fix']) {
      scripts['lint:fix'] = 'eslint . --ext .ts,.tsx,.vue,.js,.jsx --fix'
    }
    
    // 如果没有 type-check 脚本，添加
    if (!scripts['type-check']) {
      scripts['type-check'] = 'tsc --noEmit'
    }
  }

  /**
   * 确保有 vitest 配置文件
   */
  async ensureVitestConfig(pkg) {
    const vitestConfigPath = join(pkg.path, 'vitest.config.ts')
    
    if (!existsSync(vitestConfigPath)) {
      const vitestConfig = `import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts']
  }
})
`
      writeFileSync(vitestConfigPath, vitestConfig)
      console.log(`    ✅ 创建了 vitest.config.ts`)
    }
    
    // 确保有测试设置文件
    const testDir = join(pkg.path, 'test')
    const setupPath = join(testDir, 'setup.ts')
    
    if (!existsSync(setupPath)) {
      // 创建基础的测试设置文件
      const setupContent = `// Test setup file
import { vi } from 'vitest'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
`
      
      // 确保目录存在
      if (!existsSync(testDir)) {
        const { mkdirSync } = await import('fs')
        mkdirSync(testDir, { recursive: true })
      }
      
      writeFileSync(setupPath, setupContent)
      console.log(`    ✅ 创建了 test/setup.ts`)
    }
  }

  /**
   * 获取变更信息
   */
  getChanges(oldScripts, newScripts) {
    const changes = []
    
    for (const [key, value] of Object.entries(newScripts)) {
      if (!oldScripts[key]) {
        changes.push(`+ ${key}: ${value}`)
      } else if (oldScripts[key] !== value) {
        changes.push(`~ ${key}: ${oldScripts[key]} → ${value}`)
      }
    }
    
    return changes
  }

  /**
   * 生成修复报告
   */
  generateReport() {
    const report = `# 测试配置修复报告

## 📊 修复概览

- **总包数**: ${this.results.fixed.length + this.results.skipped.length + this.results.errors.length}
- **已修复**: ${this.results.fixed.length}
- **跳过**: ${this.results.skipped.length}
- **错误**: ${this.results.errors.length}

## ✅ 已修复的包

${this.results.fixed.map(pkg => `### ${pkg.name}

**变更内容:**
${pkg.changes.map(change => `- ${change}`).join('\n')}
`).join('\n')}

## ⏭️ 跳过的包

${this.results.skipped.map(name => `- ${name} (配置已正确)`).join('\n')}

## ❌ 修复失败的包

${this.results.errors.map(error => `### ${error.name}
**错误**: ${error.error}
`).join('\n')}

## 🚀 标准化的测试脚本

所有包现在都包含以下标准测试脚本：

\`\`\`json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "lint": "eslint . --ext .ts,.tsx,.vue,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.vue,.js,.jsx --fix",
    "type-check": "tsc --noEmit"
  }
}
\`\`\`

## 📁 创建的配置文件

- **vitest.config.ts** - Vitest 配置文件
- **test/setup.ts** - 测试环境设置文件

---
*报告生成时间: ${new Date().toISOString()}*
`

    writeFileSync('test-config-fix-report.md', report)
    console.log('📄 修复报告已生成: test-config-fix-report.md')
  }

  /**
   * 打印修复摘要
   */
  printSummary() {
    console.log('\n📊 修复摘要:')
    console.log(`   已修复: ${this.results.fixed.length}`)
    console.log(`   跳过: ${this.results.skipped.length}`)
    console.log(`   错误: ${this.results.errors.length}`)
    
    if (this.results.fixed.length > 0) {
      console.log('\n✅ 修复的包:')
      this.results.fixed.forEach(pkg => console.log(`   - ${pkg.name}`))
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ 失败的包:')
      this.results.errors.forEach(error => console.log(`   - ${error.name}: ${error.error}`))
    }
  }
}

// 运行测试配置修复
const fixer = new TestConfigFixer()
fixer.fixTestConfigs().then(() => {
  fixer.printSummary()
}).catch(console.error)
