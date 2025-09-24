#!/usr/bin/env node

/**
 * 构建性能监控脚本
 * 监控构建时间、包大小等关键指标
 */

import { execSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const packageRoot = join(__dirname, '..')

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * 获取目录大小
 */
function getDirSize(dirPath) {
  let totalSize = 0

  try {
    const files = readdirSync(dirPath, { withFileTypes: true })

    for (const file of files) {
      const filePath = join(dirPath, file.name)

      if (file.isDirectory()) {
        totalSize += getDirSize(filePath)
      }
      else {
        totalSize += statSync(filePath).size
      }
    }
  }
  catch (error) {
    // 忽略无法访问的目录
  }

  return totalSize
}

/**
 * 分析构建产物
 */
function analyzeBuildOutput() {
  const distDir = join(packageRoot, 'dist')
  const esDir = join(packageRoot, 'es')
  const libDir = join(packageRoot, 'lib')

  const analysis = {
    dist: { size: 0, files: 0 },
    es: { size: 0, files: 0 },
    lib: { size: 0, files: 0 },
    total: { size: 0, files: 0 },
  }

  // 分析各个目录
  for (const [name, dir] of Object.entries({ dist: distDir, es: esDir, lib: libDir })) {
    try {
      const size = getDirSize(dir)
      const files = readdirSync(dir, { recursive: true }).filter((file) => {
        const filePath = join(dir, file)
        return statSync(filePath).isFile()
      }).length

      analysis[name] = { size, files }
      analysis.total.size += size
      analysis.total.files += files
    }
    catch (error) {
      // 目录不存在
    }
  }

  return analysis
}

/**
 * 运行构建并监控性能
 */
function runBuildWithMonitoring(buildCommand) {
  console.log(`🚀 开始构建: ${buildCommand}`)
  console.log('⏱️  监控构建性能...\n')

  const startTime = Date.now()

  try {
    // 执行构建命令
    execSync(buildCommand, {
      cwd: packageRoot,
      stdio: 'inherit',
      encoding: 'utf8',
    })

    const endTime = Date.now()
    const buildTime = endTime - startTime

    console.log('\n📊 构建性能报告')
    console.log('='.repeat(50))

    // 构建时间
    console.log(`⏱️  构建时间: ${(buildTime / 1000).toFixed(2)}s`)

    // 分析构建产物
    const analysis = analyzeBuildOutput()

    console.log('\n📦 构建产物分析:')
    console.log(`   UMD (dist):  ${formatSize(analysis.dist.size)} (${analysis.dist.files} 文件)`)
    console.log(`   ESM (es):    ${formatSize(analysis.es.size)} (${analysis.es.files} 文件)`)
    console.log(`   CJS (lib):   ${formatSize(analysis.lib.size)} (${analysis.lib.files} 文件)`)
    console.log(`   总计:        ${formatSize(analysis.total.size)} (${analysis.total.files} 文件)`)

    // 性能评估
    console.log('\n🎯 性能评估:')
    if (buildTime < 10000) {
      console.log('   ✅ 构建速度: 优秀 (< 10s)')
    }
    else if (buildTime < 30000) {
      console.log('   ⚠️  构建速度: 良好 (10-30s)')
    }
    else {
      console.log('   ❌ 构建速度: 需要优化 (> 30s)')
    }

    if (analysis.total.size < 1024 * 1024) {
      console.log('   ✅ 包大小: 优秀 (< 1MB)')
    }
    else if (analysis.total.size < 5 * 1024 * 1024) {
      console.log('   ⚠️  包大小: 良好 (1-5MB)')
    }
    else {
      console.log('   ❌ 包大小: 需要优化 (> 5MB)')
    }

    console.log('\n✅ 构建完成!')
  }
  catch (error) {
    console.error('\n❌ 构建失败:', error.message)
    process.exit(1)
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2)
  const buildCommand = args.length > 0 ? args.join(' ') : 'pnpm run build'

  runBuildWithMonitoring(buildCommand)
}

// 直接执行
main()

export { analyzeBuildOutput, runBuildWithMonitoring }
