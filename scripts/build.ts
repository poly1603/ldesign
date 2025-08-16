#!/usr/bin/env tsx
/**
 * 统一的构建脚本
 *
 * 使用Vite6+替代Rollup，提供更好的构建性能和开发体验
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

interface BuildOptions {
  /** 要构建的包名列表 */
  packages?: string[]
  /** 要构建的应用名列表 */
  apps?: string[]
  /** 是否监听模式 */
  watch?: boolean
  /** 是否生产模式 */
  production?: boolean
  /** 是否启用分析 */
  analyze?: boolean
  /** 是否跳过类型检查 */
  skipTypeCheck?: boolean
  /** 是否跳过测试 */
  skipTests?: boolean
  /** 是否清理输出目录 */
  clean?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 解析命令行参数
 */
function parseArguments(): BuildOptions {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'packages': { type: 'string', short: 'p' },
      'apps': { type: 'string', short: 'a' },
      'watch': { type: 'boolean', short: 'w' },
      'production': { type: 'boolean' },
      'analyze': { type: 'boolean' },
      'skip-type-check': { type: 'boolean' },
      'skip-tests': { type: 'boolean' },
      'clean': { type: 'boolean', short: 'c' },
      'debug': { type: 'boolean', short: 'd' },
      'help': { type: 'boolean', short: 'h' },
    },
  })

  if (values.help) {
    showHelp()
    process.exit(0)
  }

  return {
    packages: values.packages?.split(',').map(p => p.trim()),
    apps: values.apps?.split(',').map(a => a.trim()),
    watch: values.watch,
    production: values.production,
    analyze: values.analyze,
    skipTypeCheck: values['skip-type-check'],
    skipTests: values['skip-tests'],
    clean: values.clean,
    debug: values.debug,
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
🏗️ LDesign 构建工具

用法:
  pnpm build [选项]

选项:
  -p, --packages <names>     构建指定包 (逗号分隔)
  -a, --apps <names>         构建指定应用 (逗号分隔)
  -w, --watch                监听模式
  --production               生产模式构建
  --analyze                  启用包分析
  --skip-type-check          跳过类型检查
  --skip-tests               跳过测试
  -c, --clean                清理输出目录
  -d, --debug                启用调试模式
  -h, --help                 显示帮助信息

示例:
  pnpm build                           # 构建所有包
  pnpm build -p engine,color           # 只构建engine和color包
  pnpm build -a demo-app               # 构建demo-app应用
  pnpm build --production              # 生产模式构建
  pnpm build -w                        # 监听模式构建
  pnpm build --analyze                 # 构建并分析包大小
`)
}

/**
 * 获取所有可用的包
 */
function getAvailablePackages(): string[] {
  const packagesDir = resolve(process.cwd(), 'packages')
  if (!existsSync(packagesDir))
    return []

  const { readdirSync, statSync } = require('node:fs')
  return readdirSync(packagesDir).filter((name: string) => {
    const packagePath = resolve(packagesDir, name)
    return (
      statSync(packagePath).isDirectory()
      && existsSync(resolve(packagePath, 'package.json'))
    )
  })
}

/**
 * 获取所有可用的应用
 */
function getAvailableApps(): string[] {
  const appsDir = resolve(process.cwd(), 'apps')
  if (!existsSync(appsDir))
    return []

  const { readdirSync, statSync } = require('node:fs')
  return readdirSync(appsDir).filter((name: string) => {
    const appPath = resolve(appsDir, name)
    return (
      statSync(appPath).isDirectory()
      && existsSync(resolve(appPath, 'package.json'))
    )
  })
}

/**
 * 构建包
 */
async function buildPackage(packageName: string, options: BuildOptions) {
  const packagePath = resolve(process.cwd(), 'packages', packageName)

  if (!existsSync(packagePath)) {
    console.error(`❌ 包 ${packageName} 不存在`)
    return false
  }

  console.log(`🔧 构建包 ${packageName}...`)

  const args = ['build']
  if (options.watch)
    args.push('--watch')
  if (options.analyze)
    args.push('--analyze')
  if (options.debug)
    args.push('--debug')

  const child = spawn('pnpm', args, {
    cwd: packagePath,
    stdio: 'inherit',
    shell: true,
  })

  return new Promise<boolean>((resolve) => {
    child.on('error', (error) => {
      console.error(`❌ 构建包 ${packageName} 失败:`, error)
      resolve(false)
    })
    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`✅ 包 ${packageName} 构建完成`)
        resolve(true)
      }
      else {
        console.error(`❌ 包 ${packageName} 构建失败，退出代码: ${code}`)
        resolve(false)
      }
    })
  })
}

/**
 * 构建应用
 */
async function buildApp(appName: string, options: BuildOptions) {
  const appPath = resolve(process.cwd(), 'apps', appName)

  if (!existsSync(appPath)) {
    console.error(`❌ 应用 ${appName} 不存在`)
    return false
  }

  console.log(`🚀 构建应用 ${appName}...`)

  const args = ['build']
  if (options.analyze)
    args.push('--analyze')
  if (options.debug)
    args.push('--debug')

  const child = spawn('pnpm', args, {
    cwd: appPath,
    stdio: 'inherit',
    shell: true,
  })

  return new Promise<boolean>((resolve) => {
    child.on('error', (error) => {
      console.error(`❌ 构建应用 ${appName} 失败:`, error)
      resolve(false)
    })
    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`✅ 应用 ${appName} 构建完成`)
        resolve(true)
      }
      else {
        console.error(`❌ 应用 ${appName} 构建失败，退出代码: ${code}`)
        resolve(false)
      }
    })
  })
}

/**
 * 运行类型检查
 */
async function runTypeCheck(): Promise<boolean> {
  console.log('🔍 运行类型检查...')

  const child = spawn('pnpm', ['type-check'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  })

  return new Promise<boolean>((resolve) => {
    child.on('error', (error) => {
      console.error('❌ 类型检查失败:', error)
      resolve(false)
    })
    child.on('exit', (code) => {
      if (code === 0) {
        console.log('✅ 类型检查通过')
        resolve(true)
      }
      else {
        console.error(`❌ 类型检查失败，退出代码: ${code}`)
        resolve(false)
      }
    })
  })
}

/**
 * 运行测试
 */
async function runTests(): Promise<boolean> {
  console.log('🧪 运行测试...')

  const child = spawn('pnpm', ['test:run'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  })

  return new Promise<boolean>((resolve) => {
    child.on('error', (error) => {
      console.error('❌ 测试失败:', error)
      resolve(false)
    })
    child.on('exit', (code) => {
      if (code === 0) {
        console.log('✅ 测试通过')
        resolve(true)
      }
      else {
        console.error(`❌ 测试失败，退出代码: ${code}`)
        resolve(false)
      }
    })
  })
}

/**
 * 主函数
 */
async function main() {
  const options = parseArguments()

  console.log('🏗️ LDesign 构建开始...\n')

  let success = true

  // 类型检查
  if (!options.skipTypeCheck) {
    const typeCheckSuccess = await runTypeCheck()
    if (!typeCheckSuccess) {
      success = false
      if (!options.watch) {
        console.error('❌ 类型检查失败，构建终止')
        process.exit(1)
      }
    }
  }

  // 运行测试
  if (!options.skipTests && !options.watch) {
    const testSuccess = await runTests()
    if (!testSuccess) {
      success = false
      console.error('❌ 测试失败，构建终止')
      process.exit(1)
    }
  }

  // 构建包
  const packages = options.packages || getAvailablePackages()
  for (const packageName of packages) {
    const buildSuccess = await buildPackage(packageName, options)
    if (!buildSuccess) {
      success = false
      if (!options.watch)
        break
    }
  }

  // 构建应用
  const apps = options.apps || []
  for (const appName of apps) {
    const buildSuccess = await buildApp(appName, options)
    if (!buildSuccess) {
      success = false
      if (!options.watch)
        break
    }
  }

  if (success) {
    console.log('\n✅ 所有构建任务完成')
  }
  else {
    console.log('\n❌ 部分构建任务失败')
    if (!options.watch) {
      process.exit(1)
    }
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
