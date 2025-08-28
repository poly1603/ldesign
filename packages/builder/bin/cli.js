#!/usr/bin/env node

/**
 * LDesign Builder CLI 入口文件
 * 智能前端库打包工具命令行接口
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
      console.error('❌ LDesign Builder requires Node.js 16 or higher')
      console.error(`   Current version: ${nodeVersion}`)
      process.exit(1)
    }

    // 导入 CLI 模块
    const cliPath = resolve(__dirname, '../dist/cli/index.js')
    const cliUrl = `file://${cliPath.replace(/\\/g, '/')}`
    const { runCli } = await import(cliUrl)

    // 运行 CLI
    await runCli()
  }
  catch (error) {
    console.error('❌ Failed to start LDesign Builder:')
    console.error('   Please run "pnpm build" in the builder package first')
    console.error(`   Error: ${error.message}`)
    process.exit(1)
  }
})()
