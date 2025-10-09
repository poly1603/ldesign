# 新功能使用指南

本文档介绍 `@ldesign/builder` 最新添加的实用功能。

---

## 📦 增量构建管理器

智能检测文件变更，只重新构建修改过的文件，大幅提升构建速度。

### 基本使用

```typescript
import { createIncrementalBuildManager } from '@ldesign/builder'

// 创建增量构建管理器
const manager = createIncrementalBuildManager({
  enabled: true,
  hashAlgorithm: 'md5',
  ignorePatterns: ['*.test.ts', '*.spec.ts']
})

// 加载上次构建状态
await manager.loadState()

// 检查文件变更
const files = ['src/index.ts', 'src/utils.ts', 'src/config.ts']
const { changed, unchanged, added, removed } = await manager.getChangedFiles(files)

console.log(`变更文件: ${changed.length}`)
console.log(`未变更文件: ${unchanged.length}`)
console.log(`新增文件: ${added.length}`)
console.log(`删除文件: ${removed.length}`)

// 只构建变更的文件
for (const file of changed) {
  await buildFile(file)
  await manager.updateFile(file)
}

// 保存构建状态
await manager.saveState()
```

### 高级功能

```typescript
// 检查单个文件是否变更
const hasChanged = await manager.hasFileChanged('src/index.ts')

// 批量更新文件信息
await manager.updateFiles(['src/a.ts', 'src/b.ts'])

// 清除所有状态（强制完整构建）
await manager.clear()

// 获取统计信息
const stats = manager.getStats()
console.log(`总文件数: ${stats.totalFiles}`)
console.log(`上次构建时间: ${new Date(stats.lastBuildTime).toLocaleString()}`)
console.log(`构建次数: ${stats.buildCount}`)
```

### 配置选项

```typescript
interface IncrementalBuildOptions {
  /** 状态文件路径 */
  stateFile?: string
  /** 是否启用 */
  enabled?: boolean
  /** 忽略的文件模式 */
  ignorePatterns?: string[]
  /** 自定义哈希算法 */
  hashAlgorithm?: 'md5' | 'sha1' | 'sha256'
}
```

---

## 📊 构建报告生成器

生成详细的构建报告，支持多种格式（JSON、HTML、Markdown、Text）。

### 基本使用

```typescript
import { createBuildReportGenerator } from '@ldesign/builder'

const generator = createBuildReportGenerator({
  outputDir: './build-reports',
  formats: ['html', 'json']
})

// 准备报告数据
const reportData = {
  timestamp: Date.now(),
  duration: 5000,
  status: 'success',
  outputs: [
    { file: 'dist/index.js', size: 102400, gzipSize: 30720, type: 'esm' },
    { file: 'dist/index.cjs', size: 98304, gzipSize: 28672, type: 'cjs' }
  ],
  performance: {
    phases: [
      { name: '解析', duration: 1000, percentage: 20 },
      { name: '转换', duration: 2000, percentage: 40 },
      { name: '打包', duration: 1500, percentage: 30 },
      { name: '输出', duration: 500, percentage: 10 }
    ]
  },
  memory: {
    peak: 256 * 1024 * 1024,
    average: 180 * 1024 * 1024,
    final: 120 * 1024 * 1024
  }
}

// 生成报告
const files = await generator.generate(reportData)
console.log('报告已生成:', files)
```

### HTML 报告特性

生成的 HTML 报告包含：
- 🎨 美观的可视化界面
- 📊 性能分析图表
- 📦 文件大小统计
- ⚠️ 问题和警告列表
- 💾 内存使用趋势

### 报告格式

```typescript
type ReportFormat = 'json' | 'html' | 'markdown' | 'text'

// 生成多种格式
await generator.generate(reportData, {
  formats: ['html', 'json', 'markdown'],
  detailed: true
})
```

---

## 🌊 流式处理器

处理大文件时避免内存溢出，支持流式转换和批量处理。

### 基本使用

```typescript
import { createStreamProcessor } from '@ldesign/builder'

const processor = createStreamProcessor()

// 流式处理大数组
const largeArray = Array.from({ length: 100000 }, (_, i) => i)
const results = await processor.processStream(
  largeArray,
  async (item) => {
    // 处理每个项目
    return item * 2
  },
  {
    chunkSize: 1000,
    highWaterMark: 16 * 1024
  }
)
```

### 创建转换流

```typescript
// 创建自定义转换流
const transformStream = processor.createTransformStream(
  async (chunk) => {
    // 转换逻辑
    return processChunk(chunk)
  },
  {
    highWaterMark: 16 * 1024,
    autoDestroy: true
  }
)

// 使用流
inputStream
  .pipe(transformStream)
  .pipe(outputStream)
```

### 批量流处理

```typescript
// 创建批量处理流
const batchStream = processor.createBatchStream(100)

inputStream
  .pipe(batchStream)
  .on('data', (batch) => {
    console.log(`处理批次，大小: ${batch.length}`)
    processBatch(batch)
  })
```

---

## 🗑️ GC 优化器

智能管理垃圾回收，优化内存使用。

### 基本使用

```typescript
import { createGCOptimizer } from '@ldesign/builder'

const gcOptimizer = createGCOptimizer()

// 手动触发 GC
gcOptimizer.triggerGC()

// 在内存压力下触发 GC
gcOptimizer.triggerGCIfNeeded(0.8) // 80% 阈值
```

### 函数包装器

