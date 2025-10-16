# LDesign 多语言国际化集成方案

## 📖 概述

本方案通过 `@ldesign/engine` 的 `StateManager` 实现了跨包的响应式国际化管理，完全解耦且支持实时语言切换。

## 🎯 架构设计

```
engine.state (响应式中心)
    ↓
i18n plugin → 更新 engine.state.locale
    ↓
color/size plugins → 监听 engine.state.locale → 更新内部状态
    ↓
Vue provide('app-locale') → 组件响应式更新
```

### 核心优势

✅ **完全解耦** - 各包独立，无相互依赖  
✅ **响应式** - 基于 Vue reactive，自动更新  
✅ **统一管理** - engine.state 作为唯一数据源  
✅ **易于扩展** - 新增包只需监听 engine.state.locale

## 🚀 使用方法

### 1. 在 app_simple 中配置

```typescript
// main.ts
import { createEngine } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createColorEnginePlugin } from '@ldesign/color/plugin'
import { createSizeEnginePlugin } from '@ldesign/size/vue'

// 创建 engine 实例
const engine = createEngine({
  debug: true
})

// 创建 i18n 插件（带语言包）
const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      welcome: '欢迎使用 LDesign',
      settings: '设置'
    },
    'en-US': {
      welcome: 'Welcome to LDesign',
      settings: 'Settings'
    }
  }
})

// 创建 color 插件
const colorPlugin = createColorEnginePlugin({
  defaultLocale: 'zh-CN',
  defaultTheme: 'blue'
})

// 创建 size 插件
const sizePlugin = createSizeEnginePlugin({
  defaultLocale: 'zh-CN'
})

// 注册插件到 engine（顺序很重要！）
async function initApp() {
  // 1. 先注册 i18n（它会设置 engine.state.locale）
  await engine.use(i18nPlugin)
  
  // 2. 再注册 color 和 size（它们会监听 engine.state.locale）
  await engine.use(colorPlugin)
  await engine.use(sizePlugin)
  
  // 3. 创建 Vue 应用
  const app = engine.createApp(App)
  
  // 4. 设置各插件的 Vue 集成
  i18nPlugin.setupVueApp(app)
  colorPlugin.setupVueApp(app)
  sizePlugin.setupVueApp(app)
  
  // 5. 挂载应用
  await engine.mount('#app')
}

initApp()
```

### 2. 在组件中使用

```vue
<template>
  <div class="app">
    <!-- 国际化文本 -->
    <h1>{{ t('welcome') }}</h1>
    
    <!-- 语言切换器 -->
    <div class="controls">
      <button @click="changeLocale('zh-CN')">中文</button>
      <button @click="changeLocale('en-US')">English</button>
    </div>
    
    <!-- Color 主题选择器（自动响应语言变化） -->
    <ThemePicker />
    
    <!-- Size 尺寸选择器（自动响应语言变化） -->
    <SizeSelector />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from '@ldesign/i18n/adapters/vue'
import ThemePicker from '@ldesign/color/vue/ThemePicker'
import SizeSelector from '@ldesign/size/vue/SizeSelector'

// 使用 i18n
const { t } = useI18n()

// 获取 engine 实例
const engine = inject('engine')

// 切换语言（会自动同步到所有子包）
const changeLocale = async (locale: string) => {
  await engine.i18n.setLocale(locale)
  // color 和 size 组件会自动更新！
}
</script>
```

### 3. 工作流程

1. **初始化时**
   ```
   i18n.setLocale('zh-CN')
     → engine.state.set('locale', 'zh-CN')
     → color/size 插件监听到变化
     → 更新各自的 currentLocale ref
     → Vue provide 传递给组件
     → 组件自动重新渲染
   ```

2. **切换语言时**
   ```
   用户点击切换按钮
     → engine.i18n.setLocale('en-US')
     → engine.state.set('locale', 'en-US')
     → color/size 的 watch 回调触发
     → currentLocale.value = 'en-US'
     → computed locale 自动更新
     → ThemePicker/SizeSelector 自动更新显示
   ```

## 📦 扩展新包

如需为其他包添加国际化支持，按以下步骤：

### 1. 创建 locales 文件

```typescript
// packages/your-package/src/locales/index.ts
export interface YourLocale {
  someKey: string
}

export const zhCN: YourLocale = {
  someKey: '中文'
}

export const enUS: YourLocale = {
  someKey: 'English'
}

export const locales = {
  'zh-CN': zhCN,
  'en-US': enUS
}

export function getLocale(locale: string): YourLocale {
  return locales[locale] || enUS
}
```

