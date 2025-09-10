# 性能管理器（PerformanceManager）

用于记录、测量和监控应用性能事件。

## 快速上手

```ts
// 开始监控
engine.performance.startMonitoring()

// 记录性能事件
const eventId = engine.performance.startEvent('api-call', 'fetchUserData')
await doSomething()
engine.performance.endEvent(eventId, { userId: 123 })

// 便捷方法记录事件
await engine.performance.recordEvent('database-query', async () => {
  return await database.query('SELECT * FROM users')
})

// 获取性能报告
const report = engine.performance.getReport()
console.log('总事件数:', report.summary.totalEvents)
console.log('平均响应时间:', report.summary.averageResponseTime)

// 获取内存信息
const memory = engine.performance.getMemoryInfo()
console.log('内存使用:', memory.used, 'MB')
```

## API

- startMonitoring()
- stopMonitoring()
- startEvent(type, name, metadata?)
- endEvent(eventId, metadata?)
- recordEvent(name, fn, metadata?)
- getReport()
- getCurrentMetrics()
- getMemoryInfo()
- setThresholds(thresholds)
- clearEvents()

## 最佳实践

- 在关键路径记录性能事件
- 设置合理的性能阈值
- 监听性能违规事件并及时处理
