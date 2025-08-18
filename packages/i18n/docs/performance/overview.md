# 性能概述

@ldesign/i18n 经过全面的性能优化，提供企业级的性能和可靠性。本章节将详细介绍各种性能优化特性和最佳实
践。

## 🚀 性能特性

### 智能缓存系统

我们实现了基于 LRU 算法的多层缓存系统：

- **内存缓存**: 使用 Map 数据结构的高效内存缓存
- **智能淘汰**: 结合访问频率和时间的智能淘汰策略
- **缓存预热**: 支持预加载常用翻译到缓存
- **统计分析**: 实时缓存命中率和性能指标

```typescript
// 缓存预热
i18n.warmUpCache(['common.ok', 'common.cancel', 'common.save'])

// 获取缓存统计
const stats = i18n.cache.getStats()
console.log(`缓存命中率: ${(stats.hitRate * 100).toFixed(2)}%`)
```

### 批量操作优化

支持批量翻译和并行处理，大幅提升大量翻译场景的性能：

```typescript
// 批量翻译
const result = i18n.batchTranslate(['common.ok', 'common.cancel', 'common.save', 'common.delete'])

console.log(result.translations) // 所有翻译结果
console.log(result.successCount) // 成功翻译数量
```

### 懒加载机制

语言包按需加载，减少初始加载时间：

```typescript
// 预加载多个语言
await i18n.batchPreloadLanguages(['en', 'zh-CN', 'fr'])

// 检查语言是否已加载
if (!i18n.isLanguageLoaded('de')) {
  await i18n.preloadLanguage('de')
}
```

### 内存管理

- **对象池**: 重用缓存项对象，减少 GC 压力
- **内存监控**: 实时监控内存使用情况
- **自动清理**: 智能清理过期和不常用的缓存项

```typescript
// 手动清理缓存
i18n.cleanupCache()

// 获取内存使用情况
const metrics = i18n.getPerformanceMetrics()
console.log(`内存使用: ${(metrics.memoryUsage / 1024).toFixed(2)}KB`)
```

## 📊 性能监控

### 实时指标收集

系统自动收集各种性能指标：

```typescript
const metrics = i18n.getPerformanceMetrics()

console.log({
  translationCalls: metrics.translationCalls, // 翻译调用次数
  averageTime: metrics.averageTranslationTime, // 平均翻译时间
  cacheHitRate: metrics.cacheHitRate, // 缓存命中率
  memoryUsage: metrics.memoryUsage, // 内存使用量
  slowestTranslations: metrics.slowestTranslations, // 最慢的翻译
})
```

### 性能报告

生成详细的性能分析报告：

```typescript
const report = i18n.generatePerformanceReport()
console.log(report)

// 输出示例:
// === I18n 性能报告 ===
// 翻译调用次数: 1250
// 平均翻译时间: 0.85ms
// 缓存命中率: 94.50%
// 内存使用量: 156.32KB
//
// 语言包加载时间:
//   en: 12.34ms
//   zh-CN: 15.67ms
//
// 最慢的翻译:
//   complex.nested.key: 5.23ms
//   dynamic.content: 3.45ms
```

### 优化建议

系统会根据性能数据提供智能优化建议：

```typescript
const suggestions = i18n.getOptimizationSuggestions()
suggestions.forEach(suggestion => {
  console.log(`💡 ${suggestion}`)
})

// 可能的建议:
// 💡 缓存命中率较低，考虑增加缓存大小或优化缓存策略
// 💡 平均翻译时间较长，考虑优化翻译逻辑或预加载常用翻译
// 💡 存在较多慢翻译，考虑优化这些翻译键的处理逻辑
```

## ⚡ 性能基准

在现代浏览器环境下的性能表现：

| 操作              | 平均时间 | 备注             |
| ----------------- | -------- | ---------------- |
| 简单翻译          | < 0.1ms  | 缓存命中         |
| 插值翻译          | < 0.5ms  | 包含参数处理     |
| 复数翻译          | < 1ms    | 包含复数规则计算 |
| 批量翻译 (100 项) | < 10ms   | 并行处理         |
| 语言切换          | < 50ms   | 包含语言包加载   |
| 缓存操作          | < 0.01ms | 读写操作         |

## 🎯 性能最佳实践

### 1. 合理使用缓存

```typescript
// ✅ 好的做法：预热常用翻译
i18n.warmUpCache(['common.ok', 'common.cancel', 'navigation.home', 'navigation.about'])

// ❌ 避免：频繁清理缓存
// i18n.cache.clear() // 不要频繁调用
```

### 2. 批量操作

```typescript
// ✅ 好的做法：使用批量翻译
const keys = ['key1', 'key2', 'key3', 'key4']
const result = i18n.batchTranslate(keys)

// ❌ 避免：循环单个翻译
// keys.forEach(key => i18n.t(key)) // 性能较差
```

### 3. 智能预加载

```typescript
// ✅ 好的做法：预加载用户可能需要的语言
const userPreferredLanguages = ['en', 'zh-CN']
await i18n.batchPreloadLanguages(userPreferredLanguages)

// ❌ 避免：预加载所有语言
// await i18n.batchPreloadLanguages(allLanguages) // 浪费资源
```

### 4. 监控和优化

```typescript
// 定期检查性能指标
setInterval(() => {
  const metrics = i18n.getPerformanceMetrics()

  if (metrics.cacheHitRate < 0.8) {
    console.warn('缓存命中率较低，考虑优化')
  }

  if (metrics.averageTranslationTime > 2) {
    console.warn('翻译时间较长，考虑优化')
  }
}, 60000) // 每分钟检查一次
```

## 🔧 性能调优

### 缓存大小调优

```typescript
const i18n = new I18n({
  cache: {
    enabled: true,
    maxSize: 2000, // 根据应用规模调整
  },
})
```

### 采样率调整

```typescript
// 在生产环境中降低采样率以减少性能开销
const performanceManager = new PerformanceManager({
  enabled: true,
  sampleRate: 0.1, // 10% 采样
})
```

### 内存优化

```typescript
// 定期清理缓存
setInterval(() => {
  i18n.cleanupCache()
}, 300000) // 每5分钟清理一次
```

通过这些性能优化特性和最佳实践，@ldesign/i18n 能够在各种场景下提供卓越的性能表现。
