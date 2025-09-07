# @ldesign/form

一个功能强大、类型安全的表单管理库，支持 Vue 3 和原生 JavaScript。

## ✨ 特性

- 🚀 **高性能**: 优化的渲染机制，减少不必要的重渲染
- 🔒 **类型安全**: 完整的 TypeScript 支持
- 🎯 **灵活验证**: 内置多种验证器，支持自定义验证规则
- 🔄 **响应式**: 基于 Vue 3 Composition API，完全响应式
- 🧩 **组件化**: 提供完整的 Vue 组件和 TSX 组件
- 🌐 **框架无关**: 核心逻辑与框架解耦，可在任何环境使用
- 💾 **内存安全**: 自动清理资源，防止内存泄漏
- 🎨 **主题支持**: 集成 LDESIGN 设计系统

## 📦 安装

```bash
# 使用 pnpm
pnpm add @ldesign/form

# 使用 npm
npm install @ldesign/form

# 使用 yarn
yarn add @ldesign/form
```

## 🚀 快速开始

### Vue 3 使用

```vue
<template>
  <LDesignForm :form="form" @submit="handleSubmit">
    <LDesignFormItem
      name="username"
      label="用户名"
      :rules="[{ validator: required() }, { validator: length({ min: 3, max: 20 }) }]"
    >
      <LDesignInput
        v-model="form.data.username"
        placeholder="请输入用户名"
      />
    </LDesignFormItem>

    <LDesignFormItem
      name="email"
      label="邮箱"
      :rules="[{ validator: required() }, { validator: email() }]"
    >
      <LDesignInput
        v-model="form.data.email"
        type="email"
        placeholder="请输入邮箱"
      />
    </LDesignFormItem>

    <LDesignFormItem>
      <LDesignButton type="primary" html-type="submit">
        提交
      </LDesignButton>
      <LDesignButton html-type="reset" style="margin-left: 12px;">
        重置
      </LDesignButton>
    </LDesignFormItem>
  </LDesignForm>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form';
import { required, email, length } from '@ldesign/form/validators';
import {
  LDesignForm,
  LDesignFormItem,
  LDesignInput,
  LDesignButton
} from '@ldesign/form/vue';

// 创建表单实例
const form = useForm({
  initialValues: {
    username: '',
    email: ''
  }
});

// 处理提交
const handleSubmit = (result: any) => {
  if (result.valid) {
    console.log('表单数据:', result.data);
  } else {
    console.log('验证失败:', result.validation);
  }
};
</script>
```

### 原生 JavaScript 使用

```javascript
import { createForm } from '@ldesign/form';
import { required, email, length } from '@ldesign/form/validators';

// 创建表单实例
const form = createForm({
  initialValues: {
    username: '',
    email: ''
  }
});

// 添加字段验证规则
form.getField('username').addRule({ validator: required() });
form.getField('username').addRule({ validator: length({ min: 3, max: 20 }) });
form.getField('email').addRule({ validator: required() });
form.getField('email').addRule({ validator: email() });

// 设置字段值
form.setFieldValue('username', 'testuser');
form.setFieldValue('email', 'test@example.com');

// 验证表单
const result = await form.validate();
if (result.valid) {
  console.log('验证通过:', form.data);
} else {
  console.log('验证失败:', result.errors);
}

// 提交表单
const submitResult = await form.submit();
console.log('提交结果:', submitResult);
```

## 📚 核心概念

### 表单实例 (Form Instance)

表单实例是表单管理的核心，负责管理表单状态、字段和验证。

```typescript
import { createForm } from '@ldesign/form';

const form = createForm({
  initialValues: {
    name: '',
    age: 0,
    hobbies: []
  },
  onSubmit: async (data) => {
    // 处理提交逻辑
    console.log('提交数据:', data);
  }
});
```

### 字段管理 (Field Management)

每个表单字段都有独立的状态管理和验证逻辑。

```typescript
// 获取字段实例
const nameField = form.getField('name');

// 设置字段值
nameField.setValue('张三');

// 添加验证规则
nameField.addRule({ validator: required() });
nameField.addRule({ validator: length({ min: 2, max: 10 }) });

// 验证字段
const result = await nameField.validate();
```

### 验证系统 (Validation System)

内置多种常用验证器，支持自定义验证规则。

```typescript
import { required, email, length, pattern } from '@ldesign/form/validators';

// 内置验证器
const rules = [
  { validator: required() },
  { validator: email() },
  { validator: length({ min: 6, max: 20 }) },
  { validator: pattern(/^[a-zA-Z0-9]+$/) }
];

// 自定义验证器
const customValidator = (value: string) => {
  if (value.includes('admin')) {
    return { valid: false, message: '用户名不能包含admin' };
  }
  return { valid: true, message: '' };
};

field.addRule({ validator: customValidator });
```

## 🔧 API 参考

### createForm(options)

创建表单实例。

**参数:**
- `options.initialValues`: 初始值对象
- `options.onSubmit`: 提交处理函数
- `options.validateOnChange`: 是否在值变化时验证 (默认: true)
- `options.validateOnBlur`: 是否在失焦时验证 (默认: true)

**返回:** Form 实例

### useForm(options)

Vue 3 Composition API Hook，创建响应式表单实例。

```typescript
const form = useForm({
  initialValues: { name: '' },
  onSubmit: (data) => console.log(data)
});
```

### 内置验证器

- `required()`: 必填验证
- `email()`: 邮箱格式验证
- `length(options)`: 长度验证
- `pattern(regex)`: 正则表达式验证
- `number(options)`: 数字验证
- `url()`: URL 格式验证

## 🎨 样式定制

使用 LDESIGN 设计系统的 CSS 变量进行样式定制：

```css
:root {
  --ldesign-brand-color: #722ED1;
  --ldesign-error-color: #ff4d4f;
  --ldesign-success-color: #52c41a;
  --ldesign-warning-color: #faad14;
}
```

## 🧪 测试

运行测试套件：

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test __tests__/core/form.test.ts

# 运行测试并生成覆盖率报告
pnpm test:coverage
```

## 📈 性能优化

- **减少重渲染**: 使用 `markRaw` 和 `shallowRef` 优化响应式性能
- **内存管理**: 自动清理事件监听器和定时器
- **懒加载验证**: 只在需要时执行验证逻辑
- **批量更新**: 合并多个状态更新为单次渲染

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)。

## 📄 许可证

MIT License - 查看 [LICENSE](../../LICENSE) 文件了解详情。

## 🔗 相关链接

- [在线文档](https://ldesign.dev/form)
- [示例代码](./examples)
- [更新日志](./CHANGELOG.md)
- [问题反馈](https://github.com/ldesign/ldesign/issues)
