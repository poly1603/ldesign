# API 概览

@ldesign/tree 提供了丰富的API接口，支持各种复杂的业务场景。

## 核心类

### Tree

主要的树形组件类，提供完整的树形功能。

```typescript
import Tree from '@ldesign/tree'

const tree = new Tree(container, options)
```

## 类型定义

### TreeOptions

树形组件的配置选项。

```typescript
interface TreeOptions {
  data?: TreeNodeData[]
  selection?: SelectionOptions
  dragDrop?: DragDropOptions
  search?: SearchOptions
  virtualScroll?: VirtualScrollOptions
  style?: StyleOptions
  async?: AsyncOptions
}
```

### TreeNodeData

树形节点的数据结构。

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

## 主要方法

### 数据操作

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `setData` | 设置树形数据 | `data: TreeNodeData[]` | `void` |
| `getData` | 获取树形数据 | - | `TreeNodeData[]` |
| `addNode` | 添加节点 | `node: TreeNodeData, parentId?: string` | `void` |
| `removeNode` | 删除节点 | `nodeId: string` | `void` |
| `updateNode` | 更新节点 | `nodeId: string, updates: Partial<TreeNodeData>` | `void` |
| `getNode` | 获取节点 | `nodeId: string` | `TreeNodeData \| null` |
| `getAllNodes` | 获取所有节点 | - | `TreeNodeData[]` |

### 选择操作

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `selectNode` | 选中节点 | `nodeId: string` | `void` |
| `unselectNode` | 取消选中节点 | `nodeId: string` | `void` |
| `selectAll` | 全选 | - | `void` |
| `unselectAll` | 取消全选 | - | `void` |
| `getSelectedNodes` | 获取选中节点 | - | `string[]` |
| `setSelectedNodes` | 设置选中节点 | `nodeIds: string[]` | `void` |
| `isNodeSelected` | 检查节点是否选中 | `nodeId: string` | `boolean` |

### 展开操作

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `expandNode` | 展开节点 | `nodeId: string` | `void` |
| `collapseNode` | 收起节点 | `nodeId: string` | `void` |
| `expandAll` | 展开全部 | - | `void` |
| `collapseAll` | 收起全部 | - | `void` |
| `isNodeExpanded` | 检查节点是否展开 | `nodeId: string` | `boolean` |

### 搜索操作

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `search` | 搜索节点 | `query: string, options?: SearchOptions` | `void` |
| `clearSearch` | 清除搜索 | - | `void` |
| `getSearchResults` | 获取搜索结果 | - | `string[]` |

### 滚动操作

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `scrollToNode` | 滚动到节点 | `nodeId: string` | `void` |
| `scrollToTop` | 滚动到顶部 | - | `void` |
| `scrollToBottom` | 滚动到底部 | - | `void` |

### 事件系统

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `on` | 监听事件 | `event: string, handler: Function` | `void` |
| `off` | 取消监听 | `event: string, handler: Function` | `void` |
| `emit` | 触发事件 | `event: string, ...args: any[]` | `void` |

### 生命周期

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `destroy` | 销毁实例 | - | `void` |
| `refresh` | 刷新组件 | - | `void` |

## 事件列表

### 数据事件

| 事件名 | 描述 | 参数 |
|--------|------|------|
| `dataChange` | 数据变化 | `data: TreeNodeData[]` |
| `nodeAdd` | 节点添加 | `node: TreeNodeData` |
| `nodeRemove` | 节点删除 | `nodeId: string` |
| `nodeUpdate` | 节点更新 | `nodeId: string, updates: Partial<TreeNodeData>` |

### 选择事件

| 事件名 | 描述 | 参数 |
|--------|------|------|
| `select` | 选择变化 | `selectedIds: string[]` |
| `nodeSelect` | 节点选中 | `nodeId: string` |
| `nodeUnselect` | 节点取消选中 | `nodeId: string` |

### 展开事件

| 事件名 | 描述 | 参数 |
|--------|------|------|
| `expand` | 节点展开 | `nodeId: string` |
| `collapse` | 节点收起 | `nodeId: string` |

### 拖拽事件

| 事件名 | 描述 | 参数 |
|--------|------|------|
| `dragStart` | 开始拖拽 | `nodeId: string` |
| `dragEnd` | 结束拖拽 | `nodeId: string` |
| `drop` | 拖拽完成 | `dragNodeId: string, dropNodeId: string, position: string` |

### 搜索事件

| 事件名 | 描述 | 参数 |
|--------|------|------|
| `search` | 搜索执行 | `query: string, results: string[]` |
| `searchClear` | 搜索清除 | - |

### 异步事件

| 事件名 | 描述 | 参数 |
|--------|------|------|
| `loadStart` | 开始加载 | `nodeId: string` |
| `loadEnd` | 加载完成 | `nodeId: string, children: TreeNodeData[]` |
| `loadError` | 加载错误 | `nodeId: string, error: Error` |

## 配置选项详解

### SelectionOptions

```typescript
interface SelectionOptions {
  mode: 'single' | 'multiple' | 'cascade'
  showCheckbox?: boolean
  showRadio?: boolean
  disabled?: boolean
  allowParentSelection?: boolean
}
```

### DragDropOptions

```typescript
interface DragDropOptions {
  enabled?: boolean
  allowCrossLevel?: boolean
  allowReorder?: boolean
  allowDropOnLeaf?: boolean
  dragHandle?: string
}
```

### SearchOptions

```typescript
interface SearchOptions {
  enabled?: boolean
  placeholder?: string
  highlightMatches?: boolean
  mode?: 'text' | 'regex' | 'fuzzy'
  caseSensitive?: boolean
}
```

### VirtualScrollOptions

```typescript
interface VirtualScrollOptions {
  enabled?: boolean
  itemHeight?: number
  bufferSize?: number
  threshold?: number
}
```

### StyleOptions

```typescript
interface StyleOptions {
  theme?: 'default' | 'dark' | 'compact'
  className?: string
  showLines?: boolean
  showIcons?: boolean
  indent?: number
}
```

### AsyncOptions

```typescript
interface AsyncOptions {
  loadChildren?: (node: TreeNodeData) => Promise<TreeNodeData[]>
  loadingText?: string
  errorText?: string
  retryCount?: number
}
```

## 插件系统

### 使用插件

```typescript
import { Tree, ToolbarPlugin } from '@ldesign/tree'

const tree = new Tree(container, options)
tree.use(ToolbarPlugin, {
  position: 'top',
  tools: ['expand-all', 'collapse-all'],
})
```

### 插件接口

```typescript
interface Plugin {
  name: string
  version: string
  install(tree: Tree, options?: any): void
  uninstall?(tree: Tree): void
}
```

## 下一步

- [Tree 类详细文档](./tree) - 深入了解Tree类的所有方法
- [配置选项](./options) - 查看所有配置选项的详细说明
- [事件系统](./events) - 了解完整的事件系统
- [插件开发](./plugins) - 学习如何开发自定义插件
