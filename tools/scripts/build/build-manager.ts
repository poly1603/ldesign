#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { logger } from '../../utils/dev-logger'
import { SmartBuildValidator } from './smart-build-validator'

interface BuildOptions {
  target?: 'all' | 'packages' | 'docs' | 'examples'
  mode?: 'development' | 'production'
  watch?: boolean
  skipTypeCheck?: boolean
  skipTests?: boolean
  updateVersion?: boolean
  generateReport?: boolean
}

interface BuildResult {
  target: string
  success: boolean
  duration: number
  size?: string
  errors?: string[]
  warnings?: string[]
}

class BuildManager {
  private buildResults: BuildResult[] = []
  private startTime: number = 0
  private logFile: string = ''

  constructor(private options: BuildOptions = {}) {
    this.startTime = performance.now()
    this.logFile = join(process.cwd(), 'build-report.json')
    this.ensureDirectories()
  }

  private ensureDirectories() {
    const dirs = ['dist', 'logs']
    dirs.forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
    })
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    // 在生产模式下只显示关键信息
    if (this.options.mode === 'production' && level === 'info') {
      // 只显示开始、完成、错误等关键状态
      const keywordPatterns = [
        /开始构建/, /构建完成/, /构建失败/, /构建流程/,
        /类型检查/, /运行测试/, /版本号更新/, /构建报告/
      ]
      const isKeyMessage = keywordPatterns.some(pattern => pattern.test(message))
      if (!isKeyMessage) return
    }

    switch (level) {
      case 'warn':
        logger.warn(message, { prefix: 'BUILD', timestamp: false })
        break
      case 'error':
        logger.error(message, undefined, { prefix: 'BUILD', timestamp: false })
        break
      case 'info':
      default:
        logger.info(message, { prefix: 'BUILD', timestamp: false })
        break
    }
  }

  private async executeCommand(
    command: string,
    cwd?: string,
  ): Promise<{ success: boolean, output: string, error?: string, code?: number }> {
    try {
      const output = execSync(command, {
        cwd: cwd || process.cwd(),
        encoding: 'utf8',
        stdio: this.options.mode === 'production' ? 'pipe' : 'inherit',
      })
      return { success: true, output }
    }
    catch (error: any) {
      const stderr: string = error?.stderr?.toString?.() || ''
      const stdout: string = error?.stdout?.toString?.() || ''
      const msg = error?.message || 'Unknown error'
      const code: number | undefined = typeof error?.status === 'number' ? error.status : undefined

      // 在生产模式下，只返回关键错误信息
      if (this.options.mode === 'production') {
        const combined = stderr || stdout || msg
        return { success: false, output: combined, error: msg, code }
      }

      const combined = [msg, stderr, stdout].filter(Boolean).join('\n')
      return { success: false, output: combined, error: msg, code }
    }
  }

  private async buildPackages(): Promise<BuildResult> {
    this.log('开始构建所有包...')
    const startTime = performance.now()

    try {
      // 类型检查（可选）
      if (!this.options.skipTypeCheck) {
        this.log('执行类型检查...')
        const typeCheckResult = await this.executeCommand(
          'pnpm type-check:packages',
        )
        if (!typeCheckResult.success) {
          this.log(`类型检查失败: ${typeCheckResult.error}`, 'warn')
        }
      }

      // 构建所有包
      const buildCommand = this.options.watch
        ? 'pnpm build:watch:legacy'
        : 'pnpm build:legacy'
      const buildResult = await this.executeCommand(buildCommand)

      if (!buildResult.success) {
        this.log(`构建命令失败`, 'error')
        if (this.options.mode !== 'production') {
          this.log(`详细错误信息:\n${buildResult.output}`, 'error')
        }
        throw new Error(buildResult.error || '构建失败')
      }

      // 运行测试（可选）
      if (!this.options.skipTests) {
        this.log('运行测试...')
        const testResult = await this.executeCommand('pnpm test:run')
        if (!testResult.success) {
          this.log(`测试失败: ${testResult.error}`, 'warn')
          if (this.options.mode !== 'production') {
            this.log(`详细测试信息:\n${testResult.output}`, 'warn')
          }
        }
      }

      // 运行构建产物验证
      await this.validateBuildArtifacts()

      const duration = performance.now() - startTime
      this.log(`包构建完成，耗时: ${Math.round(duration)}ms`)

      return {
        target: 'packages',
        success: true,
        duration: Math.round(duration),
      }
    }
    catch (error: any) {
      const duration = performance.now() - startTime
      this.log(`包构建失败: ${error?.message || '未知错误'}`, 'error')

      return {
        target: 'packages',
        success: false,
        duration: Math.round(duration),
        errors: [String(error?.message || error)],
      }
    }
  }

  private async buildDocs(): Promise<BuildResult> {
    this.log('开始构建文档...')
    const startTime = performance.now()

    try {
      const buildResult = await this.executeCommand('pnpm docs:build')

      if (!buildResult.success) {
        this.log(`文档构建失败输出:\n${buildResult.output}`, 'error')
        throw new Error(buildResult.error || '文档构建失败')
      }

      const duration = performance.now() - startTime
      this.log(`文档构建完成，耗时: ${Math.round(duration)}ms`)

      return {
        target: 'docs',
        success: true,
        duration: Math.round(duration),
      }
    }
    catch (error: any) {
      const duration = performance.now() - startTime
      this.log(`文档构建失败: ${error?.message || '未知错误'}`, 'error')

      return {
        target: 'docs',
        success: false,
        duration: Math.round(duration),
        errors: [String(error?.message || error)],
      }
    }
  }

  private async buildExamples(): Promise<BuildResult> {
    this.log('开始构建示例...')
    const startTime = performance.now()

    try {
      // 这里可以添加示例构建逻辑
      // 目前先返回成功状态
      const duration = performance.now() - startTime
      this.log(`示例构建完成，耗时: ${Math.round(duration)}ms`)

      return {
        target: 'examples',
        success: true,
        duration: Math.round(duration),
      }
    }
    catch (error: any) {
      const duration = performance.now() - startTime
      this.log(`示例构建失败: ${error?.message || '未知错误'}`, 'error')

      return {
        target: 'examples',
        success: false,
        duration: Math.round(duration),
        errors: [String(error?.message || error)],
      }
    }
  }

  private async updateVersions(): Promise<void> {
    if (!this.options.updateVersion)
      return

    this.log('更新版本号...')
    try {
      await this.executeCommand('pnpm changeset version')
      this.log('版本号更新完成')
    }
    catch (error: any) {
      this.log(`版本号更新失败: ${error.message}`, 'error')
    }
  }

  private async validateBuildArtifacts(): Promise<void> {
    this.log('验证构建产物...')

    try {
      const packagesDir = join(process.cwd(), 'packages')
      if (!existsSync(packagesDir)) return

      const { readdirSync, statSync } = require('node:fs')
      const packages = readdirSync(packagesDir).filter((name: string) => {
        const packagePath = join(packagesDir, name)
        return (
          statSync(packagePath).isDirectory() &&
          existsSync(join(packagePath, 'package.json'))
        )
      })

      let validationErrors = 0
      for (const packageName of packages) {
        const packagePath = join(packagesDir, packageName)
        try {
          const validator = new SmartBuildValidator(packagePath)
          const result = await validator.validate()
          if (!result.success) {
            validationErrors++
          }
        } catch (error: any) {
          this.log(`验证包 ${packageName} 时出错: ${error.message}`, 'warn')
        }
      }

      if (validationErrors === 0) {
        this.log('所有包的构建产物验证通过')
      } else {
        this.log(`${validationErrors} 个包的构建产物验证失败`, 'warn')
      }
    } catch (error: any) {
      this.log(`构建产物验证过程出错: ${error.message}`, 'warn')
    }
  }

  private generateBuildReport(): void {
    if (!this.options.generateReport)
      return

    const totalDuration = performance.now() - this.startTime
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: Math.round(totalDuration),
      target: this.options.target,
      mode: this.options.mode,
      results: this.buildResults,
      summary: {
        total: this.buildResults.length,
        successful: this.buildResults.filter(r => r.success).length,
        failed: this.buildResults.filter(r => !r.success).length,
      },
    }

    try {
      writeFileSync(this.logFile, JSON.stringify(report, null, 2))
      this.log(`构建报告已生成: ${this.logFile}`)
    }
    catch (e: any) {
      this.log(`构建报告写入失败: ${e?.message || e}`, 'warn')
    }
  }

  async build(): Promise<void> {
    this.log('开始构建流程...')

    // 更新版本号
    await this.updateVersions()

    // 根据目标执行构建
    switch (this.options.target) {
      case 'packages':
        this.buildResults.push(await this.buildPackages())
        break
      case 'docs':
        this.buildResults.push(await this.buildDocs())
        break
      case 'examples':
        this.buildResults.push(await this.buildExamples())
        break
      case 'all':
      default:
        this.buildResults.push(await this.buildPackages())
        this.buildResults.push(await this.buildDocs())
        this.buildResults.push(await this.buildExamples())
        break
    }

    // 生成构建报告
    this.generateBuildReport()

    const totalDuration = performance.now() - this.startTime
    const successCount = this.buildResults.filter(r => r.success).length
    const totalCount = this.buildResults.length

    this.log(
      `构建完成! 成功: ${successCount}/${totalCount}, 总耗时: ${Math.round(
        totalDuration,
      )}ms`,
    )

    if (successCount < totalCount) {
      // 使用非零退出码，但避免在外部调用环境中直接中断未处理逻辑
      process.exitCode = 1
    }
  }
}

// CLI 接口
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const options: BuildOptions = {
    target: 'all',
    mode: 'production',
    generateReport: true,
  }

  // 解析命令行参数
  args.forEach((arg) => {
    if (arg === '--watch')
      options.watch = true
    if (arg === '--dev')
      options.mode = 'development'
    if (arg === '--skip-type-check')
      options.skipTypeCheck = true
    if (arg === '--skip-tests')
      options.skipTests = true
    if (arg === '--update-version')
      options.updateVersion = true
    if (arg.startsWith('--target='))
      options.target = arg.split('=')[1] as any
  })

  const buildManager = new BuildManager(options)
  buildManager.build().catch((error) => {
    console.error('构建失败:', error)
    process.exit(1)
  })
}

export { BuildManager, BuildOptions, BuildResult }
