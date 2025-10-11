# 快速开始

本指南将帮助你在 5 分钟内开始使用 @ldesign/gridstack。

## 安装

使用你喜欢的包管理器安装：

::: code-group
```bash [npm]
npm install @ldesign/gridstack gridstack
```

```bash [yarn]
yarn add @ldesign/gridstack gridstack
```

```bash [pnpm]
pnpm add @ldesign/gridstack gridstack
```
:::

::: tip
gridstack 是 peer dependency，需要同时安装。
:::

## Vanilla JavaScript / TypeScript

### 基础用法

```typescript
import { GridStackManager } from '@ldesign/gridstack/vanilla'
import '@ldesign/gridstack/styles'
import 'gridstack/dist/gridstack.min.css'

// 创建网格实例
const grid = new GridStackManager('#grid', {
  column: 12,
  cellHeight: 70,
  animate: true
})

// 添加网格项
grid.addWidget({
  x: 0,
  y: 0,
  w: 4,
  h: 2,
  content: '<div>我的第一个网格项</div>'
})
```

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>GridStack Demo</title>
</head>
<body>
  <div id="grid" class="grid-stack"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

## Vue 3

### 组件用法

```vue
<template>
  <GridStack :column="12" :cell-height="70" :animate="true">
    <GridStackItem
      v-for="item in items"
      :key="item.id"
      v-bind="item"
    >
      <div class="widget-content">
        {{ item.content }}
      </div>
    </GridStackItem>
  </GridStack>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GridStack, GridStackItem } from '@ldesign/gridstack/vue'
import '@ldesign/gridstack/styles'
import 'gridstack/dist/gridstack.min.css'

const items = ref([
  { id: 1, x: 0, y: 0, w: 4, h: 2, content: '网格项 1' },
  { id: 2, x: 4, y: 0, w: 4, h: 2, content: '网格项 2' }
])
</script>
```

### Hook 用法

```vue
<template>
  <div ref="gridRef" class="grid-stack">
    <!-- 你的网格项 -->
  </div>
</template>

<script setup lang="ts">
import { useGridStack } from '@ldesign/gridstack/vue'
import '@ldesign/gridstack/styles'
import 'gridstack/dist/gridstack.min.css'

const { gridRef, addWidget, isReady } = useGridStack({
  column: 12,
  cellHeight: 70
})

// 添加网格项
function handleAdd() {
  addWidget({
    w: 4,
    h: 2,
    content: '<div>新网格项</div>'
  })
}
</script>
```

## React

### 组件用法

```tsx
import { GridStack, GridStackItem } from '@ldesign/gridstack/react'
import '@ldesign/gridstack/styles'
import 'gridstack/dist/gridstack.min.css'

function App() {
  const [items, setItems] = useState([
    { id: '1', x: 0, y: 0, w: 4, h: 2, content: '网格项 1' },
    { id: '2', x: 4, y: 0, w: 4, h: 2, content: '网格项 2' }
  ])

  return (
    <GridStack column={12} cellHeight={70} animate={true}>
      {items.map(item => (
        <GridStackItem key={item.id} {...item}>
          <div className="widget-content">
            {item.content}
          </div>
        </GridStackItem>
      ))}
    </GridStack>
  )
}
```

### Hook 用法

```tsx
import { useGridStack } from '@ldesign/gridstack/react'
import '@ldesign/gridstack/styles'
import 'gridstack/dist/gridstack.min.css'

function App() {
  const { gridRef, addWidget, isReady } = useGridStack({
    column: 12,
    cellHeight: 70
  })

  const handleAdd = () => {
    addWidget({
      w: 4,
      h: 2,
      content: '<div>新网格项</div>'
    })
  }

  return (
    <div>
      <button onClick={handleAdd} disabled={!isReady}>
        添加网格项
      </button>
      <div ref={gridRef} className="grid-stack">
        {/* 你的网格项 */}
      </div>
    </div>
  )
}
```

## 样式引入

@ldesign/gridstack 需要引入两个样式文件：

```typescript
// GridStack 核心样式（必需）
import 'gridstack/dist/gridstack.min.css'

// 我们的自定义样式（可选）
import '@ldesign/gridstack/styles'
```

你也可以通过 CDN 引入：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gridstack@latest/dist/gridstack.min.css" />
```

## 基础配置

以下是一些常用的配置选项：

```typescript
{
  column: 12,           // 列数
  cellHeight: 70,       // 单元格高度(px)
  animate: true,        // 启用动画
  float: false,         // 浮动模式
  margin: 5,            // 网格项间距
  disableDrag: false,   // 禁用拖拽
  disableResize: false, // 禁用调整大小
  staticGrid: false     // 静态模式
}
```

完整的配置选项请查看 [配置选项](/guide/options)。

## 下一步

现在你已经创建了第一个网格，接下来可以：

- 了解更多 [配置选项](/guide/options)
- 探索 [事件系统](/guide/events)
- 查看 [高级功能](/guide/advanced)
- 浏览 [完整示例](/examples/vanilla)
- 阅读 [API 文档](/api/core)