### 2. 创建 engine 插件

```typescript
// packages/your-package/src/enginePlugin.ts
import { ref, computed } from 'vue'
import { getLocale } from './locales'

export function createYourEnginePlugin(options = {}) {
  const currentLocale = ref('zh-CN')
  const localeMessages = computed(() => getLocale(currentLocale.value))
  
  return {
    name: '@ldesign/your-package',
    version: '1.0.0',
    
    async install(context: any) {
      if (context.engine?.state) {
        // 获取初始语言
        const engineLocale = context.engine.state.get('locale')
        if (engineLocale) {
          currentLocale.value = engineLocale
        }
        
        // 监听语言变化
        context.engine.state.watch('locale', (newLocale) => {
          if (newLocale) currentLocale.value = newLocale
        })
      }
    },
    
    setupVueApp(app) {
      app.provide('app-locale', currentLocale)
      app.provide('your-locale', localeMessages)
    },
    
    currentLocale,
    getLocaleMessages() {
      return localeMessages.value
    }
  }
}
```

### 3. 在组件中使用

```vue
<template>
  <div>{{ t('someKey') }}</div>
</template>

<script setup>
import { inject, computed } from 'vue'
import { getLocale } from '../locales'

const appLocale = inject('app-locale', null)

const currentLocale = computed(() => {
  return appLocale?.value || 'zh-CN'
})

const locale = computed(() => getLocale(currentLocale.value))

const t = (key) => locale.value[key] || key
</script>
```

## 🔧 API 参考

### Engine State

```typescript
// 获取当前语言
const currentLocale = engine.state.get('locale')

// 设置语言（不推荐，应该使用 i18n.setLocale）
engine.state.set('locale', 'en-US')

// 监听语言变化
const unwatch = engine.state.watch('locale', (newLocale) => {
  console.log('Locale changed to:', newLocale)
})

// 取消监听
unwatch()
```

### I18n Plugin

```typescript
// 获取当前语言
const locale = engine.i18n.locale

// 切换语言（推荐方式）
await engine.i18n.setLocale('en-US')

// 翻译
const text = engine.i18n.t('key')

// 监听语言变化
engine.i18n.on('localeChanged', ({ locale }) => {
  console.log('Locale changed:', locale)
})
```

### Color Plugin

```typescript
// 通过 engine 访问
engine.color.applyTheme('#1890ff')

// 组件内部自动响应 app-locale 的变化
```

### Size Plugin

```typescript
// 通过 engine 访问
engine.size.applyPreset('compact')

// 组件内部自动响应 app-locale 的变化
```

## 🎨 最佳实践

1. **插件注册顺序**
   - 始终先注册 `i18n` 插件
   - 再注册依赖语言的其他插件（color、size 等）
   
2. **语言切换**
   - 统一使用 `engine.i18n.setLocale()` 切换语言
   - 不要直接修改 `engine.state.set('locale')`
   
3. **组件设计**
   - 使用 `inject('app-locale')` 获取响应式语言
   - 使用 `computed` 派生翻译文本
   - 避免在 data 中缓存翻译结果

4. **性能优化**
   - 翻译文本使用 `computed` 而非 `watch`
   - 避免在循环中频繁调用翻译函数
   - 大型语言包考虑懒加载

## 🐛 故障排查

### 问题：组件语言不更新

**原因**：inject 的 locale 不是响应式的

**解决**：
```typescript
// ❌ 错误
const locale = inject('app-locale')

// ✅ 正确
const appLocale = inject('app-locale', null)
const currentLocale = computed(() => appLocale?.value || 'zh-CN')
```

### 问题：engine.state.locale 未定义

**原因**：i18n 插件未正确注册或初始化

**解决**：
1. 确认 i18n 插件在最前面注册
2. 检查 i18n 配置是否正确
3. 查看控制台是否有错误信息

### 问题：语言切换延迟

**原因**：使用了异步操作或大量计算

**解决**：
1. 使用 `computed` 替代 `watch`
2. 避免在 computed 中进行复杂计算
3. 考虑使用 memo 缓存计算结果

## 📚 相关文档

- [Engine 文档](../../packages/engine/README.md)
- [I18n 文档](../../packages/i18n/README.md)
- [Color 文档](../../packages/color/README.md)
- [Size 文档](../../packages/size/README.md)
