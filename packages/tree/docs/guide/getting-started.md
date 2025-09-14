# 快速开始

本指南将帮助你在5分钟内创建第一个树形组件。

## 基础示例

### 1. 创建容器

首先在HTML中创建一个容器元素：

```html
<div id="tree-container"></div>
```

### 2. 引入库和样式

```typescript
import Tree from '@ldesign/tree'
import '@ldesign/tree/style.css'
```

### 3. 准备数据

```typescript
const treeData = [
  {
    id: '1',
    label: '根节点1',
    children: [
      {
        id: '1-1',
        label: '子节点1-1',
        children: [
          { id: '1-1-1', label: '叶子节点1-1-1' },
          { id: '1-1-2', label: '叶子节点1-1-2' },
        ],
      },
      { id: '1-2', label: '子节点1-2' },
    ],
  },
  {
    id: '2',
    label: '根节点2',
    children: [
      { id: '2-1', label: '子节点2-1' },
      { id: '2-2', label: '子节点2-2' },
    ],
  },
]
```

### 4. 创建树实例

```typescript
const tree = new Tree(document.getElementById('tree-container'), {
  data: treeData,
})
```

## 添加选择功能

### 多选模式

```typescript
const tree = new Tree(container, {
  data: treeData,
  selection: {
    mode: 'multiple',
    showCheckbox: true,
  },
})

// 监听选择事件
tree.on('select', (selectedIds) => {
  console.log('选中的节点:', selectedIds)
})
```

### 单选模式

```typescript
const tree = new Tree(container, {
  data: treeData,
  selection: {
    mode: 'single',
    showRadio: true,
  },
})
```

### 级联选择

```typescript
const tree = new Tree(container, {
  data: treeData,
  selection: {
    mode: 'cascade',
    showCheckbox: true,
  },
})
```

## 添加搜索功能

```typescript
const tree = new Tree(container, {
  data: treeData,
  search: {
    enabled: true,
    placeholder: '搜索节点...',
    highlightMatches: true,
  },
})

// 程序化搜索
tree.search('节点1')

// 清除搜索
tree.clearSearch()
```

## 添加拖拽功能

```typescript
const tree = new Tree(container, {
  data: treeData,
  dragDrop: {
    enabled: true,
    allowCrossLevel: true,
    allowReorder: true,
  },
})

// 监听拖拽事件
tree.on('drop', (dragNodeId, dropNodeId, position) => {
  console.log('拖拽完成:', { dragNodeId, dropNodeId, position })
})
```

## 异步加载数据

```typescript
const tree = new Tree(container, {
  data: [
    {
      id: '1',
      label: '根节点',
      children: [], // 空数组表示有子节点但未加载
    },
  ],
  async: {
    loadChildren: async (node) => {
      // 模拟API调用
      const response = await fetch(`/api/nodes/${node.id}/children`)
      return response.json()
    },
    loadingText: '加载中...',
  },
})
```

## 启用虚拟滚动

```typescript
const tree = new Tree(container, {
  data: largeDataSet, // 大量数据
  virtualScroll: {
    enabled: true,
    itemHeight: 32,
    bufferSize: 10,
  },
})
```

## 自定义样式

### 使用内置主题

```typescript
const tree = new Tree(container, {
  data: treeData,
  style: {
    theme: 'dark', // 'default' | 'dark' | 'compact'
    showLines: true,
    showIcons: true,
  },
})
```

### 自定义CSS类

```typescript
const tree = new Tree(container, {
  data: treeData,
  style: {
    className: 'my-custom-tree',
  },
})
```

```css
.my-custom-tree {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.my-custom-tree .ldesign-tree-node {
  padding: 12px;
}

.my-custom-tree .ldesign-tree-node:hover {
  background-color: #f8f9fa;
}
```

## 事件处理

