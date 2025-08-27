# 🍋 LemonForm

一个强大、灵活、易用的动态表单库，专为 Vue 3 设计，提供完整的表单解决方案。

[![npm version](https://badge.fury.io/js/@lemonform%2Fform.svg)](https://badge.fury.io/js/@lemonform%2Fform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)

## ✨ 特性

- 🚀 **开箱即用** - 零配置快速上手，内置常用字段类型
- 🎨 **高度可定制** - 支持自定义组件、样式和验证规则
- 📱 **响应式布局** - 自动适配不同屏幕尺寸，支持栅格布局
- ✅ **强大验证** - 内置丰富验证规则，支持异步验证和自定义验证器
- 🔄 **条件渲染** - 支持字段间联动，动态显示/隐藏字段
- 🎯 **TypeScript** - 完整的类型定义，提供优秀的开发体验
- 🛠 **调试友好** - 内置调试面板，实时查看表单状态
- 📦 **轻量级** - 核心包体积小，支持按需加载

## 📦 安装

```bash
# npm
npm install @lemonform/form

# yarn
yarn add @lemonform/form

# pnpm
pnpm add @lemonform/form
```

## 🚀 快速开始

### Vue 组件方式

```vue
<template>
  <DynamicForm
    v-model="formData"
    :options="formOptions"
    @submit="handleSubmit"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formData = ref({})
const formOptions = {
  fields: [
    {
      name: 'username',
      title: '用户名',
      component: 'FormInput',
      required: true,
      rules: [{ validator: 'required', message: '请输入用户名' }]
    },
    {
      name: 'email',
      title: '邮箱',
      component: 'FormInput',
      props: { type: 'email' },
      rules: [{ validator: 'email', message: '请输入有效的邮箱地址' }]
    }
  ]
}

const handleSubmit = (data, valid) => {
  if (valid) {
    console.log('提交数据:', data)
  }
}
</script>
```

### Composition API Hook 方式

```vue
<template>
  <component :is="renderForm" />
</template>

<script setup>
import { useForm } from '@ldesign/form'

const {
  formData,
  errors,
  validate,
  submit,
  renderForm
} = useForm({
  fields: [
    {
      name: 'username',
      title: '用户名',
      component: 'FormInput',
      required: true
    }
  ]
})
</script>
```

### 原生 JavaScript 方式

```javascript
import { createFormInstance } from '@ldesign/form/vanilla'

const formInstance = createFormInstance({
  container: '#form-container',
  fields: [
    {
      name: 'username',
      title: '用户名',
      component: 'input',
      required: true
    }
  ],
  onSubmit: (data, valid) => {
    if (valid) {
      console.log('提交数据:', data)
    }
  }
})
```

## 📋 核心配置

### 字段配置

```typescript
interface FormItemConfig {
  title: string                    // 字段标题
  name: string                     // 字段名称
  span?: number | string           // 所占列数
  component: string | Component    // 表单组件类型
  props?: Record<string, any>      // 组件属性
  defaultValue?: any               // 默认值
  required?: boolean               // 是否必填
  rules?: ValidationRule[]         // 验证规则
}
```

### 布局配置

```typescript
interface LayoutConfig {
  defaultRows?: number             // 默认显示行数
  minColumnWidth?: number          // 最小列宽
  autoCalculate?: boolean          // 自动计算列数
  columns?: number                 // 固定列数
  horizontalGap?: number           // 水平间距
  verticalGap?: number            // 垂直间距
}
```

## 🔧 内置验证器

- `required` - 必填验证
- `email` - 邮箱格式验证
- `phone` - 手机号验证
- `url` - URL 格式验证
- `number` - 数字验证
- `min` / `max` - 最小/最大值验证
- `minLength` / `maxLength` - 最小/最大长度验证
- `pattern` - 正则表达式验证

## 📱 响应式设计

表单支持完整的响应式设计，自动适配不同设备：

```javascript
const responsiveLayout = {
  columns: {
    xs: 1,    // 手机：1列
    sm: 2,    // 平板：2列
    md: 3,    // 桌面：3列
    lg: 4     // 大屏：4列
  }
}
```

## 🛠️ API 参考

### FormInstance 方法

```typescript
interface FormInstance {
  setFormData(data: Partial<FormData>): void
  getFormData(): FormData
  setFieldValue(name: string, value: any): void
  getFieldValue(name: string): any
  validate(): Promise<FormValidationResult>
  reset(): void
  submit(): Promise<{data: FormData, valid: boolean}>
  destroy(): void
}
```

## 📦 构建输出

- **ES 模块**: `@ldesign/form` - Vue 完整版本
- **Vanilla JS**: `@ldesign/form/vanilla` - 原生 JavaScript 版本
- **UMD**: `@ldesign/form/dist/index.min.js` - 浏览器直接引入
- **类型定义**: 完整的 TypeScript 类型支持

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)。

## 📄 许可证

[MIT](./LICENSE) © LDesign Team
