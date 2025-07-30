# Vue API 参考

本页面详细介绍 @ldesign/i18n 的 Vue 3 集成 API。

## 插件安装

### createI18n()

```typescript
function createI18n(i18nInstance?: I18nInstance): VueI18nPlugin
```

创建 Vue I18n 插件。

**参数：**
- `i18nInstance` - 可选的 I18n 实例

**返回：**
- Vue I18n 插件实例

**示例：**
```typescript
import { createI18n } from '@ldesign/i18n/vue'
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'

const i18nInstance = await createI18nWithBuiltinLocales()
const vueI18nPlugin = createI18n(i18nInstance)

app.use(vueI18nPlugin, {
  globalInjection: true,
  globalPropertyName: '$t'
})
```

### createI18nWithOptions()

```typescript
function createI18nWithOptions(options: VueI18nOptions): VueI18nPlugin
```

创建带有预配置的 Vue I18n 插件。

**参数：**
- `options` - Vue I18n 配置选项

**示例：**
```typescript
const vueI18nPlugin = createI18nWithOptions({
  defaultLocale: 'en',
  fallbackLocale: 'en',
  globalInjection: true
})
```

## 组合式 API

### useI18n()

```typescript
function useI18n(): UseI18nReturn
```

主要的 I18n 组合式 API，提供完整的国际化功能。

**返回：**
```typescript
interface UseI18nReturn {
  t: TranslationFunction
  locale: Ref<string>
  availableLanguages: ComputedRef<LanguageInfo[]>
  changeLanguage: (locale: string) => Promise<void>
  exists: (key: string, locale?: string) => boolean
  getKeys: (locale?: string) => string[]
  i18n: I18nInstance
}
```

**示例：**
```vue
<template>
  <div>
    <h1>{{ t('common.title') }}</h1>
    <p>{{ t('common.currentLanguage') }}: {{ locale }}</p>
    
    <select v-model="selectedLocale" @change="handleLanguageChange">
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
const selectedLocale = ref(locale.value)

const handleLanguageChange = async () => {
  await changeLanguage(selectedLocale.value)
}
</script>
```

### useLanguageSwitcher()

```typescript
function useLanguageSwitcher(): {
  locale: Ref<string>
  availableLanguages: ComputedRef<LanguageInfo[]>
  isChanging: Ref<boolean>
  switchLanguage: (locale: string) => Promise<void>
}
```

专门用于语言切换的组合式 API。

**示例：**
```vue
<template>
  <div class="language-switcher">
    <button 
      v-for="lang in availableLanguages" 
      :key="lang.code"
      :class="{ active: locale === lang.code }"
      :disabled="isChanging"
      @click="switchLanguage(lang.code)"
    >
      {{ lang.nativeName }}
      <span v-if="isChanging && locale === lang.code">...</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useLanguageSwitcher } from '@ldesign/i18n/vue'

const { locale, availableLanguages, isChanging, switchLanguage } = useLanguageSwitcher()
</script>
```

### useBatchTranslation()

```typescript
function useBatchTranslation(keys: string[]): ComputedRef<Record<string, string>>
```

批量翻译的组合式 API。

**参数：**
- `keys` - 翻译键数组

**返回：**
- 翻译结果的计算属性

**示例：**
```vue
<template>
  <div>
    <button>{{ translations['common.save'] }}</button>
    <button>{{ translations['common.cancel'] }}</button>
    <button>{{ translations['common.delete'] }}</button>
  </div>
</template>

<script setup lang="ts">
import { useBatchTranslation } from '@ldesign/i18n/vue'

const translations = useBatchTranslation([
  'common.save',
  'common.cancel',
  'common.delete'
])
</script>
```

### useConditionalTranslation()

```typescript
function useConditionalTranslation(
  condition: (() => boolean) | Ref<boolean>,
  trueKey: string,
  falseKey: string
): ComputedRef<string>
```

条件翻译的组合式 API。

**参数：**
- `condition` - 条件函数或响应式引用
- `trueKey` - 条件为真时的翻译键
- `falseKey` - 条件为假时的翻译键

**示例：**
```vue
<template>
  <div>
    <label>
      <input v-model="isOnline" type="checkbox" />
      {{ statusText }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConditionalTranslation } from '@ldesign/i18n/vue'

const isOnline = ref(true)

const statusText = useConditionalTranslation(
  isOnline,
  'common.online',
  'common.offline'
)
</script>
```

### useI18nWithInstance()

```typescript
function useI18nWithInstance(i18nInstance: I18nInstance): UseI18nReturn
```

使用自定义 I18n 实例的组合式 API。

**参数：**
- `i18nInstance` - 自定义的 I18n 实例

**示例：**
```typescript
import { I18n, StaticLoader } from '@ldesign/i18n'
import { useI18nWithInstance } from '@ldesign/i18n/vue'

// 创建自定义 I18n 实例
const customI18n = new I18n({ defaultLocale: 'custom' })
const loader = new StaticLoader()
loader.registerPackage('custom', customLanguagePackage)
customI18n.setLoader(loader)

// 在组件中使用
const { t } = useI18nWithInstance(customI18n)
```

## 指令

### v-t 指令

