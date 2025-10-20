# 📝 流程图编辑器文档

## 📅 更新日期
2025-10-17

## 🎯 功能概述

**FlowChartEditor** 是一个功能完整的流程图可视化编辑器，提供只读和编辑两种模式，支持拖拽创建节点、可视化连线、工具栏操作等功能。

---

## ✨ 核心特性

### 1️⃣ 双模式设计

- **只读模式 (READONLY)**
  - ✅ 查看流程图
  - ✅ 缩放、平移画布
  - ❌ 不能编辑节点
  - ❌ 不能添加连线

- **编辑模式 (EDIT)**
  - ✅ 所有只读功能
  - ✅ 拖拽添加节点
  - ✅ 可视化连线
  - ✅ 删除节点/连线
  - ✅ 撤销/重做操作

### 2️⃣ 工具栏

- 模式切换（只读/编辑）
- 删除、清空操作
- 撤销、重做
- 放大、缩小、适应画布
- 导出数据

### 3️⃣ 物料面板

- 7 种节点类型
- 拖拽添加到画布
- 图标 + 文字说明
- 悬停效果

### 4️⃣ 拖拽功能

- 从物料面板拖拽组件
- 实时拖拽预览
- 释放到画布添加节点
- 自动生成唯一 ID

### 5️⃣ 连线绘制

- 点击节点开始连线
- 鼠标移动实时预览
- 点击目标节点完成连线
- 自动验证连接有效性

---

## 🚀 快速开始

### 基础使用

```typescript
import { FlowChartEditor, EditorMode } from 'flowchart-approval';

const editor = new FlowChartEditor({
  container: '#editor-container',
  mode: EditorMode.EDIT,      // 编辑模式
  showToolbar: true,            // 显示工具栏
  showMaterialPanel: true       // 显示物料面板
});
```

### 完整配置

```typescript
const editor = new FlowChartEditor({
  // 基础配置
  container: '#editor-container',
  mode: EditorMode.EDIT,
  
  // UI 配置
  showToolbar: true,
  showMaterialPanel: true,
  toolbarPosition: 'top',      // 或 'bottom'
  materialPanelPosition: 'left', // 或 'right'
  
  // 画布配置
  autoLayout: false,
  enableZoom: true,
  enablePan: true,
  nodeGap: 80,
  levelGap: 120,
  
  // 自定义物料
  materials: [
    { type: NodeType.START, label: '开始', icon: '▶️' },
    { type: NodeType.END, label: '结束', icon: '⏹️' },
    // ... 更多物料
  ],
  
  // 事件回调
  onNodeAdd: (node) => console.log('节点已添加', node),
  onNodeDelete: (nodeId) => console.log('节点已删除', nodeId),
  onEdgeAdd: (edge) => console.log('连线已添加', edge),
  onEdgeDelete: (edgeId) => console.log('连线已删除', edgeId),
  onNodeClick: (node) => console.log('节点被点击', node),
  onEdgeClick: (edge) => console.log('连线被点击', edge)
});
```

---

## 📖 API 参考

### EditorMode 枚举

```typescript
enum EditorMode {
  READONLY = 'readonly',   // 只读模式
  EDIT = 'edit'           // 编辑模式
}
```

### EditorConfig 接口

```typescript
interface EditorConfig extends FlowChartConfig {
  // UI 显示
  showToolbar?: boolean;           // 是否显示工具栏，默认 true
  showMaterialPanel?: boolean;     // 是否显示物料面板，默认 true
  toolbarPosition?: 'top' | 'bottom';  // 工具栏位置，默认 'top'
  materialPanelPosition?: 'left' | 'right'; // 物料面板位置，默认 'left'
  
  // 自定义物料
  materials?: MaterialItem[];      // 自定义物料列表
  
  // 继承自 FlowChartConfig
  mode?: EditorMode;               // 编辑器模式
  autoLayout?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  // ... 其他配置
}
```

### MaterialItem 接口

```typescript
interface MaterialItem {
  type: NodeType;        // 节点类型
  label: string;         // 显示标签
  icon?: string;         // 图标（emoji 或图片）
  description?: string;  // 描述信息
}
```

### FlowChartEditor 类

```typescript
class FlowChartEditor {
  constructor(config: EditorConfig);
  
  // 模式控制
  setMode(mode: EditorMode): void;
  getMode(): EditorMode;
  
  // 编辑操作
  deleteSelected(): void;
  clear(): void;
  undo(): void;
  redo(): void;
  
  // 视图操作
  zoomIn(): void;
  zoomOut(): void;
  fit(): void;
  
  // 数据操作
  load(nodes: NodeData[], edges: EdgeData[]): void;
  export(): { nodes: NodeData[]; edges: EdgeData[] };
  
  // 获取实例
  getFlowChart(): FlowChart;
  
  // 销毁
  destroy(): void;
}
```

---

## 🎨 使用场景

### 场景 1: 只读预览

```typescript
// 用于展示流程图，不允许编辑
const viewer = new FlowChartEditor({
  container: '#viewer',
  mode: EditorMode.READONLY,
  showToolbar: false,
  showMaterialPanel: false,
  enableZoom: true,
  enablePan: true
});

// 加载数据
viewer.load(nodes, edges);
```

### 场景 2: 完整编辑器

```typescript
// 完整的流程图编辑器
const editor = new FlowChartEditor({
  container: '#editor',
  mode: EditorMode.EDIT,
  showToolbar: true,
  showMaterialPanel: true,
  
  // 监听变更
  onNodeAdd: (node) => {
    // 自动保存
    saveToServer(editor.export());
  },
  onEdgeAdd: (edge) => {
    saveToServer(editor.export());
  }
});
```

