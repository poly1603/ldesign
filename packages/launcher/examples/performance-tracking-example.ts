/**
 * 性能追踪使用示例
 * 展示如何在构建过程中使用性能追踪器
 */

import { createPerformanceTracker, globalTracker } from '@ldesign/launcher/utils/performance-tracker'

// 示例 1: 使用独立的性能追踪器
async function buildWithTracking() {
  const tracker = createPerformanceTracker()
  
  // 开始追踪整个构建过程
  tracker.start('build')
  
  // 追踪依赖优化
  await tracker.measure('dependency-optimization', async () => {
    console.log('Optimizing dependencies...')
    await new Promise(resolve => setTimeout(resolve, 1000))
  })
  
  // 追踪代码转换
  await tracker.measure('code-transformation', async () => {
    console.log('Transforming code...')
    await new Promise(resolve => setTimeout(resolve, 2000))
  })
  
  // 追踪代码压缩
  await tracker.measure('minification', async () => {
    console.log('Minifying code...')
    await new Promise(resolve => setTimeout(resolve, 1500))
  })
  
  // 结束追踪
  tracker.end('build')
  
  // 打印性能摘要到控制台
  tracker.printSummary()
  
  // 保存详细报告
  await tracker.saveReport('./dist/performance-report.json')
  
  console.log('✅ Performance reports generated!')
}

// 示例 2: 使用全局追踪器
async function globalTrackingExample() {
  // 追踪多个操作
  globalTracker.start('operation-1')
  await new Promise(resolve => setTimeout(resolve, 500))
  globalTracker.end('operation-1')
  
  globalTracker.start('operation-2')
  await new Promise(resolve => setTimeout(resolve, 300))
  globalTracker.end('operation-2')
  
  // 获取性能报告
  const report = globalTracker.generateReport()
  console.log('Total duration:', report.totalDuration, 'ms')
  console.log('Number of metrics:', report.metrics.length)
  console.log('Bottlenecks:', report.bottlenecks)
  console.log('Recommendations:', report.recommendations)
}

// 示例 3: 在 Vite 插件中使用
function createPerformancePlugin() {
  const tracker = createPerformanceTracker()
  
  return {
    name: 'vite-performance-tracker',
    
    buildStart() {
      tracker.start('build')
    },
    
    transform(_code: string, id: string) {
      // 追踪每个文件的转换
      tracker.start(`transform:${id}`)
      
      // ... 转换逻辑
      
      tracker.end(`transform:${id}`)
    },
    
    async buildEnd() {
      tracker.end('build')
      
      // 生成报告
      await tracker.saveReport('./dist/vite-performance.json')
      
      // 打印摘要
      tracker.printSummary()
    }
  }
}

// 示例 4: 同步操作追踪
function syncTrackingExample() {
  const tracker = createPerformanceTracker()
  
  // 追踪同步操作
  const result = tracker.measureSync('sync-operation', () => {
    let sum = 0
    for (let i = 0; i < 1000000; i++) {
      sum += i
    }
    return sum
  })
  
  console.log('Result:', result)
  tracker.printSummary()
}

// 运行示例
if (require.main === module) {
  buildWithTracking().catch(console.error)
}

export {
  buildWithTracking,
  globalTrackingExample,
  createPerformancePlugin,
  syncTrackingExample
}
