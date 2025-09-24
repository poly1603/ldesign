# 快速开始

本指南将帮助您快速上手 @ldesign/color，在几分钟内实现主题色管理功能。

## 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/color
```

```bash [npm]
npm install @ldesign/color
```

```bash [yarn]
yarn add @ldesign/color
```

:::

## 基础使用

### 1. 创建主题管理器

最简单的方式是使用预设主题创建管理器：

```typescript
import { createThemeManagerWithPresets } from '@ldesign/color'

// 创建带预设主题的管理器
const themeManager = await createThemeManagerWithPresets({
  defaultTheme: 'default', // 默认主题
  autoDetect: true, // 自动检测系统主题
  idleProcessing: true, // 启用闲时处理优化
})

console.log('当前主题:', themeManager.getCurrentTheme())
console.log('当前模式:', themeManager.getCurrentMode())
console.log('可用主题:', themeManager.getThemeNames())
```

### 2. 主题切换

```typescript
// 切换到绿色主题
await themeManager.setTheme('green')

// 切换到暗色模式
await themeManager.setMode('dark')

// 同时设置主题和模式
await themeManager.setTheme('purple', 'dark')
```

### 3. 颜色生成

从主色调自动生成配套颜色：

```typescript
import { generateColorConfig } from '@ldesign/color'

const colors = generateColorConfig('#1890ff')
console.log(colors)
// 输出：
// {
//   primary: '#1890ff',
//   success: '#52c41a',
//   warning: '#faad14',
//   danger: '#ff4d4f',
//   gray: '#8c8c8c'
// }
```

## Vue 3 集成

### 1. 安装插件

```typescript
import { ThemePlugin } from '@ldesign/color/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装主题插件
app.use(ThemePlugin, {
  defaultTheme: 'default',
  autoDetect: true,
})

app.mount('#app')
```

### 2. 在组件中使用

```vue
<script setup>
import { useTheme } from '@ldesign/color/vue'

const {
  currentTheme,
  currentMode,
  isDark,
  availableThemes,
  setTheme,
  toggleMode,
} = useTheme()
</script>

<template>
  <div class="theme-demo">
    <h2>主题管理演示</h2>

    <!-- 当前状态显示 -->
    <div class="status">
      <p>
        当前主题: <strong>{{ currentTheme }}</strong>
      </p>
      <p>
        当前模式: <strong>{{ currentMode }}</strong>
      </p>
      <p>
        是否暗色: <strong>{{ isDark ? '是' : '否' }}</strong>
      </p>
    </div>

    <!-- 主题切换 -->
    <div class="controls">
      <label>
        选择主题:
        <select :value="currentTheme" @change="setTheme($event.target.value)">
          <option v-for="theme in availableThemes" :key="theme" :value="theme">
            {{ theme }}
          </option>
        </select>
      </label>

      <button @click="toggleMode">
        切换到{{ isDark ? '亮色' : '暗色' }}模式
      </button>
    </div>
  </div>
</template>

<style>
.theme-demo {
  padding: 20px;
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.status {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--color-primary-1);
  border-radius: 6px;
}

.controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

button {
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: var(--color-primary-hover);
}

select {
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}
</style>
```

## 自定义主题

### 创建自定义主题

```typescript
import { createCustomThemeManager } from '@ldesign/color'

// 使用自定义主色调创建主题管理器
const themeManager = await createCustomThemeManager('#ff6b35', {
  themeName: 'orange-custom',
  darkPrimaryColor: '#e55a2b',
})
```

### 注册多个自定义主题

```typescript
import { createThemeManager } from '@ldesign/color'

const customThemes = [
  {
    name: 'brand-blue',
    displayName: '品牌蓝',
    light: { primary: '#0066cc' },
    dark: { primary: '#4d94ff' },
  },
  {
    name: 'brand-green',
    displayName: '品牌绿',
    light: { primary: '#00a854' },
    dark: { primary: '#49aa19' },
  },
]

const themeManager = createThemeManager({
  themes: customThemes,
  defaultTheme: 'brand-blue',
})

await themeManager.init()
```

## 系统主题检测

启用系统主题自动检测：

```typescript
// 手动检测系统主题
import { getSystemTheme, watchSystemTheme } from '@ldesign/color'

const themeManager = await createThemeManagerWithPresets({
  autoDetect: true, // 启用自动检测
  onThemeChanged: (theme, mode) => {
    console.log(`主题已切换: ${theme} - ${mode}`)
  },
})

console.log('系统主题:', getSystemTheme()) // 'light' | 'dark'

// 监听系统主题变化
const unwatch = watchSystemTheme(mode => {
  console.log('系统主题变化:', mode)
  themeManager.setMode(mode)
})

// 取消监听
// unwatch()
```

## 性能优化

### 预生成主题

```typescript
// 预生成所有主题（在空闲时间进行）
await themeManager.preGenerateAllThemes()

// 预生成特定主题
await themeManager.preGenerateTheme('green')

// 获取预生成的主题数据
const generatedTheme = themeManager.getGeneratedTheme('green')
console.log('生成的主题数据:', generatedTheme)
```

### 缓存配置

```typescript
const themeManager = await createThemeManagerWithPresets({
  cache: {
    maxSize: 50, // 最大缓存数量
    defaultTTL: 3600000, // 缓存过期时间（1小时）
  },
  idleProcessing: true, // 启用闲时处理
})
```

## 常见问题

### Q: 如何在服务端渲染中使用？

A: 核心功能支持服务端渲染，但系统主题检测等浏览器特性需要在客户端使用：

```typescript
// 服务端安全的创建方式
const themeManager = createThemeManager({
  defaultTheme: 'default',
  autoDetect: false, // 服务端禁用自动检测
})

// 客户端激活时启用自动检测
if (typeof window !== 'undefined') {
  themeManager.updateOptions({ autoDetect: true })
}
```

### Q: 如何自定义颜色生成算法？

A: 可以使用自定义配置调整颜色生成：

```typescript
import { COLOR_GENERATION_PRESETS, generateColorConfig } from '@ldesign/color'

// 使用预设配置
const softColors = generateColorConfig('#1890ff', COLOR_GENERATION_PRESETS.soft)

// 自定义配置
const customColors = generateColorConfig('#1890ff', {
  successHueOffset: 90, // 成功色色相偏移
  warningHueOffset: 30, // 警告色色相偏移
  saturationRange: [0.8, 1.2], // 饱和度调整范围
})
```

## 下一步

- [主题管理](/guide/theme-management) - 深入了解主题管理功能
- [颜色生成](/guide/color-generation) - 学习颜色生成算法
- [Vue 3 集成](/guide/vue-integration) - 详细的 Vue 集成指南
- [API 参考](/api/) - 查看完整的 API 文档
