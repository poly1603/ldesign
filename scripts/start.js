#!/usr/bin/env node

import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🛠️ 启动 LDesign 项目管理工具...')

// 尝试使用 tsx 运行主脚本
const scriptPath = join(__dirname, 'simple-main.ts')
const child = spawn('npx', ['tsx', scriptPath], {
  stdio: 'inherit',
  shell: true
})

child.on('error', (error) => {
  console.error('❌ 启动失败:', error.message)
  console.log('💡 请确保已安装依赖: pnpm install')
  process.exit(1)
})

child.on('exit', (code) => {
  if (code !== 0) {
    console.log('❌ 脚本执行失败')
    console.log('💡 你可以尝试以下命令:')
    console.log('   pnpm script:commit    # 提交代码')
    console.log('   pnpm script:update    # 更新项目')
    console.log('   pnpm script:init      # 初始化项目')
    console.log('   pnpm dev              # 启动开发服务器')
    console.log('   pnpm docs:dev         # 启动文档服务器')
  }
})
