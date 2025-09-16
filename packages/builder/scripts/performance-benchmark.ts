#!/usr/bin/env node

/**
 * 性能基准测试脚本
 * 验证新功能的性能表现和稳定性
 */

import { performance } from 'perf_hooks'
import * as fs from 'fs-extra'
import * as path from 'path'

// 动态导入模块以避免编译时错误
async function importModules() {
  try {
    const { DependencyAnalyzer } = await import('../src/utils/dependency-analyzer')
    const { BuildPerformanceAnalyzer } = await import('../src/utils/build-performance-analyzer')
    const { CodeSplittingOptimizer } = await import('../src/utils/code-splitting-optimizer')
    const { BuildCacheManager } = await import('../src/utils/build-cache-manager')

    return {
      DependencyAnalyzer,
      BuildPerformanceAnalyzer,
      CodeSplittingOptimizer,
      BuildCacheManager
    }
  } catch (error) {
    console.error('❌ 无法导入模块:', error)
    throw error
  }
}

interface BenchmarkResult {
  name: string
  duration: number
  memoryUsage: number
  success: boolean
  error?: string
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = []

  async runBenchmark(name: string, fn: () => Promise<void>): Promise<BenchmarkResult> {
    console.log(`🔄 运行基准测试: ${name}`)
    
    const startTime = performance.now()
    const startMemory = process.memoryUsage().heapUsed
    
    try {
      await fn()
      
      const endTime = performance.now()
      const endMemory = process.memoryUsage().heapUsed
      
      const result: BenchmarkResult = {
        name,
        duration: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        success: true
      }
      
      this.results.push(result)
      console.log(`✅ ${name}: ${result.duration.toFixed(2)}ms, 内存: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
      
      return result
    } catch (error) {
      const endTime = performance.now()
      const result: BenchmarkResult = {
        name,
        duration: endTime - startTime,
        memoryUsage: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
      
      this.results.push(result)
      console.log(`❌ ${name}: 失败 - ${result.error}`)
      
      return result
    }
  }

  getResults(): BenchmarkResult[] {
    return this.results
  }

  generateReport(): string {
    const successCount = this.results.filter(r => r.success).length
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0)
    const totalMemory = this.results.reduce((sum, r) => sum + r.memoryUsage, 0)
    
    let report = `
# 性能基准测试报告

## 总体统计
- 测试项目: ${this.results.length}
- 成功: ${successCount}
- 失败: ${this.results.length - successCount}
- 总耗时: ${totalTime.toFixed(2)}ms
- 总内存使用: ${(totalMemory / 1024 / 1024).toFixed(2)}MB

## 详细结果
`

    this.results.forEach(result => {
      report += `
### ${result.name}
- 状态: ${result.success ? '✅ 成功' : '❌ 失败'}
- 耗时: ${result.duration.toFixed(2)}ms
- 内存: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB
${result.error ? `- 错误: ${result.error}` : ''}
`
    })

    return report
  }
}

async function main() {
  console.log('🚀 开始性能基准测试...\n')

  const benchmark = new PerformanceBenchmark()
  const projectRoot = process.cwd()

  // 导入模块
  const modules = await importModules()
  const { DependencyAnalyzer, BuildPerformanceAnalyzer, CodeSplittingOptimizer, BuildCacheManager } = modules

  // 1. 依赖分析性能测试
  await benchmark.runBenchmark('依赖分析器 - 基础分析', async () => {
    const analyzer = new DependencyAnalyzer()
    await analyzer.analyze({ projectPath: projectRoot })
  })

  await benchmark.runBenchmark('依赖分析器 - 完整分析', async () => {
    const analyzer = new DependencyAnalyzer()
    await analyzer.analyze({
      projectPath: projectRoot,
      enableSecurityCheck: true,
      enableBundleSizeAnalysis: true,
      enableCircularDependencyCheck: true,
      enableUnusedDependencyCheck: true
    })
  })
  
  // 2. 性能分析器测试
  await benchmark.runBenchmark('性能分析器 - 基础监控', async () => {
    const analyzer = new BuildPerformanceAnalyzer()

    analyzer.startPhase('initialization' as any)
    await new Promise(resolve => setTimeout(resolve, 10))
    analyzer.endPhase('initialization' as any)

    analyzer.getAnalysis()
  })

  await benchmark.runBenchmark('性能分析器 - 内存监控', async () => {
    const analyzer = new BuildPerformanceAnalyzer()

    for (let i = 0; i < 5; i++) {
      analyzer.startPhase('compilation' as any)
      await new Promise(resolve => setTimeout(resolve, 5))
      analyzer.endPhase('compilation' as any)
    }

    analyzer.getAnalysis()
  })
  
  // 3. 代码分割优化器测试
  await benchmark.runBenchmark('代码分割优化器 - 基础分析', async () => {
    const optimizer = new CodeSplittingOptimizer()
    await optimizer.optimize({
      rootDir: projectRoot,
      entries: ['src/index.ts']
    })
  })

  await benchmark.runBenchmark('代码分割优化器 - 混合策略', async () => {
    const optimizer = new CodeSplittingOptimizer()
    await optimizer.optimize({
      rootDir: projectRoot,
      entries: ['src/index.ts'],
      minChunkSize: 1000,
      maxChunks: 10
    })
  })
  
  // 4. 缓存管理器测试
  await benchmark.runBenchmark('缓存管理器 - 基础操作', async () => {
    const cacheManager = new BuildCacheManager({
      cacheDir: path.join(projectRoot, '.benchmark-cache'),
      maxSize: 10 * 1024 * 1024, // 10MB
      strategy: 'lru'
    })
    
    // 设置缓存
    for (let i = 0; i < 10; i++) {
      await cacheManager.set(`key-${i}`, { data: `value-${i}`, timestamp: Date.now() })
    }
    
    // 获取缓存
    for (let i = 0; i < 10; i++) {
      await cacheManager.get(`key-${i}`)
    }
    
    // 清理
    await cacheManager.clear()
  })
  
  await benchmark.runBenchmark('缓存管理器 - 大量数据', async () => {
    const cacheManager = new BuildCacheManager({
      cacheDir: path.join(projectRoot, '.benchmark-cache-large'),
      maxSize: 50 * 1024 * 1024, // 50MB
      strategy: 'lru'
    })
    
    // 设置大量缓存数据
    const largeData = 'x'.repeat(1000) // 1KB 数据
    for (let i = 0; i < 100; i++) {
      await cacheManager.set(`large-key-${i}`, { 
        data: largeData, 
        index: i,
        timestamp: Date.now() 
      })
    }
    
    // 随机访问
    for (let i = 0; i < 50; i++) {
      const randomIndex = Math.floor(Math.random() * 100)
      await cacheManager.get(`large-key-${randomIndex}`)
    }
    
    // 获取统计信息
    await cacheManager.getStats()
    
    // 清理
    await cacheManager.clear()
  })
  
  // 5. 集成性能测试
  await benchmark.runBenchmark('集成测试 - 完整流程', async () => {
    // 依赖分析
    const depAnalyzer = new DependencyAnalyzer()
    const depResult = await depAnalyzer.analyze({
      projectPath: projectRoot,
      enableSecurityCheck: true,
      enableBundleSizeAnalysis: true
    })

    // 性能监控
    const perfAnalyzer = new BuildPerformanceAnalyzer()

    perfAnalyzer.startPhase('initialization' as any)

    // 代码分割分析
    const splittingOptimizer = new CodeSplittingOptimizer()
    const splittingResult = await splittingOptimizer.optimize({
      rootDir: projectRoot,
      entries: ['src/index.ts']
    })

    // 缓存操作
    const cacheManager = new BuildCacheManager({
      cacheDir: path.join(projectRoot, '.integration-cache')
    })

    await cacheManager.set('dep-analysis', depResult)
    await cacheManager.set('splitting-analysis', splittingResult)

    perfAnalyzer.endPhase('initialization' as any)

    const perfResult = perfAnalyzer.getAnalysis()

    // 清理
    await cacheManager.clear()

    // 验证结果
    if (!depResult || !splittingResult || !perfResult) {
      throw new Error('集成测试结果不完整')
    }
  })
  
  // 生成报告
  console.log('\n📊 生成性能基准测试报告...')
  
  const report = benchmark.generateReport()
  const reportPath = path.join(projectRoot, 'performance-benchmark-report.md')
  
  await fs.writeFile(reportPath, report, 'utf-8')
  
  console.log(`\n✅ 性能基准测试完成！`)
  console.log(`📄 报告已保存到: ${reportPath}`)
  
  // 输出简要结果
  const results = benchmark.getResults()
  const successCount = results.filter(r => r.success).length
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length
  
  console.log(`\n📈 测试总结:`)
  console.log(`- 成功率: ${successCount}/${results.length} (${(successCount / results.length * 100).toFixed(1)}%)`)
  console.log(`- 平均耗时: ${avgDuration.toFixed(2)}ms`)
  console.log(`- 最快测试: ${Math.min(...results.map(r => r.duration)).toFixed(2)}ms`)
  console.log(`- 最慢测试: ${Math.max(...results.map(r => r.duration)).toFixed(2)}ms`)
  
  // 清理临时文件
  const tempDirs = [
    '.benchmark-cache',
    '.benchmark-cache-large', 
    '.integration-cache'
  ]
  
  for (const dir of tempDirs) {
    const fullPath = path.join(projectRoot, dir)
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath)
    }
  }
  
  // 如果有失败的测试，退出码为1
  if (successCount < results.length) {
    process.exit(1)
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 性能基准测试失败:', error)
    process.exit(1)
  })
}

export { PerformanceBenchmark }
