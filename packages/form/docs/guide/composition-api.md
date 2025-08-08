# Composition API

@ldesign/form 提供了一套强大的 Composition API，让你可以在 Vue 3 的 Composition API 中更灵活地使用表
单功能。

## useForm

`useForm` 是核心的 Composition API，用于创建和管理表单状态。

### 基础用法

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <component :is="renderForm" />
  </form>
</template>

<script setup>
import { useForm } from '@ldesign/form'

const { formData, renderForm, validate, reset, setFieldValue, getFieldValue } = useForm({
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
      props: { type: 'email' },
      required: true,
    },
  ],
})

const handleSubmit = async () => {
  const { valid, errors } = await validate()
  if (valid) {
    console.log('表单数据:', formData.value)
  } else {
    console.log('验证错误:', errors)
  }
}
</script>
```

### 参数

```typescript
interface UseFormOptions {
  fields: FieldConfig[] // 字段配置
  initialData?: Record<string, any> // 初始数据
  validation?: ValidationOptions // 验证配置
  layout?: LayoutOptions // 布局配置
}
```

### 返回值

```typescript
interface UseFormReturn {
  formData: Ref<Record<string, any>> // 表单数据
  renderForm: ComputedRef<VNode> // 渲染函数
  validate: () => Promise<ValidationResult> // 验证方法
  reset: (data?: Record<string, any>) => void // 重置方法
  setFieldValue: (name: string, value: any) => void // 设置字段值
  getFieldValue: (name: string) => any // 获取字段值
  errors: Ref<Record<string, string>> // 验证错误
  loading: Ref<boolean> // 加载状态
}
```

## useField

`useField` 用于创建单个字段的状态管理。

### 基础用法

```vue
<template>
  <div>
    <label>{{ config.label }}</label>
    <input v-model="value" :disabled="disabled" @blur="validate" />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<script setup>
import { useField } from '@ldesign/form'

const props = defineProps({
  name: String,
  config: Object,
  modelValue: null,
})

const emit = defineEmits(['update:modelValue'])

const { value, error, validate, reset, disabled } = useField(props.name, props.config, {
  modelValue: toRef(props, 'modelValue'),
  'onUpdate:modelValue': val => emit('update:modelValue', val),
})
</script>
```

### 参数

```typescript
function useField(name: string, config: FieldConfig, options?: UseFieldOptions): UseFieldReturn
```

### 返回值

```typescript
interface UseFieldReturn {
  value: Ref<any> // 字段值
  error: Ref<string> // 验证错误
  validate: () => Promise<boolean> // 验证方法
  reset: () => void // 重置方法
  disabled: ComputedRef<boolean> // 是否禁用
  readonly: ComputedRef<boolean> // 是否只读
}
```

## useValidation

`useValidation` 提供表单验证功能。

### 基础用法

```vue
<script setup>
import { ref } from 'vue'
import { useValidation } from '@ldesign/form'

const formData = ref({
  username: '',
  email: '',
  age: null,
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' },
  ],
  age: [{ type: 'number', min: 1, max: 120, message: '年龄必须在1-120之间' }],
}

const { errors, validate, validateField, clearErrors, hasErrors } = useValidation(formData, rules)

// 验证整个表单
const handleSubmit = async () => {
  const result = await validate()
  if (result.valid) {
    console.log('验证通过')
  }
}

// 验证单个字段
const handleFieldBlur = fieldName => {
  validateField(fieldName)
}
</script>
```

### 返回值

```typescript
interface UseValidationReturn {
  errors: Ref<Record<string, string>> // 验证错误
  validate: () => Promise<ValidationResult> // 验证所有字段
  validateField: (name: string) => Promise<boolean> // 验证单个字段
  clearErrors: (names?: string[]) => void // 清除错误
  hasErrors: ComputedRef<boolean> // 是否有错误
}
```

## useFormLayout

`useFormLayout` 用于管理表单布局。

### 基础用法

```vue
<template>
  <div :class="containerClass" :style="containerStyle">
    <div
      v-for="field in layoutFields"
      :key="field.name"
      :class="fieldClass(field)"
      :style="fieldStyle(field)"
    >
      <FormField :config="field" v-model="formData[field.name]" />
    </div>
  </div>
</template>

<script setup>
import { useFormLayout } from '@ldesign/form'

const props = defineProps({
  fields: Array,
  layout: Object,
  formData: Object,
})

const { layoutFields, containerClass, containerStyle, fieldClass, fieldStyle } = useFormLayout(
  props.fields,
  props.layout
)
</script>
```

## useFormState

`useFormState` 用于管理表单的全局状态。

### 基础用法

```vue
<script setup>
import { useFormState } from '@ldesign/form'

const {
  isDirty,
  isValid,
  isSubmitting,
  touchedFields,
  changedFields,
  markAsTouched,
  markAsChanged,
  reset,
} = useFormState()

// 检查表单是否被修改
console.log('表单是否被修改:', isDirty.value)

// 检查表单是否有效
console.log('表单是否有效:', isValid.value)

// 标记字段为已触摸
markAsTouched('username')

// 标记字段为已修改
markAsChanged('email')
</script>
```

## 高级用法

### 动态表单

```vue
<script setup>
import { ref, computed } from 'vue'
import { useForm } from '@ldesign/form'

const userType = ref('personal')

const fields = computed(() => {
  const baseFields = [
    {
      name: 'userType',
      label: '用户类型',
      component: 'FormRadio',
      props: {
        options: [
          { label: '个人', value: 'personal' },
          { label: '企业', value: 'business' },
        ],
      },
    },
  ]

  if (userType.value === 'personal') {
    baseFields.push({
      name: 'name',
      label: '姓名',
      component: 'FormInput',
      required: true,
    })
  } else {
    baseFields.push({
      name: 'companyName',
      label: '公司名称',
      component: 'FormInput',
      required: true,
    })
  }

  return baseFields
})

const { formData, renderForm } = useForm({
  fields: fields.value,
})

// 监听用户类型变化
watch(
  () => formData.value.userType,
  newType => {
    userType.value = newType
  }
)
</script>
```

### 表单联动

```vue
<script setup>
import { ref, watch } from 'vue'
import { useForm } from '@ldesign/form'

const { formData, setFieldValue } = useForm({
  fields: [
    {
      name: 'country',
      label: '国家',
      component: 'FormSelect',
      props: {
        options: [
          { label: '中国', value: 'china' },
          { label: '美国', value: 'usa' },
        ],
      },
    },
    {
      name: 'city',
      label: '城市',
      component: 'FormSelect',
      props: {
        options: [],
      },
    },
  ],
})

// 监听国家变化，更新城市选项
watch(
  () => formData.value.country,
  country => {
    if (country === 'china') {
      // 更新城市选项为中国城市
      setFieldValue('city', '')
    } else if (country === 'usa') {
      // 更新城市选项为美国城市
      setFieldValue('city', '')
    }
  }
)
</script>
```

## 最佳实践

1. **合理使用响应式**: 避免在 Composition API 中创建不必要的响应式数据
2. **错误处理**: 始终处理验证错误和异步操作的错误
3. **性能优化**: 对于复杂表单，使用 `computed` 和 `watch` 优化性能
4. **类型安全**: 使用 TypeScript 获得更好的开发体验

## 下一步

- [表单验证](/guide/validation) - 深入了解验证系统
- [布局系统](/guide/layout) - 掌握布局配置
- [自定义组件](/guide/custom-components) - 创建自定义组件
