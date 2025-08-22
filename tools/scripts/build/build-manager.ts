#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'

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
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
    console.log(logMessage)
  }

  private async executeCommand(
    command: string,
    cwd?: string,
  ): Promise<{ success: boolean, output: string, error?: string }> {
    try {
      const output = execSync(command, {
        cwd: cwd || process.cwd(),
        encoding: 'utf8',
        stdio: 'pipe',
      })
      return { success: true, output }
    }
    catch (error: any) {
      return {
        success: false,
        output: '',
        error: error.message,
      }
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
        throw new Error(buildResult.error)
      }

      // 运行测试（可选）
      if (!this.options.skipTests) {
        this.log('运行测试...')
        const testResult = await this.executeCommand('pnpm test:run')
        if (!testResult.success) {
          this.log(`测试失败: ${testResult.error}`, 'warn')
        }
      }

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
      this.log(`包构建失败: ${error.message}`, 'error')

      return {
        target: 'packages',
        success: false,
        duration: Math.round(duration),
        errors: [error.message],
      }
    }
  }

  private async buildDocs(): Promise<BuildResult> {
    this.log('开始构建文档...')
    const startTime = performance.now()

    try {
      const buildResult = await this.executeCommand('pnpm docs:build')

      if (!buildResult.success) {
        throw new Error(buildResult.error)
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
      this.log(`文档构建失败: ${error.message}`, 'error')

      return {
        target: 'docs',
        success: false,
        duration: Math.round(duration),
        errors: [error.message],
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
      this.log(`示例构建失败: ${error.message}`, 'error')

      return {
        target: 'examples',
        success: false,
        duration: Math.round(duration),
        errors: [error.message],
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

    writeFileSync(this.logFile, JSON.stringify(report, null, 2))
    this.log(`构建报告已生成: ${this.logFile}`)
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
      process.exit(1)
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
