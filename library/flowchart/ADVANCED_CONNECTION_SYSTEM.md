# 🎯 高级连线系统文档

## 概述

我们参考 **bpmn.js** 的连线系统，对流程图的连线功能进行了全面优化，实现了：

1. ✅ **智能连接点管理** - 连线从节点边框中间开始/结束
2. ✅ **最少折点路由** - 自动计算最优路径，减少不必要的折点
3. ✅ **特殊形状优化** - 菱形、三角形等节点每个角只有一根连线
4. ✅ **连接点拖拽** - 支持拖拽改变连线的起始/结束位置
5. ✅ **折点拖拽** - 支持拖拽调整连线路径的折点

## 核心组件

### 1. ConnectionPointManager（连接点管理器）

负责管理所有节点的连接点，确保连线从节点边框的正确位置连接。

**特性：**
- 支持不同节点形状（矩形、菱形、圆形）
- 智能分配连接点，避免重复使用
- 菱形节点每个角只允许一根连线
- 自动选择最佳连接方向

**主要API：**

```typescript
// 为节点更新连接点
connectionPointManager.updateNodeConnectionPoints(node, width, height);

// 为边分配连接点
const connection = connectionPointManager.allocateConnectionPoints(
  edge,
  sourceNode,
  targetNode,
  width,
  height
);

// 释放边的连接点
connectionPointManager.releaseEdgeConnectionPoints(edgeId);
```

### 2. OptimizedEdgeRouter（优化路由器）

实现智能路径算法，确保连线使用最少的折点。

**路由策略：**
- **直连** - 0个折点（相对边且距离足够）
- **Z型路径** - 1个折点（相对边）
- **L型路径** - 1个折点（垂直边）
- **U型路径** - 3个折点（回折情况）

**主要API：**

```typescript
const result = optimizedRouter.route(
  sourcePos,
  targetPos,
  sourceSide,
  targetSide
);

// result 包含：
// - points: 路径关键点
// - path: SVG路径字符串
// - labelPosition: 标签位置
// - arrowAngle: 箭头角度
```

### 3. EdgeInteraction（连线交互管理器）

提供连线的交互功能，包括拖拽连接点和折点。

**交互功能：**
- 拖拽折点调整路径
- 拖拽连接点改变连接位置
- 双击折点删除
- 在路径上点击添加折点

**主要API：**

```typescript
const edgeInteraction = new EdgeInteraction({
  onWaypointDrag: (edgeId, index, position) => {
    // 处理折点拖拽
  },
  onAnchorDrag: (edgeId, isSource, position) => {
    // 处理锚点拖拽
  },
  onWaypointAdd: (edgeId, position, index) => {
    // 处理添加折点
  },
  onWaypointDelete: (edgeId, index) => {
    // 处理删除折点
  }
});

// 创建交互元素
edgeInteraction.createInteractionElements(
  edgeId,
  pathPoints,
  svgGroup,
  svgElement
);
```

## 使用示例

### 基础使用

```typescript
import { FlowChart } from 'flowchart-approval';

const flowChart = new FlowChart({
  container: '#flowchart-container',
  autoLayout: true,
  // 启用新的连线系统（默认已启用）
});

// 添加节点
const nodes = [
  {
    id: 'start',
    type: 'start',
    label: '开始',
    position: { x: 200, y: 100 }
  },
  {
    id: 'condition',
    type: 'condition',
    label: '判断条件',
    position: { x: 200, y: 200 }
  },
  {
    id: 'process1',
    type: 'process',
    label: '处理流程1',
    position: { x: 100, y: 300 }
  },
  {
    id: 'process2',
    type: 'process',
    label: '处理流程2',
    position: { x: 300, y: 300 }
  },
  {
    id: 'end',
    type: 'end',
    label: '结束',
    position: { x: 200, y: 400 }
  }
];

// 添加连线
const edges = [
  { id: 'e1', source: 'start', target: 'condition' },
  { id: 'e2', source: 'condition', target: 'process1', label: '是' },
  { id: 'e3', source: 'condition', target: 'process2', label: '否' },
  { id: 'e4', source: 'process1', target: 'end' },
  { id: 'e5', source: 'process2', target: 'end' }
];

flowChart.load(nodes, edges);
```

### 启用交互功能

