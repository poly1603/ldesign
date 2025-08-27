---
layout: home

hero:
  name: "LemonForm"
  text: "Vue 3 动态表单库"
  tagline: 强大、灵活、易用的表单解决方案
  image:
    src: /logo.svg
    alt: LemonForm
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/

features:
  - icon: 🚀
    title: 开箱即用
    details: 零配置快速上手，内置常用字段类型，支持多种布局方式
  - icon: 🎨
    title: 高度可定制
    details: 支持自定义组件、样式和验证规则，满足各种业务需求
  - icon: 📱
    title: 响应式布局
    details: 自动适配不同屏幕尺寸，支持栅格布局和断点配置
  - icon: ✅
    title: 强大验证
    details: 内置丰富验证规则，支持异步验证和自定义验证器
  - icon: 🔄
    title: 条件渲染
    details: 支持字段间联动，动态显示/隐藏字段，实现复杂表单逻辑
  - icon: 🎯
    title: TypeScript
    details: 完整的类型定义，提供优秀的开发体验和类型安全
  - icon: 🛠
    title: 调试友好
    details: 内置调试面板，实时查看表单状态，快速定位问题
  - icon: 📦
    title: 轻量级
    details: 核心包体积小，支持按需加载，不会增加项目负担
---

## 快速体验

```vue
<template>
  <DynamicForm
    v-model="formData"
    :config="formConfig"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@lemonform/form'

const formData = ref({})

const formConfig = {
  fields: [
    {
      type: 'input',
      name: 'username',
      label: '用户名',
      component: 'input',
      required: true,
      rules: [
        { type: 'required', message: '用户名不能为空' },
        { type: 'minLength', value: 3, message: '用户名至少3个字符' }
      ]
    },
    {
      type: 'input',
      name: 'email',
      label: '邮箱',
      component: 'input',
      rules: [
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]
    },
    {
      type: 'actions',
      buttons: [
        { type: 'submit', text: '提交' }
      ]
    }
  ]
}

const handleSubmit = (data: any) => {
  console.log('表单提交:', data)
}
</script>
```

## 为什么选择 LemonForm？

### 🎯 专为 Vue 3 设计

LemonForm 是专门为 Vue 3 生态系统设计的表单库，充分利用了 Composition API 的优势，提供了现代化的开发体验。

### 🔧 配置驱动

通过简单的配置对象就能创建复杂的表单，无需编写大量的模板代码，大大提高开发效率。

### 🎨 高度可扩展

支持自定义字段组件、验证器、主题样式等，可以轻松适应各种业务场景。

### 📱 移动优先

内置响应式布局系统，自动适配不同设备，确保在各种屏幕尺寸下都有良好的用户体验。

## 社区

- [GitHub](https://github.com/lemonform/form) - 源代码和问题反馈
- [NPM](https://www.npmjs.com/package/@lemonform/form) - 包管理
- [Discord](https://discord.gg/lemonform) - 社区讨论

## 许可证

[MIT License](https://github.com/lemonform/form/blob/main/LICENSE)
