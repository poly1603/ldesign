/**
 * 性能基准测试脚本
 * 比较 Rollup 和 Rolldown 的构建性能
 */

import fs from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'

function formatTime(ms) {
  if (ms < 1000) return `${ms.toFixed(2)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function runBenchmark() {
  console.log('🚀 性能基准测试开始\n')

  const results = {
    rollup: {},
    rolldown: {}
  }

  // 测试 Rollup
  console.log('📦 测试 Rollup 性能...')
  results.rollup = await benchmarkBundler('rollup', 'rollup.simple.config.js')

  console.log('\n📦 测试 Rolldown 性能...')
  results.rolldown = await benchmarkBundler('rolldown', 'rolldown.simple.config.js')

  // 生成报告
  console.log('\n📊 性能对比报告')
  console.log('=' .repeat(60))
  
  console.log('\n🏗️  构建时间对比:')
  console.log(`- Rollup:   ${formatTime(results.rollup.buildTime)}`)
  console.log(`- Rolldown: ${formatTime(results.rolldown.buildTime)}`)
  
  const timeDiff = results.rolldown.buildTime - results.rollup.buildTime
  const timePercent = ((timeDiff / results.rollup.buildTime) * 100).toFixed(1)
  
  if (timeDiff < 0) {
    console.log(`🎉 Rolldown 快 ${formatTime(Math.abs(timeDiff))} (${Math.abs(timePercent)}%)`)
  } else {
    console.log(`📝 Rollup 快 ${formatTime(timeDiff)} (${timePercent}%)`)
  }

  console.log('\n📁 输出大小对比:')
  console.log(`- Rollup:   ${formatBytes(results.rollup.totalSize)}`)
  console.log(`- Rolldown: ${formatBytes(results.rolldown.totalSize)}`)
  
  const sizeDiff = results.rolldown.totalSize - results.rollup.totalSize
  const sizePercent = ((sizeDiff / results.rollup.totalSize) * 100).toFixed(1)
  
  if (sizeDiff < 0) {
    console.log(`🎉 Rolldown 小 ${formatBytes(Math.abs(sizeDiff))} (${Math.abs(sizePercent)}%)`)
  } else {
    console.log(`📝 Rollup 小 ${formatBytes(sizeDiff)} (${sizePercent}%)`)
  }

  console.log('\n🔧 详细文件对比:')
  console.log('| 文件 | Rollup | Rolldown | 差异 |')
  console.log('|------|--------|----------|------|')
  
  const files = ['index.js', 'index.cjs']
  for (const file of files) {
    const rollupSize = results.rollup.files[file] || 0
    const rolldownSize = results.rolldown.files[file] || 0
    
    let diff = 'N/A'
    if (rollupSize && rolldownSize) {
      const diffBytes = rolldownSize - rollupSize
      const diffPercent = ((diffBytes / rollupSize) * 100).toFixed(1)
      diff = `${diffBytes > 0 ? '+' : ''}${formatBytes(Math.abs(diffBytes))} (${diffPercent}%)`
    }
    
    console.log(`| ${file} | ${formatBytes(rollupSize)} | ${formatBytes(rolldownSize)} | ${diff} |`)
  }

  console.log('\n🏆 总结:')
  
  let rollupScore = 0
  let rolldownScore = 0
  
  // 构建时间评分
  if (results.rolldown.buildTime < results.rollup.buildTime) {
    rolldownScore += 1
    console.log('- 构建速度: Rolldown 获胜 🥇')
  } else {
    rollupScore += 1
    console.log('- 构建速度: Rollup 获胜 🥇')
  }
  
  // 输出大小评分
  if (results.rolldown.totalSize < results.rollup.totalSize) {
    rolldownScore += 1
    console.log('- 输出大小: Rolldown 获胜 🥇')
  } else {
    rollupScore += 1
    console.log('- 输出大小: Rollup 获胜 🥇')
  }
  
  console.log(`\n🎯 最终得分: Rollup ${rollupScore} - ${rolldownScore} Rolldown`)
  
  if (rolldownScore > rollupScore) {
    console.log('🎉 Rolldown 总体表现更好！')
  } else if (rollupScore > rolldownScore) {
    console.log('🎉 Rollup 总体表现更好！')
  } else {
    console.log('🤝 两者表现相当！')
  }

  // 保存结果到文件
  const reportPath = 'performance-report.json'
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    summary: {
      rollupScore,
      rolldownScore,
      buildTimeDiff: timeDiff,
      sizeDiff: sizeDiff
    }
  }, null, 2))
  
  console.log(`\n📄 详细报告已保存到: ${reportPath}`)
}

async function benchmarkBundler(bundlerName, configFile) {
  const { execSync } = await import('child_process')
  
  // 清理输出目录
  try {
    execSync(`pnpm run clean:${bundlerName}`, { stdio: 'pipe' })
  } catch (error) {
    // 忽略清理错误
  }

  // 多次运行取平均值
  const runs = 3
  const times = []
  
  console.log(`  运行 ${runs} 次测试...`)
  
  for (let i = 0; i < runs; i++) {
    // 清理
    try {
      execSync(`pnpm run clean:${bundlerName}`, { stdio: 'pipe' })
    } catch (error) {
      // 忽略清理错误
    }
    
    // 计时构建
    const startTime = performance.now()
    
    try {
      if (bundlerName === 'rollup') {
        execSync(`pnpm exec rollup -c ${configFile}`, { stdio: 'pipe' })
      } else {
        execSync(`pnpm exec rolldown -c ${configFile}`, { stdio: 'pipe' })
      }
    } catch (error) {
      console.error(`  ❌ 第 ${i + 1} 次构建失败:`, error.message)
      continue
    }
    
    const endTime = performance.now()
    times.push(endTime - startTime)
    
    console.log(`  ✅ 第 ${i + 1} 次: ${formatTime(endTime - startTime)}`)
  }
  
  if (times.length === 0) {
    throw new Error(`${bundlerName} 所有构建都失败了`)
  }
  
  // 计算平均时间
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length
  
  // 获取文件大小
  const files = {}
  let totalSize = 0
  
  const outputFiles = ['index.js', 'index.cjs']
  for (const file of outputFiles) {
    const filePath = path.join('dist', file)
    if (fs.existsSync(filePath)) {
      const size = fs.statSync(filePath).size
      files[file] = size
      totalSize += size
    }
  }
  
  return {
    buildTime: avgTime,
    files,
    totalSize,
    runs: times.length,
    allTimes: times
  }
}

runBenchmark().catch(console.error)
