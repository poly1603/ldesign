# 快速开始指南

这份指南将帮助你在 5 分钟内快速上手 ApprovalFlow。

## 1. 安装

```bash
npm install @ldesign/approval-flow @logicflow/core
```

## 2. 引入样式

```js
import '@logicflow/core/dist/style/index.css';
```

## 3. 选择你的框架

### Vue 3

```vue
<template>
  <div class="container">
    <ApprovalFlow
      ref="editorRef"
      :data="flowData"
      width="100%"
      height="600px"
      @node:click="handleNodeClick"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ApprovalFlow } from '@ldesign/approval-flow/vue';

const editorRef = ref();

const flowData = ref({
  nodes: [
    { id: '1', type: 'start', name: '开始' },
    { id: '2', type: 'approval', name: '审批', approvers: [{ id: '1', name: '张三' }] },
    { id: '3', type: 'end', name: '结束' },
  ],
  edges: [
    { id: 'e1', sourceNodeId: '1', targetNodeId: '2' },
    { id: 'e2', sourceNodeId: '2', targetNodeId: '3' },
  ],
});

const handleNodeClick = (node) => {
  console.log('点击节点:', node);
};
</script>

<style>
.container {
  width: 100%;
  height: 600px;
}
</style>
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
      { id: '2', type: 'approval', name: '审批', approvers: [{ id: '1', name: '张三' }] },
      { id: '3', type: 'end', name: '结束' },
    ],
    edges: [
      { id: 'e1', sourceNodeId: '1', targetNodeId: '2' },
      { id: 'e2', sourceNodeId: '2', targetNodeId: '3' },
    ],
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ApprovalFlow
        ref={editorRef}
        data={flowData}
        width="100%"
        height="600px"
        onNodeClick={(node) => console.log('点击节点:', node)}
      />
    </div>
  );
}

export default App;
```

### 原生 JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ApprovalFlow Demo</title>
  <link rel="stylesheet" href="node_modules/@logicflow/core/dist/style/index.css">
  <style>
    #editor { width: 100%; height: 600px; }
  </style>
</head>
<body>
  <div id="editor"></div>

  <script type="module">
    import { ApprovalFlowEditor } from '@ldesign/approval-flow';

    const editor = new ApprovalFlowEditor({
      container: '#editor',
      width: '100%',
      height: '600px',
    });

    editor.setData({
      nodes: [
        { id: '1', type: 'start', name: '开始' },
        { id: '2', type: 'approval', name: '审批', approvers: [{ id: '1', name: '张三' }] },
        { id: '3', type: 'end', name: '结束' },
      ],
      edges: [
        { id: 'e1', sourceNodeId: '1', targetNodeId: '2' },
        { id: 'e2', sourceNodeId: '2', targetNodeId: '3' },
      ],
    });

    editor.on('node:click', (node) => {
      console.log('点击节点:', node);
    });
  </script>
</body>
</html>
```

## 4. 常用操作

### 添加节点

```js
// 添加审批节点
const nodeId = editor.addNode({
  type: 'approval',
  name: '部门审批',
  approvers: [
    { id: '1', name: '张三', role: '部门经理' }
  ],
});
```

### 更新节点

```js
editor.updateNode(nodeId, {
  name: '更新后的名称',
  approvers: [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
  ],
});
```

### 验证流程

```js
const result = editor.validate();
if (result.valid) {
  console.log('验证通过');
} else {
  console.log('验证失败:', result.errors);
}
```

### 获取数据

```js
const data = editor.getData();
console.log('流程数据:', data);
```

### 导出流程

```js
// 导出为 JSON
const json = await editor.export({ type: 'json' });

// 导出为图片
const png = await editor.export({
  type: 'png',
  filename: 'flowchart.png',
});
```

## 5. 运行示例

### 运行 Vue 示例

```bash
cd examples/vue-demo
npm install
npm run dev
```

访问 http://localhost:3000 查看示例。

## 6. 查看文档

```bash
npm run docs:dev
```

访问 http://localhost:5173 查看完整文档。

## 下一步

- 📖 查看[完整文档](./docs/index.md)
- 🎯 了解[节点类型](./docs/guide/node-types.md)
- ⚙️ 查看[配置选项](./docs/guide/configuration.md)
- 🎨 学习[事件系统](./docs/guide/events.md)
- 💡 浏览[API 文档](./docs/api/editor.md)

## 需要帮助？

- 📋 [GitHub Issues](https://github.com/ldesign/approval-flow/issues)
- 📧 Email: support@ldesign.com
- 💬 [讨论区](https://github.com/ldesign/approval-flow/discussions)
