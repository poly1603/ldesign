#!/usr/bin/env node

/**
 * @ldesign/launcher CLI 入口文件
 * 
 * 这是 launcher 命令的可执行入口文件
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

// 检查 Node.js 版本
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10)

if (majorVersion < 16) {
  console.error(`❌ @ldesign/launcher 需要 Node.js 16.0.0 或更高版本，当前版本: ${nodeVersion}`)
  console.error('请升级 Node.js 版本后重试')
  process.exit(1)
}

// 设置未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error.message)
  if (process.env.DEBUG) {
    console.error(error.stack)
  }
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('❌ 未处理的 Promise 拒绝:', reason)
  process.exit(1)
})

// 动态导入 CLI 模块
async function main() {
  try {
    // 尝试导入编译后的 CLI 模块
    const { createCli } = await import('../dist/cli/index.js')
    
    // 创建并运行 CLI
    const cli = createCli()
    await cli.run()
    
  } catch (error) {
    // 如果导入失败，可能是开发环境，尝试直接运行源码
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('❌ 找不到构建文件，请先运行构建命令:')
      console.error('  pnpm run build')
      console.error('')
      console.error('或者在开发环境中运行:')
      console.error('  pnpm run dev')
    } else {
      console.error('❌ CLI 启动失败:', error.message)
      if (process.env.DEBUG) {
        console.error(error.stack)
      }
    }
    
    process.exit(1)
  }
}

// 运行主函数
main().catch((error) => {
  console.error('❌ 启动失败:', error.message)
  process.exit(1)
})
