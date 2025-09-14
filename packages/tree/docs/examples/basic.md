# 基础示例

本页面展示了 @ldesign/tree 的基础用法和常见场景。

## 简单树形结构

最基础的树形展示，只需要提供数据即可。

::: code-group

```typescript [JavaScript]
import Tree from '@ldesign/tree'
import '@ldesign/tree/style.css'

const tree = new Tree(document.getElementById('tree'), {
  data: [
    {
      id: '1',
      label: '根节点1',
      children: [
        { id: '1-1', label: '子节点1-1' },
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
  ],
})
```

```vue [Vue]
<template>
  <LDesignTree :data="treeData" />
</template>

<script setup>
import { LDesignTree } from '@ldesign/tree/vue'

const treeData = [
  {
    id: '1',
    label: '根节点1',
    children: [
      { id: '1-1', label: '子节点1-1' },
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
</script>
```

```tsx [React]
import React from 'react'
import { LDesignTree } from '@ldesign/tree/react'

const BasicExample = () => {
  const treeData = [
    {
      id: '1',
      label: '根节点1',
      children: [
        { id: '1-1', label: '子节点1-1' },
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

  return <LDesignTree data={treeData} />
}
```

:::

## 带图标的树

为节点添加图标，增强视觉效果。

```typescript
const treeWithIcons = new Tree(container, {
  data: [
    {
      id: 'folder1',
      label: '文档',
      icon: '📁',
      children: [
        { id: 'file1', label: '报告.pdf', icon: '📄' },
        { id: 'file2', label: '图片.jpg', icon: '🖼️' },
      ],
    },
    {
      id: 'folder2',
      label: '项目',
      icon: '📁',
      children: [
        { id: 'project1', label: 'Website', icon: '🌐' },
        { id: 'project2', label: 'Mobile App', icon: '📱' },
      ],
    },
  ],
  style: {
    showIcons: true,
  },
})
```

## 可选择的树

启用节点选择功能，支持单选和多选。

### 单选模式

```typescript
const singleSelectTree = new Tree(container, {
  data: treeData,
  selection: {
    mode: 'single',
    showRadio: true,
  },
})

// 监听选择事件
singleSelectTree.on('select', (selectedIds) => {
  console.log('选中的节点:', selectedIds[0])
})
```

### 多选模式

```typescript
const multiSelectTree = new Tree(container, {
  data: treeData,
  selection: {
    mode: 'multiple',
    showCheckbox: true,
  },
})

// 监听选择事件
multiSelectTree.on('select', (selectedIds) => {
  console.log('选中的节点:', selectedIds)
})
```

### 级联选择

```typescript
const cascadeSelectTree = new Tree(container, {
  data: treeData,
  selection: {
    mode: 'cascade',
    showCheckbox: true,
  },
})
```

## 禁用节点

某些节点可以设置为禁用状态。

```typescript
const treeWithDisabled = new Tree(container, {
  data: [
    {
      id: '1',
      label: '正常节点',
      children: [
        { id: '1-1', label: '子节点1-1' },
        { id: '1-2', label: '禁用节点', disabled: true },
      ],
    },
    {
      id: '2',
      label: '禁用的父节点',
      disabled: true,
      children: [
        { id: '2-1', label: '子节点2-1' },
        { id: '2-2', label: '子节点2-2' },
      ],
    },
  ],
  selection: {
    mode: 'multiple',
    showCheckbox: true,
  },
})
```

## 默认展开状态

控制节点的初始展开状态。

```typescript
const expandedTree = new Tree(container, {
  data: [
    {
      id: '1',
      label: '默认展开的节点',
      expanded: true,
      children: [
        { id: '1-1', label: '子节点1-1' },
        { id: '1-2', label: '子节点1-2' },
      ],
    },
    {
      id: '2',
      label: '默认收起的节点',
      expanded: false,
      children: [
        { id: '2-1', label: '子节点2-1' },
        { id: '2-2', label: '子节点2-2' },
      ],
    },
  ],
})
```

## 自定义样式

### 使用内置主题

```typescript
// 深色主题
const darkTree = new Tree(container, {
  data: treeData,
  style: {
    theme: 'dark',
    showLines: true,
  },
})

// 紧凑主题
const compactTree = new Tree(container, {
  data: treeData,
  style: {
    theme: 'compact',
    showLines: false,
  },
})
```

### 自定义CSS类

```typescript
const customTree = new Tree(container, {
  data: treeData,
  style: {
    className: 'my-custom-tree',
    showLines: true,
    indent: 24,
  },
})
```

```css
.my-custom-tree {
  border: 2px solid #1890ff;
  border-radius: 8px;
  background: #f8f9fa;
}

.my-custom-tree .ldesign-tree-node {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
}

.my-custom-tree .ldesign-tree-node:hover {
  background: #e3f2fd;
}

.my-custom-tree .ldesign-tree-node.selected {
  background: #1890ff;
  color: white;
}
```

## 事件处理

监听各种树形组件事件。

