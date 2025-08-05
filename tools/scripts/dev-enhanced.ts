#!/usr/bin/env tsx

/**
 * 增强的开发脚本
 * 提供更好的开发体验和错误处理
 */

import { spawn, execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '../..')

interface DevOptions {
  packages?: string[]
  watch?: boolean
  test?: boolean
  lint?: boolean
  debug?: boolean
  port?: number
  open?: boolean
}

class EnhancedDevServer {
  private processes: Map<string, any> = new Map()
  private options: DevOptions

  constructor(options: DevOptions = {}) {
    this.options = {
      watch: true,
      test: false,
      lint: true,
      debug: true,
      port: 3000,
      open: false,
      ...options,
    }
  }

  /**
   * 启动增强开发环境
   */
  async start() {
    console.log(chalk.blue('🚀 启动 LDesign 增强开发环境...\n'))

    try {
      // 1. 环境检查
      await this.checkEnvironment()

      // 2. 依赖检查
      await this.checkDependencies()

      // 3. 代码质量检查
      if (this.options.lint) {
        await this.runLint()
      }

      // 4. 启动包开发服务器
      if (this.options.packages?.length) {
        await this.startPackageServers()
      } else {
        await this.startMainServer()
      }

      // 5. 启动测试监听
      if (this.options.test) {
        await this.startTestWatch()
      }

      // 6. 设置进程监听
      this.setupProcessHandlers()

      console.log(chalk.green('\n✅ 开发环境启动完成!'))
      this.printStatus()

    } catch (error) {
      console.error(chalk.red('❌ 启动失败:'), error)
      process.exit(1)
    }
  }

  /**
   * 环境检查
   */
  private async checkEnvironment() {
    console.log(chalk.yellow('🔍 检查开发环境...'))

    // 检查 Node.js 版本
    const nodeVersion = process.version
    const requiredVersion = '18.0.0'
    
    if (!this.compareVersions(nodeVersion.slice(1), requiredVersion)) {
      throw new Error(`需要 Node.js >= ${requiredVersion}，当前版本: ${nodeVersion}`)
    }

    // 检查 pnpm
    try {
      execSync('pnpm --version', { stdio: 'pipe' })
    } catch {
      throw new Error('未找到 pnpm，请先安装: npm install -g pnpm')
    }

    console.log(chalk.green('✅ 环境检查通过'))
  }

  /**
   * 依赖检查
   */
  private async checkDependencies() {
    console.log(chalk.yellow('📦 检查依赖...'))

    if (!existsSync(join(rootDir, 'node_modules'))) {
      console.log(chalk.yellow('📦 安装依赖...'))
      execSync('pnpm install', { stdio: 'inherit', cwd: rootDir })
    }

    console.log(chalk.green('✅ 依赖检查完成'))
  }

  /**
   * 代码检查
   */
  private async runLint() {
    console.log(chalk.yellow('🔧 运行代码检查...'))

    try {
      execSync('pnpm lint:check', { 
        stdio: 'pipe', 
        cwd: rootDir,
        timeout: 30000 
      })
      console.log(chalk.green('✅ 代码检查通过'))
    } catch (error) {
      console.log(chalk.yellow('⚠️ 发现代码问题，尝试自动修复...'))
      try {
        execSync('pnpm lint:fix', { stdio: 'inherit', cwd: rootDir })
        console.log(chalk.green('✅ 代码问题已修复'))
      } catch {
        console.log(chalk.red('❌ 代码检查失败，请手动修复'))
      }
    }
  }

  /**
   * 启动包开发服务器
   */
  private async startPackageServers() {
    const packages = this.options.packages!
    console.log(chalk.yellow(`🏗️ 启动包开发服务器: ${packages.join(', ')}`))

    for (const [index, pkg] of packages.entries()) {
      const port = this.options.port! + index
      await this.startPackageServer(pkg, port)
    }
  }

  /**
   * 启动单个包服务器
   */
  private async startPackageServer(packageName: string, port: number) {
    const packageDir = join(rootDir, 'packages', packageName)
    
    if (!existsSync(packageDir)) {
      console.log(chalk.red(`❌ 包不存在: ${packageName}`))
      return
    }

    const packageJson = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf-8'))
    
    if (!packageJson.scripts?.dev) {
      console.log(chalk.yellow(`⚠️ 包 ${packageName} 没有 dev 脚本`))
      return
    }

    console.log(chalk.blue(`🚀 启动 ${packageName} 开发服务器 (端口: ${port})`))

    const process = spawn('pnpm', ['dev'], {
      cwd: packageDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: port.toString(),
        VITE_PORT: port.toString(),
      },
    })

