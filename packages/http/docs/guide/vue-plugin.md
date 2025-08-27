# Vue 插件集成

@ldesign/http 为 Vue 3 提供了深度集成支持，包括 Vue 插件、Composition API hooks 和响应式状态管理。

## 安装插件

### 基础安装

```typescript
import { createApp } from 'vue'
import { createHttpClient, HttpPlugin } from '@ldesign/http'
import App from './App.vue'

const app = createApp(App)

// 创建 HTTP 客户端
const httpClient = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000
})

// 安装插件
app.use(HttpPlugin, {
  client: httpClient
})

app.mount('#app')
```

### 高级配置

```typescript
app.use(HttpPlugin, {
  client: httpClient,
  // 全局配置选项
  globalProperties: {
    $http: true, // 是否注入 $http 到全局属性
    $loading: true // 是否注入 $loading 到全局属性
  },
  // 默认请求配置
  defaultConfig: {
    showLoading: true,
    showError: true,
    cache: true
  }
})
```

## Composition API

### useRequest Hook

`useRequest` 是最常用的 hook，提供了完整的请求状态管理：

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>
      <h2>用户列表</h2>
      <ul>
        <li v-for="user in data" :key="user.id">
          {{ user.name }}
        </li>
      </ul>
    </div>
    
    <button @click="refresh" :disabled="loading">
      刷新
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRequest } from '@ldesign/http'

interface User {
  id: number
  name: string
  email: string
}

const {
  data,
  loading,
  error,
  execute: refresh
} = useRequest<User[]>('/api/users', {
  immediate: true, // 立即执行
  cache: true, // 启用缓存
  retry: 3 // 重试次数
})
</script>
```

### useQuery Hook

`useQuery` 专门用于数据查询，提供了更多查询相关的功能：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useQuery } from '@ldesign/http'

const userId = ref(1)

const {
  data: user,
  loading,
  error,
  refetch
} = useQuery(
  // 查询键，当 userId 变化时会自动重新请求
  () => `/api/users/${userId.value}`,
  {
    enabled: computed(() => userId.value > 0), // 条件查询
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    cacheTime: 10 * 60 * 1000, // 缓存10分钟
    retry: 3,
    retryDelay: 1000
  }
)

// 切换用户
function switchUser(id: number) {
  userId.value = id
}
</script>
```

### useMutation Hook

`useMutation` 用于数据变更操作（POST、PUT、DELETE）：

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" placeholder="用户名" required />
    <input v-model="form.email" placeholder="邮箱" required />
    
    <button type="submit" :disabled="isLoading">
      {{ isLoading ? '创建中...' : '创建用户' }}
    </button>
    
    <div v-if="error" class="error">
      {{ error.message }}
    </div>
    
    <div v-if="isSuccess" class="success">
      用户创建成功！
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useMutation } from '@ldesign/http'

const form = reactive({
  name: '',
  email: ''
})

const {
  mutate: createUser,
  isLoading,
  isSuccess,
  error,
  reset
} = useMutation('/api/users', {
  method: 'POST',
  onSuccess: (data) => {
    console.log('用户创建成功:', data)
    // 重置表单
    form.name = ''
    form.email = ''
    // 可以触发其他操作，如刷新用户列表
  },
  onError: (error) => {
    console.error('创建失败:', error)
  }
})

function handleSubmit() {
  createUser(form)
}
</script>
```

### useHttp Hook

`useHttp` 提供了对 HTTP 客户端的直接访问：

```vue
<script setup lang="ts">
import { useHttp } from '@ldesign/http'

const http = useHttp()

// 直接使用 HTTP 客户端
async function fetchData() {
  try {
    const response = await http.get('/api/data')
    console.log(response.data)
  } catch (error) {
    console.error(error)
  }
}

// 使用拦截器
http.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getToken()}`
  return config
})
</script>
```

## 全局属性

安装插件后，可以在组件中使用全局属性：

```vue
<script>
export default {
  async mounted() {
    // 使用全局 $http
    const response = await this.$http.get('/api/users')
    console.log(response.data)
    
    // 使用全局 $loading
    this.$loading.show()
    setTimeout(() => {
      this.$loading.hide()
    }, 2000)
  }
}
</script>
```

## 响应式配置

### 动态基础URL

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHttp } from '@ldesign/http'

