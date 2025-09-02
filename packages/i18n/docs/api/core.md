# 核心 API

本页面详细介绍了 @ldesign/i18n 的核心 API。

## I18n 类

### 构造函数

```typescript
new I18n(options: I18nOptions)
```

创建一个新的 I18n 实例。

#### 参数

- `options` - I18n 配置选项

#### 示例

```typescript
import { I18n } from '@ldesign/i18n'

const i18n = new I18n({
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { hello: '你好' },
    'en': { hello: 'Hello' }
  }
})
```

### 方法

#### init()

```typescript
async init(): Promise<void>
```

初始化 I18n 实例，加载默认语言包。

```typescript
await i18n.init()
```

#### t()

```typescript
t(key: string, params?: InterpolationParams): string
```

翻译指定的键。

**参数：**
- `key` - 翻译键，支持嵌套路径（如 `user.profile.name`）
- `params` - 插值参数

**返回：** 翻译后的文本

```typescript
// 基础翻译
i18n.t('hello') // "你好"

// 带参数翻译
i18n.t('welcome', { name: '张三' }) // "欢迎 张三！"

// 嵌套键翻译
i18n.t('user.profile.name') // "姓名"
```

#### exists()

```typescript
exists(key: string, locale?: string): boolean
```

检查翻译键是否存在。

**参数：**
- `key` - 翻译键
- `locale` - 可选，指定语言代码

**返回：** 键是否存在

```typescript
i18n.exists('hello') // true
i18n.exists('nonexistent') // false
i18n.exists('hello', 'en') // true
```

#### changeLanguage()

```typescript
async changeLanguage(locale: string): Promise<void>
```

切换当前语言。

**参数：**
- `locale` - 目标语言代码

```typescript
await i18n.changeLanguage('en')
```

#### getCurrentLanguage()

```typescript
getCurrentLanguage(): string
```

获取当前语言代码。

```typescript
const currentLang = i18n.getCurrentLanguage() // "zh-CN"
```

#### getAvailableLanguages()

```typescript
getAvailableLanguages(): string[]
```

获取所有可用的语言代码列表。

```typescript
const languages = i18n.getAvailableLanguages() // ["zh-CN", "en"]
```

#### translateBatch()

```typescript
translateBatch(keys: string[], params?: InterpolationParams): BatchTranslationResult
```

批量翻译多个键。

**参数：**
- `keys` - 翻译键数组
- `params` - 插值参数

**返回：** 批量翻译结果

```typescript
const result = i18n.translateBatch(['hello', 'welcome'], { name: '张三' })
// {
//   translations: {
//     hello: '你好',
//     welcome: '欢迎 张三！'
//   },
//   errors: []
// }
```

## createI18n 函数

```typescript
createI18n(options: CreateI18nOptions): I18n
```

便捷函数，用于创建和配置 I18n 实例。

```typescript
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': { hello: '你好' },
    'en': { hello: 'Hello' }
  }
})
```

## 全局实例管理

### createGlobalI18n()

```typescript
createGlobalI18n(options: CreateI18nOptions): I18n
```

创建全局 I18n 实例。

```typescript
import { createGlobalI18n } from '@ldesign/i18n'

const globalI18n = createGlobalI18n({
  locale: 'zh-CN',
  messages: { /* ... */ }
})
```

### getGlobalI18n()

```typescript
getGlobalI18n(): I18n | null
```

获取全局 I18n 实例。

```typescript
import { getGlobalI18n } from '@ldesign/i18n'

const i18n = getGlobalI18n()
if (i18n) {
  console.log(i18n.t('hello'))
}
```

### hasGlobalI18n()

```typescript
hasGlobalI18n(): boolean
```

检查是否存在全局 I18n 实例。

```typescript
import { hasGlobalI18n } from '@ldesign/i18n'

if (hasGlobalI18n()) {
  // 全局实例存在
}
```

### destroyGlobalI18n()

```typescript
async destroyGlobalI18n(): Promise<void>
```

销毁全局 I18n 实例。

```typescript
import { destroyGlobalI18n } from '@ldesign/i18n'

await destroyGlobalI18n()
```

## 类型定义

### I18nOptions

```typescript
interface I18nOptions {
  /** 默认语言 */
  defaultLocale: string
  
  /** 降级语言 */
  fallbackLocale?: string
  
  /** 语言包 */
  messages?: TranslationMessages
  
  /** 加载器实例 */
  loader?: Loader
  
  /** 存储类型 */
  storage?: StorageType | Storage
  
  /** 存储键名 */
  storageKey?: string
  
  /** 是否自动检测语言 */
  autoDetect?: boolean
  
  /** 预加载的语言列表 */
  preload?: string[]
  
  /** 缓存配置 */
  cache?: CacheOptions
  
  /** 语言变化回调 */
  onLanguageChanged?: (locale: string) => void
  
  /** 加载错误回调 */
  onLoadError?: (error: Error) => void
}
```

### InterpolationParams

```typescript
type InterpolationParams = Record<string, string | number | boolean | null | undefined>
```

### BatchTranslationResult

```typescript
interface BatchTranslationResult {
  /** 翻译结果 */
  translations: Record<string, string>
  
  /** 错误列表 */
  errors: Array<{
    key: string
    error: string
  }>
}
```

### TranslationMessages

```typescript
type TranslationMessages = Record<string, Record<string, unknown>>
```

## 错误处理

### TranslationError

```typescript
class TranslationError extends Error {
  constructor(
    message: string,
    public key: string,
    public locale: string,
    public cause?: Error
  )
}
```

翻译过程中发生的错误。

### LoaderError

```typescript
class LoaderError extends Error {
  constructor(
    message: string,
    public locale: string,
    public cause?: Error
  )
}
```

语言包加载过程中发生的错误。

## 事件系统

I18n 实例支持事件监听：

```typescript
// 监听语言变化
i18n.on('languageChanged', (locale: string) => {
  console.log('语言已切换到:', locale)
})

// 监听翻译错误
i18n.on('translationError', (error: TranslationError) => {
  console.error('翻译错误:', error)
})

// 监听加载错误
i18n.on('loadError', (error: LoaderError) => {
  console.error('加载错误:', error)
})
```

## 性能监控

```typescript
// 获取性能统计
const stats = i18n.getPerformanceStats()
console.log('翻译次数:', stats.translationCount)
console.log('缓存命中率:', stats.cacheHitRate)
console.log('平均翻译时间:', stats.averageTranslationTime)

// 重置统计
i18n.resetPerformanceStats()
```

## 调试模式

```typescript
const i18n = new I18n({
  defaultLocale: 'zh-CN',
  debug: true, // 启用调试模式
  // ...
})

// 调试模式下会输出详细的日志信息
```
