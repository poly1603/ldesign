#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 必需的配置文件
const requiredConfigFiles = [
  'package.json',
  'tsconfig.json',
  'rollup.config.js',
  'vitest.config.ts',
  'playwright.config.ts',
  'eslint.config.js',
]

// 必需的目录
const requiredDirectories = [
  'src',
  'src/types',
  'src/utils',
  '__tests__',
  'e2e',
  'docs',
  'examples',
]

// 必需的脚本
const requiredScripts = [
  'build',
  'build:watch',
  'dev',
  'type-check',
  'lint',
  'lint:check',
  'test',
  'test:ui',
  'test:run',
  'test:coverage',
  'test:e2e',
  'test:e2e:ui',
  'docs:dev',
  'docs:build',
  'docs:preview',
  'clean',
  'size-check',
  'prepublishOnly',
  'deploy',
  'deploy:beta',
  'deploy:alpha',
  'deploy:dry-run',
]

/**
 * 验证单个包的配置
 */
function verifyPackage(packageName) {
  const packageDir = path.resolve(__dirname, '../../../packages', packageName)

  if (!fs.existsSync(packageDir)) {
    console.log(`❌ ${packageName}: 包目录不存在`)
    return false
  }

  console.log(`\n🔍 验证 ${packageName} 包配置...`)

  let allValid = true
  const issues = []

  // 1. 检查配置文件
  console.log('📄 检查配置文件:')
  for (const file of requiredConfigFiles) {
    const filePath = path.join(packageDir, file)
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file}`)
    }
    else {
      console.log(`  ❌ ${file} - 缺失`)
      issues.push(`缺少配置文件: ${file}`)
      allValid = false
    }
  }

  // 2. 检查目录结构
  console.log('📁 检查目录结构:')
  for (const dir of requiredDirectories) {
    const dirPath = path.join(packageDir, dir)
    if (fs.existsSync(dirPath)) {
      console.log(`  ✅ ${dir}/`)
    }
    else {
      console.log(`  ⚠️  ${dir}/ - 缺失`)
      issues.push(`缺少目录: ${dir}`)
    }
  }

  // 3. 检查 package.json 脚本
  const packageJsonPath = path.join(packageDir, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    console.log('📜 检查 package.json 脚本:')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    const scripts = packageJson.scripts || {}

    const missingScripts = []
    for (const script of requiredScripts) {
      if (scripts[script]) {
        console.log(`  ✅ ${script}`)
      }
      else {
        console.log(`  ❌ ${script} - 缺失`)
        missingScripts.push(script)
        allValid = false
      }
    }

    if (missingScripts.length > 0) {
      issues.push(`缺少脚本: ${missingScripts.join(', ')}`)
    }
  }

  // 4. 检查 tsconfig.json 是否继承基础配置
  const tsconfigPath = path.join(packageDir, 'tsconfig.json')
  if (fs.existsSync(tsconfigPath)) {
    console.log('🔧 检查 tsconfig.json:')
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))
    if (tsconfig.extends === '../../tools/build/tsconfig.base.json') {
      console.log('  ✅ 正确继承基础配置')
    }
    else {
      console.log(`  ❌ 未正确继承基础配置: ${tsconfig.extends}`)
      issues.push('tsconfig.json 未正确继承基础配置')
      allValid = false
    }
  }

  // 5. 检查 rollup.config.js 是否使用基础配置
  const rollupConfigPath = path.join(packageDir, 'rollup.config.js')
  if (fs.existsSync(rollupConfigPath)) {
    console.log('🏗️  检查 rollup.config.js:')
    const rollupConfig = fs.readFileSync(rollupConfigPath, 'utf-8')
    if (rollupConfig.includes('createRollupConfig') && rollupConfig.includes('../../tools/build/rollup.config.base.js')) {
      console.log('  ✅ 使用统一构建配置')
    }
    else {
      console.log('  ❌ 未使用统一构建配置')
      issues.push('rollup.config.js 未使用统一构建配置')
      allValid = false
    }
  }

  // 6. 检查 vitest.config.ts 是否使用基础配置
  const vitestConfigPath = path.join(packageDir, 'vitest.config.ts')
  if (fs.existsSync(vitestConfigPath)) {
    console.log('🧪 检查 vitest.config.ts:')
    const vitestConfig = fs.readFileSync(vitestConfigPath, 'utf-8')
    if (vitestConfig.includes('createVitestConfig') && vitestConfig.includes('../../tools/test/vitest.config.base')) {
      console.log('  ✅ 使用统一测试配置')
    }
    else {
      console.log('  ❌ 未使用统一测试配置')
      issues.push('vitest.config.ts 未使用统一测试配置')
      allValid = false
    }
  }

  // 7. 检查 playwright.config.ts 是否使用基础配置
  const playwrightConfigPath = path.join(packageDir, 'playwright.config.ts')
  if (fs.existsSync(playwrightConfigPath)) {
    console.log('🎭 检查 playwright.config.ts:')
    const playwrightConfig = fs.readFileSync(playwrightConfigPath, 'utf-8')
    if (playwrightConfig.includes('createPlaywrightConfig') && playwrightConfig.includes('../../tools/test/playwright.config.base')) {
      console.log('  ✅ 使用统一E2E配置')
    }
    else {
      console.log('  ❌ 未使用统一E2E配置')
      issues.push('playwright.config.ts 未使用统一E2E配置')
      allValid = false
    }
  }

  if (allValid) {
    console.log(`✅ ${packageName} 配置验证通过`)
  }
  else {
    console.log(`❌ ${packageName} 配置验证失败`)
    console.log('问题列表:')
    issues.forEach(issue => console.log(`  - ${issue}`))
  }

  return { valid: allValid, issues }
}

/**
 * 验证所有包
 */
function verifyAllPackages() {
  console.log('🚀 开始验证所有包配置...')

  const packagesDir = path.resolve(__dirname, '../../../packages')
  const packages = fs.readdirSync(packagesDir).filter((name) => {
    const packagePath = path.join(packagesDir, name)
    return fs.statSync(packagePath).isDirectory() && fs.existsSync(path.join(packagePath, 'package.json'))
  })

  let allPackagesValid = true
  const results = {}

  for (const packageName of packages) {
    try {
      const result = verifyPackage(packageName)
      results[packageName] = result
      if (!result.valid) {
        allPackagesValid = false
      }
    }
    catch (error) {
      console.error(`❌ 验证 ${packageName} 失败:`, error.message)
      results[packageName] = { valid: false, issues: [error.message] }
      allPackagesValid = false
    }
  }

  // 输出总结
  console.log('\n📊 验证结果总结:')
  console.log('='.repeat(60))

  let validCount = 0
  let totalIssues = 0

  for (const [packageName, result] of Object.entries(results)) {
    const status = result.valid ? '✅ 通过' : '❌ 失败'
    const issueCount = result.issues ? result.issues.length : 0
    console.log(`${packageName.padEnd(12)} ${status} ${issueCount > 0 ? `(${issueCount} 问题)` : ''}`)

    if (result.valid)
      validCount++
    totalIssues += issueCount
  }

  console.log('='.repeat(60))
  console.log(`总包数: ${packages.length}`)
  console.log(`通过: ${validCount}`)
  console.log(`失败: ${packages.length - validCount}`)
  console.log(`总问题数: ${totalIssues}`)

  if (allPackagesValid) {
    console.log('\n🎉 所有包配置验证通过!')
  }
  else {
    console.log('\n⚠️  部分包配置需要修复')
    console.log('\n💡 建议运行以下命令修复配置:')
    console.log('   node tools/quick-standardize.js')
  }

  return allPackagesValid
}

// CLI 处理
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    verifyAllPackages()
  }
  else {
    const packageName = args[0]
    verifyPackage(packageName)
  }
}
