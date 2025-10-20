# 🎯 FlowChart Approval Plugin

一个功能强大、易于使用、高性能的审批流程图插件，使用 TypeScript 编写。

## ✨ 特性

- 🚀 **性能优越**: 基于 SVG 的高性能渲染引擎
- 📦 **易于使用**: 简洁的 API 设计，快速上手
- 🔧 **易于扩展**: 面向对象设计，支持自定义节点类型和样式
- 🎨 **美观**: 内置多种节点类型和精美样式
- 📐 **自动布局**: 智能的自动布局算法
- 💪 **TypeScript**: 完整的类型定义支持
- 📱 **响应式**: 自适应容器大小
- 🔄 **数据驱动**: 支持 JSON 导入导出

### 🎯 新增：高级连线系统（v2.1）

参考 **bpmn.js** 实现的智能连线系统 + **流程图最佳实践**：

#### 核心功能
- 🔗 **智能连接点**: 连线从节点边框中间开始/结束
- 📏 **最少折点**: 自动计算最优路径，减少不必要的折点
- 💎 **特殊形状优化**: 菱形、三角形等节点每个角只有一根连线
- 🖱️ **连接点拖拽**: 支持拖拽改变连线的起始/结束位置
- ✨ **折点拖拽**: 支持拖拽调整连线路径的折点
- 📐 **网格对齐**: 路径自动对齐到网格，提高视觉一致性
- 🎯 **自动优化**: 自动移除共线点，简化路径

#### 流程图最佳实践（v2.1 新增）
- ⬇️ **垂直流向优先**: 主流程从上到下，符合阅读习惯
- 🔄 **回路外置**: 回退/退回连线自动走外侧，避免交叉
- 🎨 **智能颜色**: 自动识别连线类型（通过/拒绝/退回）并应用颜色
- 📍 **标签智能定位**: 标签自动避开连线，放在最长线段
- ⚡ **正交优先**: 只使用水平和垂直线，避免斜线
- 📊 **层次清晰**: 支持同级节点对齐

👉 [查看完整文档](./ADVANCED_CONNECTION_SYSTEM.md) | [快速开始](./QUICK_START_GUIDE.md) | [最佳实践](./FLOWCHART_BEST_PRACTICES.md) | [在线演示](./example/advanced-connection-demo.html)

## 📦 安装

```bash
npm install flowchart-approval
```

或使用 yarn:

```bash
yarn add flowchart-approval
```

## 🚀 快速开始

### 基础使用

```typescript
import { FlowChart, NodeType, NodeStatus } from 'flowchart-approval';

// 创建流程图实例
const flowChart = new FlowChart({
  container: '#flowchart-container',
  autoLayout: true,
  nodeGap: 80,
  levelGap: 120
});

// 添加节点
const nodes = [
  {
    id: 'start',
    type: NodeType.START,
    label: '开始',
    position: { x: 0, y: 0 }
  },
  {
    id: 'approval',
    type: NodeType.APPROVAL,
    label: '审批',
    position: { x: 0, y: 100 },
    status: NodeStatus.PROCESSING
  },
  {
    id: 'end',
    type: NodeType.END,
    label: '结束',
    position: { x: 0, y: 200 }
  }
];

// 添加连线
const edges = [
  { id: 'e1', source: 'start', target: 'approval' },
  { id: 'e2', source: 'approval', target: 'end' }
];

// 加载并渲染
flowChart.load(nodes, edges);
```

### 在浏览器中直接使用

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    #flowchart-container {
      width: 100%;
      height: 600px;
    }
  </style>
</head>
<body>
  <div id="flowchart-container"></div>
  
  <script src="path/to/flowchart.umd.js"></script>
  <script>
    const flowChart = new FlowChart.FlowChart({
      container: '#flowchart-container',
      autoLayout: true
    });
    
    // ... 添加节点和边
  </script>
</body>
</html>
```

## 📖 API 文档

### FlowChart 类

#### 构造函数

```typescript
new FlowChart(config: FlowChartConfig)
```

**配置选项**:

```typescript
interface FlowChartConfig {
  container: HTMLElement | string;  // 容器元素或选择器
  width?: number;                   // 宽度
  height?: number;                  // 高度
  nodeGap?: number;                 // 同级节点间距 (默认: 80)
  levelGap?: number;                // 层级间距 (默认: 120)
  enableDrag?: boolean;             // 启用拖拽 (默认: false)
  enableZoom?: boolean;             // 启用缩放 (默认: false)
  autoLayout?: boolean;             // 自动布局 (默认: true)
  onNodeClick?: (node: NodeData) => void;  // 节点点击回调
  onEdgeClick?: (edge: EdgeData) => void;  // 边点击回调
}
```

#### 主要方法

##### 节点操作

```typescript
// 添加节点
addNode(data: NodeData): FlowNode

// 删除节点
removeNode(id: string): boolean

// 获取节点
getNode(id: string): FlowNode | undefined

// 获取所有节点
getAllNodes(): FlowNode[]

