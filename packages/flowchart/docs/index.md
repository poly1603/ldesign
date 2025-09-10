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

## 快速开始

### 安装

```bash
pnpm add @ldesign/flowchart
```

### 基础使用

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

## 节点类型

### 控制节点
- **开始节点** - 流程的起始点
- **结束节点** - 流程的结束点

### 处理节点
- **处理节点** - 一般的处理步骤
- **决策节点** - 条件判断分支
- **审批节点** - OA系统专用的审批节点

## 示例

### 基础编辑器

```typescript
import { FlowchartEditor } from '@ldesign/flowchart';

const editor = new FlowchartEditor({
  container: document.getElementById('editor'),
  toolbar: true,
  propertyPanel: true
});
```

### 只读预览器

```typescript
import { FlowchartViewer } from '@ldesign/flowchart';

const viewer = new FlowchartViewer({
  container: document.getElementById('viewer'),
  data: flowchartData,
  readonly: true
});
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

## 贡献

欢迎贡献代码！请查看 [贡献指南](./guide/contributing) 了解详细信息。

## 许可证

MIT License
