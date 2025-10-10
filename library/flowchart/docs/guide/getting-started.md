# 快速开始

本指南将帮助你快速上手 ApprovalFlow。

## 安装

首先，安装 ApprovalFlow 包：

::: code-group

```bash [npm]
npm install @ldesign/approval-flow @logicflow/core
```

```bash [yarn]
yarn add @ldesign/approval-flow @logicflow/core
```

```bash [pnpm]
pnpm add @ldesign/approval-flow @logicflow/core
```

:::

::: tip
ApprovalFlow 依赖 LogicFlow 核心库，所以需要同时安装 `@logicflow/core`。
:::

## 引入样式

在使用组件之前，需要引入 LogicFlow 的样式文件：

```js
import '@logicflow/core/dist/style/index.css';
```

## Vue 3 使用

### 基础用法

```vue
<template>
  <div class="container">
    <ApprovalFlow
      ref="editorRef"
      :data="flowData"
      :width="'100%'"
      :height="'600px'"
      @node:click="handleNodeClick"
      @data:change="handleDataChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ApprovalFlow } from '@ldesign/approval-flow/vue';
import type { FlowChartData, NodeData } from '@ldesign/approval-flow';

const editorRef = ref();

// 流程数据
const flowData = ref<FlowChartData>({
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      name: '开始',
    },
    {
      id: 'approval-1',
      type: 'approval',
      name: '部门审批',
      approvalMode: 'single',
      approvers: [
        { id: '1', name: '张三', role: '部门经理' },
      ],
    },
    {
      id: 'end-1',
      type: 'end',
      name: '结束',
    },
  ],
  edges: [
    {
      id: 'edge-1',
      sourceNodeId: 'start-1',
      targetNodeId: 'approval-1',
    },
    {
      id: 'edge-2',
      sourceNodeId: 'approval-1',
      targetNodeId: 'end-1',
    },
  ],
});

// 节点点击事件
const handleNodeClick = (node: NodeData) => {
  console.log('节点点击:', node);
};

// 数据变化事件
const handleDataChange = (data: FlowChartData) => {
  console.log('数据变化:', data);
};

// 添加节点
const addNode = () => {
  editorRef.value?.addNode({
    type: 'approval',
    name: '新审批节点',
  });
};

// 验证流程
const validate = () => {
  const result = editorRef.value?.validate();
  if (result?.valid) {
    console.log('验证通过');
  } else {
    console.error('验证失败:', result?.errors);
  }
};
</script>

<style>
.container {
  width: 100%;
  height: 600px;
}
</style>
```

### 使用 Composition API

你也可以使用 `useApprovalFlow` Hook：

```vue
<template>
  <div ref="containerRef" class="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApprovalFlow } from '@ldesign/approval-flow/vue';
import type { FlowChartData } from '@ldesign/approval-flow';

const containerRef = ref<HTMLDivElement>();

onMounted(() => {
  if (!containerRef.value) return;

  const { editor, setData, getData, validate } = useApprovalFlow({
    container: containerRef.value,
    width: '100%',
    height: '600px',
  });

  // 设置数据
  setData({
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

  // 获取数据
  const data = getData();
  console.log(data);

  // 验证
  const result = validate();
  console.log(result);
});
</script>
```

## React 使用

### 基础用法

```tsx
import { useRef } from 'react';
import { ApprovalFlow, ApprovalFlowRef } from '@ldesign/approval-flow/react';
import type { FlowChartData, NodeData } from '@ldesign/approval-flow';
import '@logicflow/core/dist/style/index.css';

function App() {
  const editorRef = useRef<ApprovalFlowRef>(null);

  const flowData: FlowChartData = {
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        name: '开始',
      },
      {
        id: 'approval-1',
        type: 'approval',
        name: '部门审批',
        approvalMode: 'single',
        approvers: [
          { id: '1', name: '张三', role: '部门经理' },
        ],
      },
      {
        id: 'end-1',
        type: 'end',
        name: '结束',
      },
    ],
    edges: [
      {
        id: 'edge-1',
        sourceNodeId: 'start-1',
        targetNodeId: 'approval-1',
      },
      {
        id: 'edge-2',
        sourceNodeId: 'approval-1',
        targetNodeId: 'end-1',
      },
    ],
  };

  const handleNodeClick = (node: NodeData) => {
    console.log('节点点击:', node);
  };

  const handleDataChange = (data: FlowChartData) => {
    console.log('数据变化:', data);
  };

  const addNode = () => {
    editorRef.current?.addNode({
      type: 'approval',
      name: '新审批节点',
    });
  };

  const validate = () => {
    const result = editorRef.current?.validate();
    if (result?.valid) {
      console.log('验证通过');
    } else {
      console.error('验证失败:', result?.errors);
    }
  };

  return (
    <div className="container">
      <button onClick={addNode}>添加节点</button>
      <button onClick={validate}>验证</button>

      <ApprovalFlow
        ref={editorRef}
        data={flowData}
        width="100%"
        height="600px"
        onNodeClick={handleNodeClick}
        onDataChange={handleDataChange}
      />
    </div>
  );
}

export default App;
```

### 使用 Hook

```tsx
import { useEffect, useRef } from 'react';
import { useApprovalFlow } from '@ldesign/approval-flow/react';
import '@logicflow/core/dist/style/index.css';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const { editor, setData, getData, validate } = useApprovalFlow({
      container: containerRef.current,
      width: '100%',
      height: '600px',
    });

    // 设置数据
    setData({
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

    // 获取数据
    const data = getData();
    console.log(data);

    // 验证
    const result = validate();
    console.log(result);
  }, []);

  return <div ref={containerRef} className="container"></div>;
}
```

## 原生 JavaScript 使用

```js
import { ApprovalFlowEditor } from '@ldesign/approval-flow';
import '@logicflow/core/dist/style/index.css';

// 创建编辑器实例
const editor = new ApprovalFlowEditor({
  container: document.getElementById('container'),
  width: '100%',
  height: '600px',
});

// 设置数据
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

// 监听事件
editor.on('node:click', (node) => {
  console.log('节点点击:', node);
});

// 获取数据
const data = editor.getData();
console.log(data);

// 验证
const result = editor.validate();
console.log(result);
```

## 下一步

- [节点类型](/guide/node-types) - 了解各种节点类型
- [配置选项](/guide/configuration) - 查看所有配置选项
- [事件系统](/guide/events) - 了解事件系统
- [API 参考](/api/editor) - 查看完整的 API 文档
