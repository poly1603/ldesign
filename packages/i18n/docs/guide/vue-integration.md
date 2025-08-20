# Vue 3 集成

@ldesign/i18n 提供了完整的 Vue 3 集成支持，包括插件、组合式 API、指令和类型定义。

## 安装插件

### 基础安装

```typescript
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'
import { createI18n } from '@ldesign/i18n/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

async function bootstrap() {
  // 创建 I18n 实例
  const i18nInstance = await createI18nWithBuiltinLocales({
    defaultLocale: 'en',
    fallbackLocale: 'en',
    autoDetect: true,
  })

  // 创建 Vue 插件
  const vueI18nPlugin = createI18n(i18nInstance)

  // 创建应用并安装插件
  const app = createApp(App)
  app.use(vueI18nPlugin, {
    globalInjection: true, // 注入全局属性
    globalPropertyName: '$t', // 全局属性名称
  })

  app.mount('#app')
}

bootstrap()
```

### 自定义配置

```typescript
// 直接在插件安装时配置
app.use(vueI18nPlugin, {
  defaultLocale: 'zh-CN',
  fallbackLocale: 'en',
  globalInjection: true,
  globalPropertyName: '$t',
  storage: 'localStorage',
  cache: {
    enabled: true,
    maxSize: 1000,
  },
})
```

## 组合式 API

### useI18n()

主要的 I18n 钩子，提供完整的国际化功能：

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { ref } from 'vue'

const {
  t, // 翻译函数
  locale, // 当前语言（响应式）
  availableLanguages, // 可用语言列表（响应式）
  changeLanguage, // 切换语言方法
  exists, // 检查键是否存在
  getKeys, // 获取所有键
  i18n, // I18n 实例
} = useI18n()

const selectedLocale = ref(locale.value)

async function handleLanguageChange() {
  await changeLanguage(selectedLocale.value)
}
</script>

<template>
  <div>
    <h1>{{ t('common.welcome', { name: 'Vue' }) }}</h1>
    <p>{{ t('common.currentLanguage') }}: {{ locale }}</p>

    <select v-model="selectedLocale" @change="handleLanguageChange">
      <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
        {{ lang.nativeName }}
      </option>
    </select>
  </div>
</template>
```

### useLanguageSwitcher()

专门用于语言切换的钩子：

```vue
<script setup lang="ts">
import { useLanguageSwitcher } from '@ldesign/i18n/vue'

const {
  locale, // 当前语言
  availableLanguages, // 可用语言
  isChanging, // 是否正在切换
  switchLanguage, // 切换语言方法
} = useLanguageSwitcher()
</script>

<template>
  <div class="language-switcher">
    <button
      v-for="lang in availableLanguages"
      :key="lang.code"
      :class="{ active: locale === lang.code, loading: isChanging }"
      :disabled="isChanging"
      @click="switchLanguage(lang.code)"
    >
      {{ lang.nativeName }}
    </button>
  </div>
</template>
```

### useBatchTranslation()

批量翻译钩子：

```vue
<script setup lang="ts">
import { useBatchTranslation } from '@ldesign/i18n/vue'

const translations = useBatchTranslation(['common.save', 'common.cancel', 'common.delete'])
</script>

<template>
  <div>
    <button>{{ translations['common.save'] }}</button>
    <button>{{ translations['common.cancel'] }}</button>
    <button>{{ translations['common.delete'] }}</button>
  </div>
</template>
```

### useConditionalTranslation()

条件翻译钩子：

```vue
<script setup lang="ts">
import { useConditionalTranslation } from '@ldesign/i18n/vue'
import { ref } from 'vue'

const isOnline = ref(true)

const statusText = useConditionalTranslation(isOnline, 'common.online', 'common.offline')
</script>

<template>
  <div>
    <label>
      <input v-model="isOnline" type="checkbox">
      {{ statusText }}
    </label>
  </div>
</template>
```

## 模板指令

### v-t 指令

用于在模板中直接进行翻译：

```vue
<template>
  <div>
    <!-- 基础用法 -->
    <div v-t="'common.save'" />

    <!-- 带参数 -->
    <div v-t="{ key: 'common.welcome', params: { name: 'Vue' } }" />

    <!-- 输入框占位符 -->
    <input v-t="'common.searchPlaceholder'">

    <!-- 带选项 -->
    <div
      v-t="{
        key: 'common.message',
        params: { content: '<script>' },
        options: { escapeValue: true },
      }"
    />
  </div>
