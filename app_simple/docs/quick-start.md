# 快速启动指南 - 响应式多语言支持

## 🚨 重要提示

如果你的**语言切换器、主题选择器、尺寸选择器**还显示中文，说明你**没有使用 Engine 插件**！

## ✅ 正确的配置方法

### main.ts（完整示例）

```typescript
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createColorEnginePlugin } from '@ldesign/color/plugin'  // ← 注意路径！
import { createSizeEnginePlugin } from '@ldesign/size/vue'
import App from './App.vue'

// 1. 创建 engine
const engine = createEngine({
  debug: true
})

// 2. 创建 i18n 插件（带你的语言包）
const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      app: {
        title: '我的应用',
        switchLanguage: '切换语言'
      }
    },
    'en-US': {
      app: {
        title: 'My App',
        switchLanguage: 'Switch Language'
      }
    }
  },
  detectBrowserLanguage: true,
  persistLanguage: true
})

// 3. 创建 color 插件（Engine 版本）
const colorPlugin = createColorEnginePlugin({
  defaultLocale: 'zh-CN',  // ← 初始语言
  defaultTheme: 'blue',
  autoApply: true
})

// 4. 创建 size 插件（Engine 版本）
const sizePlugin = createSizeEnginePlugin({
  defaultLocale: 'zh-CN',  // ← 初始语言
  storageKey: 'my-app-size'
})

// 5. 初始化应用
async function initApp() {
  // 按顺序注册插件（顺序很重要！）
  await engine.use(i18nPlugin)   // ← 必须第一个
  await engine.use(colorPlugin)  // ← 它会监听 engine.state.locale
  await engine.use(sizePlugin)   // ← 它会监听 engine.state.locale
  
  // 创建 Vue 应用
  const app = engine.createApp(App)
  
  // 设置 Vue 集成（这会 provide 'app-locale'）
  i18nPlugin.setupVueApp(app)
  colorPlugin.setupVueApp(app)  // ← 这里会 provide('app-locale', currentLocale)
  sizePlugin.setupVueApp(app)   // ← 这里会 provide('app-locale', currentLocale)
  
  // 挂载
  await engine.mount('#app')
  
  console.log('✅ 应用启动成功')
  console.log('当前语言:', engine.state.get('locale'))
}

initApp().catch(err => {
  console.error('❌ 应用启动失败:', err)
})
```

### App.vue（语言切换示例）

```vue
<template>
  <div class="app">
    <h1>{{ t('app.title') }}</h1>
    
    <!-- 语言切换按钮 -->
    <div class="controls">
      <button @click="changeLocale('zh-CN')">中文</button>
      <button @click="changeLocale('en-US')">English</button>
    </div>
    
    <!-- 这些组件会自动响应语言变化！ -->
    <ThemePicker />
    <SizeSelector />
    <VueThemeModeSwitcher />
    
    <!-- 显示当前语言 -->
    <p>当前语言: {{ currentLocale }}</p>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import { useI18n } from '@ldesign/i18n/adapters/vue'
import ThemePicker from '@ldesign/color/vue/ThemePicker'
import SizeSelector from '@ldesign/size/vue/SizeSelector'
import VueThemeModeSwitcher from '@ldesign/color/vue/VueThemeModeSwitcher'

// 1. 使用 i18n
const { t } = useI18n()

// 2. 获取 engine 实例
const engine = inject<any>('engine')

// 3. 获取当前语言（响应式）
const appLocale = inject<any>('app-locale')
const currentLocale = computed(() => appLocale?.value || 'zh-CN')

// 4. 切换语言
const changeLocale = async (locale: string) => {
  console.log('切换语言到:', locale)
  await engine?.i18n?.setLocale(locale)
  console.log('✅ 语言切换完成')
  // 所有组件会自动更新！
}
</script>
```

---

## 🎯 工作流程

```
用户点击"English"
    ↓
engine.i18n.setLocale('en-US')
    ↓
engine.state.set('locale', 'en-US')  ← i18n 自动同步
    ↓
Color Plugin: currentLocale.value = 'en-US'  ← watch 触发
    ↓
Size Plugin: currentLocale.value = 'en-US'   ← watch 触发
    ↓
ThemePicker: 显示 "Select Theme Color"       ← 自动更新
SizeSelector: 显示 "Adjust Size"             ← 自动更新
VueThemeModeSwitcher: 显示 "Light/Dark"      ← 自动更新
```

---

## ❌ 常见错误

