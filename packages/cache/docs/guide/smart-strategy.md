# 智能策略

## 🧠 什么是智能策略

智能策略是 @ldesign/cache 的核心创新功能，它能够根据数据特征自动选择最适合的存储引擎，无需开发者手动
指定。

## 🎯 策略原理

### 决策因素

智能策略综合考虑以下因素来选择存储引擎：

1. **数据大小** - 根据数据体积选择合适的存储方式
2. **TTL 时长** - 根据数据生存时间优化存储位置
3. **数据类型** - 根据数据结构选择最优引擎
4. **访问频率** - 根据预期访问模式优化性能
5. **安全需求** - 根据数据敏感性选择安全级别

### 评分算法

```typescript
interface EngineScore {
  engine: StorageEngine
  score: number // 0-1 之间的评分
  reasons: string[] // 选择原因
  confidence: number // 置信度
}
```

每个引擎都会根据当前数据特征获得一个评分，最高分的引擎被选中。

## ⚙️ 配置策略

### 基础配置

```typescript
const cache = createCache({
  strategy: {
    enabled: true, // 启用智能策略
    fallbackEngine: 'localStorage', // 备用引擎
    confidence: 0.7, // 最低置信度阈值
  },
})
```

### 阈值配置

```typescript
const cache = createCache({
  strategy: {
    enabled: true,
    sizeThresholds: {
      small: 1024, // 1KB - 小数据
      medium: 64 * 1024, // 64KB - 中等数据
      large: 1024 * 1024, // 1MB - 大数据
    },
    ttlThresholds: {
      short: 5 * 60 * 1000, // 5分钟 - 短期
      medium: 24 * 60 * 60 * 1000, // 24小时 - 中期
      long: 7 * 24 * 60 * 60 * 1000, // 7天 - 长期
    },
  },
})
```

### 权重配置

```typescript
const cache = createCache({
  strategy: {
    enabled: true,
    weights: {
      size: 0.4, // 数据大小权重
      ttl: 0.3, // TTL 权重
      type: 0.2, // 数据类型权重
      frequency: 0.1, // 访问频率权重
    },
  },
})
```

## 📊 策略规则

### 数据大小策略

```typescript
// 小数据 (< 1KB) → localStorage
await cache.set('user-name', '张三')
// 选择：localStorage (快速访问，持久化)

// 中等数据 (1KB - 64KB) → sessionStorage 或 localStorage
await cache.set('form-data', mediumSizeObject)
// 选择：根据 TTL 和类型进一步判断

// 大数据 (> 64KB) → IndexedDB
await cache.set('dataset', largeSizeArray)
// 选择：IndexedDB (大容量，结构化存储)
```

### TTL 策略

```typescript
// 短期缓存 (< 5分钟) → Memory
await cache.set('api-cache', data, { ttl: 2 * 60 * 1000 })
// 选择：Memory (高性能，短期有效)

// 中期缓存 (5分钟 - 24小时) → sessionStorage
await cache.set('session-data', data, { ttl: 2 * 60 * 60 * 1000 })
// 选择：sessionStorage (会话级，适中容量)

// 长期缓存 (> 24小时) → localStorage
await cache.set('user-config', data, { ttl: 7 * 24 * 60 * 60 * 1000 })
// 选择：localStorage (持久化，长期保存)
```

### 数据类型策略

```typescript
// 简单类型 → localStorage
await cache.set('counter', 42)
await cache.set('flag', true)
await cache.set('message', 'Hello World')
// 选择：localStorage (简单高效)

// 复杂对象 → IndexedDB
await cache.set('user-profile', {
  personal: { name: '张三', age: 30 },
  preferences: { theme: 'dark', lang: 'zh' },
  history: [
    /* 大量历史记录 */
  ],
})
// 选择：IndexedDB (结构化存储，支持复杂查询)

// 数组数据 → IndexedDB
await cache.set('todo-list', [
  { id: 1, text: '任务1', completed: false },
  { id: 2, text: '任务2', completed: true },
  // ... 更多任务
])
// 选择：IndexedDB (适合列表数据)
```

## 🎛️ 自定义策略

### 自定义评分函数

```typescript
const cache = createCache({
  strategy: {
    enabled: true,
    customScorer: (data, options, context) => {
      const scores: EngineScore[] = []

      // 自定义评分逻辑
      if (data.type === 'user-data') {
        scores.push({
          engine: 'indexedDB',
          score: 0.9,
          reasons: ['用户数据适合结构化存储'],
          confidence: 0.95,
        })
      }

      return scores
    },
  },
})
```

