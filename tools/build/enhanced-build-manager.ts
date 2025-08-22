#!/usr/bin/env tsx
/**
 * 增强构建管理器（TypeScript 版本）
 */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BuildValidator } from './build-validator'
import { TypeScriptChecker } from './typescript-checker'
import { WebRuntimeTester } from './web-runtime-tester'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface EnhancedOptions {
  skipValidation?: boolean
  skipWebTest?: boolean
  skipTypeCheck?: boolean
  autoFix?: boolean
  verbose?: boolean
}

export class EnhancedBuildManager {
  options: Required<EnhancedOptions>
  results: Record<string, any>

  constructor(options: EnhancedOptions = {}) {
    this.options = {
      skipValidation: false,
      skipWebTest: false,
      skipTypeCheck: false,
      autoFix: true,
      verbose: false,
      ...options,
    }
    this.results = { build: null, validation: null, webTest: null, typeCheck: null }
  }

  async buildPackage(packageDir: string) {
    const packageJsonPath = resolve(packageDir, 'package.json')
    if (!existsSync(packageJsonPath)) {
      throw new Error(`package.json not found in ${packageDir}`)
    }
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    console.log(`\n🚀 开始构建包: ${packageJson.name}`)
    console.log('='.repeat(60))
    try {
      await this.runBuild(packageDir)
      if (!this.options.skipValidation) await this.runValidation(packageDir)
      if (!this.options.skipTypeCheck) await this.runTypeCheck(packageDir)
      if (!this.options.skipWebTest) await this.runWebTest(packageDir)
      return this.generateFinalReport(packageJson.name)
    } catch (error: any) {
      console.error(`❌ 构建失败: ${error.message}`)
      throw error
    }
  }

  async runBuild(packageDir: string) {
    console.log('🔨 执行构建...')
    try {
      const result = await this.execCommand('pnpm', ['build'], packageDir)
      if (result.exitCode === 0) {
        console.log('✅ 构建完成')
        this.results.build = { success: true, message: '构建成功' }
      } else {
        throw new Error(`构建失败: ${result.stderr}`)
      }
    } catch (error: any) {
      this.results.build = { success: false, message: error.message }
      throw error
    }
  }

  async runValidation(packageDir: string) {
    console.log('\n🔍 运行构建产物校验...')
    try {
      const validator = new (BuildValidator as any)(packageDir)
      const result = await validator.validate()
      this.results.validation = result
      if (!result.success && this.options.autoFix) {
        await this.attemptAutoFix(packageDir, result.errors)
      }
      if (!result.success) throw new Error('构建产物校验失败')
    } catch (error: any) {
      this.results.validation = { success: false, errors: [error.message] }
      throw error
    }
  }

  async runTypeCheck(packageDir: string) {
    console.log('\n🔷 运行 TypeScript 类型检查...')
    try {
      const checker = new TypeScriptChecker(packageDir)
      const result = await checker.check()
      this.results.typeCheck = result
      if (!result.success) throw new Error('TypeScript 类型检查失败')
    } catch (error: any) {
      this.results.typeCheck = { success: false, errors: [error.message] }
      throw error
    }
  }

  async runWebTest(packageDir: string) {
    console.log('\n🌐 运行 Web 端测试...')
    try {
      const tester = new WebRuntimeTester(packageDir)
      const result = await tester.runTests()
      this.results.webTest = result
      if (!result.success) throw new Error('Web 端测试失败')
    } catch (error: any) {
      this.results.webTest = { success: false, errors: [error.message] }
      throw error
    }
  }

  async attemptAutoFix(packageDir: string, errors: string[]) {
    console.log('🔧 尝试自动修复问题...')
    for (const error of errors || []) {
      if (error.includes('package.json')) await this.fixPackageJsonExports(packageDir)
      else if (error.includes('缺少构建产物文件')) console.log('  ⚠️  需要重新构建，无法自动修复')
    }
  }

