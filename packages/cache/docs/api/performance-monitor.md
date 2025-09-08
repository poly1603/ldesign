# 性能监控（Performance Monitor）

用于监控缓存相关操作的性能指标，识别慢操作并生成报告，辅助优化。

## 能力概览
- 采样记录：按采样率收集操作耗时
- 慢操作告警：超过阈值触发事件
- 统计分析：平均/最小/最大/百分位数
- 自定义收集器：上报到监控系统

## 快速上手

```ts
import { PerformanceMonitor } from '@ldesign/cache'

const monitor = new PerformanceMonitor({
  enabled: true,
  slowThreshold: 100, // 慢操作阈值（ms）
  samplingRate: 0.2,  // 20% 采样
  maxRecords: 1000,
  collector: (m) => sendToApm(m),
})

// 监听慢操作
monitor.on('slow', (m) => console.warn('慢操作:', m))

// 测量一次操作
await monitor.measure('cache.set', async () => {
  await cache.set('key', bigData)
}, { key: 'key', engine: 'localStorage', dataSize: 2048 })

// 生成报告
console.log(monitor.generateReport())
```

## API

### new PerformanceMonitor(options)
```ts
interface PerformanceMonitorOptions {
  enabled?: boolean
  slowThreshold?: number
  maxRecords?: number
  samplingRate?: number
  detailed?: boolean
  collector?: (metrics: PerformanceMetrics) => void
}
```

### measure(operation, fn, context?)
- 入参：操作名、待测函数、上下文（key/engine/dataSize）
- 返回：`Promise<T>`（透传原函数结果）

### record(metrics)
手动记录一次指标。

### getStats(filter?)
返回聚合统计：操作分布、引擎分布、慢操作列表等。

### getPercentiles([50, 75, 90, 95, 99])
返回各百分位数耗时。

### generateReport()
返回可打印的报告文本。

## 最佳实践
- 为关键路径设定合理慢操作阈值（如 100ms）
- 按需开启采样，避免过多开销（推荐 5%-20%）
- 结合日志/Tracing（如 OpenTelemetry）定位慢操作根因

