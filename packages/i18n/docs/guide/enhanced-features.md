# 增强功能指南

@ldesign/i18n 提供了一系列强大的增强功能，旨在提升性能、开发体验和功能完整性。本指南将详细介绍这些新功能。

## 🚀 高性能缓存系统

### 概述

新的缓存系统基于高性能的 `PerformanceCache` 和专门的 `TranslationCache`，提供了多种缓存策略和详细的统计信息。

### 特性

- **多种缓存策略**：支持 LRU、LFU、FIFO 策略
- **TTL 支持**：自动过期机制
- **性能统计**：详细的命中率和性能指标
- **内存管理**：自动清理和大小限制

### 基本使用

```typescript
import { I18n } from '@ldesign/i18n'

const i18n = new I18n({
  defaultLocale: 'en',
  cache: {
    enabled: true,
    maxSize: 1000,        // 最大缓存项数
    defaultTTL: 300000,   // 5分钟过期时间
  }
})

// 获取缓存统计
const stats = i18n.getCacheStats()
console.log(`缓存命中率: ${(stats.hitRate * 100).toFixed(1)}%`)
console.log(`缓存大小: ${stats.size}/${stats.maxSize}`)
console.log(`驱逐次数: ${stats.evictionCount}`)
```

### 独立使用缓存

```typescript
import { TranslationCache } from '@ldesign/i18n'

const cache = new TranslationCache({
  maxSize: 500,
  ttl: 60000,      // 1分钟
  strategy: 'lru'  // LRU 策略
})

// 缓存翻译结果
cache.cacheTranslation('en', 'hello', { name: 'World' }, 'Hello, World!')

// 获取缓存的翻译
const cached = cache.getCachedTranslation('en', 'hello', { name: 'World' })
console.log(cached) // "Hello, World!"
```

## 🔢 增强的多元化支持

### 概述

新的多元化引擎支持 ICU 格式、自定义规则和多种语言的复杂多元化规则。

### ICU 格式支持

```typescript
// 语言包中的 ICU 格式
const messages = {
  items: '{count, plural, =0{no items} =1{one item} other{# items}}',
  files: '{count, plural, =0{no files} =1{one file} other{{{count}} files}}'
}

// 使用
console.log(i18n.t('items', { count: 0 }))  // "no items"
console.log(i18n.t('items', { count: 1 }))  // "one item"
console.log(i18n.t('items', { count: 5 }))  // "5 items"
```

### 新格式支持

```typescript
// 使用 | 分隔的新格式
const messages = {
  notifications: 'zero:No notifications|one:One notification|other:{{count}} notifications'
}

console.log(i18n.t('notifications', { count: 0 }))  // "No notifications"
console.log(i18n.t('notifications', { count: 3 }))  // "3 notifications"
```

### 独立使用多元化引擎

```typescript
import { PluralizationEngine, PluralCategory } from '@ldesign/i18n'

const engine = new PluralizationEngine()

// 获取多元化类别
const category = engine.getCategory('en', 5)  // PluralCategory.OTHER

// 注册自定义规则
engine.registerRule('custom', (count: number) => {
  if (count === 0) return PluralCategory.ZERO
  if (count === 1) return PluralCategory.ONE
  return PluralCategory.OTHER
})

// 支持的语言
console.log(engine.getSupportedLocales())  // ['en', 'zh', 'ja', 'ru', 'fr', ...]
```

## 🎨 强大的格式化功能

### 概述

内置的格式化引擎提供了日期、数字、货币、相对时间等多种格式化功能。

### 日期格式化

```typescript
const now = new Date()

// 基本格式化
console.log(i18n.formatDate(now))  // "12/25/2023"

// 完整格式
console.log(i18n.formatDate(now, { dateStyle: 'full' }))  // "Monday, December 25, 2023"

// 时间格式
console.log(i18n.formatDate(now, { timeStyle: 'medium' }))  // "3:30:45 PM"

// 相对时间
const oneHourAgo = new Date(Date.now() - 3600000)
console.log(i18n.formatRelativeTime(oneHourAgo))  // "1 hour ago"
```

### 数字和货币格式化

```typescript
// 数字格式化
console.log(i18n.formatNumber(1234567.89))  // "1,234,567.89"
console.log(i18n.formatNumber(1234567, { compact: true }))  // "1.2M"

// 货币格式化
console.log(i18n.formatCurrency(1234.56, 'USD'))  // "$1,234.56"
console.log(i18n.formatCurrency(1234.56, 'EUR'))  // "€1,234.56"

// 百分比格式化
console.log(i18n.formatPercent(0.1234))  // "12%"
```

### 列表格式化

