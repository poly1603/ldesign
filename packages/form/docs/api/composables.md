# Composables API

本章节介绍 @ldesign/form 提供的 Composition API。

## useForm

主要的表单管理 Hook，提供完整的表单功能。

### 类型定义

```typescript
function useForm(options: UseFormOptions): UseFormReturn

interface UseFormOptions {
  fields?: FieldConfig[]
  initialData?: Record<string, any>
  validation?: ValidationConfig
  layout?: LayoutConfig
  theme?: ThemeConfig
  onSubmit?: (data: Record<string, any>) => void | Promise<void>
  onReset?: () => void
  onChange?: (data: Record<string, any>) => void
  onFieldChange?: (name: string, value: any, formData: Record<string, any>) => void
}

interface UseFormReturn {
  // 响应式数据
  formData: Ref<Record<string, any>>
  formState: Ref<FormState>
  formErrors: Ref<Record<string, string[]>>
  fieldStates: Ref<Record<string, FieldState>>

  // 渲染函数
  renderForm: () => VNode

  // 事件方法
  on: (event: string, handler: Function) => void
  off: (event: string, handler?: Function) => void
  emit: (event: string, ...args: any[]) => void

  // 表单操作
  submit: () => Promise<boolean>
  reset: () => void
  clear: () => void
  validate: (fieldNames?: string[]) => Promise<boolean>
  validateField: (fieldName: string) => Promise<boolean>

  // 字段操作
  setFieldValue: (fieldName: string, value: any) => void
  getFieldValue: (fieldName: string) => any
  setFormData: (data: Record<string, any>) => void
  getFormData: () => Record<string, any>
  showField: (fieldName: string) => void
  hideField: (fieldName: string) => void
  enableField: (fieldName: string) => void
  disableField: (fieldName: string) => void
  isFieldVisible: (fieldName: string) => boolean
  isFieldDisabled: (fieldName: string) => boolean
  addField: (field: FieldConfig, index?: number) => void
  removeField: (fieldName: string) => void
}
```

### 基础用法

```vue
<template>
  <div>
    <component :is="renderForm" />

    <div class="form-actions">
      <button @click="handleSubmit">提交</button>
      <button @click="handleReset">重置</button>
      <button @click="handleValidate">验证</button>
    </div>

    <div class="form-debug">
      <h3>表单数据</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>

      <h3>表单状态</h3>
      <pre>{{ JSON.stringify(formState, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { useForm } from '@ldesign/form'

const {
  formData,
  formState,
  formErrors,
  renderForm,
  submit,
  reset,
  validate,
  setFieldValue,
  getFieldValue,
} = useForm({
  fields: [
    {
      name: 'username',
      label: '用户名',
      component: 'FormInput',
      required: true,
      rules: [
        { required: true, message: '请输入用户名' },
        { minLength: 3, message: '用户名至少3个字符' },
      ],
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      required: true,
      props: { type: 'email' },
      rules: [
        { required: true, message: '请输入邮箱' },
        { email: true, message: '请输入有效的邮箱地址' },
      ],
    },
  ],
  initialData: {
    username: 'admin',
  },
  onSubmit: async data => {
    console.log('表单提交:', data)
    // 模拟异步提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('提交成功！')
  },
  onChange: data => {
    console.log('表单数据变化:', data)
  },
})

const handleSubmit = async () => {
  const isValid = await submit()
  if (!isValid) {
    console.log('表单验证失败:', formErrors.value)
  }
}

const handleReset = () => {
  reset()
}

const handleValidate = async () => {
  const isValid = await validate()
  console.log('验证结果:', isValid)
}

// 程序化操作
const setUsername = () => {
  setFieldValue('username', 'newuser')
}

const getUsername = () => {
  const username = getFieldValue('username')
  console.log('当前用户名:', username)
}
</script>
```

### 高级用法

