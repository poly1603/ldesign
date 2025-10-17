# 🎨 高级特性指南

本文档介绍 FlowChart Approval 插件的高级特性和扩展功能。

## 📋 目录

- [事件系统](#事件系统)
- [性能监控](#性能监控)
- [主题系统](#主题系统)
- [布局算法](#布局算法)
- [错误处理](#错误处理)
- [工具函数](#工具函数)

---

## 🎯 事件系统

### 基本使用

流程图支持完整的事件系统，您可以监听各种事件来实现自定义功能。

```typescript
import { FlowChart, FlowChartEvents } from 'flowchart-approval';

const flowChart = new FlowChart({
  container: '#container'
});

// 监听节点添加事件
flowChart.on(FlowChartEvents.NODE_ADDED, (node) => {
  console.log('节点已添加:', node);
});

// 监听渲染完成事件
flowChart.on(FlowChartEvents.RENDER_END, () => {
  console.log('渲染完成');
});
```

### 支持的事件

#### 节点事件
- `NODE_ADDED` - 节点添加
- `NODE_REMOVED` - 节点删除
- `NODE_UPDATED` - 节点更新
- `NODE_CLICKED` - 节点点击
- `NODE_DRAG_START` - 节点拖拽开始
- `NODE_DRAG` - 节点拖拽中
- `NODE_DRAG_END` - 节点拖拽结束

#### 边事件
- `EDGE_ADDED` - 边添加
- `EDGE_REMOVED` - 边删除
- `EDGE_UPDATED` - 边更新
- `EDGE_CLICKED` - 边点击

#### 流程图事件
- `RENDER_START` - 渲染开始
- `RENDER_END` - 渲染结束
- `LAYOUT_START` - 布局开始
- `LAYOUT_END` - 布局结束
- `CLEAR` - 清空

#### 视图事件
- `ZOOM` - 缩放
- `PAN` - 平移
- `FIT_VIEW` - 适应视图

### 自定义事件管理器

```typescript
import { EventEmitter } from 'flowchart-approval';

const emitter = new EventEmitter();

// 注册监听器
emitter.on('custom-event', (data) => {
  console.log('自定义事件:', data);
});

// 触发事件
emitter.emit('custom-event', { message: 'Hello' });

// 一次性监听器
emitter.once('one-time-event', () => {
  console.log('只触发一次');
});

// 移除监听器
emitter.off('custom-event', handler);
```

---

## 📊 性能监控

### 启用性能监控

```typescript
import { PerformanceMonitor } from 'flowchart-approval';

const monitor = new PerformanceMonitor(true);

// 开始测量
monitor.startMeasure('render');
// ... 执行渲染
monitor.endMeasure('render');

// 获取性能报告
const report = monitor.generateReport();
console.log('渲染时间:', report.renderTime, 'ms');

// 打印完整报告
monitor.logReport();
```

### 性能指标

性能监控器会跟踪以下指标：

- **渲染时间** - 完整渲染周期的耗时
- **布局时间** - 布局计算的耗时
- **节点数量** - 当前节点总数
- **边数量** - 当前边总数
- **内存使用** - JavaScript 堆内存使用情况（如果浏览器支持）

### 自定义测量

```typescript
// 测量自定义操作
monitor.startMeasure('custom-operation');
// ... 执行操作
const duration = monitor.endMeasure('custom-operation');
console.log('操作耗时:', duration, 'ms');

// 使用性能标记
monitor.mark('start');
// ... 执行操作
monitor.mark('end');
const time = monitor.measure('operation', 'start', 'end');
```

---

## 🎨 主题系统

### 使用预定义主题

```typescript
import { ThemeManager, THEMES } from 'flowchart-approval';

const themeManager = new ThemeManager('dark');

// 切换主题
themeManager.setTheme('minimal');

// 获取当前主题
const theme = themeManager.getCurrentTheme();
console.log('当前主题:', theme.name);

// 获取所有可用主题
const themes = themeManager.getAvailableThemes();
console.log('可用主题:', themes);
```

### 预定义主题

1. **default** - 默认主题（彩色）
2. **dark** - 暗色主题
3. **minimal** - 简约主题（黑白）

### 自定义主题

```typescript
import { ThemeManager, NodeType } from 'flowchart-approval';

const themeManager = new ThemeManager();

// 注册自定义主题
themeManager.registerTheme('custom', {
  name: 'custom',
  nodeStyles: {
    [NodeType.START]: {
      backgroundColor: '#ff6b6b',
      borderColor: '#c92a2a',
      borderWidth: 2,
      textColor: '#fff',
      fontSize: 14,
      borderRadius: 30
    },
    // ... 其他节点类型
  },
  edgeStyle: {
    strokeColor: '#495057',
    strokeWidth: 2,
    arrowSize: 10
  },
  backgroundColor: '#f1f3f5',
  gridColor: '#dee2e6'
});

// 使用自定义主题
themeManager.setTheme('custom');
```

### 在 FlowChart 中使用主题

```typescript
const themeManager = new ThemeManager('dark');

const flowChart = new FlowChart({
  container: '#container',
  // 使用主题的样式
  nodeStyles: themeManager.getNodeStyles(),
  edgeStyle: themeManager.getEdgeStyle()
});
```

---

## 🗺️ 布局算法

### 默认布局（层级布局）

```typescript
import { FlowChart } from 'flowchart-approval';

const flowChart = new FlowChart({
  container: '#container',
  autoLayout: true,
  nodeGap: 80,
  levelGap: 120
});
```

### Dagre 布局

基于分层的有向图布局算法，适合复杂的流程图。

```typescript
import { DagreLayout } from 'flowchart-approval';

const dagreLayout = new DagreLayout({
  direction: 'TB',  // TB: 从上到下, LR: 从左到右
  nodeGap: 80,
  levelGap: 120
});

// 手动执行布局
dagreLayout.layout(nodes);
```

### 力导向布局

基于物理模拟的布局算法，适合网状结构。

```typescript
import { ForceLayout } from 'flowchart-approval';

const forceLayout = new ForceLayout({
  iterations: 100,        // 迭代次数
  nodeRepulsion: 5000,    // 节点斥力
  edgeAttraction: 0.01,   // 边吸引力
  damping: 0.9,           // 阻尼系数
  centerGravity: 0.1      // 中心引力
});

// 执行布局
forceLayout.layout(nodes);
```

### 自定义布局引擎

```typescript
// 在 FlowChart 中替换布局引擎
class MyCustomLayout {
  layout(nodes: Map<string, FlowNode>): void {
    // 实现自定义布局逻辑
  }
}

// 使用自定义布局
const customLayout = new MyCustomLayout();
// 在渲染前手动执行布局
customLayout.layout(flowChart.getAllNodes());
```

---

## ⚠️ 错误处理

### 错误类型

插件提供了多种错误类型用于更精确的错误处理：

```typescript
import {
  FlowChartError,
  NodeError,
  EdgeError,
  ValidationError,
  LayoutError,
  RenderError,
  ConfigError
} from 'flowchart-approval';

try {
  flowChart.addNode(nodeData);
} catch (error) {
  if (error instanceof NodeError) {
    console.error('节点错误:', error.message, error.nodeId);
  } else if (error instanceof ValidationError) {
    console.error('验证错误:', error.errors);
  }
}
```

### 验证数据

```typescript
import { validateNodeData, validateEdgeData } from 'flowchart-approval';

// 验证节点数据
const nodeValidation = validateNodeData(nodeData);
if (!nodeValidation.valid) {
  console.error('节点数据无效:', nodeValidation.errors);
}

// 验证边数据
const edgeValidation = validateEdgeData(edgeData);
if (!edgeValidation.valid) {
  console.error('边数据无效:', edgeValidation.errors);
}
```

### 检查循环依赖

```typescript
import { hasCycle } from 'flowchart-approval';

const nodes = flowChart.getAllNodes();
if (hasCycle(nodes)) {
  console.warn('检测到循环依赖！');
}
```

---

## 🛠️ 工具函数

### ID 生成

```typescript
import { generateId } from 'flowchart-approval';

const nodeId = generateId('node');  // node_1234567890_abc
const edgeId = generateId('edge');  // edge_1234567890_xyz
```

### 几何计算

```typescript
import { distance, midpoint, rectContainsPoint } from 'flowchart-approval';

// 计算两点距离
const dist = distance({ x: 0, y: 0 }, { x: 3, y: 4 });  // 5

// 计算中点
const mid = midpoint({ x: 0, y: 0 }, { x: 10, y: 10 });  // { x: 5, y: 5 }

// 判断点是否在矩形内
const isInside = rectContainsPoint(
  { x: 0, y: 0, width: 100, height: 100 },
  { x: 50, y: 50 }
);  // true
```

### 对象操作

```typescript
import { deepClone, merge } from 'flowchart-approval';

// 深度克隆
const cloned = deepClone(originalObject);

// 合并对象
const merged = merge(target, source1, source2);
```

### 性能优化

```typescript
import { debounce, throttle } from 'flowchart-approval';

// 防抖
const debouncedRender = debounce(() => {
  flowChart.render();
}, 300);

// 节流
const throttledUpdate = throttle(() => {
  flowChart.updateNodeStatus(id, status);
}, 100);
```

---

## 🎯 实战示例

### 示例 1：带性能监控的流程图

```typescript
import { FlowChart, PerformanceMonitor } from 'flowchart-approval';

const monitor = new PerformanceMonitor(true);
const flowChart = new FlowChart({
  container: '#container'
});

// 监听渲染事件
flowChart.on('render:start', () => {
  monitor.startMeasure('render');
});

flowChart.on('render:end', () => {
  monitor.endMeasure('render');
  monitor.logReport();
});

// 加载数据
flowChart.load(nodes, edges);
```

### 示例 2：主题切换

```typescript
import { FlowChart, ThemeManager } from 'flowchart-approval';

const themeManager = new ThemeManager('default');
let flowChart;

function initFlowChart(theme) {
  flowChart = new FlowChart({
    container: '#container',
    nodeStyles: themeManager.getNodeStyles(),
    edgeStyle: themeManager.getEdgeStyle()
  });
}

function switchTheme(themeName) {
  themeManager.setTheme(themeName);
  initFlowChart();
  flowChart.load(nodes, edges);
}

// 切换主题
switchTheme('dark');
```

### 示例 3：使用力导向布局

```typescript
import { FlowChart, ForceLayout } from 'flowchart-approval';

const flowChart = new FlowChart({
  container: '#container',
  autoLayout: false  // 禁用自动布局
});

const forceLayout = new ForceLayout({
  iterations: 200,
  nodeRepulsion: 8000
});

// 加载数据
flowChart.load(nodes, edges);

// 使用力导向布局
const allNodes = new Map();
flowChart.getAllNodes().forEach(node => {
  allNodes.set(node.id, node);
});
forceLayout.layout(allNodes);

// 渲染
flowChart.render();
```

---

## 📚 更多资源

- [README.md](./README.md) - 项目说明
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 架构文档
- [API 文档](./README.md#-api-文档)

---

Made with ❤️ by FlowChart Team

