# ApprovalFlow 项目总结

## 项目概述

ApprovalFlow 是一个基于 LogicFlow 的审批流程图编辑器，专为构建审批流程管理系统而设计。

**包名**: `@ldesign/approval-flow`
**版本**: 1.0.0
**作者**: ldesign
**许可证**: MIT

## 核心特性

### 1. 丰富的节点类型

- ✅ **开始节点** (StartNode) - 流程起点，圆形绿色
- ✅ **审批节点** (ApprovalNode) - 支持多种审批模式，矩形蓝色
- ✅ **条件节点** (ConditionNode) - 条件分支判断，菱形橙色
- ✅ **并行节点** (ParallelNode) - 并行任务执行，矩形紫色
- ✅ **抄送节点** (CCNode) - 消息通知抄送，矩形青色
- ✅ **结束节点** (EndNode) - 流程终点，圆形红色

### 2. 审批模式

- ✅ **单人审批** (single) - 只需一人审批
- ✅ **会签** (all) - 所有人都需审批
- ✅ **或签** (any) - 任意一人审批即可
- ✅ **顺序审批** (sequence) - 按顺序依次审批

### 3. 框架支持

- ✅ **Vue 3** - 提供组件和 Composition API
  - `<ApprovalFlow>` 组件
  - `useApprovalFlow()` Hook
- ✅ **React** - 提供组件和 Hooks
  - `<ApprovalFlow>` 组件
  - `useApprovalFlow()` Hook
- ✅ **原生 JavaScript** - 核心 API
  - `ApprovalFlowEditor` 类

### 4. 配置选项

- ✅ 基础配置（容器、尺寸、只读模式）
- ✅ 网格配置（显示、大小、类型）
- ✅ 缩放配置（最小/最大/默认缩放）
- ✅ 工具栏配置（位置、工具列表）
- ✅ 小地图配置（显示、位置）
- ✅ 主题配置（名称、颜色）
- ✅ 键盘快捷键配置
- ✅ 对齐线配置

### 5. 事件系统

- ✅ 节点事件（click、dblclick、add、delete、update）
- ✅ 边事件（click、add、delete）
- ✅ 数据事件（data:change）
- ✅ 画布事件（canvas:zoom）
- ✅ 选中事件（selection:change）

### 6. 核心功能

- ✅ 数据管理（setData、getData）
- ✅ 节点操作（addNode、updateNode、deleteNode）
- ✅ 边操作（deleteEdge）
- ✅ 验证功能（validate）
- ✅ 只读模式（setReadonly）
- ✅ 缩放操作（zoom、zoomIn、zoomOut、fit、resetZoom）
- ✅ 历史操作（undo、redo）
- ✅ 导入导出（export）
- ✅ 清空销毁（clear、destroy）

### 7. 验证规则

- ✅ 检查开始节点存在性和唯一性
- ✅ 检查结束节点存在性
- ✅ 检查审批节点审批人配置
- ✅ 检查条件节点条件配置
- ✅ 检查节点连接合法性
- ✅ 检查孤立节点

## 项目结构

```
flowchart/
├── src/                          # 源代码
│   ├── core/                     # 核心模块
│   │   └── ApprovalFlowEditor.ts # 编辑器核心类
│   ├── nodes/                    # 节点类型
│   │   ├── StartNode.ts          # 开始节点
│   │   ├── EndNode.ts            # 结束节点
│   │   ├── ApprovalNode.ts       # 审批节点
│   │   ├── ConditionNode.ts      # 条件节点
│   │   ├── ParallelNode.ts       # 并行节点
│   │   ├── CCNode.ts             # 抄送节点
│   │   └── index.ts              # 节点注册
│   ├── styles/                   # 样式文件
│   │   └── index.css             # 主样式
│   ├── types/                    # 类型定义
│   │   └── index.ts              # 类型导出
│   ├── index.ts                  # 主入口
│   ├── vue.ts                    # Vue 适配器
│   └── react.tsx                 # React 适配器
├── __tests__/                    # 测试文件
│   ├── ApprovalFlowEditor.test.ts # 编辑器测试
│   └── setup.ts                  # 测试配置
├── docs/                         # 文档
│   ├── .vitepress/               # VitePress 配置
│   │   └── config.ts             # 文档配置
│   ├── guide/                    # 指南文档
│   │   ├── introduction.md       # 介绍
│   │   ├── getting-started.md    # 快速开始
│   │   ├── installation.md       # 安装
│   │   ├── node-types.md         # 节点类型
│   │   ├── configuration.md      # 配置选项
│   │   ├── events.md             # 事件系统
│   │   └── data-format.md        # 数据格式
│   ├── api/                      # API 文档
│   │   └── editor.md             # 编辑器 API
│   └── index.md                  # 首页
├── examples/                     # 示例项目
│   └── vue-demo/                 # Vue 示例
│       ├── src/
│       │   ├── App.vue           # 主应用
│       │   ├── main.ts           # 入口文件
│       │   └── style.css         # 样式
│       ├── index.html            # HTML 模板
│       ├── package.json          # 依赖配置
│       ├── tsconfig.json         # TS 配置
│       └── vite.config.ts        # Vite 配置
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── vite.config.ts                # Vite 构建配置
├── vitest.config.ts              # Vitest 测试配置
├── README.md                     # 项目说明
├── LICENSE                       # 许可证
├── CHANGELOG.md                  # 更新日志
├── .gitignore                    # Git 忽略
├── .npmignore                    # NPM 忽略
└── .editorconfig                 # 编辑器配置
```

