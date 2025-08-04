# 快速开始

本指南将帮助您快速上手自适应表单布局系统。

## 安装

### 使用 npm

```bash
npm install @ldesign/form
```

### 使用 yarn

```bash
yarn add @ldesign/form
```

### 使用 pnpm

```bash
pnpm add @ldesign/form
```

## 基础用法

### 原生JavaScript

```javascript
import { AdaptiveForm } from '@ldesign/form'

// 创建表单实例
const form = new AdaptiveForm({
  selector: '#form-container',
  items: [
    { key: 'name', label: '姓名', type: 'input', required: true },
    { key: 'email', label: '邮箱', type: 'email', required: true },
    { key: 'phone', label: '电话', type: 'tel' },
    { key: 'company', label: '公司', type: 'input' }
  ],
  layout: {
    maxColumns: 2,
    gap: { horizontal: 16, vertical: 16 }
  }
})

// 监听表单变化
form.on('change', (data) => {
  console.log('表单值变化:', data)
})

// 获取表单值
const values = form.getValue()
console.log('当前表单值:', values)
```

### Vue3组件

```vue
<script setup>
import { AdaptiveForm } from '@ldesign/form/vue'
import { ref } from 'vue'

const formData = ref({})

const formConfig = ref({
  items: [
    { key: 'name', label: '姓名', type: 'input', required: true },
    { key: 'email', label: '邮箱', type: 'email', required: true },
    { key: 'phone', label: '电话', type: 'tel' },
    { key: 'company', label: '公司', type: 'input' }
  ],
  layout: {
    maxColumns: 2,
    gap: { horizontal: 16, vertical: 16 }
  },
  validation: {
    validateOnChange: true,
    showErrorMessage: true
  }
})

function handleChange(data) {
  console.log('表单变化:', data)
}

function handleValidation(data) {
  console.log('验证结果:', data)
}

function submitForm() {
  console.log('提交表单:', formData.value)
}

function resetForm() {
  formData.value = {}
}
</script>

<template>
  <div>
    <AdaptiveForm
      v-model="formData"
      :config="formConfig"
      @change="handleChange"
      @validation-change="handleValidation"
    />

    <div class="form-actions">
      <button @click="submitForm">
        提交
      </button>
      <button @click="resetForm">
        重置
      </button>
    </div>
  </div>
</template>
```

### Vue3 Hook

```vue
<script setup>
import { useAdaptiveForm } from '@ldesign/form/vue'
import { onMounted, ref } from 'vue'

const formContainer = ref()

const formConfig = ref({
  items: [
    { key: 'name', label: '姓名', type: 'input', required: true },
    { key: 'email', label: '邮箱', type: 'email', required: true },
    { key: 'phone', label: '电话', type: 'tel' }
  ]
})

const {
  values,
  errors,
  isValid,
  isDirty,
  setValue,
  validate,
  reset,
  mount
} = useAdaptiveForm(formConfig, {
  immediate: false
})

onMounted(() => {
  mount(formContainer.value)
})

async function validateForm() {
  const result = await validate()
  console.log('验证结果:', result)
}

function resetForm() {
  reset()
}
</script>

<template>
  <div>
    <div ref="formContainer" class="form-container" />

    <div class="form-info">
      <p>表单有效: {{ isValid }}</p>
      <p>已修改: {{ isDirty }}</p>
      <pre>{{ JSON.stringify(values, null, 2) }}</pre>
    </div>

    <div class="form-actions">
      <button @click="validateForm">
        验证
      </button>
      <button @click="resetForm">
        重置
      </button>
    </div>
  </div>
</template>
```

## 核心概念

### 表单配置 (FormConfig)

表单配置是系统的核心，包含以下主要部分：

- **items**: 表单项配置数组
- **layout**: 布局配置
- **display**: 显示配置
- **validation**: 验证配置
- **behavior**: 行为配置

### 表单项 (FormItem)

每个表单项包含以下属性：

- **key**: 唯一标识符
- **label**: 显示标签
- **type**: 表单项类型
- **required**: 是否必填
- **validation**: 验证规则

### 布局引擎

系统会根据容器宽度和配置自动计算：

- 最佳列数
- 表单项位置
- 响应式断点
- 展开收起逻辑

## 下一步

- 了解[基础概念](/guide/concepts)
- 查看[自适应布局](/guide/adaptive-layout)详细说明
- 探索[API文档](/api/form-manager)
- 查看更多[示例](/examples/basic)
