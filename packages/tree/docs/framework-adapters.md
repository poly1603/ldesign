# 框架适配器使用指南

LDesign Tree 提供了多个框架适配器，让你可以在不同的前端框架中轻松使用树形组件。

## 支持的框架

- **原生 JavaScript** - 可在任何环境中使用
- **Vue 3** - 完整的 Vue 3 组件包装器
- **React** - 支持 React 18+ 的组件
- **Angular** - 支持 Angular 17+ 的组件

## 安装

```bash
npm install @ldesign/tree
```

## 原生 JavaScript

### 基础用法

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/@ldesign/tree/dist/styles/tree.css">
</head>
<body>
  <div id="tree-container"></div>
  
  <script src="node_modules/@ldesign/tree/dist/index.umd.js"></script>
  <script>
    const tree = LDesignTree.createTree({
      container: '#tree-container',
      data: [
        {
          id: '1',
          label: '根节点',
          children: [
            { id: '1-1', label: '子节点 1' },
            { id: '1-2', label: '子节点 2' }
          ]
        }
      ],
      onSelect: (selectedKeys) => {
        console.log('选中:', selectedKeys)
      }
    })
  </script>
</body>
</html>
```

### ES 模块

```javascript
import { createTree } from '@ldesign/tree/vanilla'

const tree = createTree({
  container: document.getElementById('tree'),
  data: treeData,
  options: {
    selection: { mode: 'multiple' },
    dragDrop: { enabled: true },
    search: { enabled: true }
  }
})
```

## Vue 3

### 安装插件

```javascript
import { createApp } from 'vue'
import { LDesignTreePlugin } from '@ldesign/tree/vue'
import '@ldesign/tree/style.css'

const app = createApp(App)
app.use(LDesignTreePlugin)
```

### 组件使用

```vue
<template>
  <LDesignTree
    :data="treeData"
    v-model:selectedKeys="selectedKeys"
    v-model:expandedKeys="expandedKeys"
    selectionMode="multiple"
    :showCheckbox="true"
    :draggable="true"
    :searchable="true"
    @select="handleSelect"
    @expand="handleExpand"
    @drop="handleDrop"
  />
</template>

<script setup>
import { ref } from 'vue'

const treeData = ref([
  {
    id: '1',
    label: '根节点',
    children: [
      { id: '1-1', label: '子节点 1' },
      { id: '1-2', label: '子节点 2' }
    ]
  }
])

const selectedKeys = ref([])
const expandedKeys = ref(['1'])

const handleSelect = (keys) => {
  console.log('选中:', keys)
}

const handleExpand = (nodeId) => {
  console.log('展开:', nodeId)
}

const handleDrop = (data) => {
  console.log('拖拽:', data)
}
</script>
```

### 组合式 API

```vue
<script setup>
import { LDesignTree } from '@ldesign/tree/vue'
import { ref } from 'vue'

const treeRef = ref()

// 调用树方法
const expandAll = () => {
  treeRef.value?.expandAll()
}

const selectAll = () => {
  treeRef.value?.selectAll()
}
</script>

<template>
  <LDesignTree ref="treeRef" :data="treeData" />
  <button @click="expandAll">展开全部</button>
  <button @click="selectAll">全选</button>
</template>
```

## React

### 基础用法

```jsx
import React, { useState, useRef } from 'react'
import { LDesignTree } from '@ldesign/tree/react'
import '@ldesign/tree/style.css'

function App() {
  const [selectedKeys, setSelectedKeys] = useState([])
  const [expandedKeys, setExpandedKeys] = useState(['1'])
  const treeRef = useRef()

  const treeData = [
    {
      id: '1',
      label: '根节点',
      children: [
        { id: '1-1', label: '子节点 1' },
        { id: '1-2', label: '子节点 2' }
      ]
    }
  ]

  const handleSelect = (keys) => {
    setSelectedKeys(keys)
    console.log('选中:', keys)
  }

  const expandAll = () => {
    treeRef.current?.expandAll()
  }

  return (
    <div>
      <LDesignTree
        ref={treeRef}
        data={treeData}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
        selectionMode="multiple"
        showCheckbox={true}
        draggable={true}
        searchable={true}
        onSelect={handleSelect}
        onExpand={(nodeId) => {
          setExpandedKeys(prev => [...prev, nodeId])
        }}
        onCollapse={(nodeId) => {
          setExpandedKeys(prev => prev.filter(id => id !== nodeId))
        }}
      />
      <button onClick={expandAll}>展开全部</button>
    </div>
  )
}
```

### TypeScript 支持

```tsx
import { LDesignTree, LDesignTreeRef, LDesignTreeProps } from '@ldesign/tree/react'
import { TreeNodeData } from '@ldesign/tree'

