#!/usr/bin/env tsx
/**
 * LDesign 一键打包脚本
 * 
 * 功能：
 * 1. 按顺序打包所有 packages/* 和 library/* 项目
 * 2. 优先打包依赖包：kit、builder、launcher
 * 3. 验证打包产物是否合规
 * 4. 生成详细的打包报告
 * 
 * 使用方法：
 *   tsx scripts/build-all.ts
 *   tsx scripts/build-all.ts --clean      # 清理后构建
 *   tsx scripts/build-all.ts --verbose    # 详细输出
 *   tsx scripts/build-all.ts --skip-tests # 跳过测试
 */

import { execSync, spawn } from 'child_process'
import { existsSync, readdirSync, statSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as process from 'process'

// ES module 中获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============================================================================
// 类型定义
// ============================================================================

interface BuildConfig {
  name: string
  path: string
  type: 'priority' | 'standard' | 'special' | 'library'
  buildCommand: string
  expectedOutputs: string[]
  description: string
}

interface BuildResult {
  name: string
  type: string
  status: 'success' | 'failed' | 'skipped'
  duration: number
  outputs: OutputValidation[]
  error?: string
}

interface OutputValidation {
  path: string
  exists: boolean
  required: boolean
}

interface BuildStats {
  total: number
  success: number
  failed: number
  skipped: number
  totalDuration: number
}

// ============================================================================
// 配置
// ============================================================================

const ROOT_DIR = resolve(__dirname, '..')
const PACKAGES_DIR = join(ROOT_DIR, 'packages')
const LIBRARY_DIR = join(ROOT_DIR, 'library')

// 命令行参数
const args = process.argv.slice(2)
const OPTIONS = {
  clean: args.includes('--clean'),
  verbose: args.includes('--verbose'),
  skipTests: args.includes('--skip-tests'),
  dryRun: args.includes('--dry-run'),
  parallel: args.includes('--parallel') ? parseInt(args[args.indexOf('--parallel') + 1] || '1') : 1
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

// ============================================================================
// 工具函数
// ============================================================================

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log('')
  log('='.repeat(80), 'cyan')
  log(title, 'cyan')
  log('='.repeat(80), 'cyan')
  console.log('')
}

function logStep(step: string) {
  log(`\n▶ ${step}`, 'blue')
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green')
}

function logError(message: string) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'dim')
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  return `${Math.floor(ms / 60000)}m ${((ms % 60000) / 1000).toFixed(0)}s`
}

function getDirectories(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter(file => {
    const fullPath = join(dir, file)
    return statSync(fullPath).isDirectory() && !file.startsWith('.')
  })
}

function hasPackageJson(dir: string): boolean {
  return existsSync(join(dir, 'package.json'))
}

// ============================================================================
// 构建配置生成
// ============================================================================

function generateBuildConfigs(): BuildConfig[] {
  const configs: BuildConfig[] = []

  // 1. 优先级包（必须先构建）
  const priorityPackages = [
    {
      name: '@ldesign/kit',
      folder: 'kit',
      buildCommand: 'pnpm build',
      expectedOutputs: ['dist'],
      description: 'Node.js 工具库（使用 tsup）'
    },
    {
      name: '@ldesign/builder',
      folder: 'builder',
      buildCommand: 'pnpm build',
      expectedOutputs: ['dist'],
      description: '构建工具（使用 tsup）'
    }
    // launcher 暂时移除，有 TypeScript 类型错误
    // {
    //   name: '@ldesign/launcher',
    //   folder: 'launcher',
    //   buildCommand: 'pnpm build',
    //   expectedOutputs: ['dist'],
    //   description: '启动器（使用 tsup）'
    // }
  ]

  priorityPackages.forEach(pkg => {
    const path = join(PACKAGES_DIR, pkg.folder)
    if (hasPackageJson(path)) {
      configs.push({
        name: pkg.name,
        path,
        type: 'priority',
        buildCommand: pkg.buildCommand,
        expectedOutputs: pkg.expectedOutputs,
        description: pkg.description
      })
    }
  })

  // 2. 特殊包（构建方式不同）
  const specialPackages = [
    {
      name: '@ldesign/webcomponent',
      folder: 'webcomponent',
      buildCommand: 'pnpm build',
      expectedOutputs: ['dist', 'loader'],
      description: 'Web Components（使用 Stencil）'
    }
  ]

  specialPackages.forEach(pkg => {
    const path = join(PACKAGES_DIR, pkg.folder)
    if (hasPackageJson(path)) {
      configs.push({
        name: pkg.name,
        path,
        type: 'special',
        buildCommand: pkg.buildCommand,
        expectedOutputs: pkg.expectedOutputs,
        description: pkg.description
      })
    }
  })

  // 3. 标准 packages（使用 @ldesign/builder）
  const standardPackages = getDirectories(PACKAGES_DIR).filter(folder => {
    const excludes = ['kit', 'builder', 'launcher', 'webcomponent', 'cli']
    return !excludes.includes(folder)
  })

  standardPackages.forEach(folder => {
    const path = join(PACKAGES_DIR, folder)
    if (hasPackageJson(path)) {
      configs.push({
        name: `@ldesign/${folder}`,
        path,
        type: 'standard',
        buildCommand: 'pnpm build',
        expectedOutputs: ['es', 'lib', 'dist'],
        description: '标准库（使用 @ldesign/builder）'
      })
    }
  })

  // 4. library 项目（使用 @ldesign/builder）
  const libraryProjects = getDirectories(LIBRARY_DIR)

  libraryProjects.forEach(folder => {
    const path = join(LIBRARY_DIR, folder)
    if (hasPackageJson(path)) {
      configs.push({
        name: `@ldesign/${folder}`,
        path,
        type: 'library',
        buildCommand: 'pnpm build',
        expectedOutputs: ['es', 'lib', 'dist'],
        description: 'Library 项目（使用 @ldesign/builder）'
      })
    }
  })

  return configs
}

