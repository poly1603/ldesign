# useForm

表单管理 Hook，提供完整的表单状态管理、验证、提交等功能，简化复杂表单的开发。

## 概述

`useForm` 是一个强大的表单管理 Hook，提供以下核心功能：
- **表单状态管理**：统一管理表单数据、验证状态、提交状态等
- **字段验证**：支持同步和异步验证规则
- **错误处理**：统一的错误收集和显示机制
- **表单重置**：支持重置到初始值或指定值
- **脏值检测**：检测表单是否被修改
- **提交处理**：内置提交流程和状态管理

## 安装和导入

```typescript
import { useForm } from '@ldesign/shared'
```

## API 参考

### 基础用法

**函数签名**
```typescript
interface FormField<T = any> {
  value: T
  error: string | null
  touched: boolean
  validating: boolean
}

interface FormOptions<T> {
  initialValues: T
  validationRules?: Partial<Record<keyof T, ValidationRule[]>>
  onSubmit?: (values: T) => Promise<void> | void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  validating: boolean
  submitting: boolean
  dirty: boolean
  valid: boolean
}

function useForm<T extends Record<string, any>>(
  options: FormOptions<T>
): {
  state: Ref<FormState<T>>
  fields: Record<keyof T, Ref<FormField>>
  setValue: (field: keyof T, value: any) => void
  setError: (field: keyof T, error: string | null) => void
  validateField: (field: keyof T) => Promise<boolean>
  validateForm: () => Promise<boolean>
  resetForm: (values?: Partial<T>) => void
  submitForm: () => Promise<void>
  getFieldProps: (field: keyof T) => FieldProps
}
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| options | FormOptions\<T\> | ✓ | - | 表单配置选项 |

**选项说明**

| 选项 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| initialValues | T | ✓ | - | 表单初始值 |
| validationRules | object | ✗ | {} | 验证规则 |
| onSubmit | Function | ✗ | - | 提交处理函数 |
| validateOnChange | boolean | ✗ | true | 值变化时是否验证 |
| validateOnBlur | boolean | ✗ | true | 失焦时是否验证 |

## 使用示例

### 基础用户注册表单

```vue
<template>
  <form @submit.prevent="submitForm" class="registration-form">
    <div class="form-group">
      <label for="username">用户名</label>
      <input
        id="username"
        v-bind="getFieldProps('username')"
        placeholder="请输入用户名"
        :class="{ error: fields.username.error }"
      />
      <div v-if="fields.username.error" class="error-message">
        {{ fields.username.error }}
      </div>
    </div>

    <div class="form-group">
      <label for="email">邮箱</label>
      <input
        id="email"
        type="email"
        v-bind="getFieldProps('email')"
        placeholder="请输入邮箱地址"
        :class="{ error: fields.email.error }"
      />
      <div v-if="fields.email.error" class="error-message">
        {{ fields.email.error }}
      </div>
    </div>

    <div class="form-group">
      <label for="password">密码</label>
      <input
        id="password"
        type="password"
        v-bind="getFieldProps('password')"
        placeholder="请输入密码"
        :class="{ error: fields.password.error }"
      />
      <div v-if="fields.password.error" class="error-message">
        {{ fields.password.error }}
      </div>
    </div>

    <div class="form-group">
      <label for="confirmPassword">确认密码</label>
      <input
        id="confirmPassword"
        type="password"
        v-bind="getFieldProps('confirmPassword')"
        placeholder="请再次输入密码"
        :class="{ error: fields.confirmPassword.error }"
      />
      <div v-if="fields.confirmPassword.error" class="error-message">
        {{ fields.confirmPassword.error }}
      </div>
    </div>

    <div class="form-actions">
      <button 
        type="button" 
        @click="resetForm"
        :disabled="state.submitting"
      >
        重置
      </button>
      <button 
        type="submit" 
        :disabled="!state.valid || state.submitting"
        :class="{ loading: state.submitting }"
      >
        {{ state.submitting ? '注册中...' : '注册' }}
      </button>
    </div>

    <div class="form-status">
      <p>表单状态: {{ state.dirty ? '已修改' : '未修改' }}</p>
      <p>验证状态: {{ state.valid ? '通过' : '未通过' }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useForm, isValidEmail } from '@ldesign/shared'

