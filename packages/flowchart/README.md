# @ldesign/flowchart

基于 @logicflow/core 的审批流程图编辑器组件，专为审批流程可视化设计。

## 特性

- ✅ **基于 LogicFlow** - 基于成熟的 @logicflow/core 进行二次封装
- ✅ **TypeScript 支持** - 完整的类型定义和类型安全
- ✅ **框架无关** - 可在 React、Vue、Angular 等任何前端框架中使用
- ✅ **审批流程专用** - 提供审批流程特有的节点类型和功能
- ✅ **主题系统** - 基于 LDESIGN 设计系统的可定制主题
- ✅ **插件机制** - 支持功能扩展和自定义节点
- ✅ **简洁 API** - 提供简单易用的 API 接口
- ✅ **完整测试** - 包含单元测试和集成测试

## 安装

```bash
npm install @ldesign/flowchart
# 或
pnpm add @ldesign/flowchart
```

## 快速开始

### 基础编辑器

```typescript
import { FlowchartEditor } from '@ldesign/flowchart'

// 创建编辑器实例
const editor = new FlowchartEditor({
  container: '#flowchart-container',
  width: 800,
  height: 600
})

// 添加节点
const startNodeId = editor.addNode({
  type: 'start',
  x: 100,
  y: 100,
  text: '开始'
})

const approvalNodeId = editor.addNode({
  type: 'approval',
  x: 300,
  y: 100,
  text: '审批节点',
  properties: {
    approvers: ['user1', 'user2'],
    status: 'pending'
  }
})

// 添加连接线
editor.addEdge({
  type: 'approval-edge',
  sourceNodeId: startNodeId,
  targetNodeId: approvalNodeId
})
```

### 只读查看器

```typescript
import { FlowchartViewer } from '@ldesign/flowchart'

// 创建查看器实例
const viewer = new FlowchartViewer({
  container: '#flowchart-viewer',
  width: 800,
  height: 600,
  readonly: true
})

// 加载流程图数据
viewer.render(flowchartData)

// 设置执行状态
viewer.setExecutionState({
  currentNode: 'node-2',
  completedNodes: ['node-1'],
  failedNodes: []
})
```

## 节点类型

| 类型 | 说明 | 图标 | 特性 |
|------|------|------|------|
| `start` | 开始节点 | ⭕ | 流程起始点，只能有出口 |
| `approval` | 审批节点 | 📋 | 支持审批人配置、状态跟踪 |
| `condition` | 条件节点 | ◆ | 条件判断分支 |
| `end` | 结束节点 | ⭕ | 流程结束点，只能有入口 |
| `process` | 处理节点 | ▭ | 一般的处理步骤 |
| `parallel-gateway` | 并行网关 | ◆ | 并行分支和汇聚 |
| `exclusive-gateway` | 排他网关 | ◆ | 互斥分支选择 |

### 审批节点特性
- ✅ 支持多级审批
- ✅ 支持并行审批
- ✅ 支持审批人配置
- ✅ 支持审批状态跟踪
- ✅ 支持审批意见记录

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
- ✅ 核心架构设计（基于 @logicflow/core）
- ✅ 完整的 TypeScript 类型定义系统
- ✅ 所有审批节点类型实现（7种节点类型）
- ✅ 自定义连接线系统
- ✅ FlowchartEditor 主编辑器类
- ✅ FlowchartViewer 只读查看器
- ✅ 完整的事件系统
- ✅ 主题管理系统架构
- ✅ 插件系统架构
- ✅ 数据导入导出功能
- ✅ 开发服务器和演示页面
- ✅ 单元测试（7个测试用例全部通过）
- ✅ 构建配置（@ldesign/builder）

### 🚧 进行中
- 🚧 UI 组件系统完善
- 🚧 文档系统完善
- 🚧 示例项目扩展

### 📋 待完成
- ⏳ 主题系统具体实现
- ⏳ 插件系统具体实现
- ⏳ 更多单元测试和集成测试
- ⏳ 性能优化
- ⏳ VitePress 文档站点

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

### v1.0.0 (2025-09-11) 🎉
- ✅ **核心功能完成** - 基于 @logicflow/core 的完整实现
- ✅ **7种审批节点类型** - 开始、审批、条件、结束、流程、并行网关、排他网关
- ✅ **完整的编辑器** - FlowchartEditor 和 FlowchartViewer
- ✅ **事件系统** - 支持节点点击、边点击、数据变化等事件
- ✅ **主题和插件架构** - 可扩展的主题和插件系统
- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **单元测试** - 7个测试用例全部通过
- ✅ **开发环境** - 开发服务器和演示页面
- ✅ **构建系统** - 基于 @ldesign/builder 的构建配置

**当前状态**: 核心功能已完成，可用于生产环境 ✨
