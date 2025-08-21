#!/usr/bin/env tsx

/**
 * 自动化发布脚本
 * 处理版本更新、构建、测试和发布流程
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import readline from 'node:readline'

interface ReleaseOptions {
  type: 'patch' | 'minor' | 'major' | 'prerelease'
  tag?: string
  dryRun?: boolean
  skipTests?: boolean
  skipBuild?: boolean
  packages?: string[]
}

interface PackageJson {
  name: string
  version: string
  private?: boolean
}

/**
 * 创建readline接口
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

/**
 * 提示用户输入
 */
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

/**
 * 执行命令
 */
function exec(command: string, options: { silent?: boolean } = {}): string {
  if (!options.silent) {
    console.log(`📍 执行: ${command}`)
  }

  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
    }).toString()
  }
  catch (error: any) {
    throw new Error(`命令执行失败: ${command}\n${error.message}`)
  }
}

/**
 * 获取所有包
 */
function getAllPackages(): PackageJson[] {
  const rootDir = process.cwd()
  const packagesDir = join(rootDir, 'packages')

  const { readdirSync, statSync } = require('node:fs')
  const packages: PackageJson[] = []

  const dirs = readdirSync(packagesDir)

  for (const dir of dirs) {
    const packagePath = join(packagesDir, dir)
    if (!statSync(packagePath).isDirectory())
      continue

    const packageJsonPath = join(packagePath, 'package.json')
    if (!existsSync(packageJsonPath))
      continue

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    if (!packageJson.private) {
      packages.push(packageJson)
    }
  }

  return packages
}

/**
 * 检查Git状态
 */
async function checkGitStatus() {
  const status = exec('git status --porcelain', { silent: true })

  if (status) {
    console.error('❌ 工作区有未提交的更改')
    console.log('\n未提交的文件:')
    console.log(status)
    throw new Error('请先提交或暂存所有更改')
  }

  // 确保在主分支
  const branch = exec('git branch --show-current', { silent: true }).trim()
  if (branch !== 'main' && branch !== 'master') {
    const answer = await prompt(`⚠️  当前在 ${branch} 分支，是否继续？(y/n) `)
    if (answer.toLowerCase() !== 'y') {
      throw new Error('发布已取消')
    }
  }

  // 拉取最新代码
  console.log('📥 拉取最新代码...')
  exec('git pull')
}

/**
 * 运行预发布检查
 */
async function runPreReleaseChecks(options: ReleaseOptions) {
  console.log('\n🔍 运行预发布检查...\n')

  // 依赖检查
  console.log('📦 检查依赖...')
  try {
    exec('pnpm audit --audit-level=high', { silent: true })
    console.log('✅ 依赖安全检查通过')
  }
  catch {
    console.warn('⚠️  发现安全问题，建议修复后再发布')
  }

  // 代码质量检查
  console.log('\n📝 代码质量检查...')
  exec('pnpm lint')
  exec('pnpm type-check')

  // 测试
  if (!options.skipTests) {
    console.log('\n🧪 运行测试...')
    exec('pnpm test:run')
    console.log('✅ 所有测试通过')
  }

  // 构建
  if (!options.skipBuild) {
    console.log('\n🔨 构建包...')
    exec('pnpm build')
    console.log('✅ 构建成功')
  }

  // 包大小检查
  console.log('\n📏 检查包大小...')
  exec('pnpm size-check')
}

/**
 * 更新版本
 */
function updateVersion(options: ReleaseOptions) {
  console.log('\n📝 更新版本号...\n')

  let versionCommand = `pnpm changeset version`

  if (options.type === 'prerelease' && options.tag) {
    versionCommand += ` --snapshot ${options.tag}`
  }

  exec(versionCommand)

  // 提交版本更改
  const newVersion = getNewVersion()
  exec(`git add .`)
  exec(`git commit -m "chore: release v${newVersion}"`)

  return newVersion
}

/**
 * 获取新版本号
 */
function getNewVersion(): string {
  const rootPackageJson = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
  )
  return rootPackageJson.version
}

/**
 * 发布包
 */
async function publishPackages(options: ReleaseOptions) {
  console.log('\n📤 发布包到npm...\n')

  if (options.dryRun) {
    console.log('🔍 Dry run模式，跳过实际发布')
    exec('pnpm changeset publish --dry-run')
    return
  }

  // 确认发布
  const packages = getAllPackages()
  console.log('将要发布以下包:')
  packages.forEach((pkg) => {
    console.log(`  - ${pkg.name}@${pkg.version}`)
  })

  const answer = await prompt('\n确认发布？(y/n) ')
  if (answer.toLowerCase() !== 'y') {
    throw new Error('发布已取消')
  }

  // 发布
  let publishCommand = 'pnpm changeset publish'

  if (options.tag && options.tag !== 'latest') {
    publishCommand += ` --tag ${options.tag}`
  }

  exec(publishCommand)

  console.log('✅ 发布成功！')
}

