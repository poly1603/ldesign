#!/usr/bin/env node

/**
 * 为所有有构建产物的包添加构建校验脚本
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  cyan: '\x1B[36m',
  white: '\x1B[37m',
  gray: '\x1B[90m',
  reset: '\x1B[0m',
}

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 项目根目录
const projectRoot = path.resolve(__dirname, '../..')

// 要添加的脚本
const buildValidationScripts = {
  'build:check':
    'pnpm run build && node ../../tools/scripts/build/bundle-validator.js',
  'build:analyze':
    'pnpm run build && node ../../tools/scripts/build/bundle-analyzer.js',
  'build:validate':
    'pnpm run build && node ../../tools/scripts/build/validate-build.js',
  'build:browser-test':
    'pnpm run build && node ../../tools/scripts/build/browser-tester.js',
}

// 检查包是否有构建产物
function hasBuiltArtifacts(packagePath) {
  const buildDirs = ['dist', 'es', 'lib', 'types']
  return buildDirs.some(dir => fs.existsSync(path.join(packagePath, dir)))
}

// 更新package.json
function updatePackageJson(packagePath, packageName) {
  const packageJsonPath = path.join(packagePath, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    log(`⚠️  ${packageName}: package.json不存在`, 'yellow')
    return false
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    // 确保scripts字段存在
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    // 检查是否已经有构建校验脚本
    const hasValidationScripts = Object.keys(buildValidationScripts).some(
      script => packageJson.scripts[script]
    )

    if (hasValidationScripts) {
      log(`ℹ️  ${packageName}: 已存在构建校验脚本，跳过`, 'blue')
      return false
    }

    // 添加构建校验脚本
    let scriptsAdded = 0
    for (const [scriptName, scriptCommand] of Object.entries(
      buildValidationScripts
    )) {
      if (!packageJson.scripts[scriptName]) {
        packageJson.scripts[scriptName] = scriptCommand
        scriptsAdded++
      }
    }

    if (scriptsAdded > 0) {
      // 写回文件
      fs.writeFileSync(
        packageJsonPath,
        `${JSON.stringify(packageJson, null, 2)}\n`
      )
      log(`✅ ${packageName}: 添加了 ${scriptsAdded} 个构建校验脚本`, 'green')
      return true
    } else {
      log(`ℹ️  ${packageName}: 无需添加脚本`, 'blue')
      return false
    }
  } catch (err) {
    log(`❌ ${packageName}: 更新失败 - ${err.message}`, 'red')
    return false
  }
}

// 主函数
async function main() {
  log('🚀 开始为所有包添加构建校验脚本...', 'cyan')

  const packagesDir = path.join(projectRoot, 'packages')

  if (!fs.existsSync(packagesDir)) {
    log('❌ packages目录不存在', 'red')
    process.exit(1)
  }

  const packages = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  let updatedCount = 0
  let skippedCount = 0
  const errorCount = 0

  for (const packageName of packages) {
    const packagePath = path.join(packagesDir, packageName)

    // 检查是否有构建产物
    if (!hasBuiltArtifacts(packagePath)) {
      log(`⏭️  ${packageName}: 无构建产物，跳过`, 'gray')
      skippedCount++
      continue
    }

    log(`\n📦 处理包: ${packageName}`, 'cyan')

    const updated = updatePackageJson(packagePath, packageName)

    if (updated) {
      updatedCount++
    } else {
      skippedCount++
    }
  }

  log('\n📊 处理结果汇总:', 'cyan')
  log(`  ✅ 更新成功: ${updatedCount} 个包`, 'green')
  log(`  ⏭️  跳过: ${skippedCount} 个包`, 'gray')
  log(`  ❌ 错误: ${errorCount} 个包`, 'red')

  if (updatedCount > 0) {
    log('\n🎯 下一步:', 'cyan')
    log('  1. 检查更新的package.json文件', 'white')
    log('  2. 测试构建校验脚本是否正常工作', 'white')
    log('  3. 提交更改到git仓库', 'white')

    log('\n💡 测试示例:', 'cyan')
    log('  cd packages/color && pnpm run build:check', 'gray')
    log('  cd packages/crypto && pnpm run build:analyze', 'gray')
  }

  log('\n✨ 完成！', 'green')
}

// 如果直接运行此脚本
if (import.meta.url.endsWith('add-build-validation.js')) {
  main().catch(err => {
    log(`❌ 执行失败: ${err.message}`, 'red')
    console.error(err.stack)
    process.exit(1)
  })
}
