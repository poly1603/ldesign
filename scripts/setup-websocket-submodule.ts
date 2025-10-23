#!/usr/bin/env node
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

/**
 * 创建 GitHub 仓库
 */
async function createGithubRepo(repoName: string): Promise<string> {
  console.log(`\n📦 正在创建 GitHub 仓库: ${GITHUB_CONFIG.owner}/${repoName}...`)

  return new Promise((resolve, reject) => {
    const payload = {
      name: repoName,
      private: false,
      auto_init: false,
      description: 'LDesign WebSocket client with auto-reconnect and heartbeat',
    }
    const data = JSON.stringify(payload)

    const options = {
      hostname: 'api.github.com',
      path: '/user/repos',
      method: 'POST',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
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
          console.log(`✅ GitHub 仓库创建成功: ${repo.clone_url}`)
          resolve(repo.clone_url)
        }
        else if (res.statusCode === 422) {
          const repoUrl = `https://github.com/${GITHUB_CONFIG.owner}/${repoName}.git`
          console.log(`⚠️  仓库已存在，使用现有仓库: ${repoUrl}`)
          resolve(repoUrl)
        }
        else {
          reject(new Error(`创建失败 (${res.statusCode}): ${responseData}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(data)
    req.end()
  })
}

/**
 * 创建 websocket 包文件
 */
async function createWebsocketPackage() {
  console.log('\n📝 创建 websocket 包文件...')

  const websocketPath = path.join(process.cwd(), 'packages', 'websocket')

  // 创建目录结构
  const dirs = [
    '',
    'src',
    'src/types',
    'src/core',
  ]

  for (const dir of dirs) {
    const dirPath = path.join(websocketPath, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  // 创建文件（简化版，包含必要文件）
  const files: Record<string, string> = {
    'package.json': JSON.stringify({
      name: '@ldesign/websocket',
      version: '0.1.0',
      description: 'WebSocket 客户端 - 自动重连、心跳检测、消息队列',
      type: 'module',
      main: './lib/index.cjs',
      module: './es/index.js',
      types: './es/index.d.ts',
      scripts: {
        build: 'ldesign-builder build -f esm,cjs,dts',
      },
      dependencies: {
        '@ldesign/shared': 'workspace:*',
        '@ldesign/logger': 'workspace:*',
      },
    }, null, 2),
    'README.md': '# @ldesign/websocket\n\n> WebSocket 客户端\n\n详见 PROJECT_PLAN.md',
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        strict: true,
        declaration: true,
        outDir: 'dist',
      },
      include: ['src/**/*'],
    }, null, 2),
    'src/index.ts': 'export const version = "0.1.0"\n',
    '.gitignore': 'node_modules\ndist\nes\nlib\ncoverage\n',
  }

  for (const [file, content] of Object.entries(files)) {
    const filePath = path.join(websocketPath, file)
    fs.writeFileSync(filePath, content, 'utf-8')
  }

  // 复制 PROJECT_PLAN.md（如果存在备份）
  console.log('✅ 文件创建完成')
}

/**
 * 初始化并推送 Git 仓库
 */
async function initAndPushRepo(packagePath: string, repoUrl: string) {
  console.log('\n🚀 初始化 Git 仓库并推送...')

  try {
    // 初始化 Git
    await execAsync('git init', { cwd: packagePath })
    await execAsync('git add .', { cwd: packagePath })
    await execAsync('git commit -m "chore: initial commit"', { cwd: packagePath })
    await execAsync('git branch -M main', { cwd: packagePath })
    await execAsync(`git remote add origin ${repoUrl}`, { cwd: packagePath })

    // 推送
    console.log('📤 推送到 GitHub...')
    await execAsync('git push -u origin main', { cwd: packagePath })

    console.log('✅ 推送成功')
  }
  catch (error: any) {
    console.error('❌ 推送失败:', error.message)
    throw error
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔌 设置 @ldesign/websocket 为 Submodule\n')

  if (!GITHUB_CONFIG.token) {
    console.error('❌ 错误: GITHUB_TOKEN 未设置')
    process.exit(1)
  }

  try {
    const packagePath = path.join(process.cwd(), 'packages', 'websocket')

    // 1. 创建包文件
    createWebsocketPackage()

    // 2. 创建 GitHub 仓库
    const repoUrl = await createGithubRepo('websocket')

    // 3. 初始化并推送
    await initAndPushRepo(packagePath, repoUrl)

    // 4. 删除本地目录
    console.log('\n🗑️  删除本地目录...')
    if (process.platform === 'win32') {
      await execAsync(`rmdir /S /Q "${packagePath}"`)
    } else {
      await execAsync(`rm -rf "${packagePath}"`)
    }

    // 5. 添加为 submodule
    console.log('\n📥 添加为 submodule...')
    await execAsync(`git submodule add ${repoUrl} packages/websocket`)

    console.log('\n✅ 完成！websocket 已成功配置为 submodule')
    console.log('\n💡 下一步:')
    console.log('   git add .gitmodules packages/websocket')
    console.log('   git commit -m "chore: add websocket as submodule"')
    console.log('   git push')
  }
  catch (error: any) {
    console.error('\n❌ 错误:', error.message)
    process.exit(1)
  }
}

main()

