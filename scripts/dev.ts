#!/usr/bin/env tsx
/**
 * 统一的开发启动脚本
 *
 * 简化开发流程，提供清晰的开发入口
 */

import { spawn } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

interface DevOptions {
  /** 要启动的包名列表 */
  packages?: string[]
  /** 要启动的应用名列表 */
  apps?: string[]
  /** 是否启用测试监听 */
  test?: boolean
  /** 是否启用类型检查 */
  typeCheck?: boolean
  /** 自定义端口 */
  port?: number
  /** 是否自动打开浏览器 */
  open?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 解析命令行参数
 */
function parseArguments(): DevOptions {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      packages: { type: 'string', short: 'p' },
      apps: { type: 'string', short: 'a' },
      test: { type: 'boolean', short: 't' },
      'type-check': { type: 'boolean' },
      port: { type: 'string' },
      open: { type: 'boolean', short: 'o' },
      debug: { type: 'boolean', short: 'd' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  })

  if (values.help) {
    showHelp()
    process.exit(0)
  }

  return {
    packages: values.packages?.split(',').map(p => p.trim()),
    apps: values.apps?.split(',').map(a => a.trim()),
    test: values.test,
    typeCheck: values['type-check'],
    port: values.port ? Number.parseInt(values.port) : undefined,
    open: values.open,
    debug: values.debug,
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
🚀 LDesign 开发启动器

用法:
  pnpm dev [选项]

选项:
  -p, --packages <names>     启动指定包的开发模式 (逗号分隔)
  -a, --apps <names>         启动指定应用的开发模式 (逗号分隔)
  -t, --test                 启用测试监听模式
  --type-check               启用类型检查
  --port <number>            指定端口号
  -o, --open                 自动打开浏览器
  -d, --debug                启用调试模式
  -h, --help                 显示帮助信息

示例:
  pnpm dev                           # 启动所有包的开发模式
  pnpm dev -p engine,color           # 只启动engine和color包
  pnpm dev -a playground             # 启动playground应用
  pnpm dev -t                        # 启动开发模式并监听测试
  pnpm dev -p template -a demo-app   # 同时启动template包和demo-app应用
`)
}

/**
 * 获取所有可用的包
 */
function getAvailablePackages(): string[] {
  const packagesDir = resolve(process.cwd(), 'packages')
  if (!existsSync(packagesDir)) return []

  return readdirSync(packagesDir).filter((name: string) => {
    const packagePath = resolve(packagesDir, name)
    return (
      statSync(packagePath).isDirectory() &&
      existsSync(resolve(packagePath, 'package.json'))
    )
  })
}

/**
 * 获取所有可用的应用
 */
function getAvailableApps(): string[] {
  const appsDir = resolve(process.cwd(), 'apps')
  if (!existsSync(appsDir)) return []

  const { readdirSync, statSync } = require('node:fs')
  return readdirSync(appsDir).filter((name: string) => {
    const appPath = resolve(appsDir, name)
    return (
      statSync(appPath).isDirectory() &&
      existsSync(resolve(appPath, 'package.json'))
    )
  })
}

/**
 * 启动包的开发模式
 */
async function startPackageDev(packageName: string, options: DevOptions) {
  const packagePath = resolve(process.cwd(), 'packages', packageName)

  if (!existsSync(packagePath)) {
    console.error(`❌ 包 ${packageName} 不存在`)
    return
  }

  console.log(`🔧 启动包 ${packageName} 的开发模式...`)

  const args = ['dev']
  if (options.debug) args.push('--debug')

  const child = spawn('pnpm', args, {
    cwd: packagePath,
    stdio: 'inherit',
    shell: true,
  })

  return new Promise<void>((resolve, reject) => {
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`包 ${packageName} 开发模式退出，代码: ${code}`))
    })
  })
}

/**
 * 启动应用的开发模式
 */
async function startAppDev(appName: string, options: DevOptions) {
  const appPath = resolve(process.cwd(), 'apps', appName)

  if (!existsSync(appPath)) {
    console.error(`❌ 应用 ${appName} 不存在`)
    return
  }

  console.log(`🚀 启动应用 ${appName} 的开发模式...`)

  const args = ['dev']
  if (options.port) args.push('--port', options.port.toString())
  if (options.open) args.push('--open')
  if (options.debug) args.push('--debug')

  const child = spawn('pnpm', args, {
    cwd: appPath,
    stdio: 'inherit',
    shell: true,
  })

  return new Promise<void>((resolve, reject) => {
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`应用 ${appName} 开发模式退出，代码: ${code}`))
    })
  })
}

/**
 * 启动测试监听
 */
async function startTestWatch() {
  console.log('🧪 启动测试监听模式...')

  const child = spawn('pnpm', ['test'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  })

  return new Promise<void>((resolve, reject) => {
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`测试监听退出，代码: ${code}`))
    })
  })
}

/**
 * 启动类型检查
 */
async function startTypeCheck() {
  console.log('🔍 启动类型检查...')

  const child = spawn('pnpm', ['type-check'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  })

  return new Promise<void>((resolve, reject) => {
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error(`类型检查退出，代码: ${code}`))
    })
  })
}

/**
 * 主函数
 */
async function main() {
  const options = parseArguments()

  console.log('🚀 LDesign 开发环境启动中...\n')

  const tasks: Promise<void>[] = []

  // 启动包开发模式
  const packages = options.packages || getAvailablePackages()
  for (const packageName of packages) {
    tasks.push(startPackageDev(packageName, options))
  }

  // 启动应用开发模式
  const apps = options.apps || []
  for (const appName of apps) {
    tasks.push(startAppDev(appName, options))
  }

  // 启动测试监听
  if (options.test) {
    tasks.push(startTestWatch())
  }

  // 启动类型检查
  if (options.typeCheck) {
    tasks.push(startTypeCheck())
  }

  // 如果没有指定任何任务，显示帮助
  if (tasks.length === 0) {
    console.log('ℹ️  没有指定要启动的包或应用，显示帮助信息:\n')
    showHelp()
    return
  }

  try {
    await Promise.all(tasks)
    console.log('✅ 所有开发任务已完成')
  } catch (error) {
    console.error('❌ 开发任务失败:', error)
    process.exit(1)
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
