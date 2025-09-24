# Vue Hooks API 参考

## useForm

创建和管理表单状态的核心 Hook。

### 类型定义

```typescript
function useForm(config?: FormConfig): ReactiveFormInstance

interface FormConfig {
  /** 表单初始值 */
  initialValues?: Record<string, any>;
  /** 提交处理函数 */
  onSubmit?: (data: any) => void | Promise<void>;
  /** 值变化时是否验证 */
  validateOnChange?: boolean;
  /** 失焦时是否验证 */
  validateOnBlur?: boolean;
  /** 表单模式 */
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  /** 重新验证模式 */
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

interface ReactiveFormInstance {
  /** 表单数据 */
  data: Ref<Record<string, any>>;
  /** 验证结果 */
  validation: Ref<Record<string, ValidationResult>>;
  /** 表单是否有效 */
  isValid: ComputedRef<boolean>;
  /** 表单是否正在提交 */
  isSubmitting: Ref<boolean>;
  /** 表单是否已提交过 */
  isSubmitted: Ref<boolean>;
  /** 表单是否有变化 */
  isDirty: ComputedRef<boolean>;
  /** 已注册的字段 */
  fields: Ref<Map<string, ReactiveFieldInstance>>;
  
  // 方法
  registerField: (config: FieldConfig) => ReactiveFieldInstance;
  unregisterField: (name: string) => void;
  setFieldValue: (name: string, value: any) => void;
  getFieldValue: (name: string) => any;
  setFieldError: (name: string, error: string) => void;
  clearFieldError: (name: string) => void;
  validateField: (name: string) => Promise<ValidationResult>;
  validateForm: () => Promise<Record<string, ValidationResult>>;
  submit: () => Promise<SubmitResult>;
  reset: (values?: Record<string, any>) => void;
  setValues: (values: Record<string, any>) => void;
  getValues: () => Record<string, any>;
}
```

### 基础用法

```vue
<script setup lang="ts">
import { useForm } from '@ldesign/form/vue'
import { required, email } from '@ldesign/form/validators'

// 创建表单实例
const form = useForm({
  initialValues: {
    username: '',
    email: '',
    age: 0
  },
  validateOnChange: true,
  onSubmit: async (data) => {
    console.log('提交数据:', data)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
})

// 注册字段
const usernameField = form.registerField({
  name: 'username',
  rules: [{ validator: required(), message: '请输入用户名' }]
})

const emailField = form.registerField({
  name: 'email',
  rules: [
    { validator: required(), message: '请输入邮箱' },
    { validator: email(), message: '请输入有效的邮箱地址' }
  ]
})

// 提交表单
const handleSubmit = async () => {
  const result = await form.submit()
  if (result.valid) {
    console.log('提交成功:', result.data)
  } else {
    console.log('验证失败:', result.validation)
  }
}

// 重置表单
const handleReset = () => {
  form.reset()
}

// 监听表单变化
watch(form.data, (newData) => {
  console.log('表单数据变化:', newData)
}, { deep: true })

// 监听验证状态
watch(form.validation, (validation) => {
  console.log('验证状态变化:', validation)
}, { deep: true })
</script>
```

### 高级用法

```vue
<script setup lang="ts">
import { useForm } from '@ldesign/form/vue'

const form = useForm({
  initialValues: {
    profile: {
      name: '',
      contacts: [{ type: 'email', value: '' }]
    }
  },
  mode: 'onChange',
  reValidateMode: 'onChange'
})

// 动态设置字段值
const updateProfile = () => {
  form.setFieldValue('profile.name', 'John Doe')
  form.setFieldValue('profile.contacts.0.value', 'john@example.com')
}

// 批量设置值
const loadUserData = async () => {
  const userData = await fetchUserData()
  form.setValues(userData)
}

// 获取特定字段值
const getName = () => {
  return form.getFieldValue('profile.name')
}

// 手动验证字段
const validateName = async () => {
  const result = await form.validateField('profile.name')
  console.log('姓名验证结果:', result)
}

// 手动设置错误
const setCustomError = () => {
  form.setFieldError('profile.name', '该用户名已被占用')
}

// 清除错误
const clearError = () => {
  form.clearFieldError('profile.name')
}
</script>
```

## useField

管理单个字段状态的 Hook。

### 类型定义

```typescript
function useField(
  name: string,
  options?: UseFieldOptions
): ReactiveFieldInstance

interface UseFieldOptions {
  /** 默认值 */
  defaultValue?: any;
  /** 验证规则 */
  rules?: ValidationRule[];
  /** 是否在值变化时验证 */
  validateOnChange?: boolean;
  /** 是否在失焦时验证 */
  validateOnBlur?: boolean;
  /** 字段依赖 */
  dependencies?: string[];
  /** 转换函数 */
  transform?: {
    input?: (value: any) => any;
    output?: (value: any) => any;
  };
}

interface ReactiveFieldInstance {
  /** 字段名称 */
  name: string;
  /** 字段值 */
  value: Ref<any>;
  /** 验证结果 */
  validation: Ref<ValidationResult>;
  /** 是否有效 */
  isValid: ComputedRef<boolean>;
  /** 是否有错误 */
  hasError: ComputedRef<boolean>;
  /** 是否已触摸 */
  isTouched: Ref<boolean>;
  /** 是否有变化 */
  isDirty: ComputedRef<boolean>;
  /** 是否正在验证 */
  isValidating: Ref<boolean>;
  
  // 方法
  setValue: (value: any) => void;
  setError: (error: string) => void;
  clearError: () => void;
  validate: () => Promise<ValidationResult>;
  reset: (value?: any) => void;
  touch: () => void;
  untouch: () => void;
}
```

