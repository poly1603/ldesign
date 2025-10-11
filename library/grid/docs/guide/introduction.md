# 介绍

## 什么是 @ldesign/gridstack?

@ldesign/gridstack 是一个基于 [gridstack.js](https://gridstackjs.com/) 封装的强大网格布局库，提供了对 Vanilla JavaScript、Vue 3 和 React 的完整支持。

## 特性

### 🚀 易于使用

简洁的 API 设计，开箱即用。无需复杂的配置，几行代码即可创建一个功能完整的拖拽网格系统。

### 🎨 配置丰富

支持 GridStack 所有配置选项，包括：
- 自定义列数和行数
- 单元格大小调整
- 拖拽和调整大小
- 静态/动态模式
- 响应式断点
- 嵌套网格
- 更多...

### ⚡️ 高性能

- 优化的渲染性能
- 高效的内存管理
- 批量更新支持
- 虚拟滚动（计划中）

### 🔧 多框架支持

#### Vanilla JavaScript / TypeScript
```typescript
import { GridStackManager } from '@ldesign/gridstack/vanilla'

const grid = new GridStackManager('#grid', options)
```

#### Vue 3
```vue
<template>
  <GridStack :options="gridOptions">
    <GridStackItem />
  </GridStack>
</template>

<script setup>
import { GridStack, GridStackItem } from '@ldesign/gridstack/vue'
</script>
```

#### React
```tsx
import { GridStack, GridStackItem } from '@ldesign/gridstack/react'

function App() {
  return (
    <GridStack>
      <GridStackItem />
    </GridStack>
  )
}
```

### 🎯 TypeScript 支持

完整的类型定义，提供：
- 智能代码补全
- 类型检查
- API 文档
- 更好的开发体验

### 📦 模块化

- 支持 ES Module 和 CommonJS
- 支持 Tree-shaking
- 按需引入
- 减小打包体积

## 工作原理

@ldesign/gridstack 在 gridstack.js 的基础上提供了一层抽象：

1. **核心层 (Core)**: 封装 gridstack.js 的基础功能，提供统一的 API
2. **适配器层 (Adapters)**: 针对不同框架的适配实现
3. **类型层 (Types)**: 完整的 TypeScript 类型定义

```
┌─────────────────────────────────────┐
│         Framework Layer             │
│  (Vue / React / Vanilla)           │
├─────────────────────────────────────┤
│         Adapter Layer               │
│  (Component / Hook / Manager)      │
├─────────────────────────────────────┤
│          Core Layer                 │
│  (GridStackCore + Utils)           │
├─────────────────────────────────────┤
│         GridStack.js                │
└─────────────────────────────────────┘
```

## 使用场景

@ldesign/gridstack 适用于以下场景：

- 📊 **仪表盘**: 创建可自定义的数据仪表盘
- 📱 **移动端布局**: 响应式网格布局
- 🎨 **可视化编辑器**: 拖拽式页面构建器
- 📐 **自定义布局**: 用户可定制的界面布局
- 🔧 **工作台**: 可配置的工作环境

## 下一步

- [快速开始](/guide/getting-started) - 5 分钟内创建你的第一个网格
- [Vanilla JS 指南](/guide/vanilla) - 原生 JavaScript 使用方式
- [Vue 指南](/guide/vue) - Vue 3 使用方式
- [React 指南](/guide/react) - React 使用方式
- [API 参考](/api/core) - 完整的 API 文档
