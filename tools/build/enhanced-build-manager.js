#!/usr/bin/env node
/**
 * 增强构建管理器
 *
 * 功能：
 * 1. 统一管理所有包的构建流程
 * 2. 集成构建产物校验、Web 端测试、TypeScript 类型检查
 * 3. 提供详细的错误处理和用户反馈
 * 4. 支持自动修复可修复的问题
 */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BuildValidator } from './build-validator.js'
import { TypeScriptChecker } from './typescript-checker.js'
import { WebRuntimeTester } from './web-runtime-tester.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * 增强构建管理器
 */
export class EnhancedBuildManager {
  constructor(options = {}) {
    this.options = {
      skipValidation: false,
      skipWebTest: false,
      skipTypeCheck: false,
      autoFix: true,
      verbose: false,
      ...options,
    }
    this.results = {
      build: null,
      validation: null,
      webTest: null,
      typeCheck: null,
    }
  }

  /**
   * 构建单个包
   */
  async buildPackage(packageDir) {
    const packageJsonPath = resolve(packageDir, 'package.json')
    if (!existsSync(packageJsonPath)) {
      throw new Error(`package.json not found in ${packageDir}`)
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    console.log(`\n🚀 开始构建包: ${packageJson.name}`)
    console.log('='.repeat(60))

    try {
      // 1. 执行构建
      await this.runBuild(packageDir)

      // 2. 构建产物校验
      if (!this.options.skipValidation) {
        await this.runValidation(packageDir)
      }

      // 3. TypeScript 类型检查
      if (!this.options.skipTypeCheck) {
        await this.runTypeCheck(packageDir)
      }

      // 4. Web 端运行测试
      if (!this.options.skipWebTest) {
        await this.runWebTest(packageDir)
      }

      // 5. 生成最终报告
      return this.generateFinalReport(packageJson.name)
    }
    catch (error) {
      console.error(`❌ 构建失败: ${error.message}`)
      throw error
    }
  }

  /**
   * 执行构建
   */
  async runBuild(packageDir) {
    console.log('🔨 执行构建...')

    try {
      const result = await this.execCommand('pnpm', ['build'], packageDir)

      if (result.exitCode === 0) {
        console.log('✅ 构建完成')
        this.results.build = { success: true, message: '构建成功' }
      }
      else {
        throw new Error(`构建失败: ${result.stderr}`)
      }
    }
    catch (error) {
      this.results.build = { success: false, message: error.message }
      throw error
    }
  }

  /**
   * 运行构建产物校验
   */
  async runValidation(packageDir) {
    console.log('\n🔍 运行构建产物校验...')

    try {
      const validator = new BuildValidator(packageDir)
      const result = await validator.validate()

      this.results.validation = result

      if (!result.success && this.options.autoFix) {
        await this.attemptAutoFix(packageDir, result.errors)
      }

      if (!result.success) {
        throw new Error('构建产物校验失败')
      }
    }
    catch (error) {
      this.results.validation = { success: false, errors: [error.message] }
      throw error
    }
  }

  /**
   * 运行 TypeScript 类型检查
   */
  async runTypeCheck(packageDir) {
    console.log('\n🔷 运行 TypeScript 类型检查...')

    try {
      const checker = new TypeScriptChecker(packageDir)
      const result = await checker.check()

      this.results.typeCheck = result

      if (!result.success) {
        throw new Error('TypeScript 类型检查失败')
      }
    }
    catch (error) {
      this.results.typeCheck = { success: false, errors: [error.message] }
      throw error
    }
  }

  /**
   * 运行 Web 端测试
   */
  async runWebTest(packageDir) {
    console.log('\n🌐 运行 Web 端测试...')

    try {
      const tester = new WebRuntimeTester(packageDir)
      const result = await tester.runTests()

      this.results.webTest = result

      if (!result.success) {
        throw new Error('Web 端测试失败')
      }
    }
    catch (error) {
      this.results.webTest = { success: false, errors: [error.message] }
      throw error
    }
  }

  /**
   * 尝试自动修复问题
   */
  async attemptAutoFix(packageDir, errors) {
    console.log('🔧 尝试自动修复问题...')

    for (const error of errors) {
      if (error.includes('package.json')) {
        await this.fixPackageJsonExports(packageDir)
      }
      else if (error.includes('缺少构建产物文件')) {
        console.log('  ⚠️  需要重新构建，无法自动修复')
      }
    }
  }

  /**
   * 修复 package.json exports 配置
   */
  async fixPackageJsonExports(packageDir) {
    console.log('  🔧 修复 package.json exports 配置...')

    try {
      const packageJsonPath = resolve(packageDir, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      // 更新 exports 配置
      packageJson.exports = {
        '.': {
          types: './esm/index.d.ts',
          import: './esm/index.js',
          require: './cjs/index.js',
        },
      }

      // 检查是否有 vue 子模块
      if (existsSync(resolve(packageDir, 'esm/vue'))) {
        packageJson.exports['./vue'] = {
          types: './esm/vue/index.d.ts',
          import: './esm/vue/index.js',
          require: './cjs/vue/index.js',
        }
      }

      // 更新其他字段
      packageJson.main = 'cjs/index.js'
      packageJson.module = 'esm/index.js'
      packageJson.types = 'esm/index.d.ts'
      packageJson.browser = 'dist/index.min.js'

      require('node:fs').writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2),
      )
      console.log('  ✅ package.json exports 配置已修复')
    }
    catch (error) {
      console.log(`  ❌ 修复 package.json 失败: ${error.message}`)
    }
  }

