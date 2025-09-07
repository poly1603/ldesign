# 快速开始

## 安装

### 使用 pnpm (推荐)
```bash
pnpm add @ldesign/form
```

### 使用 npm
```bash
npm install @ldesign/form
```

### 使用 yarn
```bash
yarn add @ldesign/form
```

## 基础用法

### 1. 创建你的第一个表单

```vue
<template>
  <div class="form-container">
    <h2>用户注册</h2>
    
    <LDesignForm
      :form="form"
      label-position="left"
      label-width="100px"
      @submit="handleSubmit"
    >
      <!-- 用户名字段 -->
      <LDesignFormItem
        name="username"
        label="用户名"
        :rules="usernameRules"
        required
      >
        <LDesignInput
          v-model="form.data.username"
          placeholder="请输入用户名"
        />
      </LDesignFormItem>
      
      <!-- 邮箱字段 -->
      <LDesignFormItem
        name="email"
        label="邮箱"
        :rules="emailRules"
        required
      >
        <LDesignInput
          v-model="form.data.email"
          type="email"
          placeholder="请输入邮箱地址"
        />
      </LDesignFormItem>
      
      <!-- 密码字段 -->
      <LDesignFormItem
        name="password"
        label="密码"
        :rules="passwordRules"
        required
      >
        <LDesignInput
          v-model="form.data.password"
          type="password"
          placeholder="请输入密码"
        />
      </LDesignFormItem>
      
      <!-- 提交按钮 -->
      <LDesignFormItem>
        <LDesignButton
          html-type="submit"
          type="primary"
          :loading="form.isSubmitting.value"
        >
          注册
        </LDesignButton>
        <LDesignButton
          html-type="reset"
          @click="form.reset()"
        >
          重置
        </LDesignButton>
      </LDesignFormItem>
    </LDesignForm>
  </div>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form/vue'
import { required, email, minLength } from '@ldesign/form/validators'
import {
  LDesignForm,
  LDesignFormItem,
  LDesignInput,
  LDesignButton
} from '@ldesign/form'

// 创建表单实例
const form = useForm({
  initialValues: {
    username: '',
    email: '',
    password: ''
  },
  validateOnChange: true,
  onSubmit: async (data) => {
    console.log('提交数据:', data)
    // 这里可以调用 API 提交数据
    await submitUserRegistration(data)
  }
})

// 验证规则
const usernameRules = [
  { validator: required(), message: '请输入用户名' },
  { validator: minLength(3), message: '用户名至少3个字符' }
]

const emailRules = [
  { validator: required(), message: '请输入邮箱地址' },
  { validator: email(), message: '请输入有效的邮箱地址' }
]

const passwordRules = [
  { validator: required(), message: '请输入密码' },
  { validator: minLength(6), message: '密码至少6个字符' }
]

// 提交处理
const handleSubmit = async (result) => {
  if (result.valid) {
    console.log('表单验证通过:', result.data)
    // 处理成功逻辑
  } else {
    console.log('表单验证失败:', result.validation)
    // 处理错误逻辑
  }
}

// 模拟 API 调用
const submitUserRegistration = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('用户注册成功:', data)
      resolve(data)
    }, 1000)
  })
}
</script>

<style scoped>
.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}
</style>
```

### 2. 查询表单示例

```vue
<template>
  <div class="search-container">
    <h2>用户搜索</h2>
    
    <LDesignQueryForm
      :fields="searchFields"
      :col-count="3"
      :default-row-count="1"
      :collapsed="true"
      :show-collapse-button="true"
      submit-text="搜索"
      reset-text="重置"
      @submit="handleSearch"
      @reset="handleReset"
    />
    
    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="results">
      <h3>搜索结果 ({{ searchResults.length }})</h3>
      <div v-for="user in searchResults" :key="user.id" class="result-item">
        <strong>{{ user.name }}</strong> - {{ user.email }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LDesignQueryForm } from '@ldesign/form'

// 搜索字段配置
const searchFields = [
  {
    name: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '请输入用户名或邮箱'
  },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '全部', value: '' },
      { label: '活跃', value: 'active' },
      { label: '禁用', value: 'disabled' }
    ]
  },
  {
    name: 'dateRange',
    label: '注册时间',
    type: 'dateRange',
    placeholder: ['开始日期', '结束日期']
  },
  {
    name: 'age',
    label: '年龄范围',
    type: 'numberRange',
    placeholder: ['最小年龄', '最大年龄']
  }
]

// 搜索结果
const searchResults = ref([])

// 搜索处理
const handleSearch = async (values) => {
  console.log('搜索参数:', values)
  
  // 模拟 API 调用
  try {
    const results = await searchUsers(values)
    searchResults.value = results
  } catch (error) {
    console.error('搜索失败:', error)
  }
}

// 重置处理
const handleReset = () => {
  searchResults.value = []
  console.log('搜索已重置')
}

// 模拟搜索 API
const searchUsers = async (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResults = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ]
      resolve(mockResults)
    }, 500)
  })
}
</script>

<style scoped>
.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.results {
  margin-top: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.result-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.result-item:last-child {
  border-bottom: none;
}
</style>
```

## 核心概念

### 1. 表单实例 (Form Instance)

表单实例是 @ldesign/form 的核心，它管理表单的状态、验证和提交。

```typescript
import { useForm } from '@ldesign/form/vue'

const form = useForm({
  initialValues: { name: '', email: '' },
  validateOnChange: true,
  onSubmit: (data) => console.log(data)
})

// 表单实例提供的属性和方法
console.log(form.data.value)        // 表单数据
console.log(form.isValid.value)     // 是否有效
console.log(form.isSubmitting.value) // 是否正在提交
console.log(form.isDirty.value)     // 是否有变化

form.setFieldValue('name', 'John')   // 设置字段值
form.validateForm()                  // 验证表单
form.submit()                        // 提交表单
form.reset()                         // 重置表单
```