</template>
```

### 指令参数类型

```typescript
// 字符串形式
v-t="'translation.key'"

// 对象形式
v-t="{
  key: 'translation.key',
  params: { name: 'value' },
  options: { escapeValue: true }
}"
```

## 全局属性

当启用 `globalInjection` 时，可以在模板中使用全局属性：

```vue
<script setup lang="ts">
// 无需导入，直接使用全局属性
</script>

<template>
  <div>
    <!-- 使用 $t 全局属性 -->
    <h1>{{ $t('common.title') }}</h1>
    <p>{{ $t('common.description', { name: 'Vue' }) }}</p>

    <!-- 访问 I18n 实例 -->
    <div>{{ $i18n.getCurrentLanguage() }}</div>
  </div>
</template>
```

## TypeScript 支持

### 组件类型扩展

```typescript
import type { I18nInstance, TranslationFunction } from '@ldesign/i18n'
// types/vue.d.ts
import '@vue/runtime-core'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: TranslationFunction
    $i18n: I18nInstance
  }
}
```

### 严格类型检查

```vue
<script setup lang="ts">
import type { UseI18nReturn } from '@ldesign/i18n/vue'
import { useI18n } from '@ldesign/i18n/vue'

// 类型安全的使用
const i18n: UseI18nReturn = useI18n()

// 类型安全的翻译
const message: string = i18n.t('common.message')
const count: number = i18n.t<number>('common.count')
</script>
```

## 高级用法

### 自定义 I18n 实例

```typescript
// composables/useCustomI18n.ts
import { I18n, StaticLoader } from '@ldesign/i18n'
import { useI18nWithInstance } from '@ldesign/i18n/vue'

export function useCustomI18n() {
  // 创建自定义加载器
  const loader = new StaticLoader()
  loader.registerPackage('custom', {
    info: { name: 'Custom', code: 'custom', ... },
    translations: { ... }
  })

  // 创建自定义 I18n 实例
  const customI18n = new I18n({ defaultLocale: 'custom' })
  customI18n.setLoader(loader)

  // 使用自定义实例
  return useI18nWithInstance(customI18n)
}
```

### 局部语言包

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'

const { i18n } = useI18n()

// 为当前组件添加局部翻译
const localTranslations = {
  component: {
    title: 'Component Title',
    description: 'Component Description',
  },
}

// 扩展当前语言包（仅示例，实际使用中应该通过加载器管理）
// 这里只是展示概念，实际项目中应该在语言包文件中定义
</script>
```

## 最佳实践

### 1. 组件级别的翻译管理

```vue
<!-- UserProfile.vue -->
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { reactive } from 'vue'

const { t } = useI18n()

const form = reactive({
  name: '',
})

function handleSubmit() {
  // 处理表单提交
}
</script>

<template>
  <div class="user-profile">
    <h2>{{ t('userProfile.title') }}</h2>
    <form @submit="handleSubmit">
      <input v-model="form.name" :placeholder="t('userProfile.namePlaceholder')">
      <button type="submit">
        {{ t('userProfile.saveButton') }}
      </button>
    </form>
  </div>
</template>
```

### 2. 响应式语言切换

```vue
<!-- LanguageSwitcher.vue -->
<script setup lang="ts">
import { useLanguageSwitcher } from '@ldesign/i18n/vue'
import { ref, watch } from 'vue'

const { locale, availableLanguages, isChanging, switchLanguage } = useLanguageSwitcher()

const currentLocale = ref(locale.value)

// 监听语言变化
watch(locale, (newLocale) => {
  currentLocale.value = newLocale
  // 更新页面标题、HTML lang 属性等
  document.title = t('app.title')
  document.documentElement.lang = newLocale
})

async function handleLanguageChange() {
  await switchLanguage(currentLocale.value)
}
</script>

<template>
  <div class="language-switcher">
    <select v-model="currentLocale" :disabled="isChanging" @change="handleLanguageChange">
      <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
        {{ lang.nativeName }}
      </option>
    </select>
    <span v-if="isChanging" class="loading">
      {{ t('common.loading') }}
    </span>
  </div>
</template>
```

### 3. 错误处理

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { onMounted, ref } from 'vue'

const { i18n } = useI18n()
const error = ref<string>('')

onMounted(() => {
  // 监听加载错误
  i18n.on('loadError', (locale: string, err: Error) => {
    error.value = `Failed to load language '${locale}': ${err.message}`
  })
})
</script>
```