### 场景 3: 自定义物料

```typescript
const editor = new FlowChartEditor({
  container: '#editor',
  mode: EditorMode.EDIT,
  
  // 自定义物料列表
  materials: [
    {
      type: NodeType.START,
      label: '开始节点',
      icon: '🚀',
      description: '流程的起点'
    },
    {
      type: NodeType.PROCESS,
      label: '业务处理',
      icon: '⚙️',
      description: '处理业务逻辑'
    },
    {
      type: NodeType.APPROVAL,
      label: '审批节点',
      icon: '✅',
      description: '需要审批的步骤'
    }
    // ... 更多自定义物料
  ]
});
```

### 场景 4: 权限控制

```typescript
let editor;

// 根据用户权限初始化
if (user.hasEditPermission) {
  editor = new FlowChartEditor({
    container: '#editor',
    mode: EditorMode.EDIT,
    showToolbar: true,
    showMaterialPanel: true
  });
} else {
  editor = new FlowChartEditor({
    container: '#editor',
    mode: EditorMode.READONLY,
    showToolbar: false,
    showMaterialPanel: false
  });
}
```

---

## 💡 操作指南

### 添加节点

1. 从左侧物料面板选择组件
2. 拖拽到画布中
3. 松开鼠标完成添加

### 连线操作

1. 点击源节点
2. 移动鼠标（会显示虚线预览）
3. 点击目标节点完成连线

### 切换模式

使用工具栏的"只读/编辑"切换按钮，或通过代码：

```typescript
editor.setMode(EditorMode.READONLY); // 切换到只读
editor.setMode(EditorMode.EDIT);     // 切换到编辑
```

### 删除节点/连线

```typescript
// 程序化删除
editor.deleteSelected();

// 或监听 Delete 键
document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete') {
    editor.deleteSelected();
  }
});
```

### 保存和加载

```typescript
// 导出数据
const data = editor.export();
console.log(data); // { nodes: [...], edges: [...] }

// 保存到服务器
await saveToServer(data);

// 从服务器加载
const loadedData = await loadFromServer();
editor.load(loadedData.nodes, loadedData.edges);
```

---

## 🎯 高级功能

### 自定义工具栏

虽然工具栏是自动创建的，但你可以通过配置控制其显示：

```typescript
const editor = new FlowChartEditor({
  container: '#editor',
  showToolbar: true,
  toolbarPosition: 'bottom', // 放在底部
  
  // 工具栏按钮的回调
  onNodeAdd: (node) => {
    // 自定义节点添加逻辑
  }
});
```

### 键盘快捷键

```typescript
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'z':
        e.preventDefault();
        editor.undo();
        break;
      case 'y':
        e.preventDefault();
        editor.redo();
        break;
      case 's':
        e.preventDefault();
        const data = editor.export();
        saveToServer(data);
        break;
    }
  }
  
  if (e.key === 'Delete') {
    editor.deleteSelected();
  }
});
```

### 访问底层 FlowChart

```typescript
// 获取底层流程图实例
const flowChart = editor.getFlowChart();

// 使用 FlowChart 的所有功能
flowChart.addNode(...);
flowChart.validate();
// ...
```

---

## 🎬 在线演示

查看 `example/editor-demo.html` 获取完整的交互式演示：

```bash
# 安装依赖
npm run example:install

# 运行演示
npm run example:dev

# 在浏览器中打开
# http://localhost:3000/editor-demo.html
```

演示包含：
- ✅ 完整的编辑器界面
- ✅ 工具栏和物料面板
- ✅ 拖拽和连线功能
- ✅ 模式切换演示
- ✅ 示例数据加载

---

## 🐛 常见问题

### Q: 如何禁用某些功能？

A: 通过配置控制：

```typescript
{
  showToolbar: false,        // 隐藏工具栏
  showMaterialPanel: false,  // 隐藏物料面板
  enableZoom: false,         // 禁用缩放
  enablePan: false           // 禁用平移
}
```

### Q: 如何自定义节点样式？

A: 在添加节点时指定样式：

```typescript
{
  id: 'custom',
  type: NodeType.PROCESS,
  label: '自定义',
  position: { x: 0, y: 0 },
  style: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 3
  }
}
```

### Q: 连线失败怎么办？

A: 连线失败通常是因为：
1. 源节点和目标节点相同
2. 连线已存在
3. 会形成循环

检查控制台错误信息。

### Q: 如何实现自动保存？

A: 监听变更事件：

```typescript
const editor = new FlowChartEditor({
  container: '#editor',
  onNodeAdd: () => autoSave(),
  onEdgeAdd: () => autoSave(),
  onNodeDelete: () => autoSave(),
  onEdgeDelete: () => autoSave()
});

function autoSave() {
  const data = editor.export();
  localStorage.setItem('flowchart', JSON.stringify(data));
}
```

---

## 📚 相关文档

- [README.md](./README.md) - 项目主文档
- [FEATURES.md](./FEATURES.md) - 高级特性
- [EDGE-RENDERER.md](./EDGE-RENDERER.md) - 连线渲染器

---

## 🎉 总结

**FlowChartEditor** 提供了：

✅ **双模式设计** - 只读/编辑模式自由切换  
✅ **完整工具栏** - 常用操作一键完成  
✅ **物料面板** - 拖拽添加节点  
✅ **可视化连线** - 点击即可连接  
✅ **灵活配置** - 高度可定制  
✅ **事件回调** - 完整的生命周期  
✅ **易于集成** - 最少几行代码即可使用  

开始使用 FlowChartEditor，快速构建专业的流程图编辑器！

---

*最后更新: 2025-10-17*  
*版本: 1.2.0*










