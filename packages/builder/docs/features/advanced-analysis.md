# 高级分析功能

@ldesign/builder 提供了一套强大的高级分析功能，帮助开发者深入了解项目结构、优化构建性能、管理依赖关系和提升代码质量。

## 功能概览

### 🔍 智能依赖分析
- **深度依赖扫描**: 分析项目中的所有依赖关系
- **安全漏洞检测**: 识别依赖包中的安全问题
- **循环依赖检测**: 发现并报告循环依赖问题
- **未使用依赖识别**: 找出项目中未使用的依赖包
- **包大小分析**: 评估依赖对最终bundle大小的影响

### ⚡ 构建性能监控
- **实时性能跟踪**: 监控构建过程中每个阶段的性能
- **内存使用分析**: 跟踪构建过程中的内存使用情况
- **瓶颈识别**: 自动识别构建过程中的性能瓶颈
- **优化建议**: 基于分析结果提供具体的优化建议
- **性能报告**: 生成详细的性能分析报告

### 📦 代码分割优化
- **智能分割策略**: 支持多种代码分割策略
- **依赖图分析**: 构建完整的模块依赖关系图
- **块大小优化**: 智能控制代码块的大小和数量
- **懒加载建议**: 为大型组件提供懒加载优化建议
- **缓存效率优化**: 提升代码分割的缓存效率

### 🚀 构建缓存管理
- **智能缓存策略**: 支持LRU、LFU等多种缓存策略
- **依赖跟踪**: 跟踪缓存条目之间的依赖关系
- **自动失效**: 当依赖文件变化时自动失效相关缓存
- **压缩存储**: 支持缓存数据的压缩存储
- **统计分析**: 提供详细的缓存使用统计信息

## 快速开始

### 安装和配置

```bash
npm install @ldesign/builder
```

在你的构建配置中启用高级功能：

```typescript
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  
  // 启用高级分析功能
  advanced: {
    dependencyAnalysis: {
      enabled: true,
      enableSecurityCheck: true,
      enableBundleSizeAnalysis: true
    },
    
    performanceAnalysis: {
      enabled: true,
      enableMemoryTracking: true
    },
    
    codeSplitting: {
      enabled: true,
      strategy: 'hybrid'
    },
    
    caching: {
      enabled: true,
      strategy: 'lru'
    }
  }
})
```

### 基本使用

```typescript
import {
  DependencyAnalyzer,
  BuildPerformanceAnalyzer,
  CodeSplittingOptimizer,
  BuildCacheManager
} from '@ldesign/builder'

// 依赖分析
const depAnalyzer = new DependencyAnalyzer()
const depResult = await depAnalyzer.analyze('/path/to/project')

// 性能监控
const perfAnalyzer = new BuildPerformanceAnalyzer()
perfAnalyzer.startPhase('build')
// ... 执行构建
const phaseResult = perfAnalyzer.endPhase('build')

// 代码分割优化
const optimizer = new CodeSplittingOptimizer()
const splittingResult = await optimizer.optimize({
  rootDir: '/path/to/project',
  entries: ['src/index.ts']
})

// 缓存管理
const cacheManager = new BuildCacheManager()
await cacheManager.set('build-key', buildResult)
const cached = await cacheManager.get('build-key')
```

## 使用场景

### 1. 项目健康检查

使用依赖分析器对项目进行全面的健康检查：

```typescript
async function projectHealthCheck(projectPath: string) {
  const analyzer = new DependencyAnalyzer({
    enableSecurityCheck: true,
    enableCircularDependencyCheck: true,
    enableUnusedDependencyCheck: true
  })
  
  const result = await analyzer.analyze(projectPath)
  
  console.log('📊 项目依赖分析报告')
  console.log(`总依赖数: ${result.summary.total}`)
  console.log(`安全问题: ${result.securityIssues?.length || 0}`)
  console.log(`循环依赖: ${result.circularDependencies?.length || 0}`)
  console.log(`未使用依赖: ${result.unusedDependencies?.length || 0}`)
  
  if (result.recommendations.length > 0) {
    console.log('\n💡 优化建议:')
    result.recommendations.forEach(rec => console.log(`- ${rec}`))
  }
}
```

