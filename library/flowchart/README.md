# @ldesign/approval-flow

> 基于 LogicFlow 的强大、灵活、易用的审批流程图编辑器

[![NPM version](https://img.shields.io/npm/v/@ldesign/approval-flow.svg)](https://www.npmjs.com/package/@ldesign/approval-flow)
[![License](https://img.shields.io/npm/l/@ldesign/approval-flow.svg)](https://github.com/ldesign/approval-flow/blob/main/LICENSE)

## ✨ 特性

- 🎨 **功能强大** - 支持开始、审批、条件、并行、抄送、结束等多种节点类型
- ⚡ **配置丰富** - 提供丰富的配置选项，包括主题、工具栏、网格、缩放等
- 🚀 **使用简单** - API 设计简洁直观，支持 Vue、React 等主流框架
- 📱 **框架无关** - 核心库不依赖任何框架，可在任意 JavaScript 环境中使用
- 🔧 **TypeScript** - 使用 TypeScript 编写，提供完整的类型定义
- 📦 **体积小巧** - 基于 LogicFlow 核心，体积小巧，性能优异

## 📦 安装

```bash
# npm
npm install @ldesign/approval-flow @logicflow/core

# yarn
yarn add @ldesign/approval-flow @logicflow/core

# pnpm
pnpm add @ldesign/approval-flow @logicflow/core
```

## 🔨 使用

### Vue 3

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

### React

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

### 原生 JavaScript

```js
import { ApprovalFlowEditor } from '@ldesign/approval-flow';
import '@logicflow/core/dist/style/index.css';

const editor = new ApprovalFlowEditor({
  container: '#editor',
  width: '100%',
  height: '600px',
});

editor.setData({
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

editor.on('node:click', (node) => {
  console.log('节点点击:', node);
});
```

## 📚 文档

完整文档请访问：[文档站点](https://docs.ldesign.com/approval-flow)

- [快速开始](https://docs.ldesign.com/approval-flow/guide/getting-started)
- [节点类型](https://docs.ldesign.com/approval-flow/guide/node-types)
- [配置选项](https://docs.ldesign.com/approval-flow/guide/configuration)
- [API 参考](https://docs.ldesign.com/approval-flow/api/editor)

## 🎯 节点类型

- **开始节点** - 流程的起点
- **审批节点** - 支持单人审批、会签、或签、顺序审批
- **条件节点** - 根据条件进行分支判断
- **并行节点** - 支持多个分支并行执行
- **抄送节点** - 通知相关人员
- **结束节点** - 流程的终点

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

## 📄 许可证

[MIT](./LICENSE)

## 🙏 致谢

本项目基于 [LogicFlow](https://site.logic-flow.cn/) 构建，感谢 LogicFlow 团队的优秀工作。
