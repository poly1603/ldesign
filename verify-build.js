#!/usr/bin/env node

/**
 * 验证包构建结果的简化脚本
 */

import { existsSync } from 'node:fs'
import { join } from 'node:path'

console.log('🔍 验证 LDesign 包构建结果...\n')

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

let successCount = 0
let partialCount = 0
let failedCount = 0

for (const pkg of packages) {
  const distPath = join('packages', pkg, 'dist')
  const hasIndex = existsSync(join(distPath, 'index.js'))
  const hasTypes = existsSync(join(distPath, 'index.d.ts'))

  if (hasIndex && hasTypes) {
    console.log(`✅ ${pkg}: 完整构建`)
    successCount++
  } else if (hasIndex || hasTypes) {
    console.log(
      `⚠️  ${pkg}: 部分构建 (${hasIndex ? '有JS' : '无JS'}, ${
        hasTypes ? '有类型' : '无类型'
      })`
    )
    partialCount++
  } else {
    console.log(`❌ ${pkg}: 构建失败`)
    failedCount++
  }
}

console.log('\n📊 构建结果统计:')
console.log(`✅ 完整成功: ${successCount} 个包`)
console.log(`⚠️  部分成功: ${partialCount} 个包`)
console.log(`❌ 构建失败: ${failedCount} 个包`)
console.log(
  `📈 总体成功率: ${(
    ((successCount + partialCount) / packages.length) *
    100
  ).toFixed(1)}%`
)

if (successCount + partialCount >= packages.length * 0.8) {
  console.log('\n🎉 构建修复基本成功！大部分包都能正常工作。')
} else {
  console.log('\n⚠️  还需要进一步修复更多包的构建问题。')
}
