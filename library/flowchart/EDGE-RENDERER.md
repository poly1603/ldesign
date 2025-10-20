# 🔗 连线渲染器功能文档

## 📅 更新日期
2025-10-17

## 🎯 功能概述

全新的 **EdgeRenderer（连线渲染器）** 提供了强大而灵活的连线渲染能力，支持多种连线类型和动画效果，让你的流程图更加生动和专业。

---

## ✨ 主要特性

### 1️⃣ 多种连线类型

支持 **6 种**不同的连线类型，适应各种场景需求：

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| **BEZIER** | 贝塞尔曲线 | 经典的平滑曲线，适合大多数场景 |
| **STRAIGHT** | 直线 | 最简单直接的连接方式 |
| **SMOOTH** | 平滑曲线 | 水平方向优化的平滑连线 |
| **POLYLINE** | 折线 | 带圆角的折线，清晰明了 |
| **STEP** | 阶梯线 | 阶梯式连接，适合层级关系 |
| **ORTHOGONAL** | 正交线 | 直角折线，适合规整的布局 |

### 2️⃣ 丰富的动画效果

支持 **5 种**动画效果，让连线"动"起来：

| 动画 | 效果 | 说明 |
|------|------|------|
| **NONE** | 无动画 | 静态连线 |
| **FLOW** | 流动效果 | 虚线从起点流向终点 |
| **DASH** | 虚线流动 | 虚线动画，更明显 |
| **PULSE** | 脉冲效果 | 线条宽度脉动 |
| **GLOW** | 发光效果 | 透明度闪烁效果 |

### 3️⃣ 智能箭头

- ✅ 自动计算箭头方向
- ✅ 自适应连线角度
- ✅ 可自定义箭头大小
- ✅ 箭头颜色跟随连线

### 4️⃣ 圆角支持

折线和正交线支持圆角设置，让连线更加柔和美观。

### 5️⃣ 悬停效果

鼠标悬停时自动高亮，提升交互体验。

---

## 🚀 快速开始

### 基础使用

```typescript
import { FlowChart, EdgeType, EdgeAnimationType } from 'flowchart-approval';

const flowChart = new FlowChart({
  container: '#container'
});

// 添加带样式的连线
flowChart.addEdge({
  id: 'edge1',
  source: 'node1',
  target: 'node2',
  label: '审批通过',
  style: {
    type: EdgeType.POLYLINE,         // 折线
    animated: true,                   // 启用动画
    animationType: EdgeAnimationType.FLOW,  // 流动效果
    strokeColor: '#2196f3',          // 蓝色
    strokeWidth: 2,                  // 线宽
    radius: 8                        // 圆角半径
  }
});
```

### 使用不同的连线类型

```typescript
// 1. 贝塞尔曲线（默认）
{
  type: EdgeType.BEZIER,
  strokeColor: '#4caf50'
}

// 2. 直线
{
  type: EdgeType.STRAIGHT,
  strokeColor: '#f44336'
}

// 3. 折线（带圆角）
{
  type: EdgeType.POLYLINE,
  radius: 10,  // 圆角半径
  strokeColor: '#ff9800'
}

// 4. 正交线（直角折线）
{
  type: EdgeType.ORTHOGONAL,
  radius: 8,
  strokeColor: '#9c27b0'
}

// 5. 阶梯线
{
  type: EdgeType.STEP,
  strokeColor: '#00bcd4'
}

// 6. 平滑曲线
{
  type: EdgeType.SMOOTH,
  strokeColor: '#607d8b'
}
```

### 添加动画效果

```typescript
// 流动动画
{
  type: EdgeType.BEZIER,
  animated: true,
  animationType: EdgeAnimationType.FLOW,
  animationDuration: 2,  // 2秒一个周期
  strokeColor: '#2196f3'
}

// 虚线流动
{
  type: EdgeType.POLYLINE,
  animated: true,
  animationType: EdgeAnimationType.DASH,
  animationDuration: 1.5,
  strokeColor: '#4caf50'
}

// 脉冲效果
{
  type: EdgeType.STRAIGHT,
  animated: true,
  animationType: EdgeAnimationType.PULSE,
  animationDuration: 1,
  strokeColor: '#f44336'
}

// 发光效果
{
  type: EdgeType.SMOOTH,
  animated: true,
  animationType: EdgeAnimationType.GLOW,
  animationDuration: 2,
  strokeColor: '#ff9800'
}
```

---

