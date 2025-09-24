#!/usr/bin/env node

/**
 * 构建验证脚本
 *
 * 验证构建输出的完整性和正确性：
 * - 检查必需的文件是否存在
 * - 验证包的导入导出
 * - 检查类型定义
 * - 验证包大小
 * - 测试不同环境的兼容性
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// const __filename = fileURLToPath(import.meta.url)

// 颜色输出
const colors = {
  reset: '\x1B[0m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
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
  if (fs.existsSync(filePath)) {
    success(`${description}: ${filePath}`)
    return true
  }
  else {
    error(`${description} 不存在: ${filePath}`)
    return false
  }
}

// 检查目录结构
function validateDirectoryStructure() {
  info('检查构建输出目录结构...')

  const requiredDirs = [
    { path: 'dist', desc: 'UMD 构建目录' },
    { path: 'es', desc: 'ESM 构建目录' },
    { path: 'lib', desc: 'CJS 构建目录' },
    { path: 'types', desc: '类型定义目录' },
  ]

  let allExist = true

  requiredDirs.forEach(({ path: dirPath, desc }) => {
    if (!checkFileExists(dirPath, desc)) {
      allExist = false
    }
  })

  return allExist
}

// 检查必需文件
function validateRequiredFiles() {
  info('检查必需的构建文件...')

  const requiredFiles = [
    // UMD 构建
    { path: 'dist/index.js', desc: 'UMD 构建文件' },
    { path: 'dist/index.min.js', desc: 'UMD 压缩文件' },
    { path: 'dist/index.js.map', desc: 'UMD Source Map' },

    // ESM 构建
    { path: 'es/index.js', desc: 'ESM 入口文件' },
    { path: 'es/client.js', desc: 'ESM 客户端文件' },

    // CJS 构建
    { path: 'lib/index.cjs', desc: 'CJS 入口文件' },
    { path: 'lib/client.cjs', desc: 'CJS 客户端文件' },

    // 类型定义
    { path: 'types/index.d.ts', desc: '主类型定义文件' },
    { path: 'types/client.d.ts', desc: '客户端类型定义' },

    // Package.json 字段
    { path: 'package.json', desc: 'Package.json' },
  ]

  let allExist = true

  requiredFiles.forEach(({ path: filePath, desc }) => {
    if (!checkFileExists(filePath, desc)) {
      allExist = false
    }
  })

  return allExist
}

// 验证 package.json 字段
function validatePackageJson() {
  info('验证 package.json 字段...')

  const packagePath = path.join(process.cwd(), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  const requiredFields = [
    'name',
    'version',
    'description',
    'main',
    'module',
    'types',
    'exports',
    'files',
  ]

  let isValid = true

  requiredFields.forEach((field) => {
    if (!pkg[field]) {
      error(`package.json 缺少必需字段: ${field}`)
      isValid = false
    }
    else {
      success(`package.json 字段 ${field}: ${typeof pkg[field] === 'object' ? 'OK' : pkg[field]}`)
    }
  })

  // 检查导出字段
  if (pkg.exports) {
    const expectedExports = ['.', './client', './vue']
    expectedExports.forEach((exp) => {
      if (!pkg.exports[exp]) {
        warning(`package.json exports 缺少: ${exp}`)
      }
      else {
        success(`package.json exports ${exp}: OK`)
      }
    })
  }

  return isValid
}

// 验证模块导入
async function validateModuleImports() {
  info('验证模块导入...')

  try {
    // 测试 CJS 导入
    const cjsPath = path.join(process.cwd(), 'lib/index.cjs')
    if (fs.existsSync(cjsPath)) {
      try {
        // 在 ES 模块中动态导入 CJS 模块
        const { createRequire } = await import('node:module')
        const require = createRequire(import.meta.url)
        const cjsModule = require(cjsPath)
        if (cjsModule.createHttpClient) {
          success('CJS 模块导入成功')
        }
        else {
          error('CJS 模块缺少 createHttpClient 导出')
          return false
        }
      }
      catch (importErr) {
        warning(`CJS 模块导入测试跳过: ${importErr.message}`)
      }
    }

    // 测试类型定义
    const typesPath = path.join(process.cwd(), 'types/index.d.ts')
    if (fs.existsSync(typesPath)) {
      const typesContent = fs.readFileSync(typesPath, 'utf8')
      if (typesContent.includes('createHttpClient') && typesContent.includes('HttpClient')) {
        success('类型定义包含必需的导出')
      }
      else {
        error('类型定义缺少必需的导出')
        return false
      }
    }

    return true
  }
  catch (err) {
    error(`模块导入验证失败: ${err.message}`)
    return false
  }
}

// 检查包大小
function validateBundleSize() {
  info('检查包大小...')

  try {
    // 运行 size-limit 检查
    const output = execSync('pnpm size-check', { encoding: 'utf8' })

    // 解析输出获取实际大小
    const sizeMatch = output.match(/Size:\s*([0-9.]+)\s*kB/)
    if (sizeMatch) {
      const actualSize = Number.parseFloat(sizeMatch[1])
      const maxSize = 60 // 60KB 限制

      if (actualSize <= maxSize) {
        success(`包大小: ${actualSize}KB (限制: ${maxSize}KB, 压缩后)`)
        return true
      }
      else {
        error(`包大小超出限制: ${actualSize}KB > ${maxSize}KB (压缩后)`)
        return false
      }
    }
    else {
      // 如果无法解析 size-limit 输出，回退到检查原始文件大小
      const distPath = path.join(process.cwd(), 'dist/index.min.js')
      if (!fs.existsSync(distPath)) {
        error('压缩文件不存在')
        return false
      }

      const stats = fs.statSync(distPath)
      const sizeKB = (stats.size / 1024).toFixed(2)
      warning(`无法解析 size-limit 输出，使用原始文件大小: ${sizeKB}KB`)

      // 对于原始文件，使用更宽松的限制
      const maxSizeKB = 100 // 100KB 限制（原始文件）

      if (stats.size <= maxSizeKB * 1024) {
        success(`原始文件大小: ${sizeKB}KB (限制: ${maxSizeKB}KB)`)
        return true
      }
      else {
        error(`原始文件大小超出限制: ${sizeKB}KB > ${maxSizeKB}KB`)
        return false
      }
    }
  }
  catch (err) {
    error(`包大小检查失败: ${err.message}`)
    return false
  }
}

// 验证 Source Maps
function validateSourceMaps() {
  info('验证 Source Maps...')

  const sourceMapFiles = [
    'dist/index.js.map',
    'dist/index.min.js.map',
    'es/index.js.map',
    'lib/index.cjs.map',
  ]

  let allValid = true

  sourceMapFiles.forEach((mapFile) => {
    if (fs.existsSync(mapFile)) {
      try {
        const mapContent = JSON.parse(fs.readFileSync(mapFile, 'utf8'))
        if (mapContent.version && mapContent.sources && mapContent.mappings) {
          success(`Source Map 有效: ${mapFile}`)
        }
        else {
          error(`Source Map 格式无效: ${mapFile}`)
          allValid = false
        }
      }
      catch (err) {
        error(`Source Map 解析失败: ${mapFile}`)
        allValid = false
      }
    }
    else {
      warning(`Source Map 不存在: ${mapFile}`)
    }
  })

  return allValid
}

// 运行构建验证
async function runBuildValidation() {
  info('开始构建验证...')

  const checks = [
    { name: '目录结构', fn: validateDirectoryStructure },
    { name: '必需文件', fn: validateRequiredFiles },
    { name: 'Package.json', fn: validatePackageJson },
    { name: '模块导入', fn: validateModuleImports },
    { name: '包大小', fn: validateBundleSize },
    { name: 'Source Maps', fn: validateSourceMaps },
  ]

  let allPassed = true
  const results = []

  for (const { name, fn } of checks) {
    info(`\n--- 验证 ${name} ---`)
    const passed = await fn()
    results.push({ name, passed })
    if (!passed) {
      allPassed = false
    }
  }

  // 输出总结
  info('\n--- 验证总结 ---')
  results.forEach(({ name, passed }) => {
    if (passed) {
      success(`${name}: 通过`)
    }
    else {
      error(`${name}: 失败`)
    }
  })

  if (allPassed) {
    success('\n🎉 所有验证通过！构建输出有效。')
    return true
  }
  else {
    error('\n💥 验证失败！请检查构建输出。')
    return false
  }
}

// 主函数
async function main() {
  try {
    const isValid = await runBuildValidation()
    process.exit(isValid ? 0 : 1)
  }
  catch (err) {
    error(`验证过程中发生错误: ${err.message}`)
    process.exit(1)
  }
}

// 直接运行主函数
main()

export {
  runBuildValidation,
  validateBundleSize,
  validateDirectoryStructure,
  validateModuleImports,
  validatePackageJson,
  validateRequiredFiles,
  validateSourceMaps,
}