```typescript
const tree = new Tree(container, {
  data: treeData,
  selection: {
    mode: 'multiple',
    showCheckbox: true,
  },
})

// 选择事件
tree.on('select', (selectedIds) => {
  console.log('选中的节点:', selectedIds)
  updateSelectedInfo(selectedIds)
})

// 展开事件
tree.on('expand', (nodeId) => {
  console.log('展开节点:', nodeId)
})

// 收起事件
tree.on('collapse', (nodeId) => {
  console.log('收起节点:', nodeId)
})

// 节点点击事件
tree.on('nodeClick', (nodeId, node) => {
  console.log('点击节点:', nodeId, node)
})

function updateSelectedInfo(selectedIds) {
  const infoElement = document.getElementById('selected-info')
  infoElement.textContent = `已选择 ${selectedIds.length} 个节点`
}
```

## 动态操作

运行时动态修改树形数据。

```typescript
const tree = new Tree(container, { data: treeData })

// 添加节点
function addNode() {
  const newNode = {
    id: `new-${Date.now()}`,
    label: '新节点',
  }
  tree.addNode(newNode, '1') // 添加到节点1下
}

// 删除节点
function removeNode(nodeId) {
  tree.removeNode(nodeId)
}

// 更新节点
function updateNode(nodeId, newLabel) {
  tree.updateNode(nodeId, { label: newLabel })
}

// 设置新数据
function setNewData() {
  const newData = [
    {
      id: 'new1',
      label: '新的根节点',
      children: [
        { id: 'new1-1', label: '新的子节点' },
      ],
    },
  ]
  tree.setData(newData)
}
```

## 完整示例

一个包含多种功能的完整示例。

```html
<!DOCTYPE html>
<html>
<head>
  <title>Tree 基础示例</title>
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/tree@latest/dist/style.css">
  <style>
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .controls {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .controls button {
      padding: 8px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    }
    
    .controls button:hover {
      background: #f5f5f5;
    }
    
    .tree-container {
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      height: 400px;
      overflow: auto;
    }
    
    .info {
      margin-top: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Tree 基础示例</h1>
    
    <div class="controls">
      <button onclick="expandAll()">展开全部</button>
      <button onclick="collapseAll()">收起全部</button>
      <button onclick="selectAll()">全选</button>
      <button onclick="unselectAll()">取消全选</button>
      <button onclick="addRandomNode()">添加节点</button>
      <button onclick="removeSelected()">删除选中</button>
    </div>
    
    <div class="tree-container" id="tree"></div>
    
    <div class="info">
      <div id="selected-info">未选择任何节点</div>
      <div id="expanded-info">展开状态信息</div>
    </div>
  </div>
  
  <script src="https://unpkg.com/@ldesign/tree@latest/dist/index.umd.js"></script>
  <script>
    const treeData = [
      {
        id: '1',
        label: '文档',
        icon: '📁',
        children: [
          { id: '1-1', label: '工作报告.pdf', icon: '📄' },
          { id: '1-2', label: '会议记录.docx', icon: '📝' },
          {
            id: '1-3',
            label: '图片',
            icon: '📁',
            children: [
              { id: '1-3-1', label: '截图1.png', icon: '🖼️' },
              { id: '1-3-2', label: '截图2.jpg', icon: '🖼️' },
            ],
          },
        ],
      },
      {
        id: '2',
        label: '项目',
        icon: '📁',
        children: [
          { id: '2-1', label: 'Website', icon: '🌐' },
          { id: '2-2', label: 'Mobile App', icon: '📱' },
          { id: '2-3', label: 'Desktop App', icon: '💻', disabled: true },
        ],
      },
    ]
    
    const tree = new LDesignTree.Tree(document.getElementById('tree'), {
      data: treeData,
      selection: {
        mode: 'multiple',
        showCheckbox: true,
      },
      style: {
        showIcons: true,
        showLines: true,
      },
    })
    
    // 事件监听
    tree.on('select', (selectedIds) => {
      document.getElementById('selected-info').textContent = 
        selectedIds.length > 0 
          ? `已选择 ${selectedIds.length} 个节点: ${selectedIds.join(', ')}`
          : '未选择任何节点'
    })
    
    tree.on('expand', (nodeId) => {
      updateExpandedInfo()
    })
    
    tree.on('collapse', (nodeId) => {
      updateExpandedInfo()
    })
    
    function updateExpandedInfo() {
      const allNodes = tree.getAllNodes()
      const expandedNodes = allNodes.filter(node => tree.isNodeExpanded(node.id))
      document.getElementById('expanded-info').textContent = 
        `已展开 ${expandedNodes.length} 个节点`
    }
    
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
    
    function addRandomNode() {
      const newNode = {
        id: `node-${Date.now()}`,
        label: `新节点 ${Date.now()}`,
        icon: '📄',
      }
      tree.addNode(newNode, '1')
    }
    
    function removeSelected() {
      const selected = tree.getSelectedNodes()
      selected.forEach(nodeId => {
        tree.removeNode(nodeId)
      })
    }
    
    // 初始化展开信息
    updateExpandedInfo()
  </script>
</body>
</html>
```

## 下一步

- [选择模式示例](./selection) - 了解各种选择模式的详细用法
- [拖拽排序示例](./drag-drop) - 学习拖拽功能的实现
- [搜索过滤示例](./search) - 掌握搜索功能的使用
- [异步加载示例](./async) - 了解异步数据加载
