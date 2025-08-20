# Vue 3 示例

本页面展示如何在 Vue 3 项目中使用 @ldesign/i18n。

## 在线演示

你可以在 [这里](../../examples/vue/) 查看完整的在线演示。

## 项目设置

### 安装和配置

```bash
# 安装依赖
pnpm add @ldesign/i18n vue@^3.4.0

# 开发依赖
pnpm add -D @vitejs/plugin-vue typescript vue-tsc vite
```

### 主入口文件

```typescript
import { createI18nWithBuiltinLocales } from '@ldesign/i18n'
import { createI18n } from '@ldesign/i18n/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

async function bootstrap() {
  try {
    // 创建 I18n 实例
    const i18nInstance = await createI18nWithBuiltinLocales({
      defaultLocale: 'en',
      fallbackLocale: 'en',
      autoDetect: true,
      storage: 'localStorage',
      storageKey: 'vue-i18n-locale',
      cache: {
        enabled: true,
        maxSize: 1000,
      },
      onLanguageChanged: (locale) => {
        console.log('Language changed to:', locale)
        document.documentElement.lang = locale
      },
      onLoadError: (locale, error) => {
        console.error(`Failed to load language '${locale}':`, error)
      },
    })

    // 创建 Vue I18n 插件
    const vueI18nPlugin = createI18n(i18nInstance)

    // 创建 Vue 应用
    const app = createApp(App)

    // 安装 I18n 插件
    app.use(vueI18nPlugin, {
      globalInjection: true,
      globalPropertyName: '$t',
    })

    // 挂载应用
    app.mount('#app')

    console.log('Vue I18n example app started successfully')
  }
  catch (error) {
    console.error('Failed to bootstrap Vue I18n example:', error)
  }
}

bootstrap()
```

## 主组件示例

