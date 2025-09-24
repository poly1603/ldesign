# 快速开始

本指南将帮助您快速上手 @ldesign/form。

## 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/form

# 使用 npm
npm install @ldesign/form

# 使用 yarn
yarn add @ldesign/form
```

## 基础概念

### 字段配置

每个表单字段都通过 `FieldConfig` 对象进行配置：

```typescript
const field: FieldConfig = {
  name: 'username',        // 字段名称（必填）
  type: 'input',          // 字段类型
  label: '用户名',         // 显示标签
  placeholder: '请输入用户名', // 占位符
  span: 2,                // 占用列数
  rules: [                // 验证规则
    { type: 'required', message: '用户名不能为空' },
    { type: 'minLength', value: 3, message: '用户名至少3个字符' }
  ]
}
```

### 表单配置

整个表单通过 `FormConfig` 对象进行配置：

```typescript
const formConfig: FormConfig = {
  fields: [
    // 字段配置数组
  ],
  layout: {
    columns: 4,           // 总列数
    spanWidth: 200,       // 每列宽度
    previewRows: 2,       // 预览行数
    autoResponsive: true  // 自动响应式
  },
  buttons: {
    submit: true,         // 显示提交按钮
    reset: true,          // 显示重置按钮
    submitText: '提交',   // 提交按钮文本
    resetText: '重置'     // 重置按钮文本
  }
}
```

## Vue 3 使用

### 1. 使用 useForm Hook

```vue
<template>
  <div>
    <!-- 手动渲染字段 -->
    <div v-for="field in layoutResult.preview" :key="field.name">
      <label>{{ field.label }}</label>
      <input
        :type="field.type"
        :value="formState.values[field.name]"
        @input="setFieldValue(field.name, $event.target.value)"
      />
      <div v-if="formState.errors[field.name]" class="error">
        {{ formState.errors[field.name].join(', ') }}
      </div>
    </div>
    
    <!-- 展开更多字段 -->
    <div v-if="layoutResult.more.length > 0">
      <button @click="toggleExpanded">
        {{ expanded ? '收起' : '展开' }}
      </button>
      <div v-if="expanded">
        <div v-for="field in layoutResult.more" :key="field.name">
          <!-- 渲染更多字段 -->
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <button @click="submit" :disabled="!formState.valid">提交</button>
    <button @click="reset">重置</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '@ldesign/form'

const formConfig = ref({
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
      type: 'email',
      rules: [
        { type: 'required', message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式不正确' }
      ]
    }
  ]
})

const {
  formState,
  layoutResult,
  expanded,
  setFieldValue,
  submit,
  reset,
  toggleExpanded
} = useForm(formConfig, {
  onSubmit: (values) => {
    console.log('提交数据:', values)
  },
  onChange: (values, fieldName, fieldValue) => {
    console.log('表单变化:', { values, fieldName, fieldValue })
  }
})
</script>
```

### 2. 使用 LDesignForm 组件

```vue
<template>
  <LDesignForm
    :fields="fields"
    :value="formData"
    :layout="layout"
    :buttons="buttons"
    @update:value="handleChange"
    @submit="handleSubmit"
    @field-change="handleFieldChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LDesignForm } from '@ldesign/form/vue'

const formData = ref({})

const fields = [
  {
    name: 'title',
    label: '标题',
    type: 'input',
    span: 4,
    rules: [{ type: 'required', message: '请输入标题' }]
  },
  {
    name: 'category',
    label: '分类',
    type: 'select',
    span: 2,
    options: [
      { value: 'tech', label: '技术' },
      { value: 'life', label: '生活' }
    ]
  },
  {
    name: 'tags',
    label: '标签',
    type: 'input',
    span: 2,
    placeholder: '多个标签用逗号分隔'
  },
  {
    name: 'content',
    label: '内容',
    type: 'textarea',
    span: 4,
    rows: 5
  }
]

const layout = {
  columns: 4,
  spanWidth: 200,
  previewRows: 2,
  autoResponsive: true
}

const buttons = {
  submit: true,
  reset: true,
  submitText: '发布',
  resetText: '重置'
}

const handleChange = (values) => {
  formData.value = values
}

const handleSubmit = (values) => {
  console.log('发布文章:', values)
}

