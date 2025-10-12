/**
 * @ldesign/router 新功能使用示例
 * 
 * 展示新添加的实用功能：
 * 1. RoutePerformanceMonitor - 路由性能监控
 * 2. RouteCacheWarmer - 路由缓存预热
 */

import { 
  createRouter,
  createWebHashHistory,
  createRoutePerformanceMonitor,
  createRouteCacheWarmer,
  createPerformanceMonitorPlugin,
  warmupRoutes,
  type RouteRecordRaw,
  type PerformanceMonitorConfig,
  type WarmupConfig,
} from '../src'

// ==================== 示例路由配置 ====================

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./components/Home.vue'),
    meta: {
      title: '首页',
      preload: true, // 标记为需要预热的路由
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('./components/About.vue'),
    meta: {
      title: '关于',
      important: true, // 标记为重要路由
    },
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('./components/Products.vue'),
    meta: {
      title: '产品',
      preload: true,
    },
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: () => import('./components/ProductDetail.vue'),
    meta: {
      title: '产品详情',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./components/Dashboard.vue'),
    meta: {
      title: '仪表盘',
      requiresAuth: true,
    },
  },
]

// ==================== 创建路由器 ====================

const router = createRouter({
  routes,
  history: createWebHashHistory(),
})

// ==================== 示例1: 路由性能监控 ====================

console.log('=== 示例1: 路由性能监控 ===')

// 配置性能监控
const monitorConfig: PerformanceMonitorConfig = {
  enabled: true,
  slowThreshold: 1000, // 超过1秒视为慢速路由
  maxRecords: 50,      // 最多保留50条记录
  onReport: (metrics: any[]) => {
    // 当检测到慢速路由时触发
    metrics.forEach((metric: any) => {
      console.warn(`⚠️ 慢速路由检测:`)
      console.warn(`  路径: ${metric.path}`)
      console.warn(`  耗时: ${metric.duration.toFixed(2)}ms`)
    })
  },
}

// 创建性能监控器
const performanceMonitor = createRoutePerformanceMonitor(router, monitorConfig)

// 或者使用插件方式
// const monitorPlugin = createPerformanceMonitorPlugin(monitorConfig)
// router.use(monitorPlugin)

// 模拟一些路由导航
setTimeout(async () => {
  await router.push('/')
  await router.push('/about')
  await router.push('/products')
  await router.push('/products/123')
  
  // 获取性能报告
  const report = performanceMonitor.generateReport()
  console.log('\n📊 性能报告:')
  console.log(`  总导航次数: ${report.totalNavigations}`)
  console.log(`  平均耗时: ${report.averageTime.toFixed(2)}ms`)
  console.log(`  慢速路由数: ${report.slowRoutes}`)
  
  if (report.slowestRoute) {
    console.log(`  最慢路由: ${report.slowestRoute.path} (${report.slowestRoute.duration.toFixed(2)}ms)`)
  }
  
  if (report.fastestRoute) {
    console.log(`  最快路由: ${report.fastestRoute.path} (${report.fastestRoute.duration.toFixed(2)}ms)`)
  }
  
  // 获取所有慢速路由
  const slowRoutes = performanceMonitor.getSlowRoutes()
  if (slowRoutes.length > 0) {
    console.log('\n🐌 慢速路由列表:')
    slowRoutes.forEach((route: any) => {
      console.log(`  - ${route.path}: ${route.duration.toFixed(2)}ms`)
    })
  }
  
  // 获取所有性能指标
  const allMetrics = performanceMonitor.getMetrics()
  console.log(`\n📈 共收集了 ${allMetrics.length} 条性能数据`)
}, 1000)

// ==================== 示例2: 路由缓存预热 ====================

console.log('\n=== 示例2: 路由缓存预热 ===')

// 配置缓存预热
const warmupConfig: WarmupConfig = {
  routes: ['/', '/about', '/products'], // 指定要预热的路由
  strategy: 'idle',  // 在浏览器空闲时预热
  concurrency: 3,    // 同时预热3个路由
  onComplete: (results: any[]) => {
    console.log('\n✅ 预热完成!')
    console.log(`  成功: ${results.filter((r: any) => r.success).length}`)
    console.log(`  失败: ${results.filter((r: any) => !r.success).length}`)
    
    // 显示详细结果
    results.forEach((result: any) => {
      const status = result.success ? '✓' : '✗'
      const duration = result.duration.toFixed(2)
      console.log(`  ${status} ${result.route} (${duration}ms)`)
      if (result.error) {
        console.log(`    错误: ${result.error}`)
      }
    })
  },
  onError: (error: any, route: any) => {
    console.error(`❌ 预热失败: ${route}`, error.message)
  },
}

