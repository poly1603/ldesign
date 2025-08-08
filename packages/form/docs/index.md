---
layout: home

hero:
  name: '@ldesign/form'
  text: 'Vue 3 表单组件库'
  tagline: 现代化、类型安全、功能强大的表单解决方案
  image:
    src: /logo.svg
    alt: '@ldesign/form'
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
  - icon: 🚀
    title: 多种使用方式
    details: 支持 Vue 组件、Composition API Hook 和原生 JavaScript 三种使用方式，满足不同场景需求
  - icon: 📝
    title: 动态表单
    details: 基于配置生成表单，支持复杂的表单结构和条件渲染，轻松构建动态表单
  - icon: 🔧
    title: 类型安全
    details: 完整的 TypeScript 支持，提供优秀的开发体验和智能代码提示
  - icon: ✅
    title: 强大验证
    details: 内置多种验证规则，支持自定义验证器和异步验证，确保数据质量
  - icon: 📱
    title: 响应式布局
    details: 自适应网格布局，支持多种屏幕尺寸，完美适配移动端和桌面端
  - icon: 🎨
    title: 主题定制
    details: 支持主题切换和深度样式定制，轻松打造符合品牌的表单界面
  - icon: 🔄
    title: 条件渲染
    details: 支持字段的条件显示和动态配置，构建智能交互的表单体验
  - icon: 📊
    title: 状态管理
    details: 完整的表单状态管理，包括脏检查、验证状态等，精确控制表单行为
  - icon: 🎯
    title: 高性能
    details: 优化的渲染性能和内存使用，支持大型表单和复杂场景
---

## 快速体验

### Vue 组件方式

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formData = ref({})
const formOptions = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      component: 'FormInput',
      required: true,
      rules: [
        { required: true, message: '请输入用户名' },
        { minLength: 3, message: '用户名至少3个字符' },
      ],
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      props: { type: 'email' },
      required: true,
      rules: [
        { required: true, message: '请输入邮箱' },
        { email: true, message: '请输入有效的邮箱地址' },
      ],
    },
    {
      name: 'age',
      label: '年龄',
      component: 'FormInput',
      props: { type: 'number' },
      rules: [
        { min: 18, message: '年龄不能小于18岁' },
        { max: 100, message: '年龄不能大于100岁' },
      ],
    },
  ],
  layout: {
    columns: 2,
    gap: 16,
  },
}

const handleSubmit = data => {
  console.log('表单提交:', data)
}
</script>
```

### Composition API 方式

```vue
<template>
  <component :is="renderForm" />
</template>

<script setup>
import { useForm } from '@ldesign/form'

const { formData, renderForm, validate, reset } = useForm({
  fields: [
    { name: 'name', label: '姓名', component: 'FormInput', required: true },
    { name: 'email', label: '邮箱', component: 'FormInput', props: { type: 'email' } },
  ],
})

// 验证表单
const handleValidate = async () => {
  const isValid = await validate()
  console.log('表单验证结果:', isValid)
}
</script>
```

### 原生 JavaScript 方式

```javascript
import { createFormInstance } from '@ldesign/form'

const formInstance = createFormInstance({
  container: '#form-container',
  options: {
    fields: [
      { name: 'username', label: '用户名', component: 'FormInput', required: true },
      { name: 'password', label: '密码', component: 'FormInput', props: { type: 'password' } },
    ],
  },
  onSubmit: data => {
    console.log('表单提交:', data)
  },
})

// 设置表单数据
formInstance.setFormData({ username: 'admin' })

// 验证表单
formInstance.validate().then(isValid => {
  if (isValid) {
    const data = formInstance.getFormData()
    console.log('表单数据:', data)
  }
})
```

## 为什么选择 @ldesign/form？

### 🎯 专为现代开发设计

- **Vue 3 原生支持**：基于 Vue 3 Composition API 构建，充分利用 Vue 3 的性能优势
- **TypeScript 优先**：从设计之初就考虑 TypeScript 支持，提供完整的类型定义
- **现代化工具链**：使用 Vite 构建，支持 ESM 和 Tree Shaking

### 🔧 灵活的架构设计

- **多种使用方式**：Vue 组件、Composition API、原生 JavaScript，适应不同项目需求
- **插件化架构**：核心功能模块化，支持按需加载和自定义扩展
- **框架无关**：核心逻辑与框架解耦，未来可扩展支持其他框架

### 📈 企业级特性

- **完整的验证系统**：15+ 内置验证规则，支持同步/异步自定义验证
- **主题系统**：9 种预设主题，支持深度定制和运行时切换
- **国际化支持**：内置多语言支持，轻松构建国际化应用
- **性能优化**：虚拟滚动、防抖验证、智能缓存等性能优化策略

## 立即开始

<div class="vp-doc">
  <div class="custom-block tip">
    <p class="custom-block-title">💡 提示</p>
    <p>推荐先阅读 <a href="/guide/introduction">介绍</a> 了解基本概念，然后查看 <a href="/guide/getting-started">快速开始</a> 进行实际操作。</p>
  </div>
</div>

### 安装

```bash
# npm
npm install @ldesign/form

# yarn
yarn add @ldesign/form

# pnpm
pnpm add @ldesign/form
```

### 基础使用

```vue
<script setup>
import { DynamicForm } from '@ldesign/form'
import '@ldesign/form/style.css'

// 你的表单配置...
</script>
```

## 社区与支持

- 📖 [完整文档](/guide/introduction)
- 🐛 [问题反馈](https://github.com/ldesign/form/issues)
- 💬 [讨论区](https://github.com/ldesign/form/discussions)
- 📦 [NPM 包](https://www.npmjs.com/package/@ldesign/form)

---

<div style="text-align: center; margin-top: 2rem; padding: 2rem; background: var(--vp-c-bg-soft); border-radius: 8px;">
  <h3>开源协议</h3>
  <p>@ldesign/form 基于 <a href="https://github.com/ldesign/form/blob/main/LICENSE">MIT 协议</a> 开源，欢迎贡献代码！</p>
</div>