/**
 * 创建Git标签
 */
function createGitTag(version: string) {
  console.log('\n🏷️  创建Git标签...')

  const tagName = `v${version}`
  exec(`git tag -a ${tagName} -m "Release ${tagName}"`)
  exec(`git push origin ${tagName}`)

  console.log(`✅ 已创建标签: ${tagName}`)
}

/**
 * 生成发布说明
 */
function generateReleaseNotes(version: string) {
  console.log('\n📄 生成发布说明...')

  const changelogPath = join(process.cwd(), 'CHANGELOG.md')

  if (!existsSync(changelogPath)) {
    console.warn('⚠️  未找到CHANGELOG.md')
    return
  }

  const changelog = readFileSync(changelogPath, 'utf-8')
  const versionSection = changelog.match(
    new RegExp(`## ${version}[\\s\\S]*?(?=## |$)`),
  )

  if (versionSection) {
    const releaseNotesPath = join(process.cwd(), `RELEASE_NOTES_${version}.md`)
    writeFileSync(releaseNotesPath, versionSection[0])
    console.log(`✅ 发布说明已生成: ${releaseNotesPath}`)
  }
}

/**
 * 主发布流程
 */
async function release(options: ReleaseOptions) {
  console.log('🚀 开始发布流程...\n')
  console.log('配置:', options)
  console.log('')

  try {
    // 1. 检查Git状态
    await checkGitStatus()

    // 2. 运行预发布检查
    await runPreReleaseChecks(options)

    // 3. 更新版本
    const newVersion = updateVersion(options)

    // 4. 发布包
    await publishPackages(options)

    // 5. 创建Git标签
    if (!options.dryRun) {
      createGitTag(newVersion)
    }

    // 6. 生成发布说明
    generateReleaseNotes(newVersion)

    // 7. 推送到远程
    if (!options.dryRun) {
      console.log('\n📤 推送到远程仓库...')
      exec('git push')
    }

    console.log('\n🎉 发布完成！')
    console.log(`   版本: v${newVersion}`)
    console.log(`   时间: ${new Date().toLocaleString()}`)

    // 后续步骤提示
    console.log('\n📋 后续步骤:')
    console.log('   1. 在GitHub上创建Release')
    console.log('   2. 更新文档')
    console.log('   3. 通知用户')
  }
  catch (error: any) {
    console.error('\n❌ 发布失败:', error.message)
    process.exit(1)
  }
  finally {
    rl.close()
  }
}

/**
 * 交互式发布向导
 */
async function interactiveRelease() {
  console.log('🎯 LDesign 发布向导\n')

  // 选择发布类型
  console.log('请选择发布类型:')
  console.log('  1. Patch (修复版本)')
  console.log('  2. Minor (新功能)')
  console.log('  3. Major (重大更新)')
  console.log('  4. Prerelease (预发布)')

  const typeChoice = await prompt('\n选择 (1-4): ')
  const types: ReleaseOptions['type'][] = [
    'patch',
    'minor',
    'major',
    'prerelease',
  ]
  const type = types[Number.parseInt(typeChoice) - 1]

  if (!type) {
    throw new Error('无效的选择')
  }

  const options: ReleaseOptions = { type }

  // 预发布标签
  if (type === 'prerelease') {
    const tag = await prompt('预发布标签 (如: beta, alpha): ')
    options.tag = tag || 'beta'
  }

  // 是否跳过测试
  const skipTests = await prompt('跳过测试？(y/n) [n]: ')
  options.skipTests = skipTests.toLowerCase() === 'y'

  // 是否dry run
  const dryRun = await prompt('Dry run模式？(y/n) [n]: ')
  options.dryRun = dryRun.toLowerCase() === 'y'

  await release(options)
}

// 解析命令行参数
const args = process.argv.slice(2)

if (args.length === 0) {
  // 交互式模式
  interactiveRelease().catch(console.error)
}
else {
  // 命令行模式
  const type = args[0] as ReleaseOptions['type']
  const options: ReleaseOptions = {
    type,
    tag: args.find(arg => arg.startsWith('--tag='))?.split('=')[1],
    dryRun: args.includes('--dry-run'),
    skipTests: args.includes('--skip-tests'),
    skipBuild: args.includes('--skip-build'),
  }

  release(options).catch(console.error)
}
