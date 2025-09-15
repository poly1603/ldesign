# 国际化支持功能实现文档

## 概述

国际化支持功能模块为LogicFlow流程图编辑器提供了完整的多语言支持，包括界面本地化、内容翻译、格式化、RTL语言支持等企业级国际化能力。

## 🎯 核心功能

### 1. 多语言支持
- **16种语言**: 支持中文（简/繁）、英语、日语、韩语、法语、德语、西班牙语、意大利语、葡萄牙语、俄语、阿拉伯语、印地语、泰语、越南语
- **动态语言切换**: 运行时无刷新切换语言
- **自动语言检测**: 基于浏览器、URL、本地存储等多种检测策略
- **回退机制**: 智能的语言回退策略

### 2. 翻译管理
- **命名空间支持**: 模块化的翻译资源管理
- **插值和复数**: 支持参数插值和复数形式处理
- **上下文翻译**: 基于上下文的翻译变体
- **缺失翻译处理**: 优雅的缺失翻译处理机制

### 3. 资源加载
- **多种加载器**: HTTP、静态资源、本地存储、缓存加载器
- **懒加载**: 按需加载翻译资源
- **预加载**: 预加载常用语言和命名空间
- **缓存机制**: 智能的资源缓存策略

### 4. 格式化功能
- **日期时间格式化**: 本地化的日期时间显示
- **数字格式化**: 本地化的数字、货币格式
- **相对时间**: 相对时间格式化
- **RTL支持**: 右到左语言的完整支持

### 5. 开发工具
- **调试模式**: 详细的调试信息和日志
- **翻译验证**: 翻译完整性验证
- **统计报告**: 翻译完成度统计
- **热重载**: 开发时的翻译热重载

## 🏗️ 架构设计

### 核心组件

```
I18nManager (国际化管理器)
├── ResourceLoader (资源加载器接口)
│   ├── HttpResourceLoader (HTTP加载器)
│   ├── StaticResourceLoader (静态资源加载器)
│   ├── LocalStorageResourceLoader (本地存储加载器)
│   └── CacheResourceLoader (缓存加载器)
├── LanguageDetector (语言检测器接口)
│   ├── BrowserLanguageDetector (浏览器检测器)
│   ├── LocalStorageLanguageDetector (本地存储检测器)
│   ├── CookieLanguageDetector (Cookie检测器)
│   ├── UrlLanguageDetector (URL参数检测器)
│   └── PathLanguageDetector (路径检测器)
├── MissingTranslationHandler (缺失翻译处理器)
└── I18nPlugin (LogicFlow插件)
```

### 数据流

```
语言检测 → 资源加载 → 翻译处理 → 格式化 → UI更新
     ↓
   缓存存储 ← 翻译验证 ← 插值处理 ← 复数处理
```

## 📋 API 接口

### I18nManager

```typescript
class I18nManager {
  // 初始化
  initialize(config: I18nConfig): Promise<void>
  
  // 语言管理
  getCurrentLocale(): SupportedLocale
  setCurrentLocale(locale: SupportedLocale): Promise<void>
  getSupportedLocales(): LocaleInfo[]
  getLocaleInfo(locale: SupportedLocale): LocaleInfo | null
  
  // 资源管理
  loadResource(locale: SupportedLocale, namespace: string): Promise<void>
  unloadResource(locale: SupportedLocale, namespace: string): void
  isResourceLoaded(locale: SupportedLocale, namespace: string): boolean
  
  // 翻译功能
  t(key: TranslationKey, options?: TranslationOptions): string
  exists(key: TranslationKey, options?: { namespace?: string }): boolean
  plural(key: TranslationKey, count: number, options?: TranslationOptions): string
  
  // 格式化功能
  formatDate(date: Date, options?: DateTimeFormatOptions): string
  formatTime(date: Date, options?: DateTimeFormatOptions): string
  formatDateTime(date: Date, options?: DateTimeFormatOptions): string
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string
  formatCurrency(amount: number, options?: CurrencyFormatOptions): string
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string
  
  // 组件注册
  registerResourceLoader(loader: ResourceLoader): void
  registerLanguageDetector(detector: LanguageDetector): void
  registerMissingTranslationHandler(handler: MissingTranslationHandler): void
}
```

### I18nPlugin