```typescript
const tree = new Tree(container, { data: treeData })

// 选择事件
tree.on('select', (selectedIds) => {
  console.log('选中:', selectedIds)
})

// 展开事件
tree.on('expand', (nodeId) => {
  console.log('展开:', nodeId)
})

// 收起事件
tree.on('collapse', (nodeId) => {
  console.log('收起:', nodeId)
})

// 拖拽事件
tree.on('dragStart', (nodeId) => {
  console.log('开始拖拽:', nodeId)
})

tree.on('drop', (dragNodeId, dropNodeId, position) => {
  console.log('拖拽完成:', { dragNodeId, dropNodeId, position })
})

// 搜索事件
tree.on('search', (query, results) => {
  console.log('搜索:', { query, results })
})
```

## 常用方法

```typescript
// 数据操作
tree.setData(newData)
tree.addNode({ id: 'new', label: '新节点' })
tree.removeNode('nodeId')
tree.updateNode('nodeId', { label: '更新的标签' })

// 选择操作
tree.selectNode('nodeId')
tree.unselectNode('nodeId')
tree.selectAll()
tree.unselectAll()
const selected = tree.getSelectedNodes()

// 展开操作
tree.expandNode('nodeId')
tree.collapseNode('nodeId')
tree.expandAll()
tree.collapseAll()

// 滚动操作
tree.scrollToNode('nodeId')

// 搜索操作
tree.search('关键词')
tree.clearSearch()
```

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>Tree 示例</title>
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/tree@latest/dist/style.css">
  <style>
    #tree-container {
      width: 400px;
      height: 500px;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 16px;
    }
    
    .controls {
      margin-bottom: 16px;
    }
    
    .controls button {
      margin-right: 8px;
      padding: 8px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    }
    
    .controls button:hover {
      background: #f5f5f5;
    }
  </style>
</head>
<body>
  <div class="controls">
    <button onclick="expandAll()">展开全部</button>
    <button onclick="collapseAll()">收起全部</button>
    <button onclick="selectAll()">全选</button>
    <button onclick="unselectAll()">取消全选</button>
  </div>
  
  <div id="tree-container"></div>
  
  <script src="https://unpkg.com/@ldesign/tree@latest/dist/index.umd.js"></script>
  <script>
    const treeData = [
      {
        id: '1',
        label: '根节点1',
        children: [
          {
            id: '1-1',
            label: '子节点1-1',
            children: [
              { id: '1-1-1', label: '叶子节点1-1-1' },
              { id: '1-1-2', label: '叶子节点1-1-2' },
            ],
          },
          { id: '1-2', label: '子节点1-2' },
        ],
      },
      {
        id: '2',
        label: '根节点2',
        children: [
          { id: '2-1', label: '子节点2-1' },
          { id: '2-2', label: '子节点2-2' },
        ],
      },
    ]
    
    const tree = new LDesignTree.Tree(document.getElementById('tree-container'), {
      data: treeData,
      selection: {
        mode: 'multiple',
        showCheckbox: true,
      },
      search: {
        enabled: true,
        placeholder: '搜索节点...',
      },
      dragDrop: {
        enabled: true,
      },
    })
    
    // 事件监听
    tree.on('select', (selectedIds) => {
      console.log('选中的节点:', selectedIds)
    })
    
    tree.on('expand', (nodeId) => {
      console.log('展开节点:', nodeId)
    })
    
    // 控制函数
    function expandAll() {
      tree.expandAll()
    }
    
    function collapseAll() {
      tree.collapseAll()
    }
    
    function selectAll() {
      tree.selectAll()
    }
    
    function unselectAll() {
      tree.unselectAll()
    }
  </script>
</body>
</html>
```

## 下一步

现在你已经掌握了基础用法，可以继续学习：

- [数据结构](./data-structure) - 深入了解树形数据的组织方式
- [选择模式](./selection) - 掌握各种选择模式的使用
- [API文档](../api/) - 查看完整的API参考
- [示例代码](../examples/) - 更多实际应用示例
