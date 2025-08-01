#!/usr/bin/env node

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface ReleaseOptions {
  type?: 'stable' | 'beta' | 'alpha'
  skipTests?: boolean
  skipBuild?: boolean
  dryRun?: boolean
}

/**
 * 检查工作目录状态
 */
function checkWorkingDirectory(): void {
  console.log('📋 检查工作目录状态...')
  const status = execSync('git status --porcelain', { encoding: 'utf-8' })
  if (status.trim()) {
    console.error('❌ 工作目录不干净，请先提交或暂存更改')
    process.exit(1)
  }
  console.log('✅ 工作目录干净\n')
}

/**
 * 拉取最新代码
 */
function pullLatestCode(): void {
  console.log('📥 拉取最新代码...')
  execSync('git pull origin main', { stdio: 'inherit' })
  console.log('✅ 代码已更新\n')
}

/**
 * 安装依赖
 */
function installDependencies(): void {
  console.log('📦 安装依赖...')
  execSync('pnpm install', { stdio: 'inherit' })
  console.log('✅ 依赖安装完成\n')
}

/**
 * 运行测试
 */
function runTests(): void {
  console.log('🧪 运行测试...')
  execSync('pnpm test:run', { stdio: 'inherit' })
  console.log('✅ 测试通过\n')
}

/**
 * 类型检查
 */
function typeCheck(): void {
  console.log('🔍 类型检查...')
  execSync('pnpm type-check:packages', { stdio: 'inherit' })
  console.log('✅ 类型检查通过\n')
}

/**
 * 代码检查
 */
function lintCheck(): void {
  console.log('🔧 代码检查...')
  execSync('pnpm lint', { stdio: 'inherit' })
  console.log('✅ 代码检查通过\n')
}

/**
 * 构建项目
 */
function buildProject(): void {
  console.log('🏗️  构建包...')
  execSync('pnpm build', { stdio: 'inherit' })
  console.log('✅ 构建完成\n')
}

/**
 * 包大小检查
 */
function sizeCheck(): void {
  console.log('📏 检查包大小...')
  try {
    execSync('pnpm size-check', { stdio: 'inherit' })
    console.log('✅ 包大小检查通过\n')
  }
  catch (error) {
    console.warn('⚠️  包大小检查失败，但继续发布\n')
  }
}

/**
 * 检查变更集
 */
function checkChangesets(): boolean {
  console.log('📝 检查变更集...')
  const changesetFiles = fs.readdirSync('.changeset').filter(file =>
    file.endsWith('.md') && file !== 'README.md',
  )

  if (changesetFiles.length === 0) {
    console.log('ℹ️  没有待处理的变更集')
    console.log('💡 如果需要发布，请先运行: pnpm changeset')
    return false
  }

  console.log(`✅ 找到 ${changesetFiles.length} 个变更集\n`)
  return true
}

/**
 * 版本更新
 */
function updateVersions(): void {
  console.log('🔢 更新版本...')
  execSync('pnpm changeset version', { stdio: 'inherit' })
  console.log('✅ 版本更新完成\n')
}

/**
 * 提交版本更新
 */
function commitVersions(): void {
  console.log('💾 提交版本更新...')
  execSync('git add .', { stdio: 'inherit' })
  execSync('git commit -m "chore: update versions"', { stdio: 'inherit' })
  console.log('✅ 版本更新已提交\n')
}

/**
 * 发布到 npm
 */
function publishToNpm(tag?: string): void {
  console.log('📤 发布到 npm...')
  const command = tag ? `pnpm changeset publish --tag ${tag}` : 'pnpm changeset publish'
  execSync(command, { stdio: 'inherit' })
  console.log('✅ 发布完成\n')
}

/**
 * 推送到远程
 */
function pushToRemote(): void {
  console.log('⬆️  推送到远程仓库...')
  execSync('git push origin main --follow-tags', { stdio: 'inherit' })
  console.log('✅ 推送完成\n')
}

/**
 * 进入预发布模式
 */
function enterPrereleaseMode(tag: string): void {
  console.log(`🔄 进入预发布模式 (${tag})...`)
  execSync(`pnpm changeset pre enter ${tag}`, { stdio: 'inherit' })
  console.log('✅ 已进入预发布模式\n')
}

/**
 * 退出预发布模式
 */
function exitPrereleaseMode(): void {
  console.log('🔄 退出预发布模式...')
  execSync('pnpm changeset pre exit', { stdio: 'inherit' })
  console.log('✅ 已退出预发布模式\n')
}

/**
 * 正式发布
 */
export async function release(options: ReleaseOptions = {}): Promise<void> {
  const { skipTests = false, skipBuild = false, dryRun = false } = options

  console.log('🚀 开始发布流程...\n')

  try {
    // 1. 检查工作目录
    checkWorkingDirectory()

    // 2. 拉取最新代码
    pullLatestCode()

    // 3. 安装依赖
    installDependencies()

    if (!skipTests) {
      // 4. 运行测试
      runTests()

      // 5. 类型检查
      typeCheck()

      // 6. 代码检查
      lintCheck()
    }

    if (!skipBuild) {
      // 7. 构建
      buildProject()

      // 8. 包大小检查
      sizeCheck()
    }

    // 9. 检查变更集
    if (!checkChangesets()) {
      return
    }

    if (dryRun) {
      console.log('🔍 干运行模式，跳过实际发布')
      return
    }

    // 10. 版本更新
    updateVersions()

    // 11. 提交版本更新
    commitVersions()

    // 12. 发布到 npm
    publishToNpm()

    // 13. 推送到远程
    pushToRemote()

    console.log('🎉 发布流程完成！')
  }
  catch (error) {
    console.error('❌ 发布失败:', (error as Error).message)
    process.exit(1)
  }
}

/**
 * 预发布
 */
export async function prerelease(tag: string = 'beta', options: ReleaseOptions = {}): Promise<void> {
  const { skipTests = false, skipBuild = false, dryRun = false } = options

  console.log(`🚀 开始预发布流程 (${tag})...\n`)

  try {
    // 基本检查和构建
    installDependencies()

    if (!skipTests) {
      runTests()
    }

    if (!skipBuild) {
      buildProject()
    }

    if (dryRun) {
      console.log('🔍 干运行模式，跳过实际发布')
      return
    }

    // 进入预发布模式
    enterPrereleaseMode(tag)

    // 版本更新
    updateVersions()

    // 发布 beta 版本
    console.log(`📤 发布 ${tag} 版本...`)
    publishToNpm(tag)

    console.log(`🎉 ${tag} 版本发布完成！`)
  }
  catch (error) {
    console.error('❌ 预发布失败:', (error as Error).message)
    process.exit(1)
  }
}

// CLI 处理
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const command = args[0]

  const options: ReleaseOptions = {
    skipTests: args.includes('--skip-tests'),
    skipBuild: args.includes('--skip-build'),
    dryRun: args.includes('--dry-run'),
  }

  switch (command) {
    case 'beta':
    case 'prerelease':
      prerelease('beta', options)
      break
    case 'alpha':
      prerelease('alpha', options)
      break
    case 'stable':
    case undefined:
      release(options)
      break
    default:
      console.log('用法:')
      console.log('  tsx tools/release/version-manager.ts [stable]  # 正式发布')
      console.log('  tsx tools/release/version-manager.ts beta     # beta发布')
      console.log('  tsx tools/release/version-manager.ts alpha    # alpha发布')
      console.log('')
      console.log('选项:')
      console.log('  --skip-tests   跳过测试')
      console.log('  --skip-build   跳过构建')
      console.log('  --dry-run      干运行模式')
      process.exit(1)
  }
}
