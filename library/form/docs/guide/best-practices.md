# 最佳实践指南

## 表单设计原则

### 1. 用户体验优先

#### 清晰的标签和提示
```vue
<template>
  <!-- ✅ 好的做法 -->
  <LDesignFormItem
    name="email"
    label="邮箱地址"
    help="我们将向此邮箱发送确认信息"
    placeholder="请输入您的邮箱地址"
  >
    <LDesignInput v-model="form.data.email" type="email" />
  </LDesignFormItem>

  <!-- ❌ 避免的做法 -->
  <LDesignFormItem name="email">
    <LDesignInput v-model="form.data.email" />
  </LDesignFormItem>
</template>
```

#### 合理的验证时机
```typescript
// ✅ 推荐：根据字段类型选择验证时机
const form = useForm({
  initialValues: { username: '', email: '', password: '' },
  // 用户名：输入时验证（实时反馈）
  // 邮箱：失焦时验证（避免频繁请求）
  // 密码：提交时验证（隐私考虑）
})

const usernameField = form.registerField({
  name: 'username',
  validateOnChange: true,
  validateOnBlur: false,
  rules: [{ validator: required(), message: '请输入用户名' }]
})

const emailField = form.registerField({
  name: 'email',
  validateOnChange: false,
  validateOnBlur: true,
  rules: [
    { validator: required(), message: '请输入邮箱' },
    { validator: email(), message: '请输入有效的邮箱地址' }
  ]
})
```

### 2. 性能优化

#### 避免不必要的重新渲染
```vue
<script setup lang="ts">
// ✅ 使用 computed 缓存计算结果
const isFormValid = computed(() => form.isValid.value)
const hasErrors = computed(() => Object.keys(form.validation.value).length > 0)

// ✅ 使用 watchEffect 进行副作用处理
watchEffect(() => {
  if (form.isDirty.value) {
    // 自动保存草稿
    saveDraft(form.getValues())
  }
})

// ❌ 避免在模板中直接计算
// <div v-if="Object.keys(form.validation.value).length > 0">
</script>
```

#### 合理使用字段依赖
```typescript
// ✅ 明确声明字段依赖
const confirmPasswordField = form.registerField({
  name: 'confirmPassword',
  dependencies: ['password'], // 明确依赖关系
  rules: [
    {
      validator: (value, { getFieldValue }) => {
        const password = getFieldValue('password')
        return !value || value === password
      },
      message: '两次输入的密码不一致'
    }
  ]
})

// ❌ 避免隐式依赖
const badConfirmPasswordField = form.registerField({
  name: 'confirmPassword',
  rules: [
    {
      validator: (value) => {
        // 隐式依赖，可能导致验证不及时
        const password = form.getFieldValue('password')
        return !value || value === password
      }
    }
  ]
})
```

## 表单架构设计

### 1. 组件化设计

#### 创建可复用的表单组件
```vue
<!-- UserProfileForm.vue -->
<template>
  <LDesignForm :form="form" @submit="handleSubmit">
    <BasicInfoSection :form="form" />
    <ContactInfoSection :form="form" />
    <PreferencesSection :form="form" />
    
    <LDesignFormItem>
      <LDesignButton html-type="submit" type="primary" :loading="form.isSubmitting.value">
        保存
      </LDesignButton>
    </LDesignFormItem>
  </LDesignForm>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/form/vue'
import BasicInfoSection from './sections/BasicInfoSection.vue'
import ContactInfoSection from './sections/ContactInfoSection.vue'
import PreferencesSection from './sections/PreferencesSection.vue'

const form = useForm({
  initialValues: {
    basic: { name: '', age: 0 },
    contact: { email: '', phone: '' },
    preferences: { theme: 'light', notifications: true }
  }
})

const handleSubmit = async (result) => {
  if (result.valid) {
    await updateUserProfile(result.data)
  }
}
</script>
```

