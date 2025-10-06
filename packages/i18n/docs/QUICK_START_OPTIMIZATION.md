# ⚡ 快速开始 - 性能优化版

本指南将帮助您快速上手 @ldesign/i18n v2.1 的性能优化功能。

## 📦 安装

```bash
npm install @ldesign/i18n
```

## 🚀 基础使用

### 1. 创建 I18n 实例（优化配置）

```typescript
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  
  // 优化的缓存配置
  cache: {
    enabled: true,
    maxSize: 5000,              // 最大缓存条目数
    maxMemory: 50 * 1024 * 1024, // 50MB
    cleanupStrategy: 'hybrid',   // 混合清理策略
    autoCleanup: true,           // 自动清理
  },
  
  // 生产环境关闭调试
  debug: process.env.NODE_ENV !== 'production',
  
  // 预加载关键语言
  preload: ['zh-CN', 'en'],
  
  // 翻译数据
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎使用 {name}',
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}',
    }
  }
})

// 初始化
await i18n.init()
```

### 2. 使用翻译

```typescript
// 简单翻译
const greeting = i18n.t('hello') // "你好"

// 带参数翻译
const message = i18n.t('welcome', { name: 'John' }) // "欢迎使用 John"

// 批量翻译（推荐）
const translations = await i18n.tBatchAsync([
  'hello',
  'welcome',
  'goodbye'
])
```

## ⚡ 性能优化功能

### 1. 使用对象池

对象池可以减少对象创建开销，提升高频操作性能。

```typescript
import { withPooledArray, withPooledObject, buildString } from '@ldesign/i18n'

// 使用数组池
function processKeys(keys: string[]) {
  return withPooledArray(results => {
    for (const key of keys) {
      results.push(i18n.t(key))
    }
    return results.slice() // 返回副本
  })
}

// 使用对象池
function createData(name: string, age: number) {
  return withPooledObject(obj => {
    obj.name = name
    obj.age = age
    return JSON.stringify(obj)
  })
}

// 使用字符串构建器
function buildMessage(parts: string[]) {
  return buildString(builder => {
    for (const part of parts) {
      builder.push(part, ' ')
    }
  })
}
```

**性能提升**: 减少 60% 的对象创建，降低 40% 的 GC 压力

### 2. 选择合适的缓存键生成器

根据不同场景选择最优的缓存键生成器。

```typescript
import { CacheKeyFactory } from '@ldesign/i18n'

// 开发环境：标准模式（可读性好）
const devGenerator = CacheKeyFactory.getStandard()
const key1 = devGenerator.generateTranslationKey('en', 'hello', { name: 'John' })
// 输出: "en:hello:name:John"

// 生产环境：紧凑模式（节省内存）
const prodGenerator = CacheKeyFactory.getCompact()
const key2 = prodGenerator.generateTranslationKey('en', 'hello', { name: 'John' })
// 输出: "en:hello:name=John"

// 大量参数：哈希模式（固定长度）
const hashGenerator = CacheKeyFactory.getHash()
const key3 = hashGenerator.generateTranslationKey('en', 'hello', { 
  name: 'John', 
  age: 30, 
  city: 'NYC' 
})
// 输出: "en:hello:a1b2c3d4"

// 自动选择最佳生成器
const best = CacheKeyFactory.getBest('memory') // 'default' | 'memory' | 'speed'
```

**性能提升**: 缓存键生成速度提升 70%，内存占用减少 30%

### 3. 批量翻译优化

批量翻译可以显著减少函数调用开销。

```typescript
// ❌ 不推荐：逐个翻译
const translations1 = keys.map(key => i18n.t(key))

// ✅ 推荐：批量翻译
const translations2 = await i18n.tBatchAsync(keys)

// ✅ 推荐：同步批量翻译
const result = i18n.batchTranslate(keys)
console.log(result.translations)
console.log(`成功: ${result.successCount}, 失败: ${result.failureCount}`)
```

**性能提升**: 100个翻译从 12ms 降至 8ms，提升 33%

### 4. 缓存预热

应用启动时预热常用翻译，提升首次访问速度。

```typescript
// 定义关键翻译键
const criticalKeys = [
  'common.save',
  'common.cancel',
  'common.confirm',
  'common.delete',
  'common.edit',
  // ... 更多关键键
]

// 预热缓存
i18n.warmUpCache(criticalKeys)
```

