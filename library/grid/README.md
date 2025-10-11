# @ldesign/gridstack

一个基于 [gridstack.js](https://gridstackjs.com/) 封装的强大网格布局库，支持 Vanilla JS、Vue 3 和 React。

## ✨ 特性

- 🚀 **易用性**: 简洁的 API 设计，开箱即用
- 🎨 **配置丰富**: 支持 gridstack 所有配置选项
- ⚡️ **高性能**: 优化的性能和内存管理
- 🔧 **多框架支持**: 原生 JS、Vue 3、React
- 🎯 **TypeScript**: 完整的类型定义
- 📦 **Tree-shaking**: 按需引入，减小打包体积
- 🎪 **多种用法**: 组件式和 Hooks 式使用

## 📦 安装

```bash
npm install @ldesign/gridstack
# or
yarn add @ldesign/gridstack
# or
pnpm add @ldesign/gridstack
```

## 🚀 快速开始

### Vanilla JS / TypeScript

```typescript
import { GridStackManager } from '@ldesign/gridstack/vanilla'
import '@ldesign/gridstack/styles'

const grid = new GridStackManager('#grid', {
  column: 12,
  cellHeight: 70,
  animate: true
})

grid.addWidget({
  x: 0, y: 0,
  w: 4, h: 2,
  content: '<div>Widget 1</div>'
})
```

### Vue 3

**组件式用法:**

```vue
<template>
  <GridStack :options="gridOptions">
    <GridStackItem v-for="item in items" :key="item.id" v-bind="item">
      <div>{{ item.content }}</div>
    </GridStackItem>
  </GridStack>
</template>

<script setup lang="ts">
import { GridStack, GridStackItem } from '@ldesign/gridstack/vue'
import '@ldesign/gridstack/styles'

const gridOptions = {
  column: 12,
  cellHeight: 70
}

const items = [
  { id: 1, x: 0, y: 0, w: 4, h: 2, content: 'Widget 1' },
  { id: 2, x: 4, y: 0, w: 4, h: 2, content: 'Widget 2' }
]
</script>
```

**Hooks 用法:**

```vue
<template>
  <div ref="gridRef">
    <div v-for="item in items" :key="item.id">
      {{ item.content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGridStack } from '@ldesign/gridstack/vue'

const { gridRef, addWidget, removeWidget } = useGridStack({
  column: 12,
  cellHeight: 70
})
</script>
```

### React

**组件式用法:**

```tsx
import { GridStack, GridStackItem } from '@ldesign/gridstack/react'
import '@ldesign/gridstack/styles'

function App() {
  const items = [
    { id: '1', x: 0, y: 0, w: 4, h: 2, content: 'Widget 1' },
    { id: '2', x: 4, y: 0, w: 4, h: 2, content: 'Widget 2' }
  ]

  return (
    <GridStack column={12} cellHeight={70}>
      {items.map(item => (
        <GridStackItem key={item.id} {...item}>
          <div>{item.content}</div>
        </GridStackItem>
      ))}
    </GridStack>
  )
}
```

**Hooks 用法:**

```tsx
import { useGridStack } from '@ldesign/gridstack/react'

function App() {
  const { gridRef, addWidget, removeWidget } = useGridStack({
    column: 12,
    cellHeight: 70
  })

  return <div ref={gridRef}>{/* widgets */}</div>
}
```

## 📚 文档

完整文档请访问: [文档站点](./docs)

- [快速开始](./docs/guide/getting-started.md)
- [Vanilla JS 用法](./docs/guide/vanilla.md)
- [Vue 用法](./docs/guide/vue.md)
- [React 用法](./docs/guide/react.md)
- [API 参考](./docs/api/index.md)
- [示例](./examples)

## 🎯 示例

查看 [examples](./examples) 目录获取完整示例:

- [Vanilla TypeScript 示例](./examples/vanilla-demo)
- [Vue 3 示例](./examples/vue-demo)
- [React 示例](./examples/react-demo)

## 🤝 贡献

欢迎贡献! 请查看我们的贡献指南。

## 📄 License

MIT License © 2024 LDesign