#### 表单区块组件
```vue
<!-- BasicInfoSection.vue -->
<template>
  <div class="form-section">
    <h3>基本信息</h3>
    
    <LDesignFormItem
      name="basic.name"
      label="姓名"
      :rules="nameRules"
      required
    >
      <LDesignInput v-model="form.data.basic.name" />
    </LDesignFormItem>
    
    <LDesignFormItem
      name="basic.age"
      label="年龄"
      :rules="ageRules"
    >
      <LDesignInputNumber v-model="form.data.basic.age" :min="0" :max="120" />
    </LDesignFormItem>
  </div>
</template>

<script setup lang="ts">
import { required, range } from '@ldesign/form/validators'

interface Props {
  form: ReactiveFormInstance
}

const props = defineProps<Props>()

const nameRules = [
  { validator: required(), message: '请输入姓名' }
]

const ageRules = [
  { validator: range(0, 120), message: '年龄必须在0-120之间' }
]

// 注册字段
props.form.registerField({ name: 'basic.name', rules: nameRules })
props.form.registerField({ name: 'basic.age', rules: ageRules })
</script>
```

### 2. 状态管理

#### 使用 Pinia 管理复杂表单状态
```typescript
// stores/formStore.ts
import { defineStore } from 'pinia'
import { useForm } from '@ldesign/form/vue'

export const useFormStore = defineStore('form', () => {
  const forms = ref(new Map())
  
  const createForm = (id: string, config: FormConfig) => {
    const form = useForm(config)
    forms.value.set(id, form)
    return form
  }
  
  const getForm = (id: string) => {
    return forms.value.get(id)
  }
  
  const removeForm = (id: string) => {
    forms.value.delete(id)
  }
  
  const saveDraft = (id: string) => {
    const form = getForm(id)
    if (form) {
      localStorage.setItem(`form-draft-${id}`, JSON.stringify(form.getValues()))
    }
  }
  
  const loadDraft = (id: string) => {
    const draft = localStorage.getItem(`form-draft-${id}`)
    if (draft) {
      const form = getForm(id)
      if (form) {
        form.setValues(JSON.parse(draft))
      }
    }
  }
  
  return {
    forms: readonly(forms),
    createForm,
    getForm,
    removeForm,
    saveDraft,
    loadDraft
  }
})
```

## 验证策略

### 1. 分层验证

#### 客户端验证
```typescript
import { required, email, minLength, pattern } from '@ldesign/form/validators'

// 基础验证
const basicRules = [
  { validator: required(), message: '此字段为必填项' }
]

// 格式验证
const emailRules = [
  ...basicRules,
  { validator: email(), message: '请输入有效的邮箱地址' }
]

// 复杂验证
const passwordRules = [
  ...basicRules,
  { validator: minLength(8), message: '密码至少8个字符' },
  { 
    validator: pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    message: '密码必须包含大小写字母和数字'
  }
]
```

#### 服务端验证
```typescript
// 异步验证器
const createAsyncValidator = (endpoint: string) => {
  return async (value: any) => {
    if (!value) return true
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      })
      
      const result = await response.json()
      return result.valid
    } catch (error) {
      console.error('验证请求失败:', error)
      return true // 网络错误时不阻止提交
    }
  }
}

// 使用异步验证
const usernameField = form.registerField({
  name: 'username',
  rules: [
    { validator: required(), message: '请输入用户名' },
    { 
      validator: createAsyncValidator('/api/validate-username'),
      message: '该用户名已被占用'
    }
  ]
})
```

### 2. 错误处理

#### 统一错误处理
```typescript
// composables/useFormError.ts
export const useFormError = () => {
  const handleValidationError = (validation: Record<string, ValidationResult>) => {
    const errors = Object.entries(validation)
      .filter(([, result]) => !result.valid)
      .map(([field, result]) => ({ field, message: result.message }))
    
    if (errors.length > 0) {
      // 显示第一个错误
      const firstError = errors[0]
      ElMessage.error(`${firstError.field}: ${firstError.message}`)
      
      // 聚焦到第一个错误字段
      const element = document.querySelector(`[name="${firstError.field}"]`)
      if (element) {
        (element as HTMLElement).focus()
      }
    }
  }
  
  const handleSubmitError = (error: any) => {
    if (error.response?.status === 422) {
      // 处理服务端验证错误
      const serverErrors = error.response.data.errors
      Object.entries(serverErrors).forEach(([field, messages]) => {
        form.setFieldError(field, (messages as string[])[0])
      })
    } else {
      // 处理其他错误
      ElMessage.error('提交失败，请稍后重试')
    }
  }
  
  return {
    handleValidationError,
    handleSubmitError
  }
}
```