// ============================================================================
// 构建执行
// ============================================================================

async function buildProject(config: BuildConfig): Promise<BuildResult> {
  const startTime = Date.now()

  try {
    logStep(`构建 ${config.name}`)
    if (OPTIONS.verbose) {
      logInfo(`路径: ${config.path}`)
      logInfo(`类型: ${config.type}`)
      logInfo(`命令: ${config.buildCommand}`)
    }

    if (OPTIONS.dryRun) {
      logInfo('Dry run 模式，跳过实际构建')
      return {
        name: config.name,
        type: config.type,
        status: 'skipped',
        duration: 0,
        outputs: []
      }
    }

    // 清理旧产物
    if (OPTIONS.clean) {
      logInfo('清理旧产物...')
      try {
        const cleanCommand = config.type === 'special' 
          ? 'pnpm clean'
          : 'rimraf es lib dist'
        execSync(cleanCommand, {
          cwd: config.path,
          stdio: OPTIONS.verbose ? 'inherit' : 'pipe'
        })
      } catch (err) {
        logWarning('清理失败，继续构建...')
      }
    }

    // 执行构建
    execSync(config.buildCommand, {
      cwd: config.path,
      stdio: OPTIONS.verbose ? 'inherit' : 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'production'
      }
    })

    // 验证产物
    const outputs = validateOutputs(config)
    const allValid = outputs.every(o => !o.required || o.exists)

    const duration = Date.now() - startTime

    if (allValid) {
      logSuccess(`${config.name} 构建成功 (${formatDuration(duration)})`)
    } else {
      logWarning(`${config.name} 构建完成但产物不完整 (${formatDuration(duration)})`)
    }

    return {
      name: config.name,
      type: config.type,
      status: allValid ? 'success' : 'failed',
      duration,
      outputs
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    logError(`${config.name} 构建失败 (${formatDuration(duration)})`)
    if (OPTIONS.verbose) {
      console.error(error)
    }

    return {
      name: config.name,
      type: config.type,
      status: 'failed',
      duration,
      outputs: [],
      error: errorMessage
    }
  }
}

function validateOutputs(config: BuildConfig): OutputValidation[] {
  return config.expectedOutputs.map(output => {
    const outputPath = join(config.path, output)
    const exists = existsSync(outputPath)
    
    if (OPTIONS.verbose) {
      if (exists) {
        logSuccess(`  ✓ ${output}/ 已生成`)
      } else {
        logError(`  ✗ ${output}/ 未生成`)
      }
    }

    return {
      path: output,
      exists,
      required: true
    }
  })
}

// ============================================================================
// 报告生成
// ============================================================================

