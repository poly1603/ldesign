#!/usr/bin/env node

/**
 * 基准测试脚本
 * 用于详细的性能基准测试和分析
 */

import { performance } from 'perf_hooks'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { createCache } from '../dist/index.js'

// 基准测试配置
const BENCHMARK_CONFIG = {
  suites: [
    {
      name: 'Basic Operations',
      tests: [
        { name: 'Memory Set', engine: 'memory', operation: 'set', iterations: 100000 },
        { name: 'Memory Get', engine: 'memory', operation: 'get', iterations: 200000 },
        { name: 'LocalStorage Set', engine: 'localStorage', operation: 'set', iterations: 10000 },
        { name: 'LocalStorage Get', engine: 'localStorage', operation: 'get', iterations: 20000 },
        { name: 'SessionStorage Set', engine: 'sessionStorage', operation: 'set', iterations: 10000 },
        { name: 'SessionStorage Get', engine: 'sessionStorage', operation: 'get', iterations: 20000 }
      ]
    },
    {
      name: 'Data Size Impact',
      tests: [
        { name: 'Small Data (100B)', size: 'small', iterations: 50000 },
        { name: 'Medium Data (10KB)', size: 'medium', iterations: 10000 },
        { name: 'Large Data (100KB)', size: 'large', iterations: 1000 }
      ]
    },
    {
      name: 'Concurrent Operations',
      tests: [
        { name: 'Concurrent Set (10)', concurrency: 10, iterations: 5000 },
        { name: 'Concurrent Get (10)', concurrency: 10, iterations: 10000 },
        { name: 'Mixed Operations', mixed: true, iterations: 5000 }
      ]
    }
  ]
}

// 测试数据生成器
const dataGenerators = {
  small: () => ({ id: Math.random(), data: 'x'.repeat(100) }),
  medium: () => ({ 
    id: Math.random(), 
    data: 'x'.repeat(10000),
    metadata: { created: Date.now(), version: '1.0' }
  }),
  large: () => ({
    id: Math.random(),
    data: 'x'.repeat(100000),
    metadata: { created: Date.now(), version: '1.0' },
    items: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item-${i}` }))
  })
}

/**
 * 运行单个基准测试
 */
async function runBenchmark(test) {
  console.log(`🔄 Running: ${test.name}`)
  
  const cache = createCache({
    engines: {
      memory: { enabled: true },
      localStorage: { enabled: true },
      sessionStorage: { enabled: true }
    }
  })

  const results = {
    name: test.name,
    iterations: test.iterations,
    startTime: Date.now(),
    memoryBefore: process.memoryUsage()
  }

  // 预热
  for (let i = 0; i < Math.min(1000, test.iterations / 10); i++) {
    await performOperation(cache, test, i)
  }

  // 执行基准测试
  const startTime = performance.now()
  
  if (test.concurrency) {
    // 并发测试
    const promises = []
    for (let i = 0; i < test.concurrency; i++) {
      promises.push(runConcurrentOperations(cache, test, i))
    }
    await Promise.all(promises)
  } else {
    // 顺序测试
    for (let i = 0; i < test.iterations; i++) {
      await performOperation(cache, test, i)
    }
  }

  const endTime = performance.now()
  
  results.endTime = Date.now()
  results.duration = endTime - startTime
  results.opsPerSecond = Math.round((test.iterations / results.duration) * 1000)
  results.memoryAfter = process.memoryUsage()
  results.memoryDelta = results.memoryAfter.heapUsed - results.memoryBefore.heapUsed

  console.log(`  ✅ ${results.opsPerSecond.toLocaleString()} ops/sec`)
  
  return results
}

/**
 * 执行单个操作
 */
async function performOperation(cache, test, index) {
  const key = `test-${index}`
  
  if (test.mixed) {
    // 混合操作
    const operations = ['set', 'get', 'has', 'remove']
    const operation = operations[index % operations.length]
    
    switch (operation) {
      case 'set':
        await cache.set(key, dataGenerators.small())
        break
      case 'get':
        await cache.get(key)
        break
      case 'has':
        await cache.has(key)
        break
      case 'remove':
        await cache.remove(key)
        break
    }
  } else if (test.size) {
    // 数据大小测试
    const data = dataGenerators[test.size]()
    await cache.set(key, data)
    await cache.get(key)
  } else if (test.operation) {
    // 特定操作测试
    switch (test.operation) {
      case 'set':
        await cache.set(key, { id: index, data: `value-${index}` }, { 
          engine: test.engine 
        })
        break
      case 'get':
        await cache.get(key)
        break
      case 'remove':
        await cache.remove(key)
        break
    }
  }
}

/**
 * 运行并发操作
 */
async function runConcurrentOperations(cache, test, workerIndex) {
  const operationsPerWorker = Math.floor(test.iterations / test.concurrency)
  
  for (let i = 0; i < operationsPerWorker; i++) {
    const index = workerIndex * operationsPerWorker + i
    await performOperation(cache, test, index)
  }
}

/**
 * 生成性能报告
 */
function generateBenchmarkReport(results) {
  console.log('\n📊 Benchmark Results')
  console.log('=' .repeat(80))

  for (const suite of results.suites) {
    console.log(`\n🔧 ${suite.name}:`)
    console.log('-'.repeat(60))
    
    for (const result of suite.results) {
      const memoryMB = (result.memoryDelta / 1024 / 1024).toFixed(2)
      console.log(`  ${result.name.padEnd(30)}: ${result.opsPerSecond.toLocaleString().padStart(10)} ops/sec  (${memoryMB}MB)`)
    }
  }

  // 性能总结
  console.log('\n📈 Performance Summary:')
  console.log('-'.repeat(60))
  
  const allResults = results.suites.flatMap(suite => suite.results)
  const fastest = allResults.reduce((max, result) => 
    result.opsPerSecond > max.opsPerSecond ? result : max
  )
  const slowest = allResults.reduce((min, result) => 
    result.opsPerSecond < min.opsPerSecond ? result : min
  )
  
  console.log(`  Fastest: ${fastest.name} (${fastest.opsPerSecond.toLocaleString()} ops/sec)`)
  console.log(`  Slowest: ${slowest.name} (${slowest.opsPerSecond.toLocaleString()} ops/sec)`)
  console.log(`  Ratio: ${Math.round(fastest.opsPerSecond / slowest.opsPerSecond)}:1`)
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Starting benchmark tests...\n')

  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage()
    },
    suites: []
  }

  for (const suite of BENCHMARK_CONFIG.suites) {
    console.log(`\n📋 Running suite: ${suite.name}`)
    
    const suiteResults = {
      name: suite.name,
      results: []
    }

    for (const test of suite.tests) {
      const result = await runBenchmark(test)
      suiteResults.results.push(result)
    }

    results.suites.push(suiteResults)
  }

  // 保存结果
  const resultsFile = resolve(process.cwd(), 'benchmark-results.json')
  writeFileSync(resultsFile, JSON.stringify(results, null, 2))

  // 生成报告
  generateBenchmarkReport(results)

  console.log(`\n💾 Results saved to: ${resultsFile}`)
  console.log('✅ Benchmark completed successfully!')
}

// 运行基准测试
main().catch(error => {
  console.error('❌ Benchmark failed:', error)
  process.exit(1)
})