  async fixPackageJsonExports(packageDir: string) {
    console.log('  🔧 修复 package.json exports 配置...')
    try {
      const packageJsonPath = resolve(packageDir, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      packageJson.exports = { '.': { types: './esm/index.d.ts', import: './esm/index.js', require: './cjs/index.js' } }
      if (existsSync(resolve(packageDir, 'esm/vue'))) {
        packageJson.exports['./vue'] = { types: './esm/vue/index.d.ts', import: './esm/vue/index.js', require: './cjs/vue/index.js' }
      }
      packageJson.main = 'cjs/index.js'
      packageJson.module = 'esm/index.js'
      packageJson.types = 'esm/index.d.ts'
      packageJson.browser = 'dist/index.min.js'
      require('node:fs').writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log('  ✅ package.json exports 配置已修复')
    } catch (error: any) {
      console.log(`  ❌ 修复 package.json 失败: ${error.message}`)
    }
  }

  execCommand(command: string, args: string[], cwd: string) {
    return new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve) => {
      const isWindows = process.platform === 'win32'
      const cmd = isWindows && command === 'pnpm' ? 'pnpm.cmd' : command
      const child = spawn(cmd, args, { cwd, stdio: this.options.verbose ? 'inherit' : 'pipe', shell: isWindows })
      let stdout = ''
      let stderr = ''
      if (!this.options.verbose) {
        child.stdout?.on('data', (data) => { stdout += data.toString() })
        child.stderr?.on('data', (data) => { stderr += data.toString() })
      }
      child.on('close', (exitCode) => resolve({ exitCode: exitCode ?? 0, stdout, stderr }))
    })
  }

  generateFinalReport(packageName: string) {
    console.log(`\n📊 构建报告: ${packageName}`)
    console.log('='.repeat(60))
    const allSuccess = Object.values(this.results).every(result => result === null || result.success)
    this.reportStep('构建', this.results.build)
    if (!this.options.skipValidation) this.reportStep('构建产物校验', this.results.validation)
    if (!this.options.skipTypeCheck) this.reportStep('TypeScript 类型检查', this.results.typeCheck)
    if (!this.options.skipWebTest) this.reportStep('Web 端测试', this.results.webTest)
    console.log('='.repeat(60))
    if (allSuccess) console.log('🎉 所有检查通过！包构建成功！')
    else console.log('❌ 构建过程中发现问题，请查看上述报告')
    return { success: allSuccess, packageName, results: this.results }
  }

  reportStep(stepName: string, result: any) {
    if (result === null) { console.log(`⏭️  ${stepName}: 跳过`); return }
    const icon = result.success ? '✅' : '❌'
    console.log(`${icon} ${stepName}: ${result.success ? '通过' : '失败'}`)
    if (!result.success) {
      if (result.errors) result.errors.forEach((error: string) => console.log(`    • ${error}`))
      if (result.message) console.log(`    • ${result.message}`)
    }
    if (result.warnings && result.warnings.length > 0) console.log(`    ⚠️  ${result.warnings.length} 个警告`)
  }
}

export async function enhancedBuild(packageDir = process.cwd(), options: EnhancedOptions = {}) {
  try {
    const manager = new EnhancedBuildManager(options)
    const result = await manager.buildPackage(packageDir)
    if (!result.success) process.exit(1)
    return result
  } catch (error: any) {
    console.error('❌ 增强构建失败:', error.message)
    process.exit(1)
  }
}

if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  const packageDir = process.argv[2] || process.cwd()
  const options: EnhancedOptions = {
    verbose: process.argv.includes('--verbose'),
    skipValidation: process.argv.includes('--skip-validation'),
    skipWebTest: process.argv.includes('--skip-web-test'),
    skipTypeCheck: process.argv.includes('--skip-type-check'),
    autoFix: !process.argv.includes('--no-auto-fix'),
  }
  await enhancedBuild(packageDir, options)
}


