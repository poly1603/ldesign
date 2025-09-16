# 高级功能 API

@ldesign/builder 提供了一系列高级功能模块，用于深度分析和优化构建过程。这些功能包括智能依赖分析、构建性能监控、代码分割优化和构建缓存管理。

## 智能依赖分析器 (DependencyAnalyzer)

智能依赖分析器可以深度分析项目中的依赖关系，识别潜在问题并提供优化建议。

### 基本用法

```typescript
import { DependencyAnalyzer } from '@ldesign/builder'

const analyzer = new DependencyAnalyzer({
  enableSecurityCheck: true,
  enableBundleSizeAnalysis: true,
  enableCircularDependencyCheck: true,
  enableUnusedDependencyCheck: true
})

// 分析项目依赖
const result = await analyzer.analyze('/path/to/project')
```

### 配置选项

```typescript
interface DependencyAnalysisConfig {
  /** 是否启用安全检查 */
  enableSecurityCheck?: boolean
  
  /** 是否启用包大小分析 */
  enableBundleSizeAnalysis?: boolean
  
  /** 是否启用循环依赖检查 */
  enableCircularDependencyCheck?: boolean
  
  /** 是否启用未使用依赖检查 */
  enableUnusedDependencyCheck?: boolean
  
  /** 排除的依赖包 */
  excludePackages?: string[]
  
  /** 自定义安全规则 */
  securityRules?: SecurityRule[]
}
```

### 分析结果

```typescript
interface DependencyAnalysisResult {
  /** 依赖信息列表 */
  dependencies: DependencyInfo[]
  
  /** 依赖统计摘要 */
  summary: {
    total: number
    production: number
    development: number
    peer: number
    optional: number
  }
  
  /** 安全漏洞信息 */
  securityIssues?: SecurityIssue[]
  
  /** 循环依赖信息 */
  circularDependencies?: CircularDependency[]
  
  /** 未使用的依赖 */
  unusedDependencies?: string[]
  
  /** 包大小分析 */
  bundleSizeAnalysis?: {
    totalSize: number
    largestDependencies: Array<{
      name: string
      size: number
      percentage: number
    }>
    treeShakeable: string[]
    nonTreeShakeable: string[]
  }
  
  /** 优化建议 */
  recommendations: string[]
}
```

### 高级功能

```typescript
// 检查特定依赖的安全性
const securityResult = await analyzer.checkSecurity('lodash@4.17.20')

// 分析依赖的包大小影响
const sizeImpact = await analyzer.analyzeBundleSize(['react', 'lodash'])

// 检测循环依赖
const circularDeps = await analyzer.detectCircularDependencies('/src')

// 识别未使用的依赖
const unusedDeps = await analyzer.findUnusedDependencies('/src')
```

## 构建性能分析器 (BuildPerformanceAnalyzer)

构建性能分析器提供详细的构建过程监控和性能分析，帮助识别构建瓶颈。

### 基本用法

```typescript
import { BuildPerformanceAnalyzer } from '@ldesign/builder'

const analyzer = new BuildPerformanceAnalyzer({
  enableMemoryTracking: true,
  enableDetailedMetrics: true,
  sampleInterval: 100
})

// 开始监控构建阶段
analyzer.startPhase('compilation')

// 执行构建操作...

// 结束监控
const phaseResult = analyzer.endPhase('compilation')

// 生成完整分析报告
const analysis = analyzer.analyze({
  includeRecommendations: true,
  includeBottlenecks: true
})
```

### 配置选项

```typescript
interface PerformanceAnalysisConfig {
  /** 是否启用内存跟踪 */
  enableMemoryTracking?: boolean
  
  /** 是否启用详细指标 */
  enableDetailedMetrics?: boolean
  
  /** 内存采样间隔（毫秒） */
  sampleInterval?: number
  
  /** 性能阈值配置 */
  thresholds?: {
    slowPhaseThreshold?: number
    memoryLeakThreshold?: number
    bottleneckThreshold?: number
  }
}
```

### 分析结果

