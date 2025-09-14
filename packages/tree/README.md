# @ldesign/tree

一个功能完整的树形选择组件插件，支持多框架、响应式设计和丰富的交互功能。

## ✨ 特性

### 基础功能
- 🎯 **响应式设计** - 兼容PC端、平板和手机端
- 🔄 **多选择模式** - 支持单选、多选、复选框、单选框
- 🌳 **无限层级** - 支持无限层级的树形结构
- ✨ **平滑动画** - 实现平滑的展开/收起动画效果

### 核心功能
- 🎪 **拖拽功能** - 支持节点间的拖拽排序和层级调整
- 🔍 **搜索过滤** - 节点搜索和过滤功能
- ⚡ **节点操作** - 节点的增删改操作
- 🚀 **异步加载** - 支持异步加载子节点
- 🎨 **图标自定义** - 支持节点图标自定义
- 🚫 **禁用状态** - 支持节点禁用状态
- 📊 **虚拟滚动** - 处理大数据量场景

### 技术特性
- 🔧 **TypeScript** - 完整的类型定义
- 🎭 **多框架支持** - Vue、React、Angular等主流框架
- 🌐 **原生JavaScript** - 提供框架无关版本
- 🎨 **主题定制** - 支持主题定制和样式覆盖
- 🔌 **插件系统** - 提供插件扩展机制
- ♿ **无障碍访问** - 支持无障碍访问

## 📦 安装

```bash
# 使用 pnpm
pnpm add @ldesign/tree

# 使用 npm
npm install @ldesign/tree

# 使用 yarn
yarn add @ldesign/tree
```

## 🚀 快速开始

### 原生 JavaScript

```javascript
import { Tree } from '@ldesign/tree'
import '@ldesign/tree/style.css'

const tree = new Tree({
  container: '#tree-container',
  data: [
    {
      id: '1',
      label: '节点1',
      children: [
        { id: '1-1', label: '子节点1-1' },
        { id: '1-2', label: '子节点1-2' }
      ]
    }
  ]
})
```

### Vue 3

```vue
<template>
  <LTree
    :data="treeData"
    :options="treeOptions"
    @select="onSelect"
    @expand="onExpand"
  />
</template>

<script setup>
import { LTree } from '@ldesign/tree/vue'
import '@ldesign/tree/style.css'

const treeData = [
  {
    id: '1',
    label: '节点1',
    children: [
      { id: '1-1', label: '子节点1-1' },
      { id: '1-2', label: '子节点1-2' }
    ]
  }
]

const treeOptions = {
  selectable: true,
  draggable: true,
  searchable: true
}

const onSelect = (node) => {
  console.log('选中节点:', node)
}

const onExpand = (node) => {
  console.log('展开节点:', node)
}
</script>
```

### React

```jsx
import React from 'react'
import { Tree } from '@ldesign/tree/react'
import '@ldesign/tree/style.css'

const App = () => {
  const treeData = [
    {
      id: '1',
      label: '节点1',
      children: [
        { id: '1-1', label: '子节点1-1' },
        { id: '1-2', label: '子节点1-2' }
      ]
    }
  ]

  const handleSelect = (node) => {
    console.log('选中节点:', node)
  }

  return (
    <Tree
      data={treeData}
      selectable
      draggable
      searchable
      onSelect={handleSelect}
    />
  )
}

export default App
```

## 📖 API 文档

### TreeOptions 配置选项

```typescript
interface TreeOptions {
  // 数据配置
  data?: TreeNodeData[]

  // 选择配置
  selection?: {
    mode: 'single' | 'multiple' | 'cascade'
    showCheckbox?: boolean
    showRadio?: boolean
    disabled?: boolean
  }

  // 拖拽配置
  dragDrop?: {
    enabled?: boolean
    allowCrossLevel?: boolean
    allowReorder?: boolean
  }

  // 搜索配置
  search?: {
    enabled?: boolean
    placeholder?: string
    highlightMatches?: boolean
  }

  // 虚拟滚动配置
  virtualScroll?: {
    enabled?: boolean
    itemHeight?: number
    bufferSize?: number
  }

  // 样式配置
  style?: {
    theme?: 'default' | 'dark' | 'compact'
    className?: string
    showLines?: boolean
    showIcons?: boolean
  }

  // 异步加载配置
  async?: {
    loadChildren?: (node: TreeNodeData) => Promise<TreeNodeData[]>
    loadingText?: string
  }
}
```

