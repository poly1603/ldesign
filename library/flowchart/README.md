# @ldesign/flowchart

一个基于 AntV X6 的强大审批流程图编辑器，支持流程图的编辑和预览功能。

## ✨ 特性

- 🚀 **高性能**: 基于 AntV X6，支持大规模节点渲染
- 🎨 **易于定制**: 丰富的配置选项，支持自定义节点和样式
- 💪 **功能强大**: 内置多种审批节点类型（开始、审批、条件、抄送、并行、结束）
- 📦 **开箱即用**: 提供 Vue 组件封装，简单易用
- 🔧 **插件系统**: 支持撤销重做、小地图、对齐线等丰富插件
- 📱 **响应式**: 支持缩放、拖拽、框选等交互操作

## 🚀 快速开始

### 查看示例

```bash
# 安装根目录依赖
pnpm install

# 启动示例项目
pnpm dev
```

然后访问 `http://localhost:5173` 即可查看三个示例：
- 📝 **基础示例** - 原生JS实现，适合快速上手
- 💚 **Vue组件** - Vue 3组件封装，适合Vue项目集成
- ⚡ **高级功能** - 完整功能演示，包含小地图、导入导出等

## 📦 安装

```bash
npm install @ldesign/flowchart
# or
pnpm add @ldesign/flowchart
# or
yarn add @ldesign/flowchart
```

## 🔨 使用

### Vue 组件方式

```vue
<template>
    <ApprovalFlowEditor
        :data="flowData"
        :readonly="false"
        @change="handleChange"
        @node-click="handleNodeClick"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ApprovalFlowEditor } from '@ldesign/flowchart'
import '@ldesign/flowchart/dist/index.css'

const flowData = ref({
    nodes: [
        { id: 'start', type: 'start', x: 100, y: 100, label: '开始' }
    ],
    edges: []
})

const handleChange = (data) => {
    console.log('流程图数据变化:', data)
}

const handleNodeClick = (node) => {
    console.log('节点点击:', node)
}
</script>
```

### 原生 JS 方式

```typescript
import { ApprovalFlowEditor } from '@ldesign/flowchart'
import '@ldesign/flowchart/dist/index.css'

const editor = new ApprovalFlowEditor({
    container: document.getElementById('app'),
    readonly: false,
    grid: true,
    minimap: true
})

// 设置数据
editor.setData({
    nodes: [
        { id: 'start', type: 'start', x: 100, y: 100, label: '开始' }
    ],
    edges: []
})

// 监听事件
editor.on('change', (data) => {
    console.log('数据变化:', data)
})
```

## 📖 文档

- [快速开始](./QUICK_START.md) - 5分钟上手指南
- [使用指南](./USAGE.md) - 完整API文档
- [示例项目](./examples/README.md) - 丰富的示例代码

## 🎯 节点类型

- **start**: 开始节点（绿色圆形）
- **approval**: 审批节点（蓝色矩形）
- **condition**: 条件节点（橙色菱形）
- **cc**: 抄送节点（青色矩形）
- **parallel**: 并行节点（紫色菱形）
- **end**: 结束节点（红色圆形）

## 🔑 核心功能

- ✅ 拖拽添加节点
- ✅ 节点连接和编辑
- ✅ 撤销/重做
- ✅ 复制/粘贴
- ✅ 键盘快捷键
- ✅ 框选和多选
- ✅ 对齐线辅助
- ✅ 小地图导航
- ✅ 导出JSON/PNG/SVG
- ✅ 只读模式
- ✅ 响应式布局

## 📄 License

MIT
