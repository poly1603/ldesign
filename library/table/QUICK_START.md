# 快速开始指南

## 🚀 5分钟上手

### 1. 安装依赖

```bash
# 确保已安装pnpm
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 2. 启动示例项目

#### Vue示例
```bash
cd examples/vue-demo
pnpm dev
# 访问 http://localhost:3000
```

#### React示例
```bash
cd examples/react-demo
pnpm dev
# 访问 http://localhost:3001
```

#### Lit示例
```bash
cd examples/lit-demo
pnpm dev
# 访问 http://localhost:3002
```

### 3. 构建所有包

```bash
# 回到项目根目录
cd ../..

# 构建所有包
pnpm build
```

## 📦 在你的项目中使用

### Vue 3项目

#### 1. 安装
```bash
pnpm add @ldesign/table-vue
```

#### 2. 使用
```vue
<template>
  <LTable :data="data" :columns="columns" />
</template>

<script setup>
import { LTable } from '@ldesign/table-vue';

const data = [
  { id: 1, name: '张三', age: 28 },
  { id: 2, name: '李四', age: 32 },
];

const columns = [
  { id: 'id', prop: 'id', label: 'ID', width: 80 },
  { id: 'name', prop: 'name', label: '姓名', width: 120 },
  { id: 'age', prop: 'age', label: '年龄', width: 100 },
];
</script>
```

### React项目

#### 1. 安装
```bash
pnpm add @ldesign/table-react
```

#### 2. 使用
```tsx
import { LTable } from '@ldesign/table-react';

function App() {
  const data = [
    { id: 1, name: '张三', age: 28 },
    { id: 2, name: '李四', age: 32 },
  ];

  const columns = [
    { id: 'id', prop: 'id', label: 'ID', width: 80 },
    { id: 'name', prop: 'name', label: '姓名', width: 120 },
    { id: 'age', prop: 'age', label: '年龄', width: 100 },
  ];

  return <LTable data={data} columns={columns} />;
}
```

### 其他框架（Web Components）

#### 1. 安装
```bash
pnpm add @ldesign/table-lit
```

#### 2. 使用
```html
<l-table id="table"></l-table>

<script type="module">
  import '@ldesign/table-lit';

  const table = document.getElementById('table');
  table.data = [
    { id: 1, name: '张三', age: 28 },
    { id: 2, name: '李四', age: 32 },
  ];
  table.columns = [
    { id: 'id', prop: 'id', label: 'ID', width: 80 },
    { id: 'name', prop: 'name', label: '姓名', width: 120 },
    { id: 'age', prop: 'age', label: '年龄', width: 100 },
  ];
</script>
```

## 🎯 常用功能示例

### 虚拟滚动（大数据）

```vue
<LTable
  :data="largeData"
  :columns="columns"
  virtual
  :height="600"
/>
```

### 选择功能

```vue
<LTable
  :data="data"
  :columns="columns"
  selectionMode="multiple"
  @selection-change="handleSelectionChange"
/>
```

### 排序功能

```javascript
const columns = [
  {
    id: 'age',
    prop: 'age',
    label: '年龄',
    sortable: true,
  },
];
```

### 固定列

```javascript
const columns = [
  { id: 'id', prop: 'id', label: 'ID', width: 80, fixed: 'left' },
  { id: 'name', prop: 'name', label: '姓名', width: 120, fixed: 'left' },
  // ... 其他列
  { id: 'action', label: '操作', width: 100, fixed: 'right' },
];
```

### 自定义单元格

```vue
<LTable :data="data" :columns="columns">
  <template #cell-name="{ row }">
    <strong>{{ row.name }}</strong>
  </template>
</LTable>
```

## 📝 下一步

- 📖 阅读完整文档：[README.md](./README.md)
- 🎨 查看更多示例：`examples/` 目录
- 🔧 了解核心API：[packages/core/README.md](./packages/core/README.md)
- 💡 项目总结：[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

## ❓ 常见问题

### 1. pnpm安装失败？

确保你的Node.js版本 >= 18，pnpm版本 >= 8

```bash
node -v  # 应该 >= 18
pnpm -v  # 应该 >= 8
```

### 2. 示例项目启动失败？

先构建所有依赖包：

```bash
# 在项目根目录
pnpm build
```

### 3. 如何自定义主题？

覆盖CSS变量：

```css
:root {
  --l-table-primary-color: #1890ff;
  --l-table-row-height: 56px;
}
```

## 🆘 获取帮助

- 查看[贡献指南](./CONTRIBUTING.md)
- 查看[更新日志](./CHANGELOG.md)
- 提交Issue到GitHub



