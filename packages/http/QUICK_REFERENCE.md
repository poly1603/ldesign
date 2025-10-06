# @ldesign/http 快速参考

## 📚 优化相关文档

### 核心文档
- **[性能优化报告](./PERFORMANCE_IMPROVEMENTS.md)** - 详细的优化实施报告
- **[优化方案](./OPTIMIZATION.md)** - 完整的优化方案和计划
- **[功能改进](./IMPROVEMENTS.md)** - 新增功能说明

### 测试和验证
- **[性能测试](./tests/unit/performance.test.ts)** - 性能基准测试
- **[基准测试脚本](./scripts/benchmark.js)** - 性能基准测试脚本

## 🎯 主要优化点

### 1. 拦截器管理器 (40% 内存优化)
```typescript
// 优化：紧凑数组 + ID 映射
const manager = new InterceptorManagerImpl()
manager.use(interceptor) // 高效添加
manager.eject(id)        // 真正删除，无内存泄漏
manager.size()           // 获取数量
```

### 2. 缓存键生成 (60% 性能提升)
```typescript
// 优化：自动缓存，避免重复计算
const generator = new DeduplicationKeyGenerator()
const key = generator.generate(config) // 首次计算
const key2 = generator.generate(config) // 从缓存获取
```

### 3. 监控系统 (50% 内存优化)
```typescript
// 优化：采样 + 统计缓存
const client = createHttpClient({
  monitor: {
    enabled: true,
    enableSampling: true,    // 启用采样
    samplingRate: 0.1,       // 10% 采样率
    slowRequestThreshold: 3000
  }
})
```

### 4. 缓存存储 (35% 内存优化)
```typescript
// 优化：单个定时器批量清理
const storage = new MemoryCacheStorage()
await storage.set(key, value, ttl) // 不再为每个项创建定时器
```

### 5. 连接池 (40% CPU 优化)
```typescript
// 优化：事件驱动替代轮询
const client = createHttpClient({
  connectionPool: {
    maxConnections: 10,
    keepAlive: true
  }
})
```

### 6. 优先级队列 (30% CPU 优化)
```typescript
// 优化：按需检查，降低频率
const client = createHttpClient({
  priorityQueue: {
    maxConcurrent: 6,
    priorityBoost: true,
    boostInterval: 5000
  }
})
```

## 📊 性能对比

### 内存占用
| 模块 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 拦截器 | 100% | 60% | 40% ↓ |
| 缓存 | 100% | 65% | 35% ↓ |
| 监控 | 100% | 50% | 50% ↓ |
| **整体** | **100%** | **65%** | **35% ↓** |

### 执行性能
| 操作 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 拦截器遍历 | 100ms | 75ms | 25% ↑ |
| 缓存键生成 | 100ms | 40ms | 60% ↑ |
| 统计查询 | 100ms | 20ms | 80% ↑ |

## 🔧 最佳实践

### 1. 高负载场景
```typescript
const client = createHttpClient({
  // 启用采样，减少监控开销
  monitor: {
    enabled: true,
    enableSampling: true,
    samplingRate: 0.1
  },
  
  // 控制并发
  concurrency: {
    maxConcurrent: 10,
    deduplication: true
  },
  
  // 使用连接池
  connectionPool: {
    maxConnections: 10,
    keepAlive: true
  }
})
```

### 2. 内存敏感场景
```typescript
const client = createHttpClient({
  // 限制缓存大小
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 300000
  },
  
  // 限制监控指标数量
  monitor: {
    enabled: true,
    maxMetrics: 500
  }
})
```

### 3. 性能优先场景
```typescript
const client = createHttpClient({
  // 禁用不必要的功能
  monitor: {
    enabled: false // 生产环境可考虑禁用
  },
  
  // 使用优先级队列
  priorityQueue: {
    maxConcurrent: 6,
    priorityBoost: true
  }
})
```

## 🧪 性能测试

### 运行基准测试
```bash
# 构建项目
pnpm build

# 运行基准测试
node scripts/benchmark.js
```

### 运行单元测试
```bash
# 运行所有测试
pnpm test

# 运行性能测试
pnpm test performance.test.ts
```

## 📈 监控和调试

### 获取性能统计
```typescript
const client = createHttpClient({
  monitor: { enabled: true }
})

// 发送一些请求...

// 获取统计信息
const stats = client.getPerformanceStats()
console.log('平均响应时间:', stats.averageDuration)
console.log('P95延迟:', stats.p95Duration)
console.log('错误率:', stats.errorRate)
console.log('缓存命中率:', stats.cacheHitRate)
```

### 获取连接池状态
```typescript
const poolStats = client.getConnectionPoolStats()
console.log('活跃连接:', poolStats.activeConnections)
console.log('连接复用率:', poolStats.connectionReuse)
```

### 获取并发状态
```typescript
const status = client.getConcurrencyStatus()
console.log('活跃请求:', status.activeCount)
console.log('队列请求:', status.queuedCount)
console.log('去重统计:', status.deduplication)
```

## 🎓 优化技巧

### 1. 减少对象创建
```typescript
// ❌ 不好：每次创建新对象
const config = { ...baseConfig, ...userConfig }

// ✅ 好：只在必要时创建
const config = userConfig.headers 
  ? { ...baseConfig, headers: { ...baseConfig.headers, ...userConfig.headers } }
  : { ...baseConfig, ...userConfig }
```

### 2. 使用缓存
```typescript
// ❌ 不好：重复计算
function getStats() {
  return calculateStats() // 每次都计算
}

// ✅ 好：缓存结果
private statsCache?: Stats
function getStats() {
  return this.statsCache ??= calculateStats()
}
```

### 3. 批量处理
```typescript
// ❌ 不好：逐个处理
for (const item of items) {
  await processItem(item)
}

// ✅ 好：批量处理
await Promise.all(items.map(processItem))
```

### 4. 延迟初始化
```typescript
// ❌ 不好：立即创建
private cache = new CacheManager()

// ✅ 好：延迟创建
private _cache?: CacheManager
get cache() {
  return this._cache ??= new CacheManager()
}
```

## 🔗 相关链接

- [GitHub 仓库](https://github.com/ldesign/http)
- [问题反馈](https://github.com/ldesign/http/issues)
- [贡献指南](./CONTRIBUTING.md)
- [更新日志](./CHANGELOG.md)

## 📝 版本信息

- **当前版本**: v0.2.0
- **发布日期**: 2025-01-09
- **主要改进**: 性能优化和功能增强

---

**提示**: 如果您在使用过程中发现任何性能问题或有优化建议，欢迎提交 Issue 或 PR！

