# 🏗️ 项目架构说明

## 📂 目录结构

```
src/
├── core/                  # 核心业务逻辑
│   ├── FlowChart.ts       # 流程图主类，管理整个流程图
│   ├── Node.ts            # 节点类，封装节点数据和行为
│   └── Edge.ts            # 边类，封装连线数据和行为
│
├── layout/                # 布局模块
│   └── LayoutEngine.ts    # 自动布局算法，负责节点位置计算
│
├── renderer/              # 渲染模块
│   └── Renderer.ts        # SVG渲染器，负责图形绘制
│
├── types/                 # 类型定义模块
│   └── index.ts           # 所有TypeScript类型和接口
│
└── index.ts               # 主入口，导出公共API
```

## 🎯 模块职责

### 1. Core（核心模块）

#### FlowChart.ts - 流程图主类
- **职责**：流程图的核心控制器
- **功能**：
  - 管理节点和边的增删改查
  - 协调布局引擎和渲染器
  - 提供验证、导入导出等高级功能
  - 事件管理和回调处理

#### Node.ts - 节点类
- **职责**：封装单个节点的数据和行为
- **功能**：
  - 存储节点属性（ID、类型、标签、位置、状态等）
  - 管理节点连接关系（输入/输出节点）
  - 提供节点更新、克隆、序列化等方法

#### Edge.ts - 边类
- **职责**：封装连线的数据和行为
- **功能**：
  - 存储边属性（源节点、目标节点、标签、条件等）
  - 提供边更新、序列化等方法

### 2. Layout（布局模块）

#### LayoutEngine.ts - 布局引擎
- **职责**：计算节点的最优位置
- **功能**：
  - 层级遍历算法，计算节点层级
  - 自动布局算法，分配节点坐标
  - 支持横向（LR）和纵向（TB）布局
  - 可配置节点间距和层级间距

**算法说明**：
1. 从起始节点开始进行BFS遍历
2. 为每个节点分配层级（level）
3. 在每个层级内均匀分布节点
4. 计算最终坐标位置

### 3. Renderer（渲染模块）

#### Renderer.ts - SVG渲染器
- **职责**：将数据渲染为可视化图形
- **功能**：
  - 创建和管理SVG画布
  - 渲染不同类型的节点形状
  - 绘制连线和箭头
  - 处理视图变换（缩放、平移）
  - 适应视图（fitView）

**支持的节点形状**：
- START/END：圆角矩形（椭圆）
- CONDITION：菱形
- 其他：普通矩形

### 4. Types（类型模块）

#### index.ts - 类型定义
- **职责**：提供完整的TypeScript类型定义
- **内容**：
  - 枚举：NodeType、NodeStatus
  - 接口：NodeData、EdgeData、Position、Size等
  - 配置：FlowChartConfig、LayoutConfig、RenderConfig

## 🔄 数据流

```
用户操作
   ↓
FlowChart（核心控制）
   ↓
├─→ Node/Edge（数据管理）
├─→ LayoutEngine（位置计算）
└─→ Renderer（视图渲染）
   ↓
SVG画布
```

## 🎨 设计模式

### 1. 单一职责原则（SRP）
每个类只负责一个功能领域：
- FlowChart：流程图管理
- Node：节点数据
- Edge：边数据
- LayoutEngine：布局计算
- Renderer：视图渲染

### 2. 开闭原则（OCP）
- 通过接口和配置开放扩展
- 核心逻辑对修改封闭
- 易于添加新的节点类型和布局算法

### 3. 依赖倒置原则（DIP）
- 通过类型接口定义契约
- 模块间通过接口通信
- 降低耦合度

## 📊 类图关系

```
FlowChart
   ├── has many ─→ Node
   ├── has many ─→ Edge
   ├── uses ─────→ LayoutEngine
   └── uses ─────→ Renderer

Edge
   ├── has ──────→ Node (source)
   └── has ──────→ Node (target)

Node
   ├── has many ─→ Node (inputs)
   └── has many ─→ Node (outputs)
```

## 🚀 扩展性

### 添加新节点类型

1. 在 `types/index.ts` 添加枚举值：
```typescript
export enum NodeType {
  // 现有类型...
  CUSTOM = 'custom'  // 新增
}
```

2. 在 `core/FlowChart.ts` 添加样式：
```typescript
private getDefaultNodeStyles() {
  return {
    // 现有样式...
    [NodeType.CUSTOM]: { /* 自定义样式 */ }
  };
}
```

3. 在 `renderer/Renderer.ts` 添加形状（可选）：
```typescript
private createNodeShape(type: NodeType, ...) {
  switch (type) {
    // 现有形状...
    case NodeType.CUSTOM:
      // 自定义形状绘制逻辑
      break;
  }
}
```

### 添加新布局算法

1. 在 `layout/` 目录创建新文件：
```typescript
// layout/CustomLayoutEngine.ts
export class CustomLayoutEngine {
  public layout(nodes: Map<string, FlowNode>): void {
    // 自定义布局逻辑
  }
}
```

2. 在 `core/FlowChart.ts` 中使用：
```typescript
import { CustomLayoutEngine } from '../layout/CustomLayoutEngine';

constructor(config) {
  this.layoutEngine = new CustomLayoutEngine(config);
}
```

### 添加新渲染器

1. 在 `renderer/` 目录创建新文件：
```typescript
// renderer/CanvasRenderer.ts
export class CanvasRenderer {
  // 使用Canvas代替SVG
}
```

2. 实现相同的渲染接口
3. 在 FlowChart 中切换使用

## 💡 最佳实践

### 1. 模块化
- 每个模块独立，职责明确
- 通过接口通信，降低耦合

### 2. 类型安全
- 完整的TypeScript类型定义
- 编译时捕获错误

### 3. 可测试性
- 单一职责使得单元测试更容易
- 依赖注入便于mock

### 4. 可维护性
- 清晰的目录结构
- 详细的代码注释
- 统一的命名规范

## 🔧 开发建议

### 修改现有功能
1. 找到对应的模块目录
2. 修改相应的类文件
3. 运行 `npm run example:dev` 实时预览

### 添加新功能
1. 确定功能所属模块
2. 在对应目录创建新文件
3. 更新类型定义（如需要）
4. 在主入口导出（如需要）

### 优化性能
- **布局**：优化 `LayoutEngine.ts` 中的算法
- **渲染**：优化 `Renderer.ts` 中的SVG操作
- **数据**：优化 `FlowChart.ts` 中的数据结构

## 📚 相关文档

- [README.md](README.md) - 使用文档
- [QUICKSTART.md](QUICKSTART.md) - 快速开始
- [INSTALL.md](INSTALL.md) - 安装指南

---

这个架构设计注重**模块化**、**可扩展性**和**可维护性**，让代码易于理解和修改。












