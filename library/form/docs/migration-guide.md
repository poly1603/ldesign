# 迁移指南

## 从 v1.x 迁移到 v2.0

v2.0 版本引入了框架无关的核心架构，虽然保持了向后兼容性，但建议逐步迁移到新的API以获得更好的性能和扩展性。

## 主要变化

### 1. 新的核心API

**v1.x (Vue 3 专用):**
```typescript
import { createForm } from '@ldesign/form'

const form = createForm({
  initialValues: { name: '' },
  onSubmit: (values) => console.log(values)
})
```

**v2.0 (框架无关):**
```typescript
import { createForm, createVanillaAdapter } from '@ldesign/form'

// 创建框架无关的表单实例
const form = createForm({
  initialValues: { name: '' },
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'input',
      rules: [{ type: 'required', message: '请输入姓名' }]
    }
  ]
}, {
  onSubmit: async (values) => console.log(values)
})

// 使用适配器渲染到DOM
const adapter = createVanillaAdapter()
adapter.mount(form, '#form-container')
```

### 2. 验证系统增强

**v1.x:**
```typescript
const form = createForm({
  initialValues: { email: '' },
  validationSchema: {
    email: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '邮箱格式不正确' }
    ]
  }
})
```

**v2.0:**
```typescript
import { createForm, required, email } from '@ldesign/form'

const form = createForm({
  initialValues: { email: '' },
  fields: [
    {
      name: 'email',
      label: '邮箱',
      type: 'input',
      rules: [
        { type: 'required', message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式不正确' }
      ]
    }
  ]
})

// 或者使用验证器函数
const customValidator = custom(async (value) => {
  const exists = await checkEmailExists(value)
  return exists ? '邮箱已存在' : true
})
```

### 3. 状态管理改进

**v1.x:**
```typescript
// 状态访问相对简单
const { values, errors, touched } = form.state
```

**v2.0:**
```typescript
// 更细粒度的状态管理
const formState = form.getState()
const fieldState = form.fieldManager.getFieldState('email')

// 监听状态变化
form.on('state:change', (state) => {
  console.log('表单状态变化:', state)
})

form.on('field:change', ({ name, value }) => {
  console.log(`字段 ${name} 变化为:`, value)
})
```

## 迁移步骤

### 步骤 1: 安装新版本

```bash
npm install @ldesign/form@^2.0.0
```

### 步骤 2: 更新导入

**旧的导入方式仍然支持:**
```typescript
import { Form, FormItem, Input } from '@ldesign/form'
```

**新的导入方式:**
```typescript
import { 
  createForm, 
  createVanillaAdapter,
  required, 
  email 
} from '@ldesign/form'
```

### 步骤 3: 逐步迁移表单

#### 简单表单迁移

**v1.x:**
```vue
<template>
  <Form :model="form" @submit="handleSubmit">
    <FormItem name="name" label="姓名" :rules="nameRules">
      <Input v-model="form.name" />
    </FormItem>
    <FormItem name="email" label="邮箱" :rules="emailRules">
      <Input v-model="form.email" />
    </FormItem>
    <button type="submit">提交</button>
  </Form>
</template>

<script setup>
import { reactive } from 'vue'
import { Form, FormItem, Input } from '@ldesign/form'

const form = reactive({
  name: '',
  email: ''
})

const nameRules = [
  { required: true, message: '请输入姓名' }
]

const emailRules = [
  { required: true, message: '请输入邮箱' },
  { type: 'email', message: '邮箱格式不正确' }
]

const handleSubmit = (values) => {
  console.log('提交数据:', values)
}
</script>
```

**v2.0 (保持Vue组件方式):**
```vue
<template>
  <Form :form="formInstance">
    <FormItem name="name" label="姓名">
      <Input />
    </FormItem>
    <FormItem name="email" label="邮箱">
      <Input />
    </FormItem>
    <button type="submit">提交</button>
  </Form>
</template>

<script setup>
import { createForm } from '@ldesign/form'
import { Form, FormItem, Input } from '@ldesign/form/vue'

const formInstance = createForm({
  initialValues: {
    name: '',
    email: ''
  },
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'input',
      rules: [{ type: 'required', message: '请输入姓名' }]
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input',
      rules: [
        { type: 'required', message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式不正确' }
      ]
    }
  ]
}, {
  onSubmit: async (values) => {
    console.log('提交数据:', values)
  }
})
</script>
```

**v2.0 (使用框架无关API):**
```typescript
import { createForm, createVanillaAdapter } from '@ldesign/form'

const form = createForm({
  initialValues: {
    name: '',
    email: ''
  },
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'input',
      rules: [{ type: 'required', message: '请输入姓名' }]
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input',
      rules: [
        { type: 'required', message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式不正确' }
      ]
    }
  ]
}, {
  onSubmit: async (values) => {
    console.log('提交数据:', values)
  }
})

const adapter = createVanillaAdapter()
adapter.mount(form, '#form-container')
```

### 步骤 4: 更新验证逻辑

**v1.x 自定义验证:**
```typescript
const customRule = {
  validator: (rule, value, callback) => {
    if (value && value.length < 6) {
      callback(new Error('密码至少6位'))
    } else {
      callback()
    }
  }
}
```

**v2.0 自定义验证:**
```typescript
import { custom } from '@ldesign/form'

const passwordValidator = custom((value) => {
  if (value && value.length < 6) {
    return '密码至少6位'
  }
  return true
})

// 或者异步验证
const asyncValidator = custom(async (value) => {
  const isValid = await validatePassword(value)
  return isValid ? true : '密码不符合要求'
})
```

### 步骤 5: 更新事件处理

**v1.x:**
```typescript
const form = createForm({
  onValuesChange: (changedValues, allValues) => {
    console.log('值变化:', changedValues, allValues)
  }
})
```

**v2.0:**
```typescript
const form = createForm({
  // ... 配置
}, {
  onValuesChange: (values, changedValues) => {
    console.log('值变化:', values, changedValues)
  },
  onFieldChange: (name, value, allValues) => {
    console.log(`字段 ${name} 变化:`, value)
  }
})

// 或者使用事件监听
form.on('field:change', ({ name, value }) => {
  console.log(`字段 ${name} 变化:`, value)
})
```

## 兼容性说明

### 保持兼容的功能

- Vue 3 组件API保持不变
- 基础的表单配置选项
- 常用的验证规则
- 事件回调函数

### 新增功能

- 框架无关的核心API
- 适配器系统
- 增强的验证引擎
- 更细粒度的状态管理
- 性能优化

### 废弃的功能

- 一些内部API可能会在未来版本中移除
- 建议使用新的API替代旧的实现

## 性能提升

v2.0 版本在以下方面有显著的性能提升：

1. **验证缓存**: 相同的验证结果会被缓存，避免重复计算
2. **事件优化**: 批量状态更新，减少不必要的重渲染
3. **内存管理**: 更好的内存管理，避免内存泄漏
4. **异步处理**: 优化的异步验证队列

## 获取帮助

如果在迁移过程中遇到问题：

1. 查看[API文档](./api.md)
2. 查看[架构设计文档](./architecture.md)
3. 查看[示例代码](../examples/)
4. 提交[GitHub Issue](https://github.com/ldesign/form/issues)
