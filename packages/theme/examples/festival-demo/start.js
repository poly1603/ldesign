#!/usr/bin/env node

/**
 * LDesign Theme 节日主题演示启动脚本
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🎨 启动 LDesign Theme 节日主题演示...\n')

// 检查是否安装了依赖
const fs = require('fs')
const nodeModulesPath = path.join(__dirname, 'node_modules')

if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 正在安装依赖...')

  const install = spawn('pnpm', ['install'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  })

  install.on('close', code => {
    if (code === 0) {
      console.log('✅ 依赖安装完成\n')
      startDev()
    } else {
      console.error('❌ 依赖安装失败')
      process.exit(1)
    }
  })
} else {
  startDev()
}

function startDev() {
  console.log('🚀 启动开发服务器...')
  console.log('📍 访问地址: http://localhost:3000')
  console.log('🎯 演示功能:')
  console.log('   🎭 节日主题切换')
  console.log('   🎯 装饰挂件演示')
  console.log('   🎬 动画效果展示')
  console.log('   🌙 明暗模式切换')
  console.log('   📱 响应式设计\n')

  const dev = spawn('pnpm', ['dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  })

  dev.on('close', code => {
    console.log(`\n开发服务器已停止 (退出码: ${code})`)
  })

  // 处理 Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n👋 正在停止开发服务器...')
    dev.kill('SIGINT')
  })
}
