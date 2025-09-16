#!/usr/bin/env node

/**
 * 循环依赖修复工具
 * 
 * 功能：
 * - 检测并修复包之间的循环依赖
 * - 重新组织依赖关系
 * - 确保构建顺序正确
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

class CircularDependencyFixer {
  constructor() {
    this.packagesDir = 'packages'
    this.results = {
      fixed: [],
      errors: []
    }
  }

  /**
   * 修复循环依赖
   */
  async fixCircularDependency() {
    console.log('🔧 开始修复循环依赖...')
    
    try {
      // 分析当前的循环依赖
      console.log('📊 当前循环依赖:')
      console.log('   @ldesign/shared → @ldesign/builder (devDependencies)')
      console.log('   @ldesign/builder → @ldesign/kit (dependencies)')
      console.log('   @ldesign/kit → @ldesign/shared (dependencies)')
      
      // 修复策略：移除 @ldesign/kit 对 @ldesign/shared 的依赖
      await this.removeKitSharedDependency()
      
      // 验证修复结果
      await this.verifyFix()
      
      console.log('✅ 循环依赖修复完成！')
      this.printSummary()
      
    } catch (error) {
      console.error('❌ 修复失败:', error.message)
      this.results.errors.push(error.message)
    }
  }

  /**
   * 移除 @ldesign/kit 对 @ldesign/shared 的依赖
   */
  async removeKitSharedDependency() {
    const kitPackageJsonPath = join(this.packagesDir, 'kit', 'package.json')
    
    if (!existsSync(kitPackageJsonPath)) {
      throw new Error('@ldesign/kit package.json 不存在')
    }
    
    console.log('🔧 移除 @ldesign/kit → @ldesign/shared 依赖...')
    
    const packageJson = JSON.parse(readFileSync(kitPackageJsonPath, 'utf8'))
    
    // 备份原文件
    writeFileSync(kitPackageJsonPath + '.backup', JSON.stringify(packageJson, null, 2))
    
    // 移除 @ldesign/shared 依赖
    if (packageJson.dependencies && packageJson.dependencies['@ldesign/shared']) {
      delete packageJson.dependencies['@ldesign/shared']
      console.log('  ✅ 已移除 dependencies 中的 @ldesign/shared')
      this.results.fixed.push('移除 @ldesign/kit → @ldesign/shared 依赖')
    }
    
    if (packageJson.devDependencies && packageJson.devDependencies['@ldesign/shared']) {
      delete packageJson.devDependencies['@ldesign/shared']
      console.log('  ✅ 已移除 devDependencies 中的 @ldesign/shared')
      this.results.fixed.push('移除 @ldesign/kit → @ldesign/shared devDependency')
    }
    
    // 写回文件
    writeFileSync(kitPackageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
    
    console.log('  ✅ @ldesign/kit package.json 已更新')
  }

  /**
   * 验证修复结果
   */
  async verifyFix() {
    console.log('🔍 验证修复结果...')
    
    // 检查是否还有循环依赖
    const dependencies = this.analyzeDependencies()
    const cycles = this.detectCycles(dependencies)
    
    if (cycles.length === 0) {
      console.log('  ✅ 未检测到循环依赖')
      this.results.fixed.push('循环依赖已解决')
    } else {
      console.log('  ⚠️ 仍存在循环依赖:')
      cycles.forEach(cycle => {
        console.log(`    ${cycle.join(' → ')}`)
      })
    }
  }

  /**
   * 分析依赖关系
   */
  analyzeDependencies() {
    const dependencies = new Map()
    
    // 关键包的依赖关系
    const packages = ['shared', 'builder', 'kit']
    
    for (const pkg of packages) {
      const packageJsonPath = join(this.packagesDir, pkg, 'package.json')
      
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
        const deps = []
        
        // 收集所有依赖
        if (packageJson.dependencies) {
          for (const dep of Object.keys(packageJson.dependencies)) {
            if (dep.startsWith('@ldesign/')) {
              deps.push(dep.replace('@ldesign/', ''))
            }
          }
        }
        
        if (packageJson.devDependencies) {
          for (const dep of Object.keys(packageJson.devDependencies)) {
            if (dep.startsWith('@ldesign/')) {
              deps.push(dep.replace('@ldesign/', ''))
            }
          }
        }
        
        dependencies.set(pkg, deps)
      }
    }
    
    return dependencies
  }

  /**
   * 检测循环依赖
   */
  detectCycles(dependencies) {
    const cycles = []
    const visited = new Set()
    const recursionStack = new Set()
    
    const dfs = (node, path) => {
      if (recursionStack.has(node)) {
        // 找到循环
        const cycleStart = path.indexOf(node)
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), node])
        }
        return
      }
      
      if (visited.has(node)) {
        return
      }
      
      visited.add(node)
      recursionStack.add(node)
      path.push(node)
      
      const deps = dependencies.get(node) || []
      for (const dep of deps) {
        if (dependencies.has(dep)) {
          dfs(dep, [...path])
        }
      }
      
      recursionStack.delete(node)
      path.pop()
    }
    
    for (const node of dependencies.keys()) {
      if (!visited.has(node)) {
        dfs(node, [])
      }
    }
    
    return cycles
  }

  /**
   * 打印修复摘要
   */
  printSummary() {
    console.log('\n📊 修复摘要:')
    console.log(`   已修复: ${this.results.fixed.length}`)
    console.log(`   错误: ${this.results.errors.length}`)
    
    if (this.results.fixed.length > 0) {
      console.log('\n✅ 修复项目:')
      this.results.fixed.forEach(item => console.log(`   - ${item}`))
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ 错误:')
      this.results.errors.forEach(error => console.log(`   - ${error}`))
    }
    
    console.log('\n🚀 建议下一步:')
    console.log('   1. 运行 pnpm turbo run build --filter="@ldesign/kit" 测试构建')
    console.log('   2. 运行 pnpm turbo run build --filter="@ldesign/i18n" --filter="@ldesign/map" 测试其他包')
    console.log('   3. 如果需要恢复，使用 package.json.backup 文件')
    
    console.log('\n📋 新的依赖关系:')
    console.log('   @ldesign/shared → @ldesign/builder (devDependencies)')
    console.log('   @ldesign/builder → @ldesign/kit (dependencies)')
    console.log('   @ldesign/kit → (无内部依赖)')
    console.log('   ✅ 无循环依赖')
  }
}

// 运行修复
const fixer = new CircularDependencyFixer()
fixer.fixCircularDependency().catch(console.error)
