# 快速开始

本指南将帮助您快速上手 LemonForm，在几分钟内创建您的第一个动态表单。

## 安装

### 使用包管理器

::: code-group

```bash [npm]
npm install @lemonform/form
```

```bash [yarn]
yarn add @lemonform/form
```

```bash [pnpm]
pnpm add @lemonform/form
```

:::

### CDN

您也可以通过 CDN 直接使用：

```html
<script src="https://unpkg.com/@lemonform/form"></script>
```

## 基础使用

### 1. 导入组件

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@lemonform/form'
import '@lemonform/form/style.css'
</script>
```

### 2. 创建表单配置

```vue
<script setup lang="ts">
const formData = ref({})

const formConfig = {
  fields: [
    {
      type: 'input',
      name: 'username',
      label: '用户名',
      component: 'input',
      required: true,
      placeholder: '请输入用户名',
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
      placeholder: '请输入邮箱地址',
      rules: [
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]
    },
    {
      type: 'select',
      name: 'gender',
      label: '性别',
      component: 'select',
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' }
        ]
      }
    },
    {
      type: 'actions',
      buttons: [
        { type: 'submit', text: '提交' },
        { type: 'reset', text: '重置' }
      ]
    }
  ],
  layout: {
    type: 'grid',
    columns: 2,
    gap: 16
  }
}
</script>
```

### 3. 使用表单组件

```vue
<template>
  <div class="form-container">
    <h2>用户注册</h2>
    <DynamicForm
      v-model="formData"
      :config="formConfig"
      @submit="handleSubmit"
      @reset="handleReset"
    />
  </div>
</template>
```

### 4. 处理表单事件

```vue
<script setup lang="ts">
const handleSubmit = (data: any) => {
  console.log('表单提交:', data)
  // 这里可以发送数据到服务器
}

const handleReset = () => {
  console.log('表单重置')
  formData.value = {}
}
</script>
```

### 完整示例

::: details 查看完整代码

```vue
<template>
  <div class="form-container">
    <h2>用户注册</h2>
    <DynamicForm
      v-model="formData"
      :config="formConfig"
      @submit="handleSubmit"
      @reset="handleReset"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@lemonform/form'
import '@lemonform/form/style.css'

const formData = ref({})

const formConfig = {
  fields: [
    {
      type: 'input',
      name: 'username',
      label: '用户名',
      component: 'input',
      required: true,
      placeholder: '请输入用户名',
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
      placeholder: '请输入邮箱地址',
      rules: [
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]
    },
    {
      type: 'select',
      name: 'gender',
      label: '性别',
      component: 'select',
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' }
        ]
      }
    },
    {
      type: 'actions',
      buttons: [
        { type: 'submit', text: '提交' },
        { type: 'reset', text: '重置' }
      ]
    }
  ],
  layout: {
    type: 'grid',
    columns: 2,
    gap: 16
  }
}

const handleSubmit = (data: any) => {
  console.log('表单提交:', data)
  // 这里可以发送数据到服务器
}

const handleReset = () => {
  console.log('表单重置')
  formData.value = {}
}
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>
```

:::

## 全局注册

如果您想在整个应用中使用 LemonForm 组件，可以进行全局注册：

```typescript
import { createApp } from 'vue'
import DynamicFormPlugin from '@lemonform/form'
import '@lemonform/form/style.css'

const app = createApp(App)

// 全局注册插件
app.use(DynamicFormPlugin, {
  // 全局配置选项
  theme: 'light',
  size: 'medium',
  prefix: 'L' // 组件前缀，注册为 LDynamicForm
})

app.mount('#app')
```

注册后，您可以在任何组件中直接使用：

```vue
<template>
  <LDynamicForm v-model="formData" :config="formConfig" />
</template>
```

## 使用组合式函数

LemonForm 还提供了强大的组合式函数，让您可以更灵活地控制表单：

```vue
<script setup lang="ts">
import { useForm } from '@lemonform/form'

const {
  formData,
  formState,
  validate,
  reset,
  submit,
  setFieldValue,
  getFieldValue
} = useForm(formConfig)

// 手动验证表单
const handleValidate = async () => {
  const isValid = await validate()
  console.log('表单是否有效:', isValid)
}

// 设置字段值
const setUsername = () => {
  setFieldValue('username', 'newuser')
}

// 获取字段值
const getUsername = () => {
  const username = getFieldValue('username')
  console.log('用户名:', username)
}
</script>
```

## 下一步

现在您已经成功创建了第一个 LemonForm 表单！接下来您可以：

- [了解表单配置](/guide/form-config) - 学习如何配置更复杂的表单
- [探索字段类型](/guide/field-types) - 查看所有可用的字段类型
- [学习验证规则](/guide/validation) - 了解如何添加验证规则
- [查看更多示例](/examples/) - 浏览实际使用案例