### 错误 1: 直接使用 Vue 插件

```typescript
// ❌ 错误方式
import { sizePlugin } from '@ldesign/size/vue'
import { createColorPlugin } from '@ldesign/color/plugin'

app.use(sizePlugin)
app.use(createColorPlugin())
```

**问题**: 这些插件不会监听 `engine.state.locale`，语言切换不生效。

**正确方式**:
```typescript
// ✅ 正确方式
import { createSizeEnginePlugin } from '@ldesign/size/vue'
import { createColorEnginePlugin } from '@ldesign/color/plugin'

const sizePlugin = createSizeEnginePlugin({ defaultLocale: 'zh-CN' })
const colorPlugin = createColorEnginePlugin({ defaultLocale: 'zh-CN' })

await engine.use(sizePlugin)
await engine.use(colorPlugin)

sizePlugin.setupVueApp(app)
colorPlugin.setupVueApp(app)
```

### 错误 2: 忘记调用 setupVueApp

```typescript
// ❌ 错误方式
await engine.use(i18nPlugin)
await engine.use(colorPlugin)
await engine.use(sizePlugin)

const app = engine.createApp(App)
await engine.mount('#app')  // 忘记 setupVueApp
```

**问题**: 组件拿不到 `app-locale`，无法响应式更新。

**正确方式**:
```typescript
// ✅ 正确方式
await engine.use(i18nPlugin)
await engine.use(colorPlugin)
await engine.use(sizePlugin)

const app = engine.createApp(App)

// 必须调用！
i18nPlugin.setupVueApp(app)
colorPlugin.setupVueApp(app)
sizePlugin.setupVueApp(app)

await engine.mount('#app')
```

### 错误 3: 插件注册顺序错误

```typescript
// ❌ 错误方式
await engine.use(colorPlugin)  // color 先注册
await engine.use(i18nPlugin)   // i18n 后注册
```

**问题**: color 注册时 `engine.state.locale` 还不存在。

**正确方式**:
```typescript
// ✅ 正确方式
await engine.use(i18nPlugin)   // i18n 必须第一个
await engine.use(colorPlugin)
await engine.use(sizePlugin)
```

---

## 🔍 调试方法

### 1. 检查 engine.state.locale

```typescript
// 在浏览器控制台
console.log('当前语言:', engine.state.get('locale'))
// 应该输出: 'zh-CN' 或 'en-US'
```

### 2. 检查插件是否正确注册

```typescript
console.log('Color 插件语言:', colorPlugin.currentLocale.value)
console.log('Size 插件语言:', sizePlugin.currentLocale.value)
// 应该和 engine.state.get('locale') 一致
```

### 3. 检查组件是否接收到 app-locale

```vue
<script setup>
const appLocale = inject('app-locale')
console.log('组件接收到的 locale:', appLocale?.value)
// 应该输出: 'zh-CN' 或 'en-US'
</script>
```

### 4. 监听语言变化

```typescript
engine.state.watch('locale', (newLocale, oldLocale) => {
  console.log('语言从', oldLocale, '切换到', newLocale)
})
```

---

## ✅ 验证清单

运行应用后，测试以下场景：

- [ ] 初始化时显示默认语言（中文或英文）
- [ ] 点击"English"按钮
  - [ ] ThemePicker 显示 "Select Theme Color"
  - [ ] SizeSelector 显示 "Adjust Size"、"Compact"、"Comfortable" 等
  - [ ] VueThemeModeSwitcher 显示 "Light"、"Dark"、"Follow System"
  - [ ] 应用标题等文本也切换到英文
- [ ] 点击"中文"按钮
  - [ ] 所有文本立即切换回中文
  - [ ] 无需刷新页面

如果以上所有测试通过，说明配置成功！🎉

---

## 📞 需要帮助？

如果语言切换还不生效，请检查：

1. ✅ 是否使用了 `createColorEnginePlugin` 和 `createSizeEnginePlugin`
2. ✅ 是否调用了 `setupVueApp(app)`
3. ✅ 是否按正确顺序注册插件（i18n 第一个）
4. ✅ 组件是否正确 `inject('app-locale')`

查看控制台日志，应该看到：
```
📦 开始注册插件...
  ✓ 注册 I18n 插件
  ✓ 注册 Color 插件
  ✓ 注册 Size 插件
✅ 所有插件注册完成
[ColorPlugin] Integrated with engine.state for reactive locale
[SizePlugin] Integrated with engine.state for reactive locale
```
