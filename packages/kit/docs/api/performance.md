# Performance 性能监控

Performance 模块提供了性能测试和监控工具，支持基准测试、性能分析、内存监控和 CPU 使用率统计。

## 导入方式

```typescript
// 完整导入
import { PerformanceMonitor, PerformanceUtils, Benchmark } from '@ldesign/kit'

// 按需导入
import { PerformanceMonitor } from '@ldesign/kit/performance'

// 单独导入
import { PerformanceMonitor, PerformanceUtils } from '@ldesign/kit'
```

## PerformanceMonitor

性能监控器类，提供完整的性能监控和分析功能。

### 创建实例

#### `create(options?: PerformanceOptions): PerformanceMonitor`

创建性能监控器实例。

```typescript
// 默认配置
const monitor = PerformanceMonitor.create()

// 自定义配置
const monitor = PerformanceMonitor.create({
  enabled: true, // 启用监控
  sampleRate: 0.1, // 采样率
  maxMetrics: 1000, // 最大指标数
  enableMemory: true, // 启用内存监控
  enableCPU: true, // 启用 CPU 监控
  enableGC: true, // 启用 GC 监控
  flushInterval: 60000, // 刷新间隔（毫秒）
  storage: {
    // 存储配置
    type: 'memory', // memory | file | database
    path: './performance.log',
  },
})
```

### 计时器

#### `startTimer(name: string): void`

开始计时。

```typescript
// 基本计时
monitor.startTimer('database-query')
const users = await fetchUsers()
const duration = monitor.endTimer('database-query')
console.log(`数据库查询耗时: ${duration}ms`)

// 嵌套计时
monitor.startTimer('api-request')
monitor.startTimer('auth-check')
await checkAuthentication()
monitor.endTimer('auth-check')

monitor.startTimer('data-fetch')
const data = await fetchData()
monitor.endTimer('data-fetch')

monitor.endTimer('api-request')
```

#### `endTimer(name: string): number`

结束计时并返回耗时。

```typescript
monitor.startTimer('file-processing')
await processLargeFile()
const duration = monitor.endTimer('file-processing')

if (duration > 5000) {
  console.warn(`文件处理耗时过长: ${duration}ms`)
}
```

#### `time<T>(name: string, fn: () => Promise<T>): Promise<T>`

计时函数执行。

```typescript
// 异步函数计时
const result = await monitor.time('api-call', async () => {
  const response = await fetch('/api/data')
  return response.json()
})

// 同步函数计时
const processedData = await monitor.time('data-processing', async () => {
  return data.map(item => processItem(item))
})
```

### 基准测试

#### `benchmark(name: string, fn: () => any, options?: BenchmarkOptions): Promise<BenchmarkResult>`

执行基准测试。

```typescript
// 基本基准测试
const result = await monitor.benchmark(
  'array-sort',
  () => {
    const arr = Array.from({ length: 10000 }, () => Math.random())
    return arr.sort()
  },
  {
    iterations: 100, // 迭代次数
    warmup: 10, // 预热次数
    timeout: 30000, // 超时时间
  }
)

console.log('基准测试结果:')
console.log(`平均耗时: ${result.mean}ms`)
console.log(`最小耗时: ${result.min}ms`)
console.log(`最大耗时: ${result.max}ms`)
console.log(`标准差: ${result.stdDev}ms`)
console.log(`每秒操作数: ${result.opsPerSecond}`)

// 比较不同算法
const quickSortResult = await monitor.benchmark(
  'quick-sort',
  () => {
    return quickSort(generateArray(1000))
  },
  { iterations: 50 }
)

const mergeSortResult = await monitor.benchmark(
  'merge-sort',
  () => {
    return mergeSort(generateArray(1000))
  },
  { iterations: 50 }
)

console.log(`快速排序: ${quickSortResult.mean}ms`)
console.log(`归并排序: ${mergeSortResult.mean}ms`)
```

#### `compareBenchmarks(benchmarks: BenchmarkComparison[]): Promise<ComparisonResult>`