```typescript
class I18nPlugin extends BasePlugin {
  // 核心功能
  getCurrentLocale(): SupportedLocale
  setCurrentLocale(locale: SupportedLocale): Promise<void>
  getSupportedLocales(): LocaleInfo[]
  
  // 翻译功能
  t(key: TranslationKey, options?: TranslationOptions): string
  exists(key: TranslationKey, options?: { namespace?: string }): boolean
  plural(key: TranslationKey, count: number, options?: TranslationOptions): string
  
  // 格式化功能
  formatDate(date: Date, options?: DateTimeFormatOptions): string
  formatTime(date: Date, options?: DateTimeFormatOptions): string
  formatDateTime(date: Date, options?: DateTimeFormatOptions): string
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string
  formatCurrency(amount: number, options?: CurrencyFormatOptions): string
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string
}
```

## 🔧 使用示例

### 基本使用

```typescript
import { I18nPlugin } from './src/i18n'

// 创建插件实例
const i18nPlugin = new I18nPlugin({
  defaultLocale: 'en-US',
  supportedLocales: ['en-US', 'zh-CN', 'ja-JP'],
  showLanguageSwitcher: true,
  enableAutoDetection: true
})

// 安装插件
await lf.use(i18nPlugin)

// 使用翻译
const title = lf.t('flowchart.title')
const message = lf.t('flowchart.messages.saved')

// 切换语言
await lf.setCurrentLocale('zh-CN')

// 格式化
const date = lf.formatDate(new Date())
const price = lf.formatCurrency(1234.56, { currency: 'USD' })
```

### 高级配置

```typescript
const plugin = new I18nPlugin({
  // 基本配置
  defaultLocale: 'en-US',
  fallbackLocale: 'en-US',
  supportedLocales: ['en-US', 'zh-CN', 'ja-JP', 'fr-FR', 'de-DE'],
  
  // 资源配置
  resourcePath: '/locales/{{locale}}/{{namespace}}.json',
  defaultNamespace: 'flowchart',
  
  // 插值配置
  interpolation: {
    prefix: '{{',
    suffix: '}}',
    escapeValue: true
  },
  
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 100,
    ttl: 30 * 60 * 1000
  },
  
  // 预加载配置
  preload: {
    enabled: true,
    locales: ['en-US', 'zh-CN'],
    namespaces: ['flowchart', 'common']
  },
  
  // UI配置
  showLanguageSwitcher: true,
  switcherPosition: 'top-right',
  enableRtlSupport: true,
  
  // 自定义资源
  customResources: {
    'en-US:custom': {
      greeting: 'Hello {{name}}!',
      items: {
        one: '{{count}} item',
        other: '{{count}} items'
      }
    },
    'zh-CN:custom': {
      greeting: '你好 {{name}}！',
      items: {
        other: '{{count}} 个项目'
      }
    }
  },
  
  // 调试模式
  debugMode: true
})
```

### 自定义组件

```typescript
// 自定义资源加载器
class DatabaseResourceLoader implements ResourceLoader {
  name = 'DatabaseResourceLoader'
  protocols = ['db']
  
  async load(url: string, locale: SupportedLocale, namespace: string): Promise<TranslationResource> {
    const data = await this.database.getTranslations(locale, namespace)
    return {
      locale,
      namespace,
      translations: data,
      version: '1.0.0',
      lastUpdated: Date.now()
    }
  }
  
  async exists(url: string, locale: SupportedLocale, namespace: string): Promise<boolean> {
    return await this.database.hasTranslations(locale, namespace)
  }
  
  async getMetadata(url: string, locale: SupportedLocale, namespace: string): Promise<ResourceMetadata> {
    return await this.database.getTranslationMetadata(locale, namespace)
  }
}

// 注册自定义加载器
i18nPlugin.manager.registerResourceLoader(new DatabaseResourceLoader())

// 自定义语言检测器
const customDetector = new CustomLanguageDetector(
  () => {
    // 从用户配置中检测语言
    return getUserPreferredLanguage()
  },
  300, // 高优先级
  (locale) => {
    // 保存用户语言偏好
    saveUserPreferredLanguage(locale)
  }
)

i18nPlugin.manager.registerLanguageDetector(customDetector)
```

### 翻译资源结构

```typescript
// 翻译资源文件结构
const translations = {
  // 简单翻译
  title: 'Flowchart Editor',
  
  // 嵌套翻译
  menu: {
    file: 'File',
    edit: 'Edit',
    view: 'View'
  },
  
  // 插值翻译
  welcome: 'Welcome {{name}}!',
  
  // 复数翻译
  items: {
    one: '{{count}} item',
    other: '{{count}} items'
  },
  
  // 上下文翻译
  button_save: 'Save',
  button_save_document: 'Save Document',
  
  // HTML翻译
  description: 'This is a <strong>flowchart</strong> editor.'
}

// 使用示例
lf.t('title') // "Flowchart Editor"
lf.t('menu.file') // "File"
lf.t('welcome', { params: { name: 'John' } }) // "Welcome John!"
lf.t('items', { count: 1 }) // "1 item"
lf.t('items', { count: 5 }) // "5 items"
lf.t('button', { context: 'save' }) // "Save"
lf.t('button', { context: 'save_document' }) // "Save Document"
```