```vue
<!-- App.vue -->
<script setup lang="ts">
import {
  useBatchTranslation,
  useConditionalTranslation,
  useI18n,
  useLanguageSwitcher,
} from '@ldesign/i18n/vue'
import { computed, onMounted, ref } from 'vue'

// 使用 I18n 组合式 API
const { t, i18n } = useI18n()
const { locale, availableLanguages, isChanging, switchLanguage } = useLanguageSwitcher()

// 错误状态
const error = ref<string>('')

// 当前语言信息
const currentLanguageInfo = computed(() => i18n.getCurrentLanguageInfo())

// 批量翻译示例
const batchTranslations = useBatchTranslation(['common.save', 'common.cancel', 'common.delete'])

// 条件翻译示例
const isOnline = ref(true)
const conditionalStatus = useConditionalTranslation(isOnline, 'common.online', 'common.offline')

// 组件挂载时的初始化
onMounted(() => {
  console.log('Vue I18n example mounted')
  console.log('Current locale:', locale.value)
  console.log('Available languages:', availableLanguages.value)
})

// 错误处理
i18n.on('loadError', (locale: string, err: Error) => {
  error.value = `Failed to load language '${locale}': ${err.message}`
  setTimeout(() => {
    error.value = ''
  }, 5000)
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>@ldesign/i18n</h1>
      <p>Vue 3 Example</p>
      <div class="current-language">
        {{ t('common.language') }}: {{ currentLanguageInfo?.nativeName }} ({{ locale }})
      </div>
    </header>

    <!-- 语言切换器 -->
    <div class="controls">
      <button
        v-for="lang in availableLanguages"
        :key="lang.code"
        class="btn"
        :class="[{ active: locale === lang.code }]"
        :disabled="isChanging"
        @click="switchLanguage(lang.code)"
      >
        {{ lang.nativeName }}
        <span v-if="isChanging && locale === lang.code" class="loading">...</span>
      </button>
    </div>

    <!-- 基础翻译示例 -->
    <section class="section">
      <h3>{{ t('examples.basic') }}</h3>
      <div class="example">
        <div class="code">
          {{ "t('common.ok')" }}
        </div>
        <div class="result">
          {{ t('common.ok') }}
        </div>
      </div>
      <div class="example">
        <div class="code">
          {{ "t('common.cancel')" }}
        </div>
        <div class="result">
          {{ t('common.cancel') }}
        </div>
      </div>
    </section>

    <!-- 插值翻译示例 -->
    <section class="section">
      <h3>{{ t('examples.interpolation') }}</h3>
      <div class="example">
        <div class="code">
          {{ "t('common.pageOf', { current: 1, total: 10 })" }}
        </div>
        <div class="result">
          {{ t('common.pageOf', { current: 1, total: 10 }) }}
        </div>
      </div>
      <div class="example">
        <div class="code">
          {{ "t('common.showingItems', { start: 1, end: 20, total: 100 })" }}
        </div>
        <div class="result">
          {{ t('common.showingItems', { start: 1, end: 20, total: 100 }) }}
        </div>
      </div>
    </section>

    <!-- 复数处理示例 -->
    <section class="section">
      <h3>{{ t('examples.pluralization') }}</h3>
      <div class="example">
        <div class="code">
          {{ "t('date.duration.minutes', { count: 1 })" }}
        </div>
        <div class="result">
          {{ t('date.duration.minutes', { count: 1 }) }}
        </div>
      </div>
      <div class="example">
        <div class="code">
          {{ "t('date.duration.minutes', { count: 5 })" }}
        </div>
        <div class="result">
          {{ t('date.duration.minutes', { count: 5 }) }}
        </div>
      </div>
    </section>

    <!-- 指令示例 -->
    <section class="section">
      <h3>{{ t('examples.directive') }}</h3>
      <div class="example">
        <div class="code">
          {{ '
          <div v-t="\'common.save\'"></div>
          ' }}
        </div>
        <div v-t="'common.save'" class="result" />
      </div>
      <div class="example">
        <div class="code">
          {{ '<input v-t="{ key: \'common.searchPlaceholder\' }" />' }}
        </div>
        <input v-t="{ key: 'common.searchPlaceholder' }" class="input-example">
      </div>
    </section>

    <!-- 批量翻译示例 -->
    <section class="section">
      <h3>{{ t('examples.batch') }}</h3>
      <div class="example">
        <div class="code">
          useBatchTranslation(['common.save', 'common.cancel', 'common.delete'])
        </div>
        <pre class="result">{{ JSON.stringify(batchTranslations, null, 2) }}</pre>
      </div>
    </section>

    <!-- 条件翻译示例 -->
    <section class="section">
      <h3>{{ t('examples.conditional') }}</h3>
      <div class="example">
        <label>
          <input v-model="isOnline" type="checkbox">
          {{ t('common.online') }} / {{ t('common.offline') }}
        </label>
        <div class="result">
          {{ t('examples.status') }}: {{ conditionalStatus }}
        </div>
      </div>
    </section>

    <!-- 语言信息示例 -->
    <section class="section">
      <h3>{{ t('examples.info') }}</h3>
      <div class="example">
        <div class="code">
          getCurrentLanguageInfo()
        </div>
        <pre class="result">{{ JSON.stringify(currentLanguageInfo, null, 2) }}</pre>
      </div>
    </section>

    <!-- 错误处理 -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  line-height: 1.6;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.current-language {
  color: #666;
  font-size: 14px;
  margin-top: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  position: relative;
}

.btn:hover:not(:disabled) {
  background: #e5e5e5;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.loading {
  margin-left: 4px;
  font-size: 12px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.section h3 {
  margin-top: 0;
  color: #333;
  font-size: 18px;
}

.example {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 10px 0;
}

.code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.result {
  font-weight: bold;
  color: #007bff;
}

.result pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
}

.input-example {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border: 1px solid #f5c6cb;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

input[type='checkbox'] {
  margin: 0;
}
</style>
```

## 组合式 API 详细示例

### 基础使用

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'

// 获取翻译函数和当前语言
const { t, locale } = useI18n()

// 使用翻译
const title = t('page.title')
const message = t('page.welcome', { name: 'Vue' })
</script>
```

### 语言切换器组件

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
  // 更新页面元数据
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

### 表单验证组件

```vue
<!-- FormValidation.vue -->
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { reactive, ref } from 'vue'

const { t } = useI18n()

const form = reactive({
  name: '',
  email: '',
})

