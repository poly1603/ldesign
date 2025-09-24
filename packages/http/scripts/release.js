#!/usr/bin/env node

/**
 * 自动化发布脚本
 *
 * 功能：
 * - 版本号管理
 * - 自动生成 CHANGELOG
 * - Git 标签管理
 * - NPM 发布
 * - 构建验证
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// const __filename = fileURLToPath(import.meta.url)

// 颜色输出
const colors = {
  reset: '\x1B[0m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      ...options,
    })
  }
  catch {
    log(`执行命令失败: ${command}`, 'red')
    process.exit(1)
  }
}

function execSilent(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim()
  }
  catch {
    return ''
  }
}

// 检查工作目录是否干净
function checkWorkingDirectory() {
  log('检查工作目录状态...', 'blue')
  const status = execSilent('git status --porcelain')
  if (status) {
    log('工作目录不干净，请先提交或暂存更改', 'red')
    log(status, 'yellow')
    process.exit(1)
  }
  log('工作目录干净 ✓', 'green')
}

// 检查当前分支
function checkBranch() {
  log('检查当前分支...', 'blue')
  const branch = execSilent('git branch --show-current')
  if (branch !== 'main' && branch !== 'master') {
    log(`当前分支是 ${branch}，建议在 main/master 分支发布`, 'yellow')
    // 简化处理，跳过交互式确认
    log('继续在当前分支发布...', 'yellow')
  }
  log(`当前分支: ${branch} ✓`, 'green')
}

// 运行测试
function runTests() {
  log('运行测试套件...', 'blue')
  exec('pnpm test:run')
  log('所有测试通过 ✓', 'green')
}

// 运行代码检查
function runLinting() {
  log('运行代码检查...', 'blue')
  exec('pnpm lint:check')
  exec('pnpm type-check')
  log('代码检查通过 ✓', 'green')
}

// 构建项目
function buildProject() {
  log('构建项目...', 'blue')
  exec('pnpm build')
  log('项目构建完成 ✓', 'green')
}

// 检查包大小
function checkBundleSize() {
  log('检查包大小...', 'blue')
  exec('pnpm size-check')
  log('包大小检查通过 ✓', 'green')
}

// 更新版本号
function updateVersion(type) {
  log(`更新版本号 (${type})...`, 'blue')
  const result = execSilent(`npm version ${type} --no-git-tag-version`)
  const newVersion = result.replace('v', '')
  log(`版本号已更新到: ${newVersion} ✓`, 'green')
  return newVersion
}

// 生成 CHANGELOG
function generateChangelog(version) {
  log('生成 CHANGELOG...', 'blue')

  // 获取上一个版本标签
  const lastTag = execSilent('git describe --tags --abbrev=0 2>/dev/null || echo ""')
  const range = lastTag ? `${lastTag}..HEAD` : 'HEAD'

  // 获取提交记录
  const commits = execSilent(`git log ${range} --pretty=format:"%h %s" --no-merges`)

  if (!commits) {
    log('没有新的提交记录', 'yellow')
    return
  }

  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md')
  const date = new Date().toISOString().split('T')[0]

  let changelog = ''
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8')
  }
  else {
    changelog = '# Changelog\n\n'
  }

  // 分类提交
  const features = []
  const fixes = []
  const others = []

  commits.split('\n').forEach((commit) => {
    if (commit.includes('feat:') || commit.includes('feature:')) {
      features.push(commit)
    }
    else if (commit.includes('fix:') || commit.includes('bugfix:')) {
      fixes.push(commit)
    }
    else {
      others.push(commit)
    }
  })

  let newEntry = `## [${version}] - ${date}\n\n`

  if (features.length > 0) {
    newEntry += '### ✨ 新功能\n\n'
    features.forEach((commit) => {
      newEntry += `- ${commit}\n`
    })
    newEntry += '\n'
  }

  if (fixes.length > 0) {
    newEntry += '### 🐛 修复\n\n'
    fixes.forEach((commit) => {
      newEntry += `- ${commit}\n`
    })
    newEntry += '\n'
  }

  if (others.length > 0) {
    newEntry += '### 🔧 其他\n\n'
    others.forEach((commit) => {
      newEntry += `- ${commit}\n`
    })
    newEntry += '\n'
  }

  // 插入到文件开头
  const lines = changelog.split('\n')
  const insertIndex = lines.findIndex(line => line.startsWith('## '))
  if (insertIndex === -1) {
    changelog = changelog + newEntry
  }
  else {
    lines.splice(insertIndex, 0, newEntry)
    changelog = lines.join('\n')
  }

  fs.writeFileSync(changelogPath, changelog)
  log('CHANGELOG 已更新 ✓', 'green')
}

// 提交更改
function commitChanges(version) {
  log('提交更改...', 'blue')
  exec('git add .')
  exec(`git commit -m "chore: release v${version}"`)
  log('更改已提交 ✓', 'green')
}

// 创建标签
function createTag(version) {
  log('创建 Git 标签...', 'blue')
  exec(`git tag -a v${version} -m "Release v${version}"`)
  log(`标签 v${version} 已创建 ✓`, 'green')
}

// 推送到远程
function pushToRemote() {
  log('推送到远程仓库...', 'blue')
  exec('git push')
  exec('git push --tags')
  log('已推送到远程仓库 ✓', 'green')
}

// 发布到 NPM
function publishToNpm(tag = 'latest') {
  log(`发布到 NPM (${tag})...`, 'blue')
  exec(`pnpm publish --tag ${tag} --access public`)
  log('已发布到 NPM ✓', 'green')
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const versionType = args[0] || 'patch' // patch, minor, major
  const npmTag = args[1] || 'latest'

  if (!['patch', 'minor', 'major', 'prerelease'].includes(versionType)) {
    log('无效的版本类型。支持: patch, minor, major, prerelease', 'red')
    process.exit(1)
  }

  log('🚀 开始发布流程...', 'cyan')
  log(`版本类型: ${versionType}`, 'blue')
  log(`NPM 标签: ${npmTag}`, 'blue')

  try {
    // 预检查
    checkWorkingDirectory()
    checkBranch()

    // 质量检查
    runLinting()
    runTests()
    buildProject()
    checkBundleSize()

    // 版本管理
    const newVersion = updateVersion(versionType)
    generateChangelog(newVersion)

    // Git 操作
    commitChanges(newVersion)
    createTag(newVersion)

    // 发布
    pushToRemote()
    publishToNpm(npmTag)

    log('🎉 发布完成！', 'green')
    log(`版本: v${newVersion}`, 'green')
    log(`NPM: https://www.npmjs.com/package/@ldesign/http`, 'blue')
  }
  catch (error) {
    log('发布失败', 'red')
    log(error.message, 'red')
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export {
  buildProject,
  checkWorkingDirectory,
  main,
  publishToNpm,
  runTests,
  updateVersion,
}