### 2. 字段注册 (Field Registration)

字段需要注册到表单实例中才能被管理。

```typescript
// 手动注册字段
const nameField = form.registerField({
  name: 'name',
  rules: [{ validator: required(), message: '请输入姓名' }]
})

// 或者使用 useField Hook
const nameField = useField('name', {
  rules: [{ validator: required(), message: '请输入姓名' }]
})
```

### 3. 验证规则 (Validation Rules)

@ldesign/form 提供了丰富的内置验证器。

```typescript
import {
  required,
  email,
  minLength,
  maxLength,
  pattern,
  range
} from '@ldesign/form/validators'

const rules = [
  { validator: required(), message: '此字段为必填项' },
  { validator: email(), message: '请输入有效的邮箱地址' },
  { validator: minLength(6), message: '至少6个字符' },
  { validator: maxLength(20), message: '最多20个字符' },
  { validator: pattern(/^\d+$/), message: '只能输入数字' },
  { validator: range(18, 65), message: '年龄必须在18-65之间' }
]
```

### 4. 自定义验证器

你可以创建自定义验证器来满足特殊需求。

```typescript
// 同步验证器
const customValidator = (value) => {
  return value !== 'admin' // 不能使用 'admin' 作为用户名
}

// 异步验证器
const asyncValidator = async (value) => {
  const response = await fetch(`/api/check-username?name=${value}`)
  const result = await response.json()
  return !result.exists // 用户名不存在才通过验证
}

// 使用自定义验证器
const usernameRules = [
  { validator: required(), message: '请输入用户名' },
  { validator: customValidator, message: '不能使用 admin 作为用户名' },
  { validator: asyncValidator, message: '该用户名已被占用' }
]
```

## 常见场景

### 1. 动态表单

```vue
<template>
  <LDesignForm :form="form">
    <FieldArray name="contacts" :min="1" :max="5">
      <template #default="{ field, index, remove }">
        <div class="contact-group">
          <h4>联系人 {{ index + 1 }}</h4>
          
          <LDesignFormItem :name="`contacts.${index}.name`" label="姓名">
            <LDesignInput v-model="field.value.name" />
          </LDesignFormItem>
          
          <LDesignFormItem :name="`contacts.${index}.phone`" label="电话">
            <LDesignInput v-model="field.value.phone" />
          </LDesignFormItem>
          
          <LDesignButton @click="remove" type="error" size="small">
            删除
          </LDesignButton>
        </div>
      </template>
      
      <template #add="{ add }">
        <LDesignButton @click="() => add({ name: '', phone: '' })">
          添加联系人
        </LDesignButton>
      </template>
    </FieldArray>
  </LDesignForm>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form/vue'
import { FieldArray } from '@ldesign/form'

const form = useForm({
  initialValues: {
    contacts: [{ name: '', phone: '' }]
  }
})
</script>
```

### 2. 分步表单

```vue
<template>
  <div class="wizard-form">
    <div class="steps">
      <div
        v-for="(step, index) in steps"
        :key="step.key"
        :class="['step', { active: currentStep === index, completed: index < currentStep }]"
      >
        {{ step.title }}
      </div>
    </div>
    
    <LDesignForm :form="form">
      <component
        :is="steps[currentStep].component"
        :form="form"
      />
      
      <div class="actions">
        <LDesignButton
          v-if="currentStep > 0"
          @click="prevStep"
        >
          上一步
        </LDesignButton>
        
        <LDesignButton
          v-if="currentStep < steps.length - 1"
          @click="nextStep"
          type="primary"
        >
          下一步
        </LDesignButton>
        
        <LDesignButton
          v-else
          @click="form.submit()"
          type="primary"
          :loading="form.isSubmitting.value"
        >
          提交
        </LDesignButton>
      </div>
    </LDesignForm>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '@ldesign/form/vue'
import BasicInfoStep from './steps/BasicInfoStep.vue'
import ContactInfoStep from './steps/ContactInfoStep.vue'
import ConfirmStep from './steps/ConfirmStep.vue'

const currentStep = ref(0)

const steps = [
  { key: 'basic', title: '基本信息', component: BasicInfoStep },
  { key: 'contact', title: '联系信息', component: ContactInfoStep },
  { key: 'confirm', title: '确认信息', component: ConfirmStep }
]

const form = useForm({
  initialValues: {
    basic: { name: '', age: 0 },
    contact: { email: '', phone: '' }
  }
})

const nextStep = async () => {
  // 验证当前步骤
  const stepFields = getStepFields(currentStep.value)
  const isValid = await validateStepFields(stepFields)
  
  if (isValid) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const getStepFields = (step: number) => {
  const fieldMap = {
    0: ['basic.name', 'basic.age'],
    1: ['contact.email', 'contact.phone'],
    2: []
  }
  return fieldMap[step] || []
}

const validateStepFields = async (fields: string[]) => {
  for (const field of fields) {
    const result = await form.validateField(field)
    if (!result.valid) {
      return false
    }
  }
  return true
}
</script>
```

## 下一步

现在你已经掌握了 @ldesign/form 的基础用法，可以：

1. 查看 [API 文档](./API.md) 了解更多详细信息
2. 阅读 [最佳实践](./guide/best-practices.md) 学习高级技巧
3. 查看 [示例项目](../examples/) 获取更多灵感
4. 参考 [组件文档](./TSX_COMPONENTS.md) 了解所有可用组件
