# 快速开始

本章节将通过实际示例帮助你快速上手 @ldesign/form。

## 第一个表单

让我们从最简单的表单开始：

```vue
<template>
  <div>
    <h2>用户注册</h2>
    <DynamicForm v-model="formData" :options="formOptions" @submit="handleSubmit" />
  </div>
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
      placeholder: '请输入用户名',
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      required: true,
      props: {
        type: 'email',
      },
      placeholder: '请输入邮箱地址',
    },
    {
      name: 'password',
      label: '密码',
      component: 'FormInput',
      required: true,
      props: {
        type: 'password',
      },
      placeholder: '请输入密码',
    },
  ],
  submitButton: {
    text: '注册',
    type: 'primary',
  },
}

const handleSubmit = data => {
  console.log('表单提交:', data)
  alert('注册成功！')
}
</script>
```

## 添加验证规则

现在让我们为表单添加验证规则：

```vue
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
      placeholder: '请输入用户名',
      rules: [
        { required: true, message: '请输入用户名' },
        { minLength: 3, message: '用户名至少3个字符' },
        { maxLength: 20, message: '用户名最多20个字符' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
      ],
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      required: true,
      props: { type: 'email' },
      placeholder: '请输入邮箱地址',
      rules: [
        { required: true, message: '请输入邮箱地址' },
        { email: true, message: '请输入有效的邮箱地址' },
      ],
    },
    {
      name: 'password',
      label: '密码',
      component: 'FormInput',
      required: true,
      props: { type: 'password' },
      placeholder: '请输入密码',
      rules: [
        { required: true, message: '请输入密码' },
        { minLength: 6, message: '密码至少6个字符' },
        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字' },
      ],
    },
    {
      name: 'confirmPassword',
      label: '确认密码',
      component: 'FormInput',
      required: true,
      props: { type: 'password' },
      placeholder: '请再次输入密码',
      rules: [
        { required: true, message: '请确认密码' },
        {
          validator: (value, formData) => {
            return value === formData.password
          },
          message: '两次输入的密码不一致',
        },
      ],
    },
  ],
}
</script>
```

## 使用不同的字段类型

@ldesign/form 提供了多种内置字段类型：

```vue
<script setup>
const formOptions = {
  fields: [
    // 文本输入
    {
      name: 'name',
      label: '姓名',
      component: 'FormInput',
      placeholder: '请输入姓名',
    },

    // 多行文本
    {
      name: 'description',
      label: '个人简介',
      component: 'FormTextarea',
      props: {
        rows: 4,
        maxlength: 200,
      },
      placeholder: '请输入个人简介',
    },

    // 下拉选择
    {
      name: 'gender',
      label: '性别',
      component: 'FormSelect',
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
          { label: '其他', value: 'other' },
        ],
      },
    },

    // 单选框
    {
      name: 'plan',
      label: '套餐选择',
      component: 'FormRadio',
      props: {
        options: [
          { label: '基础版', value: 'basic' },
          { label: '专业版', value: 'pro' },
          { label: '企业版', value: 'enterprise' },
        ],
      },
    },

    // 复选框
    {
      name: 'interests',
      label: '兴趣爱好',
      component: 'FormCheckbox',
      props: {
        options: [
          { label: '阅读', value: 'reading' },
          { label: '运动', value: 'sports' },
          { label: '音乐', value: 'music' },
          { label: '旅行', value: 'travel' },
        ],
      },
    },

    // 日期选择
    {
      name: 'birthday',
      label: '生日',
      component: 'FormDatePicker',
      props: {
        format: 'YYYY-MM-DD',
      },
    },

    // 开关
    {
      name: 'newsletter',
      label: '订阅邮件',
      component: 'FormSwitch',
      defaultValue: false,
    },

    // 滑块
    {
      name: 'age',
      label: '年龄',
      component: 'FormSlider',
      props: {
        min: 18,
        max: 100,
        step: 1,
      },
    },

    // 评分
    {
      name: 'rating',
      label: '满意度',
      component: 'FormRate',
      props: {
        max: 5,
        allowHalf: true,
      },
    },
  ],
}
</script>
```

## 配置布局

你可以配置表单的布局方式：

```vue
<script setup>
const formOptions = {
  fields: [
    // 字段配置...
  ],

  // 布局配置
  layout: {
    columns: 2, // 2列布局
    gap: 16, // 字段间距
    labelPosition: 'top', // 标签位置：top | left | right
    labelWidth: 100, // 标签宽度（当 labelPosition 为 left 或 right 时）
  },
}
</script>
```

### 响应式布局

支持响应式布局配置：

```vue
<script setup>
const formOptions = {
  fields: [
    // 字段配置...
  ],

  layout: {
    // 响应式列数配置
    columns: {
      xs: 1, // 超小屏幕：1列
      sm: 1, // 小屏幕：1列
      md: 2, // 中等屏幕：2列
      lg: 3, // 大屏幕：3列
      xl: 4, // 超大屏幕：4列
      xxl: 4, // 超超大屏幕：4列
    },
    gap: {
      horizontal: 16,
      vertical: 16,
    },
  },
}
</script>
```

