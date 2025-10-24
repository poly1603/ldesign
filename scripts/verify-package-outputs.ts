#!/usr/bin/env node
/**
 * 验证所有packages的构建产物完整性
 * 
 * 检查每个包是否有完整的:
 * - es/ 目录 (ESM格式)
 * - lib/ 目录 (CJS格式)
 * - dist/ 目录 (UMD格式)
 * 
 * 使用方法:
 * node scripts/verify-package-outputs.ts
 * 
 * 或使用pnpm:
 * pnpm verify:outputs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface PackageResult {
  name: string
  hasEs: boolean
  hasLib: boolean
  hasDist: boolean
  esFiles?: number
  libFiles?: number
  distFiles?: number
  status: 'complete' | 'partial' | 'missing'
}

function checkDirectory(dir: string): { exists: boolean; fileCount: number } {
  if (!fs.existsSync(dir)) {
    return { exists: false, fileCount: 0 }
  }

  try {
    const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true })
    const fileCount = files.filter(f => f.isFile()).length
    return { exists: true, fileCount }
  } catch {
    return { exists: false, fileCount: 0 }
  }
}

function verifyPackage(packagePath: string, packageName: string): PackageResult {
  const esDir = path.join(packagePath, 'es')
  const libDir = path.join(packagePath, 'lib')
  const distDir = path.join(packagePath, 'dist')

  const esCheck = checkDirectory(esDir)
  const libCheck = checkDirectory(libDir)
  const distCheck = checkDirectory(distDir)

  const hasEs = esCheck.exists
  const hasLib = libCheck.exists
  const hasDist = distCheck.exists

  let status: PackageResult['status'] = 'missing'
  if (hasEs && hasLib && hasDist) {
    status = 'complete'
  } else if (hasEs || hasLib || hasDist) {
    status = 'partial'
  }

  return {
    name: packageName,
    hasEs,
    hasLib,
    hasDist,
    esFiles: esCheck.fileCount,
    libFiles: libCheck.fileCount,
    distFiles: distCheck.fileCount,
    status,
  }
}

function main() {
  const packagesDir = path.resolve(__dirname, '../packages')

  if (!fs.existsSync(packagesDir)) {
    console.error('❌ packages 目录不存在:', packagesDir)
    process.exit(1)
  }

  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => !dirent.name.startsWith('.'))
    .map(dirent => dirent.name)
    .sort()

  console.log('📦 检查 packages 构建产物...\n')

  const results: PackageResult[] = []

  for (const pkg of packages) {
    const packagePath = path.join(packagesDir, pkg)
    const packageJsonPath = path.join(packagePath, 'package.json')

    // 跳过没有 package.json 的目录
    if (!fs.existsSync(packageJsonPath)) {
      continue
    }

    const result = verifyPackage(packagePath, pkg)
    results.push(result)
  }

  // 按状态分组
  const complete = results.filter(r => r.status === 'complete')
  const partial = results.filter(r => r.status === 'partial')
  const missing = results.filter(r => r.status === 'missing')

  // 打印详细结果
  console.log('┌─────────────────────┬─────┬─────┬──────┬────────┐')
  console.log('│ Package             │ ES  │ LIB │ DIST │ Status │')
  console.log('├─────────────────────┼─────┼─────┼──────┼────────┤')

  results.forEach(r => {
    const nameCol = r.name.padEnd(19)
    const esCol = r.hasEs ? '✓' : '✗'
    const libCol = r.hasLib ? '✓' : '✗'
    const distCol = r.hasDist ? '✓' : '✗'
    const statusCol = r.status === 'complete' ? '  ✅  ' : r.status === 'partial' ? '  ⚠️  ' : '  ❌  '

    console.log(`│ ${nameCol} │  ${esCol}  │  ${libCol}  │  ${distCol}   │ ${statusCol}│`)
  })

  console.log('└─────────────────────┴─────┴─────┴──────┴────────┘')
  console.log()

  // 统计信息
  console.log('📊 统计信息:')
  console.log(`   总包数: ${results.length}`)
  console.log(`   ✅ 完整: ${complete.length} 个`)
  console.log(`   ⚠️  部分: ${partial.length} 个`)
  console.log(`   ❌ 缺失: ${missing.length} 个`)
  console.log()

  // 显示有问题的包
  if (partial.length > 0) {
    console.log('⚠️  部分构建的包:')
    partial.forEach(r => {
      const missing = []
      if (!r.hasEs) missing.push('es')
      if (!r.hasLib) missing.push('lib')
      if (!r.hasDist) missing.push('dist')
      console.log(`   ${r.name}: 缺少 ${missing.join(', ')}`)
    })
    console.log()
  }

  if (missing.length > 0) {
    console.log('❌ 完全未构建的包:')
    missing.forEach(r => {
      console.log(`   ${r.name}`)
    })
    console.log()
  }

  // 文件数量统计
  console.log('📁 文件数量统计:')
  results.filter(r => r.status === 'complete').forEach(r => {
    console.log(`   ${r.name.padEnd(20)} ES:${String(r.esFiles).padStart(4)} LIB:${String(r.libFiles).padStart(4)} DIST:${String(r.distFiles).padStart(4)}`)
  })
  console.log()

  // 返回状态码
  if (missing.length > 0 || partial.length > 0) {
    console.log('⚠️  发现问题，请检查并重新构建相关包')
    process.exit(1)
  } else {
    console.log('✅ 所有包的构建产物完整！')
    process.exit(0)
  }
}

main()

