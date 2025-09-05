#!/usr/bin/env node

/**
 * @ldesign/builder CLI 可执行文件
 * 
 * 这是 CLI 工具的入口点，负责启动 CLI 程序
 */

const { createRequire } = require('module')
const path = require('path')

// 检查 Node.js 版本
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10)

if (majorVersion < 16) {
  console.error('错误: @ldesign/builder 需要 Node.js 16.0.0 或更高版本')
  console.error(`当前版本: ${nodeVersion}`)
  console.error('请升级 Node.js 版本')
  process.exit(1)
}

// 设置环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
  process.exit(1)
})

// 启动 CLI
async function main() {
  try {
    // 动态导入 CLI 模块
    const cliPath = path.resolve(__dirname, '../dist/cli/index.js')
    const { main } = require(cliPath)
    
    // 运行 CLI
    await main()
  } catch (error) {
    // 如果是开发环境，尝试使用 TypeScript 源码
    if (process.env.NODE_ENV === 'development') {
      try {
        // 尝试使用 tsx 或 ts-node 运行 TypeScript 源码
        const { register } = require('tsx/esm')
        register()
        
        const cliPath = path.resolve(__dirname, '../src/cli/index.ts')
        const { main } = await import(cliPath)
        await main()
        return
      } catch (tsError) {
        console.error('开发模式启动失败:', tsError.message)
      }
    }
    
    console.error('CLI 启动失败:', error.message)
    
    // 提供有用的错误信息
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('')
      console.error('可能的解决方案:')
      console.error('1. 确保已正确安装 @ldesign/builder')
      console.error('2. 尝试重新安装: npm install @ldesign/builder')
      console.error('3. 检查 Node.js 版本是否符合要求')
    }
    
    process.exit(1)
  }
}

// 运行主函数
main().catch((error) => {
  console.error('启动失败:', error)
  process.exit(1)
})
