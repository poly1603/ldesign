# 故障排除

本页面列出了使用 @ldesign/i18n 时的常见问题和解决方案。

## 常见问题

### 翻译不显示

**问题：** 翻译键返回键名本身而不是翻译文本

**可能原因：**

1. 翻译键不存在
2. 语言包未正确加载
3. 当前语言设置错误

**解决方案：**

```typescript
// 1. 检查翻译键是否存在
console.log(i18n.exists('your.translation.key'))

// 2. 检查当前语言
console.log(i18n.getCurrentLanguage())

// 3. 检查可用语言
console.log(i18n.getAvailableLanguages())

// 4. 检查语言包是否加载
console.log(i18n.isLanguageLoaded('en'))

// 5. 使用默认值
const text = i18n.t('missing.key', {}, { defaultValue: 'Default Text' })
```

### 插值不工作

**问题：** 插值参数没有被正确替换

**可能原因：**

1. 参数名称不匹配
2. 参数值为 undefined 或 null
3. 插值语法错误

**解决方案：**

```typescript
// ❌ 错误的参数名
i18n.t('hello.user', { username: 'John' }) // 翻译: "Hello {{name}}"

// ✅ 正确的参数名
i18n.t('hello.user', { name: 'John' })

// ❌ 参数值为空
i18n.t('hello.user', { name: undefined })

// ✅ 提供默认值
i18n.t('hello.user', { name: userName || 'Guest' })

// 检查插值键
const keys = i18n.extractInterpolationKeys('hello.user')
console.log('Required parameters:', keys)
```

### 复数形式不正确

**问题：** 复数规则没有按预期工作

**可能原因：**

1. ICU 语法错误
2. count 参数缺失或错误
3. 语言的复数规则不了解

**解决方案：**

```typescript
// ✅ 正确的 ICU 复数语法
{
  "items": "{count, plural, =0 {no items} =1 {one item} other {# items}}"
}

// ✅ 使用时提供 count 参数
i18n.t('items', { count: 5 })

// 检查复数键
const pluralKeys = i18n.extractPluralizationKeys('items')
console.log('Plural forms:', pluralKeys)

// 测试不同的 count 值
[0, 1, 2, 5, 10].forEach(count => {
  console.log(`${count}: ${i18n.t('items', { count })}`)
})
```

### Vue 组件中翻译不更新

**问题：** 切换语言后 Vue 组件中的翻译没有更新

**可能原因：**

1. 没有使用响应式的翻译方法
2. 组件没有正确监听语言变化
3. 使用了缓存的翻译结果

**解决方案：**

```vue
<script setup>
import { useI18n } from '@ldesign/i18n/vue'

// ✅ 使用响应式的 t 函数
const { t } = useI18n()

// ❌ 不要在 setup 中缓存翻译结果
const title = t('page.title') // 这不会响应语言变化

// ✅ 在模板中直接使用或使用 computed
const title = computed(() => t('page.title'))
</script>

<template>
  <!-- ✅ 直接在模板中使用 -->
  <h1>{{ t('page.title') }}</h1>

  <!-- ✅ 使用指令 -->
  <h1 v-t="'page.title'"></h1>

  <!-- ✅ 使用计算属性 -->
  <h1>{{ title }}</h1>
</template>
```

### 语言包加载失败

**问题：** 语言包无法加载或加载错误

**可能原因：**

1. 文件路径错误
2. 网络请求失败
3. 文件格式错误
4. 权限问题

**解决方案：**

```typescript
// 1. 监听加载错误
i18n.on('loadError', (locale, error) => {
  console.error(`Failed to load ${locale}:`, error)

  // 降级到默认语言
  if (locale !== 'en') {
    i18n.changeLanguage('en')
  }
})

// 2. 检查文件路径
const loader = new HttpLoader({
  baseUrl: '/locales', // 确保路径正确
  fileExtension: '.json',
})

// 3. 添加重试机制
class RetryLoader implements Loader {
  constructor(private baseLoader: Loader, private maxRetries = 3) {}

  async load(locale: string): Promise<LanguagePackage> {
    let lastError: Error

    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await this.baseLoader.load(locale)
      } catch (error) {
        lastError = error as Error
        console.warn(`Retry ${i + 1}/${this.maxRetries} for ${locale}`)
        await this.delay(1000 * (i + 1)) // 递增延迟
      }
    }

    throw lastError!
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

### TypeScript 类型错误

**问题：** TypeScript 编译时出现类型错误

**可能原因：**

1. 类型定义不匹配
2. 模块解析问题
3. 版本兼容性问题

**解决方案：**

```typescript
// 1. 确保正确导入类型
import type { I18nInstance, TranslationFunction } from '@ldesign/i18n'

