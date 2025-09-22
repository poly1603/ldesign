# Vue 组合式函数 API

本文档介绍了 `@ldesign/http` 提供的 Vue 3 组合式函数 API。

## 简化HTTP请求函数

### useGet

用于发送GET请求的组合式函数。

```typescript
function useGet<T = any>(
  url: MaybeRefOrGetter<string>,
  config?: MaybeRefOrGetter<HttpRequestConfig>
): {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: () => Promise<void>
  reset: () => void
  clearError: () => void
  hasError: ComputedRef<boolean>
}
```

**参数：**
- `url` - 请求URL，支持响应式
- `config` - 请求配置，支持响应式

**返回值：**
- `data` - 响应数据
- `loading` - 加载状态
- `error` - 错误信息
- `execute` - 手动执行请求
- `reset` - 重置状态
- `clearError` - 清除错误
- `hasError` - 是否有错误（计算属性）

**示例：**
```typescript
import { useGet } from '@ldesign/http/vue'

// 基础用法
const { data, loading, error } = useGet<User[]>('/api/users')

// 响应式URL
const userId = ref(1)
const { data: user } = useGet(() => `/api/users/${userId.value}`)

// 带配置
const { data, execute } = useGet('/api/users', {
  headers: { 'Authorization': 'Bearer token' }
})
```

### usePost

用于发送POST请求的组合式函数。

```typescript
function usePost<T = any>(
  url: MaybeRefOrGetter<string>,
  config?: MaybeRefOrGetter<HttpRequestConfig>
): {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: (data?: any) => Promise<void>
  reset: () => void
  clearError: () => void
  hasError: ComputedRef<boolean>
}
```

**示例：**
```typescript
import { usePost } from '@ldesign/http/vue'

const { data, loading, error, execute } = usePost<User>('/api/users')

// 发送POST请求
await execute({ name: 'John', email: 'john@example.com' })
```

### usePut / usePatch / useDelete

类似于 `usePost`，分别用于PUT、PATCH和DELETE请求。

```typescript
import { usePut, usePatch, useDelete } from '@ldesign/http/vue'

// PUT请求
const { execute: updateUser } = usePut<User>('/api/users/1')
await updateUser({ name: 'Jane' })

// PATCH请求
const { execute: patchUser } = usePatch<User>('/api/users/1')
await patchUser({ name: 'Jane' })

// DELETE请求
const { execute: deleteUser } = useDelete('/api/users/1')
await deleteUser()
```

## 资源管理函数

### useResource

提供完整CRUD操作的资源管理组合式函数。

```typescript
function useResource<T = any>(
  baseUrl: string,
  config?: HttpRequestConfig
): {
  items: Ref<T[]>
  current: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  list: () => Promise<T[]>
  get: (id: string | number) => Promise<T>
  create: (data: Partial<T>) => Promise<T>
  update: (id: string | number, data: Partial<T>) => Promise<T>
  remove: (id: string | number) => Promise<void>
  reset: () => void
  clearError: () => void
}
```

**参数：**
- `baseUrl` - 资源基础URL
- `config` - 默认请求配置

**返回值：**
- `items` - 资源列表
- `current` - 当前资源
- `loading` - 加载状态
- `error` - 错误信息
- `list` - 获取资源列表
- `get` - 获取单个资源
- `create` - 创建资源
- `update` - 更新资源
- `remove` - 删除资源
- `reset` - 重置状态
- `clearError` - 清除错误

**示例：**
```typescript
import { useResource } from '@ldesign/http/vue'

const { 
  items, 
  current, 
  loading, 
  list, 
  get, 
  create, 
  update, 
  remove 
} = useResource<User>('/api/users')

// 获取用户列表
await list()

// 获取单个用户
await get(1)

// 创建用户
await create({ name: 'John', email: 'john@example.com' })

// 更新用户
await update(1, { name: 'Jane' })

// 删除用户
await remove(1)
```

## 表单管理函数

### useForm

提供表单数据管理、验证和提交功能的组合式函数。

```typescript
interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  message: string
  validator?: (value: any) => boolean
}

function useForm<T extends Record<string, any>>(options: {
  initialData: T
  validationRules?: Record<keyof T, ValidationRule[]>
}): {
  data: Ref<T>
  submitting: Ref<boolean>
  errors: Ref<Partial<Record<keyof T, string>>>
  submit: (url: string, config?: HttpRequestConfig) => Promise<any>
  validate: () => boolean
  setValidationRules: (rules: Record<keyof T, ValidationRule[]>) => void
  reset: () => void
  clearErrors: () => void
}
```

**参数：**
- `initialData` - 初始表单数据
- `validationRules` - 验证规则（可选）

**返回值：**
- `data` - 表单数据
- `submitting` - 提交状态
- `errors` - 验证错误
- `submit` - 提交表单
- `validate` - 验证表单
- `setValidationRules` - 设置验证规则
- `reset` - 重置表单
- `clearErrors` - 清除错误

**示例：**
```typescript
import { useForm } from '@ldesign/http/vue'

const { 
  data, 
  submitting, 
  errors, 
  submit, 
  validate, 
  setValidationRules 
} = useForm<User>({
  initialData: { name: '', email: '', age: 0 }
})

// 设置验证规则
setValidationRules({
  name: [
    { required: true, message: '姓名不能为空' },
    { minLength: 2, message: '姓名至少2个字符' }
  ],
  email: [
    { required: true, message: '邮箱不能为空' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
  ],
  age: [
    { required: true, message: '年龄不能为空' },
    { min: 1, message: '年龄必须大于0' }
  ]
})

// 提交表单
const handleSubmit = async () => {
  if (validate()) {
    await submit('/api/users')
  }
}
```

## 类型定义

```typescript
import type { MaybeRefOrGetter } from 'vue'

// 可能是响应式的值
type MaybeRefOrGetter<T> = T | Ref<T> | ComputedRef<T> | (() => T)

// HTTP请求配置
interface HttpRequestConfig {
  method?: string
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  // ... 其他配置
}

// 验证规则
interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  message: string
  validator?: (value: any) => boolean
}
```

## 最佳实践

### 1. 响应式URL和配置

```typescript
const userId = ref(1)
const token = ref('bearer-token')

const { data } = useGet(
  () => `/api/users/${userId.value}`,
  () => ({
    headers: { 'Authorization': `Bearer ${token.value}` }
  })
)
```

### 2. 错误处理

```typescript
const { data, error, hasError, clearError } = useGet('/api/users')

// 监听错误
watch(error, (newError) => {
  if (newError) {
    console.error('请求失败:', newError.message)
    // 显示错误提示
    showErrorMessage(newError.message)
  }
})

// 清除错误
const handleRetry = () => {
  clearError()
  execute()
}
```

### 3. 加载状态管理

```typescript
const { loading } = useGet('/api/users')

// 在模板中使用
// <div v-if="loading">加载中...</div>
```

### 4. 表单验证

```typescript
const { validate, errors } = useForm({
  initialData: { email: '' }
})

// 自定义验证器
setValidationRules({
  email: [
    {
      validator: (value) => value.includes('@'),
      message: '邮箱必须包含@符号'
    }
  ]
})
```
