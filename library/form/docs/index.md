---
layout: home

hero:
  name: "@ldesign/form"
  text: "强大的表单管理库"
  tagline: 类型安全、高性能、框架无关的表单解决方案
  image:
    src: /logo.svg
    alt: LDesign Form
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: API 文档
      link: /API
    - theme: alt
      text: 查看示例
      link: /examples/

features:
  - icon: 🚀
    title: 框架无关
    details: 核心库不依赖任何框架，提供 Vue 3 适配器，支持其他框架扩展
  - icon: 🎯
    title: TypeScript 优先
    details: 完整的类型定义，提供优秀的开发体验和类型安全保障
  - icon: ✅
    title: 强大验证系统
    details: 内置丰富验证器，支持异步验证、自定义验证器和上下文感知验证
  - icon: 🔄
    title: 响应式数据绑定
    details: 双向数据绑定，实时同步表单状态，支持深度监听和批量更新
  - icon: 🎨
    title: 灵活的组件系统
    details: 支持 JSX/TSX 组件，可自定义表单控件和布局组件
  - icon: 📱
    title: 响应式布局
    details: 内置响应式查询表单，支持自适应列数和断点配置
  - icon: 🛠
    title: 开发友好
    details: 完整的测试覆盖，详细的错误信息，丰富的调试工具
  - icon: 📦
    title: 高性能
    details: 优化的渲染机制，内存泄漏防护，支持大规模表单应用
---

## 快速体验

### 基础用法

```vue
<template>
  <LDesignForm :form="form" @submit="handleSubmit">
    <LDesignFormItem
      name="username"
      label="用户名"
      :rules="[{ validator: required() }]"
    >
      <LDesignInput v-model="form.data.username" />
    </LDesignFormItem>

    <LDesignFormItem
      name="email"
      label="邮箱"
      :rules="[{ validator: required() }, { validator: email() }]"
    >
      <LDesignInput v-model="form.data.email" type="email" />
    </LDesignFormItem>

    <LDesignFormItem>
      <LDesignButton type="primary" html-type="submit">
        提交
      </LDesignButton>
    </LDesignFormItem>
  </LDesignForm>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form';
import { required, email } from '@ldesign/form/validators';
import {
  LDesignForm,
  LDesignFormItem,
  LDesignInput,
  LDesignButton
} from '@ldesign/form/vue';

const form = useForm({
  initialValues: {
    username: '',
    email: ''
  }
});

const handleSubmit = (result: any) => {
  if (result.valid) {
    console.log('提交成功:', result.data);
  } else {
    console.log('验证失败:', result.validation);
  }
};
</script>
```

### 纯 JavaScript 用法

```javascript
import { createForm } from '@ldesign/form';
import { required, email } from '@ldesign/form/validators';

// 创建表单实例
const form = createForm({
  initialValues: {
    username: '',
    email: ''
  }
});

// 添加验证规则
form.getField('username').addRule({ validator: required() });
form.getField('email').addRule({ validator: required() });
form.getField('email').addRule({ validator: email() });

// 设置值并验证
form.setFieldValue('username', 'john');
form.setFieldValue('email', 'john@example.com');

const result = await form.validate();
if (result.valid) {
  console.log('验证通过，可以提交');
}
```

## 为什么选择 @ldesign/form？

### 🎯 框架无关设计

@ldesign/form 采用框架无关的核心设计，可以在任何 JavaScript 环境中使用，同时提供了 Vue 3 的完整适配器。

### 🔧 类型安全

完整的 TypeScript 支持，从表单配置到验证规则，都有严格的类型定义，减少运行时错误。

### 🎨 高度可扩展

支持自定义验证器、组件、样式主题等，可以轻松适应各种复杂的业务场景。

### 📱 现代化架构

基于现代 JavaScript 特性构建，支持 ESM、Tree Shaking，优化的性能和内存管理。

### 🧪 测试驱动

超过 94% 的测试覆盖率，包括单元测试、组件测试、性能测试和边界情况测试。

## 核心特性

- **表单管理**: 完整的表单状态管理，支持嵌套字段和字段数组
- **验证系统**: 内置丰富的验证器，支持同步/异步验证和自定义验证器
- **Vue 3 集成**: 完整的 Vue 3 Composition API 支持和组件库
- **响应式布局**: 智能的响应式查询表单，自适应不同屏幕尺寸
- **性能优化**: 优化的渲染机制，防止内存泄漏，支持大规模表单
- **开发体验**: 详细的错误信息，完整的 TypeScript 支持，丰富的调试工具

## 安装

```bash
# 使用 pnpm
pnpm add @ldesign/form

# 使用 npm
npm install @ldesign/form

# 使用 yarn
yarn add @ldesign/form
```

## 许可证

[MIT License](https://github.com/ldesign/form/blob/main/LICENSE)