## 🎨 UI 集成

### 语言切换器

插件自动创建语言切换器，包含：
- 下拉选择框显示所有支持的语言
- 显示语言的本地化名称
- 支持4个位置：左上、右上、左下、右下
- 自动更新当前选中语言

### RTL支持

自动处理右到左语言：
- 自动设置容器的 `direction` 属性
- 添加 `lf-rtl` 或 `lf-ltr` CSS类
- 支持阿拉伯语等RTL语言

### 响应式设计

- 语言切换器自适应容器大小
- 支持移动端触摸操作
- 键盘导航支持

## 📊 性能优化

### 1. 资源加载优化
- **懒加载**: 按需加载翻译资源
- **预加载**: 预加载常用语言
- **缓存策略**: 多层缓存机制
- **压缩**: 支持资源压缩

### 2. 内存管理
- **资源卸载**: 自动卸载不用的资源
- **缓存清理**: 定期清理过期缓存
- **内存监控**: 监控内存使用情况

### 3. 渲染优化
- **格式化器缓存**: 缓存Intl格式化器
- **翻译缓存**: 缓存翻译结果
- **批量更新**: 批量更新UI元素

## 🔍 调试和开发

### 调试模式

```typescript
const plugin = new I18nPlugin({
  debugMode: true,
  debug: true
})

// 启用调试后会输出：
// - 语言检测过程
// - 资源加载日志
// - 翻译缺失警告
// - 性能统计信息
```

### 翻译验证

```typescript
// 验证翻译完整性
const validation = I18nUtils.validateTranslations(
  baseTranslations,
  targetTranslations
)

console.log('缺失翻译:', validation.missing)
console.log('多余翻译:', validation.extra)

// 计算完成率
const completionRate = I18nUtils.calculateCompletionRate(
  baseTranslations,
  targetTranslations
)

console.log('翻译完成率:', completionRate + '%')
```

### 开发工具

```typescript
// 生成翻译统计报告
const report = I18nUtils.generateTranslationReport(allTranslations)
console.log('翻译统计:', report)

// 扁平化翻译对象（便于导出）
const flatTranslations = I18nUtils.flattenTranslations(translations)

// 合并翻译对象
const merged = I18nUtils.mergeTranslations(base, override)
```

## 🧪 测试

### 单元测试
- I18nManager核心功能测试
- 资源加载器测试
- 语言检测器测试
- 格式化功能测试

### 集成测试
- 完整国际化流程测试
- 语言切换测试
- UI集成测试

### 本地化测试
- 多语言界面测试
- RTL语言测试
- 格式化正确性测试

## 🚀 扩展性

### 添加新语言

1. 在 `SupportedLocale` 类型中添加新语言代码
2. 在 `getLocaleInfo` 方法中添加语言信息
3. 创建翻译资源文件
4. 更新配置中的 `supportedLocales`

### 自定义格式化

```typescript
// 自定义数字格式化
class CustomNumberFormatter {
  format(number: number, locale: SupportedLocale): string {
    // 自定义格式化逻辑
    return customFormat(number, locale)
  }
}

// 注册自定义格式化器
i18nPlugin.registerFormatter('number', new CustomNumberFormatter())
```

### 扩展翻译功能

```typescript
// 自定义后处理器
class MarkdownPostProcessor implements PostProcessor {
  name = 'markdown'
  type = 'postProcessor'
  
  process(value: string, key: TranslationKey, options: TranslationOptions): string {
    // 处理Markdown语法
    return this.renderMarkdown(value)
  }
}

i18nPlugin.manager.registerPostProcessor(new MarkdownPostProcessor())
```

## 📈 未来规划

### 短期目标
- 添加更多语言支持
- 优化资源加载性能
- 增强调试工具

### 中期目标
- 翻译管理界面
- 自动翻译集成
- 更多格式化选项

### 长期目标
- AI辅助翻译
- 实时协作翻译
- 云端翻译服务

## 📝 总结

国际化支持功能模块为LogicFlow编辑器提供了企业级的多语言支持能力，包括16种语言支持、智能语言检测、资源管理、格式化功能、RTL支持等。通过模块化设计和插件架构，可以轻松扩展新的语言和功能，满足全球化应用的需求。

该模块的实现大大提升了编辑器的国际化能力，使其能够服务于全球用户，提供本地化的用户体验。
