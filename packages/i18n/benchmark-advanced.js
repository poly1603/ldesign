/**
 * Advanced i18n Performance Benchmarks
 * 详细的性能测试套件
 */

import { createI18n, OptimizedI18n } from './es/index.js'

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset)
}

// 生成测试数据
function generateMessages(count = 1000) {
  const messages = {}
  for (let i = 0; i < count; i++) {
    messages[`key${i}`] = `Translation ${i}: {{name}}`
    messages[`nested.key${i}`] = `Nested translation ${i}`
    messages[`plural.item${i}`] = {
      one: 'One item {{count}}',
      other: '{{count}} items'
    }
  }
  return messages
}

// 性能测试工具
class Benchmark {
  constructor(name) {
    this.name = name
    this.results = []
  }

  async run(fn, iterations = 10000) {
    // Warm up
    for (let i = 0; i < 100; i++) {
      await fn()
    }

    // 强制 GC（如果可用）
    if (global.gc) {
      global.gc()
    }

    const start = performance.now()
    for (let i = 0; i < iterations; i++) {
      await fn()
    }
    const end = performance.now()

    const duration = end - start
    const opsPerSec = (iterations / duration) * 1000

    this.results.push({
      name: this.name,
      duration,
      iterations,
      opsPerSec,
      avgTime: duration / iterations
    })

    return { duration, opsPerSec }
  }

  print() {
    const result = this.results[this.results.length - 1]
    log(
      colors.cyan,
      `  ${result.name}:`,
      `${result.opsPerSec.toFixed(0)} ops/sec`,
      `(${result.avgTime.toFixed(3)}ms avg)`
    )
  }
}

// 内存使用监控
function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    return {
      heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(2),
      external: (usage.external / 1024 / 1024).toFixed(2),
      rss: (usage.rss / 1024 / 1024).toFixed(2)
    }
  }
  return null
}

async function runBenchmarks() {
  log(colors.bright + colors.blue, '\n🚀 i18n 高级性能基准测试\n')

  const messages = generateMessages(1000)
  const i18n = createI18n({
    locale: 'zh-CN',
    fallbackLocale: 'en-US',
    messages: {
      'zh-CN': messages,
      'en-US': messages
    }
  })

  await i18n.init()

  log(colors.yellow, '📊 测试配置:')
  log(colors.reset, `  - 翻译键数量: 1000`)
  log(colors.reset, `  - 每个测试迭代: 10000 次`)
  log(colors.reset, `  - Node 版本: ${process.version}\n`)

  const initialMemory = getMemoryUsage()
  if (initialMemory) {
    log(colors.yellow, '💾 初始内存:')
    log(colors.reset, `  - Heap Used: ${initialMemory.heapUsed} MB`)
    log(colors.reset, `  - Heap Total: ${initialMemory.heapTotal} MB\n`)
  }

  // 测试 1: 简单翻译
  log(colors.green, '1️⃣  简单翻译性能')
  const bench1 = new Benchmark('简单键翻译')
  await bench1.run(() => i18n.t('key500'))
  bench1.print()

  // 测试 2: 嵌套键翻译
  log(colors.green, '\n2️⃣  嵌套键翻译性能')
  const bench2 = new Benchmark('嵌套键翻译')
  await bench2.run(() => i18n.t('nested.key500'))
  bench2.print()

  // 测试 3: 带参数翻译
  log(colors.green, '\n3️⃣  参数插值性能')
  const bench3 = new Benchmark('参数插值')
  await bench3.run(() => i18n.t('key500', { name: 'Test' }))
  bench3.print()

  // 测试 4: 复数翻译
  log(colors.green, '\n4️⃣  复数翻译性能')
  const bench4 = new Benchmark('复数翻译')
  await bench4.run(() => i18n.plural('plural.item500', 5))
  bench4.print()

  // 测试 5: 缓存命中
  log(colors.green, '\n5️⃣  缓存命中性能')
  // 预热缓存
  for (let i = 0; i < 100; i++) {
    i18n.t('key100')
  }
  const bench5 = new Benchmark('缓存命中')
  await bench5.run(() => i18n.t('key100'))
  bench5.print()

  // 测试 6: 批量翻译
  log(colors.green, '\n6️⃣  批量翻译性能')
  const keys = Array.from({ length: 10 }, (_, i) => `key${i}`)
  const bench6 = new Benchmark('批量翻译 (10 keys)')
  await bench6.run(() => i18n.translateBatch(keys), 1000)
  bench6.print()

  // 测试 7: 语言切换
  log(colors.green, '\n7️⃣  语言切换性能')
  const bench7 = new Benchmark('语言切换')
  await bench7.run(async () => {
    await i18n.setLocale('en-US')
    await i18n.setLocale('zh-CN')
  }, 100)
  bench7.print()

  // 测试 8: 数字格式化
  log(colors.green, '\n8️⃣  数字格式化性能')
  const bench8 = new Benchmark('数字格式化')
  await bench8.run(() => i18n.number(12345.67))
  bench8.print()

  // 测试 9: 日期格式化
  log(colors.green, '\n9️⃣  日期格式化性能')
  const bench9 = new Benchmark('日期格式化')
  const now = new Date()
  await bench9.run(() => i18n.date(now))
  bench9.print()

  // 测试 10: 货币格式化
  log(colors.green, '\n🔟 货币格式化性能')
  const bench10 = new Benchmark('货币格式化')
  await bench10.run(() => i18n.currency(9999.99, 'CNY'))
  bench10.print()

  // 内存泄漏测试
  log(colors.green, '\n🔍 内存泄漏检测')
  const memoryBefore = getMemoryUsage()
  
  for (let i = 0; i < 10000; i++) {
    i18n.t(`key${i % 1000}`, { name: `test${i}` })
  }
  
  if (global.gc) {
    global.gc()
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  const memoryAfter = getMemoryUsage()
  
  if (memoryBefore && memoryAfter) {
    const heapDiff = (memoryAfter.heapUsed - memoryBefore.heapUsed).toFixed(2)
    log(colors.reset, `  - 堆增长: ${heapDiff} MB (10000 次翻译后)`)
    
    if (Math.abs(heapDiff) < 5) {
      log(colors.green, '  ✅ 无明显内存泄漏')
    } else {
      log(colors.yellow, '  ⚠️  堆增长较大，可能存在内存问题')
    }
  }

  // 缓存效率统计
  log(colors.green, '\n📈 缓存统计')
  if (i18n.cache && typeof i18n.cache.getStats === 'function') {
    const stats = i18n.cache.getStats()
    log(colors.reset, `  - 缓存大小: ${stats.size}/${stats.maxSize}`)
    log(colors.reset, `  - 命中率: ${(stats.hitRate * 100).toFixed(2)}%`)
    log(colors.reset, `  - 未命中率: ${(stats.missRate * 100).toFixed(2)}%`)
  }

  log(colors.green, '\n✨ 测试完成!\n')
}

// 运行测试
runBenchmarks().catch(console.error)

