#!/usr/bin/env node

/**
 * 修复所有包的 package.json 配置，确保一致性
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const packages = [
  'color',
  'crypto',
  'device',
  'engine',
  'form',
  'http',
  'i18n',
  'router',
  'store',
  'template',
  'watermark',
]

console.log('🔧 修复包配置文件...\n')

for (const packageName of packages) {
  const packageJsonPath = join('packages', packageName, 'package.json')

  try {
    const content = readFileSync(packageJsonPath, 'utf8')
    const pkg = JSON.parse(content)

    console.log(`📦 处理 ${packageName}...`)

    // 修复字段配置
    const updates = []

    if (pkg.main !== 'dist/index.js') {
      updates.push(`main: "${pkg.main}" → "dist/index.js"`)
      pkg.main = 'dist/index.js'
    }

    if (pkg.module !== 'es/index.js') {
      updates.push(`module: "${pkg.module}" → "es/index.js"`)
      pkg.module = 'es/index.js'
    }

    if (pkg.types !== 'dist/index.d.ts') {
      updates.push(`types: "${pkg.types}" → "dist/index.d.ts"`)
      pkg.types = 'dist/index.d.ts'
    }

    // 修复 exports 字段
    if (pkg.exports && pkg.exports['.']) {
      const exports = pkg.exports['.']

      if (exports.import !== './es/index.js') {
        updates.push(`exports.import: "${exports.import}" → "./es/index.js"`)
        exports.import = './es/index.js'
      }

      if (exports.require !== './lib/index.js') {
        updates.push(`exports.require: "${exports.require}" → "./lib/index.js"`)
        exports.require = './lib/index.js'
      }

      if (exports.types !== './dist/index.d.ts') {
        updates.push(`exports.types: "${exports.types}" → "./dist/index.d.ts"`)
        exports.types = './dist/index.d.ts'
      }
    }

    // 确保 files 字段包含所有构建产物
    if (!pkg.files) {
      pkg.files = []
    }

    const requiredFiles = ['dist', 'es', 'lib', 'types']
    let filesUpdated = false

    for (const file of requiredFiles) {
      if (!pkg.files.includes(file)) {
        pkg.files.push(file)
        filesUpdated = true
      }
    }

    if (filesUpdated) {
      updates.push(`files: 添加构建产物目录`)
    }

    // 写回文件
    if (updates.length > 0) {
      writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`)
      console.log(`   ✅ 已更新: ${updates.join(', ')}`)
    } else {
      console.log(`   ✅ 配置已正确`)
    }
  } catch (error) {
    console.log(`   ❌ 处理失败: ${error.message}`)
  }

  console.log()
}

console.log('🎉 包配置修复完成！')
