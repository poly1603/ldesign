---
layout: home

hero:
  name: "@ldesign/color"
  text: "主题色管理系统"
  tagline: 功能完整、性能优化、框架无关的主题色管理解决方案
  image:
    src: /logo.svg
    alt: ldesign color
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/color

features:
  - icon: 🎨
    title: 智能颜色生成
    details: 基于 a-nice-red 算法从主色调自动生成和谐的配套颜色，支持多种生成策略
  - icon: 🌈
    title: 完整色阶系统
    details: 集成 @arco-design/color 生成亮色和暗色模式的完整色阶，满足各种设计需求
  - icon: ⚡
    title: 性能优化
    details: 闲时处理机制，LRU 缓存，预生成策略，确保不阻塞主线程的高性能体验
  - icon: 💾
    title: 智能缓存
    details: 支持多种存储方式，智能缓存和持久化，避免重复计算提升用户体验
  - icon: 🌙
    title: 系统主题检测
    details: 自动检测和同步系统主题，支持 prefers-color-scheme 媒体查询
  - icon: 🔧
    title: 框架无关
    details: 核心功能可在任何 JavaScript 环境中使用，同时提供 Vue 3 专门集成
  - icon: 🎯
    title: Vue 3 集成
    details: 提供完整的组合式 API，包含主题切换、选择器、系统同步等功能
  - icon: 📦
    title: TypeScript 支持
    details: 完整的类型定义，提供优秀的开发体验和类型安全保障
---

## 快速体验

::: code-group

```typescript [基础使用]
import { createThemeManagerWithPresets } from '@ldesign/color'

// 创建主题管理器
const themeManager = await createThemeManagerWithPresets({
  defaultTheme: 'default',
  autoDetect: true // 自动检测系统主题
})

// 切换主题
await themeManager.setTheme('green')
await themeManager.setMode('dark')
```

```vue [Vue 3 集成]
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
    <select @change="setTheme($event.target.value)">
      <option v-for="theme in availableThemes" :key="theme" :value="theme">
        {{ theme }}
      </option>
    </select>
  </div>
</template>
```

```typescript [颜色生成]
import { generateColorConfig } from '@ldesign/color'

// 从主色调生成完整颜色配置
const colors = generateColorConfig('#1890ff')

console.log(colors)
// {
//   primary: '#1890ff',
//   success: '#52c41a',  // 自动生成
//   warning: '#faad14',  // 自动生成
//   danger: '#ff4d4f',   // 自动生成
//   gray: '#8c8c8c'      // 自动生成
// }
```

:::

## 为什么选择 @ldesign/color？

### 🚀 高性能设计

采用闲时处理机制，使用 `requestIdleCallback` 在浏览器空闲时预生成主题，确保不影响主线程性能。内置 LRU 缓存避免重复计算，提供即时的主题切换体验。

### 🎨 智能颜色系统

基于色彩理论和 HSL 颜色空间，从单一主色调智能生成和谐的配套颜色。支持多种生成策略：默认、柔和、鲜艳、单色等，满足不同设计需求。

### 🌈 完整色阶支持

集成业界领先的 @arco-design/color 库，为每个颜色生成 10 级完整色阶，同时支持亮色和暗色模式，为设计系统提供丰富的颜色选择。

### 🔧 开发体验优秀

提供完整的 TypeScript 类型定义，丰富的便捷函数，简单直观的 API 设计。支持框架无关使用，同时为 Vue 3 提供专门的组合式 API 集成。

## 立即开始

```bash
# 安装
pnpm add @ldesign/color

# 或使用 npm
npm install @ldesign/color
```

[开始使用 →](/guide/getting-started)
