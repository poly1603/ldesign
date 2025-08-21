#!/usr/bin/env node

import type { PublishConfig } from '../../configs/publish.config.js'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { publishConfig } from '../../configs/publish.config.js'

interface PublishOptions {
  registry?: string
  packages?: string[]
  dryRun?: boolean
  skipChecks?: boolean
  tag?: string
  access?: 'public' | 'restricted'
}

interface PublishResult {
  package: string
  registry: string
  version: string
  success: boolean
  error?: string
  publishTime: string
}

class PublishManager {
  private config: PublishConfig
  private results: PublishResult[] = []

  constructor(config: PublishConfig = publishConfig) {
    this.config = config
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
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

  private async runPrePublishChecks(): Promise<boolean> {
    this.log('开始执行发布前检查...')

    const checks = this.config.prePublishChecks
    let allPassed = true

    if (checks.build) {
      this.log('检查构建状态...')
      const buildResult = await this.executeCommand('pnpm build')
      if (!buildResult.success) {
        this.log('构建检查失败', 'error')
        allPassed = false
      }
    }

    if (checks.test) {
      this.log('运行测试...')
      const testResult = await this.executeCommand('pnpm test:run')
      if (!testResult.success) {
        this.log('测试检查失败', 'warn')
        // 测试失败不阻止发布，只是警告
      }
    }

    if (checks.lint) {
      this.log('检查代码规范...')
      const lintResult = await this.executeCommand('pnpm lint')
      if (!lintResult.success) {
        this.log('代码规范检查失败', 'error')
        allPassed = false
      }
    }

    if (checks.typeCheck) {
      this.log('检查类型...')
      const typeResult = await this.executeCommand('pnpm type-check')
      if (!typeResult.success) {
        this.log('类型检查失败', 'error')
        allPassed = false
      }
    }

    if (checks.sizeCheck) {
      this.log('检查包大小...')
      const sizeResult = await this.executeCommand('pnpm size-check')
      if (!sizeResult.success) {
        this.log('包大小检查失败', 'warn')
        // 大小检查失败不阻止发布
      }
    }

    return allPassed
  }

  private async publishPackage(
    packageName: string,
    registry: string,
    options: PublishOptions,
  ): Promise<PublishResult> {
    const packageConfig = this.config.packages[packageName]
    const registryConfig = this.config.registries[registry]

    if (!packageConfig) {
      throw new Error(`未找到包配置: ${packageName}`)
    }

    if (!registryConfig) {
      throw new Error(`未找到仓库配置: ${registry}`)
    }

    const packagePath = join(process.cwd(), packageConfig.path)
    const packageJsonPath = join(packagePath, 'package.json')

    if (!existsSync(packageJsonPath)) {
      throw new Error(`包不存在: ${packageJsonPath}`)
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    const version = packageJson.version

    this.log(`发布 ${packageName}@${version} 到 ${registryConfig.description}`)

    try {
      // 构建发布命令
      let publishCommand = `npm publish`

      if (registryConfig.url) {
        publishCommand += ` --registry ${registryConfig.url}`
      }

      if (options.tag) {
        publishCommand += ` --tag ${options.tag}`
      }

      if (options.access) {
        publishCommand += ` --access ${options.access}`
      }

      if (options.dryRun) {
        publishCommand += ` --dry-run`
      }

      // 执行发布
      const result = await this.executeCommand(publishCommand, packagePath)

      if (result.success) {
        this.log(`✅ ${packageName}@${version} 发布成功`)
        return {
          package: packageName,
          registry,
          version,
          success: true,
          publishTime: new Date().toISOString(),
        }
      }
      else {
        throw new Error(result.error)
      }
    }
    catch (error: any) {
      this.log(
        `❌ ${packageName}@${version} 发布失败: ${error.message}`,
        'error',
      )
      return {
        package: packageName,
        registry,
        version,
        success: false,
        error: error.message,
        publishTime: new Date().toISOString(),
      }
    }
  }

  private async runPostPublishActions(): Promise<void> {
    const actions = this.config.postPublishActions

    if (actions.gitTag) {
      this.log('创建 Git 标签...')
      try {
        // 获取当前版本
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
        const version = packageJson.version

        await this.executeCommand(`git tag v${version}`)
        this.log(`Git 标签 v${version} 创建成功`)
      }
      catch (error: any) {
        this.log(`Git 标签创建失败: ${error.message}`, 'warn')
      }
    }

    if (actions.gitPush) {
      this.log('推送到远程仓库...')
      try {
        await this.executeCommand('git push --tags')
        this.log('推送成功')
      }
      catch (error: any) {
        this.log(`推送失败: ${error.message}`, 'warn')
      }
    }

    if (actions.notification) {
      this.log('发送通知...')
      // 这里可以添加通知逻辑，比如发送邮件、Slack消息等
    }
  }

  private generatePublishReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
      },
    }

