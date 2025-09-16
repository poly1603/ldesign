# 高级功能使用指南

本指南将详细介绍如何使用 @ldesign/builder 的高级功能来优化你的构建流程。

## 目录

- [依赖分析](#依赖分析)
- [性能监控](#性能监控)
- [代码分割优化](#代码分割优化)
- [缓存管理](#缓存管理)
- [集成配置](#集成配置)
- [实战案例](#实战案例)

## 依赖分析

### 基础依赖分析

依赖分析器可以帮助你了解项目的依赖结构，识别潜在问题：

```typescript
import { DependencyAnalyzer } from '@ldesign/builder'

const analyzer = new DependencyAnalyzer()
const result = await analyzer.analyze('./src')

console.log('依赖分析结果:')
console.log(`- 总依赖数: ${result.summary.total}`)
console.log(`- 生产依赖: ${result.summary.production}`)
console.log(`- 开发依赖: ${result.summary.development}`)
```

### 安全漏洞检测

启用安全检查来识别依赖包中的安全问题：

```typescript
const analyzer = new DependencyAnalyzer({
  enableSecurityCheck: true
})

const result = await analyzer.analyze('./src')

if (result.securityIssues && result.securityIssues.length > 0) {
  console.log('🚨 发现安全问题:')
  result.securityIssues.forEach(issue => {
    console.log(`- ${issue.package}: ${issue.severity} - ${issue.description}`)
  })
}
```

### 循环依赖检测

检测项目中的循环依赖问题：

```typescript
const analyzer = new DependencyAnalyzer({
  enableCircularDependencyCheck: true
})

const result = await analyzer.analyze('./src')

if (result.circularDependencies && result.circularDependencies.length > 0) {
  console.log('🔄 发现循环依赖:')
  result.circularDependencies.forEach(cycle => {
    console.log(`- ${cycle.cycle.join(' → ')}`)
  })
}
```

### 未使用依赖识别

找出项目中未使用的依赖包：

```typescript
const analyzer = new DependencyAnalyzer({
  enableUnusedDependencyCheck: true
})

const result = await analyzer.analyze('./src')

if (result.unusedDependencies && result.unusedDependencies.length > 0) {
  console.log('📦 未使用的依赖:')
  result.unusedDependencies.forEach(dep => {
    console.log(`- ${dep}`)
  })
  
  console.log('\n💡 建议: 可以安全移除这些依赖以减小包大小')
}
```

### 包大小分析

分析依赖对最终bundle大小的影响：

```typescript
const analyzer = new DependencyAnalyzer({
  enableBundleSizeAnalysis: true
})

const result = await analyzer.analyze('./src')

if (result.bundleSizeAnalysis) {
  const analysis = result.bundleSizeAnalysis
  console.log('📊 包大小分析:')
  console.log(`- 总大小: ${analysis.totalSize} bytes`)
  
  console.log('\n🏆 最大的依赖:')
  analysis.largestDependencies.forEach(dep => {
    console.log(`- ${dep.name}: ${dep.size} bytes (${dep.percentage}%)`)
  })
  
  if (analysis.nonTreeShakeable.length > 0) {
    console.log('\n⚠️ 不支持 Tree Shaking 的依赖:')
    analysis.nonTreeShakeable.forEach(dep => console.log(`- ${dep}`))
  }
}
```

## 性能监控

### 基础性能监控

使用性能分析器监控构建过程：

```typescript
import { BuildPerformanceAnalyzer } from '@ldesign/builder'

const analyzer = new BuildPerformanceAnalyzer({
  enableMemoryTracking: true
})

// 开始监控
analyzer.startPhase('build')

// 执行构建操作
await performBuild()

// 结束监控
const phaseResult = analyzer.endPhase('build')

console.log(`构建耗时: ${phaseResult.duration}ms`)
console.log(`内存使用: ${phaseResult.memoryUsage.peak}MB`)
```

### 多阶段性能监控

监控构建过程中的多个阶段：

```typescript
const analyzer = new BuildPerformanceAnalyzer()

// 监控整个构建流程
analyzer.startPhase('full-build')

// TypeScript 编译阶段
analyzer.startPhase('typescript')
await compileTypeScript()
analyzer.endPhase('typescript')

// 打包阶段
analyzer.startPhase('bundling')
await bundleCode()
analyzer.endPhase('bundling')

// 压缩阶段
analyzer.startPhase('minification')
await minifyCode()
analyzer.endPhase('minification')

analyzer.endPhase('full-build')

// 生成完整分析报告
const analysis = analyzer.analyze({
  includeRecommendations: true,
  includeBottlenecks: true
})

console.log('📊 性能分析报告:')
console.log(`总耗时: ${analysis.overall.totalDuration}ms`)
console.log(`阶段数: ${analysis.overall.phaseCount}`)

// 显示性能瓶颈
if (analysis.bottlenecks.length > 0) {
  console.log('\n🐌 性能瓶颈:')
  analysis.bottlenecks.forEach(bottleneck => {
    console.log(`- ${bottleneck.phase}: ${bottleneck.duration}ms (${bottleneck.impact})`)
  })
}

// 显示优化建议
if (analysis.recommendations.length > 0) {
  console.log('\n💡 优化建议:')
  analysis.recommendations.forEach(rec => {
    console.log(`- ${rec.description}`)
    if (rec.impact) {
      console.log(`  预期提升: ${rec.impact}`)
    }
  })
}
```

### 内存监控

详细监控内存使用情况：

```typescript
const analyzer = new BuildPerformanceAnalyzer({
  enableMemoryTracking: true,
  sampleInterval: 100 // 每100ms采样一次
})

analyzer.startPhase('memory-intensive-task')

// 执行内存密集型任务
await processLargeFiles()

analyzer.endPhase('memory-intensive-task')

// 检测内存泄漏
const memoryLeaks = analyzer.detectMemoryLeaks()
if (memoryLeaks.length > 0) {
  console.log('⚠️ 检测到可能的内存泄漏:')
  memoryLeaks.forEach(leak => {
    console.log(`- ${leak.phase}: 内存增长 ${leak.growth}MB`)
  })
}
```

## 代码分割优化

### 基础代码分割分析

分析项目的代码分割机会：

```typescript
import { CodeSplittingOptimizer } from '@ldesign/builder'

const optimizer = new CodeSplittingOptimizer()

const result = await optimizer.optimize({
  rootDir: './src',
  entries: ['src/index.ts'],
  strategy: 'frequency-based'
})

console.log('📦 代码分割分析:')
console.log(`当前策略: ${result.currentStrategy.name}`)
console.log(`当前块数: ${result.currentStrategy.chunks?.length || 0}`)

// 显示推荐策略
result.recommendedStrategies.forEach((strategy, index) => {
  console.log(`\n推荐策略 ${index + 1}: ${strategy.name}`)
  console.log(`描述: ${strategy.description}`)
  console.log(`块数: ${strategy.chunks?.length || 0}`)
  console.log(`缓存效率: ${strategy.benefits.cacheEfficiency}%`)
})
```

### 不同分割策略对比

比较不同的代码分割策略：

```typescript
const strategies = ['frequency-based', 'feature-based', 'hybrid'] as const

for (const strategy of strategies) {
  const result = await optimizer.optimize({
    rootDir: './src',
    entries: ['src/index.ts'],
    strategy
  })
  
  const recommended = result.recommendedStrategies[0]
  if (recommended) {
    console.log(`\n📊 ${strategy} 策略:`)
    console.log(`- 块数: ${recommended.chunks?.length || 0}`)
    console.log(`- 缓存效率: ${recommended.benefits.cacheEfficiency}%`)
    console.log(`- 并行加载: ${recommended.benefits.parallelLoading}%`)
    console.log(`- 包大小: ${recommended.benefits.bundleSize}%`)
  }
}
```

### 应用分割建议

将分析结果应用到实际构建配置中：

```typescript
const result = await optimizer.optimize({
  rootDir: './src',
  entries: ['src/index.ts'],
  strategy: 'hybrid'
})

// 生成 Rollup 手动分块配置
function generateManualChunks(result: SplittingAnalysisResult) {
  const manualChunks: Record<string, string[]> = {}
  
  const recommendedStrategy = result.recommendedStrategies[0]
  if (recommendedStrategy?.chunks) {
    recommendedStrategy.chunks.forEach(chunk => {
      if (chunk.type !== 'entry') {
        manualChunks[chunk.name] = chunk.modules
      }
    })
  }
  
  return manualChunks
}

// 在构建配置中使用
export default defineConfig({
  input: 'src/index.ts',
  rollupOptions: {
    output: {
      manualChunks: generateManualChunks(result)
    }
  }
})
```

## 缓存管理

### 基础缓存使用

设置和使用构建缓存：

```typescript
import { BuildCacheManager } from '@ldesign/builder'

const cacheManager = new BuildCacheManager({
  cacheDir: '.build-cache',
  maxSize: 100 * 1024 * 1024, // 100MB
  strategy: 'lru'
})

// 检查缓存
const cacheKey = 'main-build'
const cached = await cacheManager.get(cacheKey)

if (cached) {
  console.log('✅ 使用缓存结果')
  return cached
}

// 执行构建
console.log('🔨 执行新构建...')
const buildResult = await performBuild()

// 缓存结果
await cacheManager.set(cacheKey, buildResult, {
  ttl: 3600 // 1小时过期
})

return buildResult
```

### 依赖跟踪缓存

使用依赖跟踪来自动管理缓存失效：

```typescript
// 设置带依赖跟踪的缓存
await cacheManager.setWithDependencies('build-result', buildResult, [
  'src/**/*.ts',
  'package.json',
  'tsconfig.json',
  'builder.config.ts'
])

// 当任何依赖文件变化时，缓存会自动失效
// 例如，当 src/utils.ts 文件变化时：
await cacheManager.invalidateByDependency('src/utils.ts')
```

### 缓存统计和优化

监控缓存性能并进行优化：

```typescript
// 获取缓存统计
const stats = await cacheManager.getStats()

console.log('💾 缓存统计:')
console.log(`- 命中率: ${stats.hitRate}%`)
console.log(`- 缓存大小: ${formatBytes(stats.size)}`)
console.log(`- 条目数: ${stats.entryCount}`)
console.log(`- 命中次数: ${stats.hits}`)
console.log(`- 未命中次数: ${stats.misses}`)

// 如果命中率过低，考虑调整缓存策略
if (stats.hitRate < 50) {
  console.log('⚠️ 缓存命中率较低，建议检查缓存键的生成逻辑')
}

// 定期清理过期缓存
await cacheManager.cleanup()

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}
```

## 集成配置

### 配置文件集成

在构建配置文件中启用所有高级功能：

```typescript
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs'],
  
  // 高级功能配置
  advanced: {
    // 依赖分析
    dependencyAnalysis: {
      enabled: true,
      enableSecurityCheck: true,
      enableBundleSizeAnalysis: true,
      enableCircularDependencyCheck: true,
      enableUnusedDependencyCheck: true,
      excludePackages: ['@types/*'] // 排除类型包
    },
    
    // 性能分析
    performanceAnalysis: {
      enabled: true,
      enableMemoryTracking: true,
      enableDetailedMetrics: true,
      sampleInterval: 100,
      thresholds: {
        slowPhaseThreshold: 5000, // 5秒
        memoryLeakThreshold: 50 * 1024 * 1024 // 50MB
      }
    },
    
    // 代码分割优化
    codeSplitting: {
      enabled: true,
      strategy: 'hybrid',
      minChunkSize: 1000,
      maxChunkSize: 50000,
      maxChunks: 20,
      analyzeDependencies: true
    },
    
    // 缓存管理
    caching: {
      enabled: true,
      cacheDir: '.build-cache',
      maxSize: 500 * 1024 * 1024, // 500MB
      strategy: 'lru',
      compression: true,
      cleanupInterval: 3600 // 1小时
    }
  }
})
```

### 环境特定配置

为不同环境配置不同的高级功能：

```typescript
import { defineConfig } from '@ldesign/builder'

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',
  
  advanced: {
    dependencyAnalysis: {
      enabled: true,
      // 开发环境启用所有检查
      enableSecurityCheck: isDevelopment,
      enableUnusedDependencyCheck: isDevelopment
    },
    
    performanceAnalysis: {
      enabled: true,
      // 生产环境启用详细监控
      enableDetailedMetrics: isProduction,
      enableMemoryTracking: isProduction
    },
    
    codeSplitting: {
      enabled: isProduction, // 只在生产环境启用
      strategy: 'hybrid'
    },
    
    caching: {
      enabled: true,
      // 开发环境使用更小的缓存
      maxSize: isDevelopment ? 100 * 1024 * 1024 : 500 * 1024 * 1024
    }
  }
})
```

## 实战案例

### 案例1：大型 React 项目优化

```typescript
// 针对大型 React 项目的完整优化流程
async function optimizeReactProject() {
  console.log('🚀 开始优化大型 React 项目...')
  
  // 1. 依赖分析
  const depAnalyzer = new DependencyAnalyzer({
    enableSecurityCheck: true,
    enableBundleSizeAnalysis: true,
    excludePackages: ['@types/*', 'react-scripts']
  })
  
  const depResult = await depAnalyzer.analyze('./src')
  
  // 2. 代码分割优化
  const splittingOptimizer = new CodeSplittingOptimizer({
    strategy: 'feature-based', // React 项目适合按功能分割
    minChunkSize: 2000,
    maxChunks: 15
  })
  
  const splittingResult = await splittingOptimizer.optimize({
    rootDir: './src',
    entries: ['src/index.tsx'],
    strategy: 'feature-based'
  })
  
  // 3. 性能监控构建
  const perfAnalyzer = new BuildPerformanceAnalyzer({
    enableMemoryTracking: true
  })
  
  perfAnalyzer.startPhase('react-build')
  
  // 应用优化后的构建配置
  const buildResult = await build({
    input: 'src/index.tsx',
    formats: ['esm'],
    rollupOptions: {
      output: {
        manualChunks: generateReactChunks(splittingResult)
      }
    }
  })
  
  perfAnalyzer.endPhase('react-build')
  
  // 4. 生成优化报告
  const perfAnalysis = perfAnalyzer.analyze()
  
  console.log('📊 优化结果:')
  console.log(`- 构建时间: ${perfAnalysis.overall.totalDuration}ms`)
  console.log(`- 安全问题: ${depResult.securityIssues?.length || 0}`)
  console.log(`- 未使用依赖: ${depResult.unusedDependencies?.length || 0}`)
  console.log(`- 代码块数: ${splittingResult.recommendedStrategies[0]?.chunks?.length || 0}`)
  
  return {
    buildResult,
    analysis: {
      dependencies: depResult,
      splitting: splittingResult,
      performance: perfAnalysis
    }
  }
}

function generateReactChunks(result: SplittingAnalysisResult) {
  const chunks: Record<string, string[]> = {}
  
  // React 项目的典型分块策略
  chunks.vendor = ['react', 'react-dom']
  chunks.ui = ['@mui/material', 'antd', 'styled-components']
  chunks.utils = ['lodash', 'moment', 'axios']
  
  // 应用分析结果
  const recommended = result.recommendedStrategies[0]
  if (recommended?.chunks) {
    recommended.chunks.forEach(chunk => {
      if (chunk.type === 'feature') {
        chunks[chunk.name] = chunk.modules
      }
    })
  }
  
  return chunks
}
```

### 案例2：Node.js 库项目优化

```typescript
// 针对 Node.js 库项目的优化
async function optimizeNodeLibrary() {
  console.log('📚 开始优化 Node.js 库项目...')
  
  // 1. 依赖分析 - 重点关注安全性和包大小
  const depAnalyzer = new DependencyAnalyzer({
    enableSecurityCheck: true,
    enableBundleSizeAnalysis: true,
    enableUnusedDependencyCheck: true
  })
  
  const depResult = await depAnalyzer.analyze('./src')
  
  // 2. 缓存优化 - 库项目构建频繁，缓存很重要
  const cacheManager = new BuildCacheManager({
    strategy: 'lru',
    maxSize: 200 * 1024 * 1024, // 200MB
    compression: true
  })
  
  const cacheKey = `lib-build-${Date.now()}`
  const cached = await cacheManager.get(cacheKey)
  
  if (!cached) {
    // 3. 性能监控
    const perfAnalyzer = new BuildPerformanceAnalyzer()
    
    perfAnalyzer.startPhase('lib-build')
    
    const buildResult = await build({
      input: 'src/index.ts',
      formats: ['esm', 'cjs'],
      dts: true,
      external: Object.keys(depResult.dependencies)
    })
    
    perfAnalyzer.endPhase('lib-build')
    
    // 缓存构建结果
    await cacheManager.setWithDependencies(cacheKey, {
      buildResult,
      analysis: perfAnalyzer.analyze()
    }, [
      'src/**/*.ts',
      'package.json',
      'tsconfig.json'
    ])
    
    return buildResult
  }
  
  console.log('✅ 使用缓存的构建结果')
  return cached.buildResult
}
```

这些实战案例展示了如何在真实项目中应用高级功能来解决具体的构建优化问题。根据项目类型和需求，你可以选择性地启用和配置这些功能。