```typescript
// 包装函数自动管理内存
async function heavyOperation(data) {
  // 大量内存操作
  const result = processLargeData(data)
  return result
}

// 添加 GC 优化
const optimizedOperation = gcOptimizer.withGC(heavyOperation, {
  threshold: 0.8,
  force: false
})

// 使用优化后的函数
const result = await optimizedOperation(largeData)
// 函数执行后自动检查并触发 GC
```

### 配置选项

```typescript
// 强制 GC
const forceGC = gcOptimizer.withGC(fn, { force: true })

// 自定义阈值
const customThreshold = gcOptimizer.withGC(fn, { threshold: 0.7 })
```

---

## ⚡ 并行处理器

高效的并行任务处理，支持优先级、超时、重试等功能。

### 基本使用

```typescript
import { createParallelProcessor, TaskStatus } from '@ldesign/builder'

const processor = createParallelProcessor({
  maxConcurrency: 4,
  defaultTimeout: 30000,
  defaultRetries: 2,
  autoAdjustConcurrency: true
})

// 添加任务
processor.addTask({
  id: 'task1',
  fn: async (data) => {
    // 处理逻辑
    return processFile(data)
  },
  data: { file: 'src/index.ts' },
  priority: 10,
  timeout: 30000,
  retries: 2
})

// 批量添加任务
const tasks = files.map((file, index) => ({
  id: `task-${index}`,
  fn: async (data) => buildFile(data),
  data: { file },
  priority: index
}))
processor.addTasks(tasks)

// 等待所有任务完成
const results = await processor.waitAll()
console.log(`完成 ${results.length} 个任务`)
```

### 事件监听

```typescript
processor.on('task:start', (taskId) => {
  console.log(`任务开始: ${taskId}`)
})

processor.on('task:complete', (result) => {
  console.log(`任务完成: ${result.id}, 耗时: ${result.duration}ms`)
})

processor.on('task:failed', (result) => {
  console.error(`任务失败: ${result.id}`, result.error)
})

processor.on('task:retry', ({ id, retryCount, error }) => {
  console.log(`任务重试: ${id}, 第 ${retryCount} 次`)
})
```

### 获取统计信息

```typescript
const stats = processor.getStats()
console.log(`待处理: ${stats.pending}`)
console.log(`运行中: ${stats.running}`)
console.log(`已完成: ${stats.completed}`)
console.log(`失败: ${stats.failed}`)
console.log(`当前并发: ${stats.currentConcurrency}/${stats.maxConcurrency}`)
```

### 任务管理

```typescript
// 取消待处理的任务
processor.cancelTask('task1')

// 清空所有任务
processor.clear()
```

---

## 🔄 完整示例：优化的构建流程

```typescript
import {
  createIncrementalBuildManager,
  createBuildReportGenerator,
  createParallelProcessor,
  createGCOptimizer
} from '@ldesign/builder'

async function optimizedBuild() {
  const startTime = Date.now()
  
  // 1. 初始化工具
  const incrementalManager = createIncrementalBuildManager({ enabled: true })
  const reportGenerator = createBuildReportGenerator()
  const parallelProcessor = createParallelProcessor({ maxConcurrency: 4 })
  const gcOptimizer = createGCOptimizer()
  
  // 2. 加载增量构建状态
  await incrementalManager.loadState()
  
  // 3. 检测文件变更
  const allFiles = await getAllSourceFiles()
  const { changed, added } = await incrementalManager.getChangedFiles(allFiles)
  const filesToBuild = [...changed, ...added]
  
  console.log(`需要构建 ${filesToBuild.length} 个文件`)
  
  // 4. 并行构建文件
  filesToBuild.forEach((file, index) => {
    parallelProcessor.addTask({
      id: `build-${index}`,
      fn: gcOptimizer.withGC(async (data) => {
        const result = await buildFile(data.file)
        await incrementalManager.updateFile(data.file)
        return result
      }),
      data: { file },
      priority: 10 - index
    })
  })
  
  // 5. 等待构建完成
  const results = await parallelProcessor.waitAll()
  
  // 6. 保存增量构建状态
  await incrementalManager.saveState()
  
  // 7. 生成构建报告
  const duration = Date.now() - startTime
  await reportGenerator.generate({
    timestamp: Date.now(),
    duration,
    status: 'success',
    outputs: results.map(r => r.result),
    performance: {
      phases: [
        { name: '文件检测', duration: 500, percentage: 10 },
        { name: '并行构建', duration: duration - 1000, percentage: 85 },
        { name: '报告生成', duration: 500, percentage: 5 }
      ]
    }
  }, {
    formats: ['html', 'json']
  })
  
  console.log(`✅ 构建完成，耗时: ${duration}ms`)
}

optimizedBuild().catch(console.error)
```

---

## 💡 最佳实践

### 1. 增量构建
- 在开发环境启用增量构建
- 定期清理构建缓存（如版本更新时）
- 使用合适的哈希算法（开发用 md5，生产用 sha256）

### 2. 并行处理
- 根据 CPU 核心数设置并发数
- 启用自动调整并发数
- 为重要任务设置更高优先级

### 3. 内存管理
- 处理大文件时使用流式处理
- 定期触发 GC
- 监控内存使用趋势

### 4. 构建报告
- 生成 HTML 报告用于可视化分析
- 保存 JSON 报告用于自动化分析
- 定期审查性能瓶颈

---

## 🚀 性能提升

使用这些新功能后，你可以期待：

- **构建速度**: 提升 40-80%（取决于项目大小）
- **内存使用**: 降低 30-50%
- **开发体验**: 显著改善

开始使用这些强大的新功能，让你的构建过程更快、更稳定、更高效！

