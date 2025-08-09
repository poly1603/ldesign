# @ldesign/form - 简单使用示例

这个示例展示了如何正确使用 `@ldesign/form` 核心库，让用户的使用体验尽可能简单。

## 🎯 设计理念

- **核心库负责功能实现** - 所有复杂的逻辑都在 `packages/form/src/` 中
- **用户使用极简** - 只需要简单的配置就能实现强大的功能
- **示例展示用法** - examples 只是演示如何使用，不包含业务逻辑

## 🚀 快速开始

### 1. 安装

```bash
npm install @ldesign/form
```

### 2. 基础使用

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" />
</template>

<script setup>
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formData = ref({})

const formOptions = {
  fields: [
    { name: 'name', title: '姓名', component: 'FormInput', required: true },
    { name: 'email', title: '邮箱', component: 'FormInput', props: { type: 'email' } },
  ],
}
</script>
```

## ✨ 核心功能

### 🎨 主题样式

```javascript
const formOptions = {
  fields: [...],
  layout: {
    theme: 'bordered',  // 'default' | 'bordered'
    columns: 2,         // 列数
    label: {
      position: 'left', // 标签位置
      showColon: true,  // 显示冒号
      gap: 12          // 标签间距
    }
  }
}
```

### 🔄 条件显示

```javascript
const formOptions = {
  fields: [
    { name: 'country', title: '国家', component: 'FormSelect',
      props: { options: [...] }
    },
    { name: 'province', title: '省份', component: 'FormInput',
      showWhen: { field: 'country', value: 'china' }  // 简单条件配置
    }
  ]
}
```

### 📱 响应式布局

```javascript
const formOptions = {
  fields: [...],
  layout: {
    defaultRows: 2,                    // 默认显示2行
    button: {
      position: 'follow-last-row',     // 按钮跟随最后一行
      align: 'right'                   // 右对齐
    }
  }
}
```

## 🔧 运行示例

```bash
cd packages/form/examples/simple-usage
pnpm install
pnpm dev
```

访问 http://localhost:3002 查看示例效果。

## 📚 更多功能

查看完整的 API 文档和高级用法：

- [核心库文档](../../docs/README.md)
- [API 参考](../../docs/api.md)
- [主题定制](../../docs/themes.md)
- [条件渲染](../../docs/conditional.md)

## 🎮 对比

### ❌ 错误的方式（复杂）

用户需要自己实现大量逻辑：

```javascript
// 用户需要自己写条件显示逻辑
const shouldShowField = (field, formData) => {
  /* 复杂逻辑 */
}
// 用户需要自己写布局计算
const calculateLayout = () => {
  /* 复杂逻辑 */
}
// 用户需要自己写主题样式
const applyTheme = () => {
  /* 复杂逻辑 */
}
```

### ✅ 正确的方式（简单）

用户只需要简单配置：

```javascript
const formOptions = {
  fields: [{ name: 'field1', showWhen: { field: 'other', value: 'show' } }],
  layout: {
    theme: 'bordered',
    defaultRows: 2,
    button: { position: 'follow-last-row' },
  },
}
```

所有复杂的逻辑都在核心库中处理，用户使用极其简单！
