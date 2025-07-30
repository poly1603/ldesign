# 快速开始

本指南将帮助您快速上手 @ldesign/i18n，在几分钟内为您的项目添加多语言支持。

## 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/i18n
```

```bash [npm]
npm install @ldesign/i18n
```

```bash [yarn]
yarn add @ldesign/i18n
```

:::

## 基础用法

### 1. 创建 I18n 实例

最简单的方式是使用内置语言包：

```typescript
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'

const i18n = await createI18nWithBuiltinLocales({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  autoDetect: true
})
```

### 2. 基础翻译

```typescript
// 简单翻译
console.log(i18n.t('common.ok'))        // "OK"
console.log(i18n.t('common.cancel'))    // "Cancel"

// 嵌套键
console.log(i18n.t('menu.file.new'))    // "New"
```

### 3. 插值翻译

```typescript
// 带参数的翻译
console.log(i18n.t('common.welcome', { name: 'John' }))
// "Welcome, John!"

console.log(i18n.t('common.pageOf', { current: 1, total: 10 }))
// "Page 1 of 10"
```

### 4. 语言切换

```typescript
// 切换到中文
await i18n.changeLanguage('zh-CN')
console.log(i18n.t('common.ok'))        // "确定"

// 切换到日语
await i18n.changeLanguage('ja')
console.log(i18n.t('common.ok'))        // "OK"
```

## Vue 3 集成

### 1. 安装插件

```typescript
// main.ts
import { createApp } from 'vue'
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'
import { createI18n } from '@ldesign/i18n/vue'
import App from './App.vue'

async function bootstrap() {
  // 创建 I18n 实例
  const i18nInstance = await createI18nWithBuiltinLocales({
    defaultLocale: 'en',
    fallbackLocale: 'en'
  })

  // 创建 Vue 插件
  const vueI18nPlugin = createI18n(i18nInstance)

  // 创建应用并安装插件
  const app = createApp(App)
  app.use(vueI18nPlugin)
  app.mount('#app')
}

bootstrap()
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <!-- 使用组合式 API -->
    <h1>{{ t('common.welcome', { name: 'Vue' }) }}</h1>
    
    <!-- 使用全局属性 -->
    <p>{{ $t('common.description') }}</p>
    
    <!-- 使用指令 -->
    <button v-t="'common.save'"></button>
    <input v-t="{ key: 'common.searchPlaceholder' }" />
    
    <!-- 语言切换器 -->
    <select v-model="currentLocale" @change="handleLanguageChange">
      <option 
        v-for="lang in availableLanguages" 
        :key="lang.code" 
        :value="lang.code"
      >
        {{ lang.nativeName }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'

const { t, locale, availableLanguages, changeLanguage } = useI18n()

const currentLocale = ref(locale.value)

const handleLanguageChange = async () => {
  await changeLanguage(currentLocale.value)
}
</script>
```

## 配置选项

```typescript
const i18n = await createI18nWithBuiltinLocales({
  // 默认语言
  defaultLocale: 'en',
  
  // 降级语言（当翻译不存在时使用）
  fallbackLocale: 'en',
  
  // 自动检测浏览器语言
  autoDetect: true,
  
  // 存储方式
  storage: 'localStorage',
  storageKey: 'app-locale',
  
  // 预加载语言
  preload: ['en', 'zh-CN'],
  
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000
  },
  
  // 事件回调
  onLanguageChanged: (locale) => {
    console.log('Language changed to:', locale)
    document.documentElement.lang = locale
  },
  
  onLoadError: (locale, error) => {
    console.error(`Failed to load language '${locale}':`, error)
  }
})
```

## 内置语言包

@ldesign/i18n 内置了三种语言的完整翻译：

- **English (en)** - 英语
- **中文简体 (zh-CN)** - 简体中文  
- **日本語 (ja)** - 日语

每种语言包含以下模块：

- `common` - 通用文本（按钮、状态、导航等）
- `validation` - 表单验证信息
- `menu` - 菜单相关文本
- `date` - 日期时间格式

### 使用示例

```typescript
// 通用文本
i18n.t('common.ok')           // "OK" / "确定" / "OK"
i18n.t('common.cancel')       // "Cancel" / "取消" / "キャンセル"
i18n.t('common.loading')      // "Loading..." / "加载中..." / "読み込み中..."

// 验证信息
i18n.t('validation.required') // "This field is required" / "此字段为必填项" / "この項目は必須です"

// 菜单文本
i18n.t('menu.file.new')      // "New" / "新建" / "新規"
i18n.t('menu.edit.copy')     // "Copy" / "复制" / "コピー"

// 日期格式
i18n.t('date.formats.short') // "M/D/YYYY" / "YYYY/M/D" / "YYYY/M/D"
```

## 下一步

现在您已经了解了基础用法，可以继续学习：

- [基础概念](/guide/concepts) - 了解核心概念和架构
- [翻译功能](/guide/translation) - 深入了解翻译功能
- [Vue 3 集成](/guide/vue-integration) - 详细的 Vue 集成指南
- [API 参考](/api/core) - 完整的 API 文档

## 常见问题

### Q: 如何添加自定义语言？

A: 您可以创建自定义语言包并使用 `StaticLoader` 注册：

```typescript
import { I18n, StaticLoader } from '@ldesign/i18n'

const customLanguage = {
  info: {
    name: 'Français',
    nativeName: 'Français',
    code: 'fr',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY'
  },
  translations: {
    common: {
      ok: 'OK',
      cancel: 'Annuler'
    }
  }
}

const loader = new StaticLoader()
loader.registerPackage('fr', customLanguage)

const i18n = new I18n({ defaultLocale: 'fr' })
i18n.setLoader(loader)
await i18n.init()
```

### Q: 如何在服务端渲染中使用？

A: 在 SSR 环境中，您需要禁用自动检测并手动设置语言：

```typescript
const i18n = await createI18nWithBuiltinLocales({
  defaultLocale: 'en',
  autoDetect: false,  // 禁用自动检测
  storage: 'none'     // 禁用存储
})

// 根据请求头或其他方式设置语言
await i18n.changeLanguage(requestLocale)
```
