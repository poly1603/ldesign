#!/usr/bin/env node

/**
 * 简单的打包产物检查工具
 * 检查是否包含测试文件，是否能正常导入
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const packageRoot = path.resolve(__dirname, '..')

function checkTestFiles() {
  console.log('🔍 检查是否包含测试文件...')

  const buildDirs = ['dist', 'es', 'lib', 'types']
  const testPatterns = [/\.test\./, /\.spec\./, /__tests__/, /__mocks__/]

  let hasTestFiles = false

  for (const dir of buildDirs) {
    const dirPath = path.join(packageRoot, dir)
    if (!fs.existsSync(dirPath)) continue

    const files = getAllFiles(dirPath)

    for (const file of files) {
      const relativePath = path.relative(packageRoot, file)

      for (const pattern of testPatterns) {
        if (pattern.test(relativePath)) {
          console.log(`❌ 发现测试文件: ${relativePath}`)
          hasTestFiles = true
        }
      }
    }
  }

  if (!hasTestFiles) {
    console.log('✅ 未发现测试文件')
  }

  return !hasTestFiles
}

async function checkImports() {
  console.log('🔍 检查模块导入...')

  try {
    // 检查 ES 模块
    const esPath = path.join(packageRoot, 'es/index.js')
    if (fs.existsSync(esPath)) {
      try {
        // 使用 file:// URL 格式导入
        const moduleUrl = `file://${path.resolve(esPath).replace(/\\/g, '/')}`
        const module = await import(moduleUrl)
        if (typeof module.createEngine === 'function') {
          console.log('✅ ES模块 导入成功')
        } else {
          console.log('❌ ES模块 缺少 createEngine 导出')
          return false
        }
      } catch (err) {
        console.log(`❌ ES模块 导入失败: ${err.message}`)
        return false
      }
    }

    // 检查类型定义
    const typesPath = path.join(packageRoot, 'types/index.d.ts')
    if (fs.existsSync(typesPath)) {
      const content = fs.readFileSync(typesPath, 'utf8')
      if (content.includes('createEngine')) {
        console.log('✅ 类型定义包含 createEngine')
      } else {
        console.log('❌ 类型定义缺少 createEngine')
        return false
      }
    }

    return true
  } catch (err) {
    console.log(`❌ 导入检查失败: ${err.message}`)
    return false
  }
}

function checkBundleSize() {
  console.log('🔍 检查包大小...')

  const files = ['dist/index.js', 'dist/index.min.js']

  for (const file of files) {
    const filePath = path.join(packageRoot, file)
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      const sizeKB = (stats.size / 1024).toFixed(2)
      console.log(`📦 ${file}: ${sizeKB}KB`)

      if (stats.size > 2 * 1024 * 1024) {
        // 2MB
        console.log(`⚠️  ${file} 文件较大`)
      }
    }
  }
}

function getAllFiles(dir) {
  const files = []

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const itemPath = path.join(currentDir, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        traverse(itemPath)
      } else {
        files.push(itemPath)
      }
    }
  }

  traverse(dir)
  return files
}

async function main() {
  console.log('🚀 开始检查打包产物...\n')

  const testFilesOk = checkTestFiles()
  console.log('')

  const importsOk = await checkImports()
  console.log('')

  checkBundleSize()
  console.log('')

  if (testFilesOk && importsOk) {
    console.log('✅ 所有检查通过！')
    process.exit(0)
  } else {
    console.log('❌ 检查失败，请修复问题后重新构建')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('❌ 检查过程出错:', err.message)
  process.exit(1)
})