// 更新节点状态
updateNodeStatus(id: string, status: NodeStatus): void
```

##### 边操作

```typescript
// 添加边
addEdge(data: EdgeData): FlowEdge

// 删除边
removeEdge(id: string): boolean

// 获取边
getEdge(id: string): FlowEdge | undefined

// 获取所有边
getAllEdges(): FlowEdge[]
```

##### 渲染操作

```typescript
// 渲染流程图
render(): void

// 执行自动布局
layout(): void

// 清空流程图
clear(): void
```

##### 数据操作

```typescript
// 加载数据
load(nodes: NodeData[], edges: EdgeData[]): void

// 导出 JSON
toJSON(): { nodes: NodeData[]; edges: EdgeData[] }

// 从 JSON 加载
fromJSON(data: { nodes: NodeData[]; edges: EdgeData[] }): void
```

##### 查询操作

```typescript
// 查找起始节点
findStartNodes(): FlowNode[]

// 查找结束节点
findEndNodes(): FlowNode[]

// 获取后继节点
getSuccessors(nodeId: string): FlowNode[]

// 获取前驱节点
getPredecessors(nodeId: string): FlowNode[]

// 验证流程图
validate(): { valid: boolean; errors: string[] }
```

### 节点类型

```typescript
enum NodeType {
  START = 'start',         // 开始节点
  END = 'end',             // 结束节点
  APPROVAL = 'approval',   // 审批节点
  CONDITION = 'condition', // 条件节点
  PROCESS = 'process',     // 处理节点
  PARALLEL = 'parallel',   // 并行节点
  MERGE = 'merge'          // 合并节点
}
```

### 节点状态

```typescript
enum NodeStatus {
  PENDING = 'pending',         // 待处理
  PROCESSING = 'processing',   // 处理中
  APPROVED = 'approved',       // 已通过
  REJECTED = 'rejected',       // 已拒绝
  COMPLETED = 'completed'      // 已完成
}
```

### 节点数据

```typescript
interface NodeData {
  id: string;                    // 节点ID
  type: NodeType;                // 节点类型
  label: string;                 // 节点标签
  position: Position;            // 节点位置
  status?: NodeStatus;           // 节点状态
  data?: Record<string, any>;    // 自定义数据
  style?: NodeStyle;             // 自定义样式
}
```

### 边数据

```typescript
interface EdgeData {
  id: string;           // 边ID
  source: string;       // 源节点ID
  target: string;       // 目标节点ID
  label?: string;       // 边标签
  condition?: string;   // 条件表达式
  style?: EdgeStyle;    // 自定义样式
}
```

## 🎨 自定义样式

### 自定义节点样式

```typescript
flowChart.addNode({
  id: 'custom',
  type: NodeType.APPROVAL,
  label: '自定义审批',
  position: { x: 0, y: 0 },
  style: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 3,
    textColor: '#0d47a1',
    fontSize: 16,
    borderRadius: 8
  }
});
```

### 自定义边样式

```typescript
flowChart.addEdge({
  id: 'custom-edge',
  source: 'node1',
  target: 'node2',
  label: '条件分支',
  style: {
    strokeColor: '#ff5722',
    strokeWidth: 3,
    strokeDasharray: '5,5'
  }
});
```

## 📋 使用示例

### 示例1: 简单审批流程

```typescript
const nodes = [
  {
    id: 'start',
    type: NodeType.START,
    label: '开始',
    position: { x: 0, y: 0 }
  },
  {
    id: 'submit',
    type: NodeType.PROCESS,
    label: '提交申请',
    position: { x: 0, y: 100 }
  },
  {
    id: 'approval',
    type: NodeType.APPROVAL,
    label: '经理审批',
    position: { x: 0, y: 200 },
    status: NodeStatus.PROCESSING
  },
  {
    id: 'condition',
    type: NodeType.CONDITION,
    label: '是否通过',
    position: { x: 0, y: 300 }
  },
  {
    id: 'approved',
    type: NodeType.PROCESS,
    label: '通过处理',
    position: { x: -150, y: 400 }
  },
  {
    id: 'rejected',
    type: NodeType.PROCESS,
    label: '拒绝处理',
    position: { x: 150, y: 400 }
  },
  {
    id: 'end',
    type: NodeType.END,
    label: '结束',
    position: { x: 0, y: 500 }
  }
];

const edges = [
  { id: 'e1', source: 'start', target: 'submit' },
  { id: 'e2', source: 'submit', target: 'approval' },
  { id: 'e3', source: 'approval', target: 'condition' },
  { id: 'e4', source: 'condition', target: 'approved', label: '通过' },
  { id: 'e5', source: 'condition', target: 'rejected', label: '拒绝' },
  { id: 'e6', source: 'approved', target: 'end' },
  { id: 'e7', source: 'rejected', target: 'end' }
];