```vue
<script setup>
import { useForm } from '@ldesign/form'
import { computed, watch } from 'vue'

const {
  formData,
  formState,
  fieldStates,
  renderForm,
  on,
  off,
  addField,
  removeField,
  showField,
  hideField,
} = useForm({
  fields: [
    {
      name: 'type',
      label: '类型',
      component: 'FormSelect',
      props: {
        options: [
          { label: '个人', value: 'personal' },
          { label: '企业', value: 'business' },
        ],
      },
    },
    {
      name: 'name',
      label: '姓名',
      component: 'FormInput',
      required: true,
    },
  ],
})

// 监听字段变化
on('field-change', (fieldName, value) => {
  if (fieldName === 'type') {
    if (value === 'business') {
      // 动态添加企业相关字段
      addField({
        name: 'company',
        label: '公司名称',
        component: 'FormInput',
        required: true,
      })
      addField({
        name: 'taxId',
        label: '税号',
        component: 'FormInput',
      })
    } else {
      // 移除企业相关字段
      removeField('company')
      removeField('taxId')
    }
  }
})

// 条件显示字段
watch(
  () => formData.value.type,
  newType => {
    if (newType === 'personal') {
      showField('name')
      hideField('company')
    } else {
      hideField('name')
      showField('company')
    }
  }
)

// 计算属性
const isBusinessType = computed(() => {
  return formData.value.type === 'business'
})

// 字段状态监听
watch(
  () => fieldStates.value.username?.errors,
  errors => {
    if (errors && errors.length > 0) {
      console.log('用户名验证错误:', errors)
    }
  }
)
</script>
```

## useFormValidation

专门用于表单验证的 Hook。

### 类型定义

```typescript
function useFormValidation(options?: UseFormValidationOptions): UseFormValidationReturn

interface UseFormValidationOptions {
  fields?: FieldConfig[]
  config?: ValidationConfig
  formData?: Record<string, any>
  autoValidate?: boolean
  validateDelay?: number
}

interface UseFormValidationReturn {
  validationState: Ref<ValidationState>
  fieldValidationStates: Ref<Record<string, FieldValidationState>>
  validateForm: (data?: Record<string, any>) => Promise<boolean>
  validateField: (fieldName: string, value?: any, data?: Record<string, any>) => Promise<boolean>
  validateFields: (fieldNames: string[], data?: Record<string, any>) => Promise<boolean>
  clearValidation: (fieldNames?: string[]) => void
  setFieldRules: (fieldName: string, rules: ValidationRule[]) => void
  getFieldRules: (fieldName: string) => ValidationRule[]
  addValidator: (name: string, validator: ValidationFunction) => void
  removeValidator: (name: string) => void
}
```

### 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { useFormValidation } from '@ldesign/form'

const formData = ref({
  username: '',
  email: '',
  password: '',
})

const {
  validationState,
  fieldValidationStates,
  validateForm,
  validateField,
  clearValidation,
  setFieldRules,
} = useFormValidation({
  fields: [
    {
      name: 'username',
      rules: [
        { required: true, message: '请输入用户名' },
        { minLength: 3, message: '用户名至少3个字符' },
      ],
    },
    {
      name: 'email',
      rules: [
        { required: true, message: '请输入邮箱' },
        { email: true, message: '请输入有效的邮箱地址' },
      ],
    },
  ],
  formData: formData.value,
  autoValidate: true,
  validateDelay: 300,
})

// 验证整个表单
const handleValidateForm = async () => {
  const isValid = await validateForm(formData.value)
  console.log('表单验证结果:', isValid)
  console.log('验证状态:', validationState.value)
}

// 验证单个字段
const handleValidateField = async fieldName => {
  const isValid = await validateField(fieldName, formData.value[fieldName], formData.value)
  console.log(`字段 ${fieldName} 验证结果:`, isValid)
}

// 清除验证
const handleClearValidation = () => {
  clearValidation()
}

