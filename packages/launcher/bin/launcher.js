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

// 动态导入 CLI 模块（优先 ESM，其次 CJS），兼容默认导出与具名导出
async function main() {
  try {
    let mod
    let createCli

    try {
      // 直接使用 ESM 构建，因为这是一个 ESM 包
      mod = await import('../dist/cli/index.js')
      createCli = mod.createCli || (typeof mod.default === 'function' ? mod.default : mod.default?.createCli)

      if (!createCli) {
        console.log('ESM模块导出:', Object.keys(mod))
        throw new Error('无法找到 createCli 函数')
      }
    } catch (esmError) {
      // 只在非静默模式下输出错误信息
      if (!process.argv.includes('--silent') && !process.argv.includes('-s')) {
        console.error('ESM加载失败:', esmError.message)
      }
      throw new Error(`无法加载 CLI 模块: ${esmError.message}`)
    }

    if (typeof createCli !== 'function') {
      throw new Error('无法定位 createCli 导出')
    }

    // 创建并运行 CLI
    const cli = createCli()
    await cli.run()

  } catch (error) {
    // 只在非静默模式下输出错误信息
    const isSilent = process.argv.includes('--silent') || process.argv.includes('-s')

    if (!isSilent) {
      // 如果导入失败，可能是开发环境，提示构建
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
    }

    process.exit(1)
  }
}

// 运行主函数
main().catch((error) => {
  // 只在非静默模式下输出错误信息
  if (!process.argv.includes('--silent') && !process.argv.includes('-s')) {
    console.error('❌ 启动失败:', error.message)
  }
  process.exit(1)
})
