# API 参考文档

## 核心 API

### I18n 类

`I18n` 是整个国际化系统的核心类，提供了完整的翻译、语言管理、性能监控等功能。

#### 构造函数

```typescript
constructor(options?: I18nOptions)
```

创建一个新的 I18n 实例。

**参数：**
- `options` - 可选的配置选项

**示例：**
```typescript
import { I18n } from '@ldesign/i18n'

const i18n = new I18n({
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  cache: {
    enabled: true,
    maxSize: 1000
  }
})
```

#### 初始化方法

##### `init(): Promise<void>`

初始化 I18n 实例，加载默认语言包。

```typescript
await i18n.init()
```

#### 翻译方法

##### `t<T = string>(key: string, params?: TranslationParams, options?: TranslationOptions): T`

执行翻译操作，这是最常用的方法。

**参数：**
- `key` - 翻译键，支持点分隔的嵌套键
- `params` - 可选的插值参数
- `options` - 可选的翻译选项

**返回值：**
- 翻译后的文本

**示例：**
```typescript
// 基础翻译
i18n.t('common.save') // "保存"

// 参数插值
i18n.t('common.welcome', { name: 'John' }) // "欢迎 John"

// 复数处理
i18n.t('common.items', { count: 5 }) // "5 个项目"

// 嵌套键
i18n.t('user.profile.name') // "姓名"
```

##### `batchTranslate(keys: string[], params?: TranslationParams): BatchTranslationResult`

批量翻译多个键，性能优于多次调用 `t` 方法。

**参数：**
- `keys` - 翻译键数组
- `params` - 可选的共享插值参数

**返回值：**
- `BatchTranslationResult` 对象，包含翻译结果和统计信息

**示例：**
```typescript
const result = i18n.batchTranslate([
  'common.save',
  'common.cancel',
  'common.delete'
])

console.log(result.translations) // { 'common.save': '保存', ... }
console.log(result.successCount) // 3
console.log(result.failureCount) // 0
```

#### 语言管理方法

##### `changeLanguage(locale: string): Promise<void>`

切换当前语言。

**参数：**
- `locale` - 目标语言代码

```typescript
await i18n.changeLanguage('en')
```

##### `getCurrentLanguage(): string`

获取当前语言代码。

```typescript
const currentLang = i18n.getCurrentLanguage() // "zh-CN"
```

##### `getAvailableLanguages(): LanguageInfo[]`

获取所有可用语言的信息。

```typescript
const languages = i18n.getAvailableLanguages()
// [
//   { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
//   { code: 'en', name: 'English', nativeName: 'English' }
// ]
```

#### 预加载方法

##### `preloadLanguage(locale: string): Promise<void>`

预加载指定语言包。

```typescript
await i18n.preloadLanguage('fr')
```

##### `batchPreloadLanguages(locales: string[]): Promise<void>`

批量预加载多个语言包。

```typescript
await i18n.batchPreloadLanguages(['fr', 'de', 'es'])
```

##### `isLanguageLoaded(locale: string): boolean`

检查指定语言是否已加载。

```typescript
const isLoaded = i18n.isLanguageLoaded('fr') // true/false
```

#### 性能监控方法

##### `getPerformanceMetrics(): PerformanceMetrics`

获取性能指标。

```typescript
const metrics = i18n.getPerformanceMetrics()
console.log(metrics.translationCalls) // 翻译调用次数
console.log(metrics.averageTranslationTime) // 平均翻译时间
console.log(metrics.cacheHitRate) // 缓存命中率
```

##### `generatePerformanceReport(): string`

生成详细的性能报告。

```typescript
const report = i18n.generatePerformanceReport()
console.log(report)
```

##### `getOptimizationSuggestions(): string[]`

获取性能优化建议。

```typescript
const suggestions = i18n.getOptimizationSuggestions()
// ["考虑预加载常用语言包", "增加缓存大小以提高命中率"]
```

##### `warmUpCache(keys: string[]): void`

预热缓存，提前加载常用翻译。

```typescript
i18n.warmUpCache(['common.save', 'common.cancel', 'common.delete'])
```

##### `cleanupCache(): void`

清理缓存，释放内存。

