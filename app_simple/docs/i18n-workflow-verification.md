# 多语言国际化完整工作流程验证

## ✅ 功能确认清单

### 1. 语言包定义

#### Color 包 ✅
- **位置**: `packages/color/src/locales/index.ts`
- **语言**: zh-CN (中文), en-US (英文)
- **内容**:
  ```typescript
  zhCN: {
    theme: {
      selectThemeColor: '选择主题色',
      customColor: '自定义颜色',
      apply: '应用',
      // ... 17 个预设主题名称
    }
  }
  enUS: {
    theme: {
      selectThemeColor: 'Select Theme Color',
      customColor: 'Custom Color',
      apply: 'Apply',
      // ... 17 preset theme names
    }
  }
  ```

#### Size 包 ✅
- **位置**: `packages/size/src/locales/index.ts`
- **语言**: zh-CN (中文), en-US (英文)
- **内容**:
  ```typescript
  zhCN: {
    title: '调整尺寸',
    close: '关闭',
    presets: {
      compact: '紧凑',
      comfortable: '舒适',
      default: '默认',
      spacious: '宽松'
    },
    descriptions: { /* ... */ }
  }
  enUS: {
    title: 'Adjust Size',
    close: 'Close',
    presets: {
      compact: 'Compact',
      comfortable: 'Comfortable',
      default: 'Default',
      spacious: 'Spacious'
    },
    descriptions: { /* ... */ }
  }
  ```

---

### 2. 组件响应式实现

#### ThemePicker.vue ✅
```vue
<template>
  <!-- 所有文本都使用 t() 函数 -->
  <label>{{ t('theme.selectThemeColor', '选择主题色') }}</label>
  <button>{{ t('theme.apply', 'Apply') }}</button>
  <span>{{ t(`theme.presets.${preset.name}`, preset.label) }}</span>
</template>

<script setup>
// 1. 注入响应式 locale
const appLocale = inject<any>('app-locale', null)

// 2. 计算当前语言（响应式）
const currentLocale = computed(() => {
  if (appLocale && appLocale.value) {
    return appLocale.value  // ← 这是 ref！
  }
  return 'zh-CN'
})

// 3. 计算当前语言包（响应式）
const locale = computed(() => getLocale(currentLocale.value))

// 4. 翻译函数（响应式）
const t = (key: string, fallback?: string): string => {
  const keys = key.split('.')
  let value: any = locale.value  // ← 使用 computed
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return fallback || key
    }
  }
  
  return typeof value === 'string' ? value : (fallback || key)
}
</script>
```

#### SizeSelector.vue ✅
```vue
<template>
  <!-- 所有文本都使用 t.value -->
  <h3>{{ t.title }}</h3>
  <button :aria-label="t.close">Close</button>
  <div>{{ getPresetLabel(preset.name) }}</div>
</template>

<script setup>
// 1. 注入响应式 locale
const appLocale = inject<any>('app-locale', null)

// 2. 计算当前语言（响应式）
const currentLocale = computed(() => {
  if (appLocale && appLocale.value) {
    return appLocale.value  // ← 这是 ref！
  }
  return pluginLocale
})

// 3. 计算当前语言包（响应式）
const t = computed(() => {
  const baseLocale = getLocale(currentLocale.value)
  if (!customLocale) return baseLocale
  
  return {
    ...baseLocale,
    title: customLocale.title || baseLocale.title,
    presets: { ...baseLocale.presets, ...customLocale.presets },
    descriptions: { ...baseLocale.descriptions, ...customLocale.descriptions }
  }
})

// 4. 翻译辅助函数（响应式）
function getPresetLabel(name: string): string {
  return t.value.presets[name] || name
}
</script>
```

---

### 3. Engine 插件数据流

#### 初始化流程
```
1. createI18nEnginePlugin()
   └─> i18n.setLocale('zh-CN')
       └─> engine.state.set('locale', 'zh-CN')

2. createColorEnginePlugin()
   └─> engine.state.get('locale')  // 获取 'zh-CN'
   └─> currentLocale.value = 'zh-CN'
   └─> engine.state.watch('locale', callback)  // 监听变化

3. createSizeEnginePlugin()
   └─> engine.state.get('locale')  // 获取 'zh-CN'
   └─> currentLocale.value = 'zh-CN'
   └─> engine.state.watch('locale', callback)  // 监听变化

4. colorPlugin.setupVueApp(app)
   └─> app.provide('app-locale', currentLocale)  // ref

5. sizePlugin.setupVueApp(app)
   └─> app.provide('app-locale', currentLocale)  // ref
```

#### 语言切换流程
```
用户点击"English"按钮
  ↓
await engine.i18n.setLocale('en-US')
  ↓
engine.state.set('locale', 'en-US')  ← i18n 插件内部
  ↓
┌─────────────────────────────────────┐
│ Color Plugin Watch 回调             │
│ currentLocale.value = 'en-US'       │ ← ref 更新
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ Size Plugin Watch 回调              │
│ currentLocale.value = 'en-US'       │ ← ref 更新
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ ThemePicker.vue                     │
│ computed currentLocale 触发         │
│ computed locale 重新计算            │
│ t() 函数返回英文文本                │
│ 组件重新渲染                        │ ← Vue 自动
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ SizeSelector.vue                    │
│ computed currentLocale 触发         │
│ computed t 重新计算                 │
│ getPresetLabel() 返回英文文本       │
│ 组件重新渲染                        │ ← Vue 自动
└─────────────────────────────────────┘
```

---

## 🧪 测试验证

