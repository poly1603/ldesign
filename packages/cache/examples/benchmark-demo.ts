/**
 * 性能基准测试演示
 * 
 * 展示如何使用性能测试工具和优化效果
 */

import { createCacheManager } from '../src'
import { createBenchmark, runStandardBenchmarks } from '../src/benchmark/performance-benchmark'

async function main(): Promise<void> {
  console.log('='.repeat(100))
  console.log('缓存性能基准测试演示')
  console.log('='.repeat(100))
  console.log()

  // 创建 Memory 引擎缓存管理器
  const memoryCache = createCacheManager({
    storage: 'memory',
    namespace: 'perf-test',
    memory: {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxItems: 10000,
      evictionStrategy: 'LRU',
    },
  })

  console.log('运行标准基准测试套件...\n')
  await runStandardBenchmarks(memoryCache)

  console.log('\n')
  console.log('='.repeat(100))
  console.log('自定义性能测试')
  console.log('='.repeat(100))
  console.log()

  // 创建自定义基准测试
  const benchmark = createBenchmark(memoryCache)

  // 测试1: 批量操作性能
  console.log('测试批量操作性能...')
  await benchmark.run(
    async (cache, index) => {
      const items = Array.from({ length: 50 }, (_, i) => ({
        key: `batch-${index}-${i}`,
        value: `value-${i}`,
      }))
      await cache.mset(items)
    },
    {
      name: '批量设置 (50项)',
      operations: 200,
      measureMemory: true,
    },
  )

  await benchmark.run(
    async (cache, index) => {
      const keys = Array.from({ length: 50 }, (_, i) => `batch-${index}-${i}`)
      await cache.mget(keys)
    },
    {
      name: '批量获取 (50项)',
      operations: 200,
    },
  )

  // 测试2: 不同数据大小的性能
  console.log('\n测试不同数据大小的性能...')
  
  const dataSizes = [
    { name: '小数据 (100B)', size: 100 },
    { name: '中等数据 (1KB)', size: 1024 },
    { name: '大数据 (10KB)', size: 10 * 1024 },
    { name: '超大数据 (100KB)', size: 100 * 1024 },
  ]

  for (const { name, size } of dataSizes) {
    await benchmark.run(
      async (cache, index) => {
        const data = 'x'.repeat(size)
        await cache.set(`key-${index}`, data)
      },
      {
        name: `Set - ${name}`,
        operations: size > 10000 ? 100 : 1000,
      },
    )
  }

  // 测试3: 高并发场景
  console.log('\n测试高并发操作性能...')
  await benchmark.run(
    async (cache, index) => {
      // 同时执行多个操作
      await Promise.all([
        cache.set(`concurrent-${index}-1`, 'value1'),
        cache.set(`concurrent-${index}-2`, 'value2'),
        cache.set(`concurrent-${index}-3`, 'value3'),
        cache.get(`concurrent-${index - 1}-1`),
        cache.get(`concurrent-${index - 1}-2`),
      ])
    },
    {
      name: '并发操作 (5个操作)',
      operations: 500,
    },
  )

  // 测试4: TTL 过期检查性能
  console.log('\n测试 TTL 过期检查性能...')
  
  // 预设一些数据（部分过期）
  for (let i = 0; i < 500; i++) {
    await memoryCache.set(`ttl-${i}`, `value-${i}`, {
      ttl: i % 2 === 0 ? 100 : 60000, // 一半快速过期
    })
  }

  // 等待部分数据过期
  await new Promise(resolve => setTimeout(resolve, 200))

  await benchmark.run(
    async (cache, index) => {
      await cache.get(`ttl-${index % 500}`)
    },
    {
      name: 'Get (混合过期/有效数据)',
      operations: 1000,
    },
  )

  // 生成并显示完整报告
  console.log('\n')
  console.log(benchmark.generateReport())

  // 性能对比分析
  const results = benchmark.getResults()
  if (results.length >= 2) {
    console.log('\n')
    console.log('='.repeat(100))
    console.log('性能对比分析')
    console.log('='.repeat(100))
    console.log()

    // 对比批量操作
    const batchSet = results.find(r => r.name.includes('批量设置'))
    const batchGet = results.find(r => r.name.includes('批量获取'))

    if (batchSet && batchGet) {
      console.log('批量操作效率:')
      console.log(`  批量设置: ${batchSet.opsPerSecond.toFixed(0)} ops/sec`)
      console.log(`  批量获取: ${batchGet.opsPerSecond.toFixed(0)} ops/sec`)
      console.log(`  获取/设置比率: ${(batchGet.opsPerSecond / batchSet.opsPerSecond).toFixed(2)}x`)
      console.log()
    }

    // 数据大小性能趋势
    const setSizeResults = results.filter(r => r.name.startsWith('Set - '))
    if (setSizeResults.length > 0) {
      console.log('数据大小性能趋势:')
      setSizeResults.forEach((result) => {
        console.log(`  ${result.name}: ${result.opsPerSecond.toFixed(0)} ops/sec (${result.avgLatency.toFixed(3)} ms 延迟)`)
      })
      console.log()
    }
  }

  // 显示缓存统计
  console.log('='.repeat(100))
  console.log('缓存统计信息')
  console.log('='.repeat(100))
  console.log()

  const stats = await memoryCache.getStats()
  console.log('引擎统计:')
  console.log(`  总项数: ${stats.items}`)
  console.log(`  内存使用: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
  console.log(`  命中率: ${(stats.hitRate * 100).toFixed(2)}%`)
  console.log(`  总命中: ${stats.hits}`)
  console.log(`  总未命中: ${stats.misses}`)
  console.log()

  // 清理
  await memoryCache.clear()
  console.log('测试完成，缓存已清理。')
}

// 运行演示
if (require.main === module) {
  main().catch((error) => {
    console.error('测试失败:', error)
    process.exit(1)
  })
}

export { main as runBenchmarkDemo }
