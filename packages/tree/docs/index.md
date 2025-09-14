---
layout: home

hero:
  name: "@ldesign/tree"
  text: "功能完整的树形组件库"
  tagline: "支持多框架、高性能、易扩展的现代树形组件"
  image:
    src: /logo.svg
    alt: ldesign tree
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/tree

features:
  - icon: 🎯
    title: 多选择模式
    details: 支持单选、多选、级联选择，满足各种业务场景需求
  
  - icon: 🚀
    title: 高性能
    details: 虚拟滚动技术，轻松处理万级数据量，保持流畅体验
  
  - icon: 🎨
    title: 主题定制
    details: 内置多种主题，支持CSS变量自定义，轻松适配设计系统
  
  - icon: 🔧
    title: TypeScript
    details: 完整的类型定义，提供优秀的开发体验和代码提示
  
  - icon: 🎭
    title: 多框架支持
    details: 支持Vue、React、Angular和原生JavaScript，一套代码多端使用
  
  - icon: 🔌
    title: 插件系统
    details: 灵活的插件架构，支持功能扩展和自定义开发
  
  - icon: 🎪
    title: 拖拽排序
    details: 支持节点间拖拽排序和层级调整，提供直观的交互体验
  
  - icon: 🔍
    title: 智能搜索
    details: 支持文本、正则、模糊搜索，快速定位目标节点
  
  - icon: ⚡
    title: 异步加载
    details: 支持懒加载和动态数据，优化大型树结构的加载性能
---

## 快速体验

::: code-group

```typescript [原生JavaScript]
import Tree from '@ldesign/tree'
import '@ldesign/tree/style.css'

const tree = new Tree(document.getElementById('tree'), {
  data: [
    {
      id: '1',
      label: '节点1',
      children: [
        { id: '1-1', label: '子节点1-1' },
        { id: '1-2', label: '子节点1-2' },
      ],
    },
  ],
  selection: {
    mode: 'multiple',
    showCheckbox: true,
  },
})
```

```vue [Vue 3]
<template>
  <LDesignTree
    :data="treeData"
    selection-mode="multiple"
    :show-checkbox="true"
    @select="onSelect"
  />
</template>

<script setup>
import { LDesignTree } from '@ldesign/tree/vue'

const treeData = [
  {
    id: '1',
    label: '节点1',
    children: [
      { id: '1-1', label: '子节点1-1' },
      { id: '1-2', label: '子节点1-2' },
    ],
  },
]

const onSelect = (selectedIds) => {
  console.log('选中的节点:', selectedIds)
}
</script>
```

```tsx [React]
import React from 'react'
import { LDesignTree } from '@ldesign/tree/react'

const App = () => {
  const treeData = [
    {
      id: '1',
      label: '节点1',
      children: [
        { id: '1-1', label: '子节点1-1' },
        { id: '1-2', label: '子节点1-2' },
      ],
    },
  ]

  return (
    <LDesignTree
      data={treeData}
      selectionMode="multiple"
      showCheckbox={true}
      onSelect={(selectedIds) => console.log(selectedIds)}
    />
  )
}
```

```typescript [Angular]
// app.component.html
<ldesign-tree
  [data]="treeData"
  selectionMode="multiple"
  [showCheckbox]="true"
  (select)="onSelect($event)"
></ldesign-tree>

// app.component.ts
export class AppComponent {
  treeData = [
    {
      id: '1',
      label: '节点1',
      children: [
        { id: '1-1', label: '子节点1-1' },
        { id: '1-2', label: '子节点1-2' },
      ],
    },
  ]

  onSelect(selectedIds: string[]) {
    console.log('选中的节点:', selectedIds)
  }
}
```

:::

## 为什么选择 @ldesign/tree？

### 🎯 专业级功能
提供企业级应用所需的完整功能集，包括多选择模式、拖拽排序、搜索过滤、异步加载等。

### 🚀 卓越性能
采用虚拟滚动技术，支持万级数据量渲染，保持60fps流畅体验。

### 🎨 设计友好
内置多种主题，支持CSS变量自定义，轻松适配各种设计系统。

### 🔧 开发体验
完整的TypeScript支持，丰富的API文档，活跃的社区支持。

### 🎭 框架无关
一套代码，多框架使用，降低学习成本和维护负担。

### 🔌 高度可扩展
灵活的插件系统，支持功能扩展和自定义开发。

---

<div style="text-align: center; margin-top: 40px;">
  <a href="/guide/getting-started" style="background: #1890ff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
    立即开始 →
  </a>
</div>