```typescript
import { FlowChartEditor } from 'flowchart-approval';

const editor = new FlowChartEditor({
  container: '#flowchart-editor',
  mode: 'edit',  // 编辑模式
  enableNodeDrag: true,
  enableEdgeInteraction: true  // 启用连线交互
});

// 连线交互事件
editor.on('edge:waypoint:drag', ({ edgeId, index, position }) => {
  console.log('折点被拖动:', edgeId, index, position);
});

editor.on('edge:anchor:drag', ({ edgeId, isSource, position }) => {
  console.log('连接点被拖动:', edgeId, isSource, position);
});

editor.on('edge:waypoint:add', ({ edgeId, position, index }) => {
  console.log('添加折点:', edgeId, position, index);
});

editor.on('edge:waypoint:delete', ({ edgeId, index }) => {
  console.log('删除折点:', edgeId, index);
});
```

### 自定义连接点

```typescript
import { ConnectionPointManager } from 'flowchart-approval';

// 获取连接点管理器
const connectionManager = flowChart.getRenderer().getEdgeRenderer().getConnectionPointManager();

// 为自定义节点类型注册形状
class TriangleShape {
  getConnectionPoints(node, width, height) {
    // 三角形的三个顶点作为连接点
    return [
      { side: 'top', position: { x: node.position.x, y: node.position.y - height/2 } },
      { side: 'left', position: { x: node.position.x - width/2, y: node.position.y + height/2 } },
      { side: 'right', position: { x: node.position.x + width/2, y: node.position.y + height/2 } }
    ];
  }
  
  getConnectionPoint(node, width, height, side, offset) {
    // 返回指定边的连接点
    // ...
  }
}

connectionManager.registerShape('triangle', new TriangleShape());
```

## 连接点分配策略

### 1. 矩形节点

矩形节点有4个主要连接点（上、右、下、左的中心点），根据目标节点的相对位置自动选择最佳连接点。

```
        ↑ top
        |
   ← left  right →
        |
      ↓ bottom
```

### 2. 菱形节点（条件节点）

菱形节点只在4个顶点处提供连接点，每个顶点只允许连接一条线。

```
       ◇ top
      ╱ ╲
 left ◇   ◇ right
      ╲ ╱
       ◇ bottom
```

如果某个顶点已被占用，系统会自动选择其他可用的顶点。

### 3. 圆形节点（开始/结束节点）

圆形节点提供8个均匀分布的连接点，优先使用4个主方向。

```
    ◉ ◉ ◉
   ◉     ◉
   ◉     ◉
    ◉ ◉ ◉
```

## 路径路由算法

### 相对边路由

当源节点和目标节点的连接边相对时（如 right → left）：

1. **直连** - 如果对齐且距离足够：
   ```
   [A] ────────→ [B]
   ```

2. **Z型** - 如果有足够的水平/垂直空间：
   ```
   [A] ───┐
          │
          └──→ [B]
   ```

3. **U型** - 需要回折时：
   ```
   [A] ───┐
          │
          │  ┌──→ [B]
          └──┘
   ```

### 垂直边路由

当连接边垂直时（如 right → top），使用L型路径：

```
[A] ───┐
       │
       ↓
      [B]
```

### 同向边路由

当连接边同向时（如 right → right），绕过节点：

```
      ┌─────┐
[A] ──┤     │
      │     ├──→ [B]
      └─────┘
```

## 性能优化

### 1. 路径点优化

自动移除共线的点，减少路径复杂度：

```
优化前: A → B → C → D (4个点)
优化后: A → D (2个点)  // 如果B、C在直线上
```

### 2. 网格对齐

路径点对齐到网格，提高视觉一致性：

```typescript
const router = new OptimizedEdgeRouter({
  gridSize: 10  // 对齐到10px网格
});
```

### 3. 连接点缓存

连接点管理器缓存节点的连接点，避免重复计算。

## 交互体验

### 视觉反馈

- **折点悬停** - 圆形，蓝色边框
- **连接点悬停** - 菱形，绿色边框
- **拖拽时** - 保持高亮状态
- **可编辑提示** - 鼠标指针变为移动样式

### 操作指南

1. **移动折点**：鼠标悬停在折点上，按住左键拖动
2. **移动连接点**：鼠标悬停在连接点上，按住左键拖动到新的节点
3. **删除折点**：双击折点
4. **添加折点**：在连线上点击（未实现，可扩展）