## 📖 API 参考

### EdgeType 枚举

```typescript
enum EdgeType {
  STRAIGHT = 'straight',       // 直线
  BEZIER = 'bezier',           // 贝塞尔曲线
  SMOOTH = 'smooth',           // 平滑曲线
  POLYLINE = 'polyline',       // 折线
  STEP = 'step',               // 阶梯线
  ORTHOGONAL = 'orthogonal'    // 正交线
}
```

### EdgeAnimationType 枚举

```typescript
enum EdgeAnimationType {
  NONE = 'none',               // 无动画
  FLOW = 'flow',               // 流动效果
  DASH = 'dash',               // 虚线流动
  PULSE = 'pulse',             // 脉冲效果
  GLOW = 'glow'                // 发光效果
}
```

### EdgeStyle 接口

```typescript
interface EdgeStyle {
  // 基础样式
  strokeColor?: string;          // 线条颜色
  strokeWidth?: number;          // 线条宽度
  strokeDasharray?: string;      // 虚线样式
  arrowSize?: number;            // 箭头大小
  
  // 连线类型
  type?: EdgeType;               // 连线类型
  
  // 动画
  animated?: boolean;            // 是否启用动画
  animationType?: EdgeAnimationType;  // 动画类型
  animationDuration?: number;    // 动画持续时间（秒）
  
  // 高级选项
  radius?: number;               // 折线圆角半径
  offset?: number;               // 连线偏移量
}
```

### EdgeRenderer 类

```typescript
class EdgeRenderer {
  // 渲染连线
  renderEdge(
    edge: FlowEdge,
    container: SVGGElement,
    style: EdgeStyle,
    onClick?: (edge: FlowEdge) => void
  ): SVGGElement;
  
  // 移除连线
  removeEdge(edgeId: string): void;
  
  // 清空所有连线
  clear(): void;
  
  // 获取连线元素
  getEdgeElement(edgeId: string): SVGGElement | undefined;
}
```

---

## 🎨 实战示例

### 示例 1: 审批流程图

```typescript
const flowChart = new FlowChart({
  container: '#container'
});

// 节点
const nodes = [
  { id: 'start', type: NodeType.START, label: '发起', position: { x: 0, y: 0 } },
  { id: 'review', type: NodeType.APPROVAL, label: '审批', position: { x: 200, y: 0 } },
  { id: 'end', type: NodeType.END, label: '完成', position: { x: 400, y: 0 } }
];

// 连线（使用流动动画表示流程进度）
const edges = [
  {
    id: 'e1',
    source: 'start',
    target: 'review',
    style: {
      type: EdgeType.POLYLINE,
      animated: true,
      animationType: EdgeAnimationType.FLOW,
      strokeColor: '#2196f3',
      strokeWidth: 2,
      radius: 8
    }
  },
  {
    id: 'e2',
    source: 'review',
    target: 'end',
    style: {
      type: EdgeType.POLYLINE,
      animated: true,
      animationType: EdgeAnimationType.FLOW,
      strokeColor: '#4caf50',
      strokeWidth: 2,
      radius: 8
    }
  }
];

flowChart.load(nodes, edges);
```

### 示例 2: 条件分支

```typescript
// 条件分支使用不同颜色和样式
const edges = [
  {
    id: 'condition-yes',
    source: 'condition',
    target: 'approve',
    label: '通过',
    style: {
      type: EdgeType.ORTHOGONAL,
      strokeColor: '#4caf50',
      strokeWidth: 2,
      radius: 8
    }
  },
  {
    id: 'condition-no',
    source: 'condition',
    target: 'reject',
    label: '拒绝',
    style: {
      type: EdgeType.ORTHOGONAL,
      strokeColor: '#f44336',
      strokeWidth: 2,
      radius: 8
    }
  }
];
```

### 示例 3: 数据流动可视化

```typescript
// 使用动画表示数据流动
const edges = [
  {
    id: 'data-flow',
    source: 'source',
    target: 'target',
    label: '数据传输',
    style: {
      type: EdgeType.SMOOTH,
      animated: true,
      animationType: EdgeAnimationType.DASH,
      animationDuration: 1,
      strokeColor: '#00bcd4',
      strokeWidth: 3
    }
  }
];
```

### 示例 4: 强调重要路径

