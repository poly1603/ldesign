#!/usr/bin/env tsx

import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const workspaceRoot = process.cwd()

const successfulPackages = [
  'packages/api',
  'packages/cache',
  'packages/color',
  'packages/crypto',
  'packages/device',
  'packages/engine',
  'packages/form',
  'packages/http',
  'packages/i18n',
  'packages/router',
  'packages/size',
  'packages/store',
  'packages/template',
  'packages/theme',
]

function checkPackageArtifacts(packagePath: string) {
  const fullPath = join(workspaceRoot, packagePath)
  console.log(`\n📦 检查 ${packagePath}:`)

  const dirs = ['esm', 'cjs', 'types', 'dist']
  const results: any = {}

  for (const dir of dirs) {
    const dirPath = join(fullPath, dir)
    const exists = existsSync(dirPath)

    if (exists) {
      try {
        const files = readdirSync(dirPath)
        const fileCount = files.length
        const hasIndexJs = files.includes('index.js')
        const hasIndexDts = files.includes('index.d.ts')

        results[dir] = {
          exists: true,
          fileCount,
          hasIndexJs,
          hasIndexDts,
          files: files.slice(0, 5), // 只显示前5个文件
        }

        console.log(`  ${dir}/: ✅ (${fileCount} 文件)`)
        if (dir === 'esm' || dir === 'cjs') {
          console.log(`    index.js: ${hasIndexJs ? '✅' : '❌'}`)
        }
        if (dir === 'types') {
          console.log(`    index.d.ts: ${hasIndexDts ? '✅' : '❌'}`)
        }
        console.log(
          `    文件: ${files.slice(0, 3).join(', ')}${
            files.length > 3 ? '...' : ''
          }`,
        )
      }
      catch (error) {
        console.log(`  ${dir}/: ❌ (读取错误: ${error})`)
        results[dir] = { exists: true, error }
      }
    }
    else {
      console.log(`  ${dir}/: ❌ (不存在)`)
      results[dir] = { exists: false }
    }
  }

  return results
}

function main() {
  console.log('🔍 简化产物检查')
  console.log('='.repeat(50))

  const allResults: any = {}

  for (const pkg of successfulPackages) {
    allResults[pkg] = checkPackageArtifacts(pkg)
  }

  // 汇总统计
  console.log('\n📊 汇总统计:')
  const stats = {
    hasESM: 0,
    hasCJS: 0,
    hasTypes: 0,
    hasDist: 0,
    hasESMIndex: 0,
    hasCJSIndex: 0,
    hasTypesIndex: 0,
  }

  for (const [pkg, result] of Object.entries(allResults)) {
    if (result.esm?.exists)
      stats.hasESM++
    if (result.cjs?.exists)
      stats.hasCJS++
    if (result.types?.exists)
      stats.hasTypes++
    if (result.dist?.exists)
      stats.hasDist++

    if (result.esm?.hasIndexJs)
      stats.hasESMIndex++
    if (result.cjs?.hasIndexJs)
      stats.hasCJSIndex++
    if (result.types?.hasIndexDts)
      stats.hasTypesIndex++
  }

  const total = successfulPackages.length
  console.log(`ESM 目录: ${stats.hasESM}/${total}`)
  console.log(`CJS 目录: ${stats.hasCJS}/${total}`)
  console.log(`Types 目录: ${stats.hasTypes}/${total}`)
  console.log(`Dist 目录: ${stats.hasDist}/${total}`)
  console.log(`ESM index.js: ${stats.hasESMIndex}/${total}`)
  console.log(`CJS index.js: ${stats.hasCJSIndex}/${total}`)
  console.log(`Types index.d.ts: ${stats.hasTypesIndex}/${total}`)

  console.log('\n='.repeat(50))
  console.log('检查完成！')
}

main()