const environment = ref('development')
const http = useHttp()

// 根据环境动态切换基础URL
watch(environment, (env) => {
  const baseURLs = {
    development: 'https://dev-api.example.com',
    staging: 'https://staging-api.example.com',
    production: 'https://api.example.com'
  }
  
  http.defaults.baseURL = baseURLs[env]
})
</script>
```

### 响应式请求头

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHttp } from '@ldesign/http'

const token = ref('')
const http = useHttp()

// 监听 token 变化，自动更新请求头
watch(token, (newToken) => {
  if (newToken) {
    http.defaults.headers.Authorization = `Bearer ${newToken}`
  } else {
    delete http.defaults.headers.Authorization
  }
})
</script>
```

## 状态管理集成

### 与 Pinia 集成

```typescript
// stores/api.ts
import { defineStore } from 'pinia'
import { useHttp } from '@ldesign/http'

export const useApiStore = defineStore('api', () => {
  const http = useHttp()
  
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  async function fetchUsers() {
    loading.value = true
    error.value = null
    
    try {
      const response = await http.get('/api/users')
      users.value = response.data
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }
  
  async function createUser(userData) {
    const response = await http.post('/api/users', userData)
    users.value.push(response.data)
    return response.data
  }
  
  return {
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),
    fetchUsers,
    createUser
  }
})
```

### 与 Vuex 集成

```typescript
// store/modules/api.ts
import { useHttp } from '@ldesign/http'

const http = useHttp()

export default {
  namespaced: true,
  
  state: {
    users: [],
    loading: false,
    error: null
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_USERS(state, users) {
      state.users = users
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async fetchUsers({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await http.get('/api/users')
        commit('SET_USERS', response.data)
      } catch (error) {
        commit('SET_ERROR', error)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}
```

## 类型安全

### 定义 API 类型

```typescript
// types/api.ts
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

export interface CreateUserRequest {
  name: string
  email: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
```

### 类型化的 hooks

```vue
<script setup lang="ts">
import { useRequest, useMutation } from '@ldesign/http'
import type { User, CreateUserRequest, ApiResponse } from '@/types/api'

// 类型化的查询
const {
  data: users,
  loading,
  error
} = useRequest<ApiResponse<User[]>>('/api/users')

// 类型化的变更
const {
  mutate: createUser
} = useMutation<ApiResponse<User>, CreateUserRequest>('/api/users', {
  method: 'POST'
})

// TypeScript 会提供完整的类型检查和智能提示
function handleCreateUser() {
  createUser({
    name: 'John Doe',
    email: 'john@example.com'
    // TypeScript 会检查这里的类型
  })
}
</script>
```

## 最佳实践

### 1. 统一的 API 层

```typescript
// composables/useApi.ts
import { useHttp } from '@ldesign/http'
import type { User, CreateUserRequest } from '@/types/api'

export function useUserApi() {
  const http = useHttp()
  
  return {
    getUsers: () => http.get<User[]>('/api/users'),
    getUser: (id: number) => http.get<User>(`/api/users/${id}`),
    createUser: (data: CreateUserRequest) => http.post<User>('/api/users', data),
    updateUser: (id: number, data: Partial<User>) => 
      http.put<User>(`/api/users/${id}`, data),
    deleteUser: (id: number) => http.delete(`/api/users/${id}`)
  }
}
```

### 2. 错误边界组件

```vue
<!-- components/ErrorBoundary.vue -->
<template>
  <div v-if="error" class="error-boundary">
    <h3>出错了</h3>
    <p>{{ error.message }}</p>
    <button @click="retry">重试</button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
interface Props {
  error?: Error | null
  onRetry?: () => void
}

const props = defineProps<Props>()

function retry() {
  props.onRetry?.()
}
</script>
```

### 3. 加载状态组件

```vue
<!-- components/LoadingWrapper.vue -->
<template>
  <div class="loading-wrapper">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ loadingText }}</p>
    </div>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  loadingText?: string
}

withDefaults(defineProps<Props>(), {
  loadingText: '加载中...'
})
</script>
```

## 下一步

- [Vue Hooks](./vue-hooks) - 深入了解 Vue hooks
- [最佳实践](./best-practices) - 了解更多最佳实践
- [API 参考](../api/) - 查看完整的 API 文档
