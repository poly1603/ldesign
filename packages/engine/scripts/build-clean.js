#!/usr/bin/env node

/**
 * 清洁构建脚本
 * 过滤掉不必要的控制台输出，只显示重要信息
 */

import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1B[0m',
  bright: '\x1B[1m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  cyan: '\x1B[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 需要过滤的消息模式
const filterPatterns = [
  /Generated an empty chunk/,
  /\[@ldesign\/builder\] \[INFO\]/,
  /开始配置自动增强/,
  /读取 package\.json/,
  /当前 libraryType/,
  /开始检测库类型/,
  /所有依赖:/,
  /在.*中找到.*个 Vue 文件/,
  /是否有 Vue 文件/,
  /检测到 TypeScript 项目/,
  /自动检测库类型/,
  /自动生成 external/,
  /自动生成 globals/,
  /检查是否需要添加 Vue 插件/,
  /非 Vue 项目，不添加 Vue 插件/,
  /配置自动增强完成/,
  /加载配置文件/,
]

// 应该保留的重要消息模式
const keepPatterns = [
  /\[@ldesign\/builder\] \[SUCCESS\]/,
  /\[@ldesign\/builder\] \[ERROR\]/,
  /\[@ldesign\/builder\] \[WARN\]/,
  /构建成功/,
  /构建失败/,
  /✅/,
  /❌/,
  /⚠️/,
]

function shouldFilterLine(line) {
  // 如果是重要消息，不过滤
  if (keepPatterns.some(pattern => pattern.test(line))) {
    return false
  }
  
  // 如果匹配过滤模式，则过滤掉
  return filterPatterns.some(pattern => pattern.test(line))
}

function runBuild() {
  return new Promise((resolve, reject) => {
    log('🚀 开始构建...', 'cyan')
    
    const args = process.argv.slice(2)
    const buildProcess = spawn('pnpm', ['run', 'build:original', ...args], {
      cwd: rootDir,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true
    })

    let hasErrors = false
    let outputBuffer = ''
    let errorBuffer = ''

    buildProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n')
      lines.forEach(line => {
        if (line.trim()) {
          outputBuffer += `${line  }\n`
          if (!shouldFilterLine(line)) {
            console.log(line)
          }
        }
      })
    })

    buildProcess.stderr.on('data', (data) => {
      const lines = data.toString().split('\n')
      lines.forEach(line => {
        if (line.trim()) {
          errorBuffer += `${line  }\n`
          if (!shouldFilterLine(line)) {
            console.error(line)
          }
        }
      })
    })

    buildProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ 构建完成！', 'green')
        resolve({ success: true, output: outputBuffer, error: errorBuffer })
      } else {
        log('❌ 构建失败！', 'red')
        hasErrors = true
        reject(new Error(`Build failed with code ${code}`))
      }
    })

    buildProcess.on('error', (error) => {
      log(`❌ 构建过程中发生错误: ${error.message}`, 'red')
      hasErrors = true
      reject(error)
    })
  })
}

// 主函数
async function main() {
  try {
    await runBuild()
  } catch (error) {
    console.error('构建失败:', error.message)
    process.exit(1)
  }
}

// 处理命令行参数
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
LDesign Engine 清洁构建工具

用法:
  node scripts/build-clean.js [选项]

选项:
  --help, -h     显示帮助信息
  --dev          开发模式构建
  --clean        强制清理
  --types        仅生成类型文件

示例:
  node scripts/build-clean.js          # 标准构建
  node scripts/build-clean.js --dev    # 开发模式
  node scripts/build-clean.js --clean  # 强制清理构建
`)
  process.exit(0)
}

// 执行构建
main()