### 2. 构建性能优化

使用性能分析器识别和解决构建瓶颈：

```typescript
async function optimizeBuildPerformance() {
  const analyzer = new BuildPerformanceAnalyzer({
    enableMemoryTracking: true,
    enableDetailedMetrics: true
  })
  
  // 监控整个构建过程
  analyzer.startPhase('full-build')
  
  analyzer.startPhase('typescript-compilation')
  // TypeScript 编译...
  analyzer.endPhase('typescript-compilation')
  
  analyzer.startPhase('bundling')
  // 打包...
  analyzer.endPhase('bundling')
  
  analyzer.startPhase('minification')
  // 压缩...
  analyzer.endPhase('minification')
  
  analyzer.endPhase('full-build')
  
  // 生成分析报告
  const analysis = analyzer.analyze({
    includeRecommendations: true,
    includeBottlenecks: true
  })
  
  console.log('⚡ 构建性能分析')
  console.log(`总耗时: ${analysis.overall.totalDuration}ms`)
  console.log(`峰值内存: ${analysis.overall.peakMemoryUsage}MB`)
  
  if (analysis.bottlenecks.length > 0) {
    console.log('\n🐌 性能瓶颈:')
    analysis.bottlenecks.forEach(bottleneck => {
      console.log(`- ${bottleneck.phase}: ${bottleneck.duration}ms`)
    })
  }
  
  if (analysis.recommendations.length > 0) {
    console.log('\n💡 优化建议:')
    analysis.recommendations.forEach(rec => {
      console.log(`- ${rec.description}`)
    })
  }
}
```

### 3. 智能代码分割

使用代码分割优化器改善应用加载性能：

```typescript
async function optimizeCodeSplitting(projectPath: string) {
  const optimizer = new CodeSplittingOptimizer({
    strategy: 'hybrid',
    minChunkSize: 1000,
    maxChunks: 10
  })
  
  const result = await optimizer.optimize({
    rootDir: projectPath,
    entries: ['src/index.ts', 'src/admin.ts'],
    strategy: 'frequency-based'
  })
  
  console.log('📦 代码分割分析')
  console.log(`当前块数: ${result.currentStrategy.chunks?.length || 0}`)
  console.log(`推荐块数: ${result.recommendedStrategies[0]?.chunks?.length || 0}`)
  console.log(`缓存效率: ${result.metrics.cacheEfficiency}%`)
  
  // 应用推荐的分割策略
  const recommendedStrategy = result.recommendedStrategies[0]
  if (recommendedStrategy) {
    console.log(`\n推荐策略: ${recommendedStrategy.name}`)
    console.log(`描述: ${recommendedStrategy.description}`)
    
    if (recommendedStrategy.recommendations) {
      console.log('\n💡 实施建议:')
      recommendedStrategy.recommendations.forEach(rec => {
        console.log(`- ${rec}`)
      })
    }
  }
}
```

### 4. 构建缓存优化

使用缓存管理器提升重复构建的性能：

```typescript
async function setupBuildCache() {
  const cacheManager = new BuildCacheManager({
    cacheDir: '.build-cache',
    maxSize: 500 * 1024 * 1024, // 500MB
    strategy: 'lru',
    compression: true
  })
  
  // 构建前检查缓存
  const cacheKey = 'main-build-v1'
  const cached = await cacheManager.get(cacheKey)
  
  if (cached) {
    console.log('✅ 使用缓存的构建结果')
    return cached
  }
  
  console.log('🔨 执行新的构建...')
  
  // 执行构建
  const buildResult = await performBuild()
  
  // 缓存构建结果
  await cacheManager.setWithDependencies(cacheKey, buildResult, [
    'src/**/*.ts',
    'package.json',
    'tsconfig.json'
  ])
  
  // 显示缓存统计
  const stats = await cacheManager.getStats()
  console.log(`💾 缓存统计: 命中率 ${stats.hitRate}%, 大小 ${stats.size} bytes`)
  
  return buildResult
}
```