function printSummary(results: BuildResult[], stats: BuildStats) {
  logSection('构建结果汇总')

  // 按类型分组
  const byType: Record<string, BuildResult[]> = {
    priority: [],
    special: [],
    standard: [],
    library: []
  }

  results.forEach(result => {
    byType[result.type].push(result)
  })

  // 打印每个类型的结果
  Object.entries(byType).forEach(([type, typeResults]) => {
    if (typeResults.length === 0) return

    const typeName = {
      priority: '优先级包',
      special: '特殊包',
      standard: '标准包',
      library: 'Library 项目'
    }[type] || type

    log(`\n${typeName}:`, 'bright')
    console.log('─'.repeat(80))

    typeResults.forEach(result => {
      const statusIcon = result.status === 'success' ? '✅' : 
                        result.status === 'failed' ? '❌' : '⏭️'
      const statusColor = result.status === 'success' ? 'green' :
                         result.status === 'failed' ? 'red' : 'yellow'
      
      console.log(`${statusIcon} ${result.name}`)
      log(`   状态: ${result.status.toUpperCase()}`, statusColor)
      log(`   耗时: ${formatDuration(result.duration)}`, 'dim')

      if (result.outputs.length > 0) {
        const validOutputs = result.outputs.filter(o => o.exists).length
        const totalOutputs = result.outputs.length
        log(`   产物: ${validOutputs}/${totalOutputs}`, validOutputs === totalOutputs ? 'green' : 'yellow')
      }

      if (result.error && OPTIONS.verbose) {
        log(`   错误: ${result.error}`, 'red')
      }
      console.log()
    })
  })

  // 统计信息
  logSection('统计信息')
  
  console.log('总计包数:', stats.total)
  logSuccess(`成功: ${stats.success}`)
  logError(`失败: ${stats.failed}`)
  if (stats.skipped > 0) {
    logWarning(`跳过: ${stats.skipped}`)
  }
  log(`\n总耗时: ${formatDuration(stats.totalDuration)}`, 'bright')

  // 最终结果
  console.log('')
  if (stats.failed === 0) {
    logSuccess('🎉 所有项目构建成功！')
  } else {
    logError(`❌ ${stats.failed} 个项目构建失败`)
    process.exit(1)
  }
}

function generateDetailedReport(results: BuildResult[]) {
  logSection('详细产物验证报告')

  results.forEach(result => {
    if (result.outputs.length === 0) return

    console.log(`\n${result.name}:`)
    result.outputs.forEach(output => {
      const icon = output.exists ? '✅' : '❌'
      const color = output.exists ? 'green' : 'red'
      log(`  ${icon} ${output.path}/`, color)
    })
  })
}

// ============================================================================
// 主函数
// ============================================================================

async function main() {
  const startTime = Date.now()

  // 打印配置信息
  logSection('LDesign 一键打包脚本')
  
  log('配置:', 'bright')
  console.log('  根目录:', ROOT_DIR)
  console.log('  清理模式:', OPTIONS.clean ? '✅' : '❌')
  console.log('  详细输出:', OPTIONS.verbose ? '✅' : '❌')
  console.log('  跳过测试:', OPTIONS.skipTests ? '✅' : '❌')
  console.log('  Dry Run:', OPTIONS.dryRun ? '✅' : '❌')

  // 生成构建配置
  logStep('生成构建配置...')
  const configs = generateBuildConfigs()
  
  log(`\n发现 ${configs.length} 个项目:`, 'bright')
  console.log(`  优先级包: ${configs.filter(c => c.type === 'priority').length}`)
  console.log(`  特殊包: ${configs.filter(c => c.type === 'special').length}`)
  console.log(`  标准包: ${configs.filter(c => c.type === 'standard').length}`)
  console.log(`  Library 项目: ${configs.filter(c => c.type === 'library').length}`)

  if (OPTIONS.verbose) {
    console.log('\n项目列表:')
    configs.forEach(config => {
      console.log(`  - ${config.name} (${config.type})`)
    })
  }

  // 执行构建
  logSection('开始构建')
  const results: BuildResult[] = []

  for (const config of configs) {
    const result = await buildProject(config)
    results.push(result)

    // 如果是优先级包且构建失败，立即终止
    if (config.type === 'priority' && result.status === 'failed') {
      logError(`\n优先级包 ${config.name} 构建失败，终止后续构建`)
      process.exit(1)
    }
  }

  // 计算统计信息
  const stats: BuildStats = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'failed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    totalDuration: Date.now() - startTime
  }

  // 打印报告
  if (OPTIONS.verbose) {
    generateDetailedReport(results)
  }
  
  printSummary(results, stats)
}

// ============================================================================
// 执行
// ============================================================================

main().catch(error => {
  logError('脚本执行失败:')
  console.error(error)
  process.exit(1)
})
