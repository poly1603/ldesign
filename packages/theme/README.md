# @ldesign/theme

<div align="center">

![LDesign Theme](https://img.shields.io/badge/LDesign-Theme-blue?style=for-the-badge)
![Vue 3](https://img.shields.io/badge/Vue-3.x-green?style=for-the-badge&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**🎨 一个功能强大的主题系统，为你的应用带来节日的魅力！**

[📖 文档](./docs) | [🚀 快速开始](#快速开始) | [🎯 示例](./examples) | [🤝 贡献指南](#贡献)

</div>

## ✨ 特性

- 🎄 **节日主题**: 内置圣诞节、春节、万圣节等节日主题
- 🎭 **装饰元素**: 雪花飘落、灯笼摆动、烟花绽放等动态装饰
- 🎬 **动画效果**: 丰富的 CSS 和 JavaScript 动画系统
- 🎯 **Vue 集成**: 完美支持 Vue 3，提供组件、指令和组合式函数
- 📱 **响应式设计**: 自适应不同屏幕尺寸和设备
- ⚡ **性能优化**: GPU 加速动画，智能资源管理
- 🎨 **高度可定制**: 支持自定义主题、装饰和动画
- 🌍 **国际化**: 支持多语言和本地化

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/theme

# 使用 npm
npm install @ldesign/theme

# 使用 yarn
yarn add @ldesign/theme
```

### 基础使用

#### 1. 在 Vue 应用中使用

```typescript
import { createApp } from 'vue'
import { VueThemePlugin } from '@ldesign/theme/vue'
import { christmasTheme, springFestivalTheme } from '@ldesign/theme/themes'

const app = createApp(App)

// 安装主题插件
app.use(VueThemePlugin, {
  themes: [christmasTheme, springFestivalTheme],
  defaultTheme: 'christmas',
  autoActivate: true,
})

app.mount('#app')
```

#### 2. 使用主题提供者

```vue
<template>
  <ThemeProvider :themes="themes" theme="christmas" :auto-activate="true">
    <div class="app">
      <ThemeSelector v-model:value="currentTheme" />
      <ThemeButton type="primary" decoration="snowflake"> 点击我！ </ThemeButton>
    </div>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ThemeProvider, ThemeSelector, ThemeButton } from '@ldesign/theme/vue'
import { christmasTheme, springFestivalTheme } from '@ldesign/theme/themes'

const themes = [christmasTheme, springFestivalTheme]
const currentTheme = ref('christmas')
</script>
```

#### 3. 使用组合式函数

```vue
<script setup lang="ts">
import { useTheme, useThemeDecorations } from '@ldesign/theme/vue'

const { currentTheme, setTheme, availableThemes } = useTheme()
const { decorations, addDecoration } = useThemeDecorations()

// 切换主题
const switchToSpringFestival = () => {
  setTheme('spring-festival')
}

// 添加装饰
const addSnowflake = () => {
  addDecoration({
    id: 'custom-snowflake',
    name: '自定义雪花',
    type: 'svg',
    src: '/snowflake.svg',
    position: {
      type: 'fixed',
      position: { x: '50%', y: '10%' },
      anchor: 'top-center',
    },
    style: {
      size: { width: '30px', height: '30px' },
      opacity: 0.8,
      zIndex: 1000,
    },
    animation: 'snowfall',
    interactive: true,
    responsive: true,
  })
}
</script>
```

#### 4. 使用指令

```vue
<template>
  <!-- 添加装饰指令 -->
  <div v-theme-decoration="{ decoration: 'snowflake', visible: true }">内容区域</div>

  <!-- 添加动画指令 -->
  <div
    v-theme-animation="{
      animation: 'sparkle',
      trigger: 'hover',
      autoplay: false,
    }"
  >
    悬停时闪烁
  </div>

  <!-- 使用修饰符 -->
  <div v-theme-decoration.hover="{ decoration: 'lantern' }">悬停显示灯笼</div>

  <div v-theme-animation.loop.slow="{ animation: 'glow' }">慢速循环发光</div>
</template>
```

## 🎨 主题系统

### 内置主题

| 主题      | 描述                   | 装饰元素               | 动画效果           |
| --------- | ---------------------- | ---------------------- | ------------------ |
| 🎄 圣诞节 | 红绿配色，温馨节日氛围 | 雪花、圣诞树、圣诞帽   | 雪花飘落、树木发光 |
| 🧧 春节   | 红金配色，喜庆中国风   | 灯笼、烟花、金币、福字 | 灯笼摆动、烟花绽放 |
| 🎃 万圣节 | 橙黑配色，神秘恐怖风格 | 南瓜灯、幽灵、蝙蝠     | 幽灵飘浮、南瓜发光 |

### 自定义主题

```typescript
import { createCustomTheme } from '@ldesign/theme'

const myTheme = createCustomTheme('my-theme', '我的主题', {
  description: '自定义主题描述',
  colors: {
    name: 'my-colors',
    displayName: '我的配色',
    light: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      // ... 更多颜色配置
    },
    dark: {
      primary: '#ff8e8e',
      secondary: '#6ee7dd',
      // ... 更多颜色配置
    },
  },
  decorations: [
    // 自定义装饰元素
  ],
  animations: [
    // 自定义动画
  ],
})
```

## 📖 API 文档

详细的 API 文档请访问：[文档站点](https://ldesign.github.io/theme/)

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# E2E 测试
pnpm test:e2e

# 文档开发
pnpm docs:dev
```

## 许可证

MIT © LDesign Team
