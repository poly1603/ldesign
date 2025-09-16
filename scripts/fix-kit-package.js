#!/usr/bin/env node

/**
 * @ldesign/kit 包修复工具
 * 
 * 功能：
 * - 简化复杂的 tsup 配置
 * - 修复构建失败问题
 * - 优化构建性能
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

class KitPackageFixer {
  constructor() {
    this.kitPath = 'packages/kit'
    this.results = {
      fixed: [],
      errors: []
    }
  }

  /**
   * 修复 kit 包问题
   */
  async fixKitPackage() {
    console.log('🔧 开始修复 @ldesign/kit 包...')
    
    try {
      // 1. 简化 tsup 配置
      await this.simplifyTsupConfig()
      
      // 2. 修复 package.json 脚本
      await this.fixPackageScripts()
      
      // 3. 检查依赖
      await this.checkDependencies()
      
      console.log('✅ @ldesign/kit 包修复完成！')
      this.printSummary()
      
    } catch (error) {
      console.error('❌ 修复失败:', error.message)
      this.results.errors.push(error.message)
    }
  }

  /**
   * 简化 tsup 配置
   */
  async simplifyTsupConfig() {
    const configPath = join(this.kitPath, 'tsup.config.ts')
    
    if (!existsSync(configPath)) {
      throw new Error('tsup.config.ts 不存在')
    }
    
    console.log('🔧 简化 tsup 配置...')
    
    // 创建简化的配置
    const simplifiedConfig = `/**
 * @ldesign/kit 简化构建配置
 * 
 * 为了解决复杂构建问题，暂时使用简化配置
 * 只构建主入口文件，子模块通过主入口导出
 */

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: 'es2020',
  platform: 'node',
  external: [
    // Node.js 内置模块
    'fs',
    'path',
    'crypto',
    'os',
    'child_process',
    'util',
    'stream',
    'events',
    'url',
    'buffer',
    'zlib',
    'http',
    'https',
    'net',
    'tls',
    'readline',
    'perf_hooks',
    'worker_threads',
    'cluster',
    'dgram',
    'dns',
    'timers',
    // 第三方依赖
    'chalk',
    'ora',
    'prompts',
    'figlet',
    'chalk-animation',
    'cli-progress',
    'node-notifier',
    'simple-git',
    'glob',
    'archiver',
    'tar',
    'yauzl',
    'form-data',
    'node-fetch',
    'ws',
    'svg2ttf',
    'ttf2eot',
    'ttf2woff',
    'ttf2woff2',
    'svgicons2svgfont',
    'cac',
    'rimraf',
    'jiti',
    'json5'
  ],
  onSuccess: async () => {
    console.log('✅ @ldesign/kit 构建成功')
  }
})
`
    
    // 备份原配置
    const originalConfig = readFileSync(configPath, 'utf8')
    writeFileSync(configPath + '.backup', originalConfig)
    
    // 写入简化配置
    writeFileSync(configPath, simplifiedConfig)
    
    console.log('  ✅ tsup 配置已简化')
    this.results.fixed.push('tsup 配置简化')
  }

  /**
   * 修复 package.json 脚本
   */
  async fixPackageScripts() {
    const packageJsonPath = join(this.kitPath, 'package.json')
    
    if (!existsSync(packageJsonPath)) {
      throw new Error('package.json 不存在')
    }
    
    console.log('🔧 修复 package.json 脚本...')
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    
    // 简化构建脚本
    if (packageJson.scripts) {
      // 使用标准的构建命令
      packageJson.scripts.build = 'tsup'
      packageJson.scripts['build:watch'] = 'tsup --watch'
      
      // 确保有清理脚本
      if (!packageJson.scripts.clean) {
        packageJson.scripts.clean = 'rimraf dist eslib types coverage .nyc_output'
      }
      
      // 确保有标准测试脚本
      if (!packageJson.scripts.test) {
        packageJson.scripts.test = 'vitest'
      }
      
      if (!packageJson.scripts['test:run']) {
        packageJson.scripts['test:run'] = 'vitest run'
      }
    }
    
    // 写回文件
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
    
    console.log('  ✅ package.json 脚本已修复')
    this.results.fixed.push('package.json 脚本修复')
  }

  /**
   * 检查依赖
   */
  async checkDependencies() {
    const packageJsonPath = join(this.kitPath, 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    
    console.log('🔧 检查依赖...')
    
    // 检查是否有必要的依赖
    const requiredDeps = ['tsup', '@ldesign/shared']
    const missingDeps = []
    
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
        missingDeps.push(dep)
      }
    }
    
    if (missingDeps.length > 0) {
      console.log(`  ⚠️ 缺少依赖: ${missingDeps.join(', ')}`)
      
      // 添加缺少的依赖
      if (!packageJson.dependencies) {
        packageJson.dependencies = {}
      }
      
      for (const dep of missingDeps) {
        if (dep === '@ldesign/shared') {
          packageJson.dependencies[dep] = 'workspace:*'
        } else {
          packageJson.devDependencies = packageJson.devDependencies || {}
          packageJson.devDependencies[dep] = '^8.5.0'
        }
      }
      
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
      console.log('  ✅ 已添加缺少的依赖')
      this.results.fixed.push('依赖修复')
    } else {
      console.log('  ✅ 依赖检查通过')
    }
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
    console.log('   2. 如果构建成功，可以恢复其他包的构建')
    console.log('   3. 如果需要恢复原配置，使用 tsup.config.ts.backup 文件')
  }
}

// 运行修复
const fixer = new KitPackageFixer()
fixer.fixKitPackage().catch(console.error)
