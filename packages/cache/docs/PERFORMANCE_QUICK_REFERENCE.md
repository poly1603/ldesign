# 性能优化快速参考指南

快速查找性能优化相关的 API、配置和最佳实践。

## 📖 目录

- [批量操作](#批量操作)
- [性能测试](#性能测试)
- [配置优化](#配置优化)
- [监控指标](#监控指标)
- [常见问题](#常见问题)

---

## 批量操作

### 批量设置

```typescript
import { batchSet } from '@ldesign/cache/utils'

// 使用对象
await batchSet(cache, {
  'user:1': userData1,
  'user:2': userData2,
  'user:3': userData3
})

// 使用 Map
const items = new Map([
  ['user:1', userData1],
  ['user:2', userData2]
])
await batchSet(cache, items, { concurrency: 5 })
```

### 批量获取

```typescript
import { batchGet } from '@ldesign/cache/utils'

const keys = ['user:1', 'user:2', 'user:3']
const results = await batchGet(cache, keys)

// 遍历结果
for (const [key, value] of results) {
  console.log(key, value)
}
```

### 批量删除

```typescript
import { batchRemove } from '@ldesign/cache/utils'

const keys = ['user:1', 'user:2', 'user:3']
const result = await batchRemove(cache, keys)

console.log('成功:', result.success)
console.log('失败:', result.failed)
```

### 批量检查

```typescript
import { batchHas } from '@ldesign/cache/utils'

const keys = ['user:1', 'user:2', 'user:3']
const results = await batchHas(cache, keys)

for (const [key, exists] of results) {
  console.log(`${key} 存在:`, exists)
}
```

### 链式批量操作

```typescript
import { BatchHelper } from '@ldesign/cache/utils'

const helper = new BatchHelper(cache)

const result = await helper
  .withConcurrency(10)  // 设置并发数
  .set('key1', 'value1')
  .set('key2', 'value2', { ttl: 3600 })
  .remove('oldKey')
  .execute()

console.log('总操作数:', result.total)
console.log('成功:', result.success)
console.log('失败:', result.failed)
```

---

## 性能测试

### 运行标准基准测试

```typescript
import { runStandardBenchmarks } from '@ldesign/cache/benchmark'

const cache = createCacheManager({ storage: 'memory' })
await runStandardBenchmarks(cache)
```

### 自定义基准测试

```typescript
import { createBenchmark } from '@ldesign/cache/benchmark'

const benchmark = createBenchmark(cache)

// 运行单个测试
const result = await benchmark.run(
  async (cache, index) => {
    await cache.set(`key-${index}`, `value-${index}`)
  },
  {
    name: 'Set操作测试',
    operations: 1000,    // 执行 1000 次操作
    warmup: 100,         // 预热 100 次
    measureMemory: true  // 测量内存使用
  }
)

console.log('吞吐量:', result.opsPerSecond, 'ops/sec')
console.log('平均延迟:', result.avgLatency, 'ms')
console.log('P99延迟:', result.p99Latency, 'ms')
```

### 批量运行测试

```typescript
const tests = [
  {
    name: 'Set操作',
    fn: async (cache, index) => {
      await cache.set(`key-${index}`, `value-${index}`)
    }
  },
  {
    name: 'Get操作',
    fn: async (cache, index) => {
      await cache.get(`key-${index}`)
    },
    config: { operations: 2000 }  // 自定义操作数
  }
]

const results = await benchmark.runSuite(tests)

// 生成报告
console.log(benchmark.generateReport())
```

### 对比测试结果

```typescript
const baseline = await benchmark.run(testFn, { name: 'Baseline' })
// ... 进行优化 ...
const optimized = await benchmark.run(testFn, { name: 'Optimized' })

console.log(benchmark.compare(baseline, optimized))
```

---

## 配置优化

### Memory 引擎配置

```typescript
const cache = createCacheManager({
  storage: 'memory',
  memory: {
    maxSize: 100 * 1024 * 1024,  // 100MB
    maxItems: 10000,              // 最多 10000 项
    evictionStrategy: 'LRU',      // 淘汰策略: LRU, LFU, FIFO
    cleanupInterval: 60000        // 清理间隔: 60秒
  }
})
```

### 淘汰策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| `LRU` | 最近最少使用 | 通用场景（推荐） |
| `LFU` | 最不经常使用 | 热点数据访问 |
| `FIFO` | 先进先出 | 时间序列数据 |

```typescript
// 动态更改策略
cache.setEvictionStrategy('LFU')
```

### 批量操作配置

```typescript
await batchSet(cache, items, {
  concurrency: 10,      // 并发数
  ttl: 3600 * 1000,    // TTL（毫秒）
  onProgress: (progress) => {
    console.log(`进度: ${progress.completed}/${progress.total}`)
  }
})
```

---

## 监控指标

### 获取缓存统计

```typescript
const stats = await cache.getStats()

console.log('总项数:', stats.items)
console.log('总大小:', stats.size, 'bytes')
console.log('命中率:', (stats.hitRate * 100).toFixed(2), '%')
console.log('命中次数:', stats.hits)
console.log('未命中次数:', stats.misses)
```

### 监控性能指标

```typescript
// 定期监控
setInterval(async () => {
  const stats = await cache.getStats()
  
  // 检查命中率
  if (stats.hitRate < 0.5) {
    console.warn('⚠️  命中率过低:', stats.hitRate)
  }
  
  // 检查容量
  const usagePercent = (stats.size / maxSize) * 100
  if (usagePercent > 90) {
    console.warn('⚠️  缓存接近满载:', usagePercent.toFixed(2), '%')
  }
}, 60000)  // 每分钟检查一次
```

### 获取引擎特定统计

```typescript
// Memory 引擎统计
const memoryStats = await cache.engine.getStorageStats()

console.log('过期项数:', memoryStats.expiredItems)
console.log('最旧项:', memoryStats.oldestItem)
console.log('最新项:', memoryStats.newestItem)

// 淘汰统计
const evictionStats = cache.engine.getEvictionStats()

console.log('淘汰次数:', evictionStats.totalEvictions)
console.log('淘汰策略:', evictionStats.strategy)
```

---

## 常见问题

### Q: 如何提高批量操作性能？

**A**: 使用批量操作 API 而不是循环调用单个操作：

```typescript
// ❌ 慢
for (const item of items) {
  await cache.set(item.key, item.value)
}

// ✅ 快 (2-6x)
await cache.mset(items)
```

### Q: 缓存命中率低怎么办？

**A**: 检查以下方面：

1. **TTL 设置**: 是否过短？
2. **缓存容量**: 是否太小导致频繁淘汰？
3. **访问模式**: 是否符合缓存策略？

```typescript
// 调整配置
const cache = createCacheManager({
  memory: {
    maxSize: 200 * 1024 * 1024,  // 增加容量
    evictionStrategy: 'LFU'       // 改用 LFU
  }
})

// 延长 TTL
await cache.set('key', 'value', { ttl: 3600 * 1000 })
```

### Q: 内存使用过高怎么办？

**A**: 优化策略：

```typescript
// 1. 设置更小的最大容量
memory: {
  maxSize: 50 * 1024 * 1024,
  maxItems: 5000
}

// 2. 手动清理
await cache.cleanup()

// 3. 使用压缩（如果数据较大）
// TODO: 压缩功能待实现
```

### Q: 如何测试生产环境性能？

**A**: 使用基准测试工具：

```typescript
// 仅在非生产环境运行
if (process.env.NODE_ENV !== 'production') {
  const benchmark = createBenchmark(cache)
  
  // 模拟生产负载
  await benchmark.run(
    async (cache, index) => {
      // 模拟实际操作
      await cache.set(`real-key-${index}`, realData)
    },
    {
      name: 'Production Simulation',
      operations: 10000
    }
  )
  
  console.log(benchmark.generateReport())
}
```

### Q: 批量操作中如何处理错误？

**A**: 批量操作会继续执行，失败的操作会被记录：

```typescript
const result = await batchSet(cache, items)

// 检查失败的操作
if (result.failed.length > 0) {
  console.error('以下操作失败:')
  result.failed.forEach(({ key, error }) => {
    console.error(`  ${key}:`, error.message)
  })
  
  // 重试失败的操作
  const failedItems = result.failed.map(f => f.key)
  await batchSet(cache, failedItems)
}
```

### Q: 如何选择合适的淘汰策略？

**A**: 根据访问模式选择：

| 访问模式 | 推荐策略 | 原因 |
|---------|---------|------|
| 最近访问的数据更重要 | LRU | 自动保留热数据 |
| 频繁访问的数据更重要 | LFU | 基于访问频率 |
| 时间顺序重要 | FIFO | 保持时间顺序 |
| 不确定 | LRU | 通用场景最佳 |

```typescript
// 测试不同策略
for (const strategy of ['LRU', 'LFU', 'FIFO']) {
  cache.setEvictionStrategy(strategy)
  const benchmark = createBenchmark(cache)
  
  const result = await benchmark.run(workload, {
    name: `Strategy: ${strategy}`
  })
  
  console.log(`${strategy}:`, result.opsPerSecond, 'ops/sec')
}
```

---

## 性能检查清单

### 部署前检查

- [ ] 配置了合适的 `maxSize` 和 `maxItems`
- [ ] 选择了合适的淘汰策略
- [ ] TTL 设置合理
- [ ] 批量操作使用批量 API
- [ ] 运行了性能基准测试
- [ ] 设置了监控和告警

### 运行时监控

- [ ] 定期检查命中率
- [ ] 监控内存使用
- [ ] 跟踪淘汰次数
- [ ] 记录性能指标
- [ ] 分析慢操作

### 优化建议

- [ ] 使用批量操作替代循环
- [ ] 根据数据大小选择存储引擎
- [ ] 合理设置 TTL
- [ ] 定期清理过期数据
- [ ] 监控并调整配置

---

## 快速链接

- [完整性能优化文档](./PERFORMANCE_OPTIMIZATIONS.md)
- [优化总结报告](./OPTIMIZATION_SUMMARY.md)
- [批量操作工具源码](../src/utils/batch-helpers.ts)
- [性能测试工具源码](../src/benchmark/performance-benchmark.ts)
- [使用示例](../examples/)

---

**提示**: 本指南提供快速参考，详细说明请查看完整文档。