```typescript
interface PerformanceAnalysisResult {
  /** 总体性能指标 */
  overall: {
    totalDuration: number
    peakMemoryUsage: number
    averageMemoryUsage: number
    phaseCount: number
  }
  
  /** 各阶段性能详情 */
  phases: PhasePerformance[]
  
  /** 性能瓶颈 */
  bottlenecks: PerformanceBottleneck[]
  
  /** 优化建议 */
  recommendations: PerformanceRecommendation[]
  
  /** 内存使用趋势 */
  memoryTrend?: MemoryUsagePoint[]
  
  /** 性能评分 */
  score: {
    overall: number
    speed: number
    memory: number
    stability: number
  }
}
```

### 阶段管理

```typescript
// 监控多个嵌套阶段
analyzer.startPhase('build')
analyzer.startPhase('compilation')
analyzer.startPhase('typescript')

// TypeScript 编译...
analyzer.endPhase('typescript')

analyzer.startPhase('bundling')
// 打包...
analyzer.endPhase('bundling')

analyzer.endPhase('compilation')
analyzer.endPhase('build')

// 获取特定阶段的性能数据
const compilationPerf = analyzer.getPhasePerformance('compilation')
```

### 内存监控

```typescript
// 启用内存监控
analyzer.enableMemoryTracking()

// 手动记录内存快照
analyzer.recordMemorySnapshot('before-large-operation')

// 执行大型操作...

analyzer.recordMemorySnapshot('after-large-operation')

// 检测内存泄漏
const memoryLeaks = analyzer.detectMemoryLeaks()
```

## 代码分割优化器 (CodeSplittingOptimizer)

代码分割优化器分析项目结构，提供智能的代码分割策略建议。

### 基本用法

```typescript
import { CodeSplittingOptimizer } from '@ldesign/builder'

const optimizer = new CodeSplittingOptimizer({
  strategy: 'hybrid',
  minChunkSize: 1000,
  maxChunks: 10
})

// 分析并优化代码分割
const result = await optimizer.optimize({
  rootDir: '/path/to/project',
  entries: ['src/index.ts', 'src/main.ts'],
  strategy: 'frequency-based'
})
```

### 配置选项

```typescript
interface OptimizationOptions {
  /** 项目根目录 */
  rootDir: string
  
  /** 入口文件 */
  entries: string[]
  
  /** 分割策略 */
  strategy?: 'frequency-based' | 'feature-based' | 'hybrid'
  
  /** 最小块大小 (bytes) */
  minChunkSize?: number
  
  /** 最大块大小 (bytes) */
  maxChunkSize?: number
  
  /** 最大块数量 */
  maxChunks?: number
  
  /** 是否分析依赖关系 */
  analyzeDependencies?: boolean
  
  /** 排除的文件模式 */
  excludePatterns?: string[]
}
```

### 分析结果

```typescript
interface SplittingAnalysisResult {
  /** 模块信息 */
  modules: ModuleInfo[]

  /** 当前分割策略 */
  currentStrategy: SplittingStrategy

  /** 推荐的分割策略 */
  recommendedStrategies: SplittingStrategy[]

  /** 优化机会 */
  optimizations: {
    duplicateCode: Array<{
      modules: string[]
      size: number
      suggestion: string
    }>
    unusedExports: Array<{
      module: string
      exports: string[]
      potentialSavings: number
    }>
    circularDependencies: Array<{
      cycle: string[]
      impact: string
    }>
  }

  /** 性能指标 */
  metrics: {
    totalSize: number
    chunkCount: number
    averageChunkSize: number
    cacheEfficiency: number
    loadingPerformance: number
  }
}
```

### 分割策略

```typescript
// 基于频率的分割策略
const frequencyStrategy = await optimizer.generateFrequencyBasedStrategy({
  rootDir: '/project',
  entries: ['src/index.ts']
})

// 基于功能的分割策略
const featureStrategy = await optimizer.generateFeatureBasedStrategy({
  rootDir: '/project',
  entries: ['src/index.ts']
})

// 混合分割策略
const hybridStrategy = await optimizer.generateHybridStrategy({
  rootDir: '/project',
  entries: ['src/index.ts']
})
```

