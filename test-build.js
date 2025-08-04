#!/usr/bin/env node

/**
 * 测试所有包的构建状态
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

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
  'watermark'
]

console.log('🔍 检查所有包的构建状态...\n')

let allSuccess = true
const results = []

for (const pkg of packages) {
  const packagePath = join('packages', pkg)
  const distPath = join(packagePath, 'dist')
  
  console.log(`📦 检查 ${pkg} 包...`)
  
  try {
    // 检查 dist 目录是否存在
    if (!existsSync(distPath)) {
      console.log(`❌ ${pkg}: dist 目录不存在`)
      results.push({ package: pkg, status: 'failed', reason: 'dist 目录不存在' })
      allSuccess = false
      continue
    }
    
    // 检查主要文件是否存在
    const mainFiles = ['index.js', 'index.d.ts']
    const missingFiles = []
    
    for (const file of mainFiles) {
      const filePath = join(distPath, file)
      if (!existsSync(filePath)) {
        missingFiles.push(file)
      }
    }
    
    if (missingFiles.length > 0) {
      console.log(`❌ ${pkg}: 缺少文件 ${missingFiles.join(', ')}`)
      results.push({ package: pkg, status: 'failed', reason: `缺少文件: ${missingFiles.join(', ')}` })
      allSuccess = false
    } else {
      console.log(`✅ ${pkg}: 构建成功`)
      results.push({ package: pkg, status: 'success' })
    }
    
  } catch (error) {
    console.log(`❌ ${pkg}: 检查失败 - ${error.message}`)
    results.push({ package: pkg, status: 'failed', reason: error.message })
    allSuccess = false
  }
}

console.log('\n📊 构建结果汇总:')
console.log('='.repeat(50))

const successCount = results.filter(r => r.status === 'success').length
const failedCount = results.filter(r => r.status === 'failed').length

console.log(`✅ 成功: ${successCount} 个包`)
console.log(`❌ 失败: ${failedCount} 个包`)

if (failedCount > 0) {
  console.log('\n失败的包:')
  results.filter(r => r.status === 'failed').forEach(r => {
    console.log(`  - ${r.package}: ${r.reason}`)
  })
}

console.log('\n成功的包:')
results.filter(r => r.status === 'success').forEach(r => {
  console.log(`  - ${r.package}`)
})

if (allSuccess) {
  console.log('\n🎉 所有包构建成功！')
  process.exit(0)
} else {
  console.log('\n⚠️  部分包构建失败，请检查上述错误信息')
  process.exit(1)
}
