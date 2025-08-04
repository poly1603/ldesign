#!/usr/bin/env tsx

import { execSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

interface WorkflowOptions {
  packages?: string[]
  watch?: boolean
  test?: boolean
  lint?: boolean
}

class DevWorkflow {
  private rootDir: string

  constructor() {
    this.rootDir = resolve(process.cwd())
  }

  // 启动开发环境
  async startDev(options: WorkflowOptions = {}) {
    console.log('🚀 启动开发环境...')

    // 1. 检查依赖
    await this.checkDependencies()

    // 2. 代码检查
    if (options.lint !== false) {
      await this.runLint()
    }

    // 3. 类型检查
    await this.runTypeCheck()

    // 4. 启动构建监听
    if (options.watch !== false) {
      this.startWatchMode(options.packages)
    }

    // 5. 启动测试监听
    if (options.test) {
      this.startTestWatch()
    }

    console.log('✅ 开发环境启动完成!')
  }

  // 检查依赖
  private async checkDependencies() {
    console.log('📦 检查依赖...')
    try {
      execSync('pnpm install --frozen-lockfile', { stdio: 'inherit' })
    }
    catch {
      console.log('📦 安装依赖...')
      execSync('pnpm install', { stdio: 'inherit' })
    }
  }

  // 运行代码检查
  private async runLint() {
    console.log('🔍 代码检查...')
    try {
      execSync('pnpm lint', { stdio: 'inherit' })
    }
    catch {
      console.warn('⚠️ 代码检查发现问题，尝试自动修复...')
      execSync('pnpm lint:fix', { stdio: 'inherit' })
    }
  }

  // 运行类型检查
  private async runTypeCheck() {
    console.log('🔧 类型检查...')
    try {
      execSync('pnpm type-check', { stdio: 'inherit' })
    }
    catch (error) {
      console.error('❌ 类型检查失败')
      throw error
    }
  }

  // 启动监听模式
  private startWatchMode(packages?: string[]) {
    console.log('👀 启动构建监听...')

    if (packages && packages.length > 0) {
      // 监听指定包
      packages.forEach((pkg) => {
        const packagePath = resolve(this.rootDir, 'packages', pkg)
        if (existsSync(packagePath)) {
          spawn('pnpm', ['run', 'build:watch'], {
            cwd: packagePath,
            stdio: 'inherit',
          })
        }
      })
    }
    else {
      // 监听所有包
      spawn('pnpm', ['build:watch'], {
        stdio: 'inherit',
      })
    }
  }

  // 启动测试监听
  private startTestWatch() {
    console.log('🧪 启动测试监听...')
    spawn('pnpm', ['test'], {
      stdio: 'inherit',
    })
  }

  // 生产构建
  async buildProduction() {
    console.log('🏗️ 生产构建...')

    // 1. 清理
    console.log('🧹 清理旧文件...')
    execSync('pnpm clean', { stdio: 'inherit' })

    // 2. 安装依赖
    await this.checkDependencies()

    // 3. 代码检查
    await this.runLint()

    // 4. 类型检查
    await this.runTypeCheck()

    // 5. 运行测试
    console.log('🧪 运行测试...')
    execSync('pnpm test:run', { stdio: 'inherit' })

    // 6. 构建
    console.log('📦 构建包...')
    execSync('pnpm build', { stdio: 'inherit' })

    // 7. 大小检查
    console.log('📏 检查包大小...')
    execSync('pnpm size-check', { stdio: 'inherit' })

    console.log('✅ 生产构建完成!')
  }
}

// CLI 接口
const args = process.argv.slice(2)
const command = args[0]

const workflow = new DevWorkflow()

switch (command) {
  case 'dev':
    workflow.startDev({
      packages: args.includes('--packages') ? args[args.indexOf('--packages') + 1]?.split(',') : undefined,
      watch: !args.includes('--no-watch'),
      test: args.includes('--test'),
      lint: !args.includes('--no-lint'),
    }).catch(console.error)
    break

  case 'build':
    workflow.buildProduction().catch(console.error)
    break

  default:
    console.log(`
使用方法:
  tsx tools/scripts/workflow/dev-workflow.ts dev [选项]     # 启动开发环境
  tsx tools/scripts/workflow/dev-workflow.ts build        # 生产构建

选项:
  --packages <pkg1,pkg2>  # 指定要监听的包
  --test                  # 启动测试监听
  --no-watch             # 不启动构建监听
  --no-lint              # 跳过代码检查
`)
    break
}
