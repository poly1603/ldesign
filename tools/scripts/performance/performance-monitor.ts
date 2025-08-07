#!/usr/bin/env tsx

/**
 * 性能监控工具
 * 监控构建时间、包大小和测试性能
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface PerformanceMetrics {
  timestamp: string
  buildTime: {
    total: number
    packages: Record<string, number>
  }
  bundleSize: {
    total: number
    packages: Record<string, number>
  }
  testTime: {
    total: number
    coverage: number
  }
  memory: {
    heapUsed: number
    heapTotal: number
  }
}

interface PerformanceHistory {
  metrics: PerformanceMetrics[]
}

/**
 * 测量命令执行时间
 */
function measureCommand(command: string, cwd?: string): number {
  const startTime = Date.now()

  try {
    execSync(command, {
      cwd: cwd || process.cwd(),
      stdio: 'pipe',
      encoding: 'utf-8',
    })
  } catch (error) {
    console.error(`Command failed: ${command}`)
  }

  return Date.now() - startTime
}

/**
 * 获取包大小
 */
function getPackageSize(packagePath: string): number {
  const distPath = join(packagePath, 'dist')

  if (!existsSync(distPath)) {
    return 0
  }

  try {
    const output = execSync(`du -sb ${distPath}`, {
      encoding: 'utf-8',
    }).trim()

    return parseInt(output.split('\t')[0], 10)
  } catch {
    // Windows fallback
    const { readdirSync, statSync } = require('node:fs')

    let size = 0
    const files = readdirSync(distPath, { recursive: true })

    for (const file of files) {
      const filePath = join(distPath, file.toString())
      try {
        const stats = statSync(filePath)
        if (stats.isFile()) {
          size += stats.size
        }
      } catch {
        // Ignore errors
      }
    }

    return size
  }
}

/**
 * 收集性能指标
 */
async function collectMetrics(): Promise<PerformanceMetrics> {
  const rootDir = process.cwd()
  const packagesDir = join(rootDir, 'packages')

  console.log('📊 开始收集性能指标...\n')

  const metrics: PerformanceMetrics = {
    timestamp: new Date().toISOString(),
    buildTime: {
      total: 0,
      packages: {},
    },
    bundleSize: {
      total: 0,
      packages: {},
    },
    testTime: {
      total: 0,
      coverage: 0,
    },
    memory: {
      heapUsed: 0,
      heapTotal: 0,
    },
  }

  // 测量构建时间
  console.log('⏱️  测量构建时间...')
  const buildStartTime = Date.now()

  try {
    execSync('pnpm build', {
      cwd: rootDir,
      stdio: 'pipe',
    })
  } catch {
    console.warn('构建失败，继续其他测量...')
  }

  metrics.buildTime.total = Date.now() - buildStartTime
  console.log(`   总构建时间: ${(metrics.buildTime.total / 1000).toFixed(2)}s`)

  // 测量各个包的大小
  console.log('\n📦 测量包大小...')
  const { readdirSync, statSync } = require('node:fs')
  const packages = readdirSync(packagesDir).filter(name => {
    const path = join(packagesDir, name)
    return statSync(path).isDirectory()
  })

  for (const packageName of packages) {
    const packagePath = join(packagesDir, packageName)
    const size = getPackageSize(packagePath)
    metrics.bundleSize.packages[packageName] = size
    metrics.bundleSize.total += size

    if (size > 0) {
      console.log(`   ${packageName}: ${formatSize(size)}`)
    }
  }

  console.log(`   总大小: ${formatSize(metrics.bundleSize.total)}`)

  // 测量测试时间
  console.log('\n🧪 测量测试时间...')
  metrics.testTime.total = measureCommand('pnpm test:run', rootDir)
  console.log(`   单元测试: ${(metrics.testTime.total / 1000).toFixed(2)}s`)

  // 内存使用
  const memUsage = process.memoryUsage()
  metrics.memory.heapUsed = memUsage.heapUsed
  metrics.memory.heapTotal = memUsage.heapTotal

  console.log('\n💾 内存使用:')
  console.log(`   Heap Used: ${formatSize(metrics.memory.heapUsed)}`)
  console.log(`   Heap Total: ${formatSize(metrics.memory.heapTotal)}`)

  return metrics
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, index)).toFixed(2)

  return `${size} ${units[index]}`
}

/**
 * 保存性能历史
 */
function saveMetricsHistory(metrics: PerformanceMetrics) {
  const rootDir = process.cwd()
  const performanceDir = join(rootDir, '.performance')
  const historyFile = join(performanceDir, 'history.json')

  // 确保目录存在
  if (!existsSync(performanceDir)) {
    mkdirSync(performanceDir, { recursive: true })
  }

  // 读取现有历史
  let history: PerformanceHistory = { metrics: [] }

  if (existsSync(historyFile)) {
    try {
      history = JSON.parse(readFileSync(historyFile, 'utf-8'))
    } catch {
      console.warn('无法读取历史记录，创建新的')
    }
  }

  // 添加新指标
  history.metrics.push(metrics)

  // 只保留最近30次记录
  if (history.metrics.length > 30) {
    history.metrics = history.metrics.slice(-30)
  }

  // 保存历史
  writeFileSync(historyFile, JSON.stringify(history, null, 2))
  console.log('\n✅ 性能指标已保存')
}