## 扩展性

### 自定义节点形状

实现 `NodeShape` 接口来支持自定义节点形状：

```typescript
interface NodeShape {
  // 获取所有连接点
  getConnectionPoints(
    node: FlowNode,
    width: number,
    height: number
  ): ConnectionPoint[];
  
  // 获取指定边的连接点
  getConnectionPoint(
    node: FlowNode,
    width: number,
    height: number,
    side: ConnectionSide,
    offset?: number
  ): Position;
}
```

### 自定义路由算法

可以继承 `OptimizedEdgeRouter` 类并重写路由方法：

```typescript
class CustomRouter extends OptimizedEdgeRouter {
  protected calculateOptimalPath(
    source: Position,
    target: Position,
    sourceSide: ConnectionSide,
    targetSide: ConnectionSide
  ): Position[] {
    // 自定义路由逻辑
    return customPathPoints;
  }
}
```

## 对比 bpmn.js

| 特性 | 本系统 | bpmn.js |
|-----|--------|---------|
| 智能连接点 | ✅ | ✅ |
| 折点拖拽 | ✅ | ✅ |
| 连接点拖拽 | ✅ | ✅ |
| 最少折点优化 | ✅ | ✅ |
| 菱形节点优化 | ✅ | ✅ |
| 网格对齐 | ✅ | ✅ |
| 曼哈顿路由 | ✅ | ✅ |
| 避障算法 | 🔄（规划中） | ✅ |

## 已知限制

1. **避障功能** - 当前版本不支持自动避开其他节点，需要手动调整
2. **多点连接** - 不支持一条边连接多个节点（未来版本考虑）
3. **曲线路径** - 当前只支持直角路径，不支持曲线（可通过设置圆角半径实现平滑）

## 最佳实践

### 1. 节点布局

- 保持节点之间有足够的间距（建议至少100px）
- 尽量使用垂直或水平布局，避免斜向
- 条件节点的分支尽量左右或上下分布

### 2. 连线设置

```typescript
// 推荐的连线样式
const edgeStyle = {
  type: 'orthogonal',  // 使用正交线
  strokeWidth: 2,
  strokeColor: '#666',
  arrowSize: 10
};
```

### 3. 性能优化

- 大型流程图（>100个节点）时，禁用实时交互
- 使用节点虚拟化技术
- 延迟渲染非可见区域的连线

## 示例场景

### 复杂审批流程

```typescript
const nodes = [
  { id: '1', type: 'start', label: '申请人提交' },
  { id: '2', type: 'process', label: '部门主管审批' },
  { id: '3', type: 'condition', label: '金额判断' },
  { id: '4', type: 'process', label: '财务审核' },
  { id: '5', type: 'process', label: '总经理审批' },
  { id: '6', type: 'parallel', label: '并行会签' },
  { id: '7', type: 'process', label: 'HR审批' },
  { id: '8', type: 'process', label: '法务审批' },
  { id: '9', type: 'merge', label: '汇总结果' },
  { id: '10', type: 'end', label: '流程结束' }
];

// 系统会自动：
// 1. 为菱形节点分配不同的顶点
// 2. 计算最短路径
// 3. 避免线条交叉（尽可能）
```

## 故障排除

### 连线显示异常

1. 检查节点位置是否正确
2. 确认节点尺寸配置
3. 查看浏览器控制台是否有错误

### 拖拽不生效

1. 确认已启用交互模式
2. 检查 SVG 元素是否正确传递
3. 验证事件监听是否正常

### 连接点冲突

1. 菱形节点的连接点可能已被占用
2. 尝试手动调整节点位置
3. 考虑增加中间节点

## 未来计划

- [ ] 自动避障算法
- [ ] 多段样式（部分虚线、部分实线）
- [ ] 连线动画增强
- [ ] 智能标签定位
- [ ] 连线分组
- [ ] 快捷键支持

## 相关资源

- [bpmn.js 官方文档](https://bpmn.io/toolkit/bpmn-js/)
- [draw.io 连线算法](https://github.com/jgraph/drawio)
- [ReactFlow 连接系统](https://reactflow.dev/)

---

© 2024 FlowChart Advanced Connection System













