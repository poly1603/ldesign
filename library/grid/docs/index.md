---
layout: home

hero:
  name: "@ldesign/gridstack"
  text: "强大的网格布局库"
  tagline: 支持 Vanilla JS、Vue 3 和 React 的响应式拖拽网格系统
  actions:
    - theme: brand
      text: 快速开��
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/vanilla
  image:
    src: /logo.svg
    alt: GridStack

features:
  - icon: 🚀
    title: 易于使用
    details: 简洁的 API 设计，开箱即用，快速集成到你的项目中
  - icon: 🎨
    title: 配置丰富
    details: 支持 GridStack 所有配置选项，满足各种复杂场景需求
  - icon: ⚡️
    title: 高性能
    details: 优化的性能和内存管理，确保大量网格项也能流畅运行
  - icon: 🔧
    title: 多框架支持
    details: 原生支持 Vanilla JS、Vue 3 和 React，适配你的技术栈
  - icon: 🎯
    title: TypeScript
    details: 完整的类型定义，提供出色的开发体验和类型安全
  - icon: 📦
    title: Tree-shaking
    details: 支持按需引入，减小打包体积，提升加载速度
  - icon: 🎪
    title: 多种用法
    details: 组件式和 Hooks 式两种���用方式，灵活满足不同需求
  - icon: ��
    title: 响应式
    details: 内置响应式支持，自动适配不同屏幕尺寸
---

## 快速开始

### 安装

::: code-group
```bash [npm]
npm install @ldesign/gridstack
```

```bash [yarn]
yarn add @ldesign/gridstack
```

```bash [pnpm]
pnpm add @ldesign/gridstack
```
:::

### Vanilla JS

```typescript
import { GridStackManager } from '@ldesign/gridstack/vanilla'
import '@ldesign/gridstack/styles'

const grid = new GridStackManager('#grid', {
  column: 12,
  cellHeight: 70
})

grid.addWidget({ x: 0, y: 0, w: 4, h: 2, content: 'Widget 1' })
```

### Vue 3

```vue
<template>
  <GridStack :column="12" :cell-height="70">
    <GridStackItem v-for="item in items" :key="item.id" v-bind="item">
      {{ item.content }}
    </GridStackItem>
  </GridStack>
</template>

<script setup>
import { GridStack, GridStackItem } from '@ldesign/gridstack/vue'
import '@ldesign/gridstack/styles'

const items = [
  { id: 1, x: 0, y: 0, w: 4, h: 2, content: 'Widget 1' }
]
</script>
```

### React

```tsx
import { GridStack, GridStackItem } from '@ldesign/gridstack/react'
import '@ldesign/gridstack/styles'

function App() {
  return (
    <GridStack column={12} cellHeight={70}>
      <GridStackItem x={0} y={0} w={4} h={2}>
        Widget 1
      </GridStackItem>
    </GridStack>
  )
}
```

## 为什么选择 @ldesign/gridstack?

- **简单**: 提供统一、简洁的 API，降低学习成本
- **强大**: 基于成熟的 gridstack.js，功能完善且稳定
- **现代**: 使用 TypeScript 编写，提供完整的类型支持
- **灵活**: 支持多种使用方式，适配不同的开发习惯
- **文档**: 详细的文档和丰富的示例，快速上手

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 许可证

[MIT License](https://opensource.org/licenses/MIT)
