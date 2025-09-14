#!/usr/bin/env node

/**
 * 构建验证脚本
 * 验证构建产物的完整性和正确性
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

// 检查文件是否存在
function checkFileExists(filePath, description) {
  const fullPath = path.join(distDir, filePath)
  if (fs.existsSync(fullPath)) {
    success(`${description}: ${filePath}`)
    return true
  } else {
    error(`${description} 不存在: ${filePath}`)
    return false
  }
}

// 检查文件大小
function checkFileSize(filePath, maxSize) {
  const fullPath = path.join(distDir, filePath)
  if (!fs.existsSync(fullPath)) {
    return false
  }
  
  const stats = fs.statSync(fullPath)
  const sizeKB = Math.round(stats.size / 1024)
  const maxSizeKB = Math.round(maxSize / 1024)
  
  if (sizeKB <= maxSizeKB) {
    success(`文件大小检查通过: ${filePath} (${sizeKB}KB <= ${maxSizeKB}KB)`)
    return true
  } else {
    error(`文件大小超限: ${filePath} (${sizeKB}KB > ${maxSizeKB}KB)`)
    return false
  }
}

// 检查文件内容
function checkFileContent(filePath, patterns) {
  const fullPath = path.join(distDir, filePath)
  if (!fs.existsSync(fullPath)) {
    return false
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8')
  let passed = true
  
  for (const [description, pattern] of patterns) {
    if (pattern.test(content)) {
      success(`内容检查通过: ${filePath} - ${description}`)
    } else {
      error(`内容检查失败: ${filePath} - ${description}`)
      passed = false
    }
  }
  
  return passed
}

// 主验证函数
function validateBuild() {
  info('开始验证构建产物...')
  
  let allPassed = true
  
  // 检查基础文件
  const basicFiles = [
    ['index.d.ts', '主类型声明文件'],
    ['index.css', '主样式文件'],
    ['esm/index.js', 'ESM 主入口'],
    ['cjs/index.cjs', 'CJS 主入口'],
    ['index.umd.js', 'UMD 主入口'],
  ]
  
  for (const [file, desc] of basicFiles) {
    if (!checkFileExists(file, desc)) {
      allPassed = false
    }
  }
  
  // 检查框架适配器文件
  const adapterFiles = [
    ['vue/index.d.ts', 'Vue 类型声明'],
    ['esm/vue/index.js', 'Vue ESM 入口'],
    ['cjs/vue/index.cjs', 'Vue CJS 入口'],
    ['react/index.d.ts', 'React 类型声明'],
    ['esm/react/index.js', 'React ESM 入口'],
    ['cjs/react/index.cjs', 'React CJS 入口'],
    ['angular/index.d.ts', 'Angular 类型声明'],
    ['esm/angular/index.js', 'Angular ESM 入口'],
    ['cjs/angular/index.cjs', 'Angular CJS 入口'],
  ]
  
  for (const [file, desc] of adapterFiles) {
    if (!checkFileExists(file, desc)) {
      allPassed = false
    }
  }
  
  // 检查文件大小
  const sizeChecks = [
    ['esm/index.js', 100 * 1024], // 100KB
    ['cjs/index.cjs', 100 * 1024], // 100KB
    ['index.umd.js', 150 * 1024], // 150KB
    ['index.css', 50 * 1024], // 50KB
  ]
  
  for (const [file, maxSize] of sizeChecks) {
    if (!checkFileSize(file, maxSize)) {
      allPassed = false
    }
  }
  
  // 检查文件内容
  const contentChecks = [
    [
      'esm/index.js',
      [
        ['包含 Tree 类导出', /export.*Tree/],
        ['包含版本信息', /version.*\d+\.\d+\.\d+/],
        ['不包含开发代码', /(?!.*console\.log.*)/],
      ],
    ],
    [
      'index.d.ts',
      [
        ['包含 Tree 类型', /declare.*class.*Tree/],
        ['包含 TreeOptions 接口', /interface.*TreeOptions/],
        ['包含 TreeNodeData 接口', /interface.*TreeNodeData/],
      ],
    ],
    [
      'index.css',
      [
        ['包含基础样式', /\.ldesign-tree/],
        ['包含CSS变量', /var\(--ldesign-/],
        ['不包含源码路径', /(?!.*src\/)/],
      ],
    ],
  ]
  
  for (const [file, patterns] of contentChecks) {
    if (!checkFileContent(file, patterns)) {
      allPassed = false
    }
  }
  
  // 检查包结构
  info('检查包结构...')
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
  
  // 验证 exports 字段
  if (packageJson.exports) {
    for (const [exportPath, config] of Object.entries(packageJson.exports)) {
      if (typeof config === 'object') {
        for (const [condition, filePath] of Object.entries(config)) {
          if (condition !== 'types' && !filePath.startsWith('./dist/')) {
            continue
          }
          const actualPath = filePath.replace('./', '')
          if (!fs.existsSync(path.join(rootDir, actualPath))) {
            error(`导出文件不存在: ${exportPath} -> ${filePath}`)
            allPassed = false
          } else {
            success(`导出文件存在: ${exportPath} -> ${filePath}`)
          }
        }
      }
    }
  }
  
  // 最终结果
  if (allPassed) {
    success('🎉 所有构建验证通过！')
    process.exit(0)
  } else {
    error('❌ 构建验证失败！')
    process.exit(1)
  }
}

// 运行验证
validateBuild()