### 策略监听

```typescript
// 监听策略选择事件
cache.on('strategy', (event) => {
  console.log('策略选择结果:', {
    key: event.key,
    selectedEngine: event.engine,
    score: event.score,
    reasons: event.reasons,
    confidence: event.confidence,
  })
})
```

## 📈 策略优化

### 学习模式

```typescript
const cache = createCache({
  strategy: {
    enabled: true,
    learning: {
      enabled: true, // 启用学习模式
      sampleSize: 1000, // 样本大小
      adaptInterval: 24 * 60 * 60 * 1000, // 24小时调整一次
    },
  },
})
```

学习模式会收集使用数据，自动调整策略参数以提升选择准确性。

### 性能监控

```typescript
// 获取策略性能统计
const strategyStats = await cache.getStrategyStats()

console.log('策略统计:', {
  totalDecisions: strategyStats.totalDecisions,
  averageConfidence: strategyStats.averageConfidence,
  engineDistribution: strategyStats.engineDistribution,
  accuracyRate: strategyStats.accuracyRate,
})
```

## 🔍 调试策略

### 调试模式

```typescript
const cache = createCache({
  debug: true,
  strategy: {
    enabled: true,
    debug: true, // 启用策略调试
  },
})
```

调试模式会输出详细的策略选择过程：

```
[Strategy] Analyzing data for key 'user-profile'
[Strategy] Data size: 2.5KB, Type: object, TTL: 24h
[Strategy] Engine scores:
  - localStorage: 0.7 (持久化需求, 中等大小)
  - sessionStorage: 0.4 (大小适中, 但TTL过长)
  - indexedDB: 0.9 (复杂对象, 长期存储)
  - memory: 0.3 (TTL过长, 不适合内存)
[Strategy] Selected: indexedDB (confidence: 0.9)
```

### 策略分析

```typescript
// 分析特定数据的策略选择
const analysis = await cache.analyzeStrategy('user-data', userData, {
  ttl: 24 * 60 * 60 * 1000,
})

console.log('策略分析:', {
  recommendedEngine: analysis.recommendedEngine,
  allScores: analysis.scores,
  reasoning: analysis.reasoning,
})
```

## 🎯 最佳实践

### 1. 启用智能策略

```typescript
// ✅ 推荐：启用智能策略，让系统自动优化
const cache = createCache({
  strategy: { enabled: true },
})

// ❌ 不推荐：完全手动管理
const cache = createCache({
  defaultEngine: 'localStorage', // 固定使用一种引擎
})
```

### 2. 合理设置阈值

```typescript
// ✅ 推荐：根据应用特点调整阈值
const cache = createCache({
  strategy: {
    enabled: true,
    sizeThresholds: {
      small: 512, // 应用数据较小
      medium: 32 * 1024, // 调整中等数据阈值
      large: 512 * 1024, // 调整大数据阈值
    },
  },
})
```

### 3. 监控策略效果

```typescript
// ✅ 推荐：定期检查策略效果
setInterval(async () => {
  const stats = await cache.getStrategyStats()
  if (stats.accuracyRate < 0.8) {
    console.warn('策略准确率较低，建议调整配置')
  }
}, 60 * 60 * 1000) // 每小时检查一次
```

### 4. 处理策略失败

```typescript
// ✅ 推荐：设置备用策略
const cache = createCache({
  strategy: {
    enabled: true,
    fallbackEngine: 'localStorage',
    onStrategyFailed: (error, key, data) => {
      console.error('策略选择失败:', error)
      // 记录错误，用于后续优化
    },
  },
})
```

## 🔮 未来发展

### 机器学习优化

未来版本将集成机器学习算法，根据实际使用模式自动优化策略：

- **使用模式学习** - 分析数据访问模式
- **性能预测** - 预测不同引擎的性能表现
- **自适应调整** - 根据反馈自动调整参数

### 云端策略同步

支持将策略配置同步到云端，实现跨设备的一致体验：

- **配置同步** - 跨设备同步策略配置
- **使用统计** - 收集匿名使用数据优化策略
- **A/B 测试** - 支持策略 A/B 测试

## 🔗 相关文档

- [存储引擎](./storage-engines.md) - 了解各种存储引擎
- [性能优化](./performance.md) - 性能优化指南
- [API 参考](/api/cache-manager.md) - 详细 API 文档
