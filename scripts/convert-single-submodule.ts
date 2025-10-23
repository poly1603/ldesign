#!/usr/bin/env node
/**
 * 单个包转换为 Submodule
 * 使用: pnpm convert-single
 */

import { stdin, stdout } from 'process'
import { createInterface } from 'readline'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'
import * as fs from 'fs'
import * as https from 'https'

const execAsync = promisify(exec)

const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN || '',
  owner: process.env.GITHUB_OWNER || 'poly1603',
}

const rl = createInterface({ input: stdin, output: stdout })

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createGithubRepo(repoName: string): Promise<string> {
  console.log(`\n📦 创建 GitHub 仓库: ${GITHUB_CONFIG.owner}/${repoName}...`)

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: repoName,
      private: false,
      auto_init: false,
    })

    const req = https.request({
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
    }, (res) => {
      let responseData = ''
      res.on('data', chunk => responseData += chunk)
      res.on('end', () => {
        if (res.statusCode === 201) {
          const repo = JSON.parse(responseData)
          console.log(`✅ 仓库创建成功: ${repo.clone_url}`)
          resolve(repo.clone_url)
        }
        else if (res.statusCode === 422) {
          const repoUrl = `https://github.com/${GITHUB_CONFIG.owner}/${repoName}.git`
          console.log(`⚠️  仓库已存在: ${repoUrl}`)
          resolve(repoUrl)
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

async function main() {
  console.log('🔄 单个包转换为 Submodule\n')

  if (!GITHUB_CONFIG.token) {
    console.error('❌ 未设置 GITHUB_TOKEN')
    console.error('PowerShell: $env:GITHUB_TOKEN="your_token"')
    process.exit(1)
  }

  try {
    // 询问包路径
    const packagePath = await question('📁 输入包路径 (如: packages/icons): ')
    if (!packagePath) {
      console.error('❌ 路径不能为空')
      process.exit(1)
    }

    const fullPath = path.join(process.cwd(), packagePath)
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ 路径不存在: ${fullPath}`)
      process.exit(1)
    }

    // 读取包名
    const packageJsonPath = path.join(fullPath, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    const repoName = path.basename(fullPath)

    console.log(`\n📦 包名: ${pkg.name}`)
    console.log(`📂 仓库名: ${repoName}`)

    const confirm = await question('\n确认转换? (y/N): ')
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ 已取消')
      process.exit(0)
    }

    // 1. 创建 GitHub 仓库
    const repoUrl = await createGithubRepo(repoName)

    // 2. 初始化并推送
    console.log(`\n📤 初始化 Git...`)
    await execAsync('git init', { cwd: fullPath })
    await execAsync('git add .', { cwd: fullPath })
    await execAsync('git commit -m "chore: initial commit"', { cwd: fullPath })
    await execAsync('git branch -M main', { cwd: fullPath })
    await execAsync(`git remote add origin ${repoUrl}`, { cwd: fullPath })

    console.log(`📤 推送到 GitHub...`)
    await execAsync('git push -u origin main', { cwd: fullPath })
    console.log(`✅ 推送成功`)

    // 3. 转换为 submodule
    console.log(`\n🔄 转换为 submodule...`)
    await execAsync(`git rm -rf ${packagePath}`)
    await execAsync(`git submodule add ${repoUrl} ${packagePath}`)

    console.log(`\n🎉 转换成功！`)
    console.log(`\n💡 下一步:`)
    console.log(`   git add .gitmodules`)
    console.log(`   git commit -m "chore: convert ${repoName} to submodule"`)
  }
  catch (error: any) {
    console.error(`\n❌ 错误: ${error.message}`)
    process.exit(1)
  }
  finally {
    rl.close()
  }
}

main()






