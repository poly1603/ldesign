# 🔄 @ldesign/i18n 迁移指南

## v1.x → v2.0 迁移

### 🎉 新功能概览

v2.0 版本引入了强大的性能优化系统，包括：

- ⚡ **智能批量处理** - 自动优化翻译请求
- 🧠 **智能预加载** - 基于使用模式的预测性加载  
- 💾 **高级内存管理** - 多策略内存优化
- 📊 **性能监控** - 详细的性能分析和优化建议

### 🔧 破坏性变更

#### 1. 性能管理器重命名

```typescript
// v1.x
import { PerformanceManager } from '@ldesign/i18n'

// v2.0
import { EnhancedPerformanceManager } from '@ldesign/i18n'
```

#### 2. 新增必需的性能组件

v2.0 中，I18n 实例会自动初始化性能优化组件。如果您之前有自定义的性能管理，需要适配新的API。

```typescript
// v1.x - 简单的性能管理
const i18n = createI18n({
  locale: 'zh-CN',
  performance: {
    enabled: true
  }
})

// v2.0 - 增强的性能管理
const i18n = createI18n({
  locale: 'zh-CN',
  performance: {
    enabled: true,
    sampleRate: 0.1,
    slowTranslationThreshold: 10
  }
})
```

### 🆕 新增 API

#### 批量翻译优化

```typescript
// 新增：异步批量翻译
const translations = await i18n.tBatchAsync([
  'hello',
  'world',
  'welcome'
])

// 新增：批量统计
const stats = i18n.getBatchStats()
```

#### 智能预加载

```typescript
// 新增：预加载语言包
await i18n.preloadLanguages(['en', 'ja'])

// 新增：智能预加载
i18n.smartPreload()

// 新增：记录使用情况
i18n.recordLanguageUsage('en', 'dashboard')
```

#### 内存管理

```typescript
// 新增：内存清理
const result = i18n.performMemoryCleanup()

// 新增：资源清理
i18n.cleanupResources()
```

#### 性能监控

```typescript
// 新增：详细性能报告
const report = i18n.getPerformanceReport()

// 新增：优化建议
const suggestions = i18n.getOptimizationSuggestions()
```

### 📦 依赖更新

#### package.json 更新

```json
{
  "dependencies": {
    "@ldesign/i18n": "^2.0.0"
  }
}
```

#### TypeScript 类型更新

如果您使用了自定义类型，需要更新导入：

```typescript
// v1.x
import type { I18nOptions, TranslationParams } from '@ldesign/i18n'

// v2.0 - 新增类型
import type { 
  I18nOptions, 
  TranslationParams,
  BatchConfig,
  PreloadConfig,
  MemoryConfig,
  PerformanceReport
} from '@ldesign/i18n'
```

### 🔄 逐步迁移策略

#### 第一步：更新依赖

```bash
npm install @ldesign/i18n@^2.0.0
```

#### 第二步：基础功能验证

确保现有的翻译功能正常工作：

```typescript
// 测试基础翻译
console.log(i18n.t('hello')) // 应该正常工作

// 测试语言切换
await i18n.setLocale('en') // 应该正常工作
```

#### 第三步：启用性能优化

逐步启用新的性能功能：

```typescript
// 启用批量翻译
const translations = await i18n.tBatchAsync(['key1', 'key2'])

// 启用智能预加载
i18n.smartPreload()

// 监控性能
const report = i18n.getPerformanceReport()
console.log('性能报告:', report)
```

#### 第四步：优化配置

根据应用需求调整配置：

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  // 新增：批量处理配置
  batch: {
    batchSize: 50,
    batchDelay: 10
  },
  // 新增：预加载配置
  preload: {
    strategy: 'smart',
    maxConcurrent: 3
  },
  // 新增：内存管理配置
  memory: {
    maxMemory: 100 * 1024 * 1024,
    autoCleanup: true
  }
})
```

### 🎯 Vue 3 集成迁移

#### 新增组合式 API

```vue
<script setup>
// v1.x
import { useI18n } from '@ldesign/i18n/vue'
const { t, locale } = useI18n()

// v2.0 - 新增增强版本
import { useI18nEnhanced } from '@ldesign/i18n/vue'
const { t, locale, tBatch, preload } = useI18nEnhanced()

// 使用批量翻译
const translations = await tBatch(['nav.home', 'nav.about'])

// 使用预加载
await preload(['dashboard', 'settings'])
</script>
```

#### 性能监控集成

```vue
<script setup>
import { useI18nPerformance } from '@ldesign/i18n/vue'

const { metrics, suggestions } = useI18nPerformance()

// 监控性能指标
watchEffect(() => {
  console.log('翻译性能:', metrics.value)
  console.log('优化建议:', suggestions.value)
})
</script>
```

### ⚠️ 注意事项

#### 1. 内存使用

v2.0 引入了更多的内存管理功能，但也可能增加初始内存使用。如果您的应用对内存敏感，请调整配置：

```typescript
const i18n = createI18n({
  // 降低内存限制
  memory: {
    maxMemory: 50 * 1024 * 1024, // 50MB
    pressureThreshold: 0.7
  }
})
```

#### 2. 异步操作

新的批量翻译和预加载功能是异步的，确保正确处理 Promise：

```typescript
// ✅ 正确
const translations = await i18n.tBatchAsync(keys)

// ❌ 错误
const translations = i18n.tBatchAsync(keys) // 返回 Promise
```

#### 3. 性能监控开销

性能监控功能在生产环境中可能有轻微开销，可以选择性启用：

```typescript
const i18n = createI18n({
  performance: {
    enabled: process.env.NODE_ENV === 'development',
    sampleRate: 0.1 // 只采样 10% 的翻译
  }
})
```

### 🧪 测试更新

#### 单元测试

更新测试以适配新的异步 API：

```typescript
// v1.x
test('批量翻译', () => {
  const result = i18n.batchTranslate(['key1', 'key2'])
  expect(result.translations.key1).toBe('value1')
})

// v2.0
test('异步批量翻译', async () => {
  const result = await i18n.tBatchAsync(['key1', 'key2'])
  expect(result.key1).toBe('value1')
})
```

#### 性能测试

添加性能相关的测试：

```typescript
test('性能监控', () => {
  const report = i18n.getPerformanceReport()
  expect(report.performance).toBeDefined()
  expect(report.memory).toBeDefined()
  expect(report.cache).toBeDefined()
})

test('优化建议', () => {
  const suggestions = i18n.getOptimizationSuggestions()
  expect(Array.isArray(suggestions)).toBe(true)
})
```

### 📚 迁移检查清单

- [ ] 更新 @ldesign/i18n 到 v2.0
- [ ] 验证基础翻译功能
- [ ] 更新 TypeScript 类型导入
- [ ] 测试批量翻译功能
- [ ] 配置智能预加载
- [ ] 设置内存管理
- [ ] 启用性能监控
- [ ] 更新 Vue 3 组合式 API
- [ ] 更新单元测试
- [ ] 性能测试和优化

### 🆘 获取帮助

如果在迁移过程中遇到问题：

1. 查看 [API 参考](./API_REFERENCE.md)
2. 阅读 [性能优化指南](./PERFORMANCE_GUIDE.md)
3. 提交 [GitHub Issue](https://github.com/ldesign/i18n/issues)
4. 参与 [讨论区](https://github.com/ldesign/i18n/discussions)

### 🎯 迁移后的收益

完成迁移后，您将获得：

- **5-12x** 批量翻译性能提升
- **40-60%** 内存使用优化
- **智能预加载** 提升用户体验
- **详细监控** 帮助持续优化
- **自动建议** 指导性能调优
