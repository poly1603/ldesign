# LDesign Table

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/TypeScript-100%25-blue.svg" alt="TypeScript">
</p>

一个高性能、功能完整的框架无关表格插件，基于headless架构设计。

## ✨ 特性

- 🚀 **高性能虚拟滚动** - 支持10万+数据流畅渲染
- 🎯 **框架无关** - 核心逻辑与UI分离，支持任意框架
- 💪 **功能丰富** - 排序、筛选、分页、选择、展开行、编辑、导出等
- 📦 **开箱即用** - 提供Vue、React、Lit适配器
- 🎨 **主题可定制** - 基于CSS变量的主题系统
- 📱 **响应式** - 支持固定列、固定表头
- ⚡ **TypeScript** - 完整的类型定义
- 🔧 **易扩展** - 插件式架构，易于扩展

## 📦 安装

```bash
# Vue 3
pnpm add @ldesign/table-vue

# React
pnpm add @ldesign/table-react

# Lit (Web Components)
pnpm add @ldesign/table-lit

# 核心库（如需自定义适配器）
pnpm add @ldesign/table-core
```

## 🚀 快速开始

### Vue 3

```vue
<template>
  <LTable
    :data="tableData"
    :columns="columns"
    selectionMode="multiple"
    virtual
    stripe
    border
  />
</template>

<script setup>
import { LTable } from '@ldesign/table-vue';

const tableData = [
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 32, email: 'lisi@example.com' },
];

const columns = [
  { id: 'id', prop: 'id', label: 'ID', width: 80 },
  { id: 'name', prop: 'name', label: '姓名', width: 120, sortable: true },
  { id: 'age', prop: 'age', label: '年龄', width: 100, sortable: true },
  { id: 'email', prop: 'email', label: '邮箱', minWidth: 200 },
];
</script>
```

### React

```tsx
import { LTable } from '@ldesign/table-react';

function App() {
  const data = [
    { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 32, email: 'lisi@example.com' },
  ];

  const columns = [
    { id: 'id', prop: 'id', label: 'ID', width: 80 },
    { id: 'name', prop: 'name', label: '姓名', width: 120, sortable: true },
    { id: 'age', prop: 'age', label: '年龄', width: 100, sortable: true },
    { id: 'email', prop: 'email', label: '邮箱', minWidth: 200 },
  ];

  return (
    <LTable
      data={data}
      columns={columns}
      selectionMode="multiple"
      virtual
      stripe
      border
    />
  );
}
```

### Lit (Web Components)

```html
<l-table id="myTable" virtual stripe border></l-table>

<script type="module">
  import '@ldesign/table-lit';

  const table = document.getElementById('myTable');
  table.data = [
    { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 32, email: 'lisi@example.com' },
  ];

  table.columns = [
    { id: 'id', prop: 'id', label: 'ID', width: 80 },
    { id: 'name', prop: 'name', label: '姓名', width: 120, sortable: true },
    { id: 'age', prop: 'age', label: '年龄', width: 100, sortable: true },
    { id: 'email', prop: 'email', label: '邮箱', minWidth: 200 },
  ];
</script>
```

## 🎯 核心功能

### 虚拟滚动

支持大数据量（10万+行）的流畅渲染：

```vue
<LTable :data="largeData" :columns="columns" virtual :height="600" />
```

### 排序

```javascript
const columns = [
  {
    id: 'age',
    prop: 'age',
    label: '年龄',
    sortable: true,
    sortFn: (a, b) => a.age - b.age, // 自定义排序
  },
];
```

### 筛选

```javascript
table.setFilters([
  { field: 'age', operator: 'gt', value: 25 },
  { field: 'name', operator: 'contains', value: '张' },
]);
```

### 选择

```vue
<LTable
  :data="data"
  :columns="columns"
  selectionMode="multiple"
  @selection-change="handleSelectionChange"
/>
```

### 固定列

```javascript
const columns = [
  { id: 'id', prop: 'id', label: 'ID', width: 80, fixed: 'left' },
  { id: 'name', prop: 'name', label: '姓名', width: 120, fixed: 'left' },
  // ...
  { id: 'action', label: '操作', width: 120, fixed: 'right' },
];
```

### 展开行

```vue
<LTable :data="data" :columns="columns" expandable>
  <template #expand="{ row }">
    <div>展开内容: {{ row.detail }}</div>
  </template>
</LTable>
```

### 数据导出

```javascript
// 导出CSV
tableCore.exportData({
  format: 'csv',
  filename: 'data',
  includeHeader: true,
});

// 导出Excel
tableCore.exportData({
  format: 'excel',
  filename: 'data',
});
```

## 🎨 主题定制

使用CSS变量自定义主题：

```css
:root {
  --l-table-primary-color: #409eff;
  --l-table-border-color: #ebeef5;
  --l-table-header-bg: #f5f7fa;
  --l-table-row-hover-bg: #f5f7fa;
  --l-table-row-height: 48px;
}

/* 暗色主题 */
:root[data-theme='dark'] {
  --l-table-bg-color: #1d1e1f;
  --l-table-header-bg: #262727;
  --l-table-text-color: #e5eaf3;
}
```

## 📚 文档

- [快速开始](./QUICK_START.md) - 5分钟上手
- [完整指南](./GUIDE.md) - 详细使用文档
- [性能优化](./PERFORMANCE.md) - 性能优化建议
- [项目总结](./PROJECT_SUMMARY.md) - 架构设计说明
- [贡献指南](./CONTRIBUTING.md) - 如何贡献代码
- [更新日志](./CHANGELOG.md) - 版本更新记录

## 🏗️ 架构设计

```
┌─────────────────────────────────────────┐
│            应用层 (App)                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     适配器层 (Vue/React/Lit)             │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   Vue    │  │  React   │  │  Lit   │ │
│  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          核心层 (Core)                   │
│  ┌────────────────────────────────────┐ │
│  │ TableCore (状态管理 + 事件系统)     │ │
│  └────────────────────────────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Column   │  │  Data    │  │  Row   │ │
│  │ Manager  │  │ Manager  │  │Manager │ │
│  └──────────┘  └──────────┘  └────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Virtual  │  │  Edit    │  │ Export │ │
│  │ Scroller │  │ Manager  │  │Manager │ │
│  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         样式层 (Styles)                  │
│   CSS Variables + Modular CSS            │
└─────────────────────────────────────────┘
```

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 性能基准测试
pnpm benchmark

# 生成演示数据
pnpm generate-data

# 运行示例
cd examples/vue-demo && pnpm dev
cd examples/react-demo && pnpm dev
cd examples/lit-demo && pnpm dev
```

## 📊 性能

- **初始化**: 10万行 < 400ms
- **渲染**: 60fps流畅滚动
- **内存**: 10万行约140MB
- **排序**: 5万行 < 150ms
- **筛选**: 5万行 < 50ms

详见 [PERFORMANCE.md](./PERFORMANCE.md)

## 🤝 贡献

欢迎贡献代码！请阅读 [贡献指南](./CONTRIBUTING.md)。

## 📄 License

[MIT](./LICENSE)

## 🌟 致谢

本项目参考了以下优秀项目：
- [TanStack Table](https://tanstack.com/table) - Headless架构设计
- [ag-Grid](https://www.ag-grid.com/) - 虚拟滚动实现
- [Element Plus](https://element-plus.org/) - 组件API设计
- [Ant Design](https://ant.design/) - 样式系统设计

---

<p align="center">Made with ❤️ by LDesign Team</p>