## 最佳实践

### 1. 集成到 CI/CD 流程

```yaml
# .github/workflows/build.yml
name: Build with Analysis

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Analyze bundle (Markdown)
        run: npx ldesign-builder build --report && npx ldesign-builder analyze -r dist/build-report.json -f md
        
      - name: Build
        run: npx ldesign-builder build
        
      - name: Upload analysis reports
        uses: actions/upload-artifact@v3
        with:
          name: analysis-reports
          path: reports/
```

### 2. 定期健康检查

```typescript
// scripts/health-check.ts
import { DependencyAnalyzer } from '@ldesign/builder'

async function weeklyHealthCheck() {
  const analyzer = new DependencyAnalyzer({
    enableSecurityCheck: true,
    enableUnusedDependencyCheck: true
  })
  
  const result = await analyzer.analyze(process.cwd())
  
  // 生成报告
  const report = {
    date: new Date().toISOString(),
    securityIssues: result.securityIssues?.length || 0,
    unusedDependencies: result.unusedDependencies?.length || 0,
    recommendations: result.recommendations
  }
  
  // 发送到监控系统或保存到文件
  await saveHealthReport(report)
  
  // 如果有严重问题，发送警报
  if (report.securityIssues > 0) {
    await sendAlert(`发现 ${report.securityIssues} 个安全问题`)
  }
}

// 每周运行一次
setInterval(weeklyHealthCheck, 7 * 24 * 60 * 60 * 1000)
```

### 3. 性能基准测试

```typescript
// scripts/performance-benchmark.ts
import { BuildPerformanceAnalyzer } from '@ldesign/builder'

async function runPerformanceBenchmark() {
  const analyzer = new BuildPerformanceAnalyzer()
  
  // 运行多次构建以获得平均性能数据
  const results = []
  
  for (let i = 0; i < 5; i++) {
    analyzer.reset()
    analyzer.startPhase('benchmark-build')
    
    // 执行构建
    await performCleanBuild()
    
    analyzer.endPhase('benchmark-build')
    
    const analysis = analyzer.analyze()
    results.push(analysis.overall.totalDuration)
  }
  
  const averageTime = results.reduce((a, b) => a + b, 0) / results.length
  
  console.log(`📊 性能基准测试结果:`)
  console.log(`平均构建时间: ${averageTime}ms`)
  console.log(`最快构建: ${Math.min(...results)}ms`)
  console.log(`最慢构建: ${Math.max(...results)}ms`)
  
  // 与历史数据比较
  await compareWithBaseline(averageTime)
}
```

## 故障排除

### 常见问题

1. **内存不足错误**
   ```typescript
   // 调整内存监控配置
   const analyzer = new BuildPerformanceAnalyzer({
     enableMemoryTracking: true,
     sampleInterval: 500, // 降低采样频率
     thresholds: {
       memoryLeakThreshold: 100 * 1024 * 1024 // 100MB
     }
   })
   ```

2. **缓存失效问题**
   ```typescript
   // 检查缓存状态
   const stats = await cacheManager.getStats()
   console.log('缓存统计:', stats)
   
   // 手动清理缓存
   await cacheManager.cleanup()
   ```

3. **分析超时**
   ```typescript
   // 设置超时时间
   const analyzer = new DependencyAnalyzer({
     timeout: 60000 // 60秒
   })
   ```

### 调试模式

启用详细日志以便调试：

```typescript
import { logger, LogLevel } from '@ldesign/builder'

// 设置调试级别
logger.setLevel(LogLevel.DEBUG)

// 所有分析器都会输出详细日志
const analyzer = new DependencyAnalyzer()
const result = await analyzer.analyze('/project')
```

## 下一步

- 查看 [API 文档](../api/advanced-features.md) 了解详细的接口说明
- 参考 [配置指南](../configuration.md) 学习如何配置高级功能
- 查看 [示例项目](../examples) 了解实际使用案例
