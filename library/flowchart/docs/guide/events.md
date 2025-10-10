# 事件系统

ApprovalFlow 提供了丰富的事件系统，让你可以监听编辑器中的各种操作。

## 事件监听

使用 `on` 方法监听事件：

```js
editor.on('node:click', (node) => {
  console.log('节点被点击:', node);
});
```

使用 `off` 方法移除监听：

```js
editor.off('node:click');
```

## 节点事件

### node:click

节点单击事件。

**参数**: `NodeData`

```js
editor.on('node:click', (node) => {
  console.log('点击的节点:', node);
  console.log('节点ID:', node.id);
  console.log('节点类型:', node.type);
  console.log('节点名称:', node.name);
});
```

### node:dblclick

节点双击事件。

**参数**: `NodeData`

```js
editor.on('node:dblclick', (node) => {
  console.log('双击的节点:', node);
  // 可以在这里打开节点编辑对话框
  openNodeEditDialog(node);
});
```

### node:add

节点添加事件。

**参数**: `NodeData`

```js
editor.on('node:add', (node) => {
  console.log('添加了节点:', node);
  // 可以在这里记录操作日志
  logOperation('add-node', node);
});
```

### node:delete

节点删除事件。

**参数**: `NodeData`

```js
editor.on('node:delete', (node) => {
  console.log('删除了节点:', node);
  // 可以在这里执行清理操作
  cleanupNodeData(node);
});
```

### node:update

节点更新事件。

**参数**: `NodeData`

```js
editor.on('node:update', (node) => {
  console.log('更新了节点:', node);
  // 可以在这里同步数据到服务器
  syncNodeToServer(node);
});
```

## 边事件

### edge:click

边单击事件。

**参数**: `EdgeData`

```js
editor.on('edge:click', (edge) => {
  console.log('点击的边:', edge);
  console.log('源节点:', edge.sourceNodeId);
  console.log('目标节点:', edge.targetNodeId);
});
```

### edge:add

边添加事件。

**参数**: `EdgeData`

```js
editor.on('edge:add', (edge) => {
  console.log('添加了边:', edge);
  // 可以在这里验证连线的合法性
  validateEdge(edge);
});
```

### edge:delete

边删除事件。

**参数**: `EdgeData`

```js
editor.on('edge:delete', (edge) => {
  console.log('删除了边:', edge);
});
```

## 数据事件

### data:change

数据变化事件。当节点或边发生变化时触发。

**参数**: `FlowChartData`

```js
editor.on('data:change', (data) => {
  console.log('数据已变化:', data);
  console.log('节点数量:', data.nodes.length);
  console.log('边数量:', data.edges.length);

  // 可以在这里自动保存数据
  autoSave(data);
});
```

## 画布事件

### canvas:zoom

画布缩放事件。

**参数**: `number` (缩放比例)

```js
editor.on('canvas:zoom', (zoom) => {
  console.log('当前缩放比例:', zoom);
  // 可以在这里更新缩放显示
  updateZoomDisplay(zoom);
});
```

## 选中事件

### selection:change

选中变化事件。

**参数**: `{ nodes: NodeData[], edges: EdgeData[] }`

```js
editor.on('selection:change', (selection) => {
  console.log('选中的节点:', selection.nodes);
  console.log('选中的边:', selection.edges);

  // 可以在这里更新属性面板
  updatePropertyPanel(selection);
});
```

## 实际应用示例

### 示例 1: 自动保存

```js
let saveTimer;

editor.on('data:change', (data) => {
  // 防抖：500ms 后保存
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveToServer(data);
  }, 500);
});

async function saveToServer(data) {
  try {
    await fetch('/api/flowchart/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.log('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
  }
}
```

### 示例 2: 节点编辑

```js
editor.on('node:dblclick', (node) => {
  // 打开编辑对话框
  const newData = await openEditDialog(node);

  if (newData) {
    // 更新节点
    editor.updateNode(node.id, newData);
  }
});

async function openEditDialog(node) {
  // 显示对话框并返回编辑后的数据
  return new Promise((resolve) => {
    const dialog = createDialog({
      title: '编辑节点',
      data: node,
      onConfirm: (data) => resolve(data),
      onCancel: () => resolve(null),
    });
    dialog.show();
  });
}
```

### 示例 3: 实时验证

```js
editor.on('data:change', (data) => {
  // 实时验证流程
  const result = editor.validate();

  if (!result.valid) {
    // 显示验证错误
    showErrors(result.errors);
  } else {
    // 清除错误提示
    clearErrors();
  }
});

function showErrors(errors) {
  const errorList = document.getElementById('error-list');
  errorList.innerHTML = errors.map(error =>
    `<li class="error-item">${error.message}</li>`
  ).join('');
}
```

### 示例 4: 操作日志

```js
const operationLog = [];

editor.on('node:add', (node) => {
  operationLog.push({
    type: 'node-add',
    timestamp: Date.now(),
    data: node,
  });
});

editor.on('node:delete', (node) => {
  operationLog.push({
    type: 'node-delete',
    timestamp: Date.now(),
    data: node,
  });
});

editor.on('edge:add', (edge) => {
  operationLog.push({
    type: 'edge-add',
    timestamp: Date.now(),
    data: edge,
  });
});

// 导出操作日志
function exportLog() {
  console.log('操作日志:', operationLog);
  return operationLog;
}
```

## 事件类型定义

```typescript
interface EditorEvents {
  'node:click'?: (data: NodeData) => void;
  'node:dblclick'?: (data: NodeData) => void;
  'node:add'?: (data: NodeData) => void;
  'node:delete'?: (data: NodeData) => void;
  'node:update'?: (data: NodeData) => void;
  'edge:click'?: (data: EdgeData) => void;
  'edge:add'?: (data: EdgeData) => void;
  'edge:delete'?: (data: EdgeData) => void;
  'data:change'?: (data: FlowChartData) => void;
  'canvas:zoom'?: (zoom: number) => void;
  'selection:change'?: (selection: {
    nodes: NodeData[];
    edges: EdgeData[]
  }) => void;
}
```

## 下一步

- [数据格式](/guide/data-format) - 了解数据格式
- [API 参考](/api/editor) - 查看完整的 API 文档
