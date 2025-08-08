# 表单验证

@ldesign/form 提供了强大而灵活的表单验证系统，支持同步验证、异步验证、自定义验证器等多种验证方式。

## 基础验证

### 内置验证规则

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
      rules: [
        { required: true, message: '请输入用户名' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
      ],
    },
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      props: { type: 'email' },
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入有效的邮箱地址' },
      ],
    },
    {
      name: 'age',
      label: '年龄',
      component: 'FormInput',
      props: { type: 'number' },
      rules: [{ type: 'number', min: 1, max: 120, message: '年龄必须在1-120之间' }],
    },
  ],
}

const handleSubmit = data => {
  console.log('验证通过，提交数据:', data)
}
</script>
```

### 支持的验证规则

| 规则        | 类型       | 说明         | 示例                                            |
| ----------- | ---------- | ------------ | ----------------------------------------------- |
| `required`  | `Boolean`  | 必填验证     | `{ required: true, message: '必填' }`           |
| `type`      | `String`   | 类型验证     | `{ type: 'email', message: '邮箱格式错误' }`    |
| `min`       | `Number`   | 最小值/长度  | `{ min: 3, message: '最少3个字符' }`            |
| `max`       | `Number`   | 最大值/长度  | `{ max: 20, message: '最多20个字符' }`          |
| `pattern`   | `RegExp`   | 正则验证     | `{ pattern: /^\d+$/, message: '只能输入数字' }` |
| `validator` | `Function` | 自定义验证器 | `{ validator: (value) => value > 0 }`           |

### 支持的类型验证

- `string`: 字符串类型
- `number`: 数字类型
- `boolean`: 布尔类型
- `integer`: 整数类型
- `float`: 浮点数类型
- `array`: 数组类型
- `object`: 对象类型
- `email`: 邮箱格式
- `url`: URL 格式
- `date`: 日期格式

## 自定义验证器

### 同步验证器

```javascript
const formOptions = {
  fields: [
    {
      name: 'password',
      label: '密码',
      component: 'FormInput',
      props: { type: 'password' },
      rules: [
        { required: true, message: '请输入密码' },
        {
          validator: value => {
            if (value.length < 8) {
              return '密码长度至少8位'
            }
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
              return '密码必须包含大小写字母和数字'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'confirmPassword',
      label: '确认密码',
      component: 'FormInput',
      props: { type: 'password' },
      rules: [
        { required: true, message: '请确认密码' },
        {
          validator: (value, formData) => {
            if (value !== formData.password) {
              return '两次输入的密码不一致'
            }
            return true
          },
        },
      ],
    },
  ],
}
```

### 异步验证器

```javascript
const formOptions = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      component: 'FormInput',
      rules: [
        { required: true, message: '请输入用户名' },
        {
          validator: async value => {
            if (!value) return true

            try {
              const response = await fetch(`/api/check-username?username=${value}`)
              const result = await response.json()

              if (!result.available) {
                return '用户名已被占用'
              }
              return true
            } catch (error) {
              return '验证用户名时发生错误'
            }
          },
          trigger: 'blur', // 失去焦点时触发
        },
      ],
    },
  ],
}
```

## 验证触发时机

### 配置触发时机

```javascript
const formOptions = {
  validation: {
    validateOnChange: true, // 值改变时验证
    validateOnBlur: true, // 失去焦点时验证
    validateOnSubmit: true, // 提交时验证
  },
  fields: [
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      rules: [
        {
          type: 'email',
          message: '请输入有效的邮箱地址',
          trigger: 'blur', // 单独设置触发时机
        },
      ],
    },
  ],
}
```

### 支持的触发时机

- `change`: 值改变时触发
- `blur`: 失去焦点时触发
- `submit`: 表单提交时触发
- `manual`: 手动触发

## 手动验证

### 验证整个表单

```vue
<template>
  <DynamicForm ref="formRef" v-model="formData" :options="formOptions" />
  <button @click="validateForm">验证表单</button>
</template>

<script setup>
import { ref } from 'vue'

const formRef = ref()
const formData = ref({})

const validateForm = async () => {
  try {
    const result = await formRef.value.validate()
    if (result.valid) {
      console.log('验证通过')
    } else {
      console.log('验证失败:', result.errors)
    }
  } catch (error) {
    console.error('验证过程中发生错误:', error)
  }
}
</script>
```

### 验证单个字段

```vue
<script setup>
const validateField = async fieldName => {
  try {
    const valid = await formRef.value.validateField(fieldName)
    if (valid) {
      console.log(`字段 ${fieldName} 验证通过`)
    }
  } catch (error) {
    console.error(`验证字段 ${fieldName} 时发生错误:`, error)
  }
}

