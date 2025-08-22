#!/usr/bin/env node

/**
 * LDesign Builder CLI 入口文件
 * 智能前端库打包工具命令行接口
 */

const { createRequire } = require('node:module')

const require = createRequire(import.meta.url)
const path = require('node:path')

// 动态导入 ES 模块
;

(async () => {
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
    const cliPath = path.resolve(__dirname, '../dist/cli/index.js')
    const { runCli } = await import(cliPath)

    // 运行 CLI
    await runCli()
  }
  catch (error) {
    // 如果 dist 目录不存在，尝试从源码运行（开发模式）
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      try {
        // 注册 TypeScript 编译器
        require('ts-node/register')
        const { runCli } = require('../src/cli/index.ts')
        await runCli()
      }
      catch (devError) {
        console.error('❌ Failed to start LDesign Builder:')
        console.error('   Please run "npm run build" first or install dependencies')
        console.error(`   Error: ${devError.message}`)
        process.exit(1)
      }
    }
    else {
      console.error('❌ Unexpected error:')
      console.error(error)
      process.exit(1)
    }
  }
})()
