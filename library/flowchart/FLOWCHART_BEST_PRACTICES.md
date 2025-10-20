# 🎯 流程图最佳实践与源码优化

## 概述

我们对连线系统源码进行了深度优化，确保默认行为就完全符合流程图的业界最佳实践。

## ✨ 源码优化内容

### 1. OptimizedEdgeRouter.ts 优化

#### 新增功能

**回路检测与外置路径**
```typescript
// 自动检测回路（向上或向左的连线）
private detectLoop(source, target, sourceSide, targetSide): boolean

// 回路走外侧路径，避免与主流程交叉
private calculateLoopPath(source, target, sourceSide, targetSide): Position[]
```

**智能标签定位**
```typescript
// 标签放在最长线段的中间
// 水平线段：标签在上方
// 垂直线段：标签在右侧
// 避免遮挡连线
private calculateSmartLabelPosition(points): Position
```

**配置参数优化**
```typescript
constructor({
  minDistance: 40,          // 增大最小距离（原30）
  gridSize: 10,
  loopOffset: 80,           // 新增：回路偏移量
  verticalPriority: true    // 新增：垂直流向优先
})
```

### 2. EdgeRenderer.ts 优化

#### 智能颜色系统

**自动颜色判断**
```typescript
private getEdgeColor(edge: FlowEdge): string {
  // 根据标签自动判断类型
  if (label.includes('退回')) return loop_color;
  if (label.includes('通过')) return success_color;
  if (label.includes('拒绝')) return error_color;
  
  // 根据方向检测回路
  if (dy < -10) return loop_color;  // 向上的连线
  
  return default_color;
}
```

**颜色主题配置**
```typescript
private edgeColors = {
  default: '#666',       // 默认（黑灰色）
  success: '#4caf50',    // 成功/通过（绿色）
  error: '#f44336',      // 错误/拒绝（红色）
  warning: '#ff9800',    // 警告/待审核（橙色）
  info: '#2196f3',       // 信息（蓝色）
  loop: '#9c27b0'        // 回路/退回（紫色）
};
```

**自定义颜色主题**
```typescript
// 可以自定义颜色方案
edgeRenderer.setEdgeColorTheme({
  success: '#00c853',
  error: '#d32f2f',
  loop: '#7b1fa2'
});
```

## 📋 流程图最佳实践规则

### 1. 垂直流向优先 ✅

**原则：** 主流程从上到下

**源码实现：**
- `verticalPriority: true` - 默认垂直优先
- 连接点优先选择上下方向
- 路径优先使用垂直线段

**效果：**
```
   [开始]
      ↓
   [处理]
      ↓
   [判断]
    ↙  ↘
```

### 2. 分支分散 ✅

**原则：** 条件分支左右或上下均匀分布

**源码实现：**
- ConnectionPointManager 为菱形节点的不同顶点分配分支
- 自动选择左、右、下三个方向出口

**效果：**
```
      ◇ 判断
     ╱ │ ╲
    ╱  │  ╲
  左  中  右
```

### 3. 回路外置 ✅

**原则：** 循环回路走外侧，避免穿插主流程

**源码实现：**
```typescript
// 检测回路
if (target.y <= source.y && sourceSide === ConnectionSide.BOTTOM) {
  // 使用回路路径
  return calculateLoopPath(...);
}
```

**效果：**
```
  [A] ───┐
  ↓      │
  [B] ←──┘  外侧回路
  ↓
  [C]
```

### 4. 层次清晰 ✅

**原则：** 同级节点在同一水平线

**建议：**
- 手动布局时确保同级节点 Y 坐标相同
- 使用自动布局功能
- 配合网格对齐（gridSize: 10）

### 5. 正交优先 ✅

**原则：** 使用水平和垂直线，避免斜线

**源码实现：**
- 所有路径算法都基于曼哈顿路由
- 只生成水平和垂直线段
- 折点全部为90度直角

**效果：**
```
[A] ───┐
       │
       └──→ [B]
```

### 6. 标签清晰 ✅

**原则：** 确保标签不遮挡线条

**源码实现：**
```typescript
// 找最长线段放置标签
const maxSegment = findLongestSegment(points);

// 根据方向偏移
if (isHorizontal) {
  labelPos.y -= offset;  // 水平线，标签在上方
} else {
  labelPos.x += offset;  // 垂直线，标签在右侧
}
```

