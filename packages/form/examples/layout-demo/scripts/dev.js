#!/usr/bin/env node

/**
 * 开发环境启动脚本
 * 用于启动 layout-demo 项目
 */

const { spawn } = require('node:child_process')
const path = require('node:path')

console.log('🚀 启动 @ldesign/form 布局演示项目...\n')

// 项目根目录
const projectRoot = path.resolve(__dirname, '..')

// 启动开发服务器
const dev = spawn('npm', ['run', 'dev'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
})

dev.on('error', error => {
  console.error('❌ 启动失败:', error.message)
  process.exit(1)
})

dev.on('close', code => {
  if (code !== 0) {
    console.error(`❌ 进程退出，退出码: ${code}`)
    process.exit(code)
  }
})

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭开发服务器...')
  dev.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n👋 正在关闭开发服务器...')
  dev.kill('SIGTERM')
})
