#!/usr/bin/env node
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

// 需要转换的新包列表
const NEW_PACKAGES = {
  packages: [
    'icons',
    'logger',
    'validator',
    'auth',
    'notification',
    'websocket',
    'permission',
    'animation',
    'file',
    'storage',
  ],
  libraries: [
    'gantt',
    'mindmap',
    'signature',
    'barcode',
    'calendar',
    'timeline',
    'tree',
    'upload',
    'player',
    'markdown',
  ],
  tools: [
    'tester',
    'deployer',
    'docs-generator',
    'monitor',
    'analyzer',
  ],
}

/**
 * 创建 GitHub 仓库
 */
async function createGithubRepo(
  repoName: string,
  owner: string,
  isPrivate: boolean = false,
): Promise<string> {
  console.log(`\n📦 正在创建 GitHub 仓库: ${owner}/${repoName}...`)

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: repoName,
      private: isPrivate,
      auto_init: false, // 不自动初始化，我们会推送现有内容
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

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 201) {
          const repo = JSON.parse(responseData)
          const repoUrl = repo.clone_url
          console.log(`✅ GitHub 仓库创建成功: ${repoUrl}`)
          resolve(repoUrl)
        }
        else if (res.statusCode === 422) {
          // 仓库已存在
          const repoUrl = `https://github.com/${owner}/${repoName}.git`
          console.log(`⚠️  仓库已存在，使用现有仓库: ${repoUrl}`)
          resolve(repoUrl)
        }
        else {
          const error = JSON.parse(responseData)
          reject(new Error(`创建 GitHub 仓库失败: ${error.message || responseData}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(new Error(`创建 GitHub 仓库失败: ${error.message}`))
    })

    req.write(data)
    req.end()
  })
}

/**
 * 初始化包的 Git 仓库并推送
 */
async function initAndPushRepo(packagePath: string, repoUrl: string): Promise<void> {
  console.log(`\n📂 初始化并推送: ${packagePath}...`)

  try {
    // 进入包目录
    const commands = [
      `cd "${packagePath}"`,
      'git init',
      'git add .',
      'git commit -m "Initial commit: package structure"',
      `git branch -M main`,
      `git remote add origin ${repoUrl}`,
      'git push -u origin main',
    ]

    for (const command of commands) {
      await execAsync(command, { cwd: packagePath })
    }

    console.log(`✅ 推送成功`)
  }
  catch (error: any) {
    console.error(`⚠️  推送失败（可能仓库已存在）: ${error.message}`)
  }
}

/**
 * 将包转换为 submodule
 */
async function convertToSubmodule(directory: string, packageName: string): Promise<void> {
  const packagePath = path.join(process.cwd(), directory, packageName)
  const repoName = packageName

  console.log(`\n🔄 转换: ${directory}/${packageName}`)

  // 检查包是否存在
  if (!fs.existsSync(packagePath)) {
    console.error(`❌ 包不存在: ${packagePath}`)
    return
  }

  // 读取 package.json 获取包名
  const packageJsonPath = path.join(packagePath, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`❌ 缺少 package.json: ${packagePath}`)
    return
  }

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  const fullPackageName = pkg.name || `@ldesign/${packageName}`

  try {
    // 1. 创建 GitHub 仓库
    const repoUrl = await createGithubRepo(repoName, GITHUB_CONFIG.owner, false)

    // 2. 初始化 Git 并推送
    await initAndPushRepo(packagePath, repoUrl)

    // 3. 备份包内容
    const tempPath = path.join(process.cwd(), '.temp-submodule-backup', directory, packageName)
    fs.mkdirSync(path.dirname(tempPath), { recursive: true })
    await execAsync(`xcopy /E /I /Y "${packagePath}" "${tempPath}"`)
    console.log(`✅ 内容已备份到: ${tempPath}`)

    // 4. 删除原包目录
    console.log(`\n🗑️  删除本地包: ${packagePath}`)
    await execAsync(`rmdir /S /Q "${packagePath}"`)

    // 5. 添加为 submodule
    const relativePath = path.join(directory, packageName).replace(/\\/g, '/')
    console.log(`\n📥 添加 submodule: ${relativePath}`)
    await execAsync(`git submodule add ${repoUrl} ${relativePath}`)

    // 6. 恢复内容（如果 submodule 是空的）
    if (fs.existsSync(packagePath)) {
      const files = fs.readdirSync(packagePath)
      if (files.length <= 1) { // 只有 .git
        console.log(`\n📋 恢复包内容...`)
        await execAsync(`xcopy /E /Y "${tempPath}\\*" "${packagePath}\\"`)

        // 提交内容
        await execAsync('git add .', { cwd: packagePath })
        await execAsync('git commit -m "Add package files"', { cwd: packagePath })
        await execAsync('git push origin main', { cwd: packagePath })
      }
    }

    // 7. 清理备份
    await execAsync(`rmdir /S /Q "${tempPath}"`)

    console.log(`✅ ${fullPackageName} 转换成功！\n`)
  }
  catch (error: any) {
    console.error(`❌ 转换失败: ${error.message}\n`)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 将新包转换为 Git Submodule\n')
  console.log(`👤 GitHub 用户: ${GITHUB_CONFIG.owner}\n`)

  // 检查 GitHub Token
  if (!GITHUB_CONFIG.token) {
    console.error('❌ 错误: 未设置 GITHUB_TOKEN 环境变量')
    console.error('\n请设置环境变量:')
    console.error('  Windows (PowerShell): $env:GITHUB_TOKEN="your_token_here"')
    console.error('  Linux/Mac: export GITHUB_TOKEN="your_token_here"')
    console.error('\n或者使用 .env 文件设置')
    process.exit(1)
  }

  console.log('📋 即将转换以下包为 submodule:\n')
  console.log(`📦 Packages (${NEW_PACKAGES.packages.length}个):`)
  console.log(`   ${NEW_PACKAGES.packages.join(', ')}\n`)
  console.log(`🎨 Libraries (${NEW_PACKAGES.libraries.length}个):`)
  console.log(`   ${NEW_PACKAGES.libraries.join(', ')}\n`)
  console.log(`🛠️  Tools (${NEW_PACKAGES.tools.length}个):`)
  console.log(`   ${NEW_PACKAGES.tools.join(', ')}\n`)

  const total = NEW_PACKAGES.packages.length + NEW_PACKAGES.libraries.length + NEW_PACKAGES.tools.length
  console.log(`📊 总计: ${total} 个包\n`)

  // 开始转换
  let successCount = 0
  let errorCount = 0

  // 转换 packages
  for (const packageName of NEW_PACKAGES.packages) {
    try {
      await convertToSubmodule('packages', packageName)
      successCount++
    }
    catch (error) {
      errorCount++
    }
  }

  // 转换 libraries
  for (const packageName of NEW_PACKAGES.libraries) {
    try {
      await convertToSubmodule('libraries', packageName)
      successCount++
    }
    catch (error) {
      errorCount++
    }
  }

  // 转换 tools
  for (const packageName of NEW_PACKAGES.tools) {
    try {
      await convertToSubmodule('tools', packageName)
      successCount++
    }
    catch (error) {
      errorCount++
    }
  }

  // 输出统计
  console.log('\n' + '='.repeat(50))
  console.log('\n📊 转换完成统计:')
  console.log(`   ✅ 成功: ${successCount}/${total}`)
  console.log(`   ❌ 失败: ${errorCount}/${total}`)

  if (successCount === total) {
    console.log('\n🎉 所有包已成功转换为 submodule！')
    console.log('\n💡 下一步:')
    console.log('   1. git submodule update --init --recursive')
    console.log('   2. pnpm install')
    console.log('   3. pnpm build:all')
  }
  else {
    console.log('\n⚠️  部分包转换失败，请检查错误信息')
  }
}

main().catch((error) => {
  console.error('执行失败:', error)
  process.exit(1)
})

