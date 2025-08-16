# useRequest API

`useRequest` 是处理 HTTP 请求的基础 hook，提供了完整的请求状态管理和控制功能。

## 函数签名

```typescript
function useRequest<T = any>(
  config: MaybeRef<RequestConfig>,
  options?: UseRequestOptions<T>
): UseRequestReturn<T>
```

## 参数

### config

请求配置，可以是响应式的。

**类型：** `MaybeRef<RequestConfig>`

```typescript
interface RequestConfig {
  url?: string
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  baseURL?: string
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'stream'
  withCredentials?: boolean
  signal?: AbortSignal
}
```

**示例：**

```typescript
// 静态配置
const { data } = useRequest({
  url: '/api/users',
  method: 'GET',
})

// 响应式配置
const userId = ref(1)
const { data } = useRequest(
  computed(() => ({
    url: `/api/users/${userId.value}`,
    method: 'GET',
  }))
)
```

### options

可选的配置选项。

**类型：** `UseRequestOptions<T>`

```typescript
interface UseRequestOptions<T> {
  immediate?: boolean
  initialData?: T
  transform?: (data: any) => T
  onSuccess?: (data: T, response: ResponseData<T>) => void
  onError?: (error: HttpError) => void
  onFinally?: () => void
  cancelOnUnmount?: boolean
}
```

#### immediate

是否立即执行请求。

- **类型：** `boolean`
- **默认值：** `true`

```typescript
// 立即执行（默认）
const { data } = useRequest({ url: '/api/users' })

// 手动执行
const { data, execute } = useRequest({ url: '/api/users' }, { immediate: false })

// 稍后手动执行
execute()
```

#### initialData

初始数据值。

- **类型：** `T`
- **默认值：** `null`

```typescript
const { data } = useRequest(
  { url: '/api/users' },
  {
    initialData: [], // 初始为空数组
  }
)
```

#### transform

数据转换函数，用于处理响应数据。

- **类型：** `(data: any) => T`

```typescript
interface User {
  id: number
  name: string
  email: string
}

const { data } = useRequest<User[]>(
  { url: '/api/users' },
  {
    transform: rawData => {
      return rawData.map(user => ({
        ...user,
        displayName: `${user.name} (${user.email})`,
      }))
    },
  }
)
```

#### onSuccess

请求成功时的回调函数。

- **类型：** `(data: T, response: ResponseData<T>) => void`

```typescript
const { data } = useRequest(
  { url: '/api/users' },
  {
    onSuccess: (data, response) => {
      console.log('请求成功:', data)
      console.log('响应状态:', response.status)
    },
  }
)
```

#### onError

请求失败时的回调函数。

- **类型：** `(error: HttpError) => void`

```typescript
const { data } = useRequest(
  { url: '/api/users' },
  {
    onError: error => {
      console.error('请求失败:', error.message)
      if (error.response?.status === 404) {
        showNotification('数据不存在')
      }
    },
  }
)
```

#### onFinally

请求完成时的回调函数（无论成功或失败）。

- **类型：** `() => void`

```typescript
const { data } = useRequest(
  { url: '/api/users' },
  {
    onFinally: () => {
      console.log('请求完成')
      hideLoadingSpinner()
    },
  }
)
```

#### cancelOnUnmount

组件卸载时是否自动取消请求。

- **类型：** `boolean`
- **默认值：** `true`

```typescript
const { data } = useRequest(
  { url: '/api/users' },
  {
    cancelOnUnmount: false, // 组件卸载时不取消请求
  }
)
```

## 返回值

`useRequest` 返回一个包含请求状态和控制方法的对象。

**类型：** `UseRequestReturn<T>`

```typescript
interface UseRequestReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<HttpError | null>
  finished: Ref<boolean>
  execute: (config?: RequestConfig) => Promise<ResponseData<T>>
  refresh: () => Promise<ResponseData<T>>
  cancel: () => void
  reset: () => void
  canCancel: ComputedRef<boolean>
}
```

### 状态属性

#### data

响应数据。

- **类型：** `Ref<T | null>`
- **初始值：** `options.initialData ?? null`

```typescript
const { data } = useRequest<User[]>({ url: '/api/users' })

// 使用数据
watchEffect(() => {
  if (data.value) {
    console.log('用户数量:', data.value.length)
  }
})
```

#### loading

加载状态。

- **类型：** `Ref<boolean>`
- **初始值：** `false`

