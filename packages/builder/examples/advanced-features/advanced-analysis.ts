/**
 * 高级功能使用示例
 * 
 * 展示如何使用新增的高级分析和优化功能
 */

import {
  DependencyAnalyzer,
  BuildPerformanceAnalyzer,
  CodeSplittingOptimizer,
  BuildCacheManager
} from '@ldesign/builder'

/**
 * 综合项目分析示例
 */
async function comprehensiveProjectAnalysis() {
  console.log('🔍 开始综合项目分析...\n')

  const projectRoot = process.cwd()

  // 1. 依赖分析
  console.log('📦 分析项目依赖...')
  const dependencyAnalyzer = new DependencyAnalyzer({
    enableSecurityCheck: true,
    enableBundleSizeAnalysis: true,
    enableCircularDependencyCheck: true,
    enableUnusedDependencyCheck: true
  })

  const dependencyResult = await dependencyAnalyzer.analyze(projectRoot)

  console.log(`✅ 依赖分析完成:`)
  console.log(`   - 总依赖数: ${dependencyResult.summary.total}`)
  console.log(`   - 生产依赖: ${dependencyResult.summary.production}`)
  console.log(`   - 开发依赖: ${dependencyResult.summary.development}`)
  console.log(`   - 未使用依赖: ${dependencyResult.unusedDependencies?.length || 0}`)
  console.log(`   - 安全问题: ${dependencyResult.securityIssues?.length || 0}`)
  console.log(`   - 循环依赖: ${dependencyResult.circularDependencies?.length || 0}`)
  if (dependencyResult.bundleSizeAnalysis) {
    console.log(`   - 包总大小: ${Math.round(dependencyResult.bundleSizeAnalysis.totalSize / 1024 / 1024 * 100) / 100} MB`)
  }
  console.log()

  // 2. 代码分割优化
  console.log('✂️ 分析代码分割策略...')
  const splittingOptimizer = new CodeSplittingOptimizer({
    strategy: 'hybrid',
    minChunkSize: 1000,
    maxChunks: 10
  })

  const splittingResult = await splittingOptimizer.optimize({
    rootDir: projectRoot,
    entries: ['src/index.ts'],
    strategy: 'hybrid'
  })

  console.log(`✅ 代码分割分析完成:`)
  console.log(`   - 模块总数: ${splittingResult.modules.length}`)
  console.log(`   - 推荐策略数: ${splittingResult.recommendedStrategies.length}`)
  console.log(`   - 重复代码检测: ${splittingResult.optimizations.duplicateCode.length}`)
  console.log(`   - 未使用导出: ${splittingResult.optimizations.unusedExports.length}`)
  console.log(`   - 缓存效率: ${splittingResult.metrics.cacheEfficiency}%\n`)

  // 3. 构建性能分析示例
  console.log('⚡ 模拟构建性能分析...')
  const performanceAnalyzer = new BuildPerformanceAnalyzer({
    enableMemoryTracking: true,
    enableDetailedMetrics: true
  })

  // 模拟构建阶段
  performanceAnalyzer.startPhase('initialization')
  await simulateWork(100)
  performanceAnalyzer.endPhase('initialization')

  performanceAnalyzer.startPhase('compilation')
  await simulateWork(800)
  performanceAnalyzer.endPhase('compilation')

  performanceAnalyzer.startPhase('bundling')
  await simulateWork(500)
  performanceAnalyzer.endPhase('bundling')

  const performanceResult = performanceAnalyzer.analyze({
    includeRecommendations: true,
    includeBottlenecks: true
  })

  console.log(`✅ 构建性能分析完成:`)
  console.log(`   - 总耗时: ${performanceResult.overall.totalDuration}ms`)
  console.log(`   - 阶段数: ${performanceResult.overall.phaseCount}`)
  console.log(`   - 峰值内存: ${Math.round(performanceResult.overall.peakMemoryUsage)} MB`)
  console.log(`   - 平均内存: ${Math.round(performanceResult.overall.averageMemoryUsage)} MB`)
  console.log(`   - 性能瓶颈: ${performanceResult.bottlenecks.length}`)
  console.log(`   - 优化建议: ${performanceResult.recommendations.length}\n`)

  // 4. 缓存管理示例
  console.log('💾 测试构建缓存管理...')
  const cacheManager = new BuildCacheManager({
    cacheDir: '.cache/builder',
    maxSize: 100 * 1024 * 1024, // 100MB
    maxEntries: 1000,
    strategy: 'lru',
    compression: true,
    cleanupInterval: 300 // 5分钟
  })

  // 模拟缓存操作
  await cacheManager.set('build-config', { version: '1.0.0', timestamp: Date.now() }, {
    ttl: 7200
  })

  await cacheManager.setWithDependencies('dependency-tree', dependencyResult, [
    'package.json',
    'package-lock.json'
  ])

  const cachedConfig = await cacheManager.get('build-config')
  const cacheStats = await cacheManager.getStats()

  console.log(`✅ 缓存管理测试完成:`)
  console.log(`   - 缓存条目: ${cacheStats.entryCount}`)
  console.log(`   - 缓存大小: ${Math.round(cacheStats.size / 1024)} KB`)
  console.log(`   - 命中率: ${cacheStats.hitRate.toFixed(1)}%`)
  console.log(`   - 配置缓存: ${cachedConfig ? '✅ 命中' : '❌ 未命中'}\n`)

  // 5. 生成综合报告
  console.log('📊 生成综合分析报告...')

  const report = {
    timestamp: new Date().toISOString(),
    project: {
      root: projectRoot,
      analysis: {
        dependencies: {
          total: dependencyResult.summary.total,
          production: dependencyResult.summary.production,
          development: dependencyResult.summary.development,
          unused: dependencyResult.unusedDependencies?.length || 0,
          security: dependencyResult.securityIssues?.length || 0,
          size: dependencyResult.bundleSizeAnalysis?.totalSize || 0
        },
        splitting: {
          modules: splittingResult.modules.length,
          strategies: splittingResult.recommendedStrategies.length,
          cacheEfficiency: splittingResult.metrics.cacheEfficiency
        },
        performance: {
          totalTime: performanceResult.overall.totalDuration,
          phaseCount: performanceResult.overall.phaseCount,
          peakMemory: performanceResult.overall.peakMemoryUsage,
          bottlenecks: performanceResult.bottlenecks.length,
          recommendations: performanceResult.recommendations.length
        },
        cache: {
          entries: cacheStats.entryCount,
          size: cacheStats.size,
          hitRate: cacheStats.hitRate
        }
      }
    },
    recommendations: [
      ...dependencyResult.recommendations,
      ...performanceResult.recommendations
    ].slice(0, 10) // 取前10个最重要的建议
  }

  console.log('📋 综合分析报告:')
  console.log(JSON.stringify(report, null, 2))

  // 清理缓存
  await cacheManager.clear()

  console.log('\n✨ 综合项目分析完成！')
}

