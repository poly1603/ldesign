# 多语言状态管理 - 使用示例

本文档展示如何使用优化后的多语言状态管理架构。

## 📚 快速开始

### 1. 创建应用（最简示例）

```typescript
import { createEngineApp } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createColorPlugin } from '@ldesign/color/plugin'
import { createSizePlugin } from '@ldesign/size/plugin'

async function bootstrap() {
  // 步骤 1: 创建 i18n 插件（唯一状态源）
  const i18nPlugin = createI18nEnginePlugin({
    locale: 'zh-CN',
    fallbackLocale: 'en-US',
    messages: {
      'zh-CN': { hello: '你好' },
      'en-US': { hello: 'Hello' }
    }
  })
  
  // 步骤 2: 获取响应式 localeRef
  const localeRef = i18nPlugin.localeRef
  
  // 步骤 3: 创建其他插件，传入 localeRef
  const colorPlugin = createColorPlugin({ 
    locale: localeRef,
    defaultTheme: 'blue'
  })
  
  const sizePlugin = createSizePlugin({ 
    locale: localeRef,
    defaultSize: 'medium'
  })
  
  // 步骤 4: 创建应用
  const engine = await createEngineApp({
    rootComponent: App,
    plugins: [i18nPlugin],
    setupApp: async (app) => {
      app.use(colorPlugin)
      app.use(sizePlugin)
      
      if (i18nPlugin.setupVueApp) {
        i18nPlugin.setupVueApp(app)
      }
    }
  })
  
  return engine
}

bootstrap()
```

**特点**：
- ✅ 只需 5 行核心代码
- ✅ 清晰的单向数据流
- ✅ 自动同步，无需手动管理

---

## 🎯 完整示例（带配置）

### main.ts

```typescript
import { watch } from 'vue'
import { createEngineApp } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createColorPlugin } from '@ldesign/color/plugin'
import { createSizePlugin } from '@ldesign/size/plugin'
import App from './App.vue'

async function bootstrap() {
  // ===== i18n 插件（唯一状态源） =====
  const i18nPlugin = createI18nEnginePlugin({
    locale: 'zh-CN',
    fallbackLocale: 'en-US',
    detectBrowserLanguage: true,
    persistLanguage: true,
    messages: {
      'zh-CN': {
        app: {
          name: '我的应用',
          welcome: '欢迎'
        }
      },
      'en-US': {
        app: {
          name: 'My App',
          welcome: 'Welcome'
        }
      }
    }
  })
  
  const localeRef = i18nPlugin.localeRef
  
  // 可选：监听语言变化
  watch(localeRef, (newLocale) => {
    console.log('[locale] changed to:', newLocale)
    // 更新页面标题等副作用
    document.title = i18nPlugin.api.t('app.name')
  })
  
  // ===== Color 插件 =====
  const colorPlugin = createColorPlugin({
    locale: localeRef,  // 绑定到 i18n 的 locale
    prefix: 'ld',
    defaultTheme: 'blue',
    presets: 'all',
    customThemes: [
      {
        name: 'sunset',
        label: 'Sunset Orange',
        color: '#ff6b35',
        order: 100
      }
    ],
    hooks: {
      afterChange: (theme) => {
        console.log('[theme] changed to:', theme.themeName)
      }
    }
  })
  
  // ===== Size 插件 =====
  const sizePlugin = createSizePlugin({
    locale: localeRef,  // 绑定到 i18n 的 locale
    defaultSize: 'medium',
    presets: [
      {
        name: 'compact',
        baseSize: 12,
        label: 'Compact'
      },
      {
        name: 'spacious',
        baseSize: 18,
        label: 'Spacious'
      }
    ],
    hooks: {
      afterChange: (size) => {
        console.log('[size] changed to:', size)
      }
    }
  })
  
  // ===== 创建应用 =====
  const engine = await createEngineApp({
    rootComponent: App,
    mountElement: '#app',
    
    plugins: [i18nPlugin],
    
    setupApp: async (app) => {
      // 安装插件
      app.use(colorPlugin)
      app.use(sizePlugin)
      
      if (i18nPlugin.setupVueApp) {
        i18nPlugin.setupVueApp(app)
      }
      
      // 全局方法
      app.config.globalProperties.$changeLocale = (locale: string) => {
        i18nPlugin.api.changeLocale(locale)
      }
    },
    
    onReady: (engine) => {
      console.log('✅ App ready!')
      console.log('Current locale:', localeRef.value)
      
      // 可选：同步到 engine.state（兼容旧代码）
      if (engine.state) {
        engine.state.set('locale', localeRef.value)
        watch(localeRef, (newLocale) => {
          engine.state.set('locale', newLocale)
        })
      }
    }
  })
  
  return engine
}

bootstrap().catch(console.error)
```

---

## 🔄 语言切换方式

### 方式 1：通过 i18n API（推荐）

```typescript
// 最简单、最直接
i18nPlugin.api.changeLocale('en-US')

// 其他插件会自动响应，无需手动同步！
```

### 方式 2：在组件中使用

```vue
<template>
  <div>
    <button @click="switchLanguage">
      {{ $t('app.switchLanguage') }}
    </button>
    
    <p>Current: {{ currentLocale }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'

const { locale, t } = useI18n()

const currentLocale = computed(() => locale.value)

const switchLanguage = () => {
  locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}
</script>
```

### 方式 3：通过全局方法

```typescript
// 在任何地方调用
app.config.globalProperties.$changeLocale('en-US')
```

---

## 📝 访问多语言内容

### 在 JavaScript/TypeScript 中