    const reportPath = join(process.cwd(), 'publish-report.json')
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    this.log(`发布报告已生成: ${reportPath}`)
  }

  async publish(options: PublishOptions = {}): Promise<void> {
    this.log('开始发布流程...')

    // 执行发布前检查
    if (!options.skipChecks) {
      const checksPass = await this.runPrePublishChecks()
      if (!checksPass) {
        this.log('发布前检查失败，终止发布', 'error')
        process.exit(1)
      }
    }

    // 确定要发布的包
    const packagesToPublish
      = options.packages || Object.keys(this.config.packages)

    // 确定目标仓库
    const targetRegistry = options.registry || 'npm'

    if (!this.config.registries[targetRegistry]) {
      throw new Error(`未知的仓库: ${targetRegistry}`)
    }

    // 发布每个包
    for (const packageName of packagesToPublish) {
      const packageConfig = this.config.packages[packageName]

      if (!packageConfig) {
        this.log(`跳过未知包: ${packageName}`, 'warn')
        continue
      }

      if (packageConfig.private) {
        this.log(`跳过私有包: ${packageName}`, 'warn')
        continue
      }

      if (!packageConfig.registries.includes(targetRegistry)) {
        this.log(`包 ${packageName} 不支持发布到 ${targetRegistry}`, 'warn')
        continue
      }

      const result = await this.publishPackage(
        packageName,
        targetRegistry,
        options,
      )
      this.results.push(result)
    }

    // 执行发布后操作
    await this.runPostPublishActions()

    // 生成报告
    this.generatePublishReport()

    // 输出总结
    const successCount = this.results.filter(r => r.success).length
    const totalCount = this.results.length

    this.log(`发布完成! 成功: ${successCount}/${totalCount}`)

    if (successCount < totalCount) {
      process.exit(1)
    }
  }

  async setupLocalRegistry(): Promise<void> {
    this.log('设置本地测试仓库...')

    try {
      // 检查是否已安装 verdaccio
      await this.executeCommand('verdaccio --version')
    }
    catch {
      this.log('安装 Verdaccio...')
      await this.executeCommand('npm install -g verdaccio')
    }

    this.log('启动本地仓库 (端口 4873)...')
    this.log('请在另一个终端运行: verdaccio')
    this.log('然后设置 npm 仓库: npm set registry http://localhost:4873/')
  }
}

// CLI 接口
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2)
  const options: PublishOptions = {}

  // 解析命令行参数
  args.forEach((arg, index) => {
    if (arg === '--dry-run')
      options.dryRun = true
    if (arg === '--skip-checks')
      options.skipChecks = true
    if (arg.startsWith('--registry='))
      options.registry = arg.split('=')[1]
    if (arg.startsWith('--tag='))
      options.tag = arg.split('=')[1]
    if (arg.startsWith('--access='))
      options.access = arg.split('=')[1] as any
    if (arg.startsWith('--packages=')) {
      options.packages = arg.split('=')[1].split(',')
    }
  })

  const command = args[0]
  const publishManager = new PublishManager()

  switch (command) {
    case 'setup-local':
      publishManager.setupLocalRegistry().catch((error) => {
        console.error('设置本地仓库失败:', error)
        process.exit(1)
      })
      break

    default:
      publishManager.publish(options).catch((error) => {
        console.error('发布失败:', error)
        process.exit(1)
      })
      break
  }
}

export { PublishManager, PublishOptions, PublishResult }