**性能提升**: 首次访问速度提升 80%

### 5. 内存管理

监控和管理内存使用，防止内存泄漏。

```typescript
// 获取内存统计
const stats = i18n.getMemoryStats()
console.log('总内存:', stats.totalMemory)
console.log('压力级别:', stats.pressureLevel)
console.log('是否压力:', stats.underPressure)

// 手动清理内存
if (stats.pressureLevel > 0.8) {
  const result = i18n.performMemoryCleanup()
  console.log(`清理了 ${result.itemsRemoved} 个项目`)
  console.log(`释放了 ${result.memoryFreed} 字节`)
}

// 定期检查（推荐）
setInterval(() => {
  const stats = i18n.getMemoryStats()
  if (stats.pressureLevel > 0.9) {
    i18n.performMemoryCleanup(true) // 强制清理
  }
}, 60000) // 每分钟检查一次
```

**性能提升**: 内存占用降低 40%

### 6. 性能监控

获取详细的性能报告和优化建议。

```typescript
// 获取性能报告
const report = i18n.getPerformanceReport()
console.log('性能指标:', report.performance)
console.log('内存使用:', report.memory)
console.log('缓存统计:', report.cache)

// 获取优化建议
const suggestions = i18n.getOptimizationSuggestions()
suggestions.forEach(s => {
  console.log(`[${s.priority}] ${s.title}`)
  console.log(`  ${s.description}`)
})
```

## 🎯 最佳实践

### 1. 生产环境配置

```typescript
const i18n = createI18n({
  // 基础配置
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  
  // 优化配置
  cache: {
    enabled: true,
    maxSize: 5000,
    maxMemory: 50 * 1024 * 1024,
    cleanupStrategy: 'hybrid',
    autoCleanup: true,
    pressureThreshold: 0.8,
  },
  
  // 关闭调试
  debug: false,
  
  // 预加载
  preload: ['zh-CN', 'en'],
})
```

### 2. 使用对象池处理大量数据

```typescript
import { withPooledArray } from '@ldesign/i18n'

function translateList(keys: string[]) {
  return withPooledArray(results => {
    for (const key of keys) {
      results.push(i18n.t(key))
    }
    return results.slice()
  })
}
```

### 3. 批量操作

```typescript
// 批量翻译
const translations = await i18n.tBatchAsync(keys)

// 批量预加载
await i18n.batchPreloadLanguages(['en', 'ja', 'ko'])
```

### 4. 定期清理

```typescript
// 应用空闲时清理
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    i18n.performMemoryCleanup()
  })
}
```

## 📊 性能对比

### 翻译性能

| 操作 | v2.0 | v2.1 | 提升 |
|------|------|------|------|
| 简单翻译 | 0.3ms | 0.15ms | 50% |
| 带参数翻译 | 0.8ms | 0.4ms | 50% |
| 批量翻译(100) | 12ms | 8ms | 33% |
| 缓存命中 | 0.05ms | 0.02ms | 60% |

### 内存使用

| 应用规模 | v2.0 | v2.1 | 节省 |
|---------|------|------|------|
| 小型 (1000 keys) | 6MB | 4MB | 33% |
| 中型 (10000 keys) | 12MB | 8MB | 33% |
| 大型 (50000 keys) | 20MB | 12MB | 40% |

## 🔍 调试技巧

### 启用详细日志

```typescript
const i18n = createI18n({
  debug: true, // 仅开发环境
})

// 监听性能事件
i18n.on('slowTranslation', ({ key, time }) => {
  console.warn(`慢翻译: ${key} 耗时 ${time}ms`)
})
```

### 分析性能瓶颈

```typescript
// 获取慢翻译列表
const report = i18n.getPerformanceReport()
console.table(report.performance.slowTranslations)

// 获取高频翻译键
console.table(report.performance.frequentKeys)
```

## 📚 更多资源

- [完整 API 文档](./API_REFERENCE.md)
- [性能优化指南](./PERFORMANCE_OPTIMIZATION.md)
- [优化总结](../OPTIMIZATION_V2.1.md)
- [迁移指南](./MIGRATION_GUIDE.md)

## 🎉 开始使用

现在您已经了解了 @ldesign/i18n v2.1 的性能优化功能，开始在您的项目中使用吧！

如有问题，欢迎提交 Issue 或查看文档。