### TreeNodeData 节点数据

```typescript
interface TreeNodeData {
  id: string
  label: string
  parentId?: string
  children?: TreeNodeData[]
  icon?: string
  disabled?: boolean
  expanded?: boolean
  selected?: boolean
  loading?: boolean
  data?: any
}
```

### Tree 实例方法

```typescript
class Tree {
  // 数据操作
  setData(data: TreeNodeData[]): void
  getData(): TreeNodeData[]
  addNode(node: TreeNodeData, parentId?: string): void
  removeNode(nodeId: string): void
  updateNode(nodeId: string, updates: Partial<TreeNodeData>): void

  // 选择操作
  selectNode(nodeId: string): void
  unselectNode(nodeId: string): void
  selectAll(): void
  unselectAll(): void
  getSelectedNodes(): string[]
  setSelectedNodes(nodeIds: string[]): void

  // 展开操作
  expandNode(nodeId: string): void
  collapseNode(nodeId: string): void
  expandAll(): void
  collapseAll(): void

  // 搜索操作
  search(query: string, options?: SearchOptions): void
  clearSearch(): void

  // 滚动操作
  scrollToNode(nodeId: string): void

  // 事件监听
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void

  // 销毁
  destroy(): void
}
```

### 事件系统

```typescript
// 选择事件
tree.on('select', (selectedIds: string[]) => {
  console.log('选中的节点:', selectedIds)
})

// 展开事件
tree.on('expand', (nodeId: string) => {
  console.log('展开节点:', nodeId)
})

// 收起事件
tree.on('collapse', (nodeId: string) => {
  console.log('收起节点:', nodeId)
})

// 拖拽事件
tree.on('dragStart', (nodeId: string) => {
  console.log('开始拖拽:', nodeId)
})

tree.on('drop', (dragNodeId: string, dropNodeId: string, position: 'before' | 'after' | 'inside') => {
  console.log('拖拽完成:', { dragNodeId, dropNodeId, position })
})

// 搜索事件
tree.on('search', (query: string, results: string[]) => {
  console.log('搜索结果:', { query, results })
})
```

## 🎨 主题定制

### 使用内置主题

```typescript
const tree = new Tree(container, {
  style: {
    theme: 'dark', // 'default' | 'dark' | 'compact'
  },
})
```

### 自定义CSS变量

```css
:root {
  --ldesign-tree-bg: #ffffff;
  --ldesign-tree-text: #333333;
  --ldesign-tree-border: #e5e5e5;
  --ldesign-tree-hover: #f5f5f5;
  --ldesign-tree-selected: #1890ff;
  --ldesign-tree-selected-bg: #e6f7ff;
}
```

### 自定义样式类

```css
.my-custom-tree {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.my-custom-tree .ldesign-tree-node {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.my-custom-tree .ldesign-tree-node:hover {
  background-color: #f8f9fa;
}
```

## 🔌 插件系统

### 使用内置插件

```typescript
import { Tree, ToolbarPlugin, ContextMenuPlugin } from '@ldesign/tree'

const tree = new Tree(container, options)

// 添加工具栏插件
tree.use(ToolbarPlugin, {
  position: 'top',
  tools: ['expand-all', 'collapse-all', 'search', 'refresh'],
})

// 添加右键菜单插件
tree.use(ContextMenuPlugin, {
  items: ['expand', 'collapse', 'select', 'copy', 'delete'],
})
```

### 创建自定义插件

```typescript
import { BasePlugin } from '@ldesign/tree'

class MyCustomPlugin extends BasePlugin {
  constructor(config) {
    super({
      name: 'my-custom-plugin',
      version: '1.0.0',
    }, config)
  }

  mounted() {
    // 插件挂载时的逻辑
    this.addButton()
  }

  addButton() {
    const button = this.createElement('button', {
      textContent: '自定义按钮',
      onclick: () => this.handleClick(),
    })

    this.context.container.appendChild(button)
  }

  handleClick() {
    // 按钮点击逻辑
    this.context.tree.selectAll()
  }
}

// 使用自定义插件
tree.use(MyCustomPlugin, {
  // 插件配置
})
```

## 📚 文档

详细文档请访问：[https://ldesign.github.io/tree](https://ldesign.github.io/tree)

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

[MIT](./LICENSE) © ldesign