/**
 * 模拟工作负载
 */
function simulateWork(duration: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}

/**
 * 性能优化建议示例
 */
async function performanceOptimizationExample() {
  console.log('🚀 性能优化建议示例\n')

  const performanceAnalyzer = new BuildPerformanceAnalyzer()
  
  // 模拟多次构建以获得历史数据
  for (let i = 0; i < 3; i++) {
    performanceAnalyzer.startAnalysis()
    
    performanceAnalyzer.startPhase('compilation')
    await simulateWork(Math.random() * 1000 + 500)
    performanceAnalyzer.endPhase('compilation')
    
    performanceAnalyzer.startPhase('bundling')
    await simulateWork(Math.random() * 800 + 300)
    performanceAnalyzer.endPhase('bundling')
    
    const result = performanceAnalyzer.finishAnalysis({
      compareWithHistory: true,
      thresholds: {
        slowPhase: 800,
        highMemory: 100 * 1024 * 1024,
        lowCacheHit: 60
      }
    })
    
    console.log(`构建 ${i + 1}: ${result.totalDuration}ms`)
    if (result.comparison?.improvement) {
      console.log(`  性能改进: ${result.comparison.improvement.toFixed(1)}%`)
    }
  }

  const history = performanceAnalyzer.getHistory()
  console.log(`\n📈 历史构建数据: ${history.length} 次构建`)
  
  const averageTime = history.reduce((sum, build) => sum + build.totalDuration, 0) / history.length
  console.log(`平均构建时间: ${averageTime.toFixed(0)}ms`)
}

/**
 * 缓存优化示例
 */
async function cacheOptimizationExample() {
  console.log('💾 缓存优化示例\n')

  const cacheManager = new BuildCacheManager({
    cacheDir: '.cache/optimization-demo',
    maxSize: 10 * 1024 * 1024, // 10MB
    maxEntries: 100,
    strategy: 'lru',
    compression: false,
    encryption: false,
    cleanupInterval: 60
  })

  await cacheManager.initialize()

  // 添加一些测试数据
  for (let i = 0; i < 20; i++) {
    await cacheManager.set(`item-${i}`, {
      data: `test data ${i}`.repeat(100),
      timestamp: Date.now()
    }, {
      tags: i % 2 === 0 ? ['even'] : ['odd'],
      ttl: i < 10 ? 1 : 3600 // 前10个设置短TTL
    })
  }

  console.log('添加了20个缓存条目')
  
  // 等待一些条目过期
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 执行优化
  const optimizationResult = await cacheManager.optimize()
  
  console.log('🔧 缓存优化结果:')
  console.log(`  优化前: ${optimizationResult.beforeStats.totalEntries} 条目`)
  console.log(`  优化后: ${optimizationResult.afterStats.totalEntries} 条目`)
  console.log(`  优化操作: ${optimizationResult.optimizations.join(', ')}`)

  await cacheManager.destroy()
}

// 运行示例
if (require.main === module) {
  (async () => {
    try {
      await comprehensiveProjectAnalysis()
      console.log('\n' + '='.repeat(50) + '\n')
      await performanceOptimizationExample()
      console.log('\n' + '='.repeat(50) + '\n')
      await cacheOptimizationExample()
    } catch (error) {
      console.error('示例运行失败:', error)
      process.exit(1)
    }
  })()
}

export {
  comprehensiveProjectAnalysis,
  performanceOptimizationExample,
  cacheOptimizationExample
}
