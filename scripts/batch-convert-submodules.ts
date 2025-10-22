#!/usr/bin/env node
/**
 * 批量将新包转换为 Git Submodule
 * 
 * 使用方法:
 * 1. 设置环境变量: $env:GITHUB_TOKEN="your_token"
 * 2. 运行: pnpm convert-to-submodules
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'
import * as fs from 'fs'
import * as https from 'https'

const execAsync = promisify(exec)

// GitHub 配置
const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN || '',
  owner: process.env.GITHUB_OWNER || 'poly1603',
}

// 新包列表（刚才创建的 25 个包）
const NEW_PACKAGES = [
  // P0 - packages
  { dir: 'packages', name: 'icons' },
  { dir: 'packages', name: 'logger' },
  { dir: 'packages', name: 'validator' },
  { dir: 'packages', name: 'auth' },
  { dir: 'packages', name: 'notification' },

  // P1 - packages
  { dir: 'packages', name: 'websocket' },
  { dir: 'packages', name: 'permission' },
  { dir: 'packages', name: 'animation' },
  { dir: 'packages', name: 'file' },
  { dir: 'packages', name: 'storage' },

  // P2 - libraries
  { dir: 'libraries', name: 'gantt' },
  { dir: 'libraries', name: 'mindmap' },
  { dir: 'libraries', name: 'signature' },
  { dir: 'libraries', name: 'barcode' },
  { dir: 'libraries', name: 'calendar' },
  { dir: 'libraries', name: 'timeline' },
  { dir: 'libraries', name: 'tree' },
  { dir: 'libraries', name: 'upload' },
  { dir: 'libraries', name: 'player' },
  { dir: 'libraries', name: 'markdown' },

  // P3 - tools
  { dir: 'tools', name: 'tester' },
  { dir: 'tools', name: 'deployer' },
  { dir: 'tools', name: 'docs-generator' },
  { dir: 'tools', name: 'monitor' },
  { dir: 'tools', name: 'analyzer' },
]

/**
 * 创建 GitHub 仓库
 */
async function createGithubRepo(repoName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: repoName,
      private: false,
      auto_init: false,
      description: `LDesign ${repoName} package`,
    })

    const options = {
      hostname: 'api.github.com',
      path: '/user/repos',
      method: 'POST',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      res.on('data', chunk => responseData += chunk)
      res.on('end', () => {
        if (res.statusCode === 201) {
          const repo = JSON.parse(responseData)
          resolve(repo.clone_url)
        }
        else if (res.statusCode === 422) {
          // 已存在
          resolve(`https://github.com/${GITHUB_CONFIG.owner}/${repoName}.git`)
        }
        else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`))
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

/**
 * 转换单个包
 */
async function convertPackage(pkg: { dir: string, name: string }): Promise<boolean> {
  const packagePath = path.join(process.cwd(), pkg.dir, pkg.name)
  const repoName = pkg.name

  console.log(`\n${'='.repeat(60)}`)
  console.log(`🔄 处理: ${pkg.dir}/${pkg.name}`)

  // 检查包是否存在
  if (!fs.existsSync(packagePath)) {
    console.log(`⚠️  跳过（不存在）`)
    return false
  }

  // 检查是否已是 submodule
  if (fs.existsSync(path.join(packagePath, '.git'))) {
    const gitDir = fs.readFileSync(path.join(packagePath, '.git'), 'utf-8')
    if (gitDir.startsWith('gitdir:')) {
      console.log(`✅ 已是 submodule，跳过`)
      return true
    }
  }

  try {
    // 1. 创建 GitHub 仓库
    const repoUrl = await createGithubRepo(repoName)
    console.log(`✅ 仓库: ${repoUrl}`)

    // 2. 初始化并推送
    console.log(`📤 初始化 Git 仓库...`)
    await execAsync('git init', { cwd: packagePath })
    await execAsync('git add .', { cwd: packagePath })
    await execAsync('git commit -m "chore: initial commit"', { cwd: packagePath })
    await execAsync('git branch -M main', { cwd: packagePath })
    await execAsync(`git remote add origin ${repoUrl}`, { cwd: packagePath })

    console.log(`📤 推送到 GitHub...`)
    try {
      await execAsync('git push -u origin main --force', { cwd: packagePath })
      console.log(`✅ 推送成功`)
    }
    catch (pushError: any) {
      console.log(`⚠️  推送失败: ${pushError.message}`)
    }

    // 3. 在父仓库中删除并添加为 submodule
    console.log(`\n🔄 转换为 submodule...`)
    const relativePath = path.join(pkg.dir, pkg.name).replace(/\\/g, '/')

    // 删除文件（保留在 Git 历史中）
    await execAsync(`git rm -rf ${relativePath}`)

    // 添加为 submodule
    await execAsync(`git submodule add ${repoUrl} ${relativePath}`)

    console.log(`✅ 转换成功！`)
    return true
  }
  catch (error: any) {
    console.error(`❌ 转换失败: ${error.message}`)
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 批量转换新包为 Git Submodule\n')
  console.log(`👤 GitHub 用户: ${GITHUB_CONFIG.owner}`)

  if (!GITHUB_CONFIG.token) {
    console.error('\n❌ 错误: 未设置 GITHUB_TOKEN 环境变量')
    console.error('\nPowerShell 设置:')
    console.error('  $env:GITHUB_TOKEN="your_token_here"')
    console.error('  $env:GITHUB_OWNER="your_github_username"')
    process.exit(1)
  }

  console.log(`\n📊 将转换 ${NEW_PACKAGES.length} 个包\n`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const pkg of NEW_PACKAGES) {
    const result = await convertPackage(pkg)
    if (result === true) {
      successCount++
    }
    else if (result === false) {
      errorCount++
    }
    else {
      skipCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 转换统计:')
  console.log(`   ✅ 成功: ${successCount}`)
  console.log(`   ⚠️  跳过: ${skipCount}`)
  console.log(`   ❌ 失败: ${errorCount}`)
  console.log(`   📦 总计: ${NEW_PACKAGES.length}`)

  if (successCount > 0) {
    console.log('\n💡 完成后需要:')
    console.log('   1. git add .gitmodules')
    console.log('   2. git commit -m "chore: convert packages to submodules"')
    console.log('   3. git push')
    console.log('   4. pnpm install')
  }
}

main().catch((error) => {
  console.error('\n❌ 执行失败:', error.message)
  process.exit(1)
})