```typescript
// i18n 的翻译
const text = i18nPlugin.api.t('app.welcome')

// Color 插件的多语言
const colorLocale = colorPlugin.localeMessages.value
console.log(colorLocale.themeLabel) // 输出当前语言的 "主题" 标签

// Size 插件的多语言
const sizeLocale = sizePlugin.localeMessages.value
console.log(sizeLocale.sizeLabel) // 输出当前语言的 "尺寸" 标签
```

### 在 Vue 组件中

```vue
<script setup lang="ts">
import { inject } from 'vue'
import { ColorPluginSymbol } from '@ldesign/color/plugin'
import { SizePluginSymbol } from '@ldesign/size/plugin'

// 注入插件
const colorPlugin = inject(ColorPluginSymbol)
const sizePlugin = inject(SizePluginSymbol)

// 访问多语言内容
const themeLabel = computed(() => colorPlugin?.localeMessages.value.themeLabel)
const sizeLabel = computed(() => sizePlugin?.localeMessages.value.sizeLabel)
</script>

<template>
  <div>
    <h3>{{ themeLabel }}</h3>
    <h3>{{ sizeLabel }}</h3>
  </div>
</template>
```

---

## 🎨 高级用法

### 监听多个插件的语言变化

```typescript
import { watch } from 'vue'

// 方式 1：只监听 localeRef（推荐）
watch(localeRef, (newLocale) => {
  console.log('Locale changed:', newLocale)
  // 所有插件已自动更新
})

// 方式 2：分别监听各个插件
watch(colorPlugin.currentLocale, (newLocale) => {
  console.log('Color plugin locale:', newLocale)
})

watch(sizePlugin.currentLocale, (newLocale) => {
  console.log('Size plugin locale:', newLocale)
})
```

### 创建自定义插件支持多语言

```typescript
import { ref, computed, type Ref } from 'vue'

interface MyPluginOptions {
  locale?: Ref<string>
}

export function createMyPlugin(options: MyPluginOptions = {}) {
  // 如果传入了 locale，使用它；否则创建新的
  const currentLocale = options.locale || ref('zh-CN')
  
  // 使用 computed 自动响应语言变化
  const localeMessages = computed(() => {
    return currentLocale.value === 'zh-CN' 
      ? { hello: '你好' }
      : { hello: 'Hello' }
  })
  
  return {
    currentLocale,
    localeMessages,
    setLocale(locale: string) {
      currentLocale.value = locale
    }
  }
}

// 使用
const myPlugin = createMyPlugin({ locale: localeRef })
```

---

## 🐛 调试技巧

### 查看当前语言状态

```typescript
// 在浏览器控制台
console.log('Current locale:', localeRef.value)
console.log('Color plugin locale:', colorPlugin.currentLocale.value)
console.log('Size plugin locale:', sizePlugin.currentLocale.value)
```

### 验证同步

```typescript
import { watch } from 'vue'

// 确保所有插件同步
watch([localeRef, colorPlugin.currentLocale, sizePlugin.currentLocale], 
  ([i18n, color, size]) => {
    if (i18n === color && color === size) {
      console.log('✅ All plugins synced:', i18n)
    } else {
      console.warn('⚠️ Plugins out of sync:', { i18n, color, size })
    }
  }
)
```

### 开发工具支持

```typescript
if (import.meta.env.DEV) {
  // 暴露到全局，方便调试
  ;(window as any).__LOCALE__ = {
    ref: localeRef,
    change: (locale: string) => i18nPlugin.api.changeLocale(locale),
    get: () => localeRef.value,
    plugins: {
      color: colorPlugin,
      size: sizePlugin
    }
  }
}

// 在浏览器控制台使用
__LOCALE__.change('en-US')  // 切换语言
__LOCALE__.get()            // 获取当前语言
```

---

## ✅ 最佳实践总结

1. **始终先创建 i18n 插件**
   ```typescript
   // ✅ 正确
   const i18nPlugin = createI18nEnginePlugin(...)
   const localeRef = i18nPlugin.localeRef
   const colorPlugin = createColorPlugin({ locale: localeRef })
   ```

2. **使用单一切换点**
   ```typescript
   // ✅ 推荐：只通过 i18n 切换
   i18nPlugin.api.changeLocale('en-US')
   
   // ❌ 避免：分别切换各个插件
   colorPlugin.setLocale('en-US')
   sizePlugin.setLocale('en-US')
   ```

3. **利用 Vue 响应式**
   ```typescript
   // ✅ 使用 computed 自动响应
   const label = computed(() => plugin.localeMessages.value.label)
   
   // ❌ 避免手动更新
   let label = plugin.localeMessages.value.label
   watch(locale, () => {
     label = plugin.localeMessages.value.label
   })
   ```

4. **合理使用监听**
   ```typescript
   // ✅ 只监听副作用
   watch(localeRef, (locale) => {
     document.title = t('app.name')
   })
   
   // ❌ 避免在 watch 中做状态同步（Vue 会自动处理）
   watch(localeRef, (locale) => {
     colorPlugin.setLocale(locale)  // 不需要！
   })
   ```

---

## 🚀 性能优化

### 懒加载语言包

```typescript
const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  messages: {
    'zh-CN': () => import('@/locales/zh-CN'),
    'en-US': () => import('@/locales/en-US')
  }
})
```

### 减少 computed 计算

```typescript
// ✅ 推荐：只创建需要的 computed
const themeLabel = computed(() => plugin.localeMessages.value.themeLabel)

// ❌ 避免：创建整个 localeMessages 的副本
const allMessages = computed(() => ({ ...plugin.localeMessages.value }))
```

---

## 📚 参考

- [架构设计文档](../architecture/locale-management.md)
- [API 文档](../api/i18n.md)
- [迁移指南](../guides/migration.md)
