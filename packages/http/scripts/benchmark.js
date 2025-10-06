/**
 * 性能基准测试脚本
 * 用于验证优化效果
 */

import { InterceptorManagerImpl } from '../es/interceptors/manager.js'
import { DeduplicationKeyGenerator } from '../es/utils/concurrency.js'
import { MemoryCacheStorage } from '../es/utils/cache.js'
import { RequestMonitor } from '../es/utils/monitor.js'

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function benchmark(name, fn, iterations = 1000) {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const end = performance.now()
  const duration = end - start
  const avgTime = duration / iterations

  log('cyan', `\n📊 ${name}`)
  log('blue', `  总耗时: ${duration.toFixed(2)}ms`)
  log('blue', `  迭代次数: ${iterations}`)
  log('green', `  平均耗时: ${avgTime.toFixed(4)}ms`)

  return { duration, avgTime }
}

async function benchmarkAsync(name, fn, iterations = 1000) {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    await fn()
  }
  const end = performance.now()
  const duration = end - start
  const avgTime = duration / iterations

  log('cyan', `\n📊 ${name}`)
  log('blue', `  总耗时: ${duration.toFixed(2)}ms`)
  log('blue', `  迭代次数: ${iterations}`)
  log('green', `  平均耗时: ${avgTime.toFixed(4)}ms`)

  return { duration, avgTime }
}

// 测试拦截器管理器
function testInterceptorManager() {
  log('yellow', '\n=== 拦截器管理器性能测试 ===')

  // 测试添加
  benchmark('添加1000个拦截器', () => {
    const manager = new InterceptorManagerImpl()
    for (let i = 0; i < 1000; i++) {
      manager.use(() => {})
    }
  }, 10)

  // 测试遍历
  const manager = new InterceptorManagerImpl()
  for (let i = 0; i < 100; i++) {
    manager.use(() => {})
  }

  benchmark('遍历100个拦截器', () => {
    let count = 0
    manager.forEach(() => {
      count++
    })
  }, 10000)

  // 测试删除
  const manager2 = new InterceptorManagerImpl()
  const ids = []
  for (let i = 0; i < 1000; i++) {
    ids.push(manager2.use(() => {}))
  }

  benchmark('删除500个拦截器', () => {
    const m = new InterceptorManagerImpl()
    const ids = []
    for (let i = 0; i < 1000; i++) {
      ids.push(m.use(() => {}))
    }
    for (let i = 0; i < 500; i++) {
      m.eject(ids[i])
    }
  }, 10)
}

// 测试缓存键生成器
function testKeyGenerator() {
  log('yellow', '\n=== 缓存键生成器性能测试 ===')

  const generator = new DeduplicationKeyGenerator()
  const config = {
    method: 'GET',
    url: '/api/users',
    params: { page: 1, size: 10 },
  }

  // 测试首次生成
  benchmark('生成缓存键（无缓存）', () => {
    const gen = new DeduplicationKeyGenerator()
    gen.generate(config)
  }, 10000)

  // 测试缓存命中
  benchmark('生成缓存键（有缓存）', () => {
    generator.generate(config)
  }, 10000)
}

// 测试内存缓存
async function testMemoryCache() {
  log('yellow', '\n=== 内存缓存性能测试 ===')

  const storage = new MemoryCacheStorage()

  // 测试写入
  await benchmarkAsync('写入1000个缓存项', async () => {
    await storage.set(`key${Math.random()}`, { data: 'value' })
  }, 1000)

  // 测试读取
  for (let i = 0; i < 100; i++) {
    await storage.set(`key${i}`, { data: `value${i}` })
  }

  await benchmarkAsync('读取缓存项', async () => {
    await storage.get('key50')
  }, 10000)

  storage.destroy()
}

// 测试监控系统
function testMonitor() {
  log('yellow', '\n=== 监控系统性能测试 ===')

  const monitor = new RequestMonitor({
    enabled: true,
    maxMetrics: 1000,
  })

  // 测试记录指标
  benchmark('记录1000个请求指标', () => {
    const requestId = `req${Math.random()}`
    monitor.startRequest(requestId, { url: '/api/test', method: 'GET' })
    monitor.endRequest(requestId, { url: '/api/test', method: 'GET' }, {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
    })
  }, 1000)

  // 测试统计查询（无缓存）
  monitor.clear()
  for (let i = 0; i < 100; i++) {
    const requestId = `req${i}`
    monitor.startRequest(requestId, { url: '/api/test', method: 'GET' })
    monitor.endRequest(requestId, { url: '/api/test', method: 'GET' }, {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
    })
  }

  const result1 = benchmark('获取统计信息（无缓存）', () => {
    monitor.getStats()
  }, 1)

  // 测试统计查询（有缓存）
  const result2 = benchmark('获取统计信息（有缓存）', () => {
    monitor.getStats()
  }, 1000)

  log('green', `\n✨ 缓存提升: ${((result1.avgTime - result2.avgTime) / result1.avgTime * 100).toFixed(2)}%`)
}

// 内存占用测试
function testMemoryUsage() {
  log('yellow', '\n=== 内存占用测试 ===')

  const before = process.memoryUsage()

  // 创建大量拦截器
  const managers = []
  for (let i = 0; i < 100; i++) {
    const manager = new InterceptorManagerImpl()
    for (let j = 0; j < 100; j++) {
      manager.use(() => {})
    }
    managers.push(manager)
  }

  const after = process.memoryUsage()

  const heapUsed = (after.heapUsed - before.heapUsed) / 1024 / 1024

  log('cyan', '\n📊 内存占用')
  log('blue', `  堆内存增加: ${heapUsed.toFixed(2)} MB`)
  log('blue', `  拦截器数量: 10000`)
  log('green', `  平均每个: ${(heapUsed * 1024 / 10000).toFixed(2)} KB`)
}

// 运行所有测试
async function runAll() {
  log('green', '\n🚀 开始性能基准测试...\n')

  testInterceptorManager()
  testKeyGenerator()
  await testMemoryCache()
  testMonitor()
  testMemoryUsage()

  log('green', '\n✅ 所有测试完成！\n')
}

runAll().catch(console.error)