```typescript
const { loading } = useRequest({ url: '/api/users' })

// 在模板中使用
// <div v-if="loading">加载中...</div>
```

#### error

错误信息。

- **类型：** `Ref<HttpError | null>`
- **初始值：** `null`

```typescript
const { error } = useRequest({ url: '/api/users' })

// 检查错误类型
watchEffect(() => {
  if (error.value) {
    if (error.value.isNetworkError) {
      console.log('网络错误')
    } else if (error.value.response?.status === 404) {
      console.log('资源不存在')
    }
  }
})
```

#### finished

是否已完成（成功或失败）。

- **类型：** `Ref<boolean>`
- **初始值：** `false`

```typescript
const { finished } = useRequest({ url: '/api/users' })

// 请求完成后执行某些操作
watch(finished, isFinished => {
  if (isFinished) {
    console.log('请求已完成')
  }
})
```

### 控制方法

#### execute

执行请求，可以传入新的配置来覆盖原配置。

- **类型：** `(config?: RequestConfig) => Promise<ResponseData<T>>`

```typescript
const { execute } = useRequest({ url: '/api/users' }, { immediate: false })

// 执行请求
const response = await execute()

// 使用新配置执行请求
const response2 = await execute({
  params: { page: 2 },
})
```

#### refresh

刷新请求，使用原始配置重新执行。

- **类型：** `() => Promise<ResponseData<T>>`

```typescript
const { refresh } = useRequest({ url: '/api/users' })

// 刷新数据
async function handleRefresh() {
  try {
    await refresh()
    showNotification('数据已刷新')
  } catch (error) {
    showNotification('刷新失败')
  }
}
```

#### cancel

取消当前请求。

- **类型：** `() => void`

```typescript
const { cancel, canCancel } = useRequest({ url: '/api/users' })

// 取消请求
function handleCancel() {
  if (canCancel.value) {
    cancel()
  }
}
```

#### reset

重置所有状态到初始值。

- **类型：** `() => void`

```typescript
const { reset, data, loading, error } = useRequest({ url: '/api/users' })

// 重置状态
function handleReset() {
  reset()
  // 此时 data.value 为 initialData，loading.value 为 false，error.value 为 null
}
```

#### canCancel

是否可以取消当前请求。

- **类型：** `ComputedRef<boolean>`

```typescript
const { canCancel } = useRequest({ url: '/api/users' })

// 在模板中使用
// <button @click="cancel" :disabled="!canCancel">取消请求</button>
```

## 使用示例

### 基础用法

```vue
<script setup lang="ts">
import { useRequest } from '@ldesign/http/vue'

interface User {
  id: number
  name: string
  email: string
}

const { data, loading, error, refresh, cancel, canCancel } = useRequest<User[]>({
  url: '/api/users',
  method: 'GET',
})
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else-if="data">
      <h2>用户列表</h2>
      <ul>
        <li v-for="user in data" :key="user.id">{{ user.name }} - {{ user.email }}</li>
      </ul>
    </div>

    <button :disabled="loading" @click="refresh">刷新</button>
    <button :disabled="!canCancel" @click="cancel">取消</button>
  </div>
</template>
```

### 响应式配置

```vue
<script setup lang="ts">
import { useRequest } from '@ldesign/http/vue'
import { computed, ref } from 'vue'

const userId = ref(1)
const includeProfile = ref(false)

const { data, loading } = useRequest(
  computed(() => ({
    url: `/api/users/${userId.value}`,
    params: {
      include: includeProfile.value ? 'profile' : undefined,
    },
  }))
)

// 当 userId 或 includeProfile 变化时，会自动重新请求
</script>
```

### 手动控制

```vue
<script setup lang="ts">
import { useRequest } from '@ldesign/http/vue'
import { ref } from 'vue'

const searchTerm = ref('')

const { data, loading, execute } = useRequest(
  { url: '/api/search' },
  {
    immediate: false,
    transform: data => data.results,
  }
)

async function handleSearch() {
  if (searchTerm.value.trim()) {
    await execute({
      params: { q: searchTerm.value },
    })
  }
}
</script>
```

## 注意事项

1. **响应式配置**：当配置是响应式的时，配置变化会自动触发新请求
2. **取消机制**：组件卸载时会自动取消请求，避免内存泄漏
3. **错误处理**：建议同时使用 `onError` 回调和 `error` 状态进行错误处理
4. **数据转换**：`transform` 函数在每次请求成功后都会执行
5. **并发请求**：如果在前一个请求完成前发起新请求，前一个请求会被取消