用于在模板中直接进行翻译的指令。

**基础用法：**
```vue
<template>
  <!-- 简单翻译 -->
  <div v-t="'common.save'"></div>
  
  <!-- 带参数的翻译 -->
  <div v-t="{ key: 'common.welcome', params: { name: 'Vue' } }"></div>
  
  <!-- 输入框占位符 -->
  <input v-t="'common.searchPlaceholder'" />
  
  <!-- 带选项的翻译 -->
  <div v-t="{ 
    key: 'common.message', 
    params: { content: userInput },
    options: { escapeValue: true }
  }"></div>
</template>
```

**指令参数类型：**
```typescript
type I18nDirectiveBinding = string | {
  key: string
  params?: TranslationParams
  options?: TranslationOptions
}
```

## 全局属性

当启用 `globalInjection` 时，可以在模板中使用全局属性：

### $t

全局翻译函数。

```vue
<template>
  <div>
    <h1>{{ $t('common.title') }}</h1>
    <p>{{ $t('common.description', { name: 'Vue' }) }}</p>
  </div>
</template>
```

### $i18n

全局 I18n 实例。

```vue
<template>
  <div>
    <div>Current Language: {{ $i18n.getCurrentLanguage() }}</div>
    <div>Available Languages: {{ $i18n.getAvailableLanguages().length }}</div>
  </div>
</template>
```

## 配置选项

### VueI18nOptions

```typescript
interface VueI18nOptions extends I18nOptions {
  globalInjection?: boolean     // 是否注入全局属性，默认 true
  globalPropertyName?: string   // 全局属性名称，默认 '$t'
}
```

**示例：**
```typescript
app.use(vueI18nPlugin, {
  // I18n 选项
  defaultLocale: 'en',
  fallbackLocale: 'en',
  autoDetect: true,
  storage: 'localStorage',
  
  // Vue 特定选项
  globalInjection: true,
  globalPropertyName: '$t'
})
```

## 类型定义

### UseI18nReturn

```typescript
interface UseI18nReturn {
  t: TranslationFunction
  locale: Ref<string>
  availableLanguages: ComputedRef<LanguageInfo[]>
  changeLanguage: (locale: string) => Promise<void>
  exists: (key: string, locale?: string) => boolean
  getKeys: (locale?: string) => string[]
  i18n: I18nInstance
}
```

### VueI18nPlugin

```typescript
interface VueI18nPlugin {
  global: I18nInstance
  install: (app: App, options?: VueI18nOptions) => void
}
```

### I18nContext

```typescript
interface I18nContext {
  $t: TranslationFunction
  $i18n: I18nInstance
}
```

## TypeScript 支持

### 组件属性扩展

```typescript
// types/vue.d.ts
import '@vue/runtime-core'
import type { I18nInstance, TranslationFunction } from '@ldesign/i18n'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: TranslationFunction
    $i18n: I18nInstance
  }
  
  interface GlobalProperties {
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

### 组件级别的 I18n

```vue
<script setup lang="ts">
import { provide } from 'vue'
import { I18n } from '@ldesign/i18n'
import { I18N_INJECTION_KEY } from '@ldesign/i18n/vue'

// 为子组件提供独立的 I18n 实例
const componentI18n = new I18n({
  defaultLocale: 'en',
  // 组件特定配置
})

provide(I18N_INJECTION_KEY, componentI18n)
</script>
```

### 动态语言包加载

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'

const { i18n, locale } = useI18n()
const isLoading = ref(false)

// 监听语言变化，动态加载语言包
watch(locale, async (newLocale) => {
  if (!i18n.isLanguageLoaded(newLocale)) {
    isLoading.value = true
    try {
      await i18n.preloadLanguage(newLocale)
    } catch (error) {
      console.error('Failed to load language:', error)
    } finally {
      isLoading.value = false
    }
  }
})
</script>
```

### 错误边界处理

```vue
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'

const { i18n } = useI18n()
const error = ref<string>('')

// 捕获翻译相关错误
onErrorCaptured((err) => {
  if (err.message.includes('translation')) {
    error.value = i18n.t('errors.translationFailed')
    return false // 阻止错误继续传播
  }
})
</script>
```

## 最佳实践

### 1. 组合式 API 优先

```vue
<!-- ✅ 推荐：使用组合式 API -->
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
const { t } = useI18n()
</script>

<!-- ❌ 避免：过度依赖全局属性 -->
<template>
  <div>{{ $t('message') }}</div>
</template>
```

### 2. 响应式语言切换

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'

const { locale } = useI18n()

// 监听语言变化，更新页面元数据
watch(locale, (newLocale) => {
  document.documentElement.lang = newLocale
  document.title = t('app.title')
})
</script>
```

### 3. 性能优化

```vue
<script setup lang="ts">
import { useBatchTranslation } from '@ldesign/i18n/vue'

// ✅ 批量翻译减少函数调用
const buttonTexts = useBatchTranslation([
  'common.save',
  'common.cancel',
  'common.delete'
])

// ❌ 避免：多次单独调用
// const saveText = t('common.save')
// const cancelText = t('common.cancel')
// const deleteText = t('common.delete')
</script>
```