### 基础用法

```vue
<script setup lang="ts">
import { useField } from '@ldesign/form/vue'
import { required, minLength } from '@ldesign/form/validators'

// 创建字段实例
const usernameField = useField('username', {
  defaultValue: '',
  rules: [
    { validator: required(), message: '请输入用户名' },
    { validator: minLength(3), message: '用户名至少3个字符' }
  ],
  validateOnChange: true
})

// 使用字段
const handleInput = (event) => {
  usernameField.setValue(event.target.value)
}

const handleBlur = () => {
  usernameField.touch()
}

// 监听字段变化
watch(usernameField.value, (newValue) => {
  console.log('用户名变化:', newValue)
})

// 监听验证状态
watch(usernameField.validation, (validation) => {
  console.log('验证状态:', validation)
})
</script>

<template>
  <div class="field-wrapper">
    <input
      :value="usernameField.value.value"
      @input="handleInput"
      @blur="handleBlur"
      :class="{ error: usernameField.hasError.value }"
    />
    <div v-if="usernameField.hasError.value" class="error-message">
      {{ usernameField.validation.value.message }}
    </div>
  </div>
</template>
```

### 高级用法

```vue
<script setup lang="ts">
import { useField } from '@ldesign/form/vue'

// 带转换的字段
const priceField = useField('price', {
  defaultValue: 0,
  transform: {
    input: (value) => parseFloat(value) || 0,
    output: (value) => value.toFixed(2)
  },
  rules: [
    { 
      validator: (value) => value > 0,
      message: '价格必须大于0'
    }
  ]
})

// 依赖其他字段的字段
const confirmPasswordField = useField('confirmPassword', {
  dependencies: ['password'],
  rules: [
    {
      validator: (value, { getFieldValue }) => {
        const password = getFieldValue('password')
        return value === password
      },
      message: '两次输入的密码不一致'
    }
  ]
})

// 异步验证
const emailField = useField('email', {
  rules: [
    {
      validator: async (value) => {
        if (!value) return true
        const response = await fetch(`/api/check-email?email=${value}`)
        const result = await response.json()
        return !result.exists
      },
      message: '该邮箱已被注册'
    }
  ]
})
</script>
```

## useFieldArray

管理动态字段数组的 Hook。

### 类型定义

```typescript
function useFieldArray(
  name: string,
  options?: UseFieldArrayOptions
): UseFieldArrayReturn

interface UseFieldArrayOptions {
  /** 默认值 */
  defaultValue?: any[];
  /** 最小项目数 */
  min?: number;
  /** 最大项目数 */
  max?: number;
  /** 验证规则 */
  rules?: ValidationRule[];
}

interface UseFieldArrayReturn {
  /** 字段数组 */
  fields: Ref<ReactiveFieldInstance[]>;
  /** 添加项目 */
  append: (value?: any) => void;
  /** 前置添加项目 */
  prepend: (value?: any) => void;
  /** 插入项目 */
  insert: (index: number, value?: any) => void;
  /** 移除项目 */
  remove: (index: number) => void;
  /** 移动项目 */
  move: (from: number, to: number) => void;
  /** 交换项目 */
  swap: (indexA: number, indexB: number) => void;
  /** 替换项目 */
  replace: (index: number, value: any) => void;
  /** 更新项目 */
  update: (index: number, value: any) => void;
}
```

### 基础用法

```vue
<script setup lang="ts">
import { useFieldArray } from '@ldesign/form/vue'

// 创建字段数组
const contactsArray = useFieldArray('contacts', {
  defaultValue: [{ name: '', phone: '' }],
  min: 1,
  max: 5
})

// 添加联系人
const addContact = () => {
  contactsArray.append({ name: '', phone: '' })
}

// 移除联系人
const removeContact = (index) => {
  contactsArray.remove(index)
}

// 移动联系人
const moveContact = (from, to) => {
  contactsArray.move(from, to)
}
</script>

<template>
  <div class="contacts-list">
    <div
      v-for="(field, index) in contactsArray.fields.value"
      :key="field.name"
      class="contact-item"
    >
      <input
        v-model="field.value.name"
        placeholder="姓名"
      />
      <input
        v-model="field.value.phone"
        placeholder="电话"
      />
      <button @click="removeContact(index)">删除</button>
    </div>
    
    <button @click="addContact">添加联系人</button>
  </div>
</template>
```

## useFormContext

获取表单上下文的 Hook。

### 类型定义

```typescript
function useFormContext(): ReactiveFormInstance | null
```

### 使用示例

```vue
<script setup lang="ts">
import { useFormContext } from '@ldesign/form/vue'

// 获取表单上下文
const form = useFormContext()

if (!form) {
  throw new Error('useFormContext must be used within FormProvider')
}

// 使用表单实例
const handleSubmit = () => {
  form.submit()
}

const handleReset = () => {
  form.reset()
}
</script>
```