interface RegistrationForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const {
  state,
  fields,
  setValue,
  setError,
  validateField,
  validateForm,
  resetForm,
  submitForm,
  getFieldProps
} = useForm<RegistrationForm>({
  initialValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  },
  
  validationRules: {
    username: [
      { required: true, message: '用户名不能为空' },
      { min: 3, message: '用户名至少需要3个字符' },
      { max: 20, message: '用户名不能超过20个字符' },
      { 
        pattern: /^[a-zA-Z0-9_]+$/, 
        message: '用户名只能包含字母、数字和下划线' 
      }
    ],
    
    email: [
      { required: true, message: '邮箱不能为空' },
      { 
        validator: (value) => isValidEmail(value) || '请输入有效的邮箱地址' 
      }
    ],
    
    password: [
      { required: true, message: '密码不能为空' },
      { min: 8, message: '密码至少需要8个字符' },
      { 
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        message: '密码必须包含大小写字母和数字' 
      }
    ],
    
    confirmPassword: [
      { required: true, message: '请确认密码' },
      {
        validator: (value, formValues) => {
          return value === formValues.password || '两次输入的密码不一致'
        }
      }
    ]
  },
  
  async onSubmit(values) {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }
      
      console.log('注册成功')
      // 重定向到登录页面或显示成功消息
    } catch (error) {
      console.error('注册失败:', error.message)
      // 显示错误消息
    }
  },
  
  validateOnChange: true,
  validateOnBlur: true
})
</script>
```

### 动态表单字段

```vue
<template>
  <form @submit.prevent="submitForm">
    <div class="form-group">
      <label>项目名称</label>
      <input v-bind="getFieldProps('projectName')" />
    </div>

    <div class="form-group">
      <label>团队成员</label>
      <div 
        v-for="(member, index) in state.values.members" 
        :key="index"
        class="member-item"
      >
        <input 
          :value="member.name"
          @input="updateMember(index, 'name', $event.target.value)"
          placeholder="姓名"
        />
        <input 
          :value="member.email"
          @input="updateMember(index, 'email', $event.target.value)"
          placeholder="邮箱"
        />
        <button type="button" @click="removeMember(index)">删除</button>
      </div>
      <button type="button" @click="addMember">添加成员</button>
    </div>

    <button type="submit" :disabled="!state.valid">提交</button>
  </form>
</template>

<script setup lang="ts">
import { useForm } from '@ldesign/shared'

interface ProjectForm {
  projectName: string
  members: Array<{ name: string; email: string }>
}

const {
  state,
  setValue,
  getFieldProps,
  submitForm
} = useForm<ProjectForm>({
  initialValues: {
    projectName: '',
    members: [{ name: '', email: '' }]
  },
  
  validationRules: {
    projectName: [
      { required: true, message: '项目名称不能为空' }
    ]
  },
  
  async onSubmit(values) {
    console.log('提交项目:', values)
  }
})

const addMember = () => {
  const currentMembers = state.value.values.members
  setValue('members', [...currentMembers, { name: '', email: '' }])
}

const removeMember = (index: number) => {
  const currentMembers = state.value.values.members
  if (currentMembers.length > 1) {
    setValue('members', currentMembers.filter((_, i) => i !== index))
  }
}

const updateMember = (index: number, field: 'name' | 'email', value: string) => {
  const currentMembers = [...state.value.values.members]
  currentMembers[index][field] = value
  setValue('members', currentMembers)
}
</script>
```

### 异步验证集成

```vue
<script setup lang="ts">
import { useForm, useAsyncValidator } from '@ldesign/shared'

interface UserForm {
  username: string
  email: string
}

