#!/usr/bin/env node

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const packages = [
  'color',
  'crypto',
  'device',
  'engine',
  'http',
  'i18n',
  'router',
  'store',
  'template',
]

const results = {}

console.log('🚀 开始测试所有包的构建...\n')

for (const packageName of packages) {
  const packageDir = path.resolve(__dirname, '../../../packages', packageName)

  if (!fs.existsSync(packageDir)) {
    console.log(`⚠️  包 ${packageName} 不存在，跳过`)
    results[packageName] = { success: false, error: '包不存在' }
    continue
  }

  console.log(`🔧 构建 ${packageName}...`)

  try {
    const startTime = Date.now()

    // 执行构建
    execSync('pnpm build', {
      cwd: packageDir,
      stdio: 'pipe',
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    // 检查构建产物
    const requiredDirs = ['dist', 'es', 'lib', 'types']
    const missingDirs = []

    for (const dir of requiredDirs) {
      const dirPath = path.join(packageDir, dir)
      if (!fs.existsSync(dirPath)) {
        missingDirs.push(dir)
      }
    }

    if (missingDirs.length === 0) {
      console.log(`  ✅ ${packageName} 构建成功 (${duration}ms)`)
      results[packageName] = {
        success: true,
        duration,
        artifacts: requiredDirs,
      }
    }
    else {
      console.log(`  ❌ ${packageName} 构建产物不完整，缺少: ${missingDirs.join(', ')}`)
      results[packageName] = {
        success: false,
        error: `缺少构建产物: ${missingDirs.join(', ')}`,
        duration,
      }
    }
  }
  catch (error) {
    console.log(`  ❌ ${packageName} 构建失败`)
    console.log(`     错误: ${error.message.split('\n')[0]}`)
    results[packageName] = {
      success: false,
      error: error.message.split('\n')[0],
    }
  }

  console.log('')
}

// 输出总结
console.log('📊 构建结果总结:')
console.log('='.repeat(60))

let successCount = 0
let totalDuration = 0

for (const [packageName, result] of Object.entries(results)) {
  const status = result.success ? '✅ 成功' : '❌ 失败'
  const duration = result.duration ? `(${result.duration}ms)` : ''
  console.log(`${packageName.padEnd(12)} ${status} ${duration}`)

  if (result.success) {
    successCount++
    totalDuration += result.duration || 0
  }
  else {
    console.log(`${''.padEnd(12)}    ${result.error}`)
  }
}

console.log('='.repeat(60))
console.log(`总包数: ${packages.length}`)
console.log(`成功: ${successCount}`)
console.log(`失败: ${packages.length - successCount}`)
console.log(`总耗时: ${totalDuration}ms`)
console.log(`平均耗时: ${Math.round(totalDuration / successCount)}ms`)

if (successCount === packages.length) {
  console.log('\n🎉 所有包构建成功!')
}
else {
  console.log('\n⚠️  部分包构建失败，需要修复')
}

// 保存结果到文件
const reportPath = path.resolve(__dirname, '../BUILD_REPORT.json')
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
console.log(`\n📄 详细报告已保存到: ${reportPath}`)

export { results }