## 技术栈

### 核心依赖
- **LogicFlow** ^1.2.27 - 流程图编辑底层框架
- **TypeScript** ^5.3.0 - 类型系统

### 构建工具
- **Vite** ^5.0.0 - 构建工具
- **Vitest** ^1.0.0 - 单元测试

### 文档工具
- **VitePress** ^1.0.0 - 文档生成

### 框架支持
- **Vue** ^3.4.0 - Vue 3 适配
- **React** ^18.2.0 - React 适配

## 使用示例

### Vue 3 使用

```vue
<template>
  <ApprovalFlow
    :data="flowData"
    :readonly="false"
    @node:click="handleNodeClick"
  />
</template>

<script setup>
import { ref } from 'vue';
import { ApprovalFlow } from '@ldesign/approval-flow/vue';

const flowData = ref({
  nodes: [
    { id: '1', type: 'start', name: '开始' },
    { id: '2', type: 'approval', name: '审批' },
    { id: '3', type: 'end', name: '结束' },
  ],
  edges: [
    { id: 'e1', sourceNodeId: '1', targetNodeId: '2' },
    { id: 'e2', sourceNodeId: '2', targetNodeId: '3' },
  ],
});
</script>
```

### React 使用

```tsx
import { ApprovalFlow } from '@ldesign/approval-flow/react';

function App() {
  const flowData = {
    nodes: [
      { id: '1', type: 'start', name: '开始' },
      { id: '2', type: 'approval', name: '审批' },
      { id: '3', type: 'end', name: '结束' },
    ],
    edges: [
      { id: 'e1', sourceNodeId: '1', targetNodeId: '2' },
      { id: 'e2', sourceNodeId: '2', targetNodeId: '3' },
    ],
  };

  return <ApprovalFlow data={flowData} />;
}
```

### 原生 JavaScript 使用

```js
import { ApprovalFlowEditor } from '@ldesign/approval-flow';

const editor = new ApprovalFlowEditor({
  container: '#editor',
  width: '100%',
  height: '600px',
});

editor.setData({
  nodes: [
    { id: '1', type: 'start', name: '开始' },
    { id: '2', type: 'approval', name: '审批' },
    { id: '3', type: 'end', name: '结束' },
  ],
  edges: [
    { id: 'e1', sourceNodeId: '1', targetNodeId: '2' },
    { id: 'e2', sourceNodeId: '2', targetNodeId: '3' },
  ],
});
```

## 构建和部署

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动文档服务器
npm run docs:dev

# 运行测试
npm run test
```

### 构建

```bash
# 构建库
npm run build

# 构建文档
npm run docs:build
```

### 发布

```bash
# 发布到 npm
npm publish
```

## 完成情况

✅ 所有核心功能已实现
✅ 所有节点类型已实现
✅ Vue 和 React 适配器已完成
✅ 完整的 TypeScript 类型定义
✅ 丰富的配置选项
✅ 完善的事件系统
✅ 流程验证功能
✅ 示例演示项目
✅ 完整的 VitePress 文档
✅ 单元测试覆盖
✅ README 和 CHANGELOG

## 下一步计划

### 功能增强
- [ ] 添加更多节点类型（子流程、定时器等）
- [ ] 支持节点自定义样式
- [ ] 支持更多导出格式（SVG、XML）
- [ ] 添加撤销/重做限制配置
- [ ] 支持节点模板功能

### 性能优化
- [ ] 大规模流程图性能优化
- [ ] 虚拟滚动支持
- [ ] 节点渲染优化

### 开发体验
- [ ] 添加 playground 在线演示
- [ ] 提供 CLI 工具
- [ ] 添加更多示例
- [ ] 完善单元测试覆盖率

### 文档完善
- [ ] 添加更多使用示例
- [ ] 录制视频教程
- [ ] 添加最佳实践指南
- [ ] 添加常见问题解答

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件

## 致谢

- [LogicFlow](https://site.logic-flow.cn/) - 优秀的流程图编辑框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [React](https://react.dev/) - 用于构建用户界面的 JavaScript 库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [VitePress](https://vitepress.dev/) - 基于 Vite 的静态站点生成器
