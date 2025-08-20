# 最佳实践

本页面总结了使用 @ldesign/i18n 的最佳实践和常见模式。

## 项目组织

### 目录结构

```
src/
├── i18n/                    # 国际化配置
│   ├── index.ts            # 主配置文件
│   ├── locales/            # 语言包目录
│   │   ├── en/            # 英语
│   │   │   ├── index.ts   # 入口文件
│   │   │   ├── common.ts  # 通用文本
│   │   │   ├── pages/     # 页面特定文本
│   │   │   └── components/ # 组件特定文本
│   │   ├── zh-CN/         # 中文
│   │   └── ja/            # 日语
│   ├── loaders.ts         # 自定义加载器
│   └── types.ts           # 类型定义
├── components/             # 组件
├── pages/                 # 页面
└── utils/                 # 工具函数
```

### 语言包组织

```typescript
// locales/en/index.ts
import common from './common'
import components from './components'
import pages from './pages'

export default {
  info: {
    name: 'English',
    nativeName: 'English',
    code: 'en',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
  },
  translations: {
    common,
    pages,
    components,
  },
}
```

```typescript
import about from './about'
import contact from './contact'
// locales/en/pages/index.ts
import home from './home'

export default {
  home,
  about,
  contact,
}
```

## 键名设计

### 命名约定

```typescript
// ✅ 推荐的键名结构
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete"
    },
    "messages": {
      "success": "Operation completed successfully",
      "error": "An error occurred"
    }
  },
  "pages": {
    "home": {
      "title": "Welcome Home",
      "subtitle": "Your journey starts here"
    }
  },
  "components": {
    "userCard": {
      "title": "User Information",
      "editButton": "Edit Profile"
    }
  }
}
```

```typescript
// ❌ 避免的键名结构
{
  "homePageTitle": "Welcome Home",
  "homePageSubtitle": "Your journey starts here",
  "userCardEditButton": "Edit Profile",
  "saveButtonText": "Save"
}
```

### 键名层次

```typescript
// 按功能模块组织
{
  "auth": {
    "login": {
      "title": "Sign In",
      "form": {
        "username": "Username",
        "password": "Password",
        "submit": "Sign In"
      },
      "errors": {
        "invalidCredentials": "Invalid username or password",
        "accountLocked": "Account has been locked"
      }
    }
  }
}
```

## 参数设计

### 清晰的参数命名

```typescript
// ✅ 清晰的参数名
{
  "welcome": "Welcome {{userName}}, you have {{messageCount}} new messages",
  "orderSummary": "Order #{{orderNumber}} for {{customerName}} - Total: {{totalAmount}}"
}

// ❌ 模糊的参数名
{
  "welcome": "Welcome {{a}}, you have {{b}} new messages",
  "orderSummary": "Order #{{x}} for {{y}} - Total: {{z}}"
}
```

### 参数类型一致性

```typescript
// 定义参数类型
interface WelcomeParams {
  userName: string
  messageCount: number
}

interface OrderSummaryParams {
  orderNumber: string
  customerName: string
  totalAmount: string // 已格式化的金额
}

// 使用时保持类型安全
const welcomeMessage = t('welcome', {
  userName: 'John',
  messageCount: 5,
} as WelcomeParams)
```

## 复数处理

### 完整的复数形式

```typescript
// ✅ 完整的复数处理
{
  "items": "{count, plural, =0{no items} =1{one item} other{# items}}",
  "notifications": "{count, plural, =0{No notifications} =1{One notification} other{# notifications}}"
}

// ❌ 简化的复数处理（不推荐）
{
  "items": "{count} item(s)",
  "notifications": "{count} notification(s)"
}
```

### 语言特定的复数规则

```typescript
// 英语（两种形式）
{
  "books": "{count, plural, =0{no books} =1{one book} other{# books}}"
}

// 俄语（多种形式）
{
  "books": "{count, plural, =0{нет книг} =1{одна книга} few{# книги} many{# книг} other{# книги}}"
}

// 中文（无复数变化）
{
  "books": "{count} 本书"
}
```

## 组件设计模式

### Vue 组件最佳实践