const MyComponent: React.FC = () => {
  const treeRef = useRef<LDesignTreeRef>(null)
  
  const treeData: TreeNodeData[] = [
    // 树数据
  ]

  const props: LDesignTreeProps = {
    data: treeData,
    selectionMode: 'multiple',
    onSelect: (keys: string[]) => {
      console.log(keys)
    }
  }

  return <LDesignTree ref={treeRef} {...props} />
}
```

## Angular

### 导入模块

```typescript
import { NgModule } from '@angular/core'
import { LDesignTreeModule } from '@ldesign/tree/angular'

@NgModule({
  imports: [
    LDesignTreeModule
  ]
})
export class AppModule { }
```

### 组件使用

```typescript
import { Component, ViewChild } from '@angular/core'
import { LDesignTreeComponent } from '@ldesign/tree/angular'
import { TreeNodeData } from '@ldesign/tree'

@Component({
  selector: 'app-tree',
  template: `
    <ldesign-tree
      #tree
      [data]="treeData"
      [(selectedKeys)]="selectedKeys"
      [(expandedKeys)]="expandedKeys"
      selectionMode="multiple"
      [showCheckbox]="true"
      [draggable]="true"
      [searchable]="true"
      (select)="handleSelect($event)"
      (expand)="handleExpand($event)"
      (drop)="handleDrop($event)"
    ></ldesign-tree>
    
    <button (click)="expandAll()">展开全部</button>
    <button (click)="selectAll()">全选</button>
  `
})
export class TreeComponent {
  @ViewChild('tree') tree!: LDesignTreeComponent

  treeData: TreeNodeData[] = [
    {
      id: '1',
      label: '根节点',
      children: [
        { id: '1-1', label: '子节点 1' },
        { id: '1-2', label: '子节点 2' }
      ]
    }
  ]

  selectedKeys: string[] = []
  expandedKeys: string[] = ['1']

  handleSelect(keys: string[]) {
    console.log('选中:', keys)
  }

  handleExpand(nodeId: string) {
    console.log('展开:', nodeId)
  }

  handleDrop(data: any) {
    console.log('拖拽:', data)
  }

  expandAll() {
    this.tree.expandAll()
  }

  selectAll() {
    this.tree.selectAll()
  }
}
```

### 表单集成

```typescript
import { Component } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

@Component({
  template: `
    <form [formGroup]="form">
      <ldesign-tree
        formControlName="treeSelection"
        [data]="treeData"
        selectionMode="multiple"
        [showCheckbox]="true"
      ></ldesign-tree>
    </form>
  `
})
export class FormTreeComponent {
  form = new FormGroup({
    treeSelection: new FormControl([])
  })

  treeData = [
    // 树数据
  ]
}
```

## 高级功能

### 异步加载

```javascript
// Vue
const asyncLoad = async (node) => {
  const response = await fetch(`/api/tree/${node.id}/children`)
  return response.json()
}

// React
const asyncLoad = useCallback(async (node) => {
  const response = await fetch(`/api/tree/${node.id}/children`)
  return response.json()
}, [])

// Angular
loadChildren = async (node: any): Promise<TreeNodeData[]> => {
  const response = await this.http.get(`/api/tree/${node.id}/children`).toPromise()
  return response as TreeNodeData[]
}
```

### 虚拟滚动

```javascript
// 启用虚拟滚动以处理大量数据
const options = {
  virtualScroll: {
    enabled: true,
    itemHeight: 32,
    buffer: 10
  }
}
```

### 自定义主题

```javascript
// 使用内置主题
<LDesignTree theme="dark" />
<LDesignTree theme="compact" />
<LDesignTree theme="comfortable" />

// 自定义CSS变量
:root {
  --tree-primary-color: #1890ff;
  --tree-node-height: 40px;
  --tree-indent-size: 24px;
}
```

## API 参考

详细的 API 文档请参考：
- [核心 API](./api.md)
- [类型定义](./types.md)
- [配置选项](./options.md)
- [事件系统](./events.md)
