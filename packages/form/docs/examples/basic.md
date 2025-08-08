# 基础表单

本章节展示 @ldesign/form 的基础用法，包括常见的表单字段和配置。

## 用户信息表单

一个包含基础字段的简单表单示例：

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from 'vue'
import { DynamicForm } from '@ldesign/form'

const formData = ref({
  name: '',
  email: '',
  phone: '',
  gender: '',
  bio: '',
})

const formOptions = {
  fields: [
    {
      name: 'name',
      label: '姓名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入姓名',
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      props: { type: 'email' },
      required: true,
      placeholder: '请输入邮箱地址',
    },
    {
      name: 'phone',
      label: '手机号',
      component: 'FormInput',
      placeholder: '请输入手机号码',
    },
    {
      name: 'gender',
      label: '性别',
      component: 'FormRadio',
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
        ],
      },
    },
    {
      name: 'bio',
      label: '个人简介',
      component: 'FormTextarea',
      placeholder: '请输入个人简介',
      span: 'full',
    },
  ],
  layout: {
    columns: 2,
    gap: 16,
  },
  submitButton: {
    text: '提交',
    type: 'primary',
  },
}

const handleSubmit = data => {
  console.log('表单数据:', data)
  alert('提交成功！')
}
</script>
```

## 字段类型演示

展示不同类型的表单字段：

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" />
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({})

const formOptions = {
  fields: [
    {
      name: 'text',
      label: '文本输入',
      component: 'FormInput',
      placeholder: '请输入文本',
    },
    {
      name: 'number',
      label: '数字输入',
      component: 'FormInput',
      props: { type: 'number' },
      placeholder: '请输入数字',
    },
    {
      name: 'select',
      label: '下拉选择',
      component: 'FormSelect',
      props: {
        options: [
          { label: '选项1', value: 'option1' },
          { label: '选项2', value: 'option2' },
          { label: '选项3', value: 'option3' },
        ],
      },
    },
    {
      name: 'radio',
      label: '单选框',
      component: 'FormRadio',
      props: {
        options: [
          { label: '选项A', value: 'a' },
          { label: '选项B', value: 'b' },
        ],
      },
    },
    {
      name: 'switch',
      label: '开关',
      component: 'FormSwitch',
    },
    {
      name: 'textarea',
      label: '多行文本',
      component: 'FormTextarea',
      placeholder: '请输入多行文本',
      span: 'full',
    },
  ],
  layout: {
    columns: 2,
    gap: 16,
  },
}
</script>
```

## 表单验证

基础的表单验证示例：

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" @submit="handleSubmit" />
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({})

const formOptions = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      component: 'FormInput',
      required: true,
      placeholder: '请输入用户名',
      rules: [
        { required: true, message: '请输入用户名' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符' },
      ],
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      props: { type: 'email' },
      required: true,
      placeholder: '请输入邮箱',
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
    },
  ],
  layout: {
    columns: 1,
    gap: 16,
  },
  submitButton: {
    text: '提交',
    type: 'primary',
  },
}

const handleSubmit = data => {
  console.log('验证通过，提交数据:', data)
  alert('提交成功！')
}
</script>
```

## 总结

以上示例展示了 @ldesign/form 的基础用法：

1. **基础表单** - 包含常见字段类型的简单表单
2. **字段类型** - 展示所有支持的内置字段组件
3. **表单验证** - 基础的验证规则配置

这些示例为你提供了使用 @ldesign/form 的基础模板，你可以根据实际需求进行调整和扩展。
