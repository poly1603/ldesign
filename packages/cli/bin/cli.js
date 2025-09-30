#!/usr/bin/env node

/**
 * LDesign CLI 可执行文件
 * 支持 Node.js 18+ 和 ESM 模块
 */

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

// 动态导入 ES 模块
;(async () => {
  try {
    // 检查 Node.js 版本
    const nodeVersion = process.version
    const majorVersion = Number.parseInt(nodeVersion.slice(1).split('.')[0])

    if (majorVersion < 18) {
      console.error('❌ LDesign CLI requires Node.js 18 or higher')
      console.error(`   Current version: ${nodeVersion}`)
      process.exit(1)
    }

    // 导入 CLI 模块
    const cliPath = resolve(__dirname, '../dist/index.js')
    const cliUrl = `file://${cliPath.replace(/\\/g, '/')}`
    const { main } = await import(cliUrl)

    // 运行 CLI
    await main()
  }
  catch (error) {
    console.error('❌ Failed to start LDesign CLI:')
    console.error('   Please run "pnpm build" in the cli package first')
    console.error(`   Error: ${error.message}`)
    process.exit(1)
  }
})()