flowChart.load(nodes, edges);
```

### 示例2: 并行审批流程

```typescript
const nodes = [
  {
    id: 'start',
    type: NodeType.START,
    label: '开始',
    position: { x: 0, y: 0 }
  },
  {
    id: 'parallel',
    type: NodeType.PARALLEL,
    label: '并行审批',
    position: { x: 0, y: 100 }
  },
  {
    id: 'hr',
    type: NodeType.APPROVAL,
    label: 'HR审批',
    position: { x: -200, y: 200 }
  },
  {
    id: 'tech',
    type: NodeType.APPROVAL,
    label: '技术审批',
    position: { x: 0, y: 200 }
  },
  {
    id: 'finance',
    type: NodeType.APPROVAL,
    label: '财务审批',
    position: { x: 200, y: 200 }
  },
  {
    id: 'merge',
    type: NodeType.MERGE,
    label: '合并结果',
    position: { x: 0, y: 300 }
  },
  {
    id: 'end',
    type: NodeType.END,
    label: '结束',
    position: { x: 0, y: 400 }
  }
];

const edges = [
  { id: 'e1', source: 'start', target: 'parallel' },
  { id: 'e2', source: 'parallel', target: 'hr' },
  { id: 'e3', source: 'parallel', target: 'tech' },
  { id: 'e4', source: 'parallel', target: 'finance' },
  { id: 'e5', source: 'hr', target: 'merge' },
  { id: 'e6', source: 'tech', target: 'merge' },
  { id: 'e7', source: 'finance', target: 'merge' },
  { id: 'e8', source: 'merge', target: 'end' }
];

flowChart.load(nodes, edges);
```

### 示例3: 动态更新节点状态

```typescript
// 模拟审批流程
function simulateApproval() {
  const nodeIds = ['submit', 'manager', 'director', 'ceo', 'finance'];
  let index = 0;

  const interval = setInterval(() => {
    if (index < nodeIds.length) {
      flowChart.updateNodeStatus(nodeIds[index], NodeStatus.APPROVED);
      if (index + 1 < nodeIds.length) {
        flowChart.updateNodeStatus(nodeIds[index + 1], NodeStatus.PROCESSING);
      }
      index++;
    } else {
      clearInterval(interval);
    }
  }, 1000);
}
```

## 🔧 开发

### 安装依赖

```bash
npm install
```

### 开发模式（推荐：使用 Vite 实时预览）

example 目录是一个独立的 Vite 项目，通过 alias 直接引用 `src` 源码，可以实时预览开发效果。

#### 1. 安装 example 依赖

```bash
npm run example:install
```

#### 2. 启动 Vite 开发服务器

```bash
npm run example:dev
```

这将启动开发服务器，自动打开浏览器访问 `http://localhost:3000`

**优势**：
- ⚡ **超快速热更新**: 修改 `src` 目录下的源码，浏览器会立即更新
- 🔥 **即时反馈**: 无需重新构建，直接看到修改效果
- 🎯 **真实环境**: 在真实的浏览器环境中开发调试

#### 3. 开发工作流

1. 运行 `npm run example:dev` 启动开发服务器
2. 修改 `src` 目录下的源码（比如 `FlowChart.ts`）
3. 保存文件，浏览器自动刷新，立即看到效果
4. 在浏览器中测试交互、查看效果
5. 重复步骤 2-4 直到完成开发

### 传统开发模式（构建模式）

如果需要使用 Rollup 监听模式：

```bash
npm run dev
```

### 构建

```bash
npm run build
```

构建后会在 `dist` 目录生成三种格式的文件：
- `flowchart.cjs.js` - CommonJS 格式
- `flowchart.esm.js` - ES Module 格式
- `flowchart.umd.js` - UMD 格式

## 📁 项目结构

```
flowchart-approval/
├── src/
│   ├── core/                  # 核心业务逻辑
│   │   ├── FlowChart.ts       # 流程图主类
│   │   ├── Node.ts            # 节点类
│   │   └── Edge.ts            # 边类
│   ├── layout/                # 布局引擎
│   │   └── LayoutEngine.ts    # 自动布局算法
│   ├── renderer/              # 渲染引擎
│   │   └── Renderer.ts        # SVG渲染器
│   ├── types/                 # 类型定义
│   │   └── index.ts           # TypeScript类型
│   └── index.ts               # 导出入口
├── example/                   # Vite示例项目
│   ├── index.html             # 示例页面
│   ├── demo.js                # 示例代码
│   ├── vite.config.js         # Vite配置
│   └── package.json           # 示例依赖
├── dist/                      # 构建输出
├── package.json
├── tsconfig.json
├── rollup.config.js
└── README.md
```

## 🎯 设计特点

### 1. 易于使用

- 简洁的 API 设计
- 链式调用支持
- 合理的默认配置
- 详细的类型提示

### 2. 易于扩展

- 面向对象设计
- 开放封闭原则
- 插件化架构
- 自定义样式支持

### 3. 性能优越

- SVG 渲染引擎
- 增量更新
- 高效的布局算法
- 事件委托

### 4. 功能完整

- 多种节点类型
- 自动布局
- 数据验证
- JSON 导入导出
- 事件回调

## 📄 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请通过 Issue 联系我们。

---

Made with ❤️ by FlowChart Team

