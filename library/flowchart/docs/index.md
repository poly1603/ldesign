---
layout: home

hero:
  name: "LDesign Flowchart"
  text: "审批流程图编辑器"
  tagline: "基于 LogicFlow 的专业审批流程可视化组件"
  image:
    src: /logo.svg
    alt: LDesign Flowchart
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/flowchart

features:
  - icon: ⚡
    title: 基于 LogicFlow
    details: 基于成熟的 @logicflow/core 进行二次封装，稳定可靠
  - icon: 🔧
    title: TypeScript 支持
    details: 完整的类型定义和类型安全，提供优秀的开发体验
  - icon: 🌐
    title: 框架无关
    details: 可在 React、Vue、Angular 等任何前端框架中使用
  - icon: 📋
    title: 审批流程专用
    details: 提供审批流程特有的节点类型和功能，专为审批场景设计
  - icon: 🎨
    title: 主题系统
    details: 基于 LDESIGN 设计系统的可定制主题，支持暗色模式
  - icon: 🔌
    title: 插件机制
    details: 支持功能扩展和自定义节点，提供丰富的插件生态
  - icon: 🚀
    title: 简洁 API
    details: 提供简单易用的 API 接口，快速上手，轻松集成
  - icon: ✅
    title: 完整测试
    details: 包含 46 个单元测试和集成测试，确保代码质量
---

## 快速预览

::: code-group

```typescript [基础编辑器]
import { FlowchartAPI } from '@ldesign/flowchart'

// 使用简洁的 API 创建编辑器
const editor = FlowchartAPI.createEditor({
  container: '#flowchart-container',
  width: 800,
  height: 600,
  plugins: {
    minimap: true,
    history: true,
    export: true
  }
})

// 创建审批流程模板
const template = FlowchartAPI.createApprovalTemplate({
  title: '请假审批流程',
  steps: ['申请提交', '直属领导审批', 'HR审批', '总经理审批']
})

editor.setData(template)
```

```typescript [只读查看器]
import { FlowchartAPI } from '@ldesign/flowchart'

// 创建只读查看器
const viewer = FlowchartAPI.createViewer({
  container: '#flowchart-viewer',
  data: flowchartData
})

// 设置执行状态
viewer.setExecutionState({
  currentNode: 'approval-node-2',
  completedNodes: ['start-node', 'approval-node-1'],
  failedNodes: []
})
```

```typescript [自定义节点]
import { FlowchartAPI } from '@ldesign/flowchart'

// 快速创建节点
const approvalNode = FlowchartAPI.createNode({
  type: 'approval',
  x: 300,
  y: 200,
  text: '部门审批',
  properties: {
    approvers: ['张三', '李四'],
    deadline: '2025-12-31',
    status: 'pending'
  }
})

editor.addNode(approvalNode)
```

:::

## 核心特性

### 🎯 专业的审批节点

支持 7 种审批流程专用节点类型，满足各种审批场景需求：

- **开始节点** - 流程起始点
- **审批节点** - 支持多人审批、并行审批
- **条件节点** - 条件判断分支
- **结束节点** - 流程结束点
- **处理节点** - 一般处理步骤
- **并行网关** - 并行分支和汇聚
- **排他网关** - 互斥分支选择

### 🔌 强大的插件系统

内置 3 个实用插件，支持自定义扩展：

- **小地图插件** - 提供流程图缩略图导航
- **历史记录插件** - 支持撤销/重做操作
- **导出插件** - 支持多种格式导出（PNG、JPG、SVG、JSON、XML）

### 🎨 灵活的主题系统

基于 LDESIGN 设计系统，支持多种主题：

- **默认主题** - 清新明亮的默认风格
- **暗色主题** - 适合夜间使用的深色主题
- **蓝色主题** - 专业商务风格主题
- **自定义主题** - 支持完全自定义的主题配置

## 开发状态

::: tip 当前版本：v1.0.0 🎉
核心功能已完成，可用于生产环境！
:::

### ✅ 已完成功能

- ✅ **核心架构** - 基于 @logicflow/core 的稳定架构
- ✅ **完整类型定义** - 100% TypeScript 支持
- ✅ **7种节点类型** - 覆盖所有审批场景
- ✅ **双编辑器系统** - 编辑器 + 查看器
- ✅ **事件系统** - 完整的交互事件支持
- ✅ **主题系统** - 3种内置主题 + 自定义支持
- ✅ **插件系统** - 3个内置插件 + 扩展机制
- ✅ **简洁 API** - FlowchartAPI 统一接口
- ✅ **完整测试** - 46个测试用例全部通过
- ✅ **构建系统** - 基于 @ldesign/builder

### 🚀 即将推出

- 📋 VitePress 文档站点完善
- 🎨 更多主题选项
- 🔌 社区插件生态
- 📱 移动端适配优化
- ⚡ 性能进一步优化

## 社区与支持

- 📖 [完整文档](/guide/getting-started)
- 🎯 [在线示例](/examples/basic)
- 🐛 [问题反馈](https://github.com/ldesign/flowchart/issues)
- 💬 [讨论区](https://github.com/ldesign/flowchart/discussions)
- 📧 [邮件支持](mailto:support@ldesign.com)
