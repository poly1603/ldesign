---
layout: home

hero:
  name: ApprovalFlow
  text: 审批流程图编辑器
  tagline: 基于 LogicFlow 的强大、灵活、易用的审批流程图编辑器
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/ldesign/approval-flow

features:
  - icon: 🎨
    title: 功能强大
    details: 支持开始、审批、条件、并行、抄送、结束等多种节点类型，满足复杂审批流程需求
  - icon: ⚡
    title: 配置丰富
    details: 提供丰富的配置选项，包括主题、工具栏、网格、缩放等，高度可定制
  - icon: 🚀
    title: 使用简单
    details: API 设计简洁直观，支持 Vue、React 等主流框架，开箱即用
  - icon: 📱
    title: 框架无关
    details: 核心库不依赖任何框架，可在任意 JavaScript 环境中使用
  - icon: 🔧
    title: TypeScript 支持
    details: 使用 TypeScript 编写，提供完整的类型定义，开发体验极佳
  - icon: 📦
    title: 体积小巧
    details: 基于 LogicFlow 核心，体积小巧，性能优异
---

## 快速开始

### 安装

::: code-group

```bash [npm]
npm install @ldesign/approval-flow
```

```bash [yarn]
yarn add @ldesign/approval-flow
```

```bash [pnpm]
pnpm add @ldesign/approval-flow
```

:::

### Vue 3 使用

```vue
<template>
  <ApprovalFlow
    :data="flowData"
    @node:click="handleNodeClick"
  />
</template>

<script setup>
import { ref } from 'vue';
import { ApprovalFlow } from '@ldesign/approval-flow/vue';
import '@logicflow/core/dist/style/index.css';

const flowData = ref({
  nodes: [
    { id: '1', type: 'start', name: '开始' },
    { id: '2', type: 'approval', name: '审批' },
    { id: '3', type: 'end', name: '结束' },
  ],
  edges: [
    { id: 'e1', sourceNodeId: '1', targetNodeId: '2' },
    { id: 'e2', sourceNodeId: '2', targetNodeId: '3' },
  ],
});

const handleNodeClick = (node) => {
  console.log('节点点击:', node);
};
</script>
```

### React 使用

```tsx
import { useRef } from 'react';
import { ApprovalFlow } from '@ldesign/approval-flow/react';
import '@logicflow/core/dist/style/index.css';

function App() {
  const editorRef = useRef();

  const flowData = {
    nodes: [
      { id: '1', type: 'start', name: '开始' },
      { id: '2', type: 'approval', name: '审批' },
      { id: '3', type: 'end', name: '结束' },
    ],
    edges: [
      { id: 'e1', sourceNodeId: '1', targetNodeId: '2' },
      { id: 'e2', sourceNodeId: '2', targetNodeId: '3' },
    ],
  };

  return (
    <ApprovalFlow
      ref={editorRef}
      data={flowData}
      onNodeClick={(node) => console.log('节点点击:', node)}
    />
  );
}
```

## 为什么选择 ApprovalFlow？

- **专为审批流程设计**：专门为审批流程场景设计，提供审批节点、条件节点、并行节点等
- **开箱即用**：提供 Vue、React 组件，无需复杂配置即可使用
- **高度可定制**：支持自定义主题、节点样式、工具栏等
- **完善的验证**：内置流程验证功能，确保流程的正确性
- **丰富的事件**：提供丰富的事件回调，方便集成到业务系统

## 贡献

欢迎贡献代码、报告问题或提出建议！

## 许可证

[MIT License](https://github.com/ldesign/approval-flow/blob/main/LICENSE)
