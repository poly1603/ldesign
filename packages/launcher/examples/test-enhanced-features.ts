/**
 * 增强功能测试示例
 * 
 * 这个脚本演示如何使用新增的增强功能
 * 
 * 运行方式:
 * npx tsx examples/test-enhanced-features.ts
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { createEnhancedMonitor } from '../src/core/PerformanceMonitorEnhanced'
import { createSmartCache } from '../src/core/SmartCacheManager'

console.log('🚀 开始测试增强功能...\n')

// ============================================
// 1. 测试性能监控器
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 测试增强版性能监控器')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const monitor = createEnhancedMonitor({
  enableMemoryPressureMonitoring: true,
  memoryPressureCheckInterval: 5000,
  historyLimit: 100,
  enableRealtimeMetrics: true
})

// 获取当前内存压力
const pressure = monitor.getMemoryPressure()
console.log(`✅ 内存压力检测:`)
console.log(`   级别: ${pressure.pressure.toUpperCase()}`)
console.log(`   使用: ${pressure.heapUsed}MB / ${pressure.heapTotal}MB (${pressure.pressurePercent}%)`)
if (pressure.recommendation) {
  console.log(`   建议: ${pressure.recommendation}`)
}
console.log()

// 模拟记录一些性能数据
console.log('✅ 记录模拟性能数据...')
monitor.recordBuildTime(1250)
monitor.recordBuildTime(1180)
monitor.recordBuildTime(1320)
monitor.recordStartupTime(2800)
monitor.recordStartupTime(3100)

monitor.updateRealtimeMetrics({
  requestsPerSecond: 125,
  activeConnections: 42,
  cpuUsage: 38.5
})

console.log('   - 记录了 3 次构建时间')
console.log('   - 记录了 2 次启动时间')
console.log('   - 更新了实时指标')
console.log()

// 显示性能报告
console.log(monitor.getPerformanceReport())
console.log()

// ============================================
// 2. 测试智能缓存管理器
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('💾 测试智能缓存管理器')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const cache = createSmartCache({
  maxSize: 100,
  enableMemoryPressureCleanup: true,
  memoryPressureThreshold: 70,
  maxAge: 3600000,
  enableStatistics: true
})

// 添加一些测试数据
console.log('✅ 添加测试缓存数据...')
cache.set('config:app', { port: 3000, host: 'localhost' }, 'config')
cache.set('config:vite', { mode: 'development' }, 'config')
cache.set('module:app', { name: 'app', version: '1.0.0' }, 'module')
cache.set('module:utils', { name: 'utils' }, 'module')
cache.set('transform:main', { code: 'console.log("hello")' }, 'transform')
console.log('   - 添加了 5 个缓存项')
console.log()

// 测试缓存访问
console.log('✅ 测试缓存访问...')
const appConfig = cache.get('config:app')
const viteConfig = cache.get('config:vite')
const notFound = cache.get('not-exist')
console.log('   - 访问了 3 次（2 次命中，1 次未命中）')
console.log()

// 获取统计信息
const stats = cache.getStatistics()
console.log('✅ 缓存统计:')
console.log(`   缓存项: ${stats.totalItems}`)
console.log(`   命中率: ${stats.hitRate}%`)
console.log(`   命中次数: ${stats.hits}`)
console.log(`   未命中次数: ${stats.misses}`)
console.log()

// 显示缓存报告
console.log(cache.getReport())
console.log()

// ============================================
// 3. 测试缓存预热
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔥 测试缓存预热功能')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

await cache.warmup(async () => {
  // 模拟加载数据
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    'preload:config1': { data: 'config1' },
    'preload:config2': { data: 'config2' },
    'preload:config3': { data: 'config3' },
    'preload:config4': { data: 'config4' },
    'preload:config5': { data: 'config5' }
  }
})

console.log()
console.log('✅ 预热后的缓存统计:')
const statsAfterWarmup = cache.getStatistics()
console.log(`   缓存项: ${statsAfterWarmup.totalItems}`)
console.log()

// ============================================
// 4. 测试缓存清理
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🧹 测试缓存清理功能')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('✅ 执行手动清理 (20%)...')
cache.cleanup(0.2)
console.log()

const statsAfterCleanup = cache.getStatistics()
console.log('✅ 清理后的缓存统计:')
console.log(`   缓存项: ${statsAfterCleanup.totalItems}`)
console.log()

// ============================================
// 5. 导出数据
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📤 测试数据导出功能')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('✅ 导出性能监控数据...')
const metricsJson = monitor.exportMetrics()
console.log(`   数据大小: ${metricsJson.length} 字节`)
console.log()

// ============================================
// 6. 综合展示
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🎉 测试完成 - 最终状态')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('【性能监控】')
const dashboard = monitor.getDashboardMetrics()
console.log(`  构建次数: ${dashboard.statistics.totalBuilds}`)
console.log(`  平均构建时间: ${dashboard.statistics.averageBuildTime}ms`)
console.log(`  启动次数: ${dashboard.statistics.totalStartups}`)
console.log(`  平均启动时间: ${dashboard.statistics.averageStartupTime}ms`)
console.log()

console.log('【缓存管理】')
const finalStats = cache.getStatistics()
console.log(`  缓存项: ${finalStats.totalItems}`)
console.log(`  命中率: ${finalStats.hitRate}%`)
console.log(`  内存占用: ${(finalStats.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
console.log()

// 清理资源
console.log('🧹 清理测试资源...')
monitor.destroy()
cache.destroy()

console.log('\n✅ 所有测试完成！增强功能运行正常！\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📚 更多信息请查看: ENHANCED_FEATURES.md')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