// 2. 扩展全局类型（如果需要）
declare global {
  interface Window {
    i18n: I18nInstance
  }
}

// 3. Vue 项目的类型声明
// types/vue.d.ts
declare module 'vue' {
  interface ComponentCustomProperties {
    $t: TranslationFunction
  }
}

// 4. 如果遇到模块解析问题
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "paths": {
      "@ldesign/i18n": ["./node_modules/@ldesign/i18n/dist/index.d.ts"],
      "@ldesign/i18n/vue": ["./node_modules/@ldesign/i18n/dist/vue.d.ts"]
    }
  }
}
```

### 性能问题

**问题：** 翻译性能慢或内存使用过高

**可能原因：**

1. 缓存配置不当
2. 语言包过大
3. 频繁的语言切换
4. 内存泄漏

**解决方案：**

```typescript
// 1. 优化缓存配置
const i18n = new I18n({
  cache: {
    enabled: true,
    maxSize: 1000,      // 限制缓存大小
    ttl: 5 * 60 * 1000  // 设置过期时间
  }
})

// 2. 使用懒加载
class LazyLoader implements Loader {
  private loadedModules = new Map<string, any>()

  async load(locale: string): Promise<LanguagePackage> {
    if (!this.loadedModules.has(locale)) {
      // 只加载需要的模块
      const module = await import(`./locales/${locale}/index.js`)
      this.loadedModules.set(locale, module.default)
    }

    return this.loadedModules.get(locale)
  }
}

// 3. 分割大型语言包
{
  "common": { /* 常用翻译 */ },
  "pages": {
    "home": { /* 首页翻译 */ },
    "profile": { /* 个人资料翻译 */ }
  }
}

// 按需加载页面翻译
await i18n.loadNamespace('pages.profile')

// 4. 清理不需要的语言包
i18n.unloadLanguage('unused-locale')

// 5. 监控内存使用
setInterval(() => {
  console.log('Cache size:', i18n.getCacheSize())
  console.log('Loaded languages:', i18n.getLoadedLanguages())
}, 30000)
```

## 调试技巧

### 启用调试模式

```typescript
// 启用详细日志
const i18n = new I18n({
  debug: true, // 启用调试模式
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  },
})

// 监听所有事件
i18n.on('*', (eventName, ...args) => {
  console.log(`I18n Event: ${eventName}`, args)
})
```

### 翻译键追踪

```typescript
// 追踪翻译键的使用
class TrackedI18n extends I18n {
  private usageStats = new Map<string, number>()

  t(key: string, params?: any, options?: any): string {
    // 记录使用统计
    this.usageStats.set(key, (this.usageStats.get(key) || 0) + 1)

    return super.t(key, params, options)
  }

  getUsageStats(): Map<string, number> {
    return new Map(this.usageStats)
  }

  getUnusedKeys(): string[] {
    const allKeys = this.getKeys()
    return allKeys.filter(key => !this.usageStats.has(key))
  }
}
```

### 开发工具集成

```typescript
// 浏览器开发工具扩展
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).__I18N_DEVTOOLS__ = {
    instance: i18n,
    changeLanguage: (locale: string) => i18n.changeLanguage(locale),
    getTranslation: (key: string) => i18n.t(key),
    getUsageStats: () => (i18n as TrackedI18n).getUsageStats(),
    validateTranslations: () => {
      const validator = new TranslationValidator()
      return validator.validate()
    },
  }
}
```

## 错误代码参考

### E001: Translation Key Not Found

```
错误：翻译键 'xxx' 未找到
解决：检查键名拼写，确保语言包中存在该键
```

### E002: Language Package Load Failed

```
错误：语言包 'xxx' 加载失败
解决：检查文件路径、网络连接、文件格式
```

### E003: Invalid Interpolation Syntax

```
错误：插值语法错误
解决：检查 {{}} 语法，确保参数名正确
```

### E004: Pluralization Rule Error

```
错误：复数规则错误
解决：检查 ICU 复数语法，确保提供 count 参数
```

### E005: Circular Reference Detected

```
错误：检测到循环引用
解决：检查翻译键是否相互引用
```
