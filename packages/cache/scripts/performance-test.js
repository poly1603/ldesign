#!/usr/bin/env node

/**
 * 性能测试脚本
 * 用于 CI/CD 环境中的自动化性能测试
 */

import { performance } from 'perf_hooks'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { createCache } from '../dist/index.js'

// 性能测试配置
const PERFORMANCE_CONFIG = {
  iterations: {
    memory: 50000,
    localStorage: 10000,
    sessionStorage: 10000,
    indexedDB: 2000
  },
  warmup: 1000,
  thresholds: {
    memory: { set: 100000, get: 200000, remove: 150000 },
    localStorage: { set: 5000, get: 10000, remove: 8000 },
    sessionStorage: { set: 5000, get: 10000, remove: 8000 },
    indexedDB: { set: 1000, get: 2000, remove: 1500 }
  }
}

// 测试结果存储
const results = {
  timestamp: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: process.memoryUsage()
  },
  tests: {}
}

/**
 * 运行性能测试
 */
async function runPerformanceTest(engine, operation, iterations) {
  const cache = createCache({
    engines: {
      [engine]: { enabled: true }
    }
  })

  // 预热
  console.log(`🔥 Warming up ${engine} ${operation}...`)
  for (let i = 0; i < PERFORMANCE_CONFIG.warmup; i++) {
    if (operation === 'set') {
      await cache.set(`warmup-${i}`, `value-${i}`)
    } else if (operation === 'get') {
      await cache.get(`warmup-${i % 100}`)
    } else if (operation === 'remove') {
      await cache.remove(`warmup-${i}`)
    }
  }

  // 准备测试数据
  if (operation === 'get' || operation === 'remove') {
    for (let i = 0; i < Math.min(iterations, 1000); i++) {
      await cache.set(`test-${i}`, `value-${i}`)
    }
  }

  // 执行性能测试
  console.log(`⚡ Testing ${engine} ${operation} (${iterations} iterations)...`)
  const startTime = performance.now()
  const startMemory = process.memoryUsage()

  for (let i = 0; i < iterations; i++) {
    try {
      if (operation === 'set') {
        await cache.set(`test-${i}`, {
          id: i,
          data: `test-data-${i}`,
          timestamp: Date.now()
        })
      } else if (operation === 'get') {
        await cache.get(`test-${i % 1000}`)
      } else if (operation === 'remove') {
        await cache.remove(`test-${i % 1000}`)
      }
    } catch (error) {
      console.error(`Error in ${engine} ${operation}:`, error.message)
    }
  }

  const endTime = performance.now()
  const endMemory = process.memoryUsage()

  const duration = endTime - startTime
  const opsPerSecond = Math.round((iterations / duration) * 1000)
  const memoryDelta = endMemory.heapUsed - startMemory.heapUsed

  return {
    duration,
    opsPerSecond,
    memoryDelta,
    iterations
  }
}

/**
 * 检查性能阈值
 */
function checkThresholds(engine, operation, opsPerSecond) {
  const threshold = PERFORMANCE_CONFIG.thresholds[engine]?.[operation]
  if (!threshold) return { passed: true, message: 'No threshold defined' }

  const passed = opsPerSecond >= threshold
  const message = passed 
    ? `✅ ${opsPerSecond} ops/sec >= ${threshold} ops/sec`
    : `❌ ${opsPerSecond} ops/sec < ${threshold} ops/sec`

  return { passed, message, threshold, actual: opsPerSecond }
}

/**
 * 比较基准性能
 */
function compareWithBaseline(currentResults) {
  const baselineFile = resolve(process.cwd(), 'performance-baseline.json')
  
  if (!existsSync(baselineFile)) {
    console.log('📊 No baseline found, creating new baseline...')
    writeFileSync(baselineFile, JSON.stringify(currentResults, null, 2))
    return { isBaseline: true }
  }

  const baseline = JSON.parse(readFileSync(baselineFile, 'utf8'))
  const comparison = {}

  for (const [engine, operations] of Object.entries(currentResults.tests)) {
    comparison[engine] = {}
    for (const [operation, result] of Object.entries(operations)) {
      const baselineResult = baseline.tests[engine]?.[operation]
      if (baselineResult) {
        const improvement = ((result.opsPerSecond - baselineResult.opsPerSecond) / baselineResult.opsPerSecond) * 100
        comparison[engine][operation] = {
          current: result.opsPerSecond,
          baseline: baselineResult.opsPerSecond,
          improvement: Math.round(improvement * 100) / 100,
          status: improvement >= -10 ? 'pass' : 'fail' // 允许10%的性能下降
        }
      }
    }
  }

  return { comparison }
}

/**
 * 生成性能报告
 */
function generateReport(results, comparison) {
  console.log('\n📊 Performance Test Results')
  console.log('=' .repeat(50))

  let allPassed = true

  for (const [engine, operations] of Object.entries(results.tests)) {
    console.log(`\n🔧 ${engine.toUpperCase()} Engine:`)
    
    for (const [operation, result] of Object.entries(operations)) {
      const threshold = checkThresholds(engine, operation, result.opsPerSecond)
      const comparisonResult = comparison?.comparison?.[engine]?.[operation]
      
      console.log(`  ${operation.padEnd(8)}: ${result.opsPerSecond.toLocaleString().padStart(8)} ops/sec`)
      console.log(`    ${threshold.message}`)
      
      if (comparisonResult) {
        const trend = comparisonResult.improvement >= 0 ? '📈' : '📉'
        console.log(`    ${trend} ${comparisonResult.improvement >= 0 ? '+' : ''}${comparisonResult.improvement}% vs baseline`)
      }
      
      if (!threshold.passed || (comparisonResult && comparisonResult.status === 'fail')) {
        allPassed = false
      }
    }
  }

  console.log(`\n${allPassed ? '✅' : '❌'} Overall: ${allPassed ? 'PASSED' : 'FAILED'}`)
  
  return allPassed
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting performance tests...\n')

  const engines = ['memory', 'localStorage', 'sessionStorage']
  const operations = ['set', 'get', 'remove']

  for (const engine of engines) {
    results.tests[engine] = {}
    
    for (const operation of operations) {
      const iterations = PERFORMANCE_CONFIG.iterations[engine]
      const result = await runPerformanceTest(engine, operation, iterations)
      results.tests[engine][operation] = result
      
      console.log(`  ✅ ${engine} ${operation}: ${result.opsPerSecond.toLocaleString()} ops/sec\n`)
    }
  }

  // 保存结果
  const resultsFile = resolve(process.cwd(), 'performance-results.json')
  writeFileSync(resultsFile, JSON.stringify(results, null, 2))

  // 比较基准
  const comparison = compareWithBaseline(results)

  // 生成报告
  const passed = generateReport(results, comparison)

  // 退出码
  process.exit(passed ? 0 : 1)
}

// 运行测试
main().catch(error => {
  console.error('❌ Performance test failed:', error)
  process.exit(1)
})
