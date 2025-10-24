#!/usr/bin/env tsx

import { execSync } from 'child_process'
import * as fs from 'fs-extra'
import * as path from 'path'

const GITHUB_USERNAME = 'poly1603'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

interface PackageInfo {
  name: string
  dir: string
  repoName: string
  description: string
}

const packages: PackageInfo[] = [
  {
    name: '@ldesign/git',
    dir: 'tools/git',
    repoName: 'ldesign-git',
    description: 'LDesign Git 工具 - Git 操作、仓库管理、提交分析'
  },
  {
    name: '@ldesign/generator',
    dir: 'tools/generator',
    repoName: 'ldesign-generator',
    description: 'LDesign 代码生成器 - 快速生成组件、页面、配置文件等'
  },
  {
    name: '@ldesign/deps',
    dir: 'tools/deps',
    repoName: 'ldesign-deps',
    description: 'LDesign 依赖管理工具 - 依赖分析、更新检查、版本管理'
  },
  {
    name: '@ldesign/security',
    dir: 'tools/security',
    repoName: 'ldesign-security',
    description: 'LDesign 安全工具 - 依赖安全扫描、漏洞检测、代码审计'
  }
]

/**
 * 执行命令
 */
function exec(command: string, cwd?: string): string {
  console.log(`> ${command}`)
  try {
    return execSync(command, {
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe'
    })
  } catch (error: any) {
    console.error(`命令执行失败: ${command}`)
    console.error(error.message)
    throw error
  }
}

/**
 * 创建 GitHub 仓库
 */
async function createGitHubRepo(repoName: string, description: string): Promise<void> {
  console.log(`\n📦 创建 GitHub 仓库: ${repoName}`)
  
  const createRepoCommand = `curl -H "Authorization: token ${GITHUB_TOKEN}" ` +
    `-H "Accept: application/vnd.github.v3+json" ` +
    `https://api.github.com/user/repos ` +
    `-d "{\\"name\\":\\"${repoName}\\",\\"description\\":\\"${description}\\",\\"private\\":false}"`
  
  try {
    exec(createRepoCommand)
    console.log(`✅ 仓库创建成功: https://github.com/${GITHUB_USERNAME}/${repoName}`)
  } catch (error) {
    console.warn(`⚠️  仓库可能已存在或创建失败`)
  }
}

/**
 * 初始化 Git 仓库并推送
 */
async function initAndPushRepo(packageDir: string, repoName: string): Promise<void> {
  console.log(`\n🔧 初始化 Git 仓库: ${packageDir}`)
  
  const fullPath = path.join(process.cwd(), packageDir)
  
  // 检查是否已经是 git 仓库
  const gitDir = path.join(fullPath, '.git')
  if (fs.existsSync(gitDir)) {
    console.log('  已存在 .git 目录，跳过初始化')
  } else {
    // 初始化 Git 仓库
    exec('git init', fullPath)
    exec('git add .', fullPath)
    exec('git commit -m "Initial commit"', fullPath)
  }
  
  // 添加远程仓库
  const remoteUrl = `https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${repoName}.git`
  
  try {
    exec(`git remote add origin ${remoteUrl}`, fullPath)
  } catch (error) {
    console.log('  远程仓库已存在，尝试更新...')
    exec(`git remote set-url origin ${remoteUrl}`, fullPath)
  }
  
  // 推送到 GitHub
  try {
    exec('git branch -M main', fullPath)
    exec('git push -u origin main --force', fullPath)
    console.log(`✅ 推送成功`)
  } catch (error) {
    console.error(`❌ 推送失败`)
    throw error
  }
}

/**
 * 将仓库添加为子模块
 */
async function addSubmodule(packageDir: string, repoName: string): Promise<void> {
  console.log(`\n🔗 配置子模块: ${packageDir}`)
  
  const repoUrl = `https://github.com/${GITHUB_USERNAME}/${repoName}.git`
  
  // 如果目录已存在，先删除
  const fullPath = path.join(process.cwd(), packageDir)
  if (fs.existsSync(fullPath)) {
    // 备份重要文件
    const backupDir = `${fullPath}_backup_${Date.now()}`
    console.log(`  备份目录到: ${backupDir}`)
    fs.copySync(fullPath, backupDir)
    
    // 删除原目录
    fs.removeSync(fullPath)
  }
  
  // 添加子模块
  try {
    exec(`git submodule add ${repoUrl} ${packageDir}`)
    console.log(`✅ 子模块添加成功`)
  } catch (error) {
    console.error(`❌ 子模块添加失败`)
    // 恢复备份
    const backupDirs = fs.readdirSync(process.cwd()).filter(d => d.startsWith(`${path.basename(packageDir)}_backup_`))
    if (backupDirs.length > 0) {
      const latestBackup = backupDirs.sort().reverse()[0]
      console.log(`  从备份恢复: ${latestBackup}`)
      fs.copySync(latestBackup, fullPath)
    }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始设置 GitHub 子模块...\n')
  console.log(`GitHub 用户: ${GITHUB_USERNAME}`)
  console.log(`包数量: ${packages.length}\n`)
  
  for (const pkg of packages) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`处理包: ${pkg.name}`)
    console.log(`${'='.repeat(60)}`)
    
    try {
      // 1. 创建 GitHub 仓库
      await createGitHubRepo(pkg.repoName, pkg.description)
      
      // 等待 GitHub API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 2. 初始化并推送
      await initAndPushRepo(pkg.dir, pkg.repoName)
      
      // 等待推送完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log(`✅ ${pkg.name} 处理完成`)
    } catch (error) {
      console.error(`❌ ${pkg.name} 处理失败:`, error)
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✨ 所有包处理完成！')
  console.log('='.repeat(60))
  
  console.log('\n📝 下一步操作:')
  console.log('1. 如需配置为子模块，请运行:')
  packages.forEach(pkg => {
    console.log(`   git submodule add https://github.com/${GITHUB_USERNAME}/${pkg.repoName}.git ${pkg.dir}`)
  })
  console.log('\n2. 初始化子模块:')
  console.log('   git submodule update --init --recursive')
  console.log('\n3. 查看创建的仓库:')
  packages.forEach(pkg => {
    console.log(`   https://github.com/${GITHUB_USERNAME}/${pkg.repoName}`)
  })
}

main().catch(console.error)