## 可访问性

### 1. 键盘导航

```vue
<template>
  <LDesignForm
    :form="form"
    @keydown="handleKeyDown"
    role="form"
    aria-label="用户注册表单"
  >
    <LDesignFormItem
      name="username"
      label="用户名"
      required
      :aria-describedby="usernameField.hasError.value ? 'username-error' : 'username-help'"
    >
      <LDesignInput
        v-model="form.data.username"
        aria-required="true"
        :aria-invalid="usernameField.hasError.value"
      />
      <div id="username-help" class="help-text">
        用户名将用于登录
      </div>
      <div
        v-if="usernameField.hasError.value"
        id="username-error"
        class="error-text"
        role="alert"
        aria-live="polite"
      >
        {{ usernameField.validation.value.message }}
      </div>
    </LDesignFormItem>
  </LDesignForm>
</template>

<script setup lang="ts">
const handleKeyDown = (event: KeyboardEvent) => {
  // Enter 键提交表单
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault()
    form.submit()
  }
  
  // Escape 键重置表单
  if (event.key === 'Escape') {
    event.preventDefault()
    form.reset()
  }
}
</script>
```

### 2. 屏幕阅读器支持

```vue
<template>
  <div role="region" aria-label="表单验证状态">
    <div
      v-if="form.isSubmitting.value"
      role="status"
      aria-live="polite"
    >
      正在提交表单...
    </div>
    
    <div
      v-if="!form.isValid.value && form.isSubmitted.value"
      role="alert"
      aria-live="assertive"
    >
      表单包含 {{ errorCount }} 个错误，请检查并修正
    </div>
  </div>
</template>

<script setup lang="ts">
const errorCount = computed(() => {
  return Object.values(form.validation.value)
    .filter(result => !result.valid)
    .length
})
</script>
```

## 测试策略

### 1. 单元测试

```typescript
// __tests__/UserForm.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UserForm from '../UserForm.vue'

describe('UserForm', () => {
  it('应该正确验证必填字段', async () => {
    const wrapper = mount(UserForm)
    
    // 提交空表单
    await wrapper.find('form').trigger('submit')
    
    // 检查错误信息
    expect(wrapper.find('.error-message').text()).toContain('请输入用户名')
  })
  
  it('应该在输入有效数据后提交成功', async () => {
    const wrapper = mount(UserForm)
    
    // 输入有效数据
    await wrapper.find('input[name="username"]').setValue('testuser')
    await wrapper.find('input[name="email"]').setValue('test@example.com')
    
    // 提交表单
    await wrapper.find('form').trigger('submit')
    
    // 检查提交事件
    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
```

### 2. 集成测试

```typescript
// __tests__/integration/FormFlow.test.ts
import { describe, it, expect } from 'vitest'
import { createApp } from 'vue'
import { mount } from '@vue/test-utils'

describe('表单流程集成测试', () => {
  it('应该完成完整的用户注册流程', async () => {
    const wrapper = mount(RegistrationForm)
    
    // 步骤1：填写基本信息
    await wrapper.find('input[name="username"]').setValue('newuser')
    await wrapper.find('input[name="email"]').setValue('new@example.com')
    await wrapper.find('button[type="button"]').trigger('click') // 下一步
    
    // 步骤2：填写详细信息
    await wrapper.find('input[name="firstName"]').setValue('John')
    await wrapper.find('input[name="lastName"]').setValue('Doe')
    await wrapper.find('button[type="button"]').trigger('click') // 下一步
    
    // 步骤3：确认信息
    expect(wrapper.find('.summary').text()).toContain('newuser')
    await wrapper.find('button[type="submit"]').trigger('click') // 提交
    
    // 验证最终结果
    expect(wrapper.emitted('success')).toBeTruthy()
  })
})
```