    this.processes.set(`package-${packageName}`, process)

    process.on('error', (error) => {
      console.error(chalk.red(`❌ ${packageName} 启动失败:`), error)
    })
  }

  /**
   * 启动主服务器
   */
  private async startMainServer() {
    console.log(chalk.yellow('🏗️ 启动主开发服务器...'))

    const process = spawn('pnpm', ['dev'], {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: this.options.port!.toString(),
      },
    })

    this.processes.set('main', process)

    process.on('error', (error) => {
      console.error(chalk.red('❌ 主服务器启动失败:'), error)
    })
  }

  /**
   * 启动测试监听
   */
  private async startTestWatch() {
    console.log(chalk.yellow('🧪 启动测试监听...'))

    const process = spawn('pnpm', ['test'], {
      cwd: rootDir,
      stdio: 'inherit',
    })

    this.processes.set('test', process)

    process.on('error', (error) => {
      console.error(chalk.red('❌ 测试监听启动失败:'), error)
    })
  }

  /**
   * 设置进程处理器
   */
  private setupProcessHandlers() {
    const cleanup = () => {
      console.log(chalk.yellow('\n🛑 正在关闭开发服务器...'))
      
      for (const [name, process] of this.processes) {
        console.log(chalk.yellow(`关闭 ${name}...`))
        process.kill('SIGTERM')
      }
      
      setTimeout(() => {
        console.log(chalk.green('✅ 开发服务器已关闭'))
        process.exit(0)
      }, 1000)
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
  }

  /**
   * 打印状态信息
   */
  private printStatus() {
    console.log(chalk.blue('\n📊 开发服务器状态:'))
    
    for (const [name] of this.processes) {
      console.log(chalk.green(`  ✅ ${name} - 运行中`))
    }

    if (this.options.packages?.length) {
      console.log(chalk.blue('\n🌐 访问地址:'))
      for (const [index, pkg] of this.options.packages.entries()) {
        const port = this.options.port! + index
        console.log(chalk.cyan(`  📦 ${pkg}: http://localhost:${port}`))
      }
    } else {
      console.log(chalk.cyan(`\n🌐 主服务器: http://localhost:${this.options.port}`))
    }

    console.log(chalk.gray('\n💡 提示: 按 Ctrl+C 停止服务器'))
  }

  /**
   * 版本比较
   */
  private compareVersions(version1: string, version2: string): boolean {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0

      if (v1Part > v2Part) return true
      if (v1Part < v2Part) return false
    }

    return true
  }
}

// CLI 处理
async function main() {
  const args = process.argv.slice(2)
  const options: DevOptions = {}

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--packages':
        options.packages = args[++i]?.split(',') || []
        break
      case '--no-watch':
        options.watch = false
        break
      case '--test':
        options.test = true
        break
      case '--no-lint':
        options.lint = false
        break
      case '--debug':
        options.debug = true
        break
      case '--port':
        options.port = parseInt(args[++i]) || 3000
        break
      case '--open':
        options.open = true
        break
      case '--help':
        printHelp()
        process.exit(0)
        break
    }
  }

  const devServer = new EnhancedDevServer(options)
  await devServer.start()
}

function printHelp() {
  console.log(`
${chalk.blue('LDesign 增强开发脚本')}

${chalk.yellow('用法:')}
  pnpm dev:enhanced [选项]

${chalk.yellow('选项:')}
  --packages <packages>  启动指定包的开发服务器 (逗号分隔)
  --no-watch            禁用文件监听
  --test                启用测试监听
  --no-lint             跳过代码检查
  --debug               启用调试模式
  --port <port>         指定端口 (默认: 3000)
  --open                自动打开浏览器
  --help                显示帮助信息

${chalk.yellow('示例:')}
  pnpm dev:enhanced --packages engine,color --test
  pnpm dev:enhanced --port 4000 --open
`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { EnhancedDevServer }
