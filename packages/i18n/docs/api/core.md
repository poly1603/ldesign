# 核心 API

本页面详细介绍了 @ldesign/i18n 的核心 API。

## I18n 类

主要的国际化类，提供完整的多语言功能。

### 构造函数

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
  defaultLocale: 'en',
  fallbackLocale: 'en',
  autoDetect: true,
})
```

### 方法

#### init()

```typescript
async init(): Promise<void>
```

初始化 I18n 实例，加载默认语言包。

**示例：**

```typescript
await i18n.init()
```

#### t()

```typescript
t<T = string>(
  key: string,
  params?: TranslationParams,
  options?: TranslationOptions
): T
```

翻译指定的键。

**参数：**

- `key` - 翻译键，支持点分隔的嵌套键
- `params` - 可选的插值参数
- `options` - 可选的翻译选项

**返回：**

- 翻译后的字符串

**示例：**

```typescript
// 基础翻译
i18n.t('common.ok') // "OK"

// 插值翻译
i18n.t('common.welcome', { name: 'John' }) // "Welcome, John!"

// 带选项的翻译
i18n.t('nonexistent.key', {}, { defaultValue: 'Default' }) // "Default"
```

#### changeLanguage()

```typescript
async changeLanguage(locale: string): Promise<void>
```

切换到指定语言。

**参数：**

- `locale` - 目标语言代码

**示例：**

```typescript
await i18n.changeLanguage('zh-CN')
```

#### getCurrentLanguage()

```typescript
getCurrentLanguage(): string
```

获取当前语言代码。

**返回：**

- 当前语言代码

**示例：**

```typescript
const currentLang = i18n.getCurrentLanguage() // "en"
```

#### getAvailableLanguages()

```typescript
getAvailableLanguages(): LanguageInfo[]
```

获取所有可用语言的信息。

**返回：**

- 语言信息数组

**示例：**

```typescript
const languages = i18n.getAvailableLanguages()
// [
//   { name: 'English', nativeName: 'English', code: 'en', ... },
//   { name: '中文', nativeName: '中文（简体）', code: 'zh-CN', ... }
// ]
```

#### batchTranslate()

```typescript
batchTranslate(
  keys: string[],
  params?: TranslationParams
): BatchTranslationResult
```

批量翻译多个键。

**参数：**

- `keys` - 翻译键数组
- `params` - 可选的插值参数

**返回：**

- 键值对形式的翻译结果

**示例：**

```typescript
const result = i18n.batchTranslate(['common.ok', 'common.cancel'])
// { 'common.ok': 'OK', 'common.cancel': 'Cancel' }
```

#### exists()

```typescript
exists(key: string, locale?: string): boolean
```

检查翻译键是否存在。

**参数：**

- `key` - 翻译键
- `locale` - 可选的语言代码，默认为当前语言

**返回：**

- 是否存在

**示例：**

```typescript
i18n.exists('common.ok') // true
i18n.exists('nonexistent.key') // false
```

#### preloadLanguage()

```typescript
async preloadLanguage(locale: string): Promise<void>
```

预加载指定语言包。

**参数：**

- `locale` - 语言代码

**示例：**

```typescript
await i18n.preloadLanguage('zh-CN')
```

#### isLanguageLoaded()

```typescript
isLanguageLoaded(locale: string): boolean
```

检查语言包是否已加载。

**参数：**

- `locale` - 语言代码

**返回：**

- 是否已加载

**示例：**

```typescript
i18n.isLanguageLoaded('en') // true
```

### 事件方法

#### on()

```typescript
on(event: I18nEventType, listener: I18nEventListener): void
```

添加事件监听器。

**参数：**

- `event` - 事件类型
- `listener` - 监听器函数

**示例：**

```typescript
i18n.on('languageChanged', (locale, previousLocale) => {
  console.log(`Language changed from ${previousLocale} to ${locale}`)
})
```

#### off()

```typescript
off(event: I18nEventType, listener: I18nEventListener): void
```

移除事件监听器。

#### emit()

```typescript
emit(event: I18nEventType, ...args: any[]): void
```

触发事件。

## 配置选项

### I18nOptions

```typescript
interface I18nOptions {
  defaultLocale: string // 默认语言
  fallbackLocale?: string // 降级语言
  storage?: 'localStorage' | 'sessionStorage' | 'none' // 存储方式
  storageKey?: string // 存储键名
  autoDetect?: boolean // 自动检测浏览器语言
  preload?: string[] // 预加载的语言列表
  cache?: CacheOptions // 缓存配置
  onLanguageChanged?: (locale: string) => void // 语言切换回调
  onLoadError?: (locale: string, error: Error) => void // 加载错误回调
}
```

### CacheOptions

```typescript
interface CacheOptions {
  enabled: boolean // 是否启用缓存
  maxSize: number // 最大缓存条目数
}
```

### TranslationOptions

```typescript
interface TranslationOptions {
  defaultValue?: string // 默认值
  escapeValue?: boolean // 是否转义HTML
  count?: number // 计数（用于复数）
  context?: string // 上下文
}
```

## 便捷函数

### createI18n()

```typescript
function createI18n(options?: I18nOptions): I18nInstance
```

创建 I18n 实例的便捷函数。

### createI18nWithBuiltinLocales()

```typescript
async function createI18nWithBuiltinLocales(options?: I18nOptions): Promise<I18nInstance>
```

创建带有内置语言包的 I18n 实例。

### createSimpleI18n()

```typescript
async function createSimpleI18n(options?: I18nOptions): Promise<I18nInstance>
```

创建简单的 I18n 实例（仅英语）。

## 事件类型

### I18nEventType

```typescript
type I18nEventType = 'languageChanged' | 'loaded' | 'loadError'
```

- `languageChanged` - 语言切换时触发
- `loaded` - 语言包加载完成时触发
- `loadError` - 语言包加载失败时触发

## 类型定义

### LanguageInfo

```typescript
interface LanguageInfo {
  name: string // 语言显示名称
  nativeName: string // 本地语言名称
  code: string // ISO 639-1 语言代码
  region?: string // ISO 3166-1 区域代码
  direction: 'ltr' | 'rtl' // 文本方向
  dateFormat: string // 默认日期格式
}
```

### TranslationParams

```typescript
type TranslationParams = Record<string, any>
```

翻译参数对象，用于字符串插值。

### BatchTranslationResult

```typescript
interface BatchTranslationResult {
  [key: string]: string
}
```

批量翻译的结果对象。

## 🆕 增强功能 API

### 格式化方法

#### formatDate()

```typescript
formatDate(date: Date | number | string, options?: DateFormatOptions): string
```

格式化日期。

**参数：**
- `date` - 要格式化的日期
- `options` - 格式化选项

**示例：**
```typescript
i18n.formatDate(new Date()) // "12/25/2023"
i18n.formatDate(new Date(), { dateStyle: 'full' }) // "Monday, December 25, 2023"
```

#### formatNumber()

```typescript
formatNumber(number: number, options?: NumberFormatOptions): string
```

格式化数字。

**示例：**
```typescript
i18n.formatNumber(1234567.89) // "1,234,567.89"
i18n.formatNumber(1234567, { compact: true }) // "1.2M"
```

#### formatCurrency()

```typescript
formatCurrency(amount: number, currency?: string, options?: any): string
```

格式化货币。

**示例：**
```typescript
i18n.formatCurrency(1234.56, 'USD') // "$1,234.56"
i18n.formatCurrency(1234.56, 'EUR') // "€1,234.56"
```

#### formatPercent()

```typescript
formatPercent(value: number, options?: any): string
```

格式化百分比。

**示例：**
```typescript
i18n.formatPercent(0.1234) // "12%"
```

#### formatRelativeTime()

```typescript
formatRelativeTime(date: Date, unit?: any): string
```

格式化相对时间。

**示例：**
```typescript
const oneHourAgo = new Date(Date.now() - 3600000)
i18n.formatRelativeTime(oneHourAgo) // "1 hour ago"
```

#### formatList()

```typescript
formatList(items: string[], options?: any): string
```

格式化列表。

**示例：**
```typescript
i18n.formatList(['Apple', 'Banana', 'Orange']) // "Apple, Banana, and Orange"
```

#### format()

```typescript
format(name: string, value: any, options?: any): string
```

使用自定义格式化器。

**示例：**
```typescript
i18n.format('fileSize', 1024 * 1024 * 2.5) // "2.50 MB"
```

#### registerFormatter()

```typescript
registerFormatter(name: string, formatter: FormatterFunction): void
```

注册自定义格式化器。

**示例：**
```typescript
i18n.registerFormatter('temperature', (celsius: number) => {
  const fahrenheit = (celsius * 9/5) + 32
  return `${celsius}°C (${fahrenheit.toFixed(1)}°F)`
})
```

### 缓存管理方法

#### getCacheStats()

```typescript
getCacheStats(): CacheStats
```

获取翻译缓存统计信息。

**返回：**
```typescript
interface CacheStats {
  size: number
  maxSize: number
  hitCount: number
  missCount: number
  hitRate: number
  evictionCount: number
}
```

#### clearTranslationCache()

```typescript
clearTranslationCache(): void
```

清除翻译缓存。

#### clearFormatterCache()

```typescript
clearFormatterCache(): void
```

清除格式化器缓存。

#### clearPluralizationCache()

```typescript
clearPluralizationCache(): void
```

清除多元化缓存。

#### clearAllCaches()

```typescript
clearAllCaches(): void
```

清除所有缓存。

## 增强组件

### TranslationCache

高性能翻译缓存类。

```typescript
class TranslationCache extends PerformanceCache<string> {
  constructor(config?: CacheConfig)
  cacheTranslation(locale: string, key: string, params: Record<string, any> | undefined, result: string): void
  getCachedTranslation(locale: string, key: string, params?: Record<string, any>): string | undefined
}
```

### PluralizationEngine

增强的多元化引擎。

```typescript
class PluralizationEngine {
  constructor()
  getCategory(locale: string, count: number, options?: PluralOptions): PluralCategory
  registerRule(locale: string, rule: PluralRuleFunction): void
  getSupportedLocales(): string[]
  clearCache(locale?: string): void
}
```

### FormatterEngine

强大的格式化引擎。

```typescript
class FormatterEngine {
  constructor(config?: FormatterConfig)
  formatDate(date: Date | number | string, locale?: string, options?: DateFormatOptions): string
  formatNumber(number: number, locale?: string, options?: NumberFormatOptions): string
  formatCurrency(amount: number, locale?: string, currency?: string, options?: any): string
  formatPercent(value: number, locale?: string, options?: any): string
  formatRelativeTime(date: Date, locale?: string, unit?: any): string
  formatList(items: string[], locale?: string, options?: any): string
  registerFormatter(name: string, formatter: FormatterFunction): void
  format(name: string, value: any, locale?: string, options?: any): string
}
```

### 类型定义

#### CacheConfig

```typescript
interface CacheConfig {
  maxSize?: number
  ttl?: number
  enableLRU?: boolean
  strategy?: 'lru' | 'lfu' | 'fifo'
}
```

#### PluralOptions

```typescript
interface PluralOptions {
  ordinal?: boolean
  customRule?: PluralRuleFunction
}
```

#### FormatterConfig

```typescript
interface FormatterConfig {
  defaultLocale?: string
  timeZone?: string
  currency?: string
  customFormatters?: Record<string, FormatterFunction>
}
```
