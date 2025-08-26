---
layout: home

hero:
  name: '@ldesign/color'
  text: '现代颜色处理库'
  tagline: 功能强大、性能卓越的颜色管理解决方案 - 支持颜色转换、调色板生成、可访问性检查
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
    title: 智能颜色处理
    details: 支持 HEX、RGB、HSL、HSV 格式互转，12种混合模式，亮度饱和度调节，渐变生成
  - icon: 🌈
    title: 专业调色板
    details: 单色、类似色、互补色、三元色调色板生成，基于色彩理论的和谐配色
  - icon: ♿
    title: 可访问性检查
    details: WCAG AA/AAA 标准检查，8种颜色盲模拟，智能配色建议，批量方案检测
  - icon: 🎯
    title: 主题管理
    details: 动态主题切换，系统主题同步，自定义主题配置，CSS 变量自动管理
  - icon: ⚡
    title: 性能优化
    details: 闲时处理机制，LRU 缓存策略，预计算优化，智能内存管理
  - icon: 🔧
    title: Vue 3 集成
    details: 完整组合式 API，颜色选择器、调色板生成器、可访问性检查器等组件
  - icon: 📦
    title: 现代构建
    details: TypeScript 编写，ESM/CJS 双格式，Tree Shaking 支持，完整类型定义
  - icon: 🚀
    title: 开发体验
    details: 简洁 API 设计，丰富示例文档，完善测试覆盖，活跃社区支持
---

## 快速体验

::: code-group

```typescript [基础使用]
import { createThemeManagerWithPresets } from '@ldesign/color'

// 创建主题管理器
const themeManager = await createThemeManagerWithPresets({
  defaultTheme: 'default',
  autoDetect: true, // 自动检测系统主题
})

// 切换主题
await themeManager.setTheme('green')
await themeManager.setMode('dark')
```

```vue [Vue 3 集成]
<script setup>
import { useTheme } from '@ldesign/color/vue'

const { currentTheme, currentMode, availableThemes, setTheme, toggleMode } = useTheme()
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

采用闲时处理机制，使用 `requestIdleCallback` 在浏览器空闲时预生成主题，确保不影响主线程性能。内置
LRU 缓存避免重复计算，提供即时的主题切换体验。

### 🎨 智能颜色系统

基于色彩理论和 HSL 颜色空间，从单一主色调智能生成和谐的配套颜色。支持多种生成策略：默认、柔和、鲜艳
、单色等，满足不同设计需求。

### 🌈 完整色阶支持

集成业界领先的 @arco-design/color 库，为每个颜色生成 10 级完整色阶，同时支持亮色和暗色模式，为设计系
统提供丰富的颜色选择。

### 🔧 开发体验优秀

提供完整的 TypeScript 类型定义，丰富的便捷函数，简单直观的 API 设计。支持框架无关使用，同时为 Vue 3
提供专门的组合式 API 集成。

## 立即开始

```bash
# 安装
pnpm add @ldesign/color

# 或使用 npm
npm install @ldesign/color
```

[开始使用 →](/guide/getting-started)
