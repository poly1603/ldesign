#!/usr/bin/env node
/**
 * 构建所有包的脚本
 *
 * 功能：
 * 1. 自动发现所有包
 * 2. 使用增强构建管理器构建每个包
 * 3. 生成总体构建报告
 * 4. 支持并行构建和错误处理
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EnhancedBuildManager } from './enhanced-build-manager.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * 所有包构建管理器
 */
class AllPackagesBuildManager {
  constructor(options = {}) {
    this.options = {
      parallel: false,
      skipValidation: false,
      skipWebTest: true, // 默认跳过 Web 测试以加快构建
      skipTypeCheck: false,
      autoFix: true,
      verbose: false,
      packagesDir: resolve(__dirname, '../../packages'),
      ...options,
    }
    this.results = []
    this.startTime = Date.now()
  }

  /**
   * 发现所有包
   */
  discoverPackages() {
    const packagesDir = this.options.packagesDir
    if (!existsSync(packagesDir)) {
      throw new Error(`Packages directory not found: ${packagesDir}`)
    }

    const packages = []
    const entries = readdirSync(packagesDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const packageDir = resolve(packagesDir, entry.name)
        const packageJsonPath = resolve(packageDir, 'package.json')

        if (existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(
              readFileSync(packageJsonPath, 'utf-8'),
            )
            packages.push({
              name: packageJson.name || entry.name,
              path: packageDir,
              packageJson,
            })
          }
          catch (error) {
            console.warn(`⚠️  跳过无效的 package.json: ${packageJsonPath}`)
          }
        }
      }
    }

    return packages
  }

  /**
   * 构建所有包
   */
  async buildAllPackages() {
    const packages = this.discoverPackages()

    console.log('🚀 开始构建所有包')
    console.log('='.repeat(80))
    console.log(`📦 发现 ${packages.length} 个包:`)
    packages.forEach(pkg => console.log(`  • ${pkg.name}`))
    console.log('='.repeat(80))

    if (this.options.parallel) {
      await this.buildPackagesInParallel(packages)
    }
    else {
      await this.buildPackagesSequentially(packages)
    }

    return this.generateFinalReport()
  }

  /**
   * 顺序构建包
   */
  async buildPackagesSequentially(packages) {
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i]
      console.log(`\n[${i + 1}/${packages.length}] 构建包: ${pkg.name}`)

      try {
        const result = await this.buildSinglePackage(pkg)
        this.results.push(result)
      }
      catch (error) {
        this.results.push({
          success: false,
          packageName: pkg.name,
          error: error.message,
          results: null,
        })

        if (!this.options.continueOnError) {
          throw error
        }
      }
    }
  }

  /**
   * 并行构建包
   */
  async buildPackagesInParallel(packages) {
    console.log('🔄 使用并行构建模式...')

    const buildPromises = packages.map(async (pkg, index) => {
      try {
        console.log(`[${index + 1}/${packages.length}] 开始构建: ${pkg.name}`)
        const result = await this.buildSinglePackage(pkg)
        console.log(`[${index + 1}/${packages.length}] ✅ 完成: ${pkg.name}`)
        return result
      }
      catch (error) {
        console.log(`[${index + 1}/${packages.length}] ❌ 失败: ${pkg.name}`)
        return {
          success: false,
          packageName: pkg.name,
          error: error.message,
          results: null,
        }
      }
    })

    this.results = await Promise.all(buildPromises)
  }

  /**
   * 构建单个包
   */
  async buildSinglePackage(pkg) {
    const manager = new EnhancedBuildManager({
      skipValidation: this.options.skipValidation,
      skipWebTest: this.options.skipWebTest,
      skipTypeCheck: this.options.skipTypeCheck,
      autoFix: this.options.autoFix,
      verbose: this.options.verbose,
    })

    return await manager.buildPackage(pkg.path)
  }

  /**
   * 生成最终报告
   */
  generateFinalReport() {
    const endTime = Date.now()
    const totalTime = endTime - this.startTime

    const successful = this.results.filter(r => r.success)
    const failed = this.results.filter(r => !r.success)

    console.log('\n📊 构建总结报告')
    console.log('='.repeat(80))
    console.log(`⏱️  总耗时: ${this.formatTime(totalTime)}`)
    console.log(`✅ 成功: ${successful.length} 个包`)
    console.log(`❌ 失败: ${failed.length} 个包`)
    console.log('='.repeat(80))

    if (successful.length > 0) {
      console.log('\n✅ 构建成功的包:')
      successful.forEach((result) => {
        console.log(`  • ${result.packageName}`)
      })
    }

    if (failed.length > 0) {
      console.log('\n❌ 构建失败的包:')
      failed.forEach((result) => {
        console.log(`  • ${result.packageName}: ${result.error}`)
      })
    }

    // 详细统计
    if (successful.length > 0) {
      console.log('\n📈 详细统计:')

      const validationResults = successful.filter(r => r.results?.validation)
      const typeCheckResults = successful.filter(r => r.results?.typeCheck)
      const webTestResults = successful.filter(r => r.results?.webTest)

      console.log(
        `  📋 构建产物校验: ${validationResults.length}/${successful.length} 通过`,
      )
      console.log(
        `  🔷 TypeScript 检查: ${typeCheckResults.length}/${successful.length} 通过`,
      )
      console.log(
        `  🌐 Web 端测试: ${webTestResults.length}/${successful.length} 通过`,
      )
    }

    console.log('='.repeat(80))

    if (failed.length === 0) {
      console.log('🎉 所有包构建成功！')
    }
    else {
      console.log(`⚠️  ${failed.length} 个包构建失败，请查看上述错误信息`)
    }

    return {
      success: failed.length === 0,
      totalTime,
      successful: successful.length,
      failed: failed.length,
      results: this.results,
    }
  }

  /**
   * 格式化时间
   */
  formatTime(ms) {
    if (ms < 1000)
      return `${ms}ms`
    if (ms < 60000)
      return `${(ms / 1000).toFixed(1)}s`
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
  }
}

/**
 * 命令行入口
 */
export async function buildAllPackages(options = {}) {
  try {
    const manager = new AllPackagesBuildManager(options)
    const result = await manager.buildAllPackages()

    if (!result.success) {
      process.exit(1)
    }

    return result
  }
  catch (error) {
    console.error('❌ 构建所有包失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此文件
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  const options = {
    parallel: process.argv.includes('--parallel'),
    skipValidation: process.argv.includes('--skip-validation'),
    skipWebTest: process.argv.includes('--skip-web-test'),
    skipTypeCheck: process.argv.includes('--skip-type-check'),
    autoFix: !process.argv.includes('--no-auto-fix'),
    verbose: process.argv.includes('--verbose'),
    continueOnError: process.argv.includes('--continue-on-error'),
  }

  buildAllPackages(options)
}