/**
 * 生成性能报告
 */
function generateReport(metrics: PerformanceMetrics) {
  const rootDir = process.cwd()
  const reportPath = join(rootDir, 'PERFORMANCE_REPORT.md')

  const report = `# 性能报告

生成时间: ${new Date(metrics.timestamp).toLocaleString()}

## 📊 构建性能

- **总构建时间**: ${(metrics.buildTime.total / 1000).toFixed(2)}s

## 📦 包大小

- **总大小**: ${formatSize(metrics.bundleSize.total)}

### 各包大小
${Object.entries(metrics.bundleSize.packages)
  .filter(([_, size]) => size > 0)
  .sort(([, a], [, b]) => b - a)
  .map(([name, size]) => `- **${name}**: ${formatSize(size)}`)
  .join('\n')}

## 🧪 测试性能

- **单元测试时间**: ${(metrics.testTime.total / 1000).toFixed(2)}s

## 💾 内存使用

- **Heap Used**: ${formatSize(metrics.memory.heapUsed)}
- **Heap Total**: ${formatSize(metrics.memory.heapTotal)}

## 🎯 优化建议

${generateOptimizationSuggestions(metrics).join('\n')}
`

  writeFileSync(reportPath, report)
  console.log(`\n📄 性能报告已生成: ${reportPath}`)
}

/**
 * 生成优化建议
 */
function generateOptimizationSuggestions(
  metrics: PerformanceMetrics
): string[] {
  const suggestions: string[] = []

  // 构建时间建议
  if (metrics.buildTime.total > 60000) {
    // 超过1分钟
    suggestions.push('- ⚠️ 构建时间较长，考虑使用增量构建或并行构建')
  }

  // 包大小建议
  const largePackages = Object.entries(metrics.bundleSize.packages).filter(
    ([_, size]) => size > 500 * 1024
  ) // 超过500KB

  if (largePackages.length > 0) {
    suggestions.push(
      `- ⚠️ 以下包体积较大，需要优化: ${largePackages
        .map(([name]) => name)
        .join(', ')}`
    )
  }

  // 测试时间建议
  if (metrics.testTime.total > 30000) {
    // 超过30秒
    suggestions.push('- ⚠️ 测试时间较长，考虑并行运行测试或优化测试用例')
  }

  // 内存使用建议
  if (metrics.memory.heapUsed > 500 * 1024 * 1024) {
    // 超过500MB
    suggestions.push('- ⚠️ 内存使用较高，检查是否有内存泄漏')
  }

  if (suggestions.length === 0) {
    suggestions.push('- ✅ 性能指标良好，暂无优化建议')
  }

  return suggestions
}

/**
 * 比较性能历史
 */
function compareWithHistory(current: PerformanceMetrics) {
  const rootDir = process.cwd()
  const historyFile = join(rootDir, '.performance', 'history.json')

  if (!existsSync(historyFile)) {
    return
  }

  try {
    const history: PerformanceHistory = JSON.parse(
      readFileSync(historyFile, 'utf-8')
    )

    if (history.metrics.length < 2) {
      return
    }

    const previous = history.metrics[history.metrics.length - 2]

    console.log('\n📈 与上次对比:')

    // 构建时间对比
    const buildTimeDiff = current.buildTime.total - previous.buildTime.total
    const buildTimePercent = (
      (buildTimeDiff / previous.buildTime.total) *
      100
    ).toFixed(1)
    console.log(
      `   构建时间: ${buildTimeDiff > 0 ? '↑' : '↓'} ${Math.abs(
        buildTimeDiff / 1000
      ).toFixed(2)}s (${buildTimePercent}%)`
    )

    // 包大小对比
    const bundleSizeDiff = current.bundleSize.total - previous.bundleSize.total
    const bundleSizePercent = (
      (bundleSizeDiff / previous.bundleSize.total) *
      100
    ).toFixed(1)
    console.log(
      `   包大小: ${bundleSizeDiff > 0 ? '↑' : '↓'} ${formatSize(
        Math.abs(bundleSizeDiff)
      )} (${bundleSizePercent}%)`
    )

    // 测试时间对比
    const testTimeDiff = current.testTime.total - previous.testTime.total
    const testTimePercent = (
      (testTimeDiff / previous.testTime.total) *
      100
    ).toFixed(1)
    console.log(
      `   测试时间: ${testTimeDiff > 0 ? '↑' : '↓'} ${Math.abs(
        testTimeDiff / 1000
      ).toFixed(2)}s (${testTimePercent}%)`
    )
  } catch (error) {
    console.error('无法比较历史数据:', error)
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 LDesign 性能监控工具\n')

  try {
    // 收集指标
    const metrics = await collectMetrics()

    // 保存历史
    saveMetricsHistory(metrics)

    // 生成报告
    generateReport(metrics)

    // 与历史对比
    compareWithHistory(metrics)

    console.log('\n✨ 性能监控完成!')
  } catch (error) {
    console.error('❌ 性能监控失败:', error)
    process.exit(1)
  }
}

// 运行主函数
main().catch(console.error)