### 字段跨列

某些字段可以跨多列显示：

```vue
<script setup>
const formOptions = {
  fields: [
    {
      name: 'title',
      label: '标题',
      component: 'FormInput',
      span: 2, // 跨2列
    },
    {
      name: 'firstName',
      label: '名',
      component: 'FormInput',
    },
    {
      name: 'lastName',
      label: '姓',
      component: 'FormInput',
    },
    {
      name: 'description',
      label: '描述',
      component: 'FormTextarea',
      span: 'full', // 跨全部列
    },
  ],
  layout: {
    columns: 2,
  },
}
</script>
```

## 使用 Composition API

除了组件方式，你还可以使用 Composition API：

```vue
<template>
  <div>
    <component :is="renderForm" />

    <div style="margin-top: 16px;">
      <button @click="handleValidate">验证表单</button>
      <button @click="handleReset">重置表单</button>
      <button @click="handleSubmit">提交表单</button>
    </div>

    <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
  </div>
</template>

<script setup>
import { useForm } from '@ldesign/form'

const { formData, renderForm, validate, reset, submit, setFieldValue, getFieldValue } = useForm({
  fields: [
    {
      name: 'username',
      label: '用户名',
      component: 'FormInput',
      required: true,
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      required: true,
      props: { type: 'email' },
    },
  ],
})

const handleValidate = async () => {
  const isValid = await validate()
  console.log('验证结果:', isValid)
}

const handleReset = () => {
  reset()
}

const handleSubmit = async () => {
  const isValid = await validate()
  if (isValid) {
    console.log('提交数据:', formData.value)
  }
}

// 程序化设置字段值
const setUsername = () => {
  setFieldValue('username', 'admin')
}
</script>
```

## 原生 JavaScript 使用

如果你需要在非 Vue 环境中使用：

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://unpkg.com/@ldesign/form/dist/index.umd.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@ldesign/form/dist/style.css" />
  </head>
  <body>
    <div id="form-container"></div>

    <script>
      const { createFormInstance } = LDesignForm

      const formInstance = createFormInstance({
        container: '#form-container',
        options: {
          fields: [
            {
              name: 'username',
              label: '用户名',
              component: 'FormInput',
              required: true,
            },
            {
              name: 'email',
              label: '邮箱',
              component: 'FormInput',
              required: true,
              props: { type: 'email' },
            },
          ],
        },
        onSubmit: data => {
          console.log('表单提交:', data)
        },
        onChange: data => {
          console.log('数据变化:', data)
        },
      })

      // API 操作
      formInstance.setFormData({ username: 'admin' })
      formInstance.validate().then(isValid => {
        console.log('验证结果:', isValid)
      })
    </script>
  </body>
</html>
```

## 事件处理

表单支持多种事件：

```vue
<template>
  <DynamicForm
    v-model="formData"
    :options="formOptions"
    @submit="handleSubmit"
    @reset="handleReset"
    @change="handleChange"
    @field-change="handleFieldChange"
    @field-focus="handleFieldFocus"
    @field-blur="handleFieldBlur"
    @validate="handleValidate"
  />
</template>

<script setup>
const handleSubmit = data => {
  console.log('表单提交:', data)
}

const handleReset = () => {
  console.log('表单重置')
}

const handleChange = data => {
  console.log('表单数据变化:', data)
}

const handleFieldChange = (fieldName, value, formData) => {
  console.log('字段变化:', fieldName, value)
}

const handleFieldFocus = fieldName => {
  console.log('字段获得焦点:', fieldName)
}

const handleFieldBlur = fieldName => {
  console.log('字段失去焦点:', fieldName)
}

const handleValidate = result => {
  console.log('验证结果:', result)
}
</script>
```

## 常见问题

### Q: 如何设置默认值？

A: 在字段配置中使用 `defaultValue` 属性：

```javascript
{
  name: 'username',
  label: '用户名',
  component: 'FormInput',
  defaultValue: 'admin'
}
```

### Q: 如何禁用字段？

A: 使用 `disabled` 属性：

```javascript
{
  name: 'username',
  label: '用户名',
  component: 'FormInput',
  disabled: true
}
```

### Q: 如何隐藏字段？

A: 使用 `hidden` 属性：

```javascript
{
  name: 'id',
  label: 'ID',
  component: 'FormInput',
  hidden: true
}
```

## 下一步

现在你已经掌握了基本用法，可以继续学习：

1. [基础概念](/guide/concepts) - 深入了解核心概念
2. [自定义组件](/guide/custom-components) - 学习如何创建自定义组件
3. [基础示例](/examples/basic) - 浏览基础示例
4. [动态表单](/examples/dynamic) - 学习动态表单
