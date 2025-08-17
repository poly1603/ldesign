#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1B[0m',
  bright: '\x1B[1m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0)
    return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// 获取文件大小信息
function getFileInfo(filePath) {
  if (!existsSync(filePath)) {
    return null
  }

  const content = readFileSync(filePath)
  const gzipped = gzipSync(content)

  return {
    raw: content.length,
    gzipped: gzipped.length,
    compression: ((1 - gzipped.length / content.length) * 100).toFixed(1),
  }
}

// 分析单个文件
function analyzeFile(filePath, name) {
  const info = getFileInfo(filePath)

  if (!info) {
    log(`❌ ${name}: 文件不存在`, 'red')
    return null
  }

  const rawSize = formatSize(info.raw)
  const gzippedSize = formatSize(info.gzipped)
  const compression = info.compression

  log(`📦 ${name}:`, 'cyan')
  log(`   原始大小: ${rawSize}`, 'blue')
  log(`   Gzip 大小: ${gzippedSize}`, 'green')
  log(`   压缩率: ${compression}%`, 'yellow')
  log('')

  return info
}

// 生成大小报告
function generateSizeReport(files) {
  const report = {
    timestamp: new Date().toISOString(),
    files: {},
    summary: {
      totalRaw: 0,
      totalGzipped: 0,
      averageCompression: 0,
    },
  }

  let validFiles = 0
  let totalCompression = 0

  Object.entries(files).forEach(([name, filePath]) => {
    const info = getFileInfo(resolve(rootDir, filePath))

    if (info) {
      report.files[name] = {
        path: filePath,
        rawSize: info.raw,
        gzippedSize: info.gzipped,
        compression: Number.parseFloat(info.compression),
      }

      report.summary.totalRaw += info.raw
      report.summary.totalGzipped += info.gzipped
      totalCompression += Number.parseFloat(info.compression)
      validFiles++
    }
  })

  if (validFiles > 0) {
    report.summary.averageCompression = (totalCompression / validFiles).toFixed(1)
  }

  return report
}

// 比较大小限制
function checkSizeLimits(report) {
  const limits = {
    'ES Module': { path: 'dist/index.js', maxGzipped: 50 * 1024 }, // 50KB
    'UMD (开发版)': { path: 'dist/ldesign-engine.js', maxGzipped: 80 * 1024 }, // 80KB
    'UMD (生产版)': { path: 'dist/ldesign-engine.min.js', maxGzipped: 40 * 1024 }, // 40KB
  }

  log('📊 大小限制检查:', 'bright')
  log('')

  let allPassed = true

  Object.entries(limits).forEach(([name, limit]) => {
    const fileInfo = Object.values(report.files).find(f => f.path === limit.path)

    if (fileInfo) {
      const passed = fileInfo.gzippedSize <= limit.maxGzipped
      const status = passed ? '✅' : '❌'
      const color = passed ? 'green' : 'red'

      log(`${status} ${name}:`, color)
      log(`   当前: ${formatSize(fileInfo.gzippedSize)}`, 'blue')
      log(`   限制: ${formatSize(limit.maxGzipped)}`, 'yellow')

      if (!passed) {
        const excess = fileInfo.gzippedSize - limit.maxGzipped
        log(`   超出: ${formatSize(excess)}`, 'red')
        allPassed = false
      }

      log('')
    }
  })

  return allPassed
}

// 生成趋势分析
function generateTrendAnalysis() {
  const historyFile = resolve(rootDir, 'dist/size-history.json')
  let history = []

  if (existsSync(historyFile)) {
    try {
      history = JSON.parse(readFileSync(historyFile, 'utf-8'))
    }
    catch (error) {
      log('⚠️  无法读取历史数据', 'yellow')
    }
  }

  return history
}

// 主分析函数
function main() {
  log('📊 LDesign Engine 包大小分析', 'bright')
  log('='.repeat(50), 'cyan')
  log('')

  // 定义要分析的文件
  const files = {
    'ES Module': 'dist/index.js',
    'CommonJS': 'lib/index.js',
    'UMD (开发版)': 'dist/ldesign-engine.js',
    'UMD (生产版)': 'dist/ldesign-engine.min.js',
    'Vue 适配器 (ES)': 'dist/vue.js',
    'Vue 适配器 (CJS)': 'lib/vue.js',
    'TypeScript 定义': 'types/index.d.ts',
  }

  // 分析每个文件
  Object.entries(files).forEach(([name, filePath]) => {
    analyzeFile(resolve(rootDir, filePath), name)
  })

  // 生成报告
  const report = generateSizeReport(files)

  // 显示总结
  log('📋 总结:', 'bright')
  log(`   总原始大小: ${formatSize(report.summary.totalRaw)}`, 'blue')
  log(`   总 Gzip 大小: ${formatSize(report.summary.totalGzipped)}`, 'green')
  log(`   平均压缩率: ${report.summary.averageCompression}%`, 'yellow')
  log('')

  // 检查大小限制
  const sizeLimitsPassed = checkSizeLimits(report)

  // 生成建议
  log('💡 优化建议:', 'bright')

  if (report.summary.averageCompression < 70) {
    log('   • 考虑使用更好的压缩算法', 'yellow')
  }

  if (!sizeLimitsPassed) {
    log('   • 某些包超出了大小限制，考虑代码分割或优化', 'red')
  }

  const mainBundleInfo = Object.values(report.files).find(f => f.path === 'dist/ldesign-engine.min.js')
  if (mainBundleInfo && mainBundleInfo.gzippedSize > 30 * 1024) {
    log('   • 主包较大，考虑懒加载非核心功能', 'yellow')
  }

  log('   • 定期监控包大小变化', 'green')
  log('   • 考虑使用 tree-shaking 优化', 'green')
  log('')

  // 保存报告
  try {
    const reportPath = resolve(rootDir, 'dist/size-report.json')
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    log(`📄 报告已保存到: ${reportPath}`, 'green')
  }
  catch (error) {
    log('⚠️  无法保存报告', 'yellow')
  }

  // 退出状态
  if (!sizeLimitsPassed) {
    log('')
    log('❌ 包大小检查失败!', 'red')
    process.exit(1)
  }
  else {
    log('')
    log('✅ 包大小检查通过!', 'green')
  }
}

// 处理命令行参数
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
LDesign Engine 包大小分析工具

用法:
  node scripts/analyze-bundle.js [选项]

选项:
  --help, -h     显示帮助信息
  --json         输出 JSON 格式报告
  --quiet        静默模式，只显示结果

示例:
  node scripts/analyze-bundle.js          # 完整分析
  node scripts/analyze-bundle.js --json   # JSON 输出
  node scripts/analyze-bundle.js --quiet  # 静默模式
`)
  process.exit(0)
}

if (args.includes('--json')) {
  const files = {
    'ES Module': 'dist/index.js',
    'CommonJS': 'lib/index.js',
    'UMD (开发版)': 'dist/ldesign-engine.js',
    'UMD (生产版)': 'dist/ldesign-engine.min.js',
  }

  const report = generateSizeReport(files)
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

// 执行主分析
main()