比较多个基准测试。

```typescript
const comparison = await monitor.compareBenchmarks([
  {
    name: 'for-loop',
    fn: () => {
      let sum = 0
      for (let i = 0; i < 10000; i++) {
        sum += i
      }
      return sum
    },
  },
  {
    name: 'reduce',
    fn: () => {
      return Array.from({ length: 10000 }, (_, i) => i).reduce((sum, i) => sum + i, 0)
    },
  },
  {
    name: 'forEach',
    fn: () => {
      let sum = 0
      Array.from({ length: 10000 }, (_, i) => i).forEach(i => (sum += i))
      return sum
    },
  },
])

console.log('性能比较结果:')
comparison.results.forEach(result => {
  console.log(`${result.name}: ${result.mean}ms (${result.relativePerformance}x)`)
})
console.log(`最快的方法: ${comparison.fastest}`)
console.log(`最慢的方法: ${comparison.slowest}`)
```

### 内存监控

#### `getMemoryUsage(): MemoryUsage`

获取内存使用情况。

```typescript
const memoryUsage = monitor.getMemoryUsage()

console.log('内存使用情况:')
console.log(`RSS: ${memoryUsage.rss} bytes`)
console.log(`堆总大小: ${memoryUsage.heapTotal} bytes`)
console.log(`堆已使用: ${memoryUsage.heapUsed} bytes`)
console.log(`外部内存: ${memoryUsage.external} bytes`)
console.log(`数组缓冲区: ${memoryUsage.arrayBuffers} bytes`)

// 格式化显示
console.log(`堆使用率: ${((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2)}%`)
```

#### `trackMemoryUsage(interval?: number): void`

跟踪内存使用变化。

```typescript
// 开始内存跟踪
monitor.trackMemoryUsage(1000) // 每秒记录一次

// 执行一些操作
const largeArray = new Array(1000000).fill(0)
await processLargeData(largeArray)

// 获取内存使用历史
const memoryHistory = monitor.getMemoryHistory()
console.log('内存使用历史:', memoryHistory)

// 停止跟踪
monitor.stopMemoryTracking()
```

#### `detectMemoryLeaks(): Promise<MemoryLeakReport>`

检测内存泄漏。

```typescript
const leakReport = await monitor.detectMemoryLeaks()

if (leakReport.hasLeaks) {
  console.warn('检测到可能的内存泄漏:')
  leakReport.leaks.forEach(leak => {
    console.log(`- ${leak.type}: ${leak.description}`)
    console.log(`  增长率: ${leak.growthRate}MB/s`)
    console.log(`  持续时间: ${leak.duration}ms`)
  })
} else {
  console.log('未检测到内存泄漏')
}
```

### CPU 监控

#### `getCPUUsage(): Promise<CPUUsage>`

获取 CPU 使用率。

```typescript
const cpuUsage = await monitor.getCPUUsage()

console.log('CPU 使用情况:')
console.log(`用户态: ${cpuUsage.user}%`)
console.log(`系统态: ${cpuUsage.system}%`)
console.log(`空闲: ${cpuUsage.idle}%`)
console.log(`总使用率: ${cpuUsage.total}%`)
```

#### `trackCPUUsage(interval?: number): void`

跟踪 CPU 使用率变化。

```typescript
// 开始 CPU 跟踪
monitor.trackCPUUsage(1000) // 每秒记录一次

// 执行 CPU 密集型操作
await performCPUIntensiveTask()

// 获取 CPU 使用历史
const cpuHistory = monitor.getCPUHistory()
console.log('CPU 使用历史:', cpuHistory)

// 停止跟踪
monitor.stopCPUTracking()
```

### 性能指标

#### `recordMetric(name: string, value: number, tags?: Record<string, string>): void`

记录自定义性能指标。

```typescript
// 记录响应时间
monitor.recordMetric('api.response_time', 150, {
  endpoint: '/api/users',
  method: 'GET',
})

// 记录吞吐量
monitor.recordMetric('api.throughput', 1000, {
  endpoint: '/api/data',
  unit: 'requests_per_second',
})

// 记录错误率
monitor.recordMetric('api.error_rate', 0.02, {
  endpoint: '/api/upload',
  unit: 'percentage',
})
```

#### `getMetrics(name?: string): PerformanceMetric[]`

获取性能指标。

```typescript
// 获取所有指标
const allMetrics = monitor.getMetrics()

// 获取特定指标
const responseTimeMetrics = monitor.getMetrics('api.response_time')

responseTimeMetrics.forEach(metric => {
  console.log(`${metric.name}: ${metric.value} (${metric.timestamp})`)
})
```

#### `getMetricsSummary(name: string): MetricsSummary`

获取指标统计摘要。

```typescript
const summary = monitor.getMetricsSummary('api.response_time')

console.log('响应时间统计:')
console.log(`平均值: ${summary.mean}ms`)
console.log(`中位数: ${summary.median}ms`)
console.log(`95分位: ${summary.p95}ms`)
console.log(`99分位: ${summary.p99}ms`)
console.log(`最小值: ${summary.min}ms`)
console.log(`最大值: ${summary.max}ms`)
console.log(`标准差: ${summary.stdDev}ms`)
console.log(`样本数: ${summary.count}`)
```

## PerformanceUtils

性能工具函数类，提供常用的性能测试工具。

### 快速测试

#### `measureTime<T>(fn: () => T): { result: T, duration: number }`

测量函数执行时间。

```typescript
const { result, duration } = PerformanceUtils.measureTime(() => {
  return expensiveCalculation()
})

console.log(`计算结果: ${result}`)
console.log(`执行时间: ${duration}ms`)
```

#### `measureAsyncTime<T>(fn: () => Promise<T>): Promise<{ result: T, duration: number }>`

测量异步函数执行时间。

```typescript
const { result, duration } = await PerformanceUtils.measureAsyncTime(async () => {
  const response = await fetch('/api/data')
  return response.json()
})

console.log(`API 响应: ${JSON.stringify(result)}`)
console.log(`请求时间: ${duration}ms`)
```

#### `quickBenchmark(fn: () => any, iterations?: number): BenchmarkResult`

快速基准测试。

```typescript
const result = PerformanceUtils.quickBenchmark(() => {
  return Math.sqrt(Math.random() * 1000000)
}, 10000)

console.log(`平均执行时间: ${result.mean}ms`)
console.log(`每秒操作数: ${result.opsPerSecond}`)
```

### 性能分析

#### `profileFunction<T>(fn: () => T, options?: ProfileOptions): ProfileResult<T>`

分析函数性能。

```typescript
const profile = PerformanceUtils.profileFunction(
  () => {
    return complexAlgorithm(largeDataSet)
  },
  {
    includeMemory: true,
    includeCPU: true,
  }
)

console.log('性能分析结果:')
console.log(`执行时间: ${profile.duration}ms`)
console.log(`内存使用: ${profile.memoryUsage}MB`)
console.log(`CPU 使用: ${profile.cpuUsage}%`)
console.log(`返回值: ${profile.result}`)
```

#### `comparePerformance(functions: NamedFunction[]): ComparisonResult`

比较多个函数的性能。

```typescript
const comparison = PerformanceUtils.comparePerformance([
  {
    name: 'bubble-sort',
    fn: () => bubbleSort([...testArray]),
  },
  {
    name: 'quick-sort',
    fn: () => quickSort([...testArray]),
  },
  {
    name: 'native-sort',
    fn: () => [...testArray].sort((a, b) => a - b),
  },
])

console.log('性能比较:')
comparison.results.forEach(result => {
  console.log(`${result.name}: ${result.mean}ms`)
})
console.log(`最快: ${comparison.fastest}`)
```

## 实际应用示例

### API 性能监控

```typescript
class APIPerformanceMonitor {
  private monitor = PerformanceMonitor.create({
    enableMemory: true,
    enableCPU: true,
    flushInterval: 30000,
  })

  async monitorAPIEndpoint(endpoint: string, handler: Function) {
    return async (req: any, res: any, next: any) => {
      const startTime = Date.now()
      const timerName = `api.${endpoint}.${req.method}`

      this.monitor.startTimer(timerName)

      try {
        const result = await handler(req, res, next)

        const duration = this.monitor.endTimer(timerName)

        // 记录成功指标
        this.monitor.recordMetric('api.response_time', duration, {
          endpoint,
          method: req.method,
          status: 'success',
        })

        this.monitor.recordMetric('api.requests_total', 1, {
          endpoint,
          method: req.method,
          status: 'success',
        })

        // 检查性能阈值
        if (duration > 1000) {
          console.warn(`慢查询警告: ${endpoint} 耗时 ${duration}ms`)
        }

        return result
      } catch (error) {
        const duration = this.monitor.endTimer(timerName)

        // 记录错误指标
        this.monitor.recordMetric('api.response_time', duration, {
          endpoint,
          method: req.method,
          status: 'error',
        })

        this.monitor.recordMetric('api.errors_total', 1, {
          endpoint,
          method: req.method,
          error: error.name,
        })

        throw error
      }
    }
  }

  async generatePerformanceReport() {
    const responseTimeMetrics = this.monitor.getMetrics('api.response_time')
    const errorMetrics = this.monitor.getMetrics('api.errors_total')

    const endpointStats = new Map()

    // 分析响应时间
    responseTimeMetrics.forEach(metric => {
      const endpoint = metric.tags?.endpoint
      if (!endpoint) return

      if (!endpointStats.has(endpoint)) {
        endpointStats.set(endpoint, {
          endpoint,
          totalRequests: 0,
          totalErrors: 0,
          responseTimes: [],
        })
      }

      const stats = endpointStats.get(endpoint)
      stats.totalRequests++
      stats.responseTimes.push(metric.value)
    })

    // 分析错误
    errorMetrics.forEach(metric => {
      const endpoint = metric.tags?.endpoint
      if (!endpoint) return

      const stats = endpointStats.get(endpoint)
      if (stats) {
        stats.totalErrors += metric.value
      }
    })

    // 生成报告
    const report = Array.from(endpointStats.values()).map(stats => {
      const responseTimes = stats.responseTimes.sort((a, b) => a - b)
      const mean = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)]
      const errorRate = stats.totalErrors / stats.totalRequests

      return {
        endpoint: stats.endpoint,
        totalRequests: stats.totalRequests,
        errorRate: errorRate,
        avgResponseTime: mean,
        p95ResponseTime: p95,
        maxResponseTime: Math.max(...responseTimes),
        minResponseTime: Math.min(...responseTimes),
      }
    })

    return report
  }
}
```

### 数据库查询优化

```typescript
class DatabaseQueryOptimizer {
  private monitor = PerformanceMonitor.create()

  async optimizeQuery(queryName: string, queries: QueryVariant[]) {
    console.log(`开始优化查询: ${queryName}`)

    const results = []

    for (const variant of queries) {
      console.log(`测试查询变体: ${variant.name}`)

      const benchmarkResult = await this.monitor.benchmark(
        `query.${queryName}.${variant.name}`,
        async () => {
          return await variant.execute()
        },
        {
          iterations: 10,
          warmup: 2,
        }
      )

      results.push({
        name: variant.name,
        description: variant.description,
        ...benchmarkResult,
      })
    }

    // 分析结果
    results.sort((a, b) => a.mean - b.mean)

    console.log(`\n查询优化结果 (${queryName}):`)
    results.forEach((result, index) => {
      const performance = index === 0 ? '最快' : `慢 ${(result.mean / results[0].mean).toFixed(2)}x`
      console.log(`${index + 1}. ${result.name}: ${result.mean.toFixed(2)}ms (${performance})`)
      console.log(`   ${result.description}`)
    })

    return results[0] // 返回最快的查询
  }

  async analyzeSlowQueries(threshold: number = 1000) {
    const metrics = this.monitor.getMetrics('query')
    const slowQueries = metrics.filter(metric => metric.value > threshold)

    if (slowQueries.length === 0) {
      console.log('未发现慢查询')
      return
    }

    console.log(`发现 ${slowQueries.length} 个慢查询:`)

    const queryStats = new Map()

    slowQueries.forEach(metric => {
      const queryName = metric.name.split('.')[1]
      if (!queryStats.has(queryName)) {
        queryStats.set(queryName, {
          name: queryName,
          count: 0,
          totalTime: 0,
          maxTime: 0,
          times: [],
        })
      }

      const stats = queryStats.get(queryName)
      stats.count++
      stats.totalTime += metric.value
      stats.maxTime = Math.max(stats.maxTime, metric.value)
      stats.times.push(metric.value)
    })

    Array.from(queryStats.values())
      .sort((a, b) => b.totalTime - a.totalTime)
      .forEach(stats => {
        const avgTime = stats.totalTime / stats.count
        console.log(
          `- ${stats.name}: 平均 ${avgTime.toFixed(2)}ms, 最大 ${stats.maxTime}ms, 次数 ${stats.count}`
        )
      })
  }
}
```

### 前端性能监控

```typescript
class FrontendPerformanceMonitor {
  private monitor = PerformanceMonitor.create()

  monitorPageLoad() {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming

      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        total: navigation.loadEventEnd - navigation.navigationStart,
      }

      Object.entries(metrics).forEach(([name, value]) => {
        this.monitor.recordMetric(`page.${name}`, value, {
          url: window.location.pathname,
        })
      })

      console.log('页面加载性能指标:', metrics)
    })
  }

  monitorResourceLoading() {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming

          this.monitor.recordMetric('resource.load_time', resource.duration, {
            type: this.getResourceType(resource.name),
            url: resource.name,
          })

          if (resource.duration > 1000) {
            console.warn(`慢资源加载: ${resource.name} (${resource.duration}ms)`)
          }
        }
      })
    })

    observer.observe({ entryTypes: ['resource'] })
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js)$/)) return 'script'
    if (url.match(/\.(css)$/)) return 'stylesheet'
    if (url.match(/\.(png|jpg|jpeg|gif|svg)$/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font'
    return 'other'
  }

  measureComponentRender(componentName: string, renderFn: () => void) {
    return this.monitor.time(`component.${componentName}.render`, renderFn)
  }
}
```

## 类型定义

```typescript
interface PerformanceOptions {
  enabled?: boolean
  sampleRate?: number
  maxMetrics?: number
  enableMemory?: boolean
  enableCPU?: boolean
  enableGC?: boolean
  flushInterval?: number
  storage?: {
    type: 'memory' | 'file' | 'database'
    path?: string
  }
}

interface BenchmarkOptions {
  iterations?: number
  warmup?: number
  timeout?: number
}

interface BenchmarkResult {
  name: string
  iterations: number
  mean: number
  min: number
  max: number
  stdDev: number
  opsPerSecond: number
  samples: number[]
}

interface MemoryUsage {
  rss: number
  heapTotal: number
  heapUsed: number
  external: number
  arrayBuffers: number
}

interface CPUUsage {
  user: number
  system: number
  idle: number
  total: number
}

interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
}

interface MetricsSummary {
  name: string
  count: number
  mean: number
  median: number
  min: number
  max: number
  stdDev: number
  p95: number
  p99: number
}
```

## 最佳实践

1. **采样策略**: 在生产环境中使用适当的采样率
2. **性能阈值**: 设置合理的性能警告阈值
3. **内存监控**: 定期检查内存使用情况，防止内存泄漏
4. **基准测试**: 使用基准测试验证优化效果
5. **持续监控**: 建立持续的性能监控体系

## 示例应用

查看 [使用示例](/examples/performance-monitoring) 了解更多性能监控的实际应用场景。