const {
  state,
  fields,
  setValue,
  setError,
  getFieldProps,
  submitForm
} = useForm<UserForm>({
  initialValues: {
    username: '',
    email: ''
  },
  
  async onSubmit(values) {
    console.log('提交用户信息:', values)
  }
})

// 用户名异步验证
const { state: usernameValidation } = useAsyncValidator(
  computed(() => state.value.values.username),
  {
    validator: async (username) => {
      if (!username) return true // 空值由表单验证处理
      
      const response = await fetch(`/api/check-username?name=${username}`)
      const result = await response.json()
      return result.available ? true : '用户名已被占用'
    },
    debounce: 500
  }
)

// 监听异步验证结果
watch(usernameValidation, (validation) => {
  if (validation.validated && !validation.valid) {
    setError('username', validation.error)
  } else if (validation.validated && validation.valid) {
    setError('username', null)
  }
})
</script>
```

### 条件验证

```vue
<script setup lang="ts">
import { useForm } from '@ldesign/shared'

interface ContactForm {
  contactMethod: 'email' | 'phone'
  email: string
  phone: string
  message: string
}

const { state, getFieldProps, submitForm } = useForm<ContactForm>({
  initialValues: {
    contactMethod: 'email',
    email: '',
    phone: '',
    message: ''
  },
  
  validationRules: {
    email: [
      {
        validator: (value, formValues) => {
          // 只有当联系方式为邮箱时才验证邮箱
          if (formValues.contactMethod === 'email') {
            return value ? true : '请输入邮箱地址'
          }
          return true
        }
      }
    ],
    
    phone: [
      {
        validator: (value, formValues) => {
          // 只有当联系方式为电话时才验证电话
          if (formValues.contactMethod === 'phone') {
            return value ? true : '请输入电话号码'
          }
          return true
        }
      }
    ],
    
    message: [
      { required: true, message: '消息内容不能为空' },
      { min: 10, message: '消息内容至少需要10个字符' }
    ]
  }
})
</script>
```

## 高级特性

### 自定义验证规则

```typescript
const customValidationRules = {
  strongPassword: {
    validator: (value: string) => {
      const hasUpper = /[A-Z]/.test(value)
      const hasLower = /[a-z]/.test(value)
      const hasNumber = /\d/.test(value)
      const hasSymbol = /[!@#$%^&*]/.test(value)
      
      if (!hasUpper) return '密码必须包含大写字母'
      if (!hasLower) return '密码必须包含小写字母'
      if (!hasNumber) return '密码必须包含数字'
      if (!hasSymbol) return '密码必须包含特殊字符'
      
      return true
    }
  }
}
```

### 表单状态持久化

```typescript
import { useLocalStorage } from '@ldesign/shared'

const { state, setValue } = useForm({
  initialValues: {
    username: '',
    email: ''
  }
})

// 保存表单状态到本地存储
const [savedForm, setSavedForm] = useLocalStorage('draft-form', {})

// 恢复表单状态
onMounted(() => {
  if (savedForm.value) {
    Object.entries(savedForm.value).forEach(([key, value]) => {
      setValue(key, value)
    })
  }
})

// 监听表单变化并保存
watchEffect(() => {
  if (state.value.dirty) {
    setSavedForm(state.value.values)
  }
})
```

## 注意事项

### 性能优化
- 大型表单考虑字段级别的组件化
- 使用 `validateOnChange: false` 减少验证频率
- 合理使用防抖避免频繁验证

### 类型安全
- 使用 TypeScript 接口定义表单结构
- 验证规则与表单字段保持一致
- 利用泛型确保类型安全

### 用户体验
- 提供清晰的错误提示
- 合理的验证时机
- 保存草稿功能

## 相关功能

- [useAsyncValidator](/hooks/use-async-validator) - 异步验证 Hook
- [useFormValidation](/hooks/use-form-validation) - 表单验证 Hook
- [验证函数](/utils/validate) - 验证工具函数
