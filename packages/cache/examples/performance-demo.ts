/**
 * @ldesign/cache 性能优化示例
 * 
 * 本示例展示了如何使用缓存库的各种性能优化功能
 */

import { createCache } from '@ldesign/cache'

// 创建高性能缓存实例
const cache = createCache({
  // 启用智能存储策略
  strategy: {
    enabled: true,
    sizeThresholds: {
      small: 1024,      // 1KB 以下使用 localStorage
      medium: 10240,    // 10KB 以下使用 sessionStorage  
      large: 102400     // 100KB 以上使用 IndexedDB
    },
    ttlThresholds: {
      short: 5 * 60 * 1000,      // 5分钟以下使用内存
      medium: 60 * 60 * 1000,    // 1小时以下使用 sessionStorage
      long: 24 * 60 * 60 * 1000  // 1天以上使用 localStorage
    }
  },
  
  // 启用安全特性
  security: {
    encryption: { enabled: true },
    obfuscation: { enabled: true }
  },
  
  // 调试模式（生产环境应关闭）
  debug: false
})

/**
 * 批量操作性能示例
 */
async function batchOperationsDemo() {
  console.log('=== 批量操作性能测试 ===')
  
  // 准备测试数据
  const testData: Record<string, any> = {}
  for (let i = 0; i < 1000; i++) {
    testData[`item_${i}`] = {
      id: i,
      name: `Item ${i}`,
      data: new Array(100).fill(i).join(','), // 模拟中等大小数据
      timestamp: Date.now()
    }
  }
  
  // 批量设置性能测试
  console.time('批量设置 (mset)')
  const setResults = await cache.mset(testData)
  console.timeEnd('批量设置 (mset)')
  console.log(`成功设置: ${setResults.success.length}, 失败: ${setResults.failed.length}`)
  
  // 批量获取性能测试
  const keys = Object.keys(testData)
  console.time('批量获取 (mget)')
  const getResults = await cache.mget(keys)
  console.timeEnd('批量获取 (mget)')
  console.log(`获取到 ${Object.keys(getResults).length} 个项目`)
  
  // 对比单个操作性能
  console.time('单个操作设置')
  for (let i = 0; i < 100; i++) {
    await cache.set(`single_${i}`, testData[`item_${i}`])
  }
  console.timeEnd('单个操作设置')
  
  console.time('单个操作获取')
  for (let i = 0; i < 100; i++) {
    await cache.get(`single_${i}`)
  }
  console.timeEnd('单个操作获取')
}

/**
 * 智能存储策略示例
 */
async function smartStorageDemo() {
  console.log('\n=== 智能存储策略测试 ===')
  
  // 小数据 - 自动选择 localStorage
  await cache.set('small_data', 'Hello World')
  
  // 中等数据 - 自动选择 sessionStorage 或 localStorage
  const mediumData = {
    users: new Array(100).fill(0).map((_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`
    }))
  }
  await cache.set('medium_data', mediumData)
  
  // 大数据 - 自动选择 IndexedDB
  const largeData = {
    records: new Array(1000).fill(0).map((_, i) => ({
      id: i,
      content: new Array(100).fill(`Record ${i} content`).join(' '),
      metadata: {
        created: new Date().toISOString(),
        tags: [`tag${i % 10}`, `category${i % 5}`]
      }
    }))
  }
  await cache.set('large_data', largeData)
  
  // 短期数据 - 自动选择内存存储
  await cache.set('temp_data', 'Temporary', { ttl: 30 * 1000 }) // 30秒
  
  // 长期数据 - 自动选择持久化存储
  await cache.set('persistent_data', 'Long term', { ttl: 7 * 24 * 60 * 60 * 1000 }) // 7天
  
  console.log('智能存储策略已自动为不同数据选择最优存储引擎')
}

/**
 * 内存优化示例
 */
async function memoryOptimizationDemo() {
  console.log('\n=== 内存优化测试 ===')
  
  // 获取当前缓存统计
  const statsBefore = await cache.getStats()
  console.log('优化前统计:', {
    totalItems: statsBefore.totalItems,
    totalSize: statsBefore.totalSize,
    hitRate: statsBefore.hitRate
  })
  
  // 手动触发内存优化
  await (cache as any).optimizeMemory?.()
  console.log('已执行内存优化')
  
  // 清理过期项
  await cache.cleanup()
  console.log('已清理过期项')
  
  // 获取优化后统计
  const statsAfter = await cache.getStats()
  console.log('优化后统计:', {
    totalItems: statsAfter.totalItems,
    totalSize: statsAfter.totalSize,
    hitRate: statsAfter.hitRate
  })
}

/**
 * 缓存预热示例
 */
async function cacheWarmupDemo() {
  console.log('\n=== 缓存预热测试 ===')
  
  // 模拟应用启动时的缓存预热
  const criticalData = {
    'app_config': {
      version: '1.0.0',
      features: ['feature1', 'feature2'],
      settings: { theme: 'light', language: 'zh-CN' }
    },
    'user_preferences': {
      notifications: true,
      autoSave: true,
      theme: 'dark'
    },
    'navigation_menu': [
      { id: 1, name: '首页', path: '/' },
      { id: 2, name: '产品', path: '/products' },
      { id: 3, name: '关于', path: '/about' }
    ]
  }
  
  console.time('缓存预热')
  await cache.mset(criticalData)
  console.timeEnd('缓存预热')
  
  console.log('关键数据已预热到缓存')
}

/**
 * 性能监控示例
 */
async function performanceMonitoringDemo() {
  console.log('\n=== 性能监控测试 ===')
  
  // 监听缓存事件
  cache.on('set', (event) => {
    console.log(`[SET] ${event.key} -> ${event.engine}`)
  })
  
  cache.on('get', (event) => {
    console.log(`[GET] ${event.key} <- ${event.engine}`)
  })
  
  cache.on('expired', (event) => {
    console.log(`[EXPIRED] ${event.key}`)
  })
  
  // 执行一些操作来触发事件
  await cache.set('monitor_test', 'test data')
  await cache.get('monitor_test')
  
  // 设置一个快速过期的项目
  await cache.set('quick_expire', 'will expire soon', { ttl: 100 })
  
  // 等待过期
  await new Promise(resolve => setTimeout(resolve, 150))
  await cache.get('quick_expire') // 应该触发 expired 事件
  
  console.log('性能监控事件已记录')
}

/**
 * 运行所有性能示例
 */
async function runAllDemos() {
  try {
    await batchOperationsDemo()
    await smartStorageDemo()
    await memoryOptimizationDemo()
    await cacheWarmupDemo()
    await performanceMonitoringDemo()
    
    console.log('\n=== 所有性能示例执行完成 ===')
    
    // 最终统计
    const finalStats = await cache.getStats()
    console.log('最终缓存统计:', finalStats)
    
  } catch (error) {
    console.error('性能示例执行出错:', error)
  }
}

// 如果直接运行此文件
if (typeof window !== 'undefined') {
  // 浏览器环境
  (window as any).runCachePerformanceDemo = runAllDemos
  console.log('在浏览器控制台中运行: runCachePerformanceDemo()')
} else {
  // Node.js 环境
  runAllDemos()
}

export {
  batchOperationsDemo,
  smartStorageDemo,
  memoryOptimizationDemo,
  cacheWarmupDemo,
  performanceMonitoringDemo,
  runAllDemos
}