// 清除验证错误
const clearErrors = fieldNames => {
  formRef.value.clearErrors(fieldNames)
}
</script>
```

## 条件验证

### 基于其他字段的验证

```javascript
const formOptions = {
  fields: [
    {
      name: 'hasPhone',
      label: '是否有手机号',
      component: 'FormSwitch',
    },
    {
      name: 'phone',
      label: '手机号',
      component: 'FormInput',
      rules: [
        {
          validator: (value, formData) => {
            // 只有当选择了"有手机号"时才验证
            if (formData.hasPhone && !value) {
              return '请输入手机号'
            }
            if (value && !/^1[3-9]\d{9}$/.test(value)) {
              return '请输入有效的手机号'
            }
            return true
          },
        },
      ],
    },
  ],
}
```

### 动态验证规则

```vue
<script setup>
import { ref, computed } from 'vue'

const formData = ref({
  userType: 'personal',
})

const formOptions = computed(() => ({
  fields: [
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
    {
      name: 'identifier',
      label: formData.value.userType === 'personal' ? '身份证号' : '营业执照号',
      component: 'FormInput',
      rules: [
        { required: true, message: '请输入证件号码' },
        {
          validator: value => {
            if (formData.value.userType === 'personal') {
              // 身份证号验证
              return /^\d{15}$|^\d{18}$/.test(value) || '请输入有效的身份证号'
            } else {
              // 营业执照号验证
              return /^\d{18}$/.test(value) || '请输入有效的营业执照号'
            }
          },
        },
      ],
    },
  ],
}))
</script>
```

## 错误处理

### 自定义错误显示

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions" @validate="handleValidate">
    <template #error="{ field, error }">
      <div class="custom-error">
        <i class="error-icon">⚠️</i>
        <span>{{ error }}</span>
      </div>
    </template>
  </DynamicForm>
</template>

<script setup>
const handleValidate = (valid, errors) => {
  if (!valid) {
    // 自定义错误处理
    console.log('验证错误:', errors)

    // 可以显示全局错误提示
    showErrorNotification('表单验证失败，请检查输入')
  }
}
</script>

<style scoped>
.custom-error {
  display: flex;
  align-items: center;
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.error-icon {
  margin-right: 4px;
}
</style>
```

### 错误信息国际化

```javascript
const formOptions = {
  validation: {
    messages: {
      required: '此字段为必填项',
      email: '请输入有效的邮箱地址',
      min: '输入长度不能少于 {min} 个字符',
      max: '输入长度不能超过 {max} 个字符',
      pattern: '输入格式不正确',
    },
  },
  fields: [
    {
      name: 'email',
      label: '邮箱',
      component: 'FormInput',
      rules: [{ required: true }, { type: 'email' }],
    },
  ],
}
```

## 验证组合

### 验证组

```javascript
const formOptions = {
  validationGroups: {
    basicInfo: ['name', 'email', 'phone'],
    address: ['country', 'city', 'street'],
    payment: ['cardNumber', 'expiryDate', 'cvv'],
  },
  fields: [
    // 字段配置...
  ],
}

// 验证特定组
const validateGroup = async groupName => {
  const result = await formRef.value.validateGroup(groupName)
  return result
}
```

### 步骤验证

```vue
<script setup>
import { ref } from 'vue'

const currentStep = ref(0)
const steps = [
  { name: 'basic', fields: ['name', 'email'] },
  { name: 'details', fields: ['phone', 'address'] },
  { name: 'confirm', fields: ['agreement'] },
]

const nextStep = async () => {
  const currentFields = steps[currentStep.value].fields
  const result = await formRef.value.validateFields(currentFields)

  if (result.valid) {
    currentStep.value++
  } else {
    console.log('当前步骤验证失败:', result.errors)
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}
</script>
```

## 最佳实践

1. **合理设置触发时机**: 根据用户体验选择合适的验证触发时机
2. **友好的错误提示**: 提供清晰、具体的错误信息
3. **性能优化**: 对于复杂的异步验证，考虑防抖处理
4. **用户体验**: 避免过于频繁的验证提示
5. **国际化支持**: 为多语言应用提供国际化的错误信息

## 下一步

- [布局系统](/guide/layout) - 学习表单布局
- [自定义组件](/guide/custom-components) - 创建自定义验证组件
- [性能优化](/guide/performance) - 优化表单性能