### 场景 1: 初始化

**期望结果**:
```
✓ engine.state.get('locale') === 'zh-CN'
✓ ThemePicker 显示 "选择主题色"
✓ SizeSelector 显示 "调整尺寸"
✓ 所有预设名称显示中文（"蓝色"、"紧凑" 等）
```

### 场景 2: 切换到英文

**操作**:
```typescript
await engine.i18n.setLocale('en-US')
```

**期望结果**:
```
✓ engine.state.get('locale') === 'en-US'
✓ ThemePicker 立即显示 "Select Theme Color"
✓ SizeSelector 立即显示 "Adjust Size"
✓ 所有预设名称显示英文（"Blue"、"Compact" 等）
✓ 无需刷新页面，实时更新
```

### 场景 3: 切换回中文

**操作**:
```typescript
await engine.i18n.setLocale('zh-CN')
```

**期望结果**:
```
✓ 所有文本立即切换回中文
✓ ThemePicker 显示 "选择主题色"
✓ SizeSelector 显示 "调整尺寸"
```

---

## 🔍 调试方法

### 1. 检查语言状态
```typescript
// 在浏览器控制台
console.log('当前语言:', engine.state.get('locale'))
console.log('Color 插件语言:', colorPlugin.currentLocale.value)
console.log('Size 插件语言:', sizePlugin.currentLocale.value)
```

### 2. 监听语言变化
```typescript
// 监听 engine.state.locale
engine.state.watch('locale', (newLocale, oldLocale) => {
  console.log('语言从', oldLocale, '切换到', newLocale)
})
```

### 3. 验证组件响应
```typescript
// 在 ThemePicker 组件内部
watch(currentLocale, (newLocale) => {
  console.log('ThemePicker 检测到语言变化:', newLocale)
  console.log('当前翻译:', t('theme.selectThemeColor'))
})
```

---

## 📊 完整示例代码

### main.ts
```typescript
import { createEngine } from '@ldesign/engine'
import { createI18nEnginePlugin } from '@ldesign/i18n'
import { createColorEnginePlugin } from '@ldesign/color/plugin'
import { createSizeEnginePlugin } from '@ldesign/size/vue'

const engine = createEngine({ debug: true })

// 创建插件
const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': { app: { title: '我的应用' } },
    'en-US': { app: { title: 'My App' } }
  }
})

const colorPlugin = createColorEnginePlugin({ 
  defaultLocale: 'zh-CN' 
})

const sizePlugin = createSizeEnginePlugin({ 
  defaultLocale: 'zh-CN' 
})

// 初始化
async function init() {
  // 1. 注册插件（顺序重要！）
  await engine.use(i18nPlugin)
  await engine.use(colorPlugin)
  await engine.use(sizePlugin)
  
  // 2. 创建 Vue 应用
  const app = engine.createApp(App)
  
  // 3. 设置 Vue 集成
  i18nPlugin.setupVueApp(app)
  colorPlugin.setupVueApp(app)
  sizePlugin.setupVueApp(app)
  
  // 4. 挂载
  await engine.mount('#app')
  
  // 5. 测试语言切换
  console.log('初始语言:', engine.state.get('locale'))
  
  // 5秒后自动切换到英文
  setTimeout(async () => {
    console.log('切换到英文...')
    await engine.i18n.setLocale('en-US')
    console.log('当前语言:', engine.state.get('locale'))
  }, 5000)
}

init()
```

### App.vue
```vue
<template>
  <div class="app">
    <h1>{{ t('app.title') }}</h1>
    
    <!-- 语言切换按钮 -->
    <div class="lang-switcher">
      <button @click="changeLocale('zh-CN')">中文</button>
      <button @click="changeLocale('en-US')">English</button>
    </div>
    
    <!-- 这些组件会自动响应语言变化 -->
    <ThemePicker />
    <SizeSelector />
    
    <!-- 显示当前语言 -->
    <div class="status">
      当前语言: {{ currentLocale }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import { useI18n } from '@ldesign/i18n/adapters/vue'
import ThemePicker from '@ldesign/color/vue/ThemePicker'
import SizeSelector from '@ldesign/size/vue/SizeSelector'

const { t } = useI18n()
const engine = inject<any>('engine')
const appLocale = inject<any>('app-locale')

const currentLocale = computed(() => appLocale?.value || 'zh-CN')

const changeLocale = async (locale: string) => {
  console.log('切换语言到:', locale)
  await engine?.i18n?.setLocale(locale)
  console.log('切换完成！')
}
</script>
```

---

## ✅ 总结

### 已完成的功能

1. ✅ **语言包定义**
   - Color: 中英文翻译（17+ 条）
   - Size: 中英文翻译（10+ 条）

2. ✅ **组件响应式**
   - ThemePicker: 使用 inject + computed
   - SizeSelector: 使用 inject + computed
   - 所有文本使用翻译函数

3. ✅ **Engine 插件**
   - 监听 engine.state.locale
   - 提供响应式 locale ref
   - 自动同步到组件

4. ✅ **实时切换**
   - 语言切换 → state 更新
   - state 更新 → plugin ref 更新
   - ref 更新 → computed 触发
   - computed 触发 → 组件重渲染

### 工作原理

```
i18n.setLocale() 
  → engine.state.locale 变化
  → color/size plugin 的 watch 触发
  → currentLocale ref 更新
  → computed 重新计算
  → 组件自动重新渲染（Vue 响应式）
  → 显示新语言的文本
```

**所有功能都已实现，可以直接使用！** 🎉
