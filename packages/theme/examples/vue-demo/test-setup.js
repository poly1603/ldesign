#!/usr/bin/env node

/**
 * 简单的项目验证脚本
 * 检查项目文件是否正确创建
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  reset: '\x1B[0m',
  green: '\x1B[32m',
  red: '\x1B[31m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath)
  if (fs.existsSync(fullPath)) {
    log(`✅ ${description}`, 'green')
    return true
  }
  else {
    log(`❌ ${description}`, 'red')
    return false
  }
}

function main() {
  log('🎨 LDesign Theme Vue Demo 项目验证', 'blue')
  log('================================', 'blue')

  const checks = [
    ['package.json', 'package.json 配置文件'],
    ['vite.config.ts', 'Vite 配置文件'],
    ['tsconfig.json', 'TypeScript 配置文件'],
    ['index.html', 'HTML 模板文件'],
    ['src/main.ts', '应用入口文件'],
    ['src/App.vue', '根组件文件'],
    ['src/style.css', '全局样式文件'],
    ['src/router/index.ts', '路由配置文件'],
    ['src/views/Home.vue', '首页组件文件'],
    ['README.md', '项目文档文件'],
  ]

  let allPassed = true

  checks.forEach(([file, desc]) => {
    if (!checkFile(file, desc)) {
      allPassed = false
    }
  })

  log('', 'reset')

  if (allPassed) {
    log('🎉 所有文件检查通过！', 'green')
    log('', 'reset')
    log('下一步操作：', 'yellow')
    log('1. cd packages/theme/examples/vue-demo', 'reset')
    log('2. pnpm install', 'reset')
    log('3. pnpm dev', 'reset')
  }
  else {
    log('❌ 部分文件缺失，请检查项目创建过程', 'red')
  }
}

main()