## 构建缓存管理器 (BuildCacheManager)

构建缓存管理器提供智能的构建缓存功能，显著提升重复构建的性能。

### 基本用法

```typescript
import { BuildCacheManager } from '@ldesign/builder'

const cacheManager = new BuildCacheManager({
  cacheDir: '.cache',
  maxSize: 100 * 1024 * 1024, // 100MB
  strategy: 'lru',
  compression: true
})

// 设置缓存
await cacheManager.set('build-key', buildResult, {
  ttl: 3600, // 1小时过期
  dependencies: ['src/index.ts', 'package.json']
})

// 获取缓存
const cached = await cacheManager.get('build-key')

// 检查缓存是否存在
const exists = await cacheManager.has('build-key')
```

### 配置选项

```typescript
interface CacheConfig {
  /** 缓存目录 */
  cacheDir?: string

  /** 最大缓存大小 (bytes) */
  maxSize?: number

  /** 最大缓存条目数 */
  maxEntries?: number

  /** 缓存策略 */
  strategy?: 'lru' | 'lfu' | 'fifo'

  /** 是否启用压缩 */
  compression?: boolean

  /** 是否启用加密 */
  encryption?: boolean

  /** 清理间隔 (秒) */
  cleanupInterval?: number
}
```

### 高级功能

```typescript
// 批量操作
await cacheManager.setMultiple([
  { key: 'key1', value: data1, options: { ttl: 3600 } },
  { key: 'key2', value: data2, options: { ttl: 7200 } }
])

const results = await cacheManager.getMultiple(['key1', 'key2'])

// 依赖跟踪
await cacheManager.setWithDependencies('build-result', result, [
  'src/**/*.ts',
  'package.json',
  'tsconfig.json'
])

// 当依赖文件变化时，相关缓存会自动失效
await cacheManager.invalidateByDependency('src/utils.ts')

// 缓存统计
const stats = await cacheManager.getStats()
console.log(`缓存命中率: ${stats.hitRate}%`)
console.log(`缓存大小: ${stats.size} bytes`)

// 清理过期缓存
await cacheManager.cleanup()

// 清空所有缓存
await cacheManager.clear()
```

### 缓存策略

```typescript
// LRU (Least Recently Used) 策略
const lruCache = new BuildCacheManager({
  strategy: 'lru',
  maxEntries: 1000
})

// LFU (Least Frequently Used) 策略
const lfuCache = new BuildCacheManager({
  strategy: 'lfu',
  maxEntries: 1000
})

// FIFO (First In, First Out) 策略
const fifoCache = new BuildCacheManager({
  strategy: 'fifo',
  maxEntries: 1000
})
```

## 集成使用示例

### 完整的构建优化流程

