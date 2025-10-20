# 连线系统优化总结

## 📅 优化日期
2025-01-20

## 🎯 优化目标
优化流程审批图的连线系统，使其更符合审批流程的特点，提高连线的清晰度和美观度。

## ✅ 完成的优化

### 1. ConnectionPointManager 优化
**文件**: `src/renderer/ConnectionPointManager.ts`

#### 主要改进：
- ✨ **多条出线智能分布**：当一个节点有多条出线时，自动在连接点上分散，避免重叠
- 📊 **动态偏移计算**：根据已有连接数动态计算偏移量
  - 第1条线：中心位置（offset = 0）
  - 第2条线：偏移 -0.2 相对位置
  - 第3条线：偏移 +0.2 相对位置
  - 更多线：继续按比例分散

#### 核心方法：
```typescript
// 计算边上已有的连接数
getEdgeCountOnSide(nodeId: string, side: ConnectionSide): number

// 计算多条边的偏移量
calculateOffsetForMultipleEdges(
  nodeId: string, 
  side: ConnectionSide, 
  currentCount: number,
  width: number,
  height: number
): number
```

### 2. OptimizedEdgeRouter 优化
**文件**: `src/renderer/OptimizedEdgeRouter.ts`

#### 主要改进：
- 🔄 **回路路径优化**：退回连线走更外侧（120px），避免与正向流程重叠
- 🚫 **连线避让逻辑**：检测并避免与已有路径重叠
- 📏 **增大连线间距**：最小间距从 20px 增加到 25px
- 💾 **路径缓存**：存储已渲染的路径，供后续路径避让使用

#### 核心配置：
```typescript
{
  minDistance: 50,          // 最小距离（提高清晰度）
  gridSize: 10,             // 网格对齐
  loopOffset: 120,          // 回路偏移量（走更外侧）
  verticalPriority: true,   // 垂直流向优先
  edgeSpacing: 25           // 连线之间的最小间距
}
```

#### 新增方法：
```typescript
// 应用偏移量到位置
applyOffset(pos: Position, side: ConnectionSide, offset: number): Position

// 避让现有路径
avoidExistingPaths(points: Position[], sourceSide, targetSide): Position[]

// 检查两条路径是否重叠
pathsOverlap(path1: Position[], path2: Position[]): boolean

// 检查两个线段是否平行
segmentsParallel(seg1, seg2): boolean

// 检查两个线段是否接近
segmentsClose(seg1, seg2, threshold: number): boolean

// 调整路径以避让
adjustPathToAvoid(points, existingPath, sourceSide, targetSide): Position[]

// 清空路径缓存
clear(): void

// 移除特定边的路径
removePath(edgeId: string): void
```

### 3. EdgeRenderer 增强
**文件**: `src/renderer/EdgeRenderer.ts`

#### 主要改进：
- 🔗 **传递偏移参数**：将连接点偏移量传递给路由器
- 🆔 **传递边ID**：用于路径缓存和管理
- 🧹 **清理优化**：清空时同时清理路由器缓存

#### 更新的调用：
```typescript
const result = this.optimizedRouter.route(
  connection.source,
  connection.target,
  connection.sourceSide,
  connection.targetSide,
  edge.id,                  // 新增：边ID
  connection.sourceOffset,  // 新增：源偏移量
  connection.targetOffset   // 新增：目标偏移量
);
```

## 🎨 优化效果

### 审批流程图特性支持
1. ✅ **垂直流向优先**：主流程从上到下清晰流动
2. ✅ **分支分散**：条件节点的多个分支自动左右分散
3. ✅ **回路外置**：退回、驳回等回路连线走外侧，不遮挡主流程
4. ✅ **正交连线**：使用水平和垂直线段，美观专业
5. ✅ **智能避让**：自动检测并避免连线重叠

### 连线质量提升
- 📐 **更大间距**：连线之间保持足够距离
- 🎯 **精确连接**：多条出线精确分布在节点边上
- 🔄 **清晰回路**：退回线走外侧，不与正向流程混淆
- 🎭 **视觉层次**：通过颜色和布局区分不同类型的连线

### 颜色智能判断（已有功能）
- 🟢 **成功/通过**：绿色 (#4caf50)
- 🔴 **错误/拒绝**：红色 (#f44336)
- 🟡 **警告/待审核**：橙色 (#ff9800)
- 🔵 **信息**：蓝色 (#2196f3)
- 🟣 **回路/退回**：紫色 (#9c27b0)
- ⚫ **默认**：灰色 (#666)

## 📊 性能优化
- 使用 Map 存储路径缓存，O(1) 查询
- 网格对齐减少计算量
- 路径优化移除冗余点

## 🔧 技术细节

### 参数传递链
```
EdgeRenderer.renderEdge()
  ↓
ConnectionPointManager.allocateConnectionPoints()
  → 返回 { source, target, sourceSide, targetSide, sourceOffset, targetOffset }
  ↓
OptimizedEdgeRouter.route(source, target, sourceSide, targetSide, edgeId, sourceOffset, targetOffset)
  → 应用偏移量
  → 检测回路
  → 计算路径
  → 避让现有路径
  → 返回 { points, path, labelPosition, arrowAngle }
```

### 偏移量计算公式
```typescript
// 对于第 n 条连线（n 从 0 开始）
const spacing = 0.2; // 偏移系数
if (n === 0) offset = 0;           // 中心
else if (n === 1) offset = -spacing; // 左侧
else if (n === 2) offset = spacing;  // 右侧
else offset = (n - 1) * spacing - spacing; // 继续分散
```

### 回路检测逻辑
```typescript
// 垂直流向（默认）
isLoop = target.y <= source.y && sourceSide === BOTTOM

// 水平流向
isLoop = target.x <= source.x && sourceSide === RIGHT
```

## 🧪 测试方法
1. 启动开发服务器：`cd example && npm run dev`
2. 打开浏览器访问：`http://localhost:8000`
3. 观察以下场景：
   - ✅ 审批节点的"同意"和"拒绝"分支是否左右分散
   - ✅ "退回修改"等回路线是否走外侧
   - ✅ 条件节点的多个分支是否清晰不重叠
   - ✅ 连线颜色是否正确（绿色通过、红色拒绝、紫色退回等）

## 📝 示例场景

### 场景1：审批节点多出线
```
部门主管审批
  ├─ 同意（绿色，从左侧出发）→ 金额判断
  ├─ 拒绝（红色，从右侧出发）→ 审批拒绝
  └─ 退回修改（紫色，走外侧回路）→ 提交申请
```

### 场景2：条件节点分支
```
金额判断
  ├─ 小额报销（从左侧出发）→ 财务审核
  └─ 大额报销（从右侧出发）→ 总经理审批
```

## 🔜 未来改进方向
1. 🎯 更智能的路径规划算法（A*）
2. 📐 支持曲线连接（可选）
3. 🎨 更多视觉样式选项
4. 🔍 连线碰撞检测优化
5. 💫 连线动画效果增强

## 🐛 已知问题
- ⚠️ 极端情况下（超过5条出线）可能仍有重叠，需进一步优化
- ⚠️ 复杂回路场景可能需要手动调整

## 📚 相关文档
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 系统架构
- [EDGE-INTELLIGENT-ROUTING.md](./EDGE-INTELLIGENT-ROUTING.md) - 智能路由设计
- [FLOWCHART_BEST_PRACTICES.md](./FLOWCHART_BEST_PRACTICES.md) - 流程图最佳实践

---

**优化完成时间**: 2025-01-20
**优化工具**: AI Assistant
**项目版本**: 1.0.0


