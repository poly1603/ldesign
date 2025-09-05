#!/usr/bin/env node

/**
 * @ldesign/builder CLI 入口文件
 */

// 检查 Node.js 版本
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10)

if (majorVersion < 16) {
  console.error('❌ @ldesign/builder 需要 Node.js 16 或更高版本')
  console.error(`当前版本: ${nodeVersion}`)
  process.exit(1)
}

// 动态导入 CLI
async function main() {
  try {
    const { BuilderCLI } = await import('../dist/cli/index.js')
    await BuilderCLI.createSimpleCLI()
  } catch (error) {
    console.error('❌ CLI 启动失败:', error)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('❌ 未处理的错误:', error)
  process.exit(1)
})