```typescript
// 使用脉冲效果强调关键路径
const edges = [
  {
    id: 'critical-path',
    source: 'start',
    target: 'end',
    label: '关键路径',
    style: {
      type: EdgeType.STRAIGHT,
      animated: true,
      animationType: EdgeAnimationType.PULSE,
      animationDuration: 1.5,
      strokeColor: '#ff5722',
      strokeWidth: 3
    }
  }
];
```

---

## 🎯 最佳实践

### 1. 连线类型选择

- **简单流程**: 使用 `BEZIER` 或 `SMOOTH`，美观大方
- **规整布局**: 使用 `ORTHOGONAL` 或 `POLYLINE`，整齐清晰
- **层级关系**: 使用 `STEP`，层次分明
- **最短路径**: 使用 `STRAIGHT`，简洁明了

### 2. 动画使用建议

- **进度指示**: 使用 `FLOW` 动画表示流程进行中
- **数据传输**: 使用 `DASH` 动画表示数据流动
- **重点提示**: 使用 `PULSE` 或 `GLOW` 突出重要连线
- **性能考虑**: 避免同时使用过多动画

### 3. 颜色搭配

```typescript
// 推荐的颜色方案
const colorScheme = {
  success: '#4caf50',    // 成功/通过
  error: '#f44336',      // 失败/拒绝
  warning: '#ff9800',    // 警告/待处理
  info: '#2196f3',       // 信息/进行中
  default: '#666'        // 默认
};
```

### 4. 圆角设置

```typescript
// 推荐的圆角大小
{
  radius: 8   // 一般折线
  radius: 12  // 大圆角
  radius: 4   // 小圆角
}
```

---

## 🔄 从旧版本迁移

### 旧版本（仅支持贝塞尔曲线）

```typescript
flowChart.addEdge({
  id: 'edge1',
  source: 'node1',
  target: 'node2',
  style: {
    strokeColor: '#666',
    strokeWidth: 2
  }
});
```

### 新版本（支持多种类型）

```typescript
flowChart.addEdge({
  id: 'edge1',
  source: 'node1',
  target: 'node2',
  style: {
    type: EdgeType.POLYLINE,      // 🆕 指定类型
    animated: true,                // 🆕 启用动画
    animationType: EdgeAnimationType.FLOW,  // 🆕 动画类型
    strokeColor: '#666',
    strokeWidth: 2,
    radius: 8                      // 🆕 圆角半径
  }
});
```

**注意**: 旧的配置仍然兼容，默认使用贝塞尔曲线。

---

## 🎬 在线演示

查看 `example/edge-demo.html` 获取完整的交互式演示：

```bash
# 安装依赖
npm run example:install

# 运行演示
npm run example:dev

# 在浏览器中打开
# http://localhost:3000/edge-demo.html
```

---

## 🐛 常见问题

### Q: 如何禁用动画？

A: 设置 `animated: false` 或不设置 `animated` 属性。

```typescript
{
  type: EdgeType.POLYLINE,
  animated: false  // 或者省略这行
}
```

### Q: 动画太快或太慢？

A: 调整 `animationDuration` 参数（单位：秒）。

```typescript
{
  animated: true,
  animationType: EdgeAnimationType.FLOW,
  animationDuration: 3  // 3秒一个周期
}
```

### Q: 折线的圆角太大或太小？

A: 调整 `radius` 参数。

```typescript
{
  type: EdgeType.POLYLINE,
  radius: 12  // 调整圆角大小
}
```

### Q: 如何实现虚线效果？

A: 使用 `strokeDasharray` 属性。

```typescript
{
  strokeDasharray: '5 5'  // 5px 实线，5px 空白
}
```

### Q: 能否自定义箭头样式？

A: 当前版本箭头会自动适配连线颜色，大小可通过 `arrowSize` 调整。

```typescript
{
  arrowSize: 12  // 箭头大小
}
```

---

## 📚 相关文档

- [README.md](./README.md) - 项目主文档
- [FEATURES.md](./FEATURES.md) - 高级特性
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始

---

## 🎉 总结

**EdgeRenderer** 为流程图连线提供了：

✅ **6 种连线类型** - 适应各种场景  
✅ **5 种动画效果** - 让流程图动起来  
✅ **智能箭头** - 自动适配方向和颜色  
✅ **圆角支持** - 更加美观柔和  
✅ **悬停效果** - 提升交互体验  
✅ **完全兼容** - 无缝集成到现有项目  

开始使用 EdgeRenderer，让你的流程图更加生动、专业！

---

*最后更新: 2025-10-17*  
*版本: 1.1.0*










