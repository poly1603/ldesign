---
layout: home

hero:
  name: "自适应表单布局系统"
  text: "智能的表单解决方案"
  tagline: "支持自适应布局、展开收起、弹窗模式、表单分组等功能的现代表单系统"
  image:
    src: /hero-image.svg
    alt: 自适应表单布局系统
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/form

features:
  - icon: 📐
    title: 自适应布局
    details: 根据容器宽度自动计算最佳列数和布局，支持响应式断点配置
  - icon: 📂
    title: 展开收起
    details: 智能隐藏多余字段，支持内联展开和弹窗模式两种方式
  - icon: 🔲
    title: 弹窗模式
    details: 在弹窗中显示隐藏的表单项，支持数据同步和动画效果
  - icon: 📋
    title: 表单分组
    details: 支持表单项分组管理，独立的分组展开收起功能
  - icon: ✅
    title: 实时验证
    details: 多种验证规则支持，实时错误提示，支持异步验证
  - icon: 🔧
    title: 框架支持
    details: 支持原生JavaScript、Vue3等框架，提供完整的TypeScript类型
  - icon: ⚡
    title: 高性能
    details: 优化的渲染机制，支持大量表单项，内存使用高效
  - icon: 🎨
    title: 可定制
    details: 灵活的配置选项，支持自定义主题和样式
---

## 快速体验

### 原生JavaScript

```javascript
import { AdaptiveForm } from '@ldesign/form'

const form = new AdaptiveForm({
  selector: '#form-container',
  items: [
    { key: 'name', label: '姓名', type: 'input', required: true },
    { key: 'email', label: '邮箱', type: 'email', required: true },
    { key: 'phone', label: '电话', type: 'tel' }
  ],
  layout: {
    maxColumns: 3,
    gap: { horizontal: 16, vertical: 16 }
  },
  display: {
    expandMode: 'modal'
  }
})
```

### Vue3组件

```vue
<script setup>
import { AdaptiveForm } from '@ldesign/form/vue'

const formData = ref({})
const formConfig = ref({
  items: [
    { key: 'name', label: '姓名', type: 'input', required: true },
    { key: 'email', label: '邮箱', type: 'email', required: true }
  ]
})
</script>

<template>
  <AdaptiveForm
    v-model="formData"
    :config="formConfig"
    @change="handleChange"
  />
</template>
```

### Vue3 Hook

```javascript
import { useAdaptiveForm } from '@ldesign/form/vue'

const {
  values,
  errors,
  isValid,
  setValue,
  validate,
  mount
} = useAdaptiveForm(formConfig)
```

## 核心特性

### 🏗️ 智能布局

系统会根据容器宽度自动计算最佳的列数和布局，确保在不同屏幕尺寸下都能提供最佳的用户体验。

### 🎯 灵活配置

提供丰富的配置选项，包括布局参数、显示选项、验证规则、行为配置等，满足各种复杂的业务需求。

### 🚀 高性能

采用优化的渲染机制和事件处理，支持大量表单项的高效渲染，内存使用合理。

### 🔧 易于集成

支持多种使用方式，可以轻松集成到现有项目中，提供完整的TypeScript类型支持。

## 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 开源协议

本项目基于 [MIT](https://github.com/ldesign/form/blob/main/LICENSE) 协议开源。