  /**
   * 执行命令
   */
  execCommand(command, args, cwd) {
    return new Promise((resolve) => {
      // Windows 兼容性处理
      const isWindows = process.platform === 'win32'
      const cmd = isWindows && command === 'pnpm' ? 'pnpm.cmd' : command

      const child = spawn(cmd, args, {
        cwd,
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        shell: isWindows,
      })

      let stdout = ''
      let stderr = ''

      if (!this.options.verbose) {
        child.stdout?.on('data', (data) => {
          stdout += data.toString()
        })

        child.stderr?.on('data', (data) => {
          stderr += data.toString()
        })
      }

      child.on('close', (exitCode) => {
        resolve({ exitCode, stdout, stderr })
      })
    })
  }

  /**
   * 生成最终报告
   */
  generateFinalReport(packageName) {
    console.log(`\n📊 构建报告: ${packageName}`)
    console.log('='.repeat(60))

    const allSuccess = Object.values(this.results).every(
      result => result === null || result.success,
    )

    // 构建结果
    this.reportStep('构建', this.results.build)

    // 校验结果
    if (!this.options.skipValidation) {
      this.reportStep('构建产物校验', this.results.validation)
    }

    // 类型检查结果
    if (!this.options.skipTypeCheck) {
      this.reportStep('TypeScript 类型检查', this.results.typeCheck)
    }

    // Web 测试结果
    if (!this.options.skipWebTest) {
      this.reportStep('Web 端测试', this.results.webTest)
    }

    console.log('='.repeat(60))

    if (allSuccess) {
      console.log('🎉 所有检查通过！包构建成功！')
    }
    else {
      console.log('❌ 构建过程中发现问题，请查看上述报告')
    }

    return {
      success: allSuccess,
      packageName,
      results: this.results,
    }
  }

  /**
   * 报告单个步骤结果
   */
  reportStep(stepName, result) {
    if (result === null) {
      console.log(`⏭️  ${stepName}: 跳过`)
      return
    }

    const icon = result.success ? '✅' : '❌'
    console.log(`${icon} ${stepName}: ${result.success ? '通过' : '失败'}`)

    if (!result.success) {
      if (result.errors) {
        result.errors.forEach(error => console.log(`    • ${error}`))
      }
      if (result.message) {
        console.log(`    • ${result.message}`)
      }
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log(`    ⚠️  ${result.warnings.length} 个警告`)
    }
  }
}

/**
 * 命令行入口
 */
export async function enhancedBuild(packageDir = process.cwd(), options = {}) {
  try {
    const manager = new EnhancedBuildManager(options)
    const result = await manager.buildPackage(packageDir)

    if (!result.success) {
      process.exit(1)
    }

    return result
  }
  catch (error) {
    console.error('❌ 增强构建失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此文件
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  const packageDir = process.argv[2] || process.cwd()
  const options = {
    verbose: process.argv.includes('--verbose'),
    skipValidation: process.argv.includes('--skip-validation'),
    skipWebTest: process.argv.includes('--skip-web-test'),
    skipTypeCheck: process.argv.includes('--skip-type-check'),
    autoFix: !process.argv.includes('--no-auto-fix'),
  }

  enhancedBuild(packageDir, options)
}