```vue
<!-- UserProfile.vue -->
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { reactive } from 'vue'

// 组件特定的翻译前缀
const COMPONENT_PREFIX = 'components.userProfile'

const { t } = useI18n()

// 创建组件翻译函数
const ct = (key: string, params?: any) => t(`${COMPONENT_PREFIX}.${key}`, params)

const form = reactive({
  name: '',
  email: '',
})

function handleSubmit() {
  // 表单提交逻辑
}
</script>

<template>
  <div class="user-profile">
    <h2>{{ t('userProfile.title') }}</h2>

    <!-- 使用组件特定的翻译前缀 -->
    <form @submit="handleSubmit">
      <div class="field">
        <label>{{ ct('form.name') }}</label>
        <input v-model="form.name" :placeholder="ct('form.namePlaceholder')">
      </div>

      <div class="field">
        <label>{{ ct('form.email') }}</label>
        <input v-model="form.email" :placeholder="ct('form.emailPlaceholder')">
      </div>

      <button type="submit">
        {{ ct('form.saveButton') }}
      </button>
    </form>
  </div>
</template>
```

### 可复用的翻译组件

```vue
<!-- TranslatedText.vue -->
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { computed } from 'vue'

interface Props {
  translationKey: string
  params?: Record<string, any>
  tag?: string
  className?: string
  escapeHtml?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'span',
  escapeHtml: true,
})

const { t } = useI18n()

const translatedText = computed(() => {
  return t(props.translationKey, props.params, {
    escapeValue: props.escapeHtml,
  })
})
</script>

<template>
  <component :is="tag" :class="className" v-html="translatedText" />
</template>
```

## 性能优化

### 缓存策略

```typescript
// 配置合适的缓存大小
const i18n = new I18n({
  cache: {
    enabled: true,
    maxSize: 1000, // 根据应用大小调整
  },
})

// 监控缓存性能
console.log('Cache hit rate:', i18n.cache?.getHitRate())
console.log('Cache size:', i18n.cache?.size())
```

### 预加载策略

```typescript
// 预加载常用语言
const commonLanguages = ['en', 'zh-CN', 'es', 'fr']

async function preloadLanguages() {
  const promises = commonLanguages.map(locale =>
    i18n.preloadLanguage(locale).catch(error => console.warn(`Failed to preload ${locale}:`, error))
  )

  await Promise.allSettled(promises)
}
```

### 批量翻译

```vue
<script setup lang="ts">
import { useBatchTranslation } from '@ldesign/i18n/vue'

// ✅ 批量翻译减少函数调用
const buttonTexts = useBatchTranslation([
  'common.save',
  'common.cancel',
  'common.delete',
  'common.edit',
])

// ❌ 避免：多次单独调用
// const saveText = t('common.save')
// const cancelText = t('common.cancel')
// const deleteText = t('common.delete')
// const editText = t('common.edit')
</script>

<template>
  <div>
    <button>{{ buttonTexts['common.save'] }}</button>
    <button>{{ buttonTexts['common.cancel'] }}</button>
    <button>{{ buttonTexts['common.delete'] }}</button>
    <button>{{ buttonTexts['common.edit'] }}</button>
  </div>
</template>
```

## 错误处理

### 全局错误处理

```typescript
// 设置全局错误处理
const i18n = new I18n({
  onLoadError: (locale, error) => {
    console.error(`Failed to load language ${locale}:`, error)

    // 发送错误报告
    analytics.track('i18n_load_error', {
      locale,
      error: error.message,
    })

    // 显示用户友好的错误消息
    showNotification(t('errors.languageLoadFailed', { language: locale }), 'error')
  },

  missingKeyHandler: (key, locale) => {
    console.warn(`Missing translation key: ${key} for locale: ${locale}`)

    // 在开发环境中显示警告
    if (process.env.NODE_ENV === 'development') {
      showDevWarning(`Missing translation: ${key}`)
    }
  },
})
```

### 组件级错误处理

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { onErrorCaptured, ref } from 'vue'

const { t } = useI18n()
const error = ref<string>('')