const handleFieldChange = (fieldName, value, values) => {
  console.log(`字段 ${fieldName} 变化:`, value)
}
</script>
```

## Lit Web Components 使用

### 1. 基础使用

```typescript
import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@ldesign/form/lit'

@customElement('my-form')
export class MyForm extends LitElement {
  @state()
  private fields = [
    {
      name: 'username',
      label: '用户名',
      type: 'input',
      rules: [{ type: 'required', message: '请输入用户名' }]
    },
    {
      name: 'password',
      label: '密码',
      type: 'password',
      rules: [
        { type: 'required', message: '请输入密码' },
        { type: 'minLength', value: 6, message: '密码至少6位' }
      ]
    }
  ]

  @state()
  private formData = {}

  private handleSubmit = (e: CustomEvent) => {
    console.log('登录:', e.detail)
  }

  private handleChange = (e: CustomEvent) => {
    this.formData = e.detail
  }

  render() {
    return html`
      <ldesign-form
        .fields=${this.fields}
        .value=${this.formData}
        @submit=${this.handleSubmit}
        @value-change=${this.handleChange}
      ></ldesign-form>
    `
  }

  static styles = css`
    :host {
      display: block;
      padding: 20px;
    }
  `
}
```

### 2. 使用 FormMixin

```typescript
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { FormMixin } from '@ldesign/form/lit'

@customElement('custom-form')
export class CustomForm extends FormMixin(LitElement) {
  constructor() {
    super()
    this.formConfig = {
      fields: [
        {
          name: 'name',
          label: '姓名',
          type: 'input',
          rules: [{ type: 'required', message: '请输入姓名' }]
        }
      ]
    }
  }

  private handleSubmitClick = () => {
    this.submit()
  }

  render() {
    return html`
      <div>
        ${this.renderFields()}
        <button @click=${this.handleSubmitClick}>提交</button>
      </div>
    `
  }

  private renderFields() {
    return this.layoutResult.preview.map(field => html`
      <div>
        <label>${field.label}</label>
        <input
          type=${field.type}
          .value=${this.formState.values[field.name] || ''}
          @input=${(e: Event) => {
            const target = e.target as HTMLInputElement
            this.setFieldValue(field.name, target.value)
          }}
        />
        ${this.formState.errors[field.name] ? html`
          <div class="error">
            ${this.formState.errors[field.name].join(', ')}
          </div>
        ` : ''}
      </div>
    `)
  }
}
```

## Vanilla JavaScript 使用

```typescript
import { VanillaForm } from '@ldesign/form'

// 获取容器元素
const container = document.getElementById('form-container')

// 创建表单实例
const form = new VanillaForm(container, {
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'input',
      rules: [{ type: 'required', message: '请输入姓名' }]
    },
    {
      name: 'age',
      label: '年龄',
      type: 'number',
      min: 0,
      max: 120,
      rules: [
        { type: 'required', message: '请输入年龄' },
        { type: 'min', value: 0, message: '年龄不能小于0' },
        { type: 'max', value: 120, message: '年龄不能大于120' }
      ]
    },
    {
      name: 'bio',
      label: '个人简介',
      type: 'textarea',
      rows: 3,
      span: 4
    }
  ],
  layout: {
    columns: 4,
    spanWidth: 200,
    previewRows: 2
  },
  buttons: {
    submit: true,
    reset: true
  }
}, {
  onChange: (values, fieldName, fieldValue) => {
    console.log('表单变化:', { values, fieldName, fieldValue })
  },
  onSubmit: (values) => {
    console.log('提交数据:', values)
    // 这里可以发送到服务器
  },
  onValidate: (errors, valid) => {
    console.log('验证结果:', { errors, valid })
  }
})

// 手动操作表单
form.setFieldValue('name', 'John Doe')
form.setValues({ name: 'John', age: 25 })

const currentValues = form.getValues()
console.log('当前值:', currentValues)

// 验证表单
form.validate().then(valid => {
  console.log('表单是否有效:', valid)
})

// 销毁表单（清理资源）
// form.destroy()
```

## 下一步

- 查看 [API 文档](./API.md) 了解详细的接口说明
- 查看 [示例项目](../examples/) 了解更多使用场景
- 查看 [主题定制](./THEMING.md) 了解如何自定义样式
- 查看 [性能优化](./PERFORMANCE.md) 了解性能最佳实践
