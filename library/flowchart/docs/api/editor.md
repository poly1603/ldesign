# ApprovalFlowEditor API

`ApprovalFlowEditor` 是 ApprovalFlow 的核心类，提供了流程图编辑器的所有功能。

## 构造函数

```typescript
constructor(config: EditorConfig)
```

创建编辑器实例。

**参数**：

- `config`: 编辑器配置对象

**示例**：

```js
import { ApprovalFlowEditor } from '@ldesign/approval-flow';

const editor = new ApprovalFlowEditor({
  container: '#editor',
  width: '100%',
  height: '600px',
  readonly: false,
});
```

## 数据方法

### setData

```typescript
setData(data: FlowChartData): void
```

设置流程图数据。

**参数**：

- `data`: 流程图数据对象

**示例**：

```js
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
```

### getData

```typescript
getData(): FlowChartData
```

获取流程图数据。

**返回值**：

- 流程图数据对象

**示例**：

```js
const data = editor.getData();
console.log(data);
```

## 节点操作

### addNode

```typescript
addNode(node: Partial<NodeData> & { type: ApprovalNodeType }): string
```

添加节点。

**参数**：

- `node`: 节点配置对象

**返回值**：

- 新添加节点的 ID

**示例**：

```js
const nodeId = editor.addNode({
  type: 'approval',
  name: '新审批节点',
  approvers: [
    { id: '1', name: '张三' },
  ],
});
```

### updateNode

```typescript
updateNode(nodeId: string, data: Partial<NodeData>): void
```

更新节点数据。

**参数**：

- `nodeId`: 节点 ID
- `data`: 要更新的节点数据

**示例**：

```js
editor.updateNode('approval-1', {
  name: '更新后的名称',
  approvers: [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
  ],
});
```

### deleteNode

```typescript
deleteNode(nodeId: string): void
```

删除节点。

**参数**：

- `nodeId`: 节点 ID

**示例**：

```js
editor.deleteNode('approval-1');
```

## 边操作

### deleteEdge

```typescript
deleteEdge(edgeId: string): void
```

删除边。

**参数**：

- `edgeId`: 边 ID

**示例**：

```js
editor.deleteEdge('edge-1');
```

## 验证

### validate

```typescript
validate(): ValidationResult
```

验证流程图。

**返回值**：

- 验证结果对象

**示例**：

```js
const result = editor.validate();

if (result.valid) {
  console.log('验证通过');
} else {
  console.log('验证失败:', result.errors);
}
```

## 编辑模式

### setReadonly

```typescript
setReadonly(readonly: boolean): void
```

设置只读模式。

**参数**：

- `readonly`: 是否只读

**示例**：

```js
// 切换到只读模式
editor.setReadonly(true);

// 切换到编辑模式
editor.setReadonly(false);
```

## 缩放操作

### zoom

```typescript
zoom(scale?: number): void
```

缩放画布。

**参数**：

- `scale`: 缩放比例（可选）

**示例**：

```js
// 缩放到 1.5 倍
editor.zoom(1.5);

// 如果不传参数，使用默认缩放
editor.zoom();
```

### zoomIn

```typescript
zoomIn(): void
```

放大画布。

**示例**：

```js
editor.zoomIn();
```

### zoomOut

```typescript
zoomOut(): void
```

缩小画布。

**示例**：

```js
editor.zoomOut();
```

### fit

```typescript
fit(): void
```

自适应画布大小。

**示例**：

```js
editor.fit();
```

### resetZoom

```typescript
resetZoom(): void
```

重置缩放。

**示例**：

```js
editor.resetZoom();
```

## 历史操作

### undo

```typescript
undo(): void
```

撤销操作。

**示例**：

```js
editor.undo();
```

### redo

```typescript
redo(): void
```

重做操作。

**示例**：

```js
editor.redo();
```

## 导入导出

### export

```typescript
export(config: ExportConfig): Promise<string | Blob>
```

导出流程图。

**参数**：

- `config`: 导出配置

**返回值**：

- Promise，返回导出的数据

**示例**：

```js
// 导出为 JSON
const json = await editor.export({ type: 'json' });
console.log(json);

// 导出为 PNG 图片
const png = await editor.export({
  type: 'png',
  backgroundColor: '#ffffff',
  filename: 'flowchart.png',
});
```

## 其他操作

### clear

```typescript
clear(): void
```

清空画布。

**示例**：

```js
editor.clear();
```

### destroy

```typescript
destroy(): void
```

销毁编辑器实例。

**示例**：

```js
editor.destroy();
```

### getLogicFlow

```typescript
getLogicFlow(): LogicFlow | null
```

获取底层 LogicFlow 实例。

**返回值**：

- LogicFlow 实例或 null

**示例**：

```js
const lf = editor.getLogicFlow();
if (lf) {
  // 使用 LogicFlow 的 API
  lf.setTheme({
    // 自定义主题
  });
}
```

## 事件监听

### on

```typescript
on<K extends keyof EditorEvents>(event: K, handler: EditorEvents[K]): void
```

注册事件监听器。

**参数**：

- `event`: 事件名称
- `handler`: 事件处理函数

**示例**：

```js
// 监听节点点击事件
editor.on('node:click', (node) => {
  console.log('节点点击:', node);
});

// 监听数据变化事件
editor.on('data:change', (data) => {
  console.log('数据变化:', data);
});
```

### off

```typescript
off<K extends keyof EditorEvents>(event: K): void
```

移除事件监听器。

**参数**：

- `event`: 事件名称

**示例**：

```js
// 移除节点点击事件监听
editor.off('node:click');
```

## 支持的事件

- `node:click` - 节点点击
- `node:dblclick` - 节点双击
- `node:add` - 节点添加
- `node:delete` - 节点删除
- `node:update` - 节点更新
- `edge:click` - 边点击
- `edge:add` - 边添加
- `edge:delete` - 边删除
- `data:change` - 数据变化
- `canvas:zoom` - 画布缩放
- `selection:change` - 选中变化

详细的事件说明请参考 [事件系统](/guide/events)。
