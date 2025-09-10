# @ldesign/flowchart

一个基于Canvas的流程图编辑器和预览器组件，专为OA系统的流程审批流程可视化设计。

## 特性

- 🎨 **完全自主实现** - 不依赖任何第三方流程图库
- 🔧 **TypeScript支持** - 完整的类型定义和类型安全
- 🌐 **框架无关** - 可在React、Vue、Angular等任何前端框架中使用
- 📱 **响应式设计** - 支持不同屏幕尺寸
- 🎯 **高性能渲染** - 基于Canvas 2D API的高效渲染
- 🔄 **撤销重做** - 完整的操作历史管理
- 💾 **数据导入导出** - 标准的JSON格式数据交换
- 🎨 **LDESIGN设计系统** - 使用项目统一的设计变量

## 安装

```bash
pnpm add @ldesign/flowchart
```

## 快速开始

### 基础编辑器

```typescript
import { FlowchartEditor } from '@ldesign/flowchart';

const container = document.getElementById('flowchart-container');
const editor = new FlowchartEditor({
  container,
  width: 800,
  height: 600
});

// 添加节点
editor.addNode({
  id: 'start',
  type: 'start',
  position: { x: 100, y: 100 },
  label: '开始',
  properties: {}
});
```

### 只读预览器

```typescript
import { FlowchartViewer } from '@ldesign/flowchart';

const viewer = new FlowchartViewer({
  container: document.getElementById('viewer-container'),
  data: flowchartData,
  readonly: true
});

// 高亮当前执行节点
viewer.highlightNode('current-node-id');
```

## 节点类型

### 控制节点
- **开始节点** (`start`) - 流程的起始点
- **结束节点** (`end`) - 流程的结束点

### 处理节点
- **处理节点** (`process`) - 一般的处理步骤
- **决策节点** (`decision`) - 条件判断分支
- **审批节点** (`approval`) - OA系统专用的审批节点

### 审批节点特性
- 支持多级审批
- 支持并行审批
- 支持审批人配置
- 支持审批状态跟踪

## 连接线类型

- **直线** (`straight`) - 直接连接
- **贝塞尔曲线** (`bezier`) - 平滑曲线连接
- **正交线** (`orthogonal`) - 直角连接

## API文档

### FlowchartEditor

#### 构造函数
```typescript
new FlowchartEditor(config: FlowchartEditorConfig)
```

#### 主要方法
- `addNode(nodeData: NodeData): void` - 添加节点
- `updateNode(id: string, updates: Partial<NodeData>): void` - 更新节点
- `removeNode(id: string): void` - 删除节点
- `addEdge(edgeData: EdgeData): void` - 添加连接线
- `updateEdge(id: string, updates: Partial<EdgeData>): void` - 更新连接线
- `removeEdge(id: string): void` - 删除连接线
- `getData(): FlowchartData` - 获取数据
- `loadData(data: FlowchartData): void` - 加载数据
- `undo(): boolean` - 撤销操作
- `redo(): boolean` - 重做操作
- `setZoom(scale: number): void` - 设置缩放
- `exportAsImage(format: 'png' | 'jpeg'): string` - 导出图片

### FlowchartViewer

#### 构造函数
```typescript
new FlowchartViewer(config: FlowchartViewerConfig)
```

#### 主要方法
- `highlightNode(nodeId: string): void` - 高亮节点
- `setExecutionState(state: ExecutionState): void` - 设置执行状态
- `fitToContent(): void` - 适应内容大小

## 数据格式

```typescript
interface FlowchartData {
  nodes: NodeData[];
  edges: EdgeData[];
  viewport?: Viewport;
  metadata?: Record<string, any>;
}

interface NodeData {
  id: string;
  type: NodeType;
  position: Point;
  label: string;
  size?: Size;
  style?: Style;
  properties: Record<string, any>;
}

interface EdgeData {
  id: string;
  type: EdgeType;
  source: string;
  target: string;
  label?: string;
  style?: Style;
  properties: Record<string, any>;
}
```

## 开发状态

### ✅ 已完成
- 核心架构设计
- 类型定义系统
- 基础节点类型实现
- 连接线系统
- 数据管理器
- 事件系统
- 几何计算工具
- Canvas渲染引擎

### 🚧 进行中
- 单元测试完善
- 集成测试
- 文档完善
- 示例应用

### 📋 待完成
- 构建配置
- 性能优化
- 更多节点类型
- 主题系统
- 插件系统

## 开发

```bash
# 安装依赖
pnpm install

# 运行测试
pnpm test

# 构建
pnpm build

# 开发模式
pnpm dev
```

## 测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test -- tests/core/DataManager.test.ts

# 监听模式
pnpm test:watch

# 生成覆盖率报告（文本 + HTML）
pnpm test:coverage
```

### 覆盖率
- 运行：`pnpm test:coverage`，HTML 报告生成于 `coverage/index.html`
- 阈值：在 `vitest.config.ts` 中配置了全局阈值（branches/functions/lines/statements 统一目标 80%）
- 说明：覆盖率统计默认仅针对源码目录（src），测试与构建产物已被排除；若本地统计口径不同导致阈值未生效，请检查 include/exclude 配置并逐步提升用例覆盖率后开启更严格校验

### 新增覆盖点（近期）
- CanvasRenderer 渲染分支：覆盖 selectionBox、guides、tempConnection 三个渲染路径
- CanvasRenderer 网格：覆盖 gridSize 阈值、不同 scale 下 lineWidth、offset 起点计算、按层/优先级排序与渲染容错
- InteractionManager 键盘事件：覆盖 Delete（删除选中项）、Ctrl+A（全选）、Escape（清空选择）以及通用 keydown/keyup 事件转发
- InteractionManager 交互：覆盖 PAN 模式平移事件与 viewport 更新、拖拽对齐 vertical+horizontal 指引
- FlowchartEditor 集成：覆盖临时连接（tempConnection）渲染与 CONNECT 模式鼠标取消（connect-cancel）

## 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License

## 更新日志

### v1.0.0 (开发中)
- 初始版本
- 基础编辑器功能
- 核心节点类型
- 数据管理系统
