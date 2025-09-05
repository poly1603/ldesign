# 性能管理器（PerformanceManager）

用于标记、测量和监控应用性能。

## 快速上手

```ts
// 标记
engine.performance.mark('op-start')
await doSomething()
engine.performance.mark('op-end')

// 测量
engine.performance.measure('op', 'op-start', 'op-end')

// 获取指标
const metrics = engine.performance.getMetrics?.()
const memory = engine.performance.getMemoryInfo?.()
```

## API（示例）

- mark(name)
- measure(name, start, end)
- startMonitoring()
- stopMonitoring()
- getMetrics()
- getMemoryInfo()

## 最佳实践

- 在关键路径添加性能标记
- 给出预算阈值，超出则报警
