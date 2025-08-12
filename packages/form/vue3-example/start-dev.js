#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

// 直接启动vite，绕过可能的脚本拦截
const vitePath = path.join(__dirname, 'node_modules', '.bin', 'vite')
const viteProcess = spawn(vitePath, ['--port', '3001'], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true,
})

viteProcess.on('error', error => {
  console.error('启动失败:', error)
  process.exit(1)
})

viteProcess.on('close', code => {
  console.log(`开发服务器退出，代码: ${code}`)
  process.exit(code)
})

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n正在关闭开发服务器...')
  viteProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  viteProcess.kill('SIGTERM')
})