```typescript
// 基本列表
console.log(i18n.formatList(['Apple', 'Banana']))  // "Apple and Banana"
console.log(i18n.formatList(['Apple', 'Banana', 'Orange']))  // "Apple, Banana, and Orange"

// 或关系列表
console.log(i18n.formatList(['Red', 'Blue'], { type: 'disjunction' }))  // "Red or Blue"
```

### 自定义格式化器

```typescript
// 注册文件大小格式化器
i18n.registerFormatter('fileSize', (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
})

// 使用自定义格式化器
console.log(i18n.format('fileSize', 1024 * 1024 * 2.5))  // "2.50 MB"

// 注册温度格式化器
i18n.registerFormatter('temperature', (celsius: number) => {
  const fahrenheit = (celsius * 9/5) + 32
  return `${celsius}°C (${fahrenheit.toFixed(1)}°F)`
})

console.log(i18n.format('temperature', 25))  // "25°C (77.0°F)"
```

### 独立使用格式化引擎

```typescript
import { FormatterEngine } from '@ldesign/i18n'

const formatter = new FormatterEngine({
  defaultLocale: 'en',
  currency: 'USD',
  timeZone: 'America/New_York'
})

// 多语言格式化
console.log(formatter.formatCurrency(1234.56, 'en', 'USD'))  // "$1,234.56"
console.log(formatter.formatCurrency(1234.56, 'de', 'EUR'))  // "1.234,56 €"
console.log(formatter.formatCurrency(1234.56, 'ja', 'JPY'))  // "￥1,235"
```

## 🔧 懒加载和按需加载

### 概述

增强的加载器支持懒加载、按需加载和分块加载，提升应用启动性能。

### 配置懒加载

```typescript
const i18n = new I18n({
  defaultLocale: 'en',
  loader: {
    lazyLoad: {
      enabled: true,
      chunkSize: 50,      // 每块大小
      priority: 'normal'  // 加载优先级
    },
    onDemand: {
      enabled: true,
      namespaces: ['common', 'forms'],  // 按需加载的命名空间
      threshold: 10       // 触发按需加载的键数量阈值
    }
  }
})
```

### 预加载语言包

```typescript
// 预加载多个语言包
await i18n.preloadLocales(['en', 'zh-CN', 'ja'], 'high')

// 预加载特定命名空间
await i18n.loadNamespace('en', 'dashboard')
```

## 📊 性能监控和优化

### 性能报告

```typescript
// 获取详细的性能报告
const report = i18n.getPerformanceReport()
console.log(`总翻译次数: ${report.totalTranslations}`)
console.log(`平均翻译时间: ${report.averageTranslationTime.toFixed(3)}ms`)
console.log(`缓存命中率: ${(report.cacheHitRate * 100).toFixed(1)}%`)
console.log(`内存使用: ${(report.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
```

### 优化建议

```typescript
// 获取自动优化建议
const suggestions = i18n.getOptimizationSuggestions()
suggestions.forEach(suggestion => {
  console.log(`💡 ${suggestion}`)
})
```

### 缓存预热

```typescript
// 预热常用翻译键
await i18n.warmUpCache([
  'common.ok',
  'common.cancel',
  'common.save',
  'common.delete'
])
```

## 🔗 集成使用

### 在翻译中使用格式化

虽然当前版本还不支持在翻译文本中直接嵌入格式化器，但可以通过组合使用实现：

```typescript
// 组合翻译和格式化
const template = i18n.t('report.generated')  // "Report generated on {{date}} with {{count}} files"
const message = template
  .replace('{{date}}', i18n.formatDate(new Date(), { dateStyle: 'full' }))
  .replace('{{count}}', i18n.formatNumber(42))

console.log(message)  // "Report generated on Monday, December 25, 2023 with 42 files"
```

### 性能最佳实践

1. **启用缓存**：始终启用翻译缓存以提升性能
2. **合理设置 TTL**：根据应用特点设置合适的缓存过期时间
3. **使用懒加载**：对于大型应用，启用懒加载减少初始加载时间
4. **预加载关键内容**：预加载用户最可能使用的语言包
5. **监控性能**：定期检查性能报告和优化建议

### 错误处理

```typescript
try {
  const result = i18n.formatCurrency(amount, 'INVALID_CURRENCY')
} catch (error) {
  console.error('格式化错误:', error.message)
  // 使用回退值
  const fallback = `${amount} (currency format error)`
}
```

## 🎯 总结

增强功能为 @ldesign/i18n 带来了：

- **更好的性能**：高效的缓存系统和懒加载机制
- **更强的功能**：完整的多元化和格式化支持
- **更好的体验**：详细的监控和优化建议
- **更高的灵活性**：独立使用各个组件的能力

这些功能可以单独使用，也可以组合使用，为不同规模和需求的应用提供最佳的国际化解决方案。