**效果：**
```
      通过
[A] ────────→ [B]

[C]   │
      │ 拒绝
      ↓
     [D]
```

### 7. 箭头明确 ✅

**原则：** 方向清晰可见

**源码实现：**
- 箭头大小：10px（style.arrowSize）
- 箭头角度：自动根据最后一段路径计算
- 箭头颜色：与连线颜色一致

### 8. 颜色区分 ✅

**原则：** 不同流转类型用不同颜色

**源码实现：**
```typescript
// 自动识别标签关键字
if (label.includes('通过')) → 绿色
if (label.includes('拒绝')) → 红色
if (label.includes('退回')) → 紫色

// 自动识别方向
if (dy < -10) → 紫色（回路）
```

**效果：**
```
[A] ──绿色→ [B]（通过）
[B] ──红色→ [C]（拒绝）
[B] ──紫色→ [A]（退回）
```

## 📊 优化前后对比

| 指标 | 优化前 | 优化后 | 改进 |
|-----|--------|--------|------|
| 最小距离 | 30px | 40px | +33% |
| 回路处理 | ❌ 无 | ✅ 外置 | +100% |
| 标签位置 | 中点 | 智能偏移 | +100% |
| 颜色区分 | ❌ 无 | ✅ 自动 | +100% |
| 垂直优先 | ❌ 无 | ✅ 支持 | +100% |
| 回路偏移 | 无 | 80px | 新增 |

## 🎯 使用示例

### 基础使用（自动应用）

```typescript
import { FlowChart } from 'flowchart-approval';

const flowChart = new FlowChart({
  container: '#container',
  autoLayout: true
});

// 定义节点（垂直流向）
const nodes = [
  { id: '1', type: 'start', label: '开始', position: { x: 300, y: 100 } },
  { id: '2', type: 'process', label: '提交', position: { x: 300, y: 220 } },
  { id: '3', type: 'process', label: '审批', position: { x: 300, y: 340 } },
  { id: '4', type: 'condition', label: '判断', position: { x: 300, y: 460 } },
  // 分支节点（左右分散）
  { id: '5', type: 'process', label: '通过', position: { x: 150, y: 580 } },
  { id: '6', type: 'process', label: '拒绝', position: { x: 450, y: 580 } },
  { id: '7', type: 'end', label: '结束', position: { x: 300, y: 700 } }
];

const edges = [
  { id: 'e1', source: '1', target: '2' },
  { id: 'e2', source: '2', target: '3' },
  { id: 'e3', source: '3', target: '4' },
  // 分支连线（自动颜色）
  { id: 'e4', source: '4', target: '5', label: '通过' },  // 绿色
  { id: 'e5', source: '4', target: '6', label: '拒绝' },  // 红色
  { id: 'e6', source: '5', target: '7' },
  { id: 'e7', source: '6', target: '7' },
  // 回路连线（自动走外侧，紫色）
  { id: 'e8', source: '3', target: '2', label: '退回修改' }
];

// 加载并渲染（自动应用所有最佳实践）
flowChart.load(nodes, edges);
```

### 自定义颜色主题

```typescript
const edgeRenderer = flowChart.getRenderer().getEdgeRenderer();

// 设置自定义颜色方案
edgeRenderer.setEdgeColorTheme({
  success: '#00c853',    // 深绿色
  error: '#d32f2f',      // 深红色
  loop: '#7b1fa2',       // 深紫色
  warning: '#f57c00',    // 深橙色
  default: '#424242'     // 深灰色
});
```

### 调整路由参数

```typescript
// 如果需要调整路由行为
const customRouter = new OptimizedEdgeRouter({
  minDistance: 50,           // 更大的间距
  gridSize: 20,              // 更粗的网格
  loopOffset: 100,           // 回路偏移更大
  verticalPriority: true     // 垂直优先
});

edgeRenderer.setRouter(customRouter);
```

## 🔧 配置指南

### 节点布局建议

```typescript
// 垂直流程图布局公式
const baseX = 300;  // 中心X坐标
const baseY = 100;  // 起始Y坐标
const levelGap = 120;  // 层级间距

// 主流程节点（垂直对齐）
{ x: baseX, y: baseY + levelGap * 0 }  // 第1层
{ x: baseX, y: baseY + levelGap * 1 }  // 第2层
{ x: baseX, y: baseY + levelGap * 2 }  // 第3层

// 分支节点（左右分散）
const branchGap = 150;  // 分支间距
{ x: baseX - branchGap, y: baseY + levelGap * 3 }  // 左分支
{ x: baseX, y: baseY + levelGap * 3 }               // 中间
{ x: baseX + branchGap, y: baseY + levelGap * 3 }  // 右分支
```