```typescript
i18n.cleanupCache()
```

#### 错误处理方法

##### `getErrorStats(): Record<string, number>`

获取错误统计信息。

```typescript
const errorStats = i18n.getErrorStats()
// { "MISSING_KEY": 5, "LOAD_ERROR": 2 }
```

##### `resetErrorStats(): void`

重置错误统计。

```typescript
i18n.resetErrorStats()
```

#### 工具方法

##### `exists(key: string, locale?: string): boolean`

检查翻译键是否存在。

```typescript
const exists = i18n.exists('common.save') // true/false
```

##### `getKeys(locale?: string): string[]`

获取所有翻译键。

```typescript
const keys = i18n.getKeys() // ['common.save', 'common.cancel', ...]
```

##### `getSuggestions(partialKey: string, limit?: number): string[]`

根据部分键名获取建议。

```typescript
const suggestions = i18n.getSuggestions('common.s', 5)
// ['common.save', 'common.search', 'common.settings']
```

##### `hasInterpolation(key: string): boolean`

检查翻译是否包含插值。

```typescript
const hasParams = i18n.hasInterpolation('common.welcome') // true
```

##### `hasPlural(key: string): boolean`

检查翻译是否包含复数规则。

```typescript
const hasPlural = i18n.hasPlural('common.items') // true
```

#### 事件方法

##### `on(event: I18nEventType, listener: I18nEventListener): void`

监听事件。

```typescript
i18n.on('languageChanged', (locale) => {
  console.log('Language changed to:', locale)
})
```

##### `off(event: I18nEventType, listener: I18nEventListener): void`

取消监听事件。

```typescript
i18n.off('languageChanged', listener)
```

## 类型定义

### I18nOptions

```typescript
interface I18nOptions {
  /** 默认语言 */
  defaultLocale: string
  /** 降级语言 */
  fallbackLocale?: string
  /** 存储方式 */
  storage?: 'localStorage' | 'sessionStorage' | 'none'
  /** 存储键名 */
  storageKey?: string
  /** 自动检测浏览器语言 */
  autoDetect?: boolean
  /** 预加载的语言列表 */
  preload?: string[]
  /** 缓存配置 */
  cache?: CacheOptions
  /** 语言切换回调 */
  onLanguageChanged?: (locale: string) => void
  /** 加载错误回调 */
  onLoadError?: (locale: string, error: Error) => void
}
```

### CacheOptions

```typescript
interface CacheOptions {
  /** 是否启用缓存 */
  enabled: boolean
  /** 最大缓存条目数 */
  maxSize: number
  /** 最大内存使用量（字节） */
  maxMemory?: number
  /** 默认TTL（毫秒） */
  defaultTTL?: number
  /** 是否启用TTL */
  enableTTL?: boolean
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
  /** 内存压力阈值 */
  memoryPressureThreshold?: number
}
```

### TranslationParams

```typescript
interface TranslationParams {
  [key: string]: string | number | boolean | null | undefined
}
```

### TranslationOptions

```typescript
interface TranslationOptions {
  /** 是否转义HTML */
  escapeValue?: boolean
  /** 默认值 */
  defaultValue?: string
  /** 插值前缀 */
  interpolationPrefix?: string
  /** 插值后缀 */
  interpolationSuffix?: string
}
```

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  /** 翻译调用次数 */
  translationCalls: number
  /** 平均翻译时间（毫秒） */
  averageTranslationTime: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 最慢的翻译记录 */
  slowestTranslations: SlowTranslation[]
  /** 语言加载时间 */
  languageLoadTimes: Record<string, number>
}
```

### BatchTranslationResult

```typescript
interface BatchTranslationResult {
  /** 翻译结果 */
  translations: Record<string, string>
  /** 成功数量 */
  successCount: number
  /** 失败数量 */
  failureCount: number
  /** 失败的键 */
  failedKeys: string[]
  /** 总耗时（毫秒） */
  totalTime: number
}
```

### LanguageInfo

```typescript
interface LanguageInfo {
  /** 语言代码 */
  code: string
  /** 英文名称 */
  name: string
  /** 本地名称 */
  nativeName: string
  /** 是否已加载 */
  loaded?: boolean
}
```