// 捕获翻译相关错误
onErrorCaptured((err) => {
  if (err.message.includes('translation')) {
    error.value = t('errors.translationFailed')
    return false // 阻止错误继续传播
  }
})

// 安全的翻译函数
function safeT(key: string, params?: any, fallback?: string) {
  try {
    return t(key, params)
  }
  catch (error) {
    console.warn(`Translation error for key '${key}':`, error)
    return fallback || key
  }
}
</script>
```

## 测试策略

### 翻译键测试

```typescript
import { I18n } from '@ldesign/i18n'
// tests/i18n.test.ts
import { describe, expect, it } from 'vitest'
import enPackage from '@/i18n/locales/en'
import zhCNPackage from '@/i18n/locales/zh-CN'

describe('I18n Translation Keys', () => {
  it('should have consistent keys across languages', () => {
    const enKeys = getAllKeys(enPackage.translations)
    const zhKeys = getAllKeys(zhCNPackage.translations)

    expect(enKeys.sort()).toEqual(zhKeys.sort())
  })

  it('should not have missing interpolation parameters', () => {
    const i18n = new I18n()

    const testCases = [
      { key: 'welcome', params: { name: 'John' } },
      { key: 'pageOf', params: { current: 1, total: 10 } },
    ]

    testCases.forEach(({ key, params }) => {
      expect(() => i18n.t(key, params)).not.toThrow()
    })
  })
})

function getAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey))
    }
    else {
      keys.push(fullKey)
    }
  }

  return keys
}
```

### Vue 组件测试

```typescript
import { createI18n } from '@ldesign/i18n/vue'
// tests/components/UserProfile.test.ts
import { mount } from '@vue/test-utils'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile', () => {
  it('should display translated text', async () => {
    const i18nInstance = new I18n({
      defaultLocale: 'en',
    })

    const vueI18nPlugin = createI18n(i18nInstance)

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [vueI18nPlugin],
      },
    })

    expect(wrapper.text()).toContain('User Profile')
  })

  it('should update text when language changes', async () => {
    // 测试语言切换
  })
})
```

## 部署和维护

### 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 i18n 相关代码分离到单独的 chunk
          i18n: ['@ldesign/i18n'],
        },
      },
    },
  },
})
```

### 翻译管理工作流

```typescript
import { readFileSync } from 'node:fs'
// scripts/extract-keys.ts
// 提取所有使用的翻译键
import { glob } from 'glob'

function extractTranslationKeys() {
  const files = glob.sync('src/**/*.{ts,vue}')
  const keys = new Set<string>()

  files.forEach((file) => {
    const content = readFileSync(file, 'utf-8')

    // 提取 t('key') 模式
    const matches = content.match(/t\(['"`]([^'"`]+)['"`]\)/g)
    matches?.forEach((match) => {
      const key = match.match(/['"`]([^'"`]+)['"`]/)?.[1]
      if (key)
        keys.add(key)
    })
  })

  return Array.from(keys).sort()
}

// 检查未使用的翻译键
function findUnusedKeys(usedKeys: string[], allKeys: string[]) {
  return allKeys.filter(key => !usedKeys.includes(key))
}
```

### 持续集成

```yaml
# .github/workflows/i18n-check.yml
name: I18n Check

on: [push, pull_request]

jobs:
  check-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Check translation keys consistency
        run: pnpm run i18n:check

      - name: Check for missing translations
        run: pnpm run i18n:validate
```

## 监控和分析

### 使用统计

```typescript
// 监控翻译使用情况
const i18n = new I18n({
  onTranslation: (key, locale, result) => {
    // 记录翻译使用统计
    analytics.track('translation_used', {
      key,
      locale,
      timestamp: Date.now(),
    })
  },
})
```

### 性能监控

```typescript
// 监控翻译性能
function measureTranslationPerformance(key: string, fn: () => string) {
  const start = performance.now()
  const result = fn()
  const end = performance.now()

  if (end - start > 10) {
    // 超过 10ms 的翻译
    console.warn(`Slow translation for key '${key}': ${end - start}ms`)
  }

  return result
}
```

这些最佳实践将帮助您构建可维护、高性能的国际化应用程序。
