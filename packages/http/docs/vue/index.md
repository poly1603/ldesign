# Vue 集成

@ldesign/http 为 Vue 3 提供了完整的集成支持，包括插件和丰富的 Composition API。

## 特性

- 🎯 **简单易用** - 提供简化的 hooks 如 useGet、usePost
- 🔄 **响应式** - 自动管理加载、错误、数据状态
- 🎨 **灵活强大** - 支持复杂场景如资源管理、表单处理
- ⚡ **性能优化** - 内置缓存、去重、轮询等功能
- 🎯 **TypeScript** - 完整的类型支持

## 安装插件

在 Vue 应用中安装 HTTP 插件：

```typescript
// main.ts
import { createApp } from 'vue'
import { createHttpPlugin } from '@ldesign/http'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(createHttpPlugin({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  cache: { enabled: true },
  retry: { enabled: true }
}))

app.mount('#app')
```

## 使用方式

@ldesign/http 提供两种使用方式：

### 1. 独立模式（推荐）

不需要安装插件，直接使用：

```vue
<script setup>
import { useHttp } from '@ldesign/http/vue'

const http = useHttp({
  baseURL: 'https://api.example.com'
})

const { data, loading } = await http.get('/users')
</script>
```

### 2. 依赖注入模式

安装插件后，在组件中注入使用：

```vue
<script setup>
import { useInjectedHttp } from '@ldesign/http/vue'

const http = useInjectedHttp()
const { data, loading } = await http.get('/users')
</script>
```

## 简化的 Hooks

最简单直接的使用方式：

```vue
<script setup lang="ts">
import { useGet, usePost } from '@ldesign/http/vue'

interface User {
  id: number
  name: string
  email: string
}

// GET 请求
const { data: users, loading, error, refetch } = useGet<User[]>('/users')

// POST 请求
const { execute: createUser, loading: creating } = usePost<User>('/users')

async function handleCreate() {
  await createUser({
    name: 'John Doe',
    email: 'john@example.com'
  })
  // 创建成功后刷新列表
  await refetch()
}
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
    <button @click="handleCreate" :disabled="creating">
      创建用户
    </button>
  </div>
</template>
```

## 资源管理

完整的 CRUD 操作：

```vue
<script setup lang="ts">
import { useResource } from '@ldesign/http/vue'

const {
  items,     // 资源列表
  current,    // 当前资源
  loading,    // 加载状态
  list,     // 获取列表
  get,      // 获取单个
  create,    // 创建
  update,    // 更新
  remove     // 删除
} = useResource<User>('/users')

// 加载列表
await list()

// 获取单个用户
await get(1)

// 创建用户
await create({ name: 'John' })

// 更新用户
await update(1, { name: 'Jane' })

// 删除用户
await remove(1)
</script>
```

## 表单处理

简化表单提交和验证：

```vue
<script setup lang="ts">
import { useForm } from '@ldesign/http/vue'

const {
  data,           // 表单数据
  submitting,     // 提交状态
  errors,         // 验证错误
  submit,         // 提交表单
  validate,       // 验证表单
  setValidationRules // 设置规则
} = useForm<User>({
  initialData: { name: '', email: '' }
})

// 设置验证规则
setValidationRules({
  name: [{ required: true, message: '姓名不能为空' }],
  email: [{ required: true, message: '邮箱不能为空' }]
})

async function handleSubmit() {
  if (validate()) {
    await submit('/users')
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="data.name" />
    <span v-if="errors.name">{{ errors.name }}</span>

    <input v-model="data.email" />
    <span v-if="errors.email">{{ errors.email }}</span>

    <button :disabled="submitting">提交</button>
  </form>
</template>
```

## 高级功能

### 轮询

```vue
<script setup>
import { usePolling } from '@ldesign/http/vue'

// 每 3 秒轮询一次
const { data, start, stop, pause, resume } = usePolling('/status', {
  interval: 3000,
  immediate: true
})
</script>
```

### 乐观更新

```vue
<script setup>
import { useOptimisticUpdate } from '@ldesign/http/vue'

const { data, update } = useOptimisticUpdate('/users')

// 乐观更新（立即更新 UI）
await update(1, { name: 'Jane' })
</script>
```

### 网络状态

```vue
<script setup>
import { useNetworkStatus } from '@ldesign/http/vue'

const { isOnline, type, downlink } = useNetworkStatus()
</script>

<template>
  <div v-if="!isOnline">离线状态</div>
  <div>连接类型: {{ type }}</div>
</template>
```

## Hooks 列表

### 基础 Hooks

- `useHttp` - 独立 HTTP 客户端
- `useGet` - GET 请求
- `usePost` - POST 请求
- `usePut` - PUT 请求
- `useDelete` - DELETE 请求
- `usePatch` - PATCH 请求
- `useQuery` - 数据查询
- `useMutation` - 数据变更
- `useRequest` - 通用请求

### 高级 Hooks

- `useResource` - 资源管理（CRUD）
- `useForm` - 表单处理
- `useRequestQueue` - 请求队列
- `useOptimisticUpdate` - 乐观更新
- `usePolling` - 轮询
- `useNetworkStatus` - 网络状态
- `useDebouncedRequest` - 防抖请求
- `useThrottledRequest` - 节流请求

## 下一步

- [安装插件](/vue/plugin) - 详细的插件配置
- [useHttp](/vue/use-http) - 基础 HTTP 客户端
- [useResource](/vue/use-resource) - 资源管理
- [useForm](/vue/use-form) - 表单处理
