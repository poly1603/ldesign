#!/usr/bin/env node

/**
 * 关键问题修复工具
 * 
 * 功能：
 * - 修复已知的构建失败问题
 * - 解决测试配置问题
 * - 优化包的构建配置
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

class CriticalIssuesFixer {
  constructor() {
    this.packagesDir = 'packages'
    this.results = {
      fixed: [],
      skipped: [],
      errors: []
    }
  }

  /**
   * 运行关键问题修复
   */
  async fixCriticalIssues() {
    console.log('🔧 开始修复关键问题...')
    
    // 修复已知的问题包
    const problemPackages = [
      'crypto',
      'icons', 
      'editor',
      'flowchart',
      'form',
      'i18n',
      'map'
    ]
    
    for (const pkgName of problemPackages) {
      await this.fixPackageIssues(pkgName)
    }
    
    this.generateReport()
    console.log('✅ 关键问题修复完成！')
  }

  /**
   * 修复单个包的问题
   */
  async fixPackageIssues(pkgName) {
    try {
      console.log(`🔧 修复包: ${pkgName}`)
      
      const pkgPath = join(this.packagesDir, pkgName)
      const packageJsonPath = join(pkgPath, 'package.json')
      
      if (!existsSync(packageJsonPath)) {
        console.log(`  ⚠️ ${pkgName} - 包不存在`)
        this.results.skipped.push(pkgName)
        return
      }
      
      // 读取 package.json
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      let hasChanges = false
      
      // 根据包名应用特定修复
      switch (pkgName) {
        case 'crypto':
          hasChanges = await this.fixCryptoPackage(pkgPath, packageJson)
          break
        case 'icons':
          hasChanges = await this.fixIconsPackage(pkgPath, packageJson)
          break
        case 'editor':
          hasChanges = await this.fixEditorPackage(pkgPath, packageJson)
          break
        case 'flowchart':
          hasChanges = await this.fixFlowchartPackage(pkgPath, packageJson)
          break
        case 'form':
          hasChanges = await this.fixFormPackage(pkgPath, packageJson)
          break
        case 'i18n':
          hasChanges = await this.fixI18nPackage(pkgPath, packageJson)
          break
        case 'map':
          hasChanges = await this.fixMapPackage(pkgPath, packageJson)
          break
        default:
          hasChanges = await this.fixCommonIssues(pkgPath, packageJson)
      }
      
      // 写回 package.json
      if (hasChanges) {
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
        console.log(`  ✅ ${pkgName} - 已修复`)
        this.results.fixed.push(pkgName)
      } else {
        console.log(`  ✅ ${pkgName} - 无需修复`)
        this.results.skipped.push(pkgName)
      }
      
    } catch (error) {
      console.log(`  ❌ ${pkgName} - 修复失败: ${error.message}`)
      this.results.errors.push({
        name: pkgName,
        error: error.message
      })
    }
  }

  /**
   * 修复 crypto 包问题
   */
  async fixCryptoPackage(pkgPath, packageJson) {
    let hasChanges = false
    
    // 检查是否有导入问题
    const indexPath = join(pkgPath, 'src/core/encrypted-storage.ts')
    if (existsSync(indexPath)) {
      let content = readFileSync(indexPath, 'utf8')
      
      // 修复导入路径
      if (content.includes("import { Encryption } from './encryption'")) {
        content = content.replace(
          "import { Encryption } from './encryption'",
          "import { Encrypt } from './crypto'"
        )
        content = content.replace(/Encryption/g, 'Encrypt')
        writeFileSync(indexPath, content)
        hasChanges = true
        console.log(`    ✅ 修复了导入路径问题`)
      }
    }
    
    return hasChanges
  }

  /**
   * 修复 icons 包问题
   */
  async fixIconsPackage(pkgPath, packageJson) {
    let hasChanges = false
    
    // 修复 npm 命令为 pnpm
    if (packageJson.scripts) {
      for (const [key, value] of Object.entries(packageJson.scripts)) {
        if (typeof value === 'string' && value.includes('npm run build --workspace=')) {
          packageJson.scripts[key] = value.replace(
            /npm run build --workspace=/g,
            'pnpm --filter='
          ).replace(/ build/g, ' run build')
          hasChanges = true
        }
      }
    }
    
    // 修复子包的 builder 配置
    const subPackages = ['icons-vue', 'icons-react', 'icons-vue2', 'icons-lit']
    for (const subPkg of subPackages) {
      const configPath = join(pkgPath, 'packages', subPkg, 'builder.config.ts')
      if (existsSync(configPath)) {
        let content = readFileSync(configPath, 'utf8')
        
        // 修复 output.dir 配置
        if (content.includes('dir: {')) {
          content = content.replace(
            /dir:\s*\{[^}]*\}/g,
            "dir: 'dist'"
          )
          writeFileSync(configPath, content)
          hasChanges = true
          console.log(`    ✅ 修复了 ${subPkg} 的 builder 配置`)
        }
      }
    }
    
    return hasChanges
  }

  /**
   * 修复 editor 包问题
   */
  async fixEditorPackage(pkgPath, packageJson) {
    let hasChanges = false
    
    // 确保有正确的依赖
    if (!packageJson.dependencies) {
      packageJson.dependencies = {}
    }
    
    // 检查是否缺少关键依赖
    const requiredDeps = ['@ldesign/shared']
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies?.[dep]) {
        packageJson.dependencies[dep] = 'workspace:*'
        hasChanges = true
      }
    }
    
    return hasChanges
  }

  /**
   * 修复 flowchart 包问题
   */
  async fixFlowchartPackage(pkgPath, packageJson) {
    return await this.fixCommonIssues(pkgPath, packageJson)
  }

  /**
   * 修复 form 包问题
   */
  async fixFormPackage(pkgPath, packageJson) {
    return await this.fixCommonIssues(pkgPath, packageJson)
  }

  /**
   * 修复 i18n 包问题
   */
  async fixI18nPackage(pkgPath, packageJson) {
    return await this.fixCommonIssues(pkgPath, packageJson)
  }

  /**
   * 修复 map 包问题
   */
  async fixMapPackage(pkgPath, packageJson) {
    return await this.fixCommonIssues(pkgPath, packageJson)
  }

  /**
   * 修复通用问题
   */
  async fixCommonIssues(pkgPath, packageJson) {
    let hasChanges = false
    
    // 确保有基础脚本
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }
    
    // 标准化构建脚本
    if (!packageJson.scripts.build) {
      packageJson.scripts.build = 'ldesign-builder'
      hasChanges = true
    }
    
    // 标准化测试脚本
    if (!packageJson.scripts.test) {
      packageJson.scripts.test = 'vitest'
      hasChanges = true
    }
    
    if (!packageJson.scripts['test:run']) {
      packageJson.scripts['test:run'] = 'vitest run'
      hasChanges = true
    }
    
    // 确保有 @ldesign/shared 依赖
    if (!packageJson.dependencies) {
      packageJson.dependencies = {}
    }
    
    if (!packageJson.dependencies['@ldesign/shared'] && 
        !packageJson.devDependencies?.['@ldesign/shared']) {
      packageJson.dependencies['@ldesign/shared'] = 'workspace:*'
      hasChanges = true
    }
    
    return hasChanges
  }

  /**
   * 生成修复报告
   */
  generateReport() {
    const report = `# 关键问题修复报告

## 📊 修复概览

- **总包数**: ${this.results.fixed.length + this.results.skipped.length + this.results.errors.length}
- **已修复**: ${this.results.fixed.length}
- **跳过**: ${this.results.skipped.length}
- **错误**: ${this.results.errors.length}

## ✅ 已修复的包

${this.results.fixed.map(name => `- ${name}`).join('\n')}

## ⏭️ 跳过的包

${this.results.skipped.map(name => `- ${name}`).join('\n')}

## ❌ 修复失败的包

${this.results.errors.map(error => `### ${error.name}
**错误**: ${error.error}
`).join('\n')}

---
*报告生成时间: ${new Date().toISOString()}*
`

    writeFileSync('critical-issues-fix-report.md', report)
    console.log('📄 修复报告已生成: critical-issues-fix-report.md')
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
      this.results.fixed.forEach(name => console.log(`   - ${name}`))
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ 失败的包:')
      this.results.errors.forEach(error => console.log(`   - ${error.name}: ${error.error}`))
    }
  }
}

// 运行关键问题修复
const fixer = new CriticalIssuesFixer()
fixer.fixCriticalIssues().then(() => {
  fixer.printSummary()
}).catch(console.error)