// 创建缓存预热器
const cacheWarmer = createRouteCacheWarmer(router, warmupConfig)

// 开始预热
setTimeout(async () => {
  console.log('\n🔥 开始预热路由...')
  await cacheWarmer.warmup()
  
  // 获取预热统计
  const stats = cacheWarmer.getStats()
  console.log('\n📊 预热统计:')
  console.log(`  总数: ${stats.total}`)
  console.log(`  成功: ${stats.successful}`)
  console.log(`  失败: ${stats.failed}`)
  console.log(`  平均耗时: ${stats.averageDuration.toFixed(2)}ms`)
}, 2000)

// ==================== 示例3: 快速预热 ====================

console.log('\n=== 示例3: 快速预热 ===')

// 使用快速预热函数
setTimeout(async () => {
  console.log('\n🚀 快速预热重要路由...')
  
  const results = await warmupRoutes(
    router,
    ['/', '/about', '/products'],
    'immediate' // 立即预热
  )
  
  console.log(`✅ 快速预热完成: ${results.length} 个路由`)
}, 3000)

// ==================== 示例4: 自动识别重要路由 ====================

console.log('\n=== 示例4: 自动识别重要路由 ===')

// 不指定routes，自动识别标记为preload或important的路由
const autoWarmer = createRouteCacheWarmer(router, {
  strategy: 'idle',
  onComplete: (results: any[]) => {
    console.log('\n✅ 自动预热完成!')
    console.log(`  预热了 ${results.length} 个重要路由`)
    results.forEach((r: any) => {
      console.log(`  - ${r.route}`)
    })
  },
})

setTimeout(() => {
  console.log('\n🤖 自动识别并预热重要路由...')
  autoWarmer.warmup()
}, 4000)

// ==================== 示例5: 组合使用 ====================

console.log('\n=== 示例5: 组合使用 ===')

setTimeout(async () => {
  console.log('\n🎯 组合使用性能监控和缓存预热...')
  
  // 1. 先预热关键路由
  await warmupRoutes(router, ['/', '/about'], 'immediate')
  console.log('✓ 关键路由预热完成')
  
  // 2. 模拟用户导航
  await router.push('/')
  await router.push('/about')
  await router.push('/products')
  
  // 3. 查看性能数据
  const report = performanceMonitor.generateReport()
  console.log('\n📊 导航性能:')
  console.log(`  平均耗时: ${report.averageTime.toFixed(2)}ms`)
  
  // 4. 根据性能数据决定是否需要预热更多路由
  if (report.averageTime > 500) {
    console.log('⚠️ 平均耗时较高，预热更多路由...')
    await warmupRoutes(router, ['/products', '/dashboard'], 'idle')
  }
}, 5000)

// ==================== 示例6: 性能监控最佳实践 ====================

console.log('\n=== 示例6: 性能监控最佳实践 ===')

// 定期生成性能报告
setInterval(() => {
  const report = performanceMonitor.generateReport()
  
  if (report.totalNavigations > 0) {
    console.log('\n📈 定期性能报告:')
    console.log(`  导航次数: ${report.totalNavigations}`)
    console.log(`  平均耗时: ${report.averageTime.toFixed(2)}ms`)
    console.log(`  慢速路由: ${report.slowRoutes}`)
    
    // 如果慢速路由过多，发出警告
    if (report.slowRoutes > report.totalNavigations * 0.3) {
      console.warn('⚠️ 警告: 超过30%的路由导航较慢，建议优化!')
    }
  }
}, 10000) // 每10秒生成一次报告

// ==================== 示例7: 清理和销毁 ====================

console.log('\n=== 示例7: 清理和销毁 ===')

// 在应用卸载时清理
window.addEventListener('beforeunload', () => {
  console.log('\n🧹 清理资源...')
  
  // 清除性能数据
  performanceMonitor.clear()
  
  // 销毁监控器
  performanceMonitor.destroy()
  
  console.log('✓ 资源清理完成')
})

// ==================== 导出供其他模块使用 ====================

export {
  router,
  performanceMonitor,
  cacheWarmer,
}

// ==================== 使用提示 ====================

console.log('\n💡 使用提示:')
console.log('1. 性能监控器会自动跟踪所有路由导航')
console.log('2. 缓存预热可以显著提升首次访问速度')
console.log('3. 建议在应用启动时使用"idle"策略预热关键路由')
console.log('4. 定期查看性能报告，识别需要优化的路由')
console.log('5. 在生产环境中可以禁用详细日志，只保留错误报告')