```typescript
import {
  DependencyAnalyzer,
  BuildPerformanceAnalyzer,
  CodeSplittingOptimizer,
  BuildCacheManager,
  build
} from '@ldesign/builder'

async function optimizedBuild(options: BuildOptions) {
  // 1. 初始化分析器和管理器
  const depAnalyzer = new DependencyAnalyzer({
    enableSecurityCheck: true,
    enableBundleSizeAnalysis: true
  })

  const perfAnalyzer = new BuildPerformanceAnalyzer({
    enableMemoryTracking: true
  })

  const splittingOptimizer = new CodeSplittingOptimizer()

  const cacheManager = new BuildCacheManager({
    strategy: 'lru',
    compression: true
  })

  // 2. 检查缓存
  const cacheKey = generateCacheKey(options)
  const cached = await cacheManager.get(cacheKey)

  if (cached) {
    console.log('使用缓存的构建结果')
    return cached
  }

  // 3. 分析依赖
  perfAnalyzer.startPhase('dependency-analysis')
  const depAnalysis = await depAnalyzer.analyze(options.input)
  perfAnalyzer.endPhase('dependency-analysis')

  // 4. 优化代码分割
  perfAnalyzer.startPhase('code-splitting-optimization')
  const splittingAnalysis = await splittingOptimizer.optimize({
    rootDir: process.cwd(),
    entries: [options.input],
    strategy: 'hybrid'
  })
  perfAnalyzer.endPhase('code-splitting-optimization')

  // 5. 执行构建
  perfAnalyzer.startPhase('build')
  const buildResult = await build({
    ...options,
    // 应用代码分割优化
    rollupOptions: {
      output: {
        manualChunks: generateManualChunks(splittingAnalysis)
      }
    }
  })
  perfAnalyzer.endPhase('build')

  // 6. 生成性能报告
  const perfAnalysis = perfAnalyzer.analyze({
    includeRecommendations: true
  })

  // 7. 缓存结果
  await cacheManager.set(cacheKey, {
    buildResult,
    depAnalysis,
    splittingAnalysis,
    perfAnalysis
  }, {
    ttl: 3600,
    dependencies: [options.input, 'package.json']
  })

  return {
    buildResult,
    analysis: {
      dependencies: depAnalysis,
      splitting: splittingAnalysis,
      performance: perfAnalysis
    }
  }
}

function generateCacheKey(options: BuildOptions): string {
  // 基于构建选项生成缓存键
  return `build-${JSON.stringify(options)}`
}

function generateManualChunks(analysis: SplittingAnalysisResult) {
  // 基于分析结果生成手动分块配置
  const chunks: Record<string, string[]> = {}

  analysis.recommendedStrategies[0]?.chunks?.forEach(chunk => {
    chunks[chunk.name] = chunk.modules
  })

  return chunks
}
```

### 监控和报告

```typescript
// 生成综合分析报告
async function generateAnalysisReport(projectPath: string) {
  const depAnalyzer = new DependencyAnalyzer()
  const perfAnalyzer = new BuildPerformanceAnalyzer()
  const splittingOptimizer = new CodeSplittingOptimizer()

  // 执行各种分析
  const [depResult, splittingResult] = await Promise.all([
    depAnalyzer.analyze(projectPath),
    splittingOptimizer.analyze({
      rootDir: projectPath,
      entries: ['src/index.ts']
    })
  ])

  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    project: projectPath,
    dependencies: {
      total: depResult.summary.total,
      securityIssues: depResult.securityIssues?.length || 0,
      unusedDependencies: depResult.unusedDependencies?.length || 0,
      recommendations: depResult.recommendations
    },
    codeSplitting: {
      currentChunks: splittingResult.currentStrategy.chunks?.length || 0,
      recommendedChunks: splittingResult.recommendedStrategies[0]?.chunks?.length || 0,
      optimizationOpportunities: Object.keys(splittingResult.optimizations).length,
      cacheEfficiency: splittingResult.metrics.cacheEfficiency
    },
    recommendations: [
      ...depResult.recommendations,
      ...splittingResult.recommendedStrategies.flatMap(s => s.recommendations || [])
    ]
  }

  return report
}
```

## 错误处理

所有高级功能模块都提供了完善的错误处理机制：

```typescript
import {
  DependencyAnalysisError,
  PerformanceAnalysisError,
  CodeSplittingError,
  CacheError
} from '@ldesign/builder'

try {
  const result = await analyzer.analyze('/project/path')
} catch (error) {
  if (error instanceof DependencyAnalysisError) {
    console.error('依赖分析失败:', error.message)
    console.error('错误代码:', error.code)
  } else if (error instanceof PerformanceAnalysisError) {
    console.error('性能分析失败:', error.message)
  }
  // 处理其他错误类型...
}
```

## 配置集成

这些高级功能可以通过构建配置文件进行集成：

```typescript
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  outDir: 'dist',

  // 启用高级功能
  advanced: {
    dependencyAnalysis: {
      enabled: true,
      enableSecurityCheck: true,
      enableBundleSizeAnalysis: true
    },

    performanceAnalysis: {
      enabled: true,
      enableMemoryTracking: true,
      enableDetailedMetrics: true
    },

    codeSplitting: {
      enabled: true,
      strategy: 'hybrid',
      minChunkSize: 1000
    },

    caching: {
      enabled: true,
      strategy: 'lru',
      maxSize: 100 * 1024 * 1024
    }
  }
})
```
```