const errors = reactive({
  name: '',
  email: '',
})

const isSubmitting = ref(false)

function validateForm() {
  errors.name = ''
  errors.email = ''

  if (!form.name) {
    errors.name = t('validation.required')
  }

  if (!form.email) {
    errors.email = t('validation.required')
  }
  else if (!/\S[^\s@]*@\S+\.\S+/.test(form.email)) {
    errors.email = t('validation.email')
  }

  return !errors.name && !errors.email
}

async function handleSubmit() {
  if (!validateForm())
    return

  isSubmitting.value = true
  try {
    // 提交表单逻辑
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert(t('form.submitSuccess'))
  }
  catch (error) {
    alert(t('form.submitError'))
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="field">
      <label>{{ t('form.name') }}</label>
      <input
        v-model="form.name"
        :placeholder="t('form.namePlaceholder')"
        :class="{ error: errors.name }"
      >
      <span v-if="errors.name" class="error-message">
        {{ errors.name }}
      </span>
    </div>

    <div class="field">
      <label>{{ t('form.email') }}</label>
      <input
        v-model="form.email"
        type="email"
        :placeholder="t('form.emailPlaceholder')"
        :class="{ error: errors.email }"
      >
      <span v-if="errors.email" class="error-message">
        {{ errors.email }}
      </span>
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? t('common.loading') : t('form.submit') }}
    </button>
  </form>
</template>
```

## 高级功能示例

### 动态语言包加载

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { ref, watch } from 'vue'

const { i18n, locale } = useI18n()
const isLoading = ref(false)

// 监听语言变化，动态加载语言包
watch(locale, async (newLocale) => {
  if (!i18n.isLanguageLoaded(newLocale)) {
    isLoading.value = true
    try {
      await i18n.preloadLanguage(newLocale)
      console.log(`Language ${newLocale} loaded successfully`)
    }
    catch (error) {
      console.error(`Failed to load language ${newLocale}:`, error)
    }
    finally {
      isLoading.value = false
    }
  }
})
</script>
```

### 自定义格式化

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'

const { t, i18n } = useI18n()

// 注册自定义格式化函数
i18n.addFormatter('currency', (value: number, locale: string) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(value)
})

i18n.addFormatter('date', (value: number, locale: string) => {
  return new Intl.DateTimeFormat(locale).format(new Date(value))
})

// 使用自定义格式化
const price = t('product.price', { amount: 99.99 })
const date = t('product.date', { timestamp: Date.now() })
</script>
```

## 运行示例

### 启动步骤

```bash
# 1. 确保主项目已构建
cd packages/i18n
pnpm build

# 2. 进入 Vue 示例目录
cd examples/vue

# 3. 安装依赖
pnpm install

# 4. 启动开发服务器
pnpm dev
```

### 构建生产版本

```bash
# 构建
pnpm build

# 预览
pnpm preview
```

## 最佳实践

### 1. 组件级别的翻译管理

```vue
<script setup lang="ts">
// 为每个组件定义专门的翻译键前缀
const COMPONENT_PREFIX = 'components.userCard'

const { t } = useI18n()

// 使用前缀简化翻译调用
const ct = (key: string, params?: any) => t(`${COMPONENT_PREFIX}.${key}`, params)
</script>

<template>
  <div class="user-card">
    <h3>{{ ct('title') }}</h3>
    <p>{{ ct('description', { name: user.name }) }}</p>
  </div>
</template>
```

### 2. 错误边界处理

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { onErrorCaptured, ref } from 'vue'

const { t } = useI18n()
const error = ref<string>('')

onErrorCaptured((err) => {
  if (err.message.includes('translation')) {
    error.value = t('errors.translationFailed')
    return false
  }
})
</script>
```

### 3. 性能优化

```vue
<script setup lang="ts">
import { useBatchTranslation } from '@ldesign/i18n/vue'

// 批量翻译减少函数调用
const buttonTexts = useBatchTranslation(['common.save', 'common.cancel', 'common.delete'])
</script>
```

这个 Vue 3 示例展示了 @ldesign/i18n 在 Vue 项目中的完整使用方法，包括组合式 API、指令、组件设计和最
佳实践。
