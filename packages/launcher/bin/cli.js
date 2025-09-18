#!/usr/bin/env node

/**
 * LDesign Launcher CLI 入口文件
 * 前端项目启动器命令行接口
 */

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 动态导入 ES 模块
;(async () => {
  try {
    // 检查 Node.js 版本
    const nodeVersion = process.version
    const majorVersion = Number.parseInt(nodeVersion.slice(1).split('.')[0])

    if (majorVersion < 16) {
      console.error('❌ LDesign Launcher requires Node.js 16 or higher')
      console.error(`   Current version: ${nodeVersion}`)
      process.exit(1)
    }

    // 导入 CLI 模块
    const cliPath = resolve(__dirname, '../dist/cli/index.js')
    const cliUrl = `file://${cliPath.replace(/\\/g, '/')}`
    const { createCli } = await import(cliUrl)

    // 创建并运行 CLI
    const cli = createCli()
    await cli.run()
  }
  catch (error) {
    console.error('❌ Failed to start LDesign Launcher:')
    console.error('   Please run "pnpm build" in the launcher package first')
    console.error(`   Error: ${error.message}`)
    process.exit(1)
  }
})()