// 动态设置验证规则
const handleSetRules = () => {
  setFieldRules('password', [
    { required: true, message: '请输入密码' },
    { minLength: 6, message: '密码至少6个字符' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字' },
  ])
}
</script>
```

## useFormField

用于管理单个表单字段的 Hook。

### 类型定义

```typescript
function useFormField(options: UseFormFieldOptions): UseFormFieldReturn

interface UseFormFieldOptions {
  name: string
  initialValue?: any
  rules?: ValidationRule[]
  disabled?: boolean
  readonly?: boolean
  hidden?: boolean
}

interface UseFormFieldReturn {
  fieldState: Ref<FieldState>
  value: Ref<any>
  errors: Ref<string[]>
  setValue: (value: any) => void
  validate: (value?: any) => Promise<boolean>
  clearValidation: () => void
  focus: () => void
  blur: () => void
  reset: () => void
}
```

### 基础用法

```vue
<template>
  <div>
    <label>用户名</label>
    <input
      v-model="value"
      :disabled="fieldState.disabled"
      :readonly="fieldState.readonly"
      @focus="focus"
      @blur="blur"
    />
    <div v-if="errors.length" class="error">
      {{ errors.join(', ') }}
    </div>
  </div>
</template>

<script setup>
import { useFormField } from '@ldesign/form'

const { fieldState, value, errors, setValue, validate, clearValidation, focus, blur, reset } =
  useFormField({
    name: 'username',
    initialValue: '',
    rules: [
      { required: true, message: '请输入用户名' },
      { minLength: 3, message: '用户名至少3个字符' },
    ],
  })

// 手动验证
const handleValidate = async () => {
  const isValid = await validate()
  console.log('验证结果:', isValid)
}
</script>
```

## useFormLayout

用于管理表单布局的 Hook。

### 类型定义

```typescript
function useFormLayout(options?: UseFormLayoutOptions): UseFormLayoutReturn

interface UseFormLayoutOptions {
  fields?: FieldConfig[]
  layout?: LayoutConfig
  container?: Ref<HTMLElement | null>
}

interface UseFormLayoutReturn {
  layoutState: Ref<LayoutState>
  gridStyle: ComputedRef<CSSProperties>
  fieldStyles: ComputedRef<Record<string, CSSProperties>>
  updateLayout: () => void
  setColumns: (columns: number | ResponsiveColumns) => void
  setGap: (gap: number | GapConfig) => void
}
```

### 基础用法

```vue
<template>
  <div ref="containerRef" :style="gridStyle" class="form-grid">
    <div
      v-for="field in fields"
      :key="field.name"
      :style="fieldStyles[field.name]"
      class="form-field"
    >
      <!-- 字段内容 -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFormLayout } from '@ldesign/form'

const containerRef = ref()

const { layoutState, gridStyle, fieldStyles, updateLayout, setColumns, setGap } = useFormLayout({
  fields: [
    { name: 'field1', span: 1 },
    { name: 'field2', span: 2 },
    { name: 'field3', span: 'full' },
  ],
  layout: {
    columns: { md: 2, lg: 3 },
    gap: 16,
  },
  container: containerRef,
})

// 动态调整布局
const handleSetColumns = () => {
  setColumns(4)
}

const handleSetGap = () => {
  setGap({ horizontal: 20, vertical: 16 })
}
</script>
```

## 自定义 Hook

你也可以基于现有的 Hook 创建自定义的表单 Hook：

```typescript
import { useForm, useFormValidation } from '@ldesign/form'
import { computed, ref } from 'vue'

// 自定义用户注册表单 Hook
export function useUserRegistrationForm() {
  const { formData, formState, renderForm, validate, submit, reset } = useForm({
    fields: [
      {
        name: 'username',
        label: '用户名',
        component: 'FormInput',
        required: true,
        rules: [
          { required: true, message: '请输入用户名' },
          { minLength: 3, message: '用户名至少3个字符' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
        ],
      },
      {
        name: 'email',
        label: '邮箱',
        component: 'FormInput',
        required: true,
        props: { type: 'email' },
        rules: [
          { required: true, message: '请输入邮箱' },
          { email: true, message: '请输入有效的邮箱地址' },
        ],
      },
      {
        name: 'password',
        label: '密码',
        component: 'FormInput',
        required: true,
        props: { type: 'password' },
        rules: [
          { required: true, message: '请输入密码' },
          { minLength: 6, message: '密码至少6个字符' },
        ],
      },
    ],
    onSubmit: async data => {
      // 提交注册请求
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('注册失败')
      }

      return response.json()
    },
  })

  // 计算属性
  const canSubmit = computed(() => {
    return formState.value.valid && !formState.value.submitting
  })

  // 自定义方法
  const register = async () => {
    try {
      const result = await submit()
      if (result) {
        console.log('注册成功')
        return true
      }
    } catch (error) {
      console.error('注册失败:', error)
      return false
    }
  }

  return {
    formData,
    formState,
    renderForm,
    canSubmit,
    validate,
    register,
    reset,
  }
}
```

使用自定义 Hook：

```vue
<template>
  <div>
    <h2>用户注册</h2>
    <component :is="renderForm" />
    <button :disabled="!canSubmit" @click="register">
      {{ formState.submitting ? '注册中...' : '注册' }}
    </button>
  </div>
</template>

<script setup>
import { useUserRegistrationForm } from './composables/useUserRegistrationForm'

const { formData, formState, renderForm, canSubmit, register } = useUserRegistrationForm()
</script>
```
