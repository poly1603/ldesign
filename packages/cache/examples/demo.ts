/**
 * 缓存包功能演示
 * 展示所有已实现的高级功能
 */

import {
  createCache,
  createNamespace,
  withCompression,
  withPrefetching,
  PerformanceMonitor,
  RetryManager,
  CircuitBreaker,
  SyncManager,
  WarmupManager,
  EvictionStrategyFactory,
} from '../src'

async function main() {
  console.log('🚀 缓存包功能演示\n')

  // 1. 创建基础缓存实例
  const cache = createCache({
    defaultEngine: 'memory',
    engines: {
      memory: {
        enabled: true,
        maxItems: 100,
        evictionStrategy: 'LRU',
      },
      localStorage: {
        enabled: true,
      },
      indexedDB: {
        enabled: true,
        dbName: 'demo-cache',
      },
    },
  })

  // 2. 批量操作演示
  console.log('📦 批量操作演示:')
  const batchData = {
    user1: { name: 'Alice', age: 25 },
    user2: { name: 'Bob', age: 30 },
    user3: { name: 'Charlie', age: 35 },
  }
  
  const setResults = await cache.mset(batchData)
  console.log(`批量设置: ${setResults.success.length} 成功, ${setResults.failed.length} 失败`)
  
  const users = await cache.mget(['user1', 'user2', 'user3'])
  console.log('批量获取:', users)
  
  const hasResults = await cache.mhas(['user1', 'user4'])
  console.log('批量检查:', hasResults)
  console.log()

  // 3. 命名空间演示
  console.log('🗂️ 命名空间演示:')
  const cacheManager = createCache()
  const appNs = createNamespace('app', cacheManager)
  const userNs = appNs.namespace('users')
  const settingsNs = appNs.namespace('settings')
  
  await userNs.set('current', { id: 1, name: 'Admin' })
  await settingsNs.set('theme', 'dark')
  
  console.log('用户命名空间:', await userNs.get('current'))
  console.log('设置命名空间:', await settingsNs.get('theme'))
  
  // 导出命名空间数据
  const exported = await userNs.export()
  console.log('导出的数据:', exported)
  console.log()

  // 4. 数据压缩演示
  console.log('🗜️ 数据压缩演示:')
  const compressedCache = withCompression(cache, {
    algorithm: 'gzip',
    minSize: 100,
  })
  
  const largeData = {
    content: 'x'.repeat(1000),
    items: Array(100).fill({ data: 'test' }),
  }
  
  await compressedCache.set('large-data', largeData)
  const retrieved = await compressedCache.get('large-data')
  console.log('压缩存储成功，数据完整性:', JSON.stringify(retrieved) === JSON.stringify(largeData))
  console.log()

  // 5. 智能预取演示
  console.log('🚀 智能预取演示:')
  const smartCache = withPrefetching(cache, {
    enablePredictive: true,
    minConfidence: 0.6,
  })
  
  // 添加预取规则
  smartCache.prefetcher.addRule({
    id: 'related-data',
    trigger: (ctx) => ctx.currentKey?.startsWith('product') ?? false,
    keys: ['reviews', 'recommendations'],
    fetcher: async (key) => {
      console.log(`预取 ${key}...`)
      return { prefetched: key }
    },
  })
  
  // 触发预取
  await smartCache.get('product:123')
  
  // 手动预取
  await smartCache.prefetcher.prefetch(
    ['data1', 'data2'],
    async (key) => ({ key, timestamp: Date.now() })
  )
  
  const stats = smartCache.prefetcher.getStats()
  console.log('预取统计:', stats)
  console.log()

  // 6. 性能监控演示
  console.log('📊 性能监控演示:')
  const monitor = new PerformanceMonitor({
    enabled: true,
    slowThreshold: 50,
  })
  
  await monitor.measure('cache.set', async () => {
    await cache.set('perf-test', 'value')
  })
  
  await monitor.measure('cache.get', async () => {
    await cache.get('perf-test')
  })
  
  console.log('性能报告:')
  console.log(monitor.generateReport())
  console.log()

  // 7. 错误处理与重试演示
  console.log('🔄 错误处理演示:')
  const retry = new RetryManager()
  let attempts = 0
  
  try {
    const result = await retry.retry(
      async () => {
        attempts++
        if (attempts < 3) {
          throw new Error(`尝试 ${attempts} 失败`)
        }
        return '成功!'
      },
      {
        maxAttempts: 5,
        strategy: 'exponential',
        onRetry: (error, attempt) => {
          console.log(`重试 ${attempt}: ${error.message}`)
        },
      }
    )
    console.log('重试结果:', result)
  } catch (error) {
    console.error('重试失败:', error)
  }
  console.log()

  // 8. 熔断器演示
  console.log('⚡ 熔断器演示:')
  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 5000,
  })
  
  // 模拟失败
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(async () => {
        throw new Error('服务不可用')
      })
    } catch (error) {
      console.log(`请求 ${i + 1} 失败`)
    }
  }
  
  console.log('熔断器状态:', breaker.getState())
  console.log()

  // 9. 跨标签页同步演示
  console.log('🔄 跨标签页同步演示:')
  const syncManager = new SyncManager(cache, {
    enabled: true,
    channel: 'demo-cache-sync',
  })
  
  syncManager.on('sync', (message) => {
    console.log('收到同步消息:', message)
  })
  
  await cache.set('sync-test', 'synchronized value')
  console.log('数据已同步到其他标签页')
  console.log()

  // 10. 缓存预热演示
  console.log('🔥 缓存预热演示:')
  const warmup = new WarmupManager(cacheManager)

  // 注册预热项
  warmup.register([
    {
      key: 'config',
      fetcher: async () => ({ version: '1.0.0', features: ['cache', 'sync'] }),
    },
    {
      key: 'translations',
      fetcher: async () => ({ en: 'Hello', zh: '你好' }),
    },
  ])

  // 执行预热
  await warmup.warmup()

  console.log('预热完成，配置:', await cache.get('config'))
  console.log()

  // 11. 淘汰策略演示
  console.log('🌪️ 淘汰策略演示:')
  const strategies = ['LRU', 'LFU', 'FIFO', 'Random', 'TTL']

  strategies.forEach(name => {
    const strategy = EvictionStrategyFactory.create(name as any)
    console.log(`${name} 策略:`, strategy.name)
  })
  console.log()

  // 12. 缓存统计
  console.log('📈 缓存统计:')
  const cacheStats = await cache.getStats()
  console.log('总体统计:', {
    总项数: cacheStats.totalItems,
    总大小: `${(cacheStats.totalSize / 1024).toFixed(2)} KB`,
    命中率: `${(cacheStats.hitRate * 100).toFixed(1)}%`,
  })
  
  // 清理
  await cache.clear()
  console.log('\n✅ 演示完成!')
}

// 运行演示
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.addEventListener('DOMContentLoaded', main)
} else {
  // Node.js 环境
  main().catch(console.error)
}

export { main }