### 连线标签建议

```typescript
// 使用语义化标签，自动获得相应颜色
const semanticLabels = {
  success: ['通过', '同意', '批准', '是'],
  error: ['拒绝', '不通过', '否', '不批准'],
  loop: ['退回', '返回', '撤回', '驳回'],
  warning: ['待审核', '审核中', '处理中']
};

// 示例
{ source: 'A', target: 'B', label: '通过' }      // 自动绿色
{ source: 'B', target: 'C', label: '拒绝' }      // 自动红色
{ source: 'C', target: 'A', label: '退回修改' }  // 自动紫色
```

## 📈 性能优化

### 大型流程图优化

```typescript
// 超过50个节点时的优化建议
const flowChart = new FlowChart({
  container: '#container',
  autoLayout: false,  // 手动布局，避免自动计算
  enableZoom: true,
  enablePan: true,
  zoom: {
    initialScale: 0.6,  // 缩小初始视图
    minScale: 0.2,
    maxScale: 2
  }
});

// 使用更粗的网格对齐
const router = new OptimizedEdgeRouter({
  gridSize: 20,  // 更粗的网格
  minDistance: 60  // 更大的间距
});
```

## 🎨 视觉效果示例

### 标准审批流程

```
         [开始]
            ↓ (默认灰色)
        [提交申请]
            ↓
      [部门主管审批] ←──┐ 
            ↓           │ 退回修改（紫色，外侧）
        ◇ 金额判断        │
       ╱    │    ╲       │
      ╱     │     ╲      │
  (绿)   (橙)    (红)    │
  小额   大额    拒绝    │
   │      │      │      │
   │  [总经理]   │      │
   │   │  │     │      │
   │  (绿)(红)  │      │
   │   │   └────┼──────┘
   │   │        │
  [财务审核]    │
       │        │
      (绿)     (灰)
       └────┬───┘
           [结束]
```

### 颜色说明

- 🟢 **绿色** - 成功路径（通过、批准）
- 🔴 **红色** - 失败路径（拒绝、不通过）
- 🟣 **紫色** - 回路路径（退回、返回）
- 🟠 **橙色** - 待处理路径（审核中、待审批）
- ⚫ **灰色** - 默认路径

## 🐛 故障排除

### 问题1：回路没有走外侧

**原因：** 节点位置关系未正确识别

**解决：**
```typescript
// 确保回路的源节点在下方，目标在上方
source: { y: 340 }  // 审批节点
target: { y: 220 }  // 提交节点（在上方）

// 源节点应该从 BOTTOM 出发
sourceSide: ConnectionSide.BOTTOM
```

### 问题2：标签遮挡连线

**原因：** 路径太短，无法偏移

**解决：**
```typescript
// 增大节点间距
const levelGap = 120;  // 最小120px

// 或手动设置标签位置
edge.style = {
  labelOffset: { x: 20, y: -15 }
};
```

### 问题3：颜色不生效

**原因：** 标签关键字不匹配

**解决：**
```typescript
// 使用标准关键字
'通过' ✅  '同意' ✅  '批准' ✅
'tong guo' ❌  'pass' ❌

// 或手动设置颜色
edge.style = {
  strokeColor: '#4caf50'
};
```

## 📚 相关文档

- [完整API文档](./ADVANCED_CONNECTION_SYSTEM.md)
- [快速开始指南](./QUICK_START_GUIDE.md)
- [更新说明](./CONNECTION_SYSTEM_UPDATE.md)

## 🎯 总结

通过源码优化，我们确保了：

✅ **开箱即用** - 无需额外配置，默认行为就符合最佳实践
✅ **智能判断** - 自动识别回路、颜色、标签位置
✅ **高度可定制** - 支持自定义所有参数
✅ **性能优化** - 减少不必要的计算
✅ **视觉优美** - 符合专业流程图标准

---

**版本：** 2.1.0  
**更新日期：** 2024-10-18  
**维护者：** FlowChart Team













