# @ldesign/color

一个功能完整的主题色管理系统，支持框架无关的核心功能和 Vue 3 集成。

## 特性

- 🎨 **智能颜色生成** - 基于 a-nice-red 算法从主色调自动生成配套颜色
- 🌈 **完整色阶系统** - 集成 @arco-design/color 生成亮色和暗色模式的完整色阶
- ⚡ **性能优化** - 闲时处理机制，不阻塞主线程
- 💾 **本地缓存** - 智能缓存和持久化存储
- 🌙 **系统主题检测** - 自动检测和同步系统主题
- 🔧 **框架无关** - 可在任何 JavaScript 环境中使用
- 🎯 **Vue 3 集成** - 提供完整的 Vue 3 组合式 API
- 📦 **TypeScript 支持** - 完整的类型定义
- 🎪 **丰富预设** - 内置多种精美主题

## 安装

```bash
# 使用 pnpm
pnpm add @ldesign/color

# 使用 npm
npm install @ldesign/color

# 使用 yarn
yarn add @ldesign/color
```

## 快速开始

### 基础使用

```typescript
import { createThemeManagerWithPresets } from '@ldesign/color'

// 创建带预设主题的管理器
const themeManager = await createThemeManagerWithPresets({
  defaultTheme: 'default',
  autoDetect: true // 自动检测系统主题
})

// 切换主题
await themeManager.setTheme('green')

// 切换颜色模式
await themeManager.setMode('dark')
```

### 自定义主题

```typescript
import { createCustomThemeManager } from '@ldesign/color'

// 使用自定义主色调创建主题管理器
const themeManager = await createCustomThemeManager('#1890ff', {
  themeName: 'myTheme',
  darkPrimaryColor: '#177ddc'
})
```

### Vue 3 集成

```typescript
import { ThemePlugin } from '@ldesign/color/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装主题插件
app.use(ThemePlugin, {
  defaultTheme: 'default',
  autoDetect: true
})

app.mount('#app')
```

```vue
<!-- 在组件中使用 -->
<script setup>
import { useTheme } from '@ldesign/color/vue'

const {
  currentTheme,
  currentMode,
  availableThemes,
  setTheme,
  toggleMode
} = useTheme()
</script>

<template>
  <div>
    <p>当前主题: {{ currentTheme }}</p>
    <p>当前模式: {{ currentMode }}</p>
    <button @click="toggleMode">
      切换模式
    </button>
    <select @click="setTheme($event.target.value)">
      <option v-for="theme in availableThemes" :key="theme" :value="theme">
        {{ theme }}
      </option>
    </select>
  </div>
</template>
```

## 核心概念

### 主题配置

```typescript
interface ThemeConfig {
  name: string
  displayName?: string
  description?: string
  light: ColorConfig
  dark?: ColorConfig
  builtin?: boolean
}

interface ColorConfig {
  primary: string
  success?: string
  warning?: string
  danger?: string
  gray?: string
}
```

### 颜色生成

系统会自动从主色调生成其他颜色：

```typescript
import { generateColorConfig } from '@ldesign/color'

const colors = generateColorConfig('#1890ff')
// 结果：
// {
//   primary: '#1890ff',
//   success: '#52c41a',  // 自动生成的绿色
//   warning: '#faad14',  // 自动生成的橙色
//   danger: '#ff4d4f',   // 自动生成的红色
//   gray: '#8c8c8c'      // 自动生成的灰色
// }
```

### 色阶生成

每个颜色都会生成完整的色阶：

```typescript
import { generateColorScales } from '@ldesign/color'

const scales = generateColorScales(colors, 'light')
// 每个颜色类别都有 10 级色阶
// scales.primary.indices[1] - 最浅
// scales.primary.indices[5] - 标准色
// scales.primary.indices[10] - 最深
```

## API 文档

### 主题管理器

#### 创建实例

```typescript
// 带预设主题
const manager = await createThemeManagerWithPresets(options)

// 简单实例（仅默认主题）
const manager = await createSimpleThemeManager(options)

// 自定义主题
const manager = await createCustomThemeManager(primaryColor, options)
```

#### 主要方法

```typescript
// 设置主题
await manager.setTheme('green', 'dark')

// 设置模式
await manager.setMode('dark')

// 注册主题
manager.registerTheme(themeConfig)

// 获取主题配置
const config = manager.getThemeConfig('green')

// 预生成主题（性能优化）
await manager.preGenerateAllThemes()
```

### Vue 组合式 API

```typescript
// 基础主题管理
const { currentTheme, currentMode, setTheme, setMode } = useTheme()

// 主题切换器
const { toggle, isDark } = useThemeToggle()

// 主题选择器
const { availableThemes, selectTheme } = useThemeSelector()

// 系统主题同步
const { systemTheme, syncWithSystem } = useSystemThemeSync()
```

## 预设主题

内置以下预设主题：

- `default` - 默认蓝色主题
- `green` - 绿色主题
- `purple` - 紫色主题
- `red` - 红色主题
- `orange` - 橙色主题
- `cyan` - 青色主题
- `pink` - 粉色主题
- `yellow` - 黄色主题
- `dark` - 深色主题
- `minimal` - 极简灰色主题

## 性能优化

### 闲时处理

系统使用 `requestIdleCallback` 在浏览器空闲时预生成主题，确保不影响主线程性能：

```typescript
// 自动在空闲时预生成所有主题
const manager = await createThemeManagerWithPresets({
  idleProcessing: true // 默认开启
})
```

### 缓存机制

内置 LRU 缓存，避免重复计算：

```typescript
const manager = await createThemeManagerWithPresets({
  cache: {
    maxSize: 100, // 最大缓存数量
    defaultTTL: 3600000 // 缓存过期时间（1小时）
  }
})
```

## 许可证

MIT License
